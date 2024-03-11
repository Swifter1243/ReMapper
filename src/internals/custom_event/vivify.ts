import { Track } from '../../animation/track.ts'
import { getActiveDifficulty } from '../../data/beatmap_handler.ts'
import { EASE, TrackValue } from '../../types/animation_types.ts'
import {
    BeatmapInterfaces,
    DEPTH_TEX_MODE,
    RENDER_TEX,
    TEX_FILTER,
    Vec3,
} from '../../types/mod.ts'
import { MaterialProperty, RENDER_SETTING } from '../../types/vivify_types.ts'
import { copy } from '../../utils/general.ts'
import { jsonPrune } from '../../utils/json.ts'
import {
    BaseCustomEvent,
    CustomEventConstructor,
    CustomEventConstructorTrack,
    CustomEventSubclassFields,
    getDataProp,
} from './base.ts'
import { AnimatorProperty } from '../../types/mod.ts'

export class SetMaterialProperty extends BaseCustomEvent<
    never,
    BeatmapInterfaces.SetMaterialProperty
> {
    /**
     * Animate objects on a track across their lifespan.
     */
    constructor(
        params: CustomEventConstructor<SetMaterialProperty>,
    ) {
        super(params)
        this.type = 'SetMaterialProperty'
        this.asset = params.asset ?? ''
        if (params.duration) this.duration = params.duration
        if (params.easing) this.easing = params.easing
        if (params.properties) this.properties = params.properties
    }

    asset: string
    duration?: number
    easing?: EASE
    properties: MaterialProperty[] = []

    /** Push this event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        getActiveDifficulty().customEvents.setMaterialPropertyEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: BeatmapInterfaces.SetMaterialProperty, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(
        json:
            | BeatmapInterfaces.SetMaterialProperty
            | never,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<SetMaterialProperty>

        if (!v3) throw 'SetMaterialProperty is only supported in V3!'

        const obj = json as BeatmapInterfaces.SetMaterialProperty

        const params = {
            asset: getDataProp(obj.d, 'asset'),
            duration: getDataProp(obj.d, 'duration'),
            easing: getDataProp(obj.d, 'easing'),
            properties: getDataProp(obj.d, 'properties'),
        } as Params

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }

    toJson(v3: true, prune?: boolean): BeatmapInterfaces.SetMaterialProperty
    toJson(v3: false, prune?: boolean): never
    toJson(
        v3: boolean,
        prune = true,
    ) {
        if (!v3) throw 'SetMaterialProperty is only supported in V3!'

        const output = {
            b: this.beat,
            d: {
                asset: this.asset,
                duration: this.duration,
                easing: this.easing,
                ...this.data,
                ...this.properties,
            },
            t: 'SetMaterialProperty',
        } satisfies BeatmapInterfaces.SetMaterialProperty
        return prune ? jsonPrune(output) : output
    }
}

export class SetGlobalProperty extends BaseCustomEvent<
    never,
    BeatmapInterfaces.SetGlobalProperty
> {
    /**
     * Animate objects on a track across their lifespan.
     */
    constructor(
        params: CustomEventConstructor<SetGlobalProperty>,
    ) {
        super(params)
        this.type = 'SetGlobalProperty'
        if (params.duration) this.duration = params.duration
        if (params.easing) this.easing = params.easing
        if (params.properties) this.properties = params.properties
    }

    duration?: number
    easing?: EASE
    properties: MaterialProperty[] = []

    /** Push this event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        getActiveDifficulty().customEvents.setGlobalPropertyEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: BeatmapInterfaces.SetGlobalProperty, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(
        json:
            | BeatmapInterfaces.SetGlobalProperty
            | never,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<SetGlobalProperty>

        if (!v3) throw 'SetGlobalProperty is only supported in V3!'

        const obj = json as BeatmapInterfaces.SetGlobalProperty

        const params = {
            duration: getDataProp(obj.d, 'duration'),
            easing: getDataProp(obj.d, 'easing'),
            properties: getDataProp(obj.d, 'properties'),
        } as Params

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }

    toJson(v3: true, prune?: boolean): BeatmapInterfaces.SetGlobalProperty
    toJson(v3: false, prune?: boolean): never
    toJson(
        v3: boolean,
        prune = true,
    ) {
        if (!v3) throw 'SetGlobalProperty is only supported in V3!'

        const output = {
            b: this.beat,
            d: {
                duration: this.duration,
                easing: this.easing,
                ...this.data,
                ...this.properties,
            },
            t: 'SetGlobalProperty',
        } satisfies BeatmapInterfaces.SetGlobalProperty
        return prune ? jsonPrune(output) : output
    }
}

export class Blit extends BaseCustomEvent<
    never,
    BeatmapInterfaces.Blit
> {
    /**
     * Animate objects on a track across their lifespan.
     */
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

    asset?: string
    priority?: number
    pass?: number
    source?: string
    destination?: string
    duration?: number
    easing?: EASE
    properties?: MaterialProperty[]

    /** Push this event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        getActiveDifficulty().customEvents.blitEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: BeatmapInterfaces.Blit, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(
        json:
            | BeatmapInterfaces.Blit
            | never,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<Blit>

        if (!v3) throw 'Blit is only supported in V3!'

        const obj = json as BeatmapInterfaces.Blit

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

    toJson(v3: true, prune?: boolean): BeatmapInterfaces.Blit
    toJson(v3: false, prune?: boolean): never
    toJson(
        v3: boolean,
        prune = true,
    ) {
        if (!v3) throw 'Blit is only supported in V3!'

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
                ...this.properties,
            },
            t: 'Blit',
        } satisfies BeatmapInterfaces.Blit
        return prune ? jsonPrune(output) : output
    }
}

export class DeclareCullingTexture extends BaseCustomEvent<
    never,
    BeatmapInterfaces.DeclareCullingTexture
> {
    /**
     * Animate objects on a track across their lifespan.
     */
    constructor(
        params: CustomEventConstructorTrack<DeclareCullingTexture>,
    ) {
        super(params)
        this.type = 'DeclareCullingTexture'
        this.id = params.id ?? ''
        this.track = params.track instanceof Track
            ? params.track
            : new Track(params.track)
        if (params.whitelist) this.whitelist = params.whitelist
        if (params.depthTexture) this.depthTexture = params.depthTexture
    }

    id: string
    track: Track
    whitelist?: boolean
    depthTexture?: boolean

    /** Push this event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        getActiveDifficulty().customEvents.declareCullingTextureEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: BeatmapInterfaces.DeclareCullingTexture, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(
        json:
            | BeatmapInterfaces.DeclareCullingTexture
            | never,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<DeclareCullingTexture>

        if (!v3) throw 'DeclareCullingTexture is only supported in V3!'

        const obj = json as BeatmapInterfaces.DeclareCullingTexture

        const params = {
            depthTexture: getDataProp(obj.d, 'depthTexture'),
            id: getDataProp(obj.d, 'id'),
            track: new Track(getDataProp(obj.d, 'track')),
            whitelist: getDataProp(obj.d, 'whitelist'),
        } as Params

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }

    toJson(v3: true, prune?: boolean): BeatmapInterfaces.DeclareCullingTexture
    toJson(v3: false, prune?: boolean): never
    toJson(
        v3: boolean,
        prune = true,
    ) {
        if (!v3) throw 'DeclareCullingTexture is only supported in V3!'

        const output = {
            b: this.beat,
            d: {
                id: this.id,
                track: this.track.value ?? '',
                depthTexture: this.depthTexture,
                whitelist: this.whitelist,
                ...this.data,
            },
            t: 'DeclareCullingTexture',
        } satisfies BeatmapInterfaces.DeclareCullingTexture
        return prune ? jsonPrune(output) : output
    }
}

export class DeclareRenderTexture extends BaseCustomEvent<
    never,
    BeatmapInterfaces.DeclareRenderTexture
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

    id: string
    xRatio?: number
    yRatio?: number
    width?: number
    height?: number
    colorFormat?: RENDER_TEX
    filterMode?: TEX_FILTER

    /** Push this event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        getActiveDifficulty().customEvents.declareRenderTextureEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: BeatmapInterfaces.DeclareRenderTexture, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(
        json:
            | BeatmapInterfaces.DeclareRenderTexture
            | never,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<DeclareRenderTexture>

        if (!v3) throw 'DeclareRenderTexture is only supported in V3!'

        const obj = json as BeatmapInterfaces.DeclareRenderTexture

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

    toJson(v3: true, prune?: boolean): BeatmapInterfaces.DeclareRenderTexture
    toJson(v3: false, prune?: boolean): never
    toJson(
        v3: boolean,
        prune = true,
    ) {
        if (!v3) throw 'DeclareRenderTexture is only supported in V3!'

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
        } satisfies BeatmapInterfaces.DeclareRenderTexture
        return prune ? jsonPrune(output) : output
    }
}

export class DestroyTexture extends BaseCustomEvent<
    never,
    BeatmapInterfaces.DestroyTexture
> {
    /**
     * Animate objects on a track across their lifespan.
     */
    constructor(
        params: CustomEventConstructorTrack<
            DestroyTexture,
            { id?: TrackValue | Track }
        >,
    ) {
        super(params)
        this.type = 'DestroyTexture'
        this.id = params.id instanceof Track ? params.id : new Track(params.id)
    }

    id: Track

    /** Push this event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        getActiveDifficulty().customEvents.destroyTextureEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: BeatmapInterfaces.DestroyTexture, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(
        json:
            | BeatmapInterfaces.DestroyTexture
            | never,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<DestroyTexture>

        if (!v3) throw 'DestroyTexture is only supported in V3!'

        const obj = json as BeatmapInterfaces.DestroyTexture

        const params = {
            id: new Track(getDataProp(obj.d, 'id')),
        } as Params

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }

    toJson(v3: true, prune?: boolean): BeatmapInterfaces.DestroyTexture
    toJson(v3: false, prune?: boolean): never
    toJson(
        v3: boolean,
        prune = true,
    ) {
        if (!v3) throw 'DestroyTexture is only supported in V3!'

        const output = {
            b: this.beat,
            d: {
                id: this.id.value ?? '',
                ...this.data,
            },
            t: 'DestroyTexture',
        } satisfies BeatmapInterfaces.DestroyTexture
        return prune ? jsonPrune(output) : output
    }
}

export class InstantiatePrefab extends BaseCustomEvent<
    never,
    BeatmapInterfaces.InstantiatePrefab
> {
    /**
     * Animate objects on a track across their lifespan.
     */
    constructor(
        params: CustomEventConstructor<InstantiatePrefab>,
    ) {
        super(params)
        this.type = 'InstantiatePrefab'
        this.asset = params.asset ?? ''
        if (params.id) this.id = params.id
        if (params.track) this.track = params.track
        if (params.position) this.position = params.position
        if (params.localPosition) this.localPosition = params.localPosition
        if (params.rotation) this.rotation = params.rotation
        if (params.localRotation) this.localRotation = params.localRotation
        if (params.scale) this.scale = params.scale
    }

    asset: string
    id?: string
    track?: string
    position?: Vec3
    localPosition?: Vec3
    rotation?: Vec3
    localRotation?: Vec3
    scale?: Vec3

    /** Push this event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        getActiveDifficulty().customEvents.instantiatePrefabEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: BeatmapInterfaces.InstantiatePrefab, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(
        json:
            | BeatmapInterfaces.InstantiatePrefab
            | never,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<InstantiatePrefab>

        if (!v3) throw 'InstantiatePrefab is only supported in V3!'

        const obj = json as BeatmapInterfaces.InstantiatePrefab

        const params = {
            asset: getDataProp(obj.d, 'asset'),
            id: getDataProp(obj.d, 'id'),
            localPosition: getDataProp(obj.d, 'localPosition'),
            localRotation: getDataProp(obj.d, 'localRotation'),
            position: getDataProp(obj.d, 'position'),
            rotation: getDataProp(obj.d, 'rotation'),
            scale: getDataProp(obj.d, 'scale'),
            track: getDataProp(obj.d, 'track'),
        } as Params

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }

    toJson(v3: true, prune?: boolean): BeatmapInterfaces.InstantiatePrefab
    toJson(v3: false, prune?: boolean): never
    toJson(
        v3: boolean,
        prune = true,
    ) {
        if (!v3) throw 'InstantiatePrefab is only supported in V3!'

        const output = {
            b: this.beat,
            d: {
                asset: this.asset,
                id: this.id,
                localPosition: this.localPosition,
                localRotation: this.localRotation,
                position: this.position,
                rotation: this.rotation,
                scale: this.scale,
                track: this.track,
                ...this.data,
            },
            t: 'InstantiatePrefab',
        } satisfies BeatmapInterfaces.InstantiatePrefab
        return prune ? jsonPrune(output) : output
    }
}

export class DestroyPrefab extends BaseCustomEvent<
    never,
    BeatmapInterfaces.DestroyPrefab
> {
    /**
     * Animate objects on a track across their lifespan.
     */
    constructor(
        params: CustomEventConstructorTrack<
            DestroyPrefab,
            { id?: TrackValue | Track }
        >,
    ) {
        super(params)
        this.type = 'DestroyPrefab'
        this.id = params.id instanceof Track ? params.id : new Track(params.id)
    }

    id: Track

    /** Push this event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        getActiveDifficulty().customEvents.destroyPrefabEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: BeatmapInterfaces.DestroyPrefab, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(
        json:
            | BeatmapInterfaces.DestroyPrefab
            | never,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<DestroyPrefab>

        if (!v3) throw 'DestroyPrefab is only supported in V3!'

        const obj = json as BeatmapInterfaces.DestroyPrefab

        const params = {
            id: new Track(getDataProp(obj.d, 'id')),
        } as Params

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }

    toJson(v3: true, prune?: boolean): BeatmapInterfaces.DestroyPrefab
    toJson(v3: false, prune?: boolean): never
    toJson(
        v3: boolean,
        prune = true,
    ) {
        if (!v3) throw 'DestroyPrefab is only supported in V3!'

        const output = {
            b: this.beat,
            d: {
                id: this.id.value ?? '',
                ...this.data,
            },
            t: 'DestroyPrefab',
        } satisfies BeatmapInterfaces.DestroyPrefab
        return prune ? jsonPrune(output) : output
    }
}

export class SetAnimatorProperty extends BaseCustomEvent<
    never,
    BeatmapInterfaces.SetAnimatorProperty
> {
    /**
     * Animate objects on a track across their lifespan.
     */
    constructor(
        params: CustomEventConstructor<SetAnimatorProperty>,
    ) {
        super(params)
        this.type = 'SetAnimatorProperty'
        this.id = params.id ?? ''
        if (params.duration) this.duration = params.duration
        if (params.easing) this.easing = params.easing
        if (params.properties) this.properties = params.properties
    }

    id: string
    duration?: number
    easing?: EASE
    properties: AnimatorProperty[] = []

    /** Push this event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        getActiveDifficulty().customEvents.setAnimatorPropertyEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: BeatmapInterfaces.SetAnimatorProperty, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(
        json:
            | BeatmapInterfaces.SetAnimatorProperty
            | never,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<SetAnimatorProperty>

        if (!v3) throw 'SetAnimatorProperty is only supported in V3!'

        const obj = json as BeatmapInterfaces.SetAnimatorProperty

        const params = {
            id: getDataProp(obj.d, 'id'),
            duration: getDataProp(obj.d, 'duration'),
            easing: getDataProp(obj.d, 'easing'),
            properties: getDataProp(obj.d, 'properties'),
        } as Params

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }

    toJson(v3: true, prune?: boolean): BeatmapInterfaces.SetAnimatorProperty
    toJson(v3: false, prune?: boolean): never
    toJson(
        v3: boolean,
        prune = true,
    ) {
        if (!v3) throw 'SetAnimatorProperty is only supported in V3!'

        const output = {
            b: this.beat,
            d: {
                id: this.id,
                duration: this.duration,
                easing: this.easing,
                ...this.data,
                ...this.properties,
            },
            t: 'SetAnimatorProperty',
        } satisfies BeatmapInterfaces.SetAnimatorProperty
        return prune ? jsonPrune(output) : output
    }
}

export class SetCameraProperty extends BaseCustomEvent<
    never,
    BeatmapInterfaces.SetCameraProperty
> {
    /**
     * Animate objects on a track across their lifespan.
     */
    constructor(
        params: CustomEventConstructor<SetCameraProperty>,
    ) {
        super(params)
        this.type = 'SetCameraProperty'
        this.depthTextureMode = params.depthTextureMode ?? []
    }

    depthTextureMode: DEPTH_TEX_MODE[]

    /** Push this event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        getActiveDifficulty().customEvents.setCameraPropertyEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: BeatmapInterfaces.SetCameraProperty, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(
        json:
            | BeatmapInterfaces.SetCameraProperty
            | never,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<SetCameraProperty>

        if (!v3) throw 'SetCameraProperty is only supported in V3!'

        const obj = json as BeatmapInterfaces.SetCameraProperty

        const params = {
            depthTextureMode: getDataProp(obj.d, 'depthTextureMode'),
        } as Params

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }

    toJson(v3: true, prune?: boolean): BeatmapInterfaces.SetCameraProperty
    toJson(v3: false, prune?: boolean): never
    toJson(
        v3: boolean,
        prune = true,
    ) {
        if (!v3) throw 'SetCameraProperty is only supported in V3!'

        const output = {
            b: this.beat,
            d: {
                depthTextureMode: this.depthTextureMode,
                ...this.data,
            },
            t: 'SetCameraProperty',
        } satisfies BeatmapInterfaces.SetCameraProperty
        return prune ? jsonPrune(output) : output
    }
}

export class AssignTrackPrefab extends BaseCustomEvent<
    never,
    BeatmapInterfaces.AssignTrackPrefab
> {
    /**
     * Animate objects on a track across their lifespan.
     */
    constructor(
        params: CustomEventConstructor<AssignTrackPrefab>,
    ) {
        super(params)
        this.type = 'AssignTrackPrefab'
        this.track = params.track ?? ''
        this.note = params.note ?? ''
    }

    track: string
    note: string

    /** Push this event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        getActiveDifficulty().customEvents.assignTrackPrefabEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: BeatmapInterfaces.AssignTrackPrefab, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(
        json:
            | BeatmapInterfaces.AssignTrackPrefab
            | never,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<AssignTrackPrefab>

        if (!v3) throw 'AssignTrackPrefab is only supported in V3!'

        const obj = json as BeatmapInterfaces.AssignTrackPrefab

        const params = {
            note: getDataProp(obj.d, 'note'),
            track: getDataProp(obj.d, 'track'),
        } as Params

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }

    toJson(v3: true, prune?: boolean): BeatmapInterfaces.AssignTrackPrefab
    toJson(v3: false, prune?: boolean): never
    toJson(
        v3: boolean,
        prune = true,
    ) {
        if (!v3) throw 'AssignTrackPrefab is only supported in V3!'

        const output = {
            b: this.beat,
            d: {
                note: this.note,
                track: this.track,
                ...this.data,
            },
            t: 'AssignTrackPrefab',
        } satisfies BeatmapInterfaces.AssignTrackPrefab
        return prune ? jsonPrune(output) : output
    }
}

export class SetRenderSetting extends BaseCustomEvent<
    never,
    BeatmapInterfaces.SetRenderSetting
> {
    /**
     * Animate objects on a track across their lifespan.
     */
    constructor(
        params: CustomEventConstructor<SetRenderSetting>,
    ) {
        super(params)
        this.type = 'SetRenderSetting'
        this.settings = params.settings ?? {}
        if (params.duration) this.duration = params.duration
        if (params.easing) this.easing = params.easing
    }

    duration?: number
    easing?: EASE
    settings: Partial<RENDER_SETTING>

    /** Push this event to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        getActiveDifficulty().customEvents.setRenderSettingEvents.push(
            clone ? copy(this) : this,
        )
        return this
    }

    fromJson(json: BeatmapInterfaces.SetRenderSetting, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(
        json:
            | BeatmapInterfaces.SetRenderSetting
            | never,
        v3: boolean,
    ): this {
        type Params = CustomEventSubclassFields<SetRenderSetting>

        if (!v3) throw 'SetRenderSetting is only supported in V3!'

        const obj = json as BeatmapInterfaces.SetRenderSetting

        const params = {
            duration: getDataProp(obj.d, 'duration'),
            easing: getDataProp(obj.d, 'easing'),
            settings: obj.d,
        } as Params

        obj.d = {}

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }

    toJson(v3: true, prune?: boolean): BeatmapInterfaces.SetRenderSetting
    toJson(v3: false, prune?: boolean): never
    toJson(
        v3: boolean,
        prune = true,
    ) {
        if (!v3) throw 'SetRenderSetting is only supported in V3!'

        const output = {
            b: this.beat,
            d: {
                duration: this.duration,
                easing: this.easing,
                ...this.settings,
                ...this.data,
            },
            t: 'SetRenderSetting',
        } satisfies BeatmapInterfaces.SetRenderSetting
        return prune ? jsonPrune(output) : output
    }
}
