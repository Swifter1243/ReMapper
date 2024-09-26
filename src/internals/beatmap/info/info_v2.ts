import { AbstractInfo } from './abstract_info.ts'
import { bsmap } from '../../../deps.ts'
import {IColorScheme, RMInfo} from '../../../types/beatmap/rm_info.ts'
import { ColorVec } from '../../../types/math/vector.ts'
import { getCDProp } from '../../../utils/beatmap/json.ts'
import {REQUIRE_MODS, SUGGEST_MODS} from "../../../types/beatmap/beatmap.ts";

export class V2Info extends AbstractInfo<bsmap.v2.IInfo> {
    private static loadColor(json: {
        r: number
        g: number
        b: number
    }): ColorVec {
        return [json.r, json.g, json.b]
    }

    private static loadColorScheme(json: bsmap.v2.IInfoColorScheme): IColorScheme {
        return {
            useOverride: json.useOverride,
            colorSchemeName: json.colorScheme.colorSchemeId,
            environmentColor0: this.loadColor(json.colorScheme.environmentColor0),
            environmentColor1: this.loadColor(json.colorScheme.environmentColor1),
            environmentColor0Boost: this.loadColor(json.colorScheme.environmentColor0Boost),
            environmentColor1Boost: this.loadColor(json.colorScheme.environmentColor1Boost),
            obstaclesColor: this.loadColor(json.colorScheme.obstaclesColor),
            saberAColor: this.loadColor(json.colorScheme.saberAColor),
            saberBColor: this.loadColor(json.colorScheme.saberBColor),
        }
    }

    private static loadDifficultyBeatmaps(json: bsmap.v2.IInfoSet[]): RMInfo['difficultyBeatmaps'] {
        const result: RMInfo['difficultyBeatmaps'] = {}

        json.forEach(infoSet => {
            infoSet._difficultyBeatmaps.forEach((beatmap) => {
                const beatmapDataFilename = beatmap._beatmapFilename as bsmap.GenericFileName

                result[beatmapDataFilename] = {
                    beatmapDataFilename,
                    difficulty: beatmap._difficulty,
                    beatmapColorSchemeIdx: beatmap._beatmapColorSchemeIdx,
                    characteristic: infoSet._beatmapCharacteristicName,
                    environmentNameIdx: beatmap._environmentNameIdx,
                    noteJumpMovementSpeed: beatmap._noteJumpMovementSpeed,
                    noteJumpStartBeatOffset: beatmap._noteJumpStartBeatOffset,
                    lightshowDataFilename: undefined,
                    beatmapAuthors: undefined,

                    label: getCDProp(beatmap, '_difficultyLabel'),
                    requirements: getCDProp(beatmap, '_requirements') as REQUIRE_MODS[],
                    suggestions: getCDProp(beatmap, '_suggestions') as SUGGEST_MODS[],
                    customData: beatmap._customData,
                }
            })
        })

        return result
    }

    constructor(json: bsmap.v2.IInfo) {
        const colorSchemes = json._colorSchemes.map(V2Info.loadColorScheme)
        const difficultyBeatmaps = V2Info.loadDifficultyBeatmaps(json._difficultyBeatmapSets)

        super(json, {
            audio: {
                lufs: undefined,
                bpm: json._beatsPerMinute,
                audioDataFilename: undefined,
                previewDuration: json._previewDuration,
                previewStartTime: json._previewStartTime,
                songDuration: undefined,
                songFilename: json._songFilename,
            },
            song: {
                author: json._songAuthorName,
                title: json._songName,
                subTitle: json._songSubName,
            },
            colorSchemes,
            coverImageFilename: json._coverImageFilename,
            environmentNames: json._environmentNames,
            songPreviewFilename: json._songFilename,
            difficultyBeatmaps,

            assetBundle: getCDProp(json, '_assetBundle'),
            contributors: getCDProp(json, '_contributors'),
            customEnvironment: getCDProp(json, '_customEnvironment'),
            customEnvironmentHash: getCDProp(json, '_customEnvironmentHash'),
            editors: getCDProp(json, '_editors'),
            customData: json._customData,
        })
    }
}
