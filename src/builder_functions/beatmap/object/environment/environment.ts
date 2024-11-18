import type { AbstractDifficulty } from '../../../../internals/beatmap/abstract_difficulty.ts'
import * as EnvironmentInternals from '../../../../internals/beatmap/object/environment/environment.ts'
import { LookupMethod } from '../../../../types/beatmap/object/environment.ts'

/**
 * Targets an existing object in the environment.
 * @param parentDifficulty The difficulty to push this environment statement to.
 * @param id The object name to look up in the environment.
 * @param lookupMethod The method of looking up the object name in the environment.
 */
export function environment(
    parentDifficulty: AbstractDifficulty,
    id?: string,
    lookupMethod?: LookupMethod,
): EnvironmentInternals.Environment
export function environment(
    ...params: ConstructorParameters<typeof EnvironmentInternals.Environment>
): EnvironmentInternals.Environment
export function environment(
    ...params:
        | ConstructorParameters<typeof EnvironmentInternals.Environment>
        | [
            parentDifficulty: AbstractDifficulty,
            id?: string,
            lookupMethod?: LookupMethod,
        ]
): EnvironmentInternals.Environment {
    if (typeof params[1] === 'object') {
        const [diff, obj] = params
        return new EnvironmentInternals.Environment(diff, obj)
    }

    const [parentDifficulty, id, lookupMethod] = params

    return new EnvironmentInternals.Environment(parentDifficulty, {
        id,
        lookupMethod,
    })
}
