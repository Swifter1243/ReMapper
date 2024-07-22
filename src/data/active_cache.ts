import {readRemapperCache} from "../utils/rm_cache/read.ts";
import {ReMapperCache} from "../utils/rm_cache/rm_cache.ts";

/** The ReMapper cache. */
let activeCache: Promise<ReMapperCache>

/** Start loading the ReMapper cache. This should only be done once. */
export function loadCache() {
    activeCache = readRemapperCache()
}

/** Get the currently active ReMapper cache. */
export async function getActiveCache() {
    if (activeCache) return await activeCache

    throw 'There is no active ReMapper Cache. Waiting for a working directory.'
}
