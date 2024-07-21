//! Event Box Groups
import {bsmap} from '../../../../../deps.ts'
import {LightEventBoxGroup} from "../../../internals/v3_event/lighting/light_event_box_group/base.ts";
import {LightColorEventBoxGroup} from "../../../internals/v3_event/lighting/light_event_box_group/color.ts";
import {LightRotationEventBoxGroup} from "../../../internals/v3_event/lighting/light_event_box_group/rotation.ts";
import {LightTranslationEventBoxGroup} from "../../../internals/v3_event/lighting/light_event_box_group/translation.ts";
import {LightEventBox} from "../../../internals/v3_event/lighting/light_event_box/base.ts";

type BoxGroupParameters<T extends bsmap.v3.IEventBox> = [
    beat?: number,
    groupID?: number,
    boxes?: LightEventBox<T>[],
] | [
    ...obj: [
        ConstructorParameters<
            typeof LightEventBoxGroup<T>
        >[0],
    ],
]

function createBoxGroup<T extends bsmap.v3.IEventBox>(
    ...params: BoxGroupParameters<T>
): ConstructorParameters<
    typeof LightEventBoxGroup<T>
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
    return new LightColorEventBoxGroup(
        ...createBoxGroup(...params),
    )
}

export function lightRotationEventBoxGroup(
    ...params: BoxGroupParameters<bsmap.v3.ILightRotationEventBox>
) {
    return new LightRotationEventBoxGroup(
        ...createBoxGroup(...params),
    )
}

export function lightTranslationEventBoxGroup(
    ...params: BoxGroupParameters<bsmap.v3.ILightTranslationEventBox>
) {
    return new LightTranslationEventBoxGroup(
        ...createBoxGroup(...params),
    )
}
