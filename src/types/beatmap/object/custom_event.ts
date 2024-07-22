import {
    AbstractCustomEvent,
    AnimateComponent,
    AnimateTrack,
    AssignPathAnimation,
    AssignPlayerToTrack,
    AssignTrackParent,
    AssignTrackPrefab,
    BaseCustomEvent,
    Blit,
    DeclareCullingTexture,
    DeclareRenderTexture,
    DestroyPrefab,
    DestroyTexture,
    InstantiatePrefab,
    SetAnimatorProperty,
    SetCameraProperty,
    SetGlobalProperty,
    SetMaterialProperty,
    SetRenderSetting
} from '../../../internals/beatmap/object/custom_event/mod.ts'

/** All custom event types. */
export type CustomEvent = BaseCustomEvent

/** Wrapper for custom light_event arrays in a beatmap. */
export interface BeatmapCustomEvents {
    animateComponentEvents: AnimateComponent[]
    animateTrackEvents: AnimateTrack[]
    assignPathAnimationEvents: AssignPathAnimation[]
    assignPlayerTrackEvents: AssignPlayerToTrack[]
    assignTrackParentEvents: AssignTrackParent[]

    setMaterialPropertyEvents: SetMaterialProperty[]
    setGlobalPropertyEvents: SetGlobalProperty[]
    blitEvents: Blit[]
    declareCullingTextureEvents: DeclareCullingTexture[]
    declareRenderTextureEvents: DeclareRenderTexture[]
    destroyTextureEvents: DestroyTexture[]
    instantiatePrefabEvents: InstantiatePrefab[]
    destroyPrefabEvents: DestroyPrefab[]
    setAnimatorPropertyEvents: SetAnimatorProperty[]
    setCameraPropertyEvents: SetCameraProperty[]
    assignTrackPrefabEvents: AssignTrackPrefab[]
    setRenderSettingEvents: SetRenderSetting[]

    abstractCustomEvents: AbstractCustomEvent[]
}