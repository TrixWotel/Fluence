// American History as stories (chapters.html tells them), written in five parts (us/stories-1.js to us/stories-5.js),
// in the same shape as stories-wars.js: each topic's beats, and what its activities need (truth for Myth or True, who
// for Who Am I, sort for Sort).
import { STORIES as P1 } from './us/stories-1.js';
import { STORIES as P2 } from './us/stories-2.js';
import { STORIES as P3 } from './us/stories-3.js';
import { STORIES as P4 } from './us/stories-4.js';
import { STORIES as P5 } from './us/stories-5.js';

export const STORIES = { ...P1, ...P2, ...P3, ...P4, ...P5 };
