import { rotatePoint } from './vector.ts'
import { arrayAdd } from '../array/operation.ts'
import { copy } from '../object/copy.ts'
import { lerp } from './lerp.ts'
import {Vec3} from "../../types/math/vector.ts";
import {Transform} from "../../types/math/transform.ts";
import {Bounds} from "../../types/math/bounds.ts";
import {DeepReadonly} from "../../types/util/mutability.ts";

/**
 * Gets information about the bounding box of a box or a bunch of boxes.
 * @param boxes Can be one box or an array of boxes.
 */
export function getBoxBounds(
    boxes: DeepReadonly<Transform> | DeepReadonly<Transform>[],
): Bounds {
    let lowBound: Vec3 | undefined
    let highBound: Vec3 | undefined

    const boxArr = Array.isArray(boxes) ? boxes : [boxes]

    boxArr.forEach((b) => {
        const pos = b.position ?? [0, 0, 0]
        const rot = b.rotation ?? [0, 0, 0]
        const scale = b.scale ?? [1, 1, 1]

        const corners: Readonly<Vec3>[] = [
            [-1, 1, 1],
            [1, 1, 1],
            [-1, -1, 1],
            [1, -1, 1],
            [-1, 1, -1],
            [1, 1, -1],
            [-1, -1, -1],
            [1, -1, -1],
        ]

        corners.forEach((c) => {
            c = c.map((x, i) => (x / 2) * scale[i]) as Vec3
            c = rotatePoint(c, rot)
            c = arrayAdd(c, pos as Vec3)

            if (lowBound === undefined) {
                lowBound = copy<Vec3>(c)
                highBound = copy<Vec3>(c)
                return
            }

            c.forEach((x, i) => {
                if ((lowBound as Vec3)[i] > x) {
                    ;(lowBound as Vec3)[i] = x
                }
                if ((highBound as Vec3)[i] < x) {
                    ;(highBound as Vec3)[i] = x
                }
            })
        })
    })

    const scale = (lowBound as Vec3).map((x, i) => Math.abs(x - (highBound as Vec3)[i])) as Vec3
    const midPoint = (lowBound as Vec3).map((x, i) => lerp(x, (highBound as Vec3)[i], 0.5)) as Vec3

    return {
        lowBound: lowBound as Vec3,
        highBound: highBound as Vec3,
        scale: scale,
        midPoint: midPoint,
    }
}
