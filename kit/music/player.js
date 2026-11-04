// The player, on every page: the song that's playing, the queue, shuffle and repeat, and the bar at the bottom. Going to
// another page carries on where it was (the song is on this device by then, so it picks up within a moment). Media keys
// and the lock screen control it, and an analyser between the song and the speakers lets pages move with the music.
import * as gh from './github.js';
import * as store from './store.js';
import { el, svg, time, art, read, write, state, song, local, save, coverUrl, toast, styles, hash, events as libraryEvents } from './library.js';

const f = window.fluentio;
const KEY = 'fluentio.music.player';
const TYPES = { mp3: 'audio/mpeg', m4a: 'audio/mp4', mp4: 'audio/mp4', aac: 'audio/aac', ogg: 'audio/ogg', oga: 'audio/ogg', opus: 'audio/ogg', wav: 'audio/wav', flac: 'audio/flac', webm: 'audio/webm' };
const ext = (path) => (path.match(/\.([a-z0-9]+)$/i)?.[1] || 'mp3').toLowerCase();
export const events = new EventTarget();
const tell = (what) => events.dispatchEvent(new Event(what));

export const audio = new Audio();
audio.preload = 'auto';
const saved = read(KEY, {});
let queue = Array.isArray(saved.queue) ? saved.queue : [], at = Number.isInteger(saved.at) ? saved.at : -1;
export const mode = { shuffle: !!saved.shuffle, repeat: ['off', 'all', 'one'].includes(saved.repeat) ? saved.repeat : 'off' };
audio.volume = Number.isFinite(saved.volume) ? saved.volume : 0.9;
audio.muted = !!saved.muted;
let srcUrl = '', loadingId = '';
// where the last page left off: the song picks up there once it has loaded, and until then that's its time
let resume = queue[at] && saved.time > 0 ? { id: queue[at], time: saved.time } : null;
const waiting = () => (resume?.id === queue[at] ? resume.time : 0);
export let buffering = 0;
export const current = () => song(queue[at]);
export const upNext = () => queue.slice(at + 1).map(song).filter(Boolean);
export const position = () => at;
const keep = () => write(KEY, { queue, at, shuffle: mode.shuffle, repeat: mode.repeat, volume: audio.volume, muted: audio.muted, time: audio.currentTime || waiting(), playing: !audio.paused });

// ---------- what plays ----------
const mixed = (ids) => { for (let k = ids.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [ids[k], ids[j]] = [ids[j], ids[k]]; } return ids; };
export function playList(list, i, shuffled = false) {
  const ids = list.map((s) => s.id);
  if (shuffled) { queue = [ids[i], ...mixed(ids.filter((_, k) => k !== i))]; at = 0; mode.shuffle = true; }
  else { queue = ids; at = i; if (mode.shuffle) shuffleRest(); }
  start(true);
}
function shuffleRest() { queue = [...queue.slice(0, at + 1), ...mixed(queue.slice(at + 1))]; }
export function playNext(s) { if (at < 0) { queue = [s.id]; at = 0; return start(true); } queue.splice(at + 1, 0, s.id); keep(); tell('queue'); }
export function addToQueue(s) { if (at < 0) { queue = [s.id]; at = 0; return start(true); } queue.push(s.id); keep(); tell('queue'); }
export function jump(k) { if (queue[k]) { at = k; start(true); } }
export function forget(id) {
  const was = queue[at];
  queue = queue.filter((x) => x !== id);
  at = was === id ? Math.min(at, queue.length - 1) : queue.indexOf(was);
  if (was === id) { audio.pause(); audio.removeAttribute('src'); if (at >= 0) start(false); else tell('song'); }
  keep();
}
// a song that turned out to be a copy of another: the other takes its place, and what's playing carries on
export function swap(id, to) {
  if (!queue.includes(id)) return;
  const was = queue[at] === id ? to : queue[at];
  if (resume?.id === id) resume.id = to;
  queue = queue.map((x) => (x === id ? to : x)).filter((x, i, all) => x !== to || i === all.indexOf(to));
  at = queue.indexOf(was);
  keep(); tell('song');
}
export function setShuffle(on) { mode.shuffle = on; if (on) shuffleRest(); keep(); tell('queue'); }
export function cycleRepeat() { mode.repeat = { off: 'all', all: 'one', one: 'off' }[mode.repeat]; keep(); tell('queue'); return mode.repeat; }

async function start(play) {
  const s = current();
  tell('song');
  if (!s) return;
  loadingId = s.id; buffering = 0.01; tell('time'); media(s);
  let blob = await store.get(s.sha);
  if (!blob) {
    if (!state.conn) { buffering = 0; tell('time'); return toast('Connect your Database in Music to play this song.'); }
    try {
      blob = await gh.download(state.conn, s.sha, (p) => { buffering = Math.max(0.01, p); tell('time'); });
      store.put(s.sha, blob); local.add(s.sha);
    } catch (e) { buffering = 0; tell('time'); return toast(`Couldn’t load ${s.title}: ${gh.explain(e, state.conn)}`); }
  }
  if (loadingId !== s.id) return;   // another song was picked meanwhile
  buffering = 0;
  if (srcUrl) URL.revokeObjectURL(srcUrl);
  srcUrl = URL.createObjectURL(blob.type ? blob : new Blob([blob], { type: TYPES[ext(s.path)] || 'audio/mpeg' }));
  audio.src = srcUrl;
  if (waiting()) audio.addEventListener('loadedmetadata', () => { if (waiting()) audio.currentTime = Math.min(resume.time, Math.max(0, (audio.duration || resume.time + 1) - 1)); resume = null; }, { once: true });
  if (play) { wire(); audio.play().catch(() => tell('state')); }
  keep(); tell('time'); prefetch();
}
// the next song comes down while this one plays
async function prefetch() {
  const n = song(queue[at + 1]);
  if (!n || local.has(n.sha) || !state.conn) return;
  if (await store.get(n.sha)) return local.add(n.sha);
  try { store.put(n.sha, await gh.download(state.conn, n.sha)); local.add(n.sha); } catch {}
}
export function next(auto = false) {
  if (!queue.length) return;
  if (auto && mode.repeat === 'one') { audio.currentTime = 0; audio.play(); return; }
  if (at + 1 < queue.length) at++;
  else if (mode.repeat === 'all' || !auto) { at = 0; if (mode.shuffle) shuffleRest(); }
  else { audio.pause(); audio.currentTime = 0; keep(); return tell('state'); }
  start(true);
}
export function prev() {
  if (audio.currentTime > 3 || at <= 0) { audio.currentTime = 0; return; }
  at--; start(true);
}
export function toggle() {
  if (!current()) { if (state.lib.songs.length) playList([...state.lib.songs].sort((a, b) => (b.added || 0) - (a.added || 0)), 0); return; }
  if (!audio.src) return start(true);
  wire();
  if (audio.paused) audio.play().catch(() => {}); else audio.pause();
}
export const seek = (t) => { if (audio.duration) audio.currentTime = Math.max(0, Math.min(audio.duration - 0.25, t)); };
audio.addEventListener('ended', () => next(true));
audio.addEventListener('play', () => { document.documentElement.classList.add('music-playing'); keep(); tell('state'); loop(); });
audio.addEventListener('pause', () => { document.documentElement.classList.remove('music-playing'); keep(); tell('state'); });
audio.addEventListener('timeupdate', () => { tell('time'); if (Math.floor(audio.currentTime) % 5 === 0) keep(); });
audio.addEventListener('volumechange', () => { keep(); tell('volume'); });
audio.addEventListener('error', () => { if (audio.src) toast(`This browser can’t play ${current()?.title || 'that song'}.`); });
// a song added some other way learns its length the first time it plays
audio.addEventListener('loadedmetadata', () => {
  const s = current(), secs = Math.round(audio.duration);
  if (s && !s.duration && Number.isFinite(secs) && secs > 0 && state.conn) save(`Length of ${s.title}`, (index) => { const x = index.songs.find((y) => y.id === s.id); if (x && !x.duration) x.duration = secs; }).catch(() => {});
});
addEventListener('pagehide', keep);

// the sound, for anything that moves with it: an analyser between the song and the speakers, made on the first play
export const sound = { analyser: null, freq: null, level: 0 };
let ctx = null, raf = 0;
function wire() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  try {
    ctx = new AudioContext();
    sound.analyser = ctx.createAnalyser(); sound.analyser.fftSize = 256; sound.analyser.smoothingTimeConstant = 0.82;
    ctx.createMediaElementSource(audio).connect(sound.analyser); sound.analyser.connect(ctx.destination);
    sound.freq = new Uint8Array(sound.analyser.frequencyBinCount);
  } catch { ctx = null; sound.analyser = null; }
}
const still = () => document.documentElement.classList.contains('no-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches;
function loop() {
  cancelAnimationFrame(raf);
  const tick = () => {
    if (audio.paused) { sound.level = 0; document.documentElement.style.setProperty('--level', 0); tell('frame'); return; }
    let level = 0;
    if (sound.analyser && !still()) { sound.analyser.getByteFrequencyData(sound.freq); for (let i = 1; i < 24; i++) level += sound.freq[i]; level = Math.min(1, level / (23 * 210)); }
    sound.level = level * level;
    document.documentElement.style.setProperty('--level', sound.level.toFixed(3));
    tell('frame');
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
}
// the lock screen and the keyboard's media keys
async function media(s) {
  if (!('mediaSession' in navigator) || !s) return;
  const url = await coverUrl(s);
  navigator.mediaSession.metadata = new MediaMetadata({ title: s.title, artist: s.artist, album: s.album, artwork: url ? [{ src: url }] : [] });
  for (const [a, fn] of [['play', toggle], ['pause', toggle], ['previoustrack', prev], ['nexttrack', () => next()], ['seekto', (d) => seek(d.seekTime)]]) {
    try { navigator.mediaSession.setActionHandler(a, fn); } catch {}
  }
}
// the colors of the cover: its average lively color, as a hue (or one made from the song's name)
export async function hueOf(s) {
  let h = hash(s.album || s.title) % 360;
  const url = await coverUrl(s);
  if (!url) return h;
  try {
    const img = await new Promise((done, fail) => { const i = new Image(); i.onload = () => done(i); i.onerror = fail; i.src = url; });
    const c = el('canvas', { width: 24, height: 24 }), g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0, 24, 24);
    const d = g.getImageData(0, 0, 24, 24).data;
    let x = 0, y = 0, w = 0;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i] / 255, gg = d[i + 1] / 255, b = d[i + 2] / 255, mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), sv = mx - mn;
      if (sv < 0.12 || mx < 0.15) continue;
      let hue = mx === r ? ((gg - b) / sv) % 6 : mx === gg ? (b - r) / sv + 2 : (r - gg) / sv + 4;
      hue *= 60;
      x += Math.cos((hue * Math.PI) / 180) * sv * sv; y += Math.sin((hue * Math.PI) / 180) * sv * sv; w += sv * sv;
    }
    if (w > 0.5) h = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  } catch {}
  return h;
}

// ---------- the bar at the bottom ----------
let bar = null, parts = null, cover = null;   // (the cover stays while the song does, so it doesn't flicker as the bar is redrawn)
export let openNow = () => { location.href = f.link('music/#now'); };   // (Music's page shows it in place)
export const setOpenNow = (fn) => { openNow = fn; };
function range(label, oninput) {
  const r = el('input', { type: 'range', className: 'm-range', min: 0, max: 1000, value: 0, step: 1, 'aria-label': label });
  r.addEventListener('input', () => { r.style.setProperty('--v', `${r.value / 10}%`); oninput(r.value / 1000); });
  return r;
}
export function controls() {
  const sh = el('button', { className: `m-icon hide-small${mode.shuffle ? ' on' : ''}`, 'aria-label': 'Shuffle', title: 'Shuffle', onclick: () => setShuffle(!mode.shuffle) }, svg('shuffle'));
  const rp = el('button', { className: `m-icon hide-small${mode.repeat !== 'off' ? ' on' : ''}`, 'aria-label': `Repeat: ${mode.repeat}`, title: { off: 'Repeat', all: 'Repeat all', one: 'Repeat one' }[mode.repeat], onclick: () => toast({ off: 'Repeat off', all: 'Repeating everything', one: 'Repeating this song' }[cycleRepeat()]) }, svg('repeat'), mode.repeat === 'one' ? el('small', { className: 'one' }, '1') : null);
  const play = el('button', { className: 'm-play', 'aria-label': audio.paused ? 'Play' : 'Pause', onclick: toggle }, buffering ? el('span', { className: 'm-ring' }) : svg(audio.paused ? 'play' : 'pause', true));
  return el('div', { className: 'm-btns' }, sh, el('button', { className: 'm-icon', 'aria-label': 'Previous', title: 'Previous', onclick: prev }, svg('prev', true)), play, el('button', { className: 'm-icon', 'aria-label': 'Next', title: 'Next', onclick: () => next() }, svg('next', true)), rp);
}
export function seeker() {
  const now = el('span', {}, '0:00'), end = el('span', {}, '0:00'), r = range('Seek', (v) => seek(v * (audio.duration || 0)));
  const paint = () => {
    const d = audio.duration || current()?.duration || 0, t = audio.currentTime || waiting();
    now.textContent = time(t); end.textContent = d ? time(d) : '–:––';
    if (document.activeElement !== r) { r.value = d ? Math.round((t / d) * 1000) : 0; r.style.setProperty('--v', `${r.value / 10}%`); }
    r.style.setProperty('--b', `${buffering ? buffering * 100 : 0}%`);
  };
  paint();
  return { box: el('div', { className: 'm-seek' }, now, r, end), paint };
}
export function likeButton(s, cls = '') {
  return el('button', { className: `m-icon ${cls}${s.liked ? ' liked' : ''}`, 'aria-label': s.liked ? 'Unlike' : 'Like', title: s.liked ? 'Unlike' : 'Like', onclick: () => like(s, !s.liked) }, svg('heart'));
}
export function like(s, on) {
  if (!state.conn) return toast('Connect your Database in Music first.');
  save(`${on ? 'Liked' : 'Unliked'} ${s.title}`, (index) => { const x = index.songs.find((y) => y.id === s.id); if (x) x.liked = on; }).catch(() => {});
}
function paint() {
  const s = current();
  if (!bar) return;
  bar.hidden = !s;
  document.documentElement.classList.toggle('has-player', !!s);
  if (!s) return;
  if (cover?.id !== s.id || cover.sha !== s.coverSha) cover = { id: s.id, sha: s.coverSha, el: art(s, { size: 52 }) };
  const sk = seeker(), vol = range('Volume', (v) => { audio.volume = v; audio.muted = v === 0; });
  parts = { sk, vol, mute: el('button', { className: 'm-icon', 'aria-label': 'Mute', title: 'Mute', onclick: () => { audio.muted = !audio.muted; } }) };
  bar.replaceChildren(
    el('div', { className: 'm-song', onclick: () => openNow(), title: 'Now playing' }, cover.el, el('div', { className: 't' }, el('b', {}, s.title), el('span', {}, s.artist))),
    el('div', { className: 'm-mid' }, controls(), sk.box),
    el('div', { className: 'm-end' }, likeButton(s, 'hide-small'), el('button', { className: 'm-icon hide-small', 'aria-label': 'Now playing and the queue', title: 'Now playing', onclick: () => openNow() }, svg('queue')), parts.mute, vol));
  paintVolume();
}
function paintVolume() {
  if (!parts) return;
  const v = audio.muted ? 0 : audio.volume;
  parts.vol.value = Math.round(v * 1000); parts.vol.style.setProperty('--v', `${v * 100}%`);
  parts.mute.replaceChildren(svg(v ? 'vol' : 'mute'));
}
// puts the bar on this page (once), and keeps it up to date
export function mount() {
  if (bar) return;
  styles();
  bar = el('footer', { className: 'm-bar', id: 'music-bar', hidden: true, 'aria-label': 'Music player' });
  document.body.append(bar);
  for (const w of ['song', 'state', 'queue']) events.addEventListener(w, paint);
  events.addEventListener('time', () => parts?.sk.paint());
  events.addEventListener('volume', paintVolume);
  let shown = '';   // (the song as the bar last had it: the same library again changes nothing)
  libraryEvents.addEventListener('library', () => { const now = JSON.stringify(current() ?? null); if (now !== shown) { shown = now; paint(); } });
  paint();
}
// songs deleted somewhere else (another device, GitHub) leave the queue, and stop if one was playing
libraryEvents.addEventListener('library', () => queue.filter((id) => !song(id)).forEach(forget));
// ---------- go: carry on from the last page ----------
if (current()) {
  media(current());
  if (saved.playing) start(true); else start(false);
}
