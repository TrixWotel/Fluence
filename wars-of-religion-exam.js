// Tests like the ones in class for the Wars of Religion, three questions each: 1. key words, people and dates, 2. a source
// to read and question, and 3. an extended answer that explains causes or results. The sources are made up for these
// tests, in the style of the time, and each says so; every fact in them and in the mark schemes is the usual one in
// school histories. kit/exam-kit.js says what a question and its parts are.
import { examBank } from '../kit/exam-kit.js';
import { num } from '../kit/bank.js';
import { TOPICS } from './wars-of-religion-data.js';

const TIMELINE = TOPICS.flatMap((t) => t.events.map((e) => ({ ...e, topic: t.name })));
const PLACES = ['1st', '2nd', '3rd', '4th', '5th'];
const ordinal = (n) => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');
const century = (y) => Math.floor((y - 1) / 100) + 1;
// four events at least this far apart: from a list in order, so there are always enough
function spread(d, gap = 15) {
  const out = [];
  for (const e of TIMELINE.slice().sort((a, b) => a.y - b.y)) if (!out.length || e.y - out.at(-1).y >= gap) out.push(e);
  return d.shuffle(out).slice(0, 4);
}
const sourceBox = (who, text) => `<p><b>Source A</b></p><blockquote class="source"><p>${text}</p><footer>${who}</footer></blockquote>`;
const MADE_UP = '<p class="muted small">Source A was written for this test, in the style of the time. It is not a real document.</p>';

// ---------- 1. key words, people and dates ----------
function keyWords(d) {
  const topics = d.shuffle(TOPICS), pairs = topics.map((t) => d.pick(t.pairs));
  const meanings = d.shuffle(pairs.map((p) => p[1]));
  const events = spread(d), sorted = events.slice().sort((a, b) => a.y - b.y);
  const t = d.pick(TOPICS), [q, right, wrong, why] = d.pick(t.facts);
  const choices = d.shuffle([right, ...d.shuffle(wrong).slice(0, 3)]);
  return {
    title: 'Key words, people and dates',
    intro: '<p>Show what you know about the people, places and ideas of the Wars of Religion, and when things happened.</p>',
    parts: [
      { kind: 'select', ask: 'Match each one to what it was.', fields: pairs.map((p) => ({ label: p[0], options: meanings, correct: meanings.indexOf(p[1]) })),
        working: pairs.map((p) => `${p[0]}: ${p[1]}.`).join(' ') },
      { kind: 'select', ask: 'Put these events in order: choose 1st for the earliest.', fields: events.map((e) => ({ label: e.label, options: PLACES.slice(0, 4), correct: sorted.indexOf(e) })),
        working: `In order: ${sorted.map((e) => `${e.label} (${e.y})`).join(', ')}.` },
      { kind: 'number', ask: `How many years passed between these two events? ${sorted[0].label} (${sorted[0].y}) and ${sorted[3].label} (${sorted[3].y}).`, value: sorted[3].y - sorted[0].y, unit: 'years', tol: { abs: 0 },
        working: `${sorted[3].y} − ${sorted[0].y} = ${num(sorted[3].y - sorted[0].y)} years.` },
      { kind: 'choice', ask: q, choices, correct: choices.indexOf(right), topic: t.name, working: why },
    ],
  };
}
// the timeline: four events placed in their centuries, the gap between two of them, and which stage one belongs to
function timeline(d) {
  const stageOf = (x) => (x.y < 1562 ? 0 : x.y < 1618 ? 1 : 2), STAGES = ['The first split: 1517 to 1561', 'France, the Netherlands and Bohemia: 1562 to 1617', 'The Thirty Years’ War and its end: 1618 to 1648'];
  const events = spread(d), options = [15, 16, 17, 18].map((c) => `${ordinal(c)} century`);
  const [a, b] = d.shuffle(events).slice(0, 2).sort((x, y) => x.y - y.y);
  const e = d.pick(events), stage = stageOf(e), same = TIMELINE.filter((x) => x.y !== e.y && stageOf(x) === stage);
  return {
    title: 'The timeline',
    intro: '<p>The Wars of Religion can be split into three stages: <b>the first split</b> (1517 to 1561), <b>France, the Netherlands and Bohemia</b> (1562 to 1617), and <b>the Thirty Years’ War and its end</b> (1618 to 1648).</p>',
    parts: [
      { kind: 'select', ask: 'In which century did each of these happen?', fields: events.map((x) => ({ label: `${x.label} (${x.y})`, options, correct: options.indexOf(`${ordinal(century(x.y))} century`) })),
        working: events.map((x) => `${x.y} is in the ${ordinal(century(x.y))} century (its hundreds plus one).`).join(' ') },
      { kind: 'number', ask: `How many years after “${a.label}” (${a.y}) came “${b.label}” (${b.y})?`, value: b.y - a.y, unit: 'years', tol: { abs: 0 },
        working: `${b.y} − ${a.y} = ${num(b.y - a.y)} years.` },
      { kind: 'choice', ask: `In which stage was “${e.label}” (${e.y})?`, choices: STAGES, correct: stage, topic: e.topic,
        explain: { ask: 'Name one other event from the same stage, with its date.', lines: 2, marks: 1,
          points: [`Any event from the same stage with roughly the right date, for example ${same.slice(0, 2).map((x) => `${x.label.replace(/^The /, 'the ')} (${x.y})`).join(' or ')}`],
          model: `For example: ${same[0].label} (${same[0].y}).` },
        working: `${e.y} falls in “${STAGES[stage]}”.` },
    ],
  };
}

// ---------- 2. a source ----------
function source({ title, topic, who, text, about, aboutWrong, kind, kindWrong, details, useful, model, context }) {
  return (d) => {
    const ab = d.shuffle([about, ...aboutWrong]), ki = d.shuffle([kind, ...kindWrong]);
    return {
      title, intro: `${sourceBox(who, text)}${MADE_UP}`,
      parts: [
        { kind: 'choice', ask: 'Which event is Source A about?', choices: ab, correct: ab.indexOf(about), topic },
        { kind: 'select', ask: 'What kind of source is it?', fields: [{ label: 'Source A is', options: ki, correct: ki.indexOf(kind) }] },
        { kind: 'written', ask: `What can you learn from Source A about ${details.what}? Use <b>two</b> details from the source.`, lines: 4, topic,
          points: details.points, model: details.model, notes: ['Copying the source without saying what it shows earns no marks.'] },
        { kind: 'written', ask: 'Use what you know to explain <b>one</b> thing that was happening at the time of Source A.', lines: 4, topic, marks: 2,
          points: context.points, model: context.model },
        { kind: 'written', ask: `How useful is Source A to a historian studying ${useful}? Think about who wrote it, when, and why.`, lines: 5, topic, marks: 3,
          points: ['Says what the source is useful for, with a detail from it', 'Uses who wrote it, or when, to judge it (an eyewitness, or someone who heard about it later)', 'Says a limit: what it leaves out, or why the writer might be one-sided or exaggerate'],
          model, notes: ['“It is useful because it is a primary source” on its own earns no mark: say why that matters here.'] },
      ],
    };
  };
}
const PRIMARY = 'A primary source: written at the time', NOT_PRIMARY = ['A secondary source: written much later by a historian', 'A law made by a king'];
const SOURCES = [
  source({
    title: 'A letter from Paris', topic: 'The St. Bartholomew’s Day Massacre',
    who: 'A Huguenot gentleman writing to his brother from outside Paris, September 1572',
    text: 'We came to Paris for a wedding, brother, and we were told it would end our troubles. The king himself called the Admiral his friend. Then in the dark before dawn the bells rang, and men who had drunk with us that week came to our doors. I got away over the river with only the coat I wore. Do not believe any promise made to you by the court, and do not come to any town where you are not known.',
    about: 'The St. Bartholomew’s Day Massacre', aboutWrong: ['The Defenestration of Prague', 'The sack of Magdeburg', 'The signing of the Edict of Nantes'],
    kind: PRIMARY, kindWrong: NOT_PRIMARY,
    details: { what: 'how the massacre affected the Huguenots', points: ['They had come for a wedding, hoping for peace', 'It was a shock: it came suddenly at night, from people they knew', 'Survivors fled, losing what they had', 'They stopped trusting the king and the court'], model: 'The writer had come to Paris for a wedding that was meant to end the troubles, so the killing was a shock, coming before dawn from men he knew. He also says not to believe the court’s promises, which shows Huguenots no longer trusted the crown.' },
    context: { points: ['The French Wars of Religion had been going on since 1562, and the wedding of Henry of Navarre and Margaret of Valois was meant to bring peace', 'Admiral Coligny had been shot and wounded days before'], model: 'Catholics and Huguenots had been at war since 1562. The wedding of Protestant Henry of Navarre to the Catholic king’s sister was meant to bring peace, which is why so many Huguenots were in Paris.' },
    useful: 'how Huguenots felt after the massacre',
    model: 'It is useful because a survivor wrote it weeks after the event, so it shows the shock and the loss of trust among Huguenots, as when he warns against the court’s promises. But he is a victim writing to his family, so he only knows what he saw, and he doesn’t tell us who gave the orders or how Catholics saw it.',
  }),
  source({
    title: 'News from Prague', topic: 'The Defenestration of Prague',
    who: 'A Protestant pamphlet printed in Germany, a few years after 1618',
    text: 'Good people, hear how the proud lords of Prague were answered! When the Estates of Bohemia came to ask why our churches were shut, in spite of the Letter of His Majesty, those two councillors gave them only insults. So out of the window they went, and their clerk after them, down from the castle. They were not killed, and some Papists cry a miracle. But it was no angel that caught them, friends. It was the castle’s own dunghill, a fit bed for such men.',
    about: 'The Defenestration of Prague', aboutWrong: ['The St. Bartholomew’s Day Massacre', 'The Battle of White Mountain', 'The Peace of Westphalia'],
    kind: PRIMARY, kindWrong: NOT_PRIMARY,
    details: { what: 'why the Defenestration happened', points: ['Protestants were angry that their churches were shut', 'They believed the Letter of Majesty protected them', 'They felt the councillors had insulted them', 'Catholics and Protestants explained the survival differently'], model: 'The Protestants were angry that churches had been shut despite the Letter of Majesty, which they thought protected them. The pamphlet also says the councillors answered them with insults, so it shows they felt they had no other way to be heard.' },
    context: { points: ['Ferdinand of Styria, a strict Catholic, had been named the next king of Bohemia', 'The Defenestration began a Bohemian revolt that grew into the Thirty Years’ War'], model: 'Ferdinand of Styria, a strict Catholic, had been named the next king of Bohemia, so Protestants feared losing their rights. After the Defenestration they set up their own government, and the revolt grew into the Thirty Years’ War.' },
    useful: 'the Defenestration of Prague',
    model: 'It is useful because it was printed within a few years and shows how Protestants justified the attack, using the Letter of Majesty as their reason. But it is propaganda: it mocks the victims, so the dunghill story may be a joke, and it gives no Catholic side. It is more useful for what Protestants wanted people to think than for what exactly happened.',
  }),
  source({
    title: 'The soldiers come', topic: 'The Thirty Years’ War',
    who: 'A village priest in southern Germany writing in his parish book, 1634',
    text: 'This year the soldiers came three times, and I can no longer say whose they were: the Swedes, the Emperor’s, and some who served whoever fed them. They took the grain and the cattle, and what they could not carry they burned. Then came the sickness. I buried more in this one summer than in all my years before. Of the sixty households in my care, not twenty have fires lit tonight. The fields lie empty, and no one asks any longer who holds the true faith.',
    about: 'The Thirty Years’ War', aboutWrong: ['The French Wars of Religion', 'The Dutch Revolt', 'The Peasants’ Revolt of 1381'],
    kind: PRIMARY, kindWrong: NOT_PRIMARY,
    details: { what: 'what the war did to ordinary people', points: ['Armies from every side took their food and animals', 'Sickness followed the armies and killed many', 'The village lost most of its households', 'People stopped caring about which side was right about faith'], model: 'Armies from both sides took the village’s grain and cattle, and burned the rest, so people had nothing to eat. Then sickness came, and the priest says that of sixty households fewer than twenty are left, so the war emptied whole villages.' },
    context: { points: ['Armies fed themselves from the land they crossed, as Wallenstein’s did', 'By the 1630s Sweden had joined the war, and it had become more about power than faith'], model: 'Armies of the time, like Wallenstein’s, fed themselves by taking food from the land they crossed. By 1634 Sweden had been fighting in Germany for four years, so the same villages were stripped again and again.' },
    useful: 'how the war affected ordinary people',
    model: 'It is useful because a priest who buried the dead wrote it during the war, so he knows the numbers in his parish and shows hunger and disease killing more than battles. But it shows only one village, and a grieving writer may exaggerate, so a historian would need other records to know whether all of Germany suffered like this.',
  }),
  source({
    title: 'A letter from Münster', topic: 'The Peace of Westphalia',
    who: 'A clerk with one of the delegations at Münster, writing home in 1647',
    text: 'We have been here three years, and we have spent the first of them arguing over who should walk through a door ahead of whom. The Swedes sit at Osnabrück with the Protestants, and we send riders back and forth over the road all day. Every prince in Germany, it seems, has sent his man, and each wants his own lands to be his own to rule, with no emperor to tell him otherwise. They say there will be peace by next year. They said so last year too.',
    about: 'The talks for the Peace of Westphalia', aboutWrong: ['The Peace of Augsburg', 'The Edict of Nantes', 'The wedding of Henry of Navarre'],
    kind: PRIMARY, kindWrong: NOT_PRIMARY,
    details: { what: 'the talks for the peace', points: ['The talks were very slow and took years', 'Delegates argued over rank and who went first', 'Catholics and Protestants met in separate towns, with riders between', 'The German princes wanted to rule their own lands'], model: 'The talks were very slow: after three years people were still only promising peace “by next year”, and they had argued over who went through a door first. The two sides sat in different towns, with riders going between them.' },
    context: { points: ['The war had been going on since 1618, and all sides were worn out', 'The treaties of 1648 ended the war, and let German states run more of their own affairs'], model: 'The war had been going on since 1618 and all sides were exhausted. The treaties signed in 1648 ended it and, as the clerk says the princes wanted, gave the German states much more control of their own affairs.' },
    useful: 'how the Peace of Westphalia was made',
    model: 'It is useful because a clerk who was there describes how slow the talks were and what the princes wanted. But he is a junior man writing a grumbling letter, so he may exaggerate the arguing, and he wouldn’t know what the leaders were deciding in private.',
  }),
];

// ---------- 3. an extended answer ----------
const explain = ({ title, topic, ask, intro, points, model }) => () => ({
  title, intro: `<p>${intro}</p>`,
  parts: [{ kind: 'written', ask, lines: 10, topic, marks: 6, points, model,
    notes: ['A list of facts with no explaining earns at most 2 marks: say how each one led to the result.', 'Each reason needs a fact (a name, a date, an example) to back it up.'] }],
});
const EXPLAINS = [
  explain({ title: 'More than faith', topic: 'The Wars of Religion', intro: 'They are called the Wars of Religion, but many historians say they were about more than religion.',
    ask: 'Explain <b>two</b> reasons why the Wars of Religion were about more than religion.',
    points: ['Names a first reason (rulers wanting land and power, France fighting the Habsburgs, Dutch anger at Spanish rule and taxes, nobles fighting for control of France)', 'Backs it with a fact or example', 'Explains how it shows more than faith was involved', 'Names a second, different reason', 'Backs it with a fact or example', 'Explains how it shows more than faith was involved'],
    model: 'First, rulers fought for power. Catholic France, under Cardinal Richelieu, paid Protestant Sweden and joined the Thirty Years’ War in 1635 to weaken the Habsburgs, so a Catholic power helped Protestants beat Catholics. Second, the Dutch Revolt of 1568 was also about being ruled from Spain: Philip II’s taxes and his control angered the Dutch as well as his attacks on Protestants, so they were fighting for self-rule too.' }),
  explain({ title: 'Paris, 1572', topic: 'The St. Bartholomew’s Day Massacre', intro: 'In August 1572 thousands of French Protestants were killed, starting in Paris.',
    ask: 'Explain <b>two</b> reasons why the St. Bartholomew’s Day Massacre happened.',
    points: ['Names a first reason (a decade of war between Catholics and Huguenots, Huguenot nobles gathered in Paris for the wedding, the failed shot at Coligny, fear of a Huguenot revenge, Paris’s fiercely Catholic crowds)', 'Backs it with a fact or example', 'Explains how it led to the killing', 'Names a second, different reason', 'Backs it with a fact or example', 'Explains how it led to the killing'],
    model: 'First, France had been split by war since 1562, so hatred and fear ran deep, and Paris’s crowds were fiercely Catholic. When the court ordered the Huguenot leaders killed, those crowds spread the killing far wider. Second, the failed attempt to kill Admiral Coligny on August 22 left the court afraid of Huguenot revenge, with many armed Huguenot nobles in the city for Henry of Navarre’s wedding. Killing the leaders before they could act may have seemed the way out, though historians still argue over who decided it.' }),
  explain({ title: 'From a window to a war', topic: 'The Defenestration of Prague', intro: 'In 1618 Protestant nobles threw two Catholic officials out of a window in Prague. All of them survived.',
    ask: 'Explain <b>two</b> reasons why this event led to a much bigger war.',
    points: ['Names a first reason (it was open rebellion against the Habsburgs, the rebels chose Frederick V as king, tensions already existed between Catholics and Protestants, other powers joined for their own reasons)', 'Backs it with a fact or example', 'Explains how it made the war bigger', 'Names a second, different reason', 'Backs it with a fact or example', 'Explains how it made the war bigger'],
    model: 'First, it was open rebellion against the Habsburgs. The rebels set up their own government and in 1619 chose Frederick V as king in place of Ferdinand, so the emperor could not back down without losing Bohemia. Second, other powers joined for their own reasons: Denmark in 1625 and Sweden in 1630 came in to protect Protestants and gain power in Germany, and France later came in to weaken the Habsburgs, so a local revolt became a European war.' }),
  explain({ title: 'Thirty years', topic: 'The Thirty Years’ War', intro: 'The war began in 1618 and did not end until 1648.',
    ask: 'Explain <b>two</b> reasons why the Thirty Years’ War lasted so long.',
    points: ['Names a first reason (new powers kept joining, no side could win outright, armies fed themselves from the land, deep mistrust between faiths, peace talks were slow)', 'Backs it with a fact or example', 'Explains how it kept the war going', 'Names a second, different reason', 'Backs it with a fact or example', 'Explains how it kept the war going'],
    model: 'First, new powers kept joining just as one side seemed to be winning. After the Catholics beat Denmark, Gustavus Adolphus of Sweden landed in 1630, and when Sweden weakened after his death France joined in 1635. Second, armies like Wallenstein’s fed themselves from the land they crossed, so rulers could keep fighting even without money. The war paid for itself while ordinary people starved, so there was less pressure to stop.' }),
  explain({ title: 'After 1648', topic: 'The Peace of Westphalia', intro: 'The Peace of Westphalia ended the Thirty Years’ War in 1648.',
    ask: 'Explain <b>two</b> ways the Peace of Westphalia changed Europe.',
    points: ['Names a first change (a weaker emperor and stronger German states, Calvinism recognized, Dutch and Swiss independence, France and Sweden stronger, the idea of sovereignty)', 'Backs it with a fact or example', 'Explains why it mattered', 'Names a second, different change', 'Backs it with a fact or example', 'Explains why it mattered'],
    model: 'First, it weakened the Holy Roman Emperor. The 300 or so German states could now make their own alliances, which left Germany divided for two more centuries and made it harder for the Habsburgs to dominate Europe. Second, it changed the balance of power: France gained parts of Alsace and Sweden gained land on the Baltic coast of Germany, so France became the strongest power in western Europe. It also recognized the Dutch Republic and Switzerland as independent.' }),
];

export const warsExam = examBank('wars-exam', {
  title: 'The Wars of Religion', minutes: 40,
  slots: [
    [keyWords, timeline],   // 1. key words, people and dates
    SOURCES,                // 2. a source
    EXPLAINS,               // 3. an extended answer
  ],
});
