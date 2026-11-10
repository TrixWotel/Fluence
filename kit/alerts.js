// Alerts for your plan: as each thing on it starts (or a few minutes before: Settings → Home, or Alerts in Schedule), a
// note at the top of whatever page of the site is open. School and your classes, your blocks, a lesson, the meals and
// the walks, each of the night's steps, and lights out. Where the browser lets the site show notifications (asked for
// in the same places), it's a notification as well, while you're in another tab or app. Each comes once, whatever's
// open: this browser keeps which went ('fluentio:alerts', not part of your progress). A page of the site has to be open
// somewhere for them; one opened a little late still has the alert, for the first minutes of the thing it's for.
// A plain script: kit/bar.js brings it in with kit/plan.js (window.fluentioAlerts), and the tests require() it.
(function (root) {
  'use strict';
  const MIN = 60000, SENT = 'fluentio:alerts';
  const LATE = 10;   // (minutes an alert can still come after its time, while the thing's on)
  // (how far before, as Settings keeps it: minutes, or -1 for none; a number, as its default is one, kit/look.js)
  const CHOICES = [[-1, 'Off'], [0, 'As it starts'], [5, '5 min before'], [10, '10 min before']];

  // a thing's short name and the rest of it, the way Schedule names it ("Reading: chapter 3" is Reading; something of yours at a
  // class's time is what comes after the class's name)
  const short = (it) => (it.kind === 'class' && it.check && /:\s*\S/.test(it.name) ? it.name.slice(it.name.indexOf(':') + 1) : it.name).replace(/:.*$/, '').trim();
  const rest = (it) => (it.name.includes(': ') && !(it.kind === 'class' && it.check) ? it.name.slice(it.name.indexOf(': ') + 2) : '');
  // what on a day of the plan has an alert: what the calendar shows with a time (School or your classes, your blocks, a
  // lesson, a meal, the walk, each of the night's steps) and lights out; free time and a line with neither an end nor
  // minutes don't. When each is, in milliseconds: start, and stop when it's over
  function forDay(P, plan, state, date) {
    const key = P.dayKey(date), t = (m) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, m).getTime();
    const out = P.day(plan, date, P.switchesOn(plan, state, date)).filter((it) => it.at != null && (it.check || it.kind === 'class' || it.set)).map((it) => ({
      id: `${key}|${it.id}`, name: short(it), more: rest(it), at: it.at, end: it.end ?? it.at, start: t(it.at), stop: t(it.end ?? it.at),
      where: it.kind === 'class' && it.where ? it.where.split(' · ').pop() : '', it,
    }));
    const l = P.lightsOut(plan, date);
    if (l) out.push({ id: `${key}|lights out`, name: 'Lights out', more: '', at: l.at, end: l.at, start: t(l.at), stop: t(l.at), where: '', lights: true });
    return out;
  }
  // what's due its alert at `now`, `lead` minutes before it starts (0 as it starts), and hasn't had it: on this day of
  // the plan, and the next (the first thing after the day turns, at 5 in the morning). Nothing that's over already
  function due(P, plan, state, now, lead, sent = {}) {
    const { d } = P.dayAt(now), out = [];
    for (const date of [d, new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)]) {
      for (const a of forDay(P, plan, state, date)) {
        const at = a.start - lead * MIN;
        if (now >= at && now < at + LATE * MIN && (now < a.stop || a.stop === a.start) && !sent[a.id]) out.push(a);
      }
    }
    return out;
  }
  // what an alert says: its name, then how soon (or Now), when it is, where, and what it's about
  const ap = (m) => (Math.floor(m / 60) % 24 < 12 ? 'AM' : 'PM');
  function words(P, a, now) {
    const span = a.end > a.at ? `${P.clock(a.at)}${ap(a.at) === ap(a.end) ? '' : ` ${ap(a.at)}`} – ${P.clockAmPm(a.end)}` : P.clockAmPm(a.at);
    const soon = Math.round((a.start - now) / MIN);
    return { title: a.name, body: [soon >= 1 ? `In ${soon} min` : 'Now', span, a.where, a.more].filter(Boolean).join(' · ') };
  }
  const leadOf = (v) => (!(+v >= 0) ? null : Math.min(60, Math.round(+v)));

  // ---------- on a page ----------
  let started = false;
  // what this browser lets the site do: 'granted', 'denied', 'default' (not asked yet), or 'none' (no notifications)
  const can = () => ('Notification' in root ? root.Notification.permission : 'none');
  // (a browser that says no until you allow the site in its settings still asks when the site asks: so asking is there
  // until it's yes)
  const canAsk = () => can() === 'default' || can() === 'denied';
  const ask = () => (canAsk() ? Promise.resolve(root.Notification.requestPermission()).then(can, can) : Promise.resolve(can()));
  // (the words beside the choices, in Settings and in Schedule's card)
  const allowWords = () => ({
    granted: 'This browser shows them as notifications too, while you’re in another tab or app.',
    denied: 'They show on the site’s pages: this browser doesn’t let the site show notifications yet. Ask it, or allow them for the site in its settings, to have them in other apps too.',
    default: 'They show on the site’s pages. To have them while you’re in another tab or app too, let this browser show notifications.',
    none: 'They show on the site’s pages.',
  })[can()];

  function start(f) {
    const P = root.fluentioPlan;
    if (started || !P || !f) return;
    started = true;
    const { el, svg } = f;
    // (one page in a tab is in charge: the one showing, which may be in a frame over the first, kit/look.js)
    const inCharge = () => (root.frameElement ? root.frameElement.id === 'page-frame' : !document.getElementById('page-frame'));
    // which went, each once (kept for three days)
    const take = (id) => {
      const s = f.read(SENT) || {}, sent = s.sent && typeof s.sent === 'object' ? { ...s.sent } : {};
      if (sent[id]) return false;
      for (const [k, t] of Object.entries(sent)) if (!(t > Date.now() - 3 * 1440 * MIN)) delete sent[k];
      sent[id] = Date.now();
      f.write(SENT, { ...s, sent });
      return true;
    };
    // (two tabs of the site at once: the browser lets one look at a time, and the other finds it went)
    const claim = (id) => (root.navigator?.locks ? root.navigator.locks.request('fluentio-alerts', () => take(id)) : Promise.resolve(take(id)));
    let box = null, busy = false;
    function drop(note) {
      clearInterval(note.timer);
      if (!note.isConnected) return;
      if (!f.moving()) return note.remove();
      note.animate({ opacity: [1, 0], transform: ['none', 'translateY(-6px)'] }, { duration: 180, easing: 'ease-in' }).finished.then(() => note.remove(), () => note.remove());
    }
    // the note: at the top, under the bar, until the thing's over, five minutes after you've seen it, or you close it
    // (pointing at it keeps it)
    function note(a, w) {
      if (!document.body) return;
      if (!box || !box.isConnected) document.body.append((box = el('div', { className: 'alerts', role: 'region', 'aria-label': 'Alerts' })));
      const place = a.it && !(a.it.kind === 'class' && !a.it.check) ? P.placeOf(P.current(), a.it) : null;
      const n = el('div', { className: 'alert', role: 'alert' },
        el('span', { className: 'alert-ic', 'aria-hidden': 'true' }, svg('bell')),
        el('div', { className: 'alert-words' }, el('b', {}, w.title), el('span', {}, w.body)),
        place ? el('a', { className: 'btn alert-go', href: place.away ? place.href : f.link(place.href), target: place.away ? '_blank' : null, rel: place.away ? 'noopener' : null, onclick: () => drop(n) }, 'Start') : null,
        el('button', { type: 'button', className: 'alert-x', 'aria-label': 'Close', title: 'Close', onclick: () => drop(n) }, svg('x')));
      n.dataset.id = a.id;
      box.append(n);
      let seen = 0;
      n.timer = setInterval(() => {
        if (a.stop > a.start && Date.now() >= a.stop) return drop(n);
        if (!document.hidden && !n.matches(':hover')) seen += 5;
        if (seen >= 300) drop(n);
      }, 5000);
    }
    function show(a, now) {
      const w = words(P, a, now);
      note(a, w);
      // (and a notification, when this isn't the page you're looking at)
      if (can() === 'granted' && (document.hidden || !document.hasFocus())) {
        try { const n = new root.Notification(w.title, { body: w.body, tag: a.id }); n.onclick = () => { try { root.top.focus(); } catch {} root.focus(); n.close(); }; } catch {}
      }
    }
    async function tick() {
      const lead = leadOf(f.settings.planAlerts);
      if (busy || lead == null || !inCharge() || !f.scheduleOn()) return;
      const plan = P.current();
      if (!plan) return;
      busy = true;
      try {
        let now = Date.now(), list = due(P, plan, P.load(f.read), now, lead, (f.read(SENT) || {}).sent || {});
        if (!list.length) return;
        // (a tab you're looking at shows it, before one you aren't)
        if (document.hidden) { await new Promise((r) => setTimeout(r, 4000)); now = Date.now(); }
        for (const a of list) if (await claim(a.id)) show(a, now);
      } finally { busy = false; }
    }
    api.tick = tick;
    setTimeout(tick, 1200);
    setInterval(tick, 15000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
    addEventListener('fluence:shown', () => tick());
  }

  const api = { SENT, LATE, CHOICES, short, forDay, due, words, leadOf, can, canAsk, ask, allowWords, start };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.fluentioAlerts = api;
})(typeof window === 'object' ? window : globalThis);
