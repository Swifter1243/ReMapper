import { getActiveDifficulty } from '../../data/beatmap_handler.ts'
import { EASE } from '../../types/animation_types.ts'
import { BeatmapInterfaces } from '../../types/mod.ts'
import { MaterialProperty } from '../../types/vivify_types.ts'
import { copy } from '../../utils/general.ts'
import { jsonPrune } from '../../utils/json.ts'
import {
    BaseCustomEvent,
    CustomEventConstructor,
    CustomEventSubclassFields,
} from './base.ts'

export class SetMaterialProperty extends BaseCustomEvent<
    never,
    BeatmapInterfaces.SetMaterialProperty
> {
    /**
     * Animate objects on a track across their lifespan.
     */
    constructor(
        params: CustomEventConstructor<SetMaterialProperty>,
    ) {
        super(params)
        this.type = 'SetMaterialProperty'
        this.asset = params.asset ?? ''
        if (params.duration) this.duration = params.duration
        if (params.easing) this.easing = params.easing
        if (params.properties) this.properties = params.properties
    }

    asset: string
    duration?: number
    easing?: EASE
    properties: MaterialProperty[] = []

    /** Push this event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        getActiveDifficulty().assignPathAnimations.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: BeatmapInterfaces.SetMaterialProperty, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(
        json:
            | BeatmapInterfaces.SetMaterialProperty
            | never,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<SetMaterialProperty>

        if (!v3) throw 'SetMaterialProperty is only supported in V3!'

        const obj = json as BeatmapInterfaces.SetMaterialProperty

        const params = {
            asset: obj.d.asset,
            duration: obj.d.duration,
            easing: obj.d.easing,
            properties: obj.d.properties,
        } as Params

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }

    toJson(v3: true, prune?: boolean): BeatmapInterfaces.SetMaterialProperty
    toJson(v3: false, prune?: boolean): never
    toJson(
        v3: boolean,
        prune = true,
    ) {
        if (!v3) throw 'SetMaterialProperty is only supported in V3!'

        const output = {
            b: this.beat,
            d: {
                asset: this.asset,
                duration: this.duration,
                easing: this.easing,
                ...this.data,
                ...this.properties
            },
            t: 'SetMaterialProperty',
        } satisfies BeatmapInterfaces.SetMaterialProperty
        return prune ? jsonPrune(output) : output
    }
}
