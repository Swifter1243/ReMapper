// deno-lint-ignore-file no-namespace adjacent-overload-signatures no-explicit-any
import { OptimizeSettings } from "./anim_optimizer.ts";
import { Json } from "./beatmap.ts";
import { Color, lerpColor } from "./color.ts";
import { ANIM, EASE, SPLINE } from "./constants.ts";
import {
  arrAdd,
  arrLast,
  arrLerp,
  arrMul,
  arrRemove,
  ceilTo,
  copy,
  findFraction,
  floorTo,
  iterateKeyframes,
  lerpEasing,
  lerpRotation,
  NumberTuple,
  Vec3,
  Vec4,
} from "./general.ts";

import { AnimationInternals } from "./internals/mod.ts";

/** Any flag that could be in a keyframe. E.g. easings, splines */
export type KeyframeFlag = Interpolation | "hsvLerp";
/** Easings and splines. */
export type Interpolation = EASE | SPLINE;
/** Time value in a keyframe. */
export type TimeValue = number;

/** Helper type for single keyframes. */
export type SingleKeyframeAbstract<T extends number[]> = [
  ...T,
  TimeValue,
  KeyframeFlag?,
  KeyframeFlag?,
  KeyframeFlag?
];
/** Helper type for complex keyframes. */
export type ComplexKeyframesAbstract<T extends number[]> =
  SingleKeyframeAbstract<T>[];
/** Helper type for raw keyframes. */
export type RawKeyframesAbstract<T extends number[]> =
  | ComplexKeyframesAbstract<T>
  | T;
/** Helper type for keyframe arrays. */
export type KeyframesAbstract<T extends number[]> =
  | RawKeyframesAbstract<T>
  | T
  | string;

/** Keyframe or array of keyframes with 1 value. [[x, time]...] or [x] */
export type KeyframesLinear = KeyframesAbstract<[number]>;
/** Array of keyframes with 1 value. [[x, time]...] */
export type ComplexKeyframesLinear = ComplexKeyframesAbstract<[number]>;
/** Keyframe or array of keyframes with 1 value.
 * [[x,time]...] or [x]
 */
export type RawKeyframesLinear = RawKeyframesAbstract<[number]>;

/** Keyframe or array of keyframes with 3 values. Allows point definitions.
 * [[x,y,z,time]...] or [x,y,z]
 */
export type KeyframesVec3 = KeyframesAbstract<Vec3>;
/** Array of keyframes with 3 values. [[x,y,z,time]...] */
export type ComplexKeyframesVec3 = ComplexKeyframesAbstract<Vec3>;
/** Keyframe or array of keyframes with 3 values.
 * [[x,y,z,time]...] or [x,y,z]
 */
export type RawKeyframesVec3 = RawKeyframesAbstract<Vec3>;

/** Keyframe or array of keyframes with 4 values. Allows point definitions.
 * [[x,y,z,w,time]...] or [x,y,z,w]
 */
export type KeyframesVec4 = KeyframesAbstract<Vec4>;
/** Array of keyframes with 4 values. [[x,y,z,w,time]...] */
export type ComplexKeyframesVec4 = ComplexKeyframesAbstract<Vec4>;
/** Keyframe or array of keyframes with 4 values.
 * [[x,y,z,w,time]...] or [x,y,z,w]
 */
export type RawKeyframesVec4 = RawKeyframesAbstract<Vec4>;

/** Keyframe which isn't in an array with other keyframes, has any amount of values. */
export type SingleKeyframe = SingleKeyframeAbstract<number[]>;
/** Keyframe which is in an array with other keyframes, has any amount of values. */
export type KeyframeValues = (number | (KeyframeFlag | undefined))[];
/** Array of keyframes which have any amount of values. */
export type ComplexKeyframesAny = ComplexKeyframesAbstract<number[]>;
/** Keyframe or array of keyframes with any amount of values. Allows point definitions. */
export type KeyframesAny = SingleKeyframe | ComplexKeyframesAny | string;
/** Keyframe or array of keyframes with any amount of values. */
export type RawKeyframesAny = SingleKeyframe | ComplexKeyframesAny;

/** A track or multiple tracks. */
export type TrackValue = string | string[];

export default function animation(length = 1) {
  return new SimpleAnimation(length);
}

class SimpleAnimation extends AnimationInternals.BaseAnimation {
  /**
   * Noodle animation manager.
   * @param length The time in each keyframe is divided by the length.
   * Use a negative number or don't specify a length to use a range between 0 and 1.
   */
  constructor(length = 1) {
    super(length);
  }

  /**
   * Create an animation using JSON.
   * @param json The json to create the animation with.
   */
  import(json: Json) {
    return new AnimationInternals.AbstractAnimation(this.length, json);
  }

  /**
   * Create an animation that can animate any object.
   * @param json The json to create the animation with.
   */
  abstract(json: Json = {}) {
    return this.import(json);
  }

  /**
   * State that this animation is for a note.
   * @param json The json to create the animation with.
   */
  noteAnimation(json?: Json) {
    return new AnimationInternals.NoteAnimation(this.length, json);
  }

  /**
   * State that this animation is for a wall.
   * @param json The json to create the animation with.
   */
  wallAnimation(json?: Json) {
    return new AnimationInternals.WallAnimation(this.length, json);
  }

  /**
   * State that this animation is for an environment object.
   * @param json The json to create the animation with.
   */
  environmentAnimation(json?: Json) {
    return new AnimationInternals.EnvironmentAnimation(this.length, json);
  }
}

export class Keyframe {
  /** The data stored in this keyframe. */
  data: KeyframeValues;

  /**
   * Interface for keyframes in animations.
   * A keyframe looks something like [x,y,z,time,easing].
   * It is separated into values (x,y,z), time, and flags (easings, splines.. etc).
   * Anything that is a string is considered a flag.
   * A keyframe can have any amount of values.
   * @param data The data stored in this keyframe.
   */
  constructor(data: KeyframeValues) {
    this.data = data;
  }

  /** The index of the time value. */
  get timeIndex() {
    for (let i = this.data.length - 1; i >= 0; i--) {
      if (typeof this.data[i] !== "string") return i;
    }
    return -1;
  }

  /** The time value. */
  get time() {
    return this.data[this.timeIndex] as number;
  }
  /** The values in the keyframes.
   * For example [x,y,z,time] would have [x,y,z] as values.
   */
  get values() {
    return this.data.slice(0, this.timeIndex) as number[];
  }
  /** The easing in the keyframe. Returns undefined if not found. */
  get easing() {
    return this.data[this.getFlagIndex("ease", false)] as EASE;
  }
  /** The spline in the keyframe. Returns undefined if not found. */
  get spline() {
    return this.data[this.getFlagIndex("spline", false)] as SPLINE;
  }
  /** Whether this keyframe has the "hsvLerp" flag. */
  get hsvLerp() {
    return this.getFlagIndex("hsvLerp") !== -1;
  }

  set time(value: number) {
    this.data[this.timeIndex] = value;
  }
  set values(value: number[]) {
    for (let i = 0; i < this.timeIndex; i++) this.data[i] = value[i];
  }
  set easing(value: EASE) {
    this.setFlag(value, "ease");
  }
  set spline(value: SPLINE) {
    this.setFlag(value, "spline");
  }
  set hsvLerp(value: boolean) {
    if (value) this.setFlag("hsvLerp");
    else {
      const flagIndex = this.getFlagIndex("hsvLerp");
      if (flagIndex !== -1) arrRemove(this.data, flagIndex);
    }
  }

  /**
   * Set a flag in the keyframe.
   * @param value The flag to be set.
   * @param old An existing flag containing this will be replaced by the value.
   */
  setFlag(value: string, old?: string) {
    let index = this.getFlagIndex(old ? old : value, old === undefined);
    if (index === -1) index = this.data.length;
    this.data[index] = value as any;
  }

  /**
   * Gets the index of a flag.
   * @param flag The flag to look for.
   * @param exact Whether it should be an exact match, or just contain the flag argument.
   */
  getFlagIndex(flag: string, exact = true) {
    if (exact) {
      return this.data.findIndex((x) => typeof x === "string" && x === flag);
    }
    return this.data.findIndex(
      (x) => typeof x === "string" && x.includes(flag)
    );
  }
}

export class Track {
  private reference: Json;

  /**
   * Handler for the track property.
   * @param reference The object that contains the "track" key.
   */
  constructor(reference: Json) {
    this.reference = reference;
  }

  private expandArray(array: TrackValue) {
    return typeof array === "string" ? [array] : array;
  }

  private simplifyArray(array: string[]) {
    return array.length === 1 ? array[0] : array;
  }

  /** The value of the track. */
  set value(value: TrackValue) {
    this.reference.track = value;
  }
  get value() {
    return this.reference.track;
  }

  /**
   * Safely check if the track contains this value.
   * @param value
   */
  has(value: string) {
    if (!this.value) return false;
    if (typeof this.value === "string") return this.value === value;
    else return this.value.some((x) => x === value);
  }

  /**
   * Safely add tracks.
   * @param value Can be one track or multiple.
   */
  add(value: TrackValue) {
    if (!this.value) this.value = [];
    const arrValue = this.expandArray(this.value).concat(
      this.expandArray(value)
    );
    this.value = this.simplifyArray(arrValue);
  }

  /**
   * Remove tracks.
   * @param value Can be one track or multiple.
   */
  remove(value: TrackValue) {
    const removeValues = this.expandArray(value);
    const thisValue = this.expandArray(this.value);
    const removed: Record<number, boolean> = {};

    removeValues.forEach((x) => {
      thisValue.forEach((y, i) => {
        if (y === x) removed[i] = true;
      });
    });

    const returnArr = thisValue.filter((_x, i) => !removed[i]);

    if (returnArr.length === 0) {
      delete this.reference.track;
      return;
    }
    this.value = this.simplifyArray(returnArr);
  }

  /** Get the track value as an array. */
  get array() {
    return this.expandArray(this.value);
  }

  /**
   * Check that each track passes a condition.
   * @param condition Function to run for each track, must return boolean
   */
  check(condition: (track: string) => boolean) {
    let passed = false;

    this.expandArray(this.value).forEach((x) => {
      if (condition(x)) passed = true;
    });

    return passed;
  }
}

/**
 * Ensures that this value is in the format of an array of keyframes.
 * For example if you input [x,y,z], it would be converted to [[x,y,z,0]].
 * @param array The keyframe or array of keyframes.
 */
export function complexifyArray<T extends NumberTuple>(
  array: RawKeyframesAbstract<T> | RawKeyframesAny
) {
  if (array === undefined) return [];
  if (!isSimple(array)) return array as ComplexKeyframesAbstract<T>;
  return [[...array, 0]] as ComplexKeyframesAbstract<T>;
}

/**
 * If possible, isolate an array of keyframes with one keyframe.
 * For example if you input [[x,y,z,0]], it would be converted to [x,y,z].
 * @param array The array of keyframes.
 */
export function simplifyArray<T extends NumberTuple>(
  array: RawKeyframesAbstract<T>
) {
  if (array === undefined) return [];
  if (array.length <= 1 && !isSimple(array)) {
    const keyframe = new Keyframe(array[0] as KeyframeValues);
    if (keyframe.time === 0) return keyframe.values as RawKeyframesAbstract<T>;
  }
  return array;
}

/**
 * Checks if value is an array of keyframes.
 * @param array The keyframe or array of keyframes.
 */
export const isSimple = (array: RawKeyframesAny) =>
  typeof array[0] !== "object";

/**
 * Get the value of keyframes at a given time.
 * @param property The property this animation came from.
 * @param animation The keyframes.
 * @param time The time to get the value at.
 */
export function getValuesAtTime(
  property: ANIM,
  animation: RawKeyframesAny,
  time: number
) {
  animation = complexifyArray(animation);
  const timeInfo = timeInKeyframes(time, animation);
  if (timeInfo.interpolate && timeInfo.r && timeInfo.l) {
    if (
      property === "rotation" ||
      property === "localRotation" ||
      property === "offsetWorldRotation"
    ) {
      return lerpRotation(
        timeInfo.l.values as Vec3,
        timeInfo.r.values as Vec3,
        timeInfo.normalTime
      );
    }
    if (property === "color" && timeInfo.r.hsvLerp) {
      const color1 = new Color(timeInfo.l.values as Vec4, "RGB");
      const color2 = new Color(timeInfo.r.values as Vec4, "RGB");
      const lerp = lerpColor(
        color1,
        color2,
        timeInfo.normalTime,
        undefined,
        "HSV"
      );
      return lerp.export();
    }
    // TODO: Move this into its own function, this is bad
    if (timeInfo.r.spline === "splineCatmullRom") {
      return splineCatmullRomLerp(timeInfo, animation);
    }

    return arrLerp(timeInfo.l.values, timeInfo.r.values, timeInfo.normalTime);
  } else return (timeInfo.l as Keyframe).values;
}

export function splineCatmullRomLerp(
  timeInfo: Required<ReturnType<typeof timeInKeyframes>>,
  animation: ComplexKeyframesAny
) {
  const p0 =
    timeInfo.leftIndex - 1 < 0
      ? timeInfo.l.values
      : new Keyframe(animation[timeInfo.leftIndex - 1]).values;
  const p1 = timeInfo.l.values;
  const p2 = timeInfo.r.values;
  const p3 =
    timeInfo.rightIndex + 1 > animation.length - 1
      ? timeInfo.r.values
      : new Keyframe(animation[timeInfo.rightIndex + 1]).values;

  const t = timeInfo.normalTime;
  const tt = t * t;
  const ttt = tt * t;

  const q0 = -ttt + 2 * tt - t;
  const q1 = 3 * ttt - 5 * tt + 2;
  const q2 = -3 * ttt + 4 * tt + t;
  const q3 = ttt - tt;

  const o0 = arrMul(p0, q0);
  const o1 = arrMul(p1, q1);
  const o2 = arrMul(p2, q2);
  const o3 = arrMul(p3, q3);

  return arrMul(arrAdd(arrAdd(o0, o1), arrAdd(o2, o3)), 0.5);
}

function timeInKeyframes(time: number, animation: ComplexKeyframesAny) {
  let l: Keyframe;
  let normalTime = 0;

  if (animation.length === 0) return { interpolate: false };

  const first = new Keyframe(animation[0]);
  if (first.time >= time) {
    l = first;
    return { interpolate: false, l: l };
  }

  const last = new Keyframe(arrLast(animation));
  if (last.time <= time) {
    l = last;
    return { interpolate: false, l: l };
  }

  let leftIndex = 0;
  let rightIndex = animation.length;

  while (leftIndex < rightIndex - 1) {
    const m = Math.floor((leftIndex + rightIndex) / 2);
    const pointTime = new Keyframe(animation[m]).time;

    if (pointTime < time) leftIndex = m;
    else rightIndex = m;
  }

  l = new Keyframe(animation[leftIndex]);
  // eslint-disable-next-line prefer-const
  const r = new Keyframe(animation[rightIndex]);

  normalTime = findFraction(l.time, r.time - l.time, time);
  if (r.easing) normalTime = lerpEasing(r.easing, normalTime);

  return {
    interpolate: true,
    l: l,
    r: r,
    normalTime: normalTime,
    leftIndex: leftIndex,
    rightIndex: rightIndex,
  };
}

/**
 * Allows you to combine two animations together.
 * Atleast one of them must have only a single keyframe.
 * @param anim1 The first animation.
 * @param anim2 The second animation.
 * @param property The property that this animation came from.
 */
export function combineAnimations(
  anim1: RawKeyframesAny,
  anim2: RawKeyframesAny,
  property: ANIM
) {
  let simpleArr = copy(anim1);
  let complexArr: ComplexKeyframesAny = [];

  if (isSimple(anim1) && isSimple(anim2)) complexArr = complexifyArray(anim2);
  else if (!isSimple(anim1) && isSimple(anim2)) {
    simpleArr = copy(anim2);
    complexArr = copy(anim1) as ComplexKeyframesAny;
  } else if (!isSimple(anim1) && !isSimple(anim2)) {
    console.error(`[${anim1}] and [${anim2}] are unable to combine!`);
  } else {
    complexArr = copy(anim2) as ComplexKeyframesAny;
  }

  const editElem = function (e: number, e2: number) {
    if (
      property === "position" ||
      property === "localPosition" ||
      property === "definitePosition" ||
      property === "offsetPosition"
    )
      e += e2;
    if (
      property === "rotation" ||
      property === "localRotation" ||
      property === "offsetWorldRotation"
    )
      e = (e + e2) % 360;
    if (property === "scale") e *= e2;
    return e;
  };

  for (let j = 0; j < complexArr.length; j++) {
    for (let i = 0; i < simpleArr.length; i++) {
      complexArr[j][i] = editElem(
        complexArr[j][i] as number,
        simpleArr[i] as number
      );
    }
  }
  return complexArr;
}

/**
 * Generate keyframes from an animation.
 * Useful for doing things such as having objects rotate around points other than their anchor.
 * @param animation The keyframes for various transforms.
 * @param forKeyframe Runs for each generated keyframe.
 * @param animFreq The sampling rate of new keyframes.
 * @param animOptimizer The optional optimizer for the keyframes.
 */
export function bakeAnimation(
  animation: {
    pos?: RawKeyframesVec3;
    rot?: RawKeyframesVec3;
    scale?: RawKeyframesVec3;
  },
  forKeyframe?: (transform: {
    pos: Vec3;
    rot: Vec3;
    scale: Vec3;
    time: number;
  }) => void,
  animFreq?: number,
  animOptimizer?: OptimizeSettings
) {
  animFreq ??= 1 / 32;
  animation.pos ??= [0, 0, 0];
  animation.rot ??= [0, 0, 0];
  animation.scale ??= [1, 1, 1];

  const dataAnim = new SimpleAnimation().abstract();
  dataAnim.position = copy(animation.pos);
  dataAnim.rotation = copy(animation.rot);
  dataAnim.scale = copy(animation.scale);

  const data = {
    pos: <number[][]>[],
    rot: <number[][]>[],
    scale: <number[][]>[],
  };

  function getDomain(arr: RawKeyframesAny) {
    let newArr = complexifyArray(arr);
    newArr = newArr.sort((a, b) => new Keyframe(a).time - new Keyframe(b).time);
    let min = 1;
    let max = 0;
    newArr.forEach((x) => {
      const time = new Keyframe(x).time;
      if (time < min) min = time;
      if (time > max) max = time;
    });
    return { min: min, max: max };
  }

  const posDomain = getDomain(animation.pos);
  const rotDomain = getDomain(animation.rot);
  const scaleDomain = getDomain(animation.scale);

  const totalMin = floorTo(
    getDomain([[posDomain.min], [rotDomain.min], [scaleDomain.min]]).min,
    animFreq
  );
  const totalMax = ceilTo(
    getDomain([[posDomain.max], [rotDomain.max], [scaleDomain.max]]).max,
    animFreq
  );

  for (let i = totalMin; i <= totalMax; i += animFreq) {
    const keyframe = {
      pos: dataAnim.get("position", i),
      rot: dataAnim.get("rotation", i),
      scale: dataAnim.get("scale", i),
      time: i,
    };

    if (forKeyframe) forKeyframe(keyframe);

    data.pos.push([...keyframe.pos, keyframe.time]);
    data.rot.push([...keyframe.rot, keyframe.time]);
    data.scale.push([...keyframe.scale, keyframe.time]);
  }

  dataAnim.position = data.pos as KeyframesVec3;
  dataAnim.rotation = data.rot as KeyframesVec3;
  dataAnim.scale = data.scale as KeyframesVec3;

  dataAnim.optimize(undefined, animOptimizer);

  return {
    pos: dataAnim.position as RawKeyframesVec3,
    rot: dataAnim.rotation as RawKeyframesVec3,
    scale: dataAnim.scale as RawKeyframesVec3,
  };
}

/**
 * Reverse an animation. Accounts for most easings but not splines.
 * @param animation Animation to reverse.
 */
export function reverseAnimation<T extends NumberTuple>(
  animation: RawKeyframesAbstract<T>
) {
  if (isSimple(animation)) return animation;
  const keyframes: Keyframe[] = [];

  (animation as ComplexKeyframesAbstract<T>).forEach((x, i) => {
    const k = new Keyframe(copy(x));
    k.time = 1 - k.time;
    keyframes[animation.length - 1 - i] = k;
  });

  for (let i = keyframes.length - 1; i >= 0; i--) {
    const current = keyframes[i];

    if (current.easing) {
      if (current.easing && !current.easing.includes("InOut")) {
        if (current.easing.includes("In")) {
          current.easing = current.easing.replace("In", "Out") as EASE;
        } else if (current.easing.includes("Out")) {
          current.easing = current.easing.replace("Out", "In") as EASE;
        }
      }

      const last = keyframes[i + 1];
      last.easing = current.easing;
      arrRemove(current.data, current.getFlagIndex("ease", false));
    }
  }

  return keyframes.map((x) => x.data) as RawKeyframesAbstract<T>;
}

/**
 * Get an animation with a reversed animation after.
 * @param animation Animation to mirror.
 */
export function mirrorAnimation<T extends NumberTuple>(
  animation: RawKeyframesAbstract<T>
) {
  const reversedAnim = reverseAnimation(animation);
  const output: Keyframe[] = [];

  iterateKeyframes(animation, (x) => {
    const k = new Keyframe(copy(x));
    k.time = k.time / 2;
    output.push(k);
  });

  iterateKeyframes(reversedAnim, (x) => {
    const k = new Keyframe(x);
    k.time = k.time / 2 + 0.5;
    output.push(k);
  });

  return output.map((x) => x.data) as ComplexKeyframesAbstract<T>;
}
