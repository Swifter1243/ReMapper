import { Difficulty } from "./beatmap.ts"
import { ColorType, Vec3 } from "./general.ts"
import { Regex } from "./regex.ts"

// TODO: If possible, try to figure out a way to default to a string with no extension or path
export type FILENAME<T extends string = string> = T | `${T}.${string}`;
export type FILEPATH<T extends string = string> = FILENAME<T> | `${string}/${FILENAME<T>}`;

type DiffNameBase<T extends string> = `Easy${T}` | `Normal${T}` | `Hard${T}` | `Expert${T}` | `ExpertPlus${T}`

/** All difficulty names. */
export type DIFFS =
    DiffNameBase<"Standard"> |
    DiffNameBase<"NoArrows"> |
    DiffNameBase<"OneSaber"> |
    DiffNameBase<"360Degree"> |
    DiffNameBase<"90Degree"> |
    DiffNameBase<"Lightshow"> |
    DiffNameBase<"Lawless">

/** All mods to require/suggest. */
export type MODS =
    "Chroma" |
    "Noodle Extensions" |
    "Vivify"

/** All environment names. */
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
    "TriangleEnvironment" |
    "WeaveEnvironment" |
    "PyroEnvironment" |
    "TheSecondEnvironment" |
    "EDMEnvironment"


type EaseBase<T extends string> = `easeIn${T}` | `easeOut${T}` | `easeInOut${T}`;
/** All easings. */
export type EASE =
    "easeLinear" |
    "easeStep" |
    EaseBase<"Quad"> |
    EaseBase<"Cubic"> |
    EaseBase<"Quart"> |
    EaseBase<"Quint"> |
    EaseBase<"Sine"> |
    EaseBase<"Expo"> |
    EaseBase<"Circ"> |
    EaseBase<"Elastic"> |
    EaseBase<"Back"> |
    EaseBase<"Bounce">

/** All splines. */
export type SPLINE =
    "splineCatmullRom"

/** Handler to alias settings. */
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

/** Setting presets. You would set these equal to the "rawSettings" property on a difficulty. */
export const PRESET = {
    /** Settings which are good for maps that need chroma and noodle. */
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
    /** Settings which are good for maps that have chroma environment stuff. */
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

/** The type for a note. */
export enum NOTETYPE {
    RED = 0,
    BLUE = 1
}

/** The mid anchor mode for arcs. */
export enum ANCHORMODE {
    STRAIGHT = 0,
    CW = 1,
    CCW = 2
}

/** The distribution types for V3 lights. */
export enum DISTTYPE {
    WAVE = 1,
    STEP
}

/** The filter types for V3 lights. */
export enum FILTERTYPE {
    SECTIONS = 1,
    STEPANDOFFSET
}

/** The transitions for V3 lights. */
export enum LIGHTTRANS {
    INSTANT,
    TRANSITION,
    EXTEND
}

/** The transitions for V3 light rotations. */
export enum ROTTRANS {
    TRANSITION,
    EXTEND
}

/** The colors for V3 lights. */
export enum LIGHTCOL {
    RED,
    BLUE,
    WHITE
}

/** The rotation axis for V3 light rotations. */
export enum AXIS {
    X,
    Y
}

/** The easings for V3 light rotations. */
export enum ROTEASE {
    NONE = -1,
    LINEAR,
    EASEINQUAD,
    EASEOUTQUAD,
    EASEINOUTQUAD
}

/** The direction of rotation for V3 light rotations. */
export enum ROTDIR {
    AUTOMATIC,
    CLOCKWISE,
    COUNTERCLOCKWISE
}

/** Note cut directions. */
export enum CUT {
    UP,
    DOWN,
    LEFT,
    RIGHT,
    UP_LEFT,
    UP_RIGHT,
    DOWN_LEFT,
    DOWN_RIGHT,
    DOT
}

/** Basic event groups/types. */
export enum EVENTGROUP {
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
    LEFT_ROTATING,
    RIGHT_ROTATING,
    EARLY_ROTATION,
    LATE_ROTATION,
    LOWER_HYDRAULICS,
    RAISE_HYDRAULICS,
    GAGA_LEFT,
    GAGA_RIGHT
}

/** Basic lighting event actions. */
export enum EVENTACTION {
    OFF,
    BLUE_ON,
    BLUE_FLASH,
    BLUE_FADE,
    BLUE_IN,
    RED_ON,
    RED_FLASH,
    RED_FADE,
    RED_IN
}

/** Interscope car groups. */
export enum INTERSCOPEGROUP {
    NO_HYDRAULICS,
    ALL_CARS,
    LEFT_CARS,
    RIGHT_CARS,
    FRONT_CARS,
    FRONT_MIDDLE_CARS,
    BACK_MIDDLE_CARS,
    BACK_CARS
}

/** Rotation basic event values. */
export enum ROTATIONACTION {
    CCW_60,
    CCW_45,
    CCW_30,
    CCW_15,
    CW_15,
    CW_30,
    CW_45,
    CW_60
}

/** Animation properties. */
export type ANIM =
    "position" |
    "offsetPosition" |
    "definitePosition" |
    "localPosition" |
    "rotation" |
    "offsetWorldRotation" |
    "localRotation" |
    "scale" |
    "dissolve" |
    "dissolveArrow" |
    "color" |
    "uninteractable" |
    "attenuation" |
    "offset" |
    "startY" |
    "height" |
    "time"

/**
 * Known transforms for objects with ModelScene.
 * ModelScene is NOT limited to these!
 * You can figure out the transforms for ANY object.
 */
export const ENV = {
    BTS: {
        PILLAR: {
            ID: new Regex().start().add("PillarPair").separate().add("PillarL").separate().add("Pillar").end(),
            TRANSFORM: <Vec3[]>[
                [0.285714, 0.008868, 0.285714], //? SCALE
                [0, 0.4999, 0] //? ANCHOR
            ]
        },
        SOLID_LASER: {
            ID: new Regex("SmallPillarPair").separate().add("PillarL").separate().add("LaserL").end(),
            TRANSFORM: <Vec3[]>[
                [10, 1 / 2500, 10], //? SCALE
                [0, -0.5, 0] //? ANCHOR
            ]
        },
        BLOOM_LIGHT: {
            ID: new Regex("Environment").separate().add("LaserR").end(),
            TRANSFORM: <Vec3[]>[
                [1, 0.00025, 1], //? SCALE
                [0, -0.25, 0] //? ANCHOR
            ]
        },
        LOW_CLOUDS: {
            ID: "LowCloudsGenerator$",
            TRANSFORM: <Vec3[]>[
                [0.0064, 0.06, 0.0064], //? SCALE
                [0, 0.22, 0] //? ANCHOR
            ]
        },
        HIGH_CLOUDS: {
            ID: "HighCloudsGenerator$",
            TRANSFORM: <Vec3[]>[
                [0.0025, 0.0425, 0.0025], //? SCALE
                [0, -0.218, 0] //? ANCHOR
            ]
        }
    },
    GAGA: {
        CUBE: {
            ID: "BackCube$",
            TRANSFORM: <Vec3[]>[
                [1 / 5.5, 4, 2], //? SCALE
                [0, 0.5, 0.5] //? ANCHOR
            ]
        },
        SECOND_AURORA: {
            ID: new Regex("Aurora").separate().add("AuroraSecondary").end(),
            TRANSFORM: <Vec3[]>[
                [0.0025, 0.02, 0.012], //? SCALE
                [0, 0.6, 0.05] //? ANCHOR
            ]
        }
    },
    BILLIE: {
        CUBE: {
            ID: "LeftFarRail1$",
            TRANSFORM: <Vec3[]>[
                [10, 10, 0.02306], //? SCALE
                [0, 0, -0.4974] //? ANCHOR
            ]
        }
    },
    GREEN_DAY: {
        SOLID_LASER: {
            ID: "GlowLineR$",
            TRANSFORM: <Vec3[]>[
                [50, 0.002, 50], //? SCALE
            ]
        },
        BLOOM_LASER: {
            ID: "FrontLight$",
            TRANSFORM: <Vec3[]>[
                [1, 0.001, 1], //? SCALE
                [0, -0.5, 0] //? ANCHOR
            ]
        }
    },
    UNIVERSAL: {
        MIRROR: { // Mirror does not work with the "Spooky" environment, but it does work with everything else!
            ID: new Regex("PlayersPlace").separate().add("Mirror").end(),
            TRANSFORM: <Vec3[]>[
                [1 / 3, 0, 0.5], //? SCALE
            ]
        }
    }
}

export type CUSTOM_EVENT_TYPE =
    "AnimateTrack" |
    "AssignPathAnimation" |
    "AssignTrackParent" |
    "AssignPlayerToTrack" |
    "AnimateComponent" |
    "SetMaterialProperty" |
    "SetGlobalProperty" |
    "Blit" |
    "DeclareCullingTexture" |
    "DeclareRenderTexture" |
    "DestroyTexture" |
    "InstantiatePrefab" |
    "DestroyPrefab" |
    "SetAnimatorProperty" |
    "SetCameraProperty" |
    "AssignTrackPrefab" |
    "SetRenderSetting"

/** Color formats. */
export type COLOR =
    "RGB" |
    "HSV"

/** Lookup methods for environment objects. */
export type LOOKUP =
    "Contains" |
    "Regex" |
    "Exact" |
    "StartsWith" |
    "EndsWith"

/** Geometry shape types. */
export type GEO_TYPE =
    "Sphere" |
    "Capsule" |
    "Cylinder" |
    "Cube" |
    "Plane" |
    "Quad" |
    "Triangle"

/** Shaders available for geometry materials. */
export type GEO_SHADER =
    "Standard" |
    "OpaqueLight" |
    "TransparentLight" |
    "BaseWater" |
    "BillieWater" |
    "BTSPillar" |
    "InterscopeConcrete" |
    "InterscopeCar" |
    "Obstacle" |
    "WaterfallMirror"

/** Types allowed for material properties. */
export type MATERIAL_PROP_TYPE =
    "Texture" |
    "Float" |
    "Color"

/** Types allowed for animator properties. */
export type ANIMATOR_PROP_TYPE =
    "Bool" |
    "Float" |
    "Trigger"

/** Color format types for render textures. */
export type RENDER_TEX =
    "ARGB32" |
    "Depth" |
    "ARGBHalf" |
    "Shadowmap" |
    "RGB565" |
    "ARGB4444" |
    "ARGB1555" |
    "Default" |
    "ARGB2101010" |
    "DefaultHDR" |
    "ARGB64" |
    "ARGBFloat" |
    "RGFloat" |
    "RGHalf" |
    "RFloat" |
    "RHalf" |
    "R8" |
    "ARGBInt" |
    "RGInt" |
    "RInt" |
    "BGRA32" |
    "RGB111110Float" |
    "RG32" |
    "RGBAUShort" |
    "RG16" |
    "BGRA101010_XR" |
    "BGR101010_XR" |
    "R16"

/** Filter modes for textures. */
export type TEX_FILTER =
    "Point" |
    "Bilinear" |
    "Trilinear"

export enum AMBIENT_MODE {
    Skybox = 0,
    Trilight = 1,
    Flat = 3,
    Custom = 4
}

export enum DEFAULT_REFLECTION_MODE {
    Skybox,
    Custom
}

export enum FOG_MODE {
    Linear = 1,
    Exponential,
    ExponentialSquared
}

export type RENDER_SETTING = {
    "ambientEquatorColor": ColorType,
    "ambientGroundColor": ColorType,
    "ambientIntensity": number,
    "ambientLight": ColorType,
    "ambientMode": AMBIENT_MODE,
    "ambientSkyColor": ColorType,
    "defaultReflectionMode": DEFAULT_REFLECTION_MODE,
    "flareFadeSpeed": number,
    "flareStrength": number,
    "fog": boolean,
    "fogColor": ColorType,
    "fogDensity": number,
    "fogEndDistance": number,
    "fogMode": FOG_MODE,
    "haloStrength": number,
    "reflectionBounces": number,
    "reflectionIntensity": number,
    "subtractiveShadowColor": ColorType
}