import { combineAnimations, Keyframe, AnimationInternals, TrackValue, Track } from './animation';
import { activeDiff } from './beatmap';
import { Vec3, debugWall, copy, rotatePoint } from './general';
import { CustomEvent, CustomEventInternals } from './custom_event';
import { LOOKUP } from './constants';

let envCount = 0;
let blenderEnvCount = 0;
let trackData: any = []

const debugData = [
    { _definitePosition: [[0, 1, 0, 0]], _localRotation: [[0, 0, 0, 0]], _scale: [[1, 1, 1, 0]] },
    { _definitePosition: [[4, 1, 0, 0]], _localRotation: [[45, 0, 0, 0]], _scale: [[1, 1, 1, 0]] },
    { _definitePosition: [[0, 5, 0, 0]], _localRotation: [[0, 45, 0, 0]], _scale: [[1, 1, 1, 0]] },
    { _definitePosition: [[0, 1, 4, 0]], _localRotation: [[0, 0, 45, 0]], _scale: [[1, 1, 1, 0]] }
];

export class Environment {
    json: any = {};

    /**
     * Environment object for ease of creation and additional tools.
     * @param {String} id 
     * @param {String} lookupMethod 
     */
    constructor(id: string = undefined, lookupMethod: LOOKUP = undefined) {
        id ??= "";
        lookupMethod ??= LOOKUP.CONTAINS;
        this.id = id;
        this.lookupMethod = lookupMethod;
    }

    /**
    * Create an environment object using JSON.
    * @param {Object} json 
    * @returns {Environment}
    */
    import(json) {
        this.json = json;
        return this;
    }

    /**
     * Push this environment object to the difficulty
     */
    push() {
        if (this.track === undefined) this.trackSet = `environment${envCount}`;
        envCount++;
        if (activeDiff.environment === undefined) activeDiff.environment = [];
        activeDiff.environment.push(copy(this));
        return this;
    }

    get id() { return this.json._id }
    get lookupMethod() { return this.json._lookupMethod }
    get duplicate() { return this.json._duplicate }
    get active() { return this.json._active }
    get scale() { return this.json._scale }
    get position() { return this.json._position }
    get localPosition() { return this.json._localPosition }
    get rotation() { return this.json._rotation }
    get localRotation() { return this.json._localRotation }
    get lightID() { return this.json._lightID }
    get track() { return new Track(this.json._track) }
    get group() { return this.json._group }
    get animationProperties() {
        let returnObj: any = {};
        if (this.position !== undefined) returnObj._position = this.position;
        if (this.localPosition !== undefined) returnObj._localPosition = this.localPosition;
        if (this.rotation !== undefined) returnObj._rotation = this.rotation;
        if (this.localRotation !== undefined) returnObj._localRotation = this.localRotation;
        if (this.scale !== undefined) returnObj._scale = this.scale
        return returnObj;
    }

    set id(value: string) { this.json._id = value }
    set lookupMethod(value: LOOKUP) { this.json._lookupMethod = value }
    set duplicate(value: number) { this.json._duplicate = value }
    set active(value: boolean) { this.json._active = value }
    set scale(value: number[]) { this.json._scale = value }
    set position(value: number[]) { this.json._position = value }
    set localPosition(value: number[]) { this.json._localPosition = value }
    set rotation(value: number[]) { this.json._rotation = value }
    set localRotation(value: number[]) { this.json._localRotation = value }
    set lightID(value: number) { this.json._lightID = value }
    set trackSet(value: TrackValue) { this.json._track = value }
    set group(value: string) { this.json._group = value }
}

const blenderShrink = 9 / 10; // For whatever reason.. this needs to be multiplied to all of the scales to make things look proper... who knows man.

export namespace BlenderEnvironmentInternals {
    export class BaseBlenderEnvironment {
        scale: [number, number, number];
        anchor: [number, number, number];

        constructor(scale: Vec3, anchor: Vec3) {
            this.scale = <Vec3>scale.map(x => (1 / x) / 0.6);
            this.anchor = anchor;
        }

        processData(trackData: any[] | string) {
            let outputData = [];

            if (typeof trackData === "string") trackData = getTrackData(trackData);

            trackData.forEach(x => {
                let data = {
                    rawPos: [],
                    rawScale: [],
                    pos: [],
                    rot: [],
                    scale: []
                };

                let posData = x._definitePosition;
                let rotData = x._localRotation;
                let scaleData = x._scale;

                let longestArr = [];
                let length = Math.max(posData.length, rotData.length, scaleData.length);
                if (posData.length === length) longestArr = posData;
                if (rotData.length === length) longestArr = rotData;
                if (scaleData.length === length) longestArr = scaleData;

                let posIndex = 0;
                let rotIndex = 0;
                let scaleIndex = 0;

                for (let i = 0; i < length; i++) {
                    let pos = new Keyframe(posData[posIndex]);
                    let rot = new Keyframe(rotData[rotIndex]);
                    let scale = new Keyframe(scaleData[scaleIndex]);
                    let ref = new Keyframe(longestArr[i]);

                    posIndex++;
                    rotIndex++;
                    scaleIndex++;

                    if (pos.time !== ref.time) {
                        posIndex--;
                        pos = new Keyframe(posData[posIndex]);
                    }
                    if (rot.time !== ref.time) {
                        rotIndex--;
                        rot = new Keyframe(rotData[rotIndex]);
                    }
                    else data.rot.push(rot.data);
                    if (scale.time !== ref.time) {
                        scaleIndex--;
                        scale = new Keyframe(scaleData[scaleIndex]);
                    }
                    else {
                        data.rawScale.push([...scale.values.map(y => y * blenderShrink), ref.time]);
                        data.scale.push([...scale.values.map((y, i) => y * this.scale[i] * blenderShrink), ref.time]);
                    }

                    let objPos = pos.values as Vec3;
                    let objRot = rot.values as Vec3;
                    let objScale = scale.values;

                    data.rawPos.push([...objPos, ref.time]);
                    let offset = rotatePoint(objRot, objScale.map((y, i) => y * -this.anchor[i] * blenderShrink) as Vec3);
                    data.pos.push([...objPos.map((y, i) => y + offset[i]), ref.time]);
                }

                outputData.push(data);
            })

            return outputData;
        }
    }
    export class BlenderAssigned extends BaseBlenderEnvironment {
        track: string;
        disappearWhenAbsent: boolean;

        constructor(scale: Vec3, anchor: Vec3, track: string, disappearWhenAbsent: boolean) {
            super(scale, anchor);
            this.track = track;
            this.disappearWhenAbsent = disappearWhenAbsent;
        }

        getDataForTrack(dataTrack: string) {
            return this.processData(`${dataTrack}_${this.track}`);
        }

        static(dataTrack: string, forEvents: (moveEvent: CustomEventInternals.AnimateTrack) => void = undefined) {
            let data = this.getDataForTrack(dataTrack);

            if (data.length > 0) {
                let x = data[0];
                let objPos = [x.pos[0][0], x.pos[0][1], x.pos[0][2]];
                let objRot = [x.rot[0][0], x.rot[0][1], x.rot[0][2]];
                let objScale = [x.scale[0][0], x.scale[0][1], x.scale[0][2]];

                let moveEvent = new CustomEvent().animateTrack(this.track);
                moveEvent.animate.position = objPos;
                moveEvent.animate.rotation = objRot;
                moveEvent.animate.scale = objScale;
                if (forEvents !== undefined) forEvents(moveEvent);
                moveEvent.push();
            }
        }

        animate(dataTrack: string, time: number, duration: number, forEvents: (moveEvent: CustomEventInternals.AnimateTrack) => void = undefined) {
            let data = this.getDataForTrack(dataTrack);

            if (data.length > 0) {
                let x = data[0];

                let moveEvent = new CustomEvent(time).animateTrack(this.track);
                moveEvent.animate.position = x.pos;
                moveEvent.animate.rotation = x.rot;
                moveEvent.animate.scale = x.scale;
                moveEvent.duration = duration;
                if (forEvents !== undefined) forEvents(moveEvent);
                moveEvent.push();
            }
            else if (this.disappearWhenAbsent) {
                let moveEvent = new CustomEvent(time).animateTrack(this.track);
                moveEvent.animate.position = [0, -69420, 0];
                moveEvent.push();
            }
        }
    }
}

export class BlenderEnvironment extends BlenderEnvironmentInternals.BaseBlenderEnvironment {
    id: string;
    trackID: number;
    lookupMethod: LOOKUP;
    assigned: BlenderEnvironmentInternals.BlenderAssigned[] = [];
    objectAmounts: number[][] = [];
    maxObjects: number = 0;

    /**
    * Tool for using model data from ScuffedWalls for environments.
    * @param {Array} scale The scale of the object relative to a noodle unit cube.
    * @param {Array} anchor The anchor point of rotation on the object, 1 = length of object on that axis.
    */
    constructor(scale: Vec3, anchor: Vec3, id: string = undefined, lookupMethod: LOOKUP = undefined) {
        super(scale, anchor)
        this.id = id;
        this.lookupMethod = lookupMethod;
        this.trackID = blenderEnvCount;
        blenderEnvCount++;
    }

    /**
     * Assign pre-existing tracks to be animated with this environment. 
     * For example if the current data track is "shore" and you assign an object with track "cloud", there needs to be data for the track "shore_cloud".
     * In your shore model if you set the second material name to shore_cloud, you can move represent the cloud's transform by that object.
     * @param {Array} tracks Can be a single track or array of tracks.
     * @param {Vec3} scale
     * @param {Vec3} anchor
     * @param {Boolean} disappearWhenAbsent Determine whether to make this object disappear when no data for it is present in an environment.
     */
    assignObjects(tracks: string | string[], scale: Vec3 = undefined, anchor: Vec3 = undefined, disappearWhenAbsent: boolean = true) {
        scale ??= [1, 1, 1];
        anchor ??= [0, 0, 0];
        if (typeof tracks === "string") tracks = [tracks];
        tracks.forEach(x => { this.assigned.push(new BlenderEnvironmentInternals.BlenderAssigned(scale, anchor, x, disappearWhenAbsent)) })
    }

    /**
     * Look up the amount of objects active in the environment at a certain beat.
     * You'll want to do this after all of the environment switches (if any), so that the maximum can be properly calculated.
     * @param time 
     */
    lookupAmount(time) {
        let result = 0;
        this.objectAmounts.forEach(x => {
            if (time >= x[0]) result = x[1];
        })
        return result;
    }

    /**
     * Set the environment to be static. Should only be used once.
     * @param {String} dataTrack The track ScuffedWalls will output for this model's data.
     * If left undefined, a debug model with debug walls, useful for fitting objects to a cube, will be placed. 
     * @param {Function} forEnv Runs for each environment object.
     * @param {Function} forAssigned Runs for each assigned object moving event.
     */
    static(dataTrack: string = undefined, forEnv: (envObject: Environment, objects: number) => void = undefined, forAssigned: (moveEvent: CustomEventInternals.AnimateTrack) => void = undefined) {
        let data;
        if (dataTrack === undefined) data = this.processData(debugData);
        else data = this.processData(dataTrack);
        let objects = 0;

        data.forEach(x => {
            let pos = [x.pos[0][0], x.pos[0][1], x.pos[0][2]];
            let rot = [x.rot[0][0], x.rot[0][1], x.rot[0][2]];
            let scale = [x.scale[0][0], x.scale[0][1], x.scale[0][2]];

            let envObject = new Environment(this.id, this.lookupMethod);
            envObject.position = pos;
            envObject.rotation = rot;
            envObject.scale = scale;
            envObject.duplicate = 1;

            objects++;

            if (forEnv !== undefined) forEnv(envObject, objects);
            envObject.push();

            if (dataTrack === undefined) debugWall([x.rawPos[0][0], x.rawPos[0][1], x.rawPos[0][2]], rot, [x.rawScale[0][0], x.rawScale[0][1], x.rawScale[0][2]]);
        })

        this.maxObjects = objects;
        this.objectAmounts = [[0, objects]];

        this.assigned.forEach(x => { x.static(dataTrack, forAssigned) });
    }

    /**
     * Set the environment to switch to different models at certain times. Also uses model animations.
     * @param {Array} switches First element is the data track of the switch, second element is the time, 
     * third element (optional) is the duration of the animation.
     * fourth element (optional) is a function to run per environment moving event.
     * fifth element (optional) is a function to run per assigned object moving event.
     * @param {Function} forEnvSpawn function to run for each initial environment object.
     */
    animate(switches: [string, number, number?,
        ((moveEvent: CustomEventInternals.AnimateTrack, objects: number) => void)?,
        ((moveEvent: CustomEventInternals.AnimateTrack) => void)?
    ][], forEnvSpawn: (envObject: Environment) => void = undefined) {
        switches.sort((a, b) => a[1] - b[1]);

        switches.forEach(x => {
            let dataTrack = x[0];
            let time = x[1];
            let duration = x[2] ?? 0;
            let forEnv = x[3];
            let forAssigned = x[4];
            let data = this.processData(dataTrack);
            let objects = 0;

            data.forEach((x, i) => {

                let event = new CustomEvent(time).animateTrack(this.getPieceTrack(i), duration);
                event.animate.position = x.pos;
                event.animate.rotation = x.rot;
                event.animate.scale = x.scale;
                event.animate.optimize();
                if (forEnv !== undefined) forEnv(event, objects);
                event.push();

                objects++;
            })

            if (objects > this.maxObjects) this.maxObjects = objects;
            this.objectAmounts.push([time, objects]);

            this.assigned.forEach(x => { x.animate(dataTrack, time, duration, forAssigned) });
        })

        switches.forEach(x => {
            let time = x[1];
            let objects = this.lookupAmount(time);
            for (let i = objects; i < this.maxObjects; i++) {
                let event = new CustomEvent(time).animateTrack(this.getPieceTrack(i));
                event.animate.position = [0, -69420, 0];
                event.push();
            }
        })

        for (let i = 0; i < this.maxObjects; i++) {
            let envObject = new Environment(this.id, this.lookupMethod);
            envObject.position = [0, -69420, 0];
            envObject.duplicate = 1;
            envObject.trackSet = this.getPieceTrack(i);
            if (forEnvSpawn !== undefined) forEnvSpawn(envObject);
            envObject.push();
        }
    }

    /**
     * Get the track for a piece of the environment, if it's been animated.
     * @param {Number} index 
     * @returns {Number}
     */
    getPieceTrack(index: number) {
        return `blenderEnv${this.trackID}_${index}`;
    }
}

/**
 * Animate each environment piece in a given assigned group, with all of their individual transforms combined.
 * @param {String} group 
 * @param {Number} time 
 * @param {Number} duration 
 * @param {Object} animation
 * @param {String} easing 
 */
export function animateEnvGroup(group: string, time: number, duration: number, animation: AnimationInternals.BaseAnimation, easing: string = undefined) {
    if (activeDiff.environment !== undefined) activeDiff.environment.forEach(x => {
        if (x.group === group) {
            let newAnimation = copy(animation.json);

            Object.keys(newAnimation).forEach(key => {
                if (x.json[key]) newAnimation[key] = combineAnimations(newAnimation[key], x.json[key], key);
            })

            new CustomEvent(time).animateTrack(x.track.value as string, duration, newAnimation, easing).push();
        }
    })
}

/**
 * Animate an environment piece with a track, with all of it's initial transforms combined.
 * @param {String} group 
 * @param {Number} time 
 * @param {Number} duration 
 * @param {Object} animation
 * @param {String} easing 
 */
export function animateEnvTrack(track: string, time: number, duration: number, animation: AnimationInternals.BaseAnimation, easing: string = undefined) {
    if (activeDiff.environment !== undefined) activeDiff.environment.forEach(x => {
        if (x.track.has(track)) {
            let newAnimation = copy(animation.json);

            Object.keys(newAnimation).forEach(key => {
                if (x.json[key]) newAnimation[key] = combineAnimations(newAnimation[key], x.json[key], key);
            })

            new CustomEvent(time).animateTrack(track, duration, newAnimation, easing).push();
        }
    })
}

function getTrackData(track: string): any[] {
    if (!trackData[track]) {
        trackData[track] = [];
        for (let i = 0; i < activeDiff.notes.length; i++) {
            let note = activeDiff.notes[i];
            if (note.track.has(track)) {
                trackData[track].push(note.animation);
                activeDiff.notes.splice(i, 1);
                i--;
            }
        }
    }
    return trackData[track];
}