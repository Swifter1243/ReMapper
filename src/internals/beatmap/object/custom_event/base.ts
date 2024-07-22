import { bsmap } from '../../../../deps.ts'
import {
    BeatmapInterfaces,
    copy,
    getActiveDifficulty,
    objectPrune,
} from '../../../../mod.ts'

import {ExcludedObjectFields, ObjectReplacements} from "../../../../types/beatmap/object/object.ts";
import {JsonWrapper} from "../../../../types/beatmap/json_wrapper.ts";
import {Fields, SubclassExclusiveProps} from "../../../../types/util/class.ts";
import {TJson} from "../../../../types/util/json.ts";

export type CustomEventExclusions = {
    type: never
}

/** Get a property from the "properties" object in a CustomEvent.
 * This deletes whatever's accessed, so that the values transferred into the class aren't left in the properties object.
 */
export function getDataProp<
    T,
    K extends keyof T,
>(
    obj: T,
    prop: K,
) {
    if (obj[prop] !== undefined) {
        const result = obj[prop]
        delete obj[prop]
        return result as T[K]
    }

    return undefined
}

type AllV3CustomEvents =
    | bsmap.v3.ICustomEvent
    | BeatmapInterfaces.AssignTrackPrefab
    | BeatmapInterfaces.Blit
    | BeatmapInterfaces.DeclareCullingTexture
    | BeatmapInterfaces.DeclareRenderTexture
    | BeatmapInterfaces.DestroyPrefab
    | BeatmapInterfaces.DestroyTexture
    | BeatmapInterfaces.InstantiatePrefab
    | BeatmapInterfaces.SetAnimatorProperty
    | BeatmapInterfaces.SetCameraProperty
    | BeatmapInterfaces.SetGlobalProperty
    | BeatmapInterfaces.SetMaterialProperty
    | BeatmapInterfaces.SetRenderSetting

/** Gives the input params object for the constructor of custom events using a track.
 * Replaces the track property from a track class to a (string | string[])
 */
export type CustomEventConstructorTrack<T, R = ObjectReplacements> =
    ExcludedObjectFields<
        T,
        R,
        CustomEventExclusions
    >

/**
 * Gives the input params object for the constructor of custom events.
 */
export type CustomEventConstructor<T> = ExcludedObjectFields<
    T,
    // deno-lint-ignore ban-types
    {},
    CustomEventExclusions
>

/** Gives the fields exclusive to the subclass of a custom light_event.
 * Kind of just removes some biolerplate where I define BaseCustomEvent as the parent.
 */
export type CustomEventSubclassFields<T> = Fields<
    SubclassExclusiveProps<
        T,
        BaseCustomEvent
    >
>

export abstract class BaseCustomEvent<
    TV2 extends bsmap.v2.ICustomEvent = bsmap.v2.ICustomEvent,
    TV3 extends AllV3CustomEvents = AllV3CustomEvents,
> implements JsonWrapper<TV2, TV3> {
    /** This this light_event will activate. */
    beat: number
    /** The type of CustomEvent. */
    type: string
    /** The "properties" object inside of the CustomEvent. */
    data: TJson

    constructor(fields: Partial<Fields<BaseCustomEvent<TV2, TV3>>>) {
        this.beat = fields.beat ?? 0
        this.type = fields.type ?? ''
        this.data = fields.data ?? {}
    }

    /** Push this light_event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    abstract push(clone: boolean): BaseCustomEvent<TV2, TV3>

    fromJson(json: TV3, v3: true): this
    fromJson(json: TV2, v3: false): this
    fromJson(json: TV2 | TV3, v3: boolean): this {
        type Params = Fields<BaseCustomEvent<TV2, TV3>>

        if (v3) {
            const obj = json as TV3

            const params = {
                beat: obj.b ?? 0,
                data: obj.d,
            } as Params

            Object.assign(this, params)
        } else {
            const obj = json as TV2

            const params = {
                beat: obj._time ?? 0,
                data: obj._data as unknown as TJson,
            } as Params

            Object.assign(this, params)
        }

        return this
    }

    abstract toJson(v3: true, prune?: boolean): TV3
    abstract toJson(v3: false, prune?: boolean): TV2
    abstract toJson(v3: boolean, prune?: boolean): TV2 | TV3
}

export class AbstractCustomEvent extends BaseCustomEvent<
    bsmap.v2.ICustomEvent,
    bsmap.v3.ICustomEvent
> {
    push(clone = true) {
        getActiveDifficulty().customEvents.abstractCustomEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: bsmap.v3.ICustomEvent, v3: true): this
    fromJson(json: bsmap.v2.ICustomEvent, v3: false): this
    fromJson(
        json: bsmap.v2.ICustomEvent | bsmap.v3.ICustomEvent,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<AbstractCustomEvent>

        if (v3) {
            const obj = json as bsmap.v3.ICustomEvent

            const params = {
                type: obj.t,
            } as Params

            Object.assign(this, params)
        } else {
            const obj = json as bsmap.v2.ICustomEvent

            const params = {
                type: obj._type,
            } as Params

            Object.assign(this, params)
        }

        return this
    }

    toJson(v3: true, prune?: boolean | undefined): bsmap.v3.ICustomEvent
    toJson(v3: false, prune?: boolean | undefined): bsmap.v2.ICustomEvent
    toJson(v3: boolean, prune?: boolean | undefined) {
        if (v3) {
            const result = {
                b: this.beat,
                t: this.type as bsmap.v3.ICustomEvent['t'],
                d: this.data as unknown as bsmap.v3.ICustomEvent['d'],
            } as bsmap.v3.ICustomEvent
            return prune ? objectPrune(result) : result
        }

        const result = {
            _time: this.beat,
            _type: this.type as bsmap.v2.ICustomEvent['_type'],
            _data: this.data as unknown as bsmap.v2.ICustomEvent['_data'],
        } as bsmap.v2.ICustomEvent
        return prune ? objectPrune(result) : result
    }
}
