import { path } from '../deps.ts'
import {WorkspaceInput} from "../types/remapper/rm_workspace.ts";
import {createInfo} from "./beatmap/info.ts";
import {ReMapperWorkspace} from "../internals/rm_workspace.ts";

export async function createWorkspace(input: WorkspaceInput) {
    const inputDirectory = input.inputDirectory ?? Deno.cwd()
    const infoPath = path.join(inputDirectory, 'Info.dat')
    const info = await loadInfo(infoPath)
    return new ReMapperWorkspace(info, inputDirectory, input.outputDirectory)
}

async function loadInfo(path: string) {
    const infoText = Deno.readTextFile(path)
    const infoJson = JSON.parse(await infoText)
    return createInfo(infoJson)
}