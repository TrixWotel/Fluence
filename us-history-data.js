// American History, the facts behind the questions: 29 topics from the first peoples to the end of the Cold War, written
// in five parts (us/data-1.js to us/data-5.js). Each topic has its events (year, the question's words, and how it reads
// on a timeline), its own questions with choices, names and words to type, pairs to match, and sets to choose from.
// Every date is the usual one in school histories; where historians disagree, the wording says so.
import { TOPICS as P1 } from './us/data-1.js';
import { TOPICS as P2 } from './us/data-2.js';
import { TOPICS as P3 } from './us/data-3.js';
import { TOPICS as P4 } from './us/data-4.js';
import { TOPICS as P5 } from './us/data-5.js';

export const TOPICS = [...P1, ...P2, ...P3, ...P4, ...P5];

// topics too close to share an "odd one out", since a name from one could fit the other: two topics apart or less in
// time, and topics that share a story across the years (slavery and freedom, the West, civil rights, the two world
// wars, the Cold War). Native America is close to every topic, since Native nations run through all of them, so its odd
// one out comes from the Middle Ages.
const place = new Map(TOPICS.map((t, i) => [t.name, i]));
const LINKS = [
  ['The Middle Colonies and Colonial Life', 'The War for Independence'], ['The Middle Colonies and Colonial Life', 'From the Articles to the Constitution'],
  ['The New England Colonies', 'From the Articles to the Constitution'], ['The French and Indian War', 'From the Articles to the Constitution'],
  ['From the Articles to the Constitution', 'Reconstruction'], ['The Early Republic', 'The West'],
  ['The Civil War', 'America Becomes a World Power'], ['The Civil War', 'The Gilded Age'],
  ['Jamestown and the Southern Colonies', 'Reform, Industry and Slavery'], ['The Middle Colonies and Colonial Life', 'Reform, Industry and Slavery'],
  ['The Early Republic', 'Reform, Industry and Slavery'], ['Reform, Industry and Slavery', 'The Civil War'], ['Reform, Industry and Slavery', 'Reconstruction'],
  ['The War of 1812 and the Era of Good Feelings', 'The West'], ['The Age of Jackson', 'The West'], ['Manifest Destiny', 'The West'],
  ['Reconstruction', 'The Civil Rights Movement'], ['The Progressive Era', 'The Civil Rights Movement'], ['The Progressive Era', 'The Roaring Twenties'],
  ['World War I', 'World War II'], ['The Early Cold War', 'The End of the Cold War'],
];
export const near = (a, b) => a === b || ((a === 'Native America' || b === 'Native America') && place.has(a) && place.has(b))
  || (place.has(a) && place.has(b) && Math.abs(place.get(a) - place.get(b)) <= 2)
  || LINKS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
