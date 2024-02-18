import {
    GeometryMaterial,
    GeoType,
    LookupMethod,
} from '../types/mod.ts'

import * as EnvironmentInternals from '../internals/environment.ts'

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