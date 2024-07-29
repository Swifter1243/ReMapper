import {bsmap} from '../../../../deps.ts'

import {EASE} from "../../../../types/animation/easing.ts";
import {TrackValue} from "../../../../types/animation/track.ts";
import {
    AssignPathAnimation
} from "../../../../internals/beatmap/object/custom_event/noodle_extensions/assign_path_animation.ts";
import {
    AssignTrackParent
} from "../../../../internals/beatmap/object/custom_event/noodle_extensions/assign_track_parent.ts";
import {
    AssignPlayerToTrack
} from "../../../../internals/beatmap/object/custom_event/noodle_extensions/assign_player_to_track.ts";

/**
 * Animate objects on a track across their lifespan.
 */
export function assignPathAnimation(
    ...params:
        | ConstructorParameters<typeof AssignPathAnimation>
        | [
            beat: number,
            track: TrackValue,
            duration?: number,
            animation?: AssignPathAnimation['animation'],
            easing?: EASE,
        ]
) {
    if (typeof params[0] === 'object') {
        return new AssignPathAnimation(
            ...params as ConstructorParameters<
                typeof AssignPathAnimation
            >,
        )
    }

    const [beat, track, duration, animation, easing] = params

    return new AssignPathAnimation(
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
        | ConstructorParameters<typeof AssignTrackParent>
        | [
            beat: number,
            childrenTracks: string[],
            parentTrack: string,
            worldPositionStays?: boolean,
        ]
) {
    if (typeof params[0] === 'object') {
        return new AssignTrackParent(
            ...params as ConstructorParameters<
                typeof AssignTrackParent
            >,
        )
    }

    const [beat, childrenTracks, parentTrack, worldPositionStays] = params

    return new AssignTrackParent(
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
        | ConstructorParameters<typeof AssignPlayerToTrack>
        | [
            beat: number,
            track?: string,
            target?: bsmap.PlayerObject,
        ]
) {
    if (typeof params[0] === 'object') {
        return new AssignPlayerToTrack(
            ...params as ConstructorParameters<
                typeof AssignPlayerToTrack
            >,
        )
    }

    const [beat, track, target] = params

    return new AssignPlayerToTrack(
        {
            beat: beat as number,
            track,
            target,
        },
    )
}
