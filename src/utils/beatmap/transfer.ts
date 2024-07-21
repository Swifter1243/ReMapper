import { DIFFPATH } from '../../types/beatmap.ts'
import { AbstractDifficulty } from '../../internals/beatmap/abstract_beatmap.ts'

import {isEmptyObject} from "../object/check.ts";

import {readDifficulty} from "../../builder_functions/beatmap/difficulty.ts";
import {getActiveDifficulty, setActiveDifficulty} from "../../data/active_difficulty.ts";

export let currentTransfer: Promise<void>

/**
 * Transfer the visual aspect of maps to other difficulties.
 * @param diffs The difficulties being effected.
 * @param forDiff A function to run over each difficulty.
 * @param walls If true, walls with custom data will be overriden.
 * The activeDiff keyword will change to be each difficulty running during this function.
 * Be mindful that the external difficulties don't have an input/output structure,
 * so new pushed notes for example may not be cleared on the next run and would build up.
 */
export async function transferVisuals(
    diffs: DIFFPATH[] | DIFFPATH,
    forDiff?: (diff: AbstractDifficulty) => void,
    walls = true,
    arcs = true,
    colorSchemes = true,
) {
    await currentTransfer

    async function thisFunction() {
        const currentDiff = getActiveDifficulty()

        async function process(x: DIFFPATH) {
            const workingDiff = await readDifficulty(x)

            workingDiff.colorNotes = workingDiff.colorNotes
                .filter((x) => !(x.fake ?? false))
                .concat(currentDiff.colorNotes.filter((x) => (x.fake ?? false)))

            workingDiff.bombs = workingDiff.bombs
                .filter((x) => !(x.fake ?? false))
                .concat(currentDiff.bombs.filter((x) => (x.fake ?? false)))

            workingDiff.chains = workingDiff.chains
                .filter((x) => !(x.fake ?? false))
                .concat(currentDiff.chains.filter((x) => (x.fake ?? false)))

            if (arcs) workingDiff.arcs = currentDiff.arcs

            // TODO: V3 lighting_v3, note colors, fog

            workingDiff.lightEvents = currentDiff.lightEvents
            workingDiff.laserSpeedEvents = currentDiff.laserSpeedEvents
            workingDiff.ringZoomEvents = currentDiff.ringZoomEvents
            workingDiff.ringSpinEvents = currentDiff.ringSpinEvents
            workingDiff.rotationEvents = currentDiff.rotationEvents
            workingDiff.boostEvents = currentDiff.boostEvents
            workingDiff.abstractBasicEvents = currentDiff.abstractBasicEvents

            workingDiff.customEvents = currentDiff.customEvents

            workingDiff.pointDefinitions = currentDiff.pointDefinitions
            workingDiff.environment = currentDiff.environment
            workingDiff.geometry = currentDiff.geometry
            workingDiff.geometryMaterials = currentDiff.geometryMaterials

            if (colorSchemes) {
                workingDiff.info._customData ??= {}
                workingDiff.info._customData._colorLeft = currentDiff.info
                    ._customData?._colorLeft
                workingDiff.info._customData._colorRight = currentDiff.info
                    ._customData?._colorRight
                workingDiff.info._customData._envColorLeft = currentDiff.info
                    ._customData?._envColorLeft
                workingDiff.info._customData._envColorRight = currentDiff.info
                    ._customData?._envColorRight
                workingDiff.info._customData._envColorLeftBoost = currentDiff
                    .info
                    ._customData?._envColorLeftBoost
                workingDiff.info._customData._envColorRightBoost = currentDiff
                    .info
                    ._customData?._envColorRightBoost
                workingDiff.info._customData._envColorWhite = currentDiff.info
                    ._customData?._envColorWhite
                workingDiff.info._customData._envColorWhiteBoost = currentDiff
                    .info
                    ._customData?._envColorWhiteBoost
                workingDiff.info._customData._obstacleColor = currentDiff.info
                    ._customData?._obstacleColor
                if (isEmptyObject(workingDiff.info._customData)) {
                    delete workingDiff.info._customData
                }
            }

            if (walls) {
                workingDiff.walls = workingDiff.walls
                    .filter((x) => !x.isGameplayModded)
                    .concat(
                        currentDiff.walls.filter((x) => x.isGameplayModded),
                    )
            }

            if (forDiff !== undefined) forDiff(workingDiff)
            workingDiff.save()
        }

        const promises: Promise<void>[] = []

        const diffsArr = typeof diffs === 'object' ? diffs : [diffs]
        diffsArr.forEach((x) => {
            promises.push(process(x))
        })

        await Promise.all(promises)

        setActiveDifficulty(currentDiff)
    }

    currentTransfer = thisFunction()
    await currentTransfer
}
