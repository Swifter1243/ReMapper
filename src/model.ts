// deno-lint-ignore-file no-explicit-any
import { arrAdd, cacheData, ColorType, copy, iterateKeyframes, rotatePoint, Vec3, Vec4 } from "./general.ts";
import { bakeAnimation, complexifyArray, ComplexKeyframesVec3, KeyframeArray, KeyframesAny, KeyframeValues, RawKeyframesVec3, toPointDef } from "./animation.ts";
import { fs, path } from "./deps.ts";
import { Environment, Geometry, RawGeometryMaterial } from "./environment.ts";
import { optimizeAnimation, OptimizeSettings } from "./anim_optimizer.ts";
import { CustomEvent, CustomEventInternals } from "./custom_event.ts";
import { GEO_SHADER, LOOKUP } from "./constants.ts";
import { activeDiff } from "./beatmap.ts";
import { Regex } from "./regex.ts";
import { Event } from "./event.ts";

let modelSceneCount = 0;
let noYeet = true;

type GroupObjectTypes = Environment | Geometry;
type ObjectInput = string | ModelObject[];

type ModelGroup = {
    object?: GroupObjectTypes,
    anchor?: Vec3,
    scale?: Vec3,
    rotation?: Vec3,
    disappearWhenAbsent?: boolean
}

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

    addPrimaryGroups(track: string | string[], object: GroupObjectTypes, scale?: Vec3, anchor?: Vec3, rotation?: Vec3) {
        const tracks = typeof track === "object" ? track : [track];
        tracks.forEach(t => {
            this.pushGroup(t, object, scale, anchor, rotation)
        })
    }

    assignObjects(track: string | string[], scale?: Vec3, anchor?: Vec3, rotation?: Vec3, disappearWhenAbsent = true) {
        const tracks = typeof track === "object" ? track : [track];
        tracks.forEach(t => {
            this.pushGroup(t, undefined, scale, anchor, rotation, x => {
                x.disappearWhenAbsent = disappearWhenAbsent;
            })
        })
    }

    private getObjects(input: ObjectInput) {
        if (typeof input === "string") {
            if (!path.isAbsolute(input)) input = `${input}.rmmodel`
            if (!fs.existsSync(input)) throw new Error(`The file ${input} does not exist!`)
            const mTime = Deno.statSync(input).mtime?.toString();
            const processing: any[] = [this.groups, this.optimizer, mTime];

            return cacheData(`modelScene${this.trackID}_${input}`, () => {
                const fileObjects = getModel(input as string);
                fileObjects.forEach(x => {
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
                    x.pos = complexifyArray(x.pos as KeyframesAny) as RawKeyframesVec3;
                    x.rot = complexifyArray(x.rot as KeyframesAny) as RawKeyframesVec3;
                    x.scale = complexifyArray(x.scale as KeyframesAny) as RawKeyframesVec3;

                    // Applying transformation to each keyframe
                    for (let i = 0; i < x.pos.length; i++) {
                        let objPos = copy(x.pos[i]) as KeyframeValues;
                        let objRot = copy(x.rot[i]) as KeyframeValues;
                        let objScale = copy(x.scale[i]) as KeyframeValues;
                        objPos.pop();
                        objRot.pop();
                        objScale.pop();

                        objPos = (objPos as Vec3).map(x => x / 2);
                        if (rotation) objRot = (objRot as Vec3).map((x, i) => (x + (rotation as Vec3)[i]) % 360);
                        objScale = (objScale as Vec3).map(x => x * 0.6);
                        if (anchor) objPos = applyAnchor(objPos as Vec3, objRot as Vec3, objScale as Vec3, anchor);
                        if (scale) objScale = (objScale as Vec3).map((x, i) => x * (scale as Vec3)[i]);

                        (x.pos as KeyframeArray)[i] = [...(objPos as Vec3), (x.pos as ComplexKeyframesVec3)[i][3]];
                        (x.rot as KeyframeArray)[i] = [...(objRot as Vec3), (x.rot as ComplexKeyframesVec3)[i][3]];
                        (x.scale as KeyframeArray)[i] = [...(objScale as Vec3), (x.scale as ComplexKeyframesVec3)[i][3]];
                    }

                    // Optimizing object
                    x.pos = optimizeAnimation(x.pos as KeyframesAny, this.optimizer) as RawKeyframesVec3;
                    x.rot = optimizeAnimation(x.rot as KeyframesAny, this.optimizer) as RawKeyframesVec3;
                    x.scale = optimizeAnimation(x.scale as KeyframesAny, this.optimizer) as RawKeyframesVec3;
                })
                return fileObjects;
            }, processing)
        }
        else {
            const outputObjects: ModelObject[] = [];

            input.forEach(x => {
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

                if (rotation) iterateKeyframes(x.rot, y => {
                    y[0] = (y[0] + (rotation as Vec3)[0]) % 360;
                    y[1] = (y[1] + (rotation as Vec3)[1]) % 360;
                    y[2] = (y[2] + (rotation as Vec3)[2]) % 360;
                })

                iterateKeyframes(x.scale, y => {
                    y[0] *= 0.6;
                    y[1] *= 0.6;
                    y[2] *= 0.6;
                })

                if (anchor) {
                    // Baking animation
                    const bakedCube: ModelObject = bakeAnimation({ pos: x.pos, rot: x.rot, scale: x.scale }, transform => {
                        transform.pos = applyAnchor(transform.pos, transform.rot, transform.scale, anchor as Vec3);
                    }, this.bakeAnimFreq, this.optimizer);

                    bakedCube.track = x.track;
                    x = bakedCube;
                }

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

    static(input: ObjectInput, forObject?: (object: GroupObjectTypes) => void, forAssigned?: (event: CustomEventInternals.AnimateTrack) => void) {
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
                    !object.material._color &&
                    x.color
                ) object.material._color = x.color;

                object.track = track;
                object.position = pos;
                object.rotation = rot;
                object.scale = scale;
                if (forObject) forObject(object);
                object.push();
            }
            // Creating event for assigned
            else {
                const event = new CustomEvent().animateTrack(track);
                event.animate.set("_position", x.pos, false);
                event.animate.set("_rotation", x.rot, false);
                event.animate.set("_scale", x.scale, false);
                if (forAssigned) forAssigned(event);
                event.push();
            }
        })

        Object.keys(this.groups).forEach(x => {
            const objectInfo = this.objectInfo[x];
            const group = this.groups[x];

            if (objectInfo.max === 0 && !group.object && group.disappearWhenAbsent) {
                createYeetDef();
                const event = new CustomEvent().animateTrack(x);
                event.animate.position = "yeet";
                event.push();
            }
        })
    }

    animate(switches: [
        ObjectInput,
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
                    !group.object.material._color &&
                    x.color
                ) {
                    x.color[3] ??= 1;
                    animatedMaterials.push(track);

                    const event = new CustomEvent(time).animateTrack(track + "_material");
                    event.animate.color = x.color as Vec4;
                    event.push();
                }

                const event = new CustomEvent(time).animateTrack(track, duration);
                event.animate.set("_position", x.pos, false);
                event.animate.set("_rotation", x.rot, false);
                event.animate.set("_scale", x.scale, false);
                if (forEvent) forEvent(event, objectInfo.perSwitch[time]);
                event.push();
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
                    object.track = this.getPieceTrack(group.object, groupKey, i);

                    if (animatedMaterials.some(x => x === object.track))
                        ((object as Geometry).material as RawGeometryMaterial)._track = object.track + "_material";

                    if (forObject) forObject(object);
                    object.push();
                }
            }
        })

        Object.keys(yeetEvents).forEach(x => { yeetEvents[parseInt(x)].push() });
    }
}

export function applyAnchor(objPos: Vec3, objRot: Vec3, objScale: Vec3, anchor: Vec3) {
    const offset = rotatePoint(objRot, objScale.map((x, i) => x * anchor[i] / 0.6) as Vec3);
    return objPos.map((x, i) => x + offset[i]) as Vec3;
}

function createYeetDef() {
    if (noYeet === true) {
        noYeet = false;
        toPointDef([0, -69420, 0], "yeet");
    }
}

export function getModel(filePath: string) {
    const data = JSON.parse(Deno.readTextFileSync(filePath));
    return data.objects as ModelObject[];
}

/**
 * Debug the transformations necessary to fit an object to a cube.
 * Use the axis
 * @param input 
 * @param resolution The scale of the object for each axis.
 * @param scale 
 * @param anchor 
 * @param rotation 
 */
export function debugObject(input: GroupObjectTypes, resolution: number, scale?: Vec3, anchor?: Vec3, rotation?: Vec3) {
    activeDiff.notes = [];
    activeDiff.obstacles = [];
    activeDiff.customEvents = [];
    activeDiff.rawEnvironment = [];

    new Event().backLasers().on([3, 3, 3, 1]).push();

    new CustomEvent().assignFogTrack("fog").push();
    const fogEvent = new CustomEvent().animateTrack("fog");
    fogEvent.animate.attenuation = [0.000001];
    fogEvent.animate.startY = [-69420]
    fogEvent.push();

    const removeUI = new Environment(new Regex().add("NarrowGameHUD").end(), LOOKUP.REGEX);
    removeUI.active = false;
    removeUI.push();

    activeDiff.geoMaterials["debugCubeX"] = {
        _shader: GEO_SHADER.STANDARD,
        _color: [1, 0, 0],
        _shaderKeywords: []
    }

    activeDiff.geoMaterials["debugCubeY"] = {
        _shader: GEO_SHADER.STANDARD,
        _color: [0, 1, 0],
        _shaderKeywords: []
    }

    activeDiff.geoMaterials["debugCubeZ"] = {
        _shader: GEO_SHADER.STANDARD,
        _color: [0, 0, 1],
        _shaderKeywords: []
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