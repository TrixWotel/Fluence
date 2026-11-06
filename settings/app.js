// Settings: everything settings.js holds, changed here, each change showing straight away. What's changed stays in this
// browser (look.js keeps it as fluentio.look, over settings.js), and "Copy as settings.js" turns all of it into a new
// settings.js to paste on GitHub for every device. Also here: the keys, and a backup of everything Fluence keeps in
// this browser (your data, code and notes, these settings, learning progress and best scores), and how saving your
// progress to the repo you're connected to is going (kit/progress.js does the saving).
import * as github from '../workspace/sync.js?v=4';
import * as progress from '../kit/progress.js';

const f = window.fluentio;
const { el, svg } = f;
const $ = (id) => document.getElementById(id);
const panels = $('panels');
let s = structuredClone(f.settings);                // what's being changed
const clone = (v) => structuredClone(v);

// ---------- saving, with a word at the bottom of the screen ----------
let queued = 0, toastTimer = 0;
function toast(text) {
  const t = $('toast');
  t.textContent = text;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1600);
}
// (once a frame at most, so dragging through colors stays smooth, and straight away when the page is hidden or going,
// as a hidden page has no frames)
const saveNow = () => {
  cancelAnimationFrame(queued);
  queued = 0;
  toast(f.save(s) ? 'Saved in this browser' : "Couldn't save: this browser's storage is full or turned off");
};
function save() {
  if (document.hidden) saveNow();
  else if (!queued) queued = requestAnimationFrame(saveNow);
}
const waiting = new Map();                          // typing that hasn't been saved yet
const flush = () => { for (const go of waiting.values()) go(); waiting.clear(); if (queued) saveNow(); };
addEventListener('pagehide', flush);
document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });

// ---------- pieces ----------
const set = (title, note, ...controls) => el('div', { className: 'set' }, el('div', { className: 'what' }, el('b', {}, title), note ? el('small', {}, note) : null), ...controls);
function seg(options, value, pick, label) {
  const box = el('div', { className: 'seg', role: 'group', 'aria-label': label });
  for (const [v, name, style] of options) {
    const b = el('button', { type: 'button', className: v === value ? 'on' : '', 'aria-pressed': String(v === value), onclick: () => {
      for (const x of box.children) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); }
      pick(v);
    } }, name);
    if (style) b.style.fontFamily = style;
    box.append(b);
  }
  return box;
}
const toggle = (checked, pick, label) => el('input', { type: 'checkbox', className: 'switch', checked, 'aria-label': label, onchange: (e) => pick(e.target.checked) });
function text(value, pick, label, attrs = {}) {
  let wait = 0;
  const box = el(attrs.long ? 'textarea' : 'input', { className: 'input text-in', value, 'aria-label': label, spellcheck: attrs.long || false, rows: attrs.long ? 3 : null,
    oninput: () => {
      clearTimeout(wait);
      const go = () => { clearTimeout(wait); waiting.delete(box); pick(box.value); };
      waiting.set(box, go);
      wait = setTimeout(go, 250);
    } });
  return box;
}
// a color: the picker (which only knows #rrggbb), and the color as typed, which can be any CSS color
const paint = document.createElement('canvas').getContext('2d');
const hex = (c) => { paint.fillStyle = '#000000'; paint.fillStyle = c; return /^#[0-9a-f]{6}$/i.test(paint.fillStyle) ? paint.fillStyle : '#000000'; };
function colorInput(value, pick, label) {
  const typed = el('input', { className: 'input', value, spellcheck: false, 'aria-label': `${label}, as a CSS color`,
    oninput: () => {
      const ok = CSS.supports('color', typed.value.trim());
      typed.classList.toggle('bad', !ok);
      if (ok) { picker.value = hex(typed.value.trim()); pick(typed.value.trim()); }
    } });
  const picker = el('input', { type: 'color', value: hex(value), 'aria-label': label, oninput: () => { typed.value = picker.value; typed.classList.remove('bad'); pick(picker.value); } });
  return el('div', { className: 'color' }, picker, typed);
}
function confirmIn(where, question, yes, onYes) {
  where.querySelector('.confirm')?.remove();
  const box = el('div', { className: 'confirm' }, el('span', {}, question), el('span', { className: 'grow' }),
    el('button', { type: 'button', className: 'btn danger', onclick: () => { box.remove(); onYes(); } }, yes),
    el('button', { type: 'button', className: 'btn', onclick: () => box.remove() }, 'Cancel'));
  where.append(box);
}
function download(name, body, type) {
  const a = el('a', { href: URL.createObjectURL(new Blob([body], { type })), download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// ---------- the panels ----------
const PRESETS = [
  ['Fluence', ['#2f6fed', '#9b5cf6'], ['#6c9bff', '#b48cff']],
  ['Ocean', ['#0e7490', '#2563eb'], ['#22d3ee', '#60a5fa']],
  ['Forest', ['#15803d', '#0d9488'], ['#4ade80', '#2dd4bf']],
  ['Sunset', ['#ea580c', '#db2777'], ['#fb923c', '#f472b6']],
  ['Rose', ['#e11d48', '#c026d3'], ['#fb7185', '#e879f9']],
  ['Grape', ['#7c3aed', '#c026d3'], ['#a78bfa', '#e879f9']],
  ['Mono', ['#374151', '#6b7280'], ['#e5e7eb', '#9ca3af']],
];
// whole looks at once: the colors for light and dark, the style, the corners, and the drifting colors on or off
const THEMES = [
  { name: 'Fluence', note: 'Soft glows, gradients and drifting colors', look: () => ({ style: 'glow', corners: f.DEFAULTS.corners, font: 'system', floatingColors: true, colors: clone(f.DEFAULTS.colors) }) },
  // (Fluent's own Pure Black and Light themes, from its style.css and themes.js)
  { name: 'Fluent', note: 'Your browser’s look: pure black, grays and white', look: () => ({ style: 'flat', corners: 8, font: 'system', floatingColors: false, colors: {
    light: { accent: '#1d1d1f', accent2: '#515154', background: '#e9e9eb', card: '#ffffff', text: '#1d1d1f', muted: '#6e6e73', line: '#d7d7db', right: '#248a3d', wrong: '#d70015', second: '#b25000' },
    dark: { accent: '#e8e8e8', accent2: '#a9a9a9', background: '#000000', card: '#0b0b0b', text: '#cccccc', muted: '#8b8b8b', line: '#1f1f1f', right: '#30d158', wrong: '#f48771', second: '#cca700' },
  } }) },
  { name: 'GitHub', note: 'Flat, with borders and GitHub’s own colors', look: () => ({ style: 'flat', corners: 10, font: 'system', floatingColors: false, colors: {
    light: { accent: '#0969da', accent2: '#0550ae', background: '#f6f8fa', card: '#ffffff', text: '#1f2328', muted: '#59636e', line: '#d1d9e0', right: '#1a7f37', wrong: '#d1242f', second: '#9a6700' },
    dark: { accent: '#4493f8', accent2: '#1f6feb', background: '#0d1117', card: '#151b23', text: '#f0f6fc', muted: '#9198a1', line: '#3d444d', right: '#3fb950', wrong: '#f85149', second: '#d29922' },
  } }) },
];
const COLORS = [
  ['accent', 'Accent', 'Buttons, links and anything selected'],
  ['accent2', 'Second color', 'Gradients, and the colors drifting behind'],
  ['background', 'Background', 'Behind everything'],
  ['card', 'Cards', 'Cards, questions and panels'],
  ['text', 'Text', ''],
  ['muted', 'Quieter text', ''],
  ['line', 'Lines', 'Borders'],
  ['right', 'Right', 'Right answers'],
  ['wrong', 'Wrong', 'Wrong answers'],
  ['second', 'Graphs', 'The second line on graphs and drawings'],
];
const MAP = [['ocean', 'Ocean'], ['land', 'Land'], ['country', 'Countries'], ['border', 'Borders'], ['late', 'Found late', 'A country found after a wrong try']];
const TILES = () => ({ ...(f.spacesOn ? { workspace: 'Recent' } : {}), music: s.musicTitle, study: s.studyTitle, progress: 'Your progress', today: 'Today', question: 'Question of the day', ...(f.spacesOn ? { data: s.dataTitle } : {}), quick: 'Quick' });
const shown = () => (s.theme === 'dark' || s.theme === 'light' ? s.theme : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
let palette = shown();                              // which colors the Colors panel changes

function look() {
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  return el('section', { className: 'panel', id: 'look' }, el('h2', {}, 'Look'),
    set('Themes', 'A whole look at once: the colors for light and dark, the style, the font, the corners and the drifting colors.',
      el('div', { className: 'themes' }, THEMES.map((t) => {
        const look = t.look(), c = look.colors[palette], on = Object.keys(look).every((k) => same(s[k], look[k]));
        const b = el('button', { type: 'button', className: `theme${on ? ' on' : ''}${look.style === 'flat' ? ' flat' : ''}`, 'aria-pressed': String(on), onclick: () => { Object.assign(s, look); save(); draw(); } },
          el('span', { className: 'preview', 'aria-hidden': 'true' }, el('span', { className: 'p-side' }, el('i'), el('i'), el('i')), el('span', { className: 'p-card' }, el('i'), el('i'), el('b'))),
          el('span', { className: 'theme-name' }, t.name), el('small', {}, t.note));
        const show = { bg: c.background, card: c.card, line: c.line, text: c.text, muted: c.muted, accent: c.accent, accent2: c.accent2, r: `${Math.round(look.corners * 0.6)}px` };
        for (const [k, v] of Object.entries(show)) b.style.setProperty(`--p-${k}`, v);
        return b;
      }))),
    set('Light or dark', 'Auto follows your device’s light or dark mode.',
      seg([['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']], s.theme, (v) => { s.theme = v; palette = shown(); save(); draw(); }, 'Light or dark')),
    set('Style', 'Glow has soft shadows, glowing edges and gradients. Flat has borders and solid colors, like GitHub.',
      seg([['glow', 'Glow'], ['flat', 'Flat']], s.style === 'flat' ? 'flat' : 'glow', (v) => { s.style = v; save(); draw(); }, 'Style')),
    set('Accent colors', 'A ready-made accent and second color, for light and dark.',
      el('div', { className: 'swatches' }, PRESETS.map(([name, light, dark]) => {
        const on = s.colors.light.accent === light[0] && s.colors.light.accent2 === light[1] && s.colors.dark.accent === dark[0] && s.colors.dark.accent2 === dark[1];
        const b = el('button', { type: 'button', className: 'swatch' + (on ? ' on' : ''), title: name, 'aria-label': name, 'aria-pressed': String(on), onclick: () => {
          [s.colors.light.accent, s.colors.light.accent2] = light;
          [s.colors.dark.accent, s.colors.dark.accent2] = dark;
          save();
          draw();
        } });
        const pair = palette === 'dark' ? dark : light;
        b.style.setProperty('--a', pair[0]);
        b.style.setProperty('--b', pair[1]);
        return b;
      }))),
    (() => {
      const now = el('span', { className: 'logo-now' }, f.logo(s.logoColor));
      return set('Logo color', 'The icon on the browser’s tab, which changes as you pick.', now,
        colorInput(s.logoColor || '#6a6cf4', (v) => { s.logoColor = v; save(); now.replaceChildren(f.logo(v)); }, 'Logo color'),
        el('button', { type: 'button', className: 'btn', onclick: () => { s.logoColor = f.site.logoColor; save(); draw(); } }, 'Reset'));
    })(),
    set('Font', '',
      el('div', { className: 'fonts' }, seg([['system', 'System', f.FONTS.system], ['rounded', 'Rounded', f.FONTS.rounded], ['serif', 'Serif', f.FONTS.serif], ['mono', 'Mono', f.FONTS.mono]], s.font, (v) => { s.font = v; save(); }, 'Font'))),
    (() => {
      const value = el('span', { className: 'value' }, `${s.corners} px`);
      return set('Corners', 'How round cards and buttons are (0 is square).',
        el('input', { type: 'range', min: 0, max: 28, step: 1, value: s.corners, 'aria-label': 'Corners', oninput: (e) => { s.corners = +e.target.value; value.textContent = `${s.corners} px`; save(); } }), value);
    })(),
    (() => {
      const value = el('span', { className: 'value' }, `${s.textSize} px`);
      return set('Text size', 'How big the words are (16 is the usual size).',
        el('input', { type: 'range', min: 12, max: 20, step: 1, value: s.textSize, 'aria-label': 'Text size', oninput: (e) => { s.textSize = +e.target.value; value.textContent = `${s.textSize} px`; save(); } }), value);
    })());
}

function colors() {
  const editing = palette;
  const rows = (list, where) => list.map(([key, title, note]) => set(title, note || '', colorInput(where[key], (v) => { where[key] = v; save(); }, title)));
  return el('section', { className: 'panel colors', id: 'colors' }, el('h2', {}, 'Colors'),
    el('p', {}, 'Any color, for light mode and for dark mode.'),
    set('Change', editing === shown() ? 'These are the colors you’re seeing now.' : `You’re seeing the ${shown()} ones now, so these show in ${editing} mode (or with Theme set to ${editing === 'dark' ? 'Dark' : 'Light'}).`,
      seg([['light', 'Light'], ['dark', 'Dark']], editing, (v) => { palette = v; draw(); }, 'Which colors')),
    ...rows(COLORS, s.colors[editing]),
    el('details', { className: 'more' }, el('summary', {}, 'The Geography map’s colors'), ...rows(MAP, s.map[editing])),
    el('div', { className: 'set' }, el('div', { className: 'what' }, el('small', {}, `Back to the site’s ${editing} colors (from settings.js).`)),
      el('button', { type: 'button', className: 'btn', onclick: () => { s.colors[editing] = clone(f.site.colors[editing]); s.map[editing] = clone(f.site.map[editing]); save(); draw(); } }, `Reset the ${editing} colors`)));
}

function motion() {
  const value = el('span', { className: 'value' }, `${s.speed}×`);
  const each = s.animationsIn || (s.animationsIn = { data: true, code: true, notes: true });
  return el('section', { className: 'panel', id: 'motion' }, el('h2', {}, 'Motion'),
    set('Animations', 'Off stops every animation. A device set to reduce motion never gets them.', toggle(s.animations, (v) => { s.animations = v; save(); }, 'Animations')),
    !f.spacesOn ? null : set('Each space', `The animations in ${s.dataTitle}, ${s.codeTitle} and ${s.notesTitle}, each on its own. Each one’s View menu has its switch too.`,
      el('div', { className: 'pairs' }, [['data', s.dataTitle], ['code', s.codeTitle], ['notes', s.notesTitle]].map(([k, name]) => el('label', { className: 'pair' },
        toggle(each[k] !== false, (v) => { each[k] = v; save(); }, `Animations in ${name}`), name)))),
    set('Speed', '1× is normal. Higher is faster.',
      el('input', { type: 'range', min: 0.5, max: 2, step: 0.25, value: s.speed, 'aria-label': 'Speed', oninput: (e) => { s.speed = +e.target.value; value.textContent = `${s.speed}×`; save(); } }), value),
    set('Drifting colors', 'The soft colors moving slowly behind the pages.', toggle(s.floatingColors, (v) => { s.floatingColors = v; save(); }, 'Drifting colors')));
}

function home() {
  const names = TILES(), all = Object.keys(names);
  const order = [...s.home.filter((k) => all.includes(k)), ...all.filter((k) => !s.home.includes(k))];
  const place = (list) => { s.home = list.filter((k) => s.home.includes(k)); };
  const tiles = el('ul', { className: 'list' }, order.map((k, i) => el('li', { className: s.home.includes(k) ? '' : 'off' },
    toggle(s.home.includes(k), (on) => { s.home = on ? order.filter((x) => x === k || s.home.includes(x)) : s.home.filter((x) => x !== k); save(); draw(); }, `Show ${names[k]}`),
    el('span', { className: 'name' }, names[k]),
    el('button', { type: 'button', className: 'icon-btn up', title: 'Move up', 'aria-label': `Move ${names[k]} up`, disabled: i === 0, onclick: () => { [order[i - 1], order[i]] = [order[i], order[i - 1]]; place(order); save(); draw(); } }, svg('chevron')),
    el('button', { type: 'button', className: 'icon-btn', title: 'Move down', 'aria-label': `Move ${names[k]} down`, disabled: i === order.length - 1, onclick: () => { [order[i + 1], order[i]] = [order[i], order[i + 1]]; place(order); save(); draw(); } }, svg('chevron')))));
  const quick = el('ul', { className: 'list quick-list' }, s.quick.map((q, i) => el('li', { className: 'quick' },
    el('input', { className: 'input', value: q.title, 'aria-label': 'Button name', placeholder: 'Name', oninput: (e) => { q.title = e.target.value; save(); } }),
    el('input', { className: 'input link', value: q.link, 'aria-label': 'Where it goes', placeholder: f.spacesOn ? 'notes/#new/note, or a web address' : 'math/#amc10/test, or a web address', spellcheck: false, oninput: (e) => { q.link = e.target.value.trim(); save(); } }),
    el('button', { type: 'button', className: 'icon-btn', title: 'Remove', 'aria-label': `Remove ${q.title || 'this button'}`, onclick: () => { s.quick.splice(i, 1); save(); draw(); } }, svg('x')))));
  return el('section', { className: 'panel', id: 'home' }, el('h2', {}, 'Home'),
    set('Name', 'At the top of the home page and the bar, and in every tab’s title.', text(s.name, (v) => { s.name = v; save(); }, 'Name')),
    set('Line under it', '', text(s.tagline, (v) => { s.tagline = v; save(); }, 'Line under the name')),
    set('Welcome', 'A greeting on the home page, and a line that changes with the time, the date, holidays, your music and what you’ve been doing.', toggle(s.greeting, (v) => { s.greeting = v; save(); }, 'Greeting')),
    set('Layout', 'The home page fits one screen: three tiles (two on a smaller screen, one on a phone), with the rest a click away under them. Auto picks them by what you’ve been doing (the song that’s playing, the topic you learned last, today’s question) and the time of day. Classic is always your tiles, in their order.',
      seg([['auto', 'Auto'], ['classic', 'Classic'], ['study', 'Study first'], ['music', 'Music first'], ['calm', 'Calm']], s.homeLayout || 'auto', (v) => { s.homeLayout = v; save(); draw(); }, 'Home layout')),
    set('Text', 'The page stays in the middle of the window. This is where its words and buttons sit: along its left edge, in the middle, or along its right edge. Left and Right take what’s inside the tiles along too. Center leaves that on the left.',
      seg([['left', 'Left'], ['center', 'Center'], ['right', 'Right']], s.homeAlign || 'center', (v) => { s.homeAlign = v; save(); }, 'Where the home page’s text sits')),
    set('Tiles', 'Which show on the home page, and in what order.', tiles),
    daysOff(),
    set('Quick buttons', 'The Quick tile’s buttons: a name, and where each goes.', quick,
      el('button', { type: 'button', className: 'btn', onclick: () => { s.quick.push({ title: 'New button', link: f.spacesOn ? 'notes/' : 'study/' }); save(); draw(); panels.querySelector('#home .quick-list li:last-child input')?.select(); } }, svg('plus'), 'Add a button')));
}

// your days off (settings.js has the list), and the calendar link that can bring them to Fluent's Calendar: only if you add it there
function daysOff() {
  const list = s.daysOff.filter((d) => d.name && d.from);
  const day = (t) => new Date(`${t}T12:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return el('div', {},
    set('Days off', 'Your days off, with the next holidays on the Today tile.', toggle(s.showDaysOff, (v) => { s.showDaysOff = v; save(); }, 'Days off on the Today tile')),
    el('details', { className: 'more' }, el('summary', {}, 'The days off'),
      el('ul', { className: 'days-off' }, list.map((d) => el('li', {}, `${d.emoji || '🏖️'} ${d.name}`, el('small', {}, d.to && d.to !== d.from ? `${day(d.from)} to ${day(d.to)}` : day(d.from)))))),
    set('Fluent’s Calendar', 'Fluence and Fluent’s Calendar stay separate unless you connect them. To see these days off there too, add this link in Fluent’s Settings → Calendar → Other Calendars. Removing it there disconnects them.',
      el('button', { type: 'button', className: 'btn', onclick: async () => {
        try { await navigator.clipboard.writeText(f.link('days-off.ics')); toast('Copied. Now paste it in Fluent’s Settings'); } catch { toast(f.link('days-off.ics')); }
      } }, svg('copy'), 'Copy the link')));
}

function names() {
  return el('section', { className: 'panel', id: 'names' }, el('h2', {}, 'Names'),
    set('Modules', 'The subjects’ page: its name in the bar, on its page and on the home page.', text(s.studyTitle, (v) => { s.studyTitle = v; save(); }, 'Modules’ name')),
    set('Modules’ line', 'Under its name on its page.', text(s.studyIntro, (v) => { s.studyIntro = v; save(); }, 'Modules’ line', { long: true })),
    set('Station', 'Your board: its name in the bar.', text(s.stationTitle, (v) => { s.stationTitle = v; save(); }, 'Station’s name')),
    set('Music', 'Your songs: its name in the bar, on its page and on the home page.', text(s.musicTitle, (v) => { s.musicTitle = v; save(); }, 'Music’s name')),
    ...(!f.spacesOn ? [] : [set('Data', 'Your databases of docs and sheets: its name in the bar and on its page.', text(s.dataTitle, (v) => { s.dataTitle = v; save(); }, 'Data’s name')),
    set('Code', 'Your code: its name in the bar and on its page.', text(s.codeTitle, (v) => { s.codeTitle = v; save(); }, 'Code’s name')),
    set('Notes', 'Your notes: its name in the bar and on its page.', text(s.notesTitle, (v) => { s.notesTitle = v; save(); }, 'Notes’ name'))]));
}

// a key you can change: click it, then press the new one. Esc keeps the old one, Delete (or Backspace) turns it off,
// and a key another action had moves here (that one is left with none)
const ACTIONS = () => [['search', 'Search', `Pages, subjects${f.spacesOn ? ', and your data, code and notes' : ''}. / works too, when you aren’t typing.`], ['home', 'Home', ''], ['study', s.studyTitle, ''], ['station', s.stationTitle, ''], ['music', s.musicTitle, ''], ...(f.spacesOn ? [['data', s.dataTitle, ''], ['code', s.codeTitle, ''], ['notes', s.notesTitle, '']] : [])];
// (keys a browser usually keeps for itself, like ⌘T, or ⌘K in Fluent, never reach the page)
const kept = (k) => { const t = f.key.meant(k); return /^(Shift\+)?Meta\+([0-9TWNQRLKEPSFDHMYZXCVAOG,])$/.test(t) || /^Ctrl\+(Shift\+)?Tab$/.test(t); };
let recording = null;                               // how to stop the key being recorded
function recorder(name, title) {
  const b = el('button', { type: 'button', className: 'key-rec', 'aria-label': `${title}'s key` });
  const show = () => { const k = f.key.shown(s.keys[name]); b.classList.remove('rec'); b.replaceChildren(k ? el('kbd', {}, k) : el('span', { className: 'muted' }, 'Off')); };
  const stop = () => { removeEventListener('keydown', listen, true); b.removeEventListener('blur', stop); if (recording === stop) recording = null; show(); };
  const listen = (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    if (e.key === 'Escape') return stop();
    if (e.key === 'Backspace' || e.key === 'Delete') { s.keys[name] = ''; stop(); save(); draw(); return; }
    const k = f.key.pressed(e);
    if (!k) return;                                 // (Shift or another modifier on its own: wait for the key)
    const had = ACTIONS().find(([other]) => other !== name && f.key.meant(s.keys[other]) === f.key.meant(k));
    if (had) s.keys[had[0]] = '';
    s.keys[name] = k;
    stop();
    save();
    if (had) toast(`${f.key.shown(k)} was ${had[1]}’s, so ${had[1]} has no key now`);
    draw();
  };
  b.onclick = () => {
    if (recording === stop) return stop();
    recording?.();
    recording = stop;
    b.classList.add('rec');
    b.replaceChildren(el('span', {}, 'Press a key…'));
    addEventListener('keydown', listen, true);
    b.addEventListener('blur', stop);
  };
  show();
  return b;
}
function keys() {
  const row = (k, what) => [el('dt', {}, k.map((x) => el('kbd', {}, x))), el('dd', {}, what)];
  return el('section', { className: 'panel', id: 'keys' }, el('h2', {}, 'Keys'),
    el('p', {}, 'Click a key, then press the new one, with Ctrl, Alt, Shift or ⌘ if you like. Esc keeps it as it was, and Delete turns it off.'),
    ...ACTIONS().map(([name, title, note]) => set(title, [note, kept(s.keys[name]) ? `Your browser may keep ${f.key.shown(s.keys[name])} for itself, so it might not reach the page.` : ''].filter(Boolean).join(' '), recorder(name, title))),
    el('div', { className: 'set' }, el('div', { className: 'what' }, el('small', {}, 'Back to the keys in settings.js.')),
      el('button', { type: 'button', className: 'btn', onclick: () => { s.keys = clone(f.site.keys); save(); draw(); } }, 'Reset the keys')),
    el('dl', { className: 'keys' },
      row(['↑', '↓', 'Enter'], 'Pick in Search, and open it'),
      row(['Esc'], 'Close Search, or the details pane'),
      row(['Enter'], 'In a sheet: the cell below (a new row at the end)'),
      row(['Tab'], 'In code: spaces in')));
}

// where your learning progress is saved, and how the last save went
function progressSaved() {
  const line = el('small', {}), box = el('div', { className: 'set' });
  const said = (t) => { const m = Math.round((Date.now() - t) / 60000); return !t ? 'Saving…' : m < 1 ? 'Saved just now' : m < 60 ? `Saved ${m} min ago` : m < 1440 ? `Saved ${Math.round(m / 60)} h ago` : `Saved ${Math.round(m / 1440)} d ago`; };
  const paint = () => { const st = progress.status(); line.textContent = st.error || said(st.saved); line.classList.toggle('bad', !!st.error); };
  const st = progress.status();
  if (!st.repo) return el('p', {}, 'Your learning progress is in this browser only. ', el('a', { href: f.link('music/#settings') }, 'Connect your Database in Music'), ' and it’s saved there too, so any browser you connect carries on from the same place.');
  paint();
  progress.events.addEventListener('change', paint);
  box.append(el('div', { className: 'what' }, el('b', {}, `Your progress is saved in ${st.repo}`), el('small', {}, `On its ${st.branch} branch, by itself, so any browser you connect carries on from the same place: topics learned, best scores, tests under way, days in a row.`), line),
    el('div', { className: 'row' }, el('button', { type: 'button', className: 'btn', onclick: () => { line.textContent = 'Saving…'; progress.saveNow().then(paint); } }, 'Save now'),
      el('a', { className: 'btn', href: `https://github.com/${st.repo}/tree/${st.branch}`, target: '_blank', rel: 'noopener' }, 'Open on GitHub')));
  return box;
}

function data() {
  const items = f.workspace.items(), count = (kind) => items.filter((x) => x.kind === kind).length;
  const folders = f.workspace.folders?.() || [], bases = folders.filter((x) => x.tab === 'database').length;
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const kept = [folders.length - bases ? plural(folders.length - bases, 'folder') : '', bases ? plural(bases, 'database') : ''].filter(Boolean).join(' and ');
  const ours = () => Object.keys(localStorage).filter((k) => k.startsWith('fluentio.'));
  const file = el('input', { type: 'file', accept: '.json,application/json', hidden: true, onchange: async () => {
    const chosen = file.files[0];
    file.value = '';
    let backup = null;
    try { backup = JSON.parse(await chosen.text()); } catch {}
    if (!backup || !['Fluence', 'Fluentio'].includes(backup.app) || !backup.data || typeof backup.data !== 'object') { toast('That isn’t a Fluence backup'); return; }
    const made = backup.made ? new Date(backup.made).toLocaleString() : 'earlier';
    confirmIn(panel, `Restore the backup from ${made}? It replaces your ${f.spacesOn ? 'data, code, notes, ' : ''}settings and progress in this browser${github.connected() ? `, and in ${github.repo()} on GitHub` : ''}.`, 'Restore', () => {
      for (const k of ours()) localStorage.removeItem(k);
      for (const [k, v] of Object.entries(backup.data)) if (k.startsWith('fluentio.')) f.write(k, v);
      location.reload();
    });
  } });
  const panel = el('section', { className: 'panel', id: 'data' }, el('h2', {}, 'Your data'),
    progressSaved(),
    !f.spacesOn ? el('p', {}, `These settings stay in this browser${progress.status().repo ? '' : ', with your learning progress'}. Clearing the browser’s site data deletes them, so download a backup now and then.`) :
    el('p', {}, `${github.connected() ? `In this browser and in ${github.repo()} on GitHub` : 'In this browser only'}: ${plural(count('note'), 'note')}, ${plural(count('doc'), 'doc')}, ${plural(count('table'), 'sheet')} and ${plural(count('code'), 'code file')}${kept ? ` in ${kept}` : ''}, these settings, and your learning progress. Clearing the browser’s site data deletes them, so download a backup now and then.`),
    el('div', { className: 'set' }, el('div', { className: 'row' },
      el('button', { type: 'button', className: 'btn primary', onclick: () => {
        const all = Object.fromEntries(ours().map((k) => [k, f.read(k)]));
        download(`fluence-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({ app: 'Fluence', v: 1, made: new Date().toISOString(), data: all }, null, 2), 'application/json');
        toast('Backup downloaded');
      } }, svg('download'), 'Download a backup'),
      el('button', { type: 'button', className: 'btn', onclick: () => file.click() }, svg('upload'), 'Restore a backup'),
      !f.spacesOn ? null : el('button', { type: 'button', className: 'btn', onclick: () => confirmIn(panel, `Delete everything in ${s.dataTitle}, ${s.codeTitle} and ${s.notesTitle}?${github.connected() ? ` It goes from ${github.repo()} on GitHub too (the repo’s history keeps it).` : ''} Download a backup first if you might want it back.`, 'Delete it all', () => {
        f.workspace.save([]);
        f.write('fluentio.workspace.folders', null);
        toast(`${s.dataTitle}, ${s.codeTitle} and ${s.notesTitle} are empty`);
        github.run();
        draw();
      }) }, svg('trash'), `Empty ${s.dataTitle}, ${s.codeTitle} and ${s.notesTitle}`),
      file)));
  return panel;
}

// Data, Code and Notes saved to a private GitHub repo too (workspace/sync.js does the saving): connecting it (the repo, a
// token that can only reach that repo, and how to make both), how the last sync went, and Sync now, Open and Disconnect
const syncLine = () => {
  const st = github.status();
  if (st.status === 'syncing') return 'Saving…';
  if (st.status === 'error') return `Not saved: ${st.error}`;
  return st.at ? `Saved ${new Date(st.at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}.` : 'Not saved yet.';
};
github.listen(() => { const n = $('github-status'); if (n) { n.textContent = syncLine(); n.classList.toggle('bad', github.status().status === 'error'); } });
function gitHub() {
  const panel = el('section', { className: 'panel', id: 'github' }, el('h2', {}, 'GitHub'));
  const spaces = `${s.dataTitle}, ${s.codeTitle} and ${s.notesTitle}`;
  if (github.connected()) {
    const st = github.status();
    panel.append(el('p', {}, `${spaces} save to ${github.repo()} on GitHub too: a few seconds after each change, and whenever one of them opens.`),
      el('div', { className: 'set' }, el('div', { className: 'what' }, el('b', {}, github.repo()), el('small', { id: 'github-status', className: st.status === 'error' ? 'bad' : '' }, syncLine())),
        el('div', { className: 'row' },
          el('button', { type: 'button', className: 'btn primary', onclick: () => github.run() }, svg('cloud'), 'Sync now'),
          el('a', { className: 'btn', href: `https://github.com/${github.repo()}`, target: '_blank', rel: 'noopener' }, svg('external'), 'Open on GitHub'),
          el('button', { type: 'button', className: 'btn', onclick: () => confirmIn(panel, `Stop saving to ${github.repo()}? This browser forgets the token. Your things stay here and on GitHub.`, 'Disconnect', () => {
            github.disconnect();
            toast('Disconnected from GitHub');
            draw();
          }) }, 'Disconnect'))));
    return panel;
  }
  const name = el('input', { className: 'input text-in', value: `TrixWotel/Database`, spellcheck: false, autocomplete: 'off', 'aria-label': 'Repository', placeholder: 'owner/name' });
  const token = el('input', { className: 'input text-in', type: 'password', spellcheck: false, autocomplete: 'off', 'aria-label': 'Token', placeholder: 'github_pat_…' });
  const said = el('p', { className: 'hint', role: 'status' });
  const go = el('button', { type: 'button', className: 'btn primary', onclick: async () => {
    go.disabled = true;
    said.className = 'hint';
    said.textContent = 'Connecting…';
    try {
      await github.connect(name.value, token.value, window.FLUENTIO_GITHUB_API);
      toast(`Connected to ${github.repo()}`);
      draw();
    } catch (e) {
      said.className = 'hint bad';
      said.textContent = e.message;
      go.disabled = false;
    }
  } }, svg('cloud'), 'Connect');
  const link = (href, text) => el('a', { href, target: '_blank', rel: 'noopener' }, text);
  panel.append(el('p', {}, `Keep ${spaces} in a private GitHub repo too, as files you can open there, and see the same things in every browser and Fluent workspace you connect to it.`),
    set('Repository', 'A private repo, written as owner/name.', name),
    set('Token', 'A fine-grained token that can only read and write that repo.', token),
    el('details', { className: 'more' }, el('summary', {}, 'How to make the repo and the token'),
      el('ol', { className: 'steps' },
        el('li', {}, link('https://github.com/new', 'Make a new repository'), ' named Database, and set it to Private.'),
        el('li', {}, link('https://github.com/settings/personal-access-tokens/new', 'Make a fine-grained token'), '. Under Repository access, pick Only select repositories, then Database.'),
        el('li', {}, 'Under Permissions, set Contents to Read and write.'),
        el('li', {}, 'Press Generate token, copy it, and paste it above.'))),
    el('div', { className: 'set' }, el('div', { className: 'what' }, el('small', {}, 'The token stays in this browser, never in a backup. Your other sites on trixwotel.github.io can read this browser’s storage too, so give the token only that one repo.')), go),
    said);
  return panel;
}

// settings.js, made from what's here, with the comments people need when they paste it
const HEADER = `// Fluence's settings: the colors, the look, the motion, and the words on the pages.
// Made by Settings on the site. To use it on every device, open settings.js on the space branch, press the pencil,
// paste this over everything, then press Commit changes.
//
// Colors can be any CSS color: '#2f6fed', 'tomato', 'rgb(47 111 237)'. Keep the quotes and the commas.
// If something here has a typo, the site keeps working with its usual look.
`;
function code(value) {
  const q = (v) => `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
  const key = (k) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : q(k));
  const deep = (v) => v && typeof v === 'object';
  const val = (v, pad, inList) => {
    if (typeof v === 'string') return q(v);
    if (!deep(v)) return String(v);
    const inner = `${pad}  `;
    if (Array.isArray(v)) {
      const one = `[${v.map((x) => val(x, inner, true)).join(', ')}]`;
      return !v.some(deep) && one.length + pad.length < 100 ? one : `[\n${v.map((x) => `${inner}${val(x, inner, true)},`).join('\n')}\n${pad}]`;
    }
    const pairs = Object.entries(v).filter(([, x]) => x !== undefined), one = `{ ${pairs.map(([k, x]) => `${key(k)}: ${val(x, inner)}`).join(', ')} }`;
    return !pairs.some(([, x]) => deep(x)) && (inList || one.length + pad.length < 110) ? one : `{\n${pairs.map(([k, x]) => `${inner}${key(k)}: ${val(x, inner)},`).join('\n')}\n${pad}}`;
  };
  return `${HEADER}\nwindow.FLUENTIO_SETTINGS = ${val(value, '')};\n`;
}
function everywhere() {
  const out = el('div');
  const panel = el('section', { className: 'panel', id: 'everywhere' }, el('h2', {}, 'Every device'),
    el('p', {}, 'What you change here stays in this browser. To use it everywhere, copy it as a new settings.js and paste that on GitHub.'),
    el('div', { className: 'set' }, el('div', { className: 'row' },
      el('button', { type: 'button', className: 'btn primary', onclick: () => {
        const area = el('textarea', { className: 'input code-out', readOnly: true, spellcheck: false, 'aria-label': 'settings.js', value: code(s) });
        out.replaceChildren(area, el('div', { className: 'row', style: 'margin-top:10px' },
          el('button', { type: 'button', className: 'btn primary', onclick: async () => {
            try { await navigator.clipboard.writeText(area.value); toast('Copied. Now paste it in settings.js'); } catch { area.select(); toast('Press ⌘C to copy it'); }
          } }, svg('copy'), 'Copy'),
          el('a', { className: 'btn', href: 'https://github.com/TrixWotel/Fluence/edit/space/settings.js', target: '_blank', rel: 'noopener' }, svg('external'), 'Open settings.js on GitHub')));
        area.focus();
        area.select();
      } }, svg('code'), 'Copy as settings.js'),
      el('button', { type: 'button', className: 'btn', onclick: () => confirmIn(panel, 'Go back to the site’s settings (settings.js) in this browser?', 'Reset', () => {
        f.reset();
        s = structuredClone(f.settings);
        palette = shown();
        toast('Back to the site’s settings');
        draw();
      }) }, 'Reset this browser’s settings'))),
    out);
  return panel;
}

// ---------- drawing it all (again after a change that moves things about, keeping your place) ----------
// (while Data, Code and Notes are off, so is the GitHub panel that saves them, and its link at the top)
if (!f.spacesOn) document.getElementById('jump-github')?.remove();
function draw() {
  const y = scrollY;
  panels.replaceChildren(...[look(), colors(), motion(), home(), names(), keys(), data(), f.spacesOn && gitHub(), everywhere()].filter(Boolean));
  scrollTo(0, y);
}
draw();
setTimeout(() => panels.classList.add('ready'), 800);
if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
