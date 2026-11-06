// Learning the Middle Ages: the topics in five units, in time order, each with a short lesson (the story, the names and
// dates worth knowing, the usual mix-ups), and the timeline shown beside the course. A topic is learned after 4 right in
// a row. No worked example: a fact question has no working to show.
import { TOPICS } from './middle-ages.js';

const lessons = {
  'The fall of Rome and the Byzantine Empire': {
    idea: '<p>By the 400s the Western Roman Empire was worn down by civil wars, money troubles and Germanic peoples settling inside its borders. In <b>476</b> the general <b>Odoacer</b> removed the last Western emperor, a boy called Romulus Augustulus. That date is the usual start of the <b>Middle Ages</b>, which run to about 1500.</p><p>The Eastern half carried on as the <b>Byzantine Empire</b>, ruled from <b>Constantinople</b>. Its emperor <b>Justinian</b> gathered Roman law into one code and built the great church of the <b>Hagia Sophia</b> (finished 537). It lasted until 1453.</p>',
    how: ['Split the empire in two: the West fell in 476, the East lasted to 1453.', 'Tie each name to one thing: Odoacer ended the West, Justinian made the law code and the Hagia Sophia.', 'Remember why the East lasted: richer cities and Constantinople’s walls and seas.'],
    facts: ['476: the last Western Roman emperor is deposed.', '537: the Hagia Sophia is finished.', 'Byzantine capital: Constantinople (today Istanbul).'],
    watch: ['Thinking all of Rome fell in 476: the Eastern Empire went on for almost 1,000 years.', 'Mixing up Constantine (who founded Constantinople, in the 300s) with Justinian (the 500s).'],
    tip: 'Ask yourself whether the question is about the West, which fell first, or the East, which lasted almost 1,000 years longer.',
  },
  'The Franks and Charlemagne': {
    idea: '<p>Of the kingdoms that took the West’s place, the <b>Franks</b> grew strongest. In <b>732</b> <b>Charles Martel</b> stopped an Umayyad army at the <b>Battle of Tours</b>. His grandson <b>Charlemagne</b> conquered much of western Europe, and on Christmas Day <b>800</b> <b>Pope Leo III</b> crowned him emperor.</p><p>Charlemagne brought scholars to his court and set up schools, the <b>Carolingian Renaissance</b>. After him the empire was split among his three grandsons by the <b>Treaty of Verdun</b> (<b>843</b>), into lands that grew into France and Germany.</p>',
    how: ['Line up the three generations: Charles Martel (Tours, 732), then Charlemagne (crowned 800), then his grandsons (Verdun, 843).', 'Remember who crowned whom: the pope crowned Charlemagne.', 'Link Verdun to “split in three”.'],
    facts: ['732: Battle of Tours.', '800: Charlemagne crowned emperor by Pope Leo III.', '843: Treaty of Verdun.'],
    watch: ['Mixing up Charles Martel and Charlemagne: Martel won at Tours, Charlemagne was his grandson.', 'Thinking Charlemagne was a king of France: he was king of the Franks, whose lands spread far wider.'],
    tip: 'Think of the Frankish family in turn, from the emperor’s grandfather who fought at Tours to the grandsons who split the empire: which of them is the question about?',
  },
  'The rise of Islam': {
    idea: '<p>The Prophet <b>Muhammad</b> was born in <b>Mecca</b> around 570. In <b>622</b> he and his followers moved to <b>Medina</b>, the <b>Hijra</b>, where the Islamic calendar begins. Within a century Muslim rule stretched from Spain to Central Asia, under caliphs.</p><p>The <b>Umayyads</b> ruled from Damascus, then the <b>Abbasids</b> founded <b>Baghdad</b> (<b>762</b>). Its <b>House of Wisdom</b> translated Greek, Persian and Indian works, and the digits <b>0 to 9</b> reached Europe from India through Arabic scholars.</p>',
    how: ['Place the two cities of Muhammad’s life: born in Mecca, moved to Medina in 622.', 'Tell the caliphates apart by their capital: Umayyads in Damascus, Abbasids in Baghdad.', 'Remember the learning: the House of Wisdom, and the Hindu–Arabic numerals.'],
    facts: ['622: the Hijra, year one of the Islamic calendar.', '762: Baghdad founded by the Abbasids.'],
    watch: ['Swapping Mecca and Medina: born in Mecca, moved to Medina.', 'Calling the numerals Arabic only: they started in India.'],
    tip: 'Think of the order: Muhammad’s life in Arabia first, then the caliphs who ruled after him. Which part is the question about?',
  },
  'The Vikings': {
    idea: '<p>The <b>Vikings</b> were seafarers from <b>Scandinavia</b> (Norway, Denmark, Sweden). Their raid on the monastery of <b>Lindisfarne</b> in <b>793</b> is the usual start of the Viking Age. Light <b>longships</b> let them cross seas and row far up rivers.</p><p>They raided, but they also traded and settled: in England, Ireland, Iceland and Greenland, and in <b>911</b> the French king gave the leader <b>Rollo</b> land that became <b>Normandy</b>. Around 1000, <b>Leif Erikson</b> reached North America.</p>',
    how: ['Start from where they came from: Scandinavia.', 'Remember the first famous raid (Lindisfarne, 793) and the land they were given (Normandy, 911).', 'Link Normandy to the Normans: Vikings’ descendants, who will conquer England in 1066.'],
    facts: ['793: the raid on Lindisfarne.', '911: Rollo gets Normandy.', 'About 1000: Leif Erikson in North America.'],
    watch: ['Thinking Vikings only raided: many were traders and farmers who settled.', 'Mixing up Leif Erikson with his father Erik the Red, who settled Greenland.'],
    tip: 'Picture the Vikings on their ships: where they set out from, where they raided, where they settled, and how far they sailed.',
  },
  'Feudalism and the manor': {
    idea: '<p>With no strong central government, land was the way to pay for protection. In <b>feudalism</b> the <b>king</b> granted land, a <b>fief</b>, to great lords. They granted land to <b>knights</b>. Each <b>vassal</b> promised loyalty and service, usually fighting, in return.</p><p>Most people were <b>peasants</b>, many of them <b>serfs</b> tied to a lord’s <b>manor</b>: his house, the village, fields, mill and church. Serfs worked his land as well as their own strips and could not leave without permission. A noble boy trained as a <b>page</b>, then a <b>squire</b>, and lived by the code of <b>chivalry</b> once knighted.</p>',
    how: ['Picture the pyramid: king, lords (barons), knights, peasants.', 'Read each word as a deal: land and protection go down, loyalty and service go up.', 'Tell the people apart: a vassal holds land from a lord. A serf is a peasant tied to the land.'],
    facts: ['Fief: land granted for service.', 'Vassal: someone who holds land from a lord.', 'Serf: a peasant bound to the manor.', 'Page, squire, knight: a knight’s training.'],
    watch: ['Calling serfs slaves: they couldn’t leave, but had their own strips, homes and rights.', 'Mixing up the knight’s training (page, squire) with a craft guild’s (apprentice, journeyman).'],
    tip: 'Think of feudalism as a chain of deals: who gives land, and who owes what for it?',
  },
  'The medieval Church': {
    idea: '<p>The <b>Church</b> was the strongest power in medieval Europe, in every village and at every king’s court. People paid it a <b>tithe</b>, a tenth of what they produced, and the threat of <b>excommunication</b>, being cut off from the Church, could bring down even rulers. <b>Monks</b> in monasteries prayed, worked and copied books, keeping learning alive.</p><p>In <b>1054</b> the <b>Great Schism</b> split the Church into the <b>Roman Catholic</b> west and the <b>Eastern Orthodox</b> east. In the <b>Investiture Controversy</b>, Pope Gregory VII and Emperor Henry IV fought over who appointed bishops. In <b>1077</b> Henry waited in the snow at <b>Canossa</b> to be forgiven.</p>',
    how: ['Know the Church’s powers: the tithe (money) and excommunication (the threat).', 'Remember the split: 1054, Catholic west and Orthodox east.', 'Remember the quarrel: popes against kings over bishops, and Canossa (1077).'],
    facts: ['1054: the Great Schism.', '1077: Henry IV at Canossa.', 'Tithe: one tenth.'],
    watch: ['Mixing up the Great Schism (1054) with the Protestant Reformation, which came much later (1517).', 'Thinking investiture was about money: it was about appointing bishops.'],
    tip: 'Ask what the question is about: the Church’s hold over ordinary people, its split between east and west, or its fight with kings.',
  },
  'The Norman Conquest': {
    idea: '<p>When Edward the Confessor died childless in 1066, three men claimed England. King <b>Harold II</b> beat a Norwegian invasion at Stamford Bridge, then marched south, and was killed at the <b>Battle of Hastings</b> (<b>1066</b>) by <b>William, Duke of Normandy</b>, “the Conqueror”.</p><p>The Normans held England with <b>castles</b>, first quick motte-and-bailey ones, and gave out land to Norman lords. In <b>1086</b> William had the country surveyed in the <b>Domesday Book</b>. The <b>Bayeux Tapestry</b> tells the story in embroidery.</p>',
    how: ['Remember the winner and the loser at Hastings: William won, Harold died.', 'Twenty years later: the Domesday Book, a survey for taxes.', 'Link the Normans back to the Vikings of Normandy (911).'],
    facts: ['1066: the Battle of Hastings.', '1086: the Domesday Book.'],
    watch: ['Swapping the two: Harold was the English king, William the Norman duke.', 'Thinking the Domesday Book was about the end of the world: it was a survey of land and property.'],
    tip: 'Think of the story in order: a disputed crown, one battle, then how the winner held the country.',
  },
  'The Crusades': {
    idea: '<p>In <b>1095</b> <b>Pope Urban II</b> called on Christians to win back Jerusalem and help the Byzantines. The <b>First Crusade</b> took <b>Jerusalem</b> in <b>1099</b> and set up crusader states. <b>Saladin</b> retook Jerusalem in <b>1187</b>, and <b>Richard the Lionheart</b> led the <b>Third Crusade</b> against him without taking it back.</p><p>The <b>Fourth Crusade</b> never reached the Holy Land: in <b>1204</b> it sacked <b>Constantinople</b>, a Christian city. The Crusades failed in the end, but they brought more <b>trade</b>, spices, silk and ideas from the east into Europe.</p>',
    how: ['Number the crusades: First (1095–1099, took Jerusalem), Third (Richard against Saladin), Fourth (sacked Constantinople, 1204).', 'Know the two sides’ heroes: Richard the Lionheart and Saladin.', 'For results, think trade and contact, not lasting conquest.'],
    facts: ['1095: Urban II calls the First Crusade.', '1099: crusaders take Jerusalem.', '1187: Saladin retakes it.', '1204: the Fourth Crusade sacks Constantinople.'],
    watch: ['Thinking the crusaders kept Jerusalem: they held it 88 years.', 'Forgetting that the Fourth Crusade attacked fellow Christians.'],
    tip: 'Work out which crusade it is first: each one had its own leaders, target and result.',
  },
  'Magna Carta and the power of kings': {
    idea: '<p><b>King John</b> of England lost wars in France and taxed his nobles hard. In <b>1215</b> his <b>barons</b> rebelled and made him seal <b>Magna Carta</b> (“the Great Charter”) at <b>Runnymede</b>. Its big idea: <b>even the king must obey the law</b>, and no free man could be punished except by the law of the land.</p><p>Kings still needed money, so they called nobles, churchmen and townspeople to agree to taxes. These meetings grew into <b>Parliament</b>; <b>Edward I</b>’s <b>Model Parliament</b> of <b>1295</b> is a famous early one.</p>',
    how: ['Name the people: King John, forced by his barons.', 'Say the idea in five words: the king is under the law.', 'Follow it on: asking for taxes led to Parliament (1295).'],
    facts: ['1215: Magna Carta, at Runnymede.', '1295: the Model Parliament.'],
    watch: ['Thinking Magna Carta gave everyone rights or the vote: it protected mostly barons and free men at first.', 'Mixing up King John with his brother Richard the Lionheart, who came before him.'],
    tip: 'Ask who was limiting whom, and why kings kept needing their nobles’ help.',
  },
  'Towns, guilds and learning': {
    idea: '<p>From about 1000, better farming meant more food and more people, and <b>towns</b> grew again around trade. Merchants and craftsmen formed <b>guilds</b>, which set prices and quality and trained new members: an <b>apprentice</b> became a <b>journeyman</b>, and could become a <b>master</b> by making a masterpiece.</p><p>Learning moved from monasteries to <b>universities</b>, starting with <b>Bologna</b> (<b>1088</b>), then Paris and Oxford. <b>Thomas Aquinas</b> joined faith with Aristotle’s reason. Towns raised huge <b>Gothic</b> cathedrals like <b>Notre-Dame</b> (begun <b>1163</b>), with pointed arches, flying buttresses and stained glass.</p>',
    how: ['For guilds, remember the three steps: apprentice, journeyman, master.', 'For buildings, look for the signs of Gothic: pointed arches, flying buttresses, big windows.', 'For learning, think universities (Bologna first) and Thomas Aquinas.'],
    facts: ['1088: University of Bologna.', '1163: work begins on Notre-Dame.'],
    watch: ['Mixing Gothic (pointed arches, light) with Romanesque (round arches, thick walls, earlier).', 'Mixing the guild steps with a knight’s (page, squire, knight).'],
    tip: 'Think of a medieval town: its guilds, its university, and its great cathedral. Which one is the question about?',
  },
  'The Black Death': {
    idea: '<p>In <b>1347</b> the plague reached Europe on ships from the Black Sea. Spread by <b>fleas on rats</b>, and person to person, the <b>Black Death</b> killed perhaps <b>a third or more</b> of Europe’s people by about 1351.</p><p>With so many dead, <b>workers were scarce</b>, so survivors could ask for higher wages and more freedom. Lords and kings tried to hold wages down. In England that, and a new <b>poll tax</b>, set off the <b>Peasants’ Revolt</b> of <b>1381</b>, led by <b>Wat Tyler</b>. Serfdom slowly faded afterwards.</p>',
    how: ['Remember the numbers: 1347 it arrives, about a third of people die.', 'Follow cause and effect: fewer workers, so higher wages, so laws against them, so revolt (1381).', 'Name the leader of the revolt: Wat Tyler.'],
    facts: ['1347: the Black Death reaches Europe.', '1381: the Peasants’ Revolt.'],
    watch: ['Thinking wages fell after the plague: they rose, because workers were scarce.', 'Mixing Wat Tyler with Joan of Arc or Robin Hood.'],
    tip: 'Follow the chain: the plague, then too few workers, then what happened to wages and the fight over them.',
  },
  'The Hundred Years’ War': {
    idea: '<p>English kings claimed the throne of France, and from <b>1337</b> to <b>1453</b> (116 years, with long truces) <b>England and France</b> fought on French soil. English <b>longbowmen</b> won great victories at Crécy and at <b>Agincourt</b> (<b>1415</b>), under <b>Henry V</b>.</p><p>Then a peasant girl, <b>Joan of Arc</b>, inspired the French to lift the siege of <b>Orléans</b> in <b>1429</b>. She was captured and burned by the English in 1431, but France won the war, keeping only Calais English.</p>',
    how: ['Remember the sides and the span: England against France, 1337 to 1453.', 'English high point: the longbow at Agincourt (1415, Henry V).', 'French turning point: Joan of Arc at Orléans (1429).'],
    facts: ['1337: the war begins.', '1415: Agincourt.', '1429: Joan of Arc at Orléans.', '1453: the war ends.'],
    watch: ['Saying it lasted 100 years: it lasted 116.', 'Thinking England won: France did.', 'Mixing Henry V with Henry VIII, who came a century later.'],
    tip: 'Split the war in two: a run of English victories first, then a French comeback that won the war.',
  },
  'The end of the Middle Ages': {
    idea: '<p>Several changes around 1450–1500 mark the end of the Middle Ages. In <b>1453</b> the <b>Ottoman Turks</b> under <b>Mehmed II</b> took <b>Constantinople</b> with cannon, ending the Byzantine Empire, and the Hundred Years’ War ended the same year. Around <b>1450</b> <b>Johannes Gutenberg</b>’s <b>printing press</b> made books cheap and ideas fast to spread.</p><p>In <b>1492</b> <b>Granada</b> fell, ending the <b>Reconquista</b> in Spain (and Columbus sailed the same year). Meanwhile the <b>Renaissance</b>, a rebirth of Greek and Roman art and learning, spread from Italy.</p>',
    how: ['Learn the two key years: 1453 (Constantinople, the end of the Hundred Years’ War) and 1492 (Granada, Columbus).', 'Link Gutenberg to printing with movable type, about 1450.', 'See the Renaissance as the bridge to the modern age.'],
    facts: ['About 1450: Gutenberg’s printing press.', '1453: the fall of Constantinople.', '1492: the fall of Granada.'],
    watch: ['Saying the crusaders or Mongols took Constantinople in 1453: it was the Ottomans.', 'Thinking Gutenberg invented paper or the first printing: he brought movable type printing to Europe (China had movable type earlier).'],
    tip: 'Think of the changes around 1450 to 1500: a new machine, a great city lost, a kingdom won back, and new ideas from Italy.',
  },
  'The wider medieval world': {
    idea: '<p>Europe was only one part of the medieval world. <b>Song China</b> (960–1279) had paper money, movable type and the compass at sea. <b>Genghis Khan</b> united the Mongols in <b>1206</b>, and his grandson <b>Kublai Khan</b> ruled China, where <b>Marco Polo</b> met him.</p><p>In Japan, from <b>1192</b> the <b>shogun</b> held real power with his <b>samurai</b>, while the emperor reigned in name. In West Africa, <b>Mansa Musa</b> of <b>Mali</b> made his famous golden pilgrimage to Mecca in <b>1324</b>. In Mexico the <b>Aztecs</b> founded <b>Tenochtitlan</b> on a lake island in <b>1325</b>.</p>',
    how: ['Go around the world: China (Song), the steppe (Mongols), Japan (shogun), Africa (Mali), the Americas (Aztecs).', 'Tie one person or word to each: Genghis Khan, shogun, Mansa Musa, Tenochtitlan.', 'Remember Marco Polo as the European who saw Kublai Khan’s China.'],
    facts: ['1192: the first shogun, Minamoto Yoritomo.', '1206: Genghis Khan.', '1324: Mansa Musa’s pilgrimage.', '1325: Tenochtitlan founded.'],
    watch: ['Mixing Genghis Khan (who founded the empire) with Kublai Khan (his grandson, who ruled China).', 'Mixing the shogun (the military ruler) with the samurai (his warriors).'],
    tip: 'Ask where in the world it was first, then match the ruler or word to that place.',
  },
};

const UNITS = [
  ['The Early Middle Ages', ['The fall of Rome and the Byzantine Empire', 'The Franks and Charlemagne', 'The rise of Islam', 'The Vikings']],
  ['Faith and society', ['Feudalism and the manor', 'The medieval Church']],
  ['The High Middle Ages', ['The Norman Conquest', 'The Crusades', 'Magna Carta and the power of kings', 'Towns, guilds and learning']],
  ['The Late Middle Ages', ['The Black Death', 'The Hundred Years’ War', 'The end of the Middle Ages']],
  ['The wider world', ['The wider medieval world']],
];
export const middleAgesLearning = { goal: 4, example: false, path: UNITS.map(([unit, topics]) => ({ unit, topics })), lessons };

// the course's timeline, every dated event in order, for beside the test
export function timeline() {
  const rows = TOPICS.flatMap((t) => t.events).sort((a, b) => a.y - b.y);
  const box = document.createElement('div');
  box.innerHTML = `<table class="data"><thead><tr><th>Year</th><th>Event</th></tr></thead><tbody>${
    rows.map((e) => `<tr><td>${e.y}</td><td>${e.label}</td></tr>`).join('')}</tbody></table>`;
  return box;
}
