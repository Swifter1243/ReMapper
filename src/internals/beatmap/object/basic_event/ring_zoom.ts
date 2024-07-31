import { EventGroup } from '../../../../data/constants/basic_event.ts'
import { getActiveDifficulty } from '../../../../data/active_difficulty.ts'
import { copy } from '../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../utils/object/prune.ts'
import { BasicEvent } from './basic_event.ts'
import { bsmap } from '../../../../deps.ts'
import { getCDProp } from '../../../../utils/beatmap/json.ts'
import { DeepReadonly } from '../../../../types/util/mutability.ts'
import {ObjectFields} from "../../../../types/beatmap/object/object.ts";

export class RingZoomEvent extends BasicEvent<bsmap.v2.IEventZoom, bsmap.v3.IBasicEventRing> {
    constructor(obj: Partial<Omit<ObjectFields<RingZoomEvent>, 'type'>>) {
        super({
            ...obj,
            type: EventGroup.RING_ZOOM,
        })
        this.step = obj.step
        this.speed = obj.speed
    }

    /** The position offset between each ring. */
    step?: number
    /** The speed of the zoom. */
    speed?: number

    static defaults: DeepReadonly<ObjectFields<RingZoomEvent>> = {
        ...super.defaults,
    }

    push(
        clone = true,
    ): RingZoomEvent {
        getActiveDifficulty().ringZoomEvents.push(clone ? copy(this) : this)
        return this
    }

    fromJsonV3(json: bsmap.v3.IBasicEventRing): this {
        this.speed = getCDProp(json, 'speed')
        this.step = getCDProp(json, 'step')
        return super.fromJsonV3(json)
    }

    fromJsonV2(json: bsmap.v2.IEventZoom): this {
        this.speed = getCDProp(json, '_speed')
        this.step = getCDProp(json, '_step')
        return super.fromJsonV2(json)
    }

    toJsonV3(prune?: boolean): bsmap.v3.IBasicEventRing {
        const output = {
            b: this.beat,
            et: this.type as bsmap.v3.IBasicEventRing['et'],
            f: this.floatValue,
            i: this.value,
            customData: {
                speed: this.speed,
                step: this.step,
                ...this.customData,
            },
        } satisfies bsmap.v3.IBasicEventRing
        return prune ? objectPrune(output) : output
    }

    toJsonV2(prune?: boolean): bsmap.v2.IEventZoom {
        const output = {
            _floatValue: this.floatValue,
            _time: this.beat,
            _type: EventGroup.RING_ZOOM,
            _value: this.value,
            _customData: {
                _speed: this.speed,
                _step: this.step,
                ...this.customData,
            },
        } satisfies bsmap.v2.IEventZoom
        return prune ? objectPrune(output) : output
    }
}
