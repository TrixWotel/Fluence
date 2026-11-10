// The home page as an assistant: it looks at what you've been doing in this browser (the topic you left off on, a test half
// done, what you missed on your last test, what keeps tripping you up, what's playing, your notes and journal, where you've
// been, how long you've been at it, the time of day), says what it notices, and offers what would help most right now. It
// works by the rules here, with nothing sent anywhere: it isn't a chatbot. It takes the room the tile layouts do: the
// site's name at the top with what it says under it (the welcome's line, and a link to what it'd do first), then one
// to three cards it picks from what counts right now (your plan, your studying, your music, your notes, today's
// question, your progress, what's new): one spread wide when it's the only one, two made one, or what it offers at the
// side when the cards don't have it.
(() => {
  const f = window.fluentio;
  if (!f) return;
  const { el, svg, link, read } = f;
  const MINUTE = 60000, DAY = 86400000;
  // every course that keeps your progress, and the folder it's in
  const BANKS = [
    ['triangles', 'math', 'Triangle Angles'], ['amc10', 'math', 'AMC 10 Practice'], ['amc12', 'math', 'AMC 12 Practice'], ['heat', 'science', 'Heat Capacity'],
    ['kinematics', 'physics', 'Kinematics'], ['motion', 'physics', 'Motion in a Straight Line'], ['vectors', 'physics', 'Vectors'], ['projectiles', 'physics', 'Projectile Motion'],
    ['vocab', 'spanish', 'Spanish Vocabulary'], ['preterite', 'spanish', 'The Preterite'], ['imperfect', 'spanish', 'The Imperfect'], ['middleages', 'history', 'The Middle Ages'], ['wars', 'history', 'The Wars of Religion'], ['essays', 'english', 'Essay Writing'],
  ].map(([id, folder, name]) => ({ id, folder, name }));
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
  // your notes in Station (not the journal's days), newest first, and how much today's entry has
  const wordsIn = (s) => (String(s || '').trim().match(/\S+/g) || []).length;
  const noteHref = (path) => link(`station/#${path.replace(/\.md$/i, '').split('/').map(encodeURIComponent).join('/')}`);
  function notesOf(now) {
    const v = read('fluentio.station'), all = Array.isArray(v?.notes) ? v.notes.filter((n) => n && typeof n.path === 'string' && /\.md$/i.test(n.path)) : [];
    const d = new Date(now), day = `journal/${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}.md`;
    const recent = all.filter((n) => !/^journal\//.test(n.path) && String(n.text || '').trim()).sort((a, b) => (+b.edited || 0) - (+a.edited || 0)).slice(0, 4)
      .map((n) => ({ path: n.path, name: n.path.split('/').pop().replace(/\.md$/i, ''), edited: +n.edited || 0, words: wordsIn(n.text) }));
    return { count: all.length, recent, today: wordsIn(all.find((n) => n.path === day)?.text) };
  }
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
      // (today's journal entry is a note in Station's journal folder)
      wrote: (() => { const d = new Date(now), k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; return (read('fluentio.station')?.notes || []).some((n) => n?.path === `journal/${k}.md` && String(n.text || '').trim()) || !!String((read('fluentio.journal') || {})[k]?.text || '').trim(); })(),
      answered: (read('fluentio.today') || {}).day === new Date(now).toDateString(), chapters: (read('fluentio.chapters') || {}).done || {}, essays: Object.values(read('fluentio.essays.list') || {}),
      music: { count: all.length, liked: all.filter((x) => x && x.liked).length, current, playing: !!current && (audio ? !audio.paused : !!saved.playing) },
      notes: notesOf(now),
      plan: planNow(now),
    };
  }

  // ---------- your plan ----------
  // (kit/plan.js reads it from Schedule's pages, and kit/plan-day.js says it and draws today the way Schedule does;
  // Settings → Home can leave it off Home). What the plan says is the first thing Home says when there is one
  const P = () => window.fluentioPlan, D = () => window.fluentioPlanDay;
  const planNow = (now = Date.now()) => D()?.now(now, { home: true }) || null;
  const short = (it) => D().short(it);
  const planWords = (pl) => D().words(pl);
  const hrefOf = (it) => D().hrefOf(it);
  // what the plan offers: what's on now (where it's done) and what's next (each crosses itself off once its time is over)
  function planOptions(pl) {
    const p = P(), st = pl.st, out = [];
    if (st.now?.check && st.now.place) out.push({ icon: 'clock', title: `Start ${short(st.now)}`, why: st.now.how?.text || `Until ${p.clock(st.now.end)}.`, href: hrefOf(st.now), away: !!st.now.place.away, score: 99, plan: true });
    const nextUp = st.next && st.next.check && st.next.place && !st.now?.check;
    if (nextUp) out.push({ icon: 'clock', title: `${short(st.next)} at ${p.clock(st.next.at)}`, why: st.next.how?.text || `${st.next.min} min.`, href: hrefOf(st.next), away: !!st.next.place.away, score: 82, plan: true });
    return out;
  }
  const place = (b, rest = '') => (b.id === 'essays' ? link('english/') : link(`${b.folder}/#${b.id}${rest}`));
  const topicLink = (b, topic) => (b.id === 'essays' ? link(`english/learn.html#${encodeURIComponent(topic)}`) : place(b, `/learn/${encodeURIComponent(topic)}`));
  const PAGES = { math: 'math', science: 'science', physics: 'physics', spanish: 'Spanish', geography: 'geography', history: 'history', english: 'English', journal: 'your journal', study: 'Modules', music: 'Music', station: 'Station', board: 'your board', schedule: 'your schedule' };

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
    const { now, hour, banks, music } = seen, out = seen.plan ? planOptions(seen.plan) : [], evening = hour >= 18 || hour < 5, late = hour >= 22 || hour < 5, morning = hour >= 5 && hour < 12;
    const by = (id) => banks.find((b) => b.id === id);
    for (const b of banks) {
      const d = b.draft;
      if (!d || d.final) continue;
      const count = Object.values(d.answers || {}).filter((a) => a != null && a !== '' && !(Array.isArray(a) && a.every((x) => x == null || x === ''))).length;
      if (!count && !d.done) continue;
      out.push({ icon: 'study', title: d.done ? `Finish marking Test ${d.n}` : `Finish Test ${d.n}`, why: `${b.name}. ${d.done ? 'It’s handed in, and the marking is waiting.' : `${plural(count, 'answer')} so far.`}`, href: place(b, `/exam/${d.n}`), score: 96, notice: `you have a ${b.name} test half done`, ask: 'Want to finish it?' });
    }
    // an essay you've started and haven't marked yet
    const essay = seen.essays.filter((e) => Object.keys(e.marks || {}).length < 6 && (e.text || '').trim().split(/\s+/).length >= 10).sort((a, b) => b.edited - a.edited)[0];
    if (essay) out.push({ emoji: '✍️', title: 'Finish your essay', why: `${essay.title || 'Your own question'}. ${plural(essay.text.trim().split(/\s+/).length, 'word')} so far, from ${agoWords(essay.edited, now)}.`, href: link(`english/write.html#e/${essay.id}`), score: now - essay.edited < 3 * DAY ? 90 : 60, notice: 'you have an essay half written', ask: 'Want to finish it?' });
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
    const note = seen.notes.recent[0];
    if (note && now - note.edited < 3 * DAY) out.push({ icon: 'note', title: `Back to ${note.name}`, why: `In Station. ${plural(note.words, 'word')}, from ${agoWords(note.edited, now)}.`, href: noteHref(note.path), score: now - note.edited < DAY ? 48 : 38, notice: now - note.edited < DAY ? `you were writing “${note.name}” ${agoWords(note.edited, now)}` : null, ask: 'Want to go back to it?' });
    if (!seen.wrote) out.push({ emoji: '📓', title: 'Write in your journal', why: evening ? 'A few lines about today, before it’s over.' : 'A few lines about today.', href: link('station/#today'), score: 22 + (evening ? 28 : 0) + (late ? 6 : 0) });
    const drew = seen.seen.board;
    out.push(drew && now - drew < 7 * DAY ? { icon: 'station', title: 'Back to your board', why: `You were on it ${agoWords(drew, now)}.`, href: link('board/'), score: now - drew < DAY ? 50 : 36 } : { icon: 'station', title: 'Sketch something on your board', why: 'An idea, a flowchart, anything.', href: link('board/'), score: 16 });
    if (!Object.keys(seen.chapters).some((k) => k.startsWith('wars/'))) out.push({ emoji: '⚔️', title: 'Start The Wars of Religion', why: 'Five chapters, told as a story.', href: link('history/chapters.html#wars'), score: 30 });
    const writing = by('essays');
    if (!Object.keys(writing.learn).length && !seen.essays.length) out.push({ emoji: '✍️', title: 'Try essay writing', why: 'How essays work, a step at a time, then write your own.', href: link('english/'), score: 31 });
    else if (!essay && !seen.essays.some((e) => now - e.edited < 14 * DAY)) out.push({ emoji: '✍️', title: 'Write an essay', why: 'Plan it, write it and check it, or bring your own question from class.', href: link('english/write.html'), score: 39 });
    const ten = by('amc10'), twelve = by('amc12');
    if ((Object.keys(ten.learn).length || ten.best) && !Object.keys(twelve.learn).length && !twelve.best) out.push({ icon: 'study', title: 'Try AMC 12 practice', why: 'Logs, trig and complex numbers, on top of what you know from the AMC 10.', href: place(twelve), score: 42 });
    const tested = banks.filter((b) => b.best?.text && now - b.best.when > 7 * DAY).sort((a, b) => b.best.when - a.best.when)[0];
    if (tested) out.push({ icon: 'chart', title: `Beat your best on ${tested.name}`, why: `It’s ${tested.best.text}, from ${agoWords(tested.best.when, now)}.`, href: place(tested, '/test'), score: 44 });
    if (!seen.last && !banks.some((b) => Object.keys(b.learn).length)) out.push({ icon: 'study', title: `Pick a subject in ${f.settings.studyTitle}`, why: 'Math, science, physics, Spanish, history, English and geography.', href: link('study/'), score: 52 });
    out.sort((a, b) => b.score - a.score);
    // (what it's about to bring up goes first, so the first thing offered is the thing it asks about: the plan's, when
    // the plan is what it talks about)
    const k = seen.plan && planWords(seen.plan) ? -1 : out.findIndex((x) => x.notice);
    if (k > 0) out.unshift(...out.splice(k, 1));
    return out;
  }
  // the first thing it says: what the plan says, or what it notices from what's at the top of the list
  function opening(list, seen) {
    const words = seen.plan && planWords(seen.plan);
    if (words) return words.ask ? `${words.say} ${words.ask}` : words.say;
    const noticed = list.filter((x) => x.notice), notes = noticed.slice(0, 2).map((x) => x.notice);
    if (!notes.length && seen.mostly) notes.push(`you’ve mostly been in ${PAGES[seen.mostly] || seen.mostly} today`);
    if (!notes.length && seen.music.playing) notes.push(`${seen.music.current.title} is playing`);
    const ask = (noticed[0] || list[0])?.ask || 'What do you feel like doing?';
    return notes.length ? `${cap(notes.join(', and '))}. ${ask}` : `I don’t have much to go on yet, so here’s a place to start. ${ask}`;
  }

  // ---------- its cards: Today, your studying and your notes (Music, Progress, the question of the day, what's new since
  // you were here and the date are Home's own tiles, index.html) ----------
  const card = (cls, color, ...kids) => { const t = el('article', { className: `card tile ${cls}`.trim() }, ...kids); t.style.setProperty('--c', color); return t; };
  const cardHead = (icon, title, href, sub) => el(href ? 'a' : 'div', { className: 'tile-head', href }, el('span', { className: 'tile-ic' }, svg(icon)), el('span', {}, title), sub ? el('small', { className: 'tile-sub' }, sub) : null, href ? el('span', { className: 'tile-go' }, svg('arrow')) : null);
  const line2 = (href, label, side) => el('a', { className: 'aide-row', href }, el('span', {}, label), side ? el('small', {}, side) : null);
  // Today: your plan, each thing crossed off once its time is over (kit/plan-day.js), with a way on to Schedule
  // (wide: the day beside lights out, what's due and the switches)
  function planCard(pl, wide = false) {
    const [, list, ...rest] = D().panel(pl, { home: true }), more = rest.filter(Boolean);
    const body = wide ? el('div', { className: 'plan-day bare two', 'aria-label': 'Today’s plan' }, list, more.length ? el('div', { className: 'pd-aside' }, ...more) : null) : el('div', { className: 'plan-day bare', 'aria-label': 'Today’s plan' }, list, ...more);
    return card(`aide-plan${wide ? ' span2' : ''}`, 'var(--accent-2)', cardHead('calendar', 'Today', link('schedule/#today'), pl.st.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })), body);
  }
  // Studying: what's most worth it now, from your progress: a test half done, where you left off and how far along it is,
  // what's been tricky, your latest best
  // (wide: your progress beside it, the topics learned, days in a row, best scores and each subject: Progress's tile)
  function studyCard(seen, { wide = false, tiles = {} } = {}) {
    const { banks } = seen, l = seen.last, body = [], rows = [];
    const learned = banks.reduce((n, b) => n + Object.values(b.learn).filter((x) => x?.learned).length, 0);
    for (const b of banks) {
      const d = b.draft;
      if (rows.length || !d || d.final || !(d.done || Object.values(d.answers || {}).some((a) => a != null && a !== ''))) continue;
      rows.push(line2(place(b, `/exam/${d.n}`), `${d.done ? 'Finish marking' : 'Finish'} Test ${d.n}`, b.name));
    }
    if (l) {
      const done = Math.max(0, l.learned || 0), of = Math.max(1, l.total || 1);
      body.push(el('a', { className: 'aide-continue', href: l.href }, el('small', {}, 'Continue'), el('b', {}, l.topic || l.test || 'Learning')),
        el('div', { className: 'meter', role: 'img', 'aria-label': `${done} of ${of} topics learned` }, el('div', { style: `width:${Math.round((100 * done) / of)}%` })),
        el('p', { className: 'muted small' }, `${l.test ? `${l.test} · ` : ''}${done} of ${plural(of, 'topic')} learned`));
    }
    let worst = null;
    for (const b of banks) for (const [topic, st] of Object.entries(b.learn)) {
      if (!st || st.learned || (st.tried || 0) < 3) continue;
      const rate = (st.right || 0) / st.tried;
      if (rate < 0.67 && (!worst || rate < worst.rate)) worst = { b, topic, st, rate };
    }
    if (worst) rows.push(line2(topicLink(worst.b, worst.topic), `Tricky: ${worst.topic}`, `${worst.st.right || 0} of ${worst.st.tried} right`));
    const best = banks.filter((b) => b.best?.when && b.best.text).sort((a, b) => b.best.when - a.best.when)[0];
    if (best && rows.length < 2) rows.push(line2(place(best, '/test'), `Best in ${best.name}`, best.best.text));
    if (!l && !rows.length) body.push(el('p', { className: 'muted' }, 'Nothing started yet: math, science, physics, Spanish, history, English and geography.'), el('div', { className: 'row' }, el('a', { className: 'btn', href: link('study/') }, svg('study'), 'Pick a subject')));
    const head = cardHead('study', f.settings.studyTitle, link('study/'), learned ? `${plural(learned, 'topic')} learned` : ''), main = [...body, rows.length ? el('div', { className: 'aide-rows' }, rows.slice(0, 2)) : null];
    const beside = wide && tiles.progress ? [...tiles.progress().children].slice(1) : [];
    if (!beside.length) return card('aide-study', 'var(--accent)', head, ...main);
    return card('aide-study span2', 'var(--accent)', head, el('div', { className: 'aide-two' }, el('div', { className: 'aide-col' }, ...main), el('div', { className: 'aide-col' }, ...beside)));
  }
  // Notes: today's journal entry, the notes you wrote in last, and your board
  function notesCard(seen) {
    const n = seen.notes, rows = [line2(link('station/#today'), n.today ? 'Today’s entry' : 'Write today’s entry', n.today ? plural(n.today, 'word') : 'A few lines')];
    for (const x of n.recent.slice(0, 2)) rows.push(line2(noteHref(x.path), x.name, agoWords(x.edited, seen.now)));
    if (seen.seen.board) rows.push(line2(link('board/'), 'Your board', agoWords(seen.seen.board, seen.now)));
    return card('aide-notes', 'var(--accent-2)', cardHead('note', 'Notes', link('station/'), n.count ? plural(n.count, 'note') : ''), el('div', { className: 'aide-rows' }, rows.slice(0, 4)));
  }

  // ---------- smaller cards, for the room under a shorter one ----------
  // Music, small: what's on, with play and next, and what comes after it (Home's Music tile is the big one)
  function musicMini(changed) {
    const box = card('aide-music', 'var(--accent)', cardHead('music', f.settings.musicTitle, link('music/')), el('p', { className: 'muted small' }, 'Loading your music…'));
    Promise.all([import(link('kit/music/player.js')), import(link('kit/music/library.js'))]).then(([player, lib]) => {
      player.mount();
      const fill = () => {
        const cur = player.current(), all = lib.state.lib.songs, paused = player.audio.paused, head = cardHead('music', f.settings.musicTitle, link('music/'), all.length ? lib.plural(all.length, 'song') : '');
        if (!all.length) box.replaceChildren(head, el('p', { className: 'muted small' }, 'Your own songs, playing on every page.'));
        else if (cur) {
          const next = player.upNext()[0];
          box.replaceChildren(head, el('div', { className: 'aide-song' }, lib.art(cur, { size: 44 }), el('span', { className: 't' }, el('b', {}, cur.title), el('small', {}, cur.artist || '')),
            el('button', { type: 'button', className: 'aide-play', 'aria-label': paused ? 'Play' : 'Pause', title: paused ? 'Play' : 'Pause', onclick: () => player.toggle() }, lib.svg(paused ? 'play' : 'pause', true)),
            el('button', { type: 'button', className: 'aide-skip', 'aria-label': 'Next', title: 'Next', onclick: () => player.next() }, lib.svg('next', true))),
          next ? el('p', { className: 'muted small aide-next' }, `Up next: ${next.title}${next.artist ? ` · ${next.artist}` : ''}`) : null);
        } else {
          const newest = [...all].sort((a, b) => (b.added || 0) - (a.added || 0));
          box.replaceChildren(head, el('div', { className: 'row' }, el('button', { type: 'button', className: 'btn', onclick: () => player.playList(newest, Math.floor(Math.random() * newest.length), true) }, lib.svg('shuffle'), 'Shuffle')));
        }
        changed?.();
      };
      fill();
      for (const w of ['song', 'state', 'queue']) player.events.addEventListener(w, fill);
      lib.events.addEventListener('library', fill);
    }).catch(() => {});
    return box;
  }
  // Your progress, small: the three numbers
  function progressMini(seen) {
    const learned = seen.banks.reduce((n, b) => n + Object.values(b.learn).filter((x) => x?.learned).length, 0), bests = seen.banks.filter((b) => b.best).length, streak = (read('fluentio.visits') || {}).streak || 1;
    const stat = (n, one, many) => el('div', { className: 'stat' }, el('b', {}, n.toLocaleString('en-US')), el('span', {}, n === 1 ? one : many));
    return card('aide-progress', 'var(--good)', cardHead('chart', 'Your progress', link('study/')), el('div', { className: 'stats' }, stat(learned, 'topic learned', 'topics learned'), stat(streak, 'day in a row', 'days in a row'), stat(bests, 'best score', 'best scores')));
  }

  // ---------- how many cards, which, and how ----------
  // one to three, from how much counts right now: what counts most, and whatever else comes close to it (within 22 of
  // 100, and 52 at least). At night your plan counts most and studying less; a song that's on counts in the evening;
  // a test half done, where you left off and what's tricky count by how recent. Your studying and your progress,
  // both counting, are one card; what's new since your last visit (when a lot is) has where you left off in it. A card
  // on its own spreads wide where it can (Today beside what's due, studying beside progress, the song with what's
  // next). What it offers goes at the side with a single card, when that card doesn't have most of it (not at night)
  const KINDS = [[/^(Finish|Pick up|Go over|Work on|Beat your best|Try AMC|Pick a subject|Start The Wars|Try essay|Write an essay)\b/, 'study'], [/^(Keep listening|Skip this song|Put on some music|Set up Music)\b/, 'music'], [/^(Write in your journal|Back to )/, 'notes'], [/^Try today’s question/, 'question']];
  const kindOf = (x) => (x.plan ? 'plan' : KINDS.find(([re]) => re.test(x.title))?.[1] || '');
  const WIDE = new Set(['plan', 'study', 'music', 'since']);
  function compose(seen, { news = [], cols = 3, offered = [] } = {}) {
    const late = seen.hour >= 22 || seen.hour < 5, evening = seen.hour >= 18 || seen.hour < 5, morning = seen.hour >= 5 && seen.hour < 12;
    const lastDays = seen.last ? (seen.now - (seen.last.at || 0)) / DAY : Infinity, st = seen.plan?.st;
    const draft = seen.banks.some((b) => b.draft && !b.draft.final && (b.draft.done || Object.values(b.draft.answers || {}).some((a) => a != null && a !== '')));
    const tricky = seen.banks.some((b) => Object.values(b.learn).some((x) => x && !x.learned && (x.tried || 0) >= 3 && (x.right || 0) / x.tried < 0.67));
    const learned = seen.banks.reduce((n, b) => n + Object.values(b.learn).filter((x) => x?.learned).length, 0), bests = seen.banks.filter((b) => b.best).length;
    const recent = seen.notes.recent[0], soon = st?.next && st.next.at - st.m <= 60, recentBest = seen.banks.some((b) => b.best?.when && seen.now - b.best.when < 2 * DAY);
    const streak = Math.min((read('fluentio.visits') || {}).streak || 0, 10);
    const score = {
      plan: !st ? 0 : st.late || st.night ? 98 : st.now ? 90 : soon ? 80 : 58,
      study: (draft ? 92 : lastDays < 1 ? 84 : lastDays < 3 ? 74 : tricky ? 66 : learned || bests ? 50 : 30) - (late ? 24 : 0),
      music: seen.music.playing ? 82 + (evening ? 6 : 0) : seen.music.current ? 50 + (evening ? 8 : 0) : seen.music.count ? 30 : 4,
      notes: recent && seen.now - recent.edited < DAY ? 62 : evening && !seen.wrote ? 58 : seen.notes.count ? 26 : 10,
      question: seen.answered || late ? 3 : 46 + (morning ? 16 : 0),
      progress: recentBest ? 68 + streak : learned || bests ? 36 + streak : 3,
      since: news.length >= 3 ? 88 : 0,
    };
    const ranked = Object.keys(score).filter((k) => score[k] > 0).sort((a, b) => score[b] - score[a]);
    let keep = ranked.filter((k) => score[k] >= Math.max(52, score[ranked[0]] - 22)).slice(0, 3);
    if (!keep.length) keep = ranked.slice(0, 1);
    if (keep.includes('since')) keep = keep.filter((k) => k !== 'study');
    const merged = keep.includes('study') && keep.includes('progress');
    if (merged) keep = keep.filter((k) => k !== 'progress');
    let cards = keep.map((key) => ({ key, wide: key === 'since' || (key === 'study' && merged) }));
    if (cols < 3) cards = cards.slice(0, 2).map((c) => ({ ...c, wide: false }));
    else if (cards.length === 1 && WIDE.has(cards[0].key)) cards[0].wide = true;
    let used = cards.reduce((n, c) => n + (c.wide ? 2 : 1), 0);
    while (cols > 1 && used > cols && cards.length > 1) { const c = cards.pop(); used -= c.wide ? 2 : 1; }
    const have = new Set(cards.map((c) => c.key).concat(cards.some((c) => c.key === 'since') ? ['study'] : []));
    // (not at night: then it's the plan, and bed)
    const side = cards.length === 1 && used < cols && !late && offered.filter((x) => !have.has(kindOf(x))).length >= 2;
    // (and for the room under a shorter card, what's left, most first: what it'd do, then the rest by how much they count)
    const out = new Set([...cards.map((c) => c.key), ...(have.has('study') ? ['study'] : []), ...(merged ? ['progress'] : []), 'plan', 'since']);
    const rest = [...(side ? [] : ['options']), ...ranked.filter((k) => !out.has(k)), ...(st ? [] : ['today'])];
    return { cards, side, cols: used + (side ? 1 : 0), score, rest };
  }

  // ---------- on the page ----------
  const SHOW = 3;
  function draw(box, { tiles = {}, welcomed, news = [], hero = {} } = {}) {
    let seen = see();
    let list = suggestions(seen), from = 0, showing = [], said = '', note = null;
    // what it says: under the site's name, as the welcome's line, with a link to what it'd do first (unless what it
    // offers is at the side), or what something it offers did
    const line = hero.line || el('p'), hello = hero.hello || el('p');
    const go = (x) => (x.href ? el('a', { href: x.href, target: x.away ? '_blank' : null, rel: x.away ? 'noopener' : null }, `${x.title} →`) : el('button', { type: 'button', className: 'welcome-go', onclick: () => x.run(reply) }, `${x.title} →`));
    const setLine = () => {
      // (when the plan's what it talks about, only something on the plan; at night, nothing)
      const st = seen.plan?.st, fromPlan = !!(seen.plan && planWords(seen.plan)), first = !note && !shown.side && !(st && (st.night || st.late)) && (!fromPlan || list[0]?.plan) ? list[0] : null;
      const say = note || opening(list, seen), key = `${say}|${first?.title || ''}`;
      if (key === said) return;
      said = key;
      line.replaceChildren(say, ...(first ? [' ', go(first)] : []));
      line.hidden = false;
    };
    // what it offers, at the side: three things, each saying why, and Something else for more
    const options = el('div', { className: 'aide-options aide-offer aide-first' }), other = el('button', { type: 'button', className: 'aide-other', hidden: list.length <= SHOW, onclick: () => { from = (from + SHOW) % list.length; options.classList.remove('aide-first'); paint(); } }, 'Something else');
    const side = el('div', { className: 'aide-side', role: 'group', 'aria-label': 'What I’d do' }, options, other);
    const row = (opt, i) => {
      const inner = [el('span', { className: 'aide-ic', 'aria-hidden': 'true' }, opt.emoji || svg(opt.icon || 'arrow')), el('span', { className: 'aide-text' }, el('b', {}, opt.title), opt.why ? el('small', {}, opt.why) : null), i != null ? el('kbd', { className: 'aide-key' }, String(i + 1)) : svg('arrow')];
      return opt.href ? el('a', { className: 'aide-option', href: opt.href, target: opt.away ? '_blank' : null, rel: opt.away ? 'noopener' : null }, inner) : el('button', { type: 'button', className: 'aide-option', onclick: () => opt.run(reply) }, inner);
    };
    const pick = () => Array.from({ length: Math.min(SHOW, list.length) }, (_, i) => list[(from + i) % list.length]);
    const words = (few) => few.map((x) => `${x.title} ${x.why}`).join();
    function paint(animate = true) {
      showing = pick();
      if (animate) { options.classList.remove('stagger'); void options.offsetWidth; options.classList.add('stagger'); }
      options.replaceChildren(...showing.map((x, i) => row(x, i)));
    }
    // (what something it offers says, in the line; a card it brings, today's question say, in place of the last one)
    function reply(text, { options: opts, tile: t } = {}) {
      note = text;
      setLine();
      if (opts?.length) { showing = opts.slice(0, SHOW); options.replaceChildren(...showing.map((x, i) => row(x, i))); }
      if (t && tiles[t]) { const c = tiles[t](), last = grid.lastElementChild; if (last && !last.contains(side)) last.replaceChildren(c); else grid.append(el('div', { className: 'aide-stack' }, c)); watch(c); refit(); }
    }

    // the cards, in as many columns as they take (three on a wide window; two on a smaller one; one on a phone)
    const grid = el('div', { className: 'bento aide-cards stagger' });
    const colsNow = () => (matchMedia('(min-width: 900px)').matches ? 3 : matchMedia('(min-width: 561px)').matches ? 2 : 1);
    const render = ({ key, wide }) => {
      if (key === 'plan') return planCard(seen.plan, wide);
      if (key === 'study') return studyCard(seen, { wide, tiles });
      if (key === 'notes') return notesCard(seen);
      const t = tiles[key]?.();
      if (t && key === 'music' && wide) t.classList.add('feature');
      return t;
    };
    // (each card in a column of its own; under a shorter one, more cards fill the room down to the tallest: see fill)
    let shown = { cards: [], side: false, rest: [] }, laid = '', made = new Map();
    const sizes = 'ResizeObserver' in window ? new ResizeObserver(() => refit()) : null, watch = (x) => { if (x) sizes?.observe(x); };
    function lay(force = false) {
      const cols = colsNow(), c = compose(seen, { news, cols, offered: showing }), sig = JSON.stringify([cols, c.cards, c.side, c.rest]);
      if (!force && sig === laid) return false;
      laid = sig; shown = c; made = new Map();
      const items = c.cards.map((x) => ({ card: render(x), wide: x.wide })).filter((x) => x.card);
      if (c.side) items.unshift({ card: side, wide: false });
      const stacks = items.map((x, i) => { const s = el('div', { className: `aide-stack${x.wide ? ' span2' : ''}` }, x.card); s.style.setProperty('--n', i); watch(x.card); return s; });
      grid.style.setProperty('--cols', cols === 1 ? 1 : c.cols);
      grid.classList.toggle('solo', cols > 1 && c.cols === 1);
      grid.dataset.cards = c.cards.map((x) => x.key + (x.wide ? '+' : '')).join(' ');
      grid.replaceChildren(...stacks);
      setLine();
      return true;
    }
    // a smaller card for the room under a shorter one (made once a layout, so one that loads, like Music, keeps its size)
    function filler(key) {
      if (!made.has(key)) {
        const c = key === 'options' ? card('aide-offers', 'var(--accent)', cardHead('spark', 'What I’d do'), el('div', { className: 'aide-rows' }, list.slice(0, SHOW).map((x) => (x.href ? el('a', { className: 'aide-row', href: x.href, target: x.away ? '_blank' : null, rel: x.away ? 'noopener' : null }, el('span', {}, x.title)) : el('button', { type: 'button', className: 'aide-row', onclick: () => x.run(reply) }, el('span', {}, x.title))))))
          : key === 'music' ? musicMini(() => refit())
            : key === 'progress' ? progressMini(seen)
              : key === 'study' ? studyCard(seen)
                : key === 'notes' ? notesCard(seen)
                  : tiles[key]?.() || null;
        c?.classList.add('aide-filler');
        made.set(key, c);
        watch(c);
      }
      return made.get(key);
    }
    box.replaceChildren(grid);
    paint();
    lay(true);

    // ---------- the whole of it in one screen ----------
    // like the tile layouts (home-fit), with the plan showing the rows there's room for: what's crossed off goes first,
    // oldest first, then the switches, then what's latest, keeping what's on now and the two after it, and it says how
    // many more (on a phone the page scrolls instead)
    function fit() {
      document.documentElement.classList.toggle('home-fit', colsNow() > 1);
      grid.querySelectorAll('.aide-filler').forEach((x) => x.remove());
      grid.querySelectorAll('.aide-stack > *').forEach((x) => { x.style.flexGrow = ''; });
      trim();
      fill();
    }
    function trim() {
      const pc = grid.querySelector('.aide-plan'), list = pc?.querySelector('.pd-list'), sw = pc?.querySelector('.pd-switches');
      if (!list) return;
      list.querySelectorAll('.pd-more').forEach((x) => x.remove());
      const rows = [...list.children];
      for (const r of [...rows, sw]) if (r) r.hidden = false;
      if (colsNow() === 1) return;
      const crossed = rows.filter((r) => r.classList.contains('done')), left = rows.filter((r) => !r.classList.contains('done'));
      const timed = left.filter((r) => r.querySelector('time')?.textContent), untimed = left.filter((r) => !timed.includes(r));
      const order = [...crossed.slice(0, -1), sw, ...timed.slice(3).reverse(), ...untimed.reverse(), ...crossed.slice(-1), ...timed.slice(1, 3).reverse()].filter(Boolean);
      const more = (n, top) => el('li', { className: `pd-row pd-more${top ? ' top' : ''}` }, el('span', { className: 'pd-dot', 'aria-hidden': 'true' }), el('time'), el('a', { className: 'pd-name', href: link('schedule/#today') }, top ? `${n} crossed off before these` : `${n} more today`));
      const mark = () => {
        list.querySelectorAll('.pd-more').forEach((x) => x.remove());
        const before = crossed.filter((r) => r.hidden).length, after = left.filter((r) => r.hidden).length;
        if (before) list.prepend(more(before, true));
        if (after) list.append(more(after, false));
      };
      for (let i = 0; i < order.length && pc.scrollHeight > pc.clientHeight + 1; i++) { order[i].hidden = true; mark(); }
    }
    // under a shorter column, what else counts, a smaller card at a time, as long as it fits above the tallest column's
    // foot (the cards needn't be one height; the room shouldn't be empty)
    function fill() {
      if (colsNow() === 1) return;
      const stacks = [...grid.children], foot = Math.max(0, ...stacks.map((s) => s.clientHeight)), done = new Set();
      const tall = (s) => { const a = s.firstElementChild, z = s.lastElementChild; return a ? z.offsetTop + z.offsetHeight - a.offsetTop : 0; };
      for (const s of stacks) {
        for (const key of shown.rest) {
          if (done.has(key) || foot - tall(s) < 90) continue;
          const c = filler(key);
          if (!c) continue;
          s.append(c);
          if (tall(s) > foot + 1) c.remove(); else done.add(key);
        }
        // (a gap too small for another card: the last one in the column takes it)
        const gap = foot - tall(s);
        if (gap > 0 && gap <= 160 && s.lastElementChild) s.lastElementChild.style.flexGrow = '1';
      }
    }
    let sized = 0;
    const refit = () => { cancelAnimationFrame(sized); sized = requestAnimationFrame(fit); };
    for (const q of ['(min-width: 900px)', '(min-width: 561px)']) matchMedia(q).addEventListener('change', () => { lay(); refit(); });
    const main = box.closest('main');
    if (main && 'ResizeObserver' in window) new ResizeObserver(refit).observe(main);
    addEventListener('fluence:shown', refit);
    document.fonts?.ready.then(refit);
    fit();
    // the greeting, for the time of day or a holiday, and a day off coming up
    if (f.settings.greeting) welcomed?.then(({ welcome, upcoming }) => {
      const w = welcome({ now: new Date(seen.now), visits: read('fluentio.visits') || { count: 1, streak: 1, away: null }, last: seen.last, learned: 0, best: null, name: f.settings.name, music: null });
      const off = f.settings.showDaysOff ? upcoming(new Date(seen.now), 3, f.settings.daysOff).find((h) => h.off && h.days <= 1) : null;
      hello.textContent = `${w.hello}${off ? ` ${off.emoji} ${off.days === 0 ? 'You’re off today' : 'You’re off tomorrow'} for ${off.name}.` : ''}`;
      hello.hidden = false;
      refit();
    }).catch(() => {});
    // what's playing changes what it offers, and so do songs another device added; the plan moves on with the clock, and
    // then what it says changes too, and the cards (the plan's own card is drawn again for the clock)
    let soon = 0;
    const again = () => {
      seen = see(); list = suggestions(seen);
      if (from >= list.length) from = 0;
      other.hidden = list.length <= SHOW;
      if (words(pick()) !== words(showing)) paint(false);
      if (!lay()) { const pc = grid.querySelector('.aide-plan'); if (pc && seen.plan) pc.replaceWith(Object.assign(planCard(seen.plan, pc.classList.contains('span2')), { className: pc.className })); }
      setLine();
      refit();
    };
    const refresh = () => { clearTimeout(soon); soon = setTimeout(again, 200); };
    addEventListener('fluence:plan', again);
    // (another page of the site changing the plan, a switch, your notes, or where you left off)
    addEventListener('storage', (e) => { if (e.key === P()?.KEY || e.key === P()?.DOCS || e.key === 'fluentio.station' || e.key === 'fluentio.last') refresh(); });
    setInterval(() => { if (!document.hidden) again(); }, 30000);
    Promise.all([import(link('kit/music/player.js')), import(link('kit/music/library.js'))]).then(([player, lib]) => {
      for (const w of ['song', 'state']) player.events.addEventListener(w, refresh);
      lib.events.addEventListener('library', refresh);
      lib.refresh();
    }).catch(() => {});
    // 1, 2 and 3 take what's offered at the side, and 1 what's linked in the line when nothing is at the side (not while
    // you're typing somewhere)
    addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.isComposing || e.target.closest?.('input, textarea, select, [contenteditable]')) return;
      const k = +e.key;
      if (shown.side && k >= 1 && k <= showing.length) { e.preventDefault(); options.children[k - 1].click(); }
      else if (!shown.side && k === 1 && line.querySelector('a, .welcome-go')) { e.preventDefault(); line.querySelector('a, .welcome-go').click(); }
    });
  }
  f.assistant = { draw, see, suggestions, opening };
})();
