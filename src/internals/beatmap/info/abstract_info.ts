import {bsmap} from "../../../deps.ts"
import {IColorScheme, IAudioInfo, IDifficultyInfo, ISongInfo, RMInfo} from "../../../types/beatmap/rm_info.ts";

export abstract class AbstractInfo<
    TD extends bsmap.v2.IInfo
> implements RMInfo {
    readonly json: Readonly<TD>

    assetBundle: Record<string, number> | undefined
    customEnvironmentHash: string | undefined
    customEnvironment: string | undefined
    contributors: bsmap.ICustomDataInfo['_contributors']
    editors: bsmap.IEditor | undefined
    customData: bsmap.ICustomDataBase | undefined
    difficultyBeatmaps: Partial<Record<bsmap.GenericFileName, IDifficultyInfo>>
    colorSchemes: IColorScheme[]
    environmentNames: bsmap.EnvironmentAllName[]
    coverImageFilename: string
    songPreviewFilename: string
    audio: IAudioInfo
    song: ISongInfo

    constructor(
        json: TD,
        inner: RMInfo
    ) {
        this.json = json

        this.assetBundle = inner.assetBundle
        this.customEnvironmentHash = inner.customEnvironmentHash
        this.customEnvironment = inner.customEnvironment
        this.contributors = inner.contributors
        this.editors = inner.editors
        this.customData = inner.customData
        this.difficultyBeatmaps = inner.difficultyBeatmaps
        this.colorSchemes = inner.colorSchemes
        this.environmentNames = inner.environmentNames
        this.coverImageFilename = inner.coverImageFilename
        this.songPreviewFilename = inner.songPreviewFilename
        this.audio = inner.audio
        this.song = inner.song
    }
}