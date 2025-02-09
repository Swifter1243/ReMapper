import { AbstractBasicEvent } from '../../../../internals/beatmap/object/basic_event/abstract.ts'
import {AbstractDifficulty} from "../../../../internals/beatmap/abstract_difficulty.ts";

/** The bare minimum basic light event. */
export function abstract(
    ...params: [
        parentDifficulty: AbstractDifficulty,
        beat: number,
        type?: number,
        value?: number,
        floatValue?: number,
    ] | ConstructorParameters<typeof AbstractBasicEvent>
): AbstractBasicEvent {
    if (typeof params[1] === 'object') {
        const [diff, obj] = params
        return new AbstractBasicEvent(diff, obj)
    }
    const [parentDifficulty, beat, type, value, floatValue] = params

    return new AbstractBasicEvent(parentDifficulty, {
        beat,
        type,
        value,
        floatValue,
    })
}
