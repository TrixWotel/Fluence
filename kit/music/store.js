// Songs and covers kept on this device once they've been downloaded (or uploaded from here), by their git sha, so they
// play again at once and without the internet. If the browser won't keep them (private windows), everything still
// works: songs just come from GitHub each time.
let opening = null;
function db() {
  opening ??= new Promise((done) => {
    try {
      const r = indexedDB.open('fluence-music', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('files');
      r.onsuccess = () => done(r.result);
      r.onerror = () => done(null);
    } catch { done(null); }
  });
  return opening;
}
const ask = async (mode, fn) => {
  const d = await db();
  if (!d) return null;
  return new Promise((done) => {
    try {
      const tx = d.transaction('files', mode), r = fn(tx.objectStore('files'));
      tx.oncomplete = () => done(r?.result ?? true);
      tx.onerror = tx.onabort = () => done(null);
    } catch { done(null); }
  });
};
export const get = (sha) => (sha ? ask('readonly', (s) => s.get(sha)) : Promise.resolve(null));
export const put = (sha, blob) => ask('readwrite', (s) => s.put(blob, sha));
export const drop = (sha) => ask('readwrite', (s) => s.delete(sha));
export const keys = async () => (await ask('readonly', (s) => s.getAllKeys())) || [];
export const clear = () => ask('readwrite', (s) => s.clear());
// how much is kept here, in bytes
export async function size() {
  const d = await db();
  if (!d) return 0;
  return new Promise((done) => {
    let total = 0;
    try {
      const r = d.transaction('files').objectStore('files').openCursor();
      r.onsuccess = () => { const c = r.result; if (!c) return done(total); total += c.value?.size || 0; c.continue(); };
      r.onerror = () => done(total);
    } catch { done(0); }
  });
}
