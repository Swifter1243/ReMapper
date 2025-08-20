import { ModelScene } from './base.ts'
import { SceneSwitch } from '../../../types/model/model_scene/scene_switch.ts'
import { AnimateTrack } from '../../../internals/beatmap/object/custom_event/heck/animate_track.ts'
import { complexifyPoints } from '../../animation/points/complexity.ts'
import { animateTrack } from '../../../builder_functions/beatmap/object/custom_event/heck.ts'
import {ColorVec, Vec3, Vec4} from '../../../types/math/vector.ts'
import { Geometry } from '../../../internals/beatmap/object/environment/geometry.ts'
import { DeepReadonly } from '../../../types/util/mutability.ts'
import { ModelObject } from '../../../types/model/object.ts'
import { MultiSceneInfo, SceneSwitchInfo } from '../../../types/model/model_scene/scene_info.ts'
import {AnimatedSceneMaterial, ScenePromises} from '../../../types/model/model_scene/animated.ts'
import { AbstractDifficulty } from '../../../internals/beatmap/abstract_difficulty.ts'
import {RawPointsVec3} from "../../../types/animation/points/vec3.ts";

export class AnimatedModelScene extends ModelScene<SceneSwitch[], ScenePromises, MultiSceneInfo> {
    protected override _createModelPromise(input: SceneSwitch[]): ScenePromises {
        return input
            .sort((a, b) => a.beat - b.beat)
            .map((sceneSwitch) => {
                return {
                    sceneSwitch,
                    model: this.getObjects(sceneSwitch.model),
                }
            })
    }

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

        Object.entries(this.settings.groups).forEach(([key, group]) => {
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

        Object.entries(this.settings.groups).forEach(([key, group]) => {
            sceneSwitchInfo.groupInfo[key] = {
                group,
                count: 0,
                moveEvents: [],
            }
        })

        return sceneSwitchInfo
    }

    protected async _instantiate(difficulty: AbstractDifficulty) {
        ModelScene.createYeetDef(difficulty)

        // Initialize info
        const animatedMaterials: Record<string, AnimatedSceneMaterial[]> = {}
        const sceneInfo = this.initializeSceneInfo()

        // Object animation
        const promises = this.modelPromise.map(async (scenePromise, switchIndex) =>
            await this.processSwitch(
                difficulty,
                scenePromise.sceneSwitch,
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

        Object.keys(this.settings.groups).forEach((groupKey) =>
            this.processGroup(
                difficulty,
                groupKey,
                animatedMaterials,
                sceneInfo,
                yeetEvents,
                groupInitialStates,
            )
        )

        sceneInfo.yeetEvents = Object.values(yeetEvents)
        return sceneInfo
    }

    private async processSwitch(
        difficulty: AbstractDifficulty,
        sceneSwitch: SceneSwitch,
        switchIndex: number,
        animatedMaterials: Record<string, AnimatedSceneMaterial[]>,
        sceneInfo: MultiSceneInfo,
    ) {
        sceneSwitch.animationDuration ??= 0
        sceneSwitch.animationOffset ??= 0

        // This determines whether objects are initialized at beat 0, and this is the first switch.
        // When this is true, assigned objects need to be set in place at beat 0
        // It's wasteful to animate spawned objects into place since we can just set their transforms in the environment statement.
        const firstInitializing = this.settings.shouldInitializeObjects && switchIndex === 0

        // If the animation has any sort of delay, we need to put the objects into place.
        // Though if we're already initializing, we can ignore this.
        const delaying = !firstInitializing && sceneSwitch.animationOffset > 0

        // If the animation offset ends up being past the next switch, ignore it
        const nextScenePromise = this.modelPromise[switchIndex + 1]
        const ignoreAnimation = nextScenePromise
            ? sceneSwitch.beat + sceneSwitch.animationOffset > nextScenePromise.sceneSwitch.beat
            : false

        // Initializing the switch properties of each group.
        const sceneSwitchInfo = this.initializeSceneSwitchInfo(sceneSwitch, firstInitializing)
        sceneInfo.sceneSwitches.push(sceneSwitchInfo)
        const groupInitialStates: Record<string, ModelObject[]> | undefined = firstInitializing ? {} : undefined

        Object.keys(this.settings.groups).forEach((groupKey) => {
            sceneSwitchInfo.groupInfo[groupKey].count = 0
            if (firstInitializing) {
                groupInitialStates![groupKey] = []
            }
        })

        const objects = await this.modelPromise[switchIndex].model
        objects.forEach((modelObject) => {
            const objectIsStatic = complexifyPoints(modelObject.position).length === 1 &&
                complexifyPoints(modelObject.rotation).length === 1 &&
                complexifyPoints(modelObject.scale).length === 1

            // Getting info about group
            const groupKey = modelObject.group ?? ModelScene.defaultGroupKey
            const group = this.settings.groups[groupKey]
            if (!group) return // continue if object isn't present

            // Registering properties about object amounts
            const groupInfo = sceneSwitchInfo.groupInfo[groupKey]
            const sceneGroupInfo = sceneInfo.groupInfo[groupKey]
            groupInfo.count++
            sceneGroupInfo.count = Math.max(groupInfo.count, sceneGroupInfo.count)

            const index = groupInfo.count - 1
            const track = this.getPieceTrack(group, groupKey, index)

            // Set initializing positions
            if (firstInitializing) {
                const initialState = AnimatedModelScene.getFirstTransform(modelObject)
                groupInitialStates![groupKey][index] = initialState

                // If assigned object and initializing, set their position at beat 0
                if (!group.object) {
                    const event = animateTrack(difficulty, 0, track)
                    event.animation.position = initialState.position
                    event.animation.rotation = initialState.rotation
                    event.animation.scale = initialState.scale
                    sceneGroupInfo.moveEvents.push(event)
                    groupInfo.moveEvents.push(event)
                }
            }

            // Animate color if the object has unique colors
            if (modelObject.color && !group.defaultMaterial) {
                const color = modelObject.color as ColorVec

                if (firstInitializing) {
                    groupInitialStates![groupKey][index].color = color
                } else {
                    const animatedMaterial: AnimatedSceneMaterial = {
                        beat: sceneSwitch.beat,
                        color
                    }

                    if (!animatedMaterials[track]) {
                        animatedMaterials[track] = [animatedMaterial]
                    } else {
                        animatedMaterials[track].push(animatedMaterial)
                    }
                }
            }

            // If a spawned object is static and initializing
            // No point using the delay system
            if (objectIsStatic && firstInitializing && group.object) {
                return
            }

            // If delaying, position objects at time of switch
            if (delaying) {
                const event = animateTrack(difficulty, sceneSwitch.beat, track, sceneSwitch.animationDuration)
                event.animation.position = ModelScene.getFirstValues(modelObject.position)
                event.animation.rotation = ModelScene.getFirstValues(modelObject.rotation)
                event.animation.scale = ModelScene.getFirstValues(modelObject.scale)
                sceneGroupInfo.moveEvents.push(event)
                groupInfo.moveEvents.push(event)
            }

            // If ignoring animation, don't make animation events
            if (ignoreAnimation) {
                return
            }

            // Make animation event
            const animationStart = sceneSwitch.beat + sceneSwitch.animationOffset!
            const event = animateTrack(difficulty, animationStart, track, sceneSwitch.animationDuration)
            event.animation.position = modelObject.position as RawPointsVec3
            event.animation.rotation = modelObject.rotation as RawPointsVec3
            event.animation.scale = modelObject.scale as RawPointsVec3

            // Apply loops if necessary
            if (sceneSwitch.loop && sceneSwitch.loop > 1 && !objectIsStatic) {
                event.repeat = sceneSwitch.loop - 1
                event.duration! /= sceneSwitch.loop
            }

            // Push event
            sceneGroupInfo.moveEvents.push(event)
            groupInfo.moveEvents.push(event)
        })

        return groupInitialStates
    }

    private processGroup(
        difficulty: AbstractDifficulty,
        groupKey: string,
        animatedMaterials: Record<string, AnimatedSceneMaterial[]>,
        sceneInfo: MultiSceneInfo,
        yeetEvents: Record<number, AnimateTrack>,
        groupInitialStates: Record<string, ModelObject[]> | undefined,
    ) {
        const group = this.settings.groups[groupKey]
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
                    yeetEvents[switchBeat] = animateTrack(difficulty, {
                        beat: eventTime,
                        track: [],
                        animation: {
                            position: 'yeet',
                        },
                    })
                }

                // Add unused objects for this switch to the yeet event
                for (let i = count; i < groupInfo.count; i++) {
                    const track = this.getPieceTrack(group, groupKey, i)
                    yeetEvents[switchBeat].track.add(track)
                }
            })
        }

        // Spawning objects
        if (group.object) { // Only spawn if group has object
            const initializing = groupInitialStates !== undefined

            for (let i = 0; i < groupInfo.count; i++) {
                const object = this.instantiateGroupObject(difficulty, group.object, groupKey)

                // Apply track to the object
                const pieceTrack  = this.getPieceTrack(group, groupKey, i)
                object.track.value = pieceTrack

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
                        const material = (object as Geometry).material
                        if (typeof material !== 'string')
                            material.color = initialPos.color
                    }
                }

                // If object's material is supposed to be animated, make the color animation event and set the track.
                const trackAnimatedMaterials = animatedMaterials[pieceTrack]
                if (
                    trackAnimatedMaterials &&
                    object instanceof Geometry &&
                    typeof object.material !== 'string'
                ) {
                    const materialTrack = pieceTrack + '_material'
                    object.material.track = materialTrack

                    trackAnimatedMaterials.forEach(e => {
                        const event = animateTrack(difficulty, e.beat, materialTrack)
                        e.color[3] ??= 1
                        event.animation.color = e.color as Vec4
                    })
                }

                // Run callback and push object
                sceneInfo.objects.push(object)
            }
        }
    }
}
