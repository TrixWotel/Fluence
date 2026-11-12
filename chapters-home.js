// What's shared between the chapters (chapters.js) and History's page: the courses, and how far you've got in each (kept
// as fluentio.chapters, so it goes along with your progress). chapterCards() draws the courses for History's page.
const f = window.fluentio;
const KEY = 'fluentio.chapters';

export const COURSES = {
  middleages: { name: 'The Middle Ages', icon: '🏰', chapters: 14, blurb: 'Vikings, knights, plague and the people who survived them. From the fall of Rome to the printing press.' },
  wars: { name: 'The Wars of Religion', icon: '⚔️', chapters: 5, blurb: 'A split in the Church, a wedding that ended in massacre, three men thrown from a window, and thirty years of war.' },
  ushistory: { name: 'American History', icon: '🦅', chapters: 29, blurb: 'Colonists, rebels, pioneers, soldiers and marchers, and the choices that made a nation. From the first peoples to the end of the Cold War.' },
};

export const load = () => { const q = f.read(KEY); return { done: q?.done && typeof q.done === 'object' ? q.done : {} }; };
export const save = (q) => { if (f.read('fluentio.learn.save') !== false) f.write(KEY, q); };   // (Stop saving, on a learning path, goes for this too)
// a chapter's place in the store
export const slot = (course, topic) => `${course}/${topic}`;
export const finished = (q, course) => Object.entries(q.done).filter(([k, v]) => k.startsWith(course + '/') && v.finished);

// History's page: a big way into each course
export function chapterCards(box) {
  const { el } = f, q = load();
  box.replaceChildren(el('div', { className: 'q-cards' }, Object.entries(COURSES).map(([id, c]) => {
    const read = finished(q, id).length, started = Object.keys(q.done).some((k) => k.startsWith(id + '/'));
    return el('a', { className: 'card q-course', href: `chapters.html#${id}` },
      el('span', { className: 'q-course-icon', 'aria-hidden': 'true' }, c.icon),
      el('span', { className: 'q-course-text' },
        el('b', {}, c.name),
        el('span', { className: 'muted' }, c.blurb),
        el('span', { className: 'q-course-score' }, read ? `${read} of ${c.chapters} chapters finished` : `${c.chapters} chapters`)),
      el('span', { className: 'btn primary q-play' }, !started ? 'Start ›' : read < c.chapters ? 'Continue ›' : 'Read again ›'));
  })));
}
