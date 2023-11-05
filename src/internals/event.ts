import { EventGroup } from '../data/constants.ts'
import { bsmap } from '../deps.ts'
import { InverseRotationAction, RotationAction, copy, getActiveDiff, jsonPrune } from '../mod.ts'
import { ObjectFields, SubclassExclusiveProps } from '../types/util_types.ts'
import { BaseObject, getCDProp } from './object.ts'

export class RotationEvent
    extends BaseObject<bsmap.v2.IEventLaneRotation, bsmap.v3.IRotationEvent> {
    /**
     * Event to spin the gameplay objects in the map.
     * The new rotation events should be used instead.
     * @param type Type of the event.
     * @param rotation The rotation of the event.
     */
    constructor(obj: Partial<ObjectFields<RotationEvent>>) {
        super(obj)
        this.early = obj.early ?? true
        this.rotation = obj.rotation ?? 0
    }

    early: boolean
    rotation: number

    push(
        clone = true,
    ) {
        getActiveDiff().rotationEvents.push(clone ? copy(this) : this)
        return this
    }

    fromBasicEvent(json: bsmap.v3.IBasicEventLaneRotation) {
        this.early = json.et === EventGroup.EARLY_ROTATION
        this.rotation = json.customData?.rotation ??
            InverseRotationAction[
                json.i as keyof typeof InverseRotationAction
            ]
        this.time = json.b
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
                rotation: obj.r,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, true)
        } else {
            const obj = json as bsmap.v2.IEventLaneRotation

            const params = {
                early: obj._type === EventGroup.EARLY_ROTATION,
                rotation: getCDProp(obj, '_rotation') ??
                    InverseRotationAction[
                        obj._value as keyof typeof InverseRotationAction
                    ],
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, false)
        }
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.IRotationEvent
    toJson(v3: false, prune?: boolean): bsmap.v2.IEventLaneRotation
    toJson(
        v3: boolean, prune = true
    ): bsmap.v2.IEventLaneRotation | bsmap.v3.IRotationEvent {
        if (v3) {
            const output = {
                b: this.time,
                e: this.early ? 1 : 0,
                r: this.rotation,
                customData: this.customData,
            } satisfies bsmap.v3.IRotationEvent
            return prune ? jsonPrune(output) : output
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
            _time: this.time,
            _floatValue: 0,
            _type: this.early
                ? EventGroup.EARLY_ROTATION
                : EventGroup.LATE_ROTATION,
            _value: vanillaRotation ?? 0,
            _customData: {
                _rotation: vanillaRotation !== undefined
                    ? undefined
                    : this.rotation,
            },
        } satisfies bsmap.v2.IEventLaneRotation
    }
}

export class BoostEvent
    extends BaseObject<bsmap.v2.IEvent, bsmap.v3.IColorBoostEvent> {
    constructor(obj: Partial<ObjectFields<BoostEvent>>) {
        super(obj)
        this.boost = obj.boost ?? false
    }

    boost: boolean

    push(
        clone = true,
    ) {
        getActiveDiff().boostEvents.push(clone ? copy(this) : this)
        return this
    }

    fromBasicEvent(json: bsmap.v3.IBasicEventBoost) {
        this.boost = json.i === 1
        this.time = json.b
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
    toJson(v3 = true, prune = true): bsmap.v2.IEvent | bsmap.v3.IColorBoostEvent {
        if (v3) {
            const output = {
                b: this.time,
                o: this.boost,
                customData: this.customData,
            } satisfies bsmap.v3.IColorBoostEvent
            return prune ? jsonPrune(output) : output
        }

        const output = {
            _time: this.time,
            _floatValue: 0,
            _type: EventGroup.BOOST,
            _value: this.boost ? 1 : 0,
            _customData: this.customData,
        } satisfies bsmap.v2.IEvent
        return prune ? jsonPrune(output) : output
    }
}
