import { bsmap } from '../../../../deps.ts'
import { BeatmapObject } from '../object.ts'
import { ConvertableEvent } from '../../../../types/beatmap/object/v3_event.ts'
import { getActiveDifficulty } from '../../../../data/active_difficulty.ts'
import { copy } from '../../../../utils/object/copy.ts'
import { EventGroup, InverseRotationAction, RotationAction } from '../../../../data/constants/basic_event.ts'
import { getCDProp } from '../../../../utils/beatmap/json.ts'
import { objectPrune } from '../../../../utils/object/prune.ts'
import { BeatmapObjectConstructor, BeatmapObjectDefaults } from '../../../../types/beatmap/object/object.ts'

export class RotationEvent extends BeatmapObject<bsmap.v2.IEventLaneRotation, bsmap.v3.IRotationEvent> implements ConvertableEvent {
    constructor(obj: BeatmapObjectConstructor<RotationEvent>) {
        super(obj)
        this.early = obj.early ?? RotationEvent.defaults.early
        this.rotation = obj.rotation ?? RotationEvent.defaults.rotation
    }

    /** Whether this event effects current objects or only future ones. */
    early: boolean
    /** The rotation in degrees. V2 will only allow -60 to 60 in multiples of 15. */
    rotation: number

    static defaults: BeatmapObjectDefaults<RotationEvent> = {
        early: true,
        rotation: 0,
        ...super.defaults,
    }

    push(clone = true) {
        getActiveDifficulty().rotationEvents.push(clone ? copy(this) : this)
        return this
    }

    private tryInverseRotation(value: number) {
        if (value === undefined) return
        try {
            return InverseRotationAction[value as keyof typeof InverseRotationAction]
        } catch {
            return
        }
    }

    fromBasicEvent(json: bsmap.v3.IBasicEventLaneRotation) {
        this.early = json.et !== undefined ? json.et === EventGroup.EARLY_ROTATION : RotationEvent.defaults.early
        this.rotation = json.customData?.rotation ?? this.tryInverseRotation(json.i) ?? RotationEvent.defaults.rotation
        this.beat = json.b ?? RotationEvent.defaults.beat
        this.customData = json.customData ?? RotationEvent.defaults.customData
        return this
    }

    fromJsonV3(json: bsmap.v3.IRotationEvent): this {
        this.early = json.e !== undefined ? json.e === 0 : RotationEvent.defaults.early
        this.rotation = json.r ?? RotationEvent.defaults.rotation
        return super.fromJsonV3(json);
    }

    fromJsonV2(json: bsmap.v2.IEventLaneRotation): this {
        this.early = json._type !== undefined ? json._type === EventGroup.EARLY_ROTATION : RotationEvent.defaults.early
        this.rotation = getCDProp(json, '_rotation') ?? this.tryInverseRotation(json._value) ?? RotationEvent.defaults.rotation
        return super.fromJsonV2(json);
    }

    toJsonV3(prune?: boolean): bsmap.v3.IRotationEvent {
        const output = {
            b: this.beat,
            e: this.early ? 0 : 1,
            r: this.rotation,
            customData: this.customData,
        } satisfies bsmap.v3.IRotationEvent
        return prune ? objectPrune(output) : output
    }

    toJsonV2(prune?: boolean): bsmap.v2.IEventLaneRotation {
        let vanillaRotation

        if (
            this.rotation % 15 === 0 &&
            this.rotation >= -60 &&
            this.rotation <= 60
        ) {
            const key = (this.rotation < 0 ? 'CCW_' : 'CW_') + Math.abs(this.rotation)
            vanillaRotation = RotationAction[key as keyof typeof RotationAction]
        }

        const output = {
            _time: this.beat,
            _floatValue: 0,
            _type: this.early ? EventGroup.EARLY_ROTATION : EventGroup.LATE_ROTATION,
            _value: vanillaRotation ?? 0,
            _customData: {
                _rotation: vanillaRotation === undefined ? this.rotation : undefined,
            },
        } satisfies bsmap.v2.IEventLaneRotation
        return prune ? objectPrune(output) : output
    }
}
