import { iterateKeyframes } from '../../../animation/keyframe/iterate.ts'

import {RawKeyframesVec3} from "../../../../types/animation/keyframe/vec3.ts";

/** Convert a position in unity units to noodle/grid units.
 * This is also the conversion from V3 to V2.
 */
export function positionUnityToNoodle(position: RawKeyframesVec3) {
    iterateKeyframes(position, (x) => {
        x[0] /= 0.6
        x[1] /= 0.6
        x[2] /= 0.6
    })
    return position
}

/** Convert a position in noodle/grid units to unity units.
 * This is also the conversion from V2 to V3.
 */
export function positionNoodleToUnity(position: RawKeyframesVec3) {
    iterateKeyframes(position, (x) => {
        x[0] *= 0.6
        x[1] *= 0.6
        x[2] *= 0.6
    })
    return position
}
