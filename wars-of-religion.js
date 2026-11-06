// The Wars of Religion: 5 topics from the Reformation's split to the Peace of Westphalia, 20 variants each (100), asked
// the same ways as the Middle Ages (kinds.js). The facts are in wars-of-religion-data.js, and what the stories add in
// stories-wars.js. Original questions; every date is the usual one in school histories.
import { courseBank } from './kinds.js';
import { TOPICS, near } from './wars-of-religion-data.js';
import { STORIES } from './stories-wars.js';
import { TOPICS as MEDIEVAL } from './middle-ages-data.js';

export { TOPICS };
export const warsOfReligion = courseBank('wars', TOPICS, near, { centuries: [13, 15], gap: 8, tfGap: 8, what: 'part of these wars', far: MEDIEVAL, stories: STORIES });
