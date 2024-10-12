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
import {
    LightEventBoxGroup
} from "../../../../../internals/beatmap/object/v3_event/lighting/light_event_box_group/base.ts";

type BoxParameters<
    T extends typeof LightEventBox<E>,
    E extends bsmap.v3.IEventBox = bsmap.v3.IEventBox
> = [
    parent: LightEventBoxGroup<E>,
    beatDistributionType?: DistributionType,
    beatDistribution?: number,
    filter?: bsmap.v3.IIndexFilter,
    distributionEasing?: RotationEase,
] | ConstructorParameters<T>

function createBox<
    T extends typeof LightEventBox<E>,
    E extends bsmap.v3.IEventBox = bsmap.v3.IEventBox
>(
    ...params: BoxParameters<T, E>
): ConstructorParameters<T> {
    if (typeof params[1] === 'object') {
        const [parent, obj] = params
        return [parent, obj] as ConstructorParameters<T>
    }

    const [parent, beatDistributionType, beatDistribution, filter, distributionEasing] = params

    return [parent, {
        beatDistributionType,
        beatDistribution,
        filter,
        distributionEasing,
    }] as ConstructorParameters<T>
}

/** Create an event box of `LightColorEvent`s */
export function lightColorEventBox(
    ...params: BoxParameters<typeof LightColorEventBox>
) {
    return new LightColorEventBox(
        ...createBox(...params),
    )
}

/** Create an event box of `LightRotationEvent`s */
export function lightRotationEventBox(
    ...params: BoxParameters<typeof LightRotationEventBox>
) {
    return new LightRotationEventBox(
        ...createBox(...params),
    )
}

/** Create an event box of `LightTranslationEvent`s */
export function lightTranslationEventBox(
    ...params: BoxParameters<typeof LightTranslationEventBox>
) {
    return new LightTranslationEventBox(
        ...createBox(...params),
    )
}
