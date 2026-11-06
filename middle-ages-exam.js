// Tests like the ones in class for the Middle Ages, three questions each: 1. key words, people and dates (match them,
// put events in order, work out the years between), 2. a source to read and question, and 3. an extended answer that
// explains causes or results. The sources are made up for these tests, in the style of the time, and each says so;
// every fact in them and in the mark schemes is the usual one in school histories. kit/exam-kit.js says what a
// question and its parts are.
import { examBank } from '../kit/exam-kit.js';
import { num } from '../kit/bank.js';
import { TOPICS } from './middle-ages-data.js';

const TIMELINE = TOPICS.flatMap((t) => t.events.map((e) => ({ ...e, topic: t.name })));
const PLACES = ['1st', '2nd', '3rd', '4th', '5th'];
const ordinal = (n) => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');
const century = (y) => Math.floor((y - 1) / 100) + 1;
// events at least `gap` years apart
function spread(d, count, gap) {
  const out = [];
  for (const e of d.shuffle(TIMELINE)) if (out.length < count && out.every((p) => Math.abs(p.y - e.y) >= gap)) out.push(e);
  return out;
}
const sourceBox = (who, text) => `<p><b>Source A</b></p><blockquote class="source"><p>${text}</p><footer>${who}</footer></blockquote>`;
const MADE_UP = '<p class="muted small">Source A was written for this test, in the style of the time. It is not a real document.</p>';

// ---------- 1. key words, people and dates ----------
// five people, places or words from five different topics, each matched to what it was; four events put in order; and
// one fact question
function keyWords(d) {
  const topics = d.shuffle(TOPICS).slice(0, 5), pairs = topics.map((t) => [d.pick(t.pairs), t.name]);
  const meanings = d.shuffle(pairs.map(([p]) => p[1]));
  const events = spread(d, 4, 30), sorted = events.slice().sort((a, b) => a.y - b.y);
  const t = d.pick(TOPICS), [q, right, wrong, why] = d.pick(t.facts);
  const choices = d.shuffle([right, ...d.shuffle(wrong).slice(0, 3)]);
  return {
    title: 'Key words, people and dates',
    intro: '<p>Show what you know about the people, places and ideas of the Middle Ages, and when things happened.</p>',
    parts: [
      { kind: 'select', ask: 'Match each one to what it was.', fields: pairs.map(([p, topic]) => ({ label: p[0], options: meanings, correct: meanings.indexOf(p[1]) })),
        working: pairs.map(([p]) => `${p[0]}: ${p[1]}.`).join(' ') },
      { kind: 'select', ask: 'Put these events in order: choose 1st for the earliest.', fields: events.map((e) => ({ label: e.label, options: PLACES.slice(0, 4), correct: sorted.indexOf(e) })),
        working: `In order: ${sorted.map((e) => `${e.label} (${e.y})`).join(', ')}.` },
      { kind: 'number', ask: `How many years passed between these two events? ${sorted[0].label} (${sorted[0].y}) and ${sorted[3].label} (${sorted[3].y}).`, value: sorted[3].y - sorted[0].y, unit: 'years', tol: { abs: 0 },
        working: `${sorted[3].y} − ${sorted[0].y} = ${num(sorted[3].y - sorted[0].y)} years.` },
      { kind: 'choice', ask: q, choices, correct: choices.indexOf(right), topic: t.name, working: why },
    ],
  };
}
// the timeline: four events placed in their centuries, the gap between two of them, and which part of the Middle Ages
// one belongs to
function timeline(d) {
  const partOf = (x) => (x.y < 1000 ? 0 : x.y < 1300 ? 1 : 2), SPANS = ['476 to 1000', '1000 to 1300', '1300 to 1500'];
  const events = spread(d, 4, 60), options = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((c) => `${ordinal(c)} century`);
  const [a, b] = d.shuffle(events).slice(0, 2).sort((x, y) => x.y - y.y);
  const e = d.pick(events), part = partOf(e), same = TIMELINE.filter((x) => x.y !== e.y && partOf(x) === part);
  return {
    title: 'The timeline',
    intro: '<p>Historians split the Middle Ages into the <b>Early</b> (about 476 to 1000), <b>High</b> (about 1000 to 1300) and <b>Late</b> (about 1300 to 1500) Middle Ages.</p>',
    parts: [
      { kind: 'select', ask: 'In which century did each of these happen?', fields: events.map((x) => ({ label: `${x.label} (${x.y})`, options, correct: options.indexOf(`${ordinal(century(x.y))} century`) })),
        working: events.map((x) => `${x.y} is in the ${ordinal(century(x.y))} century (its hundreds plus one).`).join(' ') },
      { kind: 'number', ask: `How many years after “${a.label}” (${a.y}) came “${b.label}” (${b.y})?`, value: b.y - a.y, unit: 'years', tol: { abs: 0 },
        working: `${b.y} − ${a.y} = ${num(b.y - a.y)} years.` },
      { kind: 'choice', ask: `In which part of the Middle Ages was “${e.label}” (${e.y})?`, choices: ['The Early Middle Ages', 'The High Middle Ages', 'The Late Middle Ages'], correct: part, topic: e.topic,
        explain: { ask: 'Name one other event from the same part of the Middle Ages, with its date.', lines: 2, marks: 1,
          points: [`Any event from ${SPANS[part]} with roughly the right date, for example ${same.slice(0, 2).map((x) => `${x.label.replace(/^The /, 'the ')} (${x.y})`).join(' or ')}`],
          model: `For example: ${same[0].label} (${same[0].y}).` },
        working: `${e.y} falls between ${SPANS[part].replace(' to ', ' and ')}.` },
    ],
  };
}

// ---------- 2. a source ----------
// each source: who it's from, its words, what it's about, and the questions on it
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
const SOURCES = [
  source({
    title: 'A raid from the sea', topic: 'The Vikings',
    who: 'A monk writing in his monastery’s chronicle, about 795',
    text: 'In this year, in the month of June, ships came out of the north sea with sails we had never seen. Heathen men leapt onto the sands below our church. They broke down the doors, carried off the gold of the altar and the silver cups, and took some of our young brothers away in their boats. Those who ran were cut down. No one had thought such ships could cross the open sea. Surely this is a punishment for our sins.',
    about: 'A Viking raid on a monastery', aboutWrong: ['The Norman Conquest', 'The Black Death', 'A crusade to Jerusalem'],
    kind: 'A primary source: written at the time', kindWrong: ['A secondary source: written much later by a historian', 'A law made by a king'],
    details: { what: 'Viking raids', points: ['They came by ship, from the sea and from the north', 'They took treasure: gold and silver from the church', 'They took people captive, or killed those who ran', 'Monasteries were targets, and the attack came as a shock'], model: 'The raiders came by sea from the north, which shocked the monks. They went for the church’s riches, gold from the altar and silver cups, and they carried off young monks as captives.' },
    context: { points: ['The Vikings from Scandinavia had begun raiding Britain (Lindisfarne, 793)', 'Monasteries were rich, near the coast and undefended, so they were easy targets'], model: 'Vikings from Scandinavia had just started raiding the coasts, beginning with Lindisfarne in 793. Monasteries were rich and undefended, so they were raided first.' },
    useful: 'Viking raids',
    model: 'It is useful because it was written by a monk soon after a raid, so it shows how frightening the raids were and what the Vikings took (gold, silver and captives). But the monk was a victim and a Christian who called the raiders heathens, so he may exaggerate their cruelty, and it doesn’t tell us that Vikings also traded and settled.',
  }),
  source({
    title: 'The great death', topic: 'The Black Death',
    who: 'A town clerk’s record, written in 1349',
    text: 'The sickness came to our town in the summer, brought by a ship from the south. It begins with swellings under the arm or in the groin, as big as an egg, and black spots on the skin. Most who catch it die within three days. The priests are dying faster than they can bury the dead, and we have dug great pits outside the walls. Of the forty men who worked in the fields of the lord last spring, only fifteen are left, and these now ask twice the old wage before they will bring in the harvest.',
    about: 'The Black Death', aboutWrong: ['The Hundred Years’ War', 'The Peasants’ Revolt', 'The Viking raids'],
    kind: 'A primary source: written at the time', kindWrong: ['A secondary source: written much later by a historian', 'A song about a battle'],
    details: { what: 'the effects of the Black Death', points: ['Very many died, and quickly (most within three days)', 'There were too many dead to bury properly: mass pits', 'Workers were scarce (forty men down to fifteen)', 'Surviving workers asked for higher wages'], model: 'It killed very many people quickly, so many that they were buried in pits. So few workers were left (fifteen of forty) that the survivors asked for twice the old wage.' },
    context: { points: ['The Black Death reached Europe in 1347 along trade routes and killed perhaps a third of the people', 'With workers scarce, wages rose, and lords and kings tried to hold them down (leading to the Peasants’ Revolt of 1381)'], model: 'The plague arrived in 1347 on ships and trade routes and killed around a third of Europe. With so few workers left, wages rose, and the laws to keep them down led to anger and the Peasants’ Revolt of 1381.' },
    useful: 'the effects of the Black Death',
    model: 'It is useful because a clerk wrote it in 1349, during the plague, and gives exact details like the symptoms and the fall from forty workers to fifteen. But it describes only one town, and a clerk working for the town or the lord might see the workers’ demands as greedy, so it shows one side.',
  }),
  source({
    title: 'What the rebels want', topic: 'The Black Death',
    who: 'A list of demands said to be made by rebels to the young King Richard II, 1381',
    text: 'We ask that no man be a serf, nor owe labor to any lord, but that every man pay a fair rent for his land in money. We ask that no tax be taken from the poor man the same as from the rich, as this new tax on every head has been. We ask that a man may work for whoever pays him, at a fair wage, and not be held to the old wage by law. These things we ask of our king, whom we love, and not of his evil counsellors, who have robbed the land.',
    about: 'The Peasants’ Revolt', aboutWrong: ['Magna Carta', 'The Great Schism', 'The Battle of Hastings'],
    kind: 'A primary source: written at the time', kindWrong: ['A secondary source: written much later by a historian', 'A charter sealed by the king'],
    details: { what: 'why the peasants rebelled', points: ['They wanted an end to serfdom', 'They were angry about the poll tax, the same for rich and poor', 'They wanted to be free to work for higher wages, not held to the old wage', 'They blamed the king’s advisers, not the king'], model: 'The rebels wanted an end to serfdom, and they hated the new tax that charged the poor the same as the rich. They also wanted to work for fair wages instead of the old ones fixed by law, and they blamed the king’s advisers rather than the king.' },
    context: { points: ['After the Black Death workers were scarce, but laws tried to keep wages at the old level', 'A poll tax in 1381 set off the revolt, led by Wat Tyler, which marched on London'], model: 'After the Black Death workers could ask for more, but laws held wages down. Then a poll tax in 1381 set off the revolt, and Wat Tyler led the rebels to London.' },
    useful: 'the Peasants’ Revolt',
    model: 'It is useful because it gives the rebels’ own reasons: serfdom, the poll tax and wages. But it is “said to be” their demands, so it may have been written down by someone else, perhaps a chronicler who wanted to make them look reasonable or dangerous, and it doesn’t tell us how the revolt ended.',
  }),
  source({
    title: 'The barons and the king', topic: 'Magna Carta and the power of kings',
    who: 'A letter from an English baron to his brother, written in 1215',
    text: 'The king takes our money for his wars across the sea, and loses them, and then takes more. He fines a man as he pleases and seizes his lands without any judgment. Now we have gathered with our armies, and he has come to meet us at the meadow by the river. He has set his seal on a charter: that he will take no free man’s land nor throw him in prison except by the lawful judgment of his equals or by the law of the land. Whether he will keep his word, God knows.',
    about: 'Magna Carta', aboutWrong: ['The Domesday Book', 'The Model Parliament', 'The Great Schism'],
    kind: 'A primary source: written at the time', kindWrong: ['A secondary source: written much later by a historian', 'A page from the Domesday Book'],
    details: { what: 'why Magna Carta was made', points: ['The king taxed the barons for wars and lost them', 'He fined people and took land without any judgment (ignoring the law)', 'The barons gathered armies to force him', 'The charter promised no free man punished except by law'], model: 'The barons were angry that the king took their money for wars he lost and punished people without trial. They raised armies, and the charter he sealed promised that no free man would lose his land or freedom except by the law.' },
    context: { points: ['King John had lost Normandy and taxed heavily to win it back', 'Magna Carta was sealed at Runnymede in 1215, putting the king under the law'], model: 'King John had lost Normandy to the French king and taxed the barons heavily to try to win it back. In 1215 they forced him to seal Magna Carta at Runnymede.' },
    useful: 'why Magna Carta was made',
    model: 'It is useful because a baron wrote it in 1215, so it shows the barons’ own complaints about taxes and unfair punishment. But a baron was one of the king’s enemies, so it is one-sided, and it shows only what the barons gained, not ordinary people.',
  }),
  source({
    title: 'At the walls of the city', topic: 'The end of the Middle Ages',
    who: 'An account by a merchant who escaped the city by ship, written soon after 1453',
    text: 'For fifty days the sultan’s great guns, the like of which no man had seen, beat upon the walls that had stood a thousand years. Each night our people rebuilt what the stones had broken in the day. But at last, before dawn, his soldiers came through a breach, and the city that had been the heart of the empire of the Romans was taken. I reached a ship in the harbor with nothing but my life.',
    about: 'The fall of Constantinople', aboutWrong: ['The end of the Western Roman Empire', 'The First Crusade', 'The fall of Granada'],
    kind: 'A primary source: written at the time', kindWrong: ['A secondary source: written much later by a historian', 'An Ottoman government record'],
    details: { what: 'how the city fell', points: ['The sultan used huge cannons (great guns) never seen before', 'The siege lasted many days (about fifty)', 'The defenders kept rebuilding the walls', 'The attackers broke in through a gap in the walls'], model: 'The sultan’s new giant cannons pounded the ancient walls for about fifty days. The defenders rebuilt them each night, but in the end the attackers broke in through a breach.' },
    context: { points: ['The Ottoman Turks under Mehmed II took Constantinople in 1453, ending the Byzantine (Eastern Roman) Empire', 'Cannons could now break old walls, one of the changes that ended the Middle Ages'], model: 'In 1453 the Ottoman sultan Mehmed II captured Constantinople, ending the Byzantine Empire that had lasted since Roman times, and made it his capital, Istanbul.' },
    useful: 'the fall of Constantinople',
    model: 'It is useful because the merchant was there and describes the cannons, the length of the siege and the final attack. But he fled by ship, so he may not have seen the end himself, and as a defender who lost everything he tells only one side, not the Ottomans’.',
  }),
];

// ---------- 3. explaining ----------
const explain = ({ title, topic, ask, intro, points, model }) => () => ({
  title, intro: `<p>${intro}</p>`,
  parts: [{ kind: 'written', ask, lines: 10, topic, marks: 6, points, model,
    notes: ['A list of facts with no explaining earns at most 2 marks: say how each one led to the result.', 'Each reason needs a fact (a name, a date, an example) to back it up.'] }],
});
const EXPLAINS = [
  explain({ title: 'The fall of the West', topic: 'The fall of Rome and the Byzantine Empire', intro: 'In 476 the last emperor of the Western Roman Empire was removed. The Eastern half lasted almost a thousand years more.',
    ask: 'Explain <b>two</b> reasons why the Western Roman Empire fell.',
    points: ['Names a first reason (civil wars, money troubles, Germanic peoples moving in, a huge empire hard to defend)', 'Backs it with a fact or example', 'Explains how it weakened the empire', 'Names a second, different reason', 'Backs it with a fact or example', 'Explains how it weakened the empire, or links the two reasons'],
    model: 'One reason was civil war: generals fought each other for the throne, so armies were busy fighting Romans instead of guarding the borders. A second was money: the empire was expensive to defend, so taxes rose and the economy weakened, and Rome came to depend on Germanic soldiers. When Germanic peoples settled inside the borders, their leaders became powerful, and in 476 one of them, Odoacer, removed the last emperor.' }),
  explain({ title: 'Charlemagne', topic: 'The Franks and Charlemagne', intro: 'Charlemagne was crowned emperor in Rome on Christmas Day, 800.',
    ask: 'Explain <b>two</b> ways Charlemagne changed western Europe.',
    points: ['Names a first change (conquests uniting much of western Europe, his crowning as emperor, learning and schools)', 'Backs it with a fact or example', 'Explains why it mattered', 'Names a second, different change', 'Backs it with a fact or example', 'Explains why it mattered'],
    model: 'First, he conquered much of western Europe, joining lands that became France, Germany and northern Italy into one empire, and in 800 the pope crowned him emperor, the first in the West since 476. This joined the Church and the emperor closely together. Second, he encouraged learning: he brought scholars like Alcuin to his court, set up schools and had old books copied in a clear new script, so ancient knowledge was kept.' }),
  explain({ title: 'Holding England', topic: 'The Norman Conquest', intro: 'In 1066 William of Normandy beat King Harold at the Battle of Hastings.',
    ask: 'Explain <b>two</b> ways William kept control of England after 1066.',
    points: ['Names a first method (castles, land to Norman lords, the Domesday Book, crushing rebellions)', 'Backs it with a fact or example', 'Explains how it kept him in control', 'Names a second, different method', 'Backs it with a fact or example', 'Explains how it kept him in control'],
    model: 'First, he built castles, quick motte-and-bailey ones at first, so a few Norman soldiers could control the land and hide from attack. Second, he took land from English lords and gave it to his Norman followers in return for loyalty and knights, so the most powerful people owed everything to him. The Domesday Book in 1086 then told him exactly what everyone held and could be taxed.' }),
  explain({ title: 'The Crusades', topic: 'The Crusades', intro: 'In 1095 Pope Urban II called the First Crusade.',
    ask: 'Explain <b>two</b> results of the Crusades.',
    points: ['Names a first result (more trade, new goods and ideas, a weaker Byzantine Empire, more power for popes, bitterness between faiths)', 'Backs it with a fact or example', 'Explains why it mattered', 'Names a second, different result', 'Backs it with a fact or example', 'Explains why it mattered'],
    model: 'One result was more trade: crusaders and merchants brought back spices, silk and new knowledge, and Italian cities like Venice grew rich. Another was a weaker Byzantine Empire: the Fourth Crusade sacked Constantinople in 1204, which left it too weak to stop the Ottomans, who took it in 1453.' }),
  explain({ title: 'After the plague', topic: 'The Black Death', intro: 'The Black Death reached Europe in 1347 and killed perhaps a third of its people.',
    ask: 'Explain <b>two</b> effects of the Black Death.',
    points: ['Names a first effect (labor shortage, higher wages, the decline of serfdom, the Peasants’ Revolt, loss of faith in the Church)', 'Backs it with a fact or example', 'Explains how the plague caused it', 'Names a second, different effect', 'Backs it with a fact or example', 'Explains how the plague caused it, or links the two'],
    model: 'With so many dead, workers were scarce, so the survivors could demand higher wages and move to better jobs, and serfdom slowly faded. But lords and kings passed laws to hold wages down, and with a poll tax this led to the Peasants’ Revolt of 1381, led by Wat Tyler.' }),
  explain({ title: 'The end of an age', topic: 'The end of the Middle Ages', intro: 'Historians often say the Middle Ages ended around 1450 to 1500.',
    ask: 'Explain <b>two</b> reasons why historians say the Middle Ages ended around 1500.',
    points: ['Names a first change (the printing press, the fall of Constantinople, cannons, the Renaissance, 1492)', 'Backs it with a date or example', 'Explains why it was a big change', 'Names a second, different change', 'Backs it with a date or example', 'Explains why it was a big change'],
    model: 'One reason is the printing press: Gutenberg printed books with movable type around 1450, so books became cheap and ideas spread fast. Another is the fall of Constantinople in 1453: Ottoman cannons broke walls that had stood for a thousand years, ending the last of the Roman Empire and showing that castles and old walls no longer worked.' }),
];

export const middleAgesExam = examBank('middleages-exam', {
  title: 'The Middle Ages', minutes: 40,
  slots: [
    [keyWords, timeline],   // 1. key words, people and dates
    SOURCES,                // 2. a source
    EXPLAINS,               // 3. an extended answer
  ],
});
