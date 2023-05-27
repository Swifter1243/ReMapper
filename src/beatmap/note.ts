import {NoteCut, NoteType} from '../data/constants.ts'
import {Arc, Bomb, Chain, Note} from "../internals/note.ts";

export function note(
    time?: number,
    type?: NoteType,
    direction?: NoteCut,
    x?: number,
    y?: number,
): Note
export function note(...params: ConstructorParameters<typeof Note>): Note
export function note(
    ...params: ConstructorParameters<typeof Note> | [
        time?: number,
        type?: NoteType,
        direction?: NoteCut,
        x?: number,
        y?: number,
    ]
): Note {
    const [first] = params
    if (typeof first === 'object') {
        return new Note(first)
    }

    const [time, type, direction, x, y] = params

    return new Note({
        time: time as number ?? 0,
        type: type ?? NoteType.BLUE,
        direction: direction ?? NoteCut.DOWN,
        lineIndex: x ?? 0,
        lineLayer: y ?? 0,
    })
}

export function bomb(
    time?: number,
    x?: number,
    y?: number,
): Bomb
export function bomb(...params: ConstructorParameters<typeof Bomb>): Bomb
export function bomb(
    ...params: ConstructorParameters<typeof Bomb> | [
        time?: number,
        x?: number,
        y?: number,
    ]
): Bomb {
    const [first] = params
    if (typeof first === 'object') {
        return new Bomb(first)
    }

    const [time, x, y] = params

    return new Bomb({
        time: time as number ?? 0,
        lineIndex: x ?? 0,
        lineLayer: y ?? 0,
    })
}

export function chain(
    time?: number,
    tailTime?: number,
    type?: NoteType,
    direction?: NoteCut,
    x?: number,
    y?: number,
    tailX?: number,
    tailY?: number,
    links?: number,
): Chain
export function chain(...params: ConstructorParameters<typeof Chain>): Chain
export function chain(
    ...params: ConstructorParameters<typeof Chain> | [
        time?: number,
        tailTime?: number,
        type?: NoteType,
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

    const [time, tailTime, type, direction, x, y, tailX, tailY, links] = params

    return new Chain({
        time: time as number ?? 0,
        tailTime: tailTime ?? 0,
        type: type ?? NoteType.BLUE,
        headDirection: direction ?? NoteCut.DOWN,
        lineIndex: x ?? 0,
        lineLayer: y ?? 0,
        tailX: tailX ?? 0,
        tailY: tailY ?? 0,
        links: links ?? 4,
    })
}

export function arc(
    time?: number,
    tailTime?: number,
    type?: NoteType,
    headDirection?: NoteCut,
    tailDirection?: NoteCut,
    x?: number,
    y?: number,
    tailX?: number,
    tailY?: number,
): Arc
export function arc(...params: ConstructorParameters<typeof Arc>): Arc
export function arc(
    ...params: ConstructorParameters<typeof Arc> | [
        time?: number,
        tailTime?: number,
        type?: NoteType,
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
        time,
        tailTime,
        type,
        headDirection,
        tailDirection,
        x,
        y,
        tailX,
        tailY,
    ] = params

    return new Arc({
        time: time as number ?? 0,
        type: type ?? NoteType.BLUE,
        tailTime: tailTime ?? 0,
        headDirection: headDirection ?? NoteCut.DOWN,
        tailDirection: tailDirection ?? NoteCut.DOWN,
        lineIndex: x ?? 0,
        lineLayer: y ?? 0,
        tailX: tailX ?? 0,
        tailY: tailY ?? 0,
    })
}

