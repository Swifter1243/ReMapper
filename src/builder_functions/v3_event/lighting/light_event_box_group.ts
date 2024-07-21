//! Event Box Groups
import { bsmap } from '../../../deps.ts'
import * as LightingV3Internals from '../../../internals/lighting/lighting_v3.ts'

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
