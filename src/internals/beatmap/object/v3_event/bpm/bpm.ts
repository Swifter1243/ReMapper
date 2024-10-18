import { IV2BPM, IV3BPM } from '../../../../../types/beatmap/object/v3_event.ts'
import { JsonWrapper } from '../../../../../types/beatmap/json_wrapper.ts'
import { JsonObjectConstructor, JsonObjectDefaults } from '../../../../../types/beatmap/object/object.ts'
import {BeatmapArrayMember} from "../../../../../types/beatmap/beatmap_array_member.ts";
import type { AbstractDifficulty } from '../../../abstract_beatmap.ts'

export abstract class BPMEvent<
    TV2 extends IV2BPM = IV2BPM,
    TV3 extends IV3BPM = IV3BPM,
> extends BeatmapArrayMember<AbstractDifficulty> implements JsonWrapper<TV2, TV3> {
    protected constructor(
        parentDifficulty: AbstractDifficulty,
        obj: JsonObjectConstructor<BPMEvent>
    ) {
        super(parentDifficulty)

        this.beat = obj.beat ?? BPMEvent.defaults.beat
    }

    /** The beat the event will activate. */
    beat: number

    /** The values to initialize fields in this class. */
    static defaults: JsonObjectDefaults<BPMEvent> = {
        beat: 0,
    }

    fromJsonV3(json: TV3): this {
        this.beat = json.b ?? BPMEvent.defaults.beat
        return this
    }

    fromJsonV2(json: TV2): this {
        this.beat = json._time ?? BPMEvent.defaults.beat
        return this
    }

    abstract toJsonV2(prune?: boolean): TV2
    abstract toJsonV3(prune?: boolean): TV3
}
