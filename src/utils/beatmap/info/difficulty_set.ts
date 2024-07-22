import { getActiveInfo } from '../../../data/active_info.ts'
import {DIFFNAME} from "../../../types/beatmap/file.ts";
import {IInfoSetDifficulty} from "../../../types/beatmap/info.ts";

/** The infoset of a given difficulty name.
 * Contains difficulty, difficulty rank, among other information.
 */
export function getInfoDifficultySets(difficultyName: DIFFNAME) {
    const info = getActiveInfo()
    let diffSet: IInfoSetDifficulty | undefined

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
