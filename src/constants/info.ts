import { bsmap } from '../deps.ts'

export const DIFFICULTY_TO_RANK = {
    Easy: 1,
    Normal: 3,
    Hard: 5,
    Expert: 7,
    ExpertPlus: 9
} satisfies Record<bsmap.DifficultyName, bsmap.DifficultyRank>