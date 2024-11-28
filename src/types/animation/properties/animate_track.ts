import {EnvironmentAnimationData} from "./environment.ts";
import {RuntimeDifficultyPointsLinear} from "../points/runtime/linear.ts";
import {NoteAnimationData} from "./note.ts";
import {ObjectAnimationData} from "./object.ts";

export type AnimateTrackAnimationData =
    ObjectAnimationData &
    NoteAnimationData &
    EnvironmentAnimationData &
    {
        /** "time" is relatively advanced so make sure to have a solid understanding of Heck animations before delving into time. time can only be used in AnimateTrack as it lets you control what point in the note's "lifespan" it is at a given time. */
        time?: RuntimeDifficultyPointsLinear
    }