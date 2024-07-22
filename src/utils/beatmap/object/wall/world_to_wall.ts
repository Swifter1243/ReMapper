import {rotatePoint} from '../../../math/vector.ts'
import {arrayAdd, arrayDivide, arrayMultiply} from '../../../array/operation.ts'
import {Vec3} from "../../../../types/math/vector.ts";
import {Transform} from "../../../../types/math/transform.ts";
import {DeepReadonly} from "../../../../types/util/mutability.ts";
import {vec} from "../../../array/tuple.ts";

/**
 * Calculate the correct position for a wall to line up with a position in the world.
 * Assumes that position is set to [0,0].
 * @param animated Corrects for animated scale. If you are using this, plug [1,1,1] into static scale.
 */
export function worldToWall(
    transform: DeepReadonly<Transform>,
    animated = false,
) {
    const position = transform.position ?? [0, 0, 0]
    const rotation = transform.rotation ?? [0, 0, 0]
    const scale = transform.scale ?? [1, 1, 1]

    // Turn units into noodle unit scale
    const resizedScale = arrayDivide(scale as Vec3, 0.6)
    let resizedPos = arrayDivide(position as Vec3, 0.6)

    // Initialize offset to get to center
    let offset = vec(0, -0.5, -0.5)

    // Scale offset
    offset = arrayMultiply(offset, resizedScale)

    // Rotate offset
    offset = rotatePoint(offset, rotation)

    // Add position
    resizedPos = arrayAdd(resizedPos, offset)

    // Move walls up because they're down for some reason
    resizedPos[1] += 0.2

    // Move by half of the base width
    // In the case of animated, this is implicitly 1
    resizedPos[0] -= animated ? 0.5 : resizedScale[0] / 2

    return {
        position: resizedPos,
        scale: resizedScale,
    }
}

