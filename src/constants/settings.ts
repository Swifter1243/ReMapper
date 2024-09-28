import { SettingsSetter } from '../types/beatmap/info/settings_setter.ts'

/** Setting presets. You would set these equal to the "rawSettings" property on a difficulty. */
export const SETTINGS_PRESET = {
    /** Nothing on the settings setter. */
    NONE: {
        modifiers: {},
        colors: {},
        environments: {},
        graphics: {},
        playerOptions: {},
        chroma: {}
    },
    /** Settings which are good for maps that need chroma and noodle. */
    MODCHART_SETTINGS: {
        playerOptions: {
            environmentEffectsFilterExpertPlusPreset: 'AllEffects',
            environmentEffectsFilterDefaultPreset: 'AllEffects',
        },
        graphics: {
            bloomGraphicsSettings: 'On',
            maxShockwaveParticles: 0,
            screenDisplacementEffectsEnabled: true,
        },
        chroma: {
            disableEnvironmentEnhancements: false,
            disableChromaEvents: false,
            forceZenModeWalls: true,
        },
        modifiers: {
            enabledObstacleType: 'All',
        },
        colors: {},
        environments: {},
    },
    /** Settings which are good for maps that have chroma environment stuff. */
    CHROMA_SETTINGS: {
        playerOptions: {
            environmentEffectsFilterExpertPlusPreset: 'AllEffects',
            environmentEffectsFilterDefaultPreset: 'AllEffects',
        },
        graphics: {
            bloomGraphicsSettings: 'On',
        },
        chroma: {
            disableEnvironmentEnhancements: false,
            disableChromaEvents: false,
        },
        environments: {},
        colors: {},
        modifiers: {},
    },
} satisfies Record<string, SettingsSetter>

/** The track used to scale notes to `[1,1,1]` initially if enabled in the ReMapper settings. */
export const DEFAULT_SCALED_TRACK = 'RM_forceDefaultScale'
