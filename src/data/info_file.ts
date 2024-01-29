import { bsmap, path } from '../deps.ts'

import {
    getWorkingDirectory,
} from './beatmap_handler.ts'
import { DIFFNAME } from '../mod.ts'

let info: bsmap.v2.IInfo

export function getInfoPath() {
    return path.join(getWorkingDirectory(), 'Info.dat')
}

function saveInfoDat() {
    Deno.writeTextFileSync(getInfoPath(), JSON.stringify(info, null, 4))
}

export async function loadInfoDat() {
    if (info) return info

    const json = await Deno.readTextFile(getInfoPath())
    info = JSON.parse(json)
    globalThis.addEventListener("unload", saveInfoDat)
    return info
}

export function getInfoDat() {
    if (info) return info

    throw new Error('There is currently no loaded info.dat.')
}

export function getInfoDiffSets(difficultyName: DIFFNAME) {
    const info = getInfoDat()
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