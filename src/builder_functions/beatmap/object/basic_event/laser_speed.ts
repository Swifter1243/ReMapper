import {EventGroup, SpinDirection} from '../../../../constants/basic_event.ts'
import { LaserSpeedEvent } from '../../../../internals/beatmap/object/basic_event/laser_speed.ts'

type LeftLaserSpeedParams = [Omit<ConstructorParameters<typeof LaserSpeedEvent>[0], 'type'>]

/**
 * Controls left rotating laser speed.
 * @param beat The beat to spawn the event at.
 * @param speed Speed of the rotating lasers.
 * @param direction Direction of the rotating lasers.
 * @param lockRotation Whether the existing rotation should be kept.
 */
export function leftLaserSpeed(
    beat: number,
    speed?: number,
    direction?: SpinDirection,
    lockRotation?: boolean,
): LaserSpeedEvent
export function leftLaserSpeed(...params: LeftLaserSpeedParams): LaserSpeedEvent
export function leftLaserSpeed(
    ...params: [
        beat: number,
        speed?: number,
        direction?: SpinDirection,
        lockRotation?: boolean,
    ] | LeftLaserSpeedParams
): LaserSpeedEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new LaserSpeedEvent({
            ...obj,
            type: EventGroup.LEFT_ROTATING_LASERS,
        })
    }
    const [beat, speed, direction, lockRotation] = params

    return new LaserSpeedEvent({
        beat,
        type: EventGroup.LEFT_ROTATING_LASERS,
        value: speed ?? 0,
        lockRotation,
        direction,
        speed,
    })
}

type RightLaserSpeedParams = [Omit<ConstructorParameters<typeof LaserSpeedEvent>[0], 'type'>]

/**
 * Controls right rotating laser speed.
 * @param beat The beat to spawn the event at.
 * @param speed Speed of the rotating lasers.
 * @param direction Direction of the spin.
 * @param lockRotation Whether the existing rotation should be kept.
 */
export function rightLaserSpeed(
    beat: number,
    speed?: number,
    direction?: SpinDirection,
    lockRotation?: boolean,
): LaserSpeedEvent
export function rightLaserSpeed(...params: RightLaserSpeedParams): LaserSpeedEvent
export function rightLaserSpeed(
    ...params: [
        beat: number,
        speed?: number,
        direction?: SpinDirection,
        lockRotation?: boolean,
    ] | RightLaserSpeedParams
): LaserSpeedEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new LaserSpeedEvent({
            ...obj,
            type: EventGroup.RIGHT_ROTATING_LASERS,
        })
    }
    const [beat, speed, direction, lockRotation] = params

    return new LaserSpeedEvent({
        beat,
        type: EventGroup.RIGHT_ROTATING_LASERS,
        value: speed ?? 0,
        lockRotation,
        direction,
        speed,
    })
}
