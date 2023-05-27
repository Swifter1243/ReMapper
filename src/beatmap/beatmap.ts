// deno-lint-ignore-file adjacent-overload-signatures
import { adbDeno, compress, fs, path } from '../deps.ts'

import { QUEST_WIP_PATH } from '../data/constants.ts'
import { info } from '../data/beatmap_handler.ts'

import { arrRemove } from '../utils/array_utils.ts'

import { parseFilePath, RMLog } from '../general.ts'

import { Environment } from './environment.ts'
import type { RMDifficulty } from './abstract_beatmap.ts'
import {DIFFPATH, DIFFS, FILENAME} from "../types/beatmap_types.ts";

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

    const exportInfo = structuredClone(info)
    const unsanitizedFiles: (string | undefined)[] = [
        exportInfo._songFilename,
        exportInfo._coverImageFilename,
        'cinema-video.json',
    ]

    for (let s = 0; s < exportInfo._difficultyBeatmapSets.length; s++) {
        const set = exportInfo._difficultyBeatmapSets[s]
        for (let m = 0; m < set._difficultyBeatmaps.length; m++) {
            const map = set._difficultyBeatmaps[m]
            let passed = true
            excludeDiffs.forEach(async (d) => {
                if (
                    map._beatmapFilename ===
                        (await parseFilePath(d, '.dat')).path
                ) {
                    arrRemove(set._difficultyBeatmaps, m)
                    m--
                    passed = false
                }
            })

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

    const files: string[] = filesPromise.filter(async (v) => await v[1]).map((
        v,
    ) => v[0])

    const tempDir = await Deno.makeTempDir()
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

/**
 * Transfer the visual aspect of maps to other difficulties.
 * @param diffs The difficulties being effected.
 * @param forDiff A function to run over each difficulty.
 * @param walls If true, walls with custom data will be overriden.
 * The activeDiff keyword will change to be each difficulty running during this function.
 * Be mindful that the external difficulties don't have an input/output structure,
 * so new pushed notes for example may not be cleared on the next run and would build up.
 */
export function transferVisuals(
    diffs: DIFFPATH[],
    forDiff?: (diff: RMDifficulty) => void,
    walls = true,
) {
    throw 'TODO: Implement'
    // const startActive = activeDiff;

    // diffs.forEach((x) => {
    //   const workingDiff = new RMDifficulty(
    //     parseFilePath(x, ".dat").path as DIFFPATH,
    //   );

    //   workingDiff.rawEnvironment = startActive.rawEnvironment;
    //   workingDiff.pointDefinitions = startActive.pointDefinitions;
    //   workingDiff.customEvents = startActive.customEvents;
    //   workingDiff.events = startActive.events;
    //   workingDiff.geoMaterials = startActive.geoMaterials;
    //   workingDiff.boostEvents = startActive.boostEvents;
    //   workingDiff.lightEventBoxes = startActive.lightEventBoxes;
    //   workingDiff.lightRotationBoxes = startActive.lightRotationBoxes;
    //   workingDiff.fakeNotes = startActive.fakeNotes;
    //   workingDiff.fakeBombs = startActive.fakeBombs;
    //   workingDiff.fakeWalls = startActive.fakeWalls;
    //   workingDiff.fakeChains = startActive.fakeChains;

    //   if (walls) {
    //     for (let y = 0; y < workingDiff.walls.length; y++) {
    //       const obstacle = workingDiff.walls[y];
    //       if (obstacle.isModded) {
    //         arrRemove(workingDiff.walls, y);
    //         y--;
    //       }
    //     }

    //     startActive.walls.forEach((y) => {
    //       if (y.isModded) workingDiff.walls.push(y);
    //     });
    //   }

    //   if (forDiff !== undefined) forDiff(workingDiff);
    //   workingDiff.save();
    // });

    // activeDiffSet(startActive);
}

/** Get the base "Environment" object. */
export const getBaseEnvironment = () =>
    new Environment('[0]Environment', 'EndsWith')

/**
 * Assign a track to the base "Environment" object.
 * @param track Track to assign the object to.
 */
export function baseEnvironmentTrack(track: string) {
    const env = getBaseEnvironment()
    env.track.value = track
    env.push()
}
