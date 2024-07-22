import {DeepReadonly} from "../../../types/util/mutability.ts";
import {RuntimePointDefinitionBoundless} from "../../../types/animation/keyframe/runtime/boundless.ts";

/** Determine if keyframes are considered "runtime",
 * e.g. it contains properties such as "baseHeadLocalPosition" which are only evaluated at runtime. */
export function areKeyframesRuntime(
    keyframes: DeepReadonly<RuntimePointDefinitionBoundless>,
) {
    if (typeof keyframes === 'string') return false

    // ["runtime"]
    if (typeof keyframes === 'object' && typeof keyframes[0] === 'string') return true

    return keyframes.some((inner) => {
        if (typeof inner === 'object') {
            // [["runtime", 0]]
            if (typeof inner[0] === 'string') return true

            // [[..., [..., "op"], t]
            return inner.some(e => {
                if (typeof e === 'object') {
                    const last = e[e.length - 1]
                    return typeof last === 'string'
                }
            })
        } else {
            return false
        }
    })
}
