import {bsmap} from '../deps.ts'
import {BasicEvent} from '../internals/beatmap/object/basic_event/basic_event.ts'

import {ExcludedObjectFields} from "./beatmap/object/object.ts";

export type AbstractEvent = BasicEvent<
    bsmap.v2.IEvent,
    bsmap.v3.IBasicEvent
>

// deno-lint-ignore ban-types
export type BasicEventExcludedFields<Class> = ExcludedObjectFields<Class, {}>