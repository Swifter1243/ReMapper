import { ANIM, Color, CustomEvent, Difficulty, EASE, Event, LightRemapper, Note, notesBetween, WALL, Wall } from "swifter_remapper";
// ^ Autocompleting when typing stuff from this package imports them automagically!! Otherwise TS will complain that it doesn't exist.

import * as remapper from "swifter_remapper";
// If you want to easily search stuff in the package, try adding this line, typing "remapper" anywhere, add a "." and see what shows up!

// Input, Output. Will use input as output if the output isn't specified :)
let map = new Difficulty("ExpertPlusStandard_Old.dat", "ExpertPlusStandard.dat");



notesBetween(0, 10, note => {
    // All the properties are just there and available :)
    note.color = [0, 0, 0];
    note.NJS = 69;
})



// Let's create a new wall!
// It will ask you for things like time, duration.. etc but there are default values if you don't enter them.
let wall = new Wall(0, 10, WALL.CROUCH); // Good example of how the provided constants are used. WALL.CROUCH is equal to 1.

wall.push(); // Adds the wall to the current difficulty.

// Wall starts at beat 2, and ends at beat 6.
wall.life = 4;
wall.lifeStart = 2; // This needs to be set after life, so that the start can be calculated properly.

wall.animate.length = wall.life; // Divides the time in each keyframe by the life.

wall.animate.definitePosition = [0, 0, 0]; // Supports single keyframes, time is interpreted as 0 here.

wall.animate.definitePosition = [[0, 1, 0, 4, EASE.OUT_EXPO]] // Adds to existing keyframes and sorts by time. Easing constants too!

wall.animate.definitePosition = [[0, 2, 0, -0.5]] // Negative number to use a length of 1 if animation length is different.

console.log(wall.animate.get(ANIM.DEFINITE_POSITION, 3)); // Get values at a certain time. 

console.log(wall.animate.definitePosition); // Expected result: [[0, 0, 0, 0], [0, 2, 0, 0.5], [0, 1, 0, 1, "easeInOutExpo"]]

wall.push(); // Adds another wall, this time with the new changes we just made.



// If you don't plan on referencing this object in any other lines, you don't need a variable.
new Event(2).backLasers().fade(true).push(); // Blue (isBlue = true) fade event at beat 2.



// Rainbow notes!
for (let i = 0; i <= 1; i++) {
    let time = 2 + (i * 4); // Starts at beat 2, for 4 beats.
    let color = new Color([i, 1, 1], "HSV"); // Hue will be cycled through in for loop, saturation and value will be full.

    let note = new Note(time);
    note.color = color.export(); // Converts to RGB and returns value array.
    note.push();
}



// Custom event support too, hopefully you should be able to understand what's going on here.
new CustomEvent().assignFogTrack("fog").push();

let event = new CustomEvent(2).animateTrack("fog", 10);
event.animate.attenuation = [[0,0],[0.001,1]]
event.push();

/* I'm lazy rn I'll add more examples later for:
- regex
- light remapper
- blendertoenv
*/

map.save(); // Overrides the output defined earlier.