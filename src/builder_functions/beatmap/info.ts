import {InfoJson} from "../../types/beatmap/info/rm_info.ts";
import {AbstractInfo} from "../../internals/beatmap/info/abstract_info.ts";
import {V2Info} from "../../internals/beatmap/info/info_v2.ts";

export function createInfo(json: InfoJson): AbstractInfo {
    if (json._version) {
        if (json._version === '2.0.0') {
            json._colorSchemes = []
            json._environmentNames = []
        }

        return new V2Info(json)
    } else {
        throw new Error('Version of Info.dat not recognized!')
    }
}