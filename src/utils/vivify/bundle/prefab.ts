import { instantiatePrefab } from '../../../builder_functions/beatmap/object/custom_event/vivify.ts'
import {InstantiatePrefab} from "../../../internals/beatmap/object/custom_event/vivify/instantiate_prefab.ts";
import {AbstractDifficulty} from "../../../internals/beatmap/abstract_difficulty.ts";

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

    /** Instantiate this prefab. */
    instantiate(
        difficulty: AbstractDifficulty,
        ...params:
        | [
            beat?: number
        ]
        | [
            Omit<
                ConstructorParameters<typeof InstantiatePrefab>[1],
                'asset'
            >,
        ]
    ) {
        this.count++
        const id = Prefab.getID(this)

        if (typeof params[0] === 'object') {
            const obj = params[0]

            const instantiation = instantiatePrefab(difficulty, {
                ...obj,
                asset: this.path,
            })
            instantiation.id ??= id
            instantiation.track.value ??= id
            return instantiation
        }

        const [beat] = params
        return instantiatePrefab(difficulty, beat ?? 0, this.path, id, id)
    }
}
