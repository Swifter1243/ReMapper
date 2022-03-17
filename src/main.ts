export * from './general';
export * from './beatmap';
export * from './color';
export * from './note';
export * from './wall';
export * from './basicEvent';
export * from './event';
export * from './custom_event';
export * from './environment';
export * from './animation';
export * from './constants';
export * from './regex';
export * from './light_remapper';

/*
* Implement all the new classes
* Test and fix basic beatmap events
* Update general functions to not be broken
* Add a function for converting cut direction to a rotation
* When mods are released, add modded properties to new classes
* Also add new animations

* simplify some functions by moving portions of their responsibilities to other functions or cleaning
*   - Example being getValuesAtTime (possbily rename to InterpolateValues)

* Improve optimizeAnimation function to be less complicated and transparent. 

* Add different levels of optimizeAnimation (possibly yoinked/inspired from OhHeck)
* - Some more destructive or accurate than others, testing needed
*/