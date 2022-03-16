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
* Avoid initializing fields inline by using constructors 
* - **ESPECIALLY** if the inline initialization uses other fields.
* - Example at https://github.com/Swifter1243/ReMapper/blob/2379c784820fa9a7abd9323be58003d9380123f8/src/note.ts#L17

* simplify some functions by moving portions of their responsibilities to other functions or cleaning
*   - Example being getValuesAtTime (possbily rename to InterpolateValues)

* Support Beatmap v3.0.0 (breaking changes, backwards compatibility is planned for basegame features)

* Improve optimizeAnimation function to be less complicated and transparent. 

* Add different levels of optimizeAnimation (possibly yoinked/inspired from OhHeck)
* - Some more destructive or accurate than others, testing needed

* - Add a function for converting cut direction to a rotation
*/