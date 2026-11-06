// The home page as an assistant: it looks at what you've been doing in this browser (the topic you left off on, a test half
// done, what you missed on your last test, what keeps tripping you up, what's playing, where you've been, how long you've
// been at it, the time of day), says what it notices, offers what would help most right now, and answers when you tell it what
// you want. It works by the rules here, with nothing sent anywhere: it isn't a chatbot, and it says so when it's stuck.
(() => {
  const f = window.fluentio;
  if (!f) return;
  const { el, svg, link, read } = f;
  const MINUTE = 60000, DAY = 86400000;
  // every course that keeps your progress, and the folder it's in
  const BANKS = [
    ['triangles', 'math', 'Triangle Angles'], ['amc10', 'math', 'AMC 10 Practice'], ['amc12', 'math', 'AMC 12 Practice'], ['heat', 'science', 'Heat Capacity'],
    ['kinematics', 'physics', 'Kinematics'], ['motion', 'physics', 'Motion in a Straight Line'], ['vectors', 'physics', 'Vectors'], ['projectiles', 'physics', 'Projectile Motion'],
    ['vocab', 'spanish', 'Spanish Vocabulary'], ['preterite', 'spanish', 'The Preterite'], ['imperfect', 'spanish', 'The Imperfect'], ['middleages', 'history', 'The Middle Ages'], ['wars', 'history', 'The Wars of Religion'],
  ].map(([id, folder, name]) => ({ id, folder, name }));
  const WITH_CLASS_TESTS = new Set(['science', 'physics', 'history']);
  const midnight = (t) => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); };
  const agoWords = (t, now) => {
    const m = (now - t) / MINUTE;
    if (m < 5) return 'just now';
    if (m < 60) return `${Math.round(m)} minutes ago`;
    const days = Math.round((midnight(now) - midnight(t)) / DAY);
    if (days === 0) return m < 180 ? 'a little while ago' : 'earlier today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;
    return days < 14 ? 'last week' : `${Math.round(days / 7)} weeks ago`;
  };
  const plural = (n, word) => `${n.toLocaleString('en-US')} ${word}${n === 1 ? '' : 's'}`;
  const cap = (s) => s[0].toUpperCase() + s.slice(1);

  // ---------- what it can see ----------
  function see(now = Date.now()) {
    const banks = BANKS.map((b) => {
      const bests = ['best', 'best-mixed', 'best-hard'].map((k) => read(`fluentio.${b.id}.${k}`)).filter((x) => x?.when).sort((p, q) => q.when - p.when);
      return { ...b, learn: read(`fluentio.${b.id}.learn`) || {}, draft: read(`fluentio.${b.id}.exam-draft`), run: read(`fluentio.${b.id}.lastRun`), best: bests[0] || null };
    });
    const trail = read('fluentio:trail') || {}, log = Array.isArray(trail.log) ? trail.log : [];
    // how long you've been at it: back through the pages you've been on, until a gap of 20 minutes
    let began = now, at = now;
    for (const e of [...log].reverse()) { if (at - (e.e || e.t) > 20 * MINUTE) break; began = e.t; at = e.t; }
    // where most of today has gone
    const spent = {};
    for (const e of log) if (e.t >= midnight(now) && !['home', 'settings'].includes(e.s)) spent[e.s] = (spent[e.s] || 0) + (e.e || e.t) - e.t;
    const [mostly] = Object.entries(spent).sort((a, b) => b[1] - a[1]);
    // your music, as this browser last saw it
    const songs = (read('fluentio.music.library') || {}).songs, all = Array.isArray(songs) ? songs : [], saved = read('fluentio.music.player') || {}, current = all.find((x) => x && x.id === (saved.queue || [])[saved.at]) || null;
    const audio = (() => { try { return (window.top.fluentioSong || window.fluentioSong)?.audio || null; } catch { return null; } })();
    return {
      now, hour: new Date(now).getHours(), banks, last: f.last(), seen: trail.seen || {}, session: Math.round((now - began) / MINUTE), mostly: mostly && mostly[1] >= 10 * MINUTE ? mostly[0] : null,
      answered: (read('fluentio.today') || {}).day === new Date(now).toDateString(), chapters: (read('fluentio.chapters') || {}).done || {},
      music: { count: all.length, liked: all.filter((x) => x && x.liked).length, current, playing: !!current && (audio ? !audio.paused : !!saved.playing) },
    };
  }
  const place = (b, rest = '') => link(`${b.folder}/#${b.id}${rest}`);
  const topicLink = (b, topic) => place(b, `/learn/${encodeURIComponent(topic)}`);
  const PAGES = { math: 'math', science: 'science', physics: 'physics', spanish: 'Spanish', geography: 'geography', history: 'history', study: 'Modules', music: 'Music', station: 'Station' };

  // the music, when something's asked of it
  const tunes = async () => {
    const [player, lib] = await Promise.all([import(link('kit/music/player.js')), import(link('kit/music/library.js'))]);
    player.mount();
    // (a browser that hasn't seen your songs yet asks GitHub first)
    if (!lib.state.lib.songs.length && lib.state.conn) await lib.refresh().catch(() => {});
    return { player, lib, songs: lib.state.lib.songs };
  };
  const shuffleAll = async (reply) => {
    const { player, songs } = await tunes();
    if (!songs.length) return reply('You don’t have any songs here yet. They go in on Music’s page.', { options: [{ icon: 'music', title: 'Open Music', why: 'Drop your songs on the page.', href: link('music/') }] });
    player.playList(songs, Math.floor(Math.random() * songs.length), true);
    reply(`Shuffling your ${plural(songs.length, 'song')}. First up: ${player.current()?.title || 'a song'}.`);
  };

  // ---------- what would help now, most useful first ----------
  function suggestions(seen) {
    const { now, hour, banks, music } = seen, out = [], evening = hour >= 18 || hour < 5, late = hour >= 22 || hour < 5, morning = hour >= 5 && hour < 12;
    const by = (id) => banks.find((b) => b.id === id);
    for (const b of banks) {
      const d = b.draft;
      if (!d || d.final) continue;
      const count = Object.values(d.answers || {}).filter((a) => a != null && a !== '' && !(Array.isArray(a) && a.every((x) => x == null || x === ''))).length;
      if (!count && !d.done) continue;
      out.push({ icon: 'study', title: d.done ? `Finish marking Test ${d.n}` : `Finish Test ${d.n}`, why: `${b.name}. ${d.done ? 'It’s handed in, and the marking is waiting.' : `${plural(count, 'answer')} so far.`}`, href: place(b, `/exam/${d.n}`), score: 96, notice: `you have a ${b.name} test half done`, ask: 'Want to finish it?' });
    }
    if (seen.last) {
      const l = seen.last, days = (now - (l.at || 0)) / DAY, topic = l.topic || l.test || 'your topic', all = (l.total || 0) > 0 && (l.learned || 0) >= l.total;
      if (!all) out.push({ icon: 'study', title: `Pick up ${topic}`, why: `${l.test ? `${l.test}. ` : ''}${l.total ? `${l.learned || 0} of ${l.total} done. ` : ''}You were here ${agoWords(l.at || 0, now)}.`, href: l.href, score: days < 1 ? 92 : days < 3 ? 86 : days < 14 ? 62 : 40, notice: `you left off on ${topic} ${agoWords(l.at || 0, now)}`, ask: 'Want to carry on?' });
    }
    const run = banks.filter((b) => b.run?.at).sort((a, b) => b.run.at - a.run.at)[0];
    if (run && now - run.run.at < 7 * DAY) {
      const missed = (run.run.missed || []).filter((t) => !run.learn[t]?.learned);
      if (missed.length) out.push({ icon: 'spark', title: `Go over what you missed on ${run.run.name}`, why: `You got ${run.run.short}. Start with ${missed[0]}${missed.length > 1 ? `, then ${missed.length - 1} more` : ''}.`, href: topicLink(run, missed[0]), score: now - run.run.at < DAY ? 88 : 72, notice: `your last ${run.run.name} test came to ${run.run.short}`, ask: 'Want to go over what you missed?' });
    }
    let worst = null;
    for (const b of banks) for (const [topic, s] of Object.entries(b.learn)) {
      if (!s || s.learned || (s.tried || 0) < 3) continue;
      const rate = (s.right || 0) / s.tried;
      if (rate < 0.67 && (!worst || rate < worst.rate)) worst = { b, topic, s, rate };
    }
    if (worst) out.push({ icon: 'chart', title: `Work on ${worst.topic}`, why: `${worst.s.right || 0} of ${worst.s.tried} right so far in ${worst.b.name}.`, href: topicLink(worst.b, worst.topic), score: 70, notice: `${worst.topic} has been tricky`, ask: 'Want to work on it?' });
    if (seen.session >= 45) out.push({ emoji: '🌿', title: 'Take a break', why: `You’ve been at it for ${seen.session} minutes.`, run: (reply) => reply('Good idea. Stretch, get some water. Everything stays where you left it.'), score: 66, notice: `you’ve been at it for ${seen.session} minutes`, ask: 'Time for a break?' });
    if (!seen.answered) out.push({ icon: 'spark', title: 'Try today’s question', why: 'One quick question, answered right here.', run: (reply) => reply('Here’s today’s.', { tile: 'question' }), score: 58 + (morning ? 12 : 0) + (late ? 14 : 0), ask: 'Want a quick question?' });
    if (music.current && !music.playing) out.push({ icon: 'music', title: `Keep listening to ${music.current.title}`, why: `${music.current.artist || 'Unknown artist'}. It’s paused.`, run: async (reply) => { const { player } = await tunes(); if (player.audio.paused) player.toggle(); reply(`${player.current()?.title || 'Your song'} is on.`); }, score: 46 + (evening ? 22 : 0) });
    else if (music.current) out.push({ icon: 'music', title: 'Skip this song', why: `${music.current.title} is playing.`, run: async (reply) => { const { player } = await tunes(); player.next(); reply(`Next up: ${player.current()?.title || 'the next song'}.`); }, score: 20 });
    else if (music.count) out.push({ icon: 'music', title: 'Put on some music', why: `${plural(music.count, 'song')}. I’ll shuffle them.`, run: shuffleAll, score: 34 + (evening ? 20 : 0) + (seen.session >= 25 ? 10 : 0) });
    else out.push({ icon: 'music', title: 'Set up Music', why: 'Your own songs, playing on every page.', href: link('music/'), score: 6 });
    const drew = seen.seen.station;
    out.push(drew && now - drew < 7 * DAY ? { icon: 'station', title: 'Back to your board', why: `You were on it ${agoWords(drew, now)}.`, href: link('station/'), score: now - drew < DAY ? 50 : 36 } : { icon: 'station', title: 'Sketch something on your board', why: 'An idea, a flowchart, anything.', href: link('station/'), score: 16 });
    if (!Object.keys(seen.chapters).some((k) => k.startsWith('wars/'))) out.push({ emoji: '⚔️', title: 'Start The Wars of Religion', why: 'Five chapters, told as a story.', href: link('history/chapters.html#wars'), score: 30 });
    const ten = by('amc10'), twelve = by('amc12');
    if ((Object.keys(ten.learn).length || ten.best) && !Object.keys(twelve.learn).length && !twelve.best) out.push({ icon: 'study', title: 'Try AMC 12 practice', why: 'Logs, trig and complex numbers, on top of what you know from the AMC 10.', href: place(twelve), score: 42 });
    const tested = banks.filter((b) => b.best?.text && now - b.best.when > 7 * DAY).sort((a, b) => b.best.when - a.best.when)[0];
    if (tested) out.push({ icon: 'chart', title: `Beat your best on ${tested.name}`, why: `It’s ${tested.best.text}, from ${agoWords(tested.best.when, now)}.`, href: place(tested, '/test'), score: 44 });
    if (!seen.last && !banks.some((b) => Object.keys(b.learn).length)) out.push({ icon: 'study', title: `Pick a subject in ${f.settings.studyTitle}`, why: 'Math, science, physics, Spanish, history and geography.', href: link('study/'), score: 52 });
    out.sort((a, b) => b.score - a.score);
    // (what it's about to bring up goes first, so the first thing offered is the thing it asks about)
    const k = out.findIndex((x) => x.notice);
    if (k > 0) out.unshift(...out.splice(k, 1));
    return out;
  }
  // the first thing it says, from what's at the top of the list
  function opening(list, seen) {
    const noticed = list.filter((x) => x.notice), notes = noticed.slice(0, 2).map((x) => x.notice);
    if (!notes.length && seen.mostly) notes.push(`you’ve mostly been in ${PAGES[seen.mostly] || seen.mostly} today`);
    if (!notes.length && seen.music.playing) notes.push(`${seen.music.current.title} is playing`);
    const ask = (noticed[0] || list[0])?.ask || 'What do you feel like doing?';
    return notes.length ? `${cap(notes.join(', and '))}. ${ask}` : `I don’t have much to go on yet, so here’s a place to start. ${ask}`;
  }

  // ---------- when you tell it something ----------
  const COURSE_WORDS = [
    [/\bamc ?12\b/, 'amc12'], [/\bamc\b|\bamc ?10\b|\bcontest/, 'amc10'], [/\btriangle/, 'triangles'], [/\bheat\b/, 'heat'], [/\bkinematic/, 'kinematics'], [/\bmotion\b/, 'motion'], [/\bvector/, 'vectors'], [/\bprojectile/, 'projectiles'],
    [/\bvocab/, 'vocab'], [/\bpreterite/, 'preterite'], [/\bimperfect/, 'imperfect'], [/\bmiddle ages\b|\bmedieval\b|\bvikings?\b|\bcrusades?\b|\bblack death\b/, 'middleages'], [/\bwars? of religion\b|\bthirty years\b|\bdefenestration\b|\bbartholomew\b|\bwestphalia\b/, 'wars'],
  ];
  const FOLDER_WORDS = [[/\bmath(s|ematics)?\b/, 'math'], [/\bscience\b/, 'science'], [/\bphysics\b/, 'physics'], [/\bspanish\b/, 'spanish'], [/\bhistory\b/, 'history'], [/\bgeograph|\bcountries\b|\bcapitals\b|\bmaps?\b/, 'geography']];
  const courseOptions = (b) => [
    ...(b.folder === 'history' ? [{ icon: 'study', title: `Read ${b.name} as a story`, why: 'A chapter at a time, where you make the choices.', href: link(`history/chapters.html#${b.id}`) }] : []),
    { icon: 'study', title: `Learn ${b.name}`, why: 'A topic at a time, with lessons.', href: place(b, '/learn') },
    { icon: 'spark', title: `Test yourself on ${b.name}`, why: b.best?.text ? `Your best is ${b.best.text}.` : 'Mixed questions, then a score.', href: place(b, '/test') },
    ...(WITH_CLASS_TESTS.has(b.folder) ? [{ icon: 'doc', title: 'A test like the ones in class', why: 'Longer questions, marked against a mark scheme.', href: place(b, '/exam') }] : []),
  ];
  function answer(text, seen, reply, go) {
    const t = text.toLowerCase().replace(/[’']/g, '').replace(/[?!.,]+$/, '').trim(), courses = COURSE_WORDS.filter(([re]) => re.test(t)).map(([, id]) => seen.banks.find((b) => b.id === id));
    const test = /\b(test|quiz|exam)\b/.test(t), teach = /\b(learn|study|teach|explain|lesson|notes?)\b/.test(t), openIt = /^(open|go to|go|take me to|show me|show)\b/.test(t);
    if (/^(hi|hello|hey|yo|sup|good (morning|afternoon|evening))\b/.test(t)) return reply('Hi. Here’s what I’d do next.', { options: suggestions(seen).slice(0, 3) });
    if (/^(thanks|thank you|thx|ty)\b/.test(t)) return reply('Anytime.');
    // the music
    const wantsPlay = /^(play|put on|listen to)\b/.exec(t);
    if (/^(pause|stop)\b/.test(t) && /(music|song|^pause$|^stop$|it$)/.test(t)) return tunes().then(({ player }) => { if (player.audio.paused) return reply('Nothing’s playing right now.'); player.toggle(); reply('Paused.'); });
    if (/^(resume|unpause)\b/.test(t)) return tunes().then(({ player }) => { if (!player.current()) return shuffleAll(reply); if (player.audio.paused) player.toggle(); reply(`${player.current().title} is on.`); });
    if (/^(next|skip)\b/.test(t)) return tunes().then(({ player }) => { if (!player.current()) return reply('Nothing’s playing right now.'); player.next(); reply(`Next up: ${player.current()?.title || 'the next song'}.`); });
    if (wantsPlay) {
      const q = t.slice(wantsPlay[0].length).replace(/^(\s*(me|some|a|the)\b)+/, '').trim();
      if (/^(music|songs?|anything|something|whatever)?$/.test(q)) return shuffleAll(reply);
      return tunes().then(({ player, songs }) => {
        const liked = songs.filter((x) => x.liked);
        if (/^(my )?(liked|favou?rites?)( songs)?$/.test(q) && liked.length) { player.playList(liked, 0); return reply(`Playing your ${plural(liked.length, 'liked song')}.`); }
        const match = songs.filter((x) => `${x.title} ${x.artist}`.toLowerCase().replace(/[’']/g, '').includes(q));
        if (!match.length) return reply(`I can’t find “${q}” in your songs.`, { options: songs.length ? [{ icon: 'music', title: 'Shuffle everything instead', why: plural(songs.length, 'song'), run: shuffleAll }] : [] });
        player.playList(match, 0);
        reply(`Playing ${player.current()?.title}${match.length > 1 ? `, and ${plural(match.length - 1, 'more')} that match` : ''}.`);
      });
    }
    if (/\bmusic\b|\bsongs?\b/.test(t)) return openIt ? go('Opening Music.', link('music/')) : reply('Here’s your music.', { tile: 'music' });
    // what's on, what to do, and how it's going
    if (/\btoday\b|\btomorrow\b|\bdate\b|\bday off\b|\bdays off\b|\bholiday|\bcalendar\b|\bschool\b/.test(t) && !test && !/\b(should|can|could) i\b/.test(t)) return reply('Here’s today, and what’s coming up.', { tile: 'today' });
    if (/\bwhat (should|can|could) i\b|\bwhat (to do|now|next)\b|\bwhats next\b|^what do i do\b|\banything to do\b|\bsuggest|\bhelp\b|\bbored\b|\bidk\b|\bdunno\b|\bnot sure\b/.test(t)) return reply('Here’s what I’d do, in order.', { options: suggestions(seen).slice(0, 4) });
    if (/\bhow am i\b|\bprogress\b|\bstats?\b|\bstreak\b|\bscores?\b|\bdoing\b/.test(t)) return reply(progressWords(seen), { tile: 'progress' });
    if (/\bbreak\b|\btired\b|\bsleep\b|\bbed\b/.test(t)) return reply(seen.hour >= 22 || seen.hour < 5 ? 'Go to bed. It’ll all be here tomorrow.' : 'Go for it. Everything stays where you left it.');
    // somewhere to go
    if (/\b(draw|sketch|board|flowchart|diagram|station|whiteboard)\b/.test(t)) return go('Opening your board.', link('station/'));
    if (/\b(settings?|theme|font|colou?rs?)\b/.test(t)) return go('Opening Settings.', link('settings/'));
    // a course: straight there, when you've said what for
    if (courses.length) {
      const b = courses[0];
      if (test) return go(`Starting a ${b.name} test.`, place(b, '/test'));
      if (teach) return go(`Opening ${b.name}.`, place(b, '/learn'));
      if (openIt) return go(`Opening ${b.name}.`, place(b));
      return reply(`What do you want to do with ${b.name}?`, { options: courseOptions(b) });
    }
    // anything to test you on, with no subject named: what you're shakiest on, or today's question
    if (/\b(quiz|test)( me)?\b|\bquestion\b|\bpractice\b|\bpractise\b/.test(t) && !FOLDER_WORDS.some(([re]) => re.test(t))) {
      const shaky = suggestions(seen).find((x) => /^(Work on|Go over)/.test(x.title));
      return reply(seen.answered ? 'You’ve done today’s question. Here’s where practice would do the most.' : 'Here’s today’s question.', seen.answered ? { options: [shaky, { icon: 'study', title: `Choose in ${f.settings.studyTitle}`, why: 'Every subject and test.', href: link('study/') }].filter(Boolean) } : { tile: 'question' });
    }
    for (const [re, folder] of FOLDER_WORDS) {
      if (!re.test(t)) continue;
      const here = seen.banks.filter((b) => b.folder === folder), title = f.settings.study.find((x) => String(x.link || '').replace(/^\.?\//, '').split('/')[0] === folder)?.title || cap(folder);
      if (!here.length || openIt) return go(`Opening ${title}.`, link(`${folder}/`));
      if (here.length === 1) return reply(`What do you want to do with ${here[0].name}?`, { options: courseOptions(here[0]) });
      return reply(`Which part of ${title}?`, { options: here.map((b) => ({ icon: 'study', title: b.name, why: Object.keys(b.learn).length ? `${plural(Object.values(b.learn).filter((x) => x?.learned).length, 'topic')} learned.` : 'Not started yet.', href: place(b) })) });
    }
    if (/\b(modules?|subjects?|courses?)\b/.test(t)) return go(`Opening ${f.settings.studyTitle}.`, link('study/'));
    // a topic you've worked on
    if (t.length > 3) for (const b of seen.banks) for (const topic of Object.keys(b.learn)) if (topic.toLowerCase().includes(t)) return reply(`${topic} is in ${b.name}.`, { options: [{ icon: 'study', title: `Work on ${topic}`, why: b.learn[topic].learned ? 'You’ve learned this one. It’s still there to practice.' : `${b.learn[topic].right || 0} of ${b.learn[topic].tried || 0} right so far.`, href: topicLink(b, topic) }] });
    // anything on the site
    const found = f.findIn ? f.findIn(t.replace(/^(open|go to|go|take me to|show me|show|find)\s+/, ''), 4) : [];
    if (found.length) return reply('Is it one of these?', { options: found.map((e) => ({ icon: e.icon, emoji: e.emoji, title: e.title, why: e.kind || '', href: e.href })) });
    reply('I can’t help with that one. I go by what’s on this site. I can quiz you, start a test, play a song, open your board, or tell you how it’s going.');
  }
  function progressWords(seen) {
    const learned = seen.banks.reduce((n, b) => n + Object.values(b.learn).filter((x) => x?.learned).length, 0), visits = read('fluentio.visits') || {};
    const best = seen.banks.filter((b) => b.best?.when).sort((a, b) => b.best.when - a.best.when)[0];
    const bits = [learned ? `${plural(learned, 'topic')} learned` : 'no topics learned yet', visits.streak > 1 ? `${visits.streak} days in a row` : ''].filter(Boolean);
    return `${cap(bits.join(', and '))}.${best ? ` Your latest best is ${best.best.text} on ${best.name}.` : ''}`;
  }

  // ---------- on the page ----------
  const SHOW = 3;
  function draw(box, { tiles, welcomed }) {
    const seen = see(), moving = f.moving();
    let list = suggestions(seen), from = 0, showing = [], you = '';
    const hello = el('p', { className: 'aide-hello', hidden: true }), line = el('h1', { className: 'aide-line' }), say = opening(list, seen);
    line.setAttribute('aria-label', say);
    say.split(' ').forEach((word, n, all) => { const w = el('span', { className: 'w', 'aria-hidden': 'true' }, word); w.style.setProperty('--n', n); line.append(w, n < all.length - 1 ? ' ' : ''); });
    const options = el('div', { className: 'aide-options aide-first' }), other = el('button', { type: 'button', className: 'aide-other', hidden: list.length <= SHOW, onclick: () => { from = (from + SHOW) % list.length; options.classList.remove('aide-first'); paint(); } }, 'Something else');
    const thread = el('div', { className: 'aide-thread' });
    const row = (opt, i) => {
      const inner = [el('span', { className: 'aide-ic', 'aria-hidden': 'true' }, opt.emoji || svg(opt.icon || 'arrow')), el('span', { className: 'aide-text' }, el('b', {}, opt.title), opt.why ? el('small', {}, opt.why) : null), i != null ? el('kbd', { className: 'aide-key' }, String(i + 1)) : svg('arrow')];
      return opt.href ? el('a', { className: 'aide-option', href: opt.href }, inner) : el('button', { type: 'button', className: 'aide-option', onclick: () => opt.run(reply) }, inner);
    };
    const pick = () => Array.from({ length: Math.min(SHOW, list.length) }, (_, i) => list[(from + i) % list.length]);
    const words = (few) => few.map((x) => `${x.title} ${x.why}`).join();
    function paint(animate = true) {
      showing = pick();
      if (animate) { options.classList.remove('stagger'); void options.offsetWidth; options.classList.add('stagger'); }
      options.replaceChildren(...showing.map((x, i) => row(x, i)));
    }
    function reply(text, { options: opts, tile } = {}) {
      const turn = el('div', { className: 'aide-turn' }, you ? el('p', { className: 'aide-you' }, you) : null, el('p', { className: 'aide-say' }, text),
        opts?.length ? el('div', { className: 'aide-options' }, opts.map((o) => row(o))) : null, tile && tiles[tile] ? tiles[tile]() : null);
      you = '';
      thread.prepend(turn);
      while (thread.children.length > 3) thread.lastChild.remove();
      requestAnimationFrame(() => turn.scrollIntoView({ block: 'nearest', behavior: moving ? 'smooth' : 'auto' }));
    }
    const go = (text, href) => { reply(text); setTimeout(() => { location.href = href; }, moving ? 320 : 0); };
    const tell = (text) => { you = text; Promise.resolve().then(() => answer(text, see(), reply, go)).catch(() => reply('That didn’t work. Try again in a moment.')); };
    const input = el('input', { type: 'text', className: 'aide-input', placeholder: 'Tell me what you want to do…', autocomplete: 'off', spellcheck: false, 'aria-label': 'Tell the assistant what you want to do' });
    const form = el('form', { className: 'aide-ask', onsubmit: (e) => { e.preventDefault(); const text = input.value.trim(); if (text) { input.value = ''; tell(text); } } }, input, el('button', { type: 'submit', className: 'aide-send', title: 'Send', 'aria-label': 'Send' }, svg('arrow')));
    const chips = el('div', { className: 'aide-chips' }, ['What should I do?', 'Quiz me', 'How am I doing?', 'What’s today?', 'Play something'].map((text) => el('button', { type: 'button', className: 'chip', onclick: () => tell(text) }, text)));
    box.replaceChildren(el('div', { className: 'aide-orb', 'aria-hidden': 'true' }), hello, line, options, other, form, chips, thread);
    paint();
    // the greeting, for the time of day or a holiday, and a day off coming up
    if (f.settings.greeting) welcomed?.then(({ welcome, upcoming }) => {
      const w = welcome({ now: new Date(seen.now), visits: read('fluentio.visits') || { count: 1, streak: 1, away: null }, last: seen.last, learned: 0, best: null, name: f.settings.name, music: null });
      const off = f.settings.showDaysOff ? upcoming(new Date(seen.now), 3, f.settings.daysOff).find((h) => h.off && h.days <= 1) : null;
      hello.textContent = `${w.hello}${off ? ` ${off.emoji} ${off.days === 0 ? 'You’re off today' : 'You’re off tomorrow'} for ${off.name}.` : ''}`;
      hello.hidden = false;
    }).catch(() => {});
    // what's playing changes what it offers, and so do songs another device added
    let soon = 0;
    const refresh = () => { clearTimeout(soon); soon = setTimeout(() => { list = suggestions(see()); if (from >= list.length) from = 0; other.hidden = list.length <= SHOW; if (words(pick()) !== words(showing)) paint(false); }, 200); };
    Promise.all([import(link('kit/music/player.js')), import(link('kit/music/library.js'))]).then(([player, lib]) => {
      for (const w of ['song', 'state']) player.events.addEventListener(w, refresh);
      lib.events.addEventListener('library', refresh);
      lib.refresh();
    }).catch(() => {});
    // 1, 2 and 3 take what's offered, unless you're typing
    addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.isComposing) return;
      const typing = e.target.closest?.('input, textarea, select, [contenteditable]');
      if (typing && (typing !== input || input.value)) return;
      const k = +e.key;
      if (k >= 1 && k <= showing.length) { e.preventDefault(); options.children[k - 1].click(); }
    });
    if (matchMedia('(pointer: fine)').matches) {
      if (window.frameElement) addEventListener('fluence:shown', () => input.focus({ preventScroll: true }), { once: true });
      else input.focus({ preventScroll: true });
    }
  }
  f.assistant = { draw, see, suggestions, opening };
})();
