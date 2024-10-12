import {ReadonlyModel} from "../object.ts";
import {SceneSwitch} from "./scene_switch.ts";

export type ScenePromise = {
    sceneSwitch: SceneSwitch,
    model: Promise<ReadonlyModel>
}
export type ScenePromises = ScenePromise[]