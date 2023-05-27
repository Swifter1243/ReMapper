import {RMCacheFilename} from "./data/constants.ts";
import {CachedData} from "./data/types.ts";
import {fs} from "./deps.ts";

async function readRemapperJson(): Promise<ReMapperJson> {
    const json = new ReMapperJson()

    if (!fs.existsSync(RMCacheFilename)) {
        await json.save()
    }
    try {
        Object.assign(
            json,
            JSON.parse(await Deno.readTextFile(RMCacheFilename)),
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

class ReMapperJson {
    /** Amount of times the ReMapper script has been run. */
    runs = 0
    /** The cached data in the cache. */
    cachedData = {} as Record<string, CachedData>

    /** Save the cache. */
    async save(): Promise<void> {
        await Deno.writeTextFile(
            RMCacheFilename,
            JSON.stringify({
                runs: this.runs,
                cachedData: this.cachedData,
            }),
        )
    }
}

/** The ReMapper cache. */
export const RMJson = readRemapperJson()