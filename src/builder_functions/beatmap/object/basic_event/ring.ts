import {RingZoomEvent} from "../../../../internals/beatmap/object/basic_event/ring_zoom.ts";
import {RingSpinEvent} from "../../../../internals/beatmap/object/basic_event/ring_spin.ts";

/**
 * Spin the rings of an environment.
 * @param rotation Degrees of the spin.
 * @param direction Direction of the spin. 1 is clockwise, 0 is counterclockwise.
 * @param step The angle between each ring.
 * @param speed The speed multiplier of the spin.
 * @param prop The rate at which physics propogate through the rings.
 * High values will cause rings to move simultneously, low values gives them significant delay.
 * @param nameFilter The ring object name to target.
 */
export function ringSpin(
    ...params: [
        beat: number,
        rotation?: number,
        direction?: RingSpinEvent['direction'],
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
 * @param step The position offset between each ring.
 * @param speed The speed of the zoom.
 */
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
