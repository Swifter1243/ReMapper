import { blit, setMaterialProperty } from '../../builder_functions/beatmap/object/custom_event/vivify.ts'
import { MaterialProperties, MaterialPropertyValues, StaticMaterialPropertyValues } from '../../types/bundle.ts'

import { EASE } from '../../types/animation/easing.ts'
import { DeepReadonly } from '../../types/util/mutability.ts'
import { MATERIAL_PROP_TYPE, MaterialProperty } from '../../types/vivify/material.ts'
import { Blit } from '../../internals/beatmap/object/custom_event/vivify/blit.ts'
import { AbstractDifficulty } from '../../internals/beatmap/abstract_beatmap.ts'

/** Used to load type safe materials. See `loadAssets` */
export class Material<T extends MaterialProperties = MaterialProperties> {
    /** Path to this material in the asset bundle. */
    readonly path: string
    /** Name of this material. */
    readonly name: string
    /** Properties in this material and their corresponding type. */
    readonly propertyTypes: DeepReadonly<T>
    /** The default values for properties in this material. */
    readonly defaults: DeepReadonly<StaticMaterialPropertyValues<T>>

    constructor(path: string, name: string, propertyTypes: T, defaults: typeof this.defaults) {
        this.path = path
        this.name = name
        this.propertyTypes = propertyTypes
        this.defaults = defaults
    }

    /** Apply this material to the post processing stack. */
    blit(
        difficulty: AbstractDifficulty,
        ...params:
            | [
                beat?: number,
                duration?: number,
                properties?: MaterialProperty[],
                easing?: EASE,
            ]
            | [
                Omit<
                    ConstructorParameters<typeof Blit>[1],
                    'asset'
                >,
            ]
    ) {
        if (typeof params[0] === 'object') {
            const obj = params[0]

            return blit(difficulty, {
                ...obj,
                asset: this.path,
            })
        }

        const [beat, duration, properties, easing] = params

        return blit(difficulty, {
            beat: beat as number,
            duration,
            properties,
            easing,
            asset: this.path,
        })
    }

    /** Set a property on this material. Also allows for animations. */
    set(
        difficulty: AbstractDifficulty,
        values: Partial<MaterialPropertyValues<T>>,
        beat?: number,
        duration?: number,
        easing?: EASE
    ) {
        beat ??= 0

        const fixedValues: MaterialProperty[] = Object.entries(values).map(([id, value]) => {
            return {
                id,
                type: this.propertyTypes[id] as MATERIAL_PROP_TYPE,
                value,
            }
        })

        return setMaterialProperty(
            difficulty,
            beat,
            this.path,
            fixedValues,
            duration,
            easing,
        )
    }
}
