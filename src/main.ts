export * from './general';
export * from './beatmap';
export * from './color';
export * from './note';
export * from './wall';
export * from './event';
export * from './custom_event';
export * from './environment';
export * from './animation';
export * from './constants';
export * from './regex';
export * from './light_remapper';

/*
TODO:
- add the ability to animate a track with it's initial position, rotation, and scale in mind << test this
- figure out a way to skip parameters, probably just revert to "if (thing === undefined) thing ="
- use quaternion lerp instead of lerpWrap for rotation
- allow the addition of more custom data to the diff info


Welcome to Swifter Utils!
This is a package to help with creating beat saber modcharts.
Some of the main things you'll enjoy by using this package is having helper classes for pretty much everything,
as well as a lot of generally useful tools and functions.
It will take some getting used to when using this package, but keep in mind to:
- Explore properties, functions, and classes
- Pay attention to types
- Look at examples

Here's some more specific instructions on how to use various things:

CONSTANTS:

Constants will be spelt with all caps.
These are pretty much lookups for specific values which may be useful.
Some examples are note directions, setting names, event types, and easing names.
No more going to the wiki for map format, consider using these instead when using classes and other things!
Be mindful that some constants will have more constants nested inside them, so explore them until they end to fully understand what they do.
For example some of the settings have more convoluted options for values to be entered, 
so the setting sometimes has an additional VALUE property for the string path instead, as well as any values it will accept.

CLASSES:

These are basically objects that will allow you to easily create things like notes, walls, etc.
You'll be prompted to enter things when creating these classes, but remember some parameters are optional (marked with a ?) 
and can be skipped by being left blank or being set to undefined.
Each parameter should be pretty self explanatory, but for the more convoluted ones there's a description given.
Some classes will start off in an "initialized" state, where you'll need to run functions on it to start using it.
An example of this is when creating an Event class, you'll need to specify what type of event you're going to be making, 
and might even have to specify what the event will do after (will it be a gradient? on event? off event?). 
You'll know if you're done initializing when things like push() and properties to set show up.
Remember that these classes are just helpers, so you can't just plug them right into other stuff most of the time.
You usually need to explicitly access whatever data you want from the class, whether there's a function for it, or if it's a property.
For example if you create a Regex class, you can't just plug it right into the _id of an environment object, you need to access the "string" property.

*/