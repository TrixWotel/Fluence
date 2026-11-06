// Learning essays, a step at a time. A step has a short idea, things to try, and something to write yourself. Original
// examples throughout. Poems and plays quoted here are out of copyright (Dickinson, Frost, Shakespeare, Burns, Coleridge).
// Facts in the examples are real, and an example written just for this course doesn't pretend otherwise.
//
// A step is { title, icon, blurb, cards }. A card is one of:
//   { kind: 'read', html }                                                      something to read
//   { kind: 'choose', ask, options, right, why, text? }                         pick one
//   { kind: 'sort', ask, left, right, items: [[text, 0 or 1, why?]] }           one at a time, onto two sides
//   { kind: 'order', ask, items, why? }                                         tap them in order (items are in the right order)
//   { kind: 'match', ask, pairs: [[a, b]] }                                     tap one on each side
//   { kind: 'tap', ask, parts, right, why }                                     tap the sentence, in a paragraph
//   { kind: 'label', ask, labels, parts: [[sentence, label's index]] }          say what each sentence is doing
//   { kind: 'write', ask, given?, placeholder?, hints, check, models, keep? }   write it yourself, then see how it compares
// A write card's hints are { when(text, words), say }: what the page can notice. Its check is what only you can judge.

const has = (re) => (t) => re.test(t);
const tired = /\b(since the (dawn|beginning) of time|throughout history|in today[’']s society|in this day and age|dictionary defines|in this essay|this essay will|i will discuss)\b/i;

export const COURSE = { id: 'essays', name: 'Essay Writing' };

export const UNITS = [
  {
    unit: 'Before you write',
    steps: [
      {
        title: 'Read the question',
        icon: '🔍',
        blurb: 'Work out what you’re really being asked.',
        cards: [
          { kind: 'read', html: `<p>Most weak essays aren’t badly written. They answer a different question from the one that was asked.</p>
            <p>So before anything else, find two things in the prompt: the <b>command</b>, which says what to do, and the <b>limits</b>, which say what it’s about.</p>
            <div class="e-eg"><p><b>Prompt:</b> How does Dickinson use the image of a bird to show what hope is like?</p>
            <p><b>Command:</b> “how does … use”. Explain her method. Saying what the poem means isn’t enough.</p>
            <p><b>Limits:</b> the bird, and hope. Not her life. Not your own hopes.</p></div>` },
          { kind: 'match', ask: 'Match each command word to what it wants from you.', pairs: [
            ['Argue', 'Take a side and defend it'],
            ['Analyze', 'Take it apart and show how the parts work'],
            ['Compare', 'Show what’s alike and different, and why that matters'],
            ['Evaluate', 'Decide how true or good it is, and by what standard'],
            ['Explain', 'Make clear how or why something happens'],
          ] },
          { kind: 'sort', ask: 'The prompt is: <b>Should high schools start later in the morning?</b> Does each idea answer it, or drift away?', left: 'Answers it', right: 'Drifts away', items: [
            ['Teenagers’ body clocks make them sleepy later at night.', 0],
            ['A later start would change bus schedules and sports practices.', 0, 'The other side still answers the question. You’ll need to deal with it.'],
            ['Why the cafeteria’s food has got worse.', 1],
            ['The history of the school bell.', 1, 'Interesting, but it doesn’t help decide what schools should do now.'],
            ['Students who sleep more tend to do better in class.', 0],
            ['Why teenagers should use their phones less at night.', 1, 'That’s an argument about phones. It only belongs if you tie it back to start times.'],
            ['What the first hour of class looks like when half the room is asleep.', 0],
          ] },
          { kind: 'choose', ask: 'The prompt says: <b>Evaluate the claim that social media has made teenagers lonelier.</b> Which plan fits?', options: [
            'Describe how the biggest apps work.',
            'List the main apps and when each one started.',
            'Say how far the claim holds: what it gets right, and where it goes wrong.',
            'Tell the story of getting your first phone.',
          ], right: 2, why: 'Evaluate asks for a judgment: how far is it true? Description alone never gets there.' },
          { kind: 'write', ask: 'Your turn. The prompt is: <b>To what extent should schools teach students how to manage money?</b> In one sentence, in your own words, what is it asking you to do?',
            placeholder: 'It’s asking me to…',
            hints: [
              { when: (t, n) => n < 8, say: 'That’s short. Say what to do, and what it’s about.' },
              { when: has(/to what extent should schools teach students how to manage money/i), say: 'Try not to copy the prompt. Saying it your own way is how you know you’ve got it.' },
              { when: (t) => !/\b(how (much|far)|extent|decide|whether|should|judge|argue|weigh)\b/i.test(t), say: '“To what extent” wants a judgment of how much. Does your sentence say that?' },
            ],
            check: ['I said what to do, not just the topic.', 'I kept to the limits: schools, and managing money.', '“To what extent” means how much. My answer could be “a lot”, “a little” or “only if…”'],
            models: ['Decide how much of teaching money skills should fall to schools, and say why, instead of just saying it’s a nice idea.'] },
        ],
      },
      {
        title: 'A thesis you can argue',
        icon: '🎯',
        blurb: 'The one sentence your whole essay sets out to prove.',
        cards: [
          { kind: 'read', html: `<p>A thesis is the one sentence your whole essay sets out to prove. It has three jobs. It <b>answers the question</b>, it says <b>something a sensible person could disagree with</b>, and it says <b>why</b>.</p>
            <div class="e-ladder"><p><span class="e-tag bad">Just a fact</span> Many schools start before 8:00.</p>
            <p><span class="e-tag ok">A claim, but why?</span> Schools should start later.</p>
            <p><span class="e-tag good">A thesis</span> High schools should start later, because teenagers’ sleep patterns make early classes a poor use of everyone’s time, and the cost of changing is small by comparison.</p></div>` },
          { kind: 'sort', ask: 'Could a sensible person disagree?', left: 'Yes, it’s arguable', right: 'No, it’s a fact', items: [
            ['The Thirty Years’ War ended in 1648.', 1],
            ['The Thirty Years’ War was more about power than religion.', 0],
            ['Many teenagers own smartphones.', 1],
            ['Phones do more harm than good in a classroom.', 0],
            ['Romeo and Juliet is set in Verona.', 1],
            ['Romeo and Juliet die because of their families, not fate.', 0],
            ['Water boils at 100 °C at sea level.', 1],
            ['Every student should have to take a coding class.', 0],
          ] },
          { kind: 'choose', ask: 'The prompt is: <b>Is homework worth it?</b> Which thesis is strongest?', options: [
            'Homework is a topic many people have opinions about.',
            'Homework is bad.',
            'In this essay I will talk about homework.',
            'Homework is worth assigning only when it practices what was taught that day, because longer assignments mostly measure how much free time and help a student has at home.',
          ], right: 3, why: 'It answers the question, takes a side someone could dispute, and gives the reason. The first and third say nothing. “Homework is bad” has a side, and no reason.' },
          { kind: 'choose', ask: 'Which thesis is too big to prove in a school essay?', options: [
            'Technology has ruined society.',
            'Group chats have made it harder for students to switch off from school at night.',
            'Using calculators too early weakens students’ mental arithmetic.',
            'Online reading lists have made school libraries less used.',
          ], right: 0, why: 'You’d need a library of books to prove that one. A good thesis is narrow enough to prove in the pages you have.' },
          { kind: 'write', ask: 'Fix this thesis. It takes no side and gives no reason. Rewrite it so it does.', given: 'Uniforms are a big issue in schools and there are many pros and cons.',
            placeholder: 'Schools should…',
            hints: [
              { when: has(/pros and cons|big issue|many (sides|opinions)/i), say: 'That’s still sitting on the fence. Pick a side.' },
              { when: (t) => !/\b(because|since|as|so|while|although|by)\b/i.test(t), say: 'You’ve taken a side. Now say why: try adding “because…”' },
              { when: (t, n) => n > 45, say: 'It’s getting long. A thesis should fit in one breath.' },
            ],
            check: ['A sensible person could disagree with it.', 'It says why.', 'I could spend a page or two proving it.'],
            models: ['Schools should drop uniforms, because the time spent enforcing them would do more good elsewhere, and students learn little from being made to look alike.', 'Uniforms are worth keeping, because they take away one daily competition over clothes and money, and that matters most to students who can’t keep up.'] },
        ],
      },
      {
        title: 'Plan in five minutes',
        icon: '🗺️',
        blurb: 'Five minutes now saves twenty of getting lost.',
        cards: [
          { kind: 'read', html: `<p>A plan is short: your thesis, the points that prove it, and the evidence for each. It’s for you, so it can be messy. Writing it takes five minutes, and it stops you getting lost for twenty.</p>
            <div class="e-eg"><p><b>Thesis:</b> A later start would help students more than it would cost schools.</p>
            <p><b>1.</b> Teenagers can’t just go to bed earlier. <i>(body clocks shift in puberty)</i></p>
            <p><b>2.</b> Later starts work. <i>(Seattle, 2016: about 34 more minutes of sleep)</i></p>
            <p><b>3.</b> The costs are small. <i>(buses and sports, but they’re one-time changes)</i></p></div>
            <p>A point is a <b>reason</b>. Evidence is <b>proof</b> of that reason. Mixing them up is how essays turn into lists of facts.</p>` },
          { kind: 'sort', ask: 'The thesis is that phones should be kept out of class. Is each one a reason, or proof?', left: 'A point (a reason)', right: 'Evidence (proof)', items: [
            ['Phones pull attention away, even when they’re face down.', 0],
            ['In one study of English schools, test scores rose after phones were banned.', 1],
            ['Lunch breaks become more social without screens.', 0],
            ['A teacher quoted in the article says she now sees students talking at lunch.', 1],
            ['Bans are easy to enforce if phones are locked away at the door.', 0],
            ['The pouches cost the school $15 per student.', 1],
          ] },
          { kind: 'order', ask: 'Put this plan in a sensible order. Tap the first part first.', items: [
            'Thesis: a later start would help students more than it would cost schools.',
            'Point: teenagers’ sleep patterns make early classes a poor use of time.',
            'Point: schools that moved their start time saw students sleep more.',
            'The other side: buses and sports practices would have to change.',
            'Answer: those costs come once, while the lost sleep comes every school day.',
            'Why it matters: schools already change timetables for far less.',
          ], why: 'Reasons first, then the strongest objection and your answer to it, then what it all adds up to.' },
          { kind: 'choose', ask: 'You have 40 minutes for an essay. Which split makes the most sense?', options: [
            'No plan: 40 minutes of writing.',
            '5 minutes to plan, 30 to write, 5 to check.',
            '20 minutes to plan, 20 to write.',
            '35 minutes to write, then a plan at the end.',
          ], right: 1, why: 'A short plan pays for itself, and the last five minutes catch the mistakes that cost the most.' },
          { kind: 'write', ask: 'Your turn. The prompt is: <b>Should students be allowed to use AI tools for schoolwork?</b> Write a quick plan: your thesis on the first line, then two or three points, one on each line.',
            placeholder: 'Thesis: …\n1. …\n2. …',
            rows: 6,
            hints: [
              { when: (t) => t.trim().split('\n').filter((l) => l.trim()).length < 3, say: 'Put the thesis and at least two points on separate lines.' },
              { when: (t) => !/\b(because|since|so|while|although|only|when|if)\b/i.test(t.split('\n')[0]), say: 'Does your thesis say why, or under what conditions?' },
            ],
            check: ['Each point is a reason, not a fact.', 'I know what evidence I’d use for each.', 'The points prove the thesis, not just the topic.'],
            models: ['Thesis: Students should be allowed to use AI tools for checking and practice, but not for writing work they hand in, because the point of schoolwork is the thinking it makes you do.\n1. Help that explains a mistake builds skill, like a tutor does.\n2. Handing in writing you didn’t write skips the part that teaches you anything.\n3. The rule has to be clear, or honest students lose out.'] },
        ],
      },
    ],
  },
  {
    unit: 'The middle of an essay',
    steps: [
      {
        title: 'The body paragraph',
        icon: '🧱',
        blurb: 'Point, evidence, explain, link.',
        cards: [
          { kind: 'read', html: `<p>Most good body paragraphs do four things, usually in this order.</p>
            <div class="e-parts"><p><span class="e-tag point">Point</span> Later start times work because they give students sleep they can’t get any other way.</p>
            <p><span class="e-tag ev">Evidence</span> When Seattle’s high schools moved from 7:50 to 8:45 in 2016, students slept about 34 minutes longer each night.</p>
            <p><span class="e-tag an">Explain</span> That matters because teenagers cannot simply go to bed earlier: their body clocks shift later in puberty, so an early bell takes sleep away instead of moving it.</p>
            <p><span class="e-tag link">Link</span> If sleep is the problem, then the bell, and not bedtime, is where schools can fix it.</p></div>
            <p>The explaining is usually the longest part. It’s also what most essays leave out.</p>` },
          { kind: 'label', ask: 'What is each sentence doing?', labels: ['Point', 'Evidence', 'Explain', 'Link'], parts: [
            ['Dickinson makes hope seem small but tireless.', 0],
            ['She calls it “the thing with feathers” that “never stops - at all.”', 1],
            ['Because a bird weighs almost nothing, the image suggests that hope needs no strength or reason to keep going.', 2],
            ['That same smallness is what makes the storm later in the poem so striking.', 3],
          ] },
          { kind: 'order', ask: 'These sentences are from one paragraph. Put them in order.', items: [
            'Banning phones in class also helps the students who find school hardest.',
            'In a study of English schools, Louis-Philippe Beland and Richard Murphy found that test scores rose after phone bans, and low-achieving students gained the most.',
            'A student who is already behind has the least attention to spare, so a buzzing phone costs that student the most.',
            'A ban, then, is about more than quiet classrooms: it narrows the gap between students.',
          ], why: 'Point, then evidence, then what it shows, then why it matters for the essay.' },
          { kind: 'tap', ask: 'One sentence doesn’t belong in this paragraph. Tap it.', parts: [
            'Libraries are still worth funding, because they give everyone a quiet place to work.',
            'Many students share small homes, and the library may be the only desk they have.',
            'The library near me also has a really nice coffee machine.',
            'For those students, closing it wouldn’t save money so much as move the cost onto them.',
          ], right: 2, why: 'True or not, it has nothing to do with the point. Every sentence in a paragraph should serve the same idea.' },
          { kind: 'choose', ask: 'This paragraph has no point at the start: <i>“In 2019, the town cut bus service to the west side. Within a year, the number of west side students arriving late had doubled. Students who missed the first class fell behind in it.”</i> Which sentence should open it?', options: [
            'Buses are a form of public transport.',
            'Cutting bus routes does more damage to schools than the savings are worth.',
            'The town has many bus routes.',
            'This paragraph will discuss buses.',
          ], right: 1, why: 'It says what the facts prove. (The bus cut here is made up for this example.)' },
          { kind: 'write', ask: 'Your turn. Write one paragraph of about four sentences: point, evidence, explain, link. Argue that <b>schools should give students more time between classes</b>. For evidence you can use this made-up fact: at one school with three-minute breaks, a third of students said they’re often late or skip the bathroom.',
            placeholder: 'Start with your point…', rows: 7,
            hints: [
              { when: (t) => (t.match(/[.?!](\s|$)/g) || []).length < 3, say: 'That’s under three sentences. There’s room for the point, the evidence, what it shows, and a link.' },
              { when: (t) => !/\b(third|three|minute|late|bathroom)\b/i.test(t), say: 'Have you used the evidence? Put the number in.' },
              { when: (t) => !/\b(because|so|this|which|means|shows|suggests|that is why)\b/i.test(t), say: 'After the evidence, say what it shows. Try “This means…” or “which suggests…”' },
            ],
            check: ['The first sentence says the point, in my own words.', 'The evidence is specific.', 'I explain what the evidence shows.', 'The last sentence says why it matters.'],
            models: ['Schools should give students more time between classes, because three minutes isn’t enough for anything but rushing. At one school with three-minute breaks, a third of students said they’re often late or skip the bathroom. A student who has to choose between arriving on time and using the bathroom spends the first part of the next lesson distracted either way. A few extra minutes would cost little, and the lesson would start with students who are ready for it.'] },
        ],
      },
      {
        title: 'Evidence that does its job',
        icon: '🔎',
        blurb: 'Specific proof, worked into your own sentences.',
        cards: [
          { kind: 'read', html: `<p>Evidence is anything outside your own opinion that a reader could check: a number, an event, a specific example, an exact quotation. Good evidence is <b>specific</b>, it’s <b>about your point</b>, and it comes from <b>somewhere you can trust</b>.</p>
            <p>When you quote, never let a quotation stand alone. Lead into it, so it’s part of your own sentence, and quote only the words you’ll talk about.</p>
            <div class="e-ladder"><p><span class="e-tag bad">Dropped in</span> Macbeth is in despair. “Life’s but a walking shadow.” This shows how he feels.</p>
            <p><span class="e-tag good">Worked in</span> Macbeth sees life as empty, calling it “a walking shadow” with no substance of its own.</p></div>` },
          { kind: 'sort', ask: 'Specific enough to be evidence, or too vague to prove anything?', left: 'Specific', right: 'Vague', items: [
            ['Everyone knows that teenagers are tired.', 1],
            ['In 2016, a later start in Seattle gave students about 34 more minutes of sleep.', 0],
            ['Lots of studies say phones are bad.', 1],
            ['Beland and Murphy found that test scores rose after phone bans.', 0],
            ['Macbeth calls life “a tale / Told by an idiot.”', 0],
            ['Shakespeare shows that Macbeth is sad in many parts of the play.', 1],
            ['People have always said that reading is important.', 1],
            ['Austria lowered its voting age to 16 in 2007.', 0],
          ] },
          { kind: 'choose', ask: 'The claim is that <b>the school should keep its music program</b>. Which evidence helps most? (These facts are made up for this example.)', options: [
            'Music is one of the oldest art forms.',
            'Last year, 140 of the school’s 600 students took a music class, and the program costs less than the sports teams’ travel.',
            'My cousin plays the trumpet.',
            'Beethoven wrote nine symphonies.',
          ], right: 1, why: 'Only this one is about whether this school should keep it. True and relevant aren’t the same thing.' },
          { kind: 'sort', ask: 'Worked into a sentence, or dropped in?', left: 'Worked in', right: 'Dropped in', items: [
            ['Frost’s speaker admits the paths were “really about the same.”', 0],
            ['The paths look alike. “Had worn them really about the same.” The speaker changes his story later.', 1],
            ['Macbeth compares life to “a poor player” who is soon forgotten.', 0],
            ['Life is short. “Out, out, brief candle!” Macbeth knows this.', 1],
            ['Dickinson’s bird “kept so many warm,” even in the storm.', 0],
            ['Hope is helpful. “And sore must be the storm.” That is what the poem says.', 1],
          ] },
          { kind: 'write', ask: 'Work this quotation into a sentence of your own, and say what it shows about Macbeth. Use only the words you need.', given: 'Tomorrow, and tomorrow, and tomorrow, / Creeps in this petty pace from day to day',
            placeholder: 'For Macbeth, …',
            hints: [
              { when: (t) => !/[“"]/.test(t), say: 'Put the words you’re quoting in quotation marks.' },
              { when: (t) => /^\s*[“"]/.test(t), say: 'Start with your own words, and lead into the quotation.' },
              { when: (t) => { const q = t.match(/[“"]([^”"]+)[”"]/); return q && q[1].split(/\s+/).length > 12; }, say: 'That’s a lot of quotation. Which few words matter most?' },
            ],
            check: ['The quotation is part of my own sentence.', 'I quoted only the words I needed.', 'I said what it shows, not only what it says.'],
            models: ['For Macbeth, time has lost all meaning: each day only “creeps in this petty pace” toward the next.', 'The repeated “tomorrow” drags, so that Macbeth’s future sounds like one long, dull wait.'] },
        ],
      },
      {
        title: 'Say what it shows',
        icon: '💡',
        blurb: 'The difference between summary and analysis.',
        cards: [
          { kind: 'read', html: `<p>Summary says what happens. Analysis says what it means and why it matters. After every piece of evidence, ask: <b>so what?</b></p>
            <div class="e-ladder"><p><span class="e-tag bad">Summary</span> The speaker hears the bird in the cold and at sea.</p>
            <p><span class="e-tag good">Analysis</span> By placing the bird in “the chillest land” and on “the strangest Sea,” Dickinson suggests that hope isn’t tied to comfort: it shows up exactly where you’d expect it to give up.</p></div>
            <p>Some ways in: <i>this suggests…</i>, <i>the word “…” implies…</i>, <i>this matters because…</i>, <i>what looks like … is really …</i></p>` },
          { kind: 'sort', ask: 'Summary or analysis?', left: 'Says what happens', right: 'Says what it means', items: [
            ['Macbeth hears that his wife has died and then speaks about time.', 0],
            ['His flat response to her death shows that nothing can reach him anymore.', 1],
            ['The bird keeps singing during the storm.', 0],
            ['Because the song has no words, hope here needs no reasons to carry on.', 1],
            ['Seattle moved its start time to 8:45.', 0],
            ['The gain came with no new rules about bedtime, which suggests the timetable was the problem all along.', 1],
            ['The treaty ended the war in 1648.', 0],
            ['That Catholic France paid Protestant Sweden to fight shows how little the war’s later years had to do with faith.', 1],
          ] },
          { kind: 'tap', ask: 'Which sentence does the real thinking?', parts: [
            'In the poem, the speaker comes to two roads in a wood.',
            'He looks down one and then takes the other.',
            'He later says it “has made all the difference.”',
            'Yet he has already admitted the roads were alike, so the “difference” is a story he tells himself and not something he found.',
          ], right: 3, why: 'The first three tell you what’s in the poem. Only the last says something a reader couldn’t see just by reading it.' },
          { kind: 'choose', ask: 'The evidence: <i>after the hallways were rebuilt, students took about 12 more minutes to reach first period.</i> (Made up for this example.) Which sentence takes it furthest?', options: [
            'This is a lot of minutes.',
            'This shows that students were late.',
            'Twelve minutes of a 50-minute class is almost a quarter of the lesson, lost every day before teaching starts.',
            'This is an interesting piece of evidence.',
          ], right: 2, why: 'It turns a number into what the number costs.' },
          { kind: 'write', ask: 'Turn this summary into analysis. What does it show about how Macbeth sees things now?', given: 'In the speech, Macbeth says life is a walking shadow and a poor player.',
            placeholder: 'By calling life…',
            hints: [
              { when: (t) => !/\b(suggest|show|impl|mean|because|reveal|so|as if|though|which|makes?|turns?|takes?|by calling|by comparing)\w*\b/i.test(t), say: 'That still tells me what he says. What does it mean that he says it?' },
              { when: (t, n) => n < 12, say: 'A little more. What’s he saying about life, or about himself?' },
            ],
            check: ['Someone who’d read the speech would still learn something from my sentence.', 'I talk about a word or an image, and not just the whole speech.', 'It answers “so what?”'],
            models: ['By calling life “a walking shadow,” Macbeth takes away its substance, and “a poor player” turns his own rise to power into a bad performance that no one will remember.'] },
        ],
      },
    ],
  },
  {
    unit: 'The beginning and the end',
    steps: [
      {
        title: 'Openings',
        icon: '🚪',
        blurb: 'Bring the reader to your thesis, by the shortest road.',
        cards: [
          { kind: 'read', html: `<p>An introduction has one job: to bring the reader to your thesis. The usual shape is a <b>way in</b> that’s specific, a little <b>context</b>, and the <b>thesis</b> last.</p>
            <div class="e-parts"><p><span class="e-tag point">Way in</span> At 7:30 on a Tuesday morning, a third of a chemistry class is awake.</p>
            <p><span class="e-tag ev">Context</span> Scenes like this are ordinary in high schools that open before 8:00, mostly because bus schedules were built that way decades ago.</p>
            <p><span class="e-tag link">Thesis</span> High schools should start later, because teenagers’ sleep patterns make early classes a poor use of everyone’s time.</p></div>
            <p>What to leave out: “since the dawn of time”, dictionary definitions, “in this essay I will”, and big claims about all of society.</p>` },
          { kind: 'order', ask: 'Put this opening in order.', items: [
            'Nobody in the castle at Prague expected to go out of a window that morning.',
            'Yet in May 1618, Protestant nobles threw three Catholic officials from a high window, and the quarrel soon spread across Europe.',
            'Because the two sides prayed differently, the war that followed is usually remembered as a war of religion.',
            'But by its later years, Catholic France was paying Protestant Sweden to fight, which shows that the Thirty Years’ War was above all a struggle for power.',
          ], why: 'From one sharp moment, to the wider story, to the claim the essay will prove.' },
          { kind: 'sort', ask: 'A good way in, or a tired opening?', left: 'A good way in', right: 'Tired', items: [
            ['Since the dawn of time, humans have communicated.', 1],
            ['Webster’s dictionary defines “hope” as a feeling of expectation.', 1],
            ['In three years, the town’s only library has lost half its hours.', 0],
            ['In this essay, I will discuss whether phones should be banned.', 1],
            ['Two roads, one traveler, and a story he’ll tell wrong for the rest of his life.', 0],
            ['In today’s society, technology is everywhere.', 1],
            ['Everyone has hopes and dreams.', 1],
            ['The smallest creature in Dickinson’s poem survives the biggest storm.', 0],
          ] },
          { kind: 'choose', ask: 'Where does the thesis usually go?', options: ['The very first sentence.', 'The end of the introduction.', 'The middle of the second paragraph.', 'The conclusion.'], right: 1, why: 'A reader then knows what you’re proving before the proof begins, and the last sentence of a paragraph is the one they remember.' },
          { kind: 'write', ask: 'Write two or three sentences that lead up to this thesis. Don’t write the thesis again, just what comes before it.', given: 'Phones should be locked away during the school day, because they cost students attention they can’t get back.',
            placeholder: 'A way in, then a little context…', rows: 5,
            hints: [
              { when: has(tired), say: 'That’s a worn out opening. Start with something only your essay would say.' },
              { when: has(/\bin this essay\b|\bi will\b/i), say: 'Skip the announcement. Just begin.' },
              { when: (t) => /^\s*(everyone|people|many people|society|today|nowadays)\b/i.test(t), say: 'That’s a very wide way to begin. Can you start with one moment, one classroom, one fact?' },
            ],
            check: ['My first sentence couldn’t open any other essay.', 'It leads toward the thesis.', 'It’s short: the thesis is the point.'],
            models: ['In the middle of a math lesson, a phone buzzes in a bag at the back of the room, and six heads turn. It lasts two seconds. Getting back to the problem on the board takes much longer.'] },
        ],
      },
      {
        title: 'The other side',
        icon: '⚖️',
        blurb: 'Name the best objection, then answer it.',
        cards: [
          { kind: 'read', html: `<p>A strong essay doesn’t pretend nobody disagrees. It names the <b>best</b> objection, is <b>fair</b> about it, and then <b>answers</b> it. Readers trust a writer who has thought about the other side.</p>
            <p>There are three ways to answer: show that it’s <b>wrong</b>, show that it’s <b>small</b>, or show that your side <b>handles it better</b>.</p>
            <div class="e-eg"><p>Critics argue that a later start would disrupt buses and sports. That is true, and it would take a year or two to sort out. But it’s a problem that comes once, while the lost sleep comes every school day for four years.</p></div>` },
          { kind: 'order', ask: 'Put this answer to the other side in order.', items: [
            'Critics of a later start point out that buses and after-school sports would have to change.',
            'That is a real cost, and it would take a year or two of awkward schedules to sort out.',
            'But it is a one-time problem, while the lost sleep comes back every school day for four years.',
            'A short period of inconvenience is a small price for a fix that lasts.',
          ], why: 'Say the objection, be fair to it, answer it, then say where that leaves things.' },
          { kind: 'choose', ask: 'You’re arguing that phones should be banned at school. Which objection is most worth answering?', options: ['Phones come in many colors.', 'Some people like phones.', 'Parents need to reach their children in an emergency.', 'Phones were invented in the last century.'], right: 2, why: 'It’s the one a thoughtful reader would actually raise. Knocking down a weak objection doesn’t convince anyone.' },
          { kind: 'sort', ask: 'The objection is that parents need to reach their children in an emergency. Does each reply answer it, or dodge it?', left: 'Answers it', right: 'Dodges it', items: [
            ['Emergency calls can go through the front office, which is how schools managed for decades.', 0],
            ['Anyway, phones are annoying.', 1],
            ['Critics are just wrong and don’t understand.', 1],
            ['True emergencies are rare, while the distraction comes every day.', 0],
            ['Phones can stay locked in bags and be unlocked when the office says so.', 0],
            ['Everyone knows that phones are bad.', 1],
          ] },
          { kind: 'write', ask: 'You’re arguing that homework should be limited. Answer this objection in two or three sentences.', given: 'Homework teaches responsibility.',
            placeholder: 'It’s true that…', rows: 5,
            hints: [
              { when: (t) => !/\b(but|however|yet|although|though|while|even so|still)\b/i.test(t), say: 'Where’s the turn? Use “but” or “however” to move from their point to your answer.' },
              { when: (t, n) => n < 15, say: 'A bit more. Be fair to the objection first, then answer it.' },
            ],
            check: ['I said the objection fairly.', 'I answered it, and didn’t just disagree.', 'It leaves my thesis looking stronger.'],
            models: ['It is true that keeping track of homework teaches students to manage their time. But responsibility comes from having to meet a commitment, not from the amount of work, and a short assignment teaches it as well as a long one. Limiting homework would keep the lesson and lose only the hours.'] },
        ],
      },
      {
        title: 'Endings',
        icon: '🏁',
        blurb: 'What it all adds up to, and why it matters.',
        cards: [
          { kind: 'read', html: `<p>A conclusion isn’t a copy of the introduction. Say what’s been shown, and then go one step further: <b>so what?</b> What follows if you’re right?</p>
            <p>Three ways to do that: <b>widen out</b> (what this says about something bigger), <b>come back</b> to the image you opened with, or say <b>what should happen next</b>.</p>
            <div class="e-eg"><p>A later bell will not fix everything about high school. But schools now ask teenagers to do their hardest thinking at the hour they’re least able to. Moving the bell is one of the few changes that costs little and helps every student, every day.</p></div>
            <p>What to leave out: new evidence, “in conclusion”, and “this is only my opinion”.</p>` },
          { kind: 'choose', ask: 'Which is the best ending for an essay arguing that schools should start later?', options: [
            'In conclusion, schools should start later because of sleep, test scores and safety, as I have said.',
            'To conclude, there are many sides to this debate and everyone has their own opinion.',
            'A later bell will not fix everything. But schools ask teenagers to do their hardest thinking at the hour they’re least able to, and moving the bell is one of the few changes that helps every student, every day.',
            'Also, a new study shows that teenagers’ diets affect their sleep.',
          ], right: 2, why: 'It says what’s been shown, admits the limits, and says why it matters. The second backs away from the whole essay, and the last brings in something new.' },
          { kind: 'sort', ask: 'Does it belong in a conclusion?', left: 'Belongs', right: 'Doesn’t', items: [
            ['What follows if your argument is right', 0],
            ['A brand new piece of evidence', 1],
            ['Why the question matters beyond this essay', 0],
            ['Your thesis, copied word for word', 1],
            ['An apology: “this is only my opinion”', 1],
            ['A return to the image you opened with', 0],
          ] },
          { kind: 'write', ask: 'Write a two or three sentence ending for an essay with this thesis. Don’t copy it.', given: 'Libraries are worth funding, because they give everyone a place to work, a way to learn and somewhere to go.',
            placeholder: 'If the library closes…', rows: 5,
            hints: [
              { when: has(/\b(in conclusion|to conclude|in summary|to sum up)\b/i), say: 'Start with the thought. A reader can see it’s the end.' },
              { when: has(/place to work, a way to learn and somewhere to go/i), say: 'That’s the thesis again. What follows from it?' },
              { when: has(/\b(for example|for instance|according to)\b/i), say: 'New evidence belongs in the body.' },
              { when: has(/\b(my opinion|i think|i believe)\b/i), say: 'Don’t back away now. Say it as your conclusion.' },
            ],
            check: ['It says more than the thesis did.', 'It answers “so what?”', 'It sounds like an ending: I could stop reading here.'],
            models: ['A library is one of the last places in town where nobody has to buy anything to stay. Closing it would save a line in the budget, and the cost would fall on the people with the fewest other places to go.'] },
        ],
      },
    ],
  },
  {
    unit: 'Making it good',
    steps: [
      {
        title: 'Flow',
        icon: '🔗',
        blurb: 'Show how one idea leads to the next.',
        cards: [
          { kind: 'read', html: `<p>Transition words show how ideas connect, and each one means something: <i>however</i> turns, <i>therefore</i> concludes, <i>for instance</i> gives an example. Use the one you mean.</p>
            <p>The best transitions don’t need a special word. They pick up the last idea and move on from it.</p>
            <div class="e-ladder"><p><span class="e-tag bad">Just starts</span> Secondly, grades.</p>
            <p><span class="e-tag good">Links back</span> Lost sleep doesn’t stay in bed: it follows students into their first-period tests.</p></div>` },
          { kind: 'match', ask: 'Match each transition to its job.', pairs: [
            ['However', 'Turns against what came before'],
            ['Therefore', 'Says what follows from it'],
            ['For instance', 'Gives an example'],
            ['Moreover', 'Adds another point the same way'],
            ['Similarly', 'Shows that two things are alike'],
          ] },
          { kind: 'choose', ask: '“The bell moved an hour later. ____, students slept more.”', options: ['However', 'As a result', 'For instance', 'In contrast'], right: 1, why: 'The second thing follows from the first.' },
          { kind: 'choose', ask: '“Buses would have to change. ____, that cost comes only once.”', options: ['Therefore', 'For example', 'However', 'Similarly'], right: 2, why: 'The second sentence pushes against the first.' },
          { kind: 'sort', ask: 'Does this paragraph opening link back, or just start?', left: 'Links back', right: 'Just starts', items: [
            ['Sleep isn’t the only cost of an early bell.', 0],
            ['Another thing is grades.', 1],
            ['Even if buses could be rearranged, sports would still be a problem.', 0],
            ['Secondly, sports.', 1],
            ['This same pattern shows up in attendance.', 0],
            ['Next I will talk about attendance.', 1],
          ] },
          { kind: 'write', ask: 'The last paragraph ended: <i>“An early bell takes sleep away from students.”</i> The next is about grades. Write its first sentence, so that it picks up where the last one stopped.',
            placeholder: 'Lost sleep…',
            hints: [
              { when: (t) => !/\b(sleep|tired|bell|early|rest|awake)\w*\b/i.test(t), say: 'Pick up a word or idea from the last sentence, so that the reader feels the connection.' },
              { when: (t) => !/\b(grade|test|score|class|learn|mark)\w*\b/i.test(t), say: 'Say where it’s going, too: grades.' },
              { when: has(/^\s*(secondly|next|another)\b/i), say: 'That only says it’s next on the list. Can it say how it follows?' },
            ],
            check: ['It picks up the idea from before.', 'It says where this paragraph is going.'],
            models: ['Lost sleep doesn’t stay in bed: it follows students into their first-period tests.', 'Students short of sleep carry that loss into the classroom, and their grades show it.'] },
        ],
      },
      {
        title: 'Clear sentences',
        icon: '✂️',
        blurb: 'Good style is mostly cutting.',
        cards: [
          { kind: 'read', html: `<p>Good style is mostly cutting. Five habits do most of it.</p>
            <ol class="e-list"><li><b>Cut filler:</b> very, really, basically, the fact that.</li>
            <li><b>Replace vague words:</b> things, stuff, a lot, good, bad. What exactly do you mean?</li>
            <li><b>Put the doer first:</b> “The board decided”, not “a decision was made by the board”.</li>
            <li><b>Mix your lengths.</b> A short sentence after a long one lands hard.</li>
            <li><b>Drop “I think” and “you”.</b> The whole essay is what you think.</li></ol>` },
          { kind: 'choose', ask: 'Which says it better?', options: ['There are many students who feel that the thing about uniforms is that they’re kind of unfair.', 'Many students find uniforms unfair.'], right: 1, why: 'Same meaning, a third of the words.' },
          { kind: 'choose', ask: 'Which says it better?', options: ['Three officials were thrown from a window, and the decision was made by the nobles.', 'Protestant nobles threw three officials from a window.'], right: 1, why: 'Put the doer first. You also see who did it.' },
          { kind: 'choose', ask: 'Which says it better?', options: ['A later start has a lot of good effects on things like school.', 'With a later start, students sleep longer, arrive on time and score higher.'], right: 1, why: 'The vague version makes a reader do the work. The exact one is also evidence.' },
          { kind: 'sort', ask: 'Right for a formal essay, or too chatty?', left: 'Formal', right: 'Too chatty', items: [
            ['Kids these days are glued to their phones.', 1],
            ['Teenagers now spend much of the day on their phones.', 0],
            ['You can’t really blame them.', 1],
            ['The blame does not lie only with students.', 0],
            ['Macbeth is totally over it by Act 5.', 1],
            ['By Act 5, Macbeth has stopped caring.', 0],
            ['This is why the whole thing is kind of a mess.', 1],
            ['This is why the plan failed.', 0],
          ] },
          { kind: 'write', ask: 'Cut this sentence down to under 15 words, and keep the meaning.', given: 'In my opinion, I think that it is really very important for schools to basically give students a lot more time to sleep because of the fact that sleep is good.',
            placeholder: 'Schools should…',
            hints: [
              { when: (t, n) => n >= 15, say: (t, n) => `That’s ${n} words. What else can go?` },
              { when: has(/\b(i think|my opinion|really|very|basically|the fact that)\b/i), say: 'Some of the filler is still there.' },
              { when: has(/\b(a lot|good)\b/i), say: '“A lot” and “good” are vague. Can you say exactly why sleep matters?' },
            ],
            check: ['It still says what the long one said.', 'Every word is doing something.'],
            models: ['Schools should give students more time to sleep, because tired students learn less.'] },
        ],
      },
      {
        title: 'Check and revise',
        icon: '🔁',
        blurb: 'Read it as a stranger, big things first.',
        cards: [
          { kind: 'read', html: `<p>Revising isn’t fixing commas. It’s reading your essay as a stranger would, big things first.</p>
            <p>One trick works better than any other: the <b>reverse outline</b>. Read only the first sentence of each paragraph. Do they make an argument, in order? If not, no amount of polishing will help. (When you write an essay here, the page shows you those sentences.)</p>
            <p>Then read it aloud. Wherever you stumble, a reader will too.</p>` },
          { kind: 'order', ask: 'Put these checks in the order that saves the most work. Big things first.', items: [
            'Does it answer the question?',
            'Do the paragraphs make an argument, in order?',
            'Does each paragraph have evidence and explain it?',
            'Are the sentences clear?',
            'Spelling and commas',
          ], why: 'There’s no point polishing a paragraph you might cut.' },
          { kind: 'tap', ask: 'Here is a reverse outline of an essay arguing that schools should start later. Which paragraph doesn’t fit?', parts: [
            'Teenagers’ body clocks shift later during puberty.',
            'Schools that moved their bell saw students sleep more.',
            'School lunches have too much sugar.',
            'The cost of changing buses is small by comparison.',
          ], right: 2, why: 'You can see it at once with only the first sentences in front of you. That’s what a reverse outline is for.' },
          { kind: 'sort', ask: 'Right or wrong?', left: 'Right', right: 'Wrong', items: [
            ['She could have stayed.', 0],
            ['She could of stayed.', 1],
            ['The school has its own rules.', 0],
            ['The school has it’s own rules.', 1],
            ['Sleep affects grades.', 0],
            ['Sleep effects grades.', 1],
            ['They’re going to their class.', 0],
            ['Their going to they’re class.', 1],
          ] },
          { kind: 'write', ask: 'What do you most often lose marks for? Write it down, and how you’ll check for it next time. It’ll be at the top of the page whenever you write an essay here.', keep: 'watch',
            placeholder: 'I often… so I’ll…',
            hints: [{ when: (t, n) => n < 4, say: 'Say what it is, and how you’ll catch it.' }],
            check: ['It’s something specific enough to check for.'],
            models: ['I stop after the quotation, so I’ll look at the end of every body paragraph and make sure it’s in my own words.'] },
        ],
      },
    ],
  },
  {
    unit: 'Writing about a text',
    steps: [
      {
        title: 'Theme, not plot',
        icon: '📖',
        blurb: 'Argue about what it means. Your reader knows what happens.',
        cards: [
          { kind: 'read', html: `<p>An essay about a book or a poem argues about what it <b>means</b>. Your reader has read it already, so retelling it wastes the page.</p>
            <div class="e-ladder"><p><span class="e-tag bad">Plot</span> Macbeth kills the king and becomes king himself.</p>
            <p><span class="e-tag ok">Topic</span> Ambition.</p>
            <p><span class="e-tag good">Theme</span> Ambition, once fed, destroys the person it was meant to lift.</p></div>
            <p>A topic is a word. A theme is a sentence: what the work says <i>about</i> that word.</p>` },
          { kind: 'sort', ask: 'Is it a theme, or something less?', left: 'A theme', right: 'Plot or just a topic', items: [
            ['Macbeth kills the king.', 1],
            ['Hope.', 1],
            ['Hope survives because it asks for nothing in return.', 0],
            ['A man picks a road in a wood.', 1],
            ['People retell their choices so their lives make sense.', 0],
            ['Ambition.', 1],
            ['Power cannot give back what it costs to get it.', 0],
            ['Romeo meets Juliet at a party.', 1],
          ] },
          { kind: 'choose', ask: 'Which is the best thesis for an essay on “The Road Not Taken”?', options: [
            '“The Road Not Taken” is a poem by Robert Frost about two roads.',
            'The speaker takes the road less traveled.',
            'The poem is about choices.',
            'Although it’s often read as praise for the bold choice, the poem suggests the roads were alike, and that the “difference” comes only from the story the speaker tells later.',
          ], right: 3, why: 'It’s the only one you could disagree with, and it’s about what the poem means. The others are plot or topic.' },
          { kind: 'write', ask: 'Pick a book, film or poem you know. Write one sentence saying what it says about something: a theme, not the plot.',
            placeholder: 'In … the writer suggests that…',
            hints: [
              { when: (t, n) => n < 7, say: 'A theme is a whole sentence: what does it say about that subject?' },
              { when: has(/\b(is about|tells the story|goes to|finds out|meets)\b/i), say: 'That sounds like plot. What idea does the story leave you with?' },
            ],
            check: ['It’s a full idea, not one word.', 'It would still make sense to someone who hasn’t read it.', 'Someone could disagree.'],
            models: ['In “Hope is the thing with feathers,” Dickinson suggests that hope lasts because it needs nothing from the person who has it.'] },
        ],
      },
      {
        title: 'Method and effect',
        icon: '🎭',
        blurb: 'Say what the writer does, and what it does to you.',
        cards: [
          { kind: 'read', html: `<p>Naming a technique earns nothing by itself. What counts is what it <b>does</b>. Try to include all three: what the writer does, the exact words, and the effect.</p>
            <div class="e-ladder"><p><span class="e-tag bad">Feature spotting</span> Shakespeare uses a metaphor in this line, which makes it interesting.</p>
            <p><span class="e-tag good">Method and effect</span> By calling life “a walking shadow,” Shakespeare takes away its substance: a shadow has no weight of its own, and it’s gone when the light changes.</p></div>
            <p>“This makes the reader want to read on” is never an effect. Say what the words make you see or feel.</p>` },
          { kind: 'match', ask: 'Match each device to an example of it.', pairs: [
            ['Metaphor', '“Hope” is the thing with feathers'],
            ['Simile', 'My love is like a red, red rose'],
            ['Personification', 'Because I could not stop for Death, He kindly stopped for me'],
            ['Repetition', 'Tomorrow, and tomorrow, and tomorrow'],
            ['Alliteration', 'The furrow followed free'],
          ] },
          { kind: 'sort', ask: 'Does it say the effect, or only name a device?', left: 'Says the effect', right: 'Only names it', items: [
            ['Shakespeare uses a metaphor in this line.', 1],
            ['The repeated “tomorrow” drags, so that the line feels as slow as the days Macbeth dreads.', 0],
            ['The poem has alliteration.', 1],
            ['Calling hope a bird makes it seem small, alive and hard to catch.', 0],
            ['This makes the reader want to read on.', 1],
            ['The word “sigh” leaves it open whether the speaker feels relief or regret.', 0],
            ['This is very effective.', 1],
          ] },
          { kind: 'write', ask: 'Here’s a line from “The Road Not Taken”. What does the word “sigh” do? Write one sentence.', given: 'I shall be telling this with a sigh',
            placeholder: 'The word “sigh”…',
            hints: [
              { when: (t) => !/sigh/i.test(t), say: 'Use the word itself in your sentence.' },
              { when: has(/\b(want to read on|very effective|interesting|engag)\w*/i), say: 'That could be said about anything. What does this word make you think he feels?' },
              { when: (t) => !/\b(suggest|impl|show|could|might|leave|hint|mean|feel|regret|relief|sad|tired)\w*\b/i.test(t), say: 'What does a sigh tell you about how he feels?' },
            ],
            check: ['I talked about the word, not the whole poem.', 'I said what it makes me think or feel.', 'It could only be about this line.'],
            models: ['The word “sigh” leaves the speaker’s feeling open: it could be relief or regret, which hints that even he does not know whether the choice was right.'] },
        ],
      },
    ],
  },
];

export const STEPS = UNITS.flatMap((u) => u.steps);
