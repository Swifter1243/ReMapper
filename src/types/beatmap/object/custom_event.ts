import {AbstractCustomEvent} from "../../../internals/beatmap/object/custom_event/base.ts";
import {AnimateComponent} from "../../../internals/beatmap/object/custom_event/chroma.ts";
import {AnimateTrack} from "../../../internals/beatmap/object/custom_event/heck.ts";
import {
    AssignPathAnimation,
    AssignPlayerToTrack,
    AssignTrackParent
} from "../../../internals/beatmap/object/custom_event/noodle_extensions.ts";
import {SetMaterialProperty} from "../../../internals/beatmap/object/custom_event/vivify/set_material_property.ts";
import {SetGlobalProperty} from "../../../internals/beatmap/object/custom_event/vivify/set_global_property.ts";
import {Blit} from "../../../internals/beatmap/object/custom_event/vivify/blit.ts";
import {DeclareCullingTexture} from "../../../internals/beatmap/object/custom_event/vivify/declare_culling_texture.ts";
import {DeclareRenderTexture} from "../../../internals/beatmap/object/custom_event/vivify/declare_render_texture.ts";
import {DestroyTexture} from "../../../internals/beatmap/object/custom_event/vivify/destroy_texture.ts";
import {InstantiatePrefab} from "../../../internals/beatmap/object/custom_event/vivify/instantiate_prefab.ts";
import {DestroyPrefab} from "../../../internals/beatmap/object/custom_event/vivify/destroy_prefab.ts";
import {SetAnimatorProperty} from "../../../internals/beatmap/object/custom_event/vivify/set_animator_property.ts";
import {SetCameraProperty} from "../../../internals/beatmap/object/custom_event/vivify/set_camera_property.ts";
import {AssignTrackPrefab} from "../../../internals/beatmap/object/custom_event/vivify/assign_track_prefab.ts";
import {SetRenderSetting} from "../../../internals/beatmap/object/custom_event/vivify/set_render_setting.ts";
import {
    IAssignTrackPrefab,
    IBlit,
    IDeclareCullingTexture,
    IDeclareRenderTexture,
    IDestroyPrefab,
    IDestroyTexture,
    IInstantiatePrefab,
    ISetAnimatorProperty,
    ISetCameraProperty,
    ISetGlobalProperty,
    ISetMaterialProperty,
    ISetRenderSetting
} from "./vivify_event_interfaces.ts";
import { bsmap } from '../../../deps.ts'

/** Wrapper for custom event arrays in a beatmap. */
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

export type IV3CustomEvent =
    | bsmap.v3.ICustomEvent
    | IAssignTrackPrefab
    | IBlit
    | IDeclareCullingTexture
    | IDeclareRenderTexture
    | IDestroyPrefab
    | IDestroyTexture
    | IInstantiatePrefab
    | ISetAnimatorProperty
    | ISetCameraProperty
    | ISetGlobalProperty
    | ISetMaterialProperty
    | ISetRenderSetting