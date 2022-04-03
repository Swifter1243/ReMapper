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
- Allow tracks to take in array of strings too (track class?)
- Allow start time for animations when switching envs
- fix there being one too many pieces duplicated for blenderToEnv animations (< instead of <= on (let i = 0; i <= blenderEnv.maxObjects; i++))
- Have lookup methods as constants
*/