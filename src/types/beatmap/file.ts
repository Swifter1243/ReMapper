type DiffNameBase =
    | 'Easy'
    | 'Normal'
    | 'Hard'
    | 'Expert'
    | 'ExpertPlus'

type DiffNameCharacteristic =
    | 'Standard'
    | 'NoArrows'
    | 'OneSaber'
    | '360Degree'
    | '90Degree'
    | 'Lightshow'
    | 'Lawless'

/** All difficulty names. */
export type DIFFICULTY_NAME = `${DiffNameBase}${DiffNameCharacteristic}`

// TODO: If possible, try to figure out a way to default to a string with no extension or path
/** File name. `file.ext` */
export type FILENAME<T extends string = string> = T | `${T}.${string}`

/** File path, relative or absolute. `file.ext`, `src/file.ext`, or `C:/file.ext` */
export type FILEPATH<T extends string = string> =
    | FILENAME<T>
    | `${string}/${FILENAME<T>}`

/** Absolute or relative path to a difficulty. Extension is optional. */
export type DIFFICULTY_PATH = FILEPATH<DIFFICULTY_NAME>

/** Filename for a difficulty. Extension is optional. */
export type DIFFICULTY_FILENAME = FILENAME<DIFFICULTY_NAME>
