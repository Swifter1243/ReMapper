import {SceneObjectInfo} from '../../types/model/model_scene/scene_object_info.ts'
import {AnimationSettings, optimizeKeyframes} from '../animation/optimizer.ts'
import {Environment} from '../../internals/beatmap/object/environment/environment.ts'
import {Geometry} from '../../internals/beatmap/object/environment/geometry.ts'
import {getActiveDifficulty} from '../../data/active_difficulty.ts'
import {applyAnchor, combineTransforms} from '../math/transform.ts'
import {mirrorAnimation} from '../animation/time_warp.ts'
import {bakeAnimation} from '../animation/bake.ts'
import {iterateKeyframes} from '../animation/keyframe/iterate.ts'
import {complexifyKeyframes} from '../animation/keyframe/complexity.ts'
import {copy} from '../object/copy.ts'
import {positionUnityToNoodle} from '../beatmap/object/environment/unit_conversion.ts'
import {ColorVec, Vec3, Vec4} from '../../types/math/vector.ts'
import {TransformKeyframe} from '../../types/animation/bake.ts'
import {ModelObject, ReadonlyModel} from '../../types/model/object.ts'
import {AnimatedOptions} from '../../types/model/model_scene/option.ts'
import {AnimatedObjectInput, ObjectInput, StaticObjectInput,} from '../../types/model/model_scene/input.ts'
import {SceneSwitch} from '../../types/model/model_scene/scene_switch.ts'
import {GroupObjectTypes, ModelGroup} from '../../types/model/model_scene/group.ts'
import {RawKeyframesVec3} from '../../types/animation/keyframe/vec3.ts'
import {parseFilePath} from '../file.ts'
import {getModel} from "./file.ts";
import {DeepReadonly} from "../../types/util/mutability.ts";
import {RuntimeRawKeyframesVec3} from '../../types/animation/keyframe/runtime/vec3.ts'
import {animateTrack} from "../../builder_functions/beatmap/object/custom_event/heck.ts";
import {RawGeometryMaterial} from '../../types/beatmap/object/environment.ts'
import {AnimateTrack} from "../../internals/beatmap/object/custom_event/heck/animate_track.ts";

let modelSceneCount = 0
let noYeet = true

function createYeetDef() {
    if (noYeet) {
        noYeet = false
        getActiveDifficulty().pointDefinitions.yeet = [0, -69420, 0]
    }
}

export class ModelScene {
    /** All the "groups" stored in this model.
     * When the model properties is passed, if any model objects have a track that match the name of this group, an animation event will be placed for them.
     */
    groups = <Record<string, ModelGroup>> {}
    /** Settings for the optimizer on each animation event.
     * The animations will attempt to be optimized, removing visually redundant points.
     * This controls various parameters about how harshly the algorithm will target changes.
     */
    animationSettings = new AnimationSettings()
    /** The unique ID of this model scene, used for tracks.
     * If multiple model scenes are used, this ID is used so the track names don't conflict.
     */
    ID: number
    /** The info outputted from instantiating object properties from `static` or `animate`, for each group.
     * @see this.groups
     */
    sceneObjectInfo = <Record<string, SceneObjectInfo>> {}
    /** If the scene is instantiated with `animate` and the first switch is not at a time of 0, `initializePositions` determines whether the first switch will be initialized at beat 0 and held in place until it is animated. */
    initializeObjects = true
    /** Whether this scene has been instantiated with `static` or `animate`. */
    private instantiated = false

    /**
     * Handler for representing object properties as part of the environment.
     * @param object Object to spawn on model objects with no track.
     * @param scale The scale multiplier for the spawned object previously mentioned.
     * @param anchor The anchor offset for the spawned object previously mentioned.
     * @param rotation The rotation offset for the spawned object previously mentioned.
     */
    constructor(
        object?: GroupObjectTypes,
        scale?: Vec3,
        anchor?: Vec3,
        rotation?: Vec3,
    ) {
        if (object) this.pushGroup(undefined, object, scale, anchor, rotation)
        this.ID = modelSceneCount
        modelSceneCount++
    }

    private pushGroup(
        key: string | undefined,
        object?: GroupObjectTypes,
        scale?: Vec3,
        anchor?: Vec3,
        rotation?: Vec3,
        changeGroup?: (group: ModelGroup) => void,
    ) {
        const group: ModelGroup = {}
        if (object) {
            if (object instanceof Environment) object.duplicate = 1
            if (
                object instanceof Geometry &&
                typeof object.material !== 'string'
            ) {
                group.defaultMaterial = object.material
            }
            object.position = [0, -69420, 0]
            group.object = object
        }
        if (scale) group.scale = scale
        if (anchor) group.anchor = anchor
        if (rotation) group.rotation = rotation
        if (changeGroup) changeGroup(group)
        this.groups[key as string] = group
    }

    /**
     * Assign a track in input ModelObjects to spawn and pool new objects.
     * @param track Track to check for.
     * @param object Object to spawn.
     * @param scale The scale multiplier for the spawned object previously mentioned.
     * @param anchor The anchor offset for the spawned object previously mentioned.
     * @param rotation The rotation offset for the spawned object previously mentioned.
     */
    addPrimaryGroups(
        track: string | string[],
        object: GroupObjectTypes,
        scale?: Vec3,
        anchor?: Vec3,
        rotation?: Vec3,
    ) {
        const tracks = typeof track === 'object' ? track : [track]
        tracks.forEach((t) => {
            this.pushGroup(t, object, scale, anchor, rotation)
        })
    }

    /**
     * Assign a track in input ModelObjects to animate an existing object with identical track name.
     * @param track Track to check for and animate.
     * @param scale The scale multiplier for the spawned object previously mentioned.
     * @param anchor The anchor offset for the spawned object previously mentioned.
     * @param rotation The rotation offset for the spawned object previously mentioned.
     * @param disappearWhenAbsent Make the object on this track disappear when no ModelObject with the corresponding track exists.
     */
    assignObjects(
        track: string | string[],
        scale?: Vec3,
        anchor?: Vec3,
        rotation?: Vec3,
        disappearWhenAbsent = true,
    ) {
        const tracks = typeof track === 'object' ? track : [track]
        tracks.forEach((t) => {
            this.pushGroup(t, undefined, scale, anchor, rotation, (x) => {
                x.disappearWhenAbsent = disappearWhenAbsent
            })
        })
    }

    /**
     * Spawn every object in a group with a unique material.
     * Allows colors from models to be applied to geometry.
     * Should be used with caution as it creates a unique material per object.
     * @param group The group to enable unique materials on. Leave undefined to effect base group.
     */
    enableModelColors(group?: string) {
        const groupObj = this.groups[group as string]
        if (!groupObj && !group) throw `There are no groups on this scene!`
        if (!groupObj) throw `The group ${group} doesn't exist!`
        this.groups[group as string].defaultMaterial = undefined
    }

    private async getObjects(input: AnimatedObjectInput) {
        // deno-lint-ignore no-this-alias
        const self = this

        const v3 = getActiveDifficulty().v3
        let objectInput = input as ObjectInput
        let options = {} as AnimatedOptions

        if (typeof input === 'object' && !Array.isArray(input)) {
            const animatedOptions = input as AnimatedOptions
            objectInput = animatedOptions.input
            options = animatedOptions
        }

        function makeStatic(obj: ModelObject) {
            const doStatic = (k: RawKeyframesVec3) =>
                typeof k[0] === 'object' ? [k[0][0], k[0][1], k[0][2]] as Vec3 : k as Vec3

            obj.position = doStatic(obj.position)
            obj.rotation = doStatic(obj.rotation)
            obj.scale = doStatic(obj.scale)
        }

        function processFileObjects(
            fileObjects: ModelObject[],
        ) {
            if (options.onCache) options.onCache(fileObjects)
            fileObjects.forEach((x) => {
                if (options.static) {
                    makeStatic(x)
                }

                // Getting relevant object transforms
                let scale: Vec3 | undefined
                let anchor: Vec3 | undefined
                let rotation: Vec3 | undefined

                const group = self.groups[x.group as string]
                if (group) {
                    if (group.scale) scale = group.scale
                    if (group.anchor) anchor = group.anchor
                    if (group.rotation) rotation = group.rotation
                }

                // Making keyframes a consistent array format
                x.position = complexifyKeyframes(x.position)
                x.rotation = complexifyKeyframes(x.rotation)
                x.scale = complexifyKeyframes(x.scale)

                // Applying transformation to each keyframe
                for (let i = 0; i < x.position.length; i++) {
                    let objPos = copy(
                        x.position[i],
                    ) as number[]
                    let objRot = copy(
                        x.rotation[i],
                    ) as number[]
                    let objScale = copy(
                        x.scale[i],
                    ) as number[]
                    objPos.pop()
                    objRot.pop()
                    objScale.pop()

                    if (options.transform) {
                        const combined = combineTransforms(
                            {
                                position: objPos as Vec3,
                                rotation: objRot as Vec3,
                                scale: objScale as Vec3,
                            },
                            options.transform,
                            options.transform.anchor,
                        )
                        objPos = combined.position
                        objRot = combined.rotation
                        objScale = combined.scale
                    }

                    if (anchor) {
                        objPos = applyAnchor(
                            objPos as Vec3,
                            objRot as Vec3,
                            objScale as Vec3,
                            anchor,
                        )
                    }

                    if (rotation) {
                        objRot = (objRot as Vec3).map((x, i) => (x + (rotation as Vec3)[i]) % 360)
                    }

                    if (scale) {
                        objScale = (objScale as Vec3).map((x, i) => x * (scale as Vec3)[i])
                    }

                    if (!v3) {
                        positionUnityToNoodle(objPos as Vec3)
                    }

                    x.position[i] = [...(objPos as Vec3), x.position[i][3]]
                    x.rotation[i] = [...(objRot as Vec3), x.rotation[i][3]]
                    x.scale[i] = [
                        ...(objScale as Vec3),
                        x.scale[i][3],
                    ]
                }

                // Optimizing object
                x.position = optimizeKeyframes(
                    x.position,
                    self.animationSettings.optimizeSettings,
                )
                x.rotation = optimizeKeyframes(
                    x.rotation,
                    self.animationSettings.optimizeSettings,
                )
                x.scale = optimizeKeyframes(
                    x.scale,
                    self.animationSettings.optimizeSettings,
                )

                // Loop animation
                if (options.mirror) {
                    x.position = mirrorAnimation(x.position)
                    x.rotation = mirrorAnimation(x.rotation)
                    x.scale = mirrorAnimation(x.scale)
                }
            })
            return fileObjects
        }

        async function stringProcess(objectInput: string) {
            const inputPath = (await parseFilePath(objectInput, '.rmmodel')).path
            const onCache = options.onCache ? options.onCache.toString() : undefined
            const processing: unknown[] = [
                options,
                onCache,
                self.groups,
                self.animationSettings.toData(),
                v3,
            ]

            const model = getModel(
                inputPath,
                `modelScene${self.ID}_${inputPath}`,
                processFileObjects,
                processing,
            )
            if (options.objects) options.objects(await model)
            return model
        }

        function objectProcess(
            objectInput: ReadonlyModel,
        ): ReadonlyModel {
            const outputObjects: ModelObject[] = []
            if (options.objects) options.objects(objectInput)

            objectInput.forEach((x) => {
                const o = copy(x) as ModelObject

                if (options.static) {
                    makeStatic(o)
                }

                // Getting relevant object transforms
                let scale: Vec3 | undefined
                let anchor: Vec3 | undefined
                let rotation: Vec3 | undefined

                const group = self.groups[x.group as string]
                if (group) {
                    if (group.scale) scale = group.scale
                    if (group.anchor) anchor = group.anchor
                    if (group.rotation) rotation = group.rotation
                }

                function getBakedTransform(transform: TransformKeyframe) {
                    if (options.transform) {
                        const combined = combineTransforms(
                            {
                                position: transform.position,
                                rotation: transform.rotation,
                                scale: transform.scale,
                            },
                            options.transform,
                            options.transform.anchor,
                        )
                        transform.position = combined.position
                        transform.rotation = combined.rotation
                        transform.scale = combined.scale
                    }

                    transform.position = applyAnchor(
                        transform.position,
                        transform.rotation,
                        transform.scale,
                        anchor ?? [0, 0, 0] as Vec3,
                    )
                }

                if (
                    (anchor && options.bake !== false && !options.static) ||
                    options.bake || options.transform
                ) {
                    // Baking animation
                    const bakedCube: ModelObject = bakeAnimation(
                        {
                            position: x.position,
                            rotation: x.rotation,
                            scale: x.scale,
                        },
                        getBakedTransform,
                        self.animationSettings,
                    )

                    if (!v3) {
                        positionUnityToNoodle(bakedCube.position)
                    }

                    o.position = bakedCube.position
                    o.rotation = bakedCube.rotation
                    o.scale = bakedCube.scale
                }

                if (rotation) {
                    iterateKeyframes(o.rotation, (y) => {
                        y[0] = (y[0] + (rotation!)[0]) % 360
                        y[1] = (y[1] + (rotation!)[1]) % 360
                        y[2] = (y[2] + (rotation!)[2]) % 360
                    })
                }

                if (scale) {
                    iterateKeyframes(o.scale, (y) => {
                        y[0] *= (scale!)[0]
                        y[1] *= (scale!)[1]
                        y[2] *= (scale!)[2]
                    })
                }

                // Loop animation
                if (options.mirror) {
                    o.position = mirrorAnimation(o.position)
                    o.rotation = mirrorAnimation(o.rotation)
                    o.scale = mirrorAnimation(o.scale)
                }

                outputObjects.push(o)
            })

            return outputObjects
        }

        if (typeof objectInput === 'string') {
            return await stringProcess(objectInput)
        } else {
            return objectProcess(objectInput)
        }
    }

    private getPieceTrack = (
        object: undefined | GroupObjectTypes,
        track: string,
        index: number,
    ) => object ? `modelScene${this.ID}_${track}_${index}` : track

    private getFirstValues(keyframes: DeepReadonly<RawKeyframesVec3>) {
        const complexTransform = complexifyKeyframes(copy(keyframes))[0]
        return [
            complexTransform[0],
            complexTransform[1],
            complexTransform[2],
        ] as Vec3
    }

    private getFirstTransform(obj: DeepReadonly<ModelObject>) {
        return {
            position: this.getFirstValues(obj.position),
            rotation: this.getFirstValues(obj.rotation),
            scale: this.getFirstValues(obj.scale),
        }
    }

    private flagInstantiation() {
        if (this.instantiated) {
            throw "You can't instantiate a scene using the same ModelScene multiple times."
        }
        this.instantiated = true
    }

    /**
     * Create a one-time environment from static properties.
     * @param input Input for ModelObjects.
     * @param forObject Function to run on each spawned object.
     * @param forAssigned Function to run on each assigned object.
     */
    async static(
        input: StaticObjectInput,
        forObject?: (object: GroupObjectTypes) => void,
        forAssigned?: (event: AnimateTrack) => void,
    ) {
        this.flagInstantiation()

        const diff = getActiveDifficulty()

        // deno-lint-ignore no-this-alias
        const self = this

        async function process() {
            // Initialize info
            Object.keys(self.groups).forEach((x) => {
                self.sceneObjectInfo[x] = {
                    max: 0,
                    perSwitch: {
                        0: 0,
                    },
                }
            })

            const data = await self.getObjects(input)
            data.forEach((x) => {
                // Getting info about group
                const groupKey = x.group as string
                const group = self.groups[groupKey]

                // Registering properties about object amounts
                const objectInfo = self.sceneObjectInfo[groupKey]
                if (!objectInfo) return
                objectInfo.perSwitch[0]++
                if (objectInfo.perSwitch[0] > objectInfo.max) {
                    objectInfo.max = objectInfo.perSwitch[0]
                }

                const track = self.getPieceTrack(
                    group.object,
                    groupKey,
                    objectInfo.perSwitch[0] - 1,
                )

                // Get transforms
                const pos = self.getFirstValues(x.position)
                const rot = self.getFirstValues(x.rotation)
                const scale = self.getFirstValues(x.scale)

                // Creating objects
                if (group.object) {
                    const object = copy(group.object)

                    if (group.defaultMaterial) {
                        const materialName = `modelScene${self.ID}_${groupKey}_material`
                        getActiveDifficulty().geometryMaterials[materialName] =
                            group.defaultMaterial
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
                    if (forObject) forObject(object)
                    object.push(false)
                } // Creating event for assigned
                else {
                    const event = animateTrack(0, track)
                    event.animation.position = x
                        .position as RuntimeRawKeyframesVec3
                    event.animation.rotation = x
                        .rotation as RuntimeRawKeyframesVec3
                    event.animation.scale = x.scale as RuntimeRawKeyframesVec3
                    if (forAssigned) forAssigned(event)
                    getActiveDifficulty().customEvents.animateTrackEvents.push(
                        event,
                    )
                }
            })

            Object.keys(self.groups).forEach((x) => {
                const objectInfo = self.sceneObjectInfo[x]
                const group = self.groups[x]

                if (
                    objectInfo.max === 0 && !group.object &&
                    group.disappearWhenAbsent
                ) {
                    createYeetDef()
                    const event = animateTrack(0, x)
                    event.animation.position = 'yeet'
                    event.push(false)
                }
            })
        }

        return await diff.runAsync(process)
    }

    /**
     * Create an animated environment from possibly multiple sources of properties.
     * @param switches The different properties switches in this environment.
     * example usage:
     * ```ts
     * scene.animate([
     *    { input: "model", beat: 5 },
     *    { input: "model_2", beat: 10, duration: 20 }
     * ])
     * ```
     * @param forObject Function to run on each spawned object.
     */
    async animate(
        switches: SceneSwitch[],
        forObject?: (object: GroupObjectTypes) => void,
    ) {
        this.flagInstantiation()
        const diff = getActiveDifficulty()
        // deno-lint-ignore no-this-alias
        const self = this

        async function process() {
            createYeetDef()
            switches.sort((a, b) => a.beat - b.beat)

            // Initialize info
            const animatedMaterials: string[] = []

            Object.keys(self.groups).forEach((x) => {
                self.sceneObjectInfo[x] = {
                    max: 0,
                    perSwitch: {},
                }
                if (!self.groups[x].object) self.sceneObjectInfo[x].max = 1
            })

            // Object animation
            const promises = switches.map(async (s, switchIndex) =>
                await self.processSwitch(
                    s,
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
            Object.keys(self.groups).forEach((groupKey) =>
                self.processGroup(
                    groupKey,
                    yeetEvents,
                    animatedMaterials,
                    forObject,
                )
            )

            Object.values(yeetEvents).forEach((x) => x.push(false))
        }

        return await diff.runAsync(process)
    }

    private async processSwitch(
        s: SceneSwitch,
        switchIndex: number,
        animatedMaterials: string[],
    ) {
        s.animationDuration ??= 0
        s.animationOffset ??= 0

        // This determines whether objects are initialized at beat 0, and this is the first switch.
        // When this is true, assigned objects need to be set in place at beat 0
        // It's wasteful to animate spawned objects into place since we can just set their transforms in the environment statement.
        const firstInitializing = this.initializeObjects &&
            switchIndex === 0 &&
            s.beat !== 0

        // If the animation has any sort of delay, we need to put the objects into place.
        // Though if we're already initializing, we can ignore this.
        const delaying = !firstInitializing && s.animationOffset > 0

        // Initializing the switch properties of each group.
        Object.keys(this.groups).forEach((g) => {
            this.sceneObjectInfo[g].perSwitch[s.beat] = 0
            if (firstInitializing) {
                this.sceneObjectInfo[g].initialPos = []
            }
        })

        const objects = await this.getObjects(s.model)
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
            objectInfo.perSwitch[s.beat]++
            if (objectInfo.perSwitch[s.beat] > objectInfo.max) {
                // increment max if exceeded
                objectInfo.max = objectInfo.perSwitch[s.beat]
            }

            const track = this.getPieceTrack(
                group.object,
                key,
                objectInfo.perSwitch[s.beat] - 1,
            )

            // Set initializing positions
            if (firstInitializing) {
                objectInfo.initialPos![i] = this
                    .getFirstTransform(
                        d,
                    )
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

                if (s.forEvent) {
                    s.forEvent(event, objectInfo.perSwitch[s.beat])
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
                        s.beat,
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
            const event = animateTrack(s.beat, track, s.animationDuration)

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
                if (s.forEvent) {
                    s.forEvent(event, objectInfo.perSwitch[s.beat])
                }
                event.push()
            }

            // Make animation event
            event.beat = s.beat + s.animationOffset!
            event.animation.position = d
                .position as RuntimeRawKeyframesVec3
            event.animation.rotation = d
                .rotation as RuntimeRawKeyframesVec3
            event.animation.scale = d
                .scale as RuntimeRawKeyframesVec3

            // Apply loops if necessary
            if (
                typeof s.model === 'object' &&
                !Array.isArray(s.model) &&
                (s.model as AnimatedOptions).loop !== undefined &&
                (s.model as AnimatedOptions).loop! > 1 &&
                !objectIsStatic
            ) {
                event.repeat = (s.model as AnimatedOptions).loop! - 1
                event.duration /= (s.model as AnimatedOptions).loop!
            }

            // Run callback and then push event
            if (s.forEvent) {
                s.forEvent(event, objectInfo.perSwitch[s.beat])
            }
            event.push(false)
        })
    }

    private processGroup(
        groupKey: string,
        yeetEvents: Record<number, AnimateTrack>,
        animatedMaterials: string[],
        forObject?: (object: GroupObjectTypes) => void,
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
                if (forObject) forObject(object)
                object.push(false)
            }
        }
    }
}
