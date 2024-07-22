import { getWorkingDirectory } from '../../../data/working_directory.ts'
import { path } from '../../../deps.ts'

/** Get the current directory of the Info.dat, based on the working directory. */
export function getInfoLocation() {
    return path.join(getWorkingDirectory(), 'Info.dat')
}
