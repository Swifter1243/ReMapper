// deno-lint-ignore-file
import { Track } from "./animation.ts";
import { activeDiffGet, info } from "./beatmap.ts";
import { NOTETYPE } from "./constants.ts";
import { ColorType, copy, getJumps, isEmptyObject, jsonCheck, jsonGet, jsonPrune, jsonRemove, jsonSet, Vec2, Vec3 } from "./general.ts";

export class BaseObject {
    json: Record<string, any> = {};

    get time() { return this.json.b }
    get customData() { return this.json.customData }

    set time(value: number) { this.json.b = value }
    set customData(value: Record<string, unknown>) { this.json.customData = value }

    get isModded() {
        if (this.customData === undefined) return false;
        const customData = copy(this.customData);
        jsonPrune(customData);
        return !isEmptyObject(customData);
    }
}

export class BaseGameplayObject extends BaseObject {
    get x() { return this.json.x }
    get y() { return this.json.y }
    get position() { return this.json.customData.coordinates }
    get rotation() { return this.json.customData.worldRotation }
    get localRotation() { return this.json.customData.localRotation }
    get NJS() {
        if (this.json.customData.noteJumpMovementSpeed)
            return this.json.customData.noteJumpMovementSpeed;
        else return activeDiffGet().NJS;
    }
    get offset() {
        if (this.json.customData.noteJumpStartBeatOffset)
            return this.json.customData.noteJumpStartBeatOffset;
        else return activeDiffGet().offset;
    }
    get halfJumpDur() { return getJumps(this.NJS, this.offset, info.BPM).halfDur }
    get jumpDist() { return getJumps(this.NJS, this.offset, info.BPM).dist }
    get life() { return this.halfJumpDur * 2 }
    get lifeStart() { return this.time - this.life / 2 }
    get interactable() { return !this.json.customData.uninteractable }
    get track() { return new Track(this.json.customData.track) }
    get color() { return this.json.customData.color }
    get animation() { return this.json.customData.animation }

    set x(value: number) { this.json.x = value }
    set y(value: number) { this.json.y = value }
    set position(value: Vec2) { this.json.customData.coordinates = value }
    set rotation(value: Vec3) { this.json.customData.worldRotation = value }
    set localRotation(value: Vec3) { this.json.customData.localRotation = value }
    set NJS(value: number) { this.json.customData.noteJumpMovementSpeed = value }
    set offset(value: number) { this.json.customData.noteJumpStartBeatOffset = value }
    set life(value: number) {
        if (value < 2) console.log("Warning: The lifespan of a note has a minimum of 2 beats.");
        const defaultJumps = getJumps(this.NJS, 0, info.BPM);
        this.offset = (value - (2 * defaultJumps.halfDur)) / 2;
    }
    set lifeStart(value: number) { this.time = value + this.life / 2 }
    set interactable(value: boolean) { this.json.customData.uninteractable = !value }
    set color(value: ColorType) { this.json.customData.color = value }
    set animation(value) { this.json.customData.animation = value }

    get isModded() {
        if (this.customData === undefined) return false;
        const customData = copy(this.customData);
        jsonPrune(customData);
        return !isEmptyObject(customData);
    }

    get isGameplayModded() {
        if (this.customData === undefined) return false;
        const customData = copy(this.customData);
        jsonRemove(customData, "color");
        jsonRemove(customData, "spawnEffect");
        jsonRemove(customData, "animation.color");
        jsonPrune(customData);
        return !isEmptyObject(customData);
    }
}

export class BaseSliderObject extends BaseGameplayObject {
    get type() { return this.json.c }
    get headDirection() { return this.json.d }
    get tailTime() { return this.json.tb }
    get tailX() { return this.json.tx }
    get tailY() { return this.json.ty }

    set type(value: NOTETYPE) { this.json.c = value }
    set headDirection(value: number) { this.json.d = value }
    set tailTime(value: number) { this.json.tb = value }
    set tailX(value: number) { this.json.tx = value }
    set tailY(value: number) { this.json.ty = value }
}