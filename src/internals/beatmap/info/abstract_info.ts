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
    environmentNames: bsmap.EnvironmentName[]
    colorSchemes: IColorScheme[]
    difficultyBeatmaps: Partial<Record<bsmap.GenericBeatmapFilename, IDifficultyInfo>>

    assetBundleChecksums: bsmap.IV2VivifyCustomDataInfo['_assetBundle']
    contributors: bsmap.ICustomDataInfo['_contributors'] | undefined
    editors: bsmap.IV2Editor | undefined
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

    protected abstract toJSON(): TD;

    toFinalString(): string {
        return JSON.stringify(this.toJSON())
    }
}