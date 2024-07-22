import {ExcludedObjectFields} from "./object.ts";
import {LightEvent} from "../../../internals/beatmap/object/basic_event/light_event.ts";

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
export type LightColorLiteral = 'Red' | 'Blue' | 'White'