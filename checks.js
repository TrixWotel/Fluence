// What the page can honestly tell about an essay, by counting and looking for patterns: how it's built, where the evidence is,
// what's left unexplained, and habits worth a second look. It can't tell whether an argument is any good, and it says so: that's
// what the rubric is for (write.js). No network and no AI: everything here runs in the browser.
//
// analyze(text, { kind, thesis, target, title }) gives { stats, paragraphs, thesis, outline, findings }. A finding is
// { id, tone: 'good' | 'look' | 'ask', title, detail, spans: [[start, end], ...] }, the spans being where it is in the text.

const FILLER = ['very', 'really', 'quite', 'basically', 'actually', 'literally', 'totally', 'definitely', 'simply', 'pretty much', 'kind of', 'sort of', 'just'];
const VAGUE = ['things', 'thing', 'stuff', 'a lot', 'lots of', 'nice', 'good', 'bad', 'many people', 'everyone', 'nowadays'];
const TIRED = ['since the dawn of time', 'since the beginning of time', 'throughout history', 'throughout human history', 'in today’s society', 'in today\'s society', 'in this day and age', 'dictionary defines', 'this essay will', 'in this essay', 'i am going to', 'i will discuss', 'last but not least', 'at the end of the day', 'needless to say', 'it goes without saying', 'first and foremost'];
const HEDGES = ['i think', 'i believe', 'i feel', 'in my opinion', 'i would say', 'personally'];
const SLIPS = [
  [/\b(could|should|would|must|might) of\b/gi, 'Should be “have”, as in “could have”.'],
  [/\balot\b/gi, 'Two words: “a lot”. Better still, a more exact word.'],
  [/\bdefinate(ly)?\b/gi, 'It’s spelled “definite”.'],
  [/\bseperate(ly|d)?\b/gi, 'It’s spelled “separate”.'],
  [/\brecieve[sd]?\b/gi, 'It’s spelled “receive”.'],
  [/\boccured\b/gi, 'It’s spelled “occurred”.'],
  [/\bit[’']s own\b/gi, '“Its own”, with no apostrophe.'],
  [/\btheir (is|are|was|were)\b/gi, '“There”, the place word, not “their”.'],
  [/\bthere (own|own)\b/gi, '“Their own”.'],
  [/\byour (welcome|right|wrong)\b/gi, '“You’re”, short for “you are”. Spell it out in an essay.'],
  [/\b(?<![“"])i\b(?![”"])(?=\s+(am|was|have|think|feel|believe|had|will|would|can)\b)/g, 'A capital I.'],
];
const REASON = /\b(because|since|as|while|although|though|but|yet|rather than|instead of|so|by|which|who|more than|even though|if|when|not|despite|until|unless)\b/i;
const EVIDENCE = /[“"][^”"]{3,}[”"]|\d|\b(for example|for instance|according to|such as|study|studies|survey|research|researchers|found that|source [abc]|reported|data|percent|twice|half|twelve|eleven|ten|nine|eight|seven|six|five|four|three|two|hundred|thousand|million)\b/i;
const NAMED = /[a-z,] [A-Z][a-z]{2,}/;   // (a name in the middle of a sentence: a person, a place, a book)
const EXPLAINS = /\b(this (shows|suggests|means|implies|reveals|matters|makes|is why|highlights|proves)|that (shows|suggests|means|matters|is why|makes)|which (shows|suggests|means|makes)|because|therefore|so\b|as a result|for this reason|suggest(s|ing)?|impl(y|ies)|reveal(s|ing)?|show(s|ing)?|mean(s|ing)?|matter(s)?|if\b|thus|hence|rather than|instead|even though|yet\b|but\b|point to|points to|emphasi[sz]e[sd]?|underlines?|makes?\b|(this|that|these|those) (is|are|was|were)\b|more than|which\b|since\b|though\b|although\b|however\b|why\b)/i;
const LINKS = /^(however|but|yet|still|also|moreover|furthermore|in addition|similarly|likewise|in contrast|by contrast|on the other hand|even|although|though|while|another|this|these|that|those|such|beyond|besides|because|since|if|once|as|critics|opponents|some|others|the first|the second|the third|the same|the last|first|second|third|finally|next|then|for|at|what|nor|not only)\b/i;
const OTHER_SIDE = /\b(critics?|opponents?|some (people |students |parents |teachers )?(argue|say|claim|believe|think|might|may|would|point)|others (argue|say|claim|believe|think|might|may|would)|it is true|admittedly|to be sure|granted|on the other hand|one could argue|might argue|may argue|could argue|would argue|objection|those who|skeptics?|defenders?|supporters?)\b/i;
const STOP = new Set('a an and are as at be been but by can could did do does for from had has have he her his how i if in into is it its just may might more most much must my no nor not of on one only or our she should so some such than that the their them then there these they this those to too up us was we were what when where which while who whom why will with would you your also about after again all am any because before being both each few further here him himself herself itself me myself once other out over own same theirs themselves through under until very yours'.split(' '));

const wordsIn = (s) => s.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu) || [];
export const countWords = (s) => wordsIn(s).length;
const contentWords = (s) => wordsIn(s.toLowerCase()).filter((w) => w.length > 2 && !STOP.has(w)).map((w) => w.replace(/[’']s$/, ''));
const stem = (w) => w.replace(/(ing|ers|ed|es|s)$/, '') || w;
const overlap = (a, b) => {
  const x = new Set(contentWords(a).map(stem)), y = new Set(contentWords(b).map(stem));
  if (!x.size) return 0;
  let n = 0;
  for (const w of x) if (y.has(w)) n++;
  return n / x.size;
};
// the text, with what's between quotation marks blanked out, so a poet's “thing” isn't held against you
function unquoted(text) {
  const out = [...text];
  let open = -1;
  for (let i = 0; i < out.length; i++) {
    if (out[i] === '“') open = i;
    else if (out[i] === '”' && open >= 0) { for (let k = open + 1; k < i; k++) if (out[k] !== '\n') out[k] = ' '; open = -1; }
  }
  // straight quotes, in pairs on a line
  return out.join('').replace(/"[^"\n]*"/g, (m) => `"${' '.repeat(m.length - 2)}"`);
}
const ABBREVIATION = /(?:\b(?:Mr|Mrs|Ms|Dr|St|Prof|vs|etc|No|Vol|Jr|Sr)|\b[A-Z]|\be\.g|\bi\.e)$/;
// sentences of a paragraph, each [start, end] in the whole text
function sentencesOf(text, start, end) {
  const out = [];
  let from = start, i = start;
  const skipSpace = (k) => { while (k < end && /\s/.test(text[k])) k++; return k; };
  from = skipSpace(from);
  for (i = from; i < end; i++) {
    if (!'.?!'.includes(text[i])) continue;
    let stop = i + 1;
    while (stop < end && '.?!”"’\')]'.includes(text[stop])) stop++;
    const next = skipSpace(stop);
    if (next >= end) break;
    if (next === stop) continue;   // (no space: a decimal, or an initial)
    const before = text.slice(Math.max(from, i - 8), i);
    if (text[i] === '.' && ABBREVIATION.test(before)) continue;
    if (!/[\p{Lu}\p{N}“"‘(]/u.test(text[next])) continue;   // (the sentence carries on)
    out.push([from, stop]);
    from = next;
    i = next - 1;
  }
  if (from < end && /\S/.test(text.slice(from, end))) out.push([from, trimEnd(text, end)]);
  return out;
}
const trimEnd = (text, end) => { let k = end; while (k > 0 && /\s/.test(text[k - 1])) k--; return k; };
function paragraphsOf(text) {
  const out = [], re = /[^\n]*\S[^\n]*/g;
  let m;
  while ((m = re.exec(text))) {
    const start = m.index + (m[0].length - m[0].trimStart().length), end = m.index + m[0].trimEnd().length;
    const sentences = sentencesOf(text, start, end).map(([a, b]) => ({ start: a, end: b, text: text.slice(a, b) }));
    out.push({ start, end, text: text.slice(start, end), words: countWords(text.slice(start, end)), sentences });
  }
  return out;
}
const everywhere = (masked, phrase) => {
  const out = [], re = new RegExp(`(?<![\\p{L}\\p{N}’'-])${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+')}(?![\\p{L}\\p{N}’'-])`, 'giu');
  let m;
  while ((m = re.exec(masked))) out.push([m.index, m.index + m[0].length]);
  return out;
};
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const listing = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);
const nth = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
const paragraphName = (i) => `the ${nth[i] || `${i + 1}th`} paragraph`;

// the words to aim for, by kind
export const TARGETS = { argue: [400, 700], text: [350, 650], sources: [400, 700], paragraph: [80, 180], opening: [40, 120], ending: [35, 110], own: [350, 800] };

export function analyze(text, { kind = 'argue', thesis = '', target = null, title = '' } = {}) {
  const paragraphs = paragraphsOf(text), masked = unquoted(text), sentences = paragraphs.flatMap((p) => p.sentences), words = countWords(text);
  const findings = [];
  const add = (id, tone, heading, detail, spans = []) => findings.push({ id, tone, title: heading, detail, spans });
  const whole = !['paragraph', 'opening', 'ending'].includes(kind);
  const [low, high] = target || TARGETS[kind] || TARGETS.own;
  const lengths = sentences.map((s) => countWords(s.text));
  const stats = { words, paragraphs: paragraphs.length, sentences: sentences.length, average: sentences.length ? Math.round(words / sentences.length) : 0, longest: lengths.length ? Math.max(...lengths) : 0, low, high };
  if (!words) return { stats, paragraphs, thesis: null, outline: [], findings };

  // ---------- how long, and how it's built ----------
  if (words < low * 0.6) add('length', 'look', `${words} words is short for this`, `Aim for ${low} to ${high}. With fewer than ${Math.round(low * 0.6)}, there usually isn’t room to prove anything.`);
  else if (words < low) add('length', 'ask', `${words} words, a little under the ${low} to ${high} to aim for`, 'If it says what it needs to, that’s fine. If a point feels thin, that’s where the words should go.');
  else if (words > high * 1.4) add('length', 'look', `${words} words is long for this`, `Aim for ${low} to ${high}. Look for the point you could lose without hurting the argument.`);
  else add('length', 'good', `${words} words, about right`, `The aim is ${low} to ${high}.`);

  if (whole) {
    if (paragraphs.length === 1 && words > 80) add('one-block', 'look', 'It’s all one paragraph', 'Press Return where one idea ends and the next begins. A reader needs to see the argument’s shape.', [[paragraphs[0].start, paragraphs[0].end]]);
    else if (paragraphs.length > 1 && paragraphs.length < 4 && words > 250) add('few-paragraphs', 'look', `Only ${plural(paragraphs.length, 'paragraph')}`, 'Most essays this long have an introduction, at least two body paragraphs and a conclusion.');
    else if (paragraphs.length >= 4) add('shape', 'good', `${paragraphs.length} paragraphs: an opening, ${plural(paragraphs.length - 2, 'body paragraph')} and an ending`, 'That’s the usual shape.');
  } else if (paragraphs.length > 1) {
    add('one-paragraph', 'ask', `This is ${plural(paragraphs.length, 'paragraph')}`, 'The task asks for one. Would it hold together as a single block?');
  }

  // ---------- the thesis ----------
  const body = kind === 'opening' || kind === 'ending' ? [] : whole && paragraphs.length >= 3 ? paragraphs.slice(1, -1) : !whole ? paragraphs : paragraphs.slice(1);
  const intro = kind === 'opening' || (whole && paragraphs.length >= 2) ? paragraphs[0] : null, ending = kind === 'ending' || (whole && paragraphs.length >= 3) ? paragraphs.at(-1) : null;
  const found = intro?.sentences.at(-1) || null;
  if (found) {
    const t = found.text, lower = t.toLowerCase(), span = [[found.start, found.end]];
    if (/\?\s*[”"]?$/.test(t)) add('thesis-question', 'look', 'Your introduction ends on a question', 'A thesis answers the question. Say what you think the answer is, as a statement.', span);
    else if (/\b(this essay|in this essay|i will (discuss|talk|explain|show|argue|be)|i am going to|i’m going to|i'm going to)\b/.test(lower)) add('thesis-announce', 'look', 'Your thesis announces what you’ll do', 'Drop “this essay will” and just say the claim. It’s stronger without the announcement.', span);
    else if (countWords(t) < 8) add('thesis-short', 'look', 'Your thesis looks very short', 'Eight words rarely hold a claim and a reason. Add why.', span);
    else if (!REASON.test(t)) add('thesis-why', 'ask', 'Does your thesis say why?', 'The last sentence of your opening is usually the thesis. This one doesn’t seem to give a reason. Check it does more than state a side.', span);
    else add('thesis-found', 'ask', 'Is this your thesis?', `The page reads the last sentence of your opening as the thesis. Could a sensible person disagree with it? If not, it’s a fact, not an argument.`, span);
    if (thesis && overlap(thesis, intro.text) < 0.4) add('thesis-plan', 'look', 'The thesis in your plan isn’t in your opening', 'Your plan says something different from your introduction. Either can be right, but a reader only sees the essay.', span);
  }
  if (intro && words > 200 && intro.words > words * 0.35) add('intro-long', 'look', 'The opening takes up over a third of it', 'Get to the thesis sooner, and save the detail for the body.', [[intro.start, intro.end]]);
  const opener = paragraphs[0]?.sentences[0];
  for (const phrase of TIRED) for (const span of everywhere(masked, phrase)) add(`tired-${span[0]}`, 'look', `“${text.slice(span[0], span[1])}”`, 'A worn out phrase. It tells a reader nothing. Say something only your essay could say.', [span]);

  // ---------- the body ----------
  const missing = [], notExplained = [], endsOnQuote = [], startsOnQuote = [], thin = [], long = [];
  body.forEach((p) => {
    const i = paragraphs.indexOf(p), plain = masked.slice(p.start, p.end);
    if (!EVIDENCE.test(p.text) && !NAMED.test(masked.slice(p.start, p.end)) && !OTHER_SIDE.test(plain)) missing.push(i);   // (answering the other side is proof enough)
    if (!EXPLAINS.test(plain)) notExplained.push(i);
    const last = p.sentences.at(-1);
    if (p.sentences.length > 1 && last && /[”"]\s*[.)]?\s*[.?!]?\s*$/.test(last.text) && (last.text.match(/[“"]/g) || []).length && countWords(last.text) - countWords(masked.slice(last.start, last.end)) >= 4 && countWords(masked.slice(last.start, last.end)) <= countWords(last.text) * 0.6) endsOnQuote.push(i);
    if (/^[“"]/.test(p.text)) startsOnQuote.push(i);
    if (whole && p.words < 45) thin.push(i);
    if (p.words > 230) long.push(i);
  });
  const spansOf = (list) => list.map((i) => [paragraphs[i].start, paragraphs[i].end]);
  if (body.length) {
    if (missing.length) add('no-evidence', 'look', `No evidence the page can see in ${listing(missing.map(paragraphName))}`, 'It looks for quotations, numbers, names of studies and phrases like “for example”. If there’s a fact in there, could it be more specific?', spansOf(missing));
    else add('evidence', 'good', whole ? 'Every body paragraph has some evidence' : 'There’s evidence in it', 'Whether it’s the right evidence is for you to judge.');
    if (notExplained.length) add('no-analysis', 'look', `${cap(listing(notExplained.map(paragraphName)))} may not explain ${notExplained.length === 1 ? 'itself' : 'themselves'}`, 'The page can’t find words like “because”, “this suggests” or “which means”. After the evidence, say what it shows.', spansOf(notExplained));
    else add('analysis', 'good', 'The words of explaining are there', 'The page can’t judge the thinking, but it can see “because”, “this suggests” and the like.');
    if (endsOnQuote.length) add('ends-on-quote', 'look', `${cap(listing(endsOnQuote.map(paragraphName)))} ${endsOnQuote.length === 1 ? 'ends' : 'end'} on a quotation`, 'Don’t leave a reader to work it out. End on your own words: what does the quotation show?', endsOnQuote.map((i) => { const s = paragraphs[i].sentences.at(-1); return [s.start, s.end]; }));
    if (startsOnQuote.length) add('starts-on-quote', 'look', `${cap(listing(startsOnQuote.map(paragraphName)))} ${startsOnQuote.length === 1 ? 'opens' : 'open'} with a quotation`, 'Start with your point in your own words, and let the quotation back it up.', startsOnQuote.map((i) => { const s = paragraphs[i].sentences[0]; return [s.start, s.end]; }));
    if (thin.length) add('thin', 'look', `${cap(listing(thin.map(paragraphName)))} ${thin.length === 1 ? 'is' : 'are'} very short`, 'Under 45 words rarely fits a point, its evidence and what it shows.', spansOf(thin));
    if (long.length) add('long-paragraph', 'look', `${cap(listing(long.map(paragraphName)))} ${long.length === 1 ? 'is' : 'are'} very long`, 'Over 230 words is usually two ideas. Is there a place to split it?', spansOf(long));
  }
  // a quotation left standing on its own
  const dropped = sentences.filter((s) => { const t = s.text.trim(); return /^[“"]/.test(t) && /[”"][.?!]?$/.test(t) && (t.match(/[“"]/g) || []).length <= 2 && countWords(masked.slice(s.start, s.end)) <= 1; });
  if (dropped.length) add('dropped-quote', 'look', dropped.length === 1 ? 'A quotation stands alone' : `${dropped.length} quotations stand alone`, 'Lead into it, so it’s part of your own sentence: Macbeth calls life “a walking shadow.”', dropped.map((s) => [s.start, s.end]));
  const longQuotes = [...text.matchAll(/“[^”]+”/g)].filter((m) => countWords(m[0]) > 30).map((m) => [m.index, m.index + m[0].length]);
  if (longQuotes.length) add('long-quote', 'look', 'A long quotation', 'Over 30 words of someone else is too many. Quote only the words you’ll talk about.', longQuotes);
  const quotes = (text.match(/“[^”]{2,}”|"[^"\n]{2,}"/g) || []).length;
  if (kind === 'text' && !quotes && words > 80) add('no-quotes', 'look', 'No quotations from the text', 'An essay about a text needs its exact words. Choose short ones, and say what they do.');
  else if (kind === 'text' && quotes >= 3 && !dropped.length) add('quotes', 'good', `${quotes} quotations, worked in`, 'None of them stands alone.');
  if (kind === 'sources') {
    const used = new Set([...text.matchAll(/\bsource\s+([abc])\b/gi)].map((m) => m[1].toUpperCase()));
    if (used.size < 2) add('sources', 'look', used.size ? `Only Source ${[...used][0]} is mentioned` : 'No source is mentioned by name', 'Use at least two, and say which: “Source B shows that…”');
    else add('sources-used', 'good', `Uses Sources ${listing([...used].sort())}`, 'Check that you say what each shows, rather than just repeating it.');
  }

  // ---------- flow, the other side, and the ending ----------
  if (whole && paragraphs.length >= 4) {
    const stranded = body.filter((p, n) => {
      if (n === 0) return false;
      const lead = p.sentences[0]?.text || '', before = body[n - 1].sentences.at(-1)?.text || '';
      return !LINKS.test(lead.trim()) && overlap(lead, `${before} ${body[n - 1].text}`) < 0.15;
    });
    if (stranded.length) add('no-link', 'ask', `${cap(listing(stranded.map((p) => paragraphName(paragraphs.indexOf(p)))))} ${stranded.length === 1 ? 'doesn’t' : 'don’t'} seem to link back`, 'The first sentence shares nothing with the paragraph before. Would a reader see how it follows?', stranded.map((p) => [p.sentences[0].start, p.sentences[0].end]));
    const numbered = body.filter((p) => /^(firstly|secondly|thirdly|first,|second,|third,|finally,)/i.test(p.text)).length;
    if (numbered >= 3) add('numbered', 'ask', 'First, second, third', 'It’s clear, but it only says the points are in a list. Could each opening say how it follows from the last?', body.filter((p) => /^(firstly|secondly|thirdly|first,|second,|third,|finally,)/i.test(p.text)).map((p) => [p.sentences[0].start, p.sentences[0].end]));
  }
  if ((kind === 'argue' || kind === 'sources') && words > 150) {
    if (!OTHER_SIDE.test(masked)) add('other-side', 'look', 'It doesn’t seem to answer the other side', 'Name the best objection and answer it. It makes the whole essay more convincing.');
    else add('other-side-found', 'good', 'It takes on the other side', 'Check that it answers the objection and doesn’t only mention it.');
  }
  if (ending) {
    const span = [[ending.start, ending.end]], first = ending.sentences[0];
    const opens = /^(in conclusion|to conclude|in summary|to sum up|to summarize|overall|in closing)\b/i.exec(ending.text);
    if (opens) add('conclusion-label', 'look', `“${opens[0]}”`, 'A reader can see it’s the end. Start with the thought instead.', [[first.start, first.start + opens[0].length]]);
    if (found && overlap(found.text, ending.text) >= 0.75 && ending.words < found.text.split(/\s+/).length * 2.2) add('conclusion-copy', 'look', 'The ending mostly repeats your thesis', 'Say what follows from it, or why it matters, as well.', span);
    if (ending.words < 25) add('conclusion-short', 'look', 'The ending is very short', 'A sentence or two more: what’s been proved, and why does it matter?', span);
    if (/\b(for example|for instance|according to|a study|another reason|another example)\b/i.test(masked.slice(ending.start, ending.end))) add('conclusion-new', 'look', 'New evidence in the ending', 'If it matters, it belongs in the body. Endings are for what it all adds up to.', span);
  }

  // ---------- sentences and words ----------
  const longOnes = sentences.filter((s) => countWords(s.text) > 40);
  if (longOnes.length) add('long-sentences', 'look', longOnes.length === 1 ? 'A very long sentence' : `${longOnes.length} very long sentences`, 'Over 40 words. Read it aloud: if you run out of breath, split it.', longOnes.map((s) => [s.start, s.end]));
  if (sentences.length >= 8) {
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length, spread = Math.sqrt(lengths.reduce((a, b) => a + (b - mean) ** 2, 0) / lengths.length);
    if (spread < 3.5) add('same-length', 'ask', 'The sentences are all about the same length', `Most run close to ${Math.round(mean)} words. A short sentence after a long one is one of the easiest ways to make a point land.`);
    else if (spread >= 6) add('varied', 'good', 'Sentences of different lengths', 'That keeps a reader awake.');
  }
  for (const p of paragraphs) {
    const starts = p.sentences.map((s) => (wordsIn(s.text)[0] || '').toLowerCase());
    for (let i = 0; i + 2 < starts.length; i++) {
      if (!starts[i] || starts[i] !== starts[i + 1] || starts[i] !== starts[i + 2]) continue;
      let end = i + 2;
      while (end + 1 < starts.length && starts[end + 1] === starts[i]) end++;
      if (!['the', 'a', 'an'].includes(starts[i]) || end - i + 1 >= 5) add(`same-start-${p.start + i}`, 'look', `${end - i + 1} sentences in a row start with “${cap(starts[i])}”`, 'Change the way one of them begins.', p.sentences.slice(i, end + 1).map((s) => [s.start, s.start + starts[i].length]));
      i = end;
    }
  }
  const hedges = HEDGES.flatMap((p) => everywhere(masked, p));
  if (hedges.length) add('hedges', 'look', hedges.length === 1 ? '“I think” or the like' : `“I think” or the like, ${hedges.length} times`, 'The whole essay is what you think. Saying so only makes it sound less sure.', hedges);
  const fillers = FILLER.flatMap((p) => everywhere(masked, p)).sort((a, b) => a[0] - b[0]);
  if (fillers.length >= Math.max(3, words / 120)) add('filler', 'look', `${fillers.length} words that may add nothing`, 'Very, really, just and friends. Try the sentence without each one.', fillers);
  const asked = title.toLowerCase();
  const vague = VAGUE.filter((p) => !new RegExp(`\\b${p}\\b`).test(asked)).flatMap((p) => everywhere(masked, p)).sort((a, b) => a[0] - b[0]);
  if (vague.length >= Math.max(3, words / 80)) add('vague', 'look', `${vague.length} vague words`, 'Things, stuff, a lot, good, bad. What exactly do you mean? The exact word is usually evidence in itself.', vague);
  const youSpans = everywhere(masked, 'you');
  if (youSpans.length >= 2) add('you', 'look', `“You”, ${youSpans.length} times`, 'In a formal essay, say who you mean: students, readers, parents.', youSpans);
  const contractions = [...masked.matchAll(/\b[\p{L}]+n[’']t\b|\b(?:it|that|there|they|we|you|i|he|she|who|what)[’'](?:s|re|ve|ll|d|m)\b/giu)].map((m) => [m.index, m.index + m[0].length]);
  if (contractions.length) add('contractions', 'ask', contractions.length === 1 ? 'A contraction' : `${contractions.length} contractions`, 'Can’t, it’s, don’t. Most formal essays spell these out, unless your teacher doesn’t mind.', contractions);
  const passives = [...masked.matchAll(/\b(?:is|are|was|were|be|been|being)\s+(?:\w+ly\s+)?(?:\w+ed|made|done|given|taken|seen|shown|written|known|built|kept|held|told|found|lost)\b/gi)].map((m) => [m.index, m.index + m[0].length]);
  if (sentences.length >= 6 && passives.length >= Math.max(5, sentences.length * 0.35)) add('passive', 'ask', `${passives.length} places where nobody seems to be doing anything`, '“Mistakes were made” hides who made them. Put the doer first where you can.', passives);
  const thereIs = sentences.filter((s) => /^there (is|are|was|were)\b/i.test(s.text));
  if (thereIs.length >= 3) add('there-is', 'look', `${thereIs.length} sentences start “There is” or “There are”`, 'Start with what the sentence is about.', thereIs.map((s) => [s.start, s.start + 8]));
  // a word used over and over (other than what the essay is about)
  const about = new Set(contentWords(`${title} ${thesis} ${found?.text || ''}`).map(stem));
  const tally = new Map();
  for (const m of masked.matchAll(/[\p{L}]+(?:[’'-][\p{L}]+)*/gu)) {
    const w = m[0].toLowerCase(), s = stem(w);
    if (w.length < 4 || STOP.has(w) || about.has(s)) continue;
    if (!tally.has(s)) tally.set(s, { word: w, spans: [] });
    tally.get(s).spans.push([m.index, m.index + m[0].length]);
  }
  const overused = [...tally.values()].filter((x) => x.spans.length >= Math.max(6, words * 0.016)).sort((a, b) => b.spans.length - a.spans.length).slice(0, 2);
  for (const x of overused) add(`repeat-${x.word}`, 'ask', `“${x.word}”, ${x.spans.length} times`, 'If it isn’t the essay’s subject, could some of these be another word, or none?', x.spans);
  for (const [re, say] of SLIPS) {
    const hits = [...text.matchAll(re)].map((m) => [m.index, m.index + m[0].length]);
    if (hits.length) add(`slip-${hits[0][0]}`, 'look', `“${text.slice(hits[0][0], hits[0][1])}”`, say, hits);
  }
  const unfinished = paragraphs.filter((p) => !/[.?!]["”’')\]]*$/.test(p.text));
  if (unfinished.length && whole) add('no-stop', 'look', unfinished.length === 1 ? 'A paragraph has no full stop at the end' : `${unfinished.length} paragraphs have no full stop at the end`, 'It may be a heading, or something left unfinished.', unfinished.map((p) => [Math.max(p.start, p.end - 12), p.end]));
  const lowerStarts = sentences.filter((s) => /^[a-z]/.test(s.text));
  if (lowerStarts.length) add('lower-start', 'look', lowerStarts.length === 1 ? 'A sentence starts without a capital' : `${lowerStarts.length} sentences start without a capital`, 'Worth fixing before anyone else reads it.', lowerStarts.map((s) => [s.start, s.start + 1]));
  if (!findings.some((x) => ['hedges', 'filler', 'vague', 'you', 'long-sentences'].includes(x.id) || x.id.startsWith('tired')) && words >= 80) add('clean', 'good', 'No tired phrases or filler that the page can find', 'It only knows the common ones, but that’s a good sign.');

  const outline = paragraphs.map((p, i) => ({ i, role: !whole ? 'Paragraph' : i === 0 && paragraphs.length > 1 ? 'Opening' : ending && i === paragraphs.length - 1 ? 'Ending' : 'Body', text: (p.sentences[0]?.text || p.text), start: p.sentences[0]?.start ?? p.start, end: p.sentences[0]?.end ?? p.end }));
  const order = { look: 0, ask: 1, good: 2 };
  findings.sort((a, b) => order[a.tone] - order[b.tone]);
  return { stats, paragraphs, thesis: found ? { start: found.start, end: found.end, text: found.text } : null, outline, findings, opener: opener?.text || '' };
}
const cap = (s) => s[0].toUpperCase() + s.slice(1);

// the marks you give yourself: what a page can't count
export const RUBRIC = [
  { id: 'focus', name: 'Answers the question', levels: ['Drifts away from what was asked, or has no clear position.', 'Has a position, but it’s obvious or goes off track in places.', 'A clear, arguable thesis, and the essay keeps to it.', 'A thesis with real insight, and every paragraph moves it forward.'] },
  { id: 'evidence', name: 'Evidence', levels: ['Little or none, or it doesn’t relate to the point.', 'Some, but vague or mostly general.', 'Specific and relevant in every body paragraph.', 'Chosen with care: the best facts or words, used exactly.'] },
  { id: 'analysis', name: 'Explaining it', levels: ['Mostly retells or lists.', 'Says what the evidence shows, but stops at the obvious.', 'Explains how each piece of evidence proves the point.', 'Goes beyond the obvious: nuance, implications, why it matters.'] },
  { id: 'order', name: 'How it’s put together', levels: ['Hard to follow. Ideas come in no clear order.', 'Has an order, but jumps between some points.', 'Clear opening, body and ending. Each point follows from the last.', 'The order itself builds the argument, and the ending adds something new.'] },
  { id: 'style', name: 'How it sounds', levels: ['Chatty, vague or repetitive.', 'Clear enough, but wordy or flat.', 'Clear, formal and mostly exact.', 'Precise, varied and a pleasure to read.'] },
  { id: 'errors', name: 'Spelling and grammar', levels: ['Mistakes get in the way of reading.', 'Many small mistakes.', 'A few small mistakes.', 'Almost none.'] },
];
