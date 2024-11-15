import {ReMapperWorkspace} from "../types/remapper/rm_workspace.ts";
import {AbstractDifficulty} from "../internals/beatmap/abstract_beatmap.ts";
import {IDifficultyInfo} from "../types/beatmap/info/difficulty_info.ts";

let activeWorkspace: ReMapperWorkspace
const workspaceDifficulties: Set<IDifficultyInfo> = new Set()

export function loadWorkspace(workspace: ReMapperWorkspace) {
    if (activeWorkspace) {
        throw new Error("ReMapper already has a workspace loaded!")
    }

    activeWorkspace = workspace
}

export function addWorkspaceDifficulty(difficulty: AbstractDifficulty) {
    workspaceDifficulties.add(difficulty.difficultyInfo)
}