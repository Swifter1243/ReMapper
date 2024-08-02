import { RMLog } from '../rm_log.ts'
import { getActiveCache } from '../../data/active_cache.ts'

/**
 * Store data in the ReMapper cache.
 * Retrieves the same data unless the hash/hashed objects have changed.
 * @param name Name of the data.
 * @param process Generates the data to cache, given the hash changes.
 * @param hashedObjects Objects that will be turned into JSON and compared to any existing hashes in the cache. If they don't match, `process` will be run to recache the data.
 */
export async function cacheData<T>(
    name: string,
    process: () => Promise<T>,
    hashedObjects: unknown[] = [],
): Promise<T> {
    let outputData: unknown
    const hash = JSON.stringify(hashedObjects).replaceAll('"', '')

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
    await rmCache.save()

    return outputData as T
}
