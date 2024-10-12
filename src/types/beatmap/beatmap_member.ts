import {AbstractDifficulty} from "../../internals/beatmap/abstract_beatmap.ts";
import { copy } from '../../utils/object/copy.ts'
import {arrayRemove} from "../../utils/array/mutate.ts";

export abstract class BeatmapArrayMember<T> {
    protected parent: T

    protected constructor(parent: T) {
        this.parent = parent
    }

    protected abstract getArray(difficulty: T): this[]
    protected _copy(): this {
        return copy(this)
    }

    copy(): this {
        const newObject = this._copy()
        this.getArray(this.parent).push(newObject)
        return this
    }

    copyInto(parent: T): this {
        const newObject = this.copy()
        newObject.parent = parent
        return newObject
    }

    destroy(): void {
        const difficultyArray = this.getArray(this.parent)
        const thisIndex = difficultyArray.findIndex((o) => o === this)

        if (thisIndex !== -1) {
            arrayRemove(difficultyArray, thisIndex)
        }
        else {
            throw `You tried to destroy an element that wasn't present in a difficulty!`
        }
    }
}
