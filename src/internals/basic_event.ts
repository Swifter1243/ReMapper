import { EventAction, EventGroup } from '../data/constants.ts'
import { bsmap } from '../deps.ts'
import { EASE } from '../types/animation_types.ts'
import { BaseObject } from './object.ts'
import { getActiveDiff } from '../data/beatmap_handler.ts'
import {
    Fields,
    SubclassExclusiveProps,
} from '../types/util_types.ts'
import { LightID } from '../types/environment_types.ts'
import { ColorVec } from '../types/data_types.ts'
import { copy } from '../utils/general.ts'

export abstract class BaseEvent<
    TV2 extends bsmap.v2.IEvent = bsmap.v2.IEvent,
    TV3 extends bsmap.v3.IBasicEvent = bsmap.v3.IBasicEvent,
> extends BaseObject<TV2, TV3> {
    /** The bare minimum event. */

    constructor(obj: Partial<Fields<BaseEvent<TV2, TV3>>>) {
        super(obj)
        this.type = obj.type ?? 0
        this.value = obj.value ?? 0
        this.floatValue = obj.floatValue ?? 1
    }

    /** Push this event to the difficulty
     * @param clone Whether this object will be copied before being pushed.
     */
    abstract push(clone: boolean): BaseEvent<TV2, TV3>

    /** The type of the event. */
    type: number
    /** The value of the event. */
    value: number
    /** The value of the event, but allowing decimals. */
    floatValue: number

    fromJson(json: TV3, v3: true): this
    fromJson(json: TV2, v3: false): this
    fromJson(
        json: TV3 | TV2,
        v3: boolean,
    ): this {
        // TODO: Implement custom data

        type Params = SubclassExclusiveProps<
            BaseEvent,
            BaseObject<TV2, TV3>
        >

        if (v3) {
            const obj = json as TV3

            const params = {
                type: obj.et,
                floatValue: obj.f,
                value: obj.i,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, true)
        } else {
            const obj = json as TV2

            const params = {
                type: obj._type,
                floatValue: obj._floatValue,
                value: obj._value,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, false)
        }
    }
}

export class BaseBasicEvent extends BaseEvent {
    push(
        clone: boolean,
    ) {
        getActiveDiff().baseBasicEvents.push(clone ? copy(this) : this)
        return this
    }

    toJson(v3: true): bsmap.v3.IBasicEvent
    toJson(v3: false): bsmap.v2.IEvent
    toJson(v3 = true): bsmap.v2.IEvent | bsmap.v3.IBasicEvent {
        if (v3) {
            return {
                b: this.time,
                et: this.type,
                f: this.floatValue,
                i: this.value,
                customData: this.customData,
            } satisfies bsmap.v3.IBasicEvent
        } else {
            return {
                _floatValue: this.floatValue,
                _time: this.time,
                _type: this.type,
                _value: this.value,
                _customData: this.customData,
            } satisfies bsmap.v2.IEvent
        }
    }
}

export class LightEvent<
    TV2 extends bsmap.v2.IEventLight = bsmap.v2.IEventLight,
    TV3 extends bsmap.v3.IBasicEventLight = bsmap.v3.IBasicEventLight,
> extends BaseEvent<TV2, TV3> {
    /** Create an event that turns lights off
     * @param lightID The lightIDs to target.
     */
    off(lightID?: LightID) {
        this.value = EventAction.OFF
        if (lightID) this.lightID = lightID
        return this
    }

    /**
     * Create an event that turns lights on.
     * @param color Can be boolean to determine if the light is blue (true), or a color.
     * @param lightID The lightIDs to target.
     */
    on(color: ColorVec | boolean = true, lightID?: LightID) {
        this.value = typeof color === 'boolean' && color
            ? EventAction.BLUE_ON
            : EventAction.RED_ON
        if (typeof color !== 'boolean') this.color = color
        if (lightID) this.lightID = lightID
        return this
    }

    /**
     * Create an event that flashes the lights.
     * @param color Can be boolean to determine if the light is blue (true), or a color.
     * @param lightID The lightIDs to target.
     */
    flash(color: ColorVec | boolean = true, lightID?: LightID) {
        this.value = typeof color === 'boolean' && color
            ? EventAction.BLUE_FLASH
            : EventAction.RED_FLASH
        if (typeof color !== 'boolean') this.color = color
        if (lightID) this.lightID = lightID
        return this
    }

    /**
     * Create an event that fades the lights out.
     * @param color Can be boolean to determine if the light is blue (true), or a color.
     * @param lightID The lightIDs to target.
     */
    fade(color: ColorVec | boolean = true, lightID?: LightID) {
        this.value = typeof color === 'boolean' && color
            ? EventAction.BLUE_FADE
            : EventAction.RED_FADE
        if (typeof color !== 'boolean') this.color = color
        if (lightID) this.lightID = lightID
        return this
    }

    /**
     * Create an event that makes the lights fade in to this color from the previous.
     * @param color Can be boolean to determine if the light is blue (true), or a color.
     * @param lightID The lightIDs to target.
     * @returns
     */
    in(color: ColorVec | boolean = true, lightID?: LightID) {
        this.value = typeof color === 'boolean' && color
            ? EventAction.BLUE_IN
            : EventAction.RED_IN
        if (typeof color !== 'boolean') this.color = color
        if (lightID !== undefined) this.lightID = lightID
        return this
    }

    /** The lightIDs to target. */
    lightID?: LightID
    /** The color of the event. */
    color?: ColorVec
    /** The easing for transition events. Goes on start event. */
    easing?: EASE
    /** The color interpolation for transition events. Goes on start event. */
    lerpType?: 'RGB' | 'HSV'

    push(
        clone = true,
    ): LightEvent<TV2, TV3> {
        getActiveDiff().lightEvents.push(clone ? copy(this) : this)
        return this
    }

    fromJson(json: TV3, v3: true): this
    fromJson(json: TV2, v3: false): this
    fromJson(json: TV2 | TV3, v3: boolean): this {
        type Params = Fields<
            SubclassExclusiveProps<
                LightEvent,
                BaseEvent
            >
        >

        if (v3) {
            const obj = json as TV3

            const params = {
                color: obj.customData?.color,
                easing: obj.customData?.easing,
                lerpType: obj.customData?.lerpType,
                lightID: obj.customData?.lightID,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, true)
        } else {
            const obj = json as TV2

            const params = {
                color: obj._customData?._color,
                easing: obj._customData?._easing,
                lerpType: obj._customData?._lerpType,
                lightID: obj._customData?._lightID,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, false)
        }
    }

    toJson(v3: true): TV3
    toJson(v3: false): TV2
    toJson(v3 = true): bsmap.v3.IBasicEventLight | bsmap.v2.IEventLight {
        if (v3) {
            return {
                b: this.time,
                et: this.type as bsmap.v3.IBasicEventLight['et'],
                f: this.floatValue,
                i: this.value,
                customData: {
                    color: this.color,
                    easing: this.easing,
                    lerpType: this.lerpType,
                    lightID: this.lightID,
                    ...this.customData,
                },
            } satisfies bsmap.v3.IBasicEventLight
        } else {
            return {
                _floatValue: this.floatValue,
                _time: this.time,
                _type: this.type as bsmap.v2.IEventLight['_type'],
                _value: this.value,
                _customData: {
                    _color: this.color,
                    _easing: this.easing,
                    _lerpType: this.lerpType,
                    _lightID: this.lightID,
                    ...this.customData,
                },
            } satisfies bsmap.v2.IEventLight
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

export class LaserSpeedEvent<
    TV2 extends bsmap.v2.IEventLaser = bsmap.v2.IEventLaser,
    TV3 extends bsmap.v3.IBasicEventLaserRotation =
        bsmap.v3.IBasicEventLaserRotation,
> extends BaseEvent<TV2, TV3> {
    /**
     * Controls rotating laser speed.
     * @param json Json to import.
     * @param type Type of the event.
     * @param speed Speed of the rotating lasers.
     * @param direction Direction of the rotating lasers.
     * @param lockRotation Whether the existing rotation should be kept.
     */
    constructor(obj: Partial<Fields<LaserSpeedEvent<TV2, TV3>>>) {
        super(obj)
        this.lockRotation = obj.lockRotation,
            this.speed = obj.speed,
            this.direction = obj.direction
    }

    /** Whether the existing rotation should be kept. */
    lockRotation?: boolean
    /** Speed of the rotating lasers. */
    speed?: number
    /** Direction of the rotating lasers. */
    direction?: number

    push(
        clone = true,
    ): LaserSpeedEvent<TV2, TV3> {
        getActiveDiff().laserSpeedEvents.push(clone ? copy(this) : this)
        return this
    }

    fromJson(json: TV3, v3: true): this
    fromJson(json: TV2, v3: false): this
    fromJson(json: TV2 | TV3, v3: boolean): this {
        type Params = Fields<
            SubclassExclusiveProps<
                LaserSpeedEvent,
                BaseEvent
            >
        >

        if (v3) {
            const obj = json as TV3

            const params = {
                direction: obj.customData?.direction,
                lockRotation: obj.customData?.lockRotation,
                speed: obj.customData?.speed,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, true)
        } else {
            const obj = json as TV2

            const params = {
                direction: obj._customData?._direction,
                lockRotation: obj._customData?._lockPosition,
                speed: obj._customData?._preciseSpeed,
                // TODO: Confirm if this is correct?
                // _preciseSpeed vs _speed
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, false)
        }
    }

    toJson(v3: true): TV3
    toJson(v3: false): TV2
    toJson(
        v3: boolean,
    ): bsmap.v2.IEventLaser | bsmap.v3.IBasicEventLaserRotation {
        if (v3) {
            return {
                b: this.time,
                et: this.type as bsmap.v3.IBasicEventLaserRotation['et'],
                f: this.floatValue,
                i: this.value,
                customData: {
                    direction: this.direction,
                    lockRotation: this.lockRotation,
                    speed: this.speed,
                    ...this.customData,
                },
            } satisfies bsmap.v3.IBasicEventLaserRotation
        } else {
            return {
                _floatValue: this.floatValue,
                _time: this.time,
                _type: this.type as bsmap.v2.IEventLaser['_type'],
                _value: this.value,
                _customData: {
                    _direction: this.direction,
                    _lockPosition: this.lockRotation,
                    _preciseSpeed: this.speed,
                    _speed: this.speed,
                    ...this.customData,
                },
            } satisfies bsmap.v2.IEventLaser
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
    constructor(obj: Partial<Omit<Fields<RingZoomEvent>, 'type'>>) {
        super({
            ...obj,
            type: EventGroup.RING_ZOOM,
        })
        this.step = obj.step
        this.speed = obj.speed
    }

    step?: number
    speed?: number

    push(
        clone = true,
    ): RingZoomEvent {
        getActiveDiff().ringZoomEvents.push(clone ? copy(this) : this)
        return this
    }

    fromJson(json: bsmap.v3.IBasicEventRing, v3: true): this
    fromJson(json: bsmap.v2.IEventZoom, v3: false): this
    fromJson(
        json: bsmap.v2.IEventZoom | bsmap.v3.IBasicEventRing,
        v3: boolean,
    ): this {
        type Params = Fields<
            SubclassExclusiveProps<
                RingZoomEvent,
                BaseEvent
            >
        >

        if (v3) {
            const obj = json as bsmap.v3.IBasicEventRing

            const params = {
                speed: obj.customData?.speed,
                step: obj.customData?.step,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, true)
        } else {
            const obj = json as bsmap.v2.IEventZoom

            const params = {
                speed: obj._customData?._speed,
                step: obj._customData?._step,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, false)
        }
    }

    toJson(v3: true): bsmap.v3.IBasicEventRing
    toJson(v3: false): bsmap.v2.IEventZoom
    toJson(v3 = true): bsmap.v2.IEventZoom | bsmap.v3.IBasicEventRing {
        if (v3) {
            return {
                b: this.time,
                et: this.type as bsmap.v3.IBasicEventRing['et'],
                f: this.floatValue,
                i: this.value,
                customData: {
                    speed: this.speed,
                    step: this.step,
                    ...this.customData,
                },
            } satisfies bsmap.v3.IBasicEventRing
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
        } satisfies bsmap.v2.IEventZoom
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
    constructor(obj: Partial<Omit<Fields<RingSpinEvent>, 'type'>>) {
        super({
            ...obj,
            type: EventGroup.RING_SPIN,
        })
        this.type = EventGroup.RING_SPIN
        this.speed = obj.speed
        this.direction = obj.direction
        this.nameFilter = obj.nameFilter
        this.rotation = obj.rotation
        this.step = obj.step
    }

    /** The speed multiplier of the spin. */

    speed?: number
    /** Direction of the spin. 1 is clockwise, 0 is counterclockwise. */

    direction?: 0 | 1
    /** The ring object name to target. */
    nameFilter?: string
    /** Degrees of the spin. */
    rotation?: number
    /** The angle between each ring. */
    step?: number
    /** The rate at which physics propogate through the rings.
     * High values will cause rings to move simultneously, low values gives them significant delay.
     */
    prop?: number

    push(
        clone = true,
    ): RingSpinEvent {
        getActiveDiff().ringSpinEvents.push(clone ? copy(this) : this)
        return this
    }

    fromJson(json: bsmap.v3.IBasicEventRing, v3: true): this
    fromJson(json: bsmap.v2.IEventRing, v3: false): this
    fromJson(
        json: bsmap.v3.IBasicEventRing | bsmap.v2.IEventRing,
        v3: boolean,
    ): this {
        // TODO: Implement custom data

        type Params = SubclassExclusiveProps<
            RingSpinEvent,
            BaseEvent
        >

        if (v3) {
            const obj = json as bsmap.v3.IBasicEventRing

            const params = {
                direction: obj.customData?.direction,
                nameFilter: obj.customData?.nameFilter,
                prop: obj.customData?.prop,
                rotation: obj.customData?.rotation,
                speed: obj.customData?.speed,
                step: obj.customData?.step,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, true)
        } else {
            const obj = json as bsmap.v2.IEventRing

            const params = {
                direction: obj._customData?._direction,
                nameFilter: obj._customData?._nameFilter,
                prop: obj._customData?._prop,
                rotation: obj._customData?._rotation,
                speed: obj._customData?._speed,
                step: obj._customData?._step,
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, false)
        }
    }

    toJson(v3: true): bsmap.v3.IBasicEventRing
    toJson(v3: false): bsmap.v2.IEventRing
    toJson(v3 = true): bsmap.v2.IEventRing | bsmap.v3.IBasicEventRing {
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
            } satisfies bsmap.v3.IBasicEventRing
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
        } satisfies bsmap.v2.IEventRing
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
