import { ISetMaterialProperty } from '../../../../../types/beatmap/object/vivify_event_interfaces.ts'
import { MaterialProperty } from '../../../../../types/vivify/material.ts'
import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { EASE } from '../../../../../types/animation/easing.ts'
import { CustomEventConstructor } from '../../../../../types/beatmap/object/custom_event.ts'

import { getDataProp } from '../../../../../utils/beatmap/json.ts'
import { CustomEvent } from '../base/custom_event.ts'
import { JsonObjectDefaults } from '../../../../../types/beatmap/object/object.ts'

export class SetMaterialProperty extends CustomEvent<
    never,
    ISetMaterialProperty
> {
    constructor(
        params: CustomEventConstructor<SetMaterialProperty>,
    ) {
        super(params)
        this.type = 'SetMaterialProperty'
        this.asset = params.asset ?? SetMaterialProperty.defaults.asset
        this.properties = params.properties ?? copy<MaterialProperty[]>(SetMaterialProperty.defaults.properties)
        this.duration = params.duration
        this.easing = params.easing
    }

    /** File path to the material. */
    asset: string
    /** Properties to set. */
    properties: MaterialProperty[]
    /** The duration of the animation. */
    duration?: number
    /** An easing for the animation to follow. */
    easing?: EASE

    static override defaults: JsonObjectDefaults<SetMaterialProperty> = {
        asset: '',
        properties: [],
        ...super.defaults,
    }

    push(clone = true) {
        getActiveDifficulty().customEvents.setMaterialPropertyEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    override fromJsonV3(json: ISetMaterialProperty): this {
        this.asset = getDataProp(json.d, 'asset') ?? SetMaterialProperty.defaults.asset
        this.properties = getDataProp(json.d, 'properties') ?? copy<MaterialProperty[]>(SetMaterialProperty.defaults.properties)
        this.duration = getDataProp(json.d, 'duration')
        this.easing = getDataProp(json.d, 'easing')
        return super.fromJsonV3(json)
    }

    override fromJsonV2(_json: never): this {
        throw 'SetMaterialProperty is only supported in V3!'
    }

    toJsonV3(prune?: boolean): ISetMaterialProperty {
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

    toJsonV2(_prune?: boolean): never {
        throw 'SetMaterialProperty is only supported in V3!'
    }
}
