import {LightEvent} from "../internals/beatmap/object/basic_event/light_event.ts";
import {AnyNote} from "./beatmap/object/note.ts";

export type NoteCondition<T extends AnyNote> = (event: T) => boolean
export type NoteProcess<T extends AnyNote> = (event: T) => void
export type LightEventCondition = (event: LightEvent) => boolean
export type LightEventProcess = (event: LightEvent) => void
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