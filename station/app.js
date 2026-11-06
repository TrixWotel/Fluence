// Station: an endless whiteboard (Excalidraw), kept on the station branch of the repo you're connected to (Music's
// connection, or Data, Code and Notes'). Every change is saved in this browser straight away, then on GitHub a few
// seconds later, so a page that closes loses nothing: whatever didn't get there goes up the next time it opens.
// The board goes up as station.excalidraw (it opens on excalidraw.com too), with each picture as a file of its own, so
// a picture is only ever sent once, and the commits stay small. Before a save, and when you come back to the page, it
// looks at GitHub and puts the two copies together, element by element (the newer version of each wins, and what was
// erased stays erased), so another browser's drawing is never saved over.
// Excalidraw draws and keeps the board, but its interface stays hidden (station/index.html): what you see is one small
// toolbar of our own, with what flowcharts and diagrams need (a diamond, arrows that stay joined to shapes, words inside
// shapes, fills, dashes, a code font), a tray of styles when there's something to apply them to, and a More menu for the
// rest, which can also bring back all of Excalidraw's own tools.
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
const board = document.getElementById('board'), status = document.getElementById('status'), tools = document.getElementById('tools'), tray = document.getElementById('tray'), more = document.getElementById('more'), simple = document.getElementById('simple');
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
      const elements = merged(doc.elements);
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

// ---------- our own tools: Excalidraw's are hidden ----------
// (crisp lines, a clean font, and the site's own background behind the board)
const CLEAN = { viewBackgroundColor: 'transparent', currentItemRoughness: 0, currentItemFontFamily: 6, currentItemStrokeWidth: 2, currentItemRoundness: 'round', currentItemArrowType: 'sharp', currentItemFillStyle: 'solid', gridModeEnabled: false };
const path = (d) => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
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
  more: '<circle cx="5.5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18.5" cy="12" r="1.2"/>',
  solid: '<path d="M4 12h16"/>',
  dashed: '<path d="M4 12h3M10.5 12h3M17 12h3"/>',
  straight: '<path d="M5 18 19 6"/>',
  curved: '<path d="M5 18C6 9 12 6 19 6"/>',
  elbow: '<path d="M5 18h7V6h7"/>',
};
const TOOLS = [['selection', 'Select (V)'], ['hand', 'Move around (H)'], null, ['freedraw', 'Pen (P)'], ['rectangle', 'Box (R)'], ['diamond', 'Diamond (D)'], ['ellipse', 'Circle (O)'], ['arrow', 'Arrow (A)'], ['line', 'Line (L)'], ['text', 'Text (T)'], ['eraser', 'Eraser (E)']];
// (ink is white on a dark board: Excalidraw turns its colors over in dark mode, and so do these dots)
const COLORS = [['#1e1e1e', 'Ink'], ['#e03131', 'Red'], ['#f08c00', 'Orange'], ['#2f9e44', 'Green'], ['#1971c2', 'Blue'], ['#9c36b5', 'Purple']];
const FILLS = [['transparent', 'No fill'], ['#ffc9c9', 'Red fill'], ['#ffec99', 'Yellow fill'], ['#b2f2bb', 'Green fill'], ['#a5d8ff', 'Blue fill'], ['#eebefa', 'Purple fill']];
const WIDTHS = [[1, 'Thin'], [2, 'Medium'], [4, 'Thick']];
const TEXT_SIZES = [[16, 'Small', 'S', 'small'], [20, 'Medium', 'M', 'medium'], [28, 'Large', 'L', 'large'], [36, 'Extra large', 'XL', 'veryLarge']];
const FONTS = [[6, 'Clean font', 'Aa', 'normal'], [8, 'Code font', '</>', 'code']];
const ARROWS = [['sharp', 'Straight', 'straight'], ['round', 'Curved', 'curved'], ['elbow', 'Right angles', 'elbow']];
const DASHES = [['solid', 'Solid line', 'solid'], ['dashed', 'Dashed line', 'dashed']];
const SHAPES = new Set(['rectangle', 'diamond', 'ellipse']), LINES = new Set(['arrow', 'line']);
const iconButton = (name, title, onclick) => { const b = el('button', { type: 'button', className: 'st-tool', title, 'aria-label': title, onclick }); b.innerHTML = path(ICON[name]); return b; };
const NAMES = { strokeColor: 'currentItemStrokeColor', backgroundColor: 'currentItemBackgroundColor', strokeWidth: 'currentItemStrokeWidth', strokeStyle: 'currentItemStrokeStyle' };
// Excalidraw's own undo and redo answer to their keys
const pressZ = (shift) => document.dispatchEvent(new KeyboardEvent('keydown', { key: shift ? 'Z' : 'z', code: 'KeyZ', shiftKey: shift, ctrlKey: !/Mac/.test(navigator.platform), metaKey: /Mac/.test(navigator.platform), bubbles: true, cancelable: true }));
const fresh = () => ({ versionNonce: Math.floor(Math.random() * 2 ** 31), updated: Date.now() });
// a style: for what you draw next, for what's selected, and for the words you're writing (a color goes for the words in a selected shape too)
function applyStyle(patch) {
  const app = api.getAppState(), picked = { ...app.selectedElementIds }, update = { appState: {}, captureUpdate: ex.CaptureUpdateAction?.IMMEDIATELY };
  if (app.editingTextElement) picked[app.editingTextElement.id] = true;
  for (const [k, v] of Object.entries(patch)) update.appState[NAMES[k]] = v;
  if (Object.keys(picked).length) {
    update.elements = api.getSceneElementsIncludingDeleted().map((e) => {
      if (!picked[e.id] && !(e.type === 'text' && picked[e.containerId])) return e;
      const next = { ...e }, shape = SHAPES.has(e.type), line = LINES.has(e.type);
      for (const [k, v] of Object.entries(patch)) {
        if (k === 'backgroundColor') { if (shape) { next.backgroundColor = v; next.fillStyle = 'solid'; } }
        else if (k === 'strokeWidth') { if (shape || line || e.type === 'freedraw') next.strokeWidth = v; }
        else if (k === 'strokeStyle') { if (shape || line) next.strokeStyle = v; }
        else if (e.type !== 'image') next[k] = v;
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
const dot = (cls, color, title, patch) => { const b = el('button', { type: 'button', className: cls, title, 'aria-label': title, onclick: () => applyStyle(patch) }); b.style.setProperty('--dot', color); return b; };
const FULL = 'fluentio.station.full';
function makeTools() {
  tools.replaceChildren(...TOOLS.map((t) => (t ? Object.assign(iconButton(t[0], t[1], () => { closeMore(); doneWriting(); api.setActiveTool({ type: t[0] }); }), { name: t[0] }) : el('span', { className: 'st-gap' }))),
    el('span', { className: 'st-gap' }), iconButton('undo', 'Undo', () => { doneWriting(); pressZ(false); }), iconButton('redo', 'Redo', () => { doneWriting(); pressZ(true); }),
    Object.assign(iconButton('more', 'More', () => { doneWriting(); more.hidden = !more.hidden; }), { id: 'more-button' }));
  const group = (name, ...kids) => el('div', { className: `st-group st-${name}` }, ...kids);
  const pill = (title, value, inner, onclick) => { const b = el('button', { type: 'button', className: 'st-pill', title, 'aria-label': title, onclick }); if (ICON[inner]) b.innerHTML = path(ICON[inner]); else b.textContent = inner; b.value = value; return b; };
  tray.replaceChildren(
    group('stroke', ...COLORS.map(([c, title]) => Object.assign(dot('st-dot', c, title, { strokeColor: c }), { value: c }))),
    group('fill', ...FILLS.map(([c, title]) => Object.assign(dot(`st-dot st-fill${c === 'transparent' ? ' none' : ''}`, c === 'transparent' ? 'transparent' : c, title, { backgroundColor: c }), { value: c }))),
    group('width', ...WIDTHS.map(([w, title]) => { const b = el('button', { type: 'button', className: 'st-size', title, 'aria-label': title, onclick: () => applyStyle({ strokeWidth: w }) }, el('i', { style: `height:${w + 1}px` })); b.value = w; return b; })),
    group('dash', ...DASHES.map(([v, title, icon]) => pill(title, v, icon, () => applyStyle({ strokeStyle: v })))),
    group('arrows', ...ARROWS.map(([v, title, icon]) => pill(title, v, icon, () => theirs(`${v}-arrow`, { currentItemArrowType: v })))),
    group('tsize', ...TEXT_SIZES.map(([v, title, word, id]) => pill(title, v, word, () => theirs(`fontSize-${id}`, { currentItemFontSize: v })))),
    group('font', ...FONTS.map(([v, title, word, id]) => pill(title, v, word, () => theirs(`font-family-${id}`, { currentItemFontFamily: v })))),
    el('div', { className: 'st-hint', id: 'hint' }));
  const picture = el('button', { type: 'button', onclick: () => { closeMore(); api.setActiveTool({ type: 'image' }); } }, 'Add a picture');
  const fit = el('button', { type: 'button', onclick: () => { closeMore(); api.scrollToContent(api.getSceneElements(), { fitToContent: true, animate: true }); } }, 'Show all my drawings');
  const actual = el('button', { type: 'button', onclick: () => { closeMore(); api.updateScene({ appState: { zoom: { value: 1 } } }); } }, 'Zoom to 100%');
  const image = el('button', { type: 'button', onclick: async () => {
    closeMore();
    const made = await ex.exportToBlob({ elements: api.getSceneElements(), files: api.getFiles(), mimeType: 'image/png', appState: { exportBackground: true, viewBackgroundColor: '#ffffff', exportWithDarkMode: false } });
    const a = el('a', { href: URL.createObjectURL(made), download: 'station.png' });
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  } }, 'Save as a picture');
  // all of Excalidraw's own tools, for something these don't do; it stays that way until you come back
  const showFull = (on) => {
    document.documentElement.classList.toggle('st-full', on);
    tools.hidden = on; tray.hidden = true; simple.hidden = !on; closeMore();
    f.write(FULL, on ? true : null);
    if (!on) paintTools(api.getAppState());
  };
  const full = el('button', { type: 'button', onclick: () => showFull(true) }, 'Show all of Excalidraw’s tools');
  simple.onclick = () => showFull(false);
  // erasing everything counts as an erase of each thing, so it can be undone, and reaches every browser
  const clear = el('button', { type: 'button', className: 'st-danger', onclick: () => {
    if (clear.dataset.sure !== 'yes') { clear.dataset.sure = 'yes'; clear.textContent = 'Really clear the whole board?'; return; }
    clear.dataset.sure = ''; clear.textContent = 'Clear the board';
    closeMore();
    api.updateScene({ elements: api.getSceneElementsIncludingDeleted().map((e) => (e.isDeleted ? e : { ...e, isDeleted: true, version: e.version + 1, ...fresh() })), captureUpdate: ex.CaptureUpdateAction?.IMMEDIATELY });
  } }, 'Clear the board');
  more.replaceChildren(picture, fit, actual, image, full, clear);
  addEventListener('pointerdown', (e) => { if (!more.hidden && !more.contains(e.target) && !e.target.closest?.('#more-button')) closeMore(); }, true);
  // (a click on these leaves the keyboard with the board: a button holding on to it would go off again at the next Space)
  for (const box of [tools, tray, more, simple]) box.addEventListener('mousedown', (e) => { e.preventDefault(); window.focus(); });
  tools.hidden = false;
  if (f.read(FULL)) showFull(true); else paintTools(api.getAppState());
  function closeMore() { more.hidden = true; clear.dataset.sure = ''; clear.textContent = 'Clear the board'; }
}
// which tool is on, and which styles have anything to apply to, with a word on what can be done next
const HINTS = 'fluentio.station.hints', HINT_TIMES = 8;
let hinted = '';
function paintTools(app) {
  if (tools.hidden) return;
  const tool = app.activeTool.type, ids = app.selectedElementIds || {}, writing = app.editingTextElement?.id;
  for (const b of tools.children) if (b.name) b.classList.toggle('on', tool === b.name);
  const picked = writing || (tool === 'selection' && Object.keys(ids).length) ? api.getSceneElements().filter((e) => (writing ? e.id === writing : ids[e.id])) : [];
  const kinds = new Set(picked.length ? picked.map((e) => e.type) : [tool]), any = (set) => [...kinds].some((k) => set.has(k));
  const shape = any(SHAPES), line = any(LINES), pen = kinds.has('freedraw'), arrow = kinds.has('arrow');
  const words = kinds.has('text') || picked.some((e) => e.boundElements?.some((b) => b.type === 'text'));
  const show = { stroke: shape || line || words || pen, fill: shape, width: shape || line || pen, dash: shape || line, arrows: arrow, tsize: words, font: words };
  const on = { stroke: app.currentItemStrokeColor, fill: app.currentItemBackgroundColor, width: app.currentItemStrokeWidth, dash: app.currentItemStrokeStyle, arrows: app.currentItemArrowType, tsize: app.currentItemFontSize, font: app.currentItemFontFamily };
  // (what's selected shows its own style, when there's one thing selected)
  const one = picked.length === 1 ? picked[0] : null;
  if (one) {
    const inner = one.type === 'text' ? one : api.getSceneElements().find((e) => e.containerId === one.id);
    Object.assign(on, { stroke: one.strokeColor, fill: one.backgroundColor, width: one.strokeWidth, dash: one.strokeStyle, ...(inner ? { tsize: inner.fontSize, font: inner.fontFamily } : {}), ...(one.type === 'arrow' ? { arrows: one.elbowed ? 'elbow' : one.roundness ? 'round' : 'sharp' } : {}) });
  }
  for (const g of tray.querySelectorAll('.st-group')) {
    const name = [...g.classList].find((c) => c.startsWith('st-') && c !== 'st-group').slice(3);
    g.hidden = !show[name];
    for (const b of g.children) b.classList.toggle('on', String(b.value) === String(on[name]));
  }
  // (the first few times: after that you know)
  const word = tool === 'arrow' ? 'Drag from one shape to another, and the arrow stays joined to them.'
    : one && SHAPES.has(one.type) && !writing ? (matchMedia('(pointer: coarse)').matches ? 'Double-tap it to write inside.' : `Double-click it to write inside, or ${/Mac/.test(navigator.platform) ? '⌘' : 'Ctrl'} + an arrow key to add the next step.`) : '';
  const hint = document.getElementById('hint'), times = +f.read(HINTS) || 0;
  if (word && word !== hinted && times < HINT_TIMES) f.write(HINTS, times + 1);
  hinted = word;
  hint.textContent = times <= HINT_TIMES ? word : '';
  hint.hidden = !hint.textContent;
  tray.hidden = !Object.values(show).some(Boolean);
}

// ---------- starting ----------
// (the site's keys come first: Excalidraw would take ⌃K and ⌃1 for its own K and 1, whichever tool those pick)
addEventListener('keydown', (e) => { if (f.siteKey?.(e)) e.stopImmediatePropagation(); }, true);
async function start() {
  say('Opening the board…', 'busy');
  const [lib, React, { createRoot }] = await Promise.all([import(LIBRARY_URL), import('react'), import('react-dom/client')]);
  ex = lib;
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
  const elements = ex.restoreElements([...newest.values()].sort((a, b) => (String(a.index) < String(b.index) ? -1 : String(a.index) > String(b.index) ? 1 : 0)), null);
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
  const scheme = () => document.documentElement.classList.toggle('st-dark', dark());
  scheme();
  addEventListener('fluentio:settings', scheme);
  makeTools();
  addEventListener('fluentio:settings', () => render());
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
