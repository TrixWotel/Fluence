// Lessons for the AMC 12 topics on logs and complex numbers (amc12-logs-complex.js): the order to learn them in, and for
// each one how to spot it in a test, the idea, how to do it, the facts worth knowing by heart, what to watch out for, and
// a tip (shown after a wrong answer, and as the first hint: the way in, never the answer).
export const topics = [
  'Log rules and change of base', 'Equations with logs', 'Logs and whole numbers', 'Exponential equations',
  'Complex arithmetic and modulus', 'Powers of complex numbers', 'Roots of unity', 'Complex numbers as geometry',
];

export const lessons = {
  'Log rules and change of base': {
    spot: 'Several logs with different bases multiplied or added, bases and numbers that are powers of each other (log<sub>4</sub> 27), or letters in the base such as log<sub>xyz</sub> w, and a question about one value: you are not expected to find the letters themselves.',
    idea: 'Every log rule comes from one fact, change of base: log<sub>b</sub> x = (log x)/(log b), in any one base you like. It gives three tools. Powers come out in front: log<sub>u<sup>m</sup></sub>(v<sup>n</sup>) = (n/m)·log<sub>u</sub> v. A log and its swap are reciprocals: (log<sub>a</sub> b)(log<sub>b</sub> a) = 1. And chains cancel: (log<sub>a</sub> b)(log<sub>b</sub> c) = log<sub>a</sub> c. Adding 1 to a log puts one more factor of its base inside: log<sub>a</sub>(bc) + 1 = log<sub>a</sub>(abc). When the numbers are letters, name A = log a, B = log b and C = log c, and every log in the problem becomes a plain fraction in A, B and C. For example, (log<sub>4</sub> 27)(log<sub>9</sub> 32) = (3/2)(log<sub>2</sub> 3)·(5/2)(log<sub>3</sub> 2) = 15/4.',
    how: [
      'Write every base and every number as a power of a prime, and bring the powers out in front.',
      'Pair up what is left: a log with its swap, or a chain whose middle numbers cancel.',
      'If the same base-and-number pair keeps appearing, call it t, so that its swap is 1/t, and solve for t.',
      'With letters a, b and c, either rewrite in base abc (the three logs add up to 1), or use A, B and C and multiply out.',
    ],
    facts: [
      'log<sub>u<sup>m</sup></sub>(v<sup>n</sup>) = (n/m)·log<sub>u</sub> v.',
      '(log<sub>a</sub> b)(log<sub>b</sub> a) = 1, and (log<sub>a</sub> b)(log<sub>b</sub> c)(log<sub>c</sub> a) = 1.',
      'log<sub>w</sub>(xyz) = log<sub>w</sub> x + log<sub>w</sub> y + log<sub>w</sub> z, and it is 1/log<sub>xyz</sub> w.',
      'log<sub>abc</sub> a + log<sub>abc</sub> b + log<sub>abc</sub> c = 1.',
    ],
    watch: [
      'Turning the fraction upside down: the power of the number goes on top, and the power of the base goes on the bottom.',
      'Adding the logs when the bases multiply: log<sub>xy</sub> w is not log<sub>x</sub> w + log<sub>y</sub> w. It is their reciprocals that add.',
      'Picking the wrong solution for t: when a > b > 1, log<sub>a</sub> b is less than 1.',
    ],
    tip: 'Write the bases and numbers as powers of primes, or give the repeated log a name, and look for pairs that cancel.',
  },
  'Equations with logs': {
    spot: 'An equation with the unknown inside a log or in the base of a log (log<sub>3x</sub> 81), logs in several bases, and a question about a solution, the sum or product of all solutions, or how many solutions there are.',
    idea: 'Change everything to one base and give the log a name. With y = log<sub>c</sub> x, the equation turns into ordinary algebra: log<sub>c<sup>e</sup></sub> x = y/e, and when the base contains x, log<sub>c<sup>r</sup>x</sub> c<sup>m</sup> = m/(r + y). Two things then need care. First, since x = c<sup>y</sup>, the product of the solutions is c raised to the sum of the y values, and Vieta gives that sum without solving anything, even for a cubic. Second, numbers inside logs must be positive, and bases must be positive and not 1, so the algebra can produce roots that have to be thrown away. A squared number inside a log allows more x than it seems to: log<sub>4</sub>((x − 3)<sup>2</sup>) = log<sub>2</sub>|x − 3|, which works on both sides of 3. For example, log<sub>2</sub>(x − 1) + log<sub>2</sub>(x + 1) = 3 gives x<sup>2</sup> − 1 = 8, so x = 3 or −3, but x = −3 makes the numbers negative, so only x = 3 works.',
    how: [
      'Choose a base that every number in the problem is a power of, or use natural logs, and let y be the log of x.',
      'Rewrite each log in terms of y, and clear fractions to get a polynomial.',
      'If a sum or product of solutions is asked, use Vieta, but first make sure that every root is real and allowed.',
      'Go back to the original equation: check that every number inside a log is positive and no base is 1.',
      'With two unknowns and two crossed equations, bring exponents down and multiply: reciprocal logs cancel.',
    ],
    facts: [
      'log<sub>c<sup>e</sup></sub> x = (1/e)·log<sub>c</sub> x.',
      'If y = log<sub>c</sub> x, then log<sub>kx</sub> N = (log<sub>c</sub> N)/(log<sub>c</sub> k + y).',
      'c<sup>y₁</sup>·c<sup>y₂</sup> = c<sup>y₁ + y₂</sup>.',
      'log<sub>b<sup>2</sup></sub>(u<sup>2</sup>) = log<sub>b</sub>|u|.',
    ],
    watch: [
      'Keeping a root that makes a number inside a log negative, or a base equal to 1.',
      'Answering with the sum of the y values when the question asks for the product of the x values, or the other way round.',
      'Using Vieta for all the roots of a polynomial when some of them are not allowed.',
      'For an odd power, forgetting the negative root of L<sup>n − 1</sup> = n, and for all powers, forgetting L = 0.',
    ],
    tip: 'Name the log of x in one base, rewrite everything in terms of it, and remember which values the logs allow.',
  },
  'Logs and whole numbers': {
    spot: 'How many digits a huge product has, how many bases b make log<sub>b</sub> N a whole number, a sum of rounded logs like ⌊log<sub>2</sub> 1⌋ + ⌊log<sub>2</sub> 2⌋ + ⋯, or how many powers start with a certain digit.',
    idea: 'A number n has d digits exactly when it is at least 10<sup>d − 1</sup> and below 10<sup>d</sup>, that is, when ⌊log<sub>10</sub> n⌋ = d − 1. For a product of powers, pair off 2s and 5s into 10s and only the leftover needs working out. log<sub>b</sub> N = k means b<sup>k</sup> = N, so k must divide every prime exponent of N. A rounded log stays the same over a long block, from b<sup>j</sup> to b<sup>j + 1</sup> − 1, so group the numbers into blocks and count. Powers of 2 and 5 are tied together by 2<sup>N</sup>·5<sup>N</sup> = 10<sup>N</sup>, and doubling is simple: it adds at most one digit, and a new digit always comes with a first digit of 1. For example, 2<sup>10</sup>·5<sup>12</sup>·3 = 75·10<sup>10</sup>, which has 12 digits.',
    how: [
      'For digits: pair off 2s and 5s, work out the leftover, and add its digits to the number of tens.',
      'For bases: write N with prime exponents, take their greatest common divisor g, and use the divisors of g.',
      'For sums of rounded logs: list the blocks, the value on each and how many numbers it has, and cut the last block off at the end of the range.',
      'For conditions on a log of n<sup>2</sup> or on digits in two bases, turn the condition into a range for n, block by block.',
      'For first digits: follow what doubling does to the number of digits.',
    ],
    facts: [
      'n has d digits exactly when ⌊log<sub>10</sub> n⌋ = d − 1.',
      'If 2<sup>N</sup> has d digits, then 5<sup>N</sup> has N + 1 − d digits.',
      'There are b<sup>j + 1</sup> − b<sup>j</sup> whole numbers from b<sup>j</sup> to b<sup>j + 1</sup> − 1.',
      'log<sub>b</sub> n is rational exactly when b and n are powers of one whole number.',
    ],
    watch: [
      'Off by one in the digits: 10<sup>k</sup> has k + 1 digits, not k.',
      'Forgetting 1 = b<sup>0</sup> when counting powers, or the block that starts at k = 1.',
      'Assuming the last block is complete when the range stops before it ends.',
      'Counting a block up to b<sup>j + 1</sup> when the condition only reaches b<sup>j</sup>√b.',
    ],
    tip: 'Find where the rounded log changes value, and turn the problem into counting whole numbers in those blocks.',
  },
  'Exponential equations': {
    spot: 'Unknowns in exponents: 4<sup>x</sup> − 7·2<sup>x</sup> + 6 = 0, chains such as 4<sup>x</sup> = 5 and 5<sup>y</sup> = 8, equal powers like 2<sup>a</sup> = 5<sup>b</sup> = N, x<sup>y</sup> = y<sup>x</sup>, or terms like 3<sup>log<sub>2</sub> x</sup>.',
    idea: 'Look for the hidden shape before taking logs. Powers of one base make a quadratic in u = a<sup>x</sup>, and u must be positive, so a negative root gives no solution at all. In a chain, putting each equation into the next multiplies the exponents. With equal powers p<sup>a</sup> = N, write p = N<sup>1/a</sup> and combine. In x<sup>y</sup> = y<sup>x</sup> with y = kx, take the x-th root of both sides to get x<sup>k − 1</sup> = k. The swap a<sup>log<sub>b</sub> x</sup> = x<sup>log<sub>b</sub> a</sup> makes two different-looking terms the same number. And an even power in the exponent can be a difference of squares that factors. For example, 4<sup>x</sup> − 7·2<sup>x</sup> + 6 = 0 is (u − 1)(u − 6) = 0 with u = 2<sup>x</sup>, so x = 0 or x = log<sub>2</sub> 6, and the sum is log<sub>2</sub> 6.',
    how: [
      'Write the powers with one base and substitute u = a<sup>x</sup>.',
      'Keep only positive values of u, and turn each one back into x with a log.',
      'For a sum of solutions, add the logs: log<sub>a</sub> u₁ + log<sub>a</sub> u₂ = log<sub>a</sub>(u₁u₂).',
      'To count parameter values, ask how many positive roots the quadratic in u has, using the sign of its product and its sum.',
      'If a term has a log in its exponent, check whether the swap identity makes it match another term.',
    ],
    facts: [
      'a<sup>x</sup> is always positive, and it takes each positive value exactly once when a > 0 and a ≠ 1.',
      'a<sup>log<sub>b</sub> x</sup> = x<sup>log<sub>b</sub> a</sup>, since both have the same log in base b.',
      'If a<sup>x</sup> = b and b<sup>y</sup> = c, then a<sup>xy</sup> = c.',
      'If x<sup>y</sup> = y<sup>x</sup> and y = kx, then x<sup>k − 1</sup> = k.',
    ],
    watch: [
      'Keeping a negative value of u, which gives no real x.',
      'Answering with u when the question asks for x.',
      'Forgetting the double root when counting parameters for exactly one solution.',
      'Treating (a<sup>x</sup>)<sup>y</sup> as a<sup>x + y</sup> instead of a<sup>xy</sup>.',
    ],
    tip: 'Rewrite the powers with one base, or spot two terms that are secretly equal, and name that one quantity.',
  },
  'Complex arithmetic and modulus': {
    spot: 'An equation in z with |z| or z̄ in it, the modulus of a product or fraction, |z + w| given along with |z| and |w|, or a polynomial with complex coefficients or complex roots.',
    idea: 'There are three main tools. First, write z = x + yi and match real and imaginary parts, which turns one complex equation into two real ones. Second, |z|<sup>2</sup> = z·z̄, so a squared modulus multiplies out like algebra: |z + w|<sup>2</sup> = |z|<sup>2</sup> + |w|<sup>2</sup> + z·w̄ + z̄·w, and adding the same thing with a minus sign gives the parallelogram law. Third, the modulus of a product is the product of the moduli, so you rarely need to multiply out. Polynomials with real coefficients have non-real roots in conjugate pairs. In harder equations, everything can be written using the real numbers m = |z|<sup>2</sup> and s = z + z̄, and the equation may complete to squares that add up to 0. On |z| = 1, z̄ = 1/z, so you can divide by z inside a modulus and use half angles. For example, z<sup>2</sup> + |z|<sup>2</sup> = 18 + 6i says 2x<sup>2</sup> + 2xyi = 18 + 6i, so x = ±3, y = ±1 and |z|<sup>2</sup> = 10.',
    how: [
      'If the equation mixes z with |z| or z̄, write z = x + yi and match the two parts.',
      'If only moduli are given, square them with |u|<sup>2</sup> = u·ū and combine.',
      'For a real root of a complex equation, use the imaginary part first, since it is simpler.',
      'To find the square root of a + bi, add the equation x<sup>2</sup> + y<sup>2</sup> = √(a<sup>2</sup> + b<sup>2</sup>) to the two you have.',
      'For the largest value on |z| = 1, write everything in θ, name t = |cos(θ/2)|, and treat the absolute value in cases.',
    ],
    facts: [
      '|zw| = |z||w|, and |z/w| = |z|/|w|.',
      '|z + w|<sup>2</sup> + |z − w|<sup>2</sup> = 2|z|<sup>2</sup> + 2|w|<sup>2</sup>.',
      'z<sup>2</sup> + z̄<sup>2</sup> = (z + z̄)<sup>2</sup> − 2|z|<sup>2</sup>.',
      '1/z + 1/w = (z + w)/(zw).',
      'If |z| = 1, then z̄ = 1/z, and |1 + z| = 2|cos(θ/2)|.',
    ],
    watch: [
      'Treating |z + w| as |z| + |w|: that only happens when z and w point the same way.',
      'Forgetting to take the square root at the end, or to square a modulus at the start.',
      'Mixing up which roots are conjugates: both real parts must match, and the imaginary parts must be opposites.',
      'Comparing only the vertex in a maximum: the end of the range can be larger.',
    ],
    tip: 'Decide whether to split z into x + yi or to multiply out with |u|<sup>2</sup> = u·ū, whichever uses what you are given.',
  },
  'Powers of complex numbers': {
    spot: 'A high power of a complex number: i<sup>2025</sup>, (1 + i)<sup>20</sup>, (cos θ + i sin θ)<sup>n</sup>, z<sup>n</sup> + 1/z<sup>n</sup>, or a sum over many powers.',
    idea: 'Powers of i repeat every 4, so only the remainder of the exponent matters. Since (1 + i)<sup>2</sup> = 2i and (1 − i)<sup>2</sup> = −2i, high powers of 1 ± i come down quickly. For anything else, go to polar form. De Moivre says that (r(cos θ + i sin θ))<sup>n</sup> = r<sup>n</sup>(cos nθ + i sin nθ): the modulus takes the power and the angle multiplies. If z + 1/z = 2 cos θ, then z<sup>n</sup> + 1/z<sup>n</sup> = 2 cos nθ, which runs through a short cycle for a special angle. In a sum, group a full cycle at a time. And a sum with a<sub>n</sub> and b<sub>n</sub>, the parts of z<sup>n</sup>, is often the real or imaginary part of one complex geometric series. For example, (1 + i)<sup>10</sup> = (2i)<sup>5</sup> = 32i.',
    how: [
      'Reduce the exponent: 4 for i, or a multiple where the angle comes back to a whole turn.',
      'Write the base in polar form, and find the modulus and the angle.',
      'If the form is not cos + i sin, first rewrite it: sin t + i cos t = i(cos t − i sin t).',
      'For a real or imaginary power, ask which multiples of the angle land on the axis.',
      'For a sum of parts, write a<sub>n</sub> or a<sub>n</sub>b<sub>n</sub> as a real or imaginary part, sum the geometric series with 1/(1 − w), and only then take that part.',
    ],
    facts: [
      'i<sup>4k</sup> = 1, i<sup>4k + 1</sup> = i, i<sup>4k + 2</sup> = −1, i<sup>4k + 3</sup> = −i.',
      '(1 + i)<sup>2</sup> = 2i, (1 − i)<sup>2</sup> = −2i, and 1/(1 − i) = (1 + i)/2.',
      '(cos θ + i sin θ)<sup>n</sup> = cos nθ + i sin nθ.',
      'z<sup>2</sup> + z̄<sup>2</sup> and z<sup>n</sup> + z̄<sup>n</sup> are real: they are twice the real part.',
      'If z = a + bi, then z<sup>2</sup> = (a<sup>2</sup> − b<sup>2</sup>) + 2abi, so ab is half the imaginary part of z<sup>2</sup>.',
    ],
    watch: [
      'Using the exponent’s remainder when dividing by the wrong number: use the order of the base.',
      'Forgetting the modulus: (√3 + i)<sup>n</sup> has modulus 2<sup>n</sup>, not 1.',
      'Applying De Moivre to sin t + i cos t without changing it first.',
      'Starting the cycle at the wrong place: k = 1 is the first term, not k = 0.',
    ],
    tip: 'Put the base in polar form, or square it, and see how quickly its powers repeat.',
  },
  'Roots of unity': {
    spot: 'z<sup>n</sup> = 1, ω with ω<sup>3</sup> = 1, ω = cos(2π/n) + i sin(2π/n), a product or sum over all the powers of ω, or the sum of every third coefficient of a polynomial.',
    idea: 'The n solutions of z<sup>n</sup> = 1 are evenly spaced around the unit circle. They add up to 0, the conjugate of ω is 1/ω, and x<sup>n</sup> − 1 = (x − 1)(x − ω)⋯(x − ω<sup>n − 1</sup>). That factorization turns a product over all roots into one evaluation: the product of r − ω<sup>k</sup> is r<sup>n</sup> − 1. For cube roots, 1 + ω + ω<sup>2</sup> = 0 collapses many expressions to a single term. Counting uses the greatest common divisor: z<sup>n</sup> = 1 and z<sup>m</sup> = 1 together mean z<sup>g</sup> = 1 with g = gcd(n, m). And the filter: since 1 + ω<sup>j</sup> + ω<sup>2j</sup> is 3 when 3 divides j and 0 otherwise, f(1) + f(ω) + f(ω<sup>2</sup>) is 3 times the sum of the coefficients of x<sup>0</sup>, x<sup>3</sup>, x<sup>6</sup>, and so on. For example, if ω<sup>3</sup> = 1 and ω ≠ 1, then (2 − ω)(2 − ω<sup>2</sup>) is x<sup>2</sup> + x + 1 at x = 2, which is 7.',
    how: [
      'Identify the roots: which n, and is ω a particular one or any non-real one?',
      'For a product over all powers, match it to x<sup>n</sup> − 1 or (x<sup>n</sup> − 1)/(x − 1) and put in a number.',
      'If each factor is a quadratic in ω<sup>k</sup>, factor it first, using its complex roots if needed.',
      'For a sum of reciprocals, pair each root with its conjugate, or expand as geometric series so only multiples of n survive.',
      'For z<sup>m</sup> = z̄<sup>k</sup>, take moduli first, then use z̄ = 1/z on the unit circle, and don’t forget z = 0.',
    ],
    facts: [
      '1 + ω + ω<sup>2</sup> + ⋯ + ω<sup>n − 1</sup> = 0 for any root ω ≠ 1 of x<sup>n</sup> = 1.',
      '(x − ω)(x − ω<sup>2</sup>)⋯(x − ω<sup>n − 1</sup>) = 1 + x + x<sup>2</sup> + ⋯ + x<sup>n − 1</sup>.',
      'The sum of ω<sup>jk</sup> over k = 0, …, n − 1 is n when n divides j, and 0 otherwise.',
      'z<sup>k</sup> is real for |z| = 1 exactly when z<sup>2k</sup> = 1.',
      '|a + bω + cω<sup>2</sup>|<sup>2</sup> = a<sup>2</sup> + b<sup>2</sup> + c<sup>2</sup> − ab − bc − ca for a non-real cube root ω.',
    ],
    watch: [
      'Forgetting the factor (x − 1) when the product starts at k = 1 instead of k = 0.',
      'Counting z<sup>k</sup> = 1 when z<sup>k</sup> = ±1 is what “real” means.',
      'Missing z = 0, which solves z<sup>m</sup> = z̄<sup>k</sup> but not z<sup>m</sup>·z̄<sup>k</sup> = 1.',
      'Mixing up the sign in 1 + ω = −ω<sup>2</sup>.',
    ],
    tip: 'Use x<sup>n</sup> − 1 = the product of x − ω<sup>k</sup>, or 1 + ω + ω<sup>2</sup> = 0, before you try any arithmetic with ω.',
  },
  'Complex numbers as geometry': {
    spot: 'Points in the complex plane: a rotation, a square or polygon with complex vertices, the solutions of an equation as a shape, a condition like |z − a| + |z − b| = c, or a curve traced as w moves around a circle.',
    idea: 'Adding a number slides the plane. Multiplying by w turns it by the angle of w and stretches it by |w|. So a turn about c is z → c + (z − c)(cos θ + i sin θ), and a right-angle turn is just multiplying the arrow by i or −i. And |z − a| is a distance, so conditions draw shapes: |z − a| = r is a circle, |z − a| + |z − b| = |a − b| is the segment from a to b, and |z − a| = k|z − b| with k ≠ 1 is a circle. The solutions of (z − c)<sup>n</sup> = R<sup>n</sup> form a regular n-gon with center c and radius R. Sides and diagonals can be added like arrows, and a triangle with vertices 0, u and v has area ½|cross product of u and v|. As w goes around a circle, w and k/w turn in opposite directions, so w + k/w traces an ellipse. For example, turning 3 + i by 90° counterclockwise about 1 gives 1 + (2 + i)i = 2i.',
    how: [
      'Turn the words into arrows: subtract to get the arrow, multiply to turn it, and add back to get the point.',
      'Read each modulus as a distance and name the shape it draws.',
      'For an equation with a power, first move the center to 0 to see the regular polygon.',
      'For areas, use the cross product |ps − qr| for arrows (p, q) and (r, s), or cut the shape into triangles from its center.',
      'For a sum like 1 + 2ω + 3ω<sup>2</sup> + ⋯, multiply by ω and subtract, which cancels almost everything.',
    ],
    facts: [
      'The parallelogram with sides (p, q) and (r, s) has area |ps − qr|.',
      'If |z − a| + |z − b| = |a − b|, then z is on the segment from a to b.',
      '|z − a| = k|z − b| is a circle of radius k|a − b|/|k<sup>2</sup> − 1|.',
      'w + k/w on |w| = r is an ellipse with semi-axes r + k/r and r − k/r.',
      'For an equilateral triangle with center g, ab + bc + ca = 3g<sup>2</sup>.',
    ],
    watch: [
      'Turning about the origin when the turn is about another point.',
      'Using the foot of the perpendicular when it falls outside the segment: then the nearest point is an end.',
      'Dropping the center from the final answer, or counting it when only distances matter.',
      'Forgetting to square the radius for the area of the circle.',
    ],
    tip: 'Draw the points, read each modulus as a distance, and treat each difference of complex numbers as an arrow you can turn.',
  },
};
