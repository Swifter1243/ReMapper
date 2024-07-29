import {Track} from '../../../utils/animation/track.ts'
import {Replace} from '../../util/object.ts'
import {Wall} from "../../../internals/beatmap/object/gameplay_object/wall.ts";
import {LightEvent} from "../../../internals/beatmap/object/basic_event/light_event.ts";
import {TrackValue} from "../../animation/track.ts";
import {AnyNote} from "./note.ts";
import {Fields} from "../../util/class.ts";
import {DeepReadonly} from "../../util/mutability.ts";

/** Properties to replace on constructor objects for gameplay objects. */
export type ObjectReplacements = {
    track?: TrackValue | Track
}

/** Get fields of a class, while replacing and excluding certain fields. */
export type ExcludedObjectFields<
    Class,
    Replacement = ObjectReplacements,
    Exclusion = ExcludeObjectFields,
> = Omit<
    Replace<Partial<Fields<Class>>, Replacement>,
    keyof Exclusion
>

/** Fields to exclude on the constructor object for gameplay objects. */
export type ExcludeObjectFields = {
    implicitNoteJumpSpeed: never
    implicitNoteJumpOffset: never
    isModded: never
    isGameplayModded: never
}

/** All beatmap objects. */
export type AnyBeatmapObject = AnyNote | Wall | LightEvent

export type DefaultFields<Class> = DeepReadonly<Fields<Class>>