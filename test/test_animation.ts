import {ComplexKeyframesLinear, RawKeyframesLinear} from "../src/types/animation/keyframe/linear.ts";
import {ComplexKeyframesVec3, RawKeyframesVec3} from "../src/types/animation/keyframe/vec3.ts";
import {ComplexKeyframesVec4, RawKeyframesVec4} from "../src/types/animation/keyframe/vec4.ts";
import {PointDefinitionAny} from "../src/types/animation/keyframe/any.ts";

const linearComplexKeyfame: ComplexKeyframesLinear = [[0, 0], [1, 1, "lerpHSV"]]
const vec3ComplexKeyfame: ComplexKeyframesVec3 = [[0, 0, 0, 0], [1, 1, 1, 1, "splineCatmullRom"]]
const vec4ComplexKeyfame: ComplexKeyframesVec4 = [[0, 0, 0, 0, 0], [1, 1, 1, 1, 1, "easeInBack", "lerpHSV", "splineCatmullRom"]]


const linearKeyframe: RawKeyframesLinear = [0]
const vec3Keyframe: RawKeyframesVec3 = [0, 0, 0]
const vec4Keyframe: RawKeyframesVec4 = [0, 0, 0, 0]

const linearAnyKeyframe: PointDefinitionAny = [0]
const vec3AnyKeyframe: PointDefinitionAny = [[0, 1, "easeInBack"]]
const vec4AnyKeyframe: PointDefinitionAny = [[0, 1]]