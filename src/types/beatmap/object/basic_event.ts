import {bsmap} from '../../../deps.ts'
import {BasicEvent} from '../../../internals/beatmap/object/basic_event/basic_event.ts'

import {ExcludedObjectFields} from "./object.ts";
import {LightEvent} from "../../../internals/beatmap/object/basic_event/light_event.ts";

export type AbstractEvent = BasicEvent<
    bsmap.v2.IEvent,
    bsmap.v3.IBasicEvent
>

// deno-lint-ignore ban-types
export type BasicEventExcludedFields<Class> = ExcludedObjectFields<Class, {}>
export type LightParameters =
    | [
    beat?: LightEvent['beat'],
    value?: LightEvent['value'],
    floatValue?: LightEvent['floatValue'],
]
    | [
    data: Omit<
        ConstructorParameters<typeof LightEvent>[0],
        'type'
    >,
]
export type LightColor = 'Red' | 'Blue' | 'White'