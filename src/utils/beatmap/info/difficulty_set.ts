import { getActiveInfo } from '../../../data/active_info.ts'
import { bsmap } from '../../../deps.ts'

/** From the active Info.dat, try to get info about {@link difficultyName}.
 * Contains difficulty, difficulty rank, among other information.
 */
export function tryGetDifficultyInfo(difficultyName: bsmap.GenericFileName) {
    const info = getActiveInfo()

    if (info.difficultyBeatmaps[difficultyName]) {
        return {
            difficultyInfo: info.difficultyBeatmaps[difficultyName],
            info,
        }
    } else {
        throw new Error(`The difficulty ${difficultyName} does not exist in the Info.dat`)
    }
}
