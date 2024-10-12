import { bsmap } from '../../../../deps.ts'
import { BeatmapObject } from '../object.ts'
import { BeatmapObjectConstructor, BeatmapObjectDefaults } from '../../../../types/beatmap/object/object.ts'
import {AbstractDifficulty} from "../../abstract_beatmap.ts";

export abstract class BasicEvent<
    TV2 extends bsmap.v2.IEvent = bsmap.v2.IEvent,
    TV3 extends bsmap.v3.IBasicEvent = bsmap.v3.IBasicEvent,
> extends BeatmapObject<TV2, TV3> {
    constructor(
        parentDifficulty: AbstractDifficulty,
        obj: BeatmapObjectConstructor<BasicEvent<TV2, TV3>>
    ) {
        super(parentDifficulty, obj)
        this.type = obj.type ?? BasicEvent.defaults.type
        this.value = obj.value ?? BasicEvent.defaults.value
        this.floatValue = obj.floatValue ?? BasicEvent.defaults.floatValue
    }

    /** The type of the event. */
    type: number
    /** The value of the event. */
    value: number
    /** The value of the event, but allowing decimals. */
    floatValue: number

    static override defaults: BeatmapObjectDefaults<BasicEvent> = {
        type: 0,
        value: 0,
        floatValue: 1,
        ...super.defaults,
    }

    override fromJsonV3(json: TV3): this {
        this.type = json.et ?? BasicEvent.defaults.type
        this.value = json.i ?? BasicEvent.defaults.value
        this.floatValue = json.f ?? BasicEvent.defaults.floatValue
        return super.fromJsonV3(json)
    }

    override fromJsonV2(json: TV2): this {
        this.type = json._type ?? BasicEvent.defaults.type
        this.value = json._value ?? BasicEvent.defaults.value
        this.floatValue = json._floatValue ?? BasicEvent.defaults.floatValue
        return super.fromJsonV2(json)
    }
}
