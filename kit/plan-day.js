// Today's plan the way Home and Schedule both show it: what the plan says now, and the day in order, with one lit row for
// what's now and each thing crossed off once its time is over (kit/plan.js has the plan itself, from Schedule's pages).
// A plain script: window.fluentioPlanDay.
(() => {
  const f = window.fluentio;
  if (!f) return;
  const { el, link, read } = f;
  const P = () => window.fluentioPlan;
  const cap = (s) => s[0].toUpperCase() + s.slice(1);

  // the plan and where today is in it (null with no plan, or in a browser that isn't its owner's; Home leaves it out when
  // Settings → Home says so)
  function now(t = Date.now(), { home = false } = {}) {
    const p = P();
    if (!p || !f.scheduleOn?.() || (home && f.settings.planHome === false)) return null;
    const plan = p.current();
    if (!plan) return null;
    const state = p.load(read);
    return { plan, state, st: p.status(plan, state, t) };
  }
  // a thing's short name: what's before a colon ("Web: personal site" is Web), but something of yours at a class's time is
  // what comes after the class's name ("Lab: write-up" is write-up), since the time already says which class
  const short = (it) => (it.kind === 'class' && it.check && /:\s*\S/.test(it.name) ? it.name.slice(it.name.indexOf(':') + 1) : it.name).replace(/:.*$/, '').trim();
  const either = (xs) => (xs.length < 2 ? xs[0] : `${xs.slice(0, -1).join(', ')} or ${xs.at(-1)}`);
  const lower = (s) => (/^[A-Z][a-z]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);
  // what the plan says now: bed when it's past lights out, the night once it starts, then what's on now and what's next
  function words(pl) {
    const p = P(), st = pl.st, at = p.clock(st.m);
    if (st.late) return { say: `It’s ${at}, past lights out.`, ask: 'Go to bed. Tomorrow’s here when you wake up.' };
    if (st.night) return { say: `${st.now ? `Now: ${lower(short(st.now))}. ` : ''}Lights out by ${p.lightsWords(st.lights) || 'your bedtime'}.`, ask: '' };
    if (st.now?.check) return { say: `It’s ${at}, time for ${short(st.now)}. ${p.leftWords(p.left(st.now, st.m))} left.`, ask: st.now.place ? 'Want to start?' : '' };
    const next = st.next ? ` Next: ${short(st.next)} at ${p.clock(st.next.at)}.` : '';
    if (st.now) return { say: `${cap(short(st.now))} until ${p.clock(st.now.end)}.${next}`, ask: '' };
    if (st.next) return { say: `Next on your plan: ${short(st.next)} at ${p.clock(st.next.at)}.`, ask: '' };
    return null;
  }
  const hrefOf = (it) => (it.place ? (it.place.away ? it.place.href : link(it.place.href)) : null);
  // a switch on or off: saved, and every part of the page told
  function flipSwitch(sw, on) {
    const p = P(), pl = now();
    if (!p || !pl) return;
    p.flip(pl.plan, pl.state, pl.st.date, sw.id, on);
    p.save(pl.state, f.write);
    dispatchEvent(new CustomEvent('fluence:plan'));
  }

  // the day in order, what's now lit and what's over crossed off, lights out, the next deadlines, and the plan's
  // switches. On Home its head goes on to Schedule
  function panel(pl, { home = false } = {}) {
    const p = P(), st = pl.st, m = st.m;
    // (a block of yours that's over stays, crossed off; anything else over drops away, and what's during the day with no
    // time, once the afternoon comes)
    let shown = st.items.filter((it) => it.check || (it.at == null ? m < 15 * 60 : it.end > m));
    // (school is one row: the class that's on now and where, or the rest of the day's classes)
    const school = (it) => it.kind === 'class' && !it.check, left = shown.filter(school);
    if (left.length > 1 || (left.length && st.items.filter(school).length > 1)) {
      const on = left.find((it) => it === st.now), where = on?.where ? on.where.split(' · ').pop() : '';
      const row = on ? { ...on, name: `${short(on)}${where ? `, ${where}` : ''}`, now: true } : { name: 'School', at: left[0].at, end: left.at(-1).end, set: true, check: false };
      const i = shown.indexOf(left[0]);
      shown = shown.filter((it) => !school(it));
      shown.splice(i, 0, row);
    }
    const row = (it) => {
      const href = hrefOf(it), away = !!it.place?.away;
      const cls = ['pd-row', it.check ? '' : 'info', it.over ? 'done' : '', st.now === it || it.now ? 'now' : ''].filter(Boolean).join(' ');
      return el('li', { className: cls },
        el('span', { className: 'pd-dot', 'aria-hidden': 'true' }),
        el('time', {}, it.at == null ? '' : p.clock(it.at)),
        el('span', { className: 'pd-name' }, href ? el('a', { href, target: away ? '_blank' : null, rel: away ? 'noopener' : null }, it.name) : it.name),
        el('span', { className: 'pd-side' },
          it.min ? el('small', {}, `${it.min} min`) : it.set && it.end != null ? el('small', {}, `to ${p.clock(it.end)}`) : null,
          it.how ? el('a', { className: 'pd-how', href: link(it.how.href), title: it.how.text }, 'How?') : null));
    };
    const foot = [];
    if (st.lights) foot.push(el('span', {}, 'Lights out by ', el('b', {}, p.lightsWords(st.lights))));
    for (const x of st.deadlines.slice(0, 2)) foot.push(el('span', { title: x.what }, el('b', {}, x.what.replace(/\s*\([^)]*\)\s*$/, '')), ` ${p.dayWords(x)}`));
    return [
      el('div', { className: 'pd-head' },
        el('b', {}, 'Today'), el('span', { className: 'pd-day' }, st.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })),
        home ? el('a', { className: 'pd-edit', href: link('schedule/'), title: `Your whole plan, in ${f.settings.scheduleTitle}` }, f.settings.scheduleTitle) : null),
      el('ol', { className: 'pd-list' }, shown.map(row)),
      foot.length ? el('div', { className: 'pd-foot' }, foot) : null,
      st.switches.length ? el('div', { className: 'pd-switches', role: 'group', 'aria-label': 'Changes to your plan' }, st.switches.map((s) => el('button', { type: 'button', 'aria-pressed': String(s.on), title: s.scope === 'week' ? `${s.name}, for this week` : `${s.name}, for today`, onclick: () => flipSwitch(s, !s.on) }, s.name))) : null,
    ];
  }

  window.fluentioPlanDay = { now, short, either, lower, words, hrefOf, flipSwitch, panel };
})();
