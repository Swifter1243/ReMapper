import { path } from '../deps.ts'

import { getWorkingDirectory } from './beatmap_handler.ts'
import { DIFFNAME } from '../mod.ts'
import { RMLog } from '../general.ts'
import { IInfo } from '../types/beatmap_types.ts'
import { IInfoSetDifficulty } from '../types/beatmap_types.ts'
import { BUNDLE_VERSIONS } from './constants.ts'

let info: IInfo

/** Get the current directory of the Info.dat, based on the working directory. */
export function getInfoPath() {
    return path.join(getWorkingDirectory(), 'Info.dat')
}

function saveInfoDat() {
    Deno.writeTextFileSync(getInfoPath(), JSON.stringify(info, null, 4))
    RMLog('Info.dat successfully saved!')
}

/** Load the Info.dat. This will only be done once during runtime. */
export async function loadInfoDat() {
    if (info) return info

    const infoJson = Deno.readTextFile(getInfoPath())
    const crc = BUNDLE_VERSIONS.map(async x => {
        const fileName = `bundle${x}.manifest`
        const crc = await getBundleCRC(fileName)

        return {
            crc: crc,
            name: x,
        }
    })

    info = JSON.parse(await infoJson)
    info._customData ??= {}
    info._customData._assetBundle = {}

    Promise.all(crc)
    crc.map(async x => {
        const y = await x
        info._customData!._assetBundle[y.name] = y.crc
    })

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

/** Get the current active info object.
 * Use this to access the info object, not loadInfoDat().
 */
export function getInfoDat() {
    if (info) return info

    throw new Error('There is currently no loaded info.dat.')
}

/** The infoset of a given difficulty name.
 * Contains difficulty, difficulty rank, among other information.
 */
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
