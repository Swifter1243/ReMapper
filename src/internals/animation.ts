/** Contains subclasses for animation related classes. */

import { bsmap } from '../deps.ts'
import {
    PointDefinitionAny,
    PointDefinitionLinear,
    PointDefinitionVec3,
    PointDefinitionVec4,
} from '../types/animation_types.ts'

export type AnimationPropertiesV2 = {
    _color?: PointDefinitionVec4
    _position?: PointDefinitionVec3
    _rotation?: PointDefinitionVec3
    _localRotation?: PointDefinitionVec3
    _scale?: PointDefinitionVec3
    _dissolve?: PointDefinitionLinear
    _dissolveArrow?: PointDefinitionLinear
    _interactable?: PointDefinitionLinear
    _definitePosition?: PointDefinitionVec3
    _time?: PointDefinitionLinear
    _localPosition?: PointDefinitionVec3
    [key: string]: PointDefinitionAny | undefined
}

export type AnimationPropertiesV3 = {
    offsetPosition?: PointDefinitionVec3
    offsetWorldRotation?: PointDefinitionVec3
    localRotation?: PointDefinitionVec3
    scale?: PointDefinitionVec3
    dissolve?: PointDefinitionLinear
    dissolveArrow?: PointDefinitionLinear
    interactable?: PointDefinitionLinear
    definitePosition?: PointDefinitionVec3
    time?: PointDefinitionLinear
    color?: PointDefinitionVec4
    position?: PointDefinitionVec3
    rotation?: PointDefinitionVec3
    localPosition?: PointDefinitionVec3
    [key: string]: PointDefinitionAny | undefined
}

type AnimateV2Scuffed =
    & bsmap.v2.INEAnimation
    & bsmap.v2.IChromaAnimation

type AnimateV3Scuffed =
    & bsmap.v3.INEAnimation
    & bsmap.v3.IChromaAnimation

type AnimationData = AnimationPropertiesV2 | AnimationPropertiesV3

export interface ObjectAnimationData {
    offsetPosition?: PointDefinitionVec3
    definitePosition?: PointDefinitionVec3
    offsetWorldRotation?: PointDefinitionVec3
    localRotation?: PointDefinitionVec3
    scale?: PointDefinitionVec3
    dissolve?: PointDefinitionLinear
    uninteractable?: PointDefinitionLinear
    time?: PointDefinitionLinear
    color?: PointDefinitionVec4
    [key: string]: PointDefinitionAny | undefined
}

export interface NoteAnimationData extends ObjectAnimationData {
    /** Controls the dissolve shader on the arrow.
     * 0 means invisible, 1 means visible.
     */
    dissolveArrow?: PointDefinitionLinear
}

export type GameplayObjectAnimationData =
    | ObjectAnimationData
    | NoteAnimationData

export interface EnvironmentAnimationData {
    /** The position of the object in world space. */
    position?: PointDefinitionVec3
    /** The position of the object relative to it's parent. */
    localPosition?: PointDefinitionVec3
    /** The rotation of the object in world space. */
    rotation?: PointDefinitionVec3
    /** The rotation of the object relative to it's parent. */
    localRotation?: PointDefinitionVec3
    /** The scale of the object. */
    scale?: PointDefinitionVec3
}

export function animationToJson(
    obj: AnimationPropertiesV3,
    v3: true,
): AnimateV3Scuffed
export function animationToJson(
    obj: AnimationPropertiesV3,
    v3: false,
): AnimateV2Scuffed
export function animationToJson(
    obj: AnimationPropertiesV3,
    v3: boolean,
): AnimateV2Scuffed | AnimateV3Scuffed {
    if (v3) return obj as AnimateV3Scuffed

    return {
        _color: obj.color,
        _definitePosition: obj.definitePosition,
        _dissolve: obj.dissolve,
        _dissolveArrow: obj.dissolveArrow,
        _interactable: obj.interactable,
        _localPosition: obj.localPosition,
        _localRotation: obj.localRotation,
        _position: obj.offsetPosition ?? obj.position,
        _rotation: obj.offsetWorldRotation ?? obj.rotation,
        _scale: obj.scale,
        _time: obj.time,
    } as AnimateV2Scuffed
}

export function jsonToAnimation(
    obj: AnimationPropertiesV2,
): AnimationPropertiesV3 {
    return {
        color: obj._color,
        definitePosition: obj._definitePosition,
        dissolve: obj._dissolve,
        dissolveArrow: obj._dissolveArrow,
        interactable: obj._interactable,
        localPosition: obj._localPosition,
        localRotation: obj._localRotation,
        offsetPosition: obj._position,
        offsetWorldRotation: obj._rotation,
        position: obj._position,
        rotation: obj._rotation,
        scale: obj._scale,
        time: obj._time,
    } as AnimationPropertiesV3
}
