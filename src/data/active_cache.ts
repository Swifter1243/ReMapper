import { readRemapperCache } from '../utils/rm_cache/read.ts'
import { ReMapperCache } from '../utils/rm_cache/rm_cache.ts'

/** The ReMapper cache. */
const activeCache: Promise<ReMapperCache> = setupActiveCache()

async function setupActiveCache() {
    const cache = await readRemapperCache()
    globalThis.addEventListener('unload', () => cache.saveSync())
    return cache
}

/** Get the currently active ReMapper cache. */
export async function getActiveCache() {
    return await activeCache
}
