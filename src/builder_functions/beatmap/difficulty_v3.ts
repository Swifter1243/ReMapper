import {asserts} from '../../deps.ts'
import {V3Difficulty} from '../../internals/beatmap/beatmap_v3.ts'

import {readDifficulty} from "./difficulty.ts";

/** Read a V3 beatmap. */
export async function readDifficultyV3(
    ...params: Parameters<typeof readDifficulty>
) {
    const diff = await readDifficulty(...params)

    asserts.assertInstanceOf(
        diff,
        V3Difficulty,
        `Not a v3 difficulty! ${diff.version}`,
    )

    return diff
}
