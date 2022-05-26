import { ColorType, reMapperJson } from "./general.ts";
import { RawKeyframesVec3 } from "./animation.ts";
import { path, fs } from "./deps.ts";
import { OptimizeSettings } from "./anim_optimizer.ts"

export interface ModelCube {
    pos: RawKeyframesVec3;
    rot: RawKeyframesVec3;
    scale: RawKeyframesVec3;
    color?: ColorType;
    track?: string;
}

export class Model {
    cubes: ModelCube[] = [];

    /**
     * Wrapper for model data.
     * Useful for importing data from blender, or wherever else. 
     * @param input Can either be a path to a blender model, or existing cubes.
     * @param optimizeSettings Only applies to the blender models.
     * @returns 
     */
    constructor(input?: string | ModelCube[] | ModelCube, optimizeSettings = new OptimizeSettings()) {
        function getData(thisKey: Model) {
            const data: ModelCube[] = [{
                pos: [0, 0, 0],
                rot: [0, 0, 0],
                scale: [1, 1, 1]
            }];
            // blender stuff would go here
            thisKey.cubes = data;
            return data;
        }

        if (!input) return;
        else if (typeof input === "string") {
            const fileName = path.parse(input).base;
            if (!fs.existsSync(fileName)) throw new Error(`The file ${fileName} does not exist!`)
            const mTime = Deno.statSync(input).mtime?.toString();
            const optimizerJSON = JSON.stringify(optimizeSettings).replaceAll('"', "");
            let cached = false;
            let found = false;

            reMapperJson.cachedModels.forEach(x => {
                if (x.fileName === fileName) {
                    found = true;
                    cached = true;
                    if (
                        optimizerJSON !== JSON.stringify(x.optimizer).replaceAll('"', "") ||
                        mTime !== x.mTime
                    ) {
                        cached = false;
                        x.fileName = fileName;
                        x.mTime = mTime as string;
                        x.optimizer = optimizerJSON;
                        x.cubes = getData(this);
                        reMapperJson.save();
                    }
                    else this.cubes = x.cubes;
                }
            })

            if (!cached && !found) {
                reMapperJson.cachedModels.push({
                    fileName: fileName,
                    mTime: mTime as string,
                    optimizer: optimizerJSON,
                    cubes: getData(this)
                })
                reMapperJson.save();
            }
        }
        else this.addCubes(input);
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