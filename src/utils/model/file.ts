import {parseFilePath} from "../file.ts";
import {attachWorkingDirectory} from "../../data/working_directory.ts";

import {RawKeyframesVec3} from "../../types/animation/keyframe/vec3.ts";
import {FILEPATH} from "../../types/beatmap/file.ts";
import {ModelObject, ReadonlyModel} from "../../types/model/object.ts";
import {cacheData} from "../rm_cache/write.ts";

/**
 * Get the objects from a .rmmodel, caches properties if model hasn't changed.
 * @param filePath Path to the .rmmodel.
 * @param name Name to cache the properties as. Defaults to file name.
 * @param process Function to run for each object on the cached properties.
 * @param hash Parameters that will re-process the properties if changed.
 */
export async function getModel(
    filePath: FILEPATH,
    name?: string,
    process?: (objects: ModelObject[]) => void,
    hash = '',
) {
    const parsedPath = await parseFilePath(filePath, '.rmmodel')
    const inputPath = attachWorkingDirectory(parsedPath.path)
    const mTime = await Deno.stat(inputPath).then((x) => x.mtime?.toString())
    hash += mTime
    hash += process?.toString()

    name ??= parsedPath.name

    type OldModelObject = ModelObject & {
        track?: string
        pos?: RawKeyframesVec3
        rot?: RawKeyframesVec3
    }

    return cacheData(name, async () => {
        const data = JSON.parse(await Deno.readTextFile(inputPath))
        const objects = data.objects
        const version = data.version ?? 1

        if (version < 2) {
            const oldObjects = objects as OldModelObject[]

            oldObjects.forEach((x) => {
                if (x.track) {
                    x.group = x.track
                }

                x.position = x.pos!
                x.rotation = x.rot!
                delete x.track
                delete x.pos
                delete x.rot
            })
        }

        if (process) process(objects)
        return objects as ReadonlyModel
    }, hash)
}

