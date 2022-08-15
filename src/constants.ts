import { Difficulty } from "./beatmap.ts"
import { Vec3 } from "./general.ts"
import { Regex } from "./regex.ts"

export enum MODS {
    NOODLE_EXTENSIONS = "Noodle Extensions",
    CHROMA = "Chroma"
}

export type ENV_NAMES = 
"BTSEnvironment" |
"BigMirrorEnvironment" |
"BillieEnvironment" |
"CrabRaveEnvironment" |
"DefaultEnvironment" |
"DragonsEnvironment" |
"FitBeatEnvironment" |
"GagaEnvironment" |
"GreenDayEnvironment" |
"GreenDayGrenadeEnvironment" |
"InterscopeEnvironment" |
"KDAEnvironment" |
"KaleidoscopeEnvironment" |
"LinkinParkEnvironment" |
"MonstercatEnvironment" |
"NiceEnvironment" |
"OriginsEnvironment" |
"PanicEnvironment" |
"RocketEnvironment" |
"SkrillexEnvironment" |
"HalloweenEnvironment" |
"TimbalandEnvironment" |
"TriangleEnvironment"

export type EASE = 
"easeLinear" |
"easeStep" |
"easeInQuad" |
"easeOutQuad" |
"easeInOutQuad" |
"easeInCubic" |
"easeOutCubic" |
"easeInOutCubic" |
"easeInQuart" |
"easeOutQuart" |
"easeInOutQuart" |
"easeInQuint" |
"easeOutQuint" |
"easeInOutQuint" |
"easeInSine" |
"easeOutSine" |
"easeInOutSine" |
"easeInExpo" |
"easeOutExpo" |
"easeInOutExpo" |
"easeInCirc" |
"easeOutCirc" |
"easeInOutCirc" |
"easeInElastic" |
"easeOutElastic" |
"easeInOutElastic" |
"easeInBack" |
"easeOutBack" |
"easeInOutBack" |
"easeInBounce" |
"easeOutBounce" |
"easeInOutBounce"

export type SPLINE = 
"splineCatmullRom"

export class settingsHandler {
    private diff: Difficulty;
    constructor(diff: Difficulty) { this.diff = diff }

    leftHanded = "_playerOptions._leftHanded" as unknown as boolean;
    playerHeight = "_playerOptions._playerHeight" as unknown as number;
    automaticPlayerHeight = "_playerOptions._automaticPlayerHeight" as unknown as boolean;
    sfxVolume = "_playerOptions._sfxVolume" as unknown as number;
    reduceDebris = "_playerOptions._reduceDebris" as unknown as boolean;
    noHud = "_playerOptions._noTextsAndHuds" as unknown as boolean;
    hideMisses = "_playerOptions._noFailEffects" as unknown as boolean;
    advancedHud = "_playerOptions._advancedHud" as unknown as boolean;
    autoRestart = "_playerOptions._autoRestart" as unknown as boolean;
    trailIntensity = "_playerOptions._saberTrailIntensity" as unknown as number;
    JDtype = "_playerOptions._noteJumpDurationTypeSettings" as unknown as "Dynamic" | "Static";
    hideSpawnEffect = "_playerOptions._hideNoteSpawnEffect" as unknown as boolean;
    adaptiveSfx = "_playerOptions._adaptiveSfx" as unknown as boolean;
    lights = ["_playerOptions._environmentEffectsFilterDefaultPreset", {
        All: "AllEffects",
        NoFlicker: "Strobefilter",
        None: "NoEffects"
    }] as unknown as "All" | "NoFlicker" | "None";
    lightsExPlus = ["_playerOptions._environmentEffectsFilterExpertPlusPreset", {
        All: "AllEffects",
        NoFlicker: "Strobefilter",
        None: "NoEffects"
    }] as unknown as "All" | "NoFlicker" | "None";
    energyType = "_modifiers._energyType" as unknown as "Bar" | "Battery";
    noFail = "_modifiers._noFailOn0Energy" as unknown as boolean;
    instaFail = "_modifiers._instaFail" as unknown as boolean;
    saberClashFail = "_modifiers._failOnSaberClash" as unknown as boolean;
    enabledObstacles = ["_modifiers._enabledObstacleType", {
        All: "All",
        FullOnly: "FullHeightOnly",
        None: "NoObstacles"
    }] as unknown as "All" | "FullOnly" | "None";
    fastNotes = "_modifiers._fastNotes" as unknown as boolean;
    strictAngles = "_modifiers._strictAngles" as unknown as boolean;
    disappearingArrows = "_modifiers._disappearingArrows" as unknown as boolean;
    ghostNotes = "_modifiers._ghostNotes" as unknown as boolean;
    noBombs = "_modifiers._noBombs" as unknown as boolean;
    songSpeed = "_modifiers._songSpeed" as unknown as "Slower" | "Normal" | "Faster" | "SuperFast";
    noArrows = "_modifiers._noArrows" as unknown as boolean;
    proMode = "_modifiers._proMode" as unknown as boolean;
    zenMode = "_modifiers._proMode" as unknown as boolean;
    smallCubes = "_modifiers._smallCubes" as unknown as boolean;
    overrideEnvironments = "_environments._overrideEnvironments" as unknown as boolean;
    overrideColors = "_environments._overrideDefaultColors" as unknown as boolean;
    mirrorQuality = ["_graphics._mirrorGraphicsSettings", {
        OFF: 0,
        LOW: 1,
        MEDIUM: 2,
        HIGH: 3
    }] as unknown as "OFF" | "LOW" | "MEDIUM" | "HIGH";
    bloom = ["_graphics._mainEffectGraphicsSettings", {
        false: 0,
        true: 1
    }] as unknown as boolean;
    smoke = ["_graphics._smokeGraphicsSettings", {
        false: 0,
        true: 1
    }] as unknown as boolean;
    burnMarks = "_graphics._burnMarkTrailsEnabled" as unknown as boolean;
    screenDistortion = "_graphics._screenDisplacementEffectsEnabled" as unknown as boolean;
    maxShockwaveParticles = "_graphics._maxShockwaveParticles" as unknown as number;
    disableChroma = "_chroma._disableChromaEvents" as unknown as boolean;
    disableEnvironmentEnhancements = "_chroma._disableEnvironmentEnhancements" as unknown as boolean;
    zenModeWalls = "_chroma._forceZenModeWalls" as unknown as boolean;
}

export const PRESET = {
    MODCHART_SETTINGS: {
        _playerOptions: {
            _environmentEffectsFilterExpertPlusPreset: "AllEffects",
            _environmentEffectsFilterDefaultPreset: "AllEffects"
        },
        _graphics: {
            _mainEffectGraphicsSettings: true,
            _maxShockwaveParticles: 0,
            _screenDisplacementEffectsEnabled: true
        },
        _chroma: {
            _disableEnvironmentEnhancements: false,
            _disableChromaEvents: false,
            _forceZenModeWalls: true
        },
        _modifiers: {
            _noFailOn0Energy: true,
            _enabledObstacleType: "All"
        }
    },
    CHROMA_SETTINGS: {
        _playerOptions: {
            _environmentEffectsFilterExpertPlusPreset: "AllEffects",
            _environmentEffectsFilterDefaultPreset: "AllEffects"
        },
        _graphics: {
            _mainEffectGraphicsSettings: true
        },
        _chroma: {
            _disableEnvironmentEnhancements: false,
            _disableChromaEvents: false
        }
    }
}

export enum NOTE {
    // Type
    RED = 0,
    BLUE = 1,
    BOMB = 3,

    // Direction
    UP = 0,
    DOWN = 1,
    LEFT = 2,
    RIGHT = 3,
    UP_LEFT = 4,
    UP_RIGHT = 5,
    DOWN_LEFT = 6,
    DOWN_RIGHT = 7,
    DOT = 8
}

export enum WALL {
    // Type
    FULL = 0,
    CROUCH = 1
}

export const EVENT = {
    // Type
    BACK_LASERS: 0,
    RING_LIGHTS: 1,
    LEFT_LASERS: 2,
    RIGHT_LASERS: 3,
    CENTER_LASERS: 4,
    BOOST: 5,
    LEFT_EXTRA: 6,
    RIGHT_EXTRA: 7,
    RING_SPIN: 8,
    RING_ZOOM: 9,
    BILLIE_LEFT: 10,
    BILLIE_RIGHT: 11,
    LEFT_SPEED: 12,
    RIGHT_SPEED: 13,
    EARLY_ROTATION: 14,
    LATE_ROTATION: 15,
    LOWER_HYDRAULICS: 16,
    RAISE_HYDRAULICS: 17,

    // Regular Action
    OFF: 0,
    BLUE_ON: 1,
    BLUE_FLASH: 2,
    BLUE_FADE: 3,
    BLUE_IN: 4,
    RED_ON: 5,
    RED_FLASH: 6,
    RED_FADE: 7,
    RED_IN: 8,

    // Boost Action
    BOOST_OFF: 0,
    BOOST_ON: 1,

    // Interscope Action
    NO_HYDRAULICS: 0,
    ALL_CARS: 1,
    LEFT_CARS: 2,
    RIGHT_CARS: 3,
    FRONT_CARS: 4,
    FRONT_MIDDLE_CARS: 5,
    BACK_MIDDLE_CARS: 6,
    BACK_CARS: 7,

    // Rotation Action
    CCW_60: 0,
    CCW_45: 1,
    CCW_30: 2,
    CCW_15: 3,
    CW_15: 4,
    CW_30: 5,
    CW_45: 6,
    CW_60: 7
}

export enum ANIM {
    POSITION = "_position",
    DEFINITE_POSITION = "_definitePosition",
    LOCAL_POSITION = "_localPosition",
    ROTATION = "_rotation",
    LOCAL_ROTATION = "_localRotation",
    SCALE = "_scale",
    DISSOLVE = "_dissolve",
    DISSOLVE_ARROW = "_dissolveArrow",
    COLOR = "_color",
    INTERACTABLE = "_interactable",
    ATTENUATION = "_attenuation",
    OFFSET = "_offset",
    STARTY = "_startY",
    HEIGHT = "_height",
    TIME = "_time"
}

// Known objects that work. Feel free to PR your own!
export const ENV = {
    BTS: {
        PILLAR: {
            ID: new Regex().start().add("PillarPair").separate().add("PillarL").separate().add("Pillar").end(),
            SCALE: <Vec3>[0.285714, 0.008868, 0.285714],
            ANCHOR: <Vec3>[0, 0.4999, 0]
        },
        SOLID_LASER: {
            ID: new Regex().add("SmallPillarPair").separate().add("PillarL").separate().add("LaserL").end(),
            SCALE: <Vec3>[10, 1 / 2500, 10],
            ANCHOR: <Vec3>[0, -0.5, 0]
        },
        LOW_CLOUDS: {
            ID: "LowCloudsGenerator$",
            SCALE: <Vec3>[0.0064, 0.06, 0.0064],
            ANCHOR: <Vec3>[0, 0.22, 0]
        },
        HIGH_CLOUDS: {
            ID: "HighCloudsGenerator$",
            SCALE: <Vec3>[0.0025, 0.0425, 0.0025],
            ANCHOR: <Vec3>[0, -0.218, 0]
        }
    },
    GAGA: {
        CUBE: {
            ID: "BackCube$",
            SCALE: <Vec3>[1 / 5.5, 4, 2],
            ANCHOR: <Vec3>[0, 0.5, 0.5]
        },
        SECOND_AURORA: {
            ID: new Regex().add("Aurora").separate().add("AuroraSecondary").end(),
            SCALE: <Vec3>[0.0025, 0.02, 0.012],
            ANCHOR: <Vec3>[0, 0.6, 0.05]
        }
    },
    BILLIE: {
        CUBE: {
            ID: "LeftFarRail1$",
            SCALE: <Vec3>[10, 10, 0.02306],
            ANCHOR: <Vec3>[0, 0, -0.4974]
        }
    }
}

export enum COLOR {
    RGB = "RGB",
    HSV = "HSV"
}

export enum LOOKUP {
    CONTAINS = "Contains",
    REGEX = "Regex",
    EXACT = "Exact"
}

export enum GEO_TYPE {
    SPHERE = "Sphere",
    CAPSULE = "Capsule",
    CYLINDER = "Cylinder",
    CUBE = "Cube",
    PLANE = "Plane",
    QUAD = "Quad",
    TRIANGLE = "Triangle"
}

export enum GEO_SHADER {
    STANDARD = "Standard",
    OPAQUE_LIGHT = "OpaqueLight",
    TRANSPARENT_LIGHT = "TransparentLight"
}