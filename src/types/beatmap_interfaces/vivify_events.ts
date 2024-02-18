import { AnimatorProperty } from '../../mod.ts'
import { Vec3 } from '../../mod.ts'
import { TrackValue } from '../animation_types.ts'
import { RENDER_TEX, TEX_FILTER } from '../mod.ts'
import { DEPTH_TEX_MODE, MaterialProperty, RENDER_SETTING } from '../vivify_types.ts'

export interface SetMaterialProperty {
    b: number
    t: 'SetMaterialProperty'
    d: {
        asset: string
        duration?: number
        easing?: string
        properties?: MaterialProperty[]
    }
}

export interface SetGlobalProperty {
    b: number
    t: 'SetGlobalProperty'
    d: {
        asset: string
        duration?: number
        easing?: string
        properties?: MaterialProperty[]
    }
}

export interface Blit {
    b: number
    t: 'Blit'
    d: {
        asset?: string
        priority?: number
        pass?: number
        source?: string
        destination?: string
        duration?: number
        easing?: string
        properties?: MaterialProperty[]
    }
}

export interface DeclareCullingTexture {
    b: number
    t: 'DeclareCullingTexture'
    d: {
        id: string
        track: TrackValue
        whitelist?: boolean
        depthTexture?: boolean
    }
}

export interface DeclareRenderTexture {
    b: number
    t: 'DeclareRenderTexture'
    d: {
        id: string
        xRatio?: number
        yRatio?: number
        width?: number
        height?: number
        colorFormat?: RENDER_TEX
        filterMode?: TEX_FILTER
    }
}

export interface DestroyTexture {
    b: number
    t: 'DestroyTexture'
    d: {
        id: TrackValue
    }
}

export interface InstantiatePrefab {
    b: number
    t: 'InstantiatePrefab'
    d: {
        asset: string
        id?: string
        track?: string
        position?: Vec3
        localPosition?: Vec3
        rotation?: Vec3
        localRotation?: Vec3
        scale?: Vec3
    }
}

export interface DestroyPrefab {
    b: number
    t: 'DestroyPrefab'
    d: {
        id: TrackValue
    }
}

export interface SetAnimatorProperty {
    b: number
    t: 'SetAnimatorProperty'
    d: {
        asset: string
        duration?: number
        easing?: string
        properties?: AnimatorProperty[]
    }
}

export interface SetCameraProperty {
    b: number
    t: 'SetCameraProperty'
    d: {
        depthTextureMode: DEPTH_TEX_MODE[]
    }
}

export interface AssignTrackPrefab {
    b: number
    t: 'AssignTrackPrefab'
    d: {
        track: string
        note: string
    }
}

export interface SetRenderSetting {
    b: number
    t: 'SetRenderSetting'
    d: {
        duration?: number
        easing?: string
    } & RENDER_SETTING
}