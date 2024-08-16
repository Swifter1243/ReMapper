import { DeepReadonly } from '../../util/mutability.ts'
import { Transform } from '../../math/transform.ts'
import { LookupMethod } from '../../beatmap/object/environment.ts'

/** Info for Environment Model pieces */
export type EnvironmentModelPiece = {
    readonly id: string
    readonly lookupMethod: LookupMethod
    readonly transform?: DeepReadonly<Transform>
}
