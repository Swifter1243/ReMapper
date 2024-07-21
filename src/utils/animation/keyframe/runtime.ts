import { DeepReadonly } from '../../../types/util.ts'
import { RuntimePointDefinitionAny } from '../../../types/animation.ts'

/** Determine if keyframes are considered "runtime",
 * e.g. it contains properties such as "baseHeadLocalPosition" which are only evaluated at runtime. */
export function areKeyframesRuntime(
    keyframes: DeepReadonly<RuntimePointDefinitionAny>,
) {
    if (typeof keyframes === 'string') return false

    if (keyframes.some((x) => typeof x === 'string')) return true

    const json = JSON.stringify(keyframes)

    // this is scuffed as fuck.
    if (json.includes('op') || json.includes('base')) return true

    return false
}
