import { AbstractDifficulty } from '../../internals/beatmap/abstract_beatmap.ts'
import { V3Difficulty } from '../../internals/beatmap/beatmap_v3.ts'
import { V2Difficulty } from '../../internals/beatmap/beatmap_v2.ts'
import { bsmap, semver } from '../../deps.ts'
import {parseFilePath} from "../../utils/file.ts";
import {tryGetDifficultyInfo} from "../../utils/beatmap/info/difficulty_set.ts";
import {DIFFICULTY_NAME} from "../../types/beatmap/file.ts";
import {ReMapperWorkspace} from "../../internals/rm_workspace.ts";

/** Asynchronous function to read a difficulty. Not concerned with version. */
export async function readDifficulty(workspace: ReMapperWorkspace, fileName: DIFFICULTY_NAME): Promise<AbstractDifficulty> {
    const parsedFileName = await parseFilePath(fileName, '.dat')
    const jsonPromise = Deno.readTextFile(parsedFileName.path)

    const difficultyInfo = tryGetDifficultyInfo(workspace.info, parsedFileName.name as bsmap.GenericFileName)
    const json = JSON.parse(await jsonPromise) as
        | bsmap.v2.IDifficulty
        | bsmap.v3.IDifficulty

    const v3 = Object.hasOwn(json, 'version') && semver.satisfies((json as bsmap.v3.IDifficulty)['version'], '>=3.0.0')

    let diff: AbstractDifficulty

    if (v3) {
        diff = new V3Difficulty(
            workspace,
            json as bsmap.v3.IDifficulty,
            difficultyInfo,
        )
    } else {
        diff = new V2Difficulty(
            workspace,
            json as bsmap.v2.IDifficulty,
            difficultyInfo,
        )
    }

    workspace.activeDifficulties.add(diff)

    return diff
}
