import { getActiveDiff } from '../data/beatmap_handler.ts'
import { AnyNote } from '../general.ts'
import { NoteCut, NoteInternals, TrackValue } from '../mod.ts'

export type Condition<T extends AnyNote> = (event: T) => boolean
export type Process<T extends AnyNote> = (event: T) => void

export type NoteTypeLookup = {
    'Note': NoteInternals.Note
    'Bomb': NoteInternals.Bomb
    'Arc': NoteInternals.Arc
    'Chain': NoteInternals.Chain
}
export type NoteType = keyof NoteTypeLookup

type CutName =
    | 'dot'
    | 'down'
    | 'down_left'
    | 'down_right'
    | 'left'
    | 'right'
    | 'up'
    | 'up_left'
    | 'up_right'

const directionsLiteral: Record<NoteCut, CutName> = {
    [NoteCut.DOT]: 'dot',
    [NoteCut.DOWN]: 'down',
    [NoteCut.DOWN_LEFT]: 'down_left',
    [NoteCut.DOWN_RIGHT]: 'down_right',
    [NoteCut.LEFT]: 'left',
    [NoteCut.RIGHT]: 'right',
    [NoteCut.UP]: 'up',
    [NoteCut.UP_LEFT]: 'up_left',
    [NoteCut.UP_RIGHT]: 'up_right',
}

export class BaseNoteRemapper<T extends AnyNote> {
    /** Conditions that each note needs to pass. */
    conditions: Condition<T>[] = []
    /** Function to run on each note. */
    processes: Process<T>[] = []
    /** The note types to run on. */
    typeFilter = new Set<NoteType>(['Note', 'Bomb', 'Arc', 'Chain'])

    /**
     * Add a condition that notes must pass.
     * @param condition Input condition.
     */
    addCondition(condition: Condition<T>) {
        this.conditions.push(condition)
        return this
    }

    /**
     * Add a function to edit the note.
     * @param process Input function.
     */
    addProcess(process: Process<T>) {
        this.processes.push(process)
        return this
    }

    /**
     * Run the algorithm.
     * @param log Log the output JSON of each note.
     */
    run(log = false) {
        const notes: T[] = []
        const diff = getActiveDiff()
        if (this.typeFilter.has('Note')) notes.push(...diff.notes as T[])
        if (this.typeFilter.has('Bomb')) notes.push(...diff.bombs as T[])
        if (this.typeFilter.has('Chain')) notes.push(...diff.chains as T[])
        if (this.typeFilter.has('Arc')) notes.push(...diff.arcs as T[])
        this.processNotes(notes, log)
    }

    betweenTime(min: number, max: number) {
        return this.addCondition((x) => x.beat >= min && x.beat < max)
    }

    betweenXPos(min: number, max: number) {
        return this.addCondition((x) => x.x >= min && x.x < max)
    }

    betweenYPos(min: number, max: number) {
        return this.addCondition((x) => x.y >= min && x.y < max)
    }

    addTrack(track: TrackValue) {
        return this.addProcess((x) => {
            x.track.add(track)
        })
    }

    addTrackByXPos(prefix = 'x_') {
        return this.addProcess((x) => {
            x.track.add(prefix + x.x)
        })
    }

    addTrackByYPos(prefix = 'y_') {
        return this.addProcess((x) => {
            x.track.add(prefix + x.y)
        })
    }

    addTrackByDirection(
        prefix = 'cut_',
        directionNames?: Record<CutName, string>,
    ) {
        function getTrack(cut: NoteCut) {
            return prefix +
                (directionNames
                    ? directionNames[directionsLiteral[cut]]
                    : directionsLiteral[cut])
        }

        return this.addProcess((x) => {
            if (x instanceof NoteInternals.Note) {
                x.track.add(getTrack(x.direction))
            } else if (x instanceof NoteInternals.Chain) {
                x.track.add(getTrack(x.headDirection))
            }
        })
    }

    /**
     * Process events through the algorithm.
     * @param notes Notes to process.
     * @param log Whether passing notes should be logged.
     */
    processNotes(notes: T[], log = false) {
        notes.forEach((x) => {
            let passed = true
            this.conditions.forEach((p) => {
                if (!p(x)) passed = false
            })
            if (!passed) return

            this.processes.forEach((p) => {
                p(x)
            })
            if (log) console.log(x.toJson(true))
        })
    }

    // Type dependent functions code example
    // bombOnlyThing!: NoteInternals.Bomb extends T ? () => this : never

    // constructor() {
    //     this.bombOnlyThing = (() => {
    //         this.addProcess(x => {
    //             if (x instanceof NoteInternals.Bomb) {
    //                 console.log('im the bomb')
    //             }
    //         })
    //         return this
    //     }) as typeof this.bombOnlyThing
    // }
}
