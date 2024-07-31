import { getActiveDifficulty } from '../../../../data/active_difficulty.ts'
import { copy } from '../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../utils/object/prune.ts'
import { BasicEvent } from './basic_event.ts'
import { bsmap } from '../../../../deps.ts'
import {getCDProp} from "../../../../utils/beatmap/json.ts";
import {DeepReadonly} from "../../../../types/util/mutability.ts";

import {ObjectFields} from "../../../../types/beatmap/object/object.ts";

export class LaserSpeedEvent extends BasicEvent<bsmap.v2.IEventLaser, bsmap.v3.IBasicEventLaserRotation> {
    constructor(obj: Partial<ObjectFields<LaserSpeedEvent>>) {
        super(obj)
        this.lockRotation = obj.lockRotation
        this.speed = obj.speed
        this.direction = obj.direction
    }

    /** Whether the existing rotation should be kept. */
    lockRotation?: boolean
    /** Speed of the rotating lasers. */
    speed?: number
    /** Direction of the rotating lasers. */
    direction?: number

    static defaults: DeepReadonly<ObjectFields<LaserSpeedEvent>> = {
        ...super.defaults
    }

    push(
        clone = true,
    ): LaserSpeedEvent {
        getActiveDifficulty().laserSpeedEvents.push(clone ? copy(this) : this)
        return this
    }


    fromJsonV3(json: bsmap.v3.IBasicEventLaserRotation): this {
        this.lockRotation = getCDProp(json, 'lockRotation')
        this.speed = getCDProp(json, 'speed')
        this.direction = getCDProp(json, 'direction')
        return super.fromJsonV3(json);
    }

    fromJsonV2(json: bsmap.v2.IEventLaser): this {
        this.lockRotation = getCDProp(json, '_lockPosition')
        this.speed = getCDProp(json, '_preciseSpeed')
        this.direction = getCDProp(json, '_direction')
        return super.fromJsonV2(json);
    }

    toJsonV3(prune?: boolean): bsmap.v3.IBasicEventLaserRotation {
        const output = {
            b: this.beat,
            et: this.type as bsmap.v3.IBasicEventLaserRotation['et'],
            f: this.floatValue,
            i: this.value,
            customData: {
                direction: this.direction,
                lockRotation: this.lockRotation,
                speed: this.speed,
                ...this.customData,
            },
        } satisfies bsmap.v3.IBasicEventLaserRotation
        return prune ? objectPrune(output) : output
    }

    toJsonV2(prune?: boolean): bsmap.v2.IEventLaser {
        const output = {
            _floatValue: this.floatValue,
            _time: this.beat,
            _type: this.type as bsmap.v2.IEventLaser['_type'],
            _value: this.value,
            _customData: {
                _direction: this.direction,
                _lockPosition: this.lockRotation,
                _preciseSpeed: this.speed,
                _speed: this.speed,
                ...this.customData,
            },
        } satisfies bsmap.v2.IEventLaser
        return prune ? objectPrune(output) : output
    }
}
