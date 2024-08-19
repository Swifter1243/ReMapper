import {getCacheLocation} from "./location.ts";
import {CachedData} from "../../types/rm_cache.ts";

export class ReMapperCache {
    /** Amount of times the ReMapper script has been run. */
    runs = 0
    /** The cached properties in the cache. */
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

    /** Empty existing data in the cache. */
    empty() {
        this.cachedData = {}
    }
}

