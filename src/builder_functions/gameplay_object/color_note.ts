import { ColorNote } from '../../internals/gameplay_object/color_note.ts'
import { NoteColor, NoteCut } from '../../data/constants.ts'

/** Create a standard color note. */
export function colorNote(
    ...params: ConstructorParameters<typeof ColorNote> | [
        beat?: number,
        type?: NoteColor,
        direction?: NoteCut,
        x?: number,
        y?: number,
    ]
): ColorNote {
    const [first] = params
    if (typeof first === 'object') {
        return new ColorNote(first)
    }

    const [beat, type, direction, x, y] = params

    return new ColorNote({
        beat: beat as number ?? 0,
        type: type ?? NoteColor.BLUE,
        cutDirection: direction ?? NoteCut.DOWN,
        x: x ?? 0,
        y: y ?? 0,
    })
}
