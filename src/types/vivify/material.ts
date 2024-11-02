import { FILEPATH } from '../beatmap/file.ts'
import { RuntimeDifficultyPointsLinear } from '../animation/points/runtime/linear.ts'
import { RuntimeDifficultyPointsVec4 } from '../animation/points/runtime/vec4.ts'

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
    | RuntimeDifficultyPointsLinear
    | Vec4
    | RuntimeDifficultyPointsVec4

/** A property for a material. */
export type MaterialProperty = Property<
    MATERIAL_PROP_TYPE,
    MaterialPropertyValue
>
