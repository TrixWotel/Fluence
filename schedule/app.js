// Schedule: your plan, a space of its own in the bar, laid out like Music: tabs at the top, a view's name big under them,
// and nothing boxed in. Week is the week by the hour, the way a school's schedule shows it: your classes on the Day they're
// on (from Classes), your own blocks, and what has set times, with deadlines at the top of their day and a line for now
// (meals, the walk, free time and the night stay out of it). Today is what's on now, how to start it, and the day in order
// with a circle to check each thing off. Classes, Deadlines, Sleep and the rest are pages: Markdown you can change (Edit),
// kept as you type.
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
  // flush keeps what's being typed; shift is the week showing (0 is this one) and picked its day on a phone; pl is the plan
  let flush = null, drawn = '', shift = 0, picked = '', pop = null, pl = null, kept = { at: '', top: 0 };

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
  // a color for each class (Classes' "## Colors", or the next one along), and for anything else with set times, by its name
  const PALETTE = p.COLORS.filter((c) => c !== 'gray');
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
  const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const colorOf = (it, kind) => (it.kind === 'class' ? it.color || colors[key(it.cls || it.name)] || '' : kind === 'event' ? (/^school\b/i.test(it.name) ? 'gray' : colors[key(it.name)] || PALETTE[hash(key(it.name)) % PALETTE.length]) : '');
  const kindOf = (it) => (it.check ? 'mine' : it.kind === 'class' ? 'class' : it.set && !it.steps ? 'event' : 'routine');

  // what a day holds: its things (done or not), its Day of the rotation, lights out and what's due
  function dayOf(date) {
    const k = p.dayKey(date), rec = pl.state.days[k] || {}, t = date.getTime();
    const items = p.day(pl.plan, date, p.switchesOn(pl.plan, pl.state, date));
    for (const it of items) it.done = it.check && !!rec.done?.[it.id];
    return { date, key: k, items, rot: p.rotationOf(pl.plan.classes, date), lights: p.lightsOut(pl.plan, date), dls: pl.plan.deadlines.filter((x) => x.t <= t && t <= x.end), today: k === pl.st.key, past: k < pl.st.key };
  }
  // what's shown: classes, what you check off, and what has set times (a lesson, School). Meals, the walk and free time
  // aren't; in the week neither is the night or anything under a quarter of an hour, and Today has the night as one
  const worth = (it) => it.check || it.kind === 'class' || it.set;
  function blocksOf(d, { day = false } = {}) {
    const out = [];
    for (const it of d.items) {
      if (it.at == null) continue;
      if (it.night && !it.check) {
        if (!day) continue;
        const last = out.at(-1);
        if (last?.steps && it.at <= last.end + 1) { last.steps.push(it); last.end = Math.max(last.end, it.end); continue; }
        out.push({ ...it, id: `night|${it.id}`, name: 'Night routine', steps: [it] });
      } else if (worth(it) && (day || it.end - it.at >= 15)) out.push(it);
    }
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
  // the hours shown: from the hour of the first thing shown to the hour after the last
  function bounds(days) {
    let lo = Infinity, hi = -Infinity;
    for (const d of days) for (const it of blocksOf(d)) { lo = Math.min(lo, it.at); hi = Math.max(hi, it.end); }
    if (!Number.isFinite(lo)) { lo = 8 * 60; hi = 20 * 60; }
    lo = Math.floor(lo / 60) * 60;
    return { lo, hi: Math.max(lo + 4 * 60, Math.ceil(hi / 60) * 60) };
  }
  // (an hour is 60 pixels)
  function grid(days, { fit = false, hour = 60 } = {}) {
    const { lo, hi } = bounds(days), y = (m) => ((m - lo) / 60) * hour;
    const hours = el('div', { className: 'cal-hours', 'aria-hidden': 'true' });
    for (let m = lo; m < hi; m += 60) hours.append(el('span', { className: m === lo ? 'first' : null, style: `top:${y(m)}px` }, hourName(m)));
    const allDay = days.some((d) => d.dls.length || d.rot?.off || d.items.some((it) => it.at == null && it.check));
    const sc = el('div', { className: 'cal-scroll' }, el('div', { className: 'cal-body', style: `height:${y(hi)}px` }, hours, ...days.map((d) => column(d, y, lo, hi))));
    // (where it opens: a little before now on today, or else at the first thing of the morning)
    const today = days.find((d) => d.today && d.date), first = Math.min(...days.flatMap((d) => blocksOf(d).map((it) => it.at)), hi);
    sc.dataset.top = String(Math.max(0, today && pl.st.m >= lo && pl.st.m <= hi ? y(pl.st.m) - 150 : y(Math.max(lo, first - 30))));
    sc.addEventListener('scroll', () => { closePop(); kept = { at: drawn, top: sc.scrollTop }; }, { passive: true });
    return el('div', { className: `cal${fit ? ' fit' : ''}`, style: `--cols:${days.length};--hour:${hour}px` },
      el('div', { className: 'cal-head' }, el('span', {}), ...days.map(head)),
      allDay ? el('div', { className: 'cal-all' }, el('span', {}), ...days.map(dueOf)) : null,
      sc);
  }
  // a day's head: the day, and its Day of the rotation (click it to put the weeks right) or that there's no school
  function head(d) {
    const rot = d.rot;
    return el('div', { className: `cal-dh${d.today ? ' today' : ''}`, title: d.date ? fmt(d.date, { weekday: 'long', month: 'long', day: 'numeric' }) : null },
      d.date ? [el('span', { className: 'wd' }, fmt(d.date, { weekday: 'short' })), el('span', { className: 'dn' }, String(d.date.getDate()))] : el('span', { className: 'dn label' }, d.label),
      d.date && rot?.n ? el('button', { type: 'button', className: 'cal-rot', title: `Day ${rot.n} of your school’s days. Not right? Click to change it.`, onclick: (e) => askDay(d, e.currentTarget) }, `Day ${rot.n}`)
        : rot?.off ? el('span', { className: 'cal-off', title: rot.off }, 'No school') : null);
  }
  // what's due that day, a day off, and something of yours with no time
  function dueOf(d) {
    const chips = [];
    if (d.rot?.off) chips.push(el('span', { className: 'cal-chip off', title: d.rot.off }, el('span', {}, d.rot.off)));
    for (const x of d.dls) chips.push(el('button', { type: 'button', className: `cal-chip dl${x.done ? ' done' : ''}`, title: x.what, onclick: (e) => showDue(x, e.currentTarget) }, el('span', {}, x.what)));
    for (const it of d.items.filter((i) => i.at == null && i.check)) chips.push(el('button', { type: 'button', className: `cal-chip mine${it.done ? ' done' : ''}`, title: it.name, onclick: (e) => show(d, it, e.currentTarget) }, el('span', {}, short(it))));
    return el('div', { className: `cal-ad${d.today ? ' today' : ''}` }, chips);
  }
  function column(d, y, lo, hi) {
    const col = el('div', { className: `cal-col${d.today ? ' today' : ''}` });
    for (const o of lanes(blocksOf(d))) col.append(block(d, o, y));
    // (now: a line under the blocks, so it never runs through one, and a dot at the edge; the block on now is lit)
    if (d.today && pl && pl.st.m >= lo && pl.st.m <= hi) col.append(el('div', { className: 'cal-now', style: `top:${y(pl.st.m)}px` }), el('div', { className: 'cal-dot', style: `top:${y(pl.st.m)}px`, title: `Now, ${p.clockAmPm(pl.st.m)}` }));
    return col;
  }
  // a block: a class in its color, something of yours, or something with set times (a lesson, School). Its name, and its
  // times when there's room; the rest is on its card
  function block(d, { it, lane, of }, y) {
    const kind = kindOf(it);
    const h = Math.max(4, y(it.end) - y(it.at) - 3), size = h < 34 ? 'small' : h >= 64 ? 'tall' : '';
    const small = size === 'small';
    const now = d.today && pl && pl.st.m >= it.at && pl.st.m < it.end;
    const b = el('div', {
      className: ['cal-b', kind, size, it.done ? 'done' : '', now ? 'now' : ''].filter(Boolean).join(' '),
      style: `top:${y(it.at)}px;height:${h}px;--lane:${lane};--of:${of}`,
      role: 'button', tabIndex: 0, 'data-c': colorOf(it, kind) || null,
      'aria-label': `${it.name}, ${span(it.at, it.end)}${it.where ? `, ${it.where}` : ''}${it.done ? ', checked off' : ''}`,
      onclick: () => show(d, it, b),
      onkeydown: (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target === b) { e.preventDefault(); show(d, it, b); } },
    },
      el('b', {}, short(it)),
      small ? null : el('small', {}, span(it.at, it.end)));
    return b;
  }
  const later = (d) => !d.today && !d.past;
  // checking something off on its day (today's the way Home does it)
  function mark(d, it, on) {
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
    const how = it.check && d.date ? p.howFor(pl.plan, it, d.date) : null, place = it.kind === 'class' && !it.check ? null : p.placeOf(pl.plan, it);
    const note = it.name.includes(': ') ? it.name.slice(it.name.indexOf(': ') + 2) : '';
    popAt(anchor, it.steps ? 'Night routine' : short(it),
      el('p', { className: 'pop-when' }, [d.date ? fmt(d.date, { weekday: 'long', month: 'short', day: 'numeric' }) : d.label, it.at != null ? span(it.at, it.end) : '', it.min ? `${it.min} min` : ''].filter(Boolean).join(' · ')),
      it.kind === 'class' ? el('p', {}, [d.date ? `Day ${it.n}` : '', it.where].filter(Boolean).join(' · ')) : null,
      note ? el('p', {}, note) : null,
      it.steps ? el('ol', { className: 'pop-steps' }, it.steps.map((s) => el('li', {}, el('time', {}, p.clock(s.at)), s.name))) : null,
      how ? el('p', { className: 'pop-how' }, el('b', {}, `${how.name}: `), how.text, ' ', el('a', { href: `#${pl.plan.ids.how}` }, 'More')) : null,
      (it.check && d.date) || place ? el('div', { className: 'pop-act' },
        place ? el('a', { className: 'btn primary', href: place.away ? place.href : link(place.href), target: place.away ? '_blank' : null, rel: place.away ? 'noopener' : null }, `Start ${short(it)}`) : null,
        it.check && d.date ? el('button', { type: 'button', className: `btn${place ? '' : ' primary'}`, disabled: later(d), onclick: () => { closePop(); mark(d, it, !it.done); } }, later(d) ? 'Not yet' : it.done ? 'Not done after all' : 'Check it off') : null) : null);
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
    const id = pl.plan.ids.deadlines, s = p.loadDocs(read);
    if (s.docs[id]) keep(id, p.markDeadline(s.docs[id].text, x.line, done));
  }
  function showDue(x, anchor) {
    popAt(anchor, x.what,
      el('p', { className: 'pop-when' }, `${dates(x)} · ${when(x)}`),
      el('div', { className: 'pop-act' },
        el('button', { type: 'button', className: 'btn primary', onclick: () => { closePop(); tick(x, !x.done); } }, x.done ? 'Not done after all' : 'Check it off'),
        el('a', { className: 'btn', href: `#${pl.plan.ids.deadlines}` }, 'All deadlines')));
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
  // (until Classes says which Day a date is, the calendar asks, about the first school day showing)
  function askBanner(dates) {
    const cl = pl?.plan.classes;
    if (!cl || cl.anchors.length || cl.count <= 5) return null;
    const date = dates.find((d) => p.rotationOf(cl, d)?.n === null && !p.rotationOf(cl, d).off && d.getTime() >= t0()) || dates.find((d) => p.rotationOf(cl, d)?.n === null && !p.rotationOf(cl, d).off);
    if (!date) return null;
    return el('div', { className: 'sc-ask', role: 'group', 'aria-label': 'Which Day is it' },
      el('span', {}, el('b', {}, 'Your classes are in. '), `Which Day is ${fmt(date, { weekday: 'long', month: 'short', day: 'numeric' })}?`),
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
  // the day in order: classes, your own blocks with a circle to check each off, what has set times, and the night as one
  // (meals, the walk and free time are left out). What's over is quieter, and what's on now is lit
  function agenda(d) {
    const its = [...d.items.filter((it) => it.at == null && it.check), ...blocksOf(d, { day: true })], m = pl.st.m;
    const row = (it) => {
      const now = it.at != null && m >= it.at && m < it.end, over = it.at != null && it.end <= m;
      const sub = it.steps ? it.steps.map(short).join(', ') : it.kind === 'class' && !it.check ? [it.where ? it.where.split(' · ').pop() : '', `until ${p.clock(it.end)}`].filter(Boolean).join(' · ') : it.check ? `${it.min} min` : `until ${p.clockAmPm(it.end)}`;
      return el('li', { className: ['ag-row', now ? 'now' : '', over && !now ? 'over' : '', it.done ? 'done' : ''].filter(Boolean).join(' '), 'data-c': colorOf(it, kindOf(it)) || null },
        el('time', {}, it.at == null ? 'Any time' : p.clockAmPm(it.at)),
        el('button', { type: 'button', className: 'ag-name', onclick: (e) => show(d, it, e.currentTarget) }, el('b', {}, it.steps ? 'Night routine' : short(it)), el('small', {}, sub)),
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
    const days = pl.plan.classes ? dates7.map((x) => p.rotationOf(pl.plan.classes, x)?.n).filter(Boolean) : [];
    return [
      // (the week's name, its dates and Days under it, and the way to the weeks around it and Edit at the side)
      hero(doc.title, `${range}${days.length > 1 ? ` · Days ${days[0]}–${days.at(-1)}` : days.length ? ` · Day ${days[0]}` : ''}`,
        el('div', { className: 'sc-nav' }, step(-1, 'The week before'), shift ? el('button', { type: 'button', className: 'btn pill', onclick: () => { shift = 0; picked = ''; draw(); } }, 'This week') : null, step(1, 'The week after')),
        editBtn(doc.id, 'Edit plan')),
      askBanner(dates7),
      phone.matches ? el('div', { className: 'sc-days', role: 'tablist', 'aria-label': 'Days' }, dates7.map((d, i) => el('button', {
        type: 'button', role: 'tab', 'aria-selected': String(keys[i] === p.dayKey(sel)), className: keys[i] === pl.st.key ? 'today' : '',
        title: fmt(d, { weekday: 'long', month: 'long', day: 'numeric' }), onclick: () => { picked = keys[i]; draw(); },
      }, el('b', {}, fmt(d, { weekday: 'short' })), el('span', {}, String(d.getDate()))))) : null,
      grid((phone.matches ? [sel] : dates7).map(dayOf)),
    ];
  }
  function go(n) { shift += n; picked = ''; draw(); }

  // ---------- Classes: your school's days, the way the school shows them ----------
  function classes(doc, docs) {
    const cl = pl?.plan.classes;
    if (!cl) return [top(doc.title, editBtn(doc.id)), laidOut(doc, docs)];
    const now = p.rotationOf(cl, pl.st.date), rows = [];
    for (let w = 0; w < Math.ceil(cl.count / 5); w++) {
      const days = [1, 2, 3, 4, 5].map((i) => w * 5 + i).filter((n) => n <= cl.count)
        .map((n) => ({ label: `Day ${n}`, key: `day-${n}`, items: p.classItems(cl, n), dls: [], rot: null, lights: null, today: now?.n === n, past: false }));
      rows.push(el('div', { className: 'sc-wide' }, grid(days, { fit: true, hour: 60 })));
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
        el('button', { type: 'button', className: 'pd-check', 'aria-pressed': String(x.done), 'aria-label': `${x.what}: ${x.done ? 'done' : 'not done'}`, title: x.done ? 'Done. Click to undo' : 'Check it off', onclick: () => keep(doc.id, p.markDeadline(doc.text, x.line, !x.done)) }, svg('check')),
        el('time', {}, dates(x)),
        el('span', { className: 'what' }, x.what), el('small', {}, when(x)));
    };
    // (just the dates: what the page says around them is there when you Edit it)
    const coming = all.filter((x) => !x.done && x.end >= t0()), past = all.filter((x) => x.done || x.end < t0()), next = coming[0];
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
    week: () => el('p', { className: 'sc-help' }, 'A section for each day or set of days (', code('## Monday'), ', ', code('## Weekdays'), ', ', code('## Sunday to Thursday nights'), '), and a line for each thing: ', code('- 4:30 Homework · 90 min'), '. Minutes mean you check it off, and a time it ends (', code('- 4:00–5:00 Lesson'), ') something set. After a · a line can also have a link, its days, ', code('from Jan 1'), ', ', code('until Mar 1'), ', ', code('odd weeks'), ' or ', code('first Saturday'), '. ', code('## On game days'), ' makes a switch.'),
    classes: () => el('p', { className: 'sc-help' }, 'A section for each of your school’s days (', code('## Day 1'), ') and a line for each class: ', code('- 9:00–9:50 Biology · Room 204'), '. ', code('## Rotation'), ' says which Day a date is (', code('- Nov 9: Day 1'), '), ', code('## No school'), ' has days off (', code('- Nov 26–27 Thanksgiving'), '), and ', code('## Colors'), ' a color for a class (', code('- Biology: teal'), ').'),
    deadlines: () => el('p', { className: 'sc-help' }, 'A line for each date: ', code('- [ ] Dec 12 Project due'), ', or a few days: ', code('- [ ] Apr 28 – May 1 Trip'), '. A heading with a year (', code('## 2027'), ') is the year for the dates under it.'),
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

  // ---------- the page ----------
  function draw() {
    if (flush) { flush(); flush = null; }
    closePop();
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
    const views = here === 'pages' ? pages(rest)
      : doc
        ? r.mode === 'edit' ? editor(doc)
          : doc.id === ids.week ? week(doc)
            : doc.id === ids.classes ? classes(doc, list)
              : doc.id === ids.deadlines ? deadlines(doc, list)
                : doc.id === ids.sleep ? sleep(doc, list)
                  : [top(doc.title, editBtn(doc.id)), laidOut(doc, list)]
        : today(docs);
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
    // (a new page rises in; the same page drawn again, with the clock or a check, is just there, scrolled where it was)
    const where = `${here}/${r.mode}/${shift}/${picked}`, page = el('section', { className: `sc-page${where !== drawn && f.moving() ? ' rise' : ''}`, 'aria-label': doc ? doc.title : 'Today' }, ...views.filter(Boolean));
    const again = where === drawn;
    drawn = where;
    box.replaceChildren(el('div', { className: 'sc-top' }, tabs), page);
    for (const sc of page.querySelectorAll('.cal-scroll')) sc.scrollTop = again && kept.at === where ? kept.top : +sc.dataset.top;
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
    if (e.metaKey || e.ctrlKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return;
    if (!box.querySelector('[aria-label="The week before"]')) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
  });
  addEventListener('pointerdown', (e) => { if (pop && !pop.contains(e.target) && !e.target.closest?.('.cal-b, .cal-chip, .cal-rot, .ag-name')) closePop(); }, true);
  addEventListener('resize', closePop);
}
