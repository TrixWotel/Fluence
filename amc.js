// AMC 10–style practice: 157 topics, each its own kind of question with 12 variants drawn from at least three different
// question types (1,884 in all). These are original problems in the style of the AMC 10 (real past AMC problems are the
// MAA's copyright). Five choices, (A)–(E), in increasing order, the wrong ones mostly the slips people actually make.
// Each problem has a rank, where it would sit in a real AMC 10 (1 to 25, judged against the 2018 to 2025 contests), so
// the list of topics can put the easier ones first and a test can run from easy to hard like the real contest. The
// order to learn them in is in amc-lessons.js.
// The topics live in amc-classic.js (12 classic contest topics), in five files of topics modelled on past contest
// ideas, with new numbers and wording (amc-number.js, amc-algebra.js, amc-geometry.js, amc-counting.js and
// amc-probability.js), and six more of them (amc-hard-algebra.js, amc-hard-number.js, amc-hard-counting.js,
// amc-hard-probability.js, amc-hard-geometry.js and amc-hard-shapes.js), together problems 1 to 16. The hard end, the
// problems like numbers 17 to 25, are in amc-top-algebra.js, amc-top-number.js, amc-top-counting.js and
// amc-top-geometry.js, and amc-top-middle.js has multi-step word problems for the middle of a test (8 to 18). Each is
// { topic: [question types] }, and a topic's turns take its types in turn (family()).
import { bank } from '../kit/bank.js';
import { family } from './amc-kit.js';
import { classic } from './amc-classic.js';
import { numberTheory } from './amc-number.js';
import { algebra } from './amc-algebra.js';
import { geometry } from './amc-geometry.js';
import { counting } from './amc-counting.js';
import { probability } from './amc-probability.js';
import { hardAlgebra } from './amc-hard-algebra.js';
import { hardNumber } from './amc-hard-number.js';
import { hardCounting } from './amc-hard-counting.js';
import { hardProbability } from './amc-hard-probability.js';
import { hardGeometry } from './amc-hard-geometry.js';
import { hardShapes } from './amc-hard-shapes.js';
import { topAlgebra } from './amc-top-algebra.js';
import { topNumber } from './amc-top-number.js';
import { topCounting } from './amc-top-counting.js';
import { topGeometry } from './amc-top-geometry.js';
import { topMiddle } from './amc-top-middle.js';

const TOPICS = {
  ...classic, ...numberTheory, ...algebra, ...geometry, ...counting, ...probability,
  ...hardAlgebra, ...hardNumber, ...hardCounting, ...hardProbability, ...hardGeometry, ...hardShapes,
  ...topMiddle, ...topAlgebra, ...topNumber, ...topCounting, ...topGeometry,
};
export { TOPICS };
export const PER_TOPIC = 12;
export const amc = bank('amc10', Object.values(TOPICS).map(family), Object.keys(TOPICS).length * PER_TOPIC);
