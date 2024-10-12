import {BPMEvent} from "./bpm.ts";
import { bsmap } from '../../../../../deps.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import {JsonObjectConstructor, JsonObjectDefaults} from "../../../../../types/beatmap/object/object.ts";
import {AbstractDifficulty} from "../../../abstract_beatmap.ts";

export class CommunityBPMEvent extends BPMEvent<
    bsmap.v2.IBPMChange | bsmap.v2.IBPMChangeOld,
    bsmap.v3.IBPMChange
> {
    constructor(parentDifficulty: AbstractDifficulty, obj: JsonObjectConstructor<CommunityBPMEvent>) {
        super(parentDifficulty, obj)
        this.bpm = obj.bpm ?? CommunityBPMEvent.defaults.bpm
        this.mediocreMapper = obj.mediocreMapper ?? CommunityBPMEvent.defaults.mediocreMapper
        this.beatsPerBar = obj.beatsPerBar ?? CommunityBPMEvent.defaults.beatsPerBar
        this.metronomeOffset = obj.metronomeOffset ?? CommunityBPMEvent.defaults.metronomeOffset
    }

    /** What BPM this event changes the map to. */
    bpm: number
    /** Whether this event is in the mediocre mapper format. */
    mediocreMapper: boolean
    /** ??? */
    beatsPerBar: number
    /** ??? */
    metronomeOffset: number

    static override defaults: JsonObjectDefaults<CommunityBPMEvent> = {
        bpm: 120,
        mediocreMapper: false,
        beatsPerBar: 4,
        metronomeOffset: 0,
        ...super.defaults
    }

    protected override getArray(difficulty: AbstractDifficulty): this[] {
        return difficulty.bpmEvents as this[]
    }

    override fromJsonV3(json: bsmap.v3.IBPMChange): this {
        this.mediocreMapper = false
        this.bpm = json.m ?? CommunityBPMEvent.defaults.bpm
        this.beatsPerBar = json.p ?? CommunityBPMEvent.defaults.beatsPerBar
        this.metronomeOffset = json.o ?? CommunityBPMEvent.defaults.metronomeOffset
        return super.fromJsonV3(json);
    }

    override fromJsonV2(json: bsmap.v2.IBPMChange | bsmap.v2.IBPMChangeOld): this {
        this.mediocreMapper = json._bpm !== undefined
        this.bpm = (this.mediocreMapper ? json._bpm : json._BPM) ?? CommunityBPMEvent.defaults.bpm
        this.beatsPerBar = json._beatsPerBar ?? CommunityBPMEvent.defaults.beatsPerBar
        this.metronomeOffset = json._metronomeOffset ?? CommunityBPMEvent.defaults.metronomeOffset
        return super.fromJsonV2(json);
    }

    toJsonV3(prune?: boolean): bsmap.v3.IBPMChange {
        const output = {
            b: this.beat,
            m: this.bpm,
            o: this.metronomeOffset,
            p: this.beatsPerBar,
        } satisfies bsmap.v3.IBPMChange
        return prune ? objectPrune(output) : output
    }

    toJsonV2(prune?: boolean): bsmap.v2.IBPMChange | bsmap.v2.IBPMChangeOld {
        if (this.mediocreMapper) {
            const output = {
                _time: this.beat,
                _bpm: this.bpm,
                _BPM: undefined as never,
                _beatsPerBar: this.beatsPerBar,
                _metronomeOffset: this.metronomeOffset,
            } satisfies bsmap.v2.IBPMChangeOld
            return prune ? objectPrune(output) : output
        }

        const output = {
            _time: this.beat,
            _BPM: this.bpm,
            _beatsPerBar: this.beatsPerBar,
            _metronomeOffset: this.metronomeOffset,
        } satisfies bsmap.v2.IBPMChange
        return prune ? objectPrune(output) : output
    }
}
