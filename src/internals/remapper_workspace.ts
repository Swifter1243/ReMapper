import {AbstractInfo} from "./beatmap/info/abstract_info.ts";
import {AbstractDifficulty} from "./beatmap/abstract_beatmap.ts";
import {V2Info} from "./beatmap/info/info_v2.ts";

export class ReMapperWorkspace
{
    info: AbstractInfo
    inputDirectory: string
    outputDirectory: string
    activeDifficulties: Set<AbstractDifficulty> = new Set()

    constructor(info: AbstractInfo, inputDirectory: string, outputDirectory: string) {
        this.info = info
        this.inputDirectory = inputDirectory
        this.outputDirectory = outputDirectory
    }

    get infoAsV2() {
        if (this.info instanceof V2Info) {
            return this.info
        } else {
            throw new Error('Info.dat is not V2.')
        }
    }
}