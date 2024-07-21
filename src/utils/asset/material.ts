import {DeepReadonly} from '../../types/util.ts'
import {MATERIAL_PROP_TYPE, MaterialProperty} from '../../types/vivify.ts'
import {EASE} from '../../types/animation.ts'
import {blit, setMaterialProperty} from '../../builder_functions/beatmap/object/custom_event/vivify.ts'
import {Blit, SetMaterialProperty} from "../../internals/beatmap/object/custom_event/vivify.ts";
import {MaterialProperties, MaterialPropertyMap} from "../../types/asset.ts";

type MaterialSetParameters0<
    T extends MaterialProperties,
> = [
    values: Partial<{ [K in keyof T]: MaterialPropertyMap[T[K]] }>,
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
    /** Properties in this material. */
    properties: DeepReadonly<T>

    constructor(path: string, name: string, properties: T) {
        this.path = path
        this.name = name
        this.properties = properties
    }

    /** Apply this material to the post processing stack. */
    blit(
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
            return blit({
                ...params[0],
                asset: this.path,
            }).push()
        }

        const [beat, duration, properties, easing] = params

        return blit({
            beat: beat as number,
            duration,
            properties,
            easing,
            asset: this.path,
        }).push()
    }

    /** Set a property on this material. Also allows for animations. */
    set(
        ...params: MaterialSetParameters0<T>
    ): void
    set<K extends keyof T>(
        ...params: MaterialSetParameters1<T, K>
    ): void
    set<K extends keyof T>(
        ...params: MaterialSetParameters<T, K>
    ) {
        if (typeof params[0] === 'object') {
            this.doSet(...params as Parameters<typeof this.doSet>)
            return
        }

        const [prop, value, beat, duration, easing, callback] = params

        this.doSet(
            { [prop]: value } as MaterialProperties,
            beat,
            duration as number,
            easing as EASE,
            callback,
        )
    }

    private doSet(
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
                type: this.properties[k] as MATERIAL_PROP_TYPE,
                value: fixedValue,
            })
        })

        const event = setMaterialProperty(
            beat,
            this.path,
            fixedValues,
            duration,
            easing,
        )
        if (callback) callback(event)
        event.push(false)
    }
}
