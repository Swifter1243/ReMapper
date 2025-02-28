import { ModelObject, ReadonlyModel } from '../object.ts'

import {ModelInput} from "./input.ts";

/** Input options for the "static" method in a ModelScene. */
export type StaticOptions = {
    /** The input of objects. Can be an array of objects or a path to a model. */
    input: ModelInput
    /** Function to run on model objects when they're being cached. Only works for path input. */
    onCache?: (objs: ModelObject[]) => void
    /** Function to run on model objects that are about to be instantiated. */
    objects?: (arr: ReadonlyModel) => void
    /** Recache the model when this data changes. */
    hash?: unknown
}

/** Input options for the "animate" method in a ModelScene. */
export type AnimatedOptions = StaticOptions & {
    /** Whether or not to re-bake the object animations if you input an array of objects.
     On by default, I would recommend not touching this unless you know what you're doing. */
    bake?: boolean
    /** If this input is animated, use the only first frame. */
    static?: boolean
    /** Whether to mirror the animation. */
    mirrorAnimation?: boolean
    /** Whether to reverse the animation. */
    reverseAnimation?: boolean
}
