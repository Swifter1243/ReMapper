import { ModelScene } from './base.ts'
import { StaticObjectInput } from '../../../types/model/model_scene/input.ts'
import { getActiveDifficulty } from '../../../data/active_difficulty.ts'
import { copy } from '../../object/copy.ts'
import { Geometry } from '../../../internals/beatmap/object/environment/geometry.ts'
import { ColorVec } from '../../../types/math/vector.ts'
import { animateTrack } from '../../../builder_functions/beatmap/object/custom_event/heck.ts'
import { RuntimeRawKeyframesVec3 } from '../../../types/animation/keyframe/runtime/vec3.ts'
import { StaticSceneInfo } from '../../../types/model/model_scene/scene info.ts'

export class StaticModelScene extends ModelScene<StaticObjectInput, StaticSceneInfo> {
    private initializeSceneInfo() {
        const sceneInfo: StaticSceneInfo = {
            trackGroupInfo: {},
            objectGroupInfo: {},
        }

        Object.entries(this.groups).forEach(([key, group]) => {
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

    protected async _instantiate() {
        // Initialize info
        const sceneInfo = this.initializeSceneInfo()

        const data = await this.getObjects(this.modelInput)
        data.forEach((modelObject, index) => {
            // Getting info about group
            const groupKey = modelObject.group ?? ModelScene.defaultGroupKey
            const group = this.groups[groupKey]
            if (!group) return
            const track = this.getPieceTrack(group.object, groupKey, index)

            // Get transforms
            const pos = StaticModelScene.getFirstValues(modelObject.position)
            const rot = StaticModelScene.getFirstValues(modelObject.rotation)
            const scale = StaticModelScene.getFirstValues(modelObject.scale)

            // Creating objects/events
            if (group.object) {
                const object = copy(group.object)

                if (group.defaultMaterial && object instanceof Geometry) {
                    const materialName = `modelScene${this.ID}_${groupKey}_material`
                    getActiveDifficulty().geometryMaterials[materialName] = group.defaultMaterial
                    object.material = materialName
                }

                if (
                    object instanceof Geometry &&
                    !group.defaultMaterial &&
                    typeof object.material !== 'string' &&
                    !object.material.color &&
                    modelObject.color
                ) object.material.color = copy(modelObject.color) as ColorVec

                object.track.value = track
                object.position = pos
                object.rotation = rot
                object.scale = scale

                const groupInfo = sceneInfo.objectGroupInfo[groupKey]
                groupInfo.count++
                groupInfo.group = group
                groupInfo.objects.push(object)

                object.push(false)
            }
            else {
                const event = animateTrack(0, track)
                event.animation.position = modelObject.position as RuntimeRawKeyframesVec3
                event.animation.rotation = modelObject.rotation as RuntimeRawKeyframesVec3
                event.animation.scale = modelObject.scale as RuntimeRawKeyframesVec3

                const groupInfo = sceneInfo.trackGroupInfo[groupKey]
                groupInfo.count++
                groupInfo.group = group
                groupInfo.events.push(event)

                getActiveDifficulty().customEvents.animateTrackEvents.push(event)
            }
        })

        // Hide track groups if they aren't present
        Object.entries(this.groups).forEach(([groupKey, group]) => {
            if (group.object) return

            const groupInfo = sceneInfo.trackGroupInfo[groupKey]
            if (groupInfo.count === 0 && group.disappearWhenAbsent) {
                ModelScene.createYeetDef()
                animateTrack({
                    track: groupKey,
                    animation: {
                        position: 'yeet'
                    }
                }).push(false)
            }
        })

        return sceneInfo
    }
}
