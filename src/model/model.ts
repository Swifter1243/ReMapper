// deno-lint-ignore-file no-explicit-any no-extra-semi
import { RawKeyframesVec3 } from '../types/animation_types.ts'
import { RawGeometryMaterial } from '../types/environment_types.ts'
import { activeDiff, getActiveDiff } from '../data/beatmap_handler.ts'
import {
    AnimatedObjectInput,
    AnimatedOptions,
    AnimationStart,
    Duration,
    ForEvent,
    GroupObjectTypes,
    ModelGroup,
    ModelObject,
    ObjectInput,
    ReadonlyModel,
    StaticObjectInput,
} from '../types/model_types.ts'

import { arrAdd } from '../utils/array_utils.ts'
import { combineTransforms, rotatePoint } from '../utils/math.ts'

import { cacheData, parseFilePath } from '../general.ts'

import * as CustomEventInternals from '../internals/custom_event.ts'

import { setBaseEnvironmentTrack } from '../beatmap/beatmap.ts'
import { animateComponent, animateTrack } from '../beatmap/custom_event.ts'
import { backLasers } from '../beatmap/basic_event.ts'

import {
    optimizeKeyframes,
    OptimizeSettings,
} from '../animation/anim_optimizer.ts'
import {
    bakeAnimation,
    complexifyArray,
    iterateKeyframes,
    mirrorAnimation,
} from '../animation/animation_utils.ts'
import { FILEPATH } from '../types/beatmap_types.ts'
import { Vec3, Vec4 } from '../types/data_types.ts'
import { copy } from '../utils/general.ts'
import { Environment, Geometry } from '../internals/environment.ts'
import { SingleKeyframe } from 'https://deno.land/x/remapper@2.1.0/src/animation.ts'
import { environment, geometry } from '../mod.ts'

let modelSceneCount = 0
let noYeet = true

export class ModelScene {
    groups = <Record<string, ModelGroup>> {}
    optimizer = new OptimizeSettings()
    bakeAnimFreq = 1 / 32
    trackID: number
    objectInfo = <Record<string, {
        max: number
        perSwitch: Record<number, number>
        initialPos?: ModelObject[]
    }>> {}
    initializePositions = true

    /**
     * Handler for representing object data as part of the environment.
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
        this.trackID = modelSceneCount
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
    enableModelColors = (group?: string) =>
        this.groups[group as string].defaultMaterial = undefined

    private async getObjects(input: AnimatedObjectInput) {
        let objectInput = input as ObjectInput
        let options = {} as AnimatedOptions

        if (typeof input === 'object' && !Array.isArray(input)) {
            objectInput = input.input
            options = input
        }

        if (typeof objectInput === 'string') {
            const inputPath =
                (await parseFilePath(objectInput, '.rmmodel')).path
            const onCache = options.onCache
                ? options.onCache.toString()
                : undefined
            const processing: any[] = [
                options,
                onCache,
                this.groups,
                this.optimizer,
            ]

            const model = getModel(
                inputPath,
                `modelScene${this.trackID}_${inputPath}`,
                (fileObjects) => {
                    if (options.onCache) options.onCache(fileObjects)
                    fileObjects.forEach((x) => {
                        if (options.static) {
                            const makeStatic = (k: RawKeyframesVec3) =>
                                typeof k[0] === 'object'
                                    ? [k[0][0], k[0][1], k[0][2]] as Vec3
                                    : k as Vec3

                            x.pos = makeStatic(x.pos)
                            x.rot = makeStatic(x.rot)
                            x.scale = makeStatic(x.scale)
                        }

                        // Getting relevant object transforms
                        let scale: Vec3 | undefined
                        let anchor: Vec3 | undefined
                        let rotation: Vec3 | undefined

                        const group = this.groups[x.track as string]
                        if (group) {
                            if (group.scale) scale = group.scale
                            if (group.anchor) anchor = group.anchor
                            if (group.rotation) rotation = group.rotation
                        }

                        // Making keyframes a consistent array format
                        x.pos = complexifyArray(x.pos)
                        x.rot = complexifyArray(x.rot)
                        x.scale = complexifyArray(x.scale)

                        // Applying transformation to each keyframe
                        for (let i = 0; i < x.pos.length; i++) {
                            let objPos = copy(
                                x.pos[i],
                            ) as SingleKeyframe
                            let objRot = copy(
                                x.rot[i],
                            ) as SingleKeyframe
                            let objScale = copy(
                                x.scale[i],
                            ) as SingleKeyframe
                            objPos.pop()
                            objRot.pop()
                            objScale.pop()

                            if (options.transform) {
                                const combined = combineTransforms(
                                    {
                                        pos: objPos as Vec3,
                                        rot: objRot as Vec3,
                                        scale: objScale as Vec3,
                                    },
                                    options.transform,
                                    options.transform.anchor,
                                )
                                objPos = combined.pos
                                objRot = combined.rot
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
                                objRot = (objRot as Vec3).map((x, i) =>
                                    (x + (rotation as Vec3)[i]) % 360
                                )
                            }
                            if (scale) {
                                objScale = (objScale as Vec3).map((x, i) =>
                                    x * (scale as Vec3)[i]
                                )
                            }

                            ;(x.pos)[i] = [...(objPos as Vec3), (x.pos)[i][3]]
                            ;(x.rot)[i] = [...(objRot as Vec3), (x.rot)[i][3]]
                            ;(x.scale)[i] = [
                                ...(objScale as Vec3),
                                (x.scale)[i][3],
                            ]
                        }

                        // Optimizing object
                        x.pos = optimizeKeyframes(x.pos, this.optimizer)
                        x.rot = optimizeKeyframes(x.rot, this.optimizer)
                        x.scale = optimizeKeyframes(x.scale, this.optimizer)

                        // Loop animation
                        if (options.mirror) {
                            x.pos = mirrorAnimation(x.pos)
                            x.rot = mirrorAnimation(x.rot)
                            x.scale = mirrorAnimation(x.scale)
                        }
                    })
                    return fileObjects
                },
                processing,
            )
            if (options.objects) options.objects(await model)
            return model
        } else {
            const outputObjects: ModelObject[] = []
            if (options.objects) options.objects(objectInput)
            objectInput.forEach((x) => {
                if (options.static) {
                    const makeStatic = (k: RawKeyframesVec3) =>
                        typeof k[0] === 'object'
                            ? [k[0][0], k[0][1], k[0][2]] as Vec3
                            : k as Vec3

                    x.pos = makeStatic(x.pos)
                    x.rot = makeStatic(x.rot)
                    x.scale = makeStatic(x.scale)
                }

                // Getting relevant object transforms
                let scale: Vec3 | undefined
                let anchor: Vec3 | undefined
                let rotation: Vec3 | undefined

                const group = this.groups[x.track as string]
                if (group) {
                    if (group.scale) scale = group.scale
                    if (group.anchor) anchor = group.anchor
                    if (group.rotation) rotation = group.rotation
                }

                if (
                    (anchor && options.bake !== false && !options.static) ||
                    options.bake || options.transform
                ) {
                    // Baking animation
                    const bakedCube: ModelObject = bakeAnimation(
                        { pos: x.pos, rot: x.rot, scale: x.scale },
                        (transform) => {
                            if (options.transform) {
                                const combined = combineTransforms(
                                    {
                                        pos: transform.pos,
                                        rot: transform.rot,
                                        scale: transform.scale,
                                    },
                                    options.transform,
                                    options.transform.anchor,
                                )
                                transform.pos = combined.pos
                                transform.rot = combined.rot
                                transform.scale = combined.scale
                            }

                            transform.pos = applyAnchor(
                                transform.pos,
                                transform.rot,
                                transform.scale,
                                anchor ?? [0, 0, 0] as Vec3,
                            )
                        },
                        this.bakeAnimFreq,
                        this.optimizer,
                    )

                    x.pos = bakedCube.pos
                    x.rot = bakedCube.rot
                    x.scale = bakedCube.scale
                }

                if (rotation) {
                    iterateKeyframes(x.rot, (y) => {
                        y[0] = (y[0] + (rotation!)[0]) % 360
                        y[1] = (y[1] + (rotation!)[1]) % 360
                        y[2] = (y[2] + (rotation!)[2]) % 360
                    })
                }

                if (scale) {
                    iterateKeyframes(x.scale, (y) => {
                        y[0] *= (scale!)[0]
                        y[1] *= (scale!)[1]
                        y[2] *= (scale!)[2]
                    })
                }

                // Loop animation
                if (options.mirror) {
                    x.pos = mirrorAnimation(x.pos)
                    x.rot = mirrorAnimation(x.rot)
                    x.scale = mirrorAnimation(x.scale)
                }

                outputObjects.push(x)
            })

            return outputObjects
        }
    }

    private getPieceTrack = (
        object: undefined | GroupObjectTypes,
        track: string,
        index: number,
    ) => object ? `modelScene${this.trackID}_${track}_${index}` : track

    private getFirstValues(keyframes: RawKeyframesVec3) {
        const complexTransform = complexifyArray(copy(keyframes))[0]
        return [
            complexTransform[0],
            complexTransform[1],
            complexTransform[2],
        ] as Vec3
    }

    private getFirstTransform(obj: ModelObject) {
        return {
            pos: this.getFirstValues(obj.pos),
            rot: this.getFirstValues(obj.rot),
            scale: this.getFirstValues(obj.scale),
        }
    }

    /**
     * Create a one-time environment from static data.
     * @param input Input for ModelObjects.
     * @param forObject Function to run on each spawned object.
     * @param forAssigned Function to run on each assigned object.
     */
    async static(
        input: StaticObjectInput,
        forObject?: (object: GroupObjectTypes) => void,
        forAssigned?: (event: CustomEventInternals.AnimateTrack) => void,
    ) {
        const diff = getActiveDiff()
        return await diff.runAsync(async () => {
            // Initialize info
            Object.keys(this.groups).forEach((x) => {
                this.objectInfo[x] = {
                    max: 0,
                    perSwitch: {
                        0: 0,
                    },
                }
            })

            await this.getObjects(input).then((data) =>
                data.forEach((x) => {
                    // Getting info about group
                    const groupKey = x.track as string
                    const group = this.groups[groupKey]

                    // Registering data about object amounts
                    const objectInfo = this.objectInfo[groupKey]
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
                    const pos = this.getFirstValues(x.pos)
                    const rot = this.getFirstValues(x.rot)
                    const scale = this.getFirstValues(x.scale)

                    // Creating objects
                    if (group.object) {
                        const object = copy(group.object)

                        if (group.defaultMaterial) {
                            const materialName =
                                `modelScene${this.trackID}_${groupKey}_material`
                            activeDiff.geoMaterials[materialName] =
                                group.defaultMaterial
                            ;(object as Geometry).material = materialName
                        }

                        if (
                            object instanceof Geometry &&
                            !group.defaultMaterial &&
                            typeof object.material !== 'string' &&
                            !object.material.color &&
                            x.color
                        ) object.material.color = x.color

                        object.track.value = track
                        object.position = pos
                        object.rotation = rot
                        object.scale = scale
                        if (forObject) forObject(object)
                        object.push(false)
                    } // Creating event for assigned
                    else {
                        const event = animateTrack(0, track)
                        event.animation.position = x.pos
                        event.animation.rotation = x.rot
                        event.animation.scale = x.scale
                        if (forAssigned) forAssigned(event)
                        activeDiff.animateTracks.push(event)
                    }
                })
            )

            Object.keys(this.groups).forEach((x) => {
                const objectInfo = this.objectInfo[x]
                const group = this.groups[x]

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
        })
    }

    /**
     * Create an animated environment from possibly multiple sources of data.
     * @param switches The different data switches in this environment. The format is as so:
     * [0] - Input for ModelObjects.
     * [1] - Time of the switch.
     * [2]? - Duration of the animation.
     * [3]? - Time to wait until animation starts.
     * [4]? - Function to run on each event moving the objects.
     * @param forObject Function to run on each spawned object.
     */
    async animate(switches: [
        AnimatedObjectInput,
        number,
        Duration?,
        AnimationStart?,
        ForEvent?,
    ][], forObject?: (object: GroupObjectTypes) => void) {
        const diff = getActiveDiff()
        return await diff.runAsync(async () => {
            createYeetDef()
            switches.sort((a, b) => a[1] - b[1])

            // Initialize info
            const animatedMaterials: string[] = []

            Object.keys(this.groups).forEach((x) => {
                this.objectInfo[x] = {
                    max: 0,
                    perSwitch: {},
                }
                if (!this.groups[x].object) this.objectInfo[x].max = 1
            })

            const promises: Promise<unknown>[] = []

            // Object animation
            switches.forEach((x, switchIndex) => {
                const input = x[0]
                const time = x[1]
                const duration = x[2] ?? 0
                const start = x[3] ?? 0
                const forEvent = x[4]

                const firstInitializing = this.initializePositions &&
                    switchIndex === 0 &&
                    time !== 0
                const delaying = !firstInitializing && start > 0
                Object.keys(this.groups).forEach((x) => {
                    this.objectInfo[x].perSwitch[time] = 0
                    if (firstInitializing) this.objectInfo[x].initialPos = []
                })

                promises.push(
                    this.getObjects(input).then((data) =>
                        data.forEach((x, i) => {
                            const objectIsStatic = 
                                complexifyArray(x.pos).length === 1 &&
                                complexifyArray(x.rot).length === 1 &&
                                complexifyArray(x.scale).length === 1

                            // Getting info about group
                            const key = x.track as string
                            const group = this.groups[key]

                            // Registering data about object amounts
                            const objectInfo = this.objectInfo[key]
                            if (!objectInfo) return
                            objectInfo.perSwitch[time]++
                            if (objectInfo.perSwitch[time] > objectInfo.max) {
                                objectInfo.max = objectInfo.perSwitch[time]
                            }

                            const track = this.getPieceTrack(
                                group.object,
                                key,
                                objectInfo.perSwitch[time] - 1,
                            )

                            // Set initializing data
                            if (firstInitializing) {
                                objectInfo.initialPos![i] = this
                                    .getFirstTransform(
                                        x,
                                    )
                            }

                            // Initialize assigned object position
                            if (!group.object && firstInitializing) {
                                const event = animateTrack(0, track)
                                const initalizePos = objectInfo.initialPos![i]
                                event.animation.position = initalizePos
                                    .pos as Vec3
                                event.animation.rotation = initalizePos
                                    .rot as Vec3
                                event.animation.scale = initalizePos
                                    .scale as Vec3
                                if (forEvent) {
                                    forEvent(event, objectInfo.perSwitch[time])
                                }
                                event.push(false)
                            }

                            // Creating event
                            if (
                                group.object &&
                                group.object instanceof Geometry &&
                                !group.defaultMaterial &&
                                typeof group.object.material !== 'string' &&
                                !group.object.material.color &&
                                x.color
                            ) {
                                x.color[3] ??= 1
                                animatedMaterials.push(track)

                                if (firstInitializing) {
                                    objectInfo.initialPos![i].color = x.color
                                } else {
                                    const event = animateTrack(
                                        time,
                                        track + '_material',
                                    )
                                    event.animation.color = x.color as Vec4
                                    event.push(false)
                                }
                            }

                            if (objectIsStatic && firstInitializing && group.object) {
                                return
                            }

                            const event = animateTrack(time, track, duration)

                            if (delaying) {
                                event.animation.position = this.getFirstValues(
                                    x.pos,
                                )
                                event.animation.rotation = this.getFirstValues(
                                    x.rot,
                                )
                                event.animation.scale = this.getFirstValues(
                                    x.scale,
                                )
                                if (forEvent) {
                                    forEvent(event, objectInfo.perSwitch[time])
                                }
                                event.push()
                            }

                            event.time = time + start
                            event.animation.position = x.pos
                            event.animation.rotation = x.rot
                            event.animation.scale = x.scale

                            if (
                                typeof input === 'object' &&
                                !Array.isArray(input) &&
                                input.loop !== undefined &&
                                input.loop > 1 &&
                                !objectIsStatic
                            ) {
                                event.repeat = input.loop - 1
                                event.duration /= input.loop
                            }

                            if (forEvent) {
                                forEvent(event, objectInfo.perSwitch[time])
                            }
                            event.push(false)
                        })
                    ),
                )
            })

            const yeetEvents: Record<
                number,
                CustomEventInternals.AnimateTrack
            > = {}

            await Promise.all(promises)

            Object.keys(this.groups).forEach((groupKey) => {
                const group = this.groups[groupKey]
                const objectInfo = this.objectInfo[groupKey]
                if (!objectInfo) return

                // Yeeting objects
                Object.keys(objectInfo.perSwitch).forEach(
                    (switchTime, switchIndex) => {
                        const numSwitchTime = parseInt(switchTime)
                        const firstInitializing = this.initializePositions &&
                            switchIndex === 0 && numSwitchTime !== 0
                        const eventTime = firstInitializing
                            ? 0
                            : parseInt(switchTime)
                        const amount = objectInfo.perSwitch[numSwitchTime]

                        if (group.disappearWhenAbsent || group.object) {
                            for (let i = amount; i < objectInfo.max; i++) {
                                if (!yeetEvents[numSwitchTime]) {
                                    const event = animateTrack(eventTime, [])
                                    event.animation.position = 'yeet'
                                    yeetEvents[numSwitchTime] = event
                                }
                                yeetEvents[numSwitchTime].track.add(
                                    this.getPieceTrack(
                                        group.object,
                                        groupKey,
                                        i,
                                    ),
                                )
                            }
                        }
                    },
                )

                const initializing = objectInfo.initialPos !== undefined

                // Spawning objects
                if (group.object) {
                    let materialName: string | undefined = undefined
                    if (group.defaultMaterial) {
                        materialName =
                            `modelScene${this.trackID}_${groupKey}_material`
                        activeDiff.geoMaterials[materialName] =
                            group.defaultMaterial
                    }

                    for (let i = 0; i < objectInfo.max; i++) {
                        const object = copy(group.object)
                        object.track.value = this.getPieceTrack(
                            group.object,
                            groupKey,
                            i,
                        )

                        if (initializing) {
                            const initialPos = objectInfo.initialPos![i]
                            object.position = initialPos.pos as Vec3
                            object.rotation = initialPos.rot as Vec3
                            object.scale = initialPos.scale as Vec3
                            if (initialPos.color) {
                                ;((object as Geometry)
                                    .material as RawGeometryMaterial).color =
                                        initialPos.color
                            }
                        }

                        if (materialName) {
                            ;(object as Geometry).material = materialName
                        }
                        if (
                            animatedMaterials.some((x) =>
                                x === object.track.value
                            )
                        ) {
                            ;((object as Geometry)
                                .material as RawGeometryMaterial)
                                .track = object.track.value + '_material'
                        }

                        if (forObject) forObject(object)
                        object.push(false)
                    }
                }
            })

            Object.keys(yeetEvents).forEach((x) => {
                activeDiff.animateTracks.push(yeetEvents[parseInt(x)])
            })
        })
    }
}

/**
 * Get the anchor offset for an object based on various transforms.
 * @param objPos Position of the object.
 * @param objRot Rotation of the object.
 * @param objScale Scale of the object.
 * @param anchor Anchor vector to move the object.
 */
export function applyAnchor(
    objPos: Vec3,
    objRot: Vec3,
    objScale: Vec3,
    anchor: Vec3,
) {
    const offset = rotatePoint(
        objScale.map((x, i) => x * anchor[i]) as Vec3,
        objRot,
    )
    return objPos.map((x, i) => x + offset[i]) as Vec3
}

function createYeetDef() {
    if (noYeet === true) {
        noYeet = false
        getActiveDiff().pointDefinitions.yeet = [0, -69420, 0]
    }
}

/**
 * Get the objects from a .rmmodel, caches data if model hasn't changed.
 * @param filePath Path to the .rmmodel.
 * @param name Name to cache the data as. Defaults to file name.
 * @param process Function to run for each object on the cached data.
 * @param processing Parameters that will re-process the data if changed.
 */
export async function getModel(
    filePath: FILEPATH,
    name?: string,
    process?: (objects: ModelObject[]) => void,
    processing?: any[],
) {
    const parsedPath = await parseFilePath(filePath, '.rmmodel')
    const inputPath = parsedPath.path
    const mTime = await Deno.stat(inputPath).then(x => x.mtime?.toString())
    processing ??= []
    processing.push.apply(processing, [mTime, process?.toString()])

    name ??= parsedPath.name

    return cacheData(name, async () => {
        const data = JSON.parse(
            await Deno.readTextFile(
                (await parseFilePath(filePath, '.rmmodel')).path,
            ),
        )
        process?.(data.objects)
        return data.objects as ReadonlyModel
    }, processing)
}

/**
 * Debug the transformations necessary to fit an object to a cube.
 * Use the axis indicators to guide the process.
 * @param input Object to spawn.
 * @param resolution The scale of the object for each axis.
 * @param scale The scale multiplier for the spawned object previously mentioned.
 * @param anchor The anchor offset for the spawned object previously mentioned.
 * @param rotation The rotation offset for the spawned object previously mentioned.
 */
export function debugObject(
    input: GroupObjectTypes,
    resolution: number,
    scale?: Vec3,
    anchor?: Vec3,
    rotation?: Vec3,
) {
    const diff = getActiveDiff()
    diff.clear(['Geometry Materials'])

    backLasers().on([3, 3, 3, 1]).push(false)

    setBaseEnvironmentTrack('fog')
    const fogEvent = animateComponent(0, 'fog')
    fogEvent.fog.attenuation = [0.000001]
    fogEvent.fog.startY = [-69420]
    fogEvent.push(false)

    environment({
        id: 'NarrowGameHUD', 
        lookupMethod: 'EndsWith',
        active: false,
    }).push()

    activeDiff.geoMaterials.debugCubeX = {
        shader: 'Standard',
        color: [1, 0, 0],
        shaderKeywords: [],
    }

    activeDiff.geoMaterials.debugCubeY = {
        shader: 'Standard',
        color: [0, 1, 0],
        shaderKeywords: [],
    }

    activeDiff.geoMaterials.debugCubeZ = {
        shader: 'Standard',
        color: [0, 0, 1],
        shaderKeywords: [],
    }

    const modelData: ModelObject[] = []

    function addCubes(transforms: [Vec3, Vec3?, string?][], track?: string) {
        transforms.forEach((transform) => {
            const data: ModelObject = {
                pos: arrAdd(transform[0], [0, 10, 0]) as Vec3,
                rot: [0, 0, 0],
                scale: transform[1] ?? [1, 1, 1],
            }

            if (track) data.track = track
            if (transform[2]) data.track = transform[2]

            modelData.push(data)
        })
    }

    const axisDist = 5

    // Debug
    addCubes([
        [[0, axisDist, 0], [1, 0.0001, 1], 'debugCubeY'],
        [[0, -axisDist, 0], [1, 0.0001, 1], 'debugCubeY'],
        [[axisDist, 0, 0], [0.0001, 1, 1], 'debugCubeX'],
        [[-axisDist, 0, 0], [0.0001, 1, 1], 'debugCubeX'],
        [[0, 0, axisDist], [1, 1, 0.0001], 'debugCubeZ'],
        [[0, 0, -axisDist], [1, 1, 0.0001], 'debugCubeZ'],
    ])

    // Object
    addCubes([
        [[0, resolution / 2 + axisDist, 0], [1, resolution, 1]],
        [[0, -resolution / 2 - axisDist, 0], [1, resolution, 1]],
        [[resolution / 2 + axisDist, 0, 0], [resolution, 1, 1]],
        [[-resolution / 2 - axisDist, 0, 0], [resolution, 1, 1]],
        [[0, 0, resolution / 2 + axisDist], [1, 1, resolution]],
        [[0, 0, -resolution / 2 - axisDist], [1, 1, resolution]],
    ])

    const scene = new ModelScene(input, scale, anchor, rotation)
    scene.addPrimaryGroups('debugCubeX', geometry('Cube', 'debugCubeX'))
    scene.addPrimaryGroups('debugCubeY', geometry('Cube', 'debugCubeY'))
    scene.addPrimaryGroups('debugCubeZ', geometry('Cube', 'debugCubeZ'))
    scene.static(modelData)
}
