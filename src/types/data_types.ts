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
export type Transform = {
    pos?: Vec3
    rot?: Vec3
    scale?: Vec3
}
export type FullTransform = {
    pos: Vec3
    rot: Vec3
    scale: Vec3
}
export type Bounds = {
    lowBound: Vec3
    highBound: Vec3
    scale: Vec3
    midPoint: Vec3
}

export interface TransformKeyframe {
    pos: Vec3
    rot: Vec3
    scale: Vec3
    time: number
}