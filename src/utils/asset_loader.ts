import {
    destroyPrefab,
    instantiatePrefab,
    setMaterialProperty,
} from '../beatmap/custom_event.ts'
import { CustomEventInternals } from '../internals/mod.ts'
import { EASE, RawKeyframesVec4 } from '../types/animation_types.ts'
import { RawKeyframesLinear } from '../types/animation_types.ts'
import { FILEPATH } from '../types/beatmap_types.ts'
import { ColorVec, Vec4 } from '../types/data_types.ts'
import { MaterialProperty } from '../types/mod.ts'
import {
    MATERIAL_PROP_TYPE,
    MaterialPropertyValue,
} from '../types/vivify_types.ts'

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
    static: {
        'Texture': FILEPATH
        'Float': number
        'Color': ColorVec
        'Vector': Vec4
    }
    animated: {
        'Texture': FILEPATH
        'Float': RawKeyframesLinear | string
        'Color': RawKeyframesVec4 | ColorVec | string
        'Vector': RawKeyframesVec4 | string
    }
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

    constructor(id: string) {
        this.id = id
    }

    destroy(beat = 0) {
        destroyPrefab(beat, this.id).push()
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

    set<K extends keyof T>(
        prop: K,
        value: MaterialPropertyMap['static'][T[K]],
        beat = 0,
        callback?: (event: CustomEventInternals.SetMaterialProperty) => void,
    ) {
        // LMFAO
        const fixedValue =
            (typeof value === 'number'
                ? [value]
                : (typeof value === 'object' && Array.isArray(value) &&
                        typeof value[0] === 'number' && value.length === 3
                    ? [...value, 0]
                    : value)) as MaterialPropertyValue

        const e = setMaterialProperty(beat, this.path, [
            {
                id: prop as string,
                type: this.properties[prop],
                value: fixedValue,
            },
        ])
        if (callback) callback(e)
        e.push(false)
    }

    animate<K extends keyof T>(
        prop: K,
        value: MaterialPropertyMap['animated'][T[K]],
        beat = 0,
        duration = 0,
        easing?: EASE,
        callback?: (event: CustomEventInternals.SetMaterialProperty) => void,
    ) {
        const e = setMaterialProperty(beat, this.path, [
            {
                id: prop as string,
                type: this.properties[prop],
                value: value as MaterialPropertyValue,
            },
        ])
        e.duration = duration
        if (easing) e.easing = easing
        if (callback) callback(e)
        e.push(false)
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
    materials: MaterialMapOutput<T['default']['materials']>,
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
