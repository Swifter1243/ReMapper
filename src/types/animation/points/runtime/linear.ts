import {
    RuntimeComplexPointsAbstract,
    RuntimeDifficultyPointsAbstract,
    RuntimeRawPointsAbstract,
} from './abstract.ts'
import { RuntimePropertiesLinear } from './properties.ts'

/** Point or array of points with 1 value. Allows point definitions.
 * `[[x, time]...]` or `[x]` or `string`.
 * Includes runtime properties.
 */
export type RuntimeDifficultyPointsLinear = RuntimeDifficultyPointsAbstract<
    [number],
    RuntimePropertiesLinear
>
/** Array of points with 1 value. `[[x, time]...]`.
 * Includes runtime properties.
 */
export type RuntimeComplexPointsLinear = RuntimeComplexPointsAbstract<
    [number],
    RuntimePropertiesLinear
>
/** Single points with 1 value. `[x, time]`
 * Includes runtime properties.
 */
export type RuntimeInnerPointLinear = RuntimeComplexPointsLinear[0]
/** Point or array of points with 1 value.
 * `[[x,time]...]` or `[x]`.
 * Includes runtime properties.
 */
export type RuntimeRawPointsLinear = RuntimeRawPointsAbstract<
    [number],
    RuntimePropertiesLinear
>
