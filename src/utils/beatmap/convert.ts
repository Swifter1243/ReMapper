import { AbstractDifficulty } from '../../internals/beatmap/abstract_beatmap.ts'

/** Bakes all rotations from `RotationEvent`s in a difficulty into gameplay object `worldRotation` fields. */
export function convertRotationEventsToObjectRotation(difficulty: AbstractDifficulty) {
    const gameplayObjects = [
        ...difficulty.colorNotes,
        ...difficulty.bombs,
        ...difficulty.arcs,
        ...difficulty.chains,
        ...difficulty.walls,
    ].map((x) => {
        return {
            object: x,
            rotation: 0,
        }
    })

    let currentRotation = 0
    difficulty.rotationEvents
        .sort((a, b) => a.beat - b.beat)
        .forEach((event) => {
            currentRotation = (currentRotation + event.rotation) % 360
            gameplayObjects
                .filter(o => event.early ? o.object.beat >= event.beat : o.object.beat > event.beat)
                .forEach(o => o.rotation = currentRotation)
        })

    difficulty.rotationEvents = []

    gameplayObjects.forEach((gameplayObject) => {
        gameplayObject.object.worldRotation ??= [0, gameplayObject.rotation, 0]
    })
}
