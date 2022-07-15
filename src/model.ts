// deno-lint-ignore-file no-explicit-any
import { ColorType, eulerFromQuaternion, getSeconds, RMJson, rotatePoint, Vec3 } from "./general.ts";
import { RawKeyframesVec3, toPointDef } from "./animation.ts";
import { path, fs, blender } from "./deps.ts";

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

export function cacheModel(filePath: string, process: () => ModelCube[], processing: any[] = []) {
    let outputData: ModelCube[] = [];

    function getData(fileName: string) {
        outputData = process();
        console.log(`[ReMapper: ${getSeconds()}s] cached model data of ${fileName}.`);
        return outputData;
    }

    const fileName = path.parse(filePath).base;
    if (!fs.existsSync(fileName)) throw new Error(`The file ${fileName} does not exist!`)
    const mTime = Deno.statSync(filePath).mtime?.toString();
    const processingJSON = JSON.stringify(processing).replaceAll('"', "");
    let cached = false;
    let found = false;

    RMJson.cachedModels.forEach(x => {
        if (x.fileName === fileName) {
            found = true;
            cached = true;
            if (
                processingJSON !== JSON.stringify(x.processing).replaceAll('"', "") ||
                mTime !== x.mTime
            ) {
                x.fileName = fileName;
                x.mTime = mTime as string;
                x.processing = processingJSON;
                x.cubes = getData(fileName);
                RMJson.save();
            }
            else outputData = x.cubes;
        }
    })

    if (!cached && !found) {
        RMJson.cachedModels.push({
            fileName: fileName,
            mTime: mTime as string,
            processing: processingJSON,
            cubes: getData(fileName)
        })
        RMJson.save();
    }

    return outputData;
}

const blenderShrink = 9 / 10; // For whatever reason.. this needs to be multiplied to all of the scales to make things look proper... who knows man.
let modelEnvCount = 0;
let noYeet = true;

enum MODEL_GROUP_TYPE {
    ENVIRONMENT = 0
}

type ModelGroupConfig = {
    anchor?: Vec3,
    scale?: Vec3,
    rotation?: Vec3,
    type?: MODEL_GROUP_TYPE,
    track?: string,
    spawn?: boolean
    id?: string,
    lookup?: string
    disappearWhenAbsent?: boolean
}

type GroupObjectTypes = EnvironmentGroup;

export class EnvironmentGroup {
    config: EnvironmentGroupType

    constructor(config: EnvironmentGroupType = {}) {
        this.config = config;
    }
}

type EnvironmentGroupType = {
    anchor?: Vec3
    scale?: Vec3
    rotation?: Vec3
    id?: string
    lookup?: string
}

export class ModelScene {
    groups: ModelGroupConfig[] = []

    constructor(config: GroupObjectTypes) {
        this.pushGroup(config);
        modelEnvCount++;
    }

    private pushGroup(config: GroupObjectTypes, group?: (config: ModelGroupConfig) => void) {
        const primaryConfig = config.config as ModelGroupConfig;
        if (group) group(primaryConfig);

        if (config instanceof EnvironmentGroup) primaryConfig.type = MODEL_GROUP_TYPE.ENVIRONMENT;

        this.groups.push(primaryConfig);
    }

    addPrimaryGroups(track: string | string[], config: GroupObjectTypes) {
        const tracks = typeof track === "object" ? track : [track];
        tracks.forEach(t => {
            this.pushGroup(config, x => {
                x.track = t;
            })
        })
    }

    assignObjects(track: string | string[], config: GroupObjectTypes, disappearWhenAbsent = true) {
        const tracks = typeof track === "object" ? track : [track];
        tracks.forEach(t => {
            this.pushGroup(config, x => {
                x.track = t;
                x.disappearWhenAbsent = disappearWhenAbsent;
            })
        })
    }
}

// const modelScene = new ModelScene(new EnvironmentGroup({
//     anchor: [0, 0, 0]
// }))
// console.log(modelScene.groups);

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