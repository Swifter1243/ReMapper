import { Material } from '../utils/asset/material.ts'
import { Prefab } from '../utils/asset/prefab.ts'

import { ColorVec, Vec4 } from './math/vector.ts'
import { RuntimePointDefinitionLinear } from './animation/keyframe/runtime/linear.ts'
import { RuntimePointDefinitionVec4 } from './animation/keyframe/runtime/vec4.ts'
import { FILEPATH } from './beatmap/file.ts'
import { MATERIAL_PROP_TYPE } from './vivify/material.ts'

/** A list of prefab names and their paths. Typically input from `asset_info.json` */
export type PrefabInfo = Record<string, string>

/** A list of materials and their property types. Typically input from `asset_info.json`.
 * Deno doesn't import json strings as literals, so this is considered unclean as I have to specify the type as a key.
 */
export type MaterialInfo = Record<string, {
    path: string
    properties: Record<string, Partial<Record<MATERIAL_PROP_TYPE, unknown>>>
}>

/** Asset info exported from the VivifyTemplate exporter. Imported to this type in the form of `asset_info.json`. */
export type AssetInfo = {
    default: {
        materials: MaterialInfo
        prefabs: PrefabInfo
        bundleCRCs: Record<string, number>
    }
}

/** A list of materials and their property types. Typically input from `asset_info.json`.
 * Deno doesn't import json strings as literals, so this is considered the clean version after it has been processed by `fixMaterial`.
 */
export type FixedMaterialInfo<BaseMaterial extends MaterialInfo[string]> = {
    path: string
    properties: {
        [MaterialProperty in keyof BaseMaterial['properties']]:
            BaseMaterial['properties'][MaterialProperty] extends Record<string, unknown>
                ? Extract<keyof BaseMaterial['properties'][MaterialProperty], MATERIAL_PROP_TYPE>
                : never
    }
}

/** A typed dictionary of prefabs based on `asset_info.json`. */
export type PrefabMap<T extends PrefabInfo> = Record<keyof T, Prefab>

/** A typed dictionary of materials based on `asset_info.json`. */
export type MaterialMap<T extends MaterialInfo> = {
    [V in keyof T]: Material<FixedMaterialInfo<T[V]>['properties']>
}

/** Untyped material properties. */
export type MaterialProperties = Record<string, MATERIAL_PROP_TYPE>

/** Converts a `MATERIAL_PROP_TYPE` to it's corresponding value. */
export type MaterialPropertyMap = {
    'Texture': FILEPATH
    'Float': number | RuntimePointDefinitionLinear
    'Color': ColorVec | RuntimePointDefinitionVec4
    'Vector': Vec4 | RuntimePointDefinitionVec4
}
