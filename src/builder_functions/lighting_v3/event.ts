//! Events
import {
    LightColor,
    LightTransition,
    RotationDirection,
    RotationEase,
} from '../../data/constants.ts'
import * as LightingV3Internals from '../../internals/lighting/lighting_v3.ts'

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
                typeof LightingV3Internals.LightColorEvent
            >[0],
        ],
    ]
): LightingV3Internals.LightColorEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new LightingV3Internals.LightColorEvent(obj)
    }

    const [beat, color, brightness, transitionType, blinkingFrequency] = params

    return new LightingV3Internals.LightColorEvent({
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
                typeof LightingV3Internals.LightRotationEvent
            >[0],
        ],
    ]
): LightingV3Internals.LightRotationEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new LightingV3Internals.LightRotationEvent(obj)
    }

    const [
        beat,
        rotationDegrees,
        rotationDirection,
        loopCount,
        easing,
        usePreviousEventRotation,
    ] = params

    return new LightingV3Internals.LightRotationEvent({
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
