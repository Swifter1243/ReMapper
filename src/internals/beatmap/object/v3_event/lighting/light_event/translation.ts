import {bsmap} from '../../../../deps.ts'
import {ObjectFields, SubclassExclusiveProps} from '../../../../types/object.ts'
import {BaseObject} from '../../../beatmap/object/object.ts'
import {RotationEase} from "../../../../properties/constants/v3_event.ts";
import {objectPrune} from "../../../../utils/object/prune.ts";

export class LightTranslationEvent extends BaseObject<never, bsmap.v3.ILightTranslationBase> {
    constructor(obj: Partial<ObjectFields<LightTranslationEvent>>) {
        super(obj)
        this.usePreviousEventTranslation = obj.usePreviousEventTranslation ??
            false
        this.easing = obj.easing ?? RotationEase.None
        this.magnitude = obj.magnitude ?? 0
    }

    /** If true, extend the state of the previous light_event. If not, transition from previous state to this state. */
    usePreviousEventTranslation: boolean
    /** The easing of the translation. */
    easing: RotationEase
    /** The magnitude of the translation. */
    magnitude: number

    fromJson(json: bsmap.v3.ILightTranslationBase, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(json: bsmap.v3.ILightTranslationBase, v3: boolean): this {
        if (!v3) throw 'Event box groups are not supported in V2!'

        type Params = SubclassExclusiveProps<
            LightTranslationEvent,
            BaseObject<never, bsmap.v3.ILightTranslationBase>
        >

        const params = {
            easing: json.e ?? 0,
            usePreviousEventTranslation: json.p === 1,
            magnitude: json.t ?? 0,
        } as Params

        Object.assign(this, params)
        return super.fromJson(json, true)
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.ILightTranslationBase
    toJson(v3: false, prune?: boolean): never
    toJson(v3: boolean, prune?: boolean): bsmap.v3.ILightTranslationBase {
        if (!v3) throw 'Event box groups are not supported in V2!'

        const output = {
            b: this.beat,
            e: this.easing as bsmap.v3.ILightTranslationBase['e'],
            p: this.usePreviousEventTranslation ? 1 : 0,
            t: this.magnitude,
            customData: this.customData,
        } satisfies bsmap.v3.ILightTranslationBase
        return prune ? objectPrune(output) : output
    }
}
