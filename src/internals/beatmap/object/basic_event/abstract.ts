import { bsmap } from '../../../../deps.ts'
import { objectPrune } from '../../../../utils/object/prune.ts'
import { BasicEvent } from './basic_event.ts'
import type {AbstractDifficulty} from "../../abstract_beatmap.ts";

export class AbstractBasicEvent extends BasicEvent {
    protected override getArray(difficulty: AbstractDifficulty): this[] {
        return difficulty.abstractBasicEvents as this[]
    }

    toJsonV3(prune?: boolean): bsmap.v3.IBasicEvent {
        const output = {
            b: this.beat,
            et: this.type,
            f: this.floatValue,
            i: this.value,
            customData: this.customData,
        } satisfies bsmap.v3.IBasicEvent
        return prune ? objectPrune(output) : output
    }

    toJsonV2(prune?: boolean): bsmap.v2.IEvent {
        const output = {
            _floatValue: this.floatValue,
            _time: this.beat,
            _type: this.type,
            _value: this.value,
            _customData: this.customData,
        } satisfies bsmap.v2.IEvent
        return prune ? objectPrune(output) : output
    }
}
