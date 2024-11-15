import {AbstractInfo} from "./beatmap/info/abstract_info.ts";
import {AbstractDifficulty} from "./beatmap/abstract_beatmap.ts";
import {V2Info} from "./beatmap/info/info_v2.ts";
import { path } from '../deps.ts'
import {WorkspaceExportOptions} from "../types/remapper/rm_workspace.ts";

export class ReMapperWorkspace
{
    readonly info: AbstractInfo
    readonly directory: string
    activeDifficulties: Set<AbstractDifficulty> = new Set()

    constructor(info: AbstractInfo, directory: string) {
        this.info = info
        this.directory = directory
    }

    attachDirectory(file: string) {
        path.join(this.directory, file)
    }

    get infoAsV2() {
        if (this.info instanceof V2Info) {
            return this.info
        } else {
            throw new Error('Info.dat is not V2.')
        }
    }

    async export(options: WorkspaceExportOptions) {

    }
}