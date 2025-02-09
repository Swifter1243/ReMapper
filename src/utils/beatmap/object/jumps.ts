import { rawBeatsToSeconds } from '../../math/beatmap.ts'

/**
 * Get jump related info.
 * @param noteJumpSpeed Note jump speed.
 * @param noteJumpOffset Note offset.
 * @param beatsPerMinute Song BPM.
 * @returns Returns an object; {halfDur, dist}.
 * A "jump" is the period when the object "jumps" in (indicated by spawning light on notes) to when it's deleted.
 * Jump Duration is the time in beats that the object will be jumping for.
 * This function will output half of this, so it will end when the note is supposed to be hit.
 * Jump Distance is the Z distance from when the object starts it's jump to when it's deleted.
 */
export function getJumps(
    noteJumpSpeed: number,
    noteJumpOffset: number,
    beatsPerMinute: number,
) {
    const startHJD = 4
    const maxHJD = 18 - 0.001
    const oneBeatDur = 60 / beatsPerMinute

    let halfDuration = startHJD
    const num2 = noteJumpSpeed * oneBeatDur
    let num3 = num2 * halfDuration
    while (num3 > maxHJD) {
        halfDuration /= 2
        num3 = num2 * halfDuration
    }
    halfDuration += noteJumpOffset
    if (halfDuration < 0.25) halfDuration = 0.25

    const jumpDuration = halfDuration * 2 * oneBeatDur
    const jumpDistance = noteJumpSpeed * jumpDuration

    return { halfDuration, jumpDistance }
}

/** Get the reaction time in milliseconds the player will have for an object from it's spawn. */
export function getReactionTime(
    noteJumpSpeed: number,
    noteJumpOffset: number,
    beatsPerMinute: number,
) {
    const halfJumpDuration = getJumps(noteJumpSpeed, noteJumpOffset, beatsPerMinute).halfDuration
    const beatMilliseconds = 60000 / beatsPerMinute
    return beatMilliseconds * halfJumpDuration
}

/** Get the offset required to generate a given reaction time in milliseconds. */
export function getOffsetFromReactionTime(
    reactionTime: number,
    noteJumpSpeed: number,
    beatsPerMinute: number,
) {
    const hjdAfterOffset = Math.max(0.25, reactionTime / (60000 / beatsPerMinute))
    return songBeatOffset(hjdAfterOffset, noteJumpSpeed, beatsPerMinute)
}

/** Get the offset required to generate a given jump distance. */
export function getOffsetFromJumpDistance(
    jumpDistance: number,
    noteJumpSpeed: number,
    beatsPerMinute: number,
) {
    const seconds = rawBeatsToSeconds(noteJumpSpeed * 2, beatsPerMinute)
    const hjdAfterOffset = Math.max(0.25, jumpDistance / seconds)
    return songBeatOffset(hjdAfterOffset, noteJumpSpeed, beatsPerMinute)
}

/** Get the offset required to get a given half jump duration. */
export function getOffsetFromHalfJumpDuration(
    halfJumpDuration: number,
    noteJumpSpeed: number,
    beatsPerMinute: number,
) {
    const hjdAfterOffset = Math.max(0.25, halfJumpDuration)
    return songBeatOffset(hjdAfterOffset, noteJumpSpeed, beatsPerMinute)
}

// idk what this does??? https://github.com/Caeden117/ChroMapper/blob/5167402385181379629dd4a516aaea914cbe7a93/Assets/__Scripts/UI/SongEditMenu/DifficultyInfo.cs#L79-L87
function songBeatOffset(
    hjdAfterOffset: number,
    noteJumpSpeed: number,
    beatsPerMinute: number,
) {
    const hjdBeforeOffset = getJumps(noteJumpSpeed, 0, beatsPerMinute).halfDuration
    return hjdAfterOffset - hjdBeforeOffset
}
