import { Fields } from '../../../../types/util.ts'
import { lightRotationEvent } from '../../../../builder_functions/v3_event/lighting/light_event.ts'
import { LightEventBox } from './base.ts'
import {DistributionType, LightAxis} from "../../../../data/constants/v3_event.ts";
import { bsmap } from '../../../../mod.ts'
import { objectPrune } from '../../../../utils/object/prune.ts'
import {LightRotationEvent} from "../light_event/rotation.ts";

export class LightRotationEventBox
    extends LightEventBox<bsmap.v3.ILightRotationEventBox, LightRotationEvent> {
    constructor(obj: Partial<Fields<LightRotationEventBox>>) {
        super(obj)
        this.rotationDistribution = obj.rotationDistribution ?? 0
        this.rotationDistributionType = obj.rotationDistributionType ??
            DistributionType.STEP
        this.rotationAxis = obj.rotationAxis ?? LightAxis.X
        this.flipRotation = obj.flipRotation ?? false
        this.rotationDistributionFirst = obj.rotationDistributionFirst ?? true
    }

    /** https://bsmg.wiki/mapping/map-format/lightshow.html#light-rotation-event-boxes-effect-distribution */
    rotationDistribution: number
    /** Determines how the rotation of all filtered objects should be adjusted when iterating through the sequence. */
    rotationDistributionType: DistributionType
    /** An integer value which controls the axis of rotation. */
    rotationAxis: LightAxis
    /** An integer value which determines whether the rotation should be mirrored. */
    flipRotation: boolean
    /** A binary integer value (0 or 1) which determines whether the distribution should affect the first light_event in the sequence. */
    rotationDistributionFirst: boolean

    fromJson(json: bsmap.v3.ILightRotationEventBox, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(json: bsmap.v3.ILightRotationEventBox, v3: boolean): this {
        if (!v3) throw 'Event boxes are not supported in V2!'

        type Params = Fields<LightRotationEventBox>

        const params = {
            filter: json.f,
            beatDistribution: json.w ?? 0,
            beatDistributionType: json.d,
            distributionEasing: json.i ?? 0,
            flipRotation: json.r === 1,
            rotationAxis: json.a ?? 0,
            rotationDistribution: json.s ?? 0,
            rotationDistributionFirst: json.b === 1,
            rotationDistributionType: json.t,
            events: json.l.map((x) => lightRotationEvent({}).fromJson(x, true)),
            customData: json.customData,
        } as Params

        Object.assign(this, params)
        return this
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.ILightRotationEventBox
    toJson(v3: false, prune?: boolean): never
    toJson(v3: boolean, prune?: boolean): bsmap.v3.ILightRotationEventBox {
        if (!v3) throw 'Event boxes are not supported in V2!'

        const output = {
            a: this.rotationAxis,
            b: this.rotationDistributionFirst ? 1 : 0,
            d: this.beatDistributionType,
            f: this.filter,
            i: this.distributionEasing as 0 | 1 | 2 | 3,
            l: this.events.map((x) => x.toJson(true)),
            r: this.flipRotation ? 1 : 0,
            s: this.rotationDistribution,
            t: this.rotationDistributionType,
            w: this.beatDistribution,
            customData: this.customData,
        } satisfies bsmap.v3.ILightRotationEventBox
        return prune ? objectPrune(output) : output
    }
}
