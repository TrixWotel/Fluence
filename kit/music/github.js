// Music's side of GitHub: your songs, their covers and music.json live on the music branch of your private Database
// repo, read and written through GitHub's API with a token that stays in this browser. Data, Code and Notes keep their
// connection under 'fluentio:github', so a browser connected there plays your music with nothing more to set up.
// Every change is one commit: songs and covers go up as blobs first, then one tree with music.json, so a library is
// never half saved. Songs put in the songs/ folder some other way (on GitHub, or with git) join the library too.
const KEY = 'fluentio:music', FLUENTIO = 'fluentio:github';   // (not 'fluentio.', so backups never hold a token)
export const BRANCH = 'music';
export const AUDIO = /\.(mp3|m4a|mp4|aac|ogg|oga|opus|wav|flac|webm)$/i;
const RAW = 'application/vnd.github.raw+json';

// ---------- the connection ----------
const valid = (s) => !!s && typeof s.token === 'string' && !!s.token && /^[\w.-]+\/[\w.-]+$/.test(s.repo || '');
const read = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
// Music's own, or else the one Data, Code and Notes use
export function connection() {
  const own = read(KEY);
  if (valid(own)) return { repo: own.repo, token: own.token, api: own.api, from: 'music' };
  const theirs = read(FLUENTIO);
  if (valid(theirs)) return { repo: theirs.repo, token: theirs.token, api: theirs.api, from: 'workspace' };
  return null;
}
export const fluentioConnected = () => valid(read(FLUENTIO));
export async function connect(name, token, api) {
  const s = { repo: String(name).trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/\/+$/, ''), token: String(token).trim(), ...(api ? { api } : {}) };
  if (!/^[\w.-]+\/[\w.-]+$/.test(s.repo)) throw new Error('Write the repo as owner/name, like TrixWotel/Database.');
  if (!s.token) throw new Error('Paste the token first.');
  let info;
  try { info = await gh(s, 'GET', ''); } catch (e) { throw new Error(explain(e, s)); }
  if (!info.private) throw new Error(`${s.repo} is public, so anyone could download your music. Make it private on GitHub first.`);
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { throw new Error('This browser’s storage is full or turned off.'); }
  return connection();
}
// forgets Music's own token (the other one stays, and is used again if there is one)
export function disconnect() { try { localStorage.removeItem(KEY); } catch {} }

// ---------- calls ----------
const fail = (message, status) => Object.assign(new Error(message), { status });
async function gh(s, method, path, body, accept = 'application/vnd.github+json') {
  let r;
  try {
    r = await fetch(`${s.api || 'https://api.github.com'}/repos/${s.repo}${path}`, { method, cache: 'no-store', body: body ? JSON.stringify(body) : undefined,
      headers: { Authorization: `Bearer ${s.token}`, Accept: accept, 'X-GitHub-Api-Version': '2022-11-28', ...(body ? { 'Content-Type': 'application/json' } : {}) } });
  } catch { throw fail('Couldn’t reach GitHub. Check that you’re online.', 0); }
  if (r.ok && accept === RAW) return r;
  const data = await r.json().catch(() => null);
  if (!r.ok) throw fail(data?.message || `GitHub answered ${r.status}`, r.status);
  return data;
}
export function explain(e, s) {
  const name = s?.repo || 'the repo';
  if (e.status === 401) return 'GitHub didn’t take the token. It may have expired: make a new one and connect again.';
  if (e.status === 403) return /rate limit/i.test(e.message) ? 'GitHub asked Fluence to slow down. Try again in a minute.' : `The token can’t write to ${name}. It needs Contents: Read and write.`;
  if (e.status === 404) return `GitHub has no repo called ${name} that the token can see.`;
  if (e.status === 413 || e.status === 422 && /too large/i.test(e.message)) return 'That file is too big for GitHub (100 MB at most).';
  return e.message || 'Something went wrong with GitHub.';
}

// ---------- the library ----------
export const emptyIndex = () => ({ app: 'Fluence', v: 1, songs: [], playlists: [] });
const text = async (r) => new TextDecoder().decode(await r.arrayBuffer());
// a song found in songs/ without a line in music.json: its details from its path, songs/<artist>/<title>.mp3
export function fromPath(path, sha) {
  const parts = path.split('/'), file = parts.at(-1).replace(AUDIO, ''), folder = parts.length > 2 ? parts[1] : '';
  const m = !folder && file.match(/^(.+?)\s+[-–]\s+(.+)$/);
  return { id: `p${sha.slice(0, 12)}`, title: m ? m[2] : file, artist: m ? m[1] : folder || 'Unknown artist', album: '', path, sha, size: 0, duration: 0, cover: '', coverSha: '', liked: false, added: 0 };
}
// tidies a music.json that could have been edited by hand
function tidy(raw) {
  const index = emptyIndex(), str = (v) => (typeof v === 'string' ? v : '');
  for (const x of Array.isArray(raw?.songs) ? raw.songs : []) {
    if (!x || typeof x.id !== 'string' || typeof x.path !== 'string') continue;
    index.songs.push({ id: x.id, title: str(x.title) || x.path.split('/').pop().replace(AUDIO, ''), artist: str(x.artist) || 'Unknown artist', album: str(x.album), path: x.path,
      sha: str(x.sha), size: +x.size || 0, duration: +x.duration || 0, cover: str(x.cover), coverSha: str(x.coverSha), liked: !!x.liked, added: +x.added || 0 });
  }
  const ids = new Set(index.songs.map((x) => x.id));
  for (const p of Array.isArray(raw?.playlists) ? raw.playlists : []) {
    if (!p || typeof p.id !== 'string') continue;
    index.playlists.push({ id: p.id, name: str(p.name) || 'Playlist', songs: (Array.isArray(p.songs) ? p.songs : []).filter((id) => ids.has(id)), made: +p.made || 0 });
  }
  return index;
}
// the music branch as it is now: its last commit and tree, its files (path → blob), and the library
export async function library(s) {
  let head;
  try { head = (await gh(s, 'GET', `/git/ref/heads/${BRANCH}`)).object.sha; }
  catch (e) { if (e.status === 404 || e.status === 409) return { head: '', tree: '', files: new Map(), index: emptyIndex() }; throw e; }
  const commit = await gh(s, 'GET', `/git/commits/${head}`);
  const listing = await gh(s, 'GET', `/git/trees/${commit.tree.sha}?recursive=1`);
  const files = new Map(listing.tree.filter((x) => x.type === 'blob').map((x) => [x.path, x.sha]));
  let index = emptyIndex();
  if (files.has('music.json')) try { index = tidy(JSON.parse(await text(await gh(s, 'GET', `/git/blobs/${files.get('music.json')}`, null, RAW)))); } catch { index = emptyIndex(); }
  index.songs = index.songs.filter((x) => files.has(x.path)).map((x) => ({ ...x, sha: files.get(x.path), coverSha: (x.cover && files.get(x.cover)) || '' }));
  for (const [path, sha] of files) if (path.startsWith('songs/') && AUDIO.test(path) && !index.songs.some((x) => x.path === path)) index.songs.push(fromPath(path, sha));
  return { head, tree: commit.tree.sha, files, index };
}

// ---------- saving ----------
// git's own name for a file's bytes, so a song already there isn't sent twice
export async function blobSha(bytes) {
  const head = new TextEncoder().encode(`blob ${bytes.byteLength}\0`), all = new Uint8Array(head.length + bytes.byteLength);
  all.set(head); all.set(new Uint8Array(bytes), head.length);
  return [...new Uint8Array(await crypto.subtle.digest('SHA-1', all))].map((b) => b.toString(16).padStart(2, '0')).join('');
}
const base64 = (blob) => new Promise((done, failed) => {
  const r = new FileReader();
  r.onload = () => done(String(r.result).slice(String(r.result).indexOf(',') + 1));
  r.onerror = () => failed(fail('Couldn’t read that file.', 0));
  r.readAsDataURL(blob);
});
// one file up as a blob, telling progress(0 to 1) as it goes; gives its sha
export async function upload(s, blob, progress = () => {}) {
  const body = JSON.stringify({ content: await base64(blob), encoding: 'base64' });
  return new Promise((done, failed) => {
    const x = new XMLHttpRequest();
    x.open('POST', `${s.api || 'https://api.github.com'}/repos/${s.repo}/git/blobs`);
    x.setRequestHeader('Authorization', `Bearer ${s.token}`);
    x.setRequestHeader('Accept', 'application/vnd.github+json');
    x.setRequestHeader('X-GitHub-Api-Version', '2022-11-28');
    x.setRequestHeader('Content-Type', 'application/json');
    x.upload.onprogress = (e) => e.lengthComputable && progress(e.loaded / e.total);
    x.onload = () => {
      let data = null;
      try { data = JSON.parse(x.responseText); } catch {}
      if (x.status >= 200 && x.status < 300 && data?.sha) { progress(1); done(data.sha); }
      else failed(fail(data?.message || `GitHub answered ${x.status}`, x.status));
    };
    x.onerror = () => failed(fail('Couldn’t reach GitHub. Check that you’re online.', 0));
    x.send(body);
  });
}
// a song's (or cover's) bytes, telling progress(0 to 1) as they come
export async function download(s, sha, progress = () => {}) {
  const r = await gh(s, 'GET', `/git/blobs/${sha}`, null, RAW);
  const total = +r.headers.get('content-length') || 0;
  if (!r.body || !total) return new Blob([await r.arrayBuffer()]);
  const reader = r.body.getReader(), parts = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    parts.push(value); got += value.length; progress(Math.min(1, got / total));
  }
  return new Blob(parts);
}
const README = `# Music

Your music, saved here by Fluence's Music (https://trixwotel.github.io/Fluence/music/).

* **songs/** has the songs, a folder for each artist.
* **covers/** has their cover art.
* **music.json** keeps the library: each song's details and whether you liked it, and your playlists.

Songs dropped into songs/ some other way (on GitHub, or with git) show up in Music too, named from their file.
`;
// one change as one commit: change(index) edits the newest library in place and gives { add: [{ path, sha }], remove:
// [paths] }. If GitHub moved on while this was saving (another device, Fluentio), it starts again from the newest.
export async function commit(s, message, change, base) {
  for (let tries = 0; ; tries++) {
    const now = base && tries === 0 ? base : await library(s);
    const index = structuredClone(now.index), { add = [], remove = [] } = (await change(index, now)) || {};
    const tree = [
      ...add.map(({ path, sha }) => ({ path, mode: '100644', type: 'blob', sha })),
      ...remove.filter((path) => now.files.has(path)).map((path) => ({ path, mode: '100644', type: 'blob', sha: null })),
      { path: 'music.json', mode: '100644', type: 'blob', content: `${JSON.stringify({ ...index, songs: index.songs.map(({ coverSha, ...x }) => x) }, null, 2)}\n` },
    ];
    if (!now.files.has('README.md')) tree.push({ path: 'README.md', mode: '100644', type: 'blob', content: README });
    try {
      const made = await gh(s, 'POST', '/git/trees', now.tree ? { base_tree: now.tree, tree } : { tree: tree.filter((x) => x.sha !== null) });
      const c = await gh(s, 'POST', '/git/commits', { message: `${message} (from Fluence)`, tree: made.sha, parents: now.head ? [now.head] : [] });
      if (now.head) await gh(s, 'PATCH', `/git/refs/heads/${BRANCH}`, { sha: c.sha, force: false });
      else await gh(s, 'POST', '/git/refs', { ref: `refs/heads/${BRANCH}`, sha: c.sha });
      return library(s);
    } catch (e) {
      if ((e.status === 422 || e.status === 409) && tries < 4) continue;
      throw e;
    }
  }
}
