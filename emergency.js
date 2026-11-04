// The one-day AMC 10 lesson: a block at a time, cards to know cold and problems from the AMC bank, marked straight away
// and scored like the real test. Temporary: at midnight as November 4, 2026 ends the page is gone (and its copy of what
// you did), and just after that .github/workflows/emergency.yml on the space branch deletes its files. What you've done
// stays under 'fluentio:emergency' (not 'fluentio.', so it's never saved with your progress or your backups).
import { amc } from './amc.js';
import { amcLearning } from './amc-lessons.js';
import { BLOCKS, GOALS, NOW, points } from './emergency-lessons.js';

const f = window.fluentio, { el } = f, KEY = 'fluentio:emergency', ENDS = new Date(2026, 10, 5);
const app = document.getElementById('app'), LETTERS = 'ABCDE';
const html = (tag, cls, markup) => { const n = el(tag, { className: cls }); n.innerHTML = markup; return n; };
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const state = { done: {}, answers: {}, turn: {}, ...load() };
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} };

// gone at midnight, even with the page left open
function gone() { try { localStorage.removeItem(KEY); } catch {} location.replace('./'); }
function left() {
  const ms = ENDS - Date.now();
  if (ms <= 0) return gone();
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000);
  document.getElementById('left').textContent = `${h ? `${h} h ` : ''}${m} min left today. This lesson deletes itself at midnight.`;
}
setInterval(left, 30000);
left();

// ---------- the bank's problems, by topic ----------
const byTopic = new Map();
for (let n = 1; n <= amc.count; n++) { const q = amc.make(n); if (!byTopic.has(q.topic)) byTopic.set(q.topic, []); byTopic.get(q.topic).push({ n, rank: q.rank }); }
const order = amcLearning.path.flatMap((u) => u.topics);
// starts at the variant nearest the rank asked for, and "another" goes on through the topic
function variantOf(topic, rank) {
  const list = byTopic.get(topic), first = list.reduce((best, x, i) => (Math.abs(x.rank - rank) < Math.abs(list[best].rank - rank) ? i : best), 0);
  return list[(first + (state.turn[topic] || 0)) % list.length].n;
}
const score = (a) => a.right * 6 + a.blank * 1.5;
function tally(block) {
  const out = { right: 0, wrong: 0, blank: 0, tried: 0 };
  for (const [topic, rank] of block.drills || []) {
    const q = amc.make(variantOf(topic, rank)), got = state.answers[topic];
    if (!got || got.n !== q.n) continue;
    out.tried++;
    if (got.given === null) out.blank++; else if (got.given === q.answer.correct) out.right++; else out.wrong++;
  }
  return out;
}

// ---------- a problem ----------
function problem(block, topic, rank, i, onChange) {
  const box = el('div', { className: 'q' });
  function paint() {
    const q = amc.make(variantOf(topic, rank)), a = q.answer, got = state.answers[topic]?.n === q.n ? state.answers[topic] : null;
    const k = order.indexOf(topic), result = el('div', { className: 'result' });
    const list = el('div', { className: 'choices' });
    const settle = (given) => {
      [...list.children].forEach((b, j) => { b.disabled = true; if (j === a.correct) b.classList.add('right'); else if (j === given) b.classList.add('wrong'); });
      const worth = given === null ? '+1.5' : given === a.correct ? '+6' : '+0';
      result.className = `result ${given === a.correct ? 'good' : given === null ? '' : 'bad'}`;
      result.innerHTML = given === a.correct ? `✓ Right. ${worth}` : `${given === null ? 'Left blank.' : '✗ Not quite.'} ${worth}. The answer is <b>(${LETTERS[a.correct]})</b>.`;
      after.hidden = false;
      blank.hidden = true;
    };
    const answer = (given) => { state.answers[topic] = { n: q.n, given }; save(); settle(given); onChange(); };
    a.choices.forEach((c, j) => {
      const b = el('button', { className: 'choice', type: 'button', onclick: () => answer(j) });
      b.append(el('span', { className: 'letter' }, `(${LETTERS[j]})`), html('span', 'cv', c));
      list.append(b);
    });
    const blank = el('button', { className: 'btn', type: 'button', onclick: () => answer(null) }, 'Leave blank (+1.5)');
    const after = el('div', { hidden: true }, html('div', 'sol', q.solution), el('div', { className: 'row-end' },
      el('button', { className: 'btn', type: 'button', onclick: () => { state.turn[topic] = (state.turn[topic] || 0) + 1; delete state.answers[topic]; save(); paint(); onChange(); } }, 'Another like this'),
      k >= 0 ? el('a', { className: 'btn', href: `./#amc10/learn/${k}` }, 'The full lesson on this') : null));
    box.replaceChildren(el('div', { className: 'qhead' }, el('span', {}, `${i + 1}. ${q.topic}`), el('span', { className: 'muted' }, `like #${q.rank} on a test`)), html('p', 'qtext', q.text),
      ...(q.figure ? [html('div', 'fig', q.figure)] : []), list, el('div', { className: 'row-end' }, blank), result, after);
    if (got) settle(got.given);
  }
  paint();
  return box;
}

// ---------- a block ----------
const card = (c) => el('article', { className: `know${c.star ? ' star' : ''}` }, el('h3', {}, c.star ? '★ ' : '', c.title), html('p', 'rule', c.rule), html('p', 'ex', c.ex));
function goalsTable() {
  const row = (g, cls) => el('tr', { className: cls }, el('td', {}, g.say), el('td', {}, g.right), el('td', {}, g.wrong), el('td', {}, g.blank), el('td', {}, el('b', {}, points(g.right, g.blank))));
  const r = el('input', { className: 'input', type: 'number', min: 0, max: 25, value: NOW.right }), w = el('input', { className: 'input', type: 'number', min: 0, max: 25, value: NOW.wrong }), said = el('p', { className: 'calc-out' });
  const count = () => {
    const right = Math.max(0, Math.min(25, +r.value || 0)), wrong = Math.max(0, Math.min(25 - right, +w.value || 0)), blank = 25 - right - wrong;
    said.replaceChildren(`${blank} blank: `, el('b', {}, `${points(right, blank)} points`));
  };
  r.oninput = w.oninput = count;
  count();
  return el('div', {},
    el('p', {}, `You got ${NOW.right} of the ${NOW.right + NOW.wrong} you tried, so you’re accurate. Those ${NOW.blank} blanks are where your points are: each one you turn into a right answer is worth `, el('b', {}, '+4.5'), '. A wrong answer turned right is worth ', el('b', {}, '+6'), '.'),
    el('table', { className: 'goals' }, el('thead', {}, el('tr', {}, ...['', 'Right', 'Wrong', 'Blank', 'Points'].map((x) => el('th', {}, x)))), el('tbody', {}, GOALS.map((g, i) => row(g, i === 0 ? 'you' : i === 3 ? 'goal' : '')))),
    el('div', { className: 'calc' }, el('label', {}, 'Right ', r), el('label', {}, 'Wrong ', w), said));
}
function blockView(block) {
  const i = BLOCKS.indexOf(block), next = BLOCKS[i + 1], wrap = el('section', { className: 'block' });
  wrap.append(el('h2', {}, `${i + 1}. ${block.name}`), el('p', { className: 'lead small' }, `About ${block.mins} minutes. ${block.lead}`));
  if (block.id === 'plan') wrap.append(goalsTable());
  if (block.cards) {
    if (block.drills) wrap.append(el('p', { className: 'muted' }, 'Short of time? Do the ★ cards, then the problems.'));
    wrap.append(el('div', { className: 'knows' }, block.cards.map(card)));
  }
  if (block.drills) {
    const head = el('p', { className: 'tally' });
    const count = () => {
      const t = tally(block);
      head.textContent = t.tried ? `So far: ${t.right} right, ${t.wrong} wrong, ${t.blank} blank = ${score(t)} of ${t.tried * 6} points` : `${block.drills.length} problems, easier first. Answer or leave blank like the real thing.`;
    };
    count();
    wrap.append(el('h3', { className: 'part' }, 'Now try them'), head, el('div', { className: 'drills' }, block.drills.map(([topic, rank], n) => problem(block, topic, rank, n, count))));
  }
  if (block.steps) wrap.append(el('ol', { className: 'steps-list' }, block.steps.map((s) => el('li', {}, s))));
  if (block.test) wrap.append(el('p', {}, el('a', { className: 'btn primary', href: block.test.href }, block.test.text)));
  for (const l of block.lists || []) wrap.append(el('h3', { className: 'part' }, l.title), el('ul', { className: 'steps-list' }, l.items.map((s) => el('li', {}, s))));
  wrap.append(el('div', { className: 'row-end next' },
    el('button', { className: 'btn primary', type: 'button', onclick: () => { state.done[block.id] = true; save(); location.hash = next ? `#${next.id}` : '#plan'; if (!next) draw(); } }, next ? `Done. Next: ${next.name} →` : state.done[block.id] ? 'All done. Good luck!' : 'All done')));
  return wrap;
}

// ---------- the page ----------
function draw() {
  const id = location.hash.slice(1), block = BLOCKS.find((b) => b.id === id) || BLOCKS.find((b) => !state.done[b.id]) || BLOCKS[0];
  const finished = BLOCKS.filter((b) => state.done[b.id]).length, mins = BLOCKS.reduce((n, b) => n + b.mins, 0);
  app.replaceChildren(
    el('div', { className: 'bar-wrap', role: 'img', 'aria-label': `${finished} of ${BLOCKS.length} blocks done` }, el('div', { style: `width:${Math.round((100 * finished) / BLOCKS.length)}%` })),
    el('p', { className: 'muted small' }, `${finished} of ${BLOCKS.length} blocks done. About ${Math.floor(mins / 60)} h ${mins % 60} min in all, plus breaks.`),
    el('nav', { className: 'blocks', 'aria-label': 'Blocks' }, BLOCKS.map((b, i) => el('a', { href: `#${b.id}`, className: `${b === block ? 'on' : ''}${state.done[b.id] ? ' done' : ''}` }, `${state.done[b.id] ? '✓' : i + 1} ${b.name}`))),
    blockView(block));
}
addEventListener('hashchange', () => { draw(); scrollTo(0, 0); });
draw();
