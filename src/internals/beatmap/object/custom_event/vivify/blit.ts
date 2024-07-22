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
import {IBlit} from "../../../../../types/beatmap/object/vivify_event_interfaces.ts";
import {EASE} from "../../../../../types/animation/easing.ts";

export class Blit extends CustomEvent<
    never,
    IBlit
> {
    constructor(
        params: CustomEventConstructor<Blit>,
    ) {
        super(params)
        this.type = 'Blit'
        this.asset = params.asset ?? ''
        if (params.pass) this.pass = params.pass
        if (params.source) this.source = params.source
        if (params.destination) this.destination = params.destination
        if (params.duration) this.duration = params.duration
        if (params.easing) this.easing = params.easing
        if (params.properties) this.properties = params.properties
    }

    /** File path to the material. */
    asset: string
    /** Which order to run current active post processing effects. Higher priority will run first. Default = 0 */
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

    push(clone = true) {
        getActiveDifficulty().customEvents.blitEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: IBlit, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(
        json:
            | IBlit
            | never,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<Blit>

        if (!v3) throw 'Blit is only supported in V3!'

        const obj = json as IBlit

        const params = {
            asset: getDataProp(obj.d, 'asset'),
            destination: getDataProp(obj.d, 'destination'),
            duration: getDataProp(obj.d, 'duration'),
            easing: getDataProp(obj.d, 'easing'),
            pass: getDataProp(obj.d, 'pass'),
            priority: getDataProp(obj.d, 'priority'),
            properties: getDataProp(obj.d, 'properties'),
            source: getDataProp(obj.d, 'source'),
        } as Params

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }

    toJson(v3: true, prune?: boolean): IBlit
    toJson(v3: false, prune?: boolean): never
    toJson(
        v3: boolean,
        prune = true,
    ) {
        if (!v3) throw 'Blit is only supported in V3!'

        if (!this.asset) throw 'asset is undefined, which is required for Blit!'

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
}
