/** Contains subclasses for animation related classes. */

import {
  complexifyArray,
  ComplexKeyframesAny,
  getValuesAtTime,
  Keyframe,
  KeyframesAny,
  KeyframesLinear,
  KeyframesVec3,
  KeyframesVec4,
  KeyframeValues,
  simplifyArray,
} from "../animation.ts";
import { optimizeAnimation, OptimizeSettings } from "../anim_optimizer.ts";
import { TJson } from "../beatmap.ts";
import { ANIM } from "../constants.ts";
import { Vec2, Vec3, Vec4 } from "../general.ts";
import { FilterTypes } from "../types.ts";

type BaseAnimationData<T> = FilterTypes<keyof T & string, KeyframesAny>;

/** Bare minimum animation class. */
export class BaseAnimation<
  O,
  T extends BaseAnimationData<O> = BaseAnimationData<O>,
> {
  properties: Partial<T> = {};

  /**
   * The time in each keyframe is divided by the length.
   * Don't specify to use a range between 0 and 1.
   */
  duration: number;

  constructor(duration?: number, data?: BaseAnimation<O, T>["properties"]) {
    this.duration = duration ?? 1;
    this.properties = data ?? this.properties;
  }

  /**
   * Clear animation data.
   * @param property The property to clear.
   * Leave undefined to clear everything in this animation.
   */
  clear(property?: keyof T) {
    if (property !== undefined) delete this.properties[property];
    else {
      Object.keys(this.properties).map((k) => k as keyof T).forEach((x) => {
        delete this.properties[x];
      });
    }
  }

  /**
   * Set a property's animations.
   * @param property The property to set.
   * @param value The value of the property.
   * @param process Whether the value should be processed. E.g. sort by time.
   */
  set<K extends keyof T>(property: K, value: T[K] | undefined, process = true) {
    if (typeof value === "string" || !process) {
      this.properties[property] = value;
      return;
    }

    if (!value) {
      this.properties[property] = value;
      return;
    }

    this.properties[property] = simplifyArray(
      this.convert(complexifyArray(value)).sort(
        (a: KeyframeValues, b: KeyframeValues) =>
          new Keyframe(a).time - new Keyframe(b).time,
      ),
    ) as T[K];
  }

  /**
   * Get a property's animations.
   * @param property The property to get.
   * @param time Option to get the values of a property at a certain time.
   * Time can be in length of animation or between 0 and 1 if negative.
   * Can be left undefined.
   */
  get<K extends keyof T>(
    property: K,
    time?: number,
  ): T[K] | undefined {
    const prop = this.properties[property];
    if (!prop) return undefined;

    if (time === undefined || typeof time === "string") {
      return prop as T[K];
    } else {
      time = this.convertTime(time);
      return getValuesAtTime(property as string, prop, time) as T[K];
    }
  }

  /**
   * Add keyframes to a property, also sorts by time and makes optimizations if possible.
   * @param property The property to add to.
   * @param value What keyframes to add.
   */
  add<K extends keyof T>(property: K, value: T[K]) {
    if (typeof value === "string") {
      this.properties[property] = value;
      return;
    }

    const prop = this.properties[property];

    if (!prop) {
      this.properties[property] = value;
      return;
    }

    if (typeof prop === "string") {
      throw "Does not support point definitions!";
    }

    const convertedValue = this.convert(complexifyArray(value));
    const concatArray = convertedValue.concat(complexifyArray(prop));
    const newValue = simplifyArray(
      concatArray.sort((a, b) => new Keyframe(a).time - new Keyframe(b).time),
    );
    this.properties[property] = newValue as T[K];
  }

  /**
   * Remove similar values to cut down on keyframe count.
   * @param property Optimize only a single property, or set to undefined to optimize all.
   * @param settings Options for the optimizer. Optional.
   */
  optimize(
    property?: keyof T,
    settings: OptimizeSettings = new OptimizeSettings(),
  ) {
    if (property === undefined) {
      const keys = Object.keys(this.properties) as (keyof T & string)[];

      keys.forEach((key: keyof T & string) => {
        const val = this.properties[key];
        if (Array.isArray(val)) {
          const oldArray = this.get(key)!;
          const oldCount = oldArray.length;

          const print = settings.performance_log;
          settings.performance_log = false;

          this.set(key, optimizeAnimation(oldArray, settings));

          const newCount = this.get(key)!.length;
          settings.performance_log = print;
          if (print && newCount !== oldCount) {
            console.log(
              `Optimized ${key} ${oldCount} -> ${newCount} (reduced ${
                (
                  100 -
                  (newCount / oldCount) * 100
                ).toFixed(2)
              }%) points`,
            );
          }
        }
      });
    } else {
      this.set(property, optimizeAnimation(this.get(property), settings));
    }
  }

  private convert(value: ComplexKeyframesAny) {
    return value.map((x) => {
      const time = new Keyframe(x).timeIndex;
      x[time] = this.convertTime(x[time] as number);
      return x;
    }) as ComplexKeyframesAny;
  }

  private convertTime(time: number) {
    if (time >= 0) return time / this.duration;
    else return time * -1;
  }
}

interface ObjectAnimationData {
  position: KeyframesVec3 | undefined;
  offsetPosition: KeyframesVec3 | undefined;
  definitePosition: KeyframesVec3 | undefined;
  rotation: KeyframesVec3 | undefined;
  offsetWorldRotation: KeyframesVec3 | undefined;
  localRotation: KeyframesVec3 | undefined;
  scale: KeyframesVec3 | undefined;
  dissolve: KeyframesLinear | undefined;
  uninteractable: KeyframesLinear | undefined;
  time: KeyframesLinear | undefined;
  color: KeyframesVec4 | undefined;
}

class ObjectAnimation<
  T extends ObjectAnimationData = ObjectAnimationData,
> extends BaseAnimation<T> {}

interface NoteAnimationData extends ObjectAnimationData {
  /** Controls the dissolve shader on the arrow.
   * 0 means invisible, 1 means visible.
   */
  dissolveArrow: KeyframesLinear | undefined;
}

/** Animation specifically for note objects. */
export class NoteAnimation extends ObjectAnimation<NoteAnimationData>
  implements NoteAnimationData {
  /** The position of the object in world space. For environment objects. */
  get position(): KeyframesVec3 | undefined {
    return this.get("position");
  }
  set position(value: KeyframesVec3 | undefined) {
    this.set("position", value);
  }

  /** The rotation of the object in world space. For environment objects. */
  get rotation() {
    return this.get("rotation");
  }
  set rotation(value: KeyframesVec3 | undefined) {
    this.set("rotation", value);
  }

  /** The position of the object relative to it's parent. For environment objects. */
  get localPosition() {
    return this.get("localPosition");
  }
  set localPosition(value: KeyframesVec3 | undefined) {
    this.set("localPosition", value);
  }
  /** The rotation of the object relative to it's parent. For environment objects. */
  get localRotation() {
    return this.get("localRotation");
  }
  set localRotation(value: KeyframesVec3 | undefined) {
    this.set("localRotation", value);
  }
  /** Adds to the position of the object. For gameplay objects. */
  get offsetPosition() {
    return this.get("offsetPosition");
  }
  set offsetPosition(value: KeyframesVec3 | undefined) {
    this.set("offsetPosition", value);
  }
  /** Adds to the rotation of the object. For gameplay objects.  */
  get offsetRotation() {
    return this.get("offsetWorldRotation");
  }
  set offsetRotation(value: KeyframesVec3 | undefined) {
    this.set("offsetWorldRotation", value);
  }

  /** Adds to the rotation of the object. For gameplay objects.  */
  get offsetWorldRotation() {
    return this.get("offsetWorldRotation");
  }
  set offsetWorldRotation(value: KeyframesVec3 | undefined) {
    this.set("offsetWorldRotation", value);
  }

  /** Sets the absolute position of the object. For gameplay objects. */
  get definitePosition() {
    return this.get("definitePosition");
  }
  set definitePosition(value: KeyframesVec3 | undefined) {
    this.set("definitePosition", value);
  }
  /** Sets the scale of the object. */
  get scale() {
    return this.get("scale");
  }
  set scale(value: KeyframesVec3 | undefined) {
    this.set("scale", value);
  }
  /** Controls the dissolve shader on the object.
   * 0 means invisible, 1 means visible.
   * For gameplay objects.
   */
  get dissolve() {
    return this.get("dissolve");
  }
  set dissolve(value: KeyframesLinear | undefined) {
    this.set("dissolve", value);
  }
  /** Controls the dissolve shader on the object.
   * 0 means invisible, 1 means visible.
   * For note objects.
   */
  get dissolveArrow() {
    return this.get("dissolveArrow");
  }
  set dissolveArrow(value: KeyframesLinear | undefined) {
    this.set("dissolveArrow", value);
  }
  /** Controls the color of the object. */
  get color() {
    return this.get("color");
  }
  set color(value: KeyframesVec4 | undefined) {
    this.set("color", value);
  }
  /** Controls whether the object is interactable.
   * 0 = interactable, 1 means uninteractable.
   */
  get uninteractable() {
    return this.get("uninteractable");
  }

  set uninteractable(value: KeyframesLinear | undefined) {
    this.set("uninteractable", value);
  }
  /** Controls the time value for other animations. */
  get time() {
    return this.get("time");
  }

  set time(value: KeyframesLinear | undefined) {
    this.set("time", value);
  }
}

/** Animation specifically for wall objects. */
export class WallAnimation extends ObjectAnimation {}

interface EnvironmentAnimationData {
  /** The position of the object in world space. */
  position: KeyframesVec3 | undefined;
  /** The position of the object relative to it's parent. */
  localPosition: KeyframesVec3 | undefined;
  /** The rotation of the object in world space. */
  rotation: KeyframesVec3 | undefined;
  /** The rotation of the object relative to it's parent. */
  localRotation: KeyframesVec3 | undefined;
  /** The scale of the object. */
  scale: KeyframesVec3 | undefined;
}

/** Animation specifically for environment objects. */
export class EnvironmentAnimation
  extends BaseAnimation<EnvironmentAnimationData> {
  set rotation(value: KeyframesVec3) {
    this.set("rotation", value);
  }
  set localPosition(value: KeyframesVec3) {
    this.set("localPosition", value);
  }
  set localRotation(value: KeyframesVec3) {
    this.set("localRotation", value);
  }
  set scale(value: KeyframesVec3) {
    this.set("scale", value);
  }
}

/** Animation that can apply to any object. */
export class AbstractAnimation extends BaseAnimation<
  EnvironmentAnimationData & NoteAnimationData & ObjectAnimationData
> implements EnvironmentAnimationData, NoteAnimationData, ObjectAnimationData {
  /** The position of the object in world space. For environment objects. */
  get position() {
    return this.get("position");
  }
  set position(value: KeyframesVec3 | undefined) {
    this.set("position", value);
  }

  /** The rotation of the object in world space. For environment objects. */
  get rotation() {
    return this.get("rotation");
  }
  set rotation(value: KeyframesVec3 | undefined) {
    this.set("rotation", value);
  }

  /** The position of the object relative to it's parent. For environment objects. */
  get localPosition() {
    return this.get("localPosition");
  }
  set localPosition(value: KeyframesVec3 | undefined) {
    this.set("localPosition", value);
  }
  /** The rotation of the object relative to it's parent. For environment objects. */
  get localRotation() {
    return this.get("localRotation");
  }
  set localRotation(value: KeyframesVec3 | undefined) {
    this.set("localRotation", value);
  }
  /** Adds to the position of the object. For gameplay objects. */
  get offsetPosition() {
    return this.get("offsetPosition");
  }
  set offsetPosition(value: KeyframesVec3 | undefined) {
    this.set("offsetPosition", value);
  }
  /** Adds to the rotation of the object. For gameplay objects.  */
  get offsetRotation() {
    return this.get("offsetWorldRotation");
  }
  set offsetRotation(value: KeyframesVec3 | undefined) {
    this.set("offsetWorldRotation", value);
  }

  /** Adds to the rotation of the object. For gameplay objects.  */
  get offsetWorldRotation() {
    return this.get("offsetWorldRotation");
  }
  set offsetWorldRotation(value: KeyframesVec3 | undefined) {
    this.set("offsetWorldRotation", value);
  }

  /** Sets the absolute position of the object. For gameplay objects. */
  get definitePosition() {
    return this.get("definitePosition");
  }
  set definitePosition(value: KeyframesVec3 | undefined) {
    this.set("definitePosition", value);
  }
  /** Sets the scale of the object. */
  get scale() {
    return this.get("scale");
  }
  set scale(value: KeyframesVec3 | undefined) {
    this.set("scale", value);
  }
  /** Controls the dissolve shader on the object.
   * 0 means invisible, 1 means visible.
   * For gameplay objects.
   */
  get dissolve() {
    return this.get("dissolve");
  }
  set dissolve(value: KeyframesLinear | undefined) {
    this.set("dissolve", value);
  }
  /** Controls the dissolve shader on the object.
   * 0 means invisible, 1 means visible.
   * For note objects.
   */
  get dissolveArrow() {
    return this.get("dissolveArrow");
  }
  set dissolveArrow(value: KeyframesLinear | undefined) {
    this.set("dissolveArrow", value);
  }
  /** Controls the color of the object. */
  get color() {
    return this.get("color");
  }
  set color(value: KeyframesVec4 | undefined) {
    this.set("color", value);
  }
  /** Controls whether the object is interactable.
   * 0 = interactable, 1 means uninteractable.
   */
  get uninteractable() {
    return this.get("uninteractable");
  }

  set uninteractable(value: KeyframesLinear | undefined) {
    this.set("uninteractable", value);
  }
  /** Controls the time value for other animations. */
  get time() {
    return this.get("time");
  }

  set time(value: KeyframesLinear | undefined) {
    this.set("time", value);
  }
}
