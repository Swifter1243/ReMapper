import {LightEvent} from "../internals/beatmap/object/basic_event/light_event.ts";
import {AnyNote} from "./beatmap/object/note.ts";

/** Condition that is run inside a `NoteIterator` */
export type NoteCondition<T extends AnyNote> = (event: T) => boolean

/** Process that is run inside a `NoteIterator` */
export type NoteProcess<T extends AnyNote> = (event: T) => void

/** Condition that is run inside a `LightIterator` */
export type LightEventCondition = (event: LightEvent) => boolean

/** Process that is run inside a `LightIterator` */
export type LightEventProcess = (event: LightEvent) => void

/** String representations of all the `NoteCut` directions. */
export type CutName =
    | 'dot'
    | 'down'
    | 'down_left'
    | 'down_right'
    | 'left'
    | 'right'
    | 'up'
    | 'up_left'
    | 'up_right'