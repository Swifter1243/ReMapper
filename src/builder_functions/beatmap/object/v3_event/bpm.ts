import {OfficialBPMEvent} from "../../../../internals/beatmap/object/v3_event/official_bpm.ts";


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
