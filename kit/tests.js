// Fluence's test runner, shared by the Math, Science, Physics, Spanish and History pages: a card for each test, a test of random variants
// with a score (your best is kept in this browser), learning a topic at a time with hints, and practice by variant
// number with worked solutions. A course with an exam (kit/exam.js) also has tests like the ones in class, and then
// its test of random variants is called practice.
// Links: #triangles opens a test's page, #triangles/test starts a test (#triangles/test/40 one of 40 questions; an AMC
// test can end in /contest, /hard or /mixed, its shape; #triangles/practice is the same), #triangles/learn shows the
// learning path (#triangles/learn/3 its 4th topic, #triangles/learn/all mixed practice), #triangles/137 shows variant
// 137, and for a course with an exam, #heat/exam starts a test like the ones in class (#heat/exam/37 opens Test 37).
import { readNumber } from './bank.js';
import { examPaper, draftOf, answered } from './exam.js';
export { readNumber };
const el =(tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); for (const k of kids.flat()) if (k != null && k !== false) n.append(k.nodeType ? k : document.createTextNode(k)); return n; };
const html = (tag, cls, markup) => { const n = el(tag, { className: cls }); n.innerHTML = markup; return n; };   // markup here is always the banks' own, never typed by anyone
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const GOAL = 3;                                     // right in a row (first try, no hints) to learn a topic, unless a test says
const store = { get: (k) => { try { return JSON.parse(localStorage.getItem('fluentio.' + k)); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem('fluentio.' + k, JSON.stringify(v)); } catch {} } };
const clockText = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const random = (t) => 1 + Math.floor(Math.random() * t.bank.count);
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const standard = (t) => (t.amc ? 25 : t.length);   // a test's usual number of questions
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
// an AMC test's shape: easier problems first like the real contest (from rank 1 to 25), only the harder end, or every
// level in a random order. Other tests are always mixed.
const SHAPES = {
  contest: { name: 'Like the real AMC 10', from: 1, to: 25, about: 'Easier problems first, like the real contest: question 1 is about as hard as problem 1 of an AMC 10, and the last as hard as problem 25.' },
  hard: { name: 'Harder problems', from: 16, to: 25, about: 'Only problems like numbers 16 to 25 of a real AMC 10, getting harder as you go.' },
  mixed: { name: 'Mixed', about: 'Problems from every topic and every level, in a random order.' },
};
// (the shapes' words are written for the AMC 10: a course like another contest says its name)
const called = (t, words) => words.replaceAll('AMC 10', t.contest || 'AMC 10');
const shapeOf = (t, asked) => (!t.amc || !t.order ? 'mixed' : SHAPES[asked] ? asked : SHAPES[store.get(t.bank.id + '.shape')] ? store.get(t.bank.id + '.shape') : 'contest');
const testLink = (t, length, shape) => `#${t.bank.id}/${t.exam ? 'practice' : 'test'}${length === standard(t) ? '' : '/' + length}${t.amc && t.order ? '/' + shape : ''}`;
const bestKey = (t, shape) => t.bank.id + (shape === 'hard' || (shape === 'mixed' && t.amc && t.order) ? `.best-${shape}` : '.best');

// typed words: capitals, spaces and a final full stop don't matter; accents do (nearly() spots a slip in only those)
const words = (s) => String(s ?? '').normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.!?]+$/, '');
const bare = (s) => words(s).normalize('NFD').replace(/[̀-ͯ]/g, '');
export const nearly = (answer, given) => answer.kind === 'text' && given != null && !isRight(answer, given) && answer.accept.some((a) => bare(a) === bare(given));
// right if within the question's tolerance: { abs } is plus or minus that much, a plain number is a share of the answer;
// a typed answer is right if it's one of answer.accept; an order, a match or a sort has to be right all through, and choosing
// all that fit means all the right ones and none of the others
export function isRight(answer, given) {
  if (given == null) return false;
  if (answer.kind === 'choice') return given === answer.correct;
  if (answer.kind === 'text') return answer.accept.some((a) => words(a) === words(given));
  if (answer.kind === 'order' || answer.kind === 'match' || answer.kind === 'sort') return Array.isArray(given) && given.length === answer.correct.length && given.every((g, i) => g === answer.correct[i]);
  if (answer.kind === 'multi') return Array.isArray(given) && given.length === answer.correct.length && answer.correct.every((c) => given.includes(c));
  const v = readNumber(given);
  if (v == null) return false;
  const tol = answer.tol && typeof answer.tol === 'object' ? answer.tol.abs : Math.max((answer.tol ?? 0.02) * Math.abs(answer.value), 0.005);
  return Math.abs(v - answer.value) <= tol + 1e-9;
}
// a worked solution a step at a time, for hints: split after a sentence's end, or after a colon (so "The angles add up
// to 180°:" comes before the sum itself), never inside a tag
export function steps(markup) {
  const out = [];
  let depth = 0, from = 0;
  for (let i = 0; i < markup.length; i++) {
    if (markup[i] === '<') {
      const end = markup.indexOf('>', i);
      if (end < 0) break;
      const tag = markup.slice(i, end + 1);
      if (tag[1] === '/') depth--; else if (!/^<(br|hr|img|wbr)\b|\/>$/i.test(tag)) depth++;
      i = end;
    } else if (depth === 0 && markup[i + 1] === ' ' && (('.?!'.includes(markup[i]) && /[A-Z0-9(]/.test(markup[i + 2] || '')) || (markup[i] === ':' && markup[i - 1] !== ' '))) {
      out.push(markup.slice(from, i + 1));
      from = i + 2;
    }
  }
  out.push(markup.slice(from));
  // then no scraps: a short label ending in a colon goes with what follows it ("Volume:" with its sum), so does a colon
  // before a short result ("Divisible by 6:" with "50."), and a scrap left on its own ("2.") joins the sentence before it
  const text = (s) => s.replace(/<[^>]+>/g, '').trim(), parts = out.filter((s) => s.trim()), tidy = [];
  for (let i = 0; i < parts.length; i++) {
    let p = parts[i];
    while (i + 1 < parts.length && /:$/.test(text(p)) && (text(p).length < 14 || text(parts[i + 1]).length < 16)) p += ' ' + parts[++i];
    if (tidy.length && text(p).length < 8) tidy[tidy.length - 1] += ' ' + p;
    else tidy.push(p);
  }
  return tidy;
}
const fmt = (v) => (v < 0 ? '−' : '') + Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: 3 });
const sides = (answer, of) => answer.sides.map((side, s) => `${side}: ${answer.items.filter((_, i) => of[i] === s).join(', ') || 'none'}`).join('; ');
const shown = (answer) => (answer.kind === 'choice' ? (answer.choices.length === 2 ? answer.choices[answer.correct] : `(${LETTERS[answer.correct]}) ${answer.choices[answer.correct]}`)
  : answer.kind === 'text' ? answer.accept[0]
  : answer.kind === 'order' ? answer.correct.map((i) => answer.items[i]).join(' → ')
  : answer.kind === 'match' ? answer.left.map((l, i) => `${l} → ${answer.right[answer.correct[i]]}`).join('; ')
  : answer.kind === 'sort' ? sides(answer, answer.correct)
  : answer.kind === 'multi' ? answer.correct.map((i) => `(${LETTERS[i]}) ${answer.choices[i]}`).join(', ')
  : `${fmt(answer.value)}${answer.unit ? (answer.unit === '°' ? '°' : ' ' + answer.unit) : ''}`);
// what someone answered, for the review after a test
const yours = (answer, g) => (g == null ? 'left blank' : answer.kind === 'choice' ? (answer.choices.length === 2 ? answer.choices[g] : `(${LETTERS[g]})`)
  : answer.kind === 'order' ? g.map((i) => answer.items[i]).join(' → ')
  : answer.kind === 'match' ? g.map((j) => (j == null ? '?' : answer.right[j])).join(', ')
  : answer.kind === 'sort' ? sides(answer, g)
  : answer.kind === 'multi' ? g.map((i) => `(${LETTERS[i]})`).join(' ') : `${g}`);

// the page: tests = [{ bank, name, blurb, about, length, amc, contest, order(n), learn, exam, story(k), aside(), asideName, asideOpen }]
// story(k): a link to topic k as a story, shown on its lesson.
// contest: the name of the contest an AMC course is like, if it isn't the AMC 10.
// order(n), if given, is how hard variant n is: without a path, learning lists the easier topics first.
// exam, if given, is a bank of tests like the ones in class (kit/exam-kit.js's examBank).
// learn, if given, is { path: [{ unit, topics: [names] }], lessons: { name: { spot, idea, how: [steps], facts, watch: [traps],
// tip } }, goal, example }: the order to learn the topics in, a short lesson for each, how many right in a row learn a topic
// (3 if not given), and example: false to skip the worked example (for a word list, say, where it would add nothing). A
// lesson's spot (how to tell a problem is this kind) and facts (worth knowing by heart) are optional; its tip is shown
// after a wrong answer, and is the first hint (a question can bring its own tip instead, for a kind its lesson's doesn't fit).
// An answer is { kind: 'choice', choices, correct }, { kind: 'number', value, unit, tol }, { kind: 'text', accept: [the
// right answers], keys: [letters to offer as buttons], lang }, { kind: 'order', items: [html, as shown], correct: [the
// items' indexes in the right order] }, { kind: 'match', left: [html], right: [html], correct: [for each left, the index
// of its right] }, { kind: 'sort', sides: [two names], items: [html], correct: [for each item, 0 or 1 for its side] }, or
// { kind: 'multi', choices, correct: [the indexes of every right one] } (choose all that fit). A question with clues: [html]
// shows them one at a time above its answers, and two choices sit side by side.
export function testsPage({ tests }) {
  const app = document.getElementById('app'), top = document.getElementById('top');   // top: the page's title, shown on the cards only
  const byId = Object.fromEntries(tests.map((t) => [t.bank.id, t]));
  const topics = new Map();                         // each test's kinds of question, and the variants of each (worked out once)
  let run = null, clock = 0;                        // the test in progress, and its timer
  const show = (...nodes) => app.replaceChildren(...nodes.flat().filter(Boolean));   // (replaceChildren would print a null as "null")
  // the tab's title: what's showing, then the page (its body's data-title), then the site's name (settings.js)
  const titled = (...parts) => { document.title = [...parts, document.body.dataset.title, window.fluentio?.settings.name ?? 'Fluence'].join(' · '); };
  // a new screen: the old one fades as the new one rises, where the browser can (look.js says whether motion is on)
  const moving = () => window.fluentio?.moving?.() ?? !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const swap = (draw) => (document.startViewTransition && moving() ? document.startViewTransition(draw).ready.catch(() => {}) : draw());
  const go = (hash) => { if (location.hash !== hash) location.hash = hash; else swap(route); };
  // a question asked on the page itself (the Fluent browser has no confirm()): the first button does it
  const confirmBox = (question, yes, onYes, onNo, no = 'Cancel') => el('div', { className: 'confirm' },
    el('span', {}, question), el('span', { className: 'grow' }),
    el('button', { className: 'btn primary', onclick: onYes }, yes), el('button', { className: 'btn', onclick: onNo }, no));
  function route() {
    clearInterval(clock);
    const [id, part, sub, ...rest] = location.hash.slice(1).split('/');
    const t = byId[id];
    window.scrollTo(0, 0);
    top.hidden = !!t;
    if (!t) return home();
    if (part === 'test' || part === 'practice') {
      const words = [sub, ...rest], size = words.find((w) => /^\d+$/.test(w ?? ''));
      return startTest(t, size ? Math.min(Math.max(1, +size), t.bank.count) : Math.min(standard(t), t.bank.count), shapeOf(t, words.find((w) => SHAPES[w])));
    }
    if (part === 'exam' && t.exam) return openExam(t, sub);
    if (part === 'learn') return sub ? learn(t, sub) : learnHome(t);
    if (part && /^\d+$/.test(part)) return practice(t, Math.min(Math.max(1, +part), t.bank.count));
    return testHome(t);
  }
  const extra = (t, open) => (t.aside ? el('details', { className: 'aside', open: open || !!t.asideOpen }, el('summary', {}, t.asideName || 'Formulas'), t.aside()) : null);
  function kindsOf(t) {
    if (!topics.has(t)) {
      const byTopic = new Map(), hard = new Map(), topicOf = [], rankOf = [];
      for (let n = 1; n <= t.bank.count; n++) {
        const name = topicOf[n] = t.bank.make(n).topic;
        if (!byTopic.has(name)) byTopic.set(name, []);
        byTopic.get(name).push(n);
        if (t.order) hard.set(name, (hard.get(name) || 0) + (rankOf[n] = t.order(n)));
      }
      const names = [...byTopic.keys()], level = (name) => hard.get(name) / byTopic.get(name).length;
      if (t.order) names.sort((a, b) => level(a) - level(b));
      topics.set(t, { names, byTopic, topicOf, rankOf });
    }
    return topics.get(t);
  }
  // learning progress, topic → { streak, right, tried, learned }: kept for this visit, and saved in this browser unless
  // someone turns that off (then it's gone when the page closes)
  const saving = () => store.get('learn.save') !== false;
  const memory = {};
  const progressOf = (t) => (memory[t.bank.id] ??= (saving() && store.get(t.bank.id + '.learn')) || {});
  const keep = (t) => { if (saving()) store.set(t.bank.id + '.learn', progressOf(t)); };
  const setSaving = (on) => {
    store.set('learn.save', on);
    for (const t of tests) if (on) keep(t); else try { localStorage.removeItem(`fluentio.${t.bank.id}.learn`); localStorage.removeItem(`fluentio.${t.bank.id}.lastRun`); } catch {}
  };
  const learnedIn = (p) => Object.values(p).filter((s) => s.learned).length;
  // the order to learn in: the page's units, then any topic they leave out; without units, one list (easier first)
  function pathOf(t) {
    const { names } = kindsOf(t), units = (t.learn?.path || [{ unit: 'Topics', topics: names }])
      .map((u) => ({ unit: u.unit, topics: u.topics.filter((n) => names.includes(n)) })).filter((u) => u.topics.length);
    const listed = new Set(units.flatMap((u) => u.topics)), rest = names.filter((n) => !listed.has(n));
    if (rest.length) units.push({ unit: 'More', topics: rest });
    return units;
  }
  const sequence = (t) => pathOf(t).flatMap((u) => u.topics);
  const upNext = (t, p = progressOf(t)) => sequence(t).findIndex((n) => !p[n]?.learned);   // −1 once every topic is learned

  // ---------- the cards ----------
  function home() {
    titled();
    show(el('div', { className: 'grid stagger' }, ...tests.map((t) => {
      const best = store.get(t.bank.id + '.best'), exam = t.exam && store.get(t.bank.id + '.exam'), learned = learnedIn(progressOf(t));
      // a course with an exam has two bests: its tests like the ones in class, and its practice
      const bests = t.exam ? [exam && `Test: ${exam.text}`, best && `Practice: ${best.text}`].filter(Boolean).join(' · ') : best && `Best: ${best.text}`;
      return el('a', { className: 'card', href: '#' + t.bank.id },
        el('b', {}, t.name), el('span', { className: 'count' }, `${t.blurb} ${t.bank.count.toLocaleString('en-US')} variants${t.exam ? ', and tests like the ones in class' : ''}.`),
        el('span', { className: 'best' + (bests ? ' has' : '') }, bests || 'Not taken yet'),
        learned ? el('span', { className: 'best has' }, `${plural(learned, 'topic')} learned`) : null);
    })));
  }

  // ---------- one test's page: start a test, learn, or practise any variant ----------
  function testHome(t) {
    titled(t.name);
    const { names } = kindsOf(t), p = progressOf(t), learned = learnedIn(p), next = upNext(t, p);
    const howMany = el('input', { type: 'number', min: 1, max: t.bank.count, value: Math.min(standard(t), t.bank.count), className: 'num' });
    howMany.setAttribute('aria-label', 'Number of questions');
    let shape = shapeOf(t);
    const begin = () => { const len = Math.min(Math.max(1, Math.round(+howMany.value) || standard(t)), t.bank.count); go(testLink(t, len, shape)); };
    howMany.addEventListener('keydown', (e) => { if (e.key === 'Enter') begin(); });
    // an AMC test's shape (remembered for next time), what it means, and its own best score
    const shaped = t.amc && t.order, shapes = shaped ? el('div', { className: 'tabs shapes' }) : null;
    shapes?.setAttribute('aria-label', 'Kind of test');
    const note = el('p', { className: 'muted note' }), bestLine = el('p', { className: 'muted best-line' });
    const paintShape = () => {
      shapes?.replaceChildren(...Object.entries(SHAPES).map(([key, s]) => el('button', { className: 'tab' + (key === shape ? ' on' : ''),
        onclick: () => { shape = key; store.set(t.bank.id + '.shape', key); paintShape(); } }, called(t, s.name))));
      note.textContent = t.amc
        ? `${shaped ? called(t, SHAPES[shape].about) : 'Random problems in a random order every time.'} Scored like the ${t.contest || 'AMC 10'}: 6 points for right, 1.5 for blank, 0 for wrong (150 for 25 questions), with 3 minutes a question.`
        : `Random variants out of ${t.bank.count} in a random order every time, checked as you go.`;
      const best = store.get(bestKey(t, shape));
      bestLine.textContent = best ? `Your best${shaped ? ` (${called(t, SHAPES[shape].name).toLowerCase()})` : ''}: ${best.text}` : '';
      bestLine.hidden = !best;
    };
    paintShape();
    const pickN = el('input', { type: 'number', min: 1, max: t.bank.count, value: 1, className: 'num' });
    pickN.setAttribute('aria-label', 'Variant number');
    const open = () => go(`#${t.bank.id}/${Math.min(Math.max(1, Math.round(+pickN.value) || 1), t.bank.count)}`);
    pickN.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(); });
    const one = [el('button', { className: 'btn', onclick: open }, 'Open'), el('button', { className: 'btn', onclick: () => go(`#${t.bank.id}/${random(t)}`) }, 'Random variant')];
    // a course with an exam: its tests like the ones in class come first (or the one in progress), then practice
    const exam = t.exam ? (() => {
      const id = t.bank.id, draft = draftOf(store, id), going = draft && !draft.final, best = store.get(id + '.exam');
      return [
        el('h3', {}, 'Test'),
        el('div', { className: 'start' },
          going ? el('a', { className: 'btn primary big', href: `#${id}/exam/${draft.n}` }, draft.done ? `Finish marking Test ${draft.n}` : `Continue Test ${draft.n}`)
            : el('a', { className: 'btn primary big', href: `#${id}/exam` }, 'Start a test'),
          going ? el('a', { className: 'btn', href: `#${id}/exam/${newExam(t, draft.n)}` }, 'Start a new test') : null),
        el('p', { className: 'muted note' }, `A test like the ones in class: ${plural(t.exam.slots.length, 'question')} built on labs, data and graphs, about ${examMarks(t)} marks in ${t.exam.minutes} minutes. The page marks the numbers, choices, tables and graphs, and you mark your written answers and sketches against the mark scheme.`),
        best ? el('p', { className: 'muted best-line' }, `Your best: ${best.text}`) : null,
        el('h3', {}, 'Practice')];
    })() : [];
    show(
      el('a', { className: 'back', href: '#' }, '← All tests'),
      el('h2', { className: 'tname' }, t.name),
      el('p', { className: 'lead small' }, t.about),
      ...exam,
      shapes,
      el('div', { className: 'start' },
        el('button', { className: `btn${t.exam ? '' : ' primary'} big`, onclick: begin }, t.exam ? 'Start practice' : 'Start a test'),
        el('label', { className: 'muted' }, howMany, ' questions')),
      note, bestLine,
      t.exam ? el('div', { className: 'start' }, el('label', { className: 'muted' }, 'Or one question: variant ', pickN, ` of ${t.bank.count}`), ...one) : null,
      el('h3', {}, 'Learn'),
      el('div', { className: 'start' },
        next >= 0 ? el('a', { className: 'btn', href: `#${t.bank.id}/learn/${next}` }, Object.keys(p).length ? `Continue: ${sequence(t)[next]}` : 'Start learning') : null,
        el('a', { className: 'btn', href: `#${t.bank.id}/learn` }, 'The learning path'),
        el('span', { className: 'muted' }, `Lessons, worked examples and practice, a topic at a time. ${learned} of ${names.length} topics learned.`)),
      t.exam ? null : [el('h3', {}, 'Practice'), el('div', { className: 'start' }, el('label', { className: 'muted' }, 'Variant ', pickN, ` of ${t.bank.count}`), ...one)],
      el('h3', {}, `What's in it`),
      el('ul', { className: 'kinds' }, ...names.map((k) => el('li', {}, k))),
      extra(t, true));
  }

  // ---------- a test like the ones in class (kit/exam.js): the one in progress, or a new one ----------
  const examSize = new Map();
  // about how many marks a test has (to the nearest 5), from its first few
  const examMarks = (t) => { if (!examSize.has(t)) { let s = 0; for (let n = 1; n <= 6; n++) s += t.exam.make(n).marks; examSize.set(t, Math.round(s / 30) * 5); } return examSize.get(t); };
  const newExam = (t, not) => { let n; do n = 1 + Math.floor(Math.random() * t.exam.count); while (t.exam.count > 1 && n === not); return n; };
  function openExam(t, sub) {
    const id = t.bank.id, draft = draftOf(store, id), going = draft && !draft.final;
    // #heat/exam: the test in progress, or a new one
    if (!/^\d+$/.test(sub ?? '')) { history.replaceState(null, '', `#${id}/exam/${going ? draft.n : newExam(t)}`); return route(); }
    const n = Math.min(Math.max(1, +sub), t.exam.count);
    // another test is in progress: go back to it, or leave it for this one
    if (going && draft.n !== n && (answered(draft) || draft.done)) {
      titled(`${t.name} test`);
      return show(
        el('a', { className: 'back', href: '#' + id }, '← ' + t.name),
        el('h2', { className: 'tname' }, 'You have a test in progress'),
        el('p', { className: 'lead small' }, draft.done ? `Test ${draft.n} is handed in, but you haven’t finished marking it. Starting Test ${n} leaves it unmarked.` : `Test ${draft.n} isn’t handed in yet (${plural(answered(draft), 'answer')} so far). Starting Test ${n} leaves it behind.`),
        el('div', { className: 'start' },
          el('a', { className: 'btn primary', href: `#${id}/exam/${draft.n}` }, `Back to Test ${draft.n}`),
          el('button', { className: 'btn', onclick: () => { try { localStorage.removeItem(`fluentio.${id}.exam-draft`); } catch {} route(); } }, `Start Test ${n} instead`)));
    }
    const order = t.learn ? sequence(t) : [];
    examPaper({ app, exam: t.exam, n, key: id, store, back: '#' + id, name: t.name, titled, again: () => `#${id}/exam/${newExam(t, n)}`,
      lessonLink: (topic) => (order.includes(topic) ? `#${id}/learn/${order.indexOf(topic)}` : null) });
  }

  // ---------- a question: its text, figure, and a way to answer ----------
  // feedback: say right or wrong straight away (practice and the checked tests); otherwise just remember the answer (AMC).
  // learn: a wrong answer can be tried again (onWrong, with the lesson's nudge if there is one), hints show the working a
  // step at a time (onHelp), onAnswer comes once it's right, and onReveal if the whole working is shown first
  function card(q, { feedback, learn, nudge, onAnswer, given, onSkip, onWrong, onHelp, onReveal }) {
    const box = el('div', { className: 'q' },
      el('div', { className: 'qhead' }, el('span', {}, q.topic), el('span', { className: 'muted' }, `Variant ${q.n}`)),
      html('p', 'qtext', q.text));
    if (q.figure) box.append(html('div', 'fig', q.figure));
    // a question that comes as clues: one to start with, more when you ask or after a wrong try, and all of them after the answer
    const clues = q.clues ? el('ol', { className: 'clues' }) : null;
    const nextClue = () => { if (!clues) return; if (clues.children.length < q.clues.length) clues.append(html('li', '', q.clues[clues.children.length])); anotherClue.hidden = clues.children.length >= q.clues.length; };
    const anotherClue = el('button', { className: 'btn clue-more', onclick: nextClue }, 'Another clue');
    const allClues = () => { if (clues) while (clues.children.length < q.clues.length) nextClue(); };
    if (clues) { box.append(clues, anotherClue); nextClue(); }
    const result = el('div', { className: 'result' });
    const working = el('details', { className: 'working', hidden: true }, el('summary', {}, 'Show the working'));
    working.append(html('div', 'sol', q.solution));
    let answered = false;
    // the line that says right or wrong moves each time it changes (so a second wrong try shakes too)
    const mark = (cls) => { result.className = 'result'; void result.offsetWidth; result.className = `result ${cls}`; };
    const reveal = (ok, value) => {
      allClues();
      mark(ok ? 'good' : 'bad');
      result.innerHTML = ok ? '✓ Right.' : `✗ ${ok === null ? 'Skipped.' : nearly(q.answer, value) ? 'Almost: check the accents.' : 'Not quite.'} The answer is <b>${shown(q.answer)}</b>.`;
      working.hidden = false;
      if (!ok) working.open = true;
    };
    const finish = (value) => {
      if (answered && feedback) return;
      answered = true;
      const ok = isRight(q.answer, value);
      if (feedback) reveal(ok, value);
      onAnswer(value, ok);
    };
    // learning: hints come one at a time. With a lesson, the first is its tip (the way in, not the answer), the same one a
    // wrong answer shows; then the working comes out a sentence at a time (each new one fades in), and all of it once the
    // answer is right
    const parts = steps(q.solution), sol = el('div', { className: 'sol', hidden: true }), total = (nudge ? 1 : 0) + parts.length;
    let out = 0;
    const tip = el('p', { className: 'nudge', hidden: true });
    const label = () => {
      const used = (nudge && !tip.hidden ? 1 : 0) + out;
      hint.textContent = used === total - 1 ? 'Last hint' : `Hint ${used + 1} of ${total}`;
    };
    const showTip = () => { tip.innerHTML = `<b>Tip:</b> ${nudge}`; tip.hidden = false; label(); };
    const more = (k) => {
      if (!answered) onHelp();
      const from = out;
      out = Math.min(parts.length, out + k);
      if (out > from) sol.insertAdjacentHTML('beforeend', `${from ? ' ' : ''}<span class="fresh">${parts.slice(from, out).join(' ')}</span>`);
      sol.hidden = false;
      label();
      if (out === parts.length) { hints.hidden = true; if (!answered) onReveal(); }
    };
    const hint = el('button', { className: 'btn', hidden: total < 2, onclick: () => {
      if (!nudge || !tip.hidden || out) return more(1);
      if (!answered) onHelp();
      showTip();
    } }, `Hint 1 of ${total}`);
    const hints = el('div', { className: 'hints' }, hint, el('button', { className: 'btn', onclick: () => more(parts.length) }, 'Show the working'));
    const tryAgain = (value) => {
      mark('bad');
      result.textContent = nearly(q.answer, value) ? 'Almost: check the accents, then try again.' : nudge ? 'Not quite. Try again.' : 'Not quite. Try again, or take a hint.';
      if (nudge) showTip();
      nextClue();
      onWrong();
    };
    const gotIt = (value) => { allClues(); answered = true; tip.hidden = true; mark('good'); result.textContent = '✓ Right.'; more(parts.length); onAnswer(value, true); };
    if (q.answer.kind === 'choice') {
      const list = el('div', { className: `choices stagger${q.answer.choices.length === 2 ? ' two' : ''}` });
      q.answer.choices.forEach((c, i) => {
        const b = el('button', { className: 'choice' + (given === i ? ' picked' : ''), onclick: () => {
          if (answered && (feedback || learn)) return;
          if (learn) {
            if (i !== q.answer.correct) { b.classList.add('wrong'); b.disabled = true; return tryAgain(); }
            b.classList.add('right');
            return gotIt(i);
          }
          for (const x of list.children) x.classList.remove('picked');
          b.classList.add('picked');
          if (feedback) { b.classList.add(i === q.answer.correct ? 'right' : 'wrong'); list.children[q.answer.correct].classList.add('right'); }
          finish(i);
        } });
        b.append(el('span', { className: 'letter' }, `(${LETTERS[i]})`), html('span', 'cv', c));
        list.append(b);
      });
      box.append(list);
    } else if (['order', 'match', 'multi', 'sort'].includes(q.answer.kind)) {
      // put in order (tap them in turn and they build a timeline, tap one there to take it back), match each (tap a row, then
      // what goes with it), sort each onto one of two sides (the first one still to place, and tap one on a side to take it
      // back), or choose every one that fits (tap to choose or unchoose), then Check
      const a = q.answer, kind = a.kind, slots = kind === 'match' ? a.left : kind === 'sort' ? a.items : null;
      let picks = Array.isArray(given) ? [...given] : slots ? slots.map(() => null) : [];
      const area = el('div', { className: `choices ${kind}` });
      let locked = false, marked = false, paint;
      const piece = (cls, label, onclick) => { const b = el('button', { type: 'button', className: cls, disabled: locked, onclick }); b.append(html('span', 'cv', label)); return b; };
      const verdict = (ok) => (marked ? (ok ? ' right' : ' wrong') : '');
      if (kind === 'multi') {
        const buttons = a.choices.map((c, i) => {
          const b = el('button', { className: 'choice', onclick: () => { if (locked) return; picks = picks.includes(i) ? picks.filter((x) => x !== i) : [...picks, i]; paint(); } });
          b.append(el('span', { className: 'letter' }, `(${LETTERS[i]})`), html('span', 'cv', c));
          area.append(b);
          return b;
        });
        paint = () => buttons.forEach((b, i) => {
          b.classList.toggle('picked', picks.includes(i));
          b.disabled = locked;
          if (marked) { if (a.correct.includes(i)) b.classList.add(picks.includes(i) ? 'right' : 'missed'); else if (picks.includes(i)) b.classList.add('wrong'); }
        });
      } else if (kind === 'order') {
        const line = el('ol', { className: 'order-line', hidden: true }), pile = el('div', { className: 'order-pile' });
        area.append(line, pile);
        paint = () => {
          const had = area.contains(document.activeElement);
          line.hidden = !picks.length;
          line.replaceChildren(...picks.map((i, at) => el('li', {}, piece(`choice${verdict(a.correct[at] === i)}`, a.items[i], () => { picks = picks.filter((x) => x !== i); paint(); }))));
          pile.replaceChildren(...a.items.flatMap((c, i) => (picks.includes(i) ? [] : [piece('choice', c, () => { picks = [...picks, i]; paint(); })])));
          if (had) (pile.firstChild || check).focus({ preventScroll: true });
        };
      } else if (kind === 'match') {
        const rows = el('div', { className: 'pair-rows' }), chips = el('div', { className: 'pair-chips' });
        area.append(rows, chips);
        let active = Math.max(0, picks.indexOf(null));
        paint = () => {
          const had = area.contains(document.activeElement);
          rows.replaceChildren(...a.left.map((l, i) => {
            const b = el('button', { type: 'button', className: `pair-row${i === active && !locked ? ' on' : ''}${verdict(picks[i] === a.correct[i])}`, disabled: locked, onclick: () => { picks[i] = null; active = i; paint(); } });
            b.append(html('span', 'ml', l), picks[i] == null ? el('span', { className: 'mr muted' }, 'Tap what goes with it…') : html('span', 'mr', a.right[picks[i]]));
            return b;
          }));
          chips.replaceChildren(...a.right.flatMap((r, j) => (picks.includes(j) ? [] : [piece('pair-chip', r, () => { picks[active] = j; const open = picks.indexOf(null); active = open < 0 ? active : open; paint(); })])));
          if (had) (chips.firstChild || check).focus({ preventScroll: true });
        };
      } else if (kind === 'sort') {
        const place = (side) => { const i = picks.indexOf(null); if (i >= 0 && !locked) { picks[i] = side; paint(); } };
        const item = el('div', { className: 'sort-item', role: 'status' });
        const choose = el('div', { className: 'sort-sides' }, ...a.sides.map((side, s) => el('button', { type: 'button', className: 'sort-side', onclick: () => place(s) }, s ? `${side} →` : `← ${side}`)));
        const shelves = a.sides.map(() => el('div', { className: 'sort-shelf' }));
        area.append(item, choose, el('div', { className: 'sort-shelves' }, ...shelves));
        area.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') place(0); else if (e.key === 'ArrowRight') place(1); });
        paint = () => {
          const at = picks.indexOf(null), had = area.contains(document.activeElement);
          item.hidden = choose.hidden = at < 0 || locked;
          if (at >= 0) item.innerHTML = a.items[at];
          shelves.forEach((shelf, s) => shelf.replaceChildren(el('b', {}, a.sides[s]), ...a.items.flatMap((c, i) => (picks[i] === s ? [piece(`sort-placed${verdict(a.correct[i] === s)}`, c, () => { picks[i] = null; paint(); })] : []))));
          if (had && at < 0) check.focus({ preventScroll: true });
        };
      }
      const ready = () => (kind === 'order' ? picks.length === a.items.length : slots ? picks.every((x) => x != null) : picks.length > 0);
      const value = () => (kind === 'multi' ? [...picks].sort((x, y) => x - y) : [...picks]);
      // after the answer: each step of an order, each row of a match, each one sorted, each choice right or wrong (and any
      // right choice missed outlined)
      const marks = () => { marked = true; paint(); };
      const lock = () => { locked = true; check.disabled = true; skip.hidden = true; clear.hidden = true; paint(); };
      const check = el('button', { className: 'btn primary', onclick: () => {
        if (answered) return;
        if (!ready()) { mark('bad'); result.textContent = kind === 'order' ? 'Put every one in order first.' : kind === 'match' ? 'Match every one first.' : kind === 'sort' ? 'Put every one on a side first.' : 'Choose at least one first.'; return; }
        if (learn) {
          if (!isRight(a, value())) return tryAgain();
          lock(); marks();
          return gotIt(value());
        }
        lock();
        if (feedback) marks();
        finish(value());
      } }, 'Check');
      const clear = el('button', { className: 'btn', hidden: kind !== 'order', onclick: () => { if (!locked) { picks = []; paint(); } } }, 'Start again');
      const skip = el('button', { className: 'btn', hidden: !onSkip, onclick: () => { if (answered) return; answered = true; lock(); reveal(null); onSkip(); } }, 'Skip');
      paint();
      box.append(area, el('div', { className: 'answer check-row' }, check, clear, skip));
    } else {
      // a number, or (kind 'text') words, with buttons for the letters a keyboard may not have (answer.keys)
      const text = q.answer.kind === 'text';
      const input = el('input', { type: 'text', inputMode: text ? 'text' : 'decimal', autocomplete: 'off', autocapitalize: 'off', spellcheck: false, className: 'ans' + (text ? ' wide' : ''), placeholder: 'Your answer', value: given ?? '' });
      input.setAttribute('aria-label', 'Your answer');
      if (q.answer.lang) input.lang = q.answer.lang;
      const type = (ch) => {
        if (input.readOnly) return;
        const a = input.selectionStart ?? input.value.length, b = input.selectionEnd ?? a;
        input.value = input.value.slice(0, a) + ch + input.value.slice(b);
        input.focus();
        input.setSelectionRange(a + ch.length, a + ch.length);
      };
      const keys = text && q.answer.keys ? el('div', { className: 'keys' }, ...q.answer.keys.map((ch) => el('button', { className: 'key', type: 'button', onmousedown: (e) => e.preventDefault(), onclick: () => type(ch) }, ch))) : null;
      const check = el('button', { className: 'btn primary', onclick: () => {
        if (answered) return;
        if (text ? !input.value.trim() : readNumber(input.value) == null) { input.focus(); mark('bad'); result.textContent = text ? 'Type your answer first.' : 'Type a number (like 12.5, −3 or 3/4).'; return; }
        if (learn) {
          if (!isRight(q.answer, input.value)) { input.select(); return tryAgain(input.value); }
          input.readOnly = true; check.disabled = true;
          return gotIt(input.value);
        }
        input.readOnly = true; check.disabled = true; skip.hidden = true;
        finish(input.value);
      } }, 'Check');
      const skip = el('button', { className: 'btn', hidden: !onSkip, onclick: () => { if (answered) return; answered = true; input.readOnly = true; check.disabled = true; skip.hidden = true; reveal(null); onSkip(); } }, 'Skip');
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') check.click(); });
      box.append(...[el('div', { className: 'answer' }, input, q.answer.unit ? el('span', { className: 'unit' }, q.answer.unit) : null, check, skip), keys].filter(Boolean));   // (append would print a null as "null")
      requestAnimationFrame(() => input.focus({ preventScroll: true }));
    }
    box.append(result, ...(learn ? [tip, hints, sol] : [working]));
    return box;
  }

  // ---------- practice: any variant, check it, see the working ----------
  function practice(t, n) {
    titled(`${t.name} ${n}`);
    const q = t.bank.make(n);
    const next = el('button', { className: 'btn', disabled: n >= t.bank.count, onclick: () => go(`#${t.bank.id}/${n + 1}`) }, 'Next ›');
    show(
      el('div', { className: 'pnav btns' },
        el('a', { className: 'back', href: '#' + t.bank.id }, '← ' + t.name),
        el('span', { className: 'grow' }),
        el('button', { className: 'btn', disabled: n <= 1, onclick: () => go(`#${t.bank.id}/${n - 1}`) }, '‹ Previous'),
        el('button', { className: 'btn', onclick: () => go(`#${t.bank.id}/${random(t)}`) }, 'Random'),
        next),
      card(q, { feedback: true, onAnswer: () => requestAnimationFrame(() => next.focus({ preventScroll: true })) }),
      extra(t, false));
  }

  // ---------- learning: a path of units, and each topic on it a lesson, a worked example, then practice ----------
  function learnHome(t) {
    const goal = t.learn?.goal ?? GOAL;
    titled(`Learn ${t.name}`);
    const units = pathOf(t), order = units.flatMap((u) => u.topics), p = progressOf(t), next = upNext(t, p), done = learnedIn(p);
    const status = (s) => (!s ? '' : s.learned ? 'learned' : s.streak ? `${s.streak} of ${goal} in a row` : `${s.right} of ${s.tried} right`);
    const asking = el('div', { hidden: true });
    const save = el('input', { type: 'checkbox', checked: saving(), onchange: () => {
      if (save.checked) { setSaving(true); return learnHome(t); }
      save.checked = true;                         // not until they say so
      asking.hidden = false;
      asking.replaceChildren(confirmBox('Stop saving your progress? What this device has saved will be forgotten, and this visit keeps it until you close the page.',
        'Stop saving', () => { setSaving(false); learnHome(t); }, () => { asking.hidden = true; }, 'Keep saving'));
    } });
    show(
      el('a', { className: 'back', href: '#' + t.bank.id }, '← ' + t.name),
      el('h2', { className: 'tname' }, `Learn: ${t.name}`),
      el('p', { className: 'lead small' }, `${order.length} topics${units.length > 1 ? ` in ${units.length} units` : ''}, in an order where each builds on the ones before. Every topic starts with a short lesson${t.learn?.example === false ? '' : ' and a worked example'}, then practice with hints until you get ${goal} right in a row on the first try.`),
      el('div', { className: 'start' },
        next >= 0 ? el('a', { className: 'btn primary big', href: `#${t.bank.id}/learn/${next}` }, `${Object.keys(p).length ? 'Continue' : 'Start'}: ${order[next]}`)
          : el('span', { className: 'learned-note' }, '✓ Every topic learned!'),
        el('a', { className: 'btn', href: `#${t.bank.id}/learn/all` }, 'Mixed practice')),
      el('div', { className: 'progress' }, el('div', { style: `width:${(done / order.length) * 100}%` })),
      el('p', { className: 'muted qcount' }, `${done} of ${order.length} topics learned`),
      el('label', { className: 'save' }, save, ' Save my progress on this device', saving() ? null : el('span', { className: 'muted' }, ' (off: it lasts until you close the page)')),
      asking,
      units.flatMap((u, i) => [
        el('h3', {}, `${units.length > 1 ? `${i + 1}. ` : ''}${u.unit}`, el('span', { className: 'unitcount' }, ` · ${u.topics.filter((n) => p[n]?.learned).length} of ${u.topics.length}`)),
        el('ol', { className: 'path stagger' }, ...u.topics.map((name) => {
          const k = order.indexOf(name), s = p[name];
          return el('li', {}, el('a', { className: 'step' + (s?.learned ? ' learned' : '') + (k === next ? ' next' : ''), href: `#${t.bank.id}/learn/${k}` },
            el('span', { className: 'mark' }, s?.learned ? '✓' : String(k + 1)), el('span', { className: 'name' }, name), el('span', { className: 'muted' }, k === next ? 'up next' : status(s))));
        }))]),
      Object.keys(p).length ? (() => {
        const box = el('div', { className: 'start' });
        const button = el('button', { className: 'btn', onclick: () => box.replaceChildren(confirmBox(`Forget what you've learned in ${t.name}?`,
          'Forget it', () => { memory[t.bank.id] = {}; keep(t); learnHome(t); }, () => box.replaceChildren(button), 'Keep it')) }, 'Start over');
        box.append(button);
        return box;
      })() : null,
      extra(t, false));
  }
  function learn(t, which) {
    const goal = t.learn?.goal ?? GOAL;
    const order = sequence(t), { byTopic } = kindsOf(t), mixed = which === 'all', named = (() => { try { return order.indexOf(decodeURIComponent(which)); } catch { return -1; } })(), k = named >= 0 ? named : +which;
    if (!mixed && !(Number.isInteger(k) && k >= 0 && k < order.length)) return go(`#${t.bank.id}/learn`);
    const topic = mixed ? null : order[k], lesson = (name) => t.learn?.lessons?.[name];
    titled(`Learn ${topic ?? t.name}`);
    const p = progressOf(t), seen = new Set(), units = pathOf(t);
    const stat = (name) => (p[name] ??= { streak: 0, right: 0, tried: 0, learned: false });
    // a variant of a topic, new ones first; the next topic on the path that isn't learned yet (−1 if none)
    const variant = (name) => { const all = byTopic.get(name), fresh = all.filter((n) => !seen.has(n)), n = pick(fresh.length ? fresh : all); seen.add(n); return n; };
    const after = (from) => { for (let j = 1; j <= order.length; j++) { const x = (from + j) % order.length; if (!p[order[x]]?.learned) return x; } return -1; };
    const lit = {};                                  // how many dots each topic showed last time, so only a new one pops
    const dots = (s, name) => {
      const n = s?.learned ? goal : Math.min(s?.streak ?? 0, goal), was = lit[name] ?? n;
      lit[name] = n;
      return el('span', { className: 'dots', title: `${Math.min(s?.streak ?? 0, goal)} of ${goal} in a row` },
        ...Array.from({ length: goal }, (_, i) => el('span', { className: i < n ? (i >= was ? 'on new' : 'on') : '' })));
    };
    let current = topic;                             // the topic of the question showing (in mixed practice it changes)
    // (for Continue on the home page: this topic, and how far along this test you are)
    const remember = () => { if (!mixed && saving()) store.set('last', { href: `${location.pathname}#${t.bank.id}/learn/${k}`, topic, test: t.name, learned: learnedIn(p), total: order.length, at: Date.now() }); };
    const head = el('div', { className: 'learnhead' });
    const paint = () => {
      const s = p[current], unit = units.find((u) => u.topics.includes(current))?.unit;
      head.replaceChildren(...[
        el('b', {}, mixed ? `Mixed practice: ${learnedIn(p)} of ${order.length} topics learned` : current),
        el('span', { className: 'muted' }, mixed ? `This one: ${current}` : `${units.length > 1 ? unit + ' · ' : ''}topic ${k + 1} of ${order.length}`),
        dots(s, current),
        el('span', { className: 'muted' }, s?.learned ? '✓ Learned' : `${Math.min(s?.streak ?? 0, goal)} of ${goal} in a row`)]);
    };

    // a topic's stages: the lesson (when there is one), a worked example, and practice; mixed practice is only practice
    const stages = mixed ? ['practice'] : [lesson(topic) && 'lesson', t.learn?.example !== false && 'example', 'practice'].filter(Boolean);
    const LABEL = { lesson: 'Lesson', example: 'Worked example', practice: 'Practice' };
    const tabs = el('div', { className: 'tabs', hidden: stages.length < 2 }), stage = el('div');
    const views = {};
    function goTo(s) {
      tabs.replaceChildren(...stages.map((x, i) => el('button', { className: 'tab' + (x === s ? ' on' : ''), onclick: () => goTo(x) }, `${i + 1}. ${LABEL[x]}`)));
      stage.replaceChildren(views[s] ??= { lesson: lessonView, example: exampleView, practice: practiceView }[s]());
      window.scrollTo(0, 0);
    }
    function lessonView() {
      const l = lesson(topic);
      return el('div', { className: 'lesson' },
        t.story ? el('p', { className: 'story-link' }, el('a', { href: t.story(k) }, '📖 Read this one as a story ›')) : null,
        l.spot ? html('p', 'spot', `<b>Spot it:</b> ${l.spot}`) : null,
        html('div', 'idea', l.idea),
        el('h4', {}, 'How to do it'), el('ol', {}, ...l.how.map((s) => html('li', '', s))),
        l.facts?.length ? [el('h4', {}, 'Key facts'), el('ul', { className: 'facts' }, ...l.facts.map((s) => html('li', '', s)))] : null,
        el('h4', {}, 'Watch out for'), el('ul', {}, ...l.watch.map((s) => html('li', '', s))),
        el('div', { className: 'start' }, stages.includes('example')
          ? el('button', { className: 'btn primary', onclick: () => goTo('example') }, 'See a worked example ›')
          : el('button', { className: 'btn primary', onclick: () => goTo('practice') }, 'Start practicing ›')));
    }
    // a worked example: a real variant, its working shown a step at a time
    function exampleView() {
      const q = t.bank.make(variant(topic)), parts = steps(q.solution);
      const box = el('div', { className: 'q example' },
        el('div', { className: 'qhead' }, el('span', {}, 'Worked example'), el('span', { className: 'muted' }, `Variant ${q.n}`)),
        html('p', 'qtext', q.text));
      if (q.figure) box.append(html('div', 'fig', q.figure));
      const options = q.answer.kind === 'choice' ? el('div', { className: 'choices still stagger' }, ...q.answer.choices.map((c, i) => el('div', { className: 'choice' }, el('span', { className: 'letter' }, `(${LETTERS[i]})`), html('span', 'cv', c)))) : null;
      const worked = el('ol', { className: 'worked' }), answer = html('p', 'answer-line', `Answer: <b>${shown(q.answer)}</b>`);
      answer.hidden = true;
      let out = 0;
      const reveal = (n) => {
        for (const s of parts.slice(out, out + n)) worked.append(html('li', '', s));
        out = Math.min(parts.length, out + n);
        one.textContent = `Step ${out + 1} of ${parts.length}`;
        if (out < parts.length) return;
        one.hidden = all.hidden = true; answer.hidden = false; tryIt.hidden = false;
        options?.children[q.answer.correct].classList.add('right');
      };
      const one = el('button', { className: 'btn primary', onclick: () => reveal(1) }, `Step 1 of ${parts.length}`);
      const all = el('button', { className: 'btn', onclick: () => reveal(parts.length) }, 'Show every step');
      const tryIt = el('button', { className: 'btn primary', hidden: true, onclick: () => goTo('practice') }, 'Now you try ›');
      box.append(...[options, worked, answer, el('div', { className: 'hints' }, one, all, tryIt)].filter(Boolean));
      return box;
    }
    // practice: as many tries as it takes; a topic is learned after `goal` right in a row on the first try without hints
    function practiceView() {
      const box = el('div');
      const ask = () => {
        const open = order.filter((n) => !p[n]?.learned), name = mixed ? pick(open.length ? open : order) : topic;
        const q = t.bank.make(variant(name));
        current = name;
        let clean = true, settled = false;
        const note = el('p', { className: 'learned-note', hidden: true });
        const onward = el('a', { className: 'btn primary', hidden: true });
        const settle = (right) => {
          if (settled) return;
          settled = true;
          const s = stat(name);
          s.tried++;
          if (right) s.right++;
          s.streak = right && clean ? s.streak + 1 : 0;
          if (s.streak >= goal && !s.learned) { s.learned = true; note.hidden = false; note.textContent = mixed ? `You've learned ${name}!` : 'Topic learned!'; }
          if (!mixed && s.learned) {
            const j = after(k);
            onward.href = j >= 0 ? `#${t.bank.id}/learn/${j}` : `#${t.bank.id}/learn`;
            onward.textContent = j >= 0 ? `Next topic: ${order[j]} ›` : 'Every topic learned: back to the path';
            onward.hidden = false; next.className = 'btn';
          }
          keep(t);
          remember();
          paint();
        };
        const next = el('button', { className: 'btn primary', hidden: true, onclick: () => { settle(false); ask(); window.scrollTo(0, 0); } }, mixed ? 'Next question ›' : 'Another one ›');
        const ready = () => { next.hidden = false; requestAnimationFrame(() => (onward.hidden ? next : onward).focus({ preventScroll: true })); };
        const body = card(q, { learn: true, nudge: q.tip || lesson(name)?.tip, onWrong: () => { clean = false; }, onHelp: () => { clean = false; }, onReveal: ready, onAnswer: () => { settle(true); ready(); } });
        paint();
        box.replaceChildren(...[body, note, el('div', { className: 'start' }, onward, next),
          mixed && lesson(name) ? el('p', { className: 'muted' }, 'Stuck? ', el('a', { href: `#${t.bank.id}/learn/${order.indexOf(name)}` }, `The lesson on ${name}`)) : null].filter(Boolean));
      };
      ask();
      return box;
    }

    paint();
    remember();
    show(el('div', { className: 'pnav' }, el('a', { className: 'back', href: `#${t.bank.id}/learn` }, '← The learning path'), el('span', { className: 'grow' })),
      head, tabs, stage, extra(t, false));
    // a new topic starts at its lesson; one you've practised before starts at practice
    goTo(mixed || p[topic] ? 'practice' : stages[0]);
  }

  // ---------- a test ----------
  function startTest(t, length, shape) {
    titled(`${t.name} ${t.exam ? 'practice' : 'test'}`);
    run = { t, list: shape === 'mixed' ? mixedList(t, length) : gradedList(t, length, SHAPES[shape]), shape, i: 0, given: [], started: Date.now() };
    showQuestion();
  }
  // mixed: spread over every kind of question (each kind once before any kind twice), in a random order
  function mixedList(t, length) {
    const { kinds, count } = t.bank;
    const pool = Array.from({ length: kinds }, (_, k) => shuffle(Array.from({ length: Math.ceil((count - k) / kinds) }, (_, j) => k + 1 + j * kinds)));
    const list = [];
    while (list.length < length) for (const k of shuffle([...pool.keys()])) if (list.length < length && pool[k].length) list.push(pool[k].pop());
    return shuffle(list);
  }
  // graded: question i is about as hard as its place in a real contest, running from rank `from` to rank `to`: a random
  // variant within a rank of the nearest, from a topic the test hasn't had yet (until every topic has had a turn), and
  // never easier than `from` (while the bank has enough)
  function gradedList(t, length, { from, to }) {
    const { topicOf, rankOf } = kindsOf(t), used = new Set(), had = new Set(), list = [];
    let floor = from;
    for (let i = 0; i < length; i++) {
      const want = length === 1 ? (from + to) / 2 : from + ((to - from) * i) / (length - 1);
      const open = (n) => !used.has(n) && rankOf[n] >= floor;
      const cost = (n) => Math.abs(rankOf[n] - want) + (had.has(topicOf[n]) ? 100 : 0);
      let best = Infinity;
      for (let n = 1; n <= t.bank.count; n++) if (open(n)) best = Math.min(best, cost(n));
      if (best === Infinity) { if (floor === 1) break; floor = 1; i--; continue; }   // nothing left that hard: take what there is
      const near = [];
      for (let n = 1; n <= t.bank.count; n++) if (open(n) && cost(n) <= best + 1) near.push(n);
      const n = pick(near);
      used.add(n); had.add(topicOf[n]); list.push(n);
    }
    return list.sort((a, b) => rankOf[a] - rankOf[b]);
  }
  function startClock(timer, limit) {
    clearInterval(clock);
    const paint = () => {
      if (!timer.isConnected) return clearInterval(clock);
      const s = Math.floor((Date.now() - run.started) / 1000);
      timer.textContent = clockText(s) + (limit ? ` of ${clockText(limit)}` : '');
      timer.classList.toggle('over', !!limit && s > limit);
    };
    paint();
    clock = setInterval(paint, 1000);
  }
  function showQuestion() {
    const { t, list, i } = run, q = t.bank.make(list[i]), last = i === list.length - 1;
    const move = (to) => { run.i = to; window.scrollTo(0, 0); showQuestion(); };
    const timer = el('span', { className: 'muted timer' });
    let bar;
    if (t.amc) {
      // AMC: answer in any order, change your mind, leave some blank
      const next = el('button', { className: 'btn primary', hidden: last, onclick: () => move(i + 1) }, 'Next ›');
      const body = card(q, { feedback: false, given: run.given[i], onAnswer: (value) => { run.given[i] = value; map.children[i].classList.add('done'); } });
      const map = el('div', { className: 'qmap' }, ...list.map((_, k) => el('button', {
        className: (run.given[k] != null ? 'done' : '') + (k === i ? ' now' : ''), title: `Question ${k + 1}`, onclick: () => move(k),
      }, String(k + 1))));
      bar = [map, el('p', { className: 'muted qcount' }, `Question ${i + 1} of ${list.length}`), body,
        el('div', { className: 'start' },
          el('button', { className: 'btn', disabled: i === 0, onclick: () => move(i - 1) }, '‹ Back'),
          el('button', { className: 'btn', onclick: () => { run.given[i] = null; if (last) showQuestion(); else move(i + 1); } }, 'Leave blank'),
          next,
          el('span', { className: 'grow' }),
          el('button', { className: 'btn' + (last ? ' primary' : ''), onclick: results }, 'Finish the test'))];
    } else {
      const next = el('button', { className: 'btn primary', hidden: true, onclick: () => (last ? results() : move(i + 1)) }, last ? 'See my score' : 'Next ›');
      const done = () => { next.hidden = false; requestAnimationFrame(() => next.focus({ preventScroll: true })); };
      const body = card(q, { feedback: true, onAnswer: (value) => { run.given[i] = value; done(); }, onSkip: () => { run.given[i] = null; done(); } });
      bar = [el('div', { className: 'progress' }, el('div', { style: `width:${(i / list.length) * 100}%; --from:${(Math.max(0, i - 1) / list.length) * 100}%` })),
        el('p', { className: 'muted qcount' }, `Question ${i + 1} of ${list.length}`), body, el('div', { className: 'start' }, next)];
    }
    show(el('div', { className: 'pnav' }, el('a', { className: 'back', href: '#' + t.bank.id }, t.exam ? '← Stop practising' : '← Stop the test'), el('span', { className: 'grow' }), timer), ...bar, extra(t, false));
    startClock(timer, t.amc ? list.length * 3 * 60 : 0);   // 75 minutes for 25 problems
  }
  function results() {
    clearInterval(clock);
    const { t, list, given, started, shape } = run;
    const qs = list.map((n) => t.bank.make(n));
    const right = qs.map((q, i) => isRight(q.answer, given[i]));
    const correct = right.filter(Boolean).length, blank = list.filter((_, i) => given[i] == null).length;
    const score = t.amc ? correct * 6 + blank * 1.5 : correct, of = t.amc ? list.length * 6 : list.length;
    const text = t.amc ? `${fmt(score)} / ${of} (${correct} right, ${blank} blank)` : `${correct} / ${list.length}`;
    // a best score is for a full test: one of the usual length or longer (an AMC test's shapes each keep their own)
    const full = list.length >= Math.min(standard(t), t.bank.count), key = bestKey(t, shape), best = store.get(key);
    const isBest = full && (!best || score / of > best.score / best.of);
    if (isBest) store.set(key, { score, of, text, when: Date.now() });
    const mins = Math.max(1, Math.round((Date.now() - started) / 60000));
    const again = testLink(t, list.length, shape);
    // what to work on: the topics missed or left blank, in the learning path's order, each a link to its lesson; and with
    // units, how each one went
    const order = t.learn ? sequence(t) : [], lessonLink = (name) => `#${t.bank.id}/learn/${order.indexOf(name)}`;
    const missed = [...new Set(qs.filter((_, i) => !right[i]).map((q) => q.topic))].filter((n) => order.includes(n)).sort((a, b) => order.indexOf(a) - order.indexOf(b));
    const tally = (t.learn?.path ? pathOf(t) : []).map((u) => {
      const mine = qs.map((q, i) => i).filter((i) => u.topics.includes(qs[i].topic));
      return mine.length ? `${u.unit} ${mine.filter((i) => right[i]).length} of ${mine.length}` : null;
    }).filter(Boolean);
    run = null;
    // (the home page's assistant offers to go over what you missed)
    if (saving() && list.length >= 5) store.set(`${t.bank.id}.lastRun`, { name: t.name, short: `${fmt(score)} of ${of}`, text, missed: missed.slice(0, 8), at: Date.now() });
    window.scrollTo(0, 0);
    show(
      el('a', { className: 'back', href: '#' + t.bank.id }, '← ' + t.name),
      el('h2', { className: 'tname' }, 'Your score'),
      el('p', { className: 'score' }, text),
      el('p', { className: 'muted' }, (t.amc && t.order ? `${called(t, SHAPES[shape].name)}. ` : '') + (isBest ? 'A new best! ' : best ? `Your best: ${best.text}. ` : '')
        + (full ? '' : `Only ${t.exam ? 'practice sets' : 'tests'} of ${standard(t)} or more questions count for your best. `) + `It took about ${plural(mins, 'minute')}.`),
      tally.length > 1 ? el('p', { className: 'muted tally' }, `Right by unit: ${tally.join(' · ')}`) : null,
      el('div', { className: 'start' }, el('button', { className: 'btn primary', onclick: () => go(again) }, t.exam ? 'Practise again' : 'Take another test'), el('a', { className: 'btn', href: `#${t.bank.id}/learn` }, 'Learn'), el('a', { className: 'btn', href: '#' }, 'All tests')),
      missed.length ? el('div', { className: 'work-on' }, el('h3', {}, 'What to work on'),
        el('p', { className: 'muted' }, `The ${missed.length === 1 ? 'topic' : 'topics'} you missed or left blank. Each opens its lesson, a worked example and practice.`),
        el('ul', { className: 'kinds' }, ...missed.map((n) => el('li', {}, el('a', { href: lessonLink(n) }, n))))) : null,
      el('h3', {}, 'Review'),
      el('div', { className: 'review stagger' }, ...qs.map((q, i) => {
        const g = given[i];
        const d = el('details', { className: 'rv ' + (right[i] ? 'good' : g == null ? 'blank' : 'bad') });
        d.append(el('summary', {}, el('span', { className: 'mark' }, right[i] ? '✓' : g == null ? '–' : '✗'), `${i + 1}. ${q.topic}`, el('span', { className: 'muted' }, ` · variant ${q.n} · you: ${yours(q.answer, g)}`)));
        d.append(html('p', 'qtext', q.text));
        if (q.figure) d.append(html('div', 'fig', q.figure));
        if (q.clues) d.append(el('ol', { className: 'clues' }, ...q.clues.map((c) => html('li', '', c))));
        d.append(html('p', 'answer-line', `Answer: <b>${shown(q.answer)}</b>`), html('div', 'sol', q.solution));
        if (!right[i] && order.includes(q.topic)) d.append(el('p', { className: 'learn-link' }, el('a', { href: lessonLink(q.topic) }, `Learn ${q.topic} ›`)));
        return d;
      })));
  }

  // start once everything above is set up (a link straight to a test or a variant opens it)
  addEventListener('hashchange', () => swap(route));
  route();
}
