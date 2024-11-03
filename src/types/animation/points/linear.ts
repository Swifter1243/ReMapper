import {
    ComplexPointsAbstract,
    DifficultyPointsAbstract,
    RawPointsAbstract,
} from './abstract.ts'

/** Point or array of points with 1 value. Allows point definitions.
 * `[[x, time]...]` or `[x]` or `string`.
 */
export type DifficultyPointsLinear = DifficultyPointsAbstract<[number]>
/** Array of points with 1 value. `[[x, time]...]` */
export type ComplexPointsLinear = ComplexPointsAbstract<[number]>
/** Single points with 1 value. `[x, time]` */
export type InnerPointLinear = ComplexPointsLinear[0]
/** Point or array of points with 1 value.
 * `[[x,time]...]` or `[x]`
 */
export type RawPointsLinear = RawPointsAbstract<[number]>
