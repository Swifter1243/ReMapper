import { EASE } from '../../../../types/animation/easing.ts'
import { TrackValue } from '../../../../types/animation/track.ts'
import { AnimateTrack } from '../../../../internals/beatmap/object/custom_event/heck/animate_track.ts'
import type { AbstractDifficulty } from '../../../../internals/beatmap/abstract_beatmap.ts'

/**
 * Animate a track.
 */
export function animateTrack(
    ...params:
        | ConstructorParameters<typeof AnimateTrack>
        | [
            parentDifficulty: AbstractDifficulty,
            beat: number,
            track: TrackValue,
            duration?: number,
            animation?: AnimateTrack['animation'],
            easing?: EASE,
        ]
) {
    if (typeof params[1] === 'object') {
        return new AnimateTrack(
            ...params as ConstructorParameters<
                typeof AnimateTrack
            >,
        )
    }

    const [parentDifficulty, beat, track, duration, animation, easing] = params

    return new AnimateTrack(parentDifficulty, {
        beat,
        track,
        duration,
        animation,
        easing,
    })
}
