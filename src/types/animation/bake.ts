import { Vec3 } from '../math/vector.ts'

/** A points of an object animation, used by functions like `bakeAnimation`. */
export interface TransformKeyframe {
    position: Vec3
    rotation: Vec3
    scale: Vec3
    readonly time: number
}
