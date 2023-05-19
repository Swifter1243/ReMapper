import { V2Difficulty } from '../src/beatmap_v2.ts'
import { bsmap } from '../src/deps.ts'
import { readDifficulty } from '../src/mod.ts'

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

Deno.bench('parseJSON', { group: 'rm4' }, () => {
    new V2Difficulty(undefined!, undefined!, undefined!, undefined!, json)
})

const diff = new V2Difficulty(
    undefined!,
    undefined!,
    undefined!,
    undefined!,
    json,
)

Deno.bench('save', { group: 'rm4' }, () => {
    diff.toJSON()
})
