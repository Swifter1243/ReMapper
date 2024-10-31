import { bsmap } from '../../deps.ts'
import {AnyAnimationData} from "../../types/animation/properties/any.ts";

type AnimateV2Scuffed =
    & bsmap.v2.INEAnimation
    & bsmap.v2.IChromaAnimation

export function animationV3toV2(obj: AnyAnimationData): AnimateV2Scuffed {
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

export function animationV2ToV3(
    animation: AnimateV2Scuffed,
): AnyAnimationData {
    return {
        color: animation._color,
        definitePosition: animation._definitePosition,
        dissolve: animation._dissolve,
        dissolveArrow: animation._dissolveArrow,
        interactable: animation._interactable,
        localPosition: undefined,
        localRotation: animation._localRotation,
        offsetPosition: animation._position,
        offsetWorldRotation: animation._rotation,
        position: animation._position,
        rotation: animation._rotation,
        scale: animation._scale,
        time: animation._time,
    } as AnyAnimationData
}
