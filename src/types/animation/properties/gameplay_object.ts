import { ObjectAnimationData } from './object.ts'
import { NoteAnimationData } from './note.ts'

/** Animation properties for gameplay objects */
export type GameplayObjectAnimationData =
    | ObjectAnimationData
    | NoteAnimationData
