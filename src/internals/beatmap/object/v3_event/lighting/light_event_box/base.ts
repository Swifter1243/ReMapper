import { BaseLightEvent } from '../light_event/base.ts'
import { JsonWrapper } from '../../../../../../types/beatmap/json_wrapper.ts'
import { DistributionType, RotationEase } from '../../../../../../constants/v3_event.ts'
import { bsmap } from '../../../../../../deps.ts'
import { JsonObjectConstructor, JsonObjectDefaults } from '../../../../../../types/beatmap/object/object.ts'
import { copy } from '../../../../../../utils/object/copy.ts'
import {BeatmapArrayMember} from "../../../../../../types/beatmap/beatmap_array_member.ts";
import {LightEventBoxGroup} from "../light_event_box_group/base.ts";

export abstract class LightEventBox<
    T extends bsmap.v3.IEventBox = bsmap.v3.IEventBox,
    E extends BaseLightEvent = BaseLightEvent,
> extends BeatmapArrayMember<LightEventBoxGroup<T>> implements JsonWrapper<never, T> {
    constructor(parent: LightEventBoxGroup<T>, obj: JsonObjectConstructor<LightEventBox<T, E>>) {
        super(parent)

        this.filter = obj.filter ?? copy(LightEventBox.defaults.filter)
        this.beatDistribution = obj.beatDistribution ?? LightEventBox.defaults.beatDistribution
        this.beatDistributionType = obj.beatDistributionType ?? LightEventBox.defaults.beatDistributionType
        this.distributionEasing = obj.distributionEasing ?? LightEventBox.defaults.distributionEasing
        this.customData = (obj as Record<string, unknown>).customData ?? copy(LightEventBox.defaults.customData)
        this.events = obj.events ?? copy(LightEventBox.defaults.events) as E[]
    }

    /** Allows you to filter specific environment objects within an event box and control how its effects are distributed. */
    filter: bsmap.v3.IIndexFilter
    /** https://bsmg.wiki/mapping/map-format/lightshow.html#light-color-event-boxes-beat-distribution */
    beatDistribution: number
    /** Determines how the effects will be processed over time, in relation to the starting beat. */
    beatDistributionType: DistributionType
    /** An integer value which determines the interpolation of the distribution, or the behavior for how to traverse the sequence. */
    distributionEasing: RotationEase
    /** Community properties in the event box. */
    customData: T['customData']
    /** The events in this event box. */
    events: E[]

    //** Default values to initialize fields in the class. */
    static defaults: JsonObjectDefaults<LightEventBox> = {
        filter: {
            f: 1,
            c: 0,
            d: 0,
            l: 0,
            n: 0,
            p: 0,
            r: 0,
            s: 0,
            t: 0,
        },
        beatDistribution: 0,
        beatDistributionType: DistributionType.STEP,
        distributionEasing: RotationEase.None,
        customData: {},
        events: [],
    }

    abstract fromJsonV2(json: never): this
    abstract fromJsonV3(json: T): this

    abstract toJsonV2(prune?: boolean): never
    abstract toJsonV3(prune?: boolean): T

    protected override _copy(): this {
        const newObject = super._copy()
        newObject.events = this.events.map(o => o.copyInto(newObject))
        return newObject
    }
}
