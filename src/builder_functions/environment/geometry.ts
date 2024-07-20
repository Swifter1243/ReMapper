import { Geometry } from '../../internals/environment/geometry.ts'
import { GeometryMaterial, GeoType } from '../../types/environment.ts'

/**
 * Creates a new primitive object.
 * @param type The geometry shape type.
 * @param material The material on this geometry object.
 */
export function geometry(
    ...params: ConstructorParameters<typeof Geometry> | [
        type?: GeoType,
        material?: GeometryMaterial | string,
    ]
): Geometry {
    const [first] = params
    if (typeof first === 'object') {
        return new Geometry(first)
    }

    const [type, material] = params

    return new Geometry({
        type: type,
        material: material,
    })
}
