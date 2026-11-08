// Your plan, from the pages in Schedule (schedule/). They're yours: none of a plan is in the site's code.
// Week has your days: a section for each day or set of days ("## Monday", "## Sunday to Thursday nights"), a line for
// each thing with its time, and minutes on what you check off ("- 4:30 Homework · 90 min"). A section like "## On game
// days" is a switch that changes those days. Classes has your school's days (Day 1, Day 2, …) and which Day a date is,
// Deadlines a line for each date, Sleep when it's lights out from when, and How to study a section for each kind of
// block, which Home and Schedule quote.
// The pages are in 'fluentio.schedule', and what you've checked off in 'fluentio.plan'. Both go with the rest of your
// progress (kit/progress.js), so every browser has the same plan and carries on from the same day. Schedule shows it
// all, Home says what's now and lists the day, and the bar shows what's now on every page.
// A plain script: Schedule, Home and the bar use window.fluentioPlan, and the tests require() it.
(function (root) {
  'use strict';
  const MIN = 60000, DAY = 86400000;
  const KEY = 'fluentio.plan', DOCS = 'fluentio.schedule', STATION = 'fluentio.station';
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

  // ---------- Week ----------
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

  // ---------- Deadlines and Sleep ----------
  // a date or a few at the start of some words, and what they're for: "Dec 12 Project due", "Feb 5/6 Exam", "Apr 28 – May 1 Trip",
  // "Nov 26–27 Thanksgiving" ({ t, end, what, two }, the days at midnight)
  function readDated(text, ref, year) {
    const a = dateParts(text);
    if (!a) return null;
    let rest = a.rest, b = null;
    const slash = /^\s*\/\s*(\d{1,2})\b/.exec(rest);
    if (slash) { b = { ...a, d: +slash[1] }; rest = rest.slice(slash[0].length); }
    const range = /^\s*(?:–|—|-|to)\s*/.exec(rest);
    if (range) {
      const more = rest.slice(range[0].length), whole = dateParts(more), day = /^(\d{1,2})\b(?:,?\s+(\d{4}))?/.exec(more);
      if (whole) { b = whole; rest = whole.rest; } else if (day) { b = { y: day[2] ? +day[2] : a.y, mo: a.mo, d: +day[1] }; rest = more.slice(day[0].length); }
    }
    const what = rest.replace(/^\s*,?\s*\d{4}\b/, '').replace(/^\s*[:–—-]\s*/, '').trim();
    const y = a.y ?? year ?? yearFor(a.mo, a.d, ref), t0 = new Date(y, a.mo, a.d).getTime();
    let t1 = b ? new Date(b.y ?? y, b.mo, b.d).getTime() : t0;
    if (t1 < t0) t1 = new Date(new Date(t1).getFullYear() + 1, b.mo, b.d).getTime();
    return { t: t0, end: t1, what, two: !!slash };
  }
  // (each deadline knows its line, so Schedule can check it off there)
  function readDeadlines(text, ref) {
    const out = [];
    let year = null;
    for (const [n, line] of String(text).split('\n').entries()) {
      const h = /^#{1,6}\s+.*?\b(\d{4})\b/.exec(line);
      if (h) { year = +h[1]; continue; }
      const li = /^\s*(?:[-*+]|\d+[.)])\s+(?:\[( |x|X)\]\s+)?(.*)$/.exec(line);
      if (!li) continue;
      let t = li[2].trim(), done = /x/i.test(li[1] || '');
      if (/^~~.*~~/.test(t)) { done = true; t = t.replace(/~~/g, ''); }
      if (/\((?:done|finished)\)\s*$/i.test(t)) { done = true; t = t.replace(/\s*\((?:done|finished)\)\s*$/i, ''); }
      const x = readDated(t, ref, year);
      if (x?.what) out.push({ ...x, done, line: n });
    }
    return out.sort((p, q) => p.t - q.t);
  }
  // a deadline's line checked off ("- [x] …") or not ("- [ ] …"), however it said so before
  function markDeadline(text, n, done) {
    const lines = String(text).split('\n'), m = /^(\s*(?:[-*+]|\d+[.)])\s+)(?:\[[ xX]\]\s+)?(.*)$/.exec(lines[n] ?? '');
    if (!m) return text;
    const rest = m[2].replace(/^~~(.*)~~/, '$1').replace(/\s*\((?:done|finished)\)\s*$/i, '');
    lines[n] = `${m[1]}[${done ? 'x' : ' '}] ${rest}`;
    return lines.join('\n');
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
  // ---------- Classes ----------
  // A section for each Day of your school's days ("## Day 1" … "## Day 10"), and a line for each class: "- 9:00–10:12
  // Biology · Room 204" (what comes after a · is where, and with whom). The Days go with the weekdays (Monday is Day 1 or
  // Day 6, Tuesday Day 2 or Day 7, …) and the weeks take turns, from what "## Rotation" says ("- Nov 9: Day 1"): a new line
  // there puts it right when the school changes it. "## No school" has days off ("- Nov 26–27 Thanksgiving"), and
  // "## Colors" a color for a class ("- Biology: teal").
  const COLORS = ['teal', 'blue', 'violet', 'purple', 'pink', 'red', 'orange', 'gold', 'olive', 'green', 'cyan', 'indigo', 'brown', 'gray'];
  // "Nov 9: Day 1", "Mon, Nov 9, 2026: Day 1", "Week of Nov 9: Days 1–5": { t, n }
  function anchorOf(text, ref, year) {
    const t = String(text).trim().replace(/^(?:the\s+)?week\s+of\s+/i, '').replace(/^[A-Za-z]{3,9}\.?,?\s+(?=[A-Za-z]{3,9}\.?\s+\d)/, '');
    const d = dateParts(t), n = d && /\bdays?\s*(\d{1,2})\b/i.exec(d.rest);
    return n && +n[1] > 0 ? { t: timeOf(d, ref, year), n: +n[1] } : null;
  }
  function readClasses(text, ref) {
    const days = {}, anchors = [], off = [], colors = {};
    let cur = null, year = null;
    for (const line of String(text).split('\n')) {
      const h = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
      if (h) {
        const t = h[2].replace(/[*_`]/g, '').trim(), n = /^day\s*(\d{1,2})$/i.exec(t), y = /\b(\d{4})\b/.exec(t);
        year = y ? +y[1] : null;
        cur = h[1].length === 1 ? null
          : n && +n[1] > 0 ? { kind: 'day', n: +n[1] }
            : /\b(no school|days? off|holidays?|breaks?|closed)\b/i.test(t) ? { kind: 'off' }
              : /\b(rotation|which day|cycle)\b/i.test(t) ? { kind: 'rotation' }
                : /\bcolou?rs?\b/i.test(t) ? { kind: 'colors' } : null;
        continue;
      }
      const li = cur && LIST.exec(line);
      if (!li) continue;
      const body = li[1].trim();
      if (cur.kind === 'day') { const x = readLine(body); if (x?.start && x.name) (days[cur.n] = days[cur.n] || []).push(x); }
      else if (cur.kind === 'off') { const x = readDated(body, ref, year); if (x) off.push({ t: x.t, end: x.end, what: x.what || 'No school' }); }
      else if (cur.kind === 'rotation') { const a = anchorOf(body, ref, year); if (a) anchors.push(a); }
      else { const m = /^(.+?)\s*[:–—-]\s*([a-z]+)\s*$/i.exec(body); if (m && COLORS.includes(m[2].toLowerCase())) colors[base(m[1])] = m[2].toLowerCase(); }
    }
    return { days, count: Math.max(0, ...Object.keys(days).map(Number)), anchors: anchors.sort((a, b) => a.t - b.t), off, colors };
  }
  const mondayOf = (t) => { const d = new Date(t); return addDays(new Date(d.getFullYear(), d.getMonth(), d.getDate()), -((d.getDay() + 6) % 7)).getTime(); };
  // which Day a date is: { n } on a school day (n is null while Rotation hasn't said), { off } on a day off, null at the
  // weekend or with no classes
  function rotationOf(cl, date) {
    if (!cl?.count) return null;
    const wd = date.getDay(), t = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    if (wd === 0 || wd === 6) return null;
    const off = cl.off.find((o) => o.t <= t && t <= o.end);
    if (off) return { n: null, off: off.what };
    const weeks = Math.ceil(cl.count / 5);
    if (weeks === 1) return { n: wd };
    if (!cl.anchors.length) return { n: null };
    // (from the last date Rotation names on or before this one, or else the first one after it)
    const a = [...cl.anchors].reverse().find((x) => x.t <= t) || cl.anchors[0];
    const k = Math.round((mondayOf(t) - mondayOf(a.t)) / (7 * DAY)), w = (((Math.floor((a.n - 1) / 5) + k) % weeks) + weeks) % weeks;
    return { n: w * 5 + wd };
  }
  const nameOfClass = (x) => x.name.split(' · ')[0].trim();
  // a Day's classes, as things on the day: { name, where (what came after the name), at, end, kind: 'class', color }
  function classItems(cl, n) {
    let after = null;
    return (cl?.days[n] || []).map((x) => {
      const at = place(x.start, after, false), end = x.end ? place(x.end, at, false) : at + (x.min || 45), name = nameOfClass(x);
      after = at;
      return { id: `${at}|${name.toLowerCase()}`, at, end, set: true, name, where: x.name.split(' · ').slice(1).join(' · '), min: 0, check: false, link: x.link, note: x.note, night: false, special: false, by: '', kind: 'class', n, color: cl.colors[base(name)] || '' };
    });
  }
  // something on the plan named like a class: "Lab: …" and Lab, "Study" and Study Hall
  const likeClass = (a, b) => { const x = base(a), y = base(b); return !!x && !!y && (x === y || y.startsWith(`${x} `) || x.startsWith(`${y} `)); };
  // Classes' page with a date's Day said, in "## Rotation" (put at the end when there isn't one): a line there for that week
  // gives way to it
  function setDayOf(text, date, n) {
    const lines = String(text).replace(/\s+$/, '').split('\n');
    const say = `- ${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}: Day ${n}`;
    const s = lines.findIndex((l) => /^#{2,6}\s+.*\b(rotation|which day|cycle)\b/i.test(l));
    if (s < 0) return `${lines.join('\n')}\n\n## Rotation\n${say}\n`;
    let e = lines.findIndex((l, i) => i > s && /^#{1,6}\s/.test(l));
    if (e < 0) e = lines.length;
    const week = mondayOf(date.getTime());
    for (let i = e - 1; i > s; i--) {
      const li = LIST.exec(lines[i]), a = li && anchorOf(li[1], date.getTime(), null);
      if (a && mondayOf(a.t) === week) { lines.splice(i, 1); e--; }
    }
    let at = e;
    while (at > s + 1 && !lines[at - 1].trim()) at--;
    lines.splice(at, 0, say);
    return `${lines.join('\n')}\n`;
  }

  // How to study: a section for each kind of block, quoted on Home and in Schedule
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

  // ---------- Schedule's pages ----------
  // 'fluentio.schedule' is { v: 1, docs: { id: { title, text, made, at } } }: each page's Markdown, when it was made (the
  // pages' order) and when it last changed. (So when two browsers changed the same page, kit/progress.js keeps the newer.)
  const ID = /^[a-z0-9][a-z0-9-]{0,63}$/;
  const idOf = (title) => String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'page';
  // a page's name: its first line when that's a "# heading", or the name it was made with
  function titleOf(id, d) {
    const first = /^\s*#\s+(.+?)\s*#*\s*$/m.exec(String(d?.text || '').split('\n').find((l) => l.trim()) || '');
    const t = (first ? first[1] : typeof d?.title === 'string' ? d.title : '').replace(/[*_`]/g, '').trim();
    return t || cap(id.replace(/-/g, ' '));
  }
  function loadDocs(read) {
    let s = null;
    try { s = read ? read(DOCS) : JSON.parse(root.localStorage.getItem(DOCS)); } catch {}
    const docs = {};
    if (plainObj(s?.docs)) for (const [id, d] of Object.entries(s.docs)) if (ID.test(id) && plainObj(d) && typeof d.text === 'string') docs[id] = d;
    return { v: 1, docs };
  }
  function saveDocs(state, write) {
    const out = { v: 1, docs: state.docs };
    try { if (write) write(DOCS, out); else root.localStorage.setItem(DOCS, JSON.stringify(out)); } catch {}
  }
  const listDocs = (state) => Object.entries(state.docs).map(([id, d]) => ({ id, title: titleOf(id, d), text: d.text, made: +d.made || 0, at: +d.at || 0 }))
    .sort((a, b) => a.made - b.made || a.id.localeCompare(b.id));
  function putDoc(state, id, text, now = Date.now()) {
    const was = plainObj(state.docs[id]) ? state.docs[id] : { made: now };
    state.docs[id] = { ...was, text: String(text), at: now };
    return state;
  }
  // a new page, after the others: its id (from its name, and a number when that one's taken)
  function newDoc(state, title, text, now = Date.now()) {
    const base = /^(new|today)$/.test(idOf(title)) ? `${idOf(title)}-page` : idOf(title);   // (#new and #today are Schedule's own)
    let id = base;
    for (let n = 2; state.docs[id]; n++) id = `${base}-${n}`;
    const made = Math.max(now, ...Object.values(state.docs).map((d) => (+d.made || 0) + 1));
    state.docs[id] = { title: String(title), text: text ?? `# ${title}\n\n`, made, at: now };
    return id;
  }
  const dropDoc = (state, id) => { delete state.docs[id]; return state; };
  // the pages a new schedule starts with: what each one is for, and how to write it
  const STARTER = [
    ['week', 'Week', '# Week\n\nA section for each day or set of days, and a line for each thing with its time. Minutes after a · mean it’s something to check off.\n\n## Weekdays\n- 7:30 Wake up, get ready\n- 8:00 School\n\n## Monday to Thursday\n- 4:00 Homework · 60 min\n- 6:00 Dinner\n- 7:00 Reading · 20 min\n- 7:30 Free\n\n## Friday\n- 4:00 Free afternoon\n\n## Weekends\n- 10:00 Practice · 45 min\n- 12:00 Lunch\n\n## Every night\n- 9:30 Phone away\n- 9:45 Read\n\n## On game days\n- 4:00 Game\n'],
    ['deadlines', 'Deadlines', '# Deadlines\n\nA line for each date. Check one off here when it’s done.\n\n- [ ] Dec 12 Project due\n'],
    ['sleep', 'Sleep', '# Sleep\n\nWhen it’s lights out, from when. Add a row to move it.\n\n| From | Lights out |\n| --- | --- |\n| {today} | 10:30 PM |\n\nFriday and Saturday nights: up to 30 min later.\n'],
    ['how-to-study', 'How to study', '# How to study\n\nA section for each kind of block, named the way it is in your week. Schedule and Home show it beside that block.\n\n## Reading\nTwenty pages, then three lines on what happened.\n'],
  ];
  function starter(state, now = Date.now()) {
    const today = new Date(now).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    STARTER.forEach(([id, title, text], i) => { if (!state.docs[id]) state.docs[id] = { title, text: text.replace('{today}', today), made: now + i, at: now }; });
    return state;
  }

  // ---------- the plan, from the pages ----------
  let cache = { raw: null, plan: null };
  function fromDocs(s) {
    const docs = listDocs(loadDocs(() => s));
    const find = (name) => docs.find((d) => d.id === name) || docs.find((d) => idOf(d.title) === name);
    const week = find('week');
    if (!week) return null;
    const when = (d) => (d && d.at > 1e12 ? d.at : Date.now());
    const ref = when(week), dl = find('deadlines'), sl = find('sleep'), how = find('how-to-study'), cl = find('classes');
    const sections = readWeek(week.text);
    const switches = [];
    for (const s of sections) if (s.kind === 'switch' && !switches.some((x) => x.id === s.id)) switches.push({ id: s.id, name: s.name, scope: s.scope, only: s.only });
    const classes = cl ? readClasses(cl.text, when(cl)) : null;
    return {
      ref, sections, switches,
      classes: classes?.count ? classes : null,
      deadlines: dl ? readDeadlines(dl.text, when(dl)) : [],
      sleep: sl ? readSleep(sl.text, when(sl)) : { rows: [], later: null },
      how: how ? readHow(how.text) : [],
      ids: { week: week.id, deadlines: dl?.id || '', sleep: sl?.id || '', how: how?.id || '', classes: cl?.id || '' },
      docs: docs.map(({ id, title }) => ({ id, title })),
    };
  }
  // the plan in this browser's Schedule (the same plan again while its pages haven't changed)
  function current(getRaw) {
    let raw = null;
    try { raw = getRaw ? getRaw() : root.localStorage.getItem(DOCS); } catch {}
    if (raw === cache.raw) return cache.plan;
    let plan = null;
    if (raw && raw.includes('"docs"')) try { plan = fromDocs(JSON.parse(raw)); } catch {}
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
  const SCHOOL = /^school\b/i;
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
    // your classes, on a school day whose Day is known: they take the place of the plan's School, and something with no
    // time named like one of them ("Lab: …", "Study: …") goes at that class's time. On a day off there's no School
    const rot = rotationOf(plan.classes, date);
    if (rot && (rot.off || rot.n)) {
      const cls = rot.n ? classItems(plan.classes, rot.n) : [];
      if (rot.off || cls.length) items = items.filter((i) => !(i.at != null && SCHOOL.test(i.name)));
      for (const c of cls) {
        const it = items.find((i) => i.at == null && !i.kind && likeClass(i.name, c.name));
        if (it) Object.assign(it, { at: c.at, end: c.end, set: true, kind: 'class', n: c.n, where: c.where, color: c.color, cls: c.name });
        else items.push(c);
      }
      // (what goes with a class you don't have that day waits for a day you do)
      const named = Object.values(plan.classes.days).flat().map(nameOfClass);
      items = items.filter((i) => i.at != null || i.check || !named.some((n) => likeClass(i.name, n)));
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
  // a switch for days named like a class ("On lab days" and a Lab period) is on by itself on that class's days
  function classSwitch(plan, s, date) {
    if (s.scope !== 'day' || !plan?.classes) return false;
    const n = rotationOf(plan.classes, date)?.n, w = base(s.name).replace(/\s+(day|night)$/, '');
    return !!n && (plan.classes.days[n] || []).some((x) => likeClass(w, nameOfClass(x)));
  }
  const switchesOn = (plan, state, date) => {
    const on = {}, d = state.days[dayKey(date)]?.on || {}, w = state.weeks[weekKey(date)]?.on || {};
    for (const s of plan?.switches || []) {
      const said = s.scope === 'day' ? d[s.id] : w[s.id];
      if (said === true || (said !== false && classSwitch(plan, s, date))) on[s.id] = true;
    }
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
    // (off on a day it's on by itself is kept as off)
    if (on) rec.on[id] = true; else if (classSwitch(plan, sw, date)) rec.on[id] = false; else delete rec.on[id];
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
    [/\bamc ?12\b.*\b(timed|test|set)\b/i, 'math/#amc12/test'], [/\bamc ?12\b/i, 'math/#amc12/learn'], [/\bamc\b.*\b(timed|test|set)\b/i, 'math/#amc10/test'], [/\bamc\b/i, 'math/#amc10/learn'],
    [/\bspanish\b|\bvocab/i, 'spanish/'], [/\bphysics\b/i, 'physics/'], [/\bscience\b/i, 'science/'], [/\bhistory\b/i, 'history/'], [/\bessays?\b|\benglish\b/i, 'english/'], [/\bgeograph/i, 'geography/'],
    [/\bschedule\b/i, 'schedule/#week'], [/\bjournal\b|\breview\b/i, 'station/#today'], [/\bwhiteboard\b|\bsketch\b/i, 'board/'],
  ];
  // a [[link]]'s page: one of Schedule's, or a note in Station
  function linked(plan, name) {
    const want = String(name).trim().toLowerCase(), doc = plan.docs.find((d) => d.id === want || d.title.toLowerCase() === want || d.id === idOf(want));
    if (doc) return `schedule/#${doc.id}`;
    try {
      const notes = JSON.parse(root.localStorage.getItem(STATION))?.notes, n = Array.isArray(notes) && notes.find((x) => typeof x?.path === 'string' && x.path.toLowerCase().replace(/\.md$/, '').split('/').pop() === want);
      if (n) return `station/#${n.path.replace(/\.md$/i, '')}`;
    } catch {}
    return '';
  }
  // where a thing on the plan is done: its own link, a page it names, or the page of the site it's about
  function placeOf(plan, it) {
    if (it.link) return { href: it.link, away: true };
    const to = it.note ? linked(plan, it.note) : '';
    if (to) return { href: to };
    const hit = PLACES.find(([re]) => re.test(it.name));
    return hit ? { href: hit[1] } : null;
  }
  // what How to study says about a block: the sentence about today ("Sunday: …", "Weeknights: …"), or its first
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
    return { name: h.name, text, href: `schedule/#${plan.ids.how}` };
  }
  function status(plan, state, now = Date.now()) {
    if (!plan) return null;
    const { d, m } = dayAt(now), key = dayKey(d), rec = state.days[key] || {}, on = switchesOn(plan, state, d);
    const items = day(plan, d, on), checks = items.filter((i) => i.check), done = (i) => !!rec.done?.[i.id];
    // (a class has nowhere to start, unless something of yours goes with it)
    for (const it of items) { it.done = it.check && done(it); it.place = it.kind === 'class' && !it.check ? null : placeOf(plan, it); it.how = it.check ? howFor(plan, it, d) : null; }
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
    KEY, DOCS, GOAL,
    readWeek, readLine, readDated, readDeadlines, markDeadline, readSleep, readHow, fromDocs, current, day, status, lightsOut, streak, dayAt,
    COLORS, readClasses, rotationOf, classItems, setDayOf, likeClass,
    load, save, check, remember, flip, switchesOn, placeOf, howFor, linked,
    loadDocs, saveDocs, listDocs, putDoc, newDoc, dropDoc, starter, titleOf, idOf,
    dayKey, dateOf, weekKey, isoWeek, daysIn, dateParts, clockAt, place, clock, clockAmPm, plural, left, leftWords, dayWords, lightsWords,
  };
  if (typeof module === 'object' && module.exports) module.exports = root.fluentioPlan;
})(typeof window === 'object' ? window : globalThis);
