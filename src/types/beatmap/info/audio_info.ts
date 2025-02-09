export type IAudioInfo = IAudioInfoV2 | IAudioInfoV4
export type IAudioInfoV2 = {
    songFilename: string
    beatsPerMinute: number
    previewStartTime: number
    previewDuration: number
}
export type IAudioInfoV4 = IAudioInfoV2 & {
    songDuration: number
    audioDataFilename: string
    lufs: number
}
