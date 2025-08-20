import { AbstractInfo } from './beatmap/info/abstract_info.ts'
import { AbstractDifficulty } from './beatmap/abstract_difficulty.ts'
import { V2Info } from './beatmap/info/info_v2.ts'
import {PipelineExportOptions, PipelineQuestOptions, PipelineZipOptions} from '../types/remapper/pipeline.ts'
import { BundleInfo } from '../types/bundle.ts'
import { applyCRCsToInfo } from '../utils/vivify/bundle/load.ts'
import { REMAPPER_VERSION } from '../constants/package.ts'
import { RMError, RMLog } from '../utils/rm_log.ts'
import { QUEST_WIP_PATH } from '../constants/file.ts'
import {adbDeno, compress, fs, path} from '../deps.ts'

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
        const outputDirectory = options.outputDirectory
        if (path.resolve(outputDirectory) === path.resolve(inputDirectory)) {
            throw new Error('You are trying to export a pipeline into it\'s own directory!')
        }

        const filesToCopy: MovedFile[] = []
        const filesToWrite: MovedFile[] = []
        const ensureFilesExistPromises: Promise<void>[] = []

        function addTextFile(file: string, contents: string) {
            const newDirectory = path.join(outputDirectory, path.basename(file))
            filesToWrite.push({
                old: contents,
                new: newDirectory
            })
        }

        function addCopiedFile(file: string, required = true) {
            const newDirectory = path.join(outputDirectory, path.basename(file))
            const fileToCopy = path.join(inputDirectory, path.basename(file))
            const promise = ensureFileExists({
                old: fileToCopy,
                new: newDirectory
            }, required)
            ensureFilesExistPromises.push(promise)
        }

        async function ensureFileExists(file: MovedFile, required = true) {
            const exists = await fs.exists(file.old)

            if (required && !exists) {
                throw new Error(`The file "${file.old}" does not exist.`)
            }
            if (exists) {
                filesToCopy.push(file)
            }
        }

        // Add info
        addTextFile('Info.dat', this.info.toFinalString())
        addCopiedFile(this.info.coverImageFilename, false)
        addCopiedFile(this.info.audio.songFilename)

        // Add contributors
        if (this.info.contributors) {
            this.info.contributors.map((c) => addCopiedFile(c._iconPath))
        }

        // Add bundle
        if (this.bundleInfo) {
            this.bundleInfo.default.bundleFiles.forEach((f) => addCopiedFile(f))
        }

        // Add diffs
        const diffProcess = Object.values(this.info.difficultyBeatmaps).map(async (difficultyInfo) => {
            const diff = this.activeDifficulties.values().find((x) => x.difficultyInfo === difficultyInfo)

            if (diff) {
                const diffString = await diff.toFinalString()
                addTextFile(difficultyInfo.beatmapDataFilename, diffString)
            } else {
                addCopiedFile(difficultyInfo.beatmapDataFilename)
            }
        })
        await Promise.all(diffProcess)

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

        if (this.bundleInfo) {
            if (!this.bundleInfo.default.isCompressed) {
                RMError(
                    'Warning: You are trying to distribute uncompressed bundles. It is recommended that you export these bundles as compressed if you plan to distribute them.',
                )
            }

            if (!zipOptions.includeBundles) {
                // remove bundles
                files = files.filter((f) => !path.parse(f).name.includes('bundle'))
            }
        }
        else {
            if (zipOptions.includeBundles) {
                throw new Error("You are trying to zip bundles, but the pipeline has no bundleInfo! It should have been passed in 'createPipeline'.")
            }
        }

        // surround with quotes for safety
        files = files.map(f => `"${f}"`)

        const success = await compress(files, zipName, { overwrite: true })

        if (!(await fs.exists(zipName)) && zipOptions.includeBundles) {
            RMError(`${zipName} was not able to be saved. This is likely because Beat Saber had a lock on your bundles, preventing them from being zipped. Exit the level and try again.`)
        }
        else {
            if (success) {
                RMLog(`"${zipName}" has been zipped!`)
            } else {
                RMError(`Something went wrong when zipping ${zipName}`)
            }
        }
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
