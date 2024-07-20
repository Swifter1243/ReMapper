import { getWorkingDirectory } from "./data/beatmap_handler.ts";
import {fs, path} from "./deps.ts";
import {CachedData} from "./types/beatmap.ts";

/** Get the path of RM_Cache.json */
export function getCacheLocation() {
    return path.join(getWorkingDirectory(), 'RM_Cache.json') 
}

/** Read the ReMapper cache. */
export async function readRemapperCache(): Promise<ReMapperCache> {
    const json = new ReMapperCache()

    if (!await fs.exists(getCacheLocation())) {
        await json.save()
    }
    try {
        Object.assign(
            json,
            JSON.parse(await Deno.readTextFile(getCacheLocation())),
        )
    } catch (e) {
        console.error(`Suffered from error, invalidating cache: ${e}`)
        await json.save()
    }

    json.runs++
    Object.keys(json.cachedData).forEach((x) => {
        const data = json.cachedData[x]
        if (!data.accessed) delete json.cachedData[x]
        else data.accessed = false
    })

    return json
}

class ReMapperCache {
    /** Amount of times the ReMapper script has been run. */
    runs = 0
    /** The cached data in the cache. */
    cachedData = {} as Record<string, CachedData>

    /** Save the cache. */
    async save(): Promise<void> {
        await Deno.writeTextFile(
            getCacheLocation(),
            JSON.stringify({
                runs: this.runs,
                cachedData: this.cachedData,
            }),
        )
    }
}

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