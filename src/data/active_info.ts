import {RMLog} from "../utils/rm_log.ts";
import {getInfoLocation} from "../utils/beatmap/info/location.ts";
import {AbstractInfo} from "../internals/beatmap/info/abstract_info.ts";
import {V2Info} from "../internals/beatmap/info/info_v2.ts";
import {InfoJson} from "../types/beatmap/info/rm_info.ts";
import {REMAPPER_VERSION} from "../constants/package.ts";

let activeInfo: AbstractInfo

export function saveActiveInfo() {
    if (!activeInfo) return

    activeInfo.editors ??= {}
    activeInfo.editors._lastEditedBy = "ReMapper"
    activeInfo.editors["ReMapper"] = {
        version: REMAPPER_VERSION
    }

    Deno.writeTextFileSync(getInfoLocation(), JSON.stringify(activeInfo.toJSON(), null, 4))
    RMLog('Info.dat successfully saved!')
}

/** Load the Info.dat. This will only be done once during runtime. */
export async function loadActiveInfo() {
    if (activeInfo) return activeInfo

    const infoText = Deno.readTextFile(getInfoLocation())
    const infoJson = JSON.parse(await infoText)
    activeInfo = createInfo(infoJson)

    globalThis.addEventListener('unload', saveActiveInfo)
    return activeInfo
}

function createInfo(json: InfoJson): AbstractInfo {
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

/** Get the current active activeInfo object.
 * Use this to access the activeInfo object, not loadInfoDat().
 */
export function getActiveInfo() {
    if (activeInfo) return activeInfo

    throw new Error('There is currently no loaded Info.dat')
}

/** Get the current active activeInfo object as {@link V2Info}.
 * Use this to access the activeInfo object, not loadInfoDat().
 */
export function getActiveInfoAsV2(): V2Info {
    if (activeInfo) {
        if (activeInfo instanceof V2Info) {
            return activeInfo
        } else {
            throw new Error('Info.dat is not V2.')
        }
    } else {
        throw new Error('There is currently no loaded Info.dat')
    }
}