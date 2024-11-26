import { PointModifier } from '../components.ts'

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
    | [...T, ...Modifier2<T, R>[], PointModifier]
    | [R, ...Modifier2<T, R>[], PointModifier]

type Modifier2<T extends number[], R extends string> =
    | [...T, ...Modifier3<T, R>[], PointModifier]
    | [R, ...Modifier3<T, R>[], PointModifier]

type Modifier3<T extends number[], R extends string> =
    | [...T, ...Modifier4<T, R>[], PointModifier]
    | [R, ...Modifier4<T, R>[], PointModifier]

type Modifier4<T extends number[], R extends string> =
    | [...T, PointModifier]
    | [R, PointModifier]
