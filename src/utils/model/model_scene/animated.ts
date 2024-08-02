import { ModelScene } from './base.ts'
import { SceneSwitch } from '../../../types/model/model_scene/scene_switch.ts'
import { getActiveDifficulty } from '../../../data/active_difficulty.ts'
import { AnimateTrack } from '../../../internals/beatmap/object/custom_event/heck/animate_track.ts'
import { complexifyKeyframes } from '../../animation/keyframe/complexity.ts'
import { animateTrack } from '../../../builder_functions/beatmap/object/custom_event/heck.ts'
import { Vec3, Vec4 } from '../../../types/math/vector.ts'
import { Geometry } from '../../../internals/beatmap/object/environment/geometry.ts'
import { RuntimeRawKeyframesVec3 } from '../../../types/animation/keyframe/runtime/vec3.ts'
import { AnimatedOptions } from '../../../types/model/model_scene/option.ts'
import { copy } from '../../object/copy.ts'
import { RawGeometryMaterial } from '../../../types/beatmap/object/environment.ts'
import { DeepReadonly } from '../../../types/util/mutability.ts'
import { ModelObject } from '../../../types/model/object.ts'

export class AnimatedModelScene extends ModelScene<SceneSwitch[], void> {
    private getFirstTransform(obj: DeepReadonly<ModelObject>) {
        return {
            position: this.getFirstValues(obj.position),
            rotation: this.getFirstValues(obj.rotation),
            scale: this.getFirstValues(obj.scale),
        }
    }

    protected async _instantiate() {
        ModelScene.createYeetDef()

        this.modelInput.sort((a, b) => a.beat - b.beat)

        // Initialize info
        const animatedMaterials: string[] = []

        Object.keys(this.groups).forEach((x) => {
            this.sceneObjectInfo[x] = {
                max: 0,
                perSwitch: {},
            }
            if (!this.groups[x].object) this.sceneObjectInfo[x].max = 1
        })

        // Object animation
        const promises = this.modelInput.map(async (sceneSwitch, switchIndex) =>
            await this.processSwitch(
                sceneSwitch,
                switchIndex,
                animatedMaterials,
            )
        )
        await Promise.all(promises)

        // List of all tracks for each switch
        // (possibly from different groups) to be "yeeted"
        const yeetEvents: Record<
            number,
            AnimateTrack
        > = {}

        // Process groups
        // (add yeet events, spawn objects)
        Object.keys(this.groups).forEach((groupKey) =>
            this.processGroup(
                groupKey,
                yeetEvents,
                animatedMaterials,
                // forObject, TODO
            )
        )

        Object.values(yeetEvents).forEach((x) => x.push(false))
    }

    private async processSwitch(
        sceneSwitch: SceneSwitch,
        switchIndex: number,
        animatedMaterials: string[],
    ) {
        sceneSwitch.animationDuration ??= 0
        sceneSwitch.animationOffset ??= 0

        // This determines whether objects are initialized at beat 0, and this is the first switch.
        // When this is true, assigned objects need to be set in place at beat 0
        // It's wasteful to animate spawned objects into place since we can just set their transforms in the environment statement.
        const firstInitializing = this.initializeObjects &&
            switchIndex === 0 &&
            sceneSwitch.beat !== 0

        // If the animation has any sort of delay, we need to put the objects into place.
        // Though if we're already initializing, we can ignore this.
        const delaying = !firstInitializing && sceneSwitch.animationOffset > 0

        // Initializing the switch properties of each group.
        Object.keys(this.groups).forEach((g) => {
            this.sceneObjectInfo[g].perSwitch[sceneSwitch.beat] = 0
            if (firstInitializing) {
                this.sceneObjectInfo[g].initialPos = []
            }
        })

        const objects = await this.getObjects(sceneSwitch.model)
        objects.forEach((d, i) => {
            const objectIsStatic = complexifyKeyframes(d.position).length === 1 &&
                complexifyKeyframes(d.rotation).length === 1 &&
                complexifyKeyframes(d.scale).length === 1

            // Getting info about group
            const key = d.group as string
            const group = this.groups[key]

            // Registering properties about object amounts
            const objectInfo = this.sceneObjectInfo[key]
            if (!objectInfo) return // continue if object isn't present
            objectInfo.perSwitch[sceneSwitch.beat]++
            if (objectInfo.perSwitch[sceneSwitch.beat] > objectInfo.max) {
                // increment max if exceeded
                objectInfo.max = objectInfo.perSwitch[sceneSwitch.beat]
            }

            const track = this.getPieceTrack(group.object, key, objectInfo.perSwitch[sceneSwitch.beat] - 1)

            // Set initializing positions
            if (firstInitializing) {
                objectInfo.initialPos![i] = this.getFirstTransform(d)
            }

            // If assigned object and initializing, set their position at beat 0
            if (!group.object && firstInitializing) {
                const event = animateTrack(0, track)
                const initalizePos = objectInfo.initialPos![i]

                event.animation.position = initalizePos
                    .position as Vec3
                event.animation.rotation = initalizePos
                    .rotation as Vec3
                event.animation.scale = initalizePos
                    .scale as Vec3

                if (sceneSwitch.forEvent) {
                    sceneSwitch.forEvent(event, objectInfo.perSwitch[sceneSwitch.beat])
                }

                event.push(false)
            }

            // Animate color if the object has unique colors
            if (
                group.object &&
                group.object instanceof Geometry &&
                !group.defaultMaterial &&
                typeof group.object.material !== 'string' &&
                !group.object.material.color &&
                d.color
            ) {
                const color = d.color as Vec4
                color[3] ??= 1
                animatedMaterials.push(track)

                if (firstInitializing) {
                    objectInfo.initialPos![i].color = color
                } else {
                    const event = animateTrack(
                        sceneSwitch.beat,
                        track + '_material',
                    )
                    event.animation.color = color
                    event.push(false)
                }
            }

            // If a spawned object is static and initializing
            // No point using the delay system
            if (
                objectIsStatic && firstInitializing &&
                group.object
            ) {
                return
            }

            // If delaying, position objects at time of switch
            const event = animateTrack(sceneSwitch.beat, track, sceneSwitch.animationDuration)

            if (delaying) {
                event.animation.position = this.getFirstValues(
                    d.position,
                )
                event.animation.rotation = this.getFirstValues(
                    d.rotation,
                )
                event.animation.scale = this.getFirstValues(
                    d.scale,
                )
                if (sceneSwitch.forEvent) {
                    sceneSwitch.forEvent(event, objectInfo.perSwitch[sceneSwitch.beat])
                }
                event.push()
            }

            // Make animation event
            event.beat = sceneSwitch.beat + sceneSwitch.animationOffset!
            event.animation.position = d
                .position as RuntimeRawKeyframesVec3
            event.animation.rotation = d
                .rotation as RuntimeRawKeyframesVec3
            event.animation.scale = d
                .scale as RuntimeRawKeyframesVec3

            // Apply loops if necessary
            if (
                typeof sceneSwitch.model === 'object' &&
                !Array.isArray(sceneSwitch.model) &&
                (sceneSwitch.model as AnimatedOptions).loop !== undefined &&
                (sceneSwitch.model as AnimatedOptions).loop! > 1 &&
                !objectIsStatic
            ) {
                event.repeat = (sceneSwitch.model as AnimatedOptions).loop! - 1
                event.duration! /= (sceneSwitch.model as AnimatedOptions).loop!
            }

            // Run callback and then push event
            if (sceneSwitch.forEvent) {
                sceneSwitch.forEvent(event, objectInfo.perSwitch[sceneSwitch.beat])
            }
            event.push(false)
        })
    }

    private processGroup(
        groupKey: string,
        yeetEvents: Record<number, AnimateTrack>,
        animatedMaterials: string[],
    ) {
        const group = this.groups[groupKey]
        const objectInfo = this.sceneObjectInfo[groupKey]
        if (!objectInfo) return // skip object if it's not present

        // Yeeting objects
        if (group.disappearWhenAbsent || group.object) {
            Object.keys(objectInfo.perSwitch).forEach(
                (x, switchIndex) => {
                    const switchTime = parseInt(x)
                    const firstInitializing = this.initializeObjects &&
                        switchIndex === 0 &&
                        switchTime !== 0
                    const eventTime = firstInitializing ? 0 : switchTime
                    const amount = objectInfo.perSwitch[switchTime]

                    // Initialize the yeet event for this switch if not present
                    if (!yeetEvents[switchTime]) {
                        const event = animateTrack(eventTime, [])
                        event.animation.position = 'yeet'
                        yeetEvents[switchTime] = event
                    }

                    // Add unused objects for this switch to the yeet event
                    for (let i = amount; i < objectInfo.max; i++) {
                        const track = this.getPieceTrack(
                            group.object,
                            groupKey,
                            i,
                        )

                        yeetEvents[switchTime].track.add(
                            track,
                        )
                    }
                },
            )
        }

        // Spawning objects
        const initializing = objectInfo.initialPos !== undefined

        if (group.object) { // Only spawn if group has object
            let materialName: string | undefined = undefined

            // Add default material to the beatmap if it is present
            if (group.defaultMaterial) {
                materialName = `modelScene${this.ID}_${groupKey}_material`
                getActiveDifficulty().geometryMaterials[materialName] = group.defaultMaterial
            }

            for (let i = 0; i < objectInfo.max; i++) {
                const object = copy(group.object)

                // Apply track to the object
                object.track.value = this.getPieceTrack(
                    group.object,
                    groupKey,
                    i,
                )

                // Apply initializing position if necessary
                if (initializing) {
                    const initialPos = objectInfo.initialPos![i] ?? {
                        position: [0, -69420, 0],
                    }
                    object.position = initialPos.position as Vec3
                    object.rotation = initialPos.rotation as Vec3
                    object.scale = initialPos.scale as Vec3

                    if (initialPos.color) {
                        const material = (object as Geometry)
                            .material as RawGeometryMaterial
                        material.color = initialPos.color
                    }
                }

                // If there is a default material, apply it to the object
                if (group.defaultMaterial) {
                    ;(object as Geometry).material = materialName!
                }

                // If object's material is supposed to be animated, add a track to it
                if (
                    animatedMaterials.some((x) => x === object.track.value)
                ) {
                    const material = (object as Geometry)
                        .material as RawGeometryMaterial
                    material.track = object.track.value + '_material'
                }

                // Run callback and push object
                // if (forObject) forObject(object) TODO
                object.push(false)
            }
        }
    }
}
