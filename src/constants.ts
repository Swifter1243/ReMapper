import { Vec3 } from "./general"
import { Regex } from "./regex"

export enum MODS {
    NOODLE_EXTENSIONS = "Noodle Extensions",
    CHROMA = "Chroma"
}

export enum ENV_NAMES {
    BTS = "BTSEnvironment",
    BIG_MIRROR = "BigMirrorEnvironment",
    BILLIE = "BillieEnvironment",
    CRAB_RAVE = "CrabRaveEnvironment",
    DEFAULT = "DefaultEnvironment",
    DRAGONS = "DragonsEnvironment",
    FITBEAT = "FitBeatEnvironment",
    GAGA = "GagaEnvironment",
    GREENDAY = "GreenDayEnvironment",
    GREENDAY_GRENADE = "GreenDayGrenadeEnvironment",
    INTERSCOPE = "InterscopeEnvironment",
    KDA = "KDAEnvironment",
    KALEIDOSCOPE = "KaleidoscopeEnvironment",
    LINKIN_PARK = "LinkinParkEnvironment",
    MONSTERCAT = "MonstercatEnvironment",
    NICE = "NiceEnvironment",
    ORIGINS = "OriginsEnvironment",
    PANIC = "PanicEnvironment",
    ROCKET_LEAGUE = "RocketEnvironment",
    SKRILLEX = "SkrillexEnvironment",
    SPOOKY = "HalloweenEnvironment",
    TIMBALAND = "TimbalandEnvironment",
    TRIANGLE = "TriangleEnvironment"
}

export enum EASE {
    LINEAR = "easeLinear",
    STEP = "easeStep",
    IN_QUAD = "easeInQuad",
    OUT_QUAD = "easeOutQuad",
    IN_OUT_QUAD = "easeInOutQuad",
    IN_CUBIC = "easeInCubic",
    OUT_CUBIC = "easeOutCubic",
    IN_OUT_CUBIC = "easeInOutCubic",
    IN_QUART = "easeInQuart",
    OUT_QUART = "easeOutQuart",
    IN_OUT_QUART = "easeInOutQuart",
    IN_QUINT = "easeInQuint",
    OUT_QUINT = "easeOutQuint",
    IN_OUT_QUINT = "easeInOutQuint",
    IN_SINE = "easeInSine",
    OUT_SINE = "easeOutSine",
    IN_OUT_SINE = "easeInOutSine",
    IN_EXPO = "easeInExpo",
    OUT_EXPO = "easeOutExpo",
    IN_OUT_EXPO = "easeInOutExpo",
    IN_CIRC = "easeInCirc",
    OUT_CIRC = "easeOutCirc",
    IN_OUT_CIRC = "easeInOutCirc",
    IN_ELASTIC = "easeInElastic",
    OUT_ELASTIC = "easeOutElastic",
    IN_OUT_ELASTIC = "easeInOutElastic",
    IN_BACK = "easeInBack",
    OUT_BACK = "easeOutBack",
    IN_OUT_BACK = "easeInOutBack",
    IN_BOUNCE = "easeInBounce",
    OUT_BOUNCE = "easeOutBounce",
    IN_OUT_BOUNCE = "easeInOutBounce"
}

export enum SPLINE {
    CATMULLROM = "splineCatmullRom"
}

export const SETTINGS = {
    LEFT_HANDED: "_playerOptions._leftHanded",
    PLAYER_HEIGHT: "_playerOptions._playerHeight",
    AUTOMATIC_PLAYER_HEIGHT: "_playerOptions._automaticPlayerHeight",
    SFX_VOLUME: "_playerOptions._sfxVolume",
    REDUCE_DEBRIS: "_playerOptions._reduceDebris",
    NO_HUD: "_playerOptions._noTextsAndHuds",
    HIDE_MISSES: "_playerOptions._noFailEffects",
    ADVANCED_HUD: "_playerOptions._advancedHud",
    AUTO_RESTART: "_playerOptions._autoRestart",
    TRAIL_INTENSITY: "_playerOptions._saberTrailIntensity",
    NJS: "_playerOptions._noteJumpStartBeatOffset",
    HIDE_SPAWN_LIGHT: "_playerOptions._hideNoteSpawnEffect",
    ADAPTIVE_SFX: "_playerOptions._adaptiveSfx",
    LIGHTS: {
        VALUE: "_playerOptions._environmentEffectsFilterDefaultPreset",
        ALL_EFFECTS: "AllEffects",
        NO_FLICKERING: "Strobefilter",
        NO_EFFECTS: "NoEffects"
    },
    LIGHTS_EXPLUS: {
        VALUE: "_playerOptions._environmentEffectsFilterExpertPlusPreset",
        ALL_EFFECTS: "AllEffects",
        NO_FLICKERING: "Strobefilter",
        NO_EFFECTS: "NoEffects"
    },
    ENERGY_TYPE: {
        VALUE: "_modifiers._energyType",
        BAR: "Bar",
        BATTERY: "Battery"
    },
    NO_FAIL: "_modifiers._noFailOn0Energy",
    INSTA_FAIL: "_modifiers._instaFail",
    SABER_CLASH_FAIL: "_modifiers._failOnSaberClash",
    ENABLED_OBSTACLES: {
        VALUE: "_modifiers._enabledObstacleType",
        ALL: "All",
        FULL_ONLY: "FullHeightOnly",
        NONE: "NoObstacles"
    },
    FAST_NOTES: "_modifiers._fastNotes",
    STRICT_ANGLES: "_modifiers._strictAngles",
    DISAPPEARING_ARROWS: "_modifiers._disappearingArrows",
    GHOST_NOTES: "_modifiers._ghostNotes",
    NO_BOMBS: "_modifiers._noBombs",
    SONG_SPEED: {
        VALUE: "_modifiers._songSpeed",
        NORMAL: "Normal",
        FASTER: "Faster",
        SLOWER: "Slower",
        SUPER_FAST: "SuperFast"
    },
    NO_ARROWS: "_modifiers._noArrows",
    PRO_MODE: "_modifiers._proMode",
    ZEN_MODE: "_modifiers._zenMode",
    SMALL_CUBES: "_modifiers._smallCubes",
    OVERRIDE_ENVIRONMENTS: "_environments._overrideEnvironments",
    OVERRIDE_DEFAULT_COLORS: "_colors._overrideDefaultColors",
    MIRROR_QUALITY: {
        VALUE: "_graphics._mirrorGraphicsSettings",
        OFF: 0,
        LOW: 1,
        MEDIUM: 2,
        HIGH: 3
    },
    BLOOM: {
        VALUE: "_graphics._mainEffectGraphicsSettings",
        ON: 1,
        OFF: 0
    },
    SMOKE: {
        VALUE: "_graphics._smokeGraphicsSettings",
        ON: 1,
        OFF: 0
    },
    BURN_MARKS: "_graphics._burnMarkTrailsEnabled",
    SCREEN_DISTORTION: "_graphics._screenDisplacementEffectsEnabled",
    MAX_SHOCKWAVE_PARTICLES: "_graphics._maxShockwaveParticles",
    DISABLE_CHROMA: "_chroma._disableChromaEvents",
    DISABLE_ENVIRONMENT_ENHANCEMENTS: "_chroma._disableEnvironmentEnhancements",
    ZEN_MODE_WALLS: "_chroma._forceZenModeWalls"
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

export enum EVENT {
    // Type
    BACK_LASERS = 0,
    RING_LIGHTS = 1,
    LEFT_LASERS = 2,
    RIGHT_LASERS = 3,
    CENTER_LASERS = 4,
    BOOST = 5,
    LEFT_EXTRA = 6,
    RIGHT_EXTRA = 7,
    RING_SPIN = 8,
    RING_ZOOM = 9,
    BILLIE_LEFT = 10,
    BILLIE_RIGHT = 11,
    LEFT_SPEED = 12,
    RIGHT_SPEED = 13,
    EARLY_ROTATION = 14,
    LATE_ROTATION = 15,
    LOWER_HYDRAULICS = 16,
    RAISE_HYDRAULICS = 17,

    // Regular Action
    OFF = 0,
    BLUE_ON = 1,
    BLUE_FLASH = 2,
    BLUE_FADE = 3,
    BLUE_IN = 4,
    RED_ON = 5,
    RED_FLASH = 6,
    RED_FADE = 7,
    RED_IN = 8,

    // Boost Action
    BOOST_OFF = 0,
    BOOST_ON = 1,

    // Interscope Action
    NO_HYDRAULICS = 0,
    ALL_CARS = 1,
    LEFT_CARS = 2,
    RIGHT_CARS = 3,
    FRONT_CARS = 4,
    FRONT_MIDDLE_CARS = 5,
    BACK_MIDDLE_CARS = 6,
    BACK_CARS = 7,

    // Rotation Action
    CCW_60 = 0,
    CCW_45 = 1,
    CCW_30 = 2,
    CCW_15 = 3,
    CW_15 = 4,
    CW_30 = 5,
    CW_45 = 6,
    CW_60 = 7
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
            ID: new Regex().start().add("PillarPair").seperate().add("PillarL").seperate().add("Pillar").end().string,
            SCALE: <Vec3>[10, 10 * (1 / 0.032), 10],
            ANCHOR: <Vec3>[0, -0.5, 0]
        },
        SOLID_LASER: {
            ID: new Regex().add("SmallPillarPair").seperate().add("PillarL").seperate().add("LaserL").end().string,
            SCALE: <Vec3>[1 / 3.5, 7000, 1 / 3.5],
            ANCHOR: <Vec3>[0, 0.5, 0]
        },
        LOW_CLOUDS: {
            ID: "LowCloudsGenerator$",
            SCALE: <Vec3>[425, 40, 425],
            ANCHOR: <Vec3>[0, -0.25, 0]
        }
    },
    GAGA: {
        CUBE: {
            ID: "BackCube$",
            SCALE: <Vec3>[16, 7 / 10, 14 / 10],
            ANCHOR: <Vec3>[0, -0.5, -0.5]
        },
        SECOND_AURORA: {
            ID: new Regex().add("Aurora").seperate().add("AuroraSecondary").end().string,
            SCALE: <Vec3>[900, 200, 1000],
            ANCHOR: <Vec3>[0, -0.25, 0]
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

/*
ScuffedWalls Script:
0:Run
  Script:script.ts
  RunBefore: false
  RefreshOnSave: true`

ScuffedWalls Model:
0:ModelToWall
  Path:model.dae
  Track:model
  Type:3
  */