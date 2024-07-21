import { settings } from '../../data/settings.ts'
import { bsmap } from '../../deps.ts'
import { Vec2 } from '../../types/data.ts'
import { Fields, SubclassExclusiveProps } from '../../types/util.ts'
import {
    BaseSliderObject,
    ExcludedObjectFields,
    defaultBoolean,
    exportInvertedBoolean,
    getCDProp,
    importInvertedBoolean,
} from '../object.ts'
import {copy} from "../../utils/object/copy.ts";
import {objectPrune} from "../../utils/object/prune.ts";
import {activeDifficulty, getActiveDifficulty} from "../../data/active_difficulty.ts";
import {animationToJson} from "../../utils/animation/json.ts";

export class Chain extends BaseSliderObject<bsmap.v3.IChain> {
    constructor(
        fields: ExcludedObjectFields<Chain>,
    ) {
        super(fields as ExcludedObjectFields<Chain>)
        this.fake = fields.fake
        this.links = fields.links ?? 4
        this.squish = fields.squish ?? 0
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

    /** Moves the note to the separate fake note array on save. */
    fake?: boolean
    /** The amount of links in the chain. */
    links: number
    /** An interpolation or extrapolation of the path between the head and tail. */
    squish: number
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

    get isGameplayModded() {
        if (super.isGameplayModded) return true
        if (this.fake) return true
        if (this.flip) return true
        if (this.disableNoteGravity) return true
        if (this.disableNoteLook) return true
        if (this.link) return true
        if (this.disableBadCutDirection) return true
        if (this.disableBadCutSpeed) return true
        if (this.disableBadCutSaberType) return true
        if (this.disableDebris) return true
        return false
    }

    fromJson(json: bsmap.v3.IChain, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(json: never, v3: boolean): this {
        if (!v3) throw 'V2 is not supported for chains'

        type Params = Fields<
            SubclassExclusiveProps<
                Chain,
                BaseSliderObject<bsmap.v3.IBaseSlider>
            >
        >

        const obj = json as bsmap.v3.IChain

        const params = {
            // fake is defined when object is built
            flip: obj.customData?.flip,
            disableNoteLook: getCDProp(obj, 'disableNoteLook'),
            disableNoteGravity: getCDProp(obj, 'disableNoteGravity'),
            disableSpawnEffect: importInvertedBoolean(
                    getCDProp(obj, 'spawnEffect')
            ),
            disableDebris: getCDProp(obj, 'disableDebris'),
            disableBadCutSpeed: getCDProp(obj, 'disableBadCutSpeed'),
            disableBadCutDirection: getCDProp(obj, 'disableBadCutDirection'),
            disableBadCutSaberType: getCDProp(obj, 'disableBadCutSaberType'),
            link: getCDProp(obj, 'link'),
            links: obj.sc ?? 0,
            squish: obj.s ?? 0,
        } as Params

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.IChain
    toJson(v3: false, prune?: boolean): never
    toJson(v3 = true, prune = true): bsmap.v3.IChain {
        if (!v3) throw 'V2 is not supported for chains'

        const diff = activeDifficulty
        const NJS = this.noteJumpSpeed
        let offset = this.noteJumpOffset

        if (diff && settings.forceJumpsForNoodle && this.isGameplayModded) {
            offset ??= diff.noteJumpOffset
        }

        const output = {
            b: this.beat,
            c: this.type,
            d: this.headDirection,
            sc: this.links,
            s: this.squish,
            tb: this.tailBeat,
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
                noteJumpMovementSpeed: NJS,
                noteJumpStartBeatOffset: offset,
                uninteractable: defaultBoolean(this.uninteractable, false),
                localRotation: this.localRotation,
                disableNoteGravity: defaultBoolean(this.disableNoteGravity, false),
                disableNoteLook: defaultBoolean(this.disableNoteLook, false),
                spawnEffect: exportInvertedBoolean(this.disableSpawnEffect, true),
                track: this.track.value,
                worldRotation: this.worldRotation,
                link: this.link,
                disableBadCutDirection: defaultBoolean(this.disableBadCutDirection, false),
                disableBadCutSpeed: defaultBoolean(this.disableBadCutSpeed, false),
                disableBadCutSaberType: defaultBoolean(this.disableBadCutSaberType, false),
                disableDebris: defaultBoolean(this.disableDebris, false),
                ...this.customData,
            },
        } as bsmap.v3.IChain
        return prune ? objectPrune(output) : output
    }
}
