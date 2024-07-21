import {CommunityBPMEvent} from '../../internals/v3_event/community_bpm.ts'

/** Creates a community BPM light_event, which is deprecated.
 * It is only interpreted by the editor, and doesn't actually change the time between object beats.
 */
export function communityBpmEvent(
    ...params: [
        beat: number,
        bpm: number,
        mediocreMapper?: boolean,
        beatsPerBar?: number,
        metronomeOffset?: number,
    ] | ConstructorParameters<typeof CommunityBPMEvent>
): CommunityBPMEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new CommunityBPMEvent({
            ...obj,
        })
    }
    const [beat, bpm, mediocreMapper, beatsPerBar, metronomeOffset] = params

    return new CommunityBPMEvent({
        beat,
        bpm,
        mediocreMapper,
        beatsPerBar,
        metronomeOffset,
    })
}
