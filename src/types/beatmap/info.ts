import { bsmap } from '../../deps.ts'
import {
    ANISOTROPIC_FILTERING,
    SHADOW_MASK_MODE,
    SHADOW_PROJECTION,
    SHADOW_RESOLUTION,
    SHADOWS,
} from '../vivify/setting.ts'

/** Substitute for `bsmap.v2.IInfoSetDifficulty` that includes Vivify `_qualitySettings` */
export interface IInfoSetDifficulty extends bsmap.v2.IInfoSetDifficulty {
    _customData?: {
        _qualitySettings?: {
            _anisotropicFiltering?: ANISOTROPIC_FILTERING
            _antiAliasing?: 0 | 2 | 4 | 8
            _pixelLightCount?: number
            _realtimeReflectionProbes?: boolean
            _shadowCascades?: 0 | 2 | 4
            _shadowDistance?: number
            _shadowMaskMode?: SHADOW_MASK_MODE
            _shadowNearPlaneOffset?: number
            _shadowProjection?: SHADOW_PROJECTION
            _shadowResolution?: SHADOW_RESOLUTION
            _shadows?: SHADOWS
            _softParticles?: boolean
        }
    } & bsmap.v2.IInfoSetDifficulty['_customData']
}

/** Substitute for `bsmap.v2.IInfoSet` that includes Vivify `_qualitySettings`  */
export interface IInfoSet extends bsmap.v2.IInfoSet {
    _difficultyBeatmaps: IInfoSetDifficulty[]
}

/** Substitute for `bsmap.v2.IInfo` that includes Vivify `_qualitySettings`  */
export interface IInfo extends bsmap.v2.IInfo {
    _difficultyBeatmapSets: IInfoSet[]
}
