import {AbstractDifficulty} from "../../internals/beatmap/abstract_beatmap.ts";
import {destroyPrefab} from "../../builder_functions/beatmap/object/custom_event/vivify.ts";
import {CustomEvent} from "../../internals/beatmap/object/custom_event/base/custom_event.ts";
import {DestroyPrefab} from "../../internals/beatmap/object/custom_event/vivify/destroy_prefab.ts";

export abstract class Destroyable<E extends CustomEvent = CustomEvent>
{
    private readonly _parentDifficulty: AbstractDifficulty
    readonly creationEvent: E
    readonly id: string
    private _destroyed = false

    protected constructor(parentDifficulty: AbstractDifficulty, creationEvent: E, id: string) {
        this._parentDifficulty = parentDifficulty
        this.creationEvent = creationEvent
        this.id = id;
    }

    get isDestroyed() {
        return this._destroyed
    }

    destroy(beat = 0) {
        if (this._destroyed)
        {
            throw new Error(`Object ${this.id} is already destroyed.`)
        }

        destroyPrefab(this._parentDifficulty, beat, this.id)
        this._destroyed = true
    }

    destroyWithEvent(event: DestroyPrefab)
    {
        event.id.add(this.id)
        this._destroyed = true
    }
}

export function destroyObjects(difficulty: AbstractDifficulty, objects: Destroyable[], beat = 0)
{
    const event = destroyPrefab(difficulty, {
        beat
    })
    objects.forEach(o => o.destroyWithEvent(event))
}