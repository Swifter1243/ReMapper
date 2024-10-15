import { FILEPATH } from '../beatmap/file.ts'
import { RuntimePointDefinitionLinear } from '../animation/keyframe/runtime/linear.ts'
import { RuntimePointDefinitionVec4 } from '../animation/keyframe/runtime/vec4.ts'

import {Property} from "./property.ts";
import { Vec4 } from '../math/vector.ts'

/** Types allowed for material properties. */
export type MATERIAL_PROP_TYPE =
    | 'Texture'
    | 'Float'
    | 'Color'
    | 'Vector'

/** A valid value for material properties. */
export type MaterialPropertyValue =
    | FILEPATH
    | number
    | RuntimePointDefinitionLinear
    | Vec4
    | RuntimePointDefinitionVec4

/** A property for a material. */
export type MaterialProperty = Property<
    MATERIAL_PROP_TYPE,
    MaterialPropertyValue
>
