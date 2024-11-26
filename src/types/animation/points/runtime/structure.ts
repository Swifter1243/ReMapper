import { PointModifier } from '../components.ts'
import { DecreaseNumber } from '../../../util/generate.ts'

/** Values for runtime points.
 * [[...], [...], [...]] where [...] is [...x, time]
 * This type represents the "x".
 */
export type RuntimePointValues<
    T extends number[],
    R extends string,
> =
    | [...T, ...RecursiveModifier<T, R>[]]
    | [R, ...RecursiveModifier<T, R>[]]

// what the fuck
type RecursiveModifier<T extends number[], R extends string, Depth extends number = 20> = Depth extends 0
    ? [...T, PointModifier] | [R, PointModifier]
    :
        | [...T, ...RecursiveModifier<T, R, DecreaseNumber<Depth>>[], PointModifier]
        | [R, ...RecursiveModifier<T, R, DecreaseNumber<Depth>>[], PointModifier]
