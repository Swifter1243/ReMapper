import {setMaterialProperty} from '../../builder_functions/beatmap/object/custom_event/vivify.ts'
import {makeMaterialMap, makePrefabMap} from './map.ts'
import {AssetInfo, MaterialMap, PrefabMap} from "../../types/asset.ts";
import {MaterialProperty} from "../../types/vivify/material.ts";

function initializeMaterials(assetMap: AssetInfo) {
    Object.values(assetMap.default.materials).forEach(
        (value) => {
            const path = value.path
            const properties = value.properties

            const setProperties: MaterialProperty[] = []

            if (Object.keys(properties).length === 0) return

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

/** Generate a typed list of assets from JSON.
 * @param assetMap The `asset_info.json` to import.
 * @param initialize Whether to set the default value of all materials at the start of the map. This is redundancy in case material values are externally altered.
 */
export function loadAssets<T extends AssetInfo>(
    assetMap: T,
    initialize = true,
): {
    materials: MaterialMap<T['default']['materials']>
    prefabs: PrefabMap<T['default']['prefabs']>
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
