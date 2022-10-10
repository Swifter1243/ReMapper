// deno-lint-ignore-file
import { Track } from "./animation.ts";
import { activeDiffGet, info } from "./beatmap.ts";
import { ColorType, copy, getJumps, isEmptyObject, jsonCheck, jsonGet, jsonPrune, jsonRemove, jsonSet, Vec2, Vec3 } from "./general.ts";

export class BaseObject {
    json: Record<string, any> = {};

    get time() { return this.json._time }
    get type() { return this.json._type }
    get customData() { return this.json._customData }

    set time(value: number) { this.json._time = value }
    set type(value: number) { this.json._type = value }
    set customData(value: Record<string, unknown>) { this.json._customData = value }

    get isModded() {
        if (this.customData === undefined) return false;
        const customData = copy(this.customData);
        jsonPrune(customData);
        return !isEmptyObject(customData);
    }
}

export class BaseGameplayObject extends BaseObject {
    get x() { return this.json._lineIndex }
    get position() { return this.json._customData._position }
    get rotation() { return this.json._customData._rotation }
    get localRotation() { return this.json._customData._localRotation }
    get NJS() {
        if (this.json._customData._noteJumpMovementSpeed)
            return this.json._customData._noteJumpMovementSpeed;
        else return activeDiffGet().NJS;
    }
    get offset() {
        if (this.json._customData._noteJumpStartBeatOffset)
            return this.json._customData._noteJumpStartBeatOffset;
        else return activeDiffGet().offset;
    }
    get halfJumpDur() { return getJumps(this.NJS, this.offset, info.BPM).halfDur }
    get jumpDist() { return getJumps(this.NJS, this.offset, info.BPM).dist }
    get life() { return this.halfJumpDur * 2 }
    get lifeStart() { return this.time - this.life / 2 }
    get fake() { return this.json._customData._fake }
    get interactable() { return this.json._customData._interactable }
    get track() { return new Track(this.json._customData._track) }
    get color() { return this.json._customData._color }
    get animation() { return this.json._customData._animation }

    set x(value: number) { this.json._lineIndex = value }
    set position(value: Vec2) { this.json._customData._position = value }
    set rotation(value: Vec3) { this.json._customData._rotation = value }
    set localRotation(value: Vec3) { this.json._customData._localRotation = value }
    set NJS(value: number) { this.json._customData._noteJumpMovementSpeed = value }
    set offset(value: number) { this.json._customData._noteJumpStartBeatOffset = value }
    set life(value: number) {
        if (value < 2) console.log("Warning: The lifespan of a note has a minimum of 2 beats.");
        const defaultJumps = getJumps(this.NJS, 0, info.BPM);
        this.offset = (value - (2 * defaultJumps.halfDur)) / 2;
    }
    set lifeStart(value: number) { this.time = value + this.life / 2 }
    set fake(value: boolean) { this.json._customData._fake = value }
    set interactable(value: boolean) { this.json._customData._interactable = value }
    set color(value: ColorType) { this.json._customData._color = value }
    set animation(value) { this.json._customData._animation = value }

    get isModded() {
        if (this.customData === undefined) return false;
        const customData = copy(this.customData);
        jsonPrune(customData);
        return !isEmptyObject(customData);
    }

    get isGameplayModded() {
        if (this.customData === undefined) return false;
        const customData = copy(this.customData);
        jsonRemove(customData, "_color");
        jsonRemove(customData, "_disableSpawnEffect");
        jsonRemove(customData, "_animation._color");
        jsonPrune(customData);
        return !isEmptyObject(customData);
    }
}