import {BundleInfo} from "../bundle.ts";
import { adbDeno } from "../../deps.ts"

export type WorkspaceInput = {
    /** The location of the input map. Leave undefined to use Deno's current workspace. */
    inputDirectory?: string
    /** The location of the output map. */
    outputDirectory: string,
}

export type WorkspaceExport = {
    /** Export the map to a zip. */
    zip?: {
        /** Name of the .zip. Defaults to the map name. */
        name?: string,
        /** Include information about a bundle build in order to add the corresponding bundles to the zip. Only do this if you're distributing to friends, don't include these files in a BeatSaver upload. */
        bundleInfo?: BundleInfo
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