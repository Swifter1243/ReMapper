import { AnimatorProperty } from '../../mod.ts'
import { Vec3 } from '../../mod.ts'
import { EASE, TrackValue } from '../animation_types.ts'
import { COLOR_FORMAT, TEX_FILTER_MODE } from '../mod.ts'
import { DEPTH_TEX_MODE, MaterialProperty, RENDER_SETTING } from '../vivify_types.ts'

/** JSON data for SetMaterialProperty events */
export interface SetMaterialProperty {
    b: number
    t: 'SetMaterialProperty'
    d: {
        asset: string
        duration?: number
        easing?: EASE
        properties?: MaterialProperty[]
    }
}

/** JSON data for SetGlobalProperty events */
export interface SetGlobalProperty {
    b: number
    t: 'SetGlobalProperty'
    d: {
        duration?: number
        easing?: EASE
        properties?: MaterialProperty[]
    }
}

/** JSON data for Blit events */
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
        easing?: EASE
        properties?: MaterialProperty[]
    }
}

/** JSON data for DeclareCullingTexture events */
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

/** JSON data for DeclareRenderTexture events */
export interface DeclareRenderTexture {
    b: number
    t: 'DeclareRenderTexture'
    d: {
        id: string
        xRatio?: number
        yRatio?: number
        width?: number
        height?: number
        colorFormat?: COLOR_FORMAT
        filterMode?: TEX_FILTER_MODE
    }
}

/** JSON data for DestroyTexture events */
export interface DestroyTexture {
    b: number
    t: 'DestroyTexture'
    d: {
        id: TrackValue
    }
}

/** JSON data for InstantiatePrefab events */
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

/** JSON data for DestroyPrefab events */
export interface DestroyPrefab {
    b: number
    t: 'DestroyPrefab'
    d: {
        id: TrackValue
    }
}

/** JSON data for SetAnimatorProperty events */
export interface SetAnimatorProperty {
    b: number
    t: 'SetAnimatorProperty'
    d: {
        id: string
        duration?: number
        easing?: string
        properties?: AnimatorProperty[]
    }
}

/** JSON data for SetCameraProperty events */
export interface SetCameraProperty {
    b: number
    t: 'SetCameraProperty'
    d: {
        depthTextureMode: DEPTH_TEX_MODE[]
    }
}

/** JSON data for AssignTrackPrefab events */
export interface AssignTrackPrefab {
    b: number
    t: 'AssignTrackPrefab'
    d: {
        track: string
        note: string
    }
}

/** JSON data for SetRenderSetting events */
export interface SetRenderSetting {
    b: number
    t: 'SetRenderSetting'
    d: {
        duration?: number
        easing?: EASE
    } & Partial<RENDER_SETTING>
}