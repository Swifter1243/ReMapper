import { AbstractInfo } from './abstract_info.ts'
import { bsmap } from '../../../deps.ts'
import { IColorScheme } from '../../../types/beatmap/info/rm_info.ts'
import { ColorVec } from '../../../types/math/vector.ts'
import { getCDProp } from '../../../utils/beatmap/json.ts'
import { REQUIRE_MODS, SUGGEST_MODS } from '../../../types/beatmap/beatmap.ts'
import { objectPrune } from '../../../utils/object/prune.ts'
import { DIFFICULTY_TO_RANK } from '../../../constants/info.ts'
import { IAudioInfoV2 } from '../../../types/beatmap/info/audio_info.ts'
import { IDifficultyInfoV2 } from '../../../types/beatmap/info/difficulty_info.ts'
import { SettingsSetter } from '../../../types/beatmap/info/settings_setter.ts'

type RawSettingsSetter = (bsmap.IHeckInfoCustomData & bsmap.IChromaInfoCustomData)['_settings']

export class V2Info extends AbstractInfo<bsmap.v2.IInfo> {
    /** The mapper's name. */
    levelAuthorName: string
    /** Deprecated. */
    shuffle: number
    /** Deprecated. */
    shufflePeriod: number
    /** The environment used for 360 maps. */
    allDirectionEnvironmentName: bsmap.Environment360Name
    /** The environment name used. */
    environmentName: bsmap.EnvironmentName | bsmap.EnvironmentV3Name
    /** Deprecated. */
    songTimeOffset: number
    /** Deprecated. */
    customEnvironment: string | undefined
    /** Deprecated. */
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
            environmentColor0: V2Info.loadColor(json.colorScheme.environmentColor0),
            environmentColor1: V2Info.loadColor(json.colorScheme.environmentColor1),
            environmentColor0Boost: V2Info.loadColor(json.colorScheme.environmentColor0Boost),
            environmentColor1Boost: V2Info.loadColor(json.colorScheme.environmentColor1Boost),
            obstaclesColor: V2Info.loadColor(json.colorScheme.obstaclesColor),
            saberAColor: V2Info.loadColor(json.colorScheme.saberAColor),
            saberBColor: V2Info.loadColor(json.colorScheme.saberBColor),
        }
    }

    private static saveColor(color: ColorVec) {
        return {
            r: color[0],
            g: color[1],
            b: color[2],
            a: color[3] ?? 1,
        }
    }

    private static saveColorScheme(colorScheme: IColorScheme): bsmap.v2.IInfoColorScheme {
        return {
            useOverride: colorScheme.useOverride,
            colorScheme: {
                colorSchemeId: colorScheme.colorSchemeName,
                environmentColor0: V2Info.saveColor(colorScheme.environmentColor0),
                environmentColor1: V2Info.saveColor(colorScheme.environmentColor1),
                environmentColor0Boost: V2Info.saveColor(colorScheme.environmentColor0Boost),
                environmentColor1Boost: V2Info.saveColor(colorScheme.environmentColor1Boost),
                obstaclesColor: V2Info.saveColor(colorScheme.obstaclesColor),
                saberAColor: V2Info.saveColor(colorScheme.saberAColor),
                saberBColor: V2Info.saveColor(colorScheme.saberBColor),
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
                    noteJumpSpeed: beatmap._noteJumpMovementSpeed,
                    noteJumpOffset: beatmap._noteJumpStartBeatOffset,

                    difficultyLabel: getCDProp(beatmap, '_difficultyLabel'),
                    requirements: getCDProp(beatmap, '_requirements') as REQUIRE_MODS[],
                    suggestions: getCDProp(beatmap, '_suggestions') as SUGGEST_MODS[],
                    warnings: getCDProp(beatmap, '_warnings'),
                    information: getCDProp(beatmap, '_information'),
                    settingsSetter: V2Info.loadSettingsSetter(getCDProp(beatmap, '_settings')),
                    unsafeCustomData: beatmap._customData,
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
                _noteJumpMovementSpeed: beatmap.noteJumpSpeed,
                _noteJumpStartBeatOffset: beatmap.noteJumpOffset,
                _environmentNameIdx: beatmap.environmentNameIdx,
                _customData: objectPrune({
                    _requirements: beatmap.requirements,
                    _suggestions: beatmap.suggestions,
                    _difficultyLabel: beatmap.difficultyLabel,
                    _information: beatmap.information,
                    _warnings: beatmap.warnings,
                    _settings: V2Info.saveSettingsSetter(beatmap.settingsSetter),
                    ...beatmap.unsafeCustomData,
                }),
            })
        })

        return Object.values(characteristics)
    }

    private static loadMirrorGraphicsSettings(
        _mirrorGraphicsSettings?: 0 | 1 | 2 | 3,
    ): SettingsSetter['graphics']['mirrorGraphicsSettings'] {
        switch (_mirrorGraphicsSettings) {
            case 0:
                return 'Off'
            case 1:
                return 'Low'
            case 2:
                return 'Medium'
            case 3:
                return 'High'
            default:
                return undefined
        }
    }

    private static saveMirrorGraphicsSettings(
        mirrorGraphicsSettings?: SettingsSetter['graphics']['mirrorGraphicsSettings'],
    ): 0 | 1 | 2 | 3 | undefined {
        switch (mirrorGraphicsSettings) {
            case 'Off':
                return 0
            case 'Low':
                return 1
            case 'Medium':
                return 2
            case 'High':
                return 3
            default:
                return undefined
        }
    }

    private static loadBoolean(_json?: 0 | 1 | boolean): 'On' | 'Off' | undefined {
        switch (_json) {
            case false:
            case 0:
                return 'Off'
            case true:
            case 1:
                return 'On'
            default:
                return undefined
        }
    }

    private static saveBoolean(json?: 'On' | 'Off'): 0 | 1 | undefined {
        switch (json) {
            case 'On':
                return 1
            case 'Off':
                return 0
            default:
                return undefined
        }
    }

    private static loadSettingsSetter(json: RawSettingsSetter): SettingsSetter {
        const chroma = json?._chroma
        const environments = json?._environments
        const colors = json?._colors
        const graphics = json?._graphics
        const modifiers = json?._modifiers
        const playerOptions = json?._playerOptions
        // TODO: bsmap got this wrong
        // @ts-ignore 2322
        const _countersPlus = json?._countersPlus

        return {
            chroma: {
                disableChromaEvents: chroma?._disableChromaEvents,
                disableEnvironmentEnhancements: chroma?._disableEnvironmentEnhancements,
                disableNoteColoring: chroma?._disableNoteColoring,
                // TODO: bsmap got this wrong
                // @ts-ignore 2322
                forceZenModeWalls: chroma?._forceZenModeWalls,
            },
            environments: {
                overrideEnvironments: environments?._overrideEnvironments,
            },
            colors: {
                overrideDefaultColors: colors?._overrideDefaultColors,
            },
            graphics: {
                mirrorGraphicsSettings: V2Info.loadMirrorGraphicsSettings(graphics?._mirrorGraphicsSettings),
                bloomGraphicsSettings: V2Info.loadBoolean(graphics?._mainEffectGraphicsSettings),
                smokeGraphicsSettings: V2Info.loadBoolean(graphics?._smokeGraphicsSettings),
                burnMarkTrailsEnabled: graphics?._burnMarkTrailsEnabled,
                screenDisplacementEffectsEnabled: graphics?._screenDisplacementEffectsEnabled,
                maxShockwaveParticles: graphics?._maxShockwaveParticles,
            },
            modifiers: {
                energyType: modifiers?._energyType,
                noFailOn0Energy: modifiers?._noFailOn0Energy,
                instaFail: modifiers?._instaFail,
                failOnSaberClash: modifiers?._failOnSaberClash,
                enabledObstacleType: modifiers?._enabledObstacleType,
                fastNotes: modifiers?._fastNotes,
                strictAngles: modifiers?._strictAngles,
                disappearingArrows: modifiers?._disappearingArrows,
                ghostNotes: modifiers?._ghostNotes,
                noBombs: modifiers?._noBombs,
                songSpeed: modifiers?._songSpeed,
                noArrows: modifiers?._noArrows,
                proMode: modifiers?._proMode,
                zenMode: modifiers?._zenMode,
                smallCubes: modifiers?._smallCubes,
            },
            playerOptions: {
                leftHanded: playerOptions?._leftHanded,
                playerHeight: playerOptions?._playerHeight,
                automaticPlayerHeight: playerOptions?._automaticPlayerHeight,
                sfxVolume: playerOptions?._sfxVolume,
                reduceDebris: playerOptions?._reduceDebris,
                noTextsAndHuds: playerOptions?._noTextsAndHuds,
                noFailEffects: playerOptions?._noFailEffects,
                advancedHud: playerOptions?._advancedHud,
                autoRestart: playerOptions?._autoRestart,
                saberTrailIntensity: playerOptions?._saberTrailIntensity,
                noteJumpDurationTypeSettings: playerOptions?._noteJumpDurationTypeSettings,
                noteJumpFixedDuration: playerOptions?._noteJumpFixedDuration,
                noteJumpStartBeatOffset: playerOptions?._noteJumpStartBeatOffset,
                hideNoteSpawnEffect: playerOptions?._hideNoteSpawnEffect,
                // TODO: bsmap also got this wrong
                // @ts-ignore 2322
                adaptiveSfx: playerOptions?._adaptiveSfx,
                // TODO: bsmap ALSO got THIS wrong
                // @ts-ignore 2322
                environmentEffectsFilterDefaultPreset: playerOptions?._environmentEffectsFilterDefaultPreset,
                // @ts-ignore 2322
                environmentEffectsFilterExpertPlusPreset: playerOptions?._environmentEffectsFilterExpertPlusPreset,
            },
            ...{
                _countersPlus
            }
        }
    }

    private static saveSettingsSetter(json: SettingsSetter): RawSettingsSetter {
        const chroma = json.chroma
        const graphics = json.graphics
        const modifiers = json.modifiers
        const colors = json.colors
        const environments = json.environments
        const playerOptions = json.playerOptions
        const _countersPlus = json._countersPlus

        return {
            _chroma: {
                _disableEnvironmentEnhancements: chroma.disableEnvironmentEnhancements,
                _disableChromaEvents: chroma.disableChromaEvents,
                _disableNoteColoring: chroma.disableNoteColoring,
                _forceZenModeWall: chroma.forceZenModeWalls,
            },
            _graphics: {
                _mainEffectGraphicsSettings: V2Info.saveBoolean(graphics.bloomGraphicsSettings),
                _burnMarkTrailsEnabled: graphics.burnMarkTrailsEnabled,
                _maxShockwaveParticles: graphics.maxShockwaveParticles,
                _mirrorGraphicsSettings: V2Info.saveMirrorGraphicsSettings(graphics.mirrorGraphicsSettings),
                _screenDisplacementEffectsEnabled: graphics.screenDisplacementEffectsEnabled,
                _smokeGraphicsSettings: V2Info.saveBoolean(graphics.smokeGraphicsSettings),
            },
            _modifiers: {
                _energyType: modifiers?.energyType,
                _noFailOn0Energy: modifiers?.noFailOn0Energy,
                _instaFail: modifiers?.instaFail,
                _failOnSaberClash: modifiers?.failOnSaberClash,
                _enabledObstacleType: modifiers?.enabledObstacleType,
                _fastNotes: modifiers?.fastNotes,
                _strictAngles: modifiers?.strictAngles,
                _disappearingArrows: modifiers?.disappearingArrows,
                _ghostNotes: modifiers?.ghostNotes,
                _noBombs: modifiers?.noBombs,
                _songSpeed: modifiers?.songSpeed,
                _noArrows: modifiers?.noArrows,
                _proMode: modifiers?.proMode,
                _zenMode: modifiers?.zenMode,
                _smallCubes: modifiers?.smallCubes
            },
            _colors: {
                _overrideDefaultColors: colors.overrideDefaultColors
            },
            _environments: {
                _overrideEnvironments: environments.overrideEnvironments,
            },
            _playerOptions: {
                _leftHanded: playerOptions?.leftHanded,
                _playerHeight: playerOptions?.playerHeight,
                _automaticPlayerHeight: playerOptions?.automaticPlayerHeight,
                _sfxVolume: playerOptions?.sfxVolume,
                _reduceDebris: playerOptions?.reduceDebris,
                _noTextsAndHuds: playerOptions?.noTextsAndHuds,
                _noFailEffects: playerOptions?.noFailEffects,
                _advancedHud: playerOptions?.advancedHud,
                _autoRestart: playerOptions?.autoRestart,
                _saberTrailIntensity: playerOptions?.saberTrailIntensity,
                _noteJumpDurationTypeSettings: playerOptions?.noteJumpDurationTypeSettings,
                _noteJumpFixedDuration: playerOptions?.noteJumpFixedDuration,
                _noteJumpStartBeatOffset: playerOptions?.noteJumpStartBeatOffset,
                _hideNoteSpawnEffect: playerOptions?.hideNoteSpawnEffect,
                // @ts-ignore 2322
                _adaptiveSfx: playerOptions?.adaptiveSfx,
                // @ts-ignore 2322
                _environmentEffectsFilterDefaultPreset: playerOptions?.environmentEffectsFilterDefaultPreset,
                // @ts-ignore 2322
                _environmentEffectsFilterExpertPlusPreset: playerOptions?.environmentEffectsFilterExpertPlusPreset,
            },
            ...{
                _countersPlus: _countersPlus
            }
        }
    }

    constructor(json: bsmap.v2.IInfo) {
        const colorSchemes = json._colorSchemes.map(V2Info.loadColorScheme)
        const difficultyBeatmaps = V2Info.loadDifficultyBeatmaps(json._difficultyBeatmapSets)
        const customEnvironment = getCDProp(json, '_customEnvironment')
        const customEnvironmentHash = getCDProp(json, '_customEnvironmentHash')

        super(json, {
            audio: {
                beatsPerMinute: json._beatsPerMinute,
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

            assetBundleChecksums: getCDProp(json, '_assetBundle'),
            contributors: getCDProp(json, '_contributors'),
            editors: getCDProp(json, '_editors'),
            unsafeCustomData: json._customData ?? {},
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
            _beatsPerMinute: this.audio.beatsPerMinute,
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
                _assetBundle: this.assetBundleChecksums,
                ...this.unsafeCustomData,
            }),
        }
    }
}
