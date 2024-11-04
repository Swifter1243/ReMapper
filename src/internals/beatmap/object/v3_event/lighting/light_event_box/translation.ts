import { LightEventBox } from './base.ts'
import { DistributionType, LightAxis } from '../../../../../../constants/v3_event.ts'
import { bsmap } from '../../../../../../deps.ts'
import { objectPrune } from '../../../../../../utils/object/prune.ts'
import { LightTranslationEvent } from '../light_event/translation.ts'
import { lightTranslationEvent } from '../../../../../../builder_functions/beatmap/object/v3_event/lighting/light_event.ts'
import { JsonObjectConstructor, JsonObjectDefaults } from '../../../../../../types/beatmap/object/object.ts'
import {LightTranslationEventBoxGroup} from "../light_event_box_group/translation.ts";

export class LightTranslationEventBox extends LightEventBox<
    bsmap.v3.ILightTranslationEventBox,
    LightTranslationEvent
> {
    constructor(parent: LightTranslationEventBoxGroup, obj: JsonObjectConstructor<LightTranslationEventBox>) {
        super(parent, obj)
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

    static override defaults: JsonObjectDefaults<LightTranslationEventBox> = {
        translationDistribution: 0,
        translationDistributionType: DistributionType.STEP,
        translationAxis: LightAxis.X,
        flipTranslation: false,
        translationDistributionFirst: true,
        ...super.defaults,
        events: [],
    }

    protected override getArray(parent: LightTranslationEventBoxGroup): this[] {
        return parent.boxes as this[]
    }

    fromJsonV3(json: bsmap.v3.ILightTranslationEventBox): this {
        this.filter = json.f ?? LightTranslationEventBox.defaults.filter
        this.beatDistribution = json.w ?? LightTranslationEventBox.defaults.beatDistribution
        this.beatDistributionType = json.d ?? LightTranslationEventBox.defaults.beatDistributionType
        this.distributionEasing = json.i ?? LightTranslationEventBox.defaults.distributionEasing
        this.flipTranslation = json.r !== undefined ? json.r === 1 : LightTranslationEventBox.defaults.flipTranslation
        this.translationAxis = json.a ?? LightTranslationEventBox.defaults.translationAxis
        this.translationDistribution = json.s ?? LightTranslationEventBox.defaults.translationDistribution
        this.translationDistributionFirst = json.b !== undefined
            ? json.b === 1
            : LightTranslationEventBox.defaults.translationDistributionFirst
        this.translationDistributionType = json.t ?? LightTranslationEventBox.defaults.translationDistributionType
        this.events = json.l.map((x) => lightTranslationEvent(this).fromJsonV3(x))
        this.unsafeCustomData = json.customData ?? LightTranslationEventBox.defaults.unsafeCustomData
        return this
    }

    fromJsonV2(_json: never): this {
        throw new Error('Event boxes are not supported in V2!')
    }

    toJsonV3(prune?: boolean): bsmap.v3.ILightTranslationEventBox {
        const output = {
            d: this.beatDistributionType,
            f: this.filter,
            i: this.distributionEasing as 0 | 1 | 2 | 3,
            w: this.beatDistribution,
            a: this.translationAxis,
            b: this.translationDistributionFirst ? 1 : 0,
            l: this.events.map((x) => x.toJsonV3(prune)),
            r: this.flipTranslation ? 1 : 0,
            s: this.translationDistribution,
            t: this.translationDistributionType,
            customData: this.unsafeCustomData,
        } satisfies bsmap.v3.ILightTranslationEventBox
        return prune ? objectPrune(output) : output
    }

    toJsonV2(_prune?: boolean): never {
        throw new Error('Event boxes are not supported in V2!')
    }
}
