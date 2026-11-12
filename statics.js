// Statics of Particles: 10 topics, 20 variants each (200). Something at rest, or moving at a constant velocity, is in
// equilibrium: the forces on it add to zero, ΣFx = 0 and ΣFy = 0. Knots held by ropes, weights pulled aside, boxes held
// on slopes, and things pulled or sliding at a steady speed. Every topic is asked several ways, and most variants draw
// the scene (lengths and angles to scale) or its free-body diagram.
import { bank, dice, num, round } from '../kit/bank.js';
import { fbd, slope, floor, knot, aside } from './mech.js';

const G = 9.81;
const numAns = (value, unit, tol = 0.02) => ({ kind: 'number', value: round(value, 4), unit, tol });
// a topic's question types take turns (variant k is type k % types), each walking through its own number combinations:
// every combination of the lists (that passes ok) in a fixed shuffled order, rearranged so each turn uses the values the
// turns before it used least (a type's four or five variants don't all land on 60°), and no two turns repeat. (sub
// names a second set of lists inside one type, so each set keeps its own order.)
const orders = new Map();
function turn(ctx, types, lists, ok = () => true, sub = '') {
  const salt = `${ctx.salt}-${ctx.k % types}${sub}`;
  let all = orders.get(salt);
  if (!all) {
    let left = [[]];
    for (const list of lists) left = left.flatMap((c) => list.map((v) => [...c, v]));
    left = dice(salt, 0).shuffle(left.filter((c) => ok(...c)));
    const used = lists.map(() => new Map());
    all = [];
    while (left.length) {
      let best = 0, least = Infinity;
      left.forEach((c, i) => { const u = c.reduce((t, v, q) => t + (used[q].get(v) || 0), 0); if (u < least) { least = u; best = i; } });
      const [c] = left.splice(best, 1);
      c.forEach((v, q) => used[q].set(v, (used[q].get(v) || 0) + 1));
      all.push(c);
    }
    orders.set(salt, all);
  }
  return all[Math.floor(ctx.k / types) % all.length];
}
// "a 5 kg box", "an 8 kg box", "an 18 kg box", "an 80 N weight"
const A = (x) => (/^8|^1[18](?![\d,])/.test(String(x)) ? 'An' : 'A'), a_ = (x) => A(x).toLowerCase();
// the right answer among wrong ones, in an order that's shuffled but the same every time for that variant
const oneOf = (d, right, wrongs) => { const list = d.shuffle([right, ...wrongs]); return { kind: 'choice', choices: list, correct: list.indexOf(right) }; };
// (no answer within 3% of a number the question gives, so copying one out of the question isn't marked right)
const apart = (answer, ...given) => given.every((x) => Math.abs(Math.abs(answer) - Math.abs(x)) > 0.03 * Math.abs(answer));
const rad = (a) => (a * Math.PI) / 180, deg = (r) => (r * 180) / Math.PI;
const sin = (a) => Math.sin(rad(a)), cos = (a) => Math.cos(rad(a)), tan = (a) => Math.tan(rad(a));
// a force as the class writes it (196.2 N, 49.05 N), a sine, cosine or tangent to three places, an angle to 0.1°
// (rounded to four places first, as the answer is, so the two never round apart: 45.78498 shows as the answer's 45.79)
const nf = (x) => num(round(x, 4), Math.abs(x) >= 100 ? 1 : 2), tr = (x) => num(round(x, 4), 3), ang = (x) => num(round(x, 4), 1);

const T = {
  eq: 'Equilibrium: ΣF = 0', parts: 'Weight along and into a slope', same: 'Two ropes at the same angle',
  wall: 'A rope to the ceiling and a level rope', two: 'Two ropes at different angles', aside: 'Pulled aside',
  smooth: 'Held on a smooth slope', rough: 'Held on a rough slope', pull: 'Pulling at a steady speed', slide: 'Sliding at a steady speed',
};

// is it in equilibrium? At rest or at a constant velocity it is; speeding up, slowing down or turning it isn't.
// [what happens, what it is, in equilibrium?, why, the right choice, two wrong ones]
const STATES = [
  ['A lift moves up at a steady 2 m/s.', 'the lift', true, 'Its velocity doesn’t change, so the cable’s pull exactly balances its weight.',
    'Yes: its velocity is constant, so ΣF = 0', ['No: it’s moving up, so the upward force must be bigger than its weight', 'No: only something at rest can be in equilibrium']],
  ['A ball is thrown straight up. Think of it at its highest point, where it stops for an instant.', 'the ball', false, 'Its velocity is zero for an instant but still changing: gravity is the only force on it (ignoring air), so ΣF = mg, downward.',
    'No: gravity still pulls it down, so ΣF = mg', ['Yes: it’s at rest for an instant, so ΣF = 0', 'Yes: the force of the throw balances gravity there']],
  ['A hockey puck slides in a straight line at a steady 8 m/s across smooth, level ice.', 'the puck', true, 'With no friction, the only forces are its weight and the ice’s push up, and they cancel. Nothing is needed to keep it going.',
    'Yes: its weight and the ice’s push cancel, so ΣF = 0', ['No: a force must keep pushing it forward', 'No: it’s moving, so it can’t be in equilibrium']],
];
// to sort: [what happens, 0 in equilibrium (a constant velocity, at rest included) or 1 not (speeding up, slowing down or turning)]
const MOTIONS = [
  ['A book resting on a table', 0], ['A skydiver falling at a constant 50 m/s', 0], ['A puck sliding straight at a steady 8 m/s on smooth ice', 0],
  ['A lift going down at a steady 1.5 m/s', 0], ['A lamp hanging still from two ropes', 0], ['A car on a straight, level road at a steady 20 m/s', 0],
  ['A car speeding up from traffic lights', 1], ['A ball thrown straight up, at its highest point', 1], ['A box sliding across a floor and slowing down', 1],
  ['A car going round a bend at a steady 15 m/s', 1], ['A stone falling freely (no air resistance)', 1], ['A bike braking to a stop', 1],
];
const lower = (s) => s[0].toLowerCase() + s.slice(1);

const templates = [
  // 1. equilibrium: at rest or at a constant velocity the forces add to zero, so a missing force balances all the others
  (d, ctx) => {
    const type = ctx.k % 4, j = Math.floor(ctx.k / 4);          // (j: this type's own turn, 0 to 4)
    if (type === 0 && j % 3 === 0) {
      const [a, b, c, e, f] = turn(ctx, 4, [[220, 250, 280], [190, 230, 260], [160, 200, 240], [240, 270, 310], [210, 250, 290]],
        (A, B, C, E, F) => { const x = A + B + C - E - F; return x >= 140 && x <= 300 && apart(x, A, B, C, E, F); }, 'tug');
      const x = a + b + c - e - f;
      return {
        topic: T.eq, text: `In a tug-of-war the rope doesn’t move, and everyone pulls level, along the rope. On the left team, three people pull with ${a} N, ${b} N and ${c} N. On the right team, two pull with ${e} N and ${f} N. How hard does the third person on the right team pull?`,
        answer: numAns(x, 'N'),
        solution: `Take the rope as the body, with right as +. It doesn’t move, so ΣF<sub>x</sub> = 0: ${e} + ${f} + F − ${a} − ${b} − ${c} = 0. So F = ${a + b + c} − ${e + f} = <b>${x} N</b>.`,
        meta: { type: 'tug-of-war', in: { left: [a, b, c], right: [e, f] } },
      };
    }
    if (type === 0 && j % 3 === 1) {
      const [m, v] = turn(ctx, 4, [[35, 45, 60, 75], [0.4, 0.5, 0.8, 1.2]], undefined, 'crane'), W = m * G, up = j === 1;
      return {
        topic: T.eq, text: `A crane ${up ? 'lifts' : 'lowers'} ${a_(m)} ${m} kg crate on a cable at a constant velocity of ${num(v)} m/s ${up ? 'upward' : 'downward'}. What is the tension in the cable?`,
        figure: fbd({ forces: [{ angle: 90, size: W, label: 'T' }, { angle: 270, size: W, label: 'W = mg' }], label: 'the forces on the crate' }),
        answer: numAns(W, 'N'),
        solution: `Take the crate as the body, with ${up ? 'up' : 'down'} as + (the way it moves). A constant velocity means equilibrium, just as if it hung still, so ΣF<sub>y</sub> = 0: ${up ? 'T − mg = 0' : 'mg − T = 0'}. So T = mg = ${m} × 9.81 = <b>${nf(W)} N</b>.`,
        meta: { type: up ? 'crane-up-steady' : 'crane-down-steady', in: { m, v } },
      };
    }
    if (type === 0) {
      const [p, q] = turn(ctx, 4, [[120, 150, 180], [70, 90, 110]], undefined, 'box'), f = p + q;
      return {
        topic: T.eq, text: `Two people slide a heavy box across a level floor at a constant velocity: one gives it a level push of ${p} N from behind, and the other pulls it forward with ${q} N on a level rope. How big is the friction force on the box?`,
        answer: numAns(f, 'N'),
        solution: `Take the box as the body, with forward as +. A constant velocity means ΣF<sub>x</sub> = 0: ${p} + ${q} − f = 0. So friction, acting backward, is f = <b>${f} N</b>.`,
        meta: { type: 'box-steady', in: { push: p, pull: q } },
      };
    }
    if (type === 1) {
      const sled = j % 2 === 1, ok = (x, y) => x !== y && apart(Math.hypot(x, y), x, y);
      const [F1, F2] = sled ? turn(ctx, 4, [[60, 75, 90, 120], [80, 100, 110, 150]], ok, 'sled') : turn(ctx, 4, [[24, 30, 45, 60], [32, 40, 50, 70]], ok, 'ring');
      const R = Math.hypot(F1, F2), a = deg(Math.atan(F2 / F1));
      return {
        topic: T.eq,
        text: sled ? `Two dogs pull a sled across level snow with level ropes at right angles to each other: one with ${F1} N, the other with ${F2} N. The sled moves at a constant velocity. How big is the friction force from the snow?`
          : `A ring lies on a smooth, level table, pulled by three level ropes, and it stays still. One rope pulls it ${F1} N due east and another ${F2} N due north. How hard does the third rope pull?`,
        figure: fbd({ body: 'dot', forces: [{ angle: 0, size: F1, label: `${F1} N` }, { angle: 90, size: F2, label: `${F2} N` }, { angle: 180 + a, size: R, label: sled ? 'f' : '?', tone: 2 }], label: sled ? 'the level forces on the sled, seen from above' : 'the pulls on the ring, seen from above' }),
        answer: numAns(R, 'N'),
        solution: sled ? `Take the sled as the body. A constant velocity means ΣF = 0, so friction balances the two pulls, which are at right angles. Its size is √(${F1}² + ${F2}²) = <b>${nf(R)} N</b>.`
          : `Take the ring as the body. It stays still, so ΣF = 0 and the third pull balances the other two, which are at right angles. Its size is √(${F1}² + ${F2}²) = <b>${nf(R)} N</b>.`,
        meta: { type: sled ? 'sled-right-angles' : 'ring-right-angles', in: { F1, F2 } },
      };
    }
    if (type === 2) {
      const [F1, F2] = turn(ctx, 4, [[20, 30, 40, 60, 80], [15, 25, 45, 50, 70]], (x, y) => Math.abs(deg(Math.atan(y / x)) - 45) > 6);
      const a = deg(Math.atan(F2 / F1)), right = `${ang(a)}° south of west`;
      return {
        topic: T.eq, text: `A knot lies on a smooth, level table. Two level ropes pull it, ${F1} N due east and ${F2} N due north, and a third level rope holds it still. Which way does the third rope pull?`,
        figure: fbd({ body: 'dot', forces: [{ angle: 0, size: F1, label: `${F1} N` }, { angle: 90, size: F2, label: `${F2} N` }], label: 'the two known pulls on the knot, seen from above' }),
        answer: oneOf(d, right, [`${ang(a)}° north of east`, `${ang(90 - a)}° south of west`, `${ang(a)}° north of west`]),
        solution: `Take the knot as the body. It stays still, so ΣF = 0 and the third pull is the other two’s resultant turned around. That resultant points tan⁻¹(${F2}/${F1}) = ${ang(a)}° north of east (and is √(${F1}² + ${F2}²) = ${nf(Math.hypot(F1, F2))} N). So the third rope pulls the opposite way: <b>${right}</b>.`,
        meta: { type: 'balance-direction', in: { F1, F2 } },
      };
    }
    if (j % 2 === 0) {
      const [what, who, yes, why, right, wrongs] = STATES[j / 2];
      return {
        topic: T.eq, text: `${what} Is ${who} in equilibrium?`,
        answer: oneOf(d, right, wrongs),
        solution: `Equilibrium means ΣF = 0, and that is true whenever the velocity is constant, at rest or moving. ${why} So, <b>${yes ? 'yes, it is in equilibrium' : 'no, it isn’t in equilibrium'}</b>.`,
        meta: { type: 'is-it-equilibrium', in: { state: j / 2, equilibrium: yes } },
      };
    }
    // (three of each kind, picked and ordered by the dice)
    const items = d.shuffle([0, 1].flatMap((s) => d.shuffle(MOTIONS.filter((x) => x[1] === s)).slice(0, 3)));
    const side = (s) => items.filter((x) => x[1] === s).map((x) => lower(x[0])).join('; ');
    return {
      topic: T.eq, text: 'Which of these are in equilibrium? <span class="muted">Put each one on its side.</span>',
      answer: { kind: 'sort', sides: ['In equilibrium', 'Not in equilibrium'], items: items.map((x) => x[0]), correct: items.map((x) => x[1]) },
      tip: 'In equilibrium the velocity doesn’t change at all: not speeding up, not slowing down, not turning. At rest counts too.',
      solution: `Equilibrium means ΣF = 0, so the velocity stays the same (at rest counts). In equilibrium: ${side(0)}. Not in equilibrium, since each speeds up, slows down or changes direction: ${side(1)}.`,
      meta: { type: 'sort-equilibrium', in: { items: items.map((x) => x[0]), inEquilibrium: items.map((x) => x[1] === 0) } },
    };
  },

  // 2. on a slope at θ the weight splits into W sin θ down the slope and W cos θ into it. (The box is just "on" the slope:
  // with μ up to 0.6 nothing could rest unheld on the steeper ones, and the parts of the weight don't depend on it.)
  (d, ctx) => {
    const type = ctx.k % 4, j = Math.floor(ctx.k / 4);
    if (type < 2) {
      const along = type === 0;
      const [m, a] = turn(ctx, 4, [[4, 6, 8, 12, 15, 20, 25], [15, 20, 25, 35, 40, 50, 55]], (M, A) => apart(M * G * (along ? sin(A) : cos(A)), M, A));
      const W = m * G, part = W * (along ? sin(a) : cos(a));
      return {
        topic: T.parts,
        text: along ? `${A(m)} ${m} kg box is on a ramp at ${a}° to the level. How big is the part of its weight that pulls it down the slope (parallel to the slope)?`
          : `${A(m)} ${m} kg crate is on a slope at ${a}° to the level. How big is the part of its weight that presses it into the slope (perpendicular to the slope)?`,
        figure: along ? slope({ angle: a, box: `${m} kg` })
          : fbd({ axes: a, forces: [{ angle: 270, size: W, label: 'W' }, { angle: 270 + a, size: W * cos(a), label: '?', dash: true, tone: 1 }], label: 'the crate’s weight and its part into the slope' }),
        answer: numAns(part, 'N'),
        solution: `W = mg = ${m} × 9.81 = ${nf(W)} N. The angle between W and the line straight into the slope is the slope’s own angle, ${a}°, so the part ${along ? 'down the slope, across from that angle, is W sin' : 'into the slope, next to that angle, is W cos'} ${a}° = ${nf(W)} × ${tr(along ? sin(a) : cos(a))} = <b>${nf(part)} N</b>.`,
        meta: { type: along ? 'weight-along' : 'weight-into', in: { m, angle: a } },
      };
    }
    if (type === 2) {
      const a = [20, 55, 45, 30, 60][j], m = [5, 12, 20, 8, 15][j], W = m * G;
      const INTO = 'The part into the slope (W cos θ)', DOWN = 'The part down the slope (W sin θ)', SAME = 'They’re the same size';
      const right = a < 45 ? INTO : a > 45 ? DOWN : SAME;
      return {
        topic: T.parts, text: `${A(m)} ${m} kg box is on a slope at ${a}° to the level. Which part of its weight is bigger: the part down the slope, or the part into the slope?`,
        figure: slope({ angle: a, box: `${m} kg` }),
        answer: oneOf(d, right, [INTO, DOWN, SAME].filter((c) => c !== right)),
        solution: `W = ${m} × 9.81 = ${nf(W)} N. Down the slope: W sin ${a}° = ${nf(W * sin(a))} N; into it: W cos ${a}° = ${nf(W * cos(a))} N. ${a === 45 ? 'At 45° the sine and the cosine are equal' : a < 45 ? 'Below 45° the cosine is bigger than the sine' : 'Above 45° the sine is bigger than the cosine'}. <b>${right}</b>.`,
        meta: { type: 'which-part-bigger', in: { m, angle: a } },
      };
    }
    if (j === 2) {
      return {
        topic: T.parts, text: 'A box is on a ramp whose angle can be changed. At what angle to the level are the two parts of its weight, down the ramp and into it, the same size?',
        answer: numAns(45, '°'),
        solution: `The parts are W sin θ down the ramp and W cos θ into it. They’re equal when sin θ = cos θ, that is tan θ = 1, so θ = <b>45°</b>.`,
        meta: { type: 'equal-parts-angle', in: {} },
      };
    }
    const along = j % 3 === 0;                                   // (j = 0 and 3: from the part down the slope; 1 and 4: into it)
    const [m, a] = turn(ctx, 4, [[5, 8, 10, 15, 20], [15, 20, 25, 35, 40, 50, 55]], (M, A) => apart(A, M, round(M * G * (along ? sin(A) : cos(A)), 1)), along ? 'along' : 'into');
    const W = m * G, part = round(W * (along ? sin(a) : cos(a)), 1), th = deg(along ? Math.asin(part / W) : Math.acos(part / W));
    return {
      topic: T.parts, text: `${A(m)} ${m} kg box is on a slope. The part of its weight that ${along ? 'pulls it down the slope' : 'presses it into the slope'} is ${num(part, 1)} N. At what angle to the level is the slope?`,
      answer: numAns(th, '°'),
      solution: `W = ${m} × 9.81 = ${nf(W)} N, and the part ${along ? 'down the slope is W sin θ' : 'into the slope is W cos θ'}. So ${along ? 'sin' : 'cos'} θ = ${num(part, 1)} ÷ ${nf(W)} = ${tr(part / W)}, and θ = ${along ? 'sin' : 'cos'}⁻¹ ${tr(part / W)} = <b>${ang(th)}°</b>.`,
      meta: { type: along ? 'angle-from-along' : 'angle-from-into', in: { m, part } },
    };
  },

  // 3. a weight on two ropes at the same angle θ to the level: their level parts cancel and 2T sin θ = W
  (d, ctx) => {
    const type = ctx.k % 4, j = Math.floor(ctx.k / 4), byMass = j % 2 === 1;
    if (type === 0) {
      const [w, a] = byMass ? turn(ctx, 4, [[4, 6, 10, 15, 25], [20, 25, 35, 40, 50, 60]], (M, A) => apart((M * G) / (2 * sin(A)), M, A), 'm')
        : turn(ctx, 4, [[60, 90, 150, 240, 360], [20, 25, 35, 40, 50, 60]], (W, A) => apart(W / (2 * sin(A)), W, A), 'w');
      const W = byMass ? w * G : w, Tn = W / (2 * sin(a));
      return {
        topic: T.same, text: `${A(w)} ${w} ${byMass ? 'kg' : 'N'} sign hangs from a knot held by two ropes, each at ${a}° to the ceiling. What is the tension in each rope?`,
        figure: knot({ left: { angle: a, label: 'T' }, right: { angle: a, label: 'T' }, mid: byMass ? '' : `${w} N`, box: byMass ? `${w} kg` : '' }),
        answer: numAns(Tn, 'N'),
        solution: `Take the knot as the body, with up as +. ${byMass ? `The weight is W = ${w} × 9.81 = ${nf(W)} N. ` : ''}The ropes’ level parts, T cos ${a}°, cancel, and ΣF<sub>y</sub> = 0: 2T sin ${a}° − W = 0. So T = ${nf(W)} ÷ (2 × ${tr(sin(a))}) = <b>${nf(Tn)} N</b>.`,
        meta: { type: 'same-angle-tension', in: byMass ? { m: w, angle: a } : { W: w, angle: a } },
      };
    }
    if (type === 1) {
      const [w, p] = byMass ? turn(ctx, 4, [[3, 5, 8, 12, 20], [15, 20, 25, 35, 40, 50]], (M, P) => apart((M * G) / (2 * cos(P)), M, P), 'm')
        : turn(ctx, 4, [[80, 120, 180, 250, 320], [15, 20, 25, 35, 40, 50]], (W, P) => apart(W / (2 * cos(P)), W, P), 'w');
      const W = byMass ? w * G : w, Tn = W / (2 * cos(p));
      return {
        topic: T.same, text: `${A(w)} ${w} ${byMass ? 'kg' : 'N'} planter hangs from a ring held by two chains, each at ${p}° to the vertical. What is the tension in each chain?`,
        figure: fbd({ body: 'dot', forces: [{ angle: 90 + p, size: Tn, label: 'T' }, { angle: 90 - p, size: Tn, label: 'T' }, { angle: 270, size: W, label: byMass ? 'W = mg' : `${w} N` }], label: 'the forces on the ring' }),
        answer: numAns(Tn, 'N'),
        solution: `Take the ring as the body, with up as +. The angle is from the vertical, so each chain pulls up with T cos ${p}° (and the sideways parts, T sin ${p}°, cancel). ${byMass ? `W = ${w} × 9.81 = ${nf(W)} N, and ` : ''}ΣF<sub>y</sub> = 0: 2T cos ${p}° − W = 0, so T = ${nf(W)} ÷ (2 × ${tr(cos(p))}) = <b>${nf(Tn)} N</b>.`,
        meta: { type: 'same-angle-from-vertical', in: byMass ? { m: w, angleFromVertical: p } : { W: w, angleFromVertical: p } },
      };
    }
    if (type === 2) {
      const [t, a] = turn(ctx, 4, [[150, 200, 250, 300, 400], [20, 25, 35, 40, 50, 60]], (x, A) => apart(2 * x * sin(A), x, A) && apart((2 * x * sin(A)) / G, x, A));
      const W = 2 * t * sin(a), m = W / G;
      return {
        topic: T.same, text: `Two ropes meet at a knot, each at ${a}° to the ceiling, and each can hold at most ${t} N. What is the heaviest ${byMass ? 'mass, in kilograms,' : 'weight'} that can hang from the knot?`,
        figure: knot({ left: { angle: a, label: `${t} N` }, right: { angle: a, label: `${t} N` }, box: '?' }),
        answer: byMass ? numAns(m, 'kg') : numAns(W, 'N'),
        solution: `Take the knot as the body, with up as +. At the limit each rope pulls ${t} N, and ΣF<sub>y</sub> = 0 gives W = 2T sin ${a}° = 2 × ${t} × ${tr(sin(a))} = ${byMass ? `${nf(W)} N. As a mass, m = W ÷ g = ${nf(W)} ÷ 9.81 = <b>${nf(m)} kg</b>.` : `<b>${nf(W)} N</b>.`}`,
        meta: { type: byMass ? 'same-angle-mass' : 'same-angle-weight', in: { Tmax: t, angle: a } },
      };
    }
    const [w, steep, flat] = turn(ctx, 4, [[40, 60, 80, 120, 150], [50, 55, 60], [15, 20, 25]]);
    const first = j % 2 === 0 ? flat : steep, second = j % 2 === 0 ? steep : flat, right = `At ${flat}° (the flatter ropes)`;
    return {
      topic: T.same, text: `The same ${w} N picture can hang from two ropes at ${first}° to the level, or from two ropes at ${second}° to the level. In which case is the tension in each rope bigger?`,
      answer: oneOf(d, right, [`At ${steep}° (the steeper ropes)`, 'Neither: the picture weighs the same either way']),
      solution: `2T sin θ = W gives T = W ÷ (2 sin θ): the flatter the ropes, the smaller sin θ, so the harder they must pull to hold up the same weight. At ${flat}°, T = ${w} ÷ (2 sin ${flat}°) = ${nf(w / (2 * sin(flat)))} N; at ${steep}°, T = ${nf(w / (2 * sin(steep)))} N. <b>${right}</b>.`,
      meta: { type: 'flatter-pulls-harder', in: { W: w, steep, flat } },
    };
  },

  // 4. a knot held by a rope up to the ceiling at θ to it (T₁) and a level rope to a wall (T₂), with a weight hanging
  // from it (T₃ = mg): up, T₁ sin θ = T₃; across, T₂ = T₁ cos θ
  (d, ctx) => {
    const type = ctx.k % 4, j = Math.floor(ctx.k / 4), wallLeft = j % 2 === 1;
    const draw = (a, box = '') => knot(wallLeft ? { left: { wall: true, label: 'T₂' }, right: { angle: a, label: 'T₁' }, mid: 'T₃', box } : { left: { angle: a, label: 'T₁' }, right: { wall: true, label: 'T₂' }, mid: 'T₃', box });
    const setup = (load, a) => `${load} hangs on a rope (tension T₃) from a knot. The knot is held by a rope up to the ceiling at ${a}° to it (tension T₁) and by a level rope to a wall (tension T₂).`;
    if (type < 2) {
      const byMass = j % 2 === 0, first = type === 0;
      const ok = (x, A) => { const W = byMass ? x * G : x; return apart(first ? W / sin(A) : W / tan(A), x, A); };
      const [w, a] = byMass ? turn(ctx, 4, [[5, 8, 12, 20, 30, 40], [30, 35, 40, 50, 55, 60]], ok, 'm') : turn(ctx, 4, [[80, 150, 200, 250, 300], [30, 35, 40, 50, 55, 60]], ok, 'w');
      const W = byMass ? w * G : w, T1 = W / sin(a), T2 = T1 * cos(a);
      const start = `Take the knot as the body. ${byMass ? `T₃ = mg = ${w} × 9.81 = ${nf(W)} N` : `T₃ = W = ${w} N`}, and with up as +, ΣF<sub>y</sub> = 0: T₁ sin ${a}° − T₃ = 0`;
      return {
        topic: T.wall, text: `${setup(byMass ? `${A(w)} ${w} kg mass` : `${A(w)} ${w} N weight`, a)} What is the tension ${first ? 'T₁' : 'T₂'}?`,
        figure: draw(a, byMass ? `${w} kg` : `${w} N`),
        answer: numAns(first ? T1 : T2, 'N'),
        solution: first ? `${start}, so T₁ = ${nf(W)} ÷ ${tr(sin(a))} = <b>${nf(T1)} N</b>.`
          : `${start}, so T₁ = ${nf(W)} ÷ ${tr(sin(a))} = ${nf(T1)} N. Across, ΣF<sub>x</sub> = 0: T₂ − T₁ cos ${a}° = 0, so T₂ = ${nf(T1)} × ${tr(cos(a))} = <b>${nf(T2)} N</b>.`,
        meta: { type: first ? 'wall-T1' : 'wall-T2', in: byMass ? { m: w, angle: a } : { W: w, angle: a } },
      };
    }
    if (type === 2 && j % 2 === 0) {
      const [m, a] = turn(ctx, 4, [[6, 9, 14, 18, 25, 35], [30, 40, 50, 60]], (M, A) => apart(M * G, M, A), 't3'), W = m * G;
      return {
        topic: T.wall, text: `${setup(`${A(m)} ${m} kg mass`, a)} What is the tension T₃?`,
        figure: draw(a, `${m} kg`),
        answer: numAns(W, 'N'),
        solution: `Take the mass as the body, with up as +. It hangs still, so whatever the angles of the other ropes, ΣF<sub>y</sub> = 0: T₃ − mg = 0. So T₃ = ${m} × 9.81 = <b>${nf(W)} N</b>.`,
        meta: { type: 'wall-T3', in: { m, angle: a } },
      };
    }
    if (type === 2) {
      const [t1, a] = turn(ctx, 4, [[120, 180, 240, 300], [30, 35, 40, 50, 55, 60]], (t, A) => apart(t * cos(A), t, A), 't2');
      return {
        topic: T.wall, text: `${setup('A weight', a)} The tension T₁ is ${t1} N. What is the tension T₂?`,
        figure: draw(a),
        answer: numAns(t1 * cos(a), 'N'),
        solution: `Take the knot as the body. Across, T₂ pulls one way and T₁’s level part, T₁ cos ${a}°, pulls the other, so ΣF<sub>x</sub> = 0: T₂ − T₁ cos ${a}° = 0, and T₂ = ${t1} × ${tr(cos(a))} = <b>${nf(t1 * cos(a))} N</b>.`,
        meta: { type: 'wall-T2-from-T1', in: { T1: t1, angle: a } },
      };
    }
    // (j even: the mass from the level rope's tension; j odd: the heaviest mass the rope to the ceiling can hold)
    const fromT2 = j % 2 === 0;
    const [t, a] = turn(ctx, 4, [[90, 120, 160, 200, 250], [30, 35, 40, 50, 55, 60]], (x, A) => { const M = (fromT2 ? x * tan(A) : x * sin(A)) / G; return apart(M, x, A) && M >= 3 && M <= 80; }, fromT2 ? 'a' : 'b');
    const W = fromT2 ? t * tan(a) : t * sin(a), m = W / G;
    return {
      topic: T.wall,
      text: fromT2 ? `${setup('A mass', a)} The tension in the level rope, T₂, is ${t} N. What is the mass?`
        : `${setup('A mass', a)} The rope to the ceiling can hold at most ${t} N. What is the largest mass that can hang from the knot?`,
      figure: draw(a, '?'),
      answer: numAns(m, 'kg'),
      solution: fromT2 ? `Take the knot as the body. Across, ΣF<sub>x</sub> = 0: T₁ cos ${a}° = T₂, so T₁ = ${t} ÷ ${tr(cos(a))} = ${nf(t / cos(a))} N. Up, ΣF<sub>y</sub> = 0: T₃ = T₁ sin ${a}° = ${nf(W)} N. That is mg, so m = ${nf(W)} ÷ 9.81 = <b>${nf(m)} kg</b>.`
        : `Take the knot as the body, with up as +. At the limit T₁ = ${t} N, and ΣF<sub>y</sub> = 0 gives T₃ = T₁ sin ${a}° = ${t} × ${tr(sin(a))} = ${nf(W)} N. That is mg, so m = ${nf(W)} ÷ 9.81 = <b>${nf(m)} kg</b>.`,
      meta: { type: fromT2 ? 'wall-mass-from-T2' : 'wall-mass-from-T1max', in: fromT2 ? { T2: t, angle: a } : { T1max: t, angle: a } },
    };
  },

  // 5. two ropes at different angles θ₁ and θ₂ to the level: across, T₁ cos θ₁ = T₂ cos θ₂; up, T₁ sin θ₁ + T₂ sin θ₂ = W;
  // together, T₁ = W cos θ₂ / sin(θ₁ + θ₂) and T₂ = W cos θ₁ / sin(θ₁ + θ₂)
  (d, ctx) => {
    const type = ctx.k % 4, j = Math.floor(ctx.k / 4), ANGLES = [25, 30, 35, 40, 50, 55, 60];
    const pulls = (W, A, B) => [(W * cos(B)) / sin(A + B), (W * cos(A)) / sin(A + B)];
    if (type < 3) {
      const byMass = type === 2, first = type === 0 || (byMass && j % 2 === 0);
      const [w, a1, a2] = turn(ctx, 4, [byMass ? [6, 10, 15, 20, 25, 30] : [100, 150, 200, 250, 300, 400], ANGLES, ANGLES], (x, A, B) => Math.abs(A - B) >= 10 && pulls(byMass ? x * G : x, A, B).every((p) => apart(p, x, A, B)));
      const W = byMass ? w * G : w, [T1, T2] = pulls(W, a1, a2);
      const swap = first ? `T₂ = T₁ cos ${a1}° ÷ cos ${a2}°` : `T₁ = T₂ cos ${a2}° ÷ cos ${a1}°`;
      return {
        topic: T.two, text: `${A(w)} ${w} ${byMass ? 'kg' : 'N'} lamp hangs from a knot held by two ropes to the ceiling: the left rope at ${a1}° to the ceiling (tension T₁) and the right rope at ${a2}° (tension T₂). What is the tension ${first ? 'T₁' : 'T₂'}?`,
        figure: knot({ left: { angle: a1, label: 'T₁' }, right: { angle: a2, label: 'T₂' }, mid: byMass ? '' : `${w} N`, box: byMass ? `${w} kg` : '' }),
        answer: numAns(first ? T1 : T2, 'N'),
        solution: `Take the knot as the body${byMass ? `, with W = ${w} × 9.81 = ${nf(W)} N` : ''}. Across, ΣF<sub>x</sub> = 0: T₁ cos ${a1}° = T₂ cos ${a2}°; up, ΣF<sub>y</sub> = 0: T₁ sin ${a1}° + T₂ sin ${a2}° = W. Putting ${swap} into the second gives ${first ? `T₁ = W cos ${a2}° ÷ sin(${a1}° + ${a2}°) = ${nf(W)} × ${tr(cos(a2))} ÷ ${tr(sin(a1 + a2))}` : `T₂ = W cos ${a1}° ÷ sin(${a1}° + ${a2}°) = ${nf(W)} × ${tr(cos(a1))} ÷ ${tr(sin(a1 + a2))}`} = <b>${nf(first ? T1 : T2)} N</b>.`,
        meta: { type: first ? 'two-ropes-T1' : 'two-ropes-T2', in: byMass ? { m: w, angle1: a1, angle2: a2 } : { W: w, angle1: a1, angle2: a2 } },
      };
    }
    const [m, a1, a2] = turn(ctx, 4, [[4, 8, 12, 18, 25], ANGLES, ANGLES], (x, A, B) => Math.abs(A - B) >= 10);
    const [T1, T2] = pulls(m * G, a1, a2), L = `The left rope (at ${a1}°)`, Rt = `The right rope (at ${a2}°)`, right = a1 > a2 ? L : Rt;
    return {
      topic: T.two, text: `${A(m)} ${m} kg lamp hangs from a knot held by two ropes to the ceiling: the left one (T₁) at ${a1}° to the ceiling and the right one (T₂) at ${a2}°. Which rope pulls harder?`,
      figure: knot({ left: { angle: a1, label: 'T₁' }, right: { angle: a2, label: 'T₂' }, box: `${m} kg` }),
      answer: oneOf(d, right, [a1 > a2 ? Rt : L, 'They pull equally hard', 'It depends on how heavy the lamp is']),
      solution: `Across, the level parts must cancel: T₁ cos ${a1}° = T₂ cos ${a2}°. The steeper rope has the smaller cosine, so it needs the bigger tension, whatever the lamp weighs: here T₁ = ${nf(T1)} N and T₂ = ${nf(T2)} N. The steeper one pulls harder: <b>${lower(right)}</b>.`,
      meta: { type: 'which-rope-harder', in: { m, angle1: a1, angle2: a2 } },
    };
  },

  // 6. a weight on a rope, pulled aside by a level force F until the rope is at φ to the vertical:
  // up, T cos φ = W; across, T sin φ = F; so F = W tan φ and T = W / cos φ = √(W² + F²)
  (d, ctx) => {
    const type = ctx.k % 4;
    if (type < 2) {
      const findF = type === 0, thing = findF ? 'bucket' : 'lantern';
      const [m, p] = turn(ctx, 4, [[2, 3, 5, 8, 10, 12], [15, 20, 25, 30, 35, 40, 50]], (M, P) => apart(M * G * (findF ? tan(P) : 1 / cos(P)), M, P));
      const W = m * G, F = W * tan(p), Tn = W / cos(p);
      return {
        topic: T.aside, text: `${A(m)} ${m} kg ${thing} hangs on a rope. A level force F pulls it aside until the rope makes ${p}° with the vertical, and it hangs still there. ${findF ? 'How big is F?' : 'What is the tension in the rope?'}`,
        figure: aside({ angle: p, rope: 'T', force: 'F', box: `${m} kg` }),
        answer: numAns(findF ? F : Tn, 'N'),
        solution: findF ? `Take the ${thing} as the body: W = ${m} × 9.81 = ${nf(W)} N. Up, ΣF<sub>y</sub> = 0: T cos ${p}° = W; across, ΣF<sub>x</sub> = 0: F = T sin ${p}°. Dividing the two, F = W tan ${p}° = ${nf(W)} × ${tr(tan(p))} = <b>${nf(F)} N</b>.`
          : `Take the ${thing} as the body: W = ${m} × 9.81 = ${nf(W)} N. The angle is from the vertical, so the rope’s upward part is T cos ${p}°, and ΣF<sub>y</sub> = 0: T cos ${p}° − W = 0. So T = ${nf(W)} ÷ ${tr(cos(p))} = <b>${nf(Tn)} N</b>.`,
        meta: { type: findF ? 'aside-force' : 'aside-tension', in: { m, angleFromVertical: p } },
      };
    }
    if (type === 2) {
      const [W, F] = turn(ctx, 4, [[20, 30, 40, 60, 80], [10, 15, 25, 35, 45]], (w, f) => { const p = deg(Math.atan(f / w)); return p >= 10 && p <= 60 && apart(p, w, f); });
      const p = deg(Math.atan(F / W)), Tn = Math.hypot(W, F);
      return {
        topic: T.aside, text: `${A(W)} ${W} N ball hangs on a string. A level pull of ${F} N holds it aside, at rest. What angle does the string make with the vertical?`,
        figure: fbd({ body: 'dot', forces: [{ angle: 90 + p, size: Tn, label: 'T' }, { angle: 0, size: F, label: `${F} N` }, { angle: 270, size: W, label: `${W} N` }], label: 'the forces on the ball' }),
        answer: numAns(p, '°'),
        solution: `Take the ball as the body, with φ the string’s angle from the vertical. Up, ΣF<sub>y</sub> = 0: T cos φ = ${W}; across, ΣF<sub>x</sub> = 0: T sin φ = ${F}. Dividing, tan φ = ${F} ÷ ${W} = ${tr(F / W)}, so φ = <b>${ang(p)}°</b>.`,
        meta: { type: 'aside-angle', in: { W, F } },
      };
    }
    const [m, F] = turn(ctx, 4, [[2, 4, 6, 8, 10], [10, 15, 20, 30, 40]], (M, f) => { const p = deg(Math.atan(f / (M * G))); return p >= 10 && p <= 60 && apart(Math.hypot(M * G, f), M, f); });
    const W = m * G, Tn = Math.hypot(W, F), p = deg(Math.atan(F / W));
    return {
      topic: T.aside, text: `${A(m)} ${m} kg sandbag hangs on a rope and is held aside, at rest, by a level pull of ${F} N. What is the tension in the rope?`,
      figure: fbd({ forces: [{ angle: 90 + p, size: Tn, label: 'T = ?' }, { angle: 0, size: F, label: `${F} N` }, { angle: 270, size: W, label: 'W = mg' }], label: 'the forces on the sandbag' }),
      answer: numAns(Tn, 'N'),
      solution: `Take the sandbag as the body, with φ the rope’s angle from the vertical: W = ${m} × 9.81 = ${nf(W)} N. The rope balances the other two forces, which are at right angles: up, T cos φ = W, and across, T sin φ = ${F}. Squaring and adding, T = √(W² + F²) = √(${nf(W)}² + ${F}²) = <b>${nf(Tn)} N</b>.`,
      meta: { type: 'aside-tension-from-pull', in: { m, F } },
    };
  },

  // 7. held still on a smooth slope: by a rope along it, T = mg sin θ and N = mg cos θ; by a level push, F = mg tan θ
  // and N = mg / cos θ (the push presses the box into the slope too)
  (d, ctx) => {
    const type = ctx.k % 4, rope = type < 2, findN = type % 2 === 1;
    const value = (M, A) => M * G * (rope ? (findN ? cos(A) : sin(A)) : findN ? 1 / cos(A) : tan(A));
    const [m, a] = turn(ctx, 4, [[3, 5, 8, 12, 15, 20, 30], [15, 20, 25, 30, 35, 40, 50]], (M, A) => apart(value(M, A), M, A));
    const W = m * G, x = value(m, a), F = W * tan(a);
    const held = rope ? 'by a rope parallel to the slope' : 'by a level (horizontal) push F';
    const text = `${A(m)} ${m} kg box is held still on a smooth slope (no friction) at ${a}° to the level, ${held}. ${findN ? 'How big is the normal force from the slope?' : rope ? 'What is the tension in the rope?' : 'How big is F?'}`;
    const solution = [
      `Take the box, with x up the slope. W = ${m} × 9.81 = ${nf(W)} N, and its part down the slope is W sin ${a}°. ΣF<sub>x</sub> = 0: T − W sin ${a}° = 0, so T = ${nf(W)} × ${tr(sin(a))} = <b>${nf(x)} N</b>.`,
      `Take the box, with y out of the slope. W = ${m} × 9.81 = ${nf(W)} N; the rope runs along the slope, so it has no part across it. ΣF<sub>y</sub> = 0: N − W cos ${a}° = 0, so N = ${nf(W)} × ${tr(cos(a))} = <b>${nf(x)} N</b>.`,
      `Take the box, with x up the slope. W = ${m} × 9.81 = ${nf(W)} N; the level push has a part F cos ${a}° up the slope (and F sin ${a}° into it). ΣF<sub>x</sub> = 0: F cos ${a}° − W sin ${a}° = 0, so F = W tan ${a}° = ${nf(W)} × ${tr(tan(a))} = <b>${nf(x)} N</b>.`,
      `Take the box, with x up the slope and y out of it. W = ${m} × 9.81 = ${nf(W)} N. Along the slope, F cos ${a}° = W sin ${a}°, so F = W tan ${a}° = ${nf(F)} N. Across, ΣF<sub>y</sub> = 0: N − W cos ${a}° − F sin ${a}° = 0, so N = ${nf(W * cos(a))} + ${nf(F * sin(a))} = <b>${nf(x)} N</b>.`,
    ][type];
    // (the normal force with a rope as a free-body diagram; with a level push N is the longest arrow, and its label would
    // sit on the +y axis's, so that one shows the scene. The rope is tied to a post at the top of the slope)
    const figure = findN && rope ? fbd({ axes: a, forces: [{ angle: 90 + a, size: x, label: 'N = ?' }, { angle: a, size: W * sin(a), label: 'T' }, { angle: 270, size: W, label: 'W = mg' }], label: 'the forces on the box' })
      : rope ? slope({ angle: a, box: `${m} kg`, tied: 'T' }) : slope({ angle: a, box: `${m} kg`, push: { dir: 'level', label: 'F' } });
    return { topic: T.smooth, text, figure, answer: numAns(x, 'N'), solution, meta: { type: ['smooth-rope-T', 'smooth-rope-N', 'smooth-push-F', 'smooth-push-N'][type], in: { m, angle: a } } };
  },

  // 8. held on a rough slope: just about to slide down, friction μN acts up the slope, T = mg(sin θ − μ cos θ); pulled
  // up at a steady speed, it acts down, T = mg(sin θ + μ cos θ). At rest otherwise, friction is whatever balances
  (d, ctx) => {
    const type = ctx.k % 5, j = Math.floor(ctx.k / 5);
    if (type < 2) {
      // (not the class's own example, a 30° slope with μ = 0.2)
      const down = type === 0, s = down ? -1 : 1, mine = (A, U) => !(A === 30 && U === 0.2);
      const [m, a, mu] = down ? turn(ctx, 5, [[5, 8, 12, 20, 30, 40], [25, 30, 35, 40, 45, 50], [0.1, 0.15, 0.2, 0.25, 0.3, 0.4]], (M, A, U) => mine(A, U) && sin(A) - U * cos(A) >= 0.1 && apart(M * G * (sin(A) - U * cos(A)), M, A, U))
        : turn(ctx, 5, [[5, 8, 12, 20, 30], [15, 20, 25, 30, 35, 40], [0.15, 0.2, 0.25, 0.3, 0.4, 0.5]], (M, A, U) => mine(A, U) && apart(M * G * (sin(A) + U * cos(A)), M, A, U));
      const W = m * G, Nn = W * cos(a), f = mu * Nn, Tn = W * sin(a) + s * f;
      return {
        topic: T.rough,
        text: down ? `${A(m)} ${m} kg box sits on a rough slope at ${a}° to the level (μ = ${mu}). A rope parallel to the slope holds it back, and the box is just about to slide down. What is the tension in the rope?`
          : `${A(m)} ${m} kg box is pulled up a rough slope at ${a}° to the level (μ = ${mu}) at a steady speed, by a rope parallel to the slope. What is the tension in the rope?`,
        // (held back: a rope tied to a post at the top; pulled up: a rope pulling it along from its front)
        figure: down ? slope({ angle: a, box: `${m} kg`, mu: `μ = ${mu}`, tied: 'T' }) : slope({ angle: a, box: `${m} kg`, mu: `μ = ${mu}`, pull: 'T', moving: 'up' }),
        answer: numAns(Tn, 'N'),
        solution: down ? `Take the box, with x up the slope and y out of it. W = ${m} × 9.81 = ${nf(W)} N, and ΣF<sub>y</sub> = 0 gives N = W cos ${a}° = ${nf(Nn)} N. Just about to slide down, friction is at its full value, up the slope: f = μN = ${mu} × ${nf(Nn)} = ${nf(f)} N. ΣF<sub>x</sub> = 0: T + f − W sin ${a}° = 0, so T = ${nf(W * sin(a))} − ${nf(f)} = <b>${nf(Tn)} N</b>.`
          : `Take the box, with x up the slope (the way it moves). W = ${m} × 9.81 = ${nf(W)} N, and ΣF<sub>y</sub> = 0 gives N = W cos ${a}° = ${nf(Nn)} N. It slides up, so friction f = μN = ${mu} × ${nf(Nn)} = ${nf(f)} N acts down the slope. At a steady speed ΣF<sub>x</sub> = 0: T − W sin ${a}° − f = 0, so T = ${nf(W * sin(a))} + ${nf(f)} = <b>${nf(Tn)} N</b>.`,
        meta: { type: down ? 'rough-about-to-slide' : 'rough-pulled-up-steady', in: { m, angle: a, mu } },
      };
    }
    if (type < 4) {
      // a rope pulling up the slope that is weaker (friction helps it, up the slope) or stronger (friction holds the box
      // back, down the slope) than the weight's part down the slope; friction isn't at its full value, so no μ is given
      const findSize = type === 2, up = j % 2 === 0;
      const [m, a, r] = turn(ctx, 5, [[6, 10, 15, 22, 30], [20, 25, 30, 35, 40], up ? [0.4, 0.55, 0.65] : [1.3, 1.45]], (M, A, R) => {
        const Ws = M * G * sin(A), t = Math.round(Ws * R), f = Math.abs(Ws - t);
        return f / (M * G * cos(A)) <= 0.5 && f >= 4 && apart(f, M, A, t);
      }, up ? 'up' : 'down');
      const W = m * G, Ws = W * sin(a), Tn = Math.round(Ws * r), f = Math.abs(Ws - Tn);
      const RIGHT = up ? 'Up the slope' : 'Down the slope';
      return {
        topic: T.rough, text: `${A(m)} ${m} kg box rests on a rough slope at ${a}° to the level. A rope parallel to the slope pulls it up the slope with ${Tn} N, and the box stays at rest. ${findSize ? 'How big is the friction force on the box?' : 'Which way does friction act on the box?'}`,
        figure: slope({ angle: a, box: `${m} kg`, tied: `${Tn} N` }),
        answer: findSize ? numAns(f, 'N') : oneOf(d, RIGHT, [up ? 'Down the slope' : 'Up the slope', 'There’s no friction: the box isn’t moving']),
        solution: findSize ? `Take the box, with x up the slope. At rest, friction is whatever keeps the box still (not μN). The weight’s part down the slope is W sin ${a}° = ${m} × 9.81 × ${tr(sin(a))} = ${nf(Ws)} N, ${up ? 'more' : 'less'} than the rope’s ${Tn} N, so friction acts ${up ? 'up' : 'down'} the slope. ΣF<sub>x</sub> = 0: ${up ? `${Tn} + f − ${nf(Ws)} = 0` : `${Tn} − f − ${nf(Ws)} = 0`}, so f = <b>${nf(f)} N</b>.`
          : `The weight’s part down the slope is W sin ${a}° = ${m} × 9.81 × ${tr(sin(a))} = ${nf(Ws)} N, ${up ? 'more' : 'less'} than the rope’s ${Tn} N. ${up ? 'The rope alone can’t hold the box, so friction helps it' : 'The rope pulls harder than that, so friction holds the box back'}, with ${nf(f)} N: <b>${up ? 'up' : 'down'} the slope</b>.`,
        meta: { type: findSize ? 'rough-friction-at-rest' : 'rough-friction-direction', in: { m, angle: a, T: Tn } },
      };
    }
    const stays = j % 2 === 0;
    const [m, a, mu] = turn(ctx, 5, [[4, 8, 15, 25], [15, 20, 25, 30, 35, 40], [0.2, 0.3, 0.4, 0.5, 0.6]], (M, A, U) => !(A === 30 && U === 0.2) && (stays ? tan(A) <= U - 0.08 : tan(A) >= U + 0.08), stays ? 's' : 'm');
    const W = m * G, YES = `Yes: tan ${a}° = ${tr(tan(a))} is less than μ, so friction can hold it`, NO = `No: tan ${a}° = ${tr(tan(a))} is more than μ, so it slides down`;
    return {
      topic: T.rough, text: `${A(m)} ${m} kg box is set down at rest on a slope at ${a}° to the level, with nothing holding it. The coefficient of friction between the box and the slope is ${mu}. Does it stay at rest?`,
      figure: slope({ angle: a, box: `${m} kg`, mu: `μ = ${mu}` }),
      answer: oneOf(d, stays ? YES : NO, [stays ? NO : YES, 'It depends on how heavy the box is']),
      solution: `The weight’s part down the slope is mg sin θ = ${nf(W * sin(a))} N, and the most friction can give is μN = μmg cos θ = ${nf(mu * W * cos(a))} N. It stays put if mg sin θ ≤ μmg cos θ, that is tan θ ≤ μ (the mass cancels). Here tan ${a}° = ${tr(tan(a))} ${stays ? 'is less than' : 'is more than'} ${mu}: <b>${stays ? 'yes, it stays at rest' : 'no, it slides down'}</b>.`,
      meta: { type: 'rough-stays-put', in: { m, angle: a, mu } },
    };
  },

  // 9. pulled at a steady speed across a level floor, it is in equilibrium: a level pull F = μmg; at θ above the level,
  // F cos θ = μN with N = mg − F sin θ, so F = μmg / (cos θ + μ sin θ)
  (d, ctx) => {
    const type = ctx.k % 4, j = Math.floor(ctx.k / 4);
    if (type === 0) {
      const [m, mu] = turn(ctx, 4, [[8, 10, 15, 20, 25, 30, 40], [0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5]], (M, U) => apart(U * M * G, M, U));
      const W = m * G, F = mu * W;
      return {
        topic: T.pull, text: `${A(m)} ${m} kg crate is pulled across a level floor at a steady speed by a level rope. The coefficient of friction between the crate and the floor is ${mu}. How hard does the rope pull?`,
        figure: floor({ box: `${m} kg`, force: { angle: 0, label: 'F' }, mu: `μ = ${mu}`, moving: 'right' }),
        answer: numAns(F, 'N'),
        solution: `Take the crate, with x the way it moves. ΣF<sub>y</sub> = 0: N = mg = ${m} × 9.81 = ${nf(W)} N, and it slides, so f = μN = ${mu} × ${nf(W)} = ${nf(F)} N. At a steady speed ΣF<sub>x</sub> = 0: F − f = 0, so F = <b>${nf(F)} N</b>.`,
        meta: { type: 'steady-level-pull', in: { m, mu } },
      };
    }
    if (type === 1) {
      const [m, mu, a] = turn(ctx, 4, [[10, 15, 20, 25, 30, 40], [0.2, 0.25, 0.3, 0.4, 0.5], [15, 20, 25, 30, 35, 40]], (M, U, A) => apart((U * M * G) / (cos(A) + U * sin(A)), M, U, A));
      const W = m * G, F = (mu * W) / (cos(a) + mu * sin(a));
      return {
        topic: T.pull, text: `${A(m)} ${m} kg sled is pulled across level snow at a steady speed by a rope at ${a}° above the level. The coefficient of friction is ${mu}. How hard does the rope pull?`,
        figure: floor({ box: `${m} kg`, force: { angle: a, label: 'F' }, mu: `μ = ${mu}`, moving: 'right' }),
        answer: numAns(F, 'N'),
        solution: `Take the sled, with x the way it moves. The rope pulls F cos ${a}° forward and F sin ${a}° up, so ΣF<sub>y</sub> = 0 gives N = mg − F sin ${a}°, and friction is μN. ΣF<sub>x</sub> = 0: F cos ${a}° = μ(mg − F sin ${a}°), so F = μmg ÷ (cos ${a}° + μ sin ${a}°). With mg = ${m} × 9.81 = ${nf(W)} N, F = ${mu} × ${nf(W)} ÷ (${tr(cos(a))} + ${mu} × ${tr(sin(a))}) = <b>${nf(F)} N</b>.`,
        meta: { type: 'steady-angled-pull', in: { m, mu, angle: a } },
      };
    }
    // (the pull as it would be measured, in whole newtons, for a friction coefficient chosen behind the scenes)
    const level = type === 2 && j % 2 === 0;
    const [m, mu0, a] = turn(ctx, 4, [[10, 12, 15, 20, 25, 30, 40], [0.2, 0.25, 0.3, 0.35, 0.45], level ? [0] : [20, 25, 30, 35, 40]], (M, U, A) => {
      const F = Math.round((U * M * G) / (cos(A) + U * sin(A))), Nn = M * G - F * sin(A);
      return type === 2 || apart(Nn, M, F, A);
    }, type === 2 ? (level ? 'level' : 'angled') : '');
    const W = m * G, F = Math.round((mu0 * W) / (cos(a) + mu0 * sin(a))), Nn = W - F * sin(a), mu = (F * cos(a)) / Nn;
    if (type === 2) {
      return {
        topic: T.pull,
        text: level ? `${A(m)} ${m} kg box is pulled across a level floor at a steady speed by a level rope, and the pull is measured at ${F} N. What is the coefficient of friction between the box and the floor?`
          : `${A(m)} ${m} kg box is pulled across a level floor at a steady speed by a rope at ${a}° above the level, with a force of ${F} N. What is the coefficient of friction between the box and the floor?`,
        figure: floor({ box: `${m} kg`, force: { angle: a, label: `${F} N` }, moving: 'right' }),
        answer: numAns(mu, ''),
        solution: level ? `Take the box, with x the way it moves. ΣF<sub>y</sub> = 0: N = mg = ${m} × 9.81 = ${nf(W)} N. At a steady speed ΣF<sub>x</sub> = 0, so friction equals the pull: μN = ${F} N. So μ = ${F} ÷ ${nf(W)} = <b>${num(mu, 3)}</b>.`
          : `Take the box, with x the way it moves. ΣF<sub>y</sub> = 0: N = mg − F sin ${a}° = ${nf(W)} − ${F} × ${tr(sin(a))} = ${nf(Nn)} N. At a steady speed ΣF<sub>x</sub> = 0, so friction equals the forward pull: f = F cos ${a}° = ${nf(F * cos(a))} N. So μ = f ÷ N = ${nf(F * cos(a))} ÷ ${nf(Nn)} = <b>${num(mu, 3)}</b>.`,
        meta: { type: level ? 'mu-from-level-pull' : 'mu-from-angled-pull', in: level ? { m, F } : { m, F, angle: a } },
      };
    }
    return {
      topic: T.pull, text: `${A(m)} ${m} kg sled is pulled across level snow at a steady speed by a rope at ${a}° above the level, with a force of ${F} N. How big is the normal force on the sled?`,
      figure: fbd({ forces: [{ angle: 90, size: Nn, label: 'N = ?' }, { angle: a, size: F, label: `${F} N` }, { angle: 180, size: F * cos(a), label: 'f' }, { angle: 270, size: W, label: 'W = mg' }], label: 'the forces on the sled' }),
      answer: numAns(Nn, 'N'),
      solution: `Take the sled, with up as + for y. The rope’s upward part, F sin ${a}° = ${F} × ${tr(sin(a))} = ${nf(F * sin(a))} N, takes some of the weight off the snow. ΣF<sub>y</sub> = 0: N + F sin ${a}° − mg = 0, with mg = ${m} × 9.81 = ${nf(W)} N. So N = ${nf(W)} − ${nf(F * sin(a))} = <b>${nf(Nn)} N</b>.`,
      meta: { type: 'normal-while-pulled', in: { m, F, angle: a } },
    };
  },

  // 10. sliding down a slope at a constant speed is equilibrium too: mg sin θ = μmg cos θ, so μ = tan θ; friction is
  // mg sin θ and the normal force mg cos θ
  (d, ctx) => {
    const type = ctx.k % 5;
    if (type < 3) {
      const ask = ['mu', 'f', 'N'][type];
      const [m, a] = turn(ctx, 5, [[3, 6, 10, 15, 25], [12, 15, 18, 22, 25, 28]], (M, A) => apart([tan(A), M * G * sin(A), M * G * cos(A)][type], M, A));
      const W = m * G, f = W * sin(a), Nn = W * cos(a);
      return {
        topic: T.slide, text: `${A(m)} ${m} kg block slides down a ramp at ${a}° to the level at a constant speed. ${['What is the coefficient of friction between the block and the ramp?', 'How big is the friction force on it?', 'How big is the normal force on it?'][type]}`,
        figure: ask === 'N' ? fbd({ axes: a, forces: [{ angle: 90 + a, size: Nn, label: 'N = ?' }, { angle: a, size: f, label: 'f' }, { angle: 270, size: W, label: 'W = mg' }], label: 'the forces on the block' })
          : slope({ angle: a, box: `${m} kg`, moving: 'down' }),
        answer: numAns([tan(a), f, Nn][type], ['', 'N', 'N'][type]),
        solution: [
          `Take the block, with x down the slope (the way it moves). A constant speed means ΣF<sub>x</sub> = 0: mg sin ${a}° − μmg cos ${a}° = 0. The mass cancels, so μ = tan ${a}° = <b>${tr(tan(a))}</b>.`,
          `Take the block, with x down the slope (the way it moves): W = ${m} × 9.81 = ${nf(W)} N. A constant speed means ΣF<sub>x</sub> = 0: W sin ${a}° − f = 0. So friction, up the slope, is f = ${nf(W)} × ${tr(sin(a))} = <b>${nf(f)} N</b>.`,
          `Take the block, with y out of the slope: W = ${m} × 9.81 = ${nf(W)} N. ΣF<sub>y</sub> = 0: N − W cos ${a}° = 0, so N = ${nf(W)} × ${tr(cos(a))} = <b>${nf(Nn)} N</b>.`,
        ][type],
        meta: { type: ['slide-mu', 'slide-friction', 'slide-normal'][type], in: { m, angle: a } },
      };
    }
    if (type === 3) {
      const [m, mu] = turn(ctx, 5, [[5, 10, 20, 30], [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55]], (M, U) => apart(deg(Math.atan(U)), M, U));
      const th = deg(Math.atan(mu));
      return {
        topic: T.slide, text: `${A(m)} ${m} kg crate slides down a ramp at a constant speed. The coefficient of friction between the crate and the ramp is ${mu}. At what angle to the level is the ramp?`,
        answer: numAns(th, '°'),
        solution: `Take the crate, with x down the slope (the way it moves). A constant speed means ΣF<sub>x</sub> = 0: mg sin θ − μmg cos θ = 0, so tan θ = μ = ${mu} (the mass cancels). θ = tan⁻¹ ${mu} = <b>${ang(th)}°</b>.`,
        meta: { type: 'slide-angle', in: { m, mu } },
      };
    }
    const [m, a, k] = turn(ctx, 5, [[4, 6, 10, 15], [15, 20, 25, 30], [2, 3]]), right = 'It slides down at a constant speed too';
    return {
      topic: T.slide, text: `${A(m)} ${m} kg box slides down a ramp at ${a}° to the level at a constant speed. A second box of the same material, ${k === 2 ? 'twice' : 'three times'} as heavy, is put on the same ramp and given a push down it. How does it move?`,
      figure: slope({ angle: a, box: `${m} kg`, moving: 'down' }),
      answer: oneOf(d, right, ['It speeds up: more weight pulls it down harder', 'It slows down and stops: more weight means more friction', 'It doesn’t move at all']),
      solution: `For any mass, the weight’s part down the slope is mg sin ${a}° and friction is μmg cos ${a}°. Both grow with the mass, so they still balance (μ = tan ${a}°, whatever the mass). <b>${right}</b>.`,
      meta: { type: 'slide-heavier', in: { m, angle: a, times: k } },
    };
  },
];

export const staticsBank = bank('statics', templates, templates.length * 20);
