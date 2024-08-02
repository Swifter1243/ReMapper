import {ModelObject} from "../object.ts";
import {AnimateTrack} from "../../../internals/beatmap/object/custom_event/heck/animate_track.ts";
import {GroupObjectTypes, ModelGroup} from "./group.ts";
import {DeepReadonly} from "../../util/mutability.ts";
import {SceneSwitch} from "./scene_switch.ts";

/**
 * The properties reported for a given group in `ModelScene` after the model is instantiated.
 */
export type SceneObjectInfo = {
    /** The maximum number of objects in this group that showed up at once during a switch. */
    max: number
    /** The number of objects that showed up in a given switch. */
    perSwitch: Record<number, number>
    /** If defined, this is the very first transform for all objects in this group. */
    initialPos?: ModelObject[]
}

export type StaticSceneInfo = {
    trackGroupInfo: Record<string, StaticTrackGroupInfo>
    objectGroupInfo: Record<string, StaticObjectGroupInfo>
}

export type StaticTrackGroupInfo = {
    group: DeepReadonly<ModelGroup>,
    count: number,
    events: AnimateTrack[]
}

export type StaticObjectGroupInfo = {
    group: DeepReadonly<ModelGroup>,
    count: number,
    objects: GroupObjectTypes[]
}

export type MultiSceneInfo = {
    groupInfo: Record<string, MultiGroupInfo>
    objects: GroupObjectTypes[]
    sceneSwitches: SceneSwitchInfo[]
    yeetEvents: AnimateTrack[]
}

export type SceneSwitchInfo = {
    switch: SceneSwitch,
    firstInitializing: boolean,
    groupInfo: Record<string, MultiGroupInfo>
}

export type MultiGroupInfo = {
    group: DeepReadonly<ModelGroup>
    count: number,
    moveEvents: AnimateTrack[]
}