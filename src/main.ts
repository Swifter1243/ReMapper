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
- allow the addition of more custom data to the diff info*/