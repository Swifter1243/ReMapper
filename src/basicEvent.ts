// deno-lint-ignore-file no-explicit-any no-namespace adjacent-overload-signatures
import {
  EASE,
  EVENTACTION,
  EVENTGROUP,
  INTERSCOPEGROUP,
  ROTATIONACTION,
} from "./constants.ts";
import { activeDiffGet, Json } from "./beatmap.ts";
import { ColorType, copy, jsonGet, jsonSet } from "./general.ts";
import { BaseObject } from "./object.ts";

export type LightID = number | number[];



export class Event extends EventInternals.BaseEvent {
  /**
   * The starting event class builder.
   * From this point you should select one of the attached methods to continue initialization.
   * @param time Time of the event.
   */
  constructor(time = 0) {
    super(time);
  }

  /**
   * Iniitialize an event from a type.
   * @param type The type of the event.
   */
  setType(type: number) {
    return new EventInternals.LightEvent(this.json, type);
  }

  /** Controls the back lasers. (Type 0) */
  backLasers = () =>
    new EventInternals.LightEvent(this.json, EVENTGROUP.BACK_LASERS);

  /** Controls the ring lights. (Type 1) */
  ringLights = () =>
    new EventInternals.LightEvent(this.json, EVENTGROUP.RING_LIGHTS);

  /** Controls the left lasers. (Type 2) */
  leftLasers = () =>
    new EventInternals.LightEvent(this.json, EVENTGROUP.LEFT_LASERS);

  /** Controls the right lasers. (Type 3) */
  rightLasers = () =>
    new EventInternals.LightEvent(this.json, EVENTGROUP.RIGHT_LASERS);

  /** Controls the center lasers. (Type 4) */
  centerLasers = () =>
    new EventInternals.LightEvent(this.json, EVENTGROUP.CENTER_LASERS);

  /** Controls the extra left lasers in some environments. (Type 6) */
  extraLeft = () =>
    new EventInternals.LightEvent(this.json, EVENTGROUP.LEFT_EXTRA);

  /** Controls the extra right lasers in some environments. (Type 7) */
  extraRight = () =>
    new EventInternals.LightEvent(this.json, EVENTGROUP.RIGHT_EXTRA);

  /** Controls the left lasers in the Billie environment. (Type 10) */
  billieLeft = () =>
    new EventInternals.LightEvent(this.json, EVENTGROUP.BILLIE_LEFT);

  /** Controls the right lasers in the Billie environment. (Type 11) */
  billieRight = () =>
    new EventInternals.LightEvent(this.json, EVENTGROUP.BILLIE_RIGHT);

  /** Controls the outer left tower height in the Gaga environment. (Type 18) */
  gagaLeft = () =>
    new EventInternals.LightEvent(this.json, EVENTGROUP.GAGA_LEFT);

  /** Controls the outer left tower height in the Gaga environment. (Type 19) */
  gagaRight = () =>
    new EventInternals.LightEvent(this.json, EVENTGROUP.GAGA_RIGHT);

  /**
   * Create an event using Json.
   * @param json The Json to import.
   */
  import = (json: Json) => new EventInternals.AbstractEvent(json);

  /** Create an event with no particular identity. */
  abstract = () => this.import({});

  /**
   * Move cars in the interscope environment.
   * @param value The group of cars to target.
   */
  moveCars(value: INTERSCOPEGROUP) {
    this.type = EVENTGROUP.RING_SPIN;
    this.value = value;
    return new EventInternals.BaseEvent(this.json);
  }

  /** Lower the hydraulics of the cars in the interscope environment. */
  lowerHydraulics() {
    this.type = EVENTGROUP.LOWER_HYDRAULICS;
    return new EventInternals.BaseEvent(this.json);
  }

  /** Raise the hydraulics of the cars in the interscope environment. */
  raiseHydraulics() {
    this.type = EVENTGROUP.RAISE_HYDRAULICS;
    return new EventInternals.BaseEvent(this.json);
  }

  /**
   * Spin the rings of an environment.
   * @param rotation Degrees of the spin.
   * @param direction Direction of the spin. 1 is clockwise, 0 is counterclockwise.
   * @param step The angle between each ring.
   * @param speed The speed multiplier of the spin.
   * @param prop The rate at which physics propogate through the rings.
   * High values will cause rings to move simultneously, low values gives them significant delay.
   * @param nameFilter The ring object name to target.
   */
  ringSpin = (
    rotation?: number,
    direction?: number,
    step?: number,
    speed?: number,
    prop?: number,
    nameFilter?: string,
  ) =>
    new EventInternals.RingSpinEvent(
      this.json,
      rotation,
      direction,
      step,
      speed,
      prop,
      nameFilter,
    );

  /**
   * Controls ring zoom.
   * @param step The position offset between each ring.
   * @param speed The speed of the zoom.
   */
  ringZoom = (step?: number, speed?: number) =>
    new EventInternals.RingZoomEvent(this.json, step, speed);

  /**
   * Controls left rotating laser speed.
   * @param speed Speed of the rotating lasers.
   * @param direction Direction of the rotating lasers.
   * @param lockRotation Whether the existing rotation should be kept.
   */
  leftLaserSpeed = (
    speed: number,
    direction?: number,
    lockRotation?: boolean,
  ) =>
    new EventInternals.LaserSpeedEvent(
      this.json,
      EVENTGROUP.LEFT_ROTATING,
      speed,
      direction,
      lockRotation,
    );

  /**
   * Controls right rotating laser speed.
   * @param speed Speed of the rotating lasers.
   * @param direction Direction of the rotating lasers.
   * @param lockRotation Whether the existing rotation should be kept.
   */
  rightLaserSpeed = (
    speed: number,
    direction?: number,
    lockRotation?: boolean,
  ) =>
    new EventInternals.LaserSpeedEvent(
      this.json,
      EVENTGROUP.RIGHT_ROTATING,
      speed,
      direction,
      lockRotation,
    );

  /**
   * Used for 360 mode, rotates future objects and active objects.
   * @param rotation The rotation of the event.
   * Must be a multiple of 15 between -60 and 60.
   */
  earlyRotation = (rotation: number) =>
    new EventInternals.RotationEvent(
      this.json,
      EVENTGROUP.EARLY_ROTATION,
      rotation,
    );

  /**
   * Used for 360 mode, rotates future objects only.
   * @param rotation The rotation of the event.
   * Must be a multiple of 15 between -60 and 60.
   */
  lateRotation = (rotation: number) =>
    new EventInternals.RotationEvent(
      this.json,
      EVENTGROUP.LATE_ROTATION,
      rotation,
    );
}
