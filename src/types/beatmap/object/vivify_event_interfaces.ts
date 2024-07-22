import {
    COLOR_FORMAT,
    DEPTH_TEX_MODE,
    RENDER_SETTING,
    TEX_FILTER_MODE
} from '../../vivify/setting.ts'
import {TrackValue} from "../../animation/track.ts";
import {EASE} from "../../animation/easing.ts";
import {Vec3} from "../../math/vector.ts";
import {MaterialProperty} from "../../vivify/material.ts";
import {AnimatorProperty} from "../../vivify/animator.ts";

/** JSON properties for SetMaterialProperty events */
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

/** JSON properties for SetGlobalProperty events */
export interface SetGlobalProperty {
    b: number
    t: 'SetGlobalProperty'
    d: {
        duration?: number
        easing?: EASE
        properties?: MaterialProperty[]
    }
}

/** JSON properties for Blit events */
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

/** JSON properties for DeclareCullingTexture events */
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

/** JSON properties for DeclareRenderTexture events */
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

/** JSON properties for DestroyTexture events */
export interface DestroyTexture {
    b: number
    t: 'DestroyTexture'
    d: {
        id: TrackValue
    }
}

/** JSON properties for InstantiatePrefab events */
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

/** JSON properties for DestroyPrefab events */
export interface DestroyPrefab {
    b: number
    t: 'DestroyPrefab'
    d: {
        id: TrackValue
    }
}

/** JSON properties for SetAnimatorProperty events */
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

/** JSON properties for SetCameraProperty events */
export interface SetCameraProperty {
    b: number
    t: 'SetCameraProperty'
    d: {
        depthTextureMode: DEPTH_TEX_MODE[]
    }
}

/** JSON properties for AssignTrackPrefab events */
export interface AssignTrackPrefab {
    b: number
    t: 'AssignTrackPrefab'
    d: {
        track: string
        colorNotes?: string
        bombNotes?: string
        burstSliders?: string
        burstSliderElements?: string
        colorNoteDebris?: string
        burstSliderDebris?: string
        burstSliderElementDebris?: string
    }
}

/** JSON properties for SetRenderSetting events */
export interface SetRenderSetting {
    b: number
    t: 'SetRenderSetting'
    d: {
        duration?: number
        easing?: EASE
    } & Partial<RENDER_SETTING>
}
