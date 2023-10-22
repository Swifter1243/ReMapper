import { getActiveDiff } from '../data/beatmap_handler.ts'
import { bsmap } from '../deps.ts'
import { Vec2 } from '../types/data_types.ts'
import { copy } from '../utils/general.ts'
import { animationToJson } from './animation.ts'
import { BaseSliderObject, ExcludedObjectFields } from './object.ts'

export class Chain extends BaseSliderObject<bsmap.v3.IChain> {
    /**
     * Chain object for ease of creation.
     * @param time The time this chain will be hit.
     * @param tailTime The time that the tail of the chain reaches the player.
     * @param type The color of the chain.
     * @param direction The cut direction of the chain.
     * @param x The lane of the chain.
     * @param y The vertical row of the chain.
     * @param tailX The lane of the chain's tail.
     * @param tailY The vertical row of the chain's tail.
     * @param links The amount of links in the chain.
     */
    constructor(
        fields: ExcludedObjectFields<Chain>,
    ) {
        super(fields as ExcludedObjectFields<Chain>)
        this.fake = fields.fake ?? false
        this.links = fields.links ?? 4
        this.squish = fields.squish ?? 0
        this.flip = fields.flip
        this.noteGravity = fields.noteGravity ?? true
        this.noteLook = fields.noteLook ?? true
        this.spawnEffect = fields.spawnEffect ?? true
        this.link = fields.link
        this.directionBadCut = fields.directionBadCut ?? true
        this.speedBadCut = fields.speedBadCut ?? true
        this.saberTypeBadCut = fields.saberTypeBadCut ?? true
        this.debris = fields.debris ?? true
    }

    /**
     * Push this chain to the difficulty.
     * @param fake Whether this chain will be pushed to the fakeChains array.
     * @param clone Whether this object will be copied before being pushed.
     */
    push(clone = true) {
        getActiveDiff().chains.push(clone ? copy(this) : this)
        return this
    }

    toJson(v3: true): bsmap.v3.IChain
    toJson(v3: false): never
    toJson(v3 = true): bsmap.v3.IChain {
        if (!v3) throw 'V2 is not supported for chains'

        return {
            b: this.time,
            c: this.type,
            d: this.headDirection,
            sc: this.links,
            s: this.squish,
            tb: this.tailTime,
            tx: this.tailX,
            ty: this.tailY,
            x: this.x,
            y: this.y,
            customData: {
                animation: animationToJson(this.animation, v3),
                color: this.color,
                coordinates: this.coordinates,
                tailCoordinates: this.tailCoordinates,
                flip: this.flip,
                noteJumpMovementSpeed: this.NJS,
                noteJumpStartBeatOffset: this.offset,
                uninteractable: this.interactable ? undefined : true,
                localRotation: this.localRotation,
                disableNoteGravity: this.noteGravity ? undefined : true,
                disableNoteLook: this.noteLook ? undefined : true,
                track: this.track.value,
                worldRotation: this.rotation,
                spawnEffect: this.spawnEffect ? undefined : false,
                link: this.link,
                disableBadCutDirection: this.directionBadCut ? undefined : true,
                disableBadCutSpeed: this.speedBadCut ? undefined : true,
                disableBadCutSaberType: this.saberTypeBadCut ? undefined : true,
                disableDebris: this.debris ? undefined : true,
                ...this.customData,
            },
        } satisfies bsmap.v3.IChain
    }

    /** Moves the note to the separate fake note array on save. */
    fake?: boolean
    /** The amount of links in the chain. */
    links: number
    /** An interpolation or extrapolation of the path between the head and tail. */
    squish: number
    /** Specifies an initial position the chain will spawn at before going to it's unmodified position.  */
    flip?: Vec2
    /** Whether note gravity (the effect where notes move to their vertical row from the bottom row) is enabled. */
    noteGravity?: boolean
    /** Whether this chain will look at the player. */
    noteLook?: boolean
    /** Whether this note will have a spawn effect. */
    spawnEffect?: boolean
    /** When cut, all notes with the same link string will also be cut. */
    link?: string
    /** The ability to bad cut this note based on direction. */
    directionBadCut?: boolean
    /** The ability to bad cut this note based on speed. */
    speedBadCut?: boolean
    /** The ability to bad cut this note based on saber type. */
    saberTypeBadCut?: boolean
    /** Whether debris shows when this note is hit. */
    debris?: boolean
}
