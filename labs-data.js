// Investigations and Data: the lab skills behind every science topic, in seven topics, from planning a fair test and
// choosing the right graph to trusting your numbers, testing materials, designing with insulation and explaining results
// with a claim, evidence and reasoning. Each topic has its facts to choose from, words to type, true or false, pairs to
// match, a sort, choose-all-that-fit and (where there's a real sequence) steps to put in order; reading graphs and
// averaging repeat trials also have numbers to work out.
import { num, round } from '../kit/bank.js';

// ---------- for the worked numbers ----------
const and = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);
const tenth = (t) => (t / 10).toFixed(1);   // readings are kept in tenths, so they print exactly: 152 → “15.2”
const two = (x) => round(x, 2).toFixed(2);   // an answer to 2 decimal places, zeros kept: “15.40”
// repeat readings for the averages: what was measured (in the question's words), its unit, the range its readings fall
// in and how far one repeat wanders from the next (both in tenths of the unit)
const READINGS = [
  { what: 'the time for 10 swings of the same pendulum', unit: 's', lo: 120, hi: 200, wander: 4 },
  { what: 'the stretch of a spring with 300 g hung on it', unit: 'cm', lo: 45, hi: 90, wander: 2 },
  { what: 'the time for a cup of hot water to cool by 10 °C', unit: 'min', lo: 40, hi: 90, wander: 3 },
  { what: 'the temperature rise of 100 g of water heated for 2 minutes', unit: '°C', lo: 80, hi: 200, wander: 5 },
  { what: 'the time for an ice cube to melt on a metal tray', unit: 'min', lo: 30, hi: 70, wander: 3 },
  { what: 'how far a plastic strip bends under a 200 g load', unit: 'mm', lo: 120, hi: 300, wander: 6 },
];
// n readings (in tenths) close to one value. Four readings are kept to an even total, so their mean never ends in an
// exact half, where rounding to 2 decimal places could go either way.
const near = (d, base, wander, n) => {
  const xs = Array.from({ length: n }, () => base + d.int(-wander, wander));
  if (n === 4 && xs.reduce((a, b) => a + b, 0) % 2) xs[3] += 1;
  return xs;
};
// a mean of readings in tenths, with “=” when it comes out exactly at 2 decimal places and “≈” when it's rounded
const meanOf = (xs) => {
  const sum = xs.reduce((a, b) => a + b, 0);
  return { sum, mean: sum / (10 * xs.length), sign: (10 * sum) % xs.length === 0 ? '=' : '≈' };
};

export const TOPICS = [
  {
    name: 'Variables and fair tests',
    facts: [
      ['What is the independent variable in an experiment?', 'The one thing you change on purpose', ['The thing you measure each time', 'A thing you keep the same throughout', 'The result you expect to get', 'Something that changes by itself'], 'You choose the independent variable and change it yourself; the dependent variable is what you measure, and the controlled variables stay the same.'],
      ['What is the dependent variable in an experiment?', 'What you measure to see the effect', ['What you change on purpose', 'What you keep the same each time', 'The setup left without the change', 'The reason behind your prediction'], 'The dependent variable depends on the one you change: it’s the result you measure or observe.'],
      ['A test checks whether the length of a pendulum changes how long one swing takes. What is the independent variable?', 'The length of the string', ['The time for one swing', 'The mass of the bob', 'The angle it’s let go from', 'The number of swings timed'], 'The length is what’s changed on purpose; the time for a swing is what’s measured, and the bob and the angle stay the same.'],
      ['Why are the controlled variables kept the same?', 'So only the independent variable can change the result', ['So the test takes less time to carry out', 'So the results are sure to fit the hypothesis', 'So the dependent variable stays the same too', 'So two things can be changed at once'], 'If anything else changed too, you couldn’t tell which change caused the result. Keeping everything else the same makes it a fair test.'],
      ['What is a control in an experiment?', 'A setup without the change, to compare with', ['The variable you change on purpose', 'A variable kept the same in every trial', 'The trial with the largest result', 'A trial you repeat when it looks odd'], 'A control shows what happens without the change being tested, so you can see whether the change made any difference.'],
      ['Which of these is a hypothesis?', 'If more mass is hung on a spring, then it will stretch further, because the pull on it is bigger', ['Springs are interesting to test, because they all stretch in their own different ways', 'Does hanging more and more mass on a spring make it stretch further than it did before?', 'A spring is a coil of metal wire that stretches when pulled and then springs back again', 'Some springs will stretch a long way, and some will hardly stretch at all when pulled'], 'A hypothesis is a testable prediction with a reason: it says what will happen to the dependent variable when you change the independent one, and why.'],
      ['Plants get 10, 20, 30 or 40 mL of water a day, and their heights are measured after two weeks. What is the dependent variable?', 'The height of each plant', ['The amount of water each day', 'The kind of plant used', 'The two weeks it lasts', 'The light each plant gets'], 'The height is what’s measured at the end; the water is what’s changed on purpose.'],
      ['Why should only one variable be changed at a time?', 'So you know which change caused the result', ['So the test needs less equipment', 'So the results match the prediction', 'So only one thing has to be measured', 'So the test can be finished sooner'], 'If two things change at once, either one could have caused the difference, so you can’t tell which did.'],
      ['Masses are hung on a spring one at a time, and the stretch is measured each time. Which is a controlled variable?', 'The spring itself', ['The mass hung on it', 'How far it stretches', 'The pull of the masses on it', 'Its new, stretched length'], 'The mass is changed and the stretch is measured; the spring must stay the same, or a stiffer spring could explain a smaller stretch.'],
      ['Cups of hot water are wrapped in wool, cotton or newspaper, and one is left unwrapped. Why is one left unwrapped?', 'To show what happens with no insulation', ['To give one cup hotter water than the rest', 'To measure the room’s temperature instead', 'To make the dependent variable easier to see', 'To use up the hot water that was left over'], 'The unwrapped cup is the control: comparing with it shows how much each wrapping slowed the cooling.'],
      ['Equal masses of water and cooking oil are heated on the same hot plate setting for 5 minutes, and the temperature rise of each is measured. What is the dependent variable?', 'The temperature rise of each liquid', ['The kind of liquid that is heated', 'The mass of each of the liquids', 'The 5 minutes of heating time', 'The setting of the hot plate'], 'The rise is what’s measured; the liquid is what’s changed, and the mass, time and heater are kept the same. Oil, with its lower specific heat, warms more.'],
      ['A test asks whether the thickness of a wool wrapping changes how fast a cup of hot water cools. Which is a controlled variable?', 'The water’s starting temperature', ['The thickness of the wool', 'How fast the water cools', 'The temperature after 10 minutes', 'How many layers of wool are used'], 'The thickness is changed and the cooling is measured. Every cup must start at the same temperature, since hotter water cools faster.'],
      ['Cups of hot water are wrapped in wool, foil or paper, and their temperature is read every minute. What is the independent variable?', 'The material around each cup', ['The temperature of the water', 'The time between the readings', 'The volume of water in each cup', 'The size of the cups used'], 'The wrapping is what’s changed on purpose; the temperature is what’s measured, and the water and the cups are kept the same.'],
      ['In “If…, then…, because…”, what does the “because” part give?', 'The science reason you expect that result', ['The result you measured in the test', 'The list of equipment you will need', 'The variable you will keep the same', 'The number of trials you will do'], 'The “if” part is the change, the “then” part is the result you predict, and the “because” part is the scientific reason for it.'],
      ['Which is another name for the independent variable?', 'The manipulated variable', ['The responding variable', 'The controlled variable', 'The measured variable', 'The constant variable'], 'You manipulate (change) the independent variable; the dependent variable is also called the responding variable, because it responds to the change.'],
      ['To test a fertilizer, one plant gets fertilizer and sits by a sunny window; another gets none and sits in a dark corner. What’s wrong with this test?', 'Two things differ, so it isn’t a fair test', ['The plant with no fertilizer isn’t needed', 'Only one kind of plant has been used', 'The plants should get different amounts of water', 'Each plant should be measured on a different day'], 'The plants differ in fertilizer and in light, so if one grows more, you can’t tell which difference caused it.'],
    ],
    typed: [
      ['What do you call the variable you change on purpose?', ['independent variable', 'independent', 'the independent variable', 'manipulated variable', 'manipulated', 'the manipulated variable', 'iv'], 'The independent (or manipulated) variable is the one you choose and change; the others are measured or kept the same.'],
      ['What do you call the variable you measure to see the effect?', ['dependent variable', 'dependent', 'the dependent variable', 'responding variable', 'responding', 'the responding variable', 'dv'], 'The dependent (or responding) variable depends on the change you make.'],
      ['A cup of water is timed while it cools, starting from a different temperature each time. Is the starting temperature the independent, dependent or controlled variable?', ['independent', 'independent variable', 'the independent variable', 'manipulated', 'manipulated variable', 'the manipulated variable'], 'The starting temperature is what’s changed on purpose, and the cooling time is what’s measured.'],
      ['What do you call the variables kept the same to make a test fair?', ['controlled variables', 'controlled variable', 'controlled', 'the controlled variables', 'control variables', 'control variable', 'constants', 'constant', 'constant variables', 'fixed variables'], 'Controlled variables (also called constants) are everything that could affect the result but is kept the same.'],
      ['What is a testable prediction, often written “If…, then…, because…”, called?', ['hypothesis', 'a hypothesis', 'the hypothesis', 'hypotheses'], 'A hypothesis predicts what will happen and gives a reason, and an experiment can test it.'],
      ['Masses of 100 g, 200 g and 300 g are hung on a spring, and its stretch is measured. Is the stretch the independent, dependent or controlled variable?', ['dependent', 'dependent variable', 'the dependent variable', 'responding', 'responding variable', 'the responding variable'], 'The stretch is what’s measured, so it depends on the mass, which is the independent variable.'],
      ['What is a test called in which only one variable is changed and everything else is kept the same?', ['fair test', 'a fair test', 'fair', 'controlled experiment', 'a controlled experiment', 'controlled test', 'a controlled test'], 'In a fair test, only the independent variable changes, so it alone can explain any change in the result.'],
      ['What is the setup without the change called, which the others are compared with?', ['control', 'a control', 'the control', 'control group', 'a control group', 'the control group', 'control setup', 'control experiment', 'control condition'], 'A control, like an unwrapped cup or a plant with no fertilizer, shows what happens without the change.'],
    ],
    tf: [
      ['The dependent variable is the one you change on purpose.', false, 'That’s the independent variable. The dependent variable is the one you measure.'],
      ['In a fair test, only the independent variable is changed.', true, 'Everything else is kept the same, so any change in the result can only come from the independent variable.'],
      ['Changing two variables at once is a quick way to find the effect of each.', false, 'If two things change at once, you can’t tell which one caused the result, so change one at a time.'],
      ['A good hypothesis says what you expect to happen and why.', true, 'It predicts how the dependent variable will change when you change the independent one, and gives a scientific reason.'],
      ['A hypothesis has to turn out right for the experiment to be useful.', false, 'Results that don’t support a hypothesis still teach you something, and they point to a new idea to test.'],
      ['In a pendulum test where the string length is changed, the mass of the bob should stay the same.', true, 'The length is the independent variable, so the bob’s mass is a controlled variable: changing it too would make the test unfair.'],
      ['A control is a setup that doesn’t get the change being tested.', true, 'It gives you something to compare with, so you can see whether the change made a difference.'],
      ['In a test of how mass affects a spring’s stretch, the stretch is the independent variable.', false, 'The stretch is measured, so it’s the dependent variable; the mass is the independent variable.'],
      ['An experiment has only one controlled variable.', false, 'There are usually many: everything other than the independent variable that could affect the result is kept the same.'],
      ['The dependent variable is named that because it depends on the independent variable.', true, 'Its value responds to the change you make, which is why it’s also called the responding variable.'],
      ['An insulation test is still fair if each cup holds a different volume of hot water.', false, 'More water cools more slowly, so the volume is a controlled variable: every cup needs the same amount.'],
      ['The independent variable is also called the manipulated variable.', true, 'You manipulate (change) it on purpose; the dependent variable is also called the responding variable.'],
    ],
    pairs: [
      ['Independent variable', 'What you change on purpose'],
      ['Dependent variable', 'What you measure to see the effect'],
      ['Controlled variable', 'Something kept the same in every trial'],
      ['Control', 'A setup without the change, for comparison'],
      ['Hypothesis', 'A testable prediction with a reason'],
      ['Fair test', 'A test where only one variable is changed'],
      ['Trial', 'One run of an experiment'],
      ['Variable', 'Anything that can change in an experiment'],
      ['Testable question', 'A question an experiment can answer'],
      ['Data', 'The measurements and observations recorded'],
    ],
    sort: { title: 'A test checks how fertilizer affects how tall plants grow. Which of these keep it fair, and which make it unfair?', left: 'Keeps it fair', right: 'Makes it unfair',
      items: [
        ['The same kind of plant in every pot', 'l'], ['The same amount of water each day', 'l'], ['Pots of the same size', 'l'],
        ['The same soil in every pot', 'l'], ['The same amount of light for each', 'l'], ['Measuring them all on the same day', 'l'],
        ['A bigger pot for one of the plants', 'r'], ['Extra water for some of the plants', 'r'], ['One plant kept in a dark cupboard', 'r'],
        ['Different kinds of seeds in some pots', 'r'], ['Measuring some plants a week later', 'r'], ['Sandy soil in some pots, compost in others', 'r'],
      ] },
    multi: [
      ['A test checks whether the length of a pendulum changes the time of a swing. Which should be kept the same?', ['The mass of the bob', 'The angle it’s let go from', 'The number of swings timed'], ['The length of the string', 'The time for each swing'], 'Only the length is changed on purpose, and the swing time is what’s measured; everything else that could affect the result stays the same.'],
      ['Equal masses of water and oil are heated for 5 minutes on the same hot plate setting, and the temperature rise of each is measured. Which are controlled variables?', ['The mass of each liquid', 'The heating time', 'The hot plate setting'], ['The kind of liquid', 'The temperature rise'], 'The liquid is changed and the rise is measured; the mass, time and heater are kept the same so the test is fair.'],
      ['Which does a hypothesis written as “If…, then…, because…” include?', ['The change you will make', 'What you expect to happen', 'A science reason for it'], ['The results you measured', 'The list of equipment'], 'The “if” is the change, the “then” is the prediction, and the “because” is the reason; results and equipment come later in a report.'],
      ['Plants are grown with 0, 5 or 10 g of fertilizer to see how tall they grow. Which statements are right?', ['The fertilizer is the independent variable', 'The plant with 0 g is the control'], ['The height is the independent variable', 'The fertilizer is the dependent variable', 'Each pot can get a different amount of water'], 'The fertilizer is changed on purpose and the height is measured; the 0 g plant shows what happens without any fertilizer.'],
    ],
    order: [
      ['Put these steps of an investigation in order.', ['Ask a question', 'Do background research', 'Write a hypothesis', 'Test it with an experiment', 'Analyze the results', 'Draw a conclusion'], 'An investigation starts with a question and some research, then a hypothesis to test; the results are analyzed before the conclusion says whether the hypothesis was supported.'],
      ['Put the steps of one pendulum trial in order.', ['Set the string to the chosen length', 'Pull the bob back to the starting angle', 'Let go and start the stopwatch', 'Stop the stopwatch after 10 swings', 'Divide the time by 10'], 'The length is set first, then the bob is let go from the same angle each time; timing 10 swings and dividing by 10 gives the time for one swing more accurately than timing a single swing.'],
    ],
  },

  {
    name: 'Choosing and drawing graphs',
    facts: [
      ['Which graph is best for showing how the temperature of a cup of hot water changes over 20 minutes?', 'Line graph', ['Bar graph', 'Pie chart', 'Histogram', 'Pictograph'], 'Time and temperature are both numbers that change smoothly, and a line graph shows how something changes over time.'],
      ['Cups wrapped in four different materials cooled by different amounts in 10 minutes. Which graph shows this best?', 'Bar graph', ['Line graph', 'Pie chart', 'Histogram', 'Scatter plot'], 'The materials are separate categories, not numbers on a scale, so each gets its own bar.'],
      ['Leaf length and leaf width were measured for 40 leaves. Which graph shows best whether the two are related?', 'Scatter plot', ['Line graph', 'Bar graph', 'Pie chart', 'Histogram'], 'A scatter plot gives each leaf one point, and the pattern of the points shows whether longer leaves tend to be wider.'],
      ['Which kind of graph is made for showing the parts of a whole, like the share of each gas in air?', 'Pie chart', ['Line graph', 'Scatter plot', 'Histogram', 'Pictograph'], 'A pie chart’s slices together make the whole circle, so each slice shows that part’s share of the total.'],
      ['Which graph shows how many seedlings fall in each height range, like 0–4 cm, 5–9 cm and 10–14 cm?', 'Histogram', ['Line graph', 'Pie chart', 'Scatter plot', 'Pictograph'], 'A histogram has a bar for each range of values, and the height of the bar shows how many values fall in that range.'],
      ['On a graph of an experiment’s results, which variable goes on the x-axis?', 'The independent variable', ['The dependent variable', 'A controlled variable', 'The one with the biggest numbers', 'The one measured last'], 'The x-axis (across) shows what you changed; the y-axis (up) shows what you measured.'],
      ['Scattered points show a clear upward trend. How should the line be drawn?', 'One line of best fit through the middle of the points', ['A line joining each point to the next one', 'A line from the first point to the last one', 'A line through the highest and lowest points', 'A line that starts at zero on both axes'], 'A line of best fit shows the trend, with about as many points above it as below; joining dot to dot only traces the scatter.'],
      ['What makes the scale on an axis even?', 'Each grid square stands for the same amount', ['Each data value gets its own grid line', 'Every number on it is an even number', 'Both axes go up to the same number', 'It starts at zero and ends at 100'], 'An even scale goes up in equal steps, like 0, 5, 10, 15, so equal distances on the graph mean equal amounts.'],
      ['Why should an axis label include units, like “Temperature (°C)”?', 'So readers know what the numbers measure', ['So the scale can start at zero', 'So the points fall on a straight line', 'So the graph needs no title', 'So the graph is quicker to draw'], 'A reading of 40 could be in °C or °F, seconds or minutes; the unit says exactly what each number means.'],
      ['Two cups’ cooling curves are drawn on the same axes. What does the graph need so you can tell them apart?', 'A key showing which line is which', ['A second x-axis for the other cup', 'Two different scales on the y-axis', 'A thicker grid behind the lines', 'Points plotted for only one cup'], 'A key (legend) shows which color or symbol belongs to each line, so the lines can share one pair of axes.'],
      ['A table gives 62 °C at 4 minutes, with time on the x-axis. Where is that point plotted?', 'Above 4 on the x-axis, level with 62 on the y-axis', ['Above 62 on the x-axis, level with 4 on the y-axis', 'Halfway between 4 and 62 on the y-axis', 'On the x-axis at 4, with a bar up to 62', 'Level with 4 on the y-axis, anywhere along it'], 'The x value says how far across to go and the y value how far up, so the point sits where the two meet.'],
      ['When choosing a scale, how much of the grid should the points spread over?', 'Most of the grid, in both directions', ['A small corner near the origin', 'Only the left half of the grid', 'Just a strip along the bottom', 'As little as possible, to save room'], 'Spread over most of the grid, points are easier to plot and read; squashed into a corner, small differences disappear.'],
      ['What should a graph’s title tell you?', 'What the graph shows', ['The largest value plotted', 'Which equipment was used', 'The unit of the y-axis only', 'How many trials were done'], 'A title says what the graph is about, often the dependent variable against the independent one, as in “Temperature against time.”'],
      ['How do the bars of a histogram differ from those of a bar graph?', 'They touch, since the ranges follow on', ['They have gaps, since the ranges are separate', 'They are always drawn sideways', 'They show categories, not numbers', 'They never need a scale on the y-axis'], 'A histogram’s bars stand for number ranges that follow on with no gaps; a bar graph’s categories are separate, so its bars have gaps.'],
      ['On a graph of a spring’s stretch against the mass hung on it, what goes up the y-axis?', 'The stretch, in cm', ['The mass, in g', 'The time, in s', 'The spring’s starting length', 'The number of masses used'], 'The stretch is measured (dependent), so it goes up the y-axis; the mass is changed (independent), so it goes along the x-axis.'],
      ['What is wrong with a y-axis numbered 0, 10, 20, 50, 100?', 'The steps aren’t equal, so the scale is uneven', ['It doesn’t start at the smallest value on it', 'Its numbers should run down the page instead', 'It should be numbered in ones, not tens', 'It has too few numbers along it to read'], 'Each step must stand for the same amount; jumping from 20 to 50 to 100 squashes the top of the graph and distorts its shape.'],
    ],
    typed: [
      ['Which axis runs across the bottom of a graph and usually shows the independent variable?', ['x-axis', 'x axis', 'x', 'the x-axis', 'the x axis', 'horizontal axis', 'the horizontal axis', 'horizontal'], 'The x-axis runs across (horizontally) and shows what you changed.'],
      ['One straight or curved line drawn through the middle of plotted points, to show their trend, is called a line of…', ['best fit', 'best-fit', 'line of best fit', 'line of best-fit'], 'A line (or curve) of best fit shows the trend, with about as many points above it as below.'],
      ['What part of a graph shows which line or color stands for which set of data?', ['key', 'a key', 'the key', 'legend', 'a legend', 'the legend'], 'A key, also called a legend, matches each line, color or symbol to what it shows.'],
      ['What kind of graph shows how often values fall in each range, with bars that touch?', ['histogram', 'a histogram', 'histograms'], 'A histogram groups number values into ranges and shows how many fall in each.'],
      ['Which axis usually shows the dependent variable?', ['y-axis', 'y axis', 'y', 'the y-axis', 'the y axis', 'vertical axis', 'the vertical axis', 'vertical'], 'The y-axis runs up the side (vertically) and shows what you measured.'],
      ['What kind of graph shows a point for each pair of measured values, to see whether they are related?', ['scatter plot', 'a scatter plot', 'scatterplot', 'scatter graph', 'scattergraph', 'scatter diagram', 'scatter chart', 'scatter', 'scatter-plot', 'scatter plots'], 'A scatter plot shows whether two measured variables are related, and how strongly.'],
      ['What kind of graph uses a circle cut into slices to show the parts of a whole?', ['pie chart', 'a pie chart', 'pie graph', 'pie', 'circle graph', 'a circle graph', 'circle chart', 'pie charts'], 'Each slice of a pie chart is one part’s share of the whole.'],
      ['What kind of graph is best for comparing separate categories, like four different materials?', ['bar graph', 'a bar graph', 'bar chart', 'a bar chart', 'bar', 'bar graphs', 'column graph', 'column chart'], 'A bar graph gives each category its own bar, with gaps between them.'],
    ],
    tf: [
      ['The independent variable goes on the x-axis.', true, 'The x-axis shows what you change, and the y-axis shows what you measure.'],
      ['Scattered points should be joined dot to dot with a ruler.', false, 'Draw one line or smooth curve of best fit through the middle of the points instead: it shows the trend, not the scatter.'],
      ['A bar graph suits results for separate categories, like different materials.', true, 'Each category gets its own bar, with gaps between them, since there’s nothing in between two materials.'],
      ['A histogram’s bars have gaps between them.', false, 'A histogram’s bars touch, because its ranges of values follow on from each other; a bar graph’s bars have gaps.'],
      ['The label on an axis of numbers should include its unit, as in “Time (min).”', true, 'Without the unit, nobody can tell what the numbers on the axis mean.'],
      ['A scale can go up in different-sized steps, as long as every number is written on it.', false, 'The steps must all be equal, or the shape of the graph is distorted.'],
      ['A pie chart is a good way to show how a temperature changes over time.', false, 'A pie chart shows the parts of a whole; change over time needs a line graph.'],
      ['A line of best fit can be a curve.', true, 'If the points follow a curve, like a cooling curve, a smooth curve of best fit is right, not a straight line.'],
      ['A line of best fit has to pass through every point.', false, 'It goes through the middle of the points, with about as many above it as below, and may not touch any of them.'],
      ['A scatter plot is used to see whether two measured variables are related.', true, 'Each point is one pair of measurements, and the pattern of the points shows any relationship.'],
      ['When two or more lines share a graph, a key shows which is which.', true, 'The key matches each line’s color or symbol to what it shows.'],
      ['A good graph uses only a small part of the grid, to leave room for notes.', false, 'A scale that spreads the points over most of the grid makes them easier to plot and read.'],
    ],
    pairs: [
      ['Line graph', 'Shows how something changes, often over time'],
      ['Bar graph', 'Compares separate categories'],
      ['Scatter plot', 'Shows whether two measured variables are related'],
      ['Pie chart', 'Shows the parts of a whole'],
      ['Histogram', 'Shows how many values fall in each range'],
      ['x-axis', 'The axis across, for the independent variable'],
      ['y-axis', 'The axis up the side, for the dependent variable'],
      ['Line of best fit', 'A smooth line through the middle of the points'],
      ['Key', 'Shows which line or color is which'],
      ['Scale', 'The numbers along an axis, in equal steps'],
      ['Title', 'Says what the graph shows'],
      ['Axis label', 'Names the variable and its unit'],
    ],
    sort: { title: 'Which kind of graph would show each set of results best?', left: 'Line graph', right: 'Bar graph',
      items: [
        ['Temperature of hot water, read every minute', 'l'], ['Height of a seedling, measured every day', 'l'], ['Stretch of a spring for masses of 100–500 g', 'l'],
        ['Time of a swing for five pendulum lengths', 'l'], ['Temperature of water as it heats for 10 minutes', 'l'], ['Volume of gas given off every 30 seconds', 'l'],
        ['Temperature drop in cups of four materials', 'r'], ['Boiling points of four different liquids', 'r'], ['Seeds sprouted in sand, clay and compost', 'r'],
        ['Bounce height of four kinds of ball', 'r'], ['Mass each kind of thread held before breaking', 'r'], ['Time for ice to melt on wood, metal and plastic', 'r'],
      ] },
    multi: [
      ['Which does a good line graph of results need?', ['A title', 'Labels on both axes, with units', 'An even scale on each axis'], ['A key, even with only one line', 'The dependent variable on the x-axis'], 'A title, labeled axes with units and even scales make a graph readable; a key is only needed with more than one line, and the dependent variable goes up the y-axis, not across.'],
      ['Which are signs of a badly drawn graph?', ['Scattered points are joined dot to dot', 'The scale goes up in uneven steps', 'An axis has no units'], ['The independent variable is on the x-axis', 'The points spread over most of the grid'], 'Dot-to-dot lines through scattered points, uneven scales and missing units all make a graph misleading or hard to read; the other two are signs of a good one.'],
      ['A table shows the temperature of a wool-wrapped cup and a foil-wrapped cup every minute for 10 minutes. Which are right for its graph?', ['Time goes on the x-axis', 'Both cups can share one pair of axes', 'It needs a key for the two lines'], ['Temperature goes on the x-axis', 'A pie chart would show it best'], 'Time is the independent variable, so it goes across; two lines on one graph make the cups easy to compare, with a key to tell them apart.'],
      ['Which are true of a line of best fit?', ['It can be straight or a smooth curve', 'It shows the overall trend in the data'], ['It must pass through every point', 'It must always start at zero', 'It joins the points in order'], 'A line of best fit follows the trend through the middle of the points; it needn’t touch any of them or pass through zero.'],
    ],
    order: [
      ['Put these steps for drawing a graph from a data table in order.', ['Decide which variable goes on each axis', 'Choose an even scale for each axis', 'Plot each pair of values as a point', 'Draw a line or curve of best fit'], 'You need to know where each variable goes before you can choose the scales, and the scales before you can plot; the line of best fit comes once every point is on.'],
      ['Put these steps for plotting one point in order.', ['Find the x value on the x-axis', 'Move straight up from it', 'Stop level with the y value', 'Mark the point with a small cross'], 'Find the x value along the bottom, go straight up to the height of the y value, and mark the spot where they meet.'],
    ],
  },

  {
    name: 'Reading graphs and trends',
    facts: [
      ['On a graph of temperature against time, what does a steeper part of the line show?', 'The temperature is changing faster', ['The temperature is changing more slowly', 'The temperature is higher there', 'The readings there are less accurate', 'More time passed between readings'], 'The slope is the rate: a steeper line means more degrees of change in each minute.'],
      ['A cooling curve falls steeply at first, then levels off. What is happening?', 'The water cools fast at first, then more and more slowly', ['The water cools slowly at first, then faster and faster', 'The water warms up again after the first few minutes', 'The water cools at the same rate all the way through', 'The thermometer stops working once the line is flat'], 'Hot water loses heat fastest when it is much warmer than the room; as the gap shrinks, it cools more slowly and levels off at room temperature.'],
      ['What is interpolation?', 'Reading a value between the points you measured', ['Reading a value beyond the points you measured', 'Leaving an odd point out of the line', 'Joining each point to the next with a line', 'Working out the slope of a line'], 'Interpolating means reading off the graph inside the range you measured, which is fairly reliable.'],
      ['Why is extrapolation less reliable than interpolation?', 'The pattern may change beyond the measured range', ['The scale is harder to read near the edges', 'Larger numbers always have larger errors', 'There are fewer grid squares at the ends', 'The points there were measured less carefully'], 'Beyond your data you are assuming the pattern carries on; a spring stretched too far, for example, stops following its straight line.'],
      ['What is a positive correlation?', 'As one variable increases, the other tends to increase', ['As one variable increases, the other tends to decrease', 'Both variables stay the same all the way through', 'The points are scattered with no pattern at all', 'One variable is always larger than the other'], 'In a positive correlation the points rise from left to right: larger values of one go with larger values of the other.'],
      ['In one town, the more umbrellas sold on a day, the more car accidents there were. What is the best conclusion?', 'They’re correlated, but rain could cause both', ['Umbrellas make car accidents more likely', 'Car accidents make people buy umbrellas', 'They can’t be linked, so the data are wrong', 'Selling fewer umbrellas would prevent accidents'], 'A third thing, rainy weather, makes both go up. A correlation alone doesn’t show that one thing causes the other.'],
      ['One point on a graph is far from the line that all the others follow. What is it called?', 'An anomalous result', ['An extrapolation', 'An interpolation', 'A correlation', 'A trend line'], 'A point that doesn’t fit the pattern is an anomalous result (an outlier): check it, and leave it out when drawing the line of best fit.'],
      ['On one graph, the line for the water in a foil-wrapped cup falls more steeply than for a wool-wrapped cup. Which is the better insulator?', 'Wool, because its water cooled more slowly', ['Foil, because its water cooled faster', 'Wool, because its line falls more steeply', 'Foil, because its line ends lower down', 'Both the same, since both cups cooled'], 'A gentler slope means a slower temperature drop, so less heat escaped through the wool.'],
      ['What does a flat (horizontal) line on a graph of temperature against time show?', 'The temperature is staying the same', ['The temperature is rising steadily', 'The temperature is falling to zero', 'The heater has just been turned on', 'The readings were taken too quickly'], 'A flat line means no change: the temperature holds steady, as it does once water has cooled to room temperature.'],
      ['On a scatter plot, the points go down from left to right. What does this show?', 'A negative correlation', ['A positive correlation', 'No correlation at all', 'That one causes the other', 'That one point is anomalous'], 'When larger values of one variable go with smaller values of the other, the points fall from left to right.'],
      ['A spring’s graph of stretch against mass is a straight line through the origin. What does that tell you?', 'The stretch is proportional to the mass', ['The stretch is the same for every mass', 'The stretch gets smaller as the mass grows', 'The spring has been stretched too far', 'The masses were added in the wrong order'], 'A straight line through the origin means doubling the mass doubles the stretch: the two are proportional.'],
      ['On a graph of a plant’s height against time, what does the slope show?', 'How fast the plant is growing', ['How tall the plant is at the end', 'How long the experiment lasted', 'How much water the plant was given', 'How many plants were measured'], 'The slope is the change in height ÷ the change in time, the growth rate: a steeper line means faster growth.'],
      ['Which is the best description of a cooling curve’s trend?', 'It fell quickly from 80 °C to 40 °C in 10 minutes, then slowed and leveled off near 20 °C', ['It went down for a while, and then it stayed flat for quite a long while after that', 'It fell, which shows that heat was escaping from the water into the air all the time', 'The line starts high up on the left of the graph and ends up lower down on the right', 'It shows the temperature of the water every single minute from the start to the end'], 'A good description says what the line does (falls quickly, then levels off) and backs it up with values read from the graph, with units.'],
      ['Points on a scatter plot are spread all over, with no pattern. What does this show?', 'No correlation between the two variables', ['A strong positive correlation between them', 'A weak negative correlation between them', 'That one variable causes the other', 'That every one of the points is anomalous'], 'With no upward or downward pattern, knowing one variable tells you nothing about the other.'],
      ['A pendulum’s swing time was measured for lengths from 20 cm to 100 cm. Reading off the time for 60 cm is…', 'Interpolation', ['Extrapolation', 'Correlation', 'Calibration', 'Causation'], '60 cm lies between the lengths that were measured, so reading it off the graph is interpolation, which is fairly reliable.'],
    ],
    typed: [
      ['What is reading a value off a graph between the points you measured called?', ['interpolation', 'interpolating', 'interpolate'], 'Interpolation stays inside the measured range, so it’s fairly reliable.'],
      ['What is extending a graph’s line to estimate a value beyond the measured points called?', ['extrapolation', 'extrapolating', 'extrapolate'], 'Extrapolation assumes the pattern carries on beyond your data, so it’s less reliable.'],
      ['What is the steepness of a line on a graph, which shows how fast something changes, called?', ['slope', 'the slope', 'gradient', 'the gradient'], 'The slope is the change in y ÷ the change in x: the rate of change.'],
      ['When larger values of one variable go with smaller values of the other, what kind of correlation is it?', ['negative', 'negative correlation', 'a negative correlation', 'inverse', 'inverse correlation'], 'In a negative correlation the points fall from left to right.'],
      ['When larger values of one variable go with larger values of the other, what kind of correlation is it?', ['positive', 'positive correlation', 'a positive correlation'], 'In a positive correlation the points rise from left to right.'],
      ['Two things that rise and fall together are correlated, but that doesn’t prove one makes the other happen. Correlation is not…', ['causation', 'cause', 'causality', 'cause and effect'], 'Two things can change together by chance, or because a third thing affects both.'],
      ['What do you say a line does when it stops rising or falling and goes flat?', ['levels off', 'level off', 'leveled off', 'levelled off', 'levels out', 'level out', 'flattens out', 'flatten out', 'flattens off', 'flattens', 'plateaus', 'plateau'], 'A line that levels off shows the change slowing down and stopping, like water cooling to room temperature.'],
    ],
    tf: [
      ['On a graph of temperature against time, a steeper line means the temperature is changing faster.', true, 'Steepness shows the rate: more degrees in each minute.'],
      ['If two variables are correlated, one must cause the other.', false, 'They might change together by chance, or because a third thing affects both; a controlled experiment is needed to show cause.'],
      ['Extrapolation is usually more reliable than interpolation.', false, 'Interpolation stays inside the measured range; extrapolation assumes the pattern carries on beyond it, which it may not.'],
      ['A line that levels off shows a change slowing down and stopping.', true, 'As the line gets flatter, the rate of change falls, until there’s no change at all.'],
      ['In a negative correlation, the points slope down from left to right.', true, 'Larger values of one variable go with smaller values of the other.'],
      ['A curve that rises steeply and then levels off shows a change that speeds up.', false, 'Getting less steep means slowing down: the change is fastest at the start.'],
      ['An anomalous point should be used when drawing the line of best fit.', false, 'Leave an anomalous point out of the line of best fit, but keep it on the graph and try to explain it.'],
      ['Reading the temperature at 4.5 minutes from readings taken every minute for 10 minutes is interpolation.', true, '4.5 minutes lies between two measured times, so it is inside the measured range.'],
      ['A steeper line on a graph of a plant’s height against time means the plant grew faster.', true, 'The slope is the growth rate, so a steeper line means more growth each day.'],
      ['A flat line on a graph of temperature against time means the temperature is zero.', false, 'A flat line means the temperature isn’t changing; it can be steady at any value, like a room temperature of 21 °C.'],
      ['Points scattered with no pattern show a strong correlation.', false, 'No pattern means no correlation: one variable tells you nothing about the other.'],
      ['A straight line through the origin means that doubling one variable doubles the other.', true, 'That is what proportional means, as for the stretch of a spring and the mass hung on it.'],
    ],
    pairs: [
      ['Trend', 'The overall pattern in the data'],
      ['Slope', 'The steepness of a line on a graph'],
      ['Interpolation', 'Reading a value between measured points'],
      ['Extrapolation', 'Estimating a value beyond the measured points'],
      ['Positive correlation', 'One tends to rise as the other rises'],
      ['Negative correlation', 'One tends to fall as the other rises'],
      ['No correlation', 'No pattern between the two variables'],
      ['Anomalous point', 'A point that doesn’t fit the pattern'],
      ['Levels off', 'Stops rising or falling and stays steady'],
      ['Rate', 'How much something changes each minute or second'],
      ['Causation', 'One change actually causing another'],
      ['Proportional', 'Doubling one doubles the other'],
      ['Origin', 'The point where both axes are at zero'],
    ],
    sort: { title: 'As the first thing goes up, does the second tend to go up or down?', left: 'Positive correlation', right: 'Negative correlation',
      items: [
        ['Mass hung on a spring and its stretch', 'l'], ['Length of a pendulum and its swing time', 'l'], ['Time heating a pan of water and its temperature', 'l'],
        ['A heater’s power and how fast water warms', 'l'], ['Water temperature and how much sugar dissolves', 'l'], ['A car’s speed and its stopping distance', 'l'],
        ['Thickness of insulation and the heat lost', 'r'], ['Time and the temperature of cooling water', 'r'], ['Height above sea level and air pressure', 'r'],
        ['Distance from a lamp and the light reaching a plant', 'r'], ['Height above sea level and water’s boiling point', 'r'], ['Distance from a heater and how warm you feel', 'r'],
      ] },
    multi: [
      ['A cooling curve starts at 80 °C, drops quickly, then levels off at 20 °C. Which statements are right?', ['The water cooled fastest at the start', 'The room was probably about 20 °C'], ['The water cooled at a steady rate', 'The water warmed up again at the end', 'The slope got steeper over time'], 'The steep start means fast cooling, and the curve flattens as the water nears room temperature, about 20 °C here.'],
      ['A spring was tested with masses from 100 g to 500 g. Which of these estimates are extrapolation?', ['The stretch for 700 g', 'The stretch for 50 g'], ['The stretch for 250 g', 'The stretch for 420 g', 'The stretch for 150 g'], 'Only 50 g and 700 g are outside the 100–500 g that was measured; the others lie between measured points, so they are interpolation.'],
      ['Which are true about the slope of a line on a graph?', ['A steeper slope means a faster change', 'A flat line means no change', 'A line sloping down means a decrease'], ['A higher line always means a steeper slope', 'The slope is the largest value on the graph'], 'The slope is the rate of change: steep is fast, flat is no change, and downhill is a decrease; how high the line is doesn’t matter.'],
      ['Ice cream sales and sunburn cases rise and fall together through the year. Which statements are right?', ['They show a positive correlation', 'Hot, sunny weather could explain both'], ['Eating ice cream causes sunburn', 'This proves cause and effect', 'They show a negative correlation'], 'They rise together, a positive correlation, but sunny weather drives both; a correlation alone doesn’t prove cause.'],
    ],
    calc: [
      // a rate between two points: the temperature rise in °C per minute
      (d) => {
        const T0 = d.int(16, 24), rate = d.pick([1.5, 2, 2.5, 3, 3.5, 4, 5, 6]), t1 = d.int(1, 4), t2 = t1 + d.pick([2, 3, 4, 5, 6]);
        const T1 = T0 + rate * t1, T2 = T0 + rate * t2;
        return {
          text: `Water in a beaker is heated, and its graph of temperature against time passes through ${num(T1, 1)} °C at ${t1} minute${t1 === 1 ? '' : 's'} and ${num(T2, 1)} °C at ${t2} minutes. What is the average rate of temperature rise between these two points, in °C per minute?`,
          answer: { kind: 'number', value: round(rate, 4), unit: '°C per minute', tol: 0.02 },
          solution: `Rate = change in temperature ÷ change in time = (${num(T2, 1)} − ${num(T1, 1)}) °C ÷ (${t2} − ${t1}) min = ${num(T2 - T1, 1)} °C ÷ ${t2 - t1} min = <b>${num(rate, 2)} °C per minute</b>.`,
        };
      },
      // a value read from a straight line through the origin: a spring's stretch
      (d) => {
        const per = d.pick([1.2, 1.5, 2, 2.4, 2.5, 3, 4]), m1 = d.pick([200, 300, 400, 500]), m2 = d.pick([50, 150, 250, 350, 450]);
        const s1 = (per * m1) / 100, s2 = (per * m2) / 100;
        return {
          text: `A spring was tested with masses from 0 to 500 g, and its graph of stretch against mass is a straight line through the origin. With ${m1} g on it, the stretch is ${num(s1, 2)} cm. What stretch does the line give for ${m2} g, in cm?`,
          answer: { kind: 'number', value: round(s2, 4), unit: 'cm', tol: 0.02 },
          solution: `On a straight line through the origin, the stretch is proportional to the mass. ${m1} g stretches it ${num(s1, 2)} cm, which is ${num(s1, 2)} ÷ ${m1 / 100} = ${num(per, 2)} cm for every 100 g. So ${m2} g stretches it ${num(m2 / 100, 2)} × ${num(per, 2)} = <b>${num(s2, 2)} cm</b>.`,
        };
      },
      // a value read from a straight line that doesn't start at zero: a steady warming
      (d) => {
        const T0 = d.int(15, 25), rate = d.pick([2, 2.5, 3, 4, 5, 6]), tEnd = d.pick([6, 8, 10]), t = d.int(1, tEnd - 1);
        const Tend = T0 + rate * tEnd, T = T0 + rate * t;
        return {
          text: `Water on a hot plate warms steadily: its graph of temperature against time is a straight line from ${T0} °C at 0 minutes to ${num(Tend, 1)} °C at ${tEnd} minutes. What temperature does the line show at ${t} minute${t === 1 ? '' : 's'}, in °C?`,
          answer: { kind: 'number', value: round(T, 4), unit: '°C', tol: { abs: 0.5 } },
          solution: `The line rises (${num(Tend, 1)} − ${T0}) ÷ ${tEnd} = ${num(rate, 2)} °C each minute. After ${t} minute${t === 1 ? '' : 's'} it shows ${T0} + ${num(rate, 2)} × ${t} = <b>${num(T, 1)} °C</b>.`,
        };
      },
    ],
  },

  {
    name: 'Averages, errors and reliability',
    facts: [
      ['Why are measurements repeated several times?', 'To spot anomalies and make the results more reliable', ['To make the results fit the hypothesis better', 'To get rid of every systematic error', 'To change the independent variable each time', 'So that each trial can use a new method'], 'Repeats show whether results are consistent, let you spot an anomaly, and give a mean that cuts down random errors.'],
      ['Trials of the time for a cup to cool by 10 °C give 6.1, 6.3, 9.8 and 6.2 minutes. What should be done with the 9.8?', 'Treat it as anomalous and leave it out of the mean', ['Keep it in, since every result counts the same', 'Use only 9.8, since it is the largest', 'Count it twice so the mean is more reliable', 'Change it to 6.2 so it fits with the others'], 'The 9.8 is far from the others, so it’s anomalous: leave it out of the mean, and repeat that trial if you can.'],
      ['What does it mean for a measurement to be accurate?', 'It is close to the true value', ['It is close to the other repeats', 'It has lots of decimal places', 'It was made with a new instrument', 'It matches the hypothesis exactly'], 'Accuracy is closeness to the true value; closeness of repeats to each other is precision.'],
      ['What does it mean for a set of repeat measurements to be precise?', 'They are close to each other', ['They are close to the true value', 'They are all whole numbers', 'They agree with the hypothesis', 'They were all taken quickly'], 'Precise results are tightly grouped and repeatable, even if all of them are off from the true value.'],
      ['A balance reads 2 g with nothing on it. What kind of error does this cause?', 'A systematic error', ['A random error', 'An anomalous result', 'A reaction-time error', 'A rounding error'], 'Every reading comes out 2 g too high: an error that’s the same each time is systematic. Zeroing the balance fixes it.'],
      ['Which errors can repeating and averaging reduce?', 'Random errors, like reaction time with a stopwatch', ['Systematic errors, like an unzeroed balance', 'Systematic errors, like a ruler with a worn end', 'Every kind of error, with enough repeats', 'No errors at all, only anomalies'], 'Random errors scatter readings above and below the true value, so they partly cancel out in a mean; a systematic error shifts every reading the same way.'],
      ['Darts all land close together, but far from the bullseye. The throws are…', 'Precise but not accurate', ['Accurate but not precise', 'Both accurate and precise', 'Neither accurate nor precise', 'Accurate, since they’re grouped'], 'Close together means precise; far from the target means not accurate.'],
      ['What is the range of a set of results?', 'The largest value minus the smallest', ['The sum of all of the values', 'The middle value, once in order', 'The value that comes up most', 'The sum divided by how many'], 'The range shows how spread out the results are: a small range means the repeats agree closely.'],
      ['Three trials give 12 s, 14 s and 13 s. What is their mean?', '13 s', ['14 s', '39 s', '2 s', '12 s'], 'The mean is the sum ÷ the number of trials: (12 + 14 + 13) ÷ 3 = 39 ÷ 3.'],
      ['A thermometer always reads 1 °C too high. What happens if ten readings are taken and averaged?', 'The mean is still 1 °C too high', ['The error disappears completely', 'The error becomes ten times bigger', 'The error becomes ten times smaller', 'The error becomes a random error'], 'A systematic error is the same in every reading, so the mean is off by the same amount; the thermometer needs recalibrating.'],
      ['Your reaction time makes stopwatch readings a little too long or too short each time. What kind of error is this?', 'Random error', ['Systematic error', 'Zero error', 'Calibration error', 'Parallax error'], 'Reaction time varies from trial to trial, so it’s a random error. Timing 10 swings instead of 1, and repeating, cuts it down.'],
      ['Reading a ruler from the same slanted angle every time makes every reading a little too long. What kind of error is this?', 'A systematic error, from parallax', ['A random error, from parallax', 'A random error, from reaction time', 'An anomalous result every time', 'No error, since it’s the same each time'], 'Parallax from the same side every time shifts every reading the same way, so it’s systematic. Read with your eye level with the mark.'],
      ['When are results reliable?', 'When repeats give similar results each time', ['When they agree with the prediction', 'When they have many decimal places', 'When an expert has collected them', 'When they include every anomaly'], 'Results are reliable (repeatable) when doing the test again, by you or someone else, gives similar values.'],
      ['When is an experiment valid?', 'When it’s fair and measures what it set out to', ['When it gives the same result every time', 'When its results support the hypothesis', 'When it uses the most expensive equipment', 'When it has more than ten trials in it'], 'A valid test answers its question: only the independent variable changes, and the right thing is measured.'],
      ['Which is a likely cause of one anomalous result?', 'Misreading the scale in one trial', ['Repeating every trial three times', 'Using the same equipment all through', 'Keeping the controlled variables the same', 'Working out the mean of the results'], 'A one-off slip, like misreading a scale or starting the stopwatch late, can put one result far from the rest.'],
    ],
    typed: [
      ['What is the sum of the results divided by the number of results called?', ['mean', 'the mean', 'average', 'the average', 'arithmetic mean', 'the arithmetic mean'], 'The mean is the usual average of repeat results.'],
      ['Which of the two kinds of error is the same in every reading, like a balance that isn’t zeroed?', ['systematic', 'systematic error', 'a systematic error', 'systematic errors'], 'A systematic error shifts every reading by the same amount, so repeating doesn’t remove it.'],
      ['What is the largest result minus the smallest called?', ['range', 'the range'], 'The range shows how spread out the results are.'],
      ['What word describes repeat measurements that are close to each other?', ['precise', 'precision', 'consistent', 'repeatable', 'reliable'], 'Precise results are tightly grouped, with a small range.'],
      ['What word describes a measurement that is close to the true value?', ['accurate', 'accuracy'], 'Accurate means close to the true value; precise means close to each other.'],
      ['Which of the two kinds of error changes unpredictably from reading to reading, like reaction time?', ['random', 'random error', 'a random error', 'random errors'], 'Random errors scatter readings both ways, so repeating and averaging reduce them.'],
      ['What is a result that’s far from the others, and doesn’t fit the pattern, called?', ['anomaly', 'an anomaly', 'anomalous result', 'an anomalous result', 'anomalous', 'outlier', 'an outlier', 'anomalies', 'outliers', 'anomalous results'], 'An anomalous result (an outlier) is left out of the mean, with a reason given.'],
    ],
    tf: [
      ['Repeating a measurement and taking the mean reduces the effect of random errors.', true, 'Random errors push readings both ways, so they partly cancel out in a mean.'],
      ['Taking more repeats will fix a systematic error.', false, 'A systematic error shifts every reading by the same amount, so the mean is still off; fix the instrument or the method instead.'],
      ['An anomalous result should be left out when the mean is worked out.', true, 'Including it would drag the mean away from the other results; leave it out and say why.'],
      ['Precise results are always accurate.', false, 'Results can be close together but all off by the same amount, like readings from an unzeroed balance: precise but not accurate.'],
      ['The range of 4.2, 4.8 and 4.5 is 0.6.', true, 'Range = largest − smallest = 4.8 − 4.2 = 0.6.'],
      ['The mean of 10, 12 and 17 is 12.', false, 'The mean is (10 + 12 + 17) ÷ 3 = 39 ÷ 3 = 13; 12 is the middle value.'],
      ['A smaller range means the repeat results are more precise.', true, 'The closer the repeats are to each other, the smaller the range and the more precise they are.'],
      ['Reaction time that makes some stopwatch readings too long and others too short causes a systematic error.', false, 'Reaction time varies from trial to trial, making readings too long or too short: a random error.'],
      ['A thermometer that always reads 2 °C too high causes a systematic error.', true, 'The error is the same in every reading; recalibrating the thermometer fixes it.'],
      ['An anomalous result should be changed so it matches the others.', false, 'Never change data. Record it, leave it out of the mean with a reason, and repeat that trial if you can.'],
      ['A valid test is a fair test that measures what it was meant to measure.', true, 'Validity is about answering the right question in a fair way.'],
      ['Timing 10 swings of a pendulum and dividing by 10 gives a more accurate time for one swing than timing a single swing.', true, 'The reaction-time error is about the same for 10 swings as for 1, so dividing by 10 makes it about 10 times smaller for each swing.'],
    ],
    pairs: [
      ['Mean', 'The total of the results ÷ how many there are'],
      ['Range', 'The largest result minus the smallest'],
      ['Anomalous result', 'A result that doesn’t fit with the others'],
      ['Accurate', 'Close to the true value'],
      ['Precise', 'Repeats close to each other'],
      ['Systematic error', 'Off by the same amount every time'],
      ['Random error', 'Varies from reading to reading'],
      ['Valid', 'A fair test that measures the right thing'],
      ['Calibrate', 'Check and set an instrument against known values'],
      ['Zero error', 'A reading when there’s nothing to measure'],
      ['Repeat trials', 'Doing the same test again to check it'],
    ],
    sort: { title: 'Is each one a random error or a systematic error?', left: 'Random error', right: 'Systematic error',
      items: [
        ['Starting a stopwatch early one time, late the next', 'l'], ['Reading a scale that won’t keep still', 'l'], ['Judging the end of a pendulum’s swing', 'l'],
        ['A breeze making a spring bob up and down', 'l'], ['Judging when an ice cube has just melted', 'l'], ['Guessing between two marks on a scale', 'l'],
        ['A balance that reads 0.5 g with nothing on it', 'r'], ['A thermometer that always reads 1 °C high', 'r'], ['Reading a ruler from one side every time', 'r'],
        ['Measuring from the worn end of a ruler', 'r'], ['A stopwatch that runs slow', 'r'], ['A spring scale that hasn’t been zeroed', 'r'],
      ] },
    multi: [
      ['Which of these reduce the effect of random errors?', ['Repeating each measurement', 'Taking the mean of the repeats', 'Timing 10 swings instead of 1'], ['Zeroing the balance first', 'Recalibrating the thermometer'], 'Repeats and averaging let random errors cancel out, and timing many swings shrinks the reaction-time error for each one; zeroing and recalibrating fix systematic errors instead.'],
      ['Trials gave 24.1, 24.3, 31.0 and 24.2 s. Which statements are right?', ['31.0 s is anomalous', 'Without it, the mean is 24.2 s'], ['The mean of all four is 24.2 s', 'Without it, the range is 0.4 s', 'It should be changed to 24.2 s'], 'The 31.0 s is far from the rest, so it’s left out: (24.1 + 24.3 + 24.2) ÷ 3 = 72.6 ÷ 3 = 24.2 s, and the range of the other three is 24.3 − 24.1 = 0.2 s.'],
      ['Repeat readings are close together but all about 2 g too high. Which could be the cause?', ['The balance wasn’t zeroed', 'The balance is badly calibrated'], ['The readings were rushed', 'Too few repeats were done', 'Reaction time varied'], 'Readings that agree but are all off the same way point to a systematic error in the instrument, not to random errors.'],
      ['Which make results more trustworthy?', ['Doing repeat trials', 'Leaving anomalies out of the mean, with a reason', 'Using instruments that have been zeroed'], ['Changing results that look wrong', 'Recording only results that fit the hypothesis'], 'Repeats, honest handling of anomalies and well-set instruments all make results more reliable; changing or hiding data never does.'],
    ],
    order: [
      ['Put these steps for finding a mean from repeat trials in order.', ['Do the trial three or more times', 'Look for any anomalous result', 'Leave out any anomalous result', 'Add up the results that are left', 'Divide by how many results you added'], 'You need all the repeats before you can spot an anomaly, and you leave it out before adding up; then divide by the number of results you added.'],
      ['Put these sets of repeat readings in order of precision, the most precise first.', ['12.1, 12.2, 12.1 s', '12.0, 12.3, 12.2 s', '11.6, 12.4, 12.0 s', '10.9, 13.1, 12.2 s'], 'Precision is how close repeats are to each other: the ranges are 0.1 s, 0.3 s, 0.8 s and 2.2 s, and the smallest range is the most precise.'],
    ],
    calc: [
      // the mean of 3 to 5 repeat readings
      (d) => {
        const c = d.pick(READINGS), n = d.int(3, 5), xs = near(d, d.int(c.lo, c.hi), c.wander, n), { sum, mean, sign } = meanOf(xs);
        return {
          text: `Repeat measurements of ${c.what} gave ${and(xs.map(tenth))} ${c.unit}. What is the mean of all of them, to 2 decimal places?`,
          answer: { kind: 'number', value: round(mean, 2), unit: c.unit, tol: { abs: 0.05 } },
          solution: `Mean = sum ÷ number of results = (${xs.map(tenth).join(' + ')}) ÷ ${n} = ${tenth(sum)} ÷ ${n} ${sign} <b>${two(mean)} ${c.unit}</b>.`,
        };
      },
      // the mean leaving out one clearly anomalous reading, which the question names. The other readings stay within
      // about 3% of each other, and the odd one is a quarter or more away and at least four times their spread, so
      // there's no doubt which one it is.
      (d) => {
        const c = d.pick(READINGS), n = d.int(4, 5), base = d.int(c.lo, c.hi), w = Math.max(1, Math.min(c.wander, Math.round(base * 0.03)));
        const good = near(d, base, w, n - 1), off = Math.max(Math.round((base * d.int(25, 40)) / 100), 4 * (2 * w + 1));
        const odd = base + off * (d.chance(0.5) ? 1 : -1), at = d.int(0, n - 1);
        const all = [...good.slice(0, at), odd, ...good.slice(at)], { sum, mean, sign } = meanOf(good);
        return {
          text: `Repeat measurements of ${c.what} gave ${and(all.map(tenth))} ${c.unit}. The ${tenth(odd)} ${c.unit} reading is clearly anomalous, so it’s left out. What is the mean of the other results, to 2 decimal places?`,
          answer: { kind: 'number', value: round(mean, 2), unit: c.unit, tol: { abs: 0.05 } },
          solution: `Leave out the anomalous ${tenth(odd)} ${c.unit}. Mean of the other ${n - 1} = (${good.map(tenth).join(' + ')}) ÷ ${n - 1} = ${tenth(sum)} ÷ ${n - 1} ${sign} <b>${two(mean)} ${c.unit}</b>.`,
        };
      },
      // the range of 3 to 5 repeat readings
      (d) => {
        const c = d.pick(READINGS), n = d.int(3, 5), xs = near(d, d.int(c.lo, c.hi), c.wander, n);
        if (Math.max(...xs) === Math.min(...xs)) xs[0] += d.int(1, 3);
        const hi = Math.max(...xs), lo = Math.min(...xs);
        return {
          text: `Repeat measurements of ${c.what} gave ${and(xs.map(tenth))} ${c.unit}. What is the range of all of them?`,
          answer: { kind: 'number', value: round((hi - lo) / 10, 2), unit: c.unit, tol: { abs: 0.05 } },
          solution: `Range = largest − smallest = ${tenth(hi)} − ${tenth(lo)} = <b>${tenth(hi - lo)} ${c.unit}</b>.`,
        };
      },
    ],
  },

  {
    name: 'Testing materials',
    facts: [
      ['Which property describes how well a material resists being scratched?', 'Hardness', ['Strength', 'Flexibility', 'Elasticity', 'Density'], 'A harder material scratches a softer one, and the softer one can’t scratch it back.'],
      ['Which property means a material springs back to its shape after being stretched or squashed?', 'Elasticity', ['Flexibility', 'Hardness', 'Brittleness', 'Strength'], 'An elastic material, like rubber, returns to its shape when the force is removed; a flexible one just bends easily, and may stay bent.'],
      ['What is a material that snaps or shatters, instead of bending, called?', 'Brittle', ['Flexible', 'Elastic', 'Soft', 'Durable'], 'Brittle materials like glass and pottery break suddenly, without bending first.'],
      ['How can you test which of two materials is harder?', 'See which one scratches the other', ['See which one is heavier', 'See which one bends further', 'See which one floats in water', 'See which one feels colder'], 'The harder material scratches the softer one; this is how the hardness of minerals is compared too.'],
      ['Threads of the same length and thickness are tested for strength. What is measured?', 'The mass each holds before it breaks', ['How far each stretches with 100 g', 'How long each of the threads is', 'How heavy each of the threads is', 'How quickly each one dries out'], 'Strength is how much force a material takes before it breaks, so masses are added one at a time until each thread snaps.'],
      ['How is the flexibility of strips of different materials compared fairly?', 'By how far each bends under the same load', ['By how far each bends under a different load', 'By the mass each holds before breaking', 'By which strip scratches the others', 'By how long each strip is at the start'], 'Strips of the same size are clamped the same way with the same mass on the end; the one that bends furthest is the most flexible.'],
      ['In an insulation test, why must each cup hold the same volume of hot water?', 'So the volume can’t affect how fast they cool', ['So the cups all weigh exactly the same', 'So each thermometer reaches the bottom', 'So the water can’t spill out of the cups', 'So each wrapping soaks up the same amount'], 'Volume is a controlled variable: more water holds more heat and cools more slowly, so only the wrapping should differ.'],
      ['In an insulation test, which result shows the best insulator?', 'The smallest temperature drop in the same time', ['The largest temperature drop in the same time', 'The highest temperature at the very start', 'The coldest water after ten minutes', 'The cup that cooled down the fastest'], 'A good insulator slows heat loss, so the water inside it cools the least.'],
      ['Why are saucepans made of metal, with plastic or wooden handles?', 'Metal conducts heat to the food; the handle insulates', ['Metal insulates the food; the handle conducts heat', 'Metal is light; the handle adds weight to hold', 'Metal is waterproof; the handle soaks up spills', 'Metal is cheap; the handle is just for decoration'], 'Metals are good thermal conductors, so heat reaches the food; plastic and wood are poor conductors, so the handle stays cool enough to hold.'],
      ['Why is copper used for the wires inside electric cables?', 'It conducts electricity well', ['It insulates electricity well', 'It is very hard to scratch', 'It is brittle and snaps cleanly', 'It is the least dense metal'], 'Copper lets current flow easily and bends into wires; the plastic coating around it is an electrical insulator.'],
      ['What is a trade-off when choosing a material?', 'Giving up one good property to get another', ['Testing every material twice to be sure', 'Always choosing the most costly material', 'Swapping a material for one that looks alike', 'Using two materials that do the same job'], 'No material is best at everything: a light, strong one may cost more, and a cheap one may wear out sooner, so you weigh up what matters most.'],
      ['Two blocks are the same size, but one is much heavier. What does that tell you?', 'The heavier one is made of a denser material', ['The heavier one is made of a harder material', 'The heavier one is made of a stronger material', 'The lighter one is made of a more elastic material', 'The heavier one is a better insulator of heat'], 'Density is mass per unit volume: the same volume of a denser material has more mass.'],
      ['Why are many bicycle frames made of aluminum rather than steel?', 'It is strong but less dense, so it’s lighter', ['It conducts electricity better than steel', 'It is much cheaper to buy than steel', 'It is harder and more brittle than steel', 'It is a better insulator than steel'], 'Aluminum is about a third as dense as steel, so a strong enough frame weighs less; the trade-off is that it usually costs more.'],
      ['Drops of water are put on samples of fabric. Which result shows a fabric is waterproof?', 'The drops stay on top and none soaks through', ['The drops soak in quickly and spread out', 'The fabric turns darker as it gets wet', 'The water soaks through and drips below', 'The fabric soaks up the drops like a sponge'], 'A waterproof material doesn’t let water through, so the drops bead up on its surface.'],
      ['Spoons of metal, wood and plastic stand in the same hot water. Which spoon’s handle warms up fastest?', 'The metal one', ['The wooden one', 'The plastic one', 'All three equally', 'The thickest one'], 'Metals are good thermal conductors, so heat travels up a metal spoon much faster than up wood or plastic.'],
      ['Why is glass used for windows, even though it is brittle?', 'It is transparent and waterproof', ['It is flexible and very light', 'It is a good conductor of heat', 'It is soft and easy to shape', 'It is elastic, so it bends in wind'], 'Glass lets light through and keeps rain out; the trade-off is that it can shatter, so safety glass is used where that matters.'],
      ['Which property matters most for a raincoat?', 'Being waterproof', ['Being transparent', 'Being hard', 'Being brittle', 'Being a good conductor'], 'A raincoat must not let water through; it also has to be flexible enough to move with you.'],
    ],
    typed: [
      ['What word describes a material that snaps or shatters easily instead of bending?', ['brittle', 'brittleness'], 'Glass and pottery are brittle: they break suddenly, without bending first.'],
      ['What property means a material returns to its shape after being stretched?', ['elasticity', 'elastic'], 'Rubber bands and springs are elastic: they return to their shape when the force is removed.'],
      ['What is a material called that lets heat or electricity pass through it easily?', ['conductor', 'a conductor', 'conductors', 'good conductor', 'a good conductor'], 'Metals are good conductors of both heat and electricity.'],
      ['What is a material called that doesn’t let heat or electricity pass through it easily?', ['insulator', 'an insulator', 'insulators', 'good insulator', 'a good insulator', 'poor conductor', 'a poor conductor'], 'Plastic, rubber, wood and air are good insulators.'],
      ['What property is mass per unit volume?', ['density', 'dense'], 'Density = mass ÷ volume, so the same volume of a denser material is heavier.'],
      ['What property means a material lasts a long time without wearing out?', ['durability', 'durable'], 'A durable material stands up to wear, weather and use over a long time.'],
      ['What property means a material bends easily without breaking?', ['flexibility', 'flexible'], 'A flexible material bends easily; an elastic one also springs back.'],
      ['What word describes a fabric that keeps rain from soaking through?', ['waterproof', 'water-proof', 'water proof', 'watertight', 'water-tight', 'impermeable'], 'A waterproof material keeps water out, like the coating on a raincoat.'],
    ],
    tf: [
      ['A harder material can scratch a softer one.', true, 'That’s how a scratch test compares hardness: the harder material leaves a mark on the softer one.'],
      ['A flexible material always springs back to its original shape.', false, 'Springing back is elasticity. A flexible material bends easily, but it may stay bent, like a strip of soft wire.'],
      ['In a fair test of strength, every strip should be the same length and thickness.', true, 'A thicker or wider strip could hold more just because of its size, so every strip is cut the same and only the material differs.'],
      ['The best material for a job is always the strongest one.', false, 'It depends on the job: cost, weight, safety and the environment all matter, so choosing means weighing trade-offs.'],
      ['Glass is brittle.', true, 'Glass shatters instead of bending, so it can break suddenly if it’s hit.'],
      ['Plastic coats electric wires because it conducts electricity well.', false, 'Plastic is an electrical insulator, so it keeps the current in the copper and away from you.'],
      ['Metals are generally good conductors of both heat and electricity.', true, 'That’s why pans and wires are made of metal.'],
      ['To compare insulators fairly, each cup can start with water at a different temperature.', false, 'Hotter water cools faster, so the starting temperature must be the same in every cup.'],
      ['A material with a greater density has more mass in the same volume.', true, 'Density is mass per unit volume, so the denser one is heavier for its size.'],
      ['In an insulation test, the water that cooled the most was wrapped in the best insulator.', false, 'The best insulator lets the least heat out, so the water inside it cools the least.'],
      ['Wood and plastic are poor conductors of heat.', true, 'That’s why they are used for pan handles and for spoons that stir hot food.'],
      ['Under the same load, a strip that bends a lot is less flexible than one that bends a little.', false, 'Bending more under the same load means it’s more flexible.'],
    ],
    pairs: [
      ['Strength', 'How much force it takes before breaking'],
      ['Hardness', 'How well it resists scratching'],
      ['Flexibility', 'How easily it bends without breaking'],
      ['Elasticity', 'Springing back to shape after a force'],
      ['Brittleness', 'Snapping or shattering instead of bending'],
      ['Density', 'Mass per unit of volume'],
      ['Thermal conductivity', 'How well heat passes through it'],
      ['Electrical conductivity', 'How well electric current flows through it'],
      ['Waterproof', 'Doesn’t let water through'],
      ['Durability', 'How long it lasts before wearing out'],
    ],
    sort: { title: 'In a circuit with a battery and a bulb, does each one conduct electricity, or is it an insulator?', left: 'Conductor', right: 'Insulator',
      items: [
        ['Copper wire', 'l'], ['Aluminum foil', 'l'], ['Steel paper clip', 'l'], ['Iron nail', 'l'], ['Pencil lead (graphite)', 'l'], ['Silver spoon', 'l'],
        ['Plastic ruler', 'r'], ['Rubber band', 'r'], ['Glass marble', 'r'], ['Wooden spoon', 'r'], ['Cotton thread', 'r'], ['Paper straw', 'r'],
      ] },
    multi: [
      ['Which must be kept the same in a fair test of which fabric insulates best?', ['The volume of hot water', 'The water’s starting temperature', 'The thickness of each fabric'], ['The kind of fabric around each cup', 'The temperature at the end of the test'], 'Only the fabric is changed and the temperature drop is measured; the water and the thickness of each wrapping stay the same.'],
      ['Which properties make copper good for electric wires?', ['It conducts electricity well', 'It bends without breaking'], ['It is brittle and snaps cleanly', 'It is an electrical insulator', 'It is attracted to magnets'], 'Copper carries current easily and can be drawn into wires that bend; it isn’t magnetic, and it isn’t brittle.'],
      ['A drink bottle could be made of glass, plastic or aluminum. Which of these points are true?', ['Glass is heavy and can shatter', 'Plastic is light but can pollute if thrown away', 'Aluminum is light and can be recycled'], ['Aluminum is transparent, so the drink shows', 'Glass bends without breaking when dropped'], 'Each choice has trade-offs: glass is heavy and brittle, plastic is light but lasts for years as litter, and aluminum is light and easy to recycle.'],
      ['Which are fair ways to test a property?', ['Strength: add masses until each strip breaks', 'Hardness: see which material scratches which', 'Flexibility: the same mass on strips of one size'], ['Hardness: see which material is heavier', 'Strength: see which strip is the longest'], 'Each fair test measures the property itself, with samples of the same size; weight and length don’t show hardness or strength.'],
      ['Which of these are brittle?', ['Glass', 'Pottery', 'Chalk'], ['Rubber', 'Copper wire', 'Wool'], 'Glass, pottery and chalk snap or shatter instead of bending; rubber, copper and wool bend or stretch.'],
    ],
    order: [
      ['Put the steps of an insulation test in order.', ['Wrap each cup in its material', 'Pour the same volume of hot water into each wrapped cup', 'Read each cup’s temperature every minute', 'Work out how far each temperature fell', 'Decide which material insulated best'], 'The cups are wrapped before the hot water goes in, so they all start cooling together; the drops are worked out from the readings, and the smallest drop shows the best insulator.'],
      ['Put the steps of a strength test in order.', ['Cut strips of each material the same size', 'Clamp a strip and hang a mass hanger from it', 'Add 100 g masses one at a time', 'Record the total mass when it breaks', 'Repeat with a strip of the next material'], 'Each strip is loaded a little at a time until it breaks, and the total mass it held measures its strength; then the next material is tested the same way.'],
    ],
  },

  {
    name: 'Insulation and design',
    facts: [
      ['Why are materials full of trapped air, like wool and foam, good insulators?', 'Air conducts heat poorly, and trapped air can’t flow', ['Air conducts heat well, so heat spreads out evenly', 'Trapped air reflects all heat back where it came from', 'Air is cold, so it cools the heat passing through', 'Trapped air soaks up the heat and destroys it'], 'Gases are poor conductors, and air held in tiny pockets can’t move around to carry heat by convection.'],
      ['In a vacuum flask, what does the vacuum between the walls stop?', 'Conduction and convection', ['Radiation only', 'Conduction only', 'Radiation and evaporation', 'Convection and radiation'], 'Conduction and convection both need particles, and a vacuum has almost none; radiation can still cross it, which is why the walls are silvered.'],
      ['Why are the walls of a vacuum flask silvered?', 'To reflect heat radiation', ['To stop heat conducting through', 'To stop convection in the gap', 'To make the flask stronger', 'To absorb heat from the drink'], 'Shiny surfaces reflect infrared radiation, so heat radiated by a hot drink is reflected back in, and heat from outside is kept out of a cold one.'],
      ['What does the stopper of a vacuum flask do?', 'Stops heat loss by convection and evaporation', ['Stops heat loss by radiation through the glass', 'Lets steam out so the flask doesn’t burst', 'Lets air in to keep the drink fresh', 'Reflects heat radiation back into the drink'], 'Without a stopper, warm air and vapor would rise out of the top, carrying heat away; the stopper is also a poor conductor.'],
      ['Why does double glazing keep a house warmer than a single pane of glass?', 'The gas between the panes is a poor conductor', ['The two panes reflect all the heat back inside', 'The glass is twice as thick, so heat can’t pass', 'The panes are tinted to absorb the Sun’s heat', 'The gas between the panes makes its own heat'], 'The trapped gas conducts heat far less than glass, and the gap is narrow, so there’s little convection.'],
      ['How does blubber keep a seal warm in icy water?', 'It’s a thick layer of fat, which conducts heat poorly', ['It’s dark, so it soaks up heat from sunlight', 'It reflects the cold away from the skin', 'It traps a layer of warm air under the skin', 'It takes in heat from the water around it'], 'Fat is a poor conductor of heat, so a thick layer slows the heat flowing from the warm body to the cold water.'],
      ['What is the first step of the engineering design process?', 'Define the problem', ['Build a prototype', 'Test the design', 'Brainstorm ideas', 'Improve the design'], 'You need to know exactly what problem you’re solving, and what success looks like, before researching or brainstorming.'],
      ['In engineering, what is a prototype?', 'An early model built to test a design', ['The final product that is sold', 'A drawing of the problem to solve', 'A list of the limits on a design', 'The first idea from brainstorming'], 'A prototype is a working model you build and test, so you can find problems and improve the design before making the real thing.'],
      ['Which of these is a constraint on a cooler design?', 'It must be built from the materials provided', ['It must keep ice frozen for six hours', 'It must keep drinks below 5 °C all day', 'It must keep its lid shut when carried', 'It must not leak when it’s tipped over'], 'Constraints are limits on the design, like money, materials, time or size; the others are criteria, things the design must do.'],
      ['What are the criteria of a design?', 'The things it must do to succeed', ['The limits on money, time and materials', 'The steps followed to build it', 'The tests that are done on it', 'The problems found when testing it'], 'Criteria are the goals the design must meet, like keeping water above 50 °C for an hour; constraints are the limits it must be made within.'],
      ['After testing a prototype, what should the designers do next?', 'Evaluate the results and improve the design', ['Stop, since one test shows that it works', 'Throw it away and pick a new problem', 'Build the final product with no changes', 'Change the criteria to fit the results'], 'Test results show what works and what doesn’t, so the design is improved and tested again until it meets the criteria.'],
      ['How does a cooler keep drinks cold on a hot day?', 'Its insulated walls slow heat flowing in', ['Its walls make cold and send it inward', 'Its walls let heat out of the drinks faster', 'Its walls stop the cold from flowing out', 'Its walls are good conductors of heat'], 'Heat flows from warmer to cooler, so it flows in from the hot air outside; the insulation slows it, so the drinks stay cold longer.'],
      ['Why do birds fluff up their feathers on cold days?', 'To trap more air, which insulates them', ['To let more cold air reach their skin', 'To shed heat faster through their skin', 'To dry their feathers out in the wind', 'To reflect more of the Sun’s heat away'], 'Fluffed-up feathers hold a thicker layer of still air, a poor conductor, so less heat escapes from the bird’s body.'],
      ['How does a wetsuit help a swimmer keep warm?', 'Its foam is full of tiny gas bubbles that insulate', ['It is waterproof, so no water touches the skin', 'It is shiny inside, reflecting heat to the skin', 'It conducts heat well, spreading it around', 'It warms up the water around the swimmer'], 'The foam’s gas bubbles conduct heat poorly, and a thin layer of water trapped next to the skin warms up and stays put.'],
      ['Which way of heat transfer can cross a vacuum?', 'Radiation', ['Conduction', 'Convection', 'Evaporation', 'Reflection'], 'Radiation travels as infrared waves, which need no particles, so heat from the Sun reaches Earth through space.'],
      ['Why is attic insulation made of a fluffy material like fiberglass?', 'It traps air, which slows heat escaping', ['It is dense, so heat can’t get through it', 'It conducts heat well, spreading it out', 'It reflects all of the Sun’s radiation', 'It soaks up moisture, which keeps the house warm'], 'A fluffy layer is mostly trapped air, a poor conductor that can’t flow, so heat from the rooms below escapes through the roof much more slowly.'],
    ],
    typed: [
      ['Which way of heat transfer happens in liquids and gases, as warmer parts rise?', ['convection', 'convection currents', 'convection current'], 'In convection, warm fluid rises and cooler fluid sinks, carrying heat around.'],
      ['What is an early working model of a design, built to be tested, called?', ['prototype', 'a prototype', 'prototypes'], 'A prototype lets you test a design and improve it before the final version.'],
      ['Which way of heat transfer can travel through empty space, like heat from the Sun?', ['radiation', 'infrared radiation', 'infrared', 'thermal radiation', 'heat radiation', 'radiant heat'], 'Radiation is carried by infrared waves, which need no particles.'],
      ['What are the limits on a design, like its cost, time and materials, called?', ['constraints', 'constraint', 'the constraints', 'design constraints'], 'Constraints limit the design; criteria are what it must do.'],
      ['Which way of heat transfer passes heat from particle to particle, mostly in solids?', ['conduction', 'conducting'], 'In conduction, vibrating particles pass energy to their neighbors.'],
      ['What are the goals a design must meet to count as a success called?', ['criteria', 'criterion', 'the criteria', 'design criteria'], 'Criteria are what the design must do; constraints are the limits on it.'],
      ['What is the thick layer of fat that keeps whales and seals warm called?', ['blubber'], 'Blubber is fat, a poor conductor, so it slows heat loss to cold water.'],
      ['What do shiny, silvery surfaces do to heat radiation, instead of absorbing it?', ['reflect it', 'reflect', 'reflects it', 'reflects', 'reflection', 'they reflect it', 'reflect it back', 'reflects it back'], 'Shiny surfaces reflect infrared radiation, which is why a flask’s walls are silvered.'],
    ],
    tf: [
      ['A vacuum stops heat transfer by conduction and convection.', true, 'Both need particles to carry the heat, and a vacuum has almost none.'],
      ['Heat radiation can’t cross a vacuum.', false, 'Radiation needs no particles, which is how the Sun’s heat reaches Earth through space; a flask’s silvered walls reflect it.'],
      ['Trapped air makes a material a better insulator.', true, 'Air conducts heat poorly, and when it’s trapped in small pockets it can’t carry heat by convection either.'],
      ['A cooler works by stopping cold from flowing out.', false, 'Cold doesn’t flow: heat flows in from the warmer air outside, and the insulation slows it down.'],
      ['Double glazing works because the gas between the panes is a poor conductor.', true, 'The trapped gas conducts heat far less than the glass, and the narrow gap limits convection.'],
      ['Several thin layers of clothing can keep you warmer than one thick layer, partly because of the air between them.', true, 'Each layer traps air, a poor conductor, so the layers together slow heat loss.'],
      ['In the engineering design process, a design is tested only once.', false, 'Designs are tested, improved and tested again, often many times, until they meet the criteria.'],
      ['A constraint is a limit on a design, like its cost or size.', true, 'Constraints are the limits; criteria are what the design must do.'],
      ['The silver coating in a vacuum flask is there to stop conduction.', false, 'The shiny surfaces reflect radiation; the vacuum is what stops conduction and convection.'],
      ['Metals are good insulators, so coolers are lined with them.', false, 'Metals are good conductors; coolers are insulated with foam and trapped air, which are poor conductors.'],
      ['A prototype is built so a design can be tested and improved.', true, 'Testing a prototype shows what works and what needs changing.'],
      ['Blubber keeps a seal warm because fat is a good conductor of heat.', false, 'Fat is a poor conductor, so it slows heat flowing out of the seal’s body.'],
    ],
    pairs: [
      ['Conduction', 'Heat passed from particle to particle'],
      ['Convection', 'Warm liquid or gas rising and carrying heat'],
      ['Radiation', 'Heat carried by infrared waves, even through space'],
      ['Insulator', 'A material that slows the flow of heat'],
      ['Vacuum', 'A space with almost no particles in it'],
      ['Double glazing', 'Two panes of glass with gas between them'],
      ['Blubber', 'A thick layer of fat under an animal’s skin'],
      ['Prototype', 'An early model built for testing'],
      ['Criteria', 'What a design must do to succeed'],
      ['Constraints', 'Limits such as cost, time and materials'],
      ['Evaluate', 'Judge how well a design met its criteria'],
      ['Brainstorm', 'Come up with many ideas before judging them'],
    ],
    sort: { title: 'Does each one mainly slow heat transfer by trapping air, or by reflecting radiation?', left: 'Traps air', right: 'Reflects radiation',
      items: [
        ['A wool sweater', 'l'], ['A bird’s fluffed-up feathers', 'l'], ['The foam walls of a cooler', 'l'],
        ['Fiberglass insulation in an attic', 'l'], ['A polar bear’s thick fur', 'l'], ['Several thin layers of clothing', 'l'],
        ['A foil emergency blanket', 'r'], ['The silvered walls of a vacuum flask', 'r'], ['Shiny foil behind a radiator', 'r'],
        ['A shiny sunshade inside a car windshield', 'r'], ['A firefighter’s silver heat suit', 'r'], ['A shiny, white roof in a hot place', 'r'],
      ] },
    multi: [
      ['Which parts of a vacuum flask cut down heat transfer?', ['The vacuum between the walls', 'The silvered surfaces', 'The stopper'], ['Dull black inner walls', 'Holes to let the steam out'], 'The vacuum stops conduction and convection, the silvered walls reflect radiation, and the stopper stops convection and evaporation; dull black walls and steam holes would let more heat out.'],
      ['Which of these keep an animal warm by trapping air?', ['Fur', 'Feathers'], ['Blubber', 'Sweating', 'Panting'], 'Fur and feathers hold still air, a poor conductor; blubber insulates as a layer of fat, and sweating and panting cool an animal down.'],
      ['Which of these are constraints on a design?', ['A budget of $15', 'Only the materials provided', 'Two days to build it'], ['It must keep water hot for an hour', 'It must not leak when tipped over'], 'Money, materials and time are limits, so they are constraints; keeping water hot and not leaking are criteria, things the design must do.'],
      ['Which steps come after a prototype has been tested?', ['Evaluate how well it met the criteria', 'Improve the design', 'Test it again'], ['Define the problem for the first time', 'Brainstorm the very first ideas'], 'Testing leads to evaluating and improving, then testing again; defining the problem and the first brainstorm come at the start.'],
      ['Which of these reduce heat loss from a house?', ['Double glazing', 'Attic insulation', 'Draft stoppers at doors'], ['Opening windows in winter', 'Thin single panes of glass'], 'Double glazing and attic insulation trap gas or air, and draft stoppers keep cold air from coming in under doors.'],
    ],
    order: [
      ['Put the first steps of the engineering design process in order.', ['Define the problem', 'Research the problem', 'Brainstorm ideas', 'Choose the best plan', 'Build a prototype'], 'Engineers first pin down the problem and find out about it, then come up with ideas and choose one to build.'],
      ['Put the later steps of the engineering design process in order.', ['Build a prototype', 'Test it', 'Evaluate the results', 'Improve the design', 'Test it again'], 'Testing shows how well the prototype works, evaluating the results shows what to improve, and the improved design is tested again.'],
      ['Put these steps of the engineering design process in order.', ['Define the problem', 'Brainstorm ideas', 'Build a prototype', 'Test it', 'Evaluate the results', 'Improve and test again'], 'The process starts by defining the problem and ends in a loop: test, evaluate, improve and test again until the design meets its criteria.'],
    ],
  },

  {
    name: 'Claims, evidence and reasoning',
    facts: [
      ['When explaining results, what is the claim?', 'A statement that answers the question', ['The data that were collected', 'The science that explains the data', 'The steps that were followed', 'A list of the equipment used'], 'The claim is your answer to the question, like “Wool is the best insulator of the three.”'],
      ['When explaining results, what is the evidence?', 'The data that support the claim', ['A statement that answers the question', 'The science that links the data to the claim', 'The prediction made before the test', 'A list of what might have gone wrong'], 'Evidence is the measurements and observations, like “The wool cup cooled 12 °C; the foil cup cooled 25 °C.”'],
      ['When explaining results, what does the reasoning do?', 'Uses science to explain why the evidence supports the claim', ['Lists every measurement that was taken during the test', 'Says the claim over again using different words', 'Describes each step of the method in the right order', 'Says what should be done differently next time'], 'Reasoning links the evidence to the claim with a science idea, like “Wool traps air, which conducts heat poorly.”'],
      ['Which is the best claim for the question “Which material is the best insulator?”', 'Wool is the best insulator of the three materials tested', ['Wool cooled from 80 °C to 68 °C in 10 minutes', 'Wool traps air, which is a poor conductor of heat', 'Insulators are materials that slow heat transfer', 'More tests with other materials should be done'], 'A claim answers the question directly; the temperatures are evidence, and the trapped air is reasoning.'],
      ['Which is an observation, not an inference?', 'The water in the foil cup fell to 41 °C', ['The foil let more heat escape than the wool', 'The wool trapped air that slowed the heat loss', 'The foil cup cooled faster because foil conducts', 'The water would freeze if left out overnight'], 'An observation is what you see or measure directly; an inference is an explanation or conclusion drawn from observations.'],
      ['Which is an inference?', 'The plant wilted because it didn’t get enough water', ['The plant’s leaves are drooping toward the pot', 'The soil in the pot feels dry when it’s touched', 'The plant measures 14 cm from the soil to its tip', 'Two of the lower leaves have turned yellow'], 'Drooping leaves and dry soil are observations; saying why the plant wilted is an inference, an explanation that goes beyond what you saw.'],
      ['What should a conclusion include?', 'Whether the hypothesis was supported, using the data', ['A list of every piece of equipment used', 'The method, written out step by step', 'A new hypothesis with no mention of data', 'Only the results that matched the prediction'], 'A conclusion answers the question, quotes the data as evidence, and says whether the results supported the hypothesis.'],
      ['The results didn’t support the hypothesis. What should the conclusion say?', 'That it wasn’t supported, and what the data showed', ['That the hypothesis was right and the data wrong', 'Nothing about the hypothesis at all', 'That the data were changed to fit it', 'That the experiment was a waste of time'], 'Results that don’t support a hypothesis are still useful: say so honestly, and use them to suggest a new idea to test.'],
      ['In an insulation test, each wrapped cup was tested only once. What would make the results more reliable?', 'Repeating each test and working out a mean', ['Testing a different material in every repeat', 'Writing results to more decimal places', 'Changing the hypothesis to fit the results', 'Leaving out the result for the foil cup'], 'Repeats show whether the results are consistent and let you spot anomalies, and a mean cuts down random errors.'],
      ['Which part of a lab report comes right after the hypothesis?', 'Materials', ['Data', 'Conclusion', 'Analysis', 'Title'], 'A lab report runs: title, question or aim, hypothesis, materials, procedure, data, analysis, conclusion.'],
      ['What does presenting data honestly mean?', 'Showing all the results, even ones that don’t fit', ['Leaving out results that don’t match the hypothesis', 'Rounding every result to a whole number', 'Showing only the best trial of each test', 'Changing odd results so they match the rest'], 'Report every result, mark any anomalies and say why you left them out of a mean; never change or hide data.'],
      ['Which part of a lab report lists the equipment needed?', 'Materials', ['Procedure', 'Analysis', 'Conclusion', 'Hypothesis'], 'The materials list is everything you need; the procedure is the steps you follow with it.'],
      ['Which part of a lab report gives the step-by-step instructions?', 'Procedure', ['Materials', 'Conclusion', 'Analysis', 'Hypothesis'], 'The procedure (method) is written clearly enough for someone else to repeat the experiment exactly.'],
      ['Why should a procedure be written in detail?', 'So someone else could repeat the experiment exactly', ['So the results are sure to support the hypothesis', 'So there’s no need for a data table afterward', 'So the conclusion can be left out of the report', 'So the materials list can be skipped altogether'], 'Others must be able to repeat your test to check your results; that’s how science makes sure results are reliable.'],
      ['A bar graph compares two results, and its y-axis starts at 48 instead of 0. What is the problem with this?', 'It makes the difference look bigger than it is', ['Bar graphs must always have a key beside them', 'The bars should be joined together by a line', 'The y-axis should be drawn on the right side', 'The data must have been made up by someone'], 'Bars are compared by their lengths, so a bar graph’s axis should start at zero; cutting it off exaggerates differences.'],
      ['A report says: “Wool is the best insulator. Its cup cooled only 12 °C in 10 minutes.” What should come next, as the reasoning?', 'Wool traps air, a poor conductor, so it slows heat loss', ['The foil cup cooled by 25 °C in the same 10 minutes', 'Wool was the best of the three materials tested', 'The test should be repeated three more times to check', 'Every cup started at the same temperature of 80 °C'], 'Reasoning uses a science idea to explain why the evidence supports the claim.'],
      ['What is the analysis section of a lab report for?', 'Finding the patterns in the data, using graphs and means', ['Listing all of the equipment that was used', 'Writing the steps for someone else to follow', 'Making a prediction before the test begins', 'Naming the variable that was changed on purpose'], 'In the analysis you process the data (means, graphs, rates) and describe the patterns, before the conclusion.'],
    ],
    typed: [
      ['When explaining results, what is the statement that answers the question called?', ['claim', 'the claim', 'a claim'], 'The claim is the answer; the evidence and reasoning back it up.'],
      ['When explaining results, what are the data that back up the claim called?', ['evidence', 'the evidence'], 'Evidence is the measurements and observations, quoted with numbers.'],
      ['What is the science that links the evidence to the claim called?', ['reasoning', 'the reasoning', 'reason', 'reasons'], 'Reasoning explains why the evidence supports the claim.'],
      ['What is an explanation or conclusion drawn from what you observed called?', ['inference', 'an inference', 'inferences'], 'An inference goes beyond what you saw to say what it means or why it happened.'],
      ['What is something you see or measure directly called?', ['observation', 'an observation', 'observations'], 'An observation is what your senses or instruments tell you, with no explanation added.'],
      ['Which part of a lab report says whether the hypothesis was supported?', ['conclusion', 'the conclusion', 'conclusions'], 'The conclusion answers the question, using the data as evidence.'],
      ['Which part of a lab report is the numbered list of steps to follow?', ['procedure', 'the procedure', 'method', 'the method', 'procedures', 'methods'], 'The procedure, or method, lets someone else repeat the experiment exactly.'],
      ['Which part of a lab report lists everything needed for the experiment?', ['materials', 'the materials', 'materials list', 'the materials list', 'material', 'equipment', 'the equipment', 'equipment list', 'apparatus', 'materials and equipment'], 'The materials list comes before the procedure.'],
    ],
    tf: [
      ['A claim is a statement that answers the question.', true, 'The evidence and reasoning then back it up.'],
      ['Evidence is the science idea that explains the results.', false, 'That’s the reasoning. Evidence is the data: the measurements and observations that support the claim.'],
      ['“The ice melted in 4 minutes” is an observation.', true, 'It’s something measured directly, with no explanation added.'],
      ['“The ice melted fastest on the metal tray because metal conducts heat well” is only an observation.', false, 'The “because” part explains, so the statement includes an inference; the observation is only which tray melted the ice fastest.'],
      ['A conclusion should refer to the data.', true, 'It quotes the results as evidence for the claim.'],
      ['If the results don’t support the hypothesis, the experiment has failed.', false, 'Results that don’t support a hypothesis still teach you something; report them honestly and use them to plan the next test.'],
      ['In a lab report, the materials come before the procedure.', true, 'You list what you need, then the steps that use it.'],
      ['In a lab report, the conclusion comes before the data.', false, 'The data come first, then the analysis, then the conclusion that draws on them.'],
      ['Leaving out a few results that don’t fit the hypothesis is honest.', false, 'Report every result. An anomaly can be left out of a mean, but it must still be shown, with the reason.'],
      ['Suggesting improvements to the method is part of evaluating an experiment.', true, 'An evaluation names sources of error and says how the method could be made better.'],
      ['Repeating an experiment and getting similar results makes its conclusion more trustworthy.', true, 'Similar results each time show the results are reliable.'],
      ['A single experiment can prove a hypothesis true.', false, 'An experiment can support a hypothesis, but one test can’t prove it; repeats and further tests make it more trustworthy.'],
    ],
    pairs: [
      ['Claim', 'The answer to the question'],
      ['Evidence', 'Data that support the claim'],
      ['Reasoning', 'The science linking evidence to the claim'],
      ['Observation', 'Something seen or measured directly'],
      ['Inference', 'An explanation drawn from observations'],
      ['Aim', 'What the experiment sets out to find'],
      ['Materials', 'Everything needed for the experiment'],
      ['Procedure', 'Steps that someone else could follow'],
      ['Analysis', 'Working out the patterns in the data'],
      ['Conclusion', 'What was found, and whether the hypothesis was supported'],
      ['Evaluation', 'Judging the method and how to improve it'],
    ],
    sort: { title: 'Is each statement an observation or an inference?', left: 'Observation', right: 'Inference',
      items: [
        ['The water is at 62 °C', 'l'], ['The spring stretched 4 cm', 'l'], ['Two leaves have turned yellow', 'l'],
        ['Bubbles formed on the nail', 'l'], ['The ice melted in 6 minutes', 'l'], ['The plant is 12 cm tall', 'l'],
        ['The plant needs more light', 'r'], ['Heat escaped through the foil', 'r'], ['The wool must trap air', 'r'],
        ['The thermometer must be broken', 'r'], ['The seeds were too cold to sprout', 'r'], ['The spring was stretched too far', 'r'],
      ] },
    multi: [
      ['Which belong in a conclusion?', ['A claim that answers the question', 'Data from the results as evidence', 'Whether the hypothesis was supported'], ['The full list of materials', 'Results changed to fit the hypothesis'], 'A conclusion answers the question, backs it up with the data, and says whether the hypothesis was supported; materials go earlier, and data are never changed.'],
      ['Which are good ways to evaluate a method?', ['Name the sources of error', 'Suggest improvements', 'Say whether more repeats are needed'], ['Change results that look wrong', 'Rewrite the hypothesis to fit'], 'Evaluating means judging the method honestly and saying how to make it better, not changing the results or the hypothesis.'],
      ['A conclusion reads: “Wool is the best insulator. Its cup cooled only 12 °C in 10 minutes, the least of the three. Wool traps air, which conducts heat poorly.” Which parts does it have?', ['A claim', 'Evidence', 'Reasoning'], ['A list of materials', 'A procedure'], 'The first sentence is the claim, the temperatures are the evidence, and the trapped air is the reasoning.'],
      ['Which are honest ways to present data?', ['Showing every result, anomalies too', 'Starting a bar graph’s axis at zero', 'Saying why a result was left out'], ['Leaving out results that don’t fit', 'Rounding results to make them agree'], 'Presenting data honestly means showing everything, on fair scales, with a reason for any result left out of a calculation.'],
      ['Which parts come before the procedure in a lab report?', ['Title', 'Hypothesis', 'Materials'], ['Data', 'Analysis', 'Conclusion'], 'The report runs: title, question or aim, hypothesis, materials, procedure, data, analysis, conclusion.'],
    ],
    order: [
      ['Put the first parts of a lab report in order.', ['Title', 'Question or aim', 'Hypothesis', 'Materials', 'Procedure'], 'A report starts by saying what it’s about and what it asks, then predicts, then lists what’s needed and the steps.'],
      ['Put the later parts of a lab report in order.', ['Materials', 'Procedure', 'Data', 'Analysis', 'Conclusion'], 'After what’s needed and the steps come the results, then working out what they show, and last the conclusion.'],
      ['Put these parts of a lab report in order.', ['Question or aim', 'Hypothesis', 'Procedure', 'Data', 'Analysis', 'Conclusion'], 'The full order is title, question or aim, hypothesis, materials, procedure, data, analysis and conclusion.'],
    ],
  },
];
