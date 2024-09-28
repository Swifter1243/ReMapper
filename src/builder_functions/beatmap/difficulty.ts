import { AbstractDifficulty } from '../../internals/beatmap/abstract_beatmap.ts'
import { loadActiveInfo } from '../../data/active_info.ts'
import { V3Difficulty } from '../../internals/beatmap/beatmap_v3.ts'
import { V2Difficulty } from '../../internals/beatmap/beatmap_v2.ts'
import { bsmap, path, semver } from '../../deps.ts'
import {setActiveDifficulty} from "../../data/active_difficulty.ts";
import {attachWorkingDirectory, setWorkingDirectory, workingDirectoryExists} from "../../data/working_directory.ts";
import {parseFilePath} from "../../utils/file.ts";
import {tryGetDifficultyInfo} from "../../utils/beatmap/info/difficulty_set.ts";
import {DIFFICULTY_PATH} from "../../types/beatmap/file.ts";

/** Asynchronous function to read a difficulty. Not concerned with version. */
export async function readDifficulty(
    input: DIFFICULTY_PATH,
    output: DIFFICULTY_PATH,
): Promise<AbstractDifficulty> {
    if (
        workingDirectoryExists() && (
            path.isAbsolute(input) ||
            path.isAbsolute(output ?? '')
        )
    ) {
        throw 'A working directory is already defined and your difficulties are not in it.'
    }

    input = attachWorkingDirectory(input) as DIFFICULTY_PATH
    output = attachWorkingDirectory(output) as DIFFICULTY_PATH

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

    await loadActiveInfo()
    const infoData = tryGetDifficultyInfo(parsedOutput.name as bsmap.GenericFileName)
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
            infoData.difficultyInfo,
            json as bsmap.v3.IDifficulty,
        )
    } else {
        diff = new V2Difficulty(
            infoData.difficultyInfo,
            json as bsmap.v2.IDifficulty,
        )
    }

    setActiveDifficulty(diff)

    return diff
}
