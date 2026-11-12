// Forces Mixed Review: every topic of Forces and Newton’s Laws, Statics of Particles, Torque and Rotational Equilibrium
// and Dynamics of Particles and Systems in one bank, so a test mixes them the way a test on all of it would. The topics
// take turns (variant n is topic (n − 1) mod K of the four courses' K topics), and each topic's variants come in the
// same order as in its own course.
import { forcesBank } from './forces.js';
import { staticsBank } from './statics.js';
import { torqueBank } from './torque.js';
import { dynamicsBank } from './dynamics.js';

const BANKS = [forcesBank, staticsBank, torqueBank, dynamicsBank];
const SLOTS = BANKS.flatMap((b) => Array.from({ length: b.kinds }, (_, j) => [b, j]));
const ROUNDS = Math.min(...BANKS.map((b) => Math.floor(b.count / b.kinds)));

export const forcesReview = {
  id: 'forcesreview', kinds: SLOTS.length, count: SLOTS.length * ROUNDS,
  make(n) {
    const t = (n - 1) % SLOTS.length, k = Math.floor((n - 1) / SLOTS.length), [b, j] = SLOTS[t];
    return { ...b.make(k * b.kinds + j + 1), n };
  },
};
