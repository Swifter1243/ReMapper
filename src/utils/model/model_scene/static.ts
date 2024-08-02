import { ModelScene } from './base.ts'
import { StaticObjectInput } from '../../../types/model/model_scene/input.ts'
import { getActiveDifficulty } from '../../../data/active_difficulty.ts'
import { copy } from '../../object/copy.ts'
import { Geometry } from '../../../internals/beatmap/object/environment/geometry.ts'
import { ColorVec } from '../../../types/math/vector.ts'
import { animateTrack } from '../../../builder_functions/beatmap/object/custom_event/heck.ts'
import { RuntimeRawKeyframesVec3 } from '../../../types/animation/keyframe/runtime/vec3.ts'

export class StaticModelScene extends ModelScene<StaticObjectInput, void> {
    protected async _instantiate() {
        // Initialize info
        Object.keys(this.groups).forEach((x) => {
            this.sceneObjectInfo[x] = {
                max: 0,
                perSwitch: {
                    0: 0,
                },
            }
        })

        const data = await this.getObjects(this.modelInput)
        data.forEach((x) => {
            // Getting info about group
            const groupKey = x.group as string
            const group = this.groups[groupKey]

            // Registering properties about object amounts
            const objectInfo = this.sceneObjectInfo[groupKey]
            if (!objectInfo) return
            objectInfo.perSwitch[0]++
            if (objectInfo.perSwitch[0] > objectInfo.max) {
                objectInfo.max = objectInfo.perSwitch[0]
            }

            const track = this.getPieceTrack(
                group.object,
                groupKey,
                objectInfo.perSwitch[0] - 1,
            )

            // Get transforms
            const pos = this.getFirstValues(x.position)
            const rot = this.getFirstValues(x.rotation)
            const scale = this.getFirstValues(x.scale)

            // Creating objects
            if (group.object) {
                const object = copy(group.object)

                if (group.defaultMaterial) {
                    const materialName = `modelScene${this.ID}_${groupKey}_material`
                    getActiveDifficulty().geometryMaterials[materialName] = group.defaultMaterial
                    ;(object as Geometry).material = materialName
                }

                if (
                    object instanceof Geometry &&
                    !group.defaultMaterial &&
                    typeof object.material !== 'string' &&
                    !object.material.color &&
                    x.color
                ) object.material.color = copy(x.color) as ColorVec

                object.track.value = track
                object.position = pos
                object.rotation = rot
                object.scale = scale
                // if (forObject) forObject(object) TODO
                object.push(false)
            } // Creating event for assigned
            else {
                const event = animateTrack(0, track)
                event.animation.position = x
                    .position as RuntimeRawKeyframesVec3
                event.animation.rotation = x
                    .rotation as RuntimeRawKeyframesVec3
                event.animation.scale = x.scale as RuntimeRawKeyframesVec3
                // if (forAssigned) forAssigned(event) TODO
                getActiveDifficulty().customEvents.animateTrackEvents.push(
                    event,
                )
            }
        })

        Object.keys(this.groups).forEach((x) => {
            const objectInfo = this.sceneObjectInfo[x]
            const group = this.groups[x]

            if (
                objectInfo.max === 0 && !group.object &&
                group.disappearWhenAbsent
            ) {
                ModelScene.createYeetDef()
                const event = animateTrack(0, x)
                event.animation.position = 'yeet'
                event.push(false)
            }
        })
    }
}
