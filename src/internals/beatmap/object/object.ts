import {bsmap} from '../../../deps.ts'
import {isEmptyObject} from "../../../utils/object/check.ts";
import {JsonWrapper} from "../../../types/beatmap/json_wrapper.ts";
import {copy} from "../../../utils/object/copy.ts";
import {BeatmapObjectConstructor, BeatmapObjectDefaults} from "../../../types/beatmap/object/object.ts";
import {BeatmapArrayMember} from "../../../types/beatmap/beatmap_array_member.ts";
import type { AbstractDifficulty } from '../abstract_difficulty.ts'

export abstract class BeatmapObject<
    TV2 extends bsmap.v2.IBaseObject = bsmap.v2.IBaseObject,
    TV3 extends bsmap.v3.IBaseObject = bsmap.v3.IBaseObject,
> extends BeatmapArrayMember<AbstractDifficulty> implements JsonWrapper<TV2, TV3> {
    constructor(
        parentDifficulty: AbstractDifficulty,
        obj: BeatmapObjectConstructor<BeatmapObject<TV2, TV3>>,
    ) {
        super(parentDifficulty)

        this.parent = parentDifficulty
        this.beat = obj.beat ?? BeatmapObject.defaults.beat
        // gotta do this funky shit cause obj.unsafeCustomData is generic
        this.unsafeCustomData = (obj as Record<string, unknown>).unsafeCustomData ?? copy(BeatmapObject.defaults.unsafeCustomData)
    }

    /** The time that this object is scheduled for. */
    beat: number
    /** Any community made properties on this object. */
    unsafeCustomData: NonNullable<TV2['_customData'] | TV3['customData']>

    /** Default values for initializing class fields */
    static defaults: BeatmapObjectDefaults<BeatmapObject> = {
        beat: 0,
        unsafeCustomData: {}
    }

    /** Checks if the object has modded properties. */
    get isModded() {
        return !isEmptyObject(this.toJsonV3(true).customData)
    }

    fromJsonV3(json: TV3): this {
        this.beat = json.b ?? BeatmapObject.defaults.beat
        this.unsafeCustomData = json.customData ?? copy(BeatmapObject.defaults.unsafeCustomData)
        return this
    }

    fromJsonV2(json: TV2): this {
        this.beat = json._time ?? BeatmapObject.defaults.beat
        this.unsafeCustomData = json._customData ?? copy(BeatmapObject.defaults.unsafeCustomData)
        return this
    }

    abstract toJsonV3(prune?: boolean): TV3
    abstract toJsonV2(prune?: boolean): TV2
}

