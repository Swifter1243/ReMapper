import {Wall} from '../../../internals/beatmap/object/gameplay_object/wall.ts'
import {LightEvent} from "../../../internals/beatmap/object/basic_event/light_event.ts";
import {AnyBeatmapObject} from "../../../types/beatmap/object/object.ts";
import {Chain} from "../../../internals/beatmap/object/gameplay_object/chain.ts";
import {ColorNote} from "../../../internals/beatmap/object/gameplay_object/color_note.ts";
import {Bomb} from "../../../internals/beatmap/object/gameplay_object/bomb.ts";
import {Arc} from "../../../internals/beatmap/object/gameplay_object/arc.ts";
import {AnyNote} from "../../../types/beatmap/object/note.ts";
import {filterObjectsByProperty} from "../../object/filter.ts";
import {AbstractDifficulty} from "../../../internals/beatmap/abstract_beatmap.ts";

function objectsBetween<T extends AnyBeatmapObject>(
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
 * @param difficulty The difficulty to get notes on.
 * @param min Minimum time of the notes.
 * @param max Maximum time of the notes.
 * @param forEach Function for each note.
 */
export function allNotesBetween(
    difficulty: AbstractDifficulty,
    min: number,
    max: number,
    forEach?: (obj: AnyNote) => void,
) {
    return objectsBetween(
        difficulty.allNotes as AnyNote[],
        min,
        max,
        forEach,
    )
}

/**
 * Gets notes between a min (inclusive) and max (exclusive) time.
 * @param difficulty The difficulty to get notes on.
 * @param min Minimum time of the notes.
 * @param max Maximum time of the notes.
 * @param forEach Function for each note.
 */
export function colorNotesBetween(
    difficulty: AbstractDifficulty,
    min: number,
    max: number,
    forEach?: (obj: ColorNote) => void,
) {
    return objectsBetween(difficulty.colorNotes, min, max, forEach)
}

/**
 * Gets bombs between a min (inclusive) and max (exclusive) time.
 * @param difficulty The difficulty to get notes on.
 * @param min Minimum time of the bombs.
 * @param max Maximum time of the bombs.
 * @param forEach Function for each bomb.
 */
export function bombsBetween(
    difficulty: AbstractDifficulty,
    min: number,
    max: number,
    forEach?: (obj: Bomb) => void,
) {
    return objectsBetween(difficulty.bombs, min, max, forEach)
}

/**
 * Gets arcs between a min (inclusive) and max (exclusive) time.
 * @param difficulty The difficulty to get notes on.
 * @param min Minimum time of the arcs.
 * @param max Maximum time of the arcs.
 * @param forEach Function for each arc.
 */
export function arcsBetween(
    difficulty: AbstractDifficulty,
    min: number,
    max: number,
    forEach?: (obj: Arc) => void,
) {
    return objectsBetween(difficulty.arcs, min, max, forEach)
}

/**
 * Gets chains between a min (inclusive) and max (exclusive) time.
 * @param difficulty The difficulty to get notes on.
 * @param min Minimum time of the chains.
 * @param max Maximum time of the chains.
 * @param forEach Function for each chain.
 */
export function chainsBetween(
    difficulty: AbstractDifficulty,
    min: number,
    max: number,
    forEach?: (obj: Chain) => void,
) {
    return objectsBetween(difficulty.chains, min, max, forEach)
}

/**
 * Gets walls between a min (inclusive) and max (exclusive) time.
 * @param difficulty The difficulty to get notes on.
 * @param min Minimum time of the walls.
 * @param max Maximum time of the walls.
 * @param forEach Function for each wall.
 */
export function wallsBetween(
    difficulty: AbstractDifficulty,
    min: number,
    max: number,
    forEach?: (obj: Wall) => void,
) {
    return objectsBetween(difficulty.walls, min, max, forEach)
}

/**
 * Gets light events between a min (inclusive) and max (exclusive) time.
 * @param difficulty The difficulty to get notes on.
 * @param min Minimum of the events.
 * @param max Maximum time of the events.
 * @param forEach Function for each light event.
 */
export function lightEventBetween(
    difficulty: AbstractDifficulty,
    min: number,
    max: number,
    forEach?: (obj: LightEvent) => void,
) {
    return objectsBetween(difficulty.lightEvents, min, max, forEach)
}

