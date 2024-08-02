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
import { MultiSceneInfo, SceneSwitchInfo } from '../../../types/model/model_scene/scene info.ts'

export class AnimatedModelScene extends ModelScene<SceneSwitch[], MultiSceneInfo> {
    private static getFirstTransform(obj: DeepReadonly<ModelObject>) {
        return {
            position: ModelScene.getFirstValues(obj.position),
            rotation: ModelScene.getFirstValues(obj.rotation),
            scale: ModelScene.getFirstValues(obj.scale),
        }
    }

    private initializeSceneInfo() {
        const sceneInfo: MultiSceneInfo = {
            yeetEvents: [],
            groupInfo: {},
            objects: [],
            sceneSwitches: [],
        }

        Object.entries(this.groups).forEach(([key, group]) => {
            sceneInfo.groupInfo[key] = {
                group,
                count: 0,
                moveEvents: [],
            }
        })

        return sceneInfo
    }

    private initializeSceneSwitchInfo(sceneSwitch: SceneSwitch, firstInitializing: boolean) {
        const sceneSwitchInfo: SceneSwitchInfo = {
            firstInitializing: firstInitializing,
            switch: sceneSwitch,
            groupInfo: {},
        }

        Object.entries(this.groups).forEach(([key, group]) => {
            sceneSwitchInfo.groupInfo[key] = {
                group,
                count: 0,
                moveEvents: [],
            }
        })

        return sceneSwitchInfo
    }

    protected async _instantiate() {
        ModelScene.createYeetDef()

        this.modelInput.sort((a, b) => a.beat - b.beat)

        // Initialize info
        const animatedMaterials: string[] = []
        const sceneInfo = this.initializeSceneInfo()

        // Object animation
        const promises = this.modelInput.map(async (sceneSwitch, switchIndex) =>
            await this.processSwitch(
                sceneSwitch,
                switchIndex,
                animatedMaterials,
                sceneInfo,
            )
        )
        const processedSwitches = await Promise.all(promises)
        const groupInitialStates = processedSwitches.reduce((prev, curr) => prev ?? curr)

        // Apply "count" to sceneInfo.groupInfo
        Object.entries(sceneInfo.groupInfo).forEach(([groupKey, groupInfo]) => {
            groupInfo.count = sceneInfo.sceneSwitches
                .reduce((prev, curr) => Math.max(prev, curr.groupInfo[groupKey].count), 0)
        })

        // Process groups (add yeet events, spawn objects)
        const yeetEvents: Record<number, AnimateTrack> = {}

        Object.keys(this.groups).forEach((groupKey) =>
            this.processGroup(
                groupKey,
                animatedMaterials,
                sceneInfo,
                yeetEvents,
                groupInitialStates,
            )
        )

        Object.values(yeetEvents).forEach((x) => x.push(false))
        sceneInfo.yeetEvents = Object.values(yeetEvents)
        return sceneInfo
    }

    private async processSwitch(
        sceneSwitch: SceneSwitch,
        switchIndex: number,
        animatedMaterials: string[],
        sceneInfo: MultiSceneInfo,
    ) {
        sceneSwitch.animationDuration ??= 0
        sceneSwitch.animationOffset ??= 0

        // This determines whether objects are initialized at beat 0, and this is the first switch.
        // When this is true, assigned objects need to be set in place at beat 0
        // It's wasteful to animate spawned objects into place since we can just set their transforms in the environment statement.
        const firstInitializing = this.initializeObjects && switchIndex === 0

        // If the animation has any sort of delay, we need to put the objects into place.
        // Though if we're already initializing, we can ignore this.
        const delaying = !firstInitializing && sceneSwitch.animationOffset > 0

        // If the animation offset ends up being past the next switch, ignore it
        const finalSwitch = switchIndex === this.modelInput.length - 1
        const nextSwitch = finalSwitch ? undefined : this.modelInput[switchIndex + 1]
        const ignoreAnimation = nextSwitch ? sceneSwitch.beat + sceneSwitch.animationOffset > nextSwitch.beat : false

        // Initializing the switch properties of each group.
        const sceneSwitchInfo = this.initializeSceneSwitchInfo(sceneSwitch, firstInitializing)
        sceneInfo.sceneSwitches.push(sceneSwitchInfo)
        const groupInitialStates: Record<string, ModelObject[]> | undefined = firstInitializing ? {} : undefined

        Object.keys(this.groups).forEach((groupKey) => {
            sceneSwitchInfo.groupInfo[groupKey].count = 0
            if (firstInitializing) {
                groupInitialStates![groupKey] = []
            }
        })

        const objects = await this.getObjects(sceneSwitch.model)
        objects.forEach((modelObject) => {
            const objectIsStatic = complexifyKeyframes(modelObject.position).length === 1 &&
                complexifyKeyframes(modelObject.rotation).length === 1 &&
                complexifyKeyframes(modelObject.scale).length === 1

            // Getting info about group
            const groupKey = modelObject.group ?? ModelScene.defaultGroupKey
            const group = this.groups[groupKey]
            if (!group) return // continue if object isn't present

            // Registering properties about object amounts
            const groupInfo = sceneSwitchInfo.groupInfo[groupKey]
            const sceneGroupInfo = sceneInfo.groupInfo[groupKey]
            groupInfo.count++
            sceneGroupInfo.count = Math.max(groupInfo.count, sceneGroupInfo.count)

            const index = groupInfo.count - 1
            const track = this.getPieceTrack(group.object, groupKey, index)

            // Set initializing positions
            if (firstInitializing) {
                const initialState = AnimatedModelScene.getFirstTransform(modelObject)
                groupInitialStates![groupKey][index] = initialState

                // If assigned object and initializing, set their position at beat 0
                if (!group.object) {
                    const event = animateTrack(0, track)
                    event.animation.position = initialState.position
                    event.animation.rotation = initialState.rotation
                    event.animation.scale = initialState.scale
                    sceneGroupInfo.moveEvents.push(event)
                    groupInfo.moveEvents.push(event)
                    event.push(false)
                }
            }

            // Animate color if the object has unique colors
            if (
                group.object &&
                group.object instanceof Geometry &&
                !group.defaultMaterial &&
                typeof group.object.material !== 'string' &&
                !group.object.material.color &&
                modelObject.color
            ) {
                const color = modelObject.color as Vec4
                color[3] ??= 1
                animatedMaterials.push(track)

                if (firstInitializing) {
                    groupInitialStates![groupKey][index].color = color
                } else {
                    const event = animateTrack(sceneSwitch.beat, track + '_material')
                    event.animation.color = color
                    event.push(false)
                }
            }

            // If a spawned object is static and initializing
            // No point using the delay system
            if (objectIsStatic && firstInitializing && group.object) {
                return
            }

            // If delaying, position objects at time of switch
            const event = animateTrack(sceneSwitch.beat, track, sceneSwitch.animationDuration)

            if (delaying) {
                event.animation.position = ModelScene.getFirstValues(modelObject.position)
                event.animation.rotation = ModelScene.getFirstValues(modelObject.rotation)
                event.animation.scale = ModelScene.getFirstValues(modelObject.scale)
                sceneGroupInfo.moveEvents.push(event)
                groupInfo.moveEvents.push(event)
                event.push()
            }

            // If ignoring animation, don't make animation events
            if (ignoreAnimation) {
                return
            }

            // Make animation event
            event.beat = sceneSwitch.beat + sceneSwitch.animationOffset!
            event.animation.position = modelObject.position as RuntimeRawKeyframesVec3
            event.animation.rotation = modelObject.rotation as RuntimeRawKeyframesVec3
            event.animation.scale = modelObject.scale as RuntimeRawKeyframesVec3

            // Apply loops if necessary
            if (sceneSwitch.loop && sceneSwitch.loop > 1 && !objectIsStatic) {
                event.repeat = sceneSwitch.loop - 1
                event.duration! /= sceneSwitch.loop
            }

            // Push event
            sceneGroupInfo.moveEvents.push(event)
            groupInfo.moveEvents.push(event)
            event.push(false)
        })

        return groupInitialStates
    }

    private processGroup(
        groupKey: string,
        animatedMaterials: string[],
        sceneInfo: MultiSceneInfo,
        yeetEvents: Record<number, AnimateTrack>,
        groupInitialStates: Record<string, ModelObject[]> | undefined,
    ) {
        const group = this.groups[groupKey]
        const groupInfo = sceneInfo.groupInfo[groupKey]

        // Yeeting objects
        if (group.disappearWhenAbsent || group.object) {
            sceneInfo.sceneSwitches.forEach((switchInfo) => {
                const switchBeat = switchInfo.switch.beat
                const eventTime = switchInfo.firstInitializing ? 0 : switchBeat
                const count = switchInfo.groupInfo[groupKey].count

                // If there's nothing to yeet, return
                if (count == groupInfo.count) return

                // Initialize the yeet event for this switch if not present
                if (!yeetEvents[switchBeat]) {
                    yeetEvents[switchBeat] = animateTrack({
                        beat: eventTime,
                        track: [],
                        animation: {
                            position: 'yeet',
                        },
                    })
                }

                // Add unused objects for this switch to the yeet event
                for (let i = count; i < groupInfo.count; i++) {
                    const track = this.getPieceTrack(group.object, groupKey, i)
                    yeetEvents[switchBeat].track.add(track)
                }
            })
        }

        // Spawning objects
        if (group.object) { // Only spawn if group has object
            const initializing = groupInitialStates !== undefined
            let materialName: string | undefined = undefined

            // Add default material to the beatmap if it is present
            if (group.defaultMaterial) {
                materialName = `modelScene${this.ID}_${groupKey}_material`
                getActiveDifficulty().geometryMaterials[materialName] = group.defaultMaterial
            }

            for (let i = 0; i < groupInfo.count; i++) {
                const object = copy(group.object)

                // Apply track to the object
                object.track.value = this.getPieceTrack(group.object, groupKey, i)

                // Apply initializing position if necessary
                if (initializing) {
                    const initialState = groupInitialStates[groupKey][i]
                    const initialPos = initialState ?? {
                        position: [0, -69420, 0],
                    }
                    object.position = initialPos.position as Vec3
                    object.rotation = initialPos.rotation as Vec3
                    object.scale = initialPos.scale as Vec3

                    if (initialPos.color) {
                        const material = (object as Geometry).material as RawGeometryMaterial
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
                    const material = (object as Geometry).material as RawGeometryMaterial
                    material.track = object.track.value + '_material'
                }

                // Run callback and push object
                sceneInfo.objects.push(object)
                object.push(false)
            }
        }
    }
}
