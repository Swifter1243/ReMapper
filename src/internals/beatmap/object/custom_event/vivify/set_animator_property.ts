import {
    CustomEvent,
    CustomEventConstructor,
    CustomEventSubclassFields,
    getDataProp,
} from '../base.ts'
import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import {ISetAnimatorProperty} from "../../../../../types/beatmap/object/vivify_event_interfaces.ts";
import {EASE} from "../../../../../types/animation/easing.ts";
import {AnimatorProperty} from "../../../../../types/vivify/animator.ts";

export class SetAnimatorProperty extends CustomEvent<
    never,
    ISetAnimatorProperty
> {
    constructor(
        params: CustomEventConstructor<SetAnimatorProperty>,
    ) {
        super(params)
        this.type = 'SetAnimatorProperty'
        this.id = params.id ?? ''
        if (params.duration) this.duration = params.duration
        if (params.easing) this.easing = params.easing
        if (params.properties) this.properties = params.properties
    }

    /** Id assigned to prefab. */
    id: string
    /** The length of the light_event in beats. Defaults to 0. */
    duration?: number
    /** An easing for the animation to follow. Defaults to "easeLinear". */
    easing?: EASE
    /** Properties to set. */
    properties: AnimatorProperty[] = []

    push(clone = true) {
        getActiveDifficulty().customEvents.setAnimatorPropertyEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: ISetAnimatorProperty, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(
        json:
            | ISetAnimatorProperty
            | never,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<SetAnimatorProperty>

        if (!v3) throw 'SetAnimatorProperty is only supported in V3!'

        const obj = json as ISetAnimatorProperty

        const params = {
            id: getDataProp(obj.d, 'id'),
            duration: getDataProp(obj.d, 'duration'),
            easing: getDataProp(obj.d, 'easing'),
            properties: getDataProp(obj.d, 'properties'),
        } as Params

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }

    toJson(v3: true, prune?: boolean): ISetAnimatorProperty
    toJson(v3: false, prune?: boolean): never
    toJson(
        v3: boolean,
        prune = true,
    ) {
        if (!v3) throw 'SetAnimatorProperty is only supported in V3!'

        if (!this.id) {
            throw 'id is undefined, which is required for SetAnimatorProperty!'
        }
        if (Object.keys(this.properties).length === 0) {
            throw 'properties is empty, which is redundant for SetAnimatorProperty!'
        }

        const output = {
            b: this.beat,
            d: {
                id: this.id,
                duration: this.duration,
                easing: this.easing,
                properties: this.properties,
                ...this.data,
            },
            t: 'SetAnimatorProperty',
        } satisfies ISetAnimatorProperty
        return prune ? objectPrune(output) : output
    }
}
