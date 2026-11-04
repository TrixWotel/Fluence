// The same song twice. Two songs are one song when they're the same file, or have the same title by the same artist once
// what doesn't change the song is set aside: capitals, accents and punctuation, "(Official Video)", "feat. Someone", the
// artist's name in front of the title. "(Remix)", "(Live)" and the like stay apart, as their titles differ. A song with
// no artist, or a title many songs share ("Intro"), needs the same length too. Nothing here touches the page, so it can
// be tried outside a browser.
const plain = (t) => { const s = String(t).normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase(); return s.replace(/[^\p{L}\p{N}]+/gu, '') || s.trim(); };
const mainArtist = (a) => plain(String(a).split(/\s+(?:feat\.?|ft\.?|featuring|with|and|x|vs\.?)\s+|\s*[&,;/+×]\s*/i).find((x) => x.trim()) ?? a);
const EXTRA = /^(?:(?:official|music|lyrics?|audio|video|visuali[sz]er|hd|hq|4k|mv)\s*)+$|^(?:feat\.?|ft\.?|featuring|with)\s/i;
function titleKey(s) {
  const t = String(s.title).normalize('NFKC')
    .replace(/\s*[([【]([^)\]】]*)[)\]】]/g, (all, inner) => (EXTRA.test(inner.trim()) ? '' : all))
    .replace(/\s+(?:feat\.?|ft\.?|featuring)\s.*$|\s+official\s+(?:music\s+)?(?:video|audio)$/i, '');
  const [a, b, more] = t.split(/\s+[-–—]\s+/), who = mainArtist(s.artist);
  return plain(b == null || more != null ? t : mainArtist(a) === who ? b : mainArtist(b) === who ? a : t);
}
const NO_ARTIST = plain('Unknown artist'), COMMON = /^(?:intro|outro|interlude|skit|prelude|untitled|track\d*|\d+)$/;
const keyOf = (s) => ({ sha: s.sha, title: titleKey(s), artist: mainArtist(s.artist), secs: s.duration || 0 });
function same(a, b) {
  if (a.sha && a.sha === b.sha) return true;
  if (a.title !== b.title) return false;
  if (a.artist === NO_ARTIST || b.artist === NO_ARTIST || COMMON.test(a.title)) return !!a.secs && !!b.secs && Math.abs(a.secs - b.secs) <= 3 && (a.artist === b.artist || a.artist === NO_ARTIST || b.artist === NO_ARTIST);
  return a.artist === b.artist;
}
// the song in a list that this one is another copy of, if there is one
export const copyOf = (list, s) => { const k = keyOf(s); return list.find((x) => same(keyOf(x), k)); };
// takes the extra copies out of a library, in place. The biggest file of each song stays (the first added, if they're the
// same size), with the likes, playlists, album and cover of the others. Gives [[id that went, id that stayed]] and the
// files to take away.
export function removeCopies(index) {
  const kept = [], pairs = [], files = [];
  for (const s of [...index.songs].sort((a, b) => (b.size || 0) - (a.size || 0) || (a.added || 0) - (b.added || 0))) {
    const k = keyOf(s), twin = kept.find((x) => same(x.k, k));
    if (!twin) { kept.push({ s, k }); continue; }
    const t = twin.s;
    t.liked ||= s.liked; t.album ||= s.album;
    if (mainArtist(t.artist) === NO_ARTIST) t.artist = s.artist;
    if (s.cover && !t.cover) { t.cover = s.cover; t.coverSha = s.coverSha; } else if (s.cover) files.push(s.cover);
    files.push(s.path);
    pairs.push([s.id, t.id]);
  }
  if (!pairs.length) return { pairs, remove: [] };
  const to = new Map(pairs);
  index.songs = index.songs.filter((s) => !to.has(s.id));
  for (const p of index.playlists) p.songs = [...new Set(p.songs.map((id) => to.get(id) || id))];
  const used = new Set(index.songs.flatMap((s) => [s.path, s.cover]));
  return { pairs, remove: files.filter((f) => !used.has(f)) };
}
