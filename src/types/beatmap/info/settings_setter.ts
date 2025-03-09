export type SettingsSetter = {
    playerOptions: {
        leftHanded?: boolean,
        playerHeight?: number,
        automaticPlayerHeight?: boolean,
        sfxVolume?: number,
        reduceDebris?: boolean,
        noTextsAndHuds?: boolean,
        noFailEffects?: boolean,
        advancedHud?: boolean,
        autoRestart?: boolean,
        saberTrailIntensity?: number,
        noteJumpDurationTypeSettings?: 'Dynamic' | 'Static',
        noteJumpFixedDuration?: number,
        noteJumpStartBeatOffset?: number,
        hideNoteSpawnEffect?: boolean,
        adaptiveSfx?: boolean,
        environmentEffectsFilterDefaultPreset?: 'AllEffects' | 'StrobeFilter' | 'NoEffects',
        environmentEffectsFilterExpertPlusPreset?: 'AllEffects' | 'StrobeFilter' | 'NoEffects',
    },
    modifiers: {
        energyType?: 'Bar' | 'Battery',
        noFailOn0Energy?: boolean,
        instaFail?: boolean,
        failOnSaberClash?: boolean,
        enabledObstacleType?: 'All' | 'FullHeightOnly' | 'NoObstacles'
        fastNotes?: boolean,
        strictAngles?: boolean,
        disappearingArrows?: boolean,
        ghostNotes?: boolean,
        noBombs?: boolean,
        songSpeed?: 'Normal' | 'Faster' | 'Slower' | 'SuperFast',
        noArrows?: boolean,
        proMode?: boolean,
        zenMode?: boolean,
        smallCubes?: boolean
    },
    environments: {
        overrideEnvironments?: boolean
    },
    colors: {
        overrideDefaultColors?: boolean,
    },
    graphics: {
        mirrorGraphicsSettings?: 'Off' | 'Low' | 'Medium' | 'High',
        mainEffectGraphicsSettings?: 'Off' | 'On',
        smokeGraphicsSettings?: 'Off' | 'On',
        burnMarkTrailsEnabled?: boolean,
        screenDisplacementEffectsEnabled?: boolean,
        maxShockwaveParticles?: 0 | 1 | 2
    },
    chroma: {
        disableChromaEvents?: boolean,
        disableEnvironmentEnhancements?: boolean,
        disableNoteColoring?: boolean,
        forceZenModeWalls?: boolean,
    },
    _countersPlus?: Record<string, unknown>
}