// AMC 12 algebra beyond the AMC 10 course, mostly for problems 12 to 25: Vieta past the cubic, polynomials known from
// their values, roots moved by a substitution, sequences and functions that come round again, floors, big powers, and
// expected values worked out from states. The ideas are the ones behind contest problems. The problems, numbers and
// wording are new (the real ones are the MAA's copyright). Each topic asks its idea several ways, and every check()
// gets the answer a second way: by brute force, exact BigInt arithmetic, direct simulation or numeric root-finding.
import { combo, num, frac, gcd, choose } from '../kit/bank.js';
import { choices, showFrac, range, ord } from './amc-kit.js';

// combo, with a name of its own for each kind of question, so no two kinds share a list of combinations
const pick = (ctx, tag, lists, ok) => combo({ ...ctx, salt: `${ctx.salt}|${tag}` }, lists, ok);
// a type with several forms: the forms take turns (the turn number stays as it is)
const turn = (ctx, forms) => [forms[ctx.k % forms.length], ctx];

// ---------- how things read ----------
const plainDigits = (x) => String(x).replace(/(\d),(?=\d)/g, '$1');
const sup = (b, e) => `${plainDigits(b)}<sup>${plainDigits(e)}</sup>`;
const sub = (v, i) => `${v}<sub>${plainDigits(i)}</sub>`;
const over = (top, bottom) => `<span class="fr"><span>${top}</span><span>${bottom}</span></span>`;
const paren = (x) => (x < 0 ? `(${num(x)})` : num(x));
const listing = (xs, and = 'and') => (xs.length < 2 ? String(xs[0]) : `${xs.slice(0, -1).join(', ')} ${and} ${xs.at(-1)}`);
const orList = (xs) => listing(xs, 'or');
const sum = (xs) => xs.reduce((s, x) => s + x, 0);
const prod = (xs) => xs.reduce((s, x) => s * x, 1);
const isqrt = (n) => { let r = Math.floor(Math.sqrt(n)); while (r * r > n) r--; while ((r + 1) * (r + 1) <= n) r++; return r; };
const isSq = (n) => n >= 0 && isqrt(n) ** 2 === n;
// a sum like 4p − 2q + r, from [coefficient, letter] pairs (letter '' for a plain number), leaving out zeros
function expr(...parts) {
  let out = '';
  for (const [c, v] of parts) {
    if (!c) continue;
    const size = Math.abs(c) === 1 && v ? '' : num(Math.abs(c), 4);
    out += (out ? (c < 0 ? ' − ' : ' + ') : c < 0 ? '−' : '') + size + v;
  }
  return out || '0';
}
// a polynomial from its coefficients, lowest power first: [−7, 1, −5, 2] is 2x³ − 5x² + x − 7
const poly = (cs, v = 'x') => expr(...cs.map((c, i) => [c, i === 0 ? '' : i === 1 ? v : sup(v, i)]).reverse());
// v + a, written v − 3 for a = −3 (and v for 0)
const shift = (v, a) => (a === 0 ? v : `${v} ${a < 0 ? '−' : '+'} ${num(Math.abs(a))}`);
// " + 3xy" or " − 3xy", for a term after others
const signed = (c, v = '') => (c === 0 ? '' : ` ${c < 0 ? '−' : '+'} ${Math.abs(c) === 1 && v ? '' : num(Math.abs(c))}${v}`);
// a complex number p + qi as it reads
const cx = (p, q) => expr([p, ''], [q, 'i']);

// ---------- fractions as [p, q] (small whole numbers) ----------
const cut = (p, q = 1) => { if (q < 0) { p = -p; q = -q; } const g = gcd(p, q) || 1; return [p / g, q / g]; };
const fr = ([p, q]) => frac(p, q);
const pf = (x) => (x[0] < 0 ? `(${fr(x)})` : fr(x));
const val = (v) => (Array.isArray(v) ? v[0] / v[1] : v);
const bare = (v) => showFrac(v).replace(/<[^>]+>/g, '');
// choices() for exact answers (whole numbers, or fractions as [p, q]), with the wrong ones topped up here so that no two
// choices read the same even once the fraction bars are gone (3/2 and 32)
function fchoices(d, correct, wrongs) {
  const [p, q] = Array.isArray(correct) ? correct : [correct, 1], keep = [];
  for (const w of [...wrongs, ...range(1, 12).flatMap((k) => [[p + k, q], [p - k, q]])]) {
    if (keep.length === 4) break;
    if (Number.isFinite(val(w)) && (val(correct) < 0 || val(w) >= 0) && ![correct, ...keep].some((x) => Math.abs(val(x) - val(w)) < 1e-9 || bare(x) === bare(w))) keep.push(w);
  }
  return choices(d, correct, keep, showFrac);
}
// five choices given as [value, how it reads], skipping wrong ones whose value or reading repeats, sorted by value
const plain = (s) => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
function tchoices(correct, wrongs) {
  const list = [correct];
  for (const w of wrongs) if (w && list.length < 5 && Number.isFinite(w[0]) && !list.some((x) => Math.abs(x[0] - w[0]) < 1e-9 * Math.max(1, Math.abs(w[0])) || plain(x[1]) === plain(w[1]))) list.push(w);
  if (list.length < 5) throw new Error(`tchoices: only ${list.length} different choices for ${correct[1]}`);
  list.sort((a, b) => a[0] - b[0]);
  return { kind: 'choice', choices: list.map((x) => x[1]), correct: list.indexOf(correct) };
}

// ---------- exact fractions with BigInt: [p, q] in lowest terms, q > 0 ----------
const big = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const Q = (p, q = 1n) => { p = BigInt(p); q = BigInt(q); if (q < 0n) { p = -p; q = -q; } const g = big(p, q) || 1n; return [p / g, q / g]; };
const qadd = (x, y) => Q(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
const qsub = (x, y) => Q(x[0] * y[1] - y[0] * x[1], x[1] * y[1]);
const qmul = (x, y) => Q(x[0] * y[0], x[1] * y[1]);
const qdiv = (x, y) => Q(x[0] * y[1], x[1] * y[0]);
const qf = (x) => Number(x[0]) / Number(x[1]);
const qn = (x) => [Number(x[0]), Number(x[1])];
const toQ = (v) => (Array.isArray(v) ? Q(v[0], v[1]) : Q(v));
const qeq = (x, y) => x[0] === y[0] && x[1] === y[1];
const qsign = (x) => (x[0] > 0n ? 1 : x[0] < 0n ? -1 : 0);
// true, or what went wrong (check() must return exactly true)
const said = (got, v) => (qeq(got, toQ(v)) ? true : `worked out ${got[0]}/${got[1]}, said ${v}`);
const near = (got, want, what = 'value', tol = 1e-6) => (Math.abs(got - want) <= tol * Math.max(1, Math.abs(want)) ? true : `${what}: worked out ${got}, said ${want}`);
// n equations in n unknowns (rows of exact fractions, the right side last), solved by elimination
function solveLinear(rows) {
  const m = rows.map((r) => r.map(toQ)), n = m.length;
  for (let c = 0; c < n; c++) {
    const pr = range(c, n - 1).find((r) => m[r][c][0] !== 0n);
    if (pr === undefined) return null;
    [m[c], m[pr]] = [m[pr], m[c]];
    for (let r = 0; r < n; r++) if (r !== c && m[r][c][0] !== 0n) { const f = qdiv(m[r][c], m[c][c]); m[r] = m[r].map((x, j) => qsub(x, qmul(f, m[c][j]))); }
  }
  return m.map((r, i) => qdiv(r[n], r[i]));
}
// the value at x of the polynomial through the points (xs[i], ys[i]), all exact (Lagrange's formula)
function interp(xs, ys, x) {
  let total = Q(0);
  xs.forEach((xi, i) => {
    let term = toQ(ys[i]);
    xs.forEach((xj, j) => { if (j !== i) term = qmul(term, Q(BigInt(x) - BigInt(xj), BigInt(xi) - BigInt(xj))); });
    total = qadd(total, term);
  });
  return total;
}

// ---------- polynomials with BigInt coefficients, lowest power first ----------
const B = (cs) => cs.map((c) => BigInt(c));
const padd = (a, b) => range(0, Math.max(a.length, b.length) - 1).map((i) => (a[i] ?? 0n) + (b[i] ?? 0n));
const pmul = (a, b) => { const out = Array(a.length + b.length - 1).fill(0n); a.forEach((x, i) => b.forEach((y, j) => { out[i + j] += x * y; })); return out; };
const btrim = (a) => { const r = a.slice(); while (r.length > 1 && r[r.length - 1] === 0n) r.pop(); return r; };
const compose = (f, g) => btrim(f.reduceRight((acc, c) => padd(pmul(acc, g), [c]), [0n]));
const pval = (a, x) => a.reduceRight((s, c) => s * BigInt(x) + c, 0n);
const fromRootsB = (rs) => rs.reduce((acc, r) => pmul(acc, [BigInt(-r), 1n]), [1n]);

// Sturm sequences: the exact number of different real roots of a polynomial with whole-number coefficients
const qtrim = (a) => { const r = a.slice(); while (r.length && r[r.length - 1][0] === 0n) r.pop(); return r; };
const qderiv = (a) => a.slice(1).map((c, i) => qmul(c, Q(i + 1)));
function qrem(a, b) {
  let r = qtrim(a);
  const bb = qtrim(b), db = bb.length - 1, lead = bb[db];
  while (r.length && r.length - 1 >= db) {
    const sh = r.length - 1 - db, f = qdiv(r[r.length - 1], lead);
    for (let j = 0; j <= db; j++) r[sh + j] = qsub(r[sh + j], qmul(f, bb[j]));
    r = qtrim(r);
  }
  return r;
}
function sturm(coeffs) {
  const p0 = qtrim(coeffs.map((c) => Q(c))), seq = [p0, qderiv(p0)];
  for (;;) { const r = qrem(seq[seq.length - 2], seq[seq.length - 1]); if (!r.length) break; seq.push(r.map(([p, q]) => [-p, q])); }
  return seq;
}
function changesAtEnd(seq, end) {
  const signs = seq.map((p) => qsign(p.at(-1)) * (end < 0 && (p.length - 1) % 2 ? -1 : 1)).filter(Boolean);
  let n = 0;
  for (let i = 1; i < signs.length; i++) if (signs[i] !== signs[i - 1]) n++;
  return n;
}
const realRootCount = (coeffs) => { const s = sturm(coeffs); return changesAtEnd(s, -1) - changesAtEnd(s, 1); };

// ---------- complex numbers [re, im], and all the roots of a polynomial by Durand–Kerner iteration ----------
const cadd = (a, b) => [a[0] + b[0], a[1] + b[1]];
const csub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cdiv = (a, b) => { const m = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / m, (a[1] * b[0] - a[0] * b[1]) / m]; };
const cpow = (a, n) => { let r = [1, 0]; for (let i = 0; i < n; i++) r = cmul(r, a); return r; };
const cprod = (zs) => zs.reduce(cmul, [1, 0]);
const csum = (zs) => zs.reduce(cadd, [0, 0]);
// cs: real coefficients, lowest power first
function rootsOf(cs) {
  const n = cs.length - 1, c = cs.map((v) => v / cs[n]), R = 1 + Math.max(...c.slice(0, n).map(Math.abs));
  const zs = range(0, n - 1).map((k) => { const th = (2 * Math.PI * k) / n + 0.4; return [0.7 * R * Math.cos(th), 0.7 * R * Math.sin(th)]; });
  const ev = (z) => c.reduceRight((s, v) => cadd(cmul(s, z), [v, 0]), [0, 0]);
  for (let it = 0; it < 3000; it++) {
    let moved = 0;
    for (let i = 0; i < n; i++) {
      let den = [1, 0];
      for (let j = 0; j < n; j++) if (j !== i) den = cmul(den, csub(zs[i], zs[j]));
      const dz = cdiv(ev(zs[i]), den);
      zs[i] = csub(zs[i], dz);
      moved = Math.max(moved, Math.hypot(dz[0], dz[1]));
    }
    if (moved < 1e-15 * R) break;
  }
  return zs;
}
const cnear = (z, v, tol = 1e-6) => Math.abs(z[0] - v) <= tol * Math.max(1, Math.abs(v)) && Math.abs(z[1]) <= tol * Math.max(1, Math.abs(v));
const powerSum = (rs, k) => csum(rs.map((r) => cpow(r, k)));
// a small random-number stream for checks (the same every time)
const stream = (seed) => () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };

// ======================================================================================================================
// Vieta for higher degrees: power sums, conjugate pairs, roots that are forced, and products over all the roots
// ======================================================================================================================
const VI = 'Vieta for higher degrees';
const X2 = sup('x', 2);
const psLabel = (L, k) => `${sup(L[0], k)} + ${sup(L[1], k)} + ${L.length > 3 ? `${sup(L[2], k)} + ${sup(L[3], k)}` : sup(L[2], k)}`;
const psLetters = (L) => `${L.slice(0, -1).join(', ')} and ${L.at(-1)}`;
// the power sums p0, p1, …, up to k, of the roots of xⁿ + c[n−1]xⁿ⁻¹ + ⋯ + c[0] (Newton's identities)
function newton(c, k) {
  const n = c.length, p = [n];
  for (let m = 1; m <= k; m++) {
    let v = 0;
    for (let j = 1; j <= Math.min(m, n); j++) {
      if (j < m || m > n) v -= c[n - j] * p[m - j];
      else v -= m * c[n - m];
    }
    p.push(v);
  }
  return p;
}
const vieta = [
  // power sums: from a cubic or quartic, or from the first three power sums themselves
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['cubic', 'quartic', 'given']);
    if (form === 'given') {
      const [e1, e2, e3, K] = pick(c2, 'given', [[1, 2, 3, -1, -2, 4], [-3, -2, -1, 1, 2, 3, 4, 5], [-4, -3, -2, -1, 1, 2, 3, 5], [4, 5]], (e1, e2, e3) => e1 * e1 !== 2 * e2);
      const p = newton([-e3, e2, -e1], K), L = ['a', 'b', 'c'], ans = p[K];
      const Ps = p.slice(1, 4);
      return {
        topic: VI, rank: K === 4 ? 20 : 21,
        text: `Complex numbers a, b and c satisfy a + b + c = ${num(p[1])}, ${psLabel(L, 2)} = ${num(p[2])} and ${psLabel(L, 3)} = ${num(p[3])}. What is ${psLabel(L, K)}?`,
        answer: fchoices(d, ans, [p[K - 1], e1 * p[K - 1] - e2 * p[K - 2], e1 * p[K - 1] - e2 * p[K - 2] - e3 * p[K - 3], e1 * p[K - 1] + e2 * p[K - 2] + e3 * p[K - 3], p[2] ** 2, ans + e3]),
        check: () => {
          const rs = rootsOf([-e3, e2, -e1, 1]);
          if (![1, 2, 3].every((k) => cnear(powerSum(rs, k), Ps[k - 1]))) return 'the roots do not give the three sums';
          return cnear(powerSum(rs, K), ans) ? true : `the roots give ${powerSum(rs, K)}`;
        },
        solution: `Think of a, b and c as the roots of x<sup>3</sup> − Sx<sup>2</sup> + Tx − U, where S = a + b + c, T = ab + bc + ca and U = abc. Here S = ${num(e1)}. `
          + `Squaring S gives ${paren(e1)}<sup>2</sup> = ${num(p[2])} + 2T, so T = ${num(e2)}. `
          + `The identity a<sup>3</sup> + b<sup>3</sup> + c<sup>3</sup> − 3U = S(a<sup>2</sup> + b<sup>2</sup> + c<sup>2</sup> − T) gives ${num(p[3])} − 3U = ${paren(e1)}·(${num(p[2])} − ${paren(e2)}), so U = ${num(e3)}. `
          + `Each of a, b and c satisfies x<sup>3</sup> = ${expr([e1, X2], [-e2, 'x'], [e3, ''])}. Multiply by x and add over the three roots: writing p<sub>k</sub> for the sum of the k-th powers, p<sub>k+1</sub> = ${paren(e1)}p<sub>k</sub> − ${paren(e2)}p<sub>k−1</sub> + ${paren(e3)}p<sub>k−2</sub>. `
          + `So p<sub>4</sub> = ${paren(e1)}·${paren(p[3])} − ${paren(e2)}·${paren(p[2])} + ${paren(e3)}·${paren(p[1])} = ${num(p[4])}`
          + (K === 5 ? `, and p<sub>5</sub> = ${paren(e1)}·${paren(p[4])} − ${paren(e2)}·${paren(p[3])} + ${paren(e3)}·${paren(p[2])} = <b>${num(p[5])}</b>.` : `. So the answer is <b>${num(ans)}</b>.`),
      };
    }
    const deg = form === 'cubic' ? 3 : 4, SMALL = [-3, -2, -1, 1, 2, 3], L = deg === 3 ? ['r', 's', 't'] : ['r', 's', 't', 'u'];
    const lists = deg === 3 ? [SMALL, [-4, -3, -2, -1, 1, 2, 3, 4], [-5, -3, -2, -1, 1, 2, 3, 5], [4, 5]] : [SMALL, [-3, -2, -1, 2, 3], [-3, -2, -1, 1, 2, 3], [-3, -2, -1, 1, 2, 3], [4, 5]];
    const combo1 = pick(c2, `newton-${deg}`, lists, (...v) => v[0] !== v[1]);
    const K = combo1.at(-1), hi = combo1.slice(0, deg), c = hi.slice().reverse(), p = newton(c, K), ans = p[K];
    const cs = [...c, 1], wrongP = newton(c.map((v, i) => (i === deg - 1 ? -v : v)), K)[K];
    const noP0 = K === deg ? ans + (deg - 1) * c[0] : ans;   // the slip: p0 taken as 1
    const steps = range(deg, K).map((k) => {
      const terms = range(1, deg).map((j) => [-c[deg - j], k - j]);
      const text = terms.map(([co, i]) => `${paren(co)}·${paren(p[i])}`).join(' + ');
      return `p<sub>${k}</sub> = ${text} = ${num(p[k])}`;
    });
    const early = deg === 3 ? `p<sub>0</sub> = 3, p<sub>1</sub> = ${num(p[1])} and p<sub>2</sub> = ${paren(p[1])}<sup>2</sup> − 2·${paren(hi[1])} = ${num(p[2])}`
      : `p<sub>0</sub> = 4, p<sub>1</sub> = ${num(p[1])}, p<sub>2</sub> = ${paren(p[1])}<sup>2</sup> − 2·${paren(hi[1])} = ${num(p[2])} and p<sub>3</sub> = (sum)<sup>3</sup> − 3(sum)(pairs) + 3(triples) = ${paren(p[1])}<sup>3</sup> − 3·${paren(p[1])}·${paren(hi[1])} + 3·${paren(-hi[2])} = ${num(p[3])}, where “pairs” and “triples” are the sums of the products of two and of three roots`;
    return {
      topic: VI, rank: deg === 3 ? (K === 4 ? 15 : 17) : (K === 4 ? 17 : 19),
      text: `Let ${psLetters(L)} be the roots, real or not, of ${poly(cs)} = 0. What is ${psLabel(L, K)}?`,
      answer: fchoices(d, ans, [wrongP, noP0, p[K - 1], p[1] ** K, p[2] ** 2, ans + 2 * c[0]]),
      check: () => (cnear(powerSum(rootsOf(cs), K), ans) ? true : `the roots give ${powerSum(rootsOf(cs), K)}`),
      solution: `Write p<sub>k</sub> for the sum of the k-th powers of the roots. Each root x satisfies ${sup('x', deg)} = ${expr(...range(1, deg).map((j) => [-c[deg - j], deg - j === 0 ? '' : deg - j === 1 ? 'x' : sup('x', deg - j)]))}. `
        + `Multiplying by ${sup('x', 'k')} and adding over the roots gives p<sub>k+${deg}</sub> = ${range(1, deg).map((j) => `${paren(-c[deg - j])}p<sub>k+${deg - j}</sub>`).join(' + ').replaceAll('k+0', 'k')}, so each power sum comes from the ones before it. `
        + `The starting values come from Vieta: ${early}. `
        + `Then ${steps.join(', and ')}. So the answer is <b>${num(ans)}</b>.`,
    };
  },
  // four non-real roots and real coefficients: a product of two and a sum of the other two pin down the conjugate pairs
  (d, ctx) => {
    const [ask, c2] = turn(ctx, ['b', 'c', 'one']);
    const [p, q, u, t] = pick(c2, `conj-${ask}`, [[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], [-4, -3, -2, -1, 1, 2, 3, 5], [1, 2, 3, 4, 5, -1, -2, -3], [-5, -4, -3, -2, -1, 1, 2, 3, 4, 6]], (p, q, u, t) => {
      if (p === 13 || (u === 3 && t === 4)) return false;
      const x = -q / t;     // a real root of x² − (u − ti)x + (p + qi) would have to be this number
      return Math.abs(x * x - u * x + p) > 1e-9;
    });
    const Bv = 2 * p + u * u + t * t, Cv = -2 * (p * u - q * t), one = (1 - u + p) ** 2 + (t + q) ** 2;
    const ans = { b: Bv, c: Cv, one }[ask];
    const wrong = {
      b: [2 * p + u * u - t * t, p + u * u + t * t, 2 * p, u * u + t * t, 2 * p + 2 * u * t, p * p + q * q + u * u + t * t],
      c: [-Cv, 2 * (p * u + q * t), -2 * (p * u + q * t), 2 * p * u, -2 * p * u, Cv + 4 * q * t],
      one: [(1 + u + p) ** 2 + (t - q) ** 2, (1 - u + p) ** 2 + (t - q) ** 2, (1 - u + p) ** 2, (1 + u + p) ** 2 + (t + q) ** 2, 1 + Bv + (p * p + q * q)],
    }[ask];
    const W = cx(p, q), Wb = cx(p, -q), V = cx(u, t), Vb = cx(u, -t);
    return {
      topic: VI, rank: ask === 'b' ? 21 : 22,
      text: `For certain real numbers a, b, c and d, the equation x<sup>4</sup> + ax<sup>3</sup> + bx<sup>2</sup> + cx + d = 0 has four non-real roots. Two of the roots have product ${W}, and the other two have sum ${V}. What is ${ask === 'one' ? '1 + a + b + c + d' : ask}?`,
      answer: fchoices(d, ans, wrong),
      check: () => {
        // multiply out the two complex quadratics, find the roots numerically, and read off everything from them
        const f = [[p, q], [-u, t], [1, 0]], g = [[p, -q], [-u, -t], [1, 0]], cs = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]];
        f.forEach((x, i) => g.forEach((y, j) => { cs[i + j] = cadd(cs[i + j], cmul(x, y)); }));
        if (cs.some((z) => Math.abs(z[1]) > 1e-9)) return 'the coefficients are not real';
        const rs = rootsOf(cs.map((z) => z[0]));
        if (rs.some((z) => Math.abs(z[1]) < 1e-9)) return 'a root is real';
        let found = false;
        for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
          const rest = range(0, 3).filter((k) => k !== i && k !== j);
          if (Math.hypot(...csub(cmul(rs[i], rs[j]), [p, q])) < 1e-6 && Math.hypot(...csub(cadd(rs[rest[0]], rs[rest[1]]), [u, t])) < 1e-6) found = true;
        }
        if (!found) return 'no two roots have that product with the others having that sum';
        const value = { b: cs[2][0], c: cs[1][0], one: sum(cs.map((z) => z[0])) }[ask];
        return near(value, ans);
      },
      solution: `The coefficients are real, so the non-real roots come in conjugate pairs. The two roots with product ${W} can’t be conjugates of each other, because their product isn’t real. So the other two roots are their conjugates. `
        + `That means the other two have product ${Wb}, and the first two have sum ${Vb}. So the polynomial is (x<sup>2</sup> − (${Vb})x + (${W}))(x<sup>2</sup> − (${V})x + (${Wb})). `
        + ({
          b: `The coefficient b is the sum of all the products of two roots: the product of the first pair, the product of the second pair, and (sum of the first pair) × (sum of the second pair). So b = (${W}) + (${Wb}) + (${Vb})(${V}) = ${2 * p} + (${u * u} + ${t * t}) = <b>${num(Bv)}</b>.`,
          c: `The x term comes from (first constant) × (second middle term) + (second constant) × (first middle term), so c = −(${W})(${V}) − (${Wb})(${Vb}). These two products are conjugates, so their sum is twice the real part of (${W})(${V}), which is ${num(p * u - q * t)}. So c = −2·${paren(p * u - q * t)} = <b>${num(Cv)}</b>.`,
          one: `Now 1 + a + b + c + d is the polynomial’s value at x = 1. The first bracket at x = 1 is 1 − (${Vb}) + (${W}) = ${cx(1 - u + p, t + q)}, and the second bracket is its conjugate. A complex number times its conjugate is the sum of the squares of its parts: ${paren(1 - u + p)}<sup>2</sup> + ${paren(t + q)}<sup>2</sup> = <b>${num(one)}</b>.`,
        }[ask]),
    };
  },
  // roots that are forced: AM-GM with equality, the root-mean-square version, or positive integers with a given sum and product
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['amgm', 'qm', 'whole']);
    if (form === 'whole') {
      const SETS = [[1, 1, 1, 2, 3, 4], [1, 1, 2, 2, 3, 3], [1, 1, 1, 1, 3, 5], [1, 1, 1, 3, 3, 3], [1, 2, 2, 2, 2, 3], [1, 1, 2, 3, 3, 4], [1, 1, 1, 2, 2, 5], [1, 1, 1, 1, 2, 7], [1, 1, 2, 2, 2, 5], [1, 1, 1, 2, 4, 4], [1, 1, 1, 3, 3, 5], [1, 2, 2, 3, 3, 3], [1, 1, 1, 2, 3], [1, 1, 2, 3, 3], [1, 2, 2, 2, 3], [1, 1, 1, 3, 4], [1, 1, 2, 2, 5], [2, 2, 2, 3, 3], [1, 1, 3, 3, 3]];
      const ways = (n, N, min = 1) => { if (n === 1) return N >= min ? [[N]] : []; const out = []; for (let f = min; f ** n <= N; f++) if (N % f === 0) for (const w of ways(n - 1, N / f, f)) out.push([f, ...w]); return out; };
      const [roots, ask] = pick(c2, 'whole', [SETS, ['e2', 'e3']], (rs) => { const P = prod(rs), S = sum(rs); const all = ways(rs.length, P); return all.filter((w) => sum(w) === S).length === 1 && all.length >= 3 && all.length <= 9 && rs.join() !== '1,1,2,2,2,2'; });
      const n = roots.length, P = prod(roots), S = sum(roots), all = ways(n, P), p2 = sum(roots.map((r) => r * r)), p3 = sum(roots.map((r) => r ** 3));
      const e2 = (S * S - p2) / 2, e3 = (S ** 3 - 3 * S * p2 + 2 * p3) / 6;
      const others = all.filter((w) => sum(w) !== S).map((w) => { const q2 = sum(w.map((r) => r * r)), q3 = sum(w.map((r) => r ** 3)), s = sum(w); return ask === 'e2' ? (s * s - q2) / 2 : -(s ** 3 - 3 * s * q2 + 2 * q3) / 6; });
      const letters = n === 6 ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C'];
      const mid = letters.map((l, i) => `+ ${l}${n - 2 - i === 1 ? 'x' : sup('x', n - 2 - i)}`).join(' ');
      const constant = n % 2 === 0 ? `+ ${P}` : `− ${P}`, ans = ask === 'e2' ? e2 : -e3;
      return {
        topic: VI, rank: ask === 'e2' ? 17 : 19,
        text: `All the roots of ${sup('x', n)} − ${S}${sup('x', n - 1)} ${mid} ${constant} = 0 are positive integers, repeats allowed. What is ${ask === 'e2' ? 'A' : 'B'}?`,
        answer: fchoices(d, ans, [...others, ask === 'e2' ? S * S : e3, ask === 'e2' ? p2 : -p3, ans + S]),
        check: () => {
          const found = [];
          const go = (start, chosen) => {
            if (chosen.length === n) { const cs = fromRootsB(chosen); if (cs[n - 1] === BigInt(-S) && cs[0] === BigInt(n % 2 === 0 ? P : -P)) found.push(cs); return; }
            for (let r = start; r <= P; r++) if (prod(chosen) * r <= P) go(r, [...chosen, r]);
          };
          go(1, []);
          if (found.length !== 1) return `found ${found.length} polynomials`;
          return Number(found[0][ask === 'e2' ? n - 2 : n - 3]) === ans ? true : 'the polynomial says something else';
        },
        solution: `By Vieta the ${n} roots add up to ${S} and multiply to ${P}. The ways to write ${P} as a product of ${n} positive integers are ${listing(all.map((w) => `${w.join('·')} (sum ${sum(w)})`))}. Only ${roots.join(', ')} has sum ${S}, so those are the roots. `
          + (ask === 'e2'
            ? `A is the sum of the products of the roots in pairs, and (sum of roots)<sup>2</sup> = (sum of squares) + 2A. The squares add up to ${p2}, so A = (${S}<sup>2</sup> − ${p2})/2 = <b>${num(ans)}</b>.`
            : `B is −1 times the sum of the products of the roots in threes, and that sum is (S<sup>3</sup> − 3S·Q + 2R)/6, where S, Q and R are the sums of the roots, their squares and their cubes. Here S = ${S}, Q = ${p2} and R = ${p3}, so the sum of the products in threes is ${num(e3)}, and B = <b>${num(ans)}</b>.`),
      };
    }
    const qm = form === 'qm';
    const [n, g, ask] = pick(c2, `forced-${form}`, [qm ? [4, 5, 6] : [4, 5, 6, 7], qm ? [-2, -1, 1, 2, 3, 4] : [2, 3, 4, 5], ['second', 'third']], (n, g) => Math.abs(g) ** n <= 40000);
    const S = n * g, e2 = choose(n, 2) * g * g, e3 = choose(n, 3) * g ** 3, N = g ** n;
    const cs = fromRootsB(range(1, n).map(() => g)).map(Number);
    // the coefficient letters, from the power `top` down to the constant term (or down to x)
    const LET = ['A', 'B', 'C', 'D', 'E', 'F'], terms = (top, down) => range(0, top - down).map((i) => `${LET[i]}${top - i === 0 ? '' : top - i === 1 ? 'x' : sup('x', top - i)}`).join(' + ');
    const eq = qm ? `${sup('x', n)} ${S < 0 ? '+' : '−'} ${num(Math.abs(S))}${sup('x', n - 1)} + ${num(e2)}${sup('x', n - 2)} + ${terms(n - 3, 0)}`
      : `${sup('x', n)} − ${num(S)}${sup('x', n - 1)} + ${terms(n - 2, 1)} ${n % 2 === 0 ? '+' : '−'} ${num(N)}`;
    const askFirst = qm || ask === 'second', ans = qm ? -e3 : askFirst ? e2 : -e3;
    return {
      topic: VI, rank: qm ? 22 : askFirst ? 18 : 19,
      text: qm ? `All ${n} roots of ${eq} = 0 are real numbers. What is A?`
        : `All ${n} roots of ${eq} = 0 are positive real numbers. What is ${askFirst ? 'A' : 'B'}?`,
      answer: fchoices(d, ans, qm ? [e3, -e3 + S, S * g, -choose(n, 2) * g ** 3, -(n * g ** 3), -e3 + 2 * Math.abs(g)] : askFirst ? [n * g * g, choose(n, 2) * g, S * g, e2 + g, g * g * (n - 1)] : [e3, -n * g ** 3, -choose(n, 3) * g * g, -choose(n, 2) * g ** 3, -e3 + S]),
      check: () => {
        // no other positive (or real) numbers with this sum reach the stated product (or sum of squares), by sampling
        const r = stream(n * 1000 + (g + 7));
        for (let t = 0; t < 400; t++) {
          const w = range(1, n).map(() => r() - 0.5), avg = sum(w) / n, spread = 0.02 + r() * Math.abs(g);
          const xs = w.map((v) => g + (v - avg) * spread);
          if (qm) { if (sum(xs.map((x) => x * x)) <= S * S - 2 * e2 + 1e-12) return 'another set of real roots fits'; } else if (xs.every((x) => x > 0) && prod(xs) >= N) return 'another set of positive roots fits';
        }
        if (qm && S * S - 2 * e2 !== n * g * g) return 'the sum of the squares is not what forces the roots';
        // the coefficients of (x − g)ⁿ, multiplied out
        return cs[n - 1] === -S && cs[n - 2] === e2 && cs[n - 3] === -e3 && (askFirst && !qm ? cs[n - 2] : cs[n - 3]) === ans ? true : 'the expanded polynomial disagrees';
      },
      solution: qm
        ? `By Vieta the roots add up to ${num(S)} and the sum of their products in pairs is ${num(e2)}. So the sum of their squares is ${paren(S)}<sup>2</sup> − 2·${num(e2)} = ${num(S * S - 2 * e2)}. `
          + `For real numbers, the average of the squares is never less than the square of the average, and the two are equal only when all the numbers are the same. Here the average of the squares is ${num(S * S - 2 * e2)} ÷ ${n} = ${num(g * g)}, and the average of the roots is ${num(g)}, whose square is also ${num(g * g)}. So every root equals ${num(g)}. `
          + `The polynomial is therefore (${shift('x', -g)})<sup>${n}</sup>. By the binomial theorem the coefficient of ${n === 4 ? 'x' : sup('x', n - 3)} is ${choose(n, 3)}·${paren(-g)}<sup>3</sup>, so A = <b>${num(ans)}</b>.`
        : `By Vieta the roots add up to ${num(S)} and multiply to ${num(N)}. Their average is ${num(S)} ÷ ${n} = ${g}, and their geometric mean is the ${ord(n)} root of ${num(N)}, which is also ${g}. `
          + `By AM-GM the two means are equal only when all the numbers are the same, so every root is ${g}. The polynomial is (x − ${g})<sup>${n}</sup>. `
          + (askFirst ? `By the binomial theorem the coefficient of ${sup('x', n - 2)} is ${choose(n, 2)}·${g}<sup>2</sup> = <b>${num(ans)}</b>.` : `By the binomial theorem the coefficient of ${n === 4 ? 'x' : sup('x', n - 3)} is ${choose(n, 3)}·(−${g})<sup>3</sup> = <b>${num(ans)}</b>.`),
    };
  },
  // a product over all the roots of r² + k², r² + r + 1 or r² − r + 1: factor over the complex numbers, then use P at those points
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['quartic', 'omega', 'minus', 'cubic']);
    const co = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];
    if (form === 'omega' || form === 'minus') {
      const [a, b, c] = pick(c2, `omega-${form}`, [co, co, co], (a, b, c) => form === 'omega' ? b !== a && c + 1 !== a : a + b !== 0 && c - 1 !== a);
      const A = form === 'omega' ? 1 + c - a : c - 1 - a, Bc = form === 'omega' ? b - a : -(a + b), ans = A * A - A * Bc + Bc * Bc;
      const P1 = 1 + a + b + c, cs = [c, b, a, 1], f = form === 'omega' ? 'r<sup>2</sup> + r + 1' : 'r<sup>2</sup> − r + 1';
      const label = (L) => (form === 'omega' ? `(${L}<sup>2</sup> + ${L} + 1)` : `(${L}<sup>2</sup> − ${L} + 1)`);
      const at = form === 'omega' ? 'ω' : '−ω', at2 = form === 'omega' ? 'ω<sup>2</sup>' : '−ω<sup>2</sup>';
      return {
        topic: VI, rank: form === 'omega' ? 23 : 24,
        text: `Let r, s and t be the roots, real or not, of ${poly(cs)} = 0. What is ${label('r')}${label('s')}${label('t')}?`,
        answer: fchoices(d, ans, [A * A + A * Bc + Bc * Bc, A * A + Bc * Bc, (A - Bc) ** 2, Math.abs(P1) ** 2, ans + 3, Math.abs(A * Bc)]),
        check: () => {
          const v = cprod(rootsOf(cs).map((r) => cadd(csub(cmul(r, r), form === 'omega' ? [-r[0], -r[1]] : r), [1, 0])));
          return cnear(v, ans) ? true : `the roots give ${v}`;
        },
        solution: `Let ω be a non-real cube root of 1, so ω<sup>2</sup> + ω + 1 = 0 and ω<sup>3</sup> = 1, and its conjugate is ω<sup>2</sup>. `
          + `Then (${at} − r)(${at2} − r) = ${f}, because the two numbers ${at} and ${at2} add up to ${form === 'omega' ? '−1' : '1'} and multiply to 1. `
          + `Let P(x) be the polynomial. Since P(x) = (x − r)(x − s)(x − t), the product we want is exactly P(${at})·P(${at2}). `
          + `Using ω<sup>3</sup> = 1 and ω<sup>2</sup> = −1 − ω: P(${at}) = ${form === 'omega' ? `1 + ${paren(a)}ω<sup>2</sup> + ${paren(b)}ω + ${paren(c)}` : `−1 + ${paren(a)}ω<sup>2</sup> − ${paren(b)}ω + ${paren(c)}`} = ${expr([A, ''], [Bc, 'ω'])}. `
          + `P(${at2}) is its conjugate, ${expr([A, ''], [Bc, 'ω<sup>2</sup>'])}. `
          + `Multiplying, (m + nω)(m + nω<sup>2</sup>) = m<sup>2</sup> + mn(ω + ω<sup>2</sup>) + n<sup>2</sup>ω<sup>3</sup> = m<sup>2</sup> − mn + n<sup>2</sup>. With m = ${num(A)} and n = ${num(Bc)}, this is ${A * A} − ${paren(A * Bc)} + ${Bc * Bc} = <b>${num(ans)}</b>.`,
      };
    }
    const deg = form === 'cubic' ? 3 : 4;
    const lists = deg === 3 ? [co, co, co, [1, 2, 3]] : [co, co, co, co, [1, 2]];
    const parts = (cs, k) => (cs.length === 4 ? [cs[0] - cs[2] * k * k, cs[1] * k - k ** 3] : [k ** 4 - cs[2] * k * k + cs[0], cs[1] * k - cs[3] * k ** 3]);
    const v = pick(c2, `prod-${deg}`, lists, (...w) => { const [x, y] = parts([...w.slice(0, deg).reverse(), 1], w.at(-1)); return w[0] !== w[1] && x !== 0 && y !== 0; });
    const k = v.at(-1), cs = [...v.slice(0, deg).reverse(), 1];
    const [re, im] = parts(cs, k), ans = re * re + im * im;
    const L = deg === 3 ? ['r', 's', 't'] : ['r', 's', 't', 'u'], kk = k === 1 ? 'i' : `${k}i`;
    const fac = (l) => `(${l}<sup>2</sup> + ${k * k})`, Pk = pval(B(cs), k), Pm = pval(B(cs), -k);
    return {
      topic: VI, rank: deg === 3 ? 20 : 21,
      text: `Let ${psLetters(L)} be the roots, real or not, of ${poly(cs)} = 0. What is ${L.map(fac).join('')}?`,
      answer: fchoices(d, ans, [re * re - im * im, re * re, im * im, Math.abs(Number(Pk * Pm)), (Math.abs(re) + Math.abs(im)) ** 2, ans + 2 * k]),
      check: () => {
        const w = cprod(rootsOf(cs).map((r) => cadd(cmul(r, r), [k * k, 0])));
        return cnear(w, ans) ? true : `the roots give ${w}`;
      },
      solution: `Over the complex numbers, each factor splits: (${kk} − r)(−${kk} − r) = r<sup>2</sup> + ${k * k}. Let P(x) be the polynomial, so P(x) = ${L.map((l) => `(x − ${l})`).join('')}. `
        + `Then multiplying P(${kk}) by P(−${kk}) gives exactly the product we want. `
        + `Using i<sup>2</sup> = −1: P(${kk}) = ${cx(re, im)}, and P(−${kk}) is its conjugate, ${cx(re, -im)}. `
        + `A complex number times its conjugate is the sum of the squares of its parts, so the product is ${paren(re)}<sup>2</sup> + ${paren(im)}<sup>2</sup> = <b>${num(ans)}</b>.`,
    };
  },
];

// ======================================================================================================================
// Polynomials from their values: clearing a rule so that it becomes a list of zeros, values that hide a binomial
// expansion, unknowns that cancel, values given at the roots of another polynomial, and integer coefficients
// ======================================================================================================================
const PV = 'Polynomials from their values';
const qshow = (x) => fr(qn(x));
const qparen = (x) => (x[0] < 0n ? `(${qshow(x)})` : qshow(x));
const upTo = (a, b) => (b - a <= 4 ? listing(range(a, b).map(num)) : `${num(a)}, ${num(a + 1)}, ${num(a + 2)}, …, ${num(b)}`);
const harmonic = (N) => range(1, N).reduce((s, k) => qadd(s, Q(1, k)), Q(0));
const fact = (n) => range(1, n).reduce((s, k) => s * BigInt(k), 1n);
const nodeProd = (m, a, b) => range(a, b).reduce((s, k) => s * BigInt(m - k), 1n);       // (m − a)(m − a − 1)⋯(m − b)
const bnum = (n) => num(Number(n), 0);
const hSum = (N) => (N <= 4 ? range(1, N).map((k) => (k === 1 ? '1' : over(1, k))).join(' + ') : `1 + ${over(1, 2)} + ⋯ + ${over(1, N)}`);
// the integer vectors (P(r), P(s), P(t)) for all P with integer coefficients are the integer combinations of the vectors
// of powers: triangular basis by gcd steps, and a membership test
function latticeBasis(rows) {
  let cur = rows.map((r) => r.map(BigInt));
  const basis = [], W = cur[0].length;
  for (let c = 0; c < W; c++) {
    let piv = null;
    const rest = [];
    for (let row of cur) {
      while (row && row[c] !== 0n) {
        if (!piv) { piv = row; row = null; break; }
        const f = row[c] / piv[c];
        row = row.map((v, i) => v - f * piv[i]);
        if (row[c] !== 0n) [piv, row] = [row, piv];
      }
      if (row && row.some((v) => v !== 0n)) rest.push(row);
    }
    if (piv) basis.push([c, piv]);
    cur = rest;
  }
  return basis;
}
const inLattice = (basis, vec) => {
  let v = vec.map(BigInt);
  for (const [c, row] of basis) {
    if (v[c] % row[c] !== 0n) return false;
    const f = v[c] / row[c];
    v = v.map((x, i) => x - f * row[i]);
  }
  return v.every((x) => x === 0n);
};
// the values of a polynomial through complex points, at a real number (Lagrange's formula, numerically)
const lagrangeC = (xs, ys, at) => csum(xs.map((xi, i) => xs.reduce((t, xj, j) => (j === i ? t : cmul(t, cdiv(csub([at, 0], xj), csub(xi, xj)))), ys[i])));

const fromValues = [
  // clear the rule: (x + 1)P(x) − x, xP(x) − a or x²P(x) − a has all the given numbers as zeros
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['ratio', 'zero', 'square', 'recip']);
    if (form === 'ratio') {
      const [n, j] = pick(c2, 'ratio', [range(3, 9), [1, 2]]);
      const m = n + j, sgn = (n + 1) % 2 ? -1n : 1n, PI = nodeProd(m, 0, n), W = Q(PI * sgn, fact(n + 1)), ans = qdiv(qadd(Q(m), W), Q(m + 1));
      return {
        topic: PV, rank: 23,
        text: `A polynomial P of degree ${n} satisfies P(k) = ${over('k', 'k + 1')} for k = ${upTo(0, n)}. What is P(${m})?`,
        answer: fchoices(d, qn(ans), [[m, m + 1], qn(qdiv(qsub(Q(m), W), Q(m + 1))), qn(qdiv(qadd(Q(m), W), Q(m))), qn(W), [1, 1], [m, m + 2]]),
        check: () => said(interp(range(0, n), range(0, n).map((k) => [k, k + 1]), m), qn(ans)),
        solution: `Clear the fraction: let Q(x) = (x + 1)P(x) − x. This has degree ${n + 1}, and Q(k) = 0 for k = ${upTo(0, n)}. So Q(x) = c·x(x − 1)(x − 2)⋯(x − ${n}) for some number c. `
          + `Putting in x = −1 removes P: Q(−1) = 0 − (−1) = 1. So 1 = c·(−1)(−2)⋯(−${n + 1}) = c·${paren(Number(fact(n + 1) * sgn))}, which gives c = ${qshow(Q(sgn, fact(n + 1)))}. `
          + `Now put in x = ${m}: ${m + 1}·P(${m}) − ${m} = c·${m}·${m - 1}⋯${m - n} = ${qshow(W)}. So P(${m}) = (${m} + ${qparen(W)}) ÷ ${m + 1} = <b>${qshow(ans)}</b>.`,
      };
    }
    if (form === 'zero') {
      const [a, N] = pick(c2, 'zero', [[1, 2, 3, 6], range(3, 8)]);
      const H = harmonic(N), ans = qmul(Q(a), H), af = (x) => qn(qmul(Q(a), x)), top = a === 1 ? '' : `${a}`;
      return {
        topic: PV, rank: 24,
        text: `A polynomial P of degree ${N - 1} satisfies P(k) = ${over(a, 'k')} for k = ${upTo(1, N)}. What is P(0)?`,
        answer: fchoices(d, qn(ans), [af(harmonic(N - 1)), af(harmonic(N + 1)), af(Q(N, N + 1)), af(Q(1, N)), af(Q(1, Number(fact(N)))), af(Q(N))]),
        check: () => said(interp(range(1, N), range(1, N).map((k) => [a, k]), 0), qn(ans)),
        solution: `Clear the fraction: let Q(x) = xP(x) − ${a}. This has degree ${N}, and Q(k) = 0 for k = ${upTo(1, N)}. Since Q(0) = −${a}, we can write Q(x) = −${a}(1 − x)(1 − ${over('x', 2)})⋯(1 − ${over('x', N)}), because this has the right zeros and the right value at 0. `
          + `Look at the coefficient of x on both sides. In xP(x) − ${a} it is P(0). In the product, taking the x term from one bracket and 1 from all the others gives −${a}·(−1 − ${over(1, 2)} − ⋯ − ${over(1, N)}). `
          + `So P(0) = ${top}${top ? '·' : ''}(${hSum(N)}) = <b>${qshow(ans)}</b>.`,
      };
    }
    if (form === 'square') {
      const [a, N, j] = pick(c2, 'square', [[1, 2, 3, 6], [3, 4, 5, 6], [1, 2]]);
      const m = N + j, gm = nodeProd(m, 1, N), g0 = BigInt((N % 2 ? -1 : 1)) * fact(N), H = harmonic(N);
      const v = Q(BigInt(-a), g0), u = qmul(v, H), Gm = Q(gm), R = qmul(Gm, qadd(qmul(u, Q(m)), v)), ans = qdiv(qadd(Q(a), R), Q(m * m));
      const dropU = qdiv(qadd(Q(a), qmul(Gm, v)), Q(m * m)), minus = qdiv(qsub(Q(a), R), Q(m * m));
      const g1 = qmul(Q(g0), qmul(Q(-1), H));
      return {
        topic: PV, rank: 25,
        text: `A polynomial P of degree ${N - 1} satisfies P(k) = ${over(a, 'k<sup>2</sup>')} for k = ${upTo(1, N)}. What is P(${m})?`,
        answer: fchoices(d, qn(ans), [[a, m * m], qn(dropU), qn(minus), qn(qdiv(qadd(Q(a), R), Q(m))), qn(qdiv(R, Q(m * m)))]),
        check: () => said(interp(range(1, N), range(1, N).map((k) => [a, k * k]), m), qn(ans)),
        solution: `Clear the fraction: let R(x) = x<sup>2</sup>P(x) − ${a}. This has degree ${N + 1} and has ${upTo(1, N)} as zeros, so R(x) = G(x)(ux + v), where G(x) = ${N === 3 ? '(x − 1)(x − 2)(x − 3)' : `(x − 1)(x − 2)⋯(x − ${N})`} and u, v are numbers still to find. `
          + `Two facts about R fix them, and both come from x<sup>2</sup>P(x) having no constant term and no x term: R(0) = −${a}, and the coefficient of x in R is 0. `
          + `Here G(0) = ${bnum(g0)}, and the coefficient of x in G is ${qshow(g1)}. The constant term gives ${bnum(g0)}·v = −${a}, so v = ${qshow(v)}. The x term gives ${bnum(g0)}·u + (${qshow(g1)})·v = 0, so u = ${qshow(u)}. `
          + `At x = ${m}, G(${m}) = ${bnum(gm)}, so R(${m}) = ${bnum(gm)}·(${m}·${qparen(u)} + ${qparen(v)}) = ${qshow(R)}. Then ${m * m}·P(${m}) − ${a} = ${qshow(R)}, so P(${m}) = <b>${qshow(ans)}</b>.`,
      };
    }
    const [n, j] = pick(c2, 'recip', [range(3, 9), [1, 2, 3]]);
    const N = n + 1, m = N + j, c = Q((n % 2 ? -1n : 1n), fact(N)), W = qmul(c, Q(nodeProd(m, 1, N))), ans = qdiv(qadd(Q(1), W), Q(m));
    return {
      topic: PV, rank: 22,
      text: `A polynomial P of degree ${n} satisfies P(k) = ${over(1, 'k')} for k = ${upTo(1, N)}. What is P(${m})?`,
      answer: fchoices(d, qn(ans), [[1, m], qn(qdiv(qsub(Q(1), W), Q(m))), qn(W), qn(qdiv(qadd(Q(1), W), Q(m + 1))), [0, 1]]),
      check: () => said(interp(range(1, N), range(1, N).map((k) => [1, k]), m), qn(ans)),
      solution: `Clear the fraction: let Q(x) = xP(x) − 1. This has degree ${N} and zeros ${upTo(1, N)}, so Q(x) = c(x − 1)(x − 2)⋯(x − ${N}). Putting in x = 0 gives −1 = c·${paren(Number(fact(N) * (N % 2 ? -1n : 1n)))}, so c = ${qshow(c)}. `
        + `At x = ${m}: ${m}·P(${m}) − 1 = c·${bnum(nodeProd(m, 1, N))} = ${qshow(W)}. So P(${m}) = (1 + ${qparen(W)}) ÷ ${m} = <b>${qshow(ans)}</b>.`,
    };
  },
  // P(k) = bᵏ at consecutive whole numbers: the next value is a binomial expansion with its last terms missing
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['two', 'base', 'alt']);
    const series = (b, n, m) => range(0, n).reduce((s, i) => { let t = Q(BigInt(choose(m, i))); for (let e = 0; e < i; e++) t = qmul(t, qsub(b, Q(1))); return qadd(s, t); }, Q(0));
    if (form === 'two') {
      const [a, N, j] = pick(c2, 'two', [[1, 3, 5, 7], range(4, 11), [1, 2]]);
      const m = N + j, ans = 2 * a * sum(range(0, N - 1).map((i) => choose(m - 1, i))), full = 2 ** m * a, miss = 2 * a * (j === 1 ? 1 : 1 + m - 1);
      const A = a === 1 ? '' : `${a}·`;
      return {
        topic: PV, rank: j === 1 ? 20 : 22,
        text: `A polynomial P of degree ${N - 1} satisfies P(k) = ${A}${sup(2, 'k')} for k = ${upTo(1, N)}. What is P(${m})?`,
        answer: fchoices(d, ans, [full, full - a, full - 1, full - 2, ans + 2 * a, ans - 2 * a, 2 ** (m - 1) * a]),
        check: () => said(interp(range(1, N), range(1, N).map((k) => a * 2 ** k), m), ans),
        solution: `Use the binomial coefficients C(x, i) = x(x − 1)⋯(x − i + 1)/i!, which are polynomials in x of degree i. Let T(x) = ${a === 1 ? '' : `${a}·`}2[C(x − 1, 0) + C(x − 1, 1) + ⋯ + C(x − 1, ${N - 1})], which has degree ${N - 1}. `
          + `For k from 1 to ${N}, the bracket at x = k is C(k − 1, 0) + ⋯ + C(k − 1, k − 1) = ${sup(2, 'k − 1')}, because the terms past C(k − 1, k − 1) are 0. So T(k) = ${A}${sup(2, 'k')}, the same as P at ${N} points, and so T = P. `
          + `At x = ${m} the bracket is C(${m - 1}, 0) + ⋯ + C(${m - 1}, ${N - 1}), which is all of row ${m - 1} of Pascal’s triangle except ${j === 1 ? `the last term, C(${m - 1}, ${m - 1}) = 1` : `the last two terms, C(${m - 1}, ${m - 2}) = ${m - 1} and C(${m - 1}, ${m - 1}) = 1`}. `
          + `So the bracket is ${sup(2, m - 1)} − ${miss / (2 * a)} = ${num(ans / (2 * a))}, and P(${m}) = ${2 * a}·${num(ans / (2 * a))} = <b>${num(ans)}</b>.`,
      };
    }
    const alt = form === 'alt';
    const [bb, n] = pick(c2, form, [alt ? ['neg', 'half'] : [3, 4, 5], range(3, 8)], (bb, n) => bb !== 'half' || n % 2 === 0);
    const b = bb === 'neg' ? Q(-1) : bb === 'half' ? Q(1, 2) : Q(bb), m = n + 1, ans = series(b, n, m);
    const pw = (x, e) => { let t = Q(1); for (let i = 0; i < e; i++) t = qmul(t, x); return t; };
    const b1 = qsub(b, Q(1)), full = pw(b, m), top = pw(b1, m), bshow = qparen(b), b1show = qparen(b1);
    const inText = bb === 'neg' ? sup('(−1)', 'k') : bb === 'half' ? sup(`(${over(1, 2)})`, 'k') : sup(bb, 'k');
    return {
      topic: PV, rank: alt ? 23 : 22,
      text: `A polynomial P of degree ${n} satisfies P(k) = ${inText} for k = ${upTo(0, n)}. What is P(${m})?`,
      answer: fchoices(d, qn(ans), [qn(full), qn(qsub(full, Q(1))), qn(qadd(full, top)), qn(qsub(full, pw(b1, n))), qn(qadd(ans, Q(1))), qn(qmul(Q(-1), ans)), qn(top)]),
      check: () => said(interp(range(0, n), range(0, n).map((k) => qn(pw(b, k))), m), qn(ans)),
      solution: `Use the binomial coefficients C(x, i) = x(x − 1)⋯(x − i + 1)/i!, which are polynomials in x of degree i. Let T(x) = C(x, 0) + ${b1show}·C(x, 1) + ${b1show}<sup>2</sup>·C(x, 2) + ⋯ + ${b1show}<sup>${n}</sup>·C(x, ${n}), which has degree ${n}. `
        + `For a whole number k from 0 to ${n}, the terms past C(k, k) are 0, and the rest are the binomial expansion of (1 + ${b1show})<sup>k</sup> = ${bshow}<sup>k</sup>. So T agrees with P at ${n + 1} points, and T = P. `
        + `At x = ${m} the sum is the expansion of (1 + ${b1show})<sup>${m}</sup> with its last term, ${b1show}<sup>${m}</sup>, missing. So P(${m}) = ${bshow}<sup>${m}</sup> − ${b1show}<sup>${m}</sup> = ${qparen(full)} − ${qparen(top)} = <b>${qshow(ans)}</b>.`,
    };
  },
  // what cancels: the even part of a cubic, or an unknown fourth root
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['even', 'cancel', 'diff']);
    if (form === 'even') {
      const [D, u, w, a] = pick(c2, 'even', [[1, 2, 3, 4, 5, 6, 7], range(2, 20), range(3, 21), [2, 3, 4, 5]], (D, u, w) => (u + w) % 2 === 0 && u !== w && (u + w) / 2 !== D);
      const Bv = (u + w) / 2 - D, ans = 2 * (Bv * a * a + D);
      return {
        topic: PV, rank: 12,
        text: `A cubic polynomial P has P(0) = ${D}, P(1) = ${u} and P(−1) = ${w}. What is P(${a}) + P(−${a})?`,
        answer: fchoices(d, ans, [u + w, 2 * Bv * a * a, 2 * (Bv * a + D), a * a * (u + w), ans + 2 * D, ans - 2 * a]),
        check: () => {
          // try several cubics that fit, with any leading coefficient, and add the two values directly
          const half = Q(u - w, 2);
          for (const A of [Q(1), Q(-3), Q(5, 2), Q(7)]) {
            const C = qsub(half, A), f = (x) => qadd(qadd(qadd(qmul(A, Q(x ** 3)), qmul(Q(Bv), Q(x * x))), qmul(C, Q(x))), Q(D));
            if (!qeq(f(0), Q(D)) || !qeq(f(1), Q(u)) || !qeq(f(-1), Q(w)) || !qeq(qadd(f(a), f(-a)), Q(ans))) return `a cubic with leading coefficient ${A} disagrees`;
          }
          return true;
        },
        solution: `Write P(x) = Ax<sup>3</sup> + Bx<sup>2</sup> + Cx + D. In P(x) + P(−x) the odd powers cancel, leaving 2Bx<sup>2</sup> + 2D. So P(0) = D = ${D}. `
          + `Also P(1) + P(−1) = 2B + 2D, so ${u} + ${w} = 2B + ${2 * D}, which gives B = ${num(Bv)}. `
          + `A and C are never needed: P(${a}) + P(−${a}) = 2·${paren(Bv)}·${a * a} + 2·${D} = <b>${num(ans)}</b>.`,
      };
    }
    if (form === 'cancel') {
      const [al, be, s] = pick(c2, 'cancel', [[3, 5, 7, 8, 9, 11, 12, 13], [-4, -2, -1, 0, 1, 2, 3, 5], [1, 2, 3, 5, 7, 10]], (al, be, s) => al * (s - 1) + be > 0);
      const L = (x) => al * x + be, x0 = s - 1, x4 = s + 3, base = L(x0) + L(x4), ans = base + 24, lin = expr([al, 'x'], [be, '']);
      return {
        topic: PV, rank: 18,
        text: `Let P(x) = x<sup>4</sup> + ax<sup>3</sup> + bx<sup>2</sup> + cx + d, where a, b, c and d are real numbers, and suppose P(${s}) = ${L(s)}, P(${s + 1}) = ${L(s + 1)} and P(${s + 2}) = ${L(s + 2)}. What is P(${x0}) + P(${x4})?`,
        answer: fchoices(d, ans, [base, base + 12, base + 48, base + 6, base + 120, 24]),
        check: () => {
          // pick the fourth root freely: every choice gives a polynomial with the stated values and the same answer
          for (const r of [0, 1, -7, 11, 100]) {
            let cs = pmul(pmul(pmul([BigInt(-s), 1n], [BigInt(-s - 1), 1n]), [BigInt(-s - 2), 1n]), [BigInt(-r), 1n]);
            cs = padd(cs, [BigInt(be), BigInt(al)]);
            if ([s, s + 1, s + 2].some((x) => pval(cs, x) !== BigInt(L(x)))) return 'a value is wrong';
            if (pval(cs, x0) + pval(cs, x4) !== BigInt(ans)) return `with fourth root ${r} the sum is different`;
          }
          return true;
        },
        solution: `The three values follow the line ${lin}. So P(x) − (${lin}) is a quartic with leading coefficient 1 and zeros ${s}, ${s + 1} and ${s + 2}. Calling its fourth zero r, P(x) − (${lin}) = (${shift('x', -s)})(${shift('x', -s - 1)})(${shift('x', -s - 2)})(x − r). `
          + `At x = ${x0} the first three brackets multiply to (−1)(−2)(−3) = −6, and at x = ${x4} they multiply to 3·2·1 = 6. So P(${x0}) = ${num(L(x0))} − 6(${x0} − r) and P(${x4}) = ${num(L(x4))} + 6(${x4} − r). `
          + `Adding, r cancels: the sum is ${num(L(x0))} + ${num(L(x4))} + 6(${x4} − ${x0}) = ${num(base)} + 24 = <b>${num(ans)}</b>.`,
      };
    }
    const [p0, p1, p2, s] = pick(c2, 'diff', [[1, 2, 3, -1], [3, 5, 8, 4], [1, 2, 6, 3], [1, 2, 3, 4]]);
    const f = (x) => p0 * x ** 3 + p1 * x * x - p2 * x + 2, ys = [f(s), f(s + 1), f(s + 2), f(s + 3)], ans = f(s + 4);
    const d1 = ys.slice(1).map((y, i) => y - ys[i]), d2 = d1.slice(1).map((y, i) => y - d1[i]), d3 = d2[1] - d2[0];
    return {
      topic: PV, rank: 10,
      text: `A cubic polynomial P has P(${s}) = ${num(ys[0])}, P(${s + 1}) = ${num(ys[1])}, P(${s + 2}) = ${num(ys[2])} and P(${s + 3}) = ${num(ys[3])}. What is P(${s + 4})?`,
      answer: fchoices(d, ans, [ys[3] + d1[2] + d2[1], 2 * ys[3] - ys[2], ans + d3, ans - d3, ys[3] + d1[2]]),
      check: () => said(interp([s, s + 1, s + 2, s + 3], ys, s + 4), ans),
      solution: `The third differences of a cubic are constant. The differences of the values are ${listing(d1.map(num))}, their differences are ${listing(d2.map(num))}, and the third difference is ${num(d3)}. `
        + `Going on, the next second difference is ${num(d2[1])} + ${paren(d3)} = ${num(d2[1] + d3)}, the next difference is ${num(d1[2])} + ${paren(d2[1] + d3)} = ${num(d1[2] + d2[1] + d3)}, and P(${s + 4}) = ${num(ys[3])} + ${paren(d1[2] + d2[1] + d3)} = <b>${num(ans)}</b>.`,
    };
  },
  // values given at the roots of another polynomial
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['swap', 'inverse']);
    const co = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7];
    if (form === 'swap') {
      const [a, b, c, k, m] = pick(c2, 'swap', [co, co, co, [-3, -2, -1, 2, 3], [0, 1, 2]], (a, b, c) => c !== a * b && !(a === 3 && b === 5 && c === 7) && Math.abs(c - a * b) <= 40);
      const Qv = (x) => x ** 3 + a * x * x + b * x + c, base = c - a * b, K = k * base, ans = k * Qv(m) - m - a, cs = [c, b, a, 1];
      return {
        topic: PV, rank: 23,
        text: `Let r, s and t be the roots, real or not, of Q(x) = ${poly(cs)}. A cubic polynomial P satisfies P(r) = s + t, P(s) = t + r, P(t) = r + s and P(r + s + t) = ${num(K)}. What is P(${num(m)})?`,
        answer: fchoices(d, ans, [k * Qv(m), k * Qv(m) + m + a, k * Qv(m) - m + a, k * Qv(m) + m - a, -k * Qv(m) - m - a, Qv(m) - m - a]),
        check: () => {
          // the cubic through the four points, found directly from the numeric roots
          const rs = rootsOf(cs), S = csum(rs), ys = [csub(S, rs[0]), csub(S, rs[1]), csub(S, rs[2]), [K, 0]];
          return cnear(lagrangeC([...rs, S], ys, m), ans, 1e-5) ? true : `through the four points, P(${m}) is ${lagrangeC([...rs, S], ys, m)}`;
        },
        solution: `By Vieta r + s + t = ${num(-a)}, so s + t = ${num(-a)} − r, and P(r) = ${num(-a)} − r. The same goes for s and t. So P(x) + ${shift('x', a)} is 0 at r, s and t. It has degree 3, so it is a number k times Q(x), which gives P(x) = k·Q(x) − ${a < 0 ? `(${shift('x', a)})` : `x − ${a}`}. `
          + `Put in x = r + s + t = ${num(-a)}. The last part is then 0, so ${num(K)} = k·Q(${num(-a)}). Now Q(${num(-a)}) = ${paren(-a)}<sup>3</sup> + ${paren(a)}·${a * a} + ${paren(b)}·${paren(-a)} + ${paren(c)} = ${num(base)}, so k = ${num(k)}. `
          + `Then P(${m}) = ${paren(k)}·Q(${m}) − ${m} − ${paren(a)}, and Q(${m}) = ${num(Qv(m))}, so P(${m}) = <b>${num(ans)}</b>.`,
      };
    }
    const [a, b, c, m] = pick(c2, 'inverse', [co, co, [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7], [1, 2, 3, -1]], (a, b, c, m) => m * m + a * m + b !== 0);
    const cs = [c, b, a, 1], top = m * m + a * m + b, ans = cut(-top, c);
    return {
      topic: PV, rank: 22,
      text: `Let r, s and t be the three different roots, real or not, of ${poly(cs)} = 0. A polynomial P of degree at most 2 satisfies P(r) = ${over(1, 'r')}, P(s) = ${over(1, 's')} and P(t) = ${over(1, 't')}. What is P(${num(m)})?`,
      answer: fchoices(d, ans, [cut(top, c), cut(-(m * m * m + a * m * m + b * m + c), c), cut(1, m), cut(-top, m * c), cut(-(top + 1), c), cut(top, 1)]),
      check: () => {
        const rs = rootsOf(cs), ys = rs.map((r) => cdiv([1, 0], r));
        if (rs.some((r, i) => rs.some((w, j) => i < j && Math.hypot(...csub(r, w)) < 1e-6))) return 'two roots are the same';
        return cnear(lagrangeC(rs, ys, m), val(ans), 1e-6) ? true : `the values lead to ${lagrangeC(rs, ys, m)}`;
      },
      solution: `Clear the fraction: xP(x) − 1 has degree at most 3 and is 0 at r, s and t, so it is a number k times ${poly(cs)}. Putting in x = 0 gives −1 = k·${paren(c)}, so k = ${fr(cut(-1, c))}. `
        + `The constant terms now match, so what is left is xP(x) = k(${poly([0, b, a, 1])}). Dividing by x, P(x) = k(${poly([b, a, 1])}). `
        + `So P(${num(m)}) = ${pf(cut(-1, c))}·(${m * m} + ${paren(a * m)} + ${paren(b)}) = ${pf(cut(-1, c))}·${paren(top)} = <b>${fr(ans)}</b>.`,
    };
  },
  // integer coefficients: u − v divides P(u) − P(v), and more
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['least', 'pair']);
    if (form === 'least') {
      const [r, g1, g2, A, c] = pick(c2, 'least', [[1, 2, 3, 5, 7], [2, 3, 4, 6], [2, 3, 4, 6, 8], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13], [-4, -3, -2, -1, 1, 2, 3, 4, 5, 7]], (r, g1, g2, A, c) => {
        const g = gcd(g1 + g2, g2), M = (g1 + g2) * g2, base = A + c * (g1 + g2), tr = ((base % M) + M) % M || M, B = A + c * g1, L = (g1 + g2) * g2 / g;
        const naive = range(1, L).find((v) => (v - A) % (g1 + g2) === 0 && (v - B) % g2 === 0);
        return g > 1 && B > 0 && naive !== tr;
      });
      const s = r + g1, t = s + g2, B = A + c * g1, M = (t - r) * (t - s), base = A + c * (t - r), ans = ((base % M) + M) % M || M, g = gcd(t - r, t - s), L = M / g;
      const naive = range(1, L).find((v) => (v - A) % (t - r) === 0 && (v - B) % (t - s) === 0);
      return {
        topic: PV, rank: 21,
        text: `A polynomial P with integer coefficients has P(${r}) = ${A} and P(${s}) = ${B}. What is the smallest possible positive value of P(${t})?`,
        answer: fchoices(d, ans, [naive, ans + M, ans + L, M, base > 0 ? base + M : ans + 2 * M, A, B]),
        check: () => {
          // straight from the definition: the triples (P(r), P(s), P(t)) are the integer combinations of the powers of r, s, t
          const basis = latticeBasis(range(0, 5).map((j) => [r ** j, s ** j, t ** j]));
          const first = range(1, 2 * M).find((v) => inLattice(basis, [A, B, v]));
          if (first !== ans) return `the smallest value found is ${first}`;
          const m = (ans - base) / M, f = (x) => A + c * (x - r) + (x - r) * (x - s) * m;
          return f(r) === A && f(s) === B && f(t) === ans ? true : 'the polynomial does not fit';
        },
        solution: `Since x − ${r} has leading coefficient 1, dividing gives P(x) = ${A} + (x − ${r})R(x), where R has integer coefficients. Putting in x = ${s}: ${B} = ${A} + ${g1}·R(${s}), so R(${s}) = ${num(c)}. `
          + `In the same way, R(x) = ${num(c)} + (x − ${s})S(x), where S has integer coefficients. So P(x) = ${A} + ${paren(c)}(x − ${r}) + (x − ${r})(x − ${s})S(x). `
          + `At x = ${t} this is P(${t}) = ${A} + ${paren(c)}·${t - r} + ${t - r}·${t - s}·S(${t}) = ${num(base)} + ${M}·S(${t}). S can be any constant integer, so P(${t}) can be exactly the numbers ${num(base)} plus a multiple of ${M}. `
          + `(The two facts “${t - r} divides P(${t}) − ${A}” and “${t - s} divides P(${t}) − ${B}” alone only give multiples of ${L}, which would wrongly allow ${num(naive)}.) So the smallest positive value is <b>${num(ans)}</b>.`,
      };
    }
    const divisors = (N) => range(1, Math.abs(N)).filter((k) => N % k === 0).flatMap((k) => [k, -k]);
    const sols = (a, b, U, V) => divisors(U).map((e) => a + e).filter((n) => n !== b && V % (n - b) === 0).sort((x, y) => x - y);
    const works = (a, gap, U, V, h) => {
      const b = a + gap, list = sols(a, b, U, V), A = a + h + U, B = b + h + V;
      if (list.length !== 2 || A <= 0 || B <= 0) return false;
      const [n1, n2] = list, q1 = U / ((a - n1) * (a - n2)), q2 = V / ((b - n1) * (b - n2));
      return Number.isInteger(q1) && Number.isInteger(q2) && Number.isInteger((q2 - q1) / gap) && n1 * n2 !== n1 + n2;
    };
    const US = [-24, -20, -18, -15, -14, -12, -10, -8, -6, 6, 8, 10, 12, 14, 15, 18, 20, 24];
    const [a, gap, U, V, h] = pick(c2, 'pair', [[2, 3, 4, 5, 7, 10, 12], [3, 5, 6, 7, 8, 9, 11], US, US, [1, 2, 3, 5]], works);
    const b = a + gap, A = a + h + U, B = b + h + V, [n1, n2] = sols(a, b, U, V), ans = n1 * n2;
    const q1 = U / ((a - n1) * (a - n2)), q2 = V / ((b - n1) * (b - n2)), mid = (q2 - q1) / gap;
    return {
      topic: PV, rank: 23,
      text: `A polynomial P with integer coefficients has P(${a}) = ${A} and P(${b}) = ${B}. The equation P(n) = n + ${h} has exactly two different integer solutions. What is the product of those two solutions?`,
      answer: fchoices(d, ans, [n1 + n2, a * b, (n1 - a) * (n2 - a), (n1 - b) * (n2 - b), ans + a + b, ans - gap]),
      check: () => {
        // a polynomial that really does all this, and a search for every integer that could be a solution
        const cs = padd(padd(pmul(pmul([BigInt(-n1), 1n], [BigInt(-n2), 1n]), padd([BigInt(q1 - mid * a), BigInt(mid)], [0n])), [BigInt(h), 1n]), [0n]);
        if (pval(cs, a) !== BigInt(A) || pval(cs, b) !== BigInt(B)) return 'the polynomial does not fit';
        const found = range(-300, 300).filter((n) => n !== a && n !== b && (n + h - A) % (n - a) === 0 && (n + h - B) % (n - b) === 0);
        if (found.length !== 2 || found[0] !== n1 || found[1] !== n2) return `found ${found}`;
        return found.every((n) => pval(cs, n) === BigInt(n + h)) && found[0] * found[1] === ans ? true : 'the solutions do not work';
      },
      solution: `For a polynomial with integer coefficients, u − v divides P(u) − P(v) for all integers u and v. Suppose P(n) = n + ${h}. Then n − ${a} divides (n + ${h}) − ${A} = (n − ${a}) + ${paren(a + h - A)}, so n − ${a} divides ${num(U)}. In the same way, n − ${b} divides ${num(V)}. `
        + `The two divisors differ by exactly ${gap}, since (n − ${a}) − (n − ${b}) = ${gap}. Going through the divisors of ${U === V ? num(U) : `${num(U)} and of ${num(V)}`}, the only pairs that differ by ${gap} are ${num(n1 - a)} and ${num(n1 - b)}, and ${num(n2 - a)} and ${num(n2 - b)}, which give n = ${num(n1)} and n = ${num(n2)}. `
        + `There are exactly two solutions, so these are they, and their product is <b>${num(ans)}</b>.`,
    };
  },
];

// ======================================================================================================================
// Transforming the roots: sums over moved roots, a polynomial for new roots, and substitutions that halve the degree
// ======================================================================================================================
const TR = 'Transforming the roots';
const realOf = (rs, tol = 1e-6) => rs.filter((z) => Math.abs(z[1]) < tol).map((z) => z[0]);
const transforming = [
  // sums over the roots of 1/(k − r) and what reduces to it: (k + r)/(k − r) and r²/(r − k)
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['sum', 'mobius', 'division']);
    const co = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];
    const [a, b, c, k] = pick(c2, `moved-${form}`, [co, co, co, [1, 2, 3, 4]], (a, b, c, k) => {
      const Pk = k ** 3 + a * k * k + b * k + c, D = 3 * k * k + 2 * a * k + b;
      return Pk !== 0 && D !== 0 && Math.abs(Pk) <= 60 && gcd(D, Pk) < Math.abs(Pk);
    });
    const cs = [c, b, a, 1], Pk = k ** 3 + a * k * k + b * k + c, D = 3 * k * k + 2 * a * k + b, S1 = cut(D, Pk);
    const add = (x, y) => cut(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
    const ans = { sum: S1, mobius: add([-3, 1], cut(2 * k * D, Pk)), division: add([-a + 3 * k, 1], cut(-k * k * D, Pk)) }[form];
    const wrong = {
      sum: [cut(-D, Pk), cut(Pk, D), cut(3 * k * k - 2 * a * k + b, Pk), cut(3 * k * k + a * k + b, Pk), cut(3, Pk), cut(D, 1)],
      mobius: [add([3, 1], cut(2 * k * D, Pk)), add([-3, 1], cut(D, Pk)), cut(2 * k * D, Pk), add([-3, 1], cut(-2 * k * D, Pk)), add([-1, 1], cut(2 * k * D, Pk))],
      division: [[-a + 3 * k, 1], add([-a + 3 * k, 1], cut(k * k * D, Pk)), cut(-k * k * D, Pk), add([a + 3 * k, 1], cut(-k * k * D, Pk)), add([-a + k, 1], cut(-k * k * D, Pk))],
    }[form];
    const term = (L) => ({ sum: over(1, `${k} − ${L}`), mobius: over(`${k} + ${L}`, `${k} − ${L}`), division: over(`${L}<sup>2</sup>`, shift(L, -k)) }[form]);
    const base = `Let P(x) = ${poly(cs)} = (x − r)(x − s)(x − t). `;
    const core = `Over a common denominator, ${over(1, `${num(k)} − r`)} + ${over(1, `${num(k)} − s`)} + ${over(1, `${num(k)} − t`)} has denominator (${num(k)} − r)(${num(k)} − s)(${num(k)} − t) = P(${num(k)}) = ${num(Pk)}. `
      + `Its numerator is the sum of the products of the numbers ${num(k)} − r, ${num(k)} − s and ${num(k)} − t in pairs, which is 3·${paren(k)}<sup>2</sup> − 2·${paren(k)}(r + s + t) + (rs + st + tr) = ${3 * k * k} − 2·${paren(k)}·${paren(-a)} + ${paren(b)} = ${num(D)}. `
      + `So that sum is ${pf(S1)}. `;
    return {
      topic: TR, rank: { sum: 16, mobius: 20, division: 21 }[form],
      text: `Let r, s and t be the roots, real or not, of ${poly(cs)} = 0. What is ${term('r')} + ${term('s')} + ${term('t')}?`,
      answer: fchoices(d, ans, wrong),
      check: () => {
        const rs = rootsOf(cs), v = csum(rs.map((r) => (form === 'sum' ? cdiv([1, 0], csub([k, 0], r)) : form === 'mobius' ? cdiv(cadd([k, 0], r), csub([k, 0], r)) : cdiv(cmul(r, r), csub(r, [k, 0])))));
        return cnear(v, val(ans)) ? true : `the roots give ${v}`;
      },
      solution: base + (form === 'sum' ? core.replace(`So that sum is ${pf(S1)}. `, `So the sum is <b>${fr(ans)}</b>.`)
        : form === 'mobius'
          ? `First make each term simpler: ${over(`${k} + r`, `${k} − r`)} = −1 + ${over(2 * k, `${k} − r`)}, as adding the fractions back together shows. So the sum is −3 + ${2 * k}·(${over(1, `${k} − r`)} + ${over(1, `${k} − s`)} + ${over(1, `${k} − t`)}). ${core}`
            + `The answer is −3 + ${2 * k}·${pf(S1)} = <b>${fr(ans)}</b>.`
          : `First divide: r<sup>2</sup> = (r − ${paren(k)})(r + ${paren(k)}) + ${k * k}, so ${over('r<sup>2</sup>', shift('r', -k))} = r + ${paren(k)} + ${over(k * k, shift('r', -k))}. Adding over the three roots, the sum is (r + s + t) + 3·${paren(k)} − ${k * k}·(${over(1, `${num(k)} − r`)} + ${over(1, `${num(k)} − s`)} + ${over(1, `${num(k)} − t`)}). ${core}`
            + `The answer is ${paren(-a)} + ${paren(3 * k)} − ${k * k}·${pf(S1)} = <b>${fr(ans)}</b>.`),
    };
  },
  // a new polynomial whose roots are built from the old ones: its value at a point comes from the old polynomial
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['squares', 'sumsq', 'sumofsq', 'prods']);
    const co = [-4, -3, -2, -1, 1, 2, 3, 4], small = [-2, -1, 1, 2, 3];
    const lists = { prods: [co, co, co, [1, 2, -1, 3]], squares: [co, co, co, [1, 2, 3]], sumsq: [small, small, [-3, -2, -1, 1, 2, 3], [1, 2, 3]], sumofsq: [small, small, [-3, -2, -1, 1, 2, 3], [1, 2, 3]] }[form];
    const [a, b, c, k] = pick(c2, `newroots-${form}`, lists, (a, b) => a !== b);
    const cs = [c, b, a, 1], P = (x) => x ** 3 + a * x * x + b * x + c, S = -a, T2 = a * a - 2 * b;
    const at = form === 'prods' ? k : form === 'sumofsq' ? T2 + k * k : k * k, roots = { sumofsq: 'r<sup>2</sup> + s<sup>2</sup>, s<sup>2</sup> + t<sup>2</sup> and t<sup>2</sup> + r<sup>2</sup>', prods: 'rs, st and tr', squares: 'r<sup>2</sup>, s<sup>2</sup> and t<sup>2</sup>', sumsq: '(r + s)<sup>2</sup>, (s + t)<sup>2</sup> and (t + r)<sup>2</sup>' }[form];
    const reP = c - a * k * k, imP = b * k - k ** 3, ans = { prods: k ** 3 - b * k * k + a * c * k - c * c, squares: -P(k) * P(-k), sumsq: -P(S + k) * P(S - k), sumofsq: reP * reP + imP * imP }[form];
    const wrong = {
      prods: [k ** 3 + b * k * k + a * c * k + c * c, k ** 3 - b * k * k - a * c * k - c * c, k ** 3 - a * k * k + b * k - c, k ** 3 - b * k * k + a * c * k + c * c, P(k), ans + 2 * b],
      squares: [P(k) * P(-k), P(k) ** 2, P(k * k), P(k) * P(k), P(k) + P(-k), ans + 2 * k],
      sumsq: [P(S + k) * P(S - k), -P(k) * P(-k), P(S + k) ** 2, P(S - k) ** 2, -P(S + k) - P(S - k), ans + 2 * k],
      sumofsq: [reP * reP - imP * imP, -P(k) * P(-k), P(k) * P(-k), reP * reP, imP * imP, ans + 2 * k],
    }[form];
    return {
      topic: TR, rank: { prods: 18, squares: 20, sumsq: 23, sumofsq: 24 }[form],
      text: `Let r, s and t be the roots, real or not, of P(x) = ${poly(cs)}. Let Q(x) = x<sup>3</sup> + ux<sup>2</sup> + vx + w be the polynomial whose roots are ${roots}. What is Q(${num(at)})?`,
      answer: fchoices(d, ans, wrong),
      check: () => {
        const [r, s, t] = rootsOf(cs), ys = { prods: [cmul(r, s), cmul(s, t), cmul(t, r)], squares: [cmul(r, r), cmul(s, s), cmul(t, t)], sumsq: [cpow(cadd(r, s), 2), cpow(cadd(s, t), 2), cpow(cadd(t, r), 2)], sumofsq: [cadd(cmul(r, r), cmul(s, s)), cadd(cmul(s, s), cmul(t, t)), cadd(cmul(t, t), cmul(r, r))] }[form];
        const v = cprod(ys.map((y) => csub([at, 0], y)));
        return cnear(v, ans, 1e-5) ? true : `the roots give ${v}`;
      },
      solution: {
        prods: `Vieta’s formulas for P give r + s + t = ${num(-a)}, rs + st + tr = ${num(b)} and rst = ${num(-c)}. For Q, the roots add up to rs + st + tr = ${num(b)}. Their products in pairs are rs·st + st·tr + tr·rs = rst(r + s + t) = ${paren(-c)}·${paren(-a)} = ${num(a * c)}. Their product is (rst)<sup>2</sup> = ${c * c}. `
          + `So Q(x) = ${poly([-c * c, a * c, -b, 1])}, and Q(${num(k)}) = <b>${num(ans)}</b>.`,
        squares: `Since Q(x) = (x − r<sup>2</sup>)(x − s<sup>2</sup>)(x − t<sup>2</sup>), Q(${at}) = (${k}<sup>2</sup> − r<sup>2</sup>)(${k}<sup>2</sup> − s<sup>2</sup>)(${k}<sup>2</sup> − t<sup>2</sup>). Each bracket is a difference of squares, so this is (${k} − r)(${k} − s)(${k} − t) times (${k} + r)(${k} + s)(${k} + t). `
          + `The first product is P(${k}) = ${num(P(k))}. For the second, P(−${k}) = (−${k} − r)(−${k} − s)(−${k} − t) = −(${k} + r)(${k} + s)(${k} + t), so it is −P(−${k}) = ${num(-P(-k))}. `
          + `So Q(${at}) = ${paren(P(k))}·${paren(-P(-k))} = <b>${num(ans)}</b>.`,
        sumsq: `By Vieta r + s + t = ${num(S)}, so r + s = ${num(S)} − t, and the other two work the same way. So Q(${at}) is the product over the three roots t of ${k}<sup>2</sup> − (${num(S)} − t)<sup>2</sup>, which is a difference of squares: (${shift('t', k - S)})(${num(S + k)} − t). `
          + `The brackets ${num(S + k)} − t multiply to (${num(S + k)} − r)(${num(S + k)} − s)(${num(S + k)} − t) = P(${num(S + k)}) = ${num(P(S + k))}. The brackets ${shift('t', k - S)} are the negatives of ${num(S - k)} − t, so with three of them they multiply to −P(${num(S - k)}) = ${num(-P(S - k))}. `
          + `So Q(${at}) = ${paren(P(S + k))}·${paren(-P(S - k))} = <b>${num(ans)}</b>.`,
        sumofsq: `By Vieta, r<sup>2</sup> + s<sup>2</sup> + t<sup>2</sup> = ${paren(S)}<sup>2</sup> − 2·${paren(b)} = ${num(T2)}, so r<sup>2</sup> + s<sup>2</sup> = ${num(T2)} − t<sup>2</sup>, and the other two work the same way. So Q(${num(at)}) is the product over the three roots t of ${num(at)} − (${num(T2)} − t<sup>2</sup>) = t<sup>2</sup> + ${k * k}. `
          + `Over the complex numbers, t<sup>2</sup> + ${k * k} = (${k === 1 ? '' : k}i − t)(−${k === 1 ? '' : k}i − t), so this product is exactly P(${k === 1 ? '' : k}i)·P(−${k === 1 ? '' : k}i). `
          + `Using i<sup>2</sup> = −1: P(${k === 1 ? '' : k}i) = ${cx(reP, imP)}, and P(−${k === 1 ? '' : k}i) is its conjugate. A complex number times its conjugate is the sum of the squares of its parts, so Q(${num(at)}) = ${paren(reP)}<sup>2</sup> + ${paren(imP)}<sup>2</sup> = <b>${num(ans)}</b>.`,
      }[form],
    };
  },
  // x⁴ + ax³ + bx² + akx + k²: with y = x + k/x it becomes a quadratic in y, and only some values of y give real x
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['count', 'sum', 'squares']);
    const YS = range(-7, 8);
    const [y1, y2, k] = pick(c2, `palin-${form}`, [YS, YS, form === 'count' ? [1] : form === 'sum' ? [1, 2] : [2, 3, 4]], (y1, y2, k) => {
      if (y1 >= y2) return false;
      const good = (y) => y * y >= 4 * k, edge = (y) => y * y === 4 * k;
      if (form === 'count') return y1 + y2 !== 0 && (edge(y1) || edge(y2) || good(y1) !== good(y2) || y1 * y2 > 0);
      return !edge(y1) && !edge(y2) && good(y1) !== good(y2) && y1 + y2 !== 0 && y1 * y2 !== 0 && (good(y1) ? y1 : y2) !== -(y1 + y2);
    });
    const a = -(y1 + y2), bb = y1 * y2 + 2 * k, cs = [k * k, a * k, bb, a, 1], ys = [y1, y2];
    const kinds = ys.map((y) => (y * y > 4 * k ? 2 : y * y === 4 * k ? 1 : 0)), count = sum(kinds), good = ys.filter((y) => y * y >= 4 * k), bad = ys.filter((y) => y * y < 4 * k);
    const ans = { count, sum: sum(good), squares: sum(good.map((y) => y * y - 2 * k)) }[form];
    const wrong = {
      sum: [-a, -(y1 + y2) - good[0], 2 * good[0], good[0] + 2 * k, -good[0], good[0] * good[0] - 2 * k],
      squares: [a * a - 2 * bb, good[0] * good[0], good[0] * good[0] - 2, good[0] * good[0] - 4 * k, a * a - 2 * k, a * a],
    }[form];
    const x2 = `x<sup>2</sup>`, kOver = over(k, 'x');
    const each = ys.map((y, i) => `y = ${num(y)} gives x<sup>2</sup>${signed(-y, 'x')} + ${k} = 0, whose discriminant ${kinds[i] === 1 ? 'is 0, so one real solution' : `${y * y} − ${4 * k} is ${kinds[i] === 2 ? 'positive, so two real solutions' : 'negative, so no real solutions'}`}`);
    return {
      topic: TR, rank: { count: 20, sum: 21, squares: 23 }[form],
      text: `${form === 'count' ? 'How many different real solutions does' : form === 'sum' ? 'What is the sum of the real solutions of' : 'What is the sum of the squares of the real solutions of'} ${poly(cs)} = 0${form === 'count' ? ' have' : ''}?`,
      answer: form === 'count' ? choices(d, count, [0, 1, 2, 3, 4]) : fchoices(d, ans, wrong),
      check: () => {
        if (form === 'count') return realRootCount(cs) === count ? true : `Sturm count ${realRootCount(cs)}`;
        const real = realOf(rootsOf(cs));
        return near(sum(real.map((x) => (form === 'sum' ? x : x * x))), ans, 'real solutions', 1e-6);
      },
      solution: `0 is not a solution, so divide by ${x2} and group the terms: (${x2} + ${over(k * k, x2)}) ${a < 0 ? '−' : '+'} ${Math.abs(a) === 1 ? '' : Math.abs(a)}(x + ${kOver})${signed(bb)} = 0. Let y = x + ${kOver}. Then y<sup>2</sup> = ${x2} + ${2 * k} + ${over(k * k, x2)}, so the equation becomes y<sup>2</sup>${signed(a, 'y')}${signed(bb - 2 * k)} = 0, which has roots y = ${num(y1)} and y = ${num(y2)}. `
        + `Going back to x: ${each[0]}, and ${each[1]}. `
        + ({
          count: `So there are <b>${count}</b> different real solutions.`,
          sum: `The two real solutions come from x<sup>2</sup> − yx + ${k} = 0 with y = ${num(good[0])}, and by Vieta they add up to y. So the sum is <b>${num(ans)}</b>. (Vieta on the whole quartic would give ${num(-a)}, but that includes the non-real solutions.)`,
          squares: `The two real solutions have sum ${num(good[0])} and product ${k}, so the sum of their squares is ${paren(good[0])}<sup>2</sup> − 2·${k} = <b>${num(ans)}</b>. (Vieta on the whole quartic would give ${num(a * a - 2 * bb)}, but that includes the non-real solutions.)`,
        }[form]),
    };
  },
  // a substitution that hides a quadratic: the middle of (x − p)⁴ + (x − q)⁴, pairing the brackets, or a square root
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['center', 'pairing', 'radical']);
    if (form === 'center') {
      const [m, h, y0, ask] = pick(c2, 'center', [[1, 2, 3, 4, 5, 6, -1, -2, -3], [1, 2, 3], [1, 2, 3, 4, 5, 6], ['real', 'other']], (m, h, y0) => y0 !== h && y0 !== m && y0 !== -m && m !== h && m !== -h);
      const p = m - h, q = m + h, K = (y0 + h) ** 4 + (y0 - h) ** 4, u2 = 6 * h * h + y0 * y0, ans = ask === 'real' ? m * m - y0 * y0 : m * m + u2;
      const wrong = ask === 'real' ? [m * m + y0 * y0, y0 * y0 - m * m, p * q, m * m - h * h, ans + 2 * h, -m * m] : [m * m - u2, u2, m * m + y0 * y0, p * q + u2, m * m + 6 * h * h, ans + 2 * h];
      const cs = padd(compose(B([0, 0, 0, 0, 1]), B([-p, 1])), padd(compose(B([0, 0, 0, 0, 1]), B([-q, 1])), [BigInt(-K)])).map(Number);
      return {
        topic: TR, rank: ask === 'real' ? 17 : 20,
        text: `The equation (${shift('x', -p)})<sup>4</sup> + (${shift('x', -q)})<sup>4</sup> = ${num(K)} has two real solutions and two non-real solutions. What is the product of the ${ask === 'real' ? 'two real' : 'two non-real'} solutions?`,
        answer: fchoices(d, ans, wrong),
        check: () => {
          const rs = rootsOf(cs), real = realOf(rs), non = rs.filter((z) => Math.abs(z[1]) > 1e-6);
          if (real.length !== 2 || non.length !== 2) return 'the solutions are not two real and two non-real';
          return ask === 'real' ? near(real[0] * real[1], ans) : (cnear(cmul(non[0], non[1]), ans) ? true : 'the non-real product differs');
        },
        solution: `The two brackets are centered at ${num(m)}, halfway between ${num(p)} and ${num(q)}. So let y = ${shift('x', -m)}. The equation becomes (y + ${h})<sup>4</sup> + (y − ${h})<sup>4</sup> = ${num(K)}, and the odd powers of y cancel: 2y<sup>4</sup> + ${12 * h * h}y<sup>2</sup> + ${2 * h ** 4} = ${num(K)}. `
          + `Dividing by 2 gives a quadratic in y<sup>2</sup>: (y<sup>2</sup>)<sup>2</sup> + ${6 * h * h}(y<sup>2</sup>)${signed(h ** 4 - K / 2)} = 0, which factors as (y<sup>2</sup> − ${y0 * y0})(y<sup>2</sup> + ${u2}) = 0. `
          + (ask === 'real'
            ? `The real solutions have y = ±${y0}, so x = ${num(m)} + ${y0} = ${num(m + y0)} and x = ${num(m)} − ${y0} = ${num(m - y0)}, and their product is <b>${num(ans)}</b>.`
            : `The non-real solutions have y<sup>2</sup> = −${u2}, so x = ${num(m)} ± i√${u2}. Their product is ${paren(m)}<sup>2</sup> + ${u2} = <b>${num(ans)}</b>.`),
      };
    }
    if (form === 'pairing') {
      const SETS = [[1, 2, 3, 4], [1, 2, 5, 6], [1, 3, 4, 6], [2, 3, 5, 6], [1, 2, 7, 8], [1, 4, 5, 8], [2, 3, 4, 5], [1, 3, 6, 8], [-1, 1, 2, 4], [-2, 1, 3, 6], [-1, 2, 3, 6], [-3, 1, 2, 6]];
      const parts = ([a, b, c, e], t1) => { const s = a + e, t2 = -(a * e + b * c) - t1; return { s, t1, t2, D1: s * s + 4 * t1, D2: s * s + 4 * t2, K: (t1 + a * e) * (t1 + b * c) }; };
      const [set, t1, ask] = pick(c2, 'pairing', [SETS, range(-30, 30), ['count', 'sum', 'prod']], (set, t1, ask) => {
        const P = parts(set, t1);
        return t1 >= P.t2 && P.D1 > 0 && P.D2 !== 0 && P.K > 0 && P.s !== 0 && Math.abs(P.K) <= 2000 && (ask !== 'prod' || t1 !== 0) && (ask !== 'count' || P.D2 > 0 || t1 % 2 === 0);
      });
      const [a, b, c, e] = set, { s, t2, D1, D2, K } = parts(set, t1), both = D2 > 0, ad = a * e, bc = b * c;
      const count = both ? 4 : 2, total = both ? -2 * s : -s, pr = both ? t1 * t2 : -t1, ans = { count, sum: total, prod: pr }[ask];
      const wrong = { count: [0, 1, 2, 3, 4], sum: [-2 * s, -s, s, 2 * s, -s - a], prod: [t1 * t2, -t1, -t2, ad * bc, ad * bc - K, t1 + t2] }[ask];
      const br = (v) => `(${shift('x', v)})`, what = { count: 'How many real solutions does', sum: 'What is the sum of the real solutions of', prod: 'What is the product of the real solutions of' }[ask];
      const cs = padd(fromRootsB(set.map((v) => -v)), [BigInt(-K)]).map(Number);
      return {
        topic: TR, rank: 19,
        text: `${what} ${set.map(br).join('')} = ${num(K)}${ask === 'count' ? ' have' : ''}?`,
        answer: ask === 'count' ? choices(d, count, wrong) : fchoices(d, ans, wrong),
        check: () => {
          if (ask === 'count') return realRootCount(cs) === count ? true : `Sturm count ${realRootCount(cs)}`;
          const real = realOf(rootsOf(cs));
          return near(ask === 'sum' ? sum(real) : prod(real), ans, 'real solutions', 1e-6);
        },
        solution: `Pair the outer and the inner brackets, because ${paren(a)} + ${paren(e)} = ${paren(b)} + ${paren(c)} = ${num(s)}: ${br(a)}${br(e)} = x<sup>2</sup>${signed(s, 'x')}${signed(ad)} and ${br(b)}${br(c)} = x<sup>2</sup>${signed(s, 'x')}${signed(bc)}. `
          + `With t = x<sup>2</sup>${signed(s, 'x')}, the equation is (t${signed(ad)})(t${signed(bc)}) = ${num(K)}, a quadratic in t with roots t = ${num(t1)} and t = ${num(t2)}. `
          + `Now x<sup>2</sup>${signed(s, 'x')} = t has discriminant ${s * s} + 4t, which is ${num(D1)} for t = ${num(t1)} (two real solutions) and ${num(D2)} for t = ${num(t2)} (${both ? 'two more real solutions' : 'no real solutions'}). `
          + ({
            count: `So there are <b>${count}</b> real solutions.`,
            sum: both ? `Each pair adds up to ${num(-s)} by Vieta, so the sum is <b>${num(ans)}</b>.` : `By Vieta that pair adds up to <b>${num(ans)}</b>.`,
            prod: both ? `The two pairs have products ${num(-t1)} and ${num(-t2)} by Vieta, so the product is <b>${num(ans)}</b>.` : `By Vieta that pair has product −t = <b>${num(ans)}</b>.`,
          }[ask]),
      };
    }
    const [y1, y2, p, q2, ask] = pick(c2, 'radical', [[3, 4, 5, 6, 7, 8], [-1, -2, -3], [4, 6, 8, 10, 12, 14, 16], [10, 15, 20, 25, 30, 40, 50], ['prod', 'squares']], (y1, y2, p, q2) => {
      const c = y1 + y2, e = -y1 * y2, q1 = q2 - e, D = p * p - 4 * (q2 - y1 * y1);
      return c > 0 && q1 > 0 && D > 0 && q2 - y1 * y1 !== 0 && !isSq(p * p - 4 * q2 + 4 * y2 * y2) && p !== 18;
    });
    const c = y1 + y2, e = -y1 * y2, q1 = q2 - e, pr = q2 - y1 * y1, ans = ask === 'prod' ? pr : p * p - 2 * pr;
    const other = q2 - y2 * y2, wrong = ask === 'prod' ? [other, pr * other, q2, q1, y1 * y1, -pr] : [p * p - 2 * other, p * p, p * p + 2 * pr, 2 * (p * p - pr - other), ans + 2];
    const inner = `x<sup>2</sup> + ${p}x`, c1 = c === 1 ? '' : `${c}`;
    return {
      topic: TR, rank: ask === 'prod' ? 18 : 19,
      text: `What is the ${ask === 'prod' ? 'product of the real solutions' : 'sum of the squares of the real solutions'} of ${inner} + ${q1} = ${c1}√(${inner} + ${q2})?`,
      answer: fchoices(d, ans, wrong),
      check: () => {
        // find the solutions of the equation as written, by scanning for changes of sign and halving
        const g = (x) => { const w = x * x + p * x + q2; return w < 0 ? NaN : x * x + p * x + q1 - c * Math.sqrt(w); };
        const roots = [];
        for (let x = -80; x < 80; x += 0.01) {
          const f0 = g(x), f1 = g(x + 0.01);
          if (!Number.isFinite(f0) || !Number.isFinite(f1) || f0 * f1 > 0) continue;
          let lo = x, hi = x + 0.01;
          for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (g(lo) * g(mid) <= 0) hi = mid; else lo = mid; }
          const r = (lo + hi) / 2;
          if (!roots.some((v) => Math.abs(v - r) < 1e-6)) roots.push(r);
        }
        if (roots.length !== 2) return `found ${roots.length} solutions`;
        return near(ask === 'prod' ? roots[0] * roots[1] : roots[0] ** 2 + roots[1] ** 2, ans, 'solutions', 1e-6);
      },
      solution: `Let y = √(${inner} + ${q2}), so y ≥ 0 and ${inner} = y<sup>2</sup> − ${q2}. The equation becomes y<sup>2</sup> − ${q2} + ${q1} = ${c1}y, that is, y<sup>2</sup>${signed(-c, 'y')}${signed(q1 - q2)} = 0, which factors as (y − ${y1})(y + ${-y2}) = 0. `
        + `A square root can’t be negative, so y = ${y1} is the only possibility. Then ${inner} + ${q2} = ${y1 * y1}, so x<sup>2</sup> + ${p}x${signed(pr)} = 0, whose discriminant is positive. So there are two real solutions, with sum ${num(-p)} and product ${num(pr)} by Vieta. `
        + (ask === 'prod' ? `So the product is <b>${num(ans)}</b>.` : `The sum of their squares is ${paren(-p)}<sup>2</sup> − 2·${paren(pr)} = <b>${num(ans)}</b>.`),
    };
  },
];

// ======================================================================================================================
// Sequences that repeat: rules with a fraction that come back after 5 or 6 steps, tangents in disguise, recurrences
// with √2 or √3, sequences with a tail before the cycle, and cycles hidden in multiplication by 2
// ======================================================================================================================
const SQ = 'Sequences that repeat';
const an = sub('a', 'n'), an1 = sub('a', 'n+1'), anm = sub('a', 'n−1'), an2 = sub('a', 'n+2'), A1 = sub('a', 1), A2 = sub('a', 2);
// exact numbers p + q√d, with p and q exact fractions
const surds = (d) => {
  const D = Q(d), mk = (p, q = 0) => [toQ(p), toQ(q)];
  const add = (x, y) => [qadd(x[0], y[0]), qadd(x[1], y[1])], neg = (x) => [qmul(Q(-1), x[0]), qmul(Q(-1), x[1])];
  const mul = (x, y) => [qadd(qmul(x[0], y[0]), qmul(D, qmul(x[1], y[1]))), qadd(qmul(x[0], y[1]), qmul(x[1], y[0]))];
  const inv = (x) => { const n = qsub(qmul(x[0], x[0]), qmul(D, qmul(x[1], x[1]))); return [qdiv(x[0], n), qdiv(qmul(Q(-1), x[1]), n)]; };
  const div = (x, y) => mul(x, inv(y)), value = (x) => qf(x[0]) + qf(x[1]) * Math.sqrt(d), eq = (x, y) => qeq(x[0], y[0]) && qeq(x[1], y[1]);
  const read = (x) => {
    const L = (x[0][1] * x[1][1]) / big(x[0][1], x[1][1]), P = Number((x[0][0] * L) / x[0][1]), R = Number((x[1][0] * L) / x[1][1]), top = expr([P, ''], [R, `√${d}`]);
    return L === 1n ? top : over(top, bnum(L));
  };
  return { mk, add, neg, mul, inv, div, value, eq, read, label: (x) => [value(x), read(x)] };
};
// the first terms of a rule until a value comes back: the tail before the cycle, the length of the cycle, and term N
function rho(f, a1) {
  const terms = [a1], at = new Map([[a1, 0]]);
  for (;;) {
    const v = f(terms.at(-1));
    if (at.has(v)) { const tail = at.get(v), cyc = terms.length - tail; return { terms, tail, cyc, term: (N) => (N <= terms.length ? terms[N - 1] : terms[tail + ((N - 1 - tail) % cyc)]) }; }
    at.set(v, terms.length);
    terms.push(v);
  }
}
const digitSquares = (n) => String(n).split('').reduce((s, c) => s + (+c) ** 2, 0);
const FARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 1000, 1001, 1002, 1003, 1004, 1005, 500, 501, 502, 503, 504, 505];

const repeating = [
  // a rule with a fraction: a(n+1) = a(n)/a(n−1) comes back after 6 steps, and a(n+1) = (a(n) + 1)/a(n−1) after only 5
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['ratio', 'lyness', 'back']);
    if (form === 'ratio') {
      const [x, y, N] = pick(c2, 'ratio', [[2, 3, 4, 5, 6, 7], [2, 3, 5, 7, 8, 9], FARS], (x, y, N) => x !== y && N % 6 !== 0 && gcd(x, y) === 1);
      const parts = [[1, 1], [x, 1], [x * y, 1], [y * y, 1], [y * y, x], [y, x]], ans = parts[N % 6];
      return {
        topic: SQ, rank: 14,
        text: `A sequence has ${A1} = ${x}, ${A2} = ${y} and ${an1} = ${over(an, anm)} for every n ≥ 2. What is the product of the first ${num(N)} terms?`,
        answer: fchoices(d, ans, [parts[(N + 1) % 6], parts[(N + 5) % 6], parts[(N + 2) % 6], [1, 1], parts[(N + 3) % 6]]),
        check: () => { let u = Q(x), v = Q(y), pr = qmul(u, v); for (let n = 3; n <= N; n++) { [u, v] = [v, qdiv(v, u)]; pr = qmul(pr, v); } return said(pr, ans); },
        solution: `Write out the terms: ${x}, ${y}, then ${over(y, x)}, ${over(1, x)}, ${over(1, y)}, ${over(x, y)}, and then ${x}, ${y} again. So the sequence repeats every 6 terms, and the six terms in a cycle multiply to 1. `
          + `Since ${num(N)} = 6·${Math.floor(N / 6)} + ${N % 6}, only the first ${N % 6} term${N % 6 === 1 ? '' : 's'} of a cycle count${N % 6 === 1 ? 's' : ''}. Their product is <b>${fr(ans)}</b>.`,
      };
    }
    const Y = [[1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [1, 2], [3, 2], [2, 3], [5, 2], [1, 3]];
    if (form === 'lyness') {
      const [x, y, N, ask] = pick(c2, 'lyness', [[1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6, 7], FARS, ['term', 'sum']], (x, y, N, ask) => x !== y && N % 5 !== 1 && N % 5 !== 2 && (ask === 'term' || N % 5 !== 0));
      const cyc = [Q(x), Q(y), Q(y + 1, x), Q(x + y + 1, x * y), Q(x + 1, y)], R = N % 5, full = cyc.reduce(qadd, Q(0));
      const partial = (r) => cyc.slice(0, r).reduce(qadd, Q(0)), total = (M) => qadd(qmul(Q(Math.floor(M / 5)), full), partial(M % 5));
      const term = (M) => cyc[(M + 4) % 5], ans = ask === 'term' ? term(N) : total(N);
      const wrong = ask === 'term' ? [term(N + 1), term(N + 4), term(N + 2), term(N + 3), Q(x), Q(y)] : [total(N + 1), total(N - 1), qmul(Q(Math.floor(N / 5)), full), qmul(Q(Math.floor(N / 6)), full), qadd(total(N), Q(1))];
      return {
        topic: SQ, rank: ask === 'term' ? 17 : 18,
        text: `A sequence has ${A1} = ${x}, ${A2} = ${y} and ${an1} = ${over(`${an} + 1`, anm)} for every n ≥ 2. What is ${ask === 'term' ? `${sub('a', num(N))}` : `the sum of the first ${num(N)} terms`}?`,
        answer: fchoices(d, qn(ans), wrong.map(qn)),
        check: () => { let u = Q(x), v = Q(y), s = qadd(u, v); for (let n = 3; n <= N; n++) { [u, v] = [v, qdiv(qadd(v, Q(1)), u)]; s = qadd(s, v); } return said(ask === 'term' ? v : s, qn(ans)); },
        solution: `Work out the terms: ${A1} = ${x}, ${A2} = ${y}, ${sub('a', 3)} = ${qshow(cyc[2])}, ${sub('a', 4)} = ${qshow(cyc[3])}, ${sub('a', 5)} = ${qshow(cyc[4])}. Then ${sub('a', 6)} = (${qshow(cyc[4])} + 1) ÷ ${qshow(cyc[3])} = ${x} and ${sub('a', 7)} = (${x} + 1) ÷ ${qshow(cyc[4])} = ${y}. So the sequence repeats every 5 terms. `
          + (ask === 'term' ? `Since ${num(N)} leaves remainder ${R} when divided by 5, ${sub('a', num(N))} = ${sub('a', R === 0 ? 5 : R)} = <b>${qshow(ans)}</b>.`
            : `One cycle adds up to ${qshow(full)}. Since ${num(N)} = 5·${Math.floor(N / 5)} + ${R}, the sum is ${Math.floor(N / 5)}·${qshow(full)} + ${qshow(partial(R))} = <b>${qshow(ans)}</b>.`),
      };
    }
    const [x, yv, N] = pick(c2, 'back', [[2, 3, 4, 5, 6], Y, FARS], (x, yv, N) => [3, 4, 0].includes(N % 5) && !(x === yv[0] && yv[1] === 1));
    const y = Q(yv[0], yv[1]), one = Q(1), R = N % 5, a3 = qdiv(qadd(y, one), Q(x)), a4 = qdiv(qadd(qadd(Q(x), y), one), qmul(Q(x), y)), a5 = qdiv(Q(x + 1), y);
    const v = { 3: a3, 4: a4, 0: a5 }[R], ans = qn(y);
    const asIf3 = qsub(qmul(Q(x), v), one), asIf0 = qdiv(Q(x + 1), v), asIf4 = qdiv(Q(x + 1), qsub(qmul(Q(x), v), one));
    const formula = { 3: `(${A2} + 1)/${x}`, 4: `(${x} + ${A2} + 1)/(${x}${A2})`, 0: `${x + 1}/${A2}` }[R];
    const solve = {
      3: `So ${A2} + 1 = ${x}·${qparen(v)}, and ${A2} = <b>${fr(ans)}</b>.`,
      4: `Multiply out: ${x + 1} + ${A2} = ${x}·${qparen(v)}·${A2}, so ${x + 1} = ${A2}·(${qshow(qmul(Q(x), v))} − 1), and ${A2} = <b>${fr(ans)}</b>.`,
      0: `So ${A2} = ${x + 1} ÷ ${qparen(v)} = <b>${fr(ans)}</b>.`,
    }[R];
    return {
      topic: SQ, rank: 20,
      text: `A sequence of positive numbers has ${an1} = ${over(`${an} + 1`, anm)} for every n ≥ 2. If ${A1} = ${x} and ${sub('a', num(N))} = ${qshow(v)}, what is ${A2}?`,
      answer: fchoices(d, ans, [asIf3, asIf0, asIf4, v, qmul(Q(x), v), qadd(y, one)].map(qn).filter((w) => w[0] > 0)),
      check: () => {
        let u = Q(x), w = y;
        for (let n = 3; n <= N; n++) { [u, w] = [w, qdiv(qadd(w, one), u)]; if (qsign(w) <= 0) return 'a term is not positive'; }
        return qeq(w, v) ? true : `running the rule from ${A2} gives ${w}`;
      },
      solution: `Call ${A2} = y and run the rule: ${sub('a', 3)} = (y + 1)/${x}, ${sub('a', 4)} = (${x} + y + 1)/(${x}y), ${sub('a', 5)} = ${x + 1}/y, and then ${sub('a', 6)} = ${x} and ${sub('a', 7)} = y again. So the sequence repeats every 5 terms, whatever y is. `
        + `Since ${num(N)} leaves remainder ${R} when divided by 5, ${sub('a', num(N))} = ${sub('a', R === 0 ? 5 : R)} = ${formula.replaceAll(A2, 'y')}. `
        + solve.replaceAll(A2, 'y').replace(/y = <b>/, `${A2} = <b>`),
    };
  },
  // a tangent in disguise: the rule adds a fixed angle, so the sequence repeats, and half a turn gives −1/a
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['t60', 't30', 't225']);
    const spec = {
      t60: { dd: 3, P: 3, deg: 60, name: 'tan 60° = √3', rs: [2, 0], rule: over(`${an} + √3`, `1 − √3·${an}`), M: [[1, 0], [0, 1], [0, -1], [1, 0]], rank: 21 },
      t30: { dd: 3, P: 6, deg: 30, name: 'tan 30° = 1/√3', rs: [2, 4, 5], rule: over(`√3·${an} + 1`, `√3 − ${an}`), M: [[0, 1], [1, 0], [-1, 0], [0, 1]], rank: 22 },
      t225: { dd: 2, P: 8, deg: 22.5, name: 'tan 22.5° = √2 − 1', rs: [2, 5, 6], rule: over(`${an} + √2 − 1`, `1 − (√2 − 1)${an}`), M: [[1, 0], [-1, 1], [1, -1], [1, 0]], rank: 23 },
    }[form];
    const STARTS = [[2, 1], [3, 1], [4, 1], [5, 1], [1, 2], [1, 3], [2, 3], [3, 2], [3, 4], [1, 4], [5, 2], [6, 1]];
    const [m0, N] = pick(c2, `tan-${form}`, [STARTS, FARS], (m0, N) => spec.rs.includes(N % spec.P));
    const S = surds(spec.dd), [e, f, g, h] = spec.M.map(([p, q]) => S.mk(p, q));
    const step = (x) => S.div(S.add(S.mul(e, x), f), S.add(S.mul(g, x), h)), back = (x) => S.div(S.add(S.mul(h, x), S.neg(f)), S.add(S.neg(S.mul(g, x)), e));
    const a1 = S.mk(m0), a2 = step(a1), R = N % spec.P, half = spec.P / 2 + 1, minusInv = (x) => S.neg(S.inv(x));
    const ans = form === 't60' ? (R === 2 ? a2 : back(a1)) : R === 2 ? a2 : R === half ? minusInv(a1) : minusInv(a2);
    const m = fr(m0), mT = m0[1] === 1 ? `${m0[0]}` : `(${m0[0]}/${m0[1]})`;
    const inline = { t60: `(${mT} + √3)/(1 − √3·${mT})`, t30: `(√3·${mT} + 1)/(√3 − ${mT})`, t225: `(${mT} + √2 − 1)/(1 − (√2 − 1)·${mT})` }[form];
    const a2Text = `${A2} = ${inline}, which is ${S.read(a2)} after multiplying top and bottom by the conjugate of the bottom`;
    const steps = form === 't60' && R === 0
      ? `That is one step back from ${A1}, an angle of θ − 60°, so it is (${mT} − √3)/(1 + √3·${mT}). Multiply top and bottom by the conjugate of the bottom.`
      : R === 2 ? `Here ${a2Text}.`
        : R === half ? `Adding 90° turns tan θ into −1/tan θ, so ${sub('a', R)} = −1 ÷ ${mT}.`
          : `Adding 90° turns tan θ into −1/tan θ, so ${sub('a', R)} = −1/${A2}. Here ${a2Text}. Now divide −1 by that number.`;
    const which = form === 't60' && R === 0 ? sub('a', 3) : R === 0 ? sub('a', spec.P) : sub('a', R);
    const right = S.label(ans);
    const others = [S.label(a1), S.label(a2), S.label(step(a2)), S.label(S.neg(ans)), S.label(minusInv(a1)), S.label(minusInv(a2)), S.label(S.neg(a2)), S.label(S.inv(a2)), S.label(S.neg(a1)), S.label(S.inv(a1))];
    return {
      topic: SQ, rank: spec.rank,
      text: `A sequence has ${A1} = ${m} and ${an1} = ${spec.rule} for every n ≥ 1. What is ${sub('a', num(N))}?`,
      answer: tchoices(right, others),
      check: () => {
        // run the rule exactly, step by step, in numbers p + q√d
        let x = a1;
        for (let n = 2; n <= N; n++) x = step(x);
        return S.eq(x, ans) ? true : `the rule gives ${S.read(x)}`;
      },
      solution: `The rule is the tangent addition formula in disguise, with ${spec.name}: if ${an} = tan θ, then ${form === 't30' ? `dividing top and bottom by √3 shows that ` : ''}${an1} = tan(θ + ${spec.deg}°). So each step adds ${spec.deg}° to the angle. Tangent repeats every 180°, so the sequence repeats every ${spec.P} terms. `
        + `Since ${num(N)} leaves remainder ${R} when divided by ${spec.P}, ${sub('a', num(N))} = ${which}. `
        + steps
        + ` So the answer is <b>${S.read(ans)}</b>.`,
    };
  },
  // a recurrence with its own period: the constant shift, then √3 and √2, which turn a term into its negative
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['shift', 'sqrt3', 'sqrt2']);
    if (form === 'shift') {
      const [u, v, c, N] = pick(c2, 'shift', [range(1, 9), range(1, 12), [1, 2, 3, 4, 5, -1, -2], FARS], (u, v, c, N) => u !== v && N % 6 !== 0 && u !== c && v !== c);
      const x0 = u - c, y0 = v - c, b = [x0, y0, y0 - x0, -x0, -y0, x0 - y0];
      const partial = (r) => sum(b.slice(0, r)), ans = N * c + partial(N % 6);
      return {
        topic: SQ, rank: 16,
        text: `A sequence has ${A1} = ${u}, ${A2} = ${v} and ${an2} = ${an1} − ${an}${signed(c)} for every n ≥ 1. What is the sum of the first ${num(N)} terms?`,
        answer: fchoices(d, ans, [partial(N % 6), N * c, N * c + partial((N + 1) % 6), N * c + partial((N + 5) % 6), N * c + u + v, ans + 2 * c]),
        check: () => { let x = u, y = v, s = u + v; for (let n = 3; n <= N; n++) { [x, y] = [y, y - x + c]; s += y; } return s === ans ? true : `adding the terms gives ${s}`; },
        solution: `The ${num(c)} spoils a pattern, so remove it: let ${sub('b', 'n')} = ${shift(an, -c)}. Then ${sub('b', 'n+2')} = ${sub('b', 'n+1')} − ${sub('b', 'n')}, because ${num(c)} = ${num(c)} − ${paren(c)} + ${paren(c)}. A rule like that repeats every 6 terms: from ${sub('b', 1)} = ${num(b[0])} and ${sub('b', 2)} = ${num(b[1])} it goes ${listing(b.map(num))}, and any 6 terms in a row add up to 0. `
          + `Since ${num(N)} = 6·${Math.floor(N / 6)} + ${N % 6}, the first ${num(N)} values of ${sub('b', 'n')} add up to the sum of the first ${N % 6} of them, ${num(partial(N % 6))}. `
          + `Each ${an} is ${sub('b', 'n')}${signed(c)}, so the sum of the first ${num(N)} terms is ${num(N)}·${paren(c)} + ${paren(partial(N % 6))} = <b>${num(ans)}</b>.`,
      };
    }
    const dd = form === 'sqrt3' ? 3 : 2, half = form === 'sqrt3' ? 6 : 4, P = 2 * half, S = surds(dd), root = S.mk(0, 1);
    const [u, v, N] = pick(c2, form, [range(1, 7), range(1, 9), FARS], (u, v, N) => u !== v && N % P !== 1 && N % P !== 2 && N % half !== 0);
    const seq = [S.mk(u), S.mk(v)];
    for (let i = 2; i < P + 2; i++) seq.push(S.add(S.mul(root, seq[i - 1]), S.neg(seq[i - 2])));
    const term = (M) => seq[(M - 1) % P], R = N % P, sumTo = (r) => seq.slice(0, r).reduce(S.add, S.mk(0));
    const asked = form === 'sqrt3' ? term(N) : sumTo(R), right = S.label(asked);
    const list = range(3, half + 2).map((i) => `${sub('a', i)} = ${S.read(seq[i - 1])}`);
    const others = form === 'sqrt3' ? [S.label(term(N + 1)), S.label(term(N + P - 1)), S.label(S.neg(asked)), S.label(term(N + 2)), S.label(term(N + P - 2)), S.label(S.mk(u)), S.label(S.mk(v))]
      : [S.label(sumTo((R + 1) % P)), S.label(sumTo((R + P - 1) % P)), S.label(S.neg(asked)), S.label(sumTo((R + 2) % P)), S.label(sumTo((R + P - 2) % P)), S.label(term(N))];
    return {
      topic: SQ, rank: form === 'sqrt3' ? 20 : 21,
      text: `A sequence has ${A1} = ${u}, ${A2} = ${v} and ${an2} = √${dd}·${an1} − ${an} for every n ≥ 1. What is ${form === 'sqrt3' ? sub('a', num(N)) : `the sum of the first ${num(N)} terms`}?`,
      answer: tchoices(right, others),
      check: () => {
        let x = S.mk(u), y = S.mk(v), s = S.add(x, y);
        for (let n = 3; n <= N; n++) { [x, y] = [y, S.add(S.mul(root, y), S.neg(x))]; s = S.add(s, y); }
        return S.eq(form === 'sqrt3' ? y : s, asked) ? true : 'running the rule gives something else';
      },
      solution: `Work out the terms exactly, using √${dd}·√${dd} = ${dd}: ${listing(list)}. So ${sub('a', half + 1)} = −${A1} and ${sub('a', half + 2)} = −${A2}. Two neighboring terms decide everything after them, so from here on every term is the negative of the one ${half} places earlier, and the sequence repeats every ${P} terms. `
        + (form === 'sqrt3'
          ? `Since ${num(N)} leaves remainder ${R} when divided by ${P}, ${sub('a', num(N))} = ${sub('a', R)} = <b>${S.read(asked)}</b>.`
          : `A full cycle of ${P} terms adds up to 0, because each term cancels the one ${half} places later. Since ${num(N)} leaves remainder ${R} when divided by ${P}, the sum is the sum of the first ${R} terms, which is <b>${S.read(asked)}</b>.`),
    };
  },
  // a tail before the cycle: only where the cycle starts and how long it is matter
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['digits', 'squares']);
    if (form === 'digits') {
      const [a, N] = pick(c2, 'digits', [[123, 247, 318, 356, 402, 511, 628, 734, 851, 913, 268, 475, 589, 742, 946], FARS], (a) => rho(digitSquares, a).terms.at(-1) !== 1 && rho(digitSquares, a).tail >= 1);
      const R = rho(digitSquares, a), ans = R.term(N), cy = R.terms.slice(R.tail), pos = (N - 1 - R.tail) % R.cyc;
      return {
        topic: SQ, rank: 10,
        text: `A sequence starts with ${A1} = ${a}, and each later term is the sum of the squares of the digits of the term before it. What is ${sub('a', num(N))}?`,
        answer: fchoices(d, ans, [R.term(N + 1), R.term(N + R.cyc - 1), cy[(N - 1) % R.cyc], R.term(N + 2), R.term(N + R.cyc - 2), a]),
        check: () => { let x = a; for (let n = 2; n <= N; n++) x = digitSquares(x); return x === ans ? true : `stepping gives ${x}`; },
        solution: `Write out the terms: ${R.terms.join(', ')}, and then ${cy[0]} comes back. From ${sub('a', R.tail + 1)} = ${cy[0]} on, the sequence goes round a cycle of ${R.cyc} numbers: ${cy.join(', ')}. `
          + `The term ${sub('a', num(N))} is ${num(N - 1 - R.tail)} steps after ${sub('a', R.tail + 1)}, and ${num(N - 1 - R.tail)} leaves remainder ${pos} when divided by ${R.cyc}. So it is the number ${pos} place${pos === 1 ? '' : 's'} along the cycle from ${cy[0]}, which is <b>${num(ans)}</b>.`,
      };
    }
    const [m, c, a, N, ask] = pick(c2, 'squares', [[11, 13, 17, 19, 23, 25, 29, 31, 37], [1, 2, 3, 5, 6, 7], range(2, 10), FARS, ['term', 'sum']], (m, c, a) => { const R = rho((x) => (x * x + c) % m, a); return R.tail >= 2 && R.cyc >= 2 && R.cyc <= 8 && R.terms.length <= 12; });
    const R = rho((x) => (x * x + c) % m, a), cy = R.terms.slice(R.tail), cysum = sum(cy), tailSum = sum(R.terms.slice(0, R.tail)), rest = N - R.tail, full = Math.floor(rest / R.cyc), left = rest % R.cyc;
    const total = tailSum + full * cysum + sum(cy.slice(0, left)), ans = ask === 'term' ? R.term(N) : total;
    const wrong = ask === 'term' ? [R.term(N + 1), R.term(N + R.cyc - 1), cy[(N - 1) % R.cyc], R.term(N + 2), R.term(N + 3)] : [total + cy[left % R.cyc], total - tailSum, full * cysum, tailSum + (full + 1) * cysum, Math.floor(N / R.cyc) * cysum + sum(cy.slice(0, N % R.cyc))];
    return {
      topic: SQ, rank: ask === 'term' ? 13 : 15,
      text: `A sequence starts with ${A1} = ${a}, and ${an1} is the remainder when ${sup(an, 2)} + ${c} is divided by ${m}. What is ${ask === 'term' ? sub('a', num(N)) : `the sum of the first ${num(N)} terms`}?`,
      answer: fchoices(d, ans, wrong),
      check: () => { let x = a, s = a; for (let n = 2; n <= N; n++) { x = (x * x + c) % m; s += x; } return (ask === 'term' ? x : s) === ans ? true : `stepping gives ${ask === 'term' ? x : s}`; },
      solution: `Each term depends only on the one before, so the sequence goes round a cycle once a value comes back. Write out the terms: ${R.terms.join(', ')}, and then ${cy[0]} comes back. So the first ${R.tail} terms (${R.terms.slice(0, R.tail).join(', ')}) come once only, and after them the ${R.cyc} numbers ${cy.join(', ')} repeat. `
        + (ask === 'term'
          ? `After the first ${R.tail} terms there are ${num(rest)} more up to ${sub('a', num(N))}, and ${num(rest)} leaves remainder ${left} when divided by ${R.cyc}, so ${sub('a', num(N))} is number ${left === 0 ? R.cyc : left} in the cycle: <b>${num(ans)}</b>.`
          : `The first ${R.tail} terms add up to ${tailSum}, and each cycle adds up to ${cysum}. The other ${num(rest)} terms are ${full} full cycles and ${left} more term${left === 1 ? '' : 's'}${left ? ` (adding up to ${sum(cy.slice(0, left))})` : ''}. So the sum is ${tailSum} + ${full}·${cysum}${left ? ` + ${sum(cy.slice(0, left))}` : ''} = <b>${num(ans)}</b>.`),
    };
  },
  // multiplication by 2 in disguise: halving modulo m, and perfect shuffles
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['first', 'shuffle', 'back']);
    if (form !== 'shuffle') {
      const ask = form;
      const firstBack = (m, k) => mobiusSum(k, (j) => gcd(2 ** j - 1, m) - 1);
      const [m, k] = pick(c2, `halving-${form}`, [[63, 65, 85, 91, 93, 105, 117, 119, 133, 155, 165, 195, 217, 273], [4, 5, 6, 8, 9, 10, 12]], (m, k) => { const g = gcd(2 ** k - 1, m); if (g < 3 || g >= m) return false; return ask === 'back' || (firstBack(m, k).total > 0 && firstBack(m, k).total < g - 1); });
      const g = gcd(2 ** k - 1, m), { ps, total: firstCount } = firstBack(m, k), ans = ask === 'back' ? g - 1 : firstCount, step = m / g;
      const groups = ps.map((p) => `${gcd(2 ** (k / p) - 1, m) - 1} return after ${k / p} steps`), both = ps.length === 2 ? gcd(2 ** (k / (ps[0] * ps[1])) - 1, m) - 1 : 0;
      const stepRule = (a) => (a % 2 === 0 ? a / 2 : (a + m) / 2);
      return {
        topic: SQ, rank: ask === 'first' ? 24 : 23,
        text: `A sequence of whole numbers from 1 to ${m - 1} follows this rule: if ${an} is even, then ${an1} = ${over(an, 2)}, and if ${an} is odd, then ${an1} = ${over(`${an} + ${m}`, 2)}. For how many choices of ${A1} is ${sub('a', k + 1)} = ${A1}${ask === 'first' ? `, with none of the terms in between equal to ${A1}` : ''}?`,
        answer: fchoices(d, ans, [g, m - 1, m - g, step - 1, k, ans + 2, 2 ** k - 1, g - 1]),
        check: () => {
          let n = 0;
          for (let a = 1; a < m; a++) { let x = a, early = false; for (let i = 0; i < k; i++) { x = stepRule(x); if (x === a && i < k - 1) early = true; } if (x === a && !(ask === 'first' && early)) n++; }
          return n === ans ? true : `counted ${n}`;
        },
        solution: `Either way, 2${an1} is ${an} or ${an} + ${m}, so 2${an1} leaves the same remainder as ${an} when divided by ${m}. The rule is “divide by 2” in the remainders mod ${m}. After ${k} steps, ${sup(2, k)}·${sub('a', k + 1)} leaves the same remainder as ${A1}. `
          + `So ${sub('a', k + 1)} = ${A1} exactly when ${sup(2, k)}·${A1} − ${A1} = ${num(2 ** k - 1)}·${A1} is a multiple of ${m} (2 has an inverse mod ${m}, and all the terms are from 1 to ${m - 1}, so equal remainders mean equal terms). `
          + `The greatest common divisor of ${num(2 ** k - 1)} and ${m} is ${g}, so this happens exactly when ${A1} is a multiple of ${m} ÷ ${g} = ${step}. The multiples of ${step} from 1 to ${m - 1} are ${step}·1, …, ${step}·${g - 1}, so there are ${ask === 'back' ? `<b>${ans}</b> choices.` : `${g - 1} of them. `}`
          + (ask === 'back' ? '' : `Some of these return sooner. A term that returns after both j and ${k} steps also returns after their greatest common divisor, so any early return also happens after ${listing(ps.map((p) => `${k / p}`), 'or')} steps. By the same reasoning, ${listing(groups)}.${both ? ` The ${both} that return after ${k / (ps[0] * ps[1])} steps are in both groups, so add them back once.` : ''} So the count is ${g - 1} − ${ps.map((p) => gcd(2 ** (k / p) - 1, m) - 1).join(' − ')}${both ? ` + ${both}` : ''} = <b>${ans}</b>.`),
      };
    }
    const order = (m) => { let k = 1, v = 2 % m; while (v !== 1) { v = (2 * v) % m; k++; } return k; };
    const [cards, kind] = pick(c2, 'shuffle', [[10, 14, 16, 18, 20, 22, 26, 28, 34, 40, 42, 46, 50, 58, 64, 66], ['out', 'in']], (cards, kind) => { const m = kind === 'out' ? cards - 1 : cards + 1; return order(m) >= 4 && order(m) <= 20 && cards !== 52; });
    const m = kind === 'out' ? cards - 1 : cards + 1, ans = order(m), half = cards / 2, other = order(kind === 'out' ? cards + 1 : cards - 1);
    const pows = []; for (let i = 1, v = 2 % m; i <= ans; i++, v = (2 * v) % m) pows.push(v);
    return {
      topic: SQ, rank: 20,
      text: `A deck of ${cards} cards is cut into two halves of ${half} cards, and the halves are interleaved perfectly, one card at a time, so that the top card of the ${kind === 'out' ? 'top half stays on top of the deck' : 'bottom half becomes the top card of the deck'}. What is the smallest number of these shuffles, done over and over, that puts every card back where it started?`,
      answer: fchoices(d, ans, [other, m, cards, 2 * ans, m - 1, Math.ceil(Math.log2(cards)), half]),
      check: () => {
        const start = range(1, cards), once = (deck) => { const A = deck.slice(0, half), Z = deck.slice(half), out = []; for (let i = 0; i < half; i++) { if (kind === 'out') out.push(A[i], Z[i]); else out.push(Z[i], A[i]); } return out; };
        let deck = once(start), n = 1;
        while (deck.join() !== start.join() && n < 500) { deck = once(deck); n++; }
        return n === ans ? true : `shuffling takes ${n}`;
      },
      solution: (kind === 'out'
        ? `Number the positions 0 to ${cards - 1} from the top. A card in the top half at position p moves to position 2p, and a card in the bottom half at position p moves to 2p − ${m}. So each position p goes to the remainder of 2p divided by ${m} (the bottom card, at ${cards - 1}, stays put). `
        : `Number the positions 1 to ${cards} from the top. A card in the top half at position p moves to position 2p, and a card in the bottom half at position p moves to 2p − ${m}. So each position p goes to the remainder of 2p divided by ${m}. `)
        + `After k shuffles, p goes to the remainder of ${sup(2, 'k')}·p, so every card is back exactly when ${sup(2, 'k')} leaves remainder 1. The remainders of 2, ${sup(2, 2)}, ${sup(2, 3)}, … divided by ${m} are ${pows.join(', ')}. The first 1 is at k = ${ans}, so the answer is <b>${ans}</b>.`,
    };
  },
];

// ======================================================================================================================
// Functions applied many times: fractions that come back, squaring in disguise, x² − 2 and cosines, maps on [0, 1),
// and working backward through a rule on whole numbers
// ======================================================================================================================
const FN = 'Functions applied many times';
const nestEq = (n, rhs) => (n <= 3 ? `${'f('.repeat(n)}x${')'.repeat(n)} = ${rhs}` : `f(f(⋯f(x)⋯)) = ${rhs}, where f is applied ${n} times`);
const nTimes = (r) => (r === 1 ? 'once' : `${r} times`);
// (ax + b)/(cx + d) as [a, b, c, d], lowest terms, with c > 0 (or d > 0 when c is 0)
const mobNorm = ([a, b, c, e]) => { const g = gcd(gcd(a, b), gcd(c, e)) || 1, s = c < 0 || (c === 0 && e < 0) ? -1 : 1; return [(s * a) / g, (s * b) / g, (s * c) / g, (s * e) / g]; };
const mobMul = ([a, b, c, e], [p, q, r, s]) => mobNorm([a * p + b * r, a * q + b * s, c * p + e * r, c * q + e * s]);
const mobRead = ([a, b, c, e]) => (c === 0 && e === 1 ? expr([a, 'x'], [b, '']) : over(expr([a, 'x'], [b, '']), expr([c, 'x'], [e, ''])));
const mobAt = ([a, b, c, e], x) => { const bot = qadd(qmul(Q(c), x), Q(e)); return bot[0] === 0n ? null : qdiv(qadd(qmul(Q(a), x), Q(b)), bot); };
// the fractions (ax + b)/(cx + d) with small whole coefficients whose square of the trace is k times the determinant: they come back after 3, 4 or 6 steps (k = 1, 2, 3)
const mobCache = new Map();
const mobList = (k) => {
  if (!mobCache.has(k)) {
    const out = [], R = range(-4, 6);
    for (const a of R) for (const b of R) for (const c of range(1, 5)) for (const e of R) {
      const tr = a + e, det = a * e - b * c;
      if (b !== 0 && tr !== 0 && det !== 0 && tr * tr === k * det && gcd(gcd(a, b), gcd(c, e)) === 1 && a !== 0 && e !== 0) out.push([a, b, c, e]);
    }
    mobCache.set(k, out);
  }
  return mobCache.get(k);
};
const mobOrbit = (M, t, P) => { const out = [t]; for (let i = 1; i < P; i++) { const v = mobAt(M, out.at(-1)); if (!v) return null; out.push(v); } return mobAt(M, out.at(-1)) && qeq(mobAt(M, out.at(-1)), t) ? out : null; };
const START = [[1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [-1, 1], [-2, 1], [-3, 1], [1, 2], [3, 2], [1, 3], [2, 3], [5, 2], [7, 1]];
// the real numbers that a chain of k steps of x² − 2 reaches backward from c, to count solutions without any cosines
const preChain = (c, k) => { let vals = [c]; for (let i = 0; i < k; i++) { const next = []; for (const y of vals) { if (y < -2 - 1e-9) continue; const r = Math.sqrt(Math.max(0, y + 2)); if (!next.some((w) => Math.abs(w - r) < 1e-10)) next.push(r); if (!next.some((w) => Math.abs(w + r) < 1e-10)) next.push(-r); } vals = next; } return vals; };
const mobiusSum = (k, f) => { const ps = range(2, k).filter((p) => k % p === 0 && range(2, p - 1).every((q) => p % q !== 0)); let total = 0; const go = (i, dd, sgn) => { if (i === ps.length) { total += sgn * f(k / dd); return; } go(i + 1, dd, sgn); go(i + 1, dd * ps[i], -sgn); }; go(0, 1, 1); return { ps, total }; };

const applied = [
  // a fraction (ax + b)/(cx + d) that comes back after 3, 4 or 6 applications
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['ord3', 'ord6', 'solve', 'ord4']);
    const k = { ord3: 1, ord4: 2, ord6: 3, solve: 1 }[form], P = { 1: 3, 2: 4, 3: 6 }[k];
    const [M, t0, N] = pick(c2, `mob-${form}`, [mobList(k), START, FARS], (M, t0, N) => {
      if (N % P === 0) return false;
      const orb = mobOrbit(M, toQ(t0), P);
      return !!orb && orb.every((v) => v[1] <= 60n && (v[0] < 0n ? -v[0] : v[0]) <= 60n) && new Set(orb.map(String)).size === P;
    });
    const t = toQ(t0), orb = mobOrbit(M, t, P), R = N % P, f = mobRead(M), M2 = mobMul(M, M), M3 = mobMul(M2, M);
    const chain = `${orb.map(qshow).join(' → ')} → ${qshow(t)}`;
    if (form === 'solve') {
      const v = orb[R], ans = t, wrong = [orb[(2 * R) % P], v, orb[(R + 1) % P], orb[(R + 2) % P], Q(1), qmul(Q(-1), t), qadd(t, Q(1))];
      return {
        topic: FN, rank: 21,
        text: `Let f(x) = ${f}. Start with a number x and apply f ${num(N)} times in a row. The result is ${qshow(v)}. What is x?`,
        answer: fchoices(d, qn(ans), wrong.map(qn)),
        check: () => { let x = ans; for (let i = 0; i < N; i++) x = mobAt(M, x); return qeq(x, v) ? true : `applying f to x gives ${x}`; },
        solution: `Compose f with itself: f(f(x)) = ${mobRead(M2)}, and then f(f(f(x))) = x for every x. So applying f three times changes nothing, and only the remainder of ${num(N)} when divided by 3 matters. That remainder is ${R}, so the condition says that applying f ${nTimes(R)} to x gives ${qshow(v)}. `
          + `Applying f ${3 - R === 1 ? 'once more' : 'twice more'} to both sides brings x back on the left. Going on from the given number, ${range(0, 3 - R).map((i) => qshow(orb[(R + i) % P])).join(' → ')}, so x = <b>${qshow(ans)}</b>.`,
      };
    }
    const ans = orb[R], wrong = [orb[(R + 1) % P], orb[(R + P - 1) % P], orb[(R + 2) % P], t, qmul(Q(-1), ans), qadd(ans, Q(1)), qsub(ans, Q(1))];
    const why = form === 'ord3' ? `This is no accident: f(f(x)) = ${mobRead(M2)}, and then f(f(f(x))) = x for every x.`
      : form === 'ord4' ? `This is no accident: f(f(x)) = ${mobRead(M2)}, and applying that twice gives x back for every x.`
        : `This is no accident: f(f(f(x))) = ${mobRead(M3)}, and applying that twice gives x back for every x.`;
    return {
      topic: FN, rank: { ord3: 17, ord4: 18, ord6: 20 }[form],
      text: `Let f(x) = ${f}. Start with ${qshow(t)} and apply f ${num(N)} times in a row. What number results?`,
      answer: fchoices(d, qn(ans), wrong.map(qn)),
      check: () => { let x = t; for (let i = 0; i < N; i++) x = mobAt(M, x); return said(x, qn(ans)); },
      solution: `Apply f over and over, starting at ${qshow(t)}: ${chain}. So the values go round a cycle of ${P}. ${why} `
        + `Since ${num(N)} leaves remainder ${R} when divided by ${P}, the answer is the number ${R} step${R === 1 ? '' : 's'} along the cycle from ${qshow(t)}, which is <b>${qshow(ans)}</b>.`,
    };
  },
  // (x + h)ᵉ − h with the brackets multiplied out: each application just raises x + h to the power e
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['value', 'threshold', 'fixed']);
    const HS = [-4, -3, -2, -1, 1, 2, 3, 4, 5];
    const makeF = (e, h) => (e === 2 ? [h * h - h, 2 * h, 1] : [h ** 3 - h, 3 * h * h, 3 * h, 1]);
    if (form === 'value') {
      const [e, h, b, n] = pick(c2, 'conj-value', [[2, 3], HS, [2, 3, 4, 5, 7], [3, 4, 5]], (e, h, b, n) => (e === 2 || n <= 4) && b - h !== 0);
      const t = b - h, E = e ** n, cs = makeF(e, h), label = (bb, x, c = -h) => [bb ** x - h, `${sup(bb, num(x))}${signed(c)}`], right = label(b, E);
      return {
        topic: FN, rank: e === 2 ? 15 : 16,
        text: `Let f(x) = ${poly(cs)}. Start with ${num(t)} and apply f ${n} times in a row. What number results?`,
        answer: tchoices(right, [label(b, e ** (n - 1)), label(b, e ** (n + 1)), label(b, e * n), label(b, E + 1), label(b, E - 1), label(b, n ** e), label(b + 1, E)]),
        check: () => {
          let x = BigInt(t);
          for (let i = 0; i < n; i++) x = pval(B(cs), x);
          return x === BigInt(b) ** BigInt(E) - BigInt(h) ? true : 'applying f gives another number';
        },
        solution: `Complete the ${e === 2 ? 'square' : 'cube'}: f(x) = (${shift('x', h)})<sup>${e}</sup>${signed(-h)}, so f(x)${signed(h)} = (${shift('x', h)})<sup>${e}</sup>. So each application of f raises x${signed(h)} to the power ${e}. After ${n} applications, x${signed(h)} has been raised to the power ${e}<sup>${n}</sup> = ${num(E)}. `
          + `Starting from ${num(t)}, x${signed(h)} is ${b}, so the result is <b>${right[1]}</b>.`,
      };
    }
    if (form === 'threshold') {
      const [h, b, K] = pick(c2, 'conj-limit', [HS, [2, 3, 5, 10], [20, 50, 100, 200, 300, 500, 700, 1000]], (h, b, K) => {
        const need = K / Math.log10(b);
        const n = Math.ceil(Math.log2(need));
        return Math.abs(2 ** n / need - 1) > 0.02 && Math.abs(2 ** (n - 1) / need - 1) > 0.02 && b - h !== 0;
      });
      const t = b - h, need = K / Math.log10(b), ans = Math.ceil(Math.log2(need)), cs = makeF(2, h), rough = Math.ceil(Math.log2(K));
      return {
        topic: FN, rank: 18,
        text: `Let f(x) = ${poly(cs)}. Start with ${num(t)} and apply f over and over. After how many applications is the result first greater than ${sup(10, K)}?`,
        answer: fchoices(d, ans, [ans + 1, ans - 1, rough === ans ? ans + 2 : rough, ans + 2, ans - 2, K]),
        check: () => {
          const lim = 10n ** BigInt(K);
          let x = BigInt(t), n = 0;
          while (x <= lim) { x = pval(B(cs), x); n++; }
          return n === ans ? true : `it took ${n} steps`;
        },
        solution: `Complete the square: f(x) = (${shift('x', h)})<sup>2</sup>${signed(-h)}, so each application of f squares x${signed(h)}. From ${num(t)}, x${signed(h)} is ${b}, so after n applications the value is ${sup(b, sup(2, 'n'))}${signed(-h)}. `
          + `The ${signed(-h).trim()} hardly matters at this size, so we need ${sup(2, 'n')}·log<sub>10</sub> ${b} to pass ${K}${b === 10 ? '' : `, where log<sub>10</sub> ${b} is about ${num(Math.log10(b), 3)}`}. So ${sup(2, 'n')} must pass ${num(need, 1)}. Since ${sup(2, ans - 1)} = ${num(2 ** (ans - 1))} is too small and ${sup(2, ans)} = ${num(2 ** ans)} is enough, the smallest n is <b>${ans}</b>.`,
      };
    }
    const [e, h, n] = pick(c2, 'conj-fixed', [[2, 3], HS, [2, 3, 4]], (e, h, n) => (e === 2 || n === 2));
    const cs = makeF(e, h), E = e ** n, xs = e === 2 ? [-h, 1 - h] : [-h, 1 - h, -1 - h], ans = sum(xs.map((x) => x * x));
    const each = xs.map((x) => `${paren(x)}<sup>2</sup>`).join(' + ');
    return {
      topic: FN, rank: 21,
      text: `Let f(x) = ${poly(cs)}. What is the sum of the squares of all real numbers x with ${nestEq(n, 'x')}?`,
      answer: fchoices(d, ans, [E * h * h, h * h, (1 - h) ** 2, ans + 1, ans + (1 + h) ** 2 + (h - 2) ** 2, (1 - 2 * h) ** 2, xs.length * h * h]),
      check: () => {
        let g = B(cs);
        for (let i = 1; i < n; i++) g = compose(g, B(cs));
        const eq = padd(g, [0n, -1n]);
        if (realRootCount(eq) !== xs.length) return `Sturm count ${realRootCount(eq)}`;
        return xs.every((x) => pval(eq, x) === 0n) ? true : 'a listed number is not a solution';
      },
      solution: `Complete the ${e === 2 ? 'square' : 'cube'}: f(x)${signed(h)} = (${shift('x', h)})<sup>${e}</sup>. Let y = x${signed(h)}. Each application of f raises y to the power ${e}, so after ${n} applications the equation says y<sup>${E}</sup> = y. `
        + `That has the solution y = 0. Any other real solution has y<sup>${E - 1}</sup> = 1, and ${E - 1} is ${e === 2 ? 'odd, so y = 1 is the only one' : 'even, so y = 1 and y = −1 are the only ones'} (the other roots of that equation are not real). `
        + `So x is ${orList(xs.map(num))}, and the sum of the squares is ${each} = <b>${num(ans)}</b>.`,
    };
  },
  // x² − 2: with x = 2cos θ it doubles the angle, and with x = y + 1/y it squares y
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['count', 'product']);
    if (form === 'count') {
      const [h, cc, n] = pick(c2, 'cheb-count', [[0, 1, -1, 2, -2], [-2, -1, 0, 1, 2, 'x'], [3, 4, 5, 6, 7, 8]], (h, cc, n) => cc !== 'x' || (n <= 4 && h === 0));
      const cs = [h * h + h - 2, -2 * h, 1], fixed = cc === 'x', c = fixed ? 0 : cc + h, half = 2 ** (n - 1);
      const ans = fixed ? 2 ** n : cc === 2 ? half + 1 : cc === -2 ? half : 2 ** n;
      const target = fixed ? 'x' : num(c), shifted = h !== 0, U = shifted ? 'u' : 'x', G = shifted ? 'g' : 'f';
      const eqLine = fixed ? `2cos(${num(2 ** n)}θ) = 2cos θ` : `2cos(${num(2 ** n)}θ) = ${num(cc)}`;
      const count = fixed ? `That means ${num(2 ** n)}θ = ±θ plus a whole number of full turns, so θ = ${over('2πj', num(2 ** n - 1))} or θ = ${over('2πj', num(2 ** n + 1))}. In [0, π] the first gives ${num(half)} values (j = 0 to ${num(half - 1)}) and the second ${num(half)} more (j = 1 to ${num(half)}).`
        : cc === 2 ? `As θ runs from 0 to π, ${num(2 ** n)}θ runs from 0 to ${num(2 ** n)}π, and its cosine is 1 at 0, 2π, 4π, …, ${num(2 ** n)}π, which is ${num(half + 1)} places.`
          : cc === -2 ? `As θ runs from 0 to π, ${num(2 ** n)}θ runs from 0 to ${num(2 ** n)}π, and its cosine is −1 at π, 3π, …, ${num(2 ** n - 1)}π, which is ${num(half)} places.`
            : `As θ runs from 0 to π, ${num(2 ** n)}θ runs over ${num(2 ** n)} half-turns, and on each half-turn the cosine takes the value ${fr(cut(cc, 2))} exactly once.`;
      return {
        topic: FN, rank: cc === 2 || cc === -2 ? 25 : 24,
        text: `Let f(x) = ${poly(cs)}. How many real numbers x satisfy ${nestEq(n, target)}?`,
        answer: fchoices(d, ans, [2 ** n, 2, half, half + 1, 2 ** n + 1, 2 ** n - 1, 2 * n, n + 1]),
        check: () => {
          if (n <= 4) {
            let g = B(cs);
            for (let i = 1; i < n; i++) g = compose(g, B(cs));
            const eq = padd(g, fixed ? [0n, -1n] : [BigInt(-c)]);
            return realRootCount(eq) === ans ? true : `Sturm count ${realRootCount(eq)}`;
          }
          const got = preChain(cc, n).length;     // layer by layer, backward from the target
          return got === ans ? true : `going backward finds ${got}`;
        },
        solution: (shifted ? `Let u = ${shift('x', -h)}. Then f(x)${signed(-h)} = u<sup>2</sup> − 2, so in terms of u, f is just g(u) = u<sup>2</sup> − 2, and the target becomes ${num(cc)}. ` : '')
          + `If |${U}| is greater than 2, then ${G}(${U}) is greater than 2, and it stays greater than 2 from then on, so ${fixed ? 'the values keep growing and can’t return to x' : `the result can’t be ${num(cc)}`}. So ${U} = 2cos θ for exactly one θ in [0, π]. `
          + `The double-angle formula gives ${G}(2cos θ) = 4cos<sup>2</sup> θ − 2 = 2cos 2θ, so each application doubles θ, and the equation becomes ${eqLine}. ${count} `
          + `Different θ in [0, π] give different ${U}, so there are <b>${num(ans)}</b> solutions.`,
      };
    }
    const [y, n] = pick(c2, 'cheb-prod', [[2, 3, 4, 5, 6, 7], [3, 4, 5, 6]]);
    const NN = 2 ** n, a0 = Q(y * y + 1, y), y2 = y * y - 1;
    const read = (e1, e2, e3) => over(`${sup(y, num(e1))} − 1`, `${e2 === 1 ? `${y}` : sup(y, num(e2))}·${num(e3)}`);
    const value = (e1, e2, e3) => Math.exp((e1 - e2) * Math.log(y)) / e3;
    const label = (e1, e2, e3) => [value(e1, e2, e3), read(e1, e2, e3)], right = label(2 * NN, NN - 1, y2);
    return {
      topic: FN, rank: 24,
      text: `Let ${sub('a', 0)} = ${qshow(a0)} and ${sub('a', 'k+1')} = ${sup(sub('a', 'k'), 2)} − 2 for every k ≥ 0. What is the product ${sub('a', 0)}·${sub('a', 1)}·${sub('a', 2)}⋯${sub('a', n - 1)}?`,
      answer: tchoices(right, [label(2 * NN, NN, y2), label(NN, NN - 1, y2), label(2 * NN, NN - 2, y2), label(4 * NN, 2 * NN - 1, y2), label(NN, NN / 2 - 1, y2), label(2 * NN, NN - 1, y * y), label(2 * NN, NN - 1, y2 + 2)]),
      check: () => {
        let a = a0, pr = Q(1);
        for (let k = 0; k < n; k++) { pr = qmul(pr, a); a = qsub(qmul(a, a), Q(2)); }
        const want = Q(BigInt(y) ** BigInt(2 * NN) - 1n, BigInt(y) ** BigInt(NN - 1) * BigInt(y2));
        return qeq(pr, want) ? true : 'multiplying the terms gives another number';
      },
      solution: `Notice that ${sub('a', 0)} = y + ${over(1, 'y')} with y = ${y}. Squaring and taking away 2 gives y<sup>2</sup> + ${over(1, 'y<sup>2</sup>')}, then y<sup>4</sup> + ${over(1, 'y<sup>4</sup>')}, and in general ${sub('a', 'k')} = ${sup('y', sup(2, 'k'))} + ${over(1, sup('y', sup(2, 'k')))}. `
        + `Now multiply the product by y − ${over(1, 'y')}. A difference of squares appears each time: (y − ${over(1, 'y')})(y + ${over(1, 'y')}) = y<sup>2</sup> − ${over(1, 'y<sup>2</sup>')}, then (y<sup>2</sup> − ${over(1, 'y<sup>2</sup>')})(y<sup>2</sup> + ${over(1, 'y<sup>2</sup>')}) = y<sup>4</sup> − ${over(1, 'y<sup>4</sup>')}, and so on, up to ${sup('y', num(NN))} − ${over(1, sup('y', num(NN)))}. `
        + `So the product is (${sup(y, num(NN))} − ${over(1, sup(y, num(NN)))}) ÷ (${y} − ${over(1, y)}). Multiplying top and bottom by ${sup(y, num(NN))}, and using ${y} − ${over(1, y)} = ${over(y2, y)}, this is <b>${right[1]}</b>.`,
    };
  },
  // maps on an interval: the fractional part of bx, and the tent map
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['exact', 'tent', 'shift']);
    if (form === 'exact' || form === 'shift') {
      const [b, k] = pick(c2, `frac-${form}`, form === 'exact' ? [[2, 3], [4, 6, 8, 9, 10, 12]] : [[2, 3, 4, 5, 7], [3, 4, 5, 6, 7]], (b, k) => (form !== 'exact' || b ** k <= 300000));
      const all = (j) => b ** j - 1, { ps, total: ans0 } = mobiusSum(k, all), ans = form === 'exact' ? ans0 : all(k);
      const naive = all(k) - sum(ps.map((p) => all(k / p))), first = ps.map((p) => `${num(all(k / p))}`);
      const groups = listing(ps.map((p) => `${num(all(k / p))} come back after ${k / p} steps`));
      const adds = ps.length === 2 ? ` The ${num(all(k / (ps[0] * ps[1])))} that come back after ${k / (ps[0] * ps[1])} steps are in both groups, so they must be added back once.` : '';
      return {
        topic: FN, rank: form === 'exact' ? 24 : 18,
        text: `For x in the interval [0, 1), let T(x) be the fractional part of ${b}x (the part after taking away the whole number part). ${form === 'exact' ? `For how many x in [0, 1) does applying T exactly ${k} times give x back, while applying it any smaller number of times (at least once) does not?` : `For how many x in [0, 1) does applying T exactly ${k} times give x back?`}`,
        answer: fchoices(d, ans, form === 'exact' ? [all(k), naive === ans ? all(k) + 1 : naive, b ** k, Math.floor(all(k) / k), ans + 1, ans - 1, all(k) - all(k - 1)] : [b ** k, b ** k - 2, (b - 1) ** k, k * b, b ** (k - 1), ans + 2]),
        check: () => {
          // each of the bᵏ pieces of [0, 1) has T applied k times running from 0 up to 1, so each holds one solution unless it is the last
          let pieces = 0;
          for (let i = 0; i < b ** k; i++) { const x = Q(i, b ** k - 1); if (i < b ** k - 1 && qsign(qsub(x, Q(i, b ** k))) >= 0 && qsign(qsub(Q(i + 1, b ** k), x)) > 0) pieces++; }
          if (pieces !== all(k)) return `found ${pieces} solutions`;
          if (form !== 'exact') return pieces === ans ? true : 'the count differs';
          // walk each solution j/(bᵏ − 1), multiplying by b, and see when it first comes back
          let n = 0;
          const m = all(k);
          for (let j = 0; j < m; j++) { let v = (b * j) % m, st = 1; while (v !== j) { v = (b * v) % m; st++; } if (st === k) n++; }
          return n === ans ? true : `counted ${n}`;
        },
        solution: `Applying T just multiplies by ${b} and throws away the whole part, so applying it ${k} times gives the fractional part of ${sup(b, k)}x. That equals x exactly when ${sup(b, k)}x − x is a whole number, that is, x = ${over('j', num(all(k)))} for some whole number j from 0 to ${num(all(k) - 1)}. That is ${num(all(k))} numbers. `
          + (form === 'exact'
            ? `Some of these come back sooner. If x comes back after both m and ${k} steps, it also comes back after their greatest common divisor, so anything that comes back early also comes back after ${listing(ps.map((p) => `${k / p}`), 'or')} steps. By the same reasoning, ${groups}.${adds} `
              + `So the count is ${num(all(k))} − ${first.join(' − ')}${ps.length === 2 ? ` + ${num(all(k / (ps[0] * ps[1])))}` : ''} = <b>${num(ans)}</b>.`
            : `So the answer is <b>${num(ans)}</b>.`),
      };
    }
    const [n, c, ask] = pick(c2, 'tent', [range(3, 12), [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5]], ['sum', 'fixed']], (n, c, ask) => ask === 'sum' || c[0] === 1 && c[1] === 2);
    const half = 2 ** (n - 1), ans = ask === 'sum' ? half : 2 ** n, cRead = fr(c);
    const T = (x) => (x <= 0.5 ? 2 * x : 2 - 2 * x), Tn = (x) => { let v = x; for (let i = 0; i < n; i++) v = T(v); return v; };
    return {
      topic: FN, rank: ask === 'sum' ? 22 : 21,
      text: `For x in the interval [0, 1], let T(x) = 2x if x ≤ ${over(1, 2)} and T(x) = 2 − 2x if x ≥ ${over(1, 2)}. ${ask === 'sum' ? `What is the sum of all x in [0, 1] such that applying T exactly ${n} times to x gives ${cRead}?` : `How many x in [0, 1] are there such that applying T exactly ${n} times to x gives x?`}`,
      answer: fchoices(d, ans, ask === 'sum' ? [2 ** n, 1, val(c) * half === Math.floor(val(c) * half) ? val(c) * half + 3 : half + 2, val(c) * 2 ** n === Math.floor(val(c) * 2 ** n) ? val(c) * 2 ** n : half - 1, half - 2, half + 1] : [2 ** n - 1, 2 ** n + 1, half, 2, n, 2 * n]),
      check: () => {
        // on each of the 2ⁿ pieces between neighboring multiples of 1/2ⁿ the map runs straight between 0 and 1: halve to find the solution on each
        const found = [], want = ask === 'sum' ? () => val(c) : (x) => x;
        for (let i = 0; i < 2 ** n; i++) {
          let lo = i / 2 ** n, hi = (i + 1) / 2 ** n;
          const g = (x) => Tn(x) - want(x), glo = g(lo), ghi = g(hi);
          if (Math.abs(glo) > 1e-12 && Math.abs(ghi) > 1e-12 && glo * ghi > 0) continue;
          if (Math.abs(glo) <= 1e-12) { if (!found.some((v) => Math.abs(v - lo) < 1e-10)) found.push(lo); continue; }
          for (let s = 0; s < 70; s++) { const mid = (lo + hi) / 2; if (g(lo) * g(mid) <= 0) hi = mid; else lo = mid; }
          if (!found.some((v) => Math.abs(v - lo) < 1e-10)) found.push(lo);
        }
        return ask === 'sum' ? near(sum(found), ans, 'sum of solutions') : (found.length === ans ? true : `found ${found.length}`);
      },
      solution: `Applying T once stretches [0, ${over(1, 2)}] onto [0, 1] and folds [${over(1, 2)}, 1] back onto [0, 1]. So after ${n} applications, [0, 1] splits into ${num(2 ** n)} equal pieces, and on each piece the result runs in a straight line from 0 to 1 or from 1 to 0. `
        + (ask === 'sum'
          ? `So each piece holds exactly one solution, ${num(2 ** n)} in all. Now T(x) = T(1 − x) for every x, so if x is a solution, so is 1 − x. The solutions come in ${num(half)} pairs, and each pair adds up to 1. So the sum is <b>${num(ans)}</b>, whatever the target is.`
          : `So on each piece the result crosses the line y = x exactly once. Where two pieces meet the result is 0 or 1, and x itself is neither, so no solution is shared between pieces. So each of the ${num(2 ** n)} pieces has its own solution, and the answer is <b>${num(ans)}</b>.`),
    };
  },
  // a rule on whole numbers, worked backward layer by layer
  (d, ctx) => {
    const [ask, c2] = turn(ctx, ['count', 'sum']);
    const [rule, t, k] = pick(c2, `tree-${ask}`, [[1, 3, 5, 7, 9, 'c'], [1, 2, 3, 4, 5, 6, 8, 10, 16], [4, 5, 6, 7, 8]], (rule, t, k) => {
      const lv = treeLevels(rule, t, k), last = lv.at(-1);
      return last.length >= 3 && last.length !== 2 ** k && last.length <= 14 && !(rule === 3 && t === 27);
    });
    const lv = treeLevels(rule, t, k), last = lv.at(-1), f = (n) => (n % 2 === 0 ? n / 2 : rule === 'c' ? 3 * n + 1 : n + rule);
    const count = last.length, total = sum(last), ans = ask === 'count' ? count : total, ruleText = rule === 'c' ? '3n + 1' : `n + ${rule}`;
    const prev = lv.at(-2), wrong = ask === 'count' ? [2 ** k, count + 1, count - 1, prev.length, k + 1, count + 2] : [sum(prev), total + t, total - t, t * 2 ** k, total + last[0], total - last[0]];
    const layers = lv.map((L, i) => `${i + 1} step${i === 0 ? '' : 's'} back: ${L.join(', ')}`).join('. ');
    return {
      topic: FN, rank: ask === 'count' ? 13 : 14,
      text: `For a positive integer n, let f(n) = ${over('n', 2)} if n is even and f(n) = ${ruleText} if n is odd. ${ask === 'count' ? `How many positive integers n are there such that applying f to n exactly ${k} times gives ${t}?` : `What is the sum of all positive integers n such that applying f to n exactly ${k} times gives ${t}?`}`,
      answer: fchoices(d, ans, wrong),
      check: () => {
        const found = [];
        for (let n = 1; n <= t * 2 ** k + 1; n++) { let x = n; for (let i = 0; i < k; i++) x = f(x); if (x === t) found.push(n); }
        return (ask === 'count' ? found.length : sum(found)) === ans ? true : `searching finds ${found.join(', ')}`;
      },
      solution: `Work backward. A number m comes from 2m (always, since 2m is even), and also from ${rule === 'c' ? '(m − 1)/3 if that is an odd whole number' : `m − ${rule} if that is positive and odd`}. Starting from ${t}, the numbers at each stage are as follows. ${layers}. `
        + (ask === 'count' ? `So there are <b>${count}</b> such numbers.` : `Adding the last list gives <b>${num(total)}</b>.`),
    };
  },
];
// the numbers 1, 2, …, k steps before t under the rule above
function treeLevels(rule, t, k) {
  const pre = (m) => { const out = [2 * m]; if (rule === 'c') { if ((m - 1) % 3 === 0 && (m - 1) / 3 >= 1 && (m - 1) / 3 % 2 === 1) out.push((m - 1) / 3); } else if (m - rule >= 1 && (m - rule) % 2 === 1) out.push(m - rule); return out; };
  const lv = [];
  let cur = [t];
  for (let i = 0; i < k; i++) { cur = [...new Set(cur.flatMap(pre))].sort((x, y) => x - y); lv.push(cur); }
  return lv;
}

// ======================================================================================================================
// Floors and fractional parts: equations with ⌊x⌋, sums of floors, pairing k with p − k, counting different values,
// and floors of huge numbers
// ======================================================================================================================
const FL = 'Floors and fractional parts';
const fl = (s) => `⌊${s}⌋`;
const FRAC_NOTE = '{t} = t − ⌊t⌋';
const lcm3 = (a, b, c) => { const l = (x, y) => (x * y) / gcd(x, y); return l(l(a, b), c); };
const bisqrt = (n) => { if (n < 2n) return n; let x = 1n << BigInt((n.toString(2).length + 1) >> 1); for (;;) { const y = (x + n / x) >> 1n; if (y >= x) return x; x = y; } };
const two = (v) => String(v).padStart(2, '0');

const floors = [
  // equations with a floor in them: fix the floor, solve, and keep what fits
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['quad', 'xfloor', 'frac']);
    if (form === 'quad') {
      const info = (b, c) => { const ok = [], first = []; for (let n = 1; n <= b + 1; n++) { const w = b * n - c; if (w >= 0 && n * n <= w) { first.push(n); if (w < (n + 1) ** 2) ok.push(n); } } return { ok, first }; };
      const [b, c, ask] = pick(c2, 'floor-quad', [range(6, 15), range(1, 40), ['count', 'sum']], (b, c) => { const I = info(b, c); return I.ok.length >= 2 && I.ok.length <= 6 && I.first.length > I.ok.length; });
      const { ok, first } = info(b, c), dropped = first.filter((n) => !ok.includes(n)), count = ok.length, total = sum(ok.map((n) => b * n - c)), ans = ask === 'count' ? count : total;
      return {
        topic: FL, rank: ask === 'count' ? 18 : 19,
        text: `${ask === 'count' ? 'How many real numbers x satisfy' : 'What is the sum of the squares of all real numbers x that satisfy'} x<sup>2</sup> − ${b}${fl('x')} + ${c} = 0?`,
        answer: fchoices(d, ans, ask === 'count' ? [first.length, count + 1, count - 1, 2 * count, count + 2] : [sum(first.map((n) => b * n - c)), total + c, total - c, total + dropped[0], sum(ok.map((n) => n * n))]),
        check: () => {
          // scan x directly, piece by piece, for places where the left side changes sign
          let found = 0, sq = 0;
          const h = 1 / 400;
          for (let n = -2; n <= b + 3; n++) {
            const g = (x) => x * x - b * n + c, end = n + 1 - 1e-9;
            for (let x = n; x < end; x += h) {
              const x1 = Math.min(x + h, end);
              if (g(x) === 0 || g(x) * g(x1) < 0) { let lo = x, hi = x1; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (g(lo) * g(m) <= 0) hi = m; else lo = m; } found++; sq += lo * lo; }
            }
          }
          return ask === 'count' ? (found === ans ? true : `found ${found}`) : near(sq, ans, 'sum of squares');
        },
        solution: `Let n = ${fl('x')}, an integer. Then x<sup>2</sup> = ${b}n − ${c}, and this can’t be negative, so n is positive and x = √(${b}n − ${c}). Since n = ${fl('x')}, x must be at least n and less than n + 1, so two things must hold: n<sup>2</sup> ≤ ${b}n − ${c}, and ${b}n − ${c} is less than (n + 1)<sup>2</sup>. `
          + `The first holds for n = ${listing(first.map(String))}. The second then rules out n = ${listing(dropped.map(String))}, because there ${b}n − ${c} is at least (n + 1)<sup>2</sup>. `
          + `So n is ${orList(ok.map(String))}, and each gives exactly one x, with x<sup>2</sup> = ${listing(ok.map((n) => `${b * n - c}`))}. `
          + (ask === 'count' ? `So there are <b>${count}</b> solutions.` : `Adding these up gives <b>${num(total)}</b>.`),
      };
    }
    if (form === 'xfloor') {
      const [M] = pick(c2, 'xfloor', [[100, 120, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1500, 2000]], (M) => !isSq(M));
      const s = isqrt(M), whole = (s * (s - 1)) / 2, left = Math.min(s, M - s * s + 1), ans = whole + left, slip = sum(range(1, s).map((n) => Math.min(n + 1, Math.max(0, M - n * n + 1))));
      return {
        topic: FL, rank: 19,
        text: `How many positive integers N with N ≤ ${num(M)} can be written as ${fl(`x${fl('x')}`)} for some positive real number x?`,
        answer: fchoices(d, ans, [(s * (s + 1)) / 2, whole, slip, M - s, ans + 1, ans - 1, s]),
        check: () => {
          // try x in steps of 1/100: x⌊x⌋ moves by less than 1 at each step, so no whole-number value is skipped
          const got = new Set();
          for (let i = 100; i <= (s + 2) * 100; i++) { const n = Math.floor(i / 100), v = Math.floor((i * n) / 100); if (v >= 1 && v <= M) got.add(v); }
          return got.size === ans ? true : `found ${got.size}`;
        },
        solution: `Sort x by n = ${fl('x')}. If x is less than 1, then ${fl('x')} = 0 and the value is 0, which doesn’t count. For x from n up to (but not including) n + 1, the product nx runs from n<sup>2</sup> up to (but not including) n<sup>2</sup> + n, so its floor takes the n values n<sup>2</sup>, n<sup>2</sup> + 1, …, n<sup>2</sup> + n − 1. `
          + `So n = 1 gives 1 value, n = 2 gives 2 values (4 and 5), n = 3 gives 3 values (9, 10 and 11), and so on. Up to n = ${s - 1} these are all at most ${num(M)}, which makes 1 + 2 + ⋯ + ${s - 1} = ${num(whole)} values. `
          + `For n = ${s} the values start at ${num(s * s)}, and ${left === s ? `all ${s} of them` : `only ${left} of them`} are at most ${num(M)}. So the count is ${num(whole)} + ${left} = <b>${num(ans)}</b>.`,
      };
    }
    const [k, M] = pick(c2, 'frac-eq', [[1, 2, 3], range(5, 40)], (k, M) => M > k + 2);
    const ans = M * M - k * M, kx = k === 1 ? 'x' : `${k}x`;
    return {
      topic: FL, rank: 15,
      text: `For a real number t, let {t} = t − ⌊t⌋ be its fractional part. How many real numbers x in the interval [${k}, ${M}) satisfy {x<sup>2</sup>} = {${kx}}?`,
      answer: fchoices(d, ans, [ans + 1, ans - 1, M * M, (M - k) ** 2, M * M - 1, M - k, ans + M]),
      check: () => {
        // count, on a fine grid, how many whole numbers x² − kx passes as x runs through the interval
        const h = (x) => x * x - k * x, stepX = 1 / (8 * M);
        let levels = 1, cur = Math.floor(h(k) + 1e-12);
        for (let i = 1; k + i * stepX < M; i++) { const v = Math.floor(h(k + i * stepX) + 1e-12); if (v !== cur) { levels += v - cur; cur = v; } }
        if (levels !== ans) return `counted ${levels}`;
        // and each listed solution really works, read through the fractional parts
        for (const m of [0, 1, Math.floor(ans / 2), ans - 1]) {
          const x = (k + Math.sqrt(k * k + 4 * m)) / 2, f = (t) => t - Math.floor(t), gap = Math.abs(f(x * x) - f(k * x));
          if (!(x >= k && x < M) || (gap > 1e-6 && gap < 1 - 1e-6)) return `x = ${x} fails`;
        }
        return true;
      },
      solution: `Two numbers have the same fractional part exactly when their difference is a whole number. So the condition is that x<sup>2</sup> − ${kx} is a whole number. On the interval [${k}, ${M}) the expression x<sup>2</sup> − ${kx} = x(${shift('x', -k)}) goes steadily up, from 0 at x = ${k} to values just below ${M}·${M - k} = ${num(ans)} as x nears ${M}. `
        + `So it takes each of the whole-number values 0, 1, 2, …, ${num(ans - 1)} exactly once, and the upper end ${num(ans)} is never reached. That gives <b>${num(ans)}</b> solutions.`,
    };
  },
  // sums of floors: which values they take, how many terms have jumped, and Hermite's identity
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['values', 'hundredths', 'hermite']);
    if (form === 'values') {
      const SETS = [[1, 2, 3], [1, 2, 4], [1, 3, 4], [2, 3, 4], [1, 2, 5], [1, 3, 5], [2, 3, 5], [1, 4, 6], [2, 3, 6], [1, 2, 6], [3, 4, 6]];
      const [[a, b, c], M] = pick(c2, 'floor-values', [SETS, [100, 200, 250, 300, 500, 600, 800, 1000, 1500, 2000]], ([a, b, c], M) => { const s = a + b + c; return M % s !== 0; });
      const s = a + b + c, L = lcm3(a, b, c), F = (j) => Math.floor((a * j) / L) + Math.floor((b * j) / L) + Math.floor((c * j) / L);
      const R = [...new Set(range(0, L - 1).map(F))].sort((x, y) => x - y), q = Math.floor(M / s), r = M % s, extra = R.filter((v) => v >= 1 && v <= r).length, ans = q * R.length + extra;
      const pts = range(0, L - 1).filter((j) => j === 0 || F(j) !== F(j - 1)), line = pts.map((j) => `${F(j)} from x = ${fr(cut(j, L))}`).join(', ');
      return {
        topic: FL, rank: 21,
        text: `How many of the integers 1, 2, 3, …, ${num(M)} can be written as ${fl(a === 1 ? 'x' : `${a}x`)} + ${fl(`${b}x`)} + ${fl(`${c}x`)} for some real number x?`,
        answer: fchoices(d, ans, [M, q * R.length, (q + 1) * R.length, q * R.length + (s - R.length), ans + 1, ans - 1, q * s]),
        check: () => {
          // every value, straight from the floors, at all the multiples of 1/L up to past M
          const got = new Set();
          for (let j = 0; j <= L * (q + 2); j++) { const v = Math.floor((a * j) / L) + Math.floor((b * j) / L) + Math.floor((c * j) / L); if (v >= 1 && v <= M) got.add(v); }
          return got.size === ans ? true : `found ${got.size}`;
        },
        solution: `Call the sum f(x). Adding 1 to x adds ${a} + ${b} + ${c} = ${s} to f, so it is enough to see what f does for x from 0 up to 1. It changes only at multiples of ${listing([a, b, c].map((v) => fr(cut(1, v))))}. Going along: f is ${line}. Where floors jump together (as all three do at x = 1), values are skipped. `
          + `So the values of f are exactly the whole numbers that leave a remainder of ${orList(R.map(String))} when divided by ${s}. Since ${num(M)} = ${s}·${q} + ${r}, the first ${num(q * s)} integers contain ${q}·${R.length} = ${num(q * R.length)} of them, and the last ${r} integers (remainders 1 to ${r}) contain ${extra} more. So the count is <b>${num(ans)}</b>.`,
      };
    }
    if (form === 'hundredths') {
      const [m, p, C] = pick(c2, 'hundredths', [[327, 418, 562, 639, 271, 855, 346, 487, 523, 694, 381, 716, 459, 228, 563, 935], [11, 17, 24, 31, 42], [37, 48, 53, 61, 66]], (m, p, C) => { const q = p + C - 1, n = Math.floor((m + p) / 100), t = range(p, q).filter((i) => Math.floor((m + i) / 100) === n + 1).length; return q < 100 + p && t > 0 && t < C && Math.floor((m + q) / 100) === n + 1; });
      const q = p + C - 1, n = Math.floor((m + p) / 100), terms = range(p, q).map((i) => Math.floor((m + i) / 100)), S = sum(terms), t = S - C * n, first = q - t + 1, ans = 100 * (n + 1) - first;
      return {
        topic: FL, rank: 20,
        text: `A real number r satisfies ${fl(`r + ${over(p, 100)}`)} + ${fl(`r + ${over(p + 1, 100)}`)} + ${fl(`r + ${over(p + 2, 100)}`)} + ⋯ + ${fl(`r + ${over(q, 100)}`)} = ${num(S)}. What is ${fl('100r')}?`,
        answer: fchoices(d, ans, [ans + 1, ans - 1, 100 * (n + 1) - (p + (C - t)), 100 * n + t, 100 * n + first, Math.floor((100 * S) / C)]),
        check: () => {
          const fits = range(0, 3000).filter((v) => sum(range(p, q).map((i) => Math.floor((v + i) / 100))) === S);
          return fits.length === 1 && fits[0] === ans ? true : `searching finds ${fits}`;
        },
        solution: `The sum has ${C} terms, and from the first term to the last the number inside goes up by less than 1, so every term is n or n + 1 for one integer n. Since ${num(S)} = ${C}·${n} + ${t}, n = ${n} and exactly ${t} term${t === 1 ? '' : 's'} equal${t === 1 ? 's' : ''} ${n + 1}. ${t === 1 ? 'It is the last term' : `They are the last ${t} terms`}, so the first term equal to ${n + 1} is the one with ${over(first, 100)}. `
          + `That means r + ${over(first, 100)} is at least ${n + 1}, while r + ${over(first - 1, 100)} is less than ${n + 1}. Multiplying by 100: 100r is at least ${num(100 * (n + 1))} − ${first} = ${num(ans)}, and 100r is less than ${num(100 * (n + 1))} − ${first - 1} = ${num(ans + 1)}. So ${fl('100r')} = <b>${num(ans)}</b>.`,
      };
    }
    const [n, S] = pick(c2, 'hermite', [[3, 4, 5, 6, 7, 8, 9], range(23, 200)], (n, S) => S % n !== 0);
    const ans = cut(S, n), list = n <= 4 ? range(0, n - 1).map((k) => fl(k ? `x + ${over(k, n)}` : 'x')).join(' + ') : `${fl('x')} + ${fl(`x + ${over(1, n)}`)} + ${fl(`x + ${over(2, n)}`)} + ⋯ + ${fl(`x + ${over(n - 1, n)}`)}`;
    const m = Math.floor(S / n), j = S % n;
    return {
      topic: FL, rank: 16,
      text: `What is the smallest real number x with ${list} = ${S}?`,
      answer: fchoices(d, ans, [cut(S + 1, n), cut(S, n + 1), [m, 1], cut(S - 1, n), cut(2 * S - n + 1, 2 * n), cut(S, n - 1)]),
      check: () => {
        const total = (x) => range(0, n - 1).reduce((s, k) => { const v = qadd(x, Q(k, n)), f = v[0] >= 0n ? v[0] / v[1] : -((-v[0] + v[1] - 1n) / v[1]); return s + Number(f); }, 0);
        return total(toQ(ans)) === S && total(qsub(toQ(ans), Q(1, 100000))) === S - 1 ? true : 'the sum is not right at the answer';
      },
      solution: `Let k = ${fl('x')}. Each term is k or k + 1, and the terms that reach k + 1 are the last ones in the list. If j of them reach k + 1, the sum is ${n}k + j, with j from 0 to ${n - 1}. So ${S} = ${n}·${m} + ${j} gives k = ${m} and j = ${j}. `
        + `Exactly ${j} term${j === 1 ? '' : 's'} must reach ${m + 1}, and the first of them is x + ${over(n - j, n)}. So x + ${over(n - j, n)} must be at least ${m + 1}, which means x is at least ${m + 1} − ${over(n - j, n)} = ${fr(ans)}, and at this x the term before it is still below ${m + 1}. So the smallest x is <b>${fr(ans)}</b>.`,
    };
  },
  // a long sum of floors: pair k with p − k
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['coprime', 'shared', 'parts']);
    const prime = form !== 'shared';
    const [p, q] = pick(c2, `recip-${form}`, prime ? [[17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79], [12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30, 33, 35]] : [[12, 15, 18, 20, 24, 30, 36, 40, 42, 45, 48, 50, 54, 56, 60, 72], [14, 16, 18, 21, 22, 24, 27, 28, 30, 32, 33, 35, 36, 40, 44, 45]], (p, q) => (prime ? gcd(p, q) === 1 : gcd(p, q) >= 2 && gcd(p, q) < Math.min(p, q)));
    const g = gcd(p, q), S = ((p - 1) * (q - 1) + g - 1) / 2, term = (k) => fl(over(k * q, p));
    const list = `${term(1)} + ${term(2)} + ${term(3)} + ⋯ + ${term(p - 1)}`;
    if (form === 'parts') {
      const ans = cut(p - g, 2), pt = (k) => `{${over(k * q, p)}}`;
      return {
        topic: FL, rank: 21,
        text: `For a real number t, let ${FRAC_NOTE}. What is ${pt(1)} + ${pt(2)} + ${pt(3)} + ⋯ + ${pt(p - 1)}?`,
        answer: fchoices(d, ans, [cut(p - 1, 2), cut(p, 2), cut(q - 1, 2), cut(p + 1, 2), cut(p - 2, 2), [p - 1, 1]]),
        check: () => { let s = Q(0); for (let k = 1; k < p; k++) s = qadd(s, Q((k * q) % p, p)); return said(s, ans); },
        solution: `Pair k with ${p} − k. The two numbers ${over(`k·${q}`, p)} and ${over(`(${p} − k)·${q}`, p)} add up to the whole number ${q}, and neither is a whole number, so their fractional parts add up to exactly 1. Adding this over all k from 1 to ${p - 1} counts each term twice, so twice the sum is ${p - 1}, and the sum is <b>${fr(ans)}</b>.`,
      };
    }
    const ans = S, wrong = prime ? [(p - 1) * (q - 1), ((p - 1) * q) / 2, (p * (q - 1)) / 2, ((p + 1) * (q - 1)) / 2, (p * q) / 2, ans + 1].filter(Number.isInteger) : [((p - 1) * (q - 1)) / 2, ((p - 1) * (q - 1) + g) / 2, ((p - 1) * q) / 2, ans + g, ans - 1, ans + 1].map(Math.floor);
    return {
      topic: FL, rank: prime ? 20 : 23,
      text: `What is ${list}?`,
      answer: fchoices(d, ans, wrong),
      check: () => { let s = 0; for (let k = 1; k < p; k++) s += Math.floor((k * q) / p); return s === ans ? true : `adding gives ${s}`; },
      solution: `Pair the term with k and the term with ${p} − k. The two fractions add up to exactly ${q}: ${over(`k·${q}`, p)} + ${over(`(${p} − k)·${q}`, p)} = ${q}. `
        + (prime
          ? `Since ${p} and ${q} share no factor, neither fraction is a whole number, so their floors add up to ${q} − 1 = ${q - 1}. Adding this over all k from 1 to ${p - 1} counts each term twice, so 2S = ${p - 1}·${q - 1}, and S = <b>${num(ans)}</b>.`
          : `If the fractions aren’t whole numbers, their floors add up to ${q} − 1 = ${q - 1}, and if they are whole numbers, to ${q}. Since ${p} and ${q} have greatest common divisor ${g}, k·${q}/${p} is a whole number exactly when k is a multiple of ${p / g}, and ${g - 1} value${g === 2 ? '' : 's'} of k from 1 to ${p - 1} ${g === 2 ? 'is' : 'are'}. Going through all k from 1 to ${p - 1} counts each term twice: 2S = ${p - 1}·${q - 1} + ${g - 1} = ${num(2 * S)}. So S = <b>${num(ans)}</b>.`),
    };
  },
  // how many different values: the list is gapless up to a point and all different after it
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['squares', 'divide']);
    if (form === 'squares') {
      const [N, frac0] = pick(c2, 'floor-list', [[100, 120, 150, 200, 240, 300, 360, 400, 450, 500, 600, 800, 1000, 1200, 101, 151, 201, 301, 501, 801], [1, 1, 2]], (N, f) => f === 1 || N % 2 === 0);
      const M = frac0 === 1 ? N : (3 * N) / 2, K = Math.ceil((N - 1) / 2), low = Math.floor((K * K) / N), ans = low + 1 + (M - K), top = Math.floor((M * M) / N);
      return {
        topic: FL, rank: 23,
        text: `How many different numbers are in the list ${fl(over('1<sup>2</sup>', num(N)))}, ${fl(over('2<sup>2</sup>', num(N)))}, ${fl(over('3<sup>2</sup>', num(N)))}, …, ${fl(over(`${num(M)}<sup>2</sup>`, num(N)))}?`,
        answer: fchoices(d, ans, [M, top + 1, top, low + 1, M - K, ans + 1, ans - 1]),
        check: () => { const got = new Set(); for (let k = 1; k <= M; k++) got.add(Math.floor((k * k) / N)); return got.size === ans ? true : `found ${got.size}`; },
        solution: `Compare neighbors: ${over('(k + 1)<sup>2</sup>', num(N))} − ${over('k<sup>2</sup>', num(N))} = ${over('2k + 1', num(N))}. This is less than 1 when 2k + 1 is less than ${num(N)}, and at least 1 from k = ${num(K)} on. `
          + `So up to k = ${num(K)} the floors go up by 0 or 1 at each step, with no value skipped, and they start at 0. At k = ${num(K)} the floor is ${fl(over(`${num(K * K)}`, num(N)))} = ${num(low)}, so this part gives all ${num(low + 1)} numbers from 0 to ${num(low)}. `
          + `After that the numbers inside grow by at least 1 at each step, so each of the remaining ${num(M - K)} terms (k = ${num(K + 1)} to ${num(M)}) gives a new floor. The total is ${num(low + 1)} + ${num(M - K)} = <b>${num(ans)}</b>.`,
      };
    }
    const [N] = pick(c2, 'floor-div', [[100, 110, 120, 130, 150, 180, 200, 210, 240, 300, 350, 360, 400, 420, 500, 550, 600, 700, 1000, 1056, 1200, 2000]]);
    const s = isqrt(N), big = s * (s + 1) <= N, ans = 2 * s - (big ? 0 : 1);
    return {
      topic: FL, rank: 22,
      text: `How many different numbers are in the list ${fl(over(num(N), 1))}, ${fl(over(num(N), 2))}, ${fl(over(num(N), 3))}, …, ${fl(over(num(N), num(N)))}?`,
      answer: fchoices(d, ans, [2 * s, 2 * s - 1, 2 * s + 1, s, s + 1, Math.floor(N / 2) + 1, 2 * s - 2]),
      check: () => { const got = new Set(); for (let k = 1; k <= N; k++) got.add(Math.floor(N / k)); return got.size === ans ? true : `found ${got.size}`; },
      solution: `Since ${s}<sup>2</sup> ≤ ${num(N)} and ${s + 1}<sup>2</sup> is more than ${num(N)}, split the list at k = ${s}. For k = 1 to ${s}, neighbors differ by ${over(num(N), 'k(k + 1)')}, which is at least 1 here, so these ${s} floors are all different, and the last of them is ${fl(`${num(N)}/${s}`)} = ${Math.floor(N / s)}. `
        + `For k from ${s + 1} on, neighbors differ by less than 1, so the floors come down without skipping a value, all the way to 1, starting from ${fl(`${num(N)}/${s + 1}`)} = ${Math.floor(N / (s + 1))}. That part gives every number from 1 to ${Math.floor(N / (s + 1))}. `
        + `All of those are below ${Math.floor(N / s)}, so the two parts don’t overlap. The total is ${s} + ${Math.floor(N / (s + 1))} = <b>${num(ans)}</b>.`,
    };
  },
  // floors of huge numbers: a division that nearly comes out, and a number with a small conjugate
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['bigdiv', 'conjugate']);
    if (form === 'bigdiv') {
      const [a, m, c] = pick(c2, 'bigdiv', [[5, 8, 10, 12, 15, 20, 25, 30, 40, 50], [2, 3, 4, 5], [2, 3, 4, 6, 7, 8, 9]], (a, m, c) => c ** m < 10 ** a + c && !(a === 100) && m * a <= 200);
      const last = (-c) ** (m - 1), odd = m % 2 === 1, value = odd ? last - 1 : last, mod = (v) => ((v % 100) + 100) % 100, ans = mod(value);
      const coeffs = range(0, m - 1).map((j) => (-c) ** (m - 1 - j)), qText = poly(coeffs, 'y');
      const lab = (v) => [v, two(v)], wrongs = [mod(last), mod(last + 1), mod(-last), mod(-value), mod(c ** m), mod(value + c), mod(value - c), mod(value + 10), mod(value - 10), mod(value + 20), mod(value + 50), mod(value + 1), mod(value - 1)];
      const y = `10<sup>${a}</sup>`, top = `10<sup>${m * a}</sup>`;
      return {
        topic: FL, rank: 23,
        text: `What are the last two digits of the integer ${fl(over(top, `${y} + ${c}`))}?`,
        answer: tchoices(lab(ans), wrongs.map(lab)),
        check: () => {
          const v = 10n ** BigInt(m * a) / (10n ** BigInt(a) + BigInt(c));
          return Number(v % 100n) === ans ? true : `dividing gives last digits ${v % 100n}`;
        },
        solution: `Let y = ${y}, so the number inside is ${over(sup('y', m), `y + ${c}`)}. Dividing polynomials, ${sup('y', m)} = (y + ${c})(${qText})${odd ? ` − ${num(c ** m)}` : ` + ${num(c ** m)}`}. So the fraction is ${qText} ${odd ? '−' : '+'} ${over(num(c ** m), `y + ${c}`)}, and this last fraction is between 0 and 1 because y is huge. `
          + (odd ? `Taking away a number between 0 and 1 from a whole number, the floor is one less: (${qText}) − 1. ` : `Adding a number between 0 and 1 to a whole number doesn’t change the floor, so the floor is ${qText}. `)
          + `Every term with a power of y ends in at least two zeros, so only what comes after them matters: ${value < 0 ? `a number ending in 00, minus ${num(-value)}, ends in ${two(ans)}` : `the last two digits are those of ${num(last)} − 1 = ${num(value)}`}. So the answer is <b>${two(ans)}</b>.`,
      };
    }
    const FAM = [[2, 3], [3, 8], [4, 15], [5, 24], [3, 7], [2, 2], [3, 5], [1, 2], [2, 5], [3, 10], [4, 17], [4, 14], [5, 23]];
    const cycle = (a, b) => { const norm = a * a - b, seen = new Map(), out = []; let u = 2 % 10, v = (2 * a) % 10; for (;;) { const key = `${u},${v}`; if (seen.has(key)) return { start: seen.get(key), out }; seen.set(key, out.length); out.push(u); [u, v] = [v, (((2 * a * v - norm * u) % 10) + 10) % 10]; } };
    const [[a, b], N] = pick(c2, 'conjugate', [FAM, [50, 51, 77, 100, 101, 200, 201, 256, 300, 365, 500, 501, 999, 1000, 2025, 2026]], ([a, b]) => { const C = cycle(a, b); return C.start === 0 && C.out.length <= 12; });
    const norm = a * a - b, C = cycle(a, b), P = C.out.length, Sdigit = C.out[N % P], smallNeg = a - Math.sqrt(b) < 0, oddPow = N % 2 === 1, drop = !(smallNeg && oddPow), ans = ((Sdigit - (drop ? 1 : 0)) % 10 + 10) % 10;
    const y = `(${a} − √${b})`, rec = `${2 * a}${sub('S', 'n')} ${norm < 0 ? '+' : '−'} ${Math.abs(norm) === 1 ? '' : Math.abs(norm)}${sub('S', 'n−1')}`;
    return {
      topic: FL, rank: smallNeg ? 24 : 23,
      text: `What is the units digit of ${fl(`(${a} + √${b})<sup>${N}</sup>`)}?`,
      answer: choices(d, ans, [Sdigit, (Sdigit + (drop ? 9 : 1)) % 10 === ans ? (ans + 1) % 10 : (Sdigit + 9) % 10, (ans + 2) % 10, (ans + 3) % 10, (ans + 5) % 10, (ans + 7) % 10]),
      check: () => {
        // (a + √b)^N = A + B√b exactly, and ⌊B√b⌋ is the integer square root of bB²
        let A = 1n, Bq = 0n;
        const aa = BigInt(a), bb = BigInt(b);
        for (let i = 0; i < N; i++) [A, Bq] = [A * aa + Bq * bb, A + Bq * aa];
        const v = A + bisqrt(bb * Bq * Bq);
        return Number(v % 10n) === ans ? true : `the exact power has units digit ${v % 10n}`;
      },
      solution: `Let x = ${a} + √${b} and y = ${a} − √${b}. They are the roots of t<sup>2</sup> − ${2 * a}t${signed(norm)} = 0, so ${sub('S', 'n')} = x<sup>n</sup> + y<sup>n</sup> follows the rule ${sub('S', 'n+1')} = ${rec}, starting from ${sub('S', 0)} = 2 and ${sub('S', 1)} = ${2 * a}. So every ${sub('S', 'n')} is a whole number. `
        + `Also y is between ${smallNeg ? '−1 and 0' : '0 and 1'}, so y<sup>${N}</sup> is tiny and ${smallNeg && oddPow ? 'negative' : 'positive'}. So x<sup>${N}</sup> = ${sub('S', num(N))} − y<sup>${N}</sup> is ${drop ? 'just below' : 'just above'} the whole number ${sub('S', num(N))}, and its floor is ${drop ? `${sub('S', num(N))} − 1` : sub('S', num(N))}. `
        + `The units digits of ${sub('S', 0)}, ${sub('S', 1)}, ${sub('S', 2)}, … are ${C.out.join(', ')}, repeating every ${P} terms. Since ${num(N)} leaves remainder ${N % P} when divided by ${P}, ${sub('S', num(N))} ends in ${Sdigit}. So the floor ends in <b>${ans}</b>.`,
    };
  },
];

// ======================================================================================================================
// Big powers and modular arithmetic: last digits by the binomial theorem, the exact power of a prime in aᴺ − 1, Wilson's
// theorem, sums of powers mod a prime, and n raised to the power n
// ======================================================================================================================
const MD = 'Big powers and modular arithmetic';
const mpow = (b, e, m) => { let r = 1n, x = BigInt(b) % BigInt(m), k = BigInt(e); const M = BigInt(m); while (k > 0n) { if (k & 1n) r = (r * x) % M; x = (x * x) % M; k >>= 1n; } return Number(r); };
const vp = (n, p) => { let c = 0; while (n % p === 0) { n /= p; c++; } return c; };
const bvp = (x, p) => { let c = 0; const P = BigInt(p); while (x % P === 0n) { x /= P; c++; } return c; };
const three = (v) => String(v).padStart(3, '0');
const m1000 = (v) => ((v % 1000) + 1000) % 1000;
const lab3 = (v) => [v, three(v)];
// five choices for last three digits: the slips first, then near misses in the hundreds and tens
const digits3 = (ans, wrongs) => tchoices(lab3(ans), [...wrongs, ...[100, 200, 300, 500, 400, 600, 10, 20, 50].map((k) => m1000(ans + k))].map(lab3));
const invMod = (a, p) => range(1, p - 1).find((t) => (t * a) % p === 1);
const NEARS = [123, 205, 250, 317, 450, 512, 625, 777, 1001, 1024, 1250, 1500, 2025, 2026, 2027, 2030];

const powers = [
  // the last three digits: the binomial theorem around a multiple of 10, around 7⁴ = 2401 or 3⁴ = 81, and Euler's theorem
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['near10', 'near1', 'euler']);
    if (form === 'near10') {
      const [k, e, N] = pick(c2, 'near10', [range(1, 9), [1, -1], NEARS], (k, e, N) => !(k === 1 && e === -1 && N < 300));
      const b = 10 * k + e, s = (j) => (e === 1 || (N - j) % 2 === 0 ? 1 : -1), C2 = choose(N, 2), t0 = s(0), t1 = N * s(1) * 10 * k, t2 = C2 * s(2) * 100 * k * k, ans = m1000(t0 + t1 + t2);
      return {
        topic: MD, rank: 17,
        text: `What are the last three digits of ${sup(b, num(N))}?`,
        answer: digits3(ans, [m1000(t0 + t1), m1000(t0 + t1 - t2), m1000(t0 - t1 + t2), m1000(-t0 + t1 + t2), m1000(t0 + t1 + (2 * t2)), m1000(t0 + N * N * s(2) * 100 * k * k + t1)]),
        check: () => (mpow(b, N, 1000) === ans ? true : `the power ends in ${mpow(b, N, 1000)}`),
        solution: `Write ${b} = ${e === 1 ? `1 + ${10 * k}` : `−1 + ${10 * k}`} and use the binomial theorem. Every term with ${10 * k} to the third power or higher ends in 000, so only three terms matter: ${e === 1 ? '1' : `(−1)<sup>${N}</sup>`} + ${num(N)}·${e === 1 ? '' : `(−1)<sup>${N - 1}</sup>·`}${10 * k} + ${over(`${num(N)}·${num(N - 1)}`, 2)}·${e === 1 ? '' : `(−1)<sup>${N - 2}</sup>·`}${10 * k}<sup>2</sup>. `
          + `These are ${num(t0)}, ${num(t1)} and ${num(t2)}, which add up to ${num(t0 + t1 + t2)}. ${t0 + t1 + t2 < 0 ? `Adding a multiple of 1000 to make it positive doesn’t change the remainder, and ${num(t0 + t1 + t2)} + ${num(ans - (t0 + t1 + t2))} = ${num(ans)}. So the last three digits are` : 'So the last three digits are'} <b>${three(ans)}</b>.`,
      };
    }
    if (form === 'near1') {
      const [b, N] = pick(c2, 'near1', [[7, 3], [201, 303, 407, 502, 650, 702, 809, 1006, 1103, 1201, 1502, 2001, 2026, 2027, 2030, 2402]], (b, N) => { const q = (N - N % 4) / 4; return b === 3 || q % 5 !== 0; });
      const r = N % 4, q = (N - r) / 4, base = b ** r, core = b === 7 ? m1000(1 + 400 * q) : m1000(1 + 80 * q + (((q * (q - 1)) / 2) * 400));
      const ans = m1000(core * base), first = m1000(1 + 80 * q), noR = core;
      return {
        topic: MD, rank: b === 7 ? 18 : 19,
        text: `What are the last three digits of ${sup(b, num(N))}?`,
        answer: digits3(ans, [m1000(first * base), noR, m1000(core * b ** ((r + 1) % 4)), m1000(core * b ** ((r + 3) % 4))]),
        check: () => (mpow(b, N, 1000) === ans ? true : `the power ends in ${mpow(b, N, 1000)}`),
        solution: (b === 7
          ? `Start from a power of 7 close to a round number: 7<sup>4</sup> = 2401. Since ${num(N)} = 4·${num(q)} + ${r}, ${sup(7, num(N))} = 2401<sup>${q}</sup>·${base}. By the binomial theorem (1 + 2400)<sup>${q}</sup> = 1 + ${num(q)}·2400 + terms with 2400<sup>2</sup>, and those end in 000. So 2401<sup>${q}</sup> ends like 1 + ${num(q)}·400, which is ${three(core)}. `
          : `Start from a power of 3 close to a round number: 3<sup>4</sup> = 81. Since ${num(N)} = 4·${num(q)} + ${r}, ${sup(3, num(N))} = 81<sup>${q}</sup>·${base}. By the binomial theorem (1 + 80)<sup>${q}</sup> = 1 + ${num(q)}·80 + C(${num(q)}, 2)·6400 + terms with 80<sup>3</sup>, and those end in 000. Here C(${num(q)}, 2)·6400 ends like ${num((q * (q - 1)) / 2)}·400, so 81<sup>${q}</sup> ends in ${three(core)}. `)
          + (r === 0 ? `So the last three digits are <b>${three(ans)}</b>.` : `Multiplying by ${base}, the last three digits are those of ${three(core)}·${base}, which are <b>${three(ans)}</b>.`),
      };
    }
    const [b, t, r] = pick(c2, 'euler', [[2, 4, 6, 8, 12, 14, 16, 18], [11, 14, 17, 20, 23, 28, 31, 39], [3, 4, 5, 6, 7]], (b, t, r) => b ** r > 1000 || r >= 3);
    const N = 100 * t + r, ans = m1000(b ** r), wrong = [m1000(ans + 500), m1000(b ** (r + 1)), m1000(b ** (r - 1)), 1, ans % 100, m1000(b ** (r + 2)), m1000(ans + 250)];
    return {
      topic: MD, rank: 19,
      text: `What are the last three digits of ${sup(b, num(N))}?`,
      answer: digits3(ans, wrong),
      check: () => (mpow(b, N, 1000) === ans ? true : `the power ends in ${mpow(b, N, 1000)}`),
      solution: `Find the remainders mod 8 and mod 125 separately, since 1000 = 8·125. Mod 125: ${b} shares no factor with 5, and Euler’s theorem says ${b}<sup>100</sup> leaves remainder 1 when divided by 125 (100 numbers below 125 share no factor with 125). So ${sup(b, num(N))} = (${b}<sup>100</sup>)<sup>${t}</sup>·${sup(b, r)} leaves the same remainder as ${sup(b, r)}. `
        + `Mod 8: ${b} is even and both exponents are at least 3, so ${sup(b, num(N))} and ${sup(b, r)} are both multiples of 8. So ${sup(b, num(N))} and ${sup(b, r)} = ${num(b ** r)} leave the same remainder mod 8 and mod 125, and so mod 1000. The last three digits are <b>${three(ans)}</b>.`,
    };
  },
  // the exact power of a prime dividing aᴺ − 1
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['odd', 'two', 'order', 'zeros']);
    if (form === 'odd') {
      const PAIRS = [[4, 3], [7, 3], [10, 3], [13, 3], [19, 3], [28, 3], [6, 5], [11, 5], [26, 5], [16, 5], [8, 7], [15, 7], [50, 7], [12, 11], [23, 11], [14, 13]];
      const [[a, p], N] = pick(c2, 'lte-odd', [PAIRS, [25, 49, 50, 75, 98, 121, 125, 147, 169, 242, 243, 250, 338, 343, 375, 405, 484, 486, 500, 625, 686, 729, 750, 847, 875, 891, 1000, 1089, 1125, 1183, 1215, 1250, 1331, 1458, 1701, 1875, 2025, 2187, 2197]], ([a, p], N) => vp(N, p) >= 2);
      const e = vp(a - 1, p), v = vp(N, p), ans = e + v, rest = N / p ** v;
      return {
        topic: MD, rank: 21,
        text: `What is the largest integer k such that ${sup(p, 'k')} divides ${sup(a, num(N))} − 1?`,
        answer: fchoices(d, ans, [v, e, e * v, ans + 1, ans - 1, Math.floor(Math.log(N) / Math.log(p)) + e + 1, e + v + 2]),
        check: () => { const got = bvp(BigInt(a) ** BigInt(N) - 1n, p); return got === ans ? true : `the power of ${p} is ${got}`; },
        solution: `Write ${a} = 1 + x, where x = ${a - 1} has exactly ${e} factor${e === 1 ? '' : 's'} of ${p}. For a power n, (1 + x)<sup>n</sup> − 1 = nx + C(n, 2)x<sup>2</sup> + C(n, 3)x<sup>3</sup> + ⋯. For the odd prime ${p}, every term after the first has more factors of ${p} than nx does. So ${a}<sup>n</sup> − 1 has exactly as many factors of ${p} as nx: ${e} plus the number of factors of ${p} in n. `
          + `Here ${num(N)} = ${sup(p, v)}${rest === 1 ? '' : `·${num(rest)}`}, so it has ${v} factors of ${p}. So k = ${e} + ${v} = <b>${ans}</b>.`,
      };
    }
    if (form === 'two') {
      const [a, N] = pick(c2, 'lte-two', [[3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 31, 33], [16, 32, 48, 64, 80, 96, 128, 160, 192, 256, 320, 384, 512, 640, 768, 1024, 1280, 1536, 2048]]);
      const v1 = vp(a - 1, 2), v2 = vp(a + 1, 2), vn = vp(N, 2), ans = v1 + v2 + vn - 1, m = N / 2 ** vn;
      return {
        topic: MD, rank: 23,
        text: `What is the largest integer k such that ${sup(2, 'k')} divides ${sup(a, num(N))} − 1?`,
        answer: fchoices(d, ans, [v1 + vn, v1 + v2 + vn, v1 + vn - 1, v1 * vn, vn, ans + 2, ans - 2]),
        check: () => { const got = bvp(BigInt(a) ** BigInt(N) - 1n, 2); return got === ans ? true : `the power of 2 is ${got}`; },
        solution: `Let b = ${m === 1 ? a : sup(a, m)}, so ${sup(a, num(N))} − 1 = ${sup('b', sup(2, vn))} − 1. Difference of squares, again and again, factors this as (b − 1)(b + 1)(b<sup>2</sup> + 1)(b<sup>4</sup> + 1)⋯(${sup('b', sup(2, vn - 1))} + 1). `
          + `Every bracket from b<sup>2</sup> + 1 on is 2 more than a multiple of 4, because an odd square leaves remainder 1 when divided by 4. So each of those ${vn - 1} brackets has exactly one factor of 2. `
          + (m === 1 ? '' : `Since ${m} is odd, b − 1 = ${a}<sup>${m}</sup> − 1 has the same factors of 2 as ${a} − 1, and b + 1 the same as ${a} + 1. `)
          + `Now ${a} − 1 = ${a - 1} has ${v1} factor${v1 === 1 ? '' : 's'} of 2, and ${a} + 1 = ${a + 1} has ${v2}. So k = ${v1} + ${v2} + ${vn - 1} = <b>${ans}</b>.`,
      };
    }
    if (form === 'order') {
      const [a, K] = pick(c2, 'lte-order', [[11, 21, 31, 41, 51, 61, 71, 81, 91, 101, 151, 201, 251, 301, 401, 501, 751, 1001], [3, 4, 5, 6]], (a, K) => { const v5 = vp(a - 1, 5), v2 = vp(a - 1, 2); return v5 < K && v2 < K; });
      const v5 = vp(a - 1, 5), v21 = vp(a - 1, 2), v22 = vp(a + 1, 2), need5 = K - v5, need2 = Math.max(1, K - v21 - v22 + 1), ans = 5 ** need5 * 2 ** need2;
      return {
        topic: MD, rank: 18,
        text: `What is the smallest positive integer n such that ${sup(10, K)} divides ${sup(a, 'n')} − 1?`,
        answer: fchoices(d, ans, [5 ** need5, 2 ** need2, 5 ** K * 2 ** K, 5 ** need5 * 2 ** (K - v21), 5 ** (need5 + 1) * 2 ** need2, 5 ** need5 * 2 ** (need2 + 1), 10 ** (K - 1)]),
        check: () => {
          const M = 10 ** K;
          let v = a % M, n = 1;
          while (v !== 1) { v = (v * (a % M)) % M; n++; }
          return n === ans ? true : `the powers first reach remainder 1 at n = ${n}`;
        },
        solution: `We need n to give at least ${K} factors of 5 and at least ${K} factors of 2 in ${sup(a, 'n')} − 1. For 5: ${a - 1} has ${v5} factor${v5 === 1 ? '' : 's'} of 5, and (1 + x)<sup>n</sup> − 1 = nx + C(n, 2)x<sup>2</sup> + ⋯ has as many factors of the odd prime 5 as nx does. So n needs at least ${K} − ${v5} = ${need5} factor${need5 === 1 ? '' : 's'} of 5. `
          + `For 2: if n is odd, ${sup(a, 'n')} − 1 = (${a} − 1)(an odd sum), which has only ${v21} factor${v21 === 1 ? '' : 's'} of 2, too few. If n is even, differences of squares give the number of factors of 2 as (those in ${a - 1}) + (those in ${a + 1}) + (those in n) − 1 = ${v21} + ${v22} + (those in n) − 1. So n needs ${need2} factor${need2 === 1 ? '' : 's'} of 2. `
          + `So the smallest n is ${sup(5, need5)}·${sup(2, need2)} = <b>${num(ans)}</b>.`,
      };
    }
    const [a, N] = pick(c2, 'lte-zeros', [[11, 21, 31, 41, 51, 61, 71, 81, 91, 101, 151, 201, 251, 301, 401, 501, 751, 1001], [10, 20, 25, 40, 50, 80, 100, 125, 200, 250, 400, 500, 625, 800, 1000, 1250, 2000]]);
    const v5 = vp(a - 1, 5) + vp(N, 5), odd = N % 2 === 1, v2 = odd ? vp(a - 1, 2) : vp(a - 1, 2) + vp(a + 1, 2) + vp(N, 2) - 1, ans = Math.min(v2, v5);
    const two2 = odd ? `${num(N)} is odd, so ${sup(a, num(N))} − 1 = (${a} − 1)(an odd sum of ${num(N)} odd numbers), which has as many factors of 2 as ${a - 1}: ${v2}.`
      : `Since ${num(N)} is even, write it as ${sup(2, vp(N, 2))}·${N / 2 ** vp(N, 2)} and factor by differences of squares, as with any odd base: the factors of 2 come to (those in ${a - 1}) + (those in ${a + 1}) + ${vp(N, 2)} − 1 = ${vp(a - 1, 2)} + ${vp(a + 1, 2)} + ${vp(N, 2)} − 1 = ${v2}.`;
    return {
      topic: MD, rank: 23,
      text: `How many zeros does the integer ${sup(a, num(N))} − 1 end with?`,
      answer: fchoices(d, ans, [Math.max(v2, v5), v5, v2, v2 + v5, ans + 1, ans - 1, vp(a - 1, 5) + vp(a - 1, 2)].filter((w) => w !== ans)),
      check: () => { const s = (BigInt(a) ** BigInt(N) - 1n).toString(); let z = 0; while (s[s.length - 1 - z] === '0') z++; return z === ans ? true : `it ends with ${z} zeros`; },
      solution: `The number of zeros at the end is the smaller of the numbers of factors of 2 and of 5. For 5: ${a} = 1 + ${a - 1}, and ${a - 1} has ${vp(a - 1, 5)} factor${vp(a - 1, 5) === 1 ? '' : 's'} of 5. In (1 + x)<sup>n</sup> − 1 = nx + C(n, 2)x<sup>2</sup> + ⋯ the first term has the fewest factors of the odd prime 5, so the count is ${vp(a - 1, 5)} + (the number in ${num(N)}) = ${vp(a - 1, 5)} + ${vp(N, 5)} = ${v5}. `
        + `For 2: ${two2} So the number of zeros is the smaller of ${v2} and ${v5}, which is <b>${ans}</b>.`,
    };
  },
  // Wilson's theorem: (p − 1)! leaves remainder p − 1, and what follows from it
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['factorial', 'telescope']);
    const PR = [17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113];
    const [p, j] = pick(c2, `wilson-${form}`, [PR, form === 'factorial' ? [3, 4, 5, 6] : [2, 3, 4, 5]]);
    const fact2 = Number(fact(j - 1)), sg = j % 2 === 0 ? 1 : -1, inv = invMod(fact2 % p, p), value = ((sg * inv) % p + p) % p;     // (p − j)! ≡ (−1)^j / (j − 1)!
    const m = (x) => ((x % p) + p) % p, why = (J) => `By Wilson’s theorem ${p - 1}! leaves remainder ${p - 1}, that is, −1, when divided by ${p}. Also ${p - 1}! = ${p - J}!·${range(p - J + 1, p - 1).join('·')}, and those last ${J - 1} numbers leave remainders ${range(1, J - 1).map((t) => `−${t}`).reverse().join(', ')}.`;
    const sgnText = (J) => (J % 2 === 0 ? `−${Number(fact(J - 1))}` : `${Number(fact(J - 1))}`);
    if (form === 'factorial') {
      const ans = value, target = `${sgnText(j)}·${p - j}!`, t = inv, k0 = (fact2 * t - 1) / p;
      return {
        topic: MD, rank: 20,
        text: `What is the remainder when ${p - j}! is divided by ${p}?`,
        answer: fchoices(d, ans, [m(-ans), inv === ans ? m(ans + 1) : inv, p - 1, 1, fact2 % p, m(ans + 1), m(ans - 1)]),
        check: () => { let r = 1; for (let k = 2; k <= p - j; k++) r = (r * k) % p; return r === ans ? true : `multiplying gives ${r}`; },
        solution: `${why(j)} So ${target} leaves the same remainder as −1${j % 2 === 0 ? `, which means ${fact2}·${p - j}! leaves remainder 1` : `, which means ${fact2}·${p - j}! leaves remainder ${p - 1}`}. `
          + `Now ${fact2}·${t} = ${num(fact2 * t)} = ${k0}·${p} + 1, so ${t} acts as 1/${fact2} mod ${p}. Multiplying by it, ${p - j}! leaves the same remainder as ${sg === 1 ? t : `−${t}`}. So the remainder is <b>${num(ans)}</b>.`,
      };
    }
    const top = p - j, ans = m(value2(p, j) - 1);
    const expl = j === 2 ? `By Wilson’s theorem ${p - 1}! leaves remainder ${p - 1}.` : j === 3 ? `By Wilson’s theorem ${p - 1}! leaves remainder −1, and ${p - 1}! = ${p - 2}!·${p - 1} where ${p - 1} acts as −1, so ${p - 2}! leaves remainder 1.`
      : `${why(j)} So ${sgnText(j)}·${top + 1}! acts as −1, which gives ${top + 1}! the remainder ${value2(p, j)}.`;
    return {
      topic: MD, rank: 22,
      text: `What is the remainder when 1·1! + 2·2! + 3·3! + ⋯ + ${top}·${top}! is divided by ${p}?`,
      answer: fchoices(d, ans, [m(ans + 1), m(ans + 2), m(ans - 1), p - 1, top % p, m(-ans), 0].filter((w) => w !== ans)),
      check: () => { let s = 0, f = 1; for (let k = 1; k <= top; k++) { f = (f * k) % p; s = (s + k * f) % p; } return s === ans ? true : `adding gives ${s}`; },
      solution: `The sum telescopes: k·k! = (k + 1)! − k!. So the sum is ${top + 1}! − 1! = ${top + 1}! − 1. ${expl} So the sum leaves remainder ${value2(p, j)} − 1, which is <b>${num(ans)}</b>.`,
    };
  },
  // long sums of powers: Fermat turns a block of p − 1 terms into 0 or p − 1, and odd powers pair up
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['vanish', 'oddpair', 'block']);
    if (form === 'oddpair') {
      const [M, e] = pick(c2, 'oddpair', [[6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 102, 202, 12, 20, 100, 21, 25, 99], [99, 101, 301, 505, 777, 999, 2025, 2027]]);
      const m = M / 2, even = M % 2 === 0, ans = even && m % 2 === 1 ? m : 0, n = M - 1;
      return {
        topic: MD, rank: 13,
        text: `What is the remainder when ${sup(1, num(e))} + ${sup(2, num(e))} + ${sup(3, num(e))} + ⋯ + ${sup(n, num(e))} is divided by ${M}?`,
        answer: fchoices(d, ans, [even ? (ans === m ? 0 : m) : Math.floor(M / 2), 1, M - 1, 2, even ? m + 1 : Math.floor(M / 2) + 1, M - 2]),
        check: () => { let s = 0; for (let k = 1; k <= n; k++) s = (s + mpow(k, e, M)) % M; return s === ans ? true : `adding gives ${s}`; },
        solution: `Pair k with ${M} − k. Since ${num(e)} is odd, ${sup('k', num(e))} + (${M} − k)<sup>${e}</sup> is a multiple of k + (${M} − k) = ${M}, so each pair leaves remainder 0. `
          + (even
            ? `The middle term, k = ${m}, has no partner. ${m % 2 === 1
              ? `Now ${m} is odd, and ${m}<sup>2</sup> − ${m} = ${m}·${m - 1} is a multiple of ${M}, so every power of ${m} leaves the remainder ${m}. So the sum leaves remainder <b>${num(ans)}</b>.`
              : `Now ${m} is even, so ${m}<sup>2</sup> = ${m}·${m} is already a multiple of ${M}, and so is the higher power ${sup(m, num(e))}. So the sum leaves remainder <b>0</b>.`}`
            : `With ${M} odd, every term has a partner, so the sum leaves remainder <b>0</b>.`),
      };
    }
    const PR = [5, 7, 11, 13, 17, 19, 23];
    if (form === 'block') {
      const [p, t, N] = pick(c2, 'fermat-block', [PR, [10, 20, 30, 50, 100], FARS]);
      const e = (p - 1) * t, nonMult = N - Math.floor(N / p), ans = nonMult % p;
      return {
        topic: MD, rank: 19,
        text: `What is the remainder when ${sup(1, num(e))} + ${sup(2, num(e))} + ${sup(3, num(e))} + ⋯ + ${sup(num(N), num(e))} is divided by ${p}?`,
        answer: fchoices(d, ans, [N % p, Math.floor(N / p) % p, (ans + 1) % p, (ans + p - 1) % p, (ans + 2) % p, 1, 0].filter((w) => w !== ans)),
        check: () => { let s = 0; for (let k = 1; k <= N; k++) s = (s + mpow(k, e, p)) % p; return s === ans ? true : `adding gives ${s}`; },
        solution: `The exponent ${num(e)} is a multiple of ${p - 1}, so by Fermat’s little theorem every base that isn’t a multiple of ${p} gives a power with remainder 1, and every multiple of ${p} gives remainder 0. `
          + `So the sum leaves the same remainder as the number of bases that aren’t multiples of ${p}. Up to ${num(N)} there are ${num(Math.floor(N / p))} multiples of ${p}, which leaves ${num(N)} − ${num(Math.floor(N / p))} = ${num(nonMult)} other bases, and ${num(nonMult)} leaves remainder <b>${num(ans)}</b> when divided by ${p}.`,
      };
    }
    const [p, e, m, r] = pick(c2, 'fermat-vanish', [[7, 11, 13, 17, 19, 23], [201, 303, 505, 607, 1001, 1003, 2025, 2026, 2027, 2029], [5, 10, 20, 30, 40, 50], [2, 3, 4]], (p, e) => e % (p - 1) !== 0);
    const N = m * p + r, e1 = e % (p - 1), parts = range(1, r).map((k) => mpow(k, e1, p)), ans = sum(parts) % p;
    return {
      topic: MD, rank: 23,
      text: `What is the remainder when ${sup(1, num(e))} + ${sup(2, num(e))} + ${sup(3, num(e))} + ⋯ + ${sup(num(N), num(e))} is divided by ${p}?`,
      answer: fchoices(d, ans, [r % p, (N - m) % p, 0, (ans + 1) % p, (p - ans) % p, (ans + 2) % p, 1, (p - 1) % p].filter((w) => w !== ans)),
      check: () => { let s = 0; for (let k = 1; k <= N; k++) s = (s + mpow(k, e, p)) % p; return s === ans ? true : `adding gives ${s}`; },
      solution: `Only remainders mod ${p} matter, so the terms repeat every ${p} bases, and the sum is ${m} full blocks (bases 1 to ${p}, and so on) plus the bases that leave remainder ${orList(range(1, r).map(String))}. `
        + `By Fermat’s little theorem the exponent can be cut down by multiples of ${p - 1}, and ${num(e)} leaves remainder ${e1} when divided by ${p - 1}, so every power can be replaced by the power ${e1}. `
        + `Each full block adds up to 0 mod ${p}. To see this, let T be the sum of the ${ord(e1)} powers of 1, 2, …, ${p - 1}. A polynomial of degree ${e1} has at most ${e1} roots mod ${p}, so some g from 1 to ${p - 1} has ${sup('g', e1)} not leaving remainder 1. Multiplying 1, 2, …, ${p - 1} by g only shuffles their remainders, so ${sup('g', e1)}·T leaves the same remainder as T, and T must leave remainder 0. `
        + `So only the leftover terms ${range(1, r).map((k) => sup(k, e1)).join(' + ')} count, and their remainders are ${listing(parts.map(String))}. So the sum leaves remainder <b>${num(ans)}</b>.`,
    };
  },
  // n raised to the power n: the pattern depends on n mod m and on n in the exponent, so the period is longer than it looks
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['units', 'count']);
    if (form === 'units') {
      const [m, N] = pick(c2, 'selfpower', [[10, 5, 3, 6], FARS], (m, N) => m !== 3 || N % 6 !== 0);
      const P = m === 10 || m === 5 ? 20 : 6, vals = range(1, P).map((n) => mpow(n, n, m)), full = sum(vals), q = Math.floor(N / P), r = N % P, part = sum(vals.slice(0, r)), ans = (q * full + part) % m;
      const sumText = `1<sup>1</sup> + 2<sup>2</sup> + 3<sup>3</sup> + ⋯ + ${sup(num(N), num(N))}`, wrongP = m === 10 ? 10 : m;
      const slip = (Math.floor(N / wrongP) * sum(range(1, wrongP).map((n) => mpow(n, n, m))) + sum(range(1, N % wrongP).map((n) => mpow(n, n, m)))) % m;
      return {
        topic: MD, rank: m === 10 ? 17 : 18,
        text: m === 10 ? `What is the units digit of ${sumText}?` : `What is the remainder when ${sumText} is divided by ${m}?`,
        answer: choices(d, ans, [slip, full % m, part % m, (ans + 1) % m, (ans + m - 1) % m, (ans + 2) % m, (ans + 3) % m, (ans + 4) % m, ans + m, ans + m + 1, ans + m + 2].filter((w) => w !== ans)),
        check: () => { let s = 0; for (let n = 1; n <= N; n++) s = (s + mpow(n, n, m)) % m; return s === ans ? true : `adding gives ${s}`; },
        solution: `The remainder of ${sup('n', 'n')} depends on the base n mod ${m} and on the exponent. Powers of any base repeat their remainders every ${P === 20 ? 4 : 2} steps, so the exponent only matters mod ${P === 20 ? 4 : 2}. So the remainders of ${sup('n', 'n')} repeat every ${P} values of n${P === m ? '' : `, not every ${m}`}. `
          + `For n = 1 to ${P} they are ${vals.join(', ')}, adding up to ${full}. Since ${num(N)} = ${P}·${q} + ${r}, the total is ${q}·${full}${r ? ` + ${part}` : ''} = ${num(q * full + part)}${m === 10 ? ', which has units digit' : `, which leaves remainder`} <b>${ans}</b>${m === 10 ? '' : ` when divided by ${m}`}.`,
      };
    }
    const [p, t, N] = pick(c2, 'selfcount', [[5, 7, 3], ['one', 'minus'], [...FARS, 1234, 1500, 300, 600, 840, 900]], (p, t, N) => p !== 3 || t === 'one');
    const P = p * (p - 1), goal = t === 'one' ? 1 : p - 1, hits = range(1, P).filter((n) => n % p !== 0 && mpow(n, n, p) === goal), q = Math.floor(N / P), r = N % P, part = hits.filter((n) => n <= r).length, ans = q * hits.length + part;
    const what = t === 'one' ? `${sup('n', 'n')} − 1` : `${sup('n', 'n')} + 1`;
    return {
      topic: MD, rank: 21,
      text: `For how many integers n from 1 to ${num(N)} is ${what} a multiple of ${p}?`,
      answer: fchoices(d, ans, [Math.floor(N / p), Math.floor(N / (p - 1)), q * hits.length, (q + 1) * hits.length, Math.floor((N * (p - 1)) / P), ans + 1, ans - 1]),
      check: () => { let c = 0; for (let n = 1; n <= N; n++) if ((mpow(n, n, p) + (t === 'one' ? p - 1 : 1)) % p === 0) c++; return c === ans ? true : `counted ${c}`; },
      solution: `The remainder of ${sup('n', 'n')} when divided by ${p} depends on the base n mod ${p} and, by Fermat’s little theorem, on the exponent n mod ${p - 1}. So the pattern repeats every ${p}·${p - 1} = ${P} values of n. `
        + `Going through n = 1 to ${P} and working out each power, ${sup('n', 'n')} leaves remainder ${goal === 1 ? 1 : `${goal}, that is, −1,`} for n = ${listing(hits.map(String))}, which is ${hits.length} values. `
        + `Since ${num(N)} = ${P}·${q} + ${r}, there are ${q} full patterns and then the numbers up to ${r}, of which ${part} ${part === 1 ? 'is' : 'are'} on the list. So the count is ${q}·${hits.length} + ${part} = <b>${num(ans)}</b>.`,
    };
  },
];
// the remainder of (p − j + 1)! when divided by p
function value2(p, j) { let r = 1; for (let k = 2; k <= p - j + 1; k++) r = (r * k) % p; return r; }

// ======================================================================================================================
// Expected value with states: waiting for a pattern, two patterns racing, walks grouped by distance, and chains where
// the state is a remainder, a gap between two walkers, or what is still missing
// ======================================================================================================================
const EV = 'Expected value with states';
const anN = (n) => (n === 8 || n === 11 || n === 18 ? `an ${n}` : `a ${n}`);
// run a chain forward numerically: step(state) lists [next state, chance], ended(state) names how it finished (or is false).
// The time is the sum of the chances of still running after each step
function runChain(start, step, ended, limit = 1e-13, shrink = (x) => x) {
  let cur = new Map([[start, 1]]), time = 0, mass = 1, guard = 0;
  const ends = {};
  while (mass > limit && guard++ < 300000) {
    time += mass;
    const next = new Map();
    for (const [s, w] of cur) for (const [t, p] of step(s)) { const e = ended(t); if (e) ends[e] = (ends[e] || 0) + w * p; else { const u = shrink(t); next.set(u, (next.get(u) || 0) + w * p); } }
    cur = next;
    mass = 0;
    for (const v of cur.values()) mass += v;
  }
  return { time, ends };
}
const Es = (name) => (name === '' ? 'E' : sub('E', name));
const qfr = (x) => qshow(x);
// "½E₁ + ⅓E₂", from [chance, variable name] pairs
const termsOf = (parts) => parts.map(([p, n]) => (qeq(p, Q(1)) ? n : `${qfr(p)}${n}`)).join(' + ');
// pattern P over faces [[symbol, chance], …]: the states are how much of P the latest results match
function patternSolve(P, faces) {
  const L = P.length, nxt = (i, c) => { const s = P.slice(0, i) + c; for (let k = Math.min(L, s.length); k > 0; k--) if (s.endsWith(P.slice(0, k))) return k; return 0; };
  const rows = range(0, L - 1).map((i) => {
    const row = Array(L + 1).fill(Q(0));
    row[i] = Q(1);
    row[L] = Q(1);
    for (const [c, p] of faces) { const j = nxt(i, c); if (j < L) row[j] = qsub(row[j], p); }
    return row;
  });
  const vals = solveLinear(rows), names = range(0, L - 1).map((i) => Es(P.slice(0, i)));
  const eqs = range(0, L - 1).map((i) => {
    const groups = new Map();
    for (const [c, p] of faces) { const j = nxt(i, c); if (j < L) groups.set(j, qadd(groups.get(j) || Q(0), p)); }
    return `${names[i]} = 1 + ${termsOf([...groups.entries()].sort((x, y) => y[0] - x[0]).map(([j, p]) => [p, names[j]]))}`;
  });
  return { vals, names, eqs, nxt };
}
// the sum of 1/(chance of the first k symbols) over the k where the first k symbols of P are also its last k
function overlapRule(P, faces) {
  let total = Q(0);
  const pr = (c) => faces.find((f) => f[0] === c)[1];
  const used = [];
  for (let k = 1; k <= P.length; k++) if (P.slice(0, k) === P.slice(P.length - k)) { let w = Q(1); for (const c of P.slice(0, k)) w = qmul(w, pr(c)); total = qadd(total, qdiv(Q(1), w)); used.push(k); }
  return { total, used };
}
const flipSteps = (s, faces, keep) => faces.map(([c, p]) => [(s + c).slice(-keep), qf(p)]);
// two patterns racing: the states are the longest end of the flips that starts either pattern
function raceSolve(A, Bp, faces) {
  const prefixes = new Set(['']);
  for (const X of [A, Bp]) for (let k = 1; k < X.length; k++) prefixes.add(X.slice(0, k));
  const states = [...prefixes].sort((x, y) => x.length - y.length || (x < y ? -1 : 1)), idx = new Map(states.map((s, i) => [s, i])), n = states.length;
  const go = (s, c) => { const w = s + c; if (w.endsWith(A)) return 'A'; if (w.endsWith(Bp)) return 'B'; for (let k = w.length; k > 0; k--) if (prefixes.has(w.slice(w.length - k))) return w.slice(w.length - k); return ''; };
  const rowsP = states.map((s, i) => { const row = Array(n + 1).fill(Q(0)); row[i] = Q(1); for (const [c, p] of faces) { const t = go(s, c); if (t === 'A') row[n] = qadd(row[n], p); else if (t !== 'B') row[idx.get(t)] = qsub(row[idx.get(t)], p); } return row; });
  const rowsE = states.map((s, i) => { const row = Array(n + 1).fill(Q(0)); row[i] = Q(1); row[n] = Q(1); for (const [c, p] of faces) { const t = go(s, c); if (t !== 'A' && t !== 'B') row[idx.get(t)] = qsub(row[idx.get(t)], p); } return row; });
  return { states, go, Pv: solveLinear(rowsP), Ev: solveLinear(rowsE) };
}
const HALF = [['H', Q(1, 2)], ['T', Q(1, 2)]];
// a regular solid as lists of neighbors
const SOLIDS = {
  octahedron: () => range(0, 5).map((i) => range(0, 5).filter((j) => j !== i && j !== (i + 3) % 6)),
  cube: () => range(0, 7).map((i) => [i ^ 1, i ^ 2, i ^ 4]),
  icosahedron: () => { const adj = range(0, 11).map(() => []), add = (a, b) => { adj[a].push(b); adj[b].push(a); }; for (let i = 0; i < 5; i++) { add(0, 1 + i); add(1 + i, 1 + ((i + 1) % 5)); add(6 + i, 6 + ((i + 1) % 5)); add(1 + i, 6 + i); add(1 + i, 6 + ((i + 1) % 5)); add(11, 6 + i); } return adj; },
  dodecahedron: () => { const adj = range(0, 19).map(() => []), add = (a, b) => { adj[a].push(b); adj[b].push(a); }; for (let i = 0; i < 5; i++) { add(i, (i + 1) % 5); add(i, 5 + i); add(5 + i, 10 + i); add(10 + i, 5 + ((i + 1) % 5)); add(10 + i, 15 + i); add(15 + i, 15 + ((i + 1) % 5)); } return adj; },
};
const solidCache = new Map();
// the vertices by distance from vertex 0, and the numbers of neighbors nearer, level and farther at each distance
function solidInfo(name) {
  if (solidCache.has(name)) return solidCache.get(name);
  const adj = SOLIDS[name](), dist = adj.map(() => -1), queue = [0];
  dist[0] = 0;
  while (queue.length) { const v = queue.shift(); for (const w of adj[v]) if (dist[w] < 0) { dist[w] = dist[v] + 1; queue.push(w); } }
  const far = Math.max(...dist), deg = adj[0].length, levels = range(1, far).map((j) => { const v = dist.indexOf(j); return { near: adj[v].filter((w) => dist[w] === j - 1).length, same: adj[v].filter((w) => dist[w] === j).length, out: adj[v].filter((w) => dist[w] === j + 1).length, size: dist.filter((x) => x === j).length }; });
  const rows = levels.map((L, i) => { const row = Array(far + 1).fill(Q(0)); row[i] = Q(1); row[far] = Q(1); if (i > 0) row[i - 1] = qsub(row[i - 1], Q(L.near, deg)); row[i] = qsub(row[i], Q(L.same, deg)); if (i + 1 < far) row[i + 1] = qsub(row[i + 1], Q(L.out, deg)); return row; });
  const info = { adj, dist, far, deg, levels, E: solveLinear(rows) };
  solidCache.set(name, info);
  return info;
}

const expected = [
  // waiting for a pattern, on a coin or a die
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['fair', 'biased', 'dice']);
    if (form === 'dice') {
      const [kind, s] = pick(c2, 'dice-pat', [['121', '112', '123', '1212', '1231', '1122', 'run2', 'run3', 'run4'], [4, 6, 8, 10, 12]], (kind, s) => (kind !== 'run4' || s <= 6) && (kind.length < 4 || s <= 6));
      if (kind.startsWith('run')) {
        const r = +kind[3], vals = range(0, r - 1).map((j) => s ** j), ans = sum(vals), rows = range(1, r - 1).map((j) => { const row = Array(r).fill(Q(0)); row[j - 1] = Q(1); row[r - 1] = Q(1); row[0] = qsub(row[0], Q(s - 1, s)); if (j < r - 1) row[j] = qsub(row[j], Q(1, s)); return row; }), Ej = solveLinear(rows), first = qn(qadd(Q(1), Ej[0]))[0];
        const names = range(1, r - 1).map((j) => sub('E', j)), eqs = range(1, r - 1).map((j) => `${names[j - 1]} = 1 + ${qfr(Q(s - 1, s))}${names[0]}${j < r - 1 ? ` + ${qfr(Q(1, s))}${names[j]}` : ''}`);
        return {
          topic: EV, rank: r === 2 ? 14 : 17,
          text: `A fair ${s}-sided die is rolled until the same number comes up ${r === 2 ? 'twice' : r === 3 ? 'three times' : 'four times'} in a row. What is the expected number of rolls?`,
          answer: fchoices(d, ans, [s ** r, s ** (r - 1), ans - 1, ans + 1, r * s, ans + s]),
          check: () => {
            const R = runChain('start', (st) => (st === 'start' ? [[1, 1]] : [[st + 1, 1 / s], [1, (s - 1) / s]]), (st) => (st === r ? 'done' : false));
            return first === ans && near(R.time, ans, 'expected rolls') === true ? true : `running the chain gives ${R.time}`;
          },
          solution: `Only the current run of equal numbers matters, so let ${sub('E', 'j')} be the expected number of further rolls when the current run has length j. From a run of length j, the next roll extends it with chance ${over(1, s)} and otherwise resets it to length 1. So ${eqs.join(', and ')}. `
            + (r === 2 ? '' : `Working from the last equation back, `) + `${sub('E', 1)} = ${qfr(Ej[0])}. The first roll always starts a run of length 1, so the expected number of rolls is 1 + ${qfr(Ej[0])} = <b>${num(ans)}</b>.`,
        };
      }
      const P = kind, syms = [...new Set(P)], faces = [...syms.map((c) => [c, Q(1, s)]), ['x', Q(s - syms.length, s)]], { vals, names, eqs } = patternSolve(P, faces), ans = vals[0], L = P.length;
      const rule = overlapRule(P, faces);
      return {
        topic: EV, rank: 18,
        text: `A fair ${s}-sided die is rolled until the numbers ${[...P].join(', ')} come up on consecutive rolls, in that order. What is the expected number of rolls?`,
        answer: fchoices(d, qn(ans), [s ** L, s ** L + s, sum(range(1, L).map((k) => s ** k)), s ** L + s ** 2, s ** L - s, qn(ans)[0] + 2]),
        check: () => {
          if (!qeq(rule.total, ans)) return 'the overlap rule disagrees';
          if (qf(ans) > 400) return true;     // the two exact ways agree, and following the rolls would take too long
          const R = runChain('', (st) => flipSteps(st, faces, L), (st) => (st === P ? 'done' : false));
          return near(R.time, qf(ans), 'expected rolls', 1e-7);
        },
        solution: `Keep track of how much of the pattern the latest rolls match. Let E be the expected number of rolls from the start, and write ${sub('E', 'w')} for the expected number still to come when the latest rolls end in w, a start of the pattern. Completing the pattern leaves 0 rolls to come. `
          + `One roll from each state gives: ${eqs.join(', ')}. Solving from the last equation back: ${range(1, L - 1).reverse().map((i) => `${names[i]} = ${qfr(vals[i])}`).join(', ')}, and E = <b>${qfr(ans)}</b>.`,
      };
    }
    if (form === 'fair') {
      const [P] = pick(c2, 'coin-fair', [['HTH', 'THT', 'HTHT', 'THTH', 'HHTH', 'HTHH', 'THTT', 'TTHT', 'HHTT', 'TTHH', 'HTHTH', 'THTHT', 'HHTHH', 'TTHTT', 'HTTHT', 'THHTH']]);
      const L = P.length, { vals, names, eqs } = patternSolve(P, HALF), ans = qn(vals[0])[0], used = overlapRule(P, HALF).used;
      return {
        topic: EV, rank: { 3: 14, 4: 16, 5: 18 }[L],
        text: `A fair coin is flipped until the sequence ${P} appears on consecutive flips. What is the expected number of flips?`,
        answer: fchoices(d, ans, [2 ** L, 2 ** (L + 1) - 2, ans + 2, ans - 2, 2 * L, ans + 4]),
        check: () => {
          if (!qeq(overlapRule(P, HALF).total, Q(ans))) return 'the overlap rule disagrees';
          return near(runChain('', (st) => flipSteps(st, HALF, L), (st) => (st === P ? 'done' : false)).time, ans, 'expected flips', 1e-7);
        },
        solution: `Keep track of how much of ${P} the latest flips match. Let E be the expected number of flips from the start, and ${sub('E', 'w')} the expected number still to come when the latest flips end in w, a start of ${P}. Completing ${P} leaves 0 flips to come. A flip that breaks the match may still leave a shorter match, so check each case. `
          + `One flip from each state gives: ${eqs.join(', ')}. Solving from the last equation back: ${range(1, L - 1).reverse().map((i) => `${names[i]} = ${qfr(vals[i])}`).join(', ')}, and E = <b>${num(ans)}</b>. `
          + `(A shortcut gives the same answer: add ${sup(2, 'k')} for each k where the first k letters of ${P} are also its last k letters, here k = ${listing(used.map(String))}.)`,
      };
    }
    const PS = [[1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5]];
    const [ph, P] = pick(c2, 'coin-biased', [PS, ['HTH', 'THT', 'HHT', 'TTH', 'HTT', 'THH', 'HHH', 'TTT', 'HTHT', 'THTH']]);
    const faces = [['H', Q(ph[0], ph[1])], ['T', Q(ph[1] - ph[0], ph[1])]], L = P.length, { vals, names, eqs } = patternSolve(P, faces), ans = vals[0], rule = overlapRule(P, faces);
    const naive = (() => { let w = Q(1); for (const c of P) w = qmul(w, faces.find((f) => f[0] === c)[1]); return qdiv(Q(1), w); })();
    const swapped = overlapRule(P, [['H', faces[1][1]], ['T', faces[0][1]]]).total, prefixSum = range(1, L).reduce((s, k) => { let w = Q(1); for (const c of P.slice(0, k)) w = qmul(w, faces.find((f) => f[0] === c)[1]); return qadd(s, qdiv(Q(1), w)); }, Q(0));
    return {
      topic: EV, rank: L === 3 ? 20 : 21,
      text: `A coin lands heads with probability ${fr(ph)}. It is flipped until the sequence ${P} appears on consecutive flips. What is the expected number of flips?`,
      answer: fchoices(d, qn(ans), [naive, swapped, prefixSum, Q(2 ** L), qadd(ans, Q(1)), qmul(ans, Q(2))].map(qn)),
      check: () => {
        if (!qeq(rule.total, ans)) return 'the overlap rule disagrees';
        return near(runChain('', (st) => flipSteps(st, faces, L), (st) => (st === P ? 'done' : false)).time, qf(ans), 'expected flips', 1e-7);
      },
      solution: `Keep track of how much of ${P} the latest flips match. Let E be the expected number of flips from the start, and ${sub('E', 'w')} the expected number still to come when the latest flips end in w, a start of ${P}. Completing ${P} leaves 0 flips to come. `
        + `One flip from each state, with heads chance ${fr(ph)} and tails chance ${fr([ph[1] - ph[0], ph[1]])}, gives: ${eqs.join(', ')}. Solving from the last equation back: ${range(1, L - 1).reverse().map((i) => `${names[i]} = ${qfr(vals[i])}`).join(', ')}, and E = <b>${qfr(ans)}</b>.`,
    };
  },
  // two patterns racing, and runs with all different numbers
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['who', 'until', 'distinct']);
    if (form === 'distinct') {
      const [s, k] = pick(c2, 'distinct-run', [[3, 4, 5, 6, 8, 10, 12], [3, 4]], (s, k) => k <= s && !(s >= 10 && k === 4));
      const rows = range(1, k - 1).map((j) => { const row = Array(k).fill(Q(0)); row[j - 1] = Q(1); row[k - 1] = Q(1); for (let t = 1; t <= j; t++) row[t - 1] = qsub(row[t - 1], Q(1, s)); if (j + 1 < k) row[j] = qsub(row[j], Q(s - j, s)); return row; });
      const Ej = solveLinear(rows), ans = qadd(Q(1), Ej[0]), names = range(1, k - 1).map((j) => sub('E', j));
      const eqs = range(1, k - 1).map((j) => `${names[j - 1]} = 1 + ${over(1, s)}(${names.slice(0, j).join(' + ')})${j + 1 < k ? ` + ${qfr(Q(s - j, s))}${names[j]}` : ''}`);
      const product = (() => { let w = Q(1); for (let t = 0; t < k; t++) w = qmul(w, Q(s - t, s)); return w; })();
      return {
        topic: EV, rank: 19,
        text: `A fair ${s}-sided die is rolled until the last ${k} rolls are all different. What is the expected number of rolls?`,
        answer: fchoices(d, qn(ans), [qdiv(Q(1), product), qadd(qdiv(Q(1), product), Q(k - 1)), Q(k), qadd(ans, Q(1)), qsub(ans, Q(1)), Q(k + s)].map(qn)),
        check: () => {
          // follow the actual last k − 1 rolls, not the run lengths
          const R = runChain('', (st) => range(1, s).map((f) => [`${st}${st ? ',' : ''}${f}`, 1 / s]), (st) => { const v = st.split(','); return v.length === k && new Set(v).size === k ? 'done' : false; }, 1e-13, (st) => st.split(',').slice(-(k - 1)).join(','));
          return near(R.time, qf(ans), 'expected rolls', 1e-7);
        },
        solution: `Keep track of the length j of the current stretch of all-different rolls at the end, and let ${sub('E', 'j')} be the expected number of rolls still to come. From a stretch of length j, the next roll is new with chance ${over(`${s} − j`, s)}, which makes the stretch j + 1. Otherwise it repeats one of the last j rolls, each with chance ${over(1, s)}. If it repeats the roll i places back, only the last i rolls are still all different, so the stretch becomes length i. `
          + `That gives ${eqs.join(', and ')}. Solving these gives ${sub('E', 1)} = ${qfr(Ej[0])}. The first roll makes a stretch of length 1, so the answer is 1 + ${qfr(Ej[0])} = <b>${qfr(ans)}</b>.`,
      };
    }
    const PAIRS = [['HHT', 'THH'], ['HHT', 'THT'], ['HTH', 'THH'], ['HTH', 'HHT'], ['HHH', 'THH'], ['HHH', 'HTH'], ['HTT', 'TTH'], ['THT', 'TTH'], ['HTH', 'TTH'], ['HHT', 'HTT'], ['THH', 'TTH'], ['HH', 'THT'], ['TT', 'HTH'], ['HH', 'TTH'], ['HTHT', 'THTT'], ['HHTH', 'HTHH']];
    const [[A, Bp]] = pick(c2, `race-${form}`, [PAIRS], ([A, Bp]) => form !== 'who' || !qeq(raceSolve(A, Bp, HALF).Pv[0], Q(1, 2)));
    const R = raceSolve(A, Bp, HALF), Pa = R.Pv[0], Ee = R.Ev[0], Ea = patternSolve(A, HALF).vals[0], Eb = patternSolve(Bp, HALF).vals[0];
    const V = form === 'who' ? (s) => (s === '' ? 'x' : sub('x', s)) : Es, sol = form === 'who' ? R.Pv : R.Ev;
    const eqs = R.states.map((s) => {
      const parts = HALF.map(([c]) => R.go(s, c)), body = parts.map((t) => (t === 'A' ? (form === 'who' ? `${over(1, 2)}·1` : '') : t === 'B' ? '' : `${over(1, 2)}${V(t)}`)).filter(Boolean);
      return form === 'who' ? `${V(s)} = ${body.join(' + ') || '0'}` : `${V(s)} = 1${body.length ? ` + ${body.join(' + ')}` : ''}`;
    });
    const ans = form === 'who' ? Pa : Ee, slip = qdiv(Eb, qadd(Ea, Eb));
    return {
      topic: EV, rank: form === 'who' ? 23 : 24,
      text: form === 'who' ? `A fair coin is flipped until ${A} or ${Bp} appears on consecutive flips. What is the probability that ${A} appears first?` : `A fair coin is flipped until ${A} or ${Bp} appears on consecutive flips. What is the expected number of flips?`,
      answer: fchoices(d, qn(ans), form === 'who' ? [qn(Q(1, 2)), qn(qsub(Q(1), ans)), qn(slip), qn(qsub(Q(1), slip)), qn(qdiv(Ea, qadd(Ea, Eb))), qn(Q(1, 4)), qn(Q(3, 4))] : [qn(Ea), qn(Eb), qn(qdiv(qmul(Ea, Eb), qadd(Ea, Eb))), qn(qmul(Q(1, 2), qadd(Ea, Eb))), qn(qadd(Ee, Q(1))), qn(qsub(Ee, Q(1)))]),
      check: () => {
        // follow the actual latest flips, not the reduced states
        const keep = Math.max(A.length, Bp.length), run = runChain('', (st) => flipSteps(st, HALF, keep), (st) => (st.endsWith(A) ? 'A' : st.endsWith(Bp) ? 'B' : false));
        return form === 'who' ? near(run.ends.A, qf(Pa), 'chance', 1e-8) : near(run.time, qf(Ee), 'expected flips', 1e-8);
      },
      solution: `Only the longest end of the flips that starts ${A} or ${Bp} matters, so those are the states. ${form === 'who' ? `Let x be the probability that ${A} comes first from the start, and ${sub('x', 'w')} the probability when the latest flips end in w. A flip that completes ${A} counts as 1, and one that completes ${Bp} counts as 0.` : `Let E be the expected number of flips from the start, and ${sub('E', 'w')} the expected number still to come when the latest flips end in w. A flip that completes either pattern ends the game.`} `
        + `One flip from each state gives: ${eqs.join(', ')}. Solving these: ${R.states.slice(1).reverse().map((s) => `${V(s)} = ${qfr(sol[R.states.indexOf(s)])}`).join(', ')}, and ${V('')} = <b>${qfr(ans)}</b>.`,
    };
  },
  // walks grouped by distance from the target: a solid, and n switches
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['solid', 'switches']);
    if (form === 'solid') {
      const [name, pos, lazy] = pick(c2, 'solid', [['octahedron', 'cube', 'icosahedron', 'dodecahedron'], [1, 2, 'far'], [false, true]], (name, pos, lazy) => { const I = solidInfo(name), j = pos === 'far' ? I.far : pos; return j <= I.far && !(name === 'cube' && j === I.far && !lazy) && !(lazy && name === 'dodecahedron'); });
      const I = solidInfo(name), j = pos === 'far' ? I.far : pos, base = I.E[j - 1], ans = lazy ? qmul(base, Q(2)) : base, where = j === I.far ? 'the vertex directly opposite its start' : j === 1 ? 'one particular vertex next to its start' : `one particular vertex two edges away from its start`;
      const eqs = I.levels.map((L, i) => {
        const parts = [];
        if (i > 0) parts.push([Q(L.near, I.deg), sub('E', i)]);
        if (L.same) parts.push([Q(L.same, I.deg), sub('E', i + 1)]);
        if (L.out) parts.push([Q(L.out, I.deg), sub('E', i + 2)]);
        return `${sub('E', i + 1)} = 1${parts.length ? ` + ${termsOf(parts)}` : ''}`;
      });
      const counts = I.levels.map((L, i) => `${L.size} at distance ${i + 1}`);
      return {
        topic: EV, rank: { octahedron: 17, cube: 18, icosahedron: 20, dodecahedron: 22 }[name] + (lazy ? 1 : 0),
        text: `An ant is on a vertex of a regular ${name}. Each minute${lazy ? ' it stays where it is with probability 1/2, and otherwise it' : ' it'} walks along one of the edges at its vertex, chosen at random. What is the expected number of minutes until it first reaches ${where}?`,
        answer: fchoices(d, qn(ans), [I.adj.length, I.E[Math.max(0, j - 2)] && !qeq(I.E[Math.max(0, j - 2)], base) ? qn(I.E[Math.max(0, j - 2)])[0] : I.adj.length - 1, lazy ? qn(base)[0] : qn(base)[0] * 2, I.deg * j, 2 * j * I.far, qn(ans)[0] + I.deg, I.adj.length - 1]),
        check: () => {
          // all the vertices at once, with no use of symmetry
          const target = I.dist.indexOf(j), others = range(0, I.adj.length - 1).filter((v) => v !== target), at = new Map(others.map((v, i) => [v, i])), n = others.length;
          const rows = others.map((v, i) => { const row = Array(n + 1).fill(Q(0)); row[i] = Q(1); row[n] = Q(1); for (const w of I.adj[v]) if (w !== target) row[at.get(w)] = qsub(row[at.get(w)], Q(1, I.adj[v].length)); return row; });
          const E0 = solveLinear(rows)[at.get(0)];
          return said(lazy ? qmul(E0, Q(2)) : E0, qn(ans));
        },
        solution: `Group the vertices by their distance from the target: ${listing(counts)}. By symmetry, all the vertices at one distance have the same expected time, so let ${sub('E', 'j')} be the expected number of moves from distance j, with ${sub('E', 0)} = 0. From each vertex there are ${I.deg} edges, and counting how many lead nearer, level or farther gives: ${eqs.join(', ')}. `
          + `Solving these (from the far end, each one gives the next in terms of the one before): ${I.E.map((v, i) => `${sub('E', i + 1)} = ${qfr(v)}`).join(', ')}. The ant starts at distance ${j}, so it needs ${qfr(base)} moves on average. `
          + (lazy ? `Each move takes 2 minutes on average, because each minute it moves with probability 1/2. So the answer is 2·${qfr(base)} = <b>${qfr(ans)}</b>.` : `So the answer is <b>${qfr(ans)}</b>.`),
      };
    }
    const [n, ask] = pick(c2, 'switches', [[3, 4, 5, 6, 7, 8], ['all', 'one']], (n, ask) => !(n === 3 && ask === 'all'));
    const gaps = Array(n + 1).fill(Q(0));
    gaps[n] = Q(1);
    for (let k = n - 1; k >= 1; k--) gaps[k] = qdiv(qadd(Q(n), qmul(Q(n - k), gaps[k + 1])), Q(k));
    const ans = ask === 'all' ? gaps.slice(1).reduce(qadd, Q(0)) : gaps[1];
    return {
      topic: EV, rank: ask === 'all' ? 23 : 22,
      text: `There are ${n} light switches${ask === 'all' ? ', all off' : `, and all of them are on except one`}. Each minute, one of the ${n} switches is chosen at random and flipped. What is the expected number of minutes until all ${n} switches are on?`,
      answer: fchoices(d, qn(ans), [Q(2 ** n), Q(2 ** n - 1), Q(n * n), Q(2 ** (n - 1)), qadd(ans, Q(1)), qsub(ans, Q(1)), Q(n * 2 ** (n - 1)), qadd(gaps.slice(1).reduce(qadd, Q(0)), Q(1))].filter((w) => !qeq(w, ans)).map(qn)),
      check: () => {
        // follow all 2ⁿ settings of the switches, with no use of symmetry
        const goal = 2 ** n - 1;
        let cur = new Float64Array(goal + 1), time = 0, mass = 1;
        cur[ask === 'all' ? 0 : goal ^ 1] = 1;
        for (let t = 0; t < 200000 && mass > 1e-12; t++) {
          time += mass;
          const next = new Float64Array(goal + 1);
          for (let st = 0; st < goal; st++) if (cur[st]) for (let b = 0; b < n; b++) next[st ^ (1 << b)] += cur[st] / n;
          next[goal] = 0;
          cur = next;
          mass = cur.reduce((x, y) => x + y, 0);
        }
        return near(time, qf(ans), 'expected minutes', 1e-6);
      },
      solution: `Only the number of switches that are off matters. Let ${sub('E', 'k')} be the expected time with k off, and let ${sub('d', 'k')} = ${sub('E', 'k')} − ${sub('E', 'k−1')}, with ${sub('E', 0)} = 0. With k off, the chosen switch is one of the off ones with chance k/${n}, so ${sub('E', 'k')} = 1 + (k/${n})${sub('E', 'k−1')} + ((${n} − k)/${n})${sub('E', 'k+1')}. `
        + `Rearranged, this is k·${sub('d', 'k')} = ${n} + (${n} − k)·${sub('d', 'k+1')}. At the top, k = ${n}, it gives ${sub('d', n)} = 1. Working down: ${range(1, n - 1).reverse().map((k) => `${sub('d', k)} = ${qfr(gaps[k])}`).join(', ')}. `
        + (ask === 'all' ? `Starting with all ${n} off, the expected time is the sum of all the ${sub('d', 'k')}: <b>${qfr(ans)}</b>.` : `Starting with one off, the expected time is ${sub('E', 1)} = ${sub('d', 1)} = <b>${qfr(ans)}</b>.`),
    };
  },
  // the state is a remainder, or the gap between two walkers
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['residue', 'meet']);
    if (form === 'residue') {
      const [[s, m], j0] = pick(c2, 'residue', [[[6, 4], [6, 5], [4, 3], [4, 5], [4, 6], [8, 3], [8, 5], [8, 6], [10, 4], [12, 5], [10, 6], [10, 3]], [1, 2, 3, 4, 5]], ([s, m], j0) => j0 < m);
      const cnt = range(0, m - 1).map((r) => range(1, s).filter((f) => f % m === r).length), n = m - 1;
      const rows = range(1, n).map((r) => { const row = Array(n + 1).fill(Q(0)); row[r - 1] = Q(1); row[n] = Q(1); range(0, m - 1).forEach((t) => { const to = (r + t) % m; if (to !== 0 && cnt[t]) row[to - 1] = qsub(row[to - 1], Q(cnt[t], s)); }); return row; });
      const Er = solveLinear(rows), ans = Er[j0 - 1];
      const names = range(1, n).map((r) => sub('E', r)), eqs = range(1, n).map((r) => { const g = new Map(); range(0, m - 1).forEach((t) => { const to = (r + t) % m; if (to !== 0 && cnt[t]) g.set(to, qadd(g.get(to) || Q(0), Q(cnt[t], s))); }); return `${names[r - 1]} = 1 + ${termsOf([...g.entries()].sort((x, y) => x[0] - y[0]).map(([to, p]) => [p, names[to - 1]]))}`; });
      return {
        topic: EV, rank: m <= 4 ? 18 : 20,
        text: `A running total starts at ${j0}. A fair ${s}-sided die is rolled over and over, and each result is added to the total. What is the expected number of rolls until the total is a multiple of ${m}?`,
        answer: fchoices(d, qn(ans), [Q(m), Q(s), ...Er.filter((v) => !qeq(v, ans)), qadd(ans, Q(1)), qsub(ans, Q(1)), qdiv(Q(s), Q(Math.max(cnt[m - j0], 1)))].filter((w) => !qeq(w, ans)).map(qn)),
        check: () => {
          const R = runChain(j0, (st) => range(1, s).map((f) => [(st + f) % m, 1 / s]), (st) => (st === 0 ? 'done' : false));
          return near(R.time, qf(ans), 'expected rolls', 1e-8);
        },
        solution: `Only the remainder of the total when divided by ${m} matters. Let ${sub('E', 'r')} be the expected number of rolls still to come when the remainder is r, with ${sub('E', 0)} = 0 at the finish. The faces of the die leave ${listing(range(0, m - 1).map((t) => `remainder ${t} on ${cnt[t]} face${cnt[t] === 1 ? '' : 's'}`))}. `
          + `One roll from each remainder gives: ${eqs.join(', ')}. Solving these: ${Er.map((v, i) => `${names[i]} = ${qfr(v)}`).join(', ')}. The total starts with remainder ${j0}, so the answer is ${names[j0 - 1]} = <b>${qfr(ans)}</b>.`,
      };
    }
    const OPTS = [[5, 1], [5, 2], [6, 2], [7, 1], [7, 2], [7, 3], [8, 2], [8, 4], [9, 1], [9, 2], [9, 3], [9, 4], [10, 2], [10, 4], [12, 2], [12, 4], [12, 6]];
    const [[n, g]] = pick(c2, 'meet', [OPTS]);
    const oddN = n % 2 === 1, m = oddN ? n : n / 2, k = oddN ? (g % 2 === 0 ? g / 2 : (g + n) / 2) : g / 2, ans = 2 * k * (m - k);
    const wrongs = [g * (n - g), 2 * g * (n - g), k * (m - k), ans + 2, ans - 2, 4 * k * (m - k), n * n];
    return {
      topic: EV, rank: oddN ? 25 : 24,
      text: `Two ants stand on the vertices of a regular ${n}-gon, ${g} edge${g === 1 ? '' : 's'} apart. Each minute, both ants move at the same time, each to one of the two neighboring vertices, chosen at random. What is the expected number of minutes until the ants are on the same vertex?`,
      answer: fchoices(d, ans, wrongs),
      check: () => {
        // both ants, with every pair of positions, with no use of the gap
        const R = runChain(`0,${g}`, (st) => { const [x, y] = st.split(',').map(Number), out = []; for (const a of [1, n - 1]) for (const b of [1, n - 1]) out.push([`${(x + a) % n},${(y + b) % n}`, 1 / 4]); return out; }, (st) => { const [x, y] = st.split(',').map(Number); return x === y ? 'met' : false; });
        return near(R.time, ans, 'expected minutes', 1e-7);
      },
      solution: `Only the gap between the ants matters: going clockwise from the first ant to the second, it is ${g} now. Each minute the gap changes by +2 with chance ${over(1, 4)}, by −2 with chance ${over(1, 4)}, and stays the same with chance ${over(1, 2)}. `
        + (oddN
          ? `Since ${n} is odd, repeatedly adding 2 goes through all the gaps. List them in the order 0, 2, 4, …, wrapping round at ${n}: the gap ${g} is at position ${k} in the list, because 2·${k} leaves remainder ${g} when divided by ${n}. `
          : `Since ${n} is even, the gap stays even, so count it in steps of 2. The possible gaps are 0, 2, 4, …, ${n - 2}, in a circle of ${m}, and the gap ${g} is at position ${k}. `)
        + `So the position walks fairly along a circle of ${m} places, with 0 as the finish, starting ${k} step${k === 1 ? '' : 's'} one way and ${m - k} step${m - k === 1 ? '' : 's'} the other way. A fair walk between two ends that far apart takes ${k}·${m - k} moves on average. Each minute the position moves only with chance ${over(1, 2)}, so each move takes 2 minutes on average. The answer is 2·${k}·${m - k} = <b>${num(ans)}</b>.`,
    };
  },
  // what is still missing, and a condition on what came before
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['collect', 'cond']);
    if (form === 'collect') {
      const [s, G, F, ask] = pick(c2, 'collect', [[6, 8, 10, 12, 20], [2, 3, 4], [1, 2, 3], ['chance', 'time']], (s, G, F) => G + F <= s && !(s === 6 && G === 3 && F === 3));
      const chance = range(1, G).reduce((acc, j) => qmul(acc, Q(j, j + F)), Q(1));
      const times = [Q(0)];
      for (let k = 1; k <= G; k++) times.push(qdiv(qadd(Q(s), qmul(Q(k), times[k - 1])), Q(k + F)));
      const ans = ask === 'chance' ? chance : times[G], good = `${listing(range(1, G).map(String))}`, every = G === 2 ? 'both' : 'all of', bad = F === 1 ? anN(s) : `one of ${orList(range(s - F + 1, s).map(String))}`, badWord = F === 1 ? `${s}` : orList(range(s - F + 1, s).map(String));
      const wrong = ask === 'chance' ? [Q(1, G + F), Q(G, G + F), qmul(chance, Q(2)), qdiv(chance, Q(2)), (() => { let w = Q(1); for (let j = 1; j <= G; j++) w = qmul(w, Q(G, G + F)); return w; })(), (() => { let w = Q(1); for (let j = 1; j <= G; j++) w = qmul(w, Q(j, s)); return w; })()] : [Q(s, F), Q(s, G + F), qadd(ans, Q(1)), qmul(ans, Q(2)), range(1, G).reduce((acc, k) => qadd(acc, Q(s, k)), Q(0)), range(1, G).reduce((acc, k) => qadd(acc, Q(s, k + F)), Q(0))];
      return {
        topic: EV, rank: ask === 'chance' ? 16 : 17,
        text: ask === 'chance'
          ? `A fair ${s}-sided die is rolled over and over. What is the probability that ${every} ${good} have come up at least once before the first time ${bad} comes up?`
          : `A fair ${s}-sided die is rolled until either ${every} ${good} have come up at least once, or ${bad} comes up, whichever happens first. What is the expected number of rolls?`,
        answer: fchoices(d, qn(ans), wrong.filter((w) => !qeq(w, ans)).map(qn)),
        check: () => {
          const R = runChain(0, (mask) => { const out = []; let keep = (s - G - F) / s; for (let g = 0; g < G; g++) { if (mask & (1 << g)) keep += 1 / s; else out.push([mask | (1 << g), 1 / s]); } out.push(['bad', F / s]); if (keep > 0) out.push([mask, keep]); return out; }, (st) => (st === 'bad' ? 'bad' : st === 2 ** G - 1 ? 'all' : false));
          return ask === 'chance' ? near(R.ends.all, qf(chance), 'chance', 1e-8) : near(R.time, qf(times[G]), 'expected rolls', 1e-8);
        },
        solution: ask === 'chance'
          ? `Rolls that are neither missing numbers nor ${badWord} change nothing, so only look at the rolls that matter. When j of the numbers ${good} are still missing, the next roll that matters is one of those j numbers or one of the ${F} stopping number${F === 1 ? '' : 's'}, all equally likely. So the chance it is a missing number is ${over('j', `j + ${F}`)}. `
            + `This must happen for j = ${G}, then ${G - 1}, and so on down to 1, so the probability is ${range(1, G).reverse().map((j) => over(j, j + F)).join('·')} = <b>${qfr(ans)}</b>.`
          : `The state is the number j of ${good} still missing. Let ${sub('E', 'j')} be the expected number of rolls still to come, with ${sub('E', 0)} = 0. With j missing, a roll changes the state with chance ${over(`j + ${F}`, s)}, so the wait for such a roll is ${over(s, `j + ${F}`)} rolls on average. When it comes, it is a missing number with chance ${over('j', `j + ${F}`)}, and otherwise the rolling stops. `
            + `So ${sub('E', 'j')} = ${over(s, `j + ${F}`)} + ${over('j', `j + ${F}`)}·${sub('E', 'j−1')}. Working up: ${range(1, G).map((k) => `${sub('E', k)} = ${qfr(times[k])}`).join(', ')}. So the answer is <b>${qfr(ans)}</b>.`,
      };
    }
    const SETS = [['even', 6, 2], ['even', 8, 3], ['even', 10, 4], ['even', 12, 5], ['low', 6, 3], ['low', 8, 2], ['low', 10, 3], ['low', 12, 4], ['low', 20, 5], ['low', 8, 5], ['even', 20, 9]];
    const [[kind, s, a]] = pick(c2, 'cond', [SETS]);
    const ans = cut(s, s - a), rule = kind === 'even' ? 'every roll is even' : `every roll before the last is at most ${a}`, allow = kind === 'even' ? `even numbers other than ${s}` : `numbers from 1 to ${a}`;
    return {
      topic: EV, rank: 20,
      text: `A fair ${s}-sided die is rolled until ${anN(s)} comes up. Given that ${rule}, what is the expected number of rolls?`,
      answer: fchoices(d, ans, [cut(s, 1), cut(a + 1, 1), cut(s, a + 1), cut(a + 1, a), cut(s, s - a - 1), cut(s + a, s)]),
      check: () => {
        // add up the two series directly
        let top = 0, bottom = 0, w = 1 / s;
        for (let t = 1; t < 5000; t++) { bottom += w; top += t * w; w *= a / s; }
        return near(top / bottom, val(ans), 'conditional mean', 1e-9);
      },
      solution: `The rolling lasts exactly t rolls, with the condition holding, when the first t − 1 rolls are among the ${a} ${allow} and then ${anN(s)} comes up. That has probability r<sup>t−1</sup>·${over(1, s)}, where r = ${fr(cut(a, s))}. `
        + `So the condition is like a geometric wait: given the condition, the chance of t rolls is proportional to r<sup>t−1</sup>, and that is a geometric distribution with stopping chance 1 − r = ${fr(cut(s - a, s))}. Its mean is 1 ÷ (1 − r) = <b>${fr(ans)}</b>. Notice that this is not the ${num(a + 1)} you would get by pretending the die has only those ${a + 1} faces: the condition makes long waits less likely, because they are harder to get through.`,
    };
  },
];

export const algebraPlus = {
  [VI]: vieta,
  [PV]: fromValues,
  [TR]: transforming,
  [SQ]: repeating,
  [FN]: applied,
  [FL]: floors,
  [MD]: powers,
  [EV]: expected,
};
