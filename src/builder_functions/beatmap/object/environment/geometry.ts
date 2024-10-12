import { Geometry } from '../../../../internals/beatmap/object/environment/geometry.ts'
import { GeometryMaterial, GeoType } from '../../../../types/beatmap/object/environment.ts'
import { AbstractDifficulty } from '../../../../internals/beatmap/abstract_beatmap.ts'

/**
 * Creates a new primitive object.
 * @param parentDifficulty The difficulty to push this geometry to.
 * @param type The geometry shape type.
 * @param material The material on this geometry object.
 */
export function geometry(
    parentDifficulty: AbstractDifficulty,
    type?: GeoType,
    material?: GeometryMaterial | string,
): Geometry
export function geometry(
    ...params: ConstructorParameters<typeof Geometry>
): Geometry
export function geometry(
    ...params: ConstructorParameters<typeof Geometry> | [
        parentDifficulty: AbstractDifficulty,
        type?: GeoType,
        material?: GeometryMaterial | string,
    ]
): Geometry {
    if (typeof params[1] === 'object') {
        const [diff, obj] = params
        return new Geometry(diff, obj)
    }

    const [parentDifficulty, type, material] = params

    return new Geometry(parentDifficulty, {
        type,
        material,
    })
}
