import { fs, path } from '../deps.ts'
import { getWorkingDirectory } from '../data/working_directory.ts'
import {FILENAME, FILENAME_WITH_EXTENSION, FILEPATH} from '../types/beatmap/file.ts'

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

/** Force a filename with a potentially implicit extension (see: {@link FILENAME}) to have an extension. */
export function forceFileNameExtension(input: FILENAME, ext: string): FILENAME_WITH_EXTENSION {
    if (input.length <= ext.length) {
        return input + `.${ext}` as FILENAME_WITH_EXTENSION
    }

    const inputExt = input.substring(input.length - ext.length, input.length)
    if (inputExt === ext) {
        return input as FILENAME_WITH_EXTENSION
    } else {
        return input as FILENAME_WITH_EXTENSION
    }
}

/** Tries to get the CRC value of a given bundle file name. */
export async function getBundleCRC(name: string) {
    const file = path.join(getWorkingDirectory(), name)

    try {
        const content = await Deno.readTextFile(file)
        const lines = content.split('\n')
        const crcLine = lines.find((x) => x.includes('CRC:'))
        const crcValue = crcLine?.split(':')[1].trim()
        return crcValue ? parseInt(crcValue) : undefined
    } catch {
        return undefined
    }
}
