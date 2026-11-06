// AMC 12–style practice: 24 topics only the AMC 12 tests (logs and complex numbers, trig, conics and solids, polynomials
// and sequences), and the AMC 10's topics that aren't too easy for it, moved down the paper as they are on the real
// contests, where a problem 6 on the AMC 10 is about a problem 1 on the AMC 12, and its last problem about a problem 22.
// These are original problems (real AMC problems are the MAA's copyright). Five choices, (A)–(E), in increasing order. Each
// has a rank, where it would sit in a real AMC 12 (1 to 25), so a test can run from easy to hard like the real contest:
// the AMC 10's topics end up around 1 to 22, and the very top is the AMC 12's own. An AMC 10 topic's easiest problems have
// rank 0: a test like the real contest leaves them out, but they're there for learning the topic. The order to learn
// them in is in amc12-lessons.js.
import { bank } from '../kit/bank.js';
import { family } from './amc-kit.js';
import { TOPICS as AMC10, PER_TOPIC } from './amc.js';
import { logsComplex } from './amc12-logs-complex.js';
import { trigSpace } from './amc12-trig-space.js';
import { algebraPlus } from './amc12-algebra-plus.js';

// the AMC 10 topics that sit in its first five problems: too easy for an AMC 12
export const EASY = new Set(['Arithmetic sequences', 'Probability with dice', 'Counting committees', 'Inclusion and exclusion', 'Percent change', 'Working together', 'Averages', 'Coordinate geometry', 'Primes in a digit pattern', 'Product and least sum', 'LCM and GCD', 'Odd and even divisor sums', 'Repeating decimals', 'Units digits', 'Sums of powers mod m', 'Difference of squares', 'Changing a digit', 'Laps and common multiples', 'Percent of what is left', 'Saying and meaning', 'Triangular numbers', 'Perpendicular lines', 'Points near a segment', 'Cookies from a sheet of dough', 'Handshakes', 'Separated neighbors', 'Crossing lines', 'Digit rules', 'Forming teams', 'Round robin', 'Races with ties', 'Multiples in blocks', 'Choices in common', 'At least once', 'Random divisors', 'Prime chances', 'Geometric probability', 'Pigeonhole', 'Guess or leave blank']);
const moved = (rank) => (rank < 6 ? 0 : Math.round(1 + ((rank - 6) * 21) / 19));
const harder = (types) => types.map((make) => (d, ctx) => { const q = make(d, ctx); return { ...q, rank: moved(q.rank) }; });
const TOPICS = {
  ...logsComplex, ...trigSpace, ...algebraPlus,
  ...Object.fromEntries(Object.entries(AMC10).filter(([name]) => !EASY.has(name)).map(([name, types]) => [name, harder(types)])),
};
export const amc12 = bank('amc12', Object.values(TOPICS).map(family), Object.keys(TOPICS).length * PER_TOPIC);
