import * as CustomEventInternals from '../../internals/custom_event/mod.ts'
import { EASE, TrackValue } from '../../types/animation.ts'

/**
 * Animate components on a track.
 * @param track Track(s) to effect.
 * @param duration Duration of the animation.
 * @param easing The easing on the animation.
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
