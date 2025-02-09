import { ColorVec, Vec3 } from '../math/vector.ts'

import {DeepReadonly} from "../util/mutability.ts";

/** The properties type used by the Text class to define objects in the text model.
 * Basically `ModelObject` except it can't be animated.
 */
export type TextObject = {
    position: Vec3
    rotation: Vec3
    scale: Vec3
    color?: ColorVec
    group?: string
}

/** A readonly array of `TextObject`s, representing an imported text model which shouldn't be edited. */
export type ReadonlyText = DeepReadonly<TextObject[]>

export interface TextInfo {
    /** How the text will be anchored horizontally. */
    horizontalAnchor: 'Left' | 'Center' | 'Right'
    /** How the text will be anchored vertically. */
    verticalAnchor: 'Top' | 'Center' | 'Bottom'
    /** The position of the text box. */
    position: Vec3 | undefined
    /** The rotation of the text box. */
    rotation: Vec3 | undefined
    /** The scale of the text box. */
    scale: Vec3 | undefined
    /** The height of the text box. */
    height: number
    /** A scalar of the model height which is used to space letters. */
    letterSpacing: number
    /** A scalar of the letter spacing which is used as the width of a space. */
    wordSpacing: number
}
