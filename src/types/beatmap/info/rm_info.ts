import {bsmap} from '../../../deps.ts'
import {ColorVec} from '../../math/vector.ts'
import {IAudioInfo} from "./audio_info.ts";
import {IDifficultyInfo} from "./difficulty_info.ts";

export interface RMInfo {
    song: ISongInfo
    audio: IAudioInfo
    coverImageFilename: string
    environmentNames: bsmap.EnvironmentAllName[]
    colorSchemes: IColorScheme[]
    difficultyBeatmaps: Partial<Record<bsmap.GenericFileName, IDifficultyInfo>>

    customData: bsmap.ICustomDataBase
    editors: bsmap.IEditor | undefined
    contributors: bsmap.ICustomDataInfo['contributors'] | undefined
    assetBundle: Record<string, number> | undefined
}

export type ISongInfo = {
    title: string
    subTitle: string
    author: string
}

export type IColorScheme = {
    useOverride: boolean
    colorSchemeName: string
    saberAColor: ColorVec
    saberBColor: ColorVec
    obstaclesColor: ColorVec
    environmentColor0: ColorVec
    environmentColor1: ColorVec
    environmentColor0Boost: ColorVec
    environmentColor1Boost: ColorVec
}

export type InfoJson = bsmap.v2.IInfo