import { getActiveInfo } from '../../data/active_info.ts'
import { arrayRemove } from '../array/mutate.ts'
import { compress } from 'https://deno.land/x/zip@v1.2.5/compress.ts'
import { adbDeno, fs, path } from '../../deps.ts'
import { currentTransfer } from './transfer.ts'
import {copy} from "../object/copy.ts";
import {getActiveDifficulty} from "../../data/active_difficulty.ts";
import {getWorkingDirectory} from "../../data/working_directory.ts";
import {BUNDLE_VERSIONS, QUEST_WIP_PATH} from "../../data/constants/file.ts";
import {RMLog} from "../rm_log.ts";
import {parseFilePath} from "../file.ts";
import {DIFFICULTY_NAME, FILENAME} from "../../types/beatmap/file.ts";

/**
 * Create a temporary directory with all the relevant files for the beatmap.
 * Returns all the files that are in the directory.
 * @param excludeDiffs Difficulties to exclude.
 * @param includeBundles Whether to include vivify bundles in the beatmap collection.
 * @param awaitSave Whether to await the active difficulty's saving action.
 */
export async function collectBeatmapFiles(
    excludeDiffs: FILENAME<DIFFICULTY_NAME>[] = [],
    includeBundles = false,
    awaitSave = true,
) {
    const info = getActiveInfo()

    if (awaitSave) {
        const diff = getActiveDifficulty()
        await diff.savePromise
    }

    const makeTempDir = Deno.makeTempDir()

    const exportInfo = copy(info)
    const unsanitizedFiles: (string | undefined)[] = [
        exportInfo._songFilename,
        exportInfo._coverImageFilename,
        'cinema-video.object',
        'BPMInfo.dat',
    ]

    if (includeBundles) {
        unsanitizedFiles.push(...BUNDLE_VERSIONS.map((x) => `bundle${x}`))
    }

    for (let s = 0; s < exportInfo._difficultyBeatmapSets.length; s++) {
        const set = exportInfo._difficultyBeatmapSets[s]
        for (let m = 0; m < set._difficultyBeatmaps.length; m++) {
            const map = set._difficultyBeatmaps[m]
            let passed = true

            await Promise.all(excludeDiffs.map(async (d) => {
                if (
                    map._beatmapFilename ===
                        (await parseFilePath(d, '.dat')).name
                ) {
                    arrayRemove(set._difficultyBeatmaps, m)
                    m--
                    passed = false
                }
            }))

            if (passed) unsanitizedFiles.push(map._beatmapFilename)
        }

        if (set._difficultyBeatmaps.length === 0) {
            arrayRemove(exportInfo._difficultyBeatmapSets, s)
            s--
        }
    }

    const workingDir = getWorkingDirectory()
    const filesPromise: [string, Promise<boolean>][] = unsanitizedFiles
        .filter((v) => v) // check not undefined or null
        .map((v) => path.join(workingDir, v!)) // prepend workspace dir
        .map((v) => [v, fs.exists(v)]) // ensure file exists

    const files: string[] = (await Promise.all(filesPromise
        .map(async (v) => [v[0], await v[1]]))) // wait for boolean promises
        .filter((v) => v[1]) // filter by existing files
        .map((v) => v[0]) as string[] // export as string array

    const tempDir = await makeTempDir
    const tempInfo = tempDir + `\\Info.dat`
    await Deno.writeTextFile(tempInfo, JSON.stringify(exportInfo, null, 0))

    files.push(tempInfo) // add temp info

    return files
}

/**
 * Automatically zip the map, including only necessary files.
 * @param excludeDiffs Difficulties to exclude.
 * @param zipName Name of the zip (don't include ".zip"). Uses folder name if undefined.
 * @param includeBundles Whether to include vivify bundles in the zip.
 */
export async function exportZip(
    excludeDiffs: FILENAME<DIFFICULTY_NAME>[] = [],
    zipName?: string,
    includeBundles = false,
) {
    await currentTransfer

    const workingDir = getWorkingDirectory()
    zipName ??= `${path.parse(workingDir).name}`
    zipName = `${zipName}.zip`
    zipName = zipName.replaceAll(' ', '_')
    zipName = encodeURI(zipName)

    const files = (await collectBeatmapFiles(excludeDiffs, includeBundles))
        .map((v) => `"${v}"`) // surround with quotes for safety

    // Check file lock
    // this is broken?
    // if (files.some(async x => {
    //     try {
    //         console.log(x)
    //         await Deno.open(x, { read: true, write: false, create: false })
    //         return false
    //     }
    //     catch (err) {
    //         console.log(err)
    //         return err instanceof Deno.errors.PermissionDenied
    //     }
    // })) {
    //     RMError(`"${zipName}" could not be zipped. Some files are locked.`)
    //     return
    // }

    if (workingDir !== Deno.cwd()) {
        // Compress function doesn't seem to have an option for destination..
        // So this is my cringe workaround
        const tempZipName = 'TEMP_MAP_ZIP.zip'
        const destination = path.join(workingDir, tempZipName)
        await compress(files, tempZipName, { flags: [], overwrite: true })
        await fs.move(tempZipName, destination)
        await Deno.rename(destination, path.join(workingDir, zipName))
    } else {
        await compress(files, zipName, { flags: [], overwrite: true })
    }

    RMLog(`"${zipName}" has been zipped!`)
}

/**
 * Automatically upload the map files to quest, including only necessary files.
 *
 * They will be uploaded to the song WIP folder, {@link QUEST_WIP_PATH}
 * @param excludeDiffs Difficulties to exclude.
 * @param options Options to pass to ADB
 */
export async function exportToQuest(
    excludeDiffs: FILENAME<DIFFICULTY_NAME>[] = [],
    options?: adbDeno.InvokeADBOptions,
) {
    await currentTransfer

    const adbBinary = adbDeno.getADBBinary(adbDeno.defaultADBPath())
    const info = getActiveInfo()

    // Download ADB
    const adbPromise = fs.exists(adbBinary).then(async (exists) => {
        if (!exists) return

        console.log('ADB not found, downloading')
        await adbDeno.downloadADB(options?.downloadPath)
    })

    const files = await collectBeatmapFiles(excludeDiffs) // surround with quotes for safety
    const cwd = getWorkingDirectory()

    const questSongFolder = `${QUEST_WIP_PATH}/${info._songName}`

    await adbPromise
    await adbDeno.mkdir(questSongFolder)

    const tasks = files.map((v) => {
        const relativePath = path.relative(cwd, v)
        console.log(`Uploading ${relativePath} to quest`)
        adbDeno.uploadFile(
            `${questSongFolder}/${relativePath}`,
            v,
            options,
        )
    })

    await Promise.all(tasks)
    console.log('Uploaded all files to quest')
}
