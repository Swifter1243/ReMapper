import { RMLog } from '../rm_log.ts'
import { getActiveCache } from '../../data/active_cache.ts'

/**
 * Store data in the ReMapper cache.
 * Retrieves the same data unless the hash/hashed objects have changed.
 * @param name Name of the data.
 * @param process Generates the data to cache, given the hash changes.
 * @param hash If the corresponding entry in the cache does not have the same hash, `process` will be run again to re-cache data.
 */
export async function cacheData<T>(
    name: string,
    process: () => Promise<T>,
    hash: string,
): Promise<T> {
    let outputData: unknown

    async function getData() {
        outputData = await process()
        RMLog(`cached ${name}`)
        return outputData
    }

    const rmCache = await getActiveCache()

    const cachedData = rmCache.cachedData[name]
    if (cachedData !== undefined) {
        if (hash !== cachedData.hash) {
            cachedData.hash = hash
            cachedData.data = await getData()
        } else {
            outputData = cachedData.data
        }
    } else {
        rmCache.cachedData[name] = {
            hash,
            data: await getData(),
        }
    }

    rmCache.cachedData[name].accessed = true

    return outputData as T
}
