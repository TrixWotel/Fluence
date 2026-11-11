// Learning Energy and Matter: the topics in four units (heat and temperature, Earth materials, how heat moves, gases),
// each with a short lesson (the idea, how to answer, facts worth knowing, the usual mistakes) and a tip shown after a
// wrong answer. A topic is learned after 4 right in a row. No worked example: most questions are ideas, not working.
const lessons = {
  'Temperature, thermal energy and heat': {
    idea: '<p><b>Temperature</b> measures the <b>average kinetic energy</b> of a substance’s particles: how fast they are moving, on average. <b>Thermal energy</b> is the <b>total</b> kinetic energy of all the particles, so it depends on how much there is as well as how hot it is. <b>Heat</b> is thermal energy <b>moving</b> from a warmer object to a cooler one, and it is measured in <b>joules</b>.</p><p>Heat keeps flowing until both objects are at the same temperature: <b>thermal equilibrium</b>. A thermometer works this way: it comes to the temperature of what it touches, and the liquid inside <b>expands</b> up the tube as it warms. A bathtub of warm water has more thermal energy than a cup of boiling water, because it has far more particles. And cold never flows in: an ice cube feels cold because heat leaves your hand.</p>',
    how: ['Decide what the question is about: an average (temperature), a total (thermal energy) or energy on the move (heat).', 'For the direction of heat, find the warmer object: heat flows from it to the cooler one.', 'Compare amounts only for thermal energy: temperature doesn’t depend on how much there is.', 'Use the right unit: joules for energy and heat; °C, K or °F for temperature.'],
    facts: ['Water freezes at 0 °C (32 °F, 273 K) and boils at 100 °C (212 °F, 373 K) at sea level.', 'Body temperature: about 37 °C (98.6 °F).', 'Heat and thermal energy are measured in joules (J).', 'Heat stops flowing at thermal equilibrium: the same temperature.'],
    watch: ['Mixing up temperature and thermal energy: the same temperature doesn’t mean the same thermal energy.', 'Saying cold flows in: only heat flows, always from warmer to cooler.', 'Thinking the particles stop at equilibrium: they keep moving; only the net flow of heat stops.'],
    tip: 'Temperature is an average, thermal energy is a total, and heat is energy moving from warmer to cooler.',
  },
  'Specific heat capacity': {
    idea: '<p>A material’s <b>specific heat capacity</b> (c) is the energy needed to warm <b>1 g</b> of it by <b>1 °C</b>. Water’s is unusually high, <b>4.18 J/(g·°C)</b>: it takes a lot of energy to warm water, and water gives a lot back as it cools. That’s why oceans keep coastal climates mild, why water cools car engines, and how it helps the body, which is mostly water, hold a steady temperature.</p><p>A <b>low</b> specific heat means a material <b>warms and cools quickly</b>: metals and sand heat up fast in the sun and cool fast at night. The heat needed is <b>Q = mcΔT</b>: Q is the heat in joules, m the mass in grams, c the specific heat and ΔT the change in temperature.</p>',
    how: ['Name each symbol: Q heat (J), m mass (g), c specific heat (J/(g·°C)), ΔT change in temperature (°C).', 'For the heat needed, multiply m × c × ΔT.', 'For the temperature change, divide: ΔT = Q ÷ (m × c).', 'For equal masses given the same heat, the one with the lower c warms more.'],
    facts: ['Water: 4.18 J/(g·°C), one of the highest of any common substance.', 'Aluminum 0.90, sand 0.83, iron 0.45, copper 0.385 J/(g·°C).', 'High c: slow to warm and slow to cool. Low c: quick both ways.', 'ΔT = final temperature − starting temperature.'],
    watch: ['Thinking a high specific heat means a material heats up fast: it’s the opposite.', 'Using the final temperature for ΔT: you need the change.', 'Thinking specific heat depends on the amount: it’s per gram, the same for a drop or a lake.'],
    tip: 'High specific heat means slow to warm and slow to cool; low means quick both ways.',
  },
  'Heating and cooling of Earth materials': {
    idea: '<p>In the same sunshine, <b>land</b> (sand, soil and rock) <b>warms up faster than water</b>, and cools down faster at night. Land has a lower <b>specific heat</b>. Sunlight warms only its <b>thin top layer</b>, while it shines several meters into water. And water <b>mixes</b> and <b>evaporates</b>, which carry energy away from its surface. Color matters too: <b>dark</b> surfaces <b>absorb</b> most sunlight and <b>light</b> ones <b>reflect</b> it; the share reflected is the <b>albedo</b>.</p><p>A heat-lamp lab shows it: with <b>equal masses</b>, the <b>same lamp distance and time</b>, and thermometers at the <b>same depth</b>, the sand and soil warm and cool faster than the water. So <b>coastal</b> places have smaller daily and yearly temperature ranges than <b>inland</b> places, and the land’s faster warming by day is what drives <b>sea breezes</b>.</p>',
    how: ['Say what’s being compared: land and water (specific heat, depth, mixing, evaporation) or dark and light (absorbing and reflecting).', 'Remember that quick to warm means quick to cool: sand is quick both ways.', 'In a lab, change only the material; keep the mass, lamp distance, time and thermometer depth the same.', 'On a graph of the results, the steepest line warmed fastest.'],
    facts: ['Sand about 0.83 J/(g·°C); water 4.18.', 'Fresh snow reflects about 80–90% of sunlight; asphalt and the open ocean only about 5–10%.', 'Coast: smaller daily and yearly ranges. Inland: hotter summers and colder winters.', 'Dark surfaces absorb sunlight; light, shiny surfaces reflect it.'],
    watch: ['Thinking water warms faster because light gets deeper into it: spreading the energy deeper makes it warm more slowly.', 'Comparing unequal masses or different lamp distances: then the test isn’t fair.', 'Thinking coasts are warmer all year: they’re milder, cooler in summer and warmer in winter than inland.'],
    tip: 'Land is quick to warm and quick to cool; water is slow both ways, and it steadies the places beside it.',
  },
  'Conduction': {
    idea: '<p><b>Conduction</b> is heat moving through <b>direct contact</b>. Faster-moving particles collide with slower neighbors and pass on energy, so heat spreads through a material, or into anything touching it, always from warmer to cooler.</p><p>It works best in <b>solids</b>, whose particles are packed close, and best of all in <b>metals</b>, whose <b>free electrons</b> carry energy quickly: these are good <b>conductors</b>. Materials that heat moves through slowly are <b>insulators</b>: wood, plastic, wool, foam and air. That’s why a metal spoon in soup gets hot all the way up, why pans have plastic or wooden handles, and why metal feels colder than wood at the same temperature: it conducts heat out of your hand faster.</p>',
    how: ['Look for touching: if heat passes through contact, it’s conduction.', 'Sort the materials: metals conduct well; wood, plastic, wool, foam and air insulate.', 'For “feels colder,” compare how fast heat leaves your hand, not the temperatures.'],
    facts: ['Good conductors: metals such as copper, aluminum, iron and silver.', 'Insulators: wood, plastic, rubber, wool, foam and still air.', 'Conduction is best in solids and poor in gases.', 'Heat is conducted from warmer to cooler until the temperatures are equal.'],
    watch: ['Saying metal feels cold because it is colder: it’s at the same temperature and draws heat out of your hand faster.', 'Thinking insulators stop heat completely: they only slow it down.', 'Thinking a sweater makes heat: it traps the heat your body makes.'],
    tip: 'Conduction is heat passed from particle to particle by touch: metals pass it fast, insulators slowly.',
  },
  'Convection': {
    idea: '<p><b>Convection</b> is heat carried by a moving <b>fluid</b>, a liquid or a gas. When part of a fluid is warmed, it <b>expands</b>, becomes <b>less dense</b> and <b>rises</b>; cooler, <b>denser</b> fluid <b>sinks</b> to take its place, is warmed, and rises in turn. This loop is a <b>convection current</b>: in a pot of water on a stove, in a room with a heater, in the atmosphere, and, very slowly, in the hot rock of Earth’s <b>mantle</b>.</p><p>Convection can’t happen in an ordinary solid, because its particles can’t flow. When density differences move the fluid, it’s <b>natural convection</b>; when a fan or a pump moves it, it’s <b>forced convection</b>.</p>',
    how: ['Check that something flows: if a moving liquid or gas carries the heat, it’s convection.', 'Follow the loop: warmed, expands, less dense, rises; cools, denser, sinks.', 'Ask what moves the fluid: density differences (natural) or a fan or pump (forced).'],
    facts: ['Warm fluid: less dense, rises. Cool fluid: denser, sinks.', 'Convection currents: a pot of water, a room heater, the atmosphere, the mantle.', 'Forced convection: a fan, a pump, a convection oven.', 'No convection in a rigid solid or in empty space.'],
    watch: ['Saying heat rises: warm fluid rises, while heat itself moves from warmer to cooler in any direction.', 'Thinking the particles get lighter: they keep their mass but spread out, so the fluid is less dense.', 'Calling a fan’s breeze natural convection: anything moved by a fan or pump is forced.'],
    tip: 'Convection is a moving loop: warm fluid rises, cools, sinks and is warmed again.',
  },
  'Radiation': {
    idea: '<p><b>Radiation</b> is heat carried by <b>electromagnetic waves</b>, mostly <b>infrared</b>. Unlike conduction and convection it needs no matter, so it can cross <b>empty space</b>: that’s how the <b>Sun</b> warms Earth. <b>All objects</b> give off some infrared, and hotter ones give off more.</p><p><b>Dark, dull</b> surfaces <b>absorb</b> radiation well and give it off well too; <b>light, shiny</b> surfaces <b>reflect</b> it. You feel a campfire on your face by radiation. A greenhouse and a parked car let sunlight in and trap the warmth. A shiny emergency blanket reflects body heat back to the person wrapped in it.</p>',
    how: ['Look for a gap: if heat crosses space or air without touching or a flowing fluid, it’s radiation.', 'Check the surface: dark and dull absorbs and gives off well; light and shiny reflects.', 'For greenhouses and cars, follow the energy: sunlight in, absorbed, warmth trapped.'],
    facts: ['Radiation: electromagnetic waves, mostly infrared; it needs no matter.', 'Sunlight crosses about 150 million km of space in about 8 minutes.', 'All objects give off infrared; hotter ones give off more.', 'Dark, dull: good absorbers and emitters. Light, shiny: good reflectors.'],
    watch: ['Thinking only hot things radiate: everything does, even ice, just much less.', 'Saying the Sun’s heat reaches us by convection: space has almost no matter to move.', 'Mixing up absorbing and reflecting: light and shiny reflect, dark and dull absorb.'],
    tip: 'If heat travels without touching and without a moving fluid, it’s radiation: waves that can even cross empty space.',
  },
  'Gases and the kinetic molecular theory': {
    idea: '<p>The <b>kinetic molecular theory</b> pictures a gas as tiny particles in <b>constant, random, straight-line motion</b>. They are <b>far apart</b> compared with their size (a gas is mostly empty space), they <b>collide elastically</b> (no kinetic energy is lost), and they barely <b>attract</b> each other. Their collisions with the walls of a container make its <b>pressure</b>, and the gas’s <b>temperature</b> is a measure of their <b>average kinetic energy</b>.</p><p>For gases, temperatures go in <b>kelvins</b>: <b>K = °C + 273</b>. <b>0 K</b> is <b>absolute zero</b>, about <b>−273 °C</b>, the coldest possible. Random motion makes gases spread out (<b>diffusion</b>). Warm a balloon and its particles speed up and push it bigger; cool a tire and its particles slow down, so its pressure drops.</p>',
    how: ['Explain with particles: are they moving faster or slower, and hitting the walls more or less?', 'More or harder collisions with the walls mean more pressure; fewer or softer ones mean less.', 'Convert to kelvins by adding 273; back to °C by subtracting 273.'],
    facts: ['K = °C + 273; °C = K − 273.', 'Absolute zero: 0 K, about −273 °C.', 'Water freezes at 273 K and boils at 373 K (at sea level).', 'Gas particles: far apart, constant random motion, elastic collisions, almost no attraction.'],
    watch: ['Thinking particles grow when heated: they speed up; their size stays the same.', 'Subtracting 273 to get kelvins: add it.', 'Writing °K: kelvins have no degree sign, just K.'],
    tip: 'Picture the particles: warmer means faster, and faster means harder, more frequent hits on the walls.',
  },
  'The gas laws': {
    idea: '<p>For a fixed amount of gas, its pressure (P), volume (V) and temperature (T) are linked. <b>Boyle’s law</b>: at constant temperature, <b>P × V stays the same</b> (P<sub>1</sub>V<sub>1</sub> = P<sub>2</sub>V<sub>2</sub>), so squeezing a gas into half the space doubles its pressure. <b>Charles’s law</b>: at constant pressure, <b>V ÷ T stays the same</b> (V<sub>1</sub>/T<sub>1</sub> = V<sub>2</sub>/T<sub>2</sub>). <b>Gay-Lussac’s law</b>: at constant volume, <b>P ÷ T stays the same</b> (P<sub>1</sub>/T<sub>1</sub> = P<sub>2</sub>/T<sub>2</sub>). The <b>combined gas law</b> puts them together: P<sub>1</sub>V<sub>1</sub>/T<sub>1</sub> = P<sub>2</sub>V<sub>2</sub>/T<sub>2</sub>.</p><p>Temperatures must be in <b>kelvins</b> (K = °C + 273). Pressures can be in kPa, atm or mmHg (<b>1 atm = 101.3 kPa = 760 mmHg</b>) and volumes in L or mL, as long as each pair uses the same unit. You can see the laws in a syringe, a bike pump and a diver’s rising bubbles (Boyle), a hot-air balloon (Charles), and an aerosol can that must be kept from heat (Gay-Lussac).</p>',
    how: ['Find what stays the same (temperature, pressure or volume) to choose the law.', 'Change every temperature to kelvins by adding 273.', 'Put in the numbers and solve for the unknown, keeping each pair of pressures or volumes in the same unit.', 'Check the direction: more pressure means less volume (Boyle); warmer means bigger (Charles) or a higher pressure (Gay-Lussac).'],
    facts: ['Boyle: P<sub>1</sub>V<sub>1</sub> = P<sub>2</sub>V<sub>2</sub> (constant T).', 'Charles: V<sub>1</sub>/T<sub>1</sub> = V<sub>2</sub>/T<sub>2</sub> (constant P).', 'Gay-Lussac: P<sub>1</sub>/T<sub>1</sub> = P<sub>2</sub>/T<sub>2</sub> (constant V).', 'Combined: P<sub>1</sub>V<sub>1</sub>/T<sub>1</sub> = P<sub>2</sub>V<sub>2</sub>/T<sub>2</sub>.', '1 atm = 101.3 kPa = 760 mmHg; 1 L = 1,000 mL.'],
    watch: ['Using °C in a gas law: always change temperatures to kelvins first.', 'Thinking pressure and volume rise together: in Boyle’s law, one goes up as the other goes down.', 'Mixing units: both pressures (or both volumes) must be in the same unit.'],
    tip: 'Ask what stays the same, change temperatures to kelvins, then check that the answer moves the right way.',
  },
};
const UNITS = [
  ['Heat and temperature', ['Temperature, thermal energy and heat', 'Specific heat capacity']],
  ['Earth materials', ['Heating and cooling of Earth materials']],
  ['How heat moves', ['Conduction', 'Convection', 'Radiation']],
  ['Gases', ['Gases and the kinetic molecular theory', 'The gas laws']],
];
export const energyLearning = { goal: 4, example: false, path: UNITS.map(([unit, topics]) => ({ unit, topics })), lessons };

// the panel beside the set's page: the formulas, the gas laws and the three ways heat moves, for checking while practising
export function energyAside() {
  const rows = (list) => list.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('');
  const box = document.createElement('div');
  box.innerHTML = `<div class="cols">
      <ul>
        <li><span class="f">Q = mcΔT</span>: Q is the heat (J), m the mass (g), c the specific heat capacity (J/(g·°C)) and ΔT the change in temperature (°C), final − starting.</li>
        <li>Specific heats, J/(g·°C): water 4.18, aluminum 0.90, sand 0.83, iron 0.45, copper 0.385.</li>
        <li><span class="f">K = °C + 273</span>, so °C = K − 273. Absolute zero is 0 K, about −273 °C.</li>
        <li>In every gas law the temperatures are in kelvins. 1 atm = 101.3 kPa = 760 mmHg; 1 L = 1,000 mL.</li>
      </ul>
      <table class="data words"><thead><tr><th>Gas law</th><th>Stays the same</th><th>Formula</th></tr></thead><tbody>${rows([
        ['Boyle’s', 'Temperature', 'P<sub>1</sub>V<sub>1</sub> = P<sub>2</sub>V<sub>2</sub>'],
        ['Charles’s', 'Pressure', 'V<sub>1</sub>/T<sub>1</sub> = V<sub>2</sub>/T<sub>2</sub>'],
        ['Gay-Lussac’s', 'Volume', 'P<sub>1</sub>/T<sub>1</sub> = P<sub>2</sub>/T<sub>2</sub>'],
        ['Combined', 'Only the amount of gas', 'P<sub>1</sub>V<sub>1</sub>/T<sub>1</sub> = P<sub>2</sub>V<sub>2</sub>/T<sub>2</sub>'],
      ])}</tbody></table>
    </div>
    <table class="data words" style="margin-top:14px"><thead><tr><th>Way</th><th>How it moves heat</th><th>Where</th><th>Example</th></tr></thead><tbody>${rows([
      ['Conduction', 'Particles collide and pass energy on, through touch', 'Solids best, metals most of all', 'A spoon’s handle in hot soup'],
      ['Convection', 'A warm fluid moves: warm rises, cool sinks', 'Liquids and gases', 'A pot of water, a room heater'],
      ['Radiation', 'Electromagnetic waves, mostly infrared', 'Anywhere, even empty space', 'The Sun warming Earth'],
    ])}</tbody></table>`;
  return box;
}
