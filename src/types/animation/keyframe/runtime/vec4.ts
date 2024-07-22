import {
    RuntimeComplexKeyframesAbstract,
    RuntimePointDefinitionAbstract,
    RuntimeRawKeyframesAbstract,
} from './abstract.ts'
import { Vec4 } from '../../../math/vector.ts'
import { RuntimePropertiesVec4 } from './properties.ts'

/** Keyframe or array of keyframes with 4 values. Allows point definitions.
 * `[[x,y,z,w,time]...]` or `[x,y,z,w]`.
 * Includes runtime properties.
 */
export type RuntimePointDefinitionVec4 = RuntimePointDefinitionAbstract<
    Vec4,
    RuntimePropertiesVec4
>
/** Array of keyframes with 4 values. `[[x,y,z,w,time]...]`.
 * Includes runtime properties.
 */
export type RuntimeComplexKeyframesVec4 = RuntimeComplexKeyframesAbstract<
    Vec4,
    RuntimePropertiesVec4
>
/** Single keyframe with 4 values. `[x,y,z,w,time]`
 * Includes runtime properties.
 */
export type RuntimeInnerKeyframeVec4 = RuntimeComplexKeyframesVec4[0]
/** Keyframe or array of keyframes with 4 values.
 * `[[x,y,z,w,time]...]` or `[x,y,z,w]`.
 * Includes runtime properties.
 */
export type RuntimeRawKeyframesVec4 = RuntimeRawKeyframesAbstract<
    Vec4,
    RuntimePropertiesVec4
>
