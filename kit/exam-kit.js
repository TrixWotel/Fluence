// Fluence's tests like the ones in class: what one is made of, how each part is marked, and the graphs and tables of
// their contexts. Nothing here touches the page (kit/exam.js shows a test), so a bank of tests can be checked outside a
// browser too.
//
// examBank(id, { title, minutes, slots, guide }) is a bank of tests: slots has a list of question makers for each
// question of a test, and test n takes one maker from each list (consecutive tests walk through every combination), its
// dice rolled for n, so "Test 37" is always the same test. guide is the formulas and data printed at the top (HTML).
//
// A question maker is (d, ctx) => ({ title, intro, figures: [html], guide, parts: [part…] }), with d the dice (d.int,
// d.pick, d.shuffle, d.chance, d.r: see bank.js) and ctx { n, slot }. intro and figures are the context: what was done,
// a graph, a table of data. guide, if given, is a box of formulas for that question alone.
//
// A part is { kind, ask, marks, topic, working, … }: ask is HTML, topic (if given) is the name of one of the test's
// practice topics, so a part you lose marks on points you to its lesson, and working is the mark scheme's worked answer.
//   number   value, unit, tol: one number to work out. tol is a share of the answer (0.02, 2%, if left out) or { abs }.
//            marks: 1 if left out.
//   steps    steps: [{ label, value, unit, tol, marks }]: a calculation a box at a time (the volume, then the mass…). The
//            last step right earns the whole part, so the working only matters when the answer is wrong: then each
//            right step earns its own marks (1 each if left out).
//   choice   choices: [html], correct (an index, or a list of the right ones)
//   select   fields: [{ label, options: [text], correct (index or list), marks }]: a word or phrase to pick for each
//            (the independent variable, the dependent one…)
//   written  lines (how tall the box is), points: [what earns a mark], model (a model answer), notes: [what loses marks]
//   sketch   x, y (the axes' names, which you label yourself), pens: [names of the lines to draw], model: [{ pen, pts:
//            [[x, y]…] }] (from 0 to 1 across and up), points, notes, and y0 (where the x-axis crosses, 0.5 for a quantity
//            that goes below zero, like v_y): a graph drawn by hand, marked like a written answer
//   table    head: [html], rows: [[cell]] (null where a cell is to be worked out), fill: { column: { values: [one per
//            row, null for a row given], tol, unit, marks } }: each column earns its marks when every cell is right
//   plot     quantities: { key: { label, values: [one per row of data] } }, pairs: [[y key, x key]…] (the axes that give
//            a straight line): you pick the axes, the page plots the points and you drag a line of best fit. A mark for
//            axes that give a straight line, and a mark for a line close to the best one.
// A choice or select part can ask for a reason too: explain: { ask, lines, points, model, notes, marks }.
// number and steps parts can follow on from a plot part in the same question: from: { part (its index), value: (line)
// => the answer that line gives, or null (line: { y, x, slope, intercept }), tol }. An answer that matches what your own
// line gives earns the marks too.
// written, sketch and explain parts are marked by you: you tick the points your answer makes, each worth a mark, up to
// the part's marks (as many as its points if left out).
import { dice, graph, num, round, readNumber } from './bank.js';

// ---------- numbers in a test ----------
const SUPS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
export const sup = (n) => String(n).replace(/-/g, '⁻').replace(/\d/g, (c) => SUPS[c]);
// x to s significant figures, written with ×10ⁿ when it's very big or very small: sig(0.000037699) is 3.77 × 10⁻⁵
export function sig(x, s = 3) {
  if (!Number.isFinite(x)) return String(x);
  if (x === 0) return '0';
  let e = Math.floor(Math.log10(Math.abs(x)));
  if (e < -3 || e > 5) {
    let m = round(x / 10 ** e, s - 1);
    if (Math.abs(m) >= 10) { m /= 10; e++; }
    return `${num(m, s - 1)} × 10${sup(e)}`;
  }
  return num(Number(x.toPrecision(s)), Math.max(0, s - 1 - e));
}
// a measured value: v give or take up to a share of it (0.02 is 2% either way), from the dice
export const noisy = (d, v, share = 0.02) => v * (1 + (d.r() * 2 - 1) * share);
// the straight line closest to points [[x, y]…] (least squares), with the middle of the points (mx, my)
export function bestFit(points) {
  const n = points.length, mx = points.reduce((s, p) => s + p[0], 0) / n, my = points.reduce((s, p) => s + p[1], 0) / n;
  let sxy = 0, sxx = 0;
  for (const [x, y] of points) { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; }
  const slope = sxy / sxx;
  return { slope, intercept: my - slope * mx, mx, my };
}

// ---------- the contexts: graphs of data and tables ----------
// measured data as a line graph, a line for each series, with a key when there's more than one; title goes above it.
// series [{ name, points: [[x, y]…] }]; x and y are [from, to, step] as for bank.js's graph(); dots marks each reading
export function lineGraph({ series, x, y, xLabel, yLabel, title, dots = false, w = 560, h = 320 }) {
  const svg = graph({ x, y, xLabel, yLabel, w, h, lines: series.map((s) => s.points), points: dots ? series.flatMap((s) => s.points.map(([a, b]) => [a, b, ''])) : [] });
  const key = series.length > 1 ? `<div class="legend">${series.map((s, i) => `<span class="k k${i}">${s.name}</span>`).join('')}</div>` : '';
  return `<div class="chart">${title ? `<p class="chart-title">${title}</p>` : ''}${svg}${key}</div>`;
}
// a table of data: head [html], rows [[cell]], with a title above it
export const dataTable = (head, rows, title = '') =>
  `<div class="chart">${title ? `<p class="chart-title">${title}</p>` : ''}<div class="scroll"><table class="data exam"><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${
    rows.map((r) => `<tr>${r.map((c) => `<td>${c ?? ''}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;

// ---------- the bank ----------
// each part's marks, filled in where the maker left them out
function tidy(p) {
  const each = (list) => list.reduce((s, x) => s + (x.marks ?? 1), 0);
  const marks = { number: p.marks ?? 1, steps: p.steps && each(p.steps), choice: p.marks ?? 1, select: p.fields && each(p.fields),
    written: p.marks ?? p.points?.length, sketch: p.marks ?? p.points?.length, table: p.fill && each(Object.values(p.fill)), plot: 2 }[p.kind];
  const explain = p.explain ? { lines: 3, ...p.explain, marks: p.explain.marks ?? p.explain.points.length } : undefined;
  return { ...p, marks, ...(explain ? { explain } : {}) };
}
export function examBank(id, { title, minutes = 45, slots, guide = '', count = 1000 }) {
  return {
    id, title, minutes, guide, count, slots: slots.map((s) => s.length),
    make(n) {
      let k = n - 1;
      const questions = slots.map((makers, slot) => {
        const i = k % makers.length;
        k = Math.floor(k / makers.length);
        const q = makers[i](dice(`${id}:${slot}:${i}`, n), { n, slot });
        const parts = q.parts.map(tidy);
        return { ...q, figures: q.figures || [], parts, maker: i, marks: parts.reduce((s, p) => s + p.marks + (p.explain?.marks ?? 0), 0) };
      });
      return { n, title, minutes, guide, questions, marks: questions.reduce((s, q) => s + q.marks, 0) };
    },
  };
}

// ---------- marking ----------
const isIn = (right, i) => (Array.isArray(right) ? right.includes(i) : right === i);
// a typed number within tol of value: tol a share of it (0.02 if left out) or { abs }
export function within(value, given, tol) {
  const v = readNumber(given);
  if (v == null || !Number.isFinite(value)) return false;
  const t = tol && typeof tol === 'object' ? tol.abs : (tol ?? 0.02) * Math.abs(value) || 1e-9;
  return Math.abs(v - value) <= t + 1e-12;
}
// the points a plot part draws for a choice of axes, and the line someone dragged ([[x, y], [x, y]] → slope, intercept)
export const pointsFor = (part, y, x) => part.quantities[x].values.map((v, i) => [v, part.quantities[y].values[i]]);
export function lineOf(ends) {
  if (!Array.isArray(ends) || ends.length !== 2) return null;
  const [[x1, y1], [x2, y2]] = ends;
  if (![x1, y1, x2, y2].every(Number.isFinite) || x1 === x2) return null;
  const slope = (y2 - y1) / (x2 - x1);
  return { slope, intercept: y1 - slope * x1 };
}
// a plot: axes that give a straight line, and a line close to the best one (its slope within 10%, passing near the
// middle of the points)
export function plotMarks(part, a) {
  const out = { axes: false, line: false, fit: null, mine: null, got: 0, of: 2 };
  if (!a?.y || !a?.x || !part.quantities[a.y] || !part.quantities[a.x]) return out;
  out.axes = part.pairs.some(([y, x]) => y === a.y && x === a.x);
  const pts = pointsFor(part, a.y, a.x), ys = pts.map((p) => p[1]);
  out.fit = bestFit(pts);
  out.mine = lineOf(a.line);
  if (out.axes && out.mine) {
    const { slope, mx, my } = out.fit, spread = Math.max(...ys) - Math.min(...ys) || Math.abs(my) || 1;
    out.line = Math.abs(out.mine.slope - slope) <= 0.1 * Math.abs(slope) && Math.abs(out.mine.slope * mx + out.mine.intercept - my) <= 0.06 * spread;
  }
  out.got = (out.axes ? 1 : 0) + (out.line ? 1 : 0);
  return out;
}
// the line a plot part's answer gives, for the parts that follow on from it: { y, x, slope, intercept }, or null when
// its axes don't give a straight line
export function lineFrom(part, a) {
  const m = plotMarks(part, a);
  return m.axes && m.mine ? { y: a.y, x: a.x, ...m.mine } : null;
}
function follows(part, given, lines) {
  const line = part.from && lines[part.from.part];
  if (!line) return false;
  const v = part.from.value(line);
  return v != null && Number.isFinite(v) && within(v, given, part.from.tol ?? 0.03);
}
// the marks the page gives a part (not counting its explain): null for a part you mark yourself. lines: the lines of
// the question's plot parts, by part index (lineFrom)
export function markAuto(part, a, lines = {}) {
  switch (part.kind) {
    case 'number': return within(part.value, a, part.tol) || follows(part, a, lines) ? part.marks : 0;
    case 'steps': {
      const given = Array.isArray(a) ? a : [], last = part.steps.length - 1;
      if (within(part.steps[last].value, given[last], part.steps[last].tol) || follows(part, given[last], lines)) return part.marks;
      return part.steps.reduce((s, x, i) => s + (within(x.value, given[i], x.tol) ? x.marks ?? 1 : 0), 0);
    }
    case 'choice': return a != null && isIn(part.correct, a) ? part.marks : 0;
    case 'select': return part.fields.reduce((s, f, i) => s + (Array.isArray(a) && a[i] != null && isIn(f.correct, a[i]) ? f.marks ?? 1 : 0), 0);
    case 'table': return Object.entries(part.fill).reduce((s, [c, f]) => s + (f.values.every((v, r) => v == null || within(v, a?.[c]?.[r], f.tol)) ? f.marks ?? 1 : 0), 0);
    case 'plot': return plotMarks(part, a).got;
    default: return null;
  }
}
// the marks you give yourself: the points you ticked, up to the marks there are
export const markSelf = (marks, ticks) => Math.min(marks, (ticks || []).filter(Boolean).length);
// whether a cell or step was right, for showing which ones were
export const cellRight = within;
export const choiceRight = isIn;

// ---------- checks: an answer that earns every mark the page gives (for checking a bank outside a browser) ----------
export function perfect(part) {
  switch (part.kind) {
    case 'number': return String(part.value);
    case 'steps': return part.steps.map((s) => String(s.value));
    case 'choice': return Array.isArray(part.correct) ? part.correct[0] : part.correct;
    case 'select': return part.fields.map((f) => (Array.isArray(f.correct) ? f.correct[0] : f.correct));
    case 'table': return Object.fromEntries(Object.entries(part.fill).map(([c, f]) => [c, f.values.map((v) => (v == null ? '' : String(v)))]));
    case 'plot': {
      const [y, x] = part.pairs[0], pts = pointsFor(part, y, x), { slope, intercept } = bestFit(pts), xs = pts.map((p) => p[0]);
      const a = Math.min(...xs), b = Math.max(...xs);
      return { y, x, line: [[a, slope * a + intercept], [b, slope * b + intercept]] };
    }
    default: return null;
  }
}
