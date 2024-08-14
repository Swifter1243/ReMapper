import { getActiveDifficulty } from '../../../../data/active_difficulty.ts'
import { bsmap } from '../../../../deps.ts'
import { copy } from '../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../utils/object/prune.ts'
import { BasicEvent } from './basic_event.ts'

export class AbstractBasicEvent extends BasicEvent {
    push(
        clone?: boolean,
    ) {
        getActiveDifficulty().abstractBasicEvents.push(clone ? copy(this) : this)
        return this
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
