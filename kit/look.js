// Puts the settings on the page it's loaded in: the colors (light and dark), font, corners and motion, before the page
// is drawn. Every page loads it as a plain script in its <head>, right after settings.js. The settings are the built-in
// ones, then settings.js over them, then what the Settings page saved in this browser (fluentio.look) over those.
// It also gives the page window.fluentio: the settings (anything missing or mistyped filled in from the built-in ones),
// the site's top folder, link() for the links in the settings, your data, code and notes (kept in this browser), the
// icons, el() and svg() to build things with, and save() and reset() for the Settings page. It puts the site's name in
// the page's title, fills in any element marked data-fill="name" (or another of the settings' words), and adds the
// drifting colors behind the page.
(() => {
  const DEFAULTS = {
    name: 'Fluence', tagline: 'Web stack workspace', greeting: true, theme: 'auto',
    colors: {
      light: { accent: '#2f6fed', accent2: '#9b5cf6', background: '#f6f7f9', card: '#ffffff', text: '#1b1f24', muted: '#5b6470', line: '#e3e6ea', right: '#2da44e', wrong: '#e5534b', second: '#e8743b' },
      dark: { accent: '#6c9bff', accent2: '#b48cff', background: '#0f1115', card: '#171a21', text: '#e8eaee', muted: '#9aa3ae', line: '#262b35', right: '#3fb950', wrong: '#f85149', second: '#f0a04b' },
    },
    map: {
      light: { ocean: '#d6e6f5', land: '#e4e1da', country: '#fbf8f1', border: '#9aa4b1', late: '#d4a72c' },
      dark: { ocean: '#0c1828', land: '#23272e', country: '#4d5768', border: '#151920', late: '#d29922' },
    },
    font: 'system', corners: 14, style: 'glow', textSize: 16, animations: true, speed: 1, floatingColors: true,
    animationsIn: { data: true, code: true, notes: true },
    keys: { search: 'Ctrl+K', home: 'Ctrl+1', study: 'Ctrl+2', music: 'Ctrl+3', data: 'Ctrl+4', code: 'Ctrl+5', notes: 'Ctrl+6' },
    home: ['workspace', 'music', 'study', 'progress', 'today', 'question', 'data', 'quick'], homeLayout: 'auto',
    quick: [
      { title: 'New note', link: 'notes/#new/note' },
      { title: 'New sheet', link: 'data/#new/table' },
      { title: 'Start AMC test', link: 'math/#amc10/test' },
    ],
    dataTitle: 'Data',
    codeTitle: 'Code',
    notesTitle: 'Notes',
    musicTitle: 'Music',
    studyTitle: 'Modules',
    studyIntro: 'Pick a subject. Take a test, learn it one topic at a time, or practise any question.',
    study: [
      { emoji: '🌍', title: 'Geography', text: 'Find countries and capitals on the world map, or one continent at a time.', link: 'geography/', color: '#1f9d74' },
      { emoji: '📐', title: 'Math', text: 'Triangle angles, and AMC 10 practice in 157 topics, from the first problems of a test to the hardest.', link: 'math/', color: '#2f6fed' },
      { emoji: '🧪', title: 'Science', text: 'Heat and energy: tests like the ones in class, and Q = mcΔT practice.', link: 'science/', color: '#8b5cf6' },
      { emoji: '🚀', title: 'Physics', text: 'Kinematics, motion in a straight line, vectors and projectiles: tests like the ones in class, and practice.', link: 'physics/', color: '#e8743b' },
      { emoji: '🇪🇸', title: 'Spanish', text: '1,100 words in 25 themes, and the preterite and the imperfect.', link: 'spanish/', color: '#e5484d' },
      { emoji: '🏰', title: 'History', text: 'The Middle Ages, from the fall of Rome to the printing press: people, dates and big ideas.', link: 'history/', color: '#b7791f' },
    ],
  };
  const FONTS = {
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    rounded: 'ui-rounded, "SF Pro Rounded", "Nunito", system-ui, sans-serif',
    serif: 'ui-serif, "New York", Georgia, "Times New Roman", serif',
    mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
  };

  // settings over others: an object merges key by key, a list is replaced by one of the same kind of thing, and
  // anything else must be the same kind to replace one (so a typo falls back to what was there)
  const plain = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
  const merge = (base, over) => {
    if (plain(base)) return Object.fromEntries(Object.keys(base).map((k) => [k, plain(over) && k in over ? merge(base[k], over[k]) : base[k]]));
    if (Array.isArray(base)) {
      if (!Array.isArray(over)) return base;
      const kept = over.filter((x) => (plain(base[0]) ? plain(x) : typeof x === typeof base[0]));
      return kept.length || !over.length ? kept : base;
    }
    return over !== undefined && typeof over === typeof base ? over : base;
  };
  // what's different between two settings, object by object (undefined when nothing is)
  const diff = (base, next) => {
    if (plain(base) && plain(next)) {
      const out = {};
      for (const k of Object.keys(base)) if (k in next) { const d = diff(base[k], next[k]); if (d !== undefined) out[k] = d; }
      return Object.keys(out).length ? out : undefined;
    }
    return JSON.stringify(base) === JSON.stringify(next) ? undefined : next;
  };
  const read = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
  const write = (key, value) => { try { if (value == null) localStorage.removeItem(key); else localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };

  const given = window.FLUENTIO_SETTINGS;
  const site = merge(DEFAULTS, plain(given) ? given : {});        // the built-in settings with settings.js over them
  const mine = () => merge(site, read('fluentio.look') || {});    // and this browser's own, from the Settings page
  let s = mine();
  const color = (v, fallback) => (typeof v === 'string' && window.CSS && CSS.supports('color', v) ? v : fallback);
  // whether a color is light (so words on it should be black): its luminance, read back from a canvas as #rrggbb
  const paint = document.createElement('canvas').getContext('2d');
  const light = (c) => {
    if (!paint) return false;
    paint.fillStyle = '#000000';
    paint.fillStyle = c;
    const m = /^#(..)(..)(..)$/.exec(paint.fillStyle);
    if (!m) return false;
    const [r, g, b] = m.slice(1).map((h) => parseInt(h, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45;
  };
  const clamp = (v, lo, hi, fallback) => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : fallback);

  // the custom properties every page's styles use
  const palette = (mode) => {
    const c = s.colors[mode] || {}, d = DEFAULTS.colors[mode], m = s.map[mode] || {}, dm = DEFAULTS.map[mode];
    const pick = (k) => color(c[k], d[k]), mp = (k) => color(m[k], dm[k]);
    return [
      `color-scheme: ${mode}`, `--accent: ${pick('accent')}`, `--on-accent: ${light(pick('accent')) ? '#000' : '#fff'}`, `--accent-2: ${pick('accent2')}`, `--bg: ${pick('background')}`,
      `--card: ${pick('card')}`, `--text: ${pick('text')}`, `--muted: ${pick('muted')}`, `--line: ${pick('line')}`,
      `--good: ${pick('right')}`, `--bad: ${pick('wrong')}`, `--plot2: ${pick('second')}`, `--sky: ${mode === 'dark' ? 0.34 : 0.5}`,
      `--ocean: ${mp('ocean')}`, `--land: ${mp('land')}`, `--country: ${mp('country')}`, `--border: ${mp('border')}`, `--late: ${mp('late')}`,
    ].join('; ');
  };
  const css = () => {
    const font = typeof s.font === 'string' && s.font.trim() ? FONTS[s.font.trim()] || s.font : FONTS.system;
    const look = `--font: ${font.replace(/[;{}]/g, '')}; --radius: ${clamp(s.corners, 0, 40, 14)}px; --speed: ${clamp(s.speed, 0.25, 4, 1)}; --text-size: ${clamp(s.textSize, 12, 20, 16)}px`;
    return [
      s.theme === 'dark' ? `html:root { ${palette('dark')}; ${look} }`
        : s.theme === 'light' ? `html:root { ${palette('light')}; ${look} }`
          : `html:root { ${palette('light')}; ${look} } @media (prefers-color-scheme: dark) { html:root { ${palette('dark')} } }`,
      // moving between pages: the old one fades out as the new one rises in (browsers that can't, just switch)
      s.animations !== false ? '@media (prefers-reduced-motion: no-preference) { @view-transition { navigation: auto; } }' : '',
    ].join('\n');
  };
  const style = document.createElement('style');
  style.id = 'fluentio-settings';
  document.head.append(style);
  const apply = () => {
    style.textContent = css();
    document.documentElement.classList.toggle('no-motion', s.animations === false);
    document.documentElement.classList.toggle('flat', s.style === 'flat');
  };
  apply();
  // (each page's <title>, which comes before this script, ends with the built-in name)
  if (s.name !== DEFAULTS.name) document.title = document.title.replace(/\bFluence$/, () => s.name);

  // the words marked data-fill, and the drifting colors behind everything (each starts where the clock says it is, so
  // they carry on from one page to the next)
  const fill = () => { for (const n of document.querySelectorAll('[data-fill]')) if (typeof s[n.dataset.fill] === 'string') n.textContent = s[n.dataset.fill]; };
  const sky = () => {
    if (!document.body) return;
    const want = s.floatingColors !== false && document.body.dataset.sky !== 'off', have = document.querySelector('body > .sky');
    if (!want) return have?.remove();
    if (have) return;
    const el = document.createElement('div');
    el.className = 'sky';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<i></i><i></i><i></i>';
    document.body.prepend(el);
    for (const i of el.children) {
      const lap = 2 * parseFloat(getComputedStyle(i).animationDuration);   // there and back
      if (lap > 0) i.style.animationDelay = `${-((Date.now() / 1000) % lap)}s`;
    }
  };
  const changed = () => { window.fluentio.settings = s; apply(); fill(); sky(); dispatchEvent(new CustomEvent('fluentio:settings')); };

  // building things: el('a', { className, href, 'aria-label': … }, …children), and an icon as an element
  const el = (tag, props = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (/^(aria-|data-|role$|for$)/.test(k)) n.setAttribute(k, v === true ? '' : v); else n[k] = v;
    }
    for (const k of kids.flat()) if (k != null && k !== false) n.append(k.nodeType ? k : document.createTextNode(k));
    return n;
  };
  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    settings: '<path d="M4 6h8M16 6h4M4 12h2M10 12h10M4 18h11M19 18h1"/><circle cx="14" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    home: '<path d="M4 11.5 12 5l8 6.5"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/>',
    study: '<path d="M22 9 12 5 2 9l10 4z"/><path d="M6 10.6V16c0 1.66 2.69 3 6 3s6-1.34 6-3v-5.4"/>',
    workspace: '<path d="M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M9 4v16M12 8h4M12 12h4"/>',
    note: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    doc: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/>',
    table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/>',
    code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    database: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6"/><path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"/>',
    move: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 13h6M12.5 10.5 15 13l-2.5 2.5"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    cloud: '<path d="M7 18a4.5 4.5 0 0 1-.5-8.97A6 6 0 0 1 18 9.5a4.25 4.25 0 0 1-.5 8.5z"/>',
    bolt: '<path d="M13 3 4 14h7l-1 7 9-11h-7z"/>',
    chart: '<path d="M4 20h16"/><path d="M7 16v-5M12 16V6M17 16v-8"/>',
    calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>',
    play: '<path d="M7 4v16l13-8z"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    upload: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>',
  };
  const icon = (name) => `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  const svg = (name) => { const t = document.createElement('template'); t.innerHTML = icon(name); return t.content.firstChild; };

  // keys written like 'Ctrl+Shift+K', matched by where the key sits on the keyboard (so Alt with a number, which types a
  // symbol on a Mac, still counts as that number). Windows and Linux browsers keep Ctrl with a number for their tabs,
  // so there Ctrl+1 is taken as Alt+1
  const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const MODS = ['Ctrl', 'Alt', 'Shift', 'Meta'];
  const ALIAS = { ctrl: 'Ctrl', control: 'Ctrl', '⌃': 'Ctrl', alt: 'Alt', option: 'Alt', opt: 'Alt', '⌥': 'Alt', shift: 'Shift', '⇧': 'Shift', meta: 'Meta', cmd: 'Meta', command: 'Meta', '⌘': 'Meta', win: 'Meta' };
  const NAMED = { Slash: '/', Backslash: '\\', Comma: ',', Period: '.', Semicolon: ';', Quote: "'", BracketLeft: '[', BracketRight: ']', Minus: '-', Equal: '=', Backquote: '`', Space: 'Space', Enter: 'Enter', ArrowUp: 'Up', ArrowDown: 'Down', ArrowLeft: 'Left', ArrowRight: 'Right' };
  const keyName = (code) => (/^Key[A-Z]$/.test(code) ? code.slice(3) : /^(Digit|Numpad)\d$/.test(code) ? code.slice(-1) : /^F\d{1,2}$/.test(code) ? code : NAMED[code] || '');
  const tidy = (text) => {                          // 'ctrl + k' and '⌃K' are 'Ctrl+K', and anything it can't read is '' (no key)
    const parts = String(text || '').replace(/^\s*([⌃⌥⇧⌘]+)(?=.)/, (m, marks) => `${[...marks].join('+')}+`).split('+').map((p) => p.trim()).filter(Boolean), key = parts.pop();
    if (!key) return '';
    const mods = parts.map((p) => ALIAS[p.toLowerCase()] || ALIAS[p]);
    if (mods.some((m) => !m)) return '';
    return [...MODS.filter((m) => mods.includes(m)), key.length === 1 ? key.toUpperCase() : key[0].toUpperCase() + key.slice(1)].join('+');
  };
  const meant = (text) => { const t = tidy(text); return !mac && /^Ctrl\+\d$/.test(t) ? t.replace('Ctrl', 'Alt') : t; };
  const SYMBOL = { Ctrl: '⌃', Alt: '⌥', Shift: '⇧', Meta: '⌘' }, ARROW = { Up: '↑', Down: '↓', Left: '←', Right: '→' };
  const key = {
    mac, tidy, meant,
    // what was pressed, written the same way ('' for a key on its own like Shift)
    pressed: (e) => { const k = keyName(e.code); return k ? [e.ctrlKey && 'Ctrl', e.altKey && 'Alt', e.shiftKey && 'Shift', e.metaKey && 'Meta', k].filter(Boolean).join('+') : ''; },
    // how a key reads: ⌃K on a Mac, Ctrl+K elsewhere
    shown: (text) => {
      const t = meant(text);
      if (!t) return '';
      const parts = t.split('+'), k = parts.pop();
      return mac ? parts.map((m) => SYMBOL[m]).join('') + (ARROW[k] || k) : [...parts, ARROW[k] || k].join('+');
    },
  };

  // the site's top folder (this file is in its kit folder), for the links in the settings
  const here = document.currentScript && document.currentScript.src;
  const root = here ? new URL('..', here).href : new URL('./', location.href).href;
  // Data, Code and Notes are switched off: their code stays here, but they're nowhere on the site, their pages go to the
  // home page, and neither settings.js nor Settings can turn them back on (only true here can)
  const SPACES_ON = false;
  if (!SPACES_ON && /^(data|code|notes|workspace)\//.test(decodeURI(location.href).slice(root.length))) location.replace(root);
  // where each kind of thing (and of folder) lives: notes in notes/, docs and sheets in data/, code files in code/
  const SPACES = { note: 'notes', doc: 'data', table: 'data', code: 'code', notes: 'notes', database: 'data' };
  const spaceOf = (x) => { const k = x.kind ?? x.tab; return typeof k === 'string' && Object.hasOwn(SPACES, k) ? SPACES[k] : 'notes'; };
  window.fluentio = {
    settings: s, site, DEFAULTS, FONTS, root, read, write, el, svg, icon, key, spacesOn: SPACES_ON,
    link: (href) => new URL(String(href || ''), root).href,
    moving: () => s.animations !== false && !matchMedia('(prefers-reduced-motion: reduce)').matches,
    // your docs and sheets (Data), code (Code) and notes (Notes), and their folders: kept in this browser only (Settings
    // can download a backup). Each thing and folder has its folder's id as parent ('' for the top of its space)
    workspace: {
      items: () => { const w = read('fluentio.workspace'); return plain(w) && Array.isArray(w.items) ? w.items.filter((x) => plain(x) && typeof x.id === 'string') : []; },
      save: (items) => write('fluentio.workspace', { v: 1, items }),
      folders: () => { const w = read('fluentio.workspace.folders'); return plain(w) && Array.isArray(w.folders) ? w.folders.filter((x) => plain(x) && typeof x.id === 'string') : []; },
      // the space a thing or folder is in (its folder on the site), and a link to it there
      space: spaceOf,
      link: (x) => new URL(`${spaceOf(x)}/#${x.kind ? `${x.kind}/${x.id}` : `folder/${x.id}`}`, root).href,
    },
    // the topic Learn was last on (tests.js keeps it), for Continue on the home page
    last: () => { const l = read('fluentio.last'); return plain(l) && typeof l.href === 'string' && /^\/(?!\/)/.test(l.href) ? l : null; },
    // the Settings page: keep what's different from the site's settings in this browser, and show it straight away
    save: (next) => { const d = diff(site, next), ok = write('fluentio.look', d ?? null); s = merge(site, d || {}); changed(); return ok; },
    reset: () => { write('fluentio.look', null); s = site; changed(); },
  };
  addEventListener('storage', (e) => { if (e.key === 'fluentio.look') { s = mine(); changed(); } });
  // (a page transition the browser skips, in a hidden tab say, isn't an error)
  addEventListener('pagereveal', (e) => e.viewTransition?.ready.catch(() => {}));

  addEventListener('DOMContentLoaded', () => {
    fill();
    sky();
    // a soft light that follows the pointer across a card
    if (matchMedia('(hover: hover)').matches) {
      addEventListener('pointermove', (e) => {
        const card = e.target instanceof Element && e.target.closest('.card');
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      }, { passive: true });
    }
  });
})();
