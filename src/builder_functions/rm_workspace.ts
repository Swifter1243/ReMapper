import { path } from '../deps.ts'
import {createInfo} from "./beatmap/info.ts";
import {ReMapperWorkspace} from "../internals/rm_workspace.ts";

export async function createWorkspace(infoPath?: string) {
    infoPath ??= path.join(Deno.cwd(), 'Info.dat')
    const directory = path.dirname(infoPath)
    const info = await loadInfo(directory)
    return new ReMapperWorkspace(info, directory)
}

async function loadInfo(path: string) {
    const infoText = Deno.readTextFile(path)
    const infoJson = JSON.parse(await infoText)
    return createInfo(infoJson)
}