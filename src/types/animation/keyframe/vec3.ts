import {
    ComplexKeyframesAbstract,
    PointDefinitionAbstract,
    RawKeyframesAbstract,
} from './abstract.ts'
import { Vec3 } from '../../math/vector.ts'

/** Keyframe or array of keyframes with 3 values. Allows point definitions.
 * `[[x,y,z,time]...]` or `[x,y,z]` or `string`.
 */
export type PointDefinitionVec3 = PointDefinitionAbstract<Vec3>
/** Array of keyframes with 3 values. `[[x,y,z,time]...]` */
export type ComplexKeyframesVec3 = ComplexKeyframesAbstract<Vec3>
/** Single keyframe with 3 values. `[x,y,z,time]` */
export type InnerKeyframeVec3 = ComplexKeyframesVec3[0]
/** Keyframe or array of keyframes with 3 values.
 * `[[x,y,z,time]...]` or `[x,y,z]`
 */
export type RawKeyframesVec3 = RawKeyframesAbstract<Vec3>
