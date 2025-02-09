import { PointModifier } from '../components.ts'
import { DecreaseNumber } from '../../../util/generate.ts'

/** Values for runtime points.
 * [[...], [...], [...]] where [...] is [...x, time]
 * This type represents the "x".
 */
export type RuntimePointValues<V extends unknown[]> =
    | [...V, ...RecursiveModifier<V>[]]

// what the fuck
type RecursiveModifier<V extends unknown[], Depth extends number = 20> = Depth extends 0
    ? [...V, PointModifier]
    :
        | [...V, ...RecursiveModifier<V, DecreaseNumber<Depth>>[], PointModifier]
