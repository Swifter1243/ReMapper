import {RuntimePointDefinitionVec3} from "../keyframe/runtime/vec3.ts";

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

