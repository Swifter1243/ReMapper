import {
    RuntimeComplexKeyframesAbstract,
    RuntimePointDefinitionAbstract,
    RuntimeRawKeyframesAbstract,
} from './abstract.ts'
import { Vec3 } from '../../../math/vector.ts'
import { RuntimePropertiesVec3 } from './properties.ts'

/** Keyframe or array of keyframes with 3 values. Allows point definitions.
 * `[[x,y,z,time]...]` or `[x,y,z]` or `string`.
 * Includes runtime properties.
 */
export type RuntimePointDefinitionVec3 = RuntimePointDefinitionAbstract<
    Vec3,
    RuntimePropertiesVec3
>
/** Array of keyframes with 3 values. `[[x,y,z,time]...]`.
 * Includes runtime properties.
 */
export type RuntimeComplexKeyframesVec3 = RuntimeComplexKeyframesAbstract<
    Vec3,
    RuntimePropertiesVec3
>
/** Single keyframe with 3 values. `[x,y,z,time]`
 * Includes runtime properties.
 */
export type RuntimeInnerKeyframeVec3 = RuntimeComplexKeyframesVec3[0]
/** Keyframe or array of keyframes with 3 values.
 * `[[x,y,z,time]...]` or `[x,y,z]`
 * Includes runtime properties.
 */
export type RuntimeRawKeyframesVec3 = RuntimeRawKeyframesAbstract<
    Vec3,
    RuntimePropertiesVec3
>
