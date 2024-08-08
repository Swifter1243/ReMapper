import { AnchorMode } from '../../../../data/constants/arc.ts'
import { bsmap } from '../../../../deps.ts'
import { copy } from '../../../../utils/object/copy.ts'
import { objectPrune } from '../../../../utils/object/prune.ts'
import { getActiveDifficulty } from '../../../../data/active_difficulty.ts'
import { NoteCut } from '../../../../data/constants/note.ts'
import { BaseSliderObject } from './base_slider.ts'
import { Vec2 } from '../../../../types/math/vector.ts'
import {defaultBoolean, getCDProp, simplifyWorldRotation} from '../../../../utils/beatmap/json.ts'
import { GameplayObjectDefaults, GameplayObjectConstructor } from '../../../../types/beatmap/object/gameplay_object.ts'

export class Arc extends BaseSliderObject<bsmap.v3.IArc> {
    /**
     * Arc object for ease of creation.
     */
    constructor(
        fields: GameplayObjectConstructor<Arc>,
    ) {
        super(fields)
        this.tailDirection = fields.tailDirection ?? Arc.defaults.tailDirection
        this.headLength = fields.headLength ?? Arc.defaults.headLength
        this.tailLength = fields.tailLength ?? Arc.defaults.tailLength
        this.anchorMode = fields.anchorMode ?? Arc.defaults.anchorMode
        this.flip = fields.flip
        this.disableNoteGravity = fields.disableNoteGravity
    }

    push(clone = true) {
        getActiveDifficulty().arcs.push(clone ? copy(this) : this)
        return this
    }

    /** The cut direction of the tail of the arc. */
    tailDirection: NoteCut
    /** Multiplier for the distance the start of the arc shoots outward. */
    headLength: number
    /** Multiplier for the distance the end of the arc shoots outward. */
    tailLength: number
    /** How the arc curves from the head to the midpoint. */
    anchorMode: AnchorMode
    /** Specifies an initial position the arc will spawn at before going to it's unmodified position.  */
    flip?: Vec2
    /** Whether note gravity (the effect where notes move to their vertical row from the bottom row) is disabled. */
    disableNoteGravity?: boolean

    static defaults: GameplayObjectDefaults<Arc> = {
        tailDirection: NoteCut.DOT,
        headLength: 0,
        tailLength: 0,
        anchorMode: AnchorMode.STRAIGHT,
        ...super.defaults,
    }

    /** Determines whether this note uses Noodle Extensions features. */
    get isGameplayModded() {
        if (this.flip) return true
        if (this.disableNoteGravity) return true
        return super.isGameplayModded
    }

    fromJsonV3(json: bsmap.v3.IArc): this {
        this.tailDirection = json.tc ?? Arc.defaults.tailDirection
        this.headLength = json.mu ?? Arc.defaults.headLength
        this.tailLength = json.tmu ?? Arc.defaults.tailLength
        this.anchorMode = json.m ?? Arc.defaults.anchorMode
        this.flip = getCDProp(json, 'flip')
        this.disableNoteGravity = getCDProp(json, 'disableNoteGravity')
        return super.fromJsonV3(json)
    }

    fromJsonV2(_json: never): this {
        throw 'V2 is not supported for arcs'
    }

    toJsonV3(prune?: boolean): bsmap.v3.IArc {
        const output = {
            b: this.beat,
            c: this.color,
            d: this.cutDirection,

            m: this.anchorMode,
            mu: this.headLength,
            tmu: this.tailLength,
            tc: this.tailDirection,

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
                uninteractable: defaultBoolean(this.uninteractable, false),
                localRotation: this.localRotation,
                disableNoteGravity: defaultBoolean(this.disableNoteGravity, false),
                track: this.track.value,
                worldRotation: simplifyWorldRotation(this.worldRotation),
                ...this.customData,
            },
        } satisfies bsmap.v3.IArc
        return prune ? objectPrune(output) : output
    }

    toJsonV2(_prune?: boolean): never {
        throw 'V2 is not supported for arcs'
    }
}
