import { bsmap, path } from '../deps.ts'

import {
    getWorkingDirectory,
    info,
    setInfo,
} from './beatmap_handler.ts'
import { DIFFNAME } from '../mod.ts'

export function getInfoPath() {
    return path.join(getWorkingDirectory(), 'Info.dat')
}

export async function saveInfoDat() {
    await Deno.writeTextFile(getInfoPath(), JSON.stringify(info))
}

export async function readInfoDat(difficultyName: DIFFNAME) {
    const json = await Deno.readTextFile(getInfoPath())

    setInfo(JSON.parse(json))

    let diffSet: bsmap.v2.IInfoSetDifficulty | undefined

    const diffSetMap = info._difficultyBeatmapSets.find((e) => {
        diffSet = e._difficultyBeatmaps.find((s) =>
            s._beatmapFilename === difficultyName
        )

        return diffSet
    })

    if (!diffSetMap || !diffSet) {
        throw `The difficulty ${difficultyName} does not exist in your Info.dat`
    }

    return {
        diffSetMap,
        diffSet,
        info,
    }
}
