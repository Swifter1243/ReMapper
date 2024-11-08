import {
    CAMERA_CLEAR_FLAGS,
    COLOR_FORMAT,
    DEPTH_TEX_MODE, LOAD_MODE, QUALITY_SETTINGS,
    RENDERING_SETTINGS,
    TEX_FILTER_MODE, XR_SETTINGS
} from '../../vivify/setting.ts'
import {TrackValue} from "../../animation/track.ts";
import {EASE} from "../../animation/easing.ts";
import {ColorVec, Vec3} from "../../math/vector.ts";
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

/** JSON properties for CreateCamera events */
export interface ICreateCamera {
    b: number
    t: 'CreateCamera'
    d: {
        id: string
        texture?: string,
        depthTexture?: string
    } & CameraProperties
}

/** JSON properties for CreateScreenTexture events */
export interface ICreateScreenTexture {
    b: number
    t: 'CreateScreenTexture'
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

/** JSON properties for InstantiatePrefab events */
export interface IInstantiatePrefab {
    b: number
    t: 'InstantiatePrefab'
    d: {
        asset: string
        id?: string
        track?: TrackValue
        position?: Vec3
        localPosition?: Vec3
        rotation?: Vec3
        localRotation?: Vec3
        scale?: Vec3
    }
}

/** JSON properties for DestroyObject events */
export interface IDestroyObject {
    b: number
    t: 'DestroyObject'
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
    d: CameraProperties
}

/** Properties to set on cameras. Used by {@link CreateCamera} and {@link SetCameraProperty}. */
export type CameraProperties = {
    /** Sets the depth texture mode on the camera. */
    depthTextureMode?: DEPTH_TEX_MODE[]
    /** Determines what to clear when rendering the camera.  */
    clearFlags?: CAMERA_CLEAR_FLAGS
    /** Color to clear the screen with. Only used with the `SolidColor` clear flag. */
    backgroundColor?: ColorVec
    /** Sets a culling mask where the selected tracks are culled */
    culling?: CullingMask
    /** Enable or disable the bloom pre pass effect. */
    bloomPrePass?: boolean
    /** Enable or disable the main bloom effect. */
    mainEffect?: boolean
}

/** Culling mask for cameras to cull tracks. */
export type CullingMask = {
    /** Name(s) of your track(s). Everything on the track(s) will be added to this mask. */
    track: string | string[]
    /** When true, will cull everything but the selected tracks. Defaults to false. */
    whitelist?: boolean
}

/** JSON properties for AssignObjectPrefab events */
export interface IAssignObjectPrefab {
    b: number
    t: 'AssignObjectPrefab'
    d: {
        loadMode?: LOAD_MODE
        colorNotes?: {
            /** The track to replace this prefab on. */
            track: string | string[]
            /** File path to the desired prefab. Only applies to directional notes. Sets properties _Color and _Cutout. */
            asset?: string | null
            /** Applies to cut debris. Sets properties _Cutout, _Color, _CutPlane, and _CutoutTexOffset. */
            debrisAsset?: string | null
            /** Only applies to dot notes. Sets same properties as directional notes. */
            anyDirectionAsset?: string | null
        }
        bombNotes?: {
            /** File path to the desired prefab. */
            track: string | string[]
            /** File path to the desired prefab. Sets properties _Color and _Cutout. */
            asset?: string | null
        }
        burstSliders?: {
            /** The track to replace this prefab on. */
            track: string | string[]
            /** File path to the desired prefab. Only applies to chain heads. Sets properties _Color and _Cutout. */
            asset?: string | null
            /** Applies to cut debris. Sets properties _Cutout, _Color, _CutPlane, and _CutoutTexOffset. */
            debrisAsset?: string | null
        }
        burstSliderElements?: {
            /** The track to replace this prefab on. */
            track: string | string[]
            /** File path to the desired prefab. Only applies to chain links. Sets properties _Color and _Cutout. */
            asset?: string | null
            /** Applies to cut debris. Sets properties _Cutout, _Color, _CutPlane, and _CutoutTexOffset.  */
            debrisAsset?: string | null
        }
        saber?: {
            /** Determines which sabers should be effected. */
            type: 'Left' | 'Right' | 'Both'
            /** File path to the desired prefab. Sets property _Color.*/
            asset?: string | null
            /** File path to the material to replace the saber. Sets property _Color and sets vertex colors for a gradient. */
            trailAsset?: string
            /** Age of most distant segment of trail in seconds. Defaults to 0.4 */
            trailDuration?: number
            /** Vector3 position of the top of the trail. Defaults to [0, 0, 1] */
            trailTopPos?: Vec3
            /** Vector3 position of the top of the trail. Defaults to [0, 0, 0] */
            trailBottomPos?: Vec3
            /** Saber position snapshots taken per second. Defaults to 50 */
            trailSamplingFrequency?: number
            /** Segments count in final trail mesh. Defaults to 60 */
            trailGranularity?: number
        }
    }
}

/** JSON properties for SetRenderingSettings events */
export interface ISetRenderingSettings {
    b: number
    t: 'SetRenderingSettings'
    d: {
        duration?: number
        easing?: EASE,
        renderSettings?: Partial<RENDERING_SETTINGS>,
        qualitySettings?: Partial<QUALITY_SETTINGS>,
        xrSettings?: Partial<XR_SETTINGS>
    }
}
