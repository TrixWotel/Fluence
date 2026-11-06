// The Middle Ages: 14 topics from the fall of Rome to the printing press, 20 variants each (280), asked the many ways
// in kinds.js. The facts are in middle-ages-data.js, and what the stories add in stories-middle-ages.js. Original
// questions; every date is the usual one in school histories.
import { courseBank } from './kinds.js';
import { TOPICS, near } from './middle-ages-data.js';
import { STORIES } from './stories-middle-ages.js';

export { TOPICS };
export const middleAges = courseBank('middleages', TOPICS, near, { centuries: [5, 11], stories: STORIES });
