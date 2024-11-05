import { instantiatePrefab } from '../../builder_functions/beatmap/object/custom_event/vivify.ts'
import {PrefabInstance} from "./prefab_instance.ts";
import {InstantiatePrefab} from "../../internals/beatmap/object/custom_event/vivify/instantiate_prefab.ts";
import {AbstractDifficulty} from "../../internals/beatmap/abstract_beatmap.ts";

/** Used to load type safe prefabs. See `loadAssets` */
export class Prefab {
    /** Path to this prefab in the asset bundle. */
    readonly path: string
    /** Name of this prefab, it is also included in the track. */
    readonly name: string
    /** Keeps track of how many times this prefab has been instantiated. */
    private count = 0

    constructor(path: string, name: string) {
        this.path = path
        this.name = name
    }

    private static getID(self: Prefab) {
        return `prefab_${self.name}_${self.count}`
    }

    /** Instantiate this prefab. Returns the instance. */
    instantiate(
        difficulty: AbstractDifficulty,
        beat = 0,
        event?: (event: InstantiatePrefab) => void,
    ) {
        this.count++
        const id = Prefab.getID(this)
        const instantiation = instantiatePrefab(difficulty, beat, this.path, id, id)
        if (event) event(instantiation)
        return new PrefabInstance(difficulty, id, instantiation)
    }
}
