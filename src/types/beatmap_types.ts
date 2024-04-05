import { bsmap } from '../deps.ts'

/** All mods that can be suggested. */
export type SUGGEST_MODS =
    | 'Chroma'
    | 'Cinema'

/** All mods that can be required. */
export type REQUIRE_MODS =
    | 'Chroma'
    | 'Noodle Extensions'
    | 'Vivify'

/** Cached data saved in the ReMapper cache. */
export type CachedData = {
    processing: string
    data: unknown
    accessed?: boolean
}

// TODO: If possible, try to figure out a way to default to a string with no extension or path
/** File name. `file.json` */
export type FILENAME<T extends string = string> = T | `${T}.${string}`
/** File path, relative or absolute. `file.json` or `src/file.json` or `C:/file.json` */
export type FILEPATH<T extends string = string> =
    | FILENAME<T>
    | `${string}/${FILENAME<T>}`
type DiffNameBase<T extends string> =
    | `Easy${T}`
    | `Normal${T}`
    | `Hard${T}`
    | `Expert${T}`
    | `ExpertPlus${T}`

/** All difficulty names. */
export type DIFFS =
    | DiffNameBase<'Standard'>
    | DiffNameBase<'NoArrows'>
    | DiffNameBase<'OneSaber'>
    | DiffNameBase<'360Degree'>
    | DiffNameBase<'90Degree'>
    | DiffNameBase<'Lightshow'>
    | DiffNameBase<'Lawless'>

/** Absolute or relative path to a difficulty. Extension is optional. */
export type DIFFPATH = FILEPATH<DIFFS>

/** Filename for a difficulty. Extension is optional. */
export type DIFFNAME = FILENAME<DIFFS>

// I literally don't know how to do this with Records
/** Object that deserializes from beatmap data and serializes back. */
export interface JsonWrapper<TV2 extends object, TV3 extends object> {
    /** Imports raw JSON into the fields of this class. */
    fromJson(json: TV3, v3: true): this
    fromJson(json: TV2, v3: false): this
    fromJson(json: TV3 | TV2, v3: boolean): this

    /** Outputs this class into JSON that will be stored in the output difficulty. */
    toJson(v3: true, prune: boolean): TV3
    toJson(v3: false, prune: boolean): TV2
    toJson(v3: boolean, prune: boolean): TV2 | TV3
}

/** https://docs.unity3d.com/ScriptReference/QualitySettings.html */
export enum ANISOTROPIC_FILTERING {
    Disable,
    Enable,
    ForceEnable,
}

/** https://docs.unity3d.com/ScriptReference/QualitySettings.html */
export enum SHADOW_MASK_MODE {
    Shadowmask,
    DistanceShadowmask,
}

/** https://docs.unity3d.com/ScriptReference/QualitySettings.html */
export enum SHADOW_PROJECTION {
    CloseFit,
    StableFit,
}

/** https://docs.unity3d.com/ScriptReference/QualitySettings.html */
export enum SHADOW_RESOLUTION {
    Low,
    Medium,
    High,
    VeryHigh,
}

/** https://docs.unity3d.com/ScriptReference/QualitySettings.html */
export enum SHADOWS {
    Disable,
    HardOnly,
    All,
}

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
