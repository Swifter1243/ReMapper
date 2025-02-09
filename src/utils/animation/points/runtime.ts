import {DeepReadonly} from "../../../types/util/mutability.ts";
import {RuntimeDifficultyPointsBoundless} from "../../../types/animation/points/runtime/boundless.ts";

/** Determine if points are considered "runtime",
 * e.g. it contains properties such as "baseHeadLocalPosition" which are only evaluated at runtime. */
export function arePointsRuntime(
    points: DeepReadonly<RuntimeDifficultyPointsBoundless>,
) {
    if (typeof points === 'string') return false

    // ["runtime"]
    if (typeof points === 'object' && typeof points[0] === 'string') return true

    return points.some((inner) => {
        if (typeof inner === 'object') {
            // [["runtime", 0]]
            if (typeof inner[0] === 'string') return true

            // [[..., [...], t]
            return inner.some(e => typeof e === 'object')
        } else {
            return false
        }
    })
}
