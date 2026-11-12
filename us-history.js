// American History: 29 topics from the first peoples to the end of the Cold War, asked the same ways as the Middle Ages
// (kinds.js), three rounds of them, so 60 variants a topic (1,740) and most of each topic's facts asked. The facts are in us-history-data.js, and what the stories add in
// stories-us-history.js. Original questions; every date is the usual one in school histories.
import { courseBank } from './kinds.js';
import { TOPICS, near } from './us-history-data.js';
import { STORIES } from './stories-us-history.js';
import { TOPICS as MEDIEVAL } from './middle-ages-data.js';

export { TOPICS };
export const usHistory = courseBank('ushistory', TOPICS, near, { centuries: [13, 17], gap: 5, tfGap: 10, what: 'part of American history', far: MEDIEVAL, stories: STORIES, rounds: 3 });
