import {InnerKeyframeAbstract} from "../abstract.ts";
import {TimeValue} from "../keyframe.ts";
import {RuntimeKeyframeValues} from "./structure.ts";

/** Helper type for complex keyframes. `[[...], [...], [...]]`.
 * Includes runtime properties.
 */
export type RuntimeComplexKeyframesAbstract<
    T extends number[],
    R extends string,
> = InnerKeyframeAbstract<[
    ...RuntimeKeyframeValues<T, R>,
    TimeValue,
]>[]
/** Helper type for raw keyframes. `[...] | [[...], [...], [...]]`.
 * Includes runtime properties.
 */
export type RuntimeRawKeyframesAbstract<
    T extends number[],
    R extends string,
> =
    | RuntimeComplexKeyframesAbstract<T, R>
    | RuntimeKeyframeValues<T, R>
/** Helper type for keyframe arrays.
 * Includes runtime properties.
 */
export type RuntimePointDefinitionAbstract<
    T extends number[],
    R extends string,
> =
    | RuntimeRawKeyframesAbstract<T, R>
    | string