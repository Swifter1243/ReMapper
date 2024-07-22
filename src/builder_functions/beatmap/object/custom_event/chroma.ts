import * as CustomEventInternals from '../../../../internals/beatmap/object/custom_event/mod.ts'

import {EASE} from "../../../../types/animation/easing.ts";
import {TrackValue} from "../../../../types/animation/track.ts";

/**
 * Animate components on a track.
 */
export function animateComponent(
    ...params:
        | ConstructorParameters<typeof CustomEventInternals.AnimateComponent>
        | [
            beat: number,
            track: TrackValue,
            duration?: number,
            easing?: EASE,
        ]
) {
    if (typeof params[0] === 'object') {
        return new CustomEventInternals.AnimateComponent(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.AnimateComponent
            >,
        )
    }

    const [beat, track, duration, easing] = params

    return new CustomEventInternals.AnimateComponent(
        {
            beat: beat as number,
            track,
            duration,
            easing,
        },
    )
}
