import { Bomb } from '../../internals/gameplay_object/bomb.ts'

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
