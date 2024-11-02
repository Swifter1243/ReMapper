import {InnerPointAbstract} from "../abstract.ts";
import {TimeValue} from "../components.ts";
import {RuntimePointValues} from "./structure.ts";

/** Helper type for complex points. `[[...], [...], [...]]`.
 * Includes runtime properties.
 */
export type RuntimeComplexPointsAbstract<
    T extends number[],
    R extends string,
> = InnerPointAbstract<[
    ...RuntimePointValues<T, R>,
    TimeValue,
]>[]
/** Helper type for raw points. `[...] | [[...], [...], [...]]`.
 * Includes runtime properties.
 */
export type RuntimeRawPointsAbstract<
    T extends number[],
    R extends string,
> =
    | RuntimeComplexPointsAbstract<T, R>
    | RuntimePointValues<T, R>
/** Helper type for points arrays.
 * Includes runtime properties.
 */
export type RuntimeDifficultyPointsAbstract<
    T extends number[],
    R extends string,
> =
    | RuntimeRawPointsAbstract<T, R>
    | string