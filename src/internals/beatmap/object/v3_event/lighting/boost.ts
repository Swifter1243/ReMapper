import { bsmap } from '../../../../../deps.ts'
import { BeatmapObject } from '../../object.ts'
import { ConvertableEvent } from '../../../../../types/beatmap/object/v3_event.ts'
import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { EventGroup } from '../../../../../data/constants/basic_event.ts'
import { BeatmapObjectConstructor, BeatmapObjectDefaults } from '../../../../../types/beatmap/object/object.ts'

export class BoostEvent extends BeatmapObject<bsmap.v2.IEvent, bsmap.v3.IColorBoostEvent> implements ConvertableEvent {
    constructor(obj: BeatmapObjectConstructor<BoostEvent>) {
        super(obj)
        this.boost = obj.boost ?? BoostEvent.defaults.boost
    }

    /** Whether to use the boost color palette or not. */
    boost: boolean

    static defaults: BeatmapObjectDefaults<BoostEvent> = {
        boost: false,
        ...super.defaults,
    }

    push(clone = true) {
        getActiveDifficulty().boostEvents.push(clone ? copy(this) : this)
        return this
    }

    fromBasicEvent(json: bsmap.v3.IBasicEventBoost) {
        this.beat = json.b ?? BoostEvent.defaults.beat
        this.boost = json.i !== undefined ? json.i === 1 : BoostEvent.defaults.boost
        this.customData = json.customData ?? copy(BoostEvent.defaults.customData)
        return this
    }

    fromJsonV3(json: bsmap.v3.IColorBoostEvent): this {
        this.boost = json.o ?? BoostEvent.defaults.boost
        return super.fromJsonV3(json)
    }

    fromJsonV2(json: bsmap.v2.IEvent): this {
        this.boost = json._value !== undefined ? json._value === 1 : BoostEvent.defaults.boost
        return super.fromJsonV2(json)
    }

    toJsonV3(prune?: boolean): bsmap.v3.IColorBoostEvent {
        const output = {
            b: this.beat,
            o: this.boost,
            customData: this.customData,
        } satisfies bsmap.v3.IColorBoostEvent
        return prune ? objectPrune(output) : output
    }

    toJsonV2(prune?: boolean): bsmap.v2.IEvent {
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
