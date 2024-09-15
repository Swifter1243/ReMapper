import { getActiveInfo } from '../../data/active_info.ts'
import { arrayRemove } from '../array/mutate.ts'
import { compress } from 'https://deno.land/x/zip@v1.2.5/compress.ts'
import { adbDeno, fs, path } from '../../deps.ts'
import { currentTransfer } from './transfer.ts'
import {copy} from "../object/copy.ts";
import {getActiveDifficulty} from "../../data/active_difficulty.ts";
import {getWorkingDirectory} from "../../data/working_directory.ts";
import {QUEST_WIP_PATH} from "../../constants/file.ts";
import {RMError, RMLog} from "../rm_log.ts";
import {parseFilePath} from "../file.ts";
import {DIFFICULTY_NAME, FILENAME} from "../../types/beatmap/file.ts";
import {BundleInfo} from "../../types/bundle.ts";

/**
 * Create a temporary directory with all the relevant files for the beatmap.
 * Returns all the files that are in the directory.
 * @param excludeDiffs Difficulties to exclude.
 * @param bundleInfo Include information about a bundle build in order to collect the corresponding bundles.
 * @param awaitSave Whether to await the active difficulty's saving action.
 */
export async function collectBeatmapFiles(
    excludeDiffs: FILENAME<DIFFICULTY_NAME>[] = [],
    bundleInfo?: BundleInfo,
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
    ]

    if (bundleInfo) {
        unsanitizedFiles.push(...bundleInfo.default.bundleFiles)
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
        .filter((v) => v !== undefined && v != null) // check not undefined or null
        .map((v) => path.isAbsolute(v) ? v : path.join(workingDir, v)) // prepend workspace dir
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
 * @param bundleInfo Include information about a bundle build in order to add the corresponding bundles to the zip. Only do this if you're distributing to friends, don't include these files in a BeatSaver upload.
 */
export async function exportZip(
    excludeDiffs: FILENAME<DIFFICULTY_NAME>[] = [],
    zipName?: string,
    bundleInfo?: BundleInfo,
) {
    await currentTransfer

    const workingDir = getWorkingDirectory()
    zipName ??= `${path.parse(workingDir).name}`
    zipName = `${zipName}.zip`
    zipName = zipName.replaceAll(' ', '_')
    zipName = encodeURI(zipName)

    if (bundleInfo && !bundleInfo.default.isCompressed) {
        RMError("Warning: You are trying to distribute uncompressed bundles. It is recommended that you export these bundles as compressed if you plan to distribute them.")
    }

    const files = (await collectBeatmapFiles(excludeDiffs, bundleInfo))
        .map((v) => `"${v}"`) // surround with quotes for safety

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
