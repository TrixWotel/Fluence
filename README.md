# Fluence: Science Tests

Served at https://trixwotel.github.io/Fluence/science/ as the science folder of the Fluence site (see the space branch).

* **index.html** is the page, with the formulas and the table of specific heats.
* **heat.js** makes the Heat Capacity questions (Q = mcΔT): 11 kinds, 20 variants each (220), from warming and cooling to mixing hot metal into water, electric heaters and calories.
* **heat-lessons.js** is the learning path (3 units) and a short lesson for each kind of question.
* **concepts.js** turns a set of ideas into questions: 30 a topic, asked in turn as a choice of five, a word to type, true or false, words to match, things to sort onto two sides, steps to put in order, all that fit, and numbers to work out.
* **systems**, **energy**, **earth** and **labs** are the four sets of ideas (Systems and Matter; Energy and Matter; Earth and Energy Systems; Investigations and Data): each has a `-data.js` with its topics' facts, words, statements, pairs, sorts and worked numbers, a `-lessons.js` with the learning path, a short lesson a topic and the key facts shown beside the set, and a small `.js` that makes the set.
* **review.js** mixes every topic of the first three sets into one, for tests on all of it.
* **heat-exam.js** makes the Heat and Energy tests like the ones in class: four questions a test (a graph of heating or cooling to read and explain, a data set and its feedback loops, an experiment to plan, sketch and explain, and problem solving with Q = mcΔT, density and volume), each part with its mark scheme. Each test is built from its number, so Test 37 is always the same test.

The test runner and the tests like the ones in class (how they're made, marked and shown) are in the space branch's kit folder. The colors and the rest of the look come from its settings.js.

## License

Apache License 2.0, see LICENSE.
