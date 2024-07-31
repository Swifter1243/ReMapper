import {bsmap} from '../../../deps.ts'

import {isEmptyObject} from "../../../utils/object/check.ts";
import {JsonWrapper} from "../../../types/beatmap/json_wrapper.ts";
import {copy} from "../../../utils/object/copy.ts";
import {DeepReadonly} from "../../../types/util/mutability.ts";
import {ObjectFields} from "../../../types/beatmap/object/object.ts";

export abstract class BeatmapObject<
    TV2 extends bsmap.v2.IBaseObject = bsmap.v2.IBaseObject,
    TV3 extends bsmap.v3.IBaseObject = bsmap.v3.IBaseObject,
> implements JsonWrapper<TV2, TV3> {
    /** The time that this object is scheduled for. */
    beat: number
    /** Any community made properties on this object. */
    customData: NonNullable<TV2['_customData'] | TV3['customData']>

    /** Default values for initializing class fields */
    static defaults: DeepReadonly<ObjectFields<BeatmapObject>> = {
        beat: 0,
        customData: {}
    }

    constructor(
        obj: Partial<ObjectFields<BeatmapObject<TV2, TV3>>>,
    ) {
        this.beat = (obj.beat as number | undefined) ?? BeatmapObject.defaults.beat

        // gotta do this funky shit cause obj.customData is generic
        this.customData = (obj as Record<string, unknown>).customData ?? copy(BeatmapObject.defaults.customData)
    }

    /** Checks if the object has modded properties. */
    get isModded() {
        return !isEmptyObject(this.toJsonV3(true).customData)
    }

    fromJsonV3(json: TV3): this {
        this.beat = json.b ?? BeatmapObject.defaults.beat
        this.customData = json.customData ?? copy(BeatmapObject.defaults.customData)
        return this
    }

    fromJsonV2(json: TV2): this {
        this.beat = json._time ?? BeatmapObject.defaults.beat
        this.customData = json._customData ?? copy(BeatmapObject.defaults.customData)
        return this
    }

    abstract toJsonV3(prune?: boolean): TV3
    abstract toJsonV2(prune?: boolean): TV2
}

