import { REQUIRE_MODS, SUGGEST_MODS } from '../beatmap.ts'
import { bsmap } from '../../../deps.ts'
import {SettingsSetter} from "./settings_setter.ts";

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
    settingsSetter: SettingsSetter
}

export type IDifficultyInfoV4 = IDifficultyInfoV2 & {
    beatmapAuthors: {
        mappers: string[]
        lighters: string[]
    }
    lightshowDataFilename: string
}
