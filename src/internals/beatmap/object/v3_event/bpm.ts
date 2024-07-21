import {JsonWrapper} from '../../types/beatmap.ts'
import {Fields, ObjectFields} from '../../types/util.ts'
import {BaseObject} from '../beatmap/object/object.ts'
import {V2BPM, V3BPM} from "../../types/v3_event.ts";
import { getActiveDifficulty } from '../../data/active_difficulty.ts'
import { copy } from '../../utils/object/copy.ts'

export abstract class BPMEvent<
    TV2 extends V2BPM = V2BPM,
    TV3 extends V3BPM = V3BPM,
> implements JsonWrapper<TV2, TV3> {
    protected constructor(obj: Partial<Fields<BPMEvent>>) {
        this.beat = obj.beat ?? 0
    }

    /** The beat the light_event will activate. */
    beat: number

    push(
        clone = true,
    ) {
        getActiveDifficulty().bpmEvents.push(clone ? copy(this) : this)
        return this
    }

    fromJson(json: TV3, v3: true): this
    fromJson(json: TV2, v3: false): this
    fromJson(json: TV2 | TV3, v3: boolean): this {
        type Params = ObjectFields<BaseObject<TV2, TV3>>

        if (v3) {
            const obj = json as TV3

            const params = {
                beat: obj.b ?? 0,
            } as Params

            Object.assign(this, params)
        } else {
            const obj = json as TV2

            const params = {
                beat: obj._time ?? 0,
            } as Params

            Object.assign(this, params)
        }

        return this
    }

    abstract toJson(v3: true, prune?: boolean): TV3
    abstract toJson(v3: false, prune?: boolean): TV2
    abstract toJson(v3: true, prune?: boolean): TV2 | TV3
}
