import { LightEventBox } from '../light_event_box/base.ts'
import { BeatmapObject } from '../../../object.ts'
import { bsmap } from '../../../../../../deps.ts'
import { objectPrune } from '../../../../../../utils/object/prune.ts'
import { BeatmapObjectConstructor, BeatmapObjectDefaults } from '../../../../../../types/beatmap/object/object.ts'

export abstract class LightEventBoxGroup<T extends bsmap.v3.IEventBox = bsmap.v3.IEventBox>
    extends BeatmapObject<never, bsmap.v3.IEventBoxGroup<T>> {
    constructor(obj: BeatmapObjectConstructor<LightEventBoxGroup<T>>) {
        super(obj)
        this.groupID = obj.groupID ?? 0
        this.boxes = obj.boxes ?? []
    }

    /** An integer value which represents what group of environment objects are affected. */
    groupID: number
    /** The event boxes in this group.  */
    boxes: LightEventBox<T>[]

    static defaults: BeatmapObjectDefaults<LightEventBoxGroup> = {
        groupID: 0,
        boxes: [],
        ...super.defaults,
    }

    /** Add a box to this group's boxes. */
    add(box: LightEventBox<T>) {
        this.boxes.push(box)
    }

    toJsonV3(prune?: boolean): bsmap.v3.IEventBoxGroup<T> {
        const output = {
            b: this.beat,
            e: this.boxes.map((x) => x.toJsonV3(prune)),
            g: this.groupID,
            customData: this.customData,
        } satisfies bsmap.v3.IEventBoxGroup<T>
        return prune ? objectPrune(output) : output
    }

    toJsonV2(_prune?: boolean): never {
        throw 'Event box groups are not supported in V2!'
    }
}
