import { RuntimePointDefinitionVec3 } from '../keyframe/runtime/vec3.ts'
import { RuntimePointDefinitionLinear } from '../keyframe/runtime/linear.ts'
import { RuntimePointDefinitionVec4 } from '../keyframe/runtime/vec4.ts'
import { RuntimePointDefinitionAny } from '../keyframe/runtime/any.ts'

/** Animation properties for beatmap objects. */
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
    /** Describes the color of an object. Will override any other color the object may have had. */
    color?: RuntimePointDefinitionVec4

    [key: string]: RuntimePointDefinitionAny | undefined
}
