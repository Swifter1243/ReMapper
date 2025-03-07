import { AnyFog, FogEvent } from '../../../../internals/beatmap/object/environment/fog.ts'
import {AbstractDifficulty} from "../../../../internals/beatmap/abstract_difficulty.ts";

type Overload1 = [
    AnyFog & {
        beat?: number
        duration?: number
    },
]
type Overload2 = [
    beat: number,
    params: AnyFog & {
        duration?: number
    },
]
type Overload3 = [
    beat: number,
    duration: number,
    params: AnyFog,
]

/** Adjust fog, agnostic of version. */
export function adjustFog(
    difficulty: AbstractDifficulty,
    ...params: Overload1
): void
export function adjustFog(
    difficulty: AbstractDifficulty,
    ...params: Overload2
): void
export function adjustFog(
    difficulty: AbstractDifficulty,
    ...params: Overload3
): void
export function adjustFog(
    difficulty: AbstractDifficulty,
    ...params:
        | Overload1
        | Overload2
        | Overload3
) {
    if (typeof params[0] === 'object') {
        const obj = (params as Overload1)[0]

        new FogEvent(difficulty, obj, obj.beat, obj.duration)
        delete obj.beat
        delete obj.duration
    } else if (params.length === 2) {
        const obj = params as Overload2

        new FogEvent(difficulty, obj[1], obj[0])
        delete obj[1].duration
    } else {
        const obj = params as Overload3
        new FogEvent(difficulty, obj[2], obj[0], obj[1])
    }
}
