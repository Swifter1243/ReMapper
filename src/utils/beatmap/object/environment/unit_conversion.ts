import { iteratePoints } from '../../../animation/points/iterate.ts'

import {RawPointsVec3} from "../../../../types/animation/points/vec3.ts";

/** Convert a position in unity units to noodle/grid units.
 * This is also the conversion from V3 to V2.
 */
export function positionUnityToNoodle(position: RawPointsVec3) {
    iteratePoints(position, (x) => {
        x[0] /= 0.6
        x[1] /= 0.6
        x[2] /= 0.6
    })
    return position
}

/** Convert a position in noodle/grid units to unity units.
 * This is also the conversion from V2 to V3.
 */
export function positionNoodleToUnity(position: RawPointsVec3) {
    iteratePoints(position, (x) => {
        x[0] *= 0.6
        x[1] *= 0.6
        x[2] *= 0.6
    })
    return position
}
