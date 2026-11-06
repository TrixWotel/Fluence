// Learning AMC 12 Practice: the topics only the AMC 12 tests come first, as they're what's new after the AMC 10, then the
// AMC 10's harder topics with their own lessons.
import * as logsComplex from './amc12-logs-complex-lessons.js';
import * as trigSpace from './amc12-trig-space-lessons.js';
import * as algebraPlus from './amc12-algebra-plus-lessons.js';
import { amcLearning } from './amc-lessons.js';
import { EASY } from './amc12.js';

export const amc12Learning = {
  path: [
    { unit: 'Logs and complex numbers', topics: logsComplex.topics },
    { unit: 'Trig, conics and solids', topics: trigSpace.topics },
    { unit: 'Polynomials and sequences', topics: algebraPlus.topics },
    ...amcLearning.path.map((u) => ({ unit: u.unit, topics: u.topics.filter((t) => !EASY.has(t)) })).filter((u) => u.topics.length),
  ],
  lessons: { ...amcLearning.lessons, ...logsComplex.lessons, ...trigSpace.lessons, ...algebraPlus.lessons },
};
