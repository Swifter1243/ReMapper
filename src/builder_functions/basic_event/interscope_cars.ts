import { EventGroup, InterscopeGroup } from '../../data/constants.ts'
import * as BasicEventInternals from '../../internals/lighting/basic_event.ts'

/**
 * Move cars in the interscope environment.
 * @param value The group of cars to target.
 */
export function moveCars(
    ...params:
        | [beat: number, value: InterscopeGroup]
        | Omit<
            ConstructorParameters<typeof BasicEventInternals.RingSpinEvent>,
            'type'
        >
) {
    if (typeof params[0] === 'object') {
        return new BasicEventInternals.RingSpinEvent(params[0])
    }
    const [beat, value] = params

    return new BasicEventInternals.RingSpinEvent({
        beat: beat,
        value: value as InterscopeGroup,
    })
}

// TODO: Event extras
/** Lower the hydraulics of the cars in the interscope environment. */
export function lowerHydraulics(beat: number) {
    return new BasicEventInternals.LightEvent({
        beat: beat,
        type: EventGroup.LOWER_HYDRAULICS,
        value: 0,
    })
}

/** Raise the hydraulics of the cars in the interscope environment. */
export function raiseHydraulics(beat: number) {
    return new BasicEventInternals.LightEvent({
        beat: beat,
        type: EventGroup.RAISE_HYDRAULICS,
        value: 0,
    })
}
