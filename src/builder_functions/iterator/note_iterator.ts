import { AnyNoteIterator } from '../../utils/iterator/note_iterator.ts'

/** Tool to chain processes and conditions on notes in the map. Uses a builder pattern. */
export function noteIterator() {
    return new AnyNoteIterator()
}