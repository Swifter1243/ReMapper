import * as BasicEventInternals from "../../internals/lighting/basic_event.ts";
import {LightParameters} from "../v3_event/rotation.ts";

import {EventGroup} from "../../data/constants/basic_event.ts";

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

/** The bare minimum lighting_v3 event */
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