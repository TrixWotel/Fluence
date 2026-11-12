// Learning American History: the 29 topics in eight units, in time order, each with short notes (the story, the names
// and dates worth knowing, the usual mix-ups), written in five parts (us/lessons-1.js to us/lessons-5.js), and the
// timeline shown beside the course. A topic is learned after 4 right in a row. No worked example: a fact question has no
// working to show. The chapters (chapters.html) tell the same story.
import { TOPICS } from './us-history-data.js';
import { LESSONS as P1 } from './us/lessons-1.js';
import { LESSONS as P2 } from './us/lessons-2.js';
import { LESSONS as P3 } from './us/lessons-3.js';
import { LESSONS as P4 } from './us/lessons-4.js';
import { LESSONS as P5 } from './us/lessons-5.js';

export const UNITS = [
  ['First peoples and colonies', ['Native America', 'Explorers and the Columbian Exchange', 'Jamestown and the Southern Colonies', 'The New England Colonies', 'The Middle Colonies and Colonial Life']],
  ['Revolution', ['The French and Indian War', 'Taxes and Protest', 'The War for Independence']],
  ['A new nation', ['From the Articles to the Constitution', 'The Early Republic', 'The War of 1812 and the Era of Good Feelings']],
  ['Growth and division', ['The Age of Jackson', 'Reform, Industry and Slavery', 'Manifest Destiny', 'The Road to Civil War']],
  ['Civil War and Reconstruction', ['The Civil War', 'Reconstruction']],
  ['A modern nation', ['The West', 'The Gilded Age', 'The Progressive Era', 'America Becomes a World Power']],
  ['World wars and the Depression', ['World War I', 'The Roaring Twenties', 'The Great Depression and the New Deal', 'World War II']],
  ['The Cold War', ['The Early Cold War', 'The Civil Rights Movement', 'Vietnam and a Divided Nation', 'The End of the Cold War']],
];
export const usLearning = { goal: 4, example: false, path: UNITS.map(([unit, topics]) => ({ unit, topics })), lessons: { ...P1, ...P2, ...P3, ...P4, ...P5 } };

// the course's timeline, every dated event in order, for beside the test
export function usTimeline() {
  const rows = TOPICS.flatMap((t) => t.events).sort((a, b) => a.y - b.y);
  const box = document.createElement('div');
  box.innerHTML = `<table class="data"><thead><tr><th>Year</th><th>Event</th></tr></thead><tbody>${
    rows.map((e) => `<tr><td>${e.y}</td><td>${e.label}</td></tr>`).join('')}</tbody></table>`;
  return box;
}
