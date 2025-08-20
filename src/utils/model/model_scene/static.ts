import { ModelScene } from './base.ts'
import { StaticModelInput } from '../../../types/model/model_scene/input.ts'
import { copy } from '../../object/copy.ts'
import { Geometry } from '../../../internals/beatmap/object/environment/geometry.ts'
import { ColorVec } from '../../../types/math/vector.ts'
import { animateTrack } from '../../../builder_functions/beatmap/object/custom_event/heck.ts'
import { StaticSceneInfo } from '../../../types/model/model_scene/scene_info.ts'
import {ReadonlyModel, type ModelObject} from "../../../types/model/object.ts";
import type { DeepReadonly } from '../../../types/util/mutability.ts'
import {AbstractDifficulty} from "../../../internals/beatmap/abstract_difficulty.ts";
import {RawPointsVec3} from "../../../types/animation/points/vec3.ts";
import {MODEL_SCENE_DEFAULT_GROUP_KEY} from "../../../constants/model.ts";

export class StaticModelScene extends ModelScene<StaticModelInput, Promise<ReadonlyModel>, StaticSceneInfo> {
    private initializeSceneInfo() {
        const sceneInfo: StaticSceneInfo = {
            trackGroupInfo: {},
            objectGroupInfo: {},
        }

        Object.entries(this.settings.groups).forEach(([key, group]) => {
            if (group.object) {
                sceneInfo.objectGroupInfo[key] = {
                    group,
                    count: 0,
                    objects: [],
                }
            } else {
                sceneInfo.trackGroupInfo[key] = {
                    group,
                    count: 0,
                    events: [],
                }
            }
        })

        return sceneInfo
    }

    protected override _createModelPromise(input: StaticModelInput): Promise<readonly DeepReadonly<ModelObject>[]> {
        return this.getObjects(input)
    }

    protected async _instantiate(difficulty: AbstractDifficulty) {
        // Initialize info
        const sceneInfo = this.initializeSceneInfo()

        const data = await this.modelPromise
        data.forEach((modelObject, index) => {
            // Getting info about group
            const groupKey = modelObject.group ?? MODEL_SCENE_DEFAULT_GROUP_KEY
            const group = this.settings.groups[groupKey]
            if (!group) return
            const track = this.getPieceTrack(group, groupKey, index)

            // Get transforms
            const position = StaticModelScene.getFirstValues(modelObject.position)
            const rotation = StaticModelScene.getFirstValues(modelObject.rotation)
            const scale = StaticModelScene.getFirstValues(modelObject.scale)

            // Creating objects/events
            if (group.object) {
                const object = this.instantiateGroupObject(difficulty, group.object, groupKey)

                if (
                    object instanceof Geometry &&
                    !group.defaultMaterial &&
                    typeof object.material !== 'string' &&
                    !object.material.color &&
                    modelObject.color
                ) object.material.color = copy(modelObject.color) as ColorVec

                object.track.value = track
                object.position = position
                object.rotation = rotation
                object.scale = scale

                const groupInfo = sceneInfo.objectGroupInfo[groupKey]
                groupInfo.count++
                groupInfo.group = group
                groupInfo.objects.push(object)
            }
            else {
                const event = animateTrack(difficulty, 0, track)
                event.animation.position = modelObject.position as RawPointsVec3
                event.animation.rotation = modelObject.rotation as RawPointsVec3
                event.animation.scale = modelObject.scale as RawPointsVec3

                const groupInfo = sceneInfo.trackGroupInfo[groupKey]
                groupInfo.count++
                groupInfo.group = group
                groupInfo.events.push(event)
            }
        })

        // Hide track groups if they aren't present
        Object.entries(this.settings.groups).forEach(([groupKey, group]) => {
            if (group.object) return

            const groupInfo = sceneInfo.trackGroupInfo[groupKey]
            if (groupInfo.count === 0 && group.disappearWhenAbsent) {
                ModelScene.createYeetDef(difficulty)
                animateTrack(difficulty, {
                    track: groupKey,
                    animation: {
                        position: 'yeet'
                    }
                })
            }
        })

        return sceneInfo
    }
}
