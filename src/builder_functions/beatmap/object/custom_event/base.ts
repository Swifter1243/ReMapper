import {TJson} from "../../../../types/util/json.ts";
import {AbstractCustomEvent} from "../../../../internals/beatmap/object/custom_event/base/abstract_custom_event.ts";

/** Make a custom event with no particular identity. */
export function abstractCustomEvent(
    ...params:
        | ConstructorParameters<typeof AbstractCustomEvent>
        | [
            beat: number,
            type: string,
            data: TJson,
        ]
) {
    if (typeof params[0] === 'object') {
        return new AbstractCustomEvent(
            ...params as ConstructorParameters<
                typeof AbstractCustomEvent
            >,
        )
    }

    const [beat, type, data] = params

    return new AbstractCustomEvent(
        {
            beat: beat as number,
            type,
            data,
        },
    )
}
