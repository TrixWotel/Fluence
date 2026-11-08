// Schedule: your plan, as a space of its own in the bar. Today is what's on now and the day in order, with a check for
// each thing you check off. Week shows any day of a week, Deadlines what's coming (checked off where they are), Sleep when
// it's lights out tonight, and every page is Markdown you can change (Edit): what you type is kept as you go. The pages
// are in this browser ('fluentio.schedule', kit/plan.js) and go with your progress to GitHub (kit/progress.js), so every
// browser has the same plan, and Home and the bar know it too.
// Links: #today, #<page> (#week, #deadlines, …), #<page>/edit to change one, and #new for a new page.
import { blocks, render, esc, linkParts } from '../station/md.js';

const f = window.fluentio, p = window.fluentioPlan, D = window.fluentioPlanDay, box = document.getElementById('sc');
const DAY = 86400000;

if (f && p && D && box) {
  const { el, svg, link, read, write } = f;
  const T = () => f.settings.scheduleTitle;
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const route = () => { const [id = '', mode = ''] = decodeURIComponent(location.hash.slice(1)).split('/'); return { id: id || 'today', mode }; };
  let flush = null, drawn = '', shift = 0, picked = '';   // flush: keeps what's being typed; shift and picked: the week and day showing

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
  const top = (title, ...more) => el('div', { className: 'sc-top' }, el('h2', {}, title), el('span', { className: 'grow' }), ...more);
  const editBtn = (id) => el('a', { className: 'btn', href: `#${id}/edit` }, 'Edit');

  // ---------- Today ----------
  function today(pl, docs) {
    if (!pl) return empty(docs);
    const st = pl.st, w = D.words(pl), it = st.now?.check && !st.now.done ? st.now : null;
    if (p.remember(pl.state, st)) p.save(pl.state, write);
    const out = [el('p', { className: 'sc-now' }, w ? `${w.say}${w.ask && !it ? ` ${w.ask}` : ''}` : st.items.length ? 'That’s all on your plan today.' : 'Nothing on your plan today.')];
    if (it) {
      const away = !!it.place?.away;
      out.push(el('div', { className: 'sc-act' },
        it.place
          ? el('a', { className: 'btn primary', href: D.hrefOf(it), target: away ? '_blank' : null, rel: away ? 'noopener' : null }, `Start ${D.short(it)}`)
          : el('button', { type: 'button', className: 'btn primary', onclick: () => D.markDone(it, true) }, `Check off ${D.short(it)}`),
        it.how ? el('p', { className: 'sc-how' }, el('b', {}, `${it.how.name}:`), ` ${it.how.text}`) : null));
    }
    out.push(el('section', { className: 'plan-day', 'aria-label': 'Today’s plan' }, ...D.panel(pl)));
    // (in the evening, what tomorrow holds)
    if (st.m >= 18 * 60) {
      const next = addDays(st.date, 1), its = p.day(pl.plan, next, p.switchesOn(pl.plan, pl.state, next)).filter((x) => x.check);
      if (its.length) out.push(el('p', { className: 'sc-later' }, el('b', {}, `Tomorrow, ${next.toLocaleDateString('en-US', { weekday: 'long' })}: `), its.map((x) => `${D.short(x)}${x.at != null ? ` ${p.clock(x.at)}` : ''}`).join(', '), '.'));
    }
    return out;
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

  // ---------- Week: a day at a time ----------
  function week(pl, doc) {
    if (!pl) return [top(doc.title, editBtn(doc.id)), laidOut(doc, [])];
    const monday = addDays(pl.st.date, -((pl.st.date.getDay() + 6) % 7) + shift * 7), days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
    const todayKey = p.dayKey(pl.st.date), keys = days.map(p.dayKey);
    const sel = days[keys.indexOf(picked)] || (shift === 0 ? pl.st.date : monday);
    const its = p.day(pl.plan, sel, p.switchesOn(pl.plan, pl.state, sel)), names = Object.fromEntries(pl.plan.switches.map((s) => [s.id, s.name]));
    const range = `${days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${days[6].toLocaleDateString('en-US', days[6].getMonth() === days[0].getMonth() ? { day: 'numeric' } : { month: 'short', day: 'numeric' })}`;
    const step = (n, label) => el('button', { type: 'button', className: 'sc-step', 'aria-label': label, title: label, onclick: () => { shift += n; picked = ''; draw(); } }, n < 0 ? '‹' : '›');
    const row = (it) => el('li', { className: `pd-row${it.check ? '' : ' info'}` },
      el('span', { className: it.check ? 'pd-ring' : 'pd-dot', 'aria-hidden': 'true' }),
      el('time', {}, it.at == null ? '' : p.clock(it.at)),
      el('span', { className: 'pd-name' }, it.name),
      el('span', { className: 'pd-side' }, it.by ? el('span', { className: 'sc-tag' }, names[it.by]) : null,
        it.min ? el('small', {}, `${it.min} min`) : it.set && it.end != null ? el('small', {}, `to ${p.clock(it.end)}`) : null));
    return [
      top(doc.title, step(-1, 'The week before'), el('span', { className: 'sc-range' }, range), step(1, 'The week after'), editBtn(doc.id)),
      el('div', { className: 'sc-days', role: 'tablist', 'aria-label': 'Days' }, days.map((d, i) => el('button', {
        type: 'button', role: 'tab', 'aria-selected': String(p.dayKey(d) === p.dayKey(sel)), className: keys[i] === todayKey ? 'today' : '',
        title: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }), onclick: () => { picked = keys[i]; draw(); },
      }, el('b', {}, d.toLocaleDateString('en-US', { weekday: 'short' })), el('span', {}, String(d.getDate()))))),
      its.length ? el('ol', { className: 'pd-list', 'aria-label': sel.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }, its.map(row)) : el('p', { className: 'sc-nothing' }, 'Nothing on this day.'),
    ];
  }

  // ---------- Deadlines: soonest first ----------
  function deadlines(pl, doc, docs) {
    const t0 = (pl?.st.date || new Date(new Date().setHours(0, 0, 0, 0))).getTime(), year = new Date(t0).getFullYear();
    const all = p.readDeadlines(doc.text, doc.at || Date.now());
    // (Nov 13, Feb 5/6, Apr 28 – May 1, with the year when it isn't this one)
    const md = (t) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dates = (x) => {
      const a = new Date(x.t), b = new Date(x.end), y = b.getFullYear() === year ? '' : `, ${b.getFullYear()}`;
      if (x.end <= x.t) return `${md(x.t)}${y}`;
      if (x.two) return `${md(x.t)}/${b.getDate()}${y}`;
      return `${md(x.t)} – ${a.getMonth() === b.getMonth() ? b.getDate() : md(x.end)}${y}`;
    };
    const when = (x) => {
      if (x.done) return 'Done';
      const n = Math.round((x.t - t0) / DAY);
      if (n < 0) return x.end >= t0 ? 'Now' : `${-n} ${n === -1 ? 'day' : 'days'} ago`;
      return n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : `In ${n} days`;
    };
    const row = (x) => {
      const n = Math.round((x.t - t0) / DAY);
      return el('li', { className: [x.done ? 'done' : '', !x.done && n <= 7 && x.end >= t0 ? 'soon' : ''].filter(Boolean).join(' ') },
        el('button', { type: 'button', className: 'pd-check', 'aria-pressed': String(x.done), 'aria-label': `${x.what}: ${x.done ? 'done' : 'not done'}`, title: x.done ? 'Done. Click to undo' : 'Check it off', onclick: () => keep(doc.id, p.markDeadline(doc.text, x.line, !x.done)) }, svg('check')),
        el('time', {}, dates(x)),
        el('span', { className: 'what' }, x.what), el('small', {}, when(x)));
    };
    const coming = all.filter((x) => !x.done && x.end >= t0), past = all.filter((x) => x.done || x.end < t0);
    // (what else the page says, like a line at the top, comes first: everything but the dates and their years' headings)
    const lines = new Set(all.map((x) => x.line)), rest = doc.text.split('\n').filter((l, i) => !lines.has(i) && !/^#{2,6}\s+.*\b\d{4}\b/.test(l)).join('\n');
    const notes = laidOut({ ...doc, text: rest }, docs);
    return [
      top(doc.title, editBtn(doc.id)),
      notes.textContent.trim() ? notes : null,
      notes.textContent.trim() ? el('div', { className: 'sc-gap' }) : null,
      coming.length ? el('ol', { className: 'sc-dl', 'aria-label': 'Coming up' }, coming.map(row)) : el('p', { className: 'sc-nothing' }, all.length ? 'Nothing coming up. Everything here is done or past.' : 'No dates yet. Edit this page and add a line for each: - [ ] Dec 12 Project due.'),
      past.length ? el('details', { className: 'sc-past' }, el('summary', {}, `Done and past (${past.length})`), el('ol', { className: 'sc-dl' }, [...past].reverse().map(row))) : null,
    ];
  }

  // ---------- Sleep: tonight, then the page ----------
  function sleep(pl, doc, docs) {
    const l = pl ? p.lightsOut(pl.plan, pl.st.date) : null, md = laidOut(doc, docs);
    // (the row that counts tonight is lit)
    if (pl && l) {
      const rows = pl.plan.sleep.rows, i = rows.findIndex((r) => r.at === l.at && r.t <= pl.st.date.getTime() + 12 * 3600000 && !rows.some((q) => q.t > r.t && q.t <= pl.st.date.getTime() + 12 * 3600000));
      const tr = md.querySelectorAll('tbody tr')[i];
      if (tr) tr.className = 'now';
    }
    return [top(doc.title, editBtn(doc.id)), l ? el('p', { className: 'sc-tonight' }, 'Tonight: lights out by ', el('b', {}, p.lightsWords(l)), '.') : null, md];
  }

  // ---------- changing a page ----------
  const HELP = {
    week: () => el('p', { className: 'sc-help' }, 'A section for each day or set of days (', el('code', {}, '## Monday'), ', ', el('code', {}, '## Weekdays'), ', ', el('code', {}, '## Sunday to Thursday nights'), '), and a line for each thing: ', el('code', {}, '- 4:30 Homework · 90 min'), '. Minutes mean you check it off. After a · a line can also have a link, its days, ', el('code', {}, 'from Jan 1'), ', ', el('code', {}, 'odd weeks'), ' or ', el('code', {}, 'first Saturday'), '. ', el('code', {}, '## On game days'), ' makes a switch.'),
    deadlines: () => el('p', { className: 'sc-help' }, 'A line for each date: ', el('code', {}, '- [ ] Nov 13 AMC 10'), ', or a few days: ', el('code', {}, '- [ ] Apr 28 – May 1 Trip'), '. A heading with a year (', el('code', {}, '## 2027'), ') is the year for the dates under it.'),
    sleep: () => el('p', { className: 'sc-help' }, 'A table of when it’s lights out from when (', el('code', {}, '| Nov 16 | 12:30 AM |'), '), and a line like ', el('code', {}, 'Friday and Saturday nights: up to 30 min later'), '.'),
    how: () => el('p', { className: 'sc-help' }, 'A section for each kind of block, named the way it is in your week (', el('code', {}, '## AMC'), '). Home and Today show the sentence about that day, like one that starts with ', el('code', {}, 'Sunday:'), '.'),
  };
  function editor(doc, pl, docs) {
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
    const kind = pl ? Object.entries(pl.plan.ids).find(([, id]) => id === doc.id)?.[0] : doc.id === 'week' ? 'week' : '';
    return [top(doc.title, said, el('button', { type: 'button', className: 'btn primary', onclick: done }, 'Done')), HELP[kind]?.() || null, area, foot];
  }

  // ---------- the page ----------
  function draw() {
    if (flush) { flush(); flush = null; }
    const r = route(), s = p.loadDocs(read), docs = p.listDocs(s), pl = D.now(), list = docs.map(({ id, title }) => ({ id, title }));
    if (r.id === 'new') {
      const id = p.newDoc(s, 'Untitled');
      p.saveDocs(s, write);
      location.replace(`#${id}/edit`);
      return;
    }
    const doc = docs.find((d) => d.id === r.id), here = doc ? doc.id : 'today';
    const kind = doc && pl ? Object.entries(pl.plan.ids).find(([, id]) => id === doc.id)?.[0] : '';
    const views = doc
      ? r.mode === 'edit' ? editor(doc, pl, list)
        : kind === 'week' ? week(pl, doc)
          : kind === 'deadlines' ? deadlines(pl, doc, list)
            : kind === 'sleep' ? sleep(pl, doc, list)
              : [top(doc.title, editBtn(doc.id)), laidOut(doc, list)]
      : today(pl, docs);
    const row = (href, icon, label, on, extra, cls = '') => el('a', { className: `sc-row${on ? ' on' : ''}${cls}`, href, 'aria-current': on ? 'page' : null }, svg(icon), el('span', { className: 'sc-label' }, label), extra || null);
    const side = el('nav', { className: 'sc-side', 'aria-label': `${T()}’s pages` },
      el('div', { className: 'sc-list' },
        row('#today', 'clock', 'Today', here === 'today', pl?.st.of ? el('small', {}, `${pl.st.done} of ${pl.st.of}`) : null, ' today'),
        ...docs.map((d) => row(`#${d.id}`, d.id === pl?.plan.ids.week ? 'calendar' : 'note', d.title, here === d.id))),
      el('a', { className: 'sc-new', href: '#new' }, svg('plus'), 'New page'));
    // (a new page rises in; the same page drawn again, with the clock or a check, is just there)
    const where = `${here}/${r.mode}`, page = el('section', { className: `sc-page${where !== drawn && f.moving() ? ' rise' : ''}`, 'aria-label': doc ? doc.title : 'Today' }, ...views.filter(Boolean));
    drawn = where;
    box.replaceChildren(side, page);
    // (a link to a page that isn't here any more shows Today, and says so in the address)
    if (!doc && r.id !== 'today') history.replaceState(null, '', '#today');
  }

  draw();
  addEventListener('hashchange', () => { if (route().id !== drawn.split('/')[0]) { shift = 0; picked = ''; } draw(); });
  // (checking something off, a switch, another tab's changes, and the clock moving on; not while you're typing)
  const again = () => { if (!flush) draw(); };
  addEventListener('fluence:plan', again);
  addEventListener('storage', (e) => { if (e.key === p.KEY || e.key === p.DOCS) again(); });
  setInterval(() => { if (!document.hidden && route().id === 'today') again(); }, 30000);
  addEventListener('pagehide', () => flush?.());
}
