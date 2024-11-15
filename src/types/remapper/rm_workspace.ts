import { adbDeno } from "../../deps.ts"
import {BundleInfo} from "../bundle.ts";

export type WorkspaceInitialization = {
    /** The path to the Info.dat of the beatmap. Leave undefined to use the Info.dat in the current directory. */
    infoPath?: string,
    /** Asset bundle info to include in the Info.dat. */
    bundleInfo?: BundleInfo
}

export type WorkspaceExportOptions = {
    /** The directory where this map should be exported to. */
    outputDirectory: string,
    /** Export the map to a zip. */
    zip?: {
        /** Name of the .zip. Defaults to the map name. */
        name?: string,
        /** Add bundles to the zip. Only do this if you're distributing to friends, don't include these files in a BeatSaver upload. */
        includeBundles?: boolean
    }
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