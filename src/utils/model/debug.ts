import { adjustFog } from '../beatmap/object/environment/fog.ts'
import { arrayAdd } from '../array/operation.ts'
import { geometry } from '../../builder_functions/beatmap/object/environment/geometry.ts'
import { Vec3 } from '../../types/math/vector.ts'
import { ModelObject } from '../../types/model/object.ts'
import { GroupObjectTypes } from '../../types/model/model_scene/group.ts'
import { modelScene } from '../../builder_functions/model/model_scene.ts'
import { Transform } from '../../types/math/transform.ts'
import { vec } from '../array/tuple.ts'
import { getBaseEnvironment } from '../beatmap/object/environment/base_environment.ts'
import {AbstractDifficulty} from "../../internals/beatmap/abstract_beatmap.ts";
import {ModelSceneSettings} from "./model_scene/settings.ts";
import {lightEvent} from "../../builder_functions/beatmap/object/basic_event/light_event.ts";

/**
 * Debug the transformations necessary to fit an object to a cube.
 * Use the axis indicators to guide the process.
 * @param difficulty Difficulty to run the debug on.
 * @param input Object to spawn.
 * @param transform The transform to apply to each object.
 * @param zoom Scales the object on each axis to inspect finer details.
 */
export async function debugFitObjectToUnitCube(
    difficulty: AbstractDifficulty,
    input: GroupObjectTypes,
    transform: Transform,
    zoom = 1,
) {
    difficulty.clear(['Geometry Materials'])

    const center = vec(0, 10, 0)
    const planeDistance = 5
    const planeThickness = 0.0001
    const model: ModelObject[] = []

    getBaseEnvironment(difficulty, (env) => {
        env.position = [0, -69420, 0]
    })

    const lightType = 0
    const lightID = 1000
    lightEvent(difficulty, 0, lightType).on([300, 300, 300, 1], lightID)

    geometry(difficulty,{
        lightID,
        lightType,
        position: center,
        scale: [0.2, 0.2, 0.2],
        material: {
            shader: 'TransparentLight',
        },
    })

    adjustFog(difficulty,{
        attenuation: 0.000001,
        startY: -69420,
    })

    difficulty.geometryMaterials.debugCubeX = {
        shader: 'Standard',
        color: [1, 0, 0],
        shaderKeywords: [],
    }

    difficulty.geometryMaterials.debugCubeY = {
        shader: 'Standard',
        color: [0, 1, 0],
        shaderKeywords: [],
    }

    difficulty.geometryMaterials.debugCubeZ = {
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

    const sceneSettings = new ModelSceneSettings()
    sceneSettings.setDefaultObjectGroup(input, transform)
    sceneSettings.setObjectGroup('debugCubeX', geometry(difficulty,'Cube', 'debugCubeX'))
    sceneSettings.setObjectGroup('debugCubeY', geometry(difficulty,'Cube', 'debugCubeY'))
    sceneSettings.setObjectGroup('debugCubeZ', geometry(difficulty,'Cube', 'debugCubeZ'))
    await modelScene.static(sceneSettings, model).instantiate(difficulty)
}
