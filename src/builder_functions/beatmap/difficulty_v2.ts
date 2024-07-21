import { asserts } from '../../deps.ts'
import {V2Difficulty} from '../../internals/beatmap/beatmap_v2.ts'
import {readDifficulty} from "./difficulty.ts";

/** Read a V2 beatmap. */
export async function readDifficultyV2(
    ...params: Parameters<typeof readDifficulty>
) {
    const diff = await readDifficulty(...params)

    asserts.assertInstanceOf(
        diff,
        V2Difficulty,
        `Not a v2 difficulty! ${diff.version}`,
    )

    return diff
}