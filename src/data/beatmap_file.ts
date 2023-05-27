import {bsmap, semver} from "../deps.ts"

import {DIFFNAME, DIFFPATH} from "../types/beatmap_types.ts";

import {parseFilePath} from "../general.ts";
import {AbstractDifficulty} from "../beatmap/abstract_beatmap.ts";
import {V3Difficulty} from "../beatmap/beatmap_v3.ts";
import {V2Difficulty} from "../beatmap/beatmap_v2.ts";
import {readInfoDat} from "./info_file.ts";

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
}

export async function readV2Difficulty(...params: Parameters<typeof readDifficulty>) {
    const diff = await readDifficulty(...params)

    if (diff! instanceof V2Difficulty) throw `Not a v2 difficulty! ${diff.version}`
    
    return diff
}
export async function readV3Difficulty(...params: Parameters<typeof readDifficulty>) {
    const diff = await readDifficulty(...params)

    if (diff! instanceof V3Difficulty) throw `Not a v3 difficulty! ${diff.version}`
    
    return diff
}