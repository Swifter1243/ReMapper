import {PointModifier} from '../keyframe.ts'

/** Values for runtime keyframes.
 * [[...], [...], [...]] where [...] is [...x, time]
 * This type represents the "x".
 */
export type RuntimeKeyframeValues<
    T extends number[],
    R extends string,
> =
    | RuntimeValues<T, R>
    | [R]
    | T

type RuntimeRecurse<
    A extends unknown[],
    G extends unknown,
> =
    | [
        ...A,
        PointModifier,
    ]
    | [
        ...A,
        G,
        PointModifier,
    ]

/** A term to be evaluated in a runtime expression.
 */
export type RuntimeValues<
    T extends number[],
    R extends string,
> = [
    ...T | [R],
    RuntimeRecurse<
        T | [R],
        RuntimeRecurse<
            T | [R],
            RuntimeRecurse<
                T | [R],
                RuntimeRecurse<
                    T | [R],
                    [
                        ...T | [R],
                        PointModifier,
                    ]
                >
            >
        >
    >,
]

