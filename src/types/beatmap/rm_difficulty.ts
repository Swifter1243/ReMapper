import {Geometry} from '../../internals/beatmap/object/environment/geometry.ts'
import {RawGeometryMaterial} from './object/environment.ts'
import {FogEvent} from '../../internals/beatmap/object/environment/fog.ts'
import {bsmap} from '../../deps.ts'
import {Chain} from "../../internals/beatmap/object/gameplay_object/chain.ts";
import {Wall} from "../../internals/beatmap/object/gameplay_object/wall.ts";
import {Environment} from '../../internals/beatmap/object/environment/environment.ts'
import {AbstractBasicEvent} from "../../internals/beatmap/object/basic_event/abstract.ts";
import {LightEvent} from "../../internals/beatmap/object/basic_event/light_event.ts";
import {LaserSpeedEvent} from "../../internals/beatmap/object/basic_event/laser_speed.ts";
import {RingZoomEvent} from "../../internals/beatmap/object/basic_event/ring_zoom.ts";
import {RingSpinEvent} from "../../internals/beatmap/object/basic_event/ring_spin.ts";
import {RotationEvent} from "../../internals/beatmap/object/v3_event/rotation.ts";
import {BoostEvent} from "../../internals/beatmap/object/v3_event/lighting/boost.ts";
import {BPMEvent} from "../../internals/beatmap/object/v3_event/bpm.ts";
import {LightColorEventBoxGroup} from "../../internals/beatmap/object/v3_event/lighting/light_event_box_group/color.ts";
import {
    LightRotationEventBoxGroup
} from "../../internals/beatmap/object/v3_event/lighting/light_event_box_group/rotation.ts";
import {
    LightTranslationEventBoxGroup
} from "../../internals/beatmap/object/v3_event/lighting/light_event_box_group/translation.ts";
import {ColorNote} from "../../internals/beatmap/object/gameplay_object/color_note.ts";
import {Bomb} from "../../internals/beatmap/object/gameplay_object/bomb.ts";
import {Arc} from "../../internals/beatmap/object/gameplay_object/arc.ts";

import {RuntimeRawKeyframesAny} from "../animation/keyframe/runtime/any.ts";
import {BeatmapCustomEvents} from "./object/custom_event.ts";

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
    abstractBasicEvents: AbstractBasicEvent[]
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
