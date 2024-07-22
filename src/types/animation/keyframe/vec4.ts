import {
    ComplexKeyframesAbstract,
    PointDefinitionAbstract,
    RawKeyframesAbstract,
} from './abstract.ts'
import { Vec4 } from '../../math/vector.ts'

/** Keyframe or array of keyframes with 4 values. Allows point definitions.
 * `[[x,y,z,w,time]...]` or `[x,y,z,w]`
 */
export type PointDefinitionVec4 = PointDefinitionAbstract<Vec4>
/** Array of keyframes with 4 values. `[[x,y,z,w,time]...]` */
export type ComplexKeyframesVec4 = ComplexKeyframesAbstract<Vec4>
/** Single keyframe with 4 values. `[x,y,z,w,time]` */
export type InnerKeyframeVec4 = ComplexKeyframesVec4[0]
/** Keyframe or array of keyframes with 4 values.
 * `[[x,y,z,w,time]...]` or `[x,y,z,w]`
 */
export type RawKeyframesVec4 = RawKeyframesAbstract<Vec4>
