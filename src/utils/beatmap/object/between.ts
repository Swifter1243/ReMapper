import {Wall} from '../../../internals/beatmap/object/gameplay_object/wall.ts'
import {getActiveDifficulty} from "../../../data/active_difficulty.ts";
import {LightEvent} from "../../../internals/beatmap/object/basic_event/light_event.ts";
import {BeatmapObject} from "../../../types/beatmap/object/object.ts";
import {Chain} from "../../../internals/beatmap/object/gameplay_object/chain.ts";
import {ColorNote} from "../../../internals/beatmap/object/gameplay_object/color_note.ts";
import {Bomb} from "../../../internals/beatmap/object/gameplay_object/bomb.ts";
import {Arc} from "../../../internals/beatmap/object/gameplay_object/arc.ts";
import {AnyNote} from "../../../types/beatmap/object/note.ts";
import {filterObjectsByProperty} from "../../object/filter.ts";

function objectsBetween<T extends BeatmapObject>(
    array: T[],
    min: number,
    max: number,
    forEach?: (obj: T) => void,
) {
    const filtered = filterObjectsByProperty(array, min, max, 'beat')
    if (forEach) filtered.forEach(forEach)
    return filtered
}

/**
 * Gets all note types (note, bomb, arc, chain) between a min (inclusive) and max (exclusive) time.
 * @param min Minimum time of the notes.
 * @param max Maximum time of the notes.
 * @param forEach Function for each note.
 */
export function allNotesBetween(
    min: number,
    max: number,
    forEach?: (obj: AnyNote) => void,
) {
    return objectsBetween(
        getActiveDifficulty().allNotes as AnyNote[],
        min,
        max,
        forEach,
    )
}

/**
 * Gets notes between a min (inclusive) and max (exclusive) time.
 * @param min Minimum time of the notes.
 * @param max Maximum time of the notes.
 * @param forEach Function for each note.
 */
export function colorNotesBetween(
    min: number,
    max: number,
    forEach?: (obj: ColorNote) => void,
) {
    return objectsBetween(getActiveDifficulty().colorNotes, min, max, forEach)
}

/**
 * Gets bombs between a min (inclusive) and max (exclusive) time.
 * @param min Minimum time of the bombs.
 * @param max Maximum time of the bombs.
 * @param forEach Function for each bomb.
 */
export function bombsBetween(
    min: number,
    max: number,
    forEach?: (obj: Bomb) => void,
) {
    return objectsBetween(getActiveDifficulty().bombs, min, max, forEach)
}

/**
 * Gets arcs between a min (inclusive) and max (exclusive) time.
 * @param min Minimum time of the arcs.
 * @param max Maximum time of the arcs.
 * @param forEach Function for each arc.
 */
export function arcsBetween(
    min: number,
    max: number,
    forEach?: (obj: Arc) => void,
) {
    return objectsBetween(getActiveDifficulty().arcs, min, max, forEach)
}

/**
 * Gets chains between a min (inclusive) and max (exclusive) time.
 * @param min Minimum time of the chains.
 * @param max Maximum time of the chains.
 * @param forEach Function for each chain.
 */
export function chainsBetween(
    min: number,
    max: number,
    forEach?: (obj: Chain) => void,
) {
    return objectsBetween(getActiveDifficulty().chains, min, max, forEach)
}

/**
 * Gets walls between a min (inclusive) and max (exclusive) time.
 * @param min Minimum time of the walls.
 * @param max Maximum time of the walls.
 * @param forEach Function for each wall.
 */
export function wallsBetween(
    min: number,
    max: number,
    forEach?: (obj: Wall) => void,
) {
    return objectsBetween(getActiveDifficulty().walls, min, max, forEach)
}

/**
 * Gets light events between a min (inclusive) and max (exclusive) time.
 * @param min Minimum of the events.
 * @param max Maximum time of the events.
 * @param forEach Function for each light event.
 */
export function lightEventBetween(
    min: number,
    max: number,
    forEach?: (obj: LightEvent) => void,
) {
    return objectsBetween(getActiveDifficulty().lightEvents, min, max, forEach)
}

