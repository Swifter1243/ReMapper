import { adbDeno } from "../../deps.ts"
import {BundleInfo} from "../bundle.ts";

export type PipelineInitialization = {
    /** The path to the Info.dat of the beatmap. Leave undefined to use the Info.dat in the current directory. */
    infoPath?: string,
    /** Asset bundle info to include in the Info.dat. */
    bundleInfo?: BundleInfo
}

export type PipelineExportOptions = {
    /** The directory where this map should be exported to. */
    outputDirectory: string,
    /** The name of the folder which will be outputted into {@link outputDirectory}. Defaults to the folder name of {@link directory}. */
    outputFolderName?: string
    /** Export the map to a zip. */
    zip?: PipelineZipOptions
    /**
     * Automatically upload the map files to quest, including only necessary files.
     *
     * They will be uploaded to the song WIP folder, {@link QUEST_WIP_PATH}
     * */
    quest?: {
        /** Options to pass to ADB */
        adbOptions: adbDeno.InvokeADBOptions
    }
}

export type PipelineZipOptions = {
    /** Name of the .zip. */
    name: string,
    /** Add bundles to the zip. Only do this if you're distributing to friends, don't include these files in a BeatSaver upload. */
    includeBundles?: boolean
}