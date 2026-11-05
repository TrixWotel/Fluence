// Your music library as every page sees it: the connection, the library (kept in this browser too, so pages show it
// at once and offline), saving a change as a commit, covers, and the little things the music pages share (building
// elements, icons, times, a toast). Music's page, the home page's Music tile and the player all use it.
import * as gh from './github.js';
import * as store from './store.js';

// the page that stays open while others come and go in frames over it (kit/look.js)
export const home = (() => { try { return window !== window.top && window.top.fluentioHost ? window.top : window; } catch { return window; } })();
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
export { read, write };

// ---------- building things ----------
export function el(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'string') e.setAttribute('style', v);
    else if (k in e && k !== 'list' && k !== 'form') e[k] = v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat()) if (k != null && k !== false) e.append(k.nodeType ? k : document.createTextNode(String(k)));
  return e;
}
const P = {
  play: 'M7 4.8v14.4c0 .8.9 1.3 1.6.9l11.5-7.2a1 1 0 0 0 0-1.8L8.6 3.9C7.9 3.5 7 4 7 4.8z',
  pause: 'M7 4h3.5v16H7zM13.5 4H17v16h-3.5z',
  next: 'M5 5.5v13l9.5-6.5zM17.5 5v14', prev: 'M19 5.5v13L9.5 12zM6.5 5v14',
  shuffle: 'M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5',
  repeat: 'M17 2l4 4-4 4M3 11V10a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v1a4 4 0 0 1-4 4H3',
  heart: 'M19.5 5.2a5 5 0 0 0-7.1 0l-.4.4-.4-.4a5 5 0 1 0-7.1 7.1l.4.4 7.1 7 7.1-7 .4-.4a5 5 0 0 0 0-7.1z',
  plus: 'M12 5v14M5 12h14', upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  more: 'M5 12h.01M12 12h.01M19 12h.01', vol: 'M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13',
  mute: 'M11 5 6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6', queue: 'M3 6h13M3 12h13M3 18h8M17 15v6l4-3z',
  down: 'M6 9l6 6 6-6', note: 'M9 18V5l12-2v13M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  disc: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  list: 'M21 15V6M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM12 12H3M16 6H3M12 18H3',
  sliders: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
  trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6', edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  x: 'M18 6 6 18M6 6l12 12', check: 'M20 6 9 17l-5-5', next2: 'M3 6h12M3 12h12M3 18h7M17 14l4 3-4 3z',
  cloud: 'M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9z', expand: 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7',
};
export const svg = (name, solid = false) => {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('class', `i mi${solid ? ' solid' : ''}`); s.setAttribute('aria-hidden', 'true');
  s.innerHTML = `<path d="${P[name]}"/>`;
  return s;
};
export const time = (s) => { s = Math.max(0, Math.floor(s || 0)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = String(s % 60).padStart(2, '0'); return h ? `${h}:${String(m).padStart(2, '0')}:${x}` : `${m}:${x}`; };
export const bytes = (n) => (n >= 1e9 ? `${(n / 1e9).toFixed(1)} GB` : n >= 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`);
export const plural = (n, w) => `${n.toLocaleString('en-US')} ${w}${n === 1 ? '' : 's'}`;
export const total = (list) => { const s = list.reduce((a, x) => a + (x.duration || 0), 0); const h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60); return h ? `${h} hr ${m} min` : s < 60 ? `${s} sec` : `${m} min`; };
export const hash = (s) => { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
let toastTimer = 0;
export function toast(text) {
  document.querySelectorAll('.m-toast').forEach((t) => t.remove());
  const t = el('div', { className: 'm-toast', role: 'status' }, text);
  document.body.append(t);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.remove(), 3200);
}
// the music styles, on any page that shows music (the player, the home page's tile)
export function styles() {
  if (document.getElementById('music-css')) return;
  document.head.append(el('link', { rel: 'stylesheet', id: 'music-css', href: new URL('./music.css', import.meta.url).href }));
}

// ---------- the library ----------
export const events = new EventTarget();
const tell = (what) => events.dispatchEvent(new Event(what));
export const state = { conn: gh.connection(), base: null, lib: read('fluentio.music.library', gh.emptyIndex()), loading: false, error: '' };
export const local = new Set();   // shas kept on this device
store.keys().then((k) => { k.forEach((x) => local.add(x)); tell('local'); });
export const song = (id) => state.lib.songs.find((x) => x.id === id);
export async function refresh() {
  state.conn = gh.connection();
  if (!state.conn) { state.base = null; tell('library'); return; }
  state.loading = true; state.error = '';
  tell('library');
  try {
    state.base = await gh.library(state.conn);
    state.lib = structuredClone(state.base.index); write('fluentio.music.library', state.lib);
  } catch (e) { state.error = gh.explain(e, state.conn); }
  state.loading = false;
  tell('library');
}
// changes go one after another: change(index, now) edits the newest library (and gives files to add or take away); it's
// shown here at once, and saved as one commit
let chain = Promise.resolve();
export function save(message, change) {
  change(state.lib, state.base || { files: new Map() });
  tell('library');
  const run = chain.then(async () => {
    state.base = await gh.commit(state.conn, message, change, state.base);
    state.lib = structuredClone(state.base.index); write('fluentio.music.library', state.lib);
    tell('library');
  }).catch((e) => { toast(`Couldn’t save: ${gh.explain(e, state.conn)}`); refresh(); throw e; });
  chain = run.catch(() => {});
  return run;
}
// another tab connected, or changed the library
addEventListener('storage', (e) => {
  if (e.key === 'fluentio:github' || e.key === 'fluentio:music') { const was = state.conn?.repo; state.conn = gh.connection(); if (state.conn?.repo !== was) refresh(); }
  if (e.key === 'fluentio.music.library') { state.lib = read('fluentio.music.library', state.lib); tell('library'); }
});

// ---------- covers: the song's own picture, or one made from its name ----------
// Their addresses are kept by the page that stays open, so the next page has them at once and a picture never has to come
// in after its page. The ones on this device get found in the background, ready for pages that show a lot of them.
const covers = (home.fluentioCovers ??= new Map());   // sha → object URL
const coming = new Map();                             // sha → a promise of one, on this page
const keepCover = (sha, blob) => { const url = home.URL.createObjectURL(blob); covers.set(sha, url); return url; };
export function coverUrl(s) {
  const sha = s?.coverSha;
  if (!sha) return Promise.resolve('');
  if (covers.has(sha)) return Promise.resolve(covers.get(sha));
  if (!coming.has(sha)) coming.set(sha, (async () => {
    let blob = await store.get(sha);
    if (!blob && state.conn) { try { blob = await gh.download(state.conn, sha); store.put(sha, blob); } catch { blob = null; } }
    coming.delete(sha);
    return blob ? keepCover(sha, blob) : '';
  })());
  return coming.get(sha);
}
setTimeout(async () => {
  for (const { coverSha: sha } of state.lib.songs) {
    if (!sha || covers.has(sha)) continue;
    const blob = await store.get(sha);
    if (blob && !covers.has(sha)) keepCover(sha, blob);
  }
}, 300);
export const shade = (seed) => { const h = hash(seed) % 360; return `linear-gradient(135deg, hsl(${h} 70% 58%), hsl(${(h + 48) % 360} 65% 48%))`; };
export function art(s, { key = s?.album || s?.title || '', label = s?.album || s?.title || '', size = 44 } = {}) {
  const known = s?.coverSha && covers.get(s.coverSha);
  const box = el('div', { className: 'm-art', style: `--gen:${known ? 'transparent' : shade(key)};--s:${size}px` });
  const picture = (url, fresh) => box.append(el('img', { src: url, alt: '', loading: 'lazy', decoding: 'sync', className: fresh ? 'fresh' : '' }));
  if (known) { picture(known, false); return box; }
  const letters = el('span', { className: 'letters' }, label.replace(/[^\p{L}\p{N} ]/gu, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '♪');
  box.append(letters);
  // (a page that's still out of sight waits for it: kit/look.js)
  if (s?.coverSha) window.fluentio?.wait(coverUrl(s).then((url) => { if (url) { letters.remove(); picture(url, true); } }));
  return box;
}
