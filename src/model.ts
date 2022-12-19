// deno-lint-ignore-file no-explicit-any
import { arrAdd, cacheData, ColorType, copy, iterateKeyframes, rotatePoint, Vec3, Vec4, parseFilePath, baseEnvironmentTrack, getBoxBounds, Bounds } from "./general.ts";
import { bakeAnimation, complexifyArray, KeyframeValues, mirrorAnimation, RawKeyframesVec3 } from "./animation.ts";
import { Environment, Geometry, RawGeometryMaterial } from "./environment.ts";
import { optimizeAnimation, OptimizeSettings } from "./anim_optimizer.ts";
import { CustomEvent, CustomEventInternals } from "./custom_event.ts";
import { activeDiff, activeDiffGet } from "./beatmap.ts";
import { Regex } from "./regex.ts";
import { Event } from "./basicEvent.ts";
import { FILEPATH } from "./constants.ts";
import { modelToWall, Wall } from "./wall.ts";

let modelSceneCount = 0;
let noYeet = true;

/** Objects that are allowed to be spawned with a ModelScene. */
export type GroupObjectTypes = Environment | Geometry;
/** Allowed options for providing data to a ModelScene. */
export type ObjectInput = FILEPATH | ModelObject[];

/** Input options for the "static" method in a ModelScene. */
export type StaticOptions = {
    /** The input of objects. Can be an array of objects or a path to a model. */
    input: ObjectInput,
    /** Function to run on objects when they're being cached. Only works for path input. */
    onCache?: (objs: ModelObject[]) => void,
    /** Function to run on objects about to be processed.
        Be careful when mutating these, as cached objects are stored across script executions. */
    objects?: (arr: ModelObject[]) => void,
    /** Recache the objects when information in this array changes. Only works for path input. */
    processing?: any
}

/** Input options for the "animate" method in a ModelScene. */
export type AnimatedOptions = StaticOptions & {
    /** Whether or not to re-bake the object animations if you input an array of objects.
        On by default, I would recommend not touching this unless you know what you're doing. */
    bake?: boolean,
    /** If this input is animated, use the only first frame. */
    static?: boolean,
    /** Whether to loop the animation. */
    loop?: number,
    /** Whether to mirror the animation. */
    mirror?: boolean
}

/** Allowed inputs for the "static" method in ModelScene. */
export type StaticObjectInput = ObjectInput | StaticOptions
/** Allowed inputs for the "animate" method in ModelScene. */
export type AnimatedObjectInput = ObjectInput | AnimatedOptions

type ModelGroup = {
    object?: GroupObjectTypes,
    anchor?: Vec3,
    scale?: Vec3,
    rotation?: Vec3,
    disappearWhenAbsent?: boolean,
    defaultMaterial?: RawGeometryMaterial
}

/** The data type used by ModelScene to define objects. */
export interface ModelObject {
    pos: RawKeyframesVec3;
    rot: RawKeyframesVec3;
    scale: RawKeyframesVec3;
    color?: ColorType;
    track?: string;
}

type Duration = number | undefined;
type AnimationStart = number | undefined;
type ForEvent = ((event: CustomEventInternals.AnimateTrack, objects: number) => void) | undefined;

export class ModelScene {
    groups = <Record<string, ModelGroup>>{};
    optimizer = new OptimizeSettings();
    bakeAnimFreq = 1 / 32;
    trackID: number;
    objectInfo = <Record<string, {
        max: number,
        perSwitch: Record<number, number>;
        initialPos?: ModelObject[];
    }>>{}
    initializePositions = true;

    /**
     * Handler for representing object data as part of the environment. 
     * @param object Object to spawn on model objects with no track.
     * @param scale The scale multiplier for the spawned object previously mentioned.
     * @param anchor The anchor offset for the spawned object previously mentioned.
     * @param rotation The rotation offset for the spawned object previously mentioned.
     */
    constructor(object?: GroupObjectTypes, scale?: Vec3, anchor?: Vec3, rotation?: Vec3) {
        if (object) this.pushGroup(undefined, object, scale, anchor, rotation);
        this.trackID = modelSceneCount;
        modelSceneCount++;
    }

    private pushGroup(key: string | undefined, object?: GroupObjectTypes, scale?: Vec3, anchor?: Vec3, rotation?: Vec3, changeGroup?: (group: ModelGroup) => void) {
        const group: ModelGroup = {}
        if (object) {
            if (object instanceof Environment) object.duplicate = 1;
            if (object instanceof Geometry && typeof object.material !== "string")
                group.defaultMaterial = object.material;
            object.position = [0, -69420, 0];
            group.object = object
        }
        if (scale) group.scale = scale;
        if (anchor) group.anchor = anchor;
        if (rotation) group.rotation = rotation;
        if (changeGroup) changeGroup(group);
        this.groups[key as string] = group;
    }

    /**
     * Assign a track in input ModelObjects to spawn and pool new objects.
     * @param track Track to check for.
     * @param object Object to spawn.
     * @param scale The scale multiplier for the spawned object previously mentioned.
     * @param anchor The anchor offset for the spawned object previously mentioned.
     * @param rotation The rotation offset for the spawned object previously mentioned.
     */
    addPrimaryGroups(track: string | string[], object: GroupObjectTypes, scale?: Vec3, anchor?: Vec3, rotation?: Vec3) {
        const tracks = typeof track === "object" ? track : [track];
        tracks.forEach(t => {
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
    assignObjects(track: string | string[], scale?: Vec3, anchor?: Vec3, rotation?: Vec3, disappearWhenAbsent = true) {
        const tracks = typeof track === "object" ? track : [track];
        tracks.forEach(t => {
            this.pushGroup(t, undefined, scale, anchor, rotation, x => {
                x.disappearWhenAbsent = disappearWhenAbsent;
            })
        })
    }

    /**
     * Spawn every object in a group with a unique material.
     * Allows colors from models to be applied to geometry.
     * Should be used with caution as it creates a unique material per object.
     * @param group The group to enable unique materials on. Leave undefined to effect base group.
     */
    enableModelColors = (group?: string) => this.groups[group as string].defaultMaterial = undefined;

    private getObjects(input: AnimatedObjectInput) {
        let objectInput = input as ObjectInput;
        let options = {} as AnimatedOptions;

        if (typeof input === "object" && !Array.isArray(input)) {
            objectInput = input.input;
            options = input;
        }

        if (typeof objectInput === "string") {
            const inputPath = parseFilePath(objectInput, ".rmmodel").path;
            const onCache = options.onCache ? options.onCache.toString() : undefined;
            const processing: any[] = [options, onCache, this.groups, this.optimizer];

            const model = getModel(inputPath, `modelScene${this.trackID}_${inputPath}`, fileObjects => {
                if (options.onCache) options.onCache(fileObjects);
                fileObjects.forEach(x => {
                    if (options.static) {
                        const makeStatic = (k: RawKeyframesVec3) =>
                            typeof k[0] === "object" ? [k[0][0], k[0][1], k[0][2]] as Vec3 : k as Vec3

                        x.pos = makeStatic(x.pos);
                        x.rot = makeStatic(x.rot);
                        x.scale = makeStatic(x.scale);
                    }

                    // Getting relevant object transforms
                    let scale: Vec3 | undefined
                    let anchor: Vec3 | undefined;
                    let rotation: Vec3 | undefined

                    const group = this.groups[x.track as string];
                    if (group) {
                        if (group.scale) scale = group.scale
                        if (group.anchor) anchor = group.anchor
                        if (group.rotation) rotation = group.rotation
                    }

                    // Making keyframes a consistent array format
                    x.pos = complexifyArray(x.pos);
                    x.rot = complexifyArray(x.rot);
                    x.scale = complexifyArray(x.scale);

                    // Applying transformation to each keyframe
                    for (let i = 0; i < x.pos.length; i++) {
                        let objPos = copy(x.pos[i]) as KeyframeValues;
                        let objRot = copy(x.rot[i]) as KeyframeValues;
                        let objScale = copy(x.scale[i]) as KeyframeValues;
                        objPos.pop();
                        objRot.pop();
                        objScale.pop();

                        if (anchor) objPos = applyAnchor(objPos as Vec3, objRot as Vec3, objScale as Vec3, anchor);
                        if (rotation) objRot = (objRot as Vec3).map((x, i) => (x + (rotation as Vec3)[i]) % 360);
                        if (scale) objScale = (objScale as Vec3).map((x, i) => x * (scale as Vec3)[i]);

                        (x.pos)[i] = [...(objPos as Vec3), (x.pos)[i][3]];
                        (x.rot)[i] = [...(objRot as Vec3), (x.rot)[i][3]];
                        (x.scale)[i] = [...(objScale as Vec3), (x.scale)[i][3]];
                    }

                    // Optimizing object
                    x.pos = optimizeAnimation(x.pos, this.optimizer);
                    x.rot = optimizeAnimation(x.rot, this.optimizer);
                    x.scale = optimizeAnimation(x.scale, this.optimizer);

                    // Loop animation
                    if (options.mirror) {
                        x.pos = mirrorAnimation(x.pos);
                        x.rot = mirrorAnimation(x.rot);
                        x.scale = mirrorAnimation(x.scale);
                    }
                })
                return fileObjects;
            }, processing)
            if (options.objects) options.objects(model);
            return model;
        }
        else {
            const outputObjects: ModelObject[] = [];
            if (options.objects) options.objects(objectInput);
            objectInput.forEach(x => {
                if (options.static) {
                    const makeStatic = (k: RawKeyframesVec3) =>
                        typeof k[0] === "object" ? [k[0][0], k[0][1], k[0][2]] as Vec3 : k as Vec3

                    x.pos = makeStatic(x.pos);
                    x.rot = makeStatic(x.rot);
                    x.scale = makeStatic(x.scale);
                }

                // Getting relevant object transforms
                let scale: Vec3 | undefined;
                let anchor: Vec3 | undefined;
                let rotation: Vec3 | undefined;

                const group = this.groups[x.track as string];
                if (group) {
                    if (group.scale) scale = group.scale
                    if (group.anchor) anchor = group.anchor
                    if (group.rotation) rotation = group.rotation
                }

                if ((anchor && options.bake !== false && !options.static) || options.bake) {
                    // Baking animation
                    const bakedCube: ModelObject = bakeAnimation({ pos: x.pos, rot: x.rot, scale: x.scale }, transform => {
                        transform.pos = applyAnchor(transform.pos, transform.rot, transform.scale, anchor ?? [0, 0, 0] as Vec3);
                    }, this.bakeAnimFreq, this.optimizer);

                    x.pos = bakedCube.pos;
                    x.rot = bakedCube.rot;
                    x.scale = bakedCube.scale;
                }

                if (rotation) iterateKeyframes(x.rot, y => {
                    y[0] = (y[0] + (rotation!)[0]) % 360;
                    y[1] = (y[1] + (rotation!)[1]) % 360;
                    y[2] = (y[2] + (rotation!)[2]) % 360;
                })

                if (scale) iterateKeyframes(x.scale, y => {
                    y[0] *= (scale!)[0];
                    y[1] *= (scale!)[1];
                    y[2] *= (scale!)[2];
                })

                // Loop animation
                if (options.mirror) {
                    x.pos = mirrorAnimation(x.pos);
                    x.rot = mirrorAnimation(x.rot);
                    x.scale = mirrorAnimation(x.scale);
                }

                outputObjects.push(x);
            })

            return outputObjects;
        }
    }

    private getPieceTrack = (object: undefined | GroupObjectTypes, track: string, index: number) =>
        object ? `modelScene${this.trackID}_${track}_${index}` : track

    private getFirstValues(keyframes: RawKeyframesVec3) {
        const complexTransform = complexifyArray(copy(keyframes))[0];
        return [complexTransform[0], complexTransform[1], complexTransform[2]] as Vec3;
    }

    private getFirstTransform(obj: ModelObject) {
        return {
            pos: this.getFirstValues(obj.pos),
            rot: this.getFirstValues(obj.rot),
            scale: this.getFirstValues(obj.scale)
        }
    }

    /**
     * Create a one-time environment from static data.
     * @param input Input for ModelObjects.
     * @param forObject Function to run on each spawned object.
     * @param forAssigned Function to run on each assigned object.
     */
    static(input: StaticObjectInput, forObject?: (object: GroupObjectTypes) => void, forAssigned?: (event: CustomEventInternals.AnimateTrack) => void) {
        const data = this.getObjects(input);

        // Initialize info
        Object.keys(this.groups).forEach(x => {
            this.objectInfo[x] = {
                max: 0,
                perSwitch: {
                    0: 0
                }
            }
        })

        data.forEach(x => {
            // Getting info about group
            const groupKey = x.track as string;
            const group = this.groups[groupKey];

            // Registering data about object amounts
            const objectInfo = this.objectInfo[groupKey];
            if (!objectInfo) return;
            objectInfo.perSwitch[0]++;
            if (objectInfo.perSwitch[0] > objectInfo.max) objectInfo.max = objectInfo.perSwitch[0];

            const track = this.getPieceTrack(group.object, groupKey, objectInfo.perSwitch[0] - 1);

            // Get transforms
            const pos = this.getFirstValues(x.pos);
            const rot = this.getFirstValues(x.rot);
            const scale = this.getFirstValues(x.scale);

            // Creating objects
            if (group.object) {
                const object = copy(group.object)

                if (group.defaultMaterial) {
                    const materialName = `modelScene${this.trackID}_${groupKey}_material`;
                    activeDiff.geoMaterials[materialName] = group.defaultMaterial;
                    (object as Geometry).material = materialName;
                }

                if (
                    object instanceof Geometry &&
                    !group.defaultMaterial &&
                    typeof object.material !== "string" &&
                    !object.material.color &&
                    x.color
                ) object.material.color = x.color;

                object.track.value = track;
                object.position = pos;
                object.rotation = rot;
                object.scale = scale;
                if (forObject) forObject(object);
                object.push(false);
            }
            // Creating event for assigned
            else {
                const event = new CustomEvent().animateTrack(track);
                event.animate.set("position", x.pos, false);
                event.animate.set("rotation", x.rot, false);
                event.animate.set("scale", x.scale, false);
                if (forAssigned) forAssigned(event);
                activeDiff.customEvents.push(event);
            }
        })

        Object.keys(this.groups).forEach(x => {
            const objectInfo = this.objectInfo[x];
            const group = this.groups[x];

            if (objectInfo.max === 0 && !group.object && group.disappearWhenAbsent) {
                createYeetDef();
                const event = new CustomEvent().animateTrack(x);
                event.animate.position = "yeet";
                event.push(false);
            }
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
    animate(switches: [
        AnimatedObjectInput,
        number,
        Duration?,
        AnimationStart?,
        ForEvent?,
    ][], forObject?: (object: GroupObjectTypes) => void) {
        createYeetDef();
        switches.sort((a, b) => a[1] - b[1]);

        // Initialize info
        const animatedMaterials: string[] = [];

        Object.keys(this.groups).forEach(x => {
            this.objectInfo[x] = {
                max: 0,
                perSwitch: {}
            }
            if (!this.groups[x].object) this.objectInfo[x].max = 1;
        })

        // Object animation
        switches.forEach((x, switchIndex) => {
            const input = x[0];
            const time = x[1];
            const duration = x[2] ?? 0;
            const start = x[3] ?? 0;
            const forEvent = x[4];
            const data = this.getObjects(input);

            const firstInitializing = this.initializePositions && switchIndex === 0 && time !== 0;
            const delaying = !firstInitializing && start > 0;
            Object.keys(this.groups).forEach(x => {
                this.objectInfo[x].perSwitch[time] = 0;
                if (firstInitializing) this.objectInfo[x].initialPos = [];
            })

            data.forEach((x, i) => {
                // Getting info about group
                const key = x.track as string;
                const group = this.groups[key];

                // Registering data about object amounts
                const objectInfo = this.objectInfo[key];
                if (!objectInfo) return;
                objectInfo.perSwitch[time]++;
                if (objectInfo.perSwitch[time] > objectInfo.max) objectInfo.max = objectInfo.perSwitch[time];

                const track = this.getPieceTrack(group.object, key, objectInfo.perSwitch[time] - 1);

                // Set initializing data
                if (firstInitializing) objectInfo.initialPos![i] = this.getFirstTransform(x);

                // Initialize assigned object position
                if (!group.object && firstInitializing) {
                    const event = new CustomEvent().animateTrack(track);
                    const initalizePos = objectInfo.initialPos![i];
                    event.animate.position = initalizePos.pos as Vec3;
                    event.animate.rotation = initalizePos.rot as Vec3;
                    event.animate.scale = initalizePos.scale as Vec3;
                    if (forEvent) forEvent(event, objectInfo.perSwitch[time]);
                    event.push(false);
                }

                // Creating event
                if (
                    group.object &&
                    group.object instanceof Geometry &&
                    !group.defaultMaterial &&
                    typeof group.object.material !== "string" &&
                    !group.object.material.color &&
                    x.color
                ) {
                    x.color[3] ??= 1;
                    animatedMaterials.push(track);

                    if (firstInitializing) objectInfo.initialPos![i].color = x.color;
                    else {
                        const event = new CustomEvent(time).animateTrack(track + "_material");
                        event.animate.color = x.color as Vec4;
                        event.push(false);
                    }
                }

                const event = new CustomEvent(time).animateTrack(track, duration);

                if (delaying) {
                    event.animate.set("position", this.getFirstValues(x.pos), false);
                    event.animate.set("rotation", this.getFirstValues(x.rot), false);
                    event.animate.set("scale", this.getFirstValues(x.scale), false);
                    if (forEvent) forEvent(event, objectInfo.perSwitch[time]);
                    event.push();
                }

                event.time = time + start;
                event.animate.set("position", x.pos, false);
                event.animate.set("rotation", x.rot, false);
                event.animate.set("scale", x.scale, false);

                if (
                    typeof input === "object" &&
                    !Array.isArray(input) &&
                    input.loop !== undefined &&
                    input.loop > 1
                ) {
                    event.repeat = input.loop - 1;
                    event.duration /= input.loop;
                }

                if (forEvent) forEvent(event, objectInfo.perSwitch[time]);
                event.push(false);
            })
        })

        const yeetEvents: Record<number, CustomEventInternals.AnimateTrack> = {};

        Object.keys(this.groups).forEach(groupKey => {
            const group = this.groups[groupKey];
            const objectInfo = this.objectInfo[groupKey];
            if (!objectInfo) return;

            // Yeeting objects
            Object.keys(objectInfo.perSwitch).forEach((switchTime, switchIndex) => {
                const numSwitchTime = parseInt(switchTime);
                const firstInitializing = this.initializePositions && switchIndex === 0 && numSwitchTime !== 0;
                const eventTime = firstInitializing ? 0 : parseInt(switchTime);
                const amount = objectInfo.perSwitch[numSwitchTime];

                if (group.disappearWhenAbsent || group.object) for (let i = amount; i < objectInfo.max; i++) {
                    if (!yeetEvents[numSwitchTime]) {
                        const event = new CustomEvent(eventTime).animateTrack();
                        event.animate.position = "yeet";
                        yeetEvents[numSwitchTime] = event;
                    }
                    yeetEvents[numSwitchTime].track.add(this.getPieceTrack(group.object, groupKey, i));
                }
            })

            const initializing = objectInfo.initialPos !== undefined;

            // Spawning objects
            if (group.object) {
                let materialName: string | undefined = undefined;
                if (group.defaultMaterial) {
                    materialName = `modelScene${this.trackID}_${groupKey}_material`;
                    activeDiff.geoMaterials[materialName] = group.defaultMaterial;
                }

                for (let i = 0; i < objectInfo.max; i++) {
                    const object = copy(group.object)
                    object.track.value = this.getPieceTrack(group.object, groupKey, i);

                    if (initializing) {
                        const initialPos = objectInfo.initialPos![i];
                        object.position = initialPos.pos as Vec3;
                        object.rotation = initialPos.rot as Vec3;
                        object.scale = initialPos.scale as Vec3;
                        if (initialPos.color)
                            ((object as Geometry).material as RawGeometryMaterial).color = initialPos.color;
                    }

                    if (materialName) (object as Geometry).material = materialName;
                    if (animatedMaterials.some(x => x === object.track.value))
                        ((object as Geometry).material as RawGeometryMaterial).track = object.track.value + "_material";

                    if (forObject) forObject(object);
                    object.push(false);
                }
            }
        })

        Object.keys(yeetEvents).forEach(x => { activeDiff.customEvents.push(yeetEvents[parseInt(x)]) });
    }
}

/**
 * Get the anchor offset for an object based on various transforms.
 * @param objPos Position of the object.
 * @param objRot Rotation of the object.
 * @param objScale Scale of the object.
 * @param anchor Anchor vector to move the object.
 */
export function applyAnchor(objPos: Vec3, objRot: Vec3, objScale: Vec3, anchor: Vec3) {
    const offset = rotatePoint(objScale.map((x, i) => x * anchor[i]) as Vec3, objRot);
    return objPos.map((x, i) => x + offset[i]) as Vec3;
}

function createYeetDef() {
    if (noYeet === true) {
        noYeet = false;
        activeDiffGet().pointDefinitions.yeet = [0, -69420, 0];
    }
}

/**
 * Get the objects from a .rmmodel, caches data if model hasn't changed.
 * @param filePath Path to the .rmmodel.
 * @param name Name to cache the data as. Defaults to file name.
 * @param process Function to run for each object on the cached data.
 * @param processing Parameters that will re-process the data if changed.
 */
export function getModel(filePath: FILEPATH, name?: string, process?: (objects: ModelObject[]) => void, processing?: any[]) {
    const parsedPath = parseFilePath(filePath, ".rmmodel");
    const inputPath = parsedPath.path;
    const mTime = Deno.statSync(inputPath).mtime?.toString();
    processing ??= [];
    processing.push.apply(processing, [mTime, process?.toString()]);

    name ??= parsedPath.name;

    return cacheData(name, () => {
        const data = JSON.parse(Deno.readTextFileSync(parseFilePath(filePath, ".rmmodel").path));
        if (process) process(data.objects);
        return data.objects as ModelObject[];
    }, processing);
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
export function debugObject(input: GroupObjectTypes, resolution: number, scale?: Vec3, anchor?: Vec3, rotation?: Vec3) {
    activeDiff.notes = [];
    activeDiff.walls = [];
    activeDiff.customEvents = [];
    activeDiff.rawEnvironment = [];

    new Event().backLasers().on([3, 3, 3, 1]).push(false);

    baseEnvironmentTrack("fog");
    const fogEvent = new CustomEvent().animateComponent("fog");
    fogEvent.fog.attenuation = [0.000001];
    fogEvent.fog.startY = [-69420]
    fogEvent.push(false);

    const removeUI = new Environment(new Regex().add("NarrowGameHUD").end(), "Regex");
    removeUI.active = false;
    removeUI.push(false);

    activeDiff.geoMaterials["debugCubeX"] = {
        shader: "Standard",
        color: [1, 0, 0],
        shaderKeywords: []
    }

    activeDiff.geoMaterials["debugCubeY"] = {
        shader: "Standard",
        color: [0, 1, 0],
        shaderKeywords: []
    }

    activeDiff.geoMaterials["debugCubeZ"] = {
        shader: "Standard",
        color: [0, 0, 1],
        shaderKeywords: []
    }

    const modelData: ModelObject[] = [];

    function addCubes(transforms: [Vec3, Vec3?, string?][], track?: string) {
        transforms.forEach(transform => {
            const data: ModelObject = {
                pos: arrAdd(transform[0], [0, 10, 0]) as Vec3,
                rot: [0, 0, 0],
                scale: transform[1] ?? [1, 1, 1]
            }

            if (track) data.track = track;
            if (transform[2]) data.track = transform[2];

            modelData.push(data);
        })
    }

    const axisDist = 5;

    // Debug
    addCubes([
        [[0, axisDist, 0], [1, 0.0001, 1], "debugCubeY"],
        [[0, -axisDist, 0], [1, 0.0001, 1], "debugCubeY"],
        [[axisDist, 0, 0], [0.0001, 1, 1], "debugCubeX"],
        [[-axisDist, 0, 0], [0.0001, 1, 1], "debugCubeX"],
        [[0, 0, axisDist], [1, 1, 0.0001], "debugCubeZ"],
        [[0, 0, -axisDist], [1, 1, 0.0001], "debugCubeZ"]
    ]);

    // Object
    addCubes([
        [[0, resolution / 2 + axisDist, 0], [1, resolution, 1]],
        [[0, -resolution / 2 - axisDist, 0], [1, resolution, 1]],
        [[resolution / 2 + axisDist, 0, 0], [resolution, 1, 1]],
        [[-resolution / 2 - axisDist, 0, 0], [resolution, 1, 1]],
        [[0, 0, resolution / 2 + axisDist], [1, 1, resolution]],
        [[0, 0, -resolution / 2 - axisDist], [1, 1, resolution]]
    ]);

    const scene = new ModelScene(input, scale, anchor, rotation);
    scene.addPrimaryGroups("debugCubeX", new Geometry(undefined, "debugCubeX"))
    scene.addPrimaryGroups("debugCubeY", new Geometry(undefined, "debugCubeY"))
    scene.addPrimaryGroups("debugCubeZ", new Geometry(undefined, "debugCubeZ"))
    scene.static(modelData);
}

type TextObject = {
    pos: Vec3,
    rot: Vec3,
    scale: Vec3,
    color?: ColorType,
    track?: string
}

export class Text {
    /** How the text will be anchored horizontally. */
    horizontalAnchor: "Left" | "Center" | "Right" = "Center";
    /** How the text will be anchored vertically. */
    verticalAnchor: "Top" | "Center" | "Bottom" = "Bottom";
    /** The position of the text box. */
    position: Vec3 = [0, 0, 0];
    /** The height of the text box. */
    height = 2;
    /** The height of the text model. Generated from input. */
    modelHeight = 0;
    /** A scalar of the model height which is used to space letters. */
    letterSpacing = 0.8;
    /** A scalar of the letter spacing which is used as the width of a space. */
    wordSpacing = 0.8;
    /** The model data of the text. */
    model: TextObject[] = [];

    /**
     * An interface to generate objects from text.
     * Each object forming a letter in your model should have a track for the letter it's assigned to.
     * @param input The model data of the text. Can be either a path to a model or a collection of objects.
     */
    constructor(input: string | TextObject[]) {
        this.import(input);
    }

    /**
     * Import a model for the text.
     * @param input The model data of the text. Can be either a path to a model or a collection of objects.
     */
    import(input: string | TextObject[]) {
        if (typeof input === "string") this.model = getModel(input) as TextObject[];
        else this.model = input;
        const bounds = getBoxBounds(this.model);
        this.modelHeight = bounds.highBound[1];
    }

    /**
     * Generate an array of objects containing model data for a string of text.
     * @param text The string of text to generate.
     */
    toObjects(text: string) {
        const letters: Record<string, {
            model: TextObject[],
            bounds: Bounds
        }> = {};
        const model: TextObject[] = [];

        function getLetter(char: string, self: Text) {
            if (letters[char]) return letters[char];
            const letterModel: TextObject[] = self.model.filter(x => x.track === char);
            if (letterModel.length === 0) return undefined;

            letters[char] = {
                model: letterModel,
                bounds: getBoxBounds(letterModel)
            }
            return letters[char];
        }

        let length = 0;
        const letterWidth = this.modelHeight * this.letterSpacing;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            if (char === " ") {
                length += letterWidth * this.wordSpacing;
                continue;
            }

            const letter = getLetter(char, this);
            if (letter === undefined) continue;

            letter.model.forEach(x => {
                const letterModel = {
                    pos: copy(x.pos),
                    rot: copy(x.rot),
                    scale: copy(x.scale)
                }
                letterModel.pos[0] -= letter.bounds.lowBound[0];
                letterModel.pos[2] -= letter.bounds.lowBound[2];
                letterModel.pos[0] += length;
                letterModel.pos[0] += (letterWidth - letter.bounds.scale[0]) / 2;
                model.push(letterModel);
            })
            length += letterWidth;
        }

        const scalar = this.height / this.modelHeight;

        model.forEach(x => {
            if (this.horizontalAnchor === "Center") x.pos[0] -= length / 2;
            if (this.horizontalAnchor === "Right") x.pos[0] -= length;

            x.pos = x.pos.map(y => y * scalar) as Vec3;
            x.scale = x.scale.map(y => y * scalar) as Vec3;
            x.pos = arrAdd(x.pos, this.position);

            if (this.verticalAnchor === "Center") x.pos[1] -= this.height / 2;
            if (this.verticalAnchor === "Top") x.pos[1] -= this.height;
        })

        return model;
    }

    /**
     * Generate walls from a string of text.
     * @param text The string of text to generate.
     * @param start Wall's lifespan start.
     * @param end Wall's lifespan end.
     * @param wall A callback for each wall being spawned.
     * @param distribution Beats to spread spawning of walls out. 
     * Animations are adjusted, but keep in mind path animation events for these walls might be messed up.
     * @param animFreq The frequency for the animation baking (if using array of objects).
     * @param animOptimizer The optimizer for the animation baking (if using array of objects).
     */
    toWalls(
        text: string,
        start: number,
        end: number,
        wall?: (wall: Wall) => void,
        distribution = 1,
        animFreq?: number,
        animOptimizer = new OptimizeSettings()
    ) {
        const model = this.toObjects(text);
        modelToWall(model, start, end, wall, distribution, animFreq, animOptimizer);
    }
}