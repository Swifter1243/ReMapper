import { ConvertableEvent } from '../../../../../types/beatmap/object/v3_event.ts'
import { BPMEvent } from './bpm.ts'
import { bsmap } from '../../../../../deps.ts'
import {objectPrune} from "../../../../../utils/object/prune.ts";
import {EventGroup} from "../../../../../constants/basic_event.ts";
import {JsonObjectConstructor, JsonObjectDefaults} from "../../../../../types/beatmap/object/object.ts";

export class OfficialBPMEvent extends BPMEvent<
    bsmap.v2.IEvent,
    bsmap.v3.IBPMEvent
> implements ConvertableEvent {
    constructor(obj: JsonObjectConstructor<OfficialBPMEvent>) {
        super(obj)
        this.bpm = obj.bpm ?? OfficialBPMEvent.defaults.bpm
    }

    /** What BPM this event changes the map to. */
    bpm: number

    /** The values to initialize fields in this class. */
    static defaults: JsonObjectDefaults<OfficialBPMEvent> = {
        bpm: 120,
        ...super.defaults
    }

    fromBasicEvent(json: bsmap.v3.IBasicEvent) {
        this.beat = json.b ?? OfficialBPMEvent.defaults.beat
        this.bpm = json.f ?? OfficialBPMEvent.defaults.bpm
        return this
    }

    fromJsonV3(json: bsmap.v3.IBPMEvent): this {
        this.bpm = json.m ?? OfficialBPMEvent.defaults.bpm
        return super.fromJsonV3(json);
    }

    fromJsonV2(json: bsmap.v2.IEvent): this {
        this.bpm = json._floatValue ?? OfficialBPMEvent.defaults.bpm
        return super.fromJsonV2(json);
    }

    toJsonV3(prune?: boolean): bsmap.v3.IBPMEvent {
        const output = {
            b: this.beat,
            m: this.bpm,
            customData: undefined,
        } satisfies bsmap.v3.IBPMEvent
        return prune ? objectPrune(output) : output
    }

    toJsonV2(prune?: boolean): bsmap.v2.IEvent {
        const output = {
            _time: this.beat,
            _floatValue: this.bpm,
            _type: EventGroup.BPM,
            _value: 0,
            _customData: undefined,
        } satisfies bsmap.v2.IEvent
        return prune ? objectPrune(output) : output
    }
}
