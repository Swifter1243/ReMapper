import { EventGroup, SpinDirection } from '../../../../constants/basic_event.ts'
import { LaserSpeedEvent } from '../../../../internals/beatmap/object/basic_event/laser_speed.ts'
import { AbstractDifficulty } from '../../../../internals/beatmap/abstract_beatmap.ts'
import { BasicEvent } from '../../../../internals/beatmap/object/basic_event/basic_event.ts'

type LaserSpeedParams = [
    ConstructorParameters<typeof LaserSpeedEvent>[0],
    Omit<ConstructorParameters<typeof LaserSpeedEvent>[1], 'type'>,
]

/**
 * Controls left rotating laser speed.
 * @param parentDifficulty The difficulty to push this event to
 * @param beat The beat to spawn the event at.
 * @param speed Speed of the rotating lasers.
 * @param direction Direction of the rotating lasers.
 * @param lockRotation Whether the existing rotation should be kept.
 */
export function leftLaserSpeed(
    parentDifficulty: AbstractDifficulty,
    beat: number,
    speed?: number,
    direction?: SpinDirection,
    lockRotation?: boolean,
): LaserSpeedEvent
export function leftLaserSpeed(...params: LaserSpeedParams): LaserSpeedEvent
export function leftLaserSpeed(
    ...params: [
        parentDifficulty: AbstractDifficulty,
        beat: number,
        speed?: number,
        direction?: SpinDirection,
        lockRotation?: boolean,
    ] | LaserSpeedParams
): LaserSpeedEvent {
    if (typeof params[1] === 'object') {
        const [diff, obj] = params
        return new LaserSpeedEvent(diff, {
            ...obj,
            type: EventGroup.LEFT_ROTATING_LASERS,
        })
    }
    const [parentDifficulty, beat, speed, direction, lockRotation] = params

    return new LaserSpeedEvent(parentDifficulty, {
        beat,
        type: EventGroup.LEFT_ROTATING_LASERS,
        value: speed,
        lockRotation,
        direction,
        speed,
    })
}

/**
 * Controls right rotating laser speed.
 * @param parentDifficulty The difficulty to push this event to
 * @param beat The beat to spawn the event at.
 * @param speed Speed of the rotating lasers.
 * @param direction Direction of the spin.
 * @param lockRotation Whether the existing rotation should be kept.
 */
export function rightLaserSpeed(
    parentDifficulty: AbstractDifficulty,
    beat: number,
    speed?: number,
    direction?: SpinDirection,
    lockRotation?: boolean,
): LaserSpeedEvent
export function rightLaserSpeed(...params: LaserSpeedParams): LaserSpeedEvent
export function rightLaserSpeed(
    ...params: [
        parentDifficulty: AbstractDifficulty,
        beat: number,
        speed?: number,
        direction?: SpinDirection,
        lockRotation?: boolean,
    ] | LaserSpeedParams
): LaserSpeedEvent {
    if (typeof params[1] === 'object') {
        const [diff, obj] = params
        return new LaserSpeedEvent(diff, {
            ...obj,
            type: EventGroup.RIGHT_ROTATING_LASERS,
        })
    }
    const [parentDifficulty, beat, speed, direction, lockRotation] = params

    return new LaserSpeedEvent(parentDifficulty, {
        beat,
        type: EventGroup.RIGHT_ROTATING_LASERS,
        value: speed,
        lockRotation,
        direction,
        speed,
    })
}
