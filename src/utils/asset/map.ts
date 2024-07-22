import { Prefab } from './prefab.ts'
import { Material } from './material.ts'
import {FixedMaterialMap, MaterialMap, MaterialMapOutput, PrefabMap, PrefabMapOutput} from "../../types/asset.ts";
import {MATERIAL_PROP_TYPE} from "../../types/vivify/material.ts";


/** Generate a typed list of prefabs from JSON. */
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
        ;(newMap.properties as unknown as Record<string, unknown>)[prop] = Object.keys(
            type,
        )[0] as MATERIAL_PROP_TYPE
    })

    return newMap
}

/** Generate a typed list of materials from JSON. */
export function makeMaterialMap<T extends MaterialMap>(map: T) {
    const newMap: Record<string, Material> = {}

    Object.entries(map).forEach(([k, v]) => {
        type props = FixedMaterialMap<typeof v>['properties']
        const fixed = fixMaterial(v)
        newMap[k] = new Material<props>(v.path, k, fixed.properties)
    })

    return newMap as MaterialMapOutput<T>
}
