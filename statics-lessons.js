// Learning Statics of Particles: the path (equilibrium, then knots held by ropes, then boxes held on slopes, then steady
// motion) and a short lesson for every topic: the idea, how to do it, what to watch out for, and a tip after a wrong
// answer. g = 9.81 m/s² throughout, as in class.
export const staticsLearning = {
  path: [
    { unit: 'Equilibrium', topics: ['Equilibrium: ΣF = 0', 'Weight along and into a slope'] },
    { unit: 'Ropes and knots', topics: ['Two ropes at the same angle', 'A rope to the ceiling and a level rope', 'Two ropes at different angles', 'Pulled aside'] },
    { unit: 'On a slope', topics: ['Held on a smooth slope', 'Held on a rough slope'] },
    { unit: 'Steady motion', topics: ['Pulling at a steady speed', 'Sliding at a steady speed'] },
  ],
  lessons: {
    'Equilibrium: ΣF = 0': {
      spot: 'Something stays still, or moves in a straight line at a steady speed (a constant velocity), and you need a force that keeps it that way.',
      idea: '<p>A body is in <b>equilibrium</b> when all the forces on it add to zero: ΣF<sub>x</sub> = 0 and ΣF<sub>y</sub> = 0. That is true when it is at rest, and just as true when it moves at a constant velocity: keeping a steady velocity takes no net force.</p><p>So a missing force is whatever balances the rest. A 70 kg crate lifted at a steady 0.5 m/s: T = mg = 70 × 9.81 = 686.7 N, the same as if it hung still. Pulls of 30 N east and 40 N north are balanced by √(30² + 40²) = 50 N pointing the opposite way to their resultant: 53.1° south of west.</p>',
      how: ['Pick the body and draw every force on it (W = mg down, with g = 9.81 m/s²).', 'Take the way it moves, or would move, as +.', 'Write ΣF<sub>x</sub> = 0 (and ΣF<sub>y</sub> = 0) and solve for the missing force.', 'Two forces at right angles: the balancing force is √(F₁² + F₂²), pointing opposite their resultant.'],
      facts: ['At rest or at a constant velocity: ΣF = 0.', 'Speeding up, slowing down or changing direction: ΣF ≠ 0.'],
      watch: ['Thinking something moving needs a net force to keep going: at a steady velocity, ΣF = 0.', 'Giving the resultant’s direction for the balancing force instead of the opposite one.', 'Calling something in equilibrium because it stops for an instant, like a ball at the top of its flight.'],
      tip: 'At rest or at a constant velocity, ΣF = 0: the missing force balances all the others.',
    },
    'Weight along and into a slope': {
      idea: '<p>On a slope, take x along the slope and y perpendicular to it. The weight points straight down, so it has a part along each: <b>W sin θ</b> down the slope and <b>W cos θ</b> into it, where θ is the slope’s angle to the level. (The angle between W and the line into the slope is θ itself.)</p><p>A 10 kg box on a 30° slope: W = 10 × 9.81 = 98.1 N, so 98.1 × sin 30° = 49.05 N pulls it down the slope and 98.1 × cos 30° = 84.96 N presses it into the slope. Below 45° the part into the slope is the bigger one; at 45° they are equal; above 45° the part down the slope wins.</p>',
      how: ['W = mg, with g = 9.81 m/s².', 'Down the slope: W sin θ. Into the slope: W cos θ.', 'For the angle from a part: sin θ = (part down the slope) ÷ W, or cos θ = (part into it) ÷ W.'],
      watch: ['Swapping sin and cos: the part down the slope uses sin, and it is 0 on a level floor.', 'Using the mass instead of the weight: multiply by 9.81 first.'],
      tip: 'Down the slope W sin θ, into it W cos θ; on level ground (θ = 0) all of W is into the floor.',
    },
    'Two ropes at the same angle': {
      idea: '<p>A weight hangs from a knot held by two ropes, each at θ to the level. Their level parts, T cos θ, pull opposite ways and cancel. Their upward parts hold the weight: ΣF<sub>y</sub> = 0 gives <b>2T sin θ = W</b>, so T = W ÷ (2 sin θ).</p><p>300 N hung from two ropes at 40° to the ceiling: T = 300 ÷ (2 × 0.643) = 233.4 N each. If the angle is given from the vertical, φ, the upward part is T cos φ, so 2T cos φ = W (40° from the level is 50° from the vertical, and gives the same answer). The flatter the ropes, the harder they pull: at 10° the same weight needs 864 N in each.</p>',
      how: ['Find W (W = mg if you’re given the mass).', 'Angle from the level: 2T sin θ = W. From the vertical: 2T cos φ = W.', 'Solve for T, or for W if the tension is given.'],
      watch: ['Forgetting the 2: two ropes share the weight.', 'Using sin with an angle measured from the vertical.', 'Thinking flatter ropes pull less: they pull more.'],
      tip: 'Two ropes at θ to the level: 2T sin θ = W, so T = W ÷ (2 sin θ).',
    },
    'A rope to the ceiling and a level rope': {
      idea: '<p>A mass hangs on a rope (T₃) from a knot. One rope (T₁) goes up to the ceiling at θ to it, and another (T₂) goes level to a wall. The hanging mass is at rest, so <b>T₃ = mg</b>. At the knot, only T₁ has an upward part: ΣF<sub>y</sub> = 0 gives <b>T₁ sin θ = T₃</b>. Across, T₂ balances T₁’s level part: ΣF<sub>x</sub> = 0 gives <b>T₂ = T₁ cos θ</b>.</p><p>A 15 kg mass with T₁ at 40°: T₃ = 15 × 9.81 = 147.15 N, T₁ = 147.15 ÷ sin 40° = 228.9 N, and T₂ = 228.9 × cos 40° = 175.4 N. The rope to the ceiling always pulls hardest.</p>',
      how: ['T₃ = mg (the hanging mass alone).', 'Up at the knot: T₁ sin θ = T₃, so T₁ = T₃ ÷ sin θ.', 'Across: T₂ = T₁ cos θ.', 'Working back from T₂: T₁ = T₂ ÷ cos θ, then T₃ = T₁ sin θ and m = T₃ ÷ 9.81.'],
      watch: ['Giving T₂ a part up: it is level, so it holds none of the weight.', 'Thinking T₃ depends on the angles: it is just mg.'],
      tip: 'Up: T₁ sin θ = T₃ = mg. Across: T₂ = T₁ cos θ.',
    },
    'Two ropes at different angles': {
      idea: '<p>With the ropes at θ₁ and θ₂ to the level, write both equations at the knot. Across: <b>T₁ cos θ₁ = T₂ cos θ₂</b>. Up: <b>T₁ sin θ₁ + T₂ sin θ₂ = W</b>. Put T₂ = T₁ cos θ₁ ÷ cos θ₂ from the first into the second and it comes out as T₁ = W cos θ₂ ÷ sin(θ₁ + θ₂), and likewise T₂ = W cos θ₁ ÷ sin(θ₁ + θ₂).</p><p>300 N from ropes at 30° and 60°: sin 90° = 1, so T₁ = 300 × cos 60° = 150 N and T₂ = 300 × cos 30° = 259.8 N. The steeper rope pulls harder: its cosine is smaller, so it needs more tension to give the same level part.</p>',
      how: ['Across: T₁ cos θ₁ = T₂ cos θ₂.', 'Up: T₁ sin θ₁ + T₂ sin θ₂ = W.', 'Solve them together, or use T₁ = W cos θ₂ ÷ sin(θ₁ + θ₂) and T₂ = W cos θ₁ ÷ sin(θ₁ + θ₂).', 'Check: the steeper rope should have the bigger tension.'],
      watch: ['Pairing each tension with the wrong cosine in the formula: T₁ goes with cos θ₂.', 'Splitting the weight evenly between the ropes: that only works when the angles are the same.'],
      tip: 'T₁ = W cos θ₂ ÷ sin(θ₁ + θ₂): each rope’s tension uses the other rope’s angle, and the steeper rope pulls harder.',
    },
    'Pulled aside': {
      idea: '<p>A weight on a rope is pulled sideways by a level force F until the rope makes φ with the <b>vertical</b>, and it hangs still. The rope’s pull splits into T cos φ up and T sin φ across. Up: T cos φ = W. Across: T sin φ = F. Dividing, <b>F = W tan φ</b>, and <b>T = W ÷ cos φ</b>, which is the same as √(W² + F²).</p><p>A 5 kg weight at 30° to the vertical: W = 49.05 N, F = 49.05 × tan 30° = 28.32 N and T = 49.05 ÷ cos 30° = 56.64 N. Given W and F instead, the angle is φ = tan⁻¹(F ÷ W).</p>',
      how: ['W = mg.', 'F = W tan φ (φ from the vertical).', 'T = W ÷ cos φ, or √(W² + F²) from W and F.', 'The angle: tan φ = F ÷ W.'],
      watch: ['Using sin for the up part: φ is from the vertical, so up is T cos φ.', 'Adding W and F for the tension instead of using Pythagoras.'],
      tip: 'Pulled aside to φ from the vertical: F = W tan φ and T = √(W² + F²).',
    },
    'Held on a smooth slope': {
      idea: '<p>A smooth slope has no friction, so whatever holds the box has to balance the whole of W sin θ. Held by a rope along the slope: <b>T = mg sin θ</b>, and the slope pushes back with <b>N = mg cos θ</b>.</p><p>Held by a level push F instead, only its part along the slope, F cos θ, helps: F cos θ = mg sin θ, so <b>F = mg tan θ</b>. Its other part, F sin θ, presses the box into the slope, so N = mg cos θ + F sin θ = <b>mg ÷ cos θ</b>. For 10 kg on a 25° slope: a rope needs 41.46 N, a level push 45.74 N, and the normal force goes from 88.91 N to 108.24 N.</p>',
      how: ['Take x along the slope and y out of it.', 'Rope along the slope: ΣF<sub>x</sub> = 0 gives T = mg sin θ; ΣF<sub>y</sub> = 0 gives N = mg cos θ.', 'Level push: F cos θ = mg sin θ, so F = mg tan θ, and N = mg cos θ + F sin θ = mg ÷ cos θ.'],
      watch: ['Writing N = mg cos θ when a level push also presses the box into the slope.', 'Thinking a level push needs F = mg sin θ: only its part along the slope helps.'],
      tip: 'Rope along a smooth slope: T = mg sin θ. Level push: F = mg tan θ and N = mg ÷ cos θ.',
    },
    'Held on a rough slope': {
      idea: '<p>Friction can act up or down a slope: always against the way the box moves, or would move. It reaches its full value <b>f = μN</b> only when the box slides or is just about to; at rest otherwise, it is whatever balances.</p><p>A 20 kg box on a 35° slope with μ = 0.25: N = 196.2 × cos 35° = 160.7 N, so μN = 40.2 N, and the weight’s part down the slope is 112.5 N. Just about to slide down, friction helps the rope: T + f = W sin θ, so T = mg(sin θ − μ cos θ) = 72.4 N. Pulled up at a steady speed, friction works against the rope: T = mg(sin θ + μ cos θ) = 152.7 N. With no rope, it stays put only if tan θ ≤ μ; here tan 35° = 0.70, so it slides.</p>',
      how: ['N = mg cos θ (y out of the slope).', 'Decide which way it moves or would move: friction points the other way.', 'Just about to slide down: T = mg(sin θ − μ cos θ). Pulled up steadily: T = mg(sin θ + μ cos θ).', 'At rest and not about to slide: friction = whatever makes ΣF<sub>x</sub> = 0.', 'No rope: it stays if tan θ ≤ μ.'],
      watch: ['Putting friction the wrong way: up the slope when the box would slide down, down the slope when it is pulled up.', 'Using μN for a box at rest that isn’t about to slide.'],
      tip: 'Friction opposes the motion, or the would-be motion: about to slide down, T = mg(sin θ − μ cos θ); pulled up, T = mg(sin θ + μ cos θ).',
    },
    'Pulling at a steady speed': {
      idea: '<p>Moving at a constant velocity is equilibrium, so ΣF = 0 even though it moves. On a level floor with a level pull, N = mg and friction μN balances the pull: <b>F = μmg</b>. Then the other way round, a measured steady pull gives μ = F ÷ mg.</p><p>With the rope at θ above the level, it also lifts a little: N = mg − F sin θ, so friction is smaller. Across, F cos θ = μ(mg − F sin θ), which gives <b>F = μmg ÷ (cos θ + μ sin θ)</b>. For 20 kg and μ = 0.3: a level pull needs 58.86 N, and at 30° only 57.93 N, with N = 167.2 N.</p>',
      how: ['Up: N + F sin θ = mg (with a level pull, N = mg).', 'Along: F cos θ = μN.', 'Solve for what you need: F, μ = F cos θ ÷ N, or N = mg − F sin θ.'],
      watch: ['Using N = mg when the rope pulls partly up.', 'Thinking a steady speed needs a pull bigger than friction: it needs exactly as big.'],
      tip: 'Steady speed means ΣF = 0: F cos θ = μN, with N = mg − F sin θ.',
    },
    'Sliding at a steady speed': {
      idea: '<p>A box sliding down a slope at a constant speed is in equilibrium. Along the slope, the weight’s part mg sin θ is balanced by friction μmg cos θ, so <b>μ = tan θ</b>: the mass cancels. The friction force is <b>mg sin θ</b> and the normal force <b>mg cos θ</b>.</p><p>An 8 kg block sliding steadily down a 20° ramp: μ = tan 20° = 0.364, friction 78.48 × sin 20° = 26.84 N, and N = 78.48 × cos 20° = 73.75 N. Going the other way, μ = 0.3 means the slope where it slides steadily is tan⁻¹ 0.3 = 16.7°. A heavier box of the same material does just the same.</p>',
      how: ['Along the slope: mg sin θ = μmg cos θ, so μ = tan θ.', 'Friction = mg sin θ; normal force = mg cos θ.', 'The angle from μ: θ = tan⁻¹ μ.'],
      watch: ['Using sin θ or cos θ alone for μ: it is tan θ.', 'Thinking a heavier box slides faster: both forces grow with the mass.'],
      tip: 'Sliding at a constant speed down a slope: μ = tan θ.',
    },
  },
};

// the formulas box beside the course, shown in two columns
export const staticsFormulas = `<ul>
          <li>Equilibrium (at rest or at a constant velocity): <span class="f">ΣF<sub>x</sub> = 0</span> and <span class="f">ΣF<sub>y</sub> = 0</span>.</li>
          <li>Weight: <span class="f">W = mg</span>, with <span class="f">g = 9.81 m/s²</span>.</li>
          <li>A rope at θ to the level: <span class="f">T cos θ</span> across, <span class="f">T sin θ</span> up.</li>
          <li>Friction: <span class="f">f = μN</span> when sliding or just about to slide; at rest otherwise, whatever balances.</li>
        </ul>
        <ul>
          <li>Two ropes at θ to the level: <span class="f">2T sin θ = W</span> (φ from the vertical: <span class="f">2T cos φ = W</span>).</li>
          <li>Rope at θ to the ceiling and a level rope: <span class="f">T₁ sin θ = mg</span>, <span class="f">T₂ = T₁ cos θ</span>.</li>
          <li>Ropes at θ₁ and θ₂: <span class="f">T₁ = W cos θ₂ / sin(θ₁ + θ₂)</span>, <span class="f">T₂ = W cos θ₁ / sin(θ₁ + θ₂)</span>.</li>
          <li>Pulled aside to φ from the vertical: <span class="f">F = W tan φ</span>, <span class="f">T = W / cos φ = √(W² + F²)</span>.</li>
        </ul>
        <ul>
          <li>On a slope at θ: <span class="f">W sin θ</span> down it, <span class="f">W cos θ</span> into it.</li>
          <li>Smooth slope: rope along it <span class="f">T = mg sin θ</span>, <span class="f">N = mg cos θ</span>; level push <span class="f">F = mg tan θ</span>, <span class="f">N = mg / cos θ</span>.</li>
          <li>Rough slope: about to slide down <span class="f">T = mg(sin θ − μ cos θ)</span>; pulled up steadily <span class="f">T = mg(sin θ + μ cos θ)</span>; stays put alone if <span class="f">tan θ ≤ μ</span>.</li>
          <li>Pulled steadily on a level floor: <span class="f">F = μmg</span>; at θ above the level <span class="f">F = μmg / (cos θ + μ sin θ)</span>. Sliding steadily down a slope: <span class="f">μ = tan θ</span>.</li>
        </ul>`;
