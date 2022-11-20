// deno-lint-ignore-file no-explicit-any
import { arrAdd, cacheData, ColorType, copy, iterateKeyframes, rotatePoint, Vec3, Vec4, parseFilePath, baseEnvironmentTrack } from "./general.ts";
import { bakeAnimation, complexifyArray, ComplexKeyframesVec3, ComplexKeyframesAny, KeyframeValues, RawKeyframesVec3 } from "./animation.ts";
import { Environment, Geometry, RawGeometryMaterial } from "./environment.ts";
import { optimizeAnimation, OptimizeSettings } from "./anim_optimizer.ts";
import { CustomEvent, CustomEventInternals } from "./custom_event.ts";
import { activeDiff, activeDiffGet } from "./beatmap.ts";
import { Regex } from "./regex.ts";
import { Event } from "./basicEvent.ts";
import { FILEPATH } from "./constants.ts";

let modelSceneCount = 0;
let noYeet = true;

/** Objects that are allowed to be spawned with a ModelScene. */
export type GroupObjectTypes = Environment | Geometry;
/** Allowed options for providing data to a ModelScene. */
export type ObjectInput = FILEPATH | ModelObject[];

/** Input options for the "static" method in a ModelScene. */
export type StaticOptions = {
    input: ObjectInput,
    objects?: (arr: ModelObject[]) => void,
    processing?: any
}

/** Input options for the "animate" method in a ModelScene. */
export type AnimatedOptions = StaticOptions & {
    bake?: boolean,
    static?: boolean
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
    disappearWhenAbsent?: boolean
}

/** The data type used by ModelScene to define objects. */
export interface ModelObject {
    pos: RawKeyframesVec3;
    rot: RawKeyframesVec3;
    scale: RawKeyframesVec3;
    color?: ColorType;
    track?: string;
}

export class ModelScene {
    private groups = <Record<string, ModelGroup>>{};
    optimizer = new OptimizeSettings();
    bakeAnimFreq = 1 / 32;
    trackID: number;
    objectInfo = <Record<string, {
        max: number,
        perSwitch: Record<number, number>;
    }>>{}

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

    private getObjects(input: AnimatedObjectInput) {
        let objectInput = input as ObjectInput;
        let options = {} as AnimatedOptions;

        if (typeof input === "object" && !Array.isArray(input)) {
            objectInput = input.input;
            options = input;
        }

        if (typeof objectInput === "string") {
            const inputPath = parseFilePath(objectInput, ".rmmodel").path;
            const mTime = Deno.statSync(inputPath).mtime?.toString();
            const objects = options.objects ? options.objects.toString() : undefined;
            const processing: any[] = [options, objects, this.groups, this.optimizer, mTime];

            return cacheData(`modelScene${this.trackID}_${inputPath}`, () => {
                const fileObjects = getModel(inputPath);
                if (options.objects) options.objects(fileObjects);
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
                    x.pos = complexifyArray(x.pos) as ComplexKeyframesVec3;
                    x.rot = complexifyArray(x.rot) as ComplexKeyframesVec3;
                    x.scale = complexifyArray(x.scale) as ComplexKeyframesVec3;

                    // Applying transformation to each keyframe
                    for (let i = 0; i < x.pos.length; i++) {
                        let objPos = copy(x.pos[i]) as KeyframeValues;
                        let objRot = copy(x.rot[i]) as KeyframeValues;
                        let objScale = copy(x.scale[i]) as KeyframeValues;
                        objPos.pop();
                        objRot.pop();
                        objScale.pop();

                        objPos = (objPos as Vec3).map(x => x / 2);
                        if (anchor) objPos = applyAnchor(objPos as Vec3, objRot as Vec3, objScale as Vec3, anchor);
                        if (rotation) objRot = (objRot as Vec3).map((x, i) => (x + (rotation as Vec3)[i]) % 360);
                        if (scale) objScale = (objScale as Vec3).map((x, i) => x * (scale as Vec3)[i]);

                        (x.pos as ComplexKeyframesAny)[i] = [...(objPos as Vec3), (x.pos as ComplexKeyframesVec3)[i][3]];
                        (x.rot as ComplexKeyframesAny)[i] = [...(objRot as Vec3), (x.rot as ComplexKeyframesVec3)[i][3]];
                        (x.scale as ComplexKeyframesAny)[i] = [...(objScale as Vec3), (x.scale as ComplexKeyframesVec3)[i][3]];
                    }

                    // Optimizing object
                    x.pos = optimizeAnimation(x.pos, this.optimizer) as RawKeyframesVec3;
                    x.rot = optimizeAnimation(x.rot, this.optimizer) as RawKeyframesVec3;
                    x.scale = optimizeAnimation(x.scale, this.optimizer) as RawKeyframesVec3;
                })
                return fileObjects;
            }, processing)
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

                    bakedCube.track = x.track;
                    x = bakedCube;
                }

                if (rotation) iterateKeyframes(x.rot, y => {
                    y[0] = (y[0] + (rotation as Vec3)[0]) % 360;
                    y[1] = (y[1] + (rotation as Vec3)[1]) % 360;
                    y[2] = (y[2] + (rotation as Vec3)[2]) % 360;
                })

                if (scale) iterateKeyframes(x.scale, y => {
                    y[0] *= (scale as Vec3)[0];
                    y[1] *= (scale as Vec3)[1];
                    y[2] *= (scale as Vec3)[2];
                })

                outputObjects.push(x);
            })

            return outputObjects;
        }
    }

    private getPieceTrack = (object: undefined | GroupObjectTypes, track: string, index: number) =>
        object ? `modelScene${this.trackID}_${track}_${index}` : track

    private getFirstTransform(transform: RawKeyframesVec3) {
        const complexTransform = complexifyArray(copy(transform))[0];
        return [complexTransform[0], complexTransform[1], complexTransform[2]] as Vec3;
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
            const key = x.track as string;
            const group = this.groups[key];

            // Registering data about object amounts
            const objectInfo = this.objectInfo[key];
            if (!objectInfo) return;
            objectInfo.perSwitch[0]++;
            if (objectInfo.perSwitch[0] > objectInfo.max) objectInfo.max = objectInfo.perSwitch[0];

            const track = this.getPieceTrack(group.object, key, objectInfo.perSwitch[0] - 1);

            // Get transforms
            const pos = this.getFirstTransform(x.pos);
            const rot = this.getFirstTransform(x.rot);
            const scale = this.getFirstTransform(x.scale);

            // Creating objects
            if (group.object) {
                const object = copy(group.object)

                if (
                    object instanceof Geometry &&
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
     * [3]? - Function to run on each event moving the objects.
     * @param forObject Function to run on each spawned object.
     */
    animate(switches: [
        AnimatedObjectInput,
        number,
        number?,
        ((event: CustomEventInternals.AnimateTrack, objects: number) => void)?,
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
        switches.forEach(x => {
            const input = x[0];
            const time = x[1];
            const duration = x[2] ?? 0;
            const forEvent = x[3];
            const data = this.getObjects(input);

            Object.keys(this.groups).forEach(x => {
                this.objectInfo[x].perSwitch[time] = 0;
            })

            data.forEach(x => {
                // Getting info about group
                const key = x.track as string;
                const group = this.groups[key];

                // Registering data about object amounts
                const objectInfo = this.objectInfo[key];
                if (!objectInfo) return;
                objectInfo.perSwitch[time]++;
                if (objectInfo.perSwitch[time] > objectInfo.max) objectInfo.max = objectInfo.perSwitch[time];

                const track = this.getPieceTrack(group.object, key, objectInfo.perSwitch[time] - 1);

                // Creating event
                if (
                    group.object &&
                    group.object instanceof Geometry &&
                    typeof group.object.material !== "string" &&
                    !group.object.material.color &&
                    x.color
                ) {
                    x.color[3] ??= 1;
                    animatedMaterials.push(track);

                    const event = new CustomEvent(time).animateTrack(track + "_material");
                    event.animate.color = x.color as Vec4;
                    event.push(false);
                }

                const event = new CustomEvent(time).animateTrack(track, duration);
                event.animate.set("position", x.pos, false);
                event.animate.set("rotation", x.rot, false);
                event.animate.set("scale", x.scale, false);
                if (forEvent) forEvent(event, objectInfo.perSwitch[time]);
                activeDiff.customEvents.push(event);
            })
        })

        const yeetEvents: Record<number, CustomEventInternals.AnimateTrack> = {};

        Object.keys(this.groups).forEach(groupKey => {
            const group = this.groups[groupKey];
            const objectInfo = this.objectInfo[groupKey];
            if (!objectInfo) return;

            // Yeeting objects
            Object.keys(objectInfo.perSwitch).forEach(switchTime => {
                const numSwitchTime = parseInt(switchTime);
                const amount = objectInfo.perSwitch[numSwitchTime];

                if (group.disappearWhenAbsent || group.object) for (let i = amount; i < objectInfo.max; i++) {
                    if (!yeetEvents[numSwitchTime]) {
                        const event = new CustomEvent(numSwitchTime).animateTrack();
                        event.animate.position = "yeet";
                        yeetEvents[numSwitchTime] = event;
                    }
                    yeetEvents[numSwitchTime].track.add(this.getPieceTrack(group.object, groupKey, i));
                }
            })

            // Spawning objects
            if (group.object) {
                for (let i = 0; i < objectInfo.max; i++) {
                    const object = copy(group.object)
                    object.track.value = this.getPieceTrack(group.object, groupKey, i);

                    if (animatedMaterials.some(x => x === object.track.value))
                        ((object as Geometry).material as RawGeometryMaterial).track = object.track + "_material";

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
 * Get the objects from a .rmmodel.
 * @param filePath Path to the .rmmodel.
 */
export function getModel(filePath: FILEPATH) {
    const data = JSON.parse(Deno.readTextFileSync(parseFilePath(filePath, ".rmmodel").path));
    return data.objects as ModelObject[];
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