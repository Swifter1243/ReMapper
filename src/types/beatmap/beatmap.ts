import { clearPropertyMap } from '../../constants/beatmap.ts'

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