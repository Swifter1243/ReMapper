import { MaterialProperty } from '../../../../../types/vivify/material.ts'
import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { IBlit } from '../../../../../types/beatmap/object/vivify_event_interfaces.ts'
import { EASE } from '../../../../../types/animation/easing.ts'
import { Fields } from '../../../../../types/util/class.ts'
import {CustomEventConstructor} from "../../../../../types/beatmap/object/custom_event.ts";

import {getDataProp} from "../../../../../utils/beatmap/json.ts";
import {CustomEvent} from "../base/custom_event.ts";

export class Blit extends CustomEvent<
    never,
    IBlit
> {
    constructor(
        params: CustomEventConstructor<Blit>,
    ) {
        super(params)
        this.type = 'Blit'
        this.asset = params.asset ?? Blit.defaults.asset
        this.pass = params.pass
        this.source = params.source
        this.destination = params.destination
        this.duration = params.duration
        this.easing = params.easing
        this.properties = params.properties
    }

    /** File path to the material. */
    asset: string
    /** Which order to run current active post-processing effects. Higher priority will run first. Default = 0 */
    priority?: number
    /** Which pass in the shader to use. Will use all passes if not defined. */
    pass?: number
    /** Which texture to pass to the shader as "_MainTex". "_Main" is reserved for the camera. Default = "_Main" */
    source?: string
    /** Which render texture to save to. Can be an array. "_Main" is reserved for the camera. Default = "_Main" */
    destination?: string
    /** The duration of the animation. */
    duration?: number
    /** An easing for the animation to follow. */
    easing?: EASE
    /** Properties to set. */
    properties?: MaterialProperty[]

    static defaults: Fields<Blit> = {
        asset: '',
        ...super.defaults,
    }

    push(clone = true) {
        getActiveDifficulty().customEvents.blitEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJsonV3(json: IBlit): this {
        this.asset = getDataProp(json.d, 'asset') ?? Blit.defaults.asset
        this.destination = getDataProp(json.d, 'destination')
        this.duration = getDataProp(json.d, 'duration')
        this.easing = getDataProp(json.d, 'easing')
        this.pass = getDataProp(json.d, 'pass')
        this.priority = getDataProp(json.d, 'priority')
        this.properties = getDataProp(json.d, 'properties')
        this.source = getDataProp(json.d, 'source')
        return super.fromJsonV3(json)
    }

    fromJsonV2(_json: never): this {
        throw 'Blit is only supported in V3!'
    }

    toJsonV3(prune?: boolean): IBlit {
        const output = {
            b: this.beat,
            d: {
                asset: this.asset,
                destination: this.destination,
                duration: this.duration,
                easing: this.easing,
                pass: this.pass,
                priority: this.priority,
                properties: this.properties,
                source: this.source,
                ...this.data,
            },
            t: 'Blit',
        } satisfies IBlit
        return prune ? objectPrune(output) : output
    }

    toJsonV2(_prune?: boolean): never {
        throw 'Blit is only supported in V3!'
    }
}
