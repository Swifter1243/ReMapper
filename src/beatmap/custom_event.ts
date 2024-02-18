import * as CustomEventInternals from '../internals/custom_event/mod.ts'
import { EASE, TrackValue } from '../types/animation_types.ts'
import { TJson } from '../types/util_types.ts'

export type CustomEvent = CustomEventInternals.BaseCustomEvent

export function abstractCustomEvent(
    ...params:
        | ConstructorParameters<typeof CustomEventInternals.AbstractCustomEvent>
        | [
            beat: number,
            type: string,
            data: TJson
        ]
) {
    if (typeof params[0] === 'object') {
        return new CustomEventInternals.AbstractCustomEvent(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.AbstractCustomEvent
            >,
        )
    }

    const [beat, type, data] = params

    return new CustomEventInternals.AbstractCustomEvent(
        {
            beat: beat as number,
            type,
            data
        },
    )
}


/**
 * Animate a track.
 * @param track Track(s) to effect.
 * @param duration The duration of the animation.
 * @param animation The animation properties to replace.
 * @param easing The easing on this event's animation.
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

/**
 * Animate objects on a track across their lifespan.
 * @param track Track(s) to effect.
 * @param duration The time to transition from a previous path to this one.
 * @param animation The animation properties to replace.
 * @param easing The easing on this event's animation.
 */
export function assignPathAnimation(
    ...params:
        | ConstructorParameters<typeof CustomEventInternals.AssignPathAnimation>
        | [
            beat: number,
            track: TrackValue,
            duration?: number,
            animation?: CustomEventInternals.AssignPathAnimation['animation'],
            easing?: EASE,
        ]
) {
    if (typeof params[0] === 'object') {
        return new CustomEventInternals.AssignPathAnimation(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.AssignPathAnimation
            >,
        )
    }

    const [beat, track, duration, animation, easing] = params

    return new CustomEventInternals.AssignPathAnimation(
        {
            beat: beat as number,
            track: track as TrackValue,
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
    ...params:
        | ConstructorParameters<typeof CustomEventInternals.AssignTrackParent>
        | [
            beat: number,
            childrenTracks: string[],
            parentTrack: string,
            worldPositionStays?: boolean,
        ]
) {
    if (typeof params[0] === 'object') {
        return new CustomEventInternals.AssignTrackParent(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.AssignTrackParent
            >,
        )
    }

    const [beat, childrenTracks, parentTrack, worldPositionStays] = params

    return new CustomEventInternals.AssignTrackParent(
        {
            beat: beat as number,
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
export function assignPlayerToTrack(
    ...params:
        | ConstructorParameters<typeof CustomEventInternals.AssignPlayerToTrack>
        | [
            beat: number,
            track?: string,
        ]
) {
    if (typeof params[0] === 'object') {
        return new CustomEventInternals.AssignPlayerToTrack(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.AssignPlayerToTrack
            >,
        )
    }

    const [beat, track] = params

    return new CustomEventInternals.AssignPlayerToTrack(
        {
            beat: beat as number,
            track
        },
    )
}

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