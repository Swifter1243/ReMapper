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

type BaseAnimationData<T> = Record<keyof T, KeyframesAny>;

/** Bare minimum animation class. */
export class BaseAnimation<T extends BaseAnimationData<T>> {
  properties: Partial<Record<keyof T, KeyframesAny>> = {};

  /**
   * The time in each keyframe is divided by the length.
   * Don't specify to use a range between 0 and 1.
   */
  duration: number;

  constructor(duration?: number, data?: BaseAnimation<T>["properties"]) {
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
  set<K extends keyof T>(property: K, value: T[K], process = true) {
    if (typeof value === "string" || !process) {
      this.properties[property] = value;
      return;
    }

    this.properties[property] = simplifyArray(
      this.convert(complexifyArray(value)).sort(
        (a: KeyframeValues, b: KeyframeValues) =>
          new Keyframe(a).time - new Keyframe(b).time,
      ),
    );
  }

  /**
   * Get a property's animations.
   * @param property The property to get.
   * @param time Option to get the values of a property at a certain time.
   * Time can be in length of animation or between 0 and 1 if negative.
   * Can be left undefined.
   */
  get(
    property: keyof T,
    time?: number,
  ) {
    const prop = this.properties[property];
    if (!prop) return undefined;

    if (time === undefined || typeof time === "string") {
      return prop;
    } else {
      time = this.convertTime(time);
      return getValuesAtTime(property as string, prop, time);
    }
  }

  /**
   * Add keyframes to a property, also sorts by time and makes optimizations if possible.
   * @param property The property to add to.
   * @param value What keyframes to add.
   */
  add(property: keyof T, value: KeyframesAny) {
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

    value = this.convert(complexifyArray(value));
    const concatArray = value.concat(complexifyArray(prop));
    const newValue = simplifyArray(
      concatArray.sort((a, b) => new Keyframe(a).time - new Keyframe(b).time),
    );
    this.properties[property] = newValue;
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
  position: KeyframesVec3;
  definitePosition: KeyframesVec3;
  rotation: KeyframesVec3;
  localRotation: KeyframesVec3;
  scale: KeyframesVec3;
  dissolve: KeyframesLinear;
  interactable: KeyframesLinear;
  time: KeyframesLinear;
  color: KeyframesVec4;
}

class ObjectAnimation<T extends ObjectAnimationData = ObjectAnimationData>
  extends BaseAnimation<BaseAnimationData<T>> {}

interface NoteAnimationData extends ObjectAnimationData {
  /** Controls the dissolve shader on the arrow.
   * 0 means invisible, 1 means visible.
   */
  dissolveArrow: KeyframesLinear;
}

/** Animation specifically for note objects. */
export class NoteAnimation extends ObjectAnimation<NoteAnimationData> {
}

/** Animation specifically for wall objects. */
export class WallAnimation extends ObjectAnimation {}

interface EnvironmentAnimationData {
  /** The position of the object in world space. */
  position: KeyframesVec3;
  /** The position of the object relative to it's parent. */
  localPosition: KeyframesVec3;
  /** The rotation of the object in world space. */
  rotation: KeyframesVec3;
  /** The rotation of the object relative to it's parent. */
  localRotation: KeyframesVec3;
  /** The scale of the object. */
  scale: KeyframesVec3;
}

/** Animation specifically for environment objects. */
export class EnvironmentAnimation extends BaseAnimation<EnvironmentAnimationData> {

}

/** Animation that can apply to any object. */
export class AbstractAnimation extends BaseAnimation<EnvironmentAnimationData & NoteAnimationData & ObjectAnimationData> {

}
