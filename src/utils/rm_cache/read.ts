import { ReMapperCache } from './rm_cache.ts'
import {getCacheLocation} from "./location.ts";
import { fs } from '../../deps.ts'

/** Read the ReMapper cache. */
export async function readRemapperCache(): Promise<ReMapperCache> {
    const cache = new ReMapperCache()

    if (!await fs.exists(getCacheLocation())) {
        cache.saveSync()
    }
    try {
        Object.assign(
            cache,
            JSON.parse(await Deno.readTextFile(getCacheLocation())),
        )
    } catch (e) {
        console.error(`Suffered from error, invalidating cache: ${e}`)
        cache.saveSync()
    }

    cache.runs++
    Object.keys(cache.cachedData).forEach((x) => {
        const data = cache.cachedData[x]
        if (!data.accessed) delete cache.cachedData[x]
        else data.accessed = false
    })

    return cache
}
