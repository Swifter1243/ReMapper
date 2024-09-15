import {bsmap} from '../../../../../deps.ts'
import {BaseLightEvent} from "../../../../../internals/beatmap/object/v3_event/lighting/light_event/base.ts";
import {DistributionType, RotationEase} from "../../../../../constants/v3_event.ts";
import {LightEventBox} from "../../../../../internals/beatmap/object/v3_event/lighting/light_event_box/base.ts";
import {LightColorEvent} from "../../../../../internals/beatmap/object/v3_event/lighting/light_event/color.ts";
import {LightColorEventBox} from "../../../../../internals/beatmap/object/v3_event/lighting/light_event_box/color.ts";
import {LightRotationEvent} from "../../../../../internals/beatmap/object/v3_event/lighting/light_event/rotation.ts";
import {
    LightRotationEventBox
} from "../../../../../internals/beatmap/object/v3_event/lighting/light_event_box/rotation.ts";
import {
    LightTranslationEvent
} from "../../../../../internals/beatmap/object/v3_event/lighting/light_event/translation.ts";
import {
    LightTranslationEventBox
} from "../../../../../internals/beatmap/object/v3_event/lighting/light_event_box/translation.ts";

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

/** Create an event box of `LightColorEvent`s */
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

/** Create an event box of `LightRotationEvent`s */
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

/** Create an event box of `LightTranslationEvent`s */
export function lightTranslationEventBox(
    ...params: BoxParameters<
        bsmap.v3.ILightTranslationEventBox,
        LightTranslationEvent
    >
) {
    return new LightTranslationEventBox(
        ...createBox(...params),
    )
}
