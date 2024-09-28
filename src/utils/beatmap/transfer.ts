import { AbstractDifficulty } from '../../internals/beatmap/abstract_beatmap.ts'

import {readDifficulty} from "../../builder_functions/beatmap/difficulty.ts";
import {getActiveDifficulty, setActiveDifficulty} from "../../data/active_difficulty.ts";
import {DIFFICULTY_PATH} from "../../types/beatmap/file.ts";

export let currentTransfer: Promise<void>

/**
 * Transfer the visual aspect of maps to other difficulties.
 * @param diffs The difficulties being effected.
 * @param forDiff A function to run over each difficulty.
 * @param walls If true, walls with custom properties will be overriden.
 * The activeDiff keyword will change to be each difficulty running during this function.
 * Be mindful that the external difficulties don't have an input/output structure,
 * so new pushed notes for example may not be cleared on the next run and would build up.
 * @param arcs Whether to clone arcs.
 * @param colorSchemes Whether to clone color schemes.
 */
export async function transferVisuals(
    diffs: DIFFICULTY_PATH[] | DIFFICULTY_PATH,
    forDiff?: (diff: AbstractDifficulty) => void,
    walls = true,
    arcs = true,
    colorSchemes = true,
) {
    await currentTransfer

    async function thisFunction() {
        const activeDiff = getActiveDifficulty()

        async function process(x: DIFFICULTY_PATH) {
            const processingDiff = await readDifficulty(x, x)

            processingDiff.colorNotes = processingDiff.colorNotes
                .filter((x) => !(x.fake ?? false))
                .concat(activeDiff.colorNotes.filter((x) => (x.fake ?? false)))

            processingDiff.bombs = processingDiff.bombs
                .filter((x) => !(x.fake ?? false))
                .concat(activeDiff.bombs.filter((x) => (x.fake ?? false)))

            processingDiff.chains = processingDiff.chains
                .filter((x) => !(x.fake ?? false))
                .concat(activeDiff.chains.filter((x) => (x.fake ?? false)))

            if (arcs) processingDiff.arcs = activeDiff.arcs

            // TODO: V3 lighting_v3, note colors, fog

            processingDiff.lightEvents = activeDiff.lightEvents
            processingDiff.laserSpeedEvents = activeDiff.laserSpeedEvents
            processingDiff.ringZoomEvents = activeDiff.ringZoomEvents
            processingDiff.ringSpinEvents = activeDiff.ringSpinEvents
            processingDiff.rotationEvents = activeDiff.rotationEvents
            processingDiff.boostEvents = activeDiff.boostEvents
            processingDiff.abstractBasicEvents = activeDiff.abstractBasicEvents

            processingDiff.customEvents = activeDiff.customEvents

            processingDiff.pointDefinitions = activeDiff.pointDefinitions
            processingDiff.environment = activeDiff.environment
            processingDiff.geometry = activeDiff.geometry
            processingDiff.geometryMaterials = activeDiff.geometryMaterials

            if (colorSchemes) {
                processingDiff.difficultyInfo.beatmapColorSchemeIdx = activeDiff.difficultyInfo.beatmapColorSchemeIdx
            }

            if (walls) {
                processingDiff.walls = processingDiff.walls
                    .filter((x) => !x.isGameplayModded)
                    .concat(
                        activeDiff.walls.filter((x) => x.isGameplayModded),
                    )
            }

            if (forDiff !== undefined) forDiff(processingDiff)
            await processingDiff.save()
        }

        const promises: Promise<void>[] = []

        const diffsArr = typeof diffs === 'object' ? diffs : [diffs]
        diffsArr.forEach((x) => {
            promises.push(process(x))
        })

        await Promise.all(promises)

        setActiveDifficulty(activeDiff)
    }

    currentTransfer = thisFunction()
    await currentTransfer
}
