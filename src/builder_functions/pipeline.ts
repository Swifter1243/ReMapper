import { path } from '../deps.ts'
import {createInfo} from "./beatmap/info.ts";
import {Pipeline} from "../internals/pipeline.ts";
import {PipelineInitialization} from "../types/remapper/pipeline.ts";

export async function createPipeline(): Promise<Pipeline>
export async function createPipeline(initialization: PipelineInitialization): Promise<Pipeline>
export async function createPipeline(initialization?: PipelineInitialization) {
    const infoPath = initialization?.infoPath ?? path.join(Deno.cwd(), 'Info.dat')
    const info = await loadInfo(infoPath)
    const directory = path.dirname(infoPath)
    return new Pipeline(info, directory, initialization?.bundleInfo)
}

async function loadInfo(path: string) {
    const infoText = await Deno.readTextFile(path)
    const infoJson = JSON.parse(infoText)
    return createInfo(infoJson)
}