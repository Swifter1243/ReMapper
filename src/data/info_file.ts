import { path } from '../deps.ts'

import { getWorkingDirectory } from './beatmap_handler.ts'
import { DIFFNAME } from '../mod.ts'
import { RMLog } from '../general.ts'
import { IInfo } from '../types/beatmap_types.ts'
import { IInfoSetDifficulty } from '../types/beatmap_types.ts'

let info: IInfo

export function getInfoPath() {
    return path.join(getWorkingDirectory(), 'Info.dat')
}

function saveInfoDat() {
    Deno.writeTextFileSync(getInfoPath(), JSON.stringify(info, null, 4))
    RMLog('Info.dat successfully saved!')
}

export async function loadInfoDat() {
    if (info) return info

    const infoJson = Deno.readTextFile(getInfoPath())
    const crc2019 = getBundleCRC('bundle_2019.manifest')
    const crc2021 = getBundleCRC('bundle_2021.manifest')

    info = JSON.parse(await infoJson)

    if (await crc2019 || await crc2021) {
        info._customData ??= {}
        info._customData._assetBundle = {
            '_2019': await crc2019,
            '_2021': await crc2021,
        }
    }

    globalThis.addEventListener('unload', saveInfoDat)
    return info
}

async function getBundleCRC(name: string) {
    const file = path.join(getWorkingDirectory(), name)

    try {
        const content = await Deno.readTextFile(file)
        const lines = content.split('\n')
        const crcLine = lines.find((x) => x.includes('CRC:'))
        const crcValue = crcLine?.split(':')[1].trim()
        return crcValue ? parseInt(crcValue) : undefined
    } catch {
        return undefined
    }
}

export function getInfoDat() {
    if (info) return info

    throw new Error('There is currently no loaded info.dat.')
}

export function getInfoDifficultySets(difficultyName: DIFFNAME) {
    const info = getInfoDat()
    let diffSet: IInfoSetDifficulty | undefined

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
