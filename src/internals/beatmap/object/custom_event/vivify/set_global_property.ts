import {
    CustomEvent,
    CustomEventConstructor,
    CustomEventSubclassFields,
    getDataProp,
} from '../base.ts'
import { MaterialProperty } from '../../../../../types/vivify/material.ts'
import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { EASE } from '../../../../../types/animation/easing.ts'
import {ISetGlobalProperty} from "../../../../../types/beatmap/object/vivify_event_interfaces.ts";

export class SetGlobalProperty extends CustomEvent<
    never,
    ISetGlobalProperty
> {
    constructor(
        params: CustomEventConstructor<SetGlobalProperty>,
    ) {
        super(params)
        this.type = 'SetGlobalProperty'
        if (params.duration) this.duration = params.duration
        if (params.easing) this.easing = params.easing
        if (params.properties) this.properties = params.properties
    }

    /** The duration of the animation. */
    duration?: number
    /** An easing for the animation to follow. */
    easing?: EASE
    /** Properties to set. */
    properties: MaterialProperty[] = []

    push(clone = true) {
        getActiveDifficulty().customEvents.setGlobalPropertyEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: ISetGlobalProperty, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(
        json:
            | ISetGlobalProperty
            | never,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<SetGlobalProperty>

        if (!v3) throw 'SetGlobalProperty is only supported in V3!'

        const obj = json as ISetGlobalProperty

        const params = {
            duration: getDataProp(obj.d, 'duration'),
            easing: getDataProp(obj.d, 'easing'),
            properties: getDataProp(obj.d, 'properties'),
        } as Params

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }

    toJson(v3: true, prune?: boolean): ISetGlobalProperty
    toJson(v3: false, prune?: boolean): never
    toJson(
        v3: boolean,
        prune = true,
    ) {
        if (!v3) throw 'SetGlobalProperty is only supported in V3!'
        if (Object.keys(this.properties).length === 0) {
            throw 'properties is empty, which is redundant for SetGlobalProperty!'
        }

        const output = {
            b: this.beat,
            d: {
                duration: this.duration,
                easing: this.easing,
                properties: this.properties,
                ...this.data,
            },
            t: 'SetGlobalProperty',
        } satisfies ISetGlobalProperty
        return prune ? objectPrune(output) : output
    }
}
