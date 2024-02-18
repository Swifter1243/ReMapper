import { bsmap } from '../../deps.ts'
import { BeatmapInterfaces } from '../../mod.ts'
import { JsonWrapper } from '../../types/beatmap_types.ts'
import {
    Fields,
    SubclassExclusiveProps,
    TJson,
} from '../../types/util_types.ts'
import { ExcludedObjectFields, ObjectReplacements } from '../object.ts'

export type CustomEventExclusions = {
    type: never
}

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
    | BeatmapInterfaces.InstantiatePrefab
    | BeatmapInterfaces.SetAnimatorProperty
    | BeatmapInterfaces.SetCameraProperty
    | BeatmapInterfaces.SetGlobalProperty
    | BeatmapInterfaces.SetMaterialProperty
    | BeatmapInterfaces.SetRenderSetting

export type CustomEventConstructor<T> = ExcludedObjectFields<
    T,
    ObjectReplacements,
    CustomEventExclusions
>

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
    beat: number
    type: string
    data: TJson

    constructor(fields: Partial<Fields<BaseCustomEvent<TV2, TV3>>>) {
        this.beat = fields.beat ?? 0
        this.type = fields.type ?? ''
        this.data = fields.data ?? {}
    }

    /** Push this event to the difficulty.
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
                data: obj.d as unknown as TJson,
            } as Params

            Object.assign(this, params)
        } else {
            const obj = json as TV2

            const params = {
                beat: obj._time ?? 0,
                data: obj._type as unknown as TJson,
            } as Params

            Object.assign(this, params)
        }

        return this
    }

    abstract toJson(v3: true, prune?: boolean): TV3
    abstract toJson(v3: false, prune?: boolean): TV2
    abstract toJson(v3: boolean, prune?: boolean): TV2 | TV3
}
