import {Fields, SubclassExclusiveProps} from '../../../../types/util.ts'
import {EventGroup} from '../../../../data/constants/basic_event.ts'
import {getActiveDifficulty} from '../../../../data/active_difficulty.ts'
import {copy} from '../../../../utils/object/copy.ts'
import {objectPrune} from '../../../../utils/object/prune.ts'
import {BasicEvent} from './basic_event.ts'
import { bsmap } from '../../../../deps.ts'
import {getCDProp} from "../../../../utils/beatmap/object.ts";

export class RingZoomEvent extends BasicEvent<bsmap.v2.IEventZoom, bsmap.v3.IBasicEventRing> {
    constructor(obj: Partial<Omit<Fields<RingZoomEvent>, 'type'>>) {
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

    push(
        clone = true,
    ): RingZoomEvent {
        getActiveDifficulty().ringZoomEvents.push(clone ? copy(this) : this)
        return this
    }

    fromJson(json: bsmap.v3.IBasicEventRing, v3: true): this
    fromJson(json: bsmap.v2.IEventZoom, v3: false): this
    fromJson(
        json: bsmap.v2.IEventZoom | bsmap.v3.IBasicEventRing,
        v3: boolean,
    ): this {
        type Params = Fields<
            SubclassExclusiveProps<
                RingZoomEvent,
                BasicEvent
            >
        >

        if (v3) {
            const obj = json as bsmap.v3.IBasicEventRing

            const params = {
                speed: getCDProp(obj, 'speed'),
                step: getCDProp(obj, 'step'),
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, true)
        } else {
            const obj = json as bsmap.v2.IEventZoom

            const params = {
                speed: getCDProp(obj, '_speed'),
                step: getCDProp(obj, '_step'),
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, false)
        }
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.IBasicEventRing
    toJson(v3: false, prune?: boolean): bsmap.v2.IEventZoom
    toJson(
        v3 = true,
        prune = true,
    ): bsmap.v2.IEventZoom | bsmap.v3.IBasicEventRing {
        if (v3) {
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
        const output = {
            _floatValue: this.floatValue,
            _time: this.beat,
            // deno-lint-ignore no-explicit-any
            _type: this.type as any,
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

