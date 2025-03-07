import { LightColorEvent } from '../light_event/color.ts'
import { LightEventBox } from './base.ts'
import { DistributionType } from '../../../../../../constants/v3_event.ts'
import { lightColorEvent } from '../../../../../../builder_functions/beatmap/object/v3_event/lighting/light_event.ts'
import { bsmap } from '../../../../../../deps.ts'
import { objectPrune } from '../../../../../../utils/object/prune.ts'
import { JsonObjectConstructor, JsonObjectDefaults } from '../../../../../../types/beatmap/object/object.ts'
import {LightColorEventBoxGroup} from "../light_event_box_group/color.ts";
import {LightEventBoxGroup} from "../light_event_box_group/base.ts";

export class LightColorEventBox extends LightEventBox<bsmap.v3.ILightColorEventBox, LightColorEvent> {
    constructor(parent: LightColorEventBoxGroup,  obj: JsonObjectConstructor<LightColorEventBox>) {
        super(parent, obj)
        this.brightnessDistribution = obj.brightnessDistribution ?? LightColorEventBox.defaults.brightnessDistribution
        this.brightnessDistributionType = obj.brightnessDistributionType ?? LightColorEventBox.defaults.brightnessDistributionType
        this.brightnessDistributionFirst = obj.brightnessDistributionFirst ?? LightColorEventBox.defaults.brightnessDistributionFirst
    }

    /** https://bsmg.wiki/mapping/map-format/lightshow.html#light-color-event-boxes-effect-distribution */
    brightnessDistribution: number
    /** Determines how the brightness of all filtered objects should be adjusted when iterating through the sequence. */
    brightnessDistributionType: DistributionType
    /** A binary integer value (0 or 1) which determines whether the distribution should affect the first event in the sequence. */
    brightnessDistributionFirst: boolean

    static override defaults: JsonObjectDefaults<LightColorEventBox> = {
        brightnessDistribution: 1,
        brightnessDistributionType: DistributionType.STEP,
        brightnessDistributionFirst: true,
        ...super.defaults,
        events: [],
    }

    protected override getArray(parent: LightEventBoxGroup): this[] {
        return parent.boxes as this[]
    }

    fromJsonV3(json: bsmap.v3.ILightColorEventBox): this {
        this.beatDistribution = json.w ?? LightColorEventBox.defaults.beatDistribution
        this.beatDistributionType = json.d ?? LightColorEventBox.defaults.beatDistribution
        this.brightnessDistribution = json.r ?? LightColorEventBox.defaults.brightnessDistribution
        this.brightnessDistributionFirst = json.b !== undefined ? json.b === 1 : LightColorEventBox.defaults.brightnessDistributionFirst
        this.brightnessDistributionType = json.t ?? LightColorEventBox.defaults.brightnessDistributionType
        this.distributionEasing = json.i ?? LightColorEventBox.defaults.distributionEasing
        this.unsafeCustomData = json.customData ?? LightColorEventBox.defaults.unsafeCustomData
        this.events = json.e.map((x) => lightColorEvent(this).fromJsonV3(x))
        this.filter = json.f ?? LightColorEventBox.defaults.brightnessDistributionFirst
        return this
    }

    fromJsonV2(_json: never): this {
        throw new Error('Event boxes are not supported in V2!')
    }

    toJsonV3(prune?: boolean): bsmap.v3.ILightColorEventBox {
        const output = {
            b: this.brightnessDistributionFirst ? 1 : 0,
            d: this.beatDistributionType,
            e: this.events.map((x) => x.toJsonV3(prune)),
            f: this.filter,
            i: this.distributionEasing as 0 | 1 | 2 | 3,
            r: this.brightnessDistribution,
            t: this.brightnessDistributionType,
            w: this.beatDistribution,
            customData: this.unsafeCustomData,
        } satisfies bsmap.v3.ILightColorEventBox
        return prune ? objectPrune(output) : output
    }

    toJsonV2(_prune?: boolean): never {
        throw new Error('Event boxes are not supported in V2!')
    }
}
