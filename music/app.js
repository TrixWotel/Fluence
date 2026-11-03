// Music: your songs, albums, artists, likes and playlists, Now Playing with a ring that moves with the music, and adding
// songs by dropping them on the page. The library lives on the music branch of your private Database repo
// (kit/music/github.js), and the player (kit/music/player.js) is the one at the bottom of every page, so a song keeps
// going when you leave.
import * as gh from '../kit/music/github.js';
import * as store from '../kit/music/store.js';
import { readTags } from '../kit/music/tags.js';
import { el, svg, time, bytes, plural, total, toast, art, shade, coverUrl, read, write, state, song, local, refresh, save, events as libraryEvents } from '../kit/music/library.js';
import * as player from '../kit/music/player.js';

const $ = (s) => document.querySelector(s);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const safe = (name, fallback) => { const n = String(name ?? '').replace(/[\u0000-\u001f\u007f/\\:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim().slice(0, 80); return !n || n === '.' || n === '..' ? fallback : n; };
const ext = (path) => (path.match(/\.([a-z0-9]+)$/i)?.[1] || 'mp3').toLowerCase();
const conn = () => state.conn;
const lib = () => state.lib;

// ---------- routes ----------
const TABS = [['songs', 'Songs', 'note'], ['albums', 'Albums', 'disc'], ['artists', 'Artists', 'user'], ['playlists', 'Playlists', 'list'], ['liked', 'Liked', 'heart'], ['settings', 'Settings', 'sliders']];
const route = () => { const h = decodeURIComponent(location.hash.slice(1)); const [name, ...rest] = h.split('/'); return { name: name || 'songs', arg: rest.join('/') }; };
let enter = true;
addEventListener('hashchange', () => { closeMenu(); if (route().name === 'now') { openNow(); history.replaceState(null, '', '#songs'); return; } enter = true; render(true); });
const view = $('#view'), q = el('input', { type: 'search', placeholder: 'Search your music', autocomplete: 'off', 'aria-label': 'Search your music' });
q.addEventListener('input', () => { const v = q.value.trim(); history.replaceState(null, '', v ? `#search/${encodeURIComponent(v)}` : '#songs'); render(); });
q.addEventListener('keydown', (e) => { if (e.key === 'Escape') { q.value = ''; q.blur(); location.hash = '#songs'; } });
const tabs = el('nav', { className: 'm-tabs', 'aria-label': 'Music' });
$('#top').append(tabs, el('label', { className: 'm-find' }, svg('search'), q));
function render(moved = false) {
  const r = route();
  tabs.replaceChildren(...TABS.map(([id, name, icon]) => el('a', { href: `#${id}`, className: r.name === id || (r.name === 'album' && id === 'albums') || (r.name === 'artist' && id === 'artists') || (r.name === 'playlist' && id === 'playlists') ? 'on' : '' }, svg(icon), name)));
  if (!conn() && r.name !== 'settings') return show(connectView(), moved);
  const make = { songs: songsView, albums: albumsView, album: albumView, artists: artistsView, artist: artistView, playlists: playlistsView, playlist: playlistView, liked: likedView, settings: settingsView, search: searchView }[r.name] || songsView;
  show(make(r.arg), moved);
}
function show(node, moved) {
  const keep = moved ? 0 : scrollY;
  view.classList.toggle('enter', enter); enter = false;
  view.replaceChildren(node);
  scrollTo(0, keep);
}
function hero({ kind, title, sub, artEl, round }) {
  if (artEl && round) artEl.style.borderRadius = '50%';
  return el('div', { className: 'm-hero' }, artEl || null, el('div', {}, kind ? el('p', { className: 'kind m-muted' }, kind) : null, el('h1', {}, title), sub ? el('p', {}, sub) : null));
}
function status() {
  if (state.loading && !lib().songs.length) return el('div', {}, ...Array.from({ length: 6 }, () => el('div', { className: 'm-skeleton' })));
  if (state.error) return el('div', { className: 'm-panel' }, el('h2', {}, 'Couldn’t load your music'), el('p', { className: 'm-muted' }, state.error), el('button', { className: 'btn', onclick: refresh }, 'Try again'));
  return null;
}
const addButton = () => el('button', { className: 'btn', onclick: pickFiles }, svg('upload'), 'Add songs');
const playButtons = (list) => [
  el('button', { className: 'btn primary', disabled: !list.length, onclick: () => player.playList(list, 0) }, svg('play', true), 'Play'),
  el('button', { className: 'btn', disabled: list.length < 2, onclick: () => player.playList(list, Math.floor(Math.random() * list.length), true) }, svg('shuffle'), 'Shuffle'),
];
const missing = (text) => el('div', { className: 'm-empty' }, el('h2', {}, 'Not here'), el('p', {}, text), el('a', { className: 'btn', href: '#songs' }, 'All songs'));
const nothing = (title, text) => el('div', { className: 'm-empty' }, el('h2', {}, title), el('p', {}, text));

// ---------- songs ----------
let sortBy = read('fluentio.music.sort', 'added');
const SORTS = { added: ['Recently added', (a, b) => (b.added || 0) - (a.added || 0)], title: ['Title', (a, b) => a.title.localeCompare(b.title)], artist: ['Artist', (a, b) => a.artist.localeCompare(b.artist) || a.album.localeCompare(b.album) || a.title.localeCompare(b.title)] };
function songsView() {
  const list = [...lib().songs].sort(SORTS[sortBy][1]);
  const wrap = el('div', {}, hero({ title: 'Songs', sub: list.length ? `${plural(list.length, 'song')} · ${total(list)}` : '' }));
  const st = status();
  if (st) return wrap.append(st), wrap;
  if (!list.length) return wrap.append(emptyLibrary()), wrap;
  wrap.append(el('div', { className: 'm-actions' }, ...playButtons(list), el('span', { className: 'm-grow' }), addButton()));
  wrap.append(el('div', { className: 'm-sorts' }, 'Sort by', el('div', { className: 'seg' }, ...Object.entries(SORTS).map(([k, [name]]) => el('button', { type: 'button', className: k === sortBy ? 'on' : '', onclick: () => { sortBy = k; write('fluentio.music.sort', k); render(); } }, name)))));
  wrap.append(songList(list));
  return wrap;
}
function emptyLibrary() {
  return el('div', { className: 'm-empty' },
    el('div', { className: 'notes', 'aria-hidden': 'true' }, el('span', {}, '🎵'), el('span', {}, '🎧'), el('span', {}, '🎶')),
    el('h2', {}, 'Your library is empty'),
    el('p', {}, `Drop songs anywhere on this page, or choose them. They’re saved to the music branch of ${conn().repo}, so every device you connect plays them.`),
    el('button', { className: 'btn primary', onclick: pickFiles }, svg('upload'), 'Choose songs'));
}
// a list of songs: click one to play the list from it
function songList(list, { playlist = null } = {}) {
  const box = el('div', { className: 'm-songs' });
  list.forEach((s, i) => {
    const row = el('div', { className: `m-row${s.id === player.current()?.id ? ' on' : ''}`, style: `--n:${Math.min(i, 24)}`, onclick: (e) => { if (!e.target.closest('button, a')) player.playList(list, i); } });
    row.dataset.id = s.id;
    row.append(
      el('div', { className: 'n' }, el('span', { className: 'num' }, i + 1), el('span', { className: 'm-bars' }, el('i'), el('i'), el('i')), el('span', { className: 'pl' }, svg('play', true))),
      art(s),
      el('div', { className: 't' }, el('b', {}, s.title, local.has(s.sha) ? el('span', { className: 'local', title: 'On this device' }) : null), el('span', {}, el('a', { href: `#artist/${encodeURIComponent(s.artist)}` }, s.artist))),
      el('div', { className: 'al' }, s.album ? el('a', { href: `#album/${encodeURIComponent(albumKey(s))}` }, s.album) : ''),
      player.likeButton(s, 'heart'),
      el('div', { className: 'd' }, s.duration ? time(s.duration) : ''),
      el('button', { className: 'm-icon more', 'aria-label': 'More', title: 'More', onclick: (e) => songMenu(e.currentTarget, s, playlist) }, svg('more')));
    box.append(row);
  });
  return box;
}
const paintRows = () => document.querySelectorAll('#view .m-row').forEach((r) => r.classList.toggle('on', r.dataset.id === player.current()?.id));

// ---------- albums and artists ----------
const albumKey = (s) => `${s.artist}\u0001${s.album}`;
function groups(by) {
  const m = new Map();
  for (const s of lib().songs) { const k = by(s); if (k == null) continue; if (!m.has(k)) m.set(k, []); m.get(k).push(s); }
  return [...m].sort((a, b) => a[0].localeCompare(b[0]));
}
const cover = (songs) => songs.find((x) => x.coverSha) || songs[0] || null;
function card({ href, artEl, title, sub, n, play, round }) {
  return el('a', { className: `m-card${round ? ' round' : ''}`, href, style: `--n:${Math.min(n, 20)}` }, artEl, el('b', {}, title), el('span', {}, sub),
    play ? el('button', { className: 'go', 'aria-label': `Play ${title}`, onclick: (e) => { e.preventDefault(); play(); } }, svg('play', true)) : null);
}
const sortAlbum = (songs) => [...songs].sort((a, b) => (a.added || 0) - (b.added || 0) || a.title.localeCompare(b.title));
function albumsView() {
  const list = groups((s) => (s.album ? albumKey(s) : null));
  const wrap = el('div', {}, hero({ title: 'Albums', sub: list.length ? plural(list.length, 'album') : '' }));
  const st = status();
  if (st) return wrap.append(st), wrap;
  if (!list.length) return wrap.append(nothing('No albums yet', 'Songs that name their album show up here, one card for each album.')), wrap;
  wrap.append(el('div', { className: 'm-grid' }, ...list.map(([k, songs], i) => card({ href: `#album/${encodeURIComponent(k)}`, artEl: art(cover(songs), { key: songs[0].album, label: songs[0].album, size: 160 }), title: songs[0].album, sub: songs[0].artist, n: i, play: () => player.playList(sortAlbum(songs), 0) }))));
  return wrap;
}
function albumView(key) {
  const songs = sortAlbum(lib().songs.filter((s) => s.album && albumKey(s) === key));
  if (!songs.length) return missing('That album isn’t in your library.');
  return el('div', {}, hero({ kind: 'Album', title: songs[0].album, sub: `${songs[0].artist} · ${plural(songs.length, 'song')} · ${total(songs)}`, artEl: art(cover(songs), { key: songs[0].album, label: songs[0].album, size: 132 }) }),
    el('div', { className: 'm-actions' }, ...playButtons(songs)), songList(songs));
}
function artistsView() {
  const list = groups((s) => s.artist);
  const wrap = el('div', {}, hero({ title: 'Artists', sub: list.length ? plural(list.length, 'artist') : '' }));
  const st = status();
  if (st) return wrap.append(st), wrap;
  if (!list.length) return wrap.append(emptyLibrary()), wrap;
  wrap.append(el('div', { className: 'm-grid' }, ...list.map(([name, songs], i) => card({ href: `#artist/${encodeURIComponent(name)}`, round: true, artEl: art(cover(songs), { key: name, label: name, size: 160 }), title: name, sub: plural(songs.length, 'song'), n: i, play: () => player.playList(songs, 0) }))));
  return wrap;
}
function artistView(name) {
  const songs = lib().songs.filter((s) => s.artist === name).sort((a, b) => a.album.localeCompare(b.album) || a.title.localeCompare(b.title));
  if (!songs.length) return missing('That artist isn’t in your library.');
  return el('div', {}, hero({ kind: 'Artist', title: name, sub: `${plural(songs.length, 'song')} · ${total(songs)}`, artEl: art(cover(songs), { key: name, label: name, size: 132 }), round: true }),
    el('div', { className: 'm-actions' }, ...playButtons(songs)), songList(songs));
}

// ---------- liked, playlists, search ----------
function likedView() {
  const songs = lib().songs.filter((s) => s.liked).sort(SORTS.added[1]);
  const wrap = el('div', {}, hero({ title: 'Liked', sub: songs.length ? `${plural(songs.length, 'song')} · ${total(songs)}` : '', artEl: el('div', { className: 'm-art', style: '--gen:linear-gradient(135deg,#f0507a,#b48cff);--s:132px' }, svg('heart', true)) }));
  const st = status();
  if (st) return wrap.append(st), wrap;
  if (!songs.length) return wrap.append(nothing('Nothing liked yet', 'Tap the heart on any song and it lands here, on every device.')), wrap;
  wrap.append(el('div', { className: 'm-actions' }, ...playButtons(songs)), songList(songs));
  return wrap;
}
function playlistsView() {
  const wrap = el('div', {}, hero({ title: 'Playlists', sub: lib().playlists.length ? plural(lib().playlists.length, 'playlist') : '' }));
  const st = status();
  if (st) return wrap.append(st), wrap;
  const make = el('button', { className: 'm-card new', style: `--n:${lib().playlists.length}`, onclick: () => newPlaylist().then((p) => p && (location.hash = `#playlist/${p.id}`)) }, el('div', {}, svg('plus'), el('b', {}, 'New playlist')));
  wrap.append(el('div', { className: 'm-grid' }, ...lib().playlists.map((p, i) => {
    const songs = p.songs.map(song).filter(Boolean);
    return card({ href: `#playlist/${p.id}`, artEl: art(cover(songs), { key: p.name, label: p.name, size: 160 }), title: p.name, sub: plural(songs.length, 'song'), n: i, play: songs.length ? () => player.playList(songs, 0) : null });
  }), make));
  return wrap;
}
function playlistView(id) {
  const p = lib().playlists.find((x) => x.id === id);
  if (!p) return missing('That playlist isn’t here any more.');
  const songs = p.songs.map(song).filter(Boolean);
  return el('div', {}, hero({ kind: 'Playlist', title: p.name, sub: songs.length ? `${plural(songs.length, 'song')} · ${total(songs)}` : 'No songs yet', artEl: art(cover(songs), { key: p.name, label: p.name, size: 132 }) }),
    el('div', { className: 'm-actions' }, ...playButtons(songs), el('span', { className: 'm-grow' }),
      el('button', { className: 'btn', onclick: () => renamePlaylist(p) }, svg('edit'), 'Rename'),
      el('button', { className: 'btn', onclick: () => deletePlaylist(p) }, svg('trash'), 'Delete')),
    songs.length ? songList(songs, { playlist: p }) : nothing('An empty playlist', 'Add songs from their ⋯ menu: Add to playlist.'));
}
function searchView(text) {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean), songs = lib().songs.filter((s) => words.every((w) => `${s.title} ${s.artist} ${s.album}`.toLowerCase().includes(w)));
  if (q.value.trim() !== text) q.value = text;
  return el('div', {}, hero({ kind: 'Search', title: text ? `“${text}”` : 'Search', sub: plural(songs.length, 'song') }),
    songs.length ? songList(songs) : nothing('Nothing found', 'Search looks through titles, artists and albums.'));
}

// ---------- changes ----------
function addTo(p, s) {
  if (p.songs.includes(s.id)) return toast(`Already in ${p.name}`);
  save(`Added ${s.title} to ${p.name}`, (index) => { const x = index.playlists.find((y) => y.id === p.id); if (x && !x.songs.includes(s.id)) x.songs.push(s.id); }).catch(() => {});
  toast(`Added to ${p.name}`);
}
const removeFrom = (p, s) => save(`Took ${s.title} out of ${p.name}`, (index) => { const x = index.playlists.find((y) => y.id === p.id); if (x) x.songs = x.songs.filter((id) => id !== s.id); }).catch(() => {});
async function newPlaylist(first) {
  const name = await ask({ title: 'New playlist', field: 'Name', value: `Playlist ${lib().playlists.length + 1}`, ok: 'Make it' });
  if (!name) return null;
  const p = { id: uid(), name, songs: first ? [first.id] : [], made: Date.now() };
  save(`New playlist ${name}`, (index) => { if (!index.playlists.some((x) => x.id === p.id)) index.playlists.push(structuredClone(p)); }).catch(() => {});
  return p;
}
async function renamePlaylist(p) {
  const name = await ask({ title: 'Rename playlist', field: 'Name', value: p.name, ok: 'Rename' });
  if (name && name !== p.name) save(`Renamed ${p.name} to ${name}`, (index) => { const x = index.playlists.find((y) => y.id === p.id); if (x) x.name = name; }).catch(() => {});
}
async function deletePlaylist(p) {
  if (!(await sure(`Delete ${p.name}?`, 'The playlist goes, but its songs stay in your library.'))) return;
  location.hash = '#playlists';
  save(`Deleted playlist ${p.name}`, (index) => { index.playlists = index.playlists.filter((x) => x.id !== p.id); }).catch(() => {});
}
async function deleteSong(s) {
  if (!(await sure(`Delete ${s.title}?`, `It goes from your library and from ${conn().repo} (its history keeps a copy).`))) return;
  player.forget(s.id);
  save(`Deleted ${s.title}`, (index) => {
    const x = index.songs.find((y) => y.id === s.id);
    index.songs = index.songs.filter((y) => y.id !== s.id);
    for (const p of index.playlists) p.songs = p.songs.filter((id) => id !== s.id);
    return { remove: x ? [x.path, x.cover].filter(Boolean) : [] };
  }).catch(() => {});
  toast(`Deleted ${s.title}`);
}
// a song's file sits at songs/<artist>/<title>.<ending>, kept clear of the others
function pathFor(artist, title, ending, taken) {
  const dir = `songs/${safe(artist, 'Unknown artist')}`, name = safe(title, 'Untitled');
  for (let k = 1; ; k++) { const p = `${dir}/${name}${k > 1 ? ` (${k})` : ''}.${ending}`; if (!taken(p)) return p; }
}
async function editSong(s) {
  let picture = null;
  const pick = el('div', { className: 'm-cover-pick' }, art(s, { size: 72 }), el('button', { className: 'btn', type: 'button', onclick: () => {
    const input = el('input', { type: 'file', accept: 'image/*' });
    input.onchange = () => { picture = input.files[0] || null; if (picture) pick.firstChild.replaceWith(el('div', { className: 'm-art', style: '--s:72px' }, el('img', { src: URL.createObjectURL(picture), alt: '' }))); };
    input.click();
  } }, 'Change cover'));
  const got = await form({ title: 'Edit details', fields: [['title', 'Title', s.title], ['artist', 'Artist', s.artist], ['album', 'Album', s.album]], extra: pick, ok: 'Save' });
  if (!got) return;
  const title = got.title || s.title, artist = got.artist || 'Unknown artist', album = got.album;
  let coverAdd = null;
  if (picture) {
    try {
      const sha = await gh.blobSha(new Uint8Array(await picture.arrayBuffer()));
      toast('Saving the cover…');
      await gh.upload(conn(), picture); store.put(sha, picture);
      coverAdd = { path: `covers/${s.id}.${picture.type === 'image/png' ? 'png' : 'jpg'}`, sha };
    } catch (e) { return toast(`Couldn’t save the cover: ${gh.explain(e, conn())}`); }
  }
  save(`Edited ${title}`, (index, now) => {
    const x = index.songs.find((y) => y.id === s.id);
    if (!x) return {};
    const add = [], remove = [];
    if (title !== x.title || artist !== x.artist) {
      const to = pathFor(artist, title, ext(x.path), (p) => p !== x.path && (now.files.has(p) || index.songs.some((y) => y.path === p)));
      if (to !== x.path) { add.push({ path: to, sha: x.sha }); remove.push(x.path); x.path = to; }
    }
    Object.assign(x, { title, artist, album });
    if (coverAdd) { if (x.cover && x.cover !== coverAdd.path) remove.push(x.cover); add.push(coverAdd); x.cover = coverAdd.path; x.coverSha = coverAdd.sha; }
    return { add, remove };
  }).catch(() => {});
}
async function downloadSong(s) {
  try {
    const blob = (await store.get(s.sha)) || (await gh.download(conn(), s.sha));
    const a = el('a', { href: URL.createObjectURL(blob), download: s.path.split('/').pop() });
    document.body.append(a); a.click(); a.remove();
  } catch (e) { toast(`Couldn’t download it: ${gh.explain(e, conn())}`); }
}

// ---------- menus and dialogs (no prompt() or confirm(): Fluent doesn't have them) ----------
let menuEl = null;
function closeMenu() { menuEl?.remove(); menuEl = null; }
function openMenu(anchor, items) {
  closeMenu();
  menuEl = el('div', { className: 'm-menu', role: 'menu' }, ...items);
  document.body.append(menuEl);
  const r = anchor.getBoundingClientRect(), m = menuEl.getBoundingClientRect();
  menuEl.style.left = `${Math.max(8, Math.min(r.right - m.width, innerWidth - m.width - 8))}px`;
  menuEl.style.top = `${r.bottom + m.height + 8 > innerHeight ? Math.max(8, r.top - m.height - 6) : r.bottom + 6}px`;
  menuEl.querySelector('button')?.focus({ preventScroll: true });
}
addEventListener('pointerdown', (e) => { if (menuEl && !menuEl.contains(e.target) && !e.target.closest('.more')) closeMenu(); });
const item = (icon, text, fn, cls) => el('button', { role: 'menuitem', className: cls || '', onclick: () => { closeMenu(); fn(); } }, svg(icon), text);
function songMenu(anchor, s, playlist) {
  openMenu(anchor, [
    item('next2', 'Play next', () => { player.playNext(s); toast(`${s.title} plays next`); }),
    item('queue', 'Add to queue', () => { player.addToQueue(s); toast('Added to the queue'); }),
    el('hr'), el('div', { className: 'label' }, 'Add to playlist'),
    ...lib().playlists.map((p) => item('list', p.name, () => addTo(p, s))),
    item('plus', 'New playlist…', () => newPlaylist(s)),
    el('hr'),
    playlist ? item('x', `Take out of ${playlist.name}`, () => removeFrom(playlist, s)) : null,
    item('edit', 'Edit details…', () => editSong(s)),
    item('download', 'Download', () => downloadSong(s)),
    item('trash', 'Delete…', () => deleteSong(s), 'danger'),
  ].filter(Boolean));
}
function dialog(build) {
  return new Promise((done) => {
    const scrim = el('div', { className: 'm-scrim' });
    const close = (v) => { scrim.remove(); removeEventListener('keydown', key, true); done(v); };
    const key = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(null); } };
    addEventListener('keydown', key, true);
    scrim.addEventListener('pointerdown', (e) => { if (e.target === scrim) close(null); });
    scrim.append(build(close));
    document.body.append(scrim);
    scrim.querySelector('input, .primary')?.focus();
  });
}
function form({ title, fields, ok, extra }) {
  return dialog((close) => {
    const inputs = fields.map(([k, , value]) => [k, el('input', { className: 'input', value: value ?? '', autocomplete: 'off' })]);
    return el('form', { className: 'm-dialog', onsubmit: (e) => { e.preventDefault(); close(Object.fromEntries(inputs.map(([k, i]) => [k, i.value.trim()]))); } },
      el('h2', {}, title), extra || null, ...inputs.map(([, i], n) => el('label', { className: 'm-field' }, fields[n][1], i)),
      el('div', { className: 'row' }, el('button', { className: 'btn', type: 'button', onclick: () => close(null) }, 'Cancel'), el('button', { className: 'btn primary', type: 'submit' }, ok)));
  });
}
const ask = async ({ title, field, value, ok }) => (await form({ title, fields: [['v', field, value]], ok }))?.v || '';
const sure = (title, text) => dialog((close) => el('div', { className: 'm-dialog' }, el('h2', {}, title), el('p', { className: 'm-muted', style: 'margin:0' }, text),
  el('div', { className: 'row' }, el('button', { className: 'btn', onclick: () => close(false) }, 'Keep'), el('button', { className: 'btn danger primary', onclick: () => close(true) }, 'Delete'))));

// ---------- adding songs ----------
function pickFiles() {
  if (!conn()) return toast('Connect your Database first.');
  const input = el('input', { type: 'file', accept: 'audio/*,.mp3,.m4a,.flac,.ogg,.opus,.wav,.aac,.webm', multiple: true });
  input.onchange = () => addFiles([...input.files]);
  input.click();
}
const duration = (file) => new Promise((done) => {
  const a = new Audio(), url = URL.createObjectURL(file), end = (v) => { URL.revokeObjectURL(url); done(v); };
  a.preload = 'metadata'; a.onloadedmetadata = () => end(Number.isFinite(a.duration) ? Math.round(a.duration) : 0); a.onerror = () => end(0);
  setTimeout(() => end(0), 8000);
  a.src = url;
});
let tray = null;
function trayRow(name) {
  if (!tray) {
    tray = el('div', { className: 'm-tray', role: 'status' }, el('h3', {}, el('span', { className: 'm-ring' }), el('span', { className: 'm-grow' }, 'Adding songs'), el('button', { className: 'm-icon', 'aria-label': 'Hide', onclick: () => { tray?.remove(); tray = null; } }, svg('x'))), el('ul'));
    document.body.append(tray);
  }
  const st = el('span', { className: 'st' }, 'Waiting'), bar = el('div', { className: 'bar' }, el('i'));
  tray.querySelector('ul').append(el('li', {}, el('b', {}, name), st, bar));
  return { set: (text, p, cls = '') => { st.textContent = text; st.className = `st ${cls}`; if (p != null) bar.style.setProperty('--p', `${Math.round(p * 100)}%`); } };
}
let adding = Promise.resolve();
async function addFiles(files) {
  if (!conn()) return toast('Connect your Database first.');
  const list = files.filter((f) => f.type.startsWith('audio/') || gh.AUDIO.test(f.name));
  if (!list.length) return toast('Those aren’t songs Music can play (MP3, M4A, FLAC, OGG, WAV…).');
  const rows = list.map((f) => [f, trayRow(f.name)]);
  adding = adding.then(async () => {
    for (const [file, row] of rows) {
      try {
        if (file.size > 95e6) { row.set('Too big for GitHub (over 95 MB)', 1, 'bad'); continue; }
        row.set('Reading', 0.02);
        const data = new Uint8Array(await file.arrayBuffer()), sha = await gh.blobSha(data);
        if (!state.base) state.base = await gh.library(conn());
        if (lib().songs.some((x) => x.sha === sha)) { row.set('Already in your library', 1, 'done'); continue; }
        const tags = readTags(data, file.name), id = uid(), ending = ext(file.name), secs = await duration(file);
        let pic = null;
        if (tags.picture) pic = { path: `covers/${id}.${tags.picture.mime.includes('png') ? 'png' : 'jpg'}`, sha: await gh.blobSha(tags.picture.data), blob: new Blob([tags.picture.data], { type: tags.picture.mime }) };
        row.set('Uploading', 0.04);
        await gh.upload(conn(), file, (p) => row.set(`Uploading ${Math.round(p * 100)}%`, 0.04 + p * 0.86));
        if (pic) { await gh.upload(conn(), pic.blob); store.put(pic.sha, pic.blob); }
        store.put(sha, file); local.add(sha);
        row.set('Saving', 0.94);
        const entry = { id, title: tags.title, artist: tags.artist, album: tags.album, path: '', sha, size: file.size, duration: secs, cover: pic?.path || '', coverSha: pic?.sha || '', liked: false, added: Date.now() };
        await save(`Added ${entry.title}`, (index, now) => {
          if (index.songs.some((x) => x.sha === sha)) return {};
          const e = { ...entry, path: pathFor(entry.artist, entry.title, ending, (p) => now.files.has(p) || index.songs.some((y) => y.path === p)) };
          index.songs.push(e);
          return { add: [{ path: e.path, sha }, ...(pic ? [{ path: pic.path, sha: pic.sha }] : [])] };
        });
        row.set('Saved', 1, 'done');
      } catch (e) { row.set(gh.explain(e, conn()), 1, 'bad'); }
    }
    if (tray) { tray.querySelector('.m-ring')?.replaceWith(svg('check')); tray.querySelector('h3 .m-grow').textContent = 'Done'; const t = tray; setTimeout(() => { if (tray === t) { t.remove(); tray = null; } }, 6000); }
  });
}
let dropEl = null, dragDepth = 0;
const hasFiles = (e) => [...(e.dataTransfer?.types || [])].includes('Files');
addEventListener('dragenter', (e) => { if (!hasFiles(e)) return; e.preventDefault(); dragDepth++; if (!dropEl) { dropEl = el('div', { className: 'm-drop' }, el('div', {}, svg('upload'), el('div', {}, 'Drop to add to your library'))); document.body.append(dropEl); } });
addEventListener('dragover', (e) => { if (hasFiles(e)) e.preventDefault(); });
addEventListener('dragleave', (e) => { if (!hasFiles(e)) return; if (--dragDepth <= 0) { dropEl?.remove(); dropEl = null; dragDepth = 0; } });
addEventListener('drop', (e) => { if (!hasFiles(e)) return; e.preventDefault(); dropEl?.remove(); dropEl = null; dragDepth = 0; addFiles([...e.dataTransfer.files]); });

// ---------- connecting, and Music's settings ----------
function connectPanel() {
  const repo = el('input', { className: 'input', value: 'TrixWotel/Database', autocomplete: 'off', spellcheck: false });
  const token = el('input', { className: 'input', type: 'password', placeholder: 'github_pat_…', autocomplete: 'off' });
  const err = el('p', { className: 'm-error' }), go = el('button', { className: 'btn primary', type: 'submit' }, svg('cloud'), 'Connect');
  return el('div', { className: 'm-panel' },
    el('h2', {}, 'Connect your Database'),
    el('p', { className: 'm-muted' }, 'Your songs live in your private Database repo on GitHub, on its music branch. Make a token that can only reach that repo:'),
    el('ol', {}, el('li', {}, 'On GitHub: Settings → Developer settings → Fine-grained tokens → Generate new token.'), el('li', {}, 'Repository access: Only select repositories → your Database repo.'), el('li', {}, 'Permissions: Contents → Read and write. Then generate it and paste it here.')),
    el('form', { className: 'm-form', onsubmit: async (e) => {
      e.preventDefault(); err.textContent = ''; go.disabled = true;
      try { state.conn = await gh.connect(repo.value, token.value); toast(`Connected to ${state.conn.repo}`); location.hash = '#songs'; refresh(); }
      catch (x) { err.textContent = x.message; }
      go.disabled = false;
    } }, el('label', { className: 'm-field' }, 'Repo', repo), el('label', { className: 'm-field' }, 'Token (it stays in this browser only)', token), err, el('div', {}, go)));
}
const connectView = () => el('div', {}, hero({ kind: 'Music', title: 'Your music, on every page', sub: 'Songs from your private Database repo, played here and carried along as you move around the site.' }), connectPanel());
function settingsView() {
  const wrap = el('div', {}, hero({ title: 'Music settings' }));
  if (conn()) {
    wrap.append(el('div', { className: 'm-panel' },
      el('h2', {}, 'Your Database'),
      el('p', {}, el('span', { className: 'm-status' }, el('span', { className: 'dot' }), `Connected to ${conn().repo}`), conn().from === 'workspace' ? el('span', { className: 'm-muted' }, ' · with Data, Code and Notes’ token') : null),
      el('p', { className: 'm-muted' }, 'Songs are saved on its ', el('b', {}, gh.BRANCH), ' branch: songs/ (a folder for each artist), covers/ and music.json. Data, Code and Notes stay on main.'),
      el('div', { className: 'm-actions', style: 'margin:0' },
        el('a', { className: 'btn', href: `https://github.com/${conn().repo}/tree/${gh.BRANCH}`, target: '_blank', rel: 'noopener' }, 'Open on GitHub'),
        el('button', { className: 'btn', onclick: refresh }, 'Reload library'),
        conn().from === 'music' ? el('button', { className: 'btn', onclick: () => { gh.disconnect(); state.conn = gh.connection(); toast(state.conn ? 'Using the other token now' : 'Disconnected'); refresh(); render(); } }, 'Disconnect') : null)));
  } else wrap.append(connectPanel());
  const kept = el('span', {}, '…');
  store.size().then((n) => { kept.textContent = n ? bytes(n) : 'nothing yet'; });
  const look = read('fluentio.music.look', {});
  wrap.append(el('div', { className: 'm-panel' },
    el('h2', {}, 'On this device'),
    el('p', { className: 'm-muted' }, 'Songs you play (or add here) are kept in this browser, so they start at once, carry on between pages and play without the internet. Kept now: ', kept, '.'),
    el('div', { className: 'm-actions', style: 'margin:0' },
      el('button', { className: 'btn', disabled: !conn() || !lib().songs.length, onclick: keepAll }, svg('download'), 'Keep every song here'),
      el('button', { className: 'btn', onclick: async () => { await store.clear(); local.clear(); toast('Cleared this device’s copies'); render(); } }, 'Clear'))));
  wrap.append(el('div', { className: 'm-panel' },
    el('h2', {}, 'Colors'),
    el('p', { className: 'm-muted' }, 'On this page, the colors can follow the cover of the song that’s playing.'),
    el('div', { className: 'seg' }, ...[[true, 'From the cover'], [false, 'The site’s']].map(([v, name]) => el('button', { type: 'button', className: (look.cover !== false) === v ? 'on' : '', onclick: () => { write('fluentio.music.look', { ...look, cover: v }); tint(); render(); } }, name))),
    el('p', { className: 'm-muted', style: 'margin:12px 0 0' }, 'Keys here: Space plays or pauses, ← → seek, Shift with ← → for the last or next song, L likes it.')));
  return wrap;
}
async function keepAll() {
  const todo = lib().songs.filter((s) => !local.has(s.sha));
  if (!todo.length) return toast('Every song is already on this device');
  toast(`Keeping ${plural(todo.length, 'song')} on this device…`);
  for (const s of todo) { try { store.put(s.sha, await gh.download(conn(), s.sha)); local.add(s.sha); } catch {} }
  toast('Every song is on this device now'); render();
}

// ---------- the cover's colors, here ----------
async function tint() {
  const root = document.documentElement, s = player.current();
  if (read('fluentio.music.look', {}).cover === false || !s) { root.style.removeProperty('--accent'); root.style.removeProperty('--accent-2'); return; }
  const h = await player.hueOf(s);
  if (player.current()?.id !== s.id) return;
  const light = getComputedStyle(root).colorScheme.includes('dark') ? 68 : 50;
  root.style.setProperty('--accent', `hsl(${Math.round(h)} 78% ${light}%)`);
  root.style.setProperty('--accent-2', `hsl(${Math.round((h + 50) % 360)} 70% ${light + 4}%)`);
}

// ---------- Now Playing ----------
let nowEl = null, nowSeek = null, canvas = null;
function openNow() {
  if (!player.current() || nowEl) return;
  nowEl = el('div', { className: 'm-now', role: 'dialog', 'aria-label': 'Now playing' });
  document.body.append(nowEl);
  paintNow();
}
function closeNow() {
  if (!nowEl) return;
  const n = nowEl; nowEl = null; nowSeek = null; canvas = null;
  n.classList.add('leaving'); setTimeout(() => n.remove(), 400);
}
function paintNow() {
  if (!nowEl) return;
  const s = player.current();
  if (!s) return closeNow();
  nowSeek = player.seeker();
  canvas = el('canvas', { 'aria-hidden': 'true' });
  const bg = el('div', { className: 'm-now-bg' });
  coverUrl(s).then((u) => { if (u) bg.style.backgroundImage = `url("${u}")`; else bg.style.background = shade(s.album || s.title); });
  const next = player.upNext();
  nowEl.replaceChildren(bg, el('div', { className: 'm-now-in' },
    el('div', { className: 'm-now-top' }, el('button', { className: 'm-icon', 'aria-label': 'Close', onclick: closeNow }, svg('down')), el('span', { className: 'm-muted' }, 'Now playing'), el('span', { className: 'm-grow' }),
      player.likeButton(s), el('button', { className: 'm-icon more', 'aria-label': 'More', onclick: (e) => songMenu(e.currentTarget, s) }, svg('more'))),
    el('div', { className: 'm-stage' }, canvas, art(s, { size: 300 })),
    el('div', { className: 'm-info' },
      el('h2', {}, s.title), el('p', {}, el('a', { href: `#artist/${encodeURIComponent(s.artist)}`, onclick: closeNow }, s.artist), s.album ? ` · ${s.album}` : ''),
      nowSeek.box, player.controls(),
      el('div', { className: 'm-queue' }, el('h3', {}, next.length ? `Up next · ${next.length}` : 'Nothing up next'),
        next.length ? el('div', { className: 'm-songs' }, ...next.slice(0, 50).map((x, i) => el('div', { className: 'm-row', style: `--n:${Math.min(i, 12)}`, onclick: () => player.jump(player.position() + 1 + i) }, art(x), el('div', { className: 't' }, el('b', {}, x.title), el('span', {}, x.artist)), el('div', { className: 'd' }, x.duration ? time(x.duration) : '')))) : null))));
  drawRing();
}
// the ring: bars round the cover, as tall as each pitch is loud, in the cover's colors
function drawRing() {
  if (!canvas) return;
  const w = canvas.clientWidth, h = canvas.clientHeight, dpr = devicePixelRatio || 1;
  if (!w) return;
  if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
  const g = canvas.getContext('2d'), cs = getComputedStyle(document.documentElement), a1 = cs.getPropertyValue('--accent').trim() || '#6c9bff', a2 = cs.getPropertyValue('--accent-2').trim() || '#b48cff';
  g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2, r0 = w * 0.43, N = 96, t = performance.now() / 1000, { analyser, freq } = player.sound, live = analyser && !player.audio.paused && !document.documentElement.classList.contains('no-motion');
  const grad = g.createLinearGradient(0, 0, w, h); grad.addColorStop(0, a1); grad.addColorStop(1, a2);
  g.strokeStyle = grad; g.lineCap = 'round'; g.lineWidth = Math.max(2, w / 160);
  for (let i = 0; i < N; i++) {
    const k = i < N / 2 ? i : N - 1 - i, bin = 2 + Math.floor((k / (N / 2)) * 60);
    const v = Math.max(0.03, live ? freq[bin] / 255 : 0.06 + 0.04 * Math.sin(t * 1.4 + i * 0.5));
    const ang = (i / N) * Math.PI * 2 - Math.PI / 2, len = 3 + v * w * 0.06;
    g.globalAlpha = 0.45 + v * 0.55;
    g.beginPath(); g.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0); g.lineTo(cx + Math.cos(ang) * (r0 + len), cy + Math.sin(ang) * (r0 + len)); g.stroke();
  }
  g.globalAlpha = 1;
}
player.setOpenNow(openNow);
player.events.addEventListener('frame', drawRing);
player.events.addEventListener('time', () => nowSeek?.paint());
player.events.addEventListener('song', () => { paintRows(); paintNow(); tint(); });
player.events.addEventListener('state', () => { paintRows(); if (nowEl) { const c = nowEl.querySelector('.m-btns'); c?.replaceWith(player.controls()); } });
player.events.addEventListener('queue', () => { if (nowEl) paintNow(); });
libraryEvents.addEventListener('library', () => { render(); if (nowEl) paintNow(); });

// ---------- keys here ----------
addEventListener('keydown', (e) => {
  if (e.defaultPrevented || e.target.closest?.('input, textarea, select, [contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return;
  const s = player.current();
  if (e.key === ' ' && !e.target.closest?.('button, a')) { e.preventDefault(); player.toggle(); }
  else if (e.key === 'ArrowRight' && s) { e.preventDefault(); if (e.shiftKey) player.next(); else player.seek(player.audio.currentTime + 5); }
  else if (e.key === 'ArrowLeft' && s) { e.preventDefault(); if (e.shiftKey) player.prev(); else player.seek(player.audio.currentTime - 5); }
  else if (e.key.toLowerCase() === 'l' && s) player.like(s, !s.liked);
  else if (e.key === 'Escape') { if (menuEl) closeMenu(); else closeNow(); }
});

// ---------- go ----------
player.mount();
render(true);
tint();
refresh();
if (route().name === 'now') { history.replaceState(null, '', '#songs'); setTimeout(openNow, 300); }
