import { Arc } from '../../../../internals/beatmap/object/gameplay_object/arc.ts'

import { NoteColor, NoteCut } from '../../../../constants/note.ts'
import type { AbstractDifficulty } from '../../../../internals/beatmap/abstract_difficulty.ts'

/** Create an arc. */
export function arc(
    ...params: ConstructorParameters<typeof Arc> | [
        parentDifficulty: AbstractDifficulty,
        beat?: number,
        tailTime?: number,
        type?: NoteColor,
        cutDirection?: NoteCut,
        tailCutDirection?: NoteCut,
        x?: number,
        y?: number,
        tailX?: number,
        tailY?: number,
    ]
): Arc {
    if (typeof params[1] === 'object') {
        const [diff, obj] = params
        return new Arc(diff, obj)
    }

    const [
        parentDifficulty,
        beat,
        tailBeat,
        type,
        cutDirection,
        tailCutDirection,
        x,
        y,
        tailX,
        tailY,
    ] = params

    return new Arc(parentDifficulty, {
        beat,
        color: type,
        tailBeat,
        cutDirection,
        tailCutDirection,
        x,
        y,
        tailX,
        tailY,
    })
}
