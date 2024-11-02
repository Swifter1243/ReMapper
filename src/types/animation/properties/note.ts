import { ObjectAnimationData } from './object.ts'
import { RuntimeDifficultyPointsLinear } from '../points/runtime/linear.ts'

/** Animation properties for note objects. */
export interface NoteAnimationData extends ObjectAnimationData {
    /** Controls the dissolve shader on the arrow.
     * 0 means invisible, 1 means visible.
     */
    dissolveArrow?: RuntimeDifficultyPointsLinear
}
