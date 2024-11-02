import {
    RuntimeComplexPointsAbstract,
    RuntimeDifficultyPointsAbstract,
    RuntimeRawPointsAbstract,
} from './abstract.ts'
import { Vec3 } from '../../../math/vector.ts'
import { RuntimePropertiesVec3 } from './properties.ts'

/** Point or array of points with 3 values. Allows point definitions.
 * `[[x,y,z,time]...]` or `[x,y,z]` or `string`.
 * Includes runtime properties.
 */
export type RuntimeDifficultyPointsVec3 = RuntimeDifficultyPointsAbstract<
    Vec3,
    RuntimePropertiesVec3
>
/** Array of points with 3 values. `[[x,y,z,time]...]`.
 * Includes runtime properties.
 */
export type RuntimeComplexPointsVec3 = RuntimeComplexPointsAbstract<
    Vec3,
    RuntimePropertiesVec3
>
/** Single points with 3 values. `[x,y,z,time]`
 * Includes runtime properties.
 */
export type RuntimeInnerPointVec3 = RuntimeComplexPointsVec3[0]
/** Point or array of points with 3 values.
 * `[[x,y,z,time]...]` or `[x,y,z]`
 * Includes runtime properties.
 */
export type RuntimeRawPointsVec3 = RuntimeRawPointsAbstract<
    Vec3,
    RuntimePropertiesVec3
>
