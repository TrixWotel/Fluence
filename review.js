// A mixed review: every topic of Systems and Matter, Energy and Matter and Earth and Energy Systems in one set, so a
// practice test mixes them the way a test on all of it would. Learning stays with each set.
import { conceptBank } from './concepts.js';
import { TOPICS as systems } from './systems-data.js';
import { TOPICS as energy } from './energy-data.js';
import { TOPICS as earth } from './earth-data.js';

export const review = conceptBank('scireview', [...systems, ...energy, ...earth]);
