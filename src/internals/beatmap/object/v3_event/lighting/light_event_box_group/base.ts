import { LightEventBox } from '../light_event_box/base.ts'
import { BeatmapObject } from '../../../object.ts'
import { bsmap } from '../../../../../../deps.ts'
import { objectPrune } from '../../../../../../utils/object/prune.ts'
import { BeatmapObjectConstructor, BeatmapObjectDefaults } from '../../../../../../types/beatmap/object/object.ts'
import {AbstractDifficulty} from "../../../../abstract_difficulty.ts";

export abstract class LightEventBoxGroup<T extends bsmap.v3.IEventBox = bsmap.v3.IEventBox>
    extends BeatmapObject<never, bsmap.v3.IEventBoxGroup<T>> {
    constructor(parentDifficulty: AbstractDifficulty, obj: BeatmapObjectConstructor<LightEventBoxGroup<T>>) {
        super(parentDifficulty, obj)
        this.groupID = obj.groupID ?? 0
        this.boxes = obj.boxes ?? []
    }

    /** An integer value which represents what group of environment objects are affected. */
    groupID: number
    /** The event boxes in this group.  */
    boxes: LightEventBox<T>[]

    static override defaults: BeatmapObjectDefaults<LightEventBoxGroup> = {
        groupID: 0,
        boxes: [],
        ...super.defaults,
    }

    toJsonV3(prune?: boolean): bsmap.v3.IEventBoxGroup<T> {
        const output = {
            b: this.beat,
            e: this.boxes.map((x) => x.toJsonV3(prune)),
            g: this.groupID,
            customData: this.unsafeCustomData,
        } satisfies bsmap.v3.IEventBoxGroup<T>
        return prune ? objectPrune(output) : output
    }

    toJsonV2(_prune?: boolean): never {
        throw new Error('Event box groups are not supported in V2!')
    }

    protected override _copy(): this {
        const newObject = super._copy()
        newObject.boxes = this.boxes.map(o => o.copyInto(newObject))
        return newObject
    }
}
