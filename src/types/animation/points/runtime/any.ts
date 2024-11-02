import {
    RuntimeComplexPointsLinear,
    RuntimeInnerPointLinear,
    RuntimeDifficultyPointsLinear,
    RuntimeRawPointsLinear,
} from './linear.ts'
import {
    RuntimeComplexPointsVec3,
    RuntimeInnerPointVec3,
    RuntimeDifficultyPointsVec3,
    RuntimeRawPointsVec3,
} from './vec3.ts'
import {
    RuntimeComplexPointsVec4,
    RuntimeInnerPointVec4,
    RuntimeDifficultyPointsVec4,
    RuntimeRawPointsVec4,
} from './vec4.ts'

/** A single points from an array of points.
 * `[..., 0, 'easeInOutExpo']`
 * Includes runtime properties.
 */
export type RuntimeInnerPointAny =
    | RuntimeInnerPointLinear
    | RuntimeInnerPointVec3
    | RuntimeInnerPointVec4
/** Array of points which have any amount of values.
 * `[[..., 0, 'easeInOutExpo']]`.
 * Includes runtime properties.
 */
export type RuntimeComplexPointsAny =
    | RuntimeComplexPointsLinear
    | RuntimeComplexPointsVec3
    | RuntimeComplexPointsVec4
/** Point or array of points with any amount of values.
 * `[...] | [[..., 0, 'easeInOutExpo']]`
 * Includes runtime properties.
 */
export type RuntimeRawPointsAny =
    | RuntimeRawPointsLinear
    | RuntimeRawPointsVec3
    | RuntimeRawPointsVec4
/** Point or array of points with any amount of values. Allows point definitions.
 * `[...] | [[..., 0, 'easeInOutExpo']] | string`.
 * Includes runtime properties.
 */
export type RuntimeDifficultyPointsAny =
    | RuntimeDifficultyPointsLinear
    | RuntimeDifficultyPointsVec3
    | RuntimeDifficultyPointsVec4
