# Fluence: Physics Tests

Served at https://trixwotel.github.io/Fluence/physics/ as the physics folder of the Fluence site (see the space branch).

* **index.html** is the page, with the formulas for each test and the styles for the drawings.
* **kinematics.js** makes the Kinematics questions: 14 kinds, 20 variants each (280), and every variant draws its own motion graph (position, velocity or acceleration against time).
* **motion.js** makes Motion in a Straight Line: 12 topics, 20 variants each (240), all with constant acceleration. Speeding up and braking, checkpoints, trips in stages, throwing things down and up (and catching them), bounces, and v–t graphs read for distance and displacement.
* **vectors.js** makes Vectors: 12 topics, 20 variants each (240). Scalars and vectors, components, sizes and directions, i and j, adding and subtracting, the balancing vector, distance and displacement, river crossings and crosswinds. Most variants draw their vectors to scale.
* **projectiles.js** makes Projectile Motion: 13 topics, 20 variants each (260). Things launched sideways (time in the air, how far, how they land, the speed from where they land, clearing a ledge) and at an angle (components, time of flight, highest point, range, where they are partway), straight up and down, from a height at an angle, and into a tank, in terms of g and D. Most variants draw the scene to scale.
* **kinematics-lessons.js**, **motion-lessons.js**, **vectors-lessons.js** and **projectiles-lessons.js** are each test's learning path (its units, in order) and a short lesson for every topic.
* **kinematics-exam.js**, **motion-exam.js**, **vectors-exam.js** and **projectiles-exam.js** make each course's tests like the ones in class: three questions a test, a lab to analyse (process the data, choose what to plot so the model gives a straight line, draw the line of best fit and use its gradient), a problem to solve in steps, and motion to explain, each part with its mark scheme. Each test is built from its number, so Test 37 is always the same test.
* **forces.js**, **statics.js**, **torque.js** and **dynamics.js** make the four forces courses: Forces and Newton’s Laws (what forces do, net force, the three laws, weight, the normal force, friction, tension and falling with air resistance), Statics of Particles (ΣF = 0: ropes and knots, slopes, steady motion), Torque and Rotational Equilibrium (τ = Fl, seesaws, centers of gravity, beams on pivots and cables) and Dynamics of Particles and Systems (ΣF = ma: friction, slopes, ropes, and bodies joined over pulleys). Every topic has 20 variants and is asked in several ways, and they use g = 9.81 m/s².
* **forces-review.js** mixes every topic of the four forces courses in one bank, the topics taking turns.
* **forces-lessons.js**, **statics-lessons.js**, **torque-lessons.js** and **dynamics-lessons.js** are their learning paths, lessons and formulas.
* **mech.js** draws the forces scenes: free-body diagrams, slopes, floors and tables with pulleys, knots on ropes, beams on pivots and cables, and two masses over a pulley, to scale where lengths are given.
* **draw.js** draws what the kit's graphs don't: arrows on a grid where a step is as long across as up, and projectile scenes with cliffs, ledges, walls and tanks, and lengths marked along the edges.

Every topic asks in at least three different ways (a different situation, or a different thing to find). Motion in a Straight Line and Projectile Motion follow the skills in two Advanced Science problem sets (rectilinear and two dimensional kinematics) with new numbers and wording, so nothing is copied from them.

The test runner, the graph drawing and the tests like the ones in class (how they're made, marked and shown) are in the space branch's kit folder. The colors and the rest of the look come from its settings.js.

## License

Apache License 2.0, see LICENSE.
