import * as CustomEventInternals from '../../../../internals/beatmap/object/custom_event/mod.ts'

import {EASE} from "../../../../types/animation/easing.ts";
import {TrackValue} from "../../../../types/animation/track.ts";

/**
 * Animate a track.
 * @param track Track(s) to effect.
 * @param duration The duration of the animation.
 * @param animation The animation properties to replace.
 * @param easing The easing on this light_event's animation.
 */
export function animateTrack(
    ...params:
        | ConstructorParameters<typeof CustomEventInternals.AnimateTrack>
        | [
            beat: number,
            track: TrackValue,
            duration?: number,
            animation?: CustomEventInternals.AnimateTrack['animation'],
            easing?: EASE,
        ]
) {
    if (typeof params[0] === 'object') {
        return new CustomEventInternals.AnimateTrack(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.AnimateTrack
            >,
        )
    }

    const [beat, track, duration, animation, easing] = params

    return new CustomEventInternals.AnimateTrack(
        {
            beat: beat as number,
            track: track as TrackValue,
            duration,
            animation,
            easing,
        },
    )
}
