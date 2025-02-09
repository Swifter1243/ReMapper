import {makeMaterialMap, makePrefabMap} from './map.ts'
import {
    BundleInfo,
    MaterialMap,
    PrefabMap
} from "../../../types/bundle.ts";
import {AbstractInfo} from "../../../internals/beatmap/info/abstract_info.ts";

export function applyCRCsToInfo(info: AbstractInfo, bundleInfo: BundleInfo) {
    Object.assign(info.assetBundleChecksums ??= {}, bundleInfo.default.bundleCRCs)
}

/** Generate a typed list of assets from JSON.
 * @param bundleInfo The `bundleinfo.json` to import.
 */
export function loadBundle<T extends BundleInfo>(
    bundleInfo: T
): {
    materials: MaterialMap<T['default']['materials']>
    prefabs: PrefabMap<T['default']['prefabs']>
} {
    const materials = makeMaterialMap(bundleInfo.default.materials)
    const prefabs = makePrefabMap(bundleInfo.default.prefabs)

    return {
        materials: materials,
        prefabs: prefabs,
    }
}
