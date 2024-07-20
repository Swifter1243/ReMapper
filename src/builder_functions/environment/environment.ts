import * as EnvironmentInternals from '../../internals/environment/environment.ts'
import { LookupMethod } from '../../types/environment.ts'

/**
 * Targets an existing object in the environment.
 * @param id The object name to look up in the environment.
 * @param lookupMethod The method of looking up the object name in the environment.
 */
export function environment(
    ...params:
        | ConstructorParameters<typeof EnvironmentInternals.Environment>
        | [
            id?: string,
            lookupMethod?: LookupMethod,
        ]
): EnvironmentInternals.Environment {
    const [first] = params
    if (typeof first === 'object') {
        return new EnvironmentInternals.Environment(first)
    }

    const [id, lookupMethod] = params

    return new EnvironmentInternals.Environment({
        id: id as string,
        lookupMethod: lookupMethod,
    })
}
