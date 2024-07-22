import { ObjectAnimationData } from './object.ts'
import { NoteAnimationData } from './note.ts'

export type GameplayObjectAnimationData =
    | ObjectAnimationData
    | NoteAnimationData
