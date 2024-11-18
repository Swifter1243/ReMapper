import {RingZoomEvent} from "../../../../internals/beatmap/object/basic_event/ring_zoom.ts";
import {RingSpinEvent} from "../../../../internals/beatmap/object/basic_event/ring_spin.ts";
import {SpinDirection} from "../../../../constants/basic_event.ts";
import type { AbstractDifficulty } from '../../../../internals/beatmap/abstract_difficulty.ts'

/**
 * Spin the rings of an environment.
 * @param parentDifficulty The difficulty to push this event to
 * @param beat The beat of the event spin.
 * @param rotation Degrees of the spin.
 * @param direction Direction of the spin.
 * @param step The angle between each ring.
 * @param speed The speed multiplier of the spin.
 * @param prop The rate at which physics propagate through the rings.
 * High values will cause rings to move simultaneously, low values gives them significant delay.
 * @param nameFilter The ring object name to target.
 */
export function ringSpin(
    parentDifficulty: AbstractDifficulty,
    beat: number,
    rotation?: number,
    direction?: SpinDirection,
    step?: number,
    speed?: number,
    prop?: number,
    nameFilter?: string,
): RingSpinEvent
export function ringSpin(...params: ConstructorParameters<typeof RingSpinEvent>): RingSpinEvent
export function ringSpin(
    ...params: [
        parentDifficulty: AbstractDifficulty,
        beat: number,
        rotation?: number,
        direction?: SpinDirection,
        step?: number,
        speed?: number,
        prop?: number,
        nameFilter?: string,
    ] | ConstructorParameters<typeof RingSpinEvent>
): RingSpinEvent {
    if (typeof params[1] === 'object') {
        const [diff, obj] = params
        return new RingSpinEvent(diff, obj)
    }
    const [parentDifficulty, beat, rotation, direction, step, speed, prop, nameFilter] = params

    return new RingSpinEvent(parentDifficulty, {
        beat,
        value: rotation ?? 0,
        rotation,
        direction,
        step,
        speed,
        prop,
        nameFilter,
    })
}

/**
 * Controls ring zoom.
 * @param parentDifficulty The difficulty to push this event to
 * @param beat The beat of the event.
 * @param step The position offset between each ring.
 * @param speed The speed of the zoom.
 */
export function ringZoom(
    parentDifficulty: AbstractDifficulty,
    beat: number,
    step?: number,
    speed?: number,
): RingZoomEvent
export function ringZoom(
    ...params: ConstructorParameters<typeof RingZoomEvent>
): RingZoomEvent
export function ringZoom(
    ...params: [
        parentDifficulty: AbstractDifficulty,
        beat: number,
        step?: number,
        speed?: number,
    ] | ConstructorParameters<typeof RingZoomEvent>
): RingZoomEvent {
    if (typeof params[1] === 'object') {
        const [diff, obj] = params
        return new RingZoomEvent(diff, obj)
    }
    const [parentDifficulty, beat, step, speed] = params

    return new RingZoomEvent(parentDifficulty, {
        beat,
        step,
        speed,
    })
}
