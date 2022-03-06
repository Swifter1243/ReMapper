### Importing
In order for your script to include function, classes, or whatever else from this package, you'll need to import them.
If you know exactly what you want to import, you can type it out anywhere, press tab, and it'll be added to an import statement at the top like so:
```js
import { info, Difficulty } from "swifter_remapper";

info // you would press tab here
```
Keep in mind that some things may already exist in JS/TS, so use arrow keys to scroll to make sure it comes from "swifter_remapper".

If you want to explore what's in this package, you can add `import * as remapper from "swifter_remapper";` and then type `remapper` anywhere, add a period, and see what comes up.
It is preferred that you still autocomplete the imports, though. As otherwise you'll have to do prefix everything with `remapper.`
### Difficulty
In order to get started, you'll need a difficulty. Here you'll enter your input and output files. Input will be used as output if the output isn't specified.
```js
let map = new Difficulty("ExpertPlusStandard_Old.dat", "ExpertPlusStandard.dat");
```
At the end of your script, you would use the save method to export your map.
```js
map.save(); // Uses output specified earlier
```
Creating a difficulty will make any objects from here on out relavant to the created difficulty, unless changed. It will change when a new difficulty is created or the method `setActiveDiff` is used.

You can access a bunch of properties on the difficulties, as well as the Info.dat wrapper.
```js
map.NJS = 20;
console.log(info.version);
```
### Constants
Constants are an important part of this package, they provide lookups for certain values that might not be obvious at first.
For example, previously you might have to look up the ID for the type of an event that activates center lasers, but with constants you can use `EVENT.CENTER_LASERS` and that is equal to 4.
In most situations like this where the options for parameters might not be obvious, the use of constants are enforced to keep things nice and clean.
This is because it is easier to see all the options for constants. It is recommended that you explore constants until they end, as there are some cases where it might not be obvious you need to dive further:
```js
SETTINGS.NO_HUD // This provides the JSON path. You could probably inference this is a boolean.

SETTINGS.ENERGY_TYPE.VALUE // JSON path.
SETTINGS.ENERGY_TYPE.BAR // One of the options for this setting, a string called "Bar".
SETTINGS.ENERGY_TYPE.BATTERY // The other option "Battery".
// Multiple options are provided here, since it's not as easy to inference the inputs.
```
### Object Wrappers
Wrappers are essentially a more user friendly way for you to write noodle data.
You don't have to worry about checking if `_customData` and `_animation` exist, all of that is dealt with for you.
When accessing these wrappers, you'll be able to access a bunch of useful properties.
```js
notesBetween(0, 10, note => {
    note.color = [0, 0, 0];
    console.log(note.NJS); // Gets NJS from the relavant difficulty's NJS if it isn't specified on the note.
})
```
You can also create a Note or Wall:
```js
let wall = new Wall(0, 10, WALL.CROUCH);
```
After making changes to this wall, push it to the difficulty.
```js
wall.life = 4; // Wall lasts 4 beats
wall.lifeStart = 2; // Wall starts at beat 2
wall.push();
```
If you don't plan on referencing an object again, you don't need a variable for it.
```js
new Note(3, NOTE.BLUE, NOTE.LEFT, [0, 1, true]).push();
// true in the position will use noodle _position instead of lineIndex and lineLayer.
```
### Animation Wrapper
This wrapper is useful for easily creating animations. It also has some nice tools.
Notes, Walls, and animation events all contain an animation manager `animate`. Not to be confused with `animation`, which is equal to `_customData._animation`
Setting a property on the animation is going to add it to existing values, and sort by time.
```js
// Using the wall created above.

wall.animate.length = wall.life; // Divides the time in each keyframe by the life.

wall.animate.definitePosition = [0, 0, 0]; // Supports single keyframes, time is interpreted as 0 here.

wall.animate.definitePosition = [[0, 1, 0, 4, EASE.OUT_EXPO]] // Adds to existing keyframes and sorts by time.

wall.animate.definitePosition = [[0, 2, 0, -0.5]] // Negative number to use a length of 1 (it's converted to positive internally).

console.log(wall.animate.get(ANIM.DEFINITE_POSITION, 3)); // Get values at a certain time.

console.log(wall.animate.definitePosition); // Expected result: [[0, 0, 0, 0], [0, 2, 0, 0.5], [0, 1, 0, 1, "easeInOutExpo"]]

wall.push(); // Adds another wall, this time with the new changes we just made.
```
You can also create an animation and import it, if you'd like.
```js
let animation = new Animation().wallAnimation(); // You'll need to specify what type of animation this will be.
wall.importAnimation(animation);
```