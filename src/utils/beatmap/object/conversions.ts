import {NoteCut} from "../../../constants/note.ts";
import {Vec2} from "../../../types/math/vector.ts";
import { normalize } from '../../math/vector.ts'

/** Converts a Y value on the grid to a Y value in Unity units (relative to the bottom row). */
export function gridYToLocalOffset(y: number): number {
    switch (y) {
        case 0:
            return 0
        case 1:
            return 0.55
        case 2:
            return 1.05
        default:
            return 0
    }
}

/** Converts a cut direction to degrees on the Z axis. */
export function cutDirectionToAngle(cut: NoteCut) {
    switch (cut) {
        case NoteCut.UP:
            return 180
        case NoteCut.DOWN:
            return 0
        case NoteCut.LEFT:
            return -90
        case NoteCut.RIGHT:
            return 90
        case NoteCut.UP_LEFT:
            return -135
        case NoteCut.UP_RIGHT:
            return 135
        case NoteCut.DOWN_LEFT:
            return -45
        case NoteCut.DOWN_RIGHT:
            return 45
        case NoteCut.DOT:
            return 0
    }
}

/** Converts a cut direction to a unit vector on the XY plane, pointing in the direction of the swing. */
export function cutDirectionToVector(cut: NoteCut): Vec2 {
    switch (cut) {
        case NoteCut.UP:
            return [0, 1]
        case NoteCut.DOWN:
            return [0, -1]
        case NoteCut.LEFT:
            return [-1, 0]
        case NoteCut.RIGHT:
            return [1, 0]
        case NoteCut.UP_LEFT:
            return normalize([-1, 1])
        case NoteCut.UP_RIGHT:
            return normalize([1, 1])
        case NoteCut.DOWN_LEFT:
            return normalize([-1, -1])
        case NoteCut.DOWN_RIGHT:
            return normalize([1, -1])
        case NoteCut.DOT:
            return [0, 0]
    }
}