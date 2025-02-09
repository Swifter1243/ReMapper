import { Regex } from '../../../../utils/beatmap/object/environment/regex.ts'

/** Used for building regex statements for environment objects.
 * ```ts
 * rm.regex("Parent").separate().add("Child").end()
 * // "Parent\.\[\d*\]Child$"
 * ```
 */
export function regex(...params: ConstructorParameters<typeof Regex>) {
    return new Regex(...params)
}