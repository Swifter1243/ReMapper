import { CommunityBPMEvent, OfficialBPMEvent } from '../../internals/event.ts'

/** Creates an official BPM event, which changes the actual time between object beats.
 * As opposed to community BPM events which are only interpreted by the editor.
 */
export function officialBpmEvent(
    ...params: [
        beat: number,
        bpm: number,
    ] | ConstructorParameters<typeof OfficialBPMEvent>
): OfficialBPMEvent {
    if (typeof params[0] === 'object') {
        const obj = params[0]
        return new OfficialBPMEvent({
            ...obj,
        })
    }
    const [beat, bpm] = params

    return new OfficialBPMEvent({
        beat,
        bpm,
    })
}

/** Creates a community BPM event, which is deprecated.
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
