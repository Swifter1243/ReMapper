import { Vec3 } from './vector.ts'

/** Information describing a 3D rectangle. */
export type Bounds = {
    /** Corner with the smallest coordinates in the rectangle. */
    lowBound: Vec3
    /** Corner with the highest coordinates in the rectangle. */
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
