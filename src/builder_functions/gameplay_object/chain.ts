import { Chain } from '../../internals/gameplay_object/chain.ts'

import {NoteColor, NoteCut} from "../../data/constants/note.ts";

/** Create a chain. */
export function chain(
    ...params: ConstructorParameters<typeof Chain> | [
        beat?: number,
        tailBeat?: number,
        type?: NoteColor,
        headDirection?: NoteCut,
        tailDirection?: NoteCut,
        x?: number,
        y?: number,
        tailX?: number,
        tailY?: number,
    ]
): Chain {
    const [first] = params
    if (typeof first === 'object') {
        return new Chain(first)
    }

    const [beat, tailBeat, type, direction, x, y, tailX, tailY, links] = params

    return new Chain({
        beat: beat as number ?? 0,
        tailBeat: tailBeat ?? 0,
        type: type ?? NoteColor.BLUE,
        headDirection: direction ?? NoteCut.DOWN,
        x: x ?? 0,
        y: y ?? 0,
        tailX: tailX ?? 0,
        tailY: tailY ?? 0,
        links: links ?? 4,
    })
}
