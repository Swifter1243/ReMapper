import { RotationEvent } from '../../../../internals/beatmap/object/v3_event/rotation.ts'
import { AbstractDifficulty } from '../../../../internals/beatmap/abstract_beatmap.ts'

/**
 * Used for 360 mode, rotates future objects and active objects.
 * @param parentDifficulty What difficulty to push this event to.
 * @param beat The beat of the event.
 * @param rotation The rotation of the event.
 */
export function earlyRotation(
    parentDifficulty: AbstractDifficulty,
    beat: number,
    rotation?: number,
): RotationEvent
export function earlyRotation(
    ...params: ConstructorParameters<typeof RotationEvent>
): RotationEvent
export function earlyRotation(
    ...params: [
        parentDifficulty: AbstractDifficulty,
        beat: number,
        rotation?: number,
    ] | ConstructorParameters<typeof RotationEvent>
): RotationEvent {
    if (typeof params[1] === 'object') {
        const [parentDifficulty, obj] = params
        return new RotationEvent(parentDifficulty, obj)
    }
    const [parentDifficulty, beat, rotation] = params

    return new RotationEvent(parentDifficulty, {
        beat,
        rotation,
        early: true,
    })
}

/**
 * Used for 360 mode, rotates future objects only.
 * @param parentDifficulty What difficulty to push this event to.
 * @param beat The beat of the event.
 * @param rotation The rotation of the event.
 */
export function lateRotation(
    parentDifficulty: AbstractDifficulty,
    beat: number,
    rotation?: number,
): RotationEvent
export function lateRotation(
    ...params: ConstructorParameters<typeof RotationEvent>
): RotationEvent
export function lateRotation(
    ...params: [
        parentDifficulty: AbstractDifficulty,
        beat: number,
        rotation?: number,
    ] | ConstructorParameters<typeof RotationEvent>
): RotationEvent {
    if (typeof params[1] === 'object') {
        const [parentDifficulty, obj] = params
        return new RotationEvent(parentDifficulty, {
            ...obj,
        })
    }
    const [parentDifficulty, beat, rotation] = params

    return new RotationEvent(parentDifficulty, {
        beat,
        rotation,
        early: false,
    })
}
