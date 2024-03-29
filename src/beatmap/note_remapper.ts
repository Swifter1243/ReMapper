import { AnyNote } from '../general.ts'
import { NoteRemapperInternals } from '../internals/mod.ts'

/** Tool to chain processes and conditions on notes in the map. Uses a builder pattern. */
export const noteRemapper = () => new AnyNoteRemapper()

class AnyNoteRemapper
    extends NoteRemapperInternals.BaseNoteRemapper<AnyNote> {
    /** Filter out note types.  */
    setTypeFilter<T extends NoteRemapperInternals.NoteType[]>(filter: T) {
        const newTypes = new Set<NoteRemapperInternals.NoteType>(filter)
        
        type union =
            NoteRemapperInternals.NoteTypeLookup[(typeof filter)[number]]
        
        const newClass = new NoteRemapperInternals.BaseNoteRemapper<union>()
        newClass.conditions = this
            .conditions as NoteRemapperInternals.Condition<union>[]
        newClass.processes = this.processes as NoteRemapperInternals.Process<
            union
        >[]
        newClass.typeFilter = newTypes

        return newClass
    }

    onlyColorNotes = () => this.setTypeFilter(['Note'])
    onlyBombs = () => this.setTypeFilter(['Bomb'])
    onlyChains = () => this.setTypeFilter(['Chain'])
    onlyArcs = () => this.setTypeFilter(['Arc'])
}
