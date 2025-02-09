import {ReadonlyModel} from "../object.ts";
import {SceneSwitch} from "./scene_switch.ts";
import {ColorVec} from "../../math/vector.ts";

export type ScenePromise = {
    sceneSwitch: SceneSwitch,
    model: Promise<ReadonlyModel>
}
export type ScenePromises = ScenePromise[]

export type AnimatedSceneMaterial = {
    beat: number,
    color: ColorVec
}