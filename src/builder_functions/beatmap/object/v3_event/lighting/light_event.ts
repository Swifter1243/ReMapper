import {LightColor, LightTransition, RotationDirection, RotationEase} from "../../../../../constants/v3_event.ts";
import {LightColorEvent} from "../../../../../internals/beatmap/object/v3_event/lighting/light_event/color.ts";
import {LightRotationEvent} from "../../../../../internals/beatmap/object/v3_event/lighting/light_event/rotation.ts";
import {
    LightTranslationEvent
} from "../../../../../internals/beatmap/object/v3_event/lighting/light_event/translation.ts";

/** Make a light color event that goes into a LightColorEventBox */
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

/** Make a light rotation event that goes into a LightRotationEventBox */
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

/** Make a light translation event that goes into a LightTranslationEventBox */
export function lightTranslationEvent(
    ...params: [
        beat?: number,
        magnitude?: number,
        easing?: RotationEase,
        usePreviousEventTranslation?: boolean,
    ] | [
        ...obj: [
            ConstructorParameters<
                typeof LightTranslationEvent
            >[0],
        ],
    ]
): LightTranslationEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new LightTranslationEvent(obj)
    }

    const [
        beat,
        magnitude,
        easing,
        usePreviousEventTranslation,
    ] = params

    return new LightTranslationEvent({
        beat,
        magnitude,
        easing,
        usePreviousEventTranslation,
    })
}
