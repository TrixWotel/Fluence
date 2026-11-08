// Station's Markdown: a note's text as blocks (each one a stretch of the text, so it can be edited on its own and put
// back), each block as HTML, tables as rows to change and write back out, and the [[links]] in a note. Links work the
// way Obsidian's do, so the same files open there too: [[a note]], [[a note|other words]], [[a note#a heading]], and
// ![[a picture.png]] to show a picture. Nothing here touches the page: app.js puts the HTML in and answers the links
// (ctx.wiki, ctx.embed, ctx.image and ctx.link), so this file can be tested on its own.

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// ---------- blocks ----------
const FENCE = /^ {0,3}(`{3,}|~{3,})/;
const HEADING = /^ {0,3}(#{1,6})(?:[ \t]+|$)/;
const HR = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;
const QUOTE = /^ {0,3}>/;
export const ITEM = /^([ \t]*)([-*+]|\d{1,9}[.)])([ \t]+|$)/;
const SEP = /^[ \t]*\|?[ \t]*:?-+:?[ \t]*(\|[ \t]*:?-+:?[ \t]*)*\|?[ \t]*$/;
// (a table: a row with a | in it, then a row of dashes and |s under it)
const tableAt = (lines, i) => i + 1 < lines.length && lines[i].text.includes('|') && lines[i + 1].text.includes('|') && lines[i + 1].text.includes('-') && SEP.test(lines[i + 1].text);

// the text's lines, each with where it starts and ends
function linesOf(src) {
  const out = [];
  let at = 0;
  for (const text of String(src).split('\n')) { out.push({ text, from: at, to: at + text.length }); at += text.length + 1; }
  return out;
}

// the blocks, in order: { kind, from, to } (to is where its last line ends), and a heading's level. Blank lines are
// between blocks, never in one, except inside a code block
export function blocks(src) {
  const lines = linesOf(src), n = lines.length, out = [];
  const add = (kind, a, b, more) => out.push({ kind, from: lines[a].from, to: lines[b].to, ...more });
  const blank = (i) => !lines[i].text.trim();
  // (what starts a block of its own, and so ends a paragraph)
  const starts = (i) => { const t = lines[i].text; return FENCE.test(t) || HEADING.test(t) || HR.test(t) || QUOTE.test(t) || ITEM.test(t) || tableAt(lines, i); };
  let i = 0;
  // (Obsidian's properties, between --- lines at the very top)
  if (n > 2 && /^---[ \t]*$/.test(lines[0].text)) {
    for (let j = 1; j < Math.min(n, 80); j++) if (/^(---|\.\.\.)[ \t]*$/.test(lines[j].text)) { add('props', 0, j); i = j + 1; break; }
  }
  while (i < n) {
    const t = lines[i].text;
    if (!t.trim()) { i++; continue; }
    let m;
    if ((m = FENCE.exec(t))) {
      const close = new RegExp(`^ {0,3}${m[1][0] === '`' ? '`' : '~'}{${m[1].length},}[ \\t]*$`);
      let j = i + 1;
      while (j < n && !close.test(lines[j].text)) j++;
      add('code', i, Math.min(j, n - 1));
      i = j + 1;
    } else if ((m = HEADING.exec(t))) { add('heading', i, i, { level: m[1].length }); i++; }
    else if (HR.test(t)) { add('hr', i, i); i++; }
    else if (tableAt(lines, i)) {
      let j = i + 2;
      while (j < n && !blank(j) && lines[j].text.includes('|')) j++;
      add('table', i, j - 1);
      i = j;
    } else if (QUOTE.test(t)) {
      let j = i;
      while (j + 1 < n && QUOTE.test(lines[j + 1].text)) j++;
      add('quote', i, j);
      i = j + 1;
    } else if (ITEM.test(t)) {
      let j = i;
      while (j + 1 < n && !blank(j + 1) && (ITEM.test(lines[j + 1].text) || /^[ \t]{2,}\S/.test(lines[j + 1].text))) j++;
      add('list', i, j);
      i = j + 1;
    } else {
      let j = i;
      while (j + 1 < n && !blank(j + 1) && !starts(j + 1)) j++;
      // (a paragraph of nothing but pictures shows them as pictures, a figure)
      const text = lines.slice(i, j + 1).map((l) => l.text).join('\n');
      add(/^(\s*!\[\[[^\]\n]+\]\]\s*|\s*!\[[^\]\n]*\]\([^)\n]+\)\s*)+$/.test(text) ? 'figure' : 'para', i, j);
      i = j + 1;
    }
  }
  return out;
}

// ---------- words in a line: links, pictures, bold and the rest ----------
// a long web address, shorter to read: frame.work/products/laptop-13…
export function short(url) {
  try {
    const u = new URL(url), path = decodeURIComponent(u.pathname).replace(/\/$/, '');
    const all = u.hostname.replace(/^www\./, '') + path + (u.search ? '?…' : '');
    return all.length > 48 ? `${all.slice(0, 46)}…` : all;
  } catch { return url; }
}
// [[target#heading|words]] in its parts
export function linkParts(inner) {
  const bar = inner.indexOf('|'), main = bar < 0 ? inner : inner.slice(0, bar), label = bar < 0 ? '' : inner.slice(bar + 1).trim();
  const hash = main.indexOf('#');
  return { target: (hash < 0 ? main : main.slice(0, hash)).trim(), heading: hash < 0 ? '' : main.slice(hash + 1).trim(), label };
}
const HELD = /\u0000(\d+)\u0000/g;
// a line's words as HTML. ctx answers the links: wiki(inner), embed(inner), image(src, alt), link(url, html)
export function inline(text, ctx = {}, keep = [], nested = false) {
  const hold = (html) => `\u0000${keep.push(html) - 1}\u0000`;
  let s = String(text).replace(/\u0000/g, '');
  s = s.replace(/(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/g, (m, ticks, code) => hold(`<code>${esc(/^ .* $/.test(code) ? code.slice(1, -1) : code)}</code>`));
  s = s.replace(/\\([\\`*_{}[\]()#+\-.!|~=<>])/g, (m, c) => hold(esc(c)));
  if (!nested) {
    s = s.replace(/!\[\[([^\]\n]+?)\]\]/g, (m, inner) => hold(ctx.embed ? ctx.embed(inner) : esc(m)));
    s = s.replace(/\[\[([^\]\n]+?)\]\]/g, (m, inner) => hold(ctx.wiki ? ctx.wiki(inner) : esc(linkParts(inner).label || linkParts(inner).target)));
    s = s.replace(/!\[([^\]\n]*)\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"\n]*")?\s*\)/g, (m, alt, src) => hold(ctx.image ? ctx.image(src, alt) : esc(alt)));
    s = s.replace(/\[([^\]\n]+)\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"\n]*")?\s*\)/g, (m, label, url) => hold(ctx.link ? ctx.link(url, inline(label, ctx, keep, true)) : inline(label, ctx, keep, true)));
    s = s.replace(/<((?:https?|mailto):[^\s>]+)>/g, (m, url) => hold(ctx.link ? ctx.link(url, esc(short(url))) : esc(url)));
    s = s.replace(/\bhttps?:\/\/[^\s<>()\u0000]*[^\s<>()\u0000.,;:!?'"*_~]/g, (url) => hold(ctx.link ? ctx.link(url, esc(short(url))) : esc(url)));
  }
  s = esc(s)
    .replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^\w])__(?=\S)([\s\S]*?\S)__(?!\w)/g, '$1<strong>$2</strong>')
    .replace(/(^|[^*])\*(?=[^\s*])([\s\S]*?[^\s*])\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/(^|[^\w])_(?=[^\s_])([\s\S]*?[^\s_])_(?!\w)/g, '$1<em>$2</em>')
    .replace(/~~(?=\S)([\s\S]*?\S)~~/g, '<del>$1</del>')
    .replace(/==(?=\S)([\s\S]*?\S)==/g, '<mark>$1</mark>');
  if (nested) return s;
  for (let tries = 0; HELD.test(s) && tries < 8; tries++) s = s.replace(HELD, (m, k) => keep[+k] ?? '');
  return s;
}

// a heading's words as a place in the page (#a-heading)
export const slug = (text) => String(text).toLowerCase().replace(/<[^>]*>/g, '').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'section';
// a heading's words, without its marks
export const headingText = (line) => line.replace(HEADING, '').replace(/[ \t]+#+[ \t]*$/, '').trim();

// ---------- tables ----------
// a row's cells (| a | b |, or a | b), with \| kept as a | inside a cell
export function cells(line) {
  let t = line.trim();
  if (t.startsWith('|')) t = t.slice(1);
  if (t.endsWith('|') && !t.endsWith('\\|')) t = t.slice(0, -1);
  const out = [];
  let cell = '', code = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === '\\' && t[i + 1] === '|') { cell += '|'; i++; continue; }
    if (c === '`') code = !code;
    if (c === '|' && !code) { out.push(cell.trim()); cell = ''; continue; }
    cell += c;
  }
  out.push(cell.trim());
  return out;
}
export function parseTable(text) {
  const lines = String(text).split('\n').filter((l) => l.trim());
  const head = cells(lines[0] || ''), width = head.length;
  const align = cells(lines[1] || '').map((c) => (/^:-+:$/.test(c) ? 'center' : /^-+:$/.test(c) ? 'right' : /^:-+$/.test(c) ? 'left' : ''));
  const fit = (row) => Array.from({ length: width }, (_, i) => row[i] ?? '');
  return { head, align: fit(align), rows: lines.slice(2).map((l) => fit(cells(l))) };
}
// a table as Markdown again, its columns lined up so it reads well as text too
export function tableText({ head, align = [], rows }) {
  const put = (c) => String(c ?? '').replace(/\n/g, '<br>').replace(/\|/g, '\\|');
  const all = [head, ...rows].map((r) => r.map(put));
  const widths = head.map((_, c) => Math.max(3, ...all.map((r) => [...(r[c] ?? '')].length)));
  const pad = (s, w) => s + ' '.repeat(Math.max(0, w - [...s].length));
  const line = (r) => `| ${widths.map((w, c) => pad(r[c] ?? '', w)).join(' | ')} |`;
  const sep = `| ${widths.map((w, c) => { const a = align[c]; const d = '-'.repeat(Math.max(1, w - (a === 'center' ? 2 : a ? 1 : 0))); return a === 'center' ? `:${d}:` : a === 'right' ? `${d}:` : a === 'left' ? `:${d}` : d; }).join(' | ')} |`;
  return [line(all[0]), sep, ...all.slice(1).map(line)].join('\n');
}

// ---------- a block as HTML ----------
// (ctx as for inline; a block's to-dos carry where their [ ] is in the note, so a click can tick one there)
export function render(src, b, ctx = {}) {
  const text = src.slice(b.from, b.to);
  switch (b.kind) {
    case 'heading': {
      const words = headingText(text);
      return `<h${b.level} id="${esc(slug(words))}">${inline(words, ctx) || '&nbsp;'}</h${b.level}>`;
    }
    case 'hr': return '<hr>';
    case 'code': {
      const lines = text.split('\n'), lang = lines[0].replace(FENCE, '').trim().split(/\s/)[0];
      const body = lines.slice(1, FENCE.test(lines.at(-1)) && lines.length > 1 ? -1 : undefined).join('\n');
      return `<pre${lang ? ` data-lang="${esc(lang)}"` : ''}><code>${esc(body)}</code></pre>`;
    }
    case 'props': return `<pre class="props"><code>${esc(text.split('\n').slice(1, -1).join('\n'))}</code></pre>`;
    case 'quote': {
      const lines = text.split('\n').map((l) => l.replace(/^ {0,3}> ?/, ''));
      const call = /^\[!(\w+)\][+-]?\s*(.*)$/.exec(lines[0]);
      if (call) return `<blockquote class="callout" data-kind="${esc(call[1].toLowerCase())}"><p class="callout-title">${inline(call[2] || call[1], ctx)}</p>${lines.length > 1 ? `<p>${lines.slice(1).map((l) => inline(l, ctx)).join('<br>')}</p>` : ''}</blockquote>`;
      return `<blockquote><p>${lines.map((l) => inline(l, ctx)).join('<br>')}</p></blockquote>`;
    }
    case 'table': {
      const t = parseTable(text), al = (c) => (t.align[c] ? ` style="text-align:${t.align[c]}"` : '');
      const cell = (v) => inline(v, ctx).replace(/&lt;br\s*\/?&gt;/gi, '<br>') || '';
      return `<div class="tbl"><table><thead><tr>${t.head.map((h, c) => `<th data-r="-1" data-c="${c}"${al(c)}>${cell(h)}</th>`).join('')}</tr></thead><tbody>${t.rows.map((r, ri) => `<tr>${r.map((v, c) => `<td data-r="${ri}" data-c="${c}"${al(c)}>${cell(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    }
    case 'list': return list(text, b.from, ctx);
    case 'figure': return `<p class="fig">${inline(text.replace(/\n/g, ' '), ctx)}</p>`;
    default: return `<p>${text.split('\n').map((l) => inline(l, ctx)).join('<br>')}</p>`;
  }
}
// a list, nested by how far in each item starts, with to-dos as boxes to tick
function list(text, from, ctx) {
  const items = [];
  let at = from;
  for (const line of text.split('\n')) {
    const m = ITEM.exec(line);
    if (m) {
      const rest = line.slice(m[0].length), task = /^\[([ xX])\](?=\s|$)/.exec(rest);
      items.push({ indent: m[1].replace(/\t/g, '    ').length, tag: /\d/.test(m[2]) ? 'ol' : 'ul', start: parseInt(m[2], 10), done: task ? task[1] !== ' ' : null, box: task ? at + m[0].length : -1, text: task ? rest.slice(3).trim() : rest });
    } else if (items.length) items.at(-1).text += `\n${line.trim()}`;
    at += line.length + 1;
  }
  const open = (it) => (it.tag === 'ol' ? `<ol${it.start > 1 ? ` start="${it.start}"` : ''}>` : `<ul${it.done !== null ? ' class="tasks"' : ''}>`);
  const li = (it) => `<li${it.done !== null ? ` class="task${it.done ? ' done' : ''}"` : ''}>${it.done !== null ? `<input type="checkbox" data-box="${it.box}"${it.done ? ' checked' : ''} aria-label="Done">` : ''}<span>${it.text.split('\n').map((l) => inline(l, ctx)).join('<br>') || '&nbsp;'}</span>`;
  let html = '';
  const stack = [];
  for (const it of items) {
    if (!stack.length || it.indent > stack.at(-1).indent) { html += open(it); stack.push(it); }
    else {
      while (stack.length > 1 && it.indent < stack.at(-1).indent) html += `</li></${stack.pop().tag}>`;
      html += '</li>';
      if (stack.at(-1).tag !== it.tag) { html += `</${stack.pop().tag}>${open(it)}`; stack.push(it); }
    }
    html += li(it);
  }
  while (stack.length) html += `</li></${stack.pop().tag}>`;
  return html;
}

// ---------- links in a note ----------
// every [[link]] and ![[picture]] in a note, where it is, and its parts (none from inside code)
export function links(src) {
  const out = [], text = String(src);
  const code = [];
  for (const m of text.matchAll(/```[\s\S]*?(?:```|$)|`[^`\n]+`/g)) code.push([m.index, m.index + m[0].length]);
  const inCode = (i) => code.some(([a, b]) => i >= a && i < b);
  for (const m of text.matchAll(/(!?)\[\[([^\]\n]+?)\]\]/g)) {
    if (inCode(m.index)) continue;
    out.push({ ...linkParts(m[2]), embed: !!m[1], from: m.index, to: m.index + m[0].length, inner: m[2] });
  }
  return out;
}
// a note with every link to one name (or path) changed to another, keeping each link's heading and words
export function renameLinks(src, matches, next) {
  return String(src).replace(/(!?)\[\[([^\]\n]+?)\]\]/g, (m, bang, inner) => {
    const p = linkParts(inner);
    if (!matches(p.target)) return m;
    return `${bang}[[${next}${p.heading ? `#${p.heading}` : ''}${p.label ? `|${p.label}` : ''}]]`;
  });
}

// ---------- a note in other words ----------
// its words, without the marks (for search, and for the first line of a note in a list)
export function plain(src) {
  return String(src).replace(/```[\s\S]*?(```|$)/g, ' ').replace(/!\[\[[^\]]*\]\]/g, ' ').replace(/\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g, (m, a, b) => b || a.replace(/#.*/, ''))
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/^\s*(#{1,6}|>|[-*+]\s+\[[ xX]\]|[-*+]|\d+[.)])\s+/gm, '')
    .replace(/^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/gm, ' ').replace(/\|/g, ' ').replace(/[*_~`=]/g, '').replace(/\s+/g, ' ').trim();
}
export const words = (src) => { const t = plain(src); return t ? t.split(/\s+/).length : 0; };
// where a place in a block's words is in its text: the words shown are the text with its marks taken out, so step
// through both (a mark is anything in the text that isn't next in the words)
export function sourceOffset(text, shown, at) {
  let i = 0, j = 0;
  while (i < text.length && j < at) {
    if (text[i] === shown[j] || (/\s/.test(text[i]) && /\s/.test(shown[j]))) { i++; j++; } else i++;
  }
  return i;
}
