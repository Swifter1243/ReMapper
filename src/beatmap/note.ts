import {NoteCut, NoteColor} from '../data/constants.ts'
import {Arc, Bomb, Chain, ColorNote} from "../internals/note.ts";

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

/** Create a bomb. */
export function bomb(
    ...params: ConstructorParameters<typeof Bomb> | [
        beat?: number,
        x?: number,
        y?: number,
    ]
): Bomb {
    const [first] = params
    if (typeof first === 'object') {
        return new Bomb(first)
    }

    const [beat, x, y] = params

    return new Bomb({
        beat: beat as number ?? 0,
        x: x ?? 0,
        y: y ?? 0,
    })
}

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

