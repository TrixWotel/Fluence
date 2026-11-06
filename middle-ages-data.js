// The Middle Ages, the facts behind the questions: for each of the 14 topics its events (year, the question's words,
// and how it reads on a timeline), its own questions with choices, names and words to type, pairs to match, sets to
// choose all that fit from, and (for feudalism, which has no dates) true or false. Every date is the usual one in
// school histories.

// each event: its year, the question's words after "In what year…" / "In which century…", and how it reads in a list
const E = (y, ask, label) => ({ y, ask, label });
// each topic: its own questions as [question, answer, [wrong answers], why], and its events
const BASE = [
  { name: 'The fall of Rome and the Byzantine Empire', events: [E(476, 'did the last emperor of the Western Roman Empire lose his throne', 'The last Western Roman emperor is deposed'), E(537, 'was the Hagia Sophia in Constantinople finished', 'The Hagia Sophia is finished')], facts: [
    ['Who removed Romulus Augustulus, the last emperor of the Western Roman Empire, in 476?', 'Odoacer', ['Attila the Hun', 'Charlemagne', 'Justinian', 'Clovis'], 'Odoacer, a Germanic general, deposed him in 476, the date usually given for the end of the Western Roman Empire and the start of the Middle Ages.'],
    ['What was the capital of the Byzantine (Eastern Roman) Empire?', 'Constantinople', ['Rome', 'Athens', 'Alexandria', 'Jerusalem'], 'Constantinople, today’s Istanbul, was founded by Constantine on the old town of Byzantium, which gave the empire its later name.'],
    ['Which Byzantine emperor had Roman law collected into one code and built the Hagia Sophia?', 'Justinian', ['Constantine', 'Augustus', 'Charlemagne', 'Basil II'], 'Justinian (ruled 527–565) had Roman law gathered into the Code of Justinian, which later shaped law across Europe, and finished the Hagia Sophia in 537.'],
    ['Roughly which years does “the Middle Ages” mean in European history?', 'From the fall of Rome in 476 to about 1500', ['From 1066 to 1215', 'From the birth of Rome to its fall', 'From about 1500 to 1800', 'From 1000 BC to AD 476'], 'The Middle Ages run from the fall of the Western Roman Empire (476) to about 1500, between the ancient world and the modern one.'],
    ['Why did the Eastern half of the Roman Empire last about 1,000 years longer than the Western half?', 'It was richer, and its capital was well defended by walls and the sea', ['It had no enemies at all', 'The Vikings defended it', 'It was ruled by the pope', 'It moved its capital to Rome'], 'The East had richer cities and more taxes to pay armies, and Constantinople’s huge walls and seas held off attackers until 1453.'],
  ] },
  { name: 'The Franks and Charlemagne', events: [E(732, 'was the Battle of Tours fought', 'The Battle of Tours'), E(800, 'was Charlemagne crowned emperor', 'Charlemagne is crowned emperor'), E(843, 'was the Treaty of Verdun signed', 'The Treaty of Verdun')], facts: [
    ['Who crowned Charlemagne emperor on Christmas Day, 800?', 'Pope Leo III', ['Pope Urban II', 'Pope Gregory VII', 'The Byzantine emperor', 'Clovis'], 'Pope Leo III crowned him in Rome, making him the first emperor in the West since 476.'],
    ['Which people did Charlemagne rule as king?', 'The Franks', ['The Vikings', 'The Normans', 'The Byzantines', 'The Moors'], 'Charlemagne was king of the Franks, whose kingdom grew into an empire covering much of today’s France, Germany and Italy.'],
    ['Who led the Franks when they stopped an Umayyad army at the Battle of Tours in 732?', 'Charles Martel', ['Charlemagne', 'Clovis', 'William the Conqueror', 'Rollo'], 'Charles Martel, Charlemagne’s grandfather, won at Tours (or Poitiers) in 732.'],
    ['What did the Treaty of Verdun (843) do?', 'Split Charlemagne’s empire among his three grandsons', ['Made Charlemagne emperor', 'Ended the Hundred Years’ War', 'Started the First Crusade', 'Limited the power of the English king'], 'Charlemagne’s grandsons split his empire in three, roughly into the lands that became France, Germany and a middle strip between them.'],
    ['What was the Carolingian Renaissance?', 'A revival of learning, schools and copying books under Charlemagne', ['A plague that swept through France', 'A wave of Viking raids', 'A new kind of castle', 'A revolt of peasants'], 'Charlemagne gathered scholars like Alcuin, set up schools and had old books copied in a clear new script.'],
  ] },
  { name: 'The rise of Islam', events: [E(622, 'did Muhammad move from Mecca to Medina (the Hijra)', 'The Hijra'), E(762, 'was Baghdad founded', 'Baghdad is founded')], facts: [
    ['In which city was the Prophet Muhammad born?', 'Mecca', ['Medina', 'Jerusalem', 'Baghdad', 'Damascus'], 'Muhammad was born in Mecca, in Arabia, around 570.'],
    ['What was the Hijra of 622?', 'Muhammad’s move from Mecca to Medina, where the Islamic calendar starts', ['The first crusade', 'The founding of Baghdad', 'The fall of Constantinople', 'The building of the Hagia Sophia'], 'In 622 Muhammad and his followers moved from Mecca to Medina. The Islamic calendar counts its years from then.'],
    ['What was the House of Wisdom in Baghdad?', 'A center of learning where scholars translated and studied Greek, Persian and Indian works', ['The main mosque in Mecca', 'A palace in Spain', 'A fortress against the crusaders', 'A market for spices'], 'Under the Abbasids, scholars in Baghdad translated and built on ancient learning in mathematics, astronomy and medicine.'],
    ['Which number system reached Europe through Arabic scholars?', 'The Hindu–Arabic numerals, 0 to 9', ['Roman numerals', 'Greek numerals', 'Babylonian numbers', 'Egyptian hieroglyphs'], 'The digits 0–9 came from India and spread to Europe through Arabic writers, replacing Roman numerals for arithmetic.'],
    ['Which caliphate made Baghdad its capital?', 'The Abbasid Caliphate', ['The Umayyad Caliphate', 'The Ottoman Empire', 'The Fatimid Caliphate', 'The Mali Empire'], 'The Abbasids took over from the Umayyads (whose capital was Damascus) and founded Baghdad in 762.'],
  ] },
  { name: 'The Vikings', events: [E(793, 'did Vikings raid the monastery of Lindisfarne', 'The Viking raid on Lindisfarne'), E(911, 'was Rollo given the land that became Normandy', 'Rollo is given Normandy')], facts: [
    ['Where was the Viking raid of 793 that is often called the start of the Viking Age?', 'Lindisfarne', ['Hastings', 'Canterbury', 'Paris', 'Rome'], 'Vikings attacked the monastery on the island of Lindisfarne, off northeast England, in 793.'],
    ['Where did the Vikings come from?', 'Scandinavia: Norway, Denmark and Sweden', ['Normandy', 'Ireland', 'North Africa', 'Hungary'], 'The Vikings were seafarers from Scandinavia who raided, traded and settled across Europe.'],
    ['Which Viking reached North America around the year 1000?', 'Leif Erikson', ['Erik the Red', 'Harald Hardrada', 'Rollo', 'Cnut'], 'Leif Erikson, son of Erik the Red (who settled Greenland), reached Vinland in North America about 500 years before Columbus.'],
    ['What made Viking longships so useful for raiding?', 'They could cross open seas and also sail up shallow rivers', ['They were armored with iron', 'They had cannons', 'They needed no crew', 'They were too big to sink'], 'Longships were light with a shallow keel, so raiders could cross the North Sea and row far inland up rivers.'],
    ['Whose followers, descended from Vikings, gave Normandy (“land of the Northmen”) its name?', 'Rollo’s', ['Charlemagne’s', 'Alfred the Great’s', 'Leif Erikson’s', 'Saladin’s'], 'In 911 the French king gave the Viking leader Rollo land in northern France, which became Normandy.'],
  ] },
  { name: 'Feudalism and the manor', events: [], facts: [
    ['Under feudalism, what was a fief?', 'Land a lord gave to a vassal in return for loyalty and service', ['A tax paid to the Church', 'A kind of castle', 'A weapon used by knights', 'A town’s charter'], 'A fief was land granted by a lord. The vassal who held it owed loyalty and, usually, military service.'],
    ['Who were serfs?', 'Peasants bound to a lord’s land, who could not leave without permission', ['Knights who guarded the king', 'Merchants in a guild', 'Monks who copied books', 'Nobles who owned castles'], 'Serfs farmed the lord’s land and their own strips, owed him labor and dues, and were tied to the manor.'],
    ['What did a knight owe his lord in return for land?', 'Military service', ['A tenth of his crops', 'Nothing at all', 'Rent paid in gold', 'Work in the fields'], 'Knights held land in return for fighting for their lord, often about 40 days a year.'],
    ['What was a manor?', 'A lord’s estate: his house, the village, its fields and the people who worked them', ['A church school', 'A king’s army', 'A market town', 'A ship'], 'The manor was the center of country life: the lord’s house, the peasants’ village, fields, mill and church.'],
    ['Who was at the top of the feudal system?', 'The king', ['The serfs', 'The knights', 'The merchants', 'The barons'], 'The king granted land to great lords (barons), who granted land to knights, with peasants at the bottom.'],
    ['What did a young noble serve as, on the way to becoming a knight?', 'A page, then a squire', ['An apprentice, then a journeyman', 'A monk, then a priest', 'A serf, then a vassal', 'A herald, then a baron'], 'Boys of noble families served as pages in a lord’s household, then as squires to a knight, and were knighted at about 21.'],
    ['What was chivalry?', 'The code knights were meant to live by: bravery, loyalty, and protecting the weak', ['A tax on knights', 'A kind of armor', 'The training of monks', 'A law limiting the king'], 'Chivalry was the ideal of how a knight should behave, shaped by the Church and by songs and stories of the time.'],
    ['How did most people in medieval Europe make a living?', 'By farming', ['By trading overseas', 'By working in factories', 'By fighting as knights', 'By working for the Church'], 'Around nine in ten people were peasants who farmed, many of them on a lord’s manor.'],
    ['What was the main thing that held feudal society together?', 'Promises of loyalty in exchange for land and protection', ['Money paid in wages', 'Elections every year', 'A written constitution', 'Trade between towns'], 'Feudalism was a chain of personal promises: protection and land from above, loyalty and service from below.'],
  ] },
  { name: 'The medieval Church', events: [E(1054, 'did the Great Schism split the Church', 'The Great Schism'), E(1077, 'did Emperor Henry IV wait in the snow at Canossa', 'Henry IV at Canossa')], facts: [
    ['What happened in the Great Schism of 1054?', 'The Church split into the Roman Catholic Church in the west and the Eastern Orthodox Church in the east', ['England left the Catholic Church', 'The pope moved to Avignon', 'The crusaders took Jerusalem', 'The Vikings became Christian'], 'Arguments over the pope’s authority and church practice split the Church into Catholic and Orthodox in 1054.'],
    ['What was excommunication?', 'Being cut off from the Church and its sacraments', ['Being made a knight', 'Paying a tenth of your crops', 'Going on a pilgrimage', 'Becoming a monk'], 'Excommunication shut a person out of the Church, a powerful threat when people believed it put their soul at risk.'],
    ['What did monks do in monasteries?', 'Prayed, worked, and copied books by hand', ['Collected taxes for the king', 'Trained soldiers', 'Ran the guilds', 'Built ships'], 'Following rules like Saint Benedict’s, monks lived by prayer and work, and kept learning alive by copying books.'],
    ['What was a tithe?', 'A tenth of what people produced, given to the Church', ['A lord’s castle', 'A knight’s weapon', 'A crusade', 'A kind of prayer book'], 'Everyone was expected to give the Church a tithe, one tenth of their crops or income.'],
    ['What was the Investiture Controversy about?', 'Whether popes or kings had the right to appoint bishops', ['Who should rule England', 'How to fight the plague', 'Where to build cathedrals', 'Who owned the Hagia Sophia'], 'Pope Gregory VII and Emperor Henry IV clashed over appointing bishops. Henry begged forgiveness at Canossa in 1077.'],
  ] },
  { name: 'The Norman Conquest', events: [E(1066, 'was the Battle of Hastings fought', 'The Battle of Hastings'), E(1086, 'was the Domesday Book made', 'The Domesday Book')], facts: [
    ['Who won the Battle of Hastings in 1066?', 'William, Duke of Normandy', ['Harold Godwinson', 'Harald Hardrada', 'Alfred the Great', 'Edward the Confessor'], 'William of Normandy defeated King Harold and became William I, “the Conqueror”.'],
    ['Which English king was killed at the Battle of Hastings?', 'Harold II (Harold Godwinson)', ['Edward the Confessor', 'William I', 'Richard I', 'King John'], 'Harold II had just beaten a Norwegian invasion at Stamford Bridge before marching south, where he was killed at Hastings.'],
    ['What was the Domesday Book (1086)?', 'A survey of land and property across England, ordered by William I', ['A book of laws for the Church', 'A list of crusaders', 'A chronicle of the Black Death', 'The first printed book'], 'William had his new kingdom surveyed so he knew who owned what and how much tax it could pay.'],
    ['What did the Normans build to control England after 1066?', 'Castles, first motte-and-bailey castles', ['Universities', 'Canals', 'Printing presses', 'Lighthouses'], 'Quick earth-and-timber motte-and-bailey castles, later rebuilt in stone, let a few Normans hold down the country.'],
    ['Which embroidered cloth tells the story of the Norman Conquest?', 'The Bayeux Tapestry', ['The Book of Kells', 'Magna Carta', 'The Domesday Book', 'The Hagia Sophia'], 'The Bayeux Tapestry, about 70 meters long, shows the events leading up to and including the Battle of Hastings.'],
  ] },
  { name: 'The Crusades', events: [E(1095, 'did Pope Urban II call the First Crusade', 'Urban II calls the First Crusade'), E(1099, 'did the crusaders capture Jerusalem', 'Crusaders capture Jerusalem'), E(1187, 'did Saladin retake Jerusalem', 'Saladin retakes Jerusalem'), E(1204, 'did the Fourth Crusade sack Constantinople', 'The Fourth Crusade sacks Constantinople')], facts: [
    ['Which pope called the First Crusade in 1095?', 'Urban II', ['Leo III', 'Gregory VII', 'Innocent III', 'Gregory I'], 'At Clermont in 1095, Urban II called on Christians to take Jerusalem and help the Byzantine Empire.'],
    ['Who retook Jerusalem for the Muslims in 1187?', 'Saladin', ['Mehmed II', 'Genghis Khan', 'Mansa Musa', 'Charles Martel'], 'Saladin, sultan of Egypt and Syria, defeated the crusaders at Hattin and took Jerusalem in 1187.'],
    ['Which English king led the Third Crusade?', 'Richard I, the Lionheart', ['King John', 'William I', 'Henry V', 'Edward I'], 'Richard the Lionheart fought Saladin in the Third Crusade (1189–1192) but did not retake Jerusalem.'],
    ['What did the Fourth Crusade attack in 1204?', 'Constantinople, a Christian city', ['Jerusalem', 'Mecca', 'Cairo', 'Rome'], 'Short of money, the Fourth Crusade turned on Constantinople and sacked it, badly weakening the Byzantine Empire.'],
    ['What was one lasting result of the Crusades?', 'More trade between Europe and the Middle East, bringing new goods and ideas west', ['The end of the Byzantine Empire in 1099', 'The Black Death', 'The end of feudalism', 'Christian rule of Jerusalem to this day'], 'Crusaders and merchants brought back spices, silk and knowledge, and Italian trading cities grew rich.'],
  ] },
  { name: 'Magna Carta and the power of kings', events: [E(1215, 'did King John agree to Magna Carta', 'Magna Carta'), E(1295, 'did Edward I call the Model Parliament', 'The Model Parliament')], facts: [
    ['Which English king agreed to Magna Carta in 1215?', 'King John', ['Richard I', 'William I', 'Henry II', 'Edward I'], 'King John, short of money and losing wars in France, was forced to agree to Magna Carta.'],
    ['Who forced King John to agree to Magna Carta?', 'His barons, the great nobles', ['The pope', 'The French king', 'The peasants', 'The Vikings'], 'Rebel barons angry at his taxes and rule made John seal Magna Carta at Runnymede.'],
    ['What was the big idea of Magna Carta?', 'Even the king had to obey the law', ['The pope ruled England', 'Everyone could vote', 'Serfs were set free', 'Taxes were banned'], 'Magna Carta said the king could not take property or punish free men except by law, an idea that grew into the rule of law.'],
    ['Where was Magna Carta sealed?', 'Runnymede, by the River Thames', ['Hastings', 'Canterbury Cathedral', 'The Tower of London', 'Westminster Abbey'], 'King John met the barons in the meadow at Runnymede, near Windsor, in June 1215.'],
    ['What grew out of English kings needing to ask for taxes?', 'Parliament', ['The guilds', 'The Crusades', 'The monasteries', 'The Domesday Book'], 'Kings called meetings of nobles, clergy and townspeople to agree to taxes. These grew into Parliament.'],
  ] },
  { name: 'Towns, guilds and learning', events: [E(1088, 'was the University of Bologna founded', 'The University of Bologna is founded'), E(1163, 'was work begun on Notre-Dame in Paris', 'Work begins on Notre-Dame')], facts: [
    ['What was a guild?', 'An association of merchants or craftsmen that set prices, quality and training', ['A kind of church tax', 'A castle’s outer wall', 'A peasant’s strip of land', 'A royal army'], 'Guilds controlled a trade in a town: who could work in it, how goods were made, and what they cost.'],
    ['What were the stages of training in a craft guild?', 'Apprentice, then journeyman, then master', ['Page, then squire, then knight', 'Serf, then baron, then king', 'Monk, then bishop, then pope', 'Student, then doctor, then lord'], 'An apprentice learned from a master, worked as a journeyman, and could become a master by making a “masterpiece”.'],
    ['Which style of cathedral has pointed arches, flying buttresses and huge stained-glass windows?', 'Gothic', ['Romanesque', 'Baroque', 'Classical Greek', 'Modern'], 'Gothic builders used pointed arches and flying buttresses to carry the weight, so walls could be tall and full of glass.'],
    ['Which is often called the oldest university in Europe still running?', 'The University of Bologna', ['The University of Oxford', 'The House of Wisdom', 'The Sorbonne in Paris', 'Cambridge'], 'Bologna, in Italy, is traditionally dated to 1088.'],
    ['Which scholar tried to show that Christian faith and the ideas of Aristotle fit together?', 'Thomas Aquinas', ['Charlemagne', 'Marco Polo', 'Johannes Gutenberg', 'Wat Tyler'], 'Thomas Aquinas, in the 1200s, used reason and Aristotle’s philosophy to explain Christian beliefs.'],
  ] },
  { name: 'The Black Death', events: [E(1347, 'did the Black Death reach Europe', 'The Black Death reaches Europe'), E(1381, 'did the Peasants’ Revolt break out in England', 'The Peasants’ Revolt')], facts: [
    ['What was the Black Death?', 'A plague that killed perhaps a third or more of Europe’s people', ['A long winter with no harvest', 'A war between England and France', 'A Viking invasion', 'A split in the Church'], 'The plague, now known to be caused by bacteria (bubonic plague), killed tens of millions between 1347 and about 1351.'],
    ['How did the plague spread?', 'By fleas carried on rats, and from person to person', ['Through bad smells only', 'By eating fish', 'Only through drinking water', 'By sunlight'], 'Fleas on black rats carried it along trade routes and ships, and the pneumonic form spread through coughing.'],
    ['Why did wages rise after the Black Death?', 'So many workers had died that workers were scarce', ['Kings printed more money', 'The Church paid everyone', 'There were too many workers', 'Taxes were banned'], 'With fewer people to farm the land, surviving peasants could demand more pay and more freedom.'],
    ['What was the English Peasants’ Revolt of 1381 against?', 'A new poll tax, and limits on wages and freedom', ['The Norman Conquest', 'The pope', 'The Black Death itself', 'Magna Carta'], 'Angry at a poll tax and laws holding wages down, peasants marched on London in 1381.'],
    ['Who led the Peasants’ Revolt of 1381?', 'Wat Tyler', ['Joan of Arc', 'Thomas Aquinas', 'William the Conqueror', 'Robin Hood'], 'Wat Tyler led the rebels to London, where he was killed while meeting the young King Richard II.'],
  ] },
  { name: 'The Hundred Years’ War', events: [E(1337, 'did the Hundred Years’ War begin', 'The Hundred Years’ War begins'), E(1415, 'was the Battle of Agincourt fought', 'The Battle of Agincourt'), E(1429, 'did Joan of Arc lift the siege of Orléans', 'Joan of Arc lifts the siege of Orléans'), E(1453, 'did the Hundred Years’ War end', 'The Hundred Years’ War ends')], facts: [
    ['Which two kingdoms fought the Hundred Years’ War?', 'England and France', ['England and Scotland', 'France and Spain', 'England and Spain', 'France and the Holy Roman Empire'], 'English kings claimed the French throne, and the two kingdoms fought on and off from 1337 to 1453.'],
    ['Who was the French peasant girl who helped lift the siege of Orléans in 1429?', 'Joan of Arc', ['Eleanor of Aquitaine', 'Christine de Pizan', 'Queen Isabella', 'Saint Catherine'], 'Joan of Arc, guided (she said) by saints’ voices, inspired the French to victory. She was burned by the English in 1431.'],
    ['Which weapon won English victories at Crécy and Agincourt?', 'The longbow', ['The cannon', 'The musket', 'The catapult', 'The crossbow'], 'English longbowmen could shoot fast and far, cutting down charging French knights.'],
    ['How long did the Hundred Years’ War really last?', '116 years, from 1337 to 1453', ['Exactly 100 years', '30 years', '50 years', '200 years'], 'It ran from 1337 to 1453: 116 years, with long truces in between.'],
    ['Which English king won the Battle of Agincourt in 1415?', 'Henry V', ['Henry VIII', 'Richard I', 'Edward I', 'William I'], 'Henry V’s small, tired army beat a much bigger French one at Agincourt.'],
  ] },
  { name: 'The end of the Middle Ages', events: [E(1453, 'did the Ottomans capture Constantinople', 'The Ottomans capture Constantinople'), E(1492, 'did Granada fall, ending the Reconquista', 'Granada falls')], facts: [
    ['Which invention by Johannes Gutenberg, around 1450, spread books and ideas quickly?', 'The printing press with movable type', ['The telescope', 'The compass', 'Paper', 'The mechanical clock'], 'Gutenberg’s press could print hundreds of copies of a book, so ideas spread far faster than by hand-copying.'],
    ['Who captured Constantinople in 1453, ending the Byzantine Empire?', 'The Ottoman Turks, led by Mehmed II', ['The crusaders', 'The Mongols', 'The Vikings', 'The Venetians'], 'Sultan Mehmed II’s cannons broke the walls in 1453, and Constantinople became the Ottoman capital, Istanbul.'],
    ['What ended in 1492 when Granada fell?', 'The Reconquista, the Christian reconquest of Spain', ['The Hundred Years’ War', 'The Black Death', 'The Crusades', 'The Viking Age'], 'Ferdinand and Isabella took Granada, the last Muslim kingdom in Spain, in 1492.'],
    ['Which movement, starting in Italy, brought new interest in Greek and Roman art and learning?', 'The Renaissance', ['The Reconquista', 'Feudalism', 'The Great Schism', 'The Crusades'], 'The Renaissance (“rebirth”) began in Italian cities in the 1300s and spread across Europe, marking the move to the modern age.'],
    ['Why is 1453 often given as a date for the end of the Middle Ages?', 'Constantinople fell and the Hundred Years’ War ended that year', ['Magna Carta was signed', 'The Black Death began', 'Charlemagne was crowned', 'The Vikings raided Lindisfarne'], 'In 1453 the last of the Roman Empire fell with Constantinople, and the Hundred Years’ War ended.'],
  ] },
  { name: 'The wider medieval world', events: [E(1192, 'did Minamoto Yoritomo become shogun of Japan', 'Minamoto Yoritomo becomes shogun'), E(1206, 'was Genghis Khan proclaimed ruler of the Mongols', 'Genghis Khan rules the Mongols'), E(1324, 'did Mansa Musa make his pilgrimage to Mecca', 'Mansa Musa’s pilgrimage to Mecca'), E(1325, 'did the Aztecs found Tenochtitlan', 'The Aztecs found Tenochtitlan')], facts: [
    ['Which ruler of Mali was famous for his great wealth and his pilgrimage to Mecca in 1324?', 'Mansa Musa', ['Sundiata', 'Saladin', 'Kublai Khan', 'Mehmed II'], 'Mansa Musa of Mali traveled to Mecca with so much gold that he lowered its price in Cairo.'],
    ['Who united the Mongol tribes and founded the Mongol Empire?', 'Genghis Khan', ['Kublai Khan', 'Attila the Hun', 'Tamerlane', 'Saladin'], 'Genghis Khan united the Mongols in 1206. His empire became the largest connected land empire in history.'],
    ['In medieval Japan, what was the title of the military ruler who held the real power?', 'Shogun', ['Emperor', 'Samurai', 'Daimyo', 'Khan'], 'From 1192 the shogun ruled, while the emperor stayed on as a ceremonial figure. Samurai were the warriors who served lords.'],
    ['Which Chinese dynasty (960–1279) is known for movable type and using the compass at sea?', 'The Song dynasty', ['The Han dynasty', 'The Qin dynasty', 'The Ming dynasty', 'The Zhou dynasty'], 'Song China was rich in trade and invention, from movable type to paper money and the magnetic compass.'],
    ['Which city did the Aztecs build on an island in a lake, traditionally in 1325?', 'Tenochtitlan', ['Cuzco', 'Timbuktu', 'Machu Picchu', 'Chichen Itza'], 'Tenochtitlan, on Lake Texcoco, grew into one of the largest cities in the world. Mexico City stands there today.'],
    ['Which Venetian traveler wrote about China under Kublai Khan?', 'Marco Polo', ['Ibn Battuta', 'Leif Erikson', 'Christopher Columbus', 'Vasco da Gama'], 'Marco Polo’s account of his years in China in the late 1200s amazed European readers.'],
  ] },
];

// each topic's other questions:
//   typed  [question, [the answers that count, the usual one first], why]: type a name or a word
//   pairs  [[a person, place or word, what it was]…]: four of them to match at a time
//   multi  [question, [the right ones], [wrong ones], why]: choose all that fit
//   tf     [statement, true or false, why]: for a topic without dates (the others get theirs from the timeline)
const MORE = {
  'The fall of Rome and the Byzantine Empire': {
    typed: [
      ['Which city, today called Istanbul, was the capital of the Byzantine Empire?', ['Constantinople', 'Byzantium'], 'Constantinople, built on the old town of Byzantium, was the Eastern Empire’s capital until 1453.'],
      ['Which Byzantine emperor had Roman law gathered into one code in the 500s?', ['Justinian', 'Justinian I', 'Emperor Justinian'], 'Justinian’s code of Roman law later shaped the law of much of Europe.'],
      ['Who deposed the last Western Roman emperor in 476?', ['Odoacer', 'Odovacar'], 'Odoacer, a Germanic general, removed the boy emperor Romulus Augustulus.'],
    ],
    pairs: [['Odoacer', 'deposed the last Western emperor'], ['Justinian', 'gathered Roman law into one code'], ['Constantinople', 'capital of the Eastern Empire'], ['Hagia Sophia', 'great church finished in 537'], ['Romulus Augustulus', 'the last Western Roman emperor'], ['Constantine', 'founded Constantinople in the 300s']],
    multi: [
      ['Which of these helped bring down the Western Roman Empire? Choose all that fit.', ['Civil wars between rival generals', 'Germanic peoples settling inside its borders', 'Money troubles and heavy taxes'], ['The Black Death', 'Viking raids', 'Cannons breaking its walls'], 'Civil wars, money troubles and Germanic peoples moving in all weakened the West in the 400s. The Black Death, the Vikings and cannons came centuries later.'],
      ['Which of these were true of the Byzantine Empire? Choose all that fit.', ['Its capital was Constantinople', 'It lasted until 1453', 'Justinian was one of its emperors'], ['It fell in 476', 'Its capital was Rome', 'Charlemagne was one of its emperors'], 'The Eastern Empire ruled from Constantinople until 1453, and Justinian was its emperor in the 500s. It was the West that fell in 476, and Charlemagne ruled the Franks.'],
    ],
  },
  'The Franks and Charlemagne': {
    typed: [
      ['Who was crowned emperor by Pope Leo III on Christmas Day, 800?', ['Charlemagne', 'Charles the Great', 'Charles I', 'Karl der Grosse', 'Carolus Magnus'], 'Charlemagne, king of the Franks, became the first emperor in the West since 476.'],
      ['Who led the Franks at the Battle of Tours in 732?', ['Charles Martel', 'Martel'], 'Charles Martel, Charlemagne’s grandfather, stopped an Umayyad army at Tours.'],
      ['The treaty of 843 that split Charlemagne’s empire in three is named after a town. Which town?', ['Verdun', 'Treaty of Verdun', 'the Treaty of Verdun'], 'The Treaty of Verdun shared the empire among Charlemagne’s three grandsons.'],
    ],
    pairs: [['Charles Martel', 'won the Battle of Tours'], ['Charlemagne', 'crowned emperor in 800'], ['Pope Leo III', 'crowned Charlemagne'], ['Treaty of Verdun', 'split the empire in three'], ['Alcuin', 'scholar at Charlemagne’s court'], ['Clovis', 'first king to unite the Franks']],
    multi: [
      ['Which of these did Charlemagne do? Choose all that fit.', ['Was crowned emperor by the pope', 'Set up schools and had books copied', 'Conquered much of western Europe'], ['Won the Battle of Hastings', 'Sealed Magna Carta', 'Called the First Crusade'], 'Charlemagne conquered a huge empire, encouraged learning and was crowned in 800. Hastings, Magna Carta and the First Crusade came in the 1000s and 1200s.'],
      ['Which were part of the Carolingian Renaissance? Choose all that fit.', ['Schools at monasteries and cathedrals', 'Copying old books in a clear new script', 'Scholars gathered at the king’s court'], ['The printing press', 'Universities like Bologna', 'Gothic cathedrals'], 'The Carolingian Renaissance was learning under Charlemagne around 800. The press, the first universities and Gothic cathedrals came centuries later.'],
    ],
  },
  'The rise of Islam': {
    typed: [
      ['In which city was Muhammad born?', ['Mecca', 'Makkah'], 'Muhammad was born in Mecca, in Arabia, around 570.'],
      ['To which city did Muhammad move in 622?', ['Medina', 'Madinah', 'Yathrib'], 'He moved from Mecca to Medina, the Hijra.'],
      ['Which city did the Abbasids found as their capital in 762?', ['Baghdad'], 'The Abbasids built Baghdad on the Tigris, and it became a great center of learning.'],
      ['What is Muhammad’s move to Medina in 622 called?', ['Hijra', 'the Hijra', 'Hegira', 'Hijrah'], 'The Hijra marks year one of the Islamic calendar.'],
    ],
    pairs: [['Mecca', 'where Muhammad was born'], ['Medina', 'where Muhammad moved in 622'], ['Damascus', 'capital of the Umayyads'], ['Baghdad', 'capital of the Abbasids'], ['House of Wisdom', 'center of translation and learning'], ['Hijra', 'the start of the Islamic calendar']],
    multi: [
      ['Which of these reached Europe through Arabic scholars? Choose all that fit.', ['The digits 0 to 9', 'Greek works of science, translated and studied', 'Advances in medicine and astronomy'], ['The printing press', 'Roman numerals', 'The longbow'], 'Scholars in places like Baghdad and Spain passed on the Hindu–Arabic digits, Greek learning and their own discoveries. Roman numerals were Europe’s own, and the press and longbow came from elsewhere.'],
      ['Which cities were capitals of a caliphate? Choose all that fit.', ['Damascus', 'Baghdad'], ['Paris', 'Aachen', 'Rome', 'London'], 'The Umayyads ruled from Damascus and the Abbasids from Baghdad. Aachen was Charlemagne’s capital.'],
    ],
  },
  'The Vikings': {
    typed: [
      ['Which island monastery did Vikings raid in 793?', ['Lindisfarne', 'Holy Island'], 'The raid on Lindisfarne, off northeast England, shocked Christian Europe.'],
      ['Which Viking reached North America around the year 1000?', ['Leif Erikson', 'Leif Ericson', 'Leif Eriksson', 'Leif Ericsson', 'Leif'], 'Leif Erikson, son of Erik the Red, landed in a place the sagas call Vinland.'],
      ['Which Viking leader was given the land that became Normandy in 911?', ['Rollo'], 'The French king gave Rollo land in northern France to stop the raids.'],
      ['What kind of ship did the Vikings sail on their raids?', ['longship', 'longships', 'a longship'], 'Longships were long, light and shallow, so they could cross seas and row up rivers.'],
    ],
    pairs: [['Lindisfarne', 'monastery raided in 793'], ['Rollo', 'given Normandy in 911'], ['Leif Erikson', 'reached North America'], ['Erik the Red', 'settled Greenland'], ['Longship', 'shallow ship for seas and rivers'], ['Scandinavia', 'where the Vikings came from']],
    multi: [
      ['Where did Vikings settle? Choose all that fit.', ['Iceland', 'Greenland', 'Normandy'], ['Egypt', 'Mali', 'Japan'], 'Vikings settled Iceland, Greenland, Normandy, and parts of Britain and Ireland.'],
      ['Which of today’s countries did the Vikings come from? Choose all that fit.', ['Norway', 'Denmark', 'Sweden'], ['Italy', 'Spain', 'Hungary'], 'The Vikings came from Scandinavia: Norway, Denmark and Sweden.'],
    ],
  },
  'Feudalism and the manor': {
    typed: [
      ['Under feudalism, what was the land a lord granted to a vassal called?', ['fief', 'a fief', 'fee', 'feud'], 'A fief was land held in return for loyalty and service.'],
      ['What were the peasants called who were bound to a lord’s land?', ['serfs', 'serf', 'villeins', 'villein'], 'Serfs worked the lord’s land and could not leave the manor without his permission.'],
      ['What was a lord’s estate, with its village and fields, called?', ['manor', 'a manor', 'the manor'], 'The manor was the lord’s house, the village, its fields, mill and church.'],
      ['What did a page become next, on the way to being a knight?', ['squire', 'a squire'], 'A page served in a lord’s household, then became a squire who served a knight.'],
    ],
    pairs: [['Fief', 'land granted for service'], ['Vassal', 'holds land from a lord'], ['Serf', 'peasant bound to the manor'], ['Manor', 'a lord’s estate and village'], ['Knight', 'fights for his lord'], ['Squire', 'a knight’s young helper']],
    multi: [
      ['What did serfs owe their lord? Choose all that fit.', ['Work on the lord’s fields', 'A share of their crops', 'Fees to use his mill'], ['Service as a knight', 'A vote in Parliament', 'A tenth of their land each year'], 'Serfs paid in labor, in produce and in fees. Knights owed military service, and the tithe (a tenth) went to the Church, not the lord.'],
      ['What would you find on a manor? Choose all that fit.', ['The lord’s house', 'A village of peasants', 'Fields, a mill and a church'], ['A university', 'A royal parliament', 'A printing press'], 'A manor was a farming estate: the lord’s house, the village and everything it needed to feed itself.'],
      ['What did a lord give his vassals? Choose all that fit.', ['Land (a fief)', 'Protection'], ['Weekly wages', 'A seat in Parliament', 'Freedom from all duties'], 'A lord granted land and protection. In return the vassal owed loyalty and service.'],
    ],
    tf: [
      ['Serfs could leave the manor whenever they liked.', false, 'Serfs were bound to the manor and needed the lord’s permission to leave.'],
      ['A knight held land in return for military service.', true, 'Knights held fiefs in return for fighting for their lord.'],
      ['Most people in medieval Europe were knights.', false, 'About nine in ten people were peasants who farmed.'],
      ['A vassal promised loyalty to his lord.', true, 'Loyalty in return for land was the heart of the feudal bond.'],
      ['The king was at the bottom of the feudal system.', false, 'The king was at the top. The peasants were at the bottom.'],
    ],
  },
  'The medieval Church': {
    typed: [
      ['What was the tenth of their produce that people gave the Church called?', ['tithe', 'a tithe', 'the tithe', 'tithes'], 'The tithe was a tenth of crops or income, given to the Church.'],
      ['What is it called when the Church cuts someone off from its sacraments?', ['excommunication', 'excommunicated', 'being excommunicated'], 'Excommunication shut a person out of the Church.'],
      ['At which castle did Emperor Henry IV wait in the snow in 1077?', ['Canossa'], 'Henry IV waited three days at Canossa, in Italy, for Pope Gregory VII to forgive him.'],
    ],
    pairs: [['Tithe', 'a tenth given to the Church'], ['Excommunication', 'being cut off from the Church'], ['Great Schism', 'split into Catholic and Orthodox'], ['Canossa', 'where Henry IV begged forgiveness'], ['Monastery', 'where monks lived, prayed and worked'], ['Gregory VII', 'pope in the Investiture Controversy']],
    multi: [
      ['What did monks do in monasteries? Choose all that fit.', ['Prayed', 'Copied books by hand', 'Farmed and worked'], ['Collected the king’s taxes', 'Trained knights for war', 'Ran craft guilds'], 'Monks lived by prayer and work, and copied books. Taxes, knights and guilds belonged to kings, lords and towns.'],
      ['Which two churches came out of the Great Schism of 1054? Choose both.', ['The Roman Catholic Church', 'The Eastern Orthodox Church'], ['The Church of England', 'The Lutheran Church', 'The Methodist Church'], 'The Church split into Catholic west and Orthodox east. The Protestant churches came from the Reformation in the 1500s and later.'],
    ],
  },
  'The Norman Conquest': {
    typed: [
      ['Who won the Battle of Hastings in 1066?', ['William', 'William the Conqueror', 'William I', 'William of Normandy', 'Duke William'], 'William, Duke of Normandy, became King William I.'],
      ['Which English king was killed at the Battle of Hastings?', ['Harold', 'Harold II', 'Harold Godwinson', 'King Harold'], 'Harold II died at Hastings, weeks after beating a Norwegian invasion.'],
      ['What was William’s great survey of England in 1086 called?', ['Domesday Book', 'the Domesday Book', 'Domesday'], 'The Domesday Book recorded who held what land and what it was worth.'],
      ['Which long embroidered cloth tells the story of 1066?', ['Bayeux Tapestry', 'the Bayeux Tapestry', 'Bayeux'], 'The Bayeux Tapestry shows the events up to and including Hastings.'],
    ],
    pairs: [['William I', 'Duke of Normandy who won in 1066'], ['Harold II', 'English king killed at Hastings'], ['Harald Hardrada', 'Norwegian king beaten at Stamford Bridge'], ['Domesday Book', 'survey of land and property'], ['Bayeux Tapestry', 'the story told in embroidery'], ['Motte and bailey', 'a quick castle of earth and timber']],
    multi: [
      ['How did the Normans keep control of England? Choose all that fit.', ['Building castles', 'Giving land to Norman lords', 'Surveying the land in the Domesday Book'], ['Sealing Magna Carta', 'Calling a Parliament every year', 'Letting the English choose their king'], 'Castles, Norman lords on English land, and a record of everything to tax kept the Normans in charge. Magna Carta and Parliament came later.'],
      ['Who claimed the English crown in 1066? Choose all that fit.', ['Harold Godwinson', 'William of Normandy', 'Harald Hardrada'], ['Charlemagne', 'Richard the Lionheart', 'King John'], 'Harold was crowned, and both William and the Norwegian king Harald Hardrada invaded to take the crown.'],
    ],
  },
  'The Crusades': {
    typed: [
      ['Which pope called the First Crusade in 1095?', ['Urban II', 'Pope Urban II', 'Urban'], 'Urban II called for the crusade at Clermont in 1095.'],
      ['Which sultan retook Jerusalem in 1187?', ['Saladin', 'Salah ad-Din', 'Salah al-Din', 'Salahuddin'], 'Saladin won at Hattin and then took Jerusalem.'],
      ['Which English king, called the Lionheart, led the Third Crusade?', ['Richard', 'Richard I', 'Richard the Lionheart', 'King Richard'], 'Richard I fought Saladin but did not retake Jerusalem.'],
    ],
    pairs: [['Urban II', 'called the First Crusade'], ['Saladin', 'retook Jerusalem in 1187'], ['Richard the Lionheart', 'led the Third Crusade'], ['First Crusade', 'captured Jerusalem in 1099'], ['Fourth Crusade', 'sacked Constantinople in 1204'], ['Hattin', 'battle where Saladin beat the crusaders']],
    multi: [
      ['Which of these were results of the Crusades? Choose all that fit.', ['More trade between Europe and the east', 'Spices and silk more common in Europe', 'A weaker Byzantine Empire after 1204'], ['Christian rule of Jerusalem to this day', 'The end of feudalism', 'The Black Death'], 'Trade and contact grew, and the sack of 1204 crippled the Byzantines. Jerusalem was lost again in 1187, and feudalism and the plague are other stories.'],
      ['Which crusades are matched with what they did? Choose all that are right.', ['The First took Jerusalem', 'The Third fought Saladin', 'The Fourth sacked Constantinople'], ['The First sacked Constantinople', 'The Third took Jerusalem for good', 'The Fourth was called by Urban II'], 'The First took Jerusalem (1099), the Third fought Saladin (1189–1192), and the Fourth sacked Constantinople (1204). Urban II called the First.'],
    ],
  },
  'Magna Carta and the power of kings': {
    typed: [
      ['Which king sealed Magna Carta in 1215?', ['John', 'King John', 'John of England', 'John Lackland'], 'King John was forced into it by his barons.'],
      ['In which meadow by the River Thames was Magna Carta sealed?', ['Runnymede'], 'King John met the barons at Runnymede, near Windsor.'],
      ['What did the meetings that kings called to agree to taxes grow into?', ['Parliament', 'a parliament', 'the Parliament'], 'Kings needed consent for taxes, and those meetings grew into Parliament.'],
    ],
    pairs: [['King John', 'sealed Magna Carta'], ['The barons', 'forced the king to agree'], ['Runnymede', 'where it was sealed'], ['Edward I', 'called the Model Parliament'], ['Magna Carta', 'the king must obey the law'], ['Parliament', 'grew from meetings to agree taxes']],
    multi: [
      ['What made the barons rebel against King John? Choose all that fit.', ['Heavy taxes', 'Losing wars and lands in France', 'Punishing people without the law'], ['The Black Death', 'A Viking invasion', 'The fall of Constantinople'], 'John taxed hard, lost Normandy and ruled as he liked. The plague, the Vikings and 1453 belong to other centuries.'],
      ['Which ideas come from Magna Carta? Choose all that fit.', ['The king is under the law', 'No free man punished except by the law'], ['Everyone may vote', 'Serfs are set free', 'Taxes are banned'], 'Magna Carta put the king under the law and promised free men the law’s protection. Votes for all and an end to serfdom came much later.'],
    ],
  },
  'Towns, guilds and learning': {
    typed: [
      ['What was an association of craftsmen or merchants in a town called?', ['guild', 'a guild', 'guilds', 'gild'], 'Guilds controlled a trade: who worked in it, how and at what price.'],
      ['What was a guild member called after an apprentice and before a master?', ['journeyman', 'a journeyman', 'journeymen'], 'A journeyman was a trained worker, paid by the day.'],
      ['Which style of cathedral used pointed arches and flying buttresses?', ['Gothic', 'the Gothic style'], 'Gothic builders carried the weight outside the walls, so the walls could be tall and full of glass.'],
      ['In which Italian city is the oldest university still running in Europe?', ['Bologna'], 'The University of Bologna is traditionally dated to 1088.'],
    ],
    pairs: [['Guild', 'sets prices and quality in a trade'], ['Apprentice', 'learns a craft from a master'], ['Journeyman', 'a trained worker paid by the day'], ['Flying buttress', 'props up a tall Gothic wall'], ['Thomas Aquinas', 'joined faith with Aristotle'], ['Bologna', 'the oldest university still running']],
    multi: [
      ['Which are features of Gothic cathedrals? Choose all that fit.', ['Pointed arches', 'Flying buttresses', 'Large stained-glass windows'], ['Round arches and thick walls', 'Steel frames', 'Flat concrete roofs'], 'Gothic means pointed arches, flying buttresses and stained glass. Round arches and thick walls are the older Romanesque style.'],
      ['What did a guild do? Choose all that fit.', ['Set prices', 'Checked the quality of work', 'Trained apprentices'], ['Collected tithes', 'Raised armies for the king', 'Ran the universities'], 'Guilds ran their trade in the town. Tithes went to the Church, and armies and universities were run by others.'],
    ],
  },
  'The Black Death': {
    typed: [
      ['Which animals carried the fleas that spread the Black Death?', ['rats', 'rat', 'black rats'], 'Fleas living on black rats carried the plague along trade routes.'],
      ['Who led the Peasants’ Revolt of 1381?', ['Wat Tyler', 'Tyler'], 'Wat Tyler led the rebels into London and was killed meeting the king.'],
      ['What new tax set off the Peasants’ Revolt of 1381?', ['poll tax', 'a poll tax', 'the poll tax'], 'A poll tax charged every person the same, rich or poor.'],
    ],
    pairs: [['Fleas', 'carried the plague from rats'], ['Wat Tyler', 'led the Peasants’ Revolt'], ['Poll tax', 'a tax on every person'], ['Richard II', 'young king who met the rebels'], ['Scarce workers', 'could ask for higher wages'], ['Trade ships', 'brought the plague to Europe']],
    multi: [
      ['Which were results of the Black Death? Choose all that fit.', ['Higher wages for workers', 'Fewer people to farm the land', 'Serfdom slowly fading'], ['More serfs than ever', 'Lower wages', 'The end of the Hundred Years’ War'], 'With so many dead, workers were scarce, wages rose and serfdom weakened. The Hundred Years’ War went on until 1453.'],
      ['How did the plague spread? Choose all that fit.', ['Fleas on rats', 'Ships and trade routes', 'Coughing, from person to person'], ['Bad smells alone', 'Eating fish', 'Sunlight'], 'Fleas on rats rode ships and caravans, and the lung form passed by coughing. People then blamed bad air, but it was not the cause.'],
    ],
  },
  'The Hundred Years’ War': {
    typed: [
      ['Who led the French to lift the siege of Orléans in 1429?', ['Joan of Arc', 'Jeanne d’Arc', 'Jeanne d\'Arc', 'Joan', 'Saint Joan'], 'Joan of Arc inspired the French to victory at Orléans.'],
      ['Which weapon won English victories at Crécy and Agincourt?', ['longbow', 'the longbow', 'longbows', 'the English longbow'], 'Longbowmen could shoot fast and far, cutting down charging knights.'],
      ['Which English king won the Battle of Agincourt in 1415?', ['Henry V', 'Henry the Fifth', 'King Henry V', 'Henry 5'], 'Henry V’s small army beat a much bigger French one.'],
    ],
    pairs: [['Joan of Arc', 'lifted the siege of Orléans'], ['Henry V', 'won at Agincourt'], ['Longbow', 'English weapon that beat the knights'], ['Crécy', 'an early English victory, 1346'], ['Calais', 'the only French land England kept'], ['Orléans', 'the French turning point, 1429']],
    multi: [
      ['Which two kingdoms fought the Hundred Years’ War? Choose both.', ['England', 'France'], ['Poland', 'Hungary', 'Venice'], 'English kings claimed the French throne, so England and France fought from 1337 to 1453.'],
      ['Which were English victories in the Hundred Years’ War? Choose all that fit.', ['Crécy', 'Agincourt'], ['Orléans', 'Hastings', 'Tours'], 'Crécy (1346) and Agincourt (1415) were English wins. At Orléans (1429) the French turned the war, and Hastings and Tours belong to other wars.'],
    ],
  },
  'The end of the Middle Ages': {
    typed: [
      ['Who built a printing press with movable type in Europe, around 1450?', ['Gutenberg', 'Johannes Gutenberg', 'Johann Gutenberg'], 'Johannes Gutenberg, in Mainz, printed books far faster than they could be copied by hand.'],
      ['Which Ottoman sultan captured Constantinople in 1453?', ['Mehmed II', 'Mehmed', 'Mehmet II', 'Mehmet', 'Mehmed the Conqueror'], 'Mehmed II broke the walls with huge cannons.'],
      ['What was the “rebirth” of Greek and Roman learning that began in Italy called?', ['Renaissance', 'the Renaissance'], 'Renaissance means rebirth. It spread from Italian cities across Europe.'],
      ['Which city in Spain fell in 1492, ending the Reconquista?', ['Granada'], 'Ferdinand and Isabella took Granada, the last Muslim kingdom in Spain.'],
    ],
    pairs: [['Gutenberg', 'printing with movable type'], ['Mehmed II', 'took Constantinople'], ['Granada', 'last Muslim kingdom in Spain'], ['Renaissance', 'rebirth of Greek and Roman learning'], ['Ferdinand and Isabella', 'completed the Reconquista'], ['Ottoman Turks', 'made Istanbul their capital']],
    multi: [
      ['Which of these happened near the end of the Middle Ages, between 1450 and 1500? Choose all that fit.', ['The fall of Constantinople', 'Gutenberg’s printing press', 'The fall of Granada'], ['Charlemagne’s coronation', 'The Norman Conquest', 'Magna Carta'], 'Constantinople fell in 1453, Gutenberg printed around 1450 and Granada fell in 1492. The others were in 800, 1066 and 1215.'],
      ['Why did the printing press matter? Choose all that fit.', ['Books became cheaper', 'Ideas spread much faster', 'More people learned to read'], ['It ended the Black Death', 'It let kings stop all new ideas', 'It was the first way to write at all'], 'Printed books were cheaper and quicker to make, so ideas spread fast and more people read.'],
    ],
  },
  'The wider medieval world': {
    typed: [
      ['Which ruler of Mali made a famous golden pilgrimage to Mecca in 1324?', ['Mansa Musa', 'Musa', 'Musa I'], 'Mansa Musa carried so much gold that he lowered its price in Cairo.'],
      ['Who united the Mongol tribes in 1206?', ['Genghis Khan', 'Chinggis Khan', 'Temujin', 'Genghis'], 'Genghis Khan, born Temujin, founded the Mongol Empire.'],
      ['What was the title of the military ruler of medieval Japan?', ['shogun', 'the shogun'], 'From 1192 the shogun held the real power. The emperor reigned in name.'],
      ['Which Aztec city was built on an island in a lake?', ['Tenochtitlan', 'Tenochtitlán'], 'Tenochtitlan stood on Lake Texcoco, where Mexico City is now.'],
    ],
    pairs: [['Mansa Musa', 'ruler of Mali'], ['Genghis Khan', 'founded the Mongol Empire'], ['Kublai Khan', 'Mongol ruler of China'], ['Shogun', 'military ruler of Japan'], ['Tenochtitlan', 'Aztec city on a lake'], ['Marco Polo', 'Venetian who wrote about China']],
    multi: [
      ['Which inventions go with Song China? Choose all that fit.', ['Paper money', 'Movable type', 'The compass used at sea'], ['The longbow', 'Gothic arches', 'The motte-and-bailey castle'], 'Song China (960–1279) used paper money, movable type and the magnetic compass.'],
      ['Which of these were outside Europe? Choose all that fit.', ['The Mali Empire', 'The Mongol Empire', 'The Aztec Empire'], ['The Frankish kingdom', 'Normandy', 'The Holy Roman Empire'], 'Mali was in West Africa, the Mongols in Asia, the Aztecs in Mexico. The others were in Europe.'],
    ],
  },
};
// topics too close to share an "odd one out" (a person or word from one could belong to the other)
const NEAR = [
  ['The fall of Rome and the Byzantine Empire', 'The Crusades'], ['The fall of Rome and the Byzantine Empire', 'The end of the Middle Ages'],
  ['The rise of Islam', 'The Crusades'], ['The rise of Islam', 'The wider medieval world'], ['The rise of Islam', 'The end of the Middle Ages'],
  ['The Vikings', 'The Norman Conquest'], ['The Franks and Charlemagne', 'The medieval Church'], ['The medieval Church', 'The Crusades'],
  ['Feudalism and the manor', 'The Norman Conquest'], ['Feudalism and the manor', 'The Black Death'], ['Feudalism and the manor', 'Magna Carta and the power of kings'],
  ['The Hundred Years’ War', 'The end of the Middle Ages'], ['Towns, guilds and learning', 'The end of the Middle Ages'], ['Towns, guilds and learning', 'The medieval Church'],
  ['Magna Carta and the power of kings', 'The Norman Conquest'], ['The Black Death', 'The Hundred Years’ War'],
];
export const near = (a, b) => a === b || NEAR.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
export const TOPICS = BASE.map((t) => ({ ...t, ...MORE[t.name] }));
