import { BeatmapGameplayObject } from './gameplay_object.ts'
import { bsmap } from '../../../../deps.ts'
import { Vec2 } from '../../../../types/math/vector.ts'
import { NoteAnimationData } from '../../../../types/animation/properties/note.ts'
import { getCDProp, importInvertedBoolean } from '../../../../utils/beatmap/json.ts'
import { GameplayObjectDefaults, GameplayObjectConstructor } from '../../../../types/beatmap/object/gameplay_object.ts'
import { IV3Note } from '../../../../types/beatmap/object/note.ts'

export abstract class BaseNote<
    TV3 extends IV3Note = IV3Note,
> extends BeatmapGameplayObject<bsmap.v2.INote, TV3> {
    constructor(
        fields: GameplayObjectConstructor<BaseNote<TV3>>,
    ) {
        super(fields)
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

    declare animation: NoteAnimationData

    /** Moves the note to the separate fake note array on save. */
    fake?: boolean
    /** Specifies an initial position the note will spawn at before going to it's unmodified position.  */
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

    static override defaults: GameplayObjectDefaults<BaseNote> = {
        ...super.defaults,
    }

    /**
     * Push this note to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    abstract push(clone: boolean): void

    override get isGameplayModded() {
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

    override fromJsonV3(json: TV3): this {
        this.flip = getCDProp(json, 'flip')
        this.disableNoteLook = getCDProp(json, 'disableNoteLook')
        this.disableNoteGravity = getCDProp(json, 'disableNoteGravity')
        this.disableSpawnEffect = importInvertedBoolean(getCDProp(json, 'spawnEffect'))
        this.disableDebris = getCDProp(json, 'disableDebris')
        this.disableBadCutSpeed = getCDProp(json, 'disableBadCutSpeed')
        this.disableBadCutDirection = getCDProp(json, 'disableBadCutDirection')
        this.disableBadCutSaberType = getCDProp(json, 'disableBadCutSaberType')
        this.link = getCDProp(json, 'link')
        return super.fromJsonV3(json)
    }

    override fromJsonV2(json: bsmap.v2.INote): this {
        this.flip = getCDProp(json, '_flip')
        this.disableNoteLook = getCDProp(json, '_disableNoteLook')
        this.disableNoteGravity = getCDProp(json, '_disableNoteGravity')
        this.disableSpawnEffect = getCDProp(json, '_disableSpawnEffect')
        this.fake = getCDProp(json, '_fake')
        this.y = json._lineLayer
        return super.fromJsonV2(json)
    }
}
