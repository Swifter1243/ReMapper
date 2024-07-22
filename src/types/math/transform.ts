import {Vec3} from './vector.ts'


import {RawKeyframesVec3} from "../animation/keyframe/vec3.ts";

/** Describes a transformation. Full information of the transformation is required. */
export type FullTransform = {
    position: Vec3
    rotation: Vec3
    scale: Vec3
}
/** Describes a transformation.
 * Intended defaults:
 * ```
 * position: [0,0,0],
 * rotation: [0,0,0],
 * scale: [1,1,1]
 * ```
 */
export type Transform = Partial<FullTransform>
/** Describes a transformation, animated. Full information of the transformation is required. */
export type FullAnimatedTransform = {
    position: RawKeyframesVec3
    rotation: RawKeyframesVec3
    scale: RawKeyframesVec3
}
/** Describes a transformation, animated.
 * Intended defaults:
 * ```
 * position: [0,0,0],
 * rotation: [0,0,0],
 * scale: [1,1,1]
 * ```
 */
export type AnimatedTransform = Partial<FullAnimatedTransform>

