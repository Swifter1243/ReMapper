import {
    RuntimeComplexKeyframesAny,
    RuntimePointDefinitionAny,
    RuntimeRawKeyframesAny,
} from './any.ts'
import {
    RuntimeComplexKeyframesAbstract,
    RuntimePointDefinitionAbstract,
    RuntimeRawKeyframesAbstract,
} from './abstract.ts'
import { RuntimeProperties } from './properties.ts'

/** Keyframe or array of keyframes with any number of values. Allows point definitions.
 * `[[..., time]...]` or `[...]`.
 * Includes runtime properties.
 */
export type RuntimePointDefinitionBoundless =
    | RuntimePointDefinitionAny
    | RuntimePointDefinitionAbstract<number[], RuntimeProperties>
/** Array of keyframes with any number of values. `[[... ,time]...]`.
 * Includes runtime properties.
 */
export type RuntimeComplexKeyframesBoundless =
    | RuntimeComplexKeyframesAny
    | RuntimeComplexKeyframesAbstract<number[], RuntimeProperties>
/** Single keyframe with any number of values. `[..., time]`
 * Includes runtime properties.
 */
export type RuntimeInnerKeyframeBoundless = RuntimeComplexKeyframesBoundless[0]
/** Keyframe or array of keyframes with any number of values.
 * `[[..., time]...]` or `[...]`.
 * Includes runtime properties.
 */
export type RuntimeRawKeyframesBoundless =
    | RuntimeRawKeyframesAny
    | RuntimeRawKeyframesAbstract<number[], RuntimeProperties>
