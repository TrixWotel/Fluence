// What the one-day AMC 10 lesson teaches (emergency.js shows it). Temporary: it takes itself down after November 4, 2026
// (.github/workflows/emergency.yml on the space branch). Each block has cards to know cold, the starred ones first if time
// is short, and problems from the AMC bank, picked by topic and how late in a test they would sit (rank).
export const NOW = { right: 13, wrong: 4, blank: 8 };
export const points = (right, blank) => right * 6 + blank * 1.5;

export const GOALS = [
  { right: 13, wrong: 4, blank: 8, say: 'Your mock' },
  { right: 13, wrong: 2, blank: 10, say: 'Two slips caught or left blank' },
  { right: 15, wrong: 4, blank: 6, say: 'Two blanks turned into right answers' },
  { right: 16, wrong: 4, blank: 5, say: 'The goal' },
  { right: 18, wrong: 3, blank: 4, say: 'A great day' },
];

export const BLOCKS = [
  {
    id: 'plan', name: 'Your game plan', mins: 15, lead: 'No new math here, just where your next points are and how to spend the 75 minutes.',
    cards: [
      { star: true, title: 'When to answer and when to leave it', rule: 'Right = 6, blank = 1.5, wrong = 0. So a guess beats a blank only if you can cross out at least two choices.', ex: 'Five choices left: 6 ÷ 5 = 1.2, leave it. Four left: 6 ÷ 4 = 1.5, a tie, so follow a hunch if you have one. Three left: 6 ÷ 3 = 2, always answer.' },
      { star: true, title: 'How to spend 75 minutes', rule: 'About 18 minutes on #1 to 10, 25 on #11 to 17, and 30 on #18 to 25, keeping the last 2 for your blanks and the guessing rule.', ex: 'You don’t have to go in order at the end: read all of #18 to 25 first and start with the friendliest. Stuck for 4 minutes on anything? Mark it and move on.' },
      { star: true, title: 'Every problem is worth the same 6 points', rule: 'A slip on #4 costs as much as missing #24, and you lost 24 points to 4 wrong answers. Before you mark an answer, read the last line again.', ex: 'Does it ask for x, or for 2x + 1? At least, or exactly? Positive, or just whole numbers? Different digits?' },
      { title: 'Ways in when you’re stuck', rule: 'Try the choices (start at C, as they’re in order). Work out small cases and look for the pattern. Put in friendly numbers. Draw it to scale. Ask what the answer must be: its last digit, even or odd, its rough size.', ex: 'Choices tell you things too. If they all have √3 in them, look for an equilateral or 30°-60°-90° triangle.' },
      { star: true, title: 'Do this now, with your mock in front of you', rule: 'For each of your 4 wrong answers: a slip, or something you didn’t know? For each of your 8 blanks: which topic is it, and could you have crossed out two choices?', ex: 'Write down the topics. They’re what to spend the most time on in the next four blocks.' },
    ],
  },
  {
    id: 'algebra', name: 'Algebra and word problems', mins: 40, lead: 'Most of these turn a messy problem into one short step, if you spot it.',
    cards: [
      { star: true, title: 'Sum and product give you the rest', rule: 'x² + y² = (x + y)² − 2xy, and x³ + y³ = (x + y)³ − 3xy(x + y).', ex: 'x + y = 7 and xy = 10: x² + y² = 49 − 20 = 29, and x³ + y³ = 343 − 210 = 133.' },
      { star: true, title: 'Roots without solving (Vieta)', rule: 'For ax² + bx + c, the roots add to −b/a and multiply to c/a.', ex: 'Roots of 2x² − 6x + 1: sum 3, product 1/2. So r² + s² = 3² − 2(1/2) = 8.' },
      { star: true, title: 'Factoring an equation', rule: 'Whole-number answers wanted, with an xy in it? Add a number to both sides so it factors: xy + ax + by + ab = (x + b)(y + a). Then list the factor pairs.', ex: 'xy + 2x + 3y = 18 becomes (x + 3)(y + 2) = 24. For positive x and y that gives (4, 6), (6, 4) and (8, 3), so 3 solutions.' },
      { star: true, title: 'Means and medians', rule: 'Total = mean × how many. For a median, sort first. To make one number as big as you can, make the others as small as they’re allowed to be.', ex: 'Five numbers average 12 and a sixth brings the mean to 13: the sixth is 6 × 13 − 5 × 12 = 18.' },
      { title: 'Rates', rule: 'Average speed = total distance ÷ total time, never the average of the speeds. Work rates add. Speeds add when two things approach each other, and subtract when one chases the other.', ex: '30 mph out and 60 mph back averages 40 mph. Jobs of 3 hours and 6 hours together: 1/3 + 1/6 = 1/2, so 2 hours.' },
      { title: 'Sequences and sums', rule: 'Arithmetic: sum = how many × (first + last) ÷ 2. Endless geometric: first ÷ (1 − ratio). Telescoping: 1/(n(n + 1)) = 1/n − 1/(n + 1).', ex: '3 + 7 + … + 43 has 11 terms and adds to 11 × 46 ÷ 2 = 253. 6 + 3 + 3/2 + … = 12. 1/(1·2) + 1/(2·3) + … + 1/(9·10) = 1 − 1/10 = 9/10.' },
      { title: 'Write out the first terms', rule: 'A strange rule or a huge index usually repeats. Write six terms, find the cycle, then use a remainder.', ex: 'a₁ = 2 and each next term is 1 − 1/(the last): 2, 1/2, −1, 2, … That repeats every 3, and 100 leaves remainder 1, so a₁₀₀ = 2.' },
      { title: 'Exponents and logs', rule: 'Get the same base on both sides. log<sub>b</sub> x = y means b<sup>y</sup> = x. Logs of a product add, and log<sub>a</sub> b · log<sub>b</sub> c = log<sub>a</sub> c.', ex: '8<sup>x</sup> = 4<sup>x+1</sup> means 3x = 2x + 2, so x = 2. And log₂ 3 · log₃ 8 = log₂ 8 = 3.' },
      { title: 'Percents and parabolas', rule: 'Percent changes multiply. A parabola ax² + bx + c turns at x = −b/(2a).', ex: 'Up 20% then down 20% is 1.2 × 0.8 = 0.96, a 4% loss. −x² + 6x + 1 is highest at x = 3, where it’s 10.' },
    ],
    drills: [['Factoring an equation', 10], ['Roots without solving', 12], ['Mean, median and mode', 13], ['Relative speed', 14], ['Recursive functions', 15], ['Logs and exponents', 19]],
  },
  {
    id: 'counting', name: 'Counting and probability', mins: 40, lead: 'These fill the middle and end of the test, and a clean method beats listing everything out.',
    cards: [
      { star: true, title: 'Count what you don’t want', rule: '“At least one” almost always means: everything minus none.', ex: 'Four coin flips with at least one head: 1 − 1/16 = 15/16.' },
      { star: true, title: 'Steps multiply, cases add', rule: 'Fill the fussiest place first. If the steps depend on each other, split into cases and add.', ex: 'Three-digit numbers with all different digits: 9 × 9 × 8 = 648 (the first digit can’t be 0).' },
      { star: true, title: 'Know these numbers on sight', rule: 'C(5,2) = 10, C(6,2) = 15, C(6,3) = 20, C(7,2) = 21, C(7,3) = 35, C(8,2) = 28, C(8,3) = 56, C(8,4) = 70, C(9,3) = 84, C(10,2) = 45, C(10,3) = 120.', ex: 'Grid paths are the same idea: 4 right and 3 up can go in C(7,3) = 35 ways. To go through a certain point, multiply the two parts.' },
      { star: true, title: 'Expected value adds up', rule: 'Find the chance for each piece on its own and add them, even when the pieces depend on each other.', ex: 'Hats handed back at random to n people: each gets their own with chance 1/n, so on average n × 1/n = 1 person does, for any n.' },
      { title: 'Identical things into boxes (stars and bars)', rule: 'n identical things into k boxes: C(n + k − 1, k − 1) ways. If every box needs at least one: C(n − 1, k − 1).', ex: '5 candies to 3 kids: C(7,2) = 21. With every kid getting one: C(4,2) = 6.' },
      { title: 'Together, apart, and in a circle', rule: 'Together: glue them into one, then multiply by their own orders. Apart: everything minus together. Around a table: (n − 1)!', ex: '5 people in a row with A and B together: 2 × 4! = 48. Apart: 120 − 48 = 72. Around a table: 4! = 24.' },
      { title: 'Repeats, and overlap', rule: 'Arrangements with repeats: n! ÷ (each repeat’s count)!. Two overlapping groups: A + B − both.', ex: 'BANANA: 6! ÷ (3! 2!) = 60. Multiples of 2 or 5 from 1 to 100: 50 + 20 − 10 = 60.' },
      { title: 'Chances, one draw at a time', rule: 'Without putting back, the fractions change as you go. For two dice, a sum s comes up 6 − |7 − s| ways out of 36.', ex: 'From 2 red and 3 blue, both red: 2/5 × 1/4 = 1/10. A sum of 9 on two dice: 4 ways of 36.' },
      { title: 'Count by the last step', rule: 'If a count is hard to do at once, ask how it can end. That gives a rule from smaller cases, and you can build a table.', ex: 'Climbing stairs 1 or 2 at a time: f(n) = f(n − 1) + f(n − 2), so 1, 2, 3, 5, 8: 8 ways for 5 stairs.' },
      { title: 'Symmetry and pictures', rule: 'If two things are interchangeable, each is just as likely as the other. If a chance comes from a length or an area, draw it and divide.', ex: 'In a random order of 5 people, A is before B half the time. x and y random from 0 to 1 with x + y &lt; 1: half the square, so 1/2.' },
    ],
    drills: [['Stars and bars', 10], ['Expected value', 11], ['Counting with recursion', 13], ['Random walks and states', 13], ['Seating with rules', 14], ['Linearity of expectation', 20]],
  },
  {
    id: 'numbers', name: 'Number theory', mins: 30, lead: 'Nearly everything here starts the same way: write out the prime factors.',
    cards: [
      { star: true, title: 'Prime factors first', rule: 'Number of divisors: add 1 to each exponent and multiply. A perfect square has all even exponents.', ex: '72 = 2³ · 3² has 4 × 3 = 12 divisors. The smallest k making 72k a square is 2, as 144 = 12².' },
      { star: true, title: 'Remainders and last digits', rule: 'Remainders add and multiply, so work with them alone. Last digits of powers repeat, at most every 4. For 9, use the digit sum. For 4, the last two digits.', ex: '7, 9, 3, 1 repeats every 4, and 2026 leaves remainder 2, so 7²⁰²⁶ ends in 9. 2026 has digit sum 10, so it leaves remainder 1 on dividing by 9.' },
      { star: true, title: 'GCD by subtracting', rule: 'gcd(a, b) = gcd(a, b − a), so subtract to get rid of the variable. And gcd × lcm = a × b.', ex: 'gcd(2n + 3, n + 1): 2n + 3 − 2(n + 1) = 1, so they never share a factor. gcd(12, 18) = 6 and lcm = 36, and 6 × 36 = 12 × 18.' },
      { title: 'Whole-number fractions', rule: 'Split off the whole part, so only a number over the variable is left. Then that denominator must divide it.', ex: '(n + 6)/(n + 1) = 1 + 5/(n + 1), so n + 1 divides 5. For positive n, n = 4 is the only one, and 10/5 = 2.' },
      { title: 'Difference of squares', rule: 'x² − y² = (x − y)(x + y), and those two factors are both odd or both even. So a number works unless it leaves remainder 2 on dividing by 4.', ex: 'x² − y² = 15: (1, 15) gives (8, 7) and (3, 5) gives (4, 1), so 2 solutions in positive whole numbers.' },
      { title: 'Inside a factorial', rule: 'The power of a prime p in n! is ⌊n/p⌋ + ⌊n/p²⌋ + … Zeros at the end of n! are the power of 5.', ex: '100! ends in 20 + 4 = 24 zeros. 10! has 2 to the power 5 + 2 + 1 = 8.' },
      { title: 'Bases and floors', rule: 'Digits in base b are multiples of powers of b. ⌊√n⌋ = k for the 2k + 1 numbers from k² to k² + 2k.', ex: '213 in base 4 is 2·16 + 1·4 + 3 = 39. ⌊√n⌋ = 3 for n from 9 to 15, which is 7 numbers.' },
      { title: 'Divisibility, and numbers that look prime', rule: 'For 3 and 9: digit sum. For 4: last two digits. For 8: last three. For 11: alternating digit sum.', ex: '2728: 2 − 7 + 2 − 8 = −11, so 11 divides it. Not prime: 51 = 3·17, 57 = 3·19, 87 = 3·29, 91 = 7·13, 119 = 7·17, 133 = 7·19, 143 = 11·13.' },
    ],
    drills: [['Counting divisors', 8], ['Floors and square roots', 11], ['Whole-number puzzles', 13], ['GCD of expressions', 15], ['Digit patterns in base b', 17], ['Zeros at the end of n!', 19]],
  },
  {
    id: 'geometry', name: 'Geometry', mins: 45, lead: 'Draw it large and to scale first. Most of these come down to a right triangle or similar triangles.',
    cards: [
      { star: true, title: 'Triangles to know on sight', rule: '3-4-5, 5-12-13, 8-15-17, 7-24-25 and their multiples. 45°-45°-90° is 1, 1, √2. 30°-60°-90° is 1, √3, 2. An equilateral triangle has height s√3/2 and area s²√3/4.', ex: 'Side 4: height 2√3 and area 4√3.' },
      { star: true, title: 'Similar triangles', rule: 'Lengths in ratio k means areas in ratio k². Triangles with the same height have areas in the ratio of their bases.', ex: 'A line parallel to the base, a third of the way down from the top, cuts off 1/9 of the area, leaving 8/9.' },
      { star: true, title: 'Right triangle shortcuts', rule: 'Altitude to the hypotenuse = ab/c. Median to the hypotenuse = c/2, also the circumradius. Inradius = (a + b − c)/2.', ex: 'For 3-4-5: altitude 12/5, median 5/2, inradius 1.' },
      { star: true, title: 'Circle facts', rule: 'An inscribed angle is half its arc, so an angle on a diameter is 90°. A radius meets a tangent at 90°. Two tangents from a point are equal. Touching circles: the distance between centers is the sum of the radii.', ex: 'Arc of 80°: inscribed angle 40°. Circles of radius 1 and 4 sitting on a line and touching are 2√(1·4) = 4 apart along the line.' },
      { title: 'Crossing lines in a circle (power of a point)', rule: 'Two chords: AX · XB = CX · XD. From a point outside: tangent² = outside part × whole secant.', ex: 'A secant with outside part 4 and whole length 9 means a tangent of length √36 = 6.' },
      { title: 'The area formulas', rule: '½bh, ½ab sin C, Heron’s √(s(s−a)(s−b)(s−c)), and rs, where s is half the perimeter and r the inradius.', ex: 'The 13-14-15 triangle comes up a lot: s = 21, area 84, inradius 4, and the altitude to side 14 is 12.' },
      { title: 'Angle bisectors', rule: 'A bisector cuts the opposite side in the ratio of the other two sides.', ex: 'AB = 6, AC = 9, BC = 10: BD : DC = 2 : 3, so BD = 4 and DC = 6.' },
      { title: 'Coordinates', rule: 'Stuck with no angles to chase? Put a corner at (0, 0) and a side along an axis. With one corner at the origin, a triangle’s area is ½|x₁y₂ − x₂y₁|.', ex: '(0, 0), (4, 0), (1, 3): ½|4·3 − 1·0| = 6.' },
      { title: 'Curved pieces', rule: 'The piece between a chord and its arc is a sector minus a triangle. Shaded areas are usually one easy shape minus another.', ex: 'A quarter circle of radius 2 minus its right triangle: π − 2.' },
      { title: 'Polygons and solids', rule: 'Interior angles add to 180(n − 2). A regular hexagon is 6 equilateral triangles. Box diagonal = √(a² + b² + c²). Cone = ⅓πr²h. Sphere = 4/3 πr³, surface 4πr².', ex: 'Hexagon of side 2: area 6√3. Box 2 by 3 by 6: diagonal 7. For the shortest path over a solid, unfold it flat.' },
    ],
    drills: [['Right triangles', 9], ['Power of a point', 10], ['Angle bisectors', 11], ['Areas cut by a line', 11], ['Tangent circles on a line', 14], ['Quarter circles in a square', 16], ['Folding paper', 19]],
  },
  {
    id: 'rehearsal', name: 'The end of the test', mins: 40, lead: 'Practice the part where your 8 blanks are: 10 harder problems, timed, scored like the real thing.',
    test: { href: './#amc10/test/10/hard', text: 'Start 10 harder problems' },
    steps: [
      'Set a timer for 30 minutes. That’s about how long you’ll have for #18 to 25, with a little extra.',
      'Read all 10 first and start with the friendliest. Practice not going in order.',
      'Use the guessing rule: cross out two choices or leave it blank.',
      'Afterward, read the worked solution of every problem you missed or left blank. That’s where most of tonight’s learning is.',
    ],
  },
  {
    id: 'tonight', name: 'Tonight and test day', mins: 10, lead: 'Stop here. A rested head is worth more than one more topic.',
    lists: [
      { title: 'Read these once more', items: [
        'Guess only with two choices crossed out. Otherwise leave it blank for 1.5.',
        'x² + y² = (x + y)² − 2xy. The roots of ax² + bx + c add to −b/a and multiply to c/a.',
        '“At least one” means everything minus none. Expected values just add.',
        'Divisors: add 1 to each exponent and multiply. Last digits repeat at most every 4.',
        '3-4-5, 5-12-13, 8-15-17, 7-24-25. 30°-60°-90° is 1, √3, 2. Similar by k means areas by k².',
        'Chords: AX · XB = CX · XD. Tangent² = outside × whole. Inscribed angle = half the arc.',
      ] },
      { title: 'Tonight', items: ['No new topics in the last hour before bed.', 'Get a full night’s sleep. It helps more than cramming now.', 'Check your school’s instructions: when, where, and what to bring. No calculators.'] },
      { title: 'During the test', items: ['Eat something first, and start the first few problems slowly.', 'Read the last line of every problem again before you answer.', 'Stuck for 4 minutes? Mark it and move on.', 'Read all of #18 to 25 before choosing where to start.', 'Keep the last 2 minutes for your blanks.'] },
    ],
  },
];
