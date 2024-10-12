import { Chain } from '../../../../internals/beatmap/object/gameplay_object/chain.ts'

import { NoteColor, NoteCut } from '../../../../constants/note.ts'
import { AbstractDifficulty } from '../../../../internals/beatmap/abstract_beatmap.ts'

/** Create a chain. */
export function chain(
    ...params: ConstructorParameters<typeof Chain> | [
        parentDifficulty: AbstractDifficulty,
        beat?: number,
        tailBeat?: number,
        type?: NoteColor,
        cutDirection?: NoteCut,
        tailDirection?: NoteCut,
        x?: number,
        y?: number,
        tailX?: number,
        tailY?: number,
    ]
): Chain {
    if (typeof params[1] === 'object') {
        const [diff, obj] = params
        return new Chain(diff, obj)
    }

    const [parentDifficulty, beat, tailBeat, type, cutDirection, x, y, tailX, tailY, links] = params

    return new Chain(parentDifficulty, {
        beat,
        tailBeat,
        color: type,
        cutDirection,
        x,
        y,
        tailX,
        tailY,
        links,
    })
}
