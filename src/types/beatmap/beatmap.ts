import { clearPropertyMap } from '../../data/constants/beatmap.ts'

/** All mods that can be suggested. */
export type SUGGEST_MODS =
    | 'Chroma'
    | 'Cinema'

/** All mods that can be required. */
export type REQUIRE_MODS =
    | 'Chroma'
    | 'Noodle Extensions'
    | 'Vivify'

/** A property representing something that can be cleared in a beatmap. */
export type ClearProperty = Exclude<
    typeof clearPropertyMap[keyof typeof clearPropertyMap],
    undefined
>

/**
 * @returns null if remove value
 */
export type PostProcessFn = (
    this: unknown,
    key: string,
    value: unknown,
) => unknown | null