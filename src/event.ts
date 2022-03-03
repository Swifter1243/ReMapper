import * as general from './general';
import * as beatmap from './beatmap';
import { EVENT } from './constants';
import { activeDiff } from './beatmap';
import { copy } from './general';
import { jsonPrune } from './general';
import { isEmptyObject } from './general';


export namespace EventInternals {
    export class BaseEvent {
        json: any = {
            _time: 0,
            _type: 0,
            _value: 0
        };

        constructor(time: number | object) {
            if (typeof time === "object") {
                this.json = time;
                return;
            }
            this.time = time;
        }

        /**
        * Push this event to the difficulty
        */
        push() {
            activeDiff.events.push(general.copy(this));
            return this;
        }

        get time() { return this.json._time };
        get type() { return this.json._type };
        get value() { return this.json._value };
        get floatValue() { return this.json._floatValue };
        get customData() { return general.jsonGet(this.json, "_customData") };

        set time(value: number) { this.json._time = value };
        set type(value: number) { this.json._type = value };
        set value(value: number) { this.json._value = value };
        set floatValue(value: number) { this.json._floatValue = value };
        set customData(value) { general.jsonSet(this.json, "_customData", value) };

        get isModded() {
            if (this.customData === undefined) return false;
            let customData = copy(this.customData);
            jsonPrune(customData);
            return !isEmptyObject(customData);
        }
    }

    export class LightEvent extends EventInternals.BaseEvent {
        constructor(json: object, type: EVENT) {
            super(json);
            this.type = type;
        }
    
        off() {
            this.value = EVENT.OFF;
            return this;
        }
    
        on(color: number[] | boolean, lightID: number | number[] = undefined) {
            this.value = (typeof color === "boolean" && color) ? EVENT.BLUE_ON : EVENT.RED_ON;
            if (typeof color !== "boolean") this.color = color;
            if (lightID !== undefined) this.lightID = lightID;
            return this;
        }
    
        flash(color: number[] | boolean, lightID: number | number[] = undefined) {
            this.value = (typeof color === "boolean" && color) ? EVENT.BLUE_FLASH : EVENT.RED_FLASH;
            if (typeof color !== "boolean") this.color = color;
            if (lightID !== undefined) this.lightID = lightID;
            return this;
        }
    
        fade(color: number[] | boolean, lightID: number | number[] = undefined) {
            this.value = (typeof color === "boolean" && color) ? EVENT.BLUE_FADE : EVENT.RED_FADE;
            if (typeof color !== "boolean") this.color = color;
            if (lightID !== undefined) this.lightID = lightID;
            return this;
        }
    
        in(color: number[] | boolean, lightID: number | number[] = undefined) {
            this.value = (typeof color === "boolean" && color) ? EVENT.BLUE_IN : EVENT.RED_IN;
            if (typeof color !== "boolean") this.color = color;
            if (lightID !== undefined) this.lightID = lightID;
            return this;
        }
    
        gradient(startColor: number[], endColor: number[], duration: number, easing: string = undefined) {
            this.startColor = startColor;
            this.endColor = endColor;
            this.duration = duration;
            this.value = 1;
            if (easing !== undefined) this.gradientEasing = easing;
            return this;
        }
    
        /**
        * Remove the subclass of the event, giving access to all properties, but can allow for invalid data.
        * @returns {AbstractEvent}
        */
        abstract() { return new Event().import(this.json) };
    
        get lightID() { return general.jsonGet(this.json, "_customData._lightID") };
        get color() { return general.jsonGet(this.json, "_customData._color") };
        get easing() { return general.jsonGet(this.json, "_customData._easing") };
        get lerpType() { return general.jsonGet(this.json, "_customData._lerpType") };
        get lightGradient() { return general.jsonGet(this.json, "_customData._lightGradient") };
        get startColor() { return general.jsonGet(this.json, "_customData._lightGradient._startColor") };
        get endColor() { return general.jsonGet(this.json, "_customData._lightGradient._endColor") };
        get duration() { return general.jsonGet(this.json, "_customData._lightGradient._duration") };
        get gradientEasing() { return general.jsonGet(this.json, "_customData._lightGradient._easing") };
    
        set lightID(value: number | number[]) { general.jsonSet(this.json, "_customData._lightID", value) };
        set color(value: number[]) { general.jsonSet(this.json, "_customData._color", value) };
        set easing(value: string) { general.jsonSet(this.json, "_customData._easing", value) };
        set lerpType(value: string) { general.jsonSet(this.json, "_customData._lerpType", value) };
        set lightGradient(value) { general.jsonSet(this.json, "_customData._lightGradient", value) };
        set startColor(value: number[]) { general.jsonSet(this.json, "_customData._lightGradient._startColor", value) };
        set endColor(value: number[]) { general.jsonSet(this.json, "_customData._lightGradient._endColor", value) };
        set duration(value: number) { general.jsonSet(this.json, "_customData._lightGradient._duration", value) };
        set gradientEasing(value: string) { general.jsonSet(this.json, "_customData._lightGradient._easing", value) };
    }
    
    export class LaserSpeedEvent extends EventInternals.BaseEvent {
        constructor(json: object, type: EVENT, speed: number, direction: number = undefined, lockPosition: boolean = undefined) {
            super(json);
            this.type = type;
    
            if (speed % 1 === 0) this.value = speed;
            else this.speed = speed;
            if (direction !== undefined) this.direction = direction;
            if (lockPosition !== undefined) this.lockPosition = lockPosition;
        }
    
        /**
        * Remove the subclass of the event, giving access to all properties, but can allow for invalid data.
        * @returns {AbstractEvent}
        */
        abstract() { return new Event().import(this.json) };
    
        get lockPosition() { return general.jsonGet(this.json, "_customData._lockPosition") };
        get speed() { return general.jsonGet(this.json, "_customData._speed") };
        get direction() { return general.jsonGet(this.json, "_customData._direction") };
    
        set lockPosition(value: boolean) { general.jsonSet(this.json, "_customData._lockPosition", value) };
        set speed(value: number) { general.jsonSet(this.json, "_customData._speed", value) };
        set direction(value: number) { general.jsonSet(this.json, "_customData._direction", value) };
    }
    
    export class RingZoomEvent extends EventInternals.BaseEvent {
        constructor(json: object, step: number = undefined, speed: number = undefined) {
            super(json);
            this.type = EVENT.RING_ZOOM;
    
            if (step !== undefined) this.step = step;
            if (speed !== undefined) this.speed = speed;
        }
    
        /**
        * Remove the subclass of the event, giving access to all properties, but can allow for invalid data.
        * @returns {AbstractEvent}
        */
        abstract() { return new Event().import(this.json) };
    
        get step() { return general.jsonGet(this.json, "_customData._step") };
        get speed() { return general.jsonGet(this.json, "_customData._speed") };
    
        set step(value: number) { general.jsonSet(this.json, "_customData._step", value) };
        set speed(value: number) { general.jsonSet(this.json, "_customData._speed", value) };
    }
    
    export class RingSpinEvent extends EventInternals.BaseEvent {
        constructor(json: object, rotation: number = undefined, direction: number = undefined, step: number = undefined, speed: number = undefined, prop: number = undefined, reset: boolean = undefined, nameFilter: string = undefined, counterSpin: boolean = undefined) {
            super(json);
            this.type = EVENT.RING_SPIN;
    
            if (rotation !== undefined) this.rotation = rotation;
            if (direction !== undefined) this.direction = direction;
            if (step !== undefined) this.step = step;
            if (speed !== undefined) this.speed = speed;
            if (prop !== undefined) this.prop = prop;
            if (reset !== undefined) this.reset = reset;
            if (nameFilter !== undefined) this.nameFilter = nameFilter;
            if (counterSpin !== undefined) this.counterSpin = counterSpin;
        }
    
        /**
        * Remove the subclass of the event, giving access to all properties, but can allow for invalid data.
        * @returns {AbstractEvent}
        */
        abstract() { return new Event().import(this.json) };
    
        get speed() { return general.jsonGet(this.json, "_customData._speed") };
        get direction() { return general.jsonGet(this.json, "_customData._direction") };
        get nameFilter() { return general.jsonGet(this.json, "_customData._nameFilter") };
        get reset() { return general.jsonGet(this.json, "_customData._reset") };
        get rotation() { return general.jsonGet(this.json, "_customData._rotation") };
        get step() { return general.jsonGet(this.json, "_customData._step") };
        get prop() { return general.jsonGet(this.json, "_customData._prop") };
        get counterSpin() { return general.jsonGet(this.json, "_customData._counterSpin") };
    
        set speed(value: number) { general.jsonSet(this.json, "_customData._speed", value) };
        set direction(value: number) { general.jsonSet(this.json, "_customData._direction", value) };
        set nameFilter(value: string) { general.jsonSet(this.json, "_customData._nameFilter", value) };
        set reset(value: boolean) { general.jsonSet(this.json, "_customData._reset", value) };
        set rotation(value: number) { general.jsonSet(this.json, "_customData._rotation", value) };
        set step(value: number) { general.jsonSet(this.json, "_customData._step", value) };
        set prop(value: number) { general.jsonSet(this.json, "_customData._prop", value) };
        set counterSpin(value: boolean) { general.jsonSet(this.json, "_customData._counterSpin", value) };
    }
    
    export class RotationEvent extends EventInternals.BaseEvent {
        constructor(json: object, type: EVENT, rotation: number = undefined) {
            super(json);
            this.type = type;
    
            if (EVENT[`CW_${Math.abs(rotation)}`]) this.value = EVENT[`${(rotation < 0 ? "CCW_" : "CW_") + Math.abs(rotation)}`];
            else this.rotation = rotation;
        }
    
        /**
        * Remove the subclass of the event, giving access to all properties, but can allow for invalid data.
        * @returns {AbstractEvent}
        */
        abstract() { return new Event().import(this.json) };
    
        get rotation() { return general.jsonGet(this.json, "_customData._rotation") };
        set rotation(value) { general.jsonSet(this.json, "_customData._rotation", value) };
    }
    
    export class AbstractEvent extends EventInternals.BaseEvent {
        get lockPosition() { return general.jsonGet(this.json, "_customData._lockPosition") };
        get lightID() { return general.jsonGet(this.json, "_customData._lightID") };
        get color() { return general.jsonGet(this.json, "_customData._color") };
        get easing() { return general.jsonGet(this.json, "_customData._easing") };
        get lerpType() { return general.jsonGet(this.json, "_customData._lerpType") };
        get lightGradient() { return general.jsonGet(this.json, "_customData._lightGradient") };
        get startColor() { return general.jsonGet(this.json, "_customData._lightGradient._startColor") };
        get endColor() { return general.jsonGet(this.json, "_customData._lightGradient._endColor") };
        get duration() { return general.jsonGet(this.json, "_customData._lightGradient._duration") };
        get gradientEasing() { return general.jsonGet(this.json, "_customData._lightGradient._easing") };
        get speed() { return general.jsonGet(this.json, "_customData._speed") };
        get direction() { return general.jsonGet(this.json, "_customData._direction") };
        get nameFilter() { return general.jsonGet(this.json, "_customData._nameFilter") };
        get reset() { return general.jsonGet(this.json, "_customData._reset") };
        get rotation() { return general.jsonGet(this.json, "_customData._rotation") };
        get step() { return general.jsonGet(this.json, "_customData._step") };
        get prop() { return general.jsonGet(this.json, "_customData._prop") };
        get counterSpin() { return general.jsonGet(this.json, "_customData._counterSpin") };
    
        set lockPosition(value: boolean) { general.jsonSet(this.json, "_customData._lockPosition", value) };
        set speed(value: number) { general.jsonSet(this.json, "_customData._speed", value) };
        set direction(value: number) { general.jsonSet(this.json, "_customData._direction", value) };
        set nameFilter(value: string) { general.jsonSet(this.json, "_customData._nameFilter", value) };
        set reset(value: boolean) { general.jsonSet(this.json, "_customData._reset", value) };
        set rotation(value: number) { general.jsonSet(this.json, "_customData._rotation", value) };
        set step(value: number) { general.jsonSet(this.json, "_customData._step", value) };
        set prop(value: number) { general.jsonSet(this.json, "_customData._prop", value) };
        set counterSpin(value: boolean) { general.jsonSet(this.json, "_customData._counterSpin", value) };
        set lightID(value: number | number[]) { general.jsonSet(this.json, "_customData._lightID", value) };
        set color(value: number[]) { general.jsonSet(this.json, "_customData._color", value) };
        set easing(value: string) { general.jsonSet(this.json, "_customData._easing", value) };
        set lerpType(value: string) { general.jsonSet(this.json, "_customData._lerpType", value) };
        set lightGradient(value) { general.jsonSet(this.json, "_customData._lightGradient", value) };
        set startColor(value: number[]) { general.jsonSet(this.json, "_customData._lightGradient._startColor", value) };
        set endColor(value: number[]) { general.jsonSet(this.json, "_customData._lightGradient._endColor", value) };
        set duration(value: number) { general.jsonSet(this.json, "_customData._lightGradient._duration", value) };
        set gradientEasing(value: string) { general.jsonSet(this.json, "_customData._lightGradient._easing", value) };
    }
}

export class Event extends EventInternals.BaseEvent {
    /**
     * Event object for ease of creation.
     * @param {Object} time
     */
    constructor(time: number = 0) { super(time) }

    backLasers() { return new EventInternals.LightEvent(this.json, EVENT.BACK_LASERS) }
    ringLights() { return new EventInternals.LightEvent(this.json, EVENT.RING_LIGHTS) }
    leftLasers() { return new EventInternals.LightEvent(this.json, EVENT.LEFT_LASERS) }
    rightLasers() { return new EventInternals.LightEvent(this.json, EVENT.RIGHT_LASERS) }
    centerLasers() { return new EventInternals.LightEvent(this.json, EVENT.CENTER_LASERS) }
    extraLeft() { return new EventInternals.LightEvent(this.json, EVENT.LEFT_EXTRA) }
    extraRight() { return new EventInternals.LightEvent(this.json, EVENT.RIGHT_EXTRA) }
    billieLeft() { return new EventInternals.LightEvent(this.json, EVENT.BILLIE_LEFT) }
    billieRight() { return new EventInternals.LightEvent(this.json, EVENT.BILLIE_RIGHT) }

    /**
     * Create an event using JSON.
     * @param {Object} json 
     * @returns {AbstractEvent}
     */
    import(json: object) { return new EventInternals.AbstractEvent(json) }

    /**
     * Create an event with no particular identity.
    * @returns {AbstractEvent};
    */
    abstract() { return this.import({}) };

    boost(on: boolean) {
        this.type = EVENT.BOOST;
        this.value = on ? EVENT.BOOST_ON : EVENT.BOOST_OFF;
        return new EventInternals.BaseEvent(this.json);
    }

    moveCars(value: number) {
        this.type = EVENT.RING_SPIN;
        this.value = value;
        return new EventInternals.BaseEvent(this.json);
    }

    lowerHydraulics() {
        this.type = EVENT.LOWER_HYDRAULICS;
        return new EventInternals.BaseEvent(this.json);
    }

    raiseHydraulics() {
        this.type = EVENT.RAISE_HYDRAULICS;
        return new EventInternals.BaseEvent(this.json);
    }

    ringSpin(
        rotation: number = undefined,
        direction: number = undefined,
        step: number = undefined,
        speed: number = undefined,
        prop: number = undefined,
        reset: boolean = undefined,
        nameFilter: string = undefined,
        counterSpin: boolean = undefined) {
        return new EventInternals.RingSpinEvent(this.json, rotation, direction, step, speed, prop, reset, nameFilter, counterSpin);
    }

    ringZoom(step: number = undefined, speed: number = undefined) { return new EventInternals.RingZoomEvent(this.json, step, speed) }

    leftLaserSpeed(speed: number, direction: number = undefined, lockPosition: boolean = undefined) {
        return new EventInternals.LaserSpeedEvent(this.json, EVENT.LEFT_SPEED, speed, direction, lockPosition);
    }

    rightLaserSpeed(speed: number, direction: number = undefined, lockPosition: boolean = undefined) {
        return new EventInternals.LaserSpeedEvent(this.json, EVENT.RIGHT_SPEED, speed, direction, lockPosition);
    }

    earlyRotation(rotation: number) { return new EventInternals.RotationEvent(this.json, EVENT.EARLY_ROTATION, rotation) }
    lateRotation(rotation: number) { return new EventInternals.RotationEvent(this.json, EVENT.LATE_ROTATION, rotation) }
}