import { Prefab } from './prefab.ts'
import { Material } from './material.ts'
import {
    FixedMaterialInfo,
    MaterialInfo,
    MaterialMap,
    MaterialPropertyMap,
    PrefabInfo,
    PrefabMap
} from "../../../types/bundle.ts";
import {MATERIAL_PROP_TYPE} from "../../../types/vivify/material.ts";


/** Generate a typed list of prefabs from JSON. */
export function makePrefabMap<T extends PrefabInfo>(map: T) {
    const newMap: Record<string, Prefab> = {}

    Object.entries(map).forEach(([k, v]) => {
        newMap[k] = new Prefab(v, k)
    })

    return newMap as PrefabMap<T>
}

function fixMaterialValue(type: MATERIAL_PROP_TYPE, value: string): MaterialPropertyMap[MATERIAL_PROP_TYPE] {
    switch (type) {
        case "Texture": return value
        case "Float": return parseFloat(value)
        case "Color": return JSON.parse(value)
        case "Vector": return JSON.parse(value)
        case "Keyword": return JSON.parse(value)
    }
}

function fixMaterial<T extends MaterialInfo['properties']>(map: T) {
    const newMap = {
        path: map.path,
        properties: {},
        defaults: {}
    } as FixedMaterialInfo<T>

    const properties = newMap.properties as Record<string, MATERIAL_PROP_TYPE>
    const defaults = newMap.defaults as Record<string, MaterialPropertyMap[MATERIAL_PROP_TYPE]>

    Object.entries(map.properties).forEach(([prop, typeObject]) => {
        const type = Object.keys(typeObject)[0] as MATERIAL_PROP_TYPE
        const value = Object.values(typeObject)[0]
        properties[prop] = type
        defaults[prop] = fixMaterialValue(type, value)
    })

    return newMap
}

/** Generate a typed list of materials from JSON. */
export function makeMaterialMap<T extends MaterialInfo>(map: T) {
    const newMap: Record<string, Material> = {}

    Object.entries(map).forEach(([k, v]) => {
        const fixed = fixMaterial(v)
        newMap[k] = new Material(v.path, k, fixed.properties, fixed.defaults)
    })

    return newMap as MaterialMap<T>
}
