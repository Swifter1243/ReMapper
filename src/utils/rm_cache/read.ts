import { ReMapperCache } from './rm_cache.ts'
import {getCacheLocation} from "./location.ts";
import { fs } from '../../deps.ts'

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
