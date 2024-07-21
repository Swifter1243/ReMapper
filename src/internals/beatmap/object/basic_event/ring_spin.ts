import { BasicEvent } from './basic_event.ts'
import { Fields, SubclassExclusiveProps } from '../../../../types/util.ts'
import { EventGroup } from '../../../../data/constants/basic_event.ts'
import { getActiveDifficulty } from '../../../../data/active_difficulty.ts'
import { copy } from '../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../utils/object/prune.ts'
import { bsmap } from '../../../../deps.ts'
import {getCDProp} from "../../../../utils/beatmap/object.ts";

export class RingSpinEvent extends BasicEvent<bsmap.v2.IEventRing, bsmap.v3.IBasicEventRing> {
    constructor(obj: Partial<Omit<Fields<RingSpinEvent>, 'type'>>) {
        super({
            ...obj,
            type: EventGroup.RING_SPIN,
        })
        this.type = EventGroup.RING_SPIN
        this.speed = obj.speed
        this.direction = obj.direction
        this.nameFilter = obj.nameFilter
        this.rotation = obj.rotation
        this.step = obj.step
    }

    /** The speed multiplier of the spin. */
    speed?: number
    /** Direction of the spin. 1 is clockwise, 0 is counterclockwise. */
    direction?: 0 | 1
    /** The ring object name to target. */
    nameFilter?: string
    /** Degrees of the spin. */
    rotation?: number
    /** The angle between each ring. */
    step?: number
    /** The rate at which physics propogate through the rings.
     * High values will cause rings to move simultneously, low values gives them significant delay.
     */
    prop?: number

    push(
        clone = true,
    ): RingSpinEvent {
        getActiveDifficulty().ringSpinEvents.push(clone ? copy(this) : this)
        return this
    }

    fromJson(json: bsmap.v3.IBasicEventRing, v3: true): this
    fromJson(json: bsmap.v2.IEventRing, v3: false): this
    fromJson(
        json: bsmap.v3.IBasicEventRing | bsmap.v2.IEventRing,
        v3: boolean,
    ): this {
        // TODO: Implement custom data

        type Params = SubclassExclusiveProps<
            RingSpinEvent,
            BasicEvent
        >

        if (v3) {
            const obj = json as bsmap.v3.IBasicEventRing

            const params = {
                direction: getCDProp(obj, 'direction'),
                nameFilter: getCDProp(obj, 'nameFilter'),
                prop: getCDProp(obj, 'prop'),
                rotation: getCDProp(obj, 'rotation'),
                speed: getCDProp(obj, 'speed'),
                step: getCDProp(obj, 'step'),
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, true)
        } else {
            const obj = json as bsmap.v2.IEventRing

            const params = {
                direction: getCDProp(obj, '_direction'),
                nameFilter: getCDProp(obj, '_nameFilter'),
                prop: getCDProp(obj, '_prop'),
                rotation: getCDProp(obj, '_rotation'),
                speed: getCDProp(obj, '_speed'),
                step: getCDProp(obj, '_step'),
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, false)
        }
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.IBasicEventRing
    toJson(v3: false, prune?: boolean): bsmap.v2.IEventRing
    toJson(
        v3 = true,
        prune = true,
    ): bsmap.v2.IEventRing | bsmap.v3.IBasicEventRing {
        if (v3) {
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
