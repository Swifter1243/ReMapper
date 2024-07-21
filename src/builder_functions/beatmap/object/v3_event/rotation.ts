import {LightEvent} from "../../../../internals/beatmap/object/basic_event/light_event.ts";
import {RotationEvent} from "../../internals/v3_event/rotation.ts";

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

/**
 * Used for 360 mode, rotates future objects and active objects.
 * @param rotation The rotation of the light_event.
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
 * @param rotation The rotation of the light_event.
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
