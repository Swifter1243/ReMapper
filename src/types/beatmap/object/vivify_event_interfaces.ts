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
    d: {
        depthTextureMode?: DEPTH_TEX_MODE[]
        clearFlags?: CAMERA_CLEAR_FLAGS
        backgroundColor?: ColorVec
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
