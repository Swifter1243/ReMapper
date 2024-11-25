import { AbstractInfo } from './beatmap/info/abstract_info.ts'
import { AbstractDifficulty } from './beatmap/abstract_difficulty.ts'
import { V2Info } from './beatmap/info/info_v2.ts'
import { compress, fs, path, adbDeno } from '../deps.ts'
import {PipelineExportOptions, PipelineQuestOptions, PipelineZipOptions} from '../types/remapper/pipeline.ts'
import { BundleInfo } from '../types/bundle.ts'
import { applyCRCsToInfo } from '../utils/vivify/bundle/load.ts'
import { REMAPPER_VERSION } from '../constants/package.ts'
import { RMError, RMLog } from '../utils/rm_log.ts'
import { QUEST_WIP_PATH } from '../constants/file.ts'

type MovedFile = {
    old: string,
    new: string
}

export class Pipeline {
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
        return path.join(this.directory, file);
    }

    get infoAsV2() {
        if (this.info instanceof V2Info) {
            return this.info
        } else {
            throw new Error('Info.dat is not V2.')
        }
    }

    async export(options: PipelineExportOptions) {
        const inputDirectory = this.directory
        const outputFolderName = options.outputFolderName ?? path.basename(inputDirectory)
        const outputDirectory = path.join(options.outputDirectory, outputFolderName)
        if (path.resolve(outputDirectory) === path.resolve(inputDirectory)) {
            throw new Error('You are trying to export a pipeline into it\'s own directory!')
        }

        const filesToCopy: MovedFile[] = []
        const filesToWrite: MovedFile[] = []
        const ensureFilesExistPromises: Promise<void>[] = []

        function addTextFile(file: string, contents: object) {
            const newDirectory = path.join(outputDirectory, path.basename(file))
            filesToWrite.push({
                old: JSON.stringify(contents),
                new: newDirectory
            })
        }

        function addCopiedFile(file: string) {
            const newDirectory = path.join(outputDirectory, path.basename(file))
            const fileToCopy = path.join(inputDirectory, path.basename(file))
            filesToCopy.push({
                old: fileToCopy,
                new: newDirectory
            })
            ensureFilesExistPromises.push(ensureFileExists(fileToCopy))
        }

        async function ensureFileExists(file: string) {
            if (!await fs.exists(file)) {
                throw new Error(`The file "${file}" does not exist.`)
            }
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
        await Promise.all(this.activeDifficulties.values().map((d) => d.awaitAllAsync()))

        Object.values(this.info.difficultyBeatmaps).forEach((difficultyInfo) => {
            const diff = this.activeDifficulties.values().find((x) => x.difficultyInfo === difficultyInfo)

            if (diff) {
                addTextFile(difficultyInfo.beatmapDataFilename, diff.toJSON())
            } else {
                addCopiedFile(difficultyInfo.beatmapDataFilename)
            }
        })

        // Serialize
        await Promise.all(ensureFilesExistPromises)
        await this.serialize(outputDirectory, filesToCopy, filesToWrite, options)
    }

    private async serialize(outputDirectory: string, filesToCopy: MovedFile[], filesToWrite: MovedFile[], options: PipelineExportOptions) {
        await fs.ensureDir(outputDirectory) // create directory

        await Promise.all([
            ...filesToCopy.map(file => fs.copy(file.old, file.new, {
                overwrite: true
            })),
            ...filesToWrite.map(file => Deno.writeTextFile(file.new, file.old))
        ])
        RMLog(`Successfully saved beatmap to ${outputDirectory}`)

        const exportPromises: Promise<unknown>[] = []
        const exportedFiles = [...filesToCopy, ...filesToWrite].map(f => f.new)

        if (options.zip) {
            exportPromises.push(this.exportZip(exportedFiles, options.zip))
        }
        if (options.quest) {
            exportPromises.push(this.exportQuest(exportedFiles, options.quest))
        }

        await Promise.all(exportPromises)
    }

    private async exportZip(files: string[], zipOptions: PipelineZipOptions) {
        let zipName = zipOptions.name + '.zip'
        zipName = zipName.replaceAll(' ', '_')
        zipName = encodeURI(zipName)

        if (zipOptions.includeBundles && !this.bundleInfo) {
            throw new Error("You are trying to zip bundles, but the pipeline has no bundleInfo! It should have been passed in 'createPipeline'.")
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

    private async exportQuest(files: string[], questOptions: PipelineQuestOptions) {
        const adbBinary = adbDeno.getADBBinary(adbDeno.defaultADBPath())

        // Download ADB
        if (!fs.existsSync(adbBinary)) {
            console.log("ADB not found, downloading")
            await adbDeno.downloadADB(questOptions.adbOptions?.downloadPath)
        }

        const questSongFolder = `${QUEST_WIP_PATH}/${this.info.song.title}`;
        await adbDeno.mkdir(questSongFolder);

        const tasks = files.map(v => {
            const relativePath = path.relative(this.directory, v);
            console.log(`Uploading ${relativePath} to quest`)
            adbDeno.uploadFile(
                `${questSongFolder}/${relativePath}`,
                v,
                questOptions.adbOptions
            );
        })

        await Promise.all(tasks);
        RMLog(`"${this.info.song.title}" has been uploaded to quest!`)
    }
}
