import {
    RuntimeComplexPointsAbstract,
    RuntimeDifficultyPointsAbstract,
    RuntimeRawPointsAbstract,
} from './abstract.ts'
import { Vec4 } from '../../../math/vector.ts'
import {RuntimePropertiesVec3, RuntimePropertiesVec4} from './properties.ts'

type Vec4RuntimeValues = Vec4 | [RuntimePropertiesVec4] | [RuntimePropertiesVec3, number]

/** Point or array of points with 4 values. Allows point definitions.
 * `[[x,y,z,w,time]...]` or `[x,y,z,w]`.
 * Includes runtime properties.
 */
export type RuntimeDifficultyPointsVec4 = RuntimeDifficultyPointsAbstract<Vec4RuntimeValues>
/** Array of points with 4 values. `[[x,y,z,w,time]...]`.
 * Includes runtime properties.
 */
export type RuntimeComplexPointsVec4 = RuntimeComplexPointsAbstract<Vec4RuntimeValues>
/** Single points with 4 values. `[x,y,z,w,time]`
 * Includes runtime properties.
 */
export type RuntimeInnerPointVec4 = RuntimeComplexPointsVec4[0]
/** Point or array of points with 4 values.
 * `[[x,y,z,w,time]...]` or `[x,y,z,w]`.
 * Includes runtime properties.
 */
export type RuntimeRawPointsVec4 = RuntimeRawPointsAbstract<Vec4RuntimeValues>