import { bsmap } from '../../../../deps.ts'
import { copy } from '../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../utils/object/prune.ts'
import { getActiveDifficulty } from '../../../../data/active_difficulty.ts'
import { BaseSliderObject } from './base_slider.ts'
import { Vec2 } from '../../../../types/math/vector.ts'
import {
    exportInvertedBoolean,
    getCDProp,
    importInvertedBoolean,
    simplifyWorldRotation
} from '../../../../utils/beatmap/json.ts'
import { GameplayObjectDefaults, GameplayObjectConstructor } from '../../../../types/beatmap/object/gameplay_object.ts'

export class Chain extends BaseSliderObject<bsmap.v3.IChain> {
    constructor(
        fields: GameplayObjectConstructor<Chain>,
    ) {
        super(fields)
        this.links = fields.links ?? Chain.defaults.links
        this.squish = fields.squish ?? Chain.defaults.squish
        this.fake = fields.fake
        this.flip = fields.flip
        this.disableNoteGravity = fields.disableNoteGravity
        this.disableNoteLook = fields.disableNoteLook
        this.disableSpawnEffect = fields.disableSpawnEffect
        this.link = fields.link
        this.disableBadCutDirection = fields.disableBadCutDirection
        this.disableBadCutSpeed = fields.disableBadCutSpeed
        this.disableBadCutSaberType = fields.disableBadCutSaberType
        this.disableDebris = fields.disableDebris
    }

    push(clone = true) {
        getActiveDifficulty().chains.push(clone ? copy(this) : this)
        return this
    }

    /** The amount of links in the chain. */
    links: number
    /** An interpolation or extrapolation of the path between the head and tail. */
    squish: number
    /** Moves the note to the separate fake note array on save. */
    fake?: boolean
    /** Specifies an initial position the chain will spawn at before going to it's unmodified position.  */
    flip?: Vec2
    /** Whether note gravity (the effect where notes move to their vertical row from the bottom row) is disabled. */
    disableNoteGravity?: boolean
    /** Whether this note looking at the player will be disabled. */
    disableNoteLook?: boolean
    /** Whether this note will have it's spawn effect hidden. */
    disableSpawnEffect?: boolean
    /** When cut, all notes with the same link string will also be cut. */
    link?: string
    /** Disable directional bad cuts on this note. */
    disableBadCutDirection?: boolean
    /** Disable bad cuts based on speed on this note. */
    disableBadCutSpeed?: boolean
    /** Disable bad cuts for using the wrong saber color on this note. */
    disableBadCutSaberType?: boolean
    /** Whether debris from this note should be disabled. */
    disableDebris?: boolean

    static defaults: GameplayObjectDefaults<Chain> = {
        links: 4,
        squish: 0,
        ...super.defaults,
    }

    get isGameplayModded() {
        if (this.fake) return true
        if (this.flip) return true
        if (this.disableNoteGravity) return true
        if (this.disableNoteLook) return true
        if (this.link) return true
        if (this.disableBadCutDirection) return true
        if (this.disableBadCutSpeed) return true
        if (this.disableBadCutSaberType) return true
        if (this.disableDebris) return true
        return super.isGameplayModded
    }

    fromJsonV3(json: bsmap.v3.IChain): this {
        this.links = json.sc ?? Chain.defaults.links
        this.squish = json.s ?? Chain.defaults.squish
        this.link = getCDProp(json, 'link')
        this.flip = getCDProp(json, 'flip')
        this.disableNoteLook = getCDProp(json, 'disableNoteLook')
        this.disableNoteGravity = getCDProp(json, 'disableNoteGravity')
        this.disableSpawnEffect = importInvertedBoolean(getCDProp(json, 'spawnEffect'))
        this.disableDebris = getCDProp(json, 'disableDebris')
        this.disableBadCutSpeed = getCDProp(json, 'disableBadCutSpeed')
        this.disableBadCutDirection = getCDProp(json, 'disableBadCutDirection')
        this.disableBadCutSaberType = getCDProp(json, 'disableBadCutSaberType')
        return super.fromJsonV3(json)
    }

    fromJsonV2(_json: never): this {
        throw 'V2 is not supported for chains'
    }

    toJsonV3(prune?: boolean): bsmap.v3.IChain {
        const output = {
            b: this.beat,
            c: this.color,
            d: this.cutDirection,
            sc: this.links,
            s: this.squish,
            tb: this.tailBeat,
            tx: this.tailX,
            ty: this.tailY,
            x: this.x,
            y: this.y,
            customData: {
                animation: this.animation as bsmap.v3.IAnimation['animation'],
                color: this.chromaColor,
                coordinates: this.coordinates,
                tailCoordinates: this.tailCoordinates,
                flip: this.flip,
                noteJumpMovementSpeed: this.noteJumpSpeed,
                noteJumpStartBeatOffset: this.getForcedOffset(),
                uninteractable: this.uninteractable,
                localRotation: this.localRotation,
                disableNoteGravity: this.disableNoteGravity,
                disableNoteLook: this.disableNoteLook,
                spawnEffect: exportInvertedBoolean(this.disableSpawnEffect, true),
                track: this.track.value,
                worldRotation: simplifyWorldRotation(this.worldRotation),
                link: this.link,
                disableBadCutDirection: this.disableBadCutDirection,
                disableBadCutSpeed: this.disableBadCutSpeed,
                disableBadCutSaberType: this.disableBadCutSaberType,
                disableDebris: this.disableDebris,
                ...this.customData,
            },
        } satisfies bsmap.v3.IChain
        return prune ? objectPrune(output) : output
    }

    toJsonV2(_prune?: boolean): never {
        throw 'V2 is not supported for chains'
    }
}
