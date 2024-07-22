import { ModelObject, ReadonlyModel } from '../object.ts'
import { Transform } from '../../math/transform.ts'
import { Vec3 } from '../../math/vector.ts'

import {ObjectInput} from "./input.ts";

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
