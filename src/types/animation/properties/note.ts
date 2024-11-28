import { ObjectAnimationData } from './object.ts'
import { RuntimeDifficultyPointsLinear } from '../points/runtime/linear.ts'
import {DefinitePositionData} from "./assign_path.ts";

export type NoteAnimationData = ObjectAnimationData & {
    /** Controls the dissolve shader on the arrow.
     * 0 means invisible, 1 means visible.
     */
    dissolveArrow?: RuntimeDifficultyPointsLinear
}

/** Animation properties for note objects. */
export type NotePathAnimationData = NoteAnimationData & DefinitePositionData