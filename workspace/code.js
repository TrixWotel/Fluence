// Code's languages: which one a file is (from the end of its name), a first version of a new file in each, the
// colors its words get as you type, and what runs here. JavaScript runs in a worker of its own, and Python in one too,
// with Pyodide (Python built to run in a browser), which comes from jsdelivr the first time a Python file runs. An HTML
// page shows in a sandboxed frame with the CSS and JavaScript files it names, and so does a CSS or JavaScript file, on
// the page that uses it. Java and C++ need a compiler, so those are written here and run on a computer.
const { el } = window.fluentio;

// the six a new file can be, each with its badge's color, and how it runs here ('' for not here)
export const LANGS = {
  html: { name: 'HTML', short: 'HTML', file: 'index', color: '#d4380d', runs: 'page' },
  css: { name: 'CSS', short: 'CSS', file: 'style', color: '#663399', runs: 'page' },
  js: { name: 'JavaScript', short: 'JS', file: 'script', color: '#f1e05a', ink: '#1b1f24', runs: 'js' },
  py: { name: 'Python', short: 'PY', file: 'main', color: '#3572a5', runs: 'py' },
  java: { name: 'Java', short: 'JAVA', file: 'Main', color: '#9a5b12', runs: '' },
  cpp: { name: 'C++', short: 'C++', file: 'main', color: '#c7254e', runs: '' },
};
// the other endings a name can have: what each is called, and which of the six it's colored like
const OTHERS = {
  mjs: ['JavaScript', 'js'], cjs: ['JavaScript', 'js'], jsx: ['JSX', 'js'], ts: ['TypeScript', 'js'], tsx: ['TSX', 'js'], json: ['JSON', 'js'],
  htm: ['HTML', 'html'], svg: ['SVG', 'html'], xml: ['XML', 'html'], scss: ['SCSS', 'css'], less: ['Less', 'css'],
  c: ['C', 'cpp'], h: ['C header', 'cpp'], cc: ['C++', 'cpp'], cxx: ['C++', 'cpp'], hpp: ['C++ header', 'cpp'],
  cs: ['C#', 'java'], kt: ['Kotlin', 'java'], swift: ['Swift', 'java'], go: ['Go', 'java'], rs: ['Rust', 'java'],
  sh: ['Shell', 'py'], rb: ['Ruby', 'py'], md: ['Markdown', ''], sql: ['SQL', ''], lua: ['Lua', ''], txt: ['Text', ''],
};
// (a name can end in anything, even .constructor, so only the lists' own entries count)
const own = (list, key) => Object.hasOwn(list, key);
export function langOf(title) {
  const ext = (/\.([a-z0-9+]+)$/i.exec(String(title).trim()) || [])[1]?.toLowerCase() || '';
  if (own(LANGS, ext)) return { ext, id: ext, like: ext, ...LANGS[ext] };
  const [name, like] = own(OTHERS, ext) ? OTHERS[ext] : [ext ? ext.toUpperCase() : 'Text', ''];
  return { ext, id: '', like, name, short: (ext || 'txt').toUpperCase().slice(0, 4), color: LANGS[like]?.color || '#6e7781', ink: LANGS[like]?.ink,
    runs: ext === 'mjs' ? 'js' : ext === 'htm' ? 'page' : '' };
}
// spaces a Tab puts in, and how far a line goes in after one that opens a block
export const indent = (like) => (like === 'py' || like === 'java' || like === 'cpp' ? '    ' : '  ');

// a new file in each: something that works straight away, and says how to run it
export function start(id, base = LANGS[id]?.file || 'main') {
  return {
    html: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My page</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello from Fluence</h1>
  <p>Press Preview to see this page. It uses the style.css and script.js in its folder, if there are any.</p>
  <button id="hello">Say hello</button>
  <script src="script.js"></script>
</body>
</html>
`,
    css: `/* Press Preview to see it on a page: the one in this folder that links it, or a sample */
body {
  margin: 2rem;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
}

h1 {
  color: #2f6fed;
}

button {
  padding: 8px 14px;
  border-radius: 8px;
}
`,
    js: `// Press Run to try it: what you log shows underneath
console.log('Hello from Fluence')
`,
    py: `# Press Run to try it: what you print shows underneath
name = "Fluence"
print(f"Hello from {name}")
`,
    java: `// Java runs on a computer with Java on it: download this file, then
// javac ${base}.java, and java ${base}
public class ${base} {
    public static void main(String[] args) {
        System.out.println("Hello from Fluence");
    }
}
`,
    cpp: `// C++ runs on a computer with a compiler: download this file, then
// g++ ${base}.cpp -o ${base}, and ./${base}
#include <iostream>

int main() {
    std::cout << "Hello from Fluence" << std::endl;
    return 0;
}
`,
  }[id] ?? '';
}
// a web page's script.js, made with its index.html and style.css
export const PAGE_SCRIPT = `// Runs on index.html in this folder: press Preview, then the button
const button = document.getElementById('hello')
button?.addEventListener('click', () => {
  document.querySelector('h1').textContent = 'Hello to you too'
  console.log('The button was pressed')
})
`;
// a page to show a CSS file on when no page in its folder uses it
export const SAMPLE = (css) => `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><link rel="stylesheet" href="${css}"></head>
<body>
  <h1>A heading</h1>
  <p>A paragraph with <a href="#">a link</a>, some <b>bold</b> and some <i>italic</i> words.</p>
  <h2>A smaller heading</h2>
  <ul><li>A list</li><li>of things</li></ul>
  <p><button>A button</button> <input placeholder="A text box"></p>
  <table><tr><th>A</th><th>Table</th></tr><tr><td>1</td><td>2</td></tr></table>
</body>
</html>
`;

// ---------- colors as you type ----------
// each language's words, in order: the first that matches at a place wins. c comments, s strings, n numbers,
// k keywords, b built in names, f functions called, t types and tags, a annotations and directives, p properties
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
const span = (kind, text) => `<span class="tk-${kind}">${esc(text)}</span>`;
const words = (list) => new RegExp(`\\b(?:${list.trim().split(/\s+/).join('|')})\\b`);
const SLASHES = [['c', /\/\/.*/], ['c', /\/\*[\s\S]*?\*\/|\/\*[\s\S]*/]];
const QUOTES = [['s', /"(?:\\.|[^\\"\n])*"?/], ['s', /'(?:\\.|[^\\'\n])*'?/]];
const NUMBER = ['n', /\b(?:0[xX][\da-fA-F_]+|0[bB][01_]+|\d[\d_]*(?:\.\d*)?(?:[eE][+-]?\d+)?)[a-zA-Z]*|\B\.\d+(?:[eE][+-]?\d+)?/];
const CALL = ['f', /\b[A-Za-z_$][\w$]*(?=\s*\()/];
const TYPE = ['t', /\b[A-Z][\w$]*/];
const RULES = {
  js: [...SLASHES, ['s', /`(?:\\[\s\S]|[^\\`])*`?/], ...QUOTES,
    ['k', words('await async break case catch class const continue debugger default delete do else export extends finally for from function get if import in instanceof let new of return set static super switch this throw try typeof var void while with yield')],
    ['b', words('true false null undefined NaN Infinity console document window Math JSON Object Array String Number Boolean Promise Map Set Date RegExp Error')],
    NUMBER, CALL, TYPE],
  py: [['c', /#.*/], ['s', /[rRbBfFuU]{0,2}(?:"""[\s\S]*?(?:"""|(?![\s\S]))|'''[\s\S]*?(?:'''|(?![\s\S])))/], ['s', /[rRbBfFuU]{0,2}(?:"(?:\\.|[^\\"\n])*"?|'(?:\\.|[^\\'\n])*'?)/],
    ['a', /@[\w.]+/],
    ['k', words('and as assert async await break case class continue def del elif else except finally for from global if import in is lambda match nonlocal not or pass raise return try while with yield')],
    ['b', words('True False None self print input len range int float str bool list dict set tuple open enumerate zip map filter sorted reversed sum min max abs round type isinstance super object any all')],
    NUMBER, CALL, TYPE],
  java: [...SLASHES, ['s', /"""[\s\S]*?(?:"""|(?![\s\S]))/], ...QUOTES, ['a', /@\w+/],
    ['k', words('abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for goto if implements import instanceof int interface long native new package private protected public record return short static strictfp super switch synchronized this throw throws transient try var void volatile while yield')],
    ['b', words('true false null String System Math Integer Double Character List ArrayList Map HashMap Scanner')],
    NUMBER, CALL, TYPE],
  cpp: [...SLASHES, ['a', /^[ \t]*#[ \t]*\w+/m], ['s', /(?<=#[ \t]*include[ \t]*)<[^>\n]*>/], ...QUOTES,
    ['k', words('alignas alignof auto bool break case catch char class const constexpr const_cast continue decltype default delete do double dynamic_cast else enum explicit extern float for friend goto if inline int long mutable namespace new noexcept operator private protected public register reinterpret_cast return short signed sizeof static static_cast struct switch template this throw try typedef typename union unsigned using virtual void volatile while')],
    ['b', words('true false nullptr std cout cin cerr endl string vector map set pair size_t printf scanf')],
    NUMBER, CALL, TYPE],
};
const joined = new Map();
function paintWith(text, rules) {
  let re = joined.get(rules);
  if (!re) joined.set(rules, (re = new RegExp(rules.map(([, r]) => `(${r.source})`).join('|'), 'gm')));
  let out = '', last = 0, m;
  re.lastIndex = 0;
  while ((m = re.exec(text))) {
    if (!m[0]) { re.lastIndex++; continue; }
    let g = 1;
    while (m[g] === undefined) g++;
    out += esc(text.slice(last, m.index)) + span(rules[g - 1][0], m[0]);
    last = re.lastIndex;
  }
  return out + esc(text.slice(last));
}
// CSS: what's a selector and what's a property depends on whether it's inside a rule's { }, so this one keeps count
const CSS = /(\/\*[\s\S]*?(?:\*\/|(?![\s\S])))|("(?:\\.|[^\\"\n])*"?|'(?:\\.|[^\\'\n])*'?)|([{};])|(@[\w-]+)|(!important)|([\w-]+(?=\())|(#[\w-]+)|(-?(?:\d+\.?\d*|\.\d+)(?:%|[a-zA-Z]+)?)|(-{0,2}[A-Za-z_][\w-]*(?=\s*:))|(::?[\w-]+)|([.]?-{0,2}[A-Za-z_][\w-]*)/g;
const GROUPS = /^@(?:-\w+-)?(?:media|supports|container|layer|document|scope|keyframes|starting-style)\b/;
function paintCss(text) {
  const blocks = [];
  let out = '', last = 0, before = '', m;
  CSS.lastIndex = 0;
  while ((m = CSS.exec(text))) {
    const t = m[0], gap = text.slice(last, m.index), inRule = blocks.at(-1) === 'rule';
    let kind = '';
    if (m[3]) {
      // (a { after @media and the like holds more rules, and any other holds a rule's properties)
      if (t === '{') blocks.push(GROUPS.test((before + gap).trim()) ? 'group' : 'rule');
      else if (t === '}') blocks.pop();
      before = '';
    } else {
      before += gap + (m[1] ? '' : t);
      kind = m[1] ? 'c' : m[2] ? 's' : m[4] || m[5] ? 'k' : m[6] ? 'f' : m[7] ? (inRule ? 'n' : 't') : m[8] ? 'n'
        : m[9] ? (inRule ? 'p' : 't') : m[10] ? (inRule ? '' : 'a') : inRule ? '' : 't';
    }
    out += esc(gap) + (kind ? span(kind, t) : esc(t));
    last = CSS.lastIndex;
  }
  return out + esc(text.slice(last));
}
// HTML: tags, their attributes and values, comments, and a script's or a style's insides in their own colors
const HTML = /<!--[\s\S]*?(?:-->|(?![\s\S]))|<![^>]*>?|<\/?[A-Za-z][\w:-]*(?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"?|'[^']*'?|[^\s>]+))?)*\s*\/?>?|&#?\w+;/g;
function tag(t) {
  const [, open, name, rest, close = ''] = /^(<\/?)([^\s>/]+)([\s\S]*?)(\/?>)?$/.exec(t);
  const parts = /(\s+)|([^\s="'/>]+)(?:(\s*=\s*)("[^"]*"?|'[^']*'?|[^\s>]+)?)?|([\s\S])/g;
  let attrs = '', x;
  while ((x = parts.exec(rest))) attrs += x[1] ?? (x[2] ? span('p', x[2]) + (x[3] ? esc(x[3]) + (x[4] ? span('s', x[4]) : '') : '') : esc(x[5]));
  return span('t', open + name) + attrs + (close ? span('t', close) : '');
}
function paintHtml(text) {
  let out = '', last = 0, m;
  HTML.lastIndex = 0;
  while ((m = HTML.exec(text))) {
    const t = m[0];
    out += esc(text.slice(last, m.index));
    if (t.startsWith('<!--')) out += span('c', t);
    else if (t.startsWith('<!')) out += span('a', t);
    else if (t[0] === '&') out += span('n', t);
    else {
      out += tag(t);
      const name = /^<([a-z]+)/i.exec(t)?.[1].toLowerCase();
      if ((name === 'script' || name === 'style') && !t.endsWith('/>')) {
        const end = text.toLowerCase().indexOf(`</${name}`, HTML.lastIndex), stop = end < 0 ? text.length : end;
        const inside = text.slice(HTML.lastIndex, stop);
        out += name === 'script' ? paintWith(inside, RULES.js) : paintCss(inside);
        HTML.lastIndex = stop;
      }
    }
    last = HTML.lastIndex;
  }
  return out + esc(text.slice(last));
}
// a file's text with its colors, as HTML (a very big one stays plain, so typing in it stays quick)
export function paint(text, like) {
  if (text.length > 300_000) return esc(text);
  if (like === 'html') return paintHtml(text);
  if (like === 'css') return paintCss(text);
  return RULES[like] ? paintWith(text, RULES[like]) : esc(text);
}

// ---------- running ----------
const say = (out, kind, text) => { out.hidden = false; out.append(el('div', { className: kind }, text)); };
// JavaScript runs in a worker of its own (no page to change, and it's stopped after 5 seconds): console.log, warn and
// error show underneath, and so does anything that goes wrong
let worker = null;
export function runJs(code, out) {
  worker?.terminate();
  out.hidden = false;
  out.replaceChildren();
  // (your code starts on the worker's 4th line, so a line it reports is 3 more than yours)
  const url = URL.createObjectURL(new Blob([`const show = (kind, args) => postMessage([kind, args.map((a) => { if (typeof a === 'string') return a; try { return JSON.stringify(a) ?? String(a); } catch { return String(a); } }).join(' ')]), where = (e) => { const m = /:(\\d+):\\d+/.exec(String((e && e.stack) || '').split('\\n').find((l) => l.includes('blob:')) || ''); return m ? \` (line \${m[1] - 3})\` : ''; };
console.log = console.info = (...a) => show('log', a); console.warn = (...a) => show('warn', a); console.error = (...a) => show('error', a);
(async () => {
${code}
})().catch((e) => show('error', [(e && e.name ? \`\${e.name}: \${e.message}\` : String(e)) + where(e)])).finally(() => postMessage(['done']));`], { type: 'text/javascript' }));
  const w = (worker = new Worker(url));
  const stop = setTimeout(() => { w.terminate(); say(out, 'warn', 'Stopped after 5 seconds.'); }, 5000);
  const end = () => { clearTimeout(stop); w.terminate(); URL.revokeObjectURL(url); };
  w.onmessage = (e) => {
    const [kind, text] = e.data;
    if (kind !== 'done') return say(out, kind, text);
    end();
    if (!out.childElementCount) say(out, 'note', 'Done. Nothing was logged.');
  };
  w.onerror = (e) => { e.preventDefault(); end(); say(out, 'error', `${(e.message || 'That code has an error').replace(/^Uncaught /, '')}${e.lineno > 3 ? ` (line ${e.lineno - 3})` : ''}`); };
}

// Python runs in a worker with Pyodide in it, started the first time and kept for the next run (so only the first one
// waits for the download). What it prints shows underneath as a terminal would show it, input() reads the Input box a
// line at a time (shown after its question, as if typed), and a run that goes on for 20 seconds is stopped, which stops
// its worker too (so the next run starts Python again)
const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
const PY = `importScripts('${PYODIDE}pyodide.js');
let py = null;
const say = (kind, text) => postMessage([kind, text]);
onmessage = async ({ data: { code, input, name } }) => {
  try {
    py = py || await loadPyodide({ indexURL: '${PYODIDE}' });
    say('ready');
    const lines = String(input).split(/\\r?\\n/), out = new TextDecoder(), err = new TextDecoder();
    if (lines[lines.length - 1] === '') lines.pop();
    py.setStdout({ write: (b) => { say('out', out.decode(b, { stream: true })); return b.length; } });
    py.setStderr({ write: (b) => { say('err', err.decode(b, { stream: true })); return b.length; } });
    py.setStdin({ stdin: () => { if (!lines.length) return null; const line = lines.shift(); say('in', line + '\\n'); return line; } });
    await py.loadPackagesFromImports(code, { messageCallback: (m) => say('note', m), errorCallback: (m) => say('warn', m) });
    const scope = py.globals.get('dict')();
    try { await py.runPythonAsync(code, { globals: scope, filename: name }); } finally { scope.destroy(); }
  } catch (e) { say('error', String((e && e.message) || e)); }
  say('done');
};`;
// (Pyodide's own lines in a traceback say nothing about your code, so they go)
function traceback(text, name) {
  const lines = String(text).split('\n'), kept = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^\s+File "(\/lib\/|<frozen )/.test(lines[i])) { while (i + 1 < lines.length && /^\s{4,}/.test(lines[i + 1])) i++; continue; }
    kept.push(lines[i].replace('File "<exec>"', `File "${name}"`));
  }
  const out = kept.join('\n').trim();
  return /\bEOFError\b/.test(out) ? `${out}\n(input() had nothing left to read: put the lines it reads in Input)` : out;
}
let python = null, running = null;
export const pythonRunning = () => !!running;
export function stopPython() { running?.('Stopped.'); }
export function runPython(code, input, out, name, done) {
  running?.('Stopped.');
  out.hidden = false;
  out.replaceChildren();
  if (!python) python = Object.assign(new Worker(URL.createObjectURL(new Blob([PY], { type: 'text/javascript' }))), { ready: false });
  const w = python;
  let timer = 0;
  const end = (why) => {
    clearTimeout(timer);
    w.onmessage = w.onerror = null;
    running = null;
    if (why) { w.terminate(); if (python === w) python = null; say(out, 'warn', why); }
    done?.();
  };
  running = end;
  const limit = () => { clearTimeout(timer); timer = setTimeout(() => end('Stopped after 20 seconds.'), 20000); };
  if (w.ready) limit();
  else {
    say(out, 'note', 'Starting Python. The first run takes a few seconds while it downloads.');
    timer = setTimeout(() => end('Python took too long to start. Check that you’re online, then press Run again.'), 90000);
  }
  // (what it prints comes in pieces: each goes on the line it's on, and a new line starts a new one)
  let line = null;
  const write = (kind, text) => {
    out.hidden = false;
    text.split('\n').forEach((part, i) => {
      if (i || !line) line = out.appendChild(el('div'));
      if (part) line.append(el('span', { className: kind }, part));
    });
  };
  const KIND = { out: 'log', err: 'warn', in: 'in' };
  w.onmessage = (e) => {
    const [kind, text] = e.data;
    if (kind === 'ready') { if (!w.ready) { w.ready = true; out.replaceChildren(); } return limit(); }
    if (kind === 'done') { end(); if (!out.textContent.trim()) say(out, 'note', 'Done. Nothing was printed.'); return; }
    if (KIND[kind]) return write(KIND[kind], text);
    line = null;
    say(out, kind, kind === 'error' ? traceback(text, name) : text);
  };
  w.onerror = (e) => { e.preventDefault(); end(); w.terminate(); if (python === w) python = null; say(out, 'error', 'Python couldn’t start. Check that you’re online, then press Run again.'); };
  w.postMessage({ code, input, name });
}

// a page for the preview frame: the CSS and JavaScript files it names put in as data: links (find gives a file's text
// from its path, or null), and a line first that sends what it logs, and its errors, up to the Workspace
const BRIDGE = `<script>(()=>{const s=(k,a)=>{try{parent.postMessage({fluentio:'preview',kind:k,text:a.map((x)=>{if(typeof x==='string')return x;try{return JSON.stringify(x)??String(x)}catch{return String(x)}}).join(' ')},'*')}catch{}};for(const[n,k]of[['log','log'],['info','log'],['warn','warn'],['error','error']]){const o=console[n].bind(console);console[n]=(...a)=>{s(k,a);o(...a)}}addEventListener('error',(e)=>s('error',[e.message+(e.lineno?' (line '+e.lineno+')':'')]));addEventListener('unhandledrejection',(e)=>s('error',[String(e.reason)]))})()</script>`;
export function pageFrom(html, find) {
  const data = (type, text) => `data:${type};charset=utf-8,${encodeURIComponent(text)}`;
  const swap = (tag, attr, type) => tag.replace(new RegExp(`\\b${attr}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'), (m, a, b, c) => {
    const text = find(a ?? b ?? c);
    return text == null ? m : `${attr}="${data(type, text)}"`;
  });
  const page = String(html)
    .replace(/<link\b[^>]*>/gi, (t) => (/\brel\s*=\s*["']?stylesheet/i.test(t) ? swap(t, 'href', 'text/css') : t))
    .replace(/<script\b[^>]*>/gi, (t) => swap(t, 'src', 'text/javascript'));
  const at = /^\s*<!doctype[^>]*>/i.exec(page)?.[0].length ?? 0;
  return page.slice(0, at) + BRIDGE + page.slice(at);
}
let watching = null;                                // the preview on show, and where what it logs goes
addEventListener('message', (e) => {
  if (!watching || e.source !== watching.frame.contentWindow || e.data?.fluentio !== 'preview') return;
  say(watching.out, ['log', 'warn', 'error'].includes(e.data.kind) ? e.data.kind : 'log', String(e.data.text));
});
export function preview(frame, out, page) {
  watching = { frame, out };
  out.replaceChildren();
  out.hidden = true;
  frame.hidden = false;
  frame.srcdoc = page;
}
