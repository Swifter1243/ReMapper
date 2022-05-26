import { Vec3, copy, ColorType } from "./general.ts";
import { Animation, KeyframesAny, complexifyArray, Keyframe, KeyframesVec3, RawKeyframesVec3 } from "./animation.ts";
import { ANIM } from "./constants.ts";
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

    importAnimation(
        cubes: { pos?: RawKeyframesVec3, rot?: RawKeyframesVec3, scale?: RawKeyframesVec3 }[],
        forKeyframe?: (transform: { pos: Vec3, rot: Vec3, scale: Vec3, time: number }) => void,
        animFreq: number = 1 / 32) {

        cubes.forEach(cube => {
            let pos = cube.pos;
            let rot = cube.rot;
            let scale = cube.scale;
            pos ??= [0, 0, 0];
            rot ??= [0, 0, 0];
            scale ??= [1, 1, 1];

            const dataAnim = new Animation().abstract();
            dataAnim.position = copy(pos);
            dataAnim.rotation = copy(rot);
            dataAnim.scale = copy(scale);

            const data = {
                pos: <number[][]>[],
                rot: <number[][]>[],
                scale: <number[][]>[]
            }

            function getDomain(arr: KeyframesAny) {
                let newArr = complexifyArray(arr);
                newArr = newArr.sort((a, b) => new Keyframe(a).time - new Keyframe(b).time);
                let min = 1;
                let max = 0;
                newArr.forEach(x => {
                    const time = new Keyframe(x).time;
                    if (time < min) min = time;
                    if (time > max) max = time;
                })
                return { min: min, max: max };
            }

            const posDomain = getDomain(pos as KeyframesAny);
            const rotDomain = getDomain(rot as KeyframesAny);
            const scaleDomain = getDomain(scale as KeyframesAny);

            const totalMin = getDomain([[posDomain.min], [rotDomain.min], [scaleDomain.min]]).min;
            const totalMax = getDomain([[posDomain.max], [rotDomain.max], [scaleDomain.max]]).max;

            for (let i = totalMin; i <= totalMax; i += animFreq) {
                const keyframe = {
                    pos: dataAnim.get(ANIM.POSITION, i),
                    rot: dataAnim.get(ANIM.ROTATION, i),
                    scale: dataAnim.get(ANIM.SCALE, i),
                    time: i
                };

                if (forKeyframe) forKeyframe(keyframe);

                data.pos.push([...keyframe.pos, keyframe.time]);
                data.rot.push([...keyframe.rot, keyframe.time]);
                data.scale.push([...keyframe.scale, keyframe.time]);
            }

            dataAnim.position = data.pos as KeyframesVec3;
            dataAnim.rotation = data.rot as KeyframesVec3;
            dataAnim.scale = data.scale as KeyframesVec3;

            dataAnim.optimize(undefined, this.optimizeSettings);

            this.data.cubes.push({
                pos: dataAnim.position as RawKeyframesVec3,
                rot: dataAnim.rotation as RawKeyframesVec3,
                scale: dataAnim.scale as RawKeyframesVec3
            });
        });
    }
}