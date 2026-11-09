// Today's plan the way Home and Schedule both show it: what the plan says now, and the day in order, with one lit row for
// what's now and a check for each thing you check off (kit/plan.js has the plan itself, from Schedule's pages).
// A plain script: window.fluentioPlanDay.
(() => {
  const f = window.fluentio;
  if (!f) return;
  const { el, svg, link, read } = f;
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
  // what the plan says now: bed when it's past lights out, the night and how today went once the night starts, then
  // what's on now, and what hasn't been checked off
  function words(pl) {
    const p = P(), st = pl.st, at = p.clock(st.m);
    const tally = st.of ? ` ${st.done} of ${st.of} checked off today.` : '';
    if (st.late) return { say: `It’s ${at}, past lights out.${tally}`, ask: st.left.length ? 'Check off what you did, then bed.' : 'Go to bed. Tomorrow’s here when you wake up.' };
    if (st.night) return { say: `${st.now ? `Now: ${lower(short(st.now))}. ` : ''}Lights out by ${p.lightsWords(st.lights) || 'your bedtime'}.${tally}`, ask: !st.of ? '' : st.left.length ? 'Did you do the rest?' : 'All of it. Nice work.' };
    if (st.now?.check && !st.now.done) return { say: `It’s ${at}, time for ${short(st.now)}. ${p.leftWords(p.left(st.now, st.m))} left.`, ask: st.now.place ? 'Want to start?' : 'Check it off when it’s done.' };
    if (st.missed.length) return { say: `You haven’t checked off ${either(st.missed.slice(0, 2).map(short))}${st.missed.length > 2 ? ` and ${st.missed.length - 2} more` : ''} yet.`, ask: st.missed.length === 1 ? 'Did you do it?' : 'Did you do them?' };
    const next = st.next ? ` Next: ${short(st.next)} at ${p.clock(st.next.at)}.` : '';
    if (st.now?.check) return { say: `${cap(short(st.now))} is done.${next}`, ask: '' };
    if (st.now) return { say: `${cap(short(st.now))} until ${p.clock(st.now.end)}.${next}`, ask: '' };
    if (st.next) return { say: `Next on your plan: ${short(st.next)} at ${p.clock(st.next.at)}.`, ask: '' };
    return null;
  }
  const hrefOf = (it) => (it.place ? (it.place.away ? it.place.href : link(it.place.href)) : null);
  // checking something off (or undoing it), and a switch on or off: saved, and every part of the page told
  function markDone(it, on) {
    const p = P(), pl = now();
    if (!p || !pl) return null;
    p.check(pl.state, pl.st.key, it.id, on);
    const st = p.status(pl.plan, pl.state, Date.now());
    p.remember(pl.state, st);
    p.save(pl.state, f.write);
    dispatchEvent(new CustomEvent('fluence:plan'));
    return st;
  }
  function flipSwitch(sw, on) {
    const p = P(), pl = now();
    if (!p || !pl) return;
    p.flip(pl.plan, pl.state, pl.st.date, sw.id, on);
    p.remember(pl.state, p.status(pl.plan, pl.state, Date.now()));
    p.save(pl.state, f.write);
    dispatchEvent(new CustomEvent('fluence:plan'));
  }

  // the day in order, what's now lit, a check for each thing you check off, how far through today is (a day counts at
  // 70%), days in a row, lights out, the next deadlines, and the plan's switches. On Home its head goes on to Schedule
  function panel(pl, { home = false } = {}) {
    const p = P(), st = pl.st, m = st.m, pct = Math.round(st.pct * 100);
    // (what's over and wasn't to check off drops away; what's during the day with no time, once the afternoon comes)
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
      const cls = ['pd-row', it.check ? '' : 'info', it.done ? 'done' : '', st.now === it || it.now ? 'now' : ''].filter(Boolean).join(' ');
      return el('li', { className: cls },
        it.check
          ? el('button', { type: 'button', className: 'pd-check', 'aria-pressed': String(!!it.done), 'aria-label': `${it.name}: ${it.done ? 'checked off' : 'not checked off'}`, title: it.done ? 'Checked off. Click to undo' : 'Check it off', onclick: () => markDone(it, !it.done) }, svg('check'))
          : el('span', { className: 'pd-dot', 'aria-hidden': 'true' }),
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
        el('span', { className: 'pd-count' }, st.of ? `${st.done} of ${st.of}` : 'Nothing to check off'),
        st.streak ? el('span', { className: 'pd-streak' }, `${st.streak} ${st.streak === 1 ? 'day' : 'days'} in a row`) : null,
        home ? el('a', { className: 'pd-edit', href: link('schedule/'), title: `Your whole plan, in ${f.settings.scheduleTitle}` }, f.settings.scheduleTitle) : null),
      st.of ? el('div', { className: 'pd-meter', role: 'img', 'aria-label': `${pct}% checked off. A day counts at ${Math.round(p.GOAL * 100)}%.` }, el('i', { style: `width:${pct}%` }), el('b', { style: `left:${Math.round(p.GOAL * 100)}%` })) : null,
      el('ol', { className: 'pd-list' }, shown.map(row)),
      foot.length ? el('div', { className: 'pd-foot' }, foot) : null,
      st.switches.length ? el('div', { className: 'pd-switches', role: 'group', 'aria-label': 'Changes to your plan' }, st.switches.map((s) => el('button', { type: 'button', 'aria-pressed': String(s.on), title: s.scope === 'week' ? `${s.name}, for this week` : `${s.name}, for today`, onclick: () => flipSwitch(s, !s.on) }, s.name))) : null,
    ];
  }

  window.fluentioPlanDay = { now, short, either, lower, words, hrefOf, markDone, flipSwitch, panel };
})();
