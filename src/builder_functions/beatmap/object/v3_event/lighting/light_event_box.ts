//! Event Boxes
import * as LightingV3Internals from '../../../internals/v3_event/lighting/light_event/translation.ts'
import {bsmap} from '../../../../../deps.ts'
import {DistributionType, RotationEase} from "../../../../../data/constants/v3_event.ts";
import {LightEventBox} from "../../../internals/v3_event/lighting/light_event_box/base.ts";
import {LightColorEventBox} from "../../../internals/v3_event/lighting/light_event_box/color.ts";
import {LightRotationEventBox} from "../../../internals/v3_event/lighting/light_event_box/rotation.ts";
import {LightTranslationEventBox} from "../../../internals/v3_event/lighting/light_event_box/translation.ts";
import {BaseLightEvent} from "../../../internals/v3_event/lighting/light_event/base.ts";
import {LightColorEvent} from "../../../internals/v3_event/lighting/light_event/color.ts";
import {LightRotationEvent} from "../../../internals/v3_event/lighting/light_event/rotation.ts";

type BoxParameters<
    T extends bsmap.v3.IEventBox,
    E extends BaseLightEvent,
> = [
    beatDistributionType?: DistributionType,
    beatDistribution?: number,
    filter?: bsmap.v3.IIndexFilter,
    distributionEasing?: RotationEase,
] | [
    ...obj: [
        ConstructorParameters<
            typeof LightEventBox<T, E>
        >[0],
    ],
]

function createBox<
    T extends bsmap.v3.IEventBox,
    E extends BaseLightEvent,
>(
    ...params: BoxParameters<T, E>
): ConstructorParameters<
    typeof LightEventBox<T, E>
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
        typeof LightEventBox<T, E>
    >
}

export function lightColorEventBox(
    ...params: BoxParameters<
        bsmap.v3.ILightColorEventBox,
        LightColorEvent
    >
) {
    return new LightColorEventBox(
        ...createBox(...params),
    )
}

export function lightRotationEventBox(
    ...params: BoxParameters<
        bsmap.v3.ILightRotationEventBox,
        LightRotationEvent
    >
) {
    return new LightRotationEventBox(
        ...createBox(...params),
    )
}

export function lightTranslationEventBox(
    ...params: BoxParameters<
        bsmap.v3.ILightTranslationEventBox,
        LightingV3Internals.LightTranslationEvent
    >
) {
    return new LightTranslationEventBox(
        ...createBox(...params),
    )
}
