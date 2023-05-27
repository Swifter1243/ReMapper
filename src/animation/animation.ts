// deno-lint-ignore-file
import * as AnimationInternals from '../internals/animation.ts'

/**
 * State that this animation is for a note.
 * @param json The json to create the animation with.
 */
export function noteAnimation(
    ...params: ConstructorParameters<typeof AnimationInternals.NoteAnimation>
) {
    return new AnimationInternals.NoteAnimation(...params)
}

/**
 * State that this animation is for a wall.
 * @param json The json to create the animation with.
 */
export function wallAnimation(
    ...params: ConstructorParameters<typeof AnimationInternals.WallAnimation>
) {
    return new AnimationInternals.WallAnimation(...params)
}

/**
 * State that this animation is for an environment object.
 * @param json The json to create the animation with.
 */
export function environmentAnimation(
    ...params: ConstructorParameters<
        typeof AnimationInternals.EnvironmentAnimation
    >
) {
    return new AnimationInternals.EnvironmentAnimation(...params)
}
