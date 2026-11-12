// Dynamics of Particles and Systems: 12 topics, 20 variants each (240). Newton’s second law, ΣF = ma, for one body on a
// level floor, on a slope and on a rope, then for bodies joined by ropes or pushed together. The solutions follow the
// class’s method: the way it moves is positive, ΣFx = ma along the motion and ΣFy = 0 across it, N from ΣFy = 0 and then
// f = μN, and for joined bodies one equation each, added so the tension cancels. Most variants draw the scene or the
// forces (mech.js). g = 9.81 m/s², as the class uses.
import { bank, combo, num, round } from '../kit/bank.js';
import { rad } from './draw.js';
import { fbd, slope, floor, table, atwood } from './mech.js';

const G = 9.81;
const numAns = (value, unit, tol = 0.02) => ({ kind: 'number', value: round(value, 4), unit, tol });
// an answer as the solution shows it: from the same value the answer keeps (to 4 places), so the two never round apart;
// below 1 to three places, so what it shows is always within the answer’s 2% (0.18 for 0.1752 wasn’t)
const ans = (x, d = 2) => num(round(x, 4), Math.abs(x) < 1 ? Math.max(d, 3) : d);
// a topic's question types take turns (variant k is type k % types), each walking through its own number combinations
const turn = (ctx, types, lists, ok) => combo({ ...ctx, k: Math.floor(ctx.k / types), salt: `${ctx.salt}-${ctx.k % types}` }, lists, ok);
// (for a type whose turns alternate between two cases, a yes and a no, say: each case walks through its own combinations)
const turnCase = (ctx, types, yes, lists, ok) => combo({ ...ctx, k: Math.floor(ctx.k / types / 2), salt: `${ctx.salt}-${ctx.k % types}-${yes ? 'yes' : 'no'}` }, lists, ok);
const oneOf = (d, right, wrongs) => { const list = d.shuffle([right, ...wrongs]); return { kind: 'choice', choices: list, correct: list.indexOf(right) }; };
const sin = (a) => Math.sin(rad(a)), cos = (a) => Math.cos(rad(a)), tan = (a) => Math.tan(rad(a));
// (no answer within 3% of a number the question gives, so copying one out of the question isn't marked right; nor of g,
// so an answer never looks like 9.81 by chance)
const apart = (answer, ...given) => [...given, G].every((x) => Math.abs(Math.abs(answer) - Math.abs(x)) > 0.03 * Math.abs(answer));
// a number that doesn't change the answer (a mass that cancels, say), tied to the ones that do, so that no two variants
// differ only in it
const tie = (list, ...xs) => { let h = 2166136261; for (const c of xs.join(',')) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return list[(h >>> 0) % list.length]; };
// "a" or "an" before a number, as it's said: an 8, an 11, an 18, an 80
const an = (x) => (/^(8|11(?!\d)|18(?!\d))/.test(String(x)) ? 'an' : 'a'), An = (x) => (an(x) === 'an' ? 'An' : 'A');
// numbers offered as choices: each more than 5% from every other one
const far = (...xs) => xs.every((x, i) => xs.every((y, j) => i === j || Math.abs(x - y) > 0.05 * Math.max(Math.abs(x), Math.abs(y))));
// the wrong numbers (real mistakes, in the order given) that are far from the right one and from each other, at most n
const spread = (right, wrongs, n = 3) => wrongs.reduce((kept, w) => (kept.length < n && Number.isFinite(w) && w >= 0 && far(right, w, ...kept) ? [...kept, w] : kept), []);

// the forces on a box on a slope, axes along it and across it: +x down the slope (the way it slides), +y out of it. The
// slope here rises to the left, so that +x and +y keep their usual turn. N, the weight and its two parts (dashed), and
// friction up the slope when it has some
function slopeFbd(th, W, { f = 0, N = W * cos(th), labels = {} } = {}) {
  const forces = [
    { angle: 90 - th, size: N, label: labels.N ?? 'N' },
    { angle: 270, size: W, label: labels.W ?? 'W' },
    { angle: -th, size: W * sin(th), label: `W sin ${th}°`, dash: true, tone: 1 },
    { angle: 270 - th, size: W * cos(th), label: `W cos ${th}°`, dash: true, tone: 1 },
  ];
  if (f) forces.push({ angle: 180 - th, size: f, label: labels.f ?? 'f' });
  return fbd({ axes: -th, forces, label: 'the forces on the box, with axes along and across the slope' });
}
// the forces on a box on a level floor, +x the way it moves: N up, W down, and the ones along the floor
const levelFbd = (W, along, N = W, caption = null) => fbd({ axes: 0, caption, forces: [{ angle: 90, size: N, label: 'N' }, { angle: 270, size: W, label: 'W' }, ...along], label: caption ? caption.toLowerCase() : 'the forces on the box' });
// the forces on a body hanging on a rope: T up, W down
const ropeFbd = (T, W, tLabel, wLabel) => fbd({ forces: [{ angle: 90, size: T, label: tLabel }, { angle: 270, size: W, label: wLabel }], label: 'the forces on the hanging body' });

const T = {
  one: 'One force, no friction', push: 'Pushing against friction', angle: 'Pulling at an angle', stop: 'Stopping on a level',
  smooth: 'Sliding down a smooth slope', rough: 'Sliding down a rough slope', up: 'Sliding up a slope',
  rope: 'Lifting and lowering on a rope', table: 'A table and a hanging mass', slopeRope: 'A slope and a hanging mass',
  atwood: 'Two masses over a pulley', together: 'Boxes pushed or pulled together',
};

const templates = [
  // 1. one force, no friction: ΣFx = F = ma along the floor, while ΣFy = N − W = 0 across it
  (d, ctx) => {
    const type = ctx.k % 5, j = Math.floor(ctx.k / 5);
    const [thing, where, on] = [['box', 'a smooth, level floor', 'floor'], ['sled', 'smooth, level ice', 'ice'], ['cart', 'a smooth, level track', 'track'], ['crate', 'a smooth, level floor', 'floor']][j];
    if (type === 0) {
      const [m, F] = turn(ctx, 5, [[2, 4, 5, 8, 10, 15, 20, 25, 40], [12, 18, 30, 40, 45, 50, 75, 90, 100, 120]], (M, P) => P / M >= 0.5 && P / M <= 12 && apart(P / M, M, P)), a = F / m;
      return {
        topic: T.one, text: `A horizontal force of ${F} N pulls ${an(m)} ${m} kg ${thing} across ${where} (no friction). What is the ${thing}’s acceleration?`,
        figure: floor({ box: `${m} kg`, force: { angle: 0, label: `F = ${F} N` }, moving: 'right' }),
        answer: numAns(a, 'm/s²'),
        solution: `On the ${thing}, with the pull’s way positive: up and down, ΣFy = N − W = 0, and along the ${on}, ΣFx = F = ma. So a = F/m = ${F} / ${m} = <b>${ans(a)} m/s²</b>.`,
        meta: { type: 'level-a', in: { m, F } },
      };
    }
    if (type === 1) {
      const [m, a] = turn(ctx, 5, [[3, 6, 8, 12, 15, 25, 30, 45, 60], [0.5, 1.5, 2, 2.5, 3, 4, 6]], (M, A) => M * A >= 3 && apart(M * A, M, A)), F = m * a;
      return {
        topic: T.one, text: `What horizontal force does it take to give ${an(m)} ${m} kg ${thing} on ${where} (no friction) an acceleration of ${num(a)} m/s²?`,
        figure: floor({ box: `${m} kg`, force: { angle: 0, label: 'F = ?' } }),
        answer: numAns(F, 'N'),
        solution: `On the ${thing}, with the force’s way positive: nothing else acts along the ${on}, so ΣFx = F = ma = ${m} × ${num(a)} = <b>${ans(F)} N</b>.`,
        meta: { type: 'level-force', in: { m, a } },
      };
    }
    if (type === 2) {
      const [F, a] = turn(ctx, 5, [[24, 36, 48, 60, 72, 90, 120, 150], [1.2, 1.5, 2, 2.4, 3, 4, 5, 6, 8]], (P, A) => P / A >= 2 && P / A <= 80 && apart(P / A, P, A)), m = F / a;
      return {
        topic: T.one, text: `A horizontal force of ${F} N gives a ${thing} on ${where} (no friction) an acceleration of ${num(a)} m/s². What is the ${thing}’s mass?`,
        figure: floor({ box: 'm = ?', force: { angle: 0, label: `F = ${F} N` }, moving: 'right' }),
        answer: numAns(m, 'kg'),
        solution: `On the ${thing}, with the force’s way positive: ΣFx = F = ma, so m = F/a = ${F} / ${num(a)} = <b>${ans(m)} kg</b>.`,
        meta: { type: 'level-mass', in: { F, a } },
      };
    }
    if (type === 3) {
      const [m, F, t] = turn(ctx, 5, [[4, 5, 8, 10, 16, 20, 25], [10, 20, 30, 40, 50, 60], [2, 3, 4, 5, 6]], (M, P, s) => P / M >= 0.5 && P / M <= 10 && (P / M) * s <= 12 && apart((P / M) * s, M, P, s)), a = F / m, v = a * t;
      return {
        topic: T.one, text: `${An(m)} ${m} kg ${thing} rests on ${where} (no friction). A steady horizontal push of ${F} N starts it moving. How fast is it going after ${t} s?`,
        figure: floor({ box: `${m} kg`, force: { angle: 0, label: `F = ${F} N`, from: 'behind' } }),
        answer: numAns(v, 'm/s'),
        solution: `On the ${thing}, with the push’s way positive: ΣFx = F = ma, so a = ${F} / ${m} = ${num(a, 3)} m/s². From rest, v = at = ${num(a, 3)} × ${t} = <b>${ans(v)} m/s</b>.`,
        meta: { type: 'level-speed', in: { m, F, t } },
      };
    }
    const [m, F, t] = turn(ctx, 5, [[2, 3, 5, 6, 10, 12, 15, 20], [6, 9, 12, 15, 18, 24, 30], [2, 3, 4, 5]], (M, P, s) => P / M >= 0.3 && P / M <= 8 && 0.5 * (P / M) * s * s <= 80 && apart(0.5 * (P / M) * s * s, M, P, s)), a = F / m, s = 0.5 * a * t * t;
    return {
      topic: T.one, text: `${An(m)} ${m} kg ${thing} starts from rest on ${where} (no friction) and is pulled by a steady horizontal force of ${F} N. How far does it go in the first ${t} s?`,
      figure: levelFbd(m * G, [{ angle: 0, size: F, label: `F = ${F} N` }]),
      answer: numAns(s, 'm'),
      solution: `On the ${thing}, with the pull’s way positive: ΣFx = F = ma, so a = ${F} / ${m} = ${num(a, 3)} m/s². From rest, s = ½at² = ½ × ${num(a, 3)} × ${t}² = <b>${ans(s)} m</b>.`,
      meta: { type: 'level-distance', in: { m, F, t } },
    };
  },

  // 2. pushing against friction: on a level floor N = mg, so a sliding box has f = μmg against it, and ΣFx = F − f = ma
  (d, ctx) => {
    const type = ctx.k % 5, j = Math.floor(ctx.k / 5);
    const thing = ['crate', 'box', 'trunk', 'crate'][j];
    if (type === 0) {
      const [m, mu, F] = turn(ctx, 5, [[5, 8, 10, 12, 15, 20, 25, 30, 40], [0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5], [40, 50, 60, 80, 100, 120, 150, 200]],
        (M, u, P) => { const f = u * M * G, a = (P - f) / M; return P >= 1.15 * f && a >= 0.3 && a <= 8 && apart(a, M, u, P); });
      const N = m * G, f = mu * N, a = (F - f) / m;
      return {
        topic: T.push, text: `A worker pushes ${an(m)} ${m} kg ${thing} across a level floor with a horizontal force of ${F} N, and it slides. The coefficient of friction between the ${thing} and the floor is ${num(mu)}. What is the ${thing}’s acceleration?`,
        figure: floor({ box: `${m} kg`, force: { angle: 0, label: `F = ${F} N`, from: 'behind' }, mu: `μ = ${num(mu)}`, moving: 'right' }),
        answer: numAns(a, 'm/s²'),
        solution: `On the ${thing}, with the push’s way positive: ΣFy = N − mg = 0, so N = ${m} × 9.81 = ${num(N, 3)} N and f = μN = ${num(mu)} × ${num(N, 3)} = ${num(f, 3)} N. ΣFx = F − f = ma, so a = (${F} − ${num(f, 3)}) / ${m} = <b>${ans(a)} m/s²</b>.`,
        meta: { type: 'friction-a', in: { m, mu, F } },
      };
    }
    if (type === 1) {
      const [m, mu, a] = turn(ctx, 5, [[6, 10, 15, 20, 25, 35, 50], [0.15, 0.2, 0.25, 0.3, 0.35, 0.4], [0.5, 1, 1.5, 2, 2.5, 3]], (M, u, A) => M * (A + u * G) <= 500 && apart(M * (A + u * G), M, u, A));
      const f = mu * m * G, F = m * a + f;
      return {
        topic: T.push, text: `${An(m)} ${m} kg ${thing} is pulled across a level floor by a horizontal rope, and it slides with a coefficient of friction of ${num(mu)}. How strong must the pull be to make it speed up at ${num(a)} m/s²?`,
        figure: floor({ box: `${m} kg`, force: { angle: 0, label: 'F = ?' }, mu: `μ = ${num(mu)}`, moving: 'right' }),
        answer: numAns(F, 'N'),
        solution: `On the ${thing}, with the pull’s way positive: N = mg, so f = μmg = ${num(mu)} × ${m} × 9.81 = ${num(f, 3)} N. ΣFx = F − f = ma, so F = ma + f = ${m} × ${num(a)} + ${num(f, 3)} = <b>${ans(F)} N</b>.`,
        meta: { type: 'friction-force', in: { m, mu, a } },
      };
    }
    if (type === 2) {
      // (the acceleration as measured, to a tenth; μ then comes from that)
      const measured = (M, u, P) => round((P - u * M * G) / M, 1), muOf = (M, P, A) => (P - M * A) / (M * G);
      const [m, mu0, F] = turn(ctx, 5, [[8, 10, 12, 15, 20, 25], [0.15, 0.2, 0.25, 0.3, 0.35, 0.4], [50, 60, 75, 80, 100, 120]],
        (M, u, P) => { const A = measured(M, u, P); const u2 = muOf(M, P, A); return A >= 0.5 && A <= 6 && u2 >= 0.1 && u2 <= 0.6 && apart(u2, M, P, A); });
      const a = measured(m, mu0, F), N = m * G, f = F - m * a, mu = f / N;
      return {
        topic: T.push, text: `A horizontal push of ${F} N slides ${an(m)} ${m} kg ${thing} across a level floor with an acceleration of ${num(a)} m/s². What is the coefficient of friction between the ${thing} and the floor?`,
        figure: floor({ box: `${m} kg`, force: { angle: 0, label: `F = ${F} N`, from: 'behind' }, mu: 'μ = ?', moving: 'right' }),
        answer: numAns(mu, ''),
        solution: `On the ${thing}, with the push’s way positive: ΣFx = F − f = ma, so f = ${F} − ${m} × ${num(a)} = ${num(f, 3)} N. ΣFy = 0 gives N = mg = ${num(N, 3)} N, so μ = f/N = ${num(f, 3)} / ${num(N, 3)} = <b>${ans(mu, 3)}</b>.`,
        meta: { type: 'friction-mu', in: { m, F, a } },
      };
    }
    if (type === 3) {
      const [m, mu, F, t] = turn(ctx, 5, [[10, 15, 20, 25, 30], [0.2, 0.25, 0.3, 0.4], [80, 100, 120, 150, 180], [2, 3, 4, 5]],
        (M, u, P, s) => { const f = u * M * G, a = (P - f) / M; return P >= 1.15 * f && a >= 0.4 && a <= 6 && a * s <= 10 && apart(a * s, M, u, P, s); });
      const f = mu * m * G, a = (F - f) / m, v = a * t;
      return {
        topic: T.push, text: `${An(m)} ${m} kg ${thing} is pulled from rest across a level floor by a horizontal rope with a steady ${F} N pull, and it slides (μ = ${num(mu)}). How fast is it moving after ${t} s?`,
        figure: floor({ box: `${m} kg`, force: { angle: 0, label: `F = ${F} N` }, mu: `μ = ${num(mu)}` }),
        answer: numAns(v, 'm/s'),
        solution: `On the ${thing}, with the pull’s way positive: f = μmg = ${num(mu)} × ${m} × 9.81 = ${num(f, 3)} N, and ΣFx = F − f = ma gives a = (${F} − ${num(f, 3)}) / ${m} = ${num(a, 3)} m/s². From rest, v = at = ${num(a, 3)} × ${t} = <b>${ans(v)} m/s</b>.`,
        meta: { type: 'friction-speed', in: { m, mu, F, t } },
      };
    }
    // (the wrong ones: friction forgotten, friction added, g forgotten in μmg, friction alone)
    const wrongsOf = (M, u, P) => { const f = u * M * G; return spread(P - f, [P, P + f, P - u * M, f]); };
    const [m, mu, F] = turn(ctx, 5, [[10, 15, 20, 25, 30, 40], [0.2, 0.25, 0.3, 0.4, 0.5], [100, 120, 150, 200, 250]], (M, u, P) => P >= 1.2 * u * M * G && wrongsOf(M, u, P).length === 3);
    const N = m * G, f = mu * N, net = F - f;
    return {
      topic: T.push, text: `${An(m)} ${m} kg box slides across a level floor, pushed by a horizontal force of ${F} N. The coefficient of friction is ${num(mu)}. What is the net force on the box?`,
      figure: floor({ box: `${m} kg`, force: { angle: 0, label: `F = ${F} N`, from: 'behind' }, mu: `μ = ${num(mu)}`, moving: 'right' }),
      answer: oneOf(d, `${num(net, 1)} N`, wrongsOf(m, mu, F).map((x) => `${num(x, 1)} N`)),
      solution: `ΣFy = 0 gives N = mg = ${num(N, 3)} N, so friction is f = μN = ${num(f, 3)} N, against the motion. With the push’s way positive, the net force is ΣF = F − f = ${F} − ${num(f, 3)} = <b>${num(net, 1)} N</b>.`,
      meta: { type: 'friction-net', in: { m, mu, F } },
    };
  },

  // 3. pulling at an angle: the rope's F sin θ lifts a little, so N = mg − F sin θ and friction μN is less; F cos θ pulls along
  (d, ctx) => {
    const type = ctx.k % 5, j = Math.floor(ctx.k / 5);
    const parts = (m, F, th, mu) => { const N = m * G - F * sin(th), f = mu * N; return { N, f, a: (F * cos(th) - f) / m }; };
    // (it stays on the floor, well pressed down, and slides: the pull along beats friction, and not by a silly amount)
    const fine = (m, F, th, mu) => { const { N, f, a } = parts(m, F, th, mu); return N >= 0.25 * m * G && F * cos(th) >= 1.15 * f && a >= 0.3 && a <= 8; };
    if (type === 0) {
      const [m, F, th, mu] = turn(ctx, 5, [[10, 12, 15, 20, 25, 30, 40], [40, 50, 60, 80, 100, 120], [15, 20, 25, 30, 35, 40, 45], [0.1, 0.2, 0.25, 0.3, 0.4]], (M, P, t, u) => fine(M, P, t, u) && apart(parts(M, P, t, u).a, M, P, t, u));
      const { N, f, a } = parts(m, F, th, mu);
      return {
        topic: T.angle, text: `A rope pulls ${an(m)} ${m} kg box across a level floor with a force of ${F} N, at ${th}° above the horizontal. The box slides, and the coefficient of friction is ${num(mu)}. What is its acceleration?`,
        figure: floor({ box: `${m} kg`, force: { angle: th, label: `F = ${F} N` }, mu: `μ = ${num(mu)}`, moving: 'right' }),
        answer: numAns(a, 'm/s²'),
        solution: `On the box: ΣFy = N + F sin θ − mg = 0, so N = ${m} × 9.81 − ${F} sin ${th}° = ${num(N, 3)} N, and f = μN = ${num(f, 3)} N. Along the floor, with the way it moves positive: ΣFx = F cos θ − f = ma, so a = (${F} cos ${th}° − ${num(f, 3)}) / ${m} = <b>${ans(a)} m/s²</b>.`,
        meta: { type: 'angle-a', in: { m, F, th, mu } },
      };
    }
    if (type === 1) {
      const [m, F, th] = turn(ctx, 5, [[8, 10, 12, 15, 20, 25, 30], [30, 40, 50, 60, 80, 100], [20, 25, 30, 35, 40, 45, 50, 55, 60]], (M, P, t) => { const N = M * G - P * sin(t); return N >= 0.25 * M * G && apart(N, M, P, t); });
      const W = m * G, up = F * sin(th), N = W - up;
      return {
        topic: T.angle, text: `A rope at ${th}° above the horizontal pulls ${an(m)} ${m} kg box along a level floor with a force of ${F} N. How big is the normal force from the floor on the box?`,
        figure: levelFbd(W, [{ angle: th, size: F, label: `F = ${F} N` }], N),
        answer: numAns(N, 'N'),
        solution: `On the box, nothing moves up or down: ΣFy = N + F sin θ − mg = 0. So N = mg − F sin θ = ${m} × 9.81 − ${F} sin ${th}° = ${num(W, 3)} − ${num(up, 3)} = <b>${ans(N)} N</b>.`,
        meta: { type: 'angle-N', in: { m, F, th } },
      };
    }
    if (type === 2) {
      const [m, F, th, mu] = turn(ctx, 5, [[10, 15, 20, 25, 30, 40], [40, 50, 60, 80, 100], [20, 25, 30, 35, 40, 45, 50], [0.2, 0.25, 0.3, 0.35, 0.4, 0.5]], (M, P, t, u) => fine(M, P, t, u) && apart(parts(M, P, t, u).f, M, P, t, u));
      const { N, f } = parts(m, F, th, mu);
      return {
        topic: T.angle, text: `${An(m)} ${m} kg box is pulled along a level floor by a rope at ${th}° above the horizontal, with a force of ${F} N. It slides, and the coefficient of friction is ${num(mu)}. How big is the friction force on it?`,
        figure: floor({ box: `${m} kg`, force: { angle: th, label: `F = ${F} N` }, mu: `μ = ${num(mu)}`, moving: 'right' }),
        answer: numAns(f, 'N'),
        solution: `On the box: ΣFy = N + F sin θ − mg = 0, so N = ${num(m * G, 3)} − ${F} sin ${th}° = ${num(N, 3)} N. It slides, so friction is at its full value, against the motion: f = μN = ${num(mu)} × ${num(N, 3)} = <b>${ans(f)} N</b>.`,
        meta: { type: 'angle-f', in: { m, F, th, mu } },
      };
    }
    if (type === 3) {
      const [m, F, th, mu, t] = turn(ctx, 5, [[15, 20, 25, 30], [40, 50, 60, 80], [20, 25, 30, 35, 40], [0.1, 0.15, 0.2], [2, 3, 4, 5]],
        (M, P, a, u, s) => { const v = parts(M, P, a, u).a * s; return fine(M, P, a, u) && v <= 6 && apart(v, M, P, a, u, s); });
      const { N, f, a } = parts(m, F, th, mu), v = a * t;
      return {
        topic: T.angle, text: `A child pulls ${an(m)} ${m} kg sled from rest across level snow, with a rope at ${th}° above the horizontal and a steady force of ${F} N. The coefficient of friction is ${num(mu)}. How fast is the sled going after ${t} s?`,
        figure: floor({ box: `${m} kg`, force: { angle: th, label: `F = ${F} N` }, mu: `μ = ${num(mu)}` }),
        answer: numAns(v, 'm/s'),
        solution: `On the sled: ΣFy = 0 gives N = mg − F sin θ = ${num(m * G, 3)} − ${num(F * sin(th), 3)} = ${num(N, 3)} N, so f = μN = ${num(f, 3)} N. ΣFx = F cos θ − f = ma gives a = (${num(F * cos(th), 3)} − ${num(f, 3)}) / ${m} = ${num(a, 3)} m/s². From rest, v = at = ${num(a, 3)} × ${t} = <b>${ans(v)} m/s</b>.`,
        meta: { type: 'angle-speed', in: { m, F, th, mu, t } },
      };
    }
    // the same pull at a new angle: friction gets bigger when the rope lifts less (lower, or level), smaller when it lifts more
    const bigger = j % 2 === 0;
    const [m, F, th, th2, mu] = turnCase(ctx, 5, bigger, [[10, 15, 20, 25], [40, 50, 60, 80], [20, 30, 40, 50], [0, 10, 20, 30, 40, 50, 60], [0.2, 0.3]],
      (M, P, a, b, u) => { if (a === b || !fine(M, P, a, u) || !fine(M, P, b, u)) return false; const f1 = parts(M, P, a, u).f, f2 = parts(M, P, b, u).f; return bigger ? f2 > 1.05 * f1 : f2 < 0.95 * f1; });
    const one = parts(m, F, th, mu), two = parts(m, F, th2, mu), right = bigger ? 'It gets bigger' : 'It gets smaller';
    const now = th2 === 0 ? 'level' : `at ${th2}°`;
    return {
      topic: T.angle, text: `A rope at ${th}° above the horizontal pulls ${an(m)} ${m} kg box along a level floor with a force of ${F} N, and the box slides (μ = ${num(mu)}). Then the rope is held ${th2 === 0 ? 'level' : `at ${th2}° above the horizontal`} instead, with the same pull. What happens to the friction on the box?`,
      figure: floor({ box: `${m} kg`, force: { angle: th, label: `F = ${F} N` }, mu: `μ = ${num(mu)}`, moving: 'right' }),
      answer: oneOf(d, right, [bigger ? 'It gets smaller' : 'It gets bigger', 'It stays the same']),
      solution: `Friction is μN, and N = mg − F sin θ: the more the rope lifts, the less the floor has to push up. At ${th}°, N = ${num(one.N, 3)} N and f = ${num(one.f, 3)} N; ${now}, N = ${num(two.N, 3)} N and f = ${num(two.f, 3)} N. <b>${right}</b>.`,
      meta: { type: 'angle-compare', in: { m, F, th, th2, mu } },
    };
  },

  // 4. stopping on a level: only friction acts along the floor, so a = −μg whatever the mass; then the motion equations
  (d, ctx) => {
    const type = ctx.k % 5, j = Math.floor(ctx.k / 5);
    if (type === 0) {
      const mOf = (u, k) => tie([5, 8, 10, 12, 15, 20], u, k);
      const [v, mu] = turn(ctx, 5, [[2, 3, 4, 5, 6], [0.15, 0.2, 0.25, 0.3, 0.4, 0.5]], (u, k) => { const s = (u * u) / (2 * k * G); return s >= 0.3 && s <= 15 && apart(s, mOf(u, k), u, k); });
      const m = mOf(v, mu), A = mu * G, s = (v * v) / (2 * A);
      return {
        topic: T.stop, text: `${An(m)} ${m} kg box is shoved across a level floor and let go at ${v} m/s. Only friction slows it, and the coefficient of friction is ${num(mu)}. How far does it slide before it stops?`,
        figure: floor({ box: `${m} kg`, mu: `μ = ${num(mu)}`, moving: 'right' }),
        answer: numAns(s, 'm'),
        solution: `On the box, with the way it moves positive: N = mg, so friction is μmg backward and ΣFx = −μmg = ma, which gives a = −μg = −${num(mu)} × 9.81 = −${num(A, 3)} m/s² (the mass cancels). From 0 = v₀² + 2as: s = v₀²/(2μg) = ${v}² / (2 × ${num(A, 3)}) = <b>${ans(s)} m</b>.`,
        meta: { type: 'stop-distance', in: { m, v, mu } },
      };
    }
    if (type === 1) {
      const mOf = (u, k) => tie([30, 35, 40, 45], u, k);
      const [v, mu] = turn(ctx, 5, [[3, 4, 5, 6, 8], [0.1, 0.12, 0.15, 0.2]], (u, k) => { const t = u / (k * G); return t >= 0.5 && t <= 10 && apart(t, mOf(u, k), u, k); });
      const m = mOf(v, mu), A = mu * G, t = v / A;
      return {
        topic: T.stop, text: `A child on a sled, ${m} kg in all, glides onto a level stretch of snow at ${v} m/s and slides to a stop. The coefficient of friction is ${num(mu)}. How long does it take to stop?`,
        figure: floor({ box: `${m} kg`, mu: `μ = ${num(mu)}`, moving: 'right' }),
        answer: numAns(t, 's'),
        solution: `On the child and sled, with the way they move positive: friction μmg acts backward, so ΣFx = −μmg = ma and a = −μg = −${num(A, 3)} m/s², whatever the mass. From 0 = v₀ + at: t = v₀/(μg) = ${v} / ${num(A, 3)} = <b>${ans(t)} s</b>.`,
        meta: { type: 'stop-time', in: { m, v, mu } },
      };
    }
    if (type === 2) {
      // (the skid marks as measured, to a tenth of a meter; μ then comes from that)
      const marks = (u, k) => round((u * u) / (2 * k * G), 1);
      const [v, mu0] = turn(ctx, 5, [[8, 10, 12, 14, 15, 16, 18, 20], [0.4, 0.45, 0.5, 0.55, 0.6]], (u, k) => { const s = marks(u, k); const k2 = (u * u) / (2 * G * s); return s >= 5 && s <= 60 && k2 >= 0.1 && k2 <= 0.6 && apart(k2, u, s); });
      const s = marks(v, mu0), mu = (v * v) / (2 * G * s);
      return {
        topic: T.stop, text: `A car’s wheels lock and it skids to a stop on a level road, leaving skid marks ${num(s)} m long. It was going ${v} m/s when the skid began. What is the coefficient of friction between the tires and the road?`,
        figure: floor({ box: 'car', mu: 'μ = ?', moving: 'right' }),
        answer: numAns(mu, ''),
        solution: `On the car, with the way it moves positive: friction is the only force along the road, so −μmg = ma and a = −μg. From 0 = v₀² − 2μgs: μ = v₀²/(2gs) = ${v}² / (2 × 9.81 × ${num(s)}) = <b>${ans(mu, 3)}</b>.`,
        meta: { type: 'stop-mu', in: { v, s } },
      };
    }
    if (type === 3) {
      const [mu, s] = turn(ctx, 5, [[0.4, 0.5, 0.55, 0.6], [6, 8, 10, 12, 15, 18, 20, 25, 30]], (k, x) => { const v = Math.sqrt(2 * k * G * x); return v >= 5 && v <= 30 && apart(v, k, x); });
      const A = mu * G, v = Math.sqrt(2 * A * s);
      return {
        topic: T.stop, text: `A car skids to a stop on a level road with its wheels locked, leaving skid marks ${s} m long. The coefficient of friction between the tires and the road is ${num(mu)}. How fast was it going when the skid began?`,
        figure: levelFbd(1, [{ angle: 180, size: mu, label: 'f = μN' }]),
        answer: numAns(v, 'm/s'),
        solution: `On the car, with the way it moves positive: −μmg = ma, so a = −μg = −${num(A, 3)} m/s² (its mass cancels). From 0 = v₀² − 2μgs: v₀ = √(2μgs) = √(2 × ${num(A, 3)} × ${s}) = <b>${ans(v)} m/s</b>.`,
        meta: { type: 'stop-speed', in: { mu, s } },
      };
    }
    // the same floor: a heavier box stops in the same distance; a faster one in (speed ratio)² as far
    const heavier = j % 2 === 0, gone = (u, k) => round((u * u) / (2 * k * G), 2);
    if (heavier) {
      const [m, m2, v, mu] = turnCase(ctx, 5, true, [[5, 8, 10, 12], [15, 20, 24, 30, 40], [2, 3, 4, 5], [0.2, 0.25, 0.3, 0.4]], (M, M2, u, k) => M2 >= 1.5 * M && spread(gone(u, k), [gone(u, k) * M2 / M, gone(u, k) * M / M2, gone(u, k) * (M2 / M) ** 2]).length >= 2);
      const s = gone(v, mu), wrongs = spread(s, [s * m2 / m, s * m / m2, s * (m2 / m) ** 2]);
      return {
        topic: T.stop, text: `${An(m)} ${m} kg box let go at ${v} m/s slides ${num(s)} m across a level floor before friction stops it. How far would ${an(m2)} ${m2} kg box with the same coefficient of friction slide on the same floor, let go at the same speed?`,
        answer: oneOf(d, `${num(s)} m`, wrongs.map((x) => `${num(x)} m`)),
        solution: `Friction is μmg, so a = −μmg/m = −μg: the mass cancels. The ${m2} kg box slows at the same rate from the same speed, so it slides the same distance, <b>${ans(s)} m</b>.`,
        meta: { type: 'stop-scale', in: { m, m2, v, s } },
      };
    }
    const [m, v, r, mu] = turnCase(ctx, 5, false, [[5, 8, 10, 12], [2, 3, 4], [2, 3, 1.5, 0.5], [0.2, 0.25, 0.3, 0.4]], (M, u, x, k) => spread(gone(u, k) * x * x, [gone(u, k) * x, gone(u, k)]).length === 2);
    const s = gone(v, mu), v2 = v * r, s2 = s * r * r;
    return {
      topic: T.stop, text: `${An(m)} ${m} kg box let go at ${v} m/s slides ${num(s)} m across a level floor before friction stops it. How far would it slide on the same floor if it were let go at ${num(v2)} m/s?`,
      answer: oneOf(d, `${num(s2)} m`, spread(s2, [s * r, s]).map((x) => `${num(x)} m`)),
      solution: `Friction gives a = −μg whatever the speed, so the stopping distance s = v²/(2μg) goes with the square of the speed. ${num(v2)} m/s is ${num(r)} times as fast, so it slides ${num(r * r)} times as far: ${num(s)} × ${num(r * r)} = <b>${ans(s2)} m</b>.`,
      meta: { type: 'stop-scale', in: { m, v, s, v2 } },
    };
  },

  // 5. sliding down a smooth slope: along the slope only mg sin θ acts, so a = g sin θ whatever the mass; N = mg cos θ
  (d, ctx) => {
    const type = ctx.k % 5;
    if (type === 0) {
      const mOf = (t) => tie([2, 4, 5, 8, 10, 15, 20], t);
      const [th] = turn(ctx, 5, [[10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]], (t) => apart(G * sin(t), mOf(t), t)), m = mOf(th), a = G * sin(th);
      return {
        topic: T.smooth, text: `${An(m)} ${m} kg box is let go on a smooth slope (no friction) at ${th}° to the horizontal, and it slides down. What is its acceleration?`,
        figure: slope({ angle: th, box: `${m} kg`, moving: 'down' }),
        answer: numAns(a, 'm/s²'),
        solution: `On the box, x along the slope with down it positive: N is across the slope, so along it ΣFx = mg sin θ = ma, and the mass cancels. So a = g sin θ = 9.81 × sin ${th}° = <b>${ans(a)} m/s²</b>.`,
        meta: { type: 'smooth-a', in: { m, th } },
      };
    }
    if (type === 1) {
      const [th, s] = turn(ctx, 5, [[10, 15, 20, 25, 30, 35, 40], [1.5, 2, 2.5, 3, 4, 5, 6, 8]], (t, x) => { const v = Math.sqrt(2 * G * sin(t) * x); return v <= 15 && apart(v, t, x); });
      const a = G * sin(th), v = Math.sqrt(2 * a * s);
      return {
        topic: T.smooth, text: `A box starts from rest and slides ${num(s)} m down a smooth slope (no friction) at ${th}° to the horizontal. How fast is it moving then?`,
        figure: slope({ angle: th, moving: 'down' }),
        answer: numAns(v, 'm/s'),
        solution: `On the box, down the slope positive: ΣFx = mg sin θ = ma, so a = 9.81 sin ${th}° = ${num(a, 3)} m/s². From rest, v² = 2as = 2 × ${num(a, 3)} × ${num(s)}, so v = <b>${ans(v)} m/s</b>.`,
        meta: { type: 'smooth-speed', in: { th, s } },
      };
    }
    if (type === 2) {
      const mOf = (t, x) => tie([25, 30, 35, 40, 45], t, x);
      const [th, s] = turn(ctx, 5, [[20, 25, 30, 35, 40], [2, 2.5, 3, 4, 5, 6]], (t, x) => apart(Math.sqrt((2 * x) / (G * sin(t))), mOf(t, x), t, x));
      const m = mOf(th, s), a = G * sin(th), t = Math.sqrt((2 * s) / a);
      return {
        topic: T.smooth, text: `${An(m)} ${m} kg child slides from rest down a straight slide ${num(s)} m long, at ${th}° to the horizontal. Ignoring friction, how long does the child take to reach the bottom?`,
        figure: slope({ angle: th, box: `${m} kg`, moving: 'down' }),
        answer: numAns(t, 's'),
        solution: `On the child, down the slide positive: ΣFx = mg sin θ = ma, so a = 9.81 sin ${th}° = ${num(a, 3)} m/s² (the mass cancels). From rest, s = ½at², so t = √(2s/a) = √(2 × ${num(s)} / ${num(a, 3)}) = <b>${ans(t)} s</b>.`,
        meta: { type: 'smooth-time', in: { m, th, s } },
      };
    }
    if (type === 3) {
      const [m, th] = turn(ctx, 5, [[2, 3, 5, 6, 8, 10, 12, 15, 20, 25], [15, 20, 25, 30, 35, 40, 45, 50, 55, 60]], (M, t) => apart(M * G * cos(t), M, t));
      const W = m * G, N = W * cos(th);
      return {
        topic: T.smooth, text: `${An(m)} ${m} kg box slides down a smooth slope (no friction) at ${th}° to the horizontal. How big is the normal force from the slope on the box?`,
        figure: slopeFbd(th, W, { labels: { N: 'N = ?' } }),
        answer: numAns(N, 'N'),
        solution: `On the box, with y across the slope: nothing accelerates that way, so ΣFy = N − mg cos θ = 0. So N = mg cos θ = ${m} × 9.81 × cos ${th}° = <b>${ans(N)} N</b>.`,
        meta: { type: 'smooth-N', in: { m, th } },
      };
    }
    const [m1, m2, th] = turn(ctx, 5, [[2, 3, 4, 5], [8, 10, 12, 15, 20], [20, 25, 30, 35, 40]]), a = G * sin(th);
    const right = 'They reach it together';
    return {
      topic: T.smooth, text: `Two boxes, ${m1} kg and ${m2} kg, are let go together from the top of the same smooth slope (no friction) at ${th}° to the horizontal. Which reaches the bottom first?`,
      answer: oneOf(d, right, [`The ${m2} kg box`, `The ${m1} kg box`]),
      solution: `For each box, ΣFx = mg sin θ = ma, so a = g sin θ = 9.81 × sin ${th}° = ${num(a, 3)} m/s², whatever its mass. The same start, the same acceleration and the same distance: <b>${right}</b>.`,
      tip: 'On a smooth slope a = g sin θ: the mass cancels.',
      meta: { type: 'smooth-mass', in: { m1, m2, th } },
    };
  },

  // 6. sliding down a rough slope: N = mg cos θ, friction μmg cos θ up the slope, so a = g(sin θ − μ cos θ); it slides
  // only when tan θ > μ
  (d, ctx) => {
    const type = ctx.k % 5, j = Math.floor(ctx.k / 5);
    const accel = (t, u) => G * (sin(t) - u * cos(t));
    const slides = (t, u) => tan(t) >= u + 0.1;          // (clearly: not a slope where it only just slides)
    if (type === 0) {
      const mOf = (t, u) => tie([5, 8, 10, 12, 15, 20, 25, 30], t, u);
      const [th, mu] = turn(ctx, 5, [[20, 25, 30, 35, 40, 45, 50, 55, 60], [0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5]],
        (t, u) => slides(t, u) && accel(t, u) >= 0.5 && apart(accel(t, u), mOf(t, u), t, u) && !(t === 40 && u === 0.2));
      const m = mOf(th, mu), a = accel(th, mu);
      return {
        topic: T.rough, text: `${An(m)} ${m} kg box slides down a slope at ${th}° to the horizontal. The coefficient of friction between the box and the slope is ${num(mu)}. What is its acceleration?`,
        figure: slope({ angle: th, box: `${m} kg`, mu: `μ = ${num(mu)}`, moving: 'down' }),
        answer: numAns(a, 'm/s²'),
        solution: `On the box, x along the slope (down it positive) and y across it: ΣFy = N − mg cos θ = 0, so N = mg cos θ and friction up the slope is f = μmg cos θ. ΣFx = mg sin θ − μmg cos θ = ma, and the mass cancels: a = g(sin θ − μ cos θ) = 9.81 × (sin ${th}° − ${num(mu)} × cos ${th}°) = <b>${ans(a)} m/s²</b>.`,
        meta: { type: 'rough-a', in: { m, th, mu } },
      };
    }
    if (type === 1) {
      // (the acceleration as measured, to a hundredth; μ then comes from that)
      const measured = (t, u) => round(accel(t, u), 2), muOf = (t, A) => (G * sin(t) - A) / (G * cos(t));
      const mOf = (t, u) => tie([4, 6, 10, 15, 20], t, u);
      const [th, mu0] = turn(ctx, 5, [[25, 30, 35, 40, 45, 50], [0.1, 0.15, 0.2, 0.25, 0.3, 0.4]],
        (t, u) => slides(t, u) && measured(t, u) >= 0.5 && muOf(t, measured(t, u)) >= 0.1 && muOf(t, measured(t, u)) <= 0.6 && apart(muOf(t, measured(t, u)), mOf(t, u), t, measured(t, u)));
      const m = mOf(th, mu0), a = measured(th, mu0), gs = G * sin(th), gc = G * cos(th), mu = (gs - a) / gc;
      return {
        topic: T.rough, text: `${An(m)} ${m} kg box slides down a slope at ${th}° to the horizontal, speeding up at ${num(a)} m/s². What is the coefficient of friction between the box and the slope?`,
        figure: slope({ angle: th, box: `${m} kg`, mu: 'μ = ?', moving: 'down' }),
        answer: numAns(mu, ''),
        solution: `On the box, down the slope positive: ΣFx = mg sin θ − μmg cos θ = ma, and the mass cancels, so μ = (g sin θ − a)/(g cos θ) = (9.81 sin ${th}° − ${num(a)}) / (9.81 cos ${th}°) = (${num(gs, 3)} − ${num(a)}) / ${num(gc, 3)} = <b>${ans(mu, 3)}</b>.`,
        meta: { type: 'rough-mu', in: { m, th, a } },
      };
    }
    if (type === 2) {
      const [m, th, mu] = turn(ctx, 5, [[5, 8, 10, 12, 15, 20, 25, 30, 40], [20, 25, 30, 35, 40, 50], [0.1, 0.2, 0.25, 0.3, 0.35, 0.4]], (M, t, u) => slides(t, u) && apart(u * M * G * cos(t), M, t, u));
      const W = m * G, N = W * cos(th), f = mu * N;
      return {
        topic: T.rough, text: `${An(m)} ${m} kg crate slides down a ramp at ${th}° to the horizontal. The coefficient of friction between the crate and the ramp is ${num(mu)}. How big is the friction force on the crate?`,
        figure: slopeFbd(th, W, { f, labels: { f: 'f = ?' } }),
        answer: numAns(f, 'N'),
        solution: `On the crate, with y across the ramp: ΣFy = N − mg cos θ = 0, so N = ${m} × 9.81 × cos ${th}° = ${num(N, 3)} N. It slides, so friction is at its full value, up the ramp: f = μN = ${num(mu)} × ${num(N, 3)} = <b>${ans(f)} N</b>.`,
        meta: { type: 'rough-f', in: { m, th, mu } },
      };
    }
    if (type === 3) {
      const [th, mu, s] = turn(ctx, 5, [[25, 30, 35, 40, 45], [0.1, 0.15, 0.2, 0.25, 0.3], [2, 3, 4, 5, 6, 8, 10]],
        (t, u, x) => { const v = Math.sqrt(2 * accel(t, u) * x); return slides(t, u) && accel(t, u) >= 0.5 && v <= 15 && apart(v, t, u, x); });
      const a = accel(th, mu), v = Math.sqrt(2 * a * s);
      return {
        topic: T.rough, text: `A box starts from rest and slides down a slope at ${th}° to the horizontal, with a coefficient of friction of ${num(mu)}. How fast is it moving when it has slid ${s} m?`,
        figure: slope({ angle: th, mu: `μ = ${num(mu)}`, moving: 'down' }),
        answer: numAns(v, 'm/s'),
        solution: `On the box, down the slope positive: ΣFx = mg sin θ − μmg cos θ = ma, so a = 9.81 × (sin ${th}° − ${num(mu)} × cos ${th}°) = ${num(a, 3)} m/s². From rest, v² = 2as, so v = √(2 × ${num(a, 3)} × ${s}) = <b>${ans(v)} m/s</b>.`,
        meta: { type: 'rough-speed', in: { th, mu, s } },
      };
    }
    // put down at rest: does it slide? Only if gravity's part, mg sin θ, beats the most friction can give, μmg cos θ
    const yes = j % 2 === 0;
    const [th, mu] = turnCase(ctx, 5, yes, [[10, 15, 20, 25, 30, 35, 40, 45], [0.2, 0.3, 0.4, 0.5, 0.6]], (t, u) => (yes ? tan(t) >= u + 0.1 : tan(t) <= u - 0.1));
    const m = tie([5, 10, 15, 20], th, mu), down = m * G * sin(th), most = mu * m * G * cos(th), right = yes ? 'Yes, it slides down' : 'No, friction holds it still';
    return {
      topic: T.rough, text: `${An(m)} ${m} kg box is put down at rest on a ramp tilted at ${th}° to the horizontal. The coefficient of friction between the box and the ramp is ${num(mu)}. Does the box slide down by itself?`,
      figure: slope({ angle: th, box: `${m} kg`, mu: `μ = ${num(mu)}` }),
      answer: oneOf(d, right, [yes ? 'No, friction holds it still' : 'Yes, it slides down', 'Only if it is heavy enough']),
      solution: yes
        ? `Gravity’s part down the ramp is mg sin θ = ${num(down, 3)} N, and the most friction can give is μN = μmg cos θ = ${num(most, 3)} N. Gravity’s part is bigger (the mass cancels: tan ${th}° = ${num(tan(th), 3)} is more than μ). <b>${right}</b>.`
        : `Gravity’s part down the ramp is mg sin θ = ${num(down, 3)} N, and friction could give up to μmg cos θ = ${num(most, 3)} N, so it just matches the ${num(down, 3)} N (not μN). The mass cancels: tan ${th}° = ${num(tan(th), 3)} is less than μ. <b>${right}</b>.`,
      tip: 'At rest, it slides only if mg sin θ beats the most friction can give, μmg cos θ: that is, if tan θ > μ.',
      meta: { type: 'rough-slides', in: { m, th, mu } },
    };
  },

  // 7. sliding up a slope: gravity's part and friction both point down the slope, so it slows at g(sin θ + μ cos θ)
  (d, ctx) => {
    const type = ctx.k % 5, j = Math.floor(ctx.k / 5);
    const slow = (t, u) => G * (sin(t) + u * cos(t));
    if (type === 0) {
      const mOf = (t, u) => tie([2, 4, 5, 8, 10], t, u), vOf = (t, u) => tie([3, 4, 5, 6, 8], u, t);
      const [th, mu] = turn(ctx, 5, [[15, 20, 25, 30, 35, 40, 45], [0.1, 0.15, 0.2, 0.25, 0.3, 0.4]], (t, u) => slow(t, u) <= 14 && apart(slow(t, u), mOf(t, u), t, u, vOf(t, u)));
      const m = mOf(th, mu), v = vOf(th, mu), A = slow(th, mu);
      return {
        topic: T.up, text: `${An(m)} ${m} kg box is sent sliding up a slope at ${th}° to the horizontal at ${v} m/s. The coefficient of friction is ${num(mu)}. As it slides up, how big is its deceleration?`,
        figure: slope({ angle: th, box: `${m} kg`, mu: `μ = ${num(mu)}`, moving: 'up' }),
        answer: numAns(A, 'm/s²'),
        solution: `On the box, with up the slope positive (the way it moves): gravity’s part mg sin θ and friction μmg cos θ both point down the slope, so ΣFx = −mg sin θ − μmg cos θ = ma. So a = −g(sin θ + μ cos θ) = −9.81 × (sin ${th}° + ${num(mu)} × cos ${th}°) = −${num(A, 3)} m/s², a deceleration of <b>${ans(A)} m/s²</b>.`,
        meta: { type: 'up-decel', in: { m, th, mu, v } },
      };
    }
    if (type === 1) {
      const [th, mu, v] = turn(ctx, 5, [[15, 20, 25, 30, 35], [0.1, 0.2, 0.25, 0.3], [3, 4, 5, 6, 8, 10]], (t, u, x) => { const s = (x * x) / (2 * slow(t, u)); return s >= 0.3 && s <= 20 && apart(s, t, u, x); });
      const A = slow(th, mu), s = (v * v) / (2 * A);
      return {
        topic: T.up, text: `A box is sent sliding up a ramp at ${th}° to the horizontal at ${v} m/s, with a coefficient of friction of ${num(mu)}. How far up the ramp does it slide before it stops?`,
        figure: slope({ angle: th, mu: `μ = ${num(mu)}`, moving: 'up' }),
        answer: numAns(s, 'm'),
        solution: `On the box, up the ramp positive: ΣFx = −mg sin θ − μmg cos θ = ma, so a = −9.81 × (sin ${th}° + ${num(mu)} × cos ${th}°) = −${num(A, 3)} m/s². From 0 = v₀² + 2as: s = v₀²/(2 × ${num(A, 3)}) = ${v}² / ${num(2 * A, 3)} = <b>${ans(s)} m</b>.`,
        meta: { type: 'up-distance', in: { th, mu, v } },
      };
    }
    if (type === 2) {
      const [th, mu, v] = turn(ctx, 5, [[20, 25, 30, 40, 45], [0.15, 0.2, 0.3, 0.4, 0.5], [4, 5, 6, 8, 10, 12]], (t, u, x) => { const s = x / slow(t, u); return s >= 0.2 && s <= 5 && apart(s, t, u, x); });
      const A = slow(th, mu), t = v / A;
      return {
        topic: T.up, text: `A box is given a shove so that it slides up a slope at ${th}° to the horizontal, starting at ${v} m/s. The coefficient of friction is ${num(mu)}. How long does it take to stop?`,
        figure: slope({ angle: th, mu: `μ = ${num(mu)}`, moving: 'up' }),
        answer: numAns(t, 's'),
        solution: `On the box, up the slope positive: ΣFx = −mg sin θ − μmg cos θ = ma, so a = −9.81 × (sin ${th}° + ${num(mu)} × cos ${th}°) = −${num(A, 3)} m/s². From 0 = v₀ + at: t = v₀/${num(A, 3)} = ${v} / ${num(A, 3)} = <b>${ans(t)} s</b>.`,
        meta: { type: 'up-time', in: { th, mu, v } },
      };
    }
    if (type === 3) {
      const [th, v] = turn(ctx, 5, [[10, 15, 20, 25, 30, 35, 40], [2, 3, 4, 5, 6, 8]], (t, x) => { const s = (x * x) / (2 * G * sin(t)); return s <= 25 && apart(s, t, x); });
      const A = G * sin(th), s = (v * v) / (2 * A);
      return {
        topic: T.up, text: `A box slides up a smooth slope (no friction) at ${th}° to the horizontal, starting at ${v} m/s. How far along the slope does it go before it stops?`,
        figure: slope({ angle: th, moving: 'up' }),
        answer: numAns(s, 'm'),
        solution: `On the box, up the slope positive: only gravity’s part acts along it, so ΣFx = −mg sin θ = ma and a = −9.81 sin ${th}° = −${num(A, 3)} m/s². From 0 = v₀² + 2as: s = ${v}² / (2 × ${num(A, 3)}) = <b>${ans(s)} m</b>.`,
        meta: { type: 'up-smooth', in: { th, v } },
      };
    }
    // once it stops: it slides back only if tan θ > μ (gravity's part beats the most friction can give)
    const back = j % 2 === 0;
    const [th, mu] = turnCase(ctx, 5, back, [[10, 15, 20, 25, 30, 35, 40, 45], [0.15, 0.2, 0.3, 0.4, 0.5, 0.6]], (t, u) => (back ? tan(t) >= u + 0.1 : tan(t) <= u - 0.1));
    const v = tie([2, 3, 4, 5], th, mu);
    const right = back ? 'It slides back down' : 'It stays where it stopped';
    return {
      topic: T.up, text: `A box slides up a ramp at ${th}° to the horizontal, starting at ${v} m/s, and comes to a stop. The coefficient of friction is ${num(mu)}, moving or not. What happens next?`,
      figure: slope({ angle: th, mu: `μ = ${num(mu)}`, moving: 'up' }),
      answer: oneOf(d, right, [back ? 'It stays where it stopped' : 'It slides back down', 'It keeps sliding up, more slowly']),
      solution: `Once it stops, gravity’s part down the ramp is mg sin θ and the most friction can give is μmg cos θ. The mass cancels, so compare tan θ with μ: tan ${th}° = ${num(tan(th), 3)} is ${back ? `more than ${num(mu)}, so friction can’t hold it` : `less than ${num(mu)}, so friction holds it (with less than μN)`}. <b>${right}</b>.`,
      tip: 'Stopped on a slope, it slides back only if tan θ > μ.',
      meta: { type: 'up-then', in: { th, mu, v } },
    };
  },

  // 8. lifting and lowering on a rope: up positive, ΣF = T − mg = ma; T = m(g + a) when the acceleration points up,
  // m(g − a) when it points down, and mg at a steady speed
  (d, ctx) => {
    const type = ctx.k % 5, j = Math.floor(ctx.k / 5);
    if (type === 0) {
      const [m, a] = turn(ctx, 5, [[20, 30, 40, 50, 60, 75, 80], [0.5, 0.8, 1, 1.2, 1.5, 2, 2.5, 3]], (M, A) => apart(M * (G + A), M, A));
      const W = m * G, T1 = m * (G + a);
      return {
        topic: T.rope, text: `A crane lifts ${an(m)} ${m} kg crate on a cable. As it rises, the crate speeds up at ${num(a)} m/s². What is the tension in the cable?`,
        figure: ropeFbd(T1, W, 'T', `W = ${num(W, 1)} N`),
        answer: numAns(T1, 'N'),
        solution: `On the crate, with up positive (the way it moves and speeds up): ΣF = T − mg = ma, so T = m(g + a) = ${m} × (9.81 + ${num(a)}) = <b>${ans(T1)} N</b>.`,
        meta: { type: 'lift-up', in: { m, a } },
      };
    }
    if (type === 1) {
      const [m, a] = turn(ctx, 5, [[10, 15, 20, 25, 40, 50, 60, 70], [0.5, 1, 1.5, 2, 2.5, 3, 4]], (M, A) => apart(M * (G - A), M, A));
      const thing = m <= 25 ? 'bucket' : 'crate', W = m * G, T1 = m * (G - a);
      return {
        topic: T.rope, text: `${An(m)} ${m} kg ${thing} is lowered on a rope, speeding up as it goes down at ${num(a)} m/s². What is the tension in the rope?`,
        figure: ropeFbd(T1, W, 'T', `W = ${num(W, 1)} N`),
        answer: numAns(T1, 'N'),
        solution: `On the ${thing}, with up positive: it speeds up downward, so its acceleration is −${num(a)} m/s². ΣF = T − mg = m × (−${num(a)}), so T = m(g − ${num(a)}) = ${m} × (9.81 − ${num(a)}) = <b>${ans(T1)} N</b>.`,
        meta: { type: 'lift-down', in: { m, a } },
      };
    }
    if (type === 2) {
      // slowing down: going up, the acceleration points down; going down, it points up
      const rising = j % 2 === 0;
      const [m, a] = turnCase(ctx, 5, rising, [[20, 30, 45, 55, 65, 75], [0.5, 1, 1.5, 2, 2.5, 3]], (M, A) => apart(M * (rising ? G - A : G + A), M, A));
      const W = m * G, T1 = m * (rising ? G - a : G + a);
      const text = rising
        ? `A small goods lift (elevator) and its load, ${m} kg in all, rise on a cable. Near the top floor the lift slows down at ${num(a)} m/s², still rising. What is the tension in the cable while it slows?`
        : `${An(m)} ${m} kg ${m >= 45 ? 'climber is lowered on a rope. Near the ground the climber' : 'crate is lowered on a rope. Near the ground the crate'} slows down at ${num(a)} m/s², still going down. What is the tension in the rope while it slows?`;
      return {
        topic: T.rope, text,
        figure: ropeFbd(T1, W, 'T', `W = ${num(W, 1)} N`),
        answer: numAns(T1, 'N'),
        solution: rising
          ? `Slowing while it rises means the acceleration points down. With up positive it is −${num(a)} m/s², so ΣF = T − mg = m × (−${num(a)}) and T = m(g − ${num(a)}) = ${m} × (9.81 − ${num(a)}) = <b>${ans(T1)} N</b>.`
          : `Slowing while it goes down means the acceleration points up. With up positive it is +${num(a)} m/s², so ΣF = T − mg = ma and T = m(g + a) = ${m} × (9.81 + ${num(a)}) = <b>${ans(T1)} N</b>.`,
        meta: { type: rising ? 'lift-slowing-up' : 'lift-slowing-down', in: { m, a } },
      };
    }
    if (type === 3) {
      // a from a measured tension: lifted and speeding up (T more than mg), or lowered and speeding up (T less)
      const rising = j % 2 === 0;
      const [m, T1] = turnCase(ctx, 5, rising, [[10, 20, 30, 40, 50, 60, 70, 80], [100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900]],
        (M, t) => { const a = Math.abs(t - M * G) / M; return (rising ? t >= 1.04 * M * G : t <= 0.96 * M * G) && a >= 0.3 && a <= 5 && apart(a, M, t); });
      const W = m * G, a = Math.abs(T1 - W) / m;
      return {
        topic: T.rope, text: `${An(m)} ${m} kg crate is ${rising ? 'lifted on a rope and speeds up as it rises' : 'lowered on a rope and speeds up as it goes down'}. The tension in the rope is ${T1} N. How big is the crate’s acceleration?`,
        figure: ropeFbd(T1, W, `T = ${T1} N`, `W = ${num(W, 1)} N`),
        answer: numAns(a, 'm/s²'),
        solution: rising
          ? `On the crate, with up positive: ΣF = T − mg = ma, so a = (T − mg)/m = (${T1} − ${num(W, 3)}) / ${m} = <b>${ans(a)} m/s²</b>.`
          : `On the crate, with up positive: ΣF = T − mg = ma, so a = (${T1} − ${num(W, 3)}) / ${m} = −${num(a, 3)} m/s², which is downward: its size is <b>${ans(a)} m/s²</b>.`,
        meta: { type: rising ? 'lift-a-up' : 'lift-a-down', in: { m, T: T1 } },
      };
    }
    // a steady speed, either way: no acceleration, so T = mg (the wrong ones: the speed used as an acceleration, g
    // forgotten, and the net force taken for the tension)
    const rising = j % 2 === 0;
    const wrongsOf = (M, v) => spread(M * G, [M * (rising ? G + v : G - v), M, 0]);
    // (lifting and lowering take different masses, so all four variants have their own answer)
    const [m] = turnCase(ctx, 5, rising, [rising ? [30, 50, 70] : [40, 60, 80]], (M) => wrongsOf(M, tie([1, 1.5, 2, 3], M)).length === 3);
    const v = tie([1, 1.5, 2, 3], m), W = m * G;
    return {
      topic: T.rope, text: `A crane ${rising ? 'lifts' : 'lowers'} ${an(m)} ${m} kg crate at a steady ${num(v)} m/s. What is the tension in the cable?`,
      answer: oneOf(d, `${num(W, 1)} N`, wrongsOf(m, v).map((x) => `${num(x, 1)} N`)),
      solution: `A steady speed means no acceleration, so ΣF = T − mg = 0, whichever way it moves and however fast: T = mg = ${m} × 9.81 = <b>${num(W, 1)} N</b>.`,
      tip: 'A steady speed means a = 0, so T = mg, going up or down.',
      meta: { type: 'lift-steady', in: { m, v, dir: rising ? 'up' : 'down' } },
    };
  },

  // 9. a table and a hanging mass: m₁: T − μm₁g = m₁a; m₂: m₂g − T = m₂a; added, a = (m₂ − μm₁)g/(m₁ + m₂)
  (d, ctx) => {
    const type = ctx.k % 5;
    const accel = (m1, m2, mu) => ((m2 - mu * m1) * G) / (m1 + m2);
    if (type < 2) {
      const [m1, m2, mu] = turn(ctx, 5, [[5, 8, 10, 12, 15, 20, 25, 30], [2, 3, 4, 5, 6, 8, 10, 15, 20], [0.1, 0.15, 0.2, 0.25, 0.3, 0.4]],
        (M1, M2, u) => { const a = accel(M1, M2, u); return M2 >= 1.3 * u * M1 && a >= 0.5 && apart(type === 0 ? a : M2 * (G - a), M1, M2, u); });
      const a = accel(m1, m2, mu), T1 = m2 * (G - a);
      return {
        topic: T.table, text: `A box of mass m₁ = ${m1} kg sits on a level table, with a coefficient of friction of ${num(mu)}. A light rope tied to it runs over a light, frictionless pulley at the table’s edge to a hanging box of mass m₂ = ${m2} kg. When they’re let go, m₂ falls and pulls m₁ along the table. ${type === 0 ? 'What is their acceleration?' : 'What is the tension in the rope?'}`,
        figure: table({ box: `m₁ = ${m1} kg`, hang: `m₂ = ${m2} kg`, mu: `μ = ${num(mu)}` }),
        answer: type === 0 ? numAns(a, 'm/s²') : numAns(T1, 'N'),
        solution: `Take the way they move as positive (m₁ along the table, m₂ down). m₁: T − μm₁g = m₁a. m₂: m₂g − T = m₂a. Adding cancels T: a = (m₂ − μm₁)g/(m₁ + m₂) = (${m2} − ${num(mu)} × ${m1}) × 9.81 / ${m1 + m2} = `
          + (type === 0 ? `<b>${ans(a)} m/s²</b>.` : `${num(a, 3)} m/s². Then from m₂’s equation, T = m₂(g − a) = ${m2} × (9.81 − ${num(a, 3)}) = <b>${ans(T1)} N</b>.`),
        meta: { type: type === 0 ? 'table-a' : 'table-T', in: { m1, m2, mu } },
      };
    }
    if (type < 4) {
      const [m1, m2] = turn(ctx, 5, [[2, 3, 4, 5, 6, 8, 10, 12, 15], [1, 2, 3, 4, 5, 6, 8]], (M1, M2) => { const a = accel(M1, M2, 0); return a >= 0.5 && apart(type === 2 ? a : M1 * a, M1, M2); });
      const a = accel(m1, m2, 0), T1 = m1 * a;
      return {
        topic: T.table, text: `A cart of mass m₁ = ${m1} kg on a smooth, level table (no friction) is tied by a light rope, over a light, frictionless pulley at the edge, to a hanging mass m₂ = ${m2} kg. ${type === 2 ? 'What is their acceleration once they’re let go?' : 'Once they’re let go, what is the tension in the rope?'}`,
        figure: table({ box: `m₁ = ${m1} kg`, hang: `m₂ = ${m2} kg`, mu: 'smooth' }),
        answer: type === 2 ? numAns(a, 'm/s²') : numAns(T1, 'N'),
        solution: `With the way they move positive: m₁: T = m₁a (nothing else acts along the table). m₂: m₂g − T = m₂a. Adding: a = m₂g/(m₁ + m₂) = ${m2} × 9.81 / ${m1 + m2} = `
          + (type === 2 ? `<b>${ans(a)} m/s²</b>.` : `${num(a, 3)} m/s². So T = m₁a = ${m1} × ${num(a, 3)} = <b>${ans(T1)} N</b>.`),
        meta: { type: type === 2 ? 'table-a-smooth' : 'table-T-smooth', in: { m1, m2 } },
      };
    }
    // the tension compared with the hanging box's weight: less, since m₂ speeds up downward (a rough table, then a smooth one)
    const rough = Math.floor(ctx.k / 5) % 2 === 0;
    const [m1, m2, mu] = turnCase(ctx, 5, rough, [[4, 6, 8, 10, 12], [2, 3, 4, 5, 6, 8], rough ? [0.1, 0.2, 0.3] : [0]], (M1, M2, u) => M2 >= 1.3 * u * M1 && accel(M1, M2, u) >= 0.5);
    const a = accel(m1, m2, mu), W2 = m2 * G, T1 = m2 * (G - a), w = num(W2, 1);
    return {
      topic: T.table, text: `A box of mass m₁ = ${m1} kg on a ${mu ? `level table (μ = ${num(mu)})` : 'smooth, level table (no friction)'} is tied by a light rope over a light, frictionless pulley at the edge to a hanging box of mass m₂ = ${m2} kg. As m₂ falls, how does the tension in the rope compare with m₂’s weight, ${w} N?`,
      figure: table({ box: `m₁ = ${m1} kg`, hang: `m₂ = ${m2} kg`, mu: mu ? `μ = ${num(mu)}` : 'smooth' }),
      answer: oneOf(d, `Less than ${w} N`, [`Exactly ${w} N`, `More than ${w} N`]),
      solution: `m₂ speeds up as it falls, so the net force on it points down: m₂g − T = m₂a with a more than 0. Here a = ${num(a, 3)} m/s², so T = m₂(g − a) = ${num(T1, 1)} N, which is <b>less than ${w} N</b>.`,
      tip: 'The hanging box is accelerating down, so the net force on it is down: T is less than m₂g.',
      meta: { type: 'table-T-weight', in: { m1, m2, mu } },
    };
  },

  // 10. a slope and a hanging mass: m₁: T − m₁g sin θ − μm₁g cos θ = m₁a; m₂: m₂g − T = m₂a; it moves only if m₂g beats
  // m₁g sin θ and the most friction can give
  (d, ctx) => {
    const type = ctx.k % 5, j = Math.floor(ctx.k / 5);
    const accel = (m1, m2, th, mu) => ((m2 - m1 * sin(th) - mu * m1 * cos(th)) * G) / (m1 + m2);
    const rope = 'A light rope parallel to the slope runs from it over a light, frictionless pulley at the top to a hanging box of mass';
    if (type < 2) {
      const [m1, m2, th, mu] = turn(ctx, 5, [[5, 8, 10, 12, 15, 20, 25], [5, 8, 10, 12, 15, 20, 25, 30], [20, 25, 30, 35, 40, 45, 50], [0.1, 0.15, 0.2, 0.25, 0.3]],
        (M1, M2, t, u) => { const a = accel(M1, M2, t, u); return a >= 0.5 && apart(type === 0 ? a : M2 * (G - a), M1, M2, t, u); });
      const a = accel(m1, m2, th, mu), T1 = m2 * (G - a);
      return {
        topic: T.slopeRope, text: `A box of mass m₁ = ${m1} kg is on a slope at ${th}° to the horizontal, with a coefficient of friction of ${num(mu)}. ${rope} m₂ = ${m2} kg. When they’re let go, m₂ falls and pulls m₁ up the slope. ${type === 0 ? 'What is their acceleration?' : 'What is the tension in the rope?'}`,
        figure: slope({ angle: th, box: `m₁ = ${m1} kg`, mu: `μ = ${num(mu)}`, hang: `m₂ = ${m2} kg` }),
        answer: type === 0 ? numAns(a, 'm/s²') : numAns(T1, 'N'),
        solution: `With the way they move positive (m₁ up the slope, m₂ down): m₁: T − m₁g sin θ − μm₁g cos θ = m₁a. m₂: m₂g − T = m₂a. Adding cancels T: a = (m₂ − m₁ sin θ − μm₁ cos θ)g/(m₁ + m₂) = (${m2} − ${num(m1 * sin(th), 3)} − ${num(mu * m1 * cos(th), 3)}) × 9.81 / ${m1 + m2} = `
          + (type === 0 ? `<b>${ans(a)} m/s²</b>.` : `${num(a, 3)} m/s². Then from m₂’s equation, T = m₂(g − a) = ${m2} × (9.81 − ${num(a, 3)}) = <b>${ans(T1)} N</b>.`),
        meta: { type: type === 0 ? 'slope-rope-a' : 'slope-rope-T', in: { m1, m2, th, mu } },
      };
    }
    if (type === 2 || type === 4) {
      const [m1, m2, th] = turn(ctx, 5, [[4, 5, 6, 8, 10, 12, 15, 20], [3, 4, 5, 6, 8, 10, 12], [15, 20, 25, 30, 35, 40, 45]],
        (M1, M2, t) => { const a = accel(M1, M2, t, 0); return a >= 0.5 && apart(type === 2 ? a : M2 * (G - a), M1, M2, t); });
      const a = accel(m1, m2, th, 0), T1 = m2 * (G - a);
      return {
        topic: T.slopeRope, text: `A box of mass m₁ = ${m1} kg is on a smooth slope (no friction) at ${th}° to the horizontal. ${rope} m₂ = ${m2} kg, which falls when they’re let go. ${type === 2 ? 'What is their acceleration?' : 'What is the tension in the rope?'}`,
        figure: slope({ angle: th, box: `m₁ = ${m1} kg`, hang: `m₂ = ${m2} kg` }),
        answer: type === 2 ? numAns(a, 'm/s²') : numAns(T1, 'N'),
        solution: `With the way they move positive (m₁ up the slope, m₂ down): m₁: T − m₁g sin θ = m₁a. m₂: m₂g − T = m₂a. Adding: a = (m₂ − m₁ sin θ)g/(m₁ + m₂) = (${m2} − ${m1} sin ${th}°) × 9.81 / ${m1 + m2} = `
          + (type === 2 ? `<b>${ans(a)} m/s²</b>.` : `${num(a, 3)} m/s². Then T = m₂(g − a) = ${m2} × (9.81 − ${num(a, 3)}) = <b>${ans(T1)} N</b>.`),
        meta: { type: type === 2 ? 'slope-rope-a-smooth' : 'slope-rope-T-smooth', in: { m1, m2, th } },
      };
    }
    // does it move at all? m₂ falls if m₂g beats m₁g sin θ plus the most friction can give; it stays put if neither m₂
    // nor m₁ (down the slope) can beat the rest and friction
    const moves = j % 2 === 0;
    const [m1, m2, th, mu] = turnCase(ctx, 5, moves, [[10, 15, 20, 25, 30], [4, 5, 6, 8, 10, 12, 15], [20, 25, 30, 35, 40], [0.2, 0.3, 0.4, 0.5]],
      (M1, M2, t, u) => { const down = M1 * sin(t), most = u * M1 * cos(t); return moves ? M2 >= 1.08 * (down + most) : M2 <= 0.92 * (down + most) && down <= 0.92 * (M2 + most); });
    const W2 = m2 * G, along = m1 * G * sin(th), most = mu * m1 * G * cos(th);
    const right = moves ? 'Yes: m₂ falls and pulls m₁ up the slope' : 'No: friction holds them still';
    return {
      topic: T.slopeRope, text: `A box of mass m₁ = ${m1} kg rests on a slope at ${th}° to the horizontal, with a coefficient of friction of ${num(mu)}. ${rope} m₂ = ${m2} kg. They are let go from rest. Does anything move?`,
      figure: slope({ angle: th, box: `m₁ = ${m1} kg`, mu: `μ = ${num(mu)}`, hang: `m₂ = ${m2} kg` }),
      answer: oneOf(d, right, [moves ? 'No: friction holds them still' : 'Yes: m₂ falls and pulls m₁ up the slope', 'Yes: m₁ slides down the slope and pulls m₂ up']),
      solution: moves
        ? `m₂’s weight pulls with m₂g = ${num(W2, 3)} N. Against it are m₁’s weight along the slope, m₁g sin θ = ${num(along, 3)} N, and the most friction can give, μm₁g cos θ = ${num(most, 3)} N: ${num(along + most, 3)} N in all. m₂g is bigger. <b>${right}</b>.`
        : `m₂g = ${num(W2, 3)} N is less than m₁g sin θ + μm₁g cos θ = ${num(along + most, 3)} N (the most friction can give is ${num(most, 3)} N), and m₁g sin θ = ${num(along, 3)} N is less than m₂g + μm₁g cos θ = ${num(W2 + most, 3)} N, so neither box can pull the other. <b>${right}</b>.`,
      tip: 'm₂ falls only if m₂g is more than m₁g sin θ plus the most friction can give, μm₁g cos θ; m₁ slides down only if m₁g sin θ is more than m₂g plus that.',
      meta: { type: 'slope-rope-moves', in: { m1, m2, th, mu } },
    };
  },

  // 11. two masses over a pulley (an Atwood machine): a = (m₂ − m₁)g/(m₁ + m₂), T = m₁(g + a) = 2m₁m₂g/(m₁ + m₂)
  (d, ctx) => {
    const type = ctx.k % 5, j = Math.floor(ctx.k / 5);
    const accel = (m1, m2) => ((m2 - m1) * G) / (m1 + m2);
    // (the heavier box starts higher, on the left or the right)
    const fig = (m1, m2) => atwood(j % 2 ? { left: `m₂ = ${m2} kg`, right: `m₁ = ${m1} kg`, lower: 'right' } : { left: `m₁ = ${m1} kg`, right: `m₂ = ${m2} kg`, lower: 'left' });
    const say = (m1, m2) => `Two boxes, m₁ = ${m1} kg and m₂ = ${m2} kg, hang from the ends of a light rope that runs over a light, frictionless pulley. They are let go from rest.`;
    const both = `Take the way they move as positive: m₂ down, m₁ up. m₂: m₂g − T = m₂a. m₁: T − m₁g = m₁a. Adding cancels T: a = (m₂ − m₁)g/(m₁ + m₂)`;
    if (type < 2) {
      const [m1, m2] = turn(ctx, 5, [[1, 2, 3, 4, 5, 6, 8, 10, 12, 15], [2, 3, 4, 5, 6, 8, 10, 12, 15, 20]],
        (M1, M2) => M2 > M1 && accel(M1, M2) >= 0.5 && apart(type === 0 ? accel(M1, M2) : M1 * (G + accel(M1, M2)), M1, M2));
      const a = accel(m1, m2), T1 = m1 * (G + a);
      return {
        topic: T.atwood, text: `${say(m1, m2)} ${type === 0 ? 'What is their acceleration?' : 'What is the tension in the rope as they move?'}`,
        figure: fig(m1, m2),
        answer: type === 0 ? numAns(a, 'm/s²') : numAns(T1, 'N'),
        solution: `${both} = (${m2} − ${m1}) × 9.81 / ${m1 + m2} = ` + (type === 0 ? `<b>${ans(a)} m/s²</b>.` : `${num(a, 3)} m/s². Then from m₁’s equation, T = m₁(g + a) = ${m1} × (9.81 + ${num(a, 3)}) = <b>${ans(T1)} N</b>.`),
        meta: { type: type === 0 ? 'atwood-a' : 'atwood-T', in: { m1, m2 } },
      };
    }
    if (type < 4) {
      const lists = type === 2 ? [[2, 3, 4, 5, 6, 8, 10], [3, 4, 5, 6, 8, 10, 12, 15], [1, 1.5, 2, 2.5, 3]] : [[2, 3, 4, 5, 6, 8], [3, 4, 5, 6, 8, 10, 12], [0.5, 1, 1.5, 2]];
      const far2 = (M1, M2, t) => (type === 2 ? accel(M1, M2) * t : 0.5 * accel(M1, M2) * t * t);
      const [m1, m2, t] = turn(ctx, 5, lists, (M1, M2, t) => M2 > M1 && accel(M1, M2) >= 0.5 && far2(M1, M2, t) <= (type === 2 ? 6 : 8) && apart(far2(M1, M2, t), M1, M2, t));
      const a = accel(m1, m2), x = far2(m1, m2, t);
      return {
        topic: T.atwood, text: `${say(m1, m2)} ${type === 2 ? `How fast are they moving after ${num(t)} s?` : `How far has each box moved after ${num(t)} s?`}`,
        figure: fig(m1, m2),
        answer: numAns(x, type === 2 ? 'm/s' : 'm'),
        solution: `${both} = (${m2} − ${m1}) × 9.81 / ${m1 + m2} = ${num(a, 3)} m/s². From rest, ` + (type === 2 ? `v = at = ${num(a, 3)} × ${num(t)} = <b>${ans(x)} m/s</b>.` : `each box (one up, one down) moves s = ½at² = ½ × ${num(a, 3)} × ${num(t)}² = <b>${ans(x)} m</b>.`),
        meta: { type: type === 2 ? 'atwood-speed' : 'atwood-distance', in: { m1, m2, t } },
      };
    }
    // the tension is between the two weights: more than the lighter one's (it speeds up going up), less than the heavier's
    const [m1, m2] = turn(ctx, 5, [[2, 3, 4, 5, 6], [4, 5, 6, 8, 10, 12]], (M1, M2) => M2 > M1 && accel(M1, M2) >= 0.5);
    const W1 = m1 * G, W2 = m2 * G, T1 = (2 * m1 * m2 * G) / (m1 + m2), w1 = num(W1, 1), w2 = num(W2, 1);
    const right = `Between ${w1} N and ${w2} N`;
    return {
      topic: T.atwood, text: `${say(m1, m2)} Their weights are ${w1} N and ${w2} N. As they move, what is the tension in the rope?`,
      figure: fig(m1, m2),
      answer: oneOf(d, right, [`Exactly ${w2} N, m₂’s weight`, `Exactly ${w1} N, m₁’s weight`, `${num(W1 + W2, 1)} N, both weights added`]),
      solution: `m₁ speeds up going up, so T − m₁g = m₁a is positive and T is more than m₁g; m₂ speeds up going down, so m₂g − T = m₂a is positive and T is less than m₂g. In fact T = 2m₁m₂g/(m₁ + m₂) = ${num(T1, 1)} N, so it is <b>between ${w1} N and ${w2} N</b>.`,
      tip: 'The lighter one accelerates up (T > m₁g) and the heavier down (T < m₂g), so T is between the weights.',
      meta: { type: 'atwood-T-between', in: { m1, m2 } },
    };
  },

  // 12. boxes pushed or pulled together: all of them as one body for a, then one box alone for the force between them
  (d, ctx) => {
    const type = ctx.k % 5;
    if (type < 2) {
      const [m1, m2, F] = turn(ctx, 5, [[2, 3, 4, 5, 6, 8, 10], [1, 2, 3, 4, 5, 6, 8], [12, 18, 20, 24, 30, 36, 40, 45, 60]],
        (M1, M2, P) => { const a = P / (M1 + M2); return a >= 0.5 && a <= 10 && apart(type === 0 ? a : M2 * a, M1, M2, P); });
      const M = m1 + m2, a = F / M, P = m2 * a;
      return {
        topic: T.together, text: `Two boxes sit touching on a smooth, level floor (no friction): m₁ = ${m1} kg behind and m₂ = ${m2} kg in front. A horizontal push of ${F} N on m₁ moves them both. ${type === 0 ? 'What is their acceleration?' : 'How big is the push P of m₁ on m₂?'}`,
        figure: type === 1 ? levelFbd(m2 * G, [{ angle: 0, size: P, label: 'P' }], m2 * G, 'Forces on m₂, the front box') : undefined,
        answer: type === 0 ? numAns(a, 'm/s²') : numAns(P, 'N'),
        solution: type === 0
          ? `They move together, so take both boxes as one body of ${M} kg, with the push’s way positive (the push between them is inside that body, so it cancels): ΣFx = F = (m₁ + m₂)a, so a = ${F} / ${M} = <b>${ans(a)} m/s²</b>.`
          : `Both boxes as one body: ΣFx = F = (m₁ + m₂)a, so a = ${F} / ${M} = ${num(a, 3)} m/s². Then m₂ alone: the only force on it along the floor is P, so ΣFx = P = m₂a = ${m2} × ${num(a, 3)} = <b>${ans(P)} N</b>.`,
        meta: { type: type === 0 ? 'pushed-a' : 'pushed-contact', in: { m1, m2, F } },
      };
    }
    if (type < 4) {
      const [m1, m2, mu, F] = turn(ctx, 5, [[5, 8, 10, 12, 15], [3, 4, 5, 6, 8, 10], [0.1, 0.15, 0.2, 0.25, 0.3], [60, 80, 100, 120, 150]],
        (M1, M2, u, P) => { const f = u * (M1 + M2) * G, a = (P - f) / (M1 + M2); return P >= 1.15 * f && a >= 0.4 && a <= 8 && apart(type === 2 ? a : M2 * (a + u * G), M1, M2, u, P); });
      const M = m1 + m2, f = mu * M * G, a = (F - f) / M, P = m2 * (a + mu * G);
      return {
        topic: T.together, text: `Two boxes sit touching on a level floor: m₁ = ${m1} kg behind and m₂ = ${m2} kg in front. A horizontal push of ${F} N on m₁ slides them along together, with a coefficient of friction of ${num(mu)} under both. ${type === 2 ? 'What is their acceleration?' : 'How big is the push P of m₁ on m₂?'}`,
        figure: type === 3 ? levelFbd(m2 * G, [{ angle: 0, size: P, label: 'P' }, { angle: 180, size: mu * m2 * G, label: 'f' }], m2 * G, 'Forces on m₂, the front box') : undefined,
        answer: type === 2 ? numAns(a, 'm/s²') : numAns(P, 'N'),
        solution: `As one body of ${M} kg, with the push’s way positive: N = (m₁ + m₂)g, so friction is μ(m₁ + m₂)g = ${num(mu)} × ${M} × 9.81 = ${num(f, 3)} N, and ΣFx = F − μ(m₁ + m₂)g = (m₁ + m₂)a gives a = (${F} − ${num(f, 3)}) / ${M} = `
          + (type === 2 ? `<b>${ans(a)} m/s²</b>.` : `${num(a, 3)} m/s². Then m₂ alone: P − μm₂g = m₂a, so P = m₂(a + μg) = ${m2} × (${num(a, 3)} + ${num(mu)} × 9.81) = <b>${ans(P)} N</b>.`),
        meta: { type: type === 2 ? 'pushed-rough-a' : 'pushed-rough-contact', in: { m1, m2, mu, F } },
      };
    }
    const [m1, m2, F] = turn(ctx, 5, [[2, 3, 4, 5, 6, 8], [1, 2, 3, 4, 5, 6, 8], [10, 12, 15, 18, 20, 24, 30]],
      (M1, M2, P) => { const a = P / (M1 + M2); return a >= 0.5 && a <= 10 && apart(M2 * a, M1, M2, P); });
    const M = m1 + m2, a = F / M, T1 = m2 * a;
    return {
      topic: T.together, text: `Two carts on a smooth, level track (no friction) are joined by a light string. A horizontal pull of ${F} N on the front cart, m₁ = ${m1} kg, drags the back cart, m₂ = ${m2} kg, along behind it. What is the tension in the string?`,
      figure: levelFbd(m2 * G, [{ angle: 0, size: T1, label: 'T' }], m2 * G, 'Forces on m₂, the back cart'),
      answer: numAns(T1, 'N'),
      solution: `Both carts have the same acceleration, so as one body: ΣFx = F = (m₁ + m₂)a, and a = ${F} / ${M} = ${num(a, 3)} m/s². The back cart alone: only the string pulls it along, so T = m₂a = ${m2} × ${num(a, 3)} = <b>${ans(T1)} N</b>.`,
      meta: { type: 'pulled-string', in: { m1, m2, F } },
    };
  },
];

export const dynamicsBank = bank('dynamics', templates, templates.length * 20);
