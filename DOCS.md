# Usage

This documentation **does not contain every ReMapper feature**. It is simply a
guide to understand it's more complex systems, so everything else should be
intuitive from there.

Most things in ReMapper have a description for it's purpose, and a description
for each argument that may not be intuitive, which is visible as you write it.
ReMapper is best used by starting from scratch and adding things as you need
them.

If seeing the structure of a completed map helps, you can check out my
[Map Scripts](https://github.com/Swifter1243/MapScripts/tree/main/ReMapper) that
use ReMapper. Keep in mind some of these may be outdated, you can see the version that it was made on at the top of the script.

I would recommend reading all the way up to the end of
[Environment](#environment), and pay attention to as much as possible. Every
detail is crucial and can apply to multiple places.

# Importing

In order for your script to include functions, classes, or whatever else from
ReMapper, you'll need to import them. Initialize an import statement like so (the setup tool would have already done this for you):

```js
import {} from "https://deno.land/x/remapper@2.0.0/src/mod.ts" // MAKE SURE TO USE THE LATEST REMAPPER VERSION HERE
```

If you know exactly what you want to import, as you're typing it, press tab, and it'll be added to the import statement at the top like so:

```js
import { Difficulty, info } from "https://deno.land/x/remapper@2.0.0/src/mod.ts"

info // press tab while typing to import
```

Keep in mind that some things may already exist in JS/TS (such as CustomEvent),
so use arrow keys to select the import that's actually coming from ReMapper. You
can tell it's correct if it gets added to the top import statement.

If you want to explore what's in this package, you can add
`import * as r from "https://deno.land/x/remapper/src/mod.ts";` and then type
`r` anywhere, add a period, and see what comes up. It is preferred that you
still autocomplete the imports, though. As otherwise you'll have to prefix
everything with `r.`

# Difficulties

In order to get started, you'll need a difficulty. Here you'll enter your input
and output files. Input will be used as output if the output isn't specified.

```js
const map = new Difficulty("ExpertPlusLawless", "ExpertPlusStandard");
// "map" isn't reassigned, so we use const to save on resources
```

After you're done scripting this difficulty, you would use the save method to
export your map.

```js
map.save(); // Uses output specified earlier
```

Creating a difficulty will make any objects from here on out relavant to the
created difficulty, unless changed. It will change when a new difficulty is
created or the method `setActiveDiff()` is used.

You can access a bunch of properties on the difficulties, as well as the
Info.dat wrapper.

```js
map.NJS = 20; // When typing "map" and then adding a period, all your options for properties will be revealed. This goes for all wrappers.
console.log(info.version);
```

# Constants

Constants are an important part of this package, they provide lookups for
certain values that might not be easy to remember. 

For example, you may be trying to spawn a note, but can't remember what number corresponds to a top right note. You could use the `NOTE` constant to see all of the options, and whatever property you access will be the equivalent of the correct number.

```js
new Note(10, NOTE.UP_RIGHT).push();
```

# Objects (Notes, Walls)

Wrappers are essentially a more user friendly way for you to create object data.
You don't have to worry about checking if `customData` and `animation` exist,
all of that is dealt with for you. When accessing these wrappers, you'll be able
to access a bunch of useful properties.

```js
notesBetween(0, 10, (note) => {
  note.color = [0, 0, 0];
  console.log(note.NJS); // Gets NJS from the relavant difficulty's NJS if it isn't specified on the note.
});
```

You can also create a new object:

```js
const wall = new Wall(0, 10, WALL.CROUCH);
```

After making changes to this wall, push it to the difficulty.

```js
wall.life = 4; // Wall lasts 4 beats
wall.lifeStart = 2; // Wall starts at beat 2
wall.push();
```

If you don't plan on referencing an object again, you don't need a variable for
it.

```js
new Note(3, NOTE.BLUE, NOTE.LEFT, [0, 1, true]).push();
// "true" in this position argument will use noodle position instead of lineIndex and lineLayer.
```

# Animation

This wrapper is useful for easily creating animations. It also has some nice
tools. Notes, Walls, and animation events all contain an animation manager
`animate`. Not to be confused with `animation`, which is equal to
`customData.animation`.

Firstly, you can set the length of the animation to divide each keyframe's time.
In this case we're using the wall from before with a lifetime of 4 beats.

```js
wall.animate.length = wall.life;
```

Single keyframes are supported by using a single array, time will be interpreted
as 0 here.

```js
wall.animate.definitePosition = [0, 0, 0];
```

You can add to an animation by using the add method and ANIM constant.

```js
wall.animate.add(_definitePosition, [0, 1, 0, 4, "easeInOutExpo"]); // Easings and splines work too!
```

You can use a negative number for time to return to a range of 0-1, it will be
converted to positive internally.

```js
wall.animate.add(_definitePosition, [0, 2, 0, -0.5]);
```

This wrapper also allows you to grab what the values of a property would be at a
certain time. It accounts for easings, splines, and what the property actually
is (rotations interpolate differently than positions, for example).

```js
console.log(wall.animate.get(_definitePosition, 3)); // Get values at time 3, which is also divided by the length.
```

So far this animation would end up as:
`[[0, 0, 0, 0], [0, 2, 0, 0.5], [0, 1, 0, 1, "easeInOutExpo"]]`

You can also create an animation and import it, if you'd like.

```js
const animation = new Animation().wallAnimation(); // You'll need to specify what type of animation this will be.
animation.scale = [[1, 1, 1, 0], [2, 2, 2, 1]];
wall.importAnimation(animation);
```

If you are dealing with animations with a large amount of points, like keyframe
exports from blender for example, it may be a good idea to call the `optimize()`
method on the animation in order to cut down on points. This method does it's
best to reduce point count while retaining the shape of the animation.

# Events

Events are similar to making Notes and Walls, but they have subclasses, which
means you will need to further specify what kind of event it will be.

```js
new Event(2).backLasers().fade(true).push(); // This will create a blue (blue = true) fade event on the back lasers at beat 2.
```

You'll know initialization is completed when you can see `push()` as an option,
for example.

# Custom Events

Custom events are also similar to events, they have subclasses and will require
an extra method to initialize.

```js
new CustomEvent().assignFogTrack("fog").push();
```

Animation related events have an animation class attached to them.

```js
const event = new CustomEvent(2).animateTrack("fog", 10);
event.animate.attenuation = [[0, 0], [0.001, 1]];
event.push();
```

# Environment

Environment objects also have wrappers to make use of them easier.

```js
// Only a handful of environment pieces have constants for their ID, feel free to PR more!
const env = new Environment(ENV.BTS.PILLAR.ID, LOOKUP.REGEX);
env.duplicate = 1;
env.position = [0, 10, 0];
env.push();
```

Regex classes also exist to easily generate regex statements for environment
stuff.

```js
const regex = new Regex().start().add("PillarPair").vary(4).seperate().add("PillarL").end().string;
```

This would result in `\\]PillarPair \\(4\\)\\.\\[\\d*\\]PillarL$`. You can also
verify the validity of a regex expression with `verify()`.

If you add a track to an environment object, you can animate it with it's
original transforms specified in the environment statement combined to the
animation's.

```js
// Make sure your object has the track specified
env.track.value = "pillar";
env.push();

animateEnvTrack("pillar", 3, (animation) => {
  animation.length = 5;
  animation.position = [[0, 0, 0, 0], [0, -10, 0, 5, "easeInOutExpo"]];
}, 5);
```

The expected animation as a result of this would be:
`[[0, 10, 0, 0], [0, 0, 0, 1, "easeInOutExpo"]]`

You can also assign a `group`, and call `animateEnvGroup()` to do this for every
object in that given group.

# Geometry

Geometry is constructed similarly to environment stuff, except instead of
duplicating/moving existing pieces, it spawns in entirely new ones.

Geometry uses materials, which can either be initialized with the object:

```js
new Geometry("Cube", {
  _shader: "Standard",
  color: [1, 1, 1, 1],
  _track: "cube",
}).push();
```

Or added to the `geoMaterials` object in the map:

```js
map.geoMaterials["white"] = {
  _shader: "Standard",
  color: [1, 1, 1, 1],
  _track: "cube",
};
new Geometry("Cube", "white").push();
```

NOTE: At this point in time, the standard shader for geometry has issues that
make it fairly unusable because of it's visibility. At some point there will
hopefully be a way to attach additional materials.

# Model Scene

## Data Interpretation

Model scenes are a way of taking in model data and expressing it as different
objects. It manages static scenes, animated scenes, and even switching scenes
entirely and pooling objects.

Said model data is in the form of `ModelObject`s, which give information about
the position of an object, and the `track` of which is used to identify the type
of object. It also has a `color` field, which will color primary geometry
objects only.

```js
{
    pos: RawKeyframesVec3;
    rot: RawKeyframesVec3;
    scale: RawKeyframesVec3;
    color?: ColorType;
    track?: string;
}
```

A `ModelObject` can either be created by your script, or imported from a model
exported from blender. In the case of blender, `track` will be taken from the
name of the first material on the object, and `color` will be taken from the
viewport color.

Model scene works by having "primary" and "assigned" objects. Primary objects
will be spawned in depending on how much the model scene requires, while
assigned objects are presumably pre-existing objects you just want to represent
in your model.

## Setup

In the constructor of the model scene, you can provide the first primary object,
which objects with no track in the data will represent. There is also additional
`anchor, scale, and rotation` fields that will be discussed later.

The `object` field will determine which object is spawned, currently
`Environment` and `Geometry` are supported.

```js
const scene = new ModelScene(new Geometry()) // Defaults to Cube type;
```

You can add new primary objects with `addPrimaryGroups`, which takes the
track(s) you want to represent this object with, and then the information about
the object.

```js
scene.addPrimaryGroups(
  "red sphere",
  new Geometry("Sphere", {
    _shader: "Standard",
    color: [1, 0, 0], // Note: This overrides colors from the model data.
  }),
);
```

You can assign objects with `assignObjects`, which is written the same as
`addPrimaryGroups` but without proving an object to spawn, as the object would
already exist.

## Activating

There's 2 ways to activate a model scene, `static()` or `animate()`. You can
choose to input a `string` for a path to an exported `.rmmodel` file, or a
`ModelObject` array directly.

`static()` will ignore animations and will only allow 1 scene that will remain
the same for the whole map. It also includes an optional field to let you
iterate over each object being spawned.

```js
scene.static("model", (object) => {
  object.active = true;
  // This is a completely arbitrary example, this function is not required.
});
```

`animate()` works by inputting an array of switches, with the time and
optionally duration, as well as an optional function to iterate over each event
that moves the objects. There is also a function after the switches to iterate
on each object being spawned.

```js
scene.animate([
  ["model1", 0],
  ["model2", 20, 40, (event) => {
    if (event.track.has("water")) {
      event.duration = 1;
    }
  }],
], (object) => {
  object.active = true;
  // Again both functions completely optional and arbitrary.
});
```

## Anchor, Scale, & Rotation

The most important assumption that a model scene makes is that the objects being
moved visually match the data being sent to them. The fields `anchor`, `scale`,
and `rotation` are used to adjust objects in the event that they don't match.

If you run the function `debugObject()` and provide an object you want to test,
the map will be converted into a debugging space to help you fit an object you
want to a unit cube.

Scale - Pretty straight forward, multiplies with the scale of the object.

Offset - A local (based on rotation) offset to the object.

Rotation - An addition to the rotation of the object.

The squares represent where the object should line up with. Play with the
"resolution" argument in the function and pay attention to how things line up on
each axis. Your goal is to have the object be flush with all the squares
regardless of the resolution. If you can't find the exact values, I would say
about 6 decimal places is good enough.

Some of the more common objects that are used for environments already have
their transformations pre-found, stored in `ENV`.

# Color

The color class is used to express colors in different formats. Right now RGB
and HSV (hue, saturation, value) is supported. Here's a quick code example on
how expressing colors with HSV could be useful:

```js
// Rainbow notes!
for (let i = 0; i <= 1; i++) {
  const time = 2 + (i * 4); // Starts at beat 2, for 4 beats.
  const color = new Color([i, 1, 1], COLOR.HSV); // Hue will be cycled through in for loop, saturation and value will be full.

  const note = new Note(time);
  note.color = color.export(); // Converts to RGB and returns value array.
  note.push();
}
```

# Light Remapper

This is a class that is focused on iterating and changing lighting events. The usefulness comes in being able to light in an editor like normal, and then being able to transform those lights to work with any complexities such as moving lightIDs or boosting the lights.

The main components are conditions and processes. Conditions are a collection of conditions that each event will need to pass. There are some built in such as `type` or `IDs`, or you can add your own.

```js
new LightRemapper().type(EVENT.RING_LIGHTS).run();
// This will target the events in the ring lights.
```

Processes are a chain of functions that will run on each event. Again some are built in, such as `setType` or `setIDs`, or you can add your own.

```js
new LightRemapper().type(EVENT.RING_LIGHTS).setType(EVENT.CENTER_LASERS).run();
// This will convert ring lights to center lights.
```

There may be instances where you will need to move lightIDs to something like duplicated lights for example, and there are lots of nuances with that process. It can be something as simple as adding to all lightIDs, to changing the differences between them, to changing the differences at different points.

In the most basic example, you can simply add a number to the end of all the
lightIDs.

```js
lightRemapper.addToEnd(1); // [1, 2, 3] --> [2, 3, 4]
```

If the sequence starts at 1 and the differences are 1 (sequence is normalized),
you can also provide a step value to change the distance between each lightID.

```js
lightRemapper.addToEnd(1, 3); // [1, 2, 3] --> [2, 5, 8]
// Look at the differences from number to number. It changes from 1 to 3, and then 1 is also added.
```

Again assuming the sequence is normalized, You can also specify the points at
which the differences between values change.

```js
lightRemapper.remapEnd([[1, 1], [3, 2]]); // [1, 2, 3, 4, 5] --> [1, 2, 3, 5, 7]
// At the first number, the differences are 1. At the third number, they become 2.
```

If you have a situation where the input sequence of lightIDs is not normalized,
you can normalize it. There's 2 ways to do this, if there is a consistent
difference the entire way, you can use `normalizeLinear()`:

```js
lightRemapper.normalizeLinear(2, 3); // [2, 5, 8, 11, 14] --> [1, 2, 3, 4, 5]
// The sequence starts at 2, and the differences between numbers is 3.
```

The other option if the differences change at certain points, is to use
`normalizeWithChanges()`. A good example of this is the inners ring lights in
BTS using lights behind the player for the last 4 IDs, which use less IDs than
the previous 8.

```js
lightRemapper.normalizeWithChanges([[1, 2], [3, 1]]); // [1, 3, 5, 6, 7] --> [1, 2, 3, 4, 5]
// At the first number, the differences are 2. At the third number, the differences are 1.
```

You can run this algorithm through with a sequence of test IDs using `test()`,
or use `run()` to actually search the real event array. You also have the option
to log the output of each processed event.
