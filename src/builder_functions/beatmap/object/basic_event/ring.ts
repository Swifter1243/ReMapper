import {RingZoomEvent} from "../../../../internals/beatmap/object/basic_event/ring_zoom.ts";
import {RingSpinEvent} from "../../../../internals/beatmap/object/basic_event/ring_spin.ts";
import {SpinDirection} from "../../../../data/constants/basic_event.ts";

/**
 * Spin the rings of an environment.
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
        beat: number,
        rotation?: number,
        direction?: SpinDirection,
        step?: number,
        speed?: number,
        prop?: number,
        nameFilter?: string,
    ] | ConstructorParameters<typeof RingSpinEvent>
): RingSpinEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new RingSpinEvent(obj)
    }
    const [beat, rotation, direction, step, speed, prop, nameFilter] = params

    return new RingSpinEvent({
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
 * @param beat The beat of the event.
 * @param step The position offset between each ring.
 * @param speed The speed of the zoom.
 */
export function ringZoom(
    beat: number,
    step?: number,
    speed?: number,
): RingZoomEvent
export function ringZoom(
    ...params: ConstructorParameters<typeof RingZoomEvent>
): RingZoomEvent
export function ringZoom(
    ...params: [
        beat: number,
        step?: number,
        speed?: number,
    ] | ConstructorParameters<typeof RingZoomEvent>
): RingZoomEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new RingZoomEvent(obj)
    }
    const [beat, step, speed] = params

    return new RingZoomEvent({
        beat,
        step,
        speed,
    })
}
