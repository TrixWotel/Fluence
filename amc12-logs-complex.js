// AMC 12 practice on logarithms and complex numbers, mostly problems 12 to 25: four topics on logs and exponents (the
// rules and change of base, equations with logs, logs and whole numbers, exponential equations) and four on complex
// numbers (arithmetic and modulus, powers, roots of unity, and the complex plane as geometry). The ideas are the ones
// behind contest problems; the problems, numbers and wording are new (the real ones are the MAA's copyright). Every
// check() gets the answer a second way, by brute force, with exact BigInt arithmetic or by working out the expression
// as written from actual numbers, and returns true (or a note saying what disagreed).
import { combo, num, frac, gcd, lcm, choose } from '../kit/bank.js';
import { choices, showFrac, range, fracSurd, ord } from './amc-kit.js';

// combo, with a name of its own for each kind of question, so no two kinds share a list of combinations
const pick = (ctx, tag, lists, ok) => combo({ ...ctx, salt: `${ctx.salt}|${tag}` }, lists, ok);
// a type with several forms: the forms take turns (the turn number stays as it is, so forms that share a list of
// combinations never draw the same one)
const turn = (ctx, forms) => [forms[ctx.k % forms.length], ctx];

// ---------- fractions as [p, q], and how things read ----------
const cut = (p, q = 1) => { if (q < 0) { p = -p; q = -q; } const g = gcd(p, q) || 1; return [p / g, q / g]; };
const fa = (x, y) => cut(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
const fs = (x, y) => cut(x[0] * y[1] - y[0] * x[1], x[1] * y[1]);
const fm = (x, y) => cut(x[0] * y[0], x[1] * y[1]);
const fd = (x, y) => cut(x[0] * y[1], x[1] * y[0]);
const fr = ([p, q]) => frac(p, q);
const paren = (x) => (x < 0 ? `(${num(x)})` : num(x));
const sup = (b, e) => `${b}<sup>${e}</sup>`;
const over = (top, bottom) => `<span class="fr"><span>${top}</span><span>${bottom}</span></span>`;
const lg = (b, x) => `log<sub>${b}</sub> ${x}`;                // log₂ 3
const lgb = (b, x) => `log<sub>${b}</sub>(${x})`;              // log₂(xy)
const isqrt = (n) => { let r = Math.floor(Math.sqrt(n)); while (r * r > n) r--; while ((r + 1) * (r + 1) <= n) r++; return r; };
const isSq = (n) => n >= 0 && isqrt(n) ** 2 === n;
const listing = (xs, and = 'and') => (xs.length < 2 ? String(xs[0]) : `${xs.slice(0, -1).join(', ')} ${and} ${xs.at(-1)}`);
const sum = (xs) => xs.reduce((s, x) => s + x, 0);
const tri = (n) => (n * (n + 1)) / 2;
const shift = (v, a) => (a === 0 ? v : `${v} ${a < 0 ? '−' : '+'} ${num(Math.abs(a))}`);   // x − 3
const signed = (c, v = '') => (c === 0 ? '' : ` ${c < 0 ? '−' : '+'} ${Math.abs(c) === 1 && v ? '' : num(Math.abs(c))}${v}`);   // " − 3x"
const cf = (c, v) => (c === 1 ? v : c === -1 ? `−${v}` : `${num(c)}${v}`);                  // 3x, x, −x
const pw = (b, e) => (e >= 0 ? [b ** e, 1] : [1, b ** -e]);    // a whole power of b, as a fraction

// a + bi as it reads
const gi = (a, b) => {
  if (b === 0) return num(a, 4);
  const im = Math.abs(b) === 1 ? 'i' : `${num(Math.abs(b), 4)}i`;
  return a === 0 ? `${b < 0 ? '−' : ''}${im}` : `${num(a, 4)} ${b < 0 ? '−' : '+'} ${im}`;
};
const gp = (a, b) => (a === 0 || b === 0 ? gi(a, b) : `(${gi(a, b)})`);   // in brackets if it has two terms

// exact answers (whole numbers, or fractions as [p, q]), with the wrong ones topped up so that no two choices read the
// same even once the fraction bars are gone (3/2 and 32)
const val = (v) => (Array.isArray(v) ? v[0] / v[1] : v);
const bare = (v) => showFrac(v).replace(/<[^>]+>/g, '');
function fchoices(d, correct, wrongs) {
  const [p, q] = Array.isArray(correct) ? correct : [correct, 1], keep = [];
  for (const w of [...wrongs, ...range(1, 12).flatMap((k) => [[p + k, q], [p - k, q]])]) {
    if (keep.length === 4) break;
    if (Number.isFinite(val(w)) && (val(correct) < 0 || val(w) >= 0) && ![correct, ...keep].some((x) => Math.abs(val(x) - val(w)) < 1e-9 || bare(x) === bare(w))) keep.push(w);
  }
  return choices(d, correct, keep, showFrac);
}
// five choices given as [value, how it reads] (answers like 2√3 or 3 − 4i), skipping wrong ones whose value or reading
// repeats, sorted by value (a complex answer's value is its real part, then its imaginary part as a tiebreak)
const plain = (s) => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
function tchoices(correct, wrongs) {
  const list = [correct];
  for (const w of wrongs) if (w && list.length < 5 && Number.isFinite(w[0]) && !list.some((x) => Math.abs(x[0] - w[0]) < 1e-9 * Math.max(1, Math.abs(w[0])) || plain(x[1]) === plain(w[1]))) list.push(w);
  if (list.length < 5) throw new Error(`tchoices: only ${list.length} different choices for ${correct[1]}`);
  list.sort((a, b) => a[0] - b[0]);
  return { kind: 'choice', choices: list.map((x) => x[1]), correct: list.indexOf(correct) };
}
const fv = (x) => [val(x), showFrac(x)];                       // a fraction as [value, how it reads]

// what check() returns: exactly true, or a note saying what disagreed
const agree = (got, want, what = 'value') => (Math.abs(got - want) <= 1e-7 * Math.max(1, Math.abs(want)) ? true : `${what}: worked out ${got}, said ${want}`);
const equal = (got, want, what = 'value') => (got === want ? true : `${what}: worked out ${got}, said ${want}`);
const both = (...vs) => vs.find((v) => v !== true) ?? true;

// ---------- complex numbers: [re, im] as ordinary numbers, and exact ones with BigInt ----------
const cadd = (a, b) => [a[0] + b[0], a[1] + b[1]];
const csub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cdiv = (a, b) => { const n = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / n, (a[1] * b[0] - a[0] * b[1]) / n]; };
const cabs = (a) => Math.hypot(a[0], a[1]);
const cis = (t) => [Math.cos(t), Math.sin(t)];
const cpow = (z, n) => { let r = [1, 0]; for (let i = 0; i < n; i++) r = cmul(r, z); return r; };
const zmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const zpow = (a, b, n) => { let r = [1n, 0n]; const z = [BigInt(a), BigInt(b)]; for (let i = 0; i < n; i++) r = zmul(r, z); return r; };
// the real roots of f on [lo, hi], found by looking for changes of sign and halving (a pole isn't a root: f must be small there)
function rootsOf(f, lo, hi, steps = 4000) {
  const out = [], w = (hi - lo) / steps;
  for (let i = 0; i < steps; i++) {
    let a = lo + i * w + w * 1e-3, b = a + w;
    let fa2 = f(a), fb = f(b);
    if (!Number.isFinite(fa2) || !Number.isFinite(fb) || fa2 * fb > 0) continue;
    for (let j = 0; j < 80; j++) { const m = (a + b) / 2, fm2 = f(m); if (fa2 * fm2 <= 0) { b = m; fb = fm2; } else { a = m; fa2 = fm2; } }
    const x = (a + b) / 2;
    if (Math.abs(f(x)) < 1e-6) out.push(x);
  }
  return out;
}

// ======================================================================================================================
// Log rules and change of base
// ======================================================================================================================
const LR = 'Log rules and change of base';
const logRules = [
  // log_{p^a}(q^b) · log_{q^c}(r^d) · log_{r^e}(p^f): the powers come out in front, and what is left goes round to 1
  (d, ctx) => {
    const PR = [[2, 3, 5], [3, 5, 2], [5, 2, 7], [2, 7, 3], [7, 3, 2], [3, 2, 5]];
    const EX = [[2, 3], [3, 2], [2, 1], [1, 2], [3, 1], [1, 3], [3, 4], [4, 3]];
    const answerOf = (e1, e2, e3) => cut(e1[1] * e2[1] * e3[1], e1[0] * e2[0] * e3[0]);
    const [[p, q, r], e1, e2, e3] = pick(ctx, 'cycle', [PR, EX, EX, EX], ([p, q, r], e1, e2, e3) => {
      const a = answerOf(e1, e2, e3);
      return p ** e1[0] <= 125 && q ** e1[1] <= 125 && q ** e2[0] <= 125 && r ** e2[1] <= 125 && r ** e3[0] <= 125 && p ** e3[1] <= 125 && a[0] !== a[1] && a[1] > 1 && a[1] <= 12 && a[0] <= 30;
    });
    const parts = [[p, q, e1], [q, r, e2], [r, p, e3]], ans = answerOf(e1, e2, e3);
    const rs = parts.map(([, , e]) => cut(e[1], e[0]));
    const shown = parts.map(([u, v, e]) => `(${lg(num(u ** e[0], 0), num(v ** e[1], 0))})`).join('');
    return {
      topic: LR, rank: 11,
      text: `What is the value of ${shown}?`,
      answer: fchoices(d, ans, [cut(ans[1], ans[0]), fa(fa(rs[0], rs[1]), rs[2]), [e1[1] * e2[1] * e3[1], 1], [e1[0] * e2[0] * e3[0], 1], fm(ans, [2, 1])]),
      check: () => agree(parts.reduce((m, [u, v, e]) => m * (Math.log(v ** e[1]) / Math.log(u ** e[0])), 1), val(ans)),
      solution: `Write the numbers as powers of primes and bring the powers out in front, using log<sub>u<sup>m</sup></sub>(v<sup>n</sup>) = ${over('n', 'm')}·${lg('u', 'v')}. `
        + `The three logs become ${parts.map(([u, v, e], i) => `${fr(rs[i])}·${lg(u, v)}`).join(', ')}. `
        + `By change of base, (${lg(p, q)})(${lg(q, r)})(${lg(r, p)}) = ${over('log ' + q, 'log ' + p)}·${over('log ' + r, 'log ' + q)}·${over('log ' + p, 'log ' + r)} = 1. `
        + `So the value is ${fr(rs[0])}·${fr(rs[1])}·${fr(rs[2])} = <b>${fr(ans)}</b>.`,
    };
  },
  // (sum of log_{p^k} q^{k²}) · (sum of log_{q^{ck}} p^{ek}): each term of the first is k·log_p q, each of the second the same number
  (d, ctx) => {
    const [[p, q], m, n, [c, e]] = pick(ctx, 'sums', [[[2, 3], [3, 2], [2, 7], [7, 2], [5, 2], [3, 7]], [6, 8, 9, 10, 12, 15], [10, 16, 24, 30, 40], [[2, 1], [1, 2], [2, 3], [3, 2], [3, 1]]],
      (pq, m, n, [c, e]) => n % c === 0);
    const T = tri(m), ratio = cut(e, c), ans = fm([T, 1], fm([n, 1], ratio));
    const first = `${lg(p, q)} + ${lg(sup(p, 2), sup(q, 4))} + ${lg(sup(p, 3), sup(q, 9))} + ⋯ + ${lg(sup(p, m), sup(q, m * m))}`;
    const term = (k) => lg(sup(q, c * k), sup(p, e * k));
    return {
      topic: LR, rank: 14,
      text: `What is the value of the product (${first})(${term(1)} + ${term(2)} + ${term(3)} + ⋯ + ${term(n)})?`,
      answer: fchoices(d, ans, [fm([m * n, 1], ratio), fm([T, 1], fm([n, 1], cut(c, e))), fm([T, 1], fm([tri(n), 1], ratio)), [T * n, 1], fm(fm([T, 1], [T, 1]), ratio)]),
      check: () => {
        let A = 0, Bk = 0;
        for (let k = 1; k <= m; k++) A += (k * k * Math.log(q)) / (k * Math.log(p));
        for (let k = 1; k <= n; k++) Bk += (e * k * Math.log(p)) / (c * k * Math.log(q));
        return agree(A * Bk, val(ans));
      },
      solution: `Bring the powers out in front. The k-th term of the first sum is ${lgb(sup(p, 'k'), sup(q, sup('k', 2)))} = ${over(sup('k', 2), 'k')}·${lg(p, q)} = k·${lg(p, q)}. `
        + `So the first sum is (1 + 2 + ⋯ + ${m})·${lg(p, q)} = ${T}·${lg(p, q)}. `
        + `The k-th term of the second sum has k in both exponents, and it cancels: ${over(`${e === 1 ? '' : e}k`, `${c === 1 ? '' : c}k`)}·${lg(q, p)} = ${fr(ratio)}·${lg(q, p)}, the same for every k. `
        + `With ${n} terms, the second sum is ${n}·${fr(ratio)}·${lg(q, p)}. `
        + `Since (${lg(p, q)})(${lg(q, p)}) = 1, the product is ${T}·${n}·${fr(ratio)} = <b>${fr(ans)}</b>.`,
    };
  },
  // log_x w, log_y w and log_{xyz} w given: the reciprocals add up, because log_w(xyz) = log_w x + log_w y + log_w z
  (d, ctx) => {
    const TR = [[6, 10, 15], [4, 12, 6], [10, 15, 30], [12, 20, 30], [8, 24, 12], [14, 21, 42], [20, 30, 60], [3, 6, 18], [2, 12, 4], [9, 18, 6]];
    const [[A, Bv, D0], order] = pick(ctx, 'recip', [TR, [0, 1, 2]]);
    const [a, b, D] = [[A, Bv, D0], [Bv, D0, A], [D0, A, Bv]][order];
    const inv = fa(fa(cut(1, a), cut(1, b)), cut(1, D)), C = cut(inv[1], inv[0]);
    return {
      topic: LR, rank: 15,
      text: `Numbers x, y and z are greater than 1, and w is a positive number with ${lg('x', 'w')} = ${a}, ${lg('y', 'w')} = ${b} and ${lg('xyz', 'w')} = ${fr(C)}. What is ${lg('z', 'w')}?`,
      answer: fchoices(d, D, [a + b, Math.abs(a - b), a + b + Math.round(val(C)), Math.round(val(C) * 2), a * b, fd([a * b, 1], [a + b, 1])]),
      check: () => {
        // real numbers: take w = 10⁶, make x, y and z from the logs, and work out log_{xyz} w as written
        const w = 1e6, x = w ** (1 / a), y = w ** (1 / b), z = w ** (1 / D);
        return both(agree(Math.log(w) / Math.log(x * y * z), val(C), 'log base xyz'), agree(Math.log(w) / Math.log(z), D, 'log base z'));
      },
      solution: `A log and the log with base and number swapped are reciprocals, so ${lg('w', 'x')} = ${fr(cut(1, a))}, ${lg('w', 'y')} = ${fr(cut(1, b))} and ${lg('w', 'xyz')} = ${fr(inv)}. `
        + `Logs of a product add, so ${lg('w', 'x')} + ${lg('w', 'y')} + ${lg('w', 'z')} = ${lg('w', 'xyz')}. `
        + `That gives ${lg('w', 'z')} = ${fr(inv)} − ${fr(cut(1, a))} − ${fr(cut(1, b))} = ${fr(cut(1, D))}. `
        + `So ${lg('z', 'w')} = <b>${num(D)}</b>.`,
    };
  },
  // log_a(bc) = p and log_b(ca) = q give log_c(ab): add 1 to each, then the three logs in base abc add up to 1. Or
  // their sum gives their product: with A, B and C the logs of a, b and c, the product is the sum plus 2
  (d, ctx) => {
    const [form, c3] = turn(ctx, ['plusone', 'product']);
    if (form === 'product') {
      const [S] = pick(c3, 'xyz', [[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 24, 25, 30]]);
      const ans = S + 2, X = lgb('a', 'bc'), Y = lgb('b', 'ca'), Z = lgb('c', 'ab');
      return {
        topic: LR, rank: 16,
        text: `Real numbers a, b and c are greater than 1, and ${X} + ${Y} + ${Z} = ${S}. What is the product (${X})(${Y})(${Z})?`,
        answer: fchoices(d, ans, [S, S - 2, S + 6, 8, S + 1, 3 * S, S * 2]),
        check: () => {
          // two families of numbers with the right sum, found by searching for the last one, and the product as written
          const trial = (la, lb) => {
            const L = (lc) => [(lb + lc) / la, (la + lc) / lb, (la + lb) / lc], ws = rootsOf((lc) => sum(L(lc)) - S, 0.01, 60.03, 6000);
            if (!ws.length) return 'no numbers with that sum';
            const a = Math.exp(la), b = Math.exp(lb), c = Math.exp(ws[0]), lg2 = (u, v) => Math.log(v) / Math.log(u);
            return agree(lg2(a, b * c) * lg2(b, c * a) * lg2(c, a * b), ans, 'the product');
          };
          return both(trial(1, 1), trial(1, 2));
        },
        solution: `Name the logs in any one base: A = log a, B = log b and C = log c, all positive. Then the three logs are ${over('B + C', 'A')}, ${over('C + A', 'B')} and ${over('A + B', 'C')}. `
          + `Their product is ${over('(B + C)(C + A)(A + B)', 'ABC')}. Multiplying out the top gives A<sup>2</sup>B + A<sup>2</sup>C + B<sup>2</sup>A + B<sup>2</sup>C + C<sup>2</sup>A + C<sup>2</sup>B + 2ABC, so the product is ${over('A', 'C')} + ${over('A', 'B')} + ${over('B', 'C')} + ${over('B', 'A')} + ${over('C', 'B')} + ${over('C', 'A')} + 2. `
          + `Those six fractions are exactly what you get by splitting the three logs in the sum, so they add up to ${S}. So the product is ${S} + 2 = <b>${ans}</b>.`,
      };
    }
    const [n1, n2, n3] = pick(c3, 'plusone', [range(1, 6), range(1, 7), range(1, 6)], (n1, n2, n3) => {
      if (n1 === n2 || n2 === n3 || n1 === n3 || gcd(gcd(n1, n2), n3) !== 1) return false;
      return cut(n2 + n3, n1)[1] <= 5 && cut(n1 + n3, n2)[1] <= 5 && cut(n1 + n2, n3)[1] <= 5;
    });
    const p = cut(n2 + n3, n1), q = cut(n1 + n3, n2), r = cut(n1 + n2, n3), N = n1 + n2 + n3;
    const up = (x) => fa(x, [1, 1]);
    return {
      topic: LR, rank: 20,
      text: `Real numbers a, b and c are greater than 1, with ${lgb('a', 'bc')} = ${fr(p)} and ${lgb('b', 'ca')} = ${fr(q)}. What is ${lgb('c', 'ab')}?`,
      answer: fchoices(d, r, [fd(fm(p, q), fa(p, q)), fa(p, q), fm(cut(1, 2), fa(p, q)), up(r), cut(r[1], r[0]), fm(p, q)]),
      check: () => {
        // numbers that fit: a = e^{n₁}, b = e^{n₂}, c = e^{n₃}, scaled by any power, and the logs worked out as written
        return both(...[1, 0.5, 1.7].map((s) => {
          const a = Math.exp(s * n1), b = Math.exp(s * n2), c = Math.exp(s * n3), L = (u, v) => Math.log(v) / Math.log(u);
          return both(agree(L(a, b * c), val(p), 'first log'), agree(L(b, c * a), val(q), 'second log'), agree(L(c, a * b), val(r), 'third log'));
        }));
      },
      solution: `Adding 1 to a log puts one more factor of its base inside: ${lgb('a', 'bc')} + 1 = ${lgb('a', 'abc')}. `
        + `So ${lgb('a', 'abc')} = ${fr(up(p))} and ${lgb('b', 'abc')} = ${fr(up(q))}, and swapping base and number gives reciprocals: log<sub>abc</sub> a = ${fr(cut(n1, N))} and log<sub>abc</sub> b = ${fr(cut(n2, N))}. `
        + `The three logs in base abc add up to log<sub>abc</sub>(abc) = 1, so log<sub>abc</sub> c = 1 − ${fr(cut(n1, N))} − ${fr(cut(n2, N))} = ${fr(cut(n3, N))}. `
        + `Then ${lgb('c', 'abc')} = ${fr(cut(N, n3))}, and taking away the 1 again, ${lgb('c', 'ab')} = ${fr(cut(N, n3))} − 1 = <b>${fr(r)}</b>.`,
    };
  },
  // log_a b + log_b a given: an expression in t = log_a b, with or without solving for t
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['ratio', 'diff', 'mix']);
    const [[i, j]] = pick(c2, `pair-${form}`, [[[2, 1], [3, 1], [3, 2], [4, 1], [4, 3], [5, 2], [5, 3], [5, 1], [5, 4], [7, 2], [7, 3]]]);
    const s = cut(i * i + j * j, i * j), t = cut(j, i);
    const ans = { ratio: cut(i - j, i + j), diff: cut(j * j - i * i, i * j), mix: fa([2, 1], s) }[form];
    const what = { ratio: `log<sub>ab</sub>(${over('a', 'b')})`, diff: `${lg('a', 'b')} − ${lg('b', 'a')}`, mix: `${lgb('a', 'ab')}·${lgb('b', 'ab')}` }[form];
    const wrong = {
      ratio: [cut(i + j, i - j), t, cut(i - j, i), cut(j, i + j), cut(i, i + j)],
      diff: [cut(i * i - j * j, i * j), fs(t, [1, 1]), fs(s, [2, 1]), s, cut(j - i, i + j)],
      mix: [s, fa([1, 1], s), fs(s, [2, 1]), fm(s, s), fa(fm(s, s), [2, 1])],
    }[form];
    const solveT = `Write t = ${lg('a', 'b')}, so that ${lg('b', 'a')} = 1/t and t + 1/t = ${fr(s)}. Multiplying by ${i * j}t gives ${i * j}t<sup>2</sup> − ${i * i + j * j}t + ${i * j} = 0, which factors as (${cf(i, 't')} − ${j})(${cf(j, 't')} − ${i}) = 0, so t = ${fr(t)} or t = ${fr(cut(i, j))}. Since a > b > 1, ${lg('a', 'b')} is less than 1, so t = ${fr(t)}. `;
    return {
      topic: LR, rank: { ratio: 16, diff: 14, mix: 13 }[form],
      text: `Real numbers a and b satisfy a > b > 1 and ${lg('a', 'b')} + ${lg('b', 'a')} = ${fr(s)}. What is ${what}?`,
      answer: fchoices(d, ans, wrong),
      check: () => {
        const a = 2 ** i, b = 2 ** j, L = (u, v) => Math.log(v) / Math.log(u);
        const got = { ratio: L(a * b, a / b), diff: L(a, b) - L(b, a), mix: L(a, a * b) * L(b, a * b) }[form];
        return both(agree(L(a, b) + L(b, a), val(s), 'the condition'), agree(got, val(ans)));
      },
      solution: {
        ratio: `${solveT}Now use base a for both parts: log<sub>ab</sub>(${over('a', 'b')}) = ${over(`${lg('a', 'a')} − ${lg('a', 'b')}`, `${lg('a', 'a')} + ${lg('a', 'b')}`)} = ${over('1 − t', '1 + t')} = <b>${fr(ans)}</b>.`,
        diff: `${solveT}Then ${lg('a', 'b')} − ${lg('b', 'a')} = t − 1/t = ${fr(t)} − ${fr(cut(i, j))} = <b>${fr(ans)}</b>. It has to be negative, because the first log is less than 1 and the second is more than 1.`,
        mix: `There is no need to find a and b. Logs of a product add, and ${lg('a', 'a')} = ${lg('b', 'b')} = 1, so ${lgb('a', 'ab')} = 1 + ${lg('a', 'b')} and ${lgb('b', 'ab')} = 1 + ${lg('b', 'a')}. Multiplying out, and using (${lg('a', 'b')})(${lg('b', 'a')}) = 1, the product is 1 + ${lg('a', 'b')} + ${lg('b', 'a')} + 1 = 2 + ${fr(s)} = <b>${fr(ans)}</b>.`,
      }[form],
    };
  },
];

// ======================================================================================================================
// Equations with logs: change to one base, name the log, and check what the logs allow
// ======================================================================================================================
const EL = 'Equations with logs';
const logEquations = [
  // log_c x + log_{c²} x + log_{c⁴} x = K, and (log_a x)(log_b x) = m²·log_a b
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['bases', 'product']);
    if (form === 'bases') {
      const [c, E, mult] = pick(c2, 'bases', [[2, 3, 5], [[1, 2, 4], [1, 2, 3], [1, 3], [2, 3], [1, 2, 4, 8], [2, 4]], [1, 2, 3]], (c, E, mult) => {
        const co = E.reduce((s, e) => fa(s, cut(1, e)), [0, 1]), L = co[1] * mult;
        return c ** Math.max(...E) <= 125 && c ** L <= 1e6 && L >= 2;
      });
      const co = E.reduce((s, e) => fa(s, cut(1, e)), [0, 1]), L = co[1] * mult, K = co[0] * mult, ans = c ** L;
      return {
        topic: EL, rank: 7,
        text: `What positive real number x satisfies ${E.map((e) => lg(num(c ** e, 0), 'x')).join(' + ')} = ${K}?`,
        answer: fchoices(d, ans, [c ** (L + 1), c ** (L - 1), L, K, c ** K <= 1e7 ? c ** K : c ** (L + 2), c ** (L - 2)]),
        check: () => agree(sum(E.map((e) => Math.log(ans) / Math.log(c ** e))), K, 'the sum of logs'),
        solution: `Change every log to base ${c}, using log<sub>${c}<sup>e</sup></sub> x = ${over(1, 'e')}·${lg(c, 'x')}. With L = ${lg(c, 'x')}, the equation is (${E.map((e) => fr(cut(1, e))).join(' + ')})L = ${K}, that is, ${fr(co)}·L = ${K}. `
          + `So L = ${K} ÷ ${fr(co)} = ${L}, and x = ${sup(c, L)} = <b>${num(ans)}</b>.`,
      };
    }
    const [[a, b], m] = pick(c2, 'product', [[[2, 3], [3, 2], [2, 5], [5, 2], [3, 7], [7, 3], [4, 3], [5, 3]], [1, 2]]);
    const ans = fa([b ** m, 1], cut(1, b ** m)), rhs = `${m === 1 ? '' : `${m * m} `}${lg(a, b)}`;
    return {
      topic: EL, rank: 15,
      text: `What is the sum of all positive real numbers x for which (${lg(a, 'x')})(${lg(b, 'x')}) = ${rhs}?`,
      answer: fchoices(d, ans, [[b ** m, 1], [1, 1], fa([a ** m, 1], cut(1, a ** m)), fs([b ** m, 1], cut(1, b ** m)), [b ** (m + 1), 1], cut(2 * b ** m, 1)]),
      check: () => {
        const R = m * m * (Math.log(b) / Math.log(a)), ys = rootsOf((y) => (y / Math.log(a)) * (y / Math.log(b)) - R, -20.03, 20.01);
        return both(equal(ys.length, 2, 'how many solutions'), agree(sum(ys.map(Math.exp)), val(ans), 'the sum'));
      },
      solution: `Change to natural logs (any one base works): (${over('ln x', `ln ${a}`)})(${over('ln x', `ln ${b}`)}) = ${m === 1 ? '' : m * m}${over(`ln ${b}`, `ln ${a}`)}. `
        + `Multiplying both sides by (ln ${a})(ln ${b}) makes this (ln x)<sup>2</sup> = ${m === 1 ? '' : m * m}(ln ${b})<sup>2</sup>, so ln x = ${m === 1 ? '' : m}ln ${b} or ln x = −${m === 1 ? '' : m}ln ${b}. `
        + `The base ${a} has dropped out. The solutions are x = ${num(b ** m)} and x = ${fr(cut(1, b ** m))}, and they add up to <b>${fr(ans)}</b>.`,
    };
  },
  // two logs added: the quadratic's other root fails the domain; and with a squared argument, cases by the absolute value
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['one', 'count']);
    if (form === 'one') {
      const PAIRS = [[2, 4, 8, 2], [2, 4, 16, 1], [2, 5, 8, 4], [2, 5, 16, 2], [2, 5, 32, 1], [3, 3, 9, 3], [3, 3, 27, 1], [3, 4, 27, 3], [3, 4, 81, 1], [10, 2, 25, 4], [10, 2, 20, 5], [10, 2, 50, 2], [10, 1, 5, 2], [6, 2, 9, 4], [6, 2, 12, 3], [6, 2, 18, 2]];
      const [[b, k, e, f], p] = pick(c2, 'domain', [PAIRS, range(-5, 6)], ([, , e, f], p) => p !== 0 && p + e - f !== 0);
      const q = p + e - f, B = b ** k, ans = p + e, other = p - f;
      return {
        topic: EL, rank: 13,
        text: `What is the sum of all real numbers x that satisfy ${lgb(b, shift('x', -p))} + ${lgb(b, shift('x', -q))} = ${k}?`,
        answer: fchoices(d, ans, [p + q, other, e, q, ans + 1, ans - 1]),
        check: () => {
          const xs = rootsOf((x) => (Math.log(x - p) + Math.log(x - q)) / Math.log(b) - k, Math.max(p, q), Math.max(p, q) + e + f + 12);
          return both(equal(xs.length, 1, 'how many solutions'), agree(sum(xs), ans, 'the sum'));
        },
        solution: `Logs add when their numbers multiply, so (${shift('x', -p)})(${shift('x', -q)}) = ${b}<sup>${k}</sup> = ${num(B)}. `
          + `Multiplying out, x<sup>2</sup>${signed(-(p + q), 'x')}${signed(p * q - B)} = 0, which factors as (${shift('x', -ans)})(${shift('x', -other)}) = 0. `
          + `But a log needs a positive number: both x ${p < 0 ? '+' : '−'} ${Math.abs(p)} and x ${q < 0 ? '+' : '−'} ${Math.abs(q)} must be positive, so x > ${num(q)}. `
          + `That rules out x = ${num(other)}, and only x = ${num(ans)} is left. So the sum is <b>${num(ans)}</b>, not the ${num(p + q)} that Vieta would give.`,
      };
    }
    const [b, k, dd, p] = pick(c2, 'squared', [[2, 3], [1, 2, 3], range(3, 12), [1, 2, 3, -1, -2, 4]], (b, k, dd) => dd * dd >= 4 * b ** k && dd >= 3);
    const B = b ** k, q = p + dd, tangent = dd * dd === 4 * B, ans = tangent ? 2 : 3;
    const inner = tangent ? `Its discriminant is ${dd}<sup>2</sup> − 4·${B} = 0, so there is one value, u = ${num(dd / 2)}, which is between 0 and ${dd}` : `Its discriminant is ${dd}<sup>2</sup> − 4·${B} = ${dd * dd - 4 * B}, which is positive, and the two roots add up to ${dd} and multiply to ${B}, so both are between 0 and ${dd}. That gives two values`;
    return {
      topic: EL, rank: 18,
      text: `How many real numbers x satisfy ${lgb(b, shift('x', -p))} + ${lgb(num(b * b, 0), `(${shift('x', -q)})<sup>2</sup>`)} = ${k}?`,
      answer: fchoices(d, ans, [1, 2, 3, 4, 0]),
      check: () => {
        const f = (x) => Math.log(x - p) / Math.log(b) + Math.log((x - q) ** 2) / Math.log(b * b) - k;
        const xs = rootsOf(f, p, q + B + dd + 12, 6000);
        if (tangent && Math.abs(f(p + dd / 2)) < 1e-9 && !xs.some((x) => Math.abs(x - p - dd / 2) < 1e-6)) xs.push(p + dd / 2);
        return equal(xs.length, ans, 'how many solutions');
      },
      solution: `The second log is ${lgb(num(b * b, 0), `(${shift('x', -q)})<sup>2</sup>`)} = ${lg(b, `|${shift('x', -q)}|`)}, since squaring the base and squaring the number cancel. The squared number stays positive even when x is below ${num(q)}, so x only has to be above ${num(p)}, and x = ${num(q)} is out. `
        + `The equation is now (${shift('x', -p)})·|${shift('x', -q)}| = ${B}. Write u = ${shift('x', -p)}, which is positive, so ${shift('x', -q)} = u − ${dd}. `
        + `If x > ${num(q)}, then u(u − ${dd}) = ${B}, and u<sup>2</sup> − ${dd}u − ${B} = 0 has one positive root, which is above ${dd} (the product of the roots is negative). That gives one solution. `
        + `If x is between ${num(p)} and ${num(q)}, then u(${dd} − u) = ${B}, that is, u<sup>2</sup> − ${dd}u + ${B} = 0. ${inner}. `
        + `In all there are <b>${ans}</b> solutions.`,
    };
  },
  // (log_{ax} N)(log_{bx} N) = log_{ex} N, everything a power of c: a quadratic in y = log_c x, and Vieta for the product
  (d, ctx) => {
    const [c, r, s, t, m] = pick(ctx, 'xbase', [[2, 3, 5], range(1, 4), range(1, 4), range(1, 5), range(2, 7)], (c, r, s, t, m) => {
      const e = m - r - s, D = (r + s - m) ** 2 - 4 * (r * s - m * t);
      return r < s && t !== r && t !== s && e !== 0 && Math.abs(e) <= 3 && D > 0 && c ** Math.max(s, t) <= 125 && c ** m <= 3125 && r + s !== m + 1;
    });
    const a = c ** r, b = c ** s, ex = c ** t, N = c ** m, e = m - r - s, ans = pw(c, e), lin = r + s - m, cons = r * s - m * t, D = lin * lin - 4 * cons;
    const term = (u, sh) => `log<sub>${num(u, 0)}x</sub> ${num(N, 0)}`;
    return {
      topic: EL, rank: 18,
      text: `What is the product of all positive real numbers x for which (${term(a)})(${term(b)}) = ${term(ex)}?`,
      answer: fchoices(d, ans, [pw(c, -e), pw(c, e + 1), pw(c, e - 1), pw(c, m), pw(c, r + s), pw(c, m - t)]),
      check: () => {
        const base = (u, y) => Math.log(u) + y * Math.log(c), f = (y) => (Math.log(N) / base(a, y)) * (Math.log(N) / base(b, y)) - Math.log(N) / base(ex, y);
        const ys = rootsOf(f, -40.03, 40.01, 8000);
        return both(equal(ys.length, 2, 'how many solutions'), agree(ys.reduce((q, y) => q * c ** y, 1), val(ans), 'the product'));
      },
      solution: `Everything here is a power of ${c}, so let y = ${lg(c, 'x')}. Since ${num(a, 0)}x = ${c}<sup>${r} + y</sup>, change of base gives ${term(a)} = ${over(m, `${r} + y`)}, and in the same way the others are ${over(m, `${s} + y`)} and ${over(m, `${t} + y`)}. `
        + `The equation becomes ${over(m, `${r} + y`)}·${over(m, `${s} + y`)} = ${over(m, `${t} + y`)}. Clearing fractions and dividing by ${m}: ${m}(${t} + y) = (${r} + y)(${s} + y), so y<sup>2</sup>${signed(lin, 'y')}${signed(cons)} = 0. `
        + `The discriminant is ${D}, which is positive, so there are two real values of y, and neither is ${num(-r)}, ${num(-s)} or ${num(-t)} (those would make a base equal to 1, and putting them in does not give 0). `
        + `The product of the two solutions is ${c}<sup>y₁</sup>·${c}<sup>y₂</sup> = ${c}<sup>y₁ + y₂</sup>, and by Vieta y₁ + y₂ = ${num(-lin)}. So the product is ${c}<sup>${num(-lin)}</sup> = <b>${fr(ans)}</b>.`,
    };
  },
  // log_x(y^{ax}) = p and log_y(x^{by}) = r: bring the powers down, then multiply, and the two logs cancel
  (d, ctx) => {
    const [a, b, p, r] = pick(ctx, 'crossed', [[1, 2, 3, 4], [1, 2, 3, 4], range(2, 12), range(2, 12)], (a, b, p, r) => {
      const q = cut(p * r, a * b);
      return p * r > a * b && q[1] <= 4 && p !== r && !(a === 1 && b === 4 && p === 10 && r === 10);
    });
    const ans = cut(p * r, a * b), ex = (c, v) => `${c === 1 ? '' : c}${v}`;
    return {
      topic: EL, rank: 20,
      text: `Real numbers x and y, both greater than 1, satisfy ${lgb('x', sup('y', ex(a, 'x')))} = ${p} and ${lgb('y', sup('x', ex(b, 'y')))} = ${r}. What is xy?`,
      answer: fchoices(d, ans, [[p * r, 1], cut(p + r, a * b), cut(p * r, a + b), cut(p * r * a, b), cut(p * r * b, a)]),
      check: () => {
        // find x and y: with t = log_x y the first equation gives x = p/(at), the second y = rt/b, and y = xᵗ pins down t
        const g = (t) => t * Math.log(p / (a * t)) - Math.log((r * t) / b), lo = b / r, hi = p / a;
        const ts = rootsOf(g, lo, hi, 2000);
        if (!ts.length) return 'no solution with x and y above 1';
        const x = p / (a * ts[0]), y = (r * ts[0]) / b;
        return both(agree((a * x * Math.log(y)) / Math.log(x), p, 'the first equation'), agree((b * y * Math.log(x)) / Math.log(y), r, 'the second equation'), agree(x * y, val(ans), 'xy'));
      },
      solution: `An exponent inside a log comes out in front, even when it has a variable in it: ${ex(a, 'x')}·${lg('x', 'y')} = ${p} and ${ex(b, 'y')}·${lg('y', 'x')} = ${r}. `
        + `Neither equation can be solved alone, but ${lg('x', 'y')} and ${lg('y', 'x')} are reciprocals, so multiplying the two equations makes them cancel: ${a * b === 1 ? '' : a * b}xy = ${p}·${r} = ${p * r}. `
        + `So xy = <b>${fr(ans)}</b>.`,
    };
  },
  // (log_b a)ⁿ = n·log_b a: every b gives the same number of values of a, and the parity of n decides how many
  (d, ctx) => {
    const [n, N] = pick(ctx, 'pairs', [[3, 4, 5, 6, 7, 8, 9, 11, 13], [30, 50, 60, 75, 80, 100, 120, 150]]);
    const each = n % 2 ? 3 : 2, ans = each * (N - 1);
    return {
      topic: EL, rank: 16,
      text: `Let b be an integer from 2 to ${N} and let a be a positive real number. For how many such pairs (a, b) is (${lg('b', 'a')})<sup>${n}</sup> equal to ${lgb('b', sup('a', n))}?`,
      answer: fchoices(d, ans, [(n % 2 ? 2 : 3) * (N - 1), N - 1, each * N, 4 * (N - 1), n * (N - 1), (each - 1) * N]),
      check: () => {
        let cnt = 0;
        for (let bb = 2; bb <= N; bb += 1) {
          const ls = rootsOf((L) => L ** n - (n * Math.log(bb ** L)) / Math.log(bb), -4.03, 4.01, 400);
          cnt += ls.length;
        }
        return equal(cnt, ans, 'pairs');
      },
      solution: `Fix b and let L = ${lg('b', 'a')}. An exponent inside a log comes out in front, so the equation says L<sup>${n}</sup> = ${n}L. Each value of L gives exactly one a = b<sup>L</sup>, so count the values of L. `
        + `One is L = 0 (that is, a = 1). Otherwise, divide by L to get L<sup>${n - 1}</sup> = ${n}. `
        + (n % 2 ? `The exponent ${n - 1} is even, so this has two real solutions, one positive and one negative. ` : `The exponent ${n - 1} is odd, so this has just one real solution. `)
        + `So each b gives ${each} values of a. With ${N - 1} values of b, there are ${each}·${N - 1} = <b>${num(ans)}</b> pairs.`,
    };
  },
  // log_x c + log_{c^p x} c + log_{c^q x} c = s: with y = log_c x it is a sum of three reciprocals, a cubic with three real
  // roots (one between each pair of poles, one beyond), so Vieta gives the product of the solutions x = c^y
  (d, ctx) => {
    const [c, [p, q], e] = pick(ctx, 'threelogs', [[2, 3, 5, 7, 10], [[1, 2], [1, 3], [2, 3], [1, 4], [2, 4]], [-1, 0, 1, 2, 3]], (c, [p, q], e) => e + p + q > 0 && (e !== 0 || c === 2 || c === 3) && c ** (q) <= 1000);
    const s = cut(3, e + p + q), ans = pw(c, e), B1 = num(c ** p, 0), B2 = num(c ** q, 0), L = (b) => lg(b, c);
    const co2 = fs(fm(s, [p + q, 1]), [3, 1]), co1 = fs(fm(s, [p * q, 1]), [2 * (p + q), 1]), sumY = cut(e, 1);
    const fterm = (x, v) => (x[0] === 0 ? '' : ` ${x[0] < 0 ? '−' : '+'} ${x[0] === x[1] || -x[0] === x[1] ? '' : fr([Math.abs(x[0]), x[1]])}${v}`);
    const cub = `${s[0] === s[1] ? '' : fr(s)}y<sup>3</sup>${fterm(co2, 'y<sup>2</sup>')}${fterm(co1, 'y')} − ${p * q} = 0`;
    return {
      topic: EL, rank: 23,
      text: `What is the product of all positive real numbers x for which ${L('x')} + ${L(`${B1}x`)} + ${L(`${B2}x`)} = ${fr(s)}?`,
      answer: fchoices(d, ans, [pw(c, -e), pw(c, e + 1), pw(c, e - p - q), pw(c, e + p + q), pw(c, 3 * (e + p + q)), [1, c]]),
      check: () => {
        const f = (y) => { const x = c ** y; return Math.log(c) / Math.log(x) + Math.log(c) / Math.log(c ** p * x) + Math.log(c) / Math.log(c ** q * x) - val(s); };
        const ys = rootsOf(f, -60.03, 60.01, 24000);
        return both(equal(ys.length, 3, 'how many solutions'), agree(ys.reduce((m, y) => m * c ** y, 1), val(ans), 'the product'));
      },
      solution: `Let y = ${lg(c, 'x')}. Change of base gives ${L('x')} = ${over(1, 'y')}, ${L(`${B1}x`)} = ${over(1, `y + ${p}`)} and ${L(`${B2}x`)} = ${over(1, `y + ${q}`)}. So the equation is ${over(1, 'y')} + ${over(1, `y + ${p}`)} + ${over(1, `y + ${q}`)} = ${fr(s)}, where y can’t be 0, −${p} or −${q}. `
        + `Clearing fractions, ${fr(s)}·y(y + ${p})(y + ${q}) = (y + ${p})(y + ${q}) + y(y + ${q}) + y(y + ${p}), which is ${cub}. `
        + `All three roots are real and allowed: the left side of the fractional equation falls from very large to very negative between each pair of the numbers −${q}, −${p} and 0, and from very large down toward 0 above 0, so ${fr(s)} is reached once in each of those three intervals. `
        + `So there are three solutions x = ${c}<sup>y</sup>, and their product is ${c} to the power y₁ + y₂ + y₃. By Vieta, that sum is ${co2[0] === 0 ? `0, since the cubic has no y<sup>2</sup> term` : `${fr(cut(-co2[0], co2[1]))} ÷ ${fr(s)} = ${num(sumY[0])}`}. So the product is ${c}<sup>${num(e)}</sup> = <b>${fr(ans)}</b>.`,
    };
  },
];

// ======================================================================================================================
// Logs and whole numbers: how many digits, which bases make a log whole or rational, sums of rounded logs
// ======================================================================================================================
const LW = 'Logs and whole numbers';
const digitsOf = (n) => BigInt(n).toString().length;
const expOf = (b, n) => { let e = 0, v = b; while (v <= n) { v *= b; e++; } return e; };   // ⌊log_b n⌋, by multiplying
const kthRoot = (N, r) => { let a = 1; while ((a + 1) ** r <= N) a++; return a; };          // ⌊N^(1/r)⌋
const divisors = (n) => range(1, n).filter((k) => n % k === 0);
const logWhole = [
  // the digits of 4ˣ·5ʸ·3ᶻ: pair off the 2s and 5s into tens
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['digits', 'floor']);
    const [[f2, f5], x, y, z] = pick(c2, 'digits', [[[2, 1], [3, 1], [1, 2], [2, 3], [3, 2]], range(4, 12), range(5, 24), [1, 2, 3, 4, 5, 6, 7]], ([f2, f5], x, y, z) => {
      const a = f2 * x, b = f5 * y;
      return a !== b && Math.abs(a - b) <= 9 && (a > b ? 2 : 5) ** Math.abs(a - b) * 3 ** z <= 200000 && !(f2 === 3 && x === 5);
    });
    const a = f2 * x, b = f5 * y, tens = Math.min(a, b), left = a > b ? 2 : 5, extra = Math.abs(a - b), rest = left ** extra * 3 ** z, D = tens + digitsOf(rest);
    const N = `${sup(2 ** f2, x)}·${sup(5 ** f5, y)}·${sup(3, z)}`, ans = form === 'digits' ? D : D - 1;
    return {
      topic: LW, rank: form === 'digits' ? 9 : 10,
      text: form === 'digits' ? `How many digits does ${N} have when it is written in base ten?` : `What is the greatest integer that is less than or equal to log<sub>10</sub>(${N})?`,
      answer: fchoices(d, ans, [ans + 1, ans - 1, a + b, tens, tens + z, ans + 2, ans - 2]),
      check: () => equal(digitsOf(BigInt(2 ** f2) ** BigInt(x) * BigInt(5 ** f5) ** BigInt(y) * 3n ** BigInt(z)) - (form === 'digits' ? 0 : 1), ans),
      solution: `Written with primes, the number is ${sup(2, a)}·${sup(5, b)}·${sup(3, z)}. Each pair of a 2 and a 5 makes a 10, and there are ${tens} pairs. That leaves ${sup(left, extra)}·${sup(3, z)} = ${num(rest)} times ${sup(10, tens)}. `
        + `So the number is ${num(rest)} followed by ${tens} zeros, which has ${digitsOf(rest)} + ${tens} = ${D} digits. `
        + (form === 'digits' ? `The answer is <b>${D}</b>.` : `A number with ${D} digits is at least ${sup(10, D - 1)} and below ${sup(10, D)}, so the rounded-down log is ${D} − 1 = <b>${ans}</b>.`),
    };
  },
  // 2ᴺ has d digits: then 5ᴺ has N + 1 − d, and exactly one power of 2 of each length starts with 1 (and 5ᵏ starts with 1
  // just when doubling 2ᵏ adds a digit)
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['five', 'fiveFirst', 'first', 'not']);
    const [N] = pick(c2, `lead-${form}`, [[100, 150, 200, 250, 300, 350, 400, 500, 600, 700, 800, 1000, 1200, 1500, 2000]]);
    const D = digitsOf(2n ** BigInt(N)), ans = { five: N + 1 - D, fiveFirst: D - 1, first: D - 1, not: N + 1 - D }[form];
    const pow2 = sup(2, N), pow5 = sup(5, N);
    const why = `Doubling adds at most one digit, and when it does add one, the new number is at least a power of 10 and below twice that power, so it starts with 1. A power of 2 that starts with 1 must be the first of its length, since half of it has one digit fewer. So there is exactly one such power for each length. `;
    return {
      topic: LW, rank: { five: 15, fiveFirst: 23, first: 18, not: 18 }[form],
      text: {
        five: `The number ${pow2} has ${D} digits in base ten. How many digits does ${pow5} have?`,
        fiveFirst: `The number ${pow2} has ${D} digits in base ten. How many integers k with 1 ≤ k ≤ ${N - 1} make the first digit of ${sup(5, 'k')} equal to 1?`,
        first: `The number ${pow2} has ${D} digits in base ten. How many of the numbers ${sup(2, 1)}, ${sup(2, 2)}, ${sup(2, 3)}, …, ${pow2} have first digit 1?`,
        not: `The number ${pow2} has ${D} digits in base ten. How many of the ${num(N + 1)} numbers ${sup(2, 0)}, ${sup(2, 1)}, ${sup(2, 2)}, …, ${pow2} have a first digit other than 1?`,
      }[form],
      answer: fchoices(d, ans, form === 'five' ? [N - D, N + 2 - D, D, N - 2 * D, N + D] : form === 'not' ? [N - D, N + 2 - D, D, N - D + 2, N - D - 1] : [D, D + 1, D - 2, N - D, Math.floor(N / 3)]),
      check: () => {
        if (form === 'five') return equal(digitsOf(5n ** BigInt(N)), ans, 'digits of the power of 5');
        if (form === 'fiveFirst') { let v = 1n, ones = 0; for (let k = 1; k <= N - 1; k++) { v *= 5n; if (v.toString()[0] === '1') ones++; } return equal(ones, ans); }
        let v = form === 'first' ? 2n : 1n, ones = 0, all = 0;
        for (let k = form === 'first' ? 1 : 0; k <= N; k++) { if (v.toString()[0] === '1') ones++; all++; v *= 2n; }
        return equal(form === 'first' ? ones : all - ones, ans);
      },
      solution: {
        five: `Say ${pow5} has e digits. Then ${pow2} is strictly between 10<sup>${D - 1}</sup> and 10<sup>${D}</sup>, and ${pow5} is strictly between 10<sup>e − 1</sup> and 10<sup>e</sup>. Multiplying, ${pow2}·${pow5} = ${sup(10, N)} is strictly between 10<sup>${D - 1} + e − 1</sup> and 10<sup>${D} + e</sup>. `
          + `So ${num(N, 0)} is strictly between ${D - 2} + e and ${D} + e, which leaves ${num(N, 0)} = ${D - 1} + e. So e = <b>${num(ans)}</b>.`,
        fiveFirst: `Link the powers of 5 to the powers of 2 through ${sup(2, 'k')}·${sup(5, 'k')} = ${sup(10, 'k')}. The number ${sup(5, 'k')} starts with 1 exactly when it is between a power of 10 and twice that power. Dividing ${sup(10, 'k')} by it, that happens exactly when ${sup(2, 'k')} is between half of a power of 10 and that power of 10, that is, when ${sup(2, 'k')} starts with 5, 6, 7, 8 or 9. `
          + `That happens exactly when doubling ${sup(2, 'k')} adds a digit. So we are counting the k from 1 to ${N - 1} for which ${sup(2, 'k + 1')} has one more digit than ${sup(2, 'k')}. `
          + `Going from ${sup(2, 1)}, with 1 digit, up to ${pow2}, with ${D} digits, the number of digits goes up by one exactly ${D} − 1 times. So the answer is <b>${num(ans)}</b>.`,
        first: `${why}The lengths run from 1 to ${D}, which is ${D} powers starting with 1. But the one of length 1 is ${sup(2, 0)} = 1, which is not on this list. So the count is ${D} − 1 = <b>${num(ans)}</b>.`,
        not: `${why}The lengths run from 1 to ${D}, so ${D} of the numbers start with 1 (${sup(2, 0)} = 1 is one of them). The other ${num(N + 1)} − ${D} = <b>${num(ans)}</b> do not.`,
      }[form],
    };
  },
  // which bases make a log a whole number or a rational number
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['bases', 'pairs', 'rational']);
    if (form === 'rational') {
      const [c, e, L] = pick(c2, 'rational', [[2, 3, 5, 6, 7, 10], [6, 8, 10, 12, 15, 18], [100, 200, 500, 1000, 3000]], (c, e, L) => expOf(c, L) >= 2 && c ** e <= 1e15);
      const ans = expOf(c, L), powers = range(1, ans).map((k) => num(c ** k, 0));
      const inRange = divisors(e).filter((k) => c ** k <= L).length;
      return {
        topic: LW, rank: 14,
        text: `For how many integers b with 2 ≤ b ≤ ${num(L, 0)} is ${lgb('b', sup(c, e))} a rational number?`,
        answer: fchoices(d, ans, [inRange, ans + 1, ans - 1, divisors(e).length, e, 2 * ans]),
        check: () => {
          // the prime exponents of b must be in proportion to those of c
          const ex = (v) => { const o = {}; for (let f = 2; f <= v; f++) while (v % f === 0) { o[f] = (o[f] || 0) + 1; v /= f; } return o; };
          const Ec = ex(c), ks = Object.keys(Ec); let n = 0;
          for (let b = 2; b <= L; b++) { const Eb = ex(b); if (Object.keys(Eb).length === ks.length && ks.every((p) => Eb[p] * Ec[ks[0]] === Ec[p] * Eb[ks[0]])) n++; }
          return equal(n, ans);
        },
        solution: `If ${lgb('b', sup(c, e))} = r/s with whole numbers r and s, then b<sup>r</sup> = ${c}<sup>${e}s</sup>, so b has the same prime factors as ${c}, in the same proportions. Since ${c} is not itself a perfect power, b must be a power of ${c}. `
          + `And every power of ${c} works: ${lgb(sup(c, 'k'), sup(c, e))} = ${e}/k. It does not have to be a whole number, so k need not divide ${e}. `
          + `The powers of ${c} from 2 to ${num(L, 0)} are ${listing(powers)}, so there are <b>${ans}</b>.`,
      };
    }
    const [[p, q], [u, v], g] = pick(c2, `base-${form}`, [[[2, 3], [2, 5], [3, 5], [2, 7]], [[1, 2], [2, 3], [3, 2], [2, 1], [3, 4], [1, 3]], [4, 6, 8, 9, 10, 12]], ([p, q], [u, v], g) => (g * u) * Math.log10(p) + (g * v) * Math.log10(q) <= 26);
    const A = g * u, Bv = g * v, ds = divisors(g), tau = ds.length, N = `${sup(p, A)}·${sup(q, Bv)}`, ans = form === 'bases' ? tau : tau - 1;
    return {
      topic: LW, rank: form === 'bases' ? 10 : 14,
      text: form === 'bases' ? `For how many integers b greater than 1 is ${lgb('b', N)} a positive integer?`
        : `How many ordered pairs (a, b) of integers greater than 1 satisfy ab = ${N} with ${lg('a', 'b')} a positive integer?`,
      answer: fchoices(d, ans, [g, tau + 1, Math.max(0, tau - 2), (A + 1) * (Bv + 1), (u + 1) * (v + 1), form === 'bases' ? tau - 1 : tau]),
      check: () => {
        let n = 0;
        // a = pⁱqʲ runs over every divisor; the exact test is on the exponents
        for (let i = 0; i <= A; i++) for (let j = 0; j <= Bv; j++) {
          if (i === 0 && j === 0) continue;
          const [X, Y] = form === 'bases' ? [A, Bv] : [A - i, Bv - j];
          if (X === 0 && Y === 0) continue;
          const k = i ? X / i : Y / j;
          if (Number.isInteger(k) && k >= 1 && X === k * i && Y === k * j) n++;
        }
        return equal(n, ans);
      },
      solution: form === 'bases'
        ? `${lgb('b', N)} = k means b<sup>k</sup> = ${N}, and b is a whole number exactly when k divides both exponents, ${A} and ${Bv}. Their greatest common divisor is ${g}, so k can be any divisor of ${g}: ${listing(ds)}. Each k gives one base b, so there are <b>${ans}</b>.`
        : `${lg('a', 'b')} = k means b = a<sup>k</sup>. Then ab = a<sup>k + 1</sup> = ${N}, so m = k + 1 is at least 2 and a is the m-th root of ${N}. That is a whole number exactly when m divides both ${A} and ${Bv}, that is, m divides ${g}. The divisors of ${g} other than 1 are ${listing(ds.slice(1))}, and each gives one pair (a, a<sup>m − 1</sup>). So there are <b>${ans}</b> pairs.`,
    };
  },
  // sums over blocks: k from bʲ up to bʲ⁺¹ − 1 all have the same rounded-down log
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['floor', 'gap', 'even']);
    const [b, N] = pick(c2, `blocks-${form}`, [[2, 3, 5], [100, 150, 200, 300, 500, 700, 1000, 2000]], (b, N) => !(b === 5 && N < 200) && !(b === 2 && N > 1000) && expOf(b, N) >= 3);
    const top = expOf(b, N), blocks = range(0, top).map((j) => [j, Math.min(N, b ** (j + 1) - 1) - b ** j + 1]);
    const count = (j) => blocks[j][1], F = sum(blocks.map(([j, n]) => j * n)), E = sum(blocks.filter(([j]) => j % 2 === 0).map(([, n]) => n)), G = N - (top + 1);
    const ans = { floor: F, gap: G, even: E }[form];
    const fl = `⌊${lg(b, 'k')}⌋`, FL = `the greatest integer less than or equal to ${lg(b, 'k')}`;
    const lines = (ks) => ks.map(([j, n]) => `${fl} = ${j} for ${n === 1 ? `k = ${num(b ** j, 0)}` : `k = ${num(b ** j, 0)} to ${num(Math.min(N, b ** (j + 1) - 1), 0)}`} (${num(n, 0)} ${n === 1 ? 'number' : 'numbers'})`).join(', ');
    return {
      topic: LW, rank: { floor: 15, gap: 13, even: 16 }[form],
      text: {
        floor: `Let ${fl} be ${FL}. What is the sum of ${fl} over all integers k from 1 to ${num(N, 0)}?`,
        gap: `Let ⌈x⌉ be the least integer at least x and ⌊x⌋ the greatest integer at most x. What is the sum of ⌈${lg(b, 'k')}⌉ − ⌊${lg(b, 'k')}⌋ over all integers k from 1 to ${num(N, 0)}?`,
        even: `Let ${fl} be ${FL}. For how many integers k from 1 to ${num(N, 0)} is ${fl} even?`,
      }[form],
      answer: fchoices(d, ans, {
        floor: [F + N, F - count(top) * top, F + G, F - N, F + top],
        gap: [N - top, N, N - top - 2, top + 1, N - 1 - 2 * top],
        even: [N - E, E + 1, E - 1, E - count(0), E + top],
      }[form]),
      check: () => {
        let n = 0;
        for (let k = 1; k <= N; k++) {
          const e = expOf(b, k), exact = b ** e === k;     // k is a power of b exactly when the rounded-down log is the log itself
          n += form === 'floor' ? e : form === 'gap' ? (exact ? 0 : 1) : (e % 2 === 0 ? 1 : 0);
        }
        return equal(n, ans);
      },
      solution: {
        floor: `Group the numbers by the rounded-down log: ${lines(blocks)}. The sum is ${blocks.slice(1).map(([j, n]) => `${j}·${num(n, 0)}`).join(' + ')} = <b>${num(ans)}</b>.`,
        gap: `The difference is 0 when ${lg(b, 'k')} is a whole number and 1 otherwise, since then the two round to neighboring integers. So the sum counts the k that are not powers of ${b}. The powers of ${b} from 1 to ${num(N, 0)} are ${listing(range(0, top).map((j) => num(b ** j, 0)))}, which is ${top + 1} numbers (don’t forget ${b}<sup>0</sup> = 1). So the sum is ${num(N, 0)} − ${top + 1} = <b>${num(ans)}</b>.`,
        even: `Group the numbers by the rounded-down log: ${lines(blocks)}. The even values are ${listing(blocks.filter(([j]) => j % 2 === 0).map(([j]) => j))}, so the count is ${blocks.filter(([j]) => j % 2 === 0).map(([, n]) => num(n, 0)).join(' + ')} = <b>${num(ans)}</b>.`,
      }[form],
    };
  },
  // two harder counts: digits in base b against digits in base bᵐ, and when ⌊log_b n²⌋ is even
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['lengths', 'square']);
    if (form === 'lengths') {
      const [[b, m], N] = pick(c2, 'lengths', [[[2, 3], [2, 2], [3, 2], [2, 4], [5, 2]], [100, 200, 300, 500, 800, 1000, 2000, 3000, 5000]], ([b, m], N) => expOf(b, N) + 1 >= 2 * m);
      const c = b ** m, L = range(1, expOf(b, N) + 1).filter((l) => l % m === 0), rows = L.map((l) => [l, b ** (l - 1), Math.min(N, b ** l - 1)]).filter(([, lo, hi]) => hi >= lo);
      const ans = sum(rows.map(([, lo, hi]) => hi - lo + 1)), full = sum(rows.filter(([l]) => b ** l - 1 <= N).map(([, lo, hi]) => hi - lo + 1));
      return {
        topic: LW, rank: 20,
        text: `For how many positive integers n ≤ ${num(N, 0)} does writing n in base ${b} take exactly ${m} times as many digits as writing it in base ${c}?`,
        answer: fchoices(d, ans, [N - ans, full === ans ? ans + rows.length : full, ans + rows.length, ans - rows.length, Math.round(N / m)]),
        check: () => { let n = 0; for (let k = 1; k <= N; k++) if (k.toString(b).length === m * k.toString(c).length) n++; return equal(n, ans); },
        solution: `Each base ${c} digit is worth a block of ${m} base ${b} digits, so a number with L digits in base ${b} has L/${m} digits in base ${c}, rounded up. (In logs, L = ⌊${lg(b, 'n')}⌋ + 1.) `
          + `So the base ${b} length is exactly ${m} times the base ${c} length only when ${m} divides L. `
          + `The numbers with L base ${b} digits run from ${b}<sup>L − 1</sup> to ${b}<sup>L</sup> − 1 (or stop at ${num(N, 0)} if that comes first): ${rows.map(([l, lo, hi]) => `L = ${l} gives ${num(lo, 0)} to ${num(hi, 0)}, which is ${num(hi - lo + 1, 0)} numbers`).join(', ')}. `
          + `The total is <b>${num(ans)}</b>.`,
      };
    }
    const [b, N] = pick(c2, 'square', [[10, 2, 3, 5], [500, 1000, 2000, 3000, 5000, 8000, 20000, 40000]], (b, N) => (b === 10 ? N >= 1000 : N <= 5000));
    const rows = [];
    for (let j = 0; b ** j <= N; j++) { const hi = Math.min(N, isqrt(b ** (2 * j + 1) - 1)); rows.push([j, b ** j, hi]); }
    const ans = sum(rows.map(([, lo, hi]) => hi - lo + 1));
    return {
      topic: LW, rank: 20,
      text: `Let ⌊x⌋ be the greatest integer at most x. For how many integers n with 1 ≤ n ≤ ${num(N, 0)} is ⌊${lgb(b, sup('n', 2))}⌋ even?`,
      answer: fchoices(d, ans, [N - ans, ans + rows.length, ans - rows.length, Math.floor(N / 2), sum(rows.map(([, lo, hi]) => hi - lo))]),
      check: () => { let c = 0; for (let n = 1; n <= N; n++) if (expOf(b, n * n) % 2 === 0) c++; return equal(c, ans); },
      solution: `The value is the even number 2j exactly when ${b}<sup>2j</sup> ≤ n<sup>2</sup> and n<sup>2</sup> is below ${b}<sup>2j + 1</sup>. Taking square roots, n runs from ${b}<sup>j</sup> up to the last whole number below ${b}<sup>j</sup>·√${b}. Note that it does not go all the way up to ${b}<sup>j + 1</sup>. `
        + `So the good n come in blocks: ${rows.map(([j, lo, hi]) => (hi === lo ? `j = ${j} gives just ${num(lo, 0)}` : `j = ${j} gives ${num(lo, 0)} to ${num(hi, 0)} (${num(hi - lo + 1, 0)} numbers)`)).join(', ')}${rows.at(-1)[2] === N ? `, where the last block is cut off at ${num(N, 0)}` : ''}. `
        + `Adding these up gives <b>${num(ans)}</b>.`,
    };
  },
  // log_a b + k·log_b a = s, with a and b whole numbers up to N: b must be one of two powers of a
  (d, ctx) => {
    const [[r1, r2], N] = pick(ctx, 'powerpairs', [[[2, 3], [2, 4], [3, 4], [2, 5], [3, 5], [2, 6]], [100, 200, 300, 500, 1000, 1500, 2000]], ([r1, r2], N) => kthRoot(N, r2) >= 2);
    const k = r1 * r2, s = r1 + r2, m1 = kthRoot(N, r1), m2 = kthRoot(N, r2), ans = m1 - 1 + m2 - 1;
    const choicesOfA = (m) => (m === 2 ? 'a can only be 2, which is 1 pair' : `a can be 2 to ${m}, which is ${m - 1} pairs`);
    return {
      topic: LW, rank: 19,
      text: `How many ordered pairs (a, b) of integers with 2 ≤ a ≤ ${num(N, 0)} and 2 ≤ b ≤ ${num(N, 0)} satisfy ${lg('a', 'b')} + ${k} ${lg('b', 'a')} = ${s}?`,
      answer: fchoices(d, ans, [ans + 2, ans + 1, m1 - 1, m2 - 1, ans - 1, m1 * m2]),
      check: () => {
        const ln = range(0, N).map((v) => Math.log(v)); let c = 0;
        for (let a = 2; a <= N; a++) for (let b = 2; b <= N; b++) { const t = ln[b] / ln[a]; if (Math.abs(t + k / t - s) < 1e-9) c++; }
        return equal(c, ans, 'pairs');
      },
      solution: `Let t = ${lg('a', 'b')}, so ${lg('b', 'a')} = 1/t and t + ${k}/t = ${s}. Multiplying by t, t<sup>2</sup> − ${s}t + ${k} = 0, so (t − ${r1})(t − ${r2}) = 0. So b = ${sup('a', r1)} or b = ${sup('a', r2)}. `
        + `For b = ${sup('a', r1)} ≤ ${num(N, 0)}, ${choicesOfA(m1)}. For b = ${sup('a', r2)} ≤ ${num(N, 0)}, ${choicesOfA(m2)}. `
        + `No pair is in both lists, since ${sup('a', r1)} and ${sup('a', r2)} are different when a ≥ 2. The total is <b>${ans}</b>.`,
    };
  },
];

// ======================================================================================================================
// Exponential equations: chains of powers, quadratics in aˣ, equal powers, and hidden symmetry
// ======================================================================================================================
const EX = 'Exponential equations';
// log_a v as a choice: a whole number when v is a power of a, otherwise written as a log
const logLabel = (a, v) => { const e = Math.log(v) / Math.log(a), r = Math.round(e); return [e, Math.abs(e - r) < 1e-9 ? num(r, 0) : lg(a, num(v, 0))]; };
const exponential = [
  // a^(log_b x) = x^(log_b a): the two terms that look different are the same number
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['two', 'quad']);
    const [a, b] = pick(c2, `swap-${form}`, [[2, 3, 5], [2, 3, 5, 7]], (a, b) => a !== b);
    const [[m, n]] = pick(c2, `swapexp-${form}`, [form === 'two' ? [[1, 1], [2, 2], [3, 3], [4, 4]] : [[0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [0, 3]]], ([m, n]) => a ** (m + n) <= 20000);
    const L = lg(b, 'x'), left = `${a}<sup>${L}</sup>`, right = `x<sup>${lg(b, a)}</sup>`;
    const why = `Both ${left} and ${right} have the same log in base ${b}, namely (${L})(${lg(b, a)}). So they are the same number. `;
    if (form === 'two') {
      const c = 2 * a ** m, ans = b ** m;
      return {
        topic: EX, rank: 18,
        text: `What positive real number x satisfies ${left} + ${right} = ${num(c, 0)}?`,
        answer: fchoices(d, ans, [a ** m, m, b ** (m + 1), c, b ** (m + 2), a ** m + b ** m]),
        check: () => { const ts = rootsOf((t) => a ** t + (b ** t) ** (Math.log(a) / Math.log(b)) - c, -10.03, 12.01); return both(equal(ts.length, 1, 'solutions'), agree(b ** ts[0], ans, 'x')); },
        solution: `${why}The equation says 2·${left} = ${num(c, 0)}, so ${left} = ${num(c / 2, 0)} = ${sup(a, m)}. Then ${L} = ${m}, and x = ${sup(b, m)} = <b>${num(ans)}</b>.`,
      };
    }
    const u1 = a ** m, u2 = a ** n, c = u1 + u2, e = u1 * u2, ans = b ** (m + n);
    return {
      topic: EX, rank: 16,
      text: `What is the product of all positive real numbers x for which ${num(a * a, 0)}<sup>${L}</sup> − ${num(c, 0)}${right} + ${num(e, 0)} = 0?`,
      answer: fchoices(d, ans, [e, b ** m + b ** n, b ** n, c, a ** (m + n + 1), b ** (m + n + 1)]),
      check: () => {
        const ts = rootsOf((t) => { const x = b ** t, lb = Math.log(x) / Math.log(b); return (a * a) ** lb - c * x ** (Math.log(a) / Math.log(b)) + e; }, -8.03, 12.01, 6000);
        return both(equal(ts.length, 2, 'solutions'), agree(ts.reduce((q, t) => q * b ** t, 1), ans, 'the product'));
      },
      solution: `${why}Call that number u. The first term is ${num(a * a, 0)}<sup>${L}</sup> = (${left})<sup>2</sup> = u<sup>2</sup>, so the equation is u<sup>2</sup> − ${num(c, 0)}u + ${num(e, 0)} = 0, that is, (u − ${num(u1, 0)})(u − ${num(u2, 0)}) = 0. `
        + `So ${left} = ${sup(a, m)} or ${sup(a, n)}, which means ${L} = ${m} or ${n}, and x = ${num(b ** m, 0)} or x = ${num(b ** n, 0)}. The product is <b>${num(ans)}</b>.`,
    };
  },
  // 4ˣ − a·2ˣ + (a + c) = 0 with exactly one real x: what matters is how many positive roots the quadratic in u = 2ˣ has
  (d, ctx) => {
    const [c, N] = pick(ctx, 'oneroot', [[3, 8, 15, 2, 5, 6, 7, 10], [20, 25, 30, 40, 50, 60, 75, 100]]);
    const bonus = isSq(c + 1) ? 2 + 2 * isqrt(c + 1) : null, below = N - c, ans = below + (bonus !== null ? 1 : 0);
    return {
      topic: EX, rank: 21,
      text: `For how many integers a with −${N} ≤ a ≤ ${N} does ${sup(4, 'x')} − a·${sup(2, 'x')} + (a + ${c}) = 0 have exactly one real solution x?`,
      answer: fchoices(d, ans, [below, below + 1 === ans ? below - 1 : below + 1, below + 2, 2 * below, N - isqrt(c + 1), N + c]),
      check: () => {
        let n = 0;
        for (let a = -N; a <= N; a++) {
          const f = (x) => 4 ** x - a * 2 ** x + a + c, D = a * a - 4 * (a + c);
          let cnt = rootsOf(f, -30.03, 30.01, 1500).length;
          if (D === 0 && a > 0) cnt = 1;     // the curve only touches 0 there, so no change of sign shows it
          if (cnt === 1) n++;
        }
        return equal(n, ans);
      },
      solution: `Let u = ${sup(2, 'x')}, which can be any positive number, each from exactly one x. Then u<sup>2</sup> − au + (a + ${c}) = 0, and we want exactly one positive root. The product of the roots is a + ${c} and their sum is a. `
        + `If a + ${c} is negative, one root is positive and one is negative, which works. That is a = −${N} up to a = −${c + 1}, or ${below} values. `
        + `If a = −${c}, the roots are 0 and −${c}, neither positive. If a is above −${c} but at most 0, the roots can’t be positive, since their product is positive and their sum is not. `
        + `If a is positive, both the sum and the product are positive, so real roots are both positive, and there is exactly one only when it is a double root: a<sup>2</sup> − 4(a + ${c}) = 0. `
        + (bonus !== null ? `That gives a = 2 ± 2√${c + 1}, and the positive value is a = ${bonus}, one more. So the count is ${below} + 1 = <b>${ans}</b>.` : `That gives a = 2 ± 2√${c + 1}, which is not a whole number. So the count is <b>${ans}</b>.`),
    };
  },
  // (a²)ˣ − c·aˣ + e = 0: a quadratic in u = aˣ, where a negative u gives no x
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['sum', 'neg']);
    if (form === 'sum') {
      const [a, [u1, u2]] = pick(c2, 'quad-sum', [[2, 3, 5], [[1, 6], [2, 3], [3, 4], [1, 5], [2, 5], [3, 5], [2, 7], [1, 10], [3, 7], [2, 9], [4, 5], [3, 8]]], (a, [u1, u2]) => u1 !== a && u2 !== a);
      const e = u1 * u2, c = u1 + u2, ans = logLabel(a, e), f = (x) => (a * a) ** x - c * a ** x + e;
      return {
        topic: EX, rank: 12,
        text: `What is the sum of all real numbers x for which ${sup(num(a * a, 0), 'x')} − ${c}·${sup(a, 'x')} + ${e} = 0?`,
        answer: tchoices(ans, [logLabel(a, c), logLabel(a, u2), logLabel(a, 2 * e), logLabel(a, e + 1), logLabel(a, e * e), logLabel(a, c * c)]),
        check: () => { const xs = rootsOf(f, -20.03, 20.01); return both(equal(xs.length, 2, 'solutions'), agree(sum(xs), ans[0], 'the sum')); },
        solution: `Let u = ${sup(a, 'x')}, so that ${sup(num(a * a, 0), 'x')} = u<sup>2</sup> and the equation becomes u<sup>2</sup> − ${c}u + ${e} = 0, that is, (u − ${u1})(u − ${u2}) = 0. Both roots are positive, so each gives one x: ${sup(a, 'x')} = ${u1} or ${sup(a, 'x')} = ${u2}. `
          + `The two values of x are ${logLabel(a, u1)[1]} and ${logLabel(a, u2)[1]}, and logs of a product add. So the sum is log<sub>${a}</sub>(${u1}·${u2}) = <b>${ans[1]}</b>.`,
      };
    }
    const [a, m, v] = pick(c2, 'quad-neg', [[2, 3, 5], [1, 2, 3], [3, 5, 6, 7, 10, 11, 12]], (a, m, v) => logLabel(a, v)[1].includes('log') && a ** m !== v);
    const u = a ** m, lin = v - u, cons = u * v, ans = [m, num(m, 0)], f = (x) => (a * a) ** x + lin * a ** x - cons;
    return {
      topic: EX, rank: 12,
      text: `What is the sum of all real numbers x for which ${sup(num(a * a, 0), 'x')}${signed(lin, `·${sup(a, 'x')}`)} − ${num(cons, 0)} = 0?`,
      answer: tchoices(ans, [logLabel(a, cons), logLabel(a, v), [m + 1, num(m + 1, 0)], [0, '0'], [2 * m, num(2 * m, 0)], [m + 2, num(m + 2, 0)]]),
      check: () => { const xs = rootsOf(f, -20.03, 20.01); return both(equal(xs.length, 1, 'solutions'), agree(sum(xs), m, 'the sum')); },
      solution: `Let u = ${sup(a, 'x')}, so that ${sup(num(a * a, 0), 'x')} = u<sup>2</sup> and the equation becomes u<sup>2</sup>${signed(lin, 'u')} − ${num(cons, 0)} = 0, that is, (u − ${u})(u + ${v}) = 0. `
        + `A power of ${a} is always positive, so u = −${v} gives no real x. That leaves ${sup(a, 'x')} = ${u}, so x = ${m} is the only solution, and the sum is <b>${m}</b>.`,
    };
  },
  // p²ˣ − q²ʸ = N in integers: a difference of squares, and only one factor pair gives powers
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['sum', 'big']);
    const pairsOf = (N) => range(1, isqrt(N)).filter((e) => N % e === 0 && (e + N / e) % 2 === 0).map((e) => [e, N / e]);
    const sols = (p, q, N) => { const out = []; for (let x = 0; x <= 12; x++) for (let y = 0; y <= 12; y++) if (p ** (2 * x) - q ** (2 * y) === N) out.push([x, y]); return out; };
    const [[p, q], A, Bv] = pick(c2, 'diffsq', [[[2, 3], [3, 2], [2, 5], [5, 2], [3, 5], [5, 3]], range(1, 6), range(1, 4)], ([p, q], A, Bv) => {
      const N = p ** (2 * A) - q ** (2 * Bv);
      return N > 0 && N !== 55 && N <= 5000 && A + Bv >= 3 && pairsOf(N).length >= 2 && pairsOf(N).length <= 7 && sols(p, q, N).length === 1;
    });
    const N = p ** (2 * A) - q ** (2 * Bv), P = p ** A, R = q ** Bv, ps = pairsOf(N), ans = form === 'sum' ? A + Bv : P + R;
    return {
      topic: EX, rank: 17,
      text: `Integers x and y satisfy ${sup(p, '2x')} − ${sup(q, '2y')} = ${num(N, 0)}. What is ${form === 'sum' ? 'x + y' : `${sup(p, 'x')} + ${sup(q, 'y')}`}?`,
      answer: form === 'sum' ? fchoices(d, ans, [A * Bv, A, Bv, ans + 1, ans - 1, ans + 2]) : fchoices(d, ans, [P - R, N, P, ps.at(-1)[1], ps[0][1] === ans ? ans + 2 : ps[0][1], ans + 2]),
      check: () => {
        const found = sols(p, q, N);
        if (found.length !== 1) return `found ${found.length} solutions`;
        return equal(form === 'sum' ? found[0][0] + found[0][1] : p ** found[0][0] + q ** found[0][1], ans);
      },
      solution: `Negative exponents would leave a fraction, so x and y are at least 0. The left side is a difference of squares: (${sup(p, 'x')} − ${sup(q, 'y')})(${sup(p, 'x')} + ${sup(q, 'y')}) = ${num(N, 0)}. `
        + `Both factors are whole numbers of the same parity, so look at the factor pairs of ${num(N, 0)} with the same parity: ${ps.map(([e, f]) => `${num(e, 0)}·${num(f, 0)}`).join(', ')}. `
        + `Half the sum of a pair must be a power of ${p}, and half the difference must be a power of ${q}. Only ${num(P - R, 0)}·${num(P + R, 0)} does that: ${sup(p, 'x')} = ${num(P, 0)} and ${sup(q, 'y')} = ${num(R, 0)}, so x = ${A} and y = ${Bv}. `
        + `So ${form === 'sum' ? 'x + y' : `${sup(p, 'x')} + ${sup(q, 'y')}`} = <b>${num(ans)}</b>.`,
    };
  },
  // xʸ = yˣ with y = kx: take the x-th root, then x^(k − 1) = k
  (d, ctx) => {
    const [k, ask] = pick(ctx, 'xpowy', [[[3, 2], [4, 3], [3, 1], [5, 4]], ['sum', 'prod', 'diff']], (k, ask) => !(k[0] === 5 && ask === 'prod'));
    const n = k[1], rat = n !== 1, X = rat ? [k[0] ** n, n ** n] : null, Y = rat ? fm(X, k) : null;
    const how = { sum: 'x + y', prod: 'xy', diff: 'y − x' }[ask];
    const lab = (v, t) => [v, t], S3 = Math.sqrt(3);
    const ans = rat ? fv({ sum: fa(X, Y), prod: fm(X, Y), diff: fs(Y, X) }[ask]) : { sum: lab(4 * S3, '4√3'), prod: lab(9, '9'), diff: lab(2 * S3, '2√3') }[ask];
    const wrong = rat ? [fv(X), fv(Y), fv(fa(X, k)), fv(fm(k, k)), fv(fa(k, [1, 1])), fv(fm(X, [2, 1])), fv(k)]
      : [lab(S3, '√3'), lab(3 * S3, '3√3'), lab(3, '3'), lab(3 + S3, '3 + √3'), lab(6 * S3, '6√3'), lab(12, '12')];
    const K = fr(k), ex = rat ? fr(cut(1, n)) : '2', xText = rat ? fr(X) : '√3', yText = rat ? fr(Y) : '3√3';
    return {
      topic: EX, rank: 20,
      text: `Positive real numbers x and y satisfy y = ${rat ? `${K}x` : '3x'} and ${sup('x', 'y')} = ${sup('y', 'x')}. What is ${how}?`,
      answer: tchoices(ans, wrong),
      check: () => {
        const kv = val(k), xs = rootsOf((x) => kv * x * Math.log(x) - x * Math.log(kv * x), 0.05, 40.03, 8000);
        if (xs.length !== 1) return `found ${xs.length} solutions`;
        const x = xs[0], y = kv * x;
        return both(agree(x ** y, y ** x, 'the equation'), agree({ sum: x + y, prod: x * y, diff: y - x }[ask], ans[0]));
      },
      solution: `Put y = ${rat ? `${K}x` : '3x'} into the equation: ${sup('x', rat ? `${K}x` : '3x')} = ${sup(`(${rat ? `${K}x` : '3x'})`, 'x')}. Both sides are x-th powers, and two positive numbers with equal x-th powers are equal, so ${sup('x', K)} = ${K}x. `
        + `Dividing by x gives ${sup('x', rat ? `${fr(cut(k[0] - n, n))}` : '2')} = ${K}, so ${rat ? `x = ${sup(`(${K})`, n)} = ${xText}` : 'x = √3'}. Then y = ${K}·${xText} = ${yText}. `
        + `So ${how} = <b>${ans[1]}</b>.`,
    };
  },
  // 4ˣ = 5, 5ʸ = 6, 6ᶻ = 8: each power feeds the next, so the exponents multiply
  (d, ctx) => {
    const [[p, r, s], m1, m2, len] = pick(ctx, 'chain', [[[2, 2, 3], [2, 3, 2], [2, 2, 5], [2, 3, 4], [2, 4, 3], [3, 2, 3], [3, 3, 2], [5, 2, 3], [2, 3, 5], [3, 3, 4]], [5, 6, 7, 10, 11, 12], [6, 7, 10, 11, 12, 13, 14], [3, 4]], ([p], m1, m2) => m1 < m2 && m1 % p !== 0 && m2 % p !== 0);
    const first = p ** r, last = p ** s, mid = len === 3 ? [m1, m2] : [m1, m2, (m2 + 2) % p ? m2 + 2 : m2 + 3];
    const seq = [first, ...mid, last], vars = ['x', 'y', 'z', 'w'].slice(0, seq.length - 1), ans = cut(s, r);
    const eqs = vars.map((v, i) => `${sup(num(seq[i], 0), v)} = ${num(seq[i + 1], 0)}`);
    return {
      topic: EX, rank: 10,
      text: `Real numbers ${listing(vars)} satisfy ${listing(eqs)}. What is ${vars.join('')}?`,
      answer: fchoices(d, ans, [cut(r, s), [s - r < 0 ? r - s : s - r, 1], cut(last, first), [r * s, 1], fa(cut(s, r), [1, 1])]),
      check: () => agree(vars.reduce((m, v, i) => m * (Math.log(seq[i + 1]) / Math.log(seq[i])), 1), val(ans)),
      solution: `Put each equation into the next. Since ${num(mid[0], 0)} = ${sup(num(first, 0), 'x')}, we get ${sup(`(${sup(num(first, 0), 'x')})`, 'y')} = ${sup(num(first, 0), 'xy')} = ${num(seq[2], 0)}, and carrying on the same way, ${sup(num(first, 0), vars.join(''))} = ${num(last, 0)}. `
        + `Both sides are powers of ${p}: ${sup(num(first, 0), vars.join(''))} = ${sup(p, `${r}·${vars.join('')}`)} and ${num(last, 0)} = ${sup(p, s)}. So ${r}·${vars.join('')} = ${s}, and ${vars.join('')} = <b>${fr(ans)}</b>.`,
    };
  },
  // pᵃ = qᵇ = N with r/a + s/b = k: raise N to the power r/a + s/b
  (d, ctx) => {
    const [[p, q], i, j, k] = pick(ctx, 'equalpowers', [[[2, 3], [2, 5], [3, 5], [2, 7], [3, 7]], [1, 2, 3], [1, 2], [2, 3, 4]], ([p, q], i, j) => p ** i * q ** j <= 400);
    const r = k * i, s = k * j, ans = p ** i * q ** j;
    return {
      topic: EX, rank: 13,
      text: `Positive real numbers a and b and a number N satisfy ${sup(p, 'a')} = ${sup(q, 'b')} = N and ${over(r, 'a')} + ${over(s, 'b')} = ${k}. What is N?`,
      answer: fchoices(d, ans, [ans ** 2 <= 1e6 ? ans ** 2 : ans * p, p * q, p ** i + q ** j, ans * q, p ** r, r * p + s * q]),
      check: () => {
        const a = Math.log(ans) / Math.log(p), b = Math.log(ans) / Math.log(q);
        return both(agree(p ** a, ans, 'the first power'), agree(q ** b, ans, 'the second power'), agree(r / a + s / b, k, 'the condition'));
      },
      solution: `From ${sup(p, 'a')} = N we get ${p} = N<sup>1/a</sup>, and from ${sup(q, 'b')} = N we get ${q} = N<sup>1/b</sup>. `
        + `So ${sup(p, r)}·${sup(q, s)} = N<sup>${r}/a</sup>·N<sup>${s}/b</sup> = N<sup>${r}/a + ${s}/b</sup> = ${sup('N', k)}. `
        + `Taking the ${k === 2 ? 'square' : k === 3 ? 'cube' : 'fourth'} root of both sides, N = ${i === 1 ? p : sup(p, i)}·${j === 1 ? q : sup(q, j)} = <b>${num(ans)}</b>.`,
    };
  },
];

// ======================================================================================================================
// Complex arithmetic and modulus: |zw| = |z||w|, |z|² = z·z̄, and real and imaginary parts handled separately
// ======================================================================================================================
const CA = 'Complex arithmetic and modulus';
const PYTH = [[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [6, 8, 10]];
const csqrt = (a) => { const r = cabs(a), x = Math.sqrt((r + a[0]) / 2), y = Math.sqrt((r - a[0]) / 2); return [x, a[1] < 0 ? -y : y]; };
const iTerm = (v, c) => `${v} ${c < 0 ? '−' : '+'} ${Math.abs(c) === 1 ? '' : Math.abs(c)}i`;   // w + 3i, w − i
const complexArith = [
  // |z + w| is known: the parallelogram law, |1/z + 1/w| = |z + w|/|zw|, and Re(z·w̄)
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['recip', 'diff', 're']);
    const [A, Bv, C] = pick(c2, `norm-${form}`, [range(2, 9), range(2, 9), range(2, 12)], (A, Bv, C) => A < Bv && Bv - A < C && C < A + Bv && !(form === 're' && (C * C - A * A - Bv * Bv) === 0));
    const D2 = 2 * A * A + 2 * Bv * Bv - C * C, t = cut(C * C - A * A - Bv * Bv, 2);
    const given = `|z| = ${A}, |w| = ${Bv} and |z + w| = ${C}`, Sc = cut(C, A * Bv);
    const real = (fn) => { const co = (C * C - A * A - Bv * Bv) / (2 * A * Bv), w = [Bv * co, Bv * Math.sqrt(1 - co * co)], z = [A, 0]; return { same: agree(cabs(cadd(z, w)), C, '|z + w|'), got: fn(z, w) }; };
    if (form === 'diff') {
      const root = rootLabel, ans = root(D2);
      return {
        topic: CA, rank: 14,
        text: `Complex numbers z and w satisfy ${given}. What is |z − w|?`,
        answer: tchoices(ans, [root(A * A + Bv * Bv), root(2 * A * A + 2 * Bv * Bv), root(D2 + 2 * C * C), root(A * A + Bv * Bv + C * C), root((A + Bv) ** 2), [Math.abs(A + Bv - C), num(Math.abs(A + Bv - C), 0)], root(D2 + 1)]),
        check: () => { const r = real((z, w) => cabs(csub(z, w))); return both(r.same, agree(r.got, ans[0])); },
        solution: `Use |u|<sup>2</sup> = u·ū. Then |z + w|<sup>2</sup> = |z|<sup>2</sup> + |w|<sup>2</sup> + (z·w̄ + z̄·w) and |z − w|<sup>2</sup> = |z|<sup>2</sup> + |w|<sup>2</sup> − (z·w̄ + z̄·w). `
          + `Adding them, the mixed terms cancel: |z + w|<sup>2</sup> + |z − w|<sup>2</sup> = 2|z|<sup>2</sup> + 2|w|<sup>2</sup>, the parallelogram law. So |z − w|<sup>2</sup> = 2·${A * A} + 2·${Bv * Bv} − ${C * C} = ${D2}, and |z − w| = <b>${ans[1]}</b>.`,
      };
    }
    if (form === 'recip') {
      const inv = fa(cut(1, A), cut(1, Bv));
      return {
        topic: CA, rank: 15,
        text: `Complex numbers z and w satisfy ${given}. What is |${over(1, 'z')} + ${over(1, 'w')}|?`,
        answer: fchoices(d, Sc, [inv, cut(1, C), cut(C, A + Bv), cut(A + Bv, A * Bv * C), cut(A * Bv, C), [C, 1]]),
        check: () => { const r = real((z, w) => cabs(cadd(cdiv([1, 0], z), cdiv([1, 0], w)))); return both(r.same, agree(r.got, val(Sc))); },
        solution: `Combine the fractions: ${over(1, 'z')} + ${over(1, 'w')} = ${over('z + w', 'zw')}. The modulus of a quotient is the quotient of the moduli and |zw| = |z||w|, so the value is ${over('|z + w|', '|z||w|')} = ${over(C, `${A}·${Bv}`)} = <b>${fr(Sc)}</b>.`,
      };
    }
    return {
      topic: CA, rank: 14,
      text: `Complex numbers z and w satisfy ${given}. What is the real part of z·w̄?`,
      answer: fchoices(d, t, [[C * C - A * A - Bv * Bv, 1], cut(A * A + Bv * Bv - C * C, 2), cut(C * C - A * A - Bv * Bv, 4), cut(C * C, 2), cut(C * C + A * A + Bv * Bv, 2)]),
      check: () => { const r = real((z, w) => cmul(z, [w[0], -w[1]])[0]); return both(r.same, agree(r.got, val(t))); },
      solution: `Expand with |u|<sup>2</sup> = u·ū: |z + w|<sup>2</sup> = (z + w)(z̄ + w̄) = |z|<sup>2</sup> + |w|<sup>2</sup> + z·w̄ + z̄·w. The last two terms are conjugates, so they add up to 2 times the real part of z·w̄. `
        + `So ${C * C} = ${A * A} + ${Bv * Bv} + 2·Re(z·w̄), and Re(z·w̄) = ${over(`${C * C} − ${A * A} − ${Bv * Bv}`, 2)} = <b>${fr(t)}</b>.`,
    };
  },
  // z² + |z|² = a + bi: the imaginary parts of the squares cancel out of the real side
  (d, ctx) => {
    const [x, y] = pick(ctx, 'zsq', [[1, 2, 3, 4, 5], [-7, -6, -5, -3, -2, -1, 1, 2, 3, 4, 6, 7]], (x, y) => Math.abs(y) !== x);
    const a = 2 * x * x, b = 2 * x * y, ans = x * x + y * y;
    return {
      topic: CA, rank: 15,
      text: `A complex number z satisfies z<sup>2</sup> + |z|<sup>2</sup> = ${gi(a, b)}. What is |z|<sup>2</sup>?`,
      answer: fchoices(d, ans, [a, a + Math.abs(b), x * x, y * y, 2 * ans, Math.abs(y) * x]),
      check: () => {
        const xs = rootsOf((u) => { const v = b / (2 * u), z = [u, v], s = cmul(z, z); return s[0] + u * u + v * v - a; }, -15.03, 15.01);
        if (xs.length !== 2) return `found ${xs.length} solutions`;
        return both(...xs.map((u) => { const z = [u, b / (2 * u)], s = cadd(cmul(z, z), [z[0] * z[0] + z[1] * z[1], 0]); return both(agree(s[1], b, 'imaginary part'), agree(z[0] * z[0] + z[1] * z[1], ans, '|z|²')); }));
      },
      solution: `Write z = x + yi. Then z<sup>2</sup> = x<sup>2</sup> − y<sup>2</sup> + 2xyi and |z|<sup>2</sup> = x<sup>2</sup> + y<sup>2</sup>, so the left side is 2x<sup>2</sup> + 2xyi. `
        + `Matching real parts, 2x<sup>2</sup> = ${a}, so x<sup>2</sup> = ${x * x}. Matching imaginary parts, 2xy = ${num(b)}, so with x = ±${x}, y = ±${num(Math.abs(y))} and y<sup>2</sup> = ${y * y}. `
        + `There are two solutions, z and −z, with the same modulus. So |z|<sup>2</sup> = ${x * x} + ${y * y} = <b>${ans}</b>.`,
    };
  },
  // warm-ups: the modulus of a product and quotient of Pythagorean numbers, and the square root of a + bi
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['mod', 'sqrt']);
    if (form === 'mod') {
      const [t1, t2, t3, e, s] = pick(c2, 'mod', [PYTH, PYTH, PYTH, [2, 3], [[1, -1, 1], [1, 1, -1], [-1, 1, 1]]], (t1, t2, t3, e) => t1[2] !== t2[2] && t2[2] !== t3[2] && t1[2] !== t3[2] && t1[2] ** e * t2[2] <= 3000 && gcd(t1[2] ** e * t2[2], t3[2]) === 1);
      const w1 = [t1[0], s[0] * t1[1]], w2 = [t2[0], s[1] * t2[1]], w3 = [t3[0], s[2] * t3[1]], ans = cut(t1[2] ** e * t2[2], t3[2]);
      return {
        topic: CA, rank: 9,
        text: `What is the modulus |${over(`${sup(gp(...w1), e)}${gp(...w2)}`, gi(...w3))}|?`,
        answer: fchoices(d, ans, [cut(t1[2] * t2[2], t3[2]), cut(t3[2], t1[2] ** e * t2[2]), [t1[2] ** e * t2[2] * t3[2], 1], cut(e * t1[2] * t2[2], t3[2]), [t1[2] ** e * t2[2], 1]]),
        check: () => agree(cabs(cdiv(cmul(cpow(w1, e), w2), w3)), val(ans)),
        solution: `There is no need to multiply out, since the modulus of a product or quotient is the product or quotient of the moduli. Here |${gi(...w1)}| = √(${t1[0] ** 2} + ${t1[1] ** 2}) = ${t1[2]}, |${gi(...w2)}| = ${t2[2]} and |${gi(...w3)}| = ${t3[2]}. `
          + `So the value is ${over(`${sup(t1[2], e)}·${t2[2]}`, t3[2])} = <b>${fr(ans)}</b>.`,
      };
    }
    const [p, q] = pick(c2, 'sqrt', [range(1, 9), [-8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8]], (p, q) => p !== Math.abs(q) && gcd(p, Math.abs(q)) === 1 && p + q !== 0);
    const a = p * p - q * q, b = 2 * p * q, R = p * p + q * q, ans = p + q;
    return {
      topic: CA, rank: 12,
      text: `A complex number z with positive real part satisfies z<sup>2</sup> = ${gi(a, b)}. What is the sum of the real part and the imaginary part of z?`,
      answer: fchoices(d, ans, [p - q, q - p, -p - q, R, p, q, ans + 1, ans - 1]),
      check: () => { const z = csqrt([a, b]); return both(agree(z[0], p, 'real part'), agree(cmul(z, z)[0], a, 'the square'), agree(z[0] + z[1], ans)); },
      solution: `Write z = x + yi, so x<sup>2</sup> − y<sup>2</sup> = ${num(a)} and 2xy = ${num(b)}. A third equation comes from the modulus: |z|<sup>2</sup> = |z<sup>2</sup>| = √(${paren(a)}<sup>2</sup> + ${paren(b)}<sup>2</sup>) = ${R}, so x<sup>2</sup> + y<sup>2</sup> = ${R}. `
        + `Adding, 2x<sup>2</sup> = ${R} + ${paren(a)} = ${2 * p * p}, so x = ${p} (it is positive). Then y = ${num(b)} ÷ (2·${p}) = ${num(q)}. So x + y = <b>${num(ans)}</b>.`,
    };
  },
  // a quadratic with complex coefficients and one real root: the imaginary part alone finds it
  (d, ctx) => {
    const [t, u, v] = pick(ctx, 'realroot', [[-5, -3, -2, -1, 1, 2, 3, 4, 6], range(-5, 5), [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]], (t, u, v) => t !== u && t + u !== 0 && u !== 0);
    const S = [t + u, v], P = [t * u, t * v], ans = u * u + v * v;
    return {
      topic: CA, rank: 17,
      text: `The equation z<sup>2</sup> − ${gp(...S)}z + ${gp(...P)} = 0 has exactly one real root. If w is the other root, what is |w|<sup>2</sup>?`,
      answer: fchoices(d, ans, [S[0] * S[0] + S[1] * S[1], Math.abs(u * u - v * v), v * v, u * u, t * t + v * v, ans + t * t]),
      check: () => {
        const disc = csub(cmul(S, S), [4 * P[0], 4 * P[1]]), r = csqrt(disc), z1 = [(S[0] + r[0]) / 2, (S[1] + r[1]) / 2], z2 = [(S[0] - r[0]) / 2, (S[1] - r[1]) / 2];
        const [re, im] = Math.abs(z1[1]) < 1e-9 ? [z1, z2] : [z2, z1];
        return both(agree(Math.abs(re[1]), 0, 'the real root'), agree(im[0] * im[0] + im[1] * im[1], ans, '|w|²'));
      },
      solution: `Let x be the real root and split the equation into real and imaginary parts. The imaginary part is ${cf(-v, 'x')}${signed(t * v)} = 0, so x = ${num(t)}. (The real part, x<sup>2</sup>${signed(-(t + u), 'x')}${signed(t * u)}, is 0 there too.) `
        + `The product of the roots is ${gi(...P)}, so ${num(t)}·w = ${gi(...P)}, which gives w = ${gi(u, v)}. So |w|<sup>2</sup> = ${u * u} + ${v * v} = <b>${ans}</b>.`,
    };
  },
  // real coefficients with roots w + pi, w + 3pi and 2w − r: conjugate pairs decide which root is real
  (d, ctx) => {
    const [ask, c2] = turn(ctx, ['sum', 'c', 'b']);
    const [p, r] = pick(c2, `conj-${ask}`, [[1, 2, -1, -2, 4, 5, -3], [1, 2, 3, 5, 6, -1, -2, -3]], (p, r) => !(p === 3 && r === 4) && r !== 1);
    const a = -3 * r, b = 3 * r * r + 4 * p * p, c = -r * (r * r + 4 * p * p), ans = { sum: a + b + c, c, b }[ask];
    const what = { sum: 'a + b + c', c: 'c', b: 'b' }[ask];
    const R1 = iTerm('w', p), R2 = iTerm('w', 3 * p), R3 = shift('2w', -r);
    const eval1 = (1 - r) * ((1 - r) ** 2 + 4 * p * p);
    return {
      topic: CA, rank: 21,
      text: `For some complex number w, the three roots of z<sup>3</sup> + az<sup>2</sup> + bz + c are ${R1}, ${R2} and ${R3}, and a, b and c are real numbers. What is ${what}?`,
      answer: fchoices(d, ans, ask === 'sum' ? [ans + 2, -ans, eval1, a - b + c, b + c] : ask === 'c' ? [-c, b, c - r, c + r, r * r * r] : [b + 4 * p * p, 3 * r * r, b - 2 * p * p, r * r + 4 * p * p, 3 * r * r - 4 * p * p]),
      check: () => {
        // every w with whole-number parts, with the coefficients worked out exactly
        const found = [];
        for (let x = -40; x <= 40; x++) for (let y = -40; y <= 40; y++) {
          const R = [[x, y + p], [x, y + 3 * p], [2 * x - r, 2 * y]];
          const e1 = cadd(cadd(R[0], R[1]), R[2]), e2 = cadd(cadd(cmul(R[0], R[1]), cmul(R[1], R[2])), cmul(R[2], R[0])), e3 = cmul(cmul(R[0], R[1]), R[2]);
          if (e1[1] === 0 && e2[1] === 0 && e3[1] === 0) found.push([-e1[0], e2[0], -e3[0]]);
        }
        if (found.length !== 1) return `found ${found.length} values of w`;
        const [fa2, fb, fc] = found[0];
        return equal({ sum: fa2 + fb + fc, c: fc, b: fb }[ask], ans);
      },
      solution: `With real coefficients, the non-real roots come in conjugate pairs, so a cubic has a real root. Write w = x + yi. The imaginary parts of the three roots are ${shift('y', p)}, ${shift('y', 3 * p)} and 2y. `
        + `If y = 0, the other two have imaginary parts ${num(p)} and ${num(3 * p)}, which are not opposites. If y = ${num(-3 * p)}, the other two have ${num(-2 * p)} and ${num(-6 * p)}, again not opposites. So y = ${num(-p)}, and the imaginary parts are 0, ${num(2 * p)} and ${num(-2 * p)}. `
        + `The last two roots are conjugates, so their real parts match: x = 2x${signed(-r)}, so x = ${num(r)}. The roots are ${num(r)} and ${gi(r, 2 * p)} and ${gi(r, -2 * p)}. `
        + `So the polynomial is (z${signed(-r)})(z<sup>2</sup>${signed(-2 * r, 'z')} + ${r * r + 4 * p * p}) = z<sup>3</sup>${signed(a, 'z<sup>2</sup>')} + ${num(b)}z${signed(c)}, and ${what} = <b>${num(ans)}</b>.`,
    };
  },
  // A|z|² = B|z + p|² + |z² + q|² + C: everything is in terms of |z|² and z + z̄, and it completes to two squares
  (d, ctx) => {
    const [ask, c2] = turn(ctx, ['im2', 'abs', 'sq']);
    const [[q, Bv, p], al] = pick(c2, `squares-${ask}`, [[[1, 2, 1], [1, 2, 3], [1, 4, 1], [1, 1, 2], [1, 3, 2], [2, 4, 1], [2, 2, 2], [2, 4, 3], [3, 6, 1], [3, 3, 2]], [2, 3, 4, 5, 7, 8, 10]], ([q, Bv, p], al) => {
      const be = (Bv * p) / (2 * q);
      return Number.isInteger(be) && be * be < 4 * al && !(q === 1 && Bv === 2 && p === 2);
    });
    const be = (Bv * p) / (2 * q), A = Bv - 2 * q + 2 * al, C = al * al + q * be * be - Bv * p * p - q * q;
    const s = -be, im2 = cut(4 * al - be * be, 4), ans = { im2, abs: [al + s + 1, 1], sq: [be * be - 2 * al, 1] }[ask];
    const what = { im2: 'the square of the imaginary part of z', abs: '|z + 1|<sup>2</sup>', sq: 'z<sup>2</sup> + z̄<sup>2</sup>' }[ask];
    const wrong = { im2: [[al, 1], cut(be * be, 4), [4 * al - be * be, 1], fa(im2, [1, 1]), cut(be, 2)], abs: [[al + be + 1, 1], [al + 1, 1], [al, 1], [al + s, 1], [al - s - 1, 1]], sq: [[2 * al - be * be, 1], [be * be, 1], [2 * al, 1], [be * be + 2 * al, 1], [be * be - al, 1]] }[ask];
    const qC = q === 1 ? '' : q, sq = (v) => (v === 1 ? '' : v);
    return {
      topic: CA, rank: 20,
      text: `A complex number z satisfies ${A}|z|<sup>2</sup> = ${sq(Bv)}|z + ${p}|<sup>2</sup> + |z<sup>2</sup> + ${q}|<sup>2</sup>${signed(C)}. What is ${what}?`,
      answer: fchoices(d, ans, wrong),
      check: () => {
        const R = (z) => { const m = z[0] * z[0] + z[1] * z[1], u = cadd(z, [p, 0]), w = cadd(cmul(z, z), [q, 0]); return A * m - Bv * (u[0] * u[0] + u[1] * u[1]) - (w[0] * w[0] + w[1] * w[1]) - C; };
        const z = [s / 2, Math.sqrt(al - (be * be) / 4)];
        if (Math.abs(R(z)) > 1e-8) return `the equation fails by ${R(z)}`;
        // the equation holds nowhere else: on a grid, it only comes close to 0 near z and its conjugate
        for (let x = -12; x <= 12; x += 0.1) for (let y = 0; y <= 12; y += 0.1) if (Math.abs(R([x, y])) < 1e-3 && Math.hypot(x - z[0], y - z[1]) > 0.4) return `another solution near ${x}, ${y}`;
        const got = { im2: z[1] * z[1], abs: (z[0] + 1) ** 2 + z[1] * z[1], sq: 2 * cmul(z, z)[0] }[ask];
        return agree(got, val(ans));
      },
      solution: `Write m = |z|<sup>2</sup> = z·z̄ and s = z + z̄, which are both real. Using |u|<sup>2</sup> = u·ū: |z + ${p}|<sup>2</sup> = m + ${p === 1 ? '' : p}s + ${p * p}, and |z<sup>2</sup> + ${q}|<sup>2</sup> = m<sup>2</sup> + ${qC}(z<sup>2</sup> + z̄<sup>2</sup>) + ${q * q}, where z<sup>2</sup> + z̄<sup>2</sup> = s<sup>2</sup> − 2m. `
        + `Put these in and collect everything on one side: m<sup>2</sup>${signed(-2 * al, 'm')} + ${al * al} + ${qC}s<sup>2</sup>${signed(2 * q * be, 's')} + ${q * be * be} = 0, which is (m − ${al})<sup>2</sup> + ${qC}(s + ${be})<sup>2</sup> = 0. `
        + `Squares of real numbers are never negative, so both are 0: |z|<sup>2</sup> = ${al} and z + z̄ = ${num(s)}, so the real part of z is ${fr(cut(s, 2))}. `
        + {
          im2: `Then the square of the imaginary part is |z|<sup>2</sup> − (real part)<sup>2</sup> = ${al} − ${fr(cut(be * be, 4))} = <b>${fr(ans)}</b>.`,
          abs: `Then |z + 1|<sup>2</sup> = |z|<sup>2</sup> + (z + z̄) + 1 = ${al}${signed(s)} + 1 = <b>${fr(ans)}</b>.`,
          sq: `Then z<sup>2</sup> + z̄<sup>2</sup> = s<sup>2</sup> − 2m = ${be * be} − ${2 * al} = <b>${fr(ans)}</b>.`,
        }[ask],
    };
  },
  // the largest a|1 + z| + |1 − z + z²| on |z| = 1: take out a factor of z, use half angles, and compare two cases
  (d, ctx) => {
    const [a] = pick(ctx, 'maxmod', [[[1, 2], [2, 3], [1, 3], [3, 4], [4, 5], [1, 1], [6, 5], [3, 2], [2, 1], [5, 4]]]);
    const inner = fa([3, 1], fm(fm(a, a), cut(1, 4))), edge = fa([1, 1], fm([2, 1], a)), ans = val(inner) >= val(edge) ? inner : edge, A = a[0] === a[1] ? '' : a[1] === 1 ? a[0] : over(a[0], a[1]), two = fm([2, 1], a), tA = two[0] === two[1] ? 't' : `${fr(two)}t`;
    return {
      topic: CA, rank: 24,
      text: `Let z be a complex number with |z| = 1. What is the greatest possible value of ${A}|1 + z| + |1 − z + z<sup>2</sup>|?`,
      answer: fchoices(d, ans, [ans === inner ? edge : inner, [3, 1], fa([3, 1], fm([2, 1], a)), fa([3, 1], a), fa(ans, cut(1, 2))]),
      check: () => {
        let best = 0;
        for (let i = 0; i <= 200000; i++) { const z = cis((i * 2 * Math.PI) / 200000), v = val(a) * cabs(cadd([1, 0], z)) + cabs(cadd(csub([1, 0], z), cmul(z, z))); if (v > best) best = v; }
        return Math.abs(best - val(ans)) < 1e-6 ? true : `the largest value found was ${best}, said ${val(ans)}`;
      },
      solution: `Let z = cos θ + i sin θ. Since |z| = 1, we can divide by z inside the second modulus: |1 − z + z<sup>2</sup>| = |z̄ − 1 + z| = |2 cos θ − 1|. Also |1 + z|<sup>2</sup> = 2 + 2 cos θ = 4 cos<sup>2</sup>(θ/2), so |1 + z| = 2t, where t = |cos(θ/2)| can be any number from 0 to 1. Since cos θ = 2t<sup>2</sup> − 1, the expression is f(t) = ${tA} + |4t<sup>2</sup> − 3|. `
        + `For t up to √3/2, the absolute value opens as 3 − 4t<sup>2</sup>, and f(t) = 3 + ${tA} − 4t<sup>2</sup> is a downward parabola with its vertex at t = ${fr(fm(a, cut(1, 4)))}, which is in range. Its value there is 3 + ${fr(fm(fm(a, a), cut(1, 4)))} = ${fr(inner)}. `
        + `For t from √3/2 up to 1, f(t) = 4t<sup>2</sup> − 3 + ${tA} only increases, so its largest value is f(1) = 1 + ${fr(fm([2, 1], a))} = ${fr(edge)}. `
        + `The larger of ${fr(inner)} and ${fr(edge)} is <b>${fr(ans)}</b>.`,
    };
  },
];

// ======================================================================================================================
// Powers of complex numbers: cycles of i, (1 + i)ⁿ, De Moivre, and sums that turn into one complex geometric series
// ======================================================================================================================
const PW = 'Powers of complex numbers';
const cval = (a, b) => [a + b / 1000, gi(a, b)];   // a complex choice: sorted by real part, then by imaginary part
// ±2ᵉ as a choice, or 0
const twoPow = (s, e) => (s === 0 ? [0, '0'] : [s * 2 ** e, `${s < 0 ? '−' : ''}${sup(2, e)}`]);
const COS = new Map([[2, '2'], [-2, '−2'], [1, '1'], [-1, '−1'], [0, '0'], [Math.SQRT2, '√2'], [-Math.SQRT2, '−√2'], [Math.sqrt(3), '√3'], [-Math.sqrt(3), '−√3']]);
const cosLabel = (v) => { for (const [k, t] of COS) if (Math.abs(k - v) < 1e-9) return [k, t]; throw new Error(`no label for ${v}`); };
const powers = [
  // sums of powers of i: i + 2i² + 3i³ + ⋯ in fours, i^(k!), i^(k²)
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['weighted', 'factorial', 'squares']);
    if (form === 'weighted') {
      const [n] = pick(c2, 'weighted', [[21, 22, 23, 30, 31, 33, 34, 35, 41, 42, 43, 50, 51, 53, 54, 55, 61, 62, 63]]);
      const m = Math.floor(n / 4), tail = range(4 * m + 1, n), I = [[0, 1], [-1, 0], [0, -1], [1, 0]];
      const x = 2 * m + sum(tail.map((k) => k * I[(k - 1) % 4][0])), y = -2 * m + sum(tail.map((k) => k * I[(k - 1) % 4][1])), ans = cval(x, y);
      const unit = (k) => ['i', '−1', '−i', '1'][(k - 1) % 4];
      return {
        topic: PW, rank: 11,
        text: `What is i + 2i<sup>2</sup> + 3i<sup>3</sup> + 4i<sup>4</sup> + ⋯ + ${n}i<sup>${n}</sup>, where i = √−1?`,
        answer: tchoices(ans, [cval(2 * m, -2 * m), cval(x, -y), cval(-x, y), cval(y, x), cval(-y, -x), cval(x + 1, y), cval(x, y + 1)]),
        check: () => { const z = range(1, n).reduce((s, k) => cadd(s, cpow([0, 1], k).map((v) => k * v)), [0, 0]); return both(agree(z[0], x, 'real part'), agree(z[1], y, 'imaginary part')); },
        solution: `The powers of i repeat every four, so group the terms in fours. Each group is (4j + 1)i − (4j + 2) − (4j + 3)i + (4j + 4), and the j parts cancel, leaving 2 − 2i. `
          + `There are ${m} full groups up to ${4 * m}, which add up to ${gi(2 * m, -2 * m)}. The last terms are ${tail.map((k) => `${k}·(${unit(k)})`).join(' + ')}, which come to ${gi(x - 2 * m, y + 2 * m)}. So the total is <b>${ans[1]}</b>.`,
      };
    }
    if (form === 'factorial') {
      const [n] = pick(c2, 'factorial', [[6, 7, 8, 9, 10, 11, 12, 15, 20, 25, 30, 40, 50, 60, 75, 100]]);
      const x = n - 5, ans = cval(x, 1);
      return {
        topic: PW, rank: 12,
        text: `What is i<sup>1!</sup> + i<sup>2!</sup> + i<sup>3!</sup> + ⋯ + i<sup>${n}!</sup>, where i = √−1?`,
        answer: tchoices(ans, [cval(n - 3, 1), cval(n - 3, -1), cval(x, -1), cval(n, 0), cval(n - 4, 0), cval(n - 1, 1)]),
        check: () => {
          // the powers themselves, from the exact factorial
          let s = [0, 0], f = 1n; const I = [[1, 0], [0, 1], [-1, 0], [0, -1]];
          for (let k = 1; k <= n; k++) { f *= BigInt(k); s = cadd(s, I[Number(f % 4n)]); }
          return both(equal(s[0], x, 'real part'), equal(s[1], 1, 'imaginary part'));
        },
        solution: `A power of i depends only on the remainder of its exponent when divided by 4. Here 1! = 1, 2! = 2 and 3! = 6, so the first three terms are i, −1 and −1. From 4! on, every factorial is a multiple of 4, so each of the other ${n - 3} terms is 1. The total is i − 2 + ${n - 3} = <b>${ans[1]}</b>.`,
      };
    }
    const [n] = pick(c2, 'squares', [[20, 25, 30, 33, 41, 50, 75]]);
    const ev = Math.floor(n / 2), od = n - ev, ans = cval(ev, od);
    return {
      topic: PW, rank: 10,
      text: `What is i<sup>1<sup>2</sup></sup> + i<sup>2<sup>2</sup></sup> + i<sup>3<sup>2</sup></sup> + ⋯ + i<sup>${n}<sup>2</sup></sup>, where i = √−1?`,
      answer: tchoices(ans, [cval(od, ev), cval(ev, -od), cval(n, 0), cval(0, n), cval(-ev, od)]),
      check: () => { const z = range(1, n).reduce((s, k) => cadd(s, cpow([0, 1], (k * k) % 4)), [0, 0]); return both(equal(z[0], ev, 'real part'), equal(z[1], od, 'imaginary part')); },
      solution: `The square of an even number is a multiple of 4, so those terms are 1. The square of an odd number is 1 more than a multiple of 4, so those terms are i. From 1 to ${n} there are ${ev} even numbers and ${od} odd ones, so the sum is <b>${ans[1]}</b>.`,
    };
  },
  // (1 + i)ⁿ + (1 − i)ⁿ, and (1 + i)ᵃ/(1 − i)ᵇ: use (1 + i)² = 2i
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['sum', 'quot']);
    if (form === 'sum') {
      const [n] = pick(c2, 'plusminus', [[9, 11, 12, 13, 15, 16, 17, 19, 20, 21, 23, 24, 25, 27, 28, 32, 33, 36]]);
      const v = 2n * zpow(1, 1, n)[0], s = v < 0n ? -1 : 1, av = v < 0n ? -v : v, e = av.toString(2).length - 1, ans = twoPow(s, e);
      return {
        topic: PW, rank: 13,
        text: `What is ${sup('(1 + i)', n)} + ${sup('(1 − i)', n)}, where i = √−1?`,
        answer: tchoices(ans, [twoPow(-s, e), twoPow(s, e - 1), twoPow(-s, e - 1), twoPow(s, e + 1), twoPow(-s, e + 1), [0, '0']]),
        check: () => { const a = zpow(1, 1, n), b = zpow(1, -1, n); return both(equal(a[1] + b[1], 0n, 'imaginary part'), equal(a[0] + b[0], BigInt(s) * 2n ** BigInt(e), 'the sum')); },
        solution: `Start from (1 + i)<sup>2</sup> = 2i and (1 − i)<sup>2</sup> = −2i, and notice that the two numbers are conjugates, so the sum is twice the real part of ${sup('(1 + i)', n)}. `
          + (n % 2 === 0
            ? `Since ${n} = 2·${n / 2}, ${sup('(1 + i)', n)} = ${sup('(2i)', n / 2)} = ${sup(2, n / 2)}·${sup('i', n / 2)}, and ${sup('i', n / 2)} = ${n % 8 === 0 ? '1' : '−1'} because ${n / 2} leaves remainder ${(n / 2) % 4} when divided by 4. `
            : `Since ${n} = 2·${(n - 1) / 2} + 1, ${sup('(1 + i)', n)} = ${sup('(2i)', (n - 1) / 2)}(1 + i) = ${sup(2, (n - 1) / 2)}·${sup('i', (n - 1) / 2)}(1 + i). Here ${sup('i', (n - 1) / 2)}(1 + i) has real part ${s}, so the real part of ${sup('(1 + i)', n)} is ${s < 0 ? '−' : ''}${sup(2, (n - 1) / 2)}. `)
          + `Doubling gives <b>${ans[1]}</b>.`,
      };
    }
    const [a, b] = pick(c2, 'quot', [[10, 12, 14, 16, 18, 20, 22, 24], [2, 4, 6, 8, 10]], (a, b) => a > b && (a + b) % 4 !== 0);
    const E = (a - b) / 2, po = (a + b) / 2, I = [[1, 0], [0, 1], [-1, 0], [0, -1]][po % 4], x = I[0] * 2 ** E, y = I[1] * 2 ** E, ans = cval(x, y);
    return {
      topic: PW, rank: 12,
      text: `What is ${over(sup('(1 + i)', a), sup('(1 − i)', b))}, where i = √−1?`,
      answer: tchoices(ans, [cval(-x, -y), cval(y, x), cval(-y, -x), cval(x * 2, y * 2), cval(x / 2, y / 2), cval(x, -y)]),
      check: () => {
        // 1/(1 − i) = (1 + i)/2, so multiply it all out exactly and take out 2ᵇ
        const top = zpow(1, 1, a + b), den = 2n ** BigInt(b);
        return both(equal(top[0], BigInt(x) * den, 'real part'), equal(top[1], BigInt(y) * den, 'imaginary part'));
      },
      solution: `Since (1 + i)<sup>2</sup> = 2i and (1 − i)<sup>2</sup> = −2i, the top is ${sup('(2i)', a / 2)} and the bottom is ${sup('(−2i)', b / 2)}. So the fraction is ${sup(2, `${a / 2} − ${b / 2}`)}·${over(sup('i', a / 2), sup('(−i)', b / 2))} = ${sup(2, E)}·${sup('i', a / 2)}·${sup('i', b / 2)}, because 1/(−i) = i. `
        + `That is ${sup(2, E)}·${sup('i', po)}, and ${sup('i', po)} = ${gi(...I)}, because ${po} leaves remainder ${po % 4} when divided by 4. So the value is <b>${ans[1]}</b>.`,
    };
  },
  // z + 1/z = 2cos θ for a special angle: zⁿ + 1/zⁿ = 2cos nθ runs through a short cycle
  (d, ctx) => {
    const ANG = [[1, 3, '1'], [2, 3, '−1'], [1, 4, '√2'], [3, 4, '−√2'], [1, 6, '√3'], [5, 6, '−√3']];
    const [[u, v, label], n] = pick(ctx, 'zinv', [ANG, [25, 50, 64, 75, 100, 125, 200, 250, 500, 625, 777, 1000, 2000, 2024]], ([u, v], n) => Math.abs(Math.sin((n * u * Math.PI) / v)) > 1e-9);
    const th = (u * Math.PI) / v, c = 2 * Math.cos(th), vAt = (k) => 2 * Math.cos(k * th), per = 2 * v, r = n % per, ans = cosLabel(vAt(r));
    const others = [vAt(r + 1), vAt(r - 1), -vAt(r), vAt(2 * r), vAt(1), 2, -2, 1, -1, 0, Math.SQRT2, Math.sqrt(3)];
    const wrong = others.map(cosLabel);
    const cycle = range(1, per).map((k) => cosLabel(vAt(k))[1]).join(', ');
    const deg = (u * 180) / v;
    return {
      topic: PW, rank: 16,
      text: `A complex number z satisfies z + ${over(1, 'z')} = ${label}. What is ${sup('z', n)} + ${over(1, sup('z', n))}?`,
      answer: tchoices(ans, wrong),
      check: () => {
        // straight from the rule a(k + 1) = c·a(k) − a(k − 1), which comes from multiplying by z + 1/z
        let p = 2, q = c;
        for (let k = 2; k <= n; k++) [p, q] = [q, c * q - p];
        return Math.abs(q - ans[0]) < 1e-6 ? true : `the recurrence gave ${q}, said ${ans[0]}`;
      },
      solution: `Since ${label} = 2 cos ${deg}°, z = cos ${deg}° + i sin ${deg}° works (the other solution is its conjugate and gives the same sum). By De Moivre, z<sup>k</sup> + 1/z<sup>k</sup> = 2 cos(k·${deg}°). `
        + `As k goes 1, 2, …, ${per}, these values are ${cycle}, and then they repeat. Since ${num(n, 0)} leaves remainder ${r} when divided by ${per}, the answer is the ${r === 0 ? `last value in the cycle` : `value at k = ${r}`}, which is <b>${ans[1]}</b>.`,
    };
  },
  // (sin t + i cos t)ⁿ against a form like sin nt + i cos nt: pull out a factor of i, then it depends on n mod 4
  (d, ctx) => {
    const RHS = [['sin nt + i cos nt', 1, (t) => [Math.sin(t), Math.cos(t)], 'i'], ['cos nt − i sin nt', 0, (t) => [Math.cos(t), -Math.sin(t)], '1'], ['−sin nt − i cos nt', 3, (t) => [-Math.sin(t), -Math.cos(t)], '−i'], ['−cos nt + i sin nt', 2, (t) => [-Math.cos(t), Math.sin(t)], '−1']];
    const [[shown, res, g, unit], N] = pick(ctx, 'sincos', [RHS, [50, 75, 100, 120, 150, 250, 300, 500, 600, 750]]);
    const ans = Math.floor((N - res) / 4) + (res === 0 ? 0 : 1);
    return {
      topic: PW, rank: 17,
      text: `For how many positive integers n ≤ ${N} is ${sup('(sin t + i cos t)', 'n')} = ${shown} true for all real numbers t, where i = √−1?`,
      answer: fchoices(d, ans, [Math.floor(N / 2), ans + 1, ans - 1, Math.floor(N / 4) + 2, N]),
      check: () => {
        let c = 0;
        for (let n = 1; n <= N; n++) if ([0.7, 1.3, 2.9].every((t) => { const z = cpow([Math.sin(t), Math.cos(t)], n), w = g(n * t); return Math.hypot(z[0] - w[0], z[1] - w[1]) < 1e-6; })) c++;
        return equal(c, ans);
      },
      solution: `De Moivre needs cos first, so pull out a factor of i: sin t + i cos t = i(cos t − i sin t). So ${sup('(sin t + i cos t)', 'n')} = ${sup('i', 'n')}(cos nt − i sin nt). `
        + `The right side is ${shown} = ${unit}·(cos nt − i sin nt). So the two sides agree for all t exactly when ${sup('i', 'n')} = ${unit}, that is, when n leaves remainder ${res} when divided by 4. `
        + `From 1 to ${N} there are <b>${ans}</b> such numbers.`,
    };
  },
  // (a + i)ⁿ real: a + i has angle θ strictly between 0° and 180°, so nθ must be a multiple of 180°; then Vieta on the imaginary part
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['count', 'squares', 'imag']);
    const [n] = pick(c2, `realpow-${form}`, form === 'squares' ? [[4, 5, 6, 7, 8, 9, 10, 11, 12, 13]] : [[5, 6, 7, 8, 9, 10, 11, 12, 15, 16]]);
    const unit = (a) => { const r = Math.hypot(a, 1); return cpow([a / r, 1 / r], n); };
    const hunt = (part) => rootsOf((a) => unit(a)[part], -6 * n - 0.37, 6 * n + 0.19, 30000);
    const ans = { count: [n - 1, 1], imag: [n, 1], squares: cut((n - 1) * (n - 2), 3) }[form];
    const c3 = (n * (n - 1) * (n - 2)) / 6;
    return {
      topic: PW, rank: { count: 16, imag: 17, squares: 22 }[form],
      text: {
        count: `For how many real numbers a is ${sup('(a + i)', n)} a real number, where i = √−1?`,
        imag: `For how many real numbers a is ${sup('(a + i)', n)} a real multiple of i, where i = √−1?`,
        squares: `What is the sum of the squares of all real numbers a for which ${sup('(a + i)', n)} is a real number, where i = √−1?`,
      }[form],
      answer: form === 'squares' ? fchoices(d, ans, [[n - 1, 1], cut((n - 1) * (n - 2), 2), cut(n * (n - 1), 3), cut((n - 1) * (n - 2), 6), cut(n * n, 3)])
        : fchoices(d, ans, [n + 1, n - 2, n, n - 1, 2 * n, 2 * n - 1]),
      check: () => {
        const r = hunt(form === 'imag' ? 0 : 1);
        return form === 'squares' ? both(equal(r.length, n - 1, 'how many'), agree(sum(r.map((a) => a * a)), val(ans), 'the sum of squares')) : equal(r.length, ans[0], 'how many');
      },
      solution: {
        count: `The point a + i is above the real axis, so its angle θ is strictly between 0° and 180°, and as a runs over the real numbers, θ takes every such angle exactly once. By De Moivre, ${sup('(a + i)', n)} has angle ${n}θ, so it is real exactly when ${n}θ is a multiple of 180°. That means θ = k·180°/${n} with k = 1, 2, …, ${n - 1}. So there are <b>${n - 1}</b> values of a.`,
        imag: `The point a + i is above the real axis, so its angle θ is strictly between 0° and 180°, and as a runs over the real numbers, θ takes every such angle exactly once. By De Moivre, ${sup('(a + i)', n)} has angle ${n}θ, so it is a real multiple of i exactly when ${n}θ is an odd multiple of 90°. That means θ = (2k + 1)·90°/${n} with k = 0, 1, …, ${n - 1}. So there are <b>${n}</b> values of a.`,
        squares: `Expand with the binomial theorem. The imaginary part of ${sup('(a + i)', n)} is ${n}a<sup>${n - 1}</sup> − ${c3}a<sup>${n - 3}</sup> + ⋯, using the odd powers of i, where ${n} and ${c3} are ${n} choose 1 and ${n} choose 3. This is a polynomial of degree ${n - 1} whose roots are exactly the a we want. All ${n - 1} are real, since a + i has an angle θ strictly between 0° and 180°, and ${n}θ = k·180° for k = 1, …, ${n - 1} gives ${n - 1} different values of a. `
          + `Only every other power appears, so by Vieta the roots add up to 0, and their products in pairs add up to −${c3}/${n}. Then the sum of the squares is 0<sup>2</sup> − 2·(−${c3}/${n}) = ${2 * c3}/${n} = <b>${fr(ans)}</b>.`,
      }[form],
    };
  },
  // z^(1²) + z^(2²) + ⋯: the exponents repeat modulo the order of z, so the sum is whole periods
  (d, ctx) => {
    const Z = [
      { show: over('−1 + i√3', 2), ang: 120, order: 3, per: 3, rank: 20, unit: 3, sumT: 'i√3' },
      { show: over('√3 + i', 2), ang: 30, order: 12, per: 6, rank: 22, unit: 6, sumT: '√3 + i√3' },
      { show: over('1 − i', '√2'), ang: -45, order: 8, per: 4, rank: 21, unit: 4, sumT: '√2 − i√2' },
    ];
    const [zi, m] = pick(ctx, 'ksq', [[0, 1, 2], [2, 4, 5, 6, 7, 8, 9, 10]], (zi, m) => !(zi === 2 && m === 3));
    const z = Z[zi], N = z.per * m, ans = z.unit * m * m, ex = range(1, z.per).map((k) => (k * k) % z.order);
    return {
      topic: PW, rank: z.rank,
      text: `Let z = ${z.show}. What is |z<sup>1<sup>2</sup></sup> + z<sup>2<sup>2</sup></sup> + z<sup>3<sup>2</sup></sup> + ⋯ + z<sup>${N}<sup>2</sup></sup>|<sup>2</sup>?`,
      answer: fchoices(d, ans, [m * m, N * N, 2 * ans, N, 2 * m * m, z.unit * m]),
      check: () => {
        let s = [0, 0];
        for (let k = 1; k <= N; k++) s = cadd(s, cis(((k * k) % 360) * z.ang * Math.PI / 180));
        return agree(s[0] * s[0] + s[1] * s[1], ans, 'the square of the modulus');
      },
      solution: `z is on the unit circle at angle ${num(z.ang, 0)}°, so z<sup>${z.order}</sup> = 1, and a power of z depends only on the exponent’s remainder when divided by ${z.order}. `
        + `The squares k<sup>2</sup> leave remainders ${listing(ex.map(String))} for k = 1, …, ${z.per}, and this pattern repeats for every ${z.per} more values of k. `
        + `So one period adds up to ${ex.map((e) => (e === 0 ? '1' : `z<sup>${e}</sup>`)).join(' + ')} = ${z.sumT}, which has modulus squared ${z.unit}. `
        + `There are ${m} periods up to k = ${N}, so the sum is ${m} times that, with modulus squared ${m}<sup>2</sup>·${z.unit} = <b>${num(ans)}</b>.`,
    };
  },
  // (p + qi)ⁿ = aₙ + bₙi and Σ aₙbₙ/rⁿ: aₙbₙ is half the imaginary part of (p + qi)²ⁿ, so it is one geometric series
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['ab', 'diff', 'a']);
    const [[p, q], off] = pick(c2, `series-${form}`, [[[1, 2], [2, 1], [3, 1], [1, 1], [1, 3], [3, 2], [2, 3]], [1, 2, 3, 4, 5, 6]], ([p, q], off) => !(p === 2 && q === 1 && off === 2) && (form === 'a' ? true : true));
    const nm = p * p + q * q, r = form === 'a' ? Math.ceil(Math.sqrt(nm)) + off : nm + off, A = p * p - q * q, Bv = 2 * p * q;
    const den = (r - A) ** 2 + Bv ** 2, den1 = (r - p) ** 2 + q * q;
    const ans = { ab: cut(r * Bv, 2 * den), diff: cut(r * (r - A), den), a: cut(r * (r - p), den1) }[form];
    const pre = form === 'a' ? `a<sub>n</sub>` : form === 'ab' ? `a<sub>n</sub>b<sub>n</sub>` : `(a<sub>n</sub><sup>2</sup> − b<sub>n</sub><sup>2</sup>)`;
    const term = (k) => (form === 'a' ? `${over(`a<sub>${k}</sub>`, sup(r, k))}` : form === 'ab' ? `${over(`a<sub>${k}</sub>b<sub>${k}</sub>`, sup(r, k))}` : `${over(`a<sub>${k}</sub><sup>2</sup> − b<sub>${k}</sub><sup>2</sup>`, sup(r, k))}`);
    const wrong = { ab: [cut(r * Bv, den), cut(r * (r - A), 2 * den), cut(r * (r - A), den), cut(Bv, 2 * den), cut(Bv * r, 4 * den)], diff: [cut(r * Bv, den), cut(r * (r - A), 2 * den), cut(r, den), cut(r * A, den), cut(r * r, den)], a: [cut(r * q, den1), cut(r, r - p), cut(r * (r - p), 2 * den1), cut(r * p, den1), cut(r - p, den1)] }[form];
    return {
      topic: PW, rank: { ab: 23, diff: 22, a: 19 }[form],
      text: `For each integer n ≥ 0, write ${sup(`(${gi(p, q)})`, 'n')} as a<sub>n</sub> + b<sub>n</sub>i with a<sub>n</sub> and b<sub>n</sub> real. What is the value of the infinite sum ${term(0)} + ${term(1)} + ${term(2)} + ⋯?`,
      answer: fchoices(d, ans, wrong),
      check: () => {
        // add up the series itself, scaled as it goes so that the numbers stay small
        const s = Math.sqrt(r); let z = [1, 0], total = 0;
        const step = form === 'a' ? [p / r, q / r] : [p / s, q / s];
        for (let n = 0; n < 6000; n++) { total += form === 'a' ? z[0] : form === 'ab' ? z[0] * z[1] : z[0] * z[0] - z[1] * z[1]; z = cmul(z, step); }
        return agree(total, val(ans), 'the partial sum');
      },
      solution: (form === 'a'
        ? `${pre} is the real part of ${sup(`(${gi(p, q)})`, 'n')}, so the sum is the real part of the geometric series with ratio w = (${gi(p, q)})/${r}. It converges because |w| = √${nm}/${r} is less than 1. `
          + `Its sum is ${over(1, '1 − w')} = ${over(r, `${gi(r - p, -q)}`)} = ${over(`${r}(${gi(r - p, q)})`, den1)}, using the conjugate, and the real part is ${over(`${r}·${r - p}`, den1)} = <b>${fr(ans)}</b>.`
        : `Square both sides of ${sup(`(${gi(p, q)})`, 'n')} = a<sub>n</sub> + b<sub>n</sub>i: (${gi(p, q)})<sup>2n</sup> = (a<sub>n</sub><sup>2</sup> − b<sub>n</sub><sup>2</sup>) + 2a<sub>n</sub>b<sub>n</sub>i. Since (${gi(p, q)})<sup>2</sup> = ${gi(A, Bv)}, ${form === 'ab' ? `a<sub>n</sub>b<sub>n</sub> is half the imaginary part` : `a<sub>n</sub><sup>2</sup> − b<sub>n</sub><sup>2</sup> is the real part`} of ${sup(`(${gi(A, Bv)})`, 'n')}. `
          + `So the sum is ${form === 'ab' ? 'half the imaginary part' : 'the real part'} of the geometric series with ratio w = (${gi(A, Bv)})/${r}. It converges because |w| = ${nm}/${r} is less than 1. `
          + `Its sum is ${over(1, '1 − w')} = ${over(r, gi(r - A, -Bv))} = ${over(`${r}(${gi(r - A, Bv)})`, num(den, 0))}, using the conjugate. `
          + (form === 'ab' ? `Half of its imaginary part is ${over(`${r}·${Bv}`, `2·${num(den, 0)}`)} = <b>${fr(ans)}</b>.` : `Its real part is ${over(`${r}·${paren(r - A)}`, num(den, 0))} = <b>${fr(ans)}</b>.`)),
    };
  },
];

// ======================================================================================================================
// Roots of unity: counting with gcds, ω with ω² + ω + 1 = 0, xⁿ − 1 factored, and the roots-of-unity filter
// ======================================================================================================================
const RU = 'Roots of unity';
const omegaN = (n) => { const t = n % 2 ? `2π/${n}` : `π/${n / 2}`; return `cos(${t}) + i sin(${t})`; };
const kList = (n) => (n <= 4 ? `k = ${listing(range(0, n - 1))}` : `k = 0, 1, 2, …, ${n - 1}`);
// how many separate spots of the plane make res small: every cell of a fine grid is tried, then touching cells are joined
function blobs(res, T, h = 0.005, R = 1.5) {
  const n = Math.round((2 * R) / h) + 1, on = new Uint8Array(n * n), st = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (res([-R + i * h, -R + j * h]) < T) on[i * n + j] = 1;
  let c = 0;
  for (let p = 0; p < n * n; p++) {
    if (!on[p]) continue;
    c++; on[p] = 0; st.push(p);
    while (st.length) {
      const q = st.pop(), i = Math.floor(q / n), j = q % n;
      for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
        const a = i + di, b = j + dj;
        if (a >= 0 && b >= 0 && a < n && b < n && on[a * n + b]) { on[a * n + b] = 0; st.push(a * n + b); }
      }
    }
  }
  return c;
}
const rootsUnity = [
  // how many: z^k real among the n-th roots of 1, the products of two sets of roots, z^k a multiple of i
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['real', 'products', 'imag']);
    const toUnit = (j, n, k = 1) => cis((2 * Math.PI * j * k) / n);
    if (form === 'products') {
      const [a, b] = pick(c2, 'products', [[6, 8, 9, 10, 12, 15, 18], [8, 10, 12, 14, 16, 20, 24, 30]], (a, b) => a < b && gcd(a, b) > 1 && a % b !== 0 && b % a !== 0 && lcm(a, b) <= 120 && !(a === 18 && b === 48));
      const L = lcm(a, b), g = gcd(a, b);
      return {
        topic: RU, rank: 15,
        text: `Let A be the set of complex numbers z with ${sup('z', a)} = 1, and let B be the set of complex numbers w with ${sup('w', b)} = 1. How many different numbers can be written as zw with z in A and w in B?`,
        answer: fchoices(d, L, [a * b, g, a + b, a + b - g, L / g]),
        check: () => {
          const seen = new Set();
          for (let s = 0; s < a; s++) for (let t = 0; t < b; t++) { const p = cmul(toUnit(s, a), toUnit(t, b)); seen.add(`${Math.round(p[0] * 1e7)},${Math.round(p[1] * 1e7)}`.replace(/-0\b/g, '0')); }
          return equal(seen.size, L, 'different products');
        },
        solution: `Every root of 1 has the form cos(2πr) + i sin(2πr) with r a fraction, and multiplying adds the fractions. Here z gives s/${a} and w gives t/${b}, so zw gives s/${a} + t/${b}. `
          + `Over a common denominator, each of these is a multiple of 1/${L}, where ${L} is the least common multiple of ${a} and ${b}. And every multiple of 1/${L} can be reached, because the greatest common divisor of ${L / a} and ${L / b} is 1, so some whole-number combination of them is 1. `
          + `So the products are exactly the ${ord(L)} roots of 1, and there are <b>${L}</b> of them.`,
      };
    }
    const [n, k] = pick(c2, `count-${form}`, [[12, 18, 20, 24, 30, 36, 40, 48, 60], [2, 3, 4, 5, 6, 8, 9, 10, 12, 15]], (n, k) => {
      if (k >= n || (n === 24 && k === 6)) return false;
      return form === 'real' ? gcd(n, 2 * k) !== gcd(n, k) : gcd(n, 4 * k) !== gcd(n, 2 * k);
    });
    const g1 = gcd(n, k), g2 = gcd(n, 2 * k), g4 = gcd(n, 4 * k), ans = form === 'real' ? g2 : g4 - g2;
    return {
      topic: RU, rank: form === 'real' ? 13 : 14,
      text: form === 'real' ? `Consider all the complex numbers z with ${sup('z', n)} = 1. For how many of them is ${sup('z', k)} a real number?`
        : `Consider all the complex numbers z with ${sup('z', n)} = 1. For how many of them is ${sup('z', k)} equal to i or −i?`,
      answer: fchoices(d, ans, form === 'real' ? [g1, 2 * g2, n / 2, k, n - g2] : [g4, g2, 2 * g4, n / 2, k]),
      check: () => {
        let c = 0;
        for (let j = 0; j < n; j++) { const p = toUnit(j, n, k); if (form === 'real' ? Math.abs(p[1]) < 1e-9 : Math.abs(p[0]) < 1e-9) c++; }
        return equal(c, ans);
      },
      solution: (form === 'real'
        ? `Since |z| = 1, the number ${sup('z', k)} is on the unit circle, so it is real exactly when it is 1 or −1, that is, when ${sup('z', 2 * k)} = 1. `
          + `Numbers with both ${sup('z', n)} = 1 and ${sup('z', 2 * k)} = 1 are exactly the numbers with z<sup>g</sup> = 1, where g is the greatest common divisor of ${n} and ${2 * k}. Here g = ${g2}, and there are g such numbers. So the answer is <b>${ans}</b>.`
        : `${sup('z', k)} is i or −i exactly when ${sup('z', 2 * k)} = −1, which is when ${sup('z', 4 * k)} = 1 but ${sup('z', 2 * k)} is not 1. `
          + `Numbers with both ${sup('z', n)} = 1 and ${sup('z', 4 * k)} = 1 are exactly the solutions of z<sup>g</sup> = 1, where g is the greatest common divisor of ${n} and ${4 * k}, which is ${g4}. In the same way, ${g2} of the numbers have ${sup('z', 2 * k)} = 1. So the count is ${g4} − ${g2} = <b>${ans}</b>.`),
    };
  },
  // cube roots of 1: a + bω + aω² collapses to one term, and |a + bω + cω²|² from ω + ω² = −1
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['power', 'norm']);
    const w = cis((2 * Math.PI) / 3), w2 = cmul(w, w);
    const line = (a, b, c) => `${a === 1 ? '1' : num(a)}${signed(b, 'ω')}${signed(c, 'ω<sup>2</sup>')}`;
    if (form === 'norm') {
      const [a, b, c] = pick(c2, 'norm', [range(1, 9), range(1, 9), [1, 2, 3, 4, 5, 6, 7, -1, -2, -3]], (a, b, c) => a !== b && a !== c && b !== c && a < b);
      const ans = a * a + b * b + c * c - a * b - b * c - c * a, p = a * b + b * c + c * a;
      return {
        topic: RU, rank: 14,
        text: `Let ω be a non-real complex number with ω<sup>3</sup> = 1. What is |${line(a, b, c)}|<sup>2</sup>?`,
        answer: fchoices(d, ans, [a * a + b * b + c * c, a * a + b * b + c * c + p, (a + b + c) ** 2, ans + 2 * p, Math.abs(a * b - c * c)]),
        check: () => { const z = cadd(cadd([a, 0], [b * w[0], b * w[1]]), [c * w2[0], c * w2[1]]); return agree(z[0] * z[0] + z[1] * z[1], ans, 'the square of the modulus'); },
        solution: `Use |u|<sup>2</sup> = u·ū. Since |ω| = 1, the conjugate of ω is 1/ω = ω<sup>2</sup>, so the conjugate of ${line(a, b, c)} is ${line(a, c, b)}. `
          + `Multiplying the two gives ${a * a} + ${b * b} + ${c * c} + (${num(a * b)} + ${num(b * c)} + ${num(c * a)})(ω + ω<sup>2</sup>), since ω<sup>3</sup> = 1 and ω<sup>4</sup> = ω. `
          + `Because 1 + ω + ω<sup>2</sup> = 0, ω + ω<sup>2</sup> = −1, so the value is ${a * a + b * b + c * c} − ${paren(p)} = <b>${num(ans)}</b>.`,
      };
    }
    const [a, b, n] = pick(c2, 'power', [[1, 2, 3, 4, -1, -2], [1, 2, 3, 4, 5, -1, -2, -3], range(4, 13)], (a, b, n) => a !== b && Math.abs(b - a) >= 2 && Math.abs(b - a) ** n <= 2e6);
    const g = b - a, f = n % 3 === 0 ? 2 : -1, ans = g ** n * f, sg = (v) => num(v);
    const wrongs = [g ** n * (n % 3 === 0 ? -1 : 2), -ans, 2 * g ** n, g ** n, (a + b) ** n * f, (Math.abs(a) + Math.abs(b)) ** n];
    return {
      topic: RU, rank: 16,
      text: `Let ω be a non-real complex number with ω<sup>3</sup> = 1. What is (${line(a, b, a)})<sup>${n}</sup> + (${line(a, a, b)})<sup>${n}</sup>?`,
      answer: fchoices(d, ans, wrongs),
      check: () => {
        const m = (p, q, r) => cadd(cadd([p, 0], [q * w[0], q * w[1]]), [r * w2[0], r * w2[1]]);
        const z = cadd(cpow(m(a, b, a), n), cpow(m(a, a, b), n));
        return both(agree(z[0], ans, 'real part'), Math.abs(z[1]) < 1e-5 * Math.max(1, Math.abs(ans)) ? true : 'not real');
      },
      solution: `Use 1 + ω + ω<sup>2</sup> = 0 to collapse each base to one term. Taking ${sg(a)} times that equation away from the first base leaves ${sg(b - a)}ω, and from the second base leaves ${sg(b - a)}ω<sup>2</sup>. `
        + `So the sum is ${paren(g)}<sup>${n}</sup>(ω<sup>${n}</sup> + ω<sup>${2 * n}</sup>). Since ω<sup>3</sup> = 1, ` + (n % 3 === 0 ? `3 divides ${n}, so both powers are 1 and the bracket is 2. ` : `${n} is not a multiple of 3, so the two powers are ω and ω<sup>2</sup> in some order, and the bracket is ω + ω<sup>2</sup> = −1. `)
        + `The value is ${paren(g)}<sup>${n}</sup>·${paren(f)} = <b>${num(ans)}</b>.`,
    };
  },
  // xⁿ − 1 = ∏(x − ωᵏ): one factor at x = c, and a quadratic in ωᵏ that factors into two such products
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['one', 'two']);
    if (form === 'one') {
      const [c, n] = pick(c2, 'prod1', [[2, 3, 4, 5], [5, 6, 7, 8, 9, 10, 11]], (c, n) => c ** n <= 2e7);
      const ans = (c ** n - 1) / (c - 1), fac = (k) => `(${c} − ω${k === 1 ? '' : `<sup>${k}</sup>`})`;
      return {
        topic: RU, rank: 17,
        text: `Let ω = ${omegaN(n)}. What is ${n <= 5 ? range(1, n - 1).map(fac).join('') : `${fac(1)}${fac(2)}${fac(3)}⋯${fac(n - 1)}`}?`,
        answer: fchoices(d, ans, [c ** n - 1, c ** n, c ** (n - 1), (c ** (n - 1) - 1) / (c - 1), ans * c]),
        check: () => { let z = [1, 0]; for (let k = 1; k < n; k++) z = cmul(z, csub([c, 0], cis((2 * Math.PI * k) / n))); return both(agree(z[0], ans, 'real part'), Math.abs(z[1]) < 1e-6 * ans ? true : 'not real'); },
        solution: `The numbers 1, ω, ω<sup>2</sup>, …, ω<sup>${n - 1}</sup> are all ${n} roots of x<sup>${n}</sup> − 1, so x<sup>${n}</sup> − 1 = (x − 1)(x − ω)(x − ω<sup>2</sup>)⋯(x − ω<sup>${n - 1}</sup>). `
          + `Dividing by x − 1 gives (x − ω)⋯(x − ω<sup>${n - 1}</sup>) = ${over(`x<sup>${n}</sup> − 1`, 'x − 1')}. At x = ${c}, this is ${c === 2 ? `${c}<sup>${n}</sup> − 1` : over(`${c}<sup>${n}</sup> − 1`, c - 1)} = <b>${num(ans)}</b>.`,
      };
    }
    const PAIRS = [[2, 3, 'r'], [2, 5, 'r'], [3, 4, 'r'], [1, 1, 'c'], [1, 2, 'c'], [2, 1, 'c'], [1, 3, 'c'], [3, 1, 'c']];
    const [[u, v, kind], n] = pick(c2, 'prod2', [PAIRS, [3, 4, 5, 6, 7, 8, 9, 10]], ([u, v, kind], n) => (kind === 'r' ? (u ** n - 1) * (v ** n - 1) <= 5e9 : (u * u + v * v) ** n <= 2e9));
    const S = kind === 'r' ? u + v : 2 * u, P = kind === 'r' ? u * v : u * u + v * v;
    const Z = kind === 'c' ? zpow(u, v, n).map(Number) : null, ans = kind === 'r' ? (u ** n - 1) * (v ** n - 1) : (Z[0] - 1) ** 2 + Z[1] ** 2;
    const wrong = kind === 'r' ? [(u ** n + 1) * (v ** n + 1), (u * v) ** n, (u * v) ** n - 1, u ** n * (v ** n - 1), v ** n * (u ** n - 1)] : [(Z[0] + 1) ** 2 + Z[1] ** 2, P ** n, P ** n - 1, (Z[0] - 1) ** 2, Z[1] ** 2 + 1];
    return {
      topic: RU, rank: 23,
      text: `Let ω = ${omegaN(n)}. What is the product of the numbers ω<sup>2k</sup> − ${S}ω<sup>k</sup> + ${P} for ${kList(n)}?`,
      answer: fchoices(d, ans, wrong),
      check: () => {
        let z = [1, 0];
        for (let k = 0; k < n; k++) { const o = cis((2 * Math.PI * k) / n), o2 = cmul(o, o); z = cmul(z, [o2[0] - S * o[0] + P, o2[1] - S * o[1]]); }
        return both(agree(z[0], ans, 'real part'), Math.abs(z[1]) < 1e-6 * Math.max(1, ans) ? true : 'not real');
      },
      solution: `The numbers ω<sup>k</sup> are all the roots of x<sup>${n}</sup> − 1, so for any number r, the product of r − ω<sup>k</sup> over these k is r<sup>${n}</sup> − 1. `
        + (kind === 'r'
          ? `Each factor here is a quadratic in ω<sup>k</sup> that factors: x<sup>2</sup> − ${S}x + ${P} = (x − ${u})(x − ${v}), and (ω<sup>k</sup> − ${u})(ω<sup>k</sup> − ${v}) = (${u} − ω<sup>k</sup>)(${v} − ω<sup>k</sup>). `
            + `So the whole product is (${u}<sup>${n}</sup> − 1)(${v}<sup>${n}</sup> − 1) = ${num(u ** n - 1)}·${num(v ** n - 1)} = <b>${num(ans)}</b>.`
          : `Each factor here is a quadratic in ω<sup>k</sup> with non-real roots: x<sup>2</sup> − ${S}x + ${P} = (x − r)(x − r̄), where r = ${gi(u, v)}. So (ω<sup>k</sup> − r)(ω<sup>k</sup> − r̄) = (r − ω<sup>k</sup>)(r̄ − ω<sup>k</sup>). `
            + `The whole product is (r<sup>${n}</sup> − 1)(r̄<sup>${n}</sup> − 1) = |r<sup>${n}</sup> − 1|<sup>2</sup>. Multiplying out, r<sup>${n}</sup> = ${gi(Z[0], Z[1])}, so the value is (${num(Z[0])} − 1)<sup>2</sup> + ${paren(Z[1])}<sup>2</sup> = <b>${num(ans)}</b>.`),
    };
  },
  // sums of reciprocals: pair each root with its conjugate, or expand as geometric series so only multiples of n survive
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['pair', 'c']);
    if (form === 'pair') {
      const [n] = pick(c2, 'recip1', [[5, 6, 7, 8, 9, 10, 11, 12, 15, 16, 20, 25]]);
      const ans = cut(n - 1, 2), term = (k) => over(1, `1 − ω${k === 1 ? '' : `<sup>${k}</sup>`}`);
      return {
        topic: RU, rank: 18,
        text: `Let ω = ${omegaN(n)}. What is ${n <= 5 ? range(1, n - 1).map(term).join(' + ') : `${term(1)} + ${term(2)} + ${term(3)} + ⋯ + ${term(n - 1)}`}?`,
        answer: fchoices(d, ans, [cut(n, 2), [n - 1, 1], cut(n + 1, 2), cut(1, 2), cut(n - 1, 4)]),
        check: () => { let z = [0, 0]; for (let k = 1; k < n; k++) z = cadd(z, cdiv([1, 0], csub([1, 0], cis((2 * Math.PI * k) / n)))); return both(agree(z[0], val(ans), 'real part'), Math.abs(z[1]) < 1e-9 ? true : 'not real'); },
        solution: `Pair ω<sup>k</sup> with ω<sup>${n} − k</sup>, which is 1/ω<sup>k</sup>. With z = ω<sup>k</sup>, the pair adds up to ${over(1, '1 − z')} + ${over(1, `1 − ${over(1, 'z')}`)} = ${over(1, '1 − z')} + ${over('z', 'z − 1')} = ${over('1 − z', '1 − z')} = 1. `
          + (n % 2 ? `The ${n - 1} terms make ${(n - 1) / 2} pairs, so the sum is <b>${fr(ans)}</b>.` : `The ${n - 1} terms make ${(n - 2) / 2} pairs and one term left over, with ω<sup>${n / 2}</sup> = −1, which is ${over(1, '1 − (−1)')} = ½. So the sum is ${(n - 2) / 2} + ½ = <b>${fr(ans)}</b>.`),
      };
    }
    const [c, n] = pick(c2, 'recip2', [[2, 3, 4], [3, 4, 5, 6, 7, 8]], (c, n) => c ** n <= 5000);
    const top = n * c ** (n - 1), ans = cut(top, c ** n - 1);
    return {
      topic: RU, rank: 21,
      text: `Let ω = ${omegaN(n)}. What is the sum of the numbers ${over(1, `${c} − ω<sup>k</sup>`)} for ${kList(n)}?`,
      answer: fchoices(d, ans, [cut(n, c), cut(n, c - 1), cut(n * c ** n, c ** n - 1), cut(top, c ** n + 1), cut(c ** (n - 1), c ** n - 1)]),
      check: () => { let z = [0, 0]; for (let k = 0; k < n; k++) z = cadd(z, cdiv([1, 0], csub([c, 0], cis((2 * Math.PI * k) / n)))); return both(agree(z[0], val(ans), 'real part'), Math.abs(z[1]) < 1e-9 ? true : 'not real'); },
      solution: `Since |ω<sup>k</sup>/${c}| is less than 1, each term is a geometric series: ${over(1, `${c} − ω<sup>k</sup>`)} = ${over(1, c)}(1 + ${over('ω<sup>k</sup>', c)} + ${over('ω<sup>2k</sup>', sup(c, 2))} + ⋯). `
        + `Now add over k. For each power j, the sum of ω<sup>jk</sup> over these k is ${n} when ${n} divides j, and 0 otherwise. So only j = 0, ${n}, ${2 * n}, … survive, and the total is ${over(n, c)}(1 + ${over(1, sup(c, n))} + ${over(1, sup(c, 2 * n))} + ⋯). `
        + `That geometric series has ratio 1/${sup(c, n)}, so it adds up to ${over(n, c)}·${over(num(c ** n, 0), num(c ** n - 1, 0))} = <b>${fr(ans)}</b>.`,
    };
  },
  // z^m = z̄^k, and z^m·z̄^k = 1: the modulus first, then a plain power equation
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['equal', 'product']);
    const [m, k] = pick(c2, `bar-${form}`, [range(3, 10), [1, 2, 3, 4]], (m, k) => m > k && m + k <= 12 && !(m === 5 && k === 1) && (form === 'equal' || m - k >= 2));
    const bar = k === 1 ? 'z̄' : `z̄<sup>${k}</sup>`, ans = form === 'equal' ? m + k + 1 : m - k;
    const res = form === 'equal' ? (z) => { const a = cpow(z, m), b = cpow([z[0], -z[1]], k); return Math.hypot(a[0] - b[0], a[1] - b[1]); } : (z) => { const a = cmul(cpow(z, m), cpow([z[0], -z[1]], k)); return Math.hypot(a[0] - 1, a[1]); };
    return {
      topic: RU, rank: 15,
      text: `How many complex numbers z satisfy ${sup('z', m)}${form === 'equal' ? ` = ${bar}` : `·${bar} = 1`}, where z̄ is the conjugate of z?`,
      answer: fchoices(d, ans, form === 'equal' ? [m + k, m, m + 1, m + k + 2, m - k + 1, m * k + 1] : [m + k, m, m - k + 1, m + k + 1, k]),
      check: () => equal(blobs(res, (m + k) * 0.0045), ans, 'how many spots'),
      solution: form === 'equal'
        ? `Take the modulus of both sides: |z|<sup>${m}</sup> = |z|<sup>${k}</sup>. So z = 0, which does work, or |z| = 1. If |z| = 1, then z̄ = 1/z, so the equation says ${sup('z', m)} = 1/${k === 1 ? 'z' : sup('z', k)}, that is, ${sup('z', m + k)} = 1. That equation has ${m + k} solutions, all with |z| = 1. Together with z = 0, there are <b>${ans}</b>.`
        : `Take the modulus of both sides: |z|<sup>${m + k}</sup> = 1, so |z| = 1. Then z̄ = 1/z, and the equation says ${sup('z', m)}/${k === 1 ? 'z' : sup('z', k)} = 1, that is, ${sup('z', m - k)} = 1. That equation has <b>${ans}</b> solutions, all with |z| = 1, so all of them count. (z = 0 is not a solution here.)`,
    };
  },
  // the roots-of-unity filter: every third (or fourth) coefficient, from f(1), f(ω) and f(ω²)
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['mod3', 'poly', 'mod4']);
    if (form === 'poly') {
      const [a, b] = pick(c2, 'filterpoly', [range(2, 9), range(1, 5)], (a, b) => 2 ** a * 3 ** b <= 300000);
      const whole = 2 ** a * 3 ** b, ans = whole / 3, base = `(1 + x)<sup>${a}</sup>(1 + x + x<sup>2</sup>)${b === 1 ? '' : `<sup>${b}</sup>`}`;
      return {
        // a short product can simply be multiplied out by hand, so only a long one needs the filter
        topic: RU, rank: a + 2 * b <= 8 ? 13 : 23,
        text: `The product ${base} is multiplied out. What is the sum of the coefficients of x<sup>0</sup>, x<sup>3</sup>, x<sup>6</sup>, x<sup>9</sup> and so on?`,
        answer: fchoices(d, ans, [whole, Math.floor(whole / 2), 3 ** b, 2 ** a, ans + 1, ans - 1]),
        check: () => {
          const times = (p, q) => { const o = Array(p.length + q.length - 1).fill(0); p.forEach((x, i) => q.forEach((y, j) => { o[i + j] += x * y; })); return o; };
          let P = [1];
          for (let i = 0; i < a; i++) P = times(P, [1, 1]);
          for (let i = 0; i < b; i++) P = times(P, [1, 1, 1]);
          return equal(sum(P.filter((c, i) => i % 3 === 0)), ans);
        },
        solution: `Let f(x) be the product, and let ω be a non-real cube root of 1. Then 1 + ω<sup>j</sup> + ω<sup>2j</sup> is 3 when 3 divides j, and 0 otherwise. So adding f(1), f(ω) and f(ω<sup>2</sup>) keeps exactly the coefficients we want, each counted 3 times. `
          + `Now f(ω) = 0 and f(ω<sup>2</sup>) = 0, because 1 + x + x<sup>2</sup> is a factor and it is 0 at both. And f(1) = ${sup(2, a)}·${b === 1 ? '3' : sup(3, b)} = ${num(whole)}. So the sum is ${num(whole)} ÷ 3 = <b>${num(ans)}</b>.`,
      };
    }
    const step = form === 'mod3' ? 3 : 4;
    const [m] = pick(c2, `filter-${step}`, [form === 'mod3' ? range(8, 24) : [10, 11, 13, 14, 15, 17, 18, 19, 21, 22, 23, 25, 26]]);
    const terms = range(0, Math.floor(m / step)).map((j) => j * step), Z = zpow(1, 1, m).map(Number);
    const ans = form === 'mod3' ? (2 ** m + (m % 2 ? -1 : 1) * (m % 3 === 0 ? 2 : -1)) / 3 : (2 ** m + 2 * Z[0]) / 4;
    const near2 = form === 'mod3' ? [(2 ** m + (m % 2 ? -1 : 1) * (m % 3 === 0 ? -1 : 2)) / 3, 2 ** (m - 1), 2 ** (m - 2), ans + 1, ans - 1] : [2 ** (m - 2), ans + 2 * Math.abs(Z[0]) + 1, 2 ** (m - 1), ans + 1, ans - 1, ans + 2];
    return {
      topic: RU, rank: form === 'mod3' ? 21 : 22,
      text: `What is C(${m}, 0) + C(${m}, ${step}) + C(${m}, ${2 * step}) + ⋯ + C(${m}, ${terms.at(-1)}), where C(n, k) is the number of ways to choose k things from n?`,
      answer: fchoices(d, ans, near2),
      check: () => equal(sum(terms.map((j) => choose(m, j))), ans),
      solution: form === 'mod3'
        ? `Let f(x) = (1 + x)<sup>${m}</sup> and let ω be a non-real cube root of 1. Then 1 + ω<sup>j</sup> + ω<sup>2j</sup> is 3 when 3 divides j, and 0 otherwise, so f(1) + f(ω) + f(ω<sup>2</sup>) is 3 times the sum we want. `
          + `Now f(1) = 2<sup>${m}</sup>. Since 1 + ω = −ω<sup>2</sup> and 1 + ω<sup>2</sup> = −ω, f(ω) + f(ω<sup>2</sup>) = (−1)<sup>${m}</sup>(ω<sup>${2 * m}</sup> + ω<sup>${m}</sup>), and the bracket is ${m % 3 === 0 ? '2 because 3 divides ' + m : '−1 because 3 does not divide ' + m}. So the sum is (${num(2 ** m)}${signed((m % 2 ? -1 : 1) * (m % 3 === 0 ? 2 : -1))}) ÷ 3 = <b>${num(ans)}</b>.`
        : `Let f(x) = (1 + x)<sup>${m}</sup>. The sum 1 + i<sup>j</sup> + (−1)<sup>j</sup> + (−i)<sup>j</sup> is 4 when 4 divides j, and 0 otherwise, so f(1) + f(i) + f(−1) + f(−i) is 4 times the sum we want. `
          + `Here f(1) = 2<sup>${m}</sup> and f(−1) = 0, and f(i) and f(−i) are conjugates, so they add up to twice the real part of (1 + i)<sup>${m}</sup>. Multiplying out with (1 + i)<sup>2</sup> = 2i, (1 + i)<sup>${m}</sup> = ${gi(Z[0], Z[1])}. So the sum is (${num(2 ** m)}${signed(2 * Z[0])}) ÷ 4 = <b>${num(ans)}</b>.`,
    };
  },
];

// ======================================================================================================================
// Complex numbers as geometry: multiplying turns and stretches, so points, rotations, polygons and curves all follow
// ======================================================================================================================
const GE = 'Complex numbers as geometry';
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const shoelace = (ps) => Math.abs(sum(ps.map((p, i) => cross(p, ps[(i + 1) % ps.length])))) / 2;
const hull = (pts) => {
  const ps = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]), half = (list) => { const h = []; for (const p of list) { while (h.length >= 2 && cross(csub(h.at(-1), h.at(-2)), csub(p, h.at(-2))) <= 1e-12) h.pop(); h.push(p); } h.pop(); return h; };
  return [...half(ps), ...half([...ps].reverse())];
};
const piLabel = ([p, q]) => [(p / q) * Math.PI, q === 1 ? `${p === 1 ? '' : num(p, 0)}π` : over(`${p === 1 ? '' : num(p, 0)}π`, q)];
const rootLabel = (n) => (isSq(n) ? [isqrt(n), num(isqrt(n), 0)] : (() => { let o = 1, i = n; for (let f = 2; f * f <= i; f++) while (i % (f * f) === 0) { i /= f * f; o *= f; } return [o * Math.sqrt(i), `${o === 1 ? '' : o}√${i}`]; })());
const geometry = [
  // a turn about a point, and the next corners of a square: multiply the arrow by i
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['rotate', 'square']);
    if (form === 'rotate') {
      const [P, C, [f, deg, how]] = pick(c2, 'rotate', [[[3, 1], [5, 2], [4, -1], [-2, 3], [6, 3], [1, 5]], [[1, 2], [2, -1], [-1, 1], [3, 3], [-2, -2]], [[[0, 1], 90, 'counterclockwise'], [[0, -1], 90, 'clockwise']]], (P, C) => P[0] !== C[0] && P[1] !== C[1]);
      const arrow = csub(P, C), turned = cmul(arrow, f), I = cadd(C, turned), other = cadd(C, cmul(arrow, [-f[0], -f[1]])), ans = cval(...I);
      return {
        topic: GE, rank: 11,
        text: `In the complex plane, the point ${gi(...P)} is turned 90° ${how} about the point ${gi(...C)}. Where does it end up?`,
        answer: tchoices(ans, [cval(...other), cval(...cmul(P, f)), cval(...cadd(cmul(P, f), C)), cval(...cadd(P, turned)), cval(...turned), cval(...csub(C, arrow))]),
        check: () => {
          const t = (how === 'clockwise' ? -1 : 1) * Math.PI / 2, x = C[0] + arrow[0] * Math.cos(t) - arrow[1] * Math.sin(t), y = C[1] + arrow[0] * Math.sin(t) + arrow[1] * Math.cos(t);
          return both(agree(x, I[0], 'x'), agree(y, I[1], 'y'));
        },
        solution: `Move the center to 0, turn, and move back. The arrow from the center to the point is (${gi(...P)}) − (${gi(...C)}) = ${gi(...arrow)}. Turning 90° ${how} is multiplying by ${gi(...f)}, which gives ${gi(...turned)}. Adding the center back gives <b>${ans[1]}</b>.`,
      };
    }
    const [A, Bv, ask] = pick(c2, 'square', [[[1, 1], [2, -1], [-1, 2], [3, 0], [0, -2], [-2, -1]], [[4, 2], [5, 3], [3, 4], [6, -1], [1, 5], [4, 5]], ['C', 'D']], (A, Bv) => A[0] !== Bv[0] && A[1] !== Bv[1]);
    const s = csub(Bv, A), t = cmul(s, [0, 1]), Cc = cadd(Bv, t), Dd = cadd(A, t), want = ask === 'C' ? Cc : Dd, ans = cval(...want);
    return {
      topic: GE, rank: 12,
      text: `Square ABCD has its vertices in counterclockwise order in the complex plane, with A at ${gi(...A)} and B at ${gi(...Bv)}. What complex number is at ${ask}?`,
      answer: tchoices(ans, [cval(...(ask === 'C' ? Dd : Cc)), cval(...csub(A, t)), cval(...csub(Bv, t)), cval(...cadd(want, s)), cval(...cadd(A, s)), cval(...t)]),
      check: () => {
        const side = dist(A, Bv), order = [A, Bv, Cc, Dd];
        return both(...order.map((p, i) => agree(dist(p, order[(i + 1) % 4]), side, 'a side')), agree(dist(A, Cc), dist(Bv, Dd), 'the diagonals'), sum(order.map((p, i) => cross(p, order[(i + 1) % 4]))) > 0 ? true : 'clockwise', equal(want[0], (ask === 'C' ? Cc : Dd)[0]));
      },
      solution: `The arrow from A to B is (${gi(...Bv)}) − (${gi(...A)}) = ${gi(...s)}. Going counterclockwise around the square, each side is the one before it turned 90° counterclockwise, which is multiplying by i: i(${gi(...s)}) = ${gi(...t)}. `
        + (ask === 'C' ? `So C = B + ${gp(...t)} = <b>${ans[1]}</b>.` : `The side from A to D is that same arrow, because it runs parallel to the side from B to C. So D = A + ${gp(...t)} = <b>${ans[1]}</b>.`),
    };
  },
  // a regular polygon from (z − c)ⁿ = Rⁿ: the smallest triangle among its vertices, and the product of all its vertices
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['least', 'product']);
    if (form === 'product') {
      const [n, c, R] = pick(c2, 'product', [[4, 5, 6, 8, 10, 12], [2, 3, 4, 5], [1, 2, 3, 4]], (n, c, R) => R < c && c ** n <= 3e8);
      const sign = n % 2 ? 1 : -1, ans = c ** n + sign * R ** n, other = c ** n - sign * R ** n;
      return {
        topic: GE, rank: 17,
        text: `A ${{ 4: 'square', 5: 'regular pentagon', 6: 'regular hexagon', 8: 'regular octagon', 10: 'regular decagon', 12: 'regular dodecagon' }[n]} in the complex plane has center ${c}, and one of its vertices is ${c + R}. If its vertices are z<sub>1</sub>, z<sub>2</sub>, …, z<sub>${n}</sub>, what is the product z<sub>1</sub>z<sub>2</sub>⋯z<sub>${n}</sub>?`,
        answer: fchoices(d, ans, [other, c ** n, R ** n, (c + R) ** n <= 1e10 ? (c + R) ** n : c ** n + 1, n * c * R]),
        check: () => { let z = [1, 0]; for (let k = 0; k < n; k++) z = cmul(z, cadd([c, 0], cis((2 * Math.PI * k) / n).map((v) => R * v))); return both(agree(z[0], ans, 'real part'), Math.abs(z[1]) < 1e-6 * Math.max(1, Math.abs(ans)) ? true : 'not real'); },
        solution: `The vertices are ${c} plus ${R} times each ${ord(n)} root of 1, so they are exactly the solutions of (z − ${c})<sup>${n}</sup> = ${num(R ** n)}. So (z − ${c})<sup>${n}</sup> − ${num(R ** n)} = (z − z<sub>1</sub>)(z − z<sub>2</sub>)⋯(z − z<sub>${n}</sub>), since both sides have leading coefficient 1 and the same ${n} roots. `
          + `Put in z = 0: (−${c})<sup>${n}</sup> − ${num(R ** n)} = (−1)<sup>${n}</sup>z<sub>1</sub>z<sub>2</sub>⋯z<sub>${n}</sub>. ` + (n % 2 ? `Since ${n} is odd, this says −${c}<sup>${n}</sup> − ${num(R ** n)} = −z<sub>1</sub>z<sub>2</sub>⋯z<sub>${n}</sub>, so the product is ${c}<sup>${n}</sup> + ${num(R ** n)}` : `Since ${n} is even, the minus signs in the powers go away, and the product is ${c}<sup>${n}</sup> − ${num(R ** n)}`) + ` = <b>${num(ans)}</b>.`,
      };
    }
    const CEN = [[3, 0], [-2, 0], [0, 2], [1, 1], [-1, 2], [4, -1], [0, -3], [5, 0]];
    const [n, R, [u, v]] = pick(c2, 'least', [[4, 6, 8, 12], [2, 3, 4], CEN], (n, R) => R ** n <= 70000);
    const R2 = R * R, sh = `z${signed(-u)}${v === 0 ? '' : ` ${v < 0 ? '+' : '−'} ${Math.abs(v) === 1 ? '' : Math.abs(v)}i`}`;
    const times = (c, t, q = 1) => { const [p, b] = cut(c, q), top = p === 1 ? t : `${p}(${t})`; return b === 1 ? top : over(top, b); };
    const least = { 4: [R2, num(R2, 0)], 6: fracSurd(R2, 4, 3), 8: [(R2 * (Math.SQRT2 - 1)) / 2, times(R2, '√2 − 1', 2)], 12: [(R2 * (2 - Math.sqrt(3))) / 4, times(R2, '2 − √3', 4)] }[n];
    const area = { 4: [2 * R2, num(2 * R2, 0)], 6: fracSurd(3 * R2, 2, 3), 8: fracSurd(2 * R2, 1, 2), 12: [3 * R2, num(3 * R2, 0)] }[n];
    const center = { 4: [R2 / 2, fr(cut(R2, 2))], 6: fracSurd(3 * R2, 4, 3), 8: fracSurd(R2, 4, 2), 12: [R2 / 4, fr(cut(R2, 4))] }[n];
    const side = { 4: [2 * R2, num(2 * R2, 0)], 6: [R2, num(R2, 0)], 8: [R2 * (2 - Math.SQRT2), times(R2, '2 − √2')], 12: [R2 * (2 - Math.sqrt(3)), times(R2, '2 − √3')] }[n];
    const steps = {
      4: `Each side has s<sup>2</sup> = 2·${R2}, and each angle is 90°, so the area is ½·${2 * R2} = ${num(R2, 0)}.`,
      6: `Each side has length ${R}, and each angle is 120°, so the area is ½·${R2}·sin 120° = ${least[1]}.`,
      8: `Each side has s<sup>2</sup> = ${R2}(2 − 2 cos 45°) = ${R2}(2 − √2), and each angle is 135°, so the area is ½·s<sup>2</sup>·sin 135° = ${least[1]}.`,
      12: `Each side has s<sup>2</sup> = ${R2}(2 − 2 cos 30°) = ${R2}(2 − √3), and each angle is 150°, so the area is ½·s<sup>2</sup>·sin 150° = ${least[1]}.`,
    }[n];
    return {
      topic: GE, rank: 17,
      text: `The solutions of (${sh})<sup>${n}</sup> = ${num(R ** n, 0)} are the vertices of a regular polygon in the complex plane. What is the least possible area of a triangle whose vertices are three of these solutions?`,
      answer: tchoices(least, [center, side, area, [R2, num(R2, 0)], fracSurd(3 * R2, 4, 3), [2 * R2, num(2 * R2, 0)], [R2 / 2, fr(cut(R2, 2))], [3 * R2, num(3 * R2, 0)], [4 * R2, num(4 * R2, 0)]]),
      check: () => {
        const pts = range(0, n - 1).map((k) => cadd([u, v], cis((2 * Math.PI * k) / n).map((t) => R * t)));
        for (const p of pts) { const w = cpow(csub(p, [u, v]), n); if (Math.abs(w[0] - R ** n) > 1e-6 * R ** n || Math.abs(w[1]) > 1e-6 * R ** n) return 'a point is not a solution'; }
        let best = Infinity;
        for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) best = Math.min(best, shoelace([pts[i], pts[j], pts[k]]));
        return agree(best, least[0], 'the smallest triangle');
      },
      solution: `Solving for z, the solutions are the center ${gi(u, v)} plus ${R} times each ${ord(n)} root of 1. So they form a regular ${n}-gon with radius ${R}, and the center doesn’t affect the area. `
        + `With two vertices fixed, the third gives the smallest height when it is next to one of them, so the smallest triangle uses three neighboring vertices. ${steps} So the least area is <b>${least[1]}</b>.`,
    };
  },
  // what a condition on |z − a| draws: the segment, when the two distances add up to the distance between the points, and a circle when their ratio is fixed
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['segment', 'circle']);
    const DIR = [[3, 4], [4, 3], [5, 12], [12, 5], [-3, 4], [4, -3], [6, 8], [-4, 3], [8, -6], [-6, 8]];
    if (form === 'segment') {
      const [p, s] = pick(c2, 'segment', [[[1, 2], [-3, 1], [2, -4], [-2, -1], [3, 1], [-1, 3], [-4, -2], [5, -2], [3, 4]], DIR], (p, s) => { const q = cadd(p, s); return cross(p, q) !== 0 && q[0] !== 0 && q[1] !== 0 && !(p[0] * q[0] + p[1] * q[1] === 0); });
      const q = cadd(p, s), L = Math.hypot(...s), dot = -(p[0] * s[0] + p[1] * s[1]), t = dot / (L * L), inside = t > 0 && t < 1, line = cut(Math.abs(cross(p, q)), L);
      const P2 = p[0] ** 2 + p[1] ** 2, Q2 = q[0] ** 2 + q[1] ** 2, end2 = P2 < Q2 ? P2 : Q2, near2 = P2 < Q2 ? p : q, ans = inside ? fv(line) : rootLabel(end2);
      const mid = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
      return {
        topic: GE, rank: 17,
        text: `A complex number z satisfies |z − (${gi(...p)})| + |z − (${gi(...q)})| = ${L}. What is the least possible value of |z|?`,
        answer: tchoices(ans, [fv(line), rootLabel(P2), rootLabel(Q2), fv(cut(L, 2)), rootLabel(mid[0] ** 2 * 4 + mid[1] ** 2 * 4), fv(cut(Math.abs(cross(p, q)), 2 * L)), fv(cut(2 * Math.abs(cross(p, q)), L))]),
        check: () => {
          // walk along the segment; points off it break the triangle inequality
          let best = Infinity;
          for (let i = 0; i <= 200000; i++) { const z = cadd(p, [(s[0] * i) / 200000, (s[1] * i) / 200000]); best = Math.min(best, cabs(z)); }
          return both(Math.abs(best - ans[0]) < 1e-6 ? true : `the least found was ${best}, said ${ans[0]}`, agree(L, dist(p, q), 'the length'));
        },
        solution: `The distance between the two fixed points is √(${s[0] ** 2} + ${s[1] ** 2}) = ${L}, which is exactly the sum given. By the triangle inequality, the sum of the distances from z to two points is at least the distance between them, with equality only on the segment joining them. So z lies on that segment. `
          + (inside
            ? `The closest point of the line to 0 is the foot of the perpendicular, and here it falls inside the segment. Its distance from 0 is twice the area of the triangle with vertices 0, ${gi(...p)} and ${gi(...q)}, divided by the base ${L}: |${p[0]}·${paren(q[1])} − ${paren(p[1])}·${paren(q[0])}| ÷ ${L} = <b>${ans[1]}</b>.`
            : `The foot of the perpendicular from 0 falls outside the segment, since the angle at the nearer end is obtuse. So the closest point is that end, ${gi(...near2)}, and the least value is <b>${ans[1]}</b>.`),
      };
    }
    const [e, [kp, kq], [bx, by]] = pick(c2, 'circle', [[[3, 4], [4, 3], [5, 12], [-3, 4], [6, 8], [0, 5], [6, 0], [0, 4]], [[2, 1], [3, 1], [3, 2], [4, 1]], [[0, 0], [1, 1], [-2, 1], [1, -2], [3, 0]]], (e, [kp, kq], b) => !(b[0] === 0 && b[1] === 0 && e[0] === 0));
    const a = cadd([bx, by], e), Dd = Math.hypot(...e), k2 = cut(kp * kp, kq * kq), den = fs(k2, [1, 1]), r = cut(kp * Dd * kq, kp * kp - kq * kq), r2 = fm(r, r), ans = piLabel(r2);
    const zm = (x, y) => (x === 0 && y === 0 ? '|z|' : `|z − (${gi(x, y)})|`), K = fr(cut(kp, kq));
    return {
      topic: GE, rank: 19,
      text: `The complex numbers z with ${zm(...a)} = ${K}·${zm(bx, by)} form a circle in the complex plane. What is the area of the region inside that circle?`,
      answer: tchoices(ans, [piLabel(cut(Dd * Dd, 1)), piLabel(fm(r, [1, 1])), piLabel(fm(cut(Dd, 1), fm(cut(Dd, 1), cut(kq * kq, kp * kp)))), piLabel(fm(cut(kp * Dd, kp + kq), cut(kp * Dd, kp + kq))), piLabel(fm(cut(Dd * kq * kq, kp * kp - kq * kq), cut(Dd * kq * kq, kp * kp - kq * kq))), piLabel(fm(fm(r, [2, 1]), fm(r, [2, 1])))]),
      check: () => {
        const kv = kp / kq, dir = [e[0] / Dd, e[1] / Dd], at = (t) => cadd([bx, by], [dir[0] * t, dir[1] * t]);
        const ts = rootsOf((t) => dist(at(t), a) - kv * dist(at(t), [bx, by]), -40.03, 40.01, 16000);
        if (ts.length !== 2) return `found ${ts.length} points on the line`;
        const rad = Math.abs(ts[1] - ts[0]) / 2, cen = at((ts[0] + ts[1]) / 2);
        for (const ph of [0.3, 1.1, 2.7, 4.4]) { const z = cadd(cen, cis(ph).map((v) => rad * v)); const g = agree(dist(z, a), kv * dist(z, [bx, by]), 'a point on the circle'); if (g !== true) return g; }
        return agree(Math.PI * rad * rad, ans[0], 'the area');
      },
      solution: `${bx === 0 && by === 0 ? 'Here |z| is already measured from 0, so just write w = z' : `Move ${gi(bx, by)} to 0 by letting w = z − (${gi(bx, by)})`}, and let e = ${gi(...e)}, so |e| = ${Dd}. The condition is |w − e| = ${K}|w|. Square it, using |u|<sup>2</sup> = u·ū: |w|<sup>2</sup> − (w·ē + w̄·e) + ${Dd * Dd} = ${fr(k2)}|w|<sup>2</sup>. `
        + `Let c = ${fr(k2)} − 1 = ${fr(den)}, so c|w|<sup>2</sup> + (w·ē + w̄·e) = ${Dd * Dd}. Dividing by c and completing the square, |w + e/c|<sup>2</sup> = ${Dd * Dd}/c + ${Dd * Dd}/c<sup>2</sup>, which is a circle. `
        + `That right side is ${fr(fa(fd([Dd * Dd, 1], den), fd([Dd * Dd, 1], fm(den, den))))}, the square of the radius ${fr(r)}. So the area is <b>${ans[1]}</b>.`,
    };
  },
  // z² = A and z² = B: square roots of complex numbers, then a parallelogram centered at 0
  (d, ctx) => {
    const U = [[2, 1], [3, 2], [3, 1], [1, 2], [4, 1], [2, 3], [4, 3], [1, 3], [5, 2], [2, -1], [3, -2], [4, -1], [1, -2]];
    const [u, v] = pick(ctx, 'roots', [U, U], (u, v) => cross(u, v) !== 0 && u[0] < v[0] && Math.abs(cross(u, v)) >= 2);
    const A = cmul(u, u), Bv = cmul(v, v), c = Math.abs(cross(u, v)), ans = 2 * c, n2 = (z) => z[0] * z[0] + z[1] * z[1];
    return {
      topic: GE, rank: 18,
      text: `The four solutions of z<sup>2</sup> = ${gi(...A)} and z<sup>2</sup> = ${gi(...Bv)} are the vertices of a parallelogram in the complex plane. What is its area?`,
      answer: fchoices(d, ans, [c, 4 * c, Math.abs(cross(A, Bv)), n2(u) + n2(v), 2 * n2(u), ans + 1]),
      check: () => {
        const r1 = csqrt(A), r2 = csqrt(Bv), pts = [r1, [-r1[0], -r1[1]], r2, [-r2[0], -r2[1]]];
        return both(agree(cmul(r1, r1)[1], A[1], 'the first root'), agree(cmul(r2, r2)[1], Bv[1], 'the second root'), agree(shoelace(hull(pts)), ans, 'the area'));
      },
      solution: `Find the square roots with z = x + yi: x<sup>2</sup> − y<sup>2</sup> is the real part, 2xy is the imaginary part, and x<sup>2</sup> + y<sup>2</sup> = |z<sup>2</sup>|. For the first, x<sup>2</sup> + y<sup>2</sup> = √(${paren(A[0])}<sup>2</sup> + ${paren(A[1])}<sup>2</sup>) = ${n2(u)}, so the roots are ±(${gi(...u)}). In the same way, the second has roots ±(${gi(...v)}). `
        + `The four points are ±(${num(u[0])}, ${num(u[1])}) and ±(${num(v[0])}, ${num(v[1])}), so the origin is the center of the parallelogram, and the diagonals cut it into four triangles of equal area. Each triangle has vertices 0, ${gi(...u)} and ${gi(...v)}, with area ½|${num(u[0])}·${paren(v[1])} − ${paren(u[1])}·${paren(v[0])}| = ${fr(cut(c, 2))}. `
        + `So the area is 4·${fr(cut(c, 2))} = <b>${ans}</b>.`,
    };
  },
  // a walk with steps 1, 2, 3, … and a fixed turn: the position is a sum k·ωᵏ⁻¹, and multiplying by 1 − ω telescopes it
  (d, ctx) => {
    const [th, m] = pick(ctx, 'walk', [[60, 90, 120], [2, 3, 4, 5, 6, 7, 8, 9, 10, 12]]);
    const per = 360 / th, N = per * m, ans = { 60: [N, num(N, 0)], 90: fracSurd(N, 2, 2), 120: fracSurd(N, 3, 3) }[th];
    const gapT = { 60: '1', 90: '√2', 120: '√3' }[th];
    return {
      topic: GE, rank: 20,
      text: `A bug starts at the origin and walks 1 unit east. It then turns ${th}° to the left and walks 2 units, turns ${th}° to the left and walks 3 units, and so on, each walk 1 unit longer than the last. How far is it from the origin after ${N} walks?`,
      answer: tchoices(ans, [[N, num(N, 0)], fracSurd(N, 2, 2), fracSurd(N, 1, 2), fracSurd(N, 3, 3), fracSurd(N, 1, 3), [N / 2, num(N / 2, 0)], [2 * N, num(2 * N, 0)], [(N * (N + 1)) / 2, num((N * (N + 1)) / 2, 0)]]),
      check: () => {
        let x = 0, y = 0, dir = 0;
        for (let k = 1; k <= N; k++) { x += k * Math.cos(dir); y += k * Math.sin(dir); dir += (th * Math.PI) / 180; }
        return agree(Math.hypot(x, y), ans[0], 'the distance');
      },
      solution: `Let ω = cos ${th}° + i sin ${th}°, the turn. The bug ends at S = 1 + 2ω + 3ω<sup>2</sup> + ⋯ + ${N}ω<sup>${N - 1}</sup>. Multiply by ω and subtract, the trick for a sum like this: S − ωS = (1 + ω + ω<sup>2</sup> + ⋯ + ω<sup>${N - 1}</sup>) − ${N}ω<sup>${N}</sup>. `
        + `Since ${N} is a multiple of ${per}, ω<sup>${N}</sup> = 1, and the powers of ω in the bracket go evenly around the circle and add up to 0. So S(1 − ω) = −${N}, and |S| = ${N}/|1 − ω|. `
        + `The distance between 1 and ω on the unit circle, ${th}° apart, is |1 − ω| = ${gapT}. So the bug is <b>${ans[1]}</b> units from the origin.`,
    };
  },
  // all au + bv + cw with a, b and c from 0 to 1: a hexagon made of three parallelograms
  (d, ctx) => {
    const VS = [[2, 1], [1, 2], [1, 3], [3, 1], [-1, 2], [2, -1], [-2, 1], [1, -3], [3, 2], [-1, 3]];
    const [u, v, w] = pick(ctx, 'zono', [VS, VS, VS], (u, v, w) => VS.indexOf(u) < VS.indexOf(v) && VS.indexOf(v) < VS.indexOf(w) && cross(u, v) !== 0 && cross(v, w) !== 0 && cross(u, w) !== 0);
    const c1 = Math.abs(cross(u, v)), c2 = Math.abs(cross(v, w)), c3 = Math.abs(cross(u, w)), ans = c1 + c2 + c3;
    return {
      topic: GE, rank: 20,
      text: `Let u = ${gi(...u)}, v = ${gi(...v)} and w = ${gi(...w)}. The numbers au + bv + cw, with a, b and c any real numbers from 0 to 1, fill a region of the complex plane. What is its area?`,
      answer: fchoices(d, ans, [c1, c1 + c2, c1 + c3, c2 + c3, Math.abs(cross(u, v) + cross(v, w) + cross(w, u)), 2 * ans, ans / 2 === Math.floor(ans / 2) ? ans / 2 : ans + 2]),
      check: () => {
        const pts = [];
        for (const a of [0, 1]) for (const b of [0, 1]) for (const c of [0, 1]) pts.push([a * u[0] + b * v[0] + c * w[0], a * u[1] + b * v[1] + c * w[1]]);
        return agree(shoelace(hull(pts)), ans, 'the area of the hull');
      },
      solution: `With just au + bv, the numbers fill a parallelogram with sides u and v. Adding cw slides that parallelogram along the arrow w, and it sweeps out a hexagon. The hexagon can be cut into three parallelograms, one for each pair of arrows. `
        + `A parallelogram with sides (p, q) and (r, s) has area |ps − qr|, so the three areas are ${c1}, ${c2} and ${c3}. So the region has area ${c1} + ${c2} + ${c3} = <b>${ans}</b>.`,
    };
  },
  // z = w + k/w on the circle |w| = r: an ellipse with semi-axes r + k/r and r − k/r
  (d, ctx) => {
    const [r, k] = pick(ctx, 'ellipse', [[2, 3, 4, 5], [1, 2, 3, 4, 6]], (r, k) => k < r * r && !(r === 3 && k === 1) && gcd(k, r) === 1);
    const ans = piLabel(cut(r ** 4 - k * k, r * r)), a = cut(r * r + k, r), b = cut(r * r - k, r);
    return {
      topic: GE, rank: 21,
      text: `As w moves around the circle |w| = ${r} in the complex plane, the number z = w + ${over(k, 'w')} traces out a closed curve. What is the area of the region inside that curve?`,
      answer: tchoices(ans, [piLabel(fm(a, a)), piLabel(fm(b, b)), piLabel([r * r, 1]), piLabel(cut(r ** 4 + k * k, r * r)), piLabel(fm(a, [2, 1])), piLabel(fa([r * r, 1], [k, 1]))]),
      check: () => {
        const pts = range(0, 19999).map((i) => { const w = cis((i * 2 * Math.PI) / 20000).map((v) => r * v); return cadd(w, cdiv([k, 0], w)); });
        return Math.abs(shoelace(pts) - ans[0]) < 1e-4 * ans[0] ? true : `the traced area was ${shoelace(pts)}, said ${ans[0]}`;
      },
      solution: `Write w = ${r}(cos t + i sin t). Then ${over(k, 'w')} = ${fr(cut(k, r))}(cos t − i sin t), since dividing by a point on a circle flips its angle. Adding, z = (${r} + ${fr(cut(k, r))})cos t + i(${r} − ${fr(cut(k, r))})sin t. `
        + `That is an ellipse with semi-axes ${fr(a)} and ${fr(b)}, so its area is π·${fr(a)}·${fr(b)} = <b>${ans[1]}</b>.`,
    };
  },
  // an equilateral triangle: with a, b and c written from the center, ab + bc + ca only depends on the center
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['pairs', 'squares']);
    const [S, side] = pick(c2, `equi-${form}`, [[6, 9, 12, 15, 18, 21, 24, 30], [3, 5, 8, 10, 14, 16, 20]], (S, side) => S % 3 === 0 && S !== side);
    const ans = (S * S) / 3, what = form === 'pairs' ? 'ab + bc + ca' : 'a<sup>2</sup> + b<sup>2</sup> + c<sup>2</sup>';
    return {
      topic: GE, rank: 22,
      text: `Complex numbers a, b and c are the vertices of an equilateral triangle with side length ${side}, and |a + b + c| = ${S}. What is |${what}|?`,
      answer: fchoices(d, ans, [S * S, S * S / 9, ans + side * side, (S * side) / 3, side * side, Math.abs(ans - side * side), ans + Math.floor((side * side) / 3)]),
      check: () => both(...[0, 0.7, 2.2].map((ph) => {
        const g = [S / 3, 0], rad = side / Math.sqrt(3), [p, q, r] = [0, 1, 2].map((j) => cadd(g, cis(ph + (2 * Math.PI * j) / 3).map((v) => rad * v)));
        const val2 = form === 'pairs' ? cadd(cadd(cmul(p, q), cmul(q, r)), cmul(r, p)) : cadd(cadd(cmul(p, p), cmul(q, q)), cmul(r, r));
        return both(agree(dist(p, q), side, 'the side'), agree(cabs(cadd(cadd(p, q), r)), S, 'the sum'), agree(cabs(val2), ans));
      })),
      solution: `Let g = (a + b + c)/3 be the center, so |g| = ${fr(cut(S, 3))}. Measured from the center, the vertices are a turn of 120° apart, so a = g + u, b = g + uω and c = g + uω<sup>2</sup> for some u, where ω<sup>2</sup> + ω + 1 = 0. `
        + (form === 'pairs'
          ? `Multiply out: ab + bc + ca = 3g<sup>2</sup> + 2gu(1 + ω + ω<sup>2</sup>) + u<sup>2</sup>(ω + ω<sup>3</sup> + ω<sup>2</sup>), and both brackets are 0, because ω<sup>3</sup> = 1. `
          : `Multiply out: a<sup>2</sup> + b<sup>2</sup> + c<sup>2</sup> = 3g<sup>2</sup> + 2gu(1 + ω + ω<sup>2</sup>) + u<sup>2</sup>(1 + ω<sup>2</sup> + ω<sup>4</sup>), and both brackets are 0, because ω<sup>4</sup> = ω. `)
        + `So the value is 3g<sup>2</sup>, whatever the side length is, and its modulus is 3·${fr(cut(S, 3))}<sup>2</sup> = <b>${num(ans)}</b>. The side length ${side} is not needed.`,
    };
  },
  // the parallelogram 0, z, 1/z, z + 1/z: its area fixes the angle, and AM-GM takes care of the modulus
  (d, ctx) => {
    const [[a, b, c]] = pick(ctx, 'unitpar', [[[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [8, 15, 17], [15, 8, 17], [7, 24, 25], [24, 7, 25], [20, 21, 29], [21, 20, 29], [9, 40, 41], [40, 9, 41]]]);
    const s = cut(a, c), co = cut(b, c), ans = cut(2 * (c - b), c);
    return {
      topic: GE, rank: 24,
      text: `A complex number z is such that the points 0, z, ${over(1, 'z')} and z + ${over(1, 'z')} are the vertices of a parallelogram of area ${fr(s)} in the complex plane. What is the least possible value of |z + ${over(1, 'z')}|<sup>2</sup>?`,
      answer: fchoices(d, ans, [cut(2 * (c + b), c), cut(2 * a, c), co, cut(2 * c - a, c), cut(c - b, c), [2, 1]]),
      check: () => {
        const sv = a / c; let best = Infinity;
        for (const t of [Math.asin(sv) / 2, (Math.PI - Math.asin(sv)) / 2, Math.PI + Math.asin(sv) / 2]) for (let i = 0; i <= 4000; i++) {
          const r = 0.2 + (i * 4.8) / 4000, z = cis(t).map((v) => r * v), inv = cdiv([1, 0], z);
          if (Math.abs(Math.abs(cross(z, inv)) - sv) > 1e-9) return 'the area does not fit';
          const w = cabs(cadd(z, inv)); best = Math.min(best, w * w);
        }
        return Math.abs(best - val(ans)) < 1e-5 ? true : `the least found was ${best}, said ${val(ans)}`;
      },
      solution: `Write z = r(cos θ + i sin θ), so 1/z = (1/r)(cos θ − i sin θ). The parallelogram has sides of length r and 1/r, whose product is 1, with an angle of 2θ between them. So its area is |sin 2θ| = ${fr(s)}, and then cos 2θ = ±${fr(co)}. `
        + `Now expand, using |u|<sup>2</sup> = u·ū: |z + 1/z|<sup>2</sup> = r<sup>2</sup> + 1/r<sup>2</sup> + 2 cos 2θ. By AM-GM, r<sup>2</sup> + 1/r<sup>2</sup> ≥ 2, with equality at r = 1, and r doesn’t affect the area. For the smallest value, also choose the negative cosine: 2 − 2·${fr(co)} = <b>${fr(ans)}</b>.`,
    };
  },
];

export const logsComplex = {
  [LR]: logRules,
  [EL]: logEquations,
  [LW]: logWhole,
  [EX]: exponential,
  [CA]: complexArith,
  [PW]: powers,
  [RU]: rootsUnity,
  [GE]: geometry,
};
