import { instantiatePrefab } from '../../builder_functions/beatmap/object/custom_event/vivify.ts'
import {PrefabInstance} from "./prefab_instance.ts";
import {InstantiatePrefab} from "../../internals/beatmap/object/custom_event/vivify/instantiate_prefab.ts";

/** Used to load type safe prefabs. See `loadAssets` */
export class Prefab {
    /** Path to this prefab in the asset bundle. */
    readonly path: string
    /** Name of this prefab, it is also included in the track. */
    readonly name: string
    /** Keeps track of how many times this prefab has been instantiated. */
    private iteration = 0

    constructor(path: string, name: string) {
        this.path = path
        this.name = name
    }

    /** Instantiate this prefab. Returns the instance. */
    instantiate(
        beat = 0,
        event?: (event: InstantiatePrefab) => void,
    ) {
        const id = `${this.name}_${this.iteration}`
        const instantiation = instantiatePrefab(beat, this.path, id, id)
        if (event) event(instantiation)
        instantiation.push(false)
        this.iteration++
        return new PrefabInstance(id, instantiation)
    }
}
