import { RMLog } from '../rm_log.ts'
import { getActiveCache } from '../../data/active_cache.ts'

/**
 * Store properties in the ReMapper cache.
 * Retrieves the same properties unless specified parameters are changed.
 * @param name Name of the properties.
 * @param process Function to generate new properties if the parameters are changed.
 * @param processing Parameters to compare to see if properties should be re-cached.
 */
export async function cacheData<T>(
    name: string,
    process: () => Promise<T>,
    processing: unknown[] = [],
): Promise<T> {
    let outputData: unknown
    const processingJSON = JSON.stringify(processing).replaceAll('"', '')

    async function getData() {
        outputData = await process()
        RMLog(`cached ${name}`)
        return outputData
    }

    const rmCache = await getActiveCache()

    const cachedData = rmCache.cachedData[name]
    if (cachedData !== undefined) {
        if (processingJSON !== cachedData.processing) {
            cachedData.processing = processingJSON
            cachedData.data = await getData()
        } else {
            outputData = cachedData.data
        }
    } else {
        rmCache.cachedData[name] = {
            processing: processingJSON,
            data: await getData(),
        }
    }

    rmCache.cachedData[name].accessed = true
    await rmCache.save()

    return outputData as T
}
