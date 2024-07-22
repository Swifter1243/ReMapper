import {
    RuntimeComplexKeyframesLinear,
    RuntimeInnerKeyframeLinear,
    RuntimePointDefinitionLinear,
    RuntimeRawKeyframesLinear,
} from './linear.ts'
import {
    RuntimeComplexKeyframesVec3,
    RuntimeInnerKeyframeVec3,
    RuntimePointDefinitionVec3,
    RuntimeRawKeyframesVec3,
} from './vec3.ts'
import {
    RuntimeComplexKeyframesVec4,
    RuntimeInnerKeyframeVec4,
    RuntimePointDefinitionVec4,
    RuntimeRawKeyframesVec4,
} from './vec4.ts'

/** A single keyframe from an array of keyframes.
 * `[..., 0, 'easeInOutExpo']`
 * Includes runtime properties.
 */
export type RuntimeInnerKeyframeAny =
    | RuntimeInnerKeyframeLinear
    | RuntimeInnerKeyframeVec3
    | RuntimeInnerKeyframeVec4
/** Array of keyframes which have any amount of values.
 * `[[..., 0, 'easeInOutExpo']]`.
 * Includes runtime properties.
 */
export type RuntimeComplexKeyframesAny =
    | RuntimeComplexKeyframesLinear
    | RuntimeComplexKeyframesVec3
    | RuntimeComplexKeyframesVec4
/** Keyframe or array of keyframes with any amount of values.
 * `[...] | [[..., 0, 'easeInOutExpo']]`
 * Includes runtime properties.
 */
export type RuntimeRawKeyframesAny =
    | RuntimeRawKeyframesLinear
    | RuntimeRawKeyframesVec3
    | RuntimeRawKeyframesVec4
/** Keyframe or array of keyframes with any amount of values. Allows point definitions.
 * `[...] | [[..., 0, 'easeInOutExpo']] | string`.
 * Includes runtime properties.
 */
export type RuntimePointDefinitionAny =
    | RuntimePointDefinitionLinear
    | RuntimePointDefinitionVec3
    | RuntimePointDefinitionVec4
