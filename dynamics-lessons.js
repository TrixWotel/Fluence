// Learning Dynamics of Particles and Systems: the path (one body on a level floor, then on a slope, then on a rope, then
// bodies joined together) and a short lesson for every topic: the idea, how to do it, what to watch out for, and a tip
// after a wrong answer. Then the formulas box. g = 9.81 m/s² throughout, as the class uses.
export const dynamicsLearning = {
  path: [
    { unit: 'One body on a level', topics: ['One force, no friction', 'Pushing against friction', 'Pulling at an angle', 'Stopping on a level'] },
    { unit: 'On a slope', topics: ['Sliding down a smooth slope', 'Sliding down a rough slope', 'Sliding up a slope'] },
    { unit: 'Up and down', topics: ['Lifting and lowering on a rope'] },
    { unit: 'Connected bodies', topics: ['A table and a hanging mass', 'A slope and a hanging mass', 'Two masses over a pulley', 'Boxes pushed or pulled together'] },
  ],
  lessons: {
    'One force, no friction': {
      idea: '<p>Newton’s second law: the net force on a body gives it an acceleration, <b>ΣF = ma</b>. Draw the forces, take the way it moves as positive, and write ΣF along the motion and across it. With no friction, a level force F is the only force along the floor: ΣFx = F = ma. Up and down, the floor’s push N balances the weight W = mg (with g = 9.81 m/s², as in class): ΣFy = N − W = 0.</p><p>A 60 N pull on a 12 kg box: a = 60 ÷ 12 = 5 m/s². Then the motion equations take over: from rest, v = at and s = ½at².</p>',
      how: ['Draw the forces: W = mg down, N up, F along the floor.', 'Take the way it moves as positive.', 'ΣFx = F = ma, so a = F/m, F = ma or m = F/a.', 'From rest: v = at and s = ½at² (g = 9.81 m/s² for any weights).'],
      watch: ['Using the weight mg in place of the mass: F = ma takes the mass in kg.', 'Stopping at the acceleration when the question wants a speed or a distance: those need the time too.'],
      tip: 'No friction: ΣFx = F = ma, so a = F/m.',
    },
    'Pushing against friction': {
      idea: '<p>A box sliding on a level floor has friction against its motion. ΣFy = N − mg = 0 gives N = mg, and while it slides, friction is at its full value, f = μN = μmg. Along the floor: ΣFx = F − f = ma.</p><p>A 100 N push on a sliding 20 kg crate with μ = 0.3: f = 0.3 × 20 × 9.81 = 58.9 N, so a = (100 − 58.9) ÷ 20 = 2.06 m/s². Turned around: the push for a wanted acceleration is F = m(a + μg), and μ from a measured acceleration is (F − ma) ÷ mg.</p>',
      how: ['N = mg on a level floor with a level push, so f = μmg.', 'ΣFx = F − f = ma, so a = (F − μmg)/m.', 'For a wanted acceleration: F = m(a + μg).', 'For μ: f = F − ma, then μ = f/N.'],
      watch: ['Adding friction instead of taking it away: it acts against the motion.', 'Writing f = μm and forgetting g: friction is μ times N, a force in newtons.'],
      tip: 'Sliding on a level: f = μmg, then ΣFx = F − f = ma.',
    },
    'Pulling at an angle': {
      idea: '<p>A rope at θ above the level does two jobs: <b>F cos θ</b> pulls along the floor, and <b>F sin θ</b> lifts a little. Lifting means the floor pushes up less: ΣFy = N + F sin θ − mg = 0, so N = mg − F sin θ, and friction f = μN is less too.</p><p>Along the floor: ΣFx = F cos θ − μ(mg − F sin θ) = ma. A 50 N pull at 30° on a 10 kg box with μ = 0.2: N = 98.1 − 25 = 73.1 N, f = 14.6 N, a = (43.3 − 14.6) ÷ 10 = 2.87 m/s².</p>',
      how: ['Split the pull: F cos θ along the floor, F sin θ up.', 'ΣFy = 0: N = mg − F sin θ.', 'Friction while it slides: f = μN.', 'ΣFx = F cos θ − f = ma.'],
      watch: ['Using N = mg: the rope’s lift makes N smaller.', 'Swapping sin and cos: cos θ is the part along the floor, next to the angle.'],
      tip: 'At an angle: N = mg − F sin θ, then ΣFx = F cos θ − μN = ma.',
    },
    'Stopping on a level': {
      idea: '<p>Sliding or skidding to a stop, friction is the only force along the floor. With the way it moves positive, ΣFx = −μmg = ma, so a = −μg: it slows by μg every second, whatever its mass.</p><p>Then the motion equations: from 0 = v₀² − 2μgd, it stops in a distance d = v₀² ÷ (2μg), and from 0 = v₀ − μgt, in a time t = v₀ ÷ μg. A box let go at 4 m/s on a floor with μ = 0.25 slows at 2.45 m/s² and stops in 3.26 m. Twice the speed stops in four times the distance.</p>',
      how: ['Deceleration: μg (the mass cancels).', 'Stopping distance: d = v²/(2μg).', 'Stopping time: t = v/(μg).', 'From skid marks: μ = v²/(2gd), or the speed v = √(2μgd).'],
      watch: ['Keeping the mass in: f = μmg, but a = f/m = μg.', 'Thinking twice the speed stops in twice the distance: it is four times.'],
      tip: 'Only friction slows it: a = μg, d = v²/(2μg), t = v/(μg).',
    },
    'Sliding down a smooth slope': {
      idea: '<p>On a slope, take x along the slope and y across it. The weight splits into <b>W sin θ</b> down the slope and <b>W cos θ</b> into it. The slope’s push balances the part into it, ΣFy = N − mg cos θ = 0, so with no friction only mg sin θ acts along it: ΣFx = mg sin θ = ma.</p><p>So a = g sin θ, the same for any mass: at 30°, 9.81 × 0.5 = 4.91 m/s². From rest, after sliding a distance s it moves at v = √(2as), and it takes t = √(2s/a).</p>',
      how: ['Axes along the slope (down it positive) and across it.', 'Along: ΣFx = mg sin θ = ma, so a = g sin θ.', 'Across: N = mg cos θ.', 'From rest: v² = 2as and s = ½at².'],
      watch: ['Using cos θ for the part down the slope: it is sin θ (on a level floor, θ = 0, there is none).', 'Thinking a heavier box slides faster: the mass cancels.'],
      tip: 'Smooth slope: a = g sin θ, whatever the mass.',
    },
    'Sliding down a rough slope': {
      idea: '<p>Now friction acts up the slope, against the sliding. N = mg cos θ, so f = μmg cos θ. Down the slope positive: ΣFx = mg sin θ − μmg cos θ = ma, so a = g(sin θ − μ cos θ), and the mass cancels again.</p><p>A 15 kg box on a 40° slope with μ = 0.2: a = 9.81 × (sin 40° − 0.2 × cos 40°) = 4.8 m/s². Put down at rest, it only slides if gravity’s part beats the most friction can give, mg sin θ > μmg cos θ, which is tan θ > μ. Otherwise friction just holds it, with less than μN.</p>',
      how: ['ΣFy = 0: N = mg cos θ.', 'Sliding, so f = μN = μmg cos θ, up the slope.', 'ΣFx = mg sin θ − f = ma, so a = g(sin θ − μ cos θ).', 'μ from a measured a: μ = (g sin θ − a)/(g cos θ).'],
      watch: ['Using f = μmg: on a slope N is mg cos θ.', 'Saying a box at rest has friction μN: it has only as much as it needs, up to μN.'],
      tip: 'Down a rough slope: a = g(sin θ − μ cos θ), and it slides only if tan θ > μ.',
    },
    'Sliding up a slope': {
      idea: '<p>Sent up a slope, a box slows down. Gravity’s part, mg sin θ, points down the slope, and friction, always against the motion, points down the slope too. With up the slope positive: ΣFx = −mg sin θ − μmg cos θ = ma, so it slows at g(sin θ + μ cos θ), or just g sin θ when smooth.</p><p>Then it goes d = v² ÷ (2a) up the slope, in a time v ÷ a. At 5 m/s up a 30° slope with μ = 0.2: a = 9.81 × (0.5 + 0.173) = 6.6 m/s², so it goes 1.89 m. Once it stops, it slides back only if tan θ > μ.</p>',
      how: ['Up the slope positive (the way it moves).', 'Both mg sin θ and μmg cos θ point down the slope.', 'Deceleration: g(sin θ + μ cos θ).', 'Distance d = v²/(2a), time t = v/a.'],
      watch: ['Putting friction up the slope: going up, friction acts down.', 'Using the way-down acceleration, g(sin θ − μ cos θ), for the way up.'],
      tip: 'Going up, gravity and friction both slow it: a = g(sin θ + μ cos θ).',
    },
    'Lifting and lowering on a rope': {
      idea: '<p>A body on a rope has two forces: the tension T up and its weight mg down. Take up as positive: ΣF = T − mg = ma.</p><p>When the acceleration points up (speeding up on the way up, or slowing on the way down), T = m(g + a), more than the weight. When it points down (speeding up on the way down, or slowing on the way up), T = m(g − a), less. At a steady speed, either way, a = 0 and T = mg. A 50 kg crate lifted and speeding up at 2 m/s²: T = 50 × (9.81 + 2) = 590.5 N.</p>',
      how: ['Up positive: T − mg = ma.', 'Which way does the acceleration point? Speeding up: the way it moves. Slowing: the other way.', 'Pointing up: T = m(g + a). Pointing down: T = m(g − a).', 'From a measured T: a = (T − mg)/m, and a minus sign means downward.'],
      watch: ['Thinking that moving up means T is more than mg: at a steady speed it is exactly mg, and slowing on the way up it is less.', 'Putting the speed in place of the acceleration.'],
      tip: 'T − mg = ma with up positive: which way the acceleration points decides whether T is more or less than mg.',
    },
    'A table and a hanging mass': {
      idea: '<p>A box m₁ on a table is tied by a light rope over a light, frictionless pulley at the edge to a hanging box m₂. They move together with the same a, and the rope pulls each with the same T. Take the way they move as positive and write one equation per body: m₁: T − μm₁g = m₁a. m₂: m₂g − T = m₂a.</p><p>Add them and T cancels: a = (m₂ − μm₁)g/(m₁ + m₂). With m₁ = 18 kg, μ = 0.2 and m₂ = 32 kg: a = (32 − 3.6) × 9.81 ÷ 50 = 5.57 m/s², and then T = m₂(g − a) = 135.6 N, less than m₂’s weight. On a smooth table, μ = 0.</p>',
      how: ['The way they move is positive: m₁ along the table, m₂ down.', 'm₁: T − μm₁g = m₁a. m₂: m₂g − T = m₂a.', 'Add: a = (m₂ − μm₁)g/(m₁ + m₂).', 'Put a back: T = m₂(g − a), or T = m₁(a + μg).'],
      watch: ['Taking T = m₂g: m₂ is accelerating, so T is less than its weight.', 'Dividing by m₂ alone instead of m₁ + m₂: both bodies are accelerated.'],
      tip: 'One equation per body, then add them so T cancels: a = (m₂ − μm₁)g/(m₁ + m₂).',
    },
    'A slope and a hanging mass': {
      idea: '<p>Now m₁ is on a slope, with the rope parallel to the slope, over a pulley at the top to a hanging m₂. If m₂ falls, m₁ goes up the slope, and both gravity’s part m₁g sin θ and friction μm₁g cos θ pull m₁ back: m₁: T − m₁g sin θ − μm₁g cos θ = m₁a. m₂: m₂g − T = m₂a.</p><p>Adding: a = (m₂ − m₁ sin θ − μm₁ cos θ)g/(m₁ + m₂). With m₁ = 21 kg on 50°, μ = 0.1 and m₂ = 40 kg: a = 3.63 m/s², T = m₂(g − a) = 247.3 N. From rest, m₂ only falls if m₂g beats m₁g sin θ plus the most friction can give (and m₁ only slides down if m₁g sin θ beats m₂g plus it).</p>',
      how: ['Check it moves: is m₂g more than m₁g sin θ + μm₁g cos θ?', 'm₁ (up the slope positive): T − m₁g sin θ − μm₁g cos θ = m₁a.', 'm₂ (down positive): m₂g − T = m₂a.', 'Add them for a, then T = m₂(g − a).'],
      watch: ['Using m₁g for the pull down the slope: it is m₁g sin θ.', 'Using N = m₁g for the friction: on the slope N = m₁g cos θ.'],
      tip: 'm₂g pulls, m₁g sin θ and friction hold back: a = (m₂ − m₁ sin θ − μm₁ cos θ)g/(m₁ + m₂).',
    },
    'Two masses over a pulley': {
      idea: '<p>Two boxes hang from the ends of a light rope over a light, frictionless pulley. The heavier, m₂, goes down and the lighter, m₁, goes up, with the same a and the same T: m₂: m₂g − T = m₂a. m₁: T − m₁g = m₁a.</p><p>Adding: a = (m₂ − m₁)g/(m₁ + m₂), and T = m₁(g + a) = 2m₁m₂g/(m₁ + m₂). With 3 kg and 5 kg: a = 2 × 9.81 ÷ 8 = 2.45 m/s² and T = 36.8 N, between the two weights (29.4 N and 49.1 N).</p>',
      how: ['The way they move is positive: m₂ down, m₁ up.', 'm₂g − T = m₂a and T − m₁g = m₁a.', 'Add: a = (m₂ − m₁)g/(m₁ + m₂).', 'T = m₁(g + a); from rest, v = at and s = ½at².'],
      watch: ['Dividing by m₂ − m₁ or by one mass: both are accelerated, so divide by m₁ + m₂.', 'Taking T as one of the weights: it is between them.'],
      tip: 'Over a pulley: a = (m₂ − m₁)g/(m₁ + m₂) and T = 2m₁m₂g/(m₁ + m₂).',
    },
    'Boxes pushed or pulled together': {
      idea: '<p>Bodies that move together share one acceleration. Take them all as one body to find it: on a smooth floor a = F/(m₁ + m₂), since the pushes between them are inside and cancel. Then take one body alone for the force between them.</p><p>A 30 N push on a 6 kg box with a 4 kg box in front of it: a = 30 ÷ 10 = 3 m/s², and only the back box pushes the front one, so P = 4 × 3 = 12 N. With the same μ under both: a = (F − μ(m₁ + m₂)g)/(m₁ + m₂), and the front box needs P = m(a + μg) with its own mass. Two carts on a string, pulled at the front: the string moves the back cart, T = (its mass) × a.</p>',
      how: ['All of them as one body: (m₁ + m₂)a = F − any friction.', 'Then the body that only the other one pushes or pulls.', 'The push on the front box: its mass × a (plus its own friction, μmg).', 'The string to the back cart: the back cart’s mass × a.'],
      watch: ['Saying the push between the boxes is F: it only has to move the front box.', 'Using the wrong box’s mass: the force between them moves the box it acts on.'],
      tip: 'All together for a, then one box alone for the force between them.',
    },
  },
};

// the formulas box, shown in two or three columns
export const dynamicsFormulas = `<ul>
          <li>Newton’s second law: <span class="f">ΣF = ma</span>, with the way it moves (or would move) as positive.</li>
          <li>For each body: <span class="f">ΣFx = ma</span> along the motion, <span class="f">ΣFy = 0</span> across it.</li>
          <li>Weight <span class="f">W = mg</span>, with <span class="f">g = 9.81 m/s²</span>. Sliding friction <span class="f">f = μN</span>, against the motion; at rest, only what it takes, up to μN.</li>
          <li>Constant acceleration: <span class="f">v = v₀ + at</span>, <span class="f">s = v₀t + ½at²</span>, <span class="f">v² = v₀² + 2as</span> (v₀ the starting speed).</li>
        </ul>
        <ul>
          <li>Level: <span class="f">N = mg</span>; pulled at θ above the level, <span class="f">N = mg − F sin θ</span>.</li>
          <li>Stopping by friction alone: <span class="f">a = μg</span>, <span class="f">d = v²/(2μg)</span>, <span class="f">t = v/(μg)</span>.</li>
          <li>Slope: <span class="f">W sin θ</span> down it, <span class="f">N = mg cos θ</span>. Sliding down: <span class="f">a = g(sin θ − μ cos θ)</span>, if tan θ > μ. Sliding up: it slows at <span class="f">g(sin θ + μ cos θ)</span>.</li>
          <li>On a rope, up positive: <span class="f">T − mg = ma</span>, so <span class="f">T = m(g ± a)</span>.</li>
        </ul>
        <ul>
          <li>Joined by a rope: one equation per body, add them so T cancels, then put a back for T.</li>
          <li>Table: <span class="f">a = (m₂ − μm₁)g/(m₁ + m₂)</span>, <span class="f">T = m₂(g − a)</span>.</li>
          <li>Slope: <span class="f">a = (m₂ − m₁ sin θ − μm₁ cos θ)g/(m₁ + m₂)</span>.</li>
          <li>Over a pulley: <span class="f">a = (m₂ − m₁)g/(m₁ + m₂)</span>, <span class="f">T = 2m₁m₂g/(m₁ + m₂)</span>.</li>
          <li>Moving together on a smooth floor: <span class="f">a = F/(m₁ + m₂)</span>; the push on the front box is its mass × a. With μ under both: <span class="f">a = (F − μ(m₁ + m₂)g)/(m₁ + m₂)</span>, push <span class="f">m₂(a + μg)</span>.</li>
        </ul>`;
