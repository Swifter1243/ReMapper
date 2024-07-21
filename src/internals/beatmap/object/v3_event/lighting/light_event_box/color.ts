import { Fields } from '../../../../types/util.ts'
import { lightColorEvent } from '../../../../builder_functions/v3_event/lighting/light_event.ts'
import { LightEventBox } from './base.ts'
import { bsmap } from '../../../../deps.ts'
import { DistributionType } from '../../../../data/constants/v3_event.ts'
import { objectPrune } from '../../../../utils/object/prune.ts'
import {LightColorEvent} from "../light_event/color.ts";

export class LightColorEventBox
    extends LightEventBox<bsmap.v3.ILightColorEventBox, LightColorEvent> {
    constructor(obj: Partial<Fields<LightColorEventBox>>) {
        super(obj)
        this.brightnessDistribution = obj.brightnessDistribution ?? 1
        this.brightnessDistributionType = obj.brightnessDistributionType ??
            DistributionType.STEP
        this.brightnessDistributionFirst = obj.brightnessDistributionFirst ??
            true
    }

    /** https://bsmg.wiki/mapping/map-format/lightshow.html#light-color-event-boxes-effect-distribution */
    brightnessDistribution: number
    /** Determines how the brightness of all filtered objects should be adjusted when iterating through the sequence. */
    brightnessDistributionType: DistributionType
    /** A binary integer value (0 or 1) which determines whether the distribution should affect the first light_event in the sequence. */
    brightnessDistributionFirst: boolean

    fromJson(json: bsmap.v3.ILightColorEventBox, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(json: bsmap.v3.ILightColorEventBox, v3: boolean): this {
        if (!v3) throw 'Event boxes are not supported in V2!'

        type Params = Fields<LightColorEventBox>

        const params = {
            beatDistribution: json.w ?? 0,
            beatDistributionType: json.d ?? 0,
            brightnessDistribution: json.r ?? 0,
            brightnessDistributionFirst: json.b === 1,
            brightnessDistributionType: json.t ?? 0,
            distributionEasing: json.i ?? 0,
            customData: json.customData,
            events: json.e.map((x) => lightColorEvent({}).fromJson(x, true)),
            filter: json.f,
        } as Params

        Object.assign(this, params)
        return this
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.ILightColorEventBox
    toJson(v3: false, prune?: boolean): never
    toJson(v3: boolean, prune?: boolean): bsmap.v3.ILightColorEventBox {
        if (!v3) throw 'Event boxes are not supported in V2!'

        const output = {
            b: this.brightnessDistributionFirst ? 1 : 0,
            d: this.beatDistributionType,
            e: this.events.map((x) => x.toJson(true)),
            f: this.filter,
            i: this.distributionEasing as 0 | 1 | 2 | 3,
            r: this.brightnessDistribution,
            t: this.brightnessDistributionType,
            w: this.beatDistribution,
            customData: this.customData,
        } satisfies bsmap.v3.ILightColorEventBox
        return prune ? objectPrune(output) : output
    }
}
