// deno-lint-ignore-file no-explicit-any
import { ColorType, eulerFromQuaternion, getSeconds, RMJson, toDegrees, Vec3 } from "./general.ts";
import { RawKeyframesVec3 } from "./animation.ts";
import { path, fs, blender, three } from "./deps.ts";

export interface ModelCube {
    pos: RawKeyframesVec3;
    rot: RawKeyframesVec3;
    scale: RawKeyframesVec3;
    color?: ColorType;
    track?: string;
}

//! Reminder that BlenderEnvironment will need to bake keyframes if it wasn't imported from blender

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