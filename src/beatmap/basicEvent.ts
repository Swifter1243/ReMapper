import {EventGroup, InterscopeGroup} from '../data/constants.ts'
import {EventInternals} from '../internals/mod.ts'
import {Fields} from '../data/types.ts'

type LightParameters =
    | [
        time?: EventInternals.LightEvent['time'],
        value?: EventInternals.LightEvent['value'],
        floatValue?: EventInternals.LightEvent['floatValue'],
    ]
    | [data: Fields<EventInternals.LightEvent>]
    | ConstructorParameters<typeof EventInternals.LightEvent>

function fixupParams<TG extends EventInternals.LightEvent['type']>(
    group: TG,
    ...params: LightParameters
): ConstructorParameters<typeof EventInternals.LightEvent> {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return [obj]
    }

    const [time, value, floatValue] = params

    return [{
        time: time ?? 0,
        customData: {},
        floatValue: floatValue ?? 1,
        value: value ?? 1,
        type: group,
    }] satisfies ConstructorParameters<typeof EventInternals.LightEvent>
}

/** Controls the back lasers. (Type 0) */
export const backLasers = (...params: LightParameters) =>
    new EventInternals.LightEvent(
        ...fixupParams(EventGroup.BACK_LASERS, ...params),
    )

/** Controls the ring lights. (Type 1) */
export const ringLights = (...params: LightParameters) =>
    new EventInternals.LightEvent(
        ...fixupParams(EventGroup.RING_LIGHTS, ...params),
    )

/** Controls the left lasers. (Type 2) */
export const leftLasers = (...params: LightParameters) =>
    new EventInternals.LightEvent(
        ...fixupParams(EventGroup.LEFT_LASERS, ...params),
    )

/** Controls the right lasers. (Type 3) */
export const rightLasers = (...params: LightParameters) =>
    new EventInternals.LightEvent(
        ...fixupParams(EventGroup.RIGHT_LASERS, ...params),
    )

/** Controls the center lasers. (Type 4) */
export const centerLasers = (...params: LightParameters) =>
    new EventInternals.LightEvent(
        ...fixupParams(EventGroup.CENTER_LASERS, ...params),
    )

/** Controls the extra left lasers in some environments. (Type 6) */
export const extraLeft = (...params: LightParameters) =>
    new EventInternals.LightEvent(
        ...fixupParams(EventGroup.LEFT_EXTRA, ...params),
    )

/** Controls the extra right lasers in some environments. (Type 7) */
export const extraRight = (...params: LightParameters) =>
    new EventInternals.LightEvent(
        ...fixupParams(EventGroup.RIGHT_EXTRA, ...params),
    )

/** Controls the left lasers in the Billie environment. (Type 10) */
export const billieLeft = (...params: LightParameters) =>
    new EventInternals.LightEvent(
        ...fixupParams(EventGroup.BILLIE_LEFT, ...params),
    )

/** Controls the right lasers in the Billie environment. (Type 11) */
export const billieRight = (...params: LightParameters) =>
    new EventInternals.LightEvent(
        ...fixupParams(EventGroup.BILLIE_RIGHT, ...params),
    )

/** Controls the outer left tower height in the Gaga environment. (Type 18) */
export const gagaLeft = (...params: LightParameters) =>
    new EventInternals.LightEvent(
        ...fixupParams(EventGroup.GAGA_LEFT, ...params),
    )

/** Controls the outer left tower height in the Gaga environment. (Type 19) */
export const gagaRight = (...params: LightParameters) =>
    new EventInternals.LightEvent(
        ...fixupParams(EventGroup.GAGA_RIGHT, ...params),
    )

/**
 * Move cars in the interscope environment.
 * @param value The group of cars to target.
 */
export function moveCars(
    ...params: Omit<
        ConstructorParameters<typeof EventInternals.RingSpinEvent>,
        'type'
    >
): EventInternals.RingSpinEvent
export function moveCars(
    time: number,
    value: InterscopeGroup,
): EventInternals.RingSpinEvent
export function moveCars(
    ...params:
        | [time: number, value: InterscopeGroup]
        | Omit<
            ConstructorParameters<typeof EventInternals.RingSpinEvent>,
            'type'
        >
) {
    if (typeof params[0] === 'object') {
        return new EventInternals.RingSpinEvent(params[0])
    }
    const [time, value] = params

    return new EventInternals.RingSpinEvent({
        time: time,
        value: value as InterscopeGroup,
    })
}

// TODO: Event extras
/** Lower the hydraulics of the cars in the interscope environment. */
export function lowerHydraulics(time: number) {
    return new EventInternals.LightEvent({
        time: time,
        type: EventGroup.LOWER_HYDRAULICS as any,
        value: 0,
    })
}

/** Raise the hydraulics of the cars in the interscope environment. */
export function raiseHydraulics(time: number) {
    return new EventInternals.LightEvent({
        time: time,
        type: EventGroup.RAISE_HYDRAULICS as any,
        value: 0,
    })
}

export function ringSpin(
    time: number,
    rotation?: number,
    direction?: EventInternals.RingSpinEvent['direction'],
    step?: number,
    speed?: number,
    prop?: number,
    nameFilter?: string,
): EventInternals.RingSpinEvent
export function ringSpin(
    ...obj: ConstructorParameters<typeof EventInternals.RingSpinEvent>
): EventInternals.RingSpinEvent

/**
 * Spin the rings of an environment.
 * @param rotation Degrees of the spin.
 * @param direction Direction of the spin. 1 is clockwise, 0 is counterclockwise.
 * @param step The angle between each ring.
 * @param speed The speed multiplier of the spin.
 * @param prop The rate at which physics propogate through the rings.
 * High values will cause rings to move simultneously, low values gives them significant delay.
 * @param nameFilter The ring object name to target.
 */
export function ringSpin(
    ...params: [
        time: number,
        rotation?: number,
        direction?: EventInternals.RingSpinEvent['direction'],
        step?: number,
        speed?: number,
        prop?: number,
        nameFilter?: string,
    ] | ConstructorParameters<typeof EventInternals.RingSpinEvent>
): EventInternals.RingSpinEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new EventInternals.RingSpinEvent(obj)
    }
    const [time, rotation, direction, step, speed, prop, nameFilter] = params

    return new EventInternals.RingSpinEvent({
        time,
        value: rotation ?? 0,
        rotation,
        direction,
        step,
        speed,
        prop,
        nameFilter,
    })
}

export function ringZoom(
    time: number,
    speed?: number,
): EventInternals.RingZoomEvent
export function ringZoom(
    ...obj: ConstructorParameters<typeof EventInternals.RingZoomEvent>
): EventInternals.RingZoomEvent

/**
 * Controls ring zoom.
 * @param step The position offset between each ring.
 * @param speed The speed of the zoom.
 */
export function ringZoom(
    ...params: [
        time: number,
        rotation?: number,
        direction?: EventInternals.RingSpinEvent['direction'],
        step?: number,
        speed?: number,
        prop?: number,
        nameFilter?: string,
    ] | ConstructorParameters<typeof EventInternals.RingZoomEvent>
): EventInternals.RingZoomEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new EventInternals.RingZoomEvent(obj)
    }
    const [time, speed] = params

    return new EventInternals.RingZoomEvent({
        time,
        value: speed ?? 0,
        speed,
    })
}

export function leftLaserSpeed(
    time: number,
    speed?: number,
    direction?: EventInternals.RingSpinEvent['direction'],
    lockRotation?: boolean,
): EventInternals.LaserSpeedEvent
export function leftLaserSpeed(
    ...obj: [
        Omit<
            ConstructorParameters<typeof EventInternals.LaserSpeedEvent>[0],
            'type'
        >,
    ]
): EventInternals.LaserSpeedEvent

/**
 * Controls left rotating laser speed.
 * @param speed Speed of the rotating lasers.
 * @param direction Direction of the rotating lasers.
 * @param lockRotation Whether the existing rotation should be kept.
 */
export function leftLaserSpeed(
    ...params: [
        time: number,
        speed?: number,
        direction?: EventInternals.RingSpinEvent['direction'],
        lockRotation?: boolean,
    ] | [
        Omit<
            ConstructorParameters<typeof EventInternals.LaserSpeedEvent>[0],
            'type'
        >,
    ]
): EventInternals.LaserSpeedEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new EventInternals.LaserSpeedEvent({
            ...obj,
            type: EventGroup.LEFT_ROTATING,
        })
    }
    const [time, speed, direction, lockRotation] = params

    return new EventInternals.LaserSpeedEvent({
        time,
        type: EventGroup.LEFT_ROTATING,
        value: speed ?? 0,
        lockRotation,
        direction,
        speed,
    })
}

export function rightLaserSpeed(
    time: number,
    speed?: number,
    direction?: EventInternals.RingSpinEvent['direction'],
    lockRotation?: boolean,
): EventInternals.LaserSpeedEvent
export function rightLaserSpeed(
    ...obj: [
        Omit<
            ConstructorParameters<typeof EventInternals.LaserSpeedEvent>[0],
            'type'
        >,
    ]
): EventInternals.LaserSpeedEvent

/**
 * Controls right rotating laser speed.
 * @param speed Speed of the rotating lasers.
 * @param direction Direction of the rotating lasers.
 * @param lockRotation Whether the existing rotation should be kept.
 */
export function rightLaserSpeed(
    ...params: [
        time: number,
        speed?: number,
        direction?: EventInternals.RingSpinEvent['direction'],
        lockRotation?: boolean,
    ] | [
        Omit<
            ConstructorParameters<typeof EventInternals.LaserSpeedEvent>[0],
            'type'
        >,
    ]
): EventInternals.LaserSpeedEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new EventInternals.LaserSpeedEvent({
            ...obj,
            type: EventGroup.RIGHT_ROTATING,
        })
    }
    const [time, speed, direction, lockRotation] = params

    return new EventInternals.LaserSpeedEvent({
        time,
        type: EventGroup.RIGHT_ROTATING,
        value: speed ?? 0,
        lockRotation,
        direction,
        speed,
    })
}

export function earlyRotation(
    time: number,
    rotation?: number,
): EventInternals.RotationEvent
export function earlyRotation(
    ...obj: [
        Omit<
            ConstructorParameters<typeof EventInternals.RotationEvent>[0],
            'type'
        >,
    ]
): EventInternals.RotationEvent

/**
 * Used for 360 mode, rotates future objects and active objects.
 * @param rotation The rotation of the event.
 * Must be a multiple of 15 between -60 and 60.
 */
export function earlyRotation(
    ...params: [
        time: number,
        rotation?: number,
    ] | [
        Omit<
            ConstructorParameters<typeof EventInternals.RotationEvent>[0],
            'type'
        >,
    ]
): EventInternals.RotationEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new EventInternals.RotationEvent({
            ...obj,
            type: EventGroup.EARLY_ROTATION,
        })
    }
    const [time, rotation] = params

    return new EventInternals.RotationEvent({
        time,
        type: EventGroup.EARLY_ROTATION,
        value: rotation ?? 0,
    })
}

export function lateRotation(
    time: number,
    rotation?: number,
): EventInternals.RotationEvent
export function lateRotation(
    ...obj: [
        Omit<
            ConstructorParameters<typeof EventInternals.RotationEvent>[0],
            'type'
        >,
    ]
): EventInternals.RotationEvent

/**
 * Used for 360 mode, rotates future objects only.
 * @param rotation The rotation of the event.
 * Must be a multiple of 15 between -60 and 60.
 */
export function lateRotation(
    ...params: [
        time: number,
        rotation?: number,
    ] | [
        Omit<
            ConstructorParameters<typeof EventInternals.RotationEvent>[0],
            'type'
        >,
    ]
): EventInternals.RotationEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new EventInternals.RotationEvent({
            ...obj,
            type: EventGroup.LATE_ROTATION,
        })
    }
    const [time, rotation] = params

    return new EventInternals.RotationEvent({
        time,
        type: EventGroup.LATE_ROTATION,
        value: rotation ?? 0,
    })
}
