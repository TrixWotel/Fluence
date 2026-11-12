// Forces and Newton’s Laws: 11 topics, 20 variants each (220). What a force can do and the net force on a body; Newton’s
// three laws (inertia, ΣF = ma and how the acceleration changes with the force and the mass, action and reaction); the
// kinds of force (weight, the normal force, friction and tension); and falling with and without air resistance. Every
// topic is asked in several ways (a situation to explain, things to match or sort, numbers to work out), and most of the
// numbers come with a free-body diagram or the scene from mech.js. The class uses g = 9.81 m/s², so this does too.
import { bank, combo, graph, num, round } from '../kit/bank.js';
import { fbd, floor, slope } from './mech.js';

const G = 9.81;
const numAns = (value, unit, tol = 0.02) => ({ kind: 'number', value: round(value, 4), unit, tol });
// a topic's question types take turns (variant k is type k % types), each walking through its own number combinations
const turn = (ctx, types, lists, ok) => combo({ ...ctx, k: Math.floor(ctx.k / types), salt: `${ctx.salt}-${ctx.k % types}` }, lists, ok);
// (a type that asks two ways, each with its own lists, gives each its own tag: combo() remembers a salt's combinations)
const turnAs = (ctx, types, tag, lists, ok) => turn({ ...ctx, salt: `${ctx.salt}${tag}` }, types, lists, ok);
// the right answer among wrong ones, in an order that's shuffled but the same every time for that variant
const oneOf = (d, right, wrongs) => { const list = d.shuffle([right, ...wrongs]); return { kind: 'choice', choices: list, correct: list.indexOf(right) }; };
// choose all that fit: every right one among the wrong ones
const allOf = (d, rights, wrongs) => { const list = d.shuffle([...rights, ...wrongs]); return { kind: 'multi', choices: list, correct: rights.map((r) => list.indexOf(r)).sort((a, b) => a - b) }; };
// match each one on the left ([left, right] pairs) to what goes with it, both sides shuffled
const pairUp = (d, pairs) => { const left = d.shuffle(pairs), right = d.shuffle(pairs.map((p) => p[1])); return { kind: 'match', left: left.map((p) => p[0]), right, correct: left.map((p) => right.indexOf(p[1])) }; };
// sort each one ([text, 0 or 1]) onto its side
const sortOut = (d, sides, items) => { const list = d.shuffle(items); return { kind: 'sort', sides, items: list.map((x) => x[0]), correct: list.map((x) => x[1]) }; };
// steps (given in the right order) to put in order, never shown in order already
const inOrder = (d, steps) => { let list; do list = d.shuffle(steps); while (list.every((x, i) => x === steps[i])); return { kind: 'order', items: list, correct: steps.map((x) => list.indexOf(x)) }; };
// (no answer within 3% of a number the question gives, so copying one out of the question isn't marked right)
const apart = (answer, ...given) => given.every((x) => Math.abs(Math.abs(answer) - Math.abs(x)) > 0.03 * Math.abs(answer));
// (numbers offered as choices: each at least 5% from every other)
const spread = (...xs) => xs.every((x, i) => xs.every((y, k) => i === k || Math.abs(x - y) > 0.05 * Math.max(Math.abs(x), Math.abs(y))));
// an answer as the solution shows it: two decimals, or three below 1 (so a copied answer is always well inside the 2%)
const ans = (x) => num(x, Math.abs(x) < 1 ? 3 : 2);
const rad = (a) => (a * Math.PI) / 180;
const sin = (a) => Math.sin(rad(a)), cos = (a) => Math.cos(rad(a));
const listing = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);
const low = (s) => s[0].toLowerCase() + s.slice(1);
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const bold = (xs) => listing(xs.map((x) => `<b>“${x}”</b>`));
const quoted = (xs) => listing(xs.map((x) => `“${x}”`));
// which right and wrong ones a choose-all question shows, its four times round: 3 + 2, 2 + 3, 3 + 2, 2 + 3, each time
// from a new place in the lists (of six each)
const fours = (j, rights, wrongs) => [some(rights, [0, 3, 1, 4][j], j % 2 === 0 ? 3 : 2), some(wrongs, [0, 2, 4, 1][j], j % 2 === 0 ? 2 : 3)];
// a free-body diagram from [angle, size, label] (angles counterclockwise from the right: 0 right, 90 up, 180 left, 270 down)
const forces = (list, label) => fbd({ forces: list.map(([angle, size, text]) => ({ angle, size, label: text })), label });
// a few of a list, starting at `from` and wrapping round
const some = (list, from, n) => Array.from({ length: n }, (_, i) => list[(from + i) % list.length]);
const range = (n) => [...Array(n).keys()];
// "a 8 kg box" reads "an 8 kg box", like 11, 18 and 80–89 (said eleven, eighteen, eighty…): fixed in everything a
// question shows, whatever its template wrote
const vowel = (n) => { const int = n.replace(/,/g, '').split('.')[0]; return /^8/.test(int) || /^1[18](\d{3})?$/.test(int); };
const articles = (s) => s.replace(/\b([Aa]) (\d[\d,]*(?:\.\d+)?)(?=[\s°])/g, (all, a, n) => (vowel(n) ? `${a}n ${n}` : all));
const tidy = (q) => {
  const fix = (x) => (typeof x === 'string' ? articles(x) : Array.isArray(x) ? x.map(fix) : x);
  const answer = Object.fromEntries(Object.entries(q.answer).map(([k, v]) => [k, ['choices', 'items', 'left', 'right'].includes(k) ? fix(v) : v]));
  return { ...q, text: fix(q.text), solution: fix(q.solution), ...(q.tip ? { tip: fix(q.tip) } : {}), ...(q.figure ? { figure: fix(q.figure) } : {}), answer };
};

const T = {
  does: 'Dynamics and what a force can do', net: 'Net force: balanced and unbalanced',
  inertia: 'The law of inertia', fma: 'The law of acceleration: F = ma', scale: 'More force, more mass', pairs: 'The law of interaction',
  weight: 'Weight: W = mg', normal: 'The normal force', friction: 'Friction: f = μN', tension: 'Tension',
  fall: 'Falling with and without air resistance',
};

// what a force does to a body: [what happens, the body, why], for each of the four things it can do
const DOES = {
  shape: [
    ['You squeeze a rubber stress ball in your fist.', 'stress ball', 'it is squashed out of shape, but it doesn’t go anywhere'],
    ['You pull the two ends of a spring apart.', 'spring', 'it gets longer, but it stays in your hands'],
    ['You press a lump of clay down onto a table with your palm.', 'clay', 'it is pressed flat, but it stays on the table'],
    ['You set a heavy book down on a soft sponge.', 'sponge', 'it is squashed down, but it stays where it is'],
    ['You push the two ends of a plastic ruler toward each other.', 'ruler', 'it bends, but it stays in your hands'],
    ['You stand on an empty drink can.', 'can', 'it is crushed flat, but it stays where it is'],
  ],
  faster: [
    ['A shopping cart stands still until you give it a push.', 'cart', 'it was at rest, and the push gets it moving'],
    ['A gust of wind pushes a sailboat that was sitting still on a calm lake.', 'sailboat', 'it was at rest, and the wind’s push gets it moving'],
    ['A dog team starts pulling a sled that was standing still on the snow.', 'sled', 'it was at rest, and the pull gets it moving'],
    ['A tow truck’s cable starts pulling a parked van along a straight street.', 'van', 'it was parked, and the pull gets it moving along the street'],
    ['A rocket’s engines push it straight up off its launch pad.', 'rocket', 'it was at rest, and the push gets it moving faster and faster'],
    ['A crane starts to lift a crate straight up off the ground.', 'crate', 'it was at rest, and the pull gets it moving upward'],
  ],
  slower: [
    ['A cyclist riding along a straight road squeezes the brakes.', 'bicycle', 'the brakes act against its motion, and it stays on the same straight road'],
    ['A skydiver falling straight down opens her parachute.', 'skydiver', 'the parachute pulls up, against her motion, and she keeps falling straight down'],
    ['A catcher’s mitt catches a fast baseball.', 'baseball', 'the mitt pushes against the ball’s motion until it stops'],
    ['Friction acts on a box sliding across a rough floor, with nobody pushing it.', 'box', 'friction pulls against its motion until it stops'],
    ['A train’s brakes are put on as it runs along a straight track.', 'train', 'the brakes act against its motion, and it stays on the same straight track'],
    ['A swimmer stops kicking and glides, and the water drags on her.', 'swimmer', 'the water’s drag acts against her motion'],
  ],
  turn: [
    ['A sliding puck hits the boards of a rink head-on and bounces straight back, just as fast.', 'puck', 'it leaves at the same speed, but going the other way'],
    ['A string pulls on a ball, keeping it whirling around in a circle at a steady speed.', 'ball', 'the pull toward the middle keeps bending its path, at the same speed'],
    ['The Earth’s pull keeps a satellite moving around it in a circle at a steady speed.', 'satellite', 'the pull toward the Earth keeps bending its path, at the same speed'],
    ['A bat hits a ball straight back the way it came, at the same speed it arrived.', 'ball', 'it leaves at the same speed, but going back the other way'],
    ['The grip of the road on a car’s tires carries it around a bend at a steady speed.', 'car', 'the sideways grip bends its path, at the same speed'],
    ['A curved rail guides a toy train around a bend at a steady speed.', 'toy train', 'the rail pushes it sideways, bending its path at the same speed'],
  ],
};
const KINDS = ['shape', 'faster', 'slower', 'turn'];
const EFFECT = { shape: 'It changes its shape', faster: 'It speeds it up', slower: 'It slows it down', turn: 'It changes its direction' };
const forceDoes = (kind) => `the force ${low(EFFECT[kind]).replace(/^it /, '')}`;   // "the force speeds it up"
const SHORT = { faster: 'it speeds up', slower: 'it slows down', turn: 'it turns' };
// questions each part of classical mechanics would answer
const BRANCH = [
  ['How far does a car go in 5 s at a steady 20 m/s?', 'kinematics'],
  ['What is a runner’s average velocity over a whole race?', 'kinematics'],
  ['How long does a train take to stop if it slows down at 0.5 m/s² from 25 m/s?', 'kinematics'],
  ['What does the slope of a velocity–time graph tell you?', 'kinematics'],
  ['Why does a box sliding across a floor slow down and stop?', 'dynamics'],
  ['What net force gives a 12 kg box an acceleration of 5 m/s²?', 'dynamics'],
  ['Why do the passengers lurch forward when a bus brakes?', 'dynamics'],
  ['How hard must a rope pull to hold up a hanging crate?', 'dynamics'],
  ['How much kinetic energy does a moving car have?', 'energetics'],
  ['How much energy is stored in a stretched spring?', 'energetics'],
  ['How much gravitational potential energy does a climber gain on a 50 m climb?', 'energetics'],
  ['How much work does a crane do lifting a load?', 'energetics'],
];
const PART = {
  kinematics: 'It only describes the motion (where, how fast, how long), without asking what causes it',
  dynamics: 'It asks about the forces on a body and why it moves the way it does',
  energetics: 'It is about energy: how much a body has, and where it goes',
};

const templates = [
  // 1. dynamics (the forces on bodies, and why they move) beside kinematics and energetics, and the four things a force
  // can do to a body: change its shape, speed it up, slow it down or change its direction
  (d, ctx) => {
    const type = ctx.k % 5, j = Math.floor(ctx.k / 5);
    if (type === 0) {
      const [i] = turn(ctx, 5, [range(24)]), kind = KINDS[Math.floor(i / 6)], [what, body, why] = DOES[kind][i % 6];
      return {
        topic: T.does, text: `${what} What does the force do to the ${body}?`,
        answer: oneOf(d, EFFECT[kind], KINDS.filter((x) => x !== kind).map((x) => EFFECT[x])),
        solution: `${cap(why)}, so <b>${forceDoes(kind)}</b>.`,
        meta: { type: 'what-it-does', in: { situation: what, does: kind } },
      };
    }
    if (type === 1) {
      const picks = turn(ctx, 5, [range(6), range(6), range(6), range(6)]), four = KINDS.map((kind, i) => [DOES[kind][picks[i]], kind]);
      return {
        topic: T.does, text: 'Match each one to what the force does to the body.',
        answer: pairUp(d, four.map(([[what], kind]) => [what, EFFECT[kind]])),
        tip: 'Ask what changes: its shape, how fast it goes, or which way it goes.',
        solution: four.map(([[, body, why], kind]) => `The ${body}: ${why}, so <b>${forceDoes(kind)}</b>.`).join(' '),
        meta: { type: 'match-effects', in: { situations: four.map(([[what], kind]) => [what, kind]) } },
      };
    }
    if (type === 2) {
      // shape or motion (twice), then speed or direction (twice), each time with other situations
      const m = Math.floor(j / 2), speed = [...DOES.faster.map((s) => [s, 'faster']), ...DOES.slower.map((s) => [s, 'slower'])];
      const [sides, items] = j % 2 === 0
        ? [['Changes its shape', 'Changes its motion'], [...some(DOES.shape, 3 * m, 3).map((s) => [s, 'shape', 0]), [DOES.faster[m], 'faster', 1], [DOES.slower[m + 2], 'slower', 1], [DOES.turn[m + 4], 'turn', 1]]]
        : [['Changes its speed', 'Changes its direction'], [...[0, 4, 8].map((i) => [...speed[i + m], 0]), ...some(DOES.turn, 3 * m, 3).map((s) => [s, 'turn', 1])]];
      const on = (side) => listing(items.filter((x) => x[2] === side).map(([[, body], kind]) => (j % 2 === 0 && kind !== 'shape' ? `the ${body} (${SHORT[kind]})` : `the ${body}`)));
      return {
        topic: T.does, text: 'What does the force do in each case? <span class="muted">Put each one on its side.</span>',
        answer: sortOut(d, sides, items.map(([[what], , side]) => [what, side])),
        tip: 'A body that doesn’t start or stop moving, but is squashed, stretched or bent, changes shape. Speeding up or slowing down is a change of speed.',
        solution: `<b>${sides[0]}</b>: ${on(0)}. <b>${sides[1]}</b>: ${on(1)}.`,
        meta: { type: j % 2 === 0 ? 'sort-shape-motion' : 'sort-speed-direction', in: { situations: items.map(([[what], kind]) => [what, kind]) } },
      };
    }
    if (type === 3) {
      const [i] = turn(ctx, 5, [range(BRANCH.length)]), [q, part] = BRANCH[i];
      return {
        topic: T.does, text: `“${q}” Which part of classical mechanics answers a question like this?`,
        answer: oneOf(d, cap(part), ['Kinematics', 'Dynamics', 'Energetics'].filter((x) => x !== cap(part))),
        solution: `${PART[part]}, so it’s <b>${part}</b>.`,
        meta: { type: 'which-part', in: { question: q, part } },
      };
    }
    const [q, right, wrongs, why] = [
      ['What is dynamics?', 'The study of the forces acting on bodies, which explain why they move the way they do', ['Describing motion (where, how fast, how long) without asking what causes it', 'The study of energy, and how it is stored and passed on'],
        'Dynamics is about causes: the forces on particles and systems, and the motion they produce. Kinematics only describes motion, and energetics is about energy'],
      ['What does kinematics do?', 'It describes motion (where, how fast, how long) without asking what causes it', ['It studies the forces on bodies, which explain why they move', 'It studies energy, and how it is stored and passed on'],
        'Kinematics describes motion with positions, velocities, accelerations and times. Asking why a body moves that way (its forces) is dynamics'],
      ['What is energetics about?', 'Energy: how much a body has, and how it is stored and passed on', ['Describing motion without asking what causes it', 'The forces on bodies, and why they move the way they do'],
        'Energetics is the part of mechanics about energy (kinetic, potential, work). Describing motion is kinematics, and forces are dynamics'],
      ['Classical mechanics is often split into three parts. Which three?', 'Kinematics, energetics and dynamics', ['Kinematics, optics and electricity', 'Heat, light and sound', 'Atoms, nuclei and electrons'],
        'Kinematics describes motion, energetics deals with energy, and dynamics explains motion with forces. Light, heat, electricity and atoms belong to other parts of physics'],
    ][j];
    return {
      topic: T.does, text: q, answer: oneOf(d, right, wrongs),
      solution: `${why}. <b>${right}</b>.`,
      meta: { type: ['what-dynamics-is', 'what-kinematics-is', 'what-energetics-is', 'three-parts'][j], in: {} },
    };
  },

  // 2. the net force along a line: add the forces with their directions. Balanced (ΣF = 0) means at rest or a constant
  // velocity; unbalanced means speeding up, slowing down or turning, the way the net force points
  (d, ctx) => {
    const type = ctx.k % 5, j = Math.floor(ctx.k / 5);
    if (type === 0) {
      if (j % 2 === 0) {
        const [W, R, L] = turnAs(ctx, 5, 'h', [[150, 200, 250, 300, 400], [60, 80, 90, 120, 140, 150, 180], [25, 35, 45, 50, 70, 95, 110]], (w, r, l) => Math.abs(r - l) >= 10 && apart(r - l, w, r, l));
        const net = Math.abs(R - L);
        return {
          topic: T.net, text: `A crate is on a smooth, level floor (no friction). Two people push on it from opposite sides: one to the right with ${R} N, the other to the left with ${L} N. Up and down, its weight W = ${W} N and the floor’s push N = ${W} N balance. How big is the net force on the crate?`,
          figure: forces([[90, W, `N = ${W} N`], [270, W, `W = ${W} N`], [0, R, `${R} N`], [180, L, `${L} N`]], 'the forces on the crate'),
          answer: numAns(net, 'N'),
          solution: `On the crate: up and down, N and W are the same size and opposite, so they cancel. Along the floor, take right as positive: ΣF = ${R} − ${L} = ${num(R - L)} N. So the net force points ${R > L ? 'right' : 'left'}, and its size is <b>${net} N</b>.`,
          meta: { type: 'net-level', in: { W, N: W, right: R, left: L } },
        };
      }
      const [Wt, U] = turnAs(ctx, 5, 'v', [[120, 150, 196, 245, 300, 400, 490], [100, 140, 180, 230, 280, 350, 450, 520]], (w, u) => Math.abs(u - w) >= 10 && Math.abs(u - w) <= 0.4 * w && apart(u - w, w, u));
      const net = Math.abs(U - Wt);
      return {
        topic: T.net, text: `A crate hangs from a crane’s cable, which is moving it. The cable pulls up on the crate with a tension T = ${U} N, and the crate’s weight is W = ${Wt} N. How big is the net force on the crate?`,
        figure: forces([[90, U, `T = ${U} N`], [270, Wt, `W = ${Wt} N`]], 'the forces on the crate'),
        answer: numAns(net, 'N'),
        solution: `On the crate, take up as positive: ΣF = T − W = ${U} − ${Wt} = ${num(U - Wt)} N. ${U > Wt ? 'It is positive, so the net force points up' : 'It is negative, so the net force points down'}, and its size is <b>${net} N</b>.`,
        meta: { type: 'net-vertical', in: { T: U, W: Wt } },
      };
    }
    if (type === 1) {
      // (one that speeds up, one that slows down and one that's balanced, then another that speeds up, going left)
      const happens = ['faster', 'slower', 'steady', 'faster'][j], left = j % 2 === 1;
      const [P, f] = turnAs(ctx, 5, happens, [[20, 30, 40, 50, 60, 80], [20, 30, 40, 50, 60, 80]], (p, fr) => (happens === 'faster' ? p > fr : happens === 'slower' ? p < fr : p === fr));
      const way = left ? 'left' : 'right', back = left ? 'right' : 'left';
      const right = P > f ? 'It speeds up' : P < f ? 'It slows down' : 'It keeps moving at a constant velocity';
      return {
        topic: T.net, text: `A cart is rolling to the ${way} along a level floor. Along the floor, a push of ${P} N acts on it to the ${way}, and friction of ${f} N acts to the ${back}. What happens to the cart?`,
        figure: forces([[left ? 180 : 0, P, `${P} N`], [left ? 0 : 180, f, `f = ${f} N`]], 'the forces on the cart along the floor'),
        answer: oneOf(d, right, ['It speeds up', 'It slows down', 'It keeps moving at a constant velocity', 'It moves back the other way at once'].filter((x) => x !== right)),
        solution: `On the cart, take its direction of motion (to the ${way}) as positive: ΣF = ${P} − ${f} = ${num(P - f)} N. ${P > f ? 'The net force points the way it moves' : P < f ? 'The net force points against its motion' : 'The forces balance (ΣF = 0), so by the first law nothing changes'}. <b>${right}</b>.`,
        meta: { type: 'what-happens', in: { push: P, friction: f, moving: way } },
      };
    }
    if (type === 2) {
      const SAY = [
        ['The forces on a car driving along a straight road are balanced. What is the car doing?', 'Moving at a constant velocity', ['Speeding up', 'Slowing down', 'Turning a corner'], 'Balanced forces (ΣF = 0) leave the velocity as it is'],
        ['A sled slides to the right across the snow, and the net force on it points to the left. What happens to the sled?', 'It slows down', ['It speeds up', 'It moves at a constant velocity', 'It turns'], 'The net force points against its motion, so its speed drops'],
        ['A cyclist rides north, and the net force on her points north. What happens to her?', 'She speeds up', ['She slows down', 'She keeps a constant velocity', 'She turns'], 'The net force points the way she is moving, so her speed grows'],
        ['A puck slides east across the ice, and the net force on it points north, at right angles to its motion. What happens to the puck?', 'It turns toward the north', ['It speeds up in a straight line', 'It slows down in a straight line', 'It keeps going east at a constant velocity'], 'A net force at right angles to the motion changes the direction, toward the way the force points'],
        ['A ball lies still on the ground, and the forces on it are balanced. What happens next?', 'It stays at rest', ['It starts to roll', 'It slowly speeds up', 'It sinks into the ground'], 'With no net force, a body at rest stays at rest'],
        ['A car cruises at a steady 25 m/s along a straight highway. What is the net force on it?', 'Zero: the forces on it are balanced', ['Forward, to keep it moving', 'Backward, against its motion', 'Downward: its weight'], 'A constant velocity (the same speed in a straight line) means the forces balance'],
        ['A lift (elevator) is moving up at a steady speed. How do the forces on it compare?', 'The cable’s pull up equals its weight: they balance', ['The cable’s pull is bigger than its weight', 'The cable’s pull is smaller than its weight', 'Only the cable pulls on it'], 'A steady speed in a straight line means a constant velocity, so ΣF = 0 and the pull up equals the weight down'],
        ['Which of these tells you the forces on a body are unbalanced?', 'Its velocity is changing (its speed or its direction)', ['It is moving', 'It is moving fast', 'It is at rest'], 'Only a change in velocity needs a net force. Moving, even fast, at a constant velocity needs none'],
      ];
      const [i] = turn(ctx, 5, [range(SAY.length)]), [q, right, wrongs, why] = SAY[i];
      return {
        topic: T.net, text: q, answer: oneOf(d, right, wrongs),
        solution: `${why}. <b>${right}</b>.`,
        meta: { type: 'balanced-or-not', in: { statement: i } },
      };
    }
    if (type === 3) {
      if (j % 2 === 0) {
        const [Tn, net] = turnAs(ctx, 5, 'h', [[50, 60, 70, 80, 90, 100, 120], [10, 15, 20, 25, 30, 40]], (t, n) => t - n >= 10 && apart(t - n, t, n)), f = Tn - net;
        return {
          topic: T.net, text: `A rope pulls a box to the right along a floor with a tension T = ${Tn} N, and friction f acts on the box to the left. The net force on the box is ${net} N to the right. How big is the friction?`,
          figure: forces([[0, Tn, `T = ${Tn} N`], [180, f, 'f = ?']], 'the forces on the box along the floor'),
          answer: numAns(f, 'N'),
          solution: `On the box, take right as positive: ΣF = T − f, so ${net} = ${Tn} − f, and f = ${Tn} − ${net} = <b>${f} N</b>.`,
          meta: { type: 'missing-friction', in: { T: Tn, net } },
        };
      }
      const [W, net, up] = turnAs(ctx, 5, 'v', [[150, 200, 240, 300, 450, 600], [20, 30, 40, 50, 60, 90], [true, false]], (w, n, u) => apart(u ? w + n : w - n, w, n)), Tn = up ? W + net : W - net;
      return {
        topic: T.net, text: `A crate with a weight W = ${W} N hangs from a crane’s cable, which is moving it. The net force on the crate is ${net} N ${up ? 'upward' : 'downward'}. How big is the cable’s pull T on it?`,
        figure: forces([[90, Tn, 'T = ?'], [270, W, `W = ${W} N`]], 'the forces on the crate'),
        answer: numAns(Tn, 'N'),
        solution: `On the crate, take up as positive: ΣF = T − W, so ${up ? net : `−${net}`} = T − ${W}, and T = ${W} ${up ? '+' : '−'} ${net} = <b>${Tn} N</b>.`,
        meta: { type: 'missing-tension', in: { W, net, up } },
      };
    }
    const BAL = ['A book resting on a desk', 'A car cruising at a steady 60 km/h along a straight road', 'A skydiver falling at a constant (terminal) velocity', 'A lift (elevator) moving up at a steady speed', 'A puck gliding across smooth ice at a constant velocity', 'A lamp hanging still from the ceiling'];
    const UNB = ['A ball speeding up as it rolls down a ramp', 'A bus slowing down as it comes to a stop', 'A car going around a bend at a steady speed', 'An apple just after it comes off a tree', 'A rocket speeding up as it lifts off', 'A sled slowing down on rough snow'];
    const [rights, wrongs] = fours(j, BAL, UNB);
    return {
      topic: T.net, text: 'In which of these are the forces on the body balanced? <span class="muted">Choose all that fit.</span>',
      answer: allOf(d, rights, wrongs),
      tip: 'Balanced means ΣF = 0: at rest, or the same speed in a straight line. Any change of speed or direction needs a net force.',
      solution: `The forces balance (ΣF = 0) when a body is at rest or keeps a constant velocity: the same speed in a straight line. For ${quoted(wrongs)}, the speed or the direction changes, so there is a net force. Choose ${bold(rights)}.`,
      meta: { type: 'which-balanced', in: { balanced: rights, unbalanced: wrongs } },
    };
  },

  // 3. the first law: a body at rest stays at rest, and one moving at a constant velocity keeps that velocity, unless a
  // net external force acts. Inertia (the resistance to a change in motion) grows with the mass
  (d, ctx) => {
    const type = ctx.k % 5, j = Math.floor(ctx.k / 5);
    if (type === 0) {
      const WHY = [
        ['A bus brakes suddenly, and its standing passengers lurch forward. Why?', 'Their bodies keep moving forward at the bus’s old speed while the bus slows down', ['The brakes push the passengers forward', 'A force of motion inside them pushes them forward', 'The bus pulls them forward as it stops'],
          'Nothing pushes them forward. By inertia they keep the velocity they had, while the bus slows down under them'],
        ['A bus pulls away quickly from a stop, and its standing passengers sway backward. Why?', 'Their bodies tend to stay at rest while the bus speeds up under them', ['The bus pushes them backward', 'The engine’s force pushes back on them', 'The air in the bus pushes them back'],
          'Nothing pushes them back. By inertia they tend to stay where they were while the floor moves forward under their feet'],
        ['A magician whips a smooth tablecloth out from under a set of dishes, and the dishes stay almost where they were. Why?', 'The dishes have inertia, and the quick pull gives friction too little time to get them moving', ['The dishes are too heavy for the cloth to move at all', 'The cloth pushes the dishes backward as it leaves', 'Air pressure holds the dishes down on the table'],
          'At rest, the dishes tend to stay at rest. Friction from the cloth acts for only a moment, so it hardly gets them moving'],
        ['Why do cars have seat belts?', 'In a sudden stop your body keeps moving forward, and the belt gives the force that slows you down with the car', ['They make the car stop faster', 'They push you forward so you keep up with the car', 'They switch off your inertia'],
          'When the car stops suddenly, by inertia your body keeps going forward until something stops it. The belt gives that force, instead of the dashboard'],
        ['To tighten a loose hammer head, you bang the bottom of the handle down onto the floor. Why does the head slide farther onto the handle?', 'The handle stops when it hits the floor, but the head keeps moving down', ['The floor pushes the head down onto the handle', 'The handle stretches when it hits the floor', 'Gravity pulls harder on the head as it stops'],
          'Head and handle move down together. The floor stops the handle, but nothing has stopped the head yet, so by inertia it keeps going and slides down the handle'],
        ['A card lies on top of a glass with a coin on it. You flick the card away sideways, and the coin drops into the glass. Why?', 'The coin tends to stay at rest, so it isn’t carried off with the card, and then it falls', ['The flick pushes the coin down into the glass', 'The air pulls the coin into the glass', 'The moving card makes the coin heavier'],
          'The quick flick acts on the card, not the coin. By inertia the coin stays where it was, and with the card gone, its weight pulls it into the glass'],
        ['A runner crosses the finish line at full speed and can’t stop at once. Why?', 'Her body has inertia, so it takes a force acting for a while to slow her down', ['Her legs keep pushing her forward by themselves', 'The finish line pushes her forward', 'The air behind her pushes her on'],
          'A moving body keeps moving unless a net force acts on it. The ground has to push back on her feet, against her motion, for a while to slow her down'],
      ];
      const [i] = turn(ctx, 5, [range(WHY.length)]), [q, right, wrongs, why] = WHY[i];
      return {
        topic: T.inertia, text: q, answer: oneOf(d, right, wrongs),
        solution: `${why}. <b>${right}</b>.`,
        meta: { type: 'explain-inertia', in: { situation: i } },
      };
    }
    if (type === 1) {
      const COAST = [
        [(v) => `A spacecraft far out in space, far from any star or planet, coasts at ${num(v)} m/s with its engines off. What happens to its motion?`, (v) => `It keeps moving at ${num(v)} m/s in a straight line`, ['It slowly comes to a stop', 'It slowly speeds up', 'It starts to move in a circle'], [1500, 2000, 3000, 4500, 8000],
          'Far from any star or planet, no net force acts on it'],
        [(v) => `A puck slides across perfectly smooth (frictionless) ice at ${num(v)} m/s. Nothing pushes or pulls it along the ice. What happens to its motion?`, (v) => `It keeps sliding at ${num(v)} m/s in a straight line`, ['It slows down and stops', 'It speeds up', 'It curves off to one side'], [2, 3, 4, 5, 6],
          'Up and down, its weight and the ice’s push balance, and nothing acts along the ice, so the net force on it is zero'],
        [(v) => `A ball on a string whirls around in a circle on a smooth, level table at ${num(v)} m/s. The string breaks. How does the ball move after that?`, (v) => `In a straight line, the way it was going when the string broke, still at ${num(v)} m/s`, ['It keeps going around in the same circle', 'Straight outward, away from the middle of the circle', 'It slows down and stops'], [1.5, 2, 2.5, 3, 4],
          'Once the string breaks, nothing pulls it toward the middle any more, and on a smooth, level table the other forces balance'],
      ];
      const s = j % 3, [i] = turn(ctx, 5, [range(5)]), [say, keep, wrongs, speeds, why] = COAST[s], v = speeds[i];
      return {
        topic: T.inertia, text: say(v), answer: oneOf(d, keep(v), wrongs),
        solution: `${why}. By the first law it keeps the velocity it had: <b>${low(keep(v))}</b>.`,
        meta: { type: ['coasting-in-space', 'frictionless-puck', 'string-breaks'][s], in: { v } },
      };
    }
    if (type === 2) {
      const [m, F] = turn(ctx, 5, [[20, 25, 30, 40, 50, 60], [80, 100, 120, 150, 180, 200, 240]], (mass, push) => push / (mass * G) >= 0.15 && push / (mass * G) <= 0.6);
      const crate = `A worker pushes a ${m} kg crate across a level floor at a constant velocity, with a horizontal force of ${F} N.`;
      const [text, right, wrongs, why, kind] = [
        [`${crate} What is the net force on the crate?`, '0 N: the push and friction balance', [`${F} N, forward`, `A little more than ${F} N, forward, to keep it moving`, `${F} N, backward`],
          `It moves at a constant velocity, so its motion isn’t changing: by the first law the net force is zero. The ${F} N push is balanced by ${F} N of friction`, 'constant-velocity-net'],
        [`${crate} How big is the friction on the crate, and which way does it act?`, `${F} N, backward (against the motion)`, [`${F} N, forward`, `Less than ${F} N, backward, or the crate couldn’t move`, '0 N, since the crate is moving'],
          `A constant velocity means ΣF = 0, so friction must exactly balance the ${F} N push. A body needs no net force to keep moving`, 'constant-velocity-friction'],
        [`${crate} Then the worker stops pushing. What happens to the crate?`, 'It slows down and stops, since friction is now unbalanced', ['It keeps moving at the same velocity', 'It speeds up', 'It moves backward'],
          'Without the push, friction is the only force along the floor. It is an unbalanced force against the motion', 'stops-pushing'],
        ['A car drives along a straight, level road at a steady 25 m/s, with its engine working hard. What is the net force on the car?', 'Zero: the road’s forward push and the resistance balance', ['Forward, or the car would slow down', 'Backward, against its motion', 'Downward: its weight'],
          'A steady speed in a straight line is a constant velocity, so ΣF = 0. The engine is only making up for air resistance and friction', 'cruising-car'],
      ][j];
      return {
        topic: T.inertia, text, answer: oneOf(d, right, wrongs),
        solution: `${why}. <b>${right}</b>.`,
        meta: { type: kind, in: j < 3 ? { m, F } : { v: 25 } },
      };
    }
    if (type === 3) {
      const HEFT = [
        [['an empty shopping cart', 'empty cart', 8], ['a full shopping cart', 'full cart', 40]],
        [['a small medicine ball', 'small ball', 1], ['a big medicine ball', 'big ball', 5]],
        [['a child on skates', 'child', 30], ['an adult on skates', 'adult', 75]],
        [['a lighter bowling ball', 'lighter ball', 3], ['a heavier bowling ball', 'heavier ball', 7]],
        [['an empty suitcase', 'empty suitcase', 4], ['a packed suitcase', 'packed suitcase', 25]],
        [['an empty wagon', 'empty wagon', 10], ['the same wagon with a child in it', 'loaded wagon', 40]],
      ];
      const ASK = ['Which has more inertia?', 'Which is harder to start moving?', 'They move toward you at the same speed. Which is harder to stop?', 'They move at the same speed. Which is harder to turn aside?'];
      const a = j, [p] = turn(ctx, 5, [range(HEFT.length)]), [light, heavy] = HEFT[p], [x, y] = d.shuffle([light, heavy]);
      const right = `The ${heavy[1]}: more mass means more inertia`;
      return {
        topic: T.inertia, text: `Compare ${x[0]} (${x[2]} kg) with ${y[0]} (${y[2]} kg). ${ASK[a]}`,
        answer: oneOf(d, right, [`The ${light[1]}: less mass means more inertia`, 'Neither: inertia doesn’t depend on mass', ...(a >= 2 ? ['Neither, since they move at the same speed'] : [])]),
        solution: `Inertia is a body’s resistance to a change in its motion, and it grows with the mass. The ${heavy[1]} has ${heavy[2]} kg against ${light[2]} kg, so it takes more force to change its motion. <b>${right}</b>.`,
        meta: { type: 'more-inertia', in: { light: light[2], heavy: heavy[2], ask: a } },
      };
    }
    const RIGHT = ['A body at rest stays at rest unless a net force acts on it', 'A body moving at a constant velocity keeps that velocity unless a net force acts on it', 'The more mass a body has, the more inertia it has',
      'A body can move at a constant velocity with no net force on it', 'Inertia is a body’s resistance to any change in its motion', 'A puck sliding on frictionless ice, with nothing pushing it, keeps the same velocity'];
    const WRONG = ['A moving body needs a net force to keep it moving', 'With no force on them, moving bodies slow down and stop by themselves', 'Inertia is a force that keeps things moving',
      'A lighter body has more inertia than a heavier one', 'Only moving bodies have inertia', 'A body at rest has no inertia'];
    const [rights, wrongs] = fours(j, RIGHT, WRONG);
    return {
      topic: T.inertia, text: 'Which of these are true, by Newton’s first law (the law of inertia)? <span class="muted">Choose all that fit.</span>',
      answer: allOf(d, rights, wrongs),
      tip: 'The first law: no net force means no change in velocity, at rest or moving. Inertia is not a force, and every mass has it.',
      solution: `By the first law, only a net force changes a body’s velocity, and a body needs no force to keep moving. Inertia isn’t a force: it is the resistance to a change in motion that every body has, more with more mass. Choose ${bold(rights)}.`,
      meta: { type: 'first-law-true', in: { right: rights, wrong: wrongs } },
    };
  },

  // 4. the second law: ΣF = ma, so a = ΣF/m and m = ΣF/a, with the net force found first when two forces oppose
  // (1 N = 1 kg·m/s²)
  (d, ctx) => {
    const type = ctx.k % 5, j = Math.floor(ctx.k / 5);
    const SMOOTH = [['box', 'a smooth, level floor'], ['crate', 'a smooth, level floor'], ['sled', 'smooth, level ice'], ['cart', 'a smooth, level track']];
    if (type === 0) {
      const [m, F, s] = turn(ctx, 5, [[4, 5, 8, 10, 12, 15, 20, 25, 30, 40, 50], [20, 24, 30, 36, 40, 45, 50, 60, 75, 80, 90, 100, 120], range(4)], (mass, f) => f / mass >= 0.5 && f / mass <= 15 && apart(f / mass, mass, f));
      const [name, on] = SMOOTH[s], a = F / m;
      return {
        topic: T.fma, text: `A horizontal force F = ${F} N pulls a ${m} kg ${name} along ${on} (no friction). What is its acceleration?`,
        figure: floor({ box: `${m} kg`, force: { angle: 0, label: `F = ${F} N` }, label: `a ${m} kg ${name} pulled by a ${F} N force` }),
        answer: numAns(a, 'm/s²'),
        solution: `On the ${name}, take the way it is pulled as positive. Up and down its weight and the normal force balance, and along the ${s === 2 ? 'ice' : s === 3 ? 'track' : 'floor'} F is the only force. ΣF = ma: ${F} = ${m}a, so a = ${F} ÷ ${m} = <b>${ans(a)} m/s²</b>.`,
        meta: { type: 'a-from-force', in: { m, F } },
      };
    }
    if (type === 1) {
      const WHO = [['cart', 'it', [4, 6, 8, 12, 15]], ['skater', 'her', [45, 52, 60, 68, 75]], ['sled', 'it', [10, 15, 18, 20, 25]], ['cyclist and her bike', 'them', [62, 70, 78, 85, 90]]];
      const [w, i, a] = turn(ctx, 5, [range(4), range(5), [0.5, 0.8, 1.2, 1.5, 2, 2.5, 3, 4]], (wi, mi, acc) => apart(WHO[wi][2][mi] * acc, WHO[wi][2][mi], acc));
      const [who, it, masses] = WHO[w], m = masses[i], F = m * a;
      return {
        topic: T.fma, text: `A ${m} kg ${who} speed${w === 3 ? '' : 's'} up along a straight line at ${a} m/s². What is the net force on ${it}?`,
        answer: numAns(F, 'N'),
        solution: `Take the way ${it === 'them' ? 'they speed' : it === 'her' ? 'she speeds' : 'it speeds'} up as positive. ΣF = ma = ${m} × ${a} = ${num(F)} kg·m/s², and a newton is one kg·m/s², so ΣF = <b>${ans(F)} N</b>.`,
        meta: { type: 'net-force-from-a', in: { m, a } },
      };
    }
    if (type === 2) {
      const [F, a, s] = turn(ctx, 5, [[18, 24, 30, 42, 48, 60, 72, 84, 90, 120], [1.2, 1.5, 2, 2.4, 3, 3.5, 4, 6], range(4)], (f, acc) => f / acc >= 2 && f / acc <= 80 && apart(f / acc, f, acc));
      const [name, on] = SMOOTH[s], m = F / a;
      return {
        topic: T.fma, text: `A horizontal pull F = ${F} N gives a ${name} on ${on} (no friction) an acceleration of ${a} m/s². What is the ${name}’s mass m?`,
        figure: floor({ box: 'm = ?', force: { angle: 0, label: `F = ${F} N` }, label: `a ${name} pulled by a ${F} N force` }),
        answer: numAns(m, 'kg'),
        solution: `There’s no friction, so the pull is the net force on the ${name}. ΣF = ma, so m = ΣF ÷ a = ${F} ÷ ${a} = <b>${ans(m)} kg</b> (N ÷ m/s² is kg·m/s² ÷ m/s², which leaves kg).`,
        meta: { type: 'mass-from-a', in: { F, a } },
      };
    }
    const NAMES = ['box', 'crate', 'trunk', 'cabinet'];
    if (type === 3) {
      const [m, F, f, s] = turn(ctx, 5, [[8, 10, 15, 20, 25, 30, 40, 50], [60, 80, 100, 120, 150, 180, 200], [20, 30, 40, 45, 50, 60, 75, 90], range(4)],
        (mass, pull, fr) => pull > fr && (pull - fr) / mass >= 0.3 && (pull - fr) / mass <= 10 && fr / (mass * G) >= 0.1 && fr / (mass * G) <= 0.6 && apart((pull - fr) / mass, mass, pull, fr));
      const name = NAMES[s], a = (F - f) / m, W = m * G;
      return {
        topic: T.fma, text: `A ${m} kg ${name} is pulled along a level floor by a horizontal force F = ${F} N, and the friction on it is f = ${f} N. What is its acceleration?`,
        figure: forces([[90, W, 'N'], [270, W, 'W'], [0, F, `F = ${F} N`], [180, f, `f = ${f} N`]], `the forces on the ${name}`),
        answer: numAns(a, 'm/s²'),
        solution: `On the ${name}, take the way it is pulled as positive. Up and down, N and W balance (ΣFy = 0). Along the floor, ΣFx = F − f = ma: ${F} − ${f} = ${m}a, so a = ${num(F - f)} ÷ ${m} = <b>${ans(a)} m/s²</b>.`,
        meta: { type: 'a-two-forces', in: { m, F, f } },
      };
    }
    if (j % 2 === 0) {
      const [m, a, F, s] = turnAs(ctx, 5, 'f', [[10, 15, 20, 25, 30, 40, 50], [0.5, 0.8, 1, 1.2, 1.5, 2, 2.5], [60, 80, 100, 120, 150, 180, 200, 240], range(4)],
        (mass, acc, push) => (push - mass * acc) / (mass * G) >= 0.1 && (push - mass * acc) / (mass * G) <= 0.6 && apart(push - mass * acc, mass, acc, push));
      const name = NAMES[s], f = F - m * a, W = m * G;
      return {
        topic: T.fma, text: `A ${m} kg ${name} is pushed along a level floor with a horizontal force F = ${F} N, and speeds up at ${a} m/s². How big is the friction f on it?`,
        figure: forces([[90, W, 'N'], [270, W, 'W'], [0, F, `F = ${F} N`], [180, f, 'f = ?']], `the forces on the ${name}`),
        answer: numAns(f, 'N'),
        solution: `On the ${name}, take the way it is pushed as positive. Along the floor, ΣFx = F − f = ma, so f = F − ma = ${F} − ${m} × ${a} = ${F} − ${num(m * a)} = <b>${ans(f)} N</b>.`,
        meta: { type: 'friction-from-a', in: { m, a, F } },
      };
    }
    const [m, a, f, s] = turnAs(ctx, 5, 'p', [[10, 15, 20, 25, 30, 40, 50], [0.5, 0.8, 1, 1.2, 1.5, 2, 2.5], [20, 30, 40, 50, 60, 80, 100], range(4)],
      (mass, acc, fr) => fr / (mass * G) >= 0.1 && fr / (mass * G) <= 0.6 && apart(mass * acc + fr, mass, acc, fr));
    const name = NAMES[s], F = m * a + f, W = m * G;
    return {
      topic: T.fma, text: `Friction f = ${f} N acts on a ${m} kg ${name} that is pushed along a level floor. How big a horizontal push F gives it an acceleration of ${a} m/s²?`,
      figure: forces([[90, W, 'N'], [270, W, 'W'], [0, F, 'F = ?'], [180, f, `f = ${f} N`]], `the forces on the ${name}`),
      answer: numAns(F, 'N'),
      solution: `On the ${name}, take the way it is pushed as positive. Along the floor, ΣFx = F − f = ma, so F = ma + f = ${m} × ${a} + ${f} = ${num(m * a)} + ${f} = <b>${ans(F)} N</b>.`,
      meta: { type: 'push-for-a', in: { m, a, f } },
    };
  },

  // 5. a = ΣF/m: the acceleration goes up in step with the net force (same mass) and down as the mass goes up (same force)
  (d, ctx) => {
    const type = ctx.k % 4, j = Math.floor(ctx.k / 4);
    const SAY = { 2: 'doubled', 3: 'tripled', 4: 'made four times as big', 0.5: 'halved' };
    const by = (x) => (x === 0.5 ? '½' : x === 0.25 ? '¼' : num(x));
    if (type === 0) {
      const [a, p, q] = turn(ctx, 4, [[1.5, 2, 2.4, 3, 4, 4.5, 6, 8], [1, 2, 3, 4, 0.5], [1, 2, 3, 4, 0.5]], (acc, f, m) => f !== m && (acc * f) / m >= 0.3 && (acc * f) / m <= 12 && apart((acc * f) / m, acc));
      const a2 = (a * p) / q, change = (what, x) => (x === 1 ? `the ${what} stays the same` : `the ${what} is ${SAY[x]}`);
      return {
        topic: T.scale, text: `A net force gives a cart an acceleration of ${a} m/s². What is its acceleration if ${change('net force', p)} and ${change('mass', q)}?`,
        answer: numAns(a2, 'm/s²'),
        solution: `a = ΣF/m: multiplying the net force by a number multiplies a by it, and multiplying the mass by a number divides a by it. Here the force’s factor is ${by(p)} and the mass’s is ${by(q)}, so the new acceleration is ${a} × ${by(p)} ÷ ${by(q)} = <b>${ans(a2)} m/s²</b>.`,
        meta: { type: 'scale-both', in: { a, force: p, mass: q } },
      };
    }
    if (type === 1) {
      const WHO = [['skater', [35, 40, 45, 50, 60, 75, 80, 90]], ['cart', [2, 3, 4, 6, 8, 10, 12, 16]], ['sled', [5, 8, 10, 12, 15, 20, 24, 30]]];
      const [w, i1, i2, a1] = turn(ctx, 4, [range(3), range(8), range(8), [0.8, 1.2, 1.5, 2, 2.4, 3, 4.5, 6]],
        // (a push gives a skater at most 5 m/s², a cart or sled at most 12 m/s²)
        (wi, x, y, acc) => x !== y && (WHO[wi][1][x] * acc) / WHO[wi][1][y] >= 0.3 && (WHO[wi][1][x] * acc) / WHO[wi][1][y] <= (wi === 0 ? 5 : 12) && (wi > 0 || acc <= 5) && apart((WHO[wi][1][x] * acc) / WHO[wi][1][y], WHO[wi][1][x], WHO[wi][1][y], acc));
      const [who, masses] = WHO[w], m1 = masses[i1], m2 = masses[i2], a2 = (m1 * a1) / m2;
      return {
        topic: T.scale, text: `The same net force that gives a ${m1} kg ${who} an acceleration of ${a1} m/s² acts on a ${m2} kg ${who}. What is the acceleration of the ${m2} kg ${who}?`,
        answer: numAns(a2, 'm/s²'),
        solution: `The net force is the same, so ma is the same for both: ΣF = ${m1} × ${a1} = ${num(m1 * a1)} N. ${m2 > m1 ? 'More' : 'Less'} mass means ${m2 > m1 ? 'less' : 'more'} acceleration: a = ΣF ÷ m = ${num(m1 * a1)} ÷ ${m2} = <b>${ans(a2)} m/s²</b>.`,
        meta: { type: 'same-force-new-mass', in: { m1, a1, m2 } },
      };
    }
    if (type === 2) {
      const [F1, a1, a2] = turn(ctx, 4, [[12, 20, 24, 30, 36, 45, 60, 80], [1.5, 2, 2.5, 3, 4, 5], [0.5, 1, 1.5, 2.5, 3.5, 4, 6, 7.5]],
        (f, x, y) => x !== y && f / x >= 2 && f / x <= 80 && apart((f * y) / x, f, x, y));
      const F2 = (F1 * a2) / a1, m = F1 / a1;
      return {
        topic: T.scale, text: `A net force of ${F1} N gives a box an acceleration of ${a1} m/s². What net force would give the same box an acceleration of ${a2} m/s²?`,
        answer: numAns(F2, 'N'),
        solution: `The mass stays the same, so the net force changes in step with the acceleration. Its mass is ${F1} ÷ ${a1} = ${num(m, 3)} kg, so ΣF = ma = ${num(m, 3)} × ${a2} = <b>${ans(F2)} N</b>.`,
        meta: { type: 'force-for-new-a', in: { F1, a1, a2 } },
      };
    }
    // which changes give the acceleration a factor: (the force's factor) ÷ (the mass's factor)
    const CHANGES = [
      ['Double the net force, keeping the mass the same', 2, 1], ['Halve the mass, keeping the net force the same', 1, 0.5], ['Make the net force four times as big and double the mass', 4, 2],
      ['Halve the net force, keeping the mass the same', 0.5, 1], ['Double the mass, keeping the net force the same', 1, 2], ['Double the net force and make the mass four times as big', 2, 4],
      ['Double both the net force and the mass', 2, 2], ['Triple both the net force and the mass', 3, 3], ['Halve both the net force and the mass', 0.5, 0.5],
      ['Make the net force four times as big, keeping the mass the same', 4, 1], ['Double the net force and halve the mass', 2, 0.5],
      ['Make the mass four times as big, keeping the net force the same', 1, 4], ['Halve the net force and double the mass', 0.5, 2],
      ['Triple the net force, keeping the mass the same', 3, 1], ['Triple the mass, keeping the net force the same', 1, 3], ['Double the net force and triple the mass', 2, 3],
    ];
    const [target, goal] = [[2, 'double its acceleration'], [0.5, 'halve its acceleration'], [1, 'leave its acceleration the same'], [4, 'make its acceleration four times as big'], [0.25, 'make its acceleration a quarter of what it was']][j];
    const fits = (c) => Math.abs(c[1] / c[2] - target) < 1e-9, rights = CHANGES.filter(fits), wrongs = d.shuffle(CHANGES.filter((c) => !fits(c))).slice(0, 3);
    return {
      topic: T.scale, text: `A net force acts on a cart. Which of these changes would ${goal}? <span class="muted">Choose all that fit.</span>`,
      answer: allOf(d, rights.map((c) => c[0]), wrongs.map((c) => c[0])),
      tip: 'a = ΣF/m: multiply by the force’s factor, then divide by the mass’s factor.',
      solution: `a = ΣF/m, so the new acceleration is the old one times (the force’s factor) ÷ (the mass’s factor). That comes to ${by(target)} for ${listing(rights.map((c) => `<b>“${c[0]}”</b> (${by(c[1])} ÷ ${by(c[2])})`))}.`,
      meta: { type: 'which-changes', in: { factor: target } },
    };
  },

  // 6. the third law: when A pushes or pulls on B, B pushes or pulls back on A, the same size, the opposite way, on the
  // other body and of the same kind, so the two never cancel
  (d, ctx) => {
    const type = ctx.k % 5, j = Math.floor(ctx.k / 5);
    if (type === 0) {
      const PAIR = [
        ['An apple rests on a table. The Earth pulls it down: that is its weight.', 'The apple pulls the Earth up', ['The table pushes the apple up', 'The apple pushes down on the table', 'The floor pushes the table up'],
          'The weight is the Earth’s pull on the apple, so its partner is the apple’s pull on the Earth. The table’s push up also acts on the apple, and it is a contact push, not gravity'],
        ['A book lies on a table, and the table pushes up on it.', 'The book pushes down on the table', ['The Earth pulls the book down', 'The book pulls the Earth up', 'The floor pushes up on the table'],
          'This is the table pushing on the book, so its partner is the book pushing on the table. The book’s weight also acts on the book, and it is gravity, so it is not the partner'],
        ['A swimmer’s hands push the water backward.', 'The water pushes the swimmer’s hands forward', ['The water pushes the swimmer’s hands backward', 'The Earth pulls the swimmer down', 'The water pushes up on the swimmer'],
          'The hands push on the water, so the water pushes back on the hands, the opposite way: forward. That is what moves the swimmer'],
        ['A rocket’s engine pushes hot gas down out of its nozzle.', 'The gas pushes the rocket up', ['The ground pushes the gas back up', 'The Earth pulls the rocket down', 'The air pushes the rocket down'],
          'The rocket pushes on the gas, so the gas pushes back on the rocket, the opposite way: up. It needs no air or ground to push on'],
        ['As you walk, your foot pushes backward on the ground.', 'The ground pushes your foot forward', ['The ground pushes your foot backward', 'The Earth pulls you down', 'The ground pushes up on your foot'],
          'Your foot pushes back on the ground, so the ground pushes your foot forward, the opposite way. The ground’s push up is a different pair: the partner of your foot pressing down'],
        ['A hammer hits a nail, pushing it into the wood.', 'The nail pushes back on the hammer', ['The wood pushes back on the nail', 'The Earth pulls the hammer down', 'Your hand pushes the hammer forward'],
          'The hammer pushes on the nail, so the nail pushes back on the hammer, just as hard. The wood’s push acts on the nail, so it isn’t the partner'],
        ['The Earth pulls the Moon toward it.', 'The Moon pulls the Earth toward it', ['The Sun pulls the Moon', 'The Moon pushes the Earth away', 'The Earth pushes the Moon away'],
          'The Earth’s pull on the Moon is gravity, so its partner is the Moon’s pull (gravity too) on the Earth, just as strong and the opposite way'],
        ['A magnet pulls a steel paper clip toward it.', 'The paper clip pulls the magnet toward it', ['The magnet pushes the paper clip away', 'The table pushes the paper clip up', 'The Earth pulls the paper clip down'],
          'The magnet pulls on the clip, so the clip pulls on the magnet, the same size and the opposite way'],
        ['A tow truck’s cable pulls a car forward.', 'The car pulls the cable backward', ['The road pushes the car backward', 'The Earth pulls the car down', 'The truck’s engine pushes the truck forward'],
          'The cable pulls on the car, so the car pulls back on the cable, just as hard, the opposite way'],
        ['A skater standing on ice pushes on a wall with her hands.', 'The wall pushes back on her hands', ['The ice pushes up on the skater', 'The Earth pulls the skater down', 'The wall pushes down on the ice'],
          'She pushes on the wall, so the wall pushes back on her hands, the opposite way. That push is what sends her gliding back'],
      ];
      const NAME = ['the Earth’s pull on the apple', 'the table’s push on the book', 'the hands’ push on the water', 'the rocket’s push on the gas', 'your foot’s backward push on the ground',
        'the hammer’s push on the nail', 'the Earth’s pull on the Moon', 'the magnet’s pull on the paper clip', 'the cable’s pull on the car', 'the skater’s push on the wall'];
      const [i] = turn(ctx, 5, [range(PAIR.length)]), [what, right, wrongs, why] = PAIR[i];
      return {
        topic: T.pairs, text: `${what} By Newton’s third law, which force is the partner of ${NAME[i]}?`,
        answer: oneOf(d, right, wrongs),
        tip: 'Swap the two bodies: if A pushes B, the partner is B pushing A, the same kind of force, the opposite way.',
        solution: `${why}. Its partner: <b>${low(right)}</b>.`,
        meta: { type: 'find-partner', in: { force: what } },
      };
    }
    if (type === 1) {
      const [i, Fw] = turn(ctx, 5, [range(6), [40, 60, 80, 100, 120]]);
      const ASK = [
        ['A horse pulls a cart forward, and the cart pulls back on the horse just as hard. Why can they still speed up together?', 'The two forces act on different bodies, so they don’t cancel', ['The horse pulls a little harder than the cart pulls back', 'The cart’s pull comes a moment after the horse’s', 'The cart’s pull is smaller, because the cart is lighter'],
          'The forward pull acts on the cart and the backward pull acts on the horse. Forces on different bodies can’t cancel: the cart speeds up when the horse’s pull on it beats the friction on it'],
        [`You push on a wall with a force of ${Fw} N. How hard does the wall push on you?`, `${Fw} N, back toward you`, ['0 N: a wall can’t push', `Less than ${Fw} N`, `More than ${Fw} N`],
          'By the third law, the wall pushes back on you just as hard, the opposite way'],
        ['A fly hits the windshield of a moving bus. Which feels the bigger force?', 'Both feel forces of the same size', ['The fly', 'The bus', 'Only the fly feels a force'],
          'The fly pushes on the bus exactly as hard as the bus pushes on the fly. The same force on the fly’s tiny mass gives it a huge acceleration, which is why it comes off worse'],
        ['Which is true of the two forces in a Newton’s third law pair?', 'They are the same size, point opposite ways and act on different bodies', ['They act on the same body, so they cancel', 'The force from the bigger body is bigger', 'They are always two different kinds of force'],
          'Partners are equal in size and opposite in direction, act on different bodies, and are always the same kind of force (both gravity, or both contact pushes)'],
        ['The Earth pulls an apple down, and the apple pulls the Earth up just as hard. Why does the apple fall while the Earth hardly moves?', 'The Earth’s mass is huge, so the same force gives it a tiny acceleration', ['The apple’s pull on the Earth is much smaller', 'Only the apple feels a force', 'The two forces cancel on the Earth'],
          'a = F/m: the same size of force on the Earth’s enormous mass gives an acceleration far too small to notice'],
        ['A book rests on a table. Its weight and the table’s push up on it are equal and opposite. Are they a Newton’s third law pair?', 'No: both act on the book, and they are different kinds of force', ['Yes: they are equal and opposite', 'Yes: they act along the same line', 'No: the table’s push is bigger'],
          'Third-law partners act on different bodies. These two both act on the book, and one is gravity while the other is a contact push. The weight’s partner is the book pulling the Earth up'],
      ];
      const [q, right, wrongs, why] = ASK[i];
      return {
        topic: T.pairs, text: q, answer: oneOf(d, right, wrongs),
        solution: `${why}. <b>${right}</b>.`,
        meta: { type: ['why-no-cancel', 'push-a-wall', 'fly-and-bus', 'pair-facts', 'apple-and-earth', 'not-a-pair'][i], in: i === 1 ? { F: Fw } : {} },
      };
    }
    if (type === 2) {
      const PEOPLE = [35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 90];
      if (j % 2 === 0) {
        const [iA, iB, F] = turnAs(ctx, 5, 'f', [range(11), range(11), [60, 80, 90, 100, 120, 150, 180]], (x, y, f) => x !== y && f / PEOPLE[x] >= 0.5 && f / PEOPLE[x] <= 5 && apart(f / PEOPLE[x], PEOPLE[x], PEOPLE[y], f));
        const mA = PEOPLE[iA], mB = PEOPLE[iB], a = F / mA;
        return {
          topic: T.pairs, text: `Two skaters stand still on smooth ice. Skater A (${mA} kg) pushes skater B (${mB} kg) with a force of ${F} N. How big is skater A’s acceleration while they push?`,
          answer: numAns(a, 'm/s²'),
          solution: `A pushes on B, so by the third law B pushes back on A with the same ${F} N, the opposite way. On A, the ice is smooth, so that push is the net force: a = ΣF ÷ m = ${F} ÷ ${mA} = <b>${ans(a)} m/s²</b>.`,
          meta: { type: 'pusher-accelerates', in: { mA, mB, F } },
        };
      }
      const [i1, i2, a1] = turnAs(ctx, 5, 'a', [range(11), range(11), [0.8, 1.2, 1.5, 2, 2.4, 3]], (x, y, acc) => x !== y && (PEOPLE[x] * acc) / PEOPLE[y] >= 0.3 && apart((PEOPLE[x] * acc) / PEOPLE[y], PEOPLE[x], PEOPLE[y], acc));
      const m1 = PEOPLE[i1], m2 = PEOPLE[i2], F = m1 * a1, a2 = F / m2;
      return {
        topic: T.pairs, text: `Two skaters, ${m1} kg and ${m2} kg, push off each other on smooth ice. While they push, the ${m1} kg skater accelerates at ${a1} m/s². How big is the acceleration of the ${m2} kg skater?`,
        answer: numAns(a2, 'm/s²'),
        solution: `They push on each other with forces of the same size (the third law). On the ${m1} kg skater, F = ma = ${m1} × ${a1} = ${num(F)} N. The same ${num(F)} N acts on the ${m2} kg skater, so a = ${num(F)} ÷ ${m2} = <b>${ans(a2)} m/s²</b>.`,
        meta: { type: 'skaters-push-apart', in: { m1, a1, m2 } },
      };
    }
    if (type === 3) {
      const [mc, mt] = turn(ctx, 5, [[900, 1000, 1200, 1500], [3000, 4500, 6000, 7500, 9000]], (c, t) => apart(t / c, c, t));
      const r = mt / mc, crash = `A ${num(mc)} kg car and a ${num(mt)} kg truck collide head-on.`;
      if (j % 2 === 0) {
        return {
          topic: T.pairs, text: `${crash} During the collision, how many times as big as the truck’s acceleration is the car’s?`,
          answer: numAns(r, ''),
          solution: `By the third law, the car and the truck push on each other with forces of the same size, F. The car’s acceleration is F ÷ ${num(mc)} and the truck’s is F ÷ ${num(mt)}, so the car’s is ${num(mt)} ÷ ${num(mc)} = <b>${ans(r)}</b> times as big.`,
          meta: { type: 'crash-ratio', in: { car: mc, truck: mt } },
        };
      }
      const right = 'They push on each other with forces of the same size, but the car’s acceleration is bigger';
      return {
        topic: T.pairs, text: `${crash} Which is true during the collision?`,
        answer: oneOf(d, right, ['The truck pushes harder, so the car’s acceleration is bigger', 'They push equally hard, so their accelerations are the same size', 'The car pushes harder, but the truck’s acceleration is bigger']),
        solution: `By the third law the two forces are the same size. But a = F/m, and the car has ${num(mt)} ÷ ${num(mc)} = ${num(r)} times less mass, so its acceleration is ${num(r)} times bigger. <b>${right}</b>.`,
        meta: { type: 'crash-forces', in: { car: mc, truck: mt } },
      };
    }
    const PAIRS = ['The Earth pulls a ball down, and the ball pulls the Earth up', 'A swimmer pushes the water back, and the water pushes the swimmer forward', 'Your hand pushes on a wall, and the wall pushes on your hand',
      'A rocket pushes its exhaust gas down, and the gas pushes the rocket up', 'A magnet pulls a nail, and the nail pulls the magnet', 'A tire pushes back on the road, and the road pushes the tire forward'];
    const NOT = ['The Earth pulls a book down, and a table pushes the book up', 'A rope pulls a box forward, and friction pulls the box back', 'A lamp’s weight pulls it down, and its cord pulls it up',
      'The road pushes a car forward, and air resistance pushes it back', 'A skydiver’s weight pulls her down, and air resistance pushes her up', 'A boat’s weight pulls it down, and the water holds it up'];
    const [rights, wrongs] = fours(j, PAIRS, NOT);
    return {
      topic: T.pairs, text: 'Which of these are Newton’s third law pairs? <span class="muted">Choose all that fit.</span>',
      answer: allOf(d, rights, wrongs),
      tip: 'In a third-law pair, the two forces act on different bodies: A on B and B on A.',
      solution: `A third-law pair is A on B and B on A, the same kind of force. In ${quoted(wrongs)}, both forces act on the same body, so those aren’t pairs, even when they balance. Choose ${bold(rights)}.`,
      meta: { type: 'which-pairs', in: { pairs: rights, notPairs: wrongs } },
    };
  },

  // 7. weight: W = mg, a force in newtons that changes with g; the mass, in kilograms, is the same everywhere
  (d, ctx) => {
    const type = ctx.k % 5, j = Math.floor(ctx.k / 5);
    const THINGS = [['suitcase', 18], ['bag of sand', 25], ['dog', 32], ['backpack', 7], ['bicycle', 13], ['television', 9], ['person', 64], ['sack of rice', 45], ['toolbox', 12], ['person', 78], ['dog', 21], ['suitcase', 23]];
    const WORLDS = [['the Moon', 1.62], ['Mars', 3.71]];
    if (type === 0) {
      const [i] = turn(ctx, 5, [range(THINGS.length)]), [thing, m] = THINGS[i], W = m * G;
      return {
        topic: T.weight, text: `What is the weight of a ${m} kg ${thing} on Earth?`,
        answer: numAns(W, 'N'),
        solution: `Weight is the pull of gravity on the ${thing}, straight down: W = mg = ${m} × 9.81 = <b>${ans(W)} N</b>.`,
        meta: { type: 'weight-on-earth', in: { m, g: G } },
      };
    }
    if (type === 1) {
      const HEAVY = [['sack of flour', 49], ['sack of flour', 98], ['crate of apples', 150], ['crate of apples', 245], ['person', 441], ['person', 539], ['person', 686], ['person', 760], ['box of books', 196], ['box of books', 300], ['suitcase', 220], ['dog', 265]];
      const [i] = turn(ctx, 5, [range(HEAVY.length)]), [thing, W] = HEAVY[i], m = W / G;
      return {
        topic: T.weight, text: `A ${thing} weighs ${W} N on Earth. What is the ${thing}’s mass?`,
        answer: numAns(m, 'kg'),
        solution: `W = mg, so m = W ÷ g = ${W} ÷ 9.81 = <b>${ans(m)} kg</b>.`,
        meta: { type: 'mass-from-weight', in: { W, g: G } },
      };
    }
    if (type === 2) {
      // (each asks from the numbers it shows: a mass and g, a weight on Earth and both g's, or a weight there and its g)
      const ask = j % 3, [w, x, s] = turn(ctx, 5, [[0, 1], range(6), range(3)]);
      const [where, g] = WORLDS[w], thing = ['astronaut', 'robot rover', 'toolbox'][s], mass = [[62, 68, 74, 80, 85, 90], [24, 30, 36, 45, 56, 70], [6, 9, 12, 15, 18, 22]][s][x];
      if (ask === 0) {
        const m = mass, W = m * g;
        return {
          topic: T.weight, text: `What does a ${m} kg ${thing} weigh on ${where}, where g = ${g} m/s²?`,
          answer: numAns(W, 'N'),
          solution: `The mass is still ${m} kg on ${where}, but g is smaller there: W = mg = ${m} × ${g} = <b>${ans(W)} N</b>.`,
          meta: { type: 'weight-elsewhere', in: { m, g } },
        };
      }
      if (ask === 1) {
        const WE = round(mass * G, 2), m = WE / G, W = m * g;
        return {
          topic: T.weight, text: `A ${thing} weighs ${num(WE)} N on Earth, where g = 9.81 m/s². What does it weigh on ${where}, where g = ${g} m/s²?`,
          answer: numAns(W, 'N'),
          solution: `First the mass, which is the same everywhere: m = W ÷ g = ${num(WE)} ÷ 9.81 = ${num(m, 3)} kg. On ${where}: W = mg = ${num(m, 3)} × ${g} = <b>${ans(W)} N</b>.`,
          meta: { type: 'weight-earth-to-elsewhere', in: { W: WE, gEarth: G, g } },
        };
      }
      const W = round(mass * g, 2), m = W / g;
      return {
        topic: T.weight, text: `A ${thing} weighs ${num(W)} N on ${where}, where g = ${g} m/s². What is the ${thing}’s mass?`,
        answer: numAns(m, 'kg'),
        solution: `W = mg, so m = W ÷ g = ${num(W)} ÷ ${g} = <b>${ans(m)} kg</b>, the same as it would be on Earth.`,
        meta: { type: 'mass-from-weight-elsewhere', in: { W, g } },
      };
    }
    if (type === 3) {
      const [m] = turn(ctx, 5, [[12, 15, 20, 25, 40, 50, 60, 72]]);
      const [text, right, wrongs, why, kind] = [
        [`An astronaut has a mass of ${m} kg on Earth. What is her mass on the Moon, where g = 1.62 m/s²?`, `${m} kg`, [`${num((m * 1.62) / G)} kg`, `${num(m * 1.62)} kg`, '0 kg'],
          'Mass is the amount of matter in her, so it doesn’t change from place to place. Only her weight (mg) changes', 'mass-on-moon'],
        [`A ${m} kg box is taken from Earth to Mars, where g = 3.71 m/s². Which is true?`, `Its mass stays ${m} kg, but its weight drops from ${num(m * G)} N to ${num(m * 3.71)} N`, ['Its mass and its weight both drop', `Its mass drops, but its weight stays ${num(m * G)} N`, 'Its mass and its weight both stay the same'],
          `Mass doesn’t depend on where it is, but W = mg does: ${m} × 9.81 = ${num(m * G)} N on Earth and ${m} × 3.71 = ${num(m * 3.71)} N on Mars`, 'earth-to-mars'],
        [`Where would a ${m} kg rock weigh the most?`, 'On Earth (g = 9.81 m/s²)', ['On Mars (g = 3.71 m/s²)', 'On the Moon (g = 1.62 m/s²)', 'The same everywhere, since its mass doesn’t change'],
          'W = mg: the mass is the same everywhere, so the weight is biggest where g is biggest', 'heaviest-where'],
        ['Which unit is a weight measured in?', 'Newtons (N), since a weight is a force', ['Kilograms (kg)', 'Meters per second squared (m/s²)', 'Kilograms per meter (kg/m)'],
          'Weight is the force of gravity on a body, and forces are measured in newtons. Kilograms are for mass', 'weight-unit'],
      ][j];
      return {
        topic: T.weight, text, answer: oneOf(d, right, wrongs),
        solution: j === 0 ? `${why}. Her mass on the Moon is <b>${right}</b>.` : `${why}. <b>${right}</b>.`,
        meta: { type: kind, in: j < 3 ? { m, ...(j === 0 ? { g: 1.62 } : j === 1 ? { g: 3.71 } : {}) } : {} },
      };
    }
    const MASS = ['Measured in kilograms (kg)', 'The same on the Moon as on Earth', 'The amount of matter in a body', 'A scalar: it has no direction', 'Doesn’t depend on where the body is', 'A measure of a body’s inertia'];
    const WEIGHT = ['Measured in newtons (N)', 'A force', 'Smaller on the Moon than on Earth', 'Points straight down, toward the planet’s center', 'Equal to mg', 'Changes when g changes'];
    const [a, b] = turn(ctx, 5, [range(6), range(6)]), ms = some(MASS, a, 3), ws = some(WEIGHT, b, 3);
    return {
      topic: T.weight, text: 'Is each one true of mass or of weight? <span class="muted">Put each one on its side.</span>',
      answer: sortOut(d, ['Mass', 'Weight'], [...ms.map((x) => [x, 0]), ...ws.map((x) => [x, 1])]),
      tip: 'Mass is how much matter (kg), the same everywhere. Weight is the pull of gravity on it (N), W = mg.',
      solution: `<b>Mass</b>: ${quoted(ms)}. <b>Weight</b>: ${quoted(ws)}.`,
      meta: { type: 'sort-mass-weight', in: { mass: ms, weight: ws } },
    };
  },

  // 8. the normal force: perpendicular to the surface it pushes from. On a level floor N = mg; pressed down by F,
  // N = mg + F; pulled up by F, N = mg − F; on a slope, N = mg cos θ; with a rope at θ above the level, N = mg − F sin θ
  (d, ctx) => {
    const type = ctx.k % 5, j = Math.floor(ctx.k / 5);
    if (type === 0) {
      const ON = [['crate', 'rests on', 8, 60], ['box', 'sits on', 8, 40], ['person', 'stands on', 40, 75], ['desk', 'stands on', 12, 40], ['washing machine', 'stands on', 50, 75]];
      const [m, s] = turn(ctx, 5, [[8, 12, 15, 20, 25, 35, 40, 50, 60, 75], range(ON.length)], (mass, who) => mass >= ON[who][2] && mass <= ON[who][3]);
      const [thing, verb] = ON[s], N = m * G;
      return {
        topic: T.normal, text: `A ${m} kg ${thing} ${verb} a level floor. How big is the normal force on the ${thing}?`,
        figure: forces([[90, N, 'N'], [270, N, 'W']], `the forces on the ${thing}`),
        answer: numAns(N, 'N'),
        solution: `On the ${thing}, take up as positive. The ${thing} doesn’t move up or down, so ΣFy = N − W = 0, and the floor pushes straight up with N = W = mg = ${m} × 9.81 = <b>${ans(N)} N</b>.`,
        meta: { type: 'level-floor', in: { m } },
      };
    }
    if (type === 1) {
      if (j % 2 === 0) {
        const [m, F] = turnAs(ctx, 5, 'd', [[4, 5, 6, 8, 10, 12, 15, 20, 25], [10, 15, 20, 25, 30, 40, 50, 60]], (mass, f) => f <= 1.2 * mass * G && apart(mass * G + f, mass, f));
        const N = m * G + F;
        return {
          topic: T.normal, text: `A ${m} kg box rests on a level table. You press straight down on top of it with a force F = ${F} N. How big is the normal force from the table?`,
          figure: floor({ box: `${m} kg`, force: { angle: -90, label: `F = ${F} N`, from: 'behind' }, label: `a ${m} kg box pressed down by ${F} N` }),
          answer: numAns(N, 'N'),
          solution: `On the box, take up as positive. It stays put, so ΣFy = N − W − F = 0, and N = mg + F = ${m} × 9.81 + ${F} = ${num(m * G, 3)} + ${F} = <b>${ans(N)} N</b>.`,
          meta: { type: 'pressed-down', in: { m, F } },
        };
      }
      const [m, F] = turnAs(ctx, 5, 'u', [[4, 5, 6, 8, 10, 12, 15, 20, 25], [10, 15, 20, 25, 30, 40, 50, 60]], (mass, f) => f <= 0.75 * mass * G && apart(mass * G - f, mass, f));
      const N = m * G - F;
      return {
        topic: T.normal, text: `A ${m} kg box rests on a level floor. A rope pulls straight up on it with a force F = ${F} N, not enough to lift it. How big is the normal force from the floor?`,
        figure: floor({ box: `${m} kg`, force: { angle: 90, label: `F = ${F} N` }, label: `a ${m} kg box pulled up by ${F} N` }),
        answer: numAns(N, 'N'),
        solution: `On the box, take up as positive. It stays on the floor, so ΣFy = N + F − W = 0, and N = mg − F = ${m} × 9.81 − ${F} = ${num(m * G, 3)} − ${F} = <b>${ans(N)} N</b>.`,
        meta: { type: 'pulled-up', in: { m, F } },
      };
    }
    if (type === 2) {
      const [m, a] = turn(ctx, 5, [[5, 8, 10, 12, 15, 20, 25], [15, 20, 25, 30, 35, 40, 45, 50, 60]], (mass, ang) => apart(mass * G * cos(ang), mass, ang));
      const N = m * G * cos(a), still = a <= 25;
      return {
        topic: T.normal, text: `A ${m} kg box ${still ? 'sits still on' : 'slides down'} a slope at ${a}° to the horizontal. How big is the normal force on it?`,
        figure: slope({ angle: a, box: `${m} kg`, moving: still ? null : 'down', label: `a ${m} kg box on a ${a}° slope` }),
        answer: numAns(N, 'N'),
        solution: `On the box, take y perpendicular to the slope. Its weight splits into W sin θ down the slope and W cos θ into it, and it doesn’t move off or into the slope, so ΣFy = N − W cos θ = 0: N = mg cos θ = ${m} × 9.81 × cos ${a}° = <b>${ans(N)} N</b>.`,
        meta: { type: 'on-a-slope', in: { m, angle: a } },
      };
    }
    if (type === 3) {
      const [m, F, a] = turn(ctx, 5, [[10, 15, 20, 25, 30, 40, 50], [40, 50, 60, 80, 100, 120], [20, 25, 30, 35, 40, 45, 50]],
        (mass, f, ang) => mass * G - f * sin(ang) >= 0.3 * mass * G && apart(mass * G - f * sin(ang), mass, f, ang));
      const N = m * G - F * sin(a);
      return {
        topic: T.normal, text: `A ${m} kg box is pulled along a level floor by a rope at ${a}° above the horizontal, with a tension T = ${F} N. How big is the normal force on the box?`,
        figure: floor({ box: `${m} kg`, force: { angle: a, label: `T = ${F} N` }, label: `a ${m} kg box pulled by a rope at ${a}°` }),
        answer: numAns(N, 'N'),
        solution: `On the box, take up as positive. The rope’s pull splits into T cos θ along the floor and T sin θ up. The box stays on the floor, so ΣFy = N + T sin θ − W = 0: N = mg − T sin θ = ${m} × 9.81 − ${F} × sin ${a}° = ${num(m * G, 3)} − ${num(F * sin(a), 3)} = <b>${ans(N)} N</b>.`,
        meta: { type: 'rope-at-angle', in: { m, T: F, angle: a } },
      };
    }
    const [a] = turn(ctx, 5, [[15, 20, 25, 30]]);
    const [text, right, wrongs, why, kind] = [
      [`A box rests on a ramp tilted at ${a}° to the horizontal. Which way does the normal force on it point?`, 'At right angles to the ramp, away from its surface', ['Straight up', 'Straight down', 'Up along the ramp'],
        'A surface can only push straight out of itself, so the normal force is perpendicular to the ramp, not to the ground', 'normal-direction'],
      [`A box sits still on a slope at ${a}° to the horizontal. How does the normal force on it compare with its weight?`, 'It is smaller than the weight: N = mg cos θ', ['It equals the weight', 'It is bigger than the weight', 'It is zero, since the slope isn’t level'],
        `Only the part of the weight into the slope, W cos θ, is pushed back by the slope, and cos ${a}° is less than 1`, 'slope-vs-weight'],
      [`A rope pulls a box along a level floor at ${a}° above the horizontal. How does the normal force compare with the box’s weight?`, 'It is smaller: the rope holds up part of the weight', ['It equals the weight', 'It is bigger: the rope adds to it', 'It is zero once the box moves'],
        'The rope’s pull has a part T sin θ upward, so the floor only has to push up with N = mg − T sin θ', 'rope-vs-weight'],
      ['You press down on top of a box resting on the floor. What happens to the normal force from the floor?', 'It becomes bigger than the box’s weight', ['It stays equal to the box’s weight', 'It becomes smaller than the box’s weight', 'It becomes zero'],
        'Now the floor holds up the weight and your push too: N = mg + F', 'pressed-vs-weight'],
    ][j];
    return {
      topic: T.normal, text, answer: oneOf(d, right, wrongs),
      solution: `${why}. <b>${right}</b>.`,
      meta: { type: kind, in: j < 3 ? { angle: a } : {} },
    };
  },

  // 9. friction: f = μN, against the motion (or the way it would slide), when it slides or is just about to; on a level
  // floor N = mg, on a slope N = mg cos θ. More μ or more N means more friction; a moving box's speed doesn't matter
  (d, ctx) => {
    const type = ctx.k % 5, j = Math.floor(ctx.k / 5);
    if (type === 0) {
      const [N, mu, s] = turn(ctx, 5, [[80, 120, 150, 200, 240, 300, 400, 500], [0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5], range(3)], (n, u) => apart(u * n, n, u));
      const thing = ['box', 'sled', 'filing cabinet'][s], f = mu * N;
      return {
        topic: T.friction, text: `A ${thing} slides to the right across a ${s === 1 ? 'level patch of snow' : 'level floor'}, with nothing pushing it. The normal force on it is N = ${N} N, and the coefficient of friction is μ = ${mu}. How big is the friction force f on it?`,
        figure: forces([[90, N, `N = ${N} N`], [270, N, 'W'], [180, f, 'f = ?']], `the forces on the ${thing}`),
        answer: numAns(f, 'N'),
        solution: `It is sliding, so friction has its full value, against the motion (to the left): f = μN = ${mu} × ${N} = <b>${ans(f)} N</b>.`,
        meta: { type: 'f-from-N', in: { N, mu } },
      };
    }
    if (type === 1) {
      const [m, mu, s] = turn(ctx, 5, [[5, 8, 10, 12, 15, 20, 25, 30, 40, 50], [0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5, 0.6], range(3)], (mass, u) => apart(u * mass * G, mass, u));
      const thing = ['crate', 'box', 'cabinet'][s], W = m * G, f = mu * W;
      if (j % 2 === 0) {
        return {
          topic: T.friction, text: `A ${m} kg ${thing} slides across a level floor. The coefficient of friction between them is μ = ${mu}. How big is the friction force on it?`,
          figure: floor({ box: `${m} kg`, mu: `μ = ${mu}`, moving: 'right', label: `a ${m} kg ${thing} sliding on a floor with μ = ${mu}` }),
          answer: numAns(f, 'N'),
          solution: `On the ${thing}, up and down: ΣFy = N − W = 0, so N = mg = ${m} × 9.81 = ${num(W, 3)} N. It is sliding, so friction acts against the motion with f = μN = ${mu} × ${num(W, 3)} = <b>${ans(f)} N</b>.`,
          meta: { type: 'f-sliding-level', in: { m, mu } },
        };
      }
      return {
        topic: T.friction, text: `A ${m} kg ${thing} rests on a level floor, where μ = ${mu}. You push it sideways with a force F, harder and harder. How big is the friction on it when it is just about to slide?`,
        figure: floor({ box: `${m} kg`, mu: `μ = ${mu}`, force: { angle: 0, label: 'F', from: 'behind' }, label: `a ${m} kg ${thing} pushed on a floor with μ = ${mu}` }),
        answer: numAns(f, 'N'),
        solution: `On the ${thing}, up and down: N = mg = ${m} × 9.81 = ${num(W, 3)} N. Just about to slide, friction has reached its full value, against your push: f = μN = ${mu} × ${num(W, 3)} = <b>${ans(f)} N</b>.`,
        meta: { type: 'f-about-to-slide', in: { m, mu } },
      };
    }
    if (type === 2) {
      if (j % 2 === 0) {
        const [f, N] = turnAs(ctx, 5, 'n', [[18, 24, 30, 36, 45, 60, 75, 90, 120], [100, 120, 150, 200, 250, 300, 400]], (fr, n) => fr / n >= 0.1 && fr / n <= 0.6 && apart(fr / n, fr, n));
        const mu = f / N;
        return {
          topic: T.friction, text: `The friction on a box sliding across a floor is f = ${f} N, and the normal force on it is N = ${N} N. What is the coefficient of friction μ?`,
          figure: forces([[90, N, `N = ${N} N`], [270, N, 'W'], [180, f, `f = ${f} N`]], 'the forces on the sliding box'),
          answer: numAns(mu, ''),
          solution: `f = μN, so μ = f ÷ N. Newtons over newtons, so μ has no unit: μ = ${f} ÷ ${N} = <b>${ans(mu)}</b>.`,
          meta: { type: 'mu-from-f-N', in: { f, N } },
        };
      }
      const [m, f] = turnAs(ctx, 5, 'm', [[5, 8, 10, 12, 15, 20, 25, 30, 40], [18, 24, 30, 36, 45, 60, 75, 90, 120]], (mass, fr) => fr / (mass * G) >= 0.1 && fr / (mass * G) <= 0.6 && apart(fr / (mass * G), mass, fr));
      const W = m * G, mu = f / W;
      return {
        topic: T.friction, text: `A ${m} kg box slides across a level floor, and the friction on it is ${f} N. What is the coefficient of friction μ between the box and the floor?`,
        figure: floor({ box: `${m} kg`, mu: 'μ = ?', moving: 'right', label: `a ${m} kg box sliding on a floor` }),
        answer: numAns(mu, ''),
        solution: `On the box, up and down N = mg = ${m} × 9.81 = ${num(W, 3)} N. Then f = μN gives μ = f ÷ N = ${f} ÷ ${num(W, 3)} = <b>${ans(mu)}</b> (no unit).`,
        meta: { type: 'mu-from-f-m', in: { m, f } },
      };
    }
    if (type === 3) {
      if (j % 2 === 0) {
        const [m, a, mu] = turnAs(ctx, 5, 'd', [[5, 8, 10, 12, 15, 20, 25], [20, 25, 30, 35, 40, 45, 50], [0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5]],
          (mass, ang, u) => Math.tan(rad(ang)) > u + 0.05 && apart(u * mass * G * cos(ang), mass, ang, u));
        const N = m * G * cos(a), f = mu * N;
        return {
          topic: T.friction, text: `A ${m} kg box slides down a slope at ${a}° to the horizontal. The coefficient of friction is μ = ${mu}. How big is the friction force on the box?`,
          figure: slope({ angle: a, box: `${m} kg`, mu: `μ = ${mu}`, moving: 'down', label: `a ${m} kg box sliding down a ${a}° slope` }),
          answer: numAns(f, 'N'),
          solution: `On the box, take y perpendicular to the slope: ΣFy = N − mg cos θ = 0, so N = ${m} × 9.81 × cos ${a}° = ${num(N, 3)} N. It slides down, so friction acts up the slope with f = μN = ${mu} × ${num(N, 3)} = <b>${ans(f)} N</b>.`,
          meta: { type: 'f-sliding-down-slope', in: { m, angle: a, mu } },
        };
      }
      const [m, a, mu] = turnAs(ctx, 5, 'u', [[5, 8, 10, 12, 15, 20, 25], [15, 20, 25, 30, 35, 40], [0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5]], (mass, ang, u) => apart(u * mass * G * cos(ang), mass, ang, u));
      const N = m * G * cos(a), f = mu * N;
      return {
        topic: T.friction, text: `A ${m} kg box is pushed up a slope at ${a}° to the horizontal by a force F parallel to the slope, and it slides up. The coefficient of friction is μ = ${mu}. How big is the friction force on the box?`,
        figure: slope({ angle: a, box: `${m} kg`, mu: `μ = ${mu}`, push: { dir: 'up', label: 'F' }, moving: 'up', label: `a ${m} kg box pushed up a ${a}° slope` }),
        answer: numAns(f, 'N'),
        solution: `On the box, take y perpendicular to the slope. The push is along the slope, so it doesn’t change N: ΣFy = N − mg cos θ = 0, and N = ${m} × 9.81 × cos ${a}° = ${num(N, 3)} N. It slides up, so friction acts down the slope with f = μN = ${mu} × ${num(N, 3)} = <b>${ans(f)} N</b>.`,
        meta: { type: 'f-sliding-up-slope', in: { m, angle: a, mu } },
      };
    }
    if (j === 0) {
      const MORE = ['Stacking another box on top of it', 'Sliding it over a rougher floor, with a bigger μ', 'Pressing down on top of it as it slides'];
      const NOT = ['Sliding it faster', 'Waxing the floor, so that μ is smaller', 'Lifting up on it a little with a rope', 'Taking half of what’s inside it out'];
      const wrongs = d.shuffle(NOT).slice(0, 3);
      return {
        topic: T.friction, text: 'A crate slides across a floor. Which of these would make the friction on it bigger? <span class="muted">Choose all that fit.</span>',
        answer: allOf(d, MORE, wrongs),
        tip: 'f = μN: only a bigger μ or a bigger normal force N makes more friction.',
        solution: `f = μN, so friction grows with μ (a rougher floor) or with N (anything that presses it down harder: a heavier load, or a push from above). Lifting it, waxing the floor or making it lighter do the opposite, and in this model its speed doesn’t matter. Choose ${bold(MORE)}.`,
        meta: { type: 'more-friction', in: { right: MORE, wrong: wrongs } },
      };
    }
    if (j === 1) {
      const [s] = turnAs(ctx, 5, 'w', [[0, 1, 2]]);
      const [text, right, wrongs, why] = [
        ['A box slides down a ramp. Which way does the friction on it point?', 'Up the ramp, against its motion', ['Down the ramp', 'Straight up', 'At right angles to the ramp'], 'Friction always acts against the motion (or the way it would slide), along the surface'],
        ['A box is pushed up a ramp and slides up it. Which way does the friction on it point?', 'Down the ramp, against its motion', ['Up the ramp, with the push', 'Straight down', 'At right angles to the ramp'], 'Friction always acts against the motion, along the surface'],
        ['A box rests on a ramp without sliding. Which way does the friction on it point?', 'Up the ramp, against the way it would slide', ['Down the ramp', 'Straight up', 'There is none, since the box isn’t moving'], 'Without friction the box would slide down, so friction acts up the ramp to hold it'],
      ][s];
      return {
        topic: T.friction, text, answer: oneOf(d, right, wrongs),
        solution: `${why}. <b>${right}</b>.`,
        meta: { type: 'friction-direction', in: { case: ['sliding-down', 'sliding-up', 'at-rest'][s] } },
      };
    }
    if (j === 2) {
      const [m, mu, P] = turnAs(ctx, 5, 'r', [[20, 25, 30, 40], [0.4, 0.5, 0.6], [30, 40, 50, 60]], (mass, u, p) => p <= 0.6 * u * mass * G && spread(p, u * mass * G, u * mass * G - p));
      const max = mu * m * G, right = `${P} N: just enough to balance your push`;
      return {
        topic: T.friction, text: `A ${m} kg box rests on a level floor, where μ = ${mu}. You push it sideways with ${P} N, and it doesn’t move. How big is the friction on it?`,
        figure: floor({ box: `${m} kg`, mu: `μ = ${mu}`, force: { angle: 0, label: `${P} N`, from: 'behind' }, label: `a ${m} kg box pushed with ${P} N` }),
        answer: oneOf(d, right, [`${num(max)} N: μmg`, '0 N: it isn’t moving', `${num(max - P)} N: μmg minus your push`]),
        solution: `The box stays at rest, so the forces along the floor balance and friction is just ${P} N. μN = ${mu} × ${m} × 9.81 = ${num(max)} N is only the most friction can be, when the box is just about to slide. <b>${right}</b>.`,
        meta: { type: 'friction-at-rest', in: { m, mu, push: P } },
      };
    }
    const [f, v1, v2] = turnAs(ctx, 5, 's', [[20, 30, 40, 60], [1, 2, 3], [4, 5, 6]]);
    const right = `${f} N: friction doesn’t depend on its speed`;
    return {
      topic: T.friction, text: `A box slides across a floor at ${v1} m/s, with ${f} N of friction on it. How big would the friction on it be if it slid across the same floor at ${v2} m/s?`,
      answer: oneOf(d, right, [`${num((f * v2) / v1)} N`, `${num((f * v1) / v2)} N`, `${num(f * (v2 / v1) ** 2)} N`]),
      solution: `f = μN, and neither μ nor N changes with the speed, so in this model the friction stays the same. <b>${right}</b>.`,
      meta: { type: 'friction-and-speed', in: { f, v1, v2 } },
    };
  },

  // 10. tension: a rope, cord or string pulls along itself, the same all along a light one. Hanging at rest, T = mg; one
  // box below another, the top rope holds both; over a light, frictionless pulley, the same tension on both sides
  (d, ctx) => {
    const type = ctx.k % 5, j = Math.floor(ctx.k / 5);
    if (type === 0) {
      const HANG = [['lamp', 'a light cord', 'cord', [3, 4, 5, 6]], ['punching bag', 'a light chain', 'chain', [20, 25, 30, 40]], ['bucket of water', 'a light rope', 'rope', [8, 10, 12, 15]], ['climber', 'a light rope', 'rope', [55, 62, 70, 80]], ['sign', 'a light cable', 'cable', [6, 9, 14, 18]]];
      const [h, i] = turn(ctx, 5, [range(HANG.length), range(4)]), [thing, from, rope, masses] = HANG[h], m = masses[i], Tn = m * G;
      return {
        topic: T.tension, text: `A ${m} kg ${thing} hangs at rest from ${from}. How big is the tension in the ${rope}?`,
        figure: forces([[90, Tn, 'T'], [270, Tn, 'W']], `the forces on the ${thing}`),
        answer: numAns(Tn, 'N'),
        solution: `On the ${thing}, take up as positive. It hangs at rest, so ΣFy = T − W = 0, and T = W = mg = ${m} × 9.81 = <b>${ans(Tn)} N</b>.`,
        meta: { type: 'hanging-at-rest', in: { m } },
      };
    }
    if (type === 1) {
      const [m1, m2] = turn(ctx, 5, [[2, 3, 4, 5, 6, 8, 10], [2, 3, 4, 5, 6, 8, 10, 12]], (a, b) => apart((a + b) * G, a, b) && apart(b * G, a, b));
      const top = j % 2 === 0, T1 = (m1 + m2) * G, T2 = m2 * G;
      return {
        topic: T.tension, text: `Box 1 (m₁ = ${m1} kg) hangs at rest from the ceiling by a light rope with tension T₁. Box 2 (m₂ = ${m2} kg) hangs below it from a second light rope, with tension T₂, tied to the bottom of box 1. How big is ${top ? 'T₁, the tension in the top rope' : 'T₂, the tension in the lower rope'}?`,
        figure: top ? forces([[90, T1, 'T₁'], [270, T1, '(m₁ + m₂)g']], 'the forces on the two boxes together') : forces([[90, T2, 'T₂'], [270, T2, 'm₂g']], 'the forces on box 2'),
        answer: numAns(top ? T1 : T2, 'N'),
        solution: top
          ? `On box 2, at rest: T₂ = m₂g = ${m2} × 9.81 = ${num(T2, 3)} N. On box 1, at rest, T₁ pulls up while its weight and T₂ pull down, so T₁ = m₁g + T₂: the top rope holds both boxes. T₁ = ${m1} × 9.81 + ${num(T2, 3)} = <b>${ans(T1)} N</b>.`
          : `The lower rope holds only box 2. On box 2, take up as positive: it hangs at rest, so ΣFy = T₂ − m₂g = 0, and T₂ = ${m2} × 9.81 = <b>${ans(T2)} N</b>.`,
        meta: { type: top ? 'top-rope' : 'lower-rope', in: { m1, m2 } },
      };
    }
    if (type === 2) {
      // (a new mass each time round, so the slanted pulls don't share an answer)
      const m = [8, 12, 20, 15][j], [s, a] = turn(ctx, 5, [range(3), [20, 30, 40]]), thing = ['sack', 'bucket', 'crate'][s], Tn = m * G, slant = j % 2 === 1;
      return {
        topic: T.tension, text: `A ${m} kg ${thing} hangs at rest from a light rope that runs up over a light, frictionless pulley. A worker holds the other end of the rope, pulling ${slant ? `at ${a}° to the vertical` : 'straight down'}. How hard does the worker pull?`,
        figure: forces([[90, Tn, 'T'], [270, Tn, 'W']], `the forces on the ${thing}`),
        answer: numAns(Tn, 'N'),
        solution: `On the ${thing}, at rest: ΣFy = T − W = 0, so T = mg = ${m} × 9.81 = ${num(Tn, 3)} N. A light rope over a light, frictionless pulley has the same tension on both sides${slant ? ', whichever way the other side runs' : ''}, so the worker pulls with <b>${ans(Tn)} N</b>.`,
        meta: { type: slant ? 'pulley-slanted' : 'pulley-straight', in: slant ? { m, angle: a } : { m } },
      };
    }
    if (type === 3) {
      const [F, m] = turn(ctx, 5, [[60, 80, 120, 150, 200], [3, 4, 5, 6, 8, 10]]);
      const [text, right, wrongs, why, kind] = [
        [`Two people pull on the ends of a light rope in opposite directions, each with a force of ${F} N. The rope doesn’t move. What is the tension in the rope?`, `${F} N`, [`${2 * F} N`, '0 N', `${F / 2} N`],
          `Each end is pulled with ${F} N, and that is the tension all along the rope. The two pulls don’t add up: one end could be tied to a wall instead, and the tension would still be ${F} N`, 'tug'],
        ['A rope tied to a box pulls it along the floor. Which way does the rope’s tension act on the box?', 'Along the rope, away from the box', ['Along the rope, pushing into the box', 'Straight up, whatever the rope’s angle', 'At right angles to the rope'],
          'A rope can only pull, and it pulls along its own length, so the tension on the box points along the rope, away from the box', 'tension-direction'],
        [`A ${m} kg lamp hangs at rest from a light cord. How does the tension at the top of the cord compare with the tension at the bottom?`, 'They are the same: a light cord has the same tension all along it', ['It is bigger at the top', 'It is bigger at the bottom', 'It is zero at the bottom'],
          `A light cord has no weight of its own to hold up, so the tension is ${num(m * G)} N all along it`, 'same-all-along'],
        [`A light rope runs over a light, frictionless pulley, with a ${m} kg box hanging at rest from one end. How does the tension in the other side of the rope compare?`, `It is the same: ${num(m * G)} N on both sides`, [`It is half: ${num((m * G) / 2)} N`, `It is double: ${num(2 * m * G)} N`, 'It is zero'],
          `The box hangs at rest, so its side has T = mg = ${m} × 9.81 = ${num(m * G)} N, and a light, frictionless pulley only changes the rope’s direction, not its tension`, 'pulley-both-sides'],
      ][j];
      return {
        topic: T.tension, text, answer: oneOf(d, right, wrongs),
        solution: j === 0 ? `${why}. The tension is <b>${right}</b>.` : `${why}. <b>${right}</b>.`,
        meta: { type: kind, in: j === 0 ? { F } : j >= 2 ? { m } : {} },
      };
    }
    if (j % 2 === 0) {
      const meter = j === 2, [Tn] = turnAs(ctx, 5, meter ? 'm' : 's', [meter ? [24.5, 39.2, 58.9, 73.6, 88.3] : [200, 300, 400, 500, 600, 750, 800]], (t) => apart(t / G, t));
      const m = Tn / G;
      return {
        topic: T.tension, text: meter
          ? `A fish hangs at rest from a light cord on a force meter (a spring scale marked in newtons), which reads ${num(Tn)} N. What is the mass of the fish?`
          : `A light rope breaks if its tension goes over ${Tn} N. What is the largest mass it can hold up, hanging at rest?`,
        figure: forces([[90, Tn, `T = ${num(Tn)} N`], [270, Tn, 'W = mg']], meter ? 'the forces on the fish' : 'the forces on the hanging mass'),
        answer: numAns(m, 'kg'),
        solution: `Hanging at rest, ΣFy = T − mg = 0, so T = mg and m = T ÷ g = ${num(Tn)} ÷ 9.81 = <b>${ans(m)} kg</b>.`,
        meta: { type: meter ? 'mass-from-meter' : 'largest-mass', in: { T: Tn } },
      };
    }
    const [m2, T1] = turnAs(ctx, 5, 'b', [[2, 3, 4, 5, 6, 8], [100, 150, 200, 250, 300]], (b, t) => t / G - b >= 1.5 && apart(t / G - b, b, t));
    const sum = T1 / G, m1 = sum - m2;
    return {
      topic: T.tension, text: `Two boxes hang at rest, one below the other: box 1 from the ceiling by a light rope, and box 2 (m₂ = ${m2} kg) from box 1 by another light rope. The tension in the top rope is T₁ = ${T1} N. What is the mass of box 1?`,
      figure: forces([[90, T1, `T₁ = ${T1} N`], [270, T1, '(m₁ + m₂)g']], 'the forces on the two boxes together'),
      answer: numAns(m1, 'kg'),
      solution: `The top rope holds both boxes. Taking them together, at rest: T₁ = (m₁ + m₂)g, so m₁ + m₂ = ${T1} ÷ 9.81 = ${num(sum, 3)} kg, and m₁ = ${num(sum, 3)} − ${m2} = <b>${ans(m1)} kg</b>.`,
      meta: { type: 'upper-mass', in: { m2, T1 } },
    };
  },

  // 11. falling: with no air resistance everything falls at g whatever its mass; with drag, ΣF = W − drag and the
  // acceleration shrinks as the drag grows with speed, until at terminal velocity drag = W, ΣF = 0 and a = 0
  (d, ctx) => {
    const type = ctx.k % 5, j = Math.floor(ctx.k / 5);
    const PEOPLE = [50, 55, 60, 65, 70, 75, 80, 90];
    if (type === 0) {
      const [i, D, he] = turn(ctx, 5, [range(8), [100, 150, 200, 250, 300, 350, 400, 450, 500, 600], [false, true]], (x, drag) => drag <= 0.85 * PEOPLE[x] * G && apart((PEOPLE[x] * G - drag) / PEOPLE[x], PEOPLE[x], drag));
      const m = PEOPLE[i], W = m * G, a = (W - D) / m, [she, her] = he ? ['he', 'his'] : ['she', 'her'];
      return {
        topic: T.fall, text: `A ${m} kg skydiver is falling. At one moment the air resistance (drag) on ${he ? 'him' : 'her'} is ${D} N. What is ${her} acceleration at that moment?`,
        figure: forces([[90, D, `drag = ${D} N`], [270, W, 'W']], 'the forces on the skydiver'),
        answer: numAns(a, 'm/s²'),
        solution: `On the skydiver, take down (the way ${she} falls) as positive. ${cap(her)} weight is W = mg = ${m} × 9.81 = ${num(W, 3)} N, and ΣF = W − drag = ma: ${num(W, 3)} − ${D} = ${m}a, so a = ${num(W - D, 3)} ÷ ${m} = <b>${ans(a)} m/s²</b>.`,
        meta: { type: 'a-with-drag', in: { m, drag: D } },
      };
    }
    if (type === 1) {
      if (j % 2 === 0) {
        const [i] = turnAs(ctx, 5, 't', [range(8)]), m = PEOPLE[i], D = m * G;
        return {
          topic: T.fall, text: `A ${m} kg skydiver has reached terminal velocity and falls at a steady speed. How big is the air resistance (drag) on her?`,
          figure: forces([[90, D, 'drag'], [270, D, 'W']], 'the forces on the skydiver'),
          answer: numAns(D, 'N'),
          solution: `On the skydiver: at terminal velocity she falls at a constant velocity, so a = 0 and ΣF = W − drag = 0. The drag equals her weight: drag = mg = ${m} × 9.81 = <b>${ans(D)} N</b>.`,
          meta: { type: 'drag-at-terminal', in: { m } },
        };
      }
      const [i, a] = turnAs(ctx, 5, 'a', [range(8), [1.5, 2, 2.5, 3.2, 4, 4.8, 5.5, 6.5, 7.5]], (x, acc) => apart(PEOPLE[x] * (G - acc), PEOPLE[x], acc));
      const m = PEOPLE[i], D = m * (G - a);
      return {
        topic: T.fall, text: `A ${m} kg skydiver is speeding up as she falls, with an acceleration of ${a} m/s². How big is the air resistance (drag) on her at that moment?`,
        figure: forces([[90, D, 'drag = ?'], [270, m * G, 'W']], 'the forces on the skydiver'),
        answer: numAns(D, 'N'),
        solution: `On the skydiver, take down as positive. ΣF = W − drag = ma, so drag = mg − ma = m(g − a) = ${m} × (9.81 − ${a}) = ${m} × ${num(G - a, 3)} = <b>${ans(D)} N</b>.`,
        meta: { type: 'drag-from-a', in: { m, a } },
      };
    }
    if (type === 2) {
      // (each of the three asks, and each place on the curve, at least once)
      const [ask, at] = [['drag', 'curve'], ['a', 'start'], ['net', 'flat'], ['a', 'curve']][j], [vT] = turn(ctx, 5, [[50, 54, 56, 60]]);
      const v = (t) => vT * Math.tanh((G * t) / vT), tP = { start: 0, curve: (vT / G) * Math.atanh(0.6), flat: 15 }[at];
      const fig = graph({ x: [0, 20, 4], y: [0, 70, 10], xLabel: 'time t (s)', yLabel: 'velocity v (m/s)', curves: [{ f: v, from: 0, to: 20 }], points: [[tP, v(tP), 'P']] });
      const CH = {
        drag: ['How does the air resistance on her at point P compare with her weight?', { start: 'It is zero', curve: 'It is smaller than her weight, but not zero', flat: 'It equals her weight' }, 'It is bigger than her weight'],
        a: ['What is her acceleration at point P?', { start: '9.81 m/s², downward', curve: 'Less than 9.81 m/s², but more than zero', flat: 'Zero' }, 'More than 9.81 m/s²'],
        net: ['What is the net force on her at point P?', { start: 'Her whole weight, downward', curve: 'Downward, but smaller than her weight', flat: 'Zero' }, 'Upward'],
      }[ask];
      const right = CH[1][at], wrongs = [...Object.values(CH[1]).filter((x) => x !== right), CH[2]];
      const WHY = {
        start: 'At P she has only just started to fall, so her speed is zero and there is no air resistance yet. Her weight is the only force: ΣF = W, and a = W/m = g',
        curve: 'At P the graph still slopes up, but less steeply than at the start. She is still speeding up, so the air resistance has grown but is still less than her weight: ΣF = W − drag points down and is smaller than W, and a = ΣF/m is less than g',
        flat: 'At P the graph is flat: she falls at a constant (terminal) velocity. Then a = 0, so ΣF = 0 and the air resistance equals her weight',
      };
      const lead = { drag: '', a: 'Her acceleration at P: ', net: 'The net force on her at P: ' }[ask];
      return {
        topic: T.fall, text: `The graph shows the velocity of a skydiver who falls from rest, with air resistance. ${CH[0]}`,
        figure: fig, answer: oneOf(d, right, wrongs),
        solution: `${WHY[at]}. ${lead}<b>${lead ? low(right) : right}</b>.`,
        meta: { type: `graph-${ask}`, in: { at, terminal: vT, t: round(tP, 2) } },
      };
    }
    if (type === 3) {
      const [m, m2] = turn(ctx, 5, [[2, 3, 4, 5, 8], [10, 12, 15, 20]]);
      const [text, right, wrongs, why, kind] = [
        ['On the Moon there is no air, and g = 1.62 m/s². An astronaut drops a hammer and a feather from the same height at the same moment. What happens?', 'They fall side by side and land together', ['The hammer lands first', 'The feather floats down slowly', 'Neither falls, since there’s no air'],
          'With no air resistance, the only force on each is its weight, so both fall with a = g = 1.62 m/s², whatever their masses', 'moon-drop'],
        [`With no air resistance, what is the acceleration of a falling ${m} kg stone?`, '9.81 m/s², downward', [`${num(m * G)} m/s², downward`, `${num(G / m)} m/s², downward`, '0 m/s²'],
          `Its weight is the only force: ΣF = mg, so a = ΣF/m = mg/m = g. The ${m} kg doesn’t matter`, 'free-fall-a'],
        [`With no air resistance, a ${m2} kg ball weighs more than a ${m} kg ball, yet both fall with the same acceleration. Why?`, 'The heavier one also has more mass to speed up: a = W/m = mg/m = g for both', ['Gravity pulls just as hard on both of them', 'Weight doesn’t depend on mass', 'Falling doesn’t involve any force'],
          `The ${m2} kg ball has ${num(m2 / m)} times the weight, but also ${num(m2 / m)} times the mass to speed up, so the acceleration comes out the same`, 'why-same-a'],
        ['Taking down as positive, which describes the velocity–time graph of a stone falling from rest with no air resistance?', 'A straight line from the origin, sloping up at 9.81 m/s²', ['A curve that rises steeply, then levels off into a flat line', 'A flat line', 'A straight line sloping down'],
          'With no air resistance its acceleration stays g the whole way down, and a steady acceleration is a straight line on a v–t graph, with slope g', 'graph-no-air'],
      ][j];
      return {
        topic: T.fall, text, answer: oneOf(d, right, wrongs),
        solution: j === 1 ? `${why}. So a = <b>${right}</b>.` : `${why}. <b>${right}</b>.`,
        meta: { type: kind, in: j === 1 ? { m, g: G } : j === 2 ? { m1: m, m2 } : j === 3 ? { g: G } : { g: 1.62 } },
      };
    }
    if (j === 0) {
      const RIGHT = ['The air resistance on her equals her weight', 'The net force on her is zero', 'Her acceleration is zero', 'She keeps falling at a constant velocity'];
      const WRONG = ['She has stopped moving', 'Her weight is now zero', 'The air resistance is bigger than her weight', 'She is still speeding up a little'];
      const rights = d.shuffle(RIGHT).slice(0, 3), wrongs = d.shuffle(WRONG).slice(0, 3);
      return {
        topic: T.fall, text: 'A skydiver has reached her terminal velocity. Which of these are true? <span class="muted">Choose all that fit.</span>',
        answer: allOf(d, rights, wrongs),
        tip: 'Terminal velocity: drag = weight, so ΣF = 0, a = 0 and the velocity stays the same.',
        solution: `At terminal velocity the air resistance has grown to equal her weight, so ΣF = 0 and a = 0: she keeps falling, but at a constant velocity. Her weight hasn’t changed. Choose ${bold(rights)}.`,
        meta: { type: 'terminal-true', in: { right: rights, wrong: wrongs } },
      };
    }
    if (j === 2) {
      const right = 'A curve that rises steeply at first, then bends over into a flat line';
      return {
        topic: T.fall, text: 'Which describes the velocity–time graph of a skydiver who falls from rest, with air resistance, until she reaches terminal velocity?',
        answer: oneOf(d, right, ['A straight line from the origin, sloping up at 9.81 m/s²', 'A flat line from the start', 'A curve that gets steeper and steeper']),
        solution: `At first there is no air resistance, so the slope (her acceleration) is g. As she speeds up, the drag grows and the slope gets smaller, until at terminal velocity the drag equals her weight, a = 0 and the line is flat. <b>${right}</b>.`,
        meta: { type: 'graph-with-air', in: {} },
      };
    }
    const STEPS = j === 1
      ? ['She steps out of the plane: her speed is zero, so there is no air resistance yet and a = g', 'She speeds up, so the air resistance grows and her acceleration gets smaller', 'The air resistance grows until it equals her weight: ΣF = 0, so a = 0', 'She falls at a constant velocity, her terminal velocity']
      : ['She steps out of the plane: no air resistance yet, so a = g', 'She speeds up: the air resistance grows and her acceleration shrinks', 'The air resistance equals her weight, and she falls at a steady terminal velocity', 'She opens her parachute: the air resistance jumps above her weight, so she slows down', 'As she slows, the air resistance shrinks back toward her weight', 'The air resistance equals her weight again: she falls at a new, much slower terminal velocity'];
    return {
      topic: T.fall, text: `Put the stages of a skydiver’s fall in order, from when she jumps${j === 1 ? '' : ' to when she floats down under her open parachute'}. <span class="muted">Tap them in order.</span>`,
      answer: inOrder(d, STEPS),
      tip: 'The air resistance grows with speed. While it is less than the weight she speeds up; when it is more she slows down; when they are equal her velocity stays the same.',
      solution: `The drag grows with her speed, and ΣF = W − drag decides what happens next. In order: ${STEPS.map((s) => `<b>${low(s)}</b>`).join(' → ')}.`,
      meta: { type: j === 1 ? 'order-fall' : 'order-parachute', in: { steps: STEPS } },
    };
  },
];

export const forcesBank = bank('forces', templates.map((t) => (d, ctx) => tidy(t(d, ctx))), templates.length * 20);
