import * as CustomEventInternals from '../../../../internals/beatmap/object/custom_event/mod.ts'
import { bsmap } from '../../../../deps.ts'

import {EASE} from "../../../../types/animation/easing.ts";
import {TrackValue} from "../../../../types/animation/track.ts";

/**
 * Animate objects on a track across their lifespan.
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
 */
export function assignPlayerToTrack(
    ...params:
        | ConstructorParameters<typeof CustomEventInternals.AssignPlayerToTrack>
        | [
            beat: number,
            track?: string,
            target?: bsmap.PlayerObject,
        ]
) {
    if (typeof params[0] === 'object') {
        return new CustomEventInternals.AssignPlayerToTrack(
            ...params as ConstructorParameters<
                typeof CustomEventInternals.AssignPlayerToTrack
            >,
        )
    }

    const [beat, track, target] = params

    return new CustomEventInternals.AssignPlayerToTrack(
        {
            beat: beat as number,
            track,
            target,
        },
    )
}
