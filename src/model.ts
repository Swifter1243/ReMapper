import { ColorType } from "./general.ts";
import { RawKeyframesVec3 } from "./animation.ts";
import { path } from "./deps.ts";
import { OptimizeSettings } from "./anim_optimizer.ts"

export interface ModelData {
    cubes: {
        pos: RawKeyframesVec3;
        rot: RawKeyframesVec3;
        scale: RawKeyframesVec3;
        color?: ColorType;
    }[]
}

export class Model {
    data: ModelData = {
        cubes: []
    };
    trackingFile?: string;
    optimizeSettings? = new OptimizeSettings();

    constructor(input?: string | ModelData) {
        if (!input) return;
        else if (typeof input === "string") {
            this.trackingFile = path.parse("test.Dat").base;
            // blender grabby grabby
        }
        else this.data = input;
    }
}