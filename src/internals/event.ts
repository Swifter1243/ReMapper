import { EventGroup } from '../data/constants.ts'
import { bsmap } from '../deps.ts'
import {
    copy,
    Fields,
    getActiveDifficulty,
    InverseRotationAction,
    jsonPrune,
    JsonWrapper,
    RotationAction,
} from '../mod.ts'
import { ObjectFields, SubclassExclusiveProps } from '../types/util.ts'
import { BaseObject, getCDProp } from './object.ts'

interface ConvertableEvent {
    /** V3 only. Import from the deprecated basic event form into the new proper events.  */
    fromBasicEvent(json: bsmap.v3.IBaseObject): this
}

export class RotationEvent
    extends BaseObject<bsmap.v2.IEventLaneRotation, bsmap.v3.IRotationEvent>
    implements ConvertableEvent {
    constructor(obj: Partial<ObjectFields<RotationEvent>>) {
        super(obj)
        this.early = obj.early ?? true
        this.rotation = obj.rotation ?? 0
    }

    /** Whether this event effects current objects or only future ones. */
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
            _time: this.beat,
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
    extends BaseObject<bsmap.v2.IEvent, bsmap.v3.IColorBoostEvent>
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
            return prune ? jsonPrune(output) : output
        }

        const output = {
            _time: this.beat,
            _floatValue: 0,
            _type: EventGroup.BOOST,
            _value: this.boost ? 1 : 0,
            _customData: this.customData,
        } satisfies bsmap.v2.IEvent
        return prune ? jsonPrune(output) : output
    }
}

/*
- V2 Custom Event
- V2 Basic Event

- V3 Custom Event
- V3 Basic Event
- V3 Event
*/

// V3 Basic Event -> V3 Event

type V2BPM = bsmap.v2.IBPMChange | bsmap.v2.IBPMChangeOld | bsmap.v2.IEvent
type V3BPM = bsmap.v3.IBPMChange | bsmap.v3.IBPMEvent

export abstract class BPMEvent<
    TV2 extends V2BPM = V2BPM,
    TV3 extends V3BPM = V3BPM,
> implements JsonWrapper<TV2, TV3> {
    constructor(obj: Partial<Fields<BPMEvent>>) {
        this.beat = obj.beat ?? 0
    }

    /** The beat the event will activate. */
    beat: number

    push(
        clone = true,
    ) {
        getActiveDifficulty().bpmEvents.push(clone ? copy(this) : this)
        return this
    }

    fromJson(json: TV3, v3: true): this
    fromJson(json: TV2, v3: false): this
    fromJson(json: TV2 | TV3, v3: boolean): this {
        type Params = ObjectFields<BaseObject<TV2, TV3>>

        if (v3) {
            const obj = json as TV3

            const params = {
                beat: obj.b ?? 0,
            } as Params

            Object.assign(this, params)
        } else {
            const obj = json as TV2

            const params = {
                beat: obj._time ?? 0,
            } as Params

            Object.assign(this, params)
        }

        return this
    }

    abstract toJson(v3: true, prune?: boolean): TV3
    abstract toJson(v3: false, prune?: boolean): TV2
    abstract toJson(v3: true, prune?: boolean): TV2 | TV3
}

export class OfficialBPMEvent extends BPMEvent<
    bsmap.v2.IEvent,
    bsmap.v3.IBPMEvent
> implements ConvertableEvent {
    constructor(obj: Partial<Fields<OfficialBPMEvent>>) {
        super(obj)
        this.bpm = obj.bpm ?? 0
    }

    /** What BPM this event changes the map to. */
    bpm: number

    fromBasicEvent(json: bsmap.v3.IBasicEvent) {
        this.beat = json.b
        this.bpm = json.f
        return this
    }

    fromJson(json: bsmap.v3.IBPMEvent, v3: true): this
    fromJson(json: bsmap.v2.IEvent, v3: false): this
    fromJson(
        json: bsmap.v2.IEvent | bsmap.v3.IBPMEvent,
        v3: boolean,
    ): this {
        type Params = SubclassExclusiveProps<
            OfficialBPMEvent,
            BPMEvent<
                bsmap.v2.IEvent,
                bsmap.v3.IBPMEvent
            >
        >

        if (v3) {
            const obj = json as bsmap.v3.IBPMEvent

            const params = {
                bpm: obj.m ?? 0,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, true)
        } else {
            const obj = json as bsmap.v2.IEvent

            const params = {
                bpm: obj._floatValue ?? 0,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, false)
        }
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.IBPMEvent
    toJson(v3: false, prune?: boolean): bsmap.v2.IEvent
    toJson(
        v3 = true,
        prune = true,
    ): bsmap.v2.IEvent | bsmap.v3.IBPMEvent {
        if (v3) {
            const output = {
                b: this.beat,
                m: this.bpm,
                customData: undefined,
            } satisfies bsmap.v3.IBPMEvent
            return prune ? jsonPrune(output) : output
        }

        const output = {
            _time: this.beat,
            _floatValue: this.bpm,
            _type: EventGroup.BPM,
            _value: 0,
            _customData: undefined,
        } satisfies bsmap.v2.IEvent
        return prune ? jsonPrune(output) : output
    }
}

export class CommunityBPMEvent extends BPMEvent<
    bsmap.v2.IBPMChange | bsmap.v2.IBPMChangeOld,
    bsmap.v3.IBPMChange
> {
    constructor(obj: Partial<Fields<CommunityBPMEvent>>) {
        super(obj)
        this.bpm = obj.bpm ?? 0
        this.mediocreMapper = obj.mediocreMapper ?? false
        this.beatsPerBar = obj.beatsPerBar ?? 4
        this.metronomeOffset = obj.metronomeOffset ?? 0
    }

    /** What BPM this event changes the map to. */
    bpm: number
    /** Whether this event is in the mediocre mapper format. */
    mediocreMapper: boolean
    /** ??? */
    beatsPerBar: number
    /** ??? */
    metronomeOffset: number

    fromJson(json: bsmap.v3.IBPMChange, v3: true): this
    fromJson(
        json: bsmap.v2.IBPMChange | bsmap.v2.IBPMChangeOld,
        v3: false,
    ): this
    fromJson(
        json:
            | bsmap.v2.IBPMChange
            | bsmap.v2.IBPMChangeOld
            | bsmap.v3.IBPMChange,
        v3: boolean,
    ): this {
        type Params = SubclassExclusiveProps<
            CommunityBPMEvent,
            BPMEvent<
                bsmap.v2.IBPMChange | bsmap.v2.IBPMChangeOld,
                bsmap.v3.IBPMChange
            >
        >

        if (v3) {
            const obj = json as bsmap.v3.IBPMChange

            const params = {
                bpm: obj.m ?? 0,
                beatsPerBar: obj.p ?? 0,
                metronomeOffset: obj.o ?? 0,
                mediocreMapper: false,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, true)
        } else {
            const obj = json as bsmap.v2.IBPMChange | bsmap.v2.IBPMChangeOld

            const mediocreMapper = obj._bpm !== undefined

            const params = {
                bpm: mediocreMapper ? obj._bpm : obj._BPM,
                beatsPerBar: obj._beatsPerBar,
                mediocreMapper: mediocreMapper,
                metronomeOffset: obj._metronomeOffset,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, false)
        }
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.IBPMChange
    toJson(
        v3: false,
        prune?: boolean,
    ): bsmap.v2.IBPMChange | bsmap.v2.IBPMChangeOld
    toJson(
        v3 = true,
        prune = true,
    ): bsmap.v2.IBPMChange | bsmap.v2.IBPMChangeOld | bsmap.v3.IBPMChange {
        if (v3) {
            const output = {
                b: this.beat,
                m: this.bpm,
                o: this.metronomeOffset,
                p: this.beatsPerBar,
            } satisfies bsmap.v3.IBPMChange
            return prune ? jsonPrune(output) : output
        }

        if (this.mediocreMapper) {
            const output = {
                _time: this.beat,
                _bpm: this.bpm,
                _BPM: undefined as never,
                _beatsPerBar: this.beatsPerBar,
                _metronomeOffset: this.metronomeOffset,
            } satisfies bsmap.v2.IBPMChangeOld
            return prune ? jsonPrune(output) : output
        }

        const output = {
            _time: this.beat,
            _BPM: this.bpm,
            _beatsPerBar: this.beatsPerBar,
            _metronomeOffset: this.metronomeOffset,
        } satisfies bsmap.v2.IBPMChange
        return prune ? jsonPrune(output) : output
    }
}
