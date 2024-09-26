import { AbstractInfo } from './abstract_info.ts'
import { bsmap } from '../../../deps.ts'
import { IAudioInfoV2, IColorScheme, IDifficultyInfoV2 } from '../../../types/beatmap/rm_info.ts'
import { ColorVec } from '../../../types/math/vector.ts'
import { getCDProp } from '../../../utils/beatmap/json.ts'
import { REQUIRE_MODS, SUGGEST_MODS } from '../../../types/beatmap/beatmap.ts'
import { objectPrune } from '../../../utils/object/prune.ts'
import { DIFFICULTY_TO_RANK } from '../../../constants/info.ts'

export class V2Info extends AbstractInfo<bsmap.v2.IInfo> {
    levelAuthorName: string
    shuffle: number
    shufflePeriod: number
    allDirectionEnvironmentName: bsmap.Environment360Name
    environmentName: bsmap.EnvironmentName | bsmap.EnvironmentV3Name
    songTimeOffset: number
    customEnvironment: string | undefined
    customEnvironmentHash: string | undefined

    declare audio: IAudioInfoV2
    declare difficultyBeatmaps: Partial<Record<bsmap.GenericFileName, IDifficultyInfoV2>>

    private static loadColor(json: {
        r: number
        g: number
        b: number
        a: number
    }): ColorVec {
        return [json.r, json.g, json.b, json.a]
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

    private static saveColor(json: ColorVec) {
        return {
            r: json[0],
            g: json[1],
            b: json[2],
            a: json[3] ?? 1,
        }
    }

    private static saveColorScheme(json: IColorScheme): bsmap.v2.IInfoColorScheme {
        return {
            useOverride: json.useOverride,
            colorScheme: {
                colorSchemeId: json.colorSchemeName,
                environmentColor0: this.saveColor(json.environmentColor0),
                environmentColor1: this.saveColor(json.environmentColor1),
                environmentColor0Boost: this.saveColor(json.environmentColor0Boost),
                environmentColor1Boost: this.saveColor(json.environmentColor1Boost),
                obstaclesColor: this.saveColor(json.obstaclesColor),
                saberAColor: this.saveColor(json.saberAColor),
                saberBColor: this.saveColor(json.saberBColor),
            },
        }
    }

    private static loadDifficultyBeatmaps(json: bsmap.v2.IInfoSet[]): V2Info['difficultyBeatmaps'] {
        const result: V2Info['difficultyBeatmaps'] = {}

        json.forEach((infoSet) => {
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

                    difficultyLabel: getCDProp(beatmap, '_difficultyLabel'),
                    requirements: getCDProp(beatmap, '_requirements') as REQUIRE_MODS[],
                    suggestions: getCDProp(beatmap, '_suggestions') as SUGGEST_MODS[],
                    warnings: getCDProp(beatmap, '_warnings'),
                    information: getCDProp(beatmap, '_information'),
                    customData: beatmap._customData,
                }
            })
        })

        return result
    }

    private static saveDifficultyBeatmaps(json: V2Info['difficultyBeatmaps']): bsmap.v2.IInfoSet[] {
        const characteristics: Partial<Record<bsmap.CharacteristicName, bsmap.v2.IInfoSet>> = {}

        Object.values(json).forEach((beatmap) => {
            characteristics[beatmap.characteristic] ??= {
                _beatmapCharacteristicName: beatmap.characteristic,
                _difficultyBeatmaps: [],
            }

            const characteristic = characteristics[beatmap.characteristic]!
            characteristic._difficultyBeatmaps.push({
                _difficulty: beatmap.difficulty,
                _beatmapFilename: beatmap.beatmapDataFilename,
                _difficultyRank: DIFFICULTY_TO_RANK[beatmap.difficulty],
                _beatmapColorSchemeIdx: beatmap.beatmapColorSchemeIdx,
                _noteJumpMovementSpeed: beatmap.noteJumpMovementSpeed,
                _noteJumpStartBeatOffset: beatmap.noteJumpStartBeatOffset,
                _environmentNameIdx: beatmap.environmentNameIdx,
                _customData: objectPrune({
                    _requirements: beatmap.requirements,
                    _suggestions: beatmap.suggestions,
                    _difficultyLabel: beatmap.difficultyLabel,
                    _information: beatmap.information,
                    _warnings: beatmap.warnings,
                    ...beatmap.customData,
                }),
            })
        })

        return Object.values(characteristics)
    }

    constructor(json: bsmap.v2.IInfo) {
        const colorSchemes = json._colorSchemes.map(V2Info.loadColorScheme)
        const difficultyBeatmaps = V2Info.loadDifficultyBeatmaps(json._difficultyBeatmapSets)
        const customEnvironment = getCDProp(json, '_customEnvironment')
        const customEnvironmentHash = getCDProp(json, '_customEnvironmentHash')

        super(json, {
            audio: {
                bpm: json._beatsPerMinute,
                previewDuration: json._previewDuration,
                previewStartTime: json._previewStartTime,
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
            difficultyBeatmaps,

            assetBundle: getCDProp(json, '_assetBundle'),
            contributors: getCDProp(json, '_contributors'),
            editors: getCDProp(json, '_editors'),
            customData: json._customData ?? {},
        })

        this.levelAuthorName = json._levelAuthorName
        this.shuffle = json._shuffle
        this.shufflePeriod = json._shufflePeriod
        this.allDirectionEnvironmentName = json._allDirectionsEnvironmentName
        this.environmentName = json._environmentName
        this.songTimeOffset = json._songTimeOffset
        this.customEnvironment = customEnvironment
        this.customEnvironmentHash = customEnvironmentHash
    }

    toJSON(): bsmap.v2.IInfo {
        const _colorSchemes = this.colorSchemes.map(V2Info.saveColorScheme)
        const _difficultyBeatmapSets = V2Info.saveDifficultyBeatmaps(this.difficultyBeatmaps)

        return {
            _version: '2.1.0',
            _songName: this.song.title,
            _songSubName: this.song.subTitle,
            _songAuthorName: this.song.author,
            _levelAuthorName: this.json._levelAuthorName,
            _beatsPerMinute: this.audio.bpm,
            _songFilename: this.audio.songFilename,
            _environmentNames: this.environmentNames,
            _coverImageFilename: this.coverImageFilename,
            _previewDuration: this.audio.previewDuration,
            _previewStartTime: this.audio.previewStartTime,
            _shuffle: this.shuffle,
            _shufflePeriod: this.shufflePeriod,
            _allDirectionsEnvironmentName: this.allDirectionEnvironmentName,
            _environmentName: this.environmentName,
            _songTimeOffset: this.songTimeOffset,
            _colorSchemes,
            _difficultyBeatmapSets,
            _customData: objectPrune({
                _editors: this.editors,
                _contributors: this.contributors,
                _customEnvironment: this.customEnvironment,
                _customEnvironmentHash: this.customEnvironmentHash,
                _assetBundle: this.assetBundle,
                ...this.customData,
            }),
        }
    }
}
