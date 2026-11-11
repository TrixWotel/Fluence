// Learning Investigations and Data: the seven topics in five units, from planning a fair test to explaining results,
// each with a short lesson (the idea, how to answer, facts worth knowing, the usual mistakes) and a tip shown after a
// wrong answer. A topic is learned after 4 right in a row. No worked example: most questions have no working to show.
const lessons = {
  'Variables and fair tests': {
    idea: '<p>An investigation tests how changing one thing affects another. The <b>independent variable</b> is what you change on purpose, the <b>dependent variable</b> is what you measure, and the <b>controlled variables</b> are everything else you keep the same. Changing only one thing at a time makes it a <b>fair test</b>: if the result changes, only the independent variable can have caused it.</p><p>A <b>hypothesis</b> is a testable prediction with a reason: “If a cup is wrapped in thicker wool, then its water will cool more slowly, because wool traps air, which conducts heat poorly.” A <b>control</b> is a setup without the change (an unwrapped cup, a plant with no fertilizer), so you can see whether the change made a difference.</p>',
    how: ['Find what is changed on purpose: that’s the independent variable.', 'Find what is measured or observed: that’s the dependent variable.', 'Everything else that could affect the result is a controlled variable, kept the same.', 'Check that only one thing differs between the setups: then it’s a fair test.'],
    facts: ['Independent: what you change. Dependent: what you measure. Controlled: what you keep the same.', 'Hypothesis: “If … (the change), then … (the result), because … (the reason).”', 'A control is a setup without the change, kept for comparison.', 'Other names: the manipulated variable (independent) and the responding variable (dependent).'],
    watch: ['Swapping the two: the dependent variable depends on the change, so it’s the one you measure.', 'Changing two things at once: then you can’t tell which one caused the result.', 'Mixing up a control with controlled variables: a control is a whole setup for comparison, while controlled variables are the things kept the same in every setup.'],
    tip: 'Ask what was changed on purpose (independent) and what was measured (dependent); everything else should stay the same.',
  },
  'Choosing and drawing graphs': {
    idea: '<p>Choose the graph to fit the data. A <b>line graph</b> shows how something changes, often over time, like a cooling curve. A <b>bar graph</b> compares separate categories, like four materials. A <b>scatter plot</b> shows whether two measured variables are related, like leaf length and width. A <b>pie chart</b> shows the parts of a whole, and a <b>histogram</b> shows how many values fall in each range.</p><p>Put the independent variable on the <b>x-axis</b> and the dependent variable on the <b>y-axis</b>. Give the graph a title, label each axis (with the unit of any numbers on it), and pick even scales that spread the points over most of the grid. Plot each point carefully, draw one smooth <b>line or curve of best fit</b> instead of joining dot to dot, and add a <b>key</b> when there’s more than one line.</p>',
    how: ['Decide what the data are: categories (bar graph), numbers that change smoothly (line graph), two measurements of the same things (scatter plot), parts of a whole (pie chart) or counts in ranges (histogram).', 'Put what was changed on the x-axis and what was measured on the y-axis.', 'Give each axis of numbers an even scale that spreads the points over most of the grid, and label it with its unit.', 'Plot each point, then draw a smooth line or curve of best fit through the middle of them.'],
    facts: ['Line graph: change, often over time. Bar graph: categories.', 'Scatter plot: are two measured variables related?', 'Pie chart: parts of a whole. Histogram: how many fall in each range, with the bars touching.', 'x-axis: independent. y-axis: dependent.', 'An axis label names the variable and its unit, like Temperature (°C).'],
    watch: ['Joining scattered points dot to dot: draw one smooth line or curve of best fit through the middle instead.', 'Uneven scales like 0, 10, 20, 50: every step must stand for the same amount.', 'Swapping the axes: what was changed goes across, and what was measured goes up.'],
    tip: 'Match the graph to the data: categories get bars, numbers that change smoothly get a line, and two measured things get a scatter plot.',
  },
  'Reading graphs and trends': {
    idea: '<p>To describe a <b>trend</b>, say what the line does (rises, falls or levels off) and back it up with numbers read from the graph: “The temperature fell from 80 °C to 50 °C in the first 10 minutes, then leveled off near 20 °C.” The <b>slope</b> is a rate: a steeper line means a faster change, and a flat line means no change. Between two points, rate = change in y ÷ change in x, like °C per minute.</p><p>Reading a value between measured points is <b>interpolation</b>, which is fairly reliable; extending the line beyond them is <b>extrapolation</b>, which is less reliable, because the pattern may change. On a scatter plot, points rising from left to right show a <b>positive correlation</b>, points falling show a <b>negative correlation</b>, and no pattern means no correlation. A correlation alone doesn’t prove that one thing causes the other, and a point far from the pattern is <b>anomalous</b>.</p>',
    how: ['Say what happens (rises, falls, levels off) and where the pattern changes.', 'Quote values from the graph, with units, to back it up.', 'For a rate, divide the change in the y value by the change in the x value between two points.', 'To read a value, go up from the x-axis to the line, then across to the y-axis.'],
    facts: ['Steeper line: faster change. Flat line: no change.', 'Rate = change in y ÷ change in x, like °C per minute.', 'Interpolation: inside the measured range. Extrapolation: beyond it, and less reliable.', 'Positive: both rise together. Negative: one falls as the other rises.', 'Correlation is not causation.'],
    watch: ['Confusing high with steep: a line can be high on the graph but flat, which means no change.', 'Trusting extrapolation as much as interpolation: beyond your data, the pattern may change.', 'Saying one thing causes another just because they’re correlated: something else may cause both.'],
    tip: 'Look at the steepness, not the height: steeper means faster, and flat means no change.',
  },
  'Averages, errors and reliability': {
    idea: '<p>Doing <b>repeat trials</b> lets you check your results. The <b>mean</b> is the sum of the results ÷ the number of results, and the <b>range</b> (largest − smallest) shows how spread out they are. A result far from the others is <b>anomalous</b>: give a likely reason, leave it out of the mean, and repeat that trial if you can.</p><p><b>Accurate</b> means close to the true value; <b>precise</b> means the repeats are close to each other. <b>Random errors</b> (reaction time, reading a scale that won’t keep still) vary each time, and repeating and averaging reduce them. <b>Systematic errors</b> (a balance that isn’t zeroed, parallax always from one side) shift every reading the same way, and repeating doesn’t fix them: fix the instrument or the method instead. Results are <b>reliable</b> when repeats agree, and a test is <b>valid</b> when it’s fair and measures what it set out to.</p>',
    how: ['Look for any result far from the others, and leave it out (saying why).', 'Mean: add up the results and divide by how many you added.', 'Range: the largest minus the smallest.', 'For an error, ask whether it changes each time (random) or is the same each time (systematic).'],
    facts: ['Mean = sum ÷ number of results.', 'Range = largest − smallest; a smaller range means more precise.', 'Accurate: close to the true value. Precise: close to each other.', 'Random errors: reduced by repeating. Systematic errors: not.', 'Timing 10 swings and dividing by 10 cuts the effect of reaction time.'],
    watch: ['Including an anomalous result in the mean: it drags the mean away from the true value.', 'Dividing by the wrong number: count only the results you added up.', 'Thinking precise means accurate: readings can agree closely and all be wrong by the same amount.'],
    tip: 'Leave out any result far from the rest, then add up the others and divide by how many you added.',
  },
  'Testing materials': {
    idea: '<p>Materials are chosen for their <b>properties</b>: <b>strength</b> (the force it takes before breaking), <b>hardness</b> (resisting scratches), <b>flexibility</b> (bending without breaking), <b>elasticity</b> (springing back to shape), <b>brittleness</b> (snapping instead of bending), <b>density</b>, how well heat and electricity pass through it (<b>conductivity</b>), whether it’s waterproof, and how <b>durable</b> it is.</p><p>Each property has a fair test, with samples of the same size. Insulation: the same volume of hot water in identical cups wrapped in equal thicknesses of each material, with the temperature read every minute; the smallest drop shows the best insulator. Hardness: a harder material scratches a softer one. Strength: add masses until a strip breaks. Flexibility: see how far strips bend under the same load. No material is best at everything, so choosing one means weighing <b>trade-offs</b> such as cost, weight, safety and the environment.</p>',
    how: ['Name the property the job needs (a pan handle: a poor conductor of heat; a wire: a good conductor of electricity).', 'For a test, keep the size and shape of every sample the same and change only the material.', 'Decide what to measure: the mass that breaks it, how far it bends, or the temperature drop.', 'Weigh up the trade-offs: cost, weight, safety and the environment.'],
    facts: ['Hard: resists scratching. Strong: takes a big force before breaking.', 'Flexible: bends easily. Elastic: springs back to its shape.', 'Brittle: snaps or shatters, like glass or pottery.', 'Metals conduct heat and electricity well; plastic, wood, rubber and air don’t.', 'Best insulator: the smallest temperature drop in the same time.'],
    watch: ['Mixing up hard and strong: glass is hard but brittle, and rope is strong but not hard.', 'Mixing up flexible and elastic: a flexible strip may stay bent, but an elastic one springs back.', 'Picking the cup that cooled most as the best insulator: the best one lets the least heat out.'],
    tip: 'Name the property the job needs first, then pick the material, or the test, that shows it best.',
  },
  'Insulation and design': {
    idea: '<p>Heat moves by <b>conduction</b> (particle to particle), <b>convection</b> (warm liquid or gas rising) and <b>radiation</b> (infrared waves, even through empty space). Insulators slow it down, and most work by <b>trapping air</b>, which conducts heat poorly and can’t flow when it’s held in tiny pockets: wool, foam, fur, feathers, attic insulation and the gas in double glazing. Blubber works because fat is a poor conductor.</p><p>A <b>vacuum flask</b> cuts all three: the vacuum stops conduction and convection, the silvered walls reflect radiation, and the stopper stops convection and evaporation. Engineers design things like this with the <b>engineering design process</b>: define the problem, research, brainstorm, choose a plan, build a <b>prototype</b>, test, evaluate, improve and test again. A design must meet its <b>criteria</b> (what it must do) within its <b>constraints</b> (limits like cost, time and materials).</p>',
    how: ['Name which ways heat is moving: conduction, convection or radiation.', 'Match each feature to what it stops: trapped air and vacuums cut conduction and convection, shiny surfaces reflect radiation, and lids stop convection and evaporation.', 'For a design question, sort what the design must do (criteria) from the limits on it (constraints).', 'Remember that the design process loops: test, evaluate, improve, test again.'],
    facts: ['Vacuum: stops conduction and convection. Silvered walls: reflect radiation. Stopper: stops convection and evaporation.', 'Trapped air is a poor conductor that can’t flow, so it insulates.', 'Only radiation can cross a vacuum.', 'Criteria: what it must do. Constraints: limits such as cost, time and materials.', 'Design process: define, research, brainstorm, plan, prototype, test, evaluate, improve.'],
    watch: ['Saying the silver walls stop conduction: they reflect radiation, and the vacuum stops conduction and convection.', 'Saying insulation keeps the cold in: heat flows in from outside, and the insulation slows it.', 'Mixing up criteria and constraints: a budget is a constraint, and keeping water hot for an hour is a criterion.'],
    tip: 'For each feature, ask which kind of heat transfer it stops: conduction, convection or radiation.',
  },
  'Claims, evidence and reasoning': {
    idea: '<p>Explaining results has three parts. The <b>claim</b> answers the question (“Wool is the best insulator of the three”). The <b>evidence</b> is the data that support it (“its cup cooled only 12 °C in 10 minutes, the foil cup 25 °C”). The <b>reasoning</b> is the science that links them (“wool traps air, which conducts heat poorly”). A <b>conclusion</b> uses the data and says whether the hypothesis was supported.</p><p>An <b>observation</b> is what you see or measure; an <b>inference</b> is what you work out from it. To evaluate a method, name the sources of error and suggest improvements, like more repeats. A lab report runs: title, question or aim, hypothesis, materials, procedure, data, analysis, conclusion. Present every result honestly, including the ones that don’t fit.</p>',
    how: ['Claim: answer the question in one sentence.', 'Evidence: quote numbers from the data, with units.', 'Reasoning: give the science idea that explains why the evidence supports the claim.', 'Say whether the hypothesis was supported, then how the method could be improved.'],
    facts: ['Claim: the answer. Evidence: the data. Reasoning: the science that links them.', 'Observation: seen or measured. Inference: an explanation of it.', 'Lab report: title, question or aim, hypothesis, materials, procedure, data, analysis, conclusion.', 'A hypothesis is supported or not supported, never proved by one test.'],
    watch: ['Giving evidence without numbers: quote the actual data.', 'Repeating the claim as the reasoning: reasoning needs a science idea.', 'Hiding results that don’t fit: show them all, and explain any you left out of a mean.'],
    tip: 'The claim answers the question, the evidence is the numbers, and the reasoning is the science that connects them.',
  },
};
const UNITS = [
  ['Planning', ['Variables and fair tests']],
  ['Graphs', ['Choosing and drawing graphs', 'Reading graphs and trends']],
  ['Data you can trust', ['Averages, errors and reliability']],
  ['Materials and design', ['Testing materials', 'Insulation and design']],
  ['Explaining results', ['Claims, evidence and reasoning']],
];
export const labsLearning = { goal: 4, example: false, path: UNITS.map(([unit, topics]) => ({ unit, topics })), lessons };

// the panel beside the set's page: the three kinds of variable (from one insulation test), the graph for each kind of
// data, the mean and the range, and accuracy against precision
export function labsAside() {
  const box = document.createElement('div');
  box.className = 'cols';
  box.innerHTML = `<div>
      <table class="data words"><thead><tr><th>Variable</th><th>What it is</th><th>In an insulation test</th></tr></thead><tbody>
        <tr><td>Independent</td><td>What you change on purpose</td><td>The material wrapped around each cup</td></tr>
        <tr><td>Dependent</td><td>What you measure</td><td>The temperature drop in 10 minutes</td></tr>
        <tr><td>Controlled</td><td>What you keep the same, so the test is fair</td><td>The cups, the volume and starting temperature of the water, and the thickness of each wrapping</td></tr>
      </tbody></table>
      <ul>
        <li><span class="f">Mean = sum ÷ number of trials</span>, leaving out any anomalous result.</li>
        <li><span class="f">Range = largest − smallest</span></li>
        <li><b>Accurate</b>: close to the true value.</li>
        <li><b>Precise</b>: repeats close to each other (a small range).</li>
      </ul>
    </div>
    <div>
      <table class="data words"><thead><tr><th>Graph</th><th>Use it for</th></tr></thead><tbody>
        <tr><td>Line graph</td><td>Change over time, or two variables that change smoothly</td></tr>
        <tr><td>Bar graph</td><td>Comparing separate categories</td></tr>
        <tr><td>Scatter plot</td><td>Whether two measured variables are related</td></tr>
        <tr><td>Pie chart</td><td>The parts of a whole</td></tr>
        <tr><td>Histogram</td><td>How many values fall in each range</td></tr>
      </tbody></table>
      <ul><li>Independent variable on the x-axis, dependent on the y-axis.</li></ul>
    </div>`;
  return box;
}
