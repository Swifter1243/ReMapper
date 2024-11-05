import {bsmap} from "../../../deps.ts"
import {IColorScheme, InfoJson, ISongInfo, RMInfo} from "../../../types/beatmap/info/rm_info.ts";
import {IAudioInfo} from "../../../types/beatmap/info/audio_info.ts";
import {IDifficultyInfo} from "../../../types/beatmap/info/difficulty_info.ts";
import {DeepReadonly} from "../../../types/util/mutability.ts";

export abstract class AbstractInfo<
    TD extends InfoJson = InfoJson
> implements RMInfo {
    readonly json: DeepReadonly<TD>

    song: ISongInfo
    audio: IAudioInfo
    coverImageFilename: string
    environmentNames: bsmap.EnvironmentAllName[]
    colorSchemes: IColorScheme[]
    difficultyBeatmaps: Partial<Record<bsmap.GenericFileName, IDifficultyInfo>>

    assetBundleChecksums: Record<string, number> | undefined
    contributors: bsmap.ICustomDataInfo['_contributors']
    editors: bsmap.IEditor | undefined
    unsafeCustomData: bsmap.ICustomDataBase

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

        this.assetBundleChecksums = inner.assetBundleChecksums
        this.contributors = inner.contributors
        this.editors = inner.editors
        this.unsafeCustomData = inner.unsafeCustomData
    }

    abstract toJSON(): TD;
}