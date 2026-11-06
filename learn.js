// Learning essays (learn.html): the list of steps, and each step a card at a time: something to read, things to try, and something
// to write yourself. Nothing is locked, and no score counts for anything: right first time is only there so you can see how it went.
// Links: learn.html is the list, learn.html#3 is the fourth step, and learn.html#A%20thesis%20you%20can%20argue is a step by its name.
import { UNITS, STEPS, COURSE } from './steps.js';
import { countWords } from './checks.js';

const f = window.fluentio, { el } = f;
const stage = document.getElementById('stage');
const html = (tag, cls, markup) => { const n = el(tag, { className: cls }); n.innerHTML = markup; return n; };   // (always this site's own words)
const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const LEARN = 'fluentio.essays.learn', YOURS = 'fluentio.essays.yours';
const saving = () => f.read('fluentio.learn.save') !== false;
const progress = () => f.read(LEARN) || {};
const keep = (title, fields) => { if (!saving()) return; const p = progress(); p[title] = { ...p[title], ...fields }; f.write(LEARN, p); };
const learned = (p = progress()) => STEPS.filter((s) => p[s.title]?.learned).length;

// ---------- keys: what each key does on this card (a focused button keeps its own Enter and Space) ----------
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
const shakeIt = (b) => { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); };
const say = (ok, words) => html('p', ok === true ? 'e-good' : ok === false ? 'e-bad' : 'e-note', words);

// ---------- the list of steps ----------
function list() {
  const p = progress(), done = learned(p), next = STEPS.findIndex((s) => !p[s.title]?.learned);
  document.title = `${COURSE.name} · English · ${f.settings.name}`;
  keys = {};
  let at = -1;
  stage.replaceChildren(
    el('a', { className: 'back', href: './' }, '← English'),
    el('h1', { className: 'e-title' }, '📘 How essays work'),
    html('p', 'lead small', `${STEPS.length} short steps. Each has one idea, things to try, and something to write yourself.`),
    ...(done ? [el('div', { className: 'e-sofar' }, el('span', { className: 'muted' }, `${done} of ${STEPS.length} steps done`),
      el('div', { className: 'e-meter', role: 'img', 'aria-label': `${done} of ${STEPS.length} steps done` }, el('div', { style: `width:${Math.round((done / STEPS.length) * 100)}%` })))] : []),
    next >= 0 ? el('a', { className: 'btn primary big e-go', href: `#${next}` }, `${done || p[STEPS[next].title] ? 'Continue' : 'Start'}: ${STEPS[next].title} ›`) : el('p', { className: 'e-clear' }, 'You’ve done every step. ', el('a', { href: 'write.html' }, 'Go and write something ›')),
    ...UNITS.map((u) => el('section', { className: 'e-unit' }, el('h2', {}, u.unit), el('div', { className: 'e-rows' }, u.steps.map((s) => {
      at++;
      const had = p[s.title], k = at;
      return el('a', { className: `e-row${had?.learned ? ' done' : ''}${k === next ? ' next' : ''}`, href: `#${k}` },
        el('span', { className: 'e-row-icon', 'aria-hidden': 'true' }, s.icon),
        el('span', { className: 'e-row-text' }, el('b', {}, s.title), el('small', { className: 'muted' }, s.blurb)),
        el('span', { className: 'e-row-mark', 'aria-hidden': 'true' }, had?.learned ? '✓' : '›'));
    })))));
  window.scrollTo(0, 0);
}

// ---------- a step, a card at a time ----------
function step(k) {
  const s = STEPS[k], had = progress()[s.title] || {};
  document.title = `${s.title} · English · ${f.settings.name}`;
  if (saving()) f.write('fluentio.last', { href: `${location.pathname}#${k}`, topic: s.title, test: COURSE.name, learned: learned(), total: STEPS.length, at: Date.now() });
  let at = !had.learned && had.card > 0 && had.card < s.cards.length ? had.card : 0;
  const tally = at ? { tried: had.tried || 0, right: had.right || 0 } : { tried: 0, right: 0 };
  const fill = el('div'), box = el('div', { className: 'e-stage' });
  stage.replaceChildren(
    el('div', { className: 'e-top' },
      el('a', { className: 'e-out', href: '#', title: 'Back to the steps', 'aria-label': 'Back to the steps' }, '✕'),
      el('div', { className: 'e-where' }, el('small', { className: 'muted' }, `Step ${k + 1} of ${STEPS.length}`), el('b', {}, s.title))),
    el('div', { className: 'e-progress', role: 'img', 'aria-label': 'How far through this step' }, fill),
    box);
  const show = () => {
    keys = {};
    fill.style.width = `${Math.round((at / s.cards.length) * 100)}%`;
    if (at >= s.cards.length) return finish();
    const next = () => { at++; keep(s.title, { card: at, tried: tally.tried, right: tally.right }); show(); window.scrollTo(0, 0); };
    box.replaceChildren(card(s.cards[at], s, at, next, tally, at === s.cards.length - 1));
  };
  const finish = () => {
    keep(s.title, { learned: true, card: 0, tried: tally.tried, right: tally.right, at: Date.now() });
    if (saving()) f.write('fluentio.last', { href: `${location.pathname}#${k}`, topic: s.title, test: COURSE.name, learned: learned(), total: STEPS.length, at: Date.now() });
    const after = STEPS[k + 1], go = after ? el('a', { className: 'btn primary', href: `#${k + 1}` }, `Next: ${after.title} ›`) : el('a', { className: 'btn primary', href: 'write.html' }, 'Go and write something ›');
    box.replaceChildren(el('div', { className: 'e-card e-done' },
      el('div', { className: 'e-big', 'aria-hidden': 'true' }, s.icon),
      el('h2', {}, s.title),
      el('p', {}, 'That’s this step done.'),
      tally.tried ? el('p', { className: 'muted' }, `${tally.right} of ${tally.tried} right the first time.`) : null,
      el('div', { className: 'e-foot' }, go, el('a', { className: 'btn', href: '#' }, 'All the steps'), after ? el('a', { className: 'btn', href: 'write.html' }, 'Write an essay') : null)));
    keys = { Enter: () => go.click() };
    ready(go);
  };
  show();
  window.scrollTo(0, 0);
}

// a card, with the way on underneath once it's done
function card(c, s, i, next, tally, last) {
  const onward = button(last ? 'Finish this step ›' : 'Next ›', next), foot = el('div', { className: 'e-foot', hidden: true }, onward);
  const page = el('div', { className: `e-card e-${c.kind}` });
  const open = () => { foot.hidden = false; keys = { ...keys, Enter: next, ' ': next }; ready(onward); };
  const score = (ok) => { tally.tried++; if (ok) tally.right++; };
  const make = { read, choose, sort, order, match, tap, label, write: writing }[c.kind];
  page.append(make(c, open, score, { s, i, foot, next }), foot);
  return page;
}
function read(c, open) {
  const body = html('div', 'e-read', c.html);
  queueMicrotask(open);
  return body;
}
function ask(c) { return html('p', 'e-ask', c.ask); }

function choose(c, open, score) {
  const list = el('div', { className: 'e-options' }), said = el('div', { role: 'status' });
  const pick = (i) => {
    keys = {};
    const ok = i === c.right;
    score(ok);
    [...list.children].forEach((b, n) => { b.disabled = true; if (n === c.right) b.classList.add('right'); else if (n === i) b.classList.add('wrong'); });
    said.replaceChildren(say(ok, `${ok ? 'Yes.' : 'Not quite.'} ${c.why}`));
    open();
  };
  c.options.forEach((label, i) => { const b = el('button', { type: 'button', className: 'e-option', onclick: () => pick(i) }, el('span', { className: 'e-key' }, String(i + 1))); const t = el('span'); t.innerHTML = label; b.append(t); list.append(b); });
  keys = numbered(c.options.map((_, i) => () => pick(i)));
  ready(list.firstChild);
  return el('div', {}, ask(c), list, said);
}

// one at a time, onto one of two sides
function sort(c, open, score) {
  const items = shuffle(c.items), item = el('div', { className: 'e-sort-item', role: 'status' }), count = el('div', { className: 'e-count muted' }), said = el('div', { role: 'status' });
  const shelfA = el('ul', { className: 'e-shelf' }), shelfB = el('ul', { className: 'e-shelf' });
  let i = 0;
  const showItem = () => { count.textContent = `${i + 1} of ${items.length}`; item.textContent = items[i][0]; said.replaceChildren(); };
  const pick = (side) => {
    if (i >= items.length) return;
    const [text, right, why] = items[i], ok = side === right;
    score(ok);
    (right === 0 ? shelfA : shelfB).append(el('li', { className: ok ? 'ok' : 'no' }, text));
    i++;
    const onward = () => { if (i >= items.length) { item.hidden = true; count.hidden = true; buttons.hidden = true; said.replaceChildren(); keys = {}; open(); } else { showItem(); keys = pickKeys; } };
    if (ok && !why) return onward();
    keys = {};
    const go = button(i >= items.length ? 'Done' : 'Next one ›', onward, 'btn');
    said.replaceChildren(say(ok, `${ok ? 'Yes.' : `That one goes under “${right === 0 ? c.left : c.right}”.`}${why ? ` ${why}` : ''}`), go);
    keys = { Enter: onward, ' ': onward };
    window.requestAnimationFrame(() => go.focus({ preventScroll: true }));
  };
  const a = button(c.left, () => pick(0), 'e-side'), b = button(c.right, () => pick(1), 'e-side'), buttons = el('div', { className: 'e-sides' }, a, b);
  const pickKeys = { 1: () => pick(0), 2: () => pick(1), ArrowLeft: () => pick(0), ArrowRight: () => pick(1) };
  keys = pickKeys;
  showItem();
  return el('div', {}, ask(c), count, item, buttons, said, el('div', { className: 'e-shelves' }, el('div', {}, el('b', {}, c.left), shelfA), el('div', {}, el('b', {}, c.right), shelfB)));
}

function order(c, open, score) {
  const placed = el('ol', { className: 'e-placed' }), pile = el('div', { className: 'e-options' }), said = el('div', { role: 'status' });
  let at = 0, slips = 0;
  shuffle(c.items).forEach((text) => {
    const b = el('button', { type: 'button', className: 'e-option', onclick: () => {
      if (text !== c.items[at]) { slips++; shakeIt(b); return; }
      at++;
      b.remove();
      placed.append(el('li', {}, text));
      if (at === c.items.length) {
        score(!slips);
        said.replaceChildren(say(slips ? null : true, `${slips ? `In order, with ${slips === 1 ? '1 wrong try' : `${slips} wrong tries`}.` : 'In order, first try.'}${c.why ? ` ${c.why}` : ''}`));
        open();
      }
    } }, text);
    pile.append(b);
  });
  return el('div', {}, ask(c), placed, pile, said);
}

function match(c, open, score) {
  const left = el('div', { className: 'e-match-side' }), right = el('div', { className: 'e-match-side' }), said = el('div', { role: 'status' });
  let held = null, found = 0, slips = 0;
  const side = (box, part) => shuffle(c.pairs).forEach((pair) => {
    const b = el('button', { type: 'button', className: 'e-match', onclick: () => {
      if (b.disabled) return;
      if (!held || held.box === box) { held?.b.classList.remove('picked'); b.classList.add('picked'); held = { b, box, pair }; return; }
      const other = held;
      held = null;
      other.b.classList.remove('picked');
      if (other.pair === pair) {
        for (const x of [b, other.b]) { x.disabled = true; x.classList.add('right'); }
        found++;
        if (found === c.pairs.length) { score(!slips); said.replaceChildren(say(slips ? null : true, slips ? `All paired, with ${slips === 1 ? '1 wrong try' : `${slips} wrong tries`}.` : 'All paired, first try.')); open(); }
        return;
      }
      slips++;
      shakeIt(b); shakeIt(other.b);
    } }, pair[part]);
    box.append(b);
  });
  side(left, 0);
  side(right, 1);
  return el('div', {}, ask(c), el('div', { className: 'e-count muted' }, 'Tap one on each side to pair them'), el('div', { className: 'e-match-grid' }, left, right), said);
}

// the sentence, in a paragraph
function tap(c, open, score) {
  const para = el('div', { className: 'e-para' }), said = el('div', { role: 'status' });
  let tries = 0, over = false;
  c.parts.forEach((text, i) => {
    const b = el('button', { type: 'button', className: 'e-sent', onclick: () => {
      if (over) return;
      tries++;
      if (i !== c.right) { b.classList.add('wrong'); shakeIt(b); said.replaceChildren(say(false, 'Not that one. Read it again: try another.')); return; }
      over = true;
      b.classList.add('right');
      score(tries === 1);
      said.replaceChildren(say(true, `Yes. ${c.why}`));
      open();
    } }, text);
    para.append(b, ' ');
  });
  return el('div', {}, ask(c), para, said);
}

// what each sentence is doing
function label(c, open, score) {
  const para = el('div', { className: 'e-para' }), row = el('div', { className: 'e-labels' }), said = el('div', { role: 'status' });
  const spans = c.parts.map(([text]) => { const n = el('span', { className: 'e-labelled' }, el('span', { className: 'e-tag-slot' }), text); para.append(n, ' '); return n; });
  let at = 0, slipped = false;
  const mark = () => spans.forEach((n, i) => n.classList.toggle('now', i === at));
  const pick = (i, b) => {
    if (at >= c.parts.length) return;
    if (i !== c.parts[at][1]) { slipped = true; shakeIt(b); said.replaceChildren(say(false, 'Not quite. What job is this sentence doing?')); return; }
    score(!slipped);
    slipped = false;
    spans[at].querySelector('.e-tag-slot').append(el('span', { className: `e-tag t${i}` }, c.labels[i]));
    spans[at].classList.add('set');
    said.replaceChildren();
    at++;
    mark();
    if (at >= c.parts.length) { row.hidden = true; keys = {}; open(); }
  };
  const buttons = c.labels.map((name, i) => { const b = button(name, () => pick(i, b), 'btn'); row.append(b); return b; });
  keys = numbered(buttons.map((b, i) => () => pick(i, b)));
  mark();
  return el('div', {}, ask(c), para, row, said);
}

// something to write, and how it compares
function writing(c, open, _score, { s, i }) {
  const yours = () => f.read(YOURS) || {};
  const saved = yours()[s.title]?.[i] ?? (c.keep ? f.read(`fluentio.essays.${c.keep}`) : '') ?? '';
  const store = (text) => {
    if (c.keep) { f.write(`fluentio.essays.${c.keep}`, text.trim() || null); return; }
    if (!saving()) return;
    const all = yours();
    all[s.title] = { ...all[s.title], [i]: text };
    f.write(YOURS, all);
  };
  const box = el('textarea', { className: 'e-text', rows: c.rows || 4, placeholder: c.placeholder || '', value: saved, 'aria-label': 'Your answer', oninput: () => { store(box.value); if (checked) look(); } });
  const hints = el('div', { role: 'status' }), after = el('div');
  let checked = false;
  const look = () => {
    const text = box.value.trim();
    if (!text) { hints.replaceChildren(say(null, 'Write something first, then see how it compares.')); return false; }
    const n = countWords(text), found = (c.hints || []).filter((h) => h.when(text, n)).map((h) => (typeof h.say === 'function' ? h.say(text, n) : h.say));
    hints.replaceChildren(...(found.length ? found.map((w) => say(false, w)) : [say(true, 'Nothing the page can spot. It can only spot so much, so here’s what to look for yourself.')]));
    return true;
  };
  const check = button('See how it compares', () => {
    if (!look()) { box.focus(); return; }
    checked = true;
    check.textContent = 'Check it again';
    check.className = 'btn';
    skip.remove();
    after.replaceChildren(
      el('h3', {}, 'What only you can judge'),
      el('ul', { className: 'e-checks' }, c.check.map((t) => el('li', {}, el('label', {}, el('input', { type: 'checkbox' }), ' ', t)))),
      el('h3', {}, c.models.length > 1 ? 'Ways to do it' : 'One way to do it'),
      ...c.models.map((m) => el('blockquote', { className: 'e-model-eg' }, m)));
    open();
  });
  const skip = button('Skip this for now', () => { checked = true; skip.remove(); check.remove(); open(); }, 'btn');
  return el('div', {}, ask(c), c.given ? el('blockquote', { className: 'e-given' }, c.given) : null, box, el('div', { className: 'e-foot' }, check, skip), hints, after);
}

// ---------- which page ----------
function route() {
  const raw = decodeURIComponent(location.hash.slice(1));
  if (!raw) return list();
  const named = STEPS.findIndex((s) => s.title === raw), k = named >= 0 ? named : /^\d+$/.test(raw) ? +raw : -1;
  if (k >= 0 && k < STEPS.length) return step(k);
  location.replace('#');
}
addEventListener('hashchange', route);
route();
