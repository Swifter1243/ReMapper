import { RawKeyframesVec3 } from '../animation/keyframe/vec3.ts'
import { ColorVec } from '../math/vector.ts'

import {DeepReadonly} from "../util/mutability.ts";

/** The properties type used by ModelScene to define model objects. */
export interface ModelObject {
    position: RawKeyframesVec3
    rotation: RawKeyframesVec3
    scale: RawKeyframesVec3
    color?: ColorVec
    group?: string
}

/** A readonly array of `ModelObject`s, representing an imported model which shouldn't be edited. */
export type ReadonlyModel = DeepReadonly<ModelObject[]>
