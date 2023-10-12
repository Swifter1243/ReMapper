import {bsmap, path} from "../deps.ts"

import {info, workingDirectory, setWorkingDirectory, setInfo} from "./beatmap_handler.ts";
import {parseFilePath} from "../general.ts";

export async function saveInfoDat() {
    await Deno.writeTextFile(workingDirectory, JSON.stringify(info))
}

export async function readInfoDat(
    parsedOutput: Awaited<ReturnType<typeof parseFilePath>>,
    relativeMapFile: string,
) {
    setWorkingDirectory(path.join(parsedOutput.dir ?? Deno.cwd(), 'Info.dat'))
    const json = await Deno.readTextFile(
        workingDirectory,
    )

    setInfo(JSON.parse(json))

    let diffSet: bsmap.v2.IInfoSetDifficulty | undefined

    const diffSetMap = info._difficultyBeatmapSets.find((e) => {
        diffSet = e._difficultyBeatmaps.find((s) =>
            s._beatmapFilename === relativeMapFile
        )

        return diffSet
    })

    if (!diffSetMap || !diffSet) {
        throw `The difficulty ${parsedOutput.name} does not exist in your Info.dat`
    }

    return {
        diffSetMap,
        diffSet,
        info,
    }
}