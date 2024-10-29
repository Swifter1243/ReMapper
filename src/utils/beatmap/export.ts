import { getActiveInfo } from '../../data/active_info.ts'
import { adbDeno, compress, fs, path } from '../../deps.ts'
import { copy } from '../object/copy.ts'
import { getWorkingDirectory } from '../../data/working_directory.ts'
import { QUEST_WIP_PATH } from '../../constants/file.ts'
import { RMError, RMLog } from '../rm_log.ts'
import { DIFFICULTY_NAME, FILENAME } from '../../types/beatmap/file.ts'
import { BundleInfo } from '../../types/bundle.ts'
import { bsmap } from '../../deps.ts'
import {forceFileNameExtension} from "../file.ts";

/**
 * Create a temporary directory with all the relevant files for the beatmap.
 * Returns all the files that are in the directory.
 * @param excludeDiffs Difficulties to exclude.
 * @param bundleInfo Include information about a bundle build in order to collect the corresponding bundles.
 */
export async function collectBeatmapFiles(
    excludeDiffs: FILENAME<DIFFICULTY_NAME>[] = [],
    bundleInfo?: BundleInfo,
) {
    const info = getActiveInfo()

    const makeTempDir = Deno.makeTempDir()

    const tempInfo = copy(info)
    const unsanitizedFiles: (string | undefined)[] = [
        tempInfo.audio.songFilename,
        tempInfo.coverImageFilename,
        'cinema-video.object',
    ]

    if (bundleInfo) {
        unsanitizedFiles.push(...bundleInfo.default.bundleFiles)
    }

    excludeDiffs.forEach((excludeDiff) => {
        const diffFileName = forceFileNameExtension(excludeDiff, '.dat') as bsmap.GenericFileName
        delete tempInfo.difficultyBeatmaps[diffFileName]
    })

    unsanitizedFiles.push(...Object.keys(tempInfo.difficultyBeatmaps))

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
    const tempInfoDir = tempDir + `\\Info.dat`
    await Deno.writeTextFile(tempInfoDir, JSON.stringify(tempInfo.toJSON()))

    files.push(tempInfoDir) // add temp info

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
    const workingDir = getWorkingDirectory()
    zipName ??= `${path.parse(workingDir).name}`
    zipName = `${zipName}.zip`
    zipName = zipName.replaceAll(' ', '_')
    zipName = encodeURI(zipName)

    if (bundleInfo && !bundleInfo.default.isCompressed) {
        RMError(
            'Warning: You are trying to distribute uncompressed bundles. It is recommended that you export these bundles as compressed if you plan to distribute them.',
        )
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

    const questSongFolder = `${QUEST_WIP_PATH}/${info.song.title}`

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
