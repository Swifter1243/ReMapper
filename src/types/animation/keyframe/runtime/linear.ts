import {
    RuntimeComplexKeyframesAbstract,
    RuntimePointDefinitionAbstract,
    RuntimeRawKeyframesAbstract,
} from './abstract.ts'
import { RuntimePropertiesLinear } from './properties.ts'

/** Keyframe or array of keyframes with 1 value. Allows point definitions.
 * `[[x, time]...]` or `[x]` or `string`.
 * Includes runtime properties.
 */
export type RuntimePointDefinitionLinear = RuntimePointDefinitionAbstract<
    [number],
    RuntimePropertiesLinear
>
/** Array of keyframes with 1 value. `[[x, time]...]`.
 * Includes runtime properties.
 */
export type RuntimeComplexKeyframesLinear = RuntimeComplexKeyframesAbstract<
    [number],
    RuntimePropertiesLinear
>
/** Single keyframe with 1 value. `[x, time]`
 * Includes runtime properties.
 */
export type RuntimeInnerKeyframeLinear = RuntimeComplexKeyframesLinear[0]
/** Keyframe or array of keyframes with 1 value.
 * `[[x,time]...]` or `[x]`.
 * Includes runtime properties.
 */
export type RuntimeRawKeyframesLinear = RuntimeRawKeyframesAbstract<
    [number],
    RuntimePropertiesLinear
>
