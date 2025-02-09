import {
    ComplexPointsAbstract,
    DifficultyPointsAbstract,
    RawPointsAbstract,
} from './abstract.ts'
import { Vec3 } from '../../math/vector.ts'

/** Point or array of points with 3 values. Allows point definitions.
 * `[[x,y,z,time]...]` or `[x,y,z]` or `string`.
 */
export type DifficultyPointsVec3 = DifficultyPointsAbstract<Vec3>
/** Array of points with 3 values. `[[x,y,z,time]...]` */
export type ComplexPointsVec3 = ComplexPointsAbstract<Vec3>
/** Single points with 3 values. `[x,y,z,time]` */
export type InnerPointVec3 = ComplexPointsVec3[0]
/** Point or array of points with 3 values.
 * `[[x,y,z,time]...]` or `[x,y,z]`
 */
export type RawPointsVec3 = RawPointsAbstract<Vec3>
