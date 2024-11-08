import {InstantiatePrefab} from "../../../internals/beatmap/object/custom_event/vivify/instantiate_prefab.ts";
import {Vec3} from "../../../types/math/vector.ts";
import {Destroyable} from "../destroyable.ts";

/** An instance of a prefab. */
export class PrefabInstance extends Destroyable<InstantiatePrefab> {
    /** The track of this instance. */
    get track() {
        return this.creationEvent.track
    }
    /** The initial position of this prefab. */
    get position() {
        return this.creationEvent.position
    }
    set position(position: Vec3 | undefined) {
        this.creationEvent.position = position
    }
    /** The initial local position of this prefab. */
    get localPosition() {
        return this.creationEvent.localPosition
    }
    set localPosition(localPosition: Vec3 | undefined) {
        this.creationEvent.localPosition = localPosition
    }
    /** The initial rotation of this prefab. */
    get rotation() {
        return this.creationEvent.rotation
    }
    set rotation(rotation: Vec3 | undefined) {
        this.creationEvent.rotation = rotation
    }
    /** The initial local rotation of this prefab. */
    get localRotation() {
        return this.creationEvent.position
    }
    set localRotation(localRotation: Vec3 | undefined) {
        this.creationEvent.localRotation = localRotation
    }
    /** The initial scale of this prefab. */
    get scale() {
        return this.creationEvent.scale
    }
    set scale(scale: Vec3 | undefined) {
        this.creationEvent.scale = scale
    }
}