import { BaseObject } from '../../beatmap/object/object.ts'
import { ConvertableEvent } from '../../../types/v3_event.ts'
import { ObjectFields, SubclassExclusiveProps } from '../../../types/object.ts'
import { EventGroup } from '../../../properties/constants/basic_event.ts'
import { bsmap } from '../../../deps.ts'
import { objectPrune } from '../../../utils/object/prune.ts'
import { getActiveDifficulty } from '../../../properties/active_difficulty.ts'
import { copy } from '../../../utils/object/copy.ts'

export class BoostEvent extends BaseObject<bsmap.v2.IEvent, bsmap.v3.IColorBoostEvent>
    implements ConvertableEvent {
    constructor(obj: Partial<ObjectFields<BoostEvent>>) {
        super(obj)
        this.boost = obj.boost ?? false
    }

    /** Whether to use the boost color palette or not. */
    boost: boolean

    push(
        clone = true,
    ) {
        getActiveDifficulty().boostEvents.push(clone ? copy(this) : this)
        return this
    }

    fromBasicEvent(json: bsmap.v3.IBasicEventBoost) {
        this.beat = json.b
        this.boost = json.i === 1
        this.customData = json.customData
        return this
    }

    fromJson(json: bsmap.v3.IColorBoostEvent, v3: true): this
    fromJson(json: bsmap.v2.IEvent, v3: false): this
    fromJson(
        json: bsmap.v2.IEvent | bsmap.v3.IColorBoostEvent,
        v3: boolean,
    ): this {
        type Params = SubclassExclusiveProps<
            BoostEvent,
            BaseObject<
                bsmap.v2.IEvent,
                bsmap.v3.IColorBoostEvent
            >
        >

        if (v3) {
            const obj = json as bsmap.v3.IColorBoostEvent

            const params = {
                boost: obj.o,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, true)
        } else {
            const obj = json as bsmap.v2.IEvent

            const params = {
                boost: obj._value === 1,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, false)
        }
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.IColorBoostEvent
    toJson(v3: false, prune?: boolean): bsmap.v2.IEvent
    toJson(
        v3 = true,
        prune = true,
    ): bsmap.v2.IEvent | bsmap.v3.IColorBoostEvent {
        if (v3) {
            const output = {
                b: this.beat,
                o: this.boost,
                customData: this.customData,
            } satisfies bsmap.v3.IColorBoostEvent
            return prune ? objectPrune(output) : output
        }

        const output = {
            _time: this.beat,
            _floatValue: 0,
            _type: EventGroup.BOOST,
            _value: this.boost ? 1 : 0,
            _customData: this.customData,
        } satisfies bsmap.v2.IEvent
        return prune ? objectPrune(output) : output
    }
}
