// deno-lint-ignore-file adjacent-overload-signatures no-namespace
import {
  AnimationInternals,
  combineAnimations,
  PointDefinitionLinear,
  PointDefinitionVec3,
  Track,
} from "./animation.ts";
import { activeDiffGet, TJson } from "./beatmap.ts";
import { ColorType, copy, jsonGet, jsonSet, Vec3 } from "./general.ts";
import { CustomEvent } from "./custom_event.ts";
import { ANIM, EASE, GEO_SHADER, GEO_TYPE, LOOKUP } from "./constants.ts";

let envCount = 0;

export namespace EnvironmentInternals {
  export class BaseEnvironment {
    /** The Json data on this object. */
    json: TJson = {};

    /**
     * Create an environment/geometry object using Json.
     * @param json The Json to import.
     */
    import(json: TJson) {
      this.json = json;
      return this;
    }

    /** Push this environment/geometry object to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
      activeDiffGet().rawEnvironment.push(clone ? copy(this) : this);
      return this;
    }

    /** How many times to duplicate this object. */
    get duplicate() {
      return this.json.duplicate;
    }
    /** Whether this object is enabled. */
    get active() {
      return this.json.active;
    }
    /** The scale of this object. */
    get scale() {
      return this.json.scale;
    }
    /** The worldspace position of this object. */
    get position() {
      return this.json.position;
    }
    /** The position of this object relative to it's parent. */
    get localPosition() {
      return this.json.localPosition;
    }
    /** The worldspace rotation of this object. */
    get rotation() {
      return this.json.rotation;
    }
    /** The rotation of this object relative to it's parent. */
    get localRotation() {
      return this.json.localRotation;
    }
    /** The track class for this object.
     * Please read the properties of this class to see how it works.
     */
    get track() {
      return new Track(this.json);
    }
    /** Group used with "animateEnvGroup". Not saved to the difficulty. */
    get group() {
      return this.json.group;
    }
    /** All the animateable properties of this object. */
    get animationProperties() {
      const returnObj: {
        position?: PointDefinitionVec3;
        localPosition?: PointDefinitionVec3;
        rotation?: PointDefinitionVec3;
        localRotation?: PointDefinitionVec3;
        scale?: PointDefinitionVec3;
      } = {};
      if (this.position) returnObj.position = this.position;
      if (this.localPosition) returnObj.localPosition = this.localPosition;
      if (this.rotation) returnObj.rotation = this.rotation;
      if (this.localRotation) returnObj.localRotation = this.localRotation;
      if (this.scale) returnObj.scale = this.scale;
      return returnObj;
    }
    /** All of the components on this object. */
    get components() {
      return jsonGet(this.json, "components", {});
    }
    /** Sets the "lightID" value on the "ILightWithID" component. */
    get lightID() {
      return jsonGet(jsonGet(this.components, "ILightWithId", {}), "lightID");
    }
    /** Sets the "type" value on the "ILightWithID" component. */
    get lightType() {
      return jsonGet(jsonGet(this.components, "ILightWithId", {}), "type");
    }

    set duplicate(value: number) {
      this.json.duplicate = value;
    }
    set active(value: boolean) {
      this.json.active = value;
    }
    set scale(value: Vec3) {
      this.json.scale = value;
    }
    set position(value: Vec3) {
      this.json.position = value;
    }
    set localPosition(value: Vec3) {
      this.json.localPosition = value;
    }
    set rotation(value: Vec3) {
      this.json.rotation = value;
    }
    set localRotation(value: Vec3) {
      this.json.localRotation = value;
    }
    set group(value: string) {
      this.json.group = value;
    }
    set components(value: Components) {
      this.json.components = value;
    }
    set lightID(value: number) {
      jsonSet(jsonGet(this.components, "ILightWithId", {}), "lightID", value);
    }
    set lightType(value: number) {
      jsonSet(jsonGet(this.components, "ILightWithId", {}), "type", value);
    }
  }
}

export class Environment extends EnvironmentInternals.BaseEnvironment {
  /**
   * Environment object for ease of creation and additional tools.
   * @param id The object name to look up in the environment.
   * @param lookupMethod The method of looking up the object name in the environment.
   */
  constructor(id?: string, lookupMethod: LOOKUP | undefined = undefined) {
    super();
    id ??= "";
    lookupMethod ??= "Contains";
    this.id = id;
    this.lookupMethod = lookupMethod;
  }

  /** The object name to look up in the environment. */
  get id() {
    return this.json.id;
  }
  /** The method of looking up the object name in the environment. */
  get lookupMethod() {
    return this.json.lookupMethod;
  }

  set id(value: string) {
    this.json.id = value;
  }
  set lookupMethod(value: LOOKUP) {
    this.json.lookupMethod = value;
  }
}

export class Geometry extends EnvironmentInternals.BaseEnvironment {
  json: TJson = {
    geometry: {},
  };

  /**
   * Geometry object for ease of creation and additional tools.
   * @param type The geometry shape type.
   * @param material The material on this geometry object.
   */
  constructor(type?: GEO_TYPE, material?: GeometryMaterial | string) {
    super();
    type ??= "Cube";
    material ??= {
      shader: "Standard",
    };
    this.type = type;
    this.material = material;
  }

  /** The geometry shape type. */
  get type() {
    return this.json.geometry.type;
  }
  /** The material on this geometry object. */
  get material() {
    return this.json.geometry.material;
  }
  /** Whether this geometry object has collision. */
  get collision() {
    return this.json.geometry.collision;
  }

  set type(value: GEO_TYPE) {
    this.json.geometry.type = value;
  }
  set material(value: GeometryMaterial | string) {
    this.json.geometry.material = value;
  }
  set collision(value: boolean) {
    this.json.geometry.collision = value;
  }
}

/** A material used on a geometry object. Allows difficulty material references. */
export type GeometryMaterial = RawGeometryMaterial | string;
/** All properties allowed for a material used on a geometry object. */
export type RawGeometryMaterial = {
  shader: GEO_SHADER;
  color?: ColorType;
  track?: string;
  shaderKeywords?: string[];
};

/**
 * Targets any environment objects in a group and animates them based on their original transforms.
 * @param group The group to target.
 * @param time The time of the animation.
 * @param animation Callback for the animation that will be used.
 * @param duration Duration of the animation.
 * @param easing Easing on the animation.
 */
export function animateEnvGroup(
  group: string,
  time: number,
  animation: (animation: AnimationInternals.EnvironmentAnimation) => void,
  duration?: number,
  easing?: EASE,
) {
  if (activeDiffGet().rawEnvironment !== undefined) {
    activeDiffGet().rawEnvironment.forEach((x) => {
      if (x.group === group) {
        const newAnimation = new AnimationInternals.AbstractAnimation();
        animation(newAnimation);

        if (!x.track.value) {
          x.track.value = `environment_${envCount}`;
          envCount++;
        }

        const event = new CustomEvent(time).animateTrack(x.track.value);
        if (duration) event.duration = duration;
        if (easing) event.easing = easing;

        Object.keys(newAnimation.json).forEach((key) => {
          event.animate.json[key] = newAnimation.json[key];
          if (x.json[key]) {
            event.animate.json[key] = combineAnimations(
              event.animate.json[key],
              x.json[key],
              key as ANIM,
            );
          }
        });

        event.push();
      }
    });
  }
}

/**
 * Targets any environment objects in a track and animates them based on their original transforms.
 * @param track The track to target.
 * @param time The time of the animation.
 * @param animation Callback for the animation that will be used.
 * @param duration Duration of the animation.
 * @param easing Easing on the animation.
 */
export function animateEnvTrack(
  track: string,
  time: number,
  animation: (animation: AnimationInternals.EnvironmentAnimation) => void,
  duration?: number,
  easing?: EASE,
) {
  if (activeDiffGet().rawEnvironment !== undefined) {
    activeDiffGet().rawEnvironment.forEach((x) => {
      if (x.track.value === track) {
        const newAnimation = new AnimationInternals.AbstractAnimation();
        animation(newAnimation);

        const event = new CustomEvent(time).animateTrack(x.track.value);
        if (duration) event.duration = duration;
        if (easing) event.easing = easing;

        Object.keys(newAnimation.json).forEach((key) => {
          event.animate.json[key] = newAnimation.json[key];
          if (x.json[key]) {
            event.animate.json[key] = combineAnimations(
              event.animate.json[key],
              x.json[key],
              key as ANIM,
            );
          }
        });

        event.push();
      }
    });
  }
}

/** All components on environment objects. */
export type Components = {
  ILightWithId?: ILightWithId<number>;
  BloomFogEnvironment?: BloomFogEnvironment<number>;
  TubeBloomPrePassLight?: TubeBloomPrePassLight<number>;
};

/** The "ILightWithId" environment component.
 * Allows both animated and non animated variants. */
export type ILightWithId<T extends number | PointDefinitionLinear> = {
  lightID: T;
  type: T;
};

/** The "BloomFogEnvironment" environment component.
 * Allows both animated and non animated variants. */
export type BloomFogEnvironment<T extends number | PointDefinitionLinear> = {
  attenuation?: T;
  offset?: T;
  startY?: T;
  height?: T;
};

/** The "TubeBloomPrePassLight" environment component.
 * Allows both animated and non animated variants. */
export type TubeBloomPrePassLight<T extends number | PointDefinitionLinear> = {
  colorAlphaMultiplier?: T;
  bloomFogIntensityMultiplier?: T;
};
