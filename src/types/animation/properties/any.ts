import {AnimateTrackAnimationData} from "./animate_track.ts";
import {AssignPathAnimationData} from "./assign_path.ts";

/** All animatable properties for V3. */
export type AnyAnimationData =
    AnimateTrackAnimationData &
    AssignPathAnimationData
