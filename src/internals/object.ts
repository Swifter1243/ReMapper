import { JsonWrapper, ObjectFields } from '../data/types.ts'
import { isEmptyObject } from '../utils/json.ts'
import { bsmap } from '../deps.ts'

export abstract class BaseObject<
    TV2 extends bsmap.v2.IBaseObject,
    TV3 extends bsmap.v3.IBaseObject,
> implements JsonWrapper<TV2, TV3> {
    /** The time that this object is scheduled for. */
    time = 0
    /** Any community made data on this object. */
    customData: TV2['_customData'] | TV3['customData'] = {}

    constructor(
        obj: ObjectFields<BaseObject<TV2, TV3>> | Record<string, unknown>,
    ) {
        Object.assign(this, obj)
    }

    /** Checks if the object has modded properties. */
    isModded() {
        return this.customData && !isEmptyObject(this.customData)
    }

    abstract toJson(v3: true): TV3
    abstract toJson(v3: false): TV2
    abstract toJson(v3: boolean): TV2 | TV3
}
