import { AbstractBasicEvent } from '../../../../internals/beatmap/object/basic_event/abstract.ts'

/** The bare minimum basic light event. */
export function abstract(
    ...params: [
        beat: number,
        type?: number,
        value?: number,
        floatValue?: number,
    ] | ConstructorParameters<typeof AbstractBasicEvent>
): AbstractBasicEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new AbstractBasicEvent({
            ...obj,
        })
    }
    const [beat, type, value, floatValue] = params

    return new AbstractBasicEvent({
        beat,
        type: type ?? 0,
        value: value ?? 0,
        floatValue,
    })
}
