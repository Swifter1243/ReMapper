import { bsmap } from '../../deps.ts'
import {AnimationPropertiesV2, AnimationPropertiesV3 } from "../../types/animation.ts";

type AnimateV2Scuffed =
    & bsmap.v2.INEAnimation
    & bsmap.v2.IChromaAnimation
type AnimateV3Scuffed =
    & bsmap.v3.INEAnimation
    & bsmap.v3.IChromaAnimation

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
