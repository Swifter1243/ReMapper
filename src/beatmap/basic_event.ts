import { bsmap } from '../deps.ts'

import { EventGroup, InterscopeGroup } from '../data/constants.ts'

import * as BasicEventInternals from '../internals/basic_event.ts'
import { BaseEvent } from '../internals/basic_event.ts'
import { BoostEvent, CommunityBPMEvent, OfficialBPMEvent, RotationEvent } from '../internals/event.ts'

type LightParameters =
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

function fixupParams<TG extends BasicEventInternals.LightEvent['type']>(
    group: TG,
    ...params: LightParameters
): ConstructorParameters<typeof BasicEventInternals.LightEvent> {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return [obj]
    }

    const [beat, value, floatValue] = params

    return [{
        beat: beat ?? 0,
        customData: {},
        floatValue: floatValue ?? 1,
        value: value ?? 1,
        type: group,
    }] satisfies ConstructorParameters<typeof BasicEventInternals.LightEvent>
}

export function baseBasicEvent(
    beat: number,
    type?: number,
    value?: number,
    floatValue?: number,
): BasicEventInternals.BaseBasicEvent
export function baseBasicEvent(
    ...obj: ConstructorParameters<typeof BasicEventInternals.BaseBasicEvent>
): BasicEventInternals.BaseBasicEvent

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

export function lightEvent(
    beat: number,
    type?: number,
    value?: number,
    floatValue?: number,
): BasicEventInternals.LightEvent
export function lightEvent(
    ...obj: ConstructorParameters<typeof BasicEventInternals.LightEvent>
): BasicEventInternals.LightEvent

export function lightEvent(
    ...params: [
        beat: number,
        type?: number,
        value?: number,
        floatValue?: number,
    ] | ConstructorParameters<typeof BasicEventInternals.LightEvent>
): BasicEventInternals.LightEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new BasicEventInternals.LightEvent({
            ...obj,
        })
    }
    const [beat, type, value, floatValue] = params

    return new BasicEventInternals.LightEvent({
        beat,
        type: type ?? 0,
        value: value ?? 0,
        floatValue,
    })
}

/** Make a light event from any type */
export function fromType(type: number, ...params: LightParameters) {
    return new BasicEventInternals.LightEvent(
        ...fixupParams(type, ...params),
    )
}

/** Controls the back lasers. (Type 0) */
export function backLasers(...params: LightParameters) {
    return new BasicEventInternals.LightEvent(
        ...fixupParams(EventGroup.BACK_LASERS, ...params),
    )
}

/** Controls the ring lights. (Type 1) */
export function ringLights(...params: LightParameters) {
    return new BasicEventInternals.LightEvent(
        ...fixupParams(EventGroup.RING_LIGHTS, ...params),
    )
}

/** Controls the left lasers. (Type 2) */
export function leftLasers(...params: LightParameters) {
    return new BasicEventInternals.LightEvent(
        ...fixupParams(EventGroup.LEFT_LASERS, ...params),
    )
}

/** Controls the right lasers. (Type 3) */
export function rightLasers(...params: LightParameters) {
    return new BasicEventInternals.LightEvent(
        ...fixupParams(EventGroup.RIGHT_LASERS, ...params),
    )
}

/** Controls the center lasers. (Type 4) */
export function centerLasers(...params: LightParameters) {
    return new BasicEventInternals.LightEvent(
        ...fixupParams(EventGroup.CENTER_LASERS, ...params),
    )
}

/** Controls the extra left lasers in some environments. (Type 6) */
export function extraLeft(...params: LightParameters) {
    return new BasicEventInternals.LightEvent(
        ...fixupParams(EventGroup.LEFT_EXTRA, ...params),
    )
}

/** Controls the extra right lasers in some environments. (Type 7) */
export function extraRight(...params: LightParameters) {
    return new BasicEventInternals.LightEvent(
        ...fixupParams(EventGroup.RIGHT_EXTRA, ...params),
    )
}

/** Controls the left lasers in the Billie environment. (Type 10) */
export function billieLeft(...params: LightParameters) {
    return new BasicEventInternals.LightEvent(
        ...fixupParams(EventGroup.BILLIE_LEFT, ...params),
    )
}

/** Controls the right lasers in the Billie environment. (Type 11) */
export function billieRight(...params: LightParameters) {
    return new BasicEventInternals.LightEvent(
        ...fixupParams(EventGroup.BILLIE_RIGHT, ...params),
    )
}

/** Controls the outer left tower height in the Gaga environment. (Type 18) */
export function gagaLeft(...params: LightParameters) {
    return new BasicEventInternals.LightEvent(
        ...fixupParams(EventGroup.GAGA_LEFT, ...params),
    )
}

/** Controls the outer left tower height in the Gaga environment. (Type 19) */
export function gagaRight(...params: LightParameters) {
    return new BasicEventInternals.LightEvent(
        ...fixupParams(EventGroup.GAGA_RIGHT, ...params),
    )
}

/**
 * Move cars in the interscope environment.
 * @param value The group of cars to target.
 */
export function moveCars(
    ...params: Omit<
        ConstructorParameters<typeof BasicEventInternals.RingSpinEvent>,
        'type'
    >
): BasicEventInternals.RingSpinEvent
export function moveCars(
    beat: number,
    value: InterscopeGroup,
): BasicEventInternals.RingSpinEvent
export function moveCars(
    ...params:
        | [beat: number, value: InterscopeGroup]
        | Omit<
            ConstructorParameters<typeof BasicEventInternals.RingSpinEvent>,
            'type'
        >
) {
    if (typeof params[0] === 'object') {
        return new BasicEventInternals.RingSpinEvent(params[0])
    }
    const [beat, value] = params

    return new BasicEventInternals.RingSpinEvent({
        beat: beat,
        value: value as InterscopeGroup,
    })
}

// TODO: Event extras
/** Lower the hydraulics of the cars in the interscope environment. */
export function lowerHydraulics(beat: number) {
    return new BasicEventInternals.LightEvent({
        beat: beat,
        type: EventGroup.LOWER_HYDRAULICS,
        value: 0,
    })
}

/** Raise the hydraulics of the cars in the interscope environment. */
export function raiseHydraulics(beat: number) {
    return new BasicEventInternals.LightEvent({
        beat: beat,
        type: EventGroup.RAISE_HYDRAULICS,
        value: 0,
    })
}

export function ringSpin(
    beat: number,
    rotation?: number,
    direction?: BasicEventInternals.RingSpinEvent['direction'],
    step?: number,
    speed?: number,
    prop?: number,
    nameFilter?: string,
): BasicEventInternals.RingSpinEvent
export function ringSpin(
    ...obj: ConstructorParameters<typeof BasicEventInternals.RingSpinEvent>
): BasicEventInternals.RingSpinEvent

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
        beat: number,
        rotation?: number,
        direction?: BasicEventInternals.RingSpinEvent['direction'],
        step?: number,
        speed?: number,
        prop?: number,
        nameFilter?: string,
    ] | ConstructorParameters<typeof BasicEventInternals.RingSpinEvent>
): BasicEventInternals.RingSpinEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new BasicEventInternals.RingSpinEvent(obj)
    }
    const [beat, rotation, direction, step, speed, prop, nameFilter] = params

    return new BasicEventInternals.RingSpinEvent({
        beat,
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
    beat: number,
    speed?: number,
): BasicEventInternals.RingZoomEvent
export function ringZoom(
    ...obj: ConstructorParameters<typeof BasicEventInternals.RingZoomEvent>
): BasicEventInternals.RingZoomEvent

/**
 * Controls ring zoom.
 * @param step The position offset between each ring.
 * @param speed The speed of the zoom.
 */
export function ringZoom(
    ...params: [
        beat: number,
        rotation?: number,
        direction?: BasicEventInternals.RingSpinEvent['direction'],
        step?: number,
        speed?: number,
        prop?: number,
        nameFilter?: string,
    ] | ConstructorParameters<typeof BasicEventInternals.RingZoomEvent>
): BasicEventInternals.RingZoomEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new BasicEventInternals.RingZoomEvent(obj)
    }
    const [beat, speed] = params

    return new BasicEventInternals.RingZoomEvent({
        beat,
        value: speed ?? 0,
        speed,
    })
}

export function leftLaserSpeed(
    beat: number,
    speed?: number,
    direction?: BasicEventInternals.RingSpinEvent['direction'],
    lockRotation?: boolean,
): BasicEventInternals.LaserSpeedEvent
export function leftLaserSpeed(
    ...obj: [
        Omit<
            ConstructorParameters<
                typeof BasicEventInternals.LaserSpeedEvent
            >[0],
            'type'
        >,
    ]
): BasicEventInternals.LaserSpeedEvent

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

export function rightLaserSpeed(
    beat: number,
    speed?: number,
    direction?: BasicEventInternals.RingSpinEvent['direction'],
    lockRotation?: boolean,
): BasicEventInternals.LaserSpeedEvent
export function rightLaserSpeed(
    ...obj: [
        Omit<
            ConstructorParameters<
                typeof BasicEventInternals.LaserSpeedEvent
            >[0],
            'type'
        >,
    ]
): BasicEventInternals.LaserSpeedEvent

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

export function earlyRotation(
    beat: number,
    rotation?: number,
): RotationEvent
export function earlyRotation(
    ...obj: ConstructorParameters<typeof RotationEvent>
): RotationEvent

/**
 * Used for 360 mode, rotates future objects and active objects.
 * @param rotation The rotation of the event.
 * Must be a multiple of 15 between -60 and 60.
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

export function lateRotation(
    beat: number,
    rotation?: number,
): RotationEvent
export function lateRotation(
    ...obj: ConstructorParameters<typeof RotationEvent>
): RotationEvent

/**
 * Used for 360 mode, rotates future objects only.
 * @param rotation The rotation of the event.
 * Must be a multiple of 15 between -60 and 60.
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

export function boost(
    beat: number,
    boost: boolean,
): BoostEvent
export function boost(
    ...obj: ConstructorParameters<typeof BoostEvent>
): BoostEvent

export function boost(
    ...params: [
        beat: number,
        boost: boolean,
    ] | ConstructorParameters<typeof BoostEvent>
): BoostEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new BoostEvent({
            ...obj,
        })
    }
    const [beat, boost] = params

    return new BoostEvent({
        beat,
        boost,
    })
}

export type AbstractEvent = BaseEvent<
    bsmap.v2.IEvent,
    bsmap.v3.IBasicEvent
>


export function officialBpmEvent(
    beat: number,
    bpm: number,
): OfficialBPMEvent
export function officialBpmEvent(
    ...obj: ConstructorParameters<typeof OfficialBPMEvent>
): OfficialBPMEvent

export function officialBpmEvent(
    ...params: [
        beat: number,
        bpm: number,
    ] | ConstructorParameters<typeof OfficialBPMEvent>
): OfficialBPMEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new OfficialBPMEvent({
            ...obj,
        })
    }
    const [beat, bpm] = params

    return new OfficialBPMEvent({
        beat,
        bpm,
    })
}

export function communityBpmEvent(
    beat: number,
    bpm: number,
): CommunityBPMEvent
export function communityBpmEvent(
    ...obj: ConstructorParameters<typeof CommunityBPMEvent>
): CommunityBPMEvent

export function communityBpmEvent(
    ...params: [
        beat: number,
        bpm: number,
    ] | ConstructorParameters<typeof CommunityBPMEvent>
): CommunityBPMEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new CommunityBPMEvent({
            ...obj,
        })
    }
    const [beat, bpm] = params

    return new CommunityBPMEvent({
        beat,
        bpm,
    })
}