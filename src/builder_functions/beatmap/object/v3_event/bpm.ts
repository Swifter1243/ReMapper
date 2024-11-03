import {OfficialBPMEvent} from "../../../../internals/beatmap/object/v3_event/bpm/official_bpm.ts";
import {AbstractDifficulty} from "../../../../internals/beatmap/abstract_beatmap.ts";


/** Creates an official BPM event, which changes the actual time between object beats.
 * As opposed to community BPM events which are only interpreted by the editor.
 */
export function officialBpmEvent(
    ...params: [
        parentDifficulty: AbstractDifficulty,
        beat: number,
        bpm: number,
    ] | ConstructorParameters<typeof OfficialBPMEvent>
): OfficialBPMEvent {
    if (typeof params[1] === 'object') {
        const [parentDifficulty, obj] = params
        return new OfficialBPMEvent(parentDifficulty, {
            ...obj,
        })
    }
    const [parentDifficulty, beat, bpm] = params

    return new OfficialBPMEvent(parentDifficulty, {
        beat,
        beatsPerMinute: bpm,
    })
}
