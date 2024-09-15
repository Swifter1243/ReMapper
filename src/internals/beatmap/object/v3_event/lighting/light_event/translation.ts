import { BeatmapObject } from '../../../object.ts'
import { RotationEase } from '../../../../../../constants/v3_event.ts'
import { bsmap } from '../../../../../../deps.ts'
import { objectPrune } from '../../../../../../utils/object/prune.ts'
import { BeatmapObjectConstructor, BeatmapObjectDefaults } from '../../../../../../types/beatmap/object/object.ts'

export class LightTranslationEvent extends BeatmapObject<never, bsmap.v3.ILightTranslationBase> {
    constructor(obj: BeatmapObjectConstructor<LightTranslationEvent>) {
        super(obj)
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

    static defaults: BeatmapObjectDefaults<LightTranslationEvent> = {
        usePreviousEventTranslation: true,
        easing: RotationEase.None,
        magnitude: 0,
        ...super.defaults,
    }

    fromJsonV3(json: bsmap.v3.ILightTranslationBase): this {
        this.usePreviousEventTranslation = json.p !== undefined ? json.p === 1 : LightTranslationEvent.defaults.usePreviousEventTranslation
        this.easing = json.e ?? LightTranslationEvent.defaults.easing
        this.magnitude = json.t ?? LightTranslationEvent.defaults.magnitude
        return super.fromJsonV3(json)
    }

    fromJsonV2(_json: never): this {
        throw 'Event box groups are not supported in V2!'
    }

    toJsonV3(prune?: boolean): bsmap.v3.ILightTranslationBase {
        const output = {
            b: this.beat,
            e: this.easing as bsmap.v3.ILightTranslationBase['e'],
            p: this.usePreviousEventTranslation ? 1 : 0,
            t: this.magnitude,
            customData: this.customData,
        } satisfies bsmap.v3.ILightTranslationBase
        return prune ? objectPrune(output) : output
    }

    toJsonV2(_prune?: boolean): never {
        throw 'Event box groups are not supported in V2!'
    }
}
