import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { ISetCameraProperty } from '../../../../../types/beatmap/object/vivify_event_interfaces.ts'
import {CAMERA_CLEAR_FLAGS, DEPTH_TEX_MODE} from '../../../../../types/vivify/setting.ts'
import {CustomEventConstructor} from "../../../../../types/beatmap/object/custom_event.ts";

import {getDataProp} from "../../../../../utils/beatmap/json.ts";
import {CustomEvent} from "../base/custom_event.ts";
import {JsonObjectDefaults} from "../../../../../types/beatmap/object/object.ts";
import {ColorVec} from "../../../../../types/math/vector.ts";

export class SetCameraProperty extends CustomEvent<
    never,
    ISetCameraProperty
> {
    constructor(
        params: CustomEventConstructor<SetCameraProperty>,
    ) {
        super(params)
        this.type = 'SetCameraProperty'
        this.depthTextureMode = params.depthTextureMode
        this.clearFlags = params.clearFlags
        this.backgroundColor = params.backgroundColor
    }

    /** Sets the depth texture mode on the camera. */
    depthTextureMode?: DEPTH_TEX_MODE[]
    /** Determines what to clear when rendering the camera.  */
    clearFlags?: CAMERA_CLEAR_FLAGS
    /** Color to clear the screen with. Only used with the `SolidColor` clear flag. */
    backgroundColor?: ColorVec

    static override defaults: JsonObjectDefaults<SetCameraProperty> = {
        ...super.defaults
    }

    push(clone = true) {
        getActiveDifficulty().customEvents.setCameraPropertyEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    override fromJsonV3(json: ISetCameraProperty): this {
        this.depthTextureMode = getDataProp(json.d, 'depthTextureMode')
        this.clearFlags = getDataProp(json.d, 'clearFlags')
        this.backgroundColor = getDataProp(json.d, 'backgroundColor')
        return super.fromJsonV3(json);
    }

    override fromJsonV2(_json: never): this {
        throw 'SetCameraProperty is only supported in V3!'
    }

    toJsonV3(prune?: boolean): ISetCameraProperty {
        const output = {
            b: this.beat,
            d: {
                depthTextureMode: this.depthTextureMode,
                clearFlags: this.clearFlags,
                backgroundColor: this.backgroundColor,
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
