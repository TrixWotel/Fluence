// Station: an endless whiteboard (Excalidraw), kept on the station branch of the repo you're connected to (Music's
// connection, or Data, Code and Notes'). Every change is saved in this browser straight away, then on GitHub a few
// seconds later, so a page that closes loses nothing: whatever didn't get there goes up the next time it opens.
// The board goes up as station.excalidraw (it opens on excalidraw.com too), with each picture as a file of its own, so
// a picture is only ever sent once, and the commits stay small. Before a save, and when you come back to the page, it
// looks at GitHub and puts the two copies together, element by element (the newer version of each wins, and what was
// erased stays erased), so another browser's drawing is never saved over.
// Excalidraw draws and keeps the board, but its interface stays hidden (station/index.html): what you see is a small toolbar
// of our own (select, pen, box, diamond, circle, arrow, text), and one row of styles when there's something to apply them
// to. Settings has the rest: the font, the toolbar's tools, the right-click menu, all of Excalidraw's own tools, and buttons
// to show everything, save a picture or clear the board.
import { connection, call, explain } from '../kit/music/github.js';

const f = window.fluentio, { el } = f;
const VERSION = '0.18.1', LIBRARY_URL = `https://esm.sh/@excalidraw/excalidraw@${VERSION}/dist/prod/index.js?external=react,react-dom`;
const BRANCH = 'station', SCENE = 'station.excalidraw', LIBRARY = 'library.excalidrawlib', FILES = 'files/';
const SOON = 5000, LATEST = 30000;     // (a save this long after you stop drawing, and at least this often while you don't)
const README = `# Station

Your board from Fluence (https://trixwotel.github.io/Fluence/station/), saved here by itself.

* **station.excalidraw** is the board. It opens on excalidraw.com too, without its pictures.
* **files/** has the pictures on the board, one file each.
* **library.excalidrawlib** is your Excalidraw library.
`;
const board = document.getElementById('board'), status = document.getElementById('status'), tools = document.getElementById('tools'), tray = document.getElementById('tray');
const say = (text, cls = '', link = null) => { status.className = `st-status ${cls}`; status.replaceChildren(text, ...(link ? [' ', el('a', { href: link[1] }, link[0])] : [])); };

// ---------- this browser's copy ----------
const db = () => new Promise((done, failed) => {
  const r = indexedDB.open('fluence-station', 1);
  r.onupgradeneeded = () => r.result.createObjectStore('kv');
  r.onsuccess = () => done(r.result);
  r.onerror = () => failed(r.error);
});
let opened = null;
const store = async (mode, run) => {
  const d = await (opened ??= db());
  return new Promise((done, failed) => { const t = d.transaction('kv', mode), r = run(t.objectStore('kv')); t.oncomplete = () => done(r.result); t.onerror = () => failed(t.error); });
};
const get = (key) => store('readonly', (s) => s.get(key));
const put = (key, value) => store('readwrite', (s) => s.put(value, key));

// ---------- GitHub ----------
const unbase = (text) => new TextDecoder().decode(Uint8Array.from(atob(text.replace(/\s/g, '')), (c) => c.charCodeAt(0)));
const blob = async (s, sha) => JSON.parse(unbase((await call(s, 'GET', `/git/blobs/${sha}`)).content));
// the branch as it is: its last commit, its tree, and its files (path → sha), or nothing yet
async function listing(s) {
  let head;
  try { head = (await call(s, 'GET', `/git/ref/heads/${BRANCH}`)).object.sha; }
  catch (e) { if (e.status === 404 || e.status === 409) return { head: '', tree: '', files: new Map() }; throw e; }
  const tree = (await call(s, 'GET', `/git/commits/${head}`)).tree.sha;
  const list = await call(s, 'GET', `/git/trees/${tree}?recursive=1`);
  return { head, tree, files: new Map(list.tree.filter((x) => x.type === 'blob').map((x) => [x.path, x.sha])) };
}

// ---------- the board ----------
let ex = null, api = null, seen = -1, dirty = false, pushing = null, again = false, timer = 0, firstChange = 0, lastHead = '', sentFiles = new Set(), library = null, libraryDirty = false, view = {}, localTimer = 0;
const VIEW = ['scrollX', 'scrollY', 'zoom'];
const pickView = (a) => Object.fromEntries(VIEW.filter((k) => a[k] !== undefined).map((k) => [k, a[k]]));
const sceneText = (elements) => JSON.stringify({ type: 'excalidraw', version: 2, source: location.origin, elements, appState: view, files: {} }, null, 1);
const merged = (remote) => ex.reconcileElements(api.getSceneElementsIncludingDeleted(), ex.restoreElements(remote, null), api.getAppState());
const dark = () => getComputedStyle(document.documentElement).colorScheme.includes('dark');

async function saveHere() {
  clearTimeout(localTimer);
  if (!api) return;
  await put('scene', { elements: api.getSceneElementsIncludingDeleted(), view, pending: dirty, head: lastHead });
  const files = api.getFiles();
  for (const id of Object.keys(files)) if (!sentFiles.has(id) && !(await get(`file:${id}`))) await put(`file:${id}`, files[id]);
}
// a change, from the board: keep it here soon, and on GitHub a little after that
function changed(elements, appState, files) {
  if (appState) { view = pickView(appState); paintTools(appState); }
  const version = ex.getSceneVersion(elements) + Object.keys(files || {}).length;
  clearTimeout(localTimer);
  localTimer = setTimeout(saveHere, 400);
  if (version === seen) return;
  seen = version;
  dirty = true;
  firstChange ||= Date.now();
  schedule();
}
function schedule() {
  const s = connection();
  if (!s) { say('Saved in this browser.', '', ['Connect GitHub', '../music/']); return; }
  say('Saving…', 'busy');
  clearTimeout(timer);
  timer = setTimeout(push, Math.min(SOON, Math.max(0, firstChange + LATEST - Date.now())));
}
// up to GitHub, after taking in anything new there
function push() {
  clearTimeout(timer);
  const s = connection();
  if (!s || !api) return Promise.resolve();
  if (pushing) { again = true; return pushing; }
  pushing = (async () => {
    for (let tries = 0; ; tries++) {
      const wasDirty = dirty || libraryDirty;
      const there = await listing(s);
      if (there.head && there.head !== lastHead) await take(s, there);
      if (!wasDirty && there.head && there.files.has(SCENE)) { lastHead = there.head; break; }
      const files = api.getFiles(), tree = [{ path: SCENE, mode: '100644', type: 'blob', content: sceneText(api.getSceneElementsIncludingDeleted()) }];
      for (const id of Object.keys(files)) if (!there.files.has(`${FILES}${id}.json`)) tree.push({ path: `${FILES}${id}.json`, mode: '100644', type: 'blob', content: JSON.stringify(files[id]) });
      if (libraryDirty && library) tree.push({ path: LIBRARY, mode: '100644', type: 'blob', content: JSON.stringify({ type: 'excalidrawlib', version: 2, source: location.origin, libraryItems: library }, null, 1) });
      if (!there.files.has('README.md')) tree.push({ path: 'README.md', mode: '100644', type: 'blob', content: README });
      dirty = false; libraryDirty = false; firstChange = 0;
      try {
        const made = await call(s, 'POST', '/git/trees', there.tree ? { base_tree: there.tree, tree } : { tree });
        if (made.sha === there.tree) { lastHead = there.head; break; }   // (nothing new, so no empty commit)
        const commit = await call(s, 'POST', '/git/commits', { message: 'The board (from Fluence)', tree: made.sha, parents: there.head ? [there.head] : [] });
        if (there.head) await call(s, 'PATCH', `/git/refs/heads/${BRANCH}`, { sha: commit.sha, force: false });
        else await call(s, 'POST', '/git/refs', { ref: `refs/heads/${BRANCH}`, sha: commit.sha });
        lastHead = commit.sha;
        for (const id of Object.keys(files)) sentFiles.add(id);
        break;
      } catch (e) {
        dirty = true;      // (it didn't get there: it's still to do)
        if ((e.status === 422 || e.status === 409) && tries < 4) continue;   // (GitHub moved on meanwhile: again)
        throw e;
      }
    }
    await saveHere();
    say('Saved', 'done');
  })().catch((e) => { dirty = true; say(`Saved in this browser. ${explain(e, s)}`, 'bad'); saveHere(); }).finally(() => {
    pushing = null;
    if (again || dirty) { again = false; if (dirty) { firstChange ||= Date.now(); timer = setTimeout(push, status.classList.contains('bad') ? LATEST : SOON); } }
  });
  return pushing;
}
// what's on GitHub, into the board
async function take(s, there) {
  if (there.files.has(SCENE)) {
    const doc = await blob(s, there.files.get(SCENE));
    if (Array.isArray(doc?.elements)) {
      const elements = fit(merged(doc.elements));
      api.updateScene({ elements, captureUpdate: ex.CaptureUpdateAction?.NEVER });
      seen = ex.getSceneVersion(elements) + Object.keys(api.getFiles()).length;
    }
  }
  await bringFiles(s, there);
  lastHead = there.head;
}
// the pictures on the board that aren't here yet
async function bringFiles(s, there) {
  const have = api.getFiles(), wanted = [];
  for (const [path, sha] of there.files) {
    if (!path.startsWith(FILES)) continue;
    const id = path.slice(FILES.length).replace(/\.json$/, '');
    sentFiles.add(id);
    if (have[id]) continue;
    const local = await get(`file:${id}`), file = local || await blob(s, sha);
    if (!local) await put(`file:${id}`, file);
    wanted.push(file);
  }
  if (wanted.length) api.addFiles(wanted);
}
// back to the page: anything new from another browser?
async function look() {
  const s = connection();
  if (!s || !api || pushing || document.hidden) return;
  try {
    const there = await listing(s);
    if (there.head && there.head !== lastHead && !pushing) await take(s, there);
  } catch {}
}

// ---------- the board's font ----------
// Excalidraw keeps a text's font as a number, and looks up its name in its FONT_FAMILY table each time it measures or draws
// it. That table can be changed, so MAIN and CODE (its numbers for Nunito and for its code font) can stand for the fonts
// you like: the numbers on the board stay ones excalidraw.com knows, and each browser can use its own choice.
const MAIN = 6, CODE = 8, CODE_FONT = 'JetBrains Mono';
let mainStack = '';
// (a browser can hold on to an older kit/look.js for a few minutes after the site changes, without these)
const FONT_LIST = f.BOARD_FONTS || ['Inter'], sheetFor = f.fontSheet || ((names) => `https://fonts.googleapis.com/css2?family=${names[0].replace(/ /g, '+')}&display=swap`);
const wantedFont = () => (FONT_LIST.includes(f.settings.boardFont) ? f.settings.boardFont : FONT_LIST[0]);
const stackOf = (name) => (name === 'System' ? 'system-ui' : `"${name}"`);
// (added by script, not by a stylesheet: a font from a stylesheet can go back to unloaded when the page's styles change, as
// when the window is resized, and a canvas then draws in the fallback font)
const fontsIn = new Map();
const addFont = (name) => {
  if (name === 'System') return Promise.resolve();
  if (!fontsIn.has(name)) fontsIn.set(name, fetch(sheetFor([name])).then((r) => r.text()).then((css) => {
    for (const [, block] of css.matchAll(/@font-face\s*{([^}]*)}/g)) {
      const src = /url\(([^)]+)\)/.exec(block)?.[1], range = /unicode-range:\s*([^;]+);/.exec(block)?.[1];
      if (src) document.fonts.add(new FontFace(name, `url(${src})`, { unicodeRange: range || 'U+0-10FFFF', display: 'swap' }));
    }
  }));
  return fontsIn.get(name);
};
async function useFont(name) {
  const table = ex.FONT_FAMILY;
  for (const [key, id] of Object.entries(table)) if (id === MAIN || id === CODE) table[key] = id + 100;
  mainStack = stackOf(name);
  table[mainStack] = MAIN;
  table[CODE_FONT] = CODE;
  // (the font, if it comes quickly: a page shouldn't wait long for one, and fit() puts things right when it arrives)
  await Promise.race([
    Promise.all([addFont(name), addFont(CODE_FONT)]).then(() => Promise.all([document.fonts.load(`20px ${mainStack}`), document.fonts.load(`20px "${CODE_FONT}"`)])).catch(() => {}),
    new Promise((later) => setTimeout(later, 1500)),
  ]);
}
// words take the room their font needs. Excalidraw measured them in the font of the day they were written, and cuts off
// what doesn't fit, so measure them again here (only in this browser: it isn't a change to save)
const ruler = document.createElement('canvas').getContext('2d');
function fit(elements) {
  return elements.map((e) => {
    if (e.type !== 'text' || (e.fontFamily !== MAIN && e.fontFamily !== CODE)) return e;
    ruler.font = `${e.fontSize}px ${e.fontFamily === MAIN ? mainStack : `"${CODE_FONT}"`}, sans-serif`;
    const width = Math.max(...e.text.split('\n').map((line) => { const m = ruler.measureText(line); return Math.max(m.width, Math.abs(m.actualBoundingBoxLeft) + m.actualBoundingBoxRight); }));
    if (Math.abs(width - e.width) < 0.5) return e;
    const moved = e.textAlign === 'center' ? (e.width - width) / 2 : e.textAlign === 'right' ? e.width - width : 0;
    return { ...e, width, x: e.x + moved };
  });
}
function refit(redraw = false) {
  if (!api) return;
  const all = api.getSceneElementsIncludingDeleted(), fitted = fit(all);
  if (!redraw && fitted.every((e, i) => e === all[i])) return;
  api.updateScene({ elements: redraw ? fitted.map((e) => (e.type === 'text' ? { ...e } : e)) : fitted, captureUpdate: ex.CaptureUpdateAction?.NEVER });
}

// ---------- the theme's color, for what you select and drag ----------
// Excalidraw reads it from --color-selection. On a dark board a filter turns its whole canvas over (it inverts by 93%, then
// turns the hue halfway round), so there it needs the color that the filter turns into the theme's
function selectionColor() {
  ruler.fillStyle = '#6965db';
  ruler.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  const c = ruler.fillStyle, [r, g, b] = c[0] === '#' ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255) : c.match(/[\d.]+/g).slice(0, 3).map((n) => n / 255);
  const wanted = !dark() ? [r, g, b] : [-0.574 * r + 1.43 * g + 0.144 * b, 0.426 * r + 0.43 * g + 0.144 * b, 0.426 * r + 1.43 * g - 0.856 * b].map((v) => Math.min(1, Math.max(0, (0.93 - v) / 0.86)));
  document.documentElement.style.setProperty('--st-selection', `#${wanted.map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('')}`);
}

// ---------- our own tools: Excalidraw's are hidden ----------
// (crisp lines, a clean font, and the site's own background behind the board)
const CLEAN = { viewBackgroundColor: 'transparent', currentItemRoughness: 0, currentItemFontFamily: MAIN, currentItemStrokeWidth: 2, currentItemRoundness: 'round', currentItemArrowType: 'sharp', currentItemFillStyle: 'solid', gridModeEnabled: false };
const path = (d) => `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON = {
  selection: '<path d="M5 3.5 19 12l-6.2 1.6L9.6 19.5Z"/>',
  hand: '<path d="M8 12V6a1.5 1.5 0 0 1 3 0v5m0-6.5a1.5 1.5 0 0 1 3 0V11m0-4a1.5 1.5 0 0 1 3 0v7c0 4-2.5 6.5-6 6.5-3 0-4.5-1.5-6-4.5l-1.6-3a1.4 1.4 0 0 1 2.4-1.4L8 13"/>',
  freedraw: '<path d="M4 20c2-5 4-8 7-11l4-4a2.1 2.1 0 0 1 3 3l-4 4c-3 3-6 5-10 8Z"/>',
  rectangle: '<rect x="4" y="5.5" width="16" height="13" rx="2.5"/>',
  diamond: '<path d="M12 3.5 20.5 12 12 20.5 3.5 12Z"/>',
  ellipse: '<circle cx="12" cy="12" r="8"/>',
  arrow: '<path d="M5 19 19 5M10 5h9v9"/>',
  line: '<path d="M5 19 19 5"/>',
  text: '<path d="M5 6.5V5h14v1.5M12 5v14M9.5 19h5"/>',
  eraser: '<path d="m8 19-4-4a2 2 0 0 1 0-2.8l8.2-8.2a2 2 0 0 1 2.8 0l5 5a2 2 0 0 1 0 2.8L13 19Zm0 0h12M9 7.5l7 7"/>',
  undo: '<path d="M9 7 4.5 11.5 9 16M4.5 11.5H15a4.5 4.5 0 0 1 0 9h-2"/>',
  redo: '<path d="m15 7 4.5 4.5L15 16m4.5-4.5H9a4.5 4.5 0 0 0 0 9h2"/>',
  fill: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor"/>',
  dashed: '<path d="M4 12h3M10.5 12h3M17 12h3"/>',
  sharp: '<path d="M5 18 19 6"/>',
  round: '<path d="M5 18C6 9 12 6 19 6"/>',
  elbow: '<path d="M5 18h7V6h7"/>',
};
// the tools Settings can put on the toolbar, in their order, and the usual ones. Select is always there, and their keys work either way
const TOOLS = [['freedraw', 'Pen (P)'], ['rectangle', 'Box (R)'], ['diamond', 'Diamond (D)'], ['ellipse', 'Circle (O)'], ['arrow', 'Arrow (A)'], ['line', 'Line (L)'], ['text', 'Text (T)'], ['eraser', 'Eraser (E)'], ['hand', 'Move around (H)']];
const USUAL_TOOLS = ['freedraw', 'rectangle', 'diamond', 'ellipse', 'arrow', 'text'];
// a color and the soft fill that goes with it (Excalidraw turns its colors over on a dark board, and so do these dots)
const COLORS = [['#1e1e1e', 'Ink', '#e9ecef'], ['#e03131', 'Red', '#ffc9c9'], ['#f08c00', 'Orange', '#ffec99'], ['#2f9e44', 'Green', '#b2f2bb'], ['#1971c2', 'Blue', '#a5d8ff']];
const TINT = Object.fromEntries(COLORS.map(([c, , t]) => [c, t]));
const WIDTHS = [1, 2, 4], SIZES = [[16, 'S', 'small'], [20, 'M', 'medium'], [28, 'L', 'large'], [36, 'XL', 'veryLarge']], ROUTES = [['sharp', 'Straight'], ['round', 'Curved'], ['elbow', 'Right angles']];
const SHAPES = new Set(['rectangle', 'diamond', 'ellipse']), LINES = new Set(['arrow', 'line']);
const NAMES = { strokeColor: 'currentItemStrokeColor', backgroundColor: 'currentItemBackgroundColor', strokeWidth: 'currentItemStrokeWidth', strokeStyle: 'currentItemStrokeStyle' };
const iconButton = (name, title, onclick) => { const b = el('button', { type: 'button', className: 'st-tool', title, 'aria-label': title, onclick }); b.innerHTML = path(ICON[name]); return b; };
// Excalidraw's own undo and redo answer to their keys
const pressZ = (shift) => document.dispatchEvent(new KeyboardEvent('keydown', { key: shift ? 'Z' : 'z', code: 'KeyZ', shiftKey: shift, ctrlKey: !/Mac/.test(navigator.platform), metaKey: /Mac/.test(navigator.platform), bubbles: true, cancelable: true }));
const fresh = () => ({ versionNonce: Math.floor(Math.random() * 2 ** 31), updated: Date.now() });
const after = (list, value) => list[(list.indexOf(value) + 1) % list.length];    // (the next one along, round and round)
// a style: for what you draw next, for what's selected, and for the words you're writing (a color goes for the words in a
// selected shape too, and for its fill if it has one)
function applyStyle(patch) {
  const app = api.getAppState(), picked = { ...app.selectedElementIds }, update = { appState: {}, captureUpdate: ex.CaptureUpdateAction?.IMMEDIATELY };
  if (app.editingTextElement) picked[app.editingTextElement.id] = true;
  for (const [k, v] of Object.entries(patch)) update.appState[NAMES[k]] = v;
  if (patch.strokeColor && app.currentItemBackgroundColor !== 'transparent') update.appState.currentItemBackgroundColor = TINT[patch.strokeColor];
  if (Object.keys(picked).length) {
    update.elements = api.getSceneElementsIncludingDeleted().map((e) => {
      if (!picked[e.id] && !(e.type === 'text' && picked[e.containerId])) return e;
      const next = { ...e }, shape = SHAPES.has(e.type), line = LINES.has(e.type);
      for (const [k, v] of Object.entries(patch)) {
        if (k === 'backgroundColor') { if (shape) { next.backgroundColor = v; next.fillStyle = 'solid'; } }
        else if (k === 'strokeWidth') { if (shape || line || e.type === 'freedraw') next.strokeWidth = v; }
        else if (k === 'strokeStyle') { if (shape || line) next.strokeStyle = v; }
        else if (e.type !== 'image') { next[k] = v; if (shape && e.backgroundColor !== 'transparent') next.backgroundColor = TINT[v]; }
      }
      return { ...next, version: e.version + 1, ...fresh() };
    });
  }
  api.updateScene(update);
  paintTools(api.getAppState());
}
// a size, a font or an arrow's route changes the shape of things, and Excalidraw's own buttons, out of sight, see to all that
// (in a narrow window they're only there while its phone menu is open, which stays out of sight like the rest)
async function theirs(id, state) {
  const find = () => document.querySelector(`[data-testid="${id}"]`);
  let b = find();
  const opened = !b && !api.getAppState().openMenu;
  if (opened) { api.updateScene({ appState: { openMenu: 'shape' } }); await new Promise((r) => setTimeout(r, 60)); b = find(); }
  if (b) b.click(); else api.updateScene({ appState: state });
  if (opened) setTimeout(() => api.updateScene({ appState: { openMenu: null } }), 60);
}
const doneWriting = () => document.querySelector('.excalidraw-wysiwyg')?.blur();
// (Excalidraw ignores a paste or a copy unless it has the focus, so it gets it whenever nothing else on the page wants it)
const toBoard = () => { if (!document.activeElement || document.activeElement === document.body) document.querySelector('.excalidraw')?.focus({ preventScroll: true }); };
let now = {}, chips = {}, dots = [];       // (what's selected or next: its style, for the buttons that go round)
function drawTools() {
  const wanted = Array.isArray(f.settings.boardTools) ? f.settings.boardTools : USUAL_TOOLS;
  const button = ([type, title]) => Object.assign(iconButton(type, title, () => { doneWriting(); api.setActiveTool({ type }); }), { name: type });
  const gap = () => el('span', { className: 'st-gap' }), mine = TOOLS.filter(([type]) => wanted.includes(type)).map(button);
  // (a keyboard has its own undo and redo: only a touch screen needs buttons for them)
  const touch = matchMedia('(pointer: coarse)').matches ? [gap(), iconButton('undo', 'Undo', () => { doneWriting(); pressZ(false); }), iconButton('redo', 'Redo', () => { doneWriting(); pressZ(true); })] : [];
  tools.replaceChildren(button(['selection', 'Select (V)']), ...(mine.length ? [gap(), ...mine] : []), ...touch);
}
// all of Excalidraw's own tools in place of these, when Settings says so
function showFull() {
  const on = !!f.settings.boardFull;
  document.documentElement.classList.toggle('st-full', on);
  tools.hidden = on;
  if (on) tray.hidden = true; else paintTools(api.getAppState());
}
function makeTools() {
  // the styles: five colors, and a button for each thing that can change, each going to the next choice when pressed
  const chip = (title, onclick) => el('button', { type: 'button', className: 'st-chip', title, 'aria-label': title, onclick });
  dots = COLORS.map(([c, title]) => { const b = el('button', { type: 'button', className: 'st-dot', title, 'aria-label': title, onclick: () => applyStyle({ strokeColor: c }) }); b.style.setProperty('--dot', c); b.value = c; return b; });
  chips = {
    fill: chip('Fill', () => applyStyle({ backgroundColor: now.fill === 'transparent' ? TINT[now.stroke] || COLORS[0][2] : 'transparent' })),
    width: chip('Line thickness', () => applyStyle({ strokeWidth: after(WIDTHS, now.width) })),
    dash: chip('Dashed line', () => applyStyle({ strokeStyle: now.dash === 'dashed' ? 'solid' : 'dashed' })),
    route: chip('Arrow shape', () => { const v = after(ROUTES.map((r) => r[0]), now.route); theirs(`${v}-arrow`, { currentItemArrowType: v }); }),
    size: chip('Text size', () => { const [v, , id] = SIZES[(SIZES.findIndex((x) => x[0] === now.size) + 1) % SIZES.length]; theirs(`fontSize-${id}`, { currentItemFontSize: v }); }),
    font: chip('Code font', () => { const v = now.font === CODE ? MAIN : CODE; theirs(`font-family-${v === CODE ? 'code' : 'normal'}`, { currentItemFontFamily: v }); }),
  };
  chips.fill.innerHTML = path(ICON.fill);
  chips.dash.innerHTML = path(ICON.dashed);
  tray.replaceChildren(...dots, el('span', { className: 'st-gap' }), ...Object.values(chips));
  // (a click on these leaves the keyboard with the board: a button holding on to it would go off again at the next Space)
  for (const box of [tools, tray]) box.addEventListener('mousedown', (e) => { e.preventDefault(); window.focus(); toBoard(); });
  drawTools();
  showFull();
}
// what Settings' buttons for the board ask for: they bring you here to do it
async function savePicture() {
  const made = await ex.exportToBlob({ elements: api.getSceneElements(), files: api.getFiles(), mimeType: 'image/png', appState: { exportBackground: true, viewBackgroundColor: '#ffffff', exportWithDarkMode: false } });
  const a = el('a', { href: URL.createObjectURL(made), download: 'station.png' });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
const ASKED = {
  fit: () => api.scrollToContent(api.getSceneElements(), { fitToContent: true, animate: true }),
  actual: () => api.updateScene({ appState: { zoom: { value: 1 } } }),
  picture: savePicture,
  // (erasing everything counts as an erase of each thing, so it can be undone, and reaches every browser)
  clear: () => api.updateScene({ elements: api.getSceneElementsIncludingDeleted().map((e) => (e.isDeleted ? e : { ...e, isDeleted: true, version: e.version + 1, ...fresh() })), captureUpdate: ex.CaptureUpdateAction?.IMMEDIATELY }),
};
function doWhatsAsked() {
  let asked = null;
  try { asked = sessionStorage.getItem('fluence.station.do'); sessionStorage.removeItem('fluence.station.do'); } catch {}
  ASKED[asked]?.();
}
// which tool is on, and which styles have anything to apply to
function paintTools(app) {
  if (tools.hidden) return;
  const tool = app.activeTool.type, ids = app.selectedElementIds || {}, writing = app.editingTextElement?.id;
  for (const b of tools.children) if (b.name) b.classList.toggle('on', tool === b.name);
  const picked = writing || (tool === 'selection' && Object.keys(ids).length) ? api.getSceneElements().filter((e) => (writing ? e.id === writing : ids[e.id])) : [];
  const kinds = new Set(picked.length ? picked.map((e) => e.type) : [tool]), any = (set) => [...kinds].some((k) => set.has(k));
  const shape = any(SHAPES), line = any(LINES), pen = kinds.has('freedraw'), arrow = kinds.has('arrow');
  const words = kinds.has('text') || picked.some((e) => e.boundElements?.some((b) => b.type === 'text'));
  now = { stroke: app.currentItemStrokeColor, fill: app.currentItemBackgroundColor, width: app.currentItemStrokeWidth, dash: app.currentItemStrokeStyle, route: app.currentItemArrowType, size: app.currentItemFontSize, font: app.currentItemFontFamily };
  // (what's selected shows its own style, when there's one thing selected)
  const one = picked.length === 1 ? picked[0] : null;
  if (one) {
    const inner = one.type === 'text' ? one : api.getSceneElements().find((e) => e.containerId === one.id);
    Object.assign(now, { stroke: one.strokeColor, fill: one.backgroundColor, width: one.strokeWidth, dash: one.strokeStyle, ...(inner ? { size: inner.fontSize, font: inner.fontFamily } : {}), ...(one.type === 'arrow' ? { route: one.elbowed ? 'elbow' : one.roundness ? 'round' : 'sharp' } : {}) });
  }
  const show = { fill: shape, width: shape || line || pen, dash: shape || line, route: arrow, size: words, font: words };
  for (const [name, b] of Object.entries(chips)) b.hidden = !show[name];
  for (const b of dots) b.classList.toggle('on', b.value === now.stroke);
  chips.fill.classList.toggle('on', now.fill !== 'transparent');
  chips.dash.classList.toggle('on', now.dash === 'dashed');
  chips.font.classList.toggle('on', now.font === CODE);
  chips.width.innerHTML = path(`<path d="M5 12h14" stroke-width="${{ 1: 1.2, 2: 2.4 }[now.width] || 4.4}"/>`);
  chips.route.innerHTML = path(ICON[now.route] || ICON.sharp);
  chips.route.title = `Arrow shape: ${(ROUTES.find((r) => r[0] === now.route) || ROUTES[0])[1].toLowerCase()}`;
  chips.size.textContent = (SIZES.find((x) => x[0] === now.size) || SIZES[1])[1];
  chips.font.textContent = now.font === CODE ? '</>' : 'Aa';
  tray.hidden = !(shape || line || pen || words);
}

// ---------- starting ----------
// (the site's keys come first: Excalidraw would take ⌃K and ⌃1 for its own K and 1, whichever tool those pick)
addEventListener('keydown', (e) => { if (f.siteKey?.(e)) e.stopImmediatePropagation(); }, true);
// (Settings can turn off the menu a right-click brings up on the board)
addEventListener('contextmenu', (e) => { if (f.settings.boardMenu === false && board.contains(e.target)) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
async function start() {
  say('Opening the board…', 'busy');
  const [lib, React, { createRoot }] = await Promise.all([import(LIBRARY_URL), import('react'), import('react-dom/client')]);
  ex = lib;
  let font = wantedFont();
  await useFont(font);
  const here = await get('scene').catch(() => null), s = connection();
  view = here?.view || {};
  // what's on GitHub, to start from along with what's here
  let there = null, remote = [], remoteLibrary = null, problem = '';
  if (s) {
    try {
      there = await listing(s);
      if (there.files.has(SCENE)) remote = (await blob(s, there.files.get(SCENE)))?.elements || [];
      if (there.files.has(LIBRARY)) remoteLibrary = (await blob(s, there.files.get(LIBRARY)))?.libraryItems || null;
    } catch (e) { problem = explain(e, s); }
  }
  // (each element's newer version: what's here may be ahead, if a page closed before it could save)
  const newest = new Map();
  for (const e of [...remote, ...(here?.elements || [])]) { const was = newest.get(e.id); if (!was || e.version > was.version || (e.version === was.version && e.versionNonce < was.versionNonce)) newest.set(e.id, e); }
  const elements = fit(ex.restoreElements([...newest.values()].sort((a, b) => (String(a.index) < String(b.index) ? -1 : String(a.index) > String(b.index) ? 1 : 0)), null));
  library = remoteLibrary || (await get('library').catch(() => null)) || [];
  const pictures = {};
  await store('readonly', (st) => st.getAllKeys()).then(async (keys) => { for (const k of keys) if (String(k).startsWith('file:')) { const file = await get(k); pictures[file.id] = file; } }).catch(() => {});
  lastHead = there?.head || '';
  let render = null;
  await new Promise((ready) => {
    const root = createRoot(board), h = React.createElement, { MainMenu } = ex;
    // (not Open or Reset, which would replace the board without its history of what was erased)
    const menu = h(MainMenu, null, h(MainMenu.DefaultItems.Export), h(MainMenu.DefaultItems.SaveAsImage), h(MainMenu.DefaultItems.SearchMenu), h(MainMenu.DefaultItems.Help));
    render = () => root.render(h(ex.Excalidraw, {
      excalidrawAPI: (a) => { if (!api) { api = a; ready(); } },
      initialData: { elements, files: pictures, libraryItems: library, appState: { ...view, zoom: view.zoom || { value: 1 }, ...CLEAN } },
      name: 'Station', theme: dark() ? 'dark' : 'light', onChange: changed, handleKeyboardGlobally: true,
      UIOptions: { canvasActions: { loadScene: false } },
      onLibraryChange: (items) => { library = items; put('library', items).catch(() => {}); if (JSON.stringify(items) !== JSON.stringify(remoteLibrary || [])) { remoteLibrary = items; libraryDirty = true; dirty = true; firstChange ||= Date.now(); schedule(); } },
    }, menu));
    render();
  });
  window.fluentioStation = { api, push, status: () => status.textContent };
  const scheme = () => { document.documentElement.classList.toggle('st-dark', dark()); selectionColor(); };
  scheme();
  makeTools();
  toBoard();
  addEventListener('focus', toBoard);
  setTimeout(doWhatsAsked, 150);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { scheme(); render(); });
  // Settings changed (in another tab, or just now), or a font arrived late
  addEventListener('fluentio:settings', async () => { scheme(); render(); drawTools(); showFull(); if (wantedFont() !== font) { font = wantedFont(); await useFont(font); refit(true); } });
  document.fonts.addEventListener('loadingdone', () => refit());
  seen = ex.getSceneVersion(api.getSceneElementsIncludingDeleted()) + Object.keys(api.getFiles()).length;
  if (s && there) { await bringFiles(s, there).catch(() => {}); }
  // anything that didn't reach GitHub last time, or that this copy has and GitHub doesn't, goes up now
  const behind = !!s && !problem && (here?.pending || elements.some((e) => { const r = remote.find((x) => x.id === e.id); return !r || r.version < e.version; }));
  if (problem) say(`Saved in this browser. ${problem}`, 'bad');
  else if (!s) say('Saved in this browser.', '', ['Connect GitHub', '../music/']);
  else if (behind) { dirty = true; firstChange = Date.now(); schedule(); } else say('Saved', 'done');
  // a page going keeps what it has, and tries to send it; if that doesn't finish, the next page sends it
  const leaving = () => { saveHere(); if (dirty && connection()) push(); };
  addEventListener('pagehide', leaving);
  addEventListener('fluence:gone', leaving);
  document.addEventListener('visibilitychange', () => { if (document.hidden) leaving(); else look(); });
  addEventListener('focus', look);
  setInterval(look, 60000);
}
start().catch((e) => {
  console.error(e);
  say('The board couldn’t open. It needs the internet to start.', 'bad');
  board.replaceChildren(el('div', { className: 'st-failed' }, el('p', {}, 'Your drawings are safe. The board itself comes from the web, and it didn’t load.'), el('button', { type: 'button', className: 'btn primary', onclick: () => location.reload() }, 'Try again')));
});
