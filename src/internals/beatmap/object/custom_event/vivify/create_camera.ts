import { objectPrune } from '../../../../../utils/object/prune.ts'
import {CameraProperties, CullingMask, ICreateCamera} from '../../../../../types/beatmap/object/vivify_event_interfaces.ts'
import {CustomEventConstructorTrack} from "../../../../../types/beatmap/object/custom_event.ts";

import {getDataProp} from "../../../../../utils/beatmap/json.ts";
import {JsonObjectDefaults} from "../../../../../types/beatmap/object/object.ts";
import type { AbstractDifficulty } from '../../../abstract_beatmap.ts'
import {CAMERA_CLEAR_FLAGS, DEPTH_TEX_MODE} from "../../../../../types/vivify/setting.ts";
import {ColorVec} from "../../../../../types/math/vector.ts";
import {Destroyable} from "./destroyable.ts";

export class CreateCamera extends Destroyable<
    never,
    ICreateCamera
> implements CameraProperties {
    /**
     * Animate objects on a track across their lifespan.
     */
    constructor(
        difficulty: AbstractDifficulty,
        params: CustomEventConstructorTrack<CreateCamera>,
    ) {
        super(difficulty, params)
        this.type = 'CreateCamera'
        this.texture = params.texture
        this.depthTexture = params.depthTexture
        this.depthTextureMode = params.depthTextureMode
        this.clearFlags = params.clearFlags
        this.backgroundColor = params.backgroundColor
        this.culling = params.culling
        this.bloomPrePass = params.bloomPrePass
        this.mainEffect = params.mainEffect
    }

    /** ID of the camera. */
    declare id: string
    /** Will render to a new texture set to this key. */
    texture?: string
    /** Renders just the depth to this texture. */
    depthTexture?: string

    // CameraProperties
    depthTextureMode?: DEPTH_TEX_MODE[]
    clearFlags?: CAMERA_CLEAR_FLAGS
    backgroundColor?: ColorVec
    culling?: CullingMask
    bloomPrePass?: boolean
    mainEffect?: boolean

    static override defaults: JsonObjectDefaults<CreateCamera> = {
        id: '',
        ...super.defaults
    }

    protected override getArray(difficulty: AbstractDifficulty): this[] {
        return difficulty.customEvents.createCameraEvents as this[]
    }

    override fromJsonV3(json: ICreateCamera): this {
        this.texture = getDataProp(json.d, 'texture')
        this.depthTexture = getDataProp(json.d, 'depthTexture')
        this.depthTextureMode = getDataProp(json.d, 'depthTextureMode')
        this.clearFlags = getDataProp(json.d, 'clearFlags')
        this.backgroundColor = getDataProp(json.d, 'backgroundColor')
        this.culling = getDataProp(json.d, 'culling')
        this.bloomPrePass = getDataProp(json.d, 'bloomPrePass')
        this.mainEffect = getDataProp(json.d, 'mainEffect')
        return super.fromJsonV3(json);
    }

    override fromJsonV2(_json: never): this {
        throw new Error('CreateCamera is only supported in V3!')
    }

    toJsonV3(prune?: boolean): ICreateCamera {
        if (!this.id) {
            throw new Error(`'id' is missing, which is required for CreateCamera!`)
        }

        const output = {
            b: this.beat,
            d: {
                id: this.id,
                texture: this.texture,
                depthTexture: this.depthTexture,
                depthTextureMode: this.depthTextureMode,
                clearFlags: this.clearFlags,
                backgroundColor: this.backgroundColor,
                culling: this.culling,
                bloomPrePass: this.bloomPrePass,
                mainEffect: this.mainEffect,
                ...this.unsafeData,
            },
            t: 'CreateCamera',
        } satisfies ICreateCamera
        return prune ? objectPrune(output) : output
    }

    toJsonV2(_prune?: boolean): never {
        throw new Error('CreateCamera is only supported in V3!')
    }
}
