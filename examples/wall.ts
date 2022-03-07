// This is a test file, but it provides an example.

import {ANIM, Difficulty, EASE, Wall, WALL} from '../src/main'
const map = new Difficulty("INPUT.dat", "OUTPUT.dat");

// \/ Start of script, unsert your script below this line.

// Create a new wall.
const wall = new Wall(0, 10, WALL.CROUCH);

wall.fake = true;
wall.life = 4;
wall.lifeStart = 2; // This needs to be set after life, so that the start can be calculated properly.
wall.animate.length = wall.life; // Divides the time in each keyframe by the life.
wall.animate.definitePosition = [0, 0, 0]; // Supports single keyframes, time is interpreted as 0 here.
wall.animate.definitePosition = [[0, 1, 0, 4, EASE.OUT_EXPO]] // Adds to existing keyframes and sorts by time. Easing constants too!
wall.animate.definitePosition = [[0, 2, 0, -0.5]] // Negative number to use a length of 1 if animation length is different.

console.log(wall.animate.get(ANIM.DEFINITE_POSITION, 3)); // Get values at a certain time. 
console.log(wall.animate.definitePosition); // Expected result: [[0, 0, 0, 0], [0, 2, 0, 0.5], [0, 1, 0, 1, "easeInOutExpo"]]

wall.push();

// /\ End of script, insert your script above this line.

map.save();