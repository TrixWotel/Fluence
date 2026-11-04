// Geography Tests: find each country on the map, or each capital, for the whole world or one continent at a time.
// The map is Natural Earth's (countries.json: every country's shape, name and continent). d3 draws it.
// capitals.json is each country's capital and where it is: [name, longitude, latitude, and maybe a line to say after].
// A capitals test has the same map as a country test: it names a capital, and you click its country.
// Right on the first try is worth 1 point, on the second or third try half a point. After three
// wrong tries (or Skip) the answer blinks, and it's worth nothing.

const MAPS = [
  { id: 'world', name: 'World Map', icon: '🌍', box: [-180, -57, 180, 84] },
  { id: 'af', name: 'Africa', icon: '🌍', box: [-26, -36, 58, 38] },
  { id: 'as', name: 'Asia', icon: '🌏', box: [25, -11, 146, 56] },
  { id: 'eu', name: 'Europe', icon: '🌍', box: [-25, 33, 47, 71] },
  { id: 'na', name: 'North America', icon: '🌎', box: [-170, 7, -52, 72] },
  { id: 'sa', name: 'South America', icon: '🌎', box: [-82, -56, -34, 13] },
  { id: 'oc', name: 'Oceania', icon: '🌏', box: [112, -48, 200, 16] },
];
// every map twice: its countries (geography/#eu), and its capitals (geography/#capitals/eu)
const TESTS = [
  ...MAPS.map((m) => ({ id: m.id, name: m.name, icon: m.icon, map: m })),
  ...MAPS.map((m) => ({ id: 'capitals/' + m.id, name: m.id === 'world' ? 'World Capitals' : 'Capitals of ' + m.name, icon: m.icon, map: m, capitals: true })),
];
const W = 960, H = 600, PAD = 14, DOT = 30;        // (a country smaller than DOT square px on the map also gets a dot to click)
const $ = (id) => document.getElementById(id);
// a new screen: the old one fades as the new one rises, where the browser can (look.js says whether motion is on)
const moving = () => window.fluentio?.moving?.() ?? !matchMedia('(prefers-reduced-motion: reduce)').matches;
const swap = (draw) => (document.startViewTransition && moving() ? document.startViewTransition(draw).ready.catch(() => {}) : draw());
// plays a little animation again (the class "new"): on the name to find, a number that changes, the note
const replay = (el) => { el.classList.remove('new'); void el.offsetWidth; el.classList.add('new'); };
const count = (id, v) => { const el = $(id); if (el.textContent !== String(v)) { el.textContent = v; replay(el); } };

let features = [];                                  // every shape on the map
const countries = new Map();                        // id -> { id, name, c }
const capitals = new Map();                         // country id -> { name, also }
let test = null, order = [], at = 0, tries = 0, points = 0, firstTry = 0, late = 0, missed = [];
let startedAt = 0, tick = 0, busy = false, svg = null, zoom = null;

// ---------- the map's data ----------
async function load() {
  const [topo, caps] = await Promise.all([d3.json('countries.json'), d3.json('capitals.json')]);
  features = topojson.feature(topo, topo.objects.countries).features;
  for (const f of features) {
    const p = f.properties;
    if (p.n) countries.set(p.id, { id: p.id, name: p.n, c: p.c });
  }
  for (const [id, [name, , , also]] of Object.entries(caps)) capitals.set(id, { name, also });
}
const countriesOf = (t) => [...countries.values()].filter((x) => (t.map.id === 'world' || x.c === t.map.id) && (!t.capitals || capitals.has(x.id)));
const nameOf = (id) => (countries.get(id) || {}).name || id;
const capitalOf = (id) => (capitals.get(id) || {}).name || id;

// ---------- best scores ----------
function bests() { try { return JSON.parse(localStorage.getItem('fluentio.geo.best')) || {}; } catch { return {}; } }
function saveBest(id, pct, ms) {
  const all = bests(), was = all[id];
  if (was && (was.pct > pct || (was.pct === pct && was.ms <= ms))) return false;
  all[id] = { pct, ms };
  try { localStorage.setItem('fluentio.geo.best', JSON.stringify(all)); } catch { /* (private window) */ }
  return true;
}
const clock = (ms) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

// ---------- the tests ----------
function showPicker() {
  stop();
  $('quiz').hidden = true; $('result').hidden = true; $('picker').hidden = false;
  const all = bests();
  const card = (t) => {
    const b = document.createElement('button'), best = all[t.id];
    b.className = 'card' + (t.map.id === 'world' ? ' big' : '');
    b.innerHTML = `<b>${t.icon} ${t.name}</b><span class="count">${countriesOf(t).length} ${t.capitals ? 'capitals' : 'countries'}</span>`
      + `<span class="best${best ? ' has' : ''}">${best ? `Best: ${best.pct}% in ${clock(best.ms)}` : 'Not tried yet'}</span>`;
    b.onclick = () => { location.hash = t.id; };
    return b;
  };
  $('tests').replaceChildren(...TESTS.filter((t) => !t.capitals).map(card));
  $('capital-tests').replaceChildren(...TESTS.filter((t) => t.capitals).map(card));
}

// ---------- a test ----------
function boxShape([w, s, e, n]) {           // the area a test shows, as points along its edges
  const pts = [];
  for (let x = w; x <= e; x += 2) pts.push([x, s], [x, n]);
  for (let y = s; y <= n; y += 2) pts.push([w, y], [e, y]);
  return { type: 'MultiPoint', coordinates: pts };
}
function projectionFor(t) {
  const [w, s, e, n] = t.map.box;
  const p = t.map.id === 'world' ? d3.geoNaturalEarth1() : d3.geoAzimuthalEqualArea().rotate([-(w + e) / 2, -(s + n) / 2]);
  return p.fitExtent([[PAD, PAD], [W - PAD, H - PAD]], boxShape(t.map.box));
}

function drawMap(t) {
  const path = d3.geoPath(projectionFor(t));
  const playing = new Set(countriesOf(t).map((x) => x.id));
  const root = d3.create('svg').attr('viewBox', [0, 0, W, H]).attr('role', 'img').attr('aria-label', `Map of ${t.map.name}`);
  const g = root.append('g');
  g.append('path').attr('class', 'sphere').attr('d', path({ type: 'Sphere' }));
  g.selectAll('path.shape').data(features).join('path')
    .attr('class', (f) => (playing.has(f.properties.id) ? 'country' : 'land'))
    .attr('data-id', (f) => (playing.has(f.properties.id) ? f.properties.id : null))
    .attr('d', path);
  // tiny countries: a dot to click as well
  const dots = [];
  for (const id of playing) {
    const shapes = features.filter((f) => f.properties.id === id);
    if (d3.sum(shapes, (f) => path.area(f)) >= DOT) continue;
    const [x, y] = path.centroid(d3.greatest(shapes, (f) => path.area(f)));
    if (Number.isFinite(x) && Number.isFinite(y)) dots.push({ id, x, y });
  }
  g.selectAll('circle').data(dots).join('circle').attr('class', 'dot').attr('data-id', (d) => d.id)
    .attr('cx', (d) => d.x).attr('cy', (d) => d.y).attr('r', 6);

  zoom = d3.zoom().scaleExtent([1, 24]).translateExtent([[0, 0], [W, H]]).clickDistance(4)
    .on('zoom', (e) => { g.attr('transform', e.transform); g.selectAll('circle').attr('r', 6 / Math.sqrt(e.transform.k)); });
  root.call(zoom).on('dblclick.zoom', null);
  root.on('click', (e) => { const el = e.target.closest('[data-id]'); if (el) answer(el.dataset.id); });
  svg = root.node();
  $('map').replaceChildren(svg);
}

function start(t) {
  stop();
  test = t;
  order = d3.shuffle(countriesOf(t).map((x) => x.id));
  at = 0; tries = 0; points = 0; firstTry = 0; late = 0; missed = []; busy = false;
  $('picker').hidden = true; $('result').hidden = true; $('quiz').hidden = false; $('quitting').hidden = true;
  drawMap(t);
  $('total').textContent = order.length;
  $('ask').textContent = t.capitals ? 'Click the country whose capital is' : 'Click on';
  note(t.capitals ? `${t.name}: ${order.length} capitals. Click the country of the one named above.`
    : `${t.name}: ${order.length} countries. Click the one named above.`);
  ask();
  startedAt = Date.now();
  tick = setInterval(() => { $('time').textContent = clock(Date.now() - startedAt); }, 1000);
  $('time').textContent = '0:00';
}
function stop() { clearInterval(tick); tick = 0; }
function ask() {
  $('target').textContent = test.capitals ? capitalOf(order[at]) : nameOf(order[at]);
  replay($('target'));
  count('done', at);
  count('right', firstTry + late);
}
function note(text, kind = '') { const n = $('note'); n.textContent = text; n.className = 'note' + (kind ? ' ' + kind : ''); replay(n); }
const shapesOf = (id) => svg.querySelectorAll(`[data-id="${id}"]`);
function mark(id, cls) { for (const el of shapesOf(id)) el.classList.add(cls); }
function flash(id, cls, ms) {
  for (const el of shapesOf(id)) {
    el.classList.remove(cls); void el.getBoundingClientRect(); el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), ms);
  }
}

// what the notes say about a country: in a capitals test, its capital too
const fact = (id) => `${capitalOf(id)} is the capital of ${nameOf(id)}.` + (capitals.get(id)?.also ? ' ' + capitals.get(id).also : '');
const clicked = (id) => (test.capitals ? `That's ${nameOf(id)}, whose capital is ${capitalOf(id)}.` : `That's ${nameOf(id)}.`);
const blinking = (id) => (test.capitals ? `${capitalOf(id)} is in ${nameOf(id)}, the one blinking.` : `${nameOf(id)} is the one blinking.`);

function answer(id) {
  if (busy || at >= order.length) return;
  const want = order[at];
  if (id === want) {
    if (tries === 0) { points += 1; firstTry++; mark(id, 'found'); note(test.capitals ? `Right, ${fact(id)}` : `Right, that's ${nameOf(id)}.`, 'good'); }
    else { points += 0.5; late++; mark(id, 'late'); note(`Got it on try ${tries + 1}: ${test.capitals ? fact(id) : nameOf(id) + '.'}`, 'good'); }
    flash(id, 'got', 2000);                        // (it lights up as it turns green)
    next();
    return;
  }
  tries++;
  flash(id, 'wrong', 600);
  if (tries >= 3) reveal(want, `${clicked(id)} ${blinking(want)}`);
  else note(`${clicked(id)} Try again (${3 - tries} ${3 - tries === 1 ? 'try' : 'tries'} left).`, 'bad');
}
// the answer blinks, then the next country
function reveal(id, text) {
  busy = true;
  missed.push(id);
  note(text, 'bad');
  mark(id, 'missed');
  flash(id, 'reveal', 1500);
  setTimeout(() => { busy = false; next(); }, 1600);
}
function next() {
  at++; tries = 0;
  if (at >= order.length) swap(finish);
  else ask();
}

function finish() {
  stop();
  const ms = Date.now() - startedAt, pct = Math.round((100 * points) / order.length), best = saveBest(test.id, pct, ms);
  $('quiz').hidden = true; $('result').hidden = false;
  $('result-name').textContent = test.name;
  $('score').textContent = pct + '%';
  $('summary').textContent = `${firstTry} on the first try, ${late} after a wrong try, ${missed.length} shown to you. Time: ${clock(ms)}.`
    + (best ? ' A new best!' : '');
  const practice = test.capitals ? (id) => `${capitalOf(id)} (${nameOf(id)})` : nameOf;
  $('missed').innerHTML = missed.length ? '<b>To practice:</b> ' + missed.map(practice).sort().join(', ') : '';
}

// ---------- buttons, and links like geography/#eu or geography/#capitals/eu ----------
$('skip').onclick = () => { if (!busy && at < order.length) reveal(order[at], blinking(order[at])); };
// Quit asks on the page first, once something's been answered
$('quit').onclick = () => { if (at === 0) toPicker(); else $('quitting').hidden = false; };
$('quit-yes').onclick = () => toPicker();
$('quit-no').onclick = () => { $('quitting').hidden = true; };
$('again').onclick = () => swap(() => start(test));
$('others').onclick = () => toPicker();
$('zoom-in').onclick = () => d3.select(svg).transition().duration(250).call(zoom.scaleBy, 1.8);
$('zoom-out').onclick = () => d3.select(svg).transition().duration(250).call(zoom.scaleBy, 1 / 1.8);
$('zoom-reset').onclick = () => d3.select(svg).transition().duration(300).call(zoom.transform, d3.zoomIdentity);
function toPicker() { history.pushState('', '', location.pathname + location.search); swap(showPicker); }
function route() {
  const t = TESTS.find((x) => '#' + x.id === location.hash);
  if (t) start(t);
  else showPicker();
}
window.addEventListener('hashchange', () => swap(route));

load().then(route, () => {
  $('tests').innerHTML = '<p class="note bad">The map didn’t load. Check your connection, then reload the page.</p>';
});
