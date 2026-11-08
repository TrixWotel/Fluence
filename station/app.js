// Station: your notes and journal, in folders, linked together. On the left, your folders and notes (and Today, for the
// journal); on the right, the note that's open. A note shows laid out, and the part you click turns back into its
// Markdown to change, so only what you're working on shows its marks. A table's cells change where they are, like a
// sheet. [[ starts a link (and suggests your notes), / at the start of a line offers a heading, a list, a table and
// more, and a picture you paste or drop goes in your images folder. Under a note: every note that links to it, with
// the line it's on, so a journal entry that says "see [[display]]" shows on the display note.
// Links: station/#research/subsystems/power opens that note, #journal/2026-11-07 a day, #today today's, #home the start.
// store.js keeps it all, sync.js puts it on GitHub, and md.js reads and writes the Markdown.
import * as md from './md.js';
import * as store from './store.js';
import * as sync from './sync.js';

const f = window.fluentio, { el, svg } = f;
const frame = document.getElementById('sn');
const UI = 'fluentio.station.ui';
const mac = /Mac|iPhone|iPad/.test(navigator.platform);
const plural = (n, w) => `${n.toLocaleString('en-US')} ${w}${n === 1 ? '' : 's'}`;
const ASK = ['What did you decide today, and why?', 'What did you find out?', 'What are you stuck on?', 'What would you try next?', 'What surprised you today?', 'What changed your mind?'];

let v = store.read();
if (store.bringJournal(v)) store.write(v);
const ui = (() => { const u = f.read(UI); return { open: new Set(Array.isArray(u?.open) ? u.open : ['research']), last: typeof u?.last === 'string' ? u.last : '' }; })();
const keepUi = () => f.write(UI, { open: [...ui.open], last: ui.last });

// ---------- saving ----------
let saveTimer = 0, dirty = false;
const saved = el('span', { className: 'sn-saved', 'aria-live': 'polite' });
function flush() {
  clearTimeout(saveTimer);
  if (!dirty) return true;
  dirty = false;
  const ok = store.write(v);
  saved.textContent = ok ? '' : 'Couldn’t save: this browser’s storage is full';
  saved.className = `sn-saved${ok ? '' : ' bad'}`;
  if (ok) sync.soon();
  return ok;
}
function touched(n) {
  if (n) n.edited = Date.now();
  dirty = true;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 250);
}
const syncNow = () => { flush(); return sync.run(); };
addEventListener('pagehide', flush);
addEventListener('fluence:going', syncNow);
document.addEventListener('visibilitychange', () => { if (document.hidden) syncNow(); else if (Date.now() - (sync.status().at || 0) > 60000) syncNow(); });
// (GitHub's changes go into this page's copy, not one in storage that could be older, and never into the note you're typing in)
sync.use({ get: () => v, put: () => touched(), busy: (path) => ed?.n.path === path || cellEd?.n.path === path });

// ---------- the frame: your notes on the left, the open one on the right ----------
const side = el('aside', { className: 'sn-side', 'aria-label': 'Your notes' });
const pane = el('section', { className: 'sn-pane' });
const findBox = el('input', { className: 'input sn-find', type: 'search', placeholder: 'Find in your notes', 'aria-label': 'Find in your notes', autocomplete: 'off', spellcheck: false });
const tree = el('nav', { className: 'sn-tree', 'aria-label': 'Folders and notes' });
const syncLine = el('p', { className: 'sn-sync' });
const todayLink = el('a', { className: 'sn-row sn-today', href: '#today' }, svg('calendar'), el('span', { className: 'sn-label' }, 'Today'), el('small', {}, ''));
const button = (icon, text, onclick, cls = '') => el('button', { type: 'button', className: `sn-btn ${cls}`.trim(), onclick }, icon ? svg(icon) : null, text ? el('span', {}, text) : null);
side.append(
  el('div', { className: 'sn-side-top' }, findBox, todayLink),
  tree,
  el('div', { className: 'sn-side-foot' }, el('div', { className: 'sn-makers' },
    button('plus', 'Note', () => newNote(here())), button('folder', 'Folder', () => newFolder(here()))), syncLine));
const toggleSide = el('button', { type: 'button', className: 'sn-icon sn-only-narrow', title: 'Your notes', 'aria-label': 'Your notes', onclick: () => frame.classList.toggle('side-open') }, svg('panel'));
frame.replaceChildren(side, pane);

// the frame fills the window under the heading, down to the player if there is one
let fitted = 0;
function fit() {
  const player = document.getElementById('music-bar'), bottom = player && !player.hidden ? player.getBoundingClientRect().top - 14 : innerHeight - 20;
  const h = Math.round(Math.max(420, bottom - (frame.getBoundingClientRect().top + scrollY)));
  if (h !== fitted) { fitted = h; frame.style.setProperty('--sn-h', `${h}px`); }
}
fit();
addEventListener('resize', fit, { passive: true });
addEventListener('load', fit);
new MutationObserver(fit).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

// ---------- names ----------
const thisYear = new Date().getFullYear();
const dayWords = (k, long) => { const d = store.dateOf(k); return d.toLocaleDateString('en-US', { weekday: long ? 'long' : 'short', month: long ? 'long' : 'short', day: 'numeric', year: d.getFullYear() === thisYear ? undefined : 'numeric' }); };
const noWeekday = (words) => words.replace(/^\w+, /, '');
const isDayNote = (path) => store.dirOf(path) === store.JOURNAL && store.isDay(store.nameOf(path));
const labelOf = (path) => (isDayNote(path) ? dayWords(store.nameOf(path)) : /\.md$/i.test(path) ? store.nameOf(path) : store.fileOf(path));
const hrefOf = (path) => `#${path.replace(/\.md$/i, '').split('/').map(encodeURIComponent).join('/')}`;
const here = () => (open?.path ? store.dirOf(open.path) : '');
const rowOf = (path) => tree.querySelector(`.sn-row[data-path="${CSS.escape(path)}"]`);

// ---------- the list on the left ----------
let dragging = null;
function drawTree() {
  todayLink.lastChild.textContent = noWeekday(dayWords(store.dayKey()));
  todayLink.classList.toggle('on', open?.path === store.dayPath());
  const q = findBox.value.trim().toLowerCase();
  if (q) return drawFound(q);
  const rows = [];
  const walk = (dir, depth) => {
    const { folders, things } = store.listing(v, dir);
    for (const d of folders) {
      const on = ui.open.has(d);
      rows.push(row(d, 'folder', depth, on));
      if (on) walk(d, depth + 1);
    }
    for (const x of things) rows.push(row(x.path, x.text !== undefined ? 'note' : 'file', depth));
  };
  walk('', 0);
  if (!rows.length) rows.push(el('p', { className: 'sn-none' }, 'No notes yet.'));
  tree.replaceChildren(...rows);
}
function row(path, kind, depth, on) {
  const x = kind === 'file' ? store.file(v, path) : null;
  const icon = kind === 'folder' ? svg('folder') : kind === 'note' ? svg(isDayNote(path) ? 'calendar' : 'note') : svg(store.isImage(path) ? 'picture' : 'doc');
  const a = el('a', { className: `sn-row ${kind}${open?.path === path ? ' on' : ''}${on ? ' open' : ''}`, href: kind === 'folder' ? '#' : hrefOf(path), draggable: true, title: x?.local ? 'Kept on this computer only' : '' },
    kind === 'folder' ? el('span', { className: 'sn-chev', 'aria-hidden': 'true' }, svg('chevron')) : null,
    icon, el('span', { className: 'sn-label' }, labelOf(path)),
    x?.local ? el('small', { className: 'sn-local' }, 'here only') : null,
    el('button', { type: 'button', className: 'sn-more', title: 'More', 'aria-label': `More for ${labelOf(path)}`, onclick: (e) => { e.preventDefault(); e.stopPropagation(); menuFor(path, kind, e.currentTarget); } }, '⋯'));
  a.dataset.path = path;
  a.style.setProperty('--d', depth);
  if (kind === 'folder') {
    a.setAttribute('aria-expanded', String(!!on));
    a.addEventListener('click', (e) => { e.preventDefault(); if (ui.open.has(path)) ui.open.delete(path); else ui.open.add(path); keepUi(); drawTree(); });
    dropOn(a, path);
  } else a.addEventListener('click', () => frame.classList.remove('side-open'));
  a.addEventListener('contextmenu', (e) => { e.preventDefault(); menuFor(path, kind, a); });
  a.addEventListener('dragstart', (e) => { dragging = { path, kind }; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', kind === 'note' ? `[[${store.nameOf(path)}]]` : path); a.classList.add('dragging'); });
  a.addEventListener('dragend', () => { dragging = null; a.classList.remove('dragging'); for (const n of tree.querySelectorAll('.drop')) n.classList.remove('drop'); });
  return a;
}
// a folder (or the list itself, for the top) takes a note or folder dropped on it
function dropOn(target, dir) {
  const ok = () => dragging && store.dirOf(dragging.path) !== dir && !(dragging.kind === 'folder' && store.inside(dir, dragging.path));
  target.addEventListener('dragover', (e) => { if (!ok()) return; e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'move'; target.classList.add('drop'); });
  target.addEventListener('dragleave', (e) => { if (!target.contains(e.relatedTarget)) target.classList.remove('drop'); });
  target.addEventListener('drop', (e) => {
    if (!ok()) return;
    e.preventDefault();
    e.stopPropagation();
    target.classList.remove('drop');
    const x = dragging;
    dragging = null;
    moveTo(x.path, x.kind, dir);
  });
}
dropOn(tree, '');
function moveTo(path, kind, dir) {
  commitAll();
  const to = store.join(dir, store.fileOf(path));
  if (store.taken(v, to)) return toast(`There’s already a “${labelOf(path)}” in ${dir ? store.fileOf(dir) : 'the top folder'}.`);
  relocate(path, kind, to);
  if (dir) ui.open.add(dir);
  keepUi();
  draw();
}
// a note, file or folder to a new place (or name), with whatever's open following it
function relocate(path, kind, to) {
  if (kind === 'folder') {
    store.moveFolder(v, path, to);
    ui.open = new Set([...ui.open].map((d) => (store.inside(d, path) ? to + d.slice(path.length) : d)));
    if (open?.path && store.inside(open.path, path)) open.path = to + open.path.slice(path.length);
  } else {
    store.move(v, path, to);
    if (open?.path === path) open.path = to;
    if (undo.has(path)) { undo.set(to, undo.get(path)); undo.delete(path); }
  }
  touched();
  if (open?.path) { ui.last = open.path.replace(/\.md$/i, ''); history.replaceState(null, '', hrefOf(open.path)); }
}
// what Find finds: notes whose name or words have it, each with the line it's on
function drawFound(q) {
  const hits = [];
  for (const n of v.notes) {
    const name = labelOf(n.path).toLowerCase(), inName = name.includes(q) || store.nameOf(n.path).toLowerCase().includes(q);
    const line = n.text.split('\n').find((l) => l.toLowerCase().includes(q));
    if (inName || line) hits.push({ n, line, score: (inName ? 2 : 0) + (name.startsWith(q) ? 1 : 0) });
  }
  hits.sort((a, b) => b.score - a.score || b.n.edited - a.n.edited);
  tree.replaceChildren(...(hits.length ? hits.slice(0, 60).map(({ n, line }) => {
    const words = line ? md.plain(line) : '', at = words.toLowerCase().indexOf(q);
    const bit = at < 0 ? words.slice(0, 80) : `${at > 30 ? '…' : ''}${words.slice(Math.max(0, at - 30), at + q.length + 50)}`;
    const shown = el('small', {}), i = bit.toLowerCase().indexOf(q);
    if (i >= 0) shown.append(bit.slice(0, i), el('mark', {}, bit.slice(i, i + q.length)), bit.slice(i + q.length)); else shown.textContent = bit;
    const a = el('a', { className: `sn-row found${open?.path === n.path ? ' on' : ''}`, href: hrefOf(n.path), onclick: () => frame.classList.remove('side-open') },
      svg(isDayNote(n.path) ? 'calendar' : 'note'), el('span', { className: 'sn-label' }, labelOf(n.path), el('span', { className: 'sn-in' }, store.dirOf(n.path).replace(/\//g, ' › '))), bit ? shown : null);
    a.dataset.path = n.path;
    return a;
  }) : [el('p', { className: 'sn-none' }, `Nothing has “${findBox.value.trim()}” in it.`)]));
}
findBox.addEventListener('input', drawTree);
findBox.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { const first = tree.querySelector('a.found'); if (first) { findBox.value = ''; go(first.getAttribute('href')); } }
  if (e.key === 'Escape' && findBox.value) { e.preventDefault(); e.stopPropagation(); findBox.value = ''; drawTree(); }
});

// ---------- a small menu, for a row or a note ----------
let menuBox = null;
function closeMenu() { menuBox?.remove(); menuBox = null; }
addEventListener('pointerdown', (e) => { if (menuBox && !menuBox.contains(e.target)) closeMenu(); }, true);
addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuBox) { e.preventDefault(); e.stopPropagation(); closeMenu(); } }, true);
function showMenu(anchor, items) {
  closeMenu();
  const box = menuBox = el('div', { className: 'sn-menu', role: 'menu' });
  const fill = (list) => box.replaceChildren(...list.map((it) => it.html ?? el('button', { type: 'button', role: 'menuitem', className: it.danger ? 'danger' : '', onclick: () => it.run(fill) }, it.icon ? svg(it.icon) : null, el('span', {}, it.text))));
  fill(items);
  document.body.append(box);
  const r = anchor.getBoundingClientRect(), w = box.offsetWidth, h = box.offsetHeight;
  box.style.left = `${Math.max(8, Math.min(innerWidth - w - 8, r.right - w))}px`;
  box.style.top = `${r.bottom + h + 6 > innerHeight ? Math.max(8, r.top - h - 4) : r.bottom + 4}px`;
  box.querySelector('button, select')?.focus({ preventScroll: true });
}
function menuFor(path, kind, anchor) {
  const ask = (text, yes, run) => (fill) => fill([{ html: el('p', { className: 'sn-ask' }, text) }, { text: yes, danger: true, run: () => { closeMenu(); run(); } }, { text: 'Keep it', run: closeMenu }]);
  const moves = (fill) => fill([{ html: el('p', { className: 'sn-ask' }, `Move “${labelOf(path)}” to`) },
    ...['', ...v.folders].filter((d) => d !== store.dirOf(path) && !(kind === 'folder' && store.inside(d, path))).map((d) => ({ icon: 'folder', text: d ? d.replace(/\//g, ' › ') : 'The top', run: () => { closeMenu(); moveTo(path, kind, d); } }))]);
  const inIt = store.summary(v, path);
  const items = kind === 'folder' ? [
    { icon: 'note', text: 'New note here', run: () => { closeMenu(); newNote(path); } },
    { icon: 'folder', text: 'New folder here', run: () => { closeMenu(); newFolder(path); } },
    { icon: 'settings', text: 'Rename', run: () => { closeMenu(); renameRow(path, kind); } },
    { icon: 'move', text: 'Move to…', run: moves },
    { icon: 'trash', text: 'Delete', danger: true, run: ask(`Delete “${store.fileOf(path)}”${inIt === 'Empty' ? '' : ` and the ${inIt.replace(' · ', ' and ')} in it`}?`, 'Delete', () => { commitAll(); store.removeFolder(v, path); touched(); if (open?.path && store.inside(open.path, path)) go('#home'); else draw(); }) },
  ] : [
    ...(kind === 'note' ? [{ icon: 'link', text: 'Copy a link to it', run: () => { closeMenu(); copy(`[[${store.nameOf(path)}]]`); } }] : [{ icon: 'download', text: 'Download', run: () => { closeMenu(); download(path); } }]),
    ...(isDayNote(path) ? [] : [{ icon: 'settings', text: 'Rename', run: () => {
      closeMenu();
      const here = open?.path === path && kind === 'note' && (pane.querySelector('input.sn-title') || pane.querySelector('.sn-file'));
      if (here?.select) here.select(); else if (here) renameIn(here, path, kind); else renameRow(path, kind);
    } }]),
    { icon: 'move', text: 'Move to…', run: moves },
    { icon: 'trash', text: 'Delete', danger: true, run: ask(`Delete “${labelOf(path)}”?`, 'Delete', () => { commitAll(); store.remove(v, path); touched(); if (open?.path === path) go('#home'); else draw(); }) },
  ];
  showMenu(anchor, items);
}
async function copy(text) {
  try { await navigator.clipboard.writeText(text); toast(`Copied ${text}. Paste it into any note.`); } catch { toast('Couldn’t copy it.'); }
}
// renaming in the list (or in the line above a note): the name turns into a box to type in
function renameRow(path, kind) { renameIn(rowOf(path), path, kind); }
function renameIn(a, path, kind) {
  const label = a?.querySelector('.sn-label');
  if (!label) return;
  const file = store.fileOf(path), dot = kind === 'file' ? file.lastIndexOf('.') : -1;
  const ext = dot > 0 ? file.slice(dot) : kind === 'note' ? '.md' : '';
  const was = kind === 'note' ? store.nameOf(path) : dot > 0 ? file.slice(0, dot) : file;
  const box = el('input', { className: 'sn-rename', value: was, 'aria-label': 'New name', spellcheck: false });
  label.replaceWith(box);
  a.draggable = false;
  box.focus();
  box.select();
  let done = false;
  const finish = (keep) => {
    if (done) return;
    done = true;
    const name = store.cleanName(box.value);
    if (keep && name && name !== was) rename(path, kind, name + ext); else if (a.classList.contains('sn-row')) drawTree(); else draw();
  };
  box.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); finish(true); } if (e.key === 'Escape') { e.preventDefault(); finish(false); } });
  box.addEventListener('blur', () => finish(true));
  box.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); });
}
function rename(path, kind, name) {
  commitAll();
  const to = store.join(store.dirOf(path), name);
  if (to.toLowerCase() !== path.toLowerCase() && store.taken(v, to)) { toast(`There’s already a “${name.replace(/\.md$/i, '')}” in this folder.`); drawTree(); return false; }
  relocate(path, kind, to);
  keepUi();
  draw();
  return true;
}
function newNote(dir) {
  commitAll();
  const name = store.unique(v, dir, 'Untitled', '.md'), n = store.makeNote(v, store.join(dir, `${name}.md`), '');
  if (dir) ui.open.add(dir);
  touched(n);
  naming = true;
  go(hrefOf(n.path));
}
function newFolder(dir) {
  commitAll();
  const d = store.makeFolder(v, store.join(dir, store.unique(v, dir, 'New folder')));
  ui.open.add(d);
  if (dir) ui.open.add(dir);
  keepUi();
  touched();
  drawTree();
  renameRow(d, 'folder');
}
function download(path) {
  const x = store.file(v, path);
  if (!x) return;
  store.getBlob(x.id).then((blob) => {
    if (!blob) return toast('That file isn’t in this browser any more.');
    const a = el('a', { href: URL.createObjectURL(blob), download: store.fileOf(path) });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  });
}

// ---------- a word at the bottom, now and then ----------
const toastBox = el('div', { className: 'sn-toast', role: 'status', hidden: true });
function toast(text, action) {
  toastBox.replaceChildren(el('span', {}, text), action ? el('button', { type: 'button', onclick: () => { toastBox.hidden = true; action.run(); } }, action.text) : '');
  toastBox.hidden = false;
  clearTimeout(toastBox.timer);
  toastBox.timer = setTimeout(() => { toastBox.hidden = true; }, action ? 7000 : 4500);
}

// ---------- pictures ----------
const urls = new Map();       // a file's id → the address its picture shows from
async function urlOf(x) {
  if (urls.has(x.id)) return urls.get(x.id);
  const blob = await store.getBlob(x.id), url = blob ? URL.createObjectURL(blob) : '';
  if (url) urls.set(x.id, url);
  return url;
}
function loadPictures(box) {
  for (const img of box.querySelectorAll('img[data-file]')) {
    const x = store.file(v, img.dataset.file);
    if (!x) continue;
    urlOf(x).then((url) => { if (url) img.src = url; else img.replaceWith(el('span', { className: 'sn-missing' }, `${store.fileOf(x.path)} isn’t in this browser yet`)); });
  }
}
function bigPicture(src, alt) {
  const box = el('div', { className: 'sn-big', role: 'dialog', 'aria-label': alt || 'Picture', onclick: () => close() }, el('img', { src, alt: alt || '' }));
  const esc = (e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } };
  const close = () => { box.remove(); removeEventListener('keydown', esc, true); };
  addEventListener('keydown', esc, true);
  document.body.append(box);
}
// files from your computer or the clipboard: pictures go in the note's images folder, a PDF stays on this computer,
// and back comes ![[the picture]] (or [[the PDF]]) for each, to put in the note
async function addFiles(n, list) {
  const out = [];
  for (const blob of list) {
    const ext = (blob.type.split('/')[1] || 'png').replace('jpeg', 'jpg').replace('svg+xml', 'svg');
    const name = blob.name && blob.name !== 'image.png' ? blob.name : `screenshot-${store.dayKey()}-${new Date().toTimeString().slice(0, 8).replace(/:/g, '')}.${ext}`;
    const pdf = blob.type === 'application/pdf' || store.isPdf(name), image = !pdf && (/^image\//.test(blob.type) || store.isImage(name));
    if (!image && !pdf) { toast(`${name} can’t go in a note: pictures and PDFs only.`); continue; }
    if (blob.size > (pdf ? 60e6 : 25e6)) { toast(`${name} is too big (${pdf ? 60 : 25} MB at most).`); continue; }
    try {
      const x = await store.addFile(v, pdf ? store.dirOf(n.path) : store.imagesFor(v, n.path), name, blob);
      if (!pdf) x.sha = await sync.sha(new Uint8Array(await blob.arrayBuffer()));
      out.push(x);
      if (pdf) toast(`${store.fileOf(x.path)} stays on this computer only. It never goes to GitHub, so put its link in your sources too.`);
    } catch { toast(`${name} couldn’t be kept: this browser’s storage may be full.`); }
  }
  if (out.length) { touched(); drawTree(); }
  return out.map((x) => (x.local ? `[[${store.fileOf(x.path)}]]` : `![[${store.fileOf(x.path)}]]`));
}

// ---------- links, as a note shows them ----------
function ctxFor(n) {
  const ctx = {
    wiki(inner) {
      const p = md.linkParts(inner);
      if (!p.target && p.heading) return `<a class="wiki" href="#" data-heading="${md.esc(p.heading)}">${md.esc(p.label || p.heading)}</a>`;
      const x = store.resolve(v, p.target, n.path);
      if (!x) return `<a class="wiki missing" href="#" data-new="${md.esc(p.target)}" title="Not made yet: click to make it">${md.esc(p.label || p.target)}</a>`;
      const words = p.label || `${isDayNote(x.path) ? noWeekday(dayWords(store.nameOf(x.path))) : p.target}${p.heading ? ` › ${p.heading}` : ''}`;
      return `<a class="wiki${x.local ? ' local' : ''}" href="${hrefOf(x.path)}" data-path="${md.esc(x.path)}"${p.heading ? ` data-heading="${md.esc(p.heading)}"` : ''}>${md.esc(words)}</a>`;
    },
    embed(inner) {
      const p = md.linkParts(inner), x = store.resolve(v, p.target, n.path);
      if (x && store.isImage(x.path)) {
        const width = /^\d+$/.test(p.label) ? ` style="width:${Math.min(+p.label, 2000)}px"` : '';
        return `<img class="sn-img" data-file="${md.esc(x.path)}" alt="${md.esc(width ? store.fileOf(x.path) : p.label || store.fileOf(x.path))}"${width}>`;
      }
      if (x) return ctx.wiki(inner);
      return `<span class="sn-missing">${md.esc(p.target)} isn’t here</span>`;
    },
    image(src, alt) {
      if (/^https?:\/\//i.test(src)) return `<img class="sn-img" src="${md.esc(src)}" alt="${md.esc(alt)}" loading="lazy" referrerpolicy="no-referrer">`;
      let path = src;
      try { path = decodeURI(src); } catch {}
      const x = store.file(v, store.join(store.dirOf(n.path), path).replace(/[^/]+\/\.\.\//g, '')) || store.resolve(v, store.fileOf(path), n.path);
      return x && store.isImage(x.path) ? `<img class="sn-img" data-file="${md.esc(x.path)}" alt="${md.esc(alt)}">` : `<span class="sn-missing">${md.esc(alt || src)}</span>`;
    },
    link(url, html) {
      if (/^(https?:|mailto:)/i.test(url)) return `<a class="ext" href="${md.esc(url)}" target="_blank" rel="noopener noreferrer">${html}</a>`;
      if (url.startsWith('#')) return `<a class="wiki" href="#" data-heading="${md.esc(decodeURIComponent(url.slice(1)).replace(/-/g, ' '))}">${html}</a>`;
      let path = url;
      try { path = decodeURI(url); } catch {}
      const x = store.note(v, store.join(store.dirOf(n.path), path).replace(/[^/]+\/\.\.\//g, '')) || store.resolve(v, path.replace(/\.md$/i, ''), n.path);
      return x ? `<a class="wiki" href="${hrefOf(x.path)}" data-path="${md.esc(x.path)}">${html}</a>` : html;
    },
  };
  return ctx;
}

// ---------- what's open ----------
let open = null;                // { kind: 'note' | 'file' | 'home', path, draft }
let naming = false;             // (a new note opens with its name ready to type over)
let pendingHeading = '';        // (a link to a heading in another note scrolls there once it's open)
const doc = el('div', { className: 'sn-doc' });
const go = (hash) => { if (location.hash === hash) route(); else location.hash = hash; };
function route() {
  closeMenu();
  commitAll();
  let hash = location.hash.slice(1);
  try { hash = decodeURIComponent(hash); } catch {}
  if (!hash) {
    const last = ui.last && (store.note(v, `${ui.last}.md`) || store.file(v, ui.last));
    hash = last ? last.path.replace(/\.md$/i, '') : 'home';
    history.replaceState(null, '', `#${hash.split('/').map(encodeURIComponent).join('/')}`);
  }
  const dayDraft = (path) => isDayNote(path) && store.nameOf(path) <= store.dayKey();
  if (hash === 'today') open = { kind: 'note', path: store.dayPath(), draft: !store.note(v, store.dayPath()) };
  else if (hash === 'home') open = { kind: 'home' };
  else {
    const n = store.note(v, `${hash}.md`), x = !n && store.file(v, hash);
    if (n) open = { kind: 'note', path: n.path };
    else if (x) open = { kind: 'file', path: x.path };
    else if (dayDraft(`${hash}.md`)) open = { kind: 'note', path: `${hash}.md`, draft: true };
    else open = { kind: 'home', missing: hash };
  }
  if (open.path) {
    for (const d of store.parents(store.dirOf(open.path))) ui.open.add(d);
    ui.last = open.path.replace(/\.md$/i, '');
  }
  keepUi();
  draw(true);
  if (pendingHeading) { const h = pendingHeading; pendingHeading = ''; requestAnimationFrame(() => toHeading(h)); }
}
addEventListener('hashchange', route);
function draw(fresh) {
  drawTree();
  if (open?.kind === 'note') drawNote(fresh);
  else if (open?.kind === 'file') drawFile();
  else drawHome();
  if (fresh) {
    pane.scrollTop = 0;
    if (open?.path) rowOf(open.path)?.scrollIntoView({ block: 'nearest' });
  }
}
// the note that's open (one that isn't made yet, a day you haven't written, is a draft until you type in it)
let draftNote = null;
function noteOpen() {
  if (open?.kind !== 'note') return null;
  const n = store.note(v, open.path);
  if (n) return n;
  if (!open.draft) return null;
  if (draftNote?.path !== open.path) draftNote = { path: open.path, text: '', draft: true };
  return draftNote;
}
// a draft becomes a note when something goes in it
function materialize(n) {
  if (!n.draft) return n;
  delete n.draft;
  n.made = n.edited = Date.now();
  v.notes.push(n);
  store.tidy(v);
  if (open?.path === n.path) open.draft = false;
  draftNote = null;
  pane.querySelector('.sn-icon.more')?.removeAttribute('hidden');
  drawTree();
  return n;
}

// ---------- a note ----------
const undo = new Map();          // a note's path → { back: [texts], ahead: [texts] }
const undoOf = (path) => undo.get(path) || undo.set(path, { back: [], ahead: [] }).get(path);
function remember(path, text) { const h = undoOf(path); if (h.back.at(-1) !== text) h.back.push(text); if (h.back.length > 100) h.back.shift(); h.ahead = []; }
// (a note that starts with a # heading has that as its title: its file's name goes in the line above it instead)
const titled = (n) => !isDayNote(n.path) && md.blocks(n.text)[0]?.kind === 'heading' && md.blocks(n.text)[0].level === 1;
function drawNote(fresh) {
  const n = noteOpen();
  if (!n) return drawHome();
  const day = isDayNote(n.path), named = titled(n);
  const fileName = named ? el('span', { className: 'sn-file', role: 'button', tabIndex: 0, title: 'The note’s name: click to change it', onclick: () => renameIn(fileName, open.path, 'note'), onkeydown: (e) => { if (e.key === 'Enter' && e.target === fileName) { e.preventDefault(); renameIn(fileName, open.path, 'note'); } } }, el('span', { className: 'sn-label' }, store.nameOf(n.path))) : null;
  const crumbs = el('nav', { className: 'sn-crumbs', 'aria-label': 'Where it is' }, toggleSide,
    ...store.parents(store.dirOf(n.path)).flatMap((d, i) => [i ? el('span', { className: 'sep', 'aria-hidden': 'true' }, '›') : null,
      el('a', { href: '#', onclick: (e) => { e.preventDefault(); for (const p of store.parents(d)) ui.open.add(p); keepUi(); drawTree(); rowOf(d)?.scrollIntoView({ block: 'nearest' }); frame.classList.add('side-open'); } }, store.fileOf(d))]).filter(Boolean),
    ...(fileName ? [store.dirOf(n.path) ? el('span', { className: 'sep', 'aria-hidden': 'true' }, '›') : null, fileName].filter(Boolean) : []));
  const more = el('button', { type: 'button', className: 'sn-icon more', title: 'More', 'aria-label': 'More for this note', hidden: !!n.draft, onclick: () => menuFor(open.path, 'note', more) }, '⋯');
  let title;
  if (day) {
    const k = store.nameOf(n.path), days = v.notes.filter((x) => isDayNote(x.path)).map((x) => store.nameOf(x.path)).sort();
    const before = days.filter((d) => d < k).at(-1), after = days.filter((d) => d > k)[0];
    title = el('div', { className: 'sn-day' }, el('h2', { className: 'sn-title' }, k === store.dayKey() ? `Today, ${noWeekday(dayWords(k, true))}` : dayWords(k, true)),
      el('span', { className: 'sn-days' },
        before ? el('a', { href: hrefOf(store.dayPath(before)), title: dayWords(before, true) }, `‹ ${noWeekday(dayWords(before))}`) : null,
        after ? el('a', { href: hrefOf(store.dayPath(after)), title: dayWords(after, true) }, `${noWeekday(dayWords(after))} ›`) : k !== store.dayKey() ? el('a', { href: '#today' }, 'Today ›') : null));
  } else if (named) title = null;
  else {
    title = el('input', { className: 'sn-title', value: store.nameOf(n.path), spellcheck: false, 'aria-label': 'The note’s name', placeholder: 'Untitled' });
    const done = () => {
      const name = store.cleanName(title.value);
      if (!name || name === store.nameOf(open.path)) { title.value = store.nameOf(open.path); return; }
      if (!rename(open.path, 'note', `${name}.md`)) title.value = store.nameOf(open.path);
    };
    title.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); done(); title.blur(); const m = noteOpen(); if (m) editAt(m, 0); }
      if (e.key === 'Escape') { title.value = store.nameOf(open.path); title.blur(); }
    });
    title.addEventListener('blur', done);
  }
  const head = el('header', { className: 'sn-note-head' }, el('div', { className: 'sn-head-row' }, crumbs, el('span', { className: 'grow' }), saved, more), title || '');
  const back = el('section', { className: 'sn-back' });
  pane.replaceChildren(el('article', { className: `sn-note${fresh && f.moving() ? ' enter' : ''}` }, head, doc, back), toastBox);
  drawDoc(n);
  drawBack(n, back);
  if (naming && title?.select) { naming = false; title.focus(); title.select(); }
  else if (fresh && !n.text.trim() && matchMedia('(pointer: fine)').matches) {
    const focus = () => { if (doc.note === n && !ed) editAt(n, 0); };
    if (window.frameElement && window.frameElement.id !== 'page-frame') addEventListener('fluence:shown', focus, { once: true }); else requestAnimationFrame(focus);
  }
}
// every note that links here, with the line the link is on
function drawBack(n, box) {
  const list = n.draft ? [] : store.backlinks(v, n.path);
  box.hidden = !list.length;
  if (!list.length) return box.replaceChildren();
  box.replaceChildren(el('h3', {}, `Linked from ${plural(list.length, 'note')}`), el('ul', {}, list.map(({ note: x, lines }) => {
    const li = el('li', {}, el('a', { className: 'sn-from', href: hrefOf(x.path) }, svg(isDayNote(x.path) ? 'calendar' : 'note'), labelOf(x.path)));
    for (const line of lines.slice(0, 3)) {
      const p = el('p', {});
      p.innerHTML = md.inline(line.replace(/^\s*(?:[-*+]|\d+[.)])\s+(?:\[[ xX]\]\s+)?|^#+\s+|^>\s?/, ''), ctxFor(x));
      li.append(p);
    }
    return li;
  })));
  loadPictures(box);
}
// what an empty note says, until you write in it: a question to start from, for a day
const emptyWords = (n) => (isDayNote(n.path) ? ASK[Math.round(store.dateOf(store.nameOf(n.path)).getTime() / 864e5) % ASK.length] : 'Start writing. Type [[ to link a note, or / for a heading, a list or a table.');
// the note's blocks, laid out
function drawDoc(n) {
  const bs = md.blocks(n.text), ctx = ctxFor(n);
  const kids = bs.map((b, i) => { const d = el('div', { className: `b b-${b.kind}` }); d.dataset.i = i; d.innerHTML = md.render(n.text, b, ctx); return d; });
  doc.replaceChildren(...kids, el('div', { className: 'sn-tail' }, bs.length ? '' : el('p', { className: 'sn-empty' }, emptyWords(n))));
  doc.classList.toggle('titled', titled(n));
  doc.blocks = bs;
  doc.note = n;
  loadPictures(doc);
}
// (after a change somewhere else: the note again, unless you're typing in it)
function redrawNote() {
  if (ed || cellEd) return;
  const n = noteOpen();
  if (!n) return draw();
  drawDoc(n);
  const back = pane.querySelector('.sn-back');
  if (back) drawBack(n, back);
}

// ---------- changing a block ----------
// ed: the block being changed, as a text box: its note, the text before and after it, and what's typed in it
let ed = null;
function editAt(n, at) {
  commitAll();
  const bs = md.blocks(n.text);
  let i = bs.findIndex((b) => at >= b.from && at <= b.to);
  if (i < 0) i = bs.findIndex((b) => b.from > at);
  if (i < 0) return newBlock(n, n.text.replace(/\s+$/, '').length);
  editBlock(n, i, at);
}
function editBlock(n, i, caret) {
  const b = md.blocks(n.text)[i];
  if (!b) return newBlock(n, n.text.replace(/\s+$/, '').length);
  startEdit(n, { from: b.from, to: b.to, kind: b.kind, level: b.level, pre: '', post: '', caret: Math.max(0, Math.min((caret ?? b.to) - b.from, b.to - b.from)) });
}
// a new block at a place between blocks (or at the end): nothing goes in the note until something's typed
function newBlock(n, at) {
  commitAll();
  const before = n.text.slice(0, at), after = n.text.slice(at);
  const pre = before.trim() ? (before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n') : '';
  const post = after.trim() ? (after.startsWith('\n\n') ? '' : after.startsWith('\n') ? '\n' : '\n\n') : '';
  startEdit(n, { from: at, to: at, kind: 'para', pre, post, caret: 0, fresh: true });
}
function startEdit(n, o) {
  const value = n.text.slice(o.from, o.to);
  const ta = el('textarea', { className: `sn-edit k-${o.kind}${o.level ? ` h${o.level}` : ''}`, value, spellcheck: o.kind !== 'code' && o.kind !== 'table', rows: 1, 'aria-label': 'Change this part of the note', placeholder: n.text.trim() ? '' : emptyWords(n) });
  if (o.kind === 'table' || o.kind === 'code') ta.wrap = 'off';
  ed = { n, ta, before: n.text.slice(0, o.from), after: n.text.slice(o.to), pre: o.pre, post: o.post, original: value, textBefore: n.text, kind: o.kind };
  // (in place of its block, or for a new one, after the block before it)
  const kids = [...doc.querySelectorAll(':scope > .b')], bs = doc.blocks || [];
  const at = o.fresh ? -1 : bs.findIndex((b) => b.from === o.from && b.to === o.to);
  if (at >= 0 && kids[at]) kids[at].replaceWith(ta);
  else {
    const prev = [...bs.keys()].filter((k) => bs[k].to <= o.from).at(-1);
    if (prev !== undefined && kids[prev]) kids[prev].after(ta); else doc.prepend(ta);
    doc.querySelector('.sn-empty')?.remove();
  }
  ta.addEventListener('input', typed);
  ta.addEventListener('keydown', keys);
  ta.addEventListener('paste', pasted);
  ta.addEventListener('blur', () => setTimeout(() => { if (ed?.ta === ta && document.activeElement !== ta && !switching) commit(); }, 0));
  grow(ta);
  ta.focus({ preventScroll: true });
  ta.setSelectionRange(o.caret, o.caret);
  const r = ta.getBoundingClientRect(), p = pane.getBoundingClientRect();
  if (r.bottom > p.bottom - 20) pane.scrollTop += r.bottom - p.bottom + 60; else if (r.top < p.top + 10) pane.scrollTop -= p.top - r.top + 40;
}
function grow(ta) {
  const top = pane.scrollTop;
  ta.style.height = 'auto';
  ta.style.height = `${ta.scrollHeight + 2}px`;
  pane.scrollTop = top;
}
// what's typed goes into the note straight away, and is saved a moment later
function typed() {
  if (!ed) return;
  const { n, ta } = ed, value = ta.value;
  n.text = ed.before + (value ? ed.pre + value + ed.post : '') + ed.after;
  if (n.draft && n.text.trim()) materialize(n);
  if (!n.draft) touched(n);
  grow(ta);
  suggest();
}
function commit() {
  if (!ed) return;
  const was = ed, n = was.n;
  ed = null;
  closeSuggest();
  if (was.ta.value !== was.original) remember(n.path, was.textBefore);
  // (a day with nothing written in it goes)
  if (!n.draft && isDayNote(n.path) && !n.text.trim()) { store.remove(v, n.path); n.draft = true; draftNote = n; if (open?.path === n.path) open.draft = true; touched(); drawTree(); }
  if (doc.note !== n) return;
  if (titled(n) === !!pane.querySelector('.sn-file') || isDayNote(n.path)) { drawDoc(n); const back = pane.querySelector('.sn-back'); if (back) drawBack(n, back); }
  else { const top = pane.scrollTop; drawNote(false); pane.scrollTop = top; }
}
function commitAll() { if (ed) commit(); if (cellEd) commitCell(); }
const blockStart = () => ed.before.length + (ed.ta.value ? ed.pre.length : 0);
function keys(e) {
  const { ta, n } = ed;
  if (linkMenu && suggestKeys(e)) return;
  const mod = mac ? e.metaKey : e.ctrlKey, start = ta.selectionStart, end = ta.selectionEnd, value = ta.value;
  if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); commit(); return; }
  if (mod && !e.shiftKey && e.key.toLowerCase() === 'z' && value === ed.original) { e.preventDefault(); commit(); undoNote(false); return; }
  if (mod && !e.shiftKey && (e.key === 'b' || e.key === 'i')) { e.preventDefault(); wrap(e.key === 'b' ? '**' : '*'); return; }
  if (e.altKey || e.metaKey || e.ctrlKey) return;
  const lineStart = value.lastIndexOf('\n', start - 1) + 1, lineEnd = value.indexOf('\n', start) < 0 ? value.length : value.indexOf('\n', start), line = value.slice(lineStart, lineEnd);
  if (e.key === 'ArrowUp' && start === 0 && end === 0) {
    const from = blockStart(), prev = md.blocks(n.text).filter((b) => b.to < from).at(-1);
    if (!prev) return;
    e.preventDefault();
    commit();
    editAt(n, prev.to);
    return;
  }
  if (e.key === 'ArrowDown' && start === value.length && end === value.length) {
    const to = blockStart() + value.length, next = md.blocks(n.text).find((b) => b.from > to);
    e.preventDefault();
    commit();
    if (next) editAt(n, next.from); else if (value.trim()) newBlock(n, n.text.replace(/\s+$/, '').length);
    return;
  }
  if (e.key === 'Backspace' && !value && start === 0) {
    // (an empty block goes, with the space it took, and the one before it opens)
    e.preventDefault();
    const head = ed.before.replace(/\n+$/, ''), tail = ed.after.replace(/^\n+/, ''), prev = md.blocks(head).at(-1);
    n.text = head && tail ? `${head}\n\n${tail}` : head ? `${head}\n` : tail;
    if (!n.draft) touched(n);
    ed = null;
    closeSuggest();
    drawDoc(n);
    if (prev) editAt(n, prev.to);
    return;
  }
  if (e.key === 'Enter' && !e.shiftKey) {
    const m = md.ITEM.exec(line);
    if (m && start === end && start >= lineStart + m[0].length) {
      // a list goes on: the next item, or out of the list from an empty one
      e.preventDefault();
      const rest = line.slice(m[0].length), task = /^\[[ xX]\]\s*/.exec(rest);
      if (!rest.trim() || (task && !rest.slice(task[0].length).trim())) { ta.setSelectionRange(lineStart, lineEnd); insert(ta, '\n'); return; }
      const mark = /\d/.test(m[2]) ? `${parseInt(m[2], 10) + 1}${m[2].slice(-1)}` : m[2];
      insert(ta, `\n${m[1]}${mark} ${task ? '[ ] ' : ''}`);
      return;
    }
    if (ed.kind === 'heading' && !value.includes('\n') && start === value.length) { e.preventDefault(); const at = blockStart() + value.length; commit(); newBlock(n, at); return; }
  }
  if (e.key === 'Tab' && md.ITEM.test(line)) {
    e.preventDefault();
    const a = value.lastIndexOf('\n', start - 1) + 1, z = value.indexOf('\n', Math.max(start, end - 1)), stop = z < 0 ? value.length : z;
    ta.setSelectionRange(a, stop);
    insert(ta, value.slice(a, stop).split('\n').map((l) => (e.shiftKey ? l.replace(/^( {1,2}|\t)/, '') : `  ${l}`)).join('\n'));
    return;
  }
  if (e.key === '[' && value[start - 1] === '[' && value[start - 2] !== '[' && start === end) {
    // ([[ closes itself, and the suggestions open)
    e.preventDefault();
    insert(ta, '[]]');
    ta.setSelectionRange(start + 1, start + 1);
    suggest();
  }
}
// typing into a text box the way the keyboard would, so ⌘Z still undoes it
function insert(ta, text) {
  if (!document.execCommand('insertText', false, text)) { ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input')); }
}
function wrap(mark) {
  const { ta } = ed, a = ta.selectionStart, b = ta.selectionEnd, words = ta.value.slice(a, b);
  insert(ta, `${mark}${words}${mark}`);
  ta.setSelectionRange(a + mark.length, b + mark.length);
}
// pasting: a picture goes in the images folder, and a web address goes in your sources (with words chosen, it
// becomes a link on them)
async function pasted(e) {
  const files = [...(e.clipboardData?.files || [])];
  const { ta } = ed;
  if (files.length) {
    e.preventDefault();
    const n = materialize(ed.n), links = await addFiles(n, files);
    if (links.length && ed?.ta === ta) { ta.focus(); insert(ta, links.join('\n')); }
    return;
  }
  const text = (e.clipboardData?.getData('text/plain') || '').trim();
  if (!/^https?:\/\/\S+$/.test(text)) return;
  const a = ta.selectionStart, b = ta.selectionEnd;
  if (b > a) { e.preventDefault(); insert(ta, `[${ta.value.slice(a, b)}](${text})`); }
  if (f.settings.stationSources === false) return;
  const r = store.addSource(v, text, ed.n.path);
  if (!r.added) return;
  touched(r.note);
  drawTree();
  toast(`Added to ${store.nameOf(r.note.path)}, with today’s date.`, { text: 'Undo', run: () => { r.note.text = r.before; touched(r.note); redrawNote(); } });
}

// ---------- [[ suggestions, and / for what to put in ----------
let linkMenu = null, picks = [], picked = 0, menuKind = '';
function closeSuggest() { linkMenu?.remove(); linkMenu = null; picks = []; }
function suggest() {
  if (!ed) return closeSuggest();
  const { ta } = ed, before = ta.value.slice(0, ta.selectionStart);
  const link = /(!?)\[\[([^\]\n|#]*)$/.exec(before);
  const slash = !link && /(?:^|\n)\/([\w ]{0,20})$/.exec(before);
  if (link) {
    const q = link[2].toLowerCase(), pics = !!link[1];
    const pool = pics ? v.files.filter((x) => store.isImage(x.path)).map((x) => ({ name: store.fileOf(x.path), path: x.path, edited: x.edited }))
      : v.notes.filter((x) => x.path !== ed.n.path).map((x) => ({ name: store.nameOf(x.path), path: x.path, edited: x.edited }));
    const list = pool.filter((x) => x.name.toLowerCase().includes(q) || labelOf(x.path).toLowerCase().includes(q))
      .sort((a, b) => b.name.toLowerCase().startsWith(q) - a.name.toLowerCase().startsWith(q) || b.edited - a.edited).slice(0, 7)
      .map((x) => ({ text: x.name, extra: isDayNote(x.path) ? dayWords(x.name) : '', sub: store.dirOf(x.path).replace(/\//g, ' › '), icon: pics ? 'picture' : isDayNote(x.path) ? 'calendar' : 'note', run: () => putLink(x.name, link[2].length) }));
    if (q.trim() && !pics && !pool.some((x) => x.name.toLowerCase() === q.trim())) list.push({ text: `“${link[2].trim()}”`, sub: 'a new note: click the link to make it', icon: 'plus', run: () => putLink(link[2].trim(), link[2].length) });
    return showSuggest(list, 'link');
  }
  if (slash) {
    const q = slash[1].toLowerCase().trim();
    const groups = v.folders.filter((d) => d !== store.JOURNAL && v.notes.filter((x) => store.dirOf(x.path) === d).length >= 2);
    const all = [
      { text: 'Heading', sub: '##', icon: 'note', put: '## ' },
      { text: 'Smaller heading', sub: '###', icon: 'note', put: '### ' },
      { text: 'List', sub: '-', icon: 'note', put: '- ' },
      { text: 'Numbered list', sub: '1.', icon: 'note', put: '1. ' },
      { text: 'To-do', sub: '- [ ]', icon: 'check', put: '- [ ] ' },
      { text: 'Table', sub: '3 columns', icon: 'table', table: { head: ['', '', ''], rows: [['', '', ''], ['', '', '']] } },
      ...groups.map((d) => ({ text: `Compare the ${store.fileOf(d)}`, sub: `a row for each note in ${store.fileOf(d)}`, icon: 'table',
        table: { head: [store.fileOf(d).replace(/(?<!s)s$/i, '').replace(/^./, (c) => c.toUpperCase()), ''], rows: v.notes.filter((x) => store.dirOf(x.path) === d).sort((a, b) => a.path.localeCompare(b.path)).map((x) => [`[[${store.nameOf(x.path)}]]`, '']) } })),
      { text: 'Picture', sub: 'from your computer', icon: 'picture', pick: true },
      { text: 'Link to a note', sub: '[[', icon: 'link', put: '[[]]', back: 2 },
      { text: 'Quote', sub: '>', icon: 'note', put: '> ' },
      { text: 'Code', sub: '```', icon: 'code', put: '```\n\n```', back: 4 },
      { text: 'Line across', sub: '---', icon: 'note', put: '---', after: true },
      { text: 'Today’s date', sub: store.dayKey(), icon: 'calendar', put: store.dayKey() },
    ];
    const list = all.filter((x) => !q || x.text.toLowerCase().includes(q)).slice(0, 10).map((x) => ({ ...x, run: () => putBlock(x, slash[1].length + 1) }));
    return showSuggest(list, 'slash');
  }
  closeSuggest();
}
function showSuggest(list, kind) {
  if (!list.length) return closeSuggest();
  const keep = menuKind === kind && linkMenu ? Math.min(picked, list.length - 1) : 0;
  closeSuggest();
  menuKind = kind;
  picks = list;
  picked = keep;
  linkMenu = el('div', { className: 'sn-suggest', role: 'listbox' }, list.map((x, i) => el('button', { type: 'button', role: 'option', tabIndex: -1, className: i === picked ? 'on' : '', onmousedown: (e) => { e.preventDefault(); x.run(); } },
    svg(x.icon), el('span', {}, el('b', {}, x.text), x.extra ? el('small', {}, x.extra) : null), x.sub ? el('em', {}, x.sub) : null)));
  document.body.append(linkMenu);
  const { x, y } = caretXY(ed.ta), w = linkMenu.offsetWidth, h = linkMenu.offsetHeight;
  linkMenu.style.left = `${Math.max(8, Math.min(innerWidth - w - 8, x - 12))}px`;
  linkMenu.style.top = `${y + h + 8 > innerHeight ? Math.max(8, y - h - 30) : y + 6}px`;
}
function suggestKeys(e) {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    picked = (picked + (e.key === 'ArrowDown' ? 1 : picks.length - 1)) % picks.length;
    [...linkMenu.children].forEach((b, i) => b.classList.toggle('on', i === picked));
    return true;
  }
  if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); picks[picked]?.run(); return true; }
  if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeSuggest(); return true; }
  return false;
}
// a note's name into the [[ ]] being typed (and past the ]] that closes it)
function putLink(name, typedLength) {
  const { ta } = ed, at = ta.selectionStart, closed = ta.value.slice(at, at + 2) === ']]';
  ta.setSelectionRange(at - typedLength, closed ? at + 2 : at);
  insert(ta, `${name}]]`);
  closeSuggest();
}
function putBlock(x, typedLength) {
  const { ta, n } = ed, at = ta.selectionStart;
  ta.setSelectionRange(at - typedLength, at);
  closeSuggest();
  if (x.pick) {
    insert(ta, '');
    const input = el('input', { type: 'file', accept: 'image/*,.pdf', multiple: true, hidden: true });
    input.addEventListener('change', async () => { const links = await addFiles(materialize(n), [...input.files]); input.remove(); if (links.length && ed?.ta === ta) { ta.focus(); insert(ta, links.join('\n')); } });
    document.body.append(input);
    input.click();
    return;
  }
  if (x.table) {
    const text = md.tableText(x.table);
    insert(ta, text);
    const where = blockStart() + ta.selectionStart - text.length;
    commit();
    editCell(n, where, x.table.head[0] ? 0 : -1, x.table.head[0] ? 1 : 0);
    return;
  }
  insert(ta, x.put);
  if (x.back) ta.setSelectionRange(ta.selectionStart - x.back, ta.selectionStart - x.back);
  if (x.put === '[[]]') suggest();
  if (x.after) { const end = blockStart() + ta.value.length; commit(); newBlock(n, end); }
}
// where the caret is on the screen, from a copy of the text box laid out the same way
function caretXY(ta) {
  const s = getComputedStyle(ta), m = document.createElement('div');
  for (const p of ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing', 'lineHeight', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderTopWidth', 'borderLeftWidth', 'borderRightWidth', 'boxSizing', 'tabSize', 'textIndent']) m.style[p] = s[p];
  Object.assign(m.style, { position: 'absolute', visibility: 'hidden', whiteSpace: 'pre-wrap', overflowWrap: 'break-word', width: `${ta.offsetWidth}px`, top: '0', left: '-9999px' });
  m.textContent = ta.value.slice(0, ta.selectionStart);
  const mark = document.createElement('span');
  mark.textContent = '​';
  m.append(mark);
  document.body.append(m);
  const r = ta.getBoundingClientRect(), x = r.left + mark.offsetLeft - ta.scrollLeft, y = r.top + mark.offsetTop - ta.scrollTop + (parseFloat(s.lineHeight) || 24);
  m.remove();
  return { x, y };
}

// ---------- a table's cells, changed where they are ----------
let cellEd = null;              // { n, from, to (the table, in the note), t (its rows), r, c, el, textBefore }
const tableTools = el('div', { className: 'sn-tbl-tools', role: 'toolbar', 'aria-label': 'Table' });
// a cell of the table that starts (or is) at `at` in the note: row -1 is the top row, the column names
function editCell(n, at, r, c) {
  commitAll();
  if (doc.note !== n) drawDoc(n);
  const bs = md.blocks(n.text), i = bs.findIndex((b) => b.kind === 'table' && b.from <= at && at <= b.to);
  if (i < 0) return;
  const b = bs[i], cell = doc.querySelectorAll(':scope > .b')[i]?.querySelector(r < 0 ? `th[data-c="${c}"]` : `td[data-r="${r}"][data-c="${c}"]`);
  if (!cell) return;
  const t = md.parseTable(n.text.slice(b.from, b.to));
  cellEd = { n, from: b.from, to: b.to, start: b.to, t, r, c, el: cell, textBefore: n.text };
  cell.textContent = r < 0 ? t.head[c] : t.rows[r][c];
  cell.contentEditable = 'plaintext-only';
  cell.classList.add('editing');
  cell.focus();
  const range = document.createRange();
  range.selectNodeContents(cell);
  range.collapse(false);
  getSelection().removeAllRanges();
  getSelection().addRange(range);
  const tool = (text, run, title) => el('button', { type: 'button', title: title || text, onmousedown: (e) => { e.preventDefault(); run(); } }, text);
  tableTools.replaceChildren(
    tool('+ Row', () => addRow(cellEd.r + 1), 'A row under this one'),
    tool('+ Column', () => addCol(cellEd.c + 1), 'A column after this one'),
    tool('Delete row', dropRow, 'Delete this row'),
    tool('Delete column', dropCol, 'Delete this column'),
    tool('As text', () => { const from = cellEd.from; commitCell(); editAt(n, from); }, 'Change the table as Markdown'));
  cell.closest('.b').prepend(tableTools);
  cell.oninput = () => {
    const value = cell.textContent.replace(/\n/g, ' ');
    if (cellEd.r < 0) cellEd.t.head[cellEd.c] = value; else cellEd.t.rows[cellEd.r][cellEd.c] = value;
    putTable();
  };
  cell.onkeydown = cellKeys;
  cell.onpaste = (e) => { e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData?.getData('text/plain') || '').replace(/\s*\n\s*/g, ' ')); };
  cell.onblur = () => setTimeout(() => { if (cellEd?.el === cell && document.activeElement !== cell && !switching) commitCell(); }, 0);
}
function putTable() {
  const { n, t } = cellEd, text = md.tableText(t);
  n.text = n.text.slice(0, cellEd.from) + text + n.text.slice(cellEd.to);
  cellEd.to = cellEd.from + text.length;
  touched(n);
}
function commitCell(redraw = true) {
  if (!cellEd) return;
  const { n, el: cell, textBefore } = cellEd;
  cellEd = null;
  cell.contentEditable = 'false';
  cell.oninput = cell.onkeydown = cell.onblur = cell.onpaste = null;
  tableTools.remove();
  if (n.text !== textBefore) remember(n.path, textBefore);
  if (redraw) redrawNote();
}
// another cell of the same table: the table drawn again, with that cell to type in
function cellTo(r, c) {
  const { n, from } = cellEd;
  commitCell(false);
  drawDoc(n);
  editCell(n, from, r, c);
}
function addRow(at) { const { t } = cellEd; t.rows.splice(at, 0, t.head.map(() => '')); putTable(); cellTo(at, 0); }
function addCol(at) { const { t } = cellEd; t.head.splice(at, 0, ''); t.align.splice(at, 0, ''); for (const row of t.rows) row.splice(at, 0, ''); putTable(); cellTo(-1, at); }
function dropRow() {
  const { t, r, c } = cellEd;
  if (r < 0) return toast('That’s the row of column names. Delete the column, or the whole table with As text.');
  t.rows.splice(r, 1);
  putTable();
  if (t.rows.length) cellTo(Math.min(r, t.rows.length - 1), c); else cellTo(-1, c);
}
function dropCol() {
  const { t, c, n } = cellEd;
  if (t.head.length <= 1) {
    // (the last column: the whole table goes)
    const { from, to } = cellEd, head = n.text.slice(0, from).replace(/\n+$/, ''), tail = n.text.slice(to).replace(/^\n+/, '');
    n.text = head && tail ? `${head}\n\n${tail}` : head ? `${head}\n` : tail;
    touched(n);
    commitCell();
    return;
  }
  t.head.splice(c, 1);
  t.align.splice(c, 1);
  for (const row of t.rows) row.splice(c, 1);
  putTable();
  cellTo(cellEd.r, Math.min(c, t.head.length - 1));
}
function cellKeys(e) {
  const { t, r, c } = cellEd, last = t.rows.length - 1, width = t.head.length;
  if (e.key === 'Tab') {
    e.preventDefault();
    if (e.shiftKey) { if (c > 0) cellTo(r, c - 1); else if (r >= 0) cellTo(r - 1, width - 1); return; }
    if (c < width - 1) cellTo(r, c + 1); else if (r < last) cellTo(r + 1, 0); else addRow(last + 1);
    return;
  }
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (r < last) cellTo(r + 1, c); else addRow(last + 1); return; }
  if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); const cell = cellEd.el; commitCell(); cell.blur?.(); return; }
  if (e.key === 'ArrowUp' && r >= 0 && atEdge(true)) { e.preventDefault(); cellTo(r - 1, c); }
  if (e.key === 'ArrowDown' && r < last && atEdge(false)) { e.preventDefault(); cellTo(r + 1, c); }
}
const atEdge = (top) => { const s = getSelection(); if (!s.rangeCount) return true; const rr = s.getRangeAt(0).getBoundingClientRect(), cr = cellEd.el.getBoundingClientRect(); return !rr.height || (top ? rr.top - cr.top < 22 : cr.bottom - rr.bottom < 22); };

// ---------- clicks on a note ----------
// A click elsewhere in the note while you're changing a part of it goes straight to where you clicked: the press
// keeps the part you were changing from closing on its own (that would move everything under the pointer), and the
// click closes it and opens the new place. Places are worked out from the note as it was last drawn
let switching = false;
doc.addEventListener('pointerdown', (e) => {
  if (e.button) return;
  const inside = (ed && ed.ta.contains(e.target)) || (cellEd && cellEd.el.contains(e.target)) || e.target.closest('.sn-tbl-tools');
  if ((ed || cellEd) && !inside) switching = true;
}, true);
addEventListener('pointerup', () => setTimeout(() => {
  if (!switching) return;
  switching = false;
  if (ed && document.activeElement !== ed.ta) commit();
  if (cellEd && document.activeElement !== cellEd.el) commitCell();
}, 0), true);
// a place in the note as it was drawn, in the note as it is now (the part being changed may have grown or shrunk)
function now(p) {
  if (ed) { const end = ed.textBefore.length - ed.after.length; return p < end ? p : p + (ed.n.text.length - ed.textBefore.length); }
  if (cellEd) return p < cellEd.start ? p : p + (cellEd.n.text.length - cellEd.textBefore.length);
  return p;
}
doc.addEventListener('click', (e) => {
  const n = doc.note;
  if (!n || e.button) return;
  switching = false;
  if (e.target.closest('.sn-edit, .sn-tbl-tools') || (cellEd && cellEd.el.contains(e.target))) return;
  const a = e.target.closest('a');
  if (a) {
    if (a.dataset.new !== undefined) { e.preventDefault(); commitAll(); return makeFromLink(a.dataset.new, a); }
    if (a.dataset.heading !== undefined && !a.dataset.path) { e.preventDefault(); commitAll(); return toHeading(a.dataset.heading); }
    if (a.classList.contains('local')) { e.preventDefault(); commitAll(); return openLocal(a.dataset.path); }
    if (a.dataset.heading && a.dataset.path) { e.preventDefault(); pendingHeading = a.dataset.heading; go(a.getAttribute('href')); return; }
    if (a.classList.contains('ext')) { setTimeout(commitAll, 0); return; }
    return;
  }
  const box = e.target.closest('input[type=checkbox][data-box]');
  if (box) {
    const at = now(+box.dataset.box), checked = box.checked;
    commitAll();
    if (/^\[[ xX]\]$/.test(n.text.slice(at, at + 3))) { remember(n.path, n.text); n.text = n.text.slice(0, at) + (checked ? '[x]' : '[ ]') + n.text.slice(at + 3); touched(n); }
    setTimeout(() => { if (!ed && !cellEd) drawDoc(n); }, 140);
    return;
  }
  const img = e.target.closest('img');
  if (img?.src) { commitAll(); return bigPicture(img.src, img.alt); }
  const blk = e.target.closest('.b');
  const b = blk && doc.blocks?.[+blk.dataset.i];
  const cell = e.target.closest('td, th');
  if (b && cell) return editCell(n, now(b.from), +cell.dataset.r, +cell.dataset.c);
  if (!getSelection().isCollapsed && doc.contains(getSelection().anchorNode) && !ed) return;    // (choosing words to copy)
  if (b) {
    const from = now(b.from), to = now(b.to);
    let at = to;
    if (b.kind !== 'hr' && b.kind !== 'figure') {
      const r = document.caretRangeFromPoint?.(e.clientX, e.clientY);
      if (r && blk.contains(r.startContainer)) {
        const pre = document.createRange();
        pre.selectNodeContents(blk);
        pre.setEnd(r.startContainer, r.startOffset);
        at = from + md.sourceOffset(n.text.slice(from, to), blk.textContent, pre.toString().length);
      }
    }
    commitAll();
    return editAt(n, at);
  }
  // (below the last block: a new one at the end)
  if (e.target.closest('.sn-tail') || e.target === doc) { commitAll(); newBlock(n, n.text.replace(/\s+$/, '').length); }
});
function toHeading(words) {
  const id = md.slug(words), h = doc.querySelector(`[id="${CSS.escape(id)}"]`) || [...doc.querySelectorAll('h1,h2,h3,h4,h5,h6')].find((x) => x.textContent.trim().toLowerCase() === words.trim().toLowerCase());
  h?.scrollIntoView({ behavior: f.moving() ? 'smooth' : 'auto', block: 'start' });
}
function openLocal(path) {
  const x = store.file(v, path);
  if (!x) return;
  store.getBlob(x.id).then((blob) => { if (blob) window.open(URL.createObjectURL(blob), '_blank', 'noopener'); else toast('That file isn’t in this browser any more.'); });
}
// a link to a note that isn't made yet: where it goes, then Make it
function makeFromLink(name, anchor) {
  const n = doc.note, start = isDayNote(n.path) ? '' : store.dirOf(n.path);
  const pick = el('select', { className: 'input', 'aria-label': 'Folder' }, el('option', { value: '' }, 'The top'), ...v.folders.map((d) => el('option', { value: d, selected: d === start }, d.replace(/\//g, ' › '))));
  showMenu(anchor, [
    { html: el('p', { className: 'sn-ask' }, `There’s no note called “${name}” yet. Make it in`) },
    { html: pick },
    { icon: 'plus', text: 'Make it', run: () => {
      closeMenu();
      const path = store.join(pick.value, `${store.cleanName(name) || 'Untitled'}.md`);
      if (!store.taken(v, path)) store.makeNote(v, path, '');
      if (pick.value) ui.open.add(pick.value);
      keepUi();
      touched();
      go(hrefOf(path));
    } },
  ]);
}

// ---------- undo, for a whole note ----------
function undoNote(again) {
  const n = noteOpen();
  if (!n || n.draft) return;
  const h = undoOf(n.path), from = again ? h.ahead : h.back, to = again ? h.back : h.ahead;
  if (!from.length) return;
  to.push(n.text);
  n.text = from.pop();
  touched(n);
  drawDoc(n);
}
addEventListener('keydown', (e) => {
  const mod = mac ? e.metaKey : e.ctrlKey;
  if (!mod || e.key.toLowerCase() !== 'z' || ed || cellEd || open?.kind !== 'note') return;
  if (e.target.closest?.('input, textarea, select, [contenteditable="true"], [contenteditable="plaintext-only"]')) return;
  e.preventDefault();
  undoNote(e.shiftKey);
});

// ---------- dropping files on a note ----------
const hasFiles = (e) => [...(e.dataTransfer?.types || [])].includes('Files');
pane.addEventListener('dragover', (e) => { if (!hasFiles(e) || open?.kind !== 'note') return; e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; doc.classList.add('drop'); });
pane.addEventListener('dragleave', (e) => { if (!pane.contains(e.relatedTarget)) doc.classList.remove('drop'); });
pane.addEventListener('drop', async (e) => {
  doc.classList.remove('drop');
  if (!hasFiles(e) || open?.kind !== 'note') return;
  e.preventDefault();
  const typing = ed && ed.n === doc.note ? ed.ta : null, n = materialize(doc.note);
  const links = await addFiles(n, [...e.dataTransfer.files]);
  if (!links.length) return;
  if (typing && ed?.ta === typing) { typing.focus(); insert(typing, links.join('\n')); return; }
  commitAll();
  remember(n.path, n.text);
  n.text = `${n.text.replace(/\s+$/, '')}${n.text.trim() ? '\n\n' : ''}${links.join('\n')}\n`;
  touched(n);
  drawDoc(n);
});

// ---------- a file ----------
function drawFile() {
  const x = store.file(v, open.path);
  if (!x) return drawHome();
  const more = el('button', { type: 'button', className: 'sn-icon', title: 'More', 'aria-label': 'More for this file', onclick: () => menuFor(x.path, 'file', more) }, '⋯');
  const body = el('div', { className: 'sn-file' });
  const uses = v.notes.filter((n) => md.links(n.text).some((l) => store.resolve(v, l.target, n.path) === x));
  pane.replaceChildren(el('article', { className: 'sn-note' },
    el('header', { className: 'sn-note-head' }, el('div', { className: 'sn-head-row' }, el('nav', { className: 'sn-crumbs' }, toggleSide, ...store.parents(store.dirOf(x.path)).flatMap((d, i) => [i ? el('span', { className: 'sep' }, '›') : null, el('span', {}, store.fileOf(d))]).filter(Boolean)), el('span', { className: 'grow' }), more),
      el('h2', { className: 'sn-title' }, store.fileOf(x.path))),
    body,
    el('p', { className: 'sn-file-about' }, [`${(x.size / 1e6).toFixed(x.size >= 1e6 ? 1 : 2)} MB`, x.local ? 'kept on this computer only, never on GitHub' : ''].filter(Boolean).join(' · ')),
    uses.length ? el('section', { className: 'sn-back' }, el('h3', {}, `In ${plural(uses.length, 'note')}`), el('ul', {}, uses.map((n) => el('li', {}, el('a', { className: 'sn-from', href: hrefOf(n.path) }, svg('note'), labelOf(n.path)))))) : null), toastBox);
  urlOf(x).then((url) => {
    if (!url) return body.replaceChildren(el('p', { className: 'sn-missing' }, 'This file isn’t in this browser yet.'));
    body.replaceChildren(store.isImage(x.path) ? el('img', { src: url, alt: store.fileOf(x.path), onclick: () => bigPicture(url, store.fileOf(x.path)) })
      : el('p', {}, el('a', { className: 'btn', href: url, target: '_blank', rel: 'noopener' }, svg('external'), 'Open it')));
  });
}

// ---------- the start: today, what you changed lately, and a research project ----------
function drawHome() {
  const recent = [...v.notes].sort((a, b) => b.edited - a.edited).slice(0, 6);
  const head = el('header', { className: 'sn-note-head' }, el('div', { className: 'sn-head-row' }, el('nav', { className: 'sn-crumbs' }, toggleSide), el('span', { className: 'grow' })), el('h2', { className: 'sn-title' }, f.settings.stationTitle || 'Station'));
  const group = el('input', { className: 'input', value: 'laptops', 'aria-label': 'What you’re comparing' });
  const things = el('textarea', { className: 'input', rows: 2, value: 'MacBook Pro 14, MNT Reform, Framework 13, Pinebook Pro', 'aria-label': 'Each thing you’re comparing' });
  const parts = el('input', { className: 'input', value: 'power, thermals, display, chassis', 'aria-label': 'What you compare them on' });
  const start = el('section', { className: 'sn-card sn-start' },
    el('h3', {}, 'Start a research project'),
    el('p', {}, 'A folder for the things you’re comparing, with a note for each one, a table for each part you compare them on, a list of parts to buy, a folder for your pictures, and a sources note for every link you use. Your journal links to all of it.'),
    el('label', {}, el('span', {}, 'What you’re comparing'), group),
    el('label', {}, el('span', {}, 'Each one'), things),
    el('label', {}, el('span', {}, 'What you compare them on'), parts),
    el('div', { className: 'sn-start-go' }, el('button', { type: 'button', className: 'btn primary', onclick: () => {
      const made = store.researchLayout(v, { group: group.value.trim() || 'things', things: store.list(things.value), parts: store.list(parts.value) });
      for (const d of ['research', 'research/subsystems', `research/${store.cleanName(group.value).toLowerCase()}`]) ui.open.add(d);
      keepUi();
      touched();
      const first = made.find((p) => p.startsWith('research/subsystems/')) || made[0];
      go(first ? hrefOf(first) : '#home');
    } }, 'Make it'), el('small', {}, 'A PDF you add stays on this computer and never goes to GitHub, so what you keep there is your own words and pictures.')));
  pane.replaceChildren(el('article', { className: 'sn-note sn-home' }, head,
    open?.missing ? el('p', { className: 'sn-none' }, `There’s no note at ${open.missing} any more.`) : '',
    el('div', { className: 'sn-home-row' },
      el('a', { className: 'sn-card sn-go', href: '#today' }, svg('calendar'), el('span', {}, el('b', {}, 'Today’s entry'), el('small', {}, store.note(v, store.dayPath()) ? 'Carry on where you left off' : ASK[0]))),
      el('button', { type: 'button', className: 'sn-card sn-go', onclick: () => newNote('') }, svg('note'), el('span', {}, el('b', {}, 'A new note'), el('small', {}, 'At the top, to move anywhere')))),
    recent.length ? el('section', { className: 'sn-recent' }, el('h3', {}, 'Changed lately'), el('ul', {}, recent.map((n) => el('li', {}, el('a', { href: hrefOf(n.path) }, svg(isDayNote(n.path) ? 'calendar' : 'note'), el('b', {}, labelOf(n.path)), el('span', {}, md.plain(n.text).slice(0, 90))))))) : '',
    v.folders.includes('research') ? '' : start), toastBox);
}

// ---------- how saving to GitHub is going ----------
function showSync(st = sync.status()) {
  if (!sync.connected()) { syncLine.className = 'sn-sync'; syncLine.replaceChildren(el('span', {}, 'In this browser only. ', el('a', { href: f.link('music/') }, 'Connect GitHub'), ' to keep it safe.')); return; }
  const ago = (t) => { const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : new Date(t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); };
  syncLine.className = `sn-sync ${st.status}`;
  syncLine.replaceChildren(svg('cloud'), el('span', {}, st.status === 'syncing' || (st.status === 'idle' && !st.at) ? 'Saving to GitHub…' : st.status === 'error' ? `Not saved to GitHub: ${st.error}` : 'Saved to GitHub'));
  syncLine.title = st.status === 'error' ? '' : `On the ${sync.BRANCH} branch of ${sync.repo()}${st.at ? `, ${ago(st.at)}` : ''}`;
}
sync.listen((what, st) => {
  if (what === 'changed') { drawTree(); if (open?.kind === 'note' && !noteOpen()) route(); else if (open?.kind === 'home') drawHome(); else redrawNote(); }
  showSync(st);
});
// another tab changed Station: take that, but keep what you're typing here
addEventListener('storage', (e) => {
  if (e.key !== store.KEY) return;
  const typing = ed?.n || cellEd?.n || null, mine = typing?.text;
  v = store.read();
  if (typing && !typing.draft) {
    const n = store.note(v, typing.path) || store.makeNote(v, typing.path, mine);
    n.text = mine;
    if (ed) ed.n = n;
    if (cellEd) cellEd.n = n;
    doc.note = n;
  }
  if (open?.kind === 'note' && !noteOpen()) return route();
  drawTree();
  if (open?.kind === 'home') drawHome(); else redrawNote();
});
addEventListener('fluentio:settings', () => { document.title = `${f.settings.stationTitle} · ${f.settings.studyTitle} · ${f.settings.name}`; if (open?.kind === 'home') drawHome(); });

// ---------- start ----------
document.title = `${f.settings.stationTitle} · ${f.settings.studyTitle} · ${f.settings.name}`;
route();
showSync();
setTimeout(syncNow, 400);
window.fluentioStation = { vault: () => v, sync, store, md, open: () => open, flush };
