import {AbstractDifficulty} from "../../internals/beatmap/abstract_beatmap.ts";
import {destroyPrefab} from "../../builder_functions/beatmap/object/custom_event/vivify.ts";
import {CustomEvent} from "../../internals/beatmap/object/custom_event/base/custom_event.ts";

export abstract class Destroyable<E extends CustomEvent>
{
    readonly creationEvent: E
    readonly id: string
    private readonly _parentDifficulty: AbstractDifficulty
    private _destroyed = false

    protected constructor(creationEvent: E, parentDifficulty: AbstractDifficulty, id: string) {
        this.creationEvent = creationEvent
        this._parentDifficulty = parentDifficulty
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
}