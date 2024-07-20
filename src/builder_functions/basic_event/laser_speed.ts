import * as BasicEventInternals from '../../internals/lighting/basic_event.ts'
import { EventGroup } from '../../data/constants.ts'

/**
 * Controls left rotating laser speed.
 * @param speed Speed of the rotating lasers.
 * @param direction Direction of the rotating lasers.
 * @param lockRotation Whether the existing rotation should be kept.
 */
export function leftLaserSpeed(
    ...params: [
        beat: number,
        speed?: number,
        direction?: BasicEventInternals.RingSpinEvent['direction'],
        lockRotation?: boolean,
    ] | [
        Omit<
            ConstructorParameters<
                typeof BasicEventInternals.LaserSpeedEvent
            >[0],
            'type'
        >,
    ]
): BasicEventInternals.LaserSpeedEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new BasicEventInternals.LaserSpeedEvent({
            ...obj,
            type: EventGroup.LEFT_ROTATING_LASERS,
        })
    }
    const [beat, speed, direction, lockRotation] = params

    return new BasicEventInternals.LaserSpeedEvent({
        beat,
        type: EventGroup.LEFT_ROTATING_LASERS,
        value: speed ?? 0,
        lockRotation,
        direction,
        speed,
    })
}

/**
 * Controls right rotating laser speed.
 * @param speed Speed of the rotating lasers.
 * @param direction Direction of the rotating lasers.
 * @param lockRotation Whether the existing rotation should be kept.
 */
export function rightLaserSpeed(
    ...params: [
        beat: number,
        speed?: number,
        direction?: BasicEventInternals.RingSpinEvent['direction'],
        lockRotation?: boolean,
    ] | [
        Omit<
            ConstructorParameters<
                typeof BasicEventInternals.LaserSpeedEvent
            >[0],
            'type'
        >,
    ]
): BasicEventInternals.LaserSpeedEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new BasicEventInternals.LaserSpeedEvent({
            ...obj,
            type: EventGroup.RIGHT_ROTATING_LASERS,
        })
    }
    const [beat, speed, direction, lockRotation] = params

    return new BasicEventInternals.LaserSpeedEvent({
        beat,
        type: EventGroup.RIGHT_ROTATING_LASERS,
        value: speed ?? 0,
        lockRotation,
        direction,
        speed,
    })
}
