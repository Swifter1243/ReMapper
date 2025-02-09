import { EventGroup, InterscopeGroup } from '../../../../constants/basic_event.ts'
import { LightEvent } from '../../../../internals/beatmap/object/basic_event/light_event.ts'

import { RingSpinEvent } from '../../../../internals/beatmap/object/basic_event/ring_spin.ts'
import {AbstractDifficulty} from "../../../../internals/beatmap/abstract_difficulty.ts";

type MoveCarsParams = Omit<ConstructorParameters<typeof RingSpinEvent>, 'type'>

/**
 * Move cars in the interscope environment.
 * @param parentDifficulty The difficulty to add this event to.
 * @param beat The beat of the event.
 * @param value The group of cars to target.
 */
export function moveCars(parentDifficulty: AbstractDifficulty,beat: number, value: InterscopeGroup): RingSpinEvent
export function moveCars(...params: MoveCarsParams): RingSpinEvent
export function moveCars(
    ...params:
        | [parentDifficulty: AbstractDifficulty,beat: number, value: InterscopeGroup]
        | MoveCarsParams
): RingSpinEvent {
    if (typeof params[1] === 'object') {
        const [diff, obj] = params
        return new RingSpinEvent(diff, obj)
    }
    const [parentDifficulty, beat, value] = params

    return new RingSpinEvent(parentDifficulty,{
        beat: beat,
        value: value as InterscopeGroup,
    })
}

// TODO: Event extras
/** Lower the hydraulics of the cars in the interscope environment. */
export function lowerHydraulics(parentDifficulty: AbstractDifficulty,beat: number) {
    return new LightEvent(parentDifficulty, {
        beat: beat,
        type: EventGroup.LOWER_HYDRAULICS,
        value: 0,
    })
}

/** Raise the hydraulics of the cars in the interscope environment. */
export function raiseHydraulics(parentDifficulty: AbstractDifficulty,beat: number) {
    return new LightEvent(parentDifficulty, {
        beat: beat,
        type: EventGroup.RAISE_HYDRAULICS,
        value: 0,
    })
}
