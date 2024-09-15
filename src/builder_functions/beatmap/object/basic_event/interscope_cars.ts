import { EventGroup, InterscopeGroup } from '../../../../constants/basic_event.ts'
import { LightEvent } from '../../../../internals/beatmap/object/basic_event/light_event.ts'

import { RingSpinEvent } from '../../../../internals/beatmap/object/basic_event/ring_spin.ts'

type MoveCarsParams = Omit<ConstructorParameters<typeof RingSpinEvent>, 'type'>

/**
 * Move cars in the interscope environment.
 * @param beat The beat of the event.
 * @param value The group of cars to target.
 */
export function moveCars(beat: number, value: InterscopeGroup): RingSpinEvent
export function moveCars(...params: MoveCarsParams): RingSpinEvent
export function moveCars(
    ...params:
        | [beat: number, value: InterscopeGroup]
        | MoveCarsParams
): RingSpinEvent {
    if (typeof params[0] === 'object') {
        return new RingSpinEvent(params[0])
    }
    const [beat, value] = params

    return new RingSpinEvent({
        beat: beat,
        value: value as InterscopeGroup,
    })
}

// TODO: Event extras
/** Lower the hydraulics of the cars in the interscope environment. */
export function lowerHydraulics(beat: number) {
    return new LightEvent({
        beat: beat,
        type: EventGroup.LOWER_HYDRAULICS,
        value: 0,
    })
}

/** Raise the hydraulics of the cars in the interscope environment. */
export function raiseHydraulics(beat: number) {
    return new LightEvent({
        beat: beat,
        type: EventGroup.RAISE_HYDRAULICS,
        value: 0,
    })
}
