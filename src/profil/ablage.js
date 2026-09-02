/* Ablage. IndexedDB, ohne Zeremonie und ohne Abhaengigkeit.
 *
 * Hier stand bis Q29: „Nichts geht ins Netz. Das ist keine Einstellung,
 * sondern die Bauweise: es gibt keinen Code, der etwas hochlaedt."
 *
 * DAS STIMMT SEIT Q29 NICHT MEHR, und der Satz darf nicht stehen
 * bleiben - er waere die gefaehrlichste Sorte Kommentar: einer, dem man
 * glaubt.
 *
 * Was jetzt gilt, in drei Saetzen:
 *
 *   1. Ohne Familienschluessel geht weiter nichts ins Netz. Das ist die
 *      Voreinstellung, und der Rauchtest misst sie am ganzen Lauf: kein
 *      einziger fremder Aufruf.
 *   2. MIT Familienschluessel geht der Fortschritt an einen Dienst, den
 *      die Eltern selbst aufsetzen - zugesperrt mit einem Schluessel, der
 *      das Geraet nie verlaesst. Wer das Lager des Dienstes kopiert, hat
 *      Zufallsrauschen (`src/kern/gleichlauf.js`, Tor `gleichlauf`).
 *   3. Die PIN, die Stimme und alle anderen Geraeteeinstellungen reisen
 *      NICHT mit. Was reist, steht in `REIST` und nirgends sonst.
 *
 * K3 13.3 ist damit nicht gebrochen, sondern verschoben: es geht etwas
 * ins Netz, und niemand dort kann es lesen.
 */
const DB = 'lernkiste', FASSUNG = 1;
const LAEDEN = ['profile', 'fortschritt', 'protokoll', 'einstellungen'];

let db = null;
function oeffnen() {
  if (db) return db;
  db = new Promise((ja, nein) => {
    if (!('indexedDB' in globalThis)) return nein(new Error('kein IndexedDB'));
    const a = indexedDB.open(DB, FASSUNG);
    a.onupgradeneeded = () => {
      for (const l of LAEDEN)
        if (!a.result.objectStoreNames.contains(l)) a.result.createObjectStore(l);
    };
    a.onsuccess = () => ja(a.result);
    a.onerror = () => nein(a.error);
  });
  return db;
}

async function tun(laden, art, fn) {
  const d = await oeffnen();
  return new Promise((ja, nein) => {
    const t = d.transaction(laden, art);
    const s = t.objectStore(laden);
    const a = fn(s);
    t.oncomplete = () => ja(a && 'result' in a ? a.result : undefined);
    t.onerror = () => nein(t.error);
  });
}

export const hole   = (laden, k) => tun(laden, 'readonly',  s => s.get(k));
export const setze  = (laden, k, w) => tun(laden, 'readwrite', s => s.put(w, k));
export const loesche= (laden, k) => tun(laden, 'readwrite', s => s.delete(k));
export const alles  = (laden) => tun(laden, 'readonly', s => s.getAll());
/* Alles MIT den Schluesseln - fuer den Gleichlauf (Q29).
 *
 * `alles` gibt nur die Werte. Beim Zusammenfuehren zweier Geraete braucht
 * es aber gerade die Schluessel: unter `fiona:kontinente` steht Fionas
 * Stand, unter `lea:kontinente` Leas, und wer sie ohne Namen einsammelt,
 * kann sie nicht wieder auseinandersortieren.
 *
 * Zwei Aufrufe in einer Transaktion, nicht einer je Schluessel: bei
 * dreissig Ebenen mal vier Profilen waeren das hundertzwanzig
 * Transaktionen fuer eine Liste. */
export async function alleMitSchluessel(laden) {
  const d = await oeffnen();
  return new Promise((ja, nein) => {
    const t = d.transaction(laden, 'readonly'), s = t.objectStore(laden);
    const k = s.getAllKeys(), w = s.getAll();
    t.oncomplete = () => ja(k.result.map((n, i) => [n, w.result[i]]));
    t.onerror = () => nein(t.error);
  });
}
export const leeren = (laden) => tun(laden, 'readwrite', s => s.clear());

/** Anhaengen an eine Liste. Fuer das Protokoll: nur schreiben, nie aendern. */
export async function anhaengen(laden, eintrag) {
  const d = await oeffnen();
  return new Promise((ja, nein) => {
    const t = d.transaction(laden, 'readwrite');
    t.objectStore(laden).put(eintrag, `${eintrag.zeit}-${Math.random().toString(36).slice(2,8)}`);
    t.oncomplete = ja; t.onerror = () => nein(t.error);
  });
}

/**
 * Befund L6: ohne diese Anforderung gilt der Speicher als "best effort" und
 * darf vom System geraeumt werden. Ein Aufruf, eine Zeile.
 *
 * Sie kann abgelehnt werden - deshalb wird das Ergebnis GEMERKT und im
 * Elternbereich angezeigt, statt es zu behaupten.
 */
export async function dauerhaft() {
  try {
    if (!navigator.storage || !navigator.storage.persist) return { moeglich:false };
    const schon = await navigator.storage.persisted();
    const gewaehrt = schon || await navigator.storage.persist();
    let platz = null;
    if (navigator.storage.estimate) {
      const e = await navigator.storage.estimate();
      platz = { benutzt: e.usage, frei: e.quota };
    }
    return { moeglich:true, gewaehrt, platz };
  } catch (e) { return { moeglich:false, fehler:String(e) }; }
}

/** Alles zu einem Profil loeschen. Unwiderruflich, ein Tipp. */
export async function profilLoeschen(profilId) {
  const d = await oeffnen();
  for (const laden of ['fortschritt', 'protokoll']) {
    const schluessel = await tun(laden, 'readonly', s => s.getAllKeys());
    const werte = await alles(laden);
    await tun(laden, 'readwrite', s => {
      werte.forEach((w, i) => { if (w && w.profil === profilId) s.delete(schluessel[i]); });
    });
  }
  await loesche('profile', profilId);
}
