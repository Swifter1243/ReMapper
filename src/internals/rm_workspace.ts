import {AbstractInfo} from "./beatmap/info/abstract_info.ts";
import {AbstractDifficulty} from "./beatmap/abstract_beatmap.ts";
import {V2Info} from "./beatmap/info/info_v2.ts";
import { path } from '../deps.ts'

export class ReMapperWorkspace
{
    readonly info: AbstractInfo
    readonly inputDirectory: string
    readonly outputDirectory: string
    activeDifficulties: Set<AbstractDifficulty> = new Set()

    constructor(info: AbstractInfo, inputDirectory: string, outputDirectory: string) {
        this.info = info
        this.inputDirectory = inputDirectory
        this.outputDirectory = outputDirectory
    }

    attachInputDirectory(file: string) {
        path.join(this.inputDirectory, file)
    }

    get infoAsV2() {
        if (this.info instanceof V2Info) {
            return this.info
        } else {
            throw new Error('Info.dat is not V2.')
        }
    }
}