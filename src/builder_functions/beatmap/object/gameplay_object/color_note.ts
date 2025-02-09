import { ColorNote } from '../../../../internals/beatmap/object/gameplay_object/color_note.ts'

import {NoteColor, NoteCut} from "../../../../constants/note.ts";
import {AbstractDifficulty} from "../../../../internals/beatmap/abstract_difficulty.ts";

/** Create a standard color note. */
export function colorNote(
    ...params: ConstructorParameters<typeof ColorNote> | [
        parentDifficulty: AbstractDifficulty,
        beat?: number,
        type?: NoteColor,
        direction?: NoteCut,
        x?: number,
        y?: number,
    ]
): ColorNote {
    if (typeof params[1] === 'object') {
        const [diff, obj] = params
        return new ColorNote(diff, obj)
    }

    const [parentDifficulty, beat, type, cutDirection, x, y] = params

    return new ColorNote(parentDifficulty, {
        beat,
        color: type,
        cutDirection,
        x,
        y,
    })
}
