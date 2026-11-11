// A Science course from its topics' facts, asked many ways: choosing, typing the word, true or false, matching words to
// what they mean, sorting onto two sides, putting steps in order, choosing all that fit, and working out numbers where
// the topic has them (density, the gas laws…). Everything a topic has is asked: each fact, statement, word to type, set
// to choose from and order once, the numbers three times a template (new numbers each time), its words matched in fours
// twice round, and three sorts, spread through the topic so the ways take turns. Every variant is built from its number,
// so Variant 137 is always the same question.
//
// A topic is { name, facts, typed, tf, pairs, sort, multi, order, calc }:
//   facts: [question, right answer, [four wrong ones], why]           choose one of five
//   typed: [question, [the answers to accept, the usual first], why]   type a word or two
//   tf:    [statement, true or false, why]                             true or false
//   pairs: [term, what it means or is]                                  match four of them at a time
//   sort:  { title, left, right, items: [[item, 'l' or 'r']] }          put six of them on their side
//   multi: [question, [right ones], [wrong ones], why]                 choose all that fit
//   order: [what to put in order, [the items in the right order], why] tap them in order (optional)
//   calc:  [(d) => ({ text, answer, solution })]                        numbers to work out, from the dice d (optional)
import { dice } from '../kit/bank.js';

const listing = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);
// a choice question: the right answer among the wrong ones, in an order from the dice
const choice = (d, right, wrong) => {
  const all = d.shuffle([right, ...wrong]);
  return { kind: 'choice', choices: all, correct: all.indexOf(right) };
};

// how many times a topic asks each way: once for each of its facts, statements, words, sets and orders, three times for
// each worked-numbers template, its words in fours twice round, and three sorts
const TIMES = {
  fact: (t) => t.facts?.length || 0, tf: (t) => t.tf?.length || 0, typed: (t) => t.typed?.length || 0, multi: (t) => t.multi?.length || 0, order: (t) => t.order?.length || 0,
  calc: (t) => (t.calc?.length || 0) * 3, match: (t) => (t.pairs?.length >= 4 ? Math.ceil(t.pairs.length / 4) * 2 : 0), sort: (t) => (t.sort?.items?.length ? 3 : 0),
};
// a topic's ways, each spread evenly through it (so a run of its questions mixes them), with the order they're asked in:
// ways[k] is [the way, which time it is that way]
function plan(topic) {
  const out = [];
  for (const [way, times] of Object.entries(TIMES)) { const n = times(topic); for (let i = 0; i < n; i++) out.push({ way, i, at: (i + 0.5) / n }); }
  return out.sort((a, b) => a.at - b.at || Object.keys(TIMES).indexOf(a.way) - Object.keys(TIMES).indexOf(b.way)).map((x) => [x.way, x.i]);
}
const ASK = {
  fact(d, topic, turn) {
    const [q, right, wrong, why] = topic.facts[turn % topic.facts.length];
    return { text: q, answer: choice(d, right, wrong), solution: `${why} The answer is <b>${right}</b>.` };
  },
  typed(d, topic, turn) {
    const [q, accept, why] = topic.typed[turn % topic.typed.length];
    return { text: `${q} <span class="muted">Type your answer.</span>`, answer: { kind: 'text', accept }, solution: `${why} The answer is <b>${accept[0]}</b>.` };
  },
  tf(d, topic, turn) {
    const [s, yes, why] = topic.tf[turn % topic.tf.length];
    return { text: `True or false? ${s}`, answer: { kind: 'choice', choices: ['True', 'False'], correct: yes ? 0 : 1 }, solution: `${why} So it’s <b>${yes ? 'true' : 'false'}</b>.` };
  },
  // four of the topic's words, each to what it means
  match(d, topic, turn) {
    const start = (turn * 3) % topic.pairs.length, four = d.shuffle([0, 1, 2, 3].map((i) => topic.pairs[(start + i) % topic.pairs.length]));
    const right = d.shuffle(four.map((p) => p[1]));
    return { text: `Match each one to what it means. <span class="muted">${topic.name}.</span>`,
      answer: { kind: 'match', left: four.map((p) => p[0]), right, correct: four.map((p) => right.indexOf(p[1])) },
      tip: 'Start with the ones you’re surest of: the last one is then the one left over.',
      solution: four.map(([a, b]) => `${a} → ${b}.`).join(' ') };
  },
  // six of the topic's things, each onto its side (at least two on each)
  sort(d, topic) {
    const { title, left, right, items } = topic.sort;
    let picked;
    do picked = d.shuffle(items).slice(0, Math.min(6, items.length));
    while (picked.filter((x) => x[1] === 'l').length < 2 || picked.filter((x) => x[1] === 'r').length < 2);
    const on = (side) => listing(picked.filter((x) => x[1] === side).map((x) => x[0]));
    return { text: `${title} <span class="muted">Put each one on its side.</span>`, answer: { kind: 'sort', sides: [left, right], items: picked.map((x) => x[0]), correct: picked.map((x) => (x[1] === 'l' ? 0 : 1)) },
      tip: 'Start with the ones you’re surest of. You can tap one to take it back.',
      solution: `${left}: ${on('l')}. ${right}: ${on('r')}.` };
  },
  multi(d, topic, turn) {
    const [q, rights, wrongs, why] = topic.multi[turn % topic.multi.length];
    const all = d.shuffle([...rights, ...wrongs]);
    return { text: `${q} <span class="muted">Choose all that fit.</span>`, answer: { kind: 'multi', choices: all, correct: rights.map((r) => all.indexOf(r)).sort((a, b) => a - b) },
      tip: 'Check each one on its own: does it really fit? More than one can be right.',
      solution: `${why} So the ones to choose are ${listing(rights.map((r) => `<b>“${r}”</b>`))}.` };
  },
  // steps or things to put in order (never shown in order already)
  order(d, topic, turn) {
    const [q, items, why] = topic.order[turn % topic.order.length];
    let picked;
    do picked = d.shuffle(items); while (picked.every((x, i) => x === items[i]));
    return { text: `${q} <span class="muted">Tap them in order.</span>`, answer: { kind: 'order', items: picked, correct: items.map((x) => picked.indexOf(x)) },
      tip: 'Find the first one and the last one, then fill in the middle.',
      solution: `In order: ${items.map((x) => `<b>${x}</b>`).join(' → ')}. ${why}` };
  },
  calc(d, topic, turn) {
    return topic.calc[turn % topic.calc.length](d);
  },
};

// the bank: the topics take turns (variant 1 is the first topic's first, 2 the second topic's first…), so variant n is
// always topic (n − 1) mod the number of topics, the way the test page shares a test out among them. A topic with less
// to ask than the longest starts its list again (new numbers, choices in a new order) to keep its place in the turns
export function conceptBank(id, TOPICS) {
  const plans = TOPICS.map(plan), longest = Math.max(...plans.map((p) => p.length)), T = TOPICS.length;
  return {
    id, count: T * longest, kinds: T,
    make(n) {
      const t = (n - 1) % T, k = Math.floor((n - 1) / T), p = plans[t], [way, turn] = p[k % p.length], topic = TOPICS[t];
      return { n, topic: topic.name, way, ...ASK[way](dice(id, n), topic, turn) };
    },
  };
}
