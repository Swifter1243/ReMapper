//! Event Boxes

import {BaseLightEvent} from "../light_event/base.ts";
import {JsonWrapper} from "../../../../../../types/beatmap/json_wrapper.ts";
import {ObjectFields} from "../../../../../../types/util/json.ts";
import {DistributionType, RotationEase} from "../../../../../../data/constants/v3_event.ts";
import { bsmap } from '../../../../../../deps.ts'

export abstract class LightEventBox<
    T extends bsmap.v3.IEventBox,
    E extends BaseLightEvent = BaseLightEvent,
> implements JsonWrapper<never, T> {
    constructor(obj: Partial<ObjectFields<LightEventBox<T, E>>>) {
        this.filter = obj.filter ?? {
            f: 1,
            c: 0,
            d: 0,
            l: 0,
            n: 0,
            p: 0,
            r: 0,
            s: 0,
            t: 0,
        }
        this.beatDistribution = obj.beatDistribution ?? 0
        this.beatDistributionType = obj.beatDistributionType ??
            DistributionType.STEP
        this.distributionEasing = obj.distributionEasing ?? RotationEase.None
        this.customData = obj.customData ?? {}
        this.events = obj.events ?? []
    }

    /** Allows you to filter specific environment objects within an light_event box and control how its effects are distributed. */
    filter: bsmap.v3.IIndexFilter
    /** https://bsmg.wiki/mapping/map-format/lightshow.html#light-color-event-boxes-beat-distribution */
    beatDistribution: number
    /** Determines how the effects will be processed over time, in relation to the starting beat. */
    beatDistributionType: DistributionType
    /** An integer value which determines the interpolation of the distribution, or the behavior for how to traverse the sequence. */
    distributionEasing: RotationEase
    /** Community properties in the light_event box. */
    customData: T['customData']
    /** The events in this light_event box. */
    events: E[]

    /** Add an light_event to this box's events. */
    add(event: E) {
        this.events.push(event)
    }

    abstract fromJson(json: T, v3: true): this
    abstract fromJson(json: never, v3: false): this
    abstract fromJson(json: T, v3: boolean): this

    abstract toJson(v3: true, prune?: boolean): T
    abstract toJson(v3: false, prune?: boolean): never
    abstract toJson(v3: boolean, prune?: boolean): T
}

