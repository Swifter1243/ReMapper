import { RuntimePointDefinitionLinear } from '../keyframe/runtime/linear.ts'
import {EnvironmentAnimationData} from "./environment.ts";
import {GameplayObjectAnimationData} from "./gameplay_object.ts";

/** All animatable properties for V3. */
export type AnyAnimationData =
    GameplayObjectAnimationData &
    EnvironmentAnimationData &
    {
        /** "time" is relatively advanced so make sure to have a solid understanding of Heck animations before delving into time. time can only be used in AnimateTrack as it lets you control what point in the note's "lifespan" it is at a given time. */
        _time?: RuntimePointDefinitionLinear
    }
