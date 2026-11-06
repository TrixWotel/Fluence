// Learning the Wars of Religion: the topics in two units, in time order, each with short notes (the story, the names and
// dates worth knowing, the usual mix-ups), and the timeline shown beside the course. A topic is learned after 4 right in
// a row. No worked example: a fact question has no working to show. The chapters (chapters.html) tell the same story.
import { TOPICS } from './wars-of-religion.js';

const lessons = {
  'The Wars of Religion': {
    idea: '<p>In <b>1517</b> <b>Martin Luther</b> attacked the Church’s sale of indulgences. His protest split Western Christians into <b>Catholics</b> and <b>Protestants</b>, and for more than a century they fought across Europe. These are the <b>Wars of Religion</b>.</p><p>In Germany the <b>Peace of Augsburg</b> (<b>1555</b>) let each prince choose Lutheran or Catholic for his own lands, but left out Calvinists. In France, Catholics fought the <b>Huguenots</b> (French Calvinists) from <b>1562</b> until <b>Henry IV</b>’s <b>Edict of Nantes</b> (<b>1598</b>). The Dutch rose against Catholic Spain in <b>1568</b>. Rulers fought for land and power as much as for faith.</p>',
    how: ['Start from the split: Luther in 1517, then Catholics against Protestants.', 'Go country by country: Germany (Augsburg, 1555), France (Huguenots, Nantes, 1598), the Netherlands (revolt against Spain, 1568).', 'Ask who gained power, not just who prayed which way.'],
    facts: ['1517: Luther’s 95 Theses.', '1555: the Peace of Augsburg.', '1562 to 1598: the French Wars of Religion.', '1568: the Dutch Revolt begins.', '1598: the Edict of Nantes.'],
    watch: ['Thinking Augsburg allowed every faith: only Lutheran and Catholic, and the ruler chose, not each person.', 'Mixing Luther (Germany, 1517) with Calvin (whose teaching the Huguenots followed).', 'Thinking these were the Crusades: those were medieval wars over the Holy Land.'],
    tip: 'Ask which country the question is about first, then which side each name was on.',
  },
  'The St. Bartholomew’s Day Massacre': {
    idea: '<p>In August <b>1572</b>, Huguenot nobles came to Paris for a wedding meant to bring peace: Protestant <b>Henry of Navarre</b> was marrying <b>Margaret of Valois</b>, the Catholic king’s sister. Days later the Huguenot leader, <b>Admiral Coligny</b>, was shot and wounded.</p><p>On the night of August 23 to 24, St. Bartholomew’s Day, the royal court ordered the Huguenot leaders killed. Coligny died first, then mobs spread the killing through Paris and on to other towns for weeks. Thousands died: estimates run from about 5,000 to 30,000. <b>Catherine de’ Medici</b> and her son <b>King Charles IX</b> are usually blamed, though historians still argue over who decided what. Henry of Navarre survived by agreeing to become a Catholic. The wars began again.</p>',
    how: ['Remember the sequence: the wedding, the shot at Coligny, then the massacre.', 'Tie each name to one role: Henry the groom, Margaret the bride, Catherine the queen mother, Charles the king, Coligny the admiral.', 'Remember the result: the wars started again, and many Huguenots stopped trusting the crown.'],
    facts: ['August 18, 1572: the wedding.', 'August 22: Coligny is shot and wounded.', 'August 23 to 24: the massacre begins.', '1589: Henry of Navarre becomes Henry IV.'],
    watch: ['Saying the massacre ended the wars: they went on until 1598.', 'Being too sure who ordered it: historians still disagree.', 'Thinking Henry of Navarre was a Catholic at the wedding: he was the Protestant groom.'],
    tip: 'Picture the wedding first: who was marrying whom, and who had come to Paris to see it?',
  },
  'The Defenestration of Prague': {
    idea: '<p>Bohemia’s Protestants held a royal promise of religious freedom, the <b>Letter of Majesty</b> (<b>1609</b>). By 1618 Protestant churches had been closed, and a strict Catholic, <b>Ferdinand of Styria</b>, had been named their next king.</p><p>On <b>May 23, 1618</b>, nobles led by <b>Count Thurn</b> marched into Prague Castle and threw two Catholic officials, <b>Slavata</b> and <b>Martinice</b>, and their secretary, <b>Fabricius</b>, out of a window. They fell about 70 feet by the usual figure, and all three survived. Catholics said angels or the Virgin Mary saved them, and Protestants said a dung heap did. <b>Defenestration</b> means throwing someone out of a window (Latin <i>fenestra</i>). The revolt it began grew into the <b>Thirty Years’ War</b>.</p>',
    how: ['Start with the promise (1609), then what seemed to break it: closed churches and Ferdinand.', 'Remember who threw whom: Protestant nobles threw Catholic officials.', 'Link 1618 to both: the Defenestration, and the start of the Thirty Years’ War.'],
    facts: ['1609: the Letter of Majesty.', 'May 23, 1618: the Defenestration of Prague.', 'About 70 feet: the fall. All three lived.'],
    watch: ['Getting the sides backwards: the men thrown out were the Catholics.', 'Saying the men died: all three survived.', 'Treating the dung heap as proven: it may have been a Protestant joke.'],
    tip: 'Ask who was angry at whom: Bohemia’s Protestants were angry at the Catholic officials running things for the Habsburgs.',
  },
  'The Thirty Years’ War': {
    idea: '<p>The war ran from <b>1618</b> to <b>1648</b>, mostly in the Holy Roman Empire. Bohemia’s rebels chose <b>Frederick V</b> as king, but he lost at <b>White Mountain</b> in <b>1620</b>: he’s the “Winter King”. Then <b>Christian IV</b> of Denmark joined the Protestants in 1625 and lost to the Catholic armies of <b>Tilly</b> and <b>Wallenstein</b>.</p><p><b>Gustavus Adolphus</b> of Sweden, the “Lion of the North”, turned the war around from 1630 and was killed at <b>Lützen</b> in <b>1632</b>. Catholic France, under <b>Cardinal Richelieu</b>, paid Sweden and then joined the war in <b>1635</b>, all to weaken the <b>Habsburgs</b>. By then it was about power. Perhaps a third of the Empire’s people died, mostly of hunger and disease.</p>',
    how: ['Follow the order of who came in: Bohemia, Denmark, Sweden, France.', 'Give each stage one name: Frederick V, Christian IV, Gustavus Adolphus, Richelieu.', 'Say why France matters: a Catholic power helping Protestants shows it had become about power.'],
    facts: ['1618 to 1648: the war.', '1620: White Mountain.', '1631: the sack of Magdeburg.', '1632: Gustavus Adolphus dies at Lützen.', '1635: France joins openly.'],
    watch: ['Thinking it was only about religion: France’s part shows otherwise.', 'Mixing Wallenstein (the emperor’s general) with Gustavus Adolphus (his Swedish enemy).', 'Thinking most of the dead were soldiers: most died of hunger and disease.'],
    tip: 'Ask which stage of the war it is: Bohemia, Denmark, Sweden or France. Each has its own leader.',
  },
  'The Peace of Westphalia': {
    idea: '<p>Talks began in <b>1644</b> in two towns in Westphalia: Catholic powers at <b>Münster</b>, Protestant powers at <b>Osnabrück</b>. In <b>1648</b> the treaties ended the Thirty Years’ War.</p><p><b>Calvinism</b> joined Catholicism and Lutheranism as a recognized faith. The <b>Dutch Republic</b> and <b>Switzerland</b> were recognized as independent. <b>France</b> and <b>Sweden</b> gained land, and the 300 or so German states could run much more of their own affairs, so the emperor’s power shrank. This is why Westphalia is linked with <b>sovereignty</b>: each state running its own affairs. The pope condemned the treaties, and France and Spain fought on until 1659.</p>',
    how: ['Remember the place: two towns, one Catholic and one Protestant.', 'List the results: three faiths, two countries recognized, two big winners, a weaker emperor.', 'Link Westphalia to the word sovereignty.'],
    facts: ['1644: talks begin.', '1648: the Peace of Westphalia.', 'Münster: Catholic powers. Osnabrück: Protestant powers.'],
    watch: ['Saying it ended every war: France and Spain fought on until 1659.', 'Saying it united Germany: it left about 300 separate states.', 'Saying it gave each person freedom of faith: mostly rulers chose.'],
    tip: 'Sort the answer: is it about faith, new countries, who gained land, or the emperor’s power?',
  },
};

const UNITS = [
  ['A split in Christianity', ['The Wars of Religion', 'The St. Bartholomew’s Day Massacre']],
  ['The war that wrecked Germany', ['The Defenestration of Prague', 'The Thirty Years’ War', 'The Peace of Westphalia']],
];
export const warsLearning = { goal: 4, example: false, path: UNITS.map(([unit, topics]) => ({ unit, topics })), lessons };

// the course's timeline, every dated event in order, for beside the test
export function warsTimeline() {
  const rows = TOPICS.flatMap((t) => t.events).sort((a, b) => a.y - b.y);
  const box = document.createElement('div');
  box.innerHTML = `<table class="data"><thead><tr><th>Year</th><th>Event</th></tr></thead><tbody>${
    rows.map((e) => `<tr><td>${e.y}</td><td>${e.label}</td></tr>`).join('')}</tbody></table>`;
  return box;
}
