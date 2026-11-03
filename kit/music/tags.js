// What a song file says about itself: its title, artist and album, and its cover art, from the tags most files carry
// (ID3 in an MP3, the iTunes atoms in an M4A, Vorbis comments in a FLAC). A file without them is named from its file
// name ("Artist - Title.mp3"). Nothing here touches the page, so it can be tried outside a browser.
const latin1 = (b) => String.fromCharCode(...b);
function decode(bytes, enc) {
  if (enc === 1 || enc === 2) {   // UTF-16, with a byte order mark (1) or big-endian (2)
    let le = enc === 1 && bytes[0] === 0xff, start = enc === 1 && (bytes[0] === 0xff || bytes[0] === 0xfe) ? 2 : 0;
    return new TextDecoder(le ? 'utf-16le' : 'utf-16be').decode(bytes.subarray(start));
  }
  return enc === 3 ? new TextDecoder().decode(bytes) : latin1(bytes);
}
const clean = (s) => String(s ?? '').replace(/\0+$/g, '').split('\0')[0].trim();
const syncsafe = (b, i) => (b[i] << 21) | (b[i + 1] << 14) | (b[i + 2] << 7) | b[i + 3];

// ID3v2 (2.2, 2.3 and 2.4) at the start of an MP3, then ID3v1 at its end
function id3(b) {
  const out = {};
  if (latin1(b.subarray(0, 3)) === 'ID3') {
    const ver = b[3], flags = b[5], size = syncsafe(b, 6) + 10;
    let i = 10;
    if (flags & 0x40 && ver >= 3) i += ver === 4 ? syncsafe(b, 10) : ((b[10] << 24) | (b[11] << 16) | (b[12] << 8) | b[13]) + 4;   // an extended header
    const idLen = ver === 2 ? 3 : 4, hdr = ver === 2 ? 6 : 10;
    const NAMES = ver === 2 ? { TT2: 'title', TP1: 'artist', TAL: 'album', PIC: 'pic' } : { TIT2: 'title', TPE1: 'artist', TALB: 'album', APIC: 'pic' };
    while (i + hdr <= Math.min(size, b.length)) {
      const id = latin1(b.subarray(i, i + idLen));
      if (!/^[A-Z0-9]+$/.test(id)) break;
      const len = ver === 2 ? (b[i + 3] << 16) | (b[i + 4] << 8) | b[i + 5] : ver === 4 ? syncsafe(b, i + 4) : (b[i + 4] << 24) | (b[i + 5] << 16) | (b[i + 6] << 8) | b[i + 7];
      const body = b.subarray(i + hdr, i + hdr + len);
      i += hdr + len;
      const what = NAMES[id];
      if (!what || !body.length) continue;
      if (what !== 'pic') { out[what] ??= clean(decode(body.subarray(1), body[0])); continue; }
      if (out.picture) continue;
      // a picture: its encoding, its type (a MIME type, or three letters in 2.2), a picture type, a description, the bytes
      const enc = body[0];
      let j = 1, mime;
      if (ver === 2) { mime = { JPG: 'image/jpeg', PNG: 'image/png' }[latin1(body.subarray(1, 4)).toUpperCase()] || 'image/jpeg'; j = 4; }
      else { const end = body.indexOf(0, 1); mime = latin1(body.subarray(1, end)) || 'image/jpeg'; j = end + 1; }
      j += 1;   // the picture type
      if (enc === 1 || enc === 2) { while (j + 1 < body.length && (body[j] || body[j + 1])) j += 2; j += 2; }
      else { while (j < body.length && body[j]) j++; j++; }
      if (!mime.includes('/')) mime = `image/${mime.toLowerCase() === 'jpg' ? 'jpeg' : mime.toLowerCase()}`;
      out.picture = { mime, data: body.slice(j) };
    }
  }
  if (b.length > 128 && latin1(b.subarray(b.length - 128, b.length - 125)) === 'TAG') {
    const t = b.subarray(b.length - 128);
    out.title ||= clean(latin1(t.subarray(3, 33)));
    out.artist ||= clean(latin1(t.subarray(33, 63)));
    out.album ||= clean(latin1(t.subarray(63, 93)));
  }
  return out;
}

// an M4A: the iTunes atoms under moov › udta › meta › ilst
function mp4(b) {
  const out = {}, dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const walk = (from, to, path) => {
    for (let i = from; i + 8 <= to;) {
      let size = dv.getUint32(i), head = 8;
      const type = latin1(b.subarray(i + 4, i + 8));
      if (size === 1 && i + 16 <= to) { size = Number(dv.getBigUint64(i + 8)); head = 16; }
      if (size === 0) size = to - i;
      if (size < head || i + size > to) break;
      if (['moov', 'udta', 'ilst'].includes(type)) walk(i + head, i + size, [...path, type]);
      else if (type === 'meta') walk(i + head + 4, i + size, [...path, type]);   // (meta has 4 bytes of version first)
      else if (path.at(-1) === 'ilst') {
        const data = i + head;   // the item's own 'data' atom: size, 'data', a type, a locale, then the value
        if (latin1(b.subarray(data + 4, data + 8)) === 'data') {
          const kind = dv.getUint32(data + 8) & 0xffffff, value = b.subarray(data + 16, i + size);
          const what = { '©nam': 'title', '©ART': 'artist', aART: 'albumArtist', '©alb': 'album' }[type];
          if (what) out[what] ??= clean(new TextDecoder().decode(value));
          if (type === 'covr' && !out.picture) out.picture = { mime: kind === 14 ? 'image/png' : 'image/jpeg', data: value.slice() };
        }
      }
      i += size;
    }
  };
  walk(0, b.length, []);
  out.artist ||= out.albumArtist;
  return out;
}

// a FLAC: its Vorbis comments and its picture block
function flac(b) {
  const out = {}, dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  for (let i = 4; i + 4 <= b.length;) {
    const last = b[i] & 0x80, type = b[i] & 0x7f, len = (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3], at = i + 4;
    if (type === 4) {
      const vendor = dv.getUint32(at, true);
      let j = at + 4 + vendor;
      const n = dv.getUint32(j, true); j += 4;
      for (let k = 0; k < n && j + 4 <= at + len; k++) {
        const l = dv.getUint32(j, true), s = new TextDecoder().decode(b.subarray(j + 4, j + 4 + l)); j += 4 + l;
        const [key, ...rest] = s.split('='), v = rest.join('=').trim(), what = { TITLE: 'title', ARTIST: 'artist', ALBUM: 'album' }[key.toUpperCase()];
        if (what) out[what] ??= v;
      }
    }
    if (type === 6 && !out.picture) {
      let j = at + 4;
      const ml = dv.getUint32(j); const mime = latin1(b.subarray(j + 4, j + 4 + ml)); j += 4 + ml;
      const dl = dv.getUint32(j); j += 4 + dl + 16;
      const pl = dv.getUint32(j); out.picture = { mime: mime || 'image/jpeg', data: b.slice(j + 4, j + 4 + pl) };
    }
    if (last) break;
    i = at + len;
  }
  return out;
}

// a file name without its ending: "Artist - Title", or just a title (a leading track number goes)
export function fromName(name) {
  const base = String(name).replace(/\.[^.]+$/, '').replace(/_/g, ' ').replace(/^\d{1,3}\s*[-.)]?\s+/, '').trim();
  const m = base.match(/^(.+?)\s+[-–]\s+(.+)$/);
  return m ? { artist: m[1].trim(), title: m[2].trim() } : { title: base };
}
// everything a file says: { title, artist, album, picture: { mime, data } or nothing }
export function readTags(bytes, name = '') {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let t = {};
  try {
    if (latin1(b.subarray(0, 4)) === 'fLaC') t = flac(b);
    else if (latin1(b.subarray(4, 8)) === 'ftyp') t = mp4(b);
    else t = id3(b);
  } catch { t = {}; }
  const named = fromName(name);
  return { title: t.title || named.title || 'Untitled', artist: t.artist || named.artist || 'Unknown artist', album: t.album || '', picture: t.picture?.data?.length ? t.picture : null };
}
