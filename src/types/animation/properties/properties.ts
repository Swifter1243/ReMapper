import { RuntimePointDefinitionVec3 } from '../keyframe/runtime/vec3.ts'
import { RuntimePointDefinitionLinear } from '../keyframe/runtime/linear.ts'
import { RuntimePointDefinitionVec4 } from '../keyframe/runtime/vec4.ts'
import { RuntimePointDefinitionAny } from '../keyframe/runtime/any.ts'

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
