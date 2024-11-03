import type { AbstractDifficulty } from '../../../../internals/beatmap/abstract_beatmap.ts'
import { CommunityBPMEvent } from '../../../../internals/beatmap/object/v3_event/bpm/community_bpm.ts'

/** Creates a community BPM event, which is deprecated.
 * It is only interpreted by the editor, and doesn't actually change the time between object beats.
 * @param parentDifficulty The difficulty to add this event to.
 * @param beat The beat of the bpm event.
 * @param bpm The bpm to change to.
 * @param mediocreMapper Whether the event is in mediocre mapper format.
 * @param beatsPerBar ???
 * @param metronomeOffset ???
 */
export function communityBpmEvent(
    parentDifficulty: AbstractDifficulty,
    beat: number,
    bpm: number,
    mediocreMapper?: boolean,
    beatsPerBar?: number,
    metronomeOffset?: number,
): CommunityBPMEvent
export function communityBpmEvent(
    ...params: ConstructorParameters<typeof CommunityBPMEvent>
): CommunityBPMEvent
export function communityBpmEvent(
    ...params: [
        parentDifficulty: AbstractDifficulty,
        beat: number,
        bpm: number,
        mediocreMapper?: boolean,
        beatsPerBar?: number,
        metronomeOffset?: number,
    ] | ConstructorParameters<typeof CommunityBPMEvent>
): CommunityBPMEvent {
    if (typeof params[1] === 'object') {
        const [parentDifficulty, obj] = params
        return new CommunityBPMEvent(parentDifficulty, obj)
    }
    const [parentDifficulty, beat, bpm, mediocreMapper, beatsPerBar, metronomeOffset] = params

    return new CommunityBPMEvent(parentDifficulty, {
        beat,
        beatsPerMinute: bpm,
        mediocreMapper,
        beatsPerBar,
        metronomeOffset,
    })
}
