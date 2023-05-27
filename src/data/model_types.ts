import {ColorType, FILEPATH, RawKeyframesVec3, Transform, Vec3} from "./types.ts";
import {RawGeometryMaterial} from "./environment_types.ts";

// TODO: Stink
import type * as CustomEventInternals from "../internals/custom_event.ts";
import type {Environment, Geometry} from "../beatmap/environment.ts";

/** Objects that are allowed to be spawned with a ModelScene. */
export type GroupObjectTypes = Environment | Geometry
/** Allowed options for providing data to a ModelScene. */
export type ObjectInput = FILEPATH | ModelObject[]
/** Input options for the "static" method in a ModelScene. */
export type StaticOptions = {
    /** The input of objects. Can be an array of objects or a path to a model. */
    input: ObjectInput
    /** Function to run on objects when they're being cached. Only works for path input. */
    onCache?: (objs: ModelObject[]) => void
    /** Function to run on objects about to be processed.
     Be careful when mutating these, as cached objects are stored across script executions. */
    objects?: (arr: ModelObject[]) => void
    /** Recache the objects when information in this array changes. Only works for path input. */
    processing?: any
    /** Transform the objects. */
    transform: Transform & {
        anchor?: Vec3
    }
}
/** Input options for the "animate" method in a ModelScene. */
export type AnimatedOptions = StaticOptions & {
    /** Whether or not to re-bake the object animations if you input an array of objects.
     On by default, I would recommend not touching this unless you know what you're doing. */
    bake?: boolean
    /** If this input is animated, use the only first frame. */
    static?: boolean
    /** Whether to loop the animation. */
    loop?: number
    /** Whether to mirror the animation. */
    mirror?: boolean
}
/** Allowed inputs for the "static" method in ModelScene. */
export type StaticObjectInput = ObjectInput | StaticOptions
/** Allowed inputs for the "animate" method in ModelScene. */
export type AnimatedObjectInput = ObjectInput | AnimatedOptions
export type ModelGroup = {
    object?: GroupObjectTypes
    anchor?: Vec3
    scale?: Vec3
    rotation?: Vec3
    disappearWhenAbsent?: boolean
    defaultMaterial?: RawGeometryMaterial
}

/** The data type used by ModelScene to define objects. */
export interface ModelObject {
    pos: RawKeyframesVec3
    rot: RawKeyframesVec3
    scale: RawKeyframesVec3
    color?: ColorType
    track?: string
}

export type Duration = number | undefined
export type AnimationStart = number | undefined
export type ForEvent =
    | ((event: CustomEventInternals.AnimateTrack, objects: number) => void)
    | undefined