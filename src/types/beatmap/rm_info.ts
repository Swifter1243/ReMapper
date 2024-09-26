import { bsmap } from '../../deps.ts'
import { ColorVec } from '../math/vector.ts'
import { REQUIRE_MODS, SUGGEST_MODS } from './beatmap.ts'

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

export type IAudioInfo = IAudioInfoV2 | IAudioInfoV4

export type IAudioInfoV2 = {
    songFilename: string
    bpm: number
    previewStartTime: number
    previewDuration: number
}

export type IAudioInfoV4 = IAudioInfoV2 & {
    songDuration: number
    audioDataFilename: string
    lufs: number
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

export type IDifficultyInfo = IDifficultyInfoV2 | IDifficultyInfoV4

export type IDifficultyInfoV2 = {
    characteristic: bsmap.CharacteristicName
    difficulty: bsmap.DifficultyName
    noteJumpMovementSpeed: number
    noteJumpStartBeatOffset: number
    beatmapColorSchemeIdx: number
    environmentNameIdx: number
    beatmapDataFilename: bsmap.GenericFileName

    customData: bsmap.ICustomDataInfoDifficulty | undefined
    requirements: REQUIRE_MODS[] | undefined
    suggestions: SUGGEST_MODS[] | undefined
    difficultyLabel: string | undefined
    information: string[] | undefined
    warnings: string[] | undefined
}

export type IDifficultyInfoV4 = IDifficultyInfoV2 & {
    beatmapAuthors: {
        mappers: string[]
        lighters: string[]
    }
    lightshowDataFilename: string
}
