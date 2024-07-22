import { RuntimePointDefinitionLinear } from '../animation/keyframe/runtime/linear.ts'

import {Property} from "./property.ts";

/** Types allowed for animator properties. */
export type ANIMATOR_PROP_TYPE =
    | 'Bool'
    | 'Float'
    | 'Trigger'

/** A valid value for animator properties. */
export type AnimatorPropertyValue = boolean | RuntimePointDefinitionLinear | number

/** A property for an animator. */
export type AnimatorProperty = Property<
    ANIMATOR_PROP_TYPE,
    AnimatorPropertyValue
>
