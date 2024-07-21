import {AnyNote} from '../../general.ts'
import {NoteRemapperInternals} from '../../internals/mod.ts'
import {BaseNoteIterator, NoteCondition, NoteProcess} from "./base_note_iterator.ts";

export class AnyNoteIterator extends BaseNoteIterator<AnyNote> {
    /** Filter out note types.  */
    setTypeFilter<T extends NoteRemapperInternals.NoteType[]>(filter: T) {
        const newTypes = new Set<NoteRemapperInternals.NoteType>(filter)
        
        type union = NoteRemapperInternals.NoteTypeLookup[(typeof filter)[number]]
        
        const newClass = new BaseNoteIterator<union>()
        newClass.conditions = this.conditions as NoteCondition<union>[]
        newClass.processes = this.processes as NoteProcess<union>[]
        newClass.typeFilter = newTypes

        return newClass
    }

    onlyColorNotes = () => this.setTypeFilter(['ColorNote'])
    onlyBombs = () => this.setTypeFilter(['Bomb'])
    onlyChains = () => this.setTypeFilter(['Chain'])
    onlyArcs = () => this.setTypeFilter(['Arc'])
}
