import { activeDifficulty, getActiveDifficulty, settings } from '../data/beatmap_handler.ts'
import { AnchorMode, NoteCut } from '../data/constants.ts'
import { bsmap } from '../deps.ts'
import { Vec2 } from '../types/data_types.ts'
import { Fields, SubclassExclusiveProps } from '../types/util_types.ts'
import { copy } from '../utils/general.ts'
import { jsonPrune } from '../utils/json.ts'
import { animationToJson } from './animation.ts'
import {
    BaseSliderObject,
    ExcludedObjectFields,
    exportInvertedBoolean,
    getCDProp,
    importInvertedBoolean,
} from './object.ts'

export class Arc extends BaseSliderObject<bsmap.v3.IArc> {
    /**
     * Arc object for ease of creation.
     * @param beat The time this arc will be hit.
     * @param tailBeat The time that the tail of the arc reaches the player.
     * @param type The color of the arc.
     * @param headDirection The cut direction of the head of the arc.
     * @param tailDirection The cut direction of the tail of the arc.
     * @param x The lane of the arc.
     * @param y The vertical row of the arc.
     * @param tailX The lane of the arc's tail.
     * @param tailY The vertical row of the arc's tail.
     */
    constructor(
        fields: ExcludedObjectFields<Arc>,
    ) {
        super(fields as ExcludedObjectFields<Arc>)
        this.tailDirection = fields.tailDirection ?? NoteCut.DOT
        this.headLength = fields.headLength ?? 0
        this.tailLength = fields.tailLength ?? 0
        this.anchorMode = fields.anchorMode ?? AnchorMode.STRAIGHT
        this.flip = fields.flip
        this.noteGravity = fields.noteGravity ?? true
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
    /** Whether note gravity (the effect where notes move to their vertical row from the bottom row) is enabled. */
    noteGravity?: boolean

    /** Determines whether this note uses Noodle Extensions features. */
    get isGameplayModded() {
        if (super.isGameplayModded) return true
        if (this.flip) return true
        if (this.noteGravity === false) return true
        return false
    }

    fromJson(json: bsmap.v3.IArc, v3: true): this
    fromJson(json: never, v3: false): this
    fromJson(json: never, v3: boolean): this {
        if (!v3) throw 'V2 is not supported for arcs'

        type Params = Fields<
            SubclassExclusiveProps<
                Arc,
                BaseSliderObject<bsmap.v3.IBaseSlider>
            >
        >

        const obj = json as bsmap.v3.IArc

        const params = {
            anchorMode: obj.m ?? 0,
            flip: getCDProp(obj, 'flip'),
            headLength: obj.mu ?? 0,
            noteGravity: importInvertedBoolean(
                getCDProp(obj, 'disableNoteGravity'),
            ),
            tailDirection: obj.tc ?? 0,
            tailLength: obj.tmu ?? 0,
        } satisfies Params

        Object.assign(this, params)
        return super.fromJson(obj, v3)
    }

    toJson(v3: true, prune?: boolean): bsmap.v3.IArc
    toJson(v3: false, prune?: boolean): never
    toJson(v3 = true, prune = true): bsmap.v3.IArc {
        if (!v3) throw 'V2 is not supported for arcs'

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
                animation: animationToJson(this.animation, v3),
                color: this.color,
                coordinates: this.coordinates,
                tailCoordinates: this.tailCoordinates,
                flip: this.flip,
                noteJumpMovementSpeed: NJS,
                noteJumpStartBeatOffset: offset,
                uninteractable: exportInvertedBoolean(this.interactable, false),
                localRotation: this.localRotation,
                disableNoteGravity: exportInvertedBoolean(
                    this.noteGravity,
                    false,
                ),
                track: this.track.value,
                worldRotation: this.worldRotation,
                ...this.customData,
            },
        } satisfies bsmap.v3.IArc
        return prune ? jsonPrune(output) : output
    }
}
