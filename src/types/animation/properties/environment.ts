import {RuntimeDifficultyPointsVec3} from "../points/runtime/vec3.ts";

/** Animation properties for environment enhancements */
export type EnvironmentAnimationData = {
    /** The position of the object in world space. */
    position?: RuntimeDifficultyPointsVec3
    /** The position of the object relative to it's parent. */
    localPosition?: RuntimeDifficultyPointsVec3
    /** The rotation of the object in world space. */
    rotation?: RuntimeDifficultyPointsVec3
    /** The rotation of the object relative to it's parent. */
    localRotation?: RuntimeDifficultyPointsVec3
    /** The scale of the object. */
    scale?: RuntimeDifficultyPointsVec3
}

