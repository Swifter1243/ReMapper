import {
    CustomEvent,
    CustomEventConstructor,
    CustomEventSubclassFields,
    getDataProp,
} from '../base.ts'
import { ISetMaterialProperty } from '../../../../../types/beatmap/object/vivify_event_interfaces.ts'
import { MaterialProperty } from '../../../../../types/vivify/material.ts'
import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { EASE } from '../../../../../types/animation/easing.ts'

export class SetMaterialProperty extends CustomEvent<
    never,
    ISetMaterialProperty
> {
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

    /** File path to the material. */
    asset: string
    /** The duration of the animation. */
    duration?: number
    /** An easing for the animation to follow. */
    easing?: EASE
    /** Properties to set. */
    properties: MaterialProperty[] = []

    push(clone = true) {
        getActiveDifficulty().customEvents.setMaterialPropertyEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: ISetMaterialProperty, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(
        json:
            | ISetMaterialProperty
            | never,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<SetMaterialProperty>

        if (!v3) throw 'SetMaterialProperty is only supported in V3!'

        const obj = json as ISetMaterialProperty

        const params = {
            asset: getDataProp(obj.d, 'asset'),
            duration: getDataProp(obj.d, 'duration'),
            easing: getDataProp(obj.d, 'easing'),
            properties: getDataProp(obj.d, 'properties'),
        } as Params

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }

    toJson(v3: true, prune?: boolean): ISetMaterialProperty
    toJson(v3: false, prune?: boolean): never
    toJson(
        v3: boolean,
        prune = true,
    ) {
        if (!v3) throw 'SetMaterialProperty is only supported in V3!'

        if (!this.asset) {
            throw 'asset is undefined, which is required for SetMaterialProperty!'
        }
        if (Object.keys(this.properties).length === 0) {
            throw 'properties is empty, which is redundant for SetMaterialProperty!'
        }

        const output = {
            b: this.beat,
            d: {
                asset: this.asset,
                duration: this.duration,
                easing: this.easing,
                properties: this.properties,
                ...this.data,
            },
            t: 'SetMaterialProperty',
        } satisfies ISetMaterialProperty
        return prune ? objectPrune(output) : output
    }
}
