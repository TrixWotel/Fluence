// History's chapters (chapters.html). A course is a list of chapters, and a chapter has three parts: a story told a moment
// at a time, where you make the choices people really faced; things to try (Myth or True, Who Am I, Match, Timeline, Sort);
// and a quick check of four questions, each a different kind. Three right counts the topic as learned on its course's
// learning path. Nothing is locked, so any chapter can be read at any time. The questions come from the course's bank,
// the stories from stories-*.js.
// Links: chapters.html#wars is the list, chapters.html#wars/2 is its third chapter.
import { isRight, nearly } from '../kit/tests.js';
import { COURSES, load, save, slot, finished } from './chapters-home.js';

const f = window.fluentio, { el } = f;
const stage = document.getElementById('stage');
const html = (tag, cls, markup) => { const n = el(tag, { className: cls }); n.innerHTML = markup; return n; };   // (always this site's own words)
const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const QUESTIONS = 4, ENOUGH = 3;      // the check's questions, and how many right make the topic learned

const COURSE_FILES = {
  middleages: async () => {
    const [b, l, s] = await Promise.all([import('./middle-ages.js'), import('./middle-ages-lessons.js'), import('./stories-middle-ages.js')]);
    return { bank: b.middleAges, topics: b.TOPICS, learn: l.middleAgesLearning, stories: s.STORIES };
  },
  wars: async () => {
    const [b, l, s] = await Promise.all([import('./wars-of-religion.js'), import('./wars-of-religion-lessons.js'), import('./stories-wars.js')]);
    return { bank: b.warsOfReligion, topics: b.TOPICS, learn: l.warsLearning, stories: s.STORIES };
  },
};
const loaded = new Map();
const open = (id) => { if (!loaded.has(id)) loaded.set(id, COURSE_FILES[id]()); return loaded.get(id); };

// ---------- keys: what each key does on this screen (a focused button keeps its own Enter and Space) ----------
let keys = {};
addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const fn = keys[e.key], on = e.target;
  if (!fn || on.matches?.('input, textarea, select') || ((e.key === 'Enter' || e.key === ' ') && on.matches?.('button, a'))) return;
  e.preventDefault();
  fn();
});
const numbered = (fns) => Object.fromEntries(fns.map((fn, i) => [String(i + 1), fn]));
const ready = (button) => requestAnimationFrame(() => button?.focus({ preventScroll: true }));
const button = (label, onclick, cls = 'btn primary') => el('button', { type: 'button', className: cls, onclick }, label);

// ---------- the list of chapters ----------
async function list(id) {
  const c = COURSES[id], { learn, stories } = await open(id), q = load();
  document.title = `${c.name} · History · ${f.settings.name}`;
  keys = {};
  const order = learn.path.flatMap((u) => u.topics), next = order.findIndex((t) => !q.done[slot(id, t)]?.finished), read = finished(q, id).length;
  let at = -1;
  stage.replaceChildren(
    el('a', { className: 'back', href: './' }, '← History'),
    el('h1', { className: 'q-title' }, `${c.icon} ${c.name}`),
    read ? el('div', { className: 'q-sofar' },
      el('span', { className: 'muted' }, `${read} of ${order.length} chapters finished`),
      el('div', { className: 'q-meter', role: 'img', 'aria-label': `${read} of ${order.length} chapters finished` }, el('div', { style: `width:${Math.round((read / order.length) * 100)}%` }))) : null,
    next >= 0 ? el('a', { className: 'btn primary big q-go', href: `#${id}/${next}` }, `${read ? 'Continue' : 'Start'}: ${order[next]} ›`) : el('p', { className: 'q-clear' }, 'You’ve finished every chapter.'),
    ...learn.path.map((u) => el('section', { className: 'q-unit' },
      learn.path.length > 1 ? el('h2', {}, u.unit) : null,
      el('div', { className: 'q-list' }, u.topics.map((t) => {
        at++;
        const had = q.done[slot(id, t)], k = at;
        return el('a', { className: `q-row${had?.finished ? ' done' : ''}${k === next ? ' next' : ''}`, href: `#${id}/${k}` },
          el('span', { className: 'q-row-icon', 'aria-hidden': 'true' }, stories[t]?.icon || c.icon),
          el('span', { className: 'q-row-text' }, el('b', {}, t), el('small', { className: 'muted' }, had?.finished ? 'Finished' : had ? 'Started' : `Chapter ${k + 1}`)),
          el('span', { className: 'q-row-mark', 'aria-hidden': 'true' }, had?.finished ? '✓' : '›'));
      })))),
    el('p', { className: 'q-more' }, 'Want the notes, or a test like the ones in class? ', el('a', { href: `./#${id}` }, 'They’re all here ›')));
  window.scrollTo(0, 0);
}

// ---------- a chapter: its three parts ----------
async function chapter(id, k) {
  const course = await open(id), order = course.learn.path.flatMap((u) => u.topics), topic = order[k], c = COURSES[id];
  if (!topic) { location.hash = `#${id}`; return; }
  document.title = `${topic} · History · ${f.settings.name}`;
  const story = course.stories[topic] || { beats: [], truth: [], who: [] }, facts = course.topics.find((t) => t.name === topic);
  const had = load().done[slot(id, topic)] || {}, ctx = { id, k, topic, course, story, facts, order, c };
  if (f.read('fluentio.learn.save') !== false) f.write('fluentio.last', { href: `${location.pathname}#${id}/${k}`, topic, test: c.name, learned: finished(load(), id).length, total: order.length, at: Date.now() });
  const parts = el('div', { className: 'q-acts' }), body = el('div', { className: 'q-body' });
  const NAMES = [['story', '📖 Story'], ['try', '✏️ Try it'], ['check', '✅ Check']];
  const go = (part) => {
    keys = {};
    parts.replaceChildren(...NAMES.map(([key, label]) => el('button', { type: 'button', className: `q-act${key === part ? ' on' : ''}`, onclick: () => go(key) }, label)));
    window.scrollTo(0, 0);
    if (part === 'story' && story.beats.length) body.replaceChildren(storyPart(story.beats, () => { mark(ctx, { story: true }); go('try'); }));
    else if (part === 'check' || (part === 'story' && !story.beats.length)) body.replaceChildren(checkPart(ctx, () => go('check'), () => go('story')));
    else body.replaceChildren(tryPart(ctx, () => { mark(ctx, { tried: true }); go('check'); }));
  };
  stage.replaceChildren(
    el('div', { className: 'q-top' },
      el('a', { className: 'q-out', href: `#${id}`, title: 'Back to the chapters', 'aria-label': 'Back to the chapters' }, '✕'),
      el('div', { className: 'q-where' }, el('small', { className: 'muted' }, `Chapter ${k + 1} of ${order.length}`), el('b', {}, topic)),
      el('a', { className: 'q-notes', href: `./#${id}/learn/${k}`, title: 'The notes and practice for this topic' }, 'Notes')),
    parts, body);
  go(!had.finished && had.tried && had.story ? 'check' : !had.finished && had.story ? 'try' : 'story');
}
function mark(ctx, fields) {
  const q = load(), key = slot(ctx.id, ctx.topic);
  q.done[key] = { ...q.done[key], ...fields };
  save(q);
}

// ---------- the story, a moment at a time ----------
function storyPart(beats, done) {
  let i = 0;
  const fill = el('div'), bar = el('div', { className: 'q-progress' }, fill), box = el('div', { className: 'q-beat' });
  const show = () => {
    fill.style.width = `${Math.round((i / beats.length) * 100)}%`;
    if (i >= beats.length) return done();
    box.replaceChildren(beat(beats[i], i === beats.length - 1, () => { i++; show(); window.scrollTo(0, 0); }));
  };
  show();
  return el('div', {}, bar, box);
}
function art(b) {
  const parts = b.fx === 'fall' || b.fx === 'march' ? [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(b.art)].map((s) => s.segment) : [b.art];
  return el('div', { className: `q-art${b.fx ? ` fx-${b.fx}` : ''}`, 'aria-hidden': 'true' }, parts.map((p, n) => el('span', { style: `--n:${n}` }, p)));
}
function beat(b, last, next) {
  const onward = button(last ? 'Try it yourself ›' : 'Next ›', next), foot = el('div', { className: 'q-foot' }, onward);
  const page = el('div', { className: `q-card${b.fx === 'dim' ? ' dim' : ''}` }, art(b));
  const open = () => { foot.hidden = false; keys = { Enter: next, ' ': next }; ready(onward); };
  if (b.ask == null) { page.append(html('p', 'q-text', b.text), foot); open(); return page; }
  page.append(html('p', 'q-ask', b.ask));
  foot.hidden = true;
  const said = el('div', { className: 'q-said', role: 'status' });
  if (b.min != null) page.append(guess(b, said, open));
  else if (b.right != null) page.append(quiz(b, said, open));
  else page.append(decide(b, said, open));
  page.append(said, foot);
  return page;
}
// you decide: no wrong answer, and then what really happened
function decide(b, said, open) {
  const list = el('div', { className: 'q-options' }), choose = (i) => {
    keys = {};
    [...list.children].forEach((x, n) => { x.disabled = true; x.classList.toggle('picked', n === i); });
    said.replaceChildren(html('p', 'q-reply', b.options[i][1]), html('p', 'q-then', b.then));
    open();
  };
  b.options.forEach(([label], i) => list.append(el('button', { type: 'button', className: 'q-option', onclick: () => choose(i) }, el('span', { className: 'q-key' }, String(i + 1)), label)));
  keys = numbered(b.options.map((_, i) => () => choose(i)));
  ready(list.firstChild);
  return list;
}
// a question along the way
function quiz(b, said, open) {
  const list = el('div', { className: 'q-options' }), choose = (i) => {
    keys = {};
    const right = i === b.right;
    [...list.children].forEach((x, n) => { x.disabled = true; if (n === b.right) x.classList.add('right'); else if (n === i) x.classList.add('wrong'); });
    said.replaceChildren(html('p', right ? 'q-good' : 'q-bad', `${right ? 'Right.' : 'Not quite.'} ${b.why}`));
    open();
  };
  b.options.forEach((label, i) => list.append(el('button', { type: 'button', className: 'q-option', onclick: () => choose(i) }, el('span', { className: 'q-key' }, String(i + 1)), label)));
  keys = numbered(b.options.map((_, i) => () => choose(i)));
  ready(list.firstChild);
  return list;
}
// a guess on a slider, and how close it was
function guess(b, said, open) {
  const mid = Math.round((b.min + b.max) / 2), unit = b.unit === '%' ? '%' : b.unit ? ` ${b.unit}` : '', value = el('b', { className: 'q-guess-value' }, `${mid}${unit}`);
  const range = el('input', { type: 'range', min: b.min, max: b.max, value: mid, 'aria-label': 'Your guess', oninput: () => { value.textContent = `${range.value}${unit}`; } });
  const lock = button('That’s my guess', () => {
    keys = {};
    const v = +range.value, off = Math.abs(v - b.answer) / (b.max - b.min);
    range.disabled = true; lock.hidden = true;
    marker.style.left = `${((b.answer - b.min) / (b.max - b.min)) * 100}%`; marker.hidden = false;
    said.replaceChildren(html('p', off < 0.15 ? 'q-good' : 'q-then', `${off < 0.05 ? 'Spot on.' : off < 0.15 ? 'Close.' : `You said ${v}${unit}.`} ${b.why}`));
    open();
  });
  const marker = el('span', { className: 'q-guess-mark', hidden: true }, '▲');
  keys = { Enter: () => lock.click() };
  return el('div', { className: 'q-guess' }, value, el('div', { className: 'q-range' }, range, marker), el('div', { className: 'q-guess-ends muted' }, el('span', {}, `${b.min}${unit}`), el('span', {}, `${b.max}${unit}`)), lock);
}

// ---------- things to try ----------
function tryPart(ctx, done) {
  const { story, facts, k } = ctx, box = el('div');
  const all = [
    story.truth?.length && ['Myth or True', mythOrTrue],
    story.who?.length && ['Who Am I?', whoAmI],
    facts.pairs?.length >= 4 && ['Match', matching],
    story.sort?.items?.length && [story.sort.title, sorting],
    ctx.course.topics.flatMap((t) => t.events).length >= 4 && ['Timeline', timeline],
  ].filter(Boolean);
  const rot = all.map((_, i) => all[(i + k) % all.length]);        // (a different pair comes first in each chapter)
  let turn = 0;
  const shown = () => {
    keys = {};
    const [name, activity] = rot[turn % rot.length], no = turn + 1;
    box.replaceChildren(el('h2', { className: 'q-try-name' }, name), activity(ctx, () => {
      turn++;
      const more = button(turn < rot.length ? 'One more' : 'Do them again', shown, 'btn'), check = button('On to the check ›', done);
      box.append(el('div', { className: 'q-foot' }, ...(no >= 2 ? [check, more] : [button(`Next: ${rot[turn % rot.length][0]} ›`, shown), button('Skip to the check', done, 'btn')])));
      const primary = box.querySelector('.q-foot:last-child .btn.primary');
      keys = { Enter: () => primary.click() };
      ready(primary);
    }));
    window.scrollTo(0, 0);
  };
  if (all.length) shown(); else done();
  return box;
}
const scoreLine = (text) => el('p', { className: 'q-score', role: 'status' }, text);

// Myth or True: five statements, one after another
function mythOrTrue({ story }, end) {
  const list = shuffle(story.truth).slice(0, 5), box = el('div');
  let i = 0, right = 0;
  const ask = () => {
    const [text, yes, why] = list[i], count = el('div', { className: 'q-count muted' }, `${i + 1} of ${list.length}`);
    const said = el('div', { role: 'status' }), pick = (say) => {
      keys = {};
      const ok = say === yes;
      btnT.disabled = btnM.disabled = true;
      (yes ? btnT : btnM).classList.add('right');
      if (!ok) (say ? btnT : btnM).classList.add('wrong');
      if (ok) right++;
      said.replaceChildren(html('p', ok ? 'q-good' : 'q-bad', `${ok ? 'Yes.' : 'No.'} ${why}`));
      i++;
      const go = button(i < list.length ? 'Next ›' : 'Finish ›', () => { if (i < list.length) ask(); else finish(); });
      said.append(el('div', { className: 'q-foot' }, go));
      keys = { Enter: () => go.click(), ' ': () => go.click() };
      ready(go);
    };
    const btnT = el('button', { type: 'button', className: 'q-big-choice', onclick: () => pick(true) }, '✅ True'), btnM = el('button', { type: 'button', className: 'q-big-choice', onclick: () => pick(false) }, '🧙 Myth');
    keys = { t: () => pick(true), m: () => pick(false), ArrowLeft: () => pick(true), ArrowRight: () => pick(false) };
    box.replaceChildren(count, html('p', 'q-statement', text), el('div', { className: 'q-big-choices' }, btnT, btnM), said);
  };
  const finish = () => { box.replaceChildren(scoreLine(`${right} of ${list.length} right`)); end(); };
  ask();
  return box;
}

// clues, one at a time, and a way to show them all
function cluesBox(clues) {
  const list = el('ol', { className: 'q-clues' });
  let out = 0;
  const next = () => { if (out < clues.length) list.append(el('li', {}, clues[out++])); more.hidden = out >= clues.length; };
  const more = button('Another clue', next, 'btn');
  next();
  return { box: el('div', {}, list, more), next, all: () => { while (out < clues.length) next(); more.hidden = true; }, left: () => clues.length - out, used: () => out };
}

// Who Am I: clues until you know
function whoAmI({ story }, end) {
  const people = shuffle(story.who).slice(0, 2), box = el('div');
  let at = 0, found = 0;
  const round = () => {
    const p = people[at], names = shuffle([p.name, ...p.others]), clues = cluesBox(p.clues), said = el('span', { className: 'q-worth' });
    const options = el('div', { className: 'q-options two' });
    let over = false;
    const finish = (won) => {
      over = true; keys = {};
      for (const b of options.children) { b.disabled = true; if (b.textContent.endsWith(p.name)) b.classList.add('right'); }
      said.textContent = won ? `Yes, ${p.name}, with ${clues.used()} ${clues.used() === 1 ? 'clue' : 'clues'}.` : `It was ${p.name}.`;
      clues.all();
      if (won) found++;
      at++;
      // (the last one stays on the page, so you can read all its clues)
      if (at >= people.length) { box.append(scoreLine(`${found} of ${people.length} found`)); end(); return; }
      const go = button('Next person ›', round);
      box.append(el('div', { className: 'q-foot' }, go));
      keys = { Enter: () => go.click() };
      ready(go);
    };
    names.forEach((name, i) => options.append(el('button', { type: 'button', className: 'q-option', onclick: (e) => {
      if (over) return;
      if (name === p.name) return finish(true);
      e.currentTarget.disabled = true; e.currentTarget.classList.add('wrong');   // (a wrong guess brings another clue)
      if (clues.left()) clues.next(); else finish(false);
    } }, el('span', { className: 'q-key' }, String(i + 1)), name)));
    keys = numbered(names.map((_, i) => () => options.children[i].disabled || options.children[i].click()));
    box.replaceChildren(el('div', { className: 'q-count muted' }, `Person ${at + 1} of ${people.length} `, said), clues.box, options);
  };
  round();
  return box;
}

// Match: tap one, then what goes with it
function matching({ facts }, end) {
  const four = shuffle(facts.pairs).slice(0, 4), left = el('div', { className: 'q-match-side' }), right = el('div', { className: 'q-match-side' });
  const note = el('div', { className: 'q-count muted' }, 'Tap one on each side to pair them');
  let held = null, found = 0, slips = 0;
  const side = (box, items, part) => shuffle(items).forEach((pair) => {
    const b = el('button', { type: 'button', className: 'q-match', onclick: () => {
      if (b.disabled) return;
      if (!held || held.box === box) { held?.b.classList.remove('picked'); b.classList.add('picked'); held = { b, box, pair }; return; }
      const other = held;
      held = null;
      other.b.classList.remove('picked');
      if (other.pair === pair) {
        for (const x of [b, other.b]) { x.disabled = true; x.classList.add('right'); }
        found++;
        if (found === four.length) { note.after(scoreLine(slips ? `All paired, with ${slips} wrong ${slips === 1 ? 'try' : 'tries'}.` : 'All paired, first try.')); end(); }
        return;
      }
      slips++;
      for (const x of [b, other.b]) { x.classList.remove('shake'); void x.offsetWidth; x.classList.add('shake'); }
    } }, pair[part]);
    box.append(b);
  });
  side(left, four, 0);
  side(right, four, 1);
  return el('div', {}, note, el('div', { className: 'q-match-grid' }, left, right));
}

// Timeline: tap the events, the earliest first
function timeline({ facts, course }, end) {
  const own = shuffle(facts.events), rest = shuffle(course.topics.flatMap((t) => t.events).filter((e) => !own.includes(e)));
  const picks = [];
  for (const e of [...own, ...rest]) if (picks.length < 5 && picks.every((p) => p.y !== e.y)) picks.push(e);
  const order = picks.slice().sort((a, b) => a.y - b.y), placed = el('ol', { className: 'q-line' }), pile = el('div', { className: 'q-options' });
  let at = 0, slips = 0;
  shuffle(picks).forEach((e) => {
    const b = el('button', { type: 'button', className: 'q-option', onclick: () => {
      if (e !== order[at]) { slips++; b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); return; }
      at++; b.remove();
      placed.append(el('li', {}, el('b', {}, String(e.y)), ` ${e.label}`));
      if (at === order.length) { placed.after(scoreLine(slips ? `In order, with ${slips} wrong ${slips === 1 ? 'try' : 'tries'}.` : 'In order, first try.')); end(); }
    } }, e.label);
    pile.append(b);
  });
  return el('div', {}, el('div', { className: 'q-count muted' }, 'Tap them in order, the earliest first'), placed, pile);
}

// one at a time, onto one of two sides (each lands on the side it belongs to, marked right or wrong)
function sorter({ left, right, items }, done) {
  const list = shuffle(items), box = el('div');
  let i = 0, score = 0;
  const shelfL = el('div', { className: 'q-shelf' }, el('b', {}, left)), shelfR = el('div', { className: 'q-shelf' }, el('b', {}, right));
  const item = el('div', { className: 'q-sort-item', role: 'status' }), count = el('div', { className: 'q-count muted' });
  const ask = () => { count.textContent = `${i + 1} of ${list.length}`; item.textContent = list[i][0]; };
  const pick = (side) => {
    if (i >= list.length) return;
    const [text, where] = list[i], ok = side === where;
    if (ok) score++;
    (where === 'l' ? shelfL : shelfR).append(el('span', { className: `q-shelved ${ok ? 'ok' : 'no'}` }, text));
    i++;
    if (i < list.length) return ask();
    keys = {};
    btnL.disabled = btnR.disabled = true;
    item.hidden = true; count.hidden = true;
    done(score, list.length);
  };
  const btnL = el('button', { type: 'button', className: 'q-big-choice', onclick: () => pick('l') }, `← ${left}`), btnR = el('button', { type: 'button', className: 'q-big-choice', onclick: () => pick('r') }, `${right} →`);
  keys = { ArrowLeft: () => pick('l'), ArrowRight: () => pick('r') };
  ask();
  box.append(count, item, el('div', { className: 'q-big-choices' }, btnL, btnR), el('div', { className: 'q-shelves' }, shelfL, shelfR));
  return box;
}
function sorting({ story }, end) {
  const box = el('div');
  box.append(sorter(story.sort, (score, n) => { box.append(scoreLine(`${score} of ${n} right`)); end(); }));
  return box;
}

// ---------- the check: four questions, each a different kind, and what's worth remembering ----------
const HANDS_ON = ['order', 'match', 'sort', 'who', 'multi', 'myth'], PLAIN = ['odd', 'tf', 'year', 'century', 'fact', 'typed'];
function pickCheck(bank, index) {
  const per = bank.count / bank.kinds, one = new Map();
  for (const n of shuffle(Array.from({ length: per }, (_, i) => index + 1 + i * bank.kinds))) { const q = bank.make(n); if (!one.has(q.way)) one.set(q.way, q); }
  const from = (ways) => shuffle(ways.filter((w) => one.has(w)));
  return shuffle([...from(HANDS_ON).slice(0, QUESTIONS - 1), ...from(PLAIN).slice(0, 1)].slice(0, QUESTIONS).map((w) => one.get(w)));
}
function checkPart(ctx, again, reread) {
  const { id, k, topic, course, order } = ctx, { bank } = course, questions = pickCheck(bank, course.topics.findIndex((t) => t.name === topic));
  let at = 0, right = 0;
  const box = el('div', { className: 'q-check' });
  const ask = () => {
    keys = {};
    const q = questions[at++];
    box.replaceChildren(el('p', { className: 'q-count muted' }, `Question ${at} of ${questions.length}`), question(q, (ok) => {
      if (ok) right++;
      const last = at >= questions.length, go = button(last ? 'See how it went ›' : 'Next ›', () => { if (last) end(); else ask(); window.scrollTo(0, 0); });
      keys = { Enter: () => go.click() };
      ready(go);
      return go;
    }));
  };
  const end = () => {
    keys = {};
    mark(ctx, { finished: true });
    const learned = right >= ENOUGH;
    // it counts on the course's learning path too
    if (learned && f.read('fluentio.learn.save') !== false) {
      const file = `fluentio.${bank.id}.learn`, was = f.read(file) || {}, s = was[topic] || { streak: 0, right: 0, tried: 0 };
      was[topic] = { ...s, streak: Math.max(s.streak, QUESTIONS), right: s.right + right, tried: s.tried + questions.length, learned: true };
      f.write(file, was);
    }
    const nextUp = order.findIndex((t, i) => i > k && !load().done[slot(id, t)]?.finished), onward = nextUp >= 0 ? nextUp : k + 1 < order.length ? k + 1 : -1;
    const go = onward >= 0 ? el('a', { className: 'btn primary big', href: `#${id}/${onward}` }, `Next chapter: ${order[onward]} ›`) : el('a', { className: 'btn primary big', href: `#${id}` }, 'Back to the chapters ›');
    const keep = course.learn.lessons?.[topic]?.facts;
    box.replaceChildren(el('div', { className: 'q-end' },
      el('h2', {}, `${right} of ${questions.length} right`),
      el('p', { className: 'muted' }, learned ? `${topic} now counts as learned.` : 'Some of it hasn’t stuck yet, which is normal after one read. Try new questions, or go through the story again.'),
      keep?.length ? el('div', { className: 'q-keep' }, el('h3', {}, 'Worth remembering'), el('ul', {}, keep.map((s) => html('li', '', s)))) : null,
      el('div', { className: 'q-foot' }, go, button('New questions', again, 'btn'), button('Read the story again', reread, 'btn'), el('a', { className: 'btn', href: `./#${id}/learn/${k}` }, 'The notes'))));
    ready(go);
  };
  ask();
  return box;
}

// a question from the course's bank, however it asks. answered(right) says what to do next, and gives back its button
function question(q, answered) {
  const a = q.answer, box = el('div', { className: 'q-question' }), said = el('div', { role: 'status' }), clues = q.clues ? cluesBox(q.clues) : null;
  box.append(html('p', 'q-ask', q.text));
  if (clues) box.append(clues.box);
  const finish = (ok) => {
    keys = {};
    clues?.all();
    said.replaceChildren(html('div', ok ? 'q-good' : 'q-bad', `${ok ? 'Right.' : 'Not quite.'} ${q.solution}`));
    const go = answered(ok);
    said.append(el('div', { className: 'q-foot' }, go));
  };
  const check = (cls, fn) => button('Check', fn, cls);
  if (a.kind === 'choice') {
    const two = a.choices.length <= 2, list = el('div', { className: `q-options${two ? ' two' : ''}` });
    const choose = (i) => {
      const ok = isRight(a, i);
      [...list.children].forEach((x, n) => { x.disabled = true; if (n === a.correct) x.classList.add('right'); else if (n === i) x.classList.add('wrong'); });
      finish(ok);
    };
    a.choices.forEach((label, i) => { const b = el('button', { type: 'button', className: 'q-option', onclick: () => choose(i) }, el('span', { className: 'q-key' }, String(i + 1))); b.append(html('span', '', label)); list.append(b); });
    keys = numbered(a.choices.map((_, i) => () => choose(i)));
    box.append(list);
  } else if (a.kind === 'multi') {
    const on = new Set(), list = el('div', { className: 'q-options' });
    a.choices.forEach((label, i) => { const b = el('button', { type: 'button', className: 'q-option', 'aria-pressed': 'false', onclick: () => { if (on.has(i)) on.delete(i); else on.add(i); b.classList.toggle('picked', on.has(i)); b.setAttribute('aria-pressed', String(on.has(i))); } }, el('span', { className: 'q-key' }, String(i + 1))); b.append(html('span', '', label)); list.append(b); });
    const done = check('btn primary', () => {
      if (!on.size) return;
      done.hidden = true;
      [...list.children].forEach((x, n) => { x.disabled = true; x.classList.remove('picked'); if (a.correct.includes(n)) x.classList.add('right'); else if (on.has(n)) x.classList.add('wrong'); });
      finish(isRight(a, [...on]));
    });
    keys = { ...numbered(a.choices.map((_, i) => () => list.children[i].click())), Enter: () => done.click() };
    box.append(list, el('div', { className: 'q-foot' }, done));
  } else if (a.kind === 'order') {
    const chosen = [], line = el('ol', { className: 'q-line' }), pile = el('div', { className: 'q-options' });
    const done = check('btn primary', () => {
      if (chosen.length < a.items.length) return;
      done.hidden = true; pile.remove();
      [...line.children].forEach((li, n) => { li.classList.add(chosen[n] === a.correct[n] ? 'ok' : 'no'); li.onclick = null; });
      finish(isRight(a, chosen));
    });
    done.hidden = true;
    const paint = () => {
      line.replaceChildren(...chosen.map((i) => { const li = el('li', { className: 'q-undo', title: 'Take it back', onclick: () => { chosen.splice(chosen.indexOf(i), 1); paint(); } }, a.items[i]); return li; }));
      pile.replaceChildren(...a.items.map((label, i) => (chosen.includes(i) ? null : el('button', { type: 'button', className: 'q-option', onclick: () => { chosen.push(i); paint(); } }, label))).filter(Boolean));
      done.hidden = chosen.length < a.items.length;
    };
    paint();
    box.append(line, pile, el('div', { className: 'q-foot' }, done));
  } else if (a.kind === 'match') {
    const given = a.left.map(() => null);
    let active = 0;
    const rows = el('div', { className: 'q-pairs' }), pile = el('div', { className: 'q-chips' });
    const done = check('btn primary', () => {
      if (given.includes(null)) return;
      done.hidden = true; pile.remove();
      [...rows.children].forEach((row, n) => { row.disabled = true; row.classList.add(given[n] === a.correct[n] ? 'ok' : 'no'); });
      finish(isRight(a, given));
    });
    const paint = () => {
      rows.replaceChildren(...a.left.map((label, i) => el('button', { type: 'button', className: `q-pair${i === active ? ' on' : ''}`, onclick: () => { given[i] = null; active = i; paint(); } }, el('b', {}, label), el('span', {}, given[i] == null ? '…' : a.right[given[i]]))));
      pile.replaceChildren(...a.right.map((label, r) => (given.includes(r) ? null : el('button', { type: 'button', className: 'q-chip', onclick: () => { given[active] = r; const open = given.indexOf(null); active = open >= 0 ? open : active; paint(); } }, label))).filter(Boolean));
      done.hidden = given.includes(null);
    };
    paint();
    box.append(rows, pile, el('div', { className: 'q-foot' }, done));
  } else if (a.kind === 'sort') {
    box.append(sorter({ left: a.sides[0], right: a.sides[1], items: a.items.map((text, i) => [text, a.correct[i] === 0 ? 'l' : 'r']) }, (score, n) => finish(score === n)));
  } else {
    const input = el('input', { type: 'text', className: 'input q-input', placeholder: 'Your answer', autocomplete: 'off', spellcheck: false, onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); done.click(); } } }), note = el('p', { className: 'muted', hidden: true });
    const done = check('btn primary', () => {
      if (!input.value.trim()) return;
      if (nearly(a, input.value)) { note.textContent = 'So close! Check the accents.'; note.hidden = false; return; }
      done.hidden = true; input.readOnly = true;
      finish(isRight(a, input.value));
    });
    box.append(el('div', { className: 'q-foot' }, input, done), note);
    ready(input);
  }
  box.append(said);
  return box;
}

// ---------- which screen ----------
function route() {
  const [id, k] = location.hash.slice(1).split('/');
  if (!COURSES[id]) { location.replace('./'); return; }
  if (k == null || k === '') list(id).catch(failed);
  else chapter(id, +k).catch(failed);
}
const failed = (e) => { console.error(e); stage.replaceChildren(el('p', { className: 'muted' }, 'That didn’t load. Try again in a moment.'), el('a', { className: 'btn', href: './' }, '← History')); };
addEventListener('hashchange', route);
route();
