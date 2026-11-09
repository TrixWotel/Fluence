// Schedule: your plan, a space of its own in the bar, laid out like Music: tabs at the top, a view's name big under them,
// and nothing boxed in. Week is the week by the hour, the way a school's schedule shows it, sized to fit the window down to
// the player so nothing's hidden and nothing scrolls: your classes on the Day they're on (from Classes), your own blocks,
// and what has set times (a lesson, School, a meal, the walk home), with deadlines at the top of their day and a line for
// now (free time and the night stay out of it). What's yours you check off; the rest crosses itself off once it's over.
// On the week the top row hides for the room (its key, ⌃B to start with, shows it; Keep leaves it), and a swipe to the side,
// like ← and →, goes a week on or back. Today is what's on now, how to start it, and the day in order with a circle to
// check each thing off. Classes,
// Deadlines, Sleep and the rest are pages: Markdown you can change (Edit), kept as you type.
// They're in this browser ('fluentio.schedule', kit/plan.js) and go with your progress to GitHub (kit/progress.js), so every
// browser has the same plan, and Home and the bar know it too.
// Links: #week (the calendar), #today, #pages, #<page> (#classes, #deadlines, …), #<page>/edit to change one, #new.
import { blocks, render, esc, linkParts } from '../station/md.js';

const f = window.fluentio, p = window.fluentioPlan, D = window.fluentioPlanDay, box = document.getElementById('sc');
const DAY = 86400000;

if (f && p && D && box) {
  const { el, svg, link, read, write } = f;
  const T = () => f.settings.scheduleTitle;
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const fmt = (d, o) => d.toLocaleDateString('en-US', o);
  const phone = matchMedia('(max-width: 760px)');
  const route = () => { const [id = '', mode = ''] = decodeURIComponent(location.hash.slice(1)).split('/'); return { id, mode }; };
  // flush keeps what's being typed; shift is the week showing (0 is this one) and picked its day on a phone; pl is the plan;
  // fitHour is how tall an hour of the week was the last time it was fitted to the window
  let flush = null, drawn = '', shift = 0, picked = '', pop = null, pl = null, fitHour = 0;
  // fresh: what a click just checked off or undid ({ key, on }), drawn crossing out (or back) once
  let fresh = null;
  // the top row (the tabs, the week's dates, Edit plan) is hidden on the week, for the room, and its key (Settings → Keys,
  // ⌃B to start with) shows it; Keep, on the row, leaves it there. This browser remembers Keep ('fluentio:schedule', not
  // part of your progress). slide: which way the week just went (a swipe, ← or →, or ‹ and ›)
  const ROW = 'fluentio:schedule', rowKey = () => f.key.meant(f.settings.keys?.scheduleBar || ''), keepRow = () => !!(read(ROW) || {}).keep;
  let rowShown = false, slide = 0;
  const rowOn = () => keepRow() || rowShown;
  function toggleRow(on = !rowOn()) {
    if (!on && keepRow()) write(ROW, { ...(read(ROW) || {}), keep: false });
    rowShown = on;
    draw();
  }
  const crossing = (key) => (fresh && fresh.key === key && f.moving() ? (fresh.on ? 'crossing' : 'uncrossing') : '');

  // ---------- the pages, laid out ----------
  // (a [[link]] goes to one of these pages, or a note in Station; a web address opens in a new tab)
  const ctx = (docs) => ({
    wiki: (inner) => {
      const { target, label } = linkParts(inner), to = p.linked({ docs }, target), words = esc(label || target);
      return to ? `<a class="wiki" href="${esc(link(to))}">${words}</a>` : `<span class="wiki missing" title="No page called ${esc(target)}">${words}</span>`;
    },
    link: (url, html) => (/^(https?:|mailto:)/i.test(url) ? `<a class="ext" href="${esc(url)}" target="_blank" rel="noopener">${html}</a>` : html),
    image: (src, alt) => esc(alt || ''),
    embed: (inner) => esc(linkParts(inner).target),
  });
  // a page's Markdown, without the heading that's its name; a box in a list ticks there
  function laidOut(doc, docs) {
    const bs = blocks(doc.text).filter((b, i) => !(i === 0 && b.kind === 'heading' && b.level === 1));
    const out = el('div', { className: 'sc-md' });
    out.innerHTML = bs.map((b) => render(doc.text, b, ctx(docs))).join('');
    out.addEventListener('change', (e) => {
      const at = +e.target.dataset?.box;
      if (!Number.isInteger(at) || !/^\[[ xX]\]/.test(doc.text.slice(at, at + 3))) return;
      keep(doc.id, `${doc.text.slice(0, at + 1)}${e.target.checked ? 'x' : ' '}${doc.text.slice(at + 2)}`);
    });
    return out;
  }
  // a page changed (kept in this browser; kit/progress.js takes it to GitHub)
  function keep(id, text) {
    const s = p.loadDocs(read);
    if (!s.docs[id]) return;
    p.putDoc(s, id, text);
    p.saveDocs(s, write);
    draw();
  }
  // a view's name, big, with a line under it (as Music has), and what it can do at the side
  const hero = (title, sub, ...more) => el('header', { className: 'sc-hero' }, el('div', {}, el('h1', {}, title), sub ? el('p', {}, sub) : null), el('span', { className: 'grow' }), ...more);
  const top = (title, ...more) => hero(title, '', ...more);
  const editBtn = (id, label = 'Edit') => el('a', { className: 'btn pill', href: `#${id}/edit` }, label);

  // ---------- the calendar ----------
  const ap = (m) => (Math.floor(m / 60) % 24 < 12 ? 'AM' : 'PM');
  const hourName = (m) => { const h = Math.floor(m / 60) % 24; return h === 12 ? 'Noon' : `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`; };
  const span = (a, b) => `${p.clock(a)}${ap(a) === ap(b) ? '' : ` ${ap(a)}`} – ${p.clockAmPm(b)}`;
  const short = (it) => D.short(it);
  const key = (name) => name.toLowerCase().split(/[:·,(]/)[0].trim();
  // a color for each class (Classes' "## Colors", or the next one along), and for anything else with set times that Colors
  // names (a lesson); School is gray, and something set that Colors doesn't name (a meal, the walk home) stays quiet
  const PALETTE = p.COLORS.filter((c) => c !== 'gray'), SCHOOL = /^school\b/i;
  let colors = {};
  function colorsFor(plan) {
    colors = { ...plan?.classes?.colors };
    let i = 0;
    for (const n of Object.keys(plan?.classes?.days || {}).sort((a, b) => a - b)) {
      for (const x of plan.classes.days[n]) {
        const k = key(x.name);
        if (!colors[k]) colors[k] = plan.classes.colors[k] || PALETTE[i++ % PALETTE.length];
      }
    }
  }
  const colorOf = (it, kind) => (it.kind === 'class' ? it.color || colors[key(it.cls || it.name)] || '' : kind === 'event' ? (SCHOOL.test(it.name) ? 'gray' : colors[key(it.name)] || '') : '');
  const kindOf = (it) => (it.check ? 'mine' : it.kind === 'class' ? 'class' : it.set && !it.steps ? (SCHOOL.test(it.name) || colors[key(it.name)] ? 'event' : 'quiet') : 'routine');

  // what a day holds: its things (done or not), its Day of the rotation, lights out, sleep, and what's due. What isn't
  // yours to check off (a class, a lesson, a meal) is crossed off once it's over
  function dayOf(date) {
    const k = p.dayKey(date), rec = pl.state.days[k] || {}, t = date.getTime();
    const items = p.day(pl.plan, date, p.switchesOn(pl.plan, pl.state, date));
    for (const it of items) {
      it.done = it.check && !!rec.done?.[it.id];
      it.over = !it.check && it.at != null && it.end != null && (k < pl.st.key || (k === pl.st.key && it.end <= pl.st.m));
    }
    // (sleep: from lights out to the first thing the next morning; the week shows where it starts)
    const lights = p.lightsOut(pl.plan, date);
    let sleep = null;
    if (lights) {
      const next = addDays(date, 1), first = p.day(pl.plan, next, p.switchesOn(pl.plan, pl.state, next)).find((x) => x.at != null && !x.night);
      sleep = { id: 'sleep', name: 'Sleep', at: lights.at, end: lights.at + 30, wake: first ? 1440 + first.at : null, set: true, check: false, min: 0, sleep: true, over: k < pl.st.key };
    }
    return { date, key: k, items, sleep, rot: p.rotationOf(pl.plan.classes, date), lights, dls: pl.plan.deadlines.filter((x) => x.t <= t && t <= x.end), today: k === pl.st.key, past: k < pl.st.key };
  }
  // what's shown: classes, what you check off, what has set times (a lesson, School, a meal, the walk home), the night's
  // steps as one, and sleep. Free time and a line with neither an end nor minutes aren't, and in the week neither is
  // anything else under a quarter of an hour
  const worth = (it) => it.check || it.kind === 'class' || it.set;
  function blocksOf(d, { day = false } = {}) {
    const out = [];
    for (const it of d.items) {
      if (it.at == null) continue;
      if (it.night && !it.check) {
        const last = out.at(-1);
        if (last?.steps && it.at <= last.end + 1) { last.steps.push(it); last.end = Math.max(last.end, it.end); last.over = last.steps.every((s) => s.over); continue; }
        out.push({ ...it, id: `night|${it.id}`, name: 'Night routine', min: 0, steps: [it] });
      } else if (worth(it) && (day || it.end - it.at >= 15)) out.push(it);
    }
    if (d.sleep) out.push(d.sleep);
    return out;
  }
  // things at the same time go side by side
  function lanes(bs) {
    const out = [];
    let group = [], ends = [], until = -Infinity;
    const close = () => { for (const o of group) o.of = ends.length; group = []; ends = []; };
    for (const it of [...bs].sort((a, b) => a.at - b.at || b.end - a.end)) {
      const end = Math.max(it.end, it.at + 1);
      if (it.at >= until) { close(); until = -Infinity; }
      let l = ends.findIndex((e) => e <= it.at);
      if (l < 0) { l = ends.length; ends.push(end); } else ends[l] = end;
      const o = { it, lane: l, of: 1 };
      group.push(o);
      out.push(o);
      until = Math.max(until, end);
    }
    close();
    return out;
  }
  // the hours shown: from the half hour before the first thing to the half hour after the last, with any stretch of an
  // hour or more that nothing on any day falls in (the evening before a late lights out) folded away
  const GAP = 22;
  function bounds(days) {
    const spans = days.flatMap((d) => blocksOf(d).map((it) => [it.at, Math.max(it.end, it.at + 1)])).sort((a, b) => a[0] - b[0]);
    if (!spans.length) return { lo: 8 * 60, hi: 20 * 60, folds: [] };
    const lo = Math.floor(spans[0][0] / 30) * 30, folds = [];
    let end = spans[0][1];
    for (const [a, b] of spans) {
      const from = Math.ceil(end / 30) * 30, to = Math.floor(a / 30) * 30;
      if (to - from >= 60) folds.push({ from, to });
      end = Math.max(end, b);
    }
    return { lo, hi: Math.max(lo + 4 * 60, Math.ceil(end / 30) * 30), folds };
  }
  // where a time is: hours down from the top (the page sets how tall an hour is, --hour) and a fold's height for each fold
  // above it; a time in a fold is in its middle
  const pos = (h, g = 0) => `calc(var(--hour) * ${+h.toFixed(4)}${g ? ` + ${+(g * GAP).toFixed(2)}px` : ''})`;
  function scale({ lo, hi, folds }) {
    const segs = [];
    let from = lo, h = 0;
    folds.forEach((x, i) => { segs.push({ from, to: x.from, h, g: i }); h += (x.from - from) / 60; from = x.to; });
    segs.push({ from, to: hi, h, g: folds.length });
    const y = (m) => {
      const s = segs.find((x) => m <= x.to) || segs.at(-1);
      return m >= s.from ? pos(s.h + (Math.min(m, s.to) - s.from) / 60, s.g) : pos(s.h, s.g - 0.5);
    };
    return { segs, y, hours: h + (hi - from) / 60, folds: folds.length };
  }
  // a block's size, from how tall it is: tiny shows its name, small its name and when it starts on a line, the rest its
  // name over when it starts (bare, on a small window, is just the block: its card says the rest)
  const sizeOf = (min, hour) => { const h = (min / 60) * hour - 2; return h < 9.5 ? 'bare' : h < 17 ? 'tiny' : h < 42 ? 'small' : h >= 64 ? 'tall' : ''; };
  // (an hour is 60 pixels, or in the week as tall as fits the window: fill)
  function grid(days, { hour = 60, fill = false, ask = '' } = {}) {
    const b = bounds(days), sc = scale(b);
    const marks = sc.segs.flatMap((s) => { const out = []; for (let m = Math.ceil(s.from / 60) * 60; m < s.to; m += 60) out.push(m); return out; });
    const folds = b.folds.map((x, i) => pos(sc.segs[i + 1].h, i));
    const axis = el('div', { className: 'cal-hours', 'aria-hidden': 'true' },
      marks.map((m) => el('span', { className: m === b.lo ? 'first' : null, style: `top:${sc.y(m)}` }, hourName(m))),
      folds.map((top) => el('span', { className: 'fold', style: `top:${top}` }, '⋯')));
    const allDay = days.some((d) => d.dls.length || d.rot?.off || d.items.some((it) => it.at == null && it.check));
    return el('div', { className: `cal${fill ? ' fill' : ''}${slide && days[0]?.date && f.moving() ? ` slide-${slide > 0 ? 'next' : 'prev'}` : ''}`, style: `--cols:${days.length};--hour:${hour}px;--gap:${GAP}px` },
      el('div', { className: 'cal-head' }, el('span', { className: 'cal-corner' }, fill && !rowOn() ? el('button', { type: 'button', className: 'row-show', title: `Show the top row${rowKey() ? ` (${f.key.shown(rowKey())})` : ''}`, 'aria-label': 'Show the top row', onclick: () => toggleRow(true) }, rowKey() ? f.key.shown(rowKey()) : '···') : null), ...days.map(head)),
      allDay ? el('div', { className: 'cal-all' }, el('span', {}), ...days.map(dueOf)) : null,
      el('div', { className: 'cal-body', style: `height:${pos(sc.hours, sc.folds)}`, 'data-hours': String(sc.hours), 'data-folds': String(sc.folds) }, axis, ...days.map((d) => column(d, sc.y, b, marks, folds, hour, ask))));
  }
  // the week fills the window down to the player: an hour as tall as fits, 34 to 72 pixels (on a window too small for
  // that the page scrolls as a whole), and each block shows what fits on it
  function fitWeek() {
    const cal = box.querySelector('.cal.fill'), body = cal?.querySelector('.cal-body');
    if (!body) return;
    const px = (x, k) => parseFloat(getComputedStyle(x)[k]) || 0;
    let top = 0;   // (where it starts on the page, whatever's moving in)
    for (let x = body; x; x = x.offsetParent) top += x.offsetTop;
    const room = innerHeight - top - px(document.body, 'paddingBottom') - px(box.closest('main') || box, 'paddingBottom') - +body.dataset.folds * GAP;
    fitHour = Math.min(72, Math.max(34, Math.floor((room / +body.dataset.hours) * 10) / 10));
    cal.style.setProperty('--hour', `${fitHour}px`);
    for (const b of cal.querySelectorAll('.cal-b')) {
      b.classList.remove('bare', 'tiny', 'small', 'tall');
      const s = sizeOf(+b.dataset.min, fitHour);
      if (s) b.classList.add(s);
    }
  }
  // a day's head: the day, centered over it. On a school day a click on it says which Day of the rotation it is, to put
  // the weeks right (its Day is in its title, not on it)
  function head(d) {
    const rot = d.rot, school = !!d.date && !!rot && !rot.off && (pl?.plan.classes?.count || 0) > 5;
    return el(school ? 'button' : 'div', {
      type: school ? 'button' : null, className: `cal-dh${d.today ? ' today' : ''}`,
      title: d.date ? `${fmt(d.date, { weekday: 'long', month: 'long', day: 'numeric' })}${rot?.n ? `, Day ${rot.n}` : ''}${rot?.off ? `: ${rot.off}` : ''}${school ? '. Click to change which Day it is' : ''}` : null,
      onclick: school ? (e) => askDay(d, e.currentTarget) : null,
    }, d.date ? [el('span', { className: 'wd' }, fmt(d.date, { weekday: 'short' })), el('span', { className: 'dn' }, String(d.date.getDate()))] : el('span', { className: 'dn label' }, d.label));
  }
  // a click checks off what's yours, and again undoes it; a right-click (or the menu key) has its card
  const CLICK = 'Click to check it off, again to undo. Right-click for more';
  const more = (fn) => (e) => { e.preventDefault(); fn(e.currentTarget); };
  // what's due that day, a day off, and something of yours with no time
  function dueOf(d) {
    const chips = [];
    if (d.rot?.off) chips.push(el('span', { className: 'cal-chip off', title: d.rot.off }, el('span', {}, d.rot.off)));
    for (const x of d.dls) chips.push(x.yearly
      ? el('button', { type: 'button', className: 'cal-chip day', title: x.what, onclick: (e) => showDue(x, e.currentTarget), oncontextmenu: more((at) => showDue(x, at)) }, el('span', {}, x.what))
      : el('button', { type: 'button', className: ['cal-chip dl', x.done ? 'done' : '', crossing(`dl|${x.line}`)].filter(Boolean).join(' '), 'aria-pressed': String(!!x.done), title: `${x.what}. ${CLICK}`, onclick: () => tick(x, !x.done), oncontextmenu: more((at) => showDue(x, at)) }, el('span', {}, x.what)));
    for (const it of d.items.filter((i) => i.at == null && i.check)) chips.push(el('button', { type: 'button', className: ['cal-chip mine', it.done ? 'done' : '', crossing(`${d.key}|${it.id}`)].filter(Boolean).join(' '), 'aria-pressed': String(!!it.done), title: `${it.name}. ${CLICK}`, onclick: () => mark(d, it, !it.done), oncontextmenu: more((at) => show(d, it, at)) }, el('span', {}, short(it))));
    return el('div', { className: `cal-ad${d.today ? ' today' : ''}` }, chips);
  }
  function column(d, y, b, marks, folds, hour, ask) {
    const col = el('div', { className: `cal-col${d.today ? ' today' : ''}` },
      marks.map((m) => el('i', { className: 'cal-hl', style: `top:${y(m)}` })),
      folds.map((top) => el('i', { className: 'cal-fold', style: `top:${top}` })));
    for (const o of lanes(blocksOf(d))) col.append(block(d, o, y, hour, ask === d.key));
    // (now: a line under the blocks, so it never runs through one, and a dot at the edge; the block on now is lit)
    if (d.today && pl && pl.st.m >= b.lo && pl.st.m <= b.hi) col.append(el('div', { className: 'cal-now', style: `top:${y(pl.st.m)}` }), el('div', { className: 'cal-dot', style: `top:${y(pl.st.m)}`, title: `Now, ${p.clockAmPm(pl.st.m)}` }));
    return col;
  }
  // a block: a class in its color, something of yours, something set (a lesson, School), and quieter, a meal, the walk
  // home, the night and sleep. Just its name and when it starts; its card has the rest. A click checks off what's yours
  // (again undoes it) and opens the card of anything else. Until Classes says which Day it is, School asks, since your
  // classes take its place
  function block(d, { it, lane, of }, y, hour, ask) {
    const kind = it.sleep ? 'sleep' : kindOf(it), min = it.end - it.at, size = sizeOf(min, hour), end = it.sleep ? it.wake ?? it.end : it.end;
    // (School asks even once it's over, and isn't crossed off while it does, so the question reads plainly)
    const now = d.today && pl && pl.st.m >= it.at && pl.st.m < end, asking = ask && SCHOOL.test(it.name) && !!d.date, crossed = it.done || (it.over && !asking);
    const task = it.check && !!d.date, act = () => (task ? mark(d, it, !it.done) : show(d, it, b));
    const b = el('div', {
      className: ['cal-b', kind, size, crossed ? 'done' : '', now ? 'now' : '', asking ? 'asking' : '', crossing(`${d.key}|${it.id}`)].filter(Boolean).join(' '),
      style: `top:${y(it.at)};height:max(4px, ${pos(min / 60)} - 2px);--lane:${lane};--of:${of}`,
      role: asking ? 'group' : 'button', tabIndex: asking ? null : 0, 'data-c': colorOf(it, kind) || null, 'data-min': String(min),
      'aria-pressed': task ? String(!!it.done) : null, title: task ? CLICK : null,
      'aria-label': `${it.steps ? 'Night routine' : it.name}, ${span(it.at, end)}${it.where ? `, ${it.where}` : ''}${it.done ? ', checked off' : crossed ? ', over' : ''}`,
      onclick: asking ? null : act,
      oncontextmenu: asking ? null : more(() => show(d, it, b)),
      onkeydown: asking ? null : (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target === b) { e.preventDefault(); act(); } },
    },
      el('b', {}, el('span', {}, it.steps ? 'Night routine' : short(it))),
      el('small', {}, it.sleep && it.wake != null ? `until ${p.clock(it.wake)}` : p.clock(it.at)),
      asking ? el('div', { className: 'cal-ask' }, el('p', {}, `Which Day is ${fmt(d.date, { weekday: 'long' })}?`),
        el('div', {}, daysFor(d.date).map((n) => el('button', { type: 'button', className: 'btn', onclick: () => setDay(d.date, n) }, `Day ${n}`))),
        el('p', { className: 'why' }, 'Pick it and your classes take School’s place.')) : null);
    return b;
  }
  // checking something off on its day (today's the way Home does it)
  function mark(d, it, on) {
    fresh = { key: `${d.key}|${it.id}`, on };
    if (d.today) { D.markDone(it, on); return; }
    p.check(pl.state, d.key, it.id, on);
    p.save(pl.state, write);
    dispatchEvent(new CustomEvent('fluence:plan'));
  }

  // ---------- a card about a block, a deadline, or a Day ----------
  function closePop() { pop?.remove(); pop = null; }
  function popAt(anchor, title, ...kids) {
    const r = anchor.getBoundingClientRect();   // (before the card it may be in goes)
    closePop();
    pop = el('div', { className: 'cal-pop', role: 'dialog', 'aria-label': title },
      el('div', { className: 'pop-top' }, el('b', {}, title), el('button', { type: 'button', className: 'pop-x', 'aria-label': 'Close', title: 'Close', onclick: closePop }, svg('x'))), ...kids);
    document.body.append(pop);
    // (beside what was clicked, on the side there's room; at the foot of the screen on a phone)
    if (phone.matches) pop.classList.add('sheet');
    else {
      const w = pop.offsetWidth, h = pop.offsetHeight;
      let x = r.right + 10;
      if (x + w > innerWidth - 10) x = r.left - w - 10;
      if (x < 10) x = Math.min(Math.max(10, r.left), innerWidth - w - 10);
      pop.style.left = `${x}px`;
      pop.style.top = `${Math.min(Math.max(10, r.top), innerHeight - h - 10)}px`;
    }
    pop.querySelector('.pop-act .btn, .pop-x')?.focus({ preventScroll: true });
  }
  function show(d, it, anchor) {
    const how = it.check && d.date ? p.howFor(pl.plan, it, d.date) : null, place = (it.kind === 'class' && !it.check) || it.steps || it.sleep ? null : p.placeOf(pl.plan, it);
    const note = it.name.includes(': ') && !(it.kind === 'class' && it.check) ? it.name.slice(it.name.indexOf(': ') + 2) : '', end = it.sleep ? it.wake ?? it.end : it.end;
    popAt(anchor, it.steps ? 'Night routine' : short(it),
      el('p', { className: 'pop-when' }, [d.date ? fmt(d.date, { weekday: 'long', month: 'short', day: 'numeric' }) : d.label, it.at != null ? span(it.at, end) : '', it.min ? `${it.min} min` : it.sleep && it.wake != null ? p.leftWords(it.wake - it.at) : ''].filter(Boolean).join(' · ')),
      it.kind === 'class' ? el('p', {}, [d.date ? `Day ${it.n}` : '', it.where].filter(Boolean).join(' · ')) : null,
      note && !it.steps ? el('p', {}, note) : null,
      it.steps ? el('ol', { className: 'pop-steps' }, it.steps.map((s) => el('li', {}, el('time', {}, p.clock(s.at)), s.min ? `${s.name} · ${s.min} min` : s.name))) : null,
      it.sleep ? el('p', {}, 'From lights out to the first thing the next morning. ', pl.plan.ids.sleep ? el('a', { href: `#${pl.plan.ids.sleep}` }, 'Sleep') : null) : null,
      how ? el('p', { className: 'pop-how' }, el('b', {}, `${how.name}: `), how.text, ' ', el('a', { href: `#${pl.plan.ids.how}` }, 'More')) : null,
      (it.check && d.date) || place ? el('div', { className: 'pop-act' },
        place ? el('a', { className: 'btn primary', href: place.away ? place.href : link(place.href), target: place.away ? '_blank' : null, rel: place.away ? 'noopener' : null }, `Start ${short(it)}`) : null,
        it.check && d.date ? el('button', { type: 'button', className: `btn${place ? '' : ' primary'}`, onclick: () => { closePop(); mark(d, it, !it.done); } }, it.done ? 'Not done after all' : 'Check it off') : null) : null);
  }
  // (Nov 13, Feb 5/6, Apr 28 – May 1, with the year when it isn't this one; and how soon)
  const md = (t) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const t0 = () => (pl?.st.date || new Date(new Date().setHours(0, 0, 0, 0))).getTime();
  function dates(x) {
    const a = new Date(x.t), b = new Date(x.end), y = b.getFullYear() === new Date(t0()).getFullYear() ? '' : `, ${b.getFullYear()}`;
    if (x.end <= x.t) return `${md(x.t)}${y}`;
    if (x.two) return `${md(x.t)}/${b.getDate()}${y}`;
    return `${md(x.t)} – ${a.getMonth() === b.getMonth() ? b.getDate() : md(x.end)}${y}`;
  }
  function when(x) {
    if (x.done) return 'Done';
    const n = Math.round((x.t - t0()) / DAY);
    if (n < 0) return x.end >= t0() ? 'Now' : `${-n} ${n === -1 ? 'day' : 'days'} ago`;
    return n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : `In ${n} days`;
  }
  function tick(x, done) {
    fresh = { key: `dl|${x.line}`, on: done };
    const id = pl.plan.ids.deadlines, s = p.loadDocs(read);
    if (s.docs[id]) keep(id, p.markDeadline(s.docs[id].text, x.line, done));
  }
  function showDue(x, anchor) {
    popAt(anchor, x.what,
      el('p', { className: 'pop-when' }, `${dates(x)} · ${when(x)}`),
      x.yearly ? el('p', {}, 'Every year.') : null,
      el('div', { className: 'pop-act' },
        x.yearly ? null : el('button', { type: 'button', className: 'btn primary', onclick: () => { closePop(); tick(x, !x.done); } }, x.done ? 'Not done after all' : 'Check it off'),
        el('a', { className: `btn${x.yearly ? ' primary' : ''}`, href: `#${pl.plan.ids.deadlines}` }, 'All deadlines')));
  }
  // which Day a date is: the weekday's Days to choose from, and the weeks around it follow
  const daysFor = (date) => Array.from({ length: Math.ceil(pl.plan.classes.count / 5) }, (_, i) => date.getDay() + 5 * i);
  function setDay(date, n) {
    const id = pl.plan.ids.classes, s = p.loadDocs(read);
    if (s.docs[id]) keep(id, p.setDayOf(s.docs[id].text, date, n));
  }
  function askDay(d, anchor) {
    popAt(anchor, `Which Day is ${fmt(d.date, { weekday: 'long', month: 'short', day: 'numeric' })}?`,
      el('p', {}, 'Your school’s Days go with the weekdays and the weeks take turns, so the weeks before and after follow.'),
      el('div', { className: 'pop-act' }, daysFor(d.date).map((n) => el('button', { type: 'button', className: `btn${d.rot?.n === n ? ' primary' : ''}`, onclick: () => { closePop(); setDay(d.date, n); } }, `Day ${n}`))));
  }
  // (until Classes says which Day a date is, the calendar asks, about the first school day showing; the week asks on
  // that day's School)
  const asked = (dates) => {
    const cl = pl?.plan.classes, unknown = (d) => p.rotationOf(cl, d)?.n === null && !p.rotationOf(cl, d).off;
    if (!cl || cl.anchors.length || cl.count <= 5) return null;
    return dates.find((d) => unknown(d) && d.getTime() >= t0()) || dates.find(unknown) || null;
  };
  function askBanner(dates) {
    const date = asked(dates);
    if (!date) return null;
    return el('div', { className: 'sc-ask', role: 'group', 'aria-label': 'Which Day is it' },
      el('span', {}, el('b', {}, `Which Day is ${fmt(date, { weekday: 'long', month: 'short', day: 'numeric' })}? `), 'Pick it and your classes take School’s place.'),
      daysFor(date).map((n) => el('button', { type: 'button', className: 'btn', onclick: () => setDay(date, n) }, `Day ${n}`)));
  }

  // ---------- Today: what's on now, then the day in order ----------
  function today(docs) {
    if (!pl) return empty(docs);
    const st = pl.st, w = D.words(pl), it = st.now?.check && !st.now.done ? st.now : null, d = dayOf(st.date);
    if (p.remember(pl.state, st)) p.save(pl.state, write);
    const said = d.rot?.n ? `Day ${d.rot.n}` : d.rot?.off || '';
    const meta = [st.of ? `${st.done} of ${st.of} checked off` : '', st.streak ? `${st.streak} ${st.streak === 1 ? 'day' : 'days'} in a row` : '', st.lights ? `lights out by ${p.lightsWords(st.lights)}` : ''].filter(Boolean).join(' · ');
    // (in the evening, what tomorrow holds)
    let tomorrow = null;
    if (st.m >= 18 * 60) {
      const next = addDays(st.date, 1), its = p.day(pl.plan, next, p.switchesOn(pl.plan, pl.state, next)).filter((x) => x.check), rot = p.rotationOf(pl.plan.classes, next);
      if (its.length) tomorrow = el('p', { className: 'sc-later' }, el('b', {}, `Tomorrow, ${fmt(next, { weekday: 'long' })}${rot?.n ? ` (Day ${rot.n})` : ''}: `), its.map((x) => `${short(x)}${x.at != null ? ` ${p.clock(x.at)}` : ''}`).join(', '), '.');
    }
    return [
      hero('Today', `${fmt(st.date, { weekday: 'long', month: 'long', day: 'numeric' })}${said ? ` · ${said}` : ''}`),
      askBanner(Array.from({ length: 7 }, (_, i) => addDays(st.date, i))),
      el('section', { className: 'sc-now', 'aria-label': 'Now' },
        el('p', { className: 'sc-say' }, w ? `${w.say}${w.ask && !it ? ` ${w.ask}` : ''}` : st.items.length ? 'That’s all on your plan today.' : 'Nothing on your plan today.'),
        it ? el('div', { className: 'sc-actions' },
          it.place
            ? el('a', { className: 'btn primary pill', href: D.hrefOf(it), target: it.place.away ? '_blank' : null, rel: it.place.away ? 'noopener' : null }, `Start ${short(it)}`)
            : el('button', { type: 'button', className: 'btn primary pill', onclick: () => D.markDone(it, true) }, `Check off ${short(it)}`),
          it.how ? el('p', { className: 'sc-how' }, el('b', {}, `${it.how.name}:`), ` ${it.how.text}`) : null) : null,
        meta ? el('p', { className: 'sc-meta' }, meta[0].toUpperCase() + meta.slice(1)) : null),
      agenda(d),
      st.switches.length ? el('div', { className: 'sc-switches', role: 'group', 'aria-label': 'Changes to your plan' }, st.switches.map((s) => el('button', { type: 'button', 'aria-pressed': String(s.on), title: s.scope === 'week' ? `${s.name}, for this week` : `${s.name}, for today`, onclick: () => D.flipSwitch(s, !s.on) }, s.name))) : null,
      tomorrow,
    ];
  }
  // the day in order: classes, your own blocks with a circle to check each off, what has set times (a lesson, a meal, the
  // walk home), the night as one, and sleep (free time is left out). What's over is quieter, and crossed off unless it
  // was yours to check off; what's on now is lit. A click on one of yours checks it off too (again undoes it), and a
  // right-click has its card
  function agenda(d) {
    const its = [...d.items.filter((it) => it.at == null && it.check), ...blocksOf(d, { day: true })], m = pl.st.m;
    const row = (it) => {
      const end = it.sleep ? it.wake ?? it.end : it.end, now = it.at != null && m >= it.at && m < end, over = it.at != null && end <= m;
      const sub = it.steps ? it.steps.map(short).join(', ') : it.sleep ? (it.wake != null ? `until ${p.clockAmPm(it.wake)}` : '') : it.kind === 'class' && !it.check ? [it.where ? it.where.split(' · ').pop() : '', `until ${p.clock(it.end)}`].filter(Boolean).join(' · ') : it.check ? `${it.min} min` : `until ${p.clockAmPm(it.end)}`;
      return el('li', { className: ['ag-row', now ? 'now' : '', over && !now ? 'over' : '', it.done || (over && !it.check) ? 'done' : '', crossing(`${d.key}|${it.id}`)].filter(Boolean).join(' '), 'data-c': colorOf(it, kindOf(it)) || null },
        el('time', {}, it.at == null ? 'Any time' : p.clockAmPm(it.at)),
        el('button', { type: 'button', className: 'ag-name', title: it.check ? CLICK : null, onclick: (e) => (it.check ? mark(d, it, !it.done) : show(d, it, e.currentTarget)), oncontextmenu: more((at) => show(d, it, at)) }, el('b', {}, el('span', {}, it.steps ? 'Night routine' : short(it))), el('small', {}, sub)),
        it.check ? el('button', { type: 'button', className: 'ag-ck', 'aria-pressed': String(!!it.done), 'aria-label': `${it.name}: ${it.done ? 'checked off' : 'not checked off'}`, title: it.done ? 'Checked off. Click to undo' : 'Check it off', onclick: () => mark(d, it, !it.done) }, svg('check')) : el('span', {}));
    };
    return its.length ? el('ol', { className: 'sc-agenda', 'aria-label': 'Today in order' }, its.map(row)) : null;
  }
  function empty(docs) {
    const start = () => {
      const s = p.loadDocs(read);
      p.starter(s);
      p.saveDocs(s, write);
      location.hash = `${p.current()?.ids.week || 'week'}/edit`;
    };
    return [el('div', { className: 'sc-empty' },
      el('h2', {}, docs.length ? 'There’s no Week page yet' : `Your ${T()} is empty`),
      el('p', {}, 'A Week page has your days: a section for each day, and a line for each thing with its time. With minutes after it, it’s something to check off, here and on Home.'),
      el('p', {}, docs.length ? 'Start one with a few things in it, and change them to fit your days.' : 'Start with a week, deadlines, lights out and how to study, with a few things in each, and change them to fit your days.'),
      el('button', { type: 'button', className: 'btn primary', onclick: start }, docs.length ? 'Start a week' : 'Start my schedule'))];
  }

  // ---------- Week: the week by the hour (on a phone, a day of it at a time) ----------
  function week(doc) {
    if (!pl) return [top(doc.title, editBtn(doc.id)), laidOut(doc, [])];
    const first = addDays(pl.st.date, -pl.st.date.getDay() + shift * 7), dates7 = Array.from({ length: 7 }, (_, i) => addDays(first, i)), keys = dates7.map(p.dayKey);
    const sel = dates7[keys.indexOf(picked)] || (shift === 0 ? pl.st.date : dates7[1]);
    const last = dates7[6], range = `${md(first)} – ${last.getMonth() === first.getMonth() ? last.getDate() : md(last)}${last.getFullYear() === new Date(t0()).getFullYear() ? '' : `, ${last.getFullYear()}`}`;
    const step = (n, label) => el('button', { type: 'button', className: 'sc-step', 'aria-label': label, title: `${label} (${n < 0 ? '←' : '→'})`, onclick: () => go(n) }, n < 0 ? '‹' : '›');
    const shown = phone.matches ? [sel] : dates7, ask = asked(shown);
    return [
      // (beside the tabs, so the week has the room: its dates and Days, the way to the weeks around it, and Edit)
      el('div', { className: 'sc-tools' },
        el('p', { className: 'sc-range' }, el('b', {}, range)),
        el('div', { className: 'sc-nav' }, step(-1, 'The week before'), shift ? el('button', { type: 'button', className: 'btn pill', onclick: () => { shift = 0; picked = ''; draw(); } }, 'This week') : null, step(1, 'The week after')),
        editBtn(doc.id, 'Edit plan'),
        phone.matches ? null : el('button', { type: 'button', className: 'sc-keep', 'aria-pressed': String(keepRow()), title: keepRow() ? 'Kept here. Click to hide it again (its key shows it)' : `Keep this row here${rowKey() ? ` (${f.key.shown(rowKey())} shows and hides it)` : ''}`, onclick: () => { write(ROW, { ...(read(ROW) || {}), keep: !keepRow() }); rowShown = true; draw(); } }, svg('eye'), 'Keep')),
      phone.matches ? el('div', { className: 'sc-days', role: 'tablist', 'aria-label': 'Days' }, dates7.map((d, i) => el('button', {
        type: 'button', role: 'tab', 'aria-selected': String(keys[i] === p.dayKey(sel)), className: keys[i] === pl.st.key ? 'today' : '',
        title: fmt(d, { weekday: 'long', month: 'long', day: 'numeric' }), onclick: () => { picked = keys[i]; draw(); },
      }, el('b', {}, fmt(d, { weekday: 'short' })), el('span', {}, String(d.getDate()))))) : null,
      grid(shown.map(dayOf), { hour: phone.matches ? 60 : fitHour || 52, fill: !phone.matches, ask: ask ? p.dayKey(ask) : '' }),
    ];
  }
  function go(n) {
    const sel = picked ? p.dateOf(picked) : null;
    shift += n; slide = n; picked = phone.matches && sel ? p.dayKey(addDays(sel, 7 * n)) : '';
    draw();
  }

  // ---------- Classes: your school's days, the way the school shows them ----------
  function classes(doc, docs) {
    const cl = pl?.plan.classes;
    if (!cl) return [top(doc.title, editBtn(doc.id)), laidOut(doc, docs)];
    const now = p.rotationOf(cl, pl.st.date), rows = [];
    for (let w = 0; w < Math.ceil(cl.count / 5); w++) {
      const days = [1, 2, 3, 4, 5].map((i) => w * 5 + i).filter((n) => n <= cl.count)
        .map((n) => ({ label: `Day ${n}`, key: `day-${n}`, items: p.classItems(cl, n), dls: [], rot: null, lights: null, today: now?.n === n, past: false }));
      rows.push(el('div', { className: 'sc-wide' }, grid(days, { hour: 60 })));
    }
    // (and the rest of the page: what it says first, Rotation, No school, Colors)
    let skip = false;
    const rest = doc.text.split('\n').filter((l) => { const h = /^#{1,6}\s+(.+?)\s*#*\s*$/.exec(l); if (h) skip = /^day\s*\d{1,2}$/i.test(h[1].replace(/[*_`]/g, '').trim()); return !skip; }).join('\n');
    const notes = laidOut({ ...doc, text: rest }, docs);
    return [
      hero(doc.title, now?.n ? `Today is Day ${now.n}` : now?.off ? `No school today: ${now.off}` : `Your school’s ${cl.count} days`, editBtn(doc.id)),
      askBanner(Array.from({ length: 14 }, (_, i) => addDays(pl.st.date, i))),
      ...rows,
      notes.textContent.trim() ? notes : null,
    ];
  }

  // ---------- Deadlines: soonest first ----------
  function deadlines(doc, docs) {
    const all = p.readDeadlines(doc.text, doc.at || Date.now());
    const row = (x) => {
      const n = Math.round((x.t - t0()) / DAY);
      return el('li', { className: [x.done ? 'done' : '', !x.done && n <= 7 && x.end >= t0() ? 'soon' : ''].filter(Boolean).join(' ') },
        x.yearly ? el('span', { 'aria-hidden': 'true' }) : el('button', { type: 'button', className: 'pd-check', 'aria-pressed': String(x.done), 'aria-label': `${x.what}: ${x.done ? 'done' : 'not done'}`, title: x.done ? 'Done. Click to undo' : 'Check it off', onclick: () => keep(doc.id, p.markDeadline(doc.text, x.line, !x.done)) }, svg('check')),
        el('time', {}, dates(x)),
        el('span', { className: 'what' }, x.what), el('small', {}, x.yearly ? `${when(x)}, every year` : when(x)));
    };
    // (just the dates: what the page says around them is there when you Edit it)
    const coming = all.filter((x) => !x.done && x.end >= t0() && !(x.yearly && all.some((y) => y.yearly && y.line === x.line && y.end >= t0() && y.t < x.t)));
    const past = all.filter((x) => !x.yearly && (x.done || x.end < t0())), next = coming[0];
    return [
      hero(doc.title, next ? `Next: ${next.what}, ${when(next).toLowerCase()}` : 'Nothing coming up', editBtn(doc.id)),
      coming.length ? el('ol', { className: 'sc-dl', 'aria-label': 'Coming up' }, coming.map(row)) : el('p', { className: 'sc-nothing' }, all.length ? 'Nothing coming up. Everything here is done or past.' : 'No dates yet. Edit this page and add a line for each: - [ ] Dec 12 Project due.'),
      past.length ? el('details', { className: 'sc-past' }, el('summary', {}, `Done and past (${past.length})`), el('ol', { className: 'sc-dl' }, [...past].reverse().map(row))) : null,
    ];
  }

  // ---------- Sleep: tonight, then the page ----------
  function sleep(doc, docs) {
    const l = pl ? p.lightsOut(pl.plan, pl.st.date) : null, page = laidOut(doc, docs);
    // (the row that counts tonight is lit)
    if (pl && l) {
      const rows = pl.plan.sleep.rows, i = rows.findIndex((r) => r.at === l.at && r.t <= pl.st.date.getTime() + 12 * 3600000 && !rows.some((q) => q.t > r.t && q.t <= pl.st.date.getTime() + 12 * 3600000));
      const tr = page.querySelectorAll('tbody tr')[i];
      if (tr) tr.className = 'now';
    }
    return [hero(doc.title, l ? `Tonight: lights out by ${p.lightsWords(l)}` : '', editBtn(doc.id)), page];
  }

  // ---------- changing a page ----------
  const code = (s) => el('code', {}, s);
  const HELP = {
    week: () => el('p', { className: 'sc-help' }, 'A section for each day or set of days (', code('## Monday'), ', ', code('## Weekdays'), ', ', code('## Sunday to Thursday nights'), '), and a line for each thing: ', code('- 4:30 Homework · 90 min'), '. Minutes mean you check it off, and a time it ends (', code('- 4:00–5:00 Lesson'), ', ', code('- 7:00–7:30 Dinner'), ') something set, which crosses itself off once it’s over. ', code('## Before lights out'), ' has the night’s steps with their minutes (', code('- Shower · 15 min'), '): they end at lights out, in order, and move when it does. After a · a line can also have a link, its days, ', code('from Jan 1'), ', ', code('until Mar 1'), ', ', code('odd weeks'), ' or ', code('first Saturday'), '. ', code('## On game days'), ' makes a switch.'),
    classes: () => el('p', { className: 'sc-help' }, 'A section for each of your school’s days (', code('## Day 1'), ') and a line for each class: ', code('- 9:00–9:50 Biology · Room 204'), '. ', code('## Rotation'), ' says which Day a date is (', code('- Nov 9: Day 1'), '), ', code('## No school'), ' has days off (', code('- Nov 26–27 Thanksgiving'), '), and ', code('## Colors'), ' a color for a class (', code('- Biology: teal'), ').'),
    deadlines: () => el('p', { className: 'sc-help' }, 'A line for each date: ', code('- [ ] Dec 12 Project due'), ', or a few days: ', code('- [ ] Apr 28 – May 1 Trip'), '. A heading with a year (', code('## 2027'), ') is the year for the dates under it, and under ', code('## Every year'), ' a date comes back each year, like a birthday (', code('- Jun 1: Birthday'), ').'),
    sleep: () => el('p', { className: 'sc-help' }, 'A table of when it’s lights out from when (', code('| Nov 16 | 12:30 AM |'), '), and a line like ', code('Friday and Saturday nights: up to 30 min later'), '.'),
    how: () => el('p', { className: 'sc-help' }, 'A section for each kind of block, named the way it is in your week (', code('## AMC'), '). Home and Today show the sentence about that day, like one that starts with ', code('Sunday:'), '.'),
  };
  function editor(doc) {
    const area = el('textarea', { className: 'sc-text', spellcheck: 'true', 'aria-label': `${doc.title}, in Markdown` });
    area.value = doc.text;
    const said = el('span', { className: 'sc-saved', 'aria-live': 'polite' }, 'Saved');
    let soon = 0;
    const save = () => {
      clearTimeout(soon); soon = 0;
      const s = p.loadDocs(read);
      if (!s.docs[doc.id] || s.docs[doc.id].text === area.value) return;
      p.putDoc(s, doc.id, area.value);
      p.saveDocs(s, write);
      said.textContent = 'Saved';
    };
    flush = save;
    const fit = () => { area.style.height = 'auto'; area.style.height = `${Math.max(320, area.scrollHeight + 4)}px`; };
    area.addEventListener('input', () => { said.textContent = 'Saving…'; clearTimeout(soon); soon = setTimeout(save, 350); fit(); });
    const done = () => { save(); flush = null; location.hash = doc.id; };
    area.addEventListener('keydown', (e) => { if (e.key === 'Escape' || ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'Enter'))) { e.preventDefault(); done(); } });
    // (ready to type, at the top, with the page left where it was)
    requestAnimationFrame(() => { fit(); area.focus({ preventScroll: true }); area.setSelectionRange(0, 0); });
    // (deleting asks first, in place: Keep it puts the button back)
    const foot = el('div', { className: 'sc-foot' });
    const remove = () => { flush = null; clearTimeout(soon); const s = p.loadDocs(read); p.dropDoc(s, doc.id); p.saveDocs(s, write); location.hash = 'today'; };
    const del = el('button', { type: 'button', className: 'sc-del', onclick: () => foot.replaceChildren(el('span', { className: 'sc-sure' }, `Delete ${doc.title}?`,
      el('button', { type: 'button', className: 'btn', onclick: remove }, 'Delete'),
      el('button', { type: 'button', className: 'btn', onclick: () => foot.replaceChildren(del) }, 'Keep it'))) }, 'Delete this page');
    foot.append(del);
    const ids = pl?.plan.ids || {}, kind = Object.entries(ids).find(([, id]) => id === doc.id)?.[0] || (['week', 'classes'].includes(doc.id) ? doc.id : '');
    return [hero(doc.title, 'Changing it: what you type is kept as you go', said, el('button', { type: 'button', className: 'btn primary pill', onclick: done }, 'Done')), HELP[kind]?.() || null, area, foot];
  }

  // ---------- Pages: the rest of your plan, each with its first line ----------
  const firstLine = (text) => (String(text).split('\n').map((l) => l.trim()).find((l) => l && !/^(#|\||-{3})/.test(l)) || '').replace(/[*_`#>]|\[\[|\]\]/g, '').replace(/^[-+] (\[[ xX]\] )?/, '').slice(0, 160);
  function pages(list) {
    return [
      hero('Pages', `${list.length} ${list.length === 1 ? 'page' : 'pages'} of your plan`, el('a', { className: 'btn pill', href: '#new' }, svg('plus'), 'New page')),
      list.length ? el('ul', { className: 'sc-pages' }, list.map((d) => el('li', {}, el('a', { href: `#${d.id}` }, el('b', {}, d.title), el('small', {}, firstLine(d.text) || ' '))))) : el('p', { className: 'sc-nothing' }, 'No other pages yet.'),
    ];
  }

  // ---------- not its owner's browser: nothing of a plan, and nothing to start ----------
  const closed = () => el('div', { className: 'sc-empty' },
    el('h2', {}, `${T()} is private`),
    el('p', {}, 'It’s there only in a browser connected to its owner’s Database, where its pages are kept. If it’s yours, connect your Database in Settings.'),
    el('a', { className: 'btn primary', href: link('./') }, 'Home'));

  // ---------- the page ----------
  function draw() {
    if (flush) { flush(); flush = null; }
    closePop();
    if (!f.scheduleOn()) { box.replaceChildren(closed()); box.closest('main')?.classList.remove('filled'); return; }
    const r = route(), s = p.loadDocs(read), docs = p.listDocs(s), list = docs.map(({ id, title }) => ({ id, title }));
    pl = D.now();
    colorsFor(pl?.plan);
    if (r.id === 'new') {
      const id = p.newDoc(s, 'Untitled');
      p.saveDocs(s, write);
      location.replace(`#${id}/edit`);
      return;
    }
    // (the calendar to start with: the week, or today on a phone)
    const ids = pl?.plan.ids || {}, want = r.id || (phone.matches || !pl ? 'today' : ids.week);
    const doc = r.id === 'pages' ? null : docs.find((d) => d.id === want), here = r.id === 'pages' ? 'pages' : doc ? doc.id : 'today';
    const todo = docs.find((d) => d.id === 'to-do' || /^to ?do$/i.test(d.title));
    const tabbed = [ids.week, ids.classes, ids.deadlines, todo?.id].filter(Boolean), rest = docs.filter((d) => !tabbed.includes(d.id));
    const views = (here === 'pages' ? pages(rest)
      : doc
        ? r.mode === 'edit' ? editor(doc)
          : doc.id === ids.week ? week(doc)
            : doc.id === ids.classes ? classes(doc, list)
              : doc.id === ids.deadlines ? deadlines(doc, list)
                : doc.id === ids.sleep ? sleep(doc, list)
                  : [top(doc.title, editBtn(doc.id)), laidOut(doc, list)]
        : today(docs)).filter(Boolean);
    // (a view's tools, the week's, go beside the tabs)
    const tools = views[0]?.classList.contains('sc-tools') ? views.shift() : null;
    // the tabs: the calendar, the pages that go with it, and Pages for the rest (lit too when one of them is open)
    const tab = (href, label, on) => el('a', { href, className: on ? 'on' : null, 'aria-current': on ? 'page' : null }, label);
    const title = (id) => docs.find((d) => d.id === id)?.title;
    const tabs = el('nav', { className: 'sc-tabs', 'aria-label': T() },
      tab('#today', 'Today', here === 'today'),
      ids.week ? tab(`#${ids.week}`, title(ids.week), here === ids.week) : null,
      ids.classes ? tab(`#${ids.classes}`, title(ids.classes), here === ids.classes) : null,
      ids.deadlines ? tab(`#${ids.deadlines}`, title(ids.deadlines), here === ids.deadlines) : null,
      todo ? tab(`#${todo.id}`, todo.title, here === todo.id) : null,
      tab('#pages', 'Pages', here === 'pages' || rest.some((d) => d.id === here)));
    // (a new page rises in; the same page drawn again, with the clock or a check, is just there)
    // (another week of the same view slides in instead: see slide)
    const where = `${here}/${r.mode}/${shift}/${picked}`, view = (w) => w.split('/').slice(0, 2).join('/'), page = el('section', { className: `sc-page${view(where) !== view(drawn) && f.moving() ? ' rise' : ''}`, 'aria-label': doc ? doc.title : 'Today' }, ...views);
    drawn = where;
    box.replaceChildren(el('div', { className: 'sc-top' }, tabs, tools), page);
    // (the week, fitted to the window)
    const weekShown = !!page.querySelector('.cal.fill');
    box.closest('main')?.classList.toggle('filled', weekShown);
    box.closest('main')?.classList.toggle('row-hidden', weekShown && !rowOn());
    fitWeek();
    fresh = null; slide = 0;
    // (a link to a page that isn't here any more shows Today, and says so in the address)
    if (!doc && r.id && r.id !== 'today' && r.id !== 'pages') history.replaceState(null, '', '#today');
  }

  draw();
  addEventListener('hashchange', () => { if (route().id !== drawn.split('/')[0]) { shift = 0; picked = ''; } draw(); });
  // (checking something off, a switch, another tab's changes, and the clock moving on; not while you're typing, or reading
  // a card)
  const again = () => { if (!flush) draw(); };
  addEventListener('fluence:plan', again);
  addEventListener('storage', (e) => { if (e.key === p.KEY || e.key === p.DOCS) again(); });
  setInterval(() => { if (!document.hidden && !pop && !flush && box.querySelector('.cal-now, .sc-now')) again(); }, 30000);
  phone.addEventListener('change', again);
  addEventListener('pagehide', () => flush?.());
  // a card closes with Escape or a click anywhere else; in the week, ← and → go a week back and on
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && pop) { closePop(); return; }
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
    if (!typing && rowKey() && f.key.meant(f.key.pressed(e)) === rowKey() && box.querySelector('.cal.fill')) { e.preventDefault(); toggleRow(); return; }
    if (e.metaKey || e.ctrlKey || e.altKey || typing) return;
    if (!box.querySelector('[aria-label="The week before"]')) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
  });
  // (a swipe to the side, two fingers on a trackpad or a finger on a screen, goes a week on or back: one week a swipe)
  const weekUp = () => !!box.querySelector('[aria-label="The week before"]') && !flush;
  let swipeX = 0, swipeQuiet = 0, swiped = false, touch = null;
  box.addEventListener('wheel', (e) => {
    if (!weekUp() || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    clearTimeout(swipeQuiet);
    swipeQuiet = setTimeout(() => { swipeX = 0; swiped = false; }, 240);
    if (swiped) return;
    swipeX += e.deltaX;
    if (Math.abs(swipeX) >= 70) { swiped = true; closePop(); go(swipeX > 0 ? 1 : -1); }
  }, { passive: false });
  box.addEventListener('touchstart', (e) => { touch = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() } : null; }, { passive: true });
  box.addEventListener('touchend', (e) => {
    const t = touch, end = e.changedTouches[0];
    touch = null;
    if (!t || !end || !weekUp()) return;
    const dx = end.clientX - t.x, dy = end.clientY - t.y;
    if (Math.abs(dx) >= 60 && Math.abs(dx) > 1.6 * Math.abs(dy) && Date.now() - t.t < 800) { closePop(); go(dx < 0 ? 1 : -1); }
  }, { passive: true });
  addEventListener('pointerdown', (e) => { if (pop && !pop.contains(e.target) && !e.target.closest?.('.cal-b, .cal-chip, .cal-dh, .ag-name')) closePop(); }, true);
  // (the week fits again when the window changes, when the player comes or goes, and when a look or the fonts load)
  let sized = 0;
  addEventListener('resize', () => { closePop(); cancelAnimationFrame(sized); sized = requestAnimationFrame(fitWeek); });
  new MutationObserver(() => fitWeek()).observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });
  document.addEventListener('load', (e) => { if (e.target?.tagName === 'LINK') fitWeek(); }, true);
  document.fonts?.ready.then(() => fitWeek());
}
