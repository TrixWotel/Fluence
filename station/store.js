// Station's notes, folders and files, kept in this browser. fluentio.station (localStorage) holds the notes' text and the
// folders, so a page opens with them straight away, and IndexedDB's fluence-notes holds pictures and PDFs, which are too
// big for it. Every note is a Markdown file at a path, the way it is on GitHub (sync.js) and in Obsidian:
// research/subsystems/power.md is the note "power" in research › subsystems. A link finds a note by its name, so
// moving a note keeps its links, and renaming one changes the links to it everywhere.
import { links, parseTable, tableText, blocks } from './md.js';

const f = window.fluentio;
export const KEY = 'fluentio.station';
export const JOURNAL = 'journal';
const IMAGE = /\.(png|jpe?g|gif|webp|svg|avif)$/i;
export const isImage = (path) => IMAGE.test(path);
export const isPdf = (path) => /\.pdf$/i.test(path);
export const TYPES = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', avif: 'image/avif', pdf: 'application/pdf' };
export const typeOf = (path) => TYPES[(/\.([a-z0-9]+)$/i.exec(path)?.[1] || '').toLowerCase()] || 'application/octet-stream';

// ---------- paths ----------
export const dirOf = (path) => (path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '');
export const fileOf = (path) => path.slice(path.lastIndexOf('/') + 1);
export const nameOf = (path) => fileOf(path).replace(/\.md$/i, '');
export const join = (dir, name) => (dir ? `${dir}/${name}` : name);
export const parents = (dir) => { const out = []; for (let d = dir; d; d = dirOf(d)) out.unshift(d); return out; };
export const inside = (path, dir) => !dir || path === dir || path.startsWith(`${dir}/`);
// a name a file can have: no slashes or the marks GitHub and computers don't take, and not starting with a dot
export function cleanName(name) {
  return String(name ?? '').replace(/[\u0000-\u001f\u007f/\\:*?"<>|#^[\]]/g, ' ').replace(/\s+/g, ' ').trim().replace(/^\.+/, '').slice(0, 120).trim();
}
// for the files the research layout makes: MacBook Pro 14 → macbook-pro-14
export const kebab = (name) => String(name).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'untitled';
const byName = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

// ---------- the vault ----------
const plain = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const okPath = (p) => typeof p === 'string' && !!p && p.split('/').every((s) => s && s !== '.' && s !== '..' && !s.startsWith('.'));
export function read() {
  const v = f.read(KEY);
  const out = { v: 1, notes: [], folders: [], files: [], moved: [] };
  if (!plain(v)) return out;
  const seen = new Set();
  for (const n of Array.isArray(v.notes) ? v.notes : []) {
    if (!plain(n) || !okPath(n.path) || !/\.md$/i.test(n.path) || seen.has(n.path.toLowerCase())) continue;
    seen.add(n.path.toLowerCase());
    out.notes.push({ path: n.path, text: String(n.text ?? ''), made: +n.made || Date.now(), edited: +n.edited || Date.now() });
  }
  for (const x of Array.isArray(v.files) ? v.files : []) {
    if (!plain(x) || !okPath(x.path) || typeof x.id !== 'string' || seen.has(x.path.toLowerCase())) continue;
    seen.add(x.path.toLowerCase());
    out.files.push({ id: x.id, path: x.path, type: String(x.type || typeOf(x.path)), size: +x.size || 0, made: +x.made || Date.now(), edited: +x.edited || Date.now(), sha: typeof x.sha === 'string' ? x.sha : '', ...(x.local ? { local: true } : {}) });
  }
  out.folders = [...new Set((Array.isArray(v.folders) ? v.folders : []).filter(okPath))];
  out.moved = Array.isArray(v.moved) ? v.moved.filter((d) => typeof d === 'string') : [];
  tidy(out);
  return out;
}
export const write = (v) => f.write(KEY, { v: 1, notes: v.notes, folders: v.folders, files: v.files, moved: v.moved });
// every folder a note or file is in is a folder too, listed once
export function tidy(v) {
  const all = new Set(v.folders);
  for (const x of [...v.notes, ...v.files]) for (const d of parents(dirOf(x.path))) all.add(d);
  for (const d of [...all]) for (const p of parents(d)) all.add(p);
  v.folders = [...all].sort(byName);
  return v;
}
export const note = (v, path) => v.notes.find((n) => n.path.toLowerCase() === String(path).toLowerCase());
export const file = (v, path) => v.files.find((x) => x.path.toLowerCase() === String(path).toLowerCase());
export const taken = (v, path) => !!(note(v, path) || file(v, path) || v.folders.some((d) => d.toLowerCase() === path.toLowerCase()));
// a name nothing else in that folder has: Untitled, then Untitled 2
export function unique(v, dir, name, ext = '') {
  for (let n = 1; ; n++) { const pick = n === 1 ? name : `${name} ${n}`; if (!taken(v, join(dir, pick + ext))) return pick; }
}

// what's in a folder: its folders, then its notes and files (a folder of days goes newest first)
export function listing(v, dir) {
  const folders = v.folders.filter((d) => dirOf(d) === dir).sort((a, b) => byName(fileOf(a), fileOf(b)));
  const things = [...v.notes, ...v.files].filter((x) => dirOf(x.path) === dir);
  const days = things.length && things.every((x) => isDay(nameOf(x.path)));
  things.sort((a, b) => (days ? byName(nameOf(b.path), nameOf(a.path)) : byName(nameOf(a.path), nameOf(b.path))));
  return { folders, things };
}

// ---------- making, moving and renaming ----------
export function makeFolder(v, dir) { v.folders.push(dir); tidy(v); return dir; }
export function makeNote(v, path, text = '') {
  const now = Date.now(), n = { path, text, made: now, edited: now };
  v.notes.push(n);
  tidy(v);
  return n;
}
// a note or file to a new path, and every link to it that has to change: links go by name, as in Obsidian, so moving
// a note keeps them, and renaming it (or a link that used its path) gets the new one
export function move(v, from, to) {
  const x = note(v, from) || file(v, from);
  if (!x || from === to) return x;
  const isNote = /\.md$/i.test(from), named = (p) => (isNote ? nameOf(p) : fileOf(p)).toLowerCase();
  const renamed = named(from) !== named(to);
  // (the links to it are found before it moves, while they still lead to it)
  const changes = [];
  for (const n of v.notes) {
    const hits = links(n.text).filter((l) => (renamed || l.target.includes('/')) && resolve(v, l.target, n.path) === x);
    if (hits.length) changes.push([n, hits]);
  }
  x.path = to;
  x.edited = Date.now();
  for (const [n, hits] of changes) {
    let text = n.text;
    for (const l of hits.sort((a, b) => b.from - a.from)) {
      const target = l.target.includes('/') ? (isNote ? to.replace(/\.md$/i, '') : to) : isNote ? nameOf(to) : fileOf(to);
      text = `${text.slice(0, l.from)}${l.embed ? '!' : ''}[[${target}${l.heading ? `#${l.heading}` : ''}${l.label ? `|${l.label}` : ''}]]${text.slice(l.to)}`;
    }
    if (text !== n.text) { n.text = text; n.edited = Date.now(); }
  }
  tidy(v);
  return x;
}
// a folder, with everything in it, to a new path
export function moveFolder(v, from, to) {
  if (from === to || inside(to, from)) return;
  for (const x of [...v.notes, ...v.files].filter((y) => inside(y.path, from))) move(v, x.path, to + x.path.slice(from.length));
  v.folders = v.folders.map((d) => (inside(d, from) ? to + d.slice(from.length) : d));
  tidy(v);
}
export function remove(v, path) {
  v.notes = v.notes.filter((n) => n.path !== path);
  const gone = v.files.filter((x) => x.path === path);
  v.files = v.files.filter((x) => x.path !== path);
  for (const x of gone) dropBlob(x.id);
}
export function removeFolder(v, dir) {
  for (const x of v.files.filter((y) => inside(y.path, dir))) dropBlob(x.id);
  v.notes = v.notes.filter((n) => !inside(n.path, dir));
  v.files = v.files.filter((x) => !inside(x.path, dir));
  v.folders = v.folders.filter((d) => !inside(d, dir));
}
// what's in a folder, in words: 2 folders · 5 notes
export function summary(v, dir) {
  const notes = v.notes.filter((n) => inside(n.path, dir) && n.path !== dir).length, files = v.files.filter((x) => inside(x.path, dir)).length;
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  return [notes && plural(notes, 'note'), files && plural(files, 'file')].filter(Boolean).join(' · ') || 'Empty';
}

// ---------- links ----------
// the note (or file) a [[link]] means: a path if it has one, or else a name, in the folder of the note it's in first,
// then the one with the shortest path, as Obsidian does
export function resolve(v, target, from = '') {
  const t = String(target).trim().replace(/^\.?\//, '');
  if (!t) return null;
  const lower = t.toLowerCase(), here = dirOf(from);
  if (t.includes('/')) return note(v, /\.md$/i.test(t) ? t : `${t}.md`) || file(v, t) || null;
  const pick = (list) => list.sort((a, b) => (dirOf(b.path) === here) - (dirOf(a.path) === here) || a.path.split('/').length - b.path.split('/').length || byName(a.path, b.path))[0] || null;
  const asNote = pick(v.notes.filter((n) => nameOf(n.path).toLowerCase() === lower.replace(/\.md$/, '')));
  if (asNote) return asNote;
  return pick(v.files.filter((x) => fileOf(x.path).toLowerCase() === lower));
}
// the notes that link here, each with the lines the links are on
export function backlinks(v, path) {
  const out = [];
  for (const n of v.notes) {
    if (n.path === path) continue;
    const hits = links(n.text).filter((l) => !l.embed && resolve(v, l.target, n.path)?.path === path);
    if (!hits.length) continue;
    const lines = [...new Set(hits.map((l) => { const a = n.text.lastIndexOf('\n', l.from - 1) + 1, b = n.text.indexOf('\n', l.to); return n.text.slice(a, b < 0 ? undefined : b).trim(); }))];
    out.push({ note: n, lines });
  }
  return out.sort((a, b) => b.note.edited - a.note.edited);
}

// ---------- the journal ----------
export const isDay = (name) => /^\d{4}-\d{2}-\d{2}$/.test(name);
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const dateOf = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
export const dayPath = (k = dayKey()) => `${JOURNAL}/${k}.md`;
// the days written in Journal, before it was part of Station (fluentio.journal), each a note in journal/ now. A day
// comes over once: deleting it here keeps it deleted
export function bringJournal(v) {
  const old = f.read('fluentio.journal');
  if (!plain(old)) return false;
  let changed = false;
  for (const [k, e] of Object.entries(old).sort()) {
    if (!isDay(k) || v.moved.includes(k) || !plain(e) || !String(e.text ?? '').trim()) continue;
    v.moved.push(k);
    changed = true;
    if (note(v, dayPath(k))) continue;
    const at = +e.edited || dateOf(k).getTime();
    v.notes.push({ path: dayPath(k), text: String(e.text).replace(/\s+$/, '') + '\n', made: at, edited: at });
  }
  if (changed) tidy(v);
  return changed;
}

// ---------- the research layout ----------
// a folder of the things you compare, a note for each one, a table for each part to compare them on, parts, images
// and your sources. Nothing already there is changed
const COLUMNS = {
  power: ['Battery', 'Charging', 'Battery life'], battery: ['Capacity', 'Cells', 'Charging'], thermals: ['Cooling', 'Fans', 'Temperature'], cooling: ['Cooling', 'Fans', 'Temperature'],
  display: ['Size', 'Resolution', 'Panel'], screen: ['Size', 'Resolution', 'Panel'], chassis: ['Material', 'Weight', 'Thickness'], case: ['Material', 'Weight', 'Thickness'],
  keyboard: ['Layout', 'Travel', 'Backlight'], storage: ['Type', 'Size', 'Slots'], memory: ['Type', 'Size', 'Upgradable'], ports: ['Ports', 'Charging port'],
  cpu: ['Chip', 'Cores', 'Power'], processor: ['Chip', 'Cores', 'Power'], audio: ['Speakers', 'Microphones', 'Jack'], camera: ['Resolution', 'Shutter'], price: ['Price', 'Where'],
};
const title = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const singular = (s) => title(s.replace(/ies$/i, 'y').replace(/(?<!s)s$/i, ''));
export const list = (text) => String(text).split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
export function researchLayout(v, { group = 'laptops', things = [], parts = [] }) {
  const R = 'research', G = join(R, kebab(group) === 'untitled' ? 'things' : cleanName(group).toLowerCase());
  for (const d of [JOURNAL, R, G, join(R, 'subsystems'), join(R, 'parts'), join(R, 'images')]) if (!v.folders.includes(d)) v.folders.push(d);
  const made = [];
  const add = (path, text) => { if (!note(v, path)) { makeNote(v, path, text); made.push(path); } };
  const slugs = things.map((t) => [t, kebab(t)]);
  for (const [t, s] of slugs) add(join(G, `${s}.md`), `# ${t}\n\n## Specs\n\n## Teardown\n\n## What I like\n`);
  for (const p of parts) {
    const cols = COLUMNS[kebab(p)] || ['Notes'];
    const table = tableText({ head: [singular(fileOf(G)), ...cols], align: [], rows: slugs.map(([, s]) => [`[[${s}]]`, ...cols.map(() => '')]) });
    add(`${R}/subsystems/${kebab(p)}.md`, `# ${title(p.trim())}\n\n${table}\n`);
  }
  add(`${R}/parts/candidates.md`, `# Candidate parts\n\n${tableText({ head: ['Part', 'For', 'Price', 'Size', 'Link'], rows: [['', '', '', '', '']] })}\n`);
  add(`${R}/sources.md`, `# Sources\n\n${tableText({ head: ['Date', 'Link', 'Used in'], rows: [] })}\n`);
  tidy(v);
  return made;
}

// ---------- sources ----------
// a link you paste goes into your sources note with the day, once: the note called sources (research/sources.md first),
// made if there isn't one. Returns the note and whether the link went in
export function addSource(v, url, from) {
  let src = v.notes.find((n) => n.path.toLowerCase() === 'research/sources.md') || v.notes.find((n) => nameOf(n.path).toLowerCase() === 'sources');
  if (src && src.text.includes(url)) return { note: src, added: false };
  if (from && nameOf(from).toLowerCase() === 'sources') return { note: src, added: false };
  if (!src) src = makeNote(v, v.folders.includes('research') ? 'research/sources.md' : 'sources.md', `# Sources\n\n${tableText({ head: ['Date', 'Link', 'Used in'], rows: [] })}\n`);
  const before = src.text, used = from ? `[[${nameOf(from)}]]` : '';
  const table = blocks(src.text).find((b) => b.kind === 'table');
  if (table) {
    const t = parseTable(src.text.slice(table.from, table.to)), row = t.head.map(() => '');
    const col = (re, fallback) => { const i = t.head.findIndex((h) => re.test(h)); return i >= 0 ? i : fallback; };
    const when = col(/\b(date|day|when)\b/i, 0), link = col(/\b(link|url|address|source|where)\b/i, Math.min(1, row.length - 1)), from = col(/\bused\b|^in$|\bnotes?\b/i, 2);
    row[when] = dayKey();
    row[link] = url;
    if (row.length > 2 && from !== when && from !== link) row[from] = used;
    t.rows.push(row);
    src.text = src.text.slice(0, table.from) + tableText(t) + src.text.slice(table.to);
  } else src.text = `${src.text.replace(/\s+$/, '')}\n\n- ${dayKey()} · ${url}${used ? ` · ${used}` : ''}\n`;
  src.edited = Date.now();
  return { note: src, added: true, before };
}

// ---------- pictures and PDFs: IndexedDB ----------
let opened = null;
const db = () => (opened ??= new Promise((done, failed) => {
  const r = indexedDB.open('fluence-notes', 1);
  r.onupgradeneeded = () => r.result.createObjectStore('files');
  r.onsuccess = () => done(r.result);
  r.onerror = () => failed(r.error);
}));
const run = async (mode, fn) => {
  const d = await db();
  return new Promise((done, failed) => { const t = d.transaction('files', mode), r = fn(t.objectStore('files')); t.oncomplete = () => done(r?.result); t.onerror = () => failed(t.error); t.onabort = () => failed(t.error); });
};
export const getBlob = (id) => run('readonly', (s) => s.get(id)).catch(() => null);
export const putBlob = (id, blob) => run('readwrite', (s) => s.put(blob, id));
export const dropBlob = (id) => run('readwrite', (s) => s.delete(id)).catch(() => {});
export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
// a picture or PDF into the vault: its bytes here, its place in the list. A PDF stays on this computer only (it never
// goes to GitHub, so a repo you make public later has your own words and pictures in it, not someone else's documents)
export async function addFile(v, dir, name, blob) {
  const clean = cleanName(name) || 'file';
  const dot = clean.lastIndexOf('.'), base = dot > 0 ? clean.slice(0, dot) : clean, ext = dot > 0 ? clean.slice(dot).toLowerCase() : '';
  const path = join(dir, unique(v, dir, base, ext) + ext), id = newId(), now = Date.now();
  await putBlob(id, blob);
  const x = { id, path, type: blob.type || typeOf(path), size: blob.size, made: now, edited: now, sha: '', ...(isPdf(path) ? { local: true } : {}) };
  v.files.push(x);
  tidy(v);
  return x;
}
// where a note's pictures go: the images folder in its folder or the nearest one above it, or else the first images
// folder anywhere, or else a new images folder at the top
export function imagesFor(v, path) {
  for (let d = dirOf(path); ; d = dirOf(d)) {
    const here = join(d, 'images');
    if (v.folders.some((x) => x.toLowerCase() === here.toLowerCase())) return here;
    if (!d) break;
  }
  return v.folders.filter((d) => fileOf(d).toLowerCase() === 'images').sort((a, b) => a.length - b.length)[0] || 'images';
}
