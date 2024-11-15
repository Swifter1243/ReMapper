import { path } from '../deps.ts'
import {createInfo} from "./beatmap/info.ts";
import {ReMapperWorkspace} from "../internals/rm_workspace.ts";
import {WorkspaceInitialization} from "../types/remapper/rm_workspace.ts";

export async function createWorkspace(): Promise<ReMapperWorkspace>
export async function createWorkspace(initialization: WorkspaceInitialization): Promise<ReMapperWorkspace>
export async function createWorkspace(initialization?: WorkspaceInitialization) {
    const infoPath = path.join(initialization?.infoPath ?? Deno.cwd(), 'Info.dat')
    const info = await loadInfo(infoPath)
    const directory = path.dirname(infoPath)
    return new ReMapperWorkspace(info, directory, initialization?.bundleInfo)
}

async function loadInfo(path: string) {
    const infoText = await Deno.readTextFile(path)
    const infoJson = JSON.parse(infoText)
    return createInfo(infoJson)
}