import {
    ComplexPointsAbstract,
    DifficultyPointsAbstract,
    RawPointsAbstract,
} from './abstract.ts'

/** Point or array of points with any number of values. Allows point definitions.
 * `[[..., time]...]` or `[...]`
 */
export type DifficultyPointsBoundless = DifficultyPointsAbstract<number[]>
/** Array of points with any number of values. `[[... ,time]...]` */
export type ComplexPointsBoundless = ComplexPointsAbstract<number[]>
/** Single points with any number of values. `[..., time]` */
export type InnerPointBoundless = ComplexPointsBoundless[0]
/** Point or array of points with any number of values.
 * `[[..., time]...]` or `[...]`
 */
export type RawPointsBoundless = RawPointsAbstract<number[]>
