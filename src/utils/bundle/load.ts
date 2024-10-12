import {makeMaterialMap, makePrefabMap} from './map.ts'
import {
    BundleInfo,
    MaterialMap,
    MaterialPropertyValues,
    PrefabMap
} from "../../types/bundle.ts";
import {MATERIAL_PROP_TYPE} from "../../types/vivify/material.ts";
import { getActiveInfo } from '../../data/active_info.ts'
import {Material} from "./material.ts";
import {AbstractDifficulty} from "../../internals/beatmap/abstract_beatmap.ts";

function applyCRCsToInfo(bundleInfo: BundleInfo) {
    const info = getActiveInfo()
    Object.assign(info.assetBundle ??= {}, bundleInfo.default.bundleCRCs)
}

function initializeMaterials(difficulty: AbstractDifficulty, materials: Material[]) {
    materials.forEach(material => {
        const keys = Object.keys(material.propertyTypes)
        const properties: MaterialPropertyValues = {}

        keys.forEach((property) => {
            if (material.propertyTypes[property] === 'Texture') return // TODO: Proper Texture default values
            properties[property] = material.defaults[property] as MATERIAL_PROP_TYPE
        })

        if (Object.values(properties).length === 0) {
            return
        }

        material.set(difficulty, properties)
    })
}

/** Generate a typed list of assets from JSON.
 * @param difficulty The difficulty to load this bundle in.
 * @param bundleInfo The `bundleinfo.json` to import.
 * @param initialize Whether to set the default value of all materials at the start of the map. This is redundancy in case material values are externally altered.
 * @param applyToInfo Whether to apply CRC data from `bundleInfo` to the Info.dat
 */
export function loadBundle<T extends BundleInfo>(
    difficulty: AbstractDifficulty,
    bundleInfo: T,
    initialize = true,
    applyToInfo = true
): {
    materials: MaterialMap<T['default']['materials']>
    prefabs: PrefabMap<T['default']['prefabs']>
} {
    const materials = makeMaterialMap(bundleInfo.default.materials)
    const prefabs = makePrefabMap(bundleInfo.default.prefabs)

    if (initialize) {
        initializeMaterials(difficulty, Object.values(materials))
    }

    if (applyToInfo) {
        applyCRCsToInfo(bundleInfo)
    }

    return {
        materials: materials,
        prefabs: prefabs,
    }
}
