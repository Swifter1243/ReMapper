// deno-lint-ignore-file no-explicit-any adjacent-overload-signatures
import { Json } from './beatmap.ts';
import { jsonGet } from './general.ts';

export class CinemaScreen {
    json: Record<string, any> = {
        "videoID": undefined,
        "screenPosition": {
            "x": 0.0,
            "y": 12.4,
            "z": 67.8
        },
        "screenRotation": {
            "x": -8.0,
            "y": 0.0,
            "z": 0.0
        }
    }

    /**
     * Cinema Screen object for ease of creation
     * @param {CINEMA_LOOKUP} cinemaLookupMethod You can either play a video with Cinema by either using a YouTube video ID, or a video URL (YouTube, Facebook, Dailymotion, Vimeo)
     * @param {String} videoID YouTube video ID or video URL
     * @param {String} videoFile Name of the video file on the local file system.
     */
    constructor(cinemaLookupMethod: CINEMA_LOOKUP, videoID: string, videoFile?: string) {
        if (cinemaLookupMethod == "URL" && cinemaLookupMethod !== undefined) this.videoUrl = videoID;
        if (cinemaLookupMethod == "YoutubeID" && cinemaLookupMethod !== undefined) this.videoID = videoID;
        if (videoFile !== undefined) this.videoFile = videoFile;
    }

    /**
     * Create a note using Json.
     * @param json Json to import.
     */
     import(json: Json) {
        this.json = json;
        return this;
    }

    /**
     * Push Main Cinema Screen to cinema-video.json
     * @returns 
     */
    push() {
        // Warnings for out of range numbers for certain Cinema Properties
        function cinemaRange(thing: string, number: number) {
            console.log("\x1b[31m", `Cinema Warning: ${thing} value`, "\x1b[31m", number, "\x1b[31m", "out of range!",  "\x1b[0m")
        }
        if (this.curvature > 180 || this.curvature < 0) cinemaRange("curvature", this.curvature)
        if (this.subsurfaces > 256 || this.subsurfaces < 1) cinemaRange("subsurfaces", this.subsurfaces)
        if (this.colorCorrection.brightness < 0 || this.colorCorrection.brightness > 2) cinemaRange("colorCorrection.brightness", this.colorCorrection.brightness)
        if (this.colorCorrection.contrast > 5 || this.colorCorrection.contrast < 0) cinemaRange("colorCorrection.contrast", this.colorCorrection.contrast)
        if (this.colorCorrection.saturation > 5 || this.colorCorrection.saturation < 0) cinemaRange("colorCorrection..saturation", this.colorCorrection.saturation)
        if (this.colorCorrection.exposure > 5 || this.colorCorrection.exposure < 0) cinemaRange("colorCorrection.exposure", this.colorCorrection.exposure)
        if (this.colorCorrection.gamma > 5 || this.colorCorrection.gamma < 0) cinemaRange("colorCorrection.gamma", this.colorCorrection.gamma)
        if (this.colorCorrection.hue > 360 || this.colorCorrection.hue < -360) cinemaRange("colorCorrection.hue", this.colorCorrection.hue)

        Deno.writeTextFileSync("cinema-video.json", JSON.stringify(this.json, null, 2));
        return this;
    }

    // All definitions come from the official Cinema Documentation | https://github.com/Kevga/BeatSaberCinema

    /** The YouTube video ID from the part after the &v= in the URL, e.g.: youtube.com/watch?v=_qwnHeMKbVA */
    get videoID() { return this.json.videoID }
    /** Use this parameter instead of videoID if you want to use a video hoster other than YouTube. Provide the full video URL for this parameter. Currently supported are the following video sources: YouTube, Facebook, Dailymotion, Vimeo. */
    get videoUrl() { return this.json.videoUrl }
    /** The title of the video. Will be shown to the user. */
    get title() { return this.json.title }
    /** The name of the video's uploader. Will be shown to the user. */
    get author() { return this.json.author }
    /** Name of the video file on the local file system. Path is not included, the file is assumed to be in the map's folder. Will be set automatically after downloading and set to the title of the video, with illegal characters replaced by _. */
    get videoFile() { return this.json.videoFile }
    /** Video duration in seconds. Will be shown to the user, but has no other function than that. */
    get duration() { return this.json.duration }
    /** The offset in milliseconds to align the video with the map. Use the video menu in-game to determine the offset. */
    get offset() { return this.json.offset }
    /** Used to indicate whether the config was created by the mapper (as opposed to by the user). Changes the UI in various small ways. */
    get configByMapper() { return this.json.configByMapper }
    /** The environment that is supposed to be loaded. This allows you to force a specific environment that is only used if the user has Cinema installed and the video downloaded. This also disables the user's choice in the Override Environment setting of the base game, so please only use it if you have a good reason to do so. */
    get environmentName() { return this.json.environmentName }
    /** Allows you to adjust the playback speed of the video. */
    get playbackSpeed() { return this.json.playbackSpeed }
    /** Whether the video should loop if it ends before the map does. */
    get loop() { return this.json.loop }
    /** This parameter allows you to let a video end early (e.g. to hide sponsor segments, credits, logos etc.). The time references the video time, not the map time. The video will start fading out one second before this time is reached. Value is in seconds (e.g.: 296.5 would be 4 minutes and 56.5 seconds) */
    get endVideoAt() { return this.json.endVideoAt }
    /** This setting can be used to create a custom positioning of the video player. x is the deviation from the center, y is up/down and z controls the distance. y should usually be about half of the video height minus 0.1 if you want the video to be above the track.
This setting prevents the user from overriding the environment. */
    get position() { return this.json.screenPosition }
    /** Rotates the video screen. By default, it tilts down by 8 degrees for better visibility. */
    get rotation() { return this.json.screenRotation }
    /** Determines the size of the screen. There is no setting for the width, since that is calculated automatically by the height and the aspect ratio of the video. If you change the height, you might want to also change the y positioning of the screen so it doesn't float above the ground.
This setting prevents the user from overriding the environment. */
    get height() { return this.json.screenHeight }
    /** Use this setting to force a specific curvature of the screen. The allowed range of values is 0-180 (degrees). Setting this to 0 forces curvature to be disabled. If this parameter is not included and the user has curvature enabled, the curvature is calculated automatically based on the distance and the width of the screen. */
    get curvature() { return this.json.screenCurvature }
    /** This allows you to specify how many sub-surfaces the curved screen uses, which lets you control the smoothness of the curvature. Valid range is 1 to 256. The default of 32 looks great in most cases and doesn't cost much performance. */
    get subsurfaces() { return this.json.screenSubsurfaces }
    /** When set to false, will prevent the CustomPlatforms mod from loading a custom platform for this map if the video is playing. Can be used to override the user setting if the user set it to true for all maps. */
    get allowCustomPlatform() { return this.json.allowCustomPlatform }
    /** If set to true, will disable any environment modifications Cinema does by default for the selected environment. Only use this if you plan on modifying the environment in a different way to make the video player fit in. */
    get disableDefaultModifications() { return this.json.disableDefaultModifications }
    /** Set this to true to have your environment modifications applied even if no video is defined or downloaded by the user. */
    get forceEnvironmentModifications() { return this.json.forceEnvironmentModifications }
    /** If this is set to true, all cloned lights will be merged with existing prop groups, based on the specified z-position. Note: This will make lighting using light IDs nearly impossible, if you plan on using that. Also, if your cloned light is placed at a z-position where no pre-existing lights are, a new prop group will be created, which will change the IDs of other prop groups and potentially mess up your lightshow. */
    get mergePropGroups() { return this.json.mergePropGroups }
    /** Include this in your config if you want to override the user's choice and force transparency to be enabled or disabled. This does not disable the color blending, it only prevents light sources behind the screen from shining through. */
    get transparency() { return this.json.transparency }
    /** Sets the amount of bloom (glow) that appears around the video player during brightly colored parts of the video. */
    get bloom() { return this.json.bloom }

    /** If you want to make slight modifications to how the video looks, you can use these color correction options which get applied at runtime. This should be easier to use than having to make the edits in the video file itself and then re-uploading the edited version to YouTube. These settings are categorized under a top-level property named colorCorrection. See the example below. When adjusting these values, you can make use of the hot reloading capability of Cinema. Simply start the map, pause the game at a frame of the video you want to look differently, and start editing the config to see the results immediately. */
    get colorCorrection() { return jsonGet(this.json, "colorCorrection", {}) }
    /** Using the vignette effect you can change the shape of the video player or soften its edges. */
    get vignette() { return jsonGet(this.json, "vignette", {}) }



    set videoID(value: string) { this.json.videoID = value }
    set videoUrl(value: string) { this.json.videoUrl = value }
    set title(value: string) { this.json.title = value }
    set author(value: string) { this.json.author = value }
    set videoFile(value: string) { this.json.videoFile = value + ".mp4" }
    set duration(value: number) { this.json.duration = value }
    set offset(value: number) { this.json.offset = value }
    set configByMapper(value: boolean) { this.json.configByMapper = value }

    set environmentName(value: string) { this.json.environmentName = value }
    set playbackSpeed(value: number) { this.json.playbackSpeed = value }
    set loop(value: boolean) { this.json.loop = value }
    set endVideoAt(value: number) { this.json.endVideoAt = value }
    set position(value: [number, number, number]) { this.json.screenPosition.x = value[0], this.json.screenPosition.y = value[1], this.json.screenPosition.z = value[2] }
    set rotation(value: [number, number, number]) { this.json.screenRotation.x = value[0], this.json.screenRotation.y = value[1], this.json.screenRotation.z = value[2] }
    set height(value: number) { this.json.screenHeight = value }
    set curvature(value: number) { this.json.screenCurvature = value }
    set subsurfaces(value: number) { this.json.screenSubsurfaces = value }
    set allowCustomPlatform(value: boolean) { this.json.allowCustomPlatform = value }
    set disableDefaultModifications(value: boolean) { this.json.disableDefaultModifications = value }
    set forceEnvironmentModifications(value: boolean) { this.json.forceEnvironmentModifications = value }
    set mergePropGroups(value: boolean) { this.json.mergePropGroups = value }
    set transparency(value: boolean) { this.json.transparency = value }
    set bloom(value: number) { this.json.bloom = value }

    set colorCorrection(value: ColorCorrection) { this.json.colorCorrection = value }
    set vignette(value: Vignette) { this.json.vignette = value }

}

type ColorCorrection = {
    brightness: number,
    contrast: number,
    saturation: number,
    exposure: number,
    gamma: number,
    hue: number
}

type Vignette = {
    type: VignetteTypes,
    radius: number,
    softness: number
}

type VignetteTypes = 
    "rectangular" |
    "elliptical"

type CINEMA_LOOKUP =
    "YoutubeID" |
    "URL"
