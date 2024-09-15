/** Setting presets. You would set these equal to the "rawSettings" property on a difficulty. */
export const SETTINGS_PRESET = {
    /** Settings which are good for maps that need chroma and noodle. */
    MODCHART_SETTINGS: {
        _playerOptions: {
            _environmentEffectsFilterExpertPlusPreset: 'AllEffects',
            _environmentEffectsFilterDefaultPreset: 'AllEffects',
        },
        _graphics: {
            _mainEffectGraphicsSettings: 1,
            _maxShockwaveParticles: 0,
            _screenDisplacementEffectsEnabled: true,
        },
        _chroma: {
            _disableEnvironmentEnhancements: false,
            _disableChromaEvents: false,
            _forceZenModeWalls: true,
        },
        _modifiers: {
            _enabledObstacleType: 'All',
        },
    },
    /** Settings which are good for maps that have chroma environment stuff. */
    CHROMA_SETTINGS: {
        _playerOptions: {
            _environmentEffectsFilterExpertPlusPreset: 'AllEffects',
            _environmentEffectsFilterDefaultPreset: 'AllEffects',
        },
        _graphics: {
            _mainEffectGraphicsSettings: 1,
        },
        _chroma: {
            _disableEnvironmentEnhancements: false,
            _disableChromaEvents: false,
        },
    },
}

/** The track used to scale notes to `[1,1,1]` initially if enabled in the ReMapper settings. */
export const DEFAULT_SCALED_TRACK = "RM_forceDefaultScale"