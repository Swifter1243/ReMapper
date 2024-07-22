import {BUNDLE_VERSIONS} from "./constants/file.ts";
import {RMLog} from "../utils/rm_log.ts";
import {getBundleCRC} from "../utils/file.ts";
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
    const crc = BUNDLE_VERSIONS.map(async x => {
        const fileName = `bundle${x}.manifest`
        const crc = await getBundleCRC(fileName)

        return {
            crc: crc,
            name: x,
        }
    })

    activeInfo = JSON.parse(await infoJson)
    activeInfo._customData ??= {}
    activeInfo._customData._assetBundle = {}

    await Promise.all(crc)
    crc.map(async x => {
        const y = await x
        activeInfo._customData!._assetBundle[y.name] = y.crc
    })

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

