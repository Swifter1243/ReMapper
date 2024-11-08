import { copyBeatmapMember } from '../../utils/object/copy.ts'
import { arrayRemove } from '../../utils/array/mutate.ts'

export abstract class BeatmapArrayMember<T> {
    protected parent: T

    protected constructor(parent: T) {
        this.parent = parent
        this.getArray(this.parent).push(this)
    }

    protected abstract getArray(parent: T): this[]
    protected _copy(): this {
        return copyBeatmapMember(this)
    }

    /** Duplicate this object, keeping its parent array. */
    copy(): this {
        const newObject = this._copy()
        newObject.parent = this.parent
        this.getArray(this.parent).push(newObject)
        return this
    }

    /** Copy this object into another parent array. */
    copyInto(parent: T): this {
        const newObject = this.copy()
        newObject.parent = parent
        return newObject
    }

    /** Remove this object from its parent array. */
    remove(): void {
        const difficultyArray = this.getArray(this.parent)
        const thisIndex = difficultyArray.findIndex((o) => o === this)

        if (thisIndex !== -1) {
            arrayRemove(difficultyArray, thisIndex)
        } else {
            throw new Error(`You tried to remove an element that wasn't present in it's parent array!`)
        }
    }
}
