import { adbDeno, compress, fs, path } from '../deps.ts'

import { QUEST_WIP_PATH } from '../data/constants.ts'
import { getActiveDiff, info } from '../data/beatmap_handler.ts'

import { arrRemove } from '../utils/array_utils.ts'

import { parseFilePath, RMLog } from '../general.ts'

import type { RMDifficulty } from './abstract_beatmap.ts'
import { DIFFPATH, DIFFS, FILENAME } from '../types/beatmap_types.ts'
import { copy } from '../utils/general.ts'
import { environment } from './environment.ts'
import { Environment } from '../internals/environment.ts'
import { isEmptyObject, readDifficulty, setActiveDiff } from '../mod.ts'

/**
 * Converts an array of Json objects to a class counterpart.
 * Used internally in Difficulty to import Json.
 * @param array Array to convert.
 * @param target Class to convert to. Must have "import" function.
 * @param callback Optional function to run on each converted class.
 */
export function arrJsonToClass<T>(
    array: T[],
    target: { new (): T },
    callback?: (obj: T) => void,
) {
    if (array === undefined) return
    for (let i = 0; i < array.length; i++) {
        // deno-lint-ignore no-explicit-any
        array[i] = (new target() as any).import(array[i])
        if (callback) callback(array[i])
    }
}

/**
 * Create a temporary directory with all of the relevant files for the beatmap.
 * Returns all of the files that are in the directory.
 * @param excludeDiffs Difficulties to exclude.
 */
export async function collectBeatmapFiles(
    excludeDiffs: FILENAME<DIFFS>[] = [],
) {
    if (!info) throw new Error('The Info object has not been loaded.')

    const makeTempDir = Deno.makeTempDir()

    const exportInfo = copy(info)
    const unsanitizedFiles: (string | undefined)[] = [
        exportInfo._songFilename,
        exportInfo._coverImageFilename,
        'cinema-video.json',
        'BPMInfo.dat',
    ]

    for (let s = 0; s < exportInfo._difficultyBeatmapSets.length; s++) {
        const set = exportInfo._difficultyBeatmapSets[s]
        for (let m = 0; m < set._difficultyBeatmaps.length; m++) {
            const map = set._difficultyBeatmaps[m]
            let passed = true

            await Promise.all(excludeDiffs.map(async (d) => {
                if (
                    map._beatmapFilename ===
                        (await parseFilePath(d, '.dat')).path
                ) {
                    arrRemove(set._difficultyBeatmaps, m)
                    m--
                    passed = false
                }
            }))

            if (passed) unsanitizedFiles.push(map._beatmapFilename)
        }

        if (set._difficultyBeatmaps.length === 0) {
            arrRemove(exportInfo._difficultyBeatmapSets, s)
            s--
        }
    }

    const workingDir = Deno.cwd()
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
 */
export async function exportZip(
    excludeDiffs: FILENAME<DIFFS>[] = [],
    zipName?: string,
) {
    await currentTransfer

    const workingDir = Deno.cwd()
    zipName ??= `${path.parse(workingDir).name}`
    zipName = `${zipName}.zip`
    zipName = zipName.replaceAll(' ', '_')

    const files = (await collectBeatmapFiles(excludeDiffs))
        .map((v) => `"${v}"`) // surround with quotes for safety

    compress(files, zipName, { flags: [], overwrite: true }).then(() => {
        RMLog(`${zipName} has been zipped!`)
    })
}

/**
 * Automatically upload the map files to quest, including only necessary files.
 *
 * They will be uploaded to the song WIP folder, {@link QUEST_WIP_PATH}
 * @param excludeDiffs Difficulties to exclude.
 * @param options Options to pass to ADB
 */
export async function exportToQuest(
    excludeDiffs: FILENAME<DIFFS>[] = [],
    options?: adbDeno.InvokeADBOptions,
) {
    const adbBinary = adbDeno.getADBBinary(adbDeno.defaultADBPath())

    // Download ADB
    const adbPromise = fs.exists(adbBinary).then(async (exists) => {
        if (!exists) return

        console.log('ADB not found, downloading')
        await adbDeno.downloadADB(options?.downloadPath)
    })

    const files = await collectBeatmapFiles(excludeDiffs) // surround with quotes for safety
    const cwd = Deno.cwd()

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

let currentTransfer: Promise<void>

/**
 * Transfer the visual aspect of maps to other difficulties.
 * @param diffs The difficulties being effected.
 * @param forDiff A function to run over each difficulty.
 * @param walls If true, walls with custom data will be overriden.
 * The activeDiff keyword will change to be each difficulty running during this function.
 * Be mindful that the external difficulties don't have an input/output structure,
 * so new pushed notes for example may not be cleared on the next run and would build up.
 */
export async function transferVisuals(
    diffs: DIFFPATH[] | DIFFPATH,
    forDiff?: (diff: RMDifficulty) => void,
    walls = true,
    arcs = true,
    colorSchemes = true,
) {
    await currentTransfer

    async function thisFunction() {
        const currentDiff = getActiveDiff()

        async function process(x: DIFFPATH) {
            const workingDiff = await readDifficulty(
                (await parseFilePath(x, '.dat')).path as DIFFPATH,
            )

            workingDiff.notes = workingDiff.notes
                .filter((x) => !(x.fake ?? false))
                .concat(currentDiff.notes.filter((x) => (x.fake ?? false)))

            workingDiff.bombs = workingDiff.bombs
                .filter((x) => !(x.fake ?? false))
                .concat(currentDiff.bombs.filter((x) => (x.fake ?? false)))

            workingDiff.chains = workingDiff.chains
                .filter((x) => !(x.fake ?? false))
                .concat(currentDiff.chains.filter((x) => (x.fake ?? false)))

            if (arcs) workingDiff.arcs = currentDiff.arcs

            // TODO: V3 lighting, note colors, fog

            workingDiff.lightEvents = currentDiff.lightEvents
            workingDiff.laserSpeedEvents = currentDiff.laserSpeedEvents
            workingDiff.ringZoomEvents = currentDiff.ringZoomEvents
            workingDiff.ringSpinEvents = currentDiff.ringSpinEvents
            workingDiff.rotationEvents = currentDiff.rotationEvents
            workingDiff.boostEvents = currentDiff.boostEvents
            workingDiff.baseBasicEvents = currentDiff.baseBasicEvents

            workingDiff.animateComponents = currentDiff.animateComponents
            workingDiff.animateTracks = currentDiff.animateTracks
            workingDiff.assignPathAnimations = currentDiff.assignPathAnimations
            workingDiff.assignPlayerTracks = currentDiff.assignPlayerTracks
            workingDiff.assignTrackParents = currentDiff.assignTrackParents

            workingDiff.pointDefinitions = currentDiff.pointDefinitions
            workingDiff.environment = currentDiff.environment
            workingDiff.geometry = currentDiff.geometry
            workingDiff.geometryMaterials = currentDiff.geometryMaterials

            if (colorSchemes) {
                workingDiff.info._customData ??= {}
                workingDiff.info._customData._colorLeft = currentDiff.info
                    ._customData?._colorLeft
                workingDiff.info._customData._colorRight = currentDiff.info
                    ._customData?._colorRight
                workingDiff.info._customData._envColorLeft = currentDiff.info
                    ._customData?._envColorLeft
                workingDiff.info._customData._envColorRight = currentDiff.info
                    ._customData?._envColorRight
                workingDiff.info._customData._envColorLeftBoost = currentDiff
                    .info
                    ._customData?._envColorLeftBoost
                workingDiff.info._customData._envColorRightBoost = currentDiff
                    .info
                    ._customData?._envColorRightBoost
                workingDiff.info._customData._envColorWhite = currentDiff.info
                    ._customData?._envColorWhite
                workingDiff.info._customData._envColorWhiteBoost = currentDiff
                    .info
                    ._customData?._envColorWhiteBoost
                workingDiff.info._customData._obstacleColor = currentDiff.info
                    ._customData?._obstacleColor
                if (isEmptyObject(workingDiff.info._customData)) {
                    delete workingDiff.info._customData
                }
            }

            if (walls) {
                workingDiff.walls = workingDiff.walls
                    .filter((x) => !x.isGameplayModded)
                    .concat(
                        currentDiff.walls.filter((x) => x.isGameplayModded),
                    )
            }

            if (forDiff !== undefined) forDiff(workingDiff)
            workingDiff.save()
        }

        const promises: Promise<void>[] = []

        const diffsArr = typeof diffs === 'object' ? diffs : [diffs]
        diffsArr.forEach((x) => {
            promises.push(process(x))
        })

        await Promise.all(promises)

        setActiveDiff(currentDiff)
    }

    currentTransfer = thisFunction()
    await currentTransfer
}

/** Get the base "Environment" object. */
export function getBaseEnvironment(callback: (env: Environment) => void) {
    const search = getActiveDiff().environment.filter((x) =>
        x.id === '[0]Environment' && x.lookupMethod === 'EndsWith'
    )

    if (search.length > 0) {
        callback(search[0])
    } else {
        const env = environment('[0]Environment', 'EndsWith')
        env.push(false)
        callback(env)
    }
}

/**
 * Assign a track to the base "Environment" object.
 * @param track Track to assign the object to.
 */
export function setBaseEnvironmentTrack(track: string) {
    getBaseEnvironment((env) => {
        env.track.value = track
    })
}
