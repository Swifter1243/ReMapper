import {BaseNoteIterator} from "./base_note_iterator.ts";
import {NoteCondition, NoteProcess} from "../../types/iterator.ts";
import {AnyNote, AnyNoteLiteral, AnyNoteLiteralMap} from "../../types/beatmap/object/note.ts";

export class AnyNoteIterator extends BaseNoteIterator<AnyNote> {
    /** Filter out note types.  */
    setTypeFilter<T extends AnyNoteLiteral[]>(filter: T) {
        const newTypes = new Set<AnyNoteLiteral>(filter)
        
        type union = AnyNoteLiteralMap[(typeof filter)[number]]
        
        const newClass = new BaseNoteIterator<union>()
        newClass.conditions = this.conditions as NoteCondition<union>[]
        newClass.processes = this.processes as NoteProcess<union>[]
        newClass.typeFilter = newTypes

        return newClass
    }

    onlyColorNotes() {
        return this.setTypeFilter(['ColorNote'])
    }
    onlyBombs() {
        return this.setTypeFilter(['Bomb'])
    }
    onlyChains() {
        return this.setTypeFilter(['Chain'])
    }
    onlyArcs() {
        return this.setTypeFilter(['Arc'])
    }
}
