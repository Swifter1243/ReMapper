import {bsmap} from "../../../deps.ts"
import {IColorScheme, ISongInfo, RMInfo} from "../../../types/beatmap/info/rm_info.ts";
import {IAudioInfo} from "../../../types/beatmap/info/audio_info.ts";
import {IDifficultyInfo} from "../../../types/beatmap/info/difficulty_info.ts";

export abstract class AbstractInfo<
    TD extends bsmap.v2.IInfo
> implements RMInfo {
    readonly json: Readonly<TD>

    song: ISongInfo
    audio: IAudioInfo
    coverImageFilename: string
    environmentNames: bsmap.EnvironmentAllName[]
    colorSchemes: IColorScheme[]
    difficultyBeatmaps: Partial<Record<bsmap.GenericFileName, IDifficultyInfo>>

    assetBundle: Record<string, number> | undefined
    contributors: bsmap.ICustomDataInfo['_contributors']
    editors: bsmap.IEditor | undefined
    customData: bsmap.ICustomDataBase

    protected constructor(
        json: TD,
        inner: RMInfo
    ) {
        this.json = json

        this.song = inner.song
        this.audio = inner.audio
        this.coverImageFilename = inner.coverImageFilename
        this.environmentNames = inner.environmentNames
        this.colorSchemes = inner.colorSchemes
        this.difficultyBeatmaps = inner.difficultyBeatmaps

        this.assetBundle = inner.assetBundle
        this.contributors = inner.contributors
        this.editors = inner.editors
        this.customData = inner.customData
    }

    abstract toJSON(): TD;
}