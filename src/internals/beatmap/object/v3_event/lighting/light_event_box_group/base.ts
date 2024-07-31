import {LightEventBox} from "../light_event_box/base.ts";
import {BeatmapObject} from "../../../object.ts";
import { bsmap } from '../../../../../../deps.ts'
import {objectPrune} from "../../../../../../utils/object/prune.ts";
import {ObjectFields} from "../../../../../../types/beatmap/object/object.ts";

export abstract class LightEventBoxGroup<T extends bsmap.v3.IEventBox>
    extends BeatmapObject<never, bsmap.v3.IEventBoxGroup<T>> {
    constructor(obj: Partial<ObjectFields<LightEventBoxGroup<T>>>) {
        super(obj)
        this.groupID = obj.groupID ?? 0
        this.boxes = obj.boxes ?? []
    }

    /** An integer value which represents what group of environment objects are affected. */
    groupID: number
    /** The event boxes in this group.  */
    boxes: LightEventBox<T>[]

    /** Add a box to this group's boxes. */
    add(box: LightEventBox<T>) {
        this.boxes.push(box)
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.IEventBoxGroup<T>
    toJson(v3: false, prune?: boolean): never
    toJson(v3: boolean, prune = true): bsmap.v3.IEventBoxGroup<T> {
        if (!v3) throw 'Event box groups are not supported in V2!'

        const output = {
            b: this.beat,
            e: this.boxes.map((x) => x.toJson(true)),
            g: this.groupID,
            customData: this.customData,
        } satisfies bsmap.v3.IEventBoxGroup<T>
        return prune ? objectPrune(output) : output
    }
}
