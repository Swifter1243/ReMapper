import { Regex } from '../utils/regex.ts'

import { Vec3 } from '../types/data_types.ts'
import { AbstractDifficulty } from '../beatmap/abstract_beatmap.ts'

/** Where custom levels are stored on quest. */
export const QUEST_WIP_PATH =
    '/sdcard/ModData/com.beatgames.beatsaber/Mods/SongLoader/CustomWIPLevels'

/** All vivify bundle versions. */
export const BUNDLE_VERSIONS = [
    '_windows2019',
    '_windows2021',
    '_android2019',
    '_android2021',
]

/** Handler to alias settings. */
export class settingsHandler {
    private diff: AbstractDifficulty
    constructor(diff: AbstractDifficulty) {
        this.diff = diff
    }

    // playerOptions
    leftHanded = '_playerOptions._leftHanded' as unknown as boolean
    playerHeight = '_playerOptions._playerHeight' as unknown as number
    automaticPlayerHeight =
        '_playerOptions._automaticPlayerHeight' as unknown as boolean
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
    hideSpawnEffect =
        '_playerOptions._hideNoteSpawnEffect' as unknown as boolean
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
    overrideEnvironments =
        '_environments._overrideEnvironments' as unknown as boolean

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
    screenDistortion =
        '_graphics._screenDisplacementEffectsEnabled' as unknown as boolean
    maxShockwaveParticles =
        '_graphics._maxShockwaveParticles' as unknown as number

    // chroma
    disableChroma = '_chroma._disableChromaEvents' as unknown as boolean
    disableEnvironmentEnhancements =
        '_chroma._disableEnvironmentEnhancements' as unknown as boolean
    zenModeWalls = '_chroma._forceZenModeWalls' as unknown as boolean
}

/** Setting presets. You would set these equal to the "rawSettings" property on a difficulty. */
export const PRESET = {
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

/** The type for a note. */
export enum NoteType {
    RED = 0,
    BLUE = 1,
}

/** The mid anchor mode for arcs. */
export enum AnchorMode {
    STRAIGHT = 0,
    CW = 1,
    CCW = 2,
}

/** The distribution types for V3 lights. */
export enum DistributionType {
    WAVE = 1,
    STEP,
}

/** The filter types for V3 lights. */
export enum FilterType {
    SECTIONS = 1,
    STEPANDOFFSET,
}

/** The transitions for V3 lights. */
export enum LightTransition {
    INSTANT,
    TRANSITION,
    EXTEND,
}

/** The transitions for V3 light rotations. */
export enum RotationTransition {
    TRANSITION,
    EXTEND,
}

/** The colors for V3 lights. */
export enum LightColor {
    RED,
    BLUE,
    WHITE,
}

/** The rotation axis for V3 light rotations. */
export enum LightAxis {
    X,
    Y,
    Z,
}

/** The easings for V3 light rotations. */
export enum RotationEase {
    None = -1,
    Linear = 0,
    InQuad = 1,
    OutQuad = 2,
    InOutQuad = 3,
    InSine = 4,
    OutSine = 5,
    InOutSine = 6,
    InCubic = 7,
    OutCubic = 8,
    InOutCubic = 9,
    InQuart = 10,
    OutQuart = 11,
    InOutQuart = 12,
    InQuint = 13,
    OutQuint = 14,
    InOutQuint = 15,
    InExpo = 16,
    OutExpo = 17,
    InOutExpo = 18,
    InCirc = 19,
    OutCirc = 20,
    InOutCirc = 21,
    InBack = 22,
    OutBack = 23,
    InOutBack = 24,
    InElastic = 25,
    OutElastic = 26,
    InOutElastic = 27,
    InBounce = 28,
    OutBounce = 29,
    InOutBounce = 30,
    BeatSaberInOutBack = 100,
    BeatSaberInOutElastic = 101,
    BeatSaberInOutBounce = 102,
}

/** The direction of rotation for V3 light rotations. */
export enum RotationDirection {
    AUTOMATIC,
    CLOCKWISE,
    COUNTERCLOCKWISE,
}

/** Note cut directions. */
export enum NoteCut {
    UP,
    DOWN,
    LEFT,
    RIGHT,
    UP_LEFT,
    UP_RIGHT,
    DOWN_LEFT,
    DOWN_RIGHT,
    DOT,
}

/** Basic event groups/types. */
export enum EventGroup {
    BACK_LASERS,
    RING_LIGHTS,
    LEFT_LASERS,
    RIGHT_LASERS,
    CENTER_LASERS,
    BOOST,
    LEFT_EXTRA,
    RIGHT_EXTRA,
    RING_SPIN,
    RING_ZOOM,
    BILLIE_LEFT,
    BILLIE_RIGHT,
    LEFT_ROTATING_LASERS,
    RIGHT_ROTATING_LASERS,
    EARLY_ROTATION,
    LATE_ROTATION,
    LOWER_HYDRAULICS,
    RAISE_HYDRAULICS,
    GAGA_LEFT,
    GAGA_RIGHT,
    BPM = 100,
}

/** Basic lighting event actions. */
export enum EventAction {
    OFF,
    BLUE_ON,
    BLUE_FLASH,
    BLUE_FADE,
    BLUE_TRANSITION,
    RED_ON,
    RED_FLASH,
    RED_FADE,
    RED_TRANSITION,
    WHITE_ON,
    WHITE_FLASH,
    WHITE_FADE,
    WHITE_TRANSITION,
}

/** Interscope car groups. */
export enum InterscopeGroup {
    NO_HYDRAULICS,
    ALL_CARS,
    LEFT_CARS,
    RIGHT_CARS,
    FRONT_CARS,
    FRONT_MIDDLE_CARS,
    BACK_MIDDLE_CARS,
    BACK_CARS,
}

/** Rotation basic event values. */
export const RotationAction = {
    CCW_60: 0,
    CCW_45: 1,
    CCW_30: 2,
    CCW_15: 3,
    CW_15: 4,
    CW_30: 5,
    CW_45: 6,
    CW_60: 7,
}

/** Convert the value of a rotation event into it's corresponding angle. */
export const InverseRotationAction = {
    0: -60,
    1: -45,
    2: -30,
    3: -15,
    4: 15,
    5: 30,
    6: 45,
    7: 60,
}

/**
 * Known transforms for objects with ModelScene.
 * ModelScene is NOT limited to these!
 * You can figure out the transforms for ANY object.
 */
export const ENVIRONMENT_TRANSFORMS = {
    BTS: {
        PILLAR: {
            ID: new Regex().start().add('PillarPair').separate().add('PillarL')
                .separate().add('Pillar').end(),
            TRANSFORM: <Vec3[]> [
                [0.285714, 0.008868, 0.285714], //? SCALE
                [0, 0.4999, 0], //? ANCHOR
            ],
        },
        SOLID_LASER: {
            ID: new Regex('SmallPillarPair').separate().add('PillarL')
                .separate().add(
                    'LaserL',
                ).end(),
            TRANSFORM: <Vec3[]> [
                [10, 1 / 2500, 10], //? SCALE
                [0, -0.5, 0], //? ANCHOR
            ],
        },
        BLOOM_LIGHT: {
            ID: new Regex('Environment').separate().add('LaserR').end(),
            TRANSFORM: <Vec3[]> [
                [1, 0.00025, 1], //? SCALE
                [0, -0.25, 0], //? ANCHOR
            ],
        },
        LOW_CLOUDS: {
            ID: 'LowCloudsGenerator$',
            TRANSFORM: <Vec3[]> [
                [0.0064, 0.06, 0.0064], //? SCALE
                [0, 0.22, 0], //? ANCHOR
            ],
        },
        HIGH_CLOUDS: {
            ID: 'HighCloudsGenerator$',
            TRANSFORM: <Vec3[]> [
                [0.0025, 0.0425, 0.0025], //? SCALE
                [0, -0.218, 0], //? ANCHOR
            ],
        },
    },
    GAGA: {
        CUBE: {
            ID: 'BackCube$',
            TRANSFORM: <Vec3[]> [
                [1 / 5.5, 4, 2], //? SCALE
                [0, 0.5, 0.5], //? ANCHOR
            ],
        },
        SECOND_AURORA: {
            ID: new Regex('Aurora').separate().add('AuroraSecondary').end(),
            TRANSFORM: <Vec3[]> [
                [0.0025, 0.02, 0.012], //? SCALE
                [0, 0.6, 0.05], //? ANCHOR
            ],
        },
    },
    BILLIE: {
        CUBE: {
            ID: 'LeftFarRail1$',
            TRANSFORM: <Vec3[]> [
                [10, 10, 0.02306], //? SCALE
                [0, 0, -0.4974], //? ANCHOR
            ],
        },
    },
    GREEN_DAY: {
        SOLID_LASER: {
            ID: 'GlowLineR$',
            TRANSFORM: <Vec3[]> [
                [50, 0.002, 50], //? SCALE
            ],
        },
        BLOOM_LASER: {
            ID: 'FrontLight$',
            TRANSFORM: <Vec3[]> [
                [1, 0.001, 1], //? SCALE
                [0, -0.5, 0], //? ANCHOR
            ],
        },
    },
    UNIVERSAL: {
        MIRROR: { // Mirror does not work with the "Spooky" environment, but it does work with everything else!
            ID: new Regex('PlayersPlace').separate().add('Mirror').end(),
            TRANSFORM: <Vec3[]> [
                [1 / 3, 0, 0.5], //? SCALE
            ],
        },
    },
}
