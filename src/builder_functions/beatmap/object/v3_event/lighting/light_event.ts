import { LightColor, LightTransition, RotationDirection, RotationEase } from '../../../../../constants/v3_event.ts'
import { LightColorEvent } from '../../../../../internals/beatmap/object/v3_event/lighting/light_event/color.ts'
import { LightRotationEvent } from '../../../../../internals/beatmap/object/v3_event/lighting/light_event/rotation.ts'
import { LightTranslationEvent } from '../../../../../internals/beatmap/object/v3_event/lighting/light_event/translation.ts'
import { AbstractDifficulty } from '../../../../../internals/beatmap/abstract_beatmap.ts'
import { LightColorEventBox } from '../../../../../internals/beatmap/object/v3_event/lighting/light_event_box/color.ts'
import { LightRotationEventBox } from '../../../../../internals/beatmap/object/v3_event/lighting/light_event_box/rotation.ts'
import { LightTranslationEventBox } from '../../../../../internals/beatmap/object/v3_event/lighting/light_event_box/translation.ts'

/** Make a light color event that goes into a LightColorEventBox */
export function lightColorEvent(
    ...params:
        | [
            parent: LightColorEventBox,
            beat?: number,
            color?: LightColor,
            brightness?: number,
            transitionType?: LightTransition,
            blinkingFrequency?: number,
        ]
        | ConstructorParameters<
            typeof LightColorEvent
        >
): LightColorEvent {
    if (typeof params[1] === 'object') {
        const [parent, obj] = params
        return new LightColorEvent(parent, obj)
    }

    const [parent, beat, color, brightness, transitionType, blinkingFrequency] = params

    return new LightColorEvent(parent, {
        beat,
        color,
        brightness,
        transitionType,
        blinkingFrequency,
    })
}

/** Make a light rotation event that goes into a LightRotationEventBox */
export function lightRotationEvent(
    ...params:
        | [
            parent: LightRotationEventBox,
            beat?: number,
            rotationDegrees?: number,
            rotationDirection?: RotationDirection,
            loopCount?: number,
            easing?: RotationEase,
            usePreviousEventRotation?: boolean,
        ]
        | ConstructorParameters<
            typeof LightRotationEvent
        >
): LightRotationEvent {
    if (typeof params[1] === 'object') {
        const [parent, obj] = params
        return new LightRotationEvent(parent, obj)
    }

    const [
        parent,
        beat,
        rotationDegrees,
        rotationDirection,
        loopCount,
        easing,
        usePreviousEventRotation,
    ] = params

    return new LightRotationEvent(parent, {
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
    ...params:
        | [
            parent: LightTranslationEventBox,
            beat?: number,
            magnitude?: number,
            easing?: RotationEase,
            usePreviousEventTranslation?: boolean,
        ]
        | ConstructorParameters<
            typeof LightTranslationEvent
        >
): LightTranslationEvent {
    if (typeof params[1] === 'object') {
        const [parent, obj] = params
        return new LightTranslationEvent(parent, obj)
    }

    const [
        parent,
        beat,
        magnitude,
        easing,
        usePreviousEventTranslation,
    ] = params

    return new LightTranslationEvent(parent, {
        beat,
        magnitude,
        easing,
        usePreviousEventTranslation,
    })
}
