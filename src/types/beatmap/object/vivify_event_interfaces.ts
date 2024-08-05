import {
    COLOR_FORMAT,
    DEPTH_TEX_MODE, LOAD_MODE,
    RENDER_SETTING,
    TEX_FILTER_MODE
} from '../../vivify/setting.ts'
import {TrackValue} from "../../animation/track.ts";
import {EASE} from "../../animation/easing.ts";
import {Vec3} from "../../math/vector.ts";
import {MaterialProperty} from "../../vivify/material.ts";
import {AnimatorProperty} from "../../vivify/animator.ts";

/** JSON properties for SetMaterialProperty events */
export interface ISetMaterialProperty {
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
export interface ISetGlobalProperty {
    b: number
    t: 'SetGlobalProperty'
    d: {
        duration?: number
        easing?: EASE
        properties?: MaterialProperty[]
    }
}

/** JSON properties for Blit events */
export interface IBlit {
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
export interface IDeclareCullingTexture {
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
export interface IDeclareRenderTexture {
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
export interface IDestroyTexture {
    b: number
    t: 'DestroyTexture'
    d: {
        id: TrackValue
    }
}

/** JSON properties for InstantiatePrefab events */
export interface IInstantiatePrefab {
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
export interface IDestroyPrefab {
    b: number
    t: 'DestroyPrefab'
    d: {
        id: TrackValue
    }
}

/** JSON properties for SetAnimatorProperty events */
export interface ISetAnimatorProperty {
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
export interface ISetCameraProperty {
    b: number
    t: 'SetCameraProperty'
    d: {
        depthTextureMode: DEPTH_TEX_MODE[]
    }
}

/** JSON properties for AssignObjectPrefab events */
export interface IAssignObjectPrefab {
    b: number
    t: 'AssignObjectPrefab'
    d: {
        loadMode?: LOAD_MODE
        colorNotes?: {
            /** The track to replace this prefab on. */
            track: string
            /** The path to the prefab to replace the model for arrow notes. */
            asset?: string | null
            /** The path to the prefab to replace debris. */
            debrisAsset?: string | null
            /** The path to the prefab to replace any direction (dot) note models. */
            anyDirectionAsset?: string | null
        }
        bombNotes?: {
            /** The track to replace this prefab on. */
            track: string
            /** The path to the prefab to replace the model. */
            asset?: string | null
        }
        burstSliders?: {
            /** The track to replace this prefab on. */
            track: string
            /** The path to the prefab to replace the model. */
            asset?: string | null
            /** The path to the prefab to replace debris. */
            debrisAsset?: string | null
        }
        burstSliderElements?: {
            /** The track to replace this prefab on. */
            track: string
            /** The path to the prefab to replace the model. */
            asset?: string | null
            /** The path to the prefab to replace debris. */
            debrisAsset?: string | null
        }
        saber?: {
            /** Determines which sabers should be effected. */
            type: 'Left' | 'Right' | 'Both'
            /** The path to the prefab to replace the model. */
            asset?: string | null
            /** The path to the material to go on this saber's trails. */
            trailAsset?: string
            /** The length of this saber's trails. */
            trailDuration?: number
            /** The tip of the saber. */
            trailTopPos?: Vec3
            /** The bottom the saber. */
            trailBottomPos?: Vec3
        }
    }
}

/** JSON properties for SetRenderSetting events */
export interface ISetRenderSetting {
    b: number
    t: 'SetRenderSetting'
    d: {
        duration?: number
        easing?: EASE
    } & Partial<RENDER_SETTING>
}
