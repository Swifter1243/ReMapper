import { bsmap } from '../../../deps.ts'
import {AbstractInfo} from "../../../internals/beatmap/info/abstract_info.ts";

/** From the active Info.dat, try to get info about {@link difficultyName}.
 * Contains difficulty, difficulty rank, among other information.
 */
export function tryGetDifficultyInfo(info: AbstractInfo, difficultyName: bsmap.GenericFileName) {
    if (info.difficultyBeatmaps[difficultyName]) {
        return {
            difficultyInfo: info.difficultyBeatmaps[difficultyName],
            info,
        }
    } else {
        throw new Error(`The difficulty ${difficultyName} does not exist in the Info.dat`)
    }
}
