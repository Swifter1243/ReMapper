import { bsmap } from '../deps.ts'
import * as CustomEventInternals from '../internals/custom_event.ts'
import { EASE, KeyframesLinear, TrackValue } from '../types/animation_types.ts'
import { Components } from '../types/environment_types.ts'

export type CustomEvent = CustomEventInternals.BaseCustomEvent<
    bsmap.v2.ICustomEvent,
    bsmap.v3.ICustomEvent
>

/**
 * Animate a track.
 * @param track Track(s) to effect.
 * @param duration The duration of the animation.
 * @param animation The animation properties to replace.
 * @param easing The easing on this event's animation.
 */
export function animateTrack(
    time: number,
    track?: TrackValue,
    duration?: number,
    animation?: CustomEventInternals.AnimateTrack['animate'],
    easing?: EASE,
): CustomEventInternals.AnimateTrack
export function animateTrack(
    ...params: ConstructorParameters<typeof CustomEventInternals.AnimateTrack>
): CustomEventInternals.AnimateTrack
export function animateTrack(
    ...params:
        | ConstructorParameters<typeof CustomEventInternals.AnimateTrack>
        | [
            time: number,
            track?: TrackValue,
            duration?: number,
            animation?: CustomEventInternals.AnimateTrack['animate'],
            easing?: EASE,
        ]
) {
    const [first] = params

    if (typeof first === 'object') {
        return new CustomEventInternals.AnimateTrack(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.AnimateTrack
            >,
        )
    }

    const [time, track, duration, animation, easing] = params

    return new CustomEventInternals.AnimateTrack(
        {
            time: time as number,
            track,
            duration,
            animation,
            easing,
        },
    )
}

/**
 * Animate objects on a track across their lifespan.
 * @param track Track(s) to effect.
 * @param duration The time to transition from a previous path to this one.
 * @param animation The animation properties to replace.
 * @param easing The easing on this event's animation.
 */
export function assignPathAnimation(
    time: number,
    track?: TrackValue,
    duration?: number,
    animation?: CustomEventInternals.AnimateTrack['animate'],
    easing?: EASE,
): CustomEventInternals.AssignPathAnimation
export function assignPathAnimation(
    ...params: ConstructorParameters<
        typeof CustomEventInternals.AssignPathAnimation
    >
): CustomEventInternals.AssignPathAnimation
export function assignPathAnimation(
    ...params:
        | ConstructorParameters<typeof CustomEventInternals.AssignPathAnimation>
        | [
            time: number,
            track?: TrackValue,
            duration?: number,
            animation?: CustomEventInternals.AssignPathAnimation['animate'],
            easing?: EASE,
        ]
) {
    const [first] = params

    if (typeof first === 'object') {
        return new CustomEventInternals.AssignPathAnimation(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.AssignPathAnimation
            >,
        )
    }

    const [time, track, duration, animation, easing] = params

    return new CustomEventInternals.AssignPathAnimation(
        {
            time: time as number,
            track,
            duration,
            animation,
            easing,
        },
    )
}

/**
 * Assign tracks to a parent track.
 * @param childrenTracks Children tracks to assign.
 * @param parentTrack Name of the parent track.
 * @param worldPositionStays Modifies the transform of children objects to remain in the same place relative to world space.
 */
export function assignTrackParent(
    time: number,
    childrenTracks: string[],
    parentTrack: string,
    worldPositionStays?: boolean,
): CustomEventInternals.AssignTrackParent
export function assignTrackParent(
    ...params: ConstructorParameters<
        typeof CustomEventInternals.AssignTrackParent
    >
): CustomEventInternals.AssignTrackParent
export function assignTrackParent(
    ...params:
        | ConstructorParameters<typeof CustomEventInternals.AssignTrackParent>
        | [
            time: number,
            childrenTracks: string[],
            parentTrack: string,
            worldPositionStays?: boolean,
        ]
) {
    const [first] = params

    if (typeof first === 'object') {
        return new CustomEventInternals.AssignTrackParent(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.AssignTrackParent
            >,
        )
    }

    const [time, childrenTracks, parentTrack, worldPositionStays] = params

    return new CustomEventInternals.AssignTrackParent(
        {
            time: time as number,
            childrenTracks: childrenTracks!,
            parentTrack: parentTrack!,
            worldPositionStays,
        },
    )
}

/**
 * Assigns the player to a track.
 * @param track Track the player will be assigned to.
 */
export const assignPlayerToTrack = (time: number, track?: string) =>
    new CustomEventInternals.AssignPlayerToTrack(time, track)

/**
 * Animate components on a track.
 * @param track Track(s) to effect.
 * @param duration Duration of the animation.
 * @param easing The easing on the animation.
 */
export function animateComponent(
    time: number,
    track?: TrackValue,
    duration?: number,
    easing?: EASE,
    components?: Components<KeyframesLinear>,
): CustomEventInternals.AnimateComponent
export function animateComponent(
    ...params: ConstructorParameters<
        typeof CustomEventInternals.AnimateComponent
    >
): CustomEventInternals.AnimateComponent
export function animateComponent(
    ...params:
        | ConstructorParameters<typeof CustomEventInternals.AnimateComponent>
        | [
            time: number,
            track?: TrackValue,
            duration?: number,
            easing?: EASE,

            components?: Components<KeyframesLinear>,
        ]
) {
    const [first] = params

    if (typeof first === 'object') {
        return new CustomEventInternals.AnimateComponent(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.AnimateComponent
            >,
        )
    }

    const [time, track, duration, easing, components] = params

    return new CustomEventInternals.AnimateComponent(
        {
            time: time as number,
            track,
            duration,
            components: components!,
            easing,
        },
    )
}
