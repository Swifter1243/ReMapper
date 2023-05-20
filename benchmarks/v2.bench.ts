import { Difficulty } from 'https://deno.land/x/remapper@2.1.0/src/beatmap.ts'
import { V2Difficulty } from '../src/beatmap_v2.ts'
import { bsmap } from '../src/deps.ts'

import * as remapperv2 from 'https://deno.land/x/remapper@2.1.0/src/mod.ts'

const json = {
    _notes: [],
    _events: [],
    _obstacles: [],
    _sliders: [],
    _version: '2.6.0',
    _waypoints: [],
    _customData: {},
    _specialEventsKeywordFilters: {
        _keywords: [],
    },
} satisfies bsmap.v2.IDifficulty

const v2OldDiff = Object.create(
    remapperv2.Difficulty.prototype,
) as remapperv2.Difficulty
v2OldDiff.json = json
remapperv2.activeDiffSet(remapperv2.copy(v2OldDiff))

console.log('Benching')

Deno.bench('rm4.parseJSON', { group: 'parseJSON' }, () => {
    new V2Difficulty(undefined!, undefined!, undefined!, undefined!, json, [
        '_notes',
    ])
})
Deno.bench('rm2.parseJSON', { group: 'parseJSON' }, () => {
    // This affects the performance of the benchmark
    // but it is necessary
    // the results without it change drastically
    remapperv2.activeDiffSet(remapperv2.copy(v2OldDiff))

    for (let i = 0; i < v2OldDiff.notes.length; i++) {
        v2OldDiff.notes[i] = new remapperv2.Note().import(
            v2OldDiff.notes[i] as Record<string, any>,
        )
    }
    for (let i = 0; i < v2OldDiff.walls.length; i++) {
        v2OldDiff.walls[i] = new remapperv2.Wall().import(
            v2OldDiff.walls[i] as Record<string, any>,
        )
    }
    for (let i = 0; i < v2OldDiff.events.length; i++) {
        v2OldDiff.events[i] = new remapperv2.Event().import(
            v2OldDiff.events[i] as Record<string, any>,
        )
    }
    if (v2OldDiff.customEvents !== undefined) {
        for (let i = 0; i < v2OldDiff.customEvents.length; i++) {
            v2OldDiff.customEvents[i] = new remapperv2.CustomEvent().import(
                v2OldDiff.customEvents[i] as Record<string, any>,
            )
        }
    }
    if (v2OldDiff.rawEnvironment !== undefined) {
        for (let i = 0; i < v2OldDiff.rawEnvironment.length; i++) {
            v2OldDiff.rawEnvironment[i] = new remapperv2.EnvironmentInternals
                .BaseEnvironment().import(
                    v2OldDiff.rawEnvironment[i] as Record<string, any>,
                )
        }
    }

    if (v2OldDiff.version === undefined) v2OldDiff.version = '2.2.0'
    // new V2Difficulty(undefined!, undefined!, undefined!, undefined!, json, ["_notes"])
})

const diff = new V2Difficulty(
    undefined!,
    undefined!,
    undefined!,
    undefined!,
    json,
)

remapperv2.activeDiffSet(remapperv2.copy(v2OldDiff))

Deno.bench('rm4.save', { group: 'save' }, () => {
    diff.toJSON()
})
Deno.bench('rm2.save', { group: 'save' }, () => {
    const outputJSON = {} as Record<string, any>
    Object.keys(v2OldDiff.json).forEach((x) => {
        if (
            x === '_notes' ||
            x === '_obstacles' ||
            x === '_events'
        ) {
            outputJSON[x] = []
        } else if (x === '_customData') {
            Object.keys(v2OldDiff.json[x]).forEach((y) => {
                if (!outputJSON[x]) outputJSON[x] = {}
                if (
                    y === '_environment' ||
                    y === '_customEvents'
                ) {
                    outputJSON[x][y] = []
                } else {outputJSON[x][y] = remapperv2.copy(
                        v2OldDiff.json[x][y],
                    )}
            })
        } else outputJSON[x] = remapperv2.copy(v2OldDiff.json[x])
    })

    // Notes
    v2OldDiff.notes.forEach((x) => {
        const note = remapperv2.copy(x)
        if (remapperv2.settings.forceJumpsForNoodle && x.isGameplayModded) {
            note.NJS = x.NJS
            note.offset = x.offset
        }
        remapperv2.jsonPrune(note.json)
        outputJSON._notes.push(note.json)
    })

    // Walls
    v2OldDiff.walls.forEach((x) => {
        const wall = remapperv2.copy(x)
        if (remapperv2.settings.forceJumpsForNoodle && wall.isGameplayModded) {
            wall.NJS = x.NJS
            wall.offset = x.offset
        }
        remapperv2.jsonPrune(wall.json)
        outputJSON._obstacles.push(wall.json)
    })

    // Events
    v2OldDiff.events.forEach((x) => {
        outputJSON._events.push(remapperv2.copy(x.json))
    })

    // Custom Events
    if (v2OldDiff.customEvents) {
        v2OldDiff.customEvents.forEach((x) =>
            outputJSON._customData._customEvents.push(remapperv2.copy(x.json))
        )
        remapperv2.sortObjects(outputJSON._customData._customEvents, '_time')
    }

    // Environment
    if (v2OldDiff.rawEnvironment) {
        v2OldDiff.rawEnvironment.forEach((x) => {
            const json = remapperv2.copy(x.json)
            remapperv2.jsonRemove(json, '_group')
            outputJSON._customData._environment.push(json)
        })
    }

    remapperv2.sortObjects(outputJSON._events, '_time')
    remapperv2.sortObjects(outputJSON._notes, '_time')
    remapperv2.sortObjects(outputJSON._obstacles, '_time')
    // v2DumbDiff.save()
})
