import { BaseLightEvent } from './base.ts'
import { bsmap } from '../../../../../../deps.ts'
import {LightColor, LightTransition} from "../../../../../../data/constants/v3_event.ts";
import {SubclassExclusiveProps} from "../../../../../../types/util/class.ts";
import {BeatmapObject} from "../../../object.ts";
import { objectPrune } from '../../../../../../utils/object/prune.ts'
import {ObjectFields} from "../../../../../../types/beatmap/object/object.ts";

export class LightColorEvent extends BaseLightEvent<bsmap.v3.ILightColorBase> {
    constructor(obj: Partial<ObjectFields<LightColorEvent>>) {
        super(obj)
        this.transitionType = obj.transitionType ?? LightTransition.INSTANT
        this.color = obj.color ?? LightColor.RED
        this.brightness = obj.brightness ?? 1
        this.blinkingFrequency = obj.blinkingFrequency ?? 0
    }

    /** An integer value which determines the behavior of the effect, relative to the previous effect. */
    transitionType: LightTransition
    /** The color of the effect. */
    color: LightColor
    /** The brightness of the effect, as a percentage (0-1). */
    brightness: number
    /** Blinking frequency in beat time of the event, 0 is static. */
    blinkingFrequency: number

    fromJson(json: bsmap.v3.ILightColorBase, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(json: bsmap.v3.ILightColorBase, v3: boolean): this {
        if (!v3) throw 'Event box groups are not supported in V2!'

        type Params = SubclassExclusiveProps<
            LightColorEvent,
            BeatmapObject<never, bsmap.v3.ILightColorBase>
        >

        const params = {
            blinkingFrequency: json.f ?? 0,
            brightness: json.s ?? 0,
            color: json.c ?? 0,
            transitionType: json.i ?? 0,
        } as Params

        Object.assign(this, params)
        return super.fromJson(json, true)
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.ILightColorBase
    toJson(v3: false, prune?: boolean): never
    toJson(v3: boolean, prune?: boolean): bsmap.v3.ILightColorBase {
        if (!v3) throw 'Event box groups are not supported in V2!'

        const output = {
            b: this.beat,
            c: this.color,
            f: this.blinkingFrequency,
            i: this.transitionType,
            s: this.brightness,
            customData: this.customData,
        } satisfies bsmap.v3.ILightColorBase
        return prune ? objectPrune(output) : output
    }
}
