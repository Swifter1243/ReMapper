import { LightEventBox } from './base.ts'
import { DistributionType, LightAxis } from '../../../../../../constants/v3_event.ts'
import { bsmap } from '../../../../../../deps.ts'
import { objectPrune } from '../../../../../../utils/object/prune.ts'
import { LightRotationEvent } from '../light_event/rotation.ts'
import { lightRotationEvent } from '../../../../../../builder_functions/beatmap/object/v3_event/lighting/light_event.ts'
import { JsonObjectConstructor, JsonObjectDefaults } from '../../../../../../types/beatmap/object/object.ts'
import { LightColorEventBox } from './color.ts'
import {LightRotationEventBoxGroup} from "../light_event_box_group/rotation.ts";

export class LightRotationEventBox extends LightEventBox<bsmap.v3.ILightRotationEventBox, LightRotationEvent> {
    constructor(parent: LightRotationEventBoxGroup, obj: JsonObjectConstructor<LightRotationEventBox>) {
        super(parent, obj)
        this.rotationDistribution = obj.rotationDistribution ?? LightRotationEventBox.defaults.rotationDistribution
        this.rotationDistributionType = obj.rotationDistributionType ?? LightRotationEventBox.defaults.rotationDistributionType
        this.rotationAxis = obj.rotationAxis ?? LightRotationEventBox.defaults.rotationAxis
        this.flipRotation = obj.flipRotation ?? LightRotationEventBox.defaults.flipRotation
        this.rotationDistributionFirst = obj.rotationDistributionFirst ?? LightRotationEventBox.defaults.rotationDistributionFirst
    }

    /** https://bsmg.wiki/mapping/map-format/lightshow.html#light-rotation-event-boxes-effect-distribution */
    rotationDistribution: number
    /** Determines how the rotation of all filtered objects should be adjusted when iterating through the sequence. */
    rotationDistributionType: DistributionType
    /** An integer value which controls the axis of rotation. */
    rotationAxis: LightAxis
    /** An integer value which determines whether the rotation should be mirrored. */
    flipRotation: boolean
    /** A binary integer value (0 or 1) which determines whether the distribution should affect the first event in the sequence. */
    rotationDistributionFirst: boolean

    static override defaults: JsonObjectDefaults<LightRotationEventBox> = {
        rotationDistribution: 0,
        rotationDistributionType: DistributionType.STEP,
        rotationAxis: LightAxis.X,
        flipRotation: false,
        rotationDistributionFirst: true,
        ...super.defaults,
        events: [],
    }

    protected override getArray(parent: LightRotationEventBoxGroup): this[] {
        return parent.boxes as this[]
    }

    fromJsonV3(json: bsmap.v3.ILightRotationEventBox): this {
        this.filter = json.f ?? LightRotationEventBox.defaults.filter
        this.beatDistribution = json.w ?? LightRotationEventBox.defaults.beatDistribution
        this.beatDistributionType = json.d ?? LightRotationEventBox.defaults.beatDistributionType
        this.distributionEasing = json.i ?? LightRotationEventBox.defaults.distributionEasing
        this.flipRotation = json.r !== undefined ? json.r === 1 : LightRotationEventBox.defaults.flipRotation
        this.rotationAxis = json.a ?? LightRotationEventBox.defaults.rotationAxis
        this.rotationDistribution = json.s ?? LightRotationEventBox.defaults.rotationDistribution
        this.rotationDistributionFirst = json.b !== undefined ? json.b === 1 : LightRotationEventBox.defaults.rotationDistributionFirst
        this.rotationDistributionType = json.t ?? LightRotationEventBox.defaults.rotationDistributionType
        this.events = json.l.map((x) => lightRotationEvent(this).fromJsonV3(x))
        this.customData = json.customData ?? LightColorEventBox.defaults.customData
        return this
    }

    fromJsonV2(_json: never): this {
        throw 'Event boxes are not supported in V2!'
    }

    toJsonV3(prune?: boolean): bsmap.v3.ILightRotationEventBox {
        const output = {
            a: this.rotationAxis,
            b: this.rotationDistributionFirst ? 1 : 0,
            d: this.beatDistributionType,
            f: this.filter,
            i: this.distributionEasing as 0 | 1 | 2 | 3,
            l: this.events.map((x) => x.toJsonV3(prune)),
            r: this.flipRotation ? 1 : 0,
            s: this.rotationDistribution,
            t: this.rotationDistributionType,
            w: this.beatDistribution,
            customData: this.customData,
        } satisfies bsmap.v3.ILightRotationEventBox
        return prune ? objectPrune(output) : output
    }

    toJsonV2(_prune?: boolean): never {
        throw 'Event boxes are not supported in V2!'
    }
}
