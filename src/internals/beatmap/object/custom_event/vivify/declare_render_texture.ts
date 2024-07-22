import {
    CustomEvent,
    CustomEventConstructor,
    CustomEventSubclassFields,
    getDataProp,
} from '../base.ts'
import { getActiveDifficulty } from '../../../../../data/active_difficulty.ts'
import { copy } from '../../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../../utils/object/prune.ts'
import { IDeclareRenderTexture } from '../../../../../types/beatmap/object/vivify_event_interfaces.ts'
import { COLOR_FORMAT, TEX_FILTER_MODE } from '../../../../../types/vivify/setting.ts'

export class DeclareRenderTexture extends CustomEvent<
    never,
    IDeclareRenderTexture
> {
    /**
     * Animate objects on a track across their lifespan.
     */
    constructor(
        params: CustomEventConstructor<DeclareRenderTexture>,
    ) {
        super(params)
        this.type = 'DeclareRenderTexture'
        this.id = params.id ?? ''
        if (params.xRatio) this.xRatio = params.xRatio
        if (params.yRatio) this.yRatio = params.yRatio
        if (params.width) this.width = params.width
        if (params.height) this.height = params.height
        if (params.colorFormat) this.colorFormat = params.colorFormat
        if (params.filterMode) this.filterMode = params.filterMode
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

    push(clone = true) {
        getActiveDifficulty().customEvents.declareRenderTextureEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: IDeclareRenderTexture, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(
        json:
            | IDeclareRenderTexture
            | never,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<DeclareRenderTexture>

        if (!v3) throw 'DeclareRenderTexture is only supported in V3!'

        const obj = json as IDeclareRenderTexture

        const params = {
            colorFormat: getDataProp(obj.d, 'colorFormat'),
            filterMode: getDataProp(obj.d, 'filterMode'),
            height: getDataProp(obj.d, 'height'),
            id: getDataProp(obj.d, 'id'),
            width: getDataProp(obj.d, 'width'),
            xRatio: getDataProp(obj.d, 'xRatio'),
            yRatio: getDataProp(obj.d, 'yRatio'),
        } as Params

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }

    toJson(v3: true, prune?: boolean): IDeclareRenderTexture
    toJson(v3: false, prune?: boolean): never
    toJson(
        v3: boolean,
        prune = true,
    ) {
        if (!v3) throw 'DeclareRenderTexture is only supported in V3!'

        if (!this.id) {
            throw 'id is undefined, which is required for DeclareRenderTexture!'
        }

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
                ...this.data,
            },
            t: 'DeclareRenderTexture',
        } satisfies IDeclareRenderTexture
        return prune ? objectPrune(output) : output
    }
}
