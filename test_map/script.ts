import * as rm from '../src/mod.ts'

const map = await rm.readDifficultyV3('ExpertPlusLawless', 'ExpertPlusStandard')

// ----------- { SCRIPT } -----------

// Example: Run code on every note!

// map.notes.forEach(note => {
//     console.log(note.time)
// })

// ----------- { OUTPUT } -----------

map.save()
