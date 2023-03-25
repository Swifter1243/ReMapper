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
import { Json } from "../beatmap.ts";
import { ANIM } from "../constants.ts";

/** Bare minimum animation class. */
export class BaseAnimation {
  /** The JSON data of this animation. */
  json: Json = {};
  /**
   * The time in each keyframe is divided by the length.
   * Use a negative number or don't specify a length to use a range between 0 and 1.
   */
  length: number;

  constructor(length?: number, data?: Json) {
    length ??= 1;

    this.length = length;
    if (data !== undefined) this.json = data;
  }

  /**
   * Clear animation data.
   * @param property The property to clear.
   * Leave undefined to clear everything in this animation.
   */
  clear(property?: string) {
    if (property !== undefined) delete this.json[property];
    else {
      Object.keys(this.json).forEach((x) => {
        delete this.json[x];
      });
    }
  }

  /**
   * Set a property's animations.
   * @param property The property to set.
   * @param value The value of the property.
   * @param process Whether the value should be processed. E.g. sort by time.
   */
  set(property: ANIM, value: KeyframesAny, process = true) {
    if (typeof value === "string" || !process) this.json[property] = value;
    else {
      this.json[property] = simplifyArray(
        this.convert(complexifyArray(value)).sort(
          (a: KeyframeValues, b: KeyframeValues) =>
            new Keyframe(a).time - new Keyframe(b).time,
        ),
      );
    }
  }

  /**
   * Get a property's animations.
   * @param property The property to get.
   * @param time Option to get the values of a property at a certain time.
   * Time can be in length of animation or between 0 and 1 if negative.
   * Can be left undefined.
   */
  get(property: ANIM, time?: number) {
    if (time === undefined || typeof time === "string") {
      return this.json[property];
    } else {
      time = this.convertTime(time);
      return getValuesAtTime(property, this.json[property], time);
    }
  }

  /**
   * Add keyframes to a property, also sorts by time and makes optimizations if possible.
   * @param property The property to add to.
   * @param value What keyframes to add.
   */
  add(property: string, value: KeyframesAny) {
    if (typeof value === "string") this.json[property] = value;
    else {
      value = this.convert(complexifyArray(value));
      const concatArray = value.concat(complexifyArray(this.json[property]));
      const newValue = simplifyArray(
        concatArray.sort((a, b) => new Keyframe(a).time - new Keyframe(b).time),
      );
      this.json[property] = newValue;
    }
  }

  /**
   * Remove similar values to cut down on keyframe count.
   * @param property Optimize only a single property, or set to undefined to optimize all.
   * @param settings Options for the optimizer. Optional.
   */
  optimize(
    property?: ANIM,
    settings: OptimizeSettings = new OptimizeSettings(),
  ) {
    if (property === undefined) {
      (Object.keys(this.json) as ANIM[]).forEach((key) => {
        if (Array.isArray(this.json[key])) {
          const oldArray = this.get(key);
          const oldCount = oldArray.length;

          const print = settings.performance_log;
          settings.performance_log = false;

          this.set(key, optimizeAnimation(oldArray, settings));

          const newCount = this.get(key).length;
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
    if (time >= 0) return time / this.length;
    else return time * -1;
  }
}

class ObjectAnimation extends BaseAnimation {
  /** Adds to the position of the object. */
  get position() {
    return this.get("offsetPosition");
  }
  /** Sets the absolute position of the object. */
  get definitePosition() {
    return this.get("definitePosition");
  }
  /** Rotates the object around the world origin. */
  get rotation() {
    return this.get("offsetWorldRotation");
  }
  /** Rotates the object around it's anchor point. */
  get localRotation() {
    return this.get("localRotation");
  }
  /** Scales the object. */
  get scale() {
    return this.get("scale");
  }
  /** Controls the dissolve shader on the object.
   * 0 means invisible, 1 means visible.
   */
  get dissolve() {
    return this.get("dissolve");
  }
  /** Controls the color of the object. */
  get color() {
    return this.get("color");
  }
  /** Controls whether the object is interactable.
   * 0 = interactable, 1 means uninteractable.
   */
  get uninteractable() {
    return this.get("uninteractable");
  }
  /** Controls the time value for other animations. */
  get time() {
    return this.get("time");
  }

  set position(value: KeyframesVec3) {
    this.set("offsetPosition", value);
  }
  set definitePosition(value: KeyframesVec3) {
    this.set("definitePosition", value);
  }
  set rotation(value: KeyframesVec3) {
    this.set("offsetWorldRotation", value);
  }
  set localRotation(value: KeyframesVec3) {
    this.set("localRotation", value);
  }
  set scale(value: KeyframesVec3) {
    this.set("scale", value);
  }
  set dissolve(value: KeyframesLinear) {
    this.set("dissolve", value);
  }
  set color(value: KeyframesVec4) {
    this.set("color", value);
  }
  set uninteractable(value: KeyframesLinear) {
    this.set("uninteractable", value);
  }
  set time(value: KeyframesLinear) {
    this.set("time", value);
  }
}

/** Animation specifically for note objects. */
export class NoteAnimation extends ObjectAnimation {
  /** Controls the dissolve shader on the arrow.
   * 0 means invisible, 1 means visible.
   */
  get dissolveArrow() {
    return this.get("dissolveArrow");
  }
  set dissolveArrow(value: KeyframesLinear) {
    this.set("dissolveArrow", value);
  }
}

/** Animation specifically for wall objects. */
export class WallAnimation extends ObjectAnimation {}

/** Animation specifically for environment objects. */
export class EnvironmentAnimation extends BaseAnimation {
  /** The position of the object in world space. */
  get position() {
    return this.get("position");
  }
  /** The rotation of the object in world space. */
  get rotation() {
    return this.get("rotation");
  }
  /** The position of the object relative to it's parent. */
  get localPosition() {
    return this.get("localPosition");
  }
  /** The rotation of the object relative to it's parent. */
  get localRotation() {
    return this.get("localRotation");
  }
  /** The scale of the object. */
  get scale() {
    return this.get("scale");
  }

  set position(value: KeyframesVec3) {
    this.set("position", value);
  }
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
export class AbstractAnimation extends BaseAnimation {
  /** The position of the object in world space. For environment objects. */
  get position() {
    return this.get("position");
  }
  /** The rotation of the object in world space. For environment objects. */
  get rotation() {
    return this.get("rotation");
  }
  /** The position of the object relative to it's parent. For environment objects. */
  get localPosition() {
    return this.get("localPosition");
  }
  /** The rotation of the object relative to it's parent. For environment objects. */
  get localRotation() {
    return this.get("localRotation");
  }
  /** Adds to the position of the object. For gameplay objects. */
  get offsetPosition() {
    return this.get("offsetPosition");
  }
  /** Adds to the rotation of the object. For gameplay objects.  */
  get offsetRotation() {
    return this.get("offsetWorldRotation");
  }
  /** Sets the absolute position of the object. For gameplay objects. */
  get definitePosition() {
    return this.get("definitePosition");
  }
  /** Sets the scale of the object. */
  get scale() {
    return this.get("scale");
  }
  /** Controls the dissolve shader on the object.
   * 0 means invisible, 1 means visible.
   * For gameplay objects.
   */
  get dissolve() {
    return this.get("dissolve");
  }
  /** Controls the dissolve shader on the object.
   * 0 means invisible, 1 means visible.
   * For note objects.
   */
  get dissolveArrow() {
    return this.get("dissolveArrow");
  }
  /** Controls the color of the object. */
  get color() {
    return this.get("color");
  }
  /** Controls whether the object is interactable.
   * 0 = interactable, 1 means uninteractable.
   */
  get uninteractable() {
    return this.get("uninteractable");
  }
  /** Controls the time value for other animations. */
  get time() {
    return this.get("time");
  }

  set position(value: KeyframesVec3) {
    this.set("position", value);
  }
  set rotation(value: KeyframesVec3) {
    this.set("rotation", value);
  }
  set localPosition(value: KeyframesVec3) {
    this.set("localPosition", value);
  }
  set localRotation(value: KeyframesVec3) {
    this.set("localRotation", value);
  }
  set offsetPosition(value: KeyframesVec3) {
    this.set("offsetPosition", value);
  }
  set offsetRotation(value: KeyframesVec3) {
    this.set("offsetWorldRotation", value);
  }
  set definitePosition(value: KeyframesVec3) {
    this.set("definitePosition", value);
  }
  set scale(value: KeyframesVec3) {
    this.set("scale", value);
  }
  set dissolve(value: KeyframesLinear) {
    this.set("dissolve", value);
  }
  set dissolveArrow(value: KeyframesLinear) {
    this.set("dissolveArrow", value);
  }
  set color(value: KeyframesVec4) {
    this.set("color", value);
  }
  set uninteractable(value: KeyframesLinear) {
    this.set("uninteractable", value);
  }
  set time(value: KeyframesLinear) {
    this.set("time", value);
  }
}
