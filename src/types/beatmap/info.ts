import { bsmap } from '../../deps.ts'

/** Substitute for `bsmap.v2.IInfoSet` that includes Vivify `_qualitySettings`  */
export interface IInfoSet extends bsmap.v2.IInfoSet {
    _difficultyBeatmaps: bsmap.v2.IInfoSetDifficulty[]
}

/** Substitute for `bsmap.v2.IInfo` that includes Vivify `_qualitySettings`  */
export interface IInfo extends bsmap.v2.IInfo {
    _difficultyBeatmapSets: IInfoSet[]
}
