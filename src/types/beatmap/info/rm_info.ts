import {bsmap} from '../../../deps.ts'
import {ColorVec} from '../../math/vector.ts'
import {IAudioInfo} from "./audio_info.ts";
import {IDifficultyInfo} from "./difficulty_info.ts";
import {boost} from "../../../builder_functions/beatmap/object/v3_event/lighting/boost.ts";

export interface RMInfo {
    /** Information about the song. */
    song: ISongInfo
    /** Information about the audio file. */
    audio: IAudioInfo
    /** The path to the cover art. These should be in `png`, `jpeg`, or `jpg` format. */
    coverImageFilename: string
    /** https://bsmg.wiki/mapping/map-format/info.html#environments */
    environmentNames: bsmap.EnvironmentAllName[]
    /** A collection of color schemes for the difficulties to use. */
    colorSchemes: IColorScheme[]
    /** Information for all the difficulties included in this beatmap. */
    difficultyBeatmaps: Partial<Record<bsmap.GenericFileName, IDifficultyInfo>>

    /** CRC Checksums for Vivify asset bundles. */
    assetBundle: Record<string, number> | undefined
    /** Information about the contributors in this beatmap. */
    contributors: bsmap.ICustomDataInfo['contributors'] | undefined
    /** Information about the editors used to edit this beatmap. */
    editors: bsmap.IEditor | undefined
    /** Custom data for the entire beatmap. Some properties (e.g. {@link contributors}, {@link editors}, ...etc.) are already extracted. */
    customData: bsmap.ICustomDataBase
}

export type ISongInfo = {
    title: string
    subTitle: string
    author: string
}

export type IColorScheme = {
    /** Whether to override the player's color scheme. */
    useOverride: boolean
    /** The name of the color scheme. */
    colorSchemeName: string
    /** The color for the left saber. */
    saberAColor: ColorVec
    /** The color for the right saber. */
    saberBColor: ColorVec
    /** The color for walls. */
    obstaclesColor: ColorVec
    /** The first color for lights. */
    environmentColor0: ColorVec
    /** The second color for lights. */
    environmentColor1: ColorVec
    /** The first color for lights in the boost color scheme. (see {@link boost}) */
    environmentColor0Boost: ColorVec
    /** The second color for lights in the boost color scheme. (see {@link boost}) */
    environmentColor1Boost: ColorVec
}

export type InfoJson = bsmap.v2.IInfo