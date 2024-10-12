import { EASE } from '../../../../types/animation/easing.ts'
import { TrackValue } from '../../../../types/animation/track.ts'
import { AnimateComponent } from '../../../../internals/beatmap/object/custom_event/chroma/animate_component.ts'
import { AbstractDifficulty } from '../../../../internals/beatmap/abstract_beatmap.ts'

/**
 * Animate components on a track.
 */
export function animateComponent(
    ...params:
        | ConstructorParameters<typeof AnimateComponent>
        | [
            parentDifficulty: AbstractDifficulty,
            beat: number,
            track: TrackValue,
            duration?: number,
            easing?: EASE,
        ]
) {
    if (typeof params[1] === 'object') {
        return new AnimateComponent(
            ...params as ConstructorParameters<
                typeof AnimateComponent
            >,
        )
    }

    const [parentDifficulty, beat, track, duration, easing] = params

    return new AnimateComponent(parentDifficulty, {
        beat,
        track,
        duration,
        easing,
    })
}
