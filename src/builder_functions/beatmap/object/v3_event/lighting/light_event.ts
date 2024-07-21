//! Events
import * as LightingV3Internals from '../../../internals/v3_event/lighting/light_event/translation.ts'
import {LightColor, LightTransition, RotationDirection, RotationEase} from "../../../../../data/constants/v3_event.ts";
import {LightColorEvent} from "../../../internals/v3_event/lighting/light_event/color.ts";
import {LightRotationEvent} from "../../../internals/v3_event/lighting/light_event/rotation.ts";

export function lightColorEvent(
    ...params: [
        beat?: number,
        color?: LightColor,
        brightness?: number,
        transitionType?: LightTransition,
        blinkingFrequency?: number,
    ] | [
        ...obj: [
            ConstructorParameters<
                typeof LightColorEvent
            >[0],
        ],
    ]
): LightColorEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new LightColorEvent(obj)
    }

    const [beat, color, brightness, transitionType, blinkingFrequency] = params

    return new LightColorEvent({
        beat,
        color,
        brightness,
        transitionType,
        blinkingFrequency,
    })
}

export function lightRotationEvent(
    ...params: [
        beat?: number,
        rotationDegrees?: number,
        rotationDirection?: RotationDirection,
        loopCount?: number,
        easing?: RotationEase,
        usePreviousEventRotation?: boolean,
    ] | [
        ...obj: [
            ConstructorParameters<
                typeof LightRotationEvent
            >[0],
        ],
    ]
): LightRotationEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new LightRotationEvent(obj)
    }

    const [
        beat,
        rotationDegrees,
        rotationDirection,
        loopCount,
        easing,
        usePreviousEventRotation,
    ] = params

    return new LightRotationEvent({
        beat,
        rotationDegrees,
        rotationDirection,
        loopCount,
        easing,
        usePreviousEventRotation,
    })
}

export function lightTranslationEvent(
    ...params: [
        beat?: number,
        magnitude?: number,
        easing?: RotationEase,
        usePreviousEventTranslation?: boolean,
    ] | [
        ...obj: [
            ConstructorParameters<
                typeof LightingV3Internals.LightTranslationEvent
            >[0],
        ],
    ]
): LightingV3Internals.LightTranslationEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new LightingV3Internals.LightTranslationEvent(obj)
    }

    const [
        beat,
        magnitude,
        easing,
        usePreviousEventTranslation,
    ] = params

    return new LightingV3Internals.LightTranslationEvent({
        beat,
        magnitude,
        easing,
        usePreviousEventTranslation,
    })
}
