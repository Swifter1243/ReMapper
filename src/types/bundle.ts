import { Material } from '../utils/vivify/bundle/material.ts'
import { Prefab } from '../utils/vivify/bundle/prefab.ts'

import { ColorVec, Vec4 } from './math/vector.ts'
import { RuntimeDifficultyPointsLinear } from './animation/points/runtime/linear.ts'
import { RuntimeDifficultyPointsVec4 } from './animation/points/runtime/vec4.ts'
import { FILEPATH } from './beatmap/file.ts'
import { MATERIAL_PROP_TYPE } from './vivify/material.ts'

/** A list of prefab names and their paths. Typically input from `asset_info.json` */
export type PrefabInfo = Record<string, string>

/** A list of materials and their property types. Typically input from `asset_info.json`.
 * Deno doesn't import json strings as literals, so this is considered unclean as I have to specify the type as a key.
 */
export type MaterialInfo = Record<string, {
    path: string
    properties: Record<string, UncleanPropertyValue>
}>

type UncleanPropertyValue = {
    type: Partial<Record<MATERIAL_PROP_TYPE, null>>,
    value: number | number[] | string
}

/** Bundle info exported from the VivifyTemplate exporter. Imported to this type in the form of `asset_info.json`. */
export type BundleInfo = {
    default: {
        materials: MaterialInfo
        prefabs: PrefabInfo
        bundleFiles: string[]
        bundleCRCs: Record<string, number>
        isCompressed: boolean
    }
}

/** Generates the "properties" field for FixedMaterialInfo
 * @see FixedMaterialInfo
 * */
export type FixedMaterialProperties<
    Material extends MaterialInfo[string],
    Props extends Material['properties'] = Material['properties']
> = {
    [Prop in keyof Props]: Extract<keyof Props[Prop]['type'], MATERIAL_PROP_TYPE>
}

/** Represents a list of material properties and their types as the equivalent list with their values. */
export type StaticMaterialPropertyValues<T extends MaterialProperties = MaterialProperties> = {
    [K in keyof T]: StaticMaterialPropertyMap[T[K]]
}

/** Converts a `MATERIAL_PROP_TYPE` to it's corresponding value. */
export type StaticMaterialPropertyMap = {
    'Texture': FILEPATH
    'Float': number
    'Color': ColorVec
    'Vector': Vec4,
    'Keyword': boolean
}

/** Represents a list of material properties and their types as the equivalent list with their values. */
export type MaterialPropertyValues<T extends MaterialProperties = MaterialProperties> = {
    [K in keyof T]: MaterialPropertyMap[T[K]]
}

/** Converts a `MATERIAL_PROP_TYPE` to it's corresponding value. */
export type MaterialPropertyMap = {
    'Texture': FILEPATH
    'Float': number | RuntimeDifficultyPointsLinear
    'Color': ColorVec | RuntimeDifficultyPointsVec4
    'Vector': Vec4 | RuntimeDifficultyPointsVec4
    'Keyword': boolean
}


/** A list of materials and their property types. Typically input from `bundleinfo.json`.
 * Deno doesn't import json strings as literals, so this is considered the clean version after it has been processed by `fixMaterial`.
 */
export type FixedMaterialInfo<BaseMaterial extends MaterialInfo[string]> = {
    path: string
    properties: FixedMaterialProperties<BaseMaterial>
    defaults: StaticMaterialPropertyValues<FixedMaterialProperties<BaseMaterial>>
}

/** A typed dictionary of prefabs based on `asset_info.json`. */
export type PrefabMap<T extends PrefabInfo> = Record<keyof T, Prefab>

/** A typed dictionary of materials based on `asset_info.json`. */
export type MaterialMap<T extends MaterialInfo> = {
    [V in keyof T]: Material<FixedMaterialInfo<T[V]>['properties']>
}

/** Untyped material properties. */
export type MaterialProperties = Record<string, MATERIAL_PROP_TYPE>