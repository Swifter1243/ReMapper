import { V3Difficulty } from '../src/beatmap_v3.ts'
import { bsmap } from '../src/deps.ts'

import * as remapperv3 from 'https://deno.land/x/remapper@3.1.1/src/mod.ts'
import { rand } from '../src/general.ts'

const notes: bsmap.v3.IColorNote[] = [...Array(1000).keys()].map(() => ({
    b: rand(0, 1000),
    d: rand(0, 8),
    x: rand(0, 3),
    y: rand(0, 3),
    c: rand(0, 3) as any,
    a: 0,
    customData: {},
} satisfies bsmap.v3.IColorNote))

const json = {
    colorNotes: notes,
    bombNotes: [],
    sliders: [],
    burstSliders: [],
    basicBeatmapEvents: [],
    basicEventTypesWithKeywords: { d: [] },
    bpmEvents: [],
    colorBoostBeatmapEvents: [],
    lightColorEventBoxGroups: [],
    lightRotationEventBoxGroups: [],
    lightTranslationEventBoxGroups: [],
    obstacles: [],
    rotationEvents: [],
    useNormalEventsAsCompatibleEvents: true,
    version: '3.2.0',
    waypoints: [],
    customData: {},
} satisfies bsmap.v3.IDifficulty

const v3OldDiff = Object.create(
    remapperv3.Difficulty.prototype,
) as remapperv3.Difficulty
v3OldDiff.json = json
remapperv3.activeDiffSet(remapperv3.copy(v3OldDiff))

Deno.bench('rm4.parseJSON', { group: 'parseJSON' }, () => {
    new V3Difficulty(undefined!, undefined!, undefined!, undefined!, json)
})
Deno.bench('rm3.parseJSON', { group: 'parseJSON' }, () => {
    // remapperv3.activeDiffGet() affects the performance of the benchmark
    // but it is necessary
    // the results without it change drastically
    // remapperv3.activeDiffSet(remapperv3.copy(v3OldDiff))

    function transferKey(obj: remapperv3.Json, old: string, value: string) {
        if (obj[old] === undefined) return
        obj[value] = obj[old]
        delete obj[old]
    }

    remapperv3.activeDiffGet().json.basicBeatmapEvents.forEach(
        (x: remapperv3.Json) => {
            if (x.customData) {
                const keys = [
                    'lightID',
                    'color',
                    'easing',
                    'lerpType',
                    'rotation',
                    'nameFilter',
                    'step',
                    'prop',
                    'speed',
                    'direction',
                ]

                keys.forEach((k) => transferKey(x.customData, `_${k}`, k))
            }
        },
    )

    remapperv3.arrJsonToClass(remapperv3.activeDiffGet().notes, remapperv3.Note)
    remapperv3.arrJsonToClass(remapperv3.activeDiffGet().bombs, remapperv3.Bomb)
    remapperv3.arrJsonToClass(remapperv3.activeDiffGet().arcs, remapperv3.Arc)
    remapperv3.arrJsonToClass(
        remapperv3.activeDiffGet().chains,
        remapperv3.Chain,
    )
    remapperv3.arrJsonToClass(remapperv3.activeDiffGet().walls, remapperv3.Wall)
    remapperv3.arrJsonToClass(
        remapperv3.activeDiffGet().events,
        remapperv3.Event as any,
    )
    remapperv3.arrJsonToClass(
        remapperv3.activeDiffGet().customEvents,
        remapperv3.CustomEvent,
    )
    remapperv3.arrJsonToClass(
        remapperv3.activeDiffGet().rawEnvironment,
        remapperv3.EnvironmentInternals.BaseEnvironment,
    )
    remapperv3.arrJsonToClass(
        remapperv3.activeDiffGet().BPMChanges,
        remapperv3.BPMChange,
    )
    remapperv3.arrJsonToClass(
        remapperv3.activeDiffGet().rotationEvents,
        remapperv3.RotationEvent,
    )
    remapperv3.arrJsonToClass(
        remapperv3.activeDiffGet().boostEvents,
        remapperv3.BoostEvent,
    )

    remapperv3.arrJsonToClass(
        remapperv3.activeDiffGet().lightEventBoxes,
        remapperv3.LightEventBox,
        (b) => {
            remapperv3.arrJsonToClass(
                b.boxGroups,
                remapperv3.LightEventBoxGroup,
                (g) => {
                    remapperv3.arrJsonToClass(g.events, remapperv3.LightEvent)
                },
            )
        },
    )

    remapperv3.arrJsonToClass(
        remapperv3.activeDiffGet().lightRotationBoxes,
        remapperv3.LightRotationBox,
        (b) => {
            remapperv3.arrJsonToClass(
                b.boxGroups,
                remapperv3.LightRotationBoxGroup,
                (g) => {
                    remapperv3.arrJsonToClass(
                        g.events,
                        remapperv3.LightRotation,
                    )
                },
            )
        },
    )

    remapperv3.arrJsonToClass(
        remapperv3.activeDiffGet().fakeNotes,
        remapperv3.Note,
    )
    remapperv3.arrJsonToClass(
        remapperv3.activeDiffGet().fakeBombs,
        remapperv3.Bomb,
    )
    remapperv3.arrJsonToClass(
        remapperv3.activeDiffGet().fakeWalls,
        remapperv3.Wall,
    )
    remapperv3.arrJsonToClass(
        remapperv3.activeDiffGet().fakeChains,
        remapperv3.Chain,
    )

    if (v3OldDiff.version === undefined) v3OldDiff.version = '3.2.0'
    // new remapperv3.Difficulty(undefined!, undefined!, undefined!, undefined!, json, ["_notes"])
})

const diff = new V3Difficulty(
    undefined!,
    undefined!,
    undefined!,
    undefined!,
    json,
)

remapperv3.activeDiffSet(remapperv3.copy(v3OldDiff))

Deno.bench('rm4.save', { group: 'save' }, () => {
    diff.toJSON()
})
Deno.bench('rm3.save', { group: 'save' }, () => {
    const outputJSON = {} as remapperv3.Json

    Object.keys(remapperv3.activeDiffGet().json).forEach((x) => {
        if (Array.isArray(remapperv3.activeDiffGet().json[x])) {
            outputJSON[x] = []
        } else if (x === 'customData') {
            Object.keys(remapperv3.activeDiffGet().json[x]).forEach((y) => {
                if (!outputJSON[x]) outputJSON[x] = {}
                if (Array.isArray(remapperv3.activeDiffGet().json[x][y])) {
                    outputJSON[x][y] = []
                } else {outputJSON[x][y] = remapperv3.copy(
                        remapperv3.activeDiffGet().json[x][y],
                    )}
            })
        } else {outputJSON[x] = remapperv3.copy(
                remapperv3.activeDiffGet().json[x],
            )}
    })

    const diffArrClassToJson = <T>(
        arr: T[],
        prop: string,
        callback?: (obj: any) => void,
    ) => remapperv3.arrClassToJson(arr, outputJSON, prop, callback)

    function gameplayArrClassToJson<T>(arr: T[], prop: string) {
        diffArrClassToJson(arr, prop, (x) => {
            if (remapperv3.settings.forceJumpsForNoodle && x.isGameplayModded) {
                // deno-lint-ignore no-self-assign
                x.NJS = x.NJS
                // deno-lint-ignore no-self-assign
                x.offset = x.offset
            }
            remapperv3.jsonPrune(x.json)
        })
    }

    gameplayArrClassToJson(remapperv3.activeDiffGet().notes, 'colorNotes')
    gameplayArrClassToJson(remapperv3.activeDiffGet().bombs, 'bombNotes')
    gameplayArrClassToJson(remapperv3.activeDiffGet().arcs, 'sliders')
    gameplayArrClassToJson(remapperv3.activeDiffGet().chains, 'burstSliders')
    gameplayArrClassToJson(remapperv3.activeDiffGet().walls, 'obstacles')
    diffArrClassToJson(remapperv3.activeDiffGet().events, 'basicBeatmapEvents')
    diffArrClassToJson(remapperv3.activeDiffGet().BPMChanges, 'bpmEvents')
    diffArrClassToJson(
        remapperv3.activeDiffGet().rotationEvents,
        'rotationEvents',
    )
    diffArrClassToJson(
        remapperv3.activeDiffGet().boostEvents,
        'colorBoostBeatmapEvents',
    )
    diffArrClassToJson(
        remapperv3.activeDiffGet().customEvents,
        'customData.customEvents',
    )
    diffArrClassToJson(
        remapperv3.activeDiffGet().rawEnvironment,
        'customData.environment',
        (x) => {
            remapperv3.jsonRemove(x.json, 'group')
        },
    )
    gameplayArrClassToJson(
        remapperv3.activeDiffGet().fakeNotes,
        'customData.fakeColorNotes',
    )
    gameplayArrClassToJson(
        remapperv3.activeDiffGet().fakeBombs,
        'customData.fakeBombNotes',
    )
    gameplayArrClassToJson(
        remapperv3.activeDiffGet().fakeWalls,
        'customData.fakeObstacles',
    )
    gameplayArrClassToJson(
        remapperv3.activeDiffGet().fakeChains,
        'customData.fakeBurstSliders',
    )

    function safeCloneJSON(json: remapperv3.Json) {
        const output: remapperv3.Json = {}

        Object.keys(json).forEach((k) => {
            if (typeof json[k] !== 'object') output[k] = json[k]
            else output[k] = []
        })

        return output
    }

    remapperv3.activeDiffGet().lightEventBoxes.forEach((b) => {
        const json = safeCloneJSON(b.json)

        b.boxGroups.forEach((g) => {
            const groupJson = safeCloneJSON(g.json)
            groupJson.f = remapperv3.copy(g.json.f)

            g.events.forEach((e) => {
                groupJson.e.push(e.json)
            })

            json.e.push(groupJson)
        })

        outputJSON.lightColorEventBoxGroups.push(json)
    })

    remapperv3.activeDiffGet().lightRotationBoxes.forEach((b) => {
        const json = safeCloneJSON(b.json)

        b.boxGroups.forEach((g) => {
            const groupJson = safeCloneJSON(g.json)
            groupJson.f = remapperv3.copy(g.json.f)

            g.events.forEach((e) => {
                groupJson.l.push(e.json)
            })

            json.e.push(groupJson)
        })

        outputJSON.lightRotationEventBoxGroups.push(json)
    })
    // v3OldDiff.save()
})
