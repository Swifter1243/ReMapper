import {makeMaterialMap, makePrefabMap} from './map.ts'
import {
    BundleInfo,
    MaterialMap,
    PrefabMap
} from "../../types/bundle.ts";
import { getActiveInfo } from '../../data/active_info.ts'

function applyCRCsToInfo(bundleInfo: BundleInfo) {
    const info = getActiveInfo()
    Object.assign(info.assetBundleChecksums ??= {}, bundleInfo.default.bundleCRCs)
}

/** Generate a typed list of assets from JSON.
 * @param bundleInfo The `bundleinfo.json` to import.
 * @param applyToInfo Whether to apply CRC data from `bundleInfo` to the Info.dat
 */
export function loadBundle<T extends BundleInfo>(
    bundleInfo: T,
    applyToInfo = true
): {
    materials: MaterialMap<T['default']['materials']>
    prefabs: PrefabMap<T['default']['prefabs']>
} {
    const materials = makeMaterialMap(bundleInfo.default.materials)
    const prefabs = makePrefabMap(bundleInfo.default.prefabs)

    if (applyToInfo) {
        applyCRCsToInfo(bundleInfo)
    }

    return {
        materials: materials,
        prefabs: prefabs,
    }
}
