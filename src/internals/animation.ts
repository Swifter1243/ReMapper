/** Contains subclasses for animation related classes. */

import { bsmap } from '../deps.ts'
import {
    RuntimePointDefinitionAny,
    RuntimePointDefinitionLinear,
    RuntimePointDefinitionVec3,
    RuntimePointDefinitionVec4,
} from '../types/animation_types.ts'

export type AnimationPropertiesV2 = {
    _color?: RuntimePointDefinitionVec4
    _position?: RuntimePointDefinitionVec3
    _rotation?: RuntimePointDefinitionVec3
    _localRotation?: RuntimePointDefinitionVec3
    _scale?: RuntimePointDefinitionVec3
    _dissolve?: RuntimePointDefinitionLinear
    _dissolveArrow?: RuntimePointDefinitionLinear
    _interactable?: RuntimePointDefinitionLinear
    _definitePosition?: RuntimePointDefinitionVec3
    _time?: RuntimePointDefinitionLinear
    _localPosition?: RuntimePointDefinitionVec3
    [key: string]: RuntimePointDefinitionAny | undefined
}

export type AnimationPropertiesV3 = {
    offsetPosition?: RuntimePointDefinitionVec3
    offsetWorldRotation?: RuntimePointDefinitionVec3
    localRotation?: RuntimePointDefinitionVec3
    scale?: RuntimePointDefinitionVec3
    dissolve?: RuntimePointDefinitionLinear
    dissolveArrow?: RuntimePointDefinitionLinear
    interactable?: RuntimePointDefinitionLinear
    definitePosition?: RuntimePointDefinitionVec3
    time?: RuntimePointDefinitionLinear
    color?: RuntimePointDefinitionVec4
    position?: RuntimePointDefinitionVec3
    rotation?: RuntimePointDefinitionVec3
    localPosition?: RuntimePointDefinitionVec3
    [key: string]: RuntimePointDefinitionAny | undefined
}

type AnimateV2Scuffed =
    & bsmap.v2.INEAnimation
    & bsmap.v2.IChromaAnimation

type AnimateV3Scuffed =
    & bsmap.v3.INEAnimation
    & bsmap.v3.IChromaAnimation

type AnimationData = AnimationPropertiesV2 | AnimationPropertiesV3

export interface ObjectAnimationData {
    offsetPosition?: RuntimePointDefinitionVec3
    definitePosition?: RuntimePointDefinitionVec3
    offsetWorldRotation?: RuntimePointDefinitionVec3
    localRotation?: RuntimePointDefinitionVec3
    scale?: RuntimePointDefinitionVec3
    dissolve?: RuntimePointDefinitionLinear
    uninteractable?: RuntimePointDefinitionLinear
    time?: RuntimePointDefinitionLinear
    color?: RuntimePointDefinitionVec4
    [key: string]: RuntimePointDefinitionAny | undefined
}

export interface NoteAnimationData extends ObjectAnimationData {
    /** Controls the dissolve shader on the arrow.
     * 0 means invisible, 1 means visible.
     */
    dissolveArrow?: RuntimePointDefinitionLinear
}

export type GameplayObjectAnimationData =
    | ObjectAnimationData
    | NoteAnimationData

export interface EnvironmentAnimationData {
    /** The position of the object in world space. */
    position?: RuntimePointDefinitionVec3
    /** The position of the object relative to it's parent. */
    localPosition?: RuntimePointDefinitionVec3
    /** The rotation of the object in world space. */
    rotation?: RuntimePointDefinitionVec3
    /** The rotation of the object relative to it's parent. */
    localRotation?: RuntimePointDefinitionVec3
    /** The scale of the object. */
    scale?: RuntimePointDefinitionVec3
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
