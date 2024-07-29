import {EASE} from "../../../../types/animation/easing.ts";
import {TrackValue} from "../../../../types/animation/track.ts";
import {AnimateTrack} from "../../../../internals/beatmap/object/custom_event/heck/animate_track.ts";

/**
 * Animate a track.
 */
export function animateTrack(
    ...params:
        | ConstructorParameters<typeof AnimateTrack>
        | [
            beat: number,
            track: TrackValue,
            duration?: number,
            animation?: AnimateTrack['animation'],
            easing?: EASE,
        ]
) {
    if (typeof params[0] === 'object') {
        return new AnimateTrack(
            ...params as ConstructorParameters<
                typeof AnimateTrack
            >,
        )
    }

    const [beat, track, duration, animation, easing] = params

    return new AnimateTrack(
        {
            beat: beat as number,
            track: track as TrackValue,
            duration,
            animation,
            easing,
        },
    )
}
