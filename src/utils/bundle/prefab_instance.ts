import {destroyPrefab} from "../../builder_functions/beatmap/object/custom_event/vivify.ts";

import {InstantiatePrefab} from "../../internals/beatmap/object/custom_event/vivify/instantiate_prefab.ts";
import {Vec3} from "../../types/math/vector.ts";
import {AbstractDifficulty} from "../../internals/beatmap/abstract_beatmap.ts";

/** An instance of a prefab. */
export class PrefabInstance {
    private _parentDifficulty: AbstractDifficulty

    /** The id/track of this instance. */
    readonly id: string
    /** The event used to push this instance. */
    readonly event: InstantiatePrefab
    /** The track of this instance. Equivalent to id. */
    get track() {
        return this.id
    }
    /** Whether this instance has been destroyed. */
    destroyed = false

    /** The initial position of this prefab. */
    get position() {
        return this.event.position
    }
    set position(position: Vec3 | undefined) {
        this.event.position = position
    }
    /** The initial local position of this prefab. */
    get localPosition() {
        return this.event.localPosition
    }
    set localPosition(localPosition: Vec3 | undefined) {
        this.event.localPosition = localPosition
    }
    /** The initial rotation of this prefab. */
    get rotation() {
        return this.event.rotation
    }
    set rotation(rotation: Vec3 | undefined) {
        this.event.rotation = rotation
    }
    /** The initial local rotation of this prefab. */
    get localRotation() {
        return this.event.position
    }
    set localRotation(localRotation: Vec3 | undefined) {
        this.event.localRotation = localRotation
    }
    /** The initial scale of this prefab. */
    get scale() {
        return this.event.scale
    }
    set scale(scale: Vec3 | undefined) {
        this.event.scale = scale
    }

    constructor(difficulty: AbstractDifficulty, id: string, event: InstantiatePrefab) {
        this._parentDifficulty = difficulty
        this.id = id
        this.event = event
    }

    /** Destroy this instance. */
    destroy(beat = 0) {
        if (this.destroyed) throw new Error(`Prefab ${this.id} is already destroyed.`)

        destroyPrefab(this._parentDifficulty, beat, this.id)
        this.destroyed = true
    }
}

/** Destroy multiple prefab instances in one event. */
export function destroyPrefabInstances(difficulty: AbstractDifficulty, prefabs: PrefabInstance[], beat = 0) {
    const ids: string[] = []

    prefabs.forEach((x) => {
        if (x.destroyed) throw new Error(`Prefab ${x.id} is already destroyed.`)
        ids.push(x.id)
        x.destroyed = true
    })

    destroyPrefab(difficulty, beat, ids)
}