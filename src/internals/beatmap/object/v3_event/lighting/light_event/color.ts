import { BaseLightEvent } from './base.ts'
import { bsmap } from '../../../../../../deps.ts'
import { LightColor, LightTransition } from '../../../../../../constants/v3_event.ts'
import { objectPrune } from '../../../../../../utils/object/prune.ts'
import { BeatmapObjectConstructor, BeatmapObjectDefaults } from '../../../../../../types/beatmap/object/object.ts'
import {LightColorEventBox} from "../light_event_box/color.ts";

export class LightColorEvent extends BaseLightEvent<bsmap.v3.ILightColorBase> {
    constructor(parent: LightColorEventBox, obj: BeatmapObjectConstructor<LightColorEvent>) {
        super(parent, obj)
        this.transitionType = obj.transitionType ?? LightColorEvent.defaults.transitionType
        this.color = obj.color ?? LightColorEvent.defaults.color
        this.brightness = obj.brightness ?? LightColorEvent.defaults.brightness
        this.blinkingFrequency = obj.blinkingFrequency ?? LightColorEvent.defaults.blinkingFrequency
    }

    /** An integer value which determines the behavior of the effect, relative to the previous effect. */
    transitionType: LightTransition
    /** The color of the effect. */
    color: LightColor
    /** The brightness of the effect, as a percentage (0-1). */
    brightness: number
    /** Blinking frequency in beat time of the event, 0 is static. */
    blinkingFrequency: number

    static override defaults: BeatmapObjectDefaults<LightColorEvent> = {
        transitionType: LightTransition.INSTANT,
        color: LightColor.RED,
        brightness: 1,
        blinkingFrequency: 0,
        ...super.defaults,
    }

    protected override getArray(parent: LightColorEventBox): this[] {
        return parent.events as this[]
    }

    override fromJsonV3(json: bsmap.v3.ILightColorBase): this {
        this.transitionType = json.i ?? LightColorEvent.defaults.transitionType
        this.color = json.c ?? LightColorEvent.defaults.color
        this.brightness = json.s ?? LightColorEvent.defaults.brightness
        this.blinkingFrequency = json.f ?? LightColorEvent.defaults.blinkingFrequency
        return super.fromJsonV3(json)
    }

    toJsonV3(prune?: boolean): bsmap.v3.ILightColorBase {
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
