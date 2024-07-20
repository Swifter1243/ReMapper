import * as BasicEventInternals from '../../internals/lighting/basic_event.ts'

/** The bare minimum basic event. */
export function baseBasicEvent(
    ...params: [
        beat: number,
        type?: number,
        value?: number,
        floatValue?: number,
    ] | ConstructorParameters<typeof BasicEventInternals.BaseBasicEvent>
): BasicEventInternals.BaseBasicEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new BasicEventInternals.BaseBasicEvent({
            ...obj,
        })
    }
    const [beat, type, value, floatValue] = params

    return new BasicEventInternals.BaseBasicEvent({
        beat,
        type: type ?? 0,
        value: value ?? 0,
        floatValue,
    })
}
