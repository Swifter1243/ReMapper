import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { ISetCameraProperty } from '../../../../../types/beatmap/object/vivify_event_interfaces.ts'
import { DEPTH_TEX_MODE } from '../../../../../types/vivify/setting.ts'
import {Fields} from "../../../../../types/util/class.ts";
import {CustomEventConstructor} from "../../../../../types/beatmap/object/custom_event.ts";

import {getDataProp} from "../../../../../utils/beatmap/json.ts";
import {CustomEvent} from "../base/custom_event.ts";

export class SetCameraProperty extends CustomEvent<
    never,
    ISetCameraProperty
> {
    constructor(
        params: CustomEventConstructor<SetCameraProperty>,
    ) {
        super(params)
        this.type = 'SetCameraProperty'
        this.depthTextureMode = params.depthTextureMode ?? SetCameraProperty.defaults.depthTextureMode
    }

    /** Sets the depth texture mode on the camera. */
    depthTextureMode: DEPTH_TEX_MODE[]

    static defaults: Fields<SetCameraProperty> = {
        depthTextureMode: [],
        ...super.defaults
    }

    push(clone = true) {
        getActiveDifficulty().customEvents.setCameraPropertyEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJsonV3(json: ISetCameraProperty): this {
        this.depthTextureMode = getDataProp(json.d, 'depthTextureMode') ?? SetCameraProperty.defaults.depthTextureMode
        return super.fromJsonV3(json);
    }

    fromJsonV2(_json: never): this {
        throw 'SetCameraProperty is only supported in V3!'
    }

    toJsonV3(prune?: boolean): ISetCameraProperty {
        const output = {
            b: this.beat,
            d: {
                depthTextureMode: this.depthTextureMode,
                ...this.data,
            },
            t: 'SetCameraProperty',
        } satisfies ISetCameraProperty
        return prune ? objectPrune(output) : output
    }

    toJsonV2(_prune?: boolean): never {
        throw 'SetCameraProperty is only supported in V3!'
    }
}
