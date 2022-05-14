import { EASE, EVENT } from './constants';
import { activeDiff } from './beatmap';
import { copy, jsonPrune, isEmptyObject, jsonGet, jsonSet, ColorType } from './general';

export namespace EventInternals {
    export class BaseEvent {
        json: any = {
            _time: 0,
            _type: 0,
            _value: 0
        };

        constructor(time: number | object) {
            if (time instanceof Object) {
                this.json = time;
                return;
            }
            this.time = time;
        }

        /**
        * Push this event to the difficulty
        */
        push() {
            activeDiff.events.push(copy(this) as any);
            return this;
        }

        get time() { return this.json._time }
        get type() { return this.json._type }
        get value() { return this.json._value }
        get floatValue() { return this.json._floatValue }
        get customData() { return jsonGet(this.json, "_customData") }

        set time(value: number) { this.json._time = value }
        set type(value: number) { this.json._type = value }
        set value(value: number) { this.json._value = value }
        set floatValue(value: number) { this.json._floatValue = value }
        set customData(value) { jsonSet(this.json, "_customData", value) }

        get isModded() {
            if (this.customData === undefined) return false;
            const customData = copy(this.customData);
            jsonPrune(customData);
            return !isEmptyObject(customData);
        }
    }

    export class LightEvent extends EventInternals.BaseEvent {
        constructor(json: object, type: EVENT) {
            super(json);
            this.type = type;
        }
    
        /**
         * Create an event that turns lights off.
         * @returns 
         */
        off() {
            this.value = EVENT.OFF;
            return this;
        }
    
        /**
         * Create an event that turns lights on.
         * @param {Array} color Can be boolean to determine if the light is blue (true), or a color.
         * @param {Number | Array} lightID 
         * @returns 
         */
        on(color: ColorType | boolean, lightID: number | number[] = undefined) {
            this.value = (typeof color === "boolean" && color) ? EVENT.BLUE_ON : EVENT.RED_ON;
            if (typeof color !== "boolean") this.color = color;
            if (lightID !== undefined) this.lightID = lightID;
            return this;
        }
    
        /**
         * Create an event that flashes the lights.
         * @param {Array} color Can be boolean to determine if the light is blue (true), or a color.
         * @param {Number | Array} lightID 
         * @returns 
         */
        flash(color: ColorType | boolean, lightID: number | number[] = undefined) {
            this.value = (typeof color === "boolean" && color) ? EVENT.BLUE_FLASH : EVENT.RED_FLASH;
            if (typeof color !== "boolean") this.color = color;
            if (lightID !== undefined) this.lightID = lightID;
            return this;
        }

        /**
         * Create an event that fades the lights out.
         * @param {Array} color Can be boolean to determine if the light is blue (true), or a color.
         * @param {Number | Array} lightID 
         * @returns 
         */
        fade(color: ColorType | boolean, lightID: number | number[] = undefined) {
            this.value = (typeof color === "boolean" && color) ? EVENT.BLUE_FADE : EVENT.RED_FADE;
            if (typeof color !== "boolean") this.color = color;
            if (lightID !== undefined) this.lightID = lightID;
            return this;
        }
    
        /**
         * Create an event that makes the lights fade in to this color from the previous.
         * @param {Array} color Can be boolean to determine if the light is blue (true), or a color.
         * @param {Number | Array} lightID 
         * @returns 
         */
        in(color: ColorType | boolean, lightID: number | number[] = undefined) {
            this.value = (typeof color === "boolean" && color) ? EVENT.BLUE_IN : EVENT.RED_IN;
            if (typeof color !== "boolean") this.color = color;
            if (lightID !== undefined) this.lightID = lightID;
            return this;
        }
    
        /**
         * Create a light gradient between 2 colors. This feature is deprecated in Chroma.
         * @param {Array} startColor 
         * @param {Array} endColor 
         * @param {Number} duration 
         * @param {String} easing 
         * @returns 
         */
        gradient(startColor: ColorType, endColor: ColorType, duration: number, easing: EASE = undefined) {
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
        abstract() { return new Event().import(this.json) }
    
        get lightID() { return jsonGet(this.json, "_customData._lightID") }
        get color() { return jsonGet(this.json, "_customData._color") }
        get easing() { return jsonGet(this.json, "_customData._easing") }
        get lerpType() { return jsonGet(this.json, "_customData._lerpType") }
        get lightGradient() { return jsonGet(this.json, "_customData._lightGradient") }
        get startColor() { return jsonGet(this.json, "_customData._lightGradient._startColor") }
        get endColor() { return jsonGet(this.json, "_customData._lightGradient._endColor") }
        get duration() { return jsonGet(this.json, "_customData._lightGradient._duration") }
        get gradientEasing() { return jsonGet(this.json, "_customData._lightGradient._easing") }
    
        set lightID(value: number | number[]) { jsonSet(this.json, "_customData._lightID", value) }
        set color(value: ColorType) { jsonSet(this.json, "_customData._color", value) }
        set easing(value: EASE) { jsonSet(this.json, "_customData._easing", value) }
        set lerpType(value: string) { jsonSet(this.json, "_customData._lerpType", value) }
        set lightGradient(value) { jsonSet(this.json, "_customData._lightGradient", value) }
        set startColor(value: ColorType) { jsonSet(this.json, "_customData._lightGradient._startColor", value) }
        set endColor(value: ColorType) { jsonSet(this.json, "_customData._lightGradient._endColor", value) }
        set duration(value: number) { jsonSet(this.json, "_customData._lightGradient._duration", value) }
        set gradientEasing(value: EASE) { jsonSet(this.json, "_customData._lightGradient._easing", value) }
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
        abstract() { return new Event().import(this.json) }
    
        get lockPosition() { return jsonGet(this.json, "_customData._lockPosition") }
        get speed() { return jsonGet(this.json, "_customData._speed") }
        get direction() { return jsonGet(this.json, "_customData._direction") }
    
        set lockPosition(value: boolean) { jsonSet(this.json, "_customData._lockPosition", value) }
        set speed(value: number) { jsonSet(this.json, "_customData._speed", value) }
        set direction(value: number) { jsonSet(this.json, "_customData._direction", value) }
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
        abstract() { return new Event().import(this.json) }
    
        get step() { return jsonGet(this.json, "_customData._step") }
        get speed() { return jsonGet(this.json, "_customData._speed") }
    
        set step(value: number) { jsonSet(this.json, "_customData._step", value) }
        set speed(value: number) { jsonSet(this.json, "_customData._speed", value) }
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
        abstract() { return new Event().import(this.json) }
    
        get speed() { return jsonGet(this.json, "_customData._speed") }
        get direction() { return jsonGet(this.json, "_customData._direction") }
        get nameFilter() { return jsonGet(this.json, "_customData._nameFilter") }
        get reset() { return jsonGet(this.json, "_customData._reset") }
        get rotation() { return jsonGet(this.json, "_customData._rotation") }
        get step() { return jsonGet(this.json, "_customData._step") }
        get prop() { return jsonGet(this.json, "_customData._prop") }
        get counterSpin() { return jsonGet(this.json, "_customData._counterSpin") }
    
        set speed(value: number) { jsonSet(this.json, "_customData._speed", value) }
        set direction(value: number) { jsonSet(this.json, "_customData._direction", value) }
        set nameFilter(value: string) { jsonSet(this.json, "_customData._nameFilter", value) }
        set reset(value: boolean) { jsonSet(this.json, "_customData._reset", value) }
        set rotation(value: number) { jsonSet(this.json, "_customData._rotation", value) }
        set step(value: number) { jsonSet(this.json, "_customData._step", value) }
        set prop(value: number) { jsonSet(this.json, "_customData._prop", value) }
        set counterSpin(value: boolean) { jsonSet(this.json, "_customData._counterSpin", value) }
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
        abstract() { return new Event().import(this.json) }
    
        get rotation() { return jsonGet(this.json, "_customData._rotation") }
        set rotation(value) { jsonSet(this.json, "_customData._rotation", value) }
    }
    
    export class AbstractEvent extends EventInternals.BaseEvent {
        get lockPosition() { return jsonGet(this.json, "_customData._lockPosition") }
        get lightID() { return jsonGet(this.json, "_customData._lightID") }
        get color() { return jsonGet(this.json, "_customData._color") }
        get easing() { return jsonGet(this.json, "_customData._easing") }
        get lerpType() { return jsonGet(this.json, "_customData._lerpType") }
        get lightGradient() { return jsonGet(this.json, "_customData._lightGradient") }
        get startColor() { return jsonGet(this.json, "_customData._lightGradient._startColor") }
        get endColor() { return jsonGet(this.json, "_customData._lightGradient._endColor") }
        get duration() { return jsonGet(this.json, "_customData._lightGradient._duration") }
        get gradientEasing() { return jsonGet(this.json, "_customData._lightGradient._easing") }
        get speed() { return jsonGet(this.json, "_customData._speed") }
        get direction() { return jsonGet(this.json, "_customData._direction") }
        get nameFilter() { return jsonGet(this.json, "_customData._nameFilter") }
        get reset() { return jsonGet(this.json, "_customData._reset") }
        get rotation() { return jsonGet(this.json, "_customData._rotation") }
        get step() { return jsonGet(this.json, "_customData._step") }
        get prop() { return jsonGet(this.json, "_customData._prop") }
        get counterSpin() { return jsonGet(this.json, "_customData._counterSpin") }
    
        set lockPosition(value: boolean) { jsonSet(this.json, "_customData._lockPosition", value) }
        set speed(value: number) { jsonSet(this.json, "_customData._speed", value) }
        set direction(value: number) { jsonSet(this.json, "_customData._direction", value) }
        set nameFilter(value: string) { jsonSet(this.json, "_customData._nameFilter", value) }
        set reset(value: boolean) { jsonSet(this.json, "_customData._reset", value) }
        set rotation(value: number) { jsonSet(this.json, "_customData._rotation", value) }
        set step(value: number) { jsonSet(this.json, "_customData._step", value) }
        set prop(value: number) { jsonSet(this.json, "_customData._prop", value) }
        set counterSpin(value: boolean) { jsonSet(this.json, "_customData._counterSpin", value) }
        set lightID(value: number | number[]) { jsonSet(this.json, "_customData._lightID", value) }
        set color(value: ColorType) { jsonSet(this.json, "_customData._color", value) }
        set easing(value: EASE) { jsonSet(this.json, "_customData._easing", value) }
        set lerpType(value: string) { jsonSet(this.json, "_customData._lerpType", value) }
        set lightGradient(value) { jsonSet(this.json, "_customData._lightGradient", value) }
        set startColor(value: ColorType) { jsonSet(this.json, "_customData._lightGradient._startColor", value) }
        set endColor(value: ColorType) { jsonSet(this.json, "_customData._lightGradient._endColor", value) }
        set duration(value: number) { jsonSet(this.json, "_customData._lightGradient._duration", value) }
        set gradientEasing(value: EASE) { jsonSet(this.json, "_customData._lightGradient._easing", value) }
    }
}

export class Event extends EventInternals.BaseEvent {
    /**
     * Event object for ease of creation.
     * @param {Object} time
     */
    constructor(time = 0) { super(time) }

    /**
     * Controls the back lasers.
     * @returns 
     */
    backLasers() { return new EventInternals.LightEvent(this.json, EVENT.BACK_LASERS) }

    /**
     * Controls the ring lights.
     * @returns 
     */
    ringLights() { return new EventInternals.LightEvent(this.json, EVENT.RING_LIGHTS) }

    /**
     * Controls the left lasers.
     * @returns 
     */
    leftLasers() { return new EventInternals.LightEvent(this.json, EVENT.LEFT_LASERS) }

    /**
     * Controls the right lasers.
     * @returns 
     */
    rightLasers() { return new EventInternals.LightEvent(this.json, EVENT.RIGHT_LASERS) }

    /**
     * Controls the center lasers.
     * @returns 
     */
    centerLasers() { return new EventInternals.LightEvent(this.json, EVENT.CENTER_LASERS) }

    /**
     * Controls the extra left lasers in some environments.
     * @returns 
     */
    extraLeft() { return new EventInternals.LightEvent(this.json, EVENT.LEFT_EXTRA) }

    /**
     * Controls the extra right lasers in some environments.
     * @returns 
     */
    extraRight() { return new EventInternals.LightEvent(this.json, EVENT.RIGHT_EXTRA) }

    /**
     * Controls the left lasers in the Billie environment.
     * @returns 
     */
    billieLeft() { return new EventInternals.LightEvent(this.json, EVENT.BILLIE_LEFT) }

    /**
     * Controls the right lasers in the Billie environment.
     * @returns 
     */
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
    abstract() { return this.import({}) }

    /**
     * Make this event change boost colors.
     * @param {Boolean} on 
     * @returns 
     */
    boost(on: boolean) {
        this.type = EVENT.BOOST;
        this.value = on ? EVENT.BOOST_ON : EVENT.BOOST_OFF;
        return new EventInternals.BaseEvent(this.json);
    }

    /**
     * Move cars in the interscope environment.
     * @param {Number} value 
     * @returns 
     */
    moveCars(value: EVENT) {
        this.type = EVENT.RING_SPIN;
        this.value = value;
        return new EventInternals.BaseEvent(this.json);
    }

    /**
     * Lower the hydraulics of the cars in the interscope environment.
     * @returns 
     */
    lowerHydraulics() {
        this.type = EVENT.LOWER_HYDRAULICS;
        return new EventInternals.BaseEvent(this.json);
    }

    /**
     * Raise the hydraulics of the cars in the interscope environment.
     * @returns 
     */
    raiseHydraulics() {
        this.type = EVENT.RAISE_HYDRAULICS;
        return new EventInternals.BaseEvent(this.json);
    }

    /**
     * Spin the rings in an environment.
     * @param {Number} rotation 
     * @param {Number} direction 
     * @param {Number} step 
     * @param {Number} speed 
     * @param {Number} prop 
     * @param {Boolean} reset 
     * @param {String} nameFilter 
     * @param {Boolean} counterSpin 
     * @returns 
     */
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

    /**
     * Control the zoom of the rings.
     * @param {Number} step 
     * @param {Number} speed 
     * @returns 
     */
    ringZoom(step: number = undefined, speed: number = undefined) { return new EventInternals.RingZoomEvent(this.json, step, speed) }

    /**
     * Control the movement speed of the left lasers.
     * @param {Number} speed When containing decimals, the noodle data will be used for speed.
     * @param {Number} direction 
     * @param {Boolean} lockPosition 
     * @returns 
     */
    leftLaserSpeed(speed: number, direction: number = undefined, lockPosition: boolean = undefined) {
        return new EventInternals.LaserSpeedEvent(this.json, EVENT.LEFT_SPEED, speed, direction, lockPosition);
    }

    /**
     * Control the movement speed of the right lasers.
     * @param {Number} speed When containing decimals, the noodle data will be used for speed.
     * @param {Number} direction 
     * @param {Boolean} lockPosition 
     * @returns 
     */
    rightLaserSpeed(speed: number, direction: number = undefined, lockPosition: boolean = undefined) {
        return new EventInternals.LaserSpeedEvent(this.json, EVENT.RIGHT_SPEED, speed, direction, lockPosition);
    }

    /**
     * Used for 360 mode, rotates future objects and active objects.
     * @param {Number} rotation 
     * @returns 
     */
    earlyRotation(rotation: EVENT) { return new EventInternals.RotationEvent(this.json, EVENT.EARLY_ROTATION, rotation) }

    /**
     * Used for 360 mode, rotates future objects only.
     * @param {Number} rotation 
     * @returns 
     */
    lateRotation(rotation: EVENT) { return new EventInternals.RotationEvent(this.json, EVENT.LATE_ROTATION, rotation) }
}