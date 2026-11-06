# Fluence: Math Tests

Served at https://trixwotel.github.io/Fluence/math/ as the math folder of the Fluence site (see the space branch).

* **index.html** is the page.
* **triangles.js** makes the Triangle Angles questions: 11 kinds, 20 variants each (220), every one with its triangle drawn to scale. **triangles-lessons.js** is its learning path (4 units) and a short lesson for each kind.
* **amc.js** makes the AMC 10 Practice problems: 157 topics, each with 12 variants from at least three different kinds of question (1,884), with five choices. Each problem has a rank, where it would sit in a real AMC 10 (judged against the 2018 to 2025 contests), so the list of topics puts the easier ones first. A test is 25 problems (or as many as you choose), scored like the AMC 10 (6 points for right, 1.5 for blank), with 3 minutes a problem, in one of three kinds: like the real contest (easier problems first, from about problem 1 to problem 25), harder problems only (like numbers 16 to 25), or mixed (every level in a random order).
  * **amc-classic.js** has 12 classic contest topics, and **amc-number.js**, **amc-algebra.js**, **amc-geometry.js**, **amc-counting.js** and **amc-probability.js** the 75 topics modelled on past AMC 10 ideas (2015 to 2024), with new numbers and wording. Each file is its topics, and each topic a list of question types that take turns.
  * **amc-hard-algebra.js**, **amc-hard-number.js**, **amc-hard-counting.js**, **amc-hard-probability.js**, **amc-hard-geometry.js** and **amc-hard-shapes.js** have 30 more topics, problems 4 to 16, modelled on ideas from the 2025 AMC 10A and 10B and on classic contest methods: Vieta's formulas, remainders of polynomials, telescoping sums, recursion, states and random walks, derangements, power of a point, unfolding and more.
  * **amc-top-algebra.js**, **amc-top-number.js**, **amc-top-counting.js** and **amc-top-geometry.js** have the 32 hardest topics, problems 17 to 25: functional equations, roots with conditions, towers of powers, gcd and lcm of three numbers, Pascal's triangle mod p, routes with roadblocks, linearity of expectation, conditional chances, Routh style areas, folding, slicing a cube and more. Every problem's answer is checked a second way (by brute force, exact fractions or coordinates). **amc-top-middle.js** has 8 topics of multi-step word problems for the middle of a test (8 to 18): calendars, logic puzzles, clock hands, mixtures, relative speed and more. Each has its lessons in its own file (amc-top-*-lessons.js).
  * **amc-kit.js** has what they share: the five choices, surds and fractions as choices, and family(), which takes a topic's question types in turn.
  * **amc-lessons.js** is the learning path (6 units: arithmetic and algebra, word problems, number theory, counting, probability, geometry, each with its harder topics last) and a lesson for every topic: how to spot it in a test, the idea, how to do it, the facts worth knowing by heart, what to watch out for, and a tip that is also the first hint.
* **amc12.js** makes the AMC 12 Practice problems: 142 topics with 12 variants each (1,704). 24 of them are topics only the AMC 12 tests, and the rest are the AMC 10's topics that aren't too easy for it, moved down the paper as on the real contests, where an AMC 10 problem 6 is about an AMC 12 problem 1 and an AMC 10 problem 25 about an AMC 12 problem 22. An AMC 10 topic's easiest problems stay out of a test like the real contest, but are there for learning the topic.
  * **amc12-logs-complex.js**, **amc12-trig-space.js** and **amc12-algebra-plus.js** have the 24 topics of its own, 8 each: logs and complex numbers, trig, conics and solids, and polynomials, sequences, floors, big powers and expected value. Each has its lessons in a file ending in -lessons.js.
  * **amc12-lessons.js** is its learning path, with the three new units first, then the AMC 10's lessons for the topics that stay.
* **index.html** also has the AMC's contest strategy notes: when a guess beats a blank, pacing, trying the choices, small cases, friendly numbers, and reading the question again.

The test runner and the drawing code are in the space branch's kit folder. The colors and the rest of the look come from its settings.js.

The AMC problems are original, in the style of the contest. Real AMC problems are the MAA's copyright, so none are copied here.

## License

Apache License 2.0, see LICENSE.
