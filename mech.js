// Drawings for the forces courses: free-body diagrams, slopes, boxes on floors and tables (with a pulley), knots held
// by ropes, a weight pulled aside, beams on pivots or pinned to a wall, and two masses over a pulley. Lengths and angles
// are to scale; force arrows grow with the forces they show, with a shortest length so a small force still shows.
// Each drawing sizes itself to what's in it, labels included. physics/index.html styles them (arrows look like the
// vector drawings').
import { num, round } from '../kit/bank.js';

const R = (v) => round(v, 1);
const rad = (d) => (d * Math.PI) / 180;
// (a label's width, generous, since phones show labels bigger: enough to keep it inside the drawing)
const wide = (s) => String(s).replace(/<[^>]*>/g, '').length * 8.6 + 4;

function canvas() {
  const out = [], b = [Infinity, Infinity, -Infinity, -Infinity];
  const grow = ([x, y]) => { b[0] = Math.min(b[0], x); b[1] = Math.min(b[1], y); b[2] = Math.max(b[2], x); b[3] = Math.max(b[3], y); };
  const c = {
    raw(s, ...pts) { out.push(s); pts.forEach(grow); },
    line(p, q, cls) { c.raw(`<line class="${cls}" x1="${R(p[0])}" y1="${R(p[1])}" x2="${R(q[0])}" y2="${R(q[1])}"/>`, p, q); },
    poly(pts, cls) { c.raw(`<polygon class="${cls}" points="${pts.map(([x, y]) => `${R(x)},${R(y)}`).join(' ')}"/>`, ...pts); },
    path(d, cls, ...pts) { c.raw(`<path class="${cls}" d="${d}"/>`, ...pts); },
    circle([x, y], r, cls) { c.raw(`<circle class="${cls}" cx="${R(x)}" cy="${R(y)}" r="${R(r)}"/>`, [x - r, y - r], [x + r, y + r]); },
    // (y is the baseline)
    text([x, y], s, cls = 'bl', anchor = 'middle') {
      const w = wide(s), x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
      c.raw(`<text class="${cls}" x="${R(x)}" y="${R(y)}" text-anchor="${anchor}">${s}</text>`, [x0, y - 15], [x0 + w, y + 5]);
    },
    box: () => [...b],
    svg(label, pad = 8) {
      const w = b[2] - b[0] + 2 * pad, h = b[3] - b[1] + 2 * pad;
      return `<svg class="graph phys mech" viewBox="${R(b[0] - pad)} ${R(b[1] - pad)} ${R(w)} ${R(h)}" style="max-width:${Math.round(Math.min(560, w * 1.15))}px" role="img" aria-label="${label}">${out.join('')}</svg>`;
    },
  };
  return c;
}
const P = (p) => `${R(p[0])},${R(p[1])}`;
const toward = ([x, y], [ux, uy], d) => [x + ux * d, y + uy * d];

// an arrow from a to b: the line stops where its head starts. Its label goes past the tip (at: 'tip'), or beside the
// middle on the arrow's left or right (at: 'left' or 'right', looking along the arrow)
function arrow(c, a, b, { tone = 0, dash = false, label, i = 0, at = 'tip' } = {}) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (len < 1) return;
  const ux = (b[0] - a[0]) / len, uy = (b[1] - a[1]) / len, head = Math.min(11, len * 0.4), wing = head * 0.5;
  const cx = b[0] - ux * head, cy = b[1] - uy * head, d = `style="--d:${i * 110}ms"`;
  c.raw(`<line class="vec vec${tone}${dash ? ' dash' : ''}" pathLength="1" ${d} x1="${R(a[0])}" y1="${R(a[1])}" x2="${R(cx)}" y2="${R(cy)}"/>`, a, b);
  c.raw(`<polygon class="head head${tone}" ${d} points="${P(b)} ${R(cx - uy * wing)},${R(cy + ux * wing)} ${R(cx + uy * wing)},${R(cy - ux * wing)}"/>`);
  if (!label) return;
  const w = wide(label);
  if (at === 'tip') {
    const gap = 8 + (Math.abs(ux) * w) / 2 + Math.abs(uy) * 9;
    c.text([b[0] + ux * gap, b[1] + uy * gap + 5], label, `vl vl${tone}`);
  } else {
    const s = at === 'right' ? -1 : 1, gap = 7 + (Math.abs(uy) * w) / 2 + Math.abs(ux) * 9;
    c.text([(a[0] + b[0]) / 2 + uy * gap * s, (a[1] + b[1]) / 2 - ux * gap * s + 5], label, `vl vl${tone}`);
  }
}
// an angle's arc at o from direction a1 to a2 (degrees counterclockwise from right, a2 > a1), with its label
function arc(c, o, r, a1, a2, label, gap = 15) {
  const p = [o[0] + r * Math.cos(rad(a1)), o[1] - r * Math.sin(rad(a1))], q = [o[0] + r * Math.cos(rad(a2)), o[1] - r * Math.sin(rad(a2))];
  c.path(`M${P(p)}A${R(r)},${R(r)} 0 ${a2 - a1 > 180 ? 1 : 0} 0 ${P(q)}`, 'ang', p, q);
  // (a narrow angle's label sits further out, where there's room between its two lines)
  if (label) { const m = rad((a1 + a2) / 2), out = r + gap + Math.max(0, 32 - (a2 - a1)) * 0.9; c.text([o[0] + out * Math.cos(m), o[1] - out * Math.sin(m) + 5], label, 'dl'); }
}
// a box: its corners from the middle of its bottom edge, along u (its bottom edge) and n (up out of it)
const corners = (p, u, n, w, h) => [toward(toward(p, u, -w / 2), n, 0), toward(p, u, w / 2), toward(toward(p, u, w / 2), n, h), toward(toward(p, u, -w / 2), n, h)];
// a body's label: inside if it fits, else beside (where, as [x, y] and an anchor)
function bodyLabel(c, mid, w, text, beside, anchor = 'middle') {
  if (!text) return;
  if (wide(text) <= w + 2) c.text([mid[0], mid[1] + 5], text, 'bl');
  else c.text(beside, text, 'bl', anchor);
}

// ---------- free-body diagram ----------
// The forces on one body as arrows from its middle. When every force lies along the axes, each line (across, and up and
// down) is to its own scale, its biggest force 100 px long (76 for two forces on one line), so the forces that compete
// show which is bigger; when some lie at an angle (a slope's weight and its parts, a knot's ropes), all are to one
// scale, made longer if the smallest would come out under 26 px. forces: [{ angle (degrees counterclockwise
// from the right, so 270 is straight down), size, label, tone (0, 1 or 2), dash (for parts of a force) }].
// axes: the x axis's angle (0 level, the slope's angle for a body on a slope), drawn dashed with +x and +y marked;
// body: 'box' (turned to the axes) or 'dot'; caption: words above it, naming the body ("Forces on m₂").
export function fbd({ forces, axes = null, body = 'box', caption = null, label = 'a free-body diagram' }) {
  const sizes = forces.map((f) => Math.abs(f.size ?? 1)), max = Math.max(...sizes) || 1, least = Math.min(...sizes.filter((x) => x > 0), max);
  const line = (f) => { const r = ((((f.angle - (axes ?? 0)) % 180) + 180) % 180); return r < 1e-6 || r > 180 - 1e-6 ? 0 : Math.abs(r - 90) < 1e-6 ? 1 : -1; };
  const square = forces.every((f) => line(f) >= 0), top = [0, 1].map((k) => Math.max(0, ...forces.filter((f) => line(f) === k).map((f) => Math.abs(f.size ?? 1))));
  // (two forces on a line don't need the room five at angles do)
  const c = canvas(), L = square ? (forces.length <= 2 ? 76 : 100) : Math.min(170, Math.max(100, (26 * max) / least)), o = [0, 0];
  const scale = (f) => (square ? L / (top[line(f)] || 1) : L / max);
  if (axes != null) {
    for (const [k, name] of [[0, '+x'], [90, '+y']]) {
      const u = [Math.cos(rad(axes + k)), -Math.sin(rad(axes + k))], r = L + 22;
      c.line(toward(o, u, -r), toward(o, u, r), 'axis');
      c.text(toward(toward(o, u, r + 15), [0, 1], 5), name, 'nt');
    }
  }
  const t = rad(axes ?? 0), u = [Math.cos(t), -Math.sin(t)], n = [-Math.sin(t), -Math.cos(t)];
  if (body === 'box') c.poly(corners(toward(o, n, -17), u, n, 34, 34), 'body');
  else c.circle(o, 4.5, 'knot');
  const spots = [];
  forces.forEach((f, i) => {
    const len = Math.max(20, scale(f) * Math.abs(f.size ?? max)), a = rad(f.angle), ux = Math.cos(a), uy = -Math.sin(a), end = [ux * len, uy * len];
    arrow(c, o, end, { tone: f.tone ?? 0, dash: f.dash, i });
    if (f.label) { const w = wide(f.label), gap = 8 + (Math.abs(ux) * w) / 2 + Math.abs(uy) * 9; spots.push({ x: end[0] + ux * gap, y: end[1] + uy * gap + 5, w, ux, uy, f }); }
  });
  // (a label that would touch one placed before it moves sideways, across its own arrow, away from the other)
  const touch = (p, q) => Math.abs(p.x - q.x) < (p.w + q.w) / 2 - 2 && Math.abs(p.y - q.y) < 17;
  spots.forEach((p, i) => {
    for (let k = 0; k < 14; k++) {
      const q = spots.slice(0, i).find((r) => touch(p, r));
      if (!q) break;
      const nx = -p.uy, ny = p.ux, s = Math.sign(nx * (p.x - q.x) + ny * (p.y - q.y)) || 1;
      p.x += nx * 6 * s; p.y += ny * 6 * s;
    }
    c.text([p.x, p.y], p.f.label, `vl vl${p.f.tone ?? 0}`);
  });
  if (caption) { const [x0, y0, x1] = c.box(); c.text([(x0 + x1) / 2, y0 - 8], caption, 'nt'); }
  return c.svg(label);
}

// ---------- slope ----------
// A slope rising to the right at angle° with a box on it. box: its label; mu: a label on the slope ("μ = 0.2");
// hang: a rope from the box up over a pulley at the top to a hanging box with this label; tied: a rope from the box up
// the slope to a post at the top, labelled (held at rest); pull: an arrow pulling the box up the slope, labelled (a rope
// pulling it along); push: { dir: 'up' | 'down' | 'level', label } a push on the box up or down the slope, or level into
// it; moving: 'up' or 'down', an arrow beside the box.
export function slope({ angle, box = '', mu = null, hang = null, tied = null, pull = null, push = null, moving = null, label = 'a box on a slope' }) {
  const c = canvas(), S = 330, t = rad(angle), cs = Math.cos(t), sn = Math.sin(t);
  const A = [0, 0], B = [S * cs, 0], C = [S * cs, -S * sn], u = [cs, -sn], n = [-sn, -cs];
  const at = (p, du, dn) => toward(toward(p, u, du), n, dn);
  c.line([-24, 0], [B[0] + (hang != null ? 70 : 24), 0], 'ground');
  c.poly([A, B, C], 'solid');
  arc(c, A, 40, 0, angle, null);
  const m = rad(angle / 2);
  c.text([62 * Math.cos(m), -62 * Math.sin(m) + 5], `${num(angle)}°`, 'dl', 'start');
  const bw = 52, bh = 36, foot = at(A, S * 0.5, 0);
  c.poly(corners(foot, u, n, bw, bh), 'body');
  bodyLabel(c, at(foot, 0, bh / 2), bw + 6, box, at(foot, 0, bh + 14), angle > 50 || hang != null || tied != null || pull != null ? 'end' : 'middle');
  if (mu) c.text(at(A, S * 0.76, -26), mu, 'dl');
  if (hang != null) {
    const r = 11, pc = at(C, 28, bh / 2 - r), touch = at(pc, 0, r), side = [pc[0] + r, pc[1]], hb = 34;
    const drop = Math.max(14, Math.min(56, -pc[1] - hb - 10));
    c.line(C, pc, 'bracket');
    c.path(`M${P(at(foot, bw / 2, bh / 2))}L${P(touch)}A${r},${r} 0 0 1 ${P(side)}L${R(side[0])},${R(side[1] + drop)}`, 'rope', touch, side);
    c.circle(pc, r, 'pulley');
    c.circle(pc, 2.4, 'knot');
    const top = side[1] + drop;
    c.poly([[side[0] - hb / 2, top], [side[0] + hb / 2, top], [side[0] + hb / 2, top + hb], [side[0] - hb / 2, top + hb]], 'body');
    if (hang) c.text([side[0] + hb / 2 + 8, top + hb / 2 + 5], hang, 'bl', 'start');
  }
  if (tied) {
    const post = at(C, -5, 0), q = at(post, 0, bh / 2), from = at(foot, bw / 2, bh / 2);
    c.line(post, at(post, 0, bh / 2 + 12), 'bracket');
    c.line(from, q, 'rope');
    const m = [(from[0] + q[0]) / 2, (from[1] + q[1]) / 2], gap = 9 + (sn * wide(tied)) / 2 + cs * 9;
    c.text([m[0] + n[0] * gap, m[1] + n[1] * gap + 5], tied, 'vl');
  }
  if (pull) arrow(c, at(foot, bw / 2 + 2, bh / 2), at(foot, bw / 2 + 84, bh / 2), { label: pull, at: 'left' });
  if (push) {
    const mid = at(foot, 0, bh / 2);
    if (push.dir === 'level') arrow(c, [mid[0] - 30 - 80, mid[1]], [mid[0] - 30, mid[1]], { label: push.label, at: 'left' });
    else if (push.dir === 'down') arrow(c, at(foot, bw / 2 + 74, bh / 2), at(foot, bw / 2 + 4, bh / 2), { label: push.label, at: 'right' });
    else arrow(c, at(foot, -bw / 2 - 74, bh / 2), at(foot, -bw / 2 - 4, bh / 2), { label: push.label, at: 'left' });
  }
  if (moving) {
    // (ahead of the box, unless a rope or a push is there: then above it)
    const s = moving === 'down' ? -1 : 1, taken = s > 0 ? hang != null || tied != null || pull != null || push?.dir === 'down' : push?.dir === 'up' || push?.dir === 'level';
    const dn = taken ? bh + 18 : bh / 2, from = taken ? -24 * s : s * (bw / 2 + 12), to = taken ? 24 * s : s * (bw / 2 + 68);
    arrow(c, at(foot, from, dn), at(foot, to, dn), { tone: 2, label: 'moving', at: s > 0 ? 'left' : 'right' });
  }
  return c.svg(label);
}

// ---------- a box on a level floor ----------
// box: its label; force: { angle (degrees above the level; negative below), label, from: 'behind' for a push into the
// box's back, else a pull out from its middle }; mu: a label on the floor; moving: 'right' or 'left'
export function floor({ box = '', force = null, mu = null, moving = null, label = 'a box on a floor' }) {
  const c = canvas(), bw = 64, bh = 44;
  c.poly([[-150, 0], [190, 0], [190, 10], [-150, 10]], 'solid');
  c.poly([[-bw / 2, -bh], [bw / 2, -bh], [bw / 2, 0], [-bw / 2, 0]], 'body');
  bodyLabel(c, [0, -bh / 2], bw, box, [0, -bh - 10]);
  if (mu) c.text([-bw / 2 - 52, 26], mu, 'nt');
  if (force) {
    const a = rad(force.angle), u = [Math.cos(a), -Math.sin(a)];
    if (force.from === 'behind') {
      // (a steep push lands on the box's top, a slanting one on its back corner, a level one on its back)
      const end = force.angle <= -60 ? [0, -bh] : force.angle < 0 ? [-bw / 2 + 4, -bh + 4] : [-bw / 2 - 2, -bh / 2];
      arrow(c, toward(end, u, -96), end, { label: force.label, at: force.angle < 0 ? 'right' : 'left' });
    } else {
      const t = Math.min(Math.abs(u[0]) > 1e-9 ? bw / 2 / Math.abs(u[0]) : Infinity, Math.abs(u[1]) > 1e-9 ? bh / 2 / Math.abs(u[1]) : Infinity);
      const start = toward([0, -bh / 2], u, t);
      arrow(c, start, toward(start, u, 96), { label: force.label });
    }
  }
  if (moving) { const s = moving === 'left' ? -1 : 1; arrow(c, [-26 * s, -bh - 34], [26 * s, -bh - 34], { tone: 2, label: 'moving', at: s > 0 ? 'left' : 'right' }); }
  return c.svg(label);
}

// ---------- a box on a table, tied over a pulley at the edge to a hanging box ----------
export function table({ box = '', hang = '', mu = null, label = 'a box on a table, tied over a pulley at the edge to a hanging box' }) {
  const c = canvas(), W = 300, th = 12, legs = 112, bw = 64, bh = 42, bx = 130, r = 11, hb = 38;
  c.poly([[0, 0], [W, 0], [W, th], [0, th]], 'solid');
  for (const x of [10, W - 20]) c.poly([[x, th], [x + 10, th], [x + 10, th + legs], [x, th + legs]], 'solid');
  c.line([-30, th + legs], [W + 80, th + legs], 'ground');
  c.poly([[bx - bw / 2, -bh], [bx + bw / 2, -bh], [bx + bw / 2, 0], [bx - bw / 2, 0]], 'body');
  bodyLabel(c, [bx, -bh / 2], bw, box, [bx, -bh - 10]);
  if (mu) c.text([bx - bw / 2 - 48, -8], mu, 'nt');
  const pc = [W + 8, -bh / 2 + r], side = [pc[0] + r, pc[1]], top = pc[1] + 58;
  c.line([W, 0], pc, 'bracket');
  c.path(`M${R(bx + bw / 2)},${R(-bh / 2)}L${R(pc[0])},${R(-bh / 2)}A${r},${r} 0 0 1 ${P(side)}L${R(side[0])},${R(top)}`, 'rope', side);
  c.circle(pc, r, 'pulley');
  c.circle(pc, 2.4, 'knot');
  c.poly([[side[0] - hb / 2, top], [side[0] + hb / 2, top], [side[0] + hb / 2, top + hb], [side[0] - hb / 2, top + hb]], 'body');
  if (hang) c.text([side[0] + hb / 2 + 8, top + hb / 2 + 5], hang, 'bl', 'start');
  return c.svg(label);
}

// ---------- a weight hanging from a knot held by two ropes ----------
// left, right: { angle (with the ceiling, degrees), label } for a rope up to the ceiling, or { wall: true, label } for
// a level rope to a wall on that side; mid: the hanging rope's label; box: the weight's label
export function knot({ left, right, mid = '', box = '', label = 'a weight hanging from a knot held by two ropes' }) {
  const c = canvas(), sides = [[-1, left], [1, right]], angled = sides.filter(([, s]) => !s.wall);
  const D = Math.max(36, Math.min(128, ...angled.map(([, s]) => 210 * Math.tan(rad(s.angle))))), K = [0, 0], Wd = 150;
  const reach = sides.map(([k, s]) => (s.wall ? k * Wd : (k * D) / Math.tan(rad(s.angle))));
  const x0 = Math.min(reach[0], 0) - (left.wall ? 0 : 34), x1 = Math.max(reach[1], 0) + (right.wall ? 0 : 34);
  c.poly([[x0, -D - 10], [x1, -D - 10], [x1, -D], [x0, -D]], 'solid');
  sides.forEach(([k, s], i) => {
    if (s.wall) {
      const x = reach[i];
      c.poly([[x, -D - 10], [x + k * 10, -D - 10], [x + k * 10, 96], [x, 96]], 'solid');
      c.line(K, [x, 0], 'rope');
      if (s.label) c.text([x / 2, -9], s.label, 'vl');
    } else {
      const a = [reach[i], -D];
      c.line(K, a, 'rope');
      if (k < 0) arc(c, a, 26, -s.angle, 0, `${num(s.angle)}°`, 17);
      else arc(c, a, 26, 180, 180 + s.angle, `${num(s.angle)}°`, 17);
      if (s.label) {
        const m = [a[0] / 2, -D / 2], len = Math.hypot(a[0], D), nx = (k * D) / len, ny = Math.abs(a[0]) / len;
        const gap = 6 + (Math.abs(nx) * wide(s.label)) / 2 + ny * 9;
        c.text([m[0] + nx * gap, m[1] + ny * gap + 5], s.label, 'vl');
      }
    }
  });
  const hb = 42, top = 58;
  c.line(K, [0, top], 'rope');
  if (mid) c.text([9, top / 2 + 5], mid, 'vl', 'start');
  c.circle(K, 3.6, 'knot');
  c.poly([[-hb / 2, top], [hb / 2, top], [hb / 2, top + hb], [-hb / 2, top + hb]], 'body');
  bodyLabel(c, [0, top + hb / 2], hb, box, [hb / 2 + 8, top + hb / 2 + 5], 'start');
  return c.svg(label);
}

// ---------- a weight on a rope, pulled aside by a level force ----------
// angle: the rope's angle from the vertical; rope, force, box: labels
export function aside({ angle, rope = '', force = '', box = '', label = 'a hanging weight pulled aside by a level force' }) {
  const c = canvas(), Lr = 150, t = rad(angle), top = [0, 0], end = [Lr * Math.sin(t), Lr * Math.cos(t)], hb = 40;
  c.poly([[-60, -10], [end[0] + 60, -10], [end[0] + 60, 0], [-60, 0]], 'solid');
  c.line(top, [0, Lr + 6], 'guide');
  c.line(top, end, 'rope');
  arc(c, top, 34, -90, -90 + angle, `${num(angle)}°`, 16);
  if (rope) c.text([end[0] / 2 - 12 - wide(rope) / 2, end[1] / 2 + 10], rope, 'vl');
  const mid = [end[0], end[1] + hb / 2];
  c.poly([[end[0] - hb / 2, end[1]], [end[0] + hb / 2, end[1]], [end[0] + hb / 2, end[1] + hb], [end[0] - hb / 2, end[1] + hb]], 'body');
  bodyLabel(c, mid, hb, box, [end[0] - hb / 2 - 8, end[1] + hb / 2 + 5], 'end');
  arrow(c, [end[0] + hb / 2, mid[1]], [end[0] + hb / 2 + 84, mid[1]], { label: force });
  return c.svg(label);
}

// ---------- a beam ----------
// Drawn to scale, length (m) across 420 px. pivot: where it rests on a pivot; pivots: [x…] for supports under it;
// bolt: a point it turns about (a wrench on a nut, a door's hinge seen from above); hinge: pinned to a wall at its left end; loads: [{ x, label, hang }] boxes on it (hang: on a rope below it);
// weight: { x, label } its own weight, a dashed arrow from its middle; forces: [{ x, angle, label, tone, arc }] arrows
// pulling on it at x (angle counterclockwise from the right; arc: { label, from } marks the angle between the force and
// the bar's line, from = 0 when the bar runs left to the pivot, 180 when it runs right to it); cable: { x, angle, label } from x up to the wall above the
// hinge, angle between the beam and the cable; dims: [{ from, to, label }] lengths along it, below it
export function beam({ length, pivot = null, pivots = [], bolt = null, hinge = false, loads = [], weight = null, forces = [], cable = null, dims = [], label = 'a beam' }) {
  const c = canvas(), K = 420 / length, X = (x) => x * K, th = 12, under = [...(pivot != null ? [pivot] : []), ...pivots];
  const lift = cable ? X(cable.x) * Math.tan(rad(cable.angle)) : 0;
  if (hinge) c.poly([[-16, -Math.max(70, lift + 26)], [0, -Math.max(70, lift + 26)], [0, 74], [-16, 74]], 'solid');
  c.poly([[0, 0], [X(length), 0], [X(length), th], [0, th]], 'beam');
  if (hinge) c.circle([0, th / 2], 4, 'knot');
  for (const x of under) c.poly([[X(x), th], [X(x) + 16, th + 28], [X(x) - 16, th + 28]], 'pivot');
  for (const x of under) c.line([X(x) - 34, th + 28], [X(x) + 34, th + 28], 'ground');
  if (bolt != null) { c.circle([X(bolt), th / 2], 9, 'pulley'); c.circle([X(bolt), th / 2], 2.6, 'knot'); }
  let low = th + (under.length ? 28 : 0);
  for (const { x, label: text, hang } of loads) {
    const w = Math.max(34, Math.min(70, wide(text ?? '') - 6)), h = 30;
    if (hang) {
      c.line([X(x), th], [X(x), th + 24], 'rope');
      c.poly([[X(x) - 17, th + 24], [X(x) + 17, th + 24], [X(x) + 17, th + 54], [X(x) - 17, th + 54]], 'body');
      bodyLabel(c, [X(x), th + 39], 34, text, [X(x) + 24, th + 44], 'start');
      low = Math.max(low, th + 54);
    } else {
      c.poly([[X(x) - w / 2, -h], [X(x) + w / 2, -h], [X(x) + w / 2, 0], [X(x) - w / 2, 0]], 'body');
      bodyLabel(c, [X(x), -h / 2], w, text, [X(x), -h - 9]);
    }
  }
  if (weight) { arrow(c, [X(weight.x), th / 2], [X(weight.x), th / 2 + 62], { tone: 1, dash: true, label: weight.label }); low = Math.max(low, th + 86); }
  forces.forEach((f, i) => {
    const a = rad(f.angle), from = [X(f.x), th / 2];
    arrow(c, from, toward(from, [Math.cos(a), -Math.sin(a)], 76), { tone: f.tone ?? 0, label: f.label, i: i + 1 });
    if (Math.sin(a) < 0) low = Math.max(low, th / 2 + 76 * -Math.sin(a) + 12);
    // (the angle between the force and the bar, marked from the bar's line carried on past the point, dashed)
    if (f.arc) {
      const ref = f.arc.from ?? 0, d = ((((f.angle - ref) % 360) + 540) % 360) - 180;
      c.line(from, toward(from, [Math.cos(rad(ref)), -Math.sin(rad(ref))], 50), 'guide');
      arc(c, from, 26, d >= 0 ? ref : ref + d, d >= 0 ? ref + d : ref, f.arc.label, 15);
    }
  });
  if (cable) {
    const a = [X(cable.x), 0], w = [0, -lift];
    c.line(a, w, 'rope');
    arc(c, a, 30, 180 - cable.angle, 180, `${num(cable.angle)}°`, 16);
    if (cable.label) c.text([a[0] / 2 + 10, -lift / 2 - 10], cable.label, 'vl', 'start');
  }
  // (lengths in rows below everything else, each in the first row where it doesn't run into another)
  const rows = [];
  for (const { from, to, label: text } of dims) {
    const lo = Math.min(X(from), X(to)), hi = Math.max(X(from), X(to)), half = wide(text) / 2, mid = (lo + hi) / 2;
    const span = [Math.min(lo, mid - half) - 4, Math.max(hi, mid + half) + 4];
    let r = rows.findIndex((row) => row.every(([p, q]) => span[1] < p || span[0] > q));
    if (r < 0) { rows.push([]); r = rows.length - 1; }
    rows[r].push(span);
    const y = low + 22 + r * 30;
    c.path(`M${R(lo)},${R(y)}L${R(hi)},${R(y)}M${R(lo)},${R(y - 5)}L${R(lo)},${R(y + 5)}M${R(hi)},${R(y - 5)}L${R(hi)},${R(y + 5)}`, 'dim', [lo, y - 5], [hi, y + 5]);
    c.text([mid, y + 17], text, 'dl');
  }
  return c.svg(label);
}

// ---------- two boxes hanging over a pulley ----------
// left, right: their labels; lower: which one hangs lower ('left' or 'right')
export function atwood({ left = '', right = '', lower = 'right', label = 'two masses hanging over a pulley' }) {
  const c = canvas(), r = 24, hb = 40, pc = [0, 0];
  c.poly([[-70, -66], [70, -66], [70, -56], [-70, -56]], 'solid');
  c.line([0, -56], pc, 'bracket');
  const drops = lower === 'left' ? [96, 54] : [54, 96];
  [[-1, left], [1, right]].forEach(([k, text], i) => {
    const x = k * r, top = drops[i];
    c.line([x, 0], [x, top], 'rope');
    c.poly([[x - hb / 2, top], [x + hb / 2, top], [x + hb / 2, top + hb], [x - hb / 2, top + hb]], 'body');
    if (text) c.text([x + k * (hb / 2 + 8), top + hb / 2 + 5], text, 'bl', k < 0 ? 'end' : 'start');
  });
  c.path(`M${-r},0A${r},${r} 0 0 1 ${r},0`, 'rope', [-r, -r], [r, 0]);
  c.circle(pc, r, 'pulley');
  c.circle(pc, 3, 'knot');
  return c.svg(label);
}
