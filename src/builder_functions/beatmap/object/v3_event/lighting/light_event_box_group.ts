//! Event Box Groups
import {bsmap} from '../../../../../deps.ts'
import {LightEventBox} from "../../../../../internals/beatmap/object/v3_event/lighting/light_event_box/base.ts";
import {
    LightEventBoxGroup
} from "../../../../../internals/beatmap/object/v3_event/lighting/light_event_box_group/base.ts";
import {
    LightColorEventBoxGroup
} from "../../../../../internals/beatmap/object/v3_event/lighting/light_event_box_group/color.ts";
import {
    LightRotationEventBoxGroup
} from "../../../../../internals/beatmap/object/v3_event/lighting/light_event_box_group/rotation.ts";
import {
    LightTranslationEventBoxGroup
} from "../../../../../internals/beatmap/object/v3_event/lighting/light_event_box_group/translation.ts";
import {AbstractDifficulty} from "../../../../../internals/beatmap/abstract_beatmap.ts";

type BoxGroupParameters<T extends bsmap.v3.IEventBox> = [
    parentDifficulty: AbstractDifficulty,
    beat?: number,
    groupID?: number,
    boxes?: LightEventBox<T>[],
] | ConstructorParameters<
    typeof LightEventBoxGroup<T>
>

function createBoxGroup<T extends bsmap.v3.IEventBox>(
    ...params: BoxGroupParameters<T>
): ConstructorParameters<typeof LightEventBoxGroup<T>> {
    if (typeof params[1] === 'object') {
        const [parentDifficulty, obj] = params
        return [parentDifficulty, obj]
    }

    const [parentDifficulty, beat, groupID, boxes] = params

    return [parentDifficulty, {
        beat,
        groupID,
        boxes,
    }]
}

/** Create a group of `LightColorEventBox`s */
export function lightColorEventBoxGroup(
    ...params: BoxGroupParameters<bsmap.v3.ILightColorEventBox>
) {
    return new LightColorEventBoxGroup(
        ...createBoxGroup(...params),
    )
}

/** Create a group of `LightRotationEventBox`s */
export function lightRotationEventBoxGroup(
    ...params: BoxGroupParameters<bsmap.v3.ILightRotationEventBox>
) {
    return new LightRotationEventBoxGroup(
        ...createBoxGroup(...params),
    )
}

/** Create a group of `LightTranslationEventBox`s */
export function lightTranslationEventBoxGroup(
    ...params: BoxGroupParameters<bsmap.v3.ILightTranslationEventBox>
) {
    return new LightTranslationEventBoxGroup(
        ...createBoxGroup(...params),
    )
}
