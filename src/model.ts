// deno-lint-ignore-file no-explicit-any
import { cacheData, ColorType, eulerFromQuaternion, rotatePoint, Vec3 } from "./general.ts";
import { bakeAnimation, complexifyArray, KeyframeArray, KeyframesAny, KeyframeValues, RawKeyframesVec3, toPointDef } from "./animation.ts";
import { path, fs, blender } from "./deps.ts";
import { Environment, Geometry } from "./environment.ts";
import { optimizeAnimation, OptimizeSettings } from "./anim_optimizer.ts";

const blenderShrink = 9 / 10; // For whatever reason.. this needs to be multiplied to all of the scales to make things look proper... who knows man.
let modelEnvCount = 0;
let noYeet = true;

type GroupObjectTypes = Environment | Geometry;

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

    constructor(object?: GroupObjectTypes, scale?: Vec3, anchor?: Vec3, rotation?: Vec3) {
        if (object) this.pushGroup(undefined, object, scale, anchor, rotation)
        modelEnvCount++;
    }

    private pushGroup(key: string | undefined, object?: GroupObjectTypes, scale?: Vec3, anchor?: Vec3, rotation?: Vec3, changeGroup?: (group: ModelGroup) => void) {
        const group: ModelGroup = {}
        if (object) group.object = object;
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

    private getObjects(input: string | ModelObject[]) {
        if (typeof input === "string") {
            if (!fs.existsSync(input)) throw new Error(`The file ${input} does not exist!`)
            const mTime = Deno.statSync(input).mtime?.toString();
            const processing: any[] = [this.groups, this.optimizer, mTime];

            return cacheData(input, () => {
                const fileObjects = getObjectsFromCollada(input);
                fileObjects.forEach(x => {
                    // Getting relevant object transforms
                    let scale: Vec3 = [1, 1, 1];
                    let anchor: Vec3 = [0, 0, 0];
                    let rotation: Vec3 = [0, 0, 0];
                    let isModified = false;

                    const group = this.groups[x.track as string];
                    if (group) {
                        if (group.scale) { scale = group.scale; isModified = true }
                        if (group.anchor) { anchor = group.anchor; isModified = true }
                        if (group.rotation) { rotation = group.rotation; isModified = true }
                    }

                    if (isModified) {
                        // Making keyframes a consistent array format
                        x.pos = complexifyArray(x.pos as KeyframesAny) as RawKeyframesVec3;
                        x.rot = complexifyArray(x.rot as KeyframesAny) as RawKeyframesVec3;
                        x.scale = complexifyArray(x.scale as KeyframesAny) as RawKeyframesVec3;

                        // Applying transformation to each keyframe
                        for (let i = 0; i < x.pos.length; i++) {
                            let objPos = x.pos[i] as KeyframeValues;
                            let objRot = x.rot[i] as KeyframeValues;
                            const objScale = x.scale[i] as KeyframeValues;
                            objPos.pop();
                            objRot.pop();
                            objScale.pop();

                            const appliedTransform = applyModelObjectTransform(objPos as Vec3, objRot as Vec3, objScale as Vec3, anchor, scale, rotation);
                            objPos = appliedTransform.pos;
                            objRot = appliedTransform.rot;
                            (x.pos as KeyframeArray)[i] = [...(objPos as Vec3), (x.pos as KeyframeValues)[3]];
                            (x.rot as KeyframeArray)[i] = [...(objRot as Vec3), (x.rot as KeyframeValues)[3]];
                        }
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
            const bakedObjects: ModelObject[] = [];

            input.forEach(x => {
                // Getting relevant anchor & scale
                let scale: Vec3 = [1, 1, 1];
                let anchor: Vec3 = [0, 0, 0];
                let rotation: Vec3 = [0, 0, 0];
                let isModified = false;

                const group = this.groups[x.track as string];
                if (group) {
                    if (group.scale) { scale = group.scale; isModified = true }
                    if (group.anchor) { anchor = group.anchor; isModified = true }
                    if (group.rotation) { rotation = group.rotation; isModified = true }
                }

                // Baking animation
                const bakedCube: ModelObject = bakeAnimation({ pos: x.pos, rot: x.rot, scale: x.scale }, transform => {
                    if (!isModified) return;
                    const appliedTransform = applyModelObjectTransform(transform.pos, transform.rot, transform.scale, anchor, scale, rotation);
                    transform.pos = appliedTransform.pos;
                    transform.scale = appliedTransform.scale;
                }, this.bakeAnimFreq, this.optimizer);
                bakedCube.track = x.track;
                bakedObjects.push(bakedCube);
            })

            return bakedObjects;
        }
    }
}

/**
 * Used by ModelScene to transform object data to represent an environment object.
 * @param objPos 
 * @param objRot 
 * @param objScale 
 * @param anchor 
 * @param scale 
 * @returns 
 */
export function applyModelObjectTransform(objPos: Vec3, objRot: Vec3, objScale: Vec3, anchor: Vec3, scale: Vec3, rotation?: Vec3) {
    if (rotation) objRot = objRot.map((x, i) => (x += rotation[i]) % 360) as Vec3;
    const offset = rotatePoint(objRot, objScale.map((x, i) => x * -anchor[i] * blenderShrink) as Vec3);
    objPos = objPos.map((x, i) => x + offset[i]) as Vec3;
    objScale = objScale.map((x, i) => x * scale[i] * blenderShrink) as Vec3;
    return { pos: objPos, rot: objRot, scale: objScale };
}

function createYeetDef() {
    if (noYeet === true) {
        noYeet = false;
        toPointDef([0, -69420, 0], "yeet");
    }
}

export function getObjectsFromCollada(filePath: string) {
    const collada = blender.GetColladaModelSync(filePath);
    const objects = blender.GetCubesCollada(collada);
    const outputObjects: ModelObject[] = [];

    objects.forEach(x => {
        console.log(x.frames);

        const cube: ModelObject = {
            pos: [0, 0, 0],
            rot: [0, 0, 0],
            scale: [1, 1, 1]
        }

        if (x.color) {
            if (x.color.a) cube.color = [x.color.r, x.color.g, x.color.b, x.color.a];
            else cube.color = [x.color.r, x.color.g, x.color.b];
        }
        if (x.transformation) {
            cube.pos = x.transformation.position.toArray();
            cube.rot = eulerFromQuaternion(x.transformation.rotation);
            cube.scale = x.transformation.scale.toArray();
        }

        outputObjects.push(cube);
    })

    return outputObjects;
}