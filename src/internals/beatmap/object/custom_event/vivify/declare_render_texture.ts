import { objectPrune } from '../../../../../utils/object/prune.ts'
import { IDeclareRenderTexture } from '../../../../../types/beatmap/object/vivify_event_interfaces.ts'
import { COLOR_FORMAT, TEX_FILTER_MODE } from '../../../../../types/vivify/setting.ts'
import {DeclareCullingTexture} from "./declare_culling_texture.ts";
import {CustomEventConstructor} from "../../../../../types/beatmap/object/custom_event.ts";

import {getDataProp} from "../../../../../utils/beatmap/json.ts";
import {CustomEvent} from "../base/custom_event.ts";
import {JsonObjectDefaults} from "../../../../../types/beatmap/object/object.ts";
import {AbstractDifficulty} from "../../../abstract_beatmap.ts";

export class DeclareRenderTexture extends CustomEvent<
    never,
    IDeclareRenderTexture
> {
    /**
     * Animate objects on a track across their lifespan.
     */
    constructor(
        difficulty: AbstractDifficulty,
        params: CustomEventConstructor<DeclareRenderTexture>,
    ) {
        super(difficulty, params)
        this.type = 'DeclareRenderTexture'
        this.id = params.id ?? DeclareCullingTexture.defaults.id
        this.xRatio = params.xRatio
        this.yRatio = params.yRatio
        this.width = params.width
        this.height = params.height
        this.colorFormat = params.colorFormat
        this.filterMode = params.filterMode
    }

    /** Name of the texture */
    id: string
    /** Number to divide width by, i.e. on a 1920x1080 screen, an xRatio of 2 will give you a 960x1080 texture. */
    xRatio?: number
    /** Number to divide height by. */
    yRatio?: number
    /** Exact width for the texture. */
    width?: number
    /** Exact height for the texture. */
    height?: number
    /** https://docs.unity3d.com/ScriptReference/RenderTextureFormat.html */
    colorFormat?: COLOR_FORMAT
    /** https://docs.unity3d.com/ScriptReference/FilterMode.html */
    filterMode?: TEX_FILTER_MODE

    static override defaults: JsonObjectDefaults<DeclareRenderTexture> = {
        id: '',
        ...super.defaults
    }

    protected override getArray(difficulty: AbstractDifficulty): this[] {
        return difficulty.customEvents.declareRenderTextureEvents as this[]
    }

    override fromJsonV3(json: IDeclareRenderTexture): this {
        this.id = getDataProp(json.d, 'id') ?? DeclareCullingTexture.defaults.id
        this.xRatio = getDataProp(json.d, 'xRatio')
        this.yRatio = getDataProp(json.d, 'yRatio')
        this.width = getDataProp(json.d, 'width')
        this.height = getDataProp(json.d, 'height')
        this.colorFormat = getDataProp(json.d, 'colorFormat')
        this.filterMode = getDataProp(json.d, 'filterMode')
        return super.fromJsonV3(json);
    }

    override fromJsonV2(_json: never): this {
        throw new Error('DeclareRenderTexture is only supported in V3!')
    }

    toJsonV3(prune?: boolean): IDeclareRenderTexture {
        const output = {
            b: this.beat,
            d: {
                id: this.id,
                colorFormat: this.colorFormat,
                filterMode: this.filterMode,
                height: this.height,
                width: this.width,
                xRatio: this.xRatio,
                yRatio: this.yRatio,
                ...this.unsafeData,
            },
            t: 'DeclareRenderTexture',
        } satisfies IDeclareRenderTexture
        return prune ? objectPrune(output) : output
    }

    toJsonV2(_prune?: boolean): never {
        throw new Error('DeclareRenderTexture is only supported in V3!')
    }
}
