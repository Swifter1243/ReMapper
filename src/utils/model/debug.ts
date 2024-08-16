import { getActiveDifficulty } from '../../data/active_difficulty.ts'
import { adjustFog } from '../beatmap/object/environment/fog.ts'
import { environment } from '../../builder_functions/beatmap/object/environment/environment.ts'
import { arrayAdd } from '../array/operation.ts'
import { geometry } from '../../builder_functions/beatmap/object/environment/geometry.ts'
import {Vec3} from "../../types/math/vector.ts";
import {ModelObject} from "../../types/model/object.ts";
import {GroupObjectTypes} from "../../types/model/model_scene/group.ts";
import {modelScene} from "../../builder_functions/model/model_scene.ts";
import {Transform} from "../../types/math/transform.ts";
import { fromType } from '../../builder_functions/beatmap/object/basic_event/light_event.ts'
import { vec } from '../array/tuple.ts'

/**
 * Debug the transformations necessary to fit an object to a cube.
 * Use the axis indicators to guide the process.
 * @param input Object to spawn.
 * @param resolution The scale of the object for each axis.
 * @param transform The transform to apply to each object.
 */
export async function debugModelPiece(
    input: GroupObjectTypes,
    resolution: number,
    transform?: Transform
) {
    const diff = getActiveDifficulty()
    diff.clear(['Geometry Materials'])

    const lightType = 0
    const lightID = 1000
    fromType(lightType).on([300, 300, 300, 1], lightID).push(false)

    const center = vec(0, 10, 0)
    const axisDist = 5

    adjustFog({
        attenuation: 0.000001,
        startY: -69420,
    })

    geometry({
        lightID,
        lightType,
        position: center,
        scale: [0.2, 0.2, 0.2],
        material: {
            shader: 'TransparentLight'
        }
    }).push()

    environment({
        id: 'NarrowGameHUD',
        lookupMethod: 'EndsWith',
        active: false,
    }).push()

    diff.geometryMaterials.debugCubeX = {
        shader: 'Standard',
        color: [1, 0, 0],
        shaderKeywords: [],
    }

    diff.geometryMaterials.debugCubeY = {
        shader: 'Standard',
        color: [0, 1, 0],
        shaderKeywords: [],
    }

    diff.geometryMaterials.debugCubeZ = {
        shader: 'Standard',
        color: [0, 0, 1],
        shaderKeywords: [],
    }

    const modelData: ModelObject[] = []

    function addCubes(transforms: [Vec3, Vec3?, string?][], track?: string) {
        transforms.forEach((transform) => {
            const data: ModelObject = {
                position: arrayAdd(transform[0], center) as Vec3,
                rotation: [0, 0, 0],
                scale: transform[1] ?? [1, 1, 1],
            }

            if (track) data.group = track
            if (transform[2]) data.group = transform[2]

            modelData.push(data)
        })
    }

    // Debug
    addCubes([
        [[0, axisDist, 0], [1, 0.0001, 1], 'debugCubeY'],
        [[0, -axisDist, 0], [1, 0.0001, 1], 'debugCubeY'],
        [[axisDist, 0, 0], [0.0001, 1, 1], 'debugCubeX'],
        [[-axisDist, 0, 0], [0.0001, 1, 1], 'debugCubeX'],
        [[0, 0, axisDist], [1, 1, 0.0001], 'debugCubeZ'],
        [[0, 0, -axisDist], [1, 1, 0.0001], 'debugCubeZ'],
    ])

    // Object
    addCubes([
        [[0, resolution / 2 + axisDist, 0], [1, resolution, 1]],
        [[0, -resolution / 2 - axisDist, 0], [1, resolution, 1]],
        [[resolution / 2 + axisDist, 0, 0], [resolution, 1, 1]],
        [[-resolution / 2 - axisDist, 0, 0], [resolution, 1, 1]],
        [[0, 0, resolution / 2 + axisDist], [1, 1, resolution]],
        [[0, 0, -resolution / 2 - axisDist], [1, 1, resolution]],
    ])

    const scene = modelScene.static(modelData)
    scene.setDefaultGroup(input, transform)
    scene.setObjectGroup('debugCubeX', geometry('Cube', 'debugCubeX'))
    scene.setObjectGroup('debugCubeY', geometry('Cube', 'debugCubeY'))
    scene.setObjectGroup('debugCubeZ', geometry('Cube', 'debugCubeZ'))
    await scene.instantiate()
}
