// AMC 12 practice: trigonometry, conic sections and solids, the topics an AMC 10 student hasn’t met yet. Eight topics
// built on contest ideas with new numbers, settings and questions, ranked 9 to 25 by where they would sit in a real
// AMC 12. Each topic asks its idea several different ways, and every check() works the answer out again another way:
// scanning an interval for the solutions of an equation, bisection for an angle that has to be slid into place, a
// numeric search for a largest value, or a solid’s volume and distances from its coordinates.
import { combo, num, frac, gcd } from '../kit/bank.js';
import { labelled, surd, fracSurd } from './amc-kit.js';

// ---------- fractions [p, q] ----------
const lowest = (p, q) => { if (q < 0) { p = -p; q = -q; } const g = gcd(p, q) || 1; return [p / g + 0, q / g]; };
const F = (p, q = 1) => lowest(p, q);
const fa = (x, y) => F(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
const fs = (x, y) => F(x[0] * y[1] - y[0] * x[1], x[1] * y[1]);
const fm = (x, y) => F(x[0] * y[0], x[1] * y[1]);
const fd = (x, y) => F(x[0] * y[1], x[1] * y[0]);
const fv = (x) => x[0] / x[1];
const fr = (x) => frac(x[0], x[1]);
const fq = (x) => [fv(x), fr(x)];                  // a fraction as [value, how it reads]
const fl = (p, q = 1) => fq(F(p, q));
const sqF = (x) => fm(x, x);
const ONE = [1, 1];
const isSquare = (n) => n >= 0 && Math.round(Math.sqrt(n)) ** 2 === n;
// √(p/q), simplified, as [value, how it reads]
const rootF = ([p, q]) => fracSurd(1, q, p * q);
// (a + b√r)/den, with √r simplified and the fraction in lowest terms, as [value, how it reads]
function mix(a, b, r, den = 1) {
  let k = 1, inside = r;
  for (let f = 2; f * f <= inside; f++) while (inside % (f * f) === 0) { inside /= f * f; k *= f; }
  b *= k;
  if (inside === 1 || b === 0) return fl(a + b * Math.sqrt(inside), den);
  if (den < 0) { a = -a; b = -b; den = -den; }
  const g = gcd(gcd(a, b), den) || 1; a /= g; b /= g; den /= g;
  const rt = (c) => `${Math.abs(c) === 1 ? '' : num(Math.abs(c), 0)}√${inside}`;
  const top = a === 0 ? `${b < 0 ? '−' : ''}${rt(b)}` : b > 0 ? (a > 0 ? `${num(a, 0)} + ${rt(b)}` : `${rt(b)} − ${num(-a, 0)}`) : a > 0 ? `${num(a, 0)} − ${rt(b)}` : `−${num(-a, 0)} − ${rt(b)}`;
  return [(a + b * Math.sqrt(inside)) / den, den === 1 ? top : over(top, den)];
}

// ---------- how things read ----------
const over = (a, b) => `<span class="fr"><span>${a}</span><span>${b}</span></span>`;
const pw = (f, n, x = 'x') => `${f}<sup>${n}</sup> ${x}`;
const sq = (t) => `${t}<sup>2</sup>`;
const par = (x) => (x[0] < 0 ? `(${fr(x)})` : fr(x));        // a fraction to multiply by, a negative one in brackets
const by = (n) => (n < 0 ? `(${num(n, 4)})` : num(n, 4));    // a number to multiply by, a negative one in brackets
const neg = ([v, t]) => [-v, t.startsWith('−') ? t.slice(1) : `−${t}`];
const pos = (list) => list.filter((w) => w[0] > 1e-9);
const unit = (list) => list.filter((w) => Math.abs(w[0]) <= 1);   // for a sine or cosine: a slip above 1 would give itself away
const listing = (L) => (L.length < 2 ? L.join('') : `${L.slice(0, -1).join(', ')} and ${L.at(-1)}`);
const pick = (ctx, tag, lists, ok) => combo({ ...ctx, salt: `${ctx.salt}|${tag}` }, lists, ok);

// ---------- five choices ----------
const bare = (t) => String(t).replace(/<[^>]+>/g, '');
// four of the slips, none reading like another once the fraction's markup is gone, picked so that the right answer can
// land anywhere from (A) to (E). Values may be negative, so a question about a length filters its slips with pos().
// `fill` is near misses, used only when the slips on one side of the answer run out.
function five(d, ans, wrongs, fill = []) {
  const seen = [bare(ans[1])], vals = [ans[0]], sort = (list) => {
    const small = [], big = [];
    for (const w of list) {
      const t = bare(w[1]);
      // (a slip that reads much longer than the answer would give itself away)
      if (!Number.isFinite(w[0]) || seen.includes(t) || vals.some((v) => Math.abs(v - w[0]) < 1e-9) || t.length > Math.max(11, bare(ans[1]).length + 4)) continue;
      seen.push(t); vals.push(w[0]); (w[0] < ans[0] ? small : big).push(w);
    }
    return [d.shuffle(small), d.shuffle(big)];
  };
  const [s1, b1] = sort(wrongs), [s2, b2] = sort(fill), small = [...s1, ...s2], big = [...b1, ...b2];
  const lo = Math.max(0, 4 - big.length), hi = Math.min(4, small.length);
  if (lo > hi) throw new Error(`five: only ${small.length + big.length} different wrong answers for ${bare(ans[1])}`);
  const at = d.int(lo, hi);
  return labelled(ans, [...small.slice(0, at), ...big.slice(0, 4 - at)]);
}

// ---------- working things out a second way ----------
const close = (got, want, tol = 1e-7) => Math.abs(got - want) <= tol * Math.max(1, Math.abs(want));
const rad = (deg) => (deg * Math.PI) / 180;
// bisection: where f changes sign between lo and hi
function root(f, lo, hi) {
  const below = f(lo) > 0;
  for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if ((f(m) > 0) === below) lo = m; else hi = m; }
  return (lo + hi) / 2;
}
// the lowest point of f near where it dips between lo and hi (golden section)
function dip(f, lo, hi) {
  const g = (Math.sqrt(5) - 1) / 2;
  let a = hi - g * (hi - lo), b = lo + g * (hi - lo), fa0 = f(a), fb0 = f(b);
  for (let i = 0; i < 90; i++) {
    if (fa0 < fb0) { hi = b; b = a; fb0 = fa0; a = hi - g * (hi - lo); fa0 = f(a); } else { lo = a; a = b; fa0 = fb0; b = lo + g * (hi - lo); fb0 = f(b); }
  }
  return (lo + hi) / 2;
}
// every solution of f(x) = 0 on [a, b]: a fine scan for crossings (bisection), and for dips that touch zero without
// crossing it (a double root has no sign change to find)
function zeros(f, a, b, steps = 20000) {
  const out = [], h = (b - a) / steps, xs = [], vs = [];
  const add = (x) => { if (!out.some((y) => Math.abs(y - x) < 1e-6)) out.push(x); };
  for (let i = 0; i <= steps; i++) { const x = a + i * h; xs.push(x); vs.push(f(x)); }
  for (let i = 0; i <= steps; i++) {
    if (Math.abs(vs[i]) < 1e-12) add(xs[i]);
    if (i < steps && vs[i] * vs[i + 1] < 0) add(root(f, xs[i], xs[i + 1]));
    if (i > 0 && i < steps && Math.abs(vs[i]) <= Math.abs(vs[i - 1]) && Math.abs(vs[i]) <= Math.abs(vs[i + 1])) {
      const x = dip((t) => Math.abs(f(t)), xs[i - 1], xs[i + 1]);
      if (Math.abs(f(x)) < 1e-9) add(x);
    }
  }
  return out.sort((p, q) => p - q);
}
// the largest value of f on [a, b]: a scan, then a closer look around the best point
function top(f, a, b, steps = 4000) {
  let best = a, bv = -Infinity;
  for (let i = 0; i <= steps; i++) { const x = a + ((b - a) * i) / steps, v = f(x); if (v > bv) { bv = v; best = x; } }
  const h = (b - a) / steps, x = dip((t) => -f(t), Math.max(a, best - h), Math.min(b, best + h));
  return Math.max(bv, f(x));
}
// in the plane and in space
const dist = (p, q) => Math.hypot(...p.map((v, i) => v - q[i]));
const shoelace = (P) => Math.abs(P.reduce((s, p, i) => { const q = P[(i + 1) % P.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const volume4 = (a, b, c, e) => Math.abs(dot3(sub3(b, a), cross3(sub3(c, a), sub3(e, a)))) / 6;
// triangle with BC = a along the x-axis from B = (0, 0), CA = b and AB = c
function corners(a, b, c) {
  const x = (a * a + c * c - b * b) / (2 * a);
  return { A: [x, Math.sqrt(c * c - x * x)], B: [0, 0], C: [a, 0] };
}
// the angle at V in triangle PVQ, in radians
const angle = (V, P, Q) => { const u = P.map((v, i) => v - V[i]), w = Q.map((v, i) => v - V[i]), dt = u.reduce((s, v, i) => s + v * w[i], 0); return Math.acos(Math.max(-1, Math.min(1, dt / (Math.hypot(...u) * Math.hypot(...w))))); };

// ======================================================================================================================
// Exact trig values and identities
// ======================================================================================================================
const EXACT = 'Exact trig values and identities';
const S2 = pw('sin', 2), C2 = pw('cos', 2), S4 = pw('sin', 4), C4 = pw('cos', 4);

// sin x + cos x is given: squaring it gives sin x cos x, and everything symmetric follows from those two
const SUMS = [[1, 3], [2, 3], [1, 4], [3, 4], [3, 5], [4, 5], [5, 4], [4, 3], [6, 5], [7, 6], [8, 7], [9, 7], [11, 8], [13, 10]];
const sumSquared = (d, ctx) => {
  const [s, ask] = pick(ctx, 'sum', [SUMS, ['cubes', 'fourth', 'tancot', 'diff']], (v, a) => (a !== 'diff' || fv(v) < 1) && (a === 'tancot' || a === 'diff' || (a === 'cubes' ? v[1] <= 4 : v[1] <= 3)));
  const S = fr(s), s2 = sqF(s), u = fm(fs(s2, ONE), F(1, 2)), one = fs(ONE, u), u2 = sqF(u), rest = fs(ONE, fm(F(2), u));
  const ans = { cubes: fq(fm(s, one)), fourth: fq(fs(ONE, fm(F(2), u2))), tancot: fq(fd(ONE, u)), diff: rootF(rest) }[ask];
  const what = { cubes: `${pw('sin', 3)} + ${pw('cos', 3)}`, fourth: `${S4} + ${C4}`, tancot: 'tan x + cot x', diff: 'sin x − cos x' }[ask];
  const twice = fs(s2, ONE);
  const wrongs = {
    cubes: [fm(s, fm(s, s)), fm(s, fa(ONE, u)), fm(s, fs(ONE, twice)), fs(ONE, fm(F(3), u)), fs(s, u), fm(s, u)].map(fq),
    fourth: [fs(ONE, u2), rest, fs(ONE, fm(F(4), u2)), sqF(s2), fs(ONE, fm(F(2), sqF(twice))), fa(ONE, fm(F(2), u2))].map(fq),
    tancot: [u, fd(ONE, twice), fm(F(2), fd(ONE, u)), fd(s, u), twice, fd(ONE, s2)].map(fq),
    diff: [fq(fs(ONE, s)), fq(fs(F(2), s2)), rootF(fs(ONE, s2)), [ans[0] / 2, fracSurd(1, 2 * s[1], 2 * s[1] ** 2 - s[0] ** 2)[1]], neg(ans), fq(rest)],
  }[ask];
  const start = `Square the given equation: ${S2} + 2 sin x cos x + ${C2} = ${fr(s2)}. Since ${S2} + ${C2} = 1, this says 1 + 2 sin x cos x = ${fr(s2)}, so sin x cos x = ${fr(u)}. `;
  return {
    topic: EXACT, rank: { cubes: 11, fourth: 12, tancot: 10, diff: 12 }[ask],
    text: `An angle x satisfies 0° &lt; x &lt; 180° and sin x + cos x = ${S}. What is ${what}?`,
    answer: five(d, ans, wrongs),
    solution: start + {
      cubes: `Now factor the sum of cubes: ${what} = (sin x + cos x)(${S2} − sin x cos x + ${C2}) = ${S}·(1 − ${par(u)}) = ${S}·${fr(one)} = <b>${ans[1]}</b>.`,
      fourth: `Now square ${S2} + ${C2} = 1 to get ${S4} + 2(sin x cos x)<sup>2</sup> + ${C4} = 1. So ${what} = 1 − 2·${fr(u2)} = <b>${ans[1]}</b>.`,
      tancot: `Now put the two fractions together: tan x + cot x = ${over('sin x', 'cos x')} + ${over('cos x', 'sin x')} = ${over(`${S2} + ${C2}`, 'sin x cos x')} = ${over(1, 'sin x cos x')} = <b>${ans[1]}</b>.`,
      diff: `Then (sin x − cos x)<sup>2</sup> = 1 − 2 sin x cos x = 1 − 2·${par(u)} = ${fr(rest)}. Since sin x cos x is negative and sin x is positive (x is between 0° and 180°), cos x is negative, so sin x − cos x is positive. It is the positive square root of ${fr(rest)}, which is <b>${ans[1]}</b>.`,
    }[ask],
    check: () => {
      const x = fv(s) > 1 ? root((t) => Math.sin(t) + Math.cos(t) - fv(s), 0, Math.PI / 4) : root((t) => Math.sin(t) + Math.cos(t) - fv(s), Math.PI / 2, (3 * Math.PI) / 4);
      const [a, b] = [Math.sin(x), Math.cos(x)];
      return close({ cubes: a ** 3 + b ** 3, fourth: a ** 4 + b ** 4, tancot: a / b + b / a, diff: a - b }[ask], ans[0]);
    },
  };
};

// angles adding up to 45°: the tangent addition formula, once for each angle, then once more for 45° minus the sum
const ARCS = [];
for (let a = 2; a <= 9; a++) for (let b = a + 1; b <= 12; b++) {
  if (Math.atan(1 / a) + Math.atan(1 / b) < Math.PI / 4 - 0.02) ARCS.push([a, b]);
  for (let c = b + 1; c <= 13; c++) if (Math.atan(1 / a) + Math.atan(1 / b) + Math.atan(1 / c) < Math.PI / 4 - 0.02 && !(a === 3 && b === 4 && c === 5)) ARCS.push([a, b, c]);
}
const tanSum = (x, y) => fd(fa(x, y), fs(ONE, fm(x, y)));
const tan45Minus = (x) => fd(fs(ONE, x), fa(ONE, x));
const arcSum = (L) => L.slice(1).reduce((t, n) => tanSum(t, F(1, n)), F(1, L[0]));
const addTo45 = (d, ctx) => {
  const [L] = pick(ctx, 'arcs', [ARCS], (l) => tan45Minus(arcSum(l))[1] <= 400);
  const names = ['A', 'B', 'C'].slice(0, L.length), T1 = tanSum(F(1, L[0]), F(1, L[1])), T = arcSum(L), ans = tan45Minus(T);
  const plain = L.reduce((s, n) => fa(s, F(1, n)), F(0)), total = L.reduce((s, n) => s + n, 0);
  const given = listing(names.map((n, i) => `tan ${n} = ${frac(1, L[i])}`));
  const wrongs = [T, fs(ONE, T), fd(fa(ONE, T), fs(ONE, T)), fs(ONE, plain), fd(fs(ONE, plain), fa(ONE, plain)), F(1, total), fm(F(1, 2), fs(ONE, T)), F(1, L.reduce((m, n) => m * n, 1))];
  return {
    topic: EXACT, rank: L.length === 2 ? 11 : 13,
    text: `Acute angles ${listing([...names, 'D'])} satisfy ${[...names, 'D'].join(' + ')} = 45°, and ${given}. What is tan D?`,
    answer: five(d, fq(ans), wrongs.map(fq)),
    solution: `Use tan(P + Q) = (tan P + tan Q) ÷ (1 − tan P tan Q), one angle at a time. First tan(A + B) = (${frac(1, L[0])} + ${frac(1, L[1])}) ÷ (1 − ${frac(1, L[0])}·${frac(1, L[1])}) = ${fr(T1)}. `
      + (L.length === 3 ? `Then tan(A + B + C) = (${fr(T1)} + ${frac(1, L[2])}) ÷ (1 − ${fr(T1)}·${frac(1, L[2])}) = ${fr(T)}. ` : '')
      + `Since D = 45° − (${names.join(' + ')}) and tan 45° = 1, tan D = (1 − ${fr(T)}) ÷ (1 + ${fr(T)}) = <b>${fr(ans)}</b>.`,
    check: () => close(Math.tan(Math.PI / 4 - L.reduce((s, n) => s + Math.atan(1 / n), 0)), fv(ans)),
  };
};

// sin⁴x + cos⁴x is given: it fixes sin²x cos²x, and so every other even power and the multiple angles
const FOURTHS = [[5, 8], [7, 8], [3, 4], [2, 3], [5, 6], [3, 5], [4, 5], [7, 9], [5, 9], [9, 10], [7, 10], [11, 12], [7, 12]];
const fourthPowers = (d, ctx) => {
  const [v, ask] = pick(ctx, 'fourth', [FOURTHS, ['six', 'cos4', 'eight']]);
  const V = fr(v), uu = fm(fs(ONE, v), F(1, 2)), s2x = fm(F(4), uu);
  const ans = { six: fs(v, uu), cos4: fs(ONE, fm(F(2), s2x)), eight: fs(sqF(v), fm(F(2), sqF(uu))) }[ask];
  const what = { six: `${pw('sin', 6)} + ${pw('cos', 6)}`, cos4: 'cos 4x', eight: `${pw('sin', 8)} + ${pw('cos', 8)}` }[ask];
  const miss = fs(ONE, v);
  const wrongs = {
    six: [fs(fm(F(2), v), ONE), fa(v, uu), fs(fm(F(3), v), F(2)), fm(F(1, 4), fa(ONE, fm(F(3), v))), sqF(v), fs(v, fm(F(2), uu))],
    cos4: [fs(F(3), fm(F(4), v)), fs(fm(F(2), v), ONE), fs(fm(F(8), v), F(7)), v, fs(ONE, s2x), miss, s2x, fs(fm(F(4), v), ONE), fm(F(1, 2), fs(fm(F(4), v), F(3))), fs(ONE, fm(F(2), v)), fm(F(-1), v), F(0), F(1, 2), F(-1, 2)],
    eight: [fs(sqF(v), sqF(miss)), fs(sqF(v), uu), sqF(v), fs(sqF(v), miss), fa(sqF(v), fm(F(2), sqF(uu))), fm(v, ans)],
  }[ask];
  return {
    topic: EXACT, rank: { six: 14, cos4: 14, eight: 16 }[ask],
    text: `A real number x satisfies ${S4} + ${C4} = ${V}. What is ${what}?`,
    answer: five(d, fq(ans), ask === 'cos4' ? unit(wrongs.map(fq)) : wrongs.map(fq)),
    solution: `Square ${S2} + ${C2} = 1 to get ${S4} + 2 ${S2} ${C2} + ${C4} = 1. So 2 ${S2} ${C2} = 1 − ${V}, and ${S2} ${C2} = ${fr(uu)}. ` + {
      six: `Now factor the sum of cubes of ${S2} and ${C2}: ${what} = (${S2} + ${C2})(${S4} − ${S2} ${C2} + ${C4}) = 1·(${V} − ${fr(uu)}) = <b>${fr(ans)}</b>.`,
      cos4: `Since sin 2x = 2 sin x cos x, ${pw('sin', 2, '2x')} = 4·${fr(uu)} = ${fr(s2x)}. The double angle formula on 2x gives cos 4x = 1 − 2 ${pw('sin', 2, '2x')} = 1 − 2·${fr(s2x)} = <b>${fr(ans)}</b>.`,
      eight: `Now square the given equation: ${pw('sin', 8)} + 2(${S2} ${C2})<sup>2</sup> + ${pw('cos', 8)} = ${fr(sqF(v))}. So ${what} = ${fr(sqF(v))} − 2·${fr(sqF(uu))} = <b>${fr(ans)}</b>.`,
    }[ask],
    check: () => {
      const x = root((t) => Math.sin(t) ** 4 + Math.cos(t) ** 4 - fv(v), 1e-9, Math.PI / 4), [a, b] = [Math.sin(x), Math.cos(x)];
      return close({ six: a ** 6 + b ** 6, cos4: Math.cos(4 * x), eight: a ** 8 + b ** 8 }[ask], fv(ans));
    },
  };
};

// sec x + tan x (or csc x + cot x) is given: its partner sec x − tan x is the reciprocal, because sec² − tan² = 1
const SEC_TANS = [[2, 1], [3, 1], [3, 2], [4, 3], [5, 2], [5, 3], [7, 3], [7, 4], [9, 5], [5, 1], [7, 2], [4, 1], [8, 3], [6, 5]];
const secPlusTan = (d, ctx) => {
  const [r, given, ask] = pick(ctx, 'sectan', [SEC_TANS, ['sec', 'csc'], ['partner', 'sine']]);
  const R = fr(r), inv = fd(ONE, r), A = fm(F(1, 2), fa(r, inv)), B = fm(F(1, 2), fs(r, inv));
  const main = fd(B, A), other = fd(ONE, A);                  // sin x and cos x if sec + tan was given, the other way round if csc + cot was
  const partner = fd(fa(ONE, other), main);
  const [L1, L2, f1, f2, near1, far1] = given === 'sec' ? ['sec x', 'tan x', 'sin x', 'cos x', 'csc x', 'cot x'] : ['csc x', 'cot x', 'cos x', 'sin x', 'sec x', 'tan x'];
  const ans = ask === 'partner' ? partner : (given === 'sec' ? main : other);
  const wrongs = ask === 'partner'
    ? [inv, r, fd(fs(ONE, other), main), fd(ONE, main), fd(other, main), sqF(r), fm(F(2), r)]
    : [given === 'sec' ? other : main, B, inv, fd(fs(r, ONE), fa(r, ONE)), A, fd(ONE, fa(r, ONE)), fm(F(1, 2), r)];
  return {
    topic: EXACT, rank: ask === 'partner' ? 16 : 14,
    text: `An acute angle x satisfies ${L1} + ${L2} = ${R}. What is ${ask === 'partner' ? `${near1} + ${far1}` : 'sin x'}?`,
    answer: five(d, fq(ans), ask === 'sine' ? unit(pos(wrongs.map(fq))) : pos(wrongs.map(fq))),
    solution: `Since ${sq(L1.slice(0, 3))} x − ${sq(L2.slice(0, 3))} x = 1, the product (${L1} + ${L2})(${L1} − ${L2}) is 1, so ${L1} − ${L2} = ${fr(inv)}. Adding and subtracting the two equations gives ${L1} = ½(${R} + ${fr(inv)}) = ${fr(A)} and ${L2} = ½(${R} − ${fr(inv)}) = ${fr(B)}. `
      + (ask === 'partner'
        ? `So ${f2} = 1 ÷ ${L1} = ${fr(other)} and ${f1} = ${L2} ÷ ${L1} = ${fr(main)}. Then ${near1} + ${far1} = (1 + ${f2}) ÷ ${f1} = ${fr(fa(ONE, other))} ÷ ${fr(main)} = <b>${fr(ans)}</b>.`
        : given === 'sec' ? `So sin x = ${L2} ÷ ${L1} = ${fr(B)} ÷ ${fr(A)} = <b>${fr(ans)}</b>.` : `So sin x = 1 ÷ ${L1} = <b>${fr(ans)}</b>.`),
    check: () => {
      const x = given === 'sec' ? root((t) => (1 + Math.sin(t)) / Math.cos(t) - fv(r), 1e-9, Math.PI / 2 - 1e-9) : root((t) => (1 + Math.cos(t)) / Math.sin(t) - fv(r), 1e-9, Math.PI / 2 - 1e-9);
      const got = ask === 'sine' ? Math.sin(x) : given === 'sec' ? (1 + Math.cos(x)) / Math.sin(x) : (1 + Math.sin(x)) / Math.cos(x);
      return close(got, fv(ans));
    },
  };
};

// sin 3x and cos 3x are sin x and cos x times simple expressions in cos 2x, so their ratios fix cos 2x
const TRIPLES_U = [[5, 2], [7, 3], [9, 4], [3, 2], [5, 3], [7, 4], [4, 3], [1, 2], [1, 3], [2, 3], [3, 4], [-1, 2], [-1, 3], [11, 5], [13, 5], [7, 5], [9, 5]];
const TRIPLES_W = [[4, 1], [5, 1], [6, 1], [7, 1], [9, 1], [7, 2], [9, 2], [-2, 1], [-3, 1], [-5, 1], [1, 4], [1, 5], [1, 7], [1, 9], [-1, 2], [-1, 3]];
const tripleAngle = (d, ctx) => {
  const [ask, turn] = [['tan', 'cos3', 'cos2'][ctx.k % 3], { ...ctx, k: Math.floor(ctx.k / 3) }];
  const [u] = pick(turn, `triple-${ask}`, [ask === 'tan' ? TRIPLES_W : TRIPLES_U], (v) => ask !== 'cos3' || fv(v) !== 2);
  const half = F(1, 2), cos2 = ask === 'tan' ? fd(fa(u, ONE), fm(F(2), fs(u, ONE))) : fm(half, fs(u, ONE));
  const ans = ask === 'cos3' ? fs(u, F(2)) : cos2;
  const lead = `First write sin 3x with cos 2x: sin 3x = sin 2x cos x + cos 2x sin x = 2 sin x ${C2} + cos 2x sin x = sin x(1 + 2 cos 2x), since 2 ${C2} = 1 + cos 2x.`
    + (ask === 'cos2' ? '' : ` In the same way, cos 3x = cos 2x cos x − sin 2x sin x = cos x(cos 2x − 2 ${S2}) = cos x(2 cos 2x − 1), since 2 ${S2} = 1 − cos 2x.`);
  const what = { cos2: [over('sin 3x', 'sin x'), 'cos 2x'], cos3: [over('sin 3x', 'sin x'), over('cos 3x', 'cos x')], tan: [over('tan 3x', 'tan x'), 'cos 2x'] }[ask];
  const wrongs = {
    cos2: [fs(u, ONE), fm(half, fa(u, ONE)), fm(F(1, 4), fs(F(3), u)), fm(F(1, 4), fa(ONE, u)), fm(half, fs(ONE, u)), fm(half, u), fm(F(1, 4), fs(u, ONE)), fm(F(1, 4), fs(u, F(3)))],
    cos3: [fs(F(2), u), fa(u, F(2)), fs(u, ONE), fm(half, fs(u, ONE)), fd(ONE, u), fs(fm(F(2), u), ONE)],
    tan: [fd(fs(u, ONE), fm(F(2), fa(u, ONE))), fd(fa(u, ONE), fs(u, ONE)), fd(fs(u, F(3)), fs(fm(F(3), u), ONE)), fd(ONE, u), fm(F(-1), ans), fm(half, u), fm(half, ans), fm(F(1, 4), fd(ONE, u))],
  }[ask];
  const c = fr(cos2);
  return {
    topic: EXACT, rank: { cos2: 13, cos3: 15, tan: 17 }[ask],
    text: `A real number x satisfies ${what[0]} = ${fr(u)}. What is ${what[1]}?`,
    answer: five(d, fq(ans), ask === 'cos3' ? wrongs.map(fq) : unit(wrongs.map(fq))),
    solution: `${lead} ` + {
      cos2: `So ${what[0]} = 1 + 2 cos 2x = ${fr(u)}, and cos 2x = (${fr(u)} − 1) ÷ 2 = <b>${fr(ans)}</b>.`,
      cos3: `So ${what[0]} = 1 + 2 cos 2x = ${fr(u)}, which makes 2 cos 2x = ${fr(fs(u, ONE))}. Then ${what[1]} = 2 cos 2x − 1 = ${fr(fs(u, ONE))} − 1 = <b>${fr(ans)}</b>.`,
      tan: `Dividing, ${what[0]} = ${over('1 + 2 cos 2x', '2 cos 2x − 1')} = ${fr(u)}. Cross-multiply and call c = cos 2x: 1 + 2c = ${par(u)}(2c − 1), so 2c(${par(u)} − 1) = ${par(u)} + 1, and c = <b>${c}</b>.`,
    }[ask],
    check: () => {
      const w = fv(u), g = ask === 'tan' ? (t) => Math.tan(3 * t) / Math.tan(t) - w : (t) => Math.sin(3 * t) / Math.sin(t) - w;
      const x = ask !== 'tan' ? root(g, 1e-6, Math.PI / 2 - 1e-6) : w > 3 ? root(g, 1e-6, Math.PI / 6 - 1e-9) : root(g, Math.PI / 6 + 1e-9, Math.PI / 2 - 1e-6);
      return close(ask === 'cos3' ? Math.cos(3 * x) / Math.cos(x) : Math.cos(2 * x), fv(ans)) && close(g(x), 0, 1e-6);
    },
  };
};

// sec x + csc x is given: both sides are about t = sin x + cos x, and being acute picks the root of a quadratic
const SEC_CSCS = [[4, 3], [5, 4], [7, 5], [9, 7], [11, 9], [6, 5], [7, 6], [8, 7], [13, 11]];
const secPlusCsc = (d, ctx) => {
  const [t, ask] = pick(ctx, 'seccsc', [SEC_CSCS, ['sum', 'sin2', 'tancot']]);
  const t2 = sqF(t), s2x = fs(t2, ONE), u = fm(F(1, 2), s2x), c = fd(t, u), [m, n] = c, l = Math.round(Math.sqrt(m * m + n * n));
  const ans = { sum: t, sin2: s2x, tancot: fd(ONE, u) }[ask], inv = fd(ONE, t);
  const what = { sum: 'sin x + cos x', sin2: 'sin 2x', tancot: 'tan x + cot x' }[ask];
  const wrongs = {
    sum: [inv, t2, fm(F(1, 2), c), s2x, u, fd(ONE, c), c, fm(F(2), t), fa(t, u)],
    sin2: [u, fd(ONE, t2), fm(F(1, 2), t), fd(ONE, c), fd(F(2), c), fm(F(2), u), t, t2],
    tancot: [u, c, fm(F(1, 2), c), fd(ONE, s2x), fm(c, t), s2x],
  }[ask];
  return {
    topic: EXACT, rank: ask === 'tancot' ? 13 : 14,
    text: `An acute angle x satisfies sec x + csc x = ${fr(c)}. What is ${what}?`,
    answer: five(d, fq(ans), ask === 'sin2' ? unit(pos(wrongs.map(fq))) : pos(wrongs.map(fq))),
    solution: `Let t = sin x + cos x. Squaring gives t<sup>2</sup> = 1 + 2 sin x cos x, so sin x cos x = (t<sup>2</sup> − 1)/2. Then sec x + csc x = ${over('sin x + cos x', 'sin x cos x')} = ${over('2t', 't<sup>2</sup> − 1')}. Setting this equal to ${fr(c)} and cross-multiplying gives ${m}t<sup>2</sup> − ${2 * n}t − ${m} = 0, whose roots are t = ${over(`${n} ± ${l}`, m)}. An acute angle has positive sine and cosine, so t is positive and t = ${over(n + l, m)} = ${fr(t)}. `
      + {
        sum: `So sin x + cos x = <b>${fr(ans)}</b>.`,
        sin2: `Then sin 2x = 2 sin x cos x = t<sup>2</sup> − 1 = ${fr(t2)} − 1 = <b>${fr(ans)}</b>.`,
        tancot: `Then sin x cos x = (${fr(t2)} − 1)/2 = ${fr(u)}, and tan x + cot x = ${over(1, 'sin x cos x')} = <b>${fr(ans)}</b>.`,
      }[ask],
    check: () => {
      const x = root((v) => 1 / Math.cos(v) + 1 / Math.sin(v) - fv(c), 1e-7, Math.PI / 4);
      return close({ sum: Math.sin(x) + Math.cos(x), sin2: Math.sin(2 * x), tancot: Math.tan(x) + 1 / Math.tan(x) }[ask], fv(ans));
    },
  };
};

// (1 + sin x)(1 + cos x) is half a perfect square in t = sin x + cos x, and so is (1 − sin x)(1 − cos x)
const ONE_PLUS = [[3, 2], [5, 3], [4, 3], [5, 4], [7, 4], [9, 5], [7, 5], [6, 5], [8, 5], [2, 3], [3, 4], [3, 5], [4, 5], [5, 6], [7, 6]];
const onePlus = (d, ctx) => {
  const [w, ask] = pick(ctx, 'oneplus', [ONE_PLUS, ['minus', 'sum', 'sin2']]);
  const half = F(1, 2), v = fm(half, sqF(w)), t = fs(w, ONE), other = fm(F(-1), fa(w, ONE));
  const minus = fm(half, sqF(fs(t, ONE))), sin2 = fs(sqF(t), ONE);
  const ans = { minus, sum: t, sin2 }[ask], what = { minus: '(1 − sin x)(1 − cos x)', sum: 'sin x + cos x', sin2: 'sin 2x' }[ask];
  const wrongs = {
    minus: [v, fd(ONE, v), fs(ONE, v), sqF(fs(t, ONE)), fm(half, sqF(fs(other, ONE))), fs(F(2), v), fm(half, fs(ONE, t)), fm(half, minus), fm(F(-1), minus)],
    sum: [other, w, fs(v, ONE), fm(half, w), fs(fm(F(2), v), ONE), fa(w, ONE)],
    sin2: [fm(half, sin2), fs(sqF(other), ONE), fs(fm(F(2), v), ONE), sqF(t), fm(F(2), t), fs(v, ONE), fs(ONE, sqF(t))],
  }[ask];
  return {
    topic: EXACT, rank: { minus: 21, sum: 19, sin2: 20 }[ask],
    text: `A real number x satisfies (1 + sin x)(1 + cos x) = ${fr(v)}. What is ${what}?`,
    answer: five(d, fq(ans), ask === 'sin2' ? unit(wrongs.map(fq)) : wrongs.map(fq)),
    solution: `Let t = sin x + cos x, so that sin x cos x = (t<sup>2</sup> − 1)/2. Expanding, 1 + t + (t<sup>2</sup> − 1)/2 = ${fr(v)}. Doubling and tidying gives t<sup>2</sup> + 2t + 1 = ${fr(fm(F(2), v))}, that is (t + 1)<sup>2</sup> = (${fr(w)})<sup>2</sup>. So t = ${fr(t)} or t = ${fr(other)}. But sin x + cos x = √2·sin(x + 45°) is never below −√2 ≈ −1.41, which rules out ${fr(other)}, and t = ${fr(t)}. `
      + {
        minus: `Now (1 − sin x)(1 − cos x) = 1 − t + (t<sup>2</sup> − 1)/2 = (t − 1)<sup>2</sup>/2 = (${fr(fs(t, ONE))})<sup>2</sup>/2 = <b>${fr(ans)}</b>.`,
        sum: `So sin x + cos x = <b>${fr(ans)}</b>.`,
        sin2: `Then sin 2x = 2 sin x cos x = t<sup>2</sup> − 1 = <b>${fr(ans)}</b>.`,
      }[ask],
    check: () => {
      const x = root((a) => (1 + Math.sin(a)) * (1 + Math.cos(a)) - fv(v), -Math.PI / 2, Math.PI / 4), [a, b] = [Math.sin(x), Math.cos(x)];
      return close({ minus: (1 - a) * (1 - b), sum: a + b, sin2: Math.sin(2 * x) }[ask], fv(ans));
    },
  };
};

// sin x/sin y and cos x/cos y are given: sin² + cos² = 1 for x turns them into sin²y and cos²y, and each thing asked
// for comes out of those two
const RATIOS = [];
for (const a of [[2, 1], [3, 1], [4, 1], [3, 2], [4, 3], [5, 2], [5, 3], [5, 4]]) for (const b of [[1, 2], [1, 3], [2, 3], [3, 4], [1, 4], [2, 5], [3, 5], [4, 5]]) {
  if (fv(fm(a, b)) === 1 || (a[0] === 3 && a[1] === 1 && b[0] === 1 && b[1] === 2)) continue;
  const c2 = fs(fa(sqF(a), sqF(b)), F(2));
  if (c2[0] !== 0) RATIOS.push([a, b]);
}
const ratioSystem = (d, ctx) => {
  const ask = ['double', 'minus', 'plus'][ctx.k % 3];
  const [[a, b]] = pick({ ...ctx, k: Math.floor(ctx.k / 3) }, `ratios-${ask}`, [RATIOS], ([p, q]) => {
    const D = fs(sqF(p), sqF(q)), Sy = fd(fs(ONE, sqF(q)), D), Cy = fs(ONE, Sy);
    const r = fd(fs(fm(sqF(q), Cy), fm(sqF(p), Sy)), fs(Cy, Sy));
    return ask !== 'double' || fa(fm(p, q), r)[1] <= 400;
  });
  const a2 = sqF(a), b2 = sqF(b), D = fs(a2, b2), Sy = fd(fs(ONE, b2), D), Cy = fs(ONE, Sy), ab = fm(a, b);
  const minus = fa(fm(b, Cy), fm(a, Sy)), plus = fs(fm(b, Cy), fm(a, Sy)), R = fd(fs(fm(b2, Cy), fm(a2, Sy)), fs(Cy, Sy)), dbl = fa(ab, R);
  const ans = { minus, plus, double: dbl }[ask];
  const what = { minus: 'cos(x − y)', plus: 'cos(x + y)', double: `${over('sin 2x', 'sin 2y')} + ${over('cos 2x', 'cos 2y')}` }[ask];
  const wrongs = {
    minus: [plus, ab, fm(F(-1), minus), fd(fs(ab, ONE), fa(a, b)), fm(b, Cy), fm(a, Sy), fa(fm(a, Cy), fm(b, Sy)), b, fd(b, a)],
    plus: [minus, ab, fm(F(-1), plus), fd(fs(ab, ONE), fa(a, b)), fm(b, Cy), fm(a, Sy), fs(fm(a, Cy), fm(b, Sy)), b, fd(b, a)],
    double: [fa(ab, b2), fs(ab, R), R, fa(fm(F(2), ab), R), fa(ab, a2), fa(ab, fs(b2, a2))],
  }[ask];
  const A = fr(a), B = fr(b);
  return {
    topic: EXACT, rank: { minus: 21, plus: 21, double: 23 }[ask],
    text: `Acute angles x and y satisfy ${over('sin x', 'sin y')} = ${A} and ${over('cos x', 'cos y')} = ${B}. What is ${what}?`,
    answer: five(d, fq(ans), ask === 'double' ? wrongs.map(fq) : unit(wrongs.map(fq))),
    solution: `We have sin x = ${A} sin y and cos x = ${B} cos y. Put these into ${S2} + ${C2} = 1: ${fr(a2)} ${pw('sin', 2, 'y')} + ${fr(b2)} ${pw('cos', 2, 'y')} = 1. With ${pw('cos', 2, 'y')} = 1 − ${pw('sin', 2, 'y')}, this gives ${fv(D) === 1 ? '' : `${fr(D)} `}${pw('sin', 2, 'y')} = ${fr(fs(ONE, b2))}, so ${pw('sin', 2, 'y')} = ${fr(Sy)} and ${pw('cos', 2, 'y')} = ${fr(Cy)}. `
      + {
        minus: `Now cos(x − y) = cos x cos y + sin x sin y = ${B} ${pw('cos', 2, 'y')} + ${A} ${pw('sin', 2, 'y')} = ${B}·${fr(Cy)} + ${A}·${fr(Sy)} = <b>${fr(ans)}</b>.`,
        plus: `Now cos(x + y) = cos x cos y − sin x sin y = ${B} ${pw('cos', 2, 'y')} − ${A} ${pw('sin', 2, 'y')} = ${B}·${fr(Cy)} − ${A}·${fr(Sy)} = <b>${fr(ans)}</b>.`,
        double: `The first fraction is ${over('2 sin x cos x', '2 sin y cos y')} = ${A}·${B} = ${fr(ab)}. For the second, cos 2x = ${C2} − ${S2} = ${fr(b2)}·${fr(Cy)} − ${fr(a2)}·${fr(Sy)} = ${fr(fs(fm(b2, Cy), fm(a2, Sy)))} and cos 2y = ${fr(Cy)} − ${fr(Sy)} = ${fr(fs(Cy, Sy))}, so it is ${fr(R)}. The sum is ${fr(ab)} + ${par(R)} = <b>${fr(ans)}</b>.`,
      }[ask],
    check: () => {
      const p = fv(a), q = fv(b), y = root((t) => p * p * Math.sin(t) ** 2 + q * q * Math.cos(t) ** 2 - 1, 1e-9, Math.PI / 2 - 1e-9), x = Math.atan2(p * Math.sin(y), q * Math.cos(y));
      const got = { minus: Math.cos(x - y), plus: Math.cos(x + y), double: Math.sin(2 * x) / Math.sin(2 * y) + Math.cos(2 * x) / Math.cos(2 * y) }[ask];
      return close(got, fv(ans)) && close(Math.sin(x) / Math.sin(y), p) && close(Math.cos(x) / Math.cos(y), q);
    },
  };
};

// tan A : tan B : tan C in a triangle: tan A + tan B + tan C = tan A tan B tan C fixes the actual tangents, and an
// altitude onto the known side turns them into an area
const TAN_TRIPLES = [];
{
  const opts = [];
  for (let q = 1; q <= 6; q++) for (let p = 1; p <= 18; p++) if (gcd(p, q) === 1) opts.push([p, q]);
  const seen = new Set();
  for (const x of opts) for (const y of opts) {
    if (fv(y) < fv(x) || fv(fm(x, y)) <= 1) continue;
    const z = tanSum(x, y); const zz = fm(F(-1), z);
    if (fv(zz) < fv(y)) continue;
    const den = x[1] * y[1] * zz[1], ints = [x, y, zz].map((v) => (v[0] * den) / v[1]), g = gcd(gcd(ints[0], ints[1]), ints[2]), ratio = ints.map((v) => v / g);
    if (ratio[2] > 24 || seen.has(`${ratio}`)) continue;
    seen.add(`${ratio}`);
    TAN_TRIPLES.push({ ratio, tans: [x, y, zz], k: F(x[0] * g, x[1] * ints[0]) });
  }
}
const SIDES = [['BC', 0, 1, 2], ['CA', 1, 2, 0], ['AB', 2, 0, 1]];
const times = (c) => (c === 1 ? 'k' : `${c}k`);
const tanRatioTriangle = (d, ctx) => {
  const areaOf = (s, a, b) => fd(F(s * s), fm(F(2), fa(fd(ONE, a), fd(ONE, b))));
  const [tri, [side, i, j, k], s] = pick(ctx, 'tanratio', [TAN_TRIPLES, SIDES, [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15]], (t, sd, sv) => {
    const K = areaOf(sv, t.tans[sd[2]], t.tans[sd[3]]);
    return K[1] <= 4 && fv(K) >= 1 && K[0] <= 400;
  });
  const { ratio, tans } = tri, [p, q, r] = ratio, names = ['A', 'B', 'C'], J = names[j], L = names[k], K = areaOf(s, tans[j], tans[k]);
  const cots = fa(fd(ONE, tans[j]), fd(ONE, tans[k])), h = fd(F(s), cots), k2 = F(p + q + r, p * q * r);
  const sum2 = fd(F(s * s), fm(F(2), fa(tans[j], tans[k])));
  const wrongs = [fm(F(2), K), sum2, areaOf(s, F(ratio[j]), F(ratio[k])), areaOf(s, tans[i], tans[j]), areaOf(s, tans[i], tans[k]), fm(F(1, 2), K), fd(fm(F(s * s), fm(tans[j], tans[k])), F(4))];
  return {
    topic: EXACT, rank: 22,
    text: `In triangle ABC, tan A : tan B : tan C = ${p} : ${q} : ${r}, and ${side} = ${s}. What is the area of the triangle?`,
    answer: five(d, fq(K), pos(wrongs.map(fq))),
    solution: `Since A + B + C = 180°, tan C = −tan(A + B), and clearing the fraction gives tan A + tan B + tan C = tan A tan B tan C. Write the tangents as ${times(p)}, ${times(q)} and ${times(r)}. Here k is positive, because negative tangents would make all three angles obtuse. Then ${p + q + r}k = ${p * q * r}k<sup>3</sup>, so k<sup>2</sup> = ${fr(k2)} and k = ${fr(tri.k)}. So tan A = ${fr(tans[0])}, tan B = ${fr(tans[1])} and tan C = ${fr(tans[2])}, all three angles acute. Drop the altitude of length h from the corner opposite ${side}. It cuts ${side} into pieces h cot ${J} and h cot ${L}, so ${s} = h(${fr(fd(ONE, tans[j]))} + ${fr(fd(ONE, tans[k]))}) = ${fv(cots) === 1 ? '' : `${fr(cots)}·`}h, and h = ${fr(h)}. The area is ½·${s}·${fr(h)} = <b>${fr(K)}</b>.`,
    check: () => {
      const m = root((c) => Math.atan(p * c) + Math.atan(q * c) + Math.atan(r * c) - Math.PI, 1e-9, 1e4);
      const ang = [p, q, r].map((c) => Math.atan(c * m));
      // the side along the x-axis, the third corner where the two rays from its ends meet
      const u = Math.tan(ang[j]), v = Math.tan(ang[k]), x = (v * s) / (u + v), y = u * x;
      return close(shoelace([[0, 0], [s, 0], [x, y]]), fv(K)) && close(Math.tan(ang[0]) / p, Math.tan(ang[2]) / r);
    },
  };
};

// ======================================================================================================================
// Sums and products of trig values
// ======================================================================================================================
const SUMPROD = 'Sums and products of trig values';
const deg = (x) => `${num(x, 2)}°`;
// a sum or product written out: all of it when it is short, otherwise its first three terms and its last
const series = (a, step, last, term, join = ' + ') => {
  const n = Math.round((last - a) / step) + 1;
  return n <= 4 ? Array.from({ length: n }, (_, i) => term(a + i * step)).join(join) : [term(a), term(a + step), term(a + 2 * step), '⋯', term(last)].join(join);
};
const addUp = (a, step, last, f) => { let s = 0; for (let x = a; x <= last + 1e-9; x += step) s += f(rad(x)); return s; };

// squares of sines at angles balanced around 45°: x and 90° − x add up to 1
const BALANCED = [[5, 10], [3, 6], [10, 5], [15, 10], [6, 3], [4, 2], [8, 2], [9, 9], [6, 6], [5, 5], [10, 10], [3, 3], [15, 15], [12, 6], [20, 10], [7, 4], [1, 4], [2, 2]].filter(([a, s]) => (90 - 2 * a) % s === 0);
const squarePairs = (d, ctx) => {
  const [[a, s], fn] = pick(ctx, 'pairs', [BALANCED, ['sin', 'cos']]);
  const last = 90 - a, m = (last - a) / s + 1, ans = fl(m, 2), other = fn === 'sin' ? 'cos' : 'sin';
  const pairs = Math.floor(m / 2);
  return {
    topic: SUMPROD, rank: 10,
    text: `What is ${series(a, s, last, (x) => pw(fn, 2, deg(x)))}?`,
    answer: five(d, ans, [fl(m), fl(m - 1, 2), fl(m + 1, 2), fl(m, 4), fl(3 * m, 4), fl(3 * m, 8), fl(m - 2, 2), fl(m + 2, 2)]),
    solution: `There are ${m} terms, with angles balanced around 45°: ${deg(a)} goes with ${deg(last)}, ${deg(a + s)} goes with ${deg(last - s)}, and so on. Since ${fn}(90° − x) = ${other} x, each such pair adds up to ${pw(fn, 2)} + ${pw(other, 2)} = 1. `
      + (m % 2 ? `That makes ${pairs} pairs with the term ${pw(fn, 2, '45°')} = ½ left over in the middle, for a total of ${pairs} + ½ = <b>${ans[1]}</b>.` : `That makes ${pairs} pairs, for a total of <b>${ans[1]}</b>.`),
    check: () => close(addUp(a, s, last, (t) => (fn === 'sin' ? Math.sin(t) : Math.cos(t)) ** 2), ans[0]),
  };
};

// fourth powers at equally spaced angles: power reduction, and cosines of equally spaced directions add up to 0
const fourthSum = (d, ctx) => {
  const [N, fn] = pick(ctx, 'fourthsum', [[6, 9, 10, 12, 15, 18, 20, 36], ['sin', 'cos']]);
  const s = 180 / N, whole = F(3 * N, 8), ans = fn === 'sin' ? whole : fs(whole, ONE);
  const wrongs = [F(N, 2), F(N - 1, 2), F(3 * (N - 1), 8), fn === 'sin' ? fs(whole, ONE) : whole, F(N, 4), F(3 * N, 4), fa(whole, ONE), F(N, 8)];
  return {
    topic: SUMPROD, rank: fn === 'sin' ? 19 : 20,
    text: `What is ${series(s, s, 180 - s, (x) => pw(fn, 4, deg(x)))}?`,
    answer: five(d, fq(ans), wrongs.map(fq)),
    solution: `Use the double angle formula twice: ${pw(fn, 2)} = (1 ${fn === 'sin' ? '−' : '+'} cos 2x)/2, so ${pw(fn, 4)} = ¼(1 ${fn === 'sin' ? '−' : '+'} 2 cos 2x + ${pw('cos', 2, '2x')}), and ${pw('cos', 2, '2x')} = ½(1 + cos 4x). Together, ${pw(fn, 4)} = ⅜ ${fn === 'sin' ? '−' : '+'} ½ cos 2x + ⅛ cos 4x. Now add this up over the ${N} angles x = 0°, ${deg(s)}, ${deg(2 * s)}, ⋯, ${deg(180 - s)}. As x runs through them, 2x points in ${N} equally spaced directions around the circle, and so do the directions of 4x (going around twice), and the cosines of equally spaced directions add up to 0. So the ${N} values of ${pw(fn, 4)} add up to ${N}·⅜ = ${fr(whole)}. `
      + (fn === 'sin' ? `The angle 0° adds ${pw('sin', 4, '0°')} = 0, so leaving it out changes nothing, and the sum asked for is <b>${fr(ans)}</b>.` : `That includes the angle 0°, which adds ${pw('cos', 4, '0°')} = 1 and is not in the sum asked for. So the answer is ${fr(whole)} − 1 = <b>${fr(ans)}</b>.`),
    check: () => close(addUp(s, s, 180 - s, (t) => (fn === 'sin' ? Math.sin(t) : Math.cos(t)) ** 4), fv(ans)),
  };
};

// a sum of sines over the same sum of cosines: pairs from the two ends share an average angle
const TAN_EXACT = { 15: mix(2, -1, 3), 22.5: mix(-1, 1, 2), 30: fracSurd(1, 3, 3), 45: fl(1), 60: surd(1, 3), 67.5: mix(1, 1, 2), 75: mix(2, 1, 3) };
const SIN_EXACT = { 30: fl(1, 2), 45: fracSurd(1, 2, 2), 60: fracSurd(1, 2, 3) };
const AP_SETS = [];
for (const M of [15, 22.5, 30, 45, 60, 67.5, 75]) for (const s of [2, 4, 5, 6, 10, 12]) for (let n = 3; n <= 9; n++) {
  const a = M - ((n - 1) * s) / 2, last = a + (n - 1) * s;
  if (a > 0 && last < 90 && Number.isInteger(a)) AP_SETS.push([a, s, last, M]);
}
const apRatio = (d, ctx) => {
  const [[a, s, last, M], flip] = pick(ctx, 'apratio', [AP_SETS, [false, true]]);
  const sines = series(a, s, last, (x) => `sin ${deg(x)}`), cosines = series(a, s, last, (x) => `cos ${deg(x)}`), n = (last - a) / s + 1;
  const ans = TAN_EXACT[flip ? 90 - M : M], opposite = TAN_EXACT[flip ? M : 90 - M];
  const others = Object.values(TAN_EXACT).filter((v) => v !== ans && v !== opposite);
  const wrongs = [opposite, SIN_EXACT[M], SIN_EXACT[90 - M], TAN_EXACT[2 * M], TAN_EXACT[M / 2], ...d.shuffle(others)].filter(Boolean);
  const pairsText = n % 2 ? `the middle term has angle ${deg(M)} on its own, and sin ${deg(M)} is tan ${deg(M)} times cos ${deg(M)} too` : 'there are no terms left over';
  return {
    topic: SUMPROD, rank: 14,
    text: `What is ${flip ? over(cosines, sines) : over(sines, cosines)}?`,
    answer: five(d, ans, wrongs),
    solution: `Pair the terms from the two ends. The angles in each pair average ${deg(M)}, so with P + Q = ${deg(2 * M)}, sin P + sin Q = 2 sin ${deg(M)} cos ½(P − Q) and cos P + cos Q = 2 cos ${deg(M)} cos ½(P − Q). So in every pair the sines add up to tan ${deg(M)} times what the cosines add up to, and ${pairsText}. So the whole sum of sines is tan ${deg(M)} times the whole sum of cosines, and the fraction is ${flip ? `cot ${deg(M)} = tan ${deg(90 - M)}` : `tan ${deg(M)}`} = <b>${ans[1]}</b>.`,
    check: () => { const t = addUp(a, s, last, Math.sin) / addUp(a, s, last, Math.cos); return close(flip ? 1 / t : t, ans[0]); },
  };
};

// (1 + tan a)(1 + tan b) = 2 when a + b = 45°, and its relatives, in a long product
const pow2 = (k) => [2 ** k, k === 0 ? '1' : k === 1 ? '2' : `2<sup>${k}</sup>`];
const PLUS45 = [[2, 1], [5, 5], [3, 3], [9, 9], [10, 5], [15, 1], [20, 1], [12, 3], [9, 3], [6, 3], [4, 1], [10, 1], [5, 1], [14, 1], [15, 5], [17, 1], [21, 1]];
const MINUS135 = [[50, 5], [46, 1], [60, 5], [48, 3], [54, 9], [55, 5], [65, 1], [50, 1], [57, 3], [60, 1], [63, 3], [62, 1]];
const TAN_FORMS = [...PLUS45.flatMap(([p, s]) => [['plus', p, s], ['cot', p, s]]), ...MINUS135.map(([p, s]) => ['minus', p, s])];
const tanPairs = (d, ctx) => {
  const [[form, p, s]] = pick(ctx, 'tanpairs', [TAN_FORMS]);
  const total = form === 'minus' ? 135 : 45, q = total - p, n = (q - p) / s + 1, k = n / 2;
  const f = { plus: (x) => `(1 + tan ${deg(x)})`, cot: (x) => `(cot ${deg(x)} − 1)`, minus: (x) => `(1 − tan ${deg(x)})` }[form];
  const val = { plus: (t) => 1 + Math.tan(t), cot: (t) => 1 / Math.tan(t) - 1, minus: (t) => 1 - Math.tan(t) }[form];
  const why = {
    plus: 'If a + b = 45°, then tan(a + b) = 1 says tan a + tan b = 1 − tan a tan b. So (1 + tan a)(1 + tan b) = 1 + tan a + tan b + tan a tan b = 2.',
    cot: 'If a + b = 45°, then cot(a + b) = (cot a cot b − 1) ÷ (cot a + cot b) = 1 says cot a cot b − 1 = cot a + cot b. So (cot a − 1)(cot b − 1) = cot a cot b − cot a − cot b + 1 = 2.',
    minus: 'If a + b = 135°, then tan(a + b) = −1 says tan a + tan b = tan a tan b − 1. So (1 − tan a)(1 − tan b) = 1 − tan a − tan b + tan a tan b = 2.',
  }[form];
  return {
    topic: SUMPROD, rank: form === 'plus' ? 14 : 16,
    text: `What is ${series(p, s, q, f, '')}?`,
    answer: five(d, pow2(k), [pow2(n), pow2(k + 1), pow2(k - 1), pow2(k + 2), pow2(k - 2), pow2(n - 1), pow2(k - 3), pow2(k - 4)].filter((w) => w[0] >= 1)),
    solution: `${why} The ${n} factors here pair up from the two ends, since ${deg(p)} + ${deg(q)} = ${total}°, ${deg(p + s)} + ${deg(q - s)} = ${total}°, and so on. That makes ${k} pairs, each with product 2, so the whole product is <b>${pow2(k)[1]}</b>.`,
    check: () => { let m = 1; for (let x = p; x <= q + 1e-9; x += s) m *= val(rad(x)); return close(m, 2 ** k, 1e-6); },
  };
};

// two equations in sines and cosines: squaring and adding brings in cos(a − b) or sin(x + y)
const SAME_VALUES = [[1, 3], [1, 2], [2, 3], [3, 4], [1, 1], [4, 3], [3, 2]];
const SAME_PAIRS = SAME_VALUES.flatMap((p) => SAME_VALUES.filter((q) => fv(p) !== fv(q) && fv(p) ** 2 + fv(q) ** 2 < 3.4).map((q) => [p, q]));
const CROSS = [];
for (let a = 1; a <= 5; a++) for (let b = a + 1; b <= 6; b++) for (let p = 1; p <= a + b; p++) for (let q = 1; q <= a + b; q++) {
  const r2 = p * p + q * q;
  if (p !== q && r2 > (b - a) ** 2 && r2 < (a + b) ** 2 && r2 !== a * a + b * b && !(a === 3 && b === 4 && p * q === 10)) CROSS.push([a, b, p, q]);
}
const pairSums = (d, ctx) => {
  const form = ['cross', 'plus', 'sin', 'minus'][ctx.k % 4], turn = { ...ctx, k: Math.floor(ctx.k / 4) };
  if (form === 'cross') {
    const [[a, b, p, q]] = pick(turn, 'cross', [CROSS]);
    const R = p * p + q * q, S = a * a + b * b, ans = F(R - S, 2 * a * b), A = a === 1 ? '' : `${a} `;
    return {
      topic: SUMPROD, rank: 17,
      text: `Real numbers x and y satisfy ${A}sin x + ${b} cos y = ${p} and ${A}cos x + ${b} sin y = ${q}. What is sin(x + y)?`,
      answer: five(d, fq(ans), unit([F(R - S, a * b), F(R, 2 * a * b), F(S - R, 2 * a * b), F(R - S, S), F(R - S, 4 * a * b), F(S, 2 * a * b), F(R - S, (a + b) ** 2), fs(ONE, ans)].map(fq))),
      solution: `Square both equations and add them. The squares of ${A}sin x and ${A}cos x add up to ${a * a}, and those of ${b} cos y and ${b} sin y add up to ${b * b}. The cross terms are 2·${a}·${b}(sin x cos y + cos x sin y) = ${2 * a * b} sin(x + y). So ${S} + ${2 * a * b} sin(x + y) = ${p * p} + ${q * q} = ${R}, and sin(x + y) = <b>${fr(ans)}</b>.`,
      check: () => {
        const th = Math.atan2(q, p), f = root((t) => Math.hypot(p - a * Math.cos(t), q - a * Math.sin(t)) - b, th, th + Math.PI);
        const u = [Math.cos(f), Math.sin(f)], v = [(p - a * u[0]) / b, (q - a * u[1]) / b], x = Math.atan2(u[0], u[1]), y = Math.atan2(v[1], v[0]);
        return close(a * Math.sin(x) + b * Math.cos(y), p) && close(a * Math.cos(x) + b * Math.sin(y), q) && close(Math.sin(x + y), fv(ans));
      },
    };
  }
  const [[p, q]] = pick(turn, `same-${form}`, [SAME_PAIRS]);
  const P = fr(p), Q = fr(q), p2 = sqF(p), q2 = sqF(q), R = fa(p2, q2), half = F(1, 2), diff = fs(q2, p2), two = fm(F(2), fm(p, q));
  const minus = fm(half, fs(R, F(2))), plus = fd(diff, R), sn = fd(two, R), ans = { minus, plus, sin: sn }[form];
  const what = { minus: 'cos(a − b)', plus: 'cos(a + b)', sin: 'sin(a + b)' }[form];
  const wrongs = {
    minus: [fs(R, F(2)), fm(half, fs(R, ONE)), fm(half, R), fs(fm(half, sqF(fa(p, q))), ONE), plus, sn, fm(F(-1), minus), fs(R, ONE), fm(F(1, 4), fs(R, F(2)))],
    plus: [fm(F(-1), plus), minus, sn, fm(half, diff), diff, fd(R, F(2)), fs(ONE, fm(half, R))],
    sin: [fm(half, sn), two, plus, fd(R, two), minus, fd(two, diff), fm(F(-1), sn), fm(half, two)],
  }[form];
  const tanM = fd(p, q);
  return {
    topic: SUMPROD, rank: form === 'minus' ? 13 : 16,
    text: `Real numbers a and b satisfy sin a + sin b = ${P} and cos a + cos b = ${Q}. What is ${what}?`,
    answer: five(d, fq(ans), unit(wrongs.map(fq))),
    solution: form === 'minus'
      ? `Square both equations and add them. The left side becomes ${pw('sin', 2, 'a')} + ${pw('cos', 2, 'a')} + ${pw('sin', 2, 'b')} + ${pw('cos', 2, 'b')} + 2(cos a cos b + sin a sin b) = 2 + 2 cos(a − b), and the right side is ${fr(p2)} + ${fr(q2)} = ${fr(R)}. So cos(a − b) = (${fr(R)} − 2) ÷ 2 = <b>${fr(ans)}</b>.`
      : `By the sum-to-product formulas, sin a + sin b = 2 sin M cos D and cos a + cos b = 2 cos M cos D, where M = ½(a + b) and D = ½(a − b). Dividing, tan M = ${P} ÷ ${Q} = ${fr(tanM)}. Now a + b = 2M, so ${what} = ${form === 'plus' ? `(1 − ${pw('tan', 2, 'M')}) ÷ (1 + ${pw('tan', 2, 'M')})` : `2 tan M ÷ (1 + ${pw('tan', 2, 'M')})`} = ${form === 'plus' ? `(1 − ${fr(sqF(tanM))}) ÷ (1 + ${fr(sqF(tanM))})` : `2·${fr(tanM)} ÷ (1 + ${fr(sqF(tanM))})`} = <b>${fr(ans)}</b>.`,
    check: () => {
      const m = Math.atan2(fv(p), fv(q)), h = Math.acos(Math.hypot(fv(p), fv(q)) / 2), x = m + h, y = m - h;
      return close(Math.sin(x) + Math.sin(y), fv(p)) && close(Math.cos(x) + Math.cos(y), fv(q)) && close({ minus: Math.cos(x - y), plus: Math.cos(x + y), sin: Math.sin(x + y) }[form], fv(ans));
    },
  };
};

// cos θ cos 2θ cos 4θ ⋯: multiply by sin θ and let the double angle formula collapse it, which works out exactly when
// the last doubling lands on an angle with the same sine as θ, up to sign
const DOUBLINGS = [[1, 5, 2], [2, 5, 2], [1, 9, 3], [2, 9, 3], [4, 9, 3], [1, 7, 3], [2, 7, 3], [1, 15, 4], [2, 15, 4], [1, 17, 4], [2, 17, 4], [1, 31, 5], [2, 31, 5], [1, 33, 5], [2, 33, 5]].map((x) => ['cos', ...x]);
const SINE_FORMS = [['sines', 1, 9, 3], ['sines', 1, 5, 2], ['sines', 1, 15, 4]];
// θ = pπ/q as it reads, in degrees when that is a whole number
const angleText = (p, q) => { const dg = (180 * p) / q; return Number.isInteger(dg) ? `${dg}°` : `${p === 1 ? '' : p}π/${q}`; };
const cosOf = (p, q) => (Number.isInteger((180 * p) / q) ? `cos ${angleText(p, q)}` : `cos(${angleText(p, q)})`);
const sinOf = (p, q) => (Number.isInteger((180 * p) / q) ? `sin ${angleText(p, q)}` : `sin(${angleText(p, q)})`);
const doublingProduct = (d, ctx) => {
  const [[form, p, q, n]] = pick(ctx, 'doubling', [[...DOUBLINGS, ...SINE_FORMS]]);
  const two = 2 ** n, top = two * p, e = ((top % (2 * q)) + 2 * q) % (2 * q);
  const sign = e === p || e === q - p ? 1 : e === q + p || e === 2 * q - p ? -1 : 0;
  if (!sign) throw new Error('doubling: the last angle has a different sine');
  const steps = Array.from({ length: n }, (_, j) => 2 ** j), base = F(sign, two);
  const flips = form === 'sines' ? steps.filter((m) => (180 * p * m) / q > 90).length : 0;
  const ans = flips % 2 ? fm(F(-1), base) : base, angleDeg = (m) => (180 * p * m) / q;
  const shown = form === 'cos' ? steps.map((m) => cosOf(p * m, q)).join(' ') : steps.map((m) => `sin ${Math.abs(90 - angleDeg(m))}°`).sort((x, y) => parseFloat(x.slice(4)) - parseFloat(y.slice(4))).join(' ');
  const collapse = `Multiply and divide by ${sinOf(p, q)}, and use sin 2A = 2 sin A cos A again and again: ${sinOf(p, q)} ${cosOf(p, q)} = ½ ${sinOf(2 * p, q)}, then ½ ${sinOf(2 * p, q)} ${cosOf(2 * p, q)} = ¼ ${sinOf(4 * p, q)}, and so on. The ${n} cosines collapse to give ${over(sinOf(top, q), `${two} ${sinOf(p, q)}`)}, and ${sinOf(top, q)} = ${sign < 0 ? '−' : ''}${sinOf(p, q)}. `;
  const convert = form === 'sines' ? `Since sin x = cos(90° − x), turn each sine into a cosine: this product is ${flips % 2 ? `−(${steps.map((m) => cosOf(p * m, q)).join(' ')})` : steps.map((m) => cosOf(p * m, q)).join(' ')}${flips ? ', where the minus sign comes from cos 96° = −sin 6°' : ''}. ` : '';
  const wrongs = [fm(F(-1), ans), F(1, 2 * two), F(1, two / 2), F(-1, 2 * two), F(-1, two / 2), F(1, 2 * n), F(n, two), F(1, two)].map(fq);
  return {
    topic: SUMPROD, rank: form === 'sines' ? 17 : sign > 0 ? 15 : 16,
    text: `What is ${shown}?`,
    answer: five(d, fq(ans), wrongs),
    solution: `${convert}${collapse}${flips % 2 ? `So ${steps.map((m) => cosOf(p * m, q)).join(' ')} = ${fr(base)}, and the product asked for is <b>${fr(ans)}</b>.` : `So the product is <b>${fr(ans)}</b>.`}`,
    check: () => {
      if (form === 'cos') return close(steps.reduce((m, j) => m * Math.cos((Math.PI * p * j) / q), 1), fv(ans));
      return close(steps.reduce((m, j) => m * Math.sin(rad(Math.abs(90 - angleDeg(j)))), 1), fv(ans));
    },
  };
};

// θ, 60° − θ and 60° + θ: their sines, cosines or tangents multiply to a simple function of 3θ
const TRIPLE_TABLE = [['tan', 5, [2, -1, 3, 1]], ['tan', 10, [0, 1, 3, 3]], ['tan', 15, [1, 0, 1, 1]], ['tan', 20, [0, 1, 3, 1]], ['tan', 25, [2, 1, 3, 1]],
  ['sin', 20, [0, 1, 3, 2]], ['sin', 15, [0, 1, 2, 2]], ['sin', 6, [-1, 1, 5, 4]], ['sin', 18, [1, 1, 5, 4]],
  ['cos', 10, [0, 1, 3, 2]], ['cos', 15, [0, 1, 2, 2]], ['cos', 12, [1, 1, 5, 4]], ['cos', 24, [-1, 1, 5, 4]]];
const scaled = ([a, b, r, den], p, q = 1) => mix(a * p, b * p, r, den * q);
const fnOf = { sin: Math.sin, cos: Math.cos, tan: Math.tan };
const tripleProduct = (d, ctx) => {
  const [[fn, th, e]] = pick(ctx, 'tripleprod', [TRIPLE_TABLE]);
  const A = [th, 60 - th, 60 + th], val3 = scaled(e, 1), ans = fn === 'tan' ? val3 : scaled(e, 1, 4);
  const wrongs = fn === 'tan'
    ? [scaled(e, 1, 3), scaled(e, 3), scaled(e, 1, 4), scaled(e, 1, 2), TAN_EXACT[90 - 3 * th], scaled(e, 3, 4)]
    : [val3, scaled(e, 1, 2), scaled(e, 1, 8), scaled(e, 3, 4), scaled(e, 3, 8), scaled(e, 1, 16)];
  const form = {
    sin: `First, sin(60° − θ) sin(60° + θ) = (sin 60° cos θ)<sup>2</sup> − (cos 60° sin θ)<sup>2</sup> = ¾ ${pw('cos', 2, 'θ')} − ¼ ${pw('sin', 2, 'θ')} = ¾ − ${pw('sin', 2, 'θ')}. Multiplying by sin θ gives ¾ sin θ − ${pw('sin', 3, 'θ')} = ¼(3 sin θ − 4 ${pw('sin', 3, 'θ')}) = ¼ sin 3θ.`,
    cos: `First, cos(60° − θ) cos(60° + θ) = (cos 60° cos θ)<sup>2</sup> − (sin 60° sin θ)<sup>2</sup> = ¼ ${pw('cos', 2, 'θ')} − ¾ ${pw('sin', 2, 'θ')} = ${pw('cos', 2, 'θ')} − ¾. Multiplying by cos θ gives ${pw('cos', 3, 'θ')} − ¾ cos θ = ¼(4 ${pw('cos', 3, 'θ')} − 3 cos θ) = ¼ cos 3θ.`,
    tan: `For the sines, sin(60° − θ) sin(60° + θ) = (sin 60° cos θ)<sup>2</sup> − (cos 60° sin θ)<sup>2</sup> = ¾ − ${pw('sin', 2, 'θ')}, and multiplying by sin θ gives ¼(3 sin θ − 4 ${pw('sin', 3, 'θ')}) = ¼ sin 3θ. In the same way, cos θ cos(60° − θ) cos(60° + θ) = ¼ cos 3θ. Dividing, tan θ tan(60° − θ) tan(60° + θ) = tan 3θ.`,
  }[fn];
  return {
    topic: SUMPROD, rank: 18,
    text: `What is ${A.map((x) => `${fn} ${deg(x)}`).join(' ')}?`,
    answer: five(d, ans, pos(wrongs.filter(Boolean))),
    solution: `The angles are θ, 60° − θ and 60° + θ with θ = ${deg(th)}. ${form} Here 3θ = ${deg(3 * th)} and ${fn} ${deg(3 * th)} = ${val3[1]}, so the product is ${fn === 'tan' ? '' : `¼·${/\+|−/.test(val3[1]) ? `(${val3[1]})` : val3[1]} = `}<b>${ans[1]}</b>.`,
    check: () => close(A.reduce((m, x) => m * fnOf[fn](rad(x)), 1), ans[0]),
  };
};

// the law of cosines in a triangle with circumdiameter 1, whose sides are the sines of its angles
const COSINE_FORMS = [[60, '−', '', 1], [120, '+', '', 1], [45, '−', '√2 ', Math.SQRT2], [135, '+', '√2 ', Math.SQRT2], [30, '−', '√3 ', Math.sqrt(3)], [150, '+', '√3 ', Math.sqrt(3)]];
const cosineTrick = (d, ctx) => {
  const [[C, op, coefText, coef], A, form] = pick(ctx, 'cosinetrick', [COSINE_FORMS, [5, 10, 12, 15, 18, 20, 25, 35, 40, 50], ['sin', 'cos']], ([c], a, f) => {
    const B = 180 - c - a;
    return a < B && a !== B && B > 0 && (f === 'sin' || B < 90) && !(c === 120 && a === 20);
  });
  const B = 180 - C - A, sc2 = { 60: F(3, 4), 120: F(3, 4), 45: F(1, 2), 135: F(1, 2), 30: F(1, 4), 150: F(1, 4) }[C];
  const ans = fq(sc2), sinC = { 60: fracSurd(1, 2, 3), 120: fracSurd(1, 2, 3), 45: fracSurd(1, 2, 2), 135: fracSurd(1, 2, 2), 30: fl(1, 2), 150: fl(1, 2) }[C];
  const second = form === 'sin' ? [pw('sin', 2, deg(B)), `sin ${deg(B)}`] : [pw('cos', 2, deg(90 - B)), `cos ${deg(90 - B)}`];
  const asked = `${pw('sin', 2, deg(A))} + ${second[0]} ${op} ${coefText}sin ${deg(A)} ${second[1]}`;
  const cosC = { 60: '½', 120: '(−½)', 45: '√2/2', 135: '(−√2/2)', 30: '√3/2', 150: '(−√3/2)' }[C];
  return {
    topic: SUMPROD, rank: 19,
    text: `What is ${asked}?`,
    answer: five(d, ans, [fl(1), sinC, fq(fm(F(2), sc2)), fl(1, 4), fl(1, 2), fl(3, 4), fl(3, 2), fracSurd(1, 2, 3), fracSurd(1, 2, 2)]),
    solution: `This looks like the law of cosines. Take a triangle with angles ${deg(A)}, ${deg(B)} and ${deg(C)} (they add up to 180°) inside a circle of diameter 1. By the law of sines its sides are sin ${deg(A)}, sin ${deg(B)} and sin ${deg(C)}. `
      + (form === 'cos' ? `Note that sin ${deg(B)} = cos ${deg(90 - B)}, so the expression is ${pw('sin', 2, deg(A))} + ${pw('sin', 2, deg(B))} ${op} ${coefText}sin ${deg(A)} sin ${deg(B)}. ` : '')
      + `The law of cosines for the side opposite ${deg(C)} says ${pw('sin', 2, deg(C))} = ${pw('sin', 2, deg(A))} + ${pw('sin', 2, deg(B))} − 2 cos ${deg(C)} sin ${deg(A)} sin ${deg(B)}, and 2 cos ${deg(C)} = 2·${cosC} = ${op === '−' ? '' : '−'}${coefText.trim() || '1'}. So the expression equals ${pw('sin', 2, deg(C))} = <b>${ans[1]}</b>.`,
    check: () => {
      const [a, b] = [Math.sin(rad(A)), form === 'sin' ? Math.sin(rad(B)) : Math.cos(rad(90 - B))];
      return close(a * a + b * b + (op === '+' ? 1 : -1) * coef * a * b, ans[0]);
    },
  };
};

// three "arrows" of lengths p, q and r that add up to zero make a triangle: squaring gives the angles between them
const CLOSED = [];
for (let p = 2; p <= 9; p++) for (let q = 2; q <= 9; q++) for (let r = 2; r <= 9; r++) if (p < q + r && q < p + r && r < p + q && !(p === q && q === r) && r * r !== p * p + q * q) CLOSED.push([p, q, r]);
const closingTriangle = (d, ctx) => {
  const [[p, q, r], ask] = pick(ctx, 'closing', [CLOSED, ['pair', 'pair2', 'all']]);
  const eq1 = `${p} cos a + ${q} cos b + ${r} cos c = 0`, eq2 = `${p} sin a + ${q} sin b + ${r} sin c = 0`, S = p * p + q * q + r * r;
  // pair: cos(a − b), pair2: cos(b − c)
  const [u, v, w, A, B, Cn] = ask === 'pair2' ? [q, r, p, 'b', 'c', 'a'] : [p, q, r, 'a', 'b', 'c'];
  const pairAns = F(w * w - u * u - v * v, 2 * u * v), allAns = F(-S, 2), ans = ask === 'all' ? allAns : pairAns;
  const what = ask === 'all' ? `${p * q} cos(a − b) + ${q * r} cos(b − c) + ${r * p} cos(c − a)` : `cos(${A} − ${B})`;
  const wrongs = ask === 'all'
    ? [F(S, 2), F(-S), F(-S, 4), F(S), F(-((p + q + r) ** 2), 2), F(-(S - p * q), 2)].map(fq)
    : unit([fm(F(-1), pairAns), F(w * w - u * u - v * v, u * v), F(w * w - u * u - v * v, u * u + v * v), fs(pairAns, ONE), fa(pairAns, ONE), F(w - u - v, 2 * u * v), F(w * w - u * u - v * v, 4 * u * v), F(u * v, w * w)].map(fq));
  return {
    topic: SUMPROD, rank: ask === 'all' ? 19 : 20,
    text: `Real numbers a, b and c satisfy ${eq1} and ${eq2}. What is ${what}?`,
    answer: five(d, fq(ans), wrongs),
    solution: ask === 'all'
      ? `Square both equations and add them. The squares of ${p} cos a and ${p} sin a add up to ${p * p}(${pw('cos', 2, 'a')} + ${pw('sin', 2, 'a')}) = ${p * p}, and likewise for b and c. Each pair of terms gives a cross term such as 2·${p}·${q}(cos a cos b + sin a sin b) = 2·${p * q} cos(a − b). So ${S} + 2(${what}) = 0, and the expression is <b>${fr(ans)}</b>.`
      : `Move the ${Cn} terms to the right: ${u} cos ${A} + ${v} cos ${B} = −${w} cos ${Cn} and ${u} sin ${A} + ${v} sin ${B} = −${w} sin ${Cn}. Square both and add. On the right, ${w * w}(${pw('cos', 2, Cn)} + ${pw('sin', 2, Cn)}) = ${w * w}. On the left, ${u * u} + ${v * v} + 2·${u}·${v}(cos ${A} cos ${B} + sin ${A} sin ${B}) = ${u * u + v * v} + ${2 * u * v} cos(${A} − ${B}). So cos(${A} − ${B}) = (${w * w} − ${u * u + v * v}) ÷ ${2 * u * v} = <b>${fr(ans)}</b>.`,
    check: () => {
      const a = 0.7, P1 = [p * Math.cos(a), p * Math.sin(a)], b = root((t) => Math.hypot(P1[0] + q * Math.cos(t), P1[1] + q * Math.sin(t)) - r, a, a + Math.PI);
      const P2 = [P1[0] + q * Math.cos(b), P1[1] + q * Math.sin(b)], c = Math.atan2(-P2[1], -P2[0]);
      if (!close(p * Math.cos(a) + q * Math.cos(b) + r * Math.cos(c), 0) || !close(p * Math.sin(a) + q * Math.sin(b) + r * Math.sin(c), 0)) return false;
      return close({ pair: Math.cos(a - b), pair2: Math.cos(b - c), all: p * q * Math.cos(a - b) + q * r * Math.cos(b - c) + r * p * Math.cos(c - a) }[ask], fv(ans));
    },
  };
};

// tan x = cot x − 2 cot 2x makes a weighted sum of tangents collapse
const COT_CHAINS = [[5, 3], [1, 5], [3, 4], [10, 3], [2, 4], [4, 3], [6, 3], [8, 3], [5, 4], [1, 6], [3, 3], [2, 5], [7, 3], [9, 3], [11, 2], [4, 4]];
const cotDoubling = (d, ctx) => {
  const [[A, n]] = pick(ctx, 'cotchain', [COT_CHAINS]);
  const two = 2 ** n, end = two * A, val = 1 / Math.tan(rad(A));
  const terms = Array.from({ length: n }, (_, j) => `${j ? `${2 ** j} ` : ''}tan ${A * 2 ** j}°`), asked = [...terms, `${two} cot ${end}°`].join(' + ');
  const named = (c, fn, x) => [c * (fn === 'cot' ? 1 / Math.tan(rad(x)) : Math.tan(rad(x))), `${c === 1 ? '' : `${c} `}${fn} ${x}°`];
  const wrongs = [named(two, 'cot', A), named(1, 'cot', end), named(1, 'tan', A), named(2, 'cot', A), named(two, 'tan', A), named(two, 'cot', end), named(1, 'tan', end), named(two - 1, 'cot', A), named(2, 'tan', A)];
  return {
    topic: SUMPROD, rank: 21,
    text: `What is ${asked}?`,
    answer: five(d, [val, `cot ${A}°`], wrongs),
    solution: `Start from cot x − tan x = ${over(`${C2} − ${S2}`, 'sin x cos x')} = ${over('2 cos 2x', 'sin 2x')} = 2 cot 2x, so tan x = cot x − 2 cot 2x. Use this for each tangent: tan ${A}° = cot ${A}° − 2 cot ${2 * A}°, then 2 tan ${2 * A}° = 2 cot ${2 * A}° − 4 cot ${4 * A}°, and so on up to ${2 ** (n - 1)} tan ${end / 2}° = ${2 ** (n - 1)} cot ${end / 2}° − ${two} cot ${end}°. Adding these, everything cancels in pairs except cot ${A}° − ${two} cot ${end}°. The last term of the sum, ${two} cot ${end}°, cancels what is left over, so the total is <b>cot ${A}°</b>.`,
    check: () => {
      let s = two / Math.tan(rad(end));
      for (let j = 0; j < n; j++) s += 2 ** j * Math.tan(rad(A * 2 ** j));
      return close(s, val);
    },
  };
};

// 1/(sin x sin y) is (cot x − cot y)/sin(y − x), so a chain of them telescopes
const COT_TABLE = { 15: [6, 3], 30: [0, 3], 45: [3, 0], 60: [0, 1], 75: [6, -3], 90: [0, 0], 105: [-6, 3], 120: [0, -1], 135: [-3, 0], 150: [0, -3] };   // cot x = (a + b√3)/3
const CHAINS = [[30, 60], [30, 90], [45, 90], [45, 135], [30, 150], [60, 90], [60, 120], [15, 45], [45, 75], [15, 75], [75, 105], [15, 90], [75, 90], [30, 45], [45, 60], [60, 75], [15, 30], [30, 75], [15, 60], [45, 105]];
const telescopeCsc = (d, ctx) => {
  const [[p, q], s] = pick(ctx, 'telescope', [CHAINS, [1, 3, 5]]);
  const [a1, b1] = COT_TABLE[p], [a2, b2] = COT_TABLE[q], a = a1 - a2, b = b1 - b2, c = (a + b * Math.sqrt(3)) / 3, ss = Math.sin(rad(s));
  // (a + b√3)/(den·sin s°), as it reads
  const reads = (x, y, den, unitAngle = s, fn = 'sin') => {
    const g = gcd(gcd(x, y), den) || 1, [u, v, w] = [x / g, y / g, den / g], top = mix(u, v, 3)[1];
    return [(x + y * Math.sqrt(3)) / den / (fn === 'sin' ? Math.sin(rad(unitAngle)) : Math.cos(rad(unitAngle))), over(top, `${w === 1 ? '' : `${w} `}${fn} ${unitAngle}°`)];
  };
  const plainC = mix(a, b, 3, 3), ans = reads(a, b, 3);
  const n = (q - p) / s, wrongs = [plainC, reads(a, b, 6), reads(2 * a, 2 * b, 3), reads(a1 + a2, b1 + b2, 3), reads(a, b, 3, s, 'cos'), reads(a, b, 3, s === 1 ? 2 : 1), reads(4 * a, 4 * b, 3)];
  return {
    topic: SUMPROD, rank: 22,
    text: `What is ${series(p, s, q - s, (x) => over(1, `sin ${x}° sin ${x + s}°`))}?`,
    answer: five(d, ans, pos(wrongs.filter((w) => Number.isFinite(w[0])))),
    solution: `Each term is a difference of cotangents in disguise: cot x − cot y = ${over('cos x sin y − cos y sin x', 'sin x sin y')} = ${over('sin(y − x)', 'sin x sin y')}. With y = x + ${s}°, this says ${over(1, `sin x sin(x + ${s}°)`)} = (cot x − cot(x + ${s}°)) ÷ sin ${s}°. So the ${n} terms add up to (${n <= 3 ? Array.from({ length: n }, (_, j) => `cot ${p + j * s}° − cot ${p + j * s + s}°`).join(' + ') : `cot ${p}° − cot ${p + s}° + cot ${p + s}° − cot ${p + 2 * s}° + ⋯ + cot ${q - s}° − cot ${q}°`}) ÷ sin ${s}°, and everything cancels except (cot ${p}° − cot ${q}°) ÷ sin ${s}°. Here cot ${p}° − cot ${q}° = ${plainC[1]}, so the sum is <b>${ans[1]}</b>.`,
    check: () => { let t = 0; for (let x = p; x < q - 1e-9; x += s) t += 1 / (Math.sin(rad(x)) * Math.sin(rad(x + s))); return close(t, c / ss); },
  };
};

// three cosines that are the roots of a cubic: cos 3θ (or cos 4θ = ±cos 3θ) gives the cubic, and Vieta does the rest
const COS_FAMILIES = [
  { angles: [40, 80, 160], names: ['40°', '80°', '160°'], e: [F(0), F(-3, 4), F(-1, 8)], cubic: `8c<sup>3</sup> − 6c + 1 = 0`,
    why: `Each of θ = 40°, 80° and 160° has cos 3θ = −½, because 3θ is 120°, 240° or 480°. Since cos 3θ = 4 ${pw('cos', 3, 'θ')} − 3 cos θ, each of the three cosines is a root of 4c<sup>3</sup> − 3c = −½, that is 8c<sup>3</sup> − 6c + 1 = 0. They are three different numbers, so they are all the roots.` },
  { angles: [20, 100, 140], names: ['20°', '100°', '140°'], e: [F(0), F(-3, 4), F(1, 8)], cubic: `8c<sup>3</sup> − 6c − 1 = 0`,
    why: `Each of θ = 20°, 100° and 140° has cos 3θ = ½, because 3θ is 60°, 300° or 420°. Since cos 3θ = 4 ${pw('cos', 3, 'θ')} − 3 cos θ, each of the three cosines is a root of 4c<sup>3</sup> − 3c = ½, that is 8c<sup>3</sup> − 6c − 1 = 0. They are three different numbers, so they are all the roots.` },
  { angles: [360 / 7, 720 / 7, 1080 / 7], names: ['(2π/7)', '(4π/7)', '(6π/7)'], e: [F(-1, 2), F(-1, 2), F(1, 8)], cubic: `8c<sup>3</sup> + 4c<sup>2</sup> − 4c − 1 = 0`,
    why: `For θ = 2π/7, 4π/7 and 6π/7, the angle 3θ + 4θ = 7θ is a multiple of 2π, so cos 4θ = cos 3θ. With c = cos θ, cos 3θ = 4c<sup>3</sup> − 3c and cos 4θ = 2(2c<sup>2</sup> − 1)<sup>2</sup> − 1 = 8c<sup>4</sup> − 8c<sup>2</sup> + 1, so 8c<sup>4</sup> − 4c<sup>3</sup> − 8c<sup>2</sup> + 3c + 1 = 0. This also has the root c = 1 (from θ = 0), and dividing by c − 1 leaves 8c<sup>3</sup> + 4c<sup>2</sup> − 4c − 1 = 0, whose roots are the three different cosines.` },
  { angles: [180 / 7, 540 / 7, 900 / 7], names: ['(π/7)', '(3π/7)', '(5π/7)'], e: [F(1, 2), F(-1, 2), F(-1, 8)], cubic: `8c<sup>3</sup> − 4c<sup>2</sup> − 4c + 1 = 0`,
    why: `For θ = π/7, 3π/7 and 5π/7, the angle 3θ + 4θ = 7θ is an odd multiple of π, so cos 4θ = −cos 3θ. With c = cos θ, cos 3θ = 4c<sup>3</sup> − 3c and cos 4θ = 2(2c<sup>2</sup> − 1)<sup>2</sup> − 1 = 8c<sup>4</sup> − 8c<sup>2</sup> + 1, so 8c<sup>4</sup> + 4c<sup>3</sup> − 8c<sup>2</sup> − 3c + 1 = 0. This also has the root c = −1 (from θ = π), and dividing by c + 1 leaves 8c<sup>3</sup> − 4c<sup>2</sup> − 4c + 1 = 0, whose roots are the three different cosines.` },
];
const cubicCos = (d, ctx) => {
  const ask = ['recipShift', 'recip', 'shift', 'cubes', 'squares'][ctx.k % 5];
  const [fam, k] = pick({ ...ctx, k: Math.floor(ctx.k / 5) }, `cubic-${ask}`, [COS_FAMILIES, [1, 2, 3]], (f, n) => (ask === 'shift' ? true : ask === 'recipShift' ? n <= 2 : n === 1));
  const [e1, e2, e3] = fam.e, names = fam.names, c = (x) => `cos ${x}`.replace('cos (', 'cos('), K = F(k), three = F(3);
  const P = fs(fa(fs(F(k ** 3), fm(e1, F(k * k))), fm(e2, K)), e3), dP = fa(fs(F(3 * k * k), fm(F(2 * k), e1)), e2);
  const ans = { squares: fs(sqF(e1), fm(F(2), e2)), recip: fd(e2, e3), cubes: fa(fs(fm(e1, sqF(e1)), fm(fm(three, e1), e2)), fm(three, e3)), shift: P, recipShift: fd(dP, P) }[ask];
  const what = {
    squares: names.map((x) => `${pw('cos', 2, x.replace(/[()]/g, ''))}`).join(' + '),
    recip: names.map((x) => over(1, c(x))).join(' + '),
    cubes: names.map((x) => `${pw('cos', 3, x.replace(/[()]/g, ''))}`).join(' + '),
    shift: names.map((x) => `(${k} − ${c(x)})`).join(''),
    recipShift: names.map((x) => over(1, `${k} − ${c(x)}`)).join(' + '),
  }[ask];
  const vieta = `By Vieta, the three cosines add up to ${fr(e1)}, their products in pairs add up to ${fr(e2)}, and their product is ${fr(e3)}. `;
  const finish = {
    squares: `The sum of the squares is (sum)<sup>2</sup> − 2·(sum of pair products) = ${par(sqF(e1))} − 2·${par(e2)} = <b>${fr(ans)}</b>.`,
    recip: `Over a common denominator, the sum of the reciprocals is (sum of pair products) ÷ (product) = ${par(e2)} ÷ ${par(e3)} = <b>${fr(ans)}</b>.`,
    cubes: `The sum of the cubes is (sum)<sup>3</sup> − 3·(sum)·(sum of pair products) + 3·(product) = ${par(fm(e1, sqF(e1)))} − 3·${par(e1)}·${par(e2)} + 3·${par(e3)} = <b>${fr(ans)}</b>.`,
    shift: `Multiplying out, (x − c₁)(x − c₂)(x − c₃) = x<sup>3</sup> − (sum)x<sup>2</sup> + (pair products)x − (product). At x = ${k} this is ${k ** 3} − ${par(fm(e1, F(k * k)))} + ${par(fm(e2, K))} − ${par(e3)} = <b>${fr(ans)}</b>.`,
    recipShift: `Let P(x) = (x − c₁)(x − c₂)(x − c₃) = x<sup>3</sup> − (sum)x<sup>2</sup> + (pair products)x − (product), so that P(${k}) = ${fr(P)}. Over a common denominator, the sum is [(${k} − c₂)(${k} − c₃) + (${k} − c₁)(${k} − c₃) + (${k} − c₁)(${k} − c₂)] ÷ P(${k}). The top multiplies out to 3·${k}<sup>2</sup> − 2·${k}·(sum) + (pair products) = ${fr(dP)}. So the sum is ${fr(dP)} ÷ ${fr(P)} = <b>${fr(ans)}</b>.`,
  }[ask];
  const wrongs = {
    squares: [fa(sqF(e1), fm(F(2), e2)), fs(sqF(e1), e2), fm(F(-2), e2), sqF(e1), fd(ans, F(2)), fa(ans, ONE)],
    recip: [fd(e3, e2), fd(e1, e3), fm(F(-1), ans), fd(ONE, e3), fd(fm(F(-1), e2), fm(F(2), e3)), fa(ans, ONE), fd(e2, fm(F(2), e3))],
    cubes: [fm(F(-1), ans), fm(three, e3), e3, fs(fm(F(3), e3), fm(e1, e2)), fa(fm(e1, sqF(e1)), fm(three, e3)), fm(F(1, 2), ans), fa(e3, e1), fm(F(4), ans), fa(fs(fm(e1, sqF(e1)), fm(three, e2)), fm(three, e3))],
    shift: [fa(fa(fa(F(k ** 3), fm(e1, F(k * k))), fm(e2, K)), e3), fs(fs(F(k ** 3), fm(e2, K)), e3), fa(P, e3), fa(F(k ** 3), e3), fs(F(k ** 3), e3), fs(P, fm(F(2), e3)), fs(P, ONE)],
    recipShift: [fd(P, dP), fd(fa(fa(F(3 * k * k), fm(F(2 * k), e1)), e2), P), fd(fs(fs(F(3 * k * k), fm(F(2 * k), e1)), e2), P), fd(F(3), fs(K, fm(F(1, 3), e1))), fd(F(3), P), fd(ONE, P), dP],
  }[ask];
  return {
    topic: SUMPROD, rank: { squares: 22, recip: 23, cubes: 23, shift: 23, recipShift: 25 }[ask],
    text: `What is ${what}?`,
    answer: five(d, fq(ans), wrongs.map(fq)),
    solution: `${fam.why} ${vieta}${finish}`,
    check: () => {
      const v = fam.angles.map((a) => Math.cos(rad(a)));
      return close({
        squares: v.reduce((s, x) => s + x * x, 0), recip: v.reduce((s, x) => s + 1 / x, 0), cubes: v.reduce((s, x) => s + x ** 3, 0),
        shift: v.reduce((s, x) => s * (k - x), 1), recipShift: v.reduce((s, x) => s + 1 / (k - x), 0),
      }[ask], fv(ans));
    },
  };
};

// ======================================================================================================================
// Counting solutions of trig equations
// ======================================================================================================================
const COUNTING = 'Counting solutions of trig equations';
// intervals, in units of π
const I_2PI = { text: '0 ≤ x &lt; 2π', lo: 0, hi: 2, loC: true, hiC: false };
const I_2PIC = { text: '0 ≤ x ≤ 2π', lo: 0, hi: 2, loC: true, hiC: true };
const I_PI = { text: '0 ≤ x ≤ π', lo: 0, hi: 1, loC: true, hiC: true };
const I_4PI = { text: '0 ≤ x &lt; 4π', lo: 0, hi: 4, loC: true, hiC: false };
const inside = (I, v) => (I.loC ? v >= I.lo - 1e-12 : v > I.lo + 1e-12) && (I.hiC ? v <= I.hi + 1e-12 : v < I.hi - 1e-12);
// the solutions of f(x) = 0 in an interval, found by scanning it
const scan = (f, I, steps = 20000) => zeros(f, (I.lo - 0.001) * Math.PI, (I.hi + 0.001) * Math.PI, steps).filter((x) => { const v = x / Math.PI; return (I.loC ? v >= I.lo - 1e-6 : v > I.lo + 1e-6) && (I.hiC ? v <= I.hi + 1e-6 : v < I.hi - 1e-6); });
// exact solutions x = (p/q)π kept as a set of fractions p/q
const addTo = (set, p, q) => { const [u, v] = F(p, q); set.set(`${u}/${v}`, u / v); return set; };
const within = (set, I) => [...set.values()].filter((v) => inside(I, v)).length;
const countWrongs = (ans, list) => list.filter((n) => n >= 0 && n !== ans && Number.isInteger(n)).map((n) => fl(n));
// five whole-number choices: the slips, then near misses so there are always enough on both sides
const fiveCounts = (d, ans, slips) => five(d, fl(ans), countWrongs(ans, slips), countWrongs(ans, [ans - 1, ans + 1, ans - 2, ans + 2, ans - 3, ans + 3, ans - 4, ans + 4]));

// a polynomial in sin x or cos x: factor it, throw out the roots outside [−1, 1], and count angles for the rest
const ROOT_POOL = [[0, 1], [1, 1], [-1, 1], [1, 2], [-1, 2], [1, 3], [-1, 3], [2, 3], [-2, 3], [3, 4], [2, 1], [-2, 1], [3, 1], [-3, 1], [3, 2], [-3, 2], [4, 3], [5, 2]];
const ROOT_SETS = [];
for (let i = 0; i < ROOT_POOL.length; i++) for (let j = i + 1; j < ROOT_POOL.length; j++) {
  const has = (r) => Math.abs(fv(r)) <= 1;
  if (has(ROOT_POOL[i]) || has(ROOT_POOL[j])) ROOT_SETS.push([ROOT_POOL[i], ROOT_POOL[j]]);
  for (let k = j + 1; k < ROOT_POOL.length; k++) {
    const trio = [ROOT_POOL[i], ROOT_POOL[j], ROOT_POOL[k]], names = trio.map((r) => r.join('/')).join(' ');
    if (trio.filter(has).length >= 2 && trio.filter((r) => !has(r)).length <= 1 && names !== '0/1 1/2 2/1') ROOT_SETS.push(trio);
  }
}
// the coefficients of the product of (q·y − p), highest power first
const fromRoots = (rs) => rs.reduce((cs, [p, q]) => { const out = new Array(cs.length + 1).fill(0); cs.forEach((c, i) => { out[i] += c * q; out[i + 1] -= c * p; }); return out; }, [1]);
function polyIn(coefs, fn) {
  const n = coefs.length - 1, parts = [];
  coefs.forEach((c, i) => {
    if (!c) return;
    const pow = n - i, body = pow === 0 ? '' : pow === 1 ? `${fn} x` : pw(fn, pow), size = Math.abs(c) === 1 && pow ? '' : `${Math.abs(c)}${pow ? ' ' : ''}`;
    parts.push(`${parts.length ? (c < 0 ? ' − ' : ' + ') : c < 0 ? '−' : ''}${size}${body}`);
  });
  return parts.join('');
}
// the exact angles x/π where sin x = r or cos x = r, for the fractions that have nice ones; otherwise a count by symmetry
const anglesIn = (fn, r, I) => {
  const v = fv(r), a0 = fn === 'sin' ? Math.asin(v) : Math.acos(v), out = [];
  for (let k = -3; k <= 4; k++) for (const x of fn === 'sin' ? [a0 + 2 * k * Math.PI, Math.PI - a0 + 2 * k * Math.PI] : [a0 + 2 * k * Math.PI, -a0 + 2 * k * Math.PI]) if (inside(I, x / Math.PI) && !out.some((y) => Math.abs(y - x) < 1e-9)) out.push(x);
  return out;
};
const polyInSine = (d, ctx) => {
  const [rs, fn, I] = pick(ctx, 'polysine', [ROOT_SETS, ['sin', 'cos'], [I_2PI, I_2PIC, I_4PI]], (set) => Math.max(...fromRoots(set).map(Math.abs)) <= 40);
  const tidy = fromRoots(rs), good = rs.filter((r) => Math.abs(fv(r)) <= 1), bad = rs.filter((r) => Math.abs(fv(r)) > 1);
  const per = good.map((r) => anglesIn(fn, r, I).length), ans = per.reduce((s, n) => s + n, 0), y = `${fn} x`;
  const factors = rs.map(([p, q]) => (p === 0 ? y : `(${q === 1 ? '' : `${q} `}${y} ${p < 0 ? '+' : '−'} ${Math.abs(p)})`)).join('');
  return {
    topic: COUNTING, rank: I === I_2PI ? 10 : 11,
    text: `How many real numbers x with ${I.text} satisfy ${polyIn(tidy, fn)} = 0?`,
    answer: fiveCounts(d, ans, [rs.length, 2 * rs.length, 2 * good.length, I.hi * rs.length, ans + 1, ans - 1, good.length]),
    solution: `Factor the left side as ${factors}, so ${y} = ${listing(rs.map(fr))}.${bad.length ? ` A ${fn === 'sin' ? 'sine' : 'cosine'} is never outside [−1, 1], so ${listing(bad.map(fr))} give${bad.length === 1 ? 's' : ''} nothing.` : ''} In this interval, ${listing(good.map((r, i) => `${y} = ${fr(r)} has ${per[i]} solution${per[i] === 1 ? '' : 's'}`))}. These solutions are all different, so the total is <b>${ans}</b>.`,
    check: () => scan((x) => tidy.reduce((s, c) => s * (fn === 'sin' ? Math.sin(x) : Math.cos(x)) + c, 0), I).length === ans,
  };
};

// three terms in arithmetic progression: the outer two add up to the middle one times 2 cos dx, so the equation factors
const THREE_TERMS = [[2, 1], [3, 1], [3, 2], [4, 1], [4, 2], [4, 3], [5, 1], [5, 2], [5, 3], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5]].filter(([a, b]) => a > b);
const threeTerm = (d, ctx) => {
  const [[a, s], fn, I] = pick(ctx, 'threeterm', [THREE_TERMS, ['sin', 'cos'], [I_2PI, I_PI]]);
  const mid = (x) => `${x === 1 ? '' : x}x`, term = (x) => `${fn} ${mid(x)}`, lo = a - s, hi = a + s;
  const A = new Map(), B = new Map();
  for (let t = -4 * a; t <= 8 * a; t++) { if (fn === 'sin') addTo(A, t, a); else addTo(A, 2 * t + 1, 2 * a); }
  for (let t = -8 * s; t <= 8 * s; t++) { addTo(B, 6 * t + 2, 3 * s); addTo(B, 6 * t - 2, 3 * s); }
  const nA = within(A, I), nB = within(B, I), both = new Map([...A, ...B]), ans = within(both, I), shared = nA + nB - ans;
  return {
    topic: COUNTING, rank: 14,
    text: `How many real numbers x with ${I.text} satisfy ${term(lo)} + ${term(a)} + ${term(hi)} = 0?`,
    answer: fiveCounts(d, ans, [nA, nB, nA + nB, nA + nB + 1, 2 * a, nA + 2, ans - 2]),
    solution: `Add the outer terms first: ${term(lo)} + ${term(hi)} = 2 ${term(a)} cos ${mid(s)}. So the equation is ${term(a)}(1 + 2 cos ${mid(s)}) = 0. In this interval ${term(a)} = 0 has ${nA} solutions, and cos ${mid(s)} = −½ has ${nB}, one each time ${mid(s)} lands on 120° or 240° around the circle. ${shared ? `Exactly ${shared} of these ${shared === 1 ? 'is' : 'are'} counted in both lists, so the total is ${nA} + ${nB} − ${shared} = <b>${ans}</b>.` : `No solution is on both lists, so the total is ${nA} + ${nB} = <b>${ans}</b>.`}`,
    check: () => { const f = fn === 'sin' ? Math.sin : Math.cos; return scan((x) => f(lo * x) + f(a * x) + f(hi * x), I).length === ans; },
  };
};

// sin ax = sin bx or sin ax = cos bx: two families of solutions, some of which may coincide
const ABS = [];
for (let a = 2; a <= 9; a++) for (let b = 1; b < a; b++) ABS.push([a, b]);
const sinEqualsSin = (d, ctx) => {
  const [[a, b], form, I] = pick(ctx, 'sinsin', [ABS, ['same', 'cross'], [I_2PI, I_PI]]);
  const X = (n) => `${n === 1 ? '' : n}x`, A = new Map(), B = new Map(), R = 40;
  for (let t = -R; t <= R; t++) {
    if (form === 'same') { addTo(A, 2 * t, a - b); addTo(B, 2 * t + 1, a + b); } else { addTo(A, 4 * t + 1, 2 * (a - b)); addTo(B, 4 * t + 1, 2 * (a + b)); }
  }
  const nA = within(A, I), nB = within(B, I), ans = within(new Map([...A, ...B]), I), shared = nA + nB - ans;
  const rhs = form === 'same' ? `sin ${X(b)}` : `cos ${X(b)}`;
  const fams = form === 'same'
    ? `${X(a)} = ${X(b)} + 2πk, which is ${X(a - b)} = 2πk, or ${X(a)} = π − ${X(b)} + 2πk, which is ${X(a + b)} = π + 2πk`
    : `${X(a)} = (π/2 − ${X(b)}) + 2πk, which is ${X(a + b)} = π/2 + 2πk, or ${X(a)} = π − (π/2 − ${X(b)}) + 2πk, which is ${X(a - b)} = π/2 + 2πk`;
  const [first, second, c1, c2] = form === 'same' ? [`${X(a - b)} = 2πk`, `${X(a + b)} = π + 2πk`, nA, nB] : [`${X(a - b)} = π/2 + 2πk`, `${X(a + b)} = π/2 + 2πk`, nA, nB];
  return {
    topic: COUNTING, rank: form === 'same' ? 13 : 14,
    text: `How many real numbers x with ${I.text} satisfy sin ${X(a)} = ${rhs}?`,
    answer: fiveCounts(d, ans, [nA + nB, nA + nB + 1, 2 * a, a + b, a * b, nB, ans + 2]),
    solution: `${form === 'same' ? '' : `Since cos ${X(b)} = sin(π/2 − ${X(b)}), this is an equation between two sines. `}Two sines are equal exactly when ${fams}, for an integer k. In this interval ${first} gives ${c1} value${c1 === 1 ? '' : 's'} of x, and ${second} gives ${c2}. ${shared ? `Exactly ${shared} of them ${shared === 1 ? 'is' : 'are'} on both lists, so the total is ${c1} + ${c2} − ${shared} = <b>${ans}</b>.` : `None of them is on both lists, so the total is ${c1} + ${c2} = <b>${ans}</b>.`}`,
    check: () => scan((x) => Math.sin(a * x) - (form === 'same' ? Math.sin(b * x) : Math.cos(b * x)), I).length === ans,
  };
};

// a tall fast wave against a low slow one: every run of the fast wave crosses the slow one once
const WAVES = [];
for (const k of [2, 3, 4, 5, 6]) for (const A of [4, 5, 6, 7, 8, 9]) for (const B of [1, 2, 3, 4, 5]) for (const C of [-3, -2, -1, 1, 2, 3]) if (Math.abs(B) + Math.abs(C) < A && !(k === 3 && A === 5 && B === 3 && C === 1)) WAVES.push([k, A, B, C]);
const dominantWave = (d, ctx) => {
  const [[k, A, B, C], I] = pick(ctx, 'waves', [WAVES, [I_2PI, I_PI, I_4PI]]);
  const runs = k * I.hi, ans = runs, span = Math.abs(B) + Math.abs(C);
  return {
    topic: COUNTING, rank: 15,
    text: `How many real numbers x with ${I.text} satisfy ${A} cos ${k}x = ${coef(B, 'sin x')} ${C < 0 ? '−' : '+'} ${Math.abs(C)}?`,
    answer: fiveCounts(d, ans, [k, 2 * k, 4 * k, runs + 1, runs - 1, 2 * runs, k + I.hi]),
    solution: `Compare the two sides as graphs. The right side is a slow wave that stays between −${span} and ${span}, because |${coef(B, 'sin x')} ${C < 0 ? '−' : '+'} ${Math.abs(C)}| ≤ ${B} + ${Math.abs(C)}. The left side swings all the way between ${A} and −${A}, and ${span} &lt; ${A}. In this interval, cos ${k}x runs from one extreme to the other ${runs} times, since each run takes π/${k} of x. So the left side starts each run on one side of the slow wave and ends it on the other, and it crosses exactly once, because it is far steeper wherever the two are close. So there are ${runs} crossings, and the answer is <b>${ans}</b>.`,
    check: () => scan((x) => A * Math.cos(k * x) - B * Math.sin(x) - C, I).length === ans,
  };
};

// a wave against a line or a decaying curve: count the humps, and how many times each one is crossed
const BASES = [[2, 3], [3, 4], [4, 5], [5, 6]];
const WAVE_FORMS = [...[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].flatMap((N) => [['line', N, 0], ['abs', N, 0]]), ...BASES.flatMap((b) => [5, 6, 7, 8, 9, 10].map((U) => ['decay', U, b]))];
const lineAndWave = (d, ctx) => {
  const [[form, N, b]] = pick(ctx, 'linewave', [WAVE_FORMS]);
  const later = Math.floor((N - 1) / 2), humps = Math.ceil(N / 2);
  const ans = { line: 3 + 4 * later, abs: 2 * N, decay: 2 * humps }[form];
  const B = form === 'decay' ? `(${fr(b)})<sup>x</sup>` : '';
  const text = {
    line: `How many real numbers x satisfy sin(πx) = ${over('x', N)}?`,
    abs: `How many real numbers x satisfy |sin(πx)| = ${over('x', N)}?`,
    decay: `How many real numbers x with 0 &lt; x &lt; ${N}π satisfy sin x = ${B}?`,
  }[form];
  const slips = { line: [2 * N, 2 * N + 1, 1 + 2 * later, 2 + 4 * later, 1 + 4 * later, N], abs: [N, 2 * N - 1, 2 * N + 1, N + 1, 4 * N], decay: [N, 2 * N, humps, 2 * N - 2, ans + 2, ans - 2] }[form];
  return {
    topic: COUNTING, rank: { line: 17, abs: 16, decay: 13 }[form],
    text,
    answer: fiveCounts(d, ans, slips),
    solution: {
      line: `Both sides change sign with x, so solutions come in pairs ±x, with x = 0 on its own. For x &gt; 0 the line is positive, so it can only meet the curve where sin(πx) is positive: on the humps (0, 1), (2, 3), (4, 5), and so on. On a hump the curve bends downward and the line is straight, so they cross at most twice. On (0, 1) they start together at 0, the curve is steeper and rises above the line, and it comes back down to 0 at x = 1, which makes 1 crossing. On a later hump starting at an even number below ${N}, the curve starts below the line, its top (height 1) is above the line, and it ends below, which makes 2 crossings. There are ${later} such humps. A hump starting at ${N} or later stays under the line, because from x = ${N} on the line is at least 1. So there are 1 + 2·${later} = ${1 + 2 * later} solutions with x &gt; 0, the same number with x &lt; 0, and x = 0, for a total of <b>${ans}</b>.`,
      abs: `The left side is never negative, so x ≥ 0, and x = 0 is a solution. The graph of |sin(πx)| is a hump over each interval from one whole number to the next, of height 1, and it bends downward, so the straight line meets a hump at most twice. On (0, 1) they start together at 0, the curve rises above the line and comes back to 0, which makes 1 crossing. On each interval (m, m + 1) with m = 1, 2, ⋯, ${N - 1}, the curve starts below the line, its top is above the line because m + ½ &lt; ${N}, and it ends below, which makes 2 crossings. From x = ${N} on, the line is at least 1 and the curve is below it. So the total is 1 + 1 + 2·${N - 1} = <b>${ans}</b>.`,
      decay: `The right side is positive, so sin x must be positive, which happens on the humps (0, π), (2π, 3π), and so on. There are ${humps} of these in the interval${N % 2 ? ', the last one ending exactly at the end of the interval' : ''}. On each hump, ${B} is above sin x at both ends (where the sine is 0) and below it at the top (where the sine is 1, and ${B} is less than 1). That makes at least 2 crossings. The sine bends downward and ${B} bends upward, so there are no more than 2. So the total is 2·${humps} = <b>${ans}</b>.`,
    }[form],
    check: () => {
      if (form === 'decay') { const base = fv(b); return zeros((x) => Math.sin(x) - base ** x, 1e-9, N * Math.PI, 40000).length === ans; }
      const f = form === 'line' ? (x) => Math.sin(Math.PI * x) - x / N : (x) => Math.abs(Math.sin(Math.PI * x)) - x / N;
      return zeros(f, -N - 1.13, N + 1.17, 40000).length === ans;
    },
  };
};

// how many integers c make P cos 2x + a sin x = c have exactly 2 (or 4) solutions: a parabola in s = sin x, and each s
// inside (−1, 1) is two angles
const EXACT_CASES = [[1, 1], [1, 2], [1, 3], [2, 2], [2, 4], [2, 6], [3, 3], [3, 6], [3, 9], [4, 4], [4, 8], [4, 12], [6, 12]].flatMap(([P, a]) => [['two', P, a], ['four', P, a]]).filter(([ask, P, a]) => {
  const peak = P + (a * a) / (8 * P), low = a - P;
  return ask === 'two' || Math.ceil(peak) - 1 > low;
});
const exactCount = (d, ctx) => {
  const [[ask, P, a]] = pick(ctx, 'exactcount', [EXACT_CASES]);
  const peak = F(8 * P * P + a * a, 8 * P), lowEnd = -a - P, highEnd = a - P, peakWhole = peak[1] === 1, between = highEnd - lowEnd - 1;
  const fours = Math.ceil(fv(peak)) - highEnd - 1, ans = ask === 'two' ? between + (peakWhole ? 1 : 0) : fours;
  const p2 = `${P === 1 ? '' : `${P} `}cos 2x`, eq = `${p2} + ${coef(a, 'sin x')} = c`;
  const parabola = `${P} − ${2 * P}s<sup>2</sup> + ${a === 1 ? '' : a}s`;
  const common = `Let s = sin x, so cos 2x = 1 − 2s<sup>2</sup> and the left side becomes g(s) = ${parabola}. On 0 ≤ x &lt; 2π, each s strictly between −1 and 1 comes from two values of x, and s = ±1 from one. The parabola g opens downward with its top at s = ${fr(F(a, 4 * P))}, where g = ${fr(peak)}. At the ends, g(−1) = ${num(lowEnd, 0)} and g(1) = ${num(highEnd, 0)}. `;
  return {
    topic: COUNTING, rank: ask === 'two' ? (peakWhole ? 20 : 19) : 19,
    text: `For how many integers c does the equation ${eq} have exactly ${ask === 'two' ? 'two' : 'four'} solutions x with 0 ≤ x &lt; 2π?`,
    answer: fiveCounts(d, ans, ask === 'two' ? [between, between + 1, between + 2, 2 * a, a, between - 1, between + 3] : [ans + 1, ans + 2, ans - 1, Math.ceil(fv(peak)) - highEnd, a]),
    solution: common + (ask === 'two'
      ? `If c is strictly between ${num(lowEnd, 0)} and ${num(highEnd, 0)}, exactly one s in (−1, 1) works (the other root of the parabola is above 1), which gives two values of x. ${between === 1 ? 'There is 1 such integer' : `There are ${between} such integers`}. If c = ${num(highEnd, 0)}, then s = 1 works and so does another s inside (−1, 1), which makes three values of x. If c is above ${num(highEnd, 0)} and below the top, two values of s work, which makes four. At the top itself there is one s, which makes two values of x${peakWhole ? `, and the top, ${fr(peak)}, is an integer, so it counts as well. The total is ${between} + 1 = <b>${ans}</b>.` : `, but the top, ${fr(peak)}, is not an integer. So the answer is <b>${ans}</b>.`}`
      : `Four solutions need two different values of s strictly inside (−1, 1). That happens exactly when c is above g(1) = ${num(highEnd, 0)} and below the top ${fr(peak)}, since a smaller c leaves one root outside [−1, 1]. The integers strictly between ${num(highEnd, 0)} and ${fr(peak)} number <b>${ans}</b>.`),
    check: () => {
      let n = 0;
      for (let c = lowEnd - 2; c <= Math.ceil(fv(peak)) + 2; c++) if (scan((x) => P * Math.cos(2 * x) + a * Math.sin(x) - c, I_2PI, 3000).length === (ask === 'two' ? 2 : 4)) n++;
      return n === ans;
    },
  };
};

// tan kx against a slow curve: one crossing on each full branch, and the two part-branches at the ends need a look
const SLOW = [
  { text: 'cos(x/2)', f: (x) => Math.cos(x / 2), slope: '½', plus: false },
  { text: 'sin(x/2)', f: (x) => Math.sin(x / 2), slope: '½', plus: false },
  { text: 'cos x', f: Math.cos, slope: '1', plus: false },
  { text: 'sin x', f: Math.sin, slope: '1', plus: false },
  { text: '−cos(x/2)', f: (x) => -Math.cos(x / 2), slope: '½', plus: true },
];
const tanVsWave = (d, ctx) => {
  const [g, k, m] = pick(ctx, 'tanwave', [SLOW, [2, 3, 4, 5], [1, 2]], (c, kk, mm) => !(c.text === 'cos(x/2)' && kk === 2 && mm === 2));
  const snap = (v) => (Math.abs(v) < 1e-12 ? 0 : v), g0 = snap(g.f(0)), gEnd = snap(g.f(m * Math.PI)), first = g0 >= 0, last = gEnd <= 0;
  const full = m * k - 1, ans = full + (first ? 1 : 0) + (last ? 1 : 0), end = m === 1 ? 'π' : '2π';
  const eq = g.plus ? `tan ${k}x + ${g.text.slice(1)} = 0` : `tan ${k}x = ${g.text}`, name = g.plus ? 'y = −cos(x/2)' : `y = ${g.text}`;
  return {
    topic: COUNTING, rank: 19,
    text: `How many real numbers x with 0 ≤ x ≤ ${end} satisfy ${eq}?`,
    answer: fiveCounts(d, ans, [full, full + 1, full + 2, 2 * k * m, k * m, 2 * k, full + 3]),
    solution: `${g.plus ? `Rewrite the equation as tan ${k}x = ${g.text}. ` : ''}Compare y = tan ${k}x with ${name}, whose slope is at most ${g.slope} in size. The tangent has vertical asymptotes at x = π/${2 * k}, 3π/${2 * k}, and so on, ${m * k} of them in this interval. Between two neighboring asymptotes it climbs from −∞ to +∞ with slope at least ${k}, so it crosses the slow curve exactly once. That gives ${full} crossings on the ${full} full branches. On the first part-branch, the tangent climbs from 0 at x = 0 to +∞, so it crosses the curve exactly when the curve starts at 0 or above, and here it starts at ${num(g0, 0)}, so ${first ? 'it does' : 'it does not'}. On the last part-branch, the tangent climbs from −∞ to 0 at x = ${end}, so it crosses the curve exactly when the curve ends at 0 or below, and here it ends at ${num(gEnd, 0)}, so ${last ? 'it does' : 'it does not'}. The total is <b>${ans}</b>.`,
    check: () => scan((x) => Math.sin(k * x) - g.f(x) * Math.cos(k * x), { lo: 0, hi: m, loC: true, hiC: true }, 30000).length === ans,
  };
};

// sin²x + sin²2x + ⋯ + sin²mx = m/2: double angles, a telescoping sum, then two families that overlap
const SQUARE_EQS = [2, 3, 4, 5, 6, 7];
const squaresEquation = (d, ctx) => {
  const [m, fn, I] = pick(ctx, 'sqeq', [SQUARE_EQS, ['sin', 'cos'], [I_2PI, I_PI]]);
  const X = (n) => `${n === 1 ? '' : n}x`, A = new Map(), B = new Map();
  for (let t = -60; t <= 60; t++) { if (t % m !== 0) addTo(A, t, m); addTo(B, 2 * t + 1, 2 * (m + 1)); }
  const nA = within(A, I), nB = within(B, I), ans = within(new Map([...A, ...B]), I), shared = nA + nB - ans;
  const asked = series(1, 1, m, (j) => pw(fn, 2, X(j))), half = fr(F(m, 2));
  const cosines = series(1, 1, m, (j) => `cos ${X(2 * j)}`);
  return {
    topic: COUNTING, rank: 22,
    text: `How many real numbers x with ${I.text} satisfy ${asked} = ${half}?`,
    answer: fiveCounts(d, ans, [nA + nB, nB, nA, nA + nB + 2, ans + (I.hi === 2 ? 2 : 1), 2 * m, 4 * m, ans + 2]),
    solution: `Use ${pw(fn, 2)} = (1 ${fn === 'sin' ? '−' : '+'} cos 2x)/2 on every term: the equation becomes ${cosines} = 0. If sin x = 0, every cosine here is 1, so such an x is not a solution. Otherwise multiply by 2 sin x. Since 2 sin x cos 2jx = sin(2j + 1)x − sin(2j − 1)x, the sum telescopes to sin ${X(2 * m + 1)} − sin x = 2 cos ${X(m + 1)} sin ${X(m)}. So either cos ${X(m + 1)} = 0 or sin ${X(m)} = 0 with sin x ≠ 0. In this interval, cos ${X(m + 1)} = 0 has ${nB} solutions, and sin ${X(m)} = 0 has ${nA} solutions that are not multiples of π. ${shared ? `Of these, ${shared} ${shared === 1 ? 'is' : 'are'} on both lists, so the total is ${nA} + ${nB} − ${shared} = <b>${ans}</b>.` : `No solution is on both lists, so the total is ${nA} + ${nB} = <b>${ans}</b>.`}`,
    check: () => scan((x) => { let t = -m / 2; for (let j = 1; j <= m; j++) t += (fn === 'sin' ? Math.sin(j * x) : Math.cos(j * x)) ** 2; return t; }, I).length === ans,
  };
};

// cos(aπ sin x) = cos(aπ cos x) and sin(aπ sin x) = cos(aπ cos x): the angles differ by a multiple of 2π, so sin x ± cos x
// takes only certain values, and a solution of both families would be counted twice
const NESTED = [...[2, 3, 4, 5, 6, 7].map((a) => ['same', a]), ...[2, 3, 4, 5, 6].map((a) => ['cross', a])];
const nestedCos = (d, ctx) => {
  const [[form, a]] = pick(ctx, 'nested', [NESTED]);
  const A = `${a}π`;
  let values = [], overlap = 0;
  if (form === 'same') {
    const K = Math.floor(a / Math.SQRT2);
    for (let k = -K; k <= K; k++) values.push(k);
    for (const k of values) for (const l of values) if (2 * (k * k + l * l) === a * a) overlap++;
  } else {
    for (let n = -3 * a * 4 + 1; n <= 12 * a; n += 4) if (n * n < 8 * a * a) values.push(n);
    for (const n1 of values) for (const n2 of values) if (n1 * n1 + n2 * n2 === 8 * a * a) overlap++;
  }
  const V = values.length, ans = 4 * V - overlap;
  const shown = form === 'same' ? `2k/${a}` : `(4k + 1)/${2 * a}`;
  const lhs = form === 'same' ? `cos(${A} sin x)` : `sin(${A} sin x)`;
  const start = form === 'same'
    ? `Two cosines are equal exactly when the sum or the difference of the angles is a multiple of 2π. Dividing by ${a}π, this says sin x − cos x = 2k/${a} or sin x + cos x = 2k/${a} for an integer k.`
    : `Since sin y = cos(π/2 − y), this is cos(π/2 − ${A} sin x) = cos(${A} cos x). Two cosines are equal exactly when the sum or the difference of the angles is a multiple of 2π. Dividing by ${a}π and tidying up, this says sin x − cos x = (4k + 1)/${2 * a} or sin x + cos x = (4k + 1)/${2 * a} for an integer k.`;
  const range = form === 'same'
    ? `The value 2k/${a} must lie within ±√2, so |k| ≤ ${Math.floor(a / Math.SQRT2)}, which makes ${V} values.`
    : `The value (4k + 1)/${2 * a} must lie within ±√2, which allows 4k + 1 = ${listing(values.map((n) => num(n, 0)))}, ${V} values.`;
  const ending = form === 'same'
    ? (overlap
      ? `A solution of both kinds has v = sin x − cos x and w = sin x + cos x with v<sup>2</sup> + w<sup>2</sup> = 2, which with v = 2k/${a} and w = 2l/${a} means k<sup>2</sup> + l<sup>2</sup> = ${a * a / 2}. That has ${overlap} solutions, at x = 0, π/2, π and 3π/2, each counted twice. So the total is ${4 * V} − ${overlap} = <b>${ans}</b>.`
      : `A solution of both kinds would need v<sup>2</sup> + w<sup>2</sup> = 2 for v = sin x − cos x and w = sin x + cos x, which with v = 2k/${a} and w = 2l/${a} means 2(k<sup>2</sup> + l<sup>2</sup>) = ${a * a}. The right side is odd, so this never happens, and the total is <b>${ans}</b>.`)
    : `A solution of both kinds would need v<sup>2</sup> + w<sup>2</sup> = 2 for v = sin x − cos x and w = sin x + cos x, which here means that two odd squares add up to ${8 * a * a}. Two odd squares add up to 2 more than a multiple of 8, so this never happens, and the total is <b>${ans}</b>.`;
  return {
    topic: COUNTING, rank: overlap ? 24 : 23,
    text: `How many real numbers x with 0 ≤ x &lt; 2π satisfy ${lhs} = cos(${A} cos x)?`,
    answer: fiveCounts(d, ans, [4 * V, 2 * V, 4 * V - 4, 4 * V + 4, 2 * V + 2, 8 * a, 4 * a, 2 * V + 1]),
    solution: `${start} Now sin x − cos x = √2 sin(x − 45°) and sin x + cos x = √2 sin(x + 45°) both run over the whole range from −√2 to √2, and each value strictly inside is taken exactly twice on 0 ≤ x &lt; 2π. ${range} So each of the two equations has ${2 * V} solutions, ${4 * V} in all. ${ending}`,
    check: () => scan((x) => (form === 'same' ? Math.cos(a * Math.PI * Math.sin(x)) : Math.sin(a * Math.PI * Math.sin(x))) - Math.cos(a * Math.PI * Math.cos(x)), I_2PI, 30000).length === ans,
  };
};

// ======================================================================================================================
// Law of sines and cosines
// ======================================================================================================================
const LAWS = 'Law of sines and cosines';
const heron = (a, b, c) => { const s = (a + b + c) / 2; return Math.sqrt(s * (s - a) * (s - b) * (s - c)); };
// the angle at the corner opposite side x, from coordinates
const opposite = (x, y, z) => { const { A, B, C } = corners(x, y, z); return angle(A, B, C); };

// the sines of the angles are in the same ratio as the sides
const SINE_TRIPLES = [];
for (let p = 2; p <= 13; p++) for (let q = p + 1; q <= 14; q++) for (let r = q + 1; r <= 15; r++) if (r < p + q && gcd(gcd(p, q), r) === 1) SINE_TRIPLES.push([p, q, r]);
const HERON_SIDES = [[3, 4, 5], [5, 12, 13], [13, 14, 15], [4, 13, 15], [8, 15, 17], [7, 15, 20], [9, 10, 17], [11, 13, 20], [7, 24, 25], [10, 17, 21]];
const sineRatio = (d, ctx) => {
  const ask = ctx.k % 2 ? 'cos' : 'area', turn = { ...ctx, k: Math.floor(ctx.k / 2) };
  if (ask === 'area') {
    const [[p, q, r], m] = pick(turn, 'sine-area', [HERON_SIDES, [1, 2, 3, 4]]);
    const a = p * m, b = q * m, c = r * m, per = a + b + c, K = Math.round(heron(a, b, c)), S = per / 2;
    return {
      topic: LAWS, rank: 7,
      text: `In triangle ABC, sin A : sin B : sin C = ${p} : ${q} : ${r}, and the perimeter is ${per}. What is the area of the triangle?`,
      answer: five(d, fl(K), [K * 2, Math.round(heron(p, q, r)), K / 2, a * b / 2, Math.round(heron(p, q, r)) * m, b * c / 2, per, a * c / 2, S, 3 * K, 2 * per].map((v) => fl(2 * v, 2))),
      solution: `By the law of sines, a : b : c = sin A : sin B : sin C, so the sides are ${p}k, ${q}k and ${r}k. The perimeter gives ${p + q + r}k = ${per}, so k = ${m} and the sides are ${a}, ${b} and ${c}. By Heron’s formula with s = ${S}, the area is √(${S}·${S - a}·${S - b}·${S - c}) = <b>${num(K, 0)}</b>.`,
      check: () => { const { A, B, C } = corners(a, b, c); return close(shoelace([A, B, C]), K) && close(Math.sin(angle(A, B, C)) / a, Math.sin(angle(B, A, C)) / b); },
    };
  }
  const [[p, q, r]] = pick(turn, 'sine-cos', [SINE_TRIPLES]);
  const ans = F(p * p + q * q - r * r, 2 * p * q), other = F(q * q + r * r - p * p, 2 * q * r), third = F(p * p + r * r - q * q, 2 * p * r);
  return {
    topic: LAWS, rank: 10,
    text: `In triangle ABC, sin A : sin B : sin C = ${p} : ${q} : ${r}. What is the cosine of the largest angle of the triangle?`,
    answer: five(d, fq(ans), unit([other, third, fm(F(-1), ans), F(p * p + q * q - r * r, p * q), F(p * p + q * q + r * r, 4 * p * q), F(r, p + q), F(p, r), F(p * p + q * q, 2 * r * r)].map(fq))),
    solution: `By the law of sines, the sides are in the same ratio as the sines, so take them to be ${p}k, ${q}k and ${r}k. The largest angle is C, opposite the longest side. The law of cosines gives cos C = (${p * p} + ${q * q} − ${r * r})k<sup>2</sup> ÷ (2·${p}·${q}k<sup>2</sup>) = <b>${fr(ans)}</b>.`,
    check: () => close(Math.cos(opposite(r, p, q)), fv(ans)),
  };
};

// side lengths in arithmetic progression and the cosine of the largest angle: the law of cosines factors
const AP_COS = [[-1, 2], [-1, 4], [1, 8], [1, 5], [1, 4], [-1, 8], [1, 10], [0, 1], [-1, 3], [1, 3], [-1, 5]];
const apSides = (d, ctx) => {
  const [t, base, ask] = pick(ctx, 'apsides', [AP_COS, [3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20], ['perimeter', 'largest', 'area']], (c, a, w) => {
    const g = fm(fs(ONE, fm(F(2), c)), F(a, 3));
    return g[1] <= 2 && !(c[0] === -1 && c[1] === 2 && a === 6) && (w !== 'area' || (g[1] === 1));
  });
  const a = F(base), dd = fm(fs(ONE, fm(F(2), t)), F(base, 3)), b = fa(a, dd), c = fa(b, dd), per = fa(fa(a, b), c);
  const isRight = t[0] === 0, sin2 = fs(ONE, sqF(t)), coef = fm(F(1, 2), fm(a, b)), area = (() => { const [x, y] = fm(sqF(coef), sin2); return rootF([x, y]); })();
  const slip = fm(fa(ONE, fm(F(2), t)), F(base, 3)), per2 = fa(F(3 * base), fm(F(3), slip));   // the wrong sign on the cosine term
  const ans = { perimeter: fq(per), largest: fq(c), area }[ask];
  const wrongs = {
    perimeter: [fq(c), fq(fa(a, b)), fq(per2), fq(F(3 * base)), fq(fa(per, dd)), fq(fm(F(2), c)), fq(fa(per, F(base))), fq(fm(F(1, 2), per))],
    largest: [fq(b), fq(fa(c, dd)), fq(fa(a, slip)), fq(fa(fa(a, slip), slip)), fq(fm(F(2), a)), fq(per), fq(fm(F(1, 2), per)), fq(fa(a, fm(F(1, 2), dd)))],
    area: pos([fq(fm(F(1, 2), fm(a, b))), fq(fm(a, b)), fq(fm(F(1, 2), fm(a, c))), fq(fm(F(1, 2), fm(b, c))), fq(fm(a, c)), rootF(fm(sqF(fm(a, c)), fm(F(1, 4), sin2))), rootF(fm(sqF(fm(b, c)), fm(F(1, 4), sin2))), rootF(fm(sqF(fm(a, b)), sin2)), rootF(fm(sqF(fm(F(1, 2), fm(a, b))), fm(F(1, 2), sin2)))]),
  }[ask];
  const what = { perimeter: 'the perimeter of the triangle', largest: 'the length of its longest side', area: 'the area of the triangle' }[ask];
  const angleText = t[0] === -1 && t[1] === 2 ? 'Its largest angle measures 120°' : `The cosine of its largest angle is ${fr(t)}`;
  const nice = t[0] === -1 && t[1] === 2 ? fr(t) + ' (the cosine of 120°)' : fr(t);
  return {
    topic: LAWS, rank: ask === 'area' ? 15 : 14,
    text: `The side lengths of a triangle form an arithmetic progression, and its shortest side is ${base}. ${angleText}. What is ${what}?`,
    answer: five(d, ans, pos(wrongs)),
    solution: `Call the sides a = ${base}, a + d and a + 2d. The largest angle is opposite a + 2d and its cosine is t = ${nice}, so the law of cosines says (a + 2d)<sup>2</sup> = a<sup>2</sup> + (a + d)<sup>2</sup> − 2t·a(a + d). Tidying up gives (1 − 2t)a<sup>2</sup> − (2 + 2t)ad − 3d<sup>2</sup> = 0, which factors as ((1 − 2t)a − 3d)(a + d) = 0. Since a + d is positive, d = (1 − 2t)a/3 = ${fr(dd)}. So the sides are ${base}, ${fr(b)} and ${fr(c)}. `
      + {
        perimeter: `The perimeter is <b>${fr(per)}</b>.`,
        largest: `The longest side is <b>${fr(c)}</b>.`,
        area: `The area is ½·${base}·${fr(b)}·sin C${isRight ? ` with sin C = 1, which is <b>${ans[1]}</b>.` : `, where sin C = √(1 − ${par(sqF(t))}) = ${rootF(sin2)[1]}. That comes to <b>${ans[1]}</b>.`}`,
      }[ask],
    check: () => {
      const tv = fv(t), dn = root((x) => Math.cos(opposite(base + 2 * x, base, base + x)) - tv, 1e-6, base * (1 - 1e-6));
      const [x, y, z] = [base, base + dn, base + 2 * dn];
      return close({ perimeter: x + y + z, largest: z, area: heron(x, y, z) }[ask], ans[0], 1e-6);
    },
  };
};

// the bisector of a 60°, 90° or 120° angle: two small triangles add up to the big one
const BISECT_ANGLES = [[120, 1], [60, 3], [90, 2]];
const bisectorLength = (d, ctx) => {
  const [[A, r], [b, c]] = pick(ctx, 'bisector', [BISECT_ANGLES, [[3, 6], [4, 12], [6, 12], [5, 20], [10, 15], [6, 3], [12, 4], [2, 6], [3, 5], [5, 7], [7, 9], [4, 5], [8, 24], [15, 30]]]);
  const top = b * c, sum = b + c;
  // AD = k·bc/(b + c), with k = 2cos(A/2) = 1, √3 or √2
  const ans = r === 1 ? fl(top, sum) : fracSurd(top, sum, r);
  const scale = (p, q) => (r === 1 ? fl(p, q) : fracSurd(p, q, r));
  const wrongs = [fl(2 * top, sum), scale(2 * top, sum), fl(top, sum), fl(sum, 2), rootF(F(top)), scale(top, 2 * sum), fl(sum, 3), scale(top, 3 * sum)];
  const half = { 120: '60°', 60: '30°', 90: '45°' }[A], s1 = { 120: '√3/2', 60: '√3/2', 90: '1' }[A], s2 = { 120: '√3/2', 60: '½', 90: '√2/2' }[A];
  return {
    topic: LAWS, rank: 14,
    text: `In triangle ABC, ∠A = ${A}°, AB = ${b} and AC = ${c}. The bisector of angle A meets BC at D. What is the length of AD?`,
    answer: five(d, ans, pos(wrongs)),
    solution: `Triangles ABD and ACD fill triangle ABC, and each has angle ${half} at A. With AD = t, the areas say ½·${b}·t·sin ${half} + ½·${c}·t·sin ${half} = ½·${b}·${c}·sin ${A}°. So ${sum}·t·${s2} = ${top}·${s1}, and t = <b>${ans[1]}</b>.`,
    check: () => {
      const a = rad(A), B = [b, 0], C = [c * Math.cos(a), c * Math.sin(a)];   // no formula for D: slide along BC until the angles at A match
      const tD = root((m) => { const D = [B[0] + m * (C[0] - B[0]), B[1] + m * (C[1] - B[1])]; return angle([0, 0], B, D) - angle([0, 0], D, C); }, 1e-9, 1 - 1e-9);
      const D = [B[0] + tD * (C[0] - B[0]), B[1] + tD * (C[1] - B[1])];
      return close(Math.hypot(D[0], D[1]), ans[0]);
    },
  };
};

// two sides and the angle opposite the shorter one: two triangles exactly when the side swings between the height and b
const SSA_ANGLES = [[30, F(1, 2), '30°'], [45, null, '45°'], [60, null, '60°'], [Math.asin(0.6) * 180 / Math.PI, F(3, 5), null], [Math.asin(0.8) * 180 / Math.PI, F(4, 5), null], [Math.asin(5 / 13) * 180 / Math.PI, F(5, 13), null]];
const ssaCount = (d, ctx) => {
  const [[A, sn, label], b] = pick(ctx, 'ssa', [SSA_ANGLES, [10, 12, 13, 15, 20, 24, 25, 26, 30, 35, 39, 40, 50]], (x, v) => !x[1] || (v * x[1][0]) % x[1][1] === 0);
  const h = b * Math.sin(rad(A)), whole = Number.isInteger(Math.round(h * 1e6) / 1e6), low = Math.floor(h + 1e-9) + 1, ans = b - low;
  const given = label ? `∠A = ${label}` : `∠A is acute with sin A = ${fr(sn)}`;
  const hText = sn ? `${b}·${fr(sn)} = ${num(h, 0)}` : `${b} sin ${label} ≈ ${num(h, 2)}`;
  return {
    topic: LAWS, rank: 15,
    text: `In triangle ABC, ${given} and AC = ${b}. For how many integer values of BC are there exactly two different triangles ABC?`,
    answer: fiveCounts(d, ans, [ans + 1, ans + 2, b - 1, b, Math.floor(b / 2), ans - 1]),
    solution: `Put A and C in place and think of B on the ray from A. The distance from C to the ray is the height h = AC sin A = ${hText}. A circle around C with radius BC misses the ray if BC &lt; h, touches it once if BC = h, and crosses it at two points on the ray’s side of A exactly when h &lt; BC &lt; AC. If BC ≥ ${b} only one crossing is on the ray. So BC must be an integer with ${num(h, whole ? 0 : 2)} &lt; BC &lt; ${b}, that is ${ans === 1 ? low : ans === 2 ? `${low} and ${b - 1}` : `${low}, ${low + 1}, ⋯, ${b - 1}`}. That makes <b>${ans}</b> value${ans === 1 ? '' : 's'}.`,
    check: () => {
      // for each integer BC, count the points B on the ray by solving BC² = AB² + b² − 2·AB·b·cos A numerically
      let n = 0;
      for (let a = 1; a <= 2 * b; a++) { const rs = zeros((c) => c * c + b * b - 2 * b * c * Math.cos(rad(A)) - a * a, 1e-6, 4 * b, 4000); if (rs.length === 2 && rs[1] - rs[0] > 1e-3) n++; }
      return n === ans;
    },
  };
};

// a cyclic quadrilateral: opposite angles add up to 180°, so the two laws of cosines for diagonal AC share cos B
const CYCLIC = [];
for (let a = 2; a <= 9; a++) for (let b = 2; b <= 9; b++) for (let c = 2; c <= 9; c++) for (let e = 2; e <= 9; e++) {
  const big = Math.max(a, b, c, e), cos = F(a * a + b * b - c * c - e * e, 2 * (a * b + c * e));
  if (2 * big < a + b + c + e - 1 && cos[1] <= 24 && cos[0] !== 0 && Math.abs(fv(cos)) < 0.9 && !(a === b && c === e)) CYCLIC.push([a, b, c, e]);
}
const cyclicQuad = (d, ctx) => {
  const [[a, b, c, e], ask] = pick(ctx, 'cyclic', [CYCLIC, ['cos', 'diag', 'area']]);
  const m = a * b + c * e, cos = F(a * a + b * b - c * c - e * e, 2 * m), ac2 = fs(F(a * a + b * b), fm(F(2 * a * b), cos)), sin2 = fs(ONE, sqF(cos));
  const area = rootF(fm(F(m * m, 4), sin2)), ans = { cos: fq(cos), diag: rootF(ac2), area }[ask];
  const what = { cos: 'cos B', diag: 'the length of diagonal AC', area: 'the area of ABCD' }[ask];
  const slipCos = F(a * a + b * b - c * c - e * e, 2 * (a * b - c * e || 1));
  const wrongs = {
    cos: unit([fm(F(-1), cos), slipCos, F(a * a + b * b - c * c - e * e, m), F(a * a + b * b - c * c - e * e, a * a + b * b + c * c + e * e), F(c * c + e * e - a * a - b * b, m), F(a * a + b * b - c * c - e * e, 4 * m), F(a * a + b * b - c * c, 2 * a * b), F(a * a + b * b - e * e, 2 * a * b), F(c * c + e * e - a * a, 2 * c * e), F(c * c + e * e - b * b, 2 * c * e), fm(F(1, 2), cos), fs(ONE, cos), F(1, 2), F(-1, 2), F(1, 3), F(-1, 3), F(1, 4), F(-1, 4)].map(fq)),
    diag: pos([rootF(F(a * a + b * b)), rootF(F(c * c + e * e)), rootF(fa(F(a * a + b * b), fm(F(2 * a * b), cos))), fq(F(a + b, 1)), rootF(fs(F(a * a + b * b), fm(F(a * b), cos))), rootF(fm(ac2, F(1, 2))), rootF(fa(ac2, F(a * b)))]),
    area: pos([fq(F(m, 2)), rootF(fm(F(m * m), sin2)), rootF(F(a * b * c * e)), rootF(fm(F(m * m, 16), sin2)), rootF(fm(F(m * m, 4), fm(sin2, F(1, 2)))), fq(F(a * b, 2)), rootF(F(m))]),
  }[ask];
  const start = `Since ABCD is inscribed in a circle, angles B and D add up to 180°, so cos D = −cos B. The law of cosines in triangles ABC and ADC gives AC<sup>2</sup> = ${a * a} + ${b * b} − ${2 * a * b} cos B and AC<sup>2</sup> = ${c * c} + ${e * e} + ${2 * c * e} cos B. Setting these equal, ${2 * m} cos B = ${a * a + b * b} − ${c * c + e * e}, so cos B = ${fr(cos)}. `;
  return {
    topic: LAWS, rank: { cos: 15, diag: 16, area: 17 }[ask],
    text: `Quadrilateral ABCD is inscribed in a circle, with AB = ${a}, BC = ${b}, CD = ${c} and DA = ${e}. What is ${what}?`,
    answer: five(d, ans, wrongs),
    solution: start + {
      cos: `So the answer is <b>${ans[1]}</b>.`,
      diag: `Then AC<sup>2</sup> = ${a * a + b * b} − ${2 * a * b}·${par(cos)} = ${fr(ac2)}, so AC = <b>${ans[1]}</b>.`,
      area: `Then sin B = sin D = √(1 − ${par(sqF(cos))}) = ${rootF(sin2)[1]}, and the area is ½·${a}·${b} sin B + ½·${c}·${e} sin D = ½·${m}·sin B = <b>${ans[1]}</b>.`,
    }[ask],
    check: () => {
      // slide angle B until both triangles give the same diagonal, build the corners, and test them against a circle
      const bAngle = root((t) => (a * a + b * b - 2 * a * b * Math.cos(t)) - (c * c + e * e + 2 * c * e * Math.cos(t)), 1e-6, Math.PI - 1e-6);
      const B = [0, 0], A = [a, 0], C = [b * Math.cos(bAngle), b * Math.sin(bAngle)], len = dist(A, C);
      const cosC = (len * len + b * b - a * a) / (2 * len * b), u = [(A[0] - C[0]) / len, (A[1] - C[1]) / len], s = Math.sqrt(1 - ((len * len + c * c - e * e) / (2 * len * c)) ** 2), q = (len * len + c * c - e * e) / (2 * len * c);
      const side = u[0] * (B[1] - C[1]) - u[1] * (B[0] - C[0]) > 0 ? -1 : 1;
      const D = [C[0] + c * (q * u[0] - side * s * u[1]), C[1] + c * (q * u[1] + side * s * u[0])];
      const ox = a / 2, oy = (b * b - b * Math.cos(bAngle) * a) / (2 * b * Math.sin(bAngle)), R = Math.hypot(ox, oy);
      if (!close(Math.hypot(D[0] - ox, D[1] - oy), R, 1e-6) || !close(dist(D, A), e, 1e-6) || !Number.isFinite(cosC)) return false;
      return close({ cos: Math.cos(bAngle), diag: len, area: shoelace([A, B, C, D]) }[ask], ans[0], 1e-6);
    },
  };
};

// a segment from A to the far side: the law of sines twice, with the common side AD cancelling
const SIN_PAIRS = [[30, 45, 1, 2, 2], [45, 30, 1, 1, 2], [60, 45, 1, 2, 6], [45, 60, 1, 3, 6], [30, 60, 1, 3, 3], [60, 30, 1, 1, 3], [30, 120, 1, 3, 3], [120, 30, 1, 1, 3], [45, 120, 1, 3, 6], [120, 45, 1, 2, 6]];   // B, C and sin B/sin C = (p/q)√r
const ratioLemma = (d, ctx) => {
  const [[B, C, p, q, r], [m, n]] = pick(ctx, 'ratiolemma', [SIN_PAIRS, [[1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [3, 2], [3, 4], [4, 3], [3, 5], [5, 3], [1, 4], [4, 1]]]);
  const ans = fracSurd(p * m, q * n, r), ratio = fracSurd(p, q, r), inv = fracSurd(p * n, q * m, r), flip = fd(F(m, n), ONE), oneOver = fracSurd(q * m, p * n * r, r);
  const wrongs = [fq(flip), ratio, inv, oneOver, fq(fd(ONE, flip)), fracSurd(q * n, p * m * r, r), fracSurd(2 * p * m, q * n, r)];
  return {
    topic: LAWS, rank: 17,
    text: `In triangle ABC, ∠B = ${B}° and ∠C = ${C}°. Point D lies on side BC with BD : DC = ${m} : ${n}. What is ${over('sin ∠BAD', 'sin ∠CAD')}?`,
    answer: five(d, ans, pos(wrongs)),
    solution: `Use the law of sines in the two smaller triangles, which share side AD. In triangle ABD, BD/sin ∠BAD = AD/sin ${B}°, so sin ∠BAD = BD·sin ${B}°/AD. In triangle ACD, CD/sin ∠CAD = AD/sin ${C}°, so sin ∠CAD = CD·sin ${C}°/AD. Dividing, AD cancels and the ratio is ${over('BD', 'CD')}·${over(`sin ${B}°`, `sin ${C}°`)} = ${frac(m, n)}·${ratio[1]} = <b>${ans[1]}</b>.`,
    check: () => {
      const tb = Math.tan(rad(B)), tc = Math.tan(rad(C)), L = m + n, x = (tc * L) / (tc + tb), P = [x, tb * x], Dp = [m, 0];
      return close(Math.sin(angle(P, [0, 0], Dp)) / Math.sin(angle(P, Dp, [L, 0])), ans[0]);
    },
  };
};

// a point seeing all three sides at 120°: three law of cosines, or three small areas
const FERMATS = [];
for (let x = 1; x <= 8; x++) for (let y = x; y <= 10; y++) for (let z = y; z <= 15; z++) if (!(x === y && y === z)) FERMATS.push([x, y, z]);
const fermatPoint = (d, ctx) => {
  const [[x, y, z], ask] = pick(ctx, 'fermat', [FERMATS, ['area', 'squares', 'side']], (t, w) => w !== 'side' || isSquare(t[0] ** 2 + t[0] * t[1] + t[1] ** 2));
  const P = x * y + y * z + z * x, Q = x * x + y * y + z * z, ab2 = x * x + x * y + y * y;
  const ans = { area: fracSurd(P, 4, 3), squares: fl(2 * Q + P), side: fl(Math.round(Math.sqrt(ab2))) }[ask];
  const what = { area: 'the area of triangle ABC', squares: 'AB<sup>2</sup> + BC<sup>2</sup> + CA<sup>2</sup>', side: 'AB' }[ask];
  const wrongs = {
    area: [fracSurd(P, 2, 3), fl(P, 2), fracSurd(P, 8, 3), fracSurd(P, 3, 3), fracSurd(Q, 4, 3), fracSurd(P + Q, 4, 3)],
    squares: [fl(2 * Q), fl(2 * Q - P), fl(Q + P), fl(2 * Q + 2 * P), fl(3 * Q), fl(Q)],
    side: [fl(x + y), rootF(F(x * x + y * y)), rootF(F(x * x + y * y - x * y)), fl(z), rootF(F(x * x + y * y + z * z)), fl(x + y + 1)],
  }[ask];
  return {
    topic: LAWS, rank: { area: 18, squares: 17, side: 13 }[ask],
    text: `Point P lies inside triangle ABC with ∠APB = ∠BPC = ∠CPA = 120°, PA = ${x}, PB = ${y} and PC = ${z}. What is ${what}?`,
    answer: five(d, ans, pos(wrongs)),
    solution: {
      area: `The three triangles at P fill ABC, and each has an angle of 120° at P, whose sine is √3/2. So the area is ½·(√3/2)(${x}·${y} + ${y}·${z} + ${z}·${x}) = (√3/4)·${P} = <b>${ans[1]}</b>.`,
      squares: `Each side comes from the law of cosines at P, where cos 120° = −½: AB<sup>2</sup> = ${x * x} + ${y * y} + ${x * y}, BC<sup>2</sup> = ${y * y} + ${z * z} + ${y * z} and CA<sup>2</sup> = ${z * z} + ${x * x} + ${z * x}. Adding these, each square appears twice, for a total of 2·${Q} + ${P} = <b>${ans[1]}</b>.`,
      side: `Use the law of cosines in triangle APB, where cos 120° = −½: AB<sup>2</sup> = ${x * x} + ${y * y} − 2·${x}·${y}·(−½) = ${ab2}, so AB = <b>${ans[1]}</b>.`,
    }[ask],
    check: () => {
      const pt = (r, t) => [r * Math.cos(rad(t)), r * Math.sin(rad(t))], A = pt(x, 90), B = pt(y, 210), C = pt(z, 330);
      return close({ area: shoelace([A, B, C]), squares: dist(A, B) ** 2 + dist(B, C) ** 2 + dist(C, A) ** 2, side: dist(A, B) }[ask], ans[0]);
    },
  };
};

// one angle twice another: the law of sines gives cos B, and the triple angle formula gives the third side
const DOUBLE_SIDES = [];
for (let b = 2; b <= 16; b++) for (let a = b + 1; a < 2 * b; a++) if (gcd(a, b) === 1 || a * a % b === 0) DOUBLE_SIDES.push([a, b]);
const doubleAngle = (d, ctx) => {
  const [[a, b], ask] = pick(ctx, 'doubleangle', [DOUBLE_SIDES, ['side', 'side', 'cos', 'perimeter']], ([x, y], w) => F(x * x - y * y, y)[1] <= 9);
  const c = F(a * a - b * b, b), cosB = F(a, 2 * b), per = fa(F(a + b), c), ans = { side: c, cos: cosB, perimeter: per }[ask];
  const what = { side: 'the length of AB', cos: 'cos B', perimeter: 'the perimeter of the triangle' }[ask];
  const wrongs = {
    side: [F(a * a + b * b, b), F(a * a - b * b, a), F(a * a - b * b, 2 * b), F(a - b), F(a + b, 2), F(b), fs(F(a * a, b), ONE)],
    cos: [F(b, a), F(b, 2 * a), F(a, 3 * b), F(a * a - b * b, 2 * a * b), F(a * a - b * b, 2 * b * b), fs(F(a, b), ONE), F(a - b, a + b)],
    perimeter: [fa(F(a + b), F(a * a + b * b, b)), fa(F(a + b), F(a - b)), fa(F(a + b), F(b)), fa(F(a + b), F(a * a - b * b, a)), F(2 * (a + b)), fa(per, ONE)],
  }[ask];
  const Sin3 = `sin 3B = sin B(3 − 4 ${pw('sin', 2, 'B')}) = sin B(4 ${pw('cos', 2, 'B')} − 1)`;
  const c2 = fs(fm(F(4), sqF(cosB)), ONE);
  return {
    topic: LAWS, rank: ask === 'cos' ? 14 : 19,
    text: `In triangle ABC, ∠A = 2∠B, BC = ${a} and CA = ${b}. What is ${what}?`,
    answer: five(d, fq(ans), ask === 'cos' ? unit(pos(wrongs.map(fq))) : pos(wrongs.map(fq))),
    solution: `By the law of sines, ${a}/sin 2B = ${b}/sin B. Since sin 2B = 2 sin B cos B, this gives cos B = ${a}/(2·${b}) = ${fr(cosB)}. ` + (ask === 'cos' ? `So cos B = <b>${fr(ans)}</b>.` : `The third angle is C = 180° − 3B, so sin C = sin 3B, and ${Sin3}. The law of sines again gives AB = CA·sin C/sin B = ${b}(4 ${pw('cos', 2, 'B')} − 1) = ${b}·${fr(c2)} = ${fr(c)}.${ask === 'perimeter' ? ` So the perimeter is ${a} + ${b} + ${fr(c)} = <b>${fr(ans)}</b>.` : ` So AB = <b>${fr(ans)}</b>.`}`),
    check: () => {
      const cv = fv(c), { A, B, C } = corners(a, b, cv), angA = angle(A, B, C), angB = angle(B, A, C);
      return close(angA, 2 * angB) && close({ side: dist(A, B), cos: Math.cos(angB), perimeter: dist(A, B) + dist(B, C) + dist(C, A) }[ask], fv(ans));
    },
  };
};

// a² + b² = kc²: cotangents in terms of the sides and the area
const COT_KS = [[2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [9, 1], [11, 1], [13, 1], [17, 1], [21, 1], [5, 2], [7, 2], [9, 2], [7, 3], [8, 3]];
const cotRatio = (d, ctx) => {
  const [k, ask] = pick(ctx, 'cotratio', [COT_KS, ['cot', 'tan']]);
  const half = F(1, 2), left = fs(k, ONE), cotOver = fm(half, left), ans = ask === 'cot' ? cotOver : fd(ONE, cotOver);
  const what = ask === 'cot' ? `${over('cot C', 'cot A + cot B')}` : 'tan C (cot A + cot B)';
  const K = fr(k);
  const wrongs = (ask === 'cot' ? [left, fm(half, fa(k, ONE)), fm(half, k), fd(F(2), left), fm(F(1, 4), left), k] : [fd(ONE, left), left, fd(F(2), fa(k, ONE)), fd(F(2), k), fm(F(4), fd(ONE, left)), cotOver, k, fd(ONE, k)]).map(fq);
  return {
    topic: LAWS, rank: 20,
    text: `The sides of triangle ABC satisfy a<sup>2</sup> + b<sup>2</sup> = ${K}c<sup>2</sup>, where a, b and c are the sides opposite A, B and C. What is ${what}?`,
    answer: five(d, fq(ans), pos(wrongs)),
    solution: `Let T be the area, so sin C = 2T/(ab). With the law of cosines, cot C = ${over('cos C', 'sin C')} = ${over('(a<sup>2</sup> + b<sup>2</sup> − c<sup>2</sup>)/(2ab)', '2T/(ab)')} = ${over('a<sup>2</sup> + b<sup>2</sup> − c<sup>2</sup>', '4T')}. In the same way, cot A = ${over('b<sup>2</sup> + c<sup>2</sup> − a<sup>2</sup>', '4T')} and cot B = ${over('a<sup>2</sup> + c<sup>2</sup> − b<sup>2</sup>', '4T')}, so cot A + cot B = ${over('2c<sup>2</sup>', '4T')}. Then ${over('cot C', 'cot A + cot B')} = ${over('a<sup>2</sup> + b<sup>2</sup> − c<sup>2</sup>', '2c<sup>2</sup>')} = ${over(`${fr(left)}c<sup>2</sup>`, '2c<sup>2</sup>')} = ${fr(cotOver)}${ask === 'cot' ? `, which is <b>${fr(ans)}</b>` : `. The expression asked for is the reciprocal of this, <b>${fr(ans)}</b>`}.`,
    check: () => {
      // two differently shaped triangles with c = 1 and a² + b² = k
      const kv = fv(k);
      return [0.5, 0.56].every((share) => {
        const a = Math.sqrt(kv * share), b = Math.sqrt(kv * (1 - share)), { A, B, C } = corners(a, b, 1), angA = angle(A, B, C), angB = angle(B, A, C), angC = angle(C, A, B);
        const ratio = (1 / Math.tan(angC)) / (1 / Math.tan(angA) + 1 / Math.tan(angB));
        return Math.abs(a - b) < 1 && close(ask === 'cot' ? ratio : 1 / ratio, fv(ans));
      });
    },
  };
};

// a + c against b is tan(A/2) tan(C/2) in disguise: the law of sines, sum to product, and half angles
const HALF_KS = [[3, 2], [4, 3], [5, 3], [5, 4], [7, 4], [7, 5], [2, 1], [9, 5], [8, 5], [9, 7], [3, 1], [5, 2], [7, 2], [7, 3]];
const halfTangent = (d, ctx) => {
  const [k, ask] = pick(ctx, 'halftan', [HALF_KS, ['fromSides', 'fromTan']]);
  const t = fd(fs(k, ONE), fa(k, ONE)), [given, ans] = ask === 'fromSides' ? [k, t] : [t, k];
  const wrongs = ask === 'fromSides'
    ? [fd(fs(k, ONE), k), fd(ONE, k), fd(fa(k, ONE), fs(k, ONE)), fm(F(1, 2), fs(k, ONE)), fd(ONE, fa(k, ONE)), fm(F(1, 2), t), fm(F(2), t)]
    : [fd(fa(t, ONE), fa(fs(ONE, t), ONE)), fd(fs(ONE, t), fa(ONE, t)), fd(ONE, t), fs(F(2), t), fa(ONE, t), fd(ONE, fs(ONE, t)), fm(F(2), fa(ONE, t))];
  const steps = `By the law of sines, ${over('a + c', 'b')} = ${over('sin A + sin C', 'sin B')}. Sum to product on top and the double angle formula below give ${over('2 sin ½(A + C) cos ½(A − C)', '2 sin ½B cos ½B')}. Since ½(A + C) = 90° − ½B, sin ½(A + C) = cos ½B and sin ½B = cos ½(A + C), so this is ${over('cos ½(A − C)', 'cos ½(A + C)')}. Expanding both cosines and dividing by cos ½A cos ½C gives ${over('1 + tan ½A tan ½C', '1 − tan ½A tan ½C')}.`;
  return {
    topic: LAWS, rank: 22,
    text: ask === 'fromSides'
      ? `The sides of triangle ABC satisfy a + c = ${fr(given)}·b, where a, b and c are the sides opposite A, B and C. What is tan ½A · tan ½C?`
      : `In triangle ABC, tan ½A · tan ½C = ${fr(given)}. If a, b and c are the sides opposite A, B and C, what is ${over('a + c', 'b')}?`,
    answer: five(d, fq(ans), pos(wrongs.map(fq))),
    solution: `${steps} ` + (ask === 'fromSides'
      ? `So with t = tan ½A tan ½C, (1 + t)/(1 − t) = ${fr(k)}. Solving, t = (${fr(k)} − 1) ÷ (${fr(k)} + 1) = <b>${fr(ans)}</b>.`
      : `So the answer is (1 + ${fr(t)}) ÷ (1 − ${fr(t)}) = <b>${fr(ans)}</b>.`),
    check: () => {
      const kv = fv(k);
      return [0.5, 0.46].every((share) => {
        const a = kv * share, c = kv * (1 - share), { A, B, C } = corners(a, 1, c), got = Math.tan(angle(A, B, C) / 2) * Math.tan(angle(C, A, B) / 2);
        return Math.abs(a - c) < 1 && close(got, fv(t)) && close((dist(B, C) + dist(A, B)) / dist(C, A), kv);
      });
    },
  };
};

// two sides and cos(A − B): a point D on BC with DA = DB turns A − B into an angle of a triangle with known sides
const COS_DIFFS = [];
for (let a = 3; a <= 16; a++) for (let b = 2; b < a; b++) for (let c = a - b + 1; c < a + b; c++) {
  if (a * 4 === b * 5 && a * 6 === c * 5) continue;   // that triangle’s cos(A − B) is a well-known contest number
  const prod = (a + b + c) * (-a + b + c) * (a - b + c) * (a + b - c), cosA = F(b * b + c * c - a * a, 2 * b * c), cosB = F(a * a + c * c - b * b, 2 * a * c), sinSin = F(prod, 4 * a * b * c * c), t = fa(fm(cosA, cosB), sinSin);
  if (t[1] <= 90 && fv(t) > -0.6) COS_DIFFS.push([a, b, c, t]);
}
const cosDifference = (d, ctx) => {
  const [[a, b, c, t]] = pick(ctx, 'cosdiff', [COS_DIFFS]);
  const x = fd(F(a * a - b * b), fm(F(2), fs(F(a), fm(F(b), t)))), dc = fs(F(a), x), cosC = fd(fs(fa(F(b * b), sqF(dc)), sqF(x)), fm(F(2 * b), dc));
  const c2 = fs(F(a * a + b * b), fm(F(2 * a * b), cosC));
  const wrongs = [rootF(fs(F(a * a + b * b), fm(F(2 * a * b), t))), rootF(fa(F(a * a + b * b), fm(F(2 * a * b), t))), fq(x), fq(dc), fl(c + 1), fl(c - 1), fl(a + b - c), rootF(F(a * a + b * b)), fl(c + 2)];
  return {
    topic: LAWS, rank: 23,
    text: `In triangle ABC, BC = ${a}, CA = ${b} and cos(A − B) = ${fr(t)}. What is the length of AB?`,
    answer: five(d, fl(c), pos(wrongs)),
    solution: `Since BC &gt; CA, angle A is larger than angle B, so there is a point D on side BC with ∠DAB = ∠B. Then DA = DB, and ∠DAC = A − B. Let DA = DB = x, so DC = ${a} − x. The law of cosines in triangle ADC says (${a} − x)<sup>2</sup> = ${b}<sup>2</sup> + x<sup>2</sup> − 2·${b}·x·${par(t)}. The x<sup>2</sup> terms cancel, leaving a linear equation: ${a * a} − ${2 * a}x = ${b * b} ${t[0] < 0 ? '+' : '−'} ${cf(F(Math.abs(2 * b * t[0]), t[1]))}x, so x = ${fr(x)} and DC = ${fr(dc)}. The same triangle gives cos C = (${b}<sup>2</sup> + DC<sup>2</sup> − x<sup>2</sup>) ÷ (2·${b}·DC) = ${fr(cosC)}. Finally AB<sup>2</sup> = ${a}<sup>2</sup> + ${b}<sup>2</sup> − 2·${a}·${b}·${par(cosC)} = ${fr(c2)}, so AB = <b>${c}</b>.`,
    check: () => {
      const f = (s) => { const { A, B, C } = corners(a, b, s); return Math.cos(angle(A, B, C) - angle(B, A, C)) - fv(t); };
      return close(root(f, a - b + 1e-6, a + b - 1e-6), c, 1e-6) && c2[1] === 1 && c2[0] === c * c;
    },
  };
};

// ======================================================================================================================
// Largest value of a trig expression
// ======================================================================================================================
const LARGEST = 'Largest value of a trig expression';
// the largest value of f over a rectangle: a grid, then zooming in on the best point
function top2(f, [a, b], [c, e]) {
  let best = [a, c], bv = -Infinity;
  const look = (x0, x1, y0, y1, n) => { for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) { const x = x0 + ((x1 - x0) * i) / n, y = y0 + ((y1 - y0) * j) / n, v = f(x, y); if (v > bv) { bv = v; best = [x, y]; } } };
  look(a, b, c, e, 240);
  let hx = (b - a) / 240, hy = (e - c) / 240;
  for (let r = 0; r < 8; r++) { look(best[0] - hx, best[0] + hx, best[1] - hy, best[1] + hy, 12); hx /= 4; hy /= 4; }
  return bv;
}
const coef = (n, body) => `${n === 1 ? '' : `${n} `}${body}`;
const FULL = 2 * Math.PI;

// a sin x + b cos x is a wave of height √(a² + b²)
const WAVE_PAIRS = [[3, 4], [4, 3], [5, 12], [12, 5], [8, 15], [7, 24], [6, 8], [1, 1], [1, 2], [2, 3], [1, 3], [2, 5], [3, 5], [20, 21]];
const waveMax = (d, ctx) => {
  const [[a, b], c, ask] = pick(ctx, 'wave', [WAVE_PAIRS, [-7, -5, -3, -2, 2, 3, 4, 6, 9, 11, 16, 26], ['plain', 'recip', 'square']], ([x, y], z, w) => {
    const R = Math.sqrt(x * x + y * y);
    return w === 'plain' || (w === 'square' && z < 0 && isSquare(x * x + y * y)) || (w === 'recip' && isSquare(x * x + y * y) && z > R && z - R <= 12);
  });
  const R2 = a * a + b * b, R = Math.sqrt(R2), rt = isSquare(R2), wave = `${coef(a, 'sin x')} + ${coef(b, 'cos x')}`, sign = c < 0 ? '−' : '+', C = Math.abs(c), whole = `${wave} ${sign} ${C}`;
  const ans = { plain: mix(c, 1, R2), recip: fl(1, Math.round(c - R)), square: mix(R2 + c * c, 2 * C, R2) }[ask];
  const wrongs = {
    plain: [fl(a + b + c), mix(0, 1, R2), mix(-c, 1, R2), fl(a + b), fl(R2 + c), fl(Math.max(a, b) + c), fl(Math.max(a, b) + Math.abs(c))],
    recip: [fl(1, c), fl(1, Math.round(c + R)), fl(1, Math.round(R)), fl(Math.round(c - R)), fl(1, c - 1), fl(1, c - Math.max(a, b))],
    square: [mix(R2 + c * c, -2 * C, R2), fl(R2 + c * c), fl((a + b + C) ** 2), fl(R2), mix(C, 1, R2), fl((a + b) ** 2)],
  }[ask];
  const what = { plain: whole, recip: over(1, whole), square: `(${whole})<sup>2</sup>` }[ask];
  const amp = rt ? `${Math.round(R)}` : `√${R2}`;
  return {
    topic: LARGEST, rank: { plain: 9, recip: 11, square: 11 }[ask],
    text: `What is the largest value of ${what} over all real numbers x?`,
    answer: five(d, ans, pos(wrongs)),
    solution: `The expression ${wave} is a wave that swings between −√(${a * a} + ${b * b}) and √(${a * a} + ${b * b}), that is between −${amp} and ${amp}. ` + {
      plain: `So the whole expression is largest when the wave is at its top, and the largest value is ${amp} ${sign} ${C} = <b>${ans[1]}</b>.`,
      recip: `So the bottom of the fraction runs between ${c} − ${amp} and ${c} + ${amp}, all positive, and the fraction is largest when the bottom is smallest, ${Math.round(c - R)}. That gives <b>${ans[1]}</b>.`,
      square: `So the inside runs between −${amp} − ${C} and ${amp} − ${C}. The square is largest at the end farther from 0, which is the bottom one, so the largest value is (${amp} + ${C})<sup>2</sup> = <b>${ans[1]}</b>.`,
    }[ask],
    check: () => {
      const f = (x) => a * Math.sin(x) + b * Math.cos(x) + c;
      return close(top({ plain: f, recip: (x) => 1 / f(x), square: (x) => f(x) ** 2 }[ask], 0, FULL), ans[0], 1e-6);
    },
  };
};

// P cos 2x + k sin x is a downward parabola in sin x, whose top may or may not be a value the sine can reach
const CP_CASES = [[1, 1], [1, 2], [1, 3], [1, 5], [1, 6], [1, 7], [2, 3], [2, 5], [2, 7], [2, 9], [2, 10], [3, 2], [3, 4], [3, 8], [3, 14], [4, 6], [4, 18]];
const cosPlusSine = (d, ctx) => {
  const [form, turn] = [ctx.k % 3 === 2 ? 'cos' : 'sin', { ...ctx, k: ctx.k - Math.floor((ctx.k + 1) / 3) }];
  if (form === 'cos') {
    const [k] = pick({ ...ctx, k: Math.floor(ctx.k / 3) }, 'cp-cos', [[2, 3, 4, 5, 6, 7, 8, 9]]);
    const ans = fl(1 + k);
    return {
      topic: LARGEST, rank: 12,
      text: `What is the largest value of cos 2x + ${k} cos x over all real numbers x?`,
      answer: five(d, ans, pos([fl(k - 1), fq(fa(ONE, F(k * k, 8))), fq(F(k * k, 8)), fl(k), fl(k + 2), fq(fa(F(k), F(1, 2))), fq(fs(F(k * k, 8), ONE))])),
      solution: `Let c = cos x, so cos 2x = 2c<sup>2</sup> − 1 and the expression is 2c<sup>2</sup> + ${k}c − 1. This parabola opens upward, so on −1 ≤ c ≤ 1 its largest value is at an end, not at its vertex. At c = 1 it is 2 + ${k} − 1 = ${k + 1}, and at c = −1 it is 2 − ${k} − 1 = ${num(1 - k, 0)}. So the largest value is <b>${ans[1]}</b>.`,
      check: () => close(top((x) => Math.cos(2 * x) + k * Math.cos(x), 0, FULL), ans[0], 1e-6),
    };
  }
  const [[P, k]] = pick(turn, 'cp-sin', [CP_CASES]);
  const insideTop = k <= 4 * P, vertex = F(k, 4 * P), peak = fa(F(P), F(k * k, 8 * P)), ans = insideTop ? peak : F(k - P);
  const wrongs = insideTop
    ? [F(k - P), fa(F(P), F(k * k, 4 * P)), F(P + k), fa(F(P), F(k * k, 2 * P)), F(k * k, 8 * P), fa(F(P), F(k, 4 * P))]
    : [peak, F(k + P), F(k * k, 8 * P), fa(F(P), F(k * k, 4 * P)), F(k - P + 1), F(k)];
  return {
    topic: LARGEST, rank: insideTop ? 13 : 14,
    text: `What is the largest value of ${coef(P, 'cos 2x')} + ${coef(k, 'sin x')} over all real numbers x?`,
    answer: five(d, fq(ans), pos(wrongs.map(fq))),
    solution: `Let s = sin x, so cos 2x = 1 − 2s<sup>2</sup> and the expression is ${P} − ${2 * P}s<sup>2</sup> + ${k === 1 ? '' : k}s, a parabola that opens downward with its top at s = ${k} ÷ ${4 * P} = ${fr(vertex)}. `
      + (insideTop
        ? `A sine can equal ${fr(vertex)}, so the top is reached. The value there is ${P} − ${2 * P}·${fr(sqF(vertex))} + ${k === 1 ? '' : `${k}·`}${fr(vertex)} = <b>${fr(ans)}</b>.`
        : `But s = sin x can’t go above 1, and ${fr(vertex)} is above 1. So on −1 ≤ s ≤ 1 the parabola only rises, and the largest value is at s = 1: ${P} − ${2 * P} + ${k} = <b>${fr(ans)}</b>.`),
    check: () => close(top((x) => P * Math.cos(2 * x) + k * Math.sin(x), 0, FULL), fv(ans), 1e-6),
  };
};

// a fixed sum x + y, or a fixed sin x + sin y: the difference x − y is free, and cos(x − y) is largest at 1
const COS_EXACT = { 30: [0, 1, 3, 2], 45: [0, 1, 2, 2], 60: [1, 0, 1, 2], 90: [0, 0, 1, 1], 120: [-1, 0, 1, 2], 135: [0, -1, 2, 2], 150: [0, -1, 3, 2] };
const HALF_SUM = { sin: { 60: fl(1), 90: surd(1, 2), 120: surd(1, 3) }, cos: { 60: surd(1, 3), 90: surd(1, 2), 120: fl(1) } };
const PAIR_POOL = [fl(1), surd(1, 2), surd(1, 3), fl(2), fl(1, 2), fracSurd(1, 2, 3), fracSurd(1, 2, 2), fl(3, 2)];
const FIXED_FORMS = [...[30, 45, 60, 90, 120, 135, 150].flatMap((a) => [['psin', a, 0], ['pcos', a, 0]]), ...[60, 90, 120].flatMap((a) => [['ssin', a, 0], ['scos', a, 0]]), ...[[1, 2], [1, 1], [3, 2], [2, 3], [4, 3], [3, 5], [6, 5], [8, 5], [4, 5], [5, 4], [5, 3], [7, 5]].map((p) => ['given', 0, p])];
const fixedSumPair = (d, ctx) => {
  const [[form, al, p]] = pick(ctx, 'fixedsum', [FIXED_FORMS]);
  if (form === 'given') {
    const P = fr(p), rest = fs(F(4), sqF(p)), ans = rootF(rest);
    return {
      topic: LARGEST, rank: 15,
      text: `Real numbers x and y satisfy sin x + sin y = ${P}. What is the largest possible value of cos x + cos y?`,
      answer: five(d, ans, pos([fq(fs(F(2), p)), fl(2), rootF(fm(F(1, 2), rest)), [ans[0] / 2, rootF(fm(F(1, 4), rest))[1]], rootF(fa(F(4), sqF(p))), fq(rest), rootF(fs(F(4), p))])),
      solution: `Square both sums and add them: (sin x + sin y)<sup>2</sup> + (cos x + cos y)<sup>2</sup> = 2 + 2(cos x cos y + sin x sin y) = 2 + 2 cos(x − y). This is at most 4, reached exactly when x = y. So (cos x + cos y)<sup>2</sup> ≤ 4 − ${fr(sqF(p))} = ${fr(rest)}. Taking x = y with sin x = ${fr(fm(F(1, 2), p))} and cos x positive reaches this bound, so the largest value is <b>${ans[1]}</b>.`,
      check: () => { const v = fv(p); return close(top((x) => (Math.abs(v - Math.sin(x)) <= 1 ? Math.cos(x) + Math.sqrt(1 - (v - Math.sin(x)) ** 2) : -9), 0, FULL, 40000), ans[0], 1e-5); },
    };
  }
  const fn = form[1] === 's' ? 'sin' : 'cos', isProduct = form[0] === 'p', what = isProduct ? `${fn} x ${fn} y` : `${fn} x + ${fn} y`;
  let ans, wrongs, sol;
  if (isProduct) {
    const [a, b, r, den] = COS_EXACT[al], minus = mix(den - a, -b, r, 2 * den), plus = mix(den + a, b, r, 2 * den), cosText = mix(a, b, r, den)[1];
    ans = fn === 'sin' ? minus : plus;
    wrongs = [fn === 'sin' ? plus : minus, mix(den - a, -b, r, den), mix(den + a, b, r, den), fl(1, 2), fl(1), fl(1, 4), mix(a, b, r, den), fl(3, 4), fl(3, 2), fl(2)];
    sol = `The product formula says ${what} = ½(cos(x − y) ${fn === 'sin' ? '−' : '+'} cos(x + y)) = ½(cos(x − y) ${fn === 'sin' ? '−' : '+'} cos ${al}°). Here cos ${al}° = ${cosText} is fixed, and cos(x − y) is largest at 1, when x = y = ${deg(al / 2)}. So the largest value is ½(1 ${fn === 'sin' ? '−' : '+'} ${a + b * Math.sqrt(r) < 0 ? `(${cosText})` : cosText}) = <b>${ans[1]}</b>.`;
  } else {
    ans = HALF_SUM[fn][al];
    wrongs = [HALF_SUM[fn === 'sin' ? 'cos' : 'sin'][al], ...PAIR_POOL];
    sol = `Sum to product gives ${what} = 2 ${fn} ${deg(al / 2)} cos ½(x − y), because ½(x + y) = ${deg(al / 2)}. The last cosine is largest at 1, when x = y = ${deg(al / 2)}. So the largest value is 2 ${fn} ${deg(al / 2)} = <b>${ans[1]}</b>.`;
  }
  return {
    topic: LARGEST, rank: 13,
    text: `Real numbers x and y satisfy x + y = ${al}°. What is the largest possible value of ${what}?`,
    answer: five(d, ans, wrongs),
    solution: sol,
    check: () => {
      const f = fn === 'sin' ? Math.sin : Math.cos, A = rad(al);
      return close(top((x) => (isProduct ? f(x) * f(A - x) : f(x) + f(A - x)), 0, FULL), ans[0], 1e-6);
    },
  };
};

// a sin²x + b sin x cos x + c cos²x: double angles turn it into a constant plus a wave
const FORMS = [];
for (let a = 1; a <= 9; a++) for (let c = 1; c <= 9; c++) for (let b = 1; b <= 12; b++) if (a !== c && a !== 0 && (a - c) ** 2 + b * b <= 200) FORMS.push([a, b, c]);
const quadraticForm = (d, ctx) => {
  const [[a, b, c], ask] = pick(ctx, 'qform', [FORMS, ['largest', 'largest', 'smallest']], ([x, y, z], w) => {
    const D = (x - z) ** 2 + y * y;
    return (isSquare(D) || D <= 60) && (w === 'largest' || x + z > Math.sqrt(D));
  });
  const D = (a - c) ** 2 + b * b, sum = a + c, sg = ask === 'largest' ? 1 : -1, ans = mix(sum, sg, D, 2), amp = isSquare(D) ? `${Math.round(Math.sqrt(D))}` : `√${D}`;
  const whole = `${coef(a, S2)} + ${coef(b, 'sin x cos x')} + ${coef(c, C2)}`;
  const wrongs = [mix(sum, -sg, D, 2), mix(sum, 2 * sg, D, 2), fl(a + b + c), mix(2 * sum, sg, D, 2), fl(2 * Math.max(a, c) + b, 2), mix(0, 1, D, 2), fl(sum), mix(sum, 1, b * b + 1, 2)];
  return {
    topic: LARGEST, rank: 15,
    text: `What is the ${ask} value of ${whole} over all real numbers x?`,
    answer: five(d, ans, pos(wrongs)),
    solution: `Rewrite each piece with double angles: ${S2} = (1 − cos 2x)/2, ${C2} = (1 + cos 2x)/2 and sin x cos x = ½ sin 2x. The expression becomes ${frac(sum, 2)} + ½(${coef(b, 'sin 2x')} + ${c - a < 0 ? `(${num(c - a, 0)}) cos 2x` : coef(c - a, 'cos 2x')}). The part in brackets is a wave that swings between −√(${b * b} + ${(c - a) ** 2}) and √(${b * b} + ${(c - a) ** 2}), that is ±${amp}. So the ${ask} value is ${frac(sum, 2)} ${ask === 'largest' ? '+' : '−'} ½·${amp} = <b>${ans[1]}</b>.`,
    check: () => { const f = (x) => a * Math.sin(x) ** 2 + b * Math.sin(x) * Math.cos(x) + c * Math.cos(x) ** 2; return close(sg * top((x) => sg * f(x), 0, FULL), ans[0], 1e-6); },
  };
};

// a(sin x + cos x) + k sin x cos x is a parabola in t = sin x + cos x, on the range −√2 ≤ t ≤ √2
const T_SUBS = [];
for (const a of [1, 2, 3]) for (const k of [1, 2, 3, 5, -1, -2, -3, -4, -5, -6]) T_SUBS.push([a, k]);
const tSubstitution = (d, ctx) => {
  const [[a, k]] = pick(ctx, 'tsub', [T_SUBS]);
  const m = Math.abs(k), vertexIn = k < 0 && a * a <= 2 * m * m, topValue = fl(a * a + m * m, 2 * m), edgePlus = mix(k, 2 * a, 2, 2);
  const ans = k > 0 ? edgePlus : vertexIn ? topValue : edgePlus;
  const part = a === 1 ? 'sin x + cos x' : `${a} sin x + ${a} cos x`, whole = `${part} ${k < 0 ? '−' : '+'} ${coef(m, 'sin x cos x')}`;
  const wrongs = [topValue, edgePlus, mix(0, a, 2), mix(m, 2 * a, 2, 2), mix(-m, 2 * a, 2, 2), fl(2 * a + m, 2), fl(a * a, 2 * m), fl(a * a + m * m, m), fl(a), fl(a + m)];
  const halfM = m === 2 ? '' : m === 1 ? '½' : frac(m, 2), parabola = `${a === 1 ? '' : a}t ${k < 0 ? '−' : '+'} ${halfM}(t<sup>2</sup> − 1)`;
  const vertex = F(a, m);
  return {
    topic: LARGEST, rank: k > 0 ? 15 : 16,
    text: `What is the largest value of ${whole} over all real numbers x?`,
    answer: five(d, ans, pos(wrongs)),
    solution: `Let t = sin x + cos x = √2 sin(x + 45°), which takes every value from −√2 to √2. Squaring gives sin x cos x = (t<sup>2</sup> − 1)/2, so the expression is ${parabola}. `
      + (k > 0
        ? `This parabola opens upward, so its largest value on −√2 ≤ t ≤ √2 is at an end. The term with t<sup>2</sup> is the same at both ends, so the larger is t = √2, which gives ${a === 1 ? '' : a}√2 + ${frac(m, 2)} = <b>${ans[1]}</b>.`
        : vertexIn
          ? `This parabola opens downward with its top at t = ${fr(vertex)}, which is within the range since ${fr(vertex)} ≤ √2. The value there is ${a === 1 ? '' : `${a}·`}${fr(vertex)} − ${halfM}(${fr(sqF(vertex))} − 1) = <b>${ans[1]}</b>.`
          : `This parabola opens downward with its top at t = ${fr(vertex)}, but ${fr(vertex)} is more than √2 ≈ 1.41, so t can’t get there. On the range the parabola only rises, so the largest value is at t = √2: ${a === 1 ? '' : a}√2 − ${frac(m, 2)} = <b>${ans[1]}</b>.`),
    check: () => close(top((x) => a * (Math.sin(x) + Math.cos(x)) + k * Math.sin(x) * Math.cos(x), 0, FULL), ans[0], 1e-6),
  };
};

// sin⁶x + cos⁶x + k sin x cos x is a parabola in u = sin 2x, whose top may be past u = 1
const SIXTH_FORMS = [...[1, 2, 3, 4, 5, 6, 8].map((k) => ['six', k]), ...[1, 2, 3, 4, 5, 7].map((k) => ['four', k])];
const sixthPlus = (d, ctx) => {
  const [[form, k]] = pick(ctx, 'sixth', [SIXTH_FORMS]);
  const six = form === 'six', limit = six ? 3 : 2, inside = k <= limit, peak = fa(ONE, F(k * k, six ? 12 : 8)), edge = fa(F(1, six ? 4 : 2), F(k, 2)), ans = inside ? peak : edge;
  const pow = six ? 6 : 4, a = six ? '¾' : '½', vertex = F(k, limit);
  const wrongs = [inside ? edge : peak, fa(ONE, F(k, 2)), fa(ONE, F(k * k, 4)), F(k, 2), fa(ONE, F(k * k, six ? 8 : 12)), fa(F(1, 2), F(k, 2)), fa(F(1, 4), F(k, 2)), F(k * k, 12), ONE];
  return {
    topic: LARGEST, rank: inside ? 16 : 17,
    text: `What is the largest value of ${pw('sin', pow)} + ${pw('cos', pow)} + ${coef(k, 'sin x cos x')} over all real numbers x?`,
    answer: five(d, fq(ans), pos(wrongs.map(fq))),
    solution: `Let u = sin 2x = 2 sin x cos x, which takes every value from −1 to 1. Since ${S2} + ${C2} = 1, ` + (six ? `${pw('sin', 6)} + ${pw('cos', 6)} = 1 − 3 ${S2} ${C2} = 1 − ¾u<sup>2</sup>` : `${S4} + ${C4} = 1 − 2 ${S2} ${C2} = 1 − ½u<sup>2</sup>`) + `. So the expression is 1 − ${a}u<sup>2</sup> + ${frac(k, 2)}u, a parabola that opens downward with its top at u = ${fr(vertex)}. `
      + (inside
        ? `That is a value u can take, and there the expression equals 1 − ${a}·${fr(sqF(vertex))} + ${frac(k, 2)}·${fr(vertex)} = <b>${fr(ans)}</b>.`
        : `But u can’t go above 1, so on −1 ≤ u ≤ 1 the parabola only rises, and the largest value is at u = 1: 1 − ${a} + ${frac(k, 2)} = <b>${fr(ans)}</b>.`),
    check: () => close(top((x) => Math.sin(x) ** pow + Math.cos(x) ** pow + k * Math.sin(x) * Math.cos(x), 0, FULL), fv(ans), 1e-6),
  };
};

// AM-GM says a²s + b²/s ≥ 2ab, but only if s = b/a is a value s = sin²x can take
const AMGM = [[3, 4], [2, 5], [4, 5], [1, 2], [1, 3], [2, 3], [5, 6], [3, 5], [4, 3], [5, 2], [5, 4], [2, 1], [3, 1], [3, 2], [6, 5], [7, 3]];
const amgmTrap = (d, ctx) => {
  const [[a, b], fn] = pick(ctx, 'amgm', [AMGM, ['sin', 'cos']]);
  const co = fn === 'sin' ? 'csc' : 'sec', A = a * a, B = b * b, reach = b <= a, ans = reach ? 2 * a * b : A + B, s = F(b, a);
  const wrongs = [2 * a * b, A + B, (a + b) ** 2, a * b, 2 * (A + B), 4 * a * b, A + B + 1, Math.abs(A - B)];
  return {
    topic: LARGEST, rank: reach ? 15 : 18,
    text: `What is the smallest value of ${coef(A, pw(fn, 2))} + ${coef(B, pw(co, 2))} over all real numbers x where it is defined?`,
    answer: five(d, fl(ans), pos(wrongs.map((v) => fl(v)))),
    solution: `Let s = ${pw(fn, 2)}, so 0 &lt; s ≤ 1 and the expression is ${A === 1 ? '' : A}s + ${B}/s. AM-GM gives ${A === 1 ? '' : A}s + ${B}/s ≥ 2√(${A}·${B}) = ${2 * a * b}, with equality only when ${A === 1 ? '' : A}s = ${B}/s, that is s = ${fr(s)}. `
      + (reach
        ? `That is a value s can take, since ${fr(s)} ≤ 1. So the smallest value is <b>${ans}</b>.`
        : `But s can’t be ${fr(s)}, which is more than 1, so ${2 * a * b} is never reached. For s below ${fr(s)}, the expression gets smaller as s grows, so on 0 &lt; s ≤ 1 it is smallest at s = 1. The smallest value is ${A} + ${B} = <b>${ans}</b>.`),
    check: () => { const f = fn === 'sin' ? Math.sin : Math.cos; return close(-top((x) => { const v = f(x) ** 2; return v < 1e-6 ? -1e9 : -(A * v + B / v); }, 0.0005, Math.PI - 0.0003, 30000), ans, 1e-6); },
  };
};

// one side and the opposite angle fixed: the law of sines and sum to product say the best triangle is isosceles
const TRI_MAX = { 60: { perimeter: (a) => [fl(3 * a), [mix(3 * a, 2 * a, 3, 3), mix(3 * a, 4 * a, 3, 3), fl(2 * a), fl(4 * a), mix(a, a, 3)]], area: (s) => [fracSurd(s, 4, 3), [fracSurd(s, 2, 3), fl(s, 4), fracSurd(s, 6, 3), fracSurd(s, 8, 3), fl(s, 2)]] },
  90: { perimeter: (a) => [mix(a, a, 2), [fl(2 * a), fl(3 * a), mix(0, a, 2), mix(a, 2 * a, 2), fl(5 * a, 2)]], area: (s) => [fl(s, 4), [fl(s, 2), fl(s, 8), fracSurd(s, 4, 2), fracSurd(s, 4, 3), fl(s, 3)]] },
  120: { perimeter: (a) => [mix(3 * a, 2 * a, 3, 3), [fl(2 * a), mix(0, 2 * a, 3, 3), mix(3 * a, 4 * a, 3, 3), mix(a, a, 3), fl(3 * a)]], area: (s) => [fracSurd(s, 12, 3), [fracSurd(s, 4, 3), fracSurd(s, 6, 3), fl(s, 4), fl(s, 12), fracSurd(s, 24, 3)]] } };
const triangleFixed = (d, ctx) => {
  const [al, a, ask] = pick(ctx, 'trifixed', [[60, 90, 120], [4, 6, 8, 10, 12, 14, 15, 18, 20], ['perimeter', 'area']]);
  const [ans, wrongs] = TRI_MAX[al][ask](ask === 'area' ? a * a : a), half = deg(al / 2), other = deg(90 - al / 2);
  return {
    topic: LARGEST, rank: 12,
    text: `Triangle ABC has BC = ${a} and ∠A = ${al}°. What is the largest possible ${ask === 'area' ? 'area' : 'perimeter'} of the triangle?`,
    answer: five(d, ans, pos(wrongs)),
    solution: `By the law of sines, AB = ${over(`${a} sin C`, `sin ${al}°`)} and AC = ${over(`${a} sin B`, `sin ${al}°`)}, and B + C = ${180 - al}° is fixed. `
      + (ask === 'perimeter'
        ? `Sum to product gives sin B + sin C = 2 sin ${other} cos ½(B − C), which is largest when B = C. So the triangle is isosceles, with base angles ${other}. Then AB = AC = ${a} ÷ (2 sin ${half}), and the largest perimeter is ${a} + ${a} ÷ sin ${half} = <b>${ans[1]}</b>.`
        : `The area is ½·AB·AC·sin ${al}°, and the product formula gives sin B sin C = ½(cos(B − C) − cos(B + C)), which is largest when B = C. So the triangle is isosceles, with base angles ${other}, and its height is ½·${a}·tan ${other}. The largest area is ½·${a}·(½·${a}·tan ${other}) = <b>${ans[1]}</b>.`),
    check: () => {
      const A = rad(al), f = (B) => { const C = Math.PI - A - B, b = (a * Math.sin(B)) / Math.sin(A), c = (a * Math.sin(C)) / Math.sin(A); return ask === 'perimeter' ? a + b + c : (b * c * Math.sin(A)) / 2; };
      return close(top(f, 1e-4, Math.PI - A - 1e-4), ans[0], 1e-6);
    },
  };
};

// the tangent of a difference, then AM-GM on what is left in the bottom
const TAN_RATIOS = [[2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [3, 2], [5, 2], [5, 3], [7, 2], [7, 3], [9, 4]];
const VIEWS = [];
for (let p = 1; p <= 9; p++) for (let h = 1; h <= 16; h++) { const N = p * (p + h); if (isSquare(N) || N <= 40) VIEWS.push([p, h]); }
const VIEW_FORMS = [...TAN_RATIOS.map((k) => ['ratio', k, 0]), ...VIEWS.map(([p, h]) => ['view', p, h])];
const tanDifference = (d, ctx) => {
  const turn = ctx.k % 2, [[form, u, h]] = pick({ ...ctx, k: Math.floor(ctx.k / 2) }, `tandiff-${turn}`, [VIEW_FORMS.filter((v) => v[0] === (turn ? 'view' : 'ratio'))]);
  if (form === 'ratio') {
    const [p, q] = u, k = fv(u), K = fr(u), minus = F(p - q, q), ans = fracSurd(p - q, 2 * p * q, p * q);
    const wrongs = [fq(fm(F(1, 2), minus)), fq(minus), fq(fd(minus, u)), fracSurd(p + q, 2 * p * q, p * q), fracSurd(p - q, p * q, p * q), fracSurd(p - q, 4 * p * q, p * q), fq(fd(minus, fm(F(2), u)))];
    return {
      topic: LARGEST, rank: 19,
      text: `Acute angles x and y satisfy tan x = ${K} tan y. What is the largest possible value of tan(x − y)?`,
      answer: five(d, ans, pos(wrongs)),
      solution: `Let t = tan y. Then tan(x − y) = (${K}t − t) ÷ (1 + ${K}t<sup>2</sup>) = ${cf(minus)}t ÷ (1 + ${K}t<sup>2</sup>) = ${fr(minus)} ÷ (1/t + ${K}t). By AM-GM, 1/t + ${K}t ≥ 2√${q === 1 ? p : `(${K})`}, with equality at t = √(1/${q === 1 ? p : `(${K})`}), so the bottom is smallest there. The largest value is ${fr(minus)} ÷ (2√${q === 1 ? p : `(${K})`}) = <b>${ans[1]}</b>.`,
      check: () => close(top((y) => Math.tan(Math.atan(k * Math.tan(y)) - y), 1e-5, Math.PI / 2 - 1e-5, 8000), ans[0], 1e-6),
    };
  }
  const p = u, N = p * (p + h), ans = fracSurd(h, 2 * N, N), best = isSquare(N) ? `${Math.round(Math.sqrt(N))}` : `√${N}`;
  const wrongs = [fl(h, 2 * p + h), fl(h, p + h), fl(h, 2 * (p + h)), fracSurd(h, N, N), fl(h, 2 * p), fracSurd(h, 4 * N, N), fl(h, N), fl(h, p), fl(p, p + h)];
  return {
    topic: LARGEST, rank: 18,
    text: `Points A = (0, ${p}) and B = (0, ${p + h}) lie on the y-axis. As P moves along the positive x-axis, what is the largest possible value of tan ∠APB?`,
    answer: five(d, ans, pos(wrongs)),
    solution: `Let P = (x, 0) and O be the origin. Then tan ∠BPO = ${p + h}/x and tan ∠APO = ${p}/x, and ∠APB is their difference. So tan ∠APB = (${p + h}/x − ${p}/x) ÷ (1 + ${N}/x<sup>2</sup>) = ${h} ÷ (x + ${N}/x). By AM-GM, x + ${N}/x ≥ 2√${N}, with equality at x = ${best}. So the largest value is ${h} ÷ (2√${N}) = <b>${ans[1]}</b>.`,
    check: () => close(top((t) => { const x = Math.tan(t), P = [x, 0]; return Math.tan(angle(P, [0, p], [0, p + h])); }, 1e-4, Math.PI / 2 - 1e-4, 8000), ans[0], 1e-5),
  };
};

// half a regular hexagon is the best trapezoid: AM-GM on (1 + cos θ) sin θ
const trapezoidMax = (d, ctx) => {
  const [form, r] = pick(ctx, 'trapmax', [['semicircle', 'sides'], [2, 3, 4, 5, 6, 8, 10, 12]]);
  const s = r * r, ans = fracSurd(3 * s, 4, 3);
  const wrongs = [fl(s), fl(3 * s, 2), fracSurd(s, 2, 3), fracSurd(3 * s, 8, 3), surd(s, 3), fl(2 * s), fl(3 * s, 4), fracSurd(s, 4, 3)];
  const setUp = form === 'semicircle'
    ? `Let O be the center, and let the upper corners be at angle θ from the diameter on either side. The height is ${r} sin θ, the upper base is 2·${r} cos θ, and the lower base is 2·${r}. So the area is ½(2·${r} + 2·${r} cos θ)(${r} sin θ) = ${s}(1 + cos θ) sin θ.`
    : `Let θ be the angle at the longer base. The height is ${r} sin θ, and the longer base is ${r} + 2·${r} cos θ. So the area is ½(${r} + ${r} + 2·${r} cos θ)(${r} sin θ) = ${s}(1 + cos θ) sin θ.`;
  return {
    topic: LARGEST, rank: 20,
    text: form === 'semicircle'
      ? `A trapezoid has its longer base along the diameter of a semicircle of radius ${r}, and its other two corners on the arc. What is the largest possible area of the trapezoid?`
      : `An isosceles trapezoid has a shorter base and two legs that are all of length ${r}. What is the largest possible area of the trapezoid?`,
    answer: five(d, ans, wrongs),
    solution: `${setUp} Let c = cos θ. Then [(1 + c) sin θ]<sup>2</sup> = (1 + c)<sup>2</sup>(1 − c<sup>2</sup>) = (1 + c)<sup>3</sup>(1 − c) = ⅓(1 + c)(1 + c)(1 + c)(3 − 3c). The four factors add up to 6, so by AM-GM their product is at most (6/4)<sup>4</sup>, with equality when 1 + c = 3 − 3c, that is c = ½ and θ = 60°. So [(1 + c) sin θ]<sup>2</sup> ≤ ⅓·(3/2)<sup>4</sup> = 27/16, and (1 + c) sin θ ≤ 3√3/4. The largest area is ${s}·3√3/4 = <b>${ans[1]}</b>.`,
    check: () => close(top((t) => {
      const X = r * Math.cos(t), Y = r * Math.sin(t);
      return form === 'semicircle' ? shoelace([[-r, 0], [r, 0], [X, Y], [-X, Y]]) : shoelace([[-r / 2 - X, 0], [r / 2 + X, 0], [r / 2, Y], [-r / 2, Y]]);
    }, 1e-4, Math.PI / 2 - 1e-4, 8000), ans[0], 1e-6),
  };
};

// (sin x + b)/(cos x + a): call it y, gather the sine and cosine into one wave, and the wave’s height limits y
const SLOPES = [];
for (const a of [2, 3, 4, 5]) for (const b of [-3, -2, -1, 0, 1, 2, 3, 4]) if (b !== 0 || a !== 2) SLOPES.push([a, b]);
const slopeMax = (d, ctx) => {
  const [[a, b], ask] = pick(ctx, 'slope', [SLOPES, ['largest', 'largest', 'smallest']]);
  const D = a * a + b * b - 1, den = a * a - 1, sg = ask === 'largest' ? 1 : -1, ans = mix(a * b, sg, D, den);
  const top1 = `sin x${b === 0 ? '' : ` ${b < 0 ? '−' : '+'} ${Math.abs(b)}`}`, frc = over(top1, `cos x + ${a}`), dsc = a * a + b * b - 1;
  const wrongs = [mix(a * b, -sg, D, den), fl(b + 1, a - 1), fl(b + 1, a), fl(b, a), fl(b - 1, a + 1), mix(a * b, sg, D, a * a), mix(0, sg, D, den), fl(b - 1, a - 1), fl(b + 1, a + 1), mix(a * b, sg, D + 2, den)];
  const eqn = `${a * a - 1}y<sup>2</sup> ${a * b < 0 ? '+' : '−'} ${Math.abs(2 * a * b)}y ${b * b - 1 < 0 ? '−' : '+'} ${Math.abs(b * b - 1)}`.replace(/ [+−] 0y/, '').replace(/ [+−] 0$/, '');
  return {
    topic: LARGEST, rank: 22,
    text: `What is the ${ask} value of ${frc} over all real numbers x?`,
    answer: five(d, ans, wrongs),
    solution: `Call the value y, so sin x ${b === 0 ? '' : `${b < 0 ? '−' : '+'} ${Math.abs(b)} `}= y cos x + ${a}y, and sin x − y cos x = ${a}y${b === 0 ? '' : ` ${b < 0 ? '+' : '−'} ${Math.abs(b)}`}. The left side is a wave of height √(1 + y<sup>2</sup>), so this has a solution x exactly when (${a}y${b === 0 ? '' : ` ${b < 0 ? '+' : '−'} ${Math.abs(b)}`})<sup>2</sup> ≤ 1 + y<sup>2</sup>, that is ${eqn} ≤ 0. So y lies between the roots of this quadratic, and the quadratic formula gives y = ${over(`${a * b === 0 ? '' : `${num(a * b, 0)} `}± ${isSquare(dsc) ? Math.round(Math.sqrt(dsc)) : `√${dsc}`}`, den)}. The ${ask} value is the ${ask === 'largest' ? 'larger' : 'smaller'} root, <b>${ans[1]}</b>.`,
    check: () => { const f = (x) => (Math.sin(x) + b) / (Math.cos(x) + a); return close(sg * top((x) => sg * f(x), 0, FULL), ans[0], 1e-6); },
  };
};

// k cos x + k cos y − cos(x + y): sum to product in two variables, then a parabola whose top may be out of reach
const TWO_KS = [[1, 2], [1, 1], [3, 2], [2, 3], [3, 4], [4, 3], [2, 1], [5, 2], [3, 1], [4, 1], [7, 2], [1, 3], [5, 3]];
const TWO_FORMS = [...TWO_KS.map((k) => ['free', k]), ...TWO_KS.filter((k) => fv(k) < 2).map((k) => ['triangle', k])];
const twoVariable = (d, ctx) => {
  const [[form, k]] = pick(ctx, 'twovar', [TWO_FORMS]);
  const K = fv(k), inside = K <= 2, peak = fa(ONE, fm(F(1, 2), sqF(k))), edge = fs(fm(F(2), k), ONE), ans = inside ? peak : edge, co = k[0] === k[1] ? '' : `${fr(k)} `;
  const what = form === 'free' ? `${co}cos x + ${co}cos y − cos(x + y)` : `${co}cos A + ${co}cos B + cos C`;
  const wrongs = [inside ? edge : peak, fa(ONE, fm(F(1, 4), sqF(k))), fa(ONE, sqF(k)), fa(fm(F(2), k), ONE), fm(F(3), k), fa(F(3, 2), fs(k, ONE)), F(3, 2), fm(F(2), k)];
  const [X, Y] = form === 'free' ? ['x', 'y'] : ['A', 'B'];
  const lead = form === 'free' ? '' : `Since A + B + C = 180°, cos C = −cos(A + B). `;
  return {
    topic: LARGEST, rank: inside ? 22 : 23,
    text: form === 'free'
      ? `What is the largest value of ${what} over all real numbers x and y?`
      : `What is the largest possible value of ${what}, where A, B and C are the angles of a triangle?`,
    answer: five(d, fq(ans), wrongs.map(fq)),
    solution: `${lead}Let M = ½(${X} + ${Y}) and D = ½(${X} − ${Y}). Then cos ${X} + cos ${Y} = 2 cos M cos D, and cos(${X} + ${Y}) = 2 ${pw('cos', 2, 'M')} − 1. So the expression is 1 + ${fv(k) === 0.5 ? '' : `${fr(fm(F(2), k))} `}cos M cos D − 2 ${pw('cos', 2, 'M')}. For any M, the best D makes cos M cos D as large as it can be, which is u = |cos M|${form === 'free' ? ' (take D = 0, or D = 180° if cos M is negative)' : ' (take A = B, since cos M is positive in a triangle)'}. That leaves 1 + ${cf(fm(F(2), k))}u − 2u<sup>2</sup> with 0 ≤ u ≤ 1, a parabola with its top at u = ${fr(fm(F(1, 2), k))}. `
      + (inside
        ? `This u can be reached${form === 'triangle' ? `, with A = B and cos A = ${fr(fm(F(1, 2), k))}` : ''}, and the value there is 1 + ${fr(fm(F(2), k))}·${fr(fm(F(1, 2), k))} − 2·${fr(sqF(fm(F(1, 2), k)))} = <b>${fr(ans)}</b>.`
        : `That is more than 1, so u can’t reach it. On 0 ≤ u ≤ 1 the parabola only rises, and the largest value is at u = 1: 1 + ${fr(fm(F(2), k))} − 2 = <b>${fr(ans)}</b>.`),
    check: () => {
      const val = form === 'free'
        ? top2((x, y) => K * Math.cos(x) + K * Math.cos(y) - Math.cos(x + y), [0, FULL], [0, FULL])
        : top2((x, y) => (x + y < Math.PI ? K * Math.cos(x) + K * Math.cos(y) - Math.cos(x + y) : -9), [1e-3, Math.PI], [1e-3, Math.PI]);
      return close(val, fv(ans), 1e-6);
    },
  };
};

// ======================================================================================================================
// Parabolas, ellipses and hyperbolas
// ======================================================================================================================
const CONICS = 'Parabolas, ellipses and hyperbolas';
const X2 = 'x<sup>2</sup>', Y2 = 'y<sup>2</sup>';
const part = (t, n) => (n === 1 ? t : over(t, n * n));
const ellipseEq = (a, b) => `${part(X2, a)} + ${part(Y2, b)} = 1`;
const hyperbolaEq = (a, b) => `${part(X2, a)} − ${part(Y2, b)} = 1`;
// a sum of terms [coefficient, what it multiplies] as it reads
const terms = (list) => list.filter(([c]) => c !== 0).map(([c, t], i) => `${i === 0 ? (c < 0 ? '−' : '') : c < 0 ? ' − ' : ' + '}${Math.abs(c) === 1 && t ? '' : Math.abs(c)}${t}`).join('');
const cf = (x) => (fv(x) === 1 ? '' : fr(x));                // a coefficient, with no 1 in front
const kY = (k) => `${cf(k)}${X2}`;                           // k·x² as it reads

// an equation with all its terms multiplied out: complete the squares, then a, b and c
const FOCI_AB = [[5, 3], [5, 4], [13, 5], [13, 12], [10, 6], [10, 8], [4, 2], [3, 1], [3, 2], [4, 1], [4, 3], [5, 2], [6, 2], [6, 4], [17, 8]];
const fociDistance = (d, ctx) => {
  const [[a, b], h, k, form] = pick(ctx, 'foci', [FOCI_AB, [-3, -2, -1, 1, 2, 3, 4], [-4, -2, -1, 1, 2, 3], ['ellipse', 'ellipseV', 'hyper', 'hyperY']]);
  const isE = form[0] === 'e', vertical = form === 'ellipseV' || form === 'hyperY', a2 = a * a, b2 = b * b;
  // the equation (x − h)²/P ± (y − k)²/Q = ±1
  const [P, Q] = vertical ? [b2, a2] : [a2, b2], sx = 1, sy = isE ? 1 : -1, rhs = isE ? 1 : form === 'hyper' ? 1 : -1;
  let A = Q * sx, C = P * sy, Dc = -2 * h * Q * sx, E = -2 * k * P * sy, Fc = Q * sx * h * h + P * sy * k * k - rhs * P * Q;
  const g = [A, C, Dc, E, Fc].reduce((m, v) => gcd(m, v), 0) || 1;
  [A, C, Dc, E, Fc] = [A, C, Dc, E, Fc].map((v) => v / g);
  const c2 = isE ? a2 - b2 : a2 + b2, ans = surd(2, c2);
  const centered = `${over(`(x ${h < 0 ? '+' : '−'} ${Math.abs(h)})<sup>2</sup>`, P)} ${isE ? '+' : '−'} ${over(`(y ${k < 0 ? '+' : '−'} ${Math.abs(k)})<sup>2</sup>`, Q)} = ${rhs < 0 ? '−1' : '1'}`;
  const wrongs = [surd(2, isE ? a2 + b2 : a2 - b2), surd(1, c2), fl(2 * a), fl(2 * b), fl(c2), fl(2 * (a + b)), surd(4, c2), fl(a + b)];
  return {
    topic: CONICS, rank: isE ? 11 : 12,
    text: `The graph of ${terms([[A, X2], [C, Y2], [Dc, 'x'], [E, 'y'], [Fc, '']])} = 0 is ${isE ? 'an ellipse' : 'a hyperbola'}. What is the distance between its foci?`,
    answer: five(d, ans, pos(wrongs)),
    solution: `Complete the square in x and in y, then divide, to get ${centered}. The ${isE ? `larger denominator is a<sup>2</sup> = ${a2} and the smaller is b<sup>2</sup> = ${b2}. For an ellipse, c<sup>2</sup> = a<sup>2</sup> − b<sup>2</sup> = ${c2}` : `denominators are ${a2} and ${b2}. For a hyperbola, c<sup>2</sup> = a<sup>2</sup> + b<sup>2</sup> = ${c2}`}, where c is the distance from the center to a focus. The foci are 2c apart, which is <b>${ans[1]}</b>.`,
    check: () => {
      // points read straight off the printed equation, and the foci from its center: the focal distances must behave
      const cx = -Dc / (2 * A), cy = -E / (2 * C), half = ans[0] / 2, F1 = vertical ? [cx, cy - half] : [cx - half, cy], F2 = vertical ? [cx, cy + half] : [cx + half, cy];
      const yAt = (x) => (-E + Math.sqrt(E * E - 4 * C * (A * x * x + Dc * x + Fc))) / (2 * C);
      const xs = form === 'hyper' ? [1.2, 1.5, 2.1] : form === 'hyperY' ? [0.2, 1.3, 2.4] : [0.1, 0.4, 0.8];
      const reach = form === 'ellipseV' ? b : a, vals = xs.map((t) => { const x = cx + t * reach, Pt = [x, yAt(x)]; return isE ? dist(Pt, F1) + dist(Pt, F2) : Math.abs(dist(Pt, F1) - dist(Pt, F2)); });
      return close(vals[0], vals[1], 1e-6) && close(vals[1], vals[2], 1e-6) && close(vals[0], 2 * a, 1e-6);
    },
  };
};

// a point on a parabola is as far from the focus as from the directrix
const parabolaPoint = (d, ctx) => {
  const [p, gap, form] = pick(ctx, 'parapoint', [[1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6, 8, 9, 12], ['y', 'x']]);
  const dd = gap + p, x = gap, yy = 4 * p * x, op2 = x * x + yy, ans = surd(1, op2);
  const curve = form === 'y' ? `${Y2} = ${4 * p}x` : `${X2} = ${4 * p}y`, focus = form === 'y' ? `(${p}, 0)` : `(0, ${p})`, line = form === 'y' ? `x = −${p}` : `y = −${p}`, along = form === 'y' ? 'x' : 'y', other = form === 'y' ? 'y' : 'x';
  const wrongs = [fl(dd), surd(1, Math.max(dd * dd - p * p, 2)), surd(1, Math.max(yy, 2)), fl(x), surd(1, dd * dd + p * p), surd(1, x * x + 2 * p * x), fl(x + 2 * p), fl(2 * dd), surd(1, dd * dd + yy), surd(1, 2 * op2)];
  return {
    topic: CONICS, rank: 11,
    text: `Point P lies on the parabola ${curve}, and its distance from the focus of the parabola is ${dd}. What is the distance from P to the vertex of the parabola?`,
    answer: five(d, ans, pos(wrongs)),
    solution: `The parabola ${curve} has the form ${form === 'y' ? `${Y2} = 4px` : `${X2} = 4py`} with p = ${p}, so its focus is ${focus} and its directrix is ${line}. A point of the parabola is as far from the focus as from the directrix, so ${along} + ${p} = ${dd} and ${along} = ${x}. Then ${other}<sup>2</sup> = ${4 * p}·${x} = ${yy}. The vertex is the origin, so the distance is √(${x * x} + ${yy}) = <b>${ans[1]}</b>.`,
    check: () => {
      const t = root((v) => Math.hypot(v * v / (4 * p) - p, v) - dd, 1e-9, 4 * dd + 8 * p);
      return close(Math.hypot(t * t / (4 * p), t), ans[0]);
    },
  };
};

// tangents to y = kx²: they meet at the average x, and perpendicular ones meet on the directrix
const PARA_KS = [[1, 1], [2, 1], [1, 2], [1, 4], [1, 3], [3, 1], [1, 8], [3, 4]];
const parabolaTangents = (d, ctx) => {
  const ask = ctx.k % 2 ? 'perp' : 'area', turn = { ...ctx, k: Math.floor(ctx.k / 2) };
  if (ask === 'perp') {
    const [k] = pick(turn, 'tan-perp', [PARA_KS]);
    const ans = F(-k[1], 4 * k[0]);
    return {
      topic: CONICS, rank: 16,
      text: `Points A and B lie on the parabola y = ${kY(k)}, and the tangent lines at A and B are perpendicular. These lines meet at P. What is the y-coordinate of P?`,
      answer: five(d, fq(ans), [fm(F(-1), ans), fm(F(2), ans), fm(F(1, 2), ans), fm(F(4), ans), fd(F(-1), k), fm(F(-1), k), fd(ONE, k)].map(fq)),
      solution: `Let the points have x-coordinates s and t. The tangent at s has slope ${cf(fm(F(2), k))}s and passes through (s, ${cf(k)}s<sup>2</sup>). Setting the two tangent lines equal shows that they meet at x = ½(s + t), where y = ${cf(k)}st. Perpendicular tangents have slopes with product −1, so ${cf(sqF(fm(F(2), k)))}st = −1, and st = ${fr(fd(F(-1), sqF(fm(F(2), k))))}. So y = ${fv(k) === 1 ? '' : `${fr(k)}·`}${par(fd(F(-1), sqF(fm(F(2), k))))} = <b>${fr(ans)}</b>, wherever A and B are. (This line is the directrix.)`,
      check: () => {
        const kv = fv(k), meetY = (s) => { const t = -1 / (4 * kv * kv * s), m1 = 2 * kv * s, m2 = 2 * kv * t, x = (kv * t * t - kv * s * s + m1 * s - m2 * t) / (m1 - m2); return kv * s * s + m1 * (x - s); };
        return close(meetY(0.7), fv(ans)) && close(meetY(2.3), fv(ans));
      },
    };
  }
  const [k, s, t] = pick(turn, 'tan-area', [PARA_KS, [-4, -3, -2, -1, 0, 1], [1, 2, 3, 4, 5, 6]], (kk, x, y) => x < y && y - x >= 2 && !(x === -y));
  const gap = t - s, ans = fm(k, F(gap ** 3, 4)), mx = F(s + t, 2), my = fm(k, F(s * t));
  const Ay = fm(k, F(s * s)), By = fm(k, F(t * t));
  return {
    topic: CONICS, rank: 18,
    text: `The tangent lines to the parabola y = ${kY(k)} at the points with x-coordinates ${num(s, 0)} and ${t} meet at P. What is the area of the triangle whose corners are P and the two points of tangency?`,
    answer: five(d, fq(ans), pos([fm(k, F(gap ** 3, 2)), fm(k, F(gap ** 3, 8)), fm(k, F(gap ** 2, 2)), fm(k, F(gap ** 3)), fm(k, F(gap ** 3, 12)), fm(k, F(gap ** 3, 6))].map(fq))),
    solution: `The tangents meet at x = ½(${num(s, 0)} + ${t}) = ${fr(mx)}, where y = ${fv(k) === 1 ? '' : `${fr(k)}·`}${by(s)}·${t} = ${fr(my)}, so P = (${fr(mx)}, ${fr(my)}). (The tangent at s has the equation y = ${cf(fm(F(2), k))}s·x − ${cf(k)}s<sup>2</sup>, and setting two of them equal gives this point.) The midpoint M of the chord has the same x-coordinate as P, so PM is vertical. At that x the chord is at height ${fr(fm(F(1, 2), fa(Ay, By)))}, so PM = ${fr(fs(fm(F(1, 2), fa(Ay, By)), my))}. The vertical segment PM cuts the triangle into two parts with a total horizontal width of ${gap}, so the area is ½·${gap}·${fr(fs(fm(F(1, 2), fa(Ay, By)), my))} = <b>${fr(ans)}</b>.`,
    check: () => {
      const kv = fv(k), slope = (x) => (kv * (x + 1e-6) ** 2 - kv * (x - 1e-6) ** 2) / 2e-6, A = [s, kv * s * s], B = [t, kv * t * t], m1 = slope(s), m2 = slope(t), x = (B[1] - A[1] + m1 * s - m2 * t) / (m1 - m2), P = [x, A[1] + m1 * (x - s)];
      return close(shoelace([A, B, P]), fv(ans), 1e-5);
    },
  };
};

// a chord through the focus of y² = 4px: x₁x₂ = p², so 1/PF + 1/QF = 1/p
const FOCAL = [];
for (const p of [1, 2, 3, 4, 5, 6]) for (let u = p + 1; u <= 30; u++) { const q = F(p * u, u - p); if (q[1] <= 6 && u !== 2 * p) FOCAL.push([p, u]); }
const SLOPE_LIST = [[1, 1], [2, 1], [1, 2], [3, 4], [4, 3], [3, 1], [1, 3], [2, 3]];
const focalChord = (d, ctx) => {
  const ask = ctx.k % 2 ? 'length' : 'partner', turn = { ...ctx, k: Math.floor(ctx.k / 2) };
  if (ask === 'partner') {
    const [[p, u]] = pick(turn, 'focal-partner', [FOCAL]);
    const x1 = u - p, x2 = F(p * p, x1), ans = F(p * u, u - p);
    return {
      topic: CONICS, rank: 17,
      text: `A line through the focus F of the parabola ${Y2} = ${4 * p}x meets the parabola at P and Q. If PF = ${u}, what is QF?`,
      answer: five(d, fq(ans), pos([F(u), F(p * p, u), F(u - p), F(4 * p), F(2 * p * u, u + p), fa(F(p * p, u), F(p)), F(p * u, u + p), fd(ONE, fs(F(1, p), F(1, 4 * u)))].map(fq))),
      solution: `The focus is F = (${p}, 0) and the directrix is x = −${p}, so a point of the parabola at x-coordinate x is x + ${p} from F. So P has x-coordinate ${u} − ${p} = ${x1}. Write the line as x = ${p} + my. Putting this into the parabola gives y<sup>2</sup> − ${4 * p}my − ${4 * p * p} = 0, so the y-coordinates multiply to −${4 * p * p}. Then the x-coordinates, each y<sup>2</sup>/${4 * p}, multiply to ${4 * p * p}<sup>2</sup>/${4 * p}<sup>2</sup> = ${p * p}. So Q has x-coordinate ${p * p} ÷ ${x1} = ${fr(x2)}, and QF = ${fr(x2)} + ${p} = <b>${fr(ans)}</b>.`,
      check: () => {
        const y1 = 2 * Math.sqrt(p * x1), m = (x1 - p) / y1, y2 = root((y) => y * y / (4 * p) - p - m * y, -1e6, -1e-9);
        return close(Math.hypot(y2 * y2 / (4 * p) - p, y2), fv(ans), 1e-6) && close(Math.hypot(x1 - p, y1), u);
      },
    };
  }
  const [p, s] = pick(turn, 'focal-length', [[1, 2, 3, 4, 5, 6], SLOPE_LIST]);
  const m2 = sqF(s), ans = fm(F(4 * p), fa(ONE, fd(ONE, m2))), sumX = fa(F(2 * p), fd(F(4 * p), m2));
  return {
    topic: CONICS, rank: 16,
    text: `A line with slope ${fr(s)} through the focus of the parabola ${Y2} = ${4 * p}x meets the parabola at P and Q. What is the length of PQ?`,
    answer: five(d, fq(ans), pos([fm(F(4 * p), fa(ONE, m2)), F(4 * p), fd(F(4 * p), m2), fm(F(2 * p), fa(ONE, fd(ONE, m2))), sumX, fm(F(4 * p), fa(ONE, fd(ONE, s))), fm(F(8 * p), fd(ONE, m2)), fm(F(2), ans), fm(F(1, 2), ans), fa(ans, F(p))].map(fq))),
    solution: `The focus is (${p}, 0), and each point of the parabola is its x-coordinate plus ${p} away from the focus. Since the chord passes through the focus, PQ = PF + QF = x₁ + x₂ + ${2 * p}. The line is y = ${fr(s)}(x − ${p}). Putting this into the parabola gives ${fr(m2)}(x − ${p})<sup>2</sup> = ${4 * p}x, a quadratic whose roots add up to ${2 * p} + ${4 * p} ÷ ${fr(m2)} = ${fr(sumX)}. So PQ = ${fr(sumX)} + ${2 * p} = <b>${fr(ans)}</b>.`,
    check: () => {
      const mv = fv(s), g = (x) => mv * mv * (x - p) ** 2 - 4 * p * x, x1 = root(g, 1e-12, p), x2 = root(g, p, 1e7);
      return close(Math.hypot(x2 - x1, mv * (x2 - x1)), fv(ans), 1e-6);
    },
  };
};

// on an ellipse, x = a cos t and y = b sin t turn a largest value into a wave
const ELLIPSES = [[5, 3], [4, 3], [5, 4], [3, 2], [2, 1], [4, 1], [3, 1], [6, 2], [5, 2], [4, 2], [7, 3], [6, 5]];
const LINE_DIRS = [[1, 1], [1, 2], [2, 1], [3, 4], [4, 3], [1, 3], [3, 1], [2, 3], [5, 12], [12, 5]];
const ellipseMax = (d, ctx) => {
  const [[A, B], [p, q], ask, extra] = pick(ctx, 'ellmax', [ELLIPSES, LINE_DIRS, ['linear', 'linear', 'xy', 'gap'], [1, 3, 7, 12]], (e, l, w) => (w !== 'xy' || (l[0] === 1 && l[1] === 1)) && (w !== 'gap' || isSquare(l[0] ** 2 + l[1] ** 2)));
  const N = p * p * A * A + q * q * B * B, S = Math.sqrt(N), c = Math.ceil(S) + extra, nn = p * p + q * q, len = isSquare(nn) ? `${Math.round(Math.sqrt(nn))}` : `√${nn}`;
  const ell = ellipseEq(A, B), P = `${p === 1 ? '' : p}x`, Q = `${q === 1 ? '' : q}y`, root1 = Math.round(Math.sqrt(nn));
  const ans = { linear: surd(1, N), xy: fl(A * B, 2), gap: mix(c, -1, N, root1) }[ask];
  const wrongs = {
    linear: [fl(p * A + q * B), fl(N), surd(1, nn * A * A), surd(1, nn * (A * A + B * B)), fl(p * A), fl(q * B), surd(1, p * p * A + q * q * B), fl((p + q) * A)],
    xy: [fl(A * B), fl(A * B, 4), fl(2 * A * B), fl(A * A + B * B, 2), fl(A + B), fl(A * B, 3), fl(A * A + B * B, 4)],
    gap: [mix(c, 1, N, root1), mix(c, -1, N), fl(c - p * A - q * B, root1), fl(c, root1), mix(c, -1, N, nn), fl(Math.abs(c - p * A), root1), fl(c - q * B, root1)],
  }[ask];
  const wave = `${P} + ${Q} = ${coef(p * A, 'cos t')} + ${coef(q * B, 'sin t')}`;
  return {
    topic: CONICS, rank: { linear: 14, xy: 13, gap: 16 }[ask],
    text: {
      linear: `What is the largest value of ${P} + ${Q} for points (x, y) on the ellipse ${ell}?`,
      xy: `What is the largest value of xy for points (x, y) on the ellipse ${ell}?`,
      gap: `What is the shortest distance between a point of the ellipse ${ell} and a point of the line ${P} + ${Q} = ${c}?`,
    }[ask],
    answer: five(d, ans, pos(wrongs)),
    solution: `Every point of the ellipse can be written x = ${coef(A, 'cos t')}, y = ${coef(B, 'sin t')}. ` + {
      linear: `Then ${wave}, a wave of height √(${p * p * A * A} + ${q * q * B * B}). So the largest value is <b>${ans[1]}</b>.`,
      xy: `Then xy = ${A * B} sin t cos t = ${A * B === 2 ? '' : `${frac(A * B, 2)} `}sin 2t, which is largest when sin 2t = 1. So the largest value is <b>${ans[1]}</b>.`,
      gap: `Then ${wave}, a wave of height √${N}, so ${P} + ${Q} is at most √${N} on the ellipse, which is less than ${c}. The ellipse is entirely on one side of the line, and the distance from a point (x, y) to the line is (${c} − (${P} + ${Q})) ÷ ${len}. This is smallest when ${P} + ${Q} is largest, so the shortest distance is <b>${ans[1]}</b>.`,
    }[ask],
    check: () => {
      if (ask === 'xy') return close(top((t) => A * Math.cos(t) * B * Math.sin(t), 0, FULL), ans[0], 1e-6);
      const biggest = top((t) => p * A * Math.cos(t) + q * B * Math.sin(t), 0, FULL);
      return close(ask === 'linear' ? biggest : (c - biggest) / Math.hypot(p, q), ans[0], 1e-6);
    },
  };
};

// a right angle at the vertex of y = kx²: st = −1/k² for the x-coordinates, so the chord has a fixed point
const orthogonalChord = (d, ctx) => {
  const [k, ask] = pick(ctx, 'orthochord', [PARA_KS, ['point', 'area']]);
  const one = fd(ONE, k), ans = ask === 'point' ? one : sqF(one);
  const wrongs = ask === 'point' ? [fm(F(1, 2), one), fm(F(2), one), k, fm(F(1, 4), one), sqF(one), fm(F(4), one)] : [one, fm(F(1, 2), sqF(one)), fm(F(2), sqF(one)), fm(F(1, 4), sqF(one)), fm(F(4), sqF(one)), fm(F(1, 2), one)];
  return {
    topic: CONICS, rank: ask === 'point' ? 17 : 19,
    text: ask === 'point'
      ? `Points A and B lie on the parabola y = ${kY(k)}, on either side of the vertex O, and ∠AOB = 90°. For every such pair of points, line AB passes through the same point of the y-axis. What is the y-coordinate of that point?`
      : `Points A and B lie on the parabola y = ${kY(k)}, on either side of the vertex O, and ∠AOB = 90°. What is the smallest possible area of triangle OAB?`,
    answer: five(d, fq(ans), wrongs.map(fq)),
    solution: `Let A and B have x-coordinates s and t. The right angle says the slopes ${cf(k)}s and ${cf(k)}t have product −1, so st = ${fr(fm(F(-1), sqF(one)))}. Line AB has slope ${cf(k)}(s + t) and crosses the y-axis at ${fv(k) === 1 ? '−st' : `−${fr(k)}·st`} = ${fr(one)}. `
      + (ask === 'point'
        ? `So the answer is <b>${fr(ans)}</b>.`
        : `The y-axis cuts triangle OAB into two triangles with a common base of length ${fr(one)} on the y-axis, and their heights |s| and |t| add up to |s| + |t|. So the area is ½·${fr(one)}·(|s| + |t|). By AM-GM, |s| + |t| ≥ 2√|st| = ${fr(fm(F(2), one))}, with equality when |s| = |t|. So the smallest area is ½·${fr(one)}·${fr(fm(F(2), one))} = <b>${fr(ans)}</b>.`),
    check: () => {
      const kv = fv(k), pts = (s) => { const t = -1 / (kv * kv * s); return [[s, kv * s * s], [t, kv * t * t]]; };
      if (ask === 'point') return [0.6, 2.7].every((s) => { const [U, V] = pts(s), h = U[1] + ((V[1] - U[1]) * (0 - U[0])) / (V[0] - U[0]); return close(angle([0, 0], U, V), Math.PI / 2) && close(h, fv(ans)); });
      return close(-top((f) => { const [U, V] = pts(Math.tan(f)); return -shoelace([[0, 0], U, V]); }, 1e-3, Math.PI / 2 - 1e-3, 6000), fv(ans), 1e-6);
    },
  };
};

// the triangle made by a point and the two foci: the focal sum (or difference) and the law of cosines give the product
// of the two focal distances, and the angle then gives the area
const FOCAL_E = [[5, 3, [60, 90]], [5, 4, [60]], [13, 5, [60, 90, 120]], [10, 6, [60, 90]], [10, 8, [60]], [25, 7, [60, 90, 120]], [17, 8, [60, 90, 120]], [3, 1, [60, 90, 120]], [3, 2, [60, 90]], [4, 1, [60, 90, 120]], [4, 2, [60, 90]], [5, 2, [60, 90, 120]], [2, 1, [60, 90]]].flatMap(([a, b, L]) => L.map((t) => ['ellipse', a, b, t]));
const FOCAL_H = [[3, 4], [4, 3], [5, 12], [12, 5], [1, 1], [2, 1], [1, 2], [2, 3], [3, 2], [8, 15], [3, 1], [1, 3]].flatMap(([a, b]) => [60, 90, 120].map((t) => ['hyperbola', a, b, t]));
const focalTriangle = (d, ctx) => {
  const [[curve, a, b, th], ask] = pick(ctx, 'focaltri', [[...FOCAL_E, ...FOCAL_H], ['area', 'area', 'product']]);
  const isE = curve === 'ellipse', b2 = b * b, c2 = isE ? a * a - b * b : a * a + b * b, cosT = { 60: F(1, 2), 90: F(0), 120: F(-1, 2) }[th];
  const prod = fd(F(2 * b2), isE ? fa(ONE, cosT) : fs(ONE, cosT)), sinText = { 60: '√3/2', 90: '1', 120: '√3/2' }[th];
  const area = th === 90 ? fq(fm(F(1, 2), prod)) : fracSurd(prod[0], 4 * prod[1], 3);    // ½·product·(√3/2)
  const ans = ask === 'area' ? area : fq(prod), eq = isE ? ellipseEq(a, b) : hyperbolaEq(a, b);
  const swap = fd(F(2 * b2), isE ? fs(ONE, cosT) : fa(ONE, cosT));
  const wrongs = ask === 'area'
    ? [th === 90 ? fq(fm(F(1, 2), swap)) : fracSurd(swap[0], 4 * swap[1], 3), fl(b2), fl(2 * b2), fl(a * b), fl(a * a), fl(c2), fracSurd(b2, 1, 3), fracSurd(b2, 2, 3), fracSurd(a * b, 2, 3), fl(b2, 2)]
    : [fq(swap), fl(2 * b2), fl(4 * b2), fl(b2), fl(2 * a * a), fl(2 * c2), fl(a * a), fl(a * b), fl(4 * b2, 3), fl(2 * b2, 3), fl(8 * b2), fl(c2)];
  const relation = isE
    ? `A point of the ellipse has u + v = 2a = ${2 * a}, where u and v are its distances to the foci. The foci are 2c apart, with c<sup>2</sup> = ${a * a} − ${b2} = ${c2}. The law of cosines says 4c<sup>2</sup> = u<sup>2</sup> + v<sup>2</sup> − 2uv cos ${th}° = (u + v)<sup>2</sup> − 2uv(1 + cos ${th}°). So 2uv(1 + cos ${th}°) = 4a<sup>2</sup> − 4c<sup>2</sup> = ${4 * b2}`
    : `A point of the hyperbola has |u − v| = 2a = ${2 * a}, where u and v are its distances to the foci. The foci are 2c apart, with c<sup>2</sup> = ${a * a} + ${b2} = ${c2}. The law of cosines says 4c<sup>2</sup> = u<sup>2</sup> + v<sup>2</sup> − 2uv cos ${th}° = (u − v)<sup>2</sup> + 2uv(1 − cos ${th}°). So 2uv(1 − cos ${th}°) = 4c<sup>2</sup> − 4a<sup>2</sup> = ${4 * b2}`;
  return {
    topic: CONICS, rank: isE ? (ask === 'area' ? 19 : 18) : (ask === 'area' ? 21 : 20),
    text: `Point P lies on the ${curve} ${eq}, whose foci are F₁ and F₂, and ∠F₁PF₂ = ${th}°. What is ${ask === 'area' ? 'the area of triangle F₁PF₂' : 'PF₁·PF₂'}?`,
    answer: five(d, ans, pos(wrongs)),
    solution: `${relation}, and uv = ${fr(prod)}. ${ask === 'area' ? `The area is ½uv sin ${th}° = ½·${fr(prod)}·${sinText} = <b>${ans[1]}</b>.` : `So PF₁·PF₂ = <b>${ans[1]}</b>.`}`,
    check: () => {
      const c = Math.sqrt(c2), F1 = [-c, 0], F2 = [c, 0], T = rad(th);
      const at = isE ? (t) => [a * Math.cos(t), b * Math.sin(t)] : (t) => [a / Math.cos(t), b * Math.tan(t)];
      const t = root((v) => angle(at(v), F1, F2) - T, 1e-6, Math.PI / 2 - 1e-6), Pt = at(t);
      return close(angle(Pt, F1, F2), T) && close(ask === 'area' ? shoelace([F1, F2, Pt]) : dist(Pt, F1) * dist(Pt, F2), ans[0], 1e-6);
    },
  };
};

// an ellipse tangent to the x-axis: the tangent point makes the focal sum smallest, and a reflection finds it
const REFLECTS = [[1, 2, 4], [2, 3, 12], [1, 3, 3], [3, 5, 6], [2, 4, 8], [5, 7, 5], [4, 5, 12], [7, 8, 8], [3, 5, 15], [5, 7, 9], [7, 9, 12], [11, 13, 7], [9, 11, 21], [1, 4, 12], [2, 6, 6], [4, 8, 16], [3, 9, 16], [3, 4, 24]];
const reflectTangent = (d, ctx) => {
  const [[y1, y2, gap], x1, ask] = pick(ctx, 'reflect', [REFLECTS, [-3, -1, 0, 2, 5], ['major', 'minor', 'touch']]);
  const x2 = x1 + gap, big = Math.sqrt(gap * gap + (y1 + y2) ** 2), major = Math.round(big), minorSq = 4 * y1 * y2, cc = gap * gap + (y2 - y1) ** 2;
  const touch = fa(F(x1), F(gap * y1, y1 + y2));
  const ans = { major: fl(major), minor: surd(2, y1 * y2), touch: fq(touch) }[ask];
  const wrongs = {
    major: [surd(1, cc), fl(y1 + y2), fl(gap), fl(gap + y1 + y2), fl(2 * major), fl(major + 2), fl(major - 2)],
    minor: [fl(y1 * y2), surd(1, y1 * y2), surd(2, y1 + y2), fl(y1 + y2), surd(1, minorSq + cc), fl(2 * y1), fl(2 * y2)],
    touch: [fq(F(2 * x1 + gap, 2)), fq(fa(F(x1), F(gap * y2, y1 + y2))), fq(F(x1 + 1)), fq(F(x2)), fq(F(x1)), fq(fa(F(x1), F(y1 * y2, gap)))],
  }[ask];
  const what = { major: 'the length of its major axis', minor: 'the length of its minor axis', touch: 'the x-coordinate of the point where it touches the x-axis' }[ask];
  return {
    topic: CONICS, rank: { major: 20, minor: 21, touch: 19 }[ask],
    text: `An ellipse has foci at (${num(x1, 0)}, ${y1}) and (${num(x2, 0)}, ${y2}), and it touches the x-axis at exactly one point. What is ${what}?`,
    answer: five(d, ans, ask === 'touch' ? wrongs : pos(wrongs)),
    solution: `Every point of the x-axis except the tangent point T is outside the ellipse, so T is the point of the axis where the sum of the distances to the foci is smallest, and that smallest sum is the major axis. Reflect the first focus over the x-axis to F′ = (${num(x1, 0)}, −${y1}). For any P on the axis, the sum equals PF′ + PF₂, which is smallest when P is on the straight segment from F′ to F₂. ` + {
      major: `That smallest sum is F′F₂ = √(${gap}<sup>2</sup> + ${y1 + y2}<sup>2</sup>) = <b>${ans[1]}</b>.`,
      minor: `That smallest sum is 2a = √(${gap}<sup>2</sup> + ${y1 + y2}<sup>2</sup>) = ${major}. The foci are 2c = √(${gap}<sup>2</sup> + ${y2 - y1}<sup>2</sup>) apart. So (2b)<sup>2</sup> = (2a)<sup>2</sup> − (2c)<sup>2</sup> = ${y1 + y2}<sup>2</sup> − ${y2 - y1}<sup>2</sup> = ${minorSq}, and the minor axis is <b>${ans[1]}</b>.`,
      touch: `The segment from F′ to F₂ climbs ${y1 + y2} in all while moving ${gap} across, and it reaches the axis after climbing ${y1}. So T is ${frac(y1, y1 + y2)} of the way across, and its x-coordinate is ${num(x1, 0)} + ${frac(y1, y1 + y2)}·${gap} = <b>${fr(touch)}</b>.`,
    }[ask],
    check: () => {
      const f = (x) => Math.hypot(x - x1, y1) + Math.hypot(x - x2, y2), T = dip(f, x1 - 60, x2 + 60), a = f(T) / 2, c = Math.hypot(gap, y2 - y1) / 2;
      return close({ major: 2 * a, minor: 2 * Math.sqrt(a * a - c * c), touch: T }[ask], ans[0], 1e-5);
    },
  };
};

// a hyperbola’s tangents and asymptotes: the triangle they cut off never changes size
const XY_POINTS = [[2, 3], [1, 6], [3, 4], [2, 5], [1, 8], [3, 5], [4, 5], [2, 7], [2, 9], [3, 7], [1, 12], [4, 7]];
const SEC_PAIRS = [[5, 4, 3], [5, 3, 4], [13, 12, 5], [13, 5, 12], [17, 15, 8], [17, 8, 15]];   // x₀/a = s/q, y₀/b = t/q with s² − t² = q²
const ASYM_PAIRS = [[3, 2], [4, 3], [3, 4], [6, 4], [8, 6], [5, 3], [9, 4], [12, 5], [4, 1], [15, 8], [2, 1]];
const hyperbolaTangent = (d, ctx) => {
  const ask = ['asym', 'prod', 'xy'][ctx.k % 3], turn = { ...ctx, k: Math.floor(ctx.k / 3) };
  if (ask === 'xy') {
    const [[u, v]] = pick(turn, 'hyp-xy', [XY_POINTS]);
    const k = u * v, ans = fl(2 * k);
    return {
      topic: CONICS, rank: 16,
      text: `The line tangent to the hyperbola xy = ${k} at the point (${u}, ${v}) meets the x-axis at P and the y-axis at Q. What is the area of triangle OPQ, where O is the origin?`,
      answer: five(d, ans, [fl(k), fl(4 * k), fl(k, 2), fl((u + v) ** 2, 2), fl((u + v) ** 2), fl(u * u + v * v), fl(3 * k)]),
      solution: `Let the line have intercepts p on the x-axis and q on the y-axis, so y = q(1 − x/p). Putting this into xy = ${k} gives (q/p)x<sup>2</sup> − qx + ${k} = 0, whose roots add up to p. A tangent line means a double root, so that root is x = p/2. So the point of tangency has x = p/2, and in the same way y = q/2: it is the midpoint of the segment PQ. Then p = ${2 * u} and q = ${2 * v}, and the area is ½·${2 * u}·${2 * v} = 2·${k} = <b>${ans[1]}</b>.`,
      check: () => {
        const yAt = (x) => k / x, m = (yAt(u + 1e-6) - yAt(u - 1e-6)) / 2e-6, Px = u - v / m, Qy = v - m * u;
        return close(Math.abs(Px * Qy) / 2, ans[0], 1e-5);
      },
    };
  }
  const [[a, b]] = pick(turn, `hyp-${ask}`, [ASYM_PAIRS]);
  const eq = hyperbolaEq(a, b), a2 = a * a, b2 = b * b, c2 = a2 + b2;
  if (ask === 'prod') {
    const ans = F(a2 * b2, c2);
    return {
      topic: CONICS, rank: 19,
      text: `Point P lies on the hyperbola ${eq}. What is the product of the distances from P to the two asymptotes of the hyperbola?`,
      answer: five(d, fq(ans), pos([F(a * b), F(a2 * b2, Math.abs(a2 - b2) || 1), F(a * b, c2), F(a2 * b2, (a + b) ** 2), F(c2, a * b), F(a2 * b2, 2 * c2), F(2 * a2 * b2, c2)].map(fq))),
      solution: `The asymptotes are the lines ${b === 1 ? '' : b}x − ${a === 1 ? '' : a}y = 0 and ${b === 1 ? '' : b}x + ${a === 1 ? '' : a}y = 0. The distance from P = (x, y) to each line has √(${b2} + ${a2}) in its denominator, so the product of the distances is |${b2 === 1 ? '' : b2}x<sup>2</sup> − ${a2 === 1 ? '' : a2}y<sup>2</sup>| ÷ ${c2}. Multiplying the equation of the hyperbola by ${a2 * b2} shows that ${b2 === 1 ? '' : b2}x<sup>2</sup> − ${a2 === 1 ? '' : a2}y<sup>2</sup> = ${a2 * b2} at every point of it. So the product is always ${a2 * b2} ÷ ${c2} = <b>${fr(ans)}</b>.`,
      check: () => {
        const c = Math.sqrt(c2);
        return [1.3, 2.9].every((t) => { const x = a * t, y = b * Math.sqrt(t * t - 1); return close((Math.abs(b * x - a * y) / c) * (Math.abs(b * x + a * y) / c), fv(ans)); });
      },
    };
  }
  const [q, s, t] = SEC_PAIRS[(turn.k + a) % SEC_PAIRS.length];
  // the point (a·q/t, b·s/t), with q² − s² = t²
  const x0 = F(a * q, t), y0 = F(b * s, t), ans = fl(a * b), lower = fs(fd(F(q), F(t)), fd(F(s), F(t))), upper = fa(fd(F(q), F(t)), fd(F(s), F(t)));
  return {
    topic: CONICS, rank: 20,
    text: `The line tangent to the hyperbola ${eq} at the point (${fr(x0)}, ${fr(y0)}) meets the two asymptotes at U and V. What is the area of triangle OUV, where O is the origin?`,
    answer: five(d, ans, pos([fl(2 * a * b), fl(a * b, 2), fl(c2), fl(c2, 2), fq(fm(x0, y0)), fq(fm(F(2), fm(x0, y0))), fl(4 * a * b)])),
    solution: `Write the point as (${a}r, ${b}w), with r = ${fr(F(q, t))} and w = ${fr(F(s, t))}, so that r<sup>2</sup> − w<sup>2</sup> = 1. The tangent at a point (x₀, y₀) of the hyperbola is x₀x/${a2} − y₀y/${b2} = 1, which here is rx/${a} − wy/${b} = 1. On the asymptote y = ${fr(F(b, a))}x this gives (r − w)x/${a} = 1, so U = (${a}/(r − w), ${b}/(r − w)), with r − w = ${fr(lower)}. On y = −${fr(F(b, a))}x it gives (r + w)x/${a} = 1, so V = (${a}/(r + w), −${b}/(r + w)), with r + w = ${fr(upper)}. Since (r − w)(r + w) = 1, the area is half of |(x of U)(y of V) − (x of V)(y of U)|, which is ½·2·${a}·${b}·1 = <b>${ans[1]}</b>, the same at every point of the hyperbola.`,
    check: () => {
      const X = fv(x0), yAt = (x) => b * Math.sqrt(x * x / a2 - 1), m = (yAt(X + 1e-6) - yAt(X - 1e-6)) / 2e-6, Y = yAt(X), slope = b / a;
      const meet = (g) => { const x = (Y - m * X) / (g - m); return [x, g * x]; };
      return close(shoelace([[0, 0], meet(slope), meet(-slope)]), ans[0], 1e-5);
    },
  };
};

// a circle and a parabola, or a circle and xy = K: substituting gives a quartic, and Vieta gives the fourth point
const MEETS_P = [];
for (const x1 of [-7, -5, -4, -3, -2, -1]) for (const x2 of [-1, 1, 2, 3]) for (const x3 of [2, 3, 4, 5, 6, 8]) {
  const x4 = -(x1 + x2 + x3);
  if (x1 < x2 && x2 < x3 && x4 !== 0 && ![x1, x2, x3].includes(x4) && Math.abs(x4) <= 9) MEETS_P.push([x1, x2, x3]);
}
const MEETS_H = [];
for (const K of [6, 8, 12, 18, 24, 30]) {
  const divs = []; for (let v = 1; v <= K; v++) if (K % v === 0) divs.push(v, -v);
  for (let i = 0; i < divs.length; i++) for (let j = i + 1; j < divs.length; j++) for (let l = j + 1; l < divs.length; l++) {
    const t = [divs[i], divs[j], divs[l]], x4 = F(K * K, t[0] * t[1] * t[2]);
    if (x4[1] <= 6 && Math.abs(fv(x4)) <= K && !t.some((v) => v === fv(x4)) && t.some((v) => v < 0) && t.some((v) => v > 0)) MEETS_H.push([K, ...t.sort((p, q) => p - q)]);
  }
}
const circleMeet = (d, ctx) => {
  const form = ctx.k % 2 ? 'para' : 'hyper', turn = { ...ctx, k: Math.floor(ctx.k / 2) };
  const circleThrough = (P) => {
    const [[a1, b1], [a2, b2], [a3, b3]] = P, s = P.map(([x, y]) => -(x * x + y * y)), det = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    const M = [[a1, b1, 1], [a2, b2, 1], [a3, b3, 1]], D0 = det(M);
    const col = (i) => M.map((r, j) => r.map((v, c) => (c === i ? s[j] : v)));
    return [det(col(0)) / D0, det(col(1)) / D0, det(col(2)) / D0];
  };
  if (form === 'para') {
    const [[x1, x2, x3], k, ask] = pick(turn, 'meet-p', [MEETS_P, [[1, 1], [2, 1], [1, 2]], ['x', 'y']]);
    const sum = x1 + x2 + x3, x4 = -sum, y4 = fm(k, F(x4 * x4)), ans = ask === 'x' ? fl(x4) : fq(y4);
    const wrongs = (ask === 'x' ? [sum, -sum / 2, sum / 2, x1 * x2 * x3, -(x1 + x2 - x3), -(x1 - x2 + x3), x1 + x2 - x3, sum + 1, sum - 1, x4 + 1, x4 - 1].map((v) => fq(F(2 * v, 2))) : [fm(k, F(sum)), fm(k, F(x1 * x1 + x2 * x2 + x3 * x3)), F(x4 * x4), fm(k, F((x1 + x2 - x3) ** 2)), fm(k, F((x4 + 1) ** 2)), fm(k, F((x4 - 1) ** 2)), fm(F(2), y4), fm(F(1, 2), y4), fm(k, F(x4 * x4 + 1)), fm(k, F(x4 * x4 - 1))].map(fq));
    return {
      topic: CONICS, rank: 19,
      text: `A circle meets the parabola y = ${kY(k)} at exactly four points. Three of them have x-coordinates ${num(x1, 0)}, ${num(x2, 0)} and ${num(x3, 0)}. What is the ${ask === 'x' ? 'x' : 'y'}-coordinate of the fourth point?`,
      answer: five(d, ans, ask === 'y' ? pos(wrongs) : wrongs),
      solution: `Write the circle as x<sup>2</sup> + y<sup>2</sup> + Dx + Ey + F = 0 and put in y = ${kY(k)}. This gives a fourth-degree equation in x whose terms are x<sup>4</sup>, x<sup>2</sup>, x and a constant (after dividing by the coefficient of x<sup>4</sup>), with no x<sup>3</sup> term. So by Vieta the four x-coordinates add up to 0, and the fourth is −(${by(x1)} + ${by(x2)} + ${by(x3)}) = ${num(x4, 0)}.${ask === 'y' ? ` Its y-coordinate is ${fv(k) === 1 ? '' : `${fr(k)}·`}(${num(x4, 0)})<sup>2</sup> = <b>${fr(y4)}</b>.` : ` So the answer is <b>${ans[1]}</b>.`}`,
      check: () => {
        const kv = fv(k), P = [x1, x2, x3].map((x) => [x, kv * x * x]), [Dc, E, Fc] = circleThrough(P), g = (x) => x * x + (kv * x * x) ** 2 + Dc * x + E * kv * x * x + Fc, rs = zeros(g, -40, 40, 16000);
        const other = rs.filter((x) => ![x1, x2, x3].some((v) => Math.abs(v - x) < 1e-5));
        return rs.length === 4 && other.length === 1 && close(ask === 'x' ? other[0] : kv * other[0] ** 2, ans[0], 1e-5);
      },
    };
  }
  const [[K, x1, x2, x3]] = pick(turn, 'meet-h', [MEETS_H]);
  const prod = x1 * x2 * x3, x4 = F(K * K, prod), ans = fq(x4);
  const wrongs = [F(K, prod), F(prod, K * K), F(K * K, x1 + x2 + x3 || 1), F(-(K * K), prod), F(-(x1 + x2 + x3)), F(K, x1 * x2), F(prod, K), fm(F(2), x4), fm(F(1, 2), x4), fa(x4, ONE), fs(x4, ONE)];
  return {
    topic: CONICS, rank: 22,
    text: `A circle meets the hyperbola xy = ${K} at exactly four points. Three of them have x-coordinates ${num(x1, 0)}, ${num(x2, 0)} and ${num(x3, 0)}. What is the x-coordinate of the fourth point?`,
    answer: five(d, ans, wrongs.map(fq)),
    solution: `Write the circle as x<sup>2</sup> + y<sup>2</sup> + Dx + Ey + F = 0, and put in y = ${K}/x. Multiplying by x<sup>2</sup> gives x<sup>4</sup> + Dx<sup>3</sup> + Fx<sup>2</sup> + ${K}Ex + ${K * K} = 0. By Vieta, the four x-coordinates multiply to the constant term, ${K * K}. So the fourth is ${K * K} ÷ (${by(x1)}·${by(x2)}·${by(x3)}) = ${K * K} ÷ ${by(prod)} = <b>${fr(x4)}</b>.`,
    check: () => {
      const P = [x1, x2, x3].map((x) => [x, K / x]), [Dc, E, Fc] = circleThrough(P), g = (x) => x * x + (K / x) ** 2 + Dc * x + (E * K) / x + Fc;
      const rs = [...zeros(g, -4 * K, -1e-3, 40000), ...zeros(g, 1e-3, 4 * K, 40000)], other = rs.filter((x) => ![x1, x2, x3].some((v) => Math.abs(v - x) < 1e-5));
      return rs.length === 4 && other.length === 1 && close(other[0], fv(x4), 1e-5);
    },
  };
};

// a rectangle (tilted or not) with all four sides touching an ellipse: the distance from the center to a tangent line
// in a given direction, and AM-GM
const RECT_ELL = [[5, 3], [4, 3], [5, 4], [3, 2], [2, 1], [3, 1], [4, 1], [6, 2], [5, 2], [7, 1], [6, 3], [4, 2], [5, 1], [8, 6], [7, 4]];
const circumscribedRect = (d, ctx) => {
  const ask = ctx.k % 2 ? 'diag' : 'area', [[a, b]] = pick({ ...ctx, k: Math.floor(ctx.k / 2) }, `rect-${ask}`, [RECT_ELL]);
  const S = a * a + b * b, ans = ask === 'area' ? fl(2 * S) : surd(2, S), eq = ellipseEq(a, b);
  const wrongs = ask === 'area'
    ? [fl(4 * a * b), fl(2 * a * b), fl((a + b) ** 2), fl(4 * S), fl(S), fl(2 * (a + b) ** 2), fl(3 * S), fl(4 * (a + b) ** 2)]
    : [surd(1, S), surd(4, S), fl(2 * a), fl(2 * (a + b)), fl(a + b), surd(2, a * a - b * b), fl(2 * b)];
  return {
    topic: CONICS, rank: ask === 'area' ? 23 : 22,
    text: ask === 'area'
      ? `A rectangle, not necessarily with sides parallel to the axes, has all four of its sides tangent to the ellipse ${eq}. What is the largest possible area of the rectangle?`
      : `A rectangle, not necessarily with sides parallel to the axes, has all four of its sides tangent to the ellipse ${eq}. What is the length of a diagonal of the rectangle?`,
    answer: five(d, ans, pos(wrongs)),
    solution: `Take a direction at angle θ and look at the tangent line perpendicular to it. On the ellipse, x = ${coef(a, 'cos t')} and y = ${coef(b, 'sin t')}, so x cos θ + y sin θ = ${coef(a, 'cos θ cos t')} + ${coef(b, 'sin θ sin t')}, a wave in t of height h = √(${coef(a * a, pw('cos', 2, 'θ'))} + ${coef(b * b, pw('sin', 2, 'θ'))}). So that tangent line is h from the center. The perpendicular pair of sides is k from the center, where k = √(${coef(a * a, pw('sin', 2, 'θ'))} + ${coef(b * b, pw('cos', 2, 'θ'))}). The rectangle measures 2h by 2k, and h<sup>2</sup> + k<sup>2</sup> = ${a * a} + ${b * b} = ${S}, whatever θ is. `
      + (ask === 'area'
        ? `The area is 4hk, and AM-GM gives 4hk ≤ 2(h<sup>2</sup> + k<sup>2</sup>) = ${2 * S}, with equality at θ = 45°, when h = k. (The rectangle with sides parallel to the axes has the smaller area 4·${a}·${b} = ${4 * a * b}.) So the largest area is <b>${ans[1]}</b>.`
        : `The diagonal is √((2h)<sup>2</sup> + (2k)<sup>2</sup>) = √(4·${S}) = <b>${ans[1]}</b>, the same for all these rectangles.`),
    check: () => {
      const h = (th) => top((t) => a * Math.cos(t) * Math.cos(th) + b * Math.sin(t) * Math.sin(th), 0, FULL, 200);
      if (ask === 'diag') return [0.3, 1.1].every((th) => close(2 * Math.hypot(h(th), h(th + Math.PI / 2)), ans[0], 1e-6));
      return close(top((th) => 4 * h(th) * h(th + Math.PI / 2), 0, Math.PI / 2, 90), ans[0], 1e-6);
    },
  };
};

// ======================================================================================================================
// Solids: tetrahedra and spheres
// ======================================================================================================================
const SOLIDS = 'Solids: tetrahedra and spheres';
// a regular tetrahedron with edge s: its corners, with the center at the origin
const regular = (s) => { const k = s / (2 * Math.SQRT2); return [[k, k, k], [k, -k, -k], [-k, k, -k], [-k, -k, k]]; };
const toPlane = (p, a, b, c) => { const n = cross3(sub3(b, a), sub3(c, a)); return Math.abs(dot3(n, sub3(p, a))) / Math.hypot(...n); };
const mid3 = (a, b) => a.map((v, i) => (v + b[i]) / 2);

// points on three edges at one corner: the volume scales by the three fractions
const CUTS3 = [[1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [3, 2], [1, 1], [3, 4], [1, 4]];
const pointsOnEdges = (d, ctx) => {
  const [r1, r2, r3, ask, m] = pick(ctx, 'edgepts', [CUTS3, CUTS3, CUTS3, ['small', 'rest'], [1, 2, 3, 4, 5, 6]], (x, y, z) => !(x === y && y === z));
  const part = (r) => F(r[0], r[0] + r[1]), share = fm(fm(part(r1), part(r2)), part(r3)), V = F(m * share[1]), small = fm(V, share), ans = ask === 'small' ? small : fs(V, small);
  const ratio = (r) => F(r[0], r[1]), wrongs = [fm(V, fm(fm(ratio(r1), ratio(r2)), ratio(r3))), fm(V, fa(fa(part(r1), part(r2)), part(r3))), ask === 'small' ? fs(V, small) : small, fm(V, fm(F(1, 3), fa(fa(part(r1), part(r2)), part(r3)))), fm(fm(V, share), F(2)), fm(fm(V, share), F(1, 2)), fm(V, fm(part(r1), part(r2)))];
  const Ps = `AP : PB = ${r1[0]} : ${r1[1]}, AQ : QC = ${r2[0]} : ${r2[1]} and AR : RD = ${r3[0]} : ${r3[1]}`;
  return {
    topic: SOLIDS, rank: 12,
    text: `Tetrahedron ABCD has volume ${num(fv(V), 0)}. Points P, Q and R lie on edges AB, AC and AD, with ${Ps}. What is the volume of ${ask === 'small' ? 'tetrahedron APQR' : 'the solid that remains when tetrahedron APQR is cut off'}?`,
    answer: five(d, fq(ans), pos(wrongs.map(fq))),
    solution: `Tetrahedron APQR shares the corner A with ABCD. Replacing B by P scales the volume by AP/AB, because triangle ACD stays as a base and the height shrinks by that factor, and the same goes for Q and R. So the volume of APQR is ${fr(part(r1))}·${fr(part(r2))}·${fr(part(r3))} of ${num(fv(V), 0)}, which is ${fr(small)}.${ask === 'small' ? ` So the answer is <b>${fr(ans)}</b>.` : ` What remains has volume ${num(fv(V), 0)} − ${fr(small)} = <b>${fr(ans)}</b>.`}`,
    check: () => {
      const B = [1, 0, 0], C = [0, 1, 0], D = [0, 0, 6 * fv(V)], A = [0, 0, 0], at = (U, r) => U.map((v) => (v * r[0]) / (r[0] + r[1]));
      const whole = volume4(A, B, C, D), got = volume4(A, at(B, r1), at(C, r2), at(D, r3));
      return close(whole, fv(V)) && close(ask === 'small' ? got : whole - got, fv(ans));
    },
  };
};

// the measurements of a regular tetrahedron, all from the height and the center a quarter of the way up
const REG_EDGES = [2, 3, 4, 6, 8, 9, 10, 12, 15, 18, 24];
const regularFacts = (d, ctx) => {
  const [s, ask] = pick(ctx, 'regfacts', [REG_EDGES, ['height', 'in', 'circum', 'mid', 'opposite', 'volume']]);
  const table = { height: fracSurd(s, 3, 6), in: fracSurd(s, 12, 6), circum: fracSurd(s, 4, 6), mid: fracSurd(s, 4, 2), opposite: fracSurd(s, 2, 2), volume: fracSurd(s ** 3, 12, 2) };
  const ans = table[ask], lead = `The center of a face is s/√3 from its corners, so the height of the tetrahedron is h = √(s<sup>2</sup> − s<sup>2</sup>/3) = s√6/3, which is ${table.height[1]} for s = ${s}. `;
  const what = { height: 'the distance from a corner to the opposite face', in: 'the radius of the sphere inside it that touches all four faces', circum: 'the radius of the sphere through its four corners', mid: 'the radius of the sphere that touches all six edges', opposite: 'the shortest distance between two opposite edges', volume: 'its volume' }[ask];
  const wrongs = ask === 'volume' ? [fracSurd(s ** 3, 6, 2), fracSurd(s ** 3, 12, 3), fracSurd(s ** 3, 6, 6), fracSurd(s ** 3, 4, 2), fracSurd(s ** 3, 12, 6), fl(s ** 3, 12)] : [...Object.entries(table).filter(([k]) => k !== 'volume' && k !== ask).map(([, v]) => v), fracSurd(s, 2, 3), fracSurd(s, 3, 3), fracSurd(s, 6, 6)];
  return {
    topic: SOLIDS, rank: { height: 12, in: 15, circum: 15, mid: 16, opposite: 15, volume: 12 }[ask],
    text: `A regular tetrahedron has edges of length ${s}. What is ${what}?`,
    answer: five(d, ans, wrongs),
    solution: {
      height: `${lead}So the distance is <b>${ans[1]}</b>.`,
      volume: `${lead}A face has area (√3/4)·${s * s}, and the volume is ⅓·(area)·h = ⅓·(√3/4)·${s * s}·${table.height[1]} = <b>${ans[1]}</b>.`,
      in: `${lead}The center of the tetrahedron is on that height, and the four small tetrahedra from the center to the faces have equal volumes that add up to the whole. So the center is h/4 above each face, and the radius is <b>${ans[1]}</b>.`,
      circum: `${lead}The center of the tetrahedron is h/4 above each face (the four small tetrahedra from the center have equal volumes), so it is 3h/4 from each corner, and the radius is <b>${ans[1]}</b>.`,
      mid: `${lead}The center is 3h/4 = ${table.circum[1]} from each corner. The sphere touches each edge at its midpoint, so its radius, the distance from the center to a midpoint, satisfies r<sup>2</sup> = (${table.circum[1]})<sup>2</sup> − (${frac(s, 2)})<sup>2</sup>, which gives r = <b>${ans[1]}</b>.`,
      opposite: `Let M and N be the midpoints of opposite edges AB and CD. Both AN and BN are heights of equilateral faces, so triangle ABN is isosceles and NM is perpendicular to AB, and likewise to CD. So the distance is MN. With AN<sup>2</sup> = ¾·${s * s} and AM = ${frac(s, 2)}, MN<sup>2</sup> = ¾·${s * s} − ¼·${s * s} = ½·${s * s}, and MN = <b>${ans[1]}</b>.`,
    }[ask],
    check: () => {
      const [A, B, C, D] = regular(s), O = [0, 0, 0];
      return close({ height: toPlane(A, B, C, D), in: toPlane(O, B, C, D), circum: dist(O, A), mid: dist(O, mid3(A, B)), opposite: dist(mid3(A, B), mid3(C, D)), volume: volume4(A, B, C, D) }[ask], ans[0]);
    },
  };
};

// three edges at a corner with 60° between each pair: a regular tetrahedron stretched along its edges
const sixtyEdges = (d, ctx) => {
  const [x, y, z] = pick(ctx, 'sixty', [[1, 2, 3, 4, 5, 6], [2, 3, 4, 5, 6, 8], [3, 4, 5, 6, 9, 10, 12]], (a, b, c) => a < b && b < c && a * b * c % 3 === 0);
  const P = x * y * z, ans = fracSurd(P, 12, 2);
  const wrongs = [fl(P, 6), fracSurd(P, 6, 2), fracSurd(P, 12, 3), fracSurd(P, 4, 2), fracSurd(P, 12, 6), fl(P, 12), fracSurd(P, 3, 2), fracSurd(P, 24, 2), fracSurd(P, 18, 2), fracSurd(P, 36, 6), fl(P, 24)];
  return {
    topic: SOLIDS, rank: 15,
    text: `In tetrahedron ABCD, AB = ${x}, AC = ${y} and AD = ${z}, and ∠BAC = ∠CAD = ∠DAB = 60°. What is the volume of the tetrahedron?`,
    answer: five(d, ans, wrongs),
    solution: `A regular tetrahedron with edge 1 has height √6/3 and base area √3/4, so its volume is ⅓·(√3/4)·(√6/3) = √2/12. Take the one with corner A and its other corners on rays AB, AC and AD, 1 from A. The given tetrahedron stretches the three edges at A to ${x}, ${y} and ${z}. Stretching one edge at A multiplies the volume by that factor, because the opposite face through A stays put and the height is multiplied. So the volume is (√2/12)·${x}·${y}·${z} = <b>${ans[1]}</b>.`,
    check: () => {
      const A = [0, 0, 0], B = [x, 0, 0], C = [y / 2, (y * Math.sqrt(3)) / 2, 0], D = [z / 2, (z * Math.sqrt(3)) / 6, (z * Math.sqrt(6)) / 3];
      return [angle(A, B, C), angle(A, C, D), angle(A, D, B)].every((t) => close(t, Math.PI / 3)) && close(volume4(A, B, C, D), ans[0]);
    },
  };
};

// three points on a sphere: the plane through them cuts a circle, and that circle is the triangle’s circumcircle
const ON_SPHERE = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [13, 14, 15], [7, 15, 20], [9, 10, 17], [8, 15, 17], [10, 13, 13], [5, 5, 6], [5, 5, 8], [20, 21, 29], [9, 12, 15], [12, 16, 20]];
const sphereThroughTriangle = (d, ctx) => {
  const [[a, b, c], R, ask] = pick(ctx, 'onsphere', [ON_SPHERE, [7, 9, 10, 13, 15, 17, 25, 26, 30], ['distance', 'distance', 'cap']], (t, r) => {
    const K2 = heron(t[0], t[1], t[2]);
    return (t[0] * t[1] * t[2]) / (4 * K2) < r - 0.4 && !(t[0] === 13 && t[1] === 14 && r === 20);
  });
  const K = Math.round(heron(a, b, c)), rho = F(a * b * c, 4 * K), r2 = fs(F(R * R), sqF(rho)), ans = ask === 'distance' ? rootF(r2) : fq(sqF(rho));
  const wrongs = ask === 'distance' ? [fq(fs(F(R), rho)), rootF(fa(F(R * R), sqF(rho))), fq(rho), fq(r2), rootF(fs(F(R * R), F(K))), fq(F(R)), rootF(fs(F(R * R), fm(F(1, 4), sqF(F(a + b + c)))))] : [fq(rho), fq(r2), fq(F(K)), fq(F(a * a + b * b + c * c, 3)), fq(fm(F(2), sqF(rho))), fq(F(R * R))];
  return {
    topic: SOLIDS, rank: ask === 'distance' ? 15 : 14,
    text: ask === 'distance'
      ? `Points A, B and C lie on a sphere with center O and radius ${R}, with AB = ${c}, BC = ${a} and CA = ${b}. What is the distance from O to the plane through A, B and C?`
      : `A plane cuts a sphere with center O and radius ${R} in a circle. Points A, B and C lie on that circle, with AB = ${c}, BC = ${a} and CA = ${b}. If the area of the circle is kπ, what is k?`,
    answer: five(d, ans, pos(wrongs)),
    solution: `The plane cuts the sphere in a circle that passes through A, B and C, so it is the circumcircle of triangle ABC. By Heron’s formula the triangle has area ${K}, so its circumradius is ρ = abc/(4·area) = ${a * b * c}/${4 * K} = ${fr(rho)}. `
      + (ask === 'distance'
        ? `The foot of the perpendicular from O to the plane is the center of the circle, so the distance satisfies OP<sup>2</sup> = ${R}<sup>2</sup> − ρ<sup>2</sup> = ${fr(r2)}. So the distance is <b>${ans[1]}</b>.`
        : `The area of the circle is ρ<sup>2</sup>π, so k = <b>${ans[1]}</b>, whatever the radius of the sphere is, as long as the plane cuts it.`),
    check: () => {
      const { A, B, C } = corners(a, b, c), [u, v] = [[B[0] - A[0], B[1] - A[1]], [C[0] - A[0], C[1] - A[1]]], det = 2 * (u[0] * v[1] - u[1] * v[0]);
      const px = (v[1] * (u[0] ** 2 + u[1] ** 2) - u[1] * (v[0] ** 2 + v[1] ** 2)) / det + A[0], py = (u[0] * (v[0] ** 2 + v[1] ** 2) - v[0] * (u[0] ** 2 + u[1] ** 2)) / det + A[1];
      if (ask === 'cap') return close(Math.PI * dist([px, py], A) ** 2, ans[0] * Math.PI);
      const z = root((h) => dist([px, py, h], [A[0], A[1], 0]) - R, 0, R);
      return close(z, ans[0], 1e-6) && close(dist([px, py, z], [B[0], B[1], 0]), R) && close(dist([px, py, z], [C[0], C[1], 0]), R);
    },
  };
};

// the angle at a point of an edge in a regular tetrahedron: the law of cosines twice
const CUT_POINTS = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 5], [3, 4], [2, 5], [1, 5], [4, 5], [3, 7]];
const tetraAngle = (d, ctx) => {
  const [[p, q], s] = pick(ctx, 'tetraangle', [CUT_POINTS, [1, 2, 3, 4, 6]]);
  const den = p * p + p * q + q * q, ans = F(p * p + q * q, 2 * den), t = F(p, p + q), am2 = fs(fa(ONE, sqF(t)), t);
  const wrongs = [F(1, 3), F(p * p + q * q, den), F(p * q, den), F(1, 2), F(q * q, den), fs(ONE, ans), F(p * q, 2 * den), F(1, 4), F(p * p, den)];
  return {
    topic: SOLIDS, rank: 16,
    text: `ABCD is a regular tetrahedron${s === 1 ? '' : ` with edges of length ${s}`}. Point M lies on edge CD with CM : MD = ${p} : ${q}. What is cos ∠AMB?`,
    answer: five(d, fq(ans), unit(pos(wrongs.map(fq)))),
    solution: `Take the edges to have length 1, since the size does not change the angle. In triangle ACM, AC = 1, CM = ${fr(t)} and the angle at C is 60°, so AM<sup>2</sup> = 1 + ${fr(sqF(t))} − ${fr(t)} = ${fr(am2)}. By symmetry BM<sup>2</sup> is the same. In triangle AMB, AB = 1, so cos ∠AMB = (AM<sup>2</sup> + BM<sup>2</sup> − 1) ÷ (2·AM·BM) = (2·${fr(am2)} − 1) ÷ (2·${fr(am2)}) = <b>${fr(ans)}</b>.`,
    check: () => {
      const [A, B, C, D] = regular(s), M = C.map((v, i) => v + (p / (p + q)) * (D[i] - v));
      return close(Math.cos(angle(M, A, B)), fv(ans));
    },
  };
};

// three edges at right angles at a corner: the slanted face has area ½√(p²q² + q²r² + r²p²), and the inscribed sphere
// comes from adding up four small tetrahedra
const CORNERS3 = [];
for (let p = 1; p <= 20; p++) for (let q = p; q <= 24; q++) for (let r = q; r <= 30; r++) {
  const N = p * p * q * q + q * q * r * r + r * r * p * p;
  if (isSquare(N) && !(p === 2 && q === 4 && r === 6) && p * q * r <= 1400) CORNERS3.push([p, q, r]);
}
const cornerTetra = (d, ctx) => {
  const ask = ['in', 'height', 'circum'][ctx.k % 3], turn = { ...ctx, k: Math.floor(ctx.k / 3) };
  const [[p, q, r]] = pick(turn, `corner3-${ask}`, [CORNERS3]);
  const N = Math.round(Math.sqrt(p * p * q * q + q * q * r * r + r * r * p * p)), V = F(p * q * r, 6), pairs = p * q + q * r + r * p, S = F(pairs + N, 2);
  const inr = F(p * q * r, pairs + N), ht = F(p * q * r, N), sumSq = p * p + q * q + r * r;
  const ans = { in: fq(inr), height: fq(ht), circum: rootF(F(sumSq, 4)) }[ask];
  const wrongs = {
    in: [ht, fd(V, S), F(p * q * r, pairs), F(p * q * r, N + 2 * pairs), F(p * q * r, 2 * (pairs + N)), F(p + q + r, 6), F(p * q * r, 3 * pairs)].map(fq),
    height: [inr, F(p * q * r, 2 * N), F(p * q * r, pairs), F(2 * p * q * r, N), F(p * q * r, 3 * N), F(N, p + q + r), fd(V, F(N, 2))].map(fq),
    circum: [rootF(F(sumSq)), rootF(F(sumSq, 2)), rootF(F(sumSq, 3)), fq(F(p + q + r, 2)), rootF(F(sumSq, 9)), fq(F(r, 2)), fq(F(p + q + r, 3))],
  }[ask];
  const faces = `The three faces at D have areas ${frac(p * q, 2)}, ${frac(q * r, 2)} and ${frac(r * p, 2)}. The slanted face ABC has base AB = √(${p * p} + ${q * q}), and its height over AB is √(${r * r} + (${p}·${q}/AB)<sup>2</sup>), because the segment from D to AB is perpendicular to both AB and DC. That makes its area ½√(${p * p}·${q * q} + ${q * q}·${r * r} + ${r * r}·${p * p}) = ${frac(N, 2)}.`;
  const given = `Edges DA, DB and DC of tetrahedron ABCD are perpendicular to each other, with DA = ${p}, DB = ${q} and DC = ${r}.`;
  return {
    topic: SOLIDS, rank: { in: 18, height: 16, circum: 14 }[ask],
    text: `${given} ${{ in: 'What is the radius of the sphere inside it that touches all four faces?', height: 'What is the distance from D to the plane through A, B and C?', circum: 'What is the radius of the sphere through A, B, C and D?' }[ask]}`,
    answer: five(d, ans, pos(wrongs)),
    solution: {
      in: `The volume is ⅙·${p}·${q}·${r} = ${fr(V)}. ${faces} So the whole surface area is ${frac(pairs, 2)} + ${frac(N, 2)} = ${fr(S)}. Joining the center of the sphere to the four faces cuts the tetrahedron into four small ones, each with height r, so the volume is ⅓·r·(surface area). So r = 3·${fr(V)} ÷ ${fr(S)} = <b>${ans[1]}</b>.`,
      height: `The volume is ⅙·${p}·${q}·${r} = ${fr(V)}, counting a right-angled face at D as the base. ${faces} Counting ABC as the base instead, the volume is ⅓·${frac(N, 2)}·h, so h = 3·${fr(V)} ÷ ${frac(N, 2)} = <b>${ans[1]}</b>.`,
      circum: `The four points are corners of a box with edges ${p}, ${q} and ${r} (D at one corner and A, B and C at its neighbors). The sphere through all eight corners of the box has the box’s long diagonal as a diameter, and a sphere through A, B, C and D is unique. So the radius is ½√(${p * p} + ${q * q} + ${r * r}) = <b>${ans[1]}</b>.`,
    }[ask],
    check: () => {
      const D = [0, 0, 0], A = [p, 0, 0], B = [0, q, 0], C = [0, 0, r];
      if (ask === 'height') return close(toPlane(D, A, B, C), ans[0]);
      if (ask === 'in') { const x = root((t) => toPlane([t, t, t], A, B, C) - t, 1e-9, Math.min(p, q, r) / 2 + 1e-9); return close(x, ans[0]); }
      const X = [p / 2, q / 2, r / 2];
      return [D, A, B, C].every((U) => close(dist(X, U), ans[0]));
    },
  };
};

// two faces with a known angle between them: the height to the shared edge, tilted by the angle
const TILTS = [[30, F(1, 2), 1, '½'], [45, F(1, 2), 2, '√2/2'], [60, F(1, 2), 3, '√3/2'], [90, ONE, 1, '1']];
const dihedralVolume = (d, ctx) => {
  const [[th, c, r, sinText], e, P, Q] = pick(ctx, 'dihedral', [TILTS, [3, 4, 5, 6, 8, 10, 12], [6, 9, 12, 15, 18, 20, 24, 30, 36], [8, 10, 14, 16, 18, 21, 25, 28, 32]], (t, ee, pp, qq) => !(ee === 10 && pp === 120 && qq === 80) && qq !== pp);
  const coefV = fm(c, F(2 * P * Q, 3 * e)), ans = fracSurd(coefV[0], coefV[1], r), h = F(2 * Q, e);
  const raw = (m, n) => fracSurd(coefV[0] * m, coefV[1] * n, r);
  const wrongs = [raw(1, 2), raw(2, 1), raw(3, 1), fq(F(2 * P * Q, 3 * e)), fq(F(P * Q, e)), raw(1, 3), r === 1 ? fracSurd(coefV[0], coefV[1], 2) : fq(coefV), r === 3 ? fracSurd(coefV[0], coefV[1], 2) : fracSurd(coefV[0], coefV[1], 3)];
  return {
    topic: SOLIDS, rank: 17,
    text: `Faces ABC and BCD of a tetrahedron share the edge BC = ${e}. Face ABC has area ${P}, face BCD has area ${Q}, and the two faces meet at an angle of ${th}°. What is the volume of the tetrahedron?`,
    answer: five(d, ans, pos(wrongs)),
    solution: `Use ABC as the base. In face BCD, the height to BC is 2·${Q} ÷ ${e} = ${fr(h)}. The two faces meet at ${th}°, so D is ${fr(h)}·sin ${th}° above the plane of ABC, with sin ${th}° = ${sinText}. So the volume is ⅓·${P}·${fr(h)}·${sinText} = <b>${ans[1]}</b>.`,
    check: () => {
      const T = rad(th), h1 = (2 * P) / e, h2 = (2 * Q) / e, B = [0, 0, 0], C = [e, 0, 0], A = [e * 0.3, h1, 0], Dp = [e * 0.6, h2 * Math.cos(T), h2 * Math.sin(T)];
      return close(volume4(A, B, C, Dp), ans[0]) && close(shoelace([[0, 0], [e, 0], [e * 0.3, h1]]), P);
    },
  };
};

// balls resting on a table: centers are one radius up, and two touching balls have feet 2√(ab) apart
const ballsOnTable = (d, ctx) => {
  const ask = ['contact', 'top', 'gap'][ctx.k % 3], turn = { ...ctx, k: Math.floor(ctx.k / 3) };
  if (ask === 'gap') {
    const [r] = pick(turn, 'balls-gap', [[3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 21]]);
    const ans = fl(r, 3), wrongs = [fl(r, 2), fl(r, 4), fracSurd(r, 3, 3), mix(-3 * r, 2 * r, 3, 3), fl(2 * r, 3), mix(-r, r, 2), fl(r, 6), mix(-r, r, 3)];
    return {
      topic: SOLIDS, rank: 17,
      text: `Three balls of radius ${r} rest on a table, each touching the other two. A smaller ball rests on the table in the gap between them, touching all three. What is the radius of the smaller ball?`,
      answer: five(d, ans, pos(wrongs)),
      solution: `Two touching balls of radii a and b on a table have their contact points 2√(ab) apart, by Pythagoras on a right triangle with hypotenuse a + b and height a − b. The big balls’ contact points form an equilateral triangle of side 2·${r} = ${2 * r}, whose center is ${2 * r}/√3 from each corner. The small ball, of radius x, sits at that center by symmetry. So 2√(${r}x) = ${2 * r}/√3, that is ${r}x = ${r * r}/3, and x = <b>${ans[1]}</b>.`,
      check: () => {
        const cen = (2 * r) / Math.sqrt(3), x = root((t) => Math.hypot(cen, r - t) - (r + t), 1e-9, r);
        return close(x, ans[0]);
      },
    };
  }
  if (ask === 'contact') {
    const [r, R] = pick(turn, 'balls-contact', [[1, 2, 3, 4, 6, 8, 9], [4, 9, 16, 25, 2, 3, 6, 12]], (a, b) => b > a && 4 * b > a);
    const inside = 4 * r * R - r * r, ans = surd(r, inside), side = surd(2, r * R);
    const wrongs = [surd(r, R * R + 2 * r * R), surd(2 * r, inside), surd(1, inside), fl(r * R), surd(r, r * R), surd(2 * r, r * R), fl(2 * r * R)];
    return {
      topic: SOLIDS, rank: 18,
      text: `Two balls of radius ${r} and one ball of radius ${R} rest on a table, each touching the other two. What is the area of the triangle whose corners are the three points where the balls touch the table?`,
      answer: five(d, ans, pos(wrongs)),
      solution: `Two touching balls of radii a and b on a table have centers a + b apart and heights differing by |a − b|, so by Pythagoras their contact points are √((a + b)<sup>2</sup> − (a − b)<sup>2</sup>) = 2√(ab) apart. So the triangle has sides 2·${r} = ${2 * r} and two sides of length ${side[1]}. The height over the short side is √(${4 * r * R} − ${r * r}) = √${inside}, so the area is ½·${2 * r}·√${inside} = <b>${ans[1]}</b>.`,
      check: () => {
        const y = root((t) => Math.hypot(r, t, R - r) - (r + R), 0, 4 * (r + R)), [U, V, W] = [[0, 0, r], [2 * r, 0, r], [r, y, R]];
        return close(dist(U, V), 2 * r) && close(dist(U, W), r + R) && close(dist(V, W), r + R) && close(shoelace([[0, 0], [2 * r, 0], [r, y]]), ans[0]);
      },
    };
  }
  const [r, R] = pick(turn, 'balls-top', [[3, 6, 9, 12, 15], [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15]], (a, b) => (a + b) ** 2 > (4 * a * a) / 3 && b !== a * 2);
  const D = (r + R) ** 2 - (4 * r * r) / 3, ans = mix(r + R, 1, D), circ = (2 * r) / Math.sqrt(3);
  const wrongs = [mix(R, 1, D), mix(r, 1, D), mix(r + R, -1, D), mix(2 * r + 2 * R, 1, D), mix(0, 1, D), fl(2 * r + 2 * R), mix(r + R, 2, D), fl(r + 2 * R)];
  return {
    topic: SOLIDS, rank: 18,
    text: `Three balls of radius ${r} rest on a table, each touching the other two. A ball of radius ${R} rests on top of them, touching all three. How far is the highest point of the top ball above the table?`,
    answer: five(d, ans, pos(wrongs)),
    solution: `The centers of the three lower balls are ${r} above the table and form an equilateral triangle of side ${2 * r}, so its center is ${2 * r}/√3 from each of them, and that distance squared is ${4 * r * r / 3}. The top ball’s center is above that point and ${r} + ${R} = ${r + R} from each lower center. So it is √(${(r + R) ** 2} − ${4 * r * r / 3}) = ${surd(1, D)[1]} above their plane. The highest point is ${r} + ${surd(1, D)[1]} + ${R} = <b>${ans[1]}</b> above the table.`,
    check: () => { const h = root((t) => Math.hypot(circ, t) - (r + R), 0, 2 * (r + R)); return close(r + h + R, ans[0]); },
  };
};

// balls inside a regular tetrahedron: centers on the lines to the corners, measured against the inscribed sphere
const ballsInTetra = (d, ctx) => {
  const [ask, a] = pick(ctx, 'ballsin', [['enclose', 'four', 'corner'], [2, 3, 4, 5, 6, 10, 12, 15, 20]], (w, v) => (w === 'enclose') || (w === 'four' ? v % 10 === 0 || v % 5 === 0 : v % 2 === 0 || v % 3 === 0));
  const ans = { enclose: mix(2 * a, 2 * a, 6), four: mix(-a, a, 6, 10), corner: fracSurd(a, 24, 6) }[ask];
  const wrongs = {
    enclose: [fl(2 * a), mix(2 * a, a, 6), mix(a, a, 6), mix(4 * a, 2 * a, 3), mix(2 * a, 2 * a, 3), mix(0, 4 * a, 6), fl(6 * a), mix(4 * a, 2 * a, 6)],
    four: [mix(-a, a, 6, 5), fracSurd(a, 12, 6), fracSurd(a, 24, 6), mix(a, a, 6, 10), mix(-a, a, 3, 10), fl(a, 5), fracSurd(a, 8, 6), fl(a, 8)],
    corner: [fracSurd(a, 12, 6), fracSurd(a, 36, 6), fracSurd(a, 48, 6), fracSurd(a, 8, 6), fracSurd(a, 24, 3), fl(a, 8), fracSurd(a, 6, 6)],
  }[ask];
  const text = {
    enclose: `Four balls of radius ${a} each touch the other three. What is the length of an edge of the smallest regular tetrahedron that holds all four balls?`,
    four: `A regular tetrahedron has edges of length ${a}. Four equal balls inside it each touch the other three balls and three faces of the tetrahedron. What is the radius of a ball?`,
    corner: `A regular tetrahedron has edges of length ${a}. A sphere inside it touches all four faces, and a smaller ball near one corner touches the sphere and the three faces at that corner. What is the radius of the smaller ball?`,
  }[ask];
  const pair = `The centers of the balls form a smaller regular tetrahedron with edges 2r, and its faces are parallel to the faces of the big one and r inside them. A regular tetrahedron with edge s has its center s√6/12 from each face. Both tetrahedra have the same center, so s√6/12 = 2r·√6/12 + r.`;
  return {
    topic: SOLIDS, rank: { enclose: 20, four: 21, corner: 20 }[ask],
    text,
    answer: five(d, ans, pos(wrongs)),
    solution: {
      enclose: `${pair} With r = ${a}, multiply by 12/√6: s = 2r + 12r/√6 = 2r + 2√6·r = <b>${ans[1]}</b>.`,
      four: `${pair} Multiplying by 12/√6 gives s = r(2 + 2√6), so r = ${a} ÷ (2 + 2√6) = ${a}(√6 − 1) ÷ 10 = <b>${ans[1]}</b>.`,
      corner: `The height of the tetrahedron is h = ${fracSurd(a, 3, 6)[1]}, and the sphere has radius h/4, because the center is a quarter of the way up. A plane parallel to the base and touching the top of the sphere is h/2 above the base. It cuts off a small regular tetrahedron at the top corner with height h/2, half the size. The smaller ball is the sphere inside that small tetrahedron, so its radius is half of h/4, which is h/8 = <b>${ans[1]}</b>.`,
    }[ask],
    check: () => {
      const s = ask === 'enclose' ? 1 : a, [A, B, C, E] = regular(s), radius = (t) => toPlane(A.map((v) => v * t), A, B, C);
      if (ask === 'corner') {
        const ins = toPlane([0, 0, 0], B, C, E), t = root((v) => dist(A.map((c) => c * v), [0, 0, 0]) - ins - radius(v), 0.3, 0.999);
        return close(radius(t), ans[0], 1e-6);
      }
      const t = root((v) => dist(A.map((c) => c * v), B.map((c) => c * v)) - 2 * radius(v), 0.05, 0.999), rr = radius(t);
      return close(ask === 'four' ? rr : a / rr, ans[0], 1e-6);
    },
  };
};

// opposite edges equal in pairs: the tetrahedron sits in a box, using six face diagonals
const DISPHENOIDS = [];
for (let x = 1; x <= 9; x++) for (let y = x + 1; y <= 12; y++) for (let z = y + 1; z <= 14; z++) if (!(x === 4 && y === 5 && z === 8) && x * y * z <= 420) DISPHENOIDS.push([x, y, z]);
const volFromEdges = (ab, ac, ad, bc, bd, cd) => {
  // Cayley–Menger, by elimination
  const m = [[0, 1, 1, 1, 1], [1, 0, ab, ac, ad], [1, ab, 0, bc, bd], [1, ac, bc, 0, cd], [1, ad, bd, cd, 0]], n = 5;
  let det = 1;
  for (let i = 0; i < n; i++) {
    let piv = i; for (let r = i + 1; r < n; r++) if (Math.abs(m[r][i]) > Math.abs(m[piv][i])) piv = r;
    if (piv !== i) { [m[i], m[piv]] = [m[piv], m[i]]; det = -det; }
    det *= m[i][i];
    for (let r = i + 1; r < n; r++) { const f = m[r][i] / m[i][i]; for (let c = i; c < n; c++) m[r][c] -= f * m[i][c]; }
  }
  return Math.sqrt(det / 288);
};
const disphenoid = (d, ctx) => {
  const ask = ['volume', 'circum', 'area'][ctx.k % 3], [[x, y, z]] = pick({ ...ctx, k: Math.floor(ctx.k / 3) }, `disphenoid-${ask}`, [DISPHENOIDS]);
  const a2 = x * x + y * y, b2 = y * y + z * z, c2 = x * x + z * z, half = x * x + y * y + z * z, N = x * x * y * y + y * y * z * z + z * z * x * x;
  const ans = { volume: fl(x * y * z, 3), circum: rootF(F(half, 4)), area: surd(2, N) }[ask], L = (n) => surd(1, n)[1];
  const edges = `AB = CD = ${L(a2)}, AC = BD = ${L(b2)} and AD = BC = ${L(c2)}`;
  const wrongs = {
    volume: [fl(x * y * z), fl(x * y * z, 6), fl(x * y * z, 2), fl(2 * x * y * z, 3), fl(x * y * z, 4), fl(4 * x * y * z, 3), fl(5 * x * y * z, 6), fl(x * y * z, 12), fl(x * y * z, 9)],
    circum: [rootF(F(half)), rootF(F(half, 2)), rootF(F(half, 3)), rootF(F(a2 + b2 + c2, 4)), fl(x + y + z, 2), rootF(F(half, 8)), rootF(F(half, 9))],
    area: [surd(1, N), surd(4, N), rootF(F(N, 4)), fl(a2 + b2 + c2), fl(x * y + y * z + z * x), surd(3, N), fl(2 * (x * y + y * z + z * x))],
  }[ask];
  const what = { volume: 'What is the volume of the tetrahedron?', circum: 'What is the radius of the sphere through A, B, C and D?', area: 'What is the total surface area of the tetrahedron?' }[ask];
  const box = `Such a tetrahedron fits inside a box with its six edges as face diagonals, one on each face. If the box measures p by q by r, then p<sup>2</sup> + q<sup>2</sup> = ${a2}, q<sup>2</sup> + r<sup>2</sup> = ${b2} and p<sup>2</sup> + r<sup>2</sup> = ${c2}. Adding these, p<sup>2</sup> + q<sup>2</sup> + r<sup>2</sup> = ${half}, so p, q and r are ${x}, ${y} and ${z}.`;
  return {
    topic: SOLIDS, rank: { volume: 22, circum: 23, area: 20 }[ask],
    text: `Tetrahedron ABCD has ${edges}. ${what}`,
    answer: five(d, ans, pos(wrongs)),
    solution: `${box} ` + {
      volume: `The box has volume ${x * y * z}. Taking the tetrahedron out leaves four corner pieces, each a tetrahedron with three edges of lengths ${x}, ${y} and ${z} at right angles, of volume ${x * y * z}/6. So the tetrahedron has volume ${x * y * z} − 4·${x * y * z}/6 = ${x * y * z}/3 = <b>${ans[1]}</b>.`,
      circum: `The sphere through the four corners also goes through all eight corners of the box, because it is determined by four points and the box’s sphere contains them. Its diameter is the box’s long diagonal, so the radius is ½√${half} = <b>${ans[1]}</b>.`,
      area: `All four faces are congruent, with sides ${L(a2)}, ${L(b2)} and ${L(c2)}. A face is half of a slanted rectangle in the box, and its area is ½√(${x * x}·${y * y} + ${y * y}·${z * z} + ${z * z}·${x * x}) = ½√${N}. So the total surface area is 4·½√${N} = <b>${ans[1]}</b>.`,
    }[ask],
    check: () => {
      if (ask === 'volume') return close(volFromEdges(a2, b2, c2, c2, b2, a2), ans[0], 1e-6);
      const ab = Math.sqrt(a2), ac = Math.sqrt(b2), ad = Math.sqrt(c2);
      const { A, B, C } = corners(ab, ac, ad);   // triangle with sides ab, ac and ad: all four faces are copies of it
      if (ask === 'area') return close(4 * shoelace([A, B, C]), ans[0], 1e-6);
      // the corners from their distances alone, then the point the same distance from all four
      const P0 = [0, 0, 0], P1 = [ab, 0, 0], cx = (ac * ac + ab * ab - c2) / (2 * ab), P2 = [cx, Math.sqrt(ac * ac - cx * cx), 0];
      const dx = (ad * ad + ab * ab - b2) / (2 * ab), dy = (ad * ad - a2 + (dist(P2, P0) ** 2) - 2 * cx * dx) / (2 * P2[1]), P3 = [dx, dy, Math.sqrt(ad * ad - dx * dx - dy * dy)];
      if (!close(dist(P3, P2), ab, 1e-6)) return false;
      const ox = ab / 2, oy = (dist(P2, P0) ** 2 - 2 * cx * ox) / (2 * P2[1]), oz = (dist(P3, P0) ** 2 - 2 * dx * ox - 2 * dy * oy) / (2 * P3[2]), O = [ox, oy, oz];
      return [P0, P1, P2, P3].every((U) => close(dist(O, U), ans[0], 1e-6));
    },
  };
};

// ======================================================================================================================
// Coordinates in space
// ======================================================================================================================
const SPACE = 'Coordinates in space';
const pt3 = (P) => `(${P.map((v) => num(v, 2)).join(', ')})`;

// lattice points on a sphere: write the number as a sum of three squares, then count the arrangements and the signs
const SPHERE_NS = [14, 17, 21, 26, 29, 33, 35, 41, 42, 50, 54, 62, 66, 69, 74, 81, 86, 90];
const latticeOnSphere = (d, ctx) => {
  const [N] = pick(ctx, 'lattice', [SPHERE_NS]);
  const parts = [];
  for (let a = 1; a * a <= N; a++) for (let b = 0; b <= a; b++) for (let c = 0; c <= b; c++) if (a * a + b * b + c * c === N) parts.push([a, b, c]);
  const row = parts.map(([a, b, c]) => { const arr = a === b && b === c ? 1 : a === b || b === c ? 3 : 6, signs = 2 ** [a, b, c].filter((v) => v).length; return { nums: [a, b, c], arr, signs, n: arr * signs }; });
  const ans = row.reduce((s, r) => s + r.n, 0), noSigns = row.reduce((s, r) => s + r.arr, 0), allEight = row.reduce((s, r) => s + r.arr * 8, 0), noArr = row.reduce((s, r) => s + r.signs, 0), sixes = row.reduce((s, r) => s + 6 * r.signs, 0);
  return {
    topic: SPACE, rank: 12,
    text: `How many points (x, y, z) with integer coordinates are at distance ${surd(1, N)[1]} from the origin?`,
    answer: fiveCounts(d, ans, [noSigns, allEight, noArr, sixes, ans / 2, ans + 8, ans - 8, ans + 6, ans - 6]),
    solution: `We need x<sup>2</sup> + y<sup>2</sup> + z<sup>2</sup> = ${N}. As a sum of three squares, ${N} can be written ${listing(parts.map((t) => t.map((v) => `${v}<sup>2</sup>`).join(' + ')))}. For each, count the orders of the three numbers and the choices of sign for those that are not 0: ${listing(row.map((r) => `{${r.nums.join(', ')}} gives ${r.arr}·${r.signs} = ${r.n}`))}. The total is <b>${ans}</b>.`,
    check: () => {
      let n = 0; const m = Math.ceil(Math.sqrt(N));
      for (let x = -m; x <= m; x++) for (let y = -m; y <= m; y++) for (let z = -m; z <= m; z++) if (x * x + y * y + z * z === N) n++;
      return n === ans;
    },
  };
};

// a sphere’s center and radius from the circles it cuts in the coordinate planes
const sphereCircles = (d, ctx) => {
  const [a, b, c, p, ask] = pick(ctx, 'spherecircles', [[1, 2, 3, 4, 5], [-3, -1, 2, 4, 6], [-6, -4, -3, 2, 3, 5], [2, 3, 4, 5, 6, 8, 12], ['other', 'radius']], (x, y, z, r) => r * r + z * z - x * x > 0 && !(x === 2 && y === 4));
  const R2 = p * p + c * c, q2 = R2 - a * a, ans = ask === 'other' ? surd(1, q2) : surd(1, R2);
  const wrongs = ask === 'other'
    ? [surd(1, Math.abs(p * p + a * a - c * c) || 1), surd(1, R2), fl(p), surd(1, R2 + a * a), fl(Math.abs(c)), surd(1, p * p + a * a), fl(p + Math.abs(c)), fl(q2), surd(1, q2 + 1), surd(1, q2 + 2 * a)]
    : [fl(p + Math.abs(c)), surd(1, p * p + a * a), surd(1, a * a + b * b + c * c), fl(p), surd(1, Math.abs(p * p - c * c) || 2), surd(1, q2), fl(Math.abs(c)), fl(R2), surd(1, R2 + a * a), surd(1, R2 + 1)];
  return {
    topic: SPACE, rank: 13,
    text: ask === 'other'
      ? `A sphere meets the xy-plane in a circle with center ${pt3([a, b, 0])} and radius ${p}, and it meets the yz-plane in a circle with center ${pt3([0, b, c])}. What is the radius of the second circle?`
      : `A sphere meets the xy-plane in a circle with center ${pt3([a, b, 0])} and radius ${p}, and it meets the yz-plane in a circle with center ${pt3([0, b, c])}. What is the radius of the sphere?`,
    answer: five(d, ans, pos(wrongs)),
    solution: `The center of the sphere lies straight above the center of each circle. So its x- and y-coordinates are ${a} and ${num(b, 0)}, and its y- and z-coordinates are ${num(b, 0)} and ${num(c, 0)}: the center is ${pt3([a, b, c])}. Its distance from the xy-plane is ${Math.abs(c)}, so the radius of the sphere satisfies R<sup>2</sup> = ${p}<sup>2</sup> + ${Math.abs(c)}<sup>2</sup> = ${R2}. `
      + (ask === 'other'
        ? `Its distance from the yz-plane is ${a}, so the second circle has radius √(${R2} − ${a * a}) = <b>${ans[1]}</b>.`
        : `So R = <b>${ans[1]}</b>.`),
    check: () => {
      const O = [a, b, c], R = dist(O, [a + p, b, 0]);
      return close(dist(O, [a, b + p, 0]), R) && close(ask === 'radius' ? R : root((t) => dist(O, [0, b, c + t]) - R, 0, 2 * R + 1), ans[0]);
    },
  };
};

// a plane cutting a sphere: complete the squares for the center, then the distance formula and Pythagoras
const UNIT_NORMALS = [[1, 2, 2, 3], [2, 1, 2, 3], [2, 3, 6, 7], [6, 3, 2, 7], [1, 4, 8, 9], [4, 4, 7, 9], [2, 6, 9, 11], [6, 6, 7, 11], [3, 4, 12, 13]];
const planeCircle = (d, ctx) => {
  const [[A, B, C, L], [p, q, r], R, gap, ask] = pick(ctx, 'planecircle', [UNIT_NORMALS, [[1, 2, 3], [2, -1, 3], [0, 3, -2], [1, -2, 2], [3, 1, -1], [-1, 2, 4]], [5, 6, 7, 9, 10, 13, 15], [1, 2, 3, 4, 5, 6, 8], ['area', 'radius']], (n, c, rad0, g) => g < rad0);
  const k = R * R - p * p - q * q - r * r, e = A * p + B * q + C * r + gap * L, r2 = R * R - gap * gap;
  const eq = `${terms([[1, X2], [1, Y2], [1, 'z<sup>2</sup>'], [-2 * p, 'x'], [-2 * q, 'y'], [-2 * r, 'z']])} = ${num(k, 0)}`, pl = `${terms([[A, 'x'], [B, 'y'], [C, 'z']])} = ${num(e, 0)}`;
  const ans = ask === 'area' ? [r2 * Math.PI, `${num(r2, 0)}π`] : surd(1, r2);
  const textOf = (n) => (ask === 'area' ? [n * Math.PI, `${num(n, 0)}π`] : surd(1, n));
  const wrongs = [R * R, R * R + gap * gap, R * R - gap, (R - gap) ** 2, 2 * r2, R * R - gap * L, r2 + L, r2 + 2 * gap, r2 - 1].filter((n) => n > 0 && n !== r2).map(textOf);
  return {
    topic: SPACE, rank: 14,
    text: `The sphere ${eq} and the plane ${pl} meet in a circle. What is ${ask === 'area' ? 'the area of the circle' : 'the radius of the circle'}?`,
    answer: five(d, ans, pos(wrongs)),
    solution: `Complete the squares: the sphere is (x ${p < 0 ? '+' : '−'} ${Math.abs(p)})<sup>2</sup> + (y ${q < 0 ? '+' : '−'} ${Math.abs(q)})<sup>2</sup> + (z ${r < 0 ? '+' : '−'} ${Math.abs(r)})<sup>2</sup> = ${R * R}, with center ${pt3([p, q, r])} and radius ${R}. The distance from the center to the plane is |${A}·${by(p)} + ${B}·${by(q)} + ${C}·${by(r)} − ${num(e, 0)}| ÷ √(${A * A} + ${B * B} + ${C * C}) = ${gap * L} ÷ ${L} = ${gap}. So the circle has radius squared ${R * R} − ${gap * gap} = ${r2}, and ${ask === 'area' ? 'its area is' : 'its radius is'} <b>${ans[1]}</b>.`,
    check: () => {
      // from the foot of the perpendicular, walk along the plane until the sphere is reached
      const O = [p, q, r], len = Math.hypot(A, B, C), t0 = (e - dot3([A, B, C], O)) / (len * len), Ft = O.map((v, i) => v + t0 * [A, B, C][i]);
      const w = cross3([A, B, C], [1, 0, 0]), wl = Math.hypot(...w), u = w.map((v) => v / wl), rho = root((t) => dist(Ft.map((v, i) => v + t * u[i]), O) - R, 0, 2 * R + 1);
      return close(dot3([A, B, C], Ft.map((v, i) => v + rho * u[i])), e, 1e-6) && close(ask === 'area' ? rho * rho * Math.PI : rho, ans[0], 1e-6);
    },
  };
};

// three corners of a tilted cube: the distances between corners are s, s√2 and s√3, so the pattern tells which is which
const CUBE_FRAMES = [[[1, 2, 2], [2, 1, -2], [2, -2, 1], 3], [[2, 3, 6], [3, -6, 2], [6, 2, -3], 7], [[1, 4, 8], [4, 7, -4], [8, -4, 1], 9], [[4, 4, 7], [1, -8, 4], [8, -1, -4], 9], [[2, 2, 1], [1, -2, 2], [2, -1, -2], 3]];
const add3 = (...vs) => vs.reduce((m, v) => m.map((x, i) => x + v[i]), [0, 0, 0]);
const scale3 = (v, k) => v.map((x) => x * k);
const cubeFromPoints = (d, ctx) => {
  const [[u0, v0, w0, unit], base, k, form, ask] = pick(ctx, 'cubepts', [CUBE_FRAMES, [[3, 1, 2], [1, 5, 4], [7, 2, 9], [0, 3, 6], [5, 8, 1]], [1, 2], ['equal', 'mixed', 'right'], ['surface', 'volume', 'diagonal']], (f, b, kk) => f[3] * kk <= 14);
  const u = scale3(u0, k), v = scale3(v0, k), w = scale3(w0, k), s = unit * k, P = base;
  // (the three corners, by how far apart they are)
  const [Q, R] = { equal: [add3(P, u, v), add3(P, u, w)], mixed: [add3(P, u), add3(P, u, v, w)], right: [add3(P, u), add3(P, u, v)] }[form];
  const d1 = dist(P, Q) ** 2, d2 = dist(Q, R) ** 2, d3 = dist(R, P) ** 2, sq = (n) => Math.round(n), s2 = s * s;
  const ans = { surface: fl(6 * s2), volume: fl(s ** 3), diagonal: surd(s, 3) }[ask];
  const lens = `PQ<sup>2</sup> = ${sq(d1)}, QR<sup>2</sup> = ${sq(d2)} and RP<sup>2</sup> = ${sq(d3)}`;
  const reason = {
    equal: `All three distances are equal. Corners of a cube are s, s√2 or s√3 apart. Three corners that are all s apart or all s√3 apart don’t exist, so these must be face diagonals, with 2s<sup>2</sup> = ${sq(d1)}.`,
    mixed: `The squares are in the ratio 1 : 2 : 3, so they must be s<sup>2</sup>, 2s<sup>2</sup> and 3s<sup>2</sup> (an edge, a face diagonal and a long diagonal), with s<sup>2</sup> = ${s2}.`,
    right: `The squares are in the ratio 1 : 1 : 2, so PQ and QR are edges and RP is a face diagonal, with s<sup>2</sup> = ${s2}.`,
  }[form];
  const wrong = { surface: [fl(6 * d1), fl(6 * sq(d2)), fl(4 * s2), fl(2 * s2), fl(12 * s2), fl(3 * s2), fl(8 * s2), fl(9 * s2)], volume: [fl(s2), fl(2 * s ** 3), fl(s ** 3 / 2), fl(s ** 3 * 3), surd(s ** 3, 2), fl(s ** 3 + s2), surd(s ** 3, 3)], diagonal: [surd(s, 2), fl(s), surd(2 * s, 3), fl(2 * s), surd(2 * s, 2), surd(s, 6), fl(3 * s)] }[ask];
  const what = { surface: 'the surface area of the cube', volume: 'the volume of the cube', diagonal: 'the length of a long diagonal of the cube' }[ask];
  const finish = { surface: `So the surface area is 6s<sup>2</sup> = <b>${ans[1]}</b>.`, volume: `So s = ${s}, and the volume is <b>${ans[1]}</b>.`, diagonal: `So s = ${s}, and a long diagonal is s√3 = <b>${ans[1]}</b>.` }[ask];
  return {
    topic: SPACE, rank: 16,
    text: `Three of the corners of a cube are P = ${pt3(P)}, Q = ${pt3(Q)} and R = ${pt3(R)}. What is ${what}?`,
    answer: five(d, ans, pos(wrong)),
    solution: `Find the squared distances: ${lens}. ${reason} ${finish}`,
    check: () => {
      // the cube’s eight corners from its frame: the three given points must be among them
      const corners8 = []; for (const a of [0, 1]) for (const b of [0, 1]) for (const c of [0, 1]) corners8.push(add3(P, scale3(u, a), scale3(v, b), scale3(w, c)));
      const isCorner = (X) => corners8.some((Y) => dist(X, Y) < 1e-9), right = Math.abs(dot3(u, v)) + Math.abs(dot3(v, w)) + Math.abs(dot3(u, w));
      const side = Math.hypot(...u), got = { surface: 6 * side * side, volume: Math.abs(dot3(u, cross3(v, w))), diagonal: dist(corners8[0], corners8[7]) }[ask];
      return right === 0 && isCorner(Q) && isCorner(R) && close(got, ans[0]);
    },
  };
};

// the shortest path that touches some coordinate planes: reflect the end point over each plane
function shortestPath(A, B, planes) {
  // coordinate descent on the touching points, for one order of the planes
  const pts = planes.map((pl) => { const m = mid3(A, B); m[pl] = 0; return m; });
  const len = () => { let s = 0, cur = A; for (const X of pts) { s += dist(cur, X); cur = X; } return s + dist(cur, B); };
  for (let round = 0; round < 40; round++) for (let i = 0; i < pts.length; i++) for (const c of [0, 1, 2]) {
    if (c === planes[i]) continue;
    const f = (v) => { pts[i][c] = v; return len(); }, keep = pts[i][c], best = dip(f, keep - 12, keep + 12);
    pts[i][c] = f(best) <= f(keep) ? best : keep;
  }
  return len();
}
const PATH_PTS = [[1, 2, 3], [2, 1, 2], [3, 1, 1], [1, 3, 2], [2, 4, 1], [4, 2, 3], [1, 1, 4], [5, 1, 2], [3, 3, 1], [2, 2, 5]];
const reflectPath = (d, ctx) => {
  const [A, B, form] = pick(ctx, 'reflectpath', [PATH_PTS, PATH_PTS, ['one', 'two', 'three']], (a, b) => a !== b);
  const [x1, y1, z1] = A, [x2, y2, z2] = B, dx = form === 'one' ? x2 - x1 : x1 + x2, dy = form === 'three' ? y1 + y2 : y2 - y1, dz = z1 + z2, N = dx * dx + dy * dy + dz * dz, ans = surd(1, N);
  const named = { one: 'the xy-plane', two: 'the xy-plane and the yz-plane', three: 'all three coordinate planes' }[form];
  const straight = (x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2;
  const wrongs = [surd(1, straight), surd(1, (x1 + x2) ** 2 + (y1 + y2) ** 2 + (z1 + z2) ** 2), surd(1, (x1 + x2) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2), fl(Math.abs(dx) + Math.abs(dy) + Math.abs(dz)), surd(1, dx * dx + dz * dz), surd(1, 2 * N), surd(1, dy * dy + dz * dz + 1), surd(1, N + 4)];
  const refl = { one: [x2, y2, -z2], two: [-x2, y2, -z2], three: [-x2, -y2, -z2] }[form];
  // the segment AB′ can cross two planes at the same moment, and then the path touches both at one point
  const crossed = { one: [], two: [0, 2], three: [0, 1, 2] }[form];
  const [i, j] = crossed.flatMap((p, at) => crossed.slice(at + 1).filter((q) => A[p] * B[q] === A[q] * B[p]).map((q) => [p, q]))[0] ?? [];
  const span = A[i] + B[i];
  const onePoint = i === undefined ? '' : `The shortest path touches ${'xyz'[i]} = 0 and ${'xyz'[j]} = 0 at the same point, (${[0, 1, 2].map((c) => fr(F(crossed.includes(c) ? Math.abs(A[c] * span - A[i] * (A[c] + B[c])) : A[c] * span + A[i] * (B[c] - A[c]), span))).join(', ')}), because the segment crosses those two planes at the same moment. `;
  return {
    topic: SPACE, rank: { one: 13, two: 16, three: 18 }[form],
    text: `A fly goes from A = ${pt3(A)} to B = ${pt3(B)}, touching ${named} on the way${form === 'one' ? '' : ', in any order'}. What is the shortest possible length of its path?`,
    answer: five(d, ans, pos(wrongs)),
    solution: `Reflect the part of the path after each touch over the plane it touches. The length stays the same, and the path becomes a path from A to the reflected point B′. Reflecting over ${named} flips the sign of ${{ one: 'z', two: 'z and x', three: 'each coordinate' }[form]}, so B′ = ${pt3(refl)}. The shortest such path is the straight segment AB′, which does cross ${form === 'one' ? 'the plane' : 'each plane'} between A and B′, since A and B′ are on opposite sides. ${onePoint}Its length is √(${Math.abs(dx)}<sup>2</sup> + ${Math.abs(dy)}<sup>2</sup> + ${dz}<sup>2</sup>) = <b>${ans[1]}</b>.`,
    check: () => {
      const orders = { one: [[2]], two: [[2, 0], [0, 2]], three: [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]] }[form];
      return close(Math.min(...orders.map((o) => shortestPath(A, B, o))), ans[0], 2e-3);
    },
  };
};

// a sphere touching all three coordinate planes has center (r, r, r): a point on it gives a quadratic in r
const TANGENT_PTS = [[1, 2, 2], [2, 2, 3], [3, 4, 5], [1, 2, 3], [2, 3, 4], [1, 3, 3], [1, 4, 5], [2, 3, 3], [1, 4, 4], [3, 3, 4], [2, 5, 6], [3, 5, 6], [1, 5, 6], [2, 4, 5], [4, 5, 6], [2, 6, 7], [1, 6, 7], [3, 4, 6]];
const tangentSphere = (d, ctx) => {
  const [[a, b, c], ask] = pick(ctx, 'tangentsphere', [TANGENT_PTS, ['large', 'product', 'centers']]);
  const s = a + b + c, Q = a * a + b * b + c * c, D = s * s - 2 * Q;
  const ans = { large: mix(s, 1, D, 2), product: fl(Q, 2), centers: surd(1, 3 * D) }[ask];
  const wrongs = {
    large: [mix(s, -1, D, 2), mix(s, 1, D), fl(s), fl(s, 2), mix(s, 2, D, 2), mix(s, 1, Q, 2), fl(Q, s), surd(1, Q)],
    product: [fl(Q), fl(s * s, 2), fl(s), fl(D, 2), fl(Q, 4), fl(a * b * c), fl(s * s, 4)],
    centers: [surd(1, D), surd(1, 3 * Q), surd(1, 2 * D), fl(s), surd(1, Q), surd(2, D), surd(1, 3 * D + 1)],
  }[ask];
  const what = { large: 'the radius of the larger of them', product: 'the product of their radii', centers: 'the distance between their centers' }[ask];
  return {
    topic: SPACE, rank: { large: 17, product: 16, centers: 18 }[ask],
    text: `Two spheres touch all three coordinate planes and pass through the point ${pt3([a, b, c])}. What is ${what}?`,
    answer: five(d, ans, pos(wrongs)),
    solution: `The point has all coordinates positive, so a sphere through it that touches all three coordinate planes has center (r, r, r) and radius r. So (r − ${a})<sup>2</sup> + (r − ${b})<sup>2</sup> + (r − ${c})<sup>2</sup> = r<sup>2</sup>, which tidies up to 2r<sup>2</sup> − ${2 * s}r + ${Q} = 0, or r<sup>2</sup> − ${s}r + ${frac(Q, 2)} = 0. ` + {
      large: `The larger root is r = (${s} + √(${s * s} − ${2 * Q})) ÷ 2 = <b>${ans[1]}</b>.`,
      product: `By Vieta, the two radii multiply to the constant term, <b>${ans[1]}</b>.`,
      centers: `The two roots differ by √(${s * s} − ${2 * Q}) = √${D}. The centers (r, r, r) are √3 times that difference apart, so the distance is √3·√${D} = <b>${ans[1]}</b>.`,
    }[ask],
    check: () => {
      const rs = zeros((r) => Math.hypot(r - a, r - b, r - c) - r, 1e-6, 4 * s, 20000);
      if (rs.length !== 2) return false;
      return close({ large: rs[1], product: rs[0] * rs[1], centers: dist([rs[0], rs[0], rs[0]], [rs[1], rs[1], rs[1]]) }[ask], ans[0], 1e-6);
    },
  };
};

// lines through a full row of points in an n by n by n grid: axis lines, face diagonals and long diagonals
const linesThroughN = (d, ctx) => {
  const [n] = pick(ctx, 'gridlines', [[3, 5, 6, 7, 8, 9, 10, 12]]);
  const axis = 3 * n * n, face = 6 * n, ans = axis + face + 4;
  return {
    topic: SPACE, rank: 18,
    text: `Consider the points (i, j, k) where i, j and k are each one of the numbers 1, 2, ⋯, ${n}. How many lines in space pass through ${n} of these points?`,
    answer: fiveCounts(d, ans, [axis, axis + face, axis + 4, axis + 2 * face + 4, 2 * ans, axis + face + 8, axis + 3 * n + 4, 13 * n]),
    solution: `Going along such a line from one point to the next, each coordinate must change by 0 or by ±1, since ${n} points fit in a range of ${n - 1} only with steps of size at most 1. Lines where only one coordinate changes: ${n} choices for each of the other two, and 3 choices of which one changes, for 3·${n}<sup>2</sup> = ${axis}. Lines where exactly two coordinates change: these are diagonals of a layer. There are ${n} layers in each of 3 directions and 2 diagonals in each layer, for 6·${n} = ${face}. Lines where all three change: the 4 long diagonals of the cube. The total is ${axis} + ${face} + 4 = <b>${ans}</b>.`,
    check: () => {
      // every full row: start at each point, in each of the 13 directions, where the step before it would leave the grid
      const ok = (v) => v >= 1 && v <= n; let count = 0;
      for (const dx of [-1, 0, 1]) for (const dy of [-1, 0, 1]) for (const dz of [-1, 0, 1]) {
        if (dx > 0 || (dx === 0 && dy > 0) || (dx === 0 && dy === 0 && dz >= 0)) continue;
        for (let i = 1; i <= n; i++) for (let j = 1; j <= n; j++) for (let k = 1; k <= n; k++) {
          if (ok(i - dx) && ok(j - dy) && ok(k - dz)) continue;
          let len = 0, [x, y, z] = [i, j, k];
          while (ok(x) && ok(y) && ok(z)) { len++; x += dx; y += dy; z += dz; }
          if (len === n) count++;
        }
      }
      return count === ans;
    },
  };
};

// the overlap of two regions |x| + |y| + |z| ≤ a: slices are squares, and the overlap is a smaller copy
const OCTA = [];
for (const a of [2, 3, 4, 5, 6, 8]) for (const b of [1, 2, 3, 4, 5, 6]) if (b < 2 * a) OCTA.push([a, b]);
const octahedra = (d, ctx) => {
  const form = ctx.k % 3 === 2 ? 'cap' : 'overlap', [[a, b]] = pick({ ...ctx, k: ctx.k - Math.floor((ctx.k + 1) / 3) * (form === 'overlap' ? 1 : 0) }, `octa-${form}`, [OCTA], ([x, y]) => form === 'overlap' || y < x);
  const r = F(2 * a - b, 2), cap = F(2 * (a - b) ** 3, 3), ans = form === 'overlap' ? fm(F(4, 3), fm(r, sqF(r))) : cap;
  const whole = F(4 * a ** 3, 3);
  const wrongs = form === 'overlap'
    ? [fm(F(2, 3), fm(r, sqF(r))), F(4 * (a - b) ** 3, 3), fs(whole, F(4 * b ** 3, 3)), fm(F(8, 3), fm(r, sqF(r))), fm(F(4), fm(r, sqF(r))), F(2 * b ** 3, 3), whole, fm(r, sqF(r))]
    : [F(4 * (a - b) ** 3, 3), F(4 * (a - b) ** 3), F((a - b) ** 3, 3), F(2 * a ** 3, 3), fs(F(2 * a ** 3, 3), F(2 * b ** 3, 3)), F((a - b) ** 3), F(8 * (a - b) ** 3, 3)];
  const slice = `The slice of |x| + |y| + |z| ≤ ${a} at height z is the square |x| + |y| ≤ ${a} − |z|. In the x and y directions that square has diagonals of length 2(${a} − |z|), so its area is 2(${a} − |z|)<sup>2</sup>.`;
  return {
    topic: SPACE, rank: form === 'overlap' ? 20 : 14,
    text: form === 'overlap'
      ? `What is the volume of the region of points (x, y, z) that satisfy both |x| + |y| + |z| ≤ ${a} and |x| + |y| + |z − ${b}| ≤ ${a}?`
      : `What is the volume of the region of points (x, y, z) that satisfy both |x| + |y| + |z| ≤ ${a} and z ≥ ${b}?`,
    answer: five(d, fq(ans), pos(wrongs.map(fq))),
    solution: form === 'overlap'
      ? `${slice} The region |x| + |y| + |z| ≤ s is an octahedron, two square pyramids of height s with base area 2s<sup>2</sup>, so its volume is 2·⅓·2s<sup>2</sup>·s = (4/3)s<sup>3</sup>. The two given octahedra are the same shape, one ${b} above the other. Their overlap is symmetric about the plane z = ${frac(b, 2)}. Above that plane the upper bound comes from the first one, |x| + |y| + z ≤ ${a}, which says |x| + |y| + (z − ${frac(b, 2)}) ≤ ${fr(r)}, and below it the second one gives the mirror image. So the overlap is an octahedron with s = ${fr(r)}, and its volume is (4/3)·${par(fm(r, sqF(r)))} = <b>${fr(ans)}</b>.`
      : `${slice} The part with z ≥ ${b} is a square pyramid. Its apex is at z = ${a}, so its height is ${a - b}. Its base is the slice at z = ${b}, with area 2·${a - b}<sup>2</sup> = ${2 * (a - b) ** 2}. So its volume is ⅓·${2 * (a - b) ** 2}·${a - b} = <b>${fr(ans)}</b>.`,
    check: () => {
      // add up, over a fine grid in x and y, how long the column of points in the region is
      const n = 500, h = (2 * a) / n; let V = 0;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const x = -a + (i + 0.5) * h, y = -a + (j + 0.5) * h, top0 = a - Math.abs(x) - Math.abs(y);
        if (top0 <= 0) continue;
        V += (form === 'overlap' ? Math.max(0, Math.min(top0, b + top0) - Math.max(-top0, b - top0)) : Math.max(0, top0 - b)) * h * h;
      }
      return close(V, fv(ans), 4e-3);
    },
  };
};

// skew lines in a box: look along one of them, and its partner’s distance is a height in a flat picture
const SKEW_BOXES = [[3, 4, 5], [3, 4, 7], [6, 8, 3], [5, 12, 2], [2, 3, 5], [1, 2, 4], [1, 1, 3], [2, 4, 3], [8, 15, 4], [5, 5, 2], [3, 6, 8], [4, 7, 9]];
const skewDistance = (d, ctx) => {
  const form = ['cube1', 'edge', 'cube2'][ctx.k % 3], turn = { ...ctx, k: Math.floor(ctx.k / 3) };
  const segMin = (P, Q, R, S) => -top2((t, u) => -dist(P.map((v, i) => v + t * (Q[i] - v)), R.map((v, i) => v + u * (S[i] - v))), [0, 1], [0, 1]);
  if (form === 'edge') {
    const [[a, b, c]] = pick(turn, 'skew-edge', [SKEW_BOXES]);
    const N = a * a + b * b, ans = fracSurd(a * b, N, N);
    const wrongs = [fl(a * b, a + b), fracSurd(a * b, a * a + b * b + c * c, a * a + b * b + c * c), fracSurd(1, 2, N), fracSurd(2 * a * b, N, N), fl(Math.min(a, b)), fracSurd(a * b, 2 * N, N), fl(a * b, N), fracSurd(a * c, a * a + c * c, a * a + c * c)];
    return {
      topic: SPACE, rank: 19,
      text: `A box has corners A = (0, 0, 0) and G = (${a}, ${b}, ${c}) and edges parallel to the axes. What is the shortest distance between the diagonal AG and the edge from (${a}, 0, 0) to (${a}, 0, ${c})?`,
      answer: five(d, ans, pos(wrongs)),
      solution: `Look straight down the z-axis. The edge becomes the single point (${a}, 0), and the diagonal AG becomes the diagonal of the ${a} by ${b} rectangle in the xy-plane. The shortest distance is the height from that corner to that diagonal, because the edge is vertical. In a right triangle with legs ${a} and ${b} and hypotenuse √${N}, the height to the hypotenuse is ${a}·${b} ÷ √${N} = <b>${ans[1]}</b>.`,
      check: () => close(segMin([0, 0, 0], [a, b, c], [a, 0, 0], [a, 0, c]), ans[0], 1e-5),
    };
  }
  const [s] = pick(turn, `skew-${form}`, [[1, 2, 3, 4, 6, 9, 12]]);
  const label = 'Cube ABCDEFGH has A = (0, 0, 0), B = (' + s + ', 0, 0), C = (' + s + ', ' + s + ', 0), D = (0, ' + s + ', 0), and E, F, G and H directly above A, B, C and D at height ' + s + '.';
  const ans = form === 'cube1' ? fracSurd(s, 6, 6) : fracSurd(s, 3, 3), other = form === 'cube1' ? fracSurd(s, 3, 3) : fracSurd(s, 6, 6);
  const wrongs = [other, fracSurd(s, 2, 2), fl(s, 2), fl(s), fracSurd(s, 3, 6), fracSurd(s, 2, 3), fracSurd(s, 4, 2), fl(s, 3)];
  const [U, V, n] = form === 'cube1' ? [[1, 1, 1], [-1, 1, 0], [-1, -1, 2]] : [[1, 1, 0], [0, 1, 1], [1, -1, 1]];
  return {
    topic: SPACE, rank: 20,
    text: `${label} What is the shortest distance between ${form === 'cube1' ? 'the long diagonal AG and the face diagonal BD' : 'the face diagonals AC and BG'}?`,
    answer: five(d, ans, pos(wrongs)),
    solution: `The lines have directions (${U.join(', ')}) and (${V.join(', ').replace(/-/g, '−')}). A vector perpendicular to both is n = (${n.join(', ').replace(/-/g, '−')}), of length ${form === 'cube1' ? '√6' : '√3'}, since its dot product with each direction is 0. The shortest distance between the lines is the length of the shadow along n of any segment joining them, such as AB = (${s}, 0, 0). So the distance is |${s}·${by(n[0])}| ÷ ${form === 'cube1' ? '√6' : '√3'} = <b>${ans[1]}</b>.`,
    check: () => close(form === 'cube1' ? segMin([0, 0, 0], [s, s, s], [s, 0, 0], [0, s, 0]) : segMin([0, 0, 0], [s, s, 0], [s, 0, 0], [s, s, s]), ans[0], 1e-5),
  };
};

// everything within r of two perpendicular axes: square slices, compared with a sphere’s round ones (Cavalieri)
const steinmetz = (d, ctx) => {
  const [r, ask] = pick(ctx, 'steinmetz', [[2, 3, 4, 5, 6, 9, 12, 15], ['axes', 'pipes']]);
  const ans = fl(16 * r ** 3, 3);
  const pi = (p, q) => { const [u, v] = F(p, q); return [(u / v) * Math.PI, v === 1 ? `${num(u, 0)}π` : over(`${num(u, 0)}π`, v)]; };
  const wrongs = [fl(8 * r ** 3), pi(4 * r ** 3, 3), pi(2 * r ** 3, 1), fl(8 * r ** 3, 3), pi(16 * r ** 3, 3), fl(32 * r ** 3, 3), fl(4 * r ** 3)];
  return {
    topic: SPACE, rank: 23,
    text: ask === 'axes'
      ? `What is the volume of the set of all points in space that are within distance ${r} of the x-axis and also within distance ${r} of the y-axis?`
      : `Two solid cylinders of radius ${r} and very long length cross so that their axes meet at right angles. What is the volume of the part they share?`,
    answer: five(d, ans, wrongs),
    solution: `${ask === 'axes' ? `The conditions are y<sup>2</sup> + z<sup>2</sup> ≤ ${r * r} and x<sup>2</sup> + z<sup>2</sup> ≤ ${r * r}.` : `Put the axes along the x-axis and the y-axis, so the conditions are y<sup>2</sup> + z<sup>2</sup> ≤ ${r * r} and x<sup>2</sup> + z<sup>2</sup> ≤ ${r * r}.`} At height z, the slice is a square with |x| and |y| each at most √(${r * r} − z<sup>2</sup>), of area 4(${r * r} − z<sup>2</sup>). The sphere x<sup>2</sup> + y<sup>2</sup> + z<sup>2</sup> ≤ ${r * r} has as its slice at the same height the circle inscribed in that square, of area π(${r * r} − z<sup>2</sup>). So at every height the slice of our solid is 4/π times the slice of the sphere, and by Cavalieri’s principle its volume is 4/π times the sphere’s: (4/π)·(4/3)π·${r}<sup>3</sup> = <b>${ans[1]}</b>.`,
    check: () => {
      const n = 600, h = (2 * r) / n; let V = 0;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const x = -r + (i + 0.5) * h, y = -r + (j + 0.5) * h;
        V += 2 * Math.sqrt(r * r - Math.max(x * x, y * y)) * h * h;
      }
      return close(V, ans[0], 2e-3);
    },
  };
};

// a box from the distances between its long diagonal and three of its edges: reciprocals of squares add
const BOX_SIDES = [[2, 3, 6], [3, 4, 12], [2, 4, 5], [1, 2, 3], [2, 5, 6], [3, 5, 6], [3, 4, 6], [4, 6, 9], [2, 3, 4], [3, 6, 8], [4, 5, 8], [2, 6, 9], [3, 4, 5], [6, 8, 15], [4, 6, 7]];
const reverseBox = (d, ctx) => {
  const [[a, b, c], ask] = pick(ctx, 'reversebox', [BOX_SIDES, ['volume', 'diagonal', 'surface']]);
  const pq = (x, y) => F(x * x * y * y, x * x + y * y), P2 = pq(a, b), Q2 = pq(b, c), R2 = pq(c, a), V = a * b * c, S2 = a * a + b * b + c * c, SA = 2 * (a * b + b * c + c * a);
  const ans = { volume: fl(V), diagonal: surd(1, S2), surface: fl(SA) }[ask], i = (x) => fr(fd(ONE, x));
  const u = fm(F(1, 2), fs(fa(fd(ONE, P2), fd(ONE, R2)), fd(ONE, Q2))), wrongsV = [fl(2 * V), fl(V, 2), rootF(fm(fm(P2, Q2), R2)), fl(V + a * b), fl(V + b * c), fl(a * a * b), rootF(fm(fm(P2, Q2), F(4)))];
  const wrongs = { volume: wrongsV, diagonal: [fl(a + b + c), surd(1, a * a + b * b), surd(1, b * b + c * c), surd(2, S2), surd(1, a * a + c * c), surd(1, S2 + 2 * a), fracSurd(1, 2, S2)], surface: [fl(SA / 2), fl(2 * SA), fl(a * b + b * c), fl(6 * b * b), fl(SA + 2 * a), fl(SA - 2 * a), fl(V)] }[ask];
  const what = { volume: 'the volume of the box', diagonal: 'the length of the long diagonal', surface: 'the surface area of the box' }[ask];
  const finish = { volume: `So the edges are ${a}, ${b} and ${c}, and the volume is <b>${ans[1]}</b>.`, diagonal: `So the edges are ${a}, ${b} and ${c}, and the long diagonal is √(${a * a} + ${b * b} + ${c * c}) = <b>${ans[1]}</b>.`, surface: `So the edges are ${a}, ${b} and ${c}, and the surface area is 2(${a * b} + ${b * c} + ${c * a}) = <b>${ans[1]}</b>.` }[ask];
  return {
    topic: SPACE, rank: 24,
    text: `A long diagonal of a rectangular box does not meet six of the box’s edges. The shortest distances from this diagonal to those edges take three values: ${rootF(P2)[1]}, ${rootF(Q2)[1]} and ${rootF(R2)[1]}. What is ${what}?`,
    answer: five(d, ans, pos(wrongs)),
    solution: `Let the edges be x, y and z. Looking straight along an edge of length z, the box becomes an x by y rectangle, the diagonal becomes the rectangle’s diagonal, and the edge becomes a corner. So the distance is the height of a right triangle with legs x and y, and 1/(distance)<sup>2</sup> = 1/x<sup>2</sup> + 1/y<sup>2</sup>. So the squared distances ${fr(P2)}, ${fr(Q2)} and ${fr(R2)} give 1/x<sup>2</sup> + 1/y<sup>2</sup> = ${i(P2)}, 1/y<sup>2</sup> + 1/z<sup>2</sup> = ${i(Q2)} and 1/z<sup>2</sup> + 1/x<sup>2</sup> = ${i(R2)}. Adding the first and third and subtracting the second gives 2/x<sup>2</sup>, so 1/x<sup>2</sup> = ${fr(u)} and x = ${a}. In the same way y = ${b} and z = ${c}. ${finish}`,
    check: () => {
      // search for the closest points between the diagonal and one edge of each kind
      const G = [a, b, c], near3 = (R, S) => -top2((t, w) => -dist(G.map((v) => v * t), R.map((v, j) => v + w * (S[j] - v))), [0, 1], [0, 1]);
      return close(near3([a, 0, 0], [a, 0, c]), Math.sqrt(fv(P2)), 1e-5) && close(near3([0, 0, c], [a, 0, c]), Math.sqrt(fv(Q2)), 1e-5) && close(near3([0, b, 0], [0, b, c]), Math.sqrt(fv(P2)), 1e-5) && close(near3([0, 0, c], [0, b, c]), Math.sqrt(fv(R2)), 1e-5)
        && close(ask === 'volume' ? a * b * c : ask === 'diagonal' ? dist([0, 0, 0], G) : 2 * (a * b + b * c + c * a), ans[0]);
    },
  };
};

// A topic has 12 variants, and its question types take turns, so the types listed first are the ones that get a second
// turn, and each type’s first form is the one most often seen: these lists start with the hard ones.
export const trigSpace = {
  [EXACT]: [ratioSystem, tanRatioTriangle, onePlus, secPlusCsc, tripleAngle, secPlusTan, fourthPowers, addTo45, sumSquared],
  [SUMPROD]: [cubicCos, telescopeCsc, cotDoubling, closingTriangle, fourthSum, cosineTrick, tripleProduct, doublingProduct, pairSums, tanPairs, apRatio, squarePairs],
  [COUNTING]: [nestedCos, squaresEquation, tanVsWave, exactCount, lineAndWave, dominantWave, threeTerm, sinEqualsSin, polyInSine],
  [LAWS]: [cosDifference, halfTangent, cotRatio, doubleAngle, fermatPoint, ratioLemma, cyclicQuad, ssaCount, bisectorLength, apSides, sineRatio],
  [LARGEST]: [twoVariable, slopeMax, trapezoidMax, tanDifference, triangleFixed, amgmTrap, sixthPlus, tSubstitution, quadraticForm, fixedSumPair, cosPlusSine, waveMax],
  [CONICS]: [circumscribedRect, circleMeet, hyperbolaTangent, reflectTangent, focalTriangle, orthogonalChord, ellipseMax, focalChord, parabolaTangents, parabolaPoint, fociDistance],
  [SOLIDS]: [disphenoid, ballsInTetra, ballsOnTable, dihedralVolume, cornerTetra, tetraAngle, sphereThroughTriangle, sixtyEdges, regularFacts, pointsOnEdges],
  [SPACE]: [reverseBox, steinmetz, skewDistance, octahedra, linesThroughN, tangentSphere, reflectPath, cubeFromPoints, planeCircle, sphereCircles, latticeOnSphere],
};
