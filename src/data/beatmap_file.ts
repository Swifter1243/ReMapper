import { asserts, bsmap, path, semver } from '../deps.ts'

import { DIFFNAME, DIFFPATH } from '../types/beatmap_types.ts'

import { parseFilePath } from '../general.ts'
import { AbstractDifficulty } from '../beatmap/abstract_beatmap.ts'
import { V3Difficulty } from '../beatmap/beatmap_v3.ts'
import { V2Difficulty } from '../beatmap/beatmap_v2.ts'
import {
    attachWorkingDirectory,
    setActiveDifficulty,
    setWorkingDirectory,
    workingDirectoryExists,
} from './beatmap_handler.ts'
import { getInfoDifficultySets } from './info_file.ts'
import { loadInfoDat } from '../mod.ts'

/** Asynchronous function to read a difficulty. Not concerned with version. */
export async function readDifficulty(
    input: DIFFPATH,
    output?: DIFFPATH,
    process: boolean = true,
): Promise<AbstractDifficulty> {
    if (
        workingDirectoryExists() && (
            path.isAbsolute(input) ||
            path.isAbsolute(output ?? '')
        )
    ) {
        throw 'A working directory is already defined and your difficulties are not in it.'
    }

    input = attachWorkingDirectory(input) as DIFFPATH
    output = attachWorkingDirectory(output ?? input) as DIFFPATH

    const parsedInput = await parseFilePath(input, '.dat')
    const parsedOutput = await parseFilePath(output, '.dat', false)

    if (parsedInput.dir && !workingDirectoryExists()) {
        const workingDirectory = path.isAbsolute(parsedInput.path)
            ? parsedInput.dir
            : path.join(Deno.cwd(), parsedInput.dir)

        setWorkingDirectory(workingDirectory)
    }

    if (parsedOutput.dir && !workingDirectoryExists()) {
        const workingDirectory = path.isAbsolute(parsedOutput.path)
            ? parsedOutput.dir
            : path.join(Deno.cwd(), parsedOutput.dir)

        setWorkingDirectory(workingDirectory)
    }

    if (!workingDirectoryExists()) {
        setWorkingDirectory(Deno.cwd())
    }

    const jsonPromise = Deno.readTextFile(parsedInput.path)

    await loadInfoDat()
    const infoData = getInfoDifficultySets(parsedOutput.name as DIFFNAME)
    const json = JSON.parse(await jsonPromise) as
        | bsmap.v2.IDifficulty
        | bsmap.v3.IDifficulty

    const v3 = Object.hasOwn(json, 'version') &&
        // lazy
        // deno-lint-ignore no-explicit-any
        semver.satisfies((json as any)['version'], '>=3.0.0')

    let diff: AbstractDifficulty

    if (v3) {
        // TODO: Uncomment, breaks benchmark
        diff = new V3Difficulty(
            infoData.diffSet,
            infoData.diffSetMap,
            json as bsmap.v3.IDifficulty,
        )
    } else {
        diff = new V2Difficulty(
            infoData.diffSet,
            infoData.diffSetMap,
            json as bsmap.v2.IDifficulty,
        )
    }

    setActiveDifficulty(diff)

    return diff
}

/** Read a V2 beatmap. */
export async function readDifficultyV2(
    ...params: Parameters<typeof readDifficulty>
) {
    const diff = await readDifficulty(...params)

    asserts.assertInstanceOf(
        diff,
        V2Difficulty,
        `Not a v2 difficulty! ${diff.version}`,
    )

    return diff
}

/** Read a V3 beatmap. */
export async function readDifficultyV3(
    ...params: Parameters<typeof readDifficulty>
) {
    const diff = await readDifficulty(...params)

    asserts.assertInstanceOf(
        diff,
        V3Difficulty,
        `Not a v3 difficulty! ${diff.version}`,
    )

    return diff
}
