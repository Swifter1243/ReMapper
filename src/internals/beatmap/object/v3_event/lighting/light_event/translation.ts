import { RotationEase } from '../../../../../../constants/v3_event.ts'
import { bsmap } from '../../../../../../deps.ts'
import { objectPrune } from '../../../../../../utils/object/prune.ts'
import { BeatmapObjectConstructor, BeatmapObjectDefaults } from '../../../../../../types/beatmap/object/object.ts'
import {BaseLightEvent} from "./base.ts";
import {LightTranslationEventBox} from "../light_event_box/translation.ts";

export class LightTranslationEvent extends BaseLightEvent<bsmap.v3.ILightTranslationBase> {
    constructor(parent: LightTranslationEventBox, obj: BeatmapObjectConstructor<LightTranslationEvent>) {
        super(parent, obj)
        this.usePreviousEventTranslation = obj.usePreviousEventTranslation ?? LightTranslationEvent.defaults.usePreviousEventTranslation
        this.easing = obj.easing ?? LightTranslationEvent.defaults.easing
        this.magnitude = obj.magnitude ?? LightTranslationEvent.defaults.magnitude
    }

    /** If true, extend the state of the previous event. If not, transition from previous state to this state. */
    usePreviousEventTranslation: boolean
    /** The easing of the translation. */
    easing: RotationEase
    /** The magnitude of the translation. */
    magnitude: number

    static override defaults: BeatmapObjectDefaults<LightTranslationEvent> = {
        usePreviousEventTranslation: true,
        easing: RotationEase.None,
        magnitude: 0,
        ...super.defaults,
    }

    protected override getArray(parent: LightTranslationEventBox): this[] {
        return parent.events as this[]
    }

    override fromJsonV3(json: bsmap.v3.ILightTranslationBase): this {
        this.usePreviousEventTranslation = json.p !== undefined ? json.p === 1 : LightTranslationEvent.defaults.usePreviousEventTranslation
        this.easing = json.e ?? LightTranslationEvent.defaults.easing
        this.magnitude = json.t ?? LightTranslationEvent.defaults.magnitude
        return super.fromJsonV3(json)
    }

    override fromJsonV2(_json: never): this {
        throw new Error('Event box groups are not supported in V2!')
    }

    toJsonV3(prune?: boolean): bsmap.v3.ILightTranslationBase {
        const output = {
            b: this.beat,
            e: this.easing as bsmap.v3.ILightTranslationBase['e'],
            p: this.usePreviousEventTranslation ? 1 : 0,
            t: this.magnitude,
            customData: this.unsafeCustomData,
        } satisfies bsmap.v3.ILightTranslationBase
        return prune ? objectPrune(output) : output
    }
}
