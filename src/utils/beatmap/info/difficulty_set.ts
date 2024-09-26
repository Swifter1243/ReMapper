import { getActiveInfo } from '../../../data/active_info.ts'
import { bsmap } from '../../../deps.ts'
import {DIFFICULTY_FILENAME} from "../../../types/beatmap/file.ts";

/** The info set of a given difficulty name.
 * Contains difficulty, difficulty rank, among other information.
 */
export function getInfoDifficultySets(difficultyName: DIFFICULTY_FILENAME) {
    const info = getActiveInfo()
    let diffSet: bsmap.v2.IInfoSetDifficulty | undefined

    const diffSetMap = info._difficultyBeatmapSets.find((e) => {
        diffSet = e._difficultyBeatmaps.find((s) => s._beatmapFilename === difficultyName)

        return diffSet
    })

    if (!diffSetMap || !diffSet) {
        throw `The difficulty ${difficultyName} does not exist in your Info.dat`
    }

    return {
        diffSetMap,
        diffSet,
        info,
    }
}
