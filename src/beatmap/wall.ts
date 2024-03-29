// deno-lint-ignore-file
import {Wall} from "../internals/wall.ts";

/**
 * Wall object for ease of creation.
 * @param beat The time this wall will arrive at the player.
 * @param duration The duration of the wall.
 * @param x The lane of the wall.
 * @param y The vertical row of the wall.
 * @param height The height of the wall.
 * @param width The width of the wall.
 */
export function wall(
    ...params: ConstructorParameters<typeof Wall> | [
        beat?: number,
        duration?: number,
        x?: number,
        y?: number,
        height?: number,
        width?: number,
    ]
): Wall {
    const [first] = params
    if (typeof first === 'object') {
        return new Wall(first)
    }

    const [beat, duration, x, y, height, width] = params

    return new Wall({
        beat: beat as number ?? 0,
        duration: duration ?? 1,
        x: x ?? 0,
        y: y ?? 0,
        height: height,
        width: width,
    })
}