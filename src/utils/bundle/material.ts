import {blit, setMaterialProperty} from '../../builder_functions/beatmap/object/custom_event/vivify.ts'
import {
    MaterialProperties,
    MaterialPropertyMap,
    MaterialPropertyValues,
    StaticMaterialPropertyValues
} from "../../types/bundle.ts";

import {EASE} from "../../types/animation/easing.ts";
import {DeepReadonly} from "../../types/util/mutability.ts";
import {MATERIAL_PROP_TYPE, MaterialProperty} from "../../types/vivify/material.ts";
import {SetMaterialProperty} from "../../internals/beatmap/object/custom_event/vivify/set_material_property.ts";
import {Blit} from "../../internals/beatmap/object/custom_event/vivify/blit.ts";
import {AbstractDifficulty} from "../../internals/beatmap/abstract_beatmap.ts";

type MaterialSetParameters0<
    T extends MaterialProperties,
> = [
    values: Partial<MaterialPropertyValues<T>>,
    beat?: number,
    duration?: number,
    easing?: EASE,
    callback?: (
        event: SetMaterialProperty,
    ) => void,
]

type MaterialSetParameters1<
    T extends MaterialProperties,
    K extends keyof T,
> = [
    prop: K,
    value: MaterialPropertyMap[T[K]],
    beat?: number,
    duration?: number,
    easing?: EASE,
    callback?: (
        event: SetMaterialProperty,
    ) => void,
]

type MaterialSetParameters<
    T extends MaterialProperties,
    K2 extends keyof T,
> = MaterialSetParameters0<T> | MaterialSetParameters1<T, K2>


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
                    ConstructorParameters<typeof Blit>[0],
                    'asset'
                >,
            ]
    ) {
        if (typeof params[0] === 'object') {
            return blit(difficulty, {
                ...params[0],
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
        ...params: MaterialSetParameters0<T>
    ): void
    set<K extends keyof T>(
        difficulty: AbstractDifficulty,
        ...params: MaterialSetParameters1<T, K>
    ): void
    set<K extends keyof T>(
        difficulty: AbstractDifficulty,
        ...params: MaterialSetParameters<T, K>
    ) {
        if (typeof params[0] === 'object') {
            const setParams = [difficulty, ...params] as Parameters<typeof this.doSet>
            this.doSet(...setParams)
            return
        }

        const [prop, value, beat, duration, easing, callback] = params

        this.doSet(
            difficulty,
            { [prop]: value } as MaterialProperties,
            beat,
            duration as number,
            easing as EASE,
            callback,
        )
    }

    private doSet(
        difficulty: AbstractDifficulty,
        values: MaterialProperties,
        beat?: number,
        duration?: number,
        easing?: EASE,
        callback?: (event: SetMaterialProperty) => void,
    ) {
        beat ??= 0

        const fixedValues: MaterialProperty[] = []

        Object.entries(values).forEach(([k, v]) => {
            const fixedValue = typeof v === 'number' ? [v] : v

            fixedValues.push({
                id: k,
                type: this.propertyTypes[k] as MATERIAL_PROP_TYPE,
                value: fixedValue,
            })
        })

        const event = setMaterialProperty(
            difficulty,
            beat,
            this.path,
            fixedValues,
            duration,
            easing,
        )
        if (callback) callback(event)
    }
}
