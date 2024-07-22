import {RotationEvent} from "../../../../internals/beatmap/object/v3_event/rotation.ts";

/**
 * Used for 360 mode, rotates future objects and active objects.
 * @param beat The beat of the event.
 * @param rotation The rotation of the event.
 */
export function earlyRotation(
    beat: number,
    rotation?: number,
): RotationEvent
export function earlyRotation(
    ...params: ConstructorParameters<typeof RotationEvent>
): RotationEvent
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
 * @param beat The beat of the event.
 * @param rotation The rotation of the event.
 */
export function lateRotation(
    beat: number,
    rotation?: number,
): RotationEvent
export function lateRotation(
    ...params: ConstructorParameters<typeof RotationEvent>
): RotationEvent
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
