// Torque and Rotational Equilibrium: 10 topics, 20 variants each (200). How strongly a force turns something about a
// pivot (τ = Fl, and Fl sin θ when it pulls at an angle), which way (counterclockwise +, clockwise −), and what keeps a
// plank or beam still: ΣF = 0 and Στ = 0, with a uniform beam's weight at its middle. Every topic is asked several ways,
// and most variants draw the wrench, door, seesaw or beam to scale with mech.js's beam(), lengths marked.
import { bank, combo, num, round } from '../kit/bank.js';
import { beam } from './mech.js';

const G = 9.81;
const numAns = (value, unit, tol = 0.02) => ({ kind: 'number', value: round(value, 4), unit, tol });
// a topic's question types take turns (variant k is type k % types), each walking through its own number combinations
// (tag: a type whose numbers depend on its situation keeps each situation's combinations apart)
const turn = (ctx, types, lists, ok, tag = '') => combo({ ...ctx, k: Math.floor(ctx.k / types), salt: `${ctx.salt}-${ctx.k % types}${tag}` }, lists, ok);
const oneOf = (d, right, wrongs) => { const list = d.shuffle([right, ...wrongs]); return { kind: 'choice', choices: list, correct: list.indexOf(right) }; };
const sin = (a) => Math.sin((a * Math.PI) / 180), tan = (a) => Math.tan((a * Math.PI) / 180);
// (no answer within 3% of a number the question gives, so copying one out of the question isn't marked right)
const apart = (answer, ...given) => given.every((x) => Math.abs(Math.abs(answer) - Math.abs(x)) > 0.03 * Math.abs(answer));
// an answer as a solution shows it: to 0.01, or to 0.001 below 1, so what it shows is within the 2% that's marked right
const val = (x) => num(x, Math.abs(x) < 1 ? 3 : 2);
const person = (m) => (m >= 55 ? 'adult' : 'child');
// “a” or “an” before a number, as it’s said: an 8 kg box, an 18 kg box, an 80 kg adult
const an = (x) => (/^(8|11(?!\d)|18(?!\d))/.test(String(x)) ? 'an' : 'a'), An = (x) => (an(x) === 'an' ? 'An' : 'A');
const sum = (xs) => xs.reduce((s, x) => s + x, 0);

// ---------- drawings ----------
// a bar turning about a bolt at its left end: a wrench, a level bicycle crank, or a door seen from above with its hinges
// at the left; forces [{ x, angle, label }] on it, and distances from the bolt [[x, label]]
const lever = (length, forces, dists, what) => beam({ length, bolt: 0, forces, dims: dists.map(([x, label]) => ({ from: 0, to: x, label })), label: what });
const doorWidth = (x) => Math.max(0.9, round(x + 0.06, 2));
// a seesaw pivoted at its middle, 2.5 m each side: loads [{ at (m from the pivot, negative to the left), label }], and
// the distances from the pivot to mark [[at, label]]
const SEE = 2.5;
const seesaw = (loads, dists, what = 'a seesaw') => beam({ length: 2 * SEE, pivot: SEE, loads: loads.map(({ at, label }) => ({ x: SEE + at, label })), dims: dists.map(([at, label]) => ({ from: SEE, to: SEE + at, label })), label: what });

// ---------- forces on a light bar on a pivot (topic 3) ----------
// layouts: where each force acts (m from the pivot, negative to the left) and whether it pulls up (1) or pushes down (0);
// sizes: the forces in N, different within a set, so "the 40 N force" is only ever one of them
const TWO = [[[-2, 0], [1.5, 0]], [[-1.5, 0], [2.5, 0]], [[1, 0], [3, 1]], [[-2.5, 0], [1, 1]], [[-1, 1], [-3, 0]], [[-0.5, 1], [2, 0]], [[-3, 0], [2, 0]], [[2.5, 0], [-1, 1]]];
const TWO_F = [[40, 30], [25, 50], [60, 20], [30, 45], [15, 35], [50, 40], [20, 60], [35, 25]];
const THREE = [[[-2, 0], [1, 0], [3, 0]], [[-3, 0], [-1, 0], [2, 0]], [[-2, 0], [1.5, 0], [3, 1]], [[-1, 1], [-2.5, 0], [2, 0]], [[-1.5, 0], [1, 1], [2.5, 0]], [[-3, 0], [-1.5, 1], [1, 0]]];
const THREE_F = [[20, 30, 10], [40, 15, 25], [30, 20, 50], [15, 45, 20], [50, 25, 30], [25, 10, 40], [35, 20, 15], [60, 30, 20]];
// (two that balance exactly, for "it stays balanced")
const BALANCED = [[[[-2, 0], [1.5, 0]], [30, 40]], [[[-3, 0], [1, 0], [2, 0]], [20, 30, 15]]];
const onBar = (layout, sizes) => layout.map(([x, up], i) => ({ x, up: !!up, F: sizes[i], tau: Math.sign(x) * (up ? 1 : -1) * sizes[i] * Math.abs(x) }));
const said = (f) => `${an(f.F)} ${f.F} N force ${f.up ? 'pulls up' : 'pushes down'} ${num(Math.abs(f.x))} m ${f.x < 0 ? 'left' : 'right'} of the pivot`;
const and = (xs) => (xs.length === 2 ? `${xs[0]} and ${xs[1]}` : `${xs.slice(0, -1).join(', ')}, and ${xs.at(-1)}`);
const signed = (v) => (Math.abs(v) < 1e-9 ? '0' : `${v < 0 ? '−' : '+'}${num(Math.abs(v))}`);
// Στ written out: "+40 × 2 − 30 × 1.5 = +80 − 45"
function sumOut(fs) {
  const sign = (v, first) => (v < 0 ? (first ? '−' : ' − ') : (first ? '+' : ' + '));
  return `${fs.map((f, i) => `${sign(f.tau, !i)}${f.F} × ${num(Math.abs(f.x))}`).join('')} = ${fs.map((f, i) => `${sign(f.tau, !i)}${num(Math.abs(f.tau))}`).join('')}`;
}
const inputs = (fs) => fs.map(({ x, up, F }) => ({ x, up, F }));
function barFigure(fs) {
  const left = Math.max(0.5, ...fs.map((f) => -f.x)), right = Math.max(0.5, ...fs.map((f) => f.x));
  return beam({
    length: left + right, pivot: left, label: 'forces on a light bar on a pivot',
    forces: fs.map((f) => ({ x: left + f.x, angle: f.up ? 90 : 270, label: `${f.F} N`, tone: f.up ? 2 : 0 })),
    dims: fs.map((f) => ({ from: left, to: left + f.x, label: `${num(Math.abs(f.x))} m` })),
  });
}
const CCW = 'Counterclockwise +: down on the left or up on the right turns it counterclockwise (+), down on the right or up on the left clockwise (−).';

// ---------- the conditions for equilibrium, as ideas (topic 4) ----------
const EQ = {
  // [question, right answer, wrong ones, why]
  choice: [
    ['What two conditions must hold for an object to be in equilibrium?', 'ΣF = 0 and Στ = 0', ['ΣF = 0 only', 'Στ = 0 only', 'No forces act on it'],
      'Both are needed: ΣF = 0 so it doesn’t start moving off (translational equilibrium), and Στ = 0 so it doesn’t start turning (rotational equilibrium).'],
    ['What is an object’s center of gravity?', 'The point where its whole weight can be taken to act', ['The point it turns about', 'Always its middle, whatever its shape', 'The part of it nearest the ground'],
      'For forces and torques, an object’s whole weight can be taken to act at one point, its center of gravity. For a uniform beam that’s its middle, but not for every shape.'],
    ['Two equal forces act on a bar in opposite directions, not along the same line (a couple). What does the bar do?', 'It starts to turn, without moving off', ['It stays still, since the forces cancel', 'It moves off without turning', 'It moves off and turns'],
      'The forces cancel (ΣF = 0), so it doesn’t start moving off, but both turn it the same way about its middle (Στ ≠ 0), so it starts to turn.'],
    ['A seesaw balances. What must be equal on its two sides?', 'The torques: weight × distance from the pivot', ['The masses', 'The distances from the pivot', 'The lengths of plank on each side'],
      'Balanced means Στ = 0 about the pivot: m₁gd₁ = m₂gd₂, so m₁d₁ = m₂d₂. A lighter person farther out can balance a heavier one nearer the pivot.'],
  ],
  // [question, right ones, wrong ones, why]
  multi: [
    ['A uniform beam rests on two supports, not moving. Which of these must be true?', ['The forces on it add up to zero (ΣF = 0)', 'The torques on it add up to zero (Στ = 0)', 'Its weight can be taken to act at its middle'], ['No torques act on it at all', 'Each support pushes up with the beam’s whole weight'],
      'At rest it’s in equilibrium: ΣF = 0 and Στ = 0. Torques do act on it (the supports’ and its weight’s), they just add up to zero, and the two supports share the weight between them.'],
    ['Which of these are in equilibrium?', ['A balanced seesaw with two children on it', 'A picture hanging still on a wall', 'A beam held level by a hinge and a cable'], ['A steering wheel turned by two equal, opposite pushes on its rim', 'A seesaw whose heavier end is going down'],
      'Equilibrium means nothing starts to move off or turn: ΣF = 0 and Στ = 0. The steering wheel has ΣF = 0 but starts to turn, and the seesaw’s torques don’t balance.'],
    ['Which of these forces give no torque about a pivot?', ['A force whose line passes through the pivot', 'A force pulling straight along the bar, away from the pivot', 'The pivot’s own push on the bar'], ['A force at right angles to the bar, at its end', 'A force at 30° to the bar, halfway out'],
      'A force whose line goes through the pivot has no lever arm (l = 0, or sin 0° = 0), so no torque. A force at an angle to the bar, away from the pivot, always gives some.'],
    ['A couple turns a steering wheel: two equal pushes, opposite ways, on opposite sides of its rim. Which of these are true?', ['The net force on the wheel is zero', 'The net torque on the wheel is not zero', 'The wheel starts to turn'], ['The wheel is in equilibrium', 'The wheel starts to move off sideways'],
      'The pushes cancel as forces (ΣF = 0), but both turn the wheel the same way, so Στ ≠ 0: it turns without moving off, and it isn’t in equilibrium.'],
  ],
  pairs: [
    ['Translational equilibrium', 'ΣF = 0: it doesn’t start moving off'], ['Rotational equilibrium', 'Στ = 0: it doesn’t start turning'],
    ['A couple', 'Two equal, opposite forces not on the same line'], ['Center of gravity', 'Where the whole weight can be taken to act'],
    ['Torque', 'How strongly a force turns something: τ = Fl'], ['Lever arm', 'The perpendicular distance from the pivot to the force’s line'],
    ['Pivot', 'The point something turns about'], ['A counterclockwise torque', 'Taken as positive (+)'], ['A clockwise torque', 'Taken as negative (−)'],
  ],
  sets: [[0, 1, 2, 3], [4, 5, 6, 3], [7, 8, 4, 2], [0, 1, 5, 6]],
  // [statement, true or false, why]
  tf: [
    ['If the forces on an object add up to zero, it can’t start to turn.', false, 'A couple (two equal, opposite forces not on the same line) adds up to zero force but still turns things, like two hands turning a steering wheel. Equilibrium needs Στ = 0 as well.'],
    ['A uniform plank’s whole weight can be taken to act at its middle.', true, 'Its center of gravity is at its middle, so for torques its weight acts there.'],
    ['A seesaw balances when the two children on it have the same mass.', false, 'What has to match is the torques: m₁d₁ = m₂d₂. Equal masses balance only at equal distances, and a lighter child farther out can balance a heavier one nearer the pivot.'],
    ['A force whose line passes through the pivot gives no torque about it.', true, 'Its lever arm, the perpendicular distance from the pivot to its line, is zero, so τ = Fl = 0.'],
  ],
  sort: [['A balanced seesaw with two children on it', 0], ['A sign hanging still from two ropes', 0], ['A beam held level by a hinge and a cable', 0], ['A book lying still on a table', 0],
    ['A steering wheel turned by two equal, opposite pushes on its rim', 1], ['A seesaw whose heavier end is going down', 1], ['A door starting to swing open', 1], ['A crate pulled across a smooth floor by one rope', 1]],
};

const T = {
  torque: 'Torque: τ = Fl', angle: 'The lever arm and the angle', sign: 'Clockwise and counterclockwise',
  conditions: 'Conditions for equilibrium', counter: 'Balancing: the counterweight', sit: 'Balancing: where to sit', cg: 'Center of gravity',
  heavy: 'A heavy beam on a pivot', supports: 'The push of the supports', cable: 'A beam held by a cable',
};

const templates = [
  // 1. torque, τ = Fl: how strongly a force turns something about a pivot (the force at right angles to the bar here)
  (d, ctx) => {
    const type = ctx.k % 5, j = Math.floor(ctx.k / 5);
    if (type === 0) {
      if (j === 1) {
        const [F, l] = turn(ctx, 5, [[12, 15, 18, 20, 24, 25, 30], [0.7, 0.75, 0.8, 0.85]], (f, x) => apart(f * x, f, x), '-door'), tau = F * l;
        return {
          topic: T.torque, text: `You pull a door’s handle, ${num(l)} m from its hinges, with a force of ${F} N at right angles to the door. What torque does your pull give about the hinges?`,
          figure: lever(doorWidth(l), [{ x: l, angle: 90, label: `${F} N` }], [[l, `${num(l)} m`]], 'a door seen from above, its hinges at the left, pulled at its handle'),
          answer: numAns(tau, 'N·m'),
          solution: `The pull is at right angles to the door, so its lever arm is the whole ${num(l)} m from the hinges: τ = Fl = ${F} × ${num(l)} = <b>${val(tau)} N·m</b>.`,
          meta: { type: 'door-torque', in: { F, l } },
        };
      }
      if (j === 2) {
        const [F, l] = turn(ctx, 5, [[250, 300, 350, 400, 450, 500, 600], [0.16, 0.17, 0.18]], (f, x) => apart(f * x, f, x), '-pedal'), tau = F * l;
        return {
          topic: T.torque, text: `A cyclist pushes straight down on a pedal with a force of ${F} N while the crank is level. The crank is ${num(l)} m long, from the axle to the pedal. What torque does the push give about the axle?`,
          figure: lever(l, [{ x: l, angle: 270, label: `${F} N` }], [[l, `${num(l)} m`]], 'a level bicycle crank pushed straight down at its pedal'),
          answer: numAns(tau, 'N·m'),
          solution: `With the crank level, straight down is at right angles to it, so the lever arm is the crank’s ${num(l)} m: τ = Fl = ${F} × ${num(l)} = <b>${val(tau)} N·m</b>.`,
          meta: { type: 'pedal-torque', in: { F, l } },
        };
      }
      const [F, l] = turn(ctx, 5, [[40, 50, 60, 75, 80, 90, 120], [0.15, 0.2, 0.25, 0.3, 0.35, 0.4]], (f, x) => apart(f * x, f, x)), tau = F * l;
      return {
        topic: T.torque, text: `A mechanic pushes down on the end of a wrench ${num(l)} m long with a force of ${F} N, at right angles to the wrench. What torque does the push give about the bolt?`,
        figure: lever(l, [{ x: l, angle: 270, label: `${F} N` }], [[l, `${num(l)} m`]], 'a wrench on a bolt, pushed down at its end'),
        answer: numAns(tau, 'N·m'),
        solution: `The push is at right angles to the wrench, so its lever arm is the wrench’s full ${num(l)} m: τ = Fl = ${F} × ${num(l)} = <b>${val(tau)} N·m</b>.`,
        meta: { type: 'wrench-torque', in: { F, l } },
      };
    }
    if (type === 1) {
      if (j % 2 === 0) {
        const [m, l] = turn(ctx, 5, [[30, 32, 35, 38, 40, 45], [1.2, 1.5, 1.8, 2, 2.2, 2.4]], (a, x) => apart(a * G * x, a, x), '-seesaw'), tau = m * G * l;
        return {
          topic: T.torque, text: `${An(m)} ${m} kg child sits on a level seesaw, ${num(l)} m from the pivot. What torque does the child’s weight give about the pivot?`,
          figure: seesaw([{ at: l, label: `${m} kg` }], [[l, `${num(l)} m`]], 'a child on a seesaw'),
          answer: numAns(tau, 'N·m'),
          solution: `The child’s weight, mg = ${m} × 9.81 = ${num(m * G)} N, acts straight down, at right angles to the level plank, so its lever arm is ${num(l)} m: τ = mgl = ${m} × 9.81 × ${num(l)} = <b>${val(tau)} N·m</b>.`,
          meta: { type: 'child-torque', in: { m, l } },
        };
      }
      const [m, l] = turn(ctx, 5, [[2, 3, 4, 5, 6, 8, 10, 12], [0.4, 0.5, 0.6, 0.75, 0.8, 1.2, 1.5, 2]], (a, x) => apart(a * G * x, a, x), '-rod'), tau = m * G * l;
      return {
        topic: T.torque, text: `${An(m)} ${m} kg bucket hangs from a light, level rod, ${num(l)} m from the pivot the rod rests on. What torque does the bucket’s weight give about the pivot?`,
        figure: beam({ length: 2.4 * l, pivot: 1.2 * l, loads: [{ x: 2.2 * l, label: `${m} kg`, hang: true }], dims: [{ from: 1.2 * l, to: 2.2 * l, label: `${num(l)} m` }], label: 'a bucket hanging from a level rod on a pivot' }),
        answer: numAns(tau, 'N·m'),
        solution: `The bucket’s weight, mg = ${m} × 9.81 = ${num(m * G)} N, pulls straight down, at right angles to the level rod, so its lever arm is ${num(l)} m: τ = mgl = ${m} × 9.81 × ${num(l)} = <b>${val(tau)} N·m</b>.`,
        meta: { type: 'hanging-torque', in: { m, l } },
      };
    }
    if (type === 2) {
      if (j % 2 === 0) {
        const [tau, F] = turn(ctx, 5, [[24, 30, 36, 40, 45, 48, 60], [120, 150, 160, 180, 200, 240]], (t, f) => t / f >= 0.15 && t / f <= 0.5 && apart(t / f, t, f), '-wrench'), l = tau / F;
        return {
          topic: T.torque, text: `A rusty nut needs a torque of ${tau} N·m to start it turning. If you push with ${F} N at right angles to the wrench, at least how far from the nut must you push?`,
          figure: lever(l, [{ x: l, angle: 270, label: `${F} N` }], [[l, '?']], 'a wrench on a nut, pushed at right angles'),
          answer: numAns(l, 'm'),
          solution: `τ = Fl, so l = τ ÷ F = ${tau} ÷ ${F} = <b>${val(l)} m</b>. Any farther out gives more torque than it needs.`,
          meta: { type: 'wrench-arm', in: { tau, F } },
        };
      }
      const [tau, F] = turn(ctx, 5, [[12, 15, 16, 18, 20, 24], [16, 20, 24, 25, 30, 32]], (t, f) => t / f >= 0.45 && t / f <= 0.84 && apart(t / f, t, f), '-door'), l = tau / F;
      return {
        topic: T.torque, text: `A heavy door needs a torque of ${tau} N·m about its hinges to swing open. Pulling with ${F} N at right angles to the door, at least how far from the hinges must you pull?`,
        figure: lever(doorWidth(l), [{ x: l, angle: 90, label: `${F} N` }], [[l, '?']], 'a door seen from above, its hinges at the left'),
        answer: numAns(l, 'm'),
        solution: `τ = Fl, so l = τ ÷ F = ${tau} ÷ ${F} = <b>${val(l)} m</b>. Any nearer the hinges and the same pull isn’t enough.`,
        meta: { type: 'door-arm', in: { tau, F } },
      };
    }
    if (type === 3) {
      if (j % 2 === 0) {
        const [tau, l] = turn(ctx, 5, [[20, 25, 30, 36, 40, 45, 50, 60], [0.2, 0.25, 0.3, 0.35, 0.4, 0.45]], (t, x) => apart(t / x, t, x), '-wrench'), F = tau / l;
        return {
          topic: T.torque, text: `A bolt needs a torque of ${tau} N·m to tighten it fully. Pushing at right angles at the end of a wrench ${num(l)} m long, how hard must you push?`,
          figure: lever(l, [{ x: l, angle: 270, label: 'F' }], [[l, `${num(l)} m`]], 'a wrench on a bolt, pushed at its end'),
          answer: numAns(F, 'N'),
          solution: `τ = Fl, so F = τ ÷ l = ${tau} ÷ ${num(l)} = <b>${val(F)} N</b>.`,
          meta: { type: 'wrench-force', in: { tau, l } },
        };
      }
      const [tau, l] = turn(ctx, 5, [[50, 60, 70, 75, 80, 90], [0.16, 0.17, 0.18]], (t, x) => apart(t / x, t, x), '-pedal'), F = tau / l;
      return {
        topic: T.torque, text: `Riding up a hill, a cyclist needs a torque of ${tau} N·m about the axle. The crank is level and ${num(l)} m long, from the axle to the pedal. How hard must they push straight down on the pedal?`,
        figure: lever(l, [{ x: l, angle: 270, label: 'F' }], [[l, `${num(l)} m`]], 'a level bicycle crank pushed down at its pedal'),
        answer: numAns(F, 'N'),
        solution: `Straight down is at right angles to the level crank, so τ = Fl and F = τ ÷ l = ${tau} ÷ ${num(l)} = <b>${val(F)} N</b>.`,
        meta: { type: 'pedal-force', in: { tau, l } },
      };
    }
    // (a longer lever arm needs less force for the same torque, a shorter one more)
    if (j % 2 === 0) {
      const [l1, n, F1] = turn(ctx, 5, [[0.15, 0.2, 0.25, 0.3], [1.5, 2, 2.5, 3], [120, 150, 180, 200, 240]], (a, k) => Math.abs(a * k * 100 - Math.round(a * k * 100)) < 1e-6 && a * k <= 0.75, '-wrench');
      const l2 = round(l1 * n, 2), F2 = (F1 * l1) / l2;
      return {
        topic: T.torque, text: `With a wrench ${num(l1)} m long, it takes a push of ${F1} N, at right angles at its end, to free a stuck bolt. How hard would you have to push, the same way, at the end of a wrench ${num(l2)} m long?`,
        figure: lever(l2, [{ x: l2, angle: 270, label: 'F' }], [[l2, `${num(l2)} m`]], 'the longer wrench, pushed at its end'),
        answer: oneOf(d, `${num(F2)} N`, [`${num(F1 * n)} N`, `${F1} N`, `${num(F2 / n)} N`]),
        solution: `The bolt needs the same torque either way: τ = Fl = ${F1} × ${num(l1)} = ${num(F1 * l1)} N·m. The longer wrench has a longer lever arm, so it needs less force: F = τ ÷ l = ${num(F1 * l1)} ÷ ${num(l2)} = <b>${num(F2)} N</b>.`,
        meta: { type: 'longer-wrench', in: { l1, F1, l2 } },
      };
    }
    const [[l1, l2], F1] = turn(ctx, 5, [[[0.8, 0.4], [0.8, 0.2], [0.75, 0.25], [0.9, 0.3], [0.9, 0.45], [0.6, 0.3]], [10, 12, 15, 18, 20]], undefined, '-door');
    const n = l1 / l2, F2 = F1 * n;
    return {
      topic: T.torque, text: `It takes ${an(F1)} ${F1} N pull on a door’s handle, at right angles to the door and ${num(l1)} m from its hinges, to swing the door open. How hard would you have to pull, at right angles, ${num(l2)} m from the hinges?`,
      figure: lever(doorWidth(l1), [{ x: l2, angle: 90, label: 'F' }], [[l2, `${num(l2)} m`]], 'a door seen from above, pulled near its hinges'),
      answer: oneOf(d, `${num(F2)} N`, [`${num(F1 / n)} N`, `${F1} N`, `${num(F2 * n)} N`]),
      solution: `The door needs the same torque either way: τ = Fl = ${F1} × ${num(l1)} = ${num(F1 * l1)} N·m. Nearer the hinges the lever arm is shorter, so it takes more force: F = τ ÷ l = ${num(F1 * l1)} ÷ ${num(l2)} = <b>${num(F2)} N</b>.`,
      meta: { type: 'door-nearer', in: { l1, F1, l2 } },
    };
  },

  // 2. the lever arm and the angle: only the part of a force across the bar turns it, τ = Fl sin θ
  (d, ctx) => {
    const type = ctx.k % 5, j = Math.floor(ctx.k / 5), door = j % 2 === 1;
    const what = door ? 'door' : 'wrench', from = door ? 'hinges' : 'bolt';
    if (type === 0) {
      const [F, l, a] = door
        ? turn(ctx, 5, [[20, 25, 30, 40, 50], [0.7, 0.75, 0.8, 0.85], [30, 40, 45, 50, 60]], (f, x, t) => apart(f * x * sin(t), f, x, t), '-door')
        : turn(ctx, 5, [[40, 50, 60, 80, 100, 120], [0.2, 0.25, 0.3, 0.4, 0.5], [20, 30, 40, 50, 60]], (f, x, t) => apart(f * x * sin(t), f, x, t));
      const tau = F * l * sin(a);
      return {
        topic: T.angle,
        text: door ? `You pull a door’s handle, ${num(l)} m from its hinges, with a force of ${F} N at ${a}° to the door. What torque does your pull give about the hinges?`
          : `You pull on the end of a wrench ${num(l)} m long with a force of ${F} N, at ${a}° to the wrench. What torque does the pull give about the bolt?`,
        figure: lever(door ? doorWidth(l) : l, [{ x: l, angle: a, label: `${F} N`, arc: { label: `${a}°`, from: 0 } }], [[l, `${num(l)} m`]], door ? 'a door seen from above, pulled at an angle' : 'a wrench pulled at an angle at its end'),
        answer: numAns(tau, 'N·m'),
        solution: `Only the part of the pull at right angles to the ${what} turns it: F sin ${a}° = ${num(F * sin(a))} N. So τ = Fl sin θ = ${F} × ${num(l)} × sin ${a}° = <b>${val(tau)} N·m</b>.`,
        meta: { type: `${what}-angle-torque`, in: { F, l, a } },
      };
    }
    if (type === 1) {
      const [tau, l, a] = door
        ? turn(ctx, 5, [[10, 12, 15, 18, 20], [0.75, 0.8, 0.85], [30, 40, 50, 60]], (t, x, b) => apart(t / (x * sin(b)), t, x, b), '-door')
        : turn(ctx, 5, [[20, 24, 30, 36, 40, 45], [0.25, 0.3, 0.4], [30, 40, 50, 60]], (t, x, b) => t / (x * sin(b)) <= 400 && apart(t / (x * sin(b)), t, x, b));
      const F = tau / (l * sin(a));
      return {
        topic: T.angle,
        text: door ? `A heavy door needs a torque of ${tau} N·m about its hinges to swing open. You pull its handle, ${num(l)} m from the hinges, at ${a}° to the door. How hard must you pull?`
          : `A bolt needs a torque of ${tau} N·m to turn. There’s only room to pull on the end of the wrench, ${num(l)} m from the bolt, at ${a}° to the wrench. How hard must you pull?`,
        figure: lever(door ? doorWidth(l) : l, [{ x: l, angle: a, label: 'F', arc: { label: `${a}°`, from: 0 } }], [[l, `${num(l)} m`]], door ? 'a door seen from above, pulled at an angle' : 'a wrench pulled at an angle at its end'),
        answer: numAns(F, 'N'),
        solution: `τ = Fl sin θ, so F = τ ÷ (l sin θ) = ${tau} ÷ (${num(l)} × sin ${a}°) = <b>${val(F)} N</b>. At right angles, ${num(tau / l)} N would do.`,
        meta: { type: `${what}-angle-force`, in: { tau, l, a } },
      };
    }
    if (type === 2) {
      // four pulls of the same size on a door: A at its edge at right angles, B at the edge at θ, C at right angles
      // nearer the hinges, D at the edge straight along the door (its line through the hinges)
      const [L, a, c, F] = [[0.8, 45, 0.4, 20], [0.9, 60, 0.5, 25], [0.8, 30, 0.4, 30], [0.8, 30, 0.6, 15]][j];
      const text = `Four pulls of ${F} N each act on a door ${num(L)} m wide, seen from above with its hinges at the left. A pulls the outer edge at right angles to the door, B pulls the edge at ${a}° to the door, C pulls at right angles ${num(c)} m from the hinges, and D pulls the edge straight along the door, away from the hinges.`;
      const arms = `The pulls are the same size, so compare their lever arms, l sin θ: A ${num(L)} m, B ${num(L)} × sin ${a}° = ${num(L * sin(a), 3)} m, C ${num(c)} m, and D none (its line goes through the hinges).`;
      const figure = beam({ length: L, bolt: 0, forces: [{ x: L, angle: 90, label: 'A' }, { x: L, angle: a, label: 'B', arc: { label: `${a}°`, from: 0 } }, { x: c, angle: 90, label: 'C' }, { x: L, angle: 0, label: 'D' }], dims: [{ from: 0, to: c, label: `${num(c)} m` }, { from: 0, to: L, label: `${num(L)} m` }], label: 'a door seen from above with four pulls on it, A to D' });
      const base = { topic: T.angle, figure };
      if (j === 0) return { ...base, text: `${text} Which one turns the door most?`, answer: oneOf(d, 'A', ['B', 'C', 'D']), solution: `${arms} <b>A</b> turns it most: as far from the hinges as it gets, and at right angles.`, meta: { type: 'most-torque', in: { L, a, c, F } } };
      if (j === 1) return { ...base, text: `${text} Which one doesn’t turn the door at all?`, answer: oneOf(d, 'D', ['A', 'B', 'C']), solution: `D pulls straight along the door, so its line passes through the hinges: its lever arm is 0 (sin 0° = 0), so it gives no torque. <b>D</b>.`, meta: { type: 'no-torque', in: { L, a, c, F } } };
      if (j === 2) return { ...base, text: `${text} Which two give the same torque about the hinges?`, answer: oneOf(d, 'B and C', ['A and B', 'A and C', 'C and D']), solution: `${arms} So <b>B and C</b> give the same torque: pulling the edge at 30° turns the door as much as pulling at right angles halfway out.`, meta: { type: 'same-torque', in: { L, a, c, F } } };
      const want = ['A', 'C', 'B', 'D'];
      let items;
      do items = d.shuffle(want); while (items.every((x, i) => x === want[i]));
      return { ...base, text: `${text} Put them in order of the torque they give, most first.`, answer: { kind: 'order', items, correct: want.map((x) => items.indexOf(x)) },
        solution: `${arms} In order: <b>A, C, B, D</b>. Pulling the edge at ${a}° (B) turns it less than pulling at right angles nearer the hinges (C).`, meta: { type: 'torque-order', in: { L, a, c, F } } };
    }
    if (type === 3) {
      if (j % 2 === 0) {
        const [t90, a] = turn(ctx, 5, [[20, 24, 30, 36, 40, 48, 60], [20, 30, 40, 50, 60]], (t, b) => apart(t * sin(b), t, b), '-to'), tau = t90 * sin(a);
        return {
          topic: T.angle, text: `Pulling at right angles to a wrench, at its end, gives a torque of ${t90} N·m about the bolt. What torque does the same pull give, at the same place, if it pulls at ${a}° to the wrench instead?`,
          figure: lever(0.3, [{ x: 0.3, angle: a, label: 'F', arc: { label: `${a}°`, from: 0 } }], [], `a wrench pulled at ${a}° to it`),
          answer: numAns(tau, 'N·m'),
          solution: `The same F and l, so only sin θ changes, from sin 90° = 1 to sin ${a}°: τ = Fl sin θ = ${t90} × sin ${a}° = <b>${val(tau)} N·m</b>.`,
          meta: { type: 'angle-from-right', in: { t90, a } },
        };
      }
      const [ta, a] = turn(ctx, 5, [[10, 12, 15, 18, 20, 25], [20, 30, 40, 50]], (t, b) => apart(t / sin(b), t, b), '-from'), t90 = ta / sin(a);
      return {
        topic: T.angle, text: `A pull at ${a}° to a wrench, at its end, gives a torque of ${ta} N·m about the bolt. What torque would the same pull give at right angles to the wrench?`,
        figure: lever(0.3, [{ x: 0.3, angle: a, label: 'F', arc: { label: `${a}°`, from: 0 } }], [], `a wrench pulled at ${a}° to it`),
        answer: numAns(t90, 'N·m'),
        solution: `At ${a}°, Fl sin ${a}° = ${ta} N·m, so Fl = ${ta} ÷ sin ${a}°. At right angles sin 90° = 1, so the torque is Fl itself: <b>${val(t90)} N·m</b>.`,
        meta: { type: 'angle-to-right', in: { ta, a } },
      };
    }
    const [F, l, a] = door
      ? turn(ctx, 5, [[20, 30, 40], [0.7, 0.75, 0.8, 0.85], [20, 30, 40, 50, 60]], (f, x, b) => apart(x * sin(b), f, x, b), '-door')
      : turn(ctx, 5, [[40, 60, 80], [0.3, 0.4, 0.5], [20, 30, 40, 50, 60]], (f, x, b) => x * sin(b) >= 0.1 && apart(x * sin(b), f, x, b));
    const arm = l * sin(a);
    return {
      topic: T.angle,
      text: door ? `You pull a door’s handle, ${num(l)} m from its hinges, with ${F} N at ${a}° to the door. What is your pull’s lever arm: the perpendicular distance from the hinges to the line it acts along?`
        : `${An(F)} ${F} N pull acts on the end of a wrench ${num(l)} m long, at ${a}° to the wrench. What is the pull’s lever arm: the perpendicular distance from the bolt to the line it acts along?`,
      figure: lever(door ? doorWidth(l) : l, [{ x: l, angle: a, label: `${F} N`, arc: { label: `${a}°`, from: 0 } }], [[l, `${num(l)} m`]], door ? 'a door seen from above, pulled at an angle' : 'a wrench pulled at an angle at its end'),
      answer: numAns(arm, 'm'),
      solution: `The perpendicular from the ${from} to the pull’s line makes a right triangle with the ${num(l)} m of ${what} as its long side, and the lever arm is the side across from the ${a}° angle: l sin θ = ${num(l)} × sin ${a}° = <b>${val(arm)} m</b>. Then τ = F × lever arm, which is the same as Fl sin θ.`,
      meta: { type: `${what}-lever-arm`, in: { F, l, a } },
    };
  },

  // 3. which way: counterclockwise +, clockwise −. Each force's torque with its sign, the net torque's size, and which way
  // the bar turns (sizes as numbers, the way as a choice). The types share one shuffled list of two-force set-ups and one
  // of three-force ones, each variant at its own place in them, so no two variants show the same forces
  (d, ctx) => {
    const type = ctx.k % 4, j = Math.floor(ctx.k / 4);
    // (a set-up: a layout and its sizes, whose net torque is at least 15% of its biggest torque and isn't a number it shows)
    const setup = (three, at) => {
      const L = three ? THREE : TWO, S = three ? THREE_F : TWO_F;
      const [li, si] = combo({ k: at, salt: `${ctx.salt}-${three ? 3 : 2}` }, [L.map((_, i) => i), S.map((_, i) => i)], (a, b) => {
        const fs = onBar(L[a], S[b]), net = sum(fs.map((f) => f.tau));
        return Math.abs(net) >= 0.15 * Math.max(...fs.map((f) => Math.abs(f.tau))) && apart(net, ...fs.flatMap((f) => [f.F, f.x]));
      });
      return onBar(L[li], S[si]);
    };
    const start = (fs) => `Forces act on a light bar that can turn about a pivot: ${and(fs.map(said))}.`;
    if (type === 0) {
      const fs = setup(false, j), f = fs[j % 2], o = fs[1 - (j % 2)], other = Math.sign(f.tau) * f.F * Math.abs(o.x);
      const s = (v) => `${v < 0 ? '−' : '+'}${num(Math.abs(v))} N·m`;
      return {
        topic: T.sign, text: `${start(fs)} Taking counterclockwise as positive, what is the torque of the ${f.F} N force about the pivot?`,
        figure: barFigure(fs),
        answer: oneOf(d, s(f.tau), [s(-f.tau), s(other), s(-other)]),
        solution: `On its own, the ${f.F} N force ${f.up ? 'pulling up' : 'pushing down'} ${f.x < 0 ? 'left' : 'right'} of the pivot would turn the bar ${f.tau > 0 ? 'counterclockwise, so its torque is positive' : 'clockwise, so its torque is negative'}. Its lever arm is ${num(Math.abs(f.x))} m: τ = ${f.tau > 0 ? '+' : '−'}${f.F} × ${num(Math.abs(f.x))} = <b>${s(f.tau)}</b>.`,
        meta: { type: 'torque-sign', in: { forces: inputs(fs), asked: f.F } },
      };
    }
    if (type === 1 || type === 2) {
      const fs = type === 1 ? setup(false, 5 + j) : setup(true, j), net = sum(fs.map((f) => f.tau));
      return {
        topic: T.sign, text: `${start(fs)} What is the size of the net torque about the pivot?`,
        figure: barFigure(fs),
        answer: numAns(Math.abs(net), 'N·m'),
        solution: `${CCW} Στ = ${sumOut(fs)} = ${signed(net)} N·m, so the net torque is <b>${val(Math.abs(net))} N·m</b>, ${net > 0 ? 'counterclockwise' : 'clockwise'}.`,
        meta: { type: type === 2 ? 'net-three' : 'net-two', in: { forces: inputs(fs) } },
      };
    }
    const fs = j === 2 || j === 4 ? onBar(...BALANCED[j === 2 ? 0 : 1]) : j === 1 ? setup(true, 5) : setup(false, j === 0 ? 10 : 11);
    const net = sum(fs.map((f) => f.tau)), way = Math.abs(net) < 1e-9 ? 2 : net < 0 ? 0 : 1;
    const choices = ['It starts to turn clockwise', 'It starts to turn counterclockwise', 'It stays balanced: it doesn’t turn'];
    return {
      topic: T.sign, text: `${start(fs)} The bar starts at rest. What does it do?`,
      figure: barFigure(fs),
      answer: { kind: 'choice', choices, correct: way },
      solution: `${CCW} Στ = ${sumOut(fs)} = ${signed(net)} N·m. ${['Negative, so <b>it starts to turn clockwise</b>.', 'Positive, so <b>it starts to turn counterclockwise</b>.', 'The torques cancel, so <b>it stays balanced</b>.'][way]}`,
      meta: { type: 'which-way', in: { forces: inputs(fs) } },
    };
  },

  // 4. the conditions for equilibrium: ΣF = 0 and Στ = 0, both; a couple has the first but not the second; the center
  // of gravity. Asked as choices, choose-all, matching, true or false, and situations
  (d, ctx) => {
    const type = ctx.k % 5, j = Math.floor(ctx.k / 5);
    if (type === 0) {
      const [q, right, wrongs, why] = EQ.choice[j];
      return { topic: T.conditions, text: q, answer: oneOf(d, right, wrongs), solution: `${why} So: <b>${right}</b>.`, meta: { type: 'eq-choice', in: { which: j } } };
    }
    if (type === 1) {
      const [q, rights, wrongs, why] = EQ.multi[j], all = d.shuffle([...rights, ...wrongs]);
      return {
        topic: T.conditions, text: `${q} <span class="muted">Choose all that fit.</span>`,
        answer: { kind: 'multi', choices: all, correct: rights.map((r) => all.indexOf(r)).sort((a, b) => a - b) },
        tip: 'Check each one on its own: more than one can be right.',
        solution: `${why} So the ones that fit: ${rights.map((r) => `<b>${r}</b>`).join('; ')}.`, meta: { type: 'eq-multi', in: { which: j } },
      };
    }
    if (type === 2) {
      const four = d.shuffle(EQ.sets[j].map((i) => EQ.pairs[i])), right = d.shuffle(four.map((p) => p[1]));
      return {
        topic: T.conditions, text: 'Match each one to what it means.',
        answer: { kind: 'match', left: four.map((p) => p[0]), right, correct: four.map((p) => right.indexOf(p[1])) },
        tip: 'Start with the ones you’re surest of: the last one is then the one left over.',
        solution: four.map(([a, b]) => `${a} → ${b}.`).join(' '), meta: { type: 'eq-match', in: { which: j } },
      };
    }
    if (type === 3) {
      const [s, yes, why] = EQ.tf[j];
      return { topic: T.conditions, text: `True or false? ${s}`, answer: { kind: 'choice', choices: ['True', 'False'], correct: yes ? 0 : 1 }, solution: `${why} So it’s <b>${yes ? 'true' : 'false'}</b>.`, meta: { type: 'eq-true-false', in: { which: j } } };
    }
    if (j === 0) {
      const right = 'ΣF = 0 but Στ ≠ 0: it starts to turn';
      return {
        topic: T.conditions, text: 'A driver turns a steering wheel with two equal pushes on opposite sides of its rim, one up and one down. Which is true of the wheel?',
        answer: oneOf(d, right, ['ΣF = 0 and Στ = 0: it stays still', 'ΣF ≠ 0: it starts to move off', 'Στ = 0 but ΣF ≠ 0: it moves off without turning']),
        solution: `The two pushes are equal and opposite, so they cancel as forces (ΣF = 0), but they’re not on the same line, so both turn the wheel the same way: a couple. <b>${right}</b>.`,
        meta: { type: 'eq-couple', in: { which: j } },
      };
    }
    if (j === 1) {
      const right = 'It stays still, since ΣF = 0 and Στ = 0';
      return {
        topic: T.conditions, text: 'Two people pull on a crate with equal forces in opposite directions, along the same line through its middle. What happens to the crate?',
        answer: oneOf(d, right, ['It starts to turn: the pulls form a couple', 'It moves off: ΣF ≠ 0', 'It turns and moves off']),
        solution: `The pulls cancel (ΣF = 0), and since they act along the same line through its middle, neither has a lever arm about it, so Στ = 0 too. It’s in equilibrium: <b>it stays still</b>.`,
        meta: { type: 'eq-same-line', in: { which: j } },
      };
    }
    if (j === 2) {
      const [m, near, far] = turn(ctx, 5, [[30, 35, 40, 45], [1, 1.2, 1.5], [2, 2.2, 2.4]]);
      const right = `The side with the child ${num(far)} m out goes down`;
      return {
        topic: T.conditions, text: `Two ${m} kg children sit on opposite sides of a seesaw pivoted at its middle: one ${num(far)} m from the pivot, the other ${num(near)} m from it. What happens?`,
        figure: seesaw([{ at: -far, label: `${m} kg` }, { at: near, label: `${m} kg` }], [[-far, `${num(far)} m`], [near, `${num(near)} m`]], 'two children of the same mass on a seesaw'),
        answer: oneOf(d, right, ['It balances, since the children weigh the same', `The side with the child ${num(near)} m out goes down`, 'It balances, since the pivot holds it up']),
        solution: `Their weights are equal, but their torques aren’t: ${m}g × ${num(far)} is more than ${m}g × ${num(near)}, so Στ ≠ 0. <b>${right}</b>. (The pivot holds the seesaw up, but its push acts at the pivot, with no lever arm, so it can’t stop the seesaw turning.)`,
        meta: { type: 'eq-seesaw', in: { m, near, far } },
      };
    }
    let six;
    do six = d.shuffle(EQ.sort).slice(0, 6); while (six.filter((x) => x[1] === 0).length < 2 || six.filter((x) => x[1] === 1).length < 2);
    const on = (side) => six.filter((x) => x[1] === side).map((x) => x[0].charAt(0).toLowerCase() + x[0].slice(1)).join('; ');
    return {
      topic: T.conditions, text: 'Which of these are in equilibrium (ΣF = 0 and Στ = 0), and which aren’t? <span class="muted">Put each one on its side.</span>',
      answer: { kind: 'sort', sides: ['In equilibrium', 'Not in equilibrium'], items: six.map((x) => x[0]), correct: six.map((x) => x[1]) },
      tip: 'In equilibrium, nothing starts to move off or turn.',
      solution: `In equilibrium, nothing starts to move off or turn: ${on(0)}. Not in equilibrium, since something starts to move or turn: ${on(1)}.`,
      meta: { type: 'eq-sort', in: { items: six.map((x) => x[0]) } },
    };
  },

  // 5. balancing a light plank on a pivot: m₁d₁ = m₂d₂ (Στ = 0 about the pivot, and g cancels)
  (d, ctx) => {
    const type = ctx.k % 4, j = Math.floor(ctx.k / 4);
    if (type === 0) {
      const [m1, d1, d2] = turn(ctx, 4, [[12, 15, 16, 18, 20, 24, 25, 30, 36, 40], [1.5, 2, 2.4, 2.5, 3, 4], [1, 1.2, 1.5, 2, 2.5, 3, 4, 5]], (a, x, y) => x !== y && (a * x) / y >= 4 && (a * x) / y <= 80 && apart((a * x) / y, a, x, y));
      const m = (m1 * d1) / d2;
      return {
        topic: T.counter, text: `A light plank rests on a pivot. ${An(m1)} ${m1} kg box sits on it ${num(d1)} m to the right of the pivot. What mass, placed ${num(d2)} m to the left of the pivot, balances it?`,
        figure: beam({ length: d1 + d2, pivot: d2, loads: [{ x: 0, label: '?' }, { x: d1 + d2, label: `${m1} kg` }], dims: [{ from: 0, to: d2, label: `${num(d2)} m` }, { from: d2, to: d1 + d2, label: `${num(d1)} m` }], label: 'a light plank on a pivot with a box and a counterweight' }),
        answer: numAns(m, 'kg'),
        solution: `For the plank, take torques about the pivot, counterclockwise +: Στ = mg(${num(d2)}) − ${m1}g(${num(d1)}) = 0. g cancels, so m = ${m1} × ${num(d1)} ÷ ${num(d2)} = <b>${val(m)} kg</b>.`,
        meta: { type: 'counterweight', in: { m1, d1, d2 } },
      };
    }
    if (type === 1) {
      const [m1, d1, m2, d2, d3] = turn(ctx, 4, [[30, 32, 35, 40], [1.5, 2, 2.5], [30, 36, 42, 45], [0.5, 0.6, 0.7], [1.5, 2, 2.4, 2.5]], (a, x, b, y, z) => {
        const m = (a * x + b * y) / z;
        return a !== b && m >= 30 && m <= 90 && apart(m, a, x, b, y, z);
      });
      const m3 = (m1 * d1 + m2 * d2) / d3;
      return {
        topic: T.counter, text: `Two children sit on the right side of a seesaw pivoted at its middle: one of ${m1} kg, ${num(d1)} m from the pivot, and one of ${m2} kg, ${num(d2)} m from it. What mass must a person sitting ${num(d3)} m left of the pivot have, to balance them?`,
        figure: seesaw([{ at: -d3, label: '?' }, { at: d2, label: `${m2} kg` }, { at: d1, label: `${m1} kg` }], [[-d3, `${num(d3)} m`], [d2, `${num(d2)} m`], [d1, `${num(d1)} m`]], 'two children on one side of a seesaw and a person on the other'),
        answer: numAns(m3, 'kg'),
        solution: `The plank’s own weight acts at the pivot, so it gives no torque. Torques about the pivot, counterclockwise +: Στ = mg(${num(d3)}) − ${m1}g(${num(d1)}) − ${m2}g(${num(d2)}) = 0. g cancels: m = (${m1} × ${num(d1)} + ${m2} × ${num(d2)}) ÷ ${num(d3)} = <b>${val(m3)} kg</b>.`,
        meta: { type: 'two-one-side', in: { m1, d1, m2, d2, d3 } },
      };
    }
    if (type === 2) {
      if (j % 2 === 0) {
        const [m1, d1, d2] = turn(ctx, 4, [[10, 12, 15, 20, 25, 30], [1, 1.5, 2, 2.5, 3], [0.8, 1.2, 1.5, 2, 4]], (a, x, y) => x !== y && apart((a * G * x) / y, a, x, y), '-kg');
        const W = (m1 * G * d1) / d2;
        return {
          topic: T.counter, text: `${An(m1)} ${m1} kg box sits ${num(d1)} m to the right of the pivot of a light plank. What must a counterweight ${num(d2)} m to the left of the pivot weigh, in N, to balance it?`,
          figure: beam({ length: d1 + d2, pivot: d2, loads: [{ x: 0, label: '?' }, { x: d1 + d2, label: `${m1} kg` }], dims: [{ from: 0, to: d2, label: `${num(d2)} m` }, { from: d2, to: d1 + d2, label: `${num(d1)} m` }], label: 'a light plank on a pivot with a box and a counterweight' }),
          answer: numAns(W, 'N'),
          solution: `Torques about the pivot, counterclockwise +: Στ = W(${num(d2)}) − ${m1} × 9.81 × ${num(d1)} = 0, so W = ${num(m1 * G * d1)} ÷ ${num(d2)} = <b>${val(W)} N</b>. (Its mass would be ${num(W / G)} kg.)`,
          meta: { type: 'counterweight-N', in: { m1, d1, d2 } },
        };
      }
      const [W1, d1, d2] = turn(ctx, 4, [[120, 150, 200, 240, 300, 360], [0.5, 0.6, 0.8, 1, 1.2], [0.4, 0.75, 1.5, 2]], (w, x, y) => apart((w * x) / y, w, x, y), '-N');
      const W = (W1 * d1) / d2;
      return {
        topic: T.counter, text: `${An(W1)} ${W1} N weight hangs ${num(d1)} m from the pivot of a light rod. What weight must hang ${num(d2)} m from the pivot, on the other side, to balance it?`,
        figure: beam({ length: d1 + d2, pivot: d2, loads: [{ x: 0, label: '?', hang: true }, { x: d1 + d2, label: `${W1} N`, hang: true }], dims: [{ from: 0, to: d2, label: `${num(d2)} m` }, { from: d2, to: d1 + d2, label: `${num(d1)} m` }], label: 'two weights hanging from a light rod on a pivot' }),
        answer: numAns(W, 'N'),
        solution: `Torques about the pivot, counterclockwise +: Στ = W(${num(d2)}) − ${W1}(${num(d1)}) = 0, so W = ${W1} × ${num(d1)} ÷ ${num(d2)} = <b>${val(W)} N</b>. With weights in N there’s no g to put in.`,
        meta: { type: 'weights-N', in: { W1, d1, d2 } },
      };
    }
    const [L, p, m] = turn(ctx, 4, [[3, 4, 5, 6], [0.8, 1, 1.2, 1.5, 2], [10, 12, 15, 18, 20, 24, 25]], (len, q, a) => {
      const mc = (a * (len - q)) / q;
      return q < len / 2 && mc >= 4 && mc <= 80 && apart(mc, len, q, a);
    });
    const mc = (m * (L - p)) / p;
    return {
      topic: T.counter, text: `A light plank ${L} m long rests on a pivot ${num(p)} m from its left end. ${An(m)} ${m} kg box sits on its right end. What mass on its left end balances it?`,
      figure: beam({ length: L, pivot: p, loads: [{ x: 0, label: '?' }, { x: L, label: `${m} kg` }], dims: [{ from: 0, to: p, label: `${num(p)} m` }, { from: 0, to: L, label: `${L} m` }], label: 'a light plank on a pivot near one end' }),
      answer: numAns(mc, 'kg'),
      solution: `The box is ${L} − ${num(p)} = ${num(L - p)} m from the pivot. Torques about the pivot, counterclockwise +: Στ = mg(${num(p)}) − ${m}g(${num(L - p)}) = 0, so m = ${m} × ${num(L - p)} ÷ ${num(p)} = <b>${val(mc)} kg</b>.`,
      meta: { type: 'from-the-ends', in: { L, p, m } },
    };
  },

  // 6. where to sit: the same balance, solved for a distance (the heavier one sits nearer the pivot)
  (d, ctx) => {
    const type = ctx.k % 4;
    if (type === 0) {
      const [m1, d1, m2] = turn(ctx, 4, [[30, 35, 40, 45, 50, 60], [1, 1.2, 1.5, 1.8, 2, 2.4], [32, 36, 48, 54, 64, 75]], (a, x, b) => a !== b && (a * x) / b >= 0.5 && (a * x) / b <= SEE && apart((a * x) / b, a, x, b));
      const d2 = (m1 * d1) / m2;
      return {
        topic: T.sit, text: `${An(m1)} ${m1} kg ${person(m1)} sits ${num(d1)} m from the pivot of a seesaw pivoted at its middle. How far from the pivot, on the other side, must ${an(m2)} ${m2} kg ${person(m2)} sit to balance it?`,
        figure: seesaw([{ at: -d2, label: `${m2} kg` }, { at: d1, label: `${m1} kg` }], [[-d2, '?'], [d1, `${num(d1)} m`]], 'two people on a seesaw'),
        answer: numAns(d2, 'm'),
        solution: `Torques about the pivot, counterclockwise +: Στ = ${m2}g(d) − ${m1}g(${num(d1)}) = 0 (the plank’s own weight acts at the pivot). g cancels: d = ${m1} × ${num(d1)} ÷ ${m2} = <b>${val(d2)} m</b>.`,
        meta: { type: 'where-to-sit', in: { m1, d1, m2 } },
      };
    }
    if (type === 1) {
      const [m1, d1, m2, d2, m3] = turn(ctx, 4, [[30, 35, 40], [1.5, 2, 2.5], [30, 32, 45], [0.5, 0.6, 0.7], [60, 70, 75, 80, 90]], (a, x, b, y, c) => {
        const z = (a * x + b * y) / c;
        return a !== b && z >= 0.5 && z <= SEE && apart(z, a, x, b, y, c);
      });
      const d3 = (m1 * d1 + m2 * d2) / m3;
      return {
        topic: T.sit, text: `Two children sit on the right side of a seesaw pivoted at its middle: one of ${m1} kg, ${num(d1)} m from the pivot, and one of ${m2} kg, ${num(d2)} m from it. How far left of the pivot must ${an(m3)} ${m3} kg adult sit to balance them?`,
        figure: seesaw([{ at: -d3, label: `${m3} kg` }, { at: d2, label: `${m2} kg` }, { at: d1, label: `${m1} kg` }], [[-d3, '?'], [d2, `${num(d2)} m`], [d1, `${num(d1)} m`]], 'two children on one side of a seesaw and an adult on the other'),
        answer: numAns(d3, 'm'),
        solution: `Torques about the pivot, counterclockwise +: Στ = ${m3}g(d) − ${m1}g(${num(d1)}) − ${m2}g(${num(d2)}) = 0. g cancels: d = (${m1} × ${num(d1)} + ${m2} × ${num(d2)}) ÷ ${m3} = <b>${val(d3)} m</b>.`,
        meta: { type: 'three-people', in: { m1, d1, m2, d2, m3 } },
      };
    }
    if (type === 2) {
      const [m1, d1, m2, d2, m3] = turn(ctx, 4, [[30, 35, 40, 45], [1, 1.5, 2, 2.5], [30, 36, 50, 60], [1, 1.2, 1.5, 2], [32, 38, 42]], (a, x, b, y, c) => {
        const gap = a * x - b * y, z = Math.abs(gap) / c, there = gap > 0 ? y : x;
        return a !== b && c !== a && c !== b && Math.abs(gap) >= 10 && z >= 0.5 && z <= SEE && Math.abs(z - there) >= 0.6 && apart(z, a, x, b, y, c);
      });
      const L = m1 * d1, R = m2 * d2, d3 = Math.abs(L - R) / m3, side = L > R ? 'right' : 'left';
      return {
        topic: T.sit, text: `On a seesaw pivoted at its middle, ${an(m1)} ${m1} kg child sits ${num(d1)} m left of the pivot and ${an(m2)} ${m2} kg ${person(m2)} sits ${num(d2)} m right of it. A third child, of ${m3} kg, gets on to balance it. How far from the pivot must they sit?`,
        figure: seesaw([{ at: -d1, label: `${m1} kg` }, { at: d2, label: `${m2} kg` }], [[-d1, `${num(d1)} m`], [d2, `${num(d2)} m`]], 'a seesaw that doesn’t balance yet'),
        answer: numAns(d3, 'm'),
        solution: `Compare mass × distance on each side (g cancels): left ${m1} × ${num(d1)} = ${num(L)}, right ${m2} × ${num(d2)} = ${num(R)}. The ${side} side is short by ${num(Math.abs(L - R))}, so the ${m3} kg child sits on the ${side}, where ${m3} × d = ${num(Math.abs(L - R))}: d = <b>${val(d3)} m</b>.`,
        meta: { type: 'third-person', in: { m1, d1, m2, d2, m3 } },
      };
    }
    const [m1, d1, m2, m3] = turn(ctx, 4, [[30, 32, 35, 40], [1, 1.2, 1.5, 1.8, 2], [36, 40, 45, 50, 60], [45, 48, 50, 55, 60, 65]], (a, x, b, c) => {
      const before = (a * x) / b, after = (c * x) / b, move = after - before;
      return c >= a + 5 && b !== a && b !== c && before >= 0.5 && after <= SEE && move >= 0.2 && apart(move, a, x, b, c);
    });
    const before = (m1 * d1) / m2, after = (m3 * d1) / m2, move = after - before;
    return {
      topic: T.sit, text: `On a seesaw pivoted at its middle, ${an(m1)} ${m1} kg child sitting ${num(d1)} m from the pivot balances ${an(m2)} ${m2} kg ${person(m2)} on the other side. Then ${an(m3)} ${m3} kg ${person(m3)} takes the ${m1} kg child’s place, at the same spot. How much farther from the pivot must the ${m2} kg ${person(m2)} move to balance it again?`,
      figure: seesaw([{ at: -before, label: `${m2} kg` }, { at: d1, label: `${m1} kg` }], [[d1, `${num(d1)} m`]], 'a balanced seesaw before the swap'),
      answer: numAns(move, 'm'),
      solution: `Balanced, mass × distance is the same on both sides (g cancels). Before: ${m2} × d = ${m1} × ${num(d1)}, so d = ${num(before, 3)} m. After: ${m2} × d = ${m3} × ${num(d1)}, so d = ${num(after, 3)} m. They move <b>${val(move)} m</b> farther out.`,
      meta: { type: 'move-out', in: { m1, d1, m2, m3 } },
    };
  },

  // 7. the center of gravity: x = Σmx ÷ Σm from one end; a uniform beam's weight at its middle; a pivot there balances it
  (d, ctx) => {
    const type = ctx.k % 4, j = Math.floor(ctx.k / 4);
    if (type === 0) {
      const [L, m1, m2] = turn(ctx, 4, [[1, 1.2, 1.5, 2, 2.4, 3], [2, 3, 4, 5, 6, 8, 10], [1, 2, 3, 5, 6, 9, 12]], (len, a, b) => a !== b && apart((b * len) / (a + b), len, a, b));
      const x = (m2 * L) / (m1 + m2);
      return {
        topic: T.cg, text: `A light rod ${num(L)} m long has ${an(m1)} ${m1} kg mass hanging from its left end and ${an(m2)} ${m2} kg mass from its right end. How far from the left end is their center of gravity?`,
        figure: beam({ length: L, loads: [{ x: 0, label: `${m1} kg`, hang: true }, { x: L, label: `${m2} kg`, hang: true }], dims: [{ from: 0, to: L, label: `${num(L)} m` }], label: 'two masses hanging from the ends of a light rod' }),
        answer: numAns(x, 'm'),
        solution: `Measuring from the left end: x = (m₁x₁ + m₂x₂) ÷ (m₁ + m₂) = (${m1} × 0 + ${m2} × ${num(L)}) ÷ (${m1} + ${m2}) = <b>${val(x)} m</b>, nearer the heavier mass.`,
        meta: { type: 'cg-two', in: { L, m1, m2 } },
      };
    }
    if (type === 1) {
      const [L, m1, m2, x2, m3] = turn(ctx, 4, [[1, 1.2, 1.5, 2, 3], [2, 3, 4, 5], [1, 2, 6, 8], [0.3, 0.4, 0.5, 0.6, 0.8, 1, 1.2], [3, 5, 7, 10]], (len, a, b, p, c) => {
        // (the middle mass at least a fifth of the rod from the left end, so the left mass's label doesn't run into its box)
        const x = (b * p + c * len) / (a + b + c);
        return p >= 0.3 && p / len >= 0.2 && p <= len - 0.3 && new Set([a, b, c]).size === 3 && apart(x, len, a, b, p, c);
      });
      const x = (m2 * x2 + m3 * L) / (m1 + m2 + m3);
      return {
        topic: T.cg, text: `A light rod ${num(L)} m long carries three masses: ${m1} kg at its left end, ${m2} kg ${num(x2)} m from its left end, and ${m3} kg at its right end. How far from the left end is their center of gravity?`,
        figure: beam({ length: L, loads: [{ x: 0, label: `${m1} kg`, hang: true }, { x: x2, label: `${m2} kg`, hang: true }, { x: L, label: `${m3} kg`, hang: true }], dims: [{ from: 0, to: x2, label: `${num(x2)} m` }, { from: 0, to: L, label: `${num(L)} m` }], label: 'three masses hanging from a light rod' }),
        answer: numAns(x, 'm'),
        solution: `x = (m₁x₁ + m₂x₂ + m₃x₃) ÷ (m₁ + m₂ + m₃) = (${m1} × 0 + ${m2} × ${num(x2)} + ${m3} × ${num(L)}) ÷ (${m1} + ${m2} + ${m3}) = <b>${val(x)} m</b> from the left end.`,
        meta: { type: 'cg-three', in: { L, m1, m2, x2, m3 } },
      };
    }
    if (type === 2 && j % 2 === 0) {
      const [L, m1, x1, m2, x2] = turn(ctx, 4, [[1.5, 2, 2.5, 3], [2, 3, 4, 6, 8], [0.2, 0.3, 0.4, 0.5], [3, 5, 7, 10], [1.2, 1.5, 1.8, 2.5, 3]], (len, a, p, b, q) => q <= len && q - p >= 0.8 && a !== b && apart((a * p + b * q) / (a + b), len, a, p, b, q), '-hung');
      const x = (m1 * x1 + m2 * x2) / (m1 + m2), at2 = x2 === L ? 'from its right end' : `${num(x2)} m from its left end`;
      return {
        topic: T.cg, text: `A light rod ${num(L)} m long has ${an(m1)} ${m1} kg mass hanging ${num(x1)} m from its left end and ${an(m2)} ${m2} kg mass hanging ${at2}. Where must a pivot go, measured from the left end, for the rod to balance on it?`,
        figure: beam({ length: L, loads: [{ x: x1, label: `${m1} kg`, hang: true }, { x: x2, label: `${m2} kg`, hang: true }], dims: [{ from: 0, to: x1, label: `${num(x1)} m` }, ...(x2 === L ? [] : [{ from: 0, to: x2, label: `${num(x2)} m` }]), { from: 0, to: L, label: `${num(L)} m` }], label: 'two masses hanging from a light rod' }),
        answer: numAns(x, 'm'),
        solution: `It balances on the center of gravity, where the torques of the two weights about it cancel: x = (m₁x₁ + m₂x₂) ÷ (m₁ + m₂) = (${m1} × ${num(x1)} + ${m2} × ${num(x2)}) ÷ (${m1} + ${m2}) = <b>${val(x)} m</b> from the left end.`,
        meta: { type: 'pivot-rod', in: { L, m1, x1, m2, x2 } },
      };
    }
    if (type === 2) {
      const [L, M, m] = turn(ctx, 4, [[2, 3, 4, 5, 6], [5, 8, 10, 12, 15, 20], [2, 4, 5, 6, 10, 15]], (len, b, a) => apart((b * len / 2 + a * len) / (b + a), len, b, a), '-plank');
      const x = ((M * L) / 2 + m * L) / (M + m);
      return {
        topic: T.cg, text: `A uniform plank ${L} m long has a mass of ${M} kg, and ${an(m)} ${m} kg box sits on its right end. Where must a pivot go, measured from the left end, for the plank to balance on it?`,
        figure: beam({ length: L, loads: [{ x: L, label: `${m} kg` }], weight: { x: L / 2, label: `${M} kg × g` }, dims: [{ from: 0, to: L, label: `${L} m` }], label: 'a uniform plank with a box on one end' }),
        answer: numAns(x, 'm'),
        solution: `The plank’s weight acts at its middle, ${num(L / 2)} m from the left end. It balances on the center of gravity of plank and box: x = (${M} × ${num(L / 2)} + ${m} × ${L}) ÷ (${M} + ${m}) = <b>${val(x)} m</b> from the left end. (About that point, the torques cancel.)`,
        meta: { type: 'pivot-to-balance', in: { L, M, m } },
      };
    }
    const L = [6, 5, 5, 8, 3][j], M = [20, 15, 12, 25, 10][j], p = [1.5, 1.2, 1.5, 2, 1][j];
    if (j === 0) {
      const right = `At its middle, ${num(L / 2)} m from each end`;
      return {
        topic: T.cg, text: `A uniform beam ${L} m long rests on a support under each end. Where can its whole weight be taken to act?`,
        figure: beam({ length: L, pivots: [0, L], dims: [{ from: 0, to: L, label: `${L} m` }], label: 'a uniform beam on two supports' }),
        answer: oneOf(d, right, ['Half at each end, over the supports', 'At whichever end is lower', 'Nowhere in particular: it’s spread along the beam, so it gives no torque']),
        solution: `A uniform beam’s center of gravity is at its middle, so for forces and torques its whole weight acts there: <b>${right.toLowerCase()}</b>.`,
        meta: { type: 'cg-uniform', in: { L } },
      };
    }
    if (j === 1) {
      const right = `At its middle, ${num(L / 2 - p)} m right of the pivot`;
      return {
        topic: T.cg, text: `A uniform beam ${L} m long rests on a pivot ${num(p)} m from its left end. Where does its weight act, for working out torques about the pivot?`,
        figure: beam({ length: L, pivot: p, dims: [{ from: 0, to: p, label: `${num(p)} m` }, { from: 0, to: L, label: `${L} m` }], label: 'a uniform beam on a pivot near one end' }),
        answer: oneOf(d, right, ['At the pivot, so it gives no torque', `At its right end, ${num(L - p)} m from the pivot`, `At its left end, ${num(p)} m from the pivot`]),
        solution: `Its weight acts at its middle, ${num(L / 2)} m from the left end, which is ${num(L / 2)} − ${num(p)} = ${num(L / 2 - p)} m right of the pivot, so it gives a clockwise torque there: <b>${right.toLowerCase()}</b>.`,
        meta: { type: 'cg-off-pivot', in: { L, p } },
      };
    }
    if (j === 2) {
      const W = M * G, right = 'None: its weight acts right at the pivot';
      return {
        topic: T.cg, text: `A uniform plank ${L} m long, with a mass of ${M} kg, rests on a pivot at its middle. What torque does its own weight give about the pivot?`,
        figure: beam({ length: L, pivot: L / 2, dims: [{ from: 0, to: L, label: `${L} m` }], label: 'a uniform plank on a pivot at its middle' }),
        answer: oneOf(d, right, [`${num((W * L) / 2)} N·m`, `${num(W * L)} N·m`, `${num((W * L) / 4)} N·m`]),
        solution: `Its weight acts at its middle, right over the pivot: lever arm 0, so <b>no torque</b>. That’s why a seesaw’s plank drops out of the balance.`,
        meta: { type: 'cg-at-pivot', in: { L, M } },
      };
    }
    if (j === 3) {
      const right = 'Between its middle and its thick end';
      return {
        topic: T.cg, text: `A log ${L} m long is thicker, and heavier, at one end than at the other. Where is its center of gravity?`,
        answer: oneOf(d, right, ['At its middle, halfway along', 'Between its middle and its thin end', 'At the very end of its thick end']),
        solution: `More of its weight is toward the thick end, so the point where its whole weight can be taken to act is on that side of its middle: <b>between its middle and its thick end</b>, though not at the end itself. Only a uniform beam has it at its middle.`,
        meta: { type: 'cg-log', in: { L } },
      };
    }
    const x = round(L * 0.25, 2), right = 'Toward the box, but not all the way to it';
    return {
      topic: T.cg, text: `A uniform plank ${L} m long balances on a pivot at its middle. A box is put on it ${num(x)} m from its left end. Where must the pivot go now for the plank to balance?`,
      figure: beam({ length: L, pivot: L / 2, loads: [{ x, label: 'box' }], dims: [{ from: 0, to: x, label: `${num(x)} m` }, { from: 0, to: L, label: `${L} m` }], label: 'a uniform plank with a box on it' }),
      answer: oneOf(d, right, ['Away from the box', 'Nowhere new: it still balances at its middle', 'Right under the box']),
      solution: `The plank’s weight still acts at its middle, and the box’s at the box, so the center of gravity of the two together is between them. The pivot must go <b>toward the box, but not all the way to it</b>.`,
      meta: { type: 'cg-moves', in: { L, x } },
    };
  },

  // 8. a heavy beam on a pivot: its own weight acts at its middle, one more torque about the pivot
  (d, ctx) => {
    const type = ctx.k % 4;
    const lists = [[4, 5, 6, 8, 10], [1, 1.2, 1.5, 2, 2.5, 3], [10, 12, 15, 20, 25, 30, 40]];
    const fig = (L, p, left, right, w) => beam({ length: L, pivot: p, loads: [left != null && { x: 0, label: left }, right != null && { x: L, label: right }].filter(Boolean), weight: { x: L / 2, label: w }, dims: [{ from: 0, to: p, label: `${num(p)} m` }, { from: 0, to: L, label: `${L} m` }], label: 'a uniform beam on a pivot, its weight at its middle' });
    const mid = (L, p) => `The beam’s weight acts at its middle, ${num(L / 2)} m from the left end, so ${num(L / 2 - p)} m right of the pivot`;
    if (type === 0) {
      const [L, p, M, m] = turn(ctx, 4, [...lists, [5, 8, 10, 12, 15, 20]], (len, q, b, a) => {
        const mc = (a * (len - q) + b * (len / 2 - q)) / q;
        return q <= len / 2 - 0.5 && mc >= 5 && mc <= 80 && apart(mc, len, q, b, a);
      });
      const mc = (m * (L - p) + M * (L / 2 - p)) / p;
      return {
        topic: T.heavy, text: `A uniform beam ${L} m long, with a mass of ${M} kg, rests on a pivot ${num(p)} m from its left end. ${An(m)} ${m} kg load sits on its right end. What mass on its left end balances it?`,
        figure: fig(L, p, '?', `${m} kg`, `${M} kg × g`),
        answer: numAns(mc, 'kg'),
        solution: `${mid(L, p)}, and the load is ${num(L - p)} m right of it. Torques about the pivot, counterclockwise +: Στ = mg(${num(p)}) − ${m}g(${num(L - p)}) − ${M}g(${num(L / 2 - p)}) = 0. g cancels: m = (${m} × ${num(L - p)} + ${M} × ${num(L / 2 - p)}) ÷ ${num(p)} = <b>${val(mc)} kg</b>.`,
        meta: { type: 'heavy-counterweight', in: { L, p, M, m } },
      };
    }
    if (type === 1) {
      const [L, p, M, mc] = turn(ctx, 4, [...lists, [20, 25, 30, 40, 50, 60, 75]], (len, q, b, c) => {
        const m = (c * q - b * (len / 2 - q)) / (len - q);
        return q <= len / 2 - 0.5 && m >= 3 && m <= 80 && apart(m, len, q, b, c);
      });
      const m = (mc * p - M * (L / 2 - p)) / (L - p);
      return {
        topic: T.heavy, text: `A uniform beam ${L} m long, with a mass of ${M} kg, rests on a pivot ${num(p)} m from its left end, with ${an(mc)} ${mc} kg mass on its left end. What load on its right end balances it?`,
        figure: fig(L, p, `${mc} kg`, '?', `${M} kg × g`),
        answer: numAns(m, 'kg'),
        solution: `${mid(L, p)}. Torques about the pivot, counterclockwise +: Στ = ${mc}g(${num(p)}) − mg(${num(L - p)}) − ${M}g(${num(L / 2 - p)}) = 0. g cancels: m = (${mc} × ${num(p)} − ${M} × ${num(L / 2 - p)}) ÷ ${num(L - p)} = <b>${val(m)} kg</b>.`,
        meta: { type: 'heavy-load', in: { L, p, M, mc } },
      };
    }
    if (type === 2) {
      const [L, p, mc, m] = turn(ctx, 4, [lists[0], lists[1], [20, 25, 30, 40, 50, 60, 75], [2, 3, 4, 5, 6, 8, 10]], (len, q, c, a) => {
        const M = (c * q - a * (len - q)) / (len / 2 - q);
        return q <= len / 2 - 0.5 && M >= 5 && M <= 80 && apart(M, len, q, c, a);
      });
      const M = (mc * p - m * (L - p)) / (L / 2 - p);
      return {
        topic: T.heavy, text: `A uniform beam ${L} m long rests on a pivot ${num(p)} m from its left end. It balances with ${mc} kg on its left end and ${m} kg on its right end. What is the beam’s mass, M?`,
        figure: fig(L, p, `${mc} kg`, `${m} kg`, 'Mg'),
        answer: numAns(M, 'kg'),
        solution: `Its weight, Mg, acts at its middle, ${num(L / 2 - p)} m right of the pivot. Torques about the pivot, counterclockwise +: Στ = ${mc}g(${num(p)}) − ${m}g(${num(L - p)}) − Mg(${num(L / 2 - p)}) = 0. g cancels: M = (${mc} × ${num(p)} − ${m} × ${num(L - p)}) ÷ ${num(L / 2 - p)} = <b>${val(M)} kg</b>.`,
        meta: { type: 'heavy-mass', in: { L, p, mc, m } },
      };
    }
    const [L, p, M] = turn(ctx, 4, lists, (len, q, b) => q <= len / 2 - 0.5 && apart(b * G * (len / 2 - q), len, q, b));
    const tau = M * G * (L / 2 - p);
    return {
      topic: T.heavy, text: `A uniform beam ${L} m long, with a mass of ${M} kg, rests on a pivot ${num(p)} m from its left end. How big a torque does the beam’s own weight give about the pivot?`,
      figure: fig(L, p, null, null, `${M} kg × g`),
      answer: numAns(tau, 'N·m'),
      solution: `Its weight, ${M} × 9.81 = ${num(M * G)} N, acts at its middle, ${num(L / 2)} m from the left end, so its lever arm is ${num(L / 2)} − ${num(p)} = ${num(L / 2 - p)} m: τ = Wl = ${num(M * G)} × ${num(L / 2 - p)} = <b>${val(tau)} N·m</b>, clockwise.`,
      meta: { type: 'beam-torque', in: { L, p, M } },
    };
  },

  // 9. the push of the supports: ΣF = 0, so they hold up all the weight; with two, torques about one give the other's
  (d, ctx) => {
    const type = ctx.k % 4, j = Math.floor(ctx.k / 4);
    if (type === 0) {
      // (balanced sets: m₁d₁ = m₂d₂, and the plank's mass)
      const [[m1, d1, m2, d2, M]] = turn(ctx, 4, [[[30, 2, 40, 1.5, 15], [36, 2.5, 45, 2, 20], [40, 1.8, 48, 1.5, 18], [30, 2.4, 45, 1.6, 25], [35, 2, 50, 1.4, 30], [32, 2.5, 40, 2, 22], [42, 2, 60, 1.4, 20], [45, 2, 75, 1.2, 28]]],
        ([a, x, b, y, c]) => apart((a + b + c) * G, a, x, b, y, c));
      const N = (m1 + m2 + M) * G;
      return {
        topic: T.supports, text: `${An(m1)} ${m1} kg child sits ${num(d1)} m left of a seesaw’s pivot and ${an(m2)} ${m2} kg ${person(m2)} sits ${num(d2)} m right of it, and the seesaw balances. Its plank has a mass of ${M} kg, with its middle over the pivot. How hard does the pivot push up on the plank?`,
        figure: seesaw([{ at: -d1, label: `${m1} kg` }, { at: d2, label: `${m2} kg` }], [[-d1, `${num(d1)} m`], [d2, `${num(d2)} m`]], 'a balanced seesaw'),
        answer: numAns(N, 'N'),
        solution: `For the plank, up +: ΣF = N − ${m1}g − ${m2}g − ${M}g = 0, since it doesn’t start moving off. So N = (${m1} + ${m2} + ${M}) × 9.81 = <b>${val(N)} N</b>. The distances decide whether it turns, not how hard the pivot pushes.`,
        meta: { type: 'pivot-push', in: { m1, d1, m2, d2, M } },
      };
    }
    if (type === 1 || type === 2) {
      const [L, M, m, x] = turn(ctx, 4, [[2, 2.5, 3, 4, 5], [10, 12, 15, 20, 25], [30, 40, 50, 60, 70, 80], [0.5, 0.8, 1, 1.2, 1.5, 2]], (len, b, a, p) => {
        const NR = ((a * p + (b * len) / 2) * G) / len, NL = (a + b) * G - NR, N = type === 1 ? NR : NL;
        return p <= len - 0.5 && Math.abs(p - len / 2) > 1e-9 && apart(N, len, b, a, p);
      });
      const NR = ((m * x + (M * L) / 2) * G) / L, NL = (m + M) * G - NR;
      const text = `A uniform plank ${L} m long, with a mass of ${M} kg, rests on two trestles, one under each end. ${An(m)} ${m} kg painter stands on it ${num(x)} m from its left end. How hard does the ${type === 1 ? 'right' : 'left'}-hand trestle push up on the plank?`;
      const figure = beam({ length: L, pivots: [0, L], loads: [{ x, label: `${m} kg` }], weight: { x: L / 2, label: `${M} kg × g` }, dims: [{ from: 0, to: x, label: `${num(x)} m` }, { from: 0, to: L, label: `${L} m` }], label: 'a plank on two trestles with a painter on it' });
      const about = `Call the trestles’ pushes N₁ (left) and N₂ (right). Torques about the left trestle, where N₁ has no lever arm, counterclockwise +: Στ = N₂(${L}) − ${m}g(${num(x)}) − ${M}g(${num(L / 2)}) = 0`;
      return {
        topic: T.supports, text, figure,
        answer: numAns(type === 1 ? NR : NL, 'N'),
        solution: type === 1
          ? `${about}. So N₂ = (${m} × ${num(x)} + ${M} × ${num(L / 2)}) × 9.81 ÷ ${L} = <b>${val(NR)} N</b>.`
          : `${about}, so N₂ = (${m} × ${num(x)} + ${M} × ${num(L / 2)}) × 9.81 ÷ ${L} = ${num(NR)} N. Then ΣF = 0 for the plank, up +: N₁ + N₂ − (${m} + ${M}) × 9.81 = 0, so N₁ = ${num((m + M) * G)} − ${num(NR)} = <b>${val(NL)} N</b>.`,
        meta: { type: type === 1 ? 'support-far' : 'support-near', in: { L, M, m, x } },
      };
    }
    const right = j % 2 === 0;
    const [L, a, c, M, m, x] = turn(ctx, 4, [[4, 5, 6], [0.5, 0.8, 1], [0.5, 0.8, 1], [15, 20, 25, 30], [40, 50, 60, 70, 80], [1.5, 2, 2.5, 3, 3.5]], (len, p, q, b, w, s) => {
      const B = len - q, NR = ((w * (s - p) + b * (len / 2 - p)) * G) / (B - p), NL = ((w * (B - s) + b * (B - len / 2)) * G) / (B - p);
      return s >= p + 0.4 && s <= B - 0.4 && Math.abs(s - len / 2) > 1e-9 && apart(NR, len, p, q, b, w, s) && apart(NL, len, p, q, b, w, s);
    });
    const B = L - c, span = B - a, NR = ((m * (x - a) + M * (L / 2 - a)) * G) / span, NL = ((m * (B - x) + M * (B - L / 2)) * G) / span;
    return {
      topic: T.supports, text: `A uniform plank ${L} m long, with a mass of ${M} kg, rests on two supports: one ${num(a)} m from its left end and one ${num(c)} m from its right end. ${An(m)} ${m} kg person stands ${num(x)} m from the left end. How hard does the ${right ? 'right' : 'left'}-hand support push up on the plank?`,
      figure: beam({ length: L, pivots: [a, B], loads: [{ x, label: `${m} kg` }], weight: { x: L / 2, label: `${M} kg × g` }, dims: [{ from: 0, to: a, label: `${num(a)} m` }, { from: B, to: L, label: `${num(c)} m` }, { from: 0, to: x, label: `${num(x)} m` }, { from: 0, to: L, label: `${L} m` }], label: 'a plank on two supports set in from its ends, with a person on it' }),
      answer: numAns(right ? NR : NL, 'N'),
      solution: right
        ? `The supports are ${num(a)} m and ${num(B)} m from the left end, ${num(span)} m apart. Torques about the left support, counterclockwise +: Στ = N(${num(span)}) − ${m}g(${num(x - a)}) − ${M}g(${num(L / 2 - a)}) = 0, so N = (${m} × ${num(x - a)} + ${M} × ${num(L / 2 - a)}) × 9.81 ÷ ${num(span)} = <b>${val(NR)} N</b>.`
        : `The supports are ${num(a)} m and ${num(B)} m from the left end, ${num(span)} m apart. Torques about the right support, counterclockwise +: Στ = ${m}g(${num(B - x)}) + ${M}g(${num(B - L / 2)}) − N(${num(span)}) = 0, so N = (${m} × ${num(B - x)} + ${M} × ${num(B - L / 2)}) × 9.81 ÷ ${num(span)} = <b>${val(NL)} N</b>.`,
      meta: { type: right ? 'inset-right' : 'inset-left', in: { L, a, c, M, m, x } },
    };
  },

  // 10. a beam hinged to a wall and held level by a cable: torques about the hinge, (T sin θ)d = mgL + Mg(L/2)
  (d, ctx) => {
    const type = ctx.k % 4;
    const beamOut = (L, M) => `A uniform beam ${L} m long, with a mass of ${M} kg, sticks out level from a wall, hinged at one end`;
    const fig = (L, M, d0, a, load, cab, dims) => beam({ length: L, hinge: true, loads: [{ x: L, label: load, hang: true }], weight: { x: L / 2, label: `${M} kg × g` }, cable: { x: d0, angle: a, label: cab }, dims, label: 'a beam hinged to a wall, held level by a cable, with a load hanging from its end' });
    const lists = [[2, 2.5, 3, 4, 5], [8, 10, 12, 15, 20]];
    if (type === 0) {
      const [L, M, m, d0, a] = turn(ctx, 4, [...lists, [10, 15, 20, 25, 30, 40], [1.5, 2, 2.5, 3, 4], [25, 30, 35, 40, 45, 50]], (len, b, w, q, t) => {
        const ten = ((w * len + (b * len) / 2) * G) / (q * sin(t));
        return q >= len / 2 && q <= len - 0.5 && tan(t) * (q / len) <= 0.9 && apart(ten, len, b, w, q, t);
      });
      const ten = ((m * L + (M * L) / 2) * G) / (d0 * sin(a));
      return {
        topic: T.cable, text: `${beamOut(L, M)}. A cable from the wall above the hinge holds it up, attached ${num(d0)} m from the hinge at ${a}° to the beam. ${An(m)} ${m} kg load hangs from the beam’s far end. What is the tension in the cable?`,
        figure: fig(L, M, d0, a, `${m} kg`, 'T', [{ from: 0, to: d0, label: `${num(d0)} m` }, { from: 0, to: L, label: `${L} m` }]),
        answer: numAns(ten, 'N'),
        solution: `For the beam, take torques about the hinge (the hinge’s own force has no lever arm there), counterclockwise +. Only T sin ${a}°, the part of the tension at right angles to the beam, turns it: Στ = (T sin ${a}°)(${num(d0)}) − (${m}g)(${L}) − (${M}g)(${num(L / 2)}) = 0. So T = (${m} × ${L} + ${M} × ${num(L / 2)}) × 9.81 ÷ (${num(d0)} × sin ${a}°) = <b>${val(ten)} N</b>.`,
        meta: { type: 'cable-tension', in: { L, M, m, d: d0, a } },
      };
    }
    if (type === 1) {
      const [L, M, m, a] = turn(ctx, 4, [...lists, [10, 15, 20, 25, 30, 40], [20, 25, 30, 35, 40]], (len, b, w, t) => apart(((w + b / 2) * G) / sin(t), len, b, w, t));
      const ten = ((m * L + (M * L) / 2) * G) / (L * sin(a));
      return {
        topic: T.cable, text: `${beamOut(L, M)}. A cable runs from the wall above the hinge to the beam’s far end, at ${a}° to the beam, and ${an(m)} ${m} kg load hangs from that end too. What is the tension in the cable?`,
        figure: fig(L, M, L, a, `${m} kg`, 'T', [{ from: 0, to: L, label: `${L} m` }]),
        answer: numAns(ten, 'N'),
        solution: `Torques about the hinge, counterclockwise +: Στ = (T sin ${a}°)(${L}) − (${m}g)(${L}) − (${M}g)(${num(L / 2)}) = 0. So T = (${m} × ${L} + ${M} × ${num(L / 2)}) × 9.81 ÷ (${L} × sin ${a}°) = <b>${val(ten)} N</b>. (The length cancels: T = (m + M/2)g ÷ sin θ.)`,
        meta: { type: 'cable-at-end', in: { L, M, m, a } },
      };
    }
    if (type === 2) {
      const [L, M, d0, a, Tmax] = turn(ctx, 4, [...lists, [1.5, 2, 2.5, 3, 4, 5], [25, 30, 35, 40, 45], [400, 500, 600, 800, 1000, 1200]], (len, b, q, t, top) => {
        const m = (top * sin(t) * q - (b * G * len) / 2) / (G * len);
        return q >= len / 2 && q <= len && tan(t) * (q / len) <= 0.9 && m >= 5 && m <= 80 && apart(m, len, b, q, t, top);
      });
      const m = (Tmax * sin(a) * d0 - (M * G * L) / 2) / (G * L), at = d0 === L ? 'attached to its far end' : `attached ${num(d0)} m from the hinge`;
      return {
        topic: T.cable, text: `${beamOut(L, M)}, and is held up by a cable from the wall above the hinge, ${at}, at ${a}° to the beam. The cable’s tension T can be at most ${Tmax} N. What is the heaviest load that can hang from the beam’s far end?`,
        figure: fig(L, M, d0, a, '?', 'T', d0 === L ? [{ from: 0, to: L, label: `${L} m` }] : [{ from: 0, to: d0, label: `${num(d0)} m` }, { from: 0, to: L, label: `${L} m` }]),
        answer: numAns(m, 'kg'),
        solution: `At the limit T = ${Tmax} N. Torques about the hinge, counterclockwise +: Στ = (${Tmax} sin ${a}°)(${num(d0)}) − (m × 9.81)(${L}) − (${M} × 9.81)(${num(L / 2)}) = 0. So m = (${Tmax} × sin ${a}° × ${num(d0)} − ${M} × 9.81 × ${num(L / 2)}) ÷ (9.81 × ${L}) = <b>${val(m)} kg</b>.`,
        meta: { type: 'cable-max-load', in: { L, M, d: d0, a, Tmax } },
      };
    }
    const [L, M, m, a, Tn] = turn(ctx, 4, [...lists, [10, 15, 20, 25, 30, 40], [25, 30, 35, 40, 45], [400, 500, 600, 800, 1000, 1200]], (len, b, w, t, top) => {
      const q = ((w * len + (b * len) / 2) * G) / (top * sin(t));
      return q >= 0.4 * len && q <= len - 0.2 && tan(t) * (q / len) <= 0.9 && apart(q, len, b, w, t, top);
    });
    const d0 = ((m * L + (M * L) / 2) * G) / (Tn * sin(a));
    return {
      topic: T.cable, text: `${beamOut(L, M)}, with ${an(m)} ${m} kg load hanging from its far end. A cable from the wall above the hinge will hold it up, pulling at ${a}° to the beam with a tension of ${Tn} N. How far from the hinge must the cable be attached?`,
      figure: fig(L, M, d0, a, `${m} kg`, `${Tn} N`, [{ from: 0, to: d0, label: '?' }, { from: 0, to: L, label: `${L} m` }]),
      answer: numAns(d0, 'm'),
      solution: `Torques about the hinge, counterclockwise +: Στ = (${Tn} sin ${a}°)(d) − (${m}g)(${L}) − (${M}g)(${num(L / 2)}) = 0. So d = (${m} × ${L} + ${M} × ${num(L / 2)}) × 9.81 ÷ (${Tn} × sin ${a}°) = <b>${val(d0)} m</b> from the hinge.`,
      meta: { type: 'cable-where', in: { L, M, m, a, T: Tn } },
    };
  },
];

export const torqueBank = bank('torque', templates, templates.length * 20);
