// Fluence's tests like the ones in class, on the page: the paper (the formulas, a timer, and each question's context
// with its parts to answer), kept in this browser as you go so a closed tab loses nothing; handing it in; the page
// marking the numbers, choices, tables and graphs while you tick the points your written answers and sketches make
// against the mark scheme; and your score, with the topics to work on. kit/exam-kit.js makes the tests, and
// kit/tests.js opens them from a course's page.
import { markAuto, markSelf, plotMarks, lineFrom, pointsFor, within, choiceRight, sig, sup } from './exam-kit.js';
import { num, span } from './bank.js';

const el = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); for (const k of kids.flat()) if (k != null && k !== false) n.append(k.nodeType ? k : document.createTextNode(k)); return n; };
const html = (tag, cls, markup) => { const n = el(tag, { className: cls }); n.innerHTML = markup; return n; };   // markup here is always the tests' own, never typed by anyone
const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); return n; };
const plain = (markup) => { const d = document.createElement('div'); d.innerHTML = markup; return d.textContent; };
const clockText = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const letter = (i) => String.fromCharCode(97 + i);
const SELF = new Set(['written', 'sketch']);
const PENS = 4;                                      // pens have their own colours, then repeat
let plots = 0;                                       // (each plot's clip needs its own id)

// a test in progress, kept in this browser: { n, spent (seconds), answers, ticks, done (handed in) }, under key +
// '.exam-draft'; the best score under key + '.exam'
export const draftOf = (store, key) => store.get(key + '.exam-draft');
export const answered = (draft) => Object.values(draft?.answers || {}).filter((a) => a != null && a !== '' && !(Array.isArray(a) && a.every((x) => x == null || x === ''))).length;

// the paper for test n of a bank: app is where it goes, key where this course keeps things in the browser, back the
// course page's link, name the course's name, lessonLink(topic) a topic's lesson (or null), titled(…) the tab's title,
// and again() a link to another test
export function examPaper({ app, exam, n, key, store, back, name, lessonLink, titled, again }) {
  const test = exam.make(n), draftKey = key + '.exam-draft';
  let draft = draftOf(store, key);
  if (!draft || draft.n !== n) draft = { n, spent: 0, answers: {}, ticks: {}, done: false };
  draft.answers ??= {}; draft.ticks ??= {};
  const save = () => store.set(draftKey, draft);
  let saving = 0;
  const later = () => { clearTimeout(saving); saving = setTimeout(save, 300); };
  save();
  const parts = test.questions.flatMap((q, qi) => q.parts.map((p, pi) => ({ q, qi, p, pi, k: `${qi}.${pi}` })));
  const linesOf = (qi) => Object.fromEntries(test.questions[qi].parts.map((p, pi) => [pi, p.kind === 'plot' ? lineFrom(p, draft.answers[`${qi}.${pi}`]) : null]).filter(([, l]) => l));

  // ---------- marks ----------
  function tally() {
    let page = 0, pageOf = 0, mine = 0, mineOf = 0;
    const byQ = test.questions.map(() => [0, 0]);
    for (const { qi, p, k } of parts) {
      const auto = SELF.has(p.kind) ? null : markAuto(p, draft.answers[k], linesOf(qi));
      const got = auto ?? markSelf(p.marks, draft.ticks[k]);
      if (auto == null) { mine += got; mineOf += p.marks; } else { page += got; pageOf += p.marks; }
      byQ[qi][0] += got; byQ[qi][1] += p.marks;
      if (p.explain) { const e = markSelf(p.explain.marks, draft.ticks[k + '.why']); mine += e; mineOf += p.explain.marks; byQ[qi][0] += e; byQ[qi][1] += p.explain.marks; }
    }
    return { page, pageOf, mine, mineOf, score: page + mine, of: pageOf + mineOf, byQ };
  }
  // the topics of the parts that lost marks (in the order they came), for "what to work on"
  function missed() {
    const out = [];
    for (const { qi, p, k } of parts) {
      if (!p.topic || out.includes(p.topic)) continue;
      const auto = SELF.has(p.kind) ? null : markAuto(p, draft.answers[k], linesOf(qi));
      const lost = (auto ?? markSelf(p.marks, draft.ticks[k])) < p.marks || (p.explain && markSelf(p.explain.marks, draft.ticks[k + '.why']) < p.explain.marks);
      if (lost) out.push(p.topic);
    }
    return out;
  }

  // ---------- the paper ----------
  const timer = el('span', { className: 'muted timer' });
  let tick = 0;
  function clock() {
    clearInterval(tick);
    const paint = () => {
      timer.textContent = `${clockText(draft.spent)} of ${clockText(test.minutes * 60)}`;
      timer.classList.toggle('over', draft.spent > test.minutes * 60);
    };
    paint();
    if (draft.done) return;
    tick = setInterval(() => {
      if (!timer.isConnected) return clearInterval(tick);
      if (document.hidden) return;
      draft.spent++;
      paint();
      if (draft.spent % 5 === 0) save();
    }, 1000);
  }
  const setter = (k) => (v) => { draft.answers[k] = v; later(); };
  const summary = el('div', { className: 'mk-sum', hidden: true });

  function render() {
    titled(`${name} test ${n}`);
    const marking = !!draft.done;
    const head = [
      el('div', { className: 'pnav exam-bar' },
        el('a', { className: 'back', href: back }, marking ? '← ' + name : ['← Leave the test', el('span', { className: 'wide-only' }, ' (it’s kept)')]),
        el('span', { className: 'grow' }), timer,
        marking ? null : el('button', { className: 'btn primary', onclick: handIn }, 'Hand in')),
      el('h2', { className: 'tname' }, `${test.title || name} test`),
      el('p', { className: 'muted exam-meta' }, `Test ${n} · ${plural(test.questions.length, 'question')} · ${test.marks} marks · ${test.minutes} minutes`),
      marking ? summary : el('p', { className: 'lead small' }, 'Answer every part, and show your working where it asks. Numbers, choices, tables and graphs are marked for you; when you hand it in, you mark your written answers and sketches against the mark scheme. Your answers are kept in this browser as you go.'),
      test.guide ? el('details', { className: 'aside guide', open: true }, el('summary', {}, 'Formulas and data'), html('div', '', test.guide)) : null,
    ];
    const qs = test.questions.map((q, qi) => {
      const box = el('section', { className: 'xq', id: `q${qi + 1}` },
        el('h3', { className: 'xq-title' }, el('span', {}, `Question ${qi + 1}: `, el('b', {}, q.title)), el('span', { className: 'muted' }, `${q.marks} marks`)),
        html('div', 'ctx', q.intro),
        ...q.figures.map((f) => html('div', 'fig', f)),
        q.guide ? el('details', { className: 'aside', open: true }, el('summary', {}, 'Formulas for this question'), html('div', '', q.guide)) : null);
      const list = el('ol', { className: 'parts' });
      q.parts.forEach((p, pi) => list.append(partView(q, qi, p, pi, marking)));
      box.append(list);
      return box;
    });
    const foot = marking ? null : el('div', { className: 'start exam-foot' }, el('button', { className: 'btn primary big', onclick: handIn }, 'Hand in my test'), el('span', { className: 'muted' }, 'You can leave and come back: your answers are kept.'));
    app.replaceChildren(...[...head, ...qs, foot].filter(Boolean));
    clock();
    if (marking) paintSummary();
  }

  // one part: its letter, question and marks, a way to answer it, and once handed in, how it was marked
  function partView(q, qi, p, pi, marking) {
    const k = `${qi}.${pi}`, a = draft.answers[k], set = setter(k), lines = marking ? linesOf(qi) : {};
    const total = p.marks + (p.explain?.marks ?? 0);
    const li = el('li', { className: 'part' },
      el('div', { className: 'ask' }, el('span', { className: 'pl' }, `${letter(pi)}.`), html('span', 'ask-text', p.ask), el('span', { className: 'pm muted' }, `[${total}]`)));
    const auto = SELF.has(p.kind) ? null : markAuto(p, a, lines);
    const widget = {
      number: () => numberBox(a, set, marking, p.unit, 'Your answer', marking && (auto === p.marks)),
      steps: () => stepsBox(p, a, set, marking, lines),
      choice: () => choiceBox(p, a, set, marking),
      select: () => selectBox(p, a, set, marking),
      written: () => writtenBox(p.lines, a, set, marking),
      sketch: () => sketchBox(p, a, set, marking),
      table: () => tableBox(p, a, set, marking),
      plot: () => plotBox(p, a, set, marking),
    }[p.kind]();
    li.append(widget);
    if (p.explain) {
      const kw = k + '.why';
      li.append(el('div', { className: 'why' }, html('p', 'why-ask', p.explain.ask || 'Explain your answer.'), writtenBox(p.explain.lines, draft.answers[kw], setter(kw), marking)));
    }
    if (marking) li.append(markBox(p, k, a, auto, lines));
    return li;
  }

  // ---------- marking ----------
  function markBox(p, k, a, auto, lines) {
    const box = el('div', { className: 'mk' });
    if (auto != null) {
      box.classList.add(auto === p.marks ? 'good' : auto ? 'some' : 'bad');
      const head = el('p', { className: 'mk-head' }, el('b', {}, auto === p.marks ? '✓ ' : auto ? '◐ ' : '✗ '), `${auto} of ${plural(p.marks, 'mark')}`, el('span', { className: 'muted' }, ' · marked for you'));
      box.append(head);
      const right = rightAnswer(p, a, lines);
      if (right) box.append(right);
      if (p.working) box.append(el('details', { className: 'working', open: auto < p.marks }, el('summary', {}, 'The working'), html('div', 'sol', p.working)));
    } else {
      box.append(selfMark(p, k, p.marks, 'Mark it yourself: tick each point your answer makes.'));
      // (a sketch's model is the mark scheme's drawing; a written answer's is words)
      if (p.kind === 'sketch') box.append(el('div', { className: 'model-sketch' }, el('p', { className: 'muted' }, 'The mark scheme’s sketch:'), modelSketch(p)));
      else if (p.model) box.append(el('div', { className: 'model-answer' }, el('p', { className: 'muted' }, 'A model answer:'), html('p', '', p.model)));
      if (p.notes?.length) box.append(notesList(p.notes));
    }
    if (p.explain) {
      const e = p.explain, sub = el('div', { className: 'mk-why' });
      sub.append(selfMark(e, k + '.why', e.marks, 'Your reason: tick each point it makes.'));
      if (e.model) sub.append(el('div', { className: 'model-answer' }, el('p', { className: 'muted' }, 'A model answer:'), html('p', '', e.model)));
      if (e.notes?.length) sub.append(notesList(e.notes));
      box.append(sub);
    }
    if (p.topic && lessonLink(p.topic)) box.append(el('p', { className: 'learn-link' }, el('a', { href: lessonLink(p.topic) }, `Learn: ${p.topic} ›`)));
    return box;
  }
  const notesList = (notes) => el('div', { className: 'notes' }, el('p', { className: 'muted' }, 'Watch out:'), el('ul', {}, ...notes.map((t) => html('li', '', t))));
  // the points to tick for a part you mark yourself; the marks so far update as you tick (until you finish marking)
  function selfMark(p, k, marks, line) {
    const ticks = draft.ticks[k] ||= p.points.map(() => false);
    const badge = el('b', {});
    const paint = () => { const got = markSelf(marks, ticks); badge.textContent = `${got} of ${plural(marks, 'mark')}`; };
    const list = el('ul', { className: 'points' }, ...p.points.map((pt, i) => {
      const box = el('input', { type: 'checkbox', checked: !!ticks[i], disabled: !!draft.final, onchange: () => { ticks[i] = box.checked; paint(); save(); paintSummary(); } });
      return el('li', {}, el('label', {}, box, html('span', '', pt)));
    }));
    paint();
    return el('div', { className: 'self' }, el('p', { className: 'mk-head' }, badge, el('span', { className: 'muted' }, ` · ${line}`)), list,
      p.points.length > marks ? el('p', { className: 'muted small' }, `Any ${plural(marks, 'point')} earn the marks.`) : null);
  }
  // what was right, for the parts the page marks
  function rightAnswer(p, a, lines) {
    const unit = (u) => (u ? ' ' + u : '');
    if (p.kind === 'number') {
      const own = p.from && lines[p.from.part] ? p.from.value(lines[p.from.part]) : null;
      return html('p', 'answer-line', `The answer: <b>${sig(p.value, 3)}${unit(p.unit)}</b>${own != null && Number.isFinite(own) ? ` (from your own line: ${sig(own, 3)}${unit(p.unit)}, which earns the marks too)` : ''}.`);
    }
    if (p.kind === 'steps') {
      const own = p.from && lines[p.from.part] ? p.from.value(lines[p.from.part]) : null;
      return own != null && Number.isFinite(own) ? html('p', 'answer-line muted', `From your own line, the answer would be ${sig(own, 3)}${unit(p.steps.at(-1).unit)}, which earns the marks too.`) : null;
    }
    if (p.kind === 'select') return html('p', 'answer-line', p.fields.map((f) => `${f.label}: <b>${[].concat(f.correct).map((i) => f.options[i]).join('</b> or <b>')}</b>`).join('<br>'));
    if (p.kind === 'plot') {
      const m = plotMarks(p, a), good = p.pairs.map(([y, x]) => `${plain(p.quantities[y].label)} against ${plain(p.quantities[x].label)}`);
      return el('div', {},
        el('p', { className: 'answer-line' }, m.axes ? '✓ Those axes give a straight line.' : `✗ Those axes don’t give a straight line. Plot ${good[0]}${good.length > 1 ? ` (or ${good.slice(1).join(', or ')})` : ''}.`),
        m.axes ? el('p', { className: 'answer-line' }, m.line ? '✓ Your line is close to the line of best fit (dashed).' : '✗ Your line isn’t close enough to the line of best fit (dashed): it should follow the points’ trend, with about as many above it as below.') : null);
    }
    return null;
  }
  function paintSummary() {
    if (!draft.done) return;
    const t = tally(), pct = Math.round((t.score / t.of) * 100);
    if (draft.final) {
      const best = store.get(key + '.exam'), topics = missed();
      summary.replaceChildren(
        el('p', { className: 'score' }, `${t.score} / ${t.of}`),
        el('p', { className: 'muted' }, `${pct}%. ${draft.final.best ? 'A new best! ' : best ? `Your best: ${best.text}. ` : ''}It took ${clockText(draft.spent)}.`),
        el('p', { className: 'muted tally' }, t.byQ.map(([g, o], i) => `Question ${i + 1}: ${g} of ${o}`).join(' · ')),
        el('div', { className: 'start' }, el('a', { className: 'btn primary', href: again() }, 'Take another test'), el('a', { className: 'btn', href: back }, name)),
        ...(topics.length ? [el('div', { className: 'work-on' }, el('h3', {}, 'What to work on'),
          el('ul', { className: 'kinds' }, ...topics.map((tp) => el('li', {}, lessonLink(tp) ? el('a', { href: lessonLink(tp) }, tp) : tp))))] : []));
    } else {
      summary.replaceChildren(
        el('p', { className: 'score' }, `${t.score} / ${t.of}`),
        el('p', { className: 'muted' }, `The page has marked ${t.page} of ${t.pageOf}. Now mark the rest yourself: under each written answer and sketch, tick the points yours makes (${t.mine} of ${t.mineOf} so far).`),
        el('div', { className: 'start' }, el('button', { className: 'btn primary', onclick: finish }, 'Finish marking'), el('span', { className: 'muted' }, 'Your score is saved when you finish.')));
    }
    summary.hidden = false;
  }
  function finish() {
    const t = tally(), best = store.get(key + '.exam');
    const better = !best || t.score / t.of > best.score / best.of;
    draft.final = { score: t.score, of: t.of, best: better };
    if (better) store.set(key + '.exam', { score: t.score, of: t.of, text: `${t.score} / ${t.of}`, n, when: Date.now() });
    try { localStorage.removeItem('fluentio.' + draftKey); } catch {}
    render();
    window.scrollTo(0, 0);
  }
  function handIn() {
    const blank = parts.filter(({ p, k }) => { const a = draft.answers[k]; return a == null || a === '' || (Array.isArray(a) && a.every((x) => x == null || x === '')); }).length;
    const ask = el('div', { className: 'confirm' },
      el('span', {}, blank ? `${plural(blank, 'part')} still ${blank === 1 ? 'has' : 'have'} no answer. Hand in anyway? You can’t change your answers after.` : 'Hand in your test? You can’t change your answers after.'),
      el('span', { className: 'grow' }),
      el('button', { className: 'btn primary', onclick: () => { draft.done = true; save(); render(); window.scrollTo(0, 0); } }, 'Hand in'),
      el('button', { className: 'btn', onclick: () => ask.remove() }, 'Keep going'));
    // (in the bar, which stays in view, wherever on the paper the button was)
    document.querySelector('.exam-ask')?.remove();
    ask.classList.add('exam-ask');
    app.querySelector('.exam-bar').append(ask);
  }

  render();
  window.scrollTo(0, 0);
}

// ---------- the ways to answer ----------
function numberBox(value, set, ro, unit, label, good) {
  const input = el('input', { type: 'text', inputMode: 'decimal', autocomplete: 'off', spellcheck: false, className: 'ans' + (ro ? (good ? ' good' : ' bad') : ''), value: value ?? '', readOnly: ro, placeholder: ro ? 'blank' : 'Your answer' });
  input.setAttribute('aria-label', label);
  input.addEventListener('input', () => set(input.value));
  return el('div', { className: 'answer' }, input, unit ? html('span', 'unit', unit) : null);
}
function stepsBox(p, value, set, ro, lines) {
  const vals = Array.isArray(value) ? value.slice() : p.steps.map(() => '');
  const lastOwn = ro && p.from && lines[p.from.part] ? p.from.value(lines[p.from.part]) : null;
  return el('div', { className: 'steps' }, ...p.steps.map((s, i) => {
    const last = i === p.steps.length - 1;
    const ok = ro && (within(s.value, vals[i], s.tol) || (last && lastOwn != null && within(lastOwn, vals[i], p.from.tol ?? 0.03)));
    const input = el('input', { type: 'text', inputMode: 'decimal', autocomplete: 'off', spellcheck: false, className: 'ans' + (ro ? (ok ? ' good' : ' bad') : ''), value: vals[i] ?? '', readOnly: ro, placeholder: ro ? 'blank' : '' });
    input.setAttribute('aria-label', plain(s.label));
    input.addEventListener('input', () => { vals[i] = input.value; set(vals.slice()); });
    return el('label', { className: 'step-row' }, html('span', 'step-label', s.label), el('span', { className: 'answer' }, input, s.unit ? html('span', 'unit', s.unit) : null,
      ro ? el('span', { className: 'step-mark ' + (ok ? 'good' : 'bad') }, ok ? '✓' : `✗ ${sig(s.value, 3)}${s.unit ? ' ' + plain(s.unit) : ''}`) : null));
  }));
}
function choiceBox(p, value, set, ro) {
  const list = el('div', { className: 'choices' + (ro ? ' still' : '') });
  p.choices.forEach((c, i) => {
    const right = choiceRight(p.correct, i);
    const b = el(ro ? 'div' : 'button', { className: 'choice' + (value === i ? ' picked' : '') + (ro && right ? ' right' : '') + (ro && value === i && !right ? ' wrong' : '') });
    if (!ro) {
      b.type = 'button';
      b.onclick = () => { for (const x of list.children) x.classList.remove('picked'); b.classList.add('picked'); set(i); };
    }
    b.append(el('span', { className: 'letter' }, `(${String.fromCharCode(65 + i)})`), html('span', 'cv', c));
    list.append(b);
  });
  return list;
}
function selectBox(p, value, set, ro) {
  const vals = Array.isArray(value) ? value.slice() : p.fields.map(() => null);
  return el('div', { className: 'picks' }, ...p.fields.map((f, i) => {
    const ok = ro && vals[i] != null && choiceRight(f.correct, vals[i]);
    const s = el('select', { className: 'pick-in' + (ro ? (ok ? ' good' : ' bad') : ''), disabled: ro },
      el('option', { value: '' }, ro ? 'blank' : 'Choose…'), ...f.options.map((o, j) => el('option', { value: String(j), selected: vals[i] === j }, o)));
    s.addEventListener('change', () => { vals[i] = s.value === '' ? null : +s.value; set(vals.slice()); });
    return el('label', { className: 'pick' }, el('span', {}, f.label + ':'), s);
  }));
}
function writtenBox(lines, value, set, ro) {
  const ta = el('textarea', { className: 'written', rows: lines ?? 4, value: value ?? '', readOnly: ro, placeholder: ro ? 'Left blank' : 'Write your answer' });
  ta.setAttribute('aria-label', 'Your answer');
  ta.addEventListener('input', () => set(ta.value));
  return ta;
}
function tableBox(p, value, set, ro) {
  const vals = value && typeof value === 'object' ? JSON.parse(JSON.stringify(value)) : {};
  const body = el('tbody', {}, ...p.rows.map((row, r) => el('tr', {}, ...row.map((cell, c) => {
    const f = p.fill[c];
    if (!f || f.values[r] == null) return html('td', '', cell == null ? '' : String(cell));
    const ok = ro && within(f.values[r], vals[c]?.[r], f.tol);
    const input = el('input', { type: 'text', inputMode: 'decimal', autocomplete: 'off', spellcheck: false, className: 'cell' + (ro ? (ok ? ' good' : ' bad') : ''), value: vals[c]?.[r] ?? '', readOnly: ro });
    input.setAttribute('aria-label', `${plain(p.head[c])}, row ${r + 1}`);
    input.addEventListener('input', () => { (vals[c] ??= [])[r] = input.value; set(JSON.parse(JSON.stringify(vals))); });
    return el('td', { className: 'in' }, input, ro && !ok ? el('span', { className: 'was' }, sig(f.values[r], 3)) : null);
  }))));
  return el('div', { className: 'scroll' }, el('table', { className: 'data exam fill' }, el('thead', {}, el('tr', {}, ...p.head.map((h) => html('th', '', h)))), body));
}

// ---------- a graph to plot: pick the axes, see the points, drag a line of best fit by its two ends ----------
const W = 540, H = 350, PL = 70, PR = 18, PT = 14, PB = 54;
// numbers on an axis: when they're tiny or huge, the axis says ×10ⁿ and the numbers are shorter
const powerOf = (lo, hi) => { const m = Math.max(Math.abs(lo), Math.abs(hi)); return m && (m < 0.01 || m >= 10000) ? Math.floor(Math.log10(m)) : 0; };
function axes(svg, [x0, x1, xs], [y0, y1, ys], xLabel, yLabel) {
  const iw = W - PL - PR, ih = H - PT - PB;
  const X = (v) => PL + ((v - x0) / (x1 - x0)) * iw, Y = (v) => PT + ih - ((v - y0) / (y1 - y0)) * ih;
  const ex = powerOf(x0, x1), ey = powerOf(y0, y1);
  const ticks = (a, b, s) => { const t = []; for (let k = 0; a + k * s <= b + 1e-9 * Math.abs(s); k++) t.push(a + k * s); return t; };
  const tx = ticks(x0, x1, xs), ty = ticks(y0, y1, ys), every = (list) => (list.length > 11 ? 2 : 1);
  tx.forEach((v, i) => { svg.append(svgEl('line', { class: 'gr', x1: X(v), y1: PT, x2: X(v), y2: PT + ih })); if (i % every(tx) === 0) { const t = svgEl('text', { class: 'tk', x: X(v), y: PT + ih + 16, 'text-anchor': 'middle' }); t.textContent = num(v / 10 ** ex, 3); svg.append(t); } });
  ty.forEach((v, i) => { svg.append(svgEl('line', { class: 'gr', x1: PL, y1: Y(v), x2: PL + iw, y2: Y(v) })); if (i % every(ty) === 0) { const t = svgEl('text', { class: 'tk', x: PL - 7, y: Y(v) + 4, 'text-anchor': 'end' }); t.textContent = num(v / 10 ** ey, 3); svg.append(t); } });
  const zy = y0 <= 0 && y1 >= 0 ? Y(0) : PT + ih, zx = x0 <= 0 && x1 >= 0 ? X(0) : PL;
  svg.append(svgEl('line', { class: 'ax', x1: PL, y1: zy, x2: PL + iw, y2: zy }), svgEl('line', { class: 'ax', x1: zx, y1: PT, x2: zx, y2: PT + ih }));
  const xl = svgEl('text', { class: 'al', x: PL + iw / 2, y: H - 8, 'text-anchor': 'middle' }); xl.textContent = xLabel + (ex ? `  ×10${sup(ex)}` : '');
  const yl = svgEl('text', { class: 'al', transform: `translate(16 ${PT + ih / 2}) rotate(-90)`, 'text-anchor': 'middle' }); yl.textContent = yLabel + (ey ? `  ×10${sup(ey)}` : '');
  svg.append(xl, yl);
  return { X, Y, iw, ih, fromX: (px) => x0 + ((px - PL) / iw) * (x1 - x0), fromY: (py) => y0 + ((PT + ih - py) / ih) * (y1 - y0) };
}
function plotBox(p, value, set, ro) {
  let v = value && typeof value === 'object' ? { ...value } : { y: '', x: '', line: null };
  const keys = Object.keys(p.quantities), text = (k) => plain(p.quantities[k].label);
  const holder = el('div', { className: 'plot-pad' }), readout = el('p', { className: 'muted readout' });
  const pickAxis = (which) => {
    const s = el('select', { className: 'pick-in', disabled: ro }, el('option', { value: '' }, ro ? 'blank' : 'Choose…'), ...keys.map((k) => el('option', { value: k, selected: v[which] === k }, text(k))));
    s.addEventListener('change', () => { v = { ...v, [which]: s.value, line: null }; set({ ...v }); draw(); });
    return el('label', { className: 'pick' }, el('span', {}, which === 'y' ? 'On the y-axis:' : 'On the x-axis:'), s);
  };
  function draw() {
    holder.replaceChildren();
    readout.textContent = '';
    if (!p.quantities[v.y] || !p.quantities[v.x]) { holder.append(el('p', { className: 'muted plot-empty' }, 'Choose what goes on each axis, and the points appear here.')); return; }
    const pts = pointsFor(p, v.y, v.x), xr = span(pts.map((q) => q[0])), yr = span(pts.map((q) => q[1]));
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, class: 'graph plot', role: 'img', 'aria-label': `${text(v.y)} against ${text(v.x)}` });
    const { X, Y, iw, ih, fromX, fromY } = axes(svg, xr, yr, text(v.x), text(v.y));
    const id = `clip${++plots}`, clip = svgEl('clipPath', { id });
    clip.append(svgEl('rect', { x: PL, y: PT, width: iw, height: ih }));
    svg.append(clip);
    for (const [a, b] of pts) svg.append(svgEl('circle', { class: 'pt', cx: X(a), cy: Y(b), r: 4.5 }));
    // the line: across the whole graph through its two ends (the ends are where you read the gradient from)
    const ends = Array.isArray(v.line) && v.line.length === 2 ? v.line.map((e) => e.slice()) : [[xr[0] + 0.15 * (xr[1] - xr[0]), (yr[0] + yr[1]) / 2], [xr[0] + 0.85 * (xr[1] - xr[0]), (yr[0] + yr[1]) / 2]];
    // once marked, the line of best fit, dashed over yours
    const m = ro ? plotMarks(p, v) : null;
    const fit = m?.axes && m.fit ? svgEl('line', { class: 'fit', 'clip-path': `url(#${id})`, x1: X(xr[0]), y1: Y(m.fit.slope * xr[0] + m.fit.intercept), x2: X(xr[1]), y2: Y(m.fit.slope * xr[1] + m.fit.intercept) }) : null;
    if (ro && !Array.isArray(v.line)) { if (fit) svg.append(fit); holder.append(svg); readout.textContent = 'You didn’t draw a line.'; return; }
    const ruler = svgEl('line', { class: 'ruler', 'clip-path': `url(#${id})` });
    const handles = ends.map(() => { const g = svgEl('g', { class: 'handle' + (ro ? '' : ' live'), tabindex: ro ? -1 : 0 }); g.append(svgEl('circle', { class: 'hit', r: 18 }), svgEl('circle', { class: 'dot', r: 7.5 })); return g; });
    const paint = () => {
      const [[a, b], [c, d]] = ends, slope = (d - b) / (c - a || 1e-12);
      const at = (x) => b + slope * (x - a);
      ruler.setAttribute('x1', X(xr[0])); ruler.setAttribute('y1', Y(at(xr[0]))); ruler.setAttribute('x2', X(xr[1])); ruler.setAttribute('y2', Y(at(xr[1])));
      handles.forEach((h, i) => h.setAttribute('transform', `translate(${X(ends[i][0])} ${Y(ends[i][1])})`));
      readout.textContent = `Your line passes through (${sig(a, 3)}, ${sig(b, 3)}) and (${sig(c, 3)}, ${sig(d, 3)}).${ro ? '' : ' Drag its two ends to move it.'}`;
    };
    svg.append(...[ruler, fit, ...handles].filter(Boolean));
    paint();
    if (!ro) {
      const keep = () => { v = { ...v, line: ends.map((e) => e.slice()) }; set({ ...v }); };
      const toData = (e) => {
        const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
        const q = pt.matrixTransform(svg.getScreenCTM().inverse());
        return [fromX(Math.min(Math.max(q.x, PL), PL + iw)), fromY(Math.min(Math.max(q.y, PT), PT + ih))];
      };
      handles.forEach((h, i) => {
        h.addEventListener('pointerdown', (e) => { e.preventDefault(); h.setPointerCapture(e.pointerId); h.classList.add('held'); });
        h.addEventListener('pointermove', (e) => { if (!h.hasPointerCapture(e.pointerId)) return; ends[i] = toData(e); paint(); });
        const drop = (e) => { if (!h.hasPointerCapture?.(e.pointerId)) return; h.releasePointerCapture(e.pointerId); h.classList.remove('held'); keep(); };
        h.addEventListener('pointerup', drop);
        h.addEventListener('pointercancel', drop);
        // the arrow keys move an end a little (with Shift, more)
        h.addEventListener('keydown', (e) => {
          const step = e.shiftKey ? 0.05 : 0.01, dx = { ArrowLeft: -1, ArrowRight: 1 }[e.key] ?? 0, dy = { ArrowDown: -1, ArrowUp: 1 }[e.key] ?? 0;
          if (!dx && !dy) return;
          e.preventDefault();
          ends[i] = [Math.min(Math.max(ends[i][0] + dx * step * (xr[1] - xr[0]), xr[0]), xr[1]), Math.min(Math.max(ends[i][1] + dy * step * (yr[1] - yr[0]), yr[0]), yr[1])];
          paint(); keep();
        });
      });
    }
    holder.append(svg);
  }
  draw();
  return el('div', { className: 'plot-box' }, el('div', { className: 'picks' }, pickAxis('y'), pickAxis('x')), holder, readout);
}

// ---------- a sketch: draw lines by hand on blank axes, with a pen for each line, and label the axes ----------
// y0 is where the time (x) axis crosses, from 0 (the bottom) to 1: 0.5 for a quantity that goes below zero, like v_y
const SW = 480, SH = 300, SL = 36, SR = 14, ST = 14, SB = 30;
function sketchFrame(svg, xName, yName, y0 = 0) {
  const iw = SW - SL - SR, ih = SH - ST - SB, zy = ST + ih - Math.min(Math.max(+y0 || 0, 0), 1) * ih;
  for (let i = 1; i < 10; i++) {
    svg.append(svgEl('line', { class: 'gr faint', x1: SL + (iw * i) / 10, y1: ST, x2: SL + (iw * i) / 10, y2: ST + ih }));
    svg.append(svgEl('line', { class: 'gr faint', x1: SL, y1: ST + (ih * i) / 10, x2: SL + iw, y2: ST + (ih * i) / 10 }));
  }
  svg.append(svgEl('path', { class: 'ax arrow', d: `M${SL} ${zy}H${SL + iw}M${SL + iw - 7} ${zy - 5}L${SL + iw} ${zy}L${SL + iw - 7} ${zy + 5}` }));
  svg.append(svgEl('path', { class: 'ax arrow', d: `M${SL} ${ST + ih}V${ST}M${SL - 5} ${ST + 7}L${SL} ${ST}L${SL + 5} ${ST + 7}` }));
  if (zy < ST + ih) { const z = svgEl('text', { class: 'tk', x: SL - 6, y: zy + 4, 'text-anchor': 'end' }); z.textContent = '0'; svg.append(z); }
  const xl = svgEl('text', { class: 'al', x: SL + iw / 2, y: SH - 8, 'text-anchor': 'middle' }), yl = svgEl('text', { class: 'al', transform: `translate(${SL - 12} ${ST + ih / 2}) rotate(-90)`, 'text-anchor': 'middle' });
  xl.textContent = xName; yl.textContent = yName;
  svg.append(xl, yl);
  return { iw, ih, X: (x) => SL + x * iw, Y: (y) => ST + ih - y * ih, from: (px, py) => [Math.min(Math.max((px - SL) / iw, 0), 1), Math.min(Math.max((ST + ih - py) / ih, 0), 1)] };
}
const strokePath = (pts, f) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f.X(x).toFixed(1)} ${f.Y(y).toFixed(1)}`).join('');
function penKey(names) {
  return names.length > 1 ? el('div', { className: 'legend' }, ...names.map((nm, i) => el('span', { className: `k k${i % PENS}` }, nm))) : null;
}
function sketchBox(p, value, set, ro) {
  const v = { strokes: [], xl: '', yl: '', ...(value && typeof value === 'object' ? value : {}) };
  v.strokes = (v.strokes || []).map((s) => ({ pen: s.pen, pts: s.pts.map((q) => q.slice()) }));
  let pen = 0;
  const svg = svgEl('svg', { viewBox: `0 0 ${SW} ${SH}`, class: 'graph sketch-pad' + (ro ? '' : ' live'), role: 'img', 'aria-label': 'Your sketch' });
  const keep = () => set({ strokes: v.strokes.map((s) => ({ pen: s.pen, pts: s.pts.map((q) => q.map((n) => Math.round(n * 1000) / 1000)) })), xl: v.xl, yl: v.yl });
  let f, layer;
  const drawAll = () => {
    svg.replaceChildren();
    f = sketchFrame(svg, v.xl || (ro ? '' : 'x-axis'), v.yl || (ro ? '' : 'y-axis'), p.y0);
    layer = svgEl('g');
    for (const s of v.strokes) layer.append(svgEl('path', { class: `ink s${s.pen % PENS}`, d: strokePath(s.pts, f) }));
    svg.append(layer);
  };
  drawAll();
  const parts = [svg];
  if (!ro) {
    let live = null;
    const at = (e) => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const q = pt.matrixTransform(svg.getScreenCTM().inverse()); return f.from(q.x, q.y); };
    svg.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      svg.setPointerCapture(e.pointerId);
      live = { pen, pts: [at(e)] };
      live.path = svgEl('path', { class: `ink s${pen % PENS}`, d: strokePath(live.pts, f) });
      layer.append(live.path);
    });
    svg.addEventListener('pointermove', (e) => {
      if (!live) return;
      const q = at(e), last = live.pts.at(-1);
      if (Math.hypot(q[0] - last[0], q[1] - last[1]) < 0.006) return;
      live.pts.push(q);
      live.path.setAttribute('d', strokePath(live.pts, f));
    });
    const end = () => { if (!live) return; if (live.pts.length > 1) { v.strokes.push({ pen: live.pen, pts: live.pts }); keep(); } else live.path.remove(); live = null; };
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);
    // the pens (a line of each colour), then Undo and Clear
    const pens = p.pens.length > 1 ? [el('span', { className: 'muted' }, 'Draw:'), ...p.pens.map((nm, i) => el('button', { type: 'button', className: `pen p${i % PENS}` + (i === 0 ? ' on' : ''), onclick: (e) => { pen = i; for (const b of e.currentTarget.parentNode.querySelectorAll('.pen')) b.classList.toggle('on', b === e.currentTarget); } }, el('i'), nm))]
      : [el('span', { className: 'muted' }, 'Draw with your finger or the mouse.')];
    const tools = el('div', { className: 'pens' }, ...pens, el('span', { className: 'grow' }),
      el('button', { type: 'button', className: 'btn small', onclick: () => { v.strokes.pop(); drawAll(); keep(); } }, 'Undo'),
      el('button', { type: 'button', className: 'btn small', onclick: () => { v.strokes = []; drawAll(); keep(); } }, 'Clear'));
    const label = (which, name) => { const input = el('input', { type: 'text', className: 'ans wide', value: v[which], placeholder: name }); input.addEventListener('input', () => { v[which] = input.value; drawAll(); keep(); }); return el('label', { className: 'pick' }, el('span', {}, name + ':'), input); };
    parts.push(tools, el('div', { className: 'picks' }, label('yl', 'Label the y-axis'), label('xl', 'Label the x-axis')));
  } else parts.push(penKey(p.pens));
  return el('div', { className: 'sketch-box' }, ...parts.filter(Boolean));
}
// the mark scheme's sketch, drawn on the same kind of axes
function modelSketch(p) {
  const svg = svgEl('svg', { viewBox: `0 0 ${SW} ${SH}`, class: 'graph sketch-pad model', role: 'img', 'aria-label': 'The mark scheme’s sketch' });
  const f = sketchFrame(svg, plain(p.x), plain(p.y), p.y0);
  for (const c of p.model || []) svg.append(svgEl('path', { class: `ink s${c.pen % PENS}`, d: strokePath(c.pts, f) }));
  return el('div', {}, svg, penKey(p.pens));
}
