import { getWorkingDirectory } from '../../data/working_directory.ts'
import { path } from '../../deps.ts'

/** Get the path of RM_Cache.object */
export function getCacheLocation() {
    return path.join(getWorkingDirectory(), 'RM_Cache.object')
}
