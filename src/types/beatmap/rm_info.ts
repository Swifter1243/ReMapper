import { bsmap } from '../../deps.ts'
import { ColorVec } from '../math/vector.ts'
import { REQUIRE_MODS, SUGGEST_MODS } from './beatmap.ts'

export interface RMInfo {
    song: ISongInfo
    audio: IAudioInfo
    songPreviewFilename: string
    coverImageFilename: string
    environmentNames: bsmap.EnvironmentAllName[]
    colorSchemes: IColorScheme[]
    difficultyBeatmaps: Partial<Record<bsmap.GenericFileName, IDifficultyInfo>>
    customData: bsmap.ICustomDataBase | undefined
    editors: bsmap.IEditor | undefined
    contributors: bsmap.ICustomDataInfo['contributors'] | undefined
    customEnvironment: string | undefined
    customEnvironmentHash: string | undefined
    assetBundle: Record<string, number> | undefined
}

export type IAudioInfo = {
    songFilename: string
    songDuration: number | undefined
    audioDataFilename: string | undefined
    bpm: number
    lufs: number | undefined
    previewStartTime: number
    previewDuration: number
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

export type IDifficultyInfo = {
    characteristic: bsmap.CharacteristicName
    difficulty: bsmap.DifficultyName
    beatmapAuthors: {
        mappers: string[]
        lighters: string[]
    } | undefined
    noteJumpMovementSpeed: number
    noteJumpStartBeatOffset: number
    beatmapColorSchemeIdx: number
    environmentNameIdx: number
    beatmapDataFilename: bsmap.GenericFileName
    lightshowDataFilename: string | undefined
    customData: bsmap.ICustomDataInfoDifficulty | undefined
    requirements: REQUIRE_MODS[] | undefined
    suggestions: SUGGEST_MODS[] | undefined
    label: string | undefined
}
