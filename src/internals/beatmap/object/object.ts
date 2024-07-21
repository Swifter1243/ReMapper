import {bsmap} from '../../../deps.ts'

import {ObjectFields, TJson,} from '../../../types/util.ts'
import {JsonWrapper} from '../../../types/beatmap.ts'
import {isEmptyObject} from "../../../utils/object/check.ts";
import {objectPrune} from '../../../utils/object/prune.ts'

export abstract class BeatmapObject<
    TV2 extends bsmap.v2.IBaseObject,
    TV3 extends bsmap.v3.IBaseObject,
> implements JsonWrapper<TV2, TV3> {
    /** The time that this object is scheduled for. */
    beat: number
    /** Any community made data on this object. */
    customData: TV2['_customData'] | TV3['customData']

    constructor(
        obj: ObjectFields<BeatmapObject<TV2, TV3>> | Record<string, unknown>,
    ) {
        this.beat = (obj.beat as number | undefined) ?? 0
        this.customData = obj.customData ?? {}
    }

    /** Checks if the object has modded properties. */
    get isModded() {
        return !isEmptyObject(objectPrune(this.toJson(true).customData as TJson))
    }

    fromJson(json: TV3, v3: true): this
    fromJson(json: TV2, v3: false): this
    fromJson(json: TV2 | TV3, v3: boolean): this {
        type Params = ObjectFields<BeatmapObject<TV2, TV3>>

        if (v3) {
            const obj = json as TV3

            const params = {
                beat: obj.b ?? 0,
                customData: obj.customData,
            } as Params

            Object.assign(this, params)
        } else {
            const obj = json as TV2

            const params = {
                beat: obj._time ?? 0,
                customData: obj._customData,
            } as Params

            Object.assign(this, params)
        }

        return this
    }

    abstract toJson(v3: true, prune?: boolean): TV3
    abstract toJson(v3: false, prune?: boolean): TV2
    abstract toJson(v3: true, prune?: boolean): TV2 | TV3
}

