import { RuntimeDifficultyPointsLinear } from '../animation/points/runtime/linear.ts'

import {Property} from "./property.ts";

/** Types allowed for animator properties. */
export type ANIMATOR_PROP_TYPE =
    | 'Bool'
    | 'Float'
    | 'Trigger'

/** A property for an animator. */
export type AnimatorProperty = Property<
    ANIMATOR_PROP_TYPE,
    {
        Float: number | RuntimeDifficultyPointsLinear,
        Bool: boolean | RuntimeDifficultyPointsLinear,
        Trigger: boolean
    }
>
