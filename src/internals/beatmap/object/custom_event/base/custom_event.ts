import { IV3CustomEvent } from '../../../../../types/beatmap/object/custom_event.ts'
import { JsonWrapper } from '../../../../../types/beatmap/json_wrapper.ts'
import { TJson } from '../../../../../types/util/json.ts'
import { Fields } from '../../../../../types/util/class.ts'
import { bsmap } from '../../../../../deps.ts'
import {DefaultFields} from "../../../../../types/beatmap/object/object.ts";

export abstract class CustomEvent<
    TV2 extends bsmap.v2.ICustomEvent = bsmap.v2.ICustomEvent,
    TV3 extends IV3CustomEvent = IV3CustomEvent,
> implements JsonWrapper<TV2, TV3> {
    /** The beat this light event will activate. */
    beat: number
    /** The type of CustomEvent. */
    type: string
    /** The "properties" object inside the CustomEvent. */
    data: TJson

    /** Default values for initializing class fields */
    static defaults: DefaultFields<CustomEvent> = {
        beat: 0,
        data: {},
        type: '',
    }

    constructor(fields: Partial<Fields<CustomEvent<TV2, TV3>>>) {
        this.beat = fields.beat ?? CustomEvent.defaults.beat
        this.type = fields.type ?? CustomEvent.defaults.type
        this.data = fields.data ?? CustomEvent.defaults.data
    }

    fromJsonV3(json: TV3): this {
        this.beat = json.b ?? CustomEvent.defaults.beat
        this.type = json.t ?? CustomEvent.defaults.type
        this.data = json.d as TJson ?? CustomEvent.defaults.data
        return this
    }

    fromJsonV2(json: TV2): this {
        this.beat = json._time ?? CustomEvent.defaults.beat
        this.type = json._type ?? CustomEvent.defaults.type
        this.data = json._data as unknown as TJson ?? CustomEvent.defaults.data
        return this
    }

    abstract toJsonV3(prune?: boolean | undefined): TV3
    abstract toJsonV2(prune?: boolean | undefined): TV2

    /** Push this event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    abstract push(clone: boolean): CustomEvent<TV2, TV3>
}
