import { getActiveDifficulty } from '../../../../data/active_difficulty.ts'
import { bsmap } from '../../../../deps.ts'
import { copy } from '../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../utils/object/prune.ts'
import { BasicEvent } from './basic_event.ts'

export class AbstractBasicEvent extends BasicEvent {
    push(
        clone: boolean,
    ) {
        getActiveDifficulty().abstractBasicEvents.push(clone ? copy(this) : this)
        return this
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.IBasicEvent
    toJson(v3: false, prune?: boolean): bsmap.v2.IEvent
    toJson(v3 = true, prune = true): bsmap.v2.IEvent | bsmap.v3.IBasicEvent {
        if (v3) {
            const output = {
                b: this.beat,
                et: this.type,
                f: this.floatValue,
                i: this.value,
                customData: this.customData,
            } satisfies bsmap.v3.IBasicEvent
            return prune ? objectPrune(output) : output
        } else {
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
}
