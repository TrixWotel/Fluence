// Your plan, from the notes in Station's plan folder. They're yours: none of a plan is in the site's code.
// week.md has your days: a section for each day or set of days ("## Monday", "## Sunday to Thursday nights"), a line for
// each thing with its time, and minutes on what you check off ("- 4:30 Homework · 90 min"). A section like "## On game
// days" is a switch on Home that changes those days. deadlines.md has a line for each date, sleep.md when it's lights out
// from when, and how-to-study.md a section for each kind of block, which Home quotes.
// What you've checked off is in 'fluentio.plan', which goes with the rest of your progress, so every browser carries on
// from the same day. Home says what's now and lists the day, and the bar shows what's now on every page.
// A plain script: Home and the bar use window.fluentioPlan, and the tests require() it.
(function (root) {
  'use strict';
  const MIN = 60000, DAY = 86400000;
  const KEY = 'fluentio.plan', FOLDER = 'plan', STATION = 'fluentio.station';
  const ROLL = 5 * 60;   // (a day of the plan runs until 5 in the morning, so a late night is still that day)
  const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const NTH = { first: 1, '1st': 1, second: 2, '2nd': 2, third: 3, '3rd': 3, fourth: 4, '4th': 4, last: -1 };
  const plainObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
  const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
  const kebab = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'switch';

  // ---------- words ----------
  const dayOfWord = (w) => { const t = String(w).toLowerCase().replace(/s$/, ''); return t.length < 3 ? -1 : DAYS.findIndex((d) => d.startsWith(t)); };
  const monthOf = (w) => { const t = String(w).toLowerCase().replace(/\.$/, ''); return t.length < 3 ? -1 : MONTHS.findIndex((m) => m.startsWith(t)); };
  // the days a heading or a part of a line names: "Monday", "Tue + Thu", "Sunday to Thursday", "Weekdays", "Every day"
  function daysIn(text) {
    const t = ` ${String(text).toLowerCase().replace(/[’']/g, '')} `, out = new Set(), add = (...xs) => xs.forEach((x) => out.add(x));
    if (/\b(every ?day|daily|all week|each day)\b/.test(t)) add(0, 1, 2, 3, 4, 5, 6);
    if (/\b(week ?days|school ?days)\b/.test(t)) add(1, 2, 3, 4, 5);
    if (/\bschool ?nights\b/.test(t)) add(0, 1, 2, 3, 4);
    if (/\bweek ?ends?\b/.test(t)) add(0, 6);
    for (const m of t.matchAll(/([a-z]{3,9})\s*(?:–|—|-|\bto\b|\bthrough\b|\bthru\b)\s*([a-z]{3,9})/g)) {
      const a = dayOfWord(m[1]), b = dayOfWord(m[2]);
      if (a >= 0 && b >= 0) for (let i = a; ; i = (i + 1) % 7) { out.add(i); if (i === b) break; }
    }
    for (const w of t.split(/[^a-z]+/)) { const i = dayOfWord(w); if (i >= 0) out.add(i); }
    return out;
  }
  // a part of a line that only names days ("Tuesday", "Fri and Sat")
  const onlyDays = (p) => {
    const words = p.toLowerCase().replace(/[,+&/–—-]/g, ' ').split(/\s+/).filter((w) => w && !['and', 'only', 'on', 'to', 'through', 'thru'].includes(w));
    return words.length > 0 && words.every((w) => dayOfWord(w) >= 0 || /^(weekdays?|weekends?|daily)$/.test(w));
  };

  // ---------- dates ----------
  const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const dateOf = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  // "Nov 13", "November 13, 2026", "2026-11-13", "January": { y (or null), mo, d, rest }
  function dateParts(text) {
    const t = String(text).trim();
    let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(t);
    if (m) return { y: +m[1], mo: +m[2] - 1, d: +m[3], rest: t.slice(m[0].length) };
    m = /^([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b(?:,?\s+(\d{4}))?/.exec(t);
    if (m && monthOf(m[1]) >= 0) return { y: m[3] ? +m[3] : null, mo: monthOf(m[1]), d: +m[2], rest: t.slice(m[0].length) };
    m = /^([A-Za-z]{3,9})\b(?:,?\s+(\d{4}))?/.exec(t);
    if (m && monthOf(m[1]) >= 0) return { y: m[2] ? +m[2] : null, mo: monthOf(m[1]), d: 1, rest: t.slice(m[0].length) };
    return null;
  }
  // a date with no year: the year that puts it nearest a few months after `ref` (a list written in November has its
  // January in the next year, and last week's dates stay last week's)
  function yearFor(mo, d, ref) {
    const r = new Date(ref), aim = r.getTime() + 90 * DAY;
    let best = null;
    for (const y of [r.getFullYear() - 1, r.getFullYear(), r.getFullYear() + 1]) { const t = new Date(y, mo, d).getTime(); if (best == null || Math.abs(t - aim) < Math.abs(best - aim)) best = t; }
    return new Date(best).getFullYear();
  }
  const timeOf = (p, ref, year) => new Date(p.y ?? year ?? yearFor(p.mo, p.d, ref), p.mo, p.d).getTime();
  // ISO weeks (Monday to Sunday), for every other week and for a switch that lasts the week
  function isoWeek(d) {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), wd = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - wd);
    const y = t.getUTCFullYear();
    return { y, w: Math.ceil(((t - Date.UTC(y, 0, 1)) / DAY + 1) / 7) };
  }
  const weekKey = (d) => { const { y, w } = isoWeek(d); return `${y}-W${String(w).padStart(2, '0')}`; };

  // ---------- times ----------
  // a time at the start of some words: "4:30", "4:30 pm", "4pm", "16:30"
  function clockAt(t) {
    const m = /^(\d{1,2})(?::(\d{2}))?(?:\s*([ap])\.?\s?m\b\.?)?/i.exec(t);
    if (!m || (!m[2] && !m[3])) return null;
    const h = +m[1], mm = m[2] ? +m[2] : 0;
    if (h > 23 || mm > 59) return null;
    return { h, mm, ap: m[3] ? m[3].toLowerCase() : '', len: m[0].length };
  }
  // a time as minutes from the start of the day, placed after the time before it in its list (so 4:00 after 3:45 is in
  // the afternoon). The first of a list, with no am or pm: 7 to 11 is the morning and 12 to 6 the afternoon, or in a list
  // for the night, 5 to 11 the evening and 12 to 4 after midnight. Past midnight counts on from 24:00
  function place(c, after, evening) {
    let m;
    if (c.h > 12 || (c.h === 0 && !c.ap)) m = c.h * 60 + c.mm;
    else {
      m = (c.h % 12) * 60 + c.mm;
      if (c.ap === 'p') m += 720;
      else if (!c.ap && after == null) m += evening ? (c.h === 12 || c.h < 5 ? 1440 : 720) : (c.h === 12 || c.h < 7 ? 720 : 0);
    }
    if (after != null) { const step = c.ap || c.h > 12 || c.h === 0 ? 1440 : 720; while (m < after) m += step; }
    else if (m < ROLL) m += 1440;
    return m;
  }
  const clock = (m) => { const h = Math.floor(m / 60) % 24, mm = Math.round(m % 60); return `${h % 12 || 12}:${String(mm).padStart(2, '0')}`; };
  const clockAmPm = (m) => `${clock(m)} ${Math.floor(m / 60) % 24 < 12 ? 'AM' : 'PM'}`;

  // ---------- week.md ----------
  const LIST = /^\s*(?:[-*+]|\d+[.)])\s+(?:\[[ xX]\]\s+)?(.*)$/;
  function readLine(text) {
    let t = text.trim(), start = null, end = null;
    const c = clockAt(t);
    if (c) {
      start = c; t = t.slice(c.len);
      const r = /^\s*(?:–|—|-|to\b)\s*/.exec(t), c2 = r && clockAt(t.slice(r[0].length));
      if (c2) { end = c2; t = t.slice(r[0].length + c2.len); }
      t = t.replace(/^\s*[:–—-]?\s*/, '');
    }
    const parts = t.split('·').map((s) => s.trim()).filter(Boolean);
    let name = parts.shift() || '';
    const x = { start, end, name: '', min: 0, link: '', note: '', from: null, until: null, parity: '', nth: null, days: null };
    const inName = /\s*\((\d{1,3})\s*(?:min|mins|minutes)\)\s*$|\s+(\d{1,3})\s*(?:min|mins|minutes)\s*$/i.exec(name);
    if (inName) { x.min = +(inName[1] || inName[2]); name = name.slice(0, inName.index); }
    for (const p of parts) {
      let m;
      if ((m = /^(\d{1,3})\s*(?:m|min|mins|minutes)$/i.exec(p))) x.min = +m[1];
      else if ((m = /^(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hours?)$/i.exec(p))) x.min = Math.round(+m[1] * 60);
      else if (/^https?:\/\/\S+$/i.test(p)) x.link = p;
      else if ((m = /^from\s+(.+)$/i.exec(p)) && dateParts(m[1])) x.from = dateParts(m[1]);
      else if ((m = /^(?:until|till|through)\s+(.+)$/i.exec(p)) && dateParts(m[1])) x.until = dateParts(m[1]);
      else if ((m = /^(odd|even)\s+weeks?$/i.exec(p))) x.parity = m[1].toLowerCase();
      else if ((m = /^(first|1st|second|2nd|third|3rd|fourth|4th|last)\s+([a-z]+)(?:\s+of\s+(?:the|each|every)\s+month)?$/i.exec(p)) && dayOfWord(m[2]) >= 0) x.nth = { n: NTH[m[1].toLowerCase()], wd: dayOfWord(m[2]) };
      else if (onlyDays(p)) x.days = daysIn(p);
      else name += ` · ${p}`;
    }
    // a link in the words: [words](https://…), or [[a note]]
    const md = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/.exec(name);
    if (md) { x.link = x.link || md[2]; name = name.replace(md[0], md[1]); }
    const wiki = /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/.exec(name);
    if (wiki) { x.note = wiki[1].trim(); name = name.replace(wiki[0], wiki[2] || wiki[1]); }
    x.name = name.replace(/\s+/g, ' ').trim();
    return x.name || start ? x : null;
  }
  // a section: days ("## Monday"), a switch ("## On game days", "## In exam weeks", "## On trip days, only":
  // only means the switch's lines are all there is to check off), or anything else, which is left alone
  function section(title) {
    const t = title.replace(/[*_`]/g, '').trim(), evening = /\b(nights?|evenings?|tonight)\b/i.test(t);
    const sw = /^(?:on|in|during)\s+(.+?)\s+(days?|weeks?|weekends?|nights?)\b(.*)$/i.exec(t);
    if (sw && !daysIn(sw[1]).size && !/^(school|week|weekend|every|each|all|the)$/i.test(sw[1].trim())) {
      const unit = sw[2].toLowerCase().replace(/s$/, ''), name = `${cap(sw[1].trim())} ${unit}`;
      return { kind: 'switch', title: t, name, id: kebab(name), scope: unit === 'day' || unit === 'night' ? 'day' : 'week', only: /\bonly\b/i.test(sw[3]), evening: unit === 'night', lines: [] };
    }
    const days = daysIn(t);
    return { kind: days.size ? 'days' : 'other', title: t, days, evening, lines: [] };
  }
  function readWeek(text) {
    const sections = [];
    let cur = null;
    for (const line of String(text).split('\n')) {
      const h = /^#{2,6}\s+(.+?)\s*#*\s*$/.exec(line);
      if (h) { sections.push((cur = section(h[1]))); continue; }
      if (/^#\s/.test(line)) { cur = null; continue; }
      const li = cur && LIST.exec(line), x = li && readLine(li[1]);
      if (x) cur.lines.push(x);
    }
    return sections;
  }

  // ---------- deadlines.md and sleep.md ----------
  function readDeadlines(text, ref) {
    const out = [];
    let year = null;
    for (const line of String(text).split('\n')) {
      const h = /^#{1,6}\s+.*?\b(\d{4})\b/.exec(line);
      if (h) { year = +h[1]; continue; }
      const li = /^\s*(?:[-*+]|\d+[.)])\s+(?:\[( |x|X)\]\s+)?(.*)$/.exec(line);
      if (!li) continue;
      let t = li[2].trim(), done = /x/i.test(li[1] || '');
      if (/^~~.*~~/.test(t)) { done = true; t = t.replace(/~~/g, ''); }
      if (/\((?:done|finished)\)\s*$/i.test(t)) { done = true; t = t.replace(/\s*\((?:done|finished)\)\s*$/i, ''); }
      const a = dateParts(t);
      if (!a) continue;
      let rest = a.rest, b = null;
      const slash = /^\s*\/\s*(\d{1,2})\b/.exec(rest);
      if (slash) { b = { ...a, d: +slash[1] }; rest = rest.slice(slash[0].length); }
      const range = /^\s*(?:–|—|-|to)\s*/.exec(rest);
      if (range) {
        const more = rest.slice(range[0].length), whole = dateParts(more), day = /^(\d{1,2})\b(?:,?\s+(\d{4}))?/.exec(more);
        if (whole) { b = whole; rest = whole.rest; } else if (day) { b = { y: day[2] ? +day[2] : a.y, mo: a.mo, d: +day[1] }; rest = more.slice(day[0].length); }
      }
      const what = rest.replace(/^\s*,?\s*\d{4}\b/, '').replace(/^\s*[:–—-]\s*/, '').trim();
      if (!what) continue;
      const y = a.y ?? year ?? yearFor(a.mo, a.d, ref), t0 = new Date(y, a.mo, a.d).getTime();
      let t1 = b ? new Date(b.y ?? y, b.mo, b.d).getTime() : t0;
      if (t1 < t0) t1 = new Date(new Date(t1).getFullYear() + 1, b.mo, b.d).getTime();
      out.push({ t: t0, end: t1, what, done, two: !!slash });
    }
    return out.sort((p, q) => p.t - q.t);
  }
  // when it's lights out: a table (or list) of from-date and time, and a line like "Friday and Saturday nights: up to 30
  // min later"
  function readSleep(text, ref) {
    const rows = [];
    let later = null;
    for (const line of String(text).split('\n')) {
      let cells = null;
      if (/^\s*\|/.test(line)) cells = line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      else { const li = /^\s*[-*+]\s+(.+?)\s*[:–—]\s*(.+)$/.exec(line); if (li) cells = [li[1], li[2]]; }
      const more = /(\d{1,3})\s*min(?:ute)?s?\s+later/i.exec(line);
      if (more && !cells?.length) { const days = daysIn(line.slice(0, more.index)); if (days.size) later = { days, min: +more[1] }; continue; }
      if (!cells || cells.length < 2) continue;
      const d = dateParts(cells[0].replace(/\bon$/i, '').trim()), c = clockAt(cells[1]);
      if (!d || !c) continue;
      rows.push({ t: timeOf(d, ref), at: place(c, null, true) });
    }
    return { rows: rows.sort((a, b) => a.t - b.t), later };
  }
  // how-to-study.md: a section for each kind of block, quoted on Home
  function readHow(text) {
    const out = [];
    let cur = null;
    for (const line of String(text).split('\n')) {
      const h = /^#{2,6}\s+(.+?)\s*#*\s*$/.exec(line);
      if (h) { out.push((cur = { name: h[1].replace(/[*_`]/g, '').trim(), text: '' })); continue; }
      if (cur && line.trim() && !/^\s*[-*+|]/.test(line)) cur.text += (cur.text ? ' ' : '') + line.trim();
    }
    return out.filter((x) => x.name);
  }

  // ---------- the plan, from the notes ----------
  let cache = { raw: null, plan: null };
  function fromVault(v) {
    const notes = (plainObj(v) && Array.isArray(v.notes) ? v.notes : []).filter((n) => n && typeof n.path === 'string' && typeof n.text === 'string');
    const find = (name) => notes.find((n) => n.path.toLowerCase() === `${FOLDER}/${name}.md`);
    const week = find('week');
    if (!week) return null;
    const when = (n) => (n && n.edited > 1e12 ? n.edited : Date.now());
    const ref = when(week), dl = find('deadlines'), sl = find('sleep'), how = find('how-to-study');
    const sections = readWeek(week.text);
    const switches = [];
    for (const s of sections) if (s.kind === 'switch' && !switches.some((x) => x.id === s.id)) switches.push({ id: s.id, name: s.name, scope: s.scope, only: s.only });
    return {
      ref, sections, switches,
      deadlines: dl ? readDeadlines(dl.text, when(dl)) : [],
      sleep: sl ? readSleep(sl.text, when(sl)) : { rows: [], later: null },
      how: how ? readHow(how.text) : [],
      notes: notes.map((n) => n.path),
    };
  }
  // the plan in this browser's Station (the same plan again while its notes haven't changed)
  function current(getRaw) {
    let raw = null;
    try { raw = getRaw ? getRaw() : root.localStorage.getItem(STATION); } catch {}
    if (raw === cache.raw) return cache.plan;
    let plan = null;
    if (raw && raw.includes(`"${FOLDER}/`)) try { plan = fromVault(JSON.parse(raw)); } catch {}
    cache = { raw, plan };
    return plan;
  }

  // ---------- a day ----------
  const fits = (x, date, ref) => {
    const t = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    if (x.from && t < timeOf(x.from, ref)) return false;
    if (x.until && t > timeOf(x.until, ref)) return false;
    if (x.parity && (isoWeek(date).w % 2 === 1) !== (x.parity === 'odd')) return false;
    if (x.nth) {
      if (date.getDay() !== x.nth.wd) return false;
      const last = addDays(date, 7).getMonth() !== date.getMonth();
      if (x.nth.n === -1 ? !last : Math.ceil(date.getDate() / 7) !== x.nth.n) return false;
    }
    return true;
  };
  const base = (name) => name.toLowerCase().split(/[:·,(]/)[0].trim();
  const same = (a, b) => (a.at != null && a.at === b.at) || base(a.name) === base(b.name);
  // the lines of a section for one day of the week, with their times placed one after another
  function placed(s, wd) {
    let after = null;
    const out = [];
    for (const x of s.lines) {
      if (x.days && !x.days.has(wd)) continue;
      let at = null, end = null;
      if (x.start) { at = place(x.start, after, s.evening); after = at; if (x.end) end = place(x.end, at, false); }
      out.push({ x, at, end, s });
    }
    return out;
  }
  const itemOf = ({ x, at, end, s }) => ({
    id: `${at ?? ''}|${x.name.toLowerCase()}`, at, end: end ?? (x.min && at != null ? at + x.min : null), set: end != null || (!!x.min && at != null),
    name: x.name, min: x.min, check: x.min > 0, link: x.link, note: x.note, night: !!s.evening, special: !!(x.from || x.until || x.parity || x.nth), by: s.kind === 'switch' ? s.id : '',
  });
  // what's on a day, in order (what has no time first), with the switches that are on that day
  function day(plan, date, on = {}) {
    if (!plan) return [];
    const wd = date.getDay();
    let items = [];
    for (const s of plan.sections) if (s.kind === 'days' && s.days.has(wd)) for (const p of placed(s, wd)) if (fits(p.x, date, plan.ref)) items.push(itemOf(p));
    // a line for some dates only (once a month, every other week, from a date) takes the place of the usual one at its
    // time, or with its name
    const special = items.filter((i) => i.special);
    items = items.filter((i) => i.special || !special.some((s) => same(s, i)));
    for (const s of plan.sections) {
      if (s.kind !== 'switch' || !on[s.id]) continue;
      if (s.only) items = items.filter((i) => !i.check);
      for (const p of placed(s, wd)) {
        if (!fits(p.x, date, plan.ref)) continue;
        const a = itemOf(p), was = items.find((i) => same(a, i));
        // (a line with no time changes the one with its name and keeps its time: "Homework · 45 min")
        if (was && a.at == null) { a.at = was.at; a.id = was.id; a.end = a.min && a.at != null ? a.at + a.min : was.end; a.set = was.set || !!a.min; a.night = was.night; }
        items = items.filter((i) => !same(a, i));
        items.push(a);
      }
    }
    items.sort((a, b) => (a.at ?? -1) - (b.at ?? -1));
    items.forEach((it, i) => {
      if (it.at == null || it.set) return;
      // (something with no end goes until the next thing: free time and the night's steps all the way, a meal or the
      // like for 75 minutes at most; the last thing of the day for an hour, or the last of the night for half an hour)
      const next = items.slice(i + 1).find((n) => n.at != null && n.at > it.at);
      if (next) it.end = /^free\b/i.test(it.name) || it.night ? next.at : Math.min(next.at, it.at + 75);
      else it.end = it.at + (it.night ? 30 : 60);
    });
    return items;
  }
  // tonight's lights out: { at (minutes from the start of the day), later (minutes more allowed tonight) }
  function lightsOut(plan, date) {
    const rows = plan?.sleep?.rows || [], t = date.getTime();
    let row = null;
    for (const r of rows) if (r.t <= t + 12 * 3600000) row = r;
    if (!row) return null;
    const later = plan.sleep.later && plan.sleep.later.days.has(date.getDay()) ? plan.sleep.later.min : 0;
    return { at: row.at, later };
  }

  // ---------- what you've checked off ----------
  function load(read) {
    let s = null;
    try { s = read ? read(KEY) : JSON.parse(root.localStorage.getItem(KEY)); } catch {}
    return { ...(plainObj(s) ? s : {}), days: plainObj(s?.days) ? s.days : {}, weeks: plainObj(s?.weeks) ? s.weeks : {} };
  }
  function save(state, write) {
    // (a year of days is plenty)
    const keep = dayKey(addDays(new Date(), -400));
    for (const k of Object.keys(state.days)) if (k < keep) delete state.days[k];
    const out = { v: 1, days: state.days, weeks: state.weeks };
    try { if (write) write(KEY, out); else root.localStorage.setItem(KEY, JSON.stringify(out)); } catch {}
  }
  const switchesOn = (plan, state, date) => {
    const on = {}, d = state.days[dayKey(date)]?.on || {}, w = state.weeks[weekKey(date)]?.on || {};
    for (const s of plan?.switches || []) if (s.scope === 'day' ? d[s.id] : w[s.id]) on[s.id] = true;
    return on;
  };
  // the day of the plan it is: before 5 in the morning it's still yesterday, at 24:00 and on
  function dayAt(now) {
    const t = new Date(now);
    let d = new Date(t.getFullYear(), t.getMonth(), t.getDate()), m = t.getHours() * 60 + t.getMinutes() + t.getSeconds() / 60;
    if (m < ROLL) { d = addDays(d, -1); m += 1440; }
    return { d, m };
  }
  const dayRec = (state, key) => (state.days[key] = plainObj(state.days[key]) ? state.days[key] : {});
  function check(state, key, id, on) {
    const rec = dayRec(state, key);
    rec.done = plainObj(rec.done) ? rec.done : {};
    if (on) rec.done[id] = Date.now(); else delete rec.done[id];
    return state;
  }
  // how many things today has to check off, kept with the day so its streak still adds up after the plan changes
  // (false when that's already there)
  function remember(state, st) {
    if (!st || state.days[st.key]?.of === st.of) return false;
    dayRec(state, st.key).of = st.of;
    return true;
  }
  function flip(plan, state, date, id, on) {
    const sw = plan.switches.find((s) => s.id === id);
    if (!sw) return state;
    const box = sw.scope === 'day' ? state.days : state.weeks, k = sw.scope === 'day' ? dayKey(date) : weekKey(date);
    const rec = (box[k] = plainObj(box[k]) ? box[k] : {});
    rec.on = plainObj(rec.on) ? rec.on : {};
    if (on) rec.on[id] = true; else delete rec.on[id];
    return state;
  }
  // days in a row at 70% or more (today counts once it's there; a day with nothing to check off doesn't count either way)
  const GOAL = 0.7;
  function streak(plan, state, date, today) {
    let n = today.of && today.done / today.of >= GOAL ? 1 : 0;
    for (let i = 1; i <= 400; i++) {
      const d = addDays(date, -i), rec = state.days[dayKey(d)];
      const of = Number.isFinite(rec?.of) ? rec.of : day(plan, d, switchesOn(plan, state, d)).filter((x) => x.check).length;
      if (!of) continue;
      const done = Math.min(of, Object.keys(rec?.done || {}).length);
      if (done / of >= GOAL) n++; else break;
    }
    return n;
  }

  // ---------- now ----------
  const PLACES = [
    [/\bamc ?12\b/i, 'math/#amc12/learn'], [/\bamc\b.*\b(timed|test|set)\b/i, 'math/#amc10/test'], [/\bamc\b/i, 'math/#amc10/learn'],
    [/\bspanish\b|\bvocab/i, 'spanish/'], [/\bphysics\b/i, 'physics/'], [/\bscience\b/i, 'science/'], [/\bhistory\b/i, 'history/'], [/\bessays?\b|\benglish\b/i, 'english/'], [/\bgeograph/i, 'geography/'],
    [/\bjournal\b|\breview\b/i, 'station/#today'], [/\bwhiteboard\b|\bsketch\b/i, 'board/'],
  ];
  // where a thing on the plan is done: its own link, a note it names, or the page of the site it's about
  function placeOf(plan, it) {
    if (it.link) return { href: it.link, away: true };
    if (it.note) { const p = plan.notes.find((x) => x.toLowerCase().replace(/\.md$/, '').split('/').pop() === it.note.toLowerCase()); if (p) return { href: `station/#${p.replace(/\.md$/i, '')}` }; }
    const hit = PLACES.find(([re]) => re.test(it.name));
    return hit ? { href: hit[1] } : null;
  }
  // what how-to-study.md says about a block: the sentence about today ("Sunday: …", "Weeknights: …"), or its first
  function howFor(plan, it, date) {
    const name = it.name.toLowerCase(), h = plan.how.find((x) => new RegExp(`(^|[^a-z0-9])${esc(x.name.toLowerCase())}($|[^a-z0-9])`).test(name));
    if (!h || !h.text) return null;
    const wd = date.getDay(), weekday = wd >= 1 && wd <= 5, sentences = h.text.split(/(?<=[.!?])\s+(?=["“A-Z0-9])/);
    const score = (s) => { const l = s.toLowerCase(); if (l.includes(DAYS[wd])) return 3; if ((weekday && /\bweek ?nights?\b|\bweek ?days?\b/.test(l)) || (!weekday && /\bweekends?\b/.test(l))) return 2; return DAYS.some((d) => l.includes(d)) || /\bweek ?nights?\b|\bweekends?\b/.test(l) ? -1 : 0; };
    let best = 0;
    sentences.forEach((s, i) => { if (score(s) > score(sentences[best])) best = i; });
    // (a first sentence that only names a thing takes the next one along: "Flashcards. Each block: …")
    let text = sentences[best].trim();
    if (best === 0 && text.length < 40 && sentences[1] && score(sentences[1]) >= 0) text += ` ${sentences[1].trim()}`;
    if (text.length > 150) text = `${text.slice(0, 150).replace(/\s+\S*$/, '')}…`;
    return { name: h.name, text, href: `station/#${FOLDER}/how-to-study` };
  }
  function status(plan, state, now = Date.now()) {
    if (!plan) return null;
    const { d, m } = dayAt(now), key = dayKey(d), rec = state.days[key] || {}, on = switchesOn(plan, state, d);
    const items = day(plan, d, on), checks = items.filter((i) => i.check), done = (i) => !!rec.done?.[i.id];
    for (const it of items) { it.done = it.check && done(it); it.place = placeOf(plan, it); it.how = it.check ? howFor(plan, it, d) : null; }
    const timed = items.filter((i) => i.at != null);
    const now_ = [...timed].reverse().find((i) => i.at <= m && m < i.end) || null;
    const next = timed.find((i) => i.at > m && (!now_ || i.at >= now_.at)) || null;
    const lights = lightsOut(plan, d), firstNight = timed.find((i) => i.night);
    const today = { done: checks.filter(done).length, of: checks.length };
    const t0 = d.getTime();
    return {
      key, date: d, m, items, done: today.done, of: today.of, pct: today.of ? today.done / today.of : 0,
      now: now_, next, missed: checks.filter((i) => i.at != null && i.end <= m && !i.done), left: checks.filter((i) => !i.done),
      lights, night: !!firstNight && m >= firstNight.at, late: !!lights && m >= lights.at + lights.later,
      streak: streak(plan, state, d, today),
      deadlines: plan.deadlines.filter((x) => !x.done && x.end >= t0).slice(0, 3).map((x) => ({ ...x, days: Math.round((x.t - t0) / DAY) })),
      switches: plan.switches.map((s) => ({ ...s, on: !!on[s.id] })),
    };
  }

  // ---------- words for Home and the bar ----------
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  const left = (it, m) => Math.max(1, Math.round(it.end - m));
  const leftWords = (n) => (n >= 90 ? `${Math.floor(n / 60)} h ${n % 60 ? `${n % 60} min` : ''}`.trim() : `${n} min`);
  const dayWords = (x) => (x.days < 0 && x.end >= x.t ? 'now' : x.days === 0 ? 'today' : x.days === 1 ? 'tomorrow' : `in ${x.days} days`);
  const lightsWords = (l) => (l ? `${clockAmPm(l.at)}${l.later ? `, or ${clockAmPm(l.at + l.later)} at the latest` : ''}` : '');

  root.fluentioPlan = {
    KEY, FOLDER, GOAL,
    readWeek, readLine, readDeadlines, readSleep, readHow, fromVault, current, day, status, lightsOut, streak, dayAt,
    load, save, check, remember, flip, switchesOn, placeOf, howFor,
    dayKey, dateOf, weekKey, isoWeek, daysIn, dateParts, clockAt, place, clock, clockAmPm, plural, left, leftWords, dayWords, lightsWords,
  };
  if (typeof module === 'object' && module.exports) module.exports = root.fluentioPlan;
})(typeof window === 'object' ? window : globalThis);
