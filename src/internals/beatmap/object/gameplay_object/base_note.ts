import { ExcludedObjectFields } from '../../../../types/beatmap/object/object.ts'
import { NoteAnimationData } from '../../../../types/animation.ts'
import { Vec2 } from '../../../../types/data.ts'
import { Fields, SubclassExclusiveProps } from '../../../../types/util.ts'
import { getCDProp, importInvertedBoolean } from '../../../../utils/beatmap/object.ts'
import { BeatmapGameplayObject } from './gameplay_object.ts'
import { bsmap } from '../../../../deps.ts'

export abstract class BaseNote<
    TV3 extends bsmap.v3.IColorNote | bsmap.v3.IBombNote,
> extends BeatmapGameplayObject<bsmap.v2.INote, TV3> {
    constructor(
        fields: ExcludedObjectFields<BaseNote<TV3>>,
    ) {
        super(fields as ExcludedObjectFields<BaseNote<TV3>>)
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

    /**
     * Push this note to the difficulty.
     * @param clone Whether this object will be copied before being pushed.
     */
    abstract push(clone: boolean): void

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

    fromJson(json: TV3, v3: true): this
    fromJson(json: bsmap.v2.INote, v3: false): this
    fromJson(json: TV3 | bsmap.v2.INote, v3: boolean): this {
        type Params = Fields<
            SubclassExclusiveProps<
                BaseNote<TV3>,
                BeatmapGameplayObject<bsmap.v2.INote, TV3>
            >
        >

        if (v3) {
            const obj = json as TV3

            const params = {
                flip: getCDProp(obj, 'flip'),

                disableNoteLook: getCDProp(obj, 'disableNoteLook'),
                disableNoteGravity: getCDProp(obj, 'disableNoteGravity'),
                disableSpawnEffect: importInvertedBoolean(
                    getCDProp(obj, 'spawnEffect'),
                ),
                disableDebris: getCDProp(obj, 'disableDebris'),
                // TODO: Badcut on bombs is incorrect.
                disableBadCutSpeed: getCDProp(obj, 'disableBadCutSpeed'),
                disableBadCutDirection: getCDProp(obj, 'disableBadCutDirection'),
                disableBadCutSaberType: getCDProp(obj, 'disableBadCutSaberType'),
                link: getCDProp(obj, 'link'),
            } as Params

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        } else {
            const obj = json as bsmap.v2.INote

            const params = {
                flip: getCDProp(obj, '_flip'),

                disableNoteLook: getCDProp(obj, '_disableNoteLook'),
                disableNoteGravity: getCDProp(obj, '_disableNoteGravity'),
                disableSpawnEffect: getCDProp(obj, '_disableSpawnEffect'),
                fake: getCDProp(obj, '_fake'),
            } as Params

            // Walls in V2 don't have a "y" property
            this.y = obj._lineLayer

            Object.assign(this, params)
            return super.fromJson(obj, v3)
        }
    }
}
