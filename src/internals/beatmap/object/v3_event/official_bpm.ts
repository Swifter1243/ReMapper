import { ConvertableEvent } from '../../../../types/beatmap/object/v3_event.ts'
import { BPMEvent } from './bpm.ts'
import { bsmap } from '../../../../deps.ts'
import {objectPrune} from "../../../../utils/object/prune.ts";
import {EventGroup} from "../../../../data/constants/basic_event.ts";
import {Fields, SubclassExclusiveProps} from "../../../../types/util/class.ts";

export class OfficialBPMEvent extends BPMEvent<
    bsmap.v2.IEvent,
    bsmap.v3.IBPMEvent
> implements ConvertableEvent {
    constructor(obj: Partial<Fields<OfficialBPMEvent>>) {
        super(obj)
        this.bpm = obj.bpm ?? 0
    }

    /** What BPM this event changes the map to. */
    bpm: number

    fromBasicEvent(json: bsmap.v3.IBasicEvent) {
        this.beat = json.b
        this.bpm = json.f
        return this
    }

    fromJson(json: bsmap.v3.IBPMEvent, v3: true): this
    fromJson(json: bsmap.v2.IEvent, v3: false): this
    fromJson(
        json: bsmap.v2.IEvent | bsmap.v3.IBPMEvent,
        v3: boolean,
    ): this {
        type Params = SubclassExclusiveProps<
            OfficialBPMEvent,
            BPMEvent<
                bsmap.v2.IEvent,
                bsmap.v3.IBPMEvent
            >
        >

        if (v3) {
            const obj = json as bsmap.v3.IBPMEvent

            const params = {
                bpm: obj.m ?? 0,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, true)
        } else {
            const obj = json as bsmap.v2.IEvent

            const params = {
                bpm: obj._floatValue ?? 0,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, false)
        }
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.IBPMEvent
    toJson(v3: false, prune?: boolean): bsmap.v2.IEvent
    toJson(
        v3 = true,
        prune = true,
    ): bsmap.v2.IEvent | bsmap.v3.IBPMEvent {
        if (v3) {
            const output = {
                b: this.beat,
                m: this.bpm,
                customData: undefined,
            } satisfies bsmap.v3.IBPMEvent
            return prune ? objectPrune(output) : output
        }

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
