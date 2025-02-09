import {
    ComplexPointsAbstract,
    DifficultyPointsAbstract,
    RawPointsAbstract,
} from './abstract.ts'
import { Vec4 } from '../../math/vector.ts'

/** Point or array of points with 4 values. Allows point definitions.
 * `[[x,y,z,w,time]...]` or `[x,y,z,w]`
 */
export type DifficultyPointsVec4 = DifficultyPointsAbstract<Vec4>
/** Array of points with 4 values. `[[x,y,z,w,time]...]` */
export type ComplexPointsVec4 = ComplexPointsAbstract<Vec4>
/** Single points with 4 values. `[x,y,z,w,time]` */
export type InnerPointVec4 = ComplexPointsVec4[0]
/** Point or array of points with 4 values.
 * `[[x,y,z,w,time]...]` or `[x,y,z,w]`
 */
export type RawPointsVec4 = RawPointsAbstract<Vec4>
