import {AnimateTrack} from "../../../internals/beatmap/object/custom_event/heck/animate_track.ts";
import {GroupObjectTypes, ModelGroup} from "./group.ts";
import {DeepReadonly} from "../../util/mutability.ts";
import {SceneSwitch} from "./scene_switch.ts";

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