import * as rm from '../src/mod.ts'

const linearComplexKeyfame: rm.ComplexKeyframesLinear = [[0, 0], [1, 1, "lerpHSV"]]
const vec3ComplexKeyfame: rm.ComplexKeyframesVec3 = [[0, 0, 0, 0], [1, 1, 1, 1, "splineCatmullRom"]]
const vec4ComplexKeyfame: rm.ComplexKeyframesVec4 = [[0, 0, 0, 0, 0], [1, 1, 1, 1, 1, "easeInBack", "lerpHSV", "splineCatmullRom"]]


const linearKeyframe: rm.RawKeyframesLinear = [0]
const vec3Keyframe: rm.RawKeyframesVec3 = [0, 0, 0]
const vec4Keyframe: rm.RawKeyframesVec4 = [0, 0, 0, 0]

const linearAnyKeyframe: rm.PointDefinitionAny = [0]
const vec3AnyKeyframe: rm.PointDefinitionAny = [[0, 1, "easeInBack"]]
const vec4AnyKeyframe: rm.PointDefinitionAny = [[0, 1]]