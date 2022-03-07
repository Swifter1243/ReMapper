# Practical Examples

Practical examples, and a template can be found in the [examples](/examples/) folder.


# Importing
In order for your script to include functions, classes, or whatever else from this package, you'll need to import them.
If you know exactly what you want to import, you can type it out anywhere, press tab, and it'll be added to an import statement at the top like so:
```js
import { info, Difficulty } from "swifter_remapper";

info // you would press tab here
```
Keep in mind that some things may already exist in JS/TS, so use arrow keys to scroll to make sure it comes from "swifter_remapper".

If you want to explore what's in this package, you can add `import * as remapper from "swifter_remapper";` and then type `remapper` anywhere, add a period, and see what comes up. It is preferred that you still autocomplete the imports, though. As otherwise you'll have to prefix everything with `remapper.`
# Difficulties
In order to get started, you'll need a difficulty. Here you'll enter your input and output files. Input will be used as output if the output isn't specified.
```js
let map = new Difficulty("ExpertPlusStandard_Old.dat", "ExpertPlusStandard.dat");
```
After you're done scripting this difficulty, you would use the save method to export your map.
```js
map.save(); // Uses output specified earlier
```
Creating a difficulty will make any objects from here on out relavant to the created difficulty, unless changed. It will change when a new difficulty is created or the method `setActiveDiff()` is used.

You can access a bunch of properties on the difficulties, as well as the Info.dat wrapper.
```js
map.NJS = 20; // When typing "map" and then adding a period, all your options for properties will be revealed. This goes for all wrappers.
console.log(info.version);
```
# Constants
Constants are an important part of this package, they provide lookups for certain values that might not be easy to remember. For example, previously you might have to look up the ID for the type of an event that activates center lasers, but with constants you can use `EVENT.CENTER_LASERS` and that is equal to 4. 

In most situations like this where the options for parameters might not be obvious, the use of constants are enforced to keep things nice and clean. This is because it is easier to see all the options for constants. It is recommended that you explore constants until they end, as there are some cases where it might not be obvious you need to dive further:
```js
SETTINGS.NO_HUD // This provides the JSON path for the setting relative to _settings.

// The only thing provided here is a path, as it's easily inferencable that you input a boolean.

SETTINGS.ENERGY_TYPE.VALUE // JSON path.
SETTINGS.ENERGY_TYPE.BAR // One of the options for this setting, a string called "Bar".
SETTINGS.ENERGY_TYPE.BATTERY // The other option "Battery".

// Multiple options are provided here, since it's not as easy to inference the inputs.
```
# Objects (Notes, Walls)
Wrappers are essentially a more user friendly way for you to create object data.
You don't have to worry about checking if `_customData` and `_animation` exist, all of that is dealt with for you.
When accessing these wrappers, you'll be able to access a bunch of useful properties.
```js
notesBetween(0, 10, note => {
    note.color = [0, 0, 0];
    console.log(note.NJS); // Gets NJS from the relavant difficulty's NJS if it isn't specified on the note.
})
```
You can also create a new object:
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
// "true" in this position argument will use noodle position instead of lineIndex and lineLayer.
```
# Animation
This wrapper is useful for easily creating animations. It also has some nice tools.
Notes, Walls, and animation events all contain an animation manager `animate`. Not to be confused with `animation`, which is equal to `_customData._animation`.

Firstly, you can set the length of the animation to divide each keyframe's time. In this case we're using the wall from before with a lifetime of 4 beats.
```js
wall.animate.length = wall.life;
```
Single keyframes are supported by using a single array, time will be interpreted as 0 here.
```js
wall.animate.definitePosition = [0, 0, 0];
```
Setting a property actually adds to existing keyframes and sorts by time.
```js
wall.animate.definitePosition = [[0, 1, 0, 4, EASE.OUT_EXPO]] // Easings and splines work too!
```
You can use a negative number for time to return to a range of 0-1, it will be converted to positive internally.
```js
wall.animate.definitePosition = [[0, 2, 0, -0.5]]
```
This wrapper also allows you to grab what the values of a property would be at a certain time. It accounts for easings, splines, and what the property actually is (rotations interpolate differently than positions, for example).
```js
console.log(wall.animate.get(ANIM.DEFINITE_POSITION, 3)); // Get values at time 3, which is also divided by the length.
```
So far this animation would end up as: `[[0, 0, 0, 0], [0, 2, 0, 0.5], [0, 1, 0, 1, "easeInOutExpo"]]`

You can also create an animation and import it, if you'd like.
```js
let animation = new Animation().wallAnimation(); // You'll need to specify what type of animation this will be.
animation.scale = [[1, 1, 1, 0], [2, 2, 2, 1]];
wall.importAnimation(animation);
```
If you are dealing with animations with a large amount of points, like keyframe exports from blender for example, it may be a good idea to call the `optimize()` method on the animation in order to cut down on points. This method does it's best to reduce point count while retaining the shape of the animation.
# Color
The color class is used to express colors in different formats. Right now RGB and HSV (hue, saturation, value) is supported. Here's a quick code example on how expressing colors with HSV could be useful:
```js
// Rainbow notes!
for (let i = 0; i <= 1; i++) {
    let time = 2 + (i * 4); // Starts at beat 2, for 4 beats.
    let color = new Color([i, 1, 1], "HSV"); // Hue will be cycled through in for loop, saturation and value will be full.

    let note = new Note(time);
    note.color = color.export(); // Converts to RGB and returns value array.
    note.push();
}
```
# Events
Events are similar to making Notes and Walls, but they have subclasses, which means you will need to further specify what kind of event it will be.
```js
new Event(2).backLasers().fade(true).push(); // This will create a blue (blue = true) fade event on the back lasers at beat 2.
```
You'll know initialization is completed when you can see `push()` as an option, for example.
# Custom Events
Custom events are also similar to events, they have subclasses and will require an extra method to initialize.
```js
new CustomEvent().assignFogTrack("fog").push();
```
Animation related events have an animation class attached to them.
```js
let event = new CustomEvent(2).animateTrack("fog", 10);
event.animate.attenuation = [[0, 0], [0.001, 1]];
event.push();
```
# Environment
Environment objects also have wrappers to make use of them easier.
```js
// Only a handful of environment pieces have constants for their ID, feel free to PR more!
let env = new Environment(ENV.BTS.PILLAR.ID, "Regex");
env.duplicate = 1;
env.position = [0, 10, 0];
env.push();
```
Regex classes also exist to easily generate regex statements for environment stuff.
```js
let regex = new Regex().start().add("PillarPair").vary(4).seperate().add("PillarL").end().string;
```
This would result in `\\]PillarPair \\(4\\)\\.\\[\\d*\\]PillarL$`. You can also verify the validity of a regex expression with `verify()`.

If you add a track to an environment object, you can animate it with it's original transforms specified in the environment statement combined to the animation's.
```js
let animation = new Animation(5).environmentAnimation();
animation.position = [[0, 0, 0, 0], [0, -10, 0, 5, EASE.IN_OUT_EXPO]];

env.track = "pillar";
env.push();
animateEnvTrack(env.track, 3, animation.length, animation);
```
The expected animation as a result of this would be: `[[0, 10, 0, 0], [0, 0, 0, 1, "easeInOutExpo"]]`

You can also assign a `group`, and call `animateEnvGroup()` to do this for every object in a given group.
# Blender Environment
This is an improvement of my previous [BlenderToEnvironment](https://github.com/Swifter1243/BlenderToEnvironment) repo. 

Just like before, you'll need a setup with ScuffedWalls in order to get this to work. `SW_SCRIPT` and `SW_MODEL` exist as constants for the statements you can copy and paste into your ScuffedWalls script to both get the script running from it and get the model exported. But I'm nice so I'll put them here since you're reading this:
```
0:Run
  Script:script.ts
  RunBefore: false
  RefreshOnSave: true

0:ModelToWall
  Path:model.dae
  Track:model
  Type:3
```
Remember that ScuffedWalls already exports it's changes to your output diff, so for this script you'd want to provide your output diff as your input and output.
```js
let map = Difficulty("ExpertPlusStandard.dat");
```
You absolutely need ScuffedWalls to be running from your map directory, or else this package will throw an error because it won't be able to find the files for the map.

This time the environments are in the form of a class, which stores the transformation data for the environment piece to get it fitting to the model, and also the data for creation of the environment pieces if you plan to use it to place them.
```js
// Again, only a handful of environment pieces have scales and anchors available as constants.
let blenderEnv = new BlenderEnvironment(ENV.BTS.PILLAR.SCALE, ENV.BTS.PILLAR.ANCHOR, ENV.BTS.PILLAR.ID, "Regex");
```
The way scale works is that it represents the object's size relative to a noodle cube. Each value is divided by `0.6`, since the scale is more likely to be relavant to unity units, rather than noodle units (0.6 of a unity unit). Each value is also an inverse value, as most of the time you're scaling down. So inputting 2 would end up halving the scale.

Anchor is the location of the anchor of rotation/scaling relative to the center of the object. 1 is the full width of the object on a given axis. For example if the anchor point of an object was found in the middle on the x and z axis, but at the bottom of the object on the y axis, the anchor would be `[0, -0.5, 0]` since the anchor is found downwards by half of the object's height.

When it comes to actually spawning in the objects, you have 2 options. The first is to use the `static()` method, which uses no animations and is intended to stay the same way the entire map.
```js
blenderEnv.static("model"); // Needs to be the same track as the model!
```
There is additionally a boolean that can be added after the data track to instead use a debug model with a debug wall, useful for getting your scale and offset right. The object should be fitting the cube.

The other option is to use the `animate()` method, which allows you to switch between models during the map, and supports animations. Environment pieces are recycled, so you aren't adding the count of each model's pieces to the map every time you switch. All animations will also be automatically optimized to cut down on points, since blender animation exports are notorious for keyframe spam.
```js
blenderEnv.animate([
    ["", 0], // Blank model, at time 0.
    ["model", 10, 20] // Model with an animation duration of 20, at time 10.
])
```
Alternatively, you can simply use `processData()` to get the raw math output from this algorithm if you'd like to do something completely seperate with it.

You can also assign other tracks to be animated with this environment. For example if you assign a track called "cloud", if you were to then switch to "model", you could represent the position of "cloud" in the model as an object with the track "model_cloud". You can add tracks to objects by renaming the second material on the object in blender. This object can also be animated.
```js
blenderEnv.assignObjects("cloud", ENV.BTS.LOW_CLOUDS.SCALE, ENV.BTS.LOW_CLOUDS.ANCHOR);
```
This will also work with the static method, but it will use an animation event to reposition the object.
# Light Remapper
This is a class mostly focused on refactoring the order of lightIDs in a given range. The reason this might be needed is if for example you have duplicated lights, and would like to light them in the editor, and have the events automatically carry over.
```js
let lightRemapper = new LightRemapper(EVENT.RING_LIGHTS); // This will target the events in the ring lights.
```
It can do a couple basic things like let you multiply the colors by a value, or override the lightID and type, but where it really shines is the things to do with editing lightIDs. From here on out whenever I show a sequence of lightIDs, I'm basically providing examples of possible input lightIDs.

In the most basic example, you can simply add a number to the end of all the lightIDs.
```js
lightRemapper.addToEnd(1); // [1, 2, 3] --> [2, 3, 4]
```
If the sequence starts at 1 and the differences are 1 (sequence is normalized), you can also provide a step value to change the distance between each lightID.
```js
lightRemapper.addToEnd(1, 3); // [1, 2, 3] --> [2, 5, 8]
// Look at the differences from number to number. It changes from 1 to 3, and then 1 is also added.
```
Again assuming the sequence is normalized, You can also specify the points at which the differences between values change.
```js
lightRemapper.remapEnd([[1, 1],[3, 2]]); // [1, 2, 3, 4, 5] --> [1, 2, 3, 5, 7]
// At the first number, the differences are 1. At the third number, they become 2.
```
If you have a situation where the input sequence of lightIDs is not normalized, you can normalize it. There's 2 ways to do this, if there is a consistent difference the entire way, you can use `normalizeLinear()`:
```js
lightRemapper.normalizeLinear(2, 3); // [2, 5, 8, 11, 14] --> [1, 2, 3, 4, 5]
// The sequence starts at 2, and the differences between numbers is 3.
```
The other option if the differences change at certain points, is to use `normalizeWithChanges()`. A good example of this is the inners ring lights in BTS using lights behind the player for the last 4 IDs, which use less IDs than the previous 8.
```js
lightRemapper.normalizeWithChanges([[1, 2], [3, 1]]); // [1, 3, 5, 6, 7] --> [1, 2, 3, 4, 5]
// At the first number, the differences are 2. At the third number, the differences are 1.
```
You can run this algorithm through with a sequence of test IDs using `test()`, or use `run()` to actually search the real event array. You also have the option to log the output of each processed event, and an option to run a function for each event.