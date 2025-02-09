import {RuntimeDifficultyPointsVec3} from "../points/runtime/vec3.ts";
import {ObjectPathAnimationData} from "./object.ts";
import {NotePathAnimationData} from "./note.ts";

export type DefinitePositionData = {
    /** Describes the definite position of an object.
     * Will completely overwrite the object's default movement.
     * However, this does take into account lineIndex/lineLayer and world rotation.
     * Only available on AssignPathAnimation. */
    definitePosition?: RuntimeDifficultyPointsVec3
}

export type AssignPathAnimationData =
    | ObjectPathAnimationData
    | NotePathAnimationData