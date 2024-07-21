import {RawKeyframesVec3} from './animation.ts'
import {RawGeometryMaterial} from './environment.ts'

// TODO: Stink
import type * as CustomEventInternals from '../internals/beatmap/object/custom_event/mod.ts'
import type * as EnvironmentInternals from '../internals/beatmap/object/environment/environment.ts'

import {FILEPATH} from './beatmap.ts'
import {ColorVec, Transform, Vec3} from './data.ts'
import {DeepReadonly} from './util.ts'
import {Geometry} from "../internals/beatmap/object/environment/geometry.ts";

/** Objects that are allowed to be spawned with a ModelScene. */
export type GroupObjectTypes =
    | EnvironmentInternals.Environment
    | Geometry

/** Allowed options for providing data to a ModelScene. */
export type ObjectInput = FILEPATH | ReadonlyModel

/** Input options for the "static" method in a ModelScene. */
export type StaticOptions = {
    /** The input of objects. Can be an array of objects or a path to a model. */
    input: ObjectInput
    /** Function to run on objects when they're being cached. Only works for path input. */
    onCache?: (objs: ModelObject[]) => void
    /** Function to run on objects about to be processed.
     Be careful when mutating these, as cached objects are stored across script executions. */
    objects?: (arr: ReadonlyModel) => void
    /** Recache the objects when information in this array changes. Only works for path input. */
    processing?: unknown
    /** Transform the objects. */
    transform?: Transform & {
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

/** A scene switch used in a ModelScene */
export type SceneSwitch = {
    /** Input for the model data. */
    model: AnimatedObjectInput,
    /** When the switch happens. */
    beat: number,
    /** How long the animation in the input objects happen. */
    animationDuration?: number,
    /** The offset added to `beat` which defines when the animation in the input objects happen. */
    animationOffset?: number,
    /** Runs on each light_event that moves objects in this switch. */
    forEvent?: ((event: CustomEventInternals.AnimateTrack, objects: number) => void) 
}


/** A group in a ModelScene.
 * When the model data is passed, if any model objects have a track that match the name of this group, an animation light_event will be placed for them.
 */
export type ModelGroup = {
    /** What object to spawn for each object in this group.
     * If undefined, an existing object with the same track is assumed to exist and will be animated.
     */
    object?: GroupObjectTypes
    /** What is considered to be the "center point" of the objects in this group. */
    anchor?: Vec3
    /** How objects should be scaled in this group. */
    scale?: Vec3
    /** The offset rotation for objects in this group. */
    rotation?: Vec3
    /** Whether remaining pooled objects in a switch should be moved out of the way.
     * For example, if switch `A` has 40 objects, and switch `B` has 20, should the remaining 20 be moved out of the way?
     */
    disappearWhenAbsent?: boolean
    /** The material that will be applied to objects in this group, if `object` is a geometry object.
     * If undefined, each geometry object will have it's own material. This means each object will be colored from the `color` objects in the input model data.
     * Though, beware of the fact each geometry object will create it's own draw call, which is bad for performance. If you want colored objects with lots of common colors, making multiple groups is advised.
     */
    defaultMaterial?: RawGeometryMaterial
}

/** The data type used by ModelScene to define model objects. */
export interface ModelObject {
    position: RawKeyframesVec3
    rotation: RawKeyframesVec3
    scale: RawKeyframesVec3
    color?: ColorVec
    group?: string
}

/** The data type used by the Text class to define objects in the text model.
 * Basically `ModelObject` except it can't be animated.
 */
export type TextObject = {
    position: Vec3
    rotation: Vec3
    scale: Vec3
    color?: ColorVec
    group?: string
}

/** 
 * The data reported for a given group in `ModelScene` after the model is instantiated.
 */
export type SceneObjectInfo = {
    /** The maximum number of objects in this group that showed up at once during a switch. */
    max: number
    /** The number of objects that showed up in a given switch. */
    perSwitch: Record<number, number>
    /** If defined, this is the very first transform for all objects in this group. */
    initialPos?: ModelObject[]
}

/** A readonly array of `ModelObject`s, representing an imported model which shouldn't be edited. */
export type ReadonlyModel = DeepReadonly<ModelObject[]>
/** A readonly array of `TextObject`s, representing an imported text model which shouldn't be edited. */
export type ReadonlyText = DeepReadonly<TextObject[]>