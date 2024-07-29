import { MaterialProperty } from '../../../../../types/vivify/material.ts'
import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { EASE } from '../../../../../types/animation/easing.ts'
import {ISetGlobalProperty} from "../../../../../types/beatmap/object/vivify_event_interfaces.ts";
import {CustomEventConstructor} from "../../../../../types/beatmap/object/custom_event.ts";

import {getDataProp} from "../../../../../utils/beatmap/json.ts";
import {CustomEvent} from "../base/custom_event.ts";
import {DefaultFields} from "../../../../../types/beatmap/object/object.ts";

export class SetGlobalProperty extends CustomEvent<
    never,
    ISetGlobalProperty
> {
    constructor(
        params: CustomEventConstructor<SetGlobalProperty>,
    ) {
        super(params)
        this.type = 'SetGlobalProperty'
        this.properties = params.properties ?? copy<MaterialProperty[]>(SetGlobalProperty.defaults.properties)
        this.duration = params.duration
        this.easing = params.easing
    }

    /** Properties to set. */
    properties: MaterialProperty[]
    /** The duration of the animation. */
    duration?: number
    /** An easing for the animation to follow. */
    easing?: EASE

    static defaults: DefaultFields<SetGlobalProperty> = {
        properties: [],
        ...super.defaults
    }

    push(clone = true) {
        getActiveDifficulty().customEvents.setGlobalPropertyEvents.push(clone ? copy(this) : this)
        return this
    }

    fromJsonV3(json: ISetGlobalProperty): this {
        this.properties = getDataProp(json.d, 'properties') ?? copy<MaterialProperty[]>(SetGlobalProperty.defaults.properties)
        this.duration = getDataProp(json.d, 'duration')
        this.easing = getDataProp(json.d, 'easing')
        return super.fromJsonV3(json);
    }

    fromJsonV2(_json: never): this {
        throw 'SetGlobalProperty is only supported in V3!'
    }

    toJsonV3(prune?: boolean): ISetGlobalProperty {
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

    toJsonV2(_prune?: boolean): never {
        throw 'SetGlobalProperty is only supported in V3!'
    }
}
