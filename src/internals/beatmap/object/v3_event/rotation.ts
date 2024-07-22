import { BaseObject, getCDProp } from '../beatmap/object/object.ts'
import { ConvertableEvent } from '../../types/v3_event.ts'
import { ObjectFields, SubclassExclusiveProps } from '../../types/object.ts'
import {EventGroup, InverseRotationAction, RotationAction} from '../../properties/constants/basic_event.ts'
import {getActiveDifficulty} from "../../properties/active_difficulty.ts";
import { copy } from '../../utils/object/copy.ts'
import { bsmap } from '../../deps.ts'
import { objectPrune } from '../../utils/object/prune.ts'

export class RotationEvent extends BaseObject<bsmap.v2.IEventLaneRotation, bsmap.v3.IRotationEvent>
    implements ConvertableEvent {
    constructor(obj: Partial<ObjectFields<RotationEvent>>) {
        super(obj)
        this.early = obj.early ?? true
        this.rotation = obj.rotation ?? 0
    }

    /** Whether this light_event effects current objects or only future ones. */
    early: boolean
    /** The rotation in degrees. V2 will only allow -60 to 60 in multiples of 15. */
    rotation: number

    push(
        clone = true,
    ) {
        getActiveDifficulty().rotationEvents.push(clone ? copy(this) : this)
        return this
    }

    fromBasicEvent(json: bsmap.v3.IBasicEventLaneRotation) {
        this.early = json.et === EventGroup.EARLY_ROTATION
        this.rotation = json.customData?.rotation ??
            InverseRotationAction[
                json.i as keyof typeof InverseRotationAction
            ]
        this.beat = json.b
        this.customData = json.customData
        return this
    }

    fromJson(json: bsmap.v3.IRotationEvent, v3: true): this
    fromJson(json: bsmap.v2.IEventLaneRotation, v3: false): this
    fromJson(
        json: bsmap.v2.IEventLaneRotation | bsmap.v3.IRotationEvent,
        v3: boolean,
    ): this {
        type Params = SubclassExclusiveProps<
            RotationEvent,
            BaseObject<
                bsmap.v2.IEventLaneRotation,
                bsmap.v3.IRotationEvent
            >
        >

        if (v3) {
            const obj = json as bsmap.v3.IRotationEvent

            const params = {
                early: obj.e === 1,
                rotation: obj.r ?? 0,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, true)
        } else {
            const obj = json as bsmap.v2.IEventLaneRotation

            const params = {
                early: obj._type === EventGroup.EARLY_ROTATION,
                rotation: getCDProp(obj, '_rotation') ??
                    InverseRotationAction[
                        (obj._value ?? 0) as keyof typeof InverseRotationAction
                    ],
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, false)
        }
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.IRotationEvent
    toJson(v3: false, prune?: boolean): bsmap.v2.IEventLaneRotation
    toJson(
        v3: boolean,
        prune = true,
    ): bsmap.v2.IEventLaneRotation | bsmap.v3.IRotationEvent {
        if (v3) {
            const output = {
                b: this.beat,
                e: this.early ? 1 : 0,
                r: this.rotation,
                customData: this.customData,
            } satisfies bsmap.v3.IRotationEvent
            return prune ? objectPrune(output) : output
        }

        let vanillaRotation

        if (
            this.rotation % 15 === 0 &&
            this.rotation >= -60 &&
            this.rotation <= 60
        ) {
            const key = (this.rotation < 0 ? 'CCW_' : 'CW_') +
                Math.abs(this.rotation) as keyof typeof RotationAction
            vanillaRotation = RotationAction[key]
        }

        return {
            _time: this.beat,
            _floatValue: 0,
            _type: this.early ? EventGroup.EARLY_ROTATION : EventGroup.LATE_ROTATION,
            _value: vanillaRotation ?? 0,
            _customData: {
                _rotation: vanillaRotation !== undefined ? undefined : this.rotation,
            },
        } satisfies bsmap.v2.IEventLaneRotation
    }
}
