import { Arc } from '../../../../internals/beatmap/object/gameplay_object/arc.ts'

import {NoteColor, NoteCut} from "../../../../data/constants/note.ts";

/** Create an arc. */
export function arc(
    ...params: ConstructorParameters<typeof Arc> | [
        beat?: number,
        tailTime?: number,
        type?: NoteColor,
        headDirection?: NoteCut,
        tailDirection?: NoteCut,
        x?: number,
        y?: number,
        tailX?: number,
        tailY?: number,
    ]
): Arc {
    const [first] = params
    if (typeof first === 'object') {
        return new Arc(first)
    }

    const [
        beat,
        tailBeat,
        type,
        headDirection,
        tailDirection,
        x,
        y,
        tailX,
        tailY,
    ] = params

    return new Arc({
        beat: beat as number ?? 0,
        type: type ?? NoteColor.BLUE,
        tailBeat: tailBeat ?? 0,
        headDirection: headDirection ?? NoteCut.DOWN,
        tailDirection: tailDirection ?? NoteCut.DOWN,
        x: x ?? 0,
        y: y ?? 0,
        tailX: tailX ?? 0,
        tailY: tailY ?? 0,
    })
}
