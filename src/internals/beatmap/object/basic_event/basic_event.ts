import {bsmap} from '../../../../deps.ts'
import {BeatmapObject} from '../object.ts'
import {BasicEventExcludedFields} from "../../../../types/beatmap/object/basic_event.ts";
import {SubclassExclusiveProps} from "../../../../types/util/class.ts";

export abstract class BasicEvent<
    TV2 extends bsmap.v2.IEvent = bsmap.v2.IEvent,
    TV3 extends bsmap.v3.IBasicEvent = bsmap.v3.IBasicEvent,
> extends BeatmapObject<TV2, TV3> {
    constructor(obj: BasicEventExcludedFields<BasicEvent<TV2, TV3>>) {
        super(obj)
        this.type = obj.type ?? 0
        this.value = obj.value ?? 0
        this.floatValue = obj.floatValue ?? 1
    }

    /** Push this event to the difficulty
     * @param clone Whether this object will be copied before being pushed.
     */
    abstract push(clone: boolean): BasicEvent<TV2, TV3>

    /** The type of the event. */
    type: number
    /** The value of the event. */
    value: number
    /** The value of the event, but allowing decimals. */
    floatValue: number

    fromJson(json: TV3, v3: true): this
    fromJson(json: TV2, v3: false): this
    fromJson(
        json: TV3 | TV2,
        v3: boolean,
    ): this {
        // TODO: Implement custom properties

        type Params = SubclassExclusiveProps<
            BasicEvent,
            BeatmapObject<TV2, TV3>
        >

        if (v3) {
            const obj = json as TV3

            const params = {
                type: obj.et ?? 0,
                floatValue: obj.f ?? 0,
                value: obj.i ?? 0,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, true)
        } else {
            const obj = json as TV2

            const params = {
                type: obj._type ?? 0,
                floatValue: obj._floatValue ?? 0,
                value: obj._value ?? 0,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, false)
        }
    }
}