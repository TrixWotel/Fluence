// Your progress, saved in the repo you're connected to (Music's connection, or Data, Code and Notes'), so every browser
// connected to it carries on from the same place: topics learned, best scores, tests under way, days in a row, today's
// question, and whatever else a subject keeps under 'fluentio.'. It lives on the repo's progress branch as progress.json,
// which has the same shape as a backup, so Settings can restore it too.
// A save looks at GitHub first and puts the two copies together (merge, below), so a page never overwrites what another
// browser saved. It happens as a page opens, every 20 seconds at most while something changes, and as a page goes.
// When GitHub had something new, a page nobody has touched yet reloads with it; a page in use keeps what it has on screen
// (it would save over the new things otherwise), and the next page brings them in.
import { connection, call, explain } from './music/github.js';

const KEY = 'fluentio:progress', BRANCH = 'progress', FILE = 'progress.json', MESSAGE = 'Progress (from Fluence)';   // (not 'fluentio.', so it isn't saved with the rest)
// what isn't progress: how this browser looks, and what has its own place (Music and Station on their branches, Data, Code
// and Notes on main)
const OTHERS = /^fluentio\.(?:look$|music\.|workspace|ws\.|station(?:$|\.))/;
const README = `# Progress

Your progress in Fluence (https://trixwotel.github.io/Fluence/), saved here by itself: topics learned, best scores, tests under way, days in a row.

**progress.json** has it all, and Settings → Your data → Restore a backup can read it. Its history here is every save.
`;
const plain = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
// the same text whatever order an object's keys are in
const canon = (v) => (Array.isArray(v) ? `[${v.map(canon).join()}]` : plain(v) ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join()}}` : JSON.stringify(v) ?? 'null');
const same = (a, b) => canon(a) === canon(b);
const stamp = (x) => x.at ?? x.when ?? (x.day ? Date.parse(x.day) : undefined);

// Puts two copies together, given the copy they both came from. What only one side changed is taken as it is (deleting
// counts, so Start over reaches every browser). Where both changed something: the better score, then the newer of
// anything that says when it's from, and otherwise field by field, the bigger number and the true over the false.
export function merge(base, ours, theirs) {
  if (same(ours, theirs) || same(theirs, base)) return ours;
  if (same(ours, base)) return theirs;
  if (!plain(ours) || !plain(theirs)) {
    if (typeof ours === 'number' && typeof theirs === 'number') return Math.max(ours, theirs);
    if (typeof ours === 'boolean' && typeof theirs === 'boolean') return ours || theirs;
    return ours ?? theirs;
  }
  if (Number.isFinite(ours.score) && Number.isFinite(theirs.score)) {
    const a = ours.score / (ours.of || 1), b = theirs.score / (theirs.of || 1);
    if (a !== b) return a > b ? ours : theirs;
  }
  if (Number.isFinite(ours.pct) && Number.isFinite(theirs.pct)) return ours.pct > theirs.pct || (ours.pct === theirs.pct && ours.ms <= theirs.ms) ? ours : theirs;
  const a = stamp(ours), b = stamp(theirs);
  if (a != null && b != null) {
    const newer = b > a ? theirs : ours;
    // (your visits: the most on either side, so a new browser's first visit doesn't start them over)
    return Number.isFinite(ours.count) && Number.isFinite(theirs.count) ? { ...newer, count: Math.max(ours.count, theirs.count), streak: Math.max(ours.streak || 1, theirs.streak || 1) } : newer;
  }
  const out = {};
  for (const k of new Set([...Object.keys(ours), ...Object.keys(theirs)])) {
    const v = merge(plain(base) ? base[k] : undefined, ours[k], theirs[k]);
    if (v !== undefined) out[k] = v;
  }
  return out;
}
// what's worth a save: a visit's time alone isn't (the home page changes it each time it opens)
export function meaning(data) {
  const { at, ...visits } = data['fluentio.visits'] || {};
  return canon({ ...data, 'fluentio.visits': visits });
}
export const ours = (key) => key.startsWith('fluentio.') && !OTHERS.test(key);

// ---------- this browser ----------
function mine() {
  const out = {};
  for (const k of Object.keys(localStorage)) if (ours(k)) try { out[k] = JSON.parse(localStorage.getItem(k)); } catch {}
  return out;
}
function apply(next, here) {
  for (const k of Object.keys(here)) if (!(k in next)) localStorage.removeItem(k);
  for (const [k, v] of Object.entries(next)) if (!same(here[k], v)) localStorage.setItem(k, JSON.stringify(v));
}
// base: the copy both sides last agreed on; pushed: when this browser last saved; looked: when it last looked at GitHub
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const remember = (state) => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} };

// ---------- GitHub ----------
const toBase64 = (text) => { let s = ''; for (const b of new TextEncoder().encode(text)) s += String.fromCharCode(b); return btoa(s); };
const fromBase64 = (text) => new TextDecoder().decode(Uint8Array.from(atob(text), (c) => c.charCodeAt(0)));
const fileOf = (data) => `${JSON.stringify({ app: 'Fluence', v: 1, made: new Date().toISOString(), data }, null, 2)}\n`;
const putBody = (data, sha) => ({ message: MESSAGE, content: toBase64(fileOf(data)), branch: BRANCH, ...(sha ? { sha } : {}) });
async function fetchCopy(s) {
  let r;
  try { r = await call(s, 'GET', `/contents/${FILE}?ref=${BRANCH}`); }
  catch (e) { if (e.status === 404) return { sha: '', data: {} }; throw e; }
  // (one that can't be read is left alone rather than saved over as if it were empty)
  const doc = r.encoding === 'base64' ? JSON.parse(fromBase64(r.content)) : null;
  if (!plain(doc?.data)) throw new Error(`${FILE} on GitHub can’t be read. Its history there has the earlier copies.`);
  return { sha: r.sha, data: Object.fromEntries(Object.entries(doc.data).filter(([k]) => ours(k))) };
}
async function saveCopy(s, data, sha) {
  try { return (await call(s, 'PUT', `/contents/${FILE}`, putBody(data, sha))).content.sha; }
  catch (e) { if (e.status !== 404 || sha) throw e; }
  // no progress branch yet: it starts with a first commit of its own, apart from the repo's other branches
  const blobs = [{ path: FILE, content: fileOf(data) }, { path: 'README.md', content: README }].map((x) => ({ ...x, mode: '100644', type: 'blob' }));
  const tree = await call(s, 'POST', '/git/trees', { tree: blobs });
  const commit = await call(s, 'POST', '/git/commits', { message: MESSAGE, tree: tree.sha, parents: [] });
  await call(s, 'POST', '/git/refs', { ref: `refs/heads/${BRANCH}`, sha: commit.sha });
  return (await fetchCopy(s)).sha;
}

// ---------- saving ----------
export const events = new EventTarget();
const underFrame = () => !!document.getElementById('page-frame');   // (the page in the frame does the saving: kit/look.js)
let copy = null, seen = null, touched = false, running = null;   // copy: GitHub's, as last seen; seen: what this browser had then
async function run() {
  const s = connection();
  if (!s || underFrame()) return;
  let state = load();
  if (state.repo !== s.repo) state = { repo: s.repo, base: {} };
  for (let tries = 0; ; tries++) {
    try {
      copy = await fetchCopy(s);
      const here = mine(), next = merge(state.base || {}, here, copy.data);
      state.looked = Date.now();
      if (meaning(next) !== meaning(copy.data)) {
        copy = { sha: await saveCopy(s, next, copy.sha), data: next };
        state.pushed = Date.now();
      }
      state.error = '';
      seen = meaning(here);
      if (meaning(next) === seen) state.base = next;
      // something new from GitHub: only a page nobody has touched can take it (and not twice in a row, if this browser
      // can't keep it)
      else if (!touched && Date.now() - (state.reloaded || 0) > 10000) {
        apply(next, here);
        state.base = next; state.reloaded = Date.now();
        remember(state);
        location.reload();
        return;
      }
      remember(state);
      events.dispatchEvent(new Event('change'));
      return;
    } catch (e) {
      if ((e.status === 409 || e.status === 422) && tries < 3) continue;
      state.error = explain(e, s);
      remember(state);
      events.dispatchEvent(new Event('change'));
      return;
    }
  }
}
export const saveNow = () => (running ??= run().finally(() => { running = null; }));
export function status() {
  const s = connection(), state = load();
  return { repo: s?.repo || '', branch: BRANCH, error: s ? state.error || '' : '', saved: s && state.repo === s.repo ? state.pushed || state.looked || 0 : 0 };
}
// a page going can't wait for answers, so this is one call that carries on without it. If GitHub moved on it does nothing,
// and the next page saves it.
function lastSave() {
  const s = connection();
  if (!s || !copy || underFrame()) return;
  const next = merge(load().base || {}, mine(), copy.data);
  if (meaning(next) === meaning(copy.data)) return;
  const body = JSON.stringify(putBody(next, copy.sha));
  if (body.length > 60000) return;   // (more than a page going may send)
  fetch(`${s.api || 'https://api.github.com'}/repos/${s.repo}/contents/${FILE}`, { method: 'PUT', keepalive: true, body,
    headers: { Authorization: `Bearer ${s.token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' } }).catch(() => {});
}

// ---------- go ----------
if (globalThis.document && connection()) {
  const touch = () => { touched = true; };
  addEventListener('pointerdown', touch, { capture: true, once: true });
  addEventListener('keydown', touch, { capture: true, once: true });
  addEventListener('pagehide', lastSave);
  document.addEventListener('visibilitychange', () => {
    // back after a while: anything new? going away: save now, while the page still can
    if (document.hidden ? meaning(mine()) !== seen : Date.now() - (load().looked || 0) > 60000) saveNow();
  });
  setInterval(() => { if (meaning(mine()) !== seen && Date.now() - (load().pushed || 0) >= 20000) saveNow(); }, 5000);
  saveNow();
}
