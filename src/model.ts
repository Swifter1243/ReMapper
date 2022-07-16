// deno-lint-ignore-file no-explicit-any
import { ColorType, eulerFromQuaternion, RMJson, rotatePoint, Vec3 } from "./general.ts";
import { RawKeyframesVec3, toPointDef } from "./animation.ts";
import { path, fs, blender } from "./deps.ts";
import { Environment, Geometry } from "./environment.ts";
import { OptimizeSettings } from "./anim_optimizer.ts";

export interface ModelCube {
    pos: RawKeyframesVec3;
    rot: RawKeyframesVec3;
    scale: RawKeyframesVec3;
    color?: ColorType;
    track?: string;
}

//! Reminder that ModelEnvironment will need to bake keyframes if it wasn't imported from blender

export class Model {
    cubes: ModelCube[] = [];

    constructor(input?: ModelCube[] | ModelCube) {
        if (!input) return;
        else this.addCubes(input as ModelCube[] | ModelCube);
    }

    /**
     * Add cubes to this model.
     * @param input 
     */
    addCubes(input: ModelCube | ModelCube[]) {
        if (Array.isArray(input)) input.forEach(x => { this.cubes.push(x) });
        else this.cubes.push(input);
    }
}

export function cacheData<T>(name: string, process: () => T, processing: any[] = []): T {
    let outputData: any;
    const processingJSON = JSON.stringify(processing).replaceAll('"', "");

    function getData() {
        outputData = process();
        console.log(`cached ${processingJSON}`)
        return outputData;
    }

    const cachedData = RMJson.cachedData[name];
    if (cachedData !== undefined) {
        if (processingJSON !== cachedData.processing) {
            cachedData.processing = processingJSON;
            cachedData.data = getData();
            RMJson.save();
        }
        else outputData = cachedData.data;
    }
    else {
        RMJson.cachedData[name] = {
            processing: processingJSON,
            data: getData()
        }
        RMJson.save();
    }

    return outputData as T;
}

// export function cacheModel(filePath: string, process: () => ModelCube[], processing: any[] = []) {
//     let outputData: ModelCube[] = [];

//     function getData(fileName: string) {
//         outputData = process();
//         console.log(`[ReMapper: ${getSeconds()}s] cached model data of ${fileName}.`);
//         return outputData;
//     }

//     const fileName = path.parse(filePath).base;
//     if (!fs.existsSync(fileName)) throw new Error(`The file ${fileName} does not exist!`)
//     const mTime = Deno.statSync(filePath).mtime?.toString();
//     const processingJSON = JSON.stringify(processing).replaceAll('"', "");
//     let cached = false;
//     let found = false;

//     RMJson.cachedData.forEach(x => {
//         if (x.fileName === fileName) {
//             found = true;
//             cached = true;
//             if (
//                 processingJSON !== JSON.stringify(x.processing).replaceAll('"', "") ||
//                 mTime !== x.mTime
//             ) {
//                 x.fileName = fileName;
//                 x.mTime = mTime as string;
//                 x.processing = processingJSON;
//                 x.cubes = getData(fileName);
//                 RMJson.save();
//             }
//             else outputData = x.cubes;
//         }
//     })

//     if (!cached && !found) {
//         RMJson.cachedData.push({
//             fileName: fileName,
//             mTime: mTime as string,
//             processing: processingJSON,
//             cubes: getData(fileName)
//         })
//         RMJson.save();
//     }

//     return outputData;
// }

const blenderShrink = 9 / 10; // For whatever reason.. this needs to be multiplied to all of the scales to make things look proper... who knows man.
let modelEnvCount = 0;
let noYeet = true;

type ModelGroup = {
    object: GroupObjectTypes,
    anchor?: Vec3,
    scale?: Vec3,
    rotation?: Vec3,
    track?: string,
    assigned?: boolean,
    disappearWhenAbsent?: boolean
}

type GroupObjectTypes = Environment | Geometry;

export class ModelScene {
    private groups: ModelGroup[] = []
    optimizer = new OptimizeSettings();
    bakeAnimFreq = 1 / 32;

    constructor(object?: GroupObjectTypes, scale?: Vec3, anchor?: Vec3, rotation?: Vec3) {
        if (object) this.pushGroup(object, scale, anchor, rotation)
        modelEnvCount++;
    }

    private pushGroup(object: GroupObjectTypes, scale?: Vec3, anchor?: Vec3, rotation?: Vec3, changeGroup?: (group: ModelGroup) => void) {
        const group: ModelGroup = {
            object: object
        }
        if (scale) group.scale = scale;
        if (anchor) group.anchor = anchor;
        if (rotation) group.rotation = rotation;
        if (changeGroup) changeGroup(group);
        this.groups.push(group);
    }

    addPrimaryGroups(track: string | string[], object: GroupObjectTypes, scale?: Vec3, anchor?: Vec3, rotation?: Vec3) {
        const tracks = typeof track === "object" ? track : [track];
        tracks.forEach(t => {
            this.pushGroup(object, scale, anchor, rotation, x => {
                x.track = t;
            })
        })
    }

    assignObjects(track: string | string[], object: GroupObjectTypes, scale?: Vec3, anchor?: Vec3, rotation?: Vec3, disappearWhenAbsent = true) {
        const tracks = typeof track === "object" ? track : [track];
        tracks.forEach(t => {
            this.pushGroup(object, scale, anchor, rotation, x => {
                x.track = t;
                x.disappearWhenAbsent = disappearWhenAbsent;
            })
        })
    }
}

/**
 * Used by ModelEnvironment to transform cube data to represent an environment object.
 * @param objPos 
 * @param objRot 
 * @param objScale 
 * @param anchor 
 * @param scale 
 * @returns 
 */
 export function applyAnchorAndScale(objPos: Vec3, objRot: Vec3, objScale: Vec3, anchor: Vec3, scale: Vec3) {
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

export function getModelCubesFromCollada(filePath: string) {
    const collada = blender.GetColladaModelSync(filePath);
    const cubes = blender.GetCubesCollada(collada);
    const outputCubes: ModelCube[] = [];

    cubes.forEach(x => {
        console.log(x.frames);

        const cube: ModelCube = {
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

        outputCubes.push(cube);
    })

    return outputCubes;
}