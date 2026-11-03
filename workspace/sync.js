// Data, Code and Notes saved to a private GitHub repo too (Settings → GitHub), so every browser and Fluent workspace
// connected to it shows the same things. The repo keeps them as files, laid out like their folders: notes/<folders>/
// <note>.md, data/<databases>/<doc>.md and <sheet>.csv, and code/<folders>/<file>, with fluentio.json keeping what files
// can't (ids, folders, when each was made and changed, a doc's link, a Python file's input).
// A sync gets what changed on GitHub, puts it together with what changed here (the newer change wins, and something
// deleted on one side goes from the other unless it was changed there since), then saves the result as one commit. Text
// changed in a file on GitHub comes back too. The token stays in this browser only (never in a backup), so it should be
// one that can only read and write that one repo.
const f = window.fluentio;
const KEY = 'fluentio:github';                      // (not 'fluentio.', so backups, restores and Empty leave it alone)
const FOLDERS = 'fluentio.workspace.folders';
const DIR = { notes: 'notes', database: 'data', code: 'code' };
const TAB = { note: 'notes', doc: 'database', table: 'database', code: 'code' };
const ENDING = { note: '.md', doc: '.md', table: '.csv', code: '' };
const README = `# Database

Fluence's Data, Code and Notes, saved here by Fluence (Settings → GitHub).

* **notes/** has your notes as Markdown, in their folders.
* **data/** has your databases, each doc as Markdown and each sheet as CSV.
* **code/** has your code files, in their folders.
* **fluentio.json** keeps what the files can't: each one's id and folder, when it was made and changed, a doc's link and a Python file's input.

Change a file's text here and Fluence takes the change the next time it syncs. Making, moving and renaming things happens in Fluence.
`;

// ---------- the connection, kept in this browser ----------
const load = () => {
  try { const s = JSON.parse(localStorage.getItem(KEY)); return s && typeof s.token === 'string' && /^[\w.-]+\/[\w.-]+$/.test(s.repo) ? s : null; }
  catch { return null; }
};
const keep = (s) => { try { if (s) localStorage.setItem(KEY, JSON.stringify(s)); else localStorage.removeItem(KEY); return true; } catch { return false; } };
export const connected = () => !!load();
export const repo = () => load()?.repo || '';

// one call to GitHub's API, as the token (a stand-in GitHub for testing can be given at connect)
async function gh(s, method, path, body) {
  let r;
  try {
    r = await fetch(`${s.api || 'https://api.github.com'}/repos/${s.repo}${path}`, { method, cache: 'no-store', body: body ? JSON.stringify(body) : undefined,
      headers: { Authorization: `Bearer ${s.token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(body ? { 'Content-Type': 'application/json' } : {}) } });
  } catch { throw Object.assign(new Error('Couldn’t reach GitHub. Check that you’re online.'), { status: 0 }); }
  const data = await r.json().catch(() => null);
  if (!r.ok) throw Object.assign(new Error(data?.message || `GitHub answered ${r.status}`), { status: r.status });
  return data;
}
// what went wrong, in words
function explain(e, s) {
  const name = s?.repo || 'the repo';
  if (e.status === 401) return 'GitHub didn’t take the token. It may have expired: make a new one and connect again.';
  if (e.status === 403) return /rate limit/i.test(e.message) ? 'GitHub asked Fluence to slow down. It tries again in a minute.' : `The token can’t write to ${name}. It needs Contents: Read and write.`;
  if (e.status === 404) return `GitHub has no repo called ${name} that the token can see.`;
  return e.message || 'Something went wrong with GitHub.';
}

// ---------- your things as files ----------
// a name that works for a file or folder on GitHub
function safe(name, fallback) {
  const n = String(name ?? '').replace(/[\u0000-\u001f\u007f/\\:*?"<>|]/g, '_').trim().slice(0, 120);
  return !n || n === '.' || n === '..' || n.toLowerCase() === '.git' ? fallback : n;
}
// things in the order they were made (so every browser lists them alike, and writes the same files)
const byMade = (a, b) => (a.made || 0) - (b.made || 0) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
// where each folder and thing goes: its space's folder, then its own folders (two with the same name get a 2, a 3,
// in the order they were made, so a name keeps its place)
export function layout({ items, folders }) {
  const where = new Map(), taken = new Map();
  const claim = (dir, name) => {
    const names = taken.get(dir) || taken.set(dir, new Set()).get(dir), dot = name.lastIndexOf('.');
    const [base, ext] = dot > 0 ? [name.slice(0, dot), name.slice(dot)] : [name, ''];
    let pick = name;
    for (let n = 2; names.has(pick.toLowerCase()); n++) pick = `${base} ${n}${ext}`;
    names.add(pick.toLowerCase());
    return `${dir}/${pick}`;
  };
  const of = new Map(folders.map((x) => [x.id, x]));
  const top = (x) => !x.parent || of.get(x.parent)?.tab !== x.tab;
  const walk = (list, dir) => {
    for (const x of list.sort(byMade)) {
      const path = claim(dir, safe(x.title, 'Untitled'));
      where.set(x.id, path);
      walk(folders.filter((y) => y.parent === x.id && y.tab === x.tab && y.id !== x.id), path);
    }
  };
  for (const [tab, dir] of Object.entries(DIR)) walk(folders.filter((x) => x.tab === tab && top(x)), dir);
  for (const it of [...items].sort(byMade)) {
    const up = of.get(it.parent), dir = up && up.tab === TAB[it.kind] && where.has(up.id) ? where.get(up.id) : DIR[TAB[it.kind]];
    where.set(it.id, claim(dir, safe(it.title, it.kind === 'code' ? 'untitled.txt' : 'Untitled') + ENDING[it.kind]));
  }
  return where;
}
// a sheet as CSV and back: always commas, and every row kept, so a sheet comes back just as it went
export const toCsv = (rows) => rows.map((r) => r.map((c) => (/[",\n\r]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(',')).join('\n') + '\n';
export function fromCsv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) { if (ch !== '"') cell += ch; else if (text[i + 1] === '"') { cell += '"'; i++; } else quoted = false; }
    else if (ch === '"' && cell === '') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows;
}
const sheetOf = (text) => {
  const rows = fromCsv(text), width = Math.max(1, ...rows.map((r) => r.length)), pad = (r) => Array.from({ length: width }, (_, i) => r[i] ?? '');
  return { cols: pad(rows[0] || []), rows: rows.slice(1).map(pad) };
};
const textOf = (it) => (it.kind === 'table' ? toCsv([it.cols || [], ...(it.rows || [])]) : String(it.text ?? ''));
// a file's id in git (so files that haven't changed aren't sent again)
export async function blobSha(text) {
  const body = new TextEncoder().encode(text), head = new TextEncoder().encode(`blob ${body.length}\0`), all = new Uint8Array(head.length + body.length);
  all.set(head);
  all.set(body, head.length);
  return [...new Uint8Array(await crypto.subtle.digest('SHA-1', all))].map((b) => b.toString(16).padStart(2, '0')).join('');
}
const fromBase64 = (b64) => new TextDecoder().decode(Uint8Array.from(atob(String(b64).replace(/\s/g, '')), (c) => c.charCodeAt(0)));
const toBase64 = (text) => { let s = ''; for (const b of new TextEncoder().encode(text)) s += String.fromCharCode(b); return btoa(s); };

// ---------- putting two sides together ----------
// a list from here and from GitHub, by id, with what both had at the last sync: the newer change wins, and something
// gone from one side goes from the other too, unless that side changed it since
export function mergeList(base, here, there) {
  const was = new Map(base.map((x) => [x.id, x.edited])), H = new Map(here.map((x) => [x.id, x])), T = new Map(there.map((x) => [x.id, x]));
  const list = [], taken = new Set();
  for (const id of new Set([...H.keys(), ...T.keys()])) {
    const h = H.get(id), t = T.get(id), b = was.get(id);
    const pick = h && t ? (t.edited > h.edited ? t : h) : h ? (b === undefined || h.edited > b ? h : null) : b === undefined || t.edited > b ? t : null;
    if (!pick) continue;
    list.push(pick);
    if (pick === t && pick !== h) taken.add(id);
  }
  return { list, taken };
}
const local = () => ({ items: f.workspace.items(), folders: f.workspace.folders() });
// GitHub's side: the branch's last commit, its files (path → blob), and fluentio.json, with a thing whose file was
// changed on GitHub since counted as changed then, and one whose file was deleted there counted as deleted
async function remote(s) {
  let head;
  try { head = (await gh(s, 'GET', `/git/ref/heads/${encodeURIComponent(s.branch)}`)).object.sha; }
  catch (e) { if (e.status === 409) return { head: '', tree: '', files: new Map(), index: null }; throw e; }
  if (head === s.commit && s.index) return { head, tree: s.tree, files: new Map(Object.entries(s.files || {})), index: structuredClone(s.index) };
  const commit = await gh(s, 'GET', `/git/commits/${head}`);
  const listing = await gh(s, 'GET', `/git/trees/${commit.tree.sha}?recursive=1`);
  const files = new Map(listing.tree.filter((x) => x.type === 'blob').map((x) => [x.path, x.sha]));
  let index = null;
  if (files.has('fluentio.json')) try { index = JSON.parse(await blob(s, files.get('fluentio.json'))); } catch { index = null; }
  if (index) {
    const when = Date.parse(commit.committer?.date) || Date.now();
    index.items = (Array.isArray(index.items) ? index.items : []).filter((it) => it && typeof it.id === 'string' && files.has(it.path));
    for (const it of index.items) if (files.get(it.path) !== it.sha) Object.assign(it, { edited: Math.max(it.edited || 0, when), sha: files.get(it.path) });
    index.folders = (Array.isArray(index.folders) ? index.folders : []).filter((x) => x && typeof x.id === 'string');
  }
  return { head, tree: commit.tree.sha, files, index };
}
const blob = async (s, sha) => fromBase64((await gh(s, 'GET', `/git/blobs/${sha}`)).content);
// a thing as fluentio.json has it, and back (with its file's text)
const entry = (it, path, sha) => ({ id: it.id, kind: it.kind, title: it.title, parent: it.parent || '', made: it.made, edited: it.edited, path, sha,
  ...(it.kind === 'doc' && it.link ? { link: it.link } : {}), ...(it.kind === 'code' && it.input ? { input: it.input } : {}) });
function thing(r, text) {
  const it = { id: r.id, kind: r.kind, title: String(r.title ?? ''), parent: r.parent || '', made: r.made, edited: r.edited };
  if (r.kind === 'table') Object.assign(it, sheetOf(text)); else it.text = text;
  if (r.kind === 'doc') it.link = r.link || '';
  if (r.kind === 'code') it.input = r.input || '';
  return it;
}
const folder = ({ id, tab, title, parent, made, edited }) => ({ id, tab, title, parent: parent || '', made, edited });
// GitHub's changes into this browser, but never over something changed here while the sync was running
function bring(before, merged, taken) {
  const now = local();
  let changed = false;
  const fix = (list, was, keepList, from) => {
    const at = new Map(was.map((x) => [x.id, x.edited])), out = new Map(list.map((x) => [x.id, x])), kept = new Set(keepList.map((x) => x.id));
    for (const x of keepList) {
      if (!from.has(x.id)) continue;
      const cur = out.get(x.id);
      if (cur ? cur.edited === at.get(x.id) : !at.has(x.id)) { out.set(x.id, x); changed = true; }
    }
    for (const [id, edited] of at) if (!kept.has(id) && out.has(id) && out.get(id).edited === edited) { out.delete(id); changed = true; }
    return [...out.values()];
  };
  const items = fix(now.items, before.items, merged.items, taken.items), folders = fix(now.folders, before.folders, merged.folders, taken.folders);
  if (changed) { f.workspace.save(items); f.write(FOLDERS, { v: 1, folders }); }
  return changed;
}

// one sync: GitHub's side, put together with this browser's, brought here, and saved to GitHub as one commit
// ({ changed: whether this browser's things changed, done: false when it has to go again })
async function once(s) {
  const here = local(), there = await remote(s);
  if (!there.head) {
    // (an empty repo takes no commits of this kind, so its first is the README, made the simple way)
    await gh(s, 'PUT', '/contents/README.md', { message: 'Fluence’s data', content: toBase64(README) });
    return { changed: false, done: false };
  }
  const base = s.index || { items: [], folders: [] }, theirs = there.index || { items: [], folders: [] };
  const folders = mergeList(base.folders || [], here.folders, theirs.folders);
  const items = mergeList(base.items || [], here.items, theirs.items);
  // GitHub's versions, with their files' text (not fetched when it's the same as here)
  const mine = new Map(here.items.map((x) => [x.id, x])), list = [];
  for (const x of items.list) {
    if (!items.taken.has(x.id)) { list.push(x); continue; }
    const same = mine.has(x.id) && (await blobSha(textOf(mine.get(x.id)))) === x.sha;
    list.push(thing(x, same ? textOf(mine.get(x.id)) : await blob(s, x.sha)));
  }
  const merged = { items: list, folders: folders.list.map(folder) };
  const changed = bring(here, merged, { items: items.taken, folders: folders.taken });

  // what the repo should have: each thing's file, fluentio.json, and a README if it has none
  const where = layout(merged), want = new Map(), sha = new Map();
  for (const it of merged.items) { const text = textOf(it), path = where.get(it.id); want.set(path, text); sha.set(path, await blobSha(text)); }
  const index = { app: 'Fluentio', v: 1, folders: [...merged.folders].sort(byMade), items: [...merged.items].sort(byMade).map((it) => entry(it, where.get(it.id), sha.get(where.get(it.id)))) };
  want.set('fluentio.json', `${JSON.stringify(index, null, 2)}\n`);
  if (!there.files.has('README.md')) want.set('README.md', README);
  for (const path of ['fluentio.json', 'README.md']) if (want.has(path)) sha.set(path, await blobSha(want.get(path)));
  const tree = [...want].filter(([path]) => there.files.get(path) !== sha.get(path)).map(([path, content]) => ({ path, mode: '100644', type: 'blob', content }));
  // (a file Fluence saved before that nothing has now goes, but files put in the repo some other way stay)
  const gone = (theirs.items || []).map((x) => x.path).filter((path) => !want.has(path) && there.files.has(path));
  for (const path of new Set(gone)) tree.push({ path, mode: '100644', type: 'blob', sha: null });
  const files = new Map(there.files);
  if (tree.length) {
    // (the commit names what changed: each thing or folder whose file, name, place or details are new, though not one
    // whose only change is the time, as a folder has when something in it changes)
    const what = ({ edited, ...rest }) => JSON.stringify(rest);
    const was = new Map([...(theirs.items || []), ...(theirs.folders || [])].map((x) => [x.id, what(x)]));
    const named = [...index.folders, ...index.items].filter((x) => was.get(x.id) !== what(x)).map((x) => x.title || 'Untitled');
    const message = [named.length ? `${named.slice(0, 3).join(', ')}${named.length > 3 ? ` and ${named.length - 3} more` : ''}` : '', gone.length ? `${gone.length} deleted` : ''].filter(Boolean).join(', ') || 'Fluence’s index';
    const made = await gh(s, 'POST', '/git/trees', { base_tree: there.tree, tree });
    const commit = await gh(s, 'POST', '/git/commits', { message: `${message} (from Fluence)`, tree: made.sha, parents: [there.head] });
    try { await gh(s, 'PATCH', `/git/refs/heads/${encodeURIComponent(s.branch)}`, { sha: commit.sha, force: false }); }
    catch (e) { if (e.status === 422 || e.status === 409) return { changed, done: false }; throw e; }  // (GitHub moved on meanwhile: again)
    for (const x of tree) if (x.sha === null) files.delete(x.path); else files.set(x.path, sha.get(x.path));
    Object.assign(s, { commit: commit.sha, tree: made.sha });
  } else Object.assign(s, { commit: there.head, tree: there.tree });
  Object.assign(s, { files: Object.fromEntries(files), index, at: Date.now() });
  if (load()) keep(s);
  return { changed, done: true };
}

// ---------- when it syncs ----------
// run() syncs now (or after the one running), soon() a few seconds after the last change, and listen() hears how it went:
// ('syncing'), ('synced'), ('error', with what went wrong) and ('changed', when GitHub brought something here)
const listeners = new Set();
let timer = 0, running = null, again = false, last = { status: 'idle', error: '', at: load()?.at || 0 };
export const listen = (fn) => listeners.add(fn);
export const status = () => last;
const tell = (what, more = {}) => {
  if (what !== 'changed') last = { ...last, ...more, status: what };
  for (const fn of listeners) fn(what, last);
};
export function soon(ms = 4000) {
  if (!connected()) return;
  clearTimeout(timer);
  timer = setTimeout(run, ms);
}
export function run() {
  if (!connected()) return Promise.resolve(false);
  if (running) { again = true; return running; }
  clearTimeout(timer);
  running = (async () => {
    let changed = false;
    tell('syncing');
    try {
      for (let tries = 0; ; tries++) {
        const s = load();
        if (!s) break;
        const r = await once(s);
        changed ||= r.changed;
        if (r.done) break;
        if (tries >= 4) throw new Error('GitHub kept changing while this was saving. Fluence tries again soon.');
      }
      tell('synced', { at: Date.now(), error: '' });
    } catch (e) { tell('error', { error: explain(e, load()) }); }
    running = null;
    if (changed) tell('changed');
    if (again) { again = false; soon(1500); }
    return changed;
  })();
  return running;
}
// connecting: the repo (owner/name) has to be there and private, and the token able to see it; then the first sync
export async function connect(name, token, api) {
  const s = { repo: String(name).trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/\/+$/, ''), token: String(token).trim(), ...(api ? { api } : {}) };
  if (!/^[\w.-]+\/[\w.-]+$/.test(s.repo)) throw new Error('Write the repo as owner/name, like TrixWotel/Database.');
  if (!s.token) throw new Error('Paste the token first.');
  let info;
  try { info = await gh(s, 'GET', ''); } catch (e) { throw new Error(explain(e, s)); }
  if (!info.private) throw new Error(`${s.repo} is public, so anyone could read your things there. Make it private on GitHub first.`);
  s.branch = info.default_branch || 'main';
  if (!keep(s)) throw new Error('This browser’s storage is full or turned off.');
  return run();
}
// disconnecting forgets the token in this browser (what's here and on GitHub both stay)
export function disconnect() {
  clearTimeout(timer);
  keep(null);
  tell('idle', { error: '', at: 0 });
}
