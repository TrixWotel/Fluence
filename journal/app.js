// Journal: a few lines a day. Today's page opens ready to write, with a question to start from if you want one, and lines you can
// add from what you did on the site today. Every day you've written is below it, and searchable. Saved as you type in
// fluentio.journal ({ 'YYYY-MM-DD': { text, edited } }), so it goes with your progress to your private Database repo once you've
// connected one. Links: journal/ is today, journal/#2026-11-06 is that day.
const f = window.fluentio, { el } = f;
const stage = document.getElementById('stage');
const KEY = 'fluentio.journal';
const all = () => { const v = f.read(KEY); return v && typeof v === 'object' ? v : {}; };
const keyOf = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dateOf = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const real = (k) => /^\d{4}-\d{2}-\d{2}$/.test(k) && keyOf(dateOf(k)) === k;
const named = (k, how = {}) => dateOf(k).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', ...(dateOf(k).getFullYear() !== new Date().getFullYear() ? { year: 'numeric' } : {}), ...how });
const countWords = (t) => (t.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu) || []).length;
const plural = (n, word) => `${n.toLocaleString('en-US')} ${word}${n === 1 ? '' : 's'}`;
function keep(k, text) {
  const list = all();
  if (text.trim()) list[k] = { text, edited: Date.now() }; else delete list[k];
  f.write(KEY, list);
}

// something to start from, if you want it: a different one each day, and another when you ask
const QUESTIONS = [
  'What’s one thing you understand now that you didn’t this morning?',
  'What took longer than you expected today, and why?',
  'What are you looking forward to tomorrow?',
  'What was the best part of today?',
  'What’s on your mind right now?',
  'What would you tell yourself from this morning?',
  'What did you put off today, and what would make it easier tomorrow?',
  'Who made today better, and how?',
  'What did you notice today that you usually don’t?',
  'What’s one question you still have about something you studied?',
  'What did you do today just for you?',
  'If today had a title, what would it be?',
  'What went well today, and what would you do differently?',
  'What’s something small you’re glad about today?',
  'What wore you out today, and what gave you some energy back?',
  'What’s one thing you want to remember about today?',
  'What made you laugh today?',
  'What’s a goal for this week, and the first step toward it?',
  'What surprised you today?',
  'What did you finish today, however small?',
  'What would make tomorrow a good day?',
  'What’s something you changed your mind about?',
  'Describe one moment from today in detail.',
  'What are you worried about, and what part of it can you do something about?',
];
const dayNumber = (k) => Math.floor(dateOf(k).getTime() / 86400000);

// what you did on the site today, as lines you can add
const COURSES = [['triangles', 'Triangle Angles'], ['amc10', 'AMC 10 Practice'], ['amc12', 'AMC 12 Practice'], ['heat', 'Heat Capacity'], ['kinematics', 'Kinematics'], ['motion', 'Motion in a Straight Line'], ['vectors', 'Vectors'], ['projectiles', 'Projectile Motion'], ['vocab', 'Spanish Vocabulary'], ['preterite', 'The Preterite'], ['imperfect', 'The Imperfect'], ['middleages', 'The Middle Ages'], ['wars', 'The Wars of Religion']];
function today() {
  const start = new Date().setHours(0, 0, 0, 0), on = (t) => typeof t === 'number' && t >= start, out = [];
  const last = f.last();
  if (last && on(last.at) && last.topic) out.push(`Worked on ${last.topic}${last.test ? ` in ${last.test}` : ''}`);
  for (const [id, name] of COURSES) { const run = f.read(`fluentio.${id}.lastRun`); if (run && on(run.at)) out.push(`Took a ${run.name || name} test and got ${run.short}`); }
  const question = f.read('fluentio.today');
  if (question?.day === new Date().toDateString()) out.push(question.right ? 'Got today’s question right' : 'Tried today’s question');
  const steps = f.read('fluentio.essays.learn') || {};
  for (const [title, s] of Object.entries(steps)) if (s?.learned && on(s.at)) out.push(`Finished “${title}” in How essays work`);
  for (const e of Object.values(f.read('fluentio.essays.list') || {})) if (e && on(e.edited) && (e.text || '').trim()) out.push(`Wrote ${plural(countWords(e.text), 'word')} of my essay “${e.title || 'on my own question'}”`);
  const seen = (f.read('fluentio:trail') || {}).seen || {};
  if (on(seen.station)) out.push('Drew on my whiteboard');
  if (on(seen.music)) {
    const player = f.read('fluentio.music.player') || {}, songs = (f.read('fluentio.music.library') || {}).songs || [], song = songs.find((x) => x && x.id === (player.queue || [])[player.at]);
    out.push(song ? `Listened to ${song.title}${song.artist ? ` by ${song.artist}` : ''}` : 'Listened to some music');
  }
  return [...new Set(out)].slice(0, 8);
}

// ---------- a day ----------
let leave = null;
const flush = () => leave?.();
addEventListener('pagehide', flush);
addEventListener('fluence:going', flush);
function open(k) {
  flush();
  const now = keyOf(), isToday = k === now, entry = all()[k];
  document.title = `${isToday ? 'Journal' : named(k, { weekday: undefined })} · ${f.settings.name}`;
  let asked = dayNumber(k) % QUESTIONS.length;
  const question = el('span', {}, QUESTIONS[asked]);
  const another = el('button', { type: 'button', onclick: () => { asked = (asked + 1) % QUESTIONS.length; question.textContent = QUESTIONS[asked]; } }, 'Another question');
  const text = el('textarea', { className: 'j-text', value: entry?.text || '', placeholder: isToday ? 'Start writing…' : 'Nothing written this day yet.', spellcheck: true, 'aria-label': `Your journal for ${named(k)}` });
  const words = el('span', {}), saved = el('span', {});
  const fit = () => { text.style.height = 'auto'; text.style.height = `${Math.max(text.scrollHeight, innerHeight * 0.42)}px`; };
  const count = () => { words.textContent = plural(countWords(text.value), 'word'); };
  let soon = 0;
  const save = () => { clearTimeout(soon); keep(k, text.value); saved.textContent = text.value.trim() ? 'Saved' : ''; past(k); };
  text.addEventListener('input', () => { fit(); count(); saved.textContent = ''; clearTimeout(soon); soon = setTimeout(save, 500); });
  leave = () => { if (soon) save(); };
  const lines = isToday ? today() : [];
  const used = (line) => text.value.includes(line);
  const chips = lines.length ? el('div', { className: 'j-from' }, el('h3', {}, 'From today on Fluence'),
    el('div', { className: 'j-chips' }, lines.map((line) => {
      const chip = el('button', { type: 'button', className: `j-chip${used(line) ? ' used' : ''}`, title: 'Add this line', onclick: () => {
        if (used(line)) return;
        text.value = `${text.value.replace(/\s+$/, '')}${text.value.trim() ? '\n' : ''}• ${line}\n`;
        chip.classList.add('used');
        fit(); count(); save();
        text.focus(); text.setSelectionRange(text.value.length, text.value.length);
      } }, `+ ${line}`);
      return chip;
    }))) : null;
  stage.replaceChildren(
    el('section', { className: 'j-day' },
      el('div', { className: 'j-date' }, el('h2', {}, isToday ? `Today, ${named(k, { weekday: undefined })}` : named(k)), isToday ? null : el('a', { href: '#' }, 'Back to today ›')),
      el('p', { className: 'j-ask' }, question, another),
      text,
      el('div', { className: 'j-foot' }, words, el('span', { className: 'j-grow' }), saved),
      chips),
    el('section', { className: 'j-past', id: 'past' }));
  count(); past(k);
  requestAnimationFrame(fit);
  if (matchMedia('(pointer: fine)').matches) {
    const focus = () => { text.focus({ preventScroll: true }); text.setSelectionRange(text.value.length, text.value.length); };
    if (window.frameElement && window.frameElement.id !== 'page-frame') addEventListener('fluence:shown', focus, { once: true }); else focus();
  }
}

// ---------- the days before ----------
let search = '';
function past(openKey) {
  const box = document.getElementById('past');
  if (!box) return;
  const entries = Object.entries(all()).filter(([k, e]) => real(k) && e?.text?.trim()).sort((a, b) => b[0].localeCompare(a[0]));
  const q = search.trim().toLowerCase(), shown = q ? entries.filter(([, e]) => e.text.toLowerCase().includes(q)) : entries;
  const input = el('input', { type: 'search', className: 'input j-search', placeholder: 'Search what you’ve written', value: search, 'aria-label': 'Search your journal', oninput: () => { search = input.value; const at = input.selectionStart; past(openKey); const again = document.querySelector('.j-search'); again?.focus(); again?.setSelectionRange(at, at); } });
  const months = new Map();
  for (const [k, e] of shown) {
    const m = dateOf(k).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!months.has(m)) months.set(m, []);
    months.get(m).push([k, e]);
  }
  box.replaceChildren(
    el('div', { className: 'j-past-top' }, el('h2', {}, entries.length ? `${plural(entries.length, 'day')} written` : 'Your days'), entries.length > 1 ? input : null),
    ...(entries.length ? [] : [el('p', { className: 'j-none' }, 'The days you write about will be here.')]),
    ...(entries.length && !shown.length ? [el('p', { className: 'j-none' }, `Nothing you’ve written has “${search.trim()}” in it.`)] : []),
    ...[...months].flatMap(([month, list]) => [
      el('h3', { className: 'j-month' }, month),
      el('div', { className: 'j-rows' }, list.map(([k, e]) => el('a', { className: `j-row${k === openKey ? ' on' : ''}`, href: k === keyOf() ? '#' : `#${k}` },
        el('b', {}, dateOf(k).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })),
        el('span', {}, e.text.trim().split('\n')[0].replace(/^•\s*/, '')),
        el('small', {}, plural(countWords(e.text), 'word'))))),
    ]));
}

// ---------- which day ----------
function route() {
  const k = decodeURIComponent(location.hash.slice(1));
  open(real(k) && k <= keyOf() ? k : keyOf());
  window.scrollTo(0, 0);
}
addEventListener('hashchange', route);
route();
