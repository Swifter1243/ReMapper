import {InnerPointAbstract} from "../abstract.ts";
import {TimeValue} from "../components.ts";
import {RuntimePointValues} from "./structure.ts";

/** Helper type for complex points. `[[...], [...], [...]]`.
 * Includes runtime properties.
 */
export type RuntimeComplexPointsAbstract<V extends unknown[]> = InnerPointAbstract<[
    ...RuntimePointValues<V>,
    TimeValue,
]>[]
/** Helper type for raw points. `[...] | [[...], [...], [...]]`.
 * Includes runtime properties.
 */
export type RuntimeRawPointsAbstract<V extends unknown[]> =
    | RuntimeComplexPointsAbstract<V>
    | RuntimePointValues<V>
/** Helper type for points arrays.
 * Includes runtime properties.
 */
export type RuntimeDifficultyPointsAbstract<V extends unknown[]> =
    | RuntimeRawPointsAbstract<V>
    | string