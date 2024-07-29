import {setMaterialProperty} from '../../builder_functions/beatmap/object/custom_event/vivify.ts'
import {makeMaterialMap, makePrefabMap} from './map.ts'
import {AssetInfo, MaterialMap, PrefabMap} from "../../types/asset.ts";
import {MaterialProperty} from "../../types/vivify/material.ts";
import { getActiveInfo } from '../../data/active_info.ts'

function initializeMaterials(assetInfo: AssetInfo) {
    Object.values(assetInfo.default.materials).forEach(
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

            if (Object.keys(setProperties).length === 0) return

            setMaterialProperty(0, path, setProperties).push()
        },
    )
}

function applyCRCsToInfo(assetInfo: AssetInfo) {
    const info = getActiveInfo()
    info._customData ??= {}
    Object.assign(info._customData._assetBundle, assetInfo.default.bundleCRCs)
}

/** Generate a typed list of assets from JSON.
 * @param assetInfo The `asset_info.json` to import.
 * @param initialize Whether to set the default value of all materials at the start of the map. This is redundancy in case material values are externally altered.
 */
export function loadAssets<T extends AssetInfo>(
    assetInfo: T,
    initialize = true,
    applyToInfo = true
): {
    materials: MaterialMap<T['default']['materials']>
    prefabs: PrefabMap<T['default']['prefabs']>
} {
    const materials = makeMaterialMap(assetInfo.default.materials)
    const prefabs = makePrefabMap(assetInfo.default.prefabs)

    if (initialize) {
        initializeMaterials(assetInfo)
    }

    if (applyToInfo) {
        applyCRCsToInfo(assetInfo)
    }

    return {
        materials: materials,
        prefabs: prefabs,
    }
}
