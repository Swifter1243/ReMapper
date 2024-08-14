import { BasicEvent } from './basic_event.ts'
import {EventGroup, SpinDirection} from '../../../../data/constants/basic_event.ts'
import { getActiveDifficulty } from '../../../../data/active_difficulty.ts'
import { copy } from '../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../utils/object/prune.ts'
import { bsmap } from '../../../../deps.ts'
import { getCDProp } from '../../../../utils/beatmap/json.ts'

import {BeatmapObjectDefaults, BeatmapObjectFields} from "../../../../types/beatmap/object/object.ts";

export class RingSpinEvent extends BasicEvent<bsmap.v2.IEventRing, bsmap.v3.IBasicEventRing> {
    constructor(obj: Partial<Omit<BeatmapObjectFields<RingSpinEvent>, 'type'>>) {
        super({
            ...obj,
            type: EventGroup.RING_SPIN,
        })
        this.speed = obj.speed
        this.direction = obj.direction
        this.nameFilter = obj.nameFilter
        this.rotation = obj.rotation
        this.step = obj.step
        this.prop = obj.prop
    }

    /** The speed multiplier of the spin. */
    speed?: number
    /** Direction of the spin. */
    direction?: SpinDirection
    /** The ring object name to target. */
    nameFilter?: string
    /** Degrees of the spin. */
    rotation?: number
    /** The angle between each ring. */
    step?: number
    /** The rate at which physics propagate through the rings.
     * High values will cause rings to move simultaneously, low values gives them significant delay.
     */
    prop?: number

    static defaults: BeatmapObjectDefaults<RingSpinEvent> = {
        ...super.defaults,
    }

    push(
        clone = true,
    ): RingSpinEvent {
        getActiveDifficulty().ringSpinEvents.push(clone ? copy(this) : this)
        return this
    }

    fromJsonV3(json: bsmap.v3.IBasicEventRing): this {
        this.direction = getCDProp(json, 'direction')
        this.nameFilter = getCDProp(json, 'nameFilter')
        this.prop = getCDProp(json, 'prop')
        this.rotation = getCDProp(json, 'rotation')
        this.speed = getCDProp(json, 'speed')
        this.step = getCDProp(json, 'step')
        return super.fromJsonV3(json)
    }

    fromJsonV2(json: bsmap.v2.IEventRing): this {
        this.direction = getCDProp(json, '_direction')
        this.nameFilter = getCDProp(json, '_nameFilter')
        this.prop = getCDProp(json, '_prop')
        this.rotation = getCDProp(json, '_rotation')
        this.speed = getCDProp(json, '_speed')
        this.step = getCDProp(json, '_step')
        return super.fromJsonV2(json)
    }

    toJsonV3(prune?: boolean): bsmap.v3.IBasicEventRing {
        const output = {
            b: this.beat,
            et: EventGroup.RING_SPIN,
            f: this.floatValue,
            i: this.value,
            customData: {
                direction: this.direction,
                nameFilter: this.nameFilter,
                prop: this.prop,
                rotation: this.rotation,
                speed: this.speed,
                step: this.step,
            },
        } satisfies bsmap.v3.IBasicEventRing
        return prune ? objectPrune(output) : output
    }

    toJsonV2(prune?: boolean): bsmap.v2.IEventRing {
        const output = {
            _floatValue: this.floatValue,
            _time: this.beat,
            _type: EventGroup.RING_SPIN,
            _value: this.value,
            _customData: {
                _direction: this.direction,
                _nameFilter: this.nameFilter,
                _prop: this.prop,
                _rotation: this.rotation,
                _speed: this.speed,
                _step: this.step,
                ...this.customData,
            },
        } satisfies bsmap.v2.IEventRing
        return prune ? objectPrune(output) : output
    }
}
