//! Event Boxes
import * as LightingV3Internals from '../../../internals/lighting/lighting_v3.ts'
import { bsmap } from '../../../deps.ts'
import {DistributionType, RotationEase} from "../../../data/constants/v3_event.ts";

type BoxParameters<
    T extends bsmap.v3.IEventBox,
    E extends LightingV3Internals.BaseLightEvent,
> = [
    beatDistributionType?: DistributionType,
    beatDistribution?: number,
    filter?: bsmap.v3.IIndexFilter,
    distributionEasing?: RotationEase,
] | [
    ...obj: [
        ConstructorParameters<
            typeof LightingV3Internals.EventBox<T, E>
        >[0],
    ],
]

function createBox<
    T extends bsmap.v3.IEventBox,
    E extends LightingV3Internals.BaseLightEvent,
>(
    ...params: BoxParameters<T, E>
): ConstructorParameters<
    typeof LightingV3Internals.EventBox<T, E>
> {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return [obj]
    }

    const [beatDistributionType, beatDistribution, filter, distributionEasing] = params

    return [{
        beatDistributionType,
        beatDistribution,
        filter,
        distributionEasing,
    }] as ConstructorParameters<
        typeof LightingV3Internals.EventBox<T, E>
    >
}

export function lightColorEventBox(
    ...params: BoxParameters<
        bsmap.v3.ILightColorEventBox,
        LightingV3Internals.LightColorEvent
    >
) {
    return new LightingV3Internals.LightColorEventBox(
        ...createBox(...params),
    )
}

export function lightRotationEventBox(
    ...params: BoxParameters<
        bsmap.v3.ILightRotationEventBox,
        LightingV3Internals.LightRotationEvent
    >
) {
    return new LightingV3Internals.LightRotationEventBox(
        ...createBox(...params),
    )
}

export function lightTranslationEventBox(
    ...params: BoxParameters<
        bsmap.v3.ILightTranslationEventBox,
        LightingV3Internals.LightTranslationEvent
    >
) {
    return new LightingV3Internals.LightTranslationEventBox(
        ...createBox(...params),
    )
}
