import { ObjectAnimationData } from './object.ts'
import { RuntimePointDefinitionLinear } from '../keyframe/runtime/linear.ts'

/** Animation properties for note objects. */
export interface NoteAnimationData extends ObjectAnimationData {
    /** Controls the dissolve shader on the arrow.
     * 0 means invisible, 1 means visible.
     */
    dissolveArrow?: RuntimePointDefinitionLinear
}
