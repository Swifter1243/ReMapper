import {EASE} from "../../../../types/animation/easing.ts";
import {TrackValue} from "../../../../types/animation/track.ts";
import {AnimateComponent} from "../../../../internals/beatmap/object/custom_event/chroma/animate_component.ts";

/**
 * Animate components on a track.
 */
export function animateComponent(
    ...params:
        | ConstructorParameters<typeof AnimateComponent>
        | [
            beat: number,
            track: TrackValue,
            duration?: number,
            easing?: EASE,
        ]
) {
    if (typeof params[0] === 'object') {
        return new AnimateComponent(
            ...params as ConstructorParameters<
                typeof AnimateComponent
            >,
        )
    }

    const [beat, track, duration, easing] = params

    return new AnimateComponent(
        {
            beat: beat as number,
            track,
            duration,
            easing,
        },
    )
}
