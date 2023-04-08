import { combineAnimations, Track } from "./animation.ts";
import { activeDiffGet, TJson } from "./beatmap.ts";
import { ColorType, copy, jsonGet, jsonSet, Vec3 } from "./general.ts";
import { CustomEvent } from "./custom_event.ts";
import { ANIM, EASE, GEO_SHADER, GEO_TYPE, LOOKUP } from "./constants.ts";
import { bsmap, KeyframesLinear } from "./mod.ts";
import { AnimationInternals, EnvironmentInternals } from "./internals/mod.ts";

let envCount = 0;

export class Environment extends EnvironmentInternals.BaseEnvironment<
  bsmap.v2.IChromaEnvironmentID,
  bsmap.v3.IChromaEnvironmentID
> {
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
  id: string;
  /** The method of looking up the object name in the environment. */
  lookupMethod: LOOKUP;

  toJson(v3: true): bsmap.v3.IChromaEnvironmentID;
  toJson(v3: false): bsmap.v2.IChromaEnvironmentID;
  toJson(
    v3: boolean,
  ): bsmap.v2.IChromaEnvironmentID | bsmap.v3.IChromaEnvironmentID {
    if (v3) {
      return {
        id: this.id,
        lookupMethod: this.lookupMethod,
        active: this.active,
        components: {
          ILightWithId: {
            lightID: this.lightsID,
            type: this.lightsType,
          },
          ...this.components,
        },
        duplicate: this.duplicate,
        localPosition: this.localPosition,
        localRotation: this.localRotation,
        position: this.position,
        rotation: this.rotation,
        scale: this.scale,
        track: this.track?.value as string,
      } satisfies bsmap.v3.IChromaEnvironmentID;
    }

    if (this.components) throw "Components are not supported in v2";

    return {
      _id: this.id,
      _lookupMethod: this.lookupMethod,
      _active: this.active,
      _duplicate: this.duplicate,
      _lightID: this.lightsID,
      _localPosition: this.localPosition,
      _localRotation: this.localRotation,
      _position: this.position,
      _rotation: this.rotation,
      _scale: this.scale,
      _track: this.track?.value as string,
    } satisfies bsmap.v2.IChromaEnvironmentID;
  }
}

export class Geometry extends EnvironmentInternals.BaseEnvironment<
  bsmap.v2.IChromaEnvironmentGeometry,
  bsmap.v3.IChromaEnvironmentGeometry
> {
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
  type: GEO_TYPE;
  /** The material on this geometry object. */
  material: GeometryMaterial | string;
  /** Whether this geometry object has collision. */
  collision?: boolean;

  toJson(v3: true): bsmap.v3.IChromaEnvironmentGeometry;
  toJson(v3: false): bsmap.v2.IChromaEnvironmentGeometry;
  toJson(
    v3: boolean,
  ): bsmap.v2.IChromaEnvironmentGeometry | bsmap.v3.IChromaEnvironmentGeometry {
    if (v3) {
      return {
        geometry: {
          material: this.material,
          type: this.type,
          collision: this.collision,
        },
        active: this.active,
        components: {
          ILightWithId: {
            lightID: this.lightsID,
            type: this.lightsType,
          },
          ...this.components,
        },
        duplicate: this.duplicate,
        localPosition: this.localPosition,
        localRotation: this.localRotation,
        position: this.position,
        rotation: this.rotation,
        scale: this.scale,
        track: this.track?.value as string,
      } satisfies bsmap.v3.IChromaEnvironmentGeometry;
    }

    return {
      _geometry: {
        _material: typeof this.material === "string" ? this.material : {
          _shader: this.material?.shader,
          _color: this.material?.color,
          _shaderKeywords: this.material?.shaderKeywords,
        },
        _type: this.type,
        _collision: this.collision,
      },
      _active: this.active,
      _duplicate: this.duplicate,
      _lightID: this.lightsID,
      _localPosition: this.localPosition,
      _localRotation: this.localRotation,
      _position: this.position,
      _rotation: this.rotation,
      _scale: this.scale,
      _track: this.track?.value as string,
    } satisfies bsmap.v2.IChromaEnvironmentGeometry;
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
export type Components<N extends number | KeyframesLinear = number> = {
  ILightWithId?: ILightWithId<N>;
  BloomFogEnvironment?: BloomFogEnvironment<N>;
  TubeBloomPrePassLight?: TubeBloomPrePassLight<N>;
};

/** The "ILightWithId" environment component.
 * Allows both animated and non animated variants. */
export type ILightWithId<T extends number | KeyframesLinear> = {
  lightID: T;
  type: T;
};

/** The "BloomFogEnvironment" environment component.
 * Allows both animated and non animated variants. */
export type BloomFogEnvironment<T extends number | KeyframesLinear> = {
  attenuation?: T;
  offset?: T;
  startY?: T;
  height?: T;
};

/** The "TubeBloomPrePassLight" environment component.
 * Allows both animated and non animated variants. */
export type TubeBloomPrePassLight<T extends number | KeyframesLinear> = {
  colorAlphaMultiplier?: T;
  bloomFogIntensityMultiplier?: T;
};
