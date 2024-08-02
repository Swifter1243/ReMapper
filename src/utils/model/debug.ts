import { getActiveDifficulty } from '../../data/active_difficulty.ts'
import { backLasers } from '../../builder_functions/beatmap/object/basic_event/light_event.ts'
import { adjustFog } from '../beatmap/object/environment/fog.ts'
import { environment } from '../../builder_functions/beatmap/object/environment/environment.ts'
import { arrayAdd } from '../array/operation.ts'
import { geometry } from '../../builder_functions/beatmap/object/environment/geometry.ts'
import {Vec3} from "../../types/math/vector.ts";
import {ModelObject} from "../../types/model/object.ts";
import {GroupObjectTypes} from "../../types/model/model_scene/group.ts";
import {modelScene} from "../../builder_functions/model/model_scene.ts";

/**
 * Debug the transformations necessary to fit an object to a cube.
 * Use the axis indicators to guide the process.
 * @param input Object to spawn.
 * @param resolution The scale of the object for each axis.
 * @param scale The scale multiplier for the spawned object previously mentioned.
 * @param anchor The anchor offset for the spawned object previously mentioned.
 * @param rotation The rotation offset for the spawned object previously mentioned.
 */
export async function debugObject(
    input: GroupObjectTypes,
    resolution: number,
    scale?: Vec3,
    anchor?: Vec3,
    rotation?: Vec3,
) {
    const diff = getActiveDifficulty()
    diff.clear(['Geometry Materials'])

    backLasers().on([3, 3, 3, 1]).push(false)

    adjustFog({
        attenuation: 0.000001,
        startY: 0,
    })

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
                position: arrayAdd(transform[0], [0, 10, 0]) as Vec3,
                rotation: [0, 0, 0],
                scale: transform[1] ?? [1, 1, 1],
            }

            if (track) data.group = track
            if (transform[2]) data.group = transform[2]

            modelData.push(data)
        })
    }

    const axisDist = 5

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
    scene.setDefaultGroup(input, scale, anchor, rotation)
    scene.addObjectGroup('debugCubeX', geometry('Cube', 'debugCubeX'))
    scene.addObjectGroup('debugCubeY', geometry('Cube', 'debugCubeY'))
    scene.addObjectGroup('debugCubeZ', geometry('Cube', 'debugCubeZ'))
    await scene.instantiate()
}
