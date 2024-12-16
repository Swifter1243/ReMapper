import { FILEPATH } from '../beatmap/file.ts'
import { RuntimeDifficultyPointsLinear } from '../animation/points/runtime/linear.ts'
import { RuntimeDifficultyPointsVec4 } from '../animation/points/runtime/vec4.ts'

import {Property} from "./property.ts";
import {ColorVec} from "../math/vector.ts";

/** Types allowed for material properties. */
export type MATERIAL_PROP_TYPE =
    | 'Texture'
    | 'Float'
    | 'Color'
    | 'Vector'
    | 'Keyword'

/** A property for a material. */
export type MaterialProperty = Property<
    MATERIAL_PROP_TYPE,
    {
        Color: ColorVec | RuntimeDifficultyPointsVec4,
        Float: number | RuntimeDifficultyPointsLinear,
        Keyword: boolean,
        Texture: FILEPATH,
        Vector: RuntimeDifficultyPointsVec4
    }
>