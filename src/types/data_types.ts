import { RawKeyframesVec3 } from '../mod.ts'

/** An array with 2 numbers. */
export type Vec2 = [x: number, y: number]

/** An array with 3 numbers. */
export type Vec3 = [x: number, y: number, z: number]

/** An array with 4 numbers. */
export type Vec4 = [x: number, y: number, z: number, w: number]

/** An array with [r,g,b] or [r,g,b,a]. */
export type ColorVec =
    | [number, number, number, number]
    | [number, number, number]

/** Types associated to each color format. */
export type ColorTypes = {
    'RGB': ColorVec
    'HSV': ColorVec
    'HEX': string
}

/** Color formats. */
export type ColorFormat = keyof ColorTypes

/** All supported color types. */
export type Color = ColorTypes[ColorFormat]

/** Describes a transformation. Full information of the transformation is required. */
export type FullTransform = {
    pos: Vec3
    rot: Vec3
    scale: Vec3
}

/** Describes a transformation.
 * Intended defaults:
 * ```
 * pos: [0,0,0],
 * rot: [0,0,0],
 * scale: [1,1,1]
 * ```
 */
export type Transform = Partial<FullTransform>

/** Describes a transformation, animated. Full information of the transformation is required. */
export type FullAnimatedTransform = {
    pos: RawKeyframesVec3
    rot: RawKeyframesVec3
    scale: RawKeyframesVec3
}

/** Describes a transformation, animated.
 * Intended defaults:
 * ```
 * pos: [0,0,0],
 * rot: [0,0,0],
 * scale: [1,1,1]
 * ```
 */
export type AnimatedTransform = Partial<FullAnimatedTransform>

/** Information describing a 3D rectangle. */
export type Bounds = {
    /** Corner with smallest coordinates in the rectangle. */
    lowBound: Vec3
    /** Corner with highest coordinates in the rectangle. */
    highBound: Vec3
    /** How a unit rectangle would be scaled to this rectangle.
     * Equivalent to `[width, height, depth]`
     */
    scale: Vec3
    /** The midpoint of the rectangle.
     * Equivalent to `(lowBound + highBound) / 2`
     */
    midPoint: Vec3
}

/** A keyframe of an object animation, used by functions like `bakeAnimation`. */
export interface TransformKeyframe {
    pos: Vec3
    rot: Vec3
    scale: Vec3
    readonly time: number
}
