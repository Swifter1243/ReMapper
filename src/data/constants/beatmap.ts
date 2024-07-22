import {RMDifficulty} from "../../types/beatmap/rm_difficulty.ts";

export const clearPropertyMap = {
    arcs: 'Arcs',
    abstractBasicEvents: 'Base Basic Events',
    bombs: 'Bombs',
    boostEvents: 'Boost Events',
    bpmEvents: 'BPM Events',
    chains: 'Chains',
    customData: 'Custom Data',
    environment: 'Environment',
    fogEvents: 'Fog Events',
    geometry: 'Geometry',
    geometryMaterials: 'Geometry Materials',
    laserSpeedEvents: 'Laser Speed Events',
    lightColorEventBoxGroups: 'Light Color Event Box Groups',
    lightEvents: 'Light Events',
    lightRotationEventBoxGroups: 'Light Rotation Event Box Groups',
    lightTranslationEventBoxGroups: 'Light Translation Event Box Groups',
    colorNotes: 'Notes',
    pointDefinitions: 'Point Definitions',
    ringSpinEvents: 'Ring Spin Events',
    ringZoomEvents: 'Ring Zoom Events',
    rotationEvents: 'Rotation Events',
    v3: undefined,
    version: undefined,
    walls: 'Walls',
    waypoints: 'Waypoints',
    customEvents: 'Custom Events',
} as const satisfies {
    [K in keyof RMDifficulty]: string | undefined
}