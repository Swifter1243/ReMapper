import { LightID } from "../basicEvent.ts";
import { activeDiffGet } from "../beatmap.ts";
import { EASE, EventAction, EventGroup } from "../constants.ts";
import { bsmap } from "../deps.ts";
import { ColorType, copy } from "../general.ts";
import { BaseObject, ObjectFields } from "../object.ts";

type LightFields<T extends { customData: T["customData"] }> =
  & Omit<ObjectFields<T>, "floatValue">
  & {
    floatValue?: number;
  };

export type AbstractEvent = BaseEvent<
  bsmap.v2.IEvent,
  bsmap.v3.IBasicEvent
>;

export abstract class BaseEvent<
  TV2 extends bsmap.v2.IEvent,
  TV3 extends bsmap.v3.IBasicEvent,
> extends BaseObject<TV2, TV3> {
  /** The bare minimum event. */

  constructor(obj: LightFields<BaseEvent<TV2, TV3>>) {
    super(obj);
    this.floatValue ??= 1;
  }

  /** Push this event to the difficulty
   * @param clone Whether this object will be copied before being pushed.
   */
  push(clone = true) {
    activeDiffGet().events.push(clone ? copy(this) : this);
    return this;
  }

  /** The type of the event. */
  type:
    | TV2["_type"]
    | TV3["et"]
    | EventGroup.GAGA_LEFT
    | EventGroup.GAGA_RIGHT = 0!;
  /** The value of the event. */
  value: TV2["_value"] | TV3["i"] = 0!;
  /** The value of the event, but allowing decimals. */
  floatValue = 1;
}

export class LightEvent
  extends BaseEvent<bsmap.v2.IEventLight, bsmap.v3.IBasicEventLight> {
  /** Create an event that turns lights off
   * @param lightID The lightIDs to target.
   */
  off(lightID?: LightID) {
    this.value = EventAction.OFF;
    if (lightID) this.lightID = lightID;
    return this;
  }

  /**
   * Create an event that turns lights on.
   * @param color Can be boolean to determine if the light is blue (true), or a color.
   * @param lightID The lightIDs to target.
   */
  on(color: ColorType | boolean = true, lightID?: LightID) {
    this.value = typeof color === "boolean" && color
      ? EventAction.BLUE_ON
      : EventAction.RED_ON;
    if (typeof color !== "boolean") this.color = color;
    if (lightID) this.lightID = lightID;
    return this;
  }

  /**
   * Create an event that flashes the lights.
   * @param color Can be boolean to determine if the light is blue (true), or a color.
   * @param lightID The lightIDs to target.
   */
  flash(color: ColorType | boolean = true, lightID?: LightID) {
    this.value = typeof color === "boolean" && color
      ? EventAction.BLUE_FLASH
      : EventAction.RED_FLASH;
    if (typeof color !== "boolean") this.color = color;
    if (lightID) this.lightID = lightID;
    return this;
  }

  /**
   * Create an event that fades the lights out.
   * @param color Can be boolean to determine if the light is blue (true), or a color.
   * @param lightID The lightIDs to target.
   */
  fade(color: ColorType | boolean = true, lightID?: LightID) {
    this.value = typeof color === "boolean" && color
      ? EventAction.BLUE_FADE
      : EventAction.RED_FADE;
    if (typeof color !== "boolean") this.color = color;
    if (lightID) this.lightID = lightID;
    return this;
  }

  /**
   * Create an event that makes the lights fade in to this color from the previous.
   * @param color Can be boolean to determine if the light is blue (true), or a color.
   * @param lightID The lightIDs to target.
   * @returns
   */
  in(color: ColorType | boolean = true, lightID?: LightID) {
    this.value = typeof color === "boolean" && color
      ? EventAction.BLUE_IN
      : EventAction.RED_IN;
    if (typeof color !== "boolean") this.color = color;
    if (lightID !== undefined) this.lightID = lightID;
    return this;
  }

  /** The lightIDs to target. */
  lightID?: LightID;
  /** The color of the event. */
  color?: ColorType;
  /** The easing for transition events. Goes on start event. */
  easing?: EASE;
  /** The color interpolation for transition events. Goes on start event. */
  lerpType?: "RGB" | "HSV";

  toJson(v3: true): bsmap.v3.IBasicEventLight;
  toJson(v3: false): bsmap.v2.IEventLight;
  toJson(v3: boolean): bsmap.v3.IBasicEventLight | bsmap.v2.IEventLight {
    // TODO: Fix any
    if (v3) {
      return {
        b: this.time,
        et: this.type as any,
        f: this.floatValue,
        i: this.value,
        customData: {
          color: this.color,
          easing: this.easing,
          lerpType: this.lerpType,
          lightID: this.lightID,
          ...this.customData,
        },
      } satisfies bsmap.v3.IBasicEventLight;
    } else {
      return {
        _floatValue: this.floatValue,
        _time: this.time,
        _type: this.type as any,
        _value: this.value,
        _customData: {
          _color: this.color,
          _easing: this.easing,
          _lerpType: this.lerpType,
          _lightID: this.lightID,
          ...this.customData,
        },
      } satisfies bsmap.v2.IEventLight;
    }
  }
}

// new LightEvent(1, 2100, 30)
// new LightEvent(1, 3, 3)
// new LightEvent({
//   time: 0,
//   type: 2,
//   value: 3,
//   floatValue: 4,
//   customData: {}
// })

export class LaserSpeedEvent
  extends BaseEvent<bsmap.v2.IEventLaser, bsmap.v3.IBasicEventLaserRotation> {
  /**
   * Controls rotating laser speed.
   * @param json Json to import.
   * @param type Type of the event.
   * @param speed Speed of the rotating lasers.
   * @param direction Direction of the rotating lasers.
   * @param lockRotation Whether the existing rotation should be kept.
   */
  constructor(obj: LightFields<LaserSpeedEvent>) {
    super(obj);
  }

  /** Whether the existing rotation should be kept. */
  lockRotation?: boolean;
  /** Speed of the rotating lasers. */
  speed?: number;
  /** Direction of the rotating lasers. */
  direction?: number;

  toJson(v3: true): bsmap.v3.IBasicEventLaserRotation;
  toJson(v3: false): bsmap.v2.IEventLaser;
  toJson(
    v3: boolean,
  ): bsmap.v2.IEventLaser | bsmap.v3.IBasicEventLaserRotation {
    if (v3) {
      return {
        b: this.time,
        et: this.type as any,
        f: this.floatValue,
        i: this.value,
        customData: {
          direction: this.direction,
          lockRotation: this.lockRotation,
          speed: this.speed,
          ...this.customData,
        },
      } satisfies bsmap.v3.IBasicEventLaserRotation;
    } else {
      return {
        _floatValue: this.floatValue,
        _time: this.time,
        _type: this.type as any,
        _value: this.value,
        _customData: {
          _direction: this.direction,
          _lockPosition: this.lockRotation,
          _preciseSpeed: this.speed,
          _speed: this.speed,
          ...this.customData,
        },
      } satisfies bsmap.v2.IEventLaser;
    }
  }
}

export class RingZoomEvent
  extends BaseEvent<bsmap.v2.IEventZoom, bsmap.v3.IBasicEventRing> {
  /**
   * Controls ring zoom.
   * @param json Json to import.
   * @param step The position offset between each ring.
   * @param speed The speed of the zoom.
   */
  constructor(obj: Omit<LightFields<RingZoomEvent>, "type">) {
    super({
      ...obj,
      type: EventGroup.RING_ZOOM,
    });
  }

  step?: number;
  speed?: number;

  toJson(v3: true): bsmap.v3.IBasicEventRing;
  toJson(v3: false): bsmap.v2.IEventZoom;
  toJson(v3: boolean): bsmap.v2.IEventZoom | bsmap.v3.IBasicEventRing {
    if (v3) {
      return {
        b: this.time,
        et: this.type as any,
        f: this.floatValue,
        i: this.value,
        customData: {
          speed: this.speed,
          step: this.step,
          ...this.customData,
        },
      } satisfies bsmap.v3.IBasicEventRing;
    }
    return {
      _floatValue: this.floatValue,
      _time: this.time,
      // deno-lint-ignore no-explicit-any
      _type: this.type as any,
      _value: this.value,
      _customData: {
        _speed: this.speed,
        _step: this.step,
        ...this.customData,
      },
    } satisfies bsmap.v2.IEventZoom;
  }
}

export class RingSpinEvent
  extends BaseEvent<bsmap.v2.IEventRing, bsmap.v3.IBasicEventRing> {
  /**
   * Controls spinning the rings.
   * @param json Json to import.
   * @param rotation Degrees of the spin.
   * @param direction Direction of the spin. 1 is clockwise, 0 is counterclockwise.
   * @param step The angle between each ring.
   * @param speed The speed multiplier of the spin.
   * @param prop The rate at which physics propogate through the rings.
   * High values will cause rings to move simultneously, low values gives them significant delay.
   * @param nameFilter The ring object name to target.
   */
  constructor(obj: Omit<LightFields<RingSpinEvent>, "type">) {
    super({
      ...obj,
      type: EventGroup.RING_SPIN,
    });
    this.type = EventGroup.RING_SPIN;
  }

  /** The speed multiplier of the spin. */

  speed?: number;
  /** Direction of the spin. 1 is clockwise, 0 is counterclockwise. */

  direction?: 0 | 1;
  /** The ring object name to target. */
  nameFilter?: string;
  /** Degrees of the spin. */
  rotation?: number;
  /** The angle between each ring. */
  step?: number;
  /** The rate at which physics propogate through the rings.
   * High values will cause rings to move simultneously, low values gives them significant delay.
   */
  prop?: number;

  toJson(v3: true): bsmap.v3.IBasicEventRing;
  toJson(v3: false): bsmap.v2.IEventRing;
  toJson(v3: boolean): bsmap.v2.IEventRing | bsmap.v3.IBasicEventRing {
    if (v3) {
      return {
        b: this.time,
        et: EventGroup.RING_SPIN,
        f: this.floatValue,
        i: this.value,
        customData: {
          direction: this.direction,
          nameFilter: this.nameFilter,
          prop: this.prop,
          rotation: this.rotation,
          speed: this.speed,
          step: this.step,
        },
      } satisfies bsmap.v3.IBasicEventRing;
    }

    return {
      _floatValue: this.floatValue,
      _time: this.time,
      _type: EventGroup.RING_SPIN,
      _value: this.value,
      _customData: {
        _direction: this.direction,
        _nameFilter: this.nameFilter,
        _prop: this.prop,
        _rotation: this.rotation,
        _speed: this.speed,
        _step: this.step,
        ...this.customData,
      },
    } satisfies bsmap.v2.IEventRing;
  }
}

export class RotationEvent extends BaseEvent<
  bsmap.v2.IEventLaneRotation,
  bsmap.v3.IBasicEventLaneRotation
> {
  /**
   * Event to spin the gameplay objects in the map.
   * The new rotation events should be used instead.
   * @param type Type of the event.
   * @param rotation The rotation of the event.
   * Must be a multiple of 15 between -60 and 60.
   */
  constructor(obj: LightFields<RotationEvent>) {
    super(obj);
  }

  toJson(v3: true): bsmap.v3.IBasicEventLaneRotation;
  toJson(v3: false): bsmap.v2.IEventLaneRotation;
  toJson(
    v3: boolean,
  ): bsmap.v2.IEventLaneRotation | bsmap.v3.IBasicEventLaneRotation {
    if (v3) {
      return {
        b: this.time,
        f: this.floatValue,
        i: this.value,
        et: this.type as any,
        customData: this.customData,
      } satisfies bsmap.v3.IBasicEventLaneRotation;
    }
    return {
      _time: this.time,
      _floatValue: this.floatValue,
      _type: this.type as any,
      _value: this.value,
      _customData: {
        _rotation: this.value,
      },
    } satisfies bsmap.v2.IEventLaneRotation;
  }
}

// TODO: Necessary?
// export class AbstractEvent extends BaseEvent<bsmap.v2.Ev {
//   /** Whether the existing rotation should be kept. */
//   get lockRotation() {
//     return jsonGet(this.json, "customData.lockRotation");
//   }
//   /** The lightIDs to target. */
//   get lightID() {
//     return jsonGet(this.json, "customData.lightID");
//   }
//   /** The color of the event. */
//   get color() {
//     return jsonGet(this.json, "customData.color");
//   }
//   /** The easing for transition events. Goes on start event. */
//   get easing() {
//     return jsonGet(this.json, "customData.easing");
//   }
//   /** The color interpolation for transition events. Goes on start event. */
//   get lerpType() {
//     return jsonGet(this.json, "customData.lerpType");
//   }
//   /** The speed of the event. Only for ring spins & zooms, and laser rotations. */
//   get speed() {
//     return jsonGet(this.json, "customData.speed");
//   }
//   /** Direction of the spin/lasers. Only for laser rotations and ring spins. */
//   get direction() {
//     return jsonGet(this.json, "customData.direction");
//   }
//   /** The ring object name to target. Only for ring spins. */
//   get nameFilter() {
//     return jsonGet(this.json, "customData.nameFilter");
//   }
//   /** Degrees of the spin. Only for ring spins. */
//   get rotation() {
//     return jsonGet(this.json, "customData.rotation");
//   }
//   /** The angle between each ring. Only for ring spins. */
//   get step() {
//     return jsonGet(this.json, "customData.step");
//   }
//   /** The rate at which physics propogate through the rings.
//    * High values will cause rings to move simultneously, low values gives them significant delay.
//    * Only for ring spins.
//    */
//   get prop() {
//     return jsonGet(this.json, "customData.prop");
//   }

//   set lockRotation(value: boolean) {
//     jsonSet(this.json, "customData.lockRotation", value);
//   }
//   set speed(value: number) {
//     jsonSet(this.json, "customData.speed", value);
//   }
//   set direction(value: number) {
//     jsonSet(this.json, "customData.direction", value);
//   }
//   set nameFilter(value: string) {
//     jsonSet(this.json, "customData.nameFilter", value);
//   }
//   set rotation(value: number) {
//     jsonSet(this.json, "customData.rotation", value);
//   }
//   set step(value: number) {
//     jsonSet(this.json, "customData.step", value);
//   }
//   set prop(value: number) {
//     jsonSet(this.json, "customData.prop", value);
//   }
//   set lightID(value: LightID) {
//     jsonSet(this.json, "customData.lightID", value);
//   }
//   set color(value: ColorType) {
//     jsonSet(this.json, "customData.color", value);
//   }
//   set easing(value: EASE) {
//     jsonSet(this.json, "customData.easing", value);
//   }
//   set lerpType(value: string) {
//     jsonSet(this.json, "customData.lerpType", value);
//   }
// }
