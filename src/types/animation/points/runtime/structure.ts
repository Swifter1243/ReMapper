import { PointModifier } from "../components.ts";

/** Values for runtime points.
 * [[...], [...], [...]] where [...] is [...x, time]
 * This type represents the "x".
 */
export type RuntimePointValues<
    T extends number[],
    R extends string,
> =
    | [...T, ...Modifier<T, R>[]]
    | [R, ...Modifier<T, R>[]]

type Modifier<T extends number[], R extends string> =
    | [...T, PointModifier]
    | [R, PointModifier]
