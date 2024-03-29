import { GeometryMaterial, GeoType, LookupMethod } from '../types/mod.ts'

import * as EnvironmentInternals from '../internals/environment.ts'

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

/**
 * Creates a new primitive object.
 * @param type The geometry shape type.
 * @param material The material on this geometry object.
 */
export function geometry(
    ...params: ConstructorParameters<typeof EnvironmentInternals.Geometry> | [
        type?: GeoType,
        material?: GeometryMaterial | string,
    ]
): EnvironmentInternals.Geometry {
    const [first] = params
    if (typeof first === 'object') {
        return new EnvironmentInternals.Geometry(first)
    }

    const [type, material] = params

    return new EnvironmentInternals.Geometry({
        type: type,
        material: material,
    })
}
