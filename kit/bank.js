// Fluence's question toolkit: every variant is built from its number, so "Variant 137" is always the same question.
// Nothing here touches the page, so the banks can be checked outside a browser too.

// a small seeded random generator (mulberry32), seeded from the bank's name and the variant number
function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedOf(text) { let h = 2166136261; for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

// the dice for one variant
export function dice(bank, n) {
  const r = mulberry(seedOf(bank + ':' + n));
  const int = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
  const pick = (list) => list[Math.floor(r() * list.length)];
  const shuffle = (list) => { const a = list.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  return { r, int, pick, shuffle, chance: (p) => r() < p };
}

// a bank: templates take turns (variant 1 uses the first, 2 the second…) so every kind of question gets its share.
// Each template also learns which of its own turns this is (k = 0, 1, 2…), for walking through combinations.
export function bank(id, templates, count) {
  return {
    id, count, kinds: templates.length,
    make(n) {
      const i = (n - 1) % templates.length;
      const q = templates[i](dice(id, n), { n, k: Math.floor((n - 1) / templates.length), salt: id + '-' + i });
      return { n, ...q };
    },
  };
}
// for templates with only a few sensible number choices: every combination of the lists (that passes ok), in a fixed
// shuffled order, so turn k gets combination k and no two variants repeat (until they run out)
const comboCache = new Map();
export function combo(ctx, lists, ok = () => true) {
  let all = comboCache.get(ctx.salt);
  if (!all) {
    all = [[]];
    for (const list of lists) all = all.flatMap((c) => list.map((v) => [...c, v]));
    all = dice(ctx.salt, 0).shuffle(all.filter((c) => ok(...c)));
    comboCache.set(ctx.salt, all);
  }
  return all[ctx.k % all.length];
}

// ---------- numbers ----------
// what someone typed → a number (takes 4.5, −2.5, 1,250, 3/4, 45°, 12 m/s, x = 7, and powers of ten like 3.2e-5,
// 3.2 × 10⁻⁵ or 3.2 x 10^-5)
const SUPS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
export function readNumber(text) {
  const clean = String(text ?? '').trim().replace(/[−–]/g, '-').replace(/^[a-zA-Zθ∠ ]*=\s*/, '').replace(/,(?=\d{3}\b)/g, '')
    .replace(/\s*[×xX*·]\s*10\s*(?:\^\s*\(?\s*([+-]?\d+)\s*\)?|([⁻⁺]?[⁰¹²³⁴⁵⁶⁷⁸⁹]+))/, (_, power, raised) =>
      'e' + (power ?? raised.replace('⁻', '-').replace('⁺', '').replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (c) => SUPS.indexOf(c))));
  const m = clean.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)(?:\s*\/\s*(\d+(?:\.\d+)?))?/);
  if (!m) return null;
  const v = parseFloat(m[1]) / (m[2] ? parseFloat(m[2]) : 1);
  return Number.isFinite(v) ? v : null;
}
export const round = (x, d = 2) => Math.round((x + Number.EPSILON) * 10 ** d) / 10 ** d;
// a number as people write it: no trailing zeros, thousands separated, a proper minus sign
export function num(x, d = 2) {
  const v = round(x, d);
  return (v < 0 ? '−' : '') + Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: d });
}
export const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
export const lcm = (a, b) => (a / gcd(a, b)) * b;
// a fraction p/q in lowest terms, as stacked HTML (whole numbers stay whole)
export function frac(p, q) {
  if (q < 0) { p = -p; q = -q; }
  const g = gcd(p, q) || 1; p /= g; q /= g;
  if (q === 1) return num(p, 0);
  return `${p < 0 ? '−' : ''}<span class="fr"><span>${Math.abs(p)}</span><span>${q}</span></span>`;
}
export const choose = (n, k) => { if (k < 0 || k > n) return 0; let c = 1; for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i; return Math.round(c); };

// ---------- graphs (for kinematics): an SVG with a grid, labelled axes, and lines, curves and marked points ----------
export function graph({ x: [x0, x1, xs], y: [y0, y1, ys], xLabel, yLabel, lines = [], curves = [], points = [], w = 520, h = 300 }) {
  const L = 56, R = 18, T = 16, B = 44, iw = w - L - R, ih = h - T - B;
  const X = (v) => L + ((v - x0) / (x1 - x0)) * iw, Y = (v) => T + ih - ((v - y0) / (y1 - y0)) * ih;
  const out = [`<svg class="graph" viewBox="0 0 ${w} ${h}" role="img" aria-label="${yLabel} against ${xLabel}">`];
  const ticks = (a, b, s) => { const t = []; for (let k = 0; a + k * s <= b + 1e-9; k++) t.push(round(a + k * s, 6)); return t; };
  // a number on every line, or on every other line when there are more than 11 (counting from 0, so 0 always has one)
  const label = (v, s, count) => count <= 11 || Math.round(v / s) % 2 === 0;
  const tx = ticks(x0, x1, xs), ty = ticks(y0, y1, ys);
  for (const v of tx) out.push(`<line class="gr" x1="${X(v)}" y1="${T}" x2="${X(v)}" y2="${T + ih}"/>` + (label(v, xs, tx.length) ? `<text class="tk" x="${X(v)}" y="${T + ih + 16}" text-anchor="middle">${num(v)}</text>` : ''));
  for (const v of ty) out.push(`<line class="gr" x1="${L}" y1="${Y(v)}" x2="${L + iw}" y2="${Y(v)}"/>` + (label(v, ys, ty.length) ? `<text class="tk" x="${L - 7}" y="${Y(v) + 4}" text-anchor="end">${num(v)}</text>` : ''));
  const zx = x0 <= 0 && x1 >= 0 ? X(0) : L, zy = y0 <= 0 && y1 >= 0 ? Y(0) : T + ih;
  out.push(`<line class="ax" x1="${L}" y1="${zy}" x2="${L + iw}" y2="${zy}"/><line class="ax" x1="${zx}" y1="${T}" x2="${zx}" y2="${T + ih}"/>`);
  out.push(`<text class="al" x="${L + iw / 2}" y="${h - 6}" text-anchor="middle">${xLabel}</text>`);
  out.push(`<text class="al" transform="translate(14 ${T + ih / 2}) rotate(-90)" text-anchor="middle">${yLabel}</text>`);
  // (pathLength 1 lets the page draw each line in, whatever its real length)
  lines.forEach((pts, i) => out.push(`<polyline class="ln ln${i}" pathLength="1" points="${pts.map(([a, b]) => `${round(X(a), 2)},${round(Y(b), 2)}`).join(' ')}"/>`));
  curves.forEach(({ f, from, to }, i) => {
    const pts = []; for (let k = 0; k <= 60; k++) { const t = from + ((to - from) * k) / 60; pts.push(`${round(X(t), 2)},${round(Y(f(t)), 2)}`); }
    out.push(`<polyline class="ln ln${i}" pathLength="1" points="${pts.join(' ')}"/>`);
  });
  // a point's label: its own text, or with true, its coordinates, but only when it sits between grid lines (hard to read)
  const between = (v, s) => Math.abs(v / s - Math.round(v / s)) > 1e-6;
  for (const [a, b, label] of points) {
    const text = label === true ? (between(a, xs) || between(b, ys) ? `(${num(a)}, ${num(b)})` : '') : label;
    out.push(`<circle class="pt" cx="${X(a)}" cy="${Y(b)}" r="4.5"/>` + (text ? `<text class="pl" x="${X(a) + 8}" y="${Y(b) - 8}">${text}</text>` : ''));
  }
  out.push('</svg>');
  return out.join('');
}
// a tidy axis range for values: from below the smallest to above the largest, on a nice step. The step puts as many of
// the values as it can exactly on grid lines (so a point at 5 isn't left halfway between 4 and 6), then stays near steps
// (with lots of lines, graph() numbers every other one)
export function span(values, steps = 6) {
  let lo = Math.min(0, ...values), hi = Math.max(0, ...values);
  if (hi === lo) hi = lo + 1;
  const raw = (hi - lo) / steps, mag = 10 ** Math.floor(Math.log10(raw));
  const nice = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20].map((m) => round(m * mag, 9));
  const hits = (s) => values.filter((v) => Math.abs(v / s - Math.round(v / s)) < 1e-6).length;
  const lines = (s) => Math.ceil(hi / s - 1e-9) - Math.floor(lo / s + 1e-9);
  const far = (s) => Math.abs(Math.log(s / raw)) + (String(s).includes('25') ? 0.3 : 0);   // how far from steps lines (steps of 2.5 count as a bit further)
  const step = nice.filter((s) => lines(s) <= 20 && lines(s) >= steps / 2)
    .sort((a, b) => hits(b) - hits(a) || far(a) - far(b))[0] ?? nice.find((s) => s >= raw);
  return [round(Math.floor(lo / step + 1e-9) * step, 9), round(Math.ceil(hi / step - 1e-9) * step, 9), step];
}

// ---------- triangles: drawn to scale from their angles, with labelled corners, arcs and extras ----------
// angles {A, B, C} in degrees; labels {A, B, C} shown inside each corner; ticks: equal sides ['AB','AC'];
// right: the corner with a right angle; ext: extend BC past C and label that outside angle; seg: {kind:'bisector'|'altitude', label}
export function triangle({ angles, labels = {}, ticks = [], right = null, ext = null, seg = null, w = 360, h = 250 }) {
  const rad = (d) => (d * Math.PI) / 180, { A, B, C } = angles;
  const base = 10, c = (base * Math.sin(rad(C))) / Math.sin(rad(A));          // law of sines (side AB opposite C)
  let P = { B: [0, 0], C: [base, 0], A: [c * Math.cos(rad(B)), c * Math.sin(rad(B))] };
  let extra = [];
  if (ext) extra.push([base * 1.38, 0]);
  const all = [...Object.values(P), ...extra], xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
  const pad = 34, sx = (w - 2 * pad) / (Math.max(...xs) - Math.min(...xs)), sy = (h - 2 * pad) / (Math.max(...ys) - Math.min(...ys) || 1), s = Math.min(sx, sy);
  const ox = (w - s * (Math.max(...xs) - Math.min(...xs))) / 2 - s * Math.min(...xs), oy = (h + s * (Math.max(...ys) - Math.min(...ys))) / 2 + s * Math.min(...ys);
  const T = ([x, y]) => [round(ox + s * x, 2), round(oy - s * y, 2)];
  const p = { A: T(P.A), B: T(P.B), C: T(P.C) };
  const out = [`<svg class="tri" viewBox="0 0 ${w} ${h}" role="img" aria-label="Triangle ABC">`];
  out.push(`<polygon class="side" points="${p.A} ${p.B} ${p.C}"/>`);
  const unit = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); return [dx / l, dy / l]; };
  // the corner arc and its label, between the directions to two other points
  const corner = (at, to1, to2, label, r = 26, cls = 'arc') => {
    const u = unit(at, to1), v = unit(at, to2);
    let a1 = Math.atan2(u[1], u[0]), a2 = Math.atan2(v[1], v[0]), d = a2 - a1;
    while (d <= -Math.PI) d += 2 * Math.PI; while (d > Math.PI) d -= 2 * Math.PI;
    const e = [at[0] + r * Math.cos(a1 + d), at[1] + r * Math.sin(a1 + d)], st = [at[0] + r * u[0], at[1] + r * u[1]];
    out.push(`<path class="${cls}" d="M${round(st[0], 2)} ${round(st[1], 2)} A${r} ${r} 0 0 ${d > 0 ? 1 : 0} ${round(e[0], 2)} ${round(e[1], 2)}"/>`);
    if (label) {
      const mid = a1 + d / 2, lr = r + 16 + Math.max(0, label.replace(/<[^>]+>/g, '').length - 3) * 3;
      out.push(`<text class="ang" x="${round(at[0] + lr * Math.cos(mid), 2)}" y="${round(at[1] + lr * Math.sin(mid) + 5, 2)}" text-anchor="middle">${label}</text>`);
    }
  };
  const square = (at, d1, d2, size = 11) => {
    const u = unit(at, d1), v = unit(at, d2);
    const q = (k, l) => `${round(at[0] + u[0] * k + v[0] * l, 2)} ${round(at[1] + u[1] * k + v[1] * l, 2)}`;
    out.push(`<path class="arc" d="M${q(size, 0)} L${q(size, size)} L${q(0, size)}"/>`);
  };
  for (const k of ['A', 'B', 'C']) {
    const others = ['A', 'B', 'C'].filter((x) => x !== k);
    if (right === k) square(p[k], p[others[0]], p[others[1]]);
    if (labels[k]) corner(p[k], p[others[0]], p[others[1]], right === k ? '' : labels[k]);
    if (right === k && labels[k]) { const m = unit(p[k], [(p[others[0]][0] + p[others[1]][0]) / 2, (p[others[0]][1] + p[others[1]][1]) / 2]); out.push(`<text class="ang" x="${round(p[k][0] + m[0] * 34, 2)}" y="${round(p[k][1] + m[1] * 34 + 5, 2)}" text-anchor="middle">${labels[k]}</text>`); }
  }
  for (const sd of ticks) { const a = p[sd[0]], b = p[sd[1]], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], u = unit(a, b); out.push(`<line class="tick" x1="${round(m[0] - u[1] * 7, 2)}" y1="${round(m[1] + u[0] * 7, 2)}" x2="${round(m[0] + u[1] * 7, 2)}" y2="${round(m[1] - u[0] * 7, 2)}"/>`); }
  if (ext) {
    const e = T(extra[0]);
    out.push(`<line class="side dash" x1="${p.C[0]}" y1="${p.C[1]}" x2="${e[0]}" y2="${e[1]}"/>`);
    corner(p.C, e, p.A, ext, 30, 'arc ext');
  }
  if (seg) {
    // D on BC: where the bisector of A, or the altitude from A, meets BC
    const t = seg.kind === 'altitude' ? (P.A[0] - P.B[0]) / base : (c / (c + (base * Math.sin(rad(B))) / Math.sin(rad(A)))) ;
    const D = T([base * t, 0]);
    out.push(`<line class="seg${seg.kind === 'altitude' ? ' dash' : ''}" x1="${p.A[0]}" y1="${p.A[1]}" x2="${D[0]}" y2="${D[1]}"/><text class="vx" x="${D[0]}" y="${D[1] + 20}" text-anchor="middle">D</text>`);
    if (seg.kind === 'altitude') square(D, p.C, p.A, 10);
    if (seg.at === 'D') corner(D, p.B, p.A, seg.label, 24);
    if (seg.at === 'A') corner(p.A, p.B, D, seg.label, 34);
  }
  const vlab = (k, dx, dy) => out.push(`<text class="vx" x="${round(p[k][0] + dx, 2)}" y="${round(p[k][1] + dy, 2)}" text-anchor="middle">${k}</text>`);
  vlab('A', 0, -10); vlab('B', -12, 16); vlab('C', 12, 16);
  out.push('</svg>');
  return out.join('');
}
