import { objectPrune } from '../../../../../utils/object/prune.ts'
import {
    CameraProperties,
    CullingMask,
    ISetCameraProperty
} from '../../../../../types/beatmap/object/vivify_event_interfaces.ts'
import {CAMERA_CLEAR_FLAGS, DEPTH_TEX_MODE} from '../../../../../types/vivify/setting.ts'
import {CustomEventConstructor} from "../../../../../types/beatmap/object/custom_event.ts";

import {getDataProp} from "../../../../../utils/beatmap/json.ts";
import {CustomEvent} from "../base/custom_event.ts";
import {JsonObjectDefaults} from "../../../../../types/beatmap/object/object.ts";
import {ColorVec} from "../../../../../types/math/vector.ts";
import {AbstractDifficulty} from "../../../abstract_beatmap.ts";

export class SetCameraProperty extends CustomEvent<
    never,
    ISetCameraProperty
> implements CameraProperties {
    constructor(
        difficulty: AbstractDifficulty,
        params: CustomEventConstructor<SetCameraProperty>,
    ) {
        super(difficulty, params)
        this.type = 'SetCameraProperty'
        this.depthTextureMode = params.depthTextureMode
        this.clearFlags = params.clearFlags
        this.backgroundColor = params.backgroundColor
    }

    // CameraProperties
    depthTextureMode?: DEPTH_TEX_MODE[]
    clearFlags?: CAMERA_CLEAR_FLAGS
    backgroundColor?: ColorVec
    culling?: CullingMask
    bloomPrePass?: boolean
    mainEffect?: boolean

    static override defaults: JsonObjectDefaults<SetCameraProperty> = {
        ...super.defaults
    }

    protected override getArray(difficulty: AbstractDifficulty): this[] {
        return difficulty.customEvents.setCameraPropertyEvents as this[]
    }

    override fromJsonV3(json: ISetCameraProperty): this {
        this.depthTextureMode = getDataProp(json.d, 'depthTextureMode')
        this.clearFlags = getDataProp(json.d, 'clearFlags')
        this.backgroundColor = getDataProp(json.d, 'backgroundColor')
        this.culling = getDataProp(json.d, 'culling')
        this.bloomPrePass = getDataProp(json.d, 'bloomPrePass')
        this.mainEffect = getDataProp(json.d, 'mainEffect')
        return super.fromJsonV3(json);
    }

    override fromJsonV2(_json: never): this {
        throw new Error('SetCameraProperty is only supported in V3!')
    }

    toJsonV3(prune?: boolean): ISetCameraProperty {
        const output = {
            b: this.beat,
            d: {
                depthTextureMode: this.depthTextureMode,
                clearFlags: this.clearFlags,
                backgroundColor: this.backgroundColor,
                culling: this.culling,
                bloomPrePass: this.bloomPrePass,
                mainEffect: this.mainEffect,
                ...this.unsafeData,
            },
            t: 'SetCameraProperty',
        } satisfies ISetCameraProperty
        return prune ? objectPrune(output) : output
    }

    toJsonV2(_prune?: boolean): never {
        throw new Error('SetCameraProperty is only supported in V3!')
    }
}
