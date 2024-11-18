import { CustomEvent } from './custom_event.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { bsmap } from '../../../../../deps.ts'
import type { AbstractDifficulty } from '../../../abstract_difficulty.ts'

export class AbstractCustomEvent extends CustomEvent<
    bsmap.v2.ICustomEvent,
    bsmap.v3.ICustomEvent
> {
    protected override getArray(difficulty: AbstractDifficulty): this[] {
        return difficulty.customEvents.abstractCustomEvents as this[]
    }

    override fromJsonV2(json: bsmap.v2.ICustomEvent): this {
        this.type = json._type ?? CustomEvent.defaults.type
        return super.fromJsonV2(json)
    }

    override fromJsonV3(json: bsmap.v3.ICustomEvent): this {
        this.type = json.t ?? CustomEvent.defaults.type
        return super.fromJsonV3(json)
    }

    toJsonV2(prune?: boolean | undefined) {
        const result = {
            _time: this.beat,
            _type: this.type as bsmap.v2.ICustomEvent['_type'],
            _data: this.unsafeData as unknown as bsmap.v2.ICustomEvent['_data'],
        } as bsmap.v2.ICustomEvent
        return prune ? objectPrune(result) : result
    }

    toJsonV3(prune?: boolean): bsmap.v3.ICustomEvent {
        const result = {
            b: this.beat,
            t: this.type as bsmap.v3.ICustomEvent['t'],
            d: this.unsafeData as unknown as bsmap.v3.ICustomEvent['d'],
        } as bsmap.v3.ICustomEvent
        return prune ? objectPrune(result) : result
    }
}
