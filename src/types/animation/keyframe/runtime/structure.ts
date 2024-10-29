import {PointModifier} from '../components.ts'

/** Values for runtime keyframes.
 * [[...], [...], [...]] where [...] is [...x, time]
 * This type represents the "x".
 */
export type RuntimeKeyframeValues<
    T extends number[],
    R extends string,
> =
    [...T, ...(Modifier<T>[])] |
    [R, ...(Modifier<T>[])]

type Modifier<T extends number[]> = [...T, PointModifier]