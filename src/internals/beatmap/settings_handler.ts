import { AbstractDifficulty } from './abstract_beatmap.ts'

/** Handler to alias settings. */
export class settingsHandler {
    private diff: AbstractDifficulty
    constructor(diff: AbstractDifficulty) {
        this.diff = diff
    }

    // playerOptions
    leftHanded = '_playerOptions._leftHanded' as unknown as boolean
    playerHeight = '_playerOptions._playerHeight' as unknown as number
    automaticPlayerHeight = '_playerOptions._automaticPlayerHeight' as unknown as boolean
    sfxVolume = '_playerOptions._sfxVolume' as unknown as number
    reduceDebris = '_playerOptions._reduceDebris' as unknown as boolean
    noHud = '_playerOptions._noTextsAndHuds' as unknown as boolean
    hideMisses = '_playerOptions._noFailEffects' as unknown as boolean
    advancedHud = '_playerOptions._advancedHud' as unknown as boolean
    autoRestart = '_playerOptions._autoRestart' as unknown as boolean
    trailIntensity = '_playerOptions._saberTrailIntensity' as unknown as number
    JDtype = '_playerOptions._noteJumpDurationTypeSettings' as unknown as
        | 'Dynamic'
        | 'Static'
    hideSpawnEffect = '_playerOptions._hideNoteSpawnEffect' as unknown as boolean
    adaptiveSfx = '_playerOptions._adaptiveSfx' as unknown as boolean
    lights = ['_playerOptions._environmentEffectsFilterDefaultPreset', {
        All: 'AllEffects',
        NoFlicker: 'Strobefilter',
        None: 'NoEffects',
    }] as unknown as 'All' | 'NoFlicker' | 'None'
    lightsExPlus = [
        '_playerOptions._environmentEffectsFilterExpertPlusPreset',
        {
            All: 'AllEffects',
            NoFlicker: 'Strobefilter',
            None: 'NoEffects',
        },
    ] as unknown as 'All' | 'NoFlicker' | 'None'

    // modifiers
    energyType = '_modifiers._energyType' as unknown as 'Bar' | 'Battery'
    noFail = '_modifiers._noFailOn0Energy' as unknown as boolean
    instaFail = '_modifiers._instaFail' as unknown as boolean
    saberClashFail = '_modifiers._failOnSaberClash' as unknown as boolean
    enabledObstacles = ['_modifiers._enabledObstacleType', {
        All: 'All',
        FullOnly: 'FullHeightOnly',
        None: 'NoObstacles',
    }] as unknown as 'All' | 'FullOnly' | 'None'
    fastNotes = '_modifiers._fastNotes' as unknown as boolean
    strictAngles = '_modifiers._strictAngles' as unknown as boolean
    disappearingArrows = '_modifiers._disappearingArrows' as unknown as boolean
    ghostNotes = '_modifiers._ghostNotes' as unknown as boolean
    noBombs = '_modifiers._noBombs' as unknown as boolean
    songSpeed = '_modifiers._songSpeed' as unknown as
        | 'Slower'
        | 'Normal'
        | 'Faster'
        | 'SuperFast'
    noArrows = '_modifiers._noArrows' as unknown as boolean
    proMode = '_modifiers._proMode' as unknown as boolean
    zenMode = '_modifiers._proMode' as unknown as boolean
    smallCubes = '_modifiers._smallCubes' as unknown as boolean

    // environments
    overrideEnvironments = '_environments._overrideEnvironments' as unknown as boolean

    // colors
    overrideColors = '_colors._overrideDefaultColors' as unknown as boolean

    // graphics
    mirrorQuality = ['_graphics._mirrorGraphicsSettings', {
        OFF: 0,
        LOW: 1,
        MEDIUM: 2,
        HIGH: 3,
    }] as unknown as 'OFF' | 'LOW' | 'MEDIUM' | 'HIGH'
    bloom = ['_graphics._mainEffectGraphicsSettings', {
        false: 0,
        true: 1,
    }] as unknown as boolean
    smoke = ['_graphics._smokeGraphicsSettings', {
        false: 0,
        true: 1,
    }] as unknown as boolean
    burnMarks = '_graphics._burnMarkTrailsEnabled' as unknown as boolean
    screenDistortion = '_graphics._screenDisplacementEffectsEnabled' as unknown as boolean
    maxShockwaveParticles = '_graphics._maxShockwaveParticles' as unknown as number

    // chroma
    disableChroma = '_chroma._disableChromaEvents' as unknown as boolean
    disableEnvironmentEnhancements = '_chroma._disableEnvironmentEnhancements' as unknown as boolean
    zenModeWalls = '_chroma._forceZenModeWalls' as unknown as boolean
}
