import { V2Difficulty } from '../src/beatmap_v2.ts'
import { bsmap } from '../src/deps.ts'

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

console.log("Benching")

Deno.bench('rm4.parseJSON', { group: 'parseJSON', }, () => {
    new V2Difficulty(undefined!, undefined!, undefined!, undefined!, json, ["_notes"])
})

const diff = new V2Difficulty(
    undefined!,
    undefined!,
    undefined!,
    undefined!,
    json,
)

Deno.bench('rm4.save', { group: 'save' }, () => {
    diff.toJSON()
})
