import {
    RuntimeComplexPointsAny,
    RuntimeDifficultyPointsAny,
    RuntimeRawPointsAny,
} from './any.ts'
import {
    RuntimeComplexPointsAbstract,
    RuntimeDifficultyPointsAbstract,
    RuntimeRawPointsAbstract,
} from './abstract.ts'
import { RuntimeProperties } from './properties.ts'

/** Point or array of points with any number of values. Allows point definitions.
 * `[[..., time]...]` or `[...]`.
 * Includes runtime properties.
 */
export type RuntimeDifficultyPointsBoundless =
    | RuntimeDifficultyPointsAny
    | RuntimeDifficultyPointsAbstract<number[], RuntimeProperties>
/** Array of points with any number of values. `[[... ,time]...]`.
 * Includes runtime properties.
 */
export type RuntimeComplexPointsBoundless =
    | RuntimeComplexPointsAny
    | RuntimeComplexPointsAbstract<number[], RuntimeProperties>
/** Single points with any number of values. `[..., time]`
 * Includes runtime properties.
 */
export type RuntimeInnerPointBoundless = RuntimeComplexPointsBoundless[0]
/** Point or array of points with any number of values.
 * `[[..., time]...]` or `[...]`.
 * Includes runtime properties.
 */
export type RuntimeRawPointsBoundless =
    | RuntimeRawPointsAny
    | RuntimeRawPointsAbstract<number[], RuntimeProperties>
