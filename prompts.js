// What there is to write about, each with a model to compare with afterwards. The models are written for this course. Their facts
// are real, and the two passages and three sources marked as made up are made up. The poems and the speech from Macbeth are out of
// copyright.
//
// A prompt is { id, group, kind, emoji, title, prompt, minutes, target, text?, sources?, note?, model }. kind is what checks.js
// looks for. A model is a list of paragraphs, each a list of [part, words]. The parts are the keys of PARTS below.

export const PARTS = {
  way: 'Way in',
  context: 'Context',
  thesis: 'Thesis',
  point: 'Point',
  ev: 'Evidence',
  an: 'Explaining it',
  link: 'Link',
  other: 'The other side',
  answer: 'The answer',
  end: 'The ending',
};

export const GROUPS = [
  { id: 'argue', name: 'Say what you think', blurb: 'Take a side and prove it.' },
  { id: 'text', name: 'Write about a text', blurb: 'Poems, a play, a story and a speech, all here on the page.' },
  { id: 'sources', name: 'Use what you’re given', blurb: 'Build an argument from evidence.' },
  { id: 'short', name: 'Just a paragraph', blurb: 'Ten minutes, one job.' },
];

const HOPE = {
  title: '“Hope” is the thing with feathers',
  by: 'Emily Dickinson',
  lines: `“Hope” is the thing with feathers -
That perches in the soul -
And sings the tune without the words -
And never stops - at all -

And sweetest - in the Gale - is heard -
And sore must be the storm -
That could abash the little Bird
That kept so many warm -

I’ve heard it in the chillest land -
And on the strangest Sea -
Yet - never - in Extremity,
It asked a crumb - of me.`,
};
const ROAD = {
  title: 'The Road Not Taken',
  by: 'Robert Frost',
  lines: `Two roads diverged in a yellow wood,
And sorry I could not travel both
And be one traveler, long I stood
And looked down one as far as I could
To where it bent in the undergrowth;

Then took the other, as just as fair,
And having perhaps the better claim,
Because it was grassy and wanted wear;
Though as for that the passing there
Had worn them really about the same,

And both that morning equally lay
In leaves no step had trodden black.
Oh, I kept the first for another day!
Yet knowing how way leads on to way,
I doubted if I should ever come back.

I shall be telling this with a sigh
Somewhere ages and ages hence:
Two roads diverged in a wood, and I—
I took the one less traveled by,
And that has made all the difference.`,
};
const TOMORROW = {
  title: 'from Macbeth, Act 5, Scene 5',
  by: 'William Shakespeare',
  note: 'Macbeth has just been told that his wife is dead, and his enemies are closing in.',
  lines: `Tomorrow, and tomorrow, and tomorrow,
Creeps in this petty pace from day to day,
To the last syllable of recorded time;
And all our yesterdays have lighted fools
The way to dusty death. Out, out, brief candle!
Life’s but a walking shadow, a poor player
That struts and frets his hour upon the stage
And then is heard no more. It is a tale
Told by an idiot, full of sound and fury,
Signifying nothing.`,
};
const CROSSING = {
  title: 'The Crossing',
  by: 'Written for this course',
  body: 'Lena tested the ice with one boot. It held. The far bank was two hundred yards away, close enough to see the smoke from the Aldens’ chimney, and the road around the lake would take until dark. Behind her, the dog whined and would not come. She took a step, then another. For a while there was only the squeak of snow and her own breath. Halfway across, she stopped to shift the bag on her shoulder, and in the quiet she heard it: a long, low note, somewhere under her feet, like someone drawing a bow across a cello. It stopped. The dog had stopped whining. Lena did not look down. She looked at the smoke, and she began, very slowly, to walk.',
};
const ROUTE9 = {
  title: 'Speech to the town council',
  by: 'Dana Reyes, a made up speaker. Written for this course.',
  body: 'Members of the council, my name is Dana Reyes, and I have ridden the Route 9 bus for eleven years. I learned to read on that bus, from the ads above the windows. You are told that Route 9 carries only two hundred people a day. Two hundred. It sounds small, doesn’t it? But those two hundred are the nurse who gets to the night shift, the grandfather who gets to his dialysis, the girl who gets to the only school in town that teaches welding. Cut this bus and you will save forty thousand dollars a year. You will also tell each of them that their morning matters less than a rounding error in the budget. I don’t believe you want to say that. I don’t believe you have to. Keep the bus running, and let us all get where we are going.',
};

export const PROMPTS = [
  // ---------- say what you think ----------
  {
    id: 'late-start', group: 'argue', kind: 'argue', emoji: '⏰', minutes: 40, title: 'Should high schools start later?',
    prompt: 'Should high schools start later in the morning? Argue your position.',
    model: [
      [['way', 'At 7:30 on a Tuesday morning, a third of a chemistry class is awake.'], ['context', 'Scenes like this are ordinary in American high schools, many of which still open before 8:00, mostly because bus schedules were built that way decades ago.'], ['thesis', 'High schools should start later, because teenagers’ sleep patterns make early classes a poor use of everyone’s time, and the cost of changing is small next to what students would gain.']],
      [['point', 'The first reason is biological: teenagers cannot simply go to bed earlier.'], ['ev', 'During puberty the body clock shifts later, and for that reason the American Academy of Pediatrics recommended in 2014 that middle and high schools start at 8:30 or later.'], ['an', 'This means that an early bell does not move a teenager’s sleep. It removes it. A student who cannot fall asleep before eleven and must be up by six is short of sleep every school night, however good their habits are.'], ['link', 'If the problem is built into the body, advice about bedtime will not solve it, but a timetable can.']],
      [['point', 'Schools that have moved their bell show that a timetable really can.'], ['ev', 'When Seattle’s high schools moved from 7:50 to 8:45 in 2016, researchers found that students slept about 34 minutes longer each night and that their grades rose by about 4.5 percent.'], ['an', 'What makes this striking is that nothing else changed: there were no new rules about phones and no lessons on sleep. Students used the extra time to do what their bodies had been asking for all along.'], ['link', 'Half an hour may sound small, but it comes back every night of the school year.']],
      [['other', 'Critics point out that later starts would mean rearranging buses, sports practices and after-school jobs. Those are real costs, and they fall hardest on families with tight schedules.'], ['answer', 'But they are the costs of changing over, not of the new schedule itself, and California, which in 2022 became the first state to require later high school start times, shows that even a whole state can manage it.'], ['an', 'Schools reorganize their timetables for building work and exam weeks without calling it impossible. A one-time headache should not outweigh a benefit that lasts four years for every student.']],
      [['end', 'A later bell will not fix everything about high school. But at the moment, schools ask teenagers to do their hardest thinking at the hour they are least able to. Moving the bell is one of the few changes that costs little and helps every student on every school day, and that should make it an easy decision.']],
    ],
  },
  {
    id: 'phones', group: 'argue', kind: 'argue', emoji: '📵', minutes: 40, title: 'Should phones be banned at school?',
    prompt: 'Should phones be banned during the school day? Argue your position.',
    model: [
      [['way', 'In the middle of a math lesson, a phone buzzes in a bag at the back of the room, and six heads turn.'], ['context', 'The buzz lasts two seconds, but getting back to the problem on the board takes much longer, and scenes like it happen in every class, every day.'], ['thesis', 'Phones should be locked away during the school day, because they cost students attention that cannot be won back, and they cost the most to the students who can least afford it.']],
      [['point', 'The main problem with phones in school is that they split attention even when nobody is using them.'], ['ev', 'A 2023 UNESCO report warned that simply having a phone nearby can distract students from their work.'], ['an', 'This matters because a lesson builds from one minute to the next. A student who looks away for a notification loses those seconds and also the step of the explanation that came during them, and the next step depends on it.'], ['link', 'Asking students to ignore a device designed to interrupt them is asking willpower to do the job of a rule.']],
      [['point', 'A ban also helps the students who need help the most.'], ['ev', 'In a study of schools in four English cities, Louis-Philippe Beland and Richard Murphy found that test scores rose after phones were banned, and that low-achieving students gained the most.'], ['an', 'Students who are doing well can often afford a distraction, because they can catch up later. Students who are already behind cannot, which means that phones widen a gap that schools are supposed to close.'], ['link', 'A rule that costs strong students little and gives struggling students the most is hard to argue against.']],
      [['other', 'The strongest objection is that parents need to reach their children in an emergency. That worry is reasonable, and no parent should be told to ignore it.'], ['answer', 'But schools handled emergencies through the front office for decades, and they still can, while a phone in a locked pouch can be opened the moment it is needed.'], ['an', 'True emergencies are rare, and the distraction comes every day, so a policy should be built around the problem students have most often.']],
      [['end', 'A ban will not make every student pay attention, and teenagers will still spend their evenings on their phones. But for six hours a day, it would give students something that has become rare: time to think about one thing at a time. That is what school is for, and it is worth protecting.']],
    ],
  },
  {
    id: 'failure', group: 'argue', kind: 'argue', emoji: '🪜', minutes: 40, title: 'Is failing good for you?',
    prompt: 'People often say that failing is good for you. Do you agree? Argue your position, using examples.',
    model: [
      [['way', 'A player who fails the same level of a video game forty times rarely calls it failure.'], ['context', 'The same person can get one bad grade on a chemistry test and decide that they are no good at science.'], ['thesis', 'Failing is good for people only when they can see why it happened and get another try, because without those two things it teaches nothing except how to stop trying.']],
      [['point', 'Failure teaches when the reason for it is clear.'], ['ev', 'In most video games, for example, a player sees at once what went wrong: the jump was too early, or the enemy came from the left.'], ['an', 'That clear feedback is what turns a loss into a lesson, because the next attempt has something to change. A chemistry test that comes back two weeks later with only a number on it offers none of this, which means that a student learns that they failed without learning why.'], ['link', 'The difference lies less in the person than in the information they get.']],
      [['point', 'Failure also needs a second chance to mean anything.'], ['ev', 'J. K. Rowling’s first Harry Potter book was rejected by twelve publishers before one accepted it, and she could keep sending it out because every rejection left the next publisher available.'], ['an', 'Her story is often told as proof that failure builds character, but what it really shows is that she was allowed to try again. A student who fails a final exam with no retake has no thirteenth publisher. For that student, failure is only an ending.'], ['link', 'Schools that want students to learn from mistakes have to leave room to use what they learned.']],
      [['other', 'Some people argue that failure is good for everyone, because it builds resilience. There is truth in this, since people who have never failed can be badly shaken the first time they do.'], ['answer', 'However, resilience does not come from losing as such. Someone who fails over and over with no idea why and no way to improve is more likely to give up than to grow stronger.']],
      [['end', 'The advice to embrace failure sounds kind, but it leaves out what makes failure useful. What students need is a clear reason and another turn, and both of those are in the hands of teachers, coaches and schools. If they are willing to provide them, then failing really can be good for people, and if they are not, it is only failing.']],
    ],
  },
  {
    id: 'voting', group: 'argue', kind: 'argue', emoji: '🗳️', minutes: 40, title: 'Should 16-year-olds vote?',
    prompt: 'Should the voting age be lowered to 16? Argue your position.',
    model: [
      [['way', 'In most of the United States, a sixteen-year-old can drive a car, hold a job and pay taxes on what they earn.'], ['context', 'Yet that same person has no say in who sets those taxes or how much the town spends on their school.'], ['thesis', 'The voting age should be lowered to 16, at least for local elections, because sixteen-year-olds live with the decisions being made, and because voting is a habit best started at home.']],
      [['point', 'The strongest reason is that voting is a habit, and habits form more easily when life is settled.'], ['ev', 'Austria lowered its voting age to 16 in 2007, and researchers found that 16- and 17-year-olds there turned out at higher rates than 18- to 20-year-olds.'], ['an', 'This makes sense once the two groups are compared. An eighteen-year-old is often moving away for college or work, with a new address and no connection to local issues. A sixteen-year-old still lives at home and goes to a local school. Starting at sixteen means that the first vote comes at the moment when voting is easiest.'], ['link', 'A first vote that is easy to cast makes a second one more likely.']],
      [['point', 'Younger voters also have a direct stake in local decisions.'], ['ev', 'School budgets, bus routes and park closures are usually settled at the local level, and in 2013 Takoma Park, Maryland, became the first city in the country to let 16-year-olds vote in its elections.'], ['an', 'Those are the decisions that shape a teenager’s daily life more than almost anything in national politics. It is hard to defend a system in which the people who ride the bus have no voice in whether it keeps running.']],
      [['other', 'Opponents argue that sixteen-year-olds are not mature enough to vote. It is true that teenagers often make poor decisions in the heat of the moment, with friends around and little time to think.'], ['answer', 'But voting is the opposite kind of decision, since it is made calmly, alone and with weeks to consider it. Research on adolescent thinking suggests that by sixteen, most people are about as capable as adults of decisions of that kind. Besides, no adult has to pass a test of maturity before voting.']],
      [['end', 'Lowering the voting age would not change the result of many elections, and it is not meant to. What it would do is bring people into public life while they are still close to home, and tell them that their town takes them seriously. Local elections are the right place to begin.']],
    ],
  },

  // ---------- write about a text ----------
  {
    id: 'hope', group: 'text', kind: 'text', emoji: '🐦', minutes: 40, text: HOPE, title: 'Dickinson’s bird',
    prompt: 'How does Dickinson use the image of a bird to show what hope is like?',
    model: [
      [['way', 'The smallest creature in Emily Dickinson’s poem survives the biggest storm.'], ['context', '“Hope is the thing with feathers” takes an idea that is hard to picture and gives it a body: a small bird that lives inside a person.'], ['thesis', 'Through this image, Dickinson suggests that hope is more powerful than it looks, because it is light, constant and asks nothing in return.']],
      [['point', 'The bird first shows that hope is part of a person and not something they have to go looking for.'], ['ev', 'Dickinson writes that it “perches in the soul” and “sings the tune without the words.”'], ['an', 'To perch is to rest lightly, as if the bird could stay or leave, yet this one never does. The song “without the words” is just as important, because a song with no words has no argument to lose. Hope here does not depend on reasons, which suggests that it can keep going even when the facts are against it.'], ['link', 'This is why the poem can say that it “never stops - at all,” and the next stanza tests that claim.']],
      [['point', 'The storm in the second stanza shows that hope is strongest when it is most needed.'], ['ev', 'The song is “sweetest” in “the Gale,” and the storm would have to be “sore” to “abash the little Bird / That kept so many warm.”'], ['an', 'Calling the bird “little” in the middle of a gale seems to make it more fragile, but the effect is the reverse: if something so small can keep “so many warm,” its strength cannot come from its size. The word “abash” is also surprising, since it means to embarrass and not to destroy. Even the worst storm, Dickinson implies, could only make hope fall silent for a moment.']],
      [['point', 'The last stanza adds what may be the most striking quality of all: hope costs nothing.'], ['ev', 'The speaker has heard it in “the chillest land” and on “the strangest Sea,” yet “never - in Extremity, / It asked a crumb - of me.”'], ['an', 'A real bird would need feeding, especially in a cold place, so the “crumb” reminds the reader of how unnatural this one is. The dashes around “never” slow the line down and make the speaker’s gratitude sound almost surprised. Hope gives warmth and takes nothing, and this makes it unlike anything else a person might rely on in hard times.']],
      [['end', 'Dickinson could have called hope strong or brave, but those words would have described it from outside. By making it a bird, she lets the reader feel how small it is and how much it still does. The poem’s comfort lies in that gap: what keeps people going in the worst moments may be something that weighs almost nothing.']],
    ],
  },
  {
    id: 'road', group: 'text', kind: 'text', emoji: '🌲', minutes: 40, text: ROAD, title: 'Frost’s two roads',
    prompt: 'Is “The Road Not Taken” really about choosing to be different? Argue your view, using the poem.',
    model: [
      [['way', '“The Road Not Taken” is one of the most quoted poems in America, and it is usually quoted as advice: be bold, and take the path that others avoid.'], ['context', 'The last lines seem to say exactly that. Read closely, however, the poem tells a different story.'], ['thesis', 'Frost’s poem is not really about choosing to be different, because the roads turn out to be alike, and the “difference” appears only in the story the speaker plans to tell later.']],
      [['point', 'The poem goes out of its way to show that neither road was the less traveled one.'], ['ev', 'The second road is “just as fair,” and although it seems to have “the better claim” because it “wanted wear,” the speaker corrects himself at once: the passing there “Had worn them really about the same.” The next stanza says that both “equally lay / In leaves no step had trodden black.”'], ['an', 'Three separate phrases insist on the same fact, which is hard to treat as an accident. The word “really” is especially important, since it sounds like someone admitting the truth after being tempted to say otherwise. If the roads were the same, then the choice took no courage at all.'], ['link', 'That makes the poem’s famous ending much stranger than it first appears.']],
      [['point', 'The ending only works as a story the speaker has not yet told.'], ['ev', 'The final stanza is in the future tense: “I shall be telling this with a sigh / Somewhere ages and ages hence.” Only then does he claim to have taken “the one less traveled by,” and that it “has made all the difference.”'], ['an', 'Frost separates what happened in the wood from what the speaker expects to say about it “ages” from now. The older man will tidy up the memory, turning a coin toss into a decision that shaped his life. Readers who quote the ending as advice are doing just what the speaker predicts, since they believe the version meant for telling.']],
      [['other', 'Some readers would answer that the ending is still sincere, and that the choice really did change his life.'], ['answer', 'Any choice changes a life in that sense, however, since he can never know where the other road went: “way leads on to way,” and he doubts he will “ever come back.” The word “sigh” also refuses to settle things, because it could mean relief or regret. A poem that truly praised boldness would not leave its speaker sounding so unsure.']],
      [['end', 'This is why the poem lasts longer than the advice it is usually taken for. It is less about being different than about the human need to say that a choice mattered. People take roads that were “really about the same,” and then they spend years explaining why theirs was the one that counted.']],
    ],
  },
  {
    id: 'tomorrow', group: 'text', kind: 'text', emoji: '🕯️', minutes: 40, text: TOMORROW, title: 'Macbeth’s “Tomorrow” speech',
    prompt: 'What does the “Tomorrow” speech show about how Macbeth now sees life?',
    model: [
      [['way', 'Macbeth has just been told that his wife is dead, and he does not cry out.'], ['context', 'He speaks about time instead.'], ['thesis', 'The “Tomorrow” speech shows that Macbeth now sees life as empty, and its images of time, candles and theatre turn the ambition that drove him into a meaningless performance.']],
      [['point', 'The speech begins by making time itself feel like a punishment.'], ['ev', 'The repeated “Tomorrow, and tomorrow, and tomorrow” is followed by the verb “Creeps,” and each day moves “in this petty pace.”'], ['an', 'The repetition has no rise in it, so the line itself drags in the way that the days do. For a man who killed to bring his future closer, this is a bitter change. The witches promised him tomorrow, and now that it has come, it is only more of the same.'], ['link', 'The past offers him no more comfort than the future.']],
      [['point', 'Macbeth then turns to the past and finds that it has only been leading to the grave.'], ['ev', 'He says that “all our yesterdays have lighted fools / The way to dusty death,” and he cries, “Out, out, brief candle!”'], ['an', 'The image of light is cruel here, since it does not help anyone see. It only shows the fools the way to the end. The word “our” is also important, because he no longer speaks only of himself: his own failure has become a judgment on everyone.']],
      [['point', 'The images of the theatre go furthest, as they make his whole career look like a bad performance.'], ['ev', 'Life is “a walking shadow, a poor player / That struts and frets his hour upon the stage / And then is heard no more.”'], ['an', 'The words “struts” and “frets” are the two moods Macbeth has shown in the play: pride and fear. By using them, he seems to describe himself, and to see his own crown as a costume. A man who once weighed every consequence of murder now says that life is “Signifying nothing,” and the line stops short on those words, as though there were nothing left to say.']],
      [['end', 'It would be easy to read this speech as grief, but it is closer to the absence of grief. Macbeth has got everything he wanted and has lost the ability to care about any of it. That is the real punishment Shakespeare gives him: not death, which is about to come, but the knowledge that none of it was worth what it cost.']],
    ],
  },
  {
    id: 'crossing', group: 'text', kind: 'text', emoji: '🧊', minutes: 35, text: CROSSING, title: 'Tension on the ice',
    prompt: 'How does the writer build tension in this passage?',
    model: [
      [['way', 'Very little happens in this passage: a woman walks across a frozen lake.'], ['thesis', 'The writer makes that walk frightening by holding back information, by slowing the action down, and by letting small sounds and silences carry the danger.']],
      [['point', 'The tension begins before Lena even steps onto the ice, because the writer shows the risk without naming it.'], ['ev', 'She “tested the ice with one boot,” and the answer is only “It held.” Behind her, “the dog whined and would not come.”'], ['an', 'The two-word sentence sounds like relief, but it promises nothing about the next step. The dog matters even more, since it refuses to do what she is doing, and animals in stories often sense what people do not. The reader now knows more than Lena will admit to herself.'], ['link', 'From then on, the writer slows everything down.']],
      [['point', 'The pace of the writing makes the crossing feel far longer than it is.'], ['ev', 'The passage says that “She took a step, then another,” and “For a while there was only the squeak of snow and her own breath.”'], ['an', 'The short, even clauses imitate careful steps, and the reader is made to wait with her. Because nothing happens, each sentence raises the chance that something will. Stopping “Halfway across” is also well chosen: she is now as far as she can be from either bank, so the moment of greatest danger is also the moment when there is no quick way back.']],
      [['point', 'The real fear comes from sound, and then from its absence.'], ['ev', 'She hears “a long, low note, somewhere under her feet, like someone drawing a bow across a cello,” and then “It stopped. The dog had stopped whining.”'], ['an', 'The simile is oddly beautiful, which makes it more disturbing, since the sound of ice beginning to crack is described as if it were music. The writer never uses the word “crack,” and leaving it out forces the reader to supply it. The silence that follows is worse than the noise, especially as even the dog has gone quiet.']],
      [['end', 'The passage ends without saying whether Lena reaches the far bank. She “did not look down,” and she begins “very slowly, to walk.” That refusal to look, and the writer’s refusal to tell, work in the same way. The tension lasts because the danger is always just out of sight, which is where a reader’s imagination does the most work.']],
    ],
  },
  {
    id: 'route9', group: 'text', kind: 'text', emoji: '🚌', minutes: 35, text: ROUTE9, title: 'A speech to save a bus',
    prompt: 'How does the speaker try to persuade the council?',
    model: [
      [['way', 'Dana Reyes has one short speech and a budget figure against her.'], ['context', 'The council has been told that Route 9 carries only two hundred people a day, and that number sounds like an argument all by itself.'], ['thesis', 'Reyes persuades the council by turning that number into people, and by making a vote to cut the bus into a statement about whose mornings count.']],
      [['point', 'She begins by establishing why she has a right to speak.'], ['ev', 'She has “ridden the Route 9 bus for eleven years” and “learned to read on that bus, from the ads above the windows.”'], ['an', 'The detail about the ads is small and oddly specific, and this is why it works: it could not have come from a campaign leaflet. Before she makes any argument, the audience knows that the bus is part of her life.'], ['link', 'That trust prepares the council for her answer to the numbers.']],
      [['point', 'Her central move is to take the council’s own figure and change what it means.'], ['ev', '“Two hundred. It sounds small, doesn’t it?” she asks, and then she names “the nurse who gets to the night shift, the grandfather who gets to his dialysis, the girl who gets to the only school in town that teaches welding.”'], ['an', 'Repeating the number alone forces the listeners to hear how cold it is, and the question asks them to admit that they had thought so too. The three examples then replace a statistic with faces, and each trip is one that nobody can skip: a job, a treatment, an education. The repetition of “who gets to” makes the bus itself seem to be doing the rescuing.']],
      [['point', 'She then sets the savings beside the cost, in a way that makes them hard to defend.'], ['ev', 'The cut would save “forty thousand dollars a year,” but it would also “tell each of them that their morning matters less than a rounding error in the budget.”'], ['an', 'The phrase “rounding error” is a clever choice, as it uses the language of accountants to suggest that the sum is tiny. She also moves the decision from the budget to the council’s conscience.'], ['other', 'A skeptic might notice that she never says where else the money could come from.'], ['answer', 'Her speech succeeds anyway, because her ending leaves the council a way out and not an accusation: “I don’t believe you want to say that. I don’t believe you have to.”']],
      [['end', 'By the time she asks them to “Keep the bus running,” the question is no longer about two hundred riders. Reyes has made it about what kind of town this is. Her last words, “let us all get where we are going,” quietly put the council on the bus with everyone else.']],
    ],
  },

  // ---------- use what you're given ----------
  {
    id: 'library', group: 'sources', kind: 'sources', emoji: '📚', minutes: 40, title: 'Replace the library?',
    prompt: 'The town wants to replace its library with an online service. Using the sources, argue whether it should.',
    note: 'These sources are made up for this practice.',
    sources: [
      { name: 'Source A', from: 'From the town’s budget report', text: 'Running the Main Street library costs $410,000 a year. Book loans have fallen 30 percent in ten years. An online service would give every resident e-books and audiobooks for about $60,000 a year.' },
      { name: 'Source B', from: 'From a survey of 300 library visitors', text: 'Asked why they came, 46 percent said to use a computer or the internet, 31 percent to study or work, 14 percent to borrow books, and 9 percent for children’s events.' },
      { name: 'Source C', from: 'From a letter by a local teacher', text: 'A third of my students have no quiet place at home. When the library closes at six, some of them do their homework on the steps outside, where the wifi still reaches.' },
    ],
    model: [
      [['way', 'When the library on Main Street closes at six, some students keep working on the steps outside, where the wifi still reaches (Source C).'], ['context', 'The town now proposes to close it for good and offer an online service instead.'], ['thesis', 'The town should keep the library, because the numbers used to justify closing it measure the wrong thing: most people come for a place to work, and that is what an online service cannot provide.']],
      [['other', 'The case for closing looks strong at first, which is why it deserves a fair hearing. Source A reports that the library costs $410,000 a year, that book loans have fallen by 30 percent in ten years, and that an online service would cost about $60,000.'], ['an', 'If the library were only a place for borrowing books, those figures would settle the question, since e-books are cheaper and easier to get.'], ['link', 'However, that “if” is the weakness of the whole plan.']],
      [['point', 'The survey shows that the library is not mainly a place for borrowing books.'], ['ev', 'According to Source B, only 14 percent of visitors came to borrow books, while 46 percent came to use a computer or the internet, and 31 percent came to study or work.'], ['an', 'This means that about three out of four visitors came for something an online service cannot replace. Someone without a computer at home cannot use e-books in the first place, so the plan would help those who already have the most. A falling number of loans therefore says little about whether the building is being used.']],
      [['point', 'The teacher’s letter shows what that loss would mean in practice.'], ['ev', 'In Source C, a local teacher writes that “A third of my students have no quiet place at home,” and that some of them work on the steps after closing.'], ['an', 'One teacher’s letter cannot speak for the whole town, but it explains the survey’s numbers. It shows who would pay for the savings: students who have no other desk. Closing the building would not remove that need. It would only move it somewhere colder and less safe.']],
      [['end', 'Saving $350,000 a year is a serious goal, and the town could reasonably spend less on books and add the online service as well. But it should not close the one room in town where anyone can sit and work for free. A budget should count what a place is used for, not only what it lends.']],
    ],
  },
  {
    id: 'thirty-years', group: 'sources', kind: 'argue', emoji: '⚔️', minutes: 40, title: 'The Thirty Years’ War',
    prompt: 'Was the Thirty Years’ War really about religion? Argue your position, using what you know. (History has the course on it.)',
    model: [
      [['way', 'The Thirty Years’ War began with three Catholic officials being thrown from a window by Protestant nobles in Prague.'], ['context', 'With a start like that, it is easy to see why it is remembered as a war of religion, and in its first years it largely was.'], ['thesis', 'But religion only lit the fire, because by the end the war was being fought over power, as the alliances of its later years clearly show.']],
      [['point', 'Religion was a real cause, and it should not be explained away.'], ['ev', 'The Defenestration of Prague in 1618 came after Bohemia’s Protestants saw churches closed and a strict Catholic, Ferdinand of Styria, named as their king.'], ['an', 'These people were not using faith as an excuse. They feared losing the freedom promised in the Letter of Majesty of 1609, so for them the quarrel really was about how they could worship.'], ['link', 'What began this way did not stay this way.']],
      [['point', 'The clearest evidence against a purely religious war is the alliance between Catholic France and Protestant Sweden.'], ['ev', 'From 1631, France, led by Cardinal Richelieu, paid Gustavus Adolphus of Sweden to fight the Catholic Habsburgs, and in 1635 France entered the war directly on the Protestant side.'], ['an', 'A cardinal of the Catholic Church was paying for the armies of a Protestant king, and only power can explain that. France feared being surrounded by Habsburg lands in Spain and the Holy Roman Empire, and that fear mattered more than shared faith.'], ['link', 'By then, the sides no longer lined up with the churches.']],
      [['point', 'The peace that ended the war points the same way.'], ['ev', 'At the Peace of Westphalia in 1648, France and Sweden gained territory, and German princes gained more independence from the emperor.'], ['an', 'The religious terms mattered too, since Calvinism was now recognized alongside Catholicism and Lutheranism. Yet so much of the treaty dealt with land and the balance of power that it reads as the settlement of a struggle among states.'], ['other', 'Some historians would reply that rulers could only raise armies because their subjects believed in the cause.'], ['answer', 'That may be true of the early years, but it does not explain why a Catholic cardinal funded a Protestant army, or why the fighting went on for decades after the original quarrel in Bohemia was settled.']],
      [['end', 'To call the Thirty Years’ War a war of religion is true of how it started, but not of why it lasted. Faith gave people a reason to fight, and ambition gave rulers a reason to keep going. That may be the war’s lasting warning: a cause that begins as a matter of conscience can be taken over by those who have other goals.']],
    ],
  },

  // ---------- just a paragraph ----------
  {
    id: 'p-uniforms', group: 'short', kind: 'paragraph', emoji: '👕', minutes: 10, title: 'A paragraph on uniforms',
    prompt: 'Write one body paragraph for or against school uniforms: point, evidence, explain, link.',
    model: [[['point', 'Schools should drop uniforms, because the money they save families is smaller than it looks.'], ['ev', 'For example, a uniform still has to be bought, often from one approved shop, and students outgrow it just as they outgrow other clothes.'], ['an', 'Since most students also need clothes for outside school, families end up paying for two wardrobes, which means that the rule can cost the poorest families the most.'], ['link', 'A policy meant to make students equal should not add to the bills of those who have the least.']]],
  },
  {
    id: 'p-line', group: 'short', kind: 'paragraph', emoji: '🎵', minutes: 10, text: HOPE, title: 'A paragraph on one line',
    prompt: 'Write one paragraph on what this line does: “And sings the tune without the words”.',
    model: [[['point', 'Dickinson’s line suggests that hope works without needing to be explained.'], ['ev', 'The bird “sings the tune without the words.”'], ['an', 'A tune without words makes no argument and offers no promise, so nothing can prove it wrong. That matters because the times when people most need hope are the times when the facts are against them. If hope had words, they could be answered, but this song simply carries on.'], ['link', 'This is why the poem can go on to claim that it “never stops - at all.”']]],
  },
  {
    id: 'p-answer', group: 'short', kind: 'paragraph', emoji: '⚖️', minutes: 10, title: 'A paragraph that answers back',
    prompt: 'You’re arguing that students should have more choice in what they study. Write the paragraph that answers this objection: “Students don’t yet know what they’ll need.”',
    model: [[['other', 'Critics argue that students do not yet know what they will need as adults. That is partly true, since few fifteen-year-olds can predict their careers.'], ['answer', 'But adults cannot predict them either, and the jobs of the future are unknown to the people who write the curriculum as well.'], ['an', 'What a student does know is what holds their attention, and that matters because students work harder and remember more when they care about a subject. Keeping a core of reading, writing and math would protect the basics, while leaving room for choice would give students practice at the very skill the objection worries about: deciding what they need.']]],
  },
  {
    id: 'p-open', group: 'short', kind: 'opening', emoji: '🚪', minutes: 10, title: 'An opening',
    prompt: 'Write the introduction to an essay arguing that every student should learn to cook at school. End it with your thesis.',
    model: [[['way', 'Plenty of students can solve a quadratic equation and cannot boil an egg.'], ['context', 'Most will use the first skill rarely after graduation, and they will need the second every day for the rest of their lives.'], ['thesis', 'Every student should learn to cook at school, because it is one of the few subjects that affects their health, their money and their independence from the day they leave home.']]],
  },
  {
    id: 'p-end', group: 'short', kind: 'ending', emoji: '🏁', minutes: 10, title: 'An ending',
    prompt: 'Write the conclusion to an essay with this thesis: “Zoos are worth keeping, but only if they exist for the animals’ sake and not for the visitors’.”',
    model: [[['end', 'A zoo that breeds endangered animals and teaches people to care about them is doing something no nature film can do. A zoo that keeps animals in small cages so that crowds have something to photograph is not. The question, then, is less whether to have zoos than what a town should ask of the one it has, and the answer can be found by looking at who each decision is for.']]],
  },
];

export const promptById = (id) => PROMPTS.find((p) => p.id === id);
