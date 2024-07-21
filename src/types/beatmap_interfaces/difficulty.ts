import { RuntimeRawKeyframesAny } from '../animation.ts'
import { Geometry } from '../../internals/environment/geometry.ts'
import { RawGeometryMaterial } from '../environment.ts'
import { FogEvent } from '../../internals/environment/fog.ts'
import { bsmap } from '../../deps.ts'
import { AnimateComponent } from '../../internals/custom_event/chroma.ts'
import { AnimateTrack } from '../../internals/custom_event/heck.ts'
import {
    AssignPathAnimation,
    AssignPlayerToTrack,
    AssignTrackParent
} from "../../internals/custom_event/noodle_extensions.ts";
import {
    AssignTrackPrefab,
    Blit,
    DeclareCullingTexture,
    DeclareRenderTexture,
    DestroyPrefab,
    DestroyTexture,
    InstantiatePrefab,
    SetAnimatorProperty,
    SetCameraProperty,
    SetGlobalProperty,
    SetMaterialProperty, SetRenderSetting
} from "../../internals/custom_event/vivify.ts";
import {AbstractCustomEvent} from "../../internals/custom_event/base.ts";
import {Chain} from "../../internals/gameplay_object/chain.ts";
import {Arc, Bomb, ColorNote} from "../../internals/gameplay_object/color_note.ts";
import {Wall} from "../../internals/gameplay_object/wall.ts";
import {
    BaseEvent,
    LaserSpeedEvent,
    LightEvent,
    RingSpinEvent,
    RingZoomEvent
} from "../../internals/lighting/basic_event.ts";
import {BoostEvent, BPMEvent, RotationEvent} from "../../internals/event.ts";
import {
    LightColorEventBoxGroup,
    LightRotationEventBoxGroup,
    LightTranslationEventBoxGroup
} from "../../internals/lighting/lighting_v3.ts";
import { Environment } from '../../internals/environment/environment.ts'

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

/** Everything that should be in a difficulty class */
export interface RMDifficulty {
    version: bsmap.v2.IDifficulty['_version'] | bsmap.v3.IDifficulty['version']
    v3: boolean
    waypoints: bsmap.v2.IWaypoint[] | bsmap.v3.IWaypoint[]

    colorNotes: ColorNote[]
    bombs: Bomb[]
    arcs: Arc[]
    chains: Chain[]
    walls: Wall[]

    lightEvents: LightEvent[]
    laserSpeedEvents: LaserSpeedEvent[]
    ringZoomEvents: RingZoomEvent[]
    ringSpinEvents: RingSpinEvent[]
    rotationEvents: RotationEvent[]
    boostEvents: BoostEvent[]
    baseBasicEvents: BaseEvent[]
    bpmEvents: BPMEvent[]

    lightColorEventBoxGroups: LightColorEventBoxGroup[]
    lightRotationEventBoxGroups: LightRotationEventBoxGroup[]
    lightTranslationEventBoxGroups: LightTranslationEventBoxGroup[]

    customEvents: BeatmapCustomEvents

    pointDefinitions: Record<string, RuntimeRawKeyframesAny>
    customData: Record<string, unknown>
    environment: Environment[]
    geometry: Geometry[]
    geometryMaterials: Record<string, RawGeometryMaterial>
    fogEvents: FogEvent[]
}
