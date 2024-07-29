import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { ISetAnimatorProperty } from '../../../../../types/beatmap/object/vivify_event_interfaces.ts'
import { EASE } from '../../../../../types/animation/easing.ts'
import { AnimatorProperty } from '../../../../../types/vivify/animator.ts'
import { CustomEventConstructor } from '../../../../../types/beatmap/object/custom_event.ts'

import { getDataProp } from '../../../../../utils/beatmap/json.ts'
import { CustomEvent } from '../base/custom_event.ts'
import { DefaultFields } from '../../../../../types/beatmap/object/object.ts'

export class SetAnimatorProperty extends CustomEvent<
    never,
    ISetAnimatorProperty
> {
    constructor(
        params: CustomEventConstructor<SetAnimatorProperty>,
    ) {
        super(params)
        this.type = 'SetAnimatorProperty'
        this.id = params.id ?? SetAnimatorProperty.defaults.id
        this.properties = params.properties ?? copy<typeof this.properties>(SetAnimatorProperty.defaults.properties)
        this.duration = params.duration
        this.easing = params.easing
    }

    /** Id assigned to prefab. */
    id: string
    /** The length of the event in beats. Defaults to 0. */
    duration?: number
    /** An easing for the animation to follow. Defaults to "easeLinear". */
    easing?: EASE
    /** Properties to set. */
    properties: AnimatorProperty[]

    static defaults: DefaultFields<SetAnimatorProperty> = {
        id: '',
        properties: [],
        ...super.defaults,
    }

    push(clone = true) {
        getActiveDifficulty().customEvents.setAnimatorPropertyEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJsonV3(json: ISetAnimatorProperty): this {
        this.id = getDataProp(json.d, 'id') ?? SetAnimatorProperty.defaults.id
        this.properties = getDataProp(json.d, 'properties') ??
            copy<typeof this.properties>(SetAnimatorProperty.defaults.properties)
        this.duration = getDataProp(json.d, 'duration')
        this.easing = getDataProp(json.d, 'easing') as EASE
        return super.fromJsonV3(json)
    }

    fromJsonV2(_json: never): this {
        throw 'SetAnimatorProperty is only supported in V3!'
    }

    toJsonV3(prune?: boolean): ISetAnimatorProperty {
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

    toJsonV2(_prune?: boolean): never {
        throw 'SetAnimatorProperty is only supported in V3!'
    }
}
