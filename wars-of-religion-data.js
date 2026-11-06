// The Wars of Religion, the facts behind the questions: for each of the 5 topics its events (year, the question's words,
// and how it reads on a timeline), its own questions with choices, names and words to type, pairs to match, and sets to
// choose all that fit from. Every date is the usual one in school histories; where historians disagree (how many
// died, who gave an order, how three men survived a fall) the wording says so.

const E = (y, ask, label) => ({ y, ask, label });
export const TOPICS = [
  {
    name: 'The Wars of Religion',
    events: [
      E(1517, 'did Martin Luther publish his 95 Theses', 'Luther’s 95 Theses'),
      E(1555, 'was the Peace of Augsburg agreed', 'The Peace of Augsburg'),
      E(1562, 'did the French Wars of Religion begin', 'The French Wars of Religion begin'),
      E(1568, 'did the Dutch Revolt against Spain begin', 'The Dutch Revolt begins'),
      E(1598, 'was the Edict of Nantes issued', 'The Edict of Nantes'),
    ],
    facts: [
      ['What were the Wars of Religion?', 'Wars in Europe in the 1500s and 1600s, after the Reformation split Christians into Catholics and Protestants', ['Wars between Christians and Muslims over Jerusalem in the 1100s', 'Wars between Rome and Carthage', 'Revolutions against kings in the 1800s', 'Viking wars over Scandinavia'], 'After Luther’s protest of 1517, Western Christians split. For over a century Catholics and Protestants fought across Europe, and rulers often fought for power as much as for faith.'],
      ['Who were the Huguenots?', 'French Protestants, who followed John Calvin’s teaching', ['French Catholic nobles', 'Spanish soldiers', 'German princes', 'The pope’s guards'], 'Huguenots were the Calvinist Protestants of France, a minority that included many powerful nobles.'],
      ['What did the Peace of Augsburg (1555) let each German prince do?', 'Choose Lutheran or Catholic as the faith of his own lands', ['Choose any faith for each of his subjects', 'Become Holy Roman Emperor', 'Stop paying the pope', 'Make Calvinism the only faith'], 'The rule was later summed up as “whose realm, his religion”. Calvinists were left out, which stored up trouble.'],
      ['What did the Edict of Nantes (1598) do?', 'Gave French Protestants the right to worship in many places, ending the French Wars of Religion', ['Banned Protestants from France', 'Made France a Protestant country', 'Ended the Thirty Years’ War', 'Split France into two kingdoms'], 'Henry IV’s edict gave Huguenots freedom of conscience, worship in many places and fortified towns. Louis XIV took it back in 1685.'],
      ['Which king issued the Edict of Nantes?', 'Henry IV of France', ['Charles IX of France', 'Philip II of Spain', 'Louis XIV of France', 'Ferdinand II'], 'Henry IV had been a Protestant himself. He became a Catholic to win Paris, then protected the Huguenots with the edict.'],
      ['Against which country did the Dutch rebel in 1568?', 'Spain', ['France', 'England', 'Sweden', 'Denmark'], 'Dutch rebels, many of them Protestant, rose against Catholic Philip II of Spain, led by William of Orange: the start of the Eighty Years’ War.'],
      ['Why did Philip II of Spain send the Armada against England in 1588?', 'To overthrow Protestant Elizabeth I and bring England back to Catholicism', ['To help England fight France', 'To find a sea route to India', 'To end the Dutch Revolt by marrying Elizabeth’s heir', 'To rescue Henry of Navarre'], 'Philip also wanted England to stop helping the Dutch rebels. Storms and English ships wrecked the Armada.'],
    ],
    typed: [
      ['What were French Protestants called?', ['Huguenots', 'the Huguenots', 'Huguenot'], 'The Huguenots were French Calvinists.'],
      ['Which monk’s 95 Theses of 1517 began the Reformation?', ['Martin Luther', 'Luther'], 'Martin Luther, a German monk, attacked the sale of indulgences in 1517.'],
      ['Which French king issued the Edict of Nantes?', ['Henry IV', 'Henri IV', 'Henry the Fourth', 'Henry 4', 'Henry of Navarre'], 'Henry IV, once Henry of Navarre, ended the French wars with it in 1598.'],
      ['Which 1555 peace let German princes choose Lutheran or Catholic?', ['Peace of Augsburg', 'the Peace of Augsburg', 'Augsburg'], 'The Peace of Augsburg of 1555 ended the first round of fighting in Germany.'],
    ],
    pairs: [['Huguenots', 'French Protestants'], ['Martin Luther', 'began the Reformation in 1517'], ['John Calvin', 'taught the faith the Huguenots followed'], ['Henry IV', 'issued the Edict of Nantes'], ['William of Orange', 'led the Dutch Revolt'], ['Philip II', 'Catholic king of Spain'], ['Peace of Augsburg', '“whose realm, his religion”']],
    multi: [
      ['Which of these were wars of religion? Choose all that fit.', ['The French Wars of Religion', 'The Thirty Years’ War', 'The Dutch Revolt'], ['The Hundred Years’ War', 'The Norman Conquest', 'The Peasants’ Revolt of 1381'], 'All three came after the Reformation. The others were medieval, and not about Catholics against Protestants.'],
      ['Which faiths could a German prince choose under the Peace of Augsburg? Choose all that fit.', ['Lutheranism', 'Catholicism'], ['Calvinism', 'Judaism', 'Anglicanism', 'Islam'], 'Only those two. Calvinists were left out until the Peace of Westphalia in 1648.'],
    ],
  },
  {
    name: 'The St. Bartholomew’s Day Massacre',
    events: [
      E(1572, 'was the St. Bartholomew’s Day Massacre', 'The St. Bartholomew’s Day Massacre'),
      E(1589, 'did Henry of Navarre become King Henry IV of France', 'Henry of Navarre becomes King Henry IV'),
    ],
    facts: [
      ['What was the St. Bartholomew’s Day Massacre?', 'The killing of thousands of French Protestants, starting in Paris in August 1572', ['A battle between France and Spain', 'The killing of Catholics in Prague', 'A plague in Paris', 'The last battle of the Thirty Years’ War'], 'It began on the night of August 23 to 24, 1572, and spread to other French towns for weeks. Estimates of the dead run from about 5,000 to 30,000.'],
      ['What had brought so many Huguenot nobles to Paris in August 1572?', 'The wedding of Henry of Navarre and Margaret of Valois', ['The crowning of Henry IV', 'A peace conference', 'The funeral of Charles IX', 'A meeting with the pope'], 'Protestant Henry was marrying the Catholic king’s sister, a match meant to bring peace.'],
      ['Which Huguenot leader was shot and wounded just before the massacre, then killed when it began?', 'Admiral Gaspard de Coligny', ['Henry of Navarre', 'John Calvin', 'William of Orange', 'Count Thurn'], 'Coligny was wounded on August 22, 1572. He was killed in the first hours of the massacre.'],
      ['Which queen mother is most often blamed for the decision to kill the Huguenot leaders?', 'Catherine de’ Medici', ['Elizabeth I', 'Margaret of Valois', 'Mary, Queen of Scots', 'Anne of Austria'], 'She and her son King Charles IX are usually blamed, though historians still argue over who decided what.'],
      ['How did Henry of Navarre survive the massacre?', 'He agreed to become a Catholic, and was kept at court', ['He fled to England the night before', 'He led an army into Paris', 'He was away in Spain', 'He hid in a monastery for a year'], 'Held at court, he converted under pressure. He escaped in 1576 and went back to Protestantism.'],
      ['How did Pope Gregory XIII respond to the news?', 'He held a service of thanks and had a medal struck', ['He excommunicated the king', 'He sent help to the Huguenots', 'He said nothing at all', 'He declared war on France'], 'The French court described the killings as the defeat of a Protestant plot. Protestant Europe, meanwhile, was horrified.'],
      ['What did the massacre do to the French Wars of Religion?', 'The fighting started again, and many Huguenots stopped trusting the crown', ['It ended them for good', 'It made France Protestant', 'It moved them to Spain', 'It led straight to the Edict of Nantes that year'], 'Peace was another 26 years away. Huguenot writers began arguing that people could resist a king who turned on them.'],
    ],
    typed: [
      ['On which saint’s day did the killings in Paris begin in 1572?', ['St. Bartholomew', 'Saint Bartholomew', 'St Bartholomew', 'Bartholomew', 'St. Bartholomew’s Day', 'St Bartholomews Day', 'Saint Bartholomew’s Day', 'St. Bartholomew\'s Day'], 'August 24 is St. Bartholomew’s Day.'],
      ['Which queen mother of France is most often blamed for the massacre?', ['Catherine de’ Medici', 'Catherine de\' Medici', 'Catherine de Medici', 'Catherine Medici', 'Catherine'], 'Catherine de’ Medici was the mother of King Charles IX.'],
      ['Which Protestant prince’s wedding brought the Huguenot nobles to Paris?', ['Henry of Navarre', 'Henri of Navarre', 'Henry', 'Navarre'], 'Henry of Navarre married Margaret of Valois on August 18, 1572.'],
      ['Which Huguenot admiral was the first target?', ['Coligny', 'Gaspard de Coligny', 'Admiral Coligny', 'Admiral de Coligny'], 'Admiral Gaspard de Coligny was the leading Huguenot at court.'],
    ],
    pairs: [['Henry of Navarre', 'Protestant groom in 1572'], ['Margaret of Valois', 'Catholic bride, the king’s sister'], ['Catherine de’ Medici', 'queen mother of France'], ['Charles IX', 'king of France in 1572'], ['Gaspard de Coligny', 'Huguenot admiral'], ['Gregory XIII', 'pope who gave thanks at the news']],
    multi: [
      ['Which of these were Protestants in 1572? Choose all that fit.', ['Henry of Navarre', 'Gaspard de Coligny'], ['Catherine de’ Medici', 'Charles IX', 'Gregory XIII', 'Margaret of Valois'], 'Henry of Navarre and Coligny led the Huguenots. The others were Catholics.'],
      ['What followed the massacre? Choose all that fit.', ['Fighting in France started again', 'Protestants abroad were horrified', 'Many Huguenots stopped trusting the crown'], ['The Huguenots took over France', 'France became a Protestant country', 'The pope condemned the king'], 'The wars went on until 1598, and Protestant rulers such as Elizabeth I of England were appalled.'],
    ],
  },
  {
    name: 'The Defenestration of Prague',
    events: [
      E(1609, 'did Bohemia’s Protestants get the Letter of Majesty', 'The Letter of Majesty'),
      E(1618, 'was the Defenestration of Prague', 'The Defenestration of Prague'),
    ],
    facts: [
      ['What was the Defenestration of Prague in 1618?', 'Protestant nobles threw two Catholic officials and their secretary out of a castle window', ['A Catholic army burned Prague', 'The emperor was killed in Prague', 'A riot smashed every window in the city', 'A treaty was signed at Prague Castle'], 'On May 23, 1618, angry nobles marched into Prague Castle and threw the men out of a high window.'],
      ['What does “defenestration” mean?', 'Throwing someone out of a window', ['Burning a building down', 'Removing a king from his throne', 'Breaking a treaty', 'Closing a church'], 'It comes from the Latin “fenestra”, a window.'],
      ['What happened to the three men thrown from the window?', 'All three survived', ['All three died', 'Only the secretary survived', 'They were caught by soldiers', 'They were arrested for trespassing'], 'They fell about 70 feet, by the usual figure, and lived. The secretary was later given the noble title “of Highfall”.'],
      ['Why were Bohemia’s Protestants so angry in 1618?', 'Protestant churches had been closed, and a strict Catholic had been named their next king', ['The pope had moved to Prague', 'Sweden had invaded', 'Taxes on windows had doubled', 'The Edict of Nantes had been cancelled'], 'They believed the Letter of Majesty of 1609 protected them, and Ferdinand of Styria looked set to end it.'],
      ['How did Protestant pamphlets explain how the men survived?', 'They said the men landed on a dung heap', ['They said angels caught them', 'They said the men wore armor', 'They said the men fell into a river', 'They said soldiers caught them'], 'Catholics said angels or the Virgin Mary saved them. The dung heap may be a Protestant joke: nobody can be sure.'],
      ['What did the Defenestration start?', 'A Bohemian revolt that grew into the Thirty Years’ War', ['The Reformation', 'The French Wars of Religion', 'The Dutch Revolt', 'The Peace of Augsburg'], 'The rebels set up their own government in Bohemia, and within two years Europe’s powers were being drawn in.'],
      ['What was the Letter of Majesty (1609)?', 'A royal promise of religious freedom for Bohemia’s Protestants', ['A letter from the pope banning Protestants', 'A declaration of war on Sweden', 'A treaty between France and Spain', 'The order that started the Defenestration'], 'Emperor Rudolf II granted it. Arguments over what it allowed helped set off the crisis of 1618.'],
    ],
    typed: [
      ['What word means throwing someone out of a window?', ['defenestration', 'defenestrate', 'defenestrating'], 'From the Latin “fenestra”, a window.'],
      ['In which city was the Defenestration of 1618?', ['Prague', 'Praha'], 'It happened at Prague Castle, in the kingdom of Bohemia.'],
      ['According to Protestants, what broke the men’s fall?', ['a dung heap', 'dung heap', 'dung', 'manure', 'a manure pile', 'manure pile', 'a pile of manure', 'pile of manure', 'dunghill', 'a dunghill', 'poop'], 'A dung heap, they said, though it may have been a joke against the Catholics.'],
      ['Prague was the capital of which kingdom?', ['Bohemia'], 'Bohemia, today the western part of the Czech Republic, was ruled by the Habsburgs.'],
    ],
    pairs: [['Count Thurn', 'led the angry Protestant nobles'], ['Slavata and Martinice', 'the two officials thrown out'], ['Philip Fabricius', 'the secretary, later “of Highfall”'], ['Ferdinand of Styria', 'strict Catholic king-to-be of Bohemia'], ['Letter of Majesty', '1609 promise of religious freedom'], ['Fenestra', 'Latin for a window']],
    multi: [
      ['Who went out of the window? Choose all that fit.', ['Vilém Slavata', 'Jaroslav Martinice', 'Philip Fabricius'], ['Count Thurn', 'Ferdinand of Styria', 'Frederick V'], 'The two Catholic officials and their secretary. Count Thurn led the men who threw them.'],
      ['How did Catholics and Protestants explain the men’s survival? Choose all that fit.', ['Angels or the Virgin Mary saved them', 'They landed on a dung heap'], ['A net caught them', 'They landed in the river', 'The window was on the ground floor', 'They could fly'], 'Catholics told the first story and Protestants the second.'],
    ],
  },
  {
    name: 'The Thirty Years’ War',
    events: [
      E(1620, 'was the Battle of White Mountain', 'The Battle of White Mountain'),
      E(1631, 'was Magdeburg sacked', 'The sack of Magdeburg'),
      E(1632, 'was Gustavus Adolphus killed at Lützen', 'Gustavus Adolphus dies at Lützen'),
      E(1635, 'did France declare war on Spain', 'France joins the war openly'),
    ],
    facts: [
      ['What was the Thirty Years’ War?', 'A war from 1618 to 1648, fought mostly in the Holy Roman Empire, that began over religion and became a fight for power in Europe', ['A war between England and France', 'A crusade to Jerusalem', 'A war fought only in Spain', 'A civil war in England'], 'It began in Bohemia and drew in Denmark, Sweden, France and Spain, most of the fighting being in today’s Germany.'],
      ['Who was the “Winter King”?', 'Frederick V of the Palatinate, who lasted only one winter on Bohemia’s throne', ['Gustavus Adolphus', 'Ferdinand II', 'Wallenstein', 'Christian IV'], 'The Bohemian rebels chose him as king in 1619. He lost everything at White Mountain in 1620.'],
      ['Which Swedish king was called the “Lion of the North”?', 'Gustavus Adolphus', ['Christian IV', 'Frederick V', 'Charles IX', 'Henry IV'], 'He landed in Germany in 1630, won at Breitenfeld in 1631, and was killed at Lützen in 1632.'],
      ['Who was Wallenstein?', 'A commander who raised huge private armies for the emperor', ['The king of Denmark', 'A French cardinal', 'The leader of the Dutch Revolt', 'A Protestant preacher'], 'His armies fed themselves on the lands they crossed. The emperor came to distrust him, and he was assassinated in 1634.'],
      ['Why did Catholic France end up on the Protestant side?', 'To weaken the Habsburgs, France’s great rivals', ['France had turned Protestant', 'The pope ordered it', 'To conquer Sweden', 'To protect Prague’s churches'], 'Cardinal Richelieu paid Sweden to fight, then joined in himself in 1635. Power mattered more than faith.'],
      ['About how many people in the Holy Roman Empire died in the war?', 'Perhaps a third, mostly from hunger and disease', ['Almost none', 'About one in a hundred', 'Everyone in the Empire', 'Only soldiers'], 'Estimates vary, and some regions lost more than half. It was one of the deadliest wars in Europe’s history.'],
      ['What happened at Magdeburg in 1631?', 'An imperial army sacked the Protestant city, and most of its people died', ['Sweden signed a peace', 'The war was declared over', 'Protestants threw officials from a window', 'Gustavus Adolphus was crowned'], 'About 20,000 people died. The news turned many Protestants against the emperor for good.'],
      ['Which family ruled both the Holy Roman Empire and Spain?', 'The Habsburgs', ['The Bourbons', 'The Tudors', 'The Medici', 'The Vasas'], 'France feared being surrounded by Habsburg lands, which is why it fought them.'],
    ],
    typed: [
      ['Which Swedish king was called the “Lion of the North”?', ['Gustavus Adolphus', 'Gustav Adolf', 'Gustavus', 'Gustav II Adolf', 'Gustavus Adolphus of Sweden'], 'Gustavus Adolphus turned the war around for the Protestants.'],
      ['Which of the emperor’s commanders was assassinated in 1634?', ['Wallenstein', 'Albrecht von Wallenstein', 'Waldstein'], 'Albrecht von Wallenstein was killed on the emperor’s suspicion of treason.'],
      ['Which French cardinal brought Catholic France in against the Habsburgs?', ['Richelieu', 'Cardinal Richelieu'], 'Cardinal Richelieu ran France for King Louis XIII.'],
      ['What was Frederick V’s nickname, after his one winter on the throne of Bohemia?', ['the Winter King', 'Winter King'], 'He lost the throne after the Battle of White Mountain.'],
      ['Which family ruled both the Holy Roman Empire and Spain?', ['Habsburgs', 'the Habsburgs', 'Habsburg', 'Hapsburgs', 'the Hapsburgs', 'Hapsburg'], 'The Habsburgs held the throne of the Empire and of Spain.'],
    ],
    pairs: [['Frederick V', 'the “Winter King”'], ['Ferdinand II', 'Catholic Holy Roman Emperor'], ['Wallenstein', 'raised huge armies for the emperor'], ['Gustavus Adolphus', 'the “Lion of the North”'], ['Cardinal Richelieu', 'brought France in against the Habsburgs'], ['Christian IV', 'king of Denmark who joined in 1625'], ['Magdeburg', 'city sacked in 1631'], ['White Mountain', 'battle that crushed the Bohemian rebels']],
    multi: [
      ['Which countries joined the fighting? Choose all that fit.', ['Denmark', 'Sweden', 'France', 'Spain'], ['Japan', 'Persia', 'Mexico'], 'A fight in Bohemia drew in much of Europe.'],
      ['What made the war so deadly for ordinary people? Choose all that fit.', ['Armies took their food from the land', 'Plague and other diseases', 'Famine'], ['Poison gas', 'Air raids', 'Long sea voyages'], 'Most of the dead never saw a battle: they died of hunger and disease as armies moved through.'],
    ],
  },
  {
    name: 'The Peace of Westphalia',
    events: [
      E(1644, 'did the peace talks in Westphalia begin', 'Peace talks begin in Westphalia'),
      E(1648, 'was the Peace of Westphalia signed', 'The Peace of Westphalia'),
    ],
    facts: [
      ['What was the Peace of Westphalia?', 'The treaties of 1648 that ended the Thirty Years’ War', ['The treaty that started the Thirty Years’ War', 'A peace between England and Scotland', 'The edict that ended the French Wars of Religion', 'A pact between the pope and Luther'], 'It was signed in two towns in Westphalia, in northwest Germany, after years of talks.'],
      ['In which two towns was the peace worked out?', 'Münster and Osnabrück', ['Paris and Madrid', 'Prague and Vienna', 'Augsburg and Nantes', 'Rome and Geneva'], 'Catholic powers met at Münster and Protestant powers at Osnabrück, about 30 miles apart, with messengers riding between.'],
      ['What did Westphalia add to the Peace of Augsburg?', 'Calvinism joined Catholicism and Lutheranism as a recognized faith', ['Islam became a recognized faith', 'All religion was banned', 'Everyone had to be Catholic', 'The pope lost his title'], 'Calvinists had been left out in 1555. Now rulers could choose among the three.'],
      ['Which two countries had their independence recognized?', 'The Dutch Republic and Switzerland', ['Bohemia and Hungary', 'France and Spain', 'England and Scotland', 'Sweden and Denmark'], 'Spain finally accepted Dutch independence after 80 years of war, and the Swiss were recognized as outside the Empire.'],
      ['Why is Westphalia remembered by people who study politics?', 'For the idea that each state runs its own affairs without outsiders deciding for it', ['For creating the United Nations', 'For ending all war in Europe', 'For giving everyone the vote', 'For uniting Germany'], 'This idea is called sovereignty. Historians argue over how much the treaties really created it, but the name stuck.'],
      ['What happened to the Holy Roman Emperor’s power?', 'It shrank: the 300 or so German states ran more of their own affairs', ['It grew until he ruled all of Europe', 'It stayed just as it was', 'The title was abolished in 1648', 'He gained France'], 'Each state could now make its own alliances, as long as they weren’t against the emperor.'],
      ['Which war carried on after 1648?', 'France against Spain, until 1659', ['Sweden against Denmark, for 100 more years', 'England against the Dutch, for 30 years', 'Bohemia against the emperor, until 1700', 'None: Europe was at peace for a century'], 'The peace didn’t settle everything: France and Spain fought on for 11 more years.'],
      ['Which two powers came out of the war stronger?', 'France and Sweden', ['Spain and Bohemia', 'Denmark and Poland', 'England and Portugal', 'The Holy Roman Empire and Spain'], 'France gained land such as parts of Alsace, and Sweden gained land on the Baltic coast of Germany.'],
    ],
    typed: [
      ['Which region of Germany gave the peace of 1648 its name?', ['Westphalia'], 'Münster and Osnabrück are both in Westphalia.'],
      ['In which town did the Catholic powers meet?', ['Münster', 'Munster', 'Muenster'], 'France, Spain and the emperor’s men met at Münster.'],
      ['In which town did the Protestant powers meet?', ['Osnabrück', 'Osnabruck', 'Osnabrueck'], 'Sweden and the Protestant states met at Osnabrück.'],
      ['What word means a state’s right to run its own affairs?', ['sovereignty'], 'The idea is often called Westphalian sovereignty.'],
      ['Which third faith was recognized alongside Catholicism and Lutheranism?', ['Calvinism', 'Calvinist', 'Calvinists', 'the Reformed faith', 'Reformed'], 'Calvinism, left out in 1555, was recognized in 1648.'],
    ],
    pairs: [['Münster', 'where the Catholic powers met'], ['Osnabrück', 'where the Protestant powers met'], ['Sovereignty', 'a state’s right to run its own affairs'], ['Dutch Republic', 'independent of Spain at last'], ['Switzerland', 'recognized as outside the Empire'], ['Calvinism', 'added to the faiths a ruler could choose'], ['Innocent X', 'pope who condemned the treaties']],
    multi: [
      ['What did the Peace of Westphalia do? Choose all that fit.', ['Ended the Thirty Years’ War', 'Recognized Calvinism', 'Recognized Dutch and Swiss independence'], ['Made Germany one united country', 'Ended the war between France and Spain', 'Gave every person freedom to choose a faith'], 'Germany stayed split into about 300 states, France and Spain fought on until 1659, and it was mostly rulers who chose the faith.'],
      ['Which of these gained land in 1648? Choose all that fit.', ['France', 'Sweden'], ['Spain', 'Denmark', 'Bohemia'], 'France gained parts of Alsace, and Sweden gained land on the Baltic coast of Germany.'],
    ],
  },
];

// topics too close to share an "odd one out" (the first is all of it, so it takes its odd one from another time)
const NEAR = [
  ['The Wars of Religion', 'The St. Bartholomew’s Day Massacre'], ['The Wars of Religion', 'The Defenestration of Prague'], ['The Wars of Religion', 'The Thirty Years’ War'], ['The Wars of Religion', 'The Peace of Westphalia'],
  ['The Defenestration of Prague', 'The Thirty Years’ War'], ['The Thirty Years’ War', 'The Peace of Westphalia'],
];
export const near = (a, b) => a === b || NEAR.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
