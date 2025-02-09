

/** Convert seconds to beats given a bpm. Doesn't account for bpm changes. */
export function rawSecondsToBeats(seconds: number, bpm: number) {
    return seconds * (bpm / 60)
}

/** Convert beats to seconds given a bpm. Doesn't account for bpm changes. */
export function rawBeatsToSeconds(beats: number, bpm: number) {
    return beats * (60 / bpm)
}

