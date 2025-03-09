import { bsmap } from '../../../deps.ts'
import {SettingsSetter} from "./settings_setter.ts";

export type IDifficultyInfo = IDifficultyInfoV2 | IDifficultyInfoV4
export type IDifficultyInfoV2 = {
    /** The characteristic for this difficulty. (e.g. `Standard`, `NoArrows`, ...etc.) */
    characteristic: bsmap.CharacteristicName
    /** The level difficulty of this difficulty. (e.g. `Easy`, `Normal`, `Hard`, ...etc.) */
    difficulty: bsmap.DifficultyName
    /** The units/second speed of gameplay objects in this level. */
    noteJumpMovementSpeed: number
    /** The offset added to the position where gameplay objects "jump" in. */
    noteJumpStartBeatOffset: number
    /** The index into the array of color schemes that this difficulty will use. */
    beatmapColorSchemeIdx: number
    /** The index into the array of environment names this difficulty will use. */
    environmentNameIdx: number
    /** The filename of the data for the difficulty. */
    beatmapDataFilename: bsmap.GenericFileName

    /** Custom data for this difficulty. Some properties (e.g. `requirements`, `suggestions`, ...etc.) have already been extracted */
    unsafeCustomData: bsmap.ICustomDataInfoDifficulty | undefined
    /** The required mods for this difficulty. */
    requirements: string[] | undefined
    /** The suggested mods for this difficulty. */
    suggestions: string[] | undefined
    /** The custom label to show on the difficulty in the game's menu. */
    difficultyLabel: string | undefined
    /** Arbitrary information about the difficulty to show in the [?] button in the game's menu. */
    information: string[] | undefined
    /** Warnings to show in the [?] button in the game's menu. */
    warnings: string[] | undefined
    /** Settings to suggest for the player to use when playing this map. */
    settingsSetter: SettingsSetter
}

export type IDifficultyInfoV4 = IDifficultyInfoV2 & {
    /** The authors of the difficulty. */
    beatmapAuthors: {
        /** People who contributed toward mapping the difficulty. */
        mappers: string[]
        /** People who contributed toward lighting the difficulty. */
        lighters: string[]
    }
    /** The filename of the lightshow data for the difficulty. */
    lightshowDataFilename: string
}
