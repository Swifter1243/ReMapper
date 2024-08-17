import { getActiveDifficulty } from '../../data/active_difficulty.ts'
import { adjustFog } from '../beatmap/object/environment/fog.ts'
import { arrayAdd } from '../array/operation.ts'
import { geometry } from '../../builder_functions/beatmap/object/environment/geometry.ts'
import { Vec3 } from '../../types/math/vector.ts'
import { ModelObject } from '../../types/model/object.ts'
import { GroupObjectTypes } from '../../types/model/model_scene/group.ts'
import { modelScene } from '../../builder_functions/model/model_scene.ts'
import { Transform } from '../../types/math/transform.ts'
import { fromType } from '../../builder_functions/beatmap/object/basic_event/light_event.ts'
import { vec } from '../array/tuple.ts'
import { getBaseEnvironment } from '../beatmap/object/environment/base_environment.ts'

/**
 * Debug the transformations necessary to fit an object to a cube.
 * Use the axis indicators to guide the process.
 * @param input Object to spawn.
 * @param transform The transform to apply to each object.
 * @param zoom Scales the object on each axis to inspect finer details.
 */
export async function debugFitObjectToUnitCube(
    input: GroupObjectTypes,
    transform: Transform,
    zoom = 1,
) {
    const diff = getActiveDifficulty()
    diff.clear(['Geometry Materials'])

    const center = vec(0, 10, 0)
    const planeDistance = 5
    const planeThickness = 0.0001
    const model: ModelObject[] = []

    getBaseEnvironment((env) => {
        env.position = [0, -69420, 0]
    })

    const lightType = 0
    const lightID = 1000
    fromType(lightType).on([300, 300, 300, 1], lightID).push(false)

    geometry({
        lightID,
        lightType,
        position: center,
        scale: [0.2, 0.2, 0.2],
        material: {
            shader: 'TransparentLight',
        },
    }).push()

    adjustFog({
        attenuation: 0.000001,
        startY: -69420,
    })

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

    type Position = Vec3
    type Scale = Vec3
    type Group = string
    type QuickObject = [Position, Scale?, Group?]

    function addObjects(objects: QuickObject[]) {
        objects.forEach((object) => {
            model.push({
                position: arrayAdd(object[0], center),
                rotation: [0, 0, 0],
                scale: object[1] ?? [1, 1, 1],
                group: object[2],
            })
        })
    }

    // Axis Planes
    addObjects([
        [[0, planeDistance, 0], [1, planeThickness, 1], 'debugCubeY'],
        [[0, -planeDistance, 0], [1, planeThickness, 1], 'debugCubeY'],
        [[planeDistance, 0, 0], [planeThickness, 1, 1], 'debugCubeX'],
        [[-planeDistance, 0, 0], [planeThickness, 1, 1], 'debugCubeX'],
        [[0, 0, planeDistance], [1, 1, planeThickness], 'debugCubeZ'],
        [[0, 0, -planeDistance], [1, 1, planeThickness], 'debugCubeZ'],
    ])

    // Object
    addObjects([
        [[0, zoom / 2 + planeDistance, 0], [1, zoom, 1]],
        [[0, -zoom / 2 - planeDistance, 0], [1, zoom, 1]],
        [[zoom / 2 + planeDistance, 0, 0], [zoom, 1, 1]],
        [[-zoom / 2 - planeDistance, 0, 0], [zoom, 1, 1]],
        [[0, 0, zoom / 2 + planeDistance], [1, 1, zoom]],
        [[0, 0, -zoom / 2 - planeDistance], [1, 1, zoom]],
    ])

    const scene = modelScene.static(model)
    scene.setDefaultObjectGroup(input, transform)
    scene.setObjectGroup('debugCubeX', geometry('Cube', 'debugCubeX'))
    scene.setObjectGroup('debugCubeY', geometry('Cube', 'debugCubeY'))
    scene.setObjectGroup('debugCubeZ', geometry('Cube', 'debugCubeZ'))
    await scene.instantiate()
}
