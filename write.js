// Writing an essay (write.html): pick something to write about, plan it, write it, and check it. What you write is saved as you
// type, in this browser and with the rest of your progress (fluentio.essays.list). The page checks what can be counted (checks.js),
// you mark what can't, and then you can compare with a model.
// Links: write.html is the list, write.html#new/hope starts a new essay on that prompt, write.html#own is your own question, and
// write.html#e/<id> is an essay of yours.
import { PROMPTS, GROUPS, PARTS, promptById } from './prompts.js';
import { analyze, countWords, RUBRIC, TARGETS } from './checks.js';

const f = window.fluentio, { el } = f;
const stage = document.getElementById('stage');
const LIST = 'fluentio.essays.list', WATCH = 'fluentio.essays.watch';
const all = () => f.read(LIST) || {};
const put = (e) => { const list = all(); list[e.id] = e; f.write(LIST, list); };
const remove = (id) => { const list = all(); delete list[id]; f.write(LIST, list); };
const button = (label, onclick, cls = 'btn') => el('button', { type: 'button', className: cls, onclick }, label);
const plural = (n, word) => `${n.toLocaleString('en-US')} ${word}${n === 1 ? '' : 's'}`;
const clockText = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const dateText = (t) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const promptOf = (e) => promptById(e.prompt);
const titleOf = (e) => promptOf(e)?.title || e.own?.title || 'Your own question';
const wordingOf = (e) => promptOf(e)?.prompt || e.own?.text || '';
const kindOf = (e) => promptOf(e)?.kind || e.own?.kind || 'argue';
const SHORT = ['paragraph', 'opening', 'ending'];
const isShort = (e) => SHORT.includes(kindOf(e));
const targetOf = (e) => promptOf(e)?.target || TARGETS[promptOf(e) ? kindOf(e) : 'own'];
const marksOf = (e) => RUBRIC.filter((t) => e.marks?.[t.id]).length;
const scoreOf = (e) => RUBRIC.reduce((n, t) => n + (e.marks?.[t.id] || 0), 0);
const finished = (e) => marksOf(e) === RUBRIC.length;
const LEARN_MORE = { focus: 'A thesis you can argue', evidence: 'Evidence that does its job', analysis: 'Say what it shows', order: 'Flow', style: 'Clear sentences', errors: 'Check and revise' };

let leave = null;      // what to do on the way out of an essay
const flush = () => { leave?.(); };
addEventListener('pagehide', flush);
addEventListener('fluence:going', flush);

function create(promptId, own = null) {
  const now = Date.now(), id = now.toString(36), p = promptById(promptId);
  const e = { id, prompt: promptId || null, own, title: p?.title || own?.title || '', plan: { ask: '', thesis: '', points: ['', '', ''] }, text: '', limit: 0, spent: 0, stage: SHORT.includes(p?.kind || own?.kind) ? 'write' : 'plan', started: now, edited: now, marks: {} };
  put(e);
  return id;
}

// ---------- the list ----------
function listPage() {
  leave = null;
  document.title = `Write an essay · English · ${f.settings.name}`;
  document.querySelector('main').classList.remove('e-wide');
  const essays = Object.values(all()).sort((a, b) => b.edited - a.edited), drafts = essays.filter((e) => !finished(e)), done = essays.filter(finished);
  const row = (e) => {
    const words = countWords(e.text);
    const sure = button('Delete', () => {
      if (sure.dataset.armed) { remove(e.id); listPage(); return; }
      sure.dataset.armed = '1';
      sure.textContent = 'Delete it?';
      setTimeout(() => { sure.textContent = 'Delete'; delete sure.dataset.armed; }, 3000);
    }, 'btn small e-delete');
    return el('div', { className: 'e-row-wrap' },
      el('a', { className: 'e-row', href: `#e/${e.id}` },
        el('span', { className: 'e-row-icon', 'aria-hidden': 'true' }, promptOf(e)?.emoji || '✏️'),
        el('span', { className: 'e-row-text' }, el('b', {}, titleOf(e)), el('small', { className: 'muted' }, `${plural(words, 'word')} · ${dateText(e.edited)}${finished(e) ? ` · You gave it ${scoreOf(e)} of ${RUBRIC.length * 4}` : ''}`)),
        el('span', { className: 'e-row-mark', 'aria-hidden': 'true' }, finished(e) ? '✓' : '›')),
      sure);
  };
  const writtenOn = (id) => essays.filter((e) => e.prompt === id);
  stage.replaceChildren(
    el('a', { className: 'back', href: './' }, '← English'),
    el('h1', { className: 'e-title' }, '✍️ Write an essay'),
    el('p', { className: 'lead small' }, 'Pick something to write about, plan it, write it, then check it. It’s saved as you type.'),
    ...(drafts.length ? [el('section', { className: 'e-unit' }, el('h2', {}, 'Keep going'), el('div', { className: 'e-rows' }, drafts.map(row)))] : []),
    el('a', { className: 'card e-own', href: '#own' }, el('span', { className: 'e-row-icon', 'aria-hidden': 'true' }, '📋'), el('span', { className: 'e-row-text' }, el('b', {}, 'Your own question'), el('small', { className: 'muted' }, 'Got an essay for class? Paste the question in, and plan, write and check it here.')), el('span', { className: 'e-row-mark', 'aria-hidden': 'true' }, '›')),
    ...GROUPS.map((g) => el('section', { className: 'e-unit' }, el('h2', {}, g.name), el('div', { className: 'e-rows' }, PROMPTS.filter((p) => p.group === g.id).map((p) => {
      const mine = writtenOn(p.id), best = mine.filter(finished).sort((a, b) => scoreOf(b) - scoreOf(a))[0];
      return el('a', { className: `e-row${best ? ' done' : ''}`, href: `#new/${p.id}` },
        el('span', { className: 'e-row-icon', 'aria-hidden': 'true' }, p.emoji),
        el('span', { className: 'e-row-text' }, el('b', {}, p.title), el('small', { className: 'muted' }, `${p.prompt} About ${p.minutes} minutes.`)),
        el('span', { className: 'e-row-mark', 'aria-hidden': 'true' }, best ? '✓' : '›'));
    })))),
    ...(done.length ? [el('section', { className: 'e-unit' }, el('h2', {}, 'Your essays'), el('div', { className: 'e-rows' }, done.map(row)))] : []));
  window.scrollTo(0, 0);
}

// ---------- your own question ----------
function ownPage() {
  leave = null;
  document.title = `Your own question · English · ${f.settings.name}`;
  document.querySelector('main').classList.remove('e-wide');
  const text = el('textarea', { className: 'e-text', rows: 4, placeholder: 'Paste or type the question…', 'aria-label': 'The question' });
  let kind = 'argue';
  const KINDS = [['argue', 'Argue a side', 'It looks for the other side being answered.'], ['text', 'About a text', 'It looks for quotations.'], ['sources', 'Uses sources', 'It looks for Source A, Source B and so on.'], ['paragraph', 'Just a paragraph', 'It looks for one good paragraph.']];
  const note = el('p', { className: 'muted e-small' }, KINDS[0][2]);
  const seg = el('div', { className: 'seg', role: 'group', 'aria-label': 'What kind of writing it is' }, KINDS.map(([k, name, why]) => {
    const b = button(name, () => { kind = k; note.textContent = why; [...seg.children].forEach((x) => x.classList.toggle('on', x === b)); }, k === kind ? 'on' : '');
    return b;
  }));
  const go = button('Start ›', () => {
    const words = text.value.trim();
    if (!words) { text.focus(); return; }
    location.hash = `#e/${create(null, { title: words.length > 60 ? `${words.slice(0, 57).trimEnd()}…` : words, text: words, kind })}`;
  }, 'btn primary');
  stage.replaceChildren(
    el('a', { className: 'back', href: '#' }, '← Write an essay'),
    el('h1', { className: 'e-title' }, '📋 Your own question'),
    el('p', { className: 'lead small' }, 'You plan, write and check it the same way. There’s no model to compare with, but the rubric still works.'),
    el('label', { className: 'e-field' }, el('b', {}, 'The question'), text),
    el('div', { className: 'e-field' }, el('b', {}, 'What kind of writing it is'), seg, note),
    el('div', { className: 'e-foot' }, go));
  text.focus();
  window.scrollTo(0, 0);
}

// ---------- an essay ----------
const paragraphs = (s) => s.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
function theText(t) {
  return el('figure', { className: 'e-passage' },
    el('figcaption', {}, el('b', {}, t.title), el('span', { className: 'muted' }, t.by)),
    t.note ? el('p', { className: 'muted e-small' }, t.note) : null,
    t.lines ? el('div', { className: 'e-poem' }, paragraphs(t.lines).map((stanza) => el('p', {}, stanza))) : el('p', {}, t.body));
}
function theSources(p) {
  return el('div', { className: 'e-sources' }, p.note ? el('p', { className: 'muted e-small' }, p.note) : null, p.sources.map((x) => el('figure', { className: 'e-passage' }, el('figcaption', {}, el('b', {}, x.name), el('span', { className: 'muted' }, x.from)), el('p', {}, x.text))));
}
function theQuestion(e) {
  const p = promptOf(e);
  return el('div', { className: 'e-question' }, el('p', { className: 'e-prompt' }, wordingOf(e)), p?.text ? theText(p.text) : null, p?.sources ? theSources(p) : null);
}
function open(id) {
  const e = all()[id];
  document.title = `${titleOf(e)} · English · ${f.settings.name}`;
  const main = document.querySelector('main');
  const stages = isShort(e) ? [['write', 'Write it'], ['check', 'Check it']] : [['plan', 'Plan it'], ['write', 'Write it'], ['check', 'Check it']];
  if (!stages.some(([k]) => k === e.stage)) e.stage = stages[0][0];
  const tabs = el('div', { className: 'e-stages', role: 'tablist', 'aria-label': 'Stages of writing this essay' }), body = el('div');
  const save = () => { e.edited = Date.now(); put(e); };
  const go = (to) => {
    leave?.();
    e.stage = to;
    put(e);
    tabs.replaceChildren(...stages.map(([k, name], i) => el('button', { type: 'button', role: 'tab', 'aria-selected': String(k === to), className: `e-stage-tab${k === to ? ' on' : ''}`, onclick: () => go(k) }, el('span', { className: 'e-key' }, String(i + 1)), name)));
    main.classList.toggle('e-wide', to === 'write' && !!(promptOf(e)?.text || promptOf(e)?.sources || !isShort(e)));
    leave = null;
    ({ plan: planStage, write: writeStage, check: checkStage })[to](e, body, go, save);
    window.scrollTo(0, 0);
  };
  stage.replaceChildren(
    el('div', { className: 'e-top' },
      el('a', { className: 'e-out', href: '#', title: 'Back to the list', 'aria-label': 'Back to the list' }, '✕'),
      el('div', { className: 'e-where' }, el('small', { className: 'muted' }, 'It’s saved as you type'), el('b', {}, titleOf(e)))),
    tabs, body);
  go(e.stage);
}

// ---------- plan it ----------
function planStage(e, body, go, save) {
  const p = promptOf(e), watch = f.read(WATCH);
  const field = (label, hint, node) => el('label', { className: 'e-field' }, el('b', {}, label), hint ? el('span', { className: 'muted e-small' }, hint) : null, node);
  const typing = (get, set, attrs = {}) => { const n = el(attrs.rows ? 'textarea' : 'input', { className: attrs.rows ? 'e-text' : 'input e-line', value: get(), oninput: () => { set(n.value); save(); }, ...attrs }); return n; };
  const limits = [[0, 'No limit'], [10, '10'], [20, '20'], [30, '30'], [40, '40'], [60, '60']];
  const seg = el('div', { className: 'seg', role: 'group', 'aria-label': 'A time limit, in minutes' }, limits.map(([m, name]) => {
    const b = button(name, () => { e.limit = m; save(); [...seg.children].forEach((x) => x.classList.toggle('on', x === b)); }, m === (e.limit || 0) ? 'on' : '');
    return b;
  }));
  const planned = el('div', { className: 'e-points' }, [0, 1, 2].map((i) => typing(() => e.plan.points[i] || '', (v) => { e.plan.points[i] = v; }, { placeholder: `Point ${i + 1}, and what proves it`, 'aria-label': `Point ${i + 1}` })));
  const start = button('Start writing ›', () => go('write'), 'btn primary');
  body.replaceChildren(
    theQuestion(e),
    ...(watch ? [el('p', { className: 'e-watch' }, el('b', {}, 'You told yourself: '), watch)] : []),
    el('div', { className: 'e-card' },
      el('p', { className: 'muted e-small' }, 'Five minutes is plenty, and it’s only for you. You can skip it, too.'),
      field('What’s it really asking?', '', typing(() => e.plan.ask, (v) => { e.plan.ask = v; }, { placeholder: 'In your own words', 'aria-label': 'What it’s asking' })),
      field('Your thesis', 'One sentence that answers the question, that someone could disagree with, and that says why.', typing(() => e.plan.thesis, (v) => { e.plan.thesis = v; }, { rows: 2, placeholder: '… because …', 'aria-label': 'Your thesis' })),
      el('div', { className: 'e-field' }, el('b', {}, 'Your points'), planned),
      el('div', { className: 'e-field' }, el('b', {}, 'A time limit, if you want one'), el('span', { className: 'muted e-small' }, `In minutes. ${p ? `This one usually takes about ${p.minutes}.` : 'A class essay usually takes about 40.'} Nothing stops when it runs out.`), seg),
      el('div', { className: 'e-foot' }, start, el('a', { className: 'e-small', href: 'learn.html#Plan%20in%20five%20minutes' }, 'How to plan quickly'))));
}

// ---------- write it ----------
function writeStage(e, body, go, save) {
  const [low, high] = targetOf(e), watch = f.read(WATCH);
  const box = el('textarea', { className: 'e-essay', value: e.text, placeholder: isShort(e) ? 'Start with your point…' : 'Start with a way in, and end your opening with your thesis. Press Return for each new paragraph…', spellcheck: true, 'aria-label': 'Your essay' });
  const count = el('span', { className: 'e-count-words' }), clock = el('span', { className: 'e-clock', role: 'timer' }), kept = el('span', { className: 'muted e-small e-saved' });
  const late = el('p', { className: 'e-note e-small', hidden: true }, 'Time’s up. Finish your sentence, or keep going if this isn’t a test.');
  let soon = 0, tick = 0, lastTick = Date.now();
  const words = () => { const n = countWords(box.value); count.textContent = `${plural(n, 'word')}`; count.title = `Aim for ${low} to ${high}`; count.classList.toggle('good', n >= low && n <= high); };
  const fit = () => { box.style.height = 'auto'; box.style.height = `${Math.max(box.scrollHeight + 2, innerHeight * 0.5)}px`; };
  const keep = () => { clearTimeout(soon); if (e.text !== box.value) { e.text = box.value; save(); } else put(e); kept.textContent = 'Saved'; };
  box.addEventListener('input', () => { words(); fit(); kept.textContent = ''; clearTimeout(soon); soon = setTimeout(keep, 500); });
  const time = () => {
    if (e.limit) {
      const left = e.limit * 60 - e.spent;
      clock.textContent = left >= 0 ? `${clockText(left)} left` : `${clockText(-left)} over`;
      clock.classList.toggle('over', left < 0);
      late.hidden = left >= 0;
    } else clock.textContent = clockText(e.spent);
  };
  tick = setInterval(() => {
    const now = Date.now(), gone = (now - lastTick) / 1000;
    lastTick = now;
    if (!document.hidden && gone < 5) { e.spent += gone; time(); }
  }, 1000);
  leave = () => { clearInterval(tick); keep(); };
  const check = button('Check it ›', () => { if (box.value.trim()) go('check'); else box.focus(); }, 'btn primary');
  const plan = e.plan?.thesis || e.plan?.points?.some(Boolean) ? el('details', { className: 'e-plan-view', open: true }, el('summary', {}, 'Your plan'), e.plan.thesis ? el('p', {}, el('b', {}, 'Thesis: '), e.plan.thesis) : null, el('ol', {}, e.plan.points.filter(Boolean).map((x) => el('li', {}, x)))) : null;
  const side = el('aside', { className: 'e-side-col' }, theQuestion(e), plan, watch ? el('p', { className: 'e-watch' }, el('b', {}, 'You told yourself: '), watch) : null);
  body.replaceChildren(el('div', { className: 'e-room' },
    el('div', { className: 'e-writing' },
      el('div', { className: 'e-bar' }, count, el('span', { className: 'muted e-small' }, `aim for ${low} to ${high}`), kept, el('span', { className: 'e-grow' }), clock),
      late, box, el('div', { className: 'e-foot' }, check)),
    side));
  words(); time(); fit();
  addEventListener('resize', fit, { passive: true });
  box.focus({ preventScroll: true });
  box.setSelectionRange(box.value.length, box.value.length);
}

// ---------- check it ----------
function essayView(text, spans) {
  const sorted = [...spans].sort((a, b) => a[0] - b[0]), merged = [];
  for (const [a, b] of sorted) { const end = merged.at(-1); if (end && a <= end[1]) end[1] = Math.max(end[1], b); else merged.push([a, b]); }
  const out = el('div', { className: 'e-essay-view' });
  let para = el('p'), at = 0;
  const addText = (s) => {
    s.split(/\n+/).forEach((piece, i) => {
      if (i) { if (para.childNodes.length) out.append(para); para = el('p'); }
      if (piece) para.append(piece);
    });
  };
  for (const [a, b] of merged) { addText(text.slice(at, a)); para.append(el('mark', {}, text.slice(a, b))); at = b; }
  addText(text.slice(at));
  if (para.childNodes.length) out.append(para);
  return out;
}
const TONE = { good: '✓', look: '●', ask: '?' };
function checkStage(e, body, go, save) {
  const p = promptOf(e), [low, high] = targetOf(e);
  const seen = analyze(e.text, { kind: kindOf(e), thesis: e.plan?.thesis || '', title: `${titleOf(e)} ${wordingOf(e)}`, target: [low, high] });
  const view = el('div'), paint = (spans = []) => view.replaceChildren(essayView(e.text, spans));
  paint();
  let on = null;
  const finding = (x) => {
    const has = x.spans.length > 0;
    const row = el(has ? 'button' : 'div', { className: `e-find ${x.tone}`, ...(has ? { type: 'button', onclick: () => {
      const same = on === row;
      on?.classList.remove('on');
      on = same ? null : row;
      row.classList.toggle('on', !same);
      paint(same ? [] : x.spans);
      if (!same) view.querySelector('mark')?.scrollIntoView({ block: 'center', behavior: f.moving() ? 'smooth' : 'auto' });
    } } : {}) },
      el('span', { className: 'e-find-mark', 'aria-hidden': 'true' }, TONE[x.tone]),
      el('span', { className: 'e-find-text' }, el('b', {}, x.title), el('small', {}, x.detail)),
      has ? el('span', { className: 'e-find-show muted' }, 'Show') : null);
    return row;
  };
  const outline = seen.outline.length > 1 ? el('section', { className: 'e-section' },
    el('h2', {}, 'Read only these'),
    el('p', { className: 'muted e-small' }, 'The first sentence of each paragraph. Do they make an argument, in order? If not, that’s the place to start.'),
    el('ol', { className: 'e-outline' }, seen.outline.map((o) => el('li', {}, el('span', { className: 'e-tag' }, o.role), ' ', o.text)))) : null;
  const look = seen.findings.filter((x) => x.tone !== 'good'), good = seen.findings.filter((x) => x.tone === 'good');
  body.replaceChildren(...[
    el('p', { className: 'e-stats' }, `${plural(seen.stats.words, 'word')} · ${plural(seen.stats.paragraphs, 'paragraph')} · ${plural(seen.stats.sentences, 'sentence')} · ${clockText(e.spent)} of writing`),
    el('p', { className: 'muted e-small' }, 'The page can only check what it can count. It can’t tell whether your argument is any good: that’s the marking further down.'),
    outline,
    el('section', { className: 'e-section' },
      el('h2', {}, look.length ? `${plural(look.length, 'thing')} to look at` : 'Nothing the page can spot'),
      el('div', { className: 'e-finds' }, look.map(finding)),
      good.length ? el('div', { className: 'e-finds e-finds-good' }, good.map(finding)) : null),
    el('section', { className: 'e-section' }, el('h2', {}, 'Your essay'), view,
      el('div', { className: 'e-foot' }, button('Back to writing', () => go('write')), copyButton(e))),
    marking(e, save),
    modelSection(e),
  ].filter(Boolean));
}
function copyButton(e) {
  const b = button('Copy it', async () => {
    try { await navigator.clipboard.writeText(e.text); b.textContent = 'Copied'; } catch { b.textContent = 'Couldn’t copy'; }
    setTimeout(() => { b.textContent = 'Copy it'; }, 1600);
  });
  return b;
}
// what only you can judge, a question at a time
function marking(e, save) {
  const box = el('section', { className: 'e-section' });
  let open = RUBRIC.findIndex((t) => !e.marks?.[t.id]);
  const draw = () => {
    const parts = RUBRIC.map((t, i) => {
      const mark = e.marks?.[t.id];
      if (i !== open) return el('button', { type: 'button', className: `e-trait-row${mark ? ' set' : ''}`, onclick: () => { open = i; draw(); } }, el('span', {}, t.name), el('b', {}, mark ? `${mark} of 4` : 'Not yet'));
      return el('div', { className: 'e-trait' }, el('b', {}, t.name), el('div', { className: 'e-options' }, t.levels.map((words, k) => el('button', { type: 'button', className: `e-option${mark === k + 1 ? ' picked' : ''}`, onclick: () => {
        e.marks = { ...e.marks, [t.id]: k + 1 };
        save();
        open = RUBRIC.findIndex((x) => !e.marks[x.id]);
        draw();
      } }, el('span', { className: 'e-key' }, String(k + 1)), words))));
    });
    const done = finished(e);
    let after = null;
    if (done) {
      const lowest = RUBRIC.reduce((a, b) => (e.marks[b.id] < e.marks[a.id] ? b : a)), step = LEARN_MORE[lowest.id];
      const next = el('input', { className: 'input e-line', value: e.next || '', placeholder: 'Next time I’ll…', 'aria-label': 'One thing to do better next time', oninput: () => { e.next = next.value; save(); f.write(WATCH, next.value.trim() || null); } });
      after = el('div', { className: 'e-result' },
        el('p', { className: 'e-score' }, `You gave it ${scoreOf(e)} of ${RUBRIC.length * 4}`),
        el('p', {}, `Your lowest is “${lowest.name}”. There’s a step on that: `, el('a', { href: `learn.html#${encodeURIComponent(step)}` }, `${step} ›`)),
        el('label', { className: 'e-field' }, el('b', {}, 'One thing to do better next time'), el('span', { className: 'muted e-small' }, 'It’ll be at the top when you next write.'), next));
    }
    box.replaceChildren(el('h2', {}, 'What only you can judge'), el('p', { className: 'muted e-small' }, 'Read your essay as if a stranger wrote it. Be honest: nobody else sees these.'), el('div', { className: 'e-traits' }, parts), ...(after ? [after] : []));
  };
  draw();
  return box;
}
// a model to compare with
function modelSection(e) {
  const p = promptOf(e), box = el('section', { className: 'e-section' });
  if (!p?.model) return null;
  const words = countWords(p.model.flat().map(([, t]) => t).join(' '));
  const show = () => {
    let parts = true;
    const body = el('div', { className: 'e-model on' }), toggle = button('Hide the parts', () => { parts = !parts; body.classList.toggle('on', parts); toggle.textContent = parts ? 'Hide the parts' : 'Show the parts'; legend.hidden = !parts; });
    const used = [...new Set(p.model.flat().map(([k]) => k))], legend = el('div', { className: 'e-legend' }, used.map((k) => el('span', { className: `e-part pt-${k}` }, PARTS[k])));
    body.append(...p.model.map((para) => el('p', {}, para.flatMap(([k, t]) => [el('span', { className: `e-part pt-${k}` }, t), ' ']))));
    box.replaceChildren(el('h2', {}, 'A model to compare with'), el('p', { className: 'muted e-small' }, `One good way to answer, ${words} words, written for this course. Yours doesn’t have to look like it. What does it do that yours doesn’t?`), el('div', { className: 'e-foot' }, toggle), legend, body);
  };
  box.append(el('h2', {}, 'A model to compare with'), el('p', { className: 'muted e-small' }, 'It’s more useful once you’ve written yours.'), button('Show the model', show));
  return box;
}

// ---------- which page ----------
function route() {
  flush();
  leave = null;
  const [what, which] = location.hash.slice(1).split('/');
  if (what === 'new' && promptById(which)) { history.replaceState(null, '', `#e/${create(which)}`); return route(); }
  if (what === 'own') return ownPage();
  if (what === 'e' && all()[which]) return open(which);
  listPage();
}
addEventListener('hashchange', route);
route();
