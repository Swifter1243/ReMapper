import {destroyPrefab} from "../../builder_functions/beatmap/object/custom_event/vivify.ts";
import {InstantiatePrefab} from "../../internals/beatmap/object/custom_event/vivify.ts";

/** An instance of a prefab. */
export class PrefabInstance {
    /** The id/track of this instance. */
    readonly id: string
    /** The track of this instance. Equivalent to id. */
    get track() {
        return this.id
    }
    /** Whether this instance has been destroyed. */
    destroyed = false
    /** The light_event used to push this instance. */
    readonly event: InstantiatePrefab

    constructor(id: string, event: InstantiatePrefab) {
        this.id = id
        this.event = event
    }

    /** Destroy this instance. */
    destroy(beat = 0) {
        if (this.destroyed) throw `Prefab ${this.id} is already destroyed.`

        destroyPrefab(beat, this.id).push()
        this.destroyed = true
    }
}

/** Destroy multiple prefab instances in one light_event. */
export function destroyPrefabInstances(prefabs: PrefabInstance[], beat = 0) {
    const ids: string[] = []

    prefabs.forEach((x) => {
        if (x.destroyed) throw `Prefab ${x.id} is already destroyed.`
        ids.push(x.id)
        x.destroyed = true
    })

    destroyPrefab(beat, ids).push()
}