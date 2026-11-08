// Station on GitHub: your notes as Markdown files in their folders, with your pictures beside them, on the notes branch
// of the repo you're connected to (Music's connection). It's laid out like an Obsidian vault, so the branch opens there
// too, and a note changed on GitHub (or with git) comes back here. PDFs stay on this computer and never go up.
// A sync puts three copies together, file by file: GitHub's, this browser's, and the one both had after the last sync.
// What only one side changed is taken from that side (deleting counts too). A note both sides changed keeps this
// browser's words, and GitHub's go beside it as a note of their own, so nothing is ever lost. Then one commit.
// A browser with nothing in Station yet (a new one, or one whose storage was cleared) only ever takes from GitHub.
import { connection, call, explain } from '../kit/music/github.js';
import * as store from './store.js';

const f = window.fluentio;
export const BRANCH = 'notes';
const STATE = 'fluentio:station';    // (not 'fluentio.', so backups and progress leave it alone)
const KEEP = '.gitkeep', EMPTY = 'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391';   // (git's id for an empty file)
const TEXT = /\.md$/i;
// the files a sync looks after: notes, pictures, and the empty .gitkeep that keeps an empty folder. Anything else on
// the branch (a PDF, or Obsidian's own settings) is left as it is
export function handled(path) {
  const parts = path.split('/'), name = parts.at(-1);
  if (parts.slice(0, -1).some((p) => !p || p.startsWith('.'))) return false;
  return name === KEEP || (!name.startsWith('.') && (TEXT.test(name) || store.isImage(name)));
}

// ---------- bytes ----------
const enc = new TextEncoder(), dec = new TextDecoder();
export async function sha(bytes) {
  const head = enc.encode(`blob ${bytes.length}\0`), all = new Uint8Array(head.length + bytes.length);
  all.set(head);
  all.set(bytes, head.length);
  return [...new Uint8Array(await crypto.subtle.digest('SHA-1', all))].map((b) => b.toString(16).padStart(2, '0')).join('');
}
const toBase64 = (bytes) => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(s); };
const fromBase64 = (b64) => Uint8Array.from(atob(String(b64).replace(/\s/g, '')), (c) => c.charCodeAt(0));

// ---------- each side ----------
const readState = () => { const s = f.read(STATE); return s && typeof s === 'object' ? s : {}; };
// where this browser's notes are: the page's own copy (so a sync never works from an older one in storage), how to keep
// it once a sync has changed it, and whether a note is being typed in right now (GitHub's changes wait for it)
let source = { get: () => store.read(), put: (v) => store.write(v), busy: () => false };
export const use = (s) => { source = { ...source, ...s }; };
// this browser's files: path → { sha, and the note, file or empty folder it is }
async function mine(v) {
  const out = new Map();
  for (const n of v.notes) out.set(n.path, { sha: await sha(enc.encode(n.text)), text: n.text });
  for (const x of v.files) {
    if (x.local) continue;
    if (!x.sha) { const blob = await store.getBlob(x.id); if (!blob) continue; x.sha = await sha(new Uint8Array(await blob.arrayBuffer())); }
    out.set(x.path, { sha: x.sha, file: x });
  }
  const shared = [...v.notes, ...v.files.filter((x) => !x.local)];
  for (const d of v.folders) {
    const empty = !shared.some((y) => store.inside(y.path, d)) && !v.folders.some((e) => e !== d && store.inside(e, d));
    if (empty) out.set(`${d}/${KEEP}`, { sha: EMPTY, keep: d });
  }
  return out;
}
// GitHub's: the branch's last commit, its tree, and its files (path → sha)
async function theirs(s, last) {
  let head;
  try { head = (await call(s, 'GET', `/git/ref/heads/${BRANCH}`)).object.sha; }
  catch (e) { if (e.status === 404 || e.status === 409) return { head: '', tree: '', files: new Map() }; throw e; }
  if (head === last.commit && last.files && last.tree) return { head, tree: last.tree, files: new Map(Object.entries(last.files)) };
  const commit = await call(s, 'GET', `/git/commits/${head}`);
  const list = await call(s, 'GET', `/git/trees/${commit.tree.sha}?recursive=1`);
  return { head, tree: commit.tree.sha, files: new Map(list.tree.filter((x) => x.type === 'blob').map((x) => [x.path, x.sha])) };
}
const bytesOf = async (s, id) => fromBase64((await call(s, 'GET', `/git/blobs/${id}`)).content);

// ---------- one sync ----------
// ({ changed: whether this browser's notes changed, done: false when it has to go again })
async function once(s) {
  const was = readState(), last = was.repo === s.repo ? was : {};
  const v = source.get(), L = await mine(v), T = await theirs(s, last);
  const R = new Map([...T.files].filter(([p]) => handled(p))), B = new Map(Object.entries(last.files || {}).filter(([p]) => handled(p)));
  const fresh = !v.notes.length && !v.files.length && !v.folders.length;
  const take = [], give = [], goHere = [], goThere = [], both = [];
  for (const path of new Set([...L.keys(), ...R.keys(), ...B.keys()])) {
    const l = L.get(path)?.sha, r = R.get(path), b = B.get(path);
    if (l === r) continue;
    if (fresh) { if (r) take.push(path); continue; }
    if (l === b) (r ? take : goHere).push(path);
    else if (r === b) (l ? give : goThere).push(path);
    else if (!l) take.push(path);                 // (gone from here, changed there: it comes back)
    else if (!r) give.push(path);                 // (changed here, gone from there: it goes back)
    else { give.push(path); if (TEXT.test(path)) both.push(path); }   // (changed on both: this one, and theirs beside it)
  }

  // GitHub's changes, fetched, then put in, but never over something changed here while this was running
  const got = new Map();
  for (const path of [...take, ...both]) if (!path.endsWith(`/${KEEP}`)) got.set(path, await bytesOf(s, R.get(path)));
  let changed = false, again = false;
  if (take.length || goHere.length || both.length) {
    const now = source.get();
    const same = (path) => { if (source.busy(path)) return false; const n = store.note(now, path), x = store.file(now, path), was = L.get(path); return was ? (was.text !== undefined ? n?.text === was.text : x?.id === was.file?.id) : !n && !x; };
    for (const path of take) {
      if (!same(path)) { again = true; continue; }
      if (path.endsWith(`/${KEEP}`)) { const d = path.slice(0, -KEEP.length - 1); if (!now.folders.includes(d)) { now.folders.push(d); changed = true; } continue; }
      const bytes = got.get(path);
      if (TEXT.test(path)) {
        const text = dec.decode(bytes), n = store.note(now, path);
        if (n) { n.text = text; n.edited = Date.now(); } else now.notes.push({ path, text, made: Date.now(), edited: Date.now() });
      } else {
        const id = store.newId(), old = store.file(now, path), blob = new Blob([bytes], { type: store.typeOf(path) });
        await store.putBlob(id, blob);
        if (old) { store.dropBlob(old.id); Object.assign(old, { id, size: blob.size, sha: R.get(path), edited: Date.now() }); }
        else now.files.push({ id, path, type: blob.type, size: blob.size, made: Date.now(), edited: Date.now(), sha: R.get(path) });
      }
      changed = true;
    }
    for (const path of goHere) {
      if (!same(path)) { again = true; continue; }
      if (path.endsWith(`/${KEEP}`)) continue;
      store.remove(now, path);
      changed = true;
    }
    for (const path of both) {
      const dir = store.dirOf(path), name = store.unique(now, dir, `${store.nameOf(path)} (from GitHub)`, '.md');
      store.makeNote(now, store.join(dir, `${name}.md`), dec.decode(got.get(path)));
      changed = true;
    }
    // (a folder emptied on GitHub, not just here, goes too)
    for (let gone = true; gone;) {
      gone = false;
      for (const d of [...now.folders]) {
        const empty = ![...now.notes, ...now.files].some((y) => store.inside(y.path, d)) && !now.folders.some((e) => e !== d && store.inside(e, d));
        const knew = [...B.keys()].some((p) => store.inside(p, d)), has = [...R.keys()].some((p) => store.inside(p, d));
        if (empty && knew && !has) { now.folders = now.folders.filter((e) => e !== d); gone = changed = true; }
      }
    }
    if (changed) { store.tidy(now); source.put(now); }
  }

  // and this browser's, up to GitHub as one commit
  const tree = [];
  for (const path of give) {
    const x = L.get(path);
    if (x.text !== undefined) tree.push({ path, mode: '100644', type: 'blob', content: x.text });
    else if (x.keep) tree.push({ path, mode: '100644', type: 'blob', content: '' });
    else {
      const blob = await store.getBlob(x.file.id);
      if (!blob) continue;
      const made = await call(s, 'POST', '/git/blobs', { content: toBase64(new Uint8Array(await blob.arrayBuffer())), encoding: 'base64' });
      tree.push({ path, mode: '100644', type: 'blob', sha: made.sha });
    }
  }
  for (const path of goThere) if (T.files.has(path)) tree.push({ path, mode: '100644', type: 'blob', sha: null });
  const files = new Map(T.files);
  let commit = T.head, top = T.tree;
  if (tree.length) {
    const named = [...new Set([...give, ...goThere].filter((p) => !p.endsWith(KEEP)).map((p) => store.nameOf(p)))];
    const message = `${named.length ? `${named.slice(0, 3).join(', ')}${named.length > 3 ? ` and ${named.length - 3} more` : ''}` : 'Folders'} (from Fluence)`;
    const made = await call(s, 'POST', '/git/trees', T.tree ? { base_tree: T.tree, tree } : { tree: tree.filter((x) => x.sha !== null) });
    const c = await call(s, 'POST', '/git/commits', { message, tree: made.sha, parents: T.head ? [T.head] : [] });
    try {
      if (T.head) await call(s, 'PATCH', `/git/refs/heads/${BRANCH}`, { sha: c.sha, force: false });
      else await call(s, 'POST', '/git/refs', { ref: `refs/heads/${BRANCH}`, sha: c.sha });
    } catch (e) { if (e.status === 422 || e.status === 409) return { changed, done: false }; throw e; }   // (GitHub moved on meanwhile: again)
    for (const x of tree) if (x.sha === null) files.delete(x.path); else files.set(x.path, x.sha ?? L.get(x.path).sha);
    commit = c.sha;
    top = made.sha;
  }
  f.write(STATE, { repo: s.repo, commit, tree: top, files: Object.fromEntries(files), at: Date.now() });
  return { changed, done: !again };
}

// ---------- when it syncs ----------
// run() syncs now (or once the one going is done), soon() a few seconds after the last change, and listen() hears how
// it went: 'syncing', 'synced', 'error' (with what went wrong), and 'changed' when GitHub brought something here
const listeners = new Set();
let timer = 0, running = null, more = false, last = { status: 'idle', error: '', at: readState().at || 0 };
export const connected = () => !!connection();
export const repo = () => connection()?.repo || '';
export const listen = (fn) => listeners.add(fn);
export const status = () => last;
const tell = (what, extra = {}) => {
  if (what !== 'changed') last = { ...last, ...extra, status: what };
  for (const fn of listeners) fn(what, last);
};
export function soon(ms = 3500) {
  if (!connected()) return;
  clearTimeout(timer);
  timer = setTimeout(run, ms);
}
export function run() {
  const s = connection();
  if (!s) return Promise.resolve(false);
  if (running) { more = true; return running; }
  clearTimeout(timer);
  running = (async () => {
    let changed = false;
    tell('syncing');
    try {
      for (let tries = 0; ; tries++) {
        const r = await once(s);
        changed ||= r.changed;
        if (r.done) break;
        if (tries >= 4) throw new Error('Things kept changing while Station was saving. It tries again soon.');
      }
      tell('synced', { at: Date.now(), error: '' });
    } catch (e) { tell('error', { error: explain(e, s) }); }
    running = null;
    if (changed) tell('changed');
    if (more) { more = false; soon(1500); }
    return changed;
  })();
  return running;
}
