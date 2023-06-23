/** All mods to suggest. */
export type SUGGEST_MODS =
    | 'Chroma'
    | 'Cinema'
/** All mods to require. */

export type REQUIRE_MODS =
    | 'Chroma'
    | 'Noodle Extensions'
/** All environment names. */
export type ENV_NAMES =
    | 'BTSEnvironment'
    | 'BigMirrorEnvironment'
    | 'BillieEnvironment'
    | 'CrabRaveEnvironment'
    | 'DefaultEnvironment'
    | 'DragonsEnvironment'
    | 'FitBeatEnvironment'
    | 'GagaEnvironment'
    | 'GreenDayEnvironment'
    | 'GreenDayGrenadeEnvironment'
    | 'InterscopeEnvironment'
    | 'KDAEnvironment'
    | 'KaleidoscopeEnvironment'
    | 'LinkinParkEnvironment'
    | 'MonstercatEnvironment'
    | 'NiceEnvironment'
    | 'OriginsEnvironment'
    | 'PanicEnvironment'
    | 'RocketEnvironment'
    | 'SkrillexEnvironment'
    | 'HalloweenEnvironment'
    | 'TimbalandEnvironment'
    | 'TriangleEnvironment'
    | 'WeaveEnvironment'
    | 'PyroEnvironment'
    | 'TheSecondEnvironment'
    | 'EDMEnvironment'
/** Cached data saved in the ReMapper cache. */
export type CachedData = {
    processing: string
    data: unknown
    accessed?: boolean
}
// TODO: If possible, try to figure out a way to default to a string with no extension or path
export type FILENAME<T extends string = string> = T | `${T}.${string}`
export type FILEPATH<T extends string = string> =
    | FILENAME<T>
    | `${string}/${FILENAME<T>}`
type DiffNameBase<T extends string> =
    | `Easy${T}`
    | `Normal${T}`
    | `Hard${T}`
    | `Expert${T}`
    | `ExpertPlus${T}`
/** All difficulty names. */
export type DIFFS =
    | DiffNameBase<'Standard'>
    | DiffNameBase<'NoArrows'>
    | DiffNameBase<'OneSaber'>
    | DiffNameBase<'360Degree'>
    | DiffNameBase<'90Degree'>
    | DiffNameBase<'Lightshow'>
    | DiffNameBase<'Lawless'>
/** Absolute or relative path to a difficulty. Extension is optional. */
export type DIFFPATH = FILEPATH<DIFFS>
/** Filename for a difficulty. Extension is optional. */
export type DIFFNAME = FILENAME<DIFFS>

// I literally don't know how to do this with Records
// deno-lint-ignore ban-types
export interface JsonWrapper<TV2 extends object, TV3 extends object> {
    toJson(v3: true): TV3

    toJson(v3: false): TV2

    toJson(v3: boolean): TV2 | TV3
}