import { CustomEventInternals } from '../internals/mod.ts'
import { EASE, RuntimePointDefinitionLinear } from '../types/animation.ts'
import { RuntimePointDefinitionVec4 } from '../types/animation.ts'
import { FILEPATH } from '../types/beatmap.ts'
import { ColorVec, Vec4 } from '../types/data.ts'
import { DeepReadonly, MaterialProperty } from '../types/mod.ts'
import { MATERIAL_PROP_TYPE, MaterialPropertyValue } from '../types/vivify.ts'
import {
    assignTrackPrefab,
    destroyPrefab,
    instantiatePrefab,
    setMaterialProperty,
    blit
} from "../builder_functions/custom_event/vivify.ts";

type PrefabMap = Record<string, string>

type MaterialProperties = Record<string, MATERIAL_PROP_TYPE>

type MaterialMap = Record<string, {
    path: string
    properties: Record<string, Partial<Record<MATERIAL_PROP_TYPE, unknown>>>
}>

type AssetMap = {
    default: {
        materials: MaterialMap
        prefabs: PrefabMap
    }
}

type FixedMaterialMap<BaseMaterial extends MaterialMap[string]> = {
    path: string
    properties: {
        [MaterialProperty in keyof BaseMaterial['properties']]: BaseMaterial['properties'][MaterialProperty] extends
            Record<string, unknown> ? Extract<
                keyof BaseMaterial['properties'][MaterialProperty],
                MATERIAL_PROP_TYPE
            >
            : never
    }
}

type MaterialPropertyMap = {
    'Texture': FILEPATH
    'Float': number | RuntimePointDefinitionLinear
    'Color': ColorVec | RuntimePointDefinitionVec4
    'Vector': Vec4 | RuntimePointDefinitionVec4
}

type MaterialPropertyValueExtended = MaterialPropertyValue | number | ColorVec | Vec4

/** Used to load type safe prefabs. See `loadAssets` */
export class Prefab {
    /** Path to this prefab in the asset bundle. */
    readonly path: string
    /** Name of this prefab, it is also included in the track. */
    readonly name: string
    /** Keeps track of how many times this prefab has been instantiated. */
    private iteration = 0

    constructor(path: string, name: string) {
        this.path = path
        this.name = name
    }

    /** Instantiate this prefab. Returns the instance. */
    instantiate(
        beat = 0,
        event?: (event: CustomEventInternals.InstantiatePrefab) => void,
    ) {
        const id = `${this.name}_${this.iteration}`
        const instantiation = instantiatePrefab(beat, this.path, id, id)
        if (event) event(instantiation)
        instantiation.push(false)
        this.iteration++
        return new PrefabInstance(id, instantiation)
    }

    /** Create an event to assign this prefab to color notes. */
    assignToColorNote(track: string, beat = 0) {
        assignTrackPrefab({
            beat,
            track,
            colorNotes: this.path
        }).push()
    }

    /** Create an event to assign this prefab to color note debris. */
    assignToColorNoteDebris(track: string, beat = 0) {
        assignTrackPrefab({
            beat,
            track,
            colorNoteDebris: this.path
        }).push()
    }

    /** Create an event to assign this prefab to bombs. */
    assignToBombs(track: string, beat = 0) {
        assignTrackPrefab({
            beat,
            track,
            bombNotes: this.path
        }).push()
    }

    /** Create an event to assign this prefab to chain heads. */
    assignToChainHeads(track: string, beat = 0) {
        assignTrackPrefab({
            beat,
            track,
            chainHeads: this.path
        }).push()
    }

    /** Create an event to assign this prefab to chain head debris. */
    assignToChainHeadDebris(track: string, beat = 0) {
        assignTrackPrefab({
            beat,
            track,
            chainHeadDebris: this.path
        }).push()
    }

    /** Create an event to assign this prefab to chain head debris. */
    assignToChainLinks(track: string, beat = 0) {
        assignTrackPrefab({
            beat,
            track,
            chainLinks: this.path
        }).push()
    }

    /** Create an event to assign this prefab to chain head debris. */
    assignToChainLinkDebris(track: string, beat = 0) {
        assignTrackPrefab({
            beat,
            track,
            chainLinkDebris: this.path
        }).push()
    }
}

/** An instance of a prefab. */
export class PrefabInstance {
    /** The id/track of this instance. */
    readonly id: string
    /** The track of this instance. Equivalent to id. */
    get track() {
        return this.id
    }
    /** Whether this instance has been destroyed. */
    destroyed = false
    /** The event used to push this instance. */
    readonly event: CustomEventInternals.InstantiatePrefab

    constructor(id: string, event: CustomEventInternals.InstantiatePrefab) {
        this.id = id
        this.event = event
    }

    /** Destroy this instance. */
    destroy(beat = 0) {
        if (this.destroyed) throw `Prefab ${this.id} is already destroyed.`

        destroyPrefab(beat, this.id).push()
        this.destroyed = true
    }
}

type MaterialSetParameters0<
    T extends MaterialProperties,
> = [
    values: Partial<{ [K in keyof T]: MaterialPropertyMap[T[K]] }>,
    beat?: number,
    duration?: number,
    easing?: EASE,
    callback?: (
        event: CustomEventInternals.SetMaterialProperty,
    ) => void,
]

type MaterialSetParameters1<
    T extends MaterialProperties,
    K extends keyof T,
> = [
    prop: K,
    value: MaterialPropertyMap[T[K]],
    beat?: number,
    duration?: number,
    easing?: EASE,
    callback?: (
        event: CustomEventInternals.SetMaterialProperty,
    ) => void,
]

type MaterialSetParameters<
    T extends MaterialProperties,
    K2 extends keyof T,
> = MaterialSetParameters0<T> | MaterialSetParameters1<T, K2>

/** Used to load type safe materials. See `loadAssets` */
export class Material<T extends MaterialProperties = MaterialProperties> {
    /** Path to this material in the asset bundle. */
    readonly path: string
    /** Name of this material. */
    readonly name: string
    /** Properties in this material. */
    properties: DeepReadonly<T>

    constructor(path: string, name: string, properties: T) {
        this.path = path
        this.name = name
        this.properties = properties
    }

    /** Apply this material to the post processing stack. */
    blit(
        ...params:
            | [
                beat?: number,
                duration?: number,
                properties?: MaterialProperty[],
                easing?: EASE,
            ]
            | [
                Omit<
                    ConstructorParameters<typeof CustomEventInternals.Blit>[0],
                    'asset'
                >,
            ]
    ) {
        if (typeof params[0] === 'object') {
            return blit({
                ...params[0],
                asset: this.path,
            }).push()
        }

        const [beat, duration, properties, easing] = params

        return blit({
            beat: beat as number,
            duration,
            properties,
            easing,
            asset: this.path,
        }).push()
    }

    /** Set a property on this material. Also allows for animations. */
    set(
        ...params: MaterialSetParameters0<T>
    ): void
    set<K extends keyof T>(
        ...params: MaterialSetParameters1<T, K>
    ): void
    set<K extends keyof T>(
        ...params: MaterialSetParameters<T, K>
    ) {
        if (typeof params[0] === 'object') {
            this.doSet(...params as Parameters<typeof this.doSet>)
            return
        }

        const [prop, value, beat, duration, easing, callback] = params

        this.doSet(
            { [prop]: value } as MaterialProperties,
            beat,
            duration as number,
            easing as EASE,
            callback,
        )
    }

    private doSet(
        values: MaterialProperties,
        beat?: number,
        duration?: number,
        easing?: EASE,
        callback?: (event: CustomEventInternals.SetMaterialProperty) => void,
    ) {
        beat ??= 0

        const fixedValues: MaterialProperty[] = []

        Object.entries(values).forEach(([k, v]) => {
            const fixedValue = typeof v === 'number' ? [v] : v

            fixedValues.push({
                id: k,
                type: this.properties[k] as MATERIAL_PROP_TYPE,
                value: fixedValue,
            })
        })

        const event = setMaterialProperty(
            beat,
            this.path,
            fixedValues,
            duration,
            easing,
        )
        if (callback) callback(event)
        event.push(false)
    }
}

type PrefabMapOutput<T extends PrefabMap> = Record<keyof T, Prefab>

/** Generate a typed list of prefabs from JSON. */
export function makePrefabMap<T extends PrefabMap>(map: T) {
    const newMap: Record<string, Prefab> = {}

    Object.entries(map).forEach(([k, v]) => {
        newMap[k] = new Prefab(v, k)
    })

    return newMap as PrefabMapOutput<T>
}

function fixMaterial<T extends MaterialMap['properties']>(map: T) {
    const newMap = {
        path: map.path,
        properties: {},
    } as FixedMaterialMap<T>

    Object.entries(map.properties).forEach(([prop, type]) => {
        ;(newMap.properties as unknown as Record<string, unknown>)[prop] = Object.keys(
            type,
        )[0] as MATERIAL_PROP_TYPE
    })

    return newMap
}

type MaterialMapOutput<T extends MaterialMap> = {
    [V in keyof T]: Material<FixedMaterialMap<T[V]>['properties']>
}

/** Generate a typed list of materials from JSON. */
export function makeMaterialMap<T extends MaterialMap>(map: T) {
    const newMap: Record<string, Material> = {}

    Object.entries(map).forEach(([k, v]) => {
        type props = FixedMaterialMap<typeof v>['properties']
        const fixed = fixMaterial(v)
        newMap[k] = new Material<props>(v.path, k, fixed.properties)
    })

    return newMap as MaterialMapOutput<T>
}

function initializeMaterials(assetMap: AssetMap) {
    Object.values(assetMap.default.materials).forEach(
        (value) => {
            const path = value.path
            const properties = value.properties

            const setProperties: MaterialProperty[] = []

            if (Object.keys(properties).length === 0) return

            Object.entries(properties).forEach(([propName, typeHolder]) => {
                const propType = Object.keys(
                    typeHolder,
                )[0] as keyof typeof typeHolder

                if (propType === 'Texture') return

                const propValue = JSON.parse(typeHolder[propType] as string)

                setProperties.push({
                    id: propName,
                    type: propType,
                    value: propValue,
                })
            })

            setMaterialProperty(0, path, setProperties).push()
        },
    )
}

/** Generate a typed list of assets from JSON.
 * @param initialize Whether to set the default value of all materials at the start of the map. This is redundancy incase material values are externally altered.
 */
export function loadAssets<T extends AssetMap>(
    assetMap: T,
    initialize = true,
): {
    materials: MaterialMapOutput<T['default']['materials']>
    prefabs: PrefabMapOutput<T['default']['prefabs']>
} {
    const materials = makeMaterialMap(assetMap.default.materials)
    const prefabs = makePrefabMap(assetMap.default.prefabs)

    if (initialize) {
        initializeMaterials(assetMap)
    }

    return {
        materials: materials,
        prefabs: prefabs,
    }
}

/** Destroy multiple prefab instances in one event. */
export function destroyPrefabInstances(prefabs: PrefabInstance[], beat = 0) {
    const ids: string[] = []

    prefabs.forEach((x) => {
        if (x.destroyed) throw `Prefab ${x.id} is already destroyed.`
        ids.push(x.id)
        x.destroyed = true
    })

    destroyPrefab(beat, ids).push()
}
