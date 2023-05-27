import { bsmap, path, semver } from '../deps.ts'
import { DIFFNAME, DIFFPATH } from './types.ts'

import { parseFilePath } from '../general.ts'

import type { AbstractDifficulty } from '../beatmap/abstract_beatmap.ts'
import type { V3Difficulty } from "../beatmap/beatmap_v3.ts";
import type { V2Difficulty } from "../beatmap/beatmap_v2.ts";

export let info: bsmap.IInfo
export let infoPath: string
export let activeDiff: AbstractDifficulty
export const settings = {
    forceJumpsForNoodle: true,
    decimals: 7 as number | undefined,
}

/**
 * Set the difficulty that objects are being created for.
 * @param diff The difficulty to set to.
 */
export function activeDiffSet(diff: AbstractDifficulty) {
    activeDiff = diff
}

/** Get the active difficulty, ensuring that it is indeed active. */
export function activeDiffGet() {
    if (activeDiff) return activeDiff

    throw new Error('There is currently no loaded difficulty.')
}

export async function saveInfoDat() {
    await Deno.writeTextFile(infoPath, JSON.stringify(info))
}

export async function readInfoDat(
    parsedOutput: Awaited<ReturnType<typeof parseFilePath>>,
    relativeMapFile: string,
) {
    infoPath = path.join(parsedOutput.dir ?? Deno.cwd(), 'Info.dat')
    const json = await Deno.readTextFile(
        infoPath,
    )

    info = JSON.parse(json)

    let diffSet: bsmap.IInfoSetDifficulty | undefined

    const diffSetMap = info._difficultyBeatmapSets.find((e) => {
        diffSet = e._difficultyBeatmaps.find((s) =>
            s._beatmapFilename === relativeMapFile
        )

        return diffSet
    })

    if (!diffSetMap || !diffSet) {
        throw `The difficulty ${parsedOutput.name} does not exist in your Info.dat`
    }

    return {
        diffSetMap,
        diffSet,
        info,
    }
}

export async function readDifficulty(
    input: DIFFPATH,
    output?: DIFFPATH,
    process: boolean = true,
): Promise<AbstractDifficulty> {
    const parsedInput = parseFilePath(input, '.dat')
    const parsedOutput = parseFilePath(output ?? input, '.dat')

    await Promise.all([parsedInput, parsedOutput])

    const mapFile = (await parsedOutput).path as DIFFPATH
    const relativeMapFile = (await parsedOutput).name as DIFFNAME

    // If the path contains a separator of any kind, use it instead of the default "Info.dat"
    const infoPromise = readInfoDat(await parsedOutput, relativeMapFile)

    const jsonPromise = Deno.readTextFile((await parsedInput).path)

    const infoData = await infoPromise
    const json = JSON.parse(await jsonPromise) as
        | bsmap.v2.IDifficulty
        | bsmap.v3.IDifficulty

    const v3 = Object.hasOwn(json, 'version') &&
        semver.satisfies((json as any)['version'], '>=3.0.0')
    if (v3) {
        // TODO: Uncomment, breaks benchmark
        return new V3Difficulty(
            infoData.diffSet,
            infoData.diffSetMap,
            mapFile,
            relativeMapFile,
            json as bsmap.v3.IDifficulty,
        )
    }

    return new V2Difficulty(
        infoData.diffSet,
        infoData.diffSetMap,
        mapFile,
        relativeMapFile,
        json as bsmap.v2.IDifficulty,
    )
    return undefined!
}
