import { Prefab } from './prefab.ts'
import { Material } from './material.ts'
import {FixedMaterialInfo, MaterialInfo, MaterialMap, PrefabInfo, PrefabMap} from "../../types/asset.ts";
import {MATERIAL_PROP_TYPE} from "../../types/vivify/material.ts";


/** Generate a typed list of prefabs from JSON. */
export function makePrefabMap<T extends PrefabInfo>(map: T) {
    const newMap: Record<string, Prefab> = {}

    Object.entries(map).forEach(([k, v]) => {
        newMap[k] = new Prefab(v, k)
    })

    return newMap as PrefabMap<T>
}

function fixMaterial<T extends MaterialInfo['properties']>(map: T) {
    const newMap = {
        path: map.path,
        properties: {},
    } as FixedMaterialInfo<T>

    const properties = newMap.properties as Record<string, unknown>

    Object.entries(map.properties).forEach(([prop, type]) => {
        properties[prop] = Object.keys(type)[0] as MATERIAL_PROP_TYPE
    })

    return newMap
}

/** Generate a typed list of materials from JSON. */
export function makeMaterialMap<T extends MaterialInfo>(map: T) {
    const newMap: Record<string, Material> = {}

    Object.entries(map).forEach(([k, v]) => {
        type props = FixedMaterialInfo<typeof v>['properties']
        const fixed = fixMaterial(v)
        newMap[k] = new Material<props>(v.path, k, fixed.properties)
    })

    return newMap as MaterialMap<T>
}
