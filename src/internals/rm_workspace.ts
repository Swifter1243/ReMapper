import { AbstractInfo } from './beatmap/info/abstract_info.ts'
import { AbstractDifficulty } from './beatmap/abstract_beatmap.ts'
import { V2Info } from './beatmap/info/info_v2.ts'
import { fs, path } from '../deps.ts'
import { WorkspaceExportOptions } from '../types/remapper/rm_workspace.ts'
import {BundleInfo} from "../types/bundle.ts";
import {applyCRCsToInfo} from "../utils/vivify/bundle/load.ts";

export class ReMapperWorkspace {
    readonly info: AbstractInfo
    readonly directory: string
    readonly bundleInfo?: BundleInfo
    activeDifficulties: Set<AbstractDifficulty> = new Set()

    constructor(info: AbstractInfo, directory: string, bundleInfo?: BundleInfo) {
        this.info = info
        this.directory = directory
        this.bundleInfo = bundleInfo

        if (this.bundleInfo) {
            applyCRCsToInfo(this.info, this.bundleInfo)
        }
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
        // creates directory
        await fs.emptyDir(options.outputDirectory)

        const files: string[] = []
        const promises: Promise<unknown>[] = []

        function addTextFile(file: string, contents: object) {
            const newDirectory = path.join(options.outputDirectory, file)
            files.push(newDirectory)
            promises.push(Deno.writeTextFile(newDirectory, JSON.stringify(contents)))
        }

        function copyFile(file: string) {
            const newDirectory = path.join(options.outputDirectory, file)
            files.push(newDirectory)
            promises.push(fs.copy(file, newDirectory))
        }

        // Add bundle
        // TODO

        // Add info
        addTextFile('Info.dat', this.info.toJSON())
        copyFile(this.info.coverImageFilename)
        copyFile(this.info.audio.songFilename)

        // Add contributors
        if (this.info.contributors) {
            this.info.contributors.map(c => copyFile(c._iconPath))
        }

        // Add diffs
        Object.values(this.info.difficultyBeatmaps).forEach((difficultyInfo) => {
            const diff = this.activeDifficulties.values().find((x) => x.difficultyInfo === difficultyInfo)

            if (diff) {
                addTextFile(difficultyInfo.beatmapDataFilename, diff.toJSON())
            } else {
                copyFile(difficultyInfo.beatmapDataFilename)
            }
        })

        // Export
        await Promise.all(promises)
    }
}
