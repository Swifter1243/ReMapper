import {BPMEvent} from "./bpm.ts";
import {Fields, SubclassExclusiveProps} from "../../../../types/util/class.ts";
import { bsmap } from '../../../../deps.ts'
import { objectPrune } from '../../../../utils/object/prune.ts'

/*
- V2 Custom Event
- V2 Basic Event

- V3 Custom Event
- V3 Basic Event
- V3 Event
*/

// V3 Basic Event -> V3 Event

export class CommunityBPMEvent extends BPMEvent<
    bsmap.v2.IBPMChange | bsmap.v2.IBPMChangeOld,
    bsmap.v3.IBPMChange
> {
    constructor(obj: Partial<Fields<CommunityBPMEvent>>) {
        super(obj)
        this.bpm = obj.bpm ?? 0
        this.mediocreMapper = obj.mediocreMapper ?? false
        this.beatsPerBar = obj.beatsPerBar ?? 4
        this.metronomeOffset = obj.metronomeOffset ?? 0
    }

    /** What BPM this light_event changes the map to. */
    bpm: number
    /** Whether this light_event is in the mediocre mapper format. */
    mediocreMapper: boolean
    /** ??? */
    beatsPerBar: number
    /** ??? */
    metronomeOffset: number

    fromJson(json: bsmap.v3.IBPMChange, v3: true): this
    fromJson(
        json: bsmap.v2.IBPMChange | bsmap.v2.IBPMChangeOld,
        v3: false,
    ): this
    fromJson(
        json:
            | bsmap.v2.IBPMChange
            | bsmap.v2.IBPMChangeOld
            | bsmap.v3.IBPMChange,
        v3: boolean,
    ): this {
        type Params = SubclassExclusiveProps<
            CommunityBPMEvent,
            BPMEvent<
                bsmap.v2.IBPMChange | bsmap.v2.IBPMChangeOld,
                bsmap.v3.IBPMChange
            >
        >

        if (v3) {
            const obj = json as bsmap.v3.IBPMChange

            const params = {
                bpm: obj.m ?? 0,
                beatsPerBar: obj.p ?? 0,
                metronomeOffset: obj.o ?? 0,
                mediocreMapper: false,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, true)
        } else {
            const obj = json as bsmap.v2.IBPMChange | bsmap.v2.IBPMChangeOld

            const mediocreMapper = obj._bpm !== undefined

            const params = {
                bpm: mediocreMapper ? obj._bpm : obj._BPM,
                beatsPerBar: obj._beatsPerBar,
                mediocreMapper: mediocreMapper,
                metronomeOffset: obj._metronomeOffset,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, false)
        }
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.IBPMChange
    toJson(
        v3: false,
        prune?: boolean,
    ): bsmap.v2.IBPMChange | bsmap.v2.IBPMChangeOld
    toJson(
        v3 = true,
        prune = true,
    ): bsmap.v2.IBPMChange | bsmap.v2.IBPMChangeOld | bsmap.v3.IBPMChange {
        if (v3) {
            const output = {
                b: this.beat,
                m: this.bpm,
                o: this.metronomeOffset,
                p: this.beatsPerBar,
            } satisfies bsmap.v3.IBPMChange
            return prune ? objectPrune(output) : output
        }

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
