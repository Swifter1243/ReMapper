import {Material} from '../utils/asset/material.ts'
import {Prefab} from '../utils/asset/prefab.ts'
import {MATERIAL_PROP_TYPE} from './vivify.ts'
import {FILEPATH} from "./beatmap.ts";
import {RuntimePointDefinitionLinear, RuntimePointDefinitionVec4} from "./animation.ts";
import {ColorVec, Vec4} from "./data.ts";

export type PrefabMap = Record<string, string>
export type MaterialMap = Record<string, {
    path: string
    properties: Record<string, Partial<Record<MATERIAL_PROP_TYPE, unknown>>>
}>
export type AssetMap = {
    default: {
        materials: MaterialMap
        prefabs: PrefabMap
    }
}
export type FixedMaterialMap<BaseMaterial extends MaterialMap[string]> = {
    path: string
    properties: {
        [MaterialProperty in keyof BaseMaterial['properties']]:
            BaseMaterial['properties'][MaterialProperty] extends Record<string, unknown> ? Extract<
                    keyof BaseMaterial['properties'][MaterialProperty],
                    MATERIAL_PROP_TYPE
                >
                : never
    }
}
export type PrefabMapOutput<T extends PrefabMap> = Record<keyof T, Prefab>
export type MaterialMapOutput<T extends MaterialMap> = {
    [V in keyof T]: Material<FixedMaterialMap<T[V]>['properties']>
}
export type MaterialProperties = Record<string, MATERIAL_PROP_TYPE>
export type MaterialPropertyMap = {
    'Texture': FILEPATH
    'Float': number | RuntimePointDefinitionLinear
    'Color': ColorVec | RuntimePointDefinitionVec4
    'Vector': Vec4 | RuntimePointDefinitionVec4
}