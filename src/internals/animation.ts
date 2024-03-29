/** Contains subclasses for animation related classes. */

import { bsmap } from '../deps.ts'
import {
    RuntimePointDefinitionAny,
    RuntimePointDefinitionLinear,
    RuntimePointDefinitionVec3,
    RuntimePointDefinitionVec4,
} from '../types/animation_types.ts'

/** All animatable properties for V2. */
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

/** All animatable properties for V3. */
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

/** Animation data for beatmap objects. */
export interface ObjectAnimationData {
    /** Describes the position offset of an object. It will continue any normal movement and have this stacked on top of it. */
    offsetPosition?: RuntimePointDefinitionVec3
    /** Describes the definite position of an object. 
     * Will completely overwrite the object's default movement. 
     * However, this does take into account lineIndex/lineLayer and world rotation. 
     * Only available on AssignPathAnimation. */
    definitePosition?: RuntimePointDefinitionVec3
    /** This property describes the world rotation offset of an object. This means it is rotated with the world as the origin. Uses euler values. Think of 360 mode. */
    offsetWorldRotation?: RuntimePointDefinitionVec3
    /** This property describes the local rotation offset of an object. This means it is rotated with itself as the origin. Uses euler values. Do note that the note spawn effect will be rotated accordlingly. Notes attempting to look towards the player may look strange, you can disable their look by setting noteLook to false. */
    localRotation?: RuntimePointDefinitionVec3
    /** Decribes the scale of an object. This will be based off their initial size. A scale of 1 is equal to normal size, anything under is smaller, over is larger. */
    scale?: RuntimePointDefinitionVec3
    /** This property controls the dissolve effect on both notes and walls. It's the effect that happens when things go away upon failing a song. Keep in mind that notes and the arrows on notes have seperate dissolve properties, see dissolveArrow. */
    dissolve?: RuntimePointDefinitionLinear
    /** This property controls whether or not the player can interact with the note/wall.
     * "interactable" either is or isn't, there is no inbetween. When great than or equal to 1, the object can fully be interacted with. When less than 1, the object cannot be interacted with at all. */
    interactable?: RuntimePointDefinitionLinear
    /** "time" is relatively advanced so make sure to have a solid understanding of Heck animations before delving into time. time can only be used in AnimateTrack as it lets you control what point in the note's "lifespan" it is at a given time. */
    time?: RuntimePointDefinitionLinear
    /** Describes the color of an object. Will override any other color the object may have had. */
    color?: RuntimePointDefinitionVec4
    [key: string]: RuntimePointDefinitionAny | undefined
}

/** Animation data for note objects. */
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
