import { BasicEventExcludedFields } from '../../../../types/basic_event.ts'
import { getActiveDifficulty } from '../../../../data/active_difficulty.ts'
import { copy } from '../../../../utils/object/copy.ts'
import { Fields, SubclassExclusiveProps } from '../../../../types/util.ts'
import { objectPrune } from '../../../../utils/object/prune.ts'
import { BasicEvent } from './basic_event.ts'
import { bsmap } from '../../../../deps.ts'
import {getCDProp} from "../../../../utils/beatmap/object.ts";

export class LaserSpeedEvent<
    TV2 extends bsmap.v2.IEventLaser = bsmap.v2.IEventLaser,
    TV3 extends bsmap.v3.IBasicEventLaserRotation = bsmap.v3.IBasicEventLaserRotation,
> extends BasicEvent<TV2, TV3> {
    constructor(obj: BasicEventExcludedFields<LaserSpeedEvent<TV2, TV3>>) {
        super(obj)
        this.lockRotation = obj.lockRotation, this.speed = obj.speed, this.direction = obj.direction
    }

    /** Whether the existing rotation should be kept. */
    lockRotation?: boolean
    /** Speed of the rotating lasers. */
    speed?: number
    /** Direction of the rotating lasers. */
    direction?: number

    push(
        clone = true,
    ): LaserSpeedEvent<TV2, TV3> {
        getActiveDifficulty().laserSpeedEvents.push(clone ? copy(this) : this)
        return this
    }

    fromJson(json: TV3, v3: true): this
    fromJson(json: TV2, v3: false): this
    fromJson(json: TV2 | TV3, v3: boolean): this {
        type Params = Fields<
            SubclassExclusiveProps<
                LaserSpeedEvent,
                BasicEvent
            >
        >

        if (v3) {
            const obj = json as TV3

            const params = {
                direction: getCDProp(obj, 'direction'),
                lockRotation: getCDProp(obj, 'lockRotation'),
                speed: getCDProp(obj, 'speed'),
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, true)
        } else {
            const obj = json as TV2

            const params = {
                direction: getCDProp(obj, '_direction'),
                lockRotation: getCDProp(obj, '_lockPosition'),
                speed: getCDProp(obj, '_preciseSpeed'),
                // TODO: Confirm if this is correct?
                // _preciseSpeed vs _speed
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, false)
        }
    }

    toJson(v3: true, prune?: boolean): TV3
    toJson(v3: false, prune?: boolean): TV2
    toJson(
        v3: boolean,
        prune = true,
    ): bsmap.v2.IEventLaser | bsmap.v3.IBasicEventLaserRotation {
        if (v3) {
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
        } else {
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
}
