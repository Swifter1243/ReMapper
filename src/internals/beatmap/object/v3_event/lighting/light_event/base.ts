//! Events
import { bsmap } from '../../../../../../deps.ts'
import {BeatmapObject} from "../../../object.ts";
import {BeatmapArrayMember} from "../../../../../../types/beatmap/beatmap_member.ts";
import {LightEventBox} from "../light_event_box/base.ts";
import {copy} from "../../../../../../utils/object/copy.ts";
import {JsonWrapper} from "../../../../../../types/beatmap/json_wrapper.ts";
import {JsonObjectConstructor, JsonObjectDefaults} from "../../../../../../types/beatmap/object/object.ts";

type LightBase =
    | bsmap.v3.ILightColorBase
    | bsmap.v3.ILightRotationBase
    | bsmap.v3.ILightTranslationBase

export abstract class BaseLightEvent<T extends LightBase = LightBase> extends BeatmapArrayMember<LightEventBox> implements JsonWrapper<never, T> {
    protected constructor(
        parent: LightEventBox,
        obj: JsonObjectConstructor<BaseLightEvent>,
    ) {
        super(parent)

        this.parent = parent
        this.customData = obj.customData ?? copy(BeatmapObject.defaults.customData)
        this.beat = (obj.beat as number | undefined) ?? BeatmapObject.defaults.beat
    }

    /** The time that this object is scheduled for. */
    beat: number
    /** Any community made properties on this object. */
    customData: T['customData']

    /** Default values for initializing class fields */
    static defaults: JsonObjectDefaults<BaseLightEvent> = {
        beat: 0,
        customData: {}
    }

    fromJsonV2(_json: never): this {
        throw 'V3 Lighting is not supported in V2!'
    }

    fromJsonV3(json: LightBase): this {
        this.beat = json.b ?? BeatmapObject.defaults.beat
        return this
    }

    toJsonV2(_prune?: boolean): never {
        throw 'V3 Lighting is not supported in V2!'
    }

    abstract toJsonV3(prune?: boolean): T
}
