import {Replace} from '../../util/object.ts'
import {Wall} from '../../../internals/beatmap/object/gameplay_object/wall.ts'
import {LightEvent} from '../../../internals/beatmap/object/basic_event/light_event.ts'
import {AnyNote} from './note.ts'
import {Fields} from '../../util/class.ts'
import {DeepReadonly} from '../../util/mutability.ts'

export type JsonObjectDefaults<Class> = DeepReadonly<Fields<Class>>

export type JsonObjectConstructor<Class> = Partial<Fields<Class>>

export type BeatmapObjectFields<T> = Omit<Fields<T>, 'isModded'>

export type BeatmapObjectConstructor<T> = Partial<BeatmapObjectFields<T>>

export type BeatmapObjectDefaults<T> = DeepReadonly<BeatmapObjectFields<T>>

/** Get fields of a class, while replacing and excluding certain fields. */
export type ExcludedObjectFields<Class, Replacement, Exclusion> = Omit<Replace<BeatmapObjectFields<Class>, Replacement>, keyof Exclusion>

/** All beatmap objects. */
export type AnyBeatmapObject = AnyNote | Wall | LightEvent
