import * as CustomEventInternals from '../../../../internals/beatmap/object/custom_event/mod.ts'

import {TJson} from "../../../../types/util/json.ts";

/** Make a custom event with no particular identity. */
export function abstractCustomEvent(
    ...params:
        | ConstructorParameters<typeof CustomEventInternals.AbstractCustomEvent>
        | [
            beat: number,
            type: string,
            data: TJson,
        ]
) {
    if (typeof params[0] === 'object') {
        return new CustomEventInternals.AbstractCustomEvent(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.AbstractCustomEvent
            >,
        )
    }

    const [beat, type, data] = params

    return new CustomEventInternals.AbstractCustomEvent(
        {
            beat: beat as number,
            type,
            data,
        },
    )
}
