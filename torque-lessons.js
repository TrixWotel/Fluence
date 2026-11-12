// Learning Torque and Rotational Equilibrium: the path (what torque is and which way it turns, then what keeps things
// balanced, then beams with their own weight, supports and cables) and a short lesson for every topic: the idea, how to
// do it, what to watch out for, and a tip after a wrong answer. g = 9.81 m/s² throughout.
export const torqueLearning = {
  path: [
    { unit: 'Torque', topics: ['Torque: τ = Fl', 'The lever arm and the angle', 'Clockwise and counterclockwise'] },
    { unit: 'Equilibrium', topics: ['Conditions for equilibrium', 'Balancing: the counterweight', 'Balancing: where to sit', 'Center of gravity'] },
    { unit: 'Beams', topics: ['A heavy beam on a pivot', 'The push of the supports', 'A beam held by a cable'] },
  ],
  lessons: {
    'Torque: τ = Fl': {
      spot: 'a force, and a distance from the point something turns about: a pivot, a hinge, a bolt or an axle.',
      idea: '<p><b>Torque</b> measures how strongly a force tends to turn something about a pivot. It depends on the force and on how far from the pivot it acts: <b>τ = Fl</b>, where l is the <b>lever arm</b>, the distance from the pivot to the force, measured at right angles to it. Torque is in <b>N·m</b>.</p><p>A 5 kg mass hanging 2 m from a pivot pulls down with mg = 5 × 9.81 = 49.05 N, so its torque is τ = 5 × 9.81 × 2 = 98.1 N·m. The same torque takes less force farther out: that’s why a long wrench frees a stuck bolt more easily, and why a door’s handle is far from its hinges.</p>',
      how: ['Find the force. For a mass, it’s its weight: F = mg, with g = 9.81 m/s².', 'Find the lever arm l: the distance from the pivot to where the force acts (here the force is at right angles to the bar).', 'τ = Fl, in N·m.', 'Turned around: l = τ ÷ F, or F = τ ÷ l.'],
      watch: ['Using the mass instead of the weight: multiply by 9.81 first.', 'Measuring from the end of the bar instead of from the pivot.', 'Thinking a longer wrench needs more force: the torque needed is the same, so a longer l needs a smaller F.'],
      tip: 'τ = Fl: force × its distance from the pivot (at right angles). For a mass, F = mg.',
    },
    'The lever arm and the angle': {
      idea: '<p>Only the part of a force at right angles to the bar turns it. A force at θ to the bar has F sin θ across the bar and F cos θ along it, and the part along it turns nothing, so <b>τ = Fl sin θ</b>, with l the distance from the pivot to where the force acts.</p><p>Another way to see it: the <b>lever arm</b> is the perpendicular distance from the pivot to the force’s line, l sin θ. Either way, a force turns it most at 90° (sin 90° = 1), and not at all along the bar or through the pivot (sin 0° = 0). A 40 N pull on the end of a 0.3 m wrench at 30° to it gives 40 × 0.3 × sin 30° = 6 N·m, half what it gives at right angles.</p>',
      how: ['Find θ, the angle between the force and the bar.', 'τ = Fl sin θ.', 'Or find the lever arm first, l sin θ, then τ = F × lever arm.', 'For the force needed: F = τ ÷ (l sin θ).'],
      watch: ['Using cos θ: that’s the part along the bar, which doesn’t turn it.', 'Forgetting that a force along the bar, or through the pivot, gives no torque at all.', 'Thinking a pull at an angle needs less force than one at right angles: it needs more.'],
      tip: 'τ = Fl sin θ, θ between the force and the bar: most at 90°, none along the bar.',
    },
    'Clockwise and counterclockwise': {
      idea: '<p>A torque turns things one way or the other, so it gets a sign: <b>counterclockwise is +</b> and <b>clockwise is −</b>. On a bar on a pivot, a force pushing down on the right of the pivot turns it clockwise, and down on the left counterclockwise. Upward forces do the opposite.</p><p>The net torque is the sum with signs. With 40 N down 2 m left of the pivot (+80 N·m) and 30 N down 1.5 m right of it (−45 N·m), Στ = +35 N·m: a net torque of 35 N·m, and the bar turns counterclockwise. If Στ = 0, it stays balanced.</p>',
      how: ['For each force: τ = F × its distance from the pivot.', 'Give it a sign: picture that force alone. Counterclockwise is +, clockwise −.', 'Add them with their signs: that’s Στ.', 'Its size is the net torque. + means it turns counterclockwise, − clockwise, and 0 means it stays balanced.'],
      facts: ['Down on the right, or up on the left: clockwise (−).', 'Down on the left, or up on the right: counterclockwise (+).'],
      watch: ['Signing a force by its side alone: an upward force on the right turns it counterclockwise.', 'Adding all the torques as positive: opposite ones cancel.', 'Measuring distances from the end of the bar instead of from the pivot.'],
      tip: 'Picture each force alone: which way would it turn the bar? Counterclockwise +, clockwise −, then add.',
    },
    'Conditions for equilibrium': {
      idea: '<p>An object is in <b>equilibrium</b> when two things hold. <b>ΣF = 0</b>, translational equilibrium: the forces cancel, so it doesn’t start moving off. <b>Στ = 0</b>, rotational equilibrium: the torques cancel, so it doesn’t start turning.</p><p>Both are needed. Two equal, opposite forces that aren’t on the same line, a <b>couple</b> (two hands turning a steering wheel), give ΣF = 0 but still turn it. The <b>center of gravity</b> is the point where an object’s whole weight can be taken to act; a uniform beam’s is at its middle.</p>',
      how: ['Check the forces: do they add up to zero (up = down, left = right)?', 'Check the torques about any point: do the counterclockwise ones equal the clockwise ones?', 'It’s in equilibrium only if both are true.', 'Take an object’s weight as acting at its center of gravity.'],
      watch: ['Thinking ΣF = 0 is enough: a couple has ΣF = 0 and still turns things.', 'Thinking equal masses always balance: it’s the torques that have to.', 'Thinking no torques act on something in equilibrium: they act, but add up to zero.'],
      tip: 'Equilibrium: ΣF = 0 (it doesn’t move off) and Στ = 0 (it doesn’t turn). A couple has the first but not the second.',
    },
    'Balancing: the counterweight': {
      idea: '<p>A light plank balances on a pivot when the torques about the pivot cancel: Στ = 0. Each weight gives mg × its distance from the pivot, and g is on both sides, so it cancels: <b>m₁d₁ = m₂d₂</b>.</p><p>16 kg sits 12 m from the pivot, balanced by a counterweight 8 m from it on the other side: mg(8) = 16g(12), so m = 16 × 12 ÷ 8 = 24 kg. With two loads on one side, add their torques: m₁d₁ + m₂d₂ = m₃d₃.</p>',
      how: ['Take torques about the pivot: its own push has no lever arm there.', 'Counterclockwise +: a weight down on the left is +, on the right −.', 'Set Στ = 0 and cancel g: Σ(m × d) on one side = Σ(m × d) on the other.', 'Solve for the mass. For a weight in N, multiply the mass by 9.81 (or use weights in N all through).'],
      watch: ['Using a distance from the end of the plank instead of from the pivot.', 'Thinking the heavier one sits farther out: it sits nearer the pivot.', 'Giving a mass when the question wants a weight in N, or the other way round.'],
      tip: 'Στ = 0 about the pivot: m₁d₁ = m₂d₂ (g cancels), with distances from the pivot.',
    },
    'Balancing: where to sit': {
      idea: '<p>The same balance gives where to sit: d₂ = m₁d₁ ÷ m₂. A 30 kg child 2 m from the pivot balances a 40 kg child sitting 30 × 2 ÷ 40 = 1.5 m from it on the other side: the heavier one sits nearer.</p><p>With more people, add up mass × distance on each side. Two children, 40 kg at 1.5 m and 30 kg at 1 m, make 40 × 1.5 + 30 × 1 = 90 on their side, so a 60 kg adult balances them at 90 ÷ 60 = 1.5 m. A seesaw pivoted at its middle has its own weight at the pivot, so the plank drops out.</p>',
      how: ['Add up mass × distance on the side you know.', 'The other side’s mass × distance has to match.', 'Divide by the person’s mass to get their distance.', 'If someone heavier takes a place, find the new distance the same way and subtract the old one.'],
      watch: ['Dividing the wrong way round: the heavier person sits nearer the pivot.', 'Forgetting one person when two sit on the same side.', 'For “how far must they move”, giving the new distance instead of the change.'],
      tip: 'Distance = (mass × distance on the other side) ÷ your mass. The heavier one sits nearer.',
    },
    'Center of gravity': {
      idea: '<p>The <b>center of gravity</b> is the point where an object’s whole weight can be taken to act. A uniform beam’s is at its middle. For masses on a light rod, measured from one end: <b>x = (m₁x₁ + m₂x₂ + m₃x₃) ÷ (m₁ + m₂ + m₃)</b>.</p><p>A 2 kg mass at the left end of a 3 m rod and a 4 kg mass at its right end: x = (2 × 0 + 4 × 3) ÷ 6 = 2 m from the left end, nearer the heavier one. A pivot under that point balances it, because the torques about it cancel.</p>',
      how: ['Pick one end as x = 0 and measure every position from it.', 'Count a uniform beam or plank as its whole mass at its middle.', 'x = Σ(m × x) ÷ Σm.', 'That point is also where a pivot balances it.'],
      watch: ['Measuring some positions from the other end.', 'Leaving out a plank’s own mass (at its middle) when it isn’t light.', 'Dividing by the number of masses instead of their total.'],
      tip: 'x = Σ(m × x) ÷ Σm, with every x from the same end. A uniform beam’s mass sits at its middle.',
    },
    'A heavy beam on a pivot': {
      idea: '<p>When the beam isn’t light, its own weight counts too. It acts at the beam’s <b>middle</b>, which may be some way from the pivot, so treat it as one more load there.</p><p>A 20 m beam of 20 kg rests on a pivot 3 m from its left end, with 8 kg on its right end. Its middle is 10 m from the left end, 7 m right of the pivot. Torques about the pivot: m(3) = 8(17) + 20(7), so the counterweight on the left end is m = 276 ÷ 3 = 92 kg.</p>',
      how: ['Mark the beam’s middle, half its length from an end, and put its weight Mg there.', 'Find every distance from the pivot.', 'Στ = 0 about the pivot: the counterclockwise torques equal the clockwise ones (g cancels when every load is a mass).', 'Solve for the counterweight, the load or the beam’s mass.'],
      watch: ['Leaving out the beam’s weight, or putting it at the pivot.', 'Using half the length as its lever arm: it’s half the length minus the pivot’s distance from that end.', 'Putting the beam’s torque on the wrong side when its middle is on the other side of the pivot.'],
      tip: 'The beam’s weight acts at its middle: its lever arm is (length ÷ 2) − (the pivot’s distance from that end).',
    },
    'The push of the supports': {
      idea: '<p>Something at rest has <b>ΣF = 0</b>, so whatever holds it up pushes with all the weight it holds. A balanced seesaw’s pivot pushes up with N = (m₁ + m₂ + m<sub>plank</sub>)g.</p><p>With two supports, find how they share it. Take torques about one support: its own push has no lever arm there, so Στ = 0 gives the other support’s push. Then ΣF = 0 gives the first: the two pushes add up to the whole weight. The support nearer a heavy load pushes harder.</p>',
      how: ['Draw the plank: the supports’ pushes up, every weight down (the plank’s at its middle).', 'Take torques about one support: Στ = 0 gives the other support’s push.', 'ΣF = 0: N₁ + N₂ = the total weight, so N₁ = total − N₂.', 'Check: the support nearer the load should push harder.'],
      watch: ['Forgetting the plank’s own weight at its middle.', 'Giving each support half the weight when the load isn’t in the middle.', 'Answering with a mass when a force is wanted: multiply by 9.81 for N.'],
      tip: 'Torques about one support give the other’s push; then the two pushes add up to the whole weight.',
    },
    'A beam held by a cable': {
      idea: '<p>For a beam hinged to a wall and held up by a cable, take torques about the <b>hinge</b>: the hinge’s own force has no lever arm there. Only the part of the tension at right angles to the beam, <b>T sin θ</b>, turns it, and it balances the load’s torque and the beam’s own, at its middle.</p><p>A 16 m beam of 10 kg, with 14 kg hanging from its end, is held by a cable attached 13 m from the hinge at 30° to the beam: (T sin 30°)(13) = (14g)(16) + (10g)(8), so T = 2,982.24 ÷ 6.5 = 459 N.</p>',
      how: ['Take torques about the hinge, counterclockwise +.', 'The cable: (T sin θ) × its distance from the hinge.', 'The load: mg × its distance; the beam: Mg × half its length.', 'Στ = 0, then solve for T (or for the heaviest load, or where to attach the cable).'],
      watch: ['Using T cos θ: that part pulls along the beam, toward the wall, and doesn’t turn it.', 'Forgetting the beam’s own weight at its middle.', 'Using the beam’s whole length as the cable’s distance when it’s attached partway along.'],
      tip: '(T sin θ)(d) = (mg)(L) + (Mg)(L ÷ 2): torques about the hinge.',
    },
  },
};

// the formulas box beside the course
export const torqueFormulas = `<ul>
          <li>Torque: <span class="f">τ = Fl</span> in N·m, l the lever arm: the perpendicular distance from the pivot to the force’s line.</li>
          <li>A force at θ to the bar, l from the pivot: <span class="f">τ = Fl sin θ</span>. Most at 90°; none along the bar or through the pivot.</li>
          <li>Counterclockwise <b>+</b>, clockwise <b>−</b>. Down on the right or up on the left turns it clockwise.</li>
          <li>A weight: <span class="f">W = mg</span>, with g = 9.81 m/s².</li>
        </ul>
        <ul>
          <li>Equilibrium: <span class="f">ΣF = 0</span> (it doesn’t start moving off) and <span class="f">Στ = 0</span> (it doesn’t start turning), both.</li>
          <li>Balanced on a pivot: <span class="f">m₁d₁ = m₂d₂</span> (g cancels), d from the pivot; with more, add each side.</li>
          <li>A uniform beam’s weight acts at its middle. On a light rod, from one end: <span class="f">x = (m₁x₁ + m₂x₂ + …) ÷ (m₁ + m₂ + …)</span>.</li>
        </ul>
        <ul>
          <li>Take torques about the pivot, hinge or a support: the force there has no lever arm.</li>
          <li>Two supports: torques about one give the other’s push, then ΣF = 0 (the pushes add up to the whole weight).</li>
          <li>A cable at θ to a beam, d from the hinge: <span class="f">(T sin θ)d = Σ(weight × distance from the hinge)</span>.</li>
        </ul>`;
