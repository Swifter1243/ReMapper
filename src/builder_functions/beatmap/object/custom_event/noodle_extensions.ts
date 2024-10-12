import { bsmap } from '../../../../deps.ts'

import { EASE } from '../../../../types/animation/easing.ts'
import { TrackValue } from '../../../../types/animation/track.ts'
import { AssignPathAnimation } from '../../../../internals/beatmap/object/custom_event/noodle_extensions/assign_path_animation.ts'
import { AssignTrackParent } from '../../../../internals/beatmap/object/custom_event/noodle_extensions/assign_track_parent.ts'
import { AssignPlayerToTrack } from '../../../../internals/beatmap/object/custom_event/noodle_extensions/assign_player_to_track.ts'
import { AbstractDifficulty } from '../../../../internals/beatmap/abstract_beatmap.ts'

/**
 * Animate objects on a track across their lifespan.
 */
export function assignPathAnimation(
    ...params:
        | ConstructorParameters<typeof AssignPathAnimation>
        | [
            parentDifficulty: AbstractDifficulty,
            beat: number,
            track: TrackValue,
            duration?: number,
            animation?: AssignPathAnimation['animation'],
            easing?: EASE,
        ]
) {
    if (typeof params[1] === 'object') {
        return new AssignPathAnimation(
            ...params as ConstructorParameters<
                typeof AssignPathAnimation
            >,
        )
    }

    const [parentDifficulty, beat, track, duration, animation, easing] = params

    return new AssignPathAnimation(parentDifficulty, {
        beat,
        track,
        duration,
        animation,
        easing,
    })
}

/**
 * Assign tracks to a parent track.
 */
export function assignTrackParent(
    ...params:
        | ConstructorParameters<typeof AssignTrackParent>
        | [
            parentDifficulty: AbstractDifficulty,
            beat: number,
            childrenTracks: string[],
            parentTrack: string,
            worldPositionStays?: boolean,
        ]
) {
    if (typeof params[1] === 'object') {
        return new AssignTrackParent(
            ...params as ConstructorParameters<
                typeof AssignTrackParent
            >,
        )
    }

    const [parentDifficulty, beat, childrenTracks, parentTrack, worldPositionStays] = params

    return new AssignTrackParent(parentDifficulty, {
        beat,
        childrenTracks: childrenTracks!,
        parentTrack: parentTrack!,
        worldPositionStays,
    })
}

/**
 * Assigns the player to a track.
 */
export function assignPlayerToTrack(
    ...params:
        | ConstructorParameters<typeof AssignPlayerToTrack>
        | [
            parentDifficulty: AbstractDifficulty,
            beat: number,
            track?: string,
            target?: bsmap.PlayerObject,
        ]
) {
    if (typeof params[1] === 'object') {
        return new AssignPlayerToTrack(
            ...params as ConstructorParameters<
                typeof AssignPlayerToTrack
            >,
        )
    }

    const [parentDifficulty, beat, track, target] = params

    return new AssignPlayerToTrack(parentDifficulty, {
        beat,
        track,
        target,
    })
}
