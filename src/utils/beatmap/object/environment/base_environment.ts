import { Environment } from '../../../../internals/beatmap/object/environment/environment.ts'
import { getActiveDifficulty } from '../../../../data/active_difficulty.ts'
import { environment } from '../../../../builder_functions/beatmap/object/environment/environment.ts'

/** Get the base "Environment" object. */
export function getBaseEnvironment(callback: (env: Environment) => void) {
    const search = getActiveDifficulty().environment.filter((x) =>
        x.id === '[0]Environment' && x.lookupMethod === 'EndsWith'
    )

    if (search.length > 0) {
        callback(search[0])
    } else {
        const env = environment('[0]Environment', 'EndsWith')
        env.push(false)
        callback(env)
    }
}

/**
 * Assign a track to the base "Environment" object.
 * @param track Track to assign the object to.
 */
export function setBaseEnvironmentTrack(track: string) {
    getBaseEnvironment((env) => {
        env.track.value = track
    })
}
