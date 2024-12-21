import { RuntimeComplexPointsAbstract, RuntimeDifficultyPointsAbstract, RuntimeRawPointsAbstract } from './abstract.ts'
import { Vec3 } from '../../../math/vector.ts'
import {RuntimePropertiesVec2, RuntimePropertiesVec3} from './properties.ts'
import { LinearRuntimeValues } from './linear.ts'

export type Vec3RuntimeValues =
    | Vec3
    | [RuntimePropertiesVec3]
    | [...LinearRuntimeValues, ...LinearRuntimeValues, ...LinearRuntimeValues]
    | [...LinearRuntimeValues, RuntimePropertiesVec2]
    | [RuntimePropertiesVec2, ...LinearRuntimeValues]

/** Point or array of points with 3 values. Allows point definitions.
 * `[[x,y,z,time]...]` or `[x,y,z]` or `string`.
 * Includes runtime properties.
 */
export type RuntimeDifficultyPointsVec3 = RuntimeDifficultyPointsAbstract<Vec3RuntimeValues>
/** Array of points with 3 values. `[[x,y,z,time]...]`.
 * Includes runtime properties.
 */
export type RuntimeComplexPointsVec3 = RuntimeComplexPointsAbstract<Vec3RuntimeValues>
/** Single points with 3 values. `[x,y,z,time]`
 * Includes runtime properties.
 */
export type RuntimeInnerPointVec3 = RuntimeComplexPointsVec3[0]
/** Point or array of points with 3 values.
 * `[[x,y,z,time]...]` or `[x,y,z]`
 * Includes runtime properties.
 */
export type RuntimeRawPointsVec3 = RuntimeRawPointsAbstract<Vec3RuntimeValues>
