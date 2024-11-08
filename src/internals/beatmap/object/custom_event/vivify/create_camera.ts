import { objectPrune } from '../../../../../utils/object/prune.ts'
import {CameraProperties, ICreateCamera} from '../../../../../types/beatmap/object/vivify_event_interfaces.ts'
import {CustomEventConstructorTrack} from "../../../../../types/beatmap/object/custom_event.ts";

import {getDataProp} from "../../../../../utils/beatmap/json.ts";
import {CustomEvent} from "../base/custom_event.ts";
import {JsonObjectDefaults} from "../../../../../types/beatmap/object/object.ts";
import type { AbstractDifficulty } from '../../../abstract_beatmap.ts'
import {CAMERA_CLEAR_FLAGS, DEPTH_TEX_MODE} from "../../../../../types/vivify/setting.ts";
import {ColorVec} from "../../../../../types/math/vector.ts";

export class CreateCamera extends CustomEvent<
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
        this.id = params.id ?? CreateCamera.defaults.id
        this.texture = params.texture
        this.depthTexture = params.depthTexture
        this.depthTextureMode = params.depthTextureMode
        this.clearFlags = params.clearFlags
        this.backgroundColor = params.backgroundColor
    }

    /** Name of the culling mask, this is what you must name your sampler in your shader. */
    id: string
    /** Will render to a new texture set to this key. */
    texture?: string
    /** Renders just the depth to this texture. */
    depthTexture?: string
    depthTextureMode?: DEPTH_TEX_MODE[]
    clearFlags?: CAMERA_CLEAR_FLAGS
    backgroundColor?: ColorVec

    static override defaults: JsonObjectDefaults<CreateCamera> = {
        id: '',
        ...super.defaults
    }

    protected override getArray(difficulty: AbstractDifficulty): this[] {
        return difficulty.customEvents.createCameraEvents as this[]
    }

    override fromJsonV3(json: ICreateCamera): this {
        this.id = getDataProp(json.d, 'id') ?? CreateCamera.defaults.id
        this.texture = getDataProp(json.d, 'texture')
        this.depthTexture = getDataProp(json.d, 'depthTexture')
        this.depthTextureMode = getDataProp(json.d, 'depthTextureMode')
        this.clearFlags = getDataProp(json.d, 'clearFlags')
        this.backgroundColor = getDataProp(json.d, 'backgroundColor')
        return super.fromJsonV3(json);
    }

    override fromJsonV2(_json: never): this {
        throw new Error('CreateCamera is only supported in V3!')
    }

    toJsonV3(prune?: boolean): ICreateCamera {
        const output = {
            b: this.beat,
            d: {
                id: this.id,
                texture: this.texture,
                depthTexture: this.depthTexture,
                depthTextureMode: this.depthTextureMode,
                clearFlags: this.clearFlags,
                backgroundColor: this.backgroundColor,
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
