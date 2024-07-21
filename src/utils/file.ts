import { fs, path } from '../deps.ts'
import { FILENAME, FILEPATH } from '../types/beatmap.ts'

/**
 * Parse a file path, allowing extension forcing and getting useful information.
 * @param input Input path. Can be relative or absolute.
 * @param ext Force extension on the file.
 * @param error Throw an error if the file doesn't exist.
 */
export async function parseFilePath(
    input: FILEPATH,
    ext?: `.${string}`,
    error = true,
) {
    if (ext && !path.extname(input)) input += ext

    if (error && !await fs.exists(input)) {
        throw new Error(`The file "${input}" does not exist`)
    }

    const output: { name: FILENAME; path: FILEPATH; dir?: string } = {
        name: path.basename(input),
        path: input,
    }

    const dir = path.dirname(input)
    if (dir !== '.') output.dir = dir

    return output
}
