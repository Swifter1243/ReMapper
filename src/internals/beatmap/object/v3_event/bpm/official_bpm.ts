import { ConvertableEvent } from '../../../../../types/beatmap/object/v3_event.ts'
import { BPMEvent } from './bpm.ts'
import { bsmap } from '../../../../../deps.ts'
import {objectPrune} from "../../../../../utils/object/prune.ts";
import {EventGroup} from "../../../../../constants/basic_event.ts";
import {JsonObjectConstructor, JsonObjectDefaults} from "../../../../../types/beatmap/object/object.ts";
import {AbstractDifficulty} from "../../../abstract_beatmap.ts";

export class OfficialBPMEvent extends BPMEvent<
    bsmap.v2.IEvent,
    bsmap.v3.IBPMEvent
> implements ConvertableEvent {
    constructor(parentDifficulty: AbstractDifficulty,obj: JsonObjectConstructor<OfficialBPMEvent>) {
        super(parentDifficulty, obj)
        this.beatsPerMinute = obj.beatsPerMinute ?? OfficialBPMEvent.defaults.beatsPerMinute
    }

    /** What BPM this event changes the map to. */
    beatsPerMinute: number

    /** The values to initialize fields in this class. */
    static override defaults: JsonObjectDefaults<OfficialBPMEvent> = {
        beatsPerMinute: 120,
        ...super.defaults
    }

    protected override getArray(difficulty: AbstractDifficulty): this[] {
        return difficulty.bpmEvents as this[]
    }

    fromBasicEvent(json: bsmap.v3.IBasicEvent) {
        this.beat = json.b ?? OfficialBPMEvent.defaults.beat
        this.beatsPerMinute = json.f ?? OfficialBPMEvent.defaults.beatsPerMinute
        return this
    }

    override fromJsonV3(json: bsmap.v3.IBPMEvent): this {
        this.beatsPerMinute = json.m ?? OfficialBPMEvent.defaults.beatsPerMinute
        return super.fromJsonV3(json);
    }

    override fromJsonV2(json: bsmap.v2.IEvent): this {
        this.beatsPerMinute = json._floatValue ?? OfficialBPMEvent.defaults.beatsPerMinute
        return super.fromJsonV2(json);
    }

    toJsonV3(prune?: boolean): bsmap.v3.IBPMEvent {
        const output = {
            b: this.beat,
            m: this.beatsPerMinute,
            customData: undefined,
        } satisfies bsmap.v3.IBPMEvent
        return prune ? objectPrune(output) : output
    }

    toJsonV2(prune?: boolean): bsmap.v2.IEvent {
        const output = {
            _time: this.beat,
            _floatValue: this.beatsPerMinute,
            _type: EventGroup.BPM,
            _value: 0,
            _customData: undefined,
        } satisfies bsmap.v2.IEvent
        return prune ? objectPrune(output) : output
    }
}
