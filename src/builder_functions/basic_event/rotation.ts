import * as BasicEventInternals from '../../internals/lighting/basic_event.ts'
import { RotationEvent } from '../../internals/event.ts'

export type LightParameters =
    | [
        beat?: BasicEventInternals.LightEvent['beat'],
        value?: BasicEventInternals.LightEvent['value'],
        floatValue?: BasicEventInternals.LightEvent['floatValue'],
    ]
    | [
        data: Omit<
            ConstructorParameters<typeof BasicEventInternals.LightEvent>[0],
            'type'
        >,
    ]

/**
 * Used for 360 mode, rotates future objects and active objects.
 * @param rotation The rotation of the event.
 */
export function earlyRotation(
    ...params: [
        beat: number,
        rotation?: number,
    ] | ConstructorParameters<typeof RotationEvent>
): RotationEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new RotationEvent({
            ...obj,
        })
    }
    const [beat, rotation] = params

    return new RotationEvent({
        beat,
        rotation,
        early: true,
    })
}

/**
 * Used for 360 mode, rotates future objects only.
 * @param rotation The rotation of the event.
 */
export function lateRotation(
    ...params: [
        beat: number,
        rotation?: number,
    ] | ConstructorParameters<typeof RotationEvent>
): RotationEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new RotationEvent({
            ...obj,
        })
    }
    const [beat, rotation] = params

    return new RotationEvent({
        beat,
        rotation,
        early: false,
    })
}
