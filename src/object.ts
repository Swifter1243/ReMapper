// deno-lint-ignore-file
import { copy, isEmptyObject, jsonGet, jsonPrune, jsonSet } from "./general.ts";

export class BaseObject {
    json: Record<string, unknown> = {
        _time: 0,
        _type: 0
    }

    get time() { return this.json._time as number }
    get type() { return this.json._type as number }
    get customData() { return jsonGet(this.json, "_customData") }

    set time(value: number) { this.json._time = value }
    set type(value: number) { this.json._type = value }
    set customData(value: Record<string, unknown>) { jsonSet(this.json, "_customData", value) }

    get isModded() {
        if (this.customData === undefined) return false;
        const customData = copy(this.customData);
        jsonPrune(customData);
        return !isEmptyObject(customData);
    }
}

export class BaseGameplayObject extends BaseObject {
    
}