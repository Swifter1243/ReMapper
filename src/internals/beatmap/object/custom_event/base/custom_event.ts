import { IV3CustomEvent } from '../../../../../types/beatmap/object/custom_event.ts'
import { JsonWrapper } from '../../../../../types/beatmap/json_wrapper.ts'
import { TJson } from '../../../../../types/util/json.ts'
import { bsmap } from '../../../../../deps.ts'
import { JsonObjectConstructor, JsonObjectDefaults } from '../../../../../types/beatmap/object/object.ts'
import { BeatmapArrayMember } from '../../../../../types/beatmap/beatmap_array_member.ts'
import type { AbstractDifficulty } from '../../../abstract_difficulty.ts'

export abstract class CustomEvent<
    TV2 extends bsmap.v2.ICustomEvent = bsmap.v2.ICustomEvent,
    TV3 extends IV3CustomEvent = IV3CustomEvent,
> extends BeatmapArrayMember<AbstractDifficulty> implements JsonWrapper<TV2, TV3> {
    constructor(difficulty: AbstractDifficulty, fields: JsonObjectConstructor<CustomEvent<TV2, TV3>>) {
        super(difficulty)

        this.beat = fields.beat ?? CustomEvent.defaults.beat
        this.type = fields.type ?? CustomEvent.defaults.type
        this.unsafeData = fields.unsafeData ?? CustomEvent.defaults.unsafeData
    }

    /** The beat this light event will activate. */
    beat: number
    /** The type of CustomEvent. */
    type: string
    /** The "data" object inside the CustomEvent. */
    unsafeData: TJson

    /** Default values for initializing class fields */
    static defaults: JsonObjectDefaults<CustomEvent> = {
        beat: 0,
        unsafeData: {},
        type: '',
    }

    fromJsonV3(json: TV3): this {
        this.beat = json.b ?? CustomEvent.defaults.beat
        this.type = json.t ?? CustomEvent.defaults.type
        this.unsafeData = json.d as TJson ?? CustomEvent.defaults.unsafeData
        return this
    }

    fromJsonV2(json: TV2): this {
        this.beat = json._time ?? CustomEvent.defaults.beat
        this.type = json._type ?? CustomEvent.defaults.type
        this.unsafeData = json._data as unknown as TJson ?? CustomEvent.defaults.unsafeData
        return this
    }

    abstract toJsonV3(prune?: boolean | undefined): TV3
    abstract toJsonV2(prune?: boolean | undefined): TV2
}
