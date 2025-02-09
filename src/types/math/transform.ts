import {Vec3} from './vector.ts'


import {RawPointsVec3} from "../animation/points/vec3.ts";

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
    position: RawPointsVec3
    rotation: RawPointsVec3
    scale: RawPointsVec3
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

