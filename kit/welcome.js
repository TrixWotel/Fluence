// The home page's welcome: a greeting for the time of day (or for a holiday), and a line under the name that changes with
// the date (holidays and the days before them, the seasons, AMC 10 season, the month, the time of day, the day of the
// week), with your music (what's playing, or where you left off) and with what you've done (your last topic, a new best
// score, days in a row, how long you've been away, topics learned). The wording changes from visit to visit. welcome(facts) touches no page, so it can be tried for any day:
//   facts = { now: Date, visits: { count, streak, away (whole days since the last visit, or null the first time) },
//             last: { topic, href, at } or null, learned (topics learned in all), best: { test, text, at } or null }
// and it returns { hello, line, link: { text, href } or null }. upcoming() lists the next few holidays and days off.
const DAY = 86400000;
const midnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const daysBetween = (a, b) => Math.round((midnight(b) - midnight(a)) / DAY);
// the n-th weekday (0 Sunday) of a month (0 January), or with n = −1 the last one
function nth(year, month, weekday, n) {
  if (n < 0) { const last = new Date(year, month + 1, 0); return new Date(year, month, last.getDate() - ((last.getDay() - weekday + 7) % 7)); }
  const first = new Date(year, month, 1);
  return new Date(year, month, 1 + ((weekday - first.getDay() + 7) % 7) + 7 * (n - 1));
}
// Easter Sunday (the Gregorian computus)
function easter(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(y, month - 1, day);
}
// the year's holidays: the day, how to greet it, and (for the big ones) a countdown in the days before
function holidays(y) {
  const on = (m, d) => new Date(y, m, d);
  return [
    { day: on(0, 1), hello: 'Happy New Year!', emoji: '🎉', line: 'A new year: a good day to start something.' },
    { day: on(1, 14), hello: 'Happy Valentine’s Day!', emoji: '💝', line: 'Show your favorite subject some love today.' },
    { day: on(2, 14), hello: 'Happy Pi Day!', emoji: '🥧', line: 'π = 3.14159… Celebrate with an AMC problem or two.' },
    { day: on(2, 17), hello: 'Happy St. Patrick’s Day!', emoji: '☘️', line: 'May your guesses be lucky and your working be right.' },
    { day: on(3, 1), hello: 'Happy April Fools’ Day!', emoji: '🃏', line: 'No tricks here: every answer is checked twice.' },
    { day: easter(y), hello: 'Happy Easter!', emoji: '🐣', line: 'Hunt for the right answer like it’s an egg.' },
    { day: nth(y, 4, 0, 2), hello: 'Happy Mother’s Day!', emoji: '💐', line: 'A good day to say thanks to someone.' },
    { day: nth(y, 4, 1, -1), hello: 'Happy Memorial Day', emoji: '🇺🇸', line: 'A long weekend: maybe one lesson, then rest.' },
    { day: nth(y, 5, 0, 3), hello: 'Happy Father’s Day!', emoji: '👔', line: 'A good day to say thanks to someone.' },
    { day: on(6, 4), hello: 'Happy Fourth of July!', emoji: '🎆', line: 'Enjoy the fireworks. Projectile motion, in the sky.' },
    { day: nth(y, 8, 1, 1), hello: 'Happy Labor Day!', emoji: '🛠️', line: 'A day off from work. Maybe not from one quick question.' },
    { day: on(9, 31), hello: 'Happy Halloween!', emoji: '🎃', line: 'The scariest thing here is problem 25.', before: 7, soon: (n) => `🎃 Halloween is ${n === 1 ? 'tomorrow' : `${n} days away`}` },
    { day: nth(y, 10, 4, 4), hello: 'Happy Thanksgiving!', emoji: '🦃', line: 'Thankful you’re here. Enjoy the day.', before: 5, soon: (n) => `🦃 Thanksgiving is ${n === 1 ? 'tomorrow' : `${n} days away`}` },
    { day: on(11, 24), hello: 'Merry Christmas Eve!', emoji: '🎄', line: 'Almost here. Enjoy the evening.' },
    { day: on(11, 25), hello: 'Merry Christmas!', emoji: '🎄', line: 'Have a wonderful day.', before: 20, soon: (n) => `🎄 ${n === 1 ? 'Christmas is tomorrow' : `${n} days until Christmas`}` },
    { day: on(11, 31), hello: 'Happy New Year’s Eve!', emoji: '🥂', line: 'One last lesson of the year?' },
  ];
}
// what the date says on its own: a holiday, or one coming up, a season starting, AMC 10 season, the first or last day of
// a month, the time of day, the month, or the day of the week
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function dateNote(now, pick) {
  const y = now.getFullYear(), list = holidays(y);
  const today = list.find((h) => daysBetween(h.day, now) === 0);
  const coming = list.map((h) => ({ h, n: daysBetween(now, h.day) })).find(({ h, n }) => h.before && n > 0 && n <= h.before);
  const m = now.getMonth(), d = now.getDate(), w = now.getDay(), hr = now.getHours(), lastDay = new Date(y, m + 1, 0).getDate();
  const season = { '2-20': '🌱 Spring is here', '5-21': '☀️ Summer starts today', '8-22': '🍂 Fall starts today', '11-21': '❄️ Winter starts today' }[`${m}-${d}`];
  const amc = (m === 9 && d >= 10) || (m === 10 && d <= 15);
  const weekday = [
    pick(['A slow Sunday is a fine time for one lesson.', 'Sunday: a good day to look back at what you missed.', 'Sunday reset: a playlist and a plan for the week?', 'Lazy Sunday. Put something good on.']),
    pick(['A new week, a fresh start.', 'Monday: one lesson to set up the week.', 'Monday again. Music on, one topic down.', 'New week, new playlist?']),
    pick(['Small steps add up.', 'A few questions a day goes a long way.', 'Tuesday: quietly getting things done.', 'One topic today keeps the test away.']),
    pick(['Halfway through the week.', 'Midweek: how about a practice set?', 'Wednesday: over the hump.', 'Midweek music break?']),
    pick(['Almost the weekend.', 'One more lesson before Friday?', 'Thursday: the weekend can almost hear you.', 'Nearly there. Keep going.']),
    pick(['Happy Friday!', 'It’s Friday: one more lesson before the weekend?', 'Friday feeling: turn the music up.', 'Made it to Friday.']),
    pick(['Weekend time: no rush today.', 'A relaxed Saturday is good for a test.', 'Saturday: take it easy, maybe one lesson.', 'Weekend soundtrack time.']),
  ][w];
  const daytime = hr >= 5 && hr < 9 ? pick(['An early start: the quiet hours are the best for thinking.', 'Up early. A question of the day goes well with breakfast.'])
    : hr >= 12 && hr < 14 ? pick(['Lunch break? A quick question fits.', 'Midday. Something to listen to while you eat?'])
      : hr >= 15 && hr < 18 ? pick(['After school: one topic, then some music?', 'Afternoon slump? A song and a short lesson fix that.'])
        : hr >= 20 && hr < 23 ? pick(['Evening: put something good on and wind down.', 'A calm evening is good for a playlist.'])
          : hr >= 23 || hr < 5 ? pick(['It’s late. Something quiet, then sleep?', 'Late night: soft music, short lessons.']) : '';
  const month = d === 1 ? `A new month: ${MONTHS[m]} starts today.` : d === lastDay ? `The last day of ${MONTHS[m]}.` : pick([
    ['January: a fresh year to learn something new.', 'February: short month, big progress.', 'March: spring’s on its way.', 'April: showers outside, music inside.', 'May: the year’s in full bloom.', 'June: summer’s almost here.',
      'July: long days, long playlists.', 'August: the last stretch of summer.', 'September: back to it.', 'October: cozy season starts.', 'November: warm drinks and good music.', 'December: the year’s nearly done.'][m], '']);
  const note = coming ? `${coming.h.soon(coming.n)}.` : season ? `${season}.` : amc && pick([true, false]) ? pick(['It’s AMC 10 season: a practice test keeps you sharp.', 'AMC 10 season is here. Try a test like the real one?']) : pick([weekday, weekday, daytime || weekday, month || weekday]);
  return { today, note };
}
function greetingFor(h, pick) {
  if (h < 5) return pick(['Good night', 'Up late', 'Hello, night owl', 'Still up', 'Quiet hours']);
  if (h < 9) return pick(['Good morning', 'Morning, early bird', 'Rise and shine', 'Hello, sunshine', 'Bright and early']);
  if (h < 12) return pick(['Good morning', 'Morning', 'Hey there', 'Top of the morning']);
  if (h < 14) return pick(['Good afternoon', 'Hey there', 'Hi again', 'Hello at lunchtime']);
  if (h < 17) return pick(['Good afternoon', 'Afternoon', 'Hello there', 'Hey']);
  if (h < 20) return pick(['Good evening', 'Evening', 'Hey there', 'Hello this evening']);
  if (h < 22) return pick(['Good evening', 'Evening', 'Winding down']);
  return pick(['Good evening', 'Late night hello', 'Night owl hours']);
}
// facts = { now, visits: { count, streak, away }, last, learned, best, name (the site's), music: { title, artist, playing,
// songs (how many), liked } or null }
export function welcome({ now = new Date(), visits = { count: 1, streak: 1, away: null }, last = null, learned = 0, best = null, name = 'Fluence', music = null } = {}) {
  // a different choice of words each visit, the same on a reload of the same visit
  let seed = (now.getFullYear() * 400 + now.getMonth() * 32 + now.getDate()) * 7919 + (visits.count || 0) * 104729;
  const pick = (list) => { seed = (seed * 1103515245 + 12345) % 2147483648; return list[Math.floor(seed / 65536) % list.length]; };   // (the high bits: the low ones just alternate)
  const { today, note } = dateNote(now, pick);
  const first = !visits.count || visits.count <= 1, away = visits.away;
  const g = greetingFor(now.getHours(), pick), hi = /^(hello|hey|hi)\b|hello$/i.test(g);
  const back = first ? `, welcome to ${name}` : away >= 14 ? ', long time no see' : away >= 1 || visits.count > 1 ? pick([', welcome back', ', good to see you', ', nice to see you again', ...(hi ? [] : [', hello again'])]) : '';
  // (a greeting with a comma in it, like "Hello, sunshine", gets the welcome as its own sentence, or none)
  const hello = today ? `${today.hello} ${today.emoji}` : !g.includes(',') ? `${g}${back}` : first ? `${g}. Welcome to ${name}` : g;
  // what you've done, most worth saying first
  const said = [];
  let link = null;
  const daysAgo = (t) => (t ? daysBetween(new Date(t), now) : Infinity), hr = now.getHours(), evening = hr >= 18 || hr < 5;
  if (first && !last && !learned) said.push('Pick a subject to start: every one has lessons, practice and tests.');
  if (best && daysAgo(best.at) <= 3) said.push(pick([`A new best on ${best.test}: ${best.text}. Nice work!`, `${best.text} on ${best.test}, your best yet.`]));
  if (away >= 7 && !first) said.push(pick([`It’s been ${away} days. Good to have you back.`, `${away} days since your last visit. Pick up where you left off?`]));
  else if (visits.streak >= 3) said.push(pick([`That’s ${visits.streak} days in a row. Keep it going!`, `${visits.streak} days in a row now.`, `Day ${visits.streak} in a row. Nice rhythm.`]));
  else if (visits.streak === 2 && !first) said.push(pick(['Two days in a row.', 'Back again today, nice.']));
  // music: what's on, or what you left off with (first in the evening, when you're more likely to want it)
  if (music?.playing && music.title) said[evening ? 'unshift' : 'push'](pick([`Now playing: ${music.title} by ${music.artist}.`, `${music.title} is playing. Good choice.`]));
  else if (music?.title && (evening || !last?.topic)) {
    said[evening ? 'unshift' : 'push'](pick([`Last time you were listening to ${music.title}.`, `${music.title} by ${music.artist} is where you left off.`, `Ready for more from ${music.artist}?`]));
    link ||= { text: `Play ${music.title}`, href: 'music/#now' };
  } else if (music?.songs && !music.title) said.push(pick([`${music.songs.toLocaleString('en-US')} song${music.songs === 1 ? '' : 's'} in your library, ready to play.`, evening ? 'Some music for the evening?' : 'Something to listen to while you study?']));
  if (last?.topic && daysAgo(last.at) <= 14) {
    said.push(pick([`Last time you were on ${last.topic}.`, `${last.topic} is waiting where you left it.`, `Pick up ${last.topic} again?`]));
    link = { text: `Continue ${last.topic}`, href: last.href };
  }
  if (learned >= 1 && said.length < 2) said.push(pick([`${learned} topic${learned === 1 ? '' : 's'} learned so far.`, `${learned} topic${learned === 1 ? '' : 's'} learned and counting.`]));
  // a line of two parts: the date's (or the holiday's own), then the most worth saying of yours
  const dated = today ? `${greetingFor(hr, pick)}! ${today.line}` : note;
  const line = [dated, ...said].slice(0, said.length ? 2 : 1).join(' ');
  return { hello, line, link };
}
// the next few holidays and your days off from today (today's own counts, as 0 days): { name, emoji, days }, soonest
// first, for the home page's Today tile. A day off (settings.js's daysOff) also has off: true, its last day (to), and
// how many days until then (left)
export function upcoming(now = new Date(), count = 3, daysOff = []) {
  const y = now.getFullYear();
  const day = (text) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text || ''); return m ? new Date(+m[1], m[2] - 1, +m[3]) : null; };
  const off = daysOff.map((d) => ({ name: d.name, emoji: d.emoji || '🏖️', off: true, from: day(d.from), to: day(d.to || d.from) })).filter((h) => h.name && h.from && h.to)
    .map((h) => ({ ...h, days: Math.max(0, daysBetween(now, h.from)), left: daysBetween(now, h.to) })).filter((h) => h.left >= 0);
  return [...holidays(y), ...holidays(y + 1)]
    .map((h) => ({ name: h.hello.replace(/^(Happy|Merry) /, '').replace(/!$/, ''), emoji: h.emoji, days: daysBetween(now, h.day) }))
    .filter((h) => h.days >= 0).concat(off).sort((a, b) => a.days - b.days).slice(0, count);
}
