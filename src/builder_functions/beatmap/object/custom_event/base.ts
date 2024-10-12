import { TJson } from '../../../../types/util/json.ts'
import { AbstractCustomEvent } from '../../../../internals/beatmap/object/custom_event/base/abstract_custom_event.ts'
import { AbstractDifficulty } from '../../../../internals/beatmap/abstract_beatmap.ts'

/** Make a custom event with no particular identity. */
export function abstractCustomEvent(
    ...params:
        | ConstructorParameters<typeof AbstractCustomEvent>
        | [
            parentDifficulty: AbstractDifficulty,
            beat: number,
            type: string,
            data: TJson,
        ]
) {
    if (typeof params[1] === 'object') {
        return new AbstractCustomEvent(
            ...params as ConstructorParameters<
                typeof AbstractCustomEvent
            >,
        )
    }

    const [parentDifficulty, beat, type, data] = params

    return new AbstractCustomEvent(parentDifficulty, {
        beat: beat as number,
        type,
        data,
    })
}
