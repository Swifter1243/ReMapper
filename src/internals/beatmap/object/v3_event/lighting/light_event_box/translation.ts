import { Fields } from '../../../../../../types/util/class.ts'
import { LightEventBox } from './base.ts'
import {DistributionType, LightAxis} from "../../../../../../data/constants/v3_event.ts";
import { bsmap } from '../../../../../../deps.ts'
import { objectPrune } from '../../../../../../utils/object/prune.ts'
import {LightTranslationEvent} from "../light_event/translation.ts";
import { lightTranslationEvent } from '../../../../../../builder_functions/beatmap/object/v3_event/lighting/light_event.ts'

export class LightTranslationEventBox extends LightEventBox<
    bsmap.v3.ILightTranslationEventBox,
    LightTranslationEvent
> {
    constructor(obj: Partial<Fields<LightTranslationEventBox>>) {
        super(obj)
        this.translationDistribution = obj.translationDistribution ?? 0
        this.translationDistributionType = obj.translationDistributionType ??
            DistributionType.STEP
        this.translationAxis = obj.translationAxis ?? LightAxis.X
        this.flipTranslation = obj.flipTranslation ?? false
        this.translationDistributionFirst = obj.translationDistributionFirst ??
            true
    }

    /** https://bsmg.wiki/mapping/map-format/lightshow.html#light-translation-event-boxes-effect-distribution */
    translationDistribution: number
    /** Determines how the translation of all filtered objects should be adjusted when iterating through the sequence. */
    translationDistributionType: DistributionType
    /** An integer value which controls the axis of translation. */
    translationAxis: LightAxis
    /** An integer value which determines whether the translation should be mirrored. */
    flipTranslation: boolean
    /** A binary integer value (0 or 1) which determines whether the distribution should affect the first event in the sequence. */
    translationDistributionFirst: boolean

    fromJson(json: bsmap.v3.ILightTranslationEventBox, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(json: bsmap.v3.ILightTranslationEventBox, v3: boolean): this {
        if (!v3) throw 'Event boxes are not supported in V2!'

        type Params = Fields<LightTranslationEventBox>

        const params = {
            filter: json.f,
            beatDistribution: json.w ?? 0,
            beatDistributionType: json.d,
            distributionEasing: json.i ?? 0,
            flipTranslation: json.r === 1,
            translationAxis: json.a ?? 0,
            translationDistribution: json.s ?? 0,
            translationDistributionFirst: json.b === 1,
            translationDistributionType: json.t,
            events: json.l.map((x) => lightTranslationEvent({}).fromJson(x, true)),
            customData: json.customData,
        } as Params

        Object.assign(this, params)
        return this
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.ILightTranslationEventBox
    toJson(v3: false, prune?: boolean): never
    toJson(v3: boolean, prune?: boolean): bsmap.v3.ILightTranslationEventBox {
        if (!v3) throw 'Event boxes are not supported in V2!'

        const output = {
            d: this.beatDistributionType,
            f: this.filter,
            i: this.distributionEasing as 0 | 1 | 2 | 3,
            w: this.beatDistribution,
            a: this.translationAxis,
            b: this.translationDistributionFirst ? 1 : 0,
            l: this.events.map((x) => x.toJson(true)),
            r: this.flipTranslation ? 1 : 0,
            s: this.translationDistribution,
            t: this.translationDistributionType,
            customData: this.customData,
        } satisfies bsmap.v3.ILightTranslationEventBox
        return prune ? objectPrune(output) : output
    }
}
