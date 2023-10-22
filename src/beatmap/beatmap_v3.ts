import { arc, bomb, chain, note } from './note.ts'
import { wall } from './wall.ts'
import { bsmap } from '../deps.ts'
import { AbstractDifficulty } from './abstract_beatmap.ts'
import { Arc, Bomb, Chain, Note } from '../internals/note.ts'
import { Track } from '../animation/track.ts'
import { DIFFNAME, DIFFPATH } from '../types/beatmap_types.ts'
import { Vec3 } from '../types/data_types.ts'
import { AnimationPropertiesV3 } from '../internals/animation.ts'
import { EventGroup } from '../data/constants.ts'
import { jsonPrune } from '../utils/json.ts'

export class V3Difficulty extends AbstractDifficulty<bsmap.v3.IDifficulty> {
    declare version: bsmap.v3.IDifficulty['version']

    constructor(
        info: bsmap.v2.IInfoSetDifficulty,
        setInfo: bsmap.v2.IInfoSet,
        mapFile: DIFFPATH,
        relativeMapFile: DIFFNAME,
        json: bsmap.v3.IDifficulty,
        process?: (keyof bsmap.v3.IDifficulty)[],
    ) {
        // run only if explicitly allowed
        function runProcess<K extends keyof bsmap.v3.IDifficulty, V>(
            key: K,
            callback: (v: bsmap.v3.IDifficulty[K]) => V,
        ) {
            if (process && !process.some((s) => s === key)) return

            return callback(json[key])
        }

        const notes: Note[] = runProcess(
            'colorNotes',
            (notes) => notes.map((o) => note().fromJson(o, true)),
        ) ?? []

        const bombs: Bomb[] = runProcess(
            'bombNotes',
            (notes) => notes.map((o) => bomb().fromJson(o, true)),
        ) ?? []

        const arcs: Arc[] = runProcess(
            'sliders',
            (arcs) => arcs.map((o) => arc().fromJson(o, true)),
        ) ?? []

        const chains: Chain[] = runProcess(
            'burstSliders',
            (chains) => chains.map((o) => chain().fromJson(o, true)),
        ) ?? []

        const obstacles = runProcess(
            'obstacles',
            (obstacles) => obstacles.map((o) => wall().fromJson(o, true)),
        ) ?? []

        // Fake stuff
        if (json.customData?.fakeColorNotes) {
            notes.push(
                ...json.customData.fakeColorNotes.map((o) =>
                    note({ fake: true }).fromJson(o, true)
                ),
            )
            delete json.customData.fakeColorNotes
        }

        if (json.customData?.fakeBombNotes) {
            bombs.push(
                ...json.customData.fakeBombNotes.map((o) =>
                    bomb({ fake: true }).fromJson(o, true)
                ),
            )
            delete json.customData.fakeBombNotes
        }

        if (json.customData?.fakeBurstSliders) {
            chains.push(
                ...json.customData.fakeBurstSliders.map((o) =>
                    chain({ fake: true }).fromJson(o, true)
                ),
            )
            delete json.customData.fakeBurstSliders
        }

        if (json.customData?.fakeObstacles) {
            obstacles.push(
                ...json.customData.fakeObstacles.map((o) =>
                    wall({ fake: true }).fromJson(o, true)
                ),
            )
            delete json.customData.fakeObstacles
        }

        // 0-3 laser
        const lasersEvents = json.basicBeatmapEvents.filter((x) =>
            (x.et >= 0 && x.et <= 3) ||
            (x.et === EventGroup.LEFT_EXTRA ||
                x.et === EventGroup.RIGHT_EXTRA)
        )

        const boostEvents = json.basicBeatmapEvents.filter((x) => x.et === 5)

        // 4 to 7 are lights
        const lightEvents = json.basicBeatmapEvents.filter((x) =>
            x.et >= 4 && x.et <= 7 && x.et !== 5
        )
        const zoomEvents = json.basicBeatmapEvents.filter((x) =>
            x.et === EventGroup.RING_ZOOM
        )
        const ringRotateEvents = json.basicBeatmapEvents.filter((x) =>
            x.et === EventGroup.RING_SPIN
        )
        // 90/360 maps
        const laneEvents = json.basicBeatmapEvents.filter((x) =>
            x.et === 13 || x.et === 14
        )
        // idk
        const utilityEvents = json.basicBeatmapEvents.filter((x) =>
            x.et >= 16 && x.et <= 19
        )
        // bts?
        const specialEvents = json.basicBeatmapEvents.filter((x) =>
            x.et >= 40 && x.et <= 43
        )

        const bpmRotationEvents = json.basicBeatmapEvents.filter((x) =>
            x.et === 100
        )

        /// custom events

        const customEvents = json?.customData?.customEvents
        const animateTracks = customEvents?.filter((x) =>
            x.t === 'AnimateTrack'
        )
        const assignPathTracks = customEvents?.filter((x) =>
            x.t === 'AssignPathAnimation'
        )
        const assignParent = customEvents?.filter((x) =>
            x.t === 'AssignTrackParent'
        )
        const assignPlayer = customEvents?.filter((x) =>
            x.t === 'AssignPlayerToTrack'
        )
        const animateComponents = customEvents?.filter((x) =>
            x.t === 'AnimateComponent'
        )
        // TODO: Deserialize

        super(
            json,
            info,
            setInfo,
            mapFile,
            relativeMapFile,
            {
                notes,
                bombs,
                version: json.version,
                arcs: arcs,
                chains: chains,
                walls: obstacles,
                basicEvents: [],
                laserSpeedEvents: [],
                ringSpinEvents: [],
                ringZoomEvents: [],
                rotationEvent: [],
                geoMaterials: {},

                animateComponents: [],
                animateTracks: [],
                assignPathAnimations: [],
                assignPlayerTracks: [],
                assignTrackParents: [],

                pointDefinitions: {},
                customData: json.customData ?? {},
                environment: [],
                geometry: [],
            },
        )
    }

    toJSON(): bsmap.v3.IDifficulty {
        const sortItems = (a: { b: number }, b: { b: number }) => a.b - b.b

        const colorNotes = this.notes.filter((e) => !e.fake)
            .map((e) => (e.toJson(true)))
            .sort(
                sortItems,
            )

        const bombNotes = this.bombs.filter((e) => !e.fake)
            .map((e) => (e.toJson(true)))
            .sort(
                sortItems,
            )

        const chains = this.chains.filter((e) => !e.fake)
            .map((e) => (e.toJson(true)))
            .sort(
                sortItems,
            )

        const arcs = this.arcs
            .map((e) => (e.toJson(true)))
            .sort(
                sortItems,
            )

        // console.log(this.notes[0].toJson(true))

        return {
            colorNotes: colorNotes,
            bombNotes: bombNotes,
            basicBeatmapEvents: [],
            bpmEvents: [],
            burstSliders: chains,
            colorBoostBeatmapEvents: [],
            lightColorEventBoxGroups: [],
            lightRotationEventBoxGroups: [],
            lightTranslationEventBoxGroups: [],
            rotationEvents: [],
            obstacles: this.walls.map((o) => (o.toJson(true))),
            sliders: arcs,
            version: '3.2.0',
            waypoints: [],
            customData: jsonPrune({
                fakeColorNotes: this.notes.filter((e) => e.fake)
                    .map((e) => e.toJson(true))
                    .sort(
                        sortItems,
                    ),
                fakeBombNotes: this.bombs.filter((e) => e.fake)
                    .map((e) => e.toJson(true))
                    .sort(
                        sortItems,
                    ),
                fakeBurstSliders: this.chains.filter((e) => e.fake)
                    .map((e) => e.toJson(true))
                    .sort(
                        sortItems,
                    ),
                ...this.customData,
            }),
            useNormalEventsAsCompatibleEvents: true,
            basicEventTypesWithKeywords: {
                d: [],
            },
        }
    }
}
