import { objectPrune } from '../../../../../utils/object/prune.ts'
import {CameraProperties, ICreateCamera} from '../../../../../types/beatmap/object/vivify_event_interfaces.ts'
import {CustomEventConstructorTrack} from "../../../../../types/beatmap/object/custom_event.ts";

import {getDataProp} from "../../../../../utils/beatmap/json.ts";
import {JsonObjectDefaults} from "../../../../../types/beatmap/object/object.ts";
import type { AbstractDifficulty } from '../../../abstract_difficulty.ts'
import {Destroyable} from "./destroyable.ts";
import {copy} from "../../../../../utils/object/copy.ts";

export class CreateCamera extends Destroyable<
    never,
    ICreateCamera
> {
    /**
     * Animate objects on a track across their lifespan.
     */
    constructor(
        difficulty: AbstractDifficulty,
        params: CustomEventConstructorTrack<CreateCamera>,
    ) {
        super(difficulty, params)
        this.type = 'CreateCamera'
        this.properties = params.properties ?? copy(CreateCamera.defaults.properties)
        this.texture = params.texture
        this.depthTexture = params.depthTexture
    }

    /** ID of the camera. */
    declare id: string
    /** Will render to a new texture set to this key. */
    texture?: string
    /** Renders just the depth to this texture. */
    depthTexture?: string
    /** The properties for the camera. */
    properties: CameraProperties

    static override defaults: JsonObjectDefaults<CreateCamera> = {
        id: '',
        properties: {},
        ...super.defaults
    }

    protected override getArray(difficulty: AbstractDifficulty): this[] {
        return difficulty.customEvents.createCameraEvents as this[]
    }

    override fromJsonV3(json: ICreateCamera): this {
        this.texture = getDataProp(json.d, 'texture')
        this.depthTexture = getDataProp(json.d, 'depthTexture')
        this.properties = getDataProp(json.d, 'properties') ?? copy(CreateCamera.defaults.properties)
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
            t: 'CreateCamera',
            d: {
                id: this.id,
                texture: this.texture,
                depthTexture: this.depthTexture,
                properties: this.properties,
                ...this.unsafeData,
            },
        } satisfies ICreateCamera
        return prune ? objectPrune(output) : output
    }

    toJsonV2(_prune?: boolean): never {
        throw new Error('CreateCamera is only supported in V3!')
    }
}
