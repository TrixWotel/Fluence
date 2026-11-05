// Fluence's settings: the colors, the look, the motion, and the words on the pages.
//
// Two ways to change them:
// On the site, Settings (the button at the top right) shows each change as you make it, but keeps it in that browser
// only. Its "Copy as settings.js" gives you a whole new version of this file.
// Here, for every device: open this file on the space branch, press the pencil, change a value (or paste that copy over
// everything), then press Commit changes. The whole site follows a minute or two later.
//
// Colors can be any CSS color: '#2f6fed', 'tomato', 'rgb(47 111 237)'. Keep the quotes and the commas.
// If something here has a typo, the site keeps working with its usual look.

window.FLUENTIO_SETTINGS = {
  // the name at the top of the home page, and the line under it
  name: 'Fluence',
  tagline: 'Web stack workspace',
  logoColor: '',           // the icon on the browser's tab: any color, or '' for the usual blue and violet
  greeting: true,          // the welcome on the home page: a greeting, and a line that changes with the day and what you’ve done

  // 'auto' follows the device's light or dark mode, 'light' or 'dark' always uses that one
  theme: 'auto',

  colors: {
    light: {
      accent: '#2f6fed',     // buttons, links and anything selected
      accent2: '#9b5cf6',    // the second color in gradients and the drifting colors
      background: '#f6f7f9', // behind everything
      card: '#ffffff',       // cards, questions and panels
      text: '#1b1f24',
      muted: '#5b6470',      // quieter text
      line: '#e3e6ea',       // borders
      right: '#2da44e',      // right answers
      wrong: '#e5534b',      // wrong answers
      second: '#e8743b',     // the second line on graphs and drawings
    },
    dark: {
      accent: '#6c9bff',
      accent2: '#b48cff',
      background: '#0f1115',
      card: '#171a21',
      text: '#e8eaee',
      muted: '#9aa3ae',
      line: '#262b35',
      right: '#3fb950',
      wrong: '#f85149',
      second: '#f0a04b',
    },
  },

  // the world map on the Geography page
  map: {
    light: { ocean: '#d6e6f5', land: '#e4e1da', country: '#fbf8f1', border: '#9aa4b1', late: '#d4a72c' },
    dark: { ocean: '#0c1828', land: '#23272e', country: '#4d5768', border: '#151920', late: '#d29922' },
  },

  font: 'system',          // 'system', 'rounded', 'serif', 'mono', or any CSS font list
  corners: 14,             // how round cards and buttons are, in pixels (0 is square)
  style: 'glow',           // 'glow' (soft shadows, glowing edges and gradients) or 'flat' (borders and solid colors, like GitHub)
  textSize: 16,            // how big the words are, in pixels (12 to 20)

  animations: true,        // false turns every animation off (devices set to reduce motion never get them)
  speed: 1,                // 1 is normal, 2 is twice as fast, 0.5 is half as fast
  floatingColors: true,    // the soft colors drifting behind the pages
  // Data, Code and Notes, each on its own: false turns that one's animations off
  animationsIn: { data: true, code: true, notes: true },

  // the keys (Settings can record new ones): Ctrl, Alt, Shift or Meta (⌘ on a Mac) with a key, like 'Ctrl+K', and ''
  // turns one off. On Windows and Linux the browser keeps Ctrl with a number for its tabs, so there Ctrl+1 works as Alt+1
  keys: { search: 'Ctrl+K', home: 'Ctrl+1', study: 'Ctrl+2', music: 'Ctrl+3', data: 'Ctrl+4', code: 'Ctrl+5', notes: 'Ctrl+6' },

  // the home page's tiles, in this order (take one out to hide it): 'workspace' (what you worked on last), 'music',
  // 'study', 'progress', 'today', 'question', 'data' and 'quick'
  home: ['workspace', 'music', 'study', 'progress', 'today', 'question', 'data', 'quick'],
  // which tiles the home page shows (it fits one screen, so three of them, with the rest a click away): 'auto' picks them
  // by what you've been doing and the time of day, or always 'classic' (the tiles above, in their order), 'study',
  // 'music' or 'calm'
  homeLayout: 'auto',
  // where the home page's words and buttons sit: 'left', 'center' or 'right' (the page itself stays in the middle of the window)
  homeAlign: 'center',
  // your days off, with the next holidays on the home page's Today tile: a name, an emoji, the first day and (if it's more
  // than one) the last. days-off.ics, next to this file, is the same list as a calendar link: change both
  showDaysOff: true,
  daysOff: [
    { name: 'All Souls’ Day', emoji: '🕯️', from: '2026-11-02' },
    { name: 'Republic Proclamation Day', emoji: '🇧🇷', from: '2026-11-15' },
    { name: 'Black Awareness Day', emoji: '✊', from: '2026-11-20' },
    { name: 'Founding of São Paulo', emoji: '🏙️', from: '2027-01-25' },
    { name: 'Carnival', emoji: '🎭', from: '2027-02-08', to: '2027-02-12' },
    { name: 'Good Friday', emoji: '✝️', from: '2027-03-26' },
    { name: 'Tiradentes', emoji: '🇧🇷', from: '2027-04-21' },
    { name: 'Labor Day', emoji: '🛠️', from: '2027-05-01' },
    { name: 'Corpus Christi', emoji: '⛪', from: '2027-05-27', to: '2027-05-28' },
  ],
  // the buttons on the Quick tile (a link can also be a whole web address)
  quick: [
    { title: 'New note', link: 'notes/#new/note' },
    { title: 'New sheet', link: 'data/#new/table' },
    { title: 'Start AMC test', link: 'math/#amc10/test' },
    { title: 'Science test', link: 'science/#heat/exam' },
    { title: 'Physics tests', link: 'physics/' },
    { title: 'Spanish words', link: 'spanish/#vocab/learn' },
  ],

  // the names of Data (databases of docs and sheets), Code and Notes in the bar, kept in your browser (Settings can
  // back them up)
  dataTitle: 'Data',
  codeTitle: 'Code',
  notesTitle: 'Notes',

  // Music (the music/ page): its name in the bar and on its page
  musicTitle: 'Music',

  // Modules (the study/ page): its title, the line under it, and its subjects in this order (color is the subject's
  // own color)
  studyTitle: 'Modules',
  studyIntro: 'Pick a subject. Take a test, learn it one topic at a time, or practise any question.',
  study: [
    { emoji: '🌍', title: 'Geography', text: 'Find countries and capitals on the world map, or one continent at a time.', link: 'geography/', color: '#1f9d74' },
    { emoji: '📐', title: 'Math', text: 'Triangle angles, and AMC 10 practice in 157 topics, from the first problems of a test to the hardest.', link: 'math/', color: '#2f6fed' },
    { emoji: '🧪', title: 'Science', text: 'Heat and energy: tests like the ones in class, and Q = mcΔT practice.', link: 'science/', color: '#8b5cf6' },
    { emoji: '🚀', title: 'Physics', text: 'Kinematics, motion in a straight line, vectors and projectiles: tests like the ones in class, and practice.', link: 'physics/', color: '#e8743b' },
    { emoji: '🇪🇸', title: 'Spanish', text: '1,100 words in 25 themes, and the preterite and the imperfect.', link: 'spanish/', color: '#e5484d' },
    { emoji: '🏰', title: 'History', text: 'The Middle Ages, from the fall of Rome to the printing press: people, dates and big ideas.', link: 'history/', color: '#b7791f' },
  ],
};
