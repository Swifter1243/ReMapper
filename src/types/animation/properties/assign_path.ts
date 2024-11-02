import {GameplayObjectAnimationData} from "./gameplay_object.ts";
import {RuntimeDifficultyPointsVec3} from "../points/runtime/vec3.ts";

export type AssignPathAnimationData = GameplayObjectAnimationData & {
    /** Describes the definite position of an object.
     * Will completely overwrite the object's default movement.
     * However, this does take into account lineIndex/lineLayer and world rotation.
     * Only available on AssignPathAnimation. */
    definitePosition?: RuntimeDifficultyPointsVec3
}