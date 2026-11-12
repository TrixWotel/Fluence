// What's new since your last visit to Home, and how far Home's cards have turned, so Home is a little different each time
// you come back: topics learned, a new best, songs added or liked, notes written.
// A visit starts after half an hour away from Home (a reload in between is the same visit, and shows the same). Home keeps
// a small note of what it saw in 'fluentio.home', which goes with your progress so another browser knows too, and
// compares the next visit with it; when you were last on Home stays in this browser ('fluentio:home').
// A plain script: window.fluentioNotice, and the tests require() it.
(function (root) {
  const KEY = 'fluentio.home', SEEN = 'fluentio:home', GAP = 30 * 60000;
  // every course that keeps your progress, the folder it's in, and its name
  const BANKS = [
    ['triangles', 'math', 'Triangle Angles'], ['amc10', 'math', 'AMC 10 Practice'], ['amc12', 'math', 'AMC 12 Practice'], ['heat', 'science', 'Heat Capacity'], ['systems', 'science', 'Systems and Matter'], ['energy', 'science', 'Energy and Matter'], ['earth', 'science', 'Earth and Energy Systems'], ['scireview', 'science', 'Science Mixed Review'], ['labs', 'science', 'Investigations and Data'],
    ['kinematics', 'physics', 'Kinematics'], ['motion', 'physics', 'Motion in a Straight Line'], ['vectors', 'physics', 'Vectors'], ['projectiles', 'physics', 'Projectile Motion'],
    ['forces', 'physics', 'Forces and Newton’s Laws'], ['statics', 'physics', 'Statics of Particles'], ['torque', 'physics', 'Torque and Rotational Equilibrium'], ['dynamics', 'physics', 'Dynamics of Particles and Systems'], ['forcesreview', 'physics', 'Forces Mixed Review'],
    ['vocab', 'spanish', 'Spanish Vocabulary'], ['preterite', 'spanish', 'The Preterite'], ['imperfect', 'spanish', 'The Imperfect'], ['middleages', 'history', 'The Middle Ages'], ['wars', 'history', 'The Wars of Religion'], ['ushistory', 'history', 'American History'], ['essays', 'english', 'Essay Writing'],
  ].map(([id, folder, name]) => ({ id, folder, name }));
  const plain = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
  const list = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);
  const noteName = (x) => { const p = String(x.path || x.title || ''); return /^journal\//.test(p) ? 'your journal' : `“${p.split('/').pop().replace(/\.md$/i, '') || 'a note'}”`; };

  // what a visit keeps to compare with: the topics learned in each course, and the songs you've liked (the rest says when
  // it happened)
  function snap(read) {
    const learned = {};
    for (const b of BANKS) {
      const l = read(`fluentio.${b.id}.learn`);
      if (plain(l)) learned[b.id] = Object.keys(l).filter((t) => l[t]?.learned).sort();
    }
    const songs = (read('fluentio.music.library') || {}).songs;
    return { learned, liked: Array.isArray(songs) ? songs.filter((x) => x?.liked).map((x) => x.id) : [] };
  }

  // what happened between a visit and this one: a line each ({ kind, text, list, href }), what you did most first
  function since(prev, cur, read, at) {
    const out = [];
    for (const b of BANKS) {
      const was = new Set(prev?.learned?.[b.id] || []), got = (cur.learned[b.id] || []).filter((t) => !was.has(t));
      if (got.length) out.push({ kind: 'learned', n: got.length, text: got.length === 1 ? `Learned ${got[0]} in ${b.name}` : `Learned ${got.length} topics in ${b.name}`, list: got.length > 1 ? got.slice(0, 3) : [], href: `${b.folder}/#${b.id}/learn` });
    }
    for (const b of BANKS) {
      const bests = ['best', 'best-mixed', 'best-hard'].map((k) => read(`fluentio.${b.id}.${k}`)).filter((x) => x?.text && x.when > at).sort((p, q) => q.when - p.when);
      if (bests.length) out.push({ kind: 'best', n: 1, text: `New best in ${b.name}: ${bests[0].text}`, list: [], href: `${b.folder}/#${b.id}` });
    }
    const songs = (read('fluentio.music.library') || {}).songs, all = Array.isArray(songs) ? songs.filter(Boolean) : [];
    const added = all.filter((x) => (x.added || 0) > at).sort((p, q) => (q.added || 0) - (p.added || 0));
    if (added.length) out.push({ kind: 'songs', n: added.length, text: added.length === 1 ? `Added ${added[0].title} to your music` : `Added ${added.length} songs`, list: added.length > 1 ? added.slice(0, 3).map((x) => x.title) : [], href: 'music/' });
    const liked = new Set(prev?.liked || []), hearts = all.filter((x) => x.liked && !liked.has(x.id));
    if (hearts.length) out.push({ kind: 'liked', n: hearts.length, text: hearts.length === 1 ? `Liked ${hearts[0].title}` : `Liked ${hearts.length} songs`, list: hearts.length > 1 ? hearts.slice(0, 3).map((x) => x.title) : [], href: 'music/#liked' });
    const notes = (read('fluentio.station')?.notes || []).filter((x) => x && (x.edited || 0) > at && String(x.text || '').trim()).sort((p, q) => (q.edited || 0) - (p.edited || 0));
    if (notes.length) out.push({ kind: 'notes', n: notes.length, text: notes.length === 1 ? `Wrote in ${noteName(notes[0])}` : `Wrote in ${notes.length} notes`, list: notes.length > 1 ? [...new Set(notes.map(noteName))].slice(0, 3) : [], href: 'station/' });
    return out.sort((p, q) => q.n - p.n);
  }

  // a visit to Home: what's new since the last one, and the turn (one more each visit, so the cards each show something
  // else). A visit after half an hour away is a new one; a reload before that shows what the visit started with
  function visit({ read, write, now = Date.now() } = {}) {
    const was = read(KEY) || {}, seen = read(SEEN) || {}, fresh = !was.at || !seen.at || now - seen.at > GAP;
    write(SEEN, { at: now });
    if (!fresh) return { news: Array.isArray(was.news) ? was.news : [], turn: was.turn || 1, last: was.last || null, fresh: false };
    const cur = snap(read), news = was.snap && was.at ? since(was.snap, cur, read, was.at) : [];
    const out = { at: now, snap: cur, news, turn: (was.turn || 0) + 1, last: was.at || null };
    write(KEY, out);
    return { news, turn: out.turn, last: out.last, fresh: true };
  }

  root.fluentioNotice = { KEY, SEEN, BANKS, snap, since, visit, list };
  if (typeof module === 'object' && module.exports) module.exports = root.fluentioNotice;
})(typeof window === 'object' ? window : globalThis);
