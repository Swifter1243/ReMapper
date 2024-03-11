import {
    destroyPrefab,
    instantiatePrefab,
    setMaterialProperty,
} from '../beatmap/custom_event.ts'
import { CustomEventInternals } from '../internals/mod.ts'
import { EASE, RuntimePointDefinitionLinear } from '../types/animation_types.ts'
import { RuntimePointDefinitionVec4 } from '../types/animation_types.ts'
import { FILEPATH } from '../types/beatmap_types.ts'
import { ColorVec, Vec4 } from '../types/data_types.ts'
import { MaterialProperty } from '../types/mod.ts'
import { MATERIAL_PROP_TYPE } from '../types/vivify_types.ts'

type PrefabMap = Record<string, string>

type MaterialProperties = Record<string, MATERIAL_PROP_TYPE>

type MaterialMap = Record<string, {
    path: string
    properties: Record<string, Partial<Record<MATERIAL_PROP_TYPE, unknown>>>
}>

type AssetMap = {
    default: {
        materials: MaterialMap
        prefabs: PrefabMap
    }
}

type FixedMaterialMap<BaseMaterial extends MaterialMap[string]> = {
    path: string
    properties: {
        [MaterialProperty in keyof BaseMaterial['properties']]:
            BaseMaterial['properties'][MaterialProperty] extends
                Record<string, unknown> ? Extract<
                    keyof BaseMaterial['properties'][MaterialProperty],
                    MATERIAL_PROP_TYPE
                >
                : never
    }
}

type MaterialPropertyMap = {
    'Texture': FILEPATH
    'Float': number | RuntimePointDefinitionLinear
    'Color': ColorVec | RuntimePointDefinitionVec4
    'Vector': Vec4 | RuntimePointDefinitionVec4
}

export class Prefab {
    path: string
    name: string
    private iteration = 0

    constructor(path: string, name: string) {
        this.path = path
        this.name = name
    }

    instantiate(
        beat = 0,
        event?: (event: CustomEventInternals.InstantiatePrefab) => void,
    ) {
        const id = `${this.name}_${this.iteration}`
        const instantiation = instantiatePrefab(beat, this.path, id, id)
        if (event) event(instantiation)
        instantiation.push()
        this.iteration++
        return new PrefabInstance(id)
    }
}

export class PrefabInstance {
    id: string
    destroyed = false

    constructor(id: string) {
        this.id = id
    }

    destroy(beat = 0) {
        if (this.destroyed) throw `Prefab ${this.id} is already destroyed.`

        destroyPrefab(beat, this.id).push()
        this.destroyed = true
    }
}

export class Material<T extends MaterialProperties = MaterialProperties> {
    path: string
    name: string
    properties: T

    constructor(path: string, name: string, properties: T) {
        this.path = path
        this.name = name
        this.properties = properties
    }

    set(
        values: Partial<{ [K in keyof T]: MaterialPropertyMap[T[K]] }>,
        beat?: number,
        duration?: number,
        easing?: EASE,
        callback?: (
            event: CustomEventInternals.SetMaterialProperty,
        ) => void,
    ): void
    set<K extends keyof T>(
        prop: K,
        value: MaterialPropertyMap[T[K]],
        beat?: number,
        duration?: number,
        easing?: EASE,
        callback?: (
            event: CustomEventInternals.SetMaterialProperty,
        ) => void,
    ): void
    set<K2 extends keyof T>(
        ...params: [
            values: Partial<{ [K in keyof T]: MaterialPropertyMap[T[K]] }>,
            beat?: number,
            duration?: number,
            easing?: EASE,
            callback?: (
                event: CustomEventInternals.SetMaterialProperty,
            ) => void,
        ] | [
            prop: K2,
            value: MaterialPropertyMap[T[K2]],
            beat?: number,
            duration?: number,
            easing?: EASE,
            callback?: (
                event: CustomEventInternals.SetMaterialProperty,
            ) => void,
        ]
    ) {
        if (typeof params[0] === 'object') {
            this.doSet(...params as Parameters<typeof this.doSet>)
            return
        }

        const [prop, value, beat, duration, easing, callback] = params

        this.doSet(
            { [prop]: value } as Partial<
                { [K in keyof T]: MaterialPropertyMap[T[K]] }
            >,
            beat,
            duration as number,
            easing as EASE,
            callback,
        )
    }

    private doSet(
        values: Partial<{ [K in keyof T]: MaterialPropertyMap[T[K]] }>,
        beat?: number,
        duration?: number,
        easing?: EASE,
        callback?: (event: CustomEventInternals.SetMaterialProperty) => void,
    ) {
        beat ??= 0

        const fixedValues: MaterialProperty[] = []

        Object.entries(values).forEach(([k, v]) => {
            const fixedValue = typeof v === 'number' ? [v] : v

            fixedValues.push({
                id: k,
                type: this.properties[k],
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

type PrefabMapOutput<T extends PrefabMap> = Record<keyof T, Prefab>

export function makePrefabMap<T extends PrefabMap>(map: T) {
    const newMap: Record<string, Prefab> = {}

    Object.entries(map).forEach(([k, v]) => {
        newMap[k] = new Prefab(v, k)
    })

    return newMap as PrefabMapOutput<T>
}

function fixMaterial<T extends MaterialMap['properties']>(map: T) {
    const newMap = {
        path: map.path,
        properties: {},
    } as FixedMaterialMap<T>

    Object.entries(map.properties).forEach(([prop, type]) => {
        ;(newMap.properties as unknown as Record<string, unknown>)[prop] =
            Object.keys(type)[0] as MATERIAL_PROP_TYPE
    })

    return newMap
}

type MaterialMapOutput<T extends MaterialMap> = {
    [V in keyof T]: Material<FixedMaterialMap<T[V]>['properties']>
}

export function makeMaterialMap<T extends MaterialMap>(map: T) {
    const newMap: Record<string, Material> = {}

    Object.entries(map).forEach(([k, v]) => {
        type props = FixedMaterialMap<typeof v>['properties']
        const fixed = fixMaterial(v)
        newMap[k] = new Material<props>(v.path, k, fixed.properties)
    })

    return newMap as MaterialMapOutput<T>
}

function initializeMaterials(assetMap: AssetMap) {
    Object.values(assetMap.default.materials).forEach(
        (value) => {
            const path = value.path
            const properties = value.properties

            const setProperties: MaterialProperty[] = []

            Object.entries(properties).forEach(([propName, typeHolder]) => {
                const propType = Object.keys(
                    typeHolder,
                )[0] as keyof typeof typeHolder

                if (propType === 'Texture') return

                const propValue = JSON.parse(typeHolder[propType] as string)

                setProperties.push({
                    id: propName,
                    type: propType,
                    value: propValue,
                })
            })

            setMaterialProperty(0, path, setProperties).push()
        },
    )
}

export function loadAssets<T extends AssetMap>(
    assetMap: T,
    initialize = true,
): {
    materials: MaterialMapOutput<T['default']['materials']>
    prefabs: PrefabMapOutput<T['default']['prefabs']>
} {
    const materials = makeMaterialMap(assetMap.default.materials)
    const prefabs = makePrefabMap(assetMap.default.prefabs)

    if (initialize) {
        initializeMaterials(assetMap)
    }

    return {
        materials: materials,
        prefabs: prefabs,
    }
}

export function destroyPrefabInstances(prefabs: PrefabInstance[], beat = 0) {
    const ids: string[] = []

    prefabs.forEach((x) => {
        if (x.destroyed) throw `Prefab ${x.id} is already destroyed.`
        ids.push(x.id)
        x.destroyed = true
    })

    destroyPrefab(beat, ids).push()
}
