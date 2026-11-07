// The bar at the top of every page: the site's name, the spaces (Home, Modules, Music, Data, Code and Notes: the one
// you're in is marked, and the mark slides across when you go to another), Search, and Settings. Each page loads this
// right after look.js and calls fluentio.bar() first thing in its <body>, so the bar is there before the page is drawn.
// Search finds the pages, the subjects, your songs, and everything in Data, Code and Notes. While look.js has Data, Code
// and Notes switched off, the bar, Search and the keys leave them out. The keys are the settings' (Settings can record
// new ones): ⌃K (or /) searches, and ⌃1 to ⌃6 go to Home, Modules, Music, Data, Code and Notes from anywhere. When a
// song is playing (or waiting), the music player comes along at the bottom of every page (kit/music/player.js).
(() => {
  const f = window.fluentio;
  if (!f) return;
  const { el, svg } = f;
  const keyFor = (name) => f.key.shown(f.settings.keys[name]);   // how a key reads ('' when it's off)
  const spaces = () => [
    { id: 'home', title: 'Home', href: f.link('./'), icon: 'home', key: keyFor('home') },
    { id: 'study', title: f.settings.studyTitle, href: f.link('study/'), icon: 'study', key: keyFor('study') },
    { id: 'station', title: f.settings.stationTitle, href: f.link('station/'), icon: 'station', key: keyFor('station') },
    { id: 'music', title: f.settings.musicTitle, href: f.link('music/'), icon: 'music', key: keyFor('music') },
    { id: 'data', title: f.settings.dataTitle, href: f.link('data/'), icon: 'database', key: keyFor('data') },
    { id: 'code', title: f.settings.codeTitle, href: f.link('code/'), icon: 'code', key: keyFor('code') },
    { id: 'notes', title: f.settings.notesTitle, href: f.link('notes/'), icon: 'note', key: keyFor('notes') },
  ].filter((x) => f.spacesOn || !['data', 'code', 'notes'].includes(x.id));
  // a link into Data, Code or Notes (a Quick button's, say), left out while they're off
  const offLink = (href) => !f.spacesOn && /^(data|code|notes|workspace)\//.test(f.link(href).slice(f.root.length));
  // the space this page is in (a subject's page is in Modules, whose folder is study/), or what it is: 'settings', say
  const where = (url = location.href) => {
    const top = new URL(f.root).pathname, path = new URL(url).pathname;
    const first = path.startsWith(top) ? path.slice(top.length).split('/')[0] : '';
    if (first === '' || first === 'index.html') return 'home';
    if (first === 'study' || f.settings.study.some((x) => String(x.link).replace(/^\.?\//, '').split('/')[0] === first)) return 'study';
    return first;
  };

  let nav = null, find = null;
  const drawNav = () => {
    const here = where();
    // (each with its icon, which is all a phone has room for)
    nav.replaceChildren(...spaces().map((x) => el('a', { href: x.href, className: x.id === here ? 'on' : '', title: x.key ? `${x.title} (${x.key})` : x.title, 'aria-label': x.title, 'aria-current': x.id === here ? 'page' : null },
      x.id === here ? el('span', { className: 'pill', 'aria-hidden': 'true' }) : null,
      // (the icon and name are their own layer in a page change, so the sliding pill passes under them, not over)
      el('span', { className: 'space-in', style: `view-transition-name: space-in-${x.id}` }, svg(x.icon), el('span', { className: 'space-name' }, x.title)))));
    const k = keyFor('search');
    find.title = k ? `Search (${k})` : 'Search';
    find.querySelector('kbd').textContent = k;
    find.querySelector('kbd').hidden = !k;
  };
  f.bar = () => {
    if (!document.body || document.querySelector('body > .topbar')) return;
    // the page's scrollbar: out of sight until you scroll or point at the right edge (kit/site.css hides the browser's own)
    const thumb = el('div', { className: 'page-scroll', 'aria-hidden': 'true' }), page = document.documentElement;
    document.body.append(thumb);
    let held = false, grab = 0, lastUsed = -1e9, hide = 0, trackTop = 0, room = 0, height = 0;
    const measure = () => {
      const most = page.scrollHeight - page.clientHeight;
      if (most <= 1) return false;
      const player = document.getElementById('music-bar'), bottom = player && !player.hidden ? player.getBoundingClientRect().top : innerHeight;
      trackTop = (document.querySelector('.topbar')?.getBoundingClientRect().bottom ?? 0) + 4;
      const track = Math.max(60, bottom - 4 - trackTop);
      height = Math.max(36, (track * page.clientHeight) / page.scrollHeight);
      room = track - height;
      thumb.style.height = `${height}px`;
      thumb.style.top = `${trackTop + room * Math.min(1, Math.max(0, scrollY / most))}px`;
      return true;
    };
    const showBar = () => {
      if (!measure()) return thumb.classList.remove('on');
      thumb.classList.add('on');
      clearTimeout(hide);
      hide = setTimeout(function later() { if (held || thumb.matches(':hover')) hide = setTimeout(later, 400); else thumb.classList.remove('on'); }, 1100);
    };
    // (when you're the one scrolling: a page finding its place, or going back to the top, doesn't bring it up)
    for (const type of ['wheel', 'touchmove', 'keydown']) addEventListener(type, () => { lastUsed = performance.now(); }, { capture: true, passive: true });
    addEventListener('scroll', () => { if (held || performance.now() - lastUsed < 500) showBar(); else if (thumb.classList.contains('on')) measure(); }, { passive: true });
    addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' && !held && innerWidth - e.clientX < 16 && e.clientY > trackTop) showBar(); }, { passive: true });
    addEventListener('resize', () => { if (thumb.classList.contains('on')) measure(); }, { passive: true });
    thumb.addEventListener('pointerdown', (e) => { e.preventDefault(); held = true; grab = e.clientY - thumb.getBoundingClientRect().top; thumb.setPointerCapture(e.pointerId); thumb.classList.add('held'); });
    thumb.addEventListener('pointermove', (e) => { if (held && room > 0) scrollTo({ top: ((e.clientY - grab - trackTop) / room) * (page.scrollHeight - page.clientHeight), behavior: 'instant' }); });
    for (const type of ['pointerup', 'pointercancel']) thumb.addEventListener(type, () => { held = false; thumb.classList.remove('held'); showBar(); });
    // where you've been and how long you've been at it, for the home page's assistant ('fluentio:', so it stays in this browser
    // and isn't saved with your progress): once a page is showing, and each minute while you're using it
    const mark = () => {
      try {
        const t = Date.now(), here = location.pathname.slice(new URL(f.root).pathname.length).split('/')[0], s = !here || here.endsWith('.html') ? 'home' : here, was = f.read('fluentio:trail') || {}, log = Array.isArray(was.log) ? was.log : [], end = log.at(-1);
        if (end?.s === s && t - (end.e || end.t) < 5 * 60000) end.e = t; else log.push({ s, t, e: t });
        f.write('fluentio:trail', { log: log.slice(-80), seen: { ...was.seen, [s]: t } });
      } catch {}
    };
    if (window.frameElement) addEventListener('fluence:shown', mark, { once: true }); else mark();
    let used = Date.now();
    for (const type of ['pointerdown', 'keydown', 'wheel']) addEventListener(type, () => { used = Date.now(); }, { capture: true, passive: true });
    setInterval(() => {
      const inCharge = window.frameElement ? window.frameElement.id === 'page-frame' : !document.getElementById('page-frame');
      if (inCharge && !document.hidden && Date.now() - used < 5 * 60000) mark();
    }, 60000);
    nav = el('nav', { className: 'spaces', 'aria-label': 'Spaces' });
    find = el('button', { type: 'button', className: 'find', onclick: () => openFind() }, svg('search'), el('span', {}, 'Search'), el('kbd'));
    drawNav();
    const brand = el('a', { className: 'brand', href: f.link('./'), 'data-fill': 'name' }, f.settings.name);
    const gear = el('a', { className: 'gear' + (where() === 'settings' ? ' on' : ''), href: f.link('settings/'), title: 'Settings', 'aria-label': 'Settings' }, svg('settings'));
    document.body.prepend(el('header', { className: 'topbar' }, brand, nav, el('div', { className: 'tools' }, find, gear)));
    document.documentElement.classList.add('has-bar');
    // the music player, when there's a song to carry on with (Music's page and the home page bring it themselves)
    if ((f.read('fluentio.music.player') || {}).queue?.length && document.body.dataset.music !== 'off') {
      // (asked for all at once, not one after another as each finds it needs the next)
      for (const m of ['player', 'library', 'github', 'store']) document.head.append(el('link', { rel: 'modulepreload', href: f.link(`kit/music/${m}.js`) }));
      f.wait(import(f.link('kit/music/player.js')).then((m) => m.mount()).catch(() => {}));
    }
  };
  addEventListener('fluentio:settings', () => nav && drawNav());
  // the mark slides across as soon as you go somewhere, and the next page's mark carries on from where it got to (kit/look.js)
  const slide = (pill, moves) => {
    for (const a of nav.children) if (!a.contains(pill)) a.style.zIndex = 1;   // (so it passes under the other names, not over them)
    pill.style.transformOrigin = 'left center';
    const speed = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--speed')) || 1;
    pill.animate({ transform: moves }, { duration: f.moving() ? 480 / speed : 0, easing: 'cubic-bezier(.3, 1.2, .5, 1)', fill: 'forwards' });
  };
  const toward = (a, b) => `translateX(${b.left - a.left}px) scaleX(${b.width / a.width})`;
  addEventListener('fluence:going', (e) => {
    const i = nav ? spaces().findIndex((x) => x.id === where(e.detail)) : -1, to = nav?.children[i], from = nav?.querySelector('a.on'), pill = nav?.querySelector('.pill');
    if (!to || !pill || to === from) return;
    from?.classList.remove('on'); to.classList.add('on');
    // (from wherever it's got to, if you've clicked again on its way: it stays in the name it started in)
    const own = pill.parentElement.getBoundingClientRect();
    slide(pill, [toward(own, pill.getBoundingClientRect()), toward(own, to.getBoundingClientRect())]);
  });
  addEventListener('fluence:shown', (e) => {
    const pill = nav?.querySelector('.pill'), was = e.detail?.pill;
    if (!pill || !was) return;
    const now = pill.getBoundingClientRect();
    if (Math.abs(was.left - now.left) > 1 || Math.abs(was.width - now.width) > 1) slide(pill, [toward(now, was), 'none']);
  });

  // ---------- Search ----------
  const KINDS = { note: 'Note', doc: 'Doc', table: 'Sheet', code: 'Code file' };
  let box = null, input = null, list = null, found = [], at = 0, before = null;
  // everything there is to find, in the order it shows with nothing typed
  function everything(q) {
    const s = f.settings, out = [];
    spaces().forEach((x) => out.push({ title: x.title, kind: x.key || 'Page', icon: x.icon, href: x.href, group: 'Go to' }));
    out.push({ title: 'Settings', kind: 'Colors and more', icon: 'settings', href: f.link('settings/'), group: 'Go to' });
    // what you worked on last (each in its own space), and once something's typed, all of it, folders and databases too
    const items = f.spacesOn ? f.workspace.items().sort((a, b) => (b.edited || 0) - (a.edited || 0)) : [];
    for (const it of q ? items : items.slice(0, 6)) {
      out.push({ title: it.title || 'Untitled', kind: KINDS[it.kind] || '', icon: KINDS[it.kind] ? it.kind : 'note', href: f.workspace.link(it), group: 'Recent', text: typeof it.text === 'string' ? it.text : '' });
    }
    for (const x of q && f.spacesOn ? f.workspace.folders() : []) {
      const base = x.tab === 'database';
      out.push({ title: x.title || 'Untitled', kind: base ? 'Database' : 'Folder', icon: base ? 'database' : 'folder', href: f.workspace.link(x), group: 'Recent' });
    }
    for (const x of s.study) out.push({ title: x.title || '', kind: s.studyTitle, emoji: x.emoji || '📘', href: f.link(x.link), group: s.studyTitle });
    // your songs, once something's typed (from the library this browser last saw)
    const songs = q ? (f.read('fluentio.music.library') || {}).songs || [] : [];
    for (const x of songs) if (x && typeof x.title === 'string') out.push({ title: x.title, kind: x.artist || s.musicTitle, icon: 'music', href: f.link(`music/#search/${encodeURIComponent(x.title)}`), group: s.musicTitle, text: `${x.artist || ''} ${x.album || ''}` });
    const named = { notes: s.notesTitle, data: s.dataTitle, code: s.codeTitle };
    for (const [k, name] of f.spacesOn ? Object.entries(KINDS) : []) {
      const space = f.workspace.space({ kind: k });
      out.push({ title: `New ${name.toLowerCase()}`, kind: named[space], icon: 'plus', href: f.link(`${space}/#new/${k}`), group: 'Make' });
    }
    for (const x of s.quick) if (x.link && !offLink(x.link) && !out.some((o) => o.href === f.link(x.link))) out.push({ title: x.title || x.link, kind: 'Quick', icon: 'bolt', href: f.link(x.link), group: 'Make' });
    return out;
  }
  // how well something matches: the title starting with it, then a word in it, then anywhere (a note's text last)
  function score(e, q) {
    if (!q) return 1;
    const title = e.title.toLowerCase(), words = q.split(/\s+/).filter(Boolean);
    if (!words.every((w) => title.includes(w) || e.text?.toLowerCase().includes(w))) return 0;
    if (title.startsWith(q)) return 4;
    if (title.split(/[^\p{L}\p{N}]+/u).some((w) => w.startsWith(words[0]))) return 3;
    return title.includes(q) ? 2 : 1;
  }
  function draw() {
    const q = input.value.trim().toLowerCase();
    found = everything(q).map((e, i) => ({ e, i, s: score(e, q) })).filter((x) => x.s > 0);
    if (q) found.sort((a, b) => b.s - a.s || a.i - b.i);
    found = found.slice(0, 60).map((x) => x.e);
    at = Math.min(at, Math.max(0, found.length - 1));
    let group = null;
    const rows = [];
    found.forEach((e, i) => {
      if (!q && e.group !== group) rows.push(el('div', { className: 'finder-head' }, (group = e.group)));
      rows.push(el('a', { className: 'finder-item' + (i === at ? ' at' : ''), href: e.href, role: 'option', 'aria-selected': String(i === at), onmousemove: () => mark(i), onclick: () => closeFind(true) },
        el('span', { className: 'finder-ic' }, e.emoji || svg(e.icon)), el('span', { className: 'finder-title' }, e.title), el('span', { className: 'finder-kind' }, e.kind)));
    });
    list.replaceChildren(...(rows.length ? rows : [el('p', { className: 'finder-empty' }, 'Nothing matches. Try another word.')]));
  }
  function mark(i) {
    if (i === at) return;
    at = i;
    list.querySelectorAll('.finder-item').forEach((n, j) => { n.classList.toggle('at', j === at); n.setAttribute('aria-selected', String(j === at)); });
  }
  function move(by) {
    if (!found.length) return;
    mark((at + by + found.length) % found.length);
    list.querySelectorAll('.finder-item')[at]?.scrollIntoView({ block: 'nearest' });
  }
  function build() {
    input = el('input', { type: 'text', placeholder: f.spacesOn ? 'Search pages, subjects, data, code and notes' : 'Search pages and subjects', autocomplete: 'off', spellcheck: false, 'aria-label': 'Search' });
    list = el('div', { className: 'finder-list', role: 'listbox' });
    const s = f.settings;
    box = el('div', { className: 'finder', hidden: true, onclick: (e) => { if (e.target === box) closeFind(); } },
      el('div', { className: 'finder-box', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Search' },
        el('div', { className: 'finder-in' }, svg('search'), input, el('kbd', {}, 'Esc')),
        list,
        el('div', { className: 'finder-foot' },
          el('span', {}, el('kbd', {}, '↑'), el('kbd', {}, '↓'), ' move'), el('span', {}, el('kbd', {}, 'Enter'), ' open'),
          el('a', { href: f.link('settings/#keys'), onclick: () => closeFind(true) }, 'Change the keys'))));
    input.addEventListener('input', () => { at = 0; draw(); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); move(e.key === 'ArrowDown' ? 1 : -1); }
      else if (e.key === 'Enter' && found[at]) { e.preventDefault(); go(found[at].href); }
    });
    document.body.append(box);
  }
  function openFind() {
    if (!box) build();
    before = document.activeElement;
    box.hidden = false;
    input.value = '';
    at = 0;
    draw();
    input.focus();
  }
  function closeFind(leaving) {
    if (!box || box.hidden) return;
    box.hidden = true;
    if (!leaving) before?.focus?.();
  }
  const go = (href) => { closeFind(true); if (href !== location.href) location.href = href; };
  f.find = openFind;
  // the same search, for the home page's assistant
  f.findIn = (text, n = 4) => { const q = text.trim().toLowerCase(); return q ? everything(q).map((e, i) => ({ e, i, s: score(e, q) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s || a.i - b.i).slice(0, n).map((x) => x.e) : []; };

  // the keys: Search (and / too, when you're not typing), and the three spaces. A key without Ctrl, Alt or Meta only
  // counts when you're not typing, so it can't get in the way of writing
  // (a page with keys of its own, like Station's board, asks here first: true means the key was the site's)
  f.siteKey = (e) => {
    if (e.defaultPrevented || e.isComposing) return false;
    if (e.key === 'Escape' && box && !box.hidden) { e.preventDefault(); closeFind(); return true; }
    const pressed = f.key.pressed(e);
    if (!pressed) return false;
    const typing = e.target instanceof Element && !!e.target.closest('input, textarea, select, [contenteditable]');
    const is = (name) => { const want = f.key.meant(f.settings.keys[name]); return !!want && want === pressed && (!typing || /Ctrl|Alt|Meta/.test(want)); };
    if (is('search') || (pressed === '/' && !typing)) {
      e.preventDefault();
      if (box && !box.hidden) closeFind(); else openFind();
      return true;
    }
    const space = spaces().find((x) => is(x.id));
    if (space) { e.preventDefault(); go(space.href); return true; }
    return false;
  };
  addEventListener('keydown', f.siteKey);
})();
