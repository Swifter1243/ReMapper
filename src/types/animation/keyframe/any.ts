import {
    ComplexKeyframesLinear,
    InnerKeyframeLinear,
    PointDefinitionLinear,
    RawKeyframesLinear,
} from './linear.ts'
import {
    ComplexKeyframesVec3,
    InnerKeyframeVec3,
    PointDefinitionVec3,
    RawKeyframesVec3,
} from './vec3.ts'
import {
    ComplexKeyframesVec4,
    InnerKeyframeVec4,
    PointDefinitionVec4,
    RawKeyframesVec4,
} from './vec4.ts'

/** A single keyframe from an array of keyframes.
 * `[..., 0, 'easeInOutExpo']`
 */
export type InnerKeyframeAny =
    | InnerKeyframeLinear
    | InnerKeyframeVec3
    | InnerKeyframeVec4
/** Array of keyframes which have any amount of values.
 * `[[..., 0, 'easeInOutExpo']]`
 */
export type ComplexKeyframesAny =
    | ComplexKeyframesLinear
    | ComplexKeyframesVec3
    | ComplexKeyframesVec4
/** Keyframe or array of keyframes with any amount of values.
 * `[...] | [[..., 0, 'easeInOutExpo']]`
 */
export type RawKeyframesAny =
    | RawKeyframesLinear
    | RawKeyframesVec3
    | RawKeyframesVec4
/** Keyframe or array of keyframes with any amount of values. Allows point definitions.
 * `[...] | [[..., 0, 'easeInOutExpo']] | string`
 */
export type PointDefinitionAny =
    | PointDefinitionLinear
    | PointDefinitionVec3
    | PointDefinitionVec4
