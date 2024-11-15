import {RMLog} from "../utils/rm_log.ts";
import {getInfoLocation} from "../utils/beatmap/info/location.ts";
import {AbstractInfo} from "../internals/beatmap/info/abstract_info.ts";
import {V2Info} from "../internals/beatmap/info/info_v2.ts";
import {REMAPPER_VERSION} from "../constants/package.ts";
import {createInfo} from "../builder_functions/beatmap/info.ts";

let activeInfoPromise: Promise<AbstractInfo>
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

async function loadActiveInfo() {
    const infoText = Deno.readTextFile('Info.dat')
    const infoJson = JSON.parse(await infoText)
    activeInfo = createInfo(infoJson)
    return activeInfo
}

export function startLoadingInfo() {
    activeInfoPromise = loadActiveInfo()
}

export async function getActiveInfoAsync() {
    if (!activeInfoPromise) {
        throw new Error("No Info.dat has attempted to be loaded yet! Use 'rm.loadWorkspace' to load the Info.dat.")
    }

    return await activeInfoPromise
}

export async function getActiveInfoAsyncAsV2() {
    return assertInfoV2(await getActiveInfoAsync())
}

/** Get the current active activeInfo object.
 * Use this to access the activeInfo object, not loadInfoDat().
 */
export function getActiveInfo() {
    if (activeInfo) return activeInfo

    throw new Error("No Info.dat has attempted to be loaded yet! Use 'rm.loadWorkspace' to load the Info.dat.")
}

/** Get the current active activeInfo object as {@link V2Info}.
 * Use this to access the activeInfo object, not loadInfoDat().
 */
export function getActiveInfoAsV2(): V2Info {
    return assertInfoV2(getActiveInfo())
}

function assertInfoV2(info: AbstractInfo) {
    if (info instanceof V2Info) {
        return info
    } else {
        throw new Error('Info.dat is not V2.')
    }
}