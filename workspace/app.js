// Data, Code and Notes: the spaces where your own things live, each a page of its own in the bar (data/, code/ and
// notes/ each load this, their body's data-tab saying which), kept in this browser (look.js's fluentio.workspace holds
// the things, and fluentio.workspace.folders the folders; Settings can download a backup). Notes are Markdown, kept in
// folders ([[a note's name]] links to it, and Preview shows it laid out). Data holds databases (one can hold more),
// each with its docs (your own writing, and a Google Docs, Slides or Sheets link to open) and sheets (type in them, add
// rows and columns, CSV in and out). Code keeps files in HTML, CSS, JavaScript, Python, Java and C++ (code.js has the
// languages), in folders too. A space or a folder shows what's in it as cards, folders first: drag a card onto a
// folder, or onto a name in the path at the top, to move it there, and drop files from your computer to add them.
// Each space's animations can be turned off on their own, in its View menu or in Settings → Motion.
// Links: #folder/<id> opens a folder, #note/<id> (or doc, table, code) a thing, and #new/note (or doc, table, code)
// makes one at the top of its space. A link to something in another space goes on to that space's page.
import { LANGS, langOf, indent, start, PAGE_SCRIPT, SAMPLE, paint, runJs, runPython, stopPython, pythonRunning, pageFrom, preview } from './code.js?v=3';
import * as github from './sync.js?v=4';

const f = window.fluentio;
const { el, svg } = f;
// (names from a link or from storage could be anything, even 'constructor', so only the lists' own entries count)
const own = (list, key) => typeof key === 'string' && Object.hasOwn(list, key);
// each space: its folder on the site (also its word in the animationsIn setting), and the setting with its name
const TABS = {
  notes: { path: 'notes', title: 'notesTitle', name: 'Notes', icon: 'note', color: 'var(--accent-2)', folder: 'Folder', empty: ['No notes yet', 'Keep notes together in folders, or start with a note.'] },
  database: { path: 'data', title: 'dataTitle', name: 'Data', icon: 'database', color: 'var(--good)', folder: 'Database', empty: ['No databases yet', 'A database holds docs and sheets. Make one for each class or project, with more databases inside it if you like.'] },
  code: { path: 'code', title: 'codeTitle', name: 'Code', icon: 'code', color: 'var(--plot2)', folder: 'Folder', empty: ['No code yet', 'A folder keeps a project’s files together, like a web page’s index.html with its style.css and script.js.'] },
};
const KINDS = {
  note: { tab: 'notes', name: 'Note', icon: 'note', color: 'var(--accent-2)', make: () => ({ title: 'Untitled note', text: '' }) },
  doc: { tab: 'database', name: 'Doc', icon: 'doc', color: 'var(--accent)', make: () => ({ title: 'Untitled doc', text: '', link: '' }) },
  table: { tab: 'database', name: 'Sheet', icon: 'table', color: 'var(--good)', make: () => ({ title: 'Untitled sheet', cols: ['A', 'B', 'C'], rows: [['', '', ''], ['', '', ''], ['', '', '']] }) },
  code: { tab: 'code', name: 'File', icon: 'code', color: 'var(--plot2)', make: () => ({ title: 'script.js', text: start('js'), input: '' }) },
};
const folderIcon = (t) => (t === 'database' ? 'database' : 'folder');
const tab = own(TABS, document.body.dataset.tab) ? document.body.dataset.tab : 'notes';   // the space this page is
// a space's name, as Settings has it
const nameOf = (t) => { const v = f.settings[TABS[t].title]; return typeof v === 'string' && v.trim() ? v.trim() : TABS[t].name; };

// ---------- the page: where you are in the space, with Find and View beside it, then what's open (and for one
// thing, what's in it, on the right) ----------
const ws = document.getElementById('ws');
const where = el('nav', { className: 'crumbs', 'aria-label': 'Where you are' });
const filterBox = el('input', { className: 'input filter', type: 'search', autocomplete: 'off' });
const viewBtn = el('button', { type: 'button', className: 'icon-btn', title: 'View', 'aria-label': 'View', 'aria-expanded': 'false', 'aria-controls': 'view-menu' }, svg('settings'));
// (how saving to GitHub went, when it's connected: Settings → GitHub)
const synced = el('a', { className: 'sync', href: f.link('settings/#github'), hidden: true }, svg('cloud'), el('span'));
const menu = el('div', { className: 'menu', id: 'view-menu', role: 'dialog', 'aria-label': 'View', hidden: true });
const main = el('section', { className: 'main' });
const info = el('aside', { className: 'info', 'aria-label': 'Details' });
ws.replaceChildren(el('div', { className: 'ws-head' }, where, el('div', { className: 'ws-tools' }, synced, filterBox, el('div', { className: 'menu-wrap' }, viewBtn, menu))),
  el('div', { className: 'ws-body' }, main, info));
ws.style.setProperty('--k', TABS[tab].color);

// ---------- your things and folders, and saving them ----------
// (the folders are kept apart from the things, so a page from before folders, still open in another tab, can't drop
// them when it saves)
const FOLDERS = 'fluentio.workspace.folders';
const readFolders = () => { const w = f.read(FOLDERS); return w && Array.isArray(w.folders) ? w.folders.filter((x) => x && typeof x === 'object' && typeof x.id === 'string') : []; };
const writeFolders = (list) => f.write(FOLDERS, { v: 1, folders: list });
// a folder as it should be, whatever is in storage: in a folder of its own space ('' for the top of it), and never in
// itself or in a folder inside it
function cleanFolders(list) {
  const out = list.filter((x) => own(TABS, x.tab)).map((x) => ({ id: x.id, tab: x.tab, title: String(x.title ?? ''), parent: typeof x.parent === 'string' ? x.parent : '', made: +x.made || Date.now(), edited: +x.edited || Date.now() }));
  const at = new Map(out.map((x) => [x.id, x]));
  for (const x of out) {
    const up = at.get(x.parent);
    if (!up || up.tab !== x.tab) { x.parent = ''; continue; }
    for (let p = up, seen = new Set(); p && !seen.has(p.id); seen.add(p.id), p = at.get(p.parent)) if (p.id === x.id) { x.parent = ''; break; }
  }
  return out;
}
// and a thing: text for notes, docs and code, a sheet's rows all as wide as it, and in a folder of its space (at the
// top of it if its folder is gone)
function cleanItems(list, inFolders) {
  const tabOf = new Map(inFolders.map((x) => [x.id, x.tab]));
  return list.filter((x) => own(KINDS, x.kind)).map((x) => {
    const it = { ...x, title: String(x.title ?? ''), made: +x.made || Date.now(), edited: +x.edited || Date.now() };
    it.parent = tabOf.get(x.parent) === KINDS[x.kind].tab ? x.parent : '';
    if (x.kind === 'table') {
      it.cols = Array.isArray(x.cols) && x.cols.length ? x.cols.map((c) => String(c ?? '')) : ['A'];
      it.rows = (Array.isArray(x.rows) ? x.rows : []).map((r) => it.cols.map((_, c) => String((Array.isArray(r) ? r[c] : '') ?? '')));
    } else it.text = String(x.text ?? '');
    if (x.kind === 'doc') it.link = String(x.link ?? '');
    if (x.kind === 'code') it.input = String(x.input ?? '');
    return it;
  });
}
let folders = cleanFolders(readFolders());
let items = cleanItems(f.workspace.items(), folders);
let at = '', current = null;                        // the folder open ('' the top of the space), and the thing open in it
let timer = 0, dirty = false, pending = 0, hooks = {};
const sorting = f.read('fluentio.ws.sort');
const sorts = Object.fromEntries(Object.keys(TABS).map((t) => [t, ['edited', 'name'].includes(sorting?.[t]) ? sorting[t] : t === 'code' ? 'name' : 'edited']));
const modes = new Map();                            // a note's Edit or Preview, for this visit
const byId = (id) => items.find((x) => x.id === id);
const folderById = (id) => (id ? folders.find((x) => x.id === id) : undefined);
const tabOf = (x) => (x.kind ? KINDS[x.kind].tab : x.tab);
// where a folder or thing is: a link on this page, or to the page of the space it's in
const linkTo = (x) => { const hash = x.kind ? `#${x.kind}/${x.id}` : `#folder/${x.id}`; return tabOf(x) === tab ? hash : f.link(`${TABS[tabOf(x)].path}/${hash}`); };
const bare = () => location.pathname + location.search;   // this page with nothing open
const placeOf = (id) => (id ? `#folder/${id}` : bare());
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
// the folders from the top of the space down to this one, and every folder inside one, however deep
const pathTo = (id) => { const out = []; for (let x = folderById(id); x && out.length < 64; x = folderById(x.parent)) out.unshift(x); return out; };
const below = (id) => folders.filter((x) => x.parent === id).flatMap((x) => [x.id, ...below(x.id)]);
const byName = (a, b) => (a.title || 'Untitled').localeCompare(b.title || 'Untitled', undefined, { numeric: true, sensitivity: 'base' });
const order = (list, t) => list.sort(sorts[t] === 'name' ? byName : (a, b) => b.edited - a.edited);
const inside = (t, id) => ({ folders: order(folders.filter((x) => x.tab === t && x.parent === id), t), items: order(items.filter((x) => KINDS[x.kind].tab === t && x.parent === id), t) });
const plural = (n, word) => `${n.toLocaleString('en-US')} ${word}${n === 1 ? '' : 's'}`;
// what's in a folder, in words: '2 folders · 5 notes'
function summary(t, id) {
  const k = inside(t, id), out = k.folders.length ? [plural(k.folders.length, TABS[t].folder.toLowerCase())] : [];
  for (const kind of Object.keys(KINDS).filter((x) => KINDS[x].tab === t)) {
    const n = k.items.filter((x) => x.kind === kind).length;
    if (n) out.push(plural(n, KINDS[kind].name.toLowerCase()));
  }
  return out.join(' · ') || 'Empty';
}

const saved = el('span', { className: 'saved', 'aria-live': 'polite' });
function save(now) {
  dirty = true;
  clearTimeout(timer);
  const go = () => {
    dirty = false;
    const ok = [f.workspace.save(items), writeFolders(folders)].every(Boolean);
    if (ok) github.soon();
    saved.textContent = ok ? 'Saved' : "Couldn't save: this browser's storage is full or turned off";
    saved.className = 'saved show' + (ok ? '' : ' bad');
    clearTimeout(saved.hide);
    if (ok) saved.hide = setTimeout(() => saved.classList.remove('show'), 1400);
  };
  if (now) go(); else timer = setTimeout(go, 350);
}
const flush = () => { if (dirty) { clearTimeout(timer); dirty = false; f.workspace.save(items); writeFolders(folders); } };
addEventListener('pagehide', flush);
addEventListener('beforeunload', flush);
// a folder's things changed, so it did too (and the ones it's in), for sorting by Newest
const bump = (id) => { const now = Date.now(); for (const x of pathTo(id)) x.edited = now; };
// something changed: save it soon, and redraw the path at the top and the right side once this frame
function touch(x) {
  x.edited = Date.now();
  bump(x.parent);
  save();
  if (!pending) pending = requestAnimationFrame(() => { pending = 0; drawWhere(); drawInfo(); });
}
// another tab (or a sync with GitHub) changed them: take that version, but keep the one you're typing in
function reload() {
  const typing = main.contains(document.activeElement) && document.activeElement.matches('input, textarea');
  const mine = typing ? (current ? byId(current) : folderById(at)) : null;
  folders = cleanFolders(readFolders()).map((x) => (mine && !mine.kind && x.id === mine.id ? mine : x));
  items = cleanItems(f.workspace.items(), folders).map((x) => (mine?.kind && x.id === mine.id ? mine : x));
  if (mine && (mine.kind ? byId(mine.id) : folderById(mine.id))) { drawWhere(); drawInfo(); return; }
  route(false);
}
addEventListener('storage', (e) => { if (e.key === 'fluentio.workspace' || e.key === FOLDERS) reload(); });

// ---------- going places, and making things ----------
function route(fresh = true) {
  let hash = location.hash.slice(1);
  try { hash = decodeURIComponent(hash); } catch {}
  const [a, b] = hash.split('/');
  if (a === 'new') return makeFrom(b === 'sheet' ? 'table' : b);
  const thing = (a === 'folder' && folderById(b)) || (own(KINDS, a) && byId(b)) || null;
  // (something in another space opens on that space's page, and so does a link from when the spaces were tabs:
  // #notes, #database or #code)
  if (thing && tabOf(thing) !== tab) return location.replace(linkTo(thing));
  if (own(TABS, a) && !b && a !== tab) return location.replace(f.link(`${TABS[a].path}/`));
  if (thing) return thing.kind ? open(thing, fresh) : browse(thing.id, fresh);
  if (location.href.includes('#')) history.replaceState(null, '', bare());
  browse('', fresh);
}
addEventListener('hashchange', () => route());
// a link that makes something (from Search, the home page or a Quick button) makes it at the top of its space
function makeFrom(kind) {
  if (own(KINDS, kind) && KINDS[kind].tab !== tab) return location.replace(f.link(`${TABS[KINDS[kind].tab].path}/#new/${kind}`));
  if (!own(KINDS, kind) || kind === 'code') {
    history.replaceState(null, '', bare());
    browse('', true);
    if (kind === 'code') choose();
    return;
  }
  make(kind, {}, '', false);
}
// something new in a folder ('' the top of its space); make() opens it with its name ready to type over (on the
// history, so Back goes to where you were, unless a link made it)
function add(kind, extra, parent) {
  const now = Date.now();
  const it = { id: newId(), kind, ...KINDS[kind].make(), ...extra, parent, made: now, edited: now };
  items.unshift(it);
  bump(parent);
  return it;
}
function make(kind, extra = {}, parent = '', push = true) {
  const it = add(kind, extra, parent);
  save(true);
  history[push ? 'pushState' : 'replaceState'](null, '', linkTo(it));
  open(it, true, true);
  return it;
}
function makeFolder(parent, title, go = true) {
  const now = Date.now();
  const x = { id: newId(), tab, title: title ?? unique(parent, `New ${TABS[tab].folder.toLowerCase()}`), parent, made: now, edited: now };
  folders.push(x);
  bump(parent);
  save(true);
  if (go) { history.pushState(null, '', linkTo(x)); browse(x.id, true, true); }
  return x;
}
// a name nothing else in that folder has: 'New folder', then 'New folder 2' (or for a file, 'index.html', then 'index2.html')
function unique(parent, name, file = false) {
  const taken = new Set([...folders.filter((x) => x.tab === tab && x.parent === parent), ...items.filter((x) => KINDS[x.kind].tab === tab && x.parent === parent)].map((x) => x.title.trim().toLowerCase()));
  if (!taken.has(name.toLowerCase())) return name;
  const [, base, ext = ''] = file ? /^(.*?)(\.[^.]*)?$/.exec(name) : [name, name];
  for (let n = 2; ; n++) { const next = file ? `${base}${n}${ext}` : `${base} ${n}`; if (!taken.has(next.toLowerCase())) return next; }
}
function open(it, fresh, naming) {
  current = it.id;
  enter(it.parent);
  ws.classList.add('open');
  drawEditor(it, fresh, naming);
  drawInfo();
}
function browse(id, fresh, naming) {
  current = null;
  enter(id);
  ws.classList.remove('open');
  drawBrowse(fresh, naming);
  drawInfo();
}
function enter(id) {
  closeMenu();
  at = id;
  ws.classList.remove('details');
  motion();
  drawWhere();
  setTitle();
}
function setTitle() {
  const it = byId(current), x = folderById(at), name = nameOf(tab);
  document.title = `${it || x ? `${(it || x).title || 'Untitled'} · ` : ''}${name} · ${f.settings.name}`;
  filterBox.placeholder = `Find in ${name}`;
  filterBox.setAttribute('aria-label', `Find in ${name}`);
  main.setAttribute('aria-label', name);
}
// where you are: the space (its top, without loading the page again), then each folder down to the open one, each
// taking a card dropped on it
function drawWhere() {
  const step = (x) => {
    const a = el('a', { href: x ? linkTo(x) : bare() }, x ? null : svg(TABS[tab].icon), x ? x.title || 'Untitled' : nameOf(tab));
    if (!x) a.addEventListener('click', (e) => {
      if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      filterBox.value = '';
      if (location.hash) history.pushState(null, '', bare());
      route();
    });
    dropOn(a, x ? x.id : '');
    return a;
  };
  where.replaceChildren(step(null), ...pathTo(at).flatMap((x) => [el('span', { className: 'sep', 'aria-hidden': 'true' }, '›'), step(x)]));
  if (!current) where.lastElementChild.setAttribute('aria-current', 'location');
}
function remove(it) {
  items = items.filter((x) => x !== it);
  bump(it.parent);
  save(true);
  history.replaceState(null, '', placeOf(it.parent));
  browse(it.parent, true);
}
// a folder goes with everything in it
function removeFolder(x) {
  const gone = new Set([x.id, ...below(x.id)]);
  folders = folders.filter((y) => !gone.has(y.id));
  items = items.filter((y) => !gone.has(y.parent));
  bump(x.parent);
  save(true);
  history.replaceState(null, '', placeOf(x.parent));
  browse(x.parent, true);
}
// whether a folder or thing can go into a folder ('' the top of its space): the same space, somewhere it isn't yet,
// and for a folder, not into itself or into one inside it
function canMove(x, id) {
  const into = folderById(id);
  if ((id && (!into || into.tab !== tabOf(x))) || x.parent === id) return false;
  return !!x.kind || (id !== x.id && !below(x.id).includes(id));
}
function moveTo(x, id) {
  if (!canMove(x, id)) return;
  bump(x.parent);
  x.parent = id;
  bump(id);
  save(true);
  route(false);
}

// ---------- the View menu: sorting, and this space's animations ----------
// (on, unless Settings or the device turns them all off, or this space's are off)
const moving = () => f.moving() && f.settings.animationsIn?.[TABS[tab].path] !== false;
const motion = () => ws.classList.toggle('still', !moving());
addEventListener('fluentio:settings', () => {
  motion();
  setTitle();
  drawWhere();
  if (!current && !main.contains(document.activeElement)) drawBrowse(false);
});
function seg(options, value, pick, label) {
  const box = el('div', { className: 'seg', role: 'group', 'aria-label': label });
  for (const [v, name] of options) {
    const b = el('button', { type: 'button', className: v === value ? 'on' : '', 'aria-pressed': String(v === value), onclick: () => {
      for (const x of box.children) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); }
      pick(v);
    } }, name);
    box.append(b);
  }
  return box;
}
function drawMenu() {
  const name = nameOf(tab), key = TABS[tab].path, all = f.settings.animations !== false;
  const sw = el('input', { type: 'checkbox', className: 'switch', checked: all && f.settings.animationsIn?.[key] !== false, disabled: !all, 'aria-label': `Animations in ${name}`,
    onchange: () => f.save({ ...f.settings, animationsIn: { ...f.settings.animationsIn, [key]: sw.checked } }) });
  menu.replaceChildren(
    el('div', { className: 'menu-row' }, el('span', {}, 'Sort'), seg([['edited', 'Newest'], ['name', 'A to Z']], sorts[tab], (v) => {
      sorts[tab] = v;
      f.write('fluentio.ws.sort', sorts);
      if (!current) drawBrowse(false);
    }, 'Sort')),
    el('label', { className: 'menu-row' }, el('span', {}, `Animations in ${name}`), sw),
    el('small', {}, all ? `Only in ${name}: the other spaces keep their own.` : 'Animations are off everywhere, in Settings.'),
    el('a', { href: f.link('settings/#motion') }, 'Motion settings'));
}
function closeMenu() {
  menu.hidden = true;
  viewBtn.setAttribute('aria-expanded', 'false');
  viewBtn.classList.remove('on');
}
viewBtn.addEventListener('click', () => {
  if (!menu.hidden) return closeMenu();
  drawMenu();
  menu.hidden = false;
  viewBtn.setAttribute('aria-expanded', 'true');
  viewBtn.classList.add('on');
});
addEventListener('pointerdown', (e) => { if (!menu.hidden && !menu.contains(e.target) && !viewBtn.contains(e.target)) closeMenu(); });
addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || e.defaultPrevented) return;
  if (!menu.hidden) { closeMenu(); viewBtn.focus(); }
  else if (ws.classList.contains('details')) ws.classList.remove('details');
});
// typing in Find shows what matches anywhere in the space, as cards
filterBox.addEventListener('input', () => {
  const it = byId(current);
  if (!it) return drawBrowse(false);
  history.pushState(null, '', placeOf(it.parent));
  browse(it.parent, false);
});

// ---------- a space or a folder: what's in it, as cards ----------
const ago = (t) => {
  const m = Math.round((Date.now() - t) / 60000);
  return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : m < 43200 ? `${Math.round(m / 1440)} d ago`
    : new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};
// a note's words on its card, without the Markdown marks
const gist = (text) => text.replace(/```[\s\S]*?(```|$)/g, ' ').replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (m, a, b) => b || a).replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/^\s*(#{1,6}|>|[-*+]\s+\[[ xX]\]|[-*+]|\d+[.)])\s+/gm, '').replace(/[*_~`]/g, '').replace(/\s+/g, ' ').trim().slice(0, 240);
const linkKind = (u) => (/docs\.google\.com\/document\//.test(u) ? 'Google Doc' : /docs\.google\.com\/presentation\//.test(u) ? 'Google Slides'
  : /docs\.google\.com\/spreadsheets\//.test(u) ? 'Google Sheet' : 'link');
// a code file's language, as a colored badge
function badge(L, small) {
  const b = el('span', { className: 'badge' + (small ? ' mini' : ''), 'aria-hidden': small ? 'true' : null, title: small ? null : L.name }, L.short);
  b.style.setProperty('--b', L.color);
  if (L.ink) b.style.setProperty('--bt', L.ink);
  return b;
}
const iconOf = (x) => (x.kind === 'code' ? badge(langOf(x.title), true) : svg(x.kind ? KINDS[x.kind].icon : folderIcon(x.tab)));
// where a found card is
const whereLine = (id) => el('p', { className: 't-where' }, `in ${[nameOf(tab), ...pathTo(id).map((x) => x.title || 'Untitled')].join(' › ')}`);
const PREVIEW = {
  note: (it) => el('p', { className: 't-text' }, gist(it.text) || 'Nothing written yet.'),
  doc: (it) => el('p', { className: 't-text' }, gist(it.text) || (/^https?:\/\//.test(it.link) ? `A ${linkKind(it.link)} to open.` : 'Nothing written yet.')),
  table: (it) => el('table', { className: 't-grid', 'aria-hidden': 'true' }, el('tbody', {}, [it.cols, ...it.rows].slice(0, 4).map((r) => el('tr', {}, r.slice(0, 4).map((c) => el('td', {}, c)))))),
  code: (it) => { const pre = el('pre', { className: 't-code', 'aria-hidden': 'true' }); pre.innerHTML = paint(it.text.split('\n').slice(0, 7).join('\n'), langOf(it.title).like); return pre; },
};
const SIZE = {
  note: (it) => plural(wordCount(it.text), 'word'),
  doc: (it) => plural(wordCount(it.text), 'word'),
  table: (it) => `${plural(it.rows.length, 'row')} · ${plural(it.cols.length, 'column')}`,
  code: (it) => `${langOf(it.title).name} · ${plural(it.text.split('\n').length, 'line')}`,
};
function folderCard(x, q) {
  const k = inside(x.tab, x.id), first = [...k.folders, ...k.items];
  const card = el('article', { className: `card thing folder${x.tab === 'database' ? ' base' : ''}`, draggable: true },
    x.tab === 'database' ? null : el('span', { className: 'flap', 'aria-hidden': 'true' }),
    el('a', { className: 'thing-link', href: linkTo(x), draggable: false }, el('span', { className: 't-ic' }, svg(folderIcon(x.tab))), el('span', { className: 't-name' }, x.title || 'Untitled')),
    q ? whereLine(x.parent) : null,
    first.length
      ? el('ul', { className: 't-list' }, first.slice(0, 4).map((y) => el('li', {}, el('a', { href: linkTo(y), draggable: false }, iconOf(y), el('span', {}, y.title || 'Untitled')))),
        first.length > 4 ? el('li', { className: 'more' }, `and ${first.length - 4} more`) : null)
      : el('p', { className: 't-text' }, `Nothing in this ${TABS[x.tab].folder.toLowerCase()} yet.`),
    el('p', { className: 't-meta' }, [first.length ? summary(x.tab, x.id) : '', ago(x.edited)].filter(Boolean).join(' · ')));
  card.style.setProperty('--k', TABS[x.tab].color);
  dragFrom(card, x);
  dropOn(card, x.id);
  return card;
}
function itemCard(it, q) {
  const K = KINDS[it.kind];
  const card = el('article', { className: 'card thing', draggable: true },
    el('a', { className: 'thing-link', href: linkTo(it), draggable: false }, it.kind === 'code' ? badge(langOf(it.title)) : el('span', { className: 't-ic' }, svg(K.icon)), el('span', { className: 't-name' }, it.title || 'Untitled')),
    q ? whereLine(it.parent) : null,
    PREVIEW[it.kind](it),
    el('p', { className: 't-meta' }, `${SIZE[it.kind](it)} · ${ago(it.edited)}`));
  card.style.setProperty('--k', K.color);
  dragFrom(card, it);
  return card;
}
// everything in the space that matches, wherever it is
function search(q) {
  const has = (x) => x.title.toLowerCase().includes(q) || (typeof x.text === 'string' && x.text.toLowerCase().includes(q))
    || (x.kind === 'table' && [x.cols, ...x.rows].some((r) => r.some((c) => c.toLowerCase().includes(q))));
  return { folders: order(folders.filter((x) => x.tab === tab && has(x)), tab), items: order(items.filter((x) => KINDS[x.kind].tab === tab && has(x)), tab) };
}
// the buttons that make things here
function makers() {
  const button = (text, go, primary, icon = 'plus') => el('button', { type: 'button', className: 'btn' + (primary ? ' primary' : ''), onclick: go }, svg(icon), text);
  const folder = (primary) => button(`New ${TABS[tab].folder.toLowerCase()}`, () => makeFolder(at), primary);
  if (tab === 'notes') return [folder(false), button('New note', () => make('note', {}, at), true)];
  if (tab === 'database') {
    const file = el('input', { type: 'file', hidden: true, accept: '.csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain', onchange: () => { if (file.files[0]) importTable(file.files[0], at); file.value = ''; } });
    return [folder(!at), button('New doc', () => make('doc', {}, at), !!at), button('New sheet', () => make('table', {}, at)), button('Import CSV', () => file.click(), false, 'upload'), file];
  }
  const files = el('input', { type: 'file', hidden: true, multiple: true, onchange: () => { addFiles(files.files, at); files.value = ''; } });
  return [folder(false), button('New file', () => choose(), true), button('Add files', () => files.click(), false, 'upload'), files];
}
// a folder's own buttons: move it, or delete it (asked first, saying what goes with it)
function folderTools(x, head) {
  const F = TABS[x.tab].folder.toLowerCase(), box = el('span', { className: 'b-tools' });
  const calm = () => box.replaceChildren(
    el('button', { type: 'button', className: 'icon-btn', title: 'Move', 'aria-label': `Move this ${F}`, onclick: () => moveBox(x, head) }, svg('move')),
    el('button', { type: 'button', className: 'icon-btn danger', title: 'Delete', 'aria-label': `Delete this ${F}`, onclick: () => {
      const all = new Set([x.id, ...below(x.id)]), n = all.size - 1 + items.filter((y) => all.has(y.parent)).length;
      box.replaceChildren(el('span', { className: 'ask' }, n ? `Delete this ${F} and the ${plural(n, 'thing')} in it?` : `Delete this ${F}?`),
        el('button', { type: 'button', className: 'btn danger', onclick: () => removeFolder(x) }, 'Delete'),
        el('button', { type: 'button', className: 'btn', onclick: calm }, 'Keep'));
    } }, svg('trash')));
  calm();
  return box;
}
function drawBrowse(fresh, naming) {
  const T = TABS[tab], folder = folderById(at), q = filterBox.value.trim().toLowerCase(), top = main.scrollTop;
  const view = el('div', { className: 'browse' + (fresh ? ' enter' : '') });
  // its name (a folder's, to change), what's in it, and the buttons to make more
  const name = folder
    ? el('input', { className: 'ed-title', value: folder.title, placeholder: 'Untitled', spellcheck: false, 'aria-label': `${T.folder}’s name`,
      oninput: (e) => { folder.title = e.target.value; touch(folder); setTitle(); },
      onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } } })
    : el('h1', {}, nameOf(tab));
  const head = el('div', { className: 'b-head' }, el('span', { className: 'ed-ic' }, svg(folder ? folderIcon(tab) : T.icon)),
    el('div', { className: 'b-name' }, name, el('p', { className: 'b-sub' }, summary(tab, at))));
  head.append(el('div', { className: 'b-actions' }, ...makers(), folder ? folderTools(folder, head) : null));
  view.append(head);
  const found = q ? search(q) : inside(tab, at);
  if (found.folders.length || found.items.length) view.append(el('div', { className: 'cards' + (fresh ? ' stagger' : '') }, found.folders.map((x) => folderCard(x, q)), found.items.map((x) => itemCard(x, q))));
  else if (q) view.append(el('p', { className: 'none-found' }, `Nothing in ${nameOf(tab)} matches “${filterBox.value.trim()}”.`));
  else if (folder) view.append(el('div', { className: 'nothing' }, el('p', {}, `Nothing in this ${T.folder.toLowerCase()} yet. Make something with the buttons above, drag a card onto it, or drop files here from your computer.`)));
  else view.append(el('div', { className: 'nothing' }, el('span', { className: 'ed-ic big' }, svg(T.icon)), el('h2', {}, T.empty[0]), el('p', {}, T.empty[1])));
  view.append(el('p', { className: 'foot' }, 'Kept in this browser. ', el('a', { href: f.link('settings/#data') }, 'Back it up')));
  dropOn(view, at);
  main.replaceChildren(view);
  main.scrollTop = fresh ? 0 : top;
  if (naming) { name.focus(); name.select?.(); }
}
// where a folder or thing can go, in a list under its name: the top of the space, then each folder in it
function moveBox(x, head) {
  main.querySelector('.move-box')?.remove();
  const t = tabOf(x), rows = [];
  const walk = (id, lvl) => { for (const y of folders.filter((z) => z.tab === t && z.parent === id).sort(byName)) { rows.push([y, lvl]); walk(y.id, lvl + 1); } };
  walk('', 1);
  const choice = (id, text, icon, lvl) => {
    const b = el('button', { type: 'button', disabled: !canMove(x, id), onclick: () => moveTo(x, id) }, svg(icon), el('span', {}, text), x.parent === id ? el('small', {}, 'here now') : null);
    b.style.setProperty('--lvl', lvl);
    return el('li', {}, b);
  };
  const box = el('div', { className: 'pop-in move-box' },
    el('div', { className: 'pop-top' }, el('b', {}, `Move “${x.title || 'Untitled'}” to`), el('button', { type: 'button', className: 'icon-btn', title: 'Close', 'aria-label': 'Close', onclick: () => box.remove() }, svg('x'))),
    el('ul', { className: 'moves' }, choice('', nameOf(t), TABS[t].icon, 0), rows.map(([y, lvl]) => choice(y.id, y.title || 'Untitled', folderIcon(t), lvl))));
  head.after(box);
}
// a new file: one of the six, or a web page (a folder with an index.html, a style.css and a script.js that work together)
function choose() {
  const view = main.querySelector('.browse');
  if (!view) return;
  view.querySelector('.picker')?.remove();
  const box = el('div', { className: 'pop-in picker' },
    el('div', { className: 'pop-top' }, el('b', {}, 'A new file'), el('button', { type: 'button', className: 'icon-btn', title: 'Close', 'aria-label': 'Close', onclick: () => box.remove() }, svg('x'))),
    el('div', { className: 'langs stagger' }, Object.entries(LANGS).map(([id, L]) => {
      const name = unique(at, `${L.file}.${id}`, true);
      return el('button', { type: 'button', className: 'lang-btn', onclick: () => make('code', { title: name, text: start(id, name.replace(/\.[^.]+$/, '')), input: '' }, at) },
        badge(langOf(name)), el('span', {}, el('b', {}, L.name), el('small', {}, name)));
    }), el('button', { type: 'button', className: 'lang-btn', onclick: webPage }, el('span', { className: 't-ic' }, svg('folder')),
      el('span', {}, el('b', {}, 'Web page'), el('small', {}, 'HTML, CSS and JS in a folder')))));
  view.querySelector('.b-head').after(box);
  box.querySelector('.lang-btn').focus();
}
function webPage() {
  const x = makeFolder(at, unique(at, 'My page'), false);
  add('code', { title: 'index.html', text: start('html'), input: '' }, x.id);
  add('code', { title: 'style.css', text: start('css'), input: '' }, x.id);
  add('code', { title: 'script.js', text: PAGE_SCRIPT, input: '' }, x.id);
  save(true);
  history.pushState(null, '', linkTo(x));
  browse(x.id, true);
}

// ---------- dragging cards, and files from your computer ----------
let dragging = null;                                // the folder or thing whose card is being dragged
function dragFrom(card, x) {
  card.addEventListener('dragstart', (e) => {
    dragging = x;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', x.title || 'Untitled');
    requestAnimationFrame(() => card.classList.add('dragging'));
  });
  card.addEventListener('dragend', () => {
    dragging = null;
    card.classList.remove('dragging');
    for (const n of main.querySelectorAll('.drop')) n.classList.remove('drop');
  });
}
const hasFiles = (e) => [...(e.dataTransfer?.types || [])].includes('Files');
// a folder's card, a name in the path, or the open folder itself takes a card dropped on it (or files)
function dropOn(target, id) {
  const ok = (e) => (dragging ? canMove(dragging, id) : hasFiles(e));
  target.addEventListener('dragover', (e) => {
    if (!ok(e)) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = dragging ? 'move' : 'copy';
    target.classList.add('drop');
  });
  target.addEventListener('dragleave', (e) => { if (!target.contains(e.relatedTarget)) target.classList.remove('drop'); });
  target.addEventListener('drop', (e) => {
    if (!ok(e)) return;
    e.preventDefault();
    e.stopPropagation();
    target.classList.remove('drop');
    const x = dragging;
    dragging = null;
    if (x) moveTo(x, id); else addFiles(e.dataTransfer.files, id);
  });
}
// files from your computer, as things in this space: notes from text or Markdown, sheets from CSV (and docs from other
// text) in Data, and code files as they are. Anything over 2 MB, or that isn't text, stays out
async function addFiles(list, id) {
  let added = 0, left = 0;
  for (const file of [...list].slice(0, 100)) {
    const text = file.size <= 2_000_000 ? await file.text().catch(() => '\u0000') : '\u0000';
    if (text.includes('\u0000')) { left++; continue; }
    const base = file.name.replace(/\.[^.]+$/, '') || file.name;
    if (tab === 'notes') add('note', { title: base, text }, id);
    else if (tab === 'code') add('code', { title: unique(id, file.name, true), text, input: '' }, id);
    else if (/\.(csv|tsv)$/i.test(file.name) && parseCsv(text).length) sheetFrom(base, parseCsv(text), id);
    else add('doc', { title: base, text, link: '' }, id);
    added++;
  }
  if (added) save(true);
  if (!current) drawBrowse(false);
  tell([added ? `Added ${plural(added, 'file')}.` : '', left ? `${plural(left, 'file')} couldn’t come in: only text, 2 MB at most.` : ''].filter(Boolean).join(' '));
}
// a word at the top of what's open (no pop-ups here)
function tell(text) {
  if (!text) return;
  const box = main.firstElementChild;
  box?.querySelector(':scope > .confirm')?.remove();
  const msg = el('div', { className: 'confirm', role: 'status' }, el('span', {}, text), el('span', { className: 'grow' }), el('button', { type: 'button', className: 'btn', onclick: () => msg.remove() }, 'OK'));
  (box?.querySelector(':scope > .b-head, :scope > .ed-head') || box?.firstChild)?.after(msg);
}

// ---------- one thing open: its name, its own tools and editor ----------
// a text box as tall as what's in it (the pane scrolls, not the box), without the pane jumping while it's measured
function fit(t) {
  if (!t.isConnected || t.hidden) return;
  const top = main.scrollTop;
  t.style.height = 'auto';
  t.style.height = `${t.scrollHeight + t.offsetHeight - t.clientHeight}px`;
  main.scrollTop = top;
}
// typing into a text box the way the keyboard would (so Undo still works)
function insert(t, text) {
  if (!document.execCommand('insertText', false, text)) {
    t.setRangeText(text, t.selectionStart, t.selectionEnd, 'end');
    t.dispatchEvent(new Event('input'));
  }
}
const label = (b, icon, text) => b.replaceChildren(svg(icon), el('span', {}, text));
function drawEditor(it, fresh, naming) {
  hooks = {};
  const K = KINDS[it.kind], top = main.scrollTop;
  const title = el('input', { className: 'ed-title', value: it.title, placeholder: 'Untitled', spellcheck: false, 'aria-label': 'Name',
    oninput: () => { it.title = title.value; touch(it); hooks.title?.(); setTitle(); },
    onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); hooks.focus?.(); } } });
  const actions = el('div', { className: 'ed-actions' });
  const head = el('div', { className: 'ed-head' }, el('span', { className: 'ed-ic' }, svg(K.icon)), title, actions);
  const calm = () => actions.replaceChildren(saved,
    el('button', { type: 'button', className: 'icon-btn', title: 'Move', 'aria-label': `Move this ${K.name.toLowerCase()}`, onclick: () => moveBox(it, head) }, svg('move')),
    el('button', { type: 'button', className: 'icon-btn only-narrow', title: 'Details', 'aria-label': 'Details', onclick: () => ws.classList.toggle('details') }, svg('panel')),
    el('button', { type: 'button', className: 'icon-btn danger', title: 'Delete', 'aria-label': `Delete this ${K.name.toLowerCase()}`, onclick: () => actions.replaceChildren(
      el('span', { className: 'ask' }, `Delete this ${K.name.toLowerCase()}?`),
      el('button', { type: 'button', className: 'btn danger', onclick: () => remove(it) }, 'Delete'),
      el('button', { type: 'button', className: 'btn', onclick: calm }, 'Keep')) }, svg('trash')));
  calm();
  const box = el('div', { className: 'editor-in' + (fresh ? ' enter' : '') }, head, ...EDIT[it.kind](it, head));
  box.style.setProperty('--k', K.color);
  main.replaceChildren(box);
  main.scrollTop = fresh ? 0 : top;
  hooks.after?.();
  if (naming) { title.focus(); title.select(); }
}

const EDIT = {
  note(it) {
    let mode = modes.get(it.id) || (it.text.trim() ? 'read' : 'edit');
    const seg = el('div', { className: 'seg', role: 'group', 'aria-label': 'Edit or preview' });
    const text = el('textarea', { className: 'write', value: it.text, 'aria-label': 'Note', placeholder: 'Write in Markdown: # for a heading, - for a list, [[a note’s name]] to link to it.',
      oninput: () => { it.text = text.value; fit(text); touch(it); } });
    const view = el('div', { className: 'md', onclick: (e) => {
      const wiki = e.target.closest('a.wiki');
      if (wiki) { e.preventDefault(); return openTitle(wiki.dataset.name); }
      const tick = e.target.closest('input[type=checkbox][data-line]');
      if (tick) {
        const lines = it.text.split('\n'), n = +tick.dataset.line;
        lines[n] = lines[n].replace(/\[( |x|X)\]/, tick.checked ? '[x]' : '[ ]');
        it.text = text.value = lines.join('\n');
        touch(it);
      }
    } });
    const show = (m) => {
      mode = m;
      modes.set(it.id, m);
      for (const b of seg.children) b.classList.toggle('on', b.dataset.m === m);
      text.hidden = m !== 'edit';
      view.hidden = m === 'edit';
      if (m === 'edit') fit(text); else view.innerHTML = markdown(it.text);
    };
    seg.append(el('button', { type: 'button', 'data-m': 'edit', onclick: () => { show('edit'); text.focus(); } }, 'Edit'),
      el('button', { type: 'button', 'data-m': 'read', onclick: () => show('read') }, 'Preview'));
    hooks.after = () => show(mode);
    hooks.focus = () => { show('edit'); text.focus(); };
    // the outline's headings: in Edit, the cursor goes to the line; in Preview, the heading scrolls into view
    hooks.goto = (line) => {
      if (mode === 'read') return view.querySelector(`[data-line="${line}"]`)?.scrollIntoView({ behavior: moving() ? 'smooth' : 'auto', block: 'start' });
      const at = it.text.split('\n').slice(0, line).join('\n').length + (line ? 1 : 0);
      text.focus();
      text.setSelectionRange(at, at);
    };
    return [el('div', { className: 'ed-tools' }, seg), text, view];
  },

  doc(it) {
    const go = el('a', { className: 'btn', target: '_blank', rel: 'noopener' }, svg('external'), el('span'));
    const sync = () => {
      const ok = /^https?:\/\/\S+$/.test(it.link);
      go.hidden = !ok;
      if (ok) { go.href = it.link; go.lastChild.textContent = `Open the ${linkKind(it.link)}`; }
    };
    const link = el('input', { className: 'input', type: 'url', value: it.link, 'aria-label': 'Link', placeholder: 'Paste a Google Docs, Slides or Sheets link, or any web address',
      oninput: () => { it.link = link.value.trim(); sync(); touch(it); } });
    const text = el('textarea', { className: 'write', value: it.text, 'aria-label': 'Doc', placeholder: 'Write your essay or research here.',
      oninput: () => { it.text = text.value; fit(text); touch(it); } });
    sync();
    hooks.after = () => fit(text);
    hooks.focus = () => text.focus();
    return [el('div', { className: 'ed-tools link-row' }, svg('link'), link, go), text];
  },

  table(it) {
    const grid = el('table', { className: 'grid' });
    const file = el('input', { type: 'file', hidden: true, accept: '.csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain', onchange: () => { if (file.files[0]) importTable(file.files[0], it.parent); file.value = ''; } });
    const cellAt = (r, c) => grid.querySelector(`tbody tr:nth-child(${r + 1}) td:nth-child(${c + 2}) input`);
    let added = -1;                                 // (the row just added, which slides in)
    const addRow = () => { it.rows.push(it.cols.map(() => '')); added = it.rows.length - 1; touch(it); draw(); added = -1; };
    const addCol = () => { it.cols.push(columnName(it.cols)); it.rows.forEach((row) => row.push('')); touch(it); draw(); grid.querySelector('thead th:last-child input')?.select(); };
    const draw = () => grid.replaceChildren(
      el('thead', {}, el('tr', {}, el('th', { className: 'num' }), it.cols.map((name, c) => el('th', {},
        el('input', { value: name, 'aria-label': `Column ${c + 1}'s name`, oninput: (e) => { it.cols[c] = e.target.value; touch(it); } }),
        it.cols.length > 1 ? el('button', { type: 'button', className: 'kill', title: 'Delete this column', 'aria-label': `Delete column ${c + 1}`, onclick: () => {
          it.cols.splice(c, 1);
          it.rows.forEach((row) => row.splice(c, 1));
          touch(it);
          draw();
        } }, svg('x')) : null)))),
      el('tbody', {}, it.rows.map((row, r) => el('tr', { className: r === added ? 'new' : '' },
        el('td', { className: 'num' }, el('span', {}, String(r + 1)), el('button', { type: 'button', className: 'kill', title: 'Delete this row', 'aria-label': `Delete row ${r + 1}`, onclick: () => { it.rows.splice(r, 1); touch(it); draw(); } }, svg('x'))),
        row.map((value, c) => el('td', {}, el('input', { value, 'aria-label': `Row ${r + 1}, ${it.cols[c] || `column ${c + 1}`}`,
          oninput: (e) => { it.rows[r][c] = e.target.value; touch(it); },
          onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); if (r === it.rows.length - 1) addRow(); cellAt(r + 1, c)?.focus(); } } })))))));
    draw();
    hooks.focus = () => cellAt(0, 0)?.focus();
    return [el('div', { className: 'ed-tools' },
      el('button', { type: 'button', className: 'btn', onclick: () => { addRow(); cellAt(it.rows.length - 1, 0)?.focus(); } }, svg('plus'), 'Row'),
      el('button', { type: 'button', className: 'btn', onclick: addCol }, svg('plus'), 'Column'),
      el('span', { className: 'grow' }),
      el('button', { type: 'button', className: 'btn', onclick: () => file.click() }, svg('upload'), 'Import CSV'),
      el('button', { type: 'button', className: 'btn', onclick: () => download(`${it.title.trim() || 'sheet'}.csv`, toCsv([it.cols, ...it.rows]), 'text/csv') }, svg('download'), 'Export CSV'),
      file),
    el('div', { className: 'table-wrap' }, grid)];
  },

  // a code file: its words in color (a pre with the colors under a text box you type in), the language to pick, and
  // Run, Preview, Copy and Download, each where it makes sense for the language
  code(it, head) {
    const name = head.querySelector('.ed-title'), ic = head.querySelector('.ed-ic');
    const gutter = el('pre', { className: 'gutter', 'aria-hidden': 'true' });
    const colors = el('pre', { className: 'hl', 'aria-hidden': 'true' });
    const out = el('div', { className: 'out', hidden: true, 'aria-live': 'polite' });
    const frame = el('iframe', { className: 'frame', hidden: true, title: 'Preview' });
    frame.setAttribute('sandbox', 'allow-scripts allow-forms allow-modals allow-popups');
    const showing = el('p', { className: 'runs-note', hidden: true });
    const note = el('p', { className: 'runs-note', hidden: true });
    const input = el('textarea', { className: 'input stdin', value: it.input, rows: 2, spellcheck: false, 'aria-label': 'Input', placeholder: 'What input() reads, a line at a time',
      oninput: () => { it.input = input.value; touch(it); } });
    const inputBox = el('label', { className: 'stdin-box', hidden: true }, el('span', {}, 'Input'), input);
    let L = langOf(it.title), viewing = false, later = 0;
    const number = () => { gutter.textContent = Array.from({ length: it.text.split('\n').length }, (_, i) => i + 1).join('\n'); };
    const color = () => { colors.innerHTML = `${paint(it.text, L.like)}\n`; };
    const text = el('textarea', { className: 'code', value: it.text, wrap: 'off', spellcheck: false, autocomplete: 'off', autocapitalize: 'off', 'aria-label': 'Code',
      oninput: () => { it.text = text.value; number(); color(); fit(text); touch(it); clearTimeout(later); if (viewing) later = setTimeout(show, 500); },
      onscroll: () => { colors.style.translate = `${-text.scrollLeft}px 0`; },
      onkeydown: (e) => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        // Tab puts spaces in, and a new line starts as far in as the one before it (and one step further after a line
        // that opens a block: a { or a ( in most languages, a : in Python)
        if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); insert(text, indent(L.like)); }
        else if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          const line = text.value.slice(0, text.selectionStart).split('\n').pop();
          const opens = L.like === 'py' ? /:\s*$/.test(line) : L.like && L.like !== 'html' && /[{([]\s*$/.test(line);
          insert(text, `\n${/^[ \t]*/.exec(line)[0]}${opens ? indent(L.like) : ''}`);
        }
      } });
    const pick = el('select', { className: 'input lang-pick', 'aria-label': 'Language', onchange: () => {
      if (!own(LANGS, pick.value)) return;
      const ext = /\.[a-z0-9+]+$/i;
      it.title = ext.test(it.title.trim()) ? it.title.trim().replace(ext, `.${pick.value}`) : `${it.title.trim() || LANGS[pick.value].file}.${pick.value}`;
      name.value = it.title;
      touch(it);
      setTitle();
      tools();
    } });
    const run = el('button', { type: 'button', className: 'btn', onclick: () => {
      if (L.runs === 'py' && pythonRunning()) return stopPython();
      hide();
      if (L.runs !== 'py') return runJs(it.text, out);
      label(run, 'stop', 'Stop');
      runPython(it.text, it.input, out, it.title.trim() || 'main.py', () => label(run, 'play', 'Run'));
    } }, svg('play'), el('span', {}, 'Run'));
    const look = el('button', { type: 'button', className: 'btn', onclick: () => (viewing ? hide() : show()) }, svg('eye'), el('span', {}, 'Preview'));
    const copy = el('button', { type: 'button', className: 'btn', onclick: async () => {
      try { await navigator.clipboard.writeText(it.text); copy.lastChild.textContent = 'Copied'; } catch { copy.lastChild.textContent = "Couldn't copy"; }
      setTimeout(() => { copy.lastChild.textContent = 'Copy'; }, 1500);
    } }, svg('copy'), el('span', {}, 'Copy'));
    const down = el('button', { type: 'button', className: 'btn', onclick: () => download(it.title.trim() || 'untitled.txt', it.text, 'text/plain') }, svg('download'), el('span', {}, 'Download'));
    // Preview: the page this file is (or is on) in a sandboxed frame, again a moment after each change while it's open
    function show() {
      const page = pageOf(it);
      if (!page) return hide();
      viewing = true;
      label(look, 'eye', 'Hide preview');
      showing.hidden = page.of === it;
      showing.textContent = page.of ? `Showing ${page.of.title}, the page that uses this file.` : 'Showing a sample page with this file’s styles.';
      preview(frame, out, pageFrom(page.html, (path) => fileAt(page.from, path)?.text ?? null));
    }
    function hide() {
      viewing = false;
      frame.hidden = showing.hidden = true;
      frame.removeAttribute('srcdoc');
      label(look, 'eye', 'Preview');
    }
    // what the language allows: its badge, Run (JavaScript and Python), Preview (a page, or a file a page uses), Input
    // (Python), and a word on where the others run
    function tools() {
      L = langOf(it.title);
      ic.replaceChildren(badge(L));
      pick.replaceChildren(...(L.id ? [] : [el('option', { value: '' }, L.name)]), ...Object.entries(LANGS).map(([id, x]) => el('option', { value: id }, x.name)));
      pick.value = L.id;
      const page = !!pageOf(it);
      run.hidden = L.runs !== 'js' && L.runs !== 'py';
      look.hidden = !page;
      run.classList.toggle('primary', !page);
      look.classList.toggle('primary', page);
      inputBox.hidden = L.runs !== 'py';
      const file = it.title.trim(), base = file.replace(/\.[^.]+$/, '') || 'main';
      note.textContent = L.id === 'java' ? `Java runs on a computer with Java on it: Download, then javac ${file} and java ${base}.`
        : L.id === 'cpp' ? `C++ runs on a computer with a compiler: Download, then g++ ${file} -o ${base} and ./${base}.`
          : L.runs || page ? '' : `${L.name} doesn’t run here: Download it to run it on a computer.`;
      note.hidden = !note.textContent;
      if (viewing && !page) hide();
      color();
    }
    number();
    tools();
    hooks.title = tools;
    hooks.after = () => fit(text);
    hooks.focus = () => text.focus();
    return [el('div', { className: 'ed-tools' }, pick, el('span', { className: 'grow' }), look, run, copy, down), note,
      el('div', { className: 'code-wrap' }, gutter, el('div', { className: 'code-in' }, colors, text)), inputBox, showing, frame, out];
  },
};

// a file in Code by its path from a folder ('style.css', 'css/site.css', '../shared/app.js'), as a page links it
function fileAt(from, path) {
  if (/^(?:[a-z][\w+.-]*:|\/\/|#)/i.test(path)) return null;     // (a web address, or a place on the page)
  let here = path.startsWith('/') ? '' : from, parts;
  try { parts = decodeURIComponent(path.split(/[?#]/)[0]).split('/').filter((p) => p && p !== '.'); } catch { return null; }
  for (const part of parts.slice(0, -1)) {
    if (part === '..') { here = folderById(here)?.parent ?? ''; continue; }
    const next = folders.find((x) => x.tab === 'code' && x.parent === here && x.title.trim() === part);
    if (!next) return null;
    here = next.id;
  }
  const last = parts.at(-1);
  return (last && items.find((x) => x.kind === 'code' && x.parent === here && x.title.trim() === last)) || null;
}
// what Preview shows for a file: an HTML page itself, or a page that uses this CSS or JavaScript file (one in its
// folder first), and for a CSS file no page uses, a sample one
function pageOf(it) {
  const L = langOf(it.title);
  if (L.like === 'html') return { html: it.text, from: it.parent, of: it };
  if (L.like !== 'css' && L.like !== 'js') return null;
  const uses = (page) => [...page.text.matchAll(/<(?:link|script)\b[^>]*?\b(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)].some((m) => fileAt(page.parent, m[1] ?? m[2] ?? m[3]) === it);
  const pages = items.filter((x) => x.kind === 'code' && langOf(x.title).like === 'html');
  const page = pages.find((x) => x.parent === it.parent && uses(x)) || pages.find(uses);
  if (page) return { html: page.text, from: page.parent, of: page };
  return L.like === 'css' ? { html: SAMPLE(it.title.trim()), from: it.parent } : null;
}

// ---------- the right side: what's in the open thing ----------
const facts = (rows) => el('dl', { className: 'facts' }, rows.flatMap(([k, v]) => [el('dt', {}, k), el('dd', {}, String(v))]));
const none = (text) => el('p', { className: 'none' }, text);
const fmt = (v) => v.toLocaleString('en-US', { maximumFractionDigits: 2 });
const when = (t) => new Date(t).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const wordCount = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0);
// a [[link]]: the note or doc with that name (in any folder), or a new note with it, beside the one it's in
const named = (name) => { const key = name.trim().toLowerCase(); return items.find((x) => (x.kind === 'note' || x.kind === 'doc') && x.title.trim().toLowerCase() === key); };
function openTitle(name) {
  const it = named(name);
  if (it) location.href = linkTo(it);
  else make('note', { title: name.trim() }, byId(current)?.parent ?? at, true);
}
// the notes and docs whose text links here
function linkedFrom(it) {
  const name = it.title.trim().toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!name) return [];
  const find = new RegExp(`\\[\\[\\s*${name}\\s*(\\||\\]\\])`, 'i');
  return items.filter((x) => x !== it && (x.kind === 'note' || x.kind === 'doc') && find.test(x.text)).sort((a, b) => b.edited - a.edited);
}
function drawInfo() {
  const it = byId(current);
  if (!it) { info.replaceChildren(); return; }
  const where = [nameOf(tab), ...pathTo(it.parent).map((x) => x.title || 'Untitled')].join(' › ');
  info.replaceChildren(...INFO[it.kind](it).filter(Boolean), el('h3', {}, 'About'), facts([['In', where], ['Made', when(it.made)], ['Edited', when(it.edited)]]));
}
const RUNS = {
  js: 'Here, with Run: in a worker of its own (no page to change), for 5 seconds at most.',
  py: 'Here, with Run: Python from Pyodide, which downloads the first time. input() reads the Input box.',
  page: 'Here, with Preview: in a sandboxed frame, with the CSS and JavaScript files it links.',
};
const INFO = {
  note(it) {
    const heads = [...it.text.matchAll(/^(#{1,6})[ \t]+(.+)$/gm)].map((m) => ({ level: m[1].length, text: m[2].trim(), line: it.text.slice(0, m.index).split('\n').length - 1 }));
    const outs = [...new Set([...it.text.matchAll(/\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)].map((m) => m[1].trim()).filter(Boolean))];
    const ins = linkedFrom(it);
    return [
      el('h3', {}, 'Outline'),
      heads.length ? el('ul', { className: 'links outline' }, heads.map((h) => {
        const b = el('button', { type: 'button', onclick: () => hooks.goto?.(h.line) }, h.text);
        b.style.setProperty('--lvl', h.level - 1);
        return el('li', {}, b);
      })) : none('Headings (# like this) show here.'),
      el('h3', {}, 'Links'),
      outs.length ? el('ul', { className: 'links' }, outs.map((name) => el('li', {}, el('button', { type: 'button', className: named(name) ? '' : 'new', title: named(name) ? '' : 'Not made yet: opening it makes it', onclick: () => openTitle(name) }, svg('link'), name))))
        : none('[[A note’s name]] links to it.'),
      el('h3', {}, 'Linked from'),
      ins.length ? el('ul', { className: 'links' }, ins.map((x) => el('li', {}, el('a', { href: linkTo(x) }, svg(KINDS[x.kind].icon), x.title || 'Untitled')))) : none('Nothing links here yet.'),
      el('h3', {}, 'Size'),
      facts([['Words', wordCount(it.text).toLocaleString('en-US')], ['Characters', it.text.length.toLocaleString('en-US')]]),
    ];
  },
  doc(it) {
    const words = wordCount(it.text), ins = linkedFrom(it);
    return [
      el('h3', {}, 'Size'),
      facts([['Words', words.toLocaleString('en-US')], ['Characters', it.text.length.toLocaleString('en-US')], ['Reading time', `${Math.max(1, Math.round(words / 220))} min`]]),
      el('h3', {}, 'Link'),
      /^https?:\/\//.test(it.link) ? el('ul', { className: 'links' }, el('li', {}, el('a', { href: it.link, target: '_blank', rel: 'noopener' }, svg('external'), new URL(it.link).hostname))) : none('No link yet.'),
      ins.length ? el('h3', {}, 'Linked from') : null,
      ins.length ? el('ul', { className: 'links' }, ins.map((x) => el('li', {}, el('a', { href: linkTo(x) }, svg(KINDS[x.kind].icon), x.title || 'Untitled')))) : null,
    ];
  },
  table(it) {
    const columns = it.cols.map((name, c) => ({ name: name.trim() || `Column ${c + 1}`, nums: it.rows.map((r) => number(r[c])).filter((v) => v != null) })).filter((x) => x.nums.length);
    return [
      el('h3', {}, 'Size'),
      facts([['Rows', it.rows.length.toLocaleString('en-US')], ['Columns', it.cols.length]]),
      ...columns.flatMap((x, i) => {
        const sum = x.nums.reduce((a, b) => a + b, 0), lo = x.nums.reduce((a, b) => Math.min(a, b)), hi = x.nums.reduce((a, b) => Math.max(a, b));
        return [el('h3', {}, x.name), facts([['Numbers', x.nums.length], ['Lowest', fmt(lo)], ['Highest', fmt(hi)], ['Average', fmt(sum / x.nums.length)], ['Total', fmt(sum)]]), i === 0 ? bars(x.nums) : null];
      }),
      columns.length ? null : none('A column of numbers shows its lowest, highest, average and total here.'),
    ];
  },
  code(it) {
    const L = langOf(it.title), runs = RUNS[pageOf(it) && L.runs !== 'py' && L.runs !== 'js' ? 'page' : L.runs];
    return [el('h3', {}, 'File'), facts([['Language', L.name], ['Lines', it.text.split('\n').length.toLocaleString('en-US')], ['Characters', it.text.length.toLocaleString('en-US')]]),
      el('h3', {}, 'Runs'), none(runs || 'On a computer: Download it, then build and run it there.')];
  },
};
// a cell as a number (1,250 and 12.5% count), or null
function number(v) {
  const t = String(v ?? '').trim().replace(/[,\s]/g, '').replace(/%$/, '');
  return /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(t) ? parseFloat(t) : null;
}
function bars(nums) {
  const some = nums.slice(0, 30), top = some.reduce((a, b) => Math.max(a, Math.abs(b)), 0) || 1;
  return el('div', { className: 'minibars', 'aria-hidden': 'true' }, some.map((v, i) => {
    const b = el('span', { style: `height:${Math.max(3, Math.round((100 * Math.abs(v)) / top))}%` });
    b.style.animationDelay = `calc(${i * 25}ms / var(--speed))`;
    return b;
  }));
}

// ---------- Markdown (what Preview shows): headings, lists and to-dos, quotes, code, links and [[links]] ----------
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const unesc = (s) => s.replace(/&(amp|lt|gt|quot);/g, (m, e) => ({ amp: '&', lt: '<', gt: '>', quot: '"' })[e]);
function inline(text) {
  return text.split(/(`[^`]+`)/).map((part, i) => (i % 2 ? `<code>${esc(part.slice(1, -1))}</code>` : esc(part)
    .replace(/\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g, (m, name, shown) => `<a href="#" class="wiki${named(unesc(name)) ? '' : ' new'}" data-name="${name.trim()}">${(shown || name).trim()}</a>`)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/(^|[\s(])[*_](?!\s)(.+?)[*_](?=[\s).,!?:;]|$)/g, '$1<i>$2</i>')
    .replace(/~~(.+?)~~/g, '<s>$1</s>')
    .replace(/(^|\s)#([\p{L}\p{N}_/-]+)/gu, '$1<span class="tag">#$2</span>'))).join('');
}
function markdown(src) {
  const lines = String(src || '').replace(/\r\n?/g, '\n').split('\n'), out = [];
  let para = [], list = null;
  const endPara = () => { if (para.length) out.push(`<p>${para.map(inline).join('<br>')}</p>`); para = []; };
  const endList = () => { if (list) out.push(`</${list}>`); list = null; };
  const inList = (kind, cls = '') => { endPara(); if (list !== kind) { endList(); out.push(`<${kind}${cls ? ` class="${cls}"` : ''}>`); list = kind; } };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let m;
    if (/^```/.test(line)) {
      endPara(); endList();
      const code = [];
      while (++i < lines.length && !/^```/.test(lines[i])) code.push(lines[i]);
      out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`);
    } else if ((m = /^(#{1,6})[ \t]+(.*)$/.exec(line))) { endPara(); endList(); out.push(`<h${m[1].length} data-line="${i}">${inline(m[2])}</h${m[1].length}>`); }
    else if (/^ {0,3}([-*_])( *\1){2,} *$/.test(line)) { endPara(); endList(); out.push('<hr>'); }
    else if ((m = /^>\s?(.*)$/.exec(line))) { endPara(); endList(); out.push(`<blockquote>${inline(m[1])}</blockquote>`); }
    else if ((m = /^\s*[-*+]\s+\[([ xX])\]\s+(.*)$/.exec(line))) { inList('ul', 'tasks'); out.push(`<li><input type="checkbox" data-line="${i}"${m[1] === ' ' ? '' : ' checked'} aria-label="${esc(m[2])}">${inline(m[2])}</li>`); }
    else if ((m = /^\s*[-*+]\s+(.*)$/.exec(line))) { inList('ul'); out.push(`<li>${inline(m[1])}</li>`); }
    else if ((m = /^\s*\d+[.)]\s+(.*)$/.exec(line))) { inList('ol'); out.push(`<li>${inline(m[1])}</li>`); }
    else if (!line.trim()) { endPara(); endList(); }
    else { endList(); para.push(line); }
  }
  endPara();
  endList();
  return out.join('') || '<p class="empty">Nothing here yet. Edit to write something.</p>';
}

// ---------- sheets: CSV in and out ----------
// (the separator is whichever of comma, tab or semicolon the first line has most of)
function parseCsv(text) {
  const first = text.split('\n', 1)[0], sep = [',', '\t', ';'].reduce((a, b) => (first.split(b).length > first.split(a).length ? b : a));
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) { if (ch !== '"') cell += ch; else if (text[i + 1] === '"') { cell += '"'; i++; } else quoted = false; }
    else if (ch === '"' && cell === '') quoted = true;
    else if (ch === sep) { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  const kept = rows.filter((r) => r.some((c) => c.trim() !== '')), width = kept.reduce((w, r) => Math.max(w, r.length), 1);
  return kept.map((r) => Array.from({ length: width }, (_, c) => r[c] ?? ''));
}
const toCsv = (rows) => rows.map((r) => r.map((c) => (/[",\n\r]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(',')).join('\n') + '\n';
function columnName(cols) {
  const name = (n) => (n >= 26 ? name(Math.floor(n / 26) - 1) : '') + String.fromCharCode(65 + (n % 26));
  for (let n = cols.length; ; n++) if (!cols.includes(name(n))) return name(n);
}
// a sheet from a CSV's rows: the first is the column names
function sheetFrom(title, rows, parent) {
  const [head, ...rest] = rows;
  return add('table', { title, cols: head.map((c, i) => c.trim() || columnName(head.slice(0, i))), rows: rest }, parent);
}
async function importTable(file, parent) {
  if (file.size > 2_000_000) return tell(`${file.name} is too big to keep in this browser (2 MB at most).`);
  const rows = parseCsv(await file.text());
  if (!rows.length) return tell(`${file.name} has nothing in it to make a sheet from.`);
  const it = sheetFrom(file.name.replace(/\.(csv|tsv|txt)$/i, ''), rows, parent);
  save(true);
  history.pushState(null, '', linkTo(it));
  open(it, true);
}
function download(name, text, type) {
  const a = el('a', { href: URL.createObjectURL(new Blob([text], { type })), download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// ---------- saving to GitHub, when it's connected ----------
// a sync when the page opens, a few seconds after each change (save() asks), when you come back to the page after a
// while, and as you leave it; and how it went, beside Find
function showSync(st = github.status()) {
  synced.hidden = !github.connected();
  if (synced.hidden) return;
  synced.className = `sync ${st.status}`;
  synced.lastChild.textContent = st.status === 'syncing' ? 'Saving' : st.status === 'error' ? 'Not saved' : 'Saved';
  synced.title = st.status === 'error' ? `Not saved to GitHub: ${st.error}` : st.status === 'syncing' ? `Saving to ${github.repo()} on GitHub` : `Saved to ${github.repo()} on GitHub${st.at ? `, ${ago(st.at)}` : ''}`;
}
github.listen((what, st) => { if (what === 'changed') reload(); showSync(st); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { flush(); github.run(); }
  else if (Date.now() - (github.status().at || 0) > 60000) github.run();
});

// ---------- start ----------
route();
showSync();
github.run();
