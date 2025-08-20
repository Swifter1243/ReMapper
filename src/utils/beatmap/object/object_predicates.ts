import {BeatmapObject} from "../../../internals/beatmap/object/object.ts";

export type ObjectPredicate = (o: BeatmapObject) => boolean

/** Filter objects before a beat. Optionally include the beat. */
export function before(beat: number, inclusive = false): ObjectPredicate {
    if (inclusive)
        return (o: BeatmapObject) => o.beat <= beat
    else
        return (o: BeatmapObject) => o.beat < beat
}

/** Filter objects after a beat. Optionally include the beat. */
export function after(beat: number, inclusive = false): ObjectPredicate {
    if (inclusive)
        return (o: BeatmapObject) => o.beat >= beat
    else
        return (o: BeatmapObject) => o.beat > beat
}

/** Filter objects between a start and end value. Use arrays to notate the beat should be included.
 * ```ts
 * between(0, 10) // >0 && <10
 * between([0], [10]) // >=0 && <=10
 * between([0], 10) // >=0 && <10
 * between(0, [10]) // >0 && <=10
 * ```
 * */
export function between(start: number | [number], end: number | [number]): ObjectPredicate {
    function formatInclusive(x: number | number[]): [number, boolean] {
        if (typeof x === 'number') return [x, false]
        else return [x[0], true]
    }

    return all(
        after(...formatInclusive(start)),
        before(...formatInclusive(end))
    )
}

/** Filter objects approximately at a beat. */
export function approximately(beat: number, lenience = 0.01): ObjectPredicate {
    return (o: BeatmapObject) => Math.abs(o.beat - beat) < lenience / 2
}

/** Check if any object predicate is true. */
export function any(...predicates: ObjectPredicate[]): ObjectPredicate {
    return (o: BeatmapObject) => predicates.some(fn => fn(o))
}

/** Check if all object predicates are true. */
export function all(...predicates: ObjectPredicate[]): ObjectPredicate {
    return (o: BeatmapObject) => !predicates.some(fn => !fn(o))
}