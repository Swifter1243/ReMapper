// deno-lint-ignore-file
import type { AbstractDifficulty } from '../../../../internals/beatmap/abstract_difficulty.ts'
import { Wall } from '../../../../internals/beatmap/object/gameplay_object/wall.ts'

/**
 * Wall object for ease of creation.
 * @param parentDifficulty The difficulty to push this wall to.
 * @param beat The time this wall will arrive at the player.
 * @param duration The duration of the wall.
 * @param x The lane of the wall.
 * @param y The vertical row of the wall.
 * @param height The height of the wall.
 * @param width The width of the wall.
 */
export function wall(
    parentDifficulty: AbstractDifficulty,
    beat?: number,
    duration?: number,
    x?: number,
    y?: number,
    height?: number,
    width?: number,
): Wall
export function wall(
    ...params: ConstructorParameters<typeof Wall>
): Wall
export function wall(
    ...params: ConstructorParameters<typeof Wall> | [
        parentDifficulty: AbstractDifficulty,
        beat?: number,
        duration?: number,
        x?: number,
        y?: number,
        height?: number,
        width?: number,
    ]
): Wall {
    if (typeof params[1] === 'object') {
        const [diff, obj] = params
        return new Wall(diff, obj)
    }

    const [parentDifficulty, beat, duration, x, y, height, width] = params

    return new Wall(parentDifficulty, {
        beat,
        duration,
        x,
        y,
        height,
        width,
    })
}
