import { AbstractInfo } from './beatmap/info/abstract_info.ts'
import { AbstractDifficulty } from './beatmap/abstract_beatmap.ts'
import { V2Info } from './beatmap/info/info_v2.ts'
import { compress, fs, path } from '../deps.ts'
import { WorkspaceExportOptions, WorkspaceZipOptions } from '../types/remapper/rm_workspace.ts'
import { BundleInfo } from '../types/bundle.ts'
import { applyCRCsToInfo } from '../utils/vivify/bundle/load.ts'
import { REMAPPER_VERSION } from '../constants/package.ts'
import { RMError, RMLog } from '../utils/rm_log.ts'

export class ReMapperWorkspace {
    readonly info: AbstractInfo
    readonly directory: string
    readonly bundleInfo?: BundleInfo
    activeDifficulties: Set<AbstractDifficulty> = new Set()

    constructor(info: AbstractInfo, directory: string, bundleInfo?: BundleInfo) {
        this.info = info
        this.directory = directory
        this.bundleInfo = bundleInfo

        info.editors ??= {}
        info.editors._lastEditedBy = 'ReMapper'
        info.editors['ReMapper'] = {
            version: REMAPPER_VERSION,
        }

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
        const outputDirectory = path.join(options.outputDirectory, path.basename(this.directory))

        const outputDirectoryIsInput = path.resolve(outputDirectory) === this.directory
        if (outputDirectoryIsInput) {
            throw new Error('You are trying to export a beatmap into the same directory as itself!')
        }

        await Promise.all([
            await fs.emptyDir(outputDirectory), // creates directory
            ...this.activeDifficulties.values().map((d) => d.awaitAllAsync()),
        ])

        const files: string[] = []
        const promises: Promise<unknown>[] = []

        function addTextFile(file: string, contents: object) {
            const newDirectory = path.join(outputDirectory, path.basename(file))
            files.push(newDirectory)
            promises.push(Deno.writeTextFile(newDirectory, JSON.stringify(contents)))
        }

        function addCopiedFile(file: string) {
            const newDirectory = path.join(outputDirectory, path.basename(file))
            files.push(newDirectory)
            promises.push(fs.copy(file, newDirectory))
        }

        // Add info
        addTextFile('Info.dat', this.info.toJSON())
        addCopiedFile(this.info.coverImageFilename)
        addCopiedFile(this.info.audio.songFilename)

        // Add contributors
        if (this.info.contributors) {
            this.info.contributors.map((c) => addCopiedFile(c._iconPath))
        }

        // Add bundle
        if (this.bundleInfo) {
            this.bundleInfo.default.bundleFiles.forEach(addCopiedFile)
        }

        // Add diffs
        Object.values(this.info.difficultyBeatmaps).forEach((difficultyInfo) => {
            const diff = this.activeDifficulties.values().find((x) => x.difficultyInfo === difficultyInfo)

            if (diff) {
                addTextFile(difficultyInfo.beatmapDataFilename, diff.toJSON())
            } else {
                addCopiedFile(difficultyInfo.beatmapDataFilename)
            }
        })

        // Export
        await Promise.all(promises)
        RMLog(`Successfully saved beatmap to ${outputDirectory}`)

        const exportPromises: Promise<unknown>[] = []

        if (options.zip) {
            exportPromises.push(this.exportZip(files, options.zip))
        }

        await Promise.all(exportPromises)
    }

    private async exportZip(files: string[], zipOptions: WorkspaceZipOptions) {
        let zipName = zipOptions.name + '.zip'
        zipName = zipName.replaceAll(' ', '_')
        zipName = encodeURI(zipName)

        if (zipOptions.includeBundles && !this.bundleInfo) {
            throw new Error("You are trying to zip bundles, but the workspace has no bundleInfo! It should have been passed in 'createWorkspace'.")
        }

        if (this.bundleInfo && !this.bundleInfo.default.isCompressed) {
            RMError(
                'Warning: You are trying to distribute uncompressed bundles. It is recommended that you export these bundles as compressed if you plan to distribute them.',
            )
        }

        if (this.bundleInfo && !zipOptions.includeBundles) {
            files = files.filter((f) => !path.parse(f).name.includes('bundle'))
        }

        // surround with quotes for safety
        files = files.map(f => `"${f}"`)

        await compress(files, zipName, { overwrite: true })

        RMLog(`"${zipName}" has been zipped!`)
    }
}
