import { Bomb } from '../../../../internals/beatmap/object/gameplay_object/bomb.ts'
import { AbstractDifficulty } from '../../../../internals/beatmap/abstract_beatmap.ts'

/** Create a bomb. */
export function bomb(
    ...params: ConstructorParameters<typeof Bomb> | [
        parentDifficulty: AbstractDifficulty,
        beat?: number,
        x?: number,
        y?: number,
    ]
): Bomb {
    if (typeof params[1] === 'object') {
        const [diff, obj] = params
        return new Bomb(diff, obj)
    }

    const [parentDifficulty, beat, x, y] = params

    return new Bomb(parentDifficulty, {
        beat,
        x,
        y,
    })
}
