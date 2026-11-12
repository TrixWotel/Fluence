// Learning Forces and Newton’s Laws: the path (what forces do, Newton’s three laws, the kinds of force, then falling) and
// a short lesson for every topic: the idea, how to do it, what to watch out for, and a tip after a wrong answer. Then the
// formulas box the page shows beside the course. The class uses g = 9.81 m/s².
export const forcesLearning = {
  path: [
    { unit: 'What forces do', topics: ['Dynamics and what a force can do', 'Net force: balanced and unbalanced'] },
    { unit: 'Newton’s three laws', topics: ['The law of inertia', 'The law of acceleration: F = ma', 'More force, more mass', 'The law of interaction'] },
    { unit: 'Kinds of force', topics: ['Weight: W = mg', 'The normal force', 'Friction: f = μN', 'Tension'] },
    { unit: 'Falling', topics: ['Falling with and without air resistance'] },
  ],
  lessons: {
    'Dynamics and what a force can do': {
      idea: '<p>Classical mechanics has three parts. <b>Kinematics</b> describes motion (where, how fast, how long) without asking what causes it. <b>Energetics</b> is about energy. <b>Dynamics</b> is the study of the forces acting on particles and systems: it explains <i>why</i> they move the way they do.</p><p>A force is a push or a pull, and it can do three things to a body. It can change its <b>shape</b> (squeezing a ball), its <b>speed</b> (a kick from rest, or brakes) or its <b>direction</b> (a bat sending a ball back the way it came, or a car going around a bend at a steady speed).</p>',
      how: ['Does the question only describe the motion (kinematics), ask why it moves (dynamics), or ask about energy (energetics)?', 'For a force, look at what changes: the body’s shape, how fast it goes, or which way it goes.', 'Speeding up and slowing down are both changes of speed. Going around a bend at a steady speed is a change of direction.'],
      facts: ['Classical mechanics: kinematics, energetics and dynamics.', 'A force is a push or a pull, measured in newtons (N).'],
      watch: ['Thinking nothing changes for a body going around a bend at a steady speed: its direction changes, and that needs a force too.', 'Mixing up kinematics (describing motion) and dynamics (explaining it with forces).'],
      tip: 'A force changes a body’s shape, its speed or its direction. Dynamics is about those forces; kinematics only describes the motion.',
    },
    'Net force: balanced and unbalanced': {
      idea: '<p>The <b>net force</b> ΣF is all the forces on a body added up, with their directions. Along one line, choose a positive direction: forces that way count +, the others −. Pushes of 140 N to the right and 95 N to the left give ΣF = 140 − 95 = 45 N, to the right.</p><p><b>Balanced</b> forces (ΣF = 0) leave the velocity as it is: the body stays at rest, or keeps moving at a constant velocity. <b>Unbalanced</b> forces change the velocity, in the direction of the net force: the body speeds up, slows down or turns.</p>',
      how: ['Choose a positive direction (the way it moves, or would move).', 'Add the forces along that line: + for that way, − for the other.', 'The size of ΣF is the number without its sign; the sign says which way it points.', 'ΣF = 0: at rest or a constant velocity. ΣF the way it moves: it speeds up. Against its motion: it slows down. At right angles: it turns.'],
      watch: ['Adding the sizes of forces that point opposite ways.', 'Thinking a moving body must have a net force on it: at a constant velocity ΣF = 0.', 'Forgetting that forces like the weight and the normal force on a level floor cancel each other.'],
      tip: 'Add the forces with signs. ΣF = 0 means no change in velocity; otherwise it changes the way ΣF points.',
    },
    'The law of inertia': {
      idea: '<p><b>Newton’s first law</b>: a body at rest stays at rest, and a body moving at a constant velocity keeps that velocity, unless a net external force acts on it. So motion doesn’t need a force; only a <i>change</i> in motion does. A crate pushed across a floor at a constant velocity has ΣF = 0: the push and friction balance.</p><p><b>Inertia</b> is a body’s resistance to a change in its motion, and it grows with the mass: a full shopping cart is harder to start, stop or turn than an empty one. Inertia is why passengers lurch forward when a bus brakes (their bodies keep going), why a puck glides on smooth ice, and why cars need seat belts.</p>',
      how: ['Ask: is the velocity changing? If not, the net force is zero.', 'With no net force, a body at rest stays put, and a moving one keeps the same speed in a straight line.', 'To explain a lurch or a slide, say what keeps moving (or stays still) by inertia, and what changes under it.', 'To compare inertia, compare the masses.'],
      facts: ['More mass, more inertia.'],
      watch: ['Thinking a moving body needs a force to keep it moving.', 'Calling inertia a force: it is something every mass has.', 'Saying the passengers are pushed forward when a bus brakes: nothing pushes them, they just keep going.'],
      tip: 'No net force, no change in velocity: at rest stays at rest, and moving keeps moving the same way.',
    },
    'The law of acceleration: F = ma': {
      idea: '<p><b>Newton’s second law</b>: the net force on a body equals its mass times its acceleration, <b>ΣF = ma</b>, and the acceleration points the same way as the net force. Turned around, a = ΣF/m and m = ΣF/a. A newton is the force that gives 1 kg an acceleration of 1 m/s²: 1 N = 1 kg·m/s².</p><p>A 60 N pull on a 12 kg box on a smooth floor gives a = 60 ÷ 12 = 5 m/s². With 15 N of friction against it, the net force is 60 − 15 = 45 N, so a = 45 ÷ 12 = 3.75 m/s². Find the net force first.</p>',
      how: ['Draw the forces on the body (a free-body diagram).', 'Take the way it moves (or would move) as positive.', 'Across the motion the forces balance (N = W on a level floor).', 'Along it, ΣF = ma, where ΣF is the forward forces minus the backward ones.', 'Solve for what you need: a = ΣF ÷ m, ΣF = ma or m = ΣF ÷ a.'],
      watch: ['Using one force instead of the net force when friction acts too.', 'Forgetting that 1 N = 1 kg·m/s², so newtons ÷ kilograms gives m/s².'],
      tip: 'ΣF = ma: find the net force first, then a = ΣF ÷ m.',
    },
    'More force, more mass': {
      idea: '<p>From a = ΣF/m: with the same mass, the acceleration goes up in step with the net force (a ∝ F), so twice the force gives twice the acceleration. With the same force, it goes down as the mass goes up (a ∝ 1/m), so twice the mass gives half the acceleration.</p><p>Change both and combine them: double the force and triple the mass, and the acceleration becomes 2 ÷ 3 of what it was, so 6 m/s² becomes 4 m/s². The same push that gives a 4 kg cart 6 m/s² gives a 12 kg cart 4 × 6 ÷ 12 = 2 m/s².</p>',
      how: ['New acceleration = old acceleration × (the force’s factor) ÷ (the mass’s factor).', 'The same force on two masses: m₁a₁ = m₂a₂.', 'The same mass with a new acceleration: F₂ = F₁ × a₂ ÷ a₁ (or find m = F₁ ÷ a₁ first).'],
      watch: ['Multiplying by the mass’s factor instead of dividing.', 'Thinking the same push gives a heavier body a bigger acceleration.'],
      tip: 'a = ΣF/m: more force, more acceleration; more mass, less.',
    },
    'The law of interaction': {
      idea: '<p><b>Newton’s third law</b>: when body A pushes or pulls on body B, B pushes or pulls back on A with a force <b>equal in size</b> and <b>opposite in direction</b>. The two forces act on <b>different bodies</b>, and they are the <b>same kind</b> of force.</p><p>The Earth pulls an apple down (its weight), so the apple pulls the Earth up just as hard. The table’s push up on the apple is not its partner: it acts on the apple too, and it is a contact push, not gravity. Partners never cancel, because they act on different bodies. When two skaters push apart, each feels the same force, but the lighter one gets the bigger acceleration (a = F/m); in a crash between a car and a truck, the car’s acceleration is the bigger one.</p>',
      how: ['Name the force as “A on B”.', 'Its partner is “B on A”: the same size, the opposite way, the same kind of force.', 'For each body’s acceleration, use the same force with that body’s own mass: a = F/m.'],
      watch: ['Taking the normal force as the partner of the weight: both act on the same body.', 'Thinking the bigger or faster body pushes harder: the two forces are always the same size.', 'Thinking the pair cancels out: the two forces act on different bodies.'],
      tip: 'Swap the bodies: A on B and B on A are equal and opposite, and the same kind of force.',
    },
    'Weight: W = mg': {
      idea: '<p>A body’s <b>weight</b> is the pull of gravity on it, straight down: <b>W = mg</b>, in newtons. On Earth g = 9.81 m/s², so a 12 kg box weighs 12 × 9.81 = 117.72 N.</p><p>Its <b>mass</b>, in kilograms, is the amount of matter in it, and it is the same everywhere. The weight changes with g: on the Moon (g = 1.62 m/s²) the same box weighs 19.44 N, and on Mars (g = 3.71 m/s²) 44.52 N, but its mass is 12 kg in all three places.</p>',
      how: ['Weight from mass: W = mg.', 'Mass from weight: m = W ÷ g.', 'Somewhere else: find the mass first (it stays the same), then W = mg with that place’s g.'],
      facts: ['g = 9.81 m/s² on Earth, 1.62 m/s² on the Moon, 3.71 m/s² on Mars.'],
      watch: ['Giving a weight in kilograms: it is a force, in newtons.', 'Thinking the mass changes on the Moon.', 'Using 9.81 for g on the Moon or Mars.'],
      tip: 'W = mg, in newtons. The mass, in kilograms, is the same everywhere.',
    },
    'The normal force': {
      idea: '<p>The <b>normal force</b> N is the push of a surface on a body touching it, always <b>perpendicular</b> to the surface. It comes from ΣFy = 0 across the surface.</p><p>On a level floor, N = mg. Press down on the box with a force F, and the floor pushes back harder: N = mg + F. Pull up on it with a force F smaller than its weight, and N = mg − F. On a slope at θ, only W cos θ presses into it, so N = mg cos θ. A rope pulling at θ above the level lifts with T sin θ, so N = mg − T sin θ.</p>',
      how: ['Draw the forces across the surface (the y direction).', 'Take the direction out of the surface as positive.', 'Set ΣFy = 0 and solve for N.', 'On a slope: N = mg cos θ. With a rope at θ above the level: N = mg − T sin θ.'],
      watch: ['Always taking N = mg: that is only on a level surface with nothing else pushing or pulling up or down.', 'Using sin θ instead of cos θ on a slope.', 'Drawing N straight up on a slope: it is perpendicular to the slope.'],
      tip: 'N comes from ΣFy = 0 across the surface. It is mg only when nothing else pushes or pulls up or down.',
    },
    'Friction: f = μN': {
      idea: '<p><b>Friction</b> acts along the surface, against the motion (or against the way the body would slide). When the body slides, or is just about to slide, <b>f = μN</b>, where μ, the coefficient of friction, has no unit.</p><p>A 25 kg crate sliding across a level floor with μ = 0.4: N = mg = 245.25 N, so f = 0.4 × 245.25 = 98.1 N. On a slope, N = mg cos θ, so f = μmg cos θ. Friction grows with μ (a rougher floor) or with N (a heavier load, or a push down), and in this model a sliding box’s speed doesn’t change it. A box at rest that isn’t about to slide has only as much friction as it needs to balance the other forces.</p>',
      how: ['Find N first (level: N = mg; slope: N = mg cos θ).', 'Sliding, or just about to slide: f = μN.', 'Point friction against the motion, or the way it would slide.', 'For μ: μ = f ÷ N.'],
      watch: ['Using μmg on a slope instead of μmg cos θ.', 'Using f = μN for a box at rest that isn’t about to slide: then friction only balances the push.', 'Thinking friction grows with speed.'],
      tip: 'f = μN, against the motion, and get N first.',
    },
    'Tension': {
      idea: '<p><b>Tension</b> T is the pull of a rope, cord or string, along it and away from the body it is tied to. A light rope (one with no weight of its own) has the same tension all along it.</p><p>A body hanging at rest: ΣFy = T − mg = 0, so T = mg, and a 6 kg lamp gives T = 58.86 N. With two boxes hanging one below the other, the lower rope holds only the bottom box, T₂ = m₂g, but the top rope holds both, T₁ = (m₁ + m₂)g. A light rope over a light, frictionless pulley has the same tension on both sides.</p>',
      how: ['Draw the forces on the hanging body: T up, W down.', 'At rest: ΣFy = T − W = 0, so T = mg.', 'For a rope holding several bodies, add up the weights of everything hanging below it.', 'Over a light, frictionless pulley, the other side has the same T.'],
      watch: ['Adding the pulls at the two ends of a rope: two people each pulling with 150 N make a tension of 150 N, not 300 N.', 'Giving the top rope only the top box’s weight.'],
      tip: 'At rest, a rope’s tension is the weight of everything hanging below it.',
    },
    'Falling with and without air resistance': {
      idea: '<p>With <b>no air resistance</b>, the only force on a falling body is its weight, so a = W/m = mg/m = g = 9.81 m/s², whatever its mass. On the Moon, with no air, a hammer and a feather land together.</p><p>With <b>air resistance</b> (drag), the drag grows as the body speeds up. ΣF = W − drag, so a = (mg − drag)/m gets smaller and smaller. When the drag has grown to equal the weight, ΣF = 0 and a = 0: the body falls at a constant velocity, its <b>terminal velocity</b>, and its v–t graph rises steeply at first, then bends over into a flat line. A 70 kg skydiver with 400 N of drag on her has a = (686.7 − 400) ÷ 70 = 4.1 m/s².</p>',
      how: ['Take down as positive.', 'ΣF = W − drag = ma, with W = mg.', 'At terminal velocity: drag = W = mg, and a = 0.', 'With no air resistance: a = g for every body.'],
      watch: ['Thinking heavier bodies fall faster when there is no air resistance.', 'Thinking a body at terminal velocity has stopped, or has no forces on it: the forces on it balance.', 'Forgetting to take the drag away from the weight.'],
      tip: 'ΣF = W − drag. At terminal velocity drag = W, so a = 0.',
    },
  },
};

// the formulas box beside the course (the page shows it in two columns)
export const forcesFormulas = `<ul>
          <li>Net force: add the forces with their directions, <span class="f">ΣF</span>. Balanced, <span class="f">ΣF = 0</span>: at rest or a constant velocity.</li>
          <li>First law: no net force, no change in velocity. More mass, more inertia.</li>
          <li>Second law: <span class="f">ΣF = ma</span>, so <span class="f">a = ΣF/m</span> and <span class="f">m = ΣF/a</span>; 1 N = 1 kg·m/s².</li>
          <li>Third law: A on B and B on A are equal and opposite, act on different bodies, and are the same kind of force.</li>
        </ul>
        <ul>
          <li>Weight: <span class="f">W = mg</span>, with g = 9.81 m/s² (the Moon 1.62 m/s², Mars 3.71 m/s²).</li>
          <li>Normal force: level <span class="f">N = mg</span>; pressed down <span class="f">N = mg + F</span>; pulled up <span class="f">N = mg − F</span>; slope <span class="f">N = mg cos θ</span>; rope at θ above the level <span class="f">N = mg − T sin θ</span>.</li>
          <li>Friction, sliding or just about to: <span class="f">f = μN</span>, against the motion.</li>
          <li>Hanging at rest: <span class="f">T = mg</span>; a rope holds everything below it, the same tension all along a light rope.</li>
          <li>Falling: <span class="f">ΣF = W − drag</span>, <span class="f">a = (mg − drag)/m</span>. Terminal velocity: drag = W, so a = 0.</li>
        </ul>`;
