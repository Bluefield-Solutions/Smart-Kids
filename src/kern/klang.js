/* Zwei Töne: richtig und falsch.
 *
 * A2 aus dem ANTON-Abgleich, und der Grund steht dort: das ist das, was
 * ein Kind ZUERST wahrnimmt - vor dem Satz, vor der Farbe, vor dem Haken.
 *
 * Gebacken heisst hier: gerechnet, nicht geladen. Zwei Klangdateien wären
 * je nach Format 5 bis 30 KB im Startbündel, das mit 400 KB gedeckelt ist;
 * die beiden Hüllkurven hier sind zusammen unter einem Kilobyte. Und sie
 * lassen sich stimmen, ohne ein Werkzeug zu öffnen.
 *
 * DIE TÖNE SIND HIER NICHT ZU BEURTEILEN. Ein Tor kann sagen, dass einer
 * ausgelöst wurde und dass die beiden verschieden sind - ob sie gut
 * klingen, hört man auf dem iPhone. Genau deshalb steht im Abgleich
 * „Für A2: einmal Hören auf dem iPhone."
 */

/* Ein Kontext, spät angelegt.
 *
 * iOS gibt Ton erst nach einer Berührung frei, und ein Kontext, der vor
 * der ersten Berührung entsteht, bleibt „suspended" - er spielt dann für
 * den Rest der Sitzung nichts, ohne einen Fehler zu werfen. Deshalb wird
 * er beim ERSTEN Ton angelegt, und das ist immer eine Antwort, also immer
 * nach einer Berührung.
 */
let hof = null;
function kontext() {
  if (hof) return hof;
  const K = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!K) return null;
  try { hof = new K(); } catch { return null; }
  return hof;
}

/**
 * Ein Ton mit weicher Hülle.
 *
 * Ohne Ein- und Ausblenden knackt es an beiden Enden: ein Rechtecksprung
 * im Signal ist ein Klick, und der ist lauter als der Ton selbst.
 */
function ton(k, { von, bis, ab, dauer, laut, form }) {
  const o = k.createOscillator(), g = k.createGain();
  o.type = form;
  o.frequency.setValueAtTime(von, k.currentTime + ab);
  if (bis !== von)
    o.frequency.exponentialRampToValueAtTime(bis, k.currentTime + ab + dauer);
  g.gain.setValueAtTime(0.0001, k.currentTime + ab);
  g.gain.exponentialRampToValueAtTime(laut, k.currentTime + ab + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, k.currentTime + ab + dauer);
  o.connect(g); g.connect(k.destination);
  o.start(k.currentTime + ab);
  o.stop(k.currentTime + ab + dauer + 0.02);
}

/** Richtig: zwei Töne aufwärts, kurz und hell. Eine Quinte, keine Fanfare. */
export function richtig() {
  const k = kontext(); if (!k) return false;
  if (k.state === 'suspended') k.resume().catch(() => {});
  ton(k, { von: 660, bis: 660, ab: 0,    dauer: 0.10, laut: 0.20, form: 'triangle' });
  ton(k, { von: 990, bis: 990, ab: 0.09, dauer: 0.16, laut: 0.20, form: 'triangle' });
  return true;
}

/**
 * Falsch: EIN Ton, weich fallend, leiser als das Lob.
 *
 * Nicht der Summer, den man aus Quizsendungen kennt. Ein Kind, das eine
 * Aufgabe übt, macht Fehler - das ist der Zweck der Übung -, und ein
 * Geräusch, das sich wie eine Niederlage anhört, macht aus jedem Fehler
 * ein Ereignis. Deshalb tiefer, kürzer und um ein Drittel leiser.
 */
export function falsch() {
  const k = kontext(); if (!k) return false;
  if (k.state === 'suspended') k.resume().catch(() => {});
  ton(k, { von: 330, bis: 247, ab: 0, dauer: 0.22, laut: 0.13, form: 'sine' });
  return true;
}
