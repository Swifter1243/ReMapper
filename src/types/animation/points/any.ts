import {
    ComplexPointsLinear,
    InnerPointLinear,
    DifficultyPointsLinear,
    RawPointLinear,
} from './linear.ts'
import {
    ComplexPointsVec3,
    InnerPointVec3,
    DifficultyPointsVec3,
    RawPointsVec3,
} from './vec3.ts'
import {
    ComplexPointsVec4,
    InnerPointVec4,
    DifficultyPointsVec4,
    RawPointsVec4,
} from './vec4.ts'

/** A single points from an array of points.
 * `[..., 0, 'easeInOutExpo']`
 */
export type InnerPointAny =
    | InnerPointLinear
    | InnerPointVec3
    | InnerPointVec4
/** Array of points which have any amount of values.
 * `[[..., 0, 'easeInOutExpo']]`
 */
export type ComplexPointsAny =
    | ComplexPointsLinear
    | ComplexPointsVec3
    | ComplexPointsVec4
/** Point or array of points with any amount of values.
 * `[...] | [[..., 0, 'easeInOutExpo']]`
 */
export type RawPointsAny =
    | RawPointLinear
    | RawPointsVec3
    | RawPointsVec4
/** Point or array of points with any amount of values. Allows point definitions.
 * `[...] | [[..., 0, 'easeInOutExpo']] | string`
 */
export type DifficultyPointsAny =
    | DifficultyPointsLinear
    | DifficultyPointsVec3
    | DifficultyPointsVec4
