import {RMLog} from "../utils/rm_log.ts";
import {getInfoLocation} from "../utils/beatmap/info/location.ts";
import {IInfo} from "../types/beatmap/info.ts";

let activeInfo: IInfo

export function saveActiveInfo() {
    if (!activeInfo) return

    Deno.writeTextFileSync(getInfoLocation(), JSON.stringify(activeInfo, null, 4))
    RMLog('Info.dat successfully saved!')
}

/** Load the Info.dat. This will only be done once during runtime. */
export async function loadActiveInfo() {
    if (activeInfo) return activeInfo

    const infoJson = Deno.readTextFile(getInfoLocation())
    activeInfo = JSON.parse(await infoJson)

    globalThis.addEventListener('unload', saveActiveInfo)
    return activeInfo
}

/** Get the current active activeInfo object.
 * Use this to access the activeInfo object, not loadInfoDat().
 */
export function getActiveInfo() {
    if (activeInfo) return activeInfo

    throw new Error('There is currently no loaded activeInfo.dat.')
}

