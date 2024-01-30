import { RotationDirection, RotationEase } from '../data/constants.ts'
import { DistributionType } from '../data/constants.ts'
import * as LightingV3Internals from '../internals/lighting_v3.ts'
import { LightColor, LightTransition } from '../mod.ts'
import { bsmap } from '../mod.ts'

//! Event Box Groups
type BoxGroupParameters<T extends bsmap.v3.IEventBox> = [
    beat?: number,
    groupID?: number,
    boxes?: LightingV3Internals.EventBox<T>[],
] | [
    ...obj: [
        ConstructorParameters<
            typeof LightingV3Internals.EventBoxGroup<T>
        >[0],
    ],
]

function createBoxGroup<T extends bsmap.v3.IEventBox>(
    ...params: BoxGroupParameters<T>
): ConstructorParameters<
    typeof LightingV3Internals.EventBoxGroup<T>
> {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return [obj]
    }

    const [beat, groupID, boxes] = params

    return [{
        beat: beat,
        groupID: groupID,
        boxes: boxes ?? [],
    }]
}

export function lightColorEventBoxGroup(
    ...params: BoxGroupParameters<bsmap.v3.ILightColorEventBox>
) {
    return new LightingV3Internals.LightColorEventBoxGroup(
        ...createBoxGroup(...params),
    )
}

export function lightRotationEventBoxGroup(
    ...params: BoxGroupParameters<bsmap.v3.ILightRotationEventBox>
) {
    return new LightingV3Internals.LightRotationEventBoxGroup(
        ...createBoxGroup(...params),
    )
}

export function lightTranslationEventBoxGroup(
    ...params: BoxGroupParameters<bsmap.v3.ILightTranslationEventBox>
) {
    return new LightingV3Internals.LightTranslationEventBoxGroup(
        ...createBoxGroup(...params),
    )
}

//! Event Boxes
type BoxParameters<T extends bsmap.v3.IEventBox> = [
    beatDistributionType?: DistributionType,
    beatDistribution?: number,
    filter?: bsmap.v3.IIndexFilter,
    distributionEasing?: RotationEase,
] | [
    ...obj: [
        ConstructorParameters<
            typeof LightingV3Internals.EventBox<T>
        >[0],
    ],
]

function createBox<T extends bsmap.v3.IEventBox>(
    ...params: BoxParameters<T>
): ConstructorParameters<
    typeof LightingV3Internals.EventBox<T>
> {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return [obj]
    }

    const [beatDistributionType, beatDistribution, filter, distributionEasing] =
        params

    return [{
        beatDistributionType: beatDistributionType,
        beatDistribution: beatDistribution,
        filter: filter,
        distributionEasing: distributionEasing,
    }] as ConstructorParameters<
        typeof LightingV3Internals.EventBox<T>
    >
}

export function lightColorEventBox(
    ...params: BoxParameters<bsmap.v3.ILightColorEventBox>
) {
    return new LightingV3Internals.LightColorEventBox(
        ...createBox(...params),
    )
}

export function lightRotationEventBox(
    ...params: BoxParameters<bsmap.v3.ILightRotationEventBox>
) {
    return new LightingV3Internals.LightRotationEventBox(
        ...createBox(...params),
    )
}

export function lightTranslationEventBox(
    ...params: BoxParameters<bsmap.v3.ILightTranslationEventBox>
) {
    return new LightingV3Internals.LightTranslationEventBox(
        ...createBox(...params),
    )
}

//! Events
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
        value?: number,
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
        value,
        easing,
        usePreviousEventTranslation,
    ] = params

    return new LightingV3Internals.LightTranslationEvent({
        beat,
        value,
        easing,
        usePreviousEventTranslation,
    })
}